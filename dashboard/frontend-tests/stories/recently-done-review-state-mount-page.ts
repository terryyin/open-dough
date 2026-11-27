// Three done stories of Open Dough's published done catalog on the mounted
// Board, with each project's review states kept in a case-owned store and done
// record bodies a case may hold or fail, and a done card's Story actions as
// the review state cases operate them.
import type { Locator } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { minutesAgo } from "../../../Distribution/tests/support/testDataDefaults.mjs";
import type { MachineAnswer } from "../../src/agentLaunch.ts";
import type { DoneRecordReadSource } from "../../src/doneRecordReadSource.ts";
import type { StoryReviewStatesReadSource } from "../../src/storyReviewStatesReadSource.ts";
import { mountBoardFrame } from "../navigation/board-frame-mount.ts";
import { boardWork } from "../navigation/board-work.ts";
import { doneCard } from "../sessions/recently-done-column-page.ts";

export const storyA = { identity: "SEED-501#review-a", title: "Review A" };
export const storyB = { identity: "SEED-502#review-b", title: "Review B" };
export const storyC = { identity: "SEED-503#review-c", title: "Review C" };
export const doneStories = [storyA, storyB, storyC];

// Each project's review states as the machine's local records keep them,
// from the stories `reviewed` lists (marked now, unless a case gives their
// `reviewedAt`), with every change saved in order and marked at the clock.
export function reviewStateStore(
  reviewed: Record<string, string[]> = {},
  markedAt: Record<string, string> = {},
) {
  const now = () => new Date().toISOString();
  const saved = new Map(
    Object.entries(reviewed).map(([project, ids]) => [
      project,
      new Map(ids.map((id) => [id, markedAt[id] ?? now()])),
    ]),
  );
  const changes: string[] = [];
  const of = (project: string) => {
    const stories = saved.get(project) ?? new Map<string, string>();
    saved.set(project, stories);
    return stories;
  };
  const read: StoryReviewStatesReadSource = (project, change) => {
    const stories = of(project);
    if (change !== undefined) {
      changes.push(`${project} ${change.identity} ${String(change.reviewed)}`);
      if (change.reviewed) stories.set(change.identity, now());
      else stories.delete(change.identity);
    }
    return Promise.resolve(new Map(stories));
  };
  return {
    read,
    changes,
    reviewed: (project: string) => [...of(project).keys()],
  };
}

// A session of `story` Done `doneAgo` minutes ago.
export const doneSessionOf = (
  story: { identity: string; title: string },
  sessionId: string,
  doneAgo: number,
) =>
  makeMe.aLaunchRecord
    .executing(story)
    .inClaudeSession({ sessionId })
    .launchedAt(minutesAgo(doneAgo + 1))
    .markedDoneAt(minutesAgo(doneAgo))
    .please();

export function reviewBoard({
  answer,
  viewport = { width: 1280, height: 900 },
  markedAt = {},
}: {
  answer?: MachineAnswer;
  viewport?: { width: number; height: number };
  // Open Dough stories already marked reviewed, at each one's `reviewedAt`.
  markedAt?: Record<string, string>;
} = {}) {
  const { done, doneReads } = makeMe.aDoneCatalog
    .holding(
      doneStories.map((story, index) =>
        makeMe.aDoneRecord
          .completed({ ...story, completedAt: minutesAgo(10 + index * 10) })
          .please(),
      ),
    )
    .please();
  const fileOf = (story: typeof storyA) =>
    done.records.find((record) => record.identity === story.identity)
      ?.fileName ?? "";
  const heldBodies = new Map<string, Promise<void>>();
  const failedBodies = new Set<string>();
  const bodies: DoneRecordReadSource = {
    readBodies: async (project, revision, files, signal) => {
      for (const file of files) {
        await heldBodies.get(file);
        if (failedBodies.has(file))
          throw new Error("GitHub did not answer the Done body read.");
      }
      return doneReads.readBodies(project, revision, files, signal);
    },
  };
  const reviewStates = reviewStateStore(
    { "open-dough": Object.keys(markedAt) },
    markedAt,
  );
  const work = boardWork([], { done });
  return {
    reviewed: (project = "open-dough") => reviewStates.reviewed(project),
    changes: reviewStates.changes,
    holdBody: (story: typeof storyA) => {
      let release = () => {};
      heldBodies.set(
        fileOf(story),
        new Promise((resolve) => {
          release = resolve;
        }),
      );
      return () => {
        heldBodies.delete(fileOf(story));
        release();
      };
    },
    failBody: (story: typeof storyA) => failedBodies.add(fileOf(story)),
    mount: () =>
      mountBoardFrame(
        { ...work, done: { ...done, revision: work.revision } },
        viewport,
        "stories",
        answer === undefined ? {} : { answer },
        { done: bodies, reviewStates: reviewStates.read },
      ),
  };
}

// A done card's Story actions, by its title or, while unread, its identity.
export function reviewCard(name: string) {
  const article = doneCard(name);
  const actions = article.getByRole("group", { name: "Story actions" });
  const question = actions.getByRole("group", {
    name: "Unreview this story?",
    exact: true,
  });
  return {
    article,
    actions,
    markAsReviewed: actions.getByRole("button", {
      name: "Mark as reviewed",
      exact: true,
    }),
    reviewedButton: actions.getByRole("button", {
      name: "Reviewed",
      exact: true,
    }),
    partiallyReviewed: actions.getByText("Partially reviewed", {
      exact: true,
    }),
    question,
    cancel: question.getByRole("button", { name: "Cancel", exact: true }),
    confirm: question.getByRole("button", { name: "Unreview", exact: true }),
  };
}

export const isSelected = (card: Locator) =>
  card.element().classList.contains("story-card-selected");
