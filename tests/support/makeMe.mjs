// @ts-check
// MakeMe: shared domain-data entry. Each `makeMe.aThing` starts a fresh builder;
// named methods state facts and `.please()` returns the product value.
import { AgentProfileBuilder } from "./agentProfileTestData.mjs";
import { hostSessionChoices } from "./hostSessionTestData.mjs";
import { LaunchRecordBuilder } from "./launchTestData.mjs";
import { CiProofEntryBuilder } from "./ciProofEntryTestData.mjs";
import { AcceptedAttemptBuilder } from "./launchAttemptTestData.mjs";
import { AttemptObservationBuilder } from "./launchAttemptObservationTestData.mjs";
import { MachineAnswerBuilder } from "./machineAnswerTestData.mjs";
import {
  ObservedLaunchBuilder,
  SessionStateBuilder,
} from "./launchObservationTestData.mjs";
import {
  CompletionReportBuilder,
  CompletionSubmissionBuilder,
} from "./launchOutcomeTestData.mjs";
import {
  LandingContextBuilder,
  LandingReceiptBuilder,
  LandingSubmissionBuilder,
} from "./launchLandingTestData.mjs";
import {
  LandingAuthorityBuilder,
  LaunchLandingBuilder,
} from "./launchLandingEvidenceTestData.mjs";
import {
  CiAdapterAttemptBuilder,
  CiTimingJobBuilder,
} from "./ciTimingTestData.mjs";
import { DoneRecordBuilder } from "./doneRecordTestData.mjs";
import {
  IntentLocationBuilder,
  IntentSettingsBuilder,
} from "./intentLocationTestData.mjs";
import {
  ConfiguredProjectBuilder,
  PublishedSourceBuilder,
} from "./projectConfigurationTestData.mjs";
import { release } from "./releaseTestData.mjs";
import { RepositoryBuilder } from "./repositoryTestData.mjs";
import { PlanSliceBuilder, SlicePlanBuilder } from "./slicePlanTestData.mjs";
import { TestOptimizationCandidatesRecordBuilder } from "./testOptimizationCandidatesTestData.mjs";
import { NativeEvidenceRecordBuilder } from "./nativeEvidenceTestData.mjs";

/** @typedef {Parameters<typeof import("../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs").renderEntry>[0]} BacklogEntry */
/** @typedef {import("./releaseTestData.mjs").Release} Release */
/** @typedef {import("../../dashboard/tests/publishedFiles.ts").PublishedRevision} PublishedRevision */
/** @typedef {Omit<Parameters<typeof import("../../src/skills/dough-product-backlog/scripts/product-backlog-story-state-home.mjs").recordPreparation>[1], "identity" | "href" | "expectedBasis">} StoryPreparation */
/** @typedef {ReturnType<typeof import("../../src/skills/dough-product-backlog/scripts/product-backlog-story-dependencies.mjs").normalizeStoryDependency>} SupplierAgreement */
/** @typedef {Parameters<typeof import("../../src/skills/dough-execute-plan/scripts/execution-increment-publication.mjs").publishExecutionIncrement>[0]} IncrementPublication */
/** @typedef {Record<keyof Pick<IncrementPublication, "branch" | "previouslyPublishedBase" | "targetRef">, string>} IncrementPublicationFacts */
/** @typedef {Parameters<typeof import("../../src/skills/dough-execute-plan/scripts/history-preserving-publish.mjs").publishHistoryPreservingCandidate>[0]} HistoryPreservingPublication */
/** @typedef {Record<keyof Pick<HistoryPreservingPublication, "publishedTip" | "branch">, string> & Partial<Record<keyof Pick<HistoryPreservingPublication, "targetRef">, string>>} PublishedIntegration */
/** @typedef {Parameters<typeof import("../../src/skills/dough-execute-plan/scripts/publication-resume.mjs").resumeInterruptedPublication>[0]} PublicationResume */
/** @typedef {Record<keyof Pick<PublicationResume, "candidateSha" | "suffixBase">, string>} RetainedComparison */
/** @typedef {NonNullable<import("../../dashboard/src/storyReviewLandedRun.ts").ReviewRunChoice["comparison"]>} PublishedComparison */
/** @typedef {Parameters<typeof import("../../dashboard/tests/support/baseCiActions.ts").actionsRunsAnswer>[0][number]} CiRun */
/**
 * @template {object} Facts
 * @typedef {{ with(facts: Facts): { please(): Facts } }} FactBuilder
 */

/**
 * @template {object} Facts
 * @param {Facts} facts
 */
function copyFacts(facts) {
  return { please: () => ({ ...facts }) };
}

