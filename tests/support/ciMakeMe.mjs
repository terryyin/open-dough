// @ts-check
// CI-domain MakeMe builders: defined as accessors so each `makeMe.aThing`
// access stays a fresh builder while the public entry stays a thin aggregate.
import { CiProofEntryBuilder } from "./ciProofEntryTestData.mjs";
import { CiProofEvidenceBuilder } from "./ciProofEvidenceTestData.mjs";
import {
  PublishedStoryEndpointBuilder,
  TakenStoryEndpointBuilder,
} from "./ciComparisonTestData.mjs";
import { CiProofSummaryBuilder } from "./ciProofSummaryTestData.mjs";
import { CiProofFragmentBuilder } from "./ciProofFragmentTestData.mjs";
import {
  CiAdapterAttemptBuilder,
  CiTimingJobBuilder,
} from "./ciTimingTestData.mjs";
import { LandedCiHistoryBuilder } from "./landedCiHistoryTestData.mjs";
import { CiProofBuilder } from "./ciProofTestData.mjs";
import { LandedCiResolutionBuilder } from "./landedCiProofTestData.mjs";
import {
  PublishedWorkBuilder,
  StoryCiComparisonBuilder,
} from "./comparisonViewTestData.mjs";
import { CiProofArtifactBuilder } from "./ciProofArtifactTestData.mjs";
import { DashboardProofRecordBuilder } from "./dashboardProofRecordTestData.mjs";
import { GitHubJobBuilder } from "./ciJobTestData.mjs";
import { CiRunBuilder, RevisionCiRunBuilder } from "./ciRunTestData.mjs";
import { copyFacts } from "./factBuilder.mjs";

/** @typedef {import("../../dashboard/src/ciScopeHistory.ts").CiScopeHistory} CiScopeHistory */
/** @typedef {import("../../dashboard/src/storyCiComparisonEntries.ts").ComparisonEndpointProof} ComparisonEndpointProof */
/**
 * @template {object} Facts
 * @typedef {import("./factBuilder.mjs").FactBuilder<Facts>} FactBuilder
 */

/**
 * CI builders exposed on MakeMe (fresh on each access).
 *
 * @typedef {object} CiMakeMe
 * @property {FactBuilder<import("../../dashboard/server/ciFollowUpStore.ts").RepeatRequest>} aCiRepeatRequest
 * @property {import("./ciProofTestData.mjs").CiProofBuilder} aCiProof
 * @property {FactBuilder<ComparisonEndpointProof>} aComparisonEndpointProof
 * @property {import("./landedCiProofTestData.mjs").LandedCiResolutionBuilder} aLandedCiResolution
 * @property {FactBuilder<CiScopeHistory>} aCiScopeHistory
 * @property {import("./comparisonViewTestData.mjs").PublishedWorkBuilder} aPublishedWork
 * @property {import("./comparisonViewTestData.mjs").StoryCiComparisonBuilder} aStoryCiComparison
 * @property {import("./ciComparisonTestData.mjs").PublishedStoryEndpointBuilder} aPublishedStoryEndpoint
 * @property {import("./ciComparisonTestData.mjs").TakenStoryEndpointBuilder} aTakenStoryEndpoint
 * @property {import("./ciRunTestData.mjs").RevisionCiRunBuilder} aRevisionCiRun
 * @property {import("./ciProofArtifactTestData.mjs").CiProofArtifactBuilder} aCiProofArtifact
 * @property {import("./ciTimingTestData.mjs").CiTimingJobBuilder} aCiTimingJob
 * @property {import("./ciProofEntryTestData.mjs").CiProofEntryBuilder} aCiProofEntry
 * @property {import("./ciProofEvidenceTestData.mjs").CiProofEvidenceBuilder} aCiProofEvidence
 * @property {import("./ciProofFragmentTestData.mjs").CiProofFragmentBuilder} aCiProofFragment
 * @property {import("./ciProofSummaryTestData.mjs").CiProofSummaryBuilder} aCiProofSummary
 * @property {import("./dashboardProofRecordTestData.mjs").DashboardProofRecordBuilder} aDashboardProofRecord
 * @property {import("./ciTimingTestData.mjs").CiAdapterAttemptBuilder} aCiAdapterAttempt
 * @property {import("./landedCiHistoryTestData.mjs").LandedCiHistoryBuilder} aLandedCiHistory
 * @property {import("./ciRunTestData.mjs").CiRunBuilder} aCiRun
 * @property {import("./ciJobTestData.mjs").GitHubJobBuilder} aGitHubJob
 * @property {FactBuilder<import("../../dashboard/src/authenticatedIntentCiStatusRead.ts").IntentCiStatus>} anIntentCiStatus
 */

