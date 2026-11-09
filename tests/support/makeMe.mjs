// @ts-check
// MakeMe: fresh builders state domain facts and `.please()` returns the value.
import { AgentProfileBuilder } from "./agentProfileTestData.mjs";
import { hostSessionChoices } from "./hostSessionTestData.mjs";
import { LaunchRecordBuilder } from "./launchTestData.mjs";
import { CiProofEntryBuilder } from "./ciProofEntryTestData.mjs";
import { CiProofEvidenceBuilder } from "./ciProofEvidenceTestData.mjs";
import { CiProofFragmentBuilder } from "./ciProofFragmentTestData.mjs";
import {
  CiProofBuilder,
  PublishedStoryEndpointBuilder,
  RevisionCiRunBuilder,
  TakenStoryEndpointBuilder,
} from "./ciComparisonTestData.mjs";
import { CiProofSummaryBuilder } from "./ciProofSummaryTestData.mjs";
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
import { copyFacts } from "./factBuilder.mjs";
import { LandedCiHistoryBuilder } from "./landedCiHistoryTestData.mjs";
import {
  IntentLocationBuilder,
  IntentSettingsBuilder,
} from "./intentLocationTestData.mjs";
import {
  ConfiguredProjectBuilder,
  PublishedSourceBuilder,
} from "./projectConfigurationTestData.mjs";
import { ReleaseBuilder } from "./releaseTestData.mjs";
import { RepositoryBuilder } from "./repositoryTestData.mjs";
import { PlanSliceBuilder, SlicePlanBuilder } from "./slicePlanTestData.mjs";
import { supplierAgreementBuilder } from "./supplierAgreementTestData.mjs";
import { TestOptimizationCandidatesRecordBuilder } from "./testOptimizationCandidatesTestData.mjs";
import { NativeEvidenceRecordBuilder } from "./nativeEvidenceTestData.mjs";
import { StoryPreparationBuilder } from "./storyPreparationTestData.mjs";
import {
  PublishedWorkBuilder,
  StoryCiComparisonBuilder,
} from "./comparisonViewTestData.mjs";
import { CiProofArtifactBuilder } from "./ciProofArtifactTestData.mjs";
import { PublishedIntegrationBuilder } from "./publicationTestData.mjs";
/** @typedef {Parameters<typeof import("../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs").renderEntry>[0]} BacklogEntry */
/** @typedef {import("../../dashboard/tests/publishedFiles.ts").PublishedRevision} PublishedRevision */
/** @typedef {Parameters<typeof import("../../src/skills/dough-execute-plan/scripts/execution-increment-publication.mjs").publishExecutionIncrement>[0]} IncrementPublication */
/** @typedef {Record<keyof Pick<IncrementPublication, "branch" | "previouslyPublishedBase" | "targetRef">, string>} IncrementPublicationFacts */
/** @typedef {import("./publicationTestData.mjs").PublishedIntegration} PublishedIntegration */
/** @typedef {Parameters<typeof import("../../src/skills/dough-execute-plan/scripts/publication-resume.mjs").resumeInterruptedPublication>[0]} PublicationResume */
/** @typedef {Record<keyof Pick<PublicationResume, "candidateSha" | "suffixBase">, string>} RetainedComparison */
/** @typedef {NonNullable<import("../../dashboard/src/storyReviewLandedRun.ts").ReviewRunChoice["comparison"]>} PublishedComparison */
/** @typedef {Parameters<typeof import("../../dashboard/tests/support/baseCiActions.ts").actionsRunsAnswer>[0][number]} CiRun */
/**
 * @template {object} Facts
 * @typedef {import("./factBuilder.mjs").FactBuilder<Facts>} FactBuilder
 */
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
  get aPublishedWork() {
    return new PublishedWorkBuilder();
  },
  get aStoryCiComparison() {
    return new StoryCiComparisonBuilder();
  },
  get aConfiguredProject() {
    return new ConfiguredProjectBuilder();
  },
  /** @returns {FactBuilder<PublishedRevision>} */
  get aPublishedRevision() {
    return { with: copyFacts };
  },
  get aStoryPreparation() {
    return new StoryPreparationBuilder();
  },
  get aSupplierAgreement() {
    return supplierAgreementBuilder;
  },
  get aRelease() {
    return new ReleaseBuilder();
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
  // A host's own session: `.aHostSession.codex({ sessionId, continuation })`.
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
  /** @returns {FactBuilder<import("../../dashboard/server/storyPublishedEvidence.ts").ReviewedStory>} */
  get aReviewedStory() {
    return { with: copyFacts };
  },
  /** @returns {FactBuilder<import("../../dashboard/src/storyReviewFiles.ts").ReviewedFile>} */
  get aReviewedFile() {
    return { with: copyFacts };
  },
  get aPublishedStoryEndpoint() {
    return new PublishedStoryEndpointBuilder();
  },
  get aTakenStoryEndpoint() {
    return new TakenStoryEndpointBuilder();
  },
  get aRevisionCiRun() {
    return new RevisionCiRunBuilder();
  },
  get aCiProof() {
    return new CiProofBuilder();
  },
  get aCiProofArtifact() {
    return new CiProofArtifactBuilder();
  },
  get aCiTimingJob() {
    return new CiTimingJobBuilder();
  },
  get aCiProofEntry() {
    return new CiProofEntryBuilder();
  },
  get aCiProofEvidence() {
    return new CiProofEvidenceBuilder();
  },
  get aCiProofFragment() {
    return new CiProofFragmentBuilder();
  },
  get aCiProofSummary() {
    return new CiProofSummaryBuilder();
  },
  get aCiAdapterAttempt() {
    return new CiAdapterAttemptBuilder();
  },
  get aLandedCiHistory() {
    return new LandedCiHistoryBuilder();
  },
  /** @returns {FactBuilder<CiRun>} */
  get aCiRun() {
    return { with: copyFacts };
  },
  /** @returns {FactBuilder<import("../../dashboard/src/authenticatedIntentCiStatusRead.ts").IntentCiStatus>} */
  get anIntentCiStatus() {
    return { with: copyFacts };
  },
  /** @returns {FactBuilder<IncrementPublicationFacts>} */
  get anIncrementPublication() {
    return { with: copyFacts };
  },
  get aPublishedIntegration() {
    return new PublishedIntegrationBuilder();
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
