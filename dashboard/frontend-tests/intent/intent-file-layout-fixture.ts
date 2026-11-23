import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import {
  inertCiReads,
  judgedStatus,
  openDoughSource,
} from "./intent-ci-status-fixtures.ts";
import { intentReadsPublishing } from "./intent-revision-fixtures.ts";
import { initialRevision } from "./intent-story-changes-fixtures.ts";

const deepPath = "dashboard/tests/boundary/deep/long.spec.ts";
export const deepFile = `Added ${deepPath}`;
const story = {
  identity: "SEED-A#a",
  title: "Story A",
  branch: "claude/story-a",
};
const doughnut = makeMe.aPublishedSource
  .with({
    id: "doughnut",
    label: "Doughnut",
    repository: "nerds-odd-e/doughnut",
  })
  .please();
const published = "dashboard/tests/boundary/kept.spec.ts";

export async function openIntentFileLayout({
  viewport,
  title = story.title,
  selected = true,
}: {
  viewport: { width: number; height: number };
  title?: string;
  selected?: boolean;
}) {
  const namedStory = { ...story, title };
  const work = makeMe.aPublishedWork
    .of(openDoughSource)
    .at(initialRevision)
    .taking(namedStory)
    .please();
  const otherWork = makeMe.aPublishedWork
    .of(doughnut)
    .at("b3".repeat(20))
    .please();
  const locations = makeMe.anIntentLocationsAnswer
    .locating(
      makeMe.anIntentLocation
        .at("dashboard/tests")
        .ofKind("typescript", ["**/*.spec.ts"])
        .selecting(published)
        .please(),
      makeMe.anIntentLocation
        .at("tests")
        .ofKind("shell", ["*.sh"])
        .selecting("tests/check.sh")
        .please(),
    )
    .please();
  const intent = intentReadsPublishing(locations, {
    [published]: "kept source",
  });
  const noLocations = makeMe.anIntentLocationsAnswer.notConfigured().please();
  const change = makeMe.aStoryReview
    .adding(deepPath, 120)
    .adding("dashboard/tests/boundary/sibling.spec.ts")
    .adding("tests/added.sh");
  // Enough file rows to scroll the tree independently of the reader.
  for (let index = 0; index < 24; index += 1)
    change.adding(`dashboard/tests/boundary/deep/scenario-${index}.spec.ts`);
  const added = [...Array<unknown>(120).keys()]
    .map((i) => `long ${i + 1}`)
    .join("\n");
  const mounted = await mountIntentCiPage({
    viewport,
    work,
    projects: [openDoughSource, doughnut],
    machine: makeMe.aMachineAnswer
      .holdingWorkspaces({
        source: openDoughSource.id,
        identity: story.identity,
        agent: "claude",
        workspace: "/tmp/intent-layout",
        branch: story.branch,
      })
      .please(),
    reads: {
      intent: {
        ...intent,
        readLocations: (source, ...rest) =>
          source.id === doughnut.id
            ? Promise.resolve(noLocations)
            : intent.readLocations(source, ...rest),
      },
      ci: inertCiReads({
        readStatus: (...[, branch]) =>
          Promise.resolve(
            judgedStatus(branch, "pass", initialRevision, "Published tests"),
          ),
      }),
      review: {
        review: () => Promise.resolve(change.please()),
        range: () => Promise.reject(new Error("Unexpected comparison range")),
        fileDiff: () =>
          Promise.resolve(
            makeMe.aReviewedFileDiff.adding(deepPath, added).please(),
          ),
        fileText: () =>
          Promise.resolve({ kind: "text", baseline: "", tree: added }),
      },
    },
  });
  if (selected) await mounted.selectStory(story.identity, title);
  return {
    ...mounted,
    showOtherProject: () => mounted.showWork(otherWork),
    showFirstProject: () => mounted.showWork(work),
    comparison: change.please(),
  };
}
