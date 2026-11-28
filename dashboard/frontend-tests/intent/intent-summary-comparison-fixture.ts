import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { ComparedStory } from "../../../Distribution/tests/support/comparedStoryTestData.mjs";
import type { CiProofSubject } from "../../src/ciProof.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import type { ReviewSource } from "../../src/reviewSource.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import { mountCiScope, scopeReadsOf } from "./intent-ci-scope-page.tsx";
import { unconfiguredIntentReads } from "./intent-ci-status-fixtures.ts";

const title = "Story A";

type SummaryComparisonOptions = {
  readonly holdComparisonUntil?: Promise<void>;
  readonly fileDiff?: ReviewSource["fileDiff"];
  readonly completion?: string;
  readonly readLocations?: IntentReadSource["readLocations"];
  // The page's story selection, Files tree and review diff. Summary and file
  // Proof cases mount the comparison that owns them.
  readonly onPage?: boolean;
};

// The proof each endpoint's build asks for, matched on the run and revision.
function proofAnswer(story: ComparedStory) {
  return (subject: CiProofSubject) => {
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
}

function needsPage(options: SummaryComparisonOptions) {
  return (
    options.onPage === true ||
    options.holdComparisonUntil !== undefined ||
    options.fileDiff !== undefined ||
    options.readLocations !== undefined ||
    options.completion !== undefined
  );
}

export async function openSummaryComparison(
  story: ComparedStory,
  options: SummaryComparisonOptions = {},
) {
  if (story.scope === undefined) throw new Error("Arrange the compared scope");
  const scope = scopeReadsOf(story);
  scope.answers.proof = proofAnswer(story);
  if (!needsPage(options)) {
    await mountCiScope(story, scope.source);
    return {
      selectStory: () =>
        Promise.reject(
          new Error("This summary is mounted without page story selection."),
        ),
      comparisonReads: scope.asked.comparisons,
      proofReads: scope.asked.proofs,
    };
  }
  const { holdComparisonUntil } = options;
  if (holdComparisonUntil !== undefined) {
    const answerComparison = scope.answers.comparison;
    scope.answers.comparison = async (identity) => {
      const answer = answerComparison(identity);
      await holdComparisonUntil;
      return answer;
    };
  }
  return openSummaryOnPage(story, options, scope);
}

async function openSummaryOnPage(
  story: ComparedStory,
  options: SummaryComparisonOptions,
  scope: ReturnType<typeof scopeReadsOf>,
) {
  if (story.scope === undefined) throw new Error("Arrange the compared scope");
  const { locations, changed } = story.scope;
  const taken = story.work.taken.length > 0;
  const review = makeMe.aStoryReview;
  const unavailableReview = makeMe.aStoryReview
    .unavailable("No review for this story.")
    .please();
  if (!taken) review.published(options.completion ?? story.work.revision);
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
  const mounted = await mountIntentCiPage({
    initialPerspective: "intent",
    selected: story.identity,
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
        readLocations:
          options.readLocations ??
          (() =>
            Promise.resolve({
              status: "configured",
              locations: [...locations],
            })),
        readFile: (...[, path]) => Promise.resolve(`${path}\n`),
      },
      ci: scope.source,
      review: {
        review: ({ identity }) =>
          Promise.resolve(
            identity === story.identity ? review.please() : unavailableReview,
          ),
        fileDiff:
          options.fileDiff ??
          (() => Promise.reject(new Error("Unexpected file diff"))),
        fileText: () => Promise.reject(new Error("Unexpected file text")),
      },
      done: doneReads,
    },
  });
  await intentStoryCompare().listRevision();
  return {
    selectStory: (identity: string) => mounted.selectStory(identity),
    comparisonReads: scope.asked.comparisons,
    proofReads: scope.asked.proofs,
  };
}
