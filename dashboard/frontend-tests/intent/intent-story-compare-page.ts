// The selected story in a mounted Intent view
// (./intent-ci-perspective-mount.ts) as a reader meets its comparison: the
// header's revisions line and its Compare group (the comparison choice, the
// story's commits, the uncommitted check, Refresh and the range read), the
// story's views, the Changes file list and the selected file's diff. Story A
// is Taken in a worktree on this machine, so Review changes offers its
// comparison; Story B has none.
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import type { ReviewSource } from "../../src/reviewSource.ts";
import { mountIntentPerspective } from "./intent-ci-perspective-mount.ts";
import {
  fullSha,
  inertCiReads,
  openDoughSource,
  takenStoryEntry,
} from "./intent-ci-status-fixtures.ts";

export const storyA = {
  identity: "SEED-1#story-a",
  title: "Story A",
  branch: "claude/story-a",
};
const storyB = {
  identity: "SEED-1#story-b",
  title: "Story B",
  branch: "claude/story-b",
};

// Trunk's Intent location for the story's specs, and each file's source as
// Intent reads it today: twelve numbered lines of its name.
const location = makeMe.anIntentLocation
  .at("dashboard/tests")
  .ofKind("typescript", ["**/*.spec.ts"])
  .selecting(
    "dashboard/tests/a.spec.ts",
    "dashboard/tests/gone.spec.ts",
    "dashboard/tests/boundary/kept.spec.ts",
    "dashboard/tests/landing.spec.ts",
  )
  .please();
const sourceOf = (path: string) => {
  const word = path.split("/").at(-1)?.replace(".spec.ts", "") ?? "";
  return [...Array(12).keys()].map((line) => `${word} ${line}\n`).join("");
};
const intentReads: IntentReadSource = {
  readLocations: () =>
    Promise.resolve({ status: "configured", locations: [location] }),
  readFile: (...[, path]) => Promise.resolve(sourceOf(path)),
  readCandidates: () => Promise.resolve({ status: "absent" }),
};

// Intent with Story A selected, its review read from `review`.
export async function openStoryAComparison(review: ReviewSource) {
  const mounted = await mountIntentPerspective({
    work: makeMe.aPublishedWork
      .with({
        source: openDoughSource,
        revision: fullSha("a1a1a1a"),
        retrievedAt: new Date("2026-11-01T00:00:00Z"),
        direction: "",
        taken: [takenStoryEntry(storyA), takenStoryEntry(storyB)],
        backlog: [],
      })
      .please(),
    readSource: intentReads,
    ciReads: inertCiReads(),
    reviewSource: review,
    workspaces: [
      {
        source: openDoughSource.id,
        identity: storyA.identity,
        agent: "claude",
        workspace: "/tmp/intent-story",
        branch: storyA.branch,
      },
    ],
  });
  await mounted.selectStory(storyA.identity);
  return {
    ...mounted,
    selectStoryB: () => mounted.selectStory(storyB.identity),
    selectStoryA: () => mounted.selectStory(storyA.identity),
  };
}

const escaped = (name: string) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const textOf = (element: Element | null | undefined) =>
  element?.textContent ?? "";

export function intentStoryCompare() {
  const intent = page.getByRole("main", { name: "Intent", exact: true });
  const header = intent.getByRole("region", {
    name: "Selected story",
    exact: true,
  });
  const compare = header.getByRole("group", { name: "Compare" });
  const commits = compare.getByRole("list", { name: "Story commits" });
  const commit = (subject: string) =>
    commits.getByRole("button").filter({ hasText: subject });
  const purpose = intent.getByRole("region", { name: "Purpose", exact: true });
  return {
    header,
    // The header's leading control, which a collapsible header would offer.
    collapsedControl: header.getByRole("button", { expanded: false }),
    revisions: () =>
      textOf(header.element().querySelector(".intent-story-revisions")),
    choice: (name: string) => compare.getByRole("radio", { name }),
    choose: (name: string) =>
      userEvent.click(compare.getByRole("radio", { name })),
    includeUncommitted: compare.getByRole("checkbox", {
      name: "Include uncommitted changes",
    }),
    refresh: () =>
      userEvent.click(compare.getByRole("button", { name: "Refresh" })),
    commits,
    commit,
    // Chooses `subject` as both ends of the range.
    async chooseAlone(subject: string) {
      await userEvent.click(commit(subject));
      await userEvent.click(commit(subject));
    },
    range: () =>
      textOf(header.element().querySelector(".story-review-range-heading")),
    chooseTab: (name: "Changes" | "CI comparison") =>
      userEvent.click(
        intent
          .getByRole("tablist", { name: "Selected story views" })
          .getByRole("tab", { name, exact: true }),
      ),
    // A listed file's control, named by its kind and path.
    file: (name: string) =>
      intent.getByRole("button", {
        name: new RegExp(`^${escaped(name)}(?:,|$)`),
      }),
    purposeText: () => textOf(purpose.element()),
    diffName: () =>
      textOf(
        purpose.element().querySelector(".story-review-diff-heading h3"),
      ).trim(),
    diffCode: () =>
      textOf(purpose.element().querySelector(".story-review-code")),
  };
}
