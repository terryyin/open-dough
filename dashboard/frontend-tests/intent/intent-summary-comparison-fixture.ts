import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { ComparedStory } from "../../../Distribution/tests/support/comparedStoryTestData.mjs";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import { scopeReadsOf } from "./intent-ci-scope-page.tsx";
import { unconfiguredIntentReads } from "./intent-ci-status-fixtures.ts";

const title = "Story A";

export async function openSummaryComparison(story: ComparedStory) {
  if (story.scope === undefined) throw new Error("Arrange the compared scope");
  const { locations, changed } = story.scope;
  const taken = story.work.taken.length > 0;
  const review = makeMe.aStoryReview;
  if (!taken) review.published(story.work.revision);
  for (const file of changed) {
    switch (file.kind) {
      case "added":
        review.adding(file.path);
        break;
      case "deleted":
        review.deleting(file.path);
        break;
      case "modified":
        review.modifying(file.path);
        break;
      case "renamed":
        review.renaming(file.oldPath, file.path);
        break;
    }
  }
  const { done, doneReads } = makeMe.aDoneCatalog
    .holding([
      makeMe.aDoneRecord
        .completed({
          identity: story.identity,
          title,
          completedAt: story.work.retrievedAt.toISOString(),
        })
        .please(),
    ])
    .please();
  const scope = scopeReadsOf(story);
  scope.answers.proof = (subject) => {
    const slots = [
      story.answer.baseline,
      story.answer.provisional ?? story.answer.branch,
      story.answer.landed,
    ];
    const slot = slots.findIndex(
      (candidate) =>
        candidate.kind === "build" &&
        candidate.runId === subject.runId &&
        candidate.revision === subject.revision,
    );
    const proof = story.proofs?.[slot];
    if (proof === undefined)
      throw new Error(`No proof arranged for run ${subject.runId}`);
    return proof;
  };
  const mounted = await mountIntentCiPage({
    work: taken
      ? story.work
      : makeMe.aPublishedWork.with({ ...story.work, done }).please(),
    machine: taken
      ? makeMe.aMachineAnswer
          .holdingWorkspaces({
            source: story.source.id,
            identity: story.identity,
            agent: "engineer",
            workspace: "/tmp/intent-story",
            branch: story.answer.mode === "trunk" ? "main" : "feature/a",
          })
          .please()
      : makeMe.aMachineAnswer.please(),
    reads: {
      intent: {
        ...unconfiguredIntentReads,
        readLocations: () =>
          Promise.resolve({ status: "configured", locations: [...locations] }),
        readFile: (...[, path]) => Promise.resolve(`${path}\n`),
      },
      ci: scope.source,
      review: {
        review: () => Promise.resolve(review.please()),
        range: () => Promise.reject(new Error("Unexpected review range")),
        fileDiff: () => Promise.reject(new Error("Unexpected file diff")),
        fileText: () => Promise.reject(new Error("Unexpected file text")),
      },
      done: doneReads,
    },
  });
  await mounted.selectStory(story.identity, title);
  await intentStoryCompare().chooseTab("Changes");
  return { proofReads: scope.asked.proofs };
}