export const makeMe = {
  get aNativeEvidenceRecord() {
    return new NativeEvidenceRecordBuilder();
  },
  get aRepository() {
    return new RepositoryBuilder();
  },
  get anAgentProfile() {
    return new AgentProfileBuilder();
  },
  /** @returns {FactBuilder<BacklogEntry>} */
  get aBacklogEntry() {
    return { with: copyFacts };
  },
  get aPublishedSource() {
    return new PublishedSourceBuilder();
  },
  get aConfiguredProject() {
    return new ConfiguredProjectBuilder();
  },
  /** @returns {FactBuilder<PublishedRevision>} */
  get aPublishedRevision() {
    return { with: copyFacts };
  },
  get aStoryPreparation() {
    return {
      /**
       * @template {StoryPreparation} Facts
       * @param {Facts} facts
       */
      with(facts) {
        return copyFacts(facts);
      },
      /**
       * A refined story planned in `plan`, a path relative to its seed.
       * @param {string} plan
       */
      plannedIn(plan) {
        return this.with({
          refinement: /** @type {const} */ ("refined"),
          approach: /** @type {const} */ ("planned"),
          plan,
        });
      },
    };
  },
  get aSupplierAgreement() {
    return {
      /** @param {Omit<SupplierAgreement, "implementation" | "rationale" | "condition"> & Partial<Pick<SupplierAgreement, "implementation" | "rationale" | "condition">>} facts */
      with({
        supplier,
        implementation = "Shared endpoint interpretation",
        rationale = "The supplier must deliver the endpoint contract before this story can validate its consumer behavior; normal reconciliation cannot supply the missing contract.",
        condition = "The selected endpoint contract is completed and integrated.",
        ...facts
      }) {
        return {
          please: () => ({
            supplier: { identity: supplier.identity, href: supplier.href },
            implementation,
            rationale,
            condition,
            ...facts,
          }),
        };
      },
    };
  },
  get aRelease() {
    return {
      /** @param {import("./releaseTestData.mjs").ReleaseFacts} facts */
      with(facts) {
        return {
          /** @returns {Release} */
          please: () => release(facts),
        };
      },
    };
  },
  get aDoneRecord() {
    return new DoneRecordBuilder();
  },
  get anIntentLocation() {
    return new IntentLocationBuilder();
  },
  get intentSettings() {
    return new IntentSettingsBuilder();
  },
  get aTestOptimizationCandidatesRecord() {
    return new TestOptimizationCandidatesRecordBuilder();
  },
  get aLaunchRecord() {
    return new LaunchRecordBuilder();
  },
  get aCompletionReport() {
    return new CompletionReportBuilder();
  },
  get aCompletionSubmission() {
    return new CompletionSubmissionBuilder();
  },
  get aLandingContext() {
    return new LandingContextBuilder();
  },
  get aLandingSubmission() {
    return new LandingSubmissionBuilder();
  },
  get aLandingReceipt() {
    return new LandingReceiptBuilder();
  },
  get aLandingAuthority() {
    return new LandingAuthorityBuilder();
  },
  get aLaunchLanding() {
    return new LaunchLandingBuilder();
  },
  // A host's session on its own, as a terminal or runner consumes it:
  // `makeMe.aHostSession.codex({ sessionId, continuation }).please()`.
  get aHostSession() {
    return hostSessionChoices;
  },
  get aSessionState() {
    return new SessionStateBuilder();
  },
  get anObservedLaunch() {
    return new ObservedLaunchBuilder();
  },
  get anAcceptedAttempt() {
    return new AcceptedAttemptBuilder();
  },
  get anAttemptObservation() {
    return new AttemptObservationBuilder();
  },
  get aMachineAnswer() {
    return new MachineAnswerBuilder();
  },
  get aCiTimingJob() {
    return new CiTimingJobBuilder();
  },
  get aCiProofEntry() {
    return new CiProofEntryBuilder();
  },
  get aCiAdapterAttempt() {
    return new CiAdapterAttemptBuilder();
  },
  /** @returns {FactBuilder<CiRun>} */
  get aCiRun() {
    return { with: copyFacts };
  },
  /** @returns {FactBuilder<IncrementPublicationFacts>} */
  get anIncrementPublication() {
    return { with: copyFacts };
  },
  get aPublishedIntegration() {
    return {
      /**
       * @template {PublishedIntegration} Facts
       * @param {Facts} facts
       */
      with(facts) {
        return copyFacts(facts);
      },
    };
  },
  /** @returns {FactBuilder<RetainedComparison>} */
  get aRetainedComparison() {
    return { with: copyFacts };
  },
  /** @returns {FactBuilder<PublishedComparison>} */
  get aPublishedComparison() {
    return { with: copyFacts };
  },
  get aPlanSlice() {
    return new PlanSliceBuilder();
  },
  get aSlicePlan() {
    return new SlicePlanBuilder();
  },
};
