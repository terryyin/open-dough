// The stories whose comparison a mounted Intent view
// (./intent-ci-page-mount.ts) offers in its Compare group, each
// selected with the case's own Review changes answers; reads a case leaves
// unanswered stay pending. Story A is Taken in a worktree on this machine, so
// Review changes offers its comparison; Story B has none. The Done story's
// worktree is retired: its review is its published completion or a captured
// landed run.
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentCiReadSource } from "../../src/intentCiReadSource.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import type { PageReads } from "../../src/pageReads.tsx";
import type { ReviewSource } from "../../src/reviewSource.ts";
import { unanswered } from "../../test-support/support/waitUntil.ts";
import { recordOutsideCalls } from "./intent-outside-calls.ts";
import { mountStoryIntent } from "./intent-story-perspective.tsx";
import { scopeReadsOf } from "./intent-ci-scope-page.tsx";
import {
  fullSha,
  inertCiReads,
  openDoughSource,
} from "./intent-ci-status-fixtures.ts";

// The case's Review changes answers; it answers the story's review at least.
type ReviewAnswers = Pick<ReviewSource, "review"> & Partial<ReviewSource>;

const answering = (answers: ReviewAnswers): ReviewSource => ({
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
const intentReads: IntentReadSource = makeMe.anIntentReadSource
  .reading({
    readLocations: () =>
      Promise.resolve({ status: "configured", locations: [location] }),
    readFile: (...[, path]) => Promise.resolve(sourceOf(path)),
    readCandidates: () => Promise.resolve({ status: "absent" }),
  })
  .please();

// Intent with Story A selected and Files docked, its review read from
// `review`.
export async function openStoryAComparison(
  review: ReviewAnswers,
  ci: Partial<IntentCiReadSource> = {},
) {
  const mounted = await mountStoryIntent({
    identity: storyA.identity,
    work: makeMe.aPublishedWork
      .of(openDoughSource)
      .at(fullSha("a1a1a1a"))
      .retrievedAt(new Date("2026-11-01T00:00:00Z"))
      .taking(storyA)
      .taking(storyB)
      .please(),
    reads: {
      intent: intentReads,
      ci: { ...inertCiReads(), ...ci },
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
  return {
    ...mounted,
    selectStoryB: () => mounted.selectStory(storyB.identity),
    selectStoryA: () => mounted.selectStory(storyA.identity),
  };
}

// A completed story in the Summary scope, catalogued in the work's done
// records, whose CI comparison measures its landed result.
const doneStory = makeMe.aComparedStory.inSummaryScope().please();
const doneTitle = "Story A";
export const doneCompletion = doneStory.work.revision;
export const doneSource = doneStory.source;
export const doneIdentity = doneStory.identity;
// The Done story's own CI comparison answer.
export const doneComparison = doneStory.answer;
// The Done comparison's own figures for dashboard/tests in its Summary:
// Counts, Baseline, Branch, Landed and Parts.
export const doneEntryOwnFigures = [
  "4 → 6 test cases (+2) → 5 test cases (+1)",
  "12.0 s",
  "+9.5 s",
  "+6.5 s",
  "1 of 1 part present",
];
// The Done comparison's rows in the dashboard/tests Summary's table: each
// child's Change, Counts, Baseline, Branch and Landed.
export const doneEntryComparisonRows = [
  [
    "folder/",
    "",
    "2 → 3 test cases (+1) → 2 test cases (0)",
    "10.3 s",
    "+7.1 s",
    "+4.1 s",
  ],
  ["added.spec.ts", "", "added → 1 test case", "added", "800 ms", "800 ms"],
  ["renamed.spec.ts", "", "added → 1 test case", "added", "2.1 s", "2.1 s"],
  ["root.spec.ts", "", "1 test case (no change)", "1.2 s", "0 ms", "0 ms"],
];
// The published completion Review changes answers by default.
export const publishedCompletion = () =>
  makeMe.aStoryReview
    .published(doneCompletion)
    .adding("dashboard/tests/folder/a.spec.ts")
    .please();

// Intent with the Done story selected and Files docked unless `viewport` says
// otherwise, its review read from `review` and its
// CI reads from `ci` (its own comparison and proof unless given, every other
// collected read pending): the revision each Intent locations read names, in
// order, the proof reads the CI comparison asked, and the global fetch and
// WebSocket calls made from the mount on.
export async function openDoneStoryComparison({
  ci = {},
  otherDone,
  readFile = (...[, , revision]) => Promise.resolve(`${revision}\n`),
  viewport,
  storyResult,
  ...review
}: ReviewAnswers & {
  readonly ci?: Partial<IntentCiReadSource>;
  readonly storyResult?: PageReads["storyResult"];
  readonly otherDone?: { readonly identity: string; readonly title: string };
  readonly readFile?: IntentReadSource["readFile"];
  readonly viewport?: { readonly width: number; readonly height: number };
}) {
  const opened = recordOutsideCalls();
  const scope = scopeReadsOf(doneStory);
  const locationRevisions: string[] = [];
  const stories = [{ identity: doneStory.identity, title: doneTitle }];
  if (otherDone !== undefined) stories.push(otherDone);
  const records = stories.map((story) =>
    makeMe.aDoneRecord
      .completed({ ...story, completedAt: "2026-11-01T00:00:00.000Z" })
      .please(),
  );
  const { done, doneReads } = makeMe.aDoneCatalog.holding(records).please();
  const mounted = await mountStoryIntent({
    identity: doneStory.identity,
    viewport,
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
      intent: makeMe.anIntentReadSource
        .reading({
          readLocations: (...[, revision]) => {
            locationRevisions.push(revision);
            return Promise.resolve({
              status: "configured",
              locations: [...(doneStory.scope?.locations ?? [])],
            });
          },
          readFile,
          readCandidates: () => Promise.resolve({ status: "absent" }),
        })
        .please(),
      ci: {
        ...scope.source,
        readDoneWallTimeHistory: unanswered,
        readScopeHistory: unanswered,
        ...ci,
      },
      review: answering(review),
      ...(storyResult === undefined ? {} : { storyResult }),
      done: doneReads,
    },
  });
  return {
    ...mounted,
    selectDoneStory: () => mounted.selectStory(doneStory.identity),
    locationRevisions,
    proofReads: scope.asked.proofs,
    outsideCalls: () => opened,
  };
}
