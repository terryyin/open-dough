import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { MachineAnswer } from "../../src/agentLaunch.ts";
import type { IntentLocations } from "../../src/authenticatedIntentRead.ts";
import type { PageReads } from "../../src/pageReads.tsx";
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

const workAt = (revision: string, hasWorkspace: boolean, title: string) => {
  const work = makeMe.aPublishedWork.of(openDoughSource).at(revision);
  const story = { ...storyA, title };
  return makeMe.aPublishedWork
    .with({
      ...(hasWorkspace ? work.taking(story) : work).please(),
      backlog: hasWorkspace
        ? [storyB]
        : [
            makeMe.aWorkEntry
              .with({ identity: story.identity, title })
              .please(),
            storyB,
          ],
    })
    .please();
};

export async function openStoryChanges({
  hasWorkspace = true,
  hasLocations = true,
  locationAnswer,
  revision = hasLocations ? initialRevision : "b2".repeat(20),
  title = storyA.title,
  review: readReview = () => Promise.resolve(storyChanges()),
  fileDiff = () =>
    Promise.resolve(
      makeMe.aReviewedFileDiff.adding(modifiedPath, "more").please(),
    ),
  fileText = () =>
    Promise.resolve({
      kind: "text",
      baseline: publishedText,
      tree: `${publishedText}more\n`,
    }),
  storyNotes,
  machine,
}: {
  readonly hasWorkspace?: boolean;
  readonly hasLocations?: boolean;
  readonly locationAnswer?: IntentLocations;
  readonly revision?: string;
  readonly title?: string;
  readonly machine?: MachineAnswer;
  readonly review?: ReviewSource["review"];
} & Partial<Pick<ReviewSource, "fileDiff" | "fileText">> &
  Partial<Pick<PageReads, "storyNotes">> = {}) {
  const locations =
    locationAnswer ??
    (hasLocations
      ? configured()
      : makeMe.anIntentLocationsAnswer.notConfigured().please());
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
  const storyMachine =
    machine ??
    (hasWorkspace
      ? makeMe.aMachineAnswer
          .holdingWorkspaces({
            source: openDoughSource.id,
            identity: storyA.identity,
            agent: "claude",
            workspace: "/tmp/intent-story",
            branch: storyA.branch,
          })
          .please()
      : makeMe.aMachineAnswer.please());
  const mounted = await mountIntentCiPage({
    work: workAt(revision, hasWorkspace, title),
    machine: storyMachine,
    reads: {
      ...(storyNotes === undefined ? {} : { storyNotes }),
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
        fileDiff: (...asked) => {
          reads.diffs.push(asked[0].path ?? "");
          return fileDiff(...asked);
        },
        fileText: (...asked) => {
          reads.texts.push(asked[0].path ?? "");
          return fileText(...asked);
        },
      },
    },
  });
  const selectStoryA = () => mounted.selectStory(storyA.identity, title);
  await selectStoryA();
  return {
    ...mounted,
    selectStoryA,
    refreshWork: (revision: string) =>
      mounted.showWork(workAt(revision, hasWorkspace, title)),
    reads,
    locationRevisions,
  };
}
