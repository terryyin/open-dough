import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { ReviewSource } from "../../src/reviewSource.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import {
  inertCiReads,
  judgedStatus,
  openDoughSource,
} from "./intent-ci-status-fixtures.ts";
import { intentReadsPublishing } from "./intent-revision-fixtures.ts";

const storyA = {
  identity: "SEED-A#a",
  title: "Story A",
  branch: "claude/story-a",
};
export const storyB = makeMe.aWorkEntry
  .with({ identity: "SEED-B#b", title: "Story B" })
  .please();
const queuedA = makeMe.aWorkEntry
  .with({ identity: storyA.identity, title: storyA.title })
  .please();

export const initialRevision = "a1".repeat(20);
export const modifiedPath = "dashboard/tests/a.spec.ts";
export const keptPath = "dashboard/tests/boundary/kept.spec.ts";
export const otherPath = "dashboard/tests/other/c.spec.ts";
export const productPath = "dashboard/src/App.tsx";
export const changed = {
  modified: "Modified dashboard/tests/a.spec.ts",
  added: "Added dashboard/tests/boundary/b.spec.ts",
  deleted: "Deleted dashboard/tests/gone.spec.ts",
  into: "Renamed scripts/arriving.spec.ts → dashboard/tests/arriving/arriving.spec.ts",
  outOf:
    "Renamed dashboard/tests/out/leaving.spec.ts → scripts/leaving.spec.ts",
  product: "Modified dashboard/src/App.tsx",
  notes: "Renamed docs/notes.md → docs/renamed-notes.md",
};

export const storyChanges = () =>
  makeMe.aStoryReview
    .modifying(modifiedPath)
    .adding("dashboard/tests/boundary/b.spec.ts")
    .deleting("dashboard/tests/gone.spec.ts")
    .renaming("dashboard/tests/between/moved.spec.ts", "tests/moved.sh")
    .renaming(
      "scripts/arriving.spec.ts",
      "dashboard/tests/arriving/arriving.spec.ts",
    )
    .renaming("dashboard/tests/out/leaving.spec.ts", "scripts/leaving.spec.ts")
    .modifying(productPath)
    .renaming("docs/notes.md", "docs/renamed-notes.md")
    .please();

const publishedText = "a 11\n";
const configured = () =>
  makeMe.anIntentLocationsAnswer
    .locating(
      makeMe.anIntentLocation
        .at("dashboard/tests")
        .ofKind("typescript", ["**/*.spec.ts"])
        .selecting(
          modifiedPath,
          keptPath,
          otherPath,
          "dashboard/tests/gone.spec.ts",
          "dashboard/tests/between/moved.spec.ts",
          "dashboard/tests/out/leaving.spec.ts",
        )
        .please(),
      makeMe.anIntentLocation
        .at("tests")
        .ofKind("shell", ["*.sh"])
        .selecting("tests/check.sh")
        .please(),
    )
    .please();

const workAt = (revision: string, hasWorkspace: boolean) => {
  const work = makeMe.aPublishedWork.of(openDoughSource).at(revision);
  return makeMe.aPublishedWork
    .with({
      ...(hasWorkspace ? work.taking(storyA) : work).please(),
      backlog: hasWorkspace ? [storyB] : [queuedA, storyB],
    })
    .please();
};

export async function openStoryChanges({
  hasWorkspace = true,
  hasLocations = true,
  review: readReview = () => Promise.resolve(storyChanges()),
}: {
  readonly hasWorkspace?: boolean;
  readonly hasLocations?: boolean;
  readonly review?: ReviewSource["review"];
} = {}) {
  const revision = hasLocations ? initialRevision : "b2".repeat(20);
  const locations = hasLocations
    ? configured()
    : makeMe.anIntentLocationsAnswer.notConfigured().please();
  const intent = intentReadsPublishing(locations, {
    [modifiedPath]: publishedText,
  });
  const locationRevisions: string[] = [];
  const reads = {
    published: [] as string[],
    diffs: [] as string[],
    texts: [] as string[],
  };
  const review = pageReadsSupplying({}).review;
  const mounted = await mountIntentCiPage({
    work: workAt(revision, hasWorkspace),
    machine: hasWorkspace
      ? makeMe.aMachineAnswer
          .holdingWorkspaces({
            source: openDoughSource.id,
            identity: storyA.identity,
            agent: "claude",
            workspace: "/tmp/intent-story",
            branch: storyA.branch,
          })
          .please()
      : makeMe.aMachineAnswer.please(),
    reads: {
      intent: {
        ...intent,
        readLocations: (...asked) => {
          locationRevisions.push(asked[1]);
          return intent.readLocations(...asked);
        },
        readFile: (...asked) => {
          reads.published.push(asked[1]);
          return intent.readFile(...asked);
        },
      },
      ci: inertCiReads({
        readStatus: (...[, branch]) =>
          Promise.resolve(
            judgedStatus(branch, "pass", revision, "Published tests"),
          ),
      }),
      review: {
        ...review,
        review: readReview,
        fileDiff: (query) => {
          reads.diffs.push(query.path ?? "");
          return Promise.resolve(
            makeMe.aReviewedFileDiff.adding(modifiedPath, "more").please(),
          );
        },
        fileText: (query) => {
          reads.texts.push(query.path ?? "");
          return Promise.resolve({
            kind: "text",
            baseline: publishedText,
            tree: `${publishedText}more\n`,
          });
        },
      },
    },
  });
  const selectStoryA = () => mounted.selectStory(storyA.identity, storyA.title);
  await selectStoryA();
  return {
    ...mounted,
    selectStoryA,
    refreshWork: (revision: string) =>
      mounted.showWork(workAt(revision, hasWorkspace)),
    reads,
    locationRevisions,
  };
}
