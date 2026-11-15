// @ts-check
// Usage-history MakeMe builders (task facts, retained store, answers and
// host rollouts) kept as accessors for fresh-builder semantics.
import {
  UsageAssociationBuilder,
  UsageObservationBuilder,
  UsageTaskBuilder,
} from "./usageHistoryTestData.mjs";
import { UsageHistoryBuilder } from "./usageStoreTestData.mjs";
import { TokenIndexAnswerBuilder } from "./usageAnswerTestData.mjs";
import { CodexRolloutBuilder } from "./codexRolloutTestData.mjs";
import { ClaudeTranscriptBuilder } from "./claudeTranscriptTestData.mjs";

/**
 * Usage-history builders exposed on MakeMe (fresh on each access).
 *
 * @typedef {object} UsageMakeMe
 * @property {UsageTaskBuilder} aUsageTask
 * @property {UsageObservationBuilder} aUsageObservation
 * @property {UsageAssociationBuilder} aUsageAssociation
 * @property {UsageHistoryBuilder} aUsageHistory
 * @property {TokenIndexAnswerBuilder} aTokenIndexAnswer
 * @property {CodexRolloutBuilder} aCodexRollout
 * @property {ClaudeTranscriptBuilder} aClaudeTranscript
 */

/** @returns {PropertyDescriptorMap} */
export function usageMakeMeProperties() {
  return {
    aUsageTask: {
      enumerable: true,
      get() {
        return new UsageTaskBuilder();
      },
    },
    aUsageObservation: {
      enumerable: true,
      get() {
        return new UsageObservationBuilder();
      },
    },
    aUsageAssociation: {
      enumerable: true,
      get() {
        return new UsageAssociationBuilder();
      },
    },
    aUsageHistory: {
      enumerable: true,
      get() {
        return new UsageHistoryBuilder();
      },
    },
    aTokenIndexAnswer: {
      enumerable: true,
      get() {
        return new TokenIndexAnswerBuilder();
      },
    },
    aCodexRollout: {
      enumerable: true,
      get() {
        return new CodexRolloutBuilder();
      },
    },
    aClaudeTranscript: {
      enumerable: true,
      get() {
        return new ClaudeTranscriptBuilder();
      },
    },
  };
}