/** @returns {PropertyDescriptorMap} */
export function ciMakeMeProperties() {
  return {
    aCiRepeatRequest: {
      enumerable: true,
      get() {
        return { with: copyFacts };
      },
    },
    aCiProof: {
      enumerable: true,
      get() {
        return new CiProofBuilder();
      },
    },
    aComparisonEndpointProof: {
      enumerable: true,
      /** @returns {FactBuilder<ComparisonEndpointProof>} */
      get() {
        return { with: copyFacts };
      },
    },
    aLandedCiResolution: {
      enumerable: true,
      get() {
        return new LandedCiResolutionBuilder();
      },
    },
    aCiScopeHistory: {
      enumerable: true,
      /** @returns {FactBuilder<CiScopeHistory>} */
      get() {
        return { with: copyFacts };
      },
    },
    aPublishedWork: {
      enumerable: true,
      get() {
        return new PublishedWorkBuilder();
      },
    },
    aStoryCiComparison: {
      enumerable: true,
      get() {
        return new StoryCiComparisonBuilder();
      },
    },
    aPublishedStoryEndpoint: {
      enumerable: true,
      get() {
        return new PublishedStoryEndpointBuilder();
      },
    },
    aTakenStoryEndpoint: {
      enumerable: true,
      get() {
        return new TakenStoryEndpointBuilder();
      },
    },
    aRevisionCiRun: {
      enumerable: true,
      get() {
        return new RevisionCiRunBuilder();
      },
    },
    aCiProofArtifact: {
      enumerable: true,
      get() {
        return new CiProofArtifactBuilder();
      },
    },
    aCiTimingJob: {
      enumerable: true,
      get() {
        return new CiTimingJobBuilder();
      },
    },
    aCiProofEntry: {
      enumerable: true,
      get() {
        return new CiProofEntryBuilder();
      },
    },
    aCiProofEvidence: {
      enumerable: true,
      get() {
        return new CiProofEvidenceBuilder();
      },
    },
    aCiProofFragment: {
      enumerable: true,
      get() {
        return new CiProofFragmentBuilder();
      },
    },
    aCiProofSummary: {
      enumerable: true,
      get() {
        return new CiProofSummaryBuilder();
      },
    },
    aDashboardProofRecord: {
      enumerable: true,
      get() {
        return new DashboardProofRecordBuilder();
      },
    },
    aCiAdapterAttempt: {
      enumerable: true,
      get() {
        return new CiAdapterAttemptBuilder();
      },
    },
    aLandedCiHistory: {
      enumerable: true,
      get() {
        return new LandedCiHistoryBuilder();
      },
    },
    aCiRun: {
      enumerable: true,
      get() {
        return new CiRunBuilder();
      },
    },
    aGitHubJob: {
      enumerable: true,
      get() {
        return new GitHubJobBuilder();
      },
    },
    anIntentCiStatus: {
      enumerable: true,
      /** @returns {FactBuilder<import("../../dashboard/src/authenticatedIntentCiStatusRead.ts").IntentCiStatus>} */
      get() {
        return { with: copyFacts };
      },
    },
  };
}
