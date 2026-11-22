// The stories whose comparison a mounted Intent view
// (./intent-ci-page-mount.ts) offers in its Compare group, each
// selected with the case's own Review changes answers; reads a case leaves
// unanswered stay pending. Story A is Taken in a worktree on this machine, so
// Review changes offers its comparison; Story B has none. The Done story's
// worktree is retired: its review is its published completion or a captured
// landed run.
import { expect } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentCiReadSource } from "../../src/intentCiReadSource.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import type { ReviewSource } from "../../src/reviewSource.ts";
import { unanswered } from "../../test-support/support/waitUntil.ts";
import { recordOutsideCalls } from "./intent-outside-calls.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import { scopeReadsOf } from "./intent-ci-scope-page.tsx";
import {
  fullSha,
  inertCiReads,
  openDoughSource,
} from "./intent-ci-status-fixtures.ts";

// The case's Review changes answers; it answers the story's review at least.
type ReviewAnswers = Pick<ReviewSource, "review"> & Partial<ReviewSource>;

const answering = (answers: ReviewAnswers): ReviewSource => ({
  range: unanswered,
  fileDiff: unanswered,
  fileText: unanswered,
  ...answers,
});

const storyA = {
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
export async function openStoryAComparison(review: ReviewAnswers) {
  const mounted = await mountIntentCiPage({
    work: makeMe.aPublishedWork
      .of(openDoughSource)
      .at(fullSha("a1a1a1a"))
      .retrievedAt(new Date("2026-11-01T00:00:00Z"))
      .taking(storyA)
      .taking(storyB)
      .please(),
    reads: {
      intent: intentReads,
      ci: inertCiReads(),
      review: answering(review),
    },
    machine: makeMe.aMachineAnswer
      .holdingWorkspaces({
        source: openDoughSource.id,
        identity: storyA.identity,
        agent: "claude",
        workspace: "/tmp/intent-story",
        branch: storyA.branch,
      })
      .please(),
  });
  await mounted.selectStory(storyA.identity, storyA.title);
  return {
    ...mounted,
    selectStoryB: () => mounted.selectStory(storyB.identity, storyB.title),
    selectStoryA: () => mounted.selectStory(storyA.identity, storyA.title),
  };
}

// A completed story in the Summary scope, catalogued in the work's done
// records, whose CI comparison measures its landed result.
const doneStory = makeMe.aComparedStory.inSummaryScope().please();
const doneTitle = "Story A";
export const doneCompletion = doneStory.work.revision;
export const doneIdentity = doneStory.identity;
// The published completion Review changes answers by default.
export const publishedCompletion = () =>
  makeMe.aStoryReview
    .published(doneCompletion)
    .adding("dashboard/tests/folder/a.spec.ts")
    .please();

// Intent with the Done story selected, its review read from `review` and its
// collected CI wall time from `readDoneWallTimeHistory` (pending unless
// given): the revision each Intent locations read names, in order, the
// comparison and proof reads the CI comparison asked, and the global fetch
// and WebSocket calls made from the mount on.
export async function openDoneStoryComparison(
  review: ReviewAnswers,
  readDoneWallTimeHistory: IntentCiReadSource["readDoneWallTimeHistory"] = unanswered,
) {
  const opened = recordOutsideCalls();
  const ci = scopeReadsOf(doneStory);
  const locationRevisions: string[] = [];
  let selected = false;
  const { done, doneReads } = makeMe.aDoneCatalog
    .holding([
      makeMe.aDoneRecord
        .completed({
          identity: doneStory.identity,
          title: doneTitle,
          completedAt: "2026-11-01T00:00:00.000Z",
        })
        .please(),
    ])
    .please();
  const mounted = await mountIntentCiPage({
    work: makeMe.aPublishedWork
      .with({
        source: doneStory.source,
        revision: fullSha("a1a1a1a"),
        retrievedAt: new Date("2026-11-02T00:00:00Z"),
        direction: "",
        taken: [],
        backlog: [],
        done,
      })
      .please(),
    reads: {
      intent: {
        readLocations: (...[, revision]) => {
          if (selected) locationRevisions.push(revision);
          return Promise.resolve({
            status: "configured",
            locations: [...(doneStory.scope?.locations ?? [])],
          });
        },
        readFile: (...[, , path]) => Promise.resolve(`${path}\n`),
        readCandidates: () => Promise.resolve({ status: "absent" }),
      },
      ci: {
        ...ci.source,
        readDoneWallTimeHistory,
        readScopeHistory: unanswered,
      },
      review: answering(review),
      done: doneReads,
    },
  });
  // Intent shows trunk's locations before any story is selected; only the
  // selected Done story's reads are recorded.
  await expect
    .poll(() => document.querySelector("button.intent-location-name"))
    .not.toBeNull();
  selected = true;
  await mounted.selectStory(doneStory.identity, doneTitle);
  return {
    locationRevisions,
    comparisonReads: ci.asked,
    outsideCalls: () => opened,
  };
}
