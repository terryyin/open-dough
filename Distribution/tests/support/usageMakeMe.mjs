// @ts-check
// Usage-history MakeMe builders (task facts, retained store, answers and
// host rollouts) kept as accessors for fresh-builder semantics.
import {
  UsageAssociationBuilder,
  UsageObservationBuilder,
  UsageTaskBuilder,
} from "./usageHistoryTestData.mjs";
import { UsageHistoryBuilder } from "./usageStoreTestData.mjs";
import { UsageImportOptionsBuilder } from "./usageImportOptionsTestData.mjs";
import { UsageTaskHistoryBuilder } from "./usageTaskHistoryTestData.mjs";
import {
  SummaryTaskBuilder,
  UsageTaskSummaryBuilder,
} from "./usageTaskSummaryTestData.mjs";
import { TokenIndexAnswerBuilder } from "./usageAnswerTestData.mjs";
import { CodexRolloutBuilder } from "./codexRolloutTestData.mjs";
import { ClaudeTranscriptBuilder } from "./claudeTranscriptTestData.mjs";
import { CursorTranscriptBuilder } from "./cursorTranscriptTestData.mjs";

/**
 * Usage-history builders exposed on MakeMe (fresh on each access).
 *
 * @typedef {object} UsageMakeMe
 * @property {UsageTaskBuilder} aUsageTask
 * @property {UsageObservationBuilder} aUsageObservation
 * @property {UsageAssociationBuilder} aUsageAssociation
 * @property {UsageHistoryBuilder} aUsageHistory
 * @property {UsageImportOptionsBuilder} aUsageImportOptions
 * @property {UsageTaskHistoryBuilder} aUsageTaskHistory
 * @property {SummaryTaskBuilder} aSummaryTask
 * @property {UsageTaskSummaryBuilder} aUsageTaskSummary
 * @property {TokenIndexAnswerBuilder} aTokenIndexAnswer
 * @property {CodexRolloutBuilder} aCodexRollout
 * @property {ClaudeTranscriptBuilder} aClaudeTranscript
 * @property {CursorTranscriptBuilder} aCursorTranscript
 */

/** @returns {PropertyDescriptorMap} */
export function usageMakeMeProperties() {
  return {
    aCursorTranscript: {
      enumerable: true,
      get() {
        return new CursorTranscriptBuilder();
      },
    },
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
    aUsageTaskHistory: {
      enumerable: true,
      get() {
        return new UsageTaskHistoryBuilder();
      },
    },
    aSummaryTask: {
      enumerable: true,
      get() {
        return new SummaryTaskBuilder();
      },
    },
    aUsageTaskSummary: {
      enumerable: true,
      get() {
        return new UsageTaskSummaryBuilder();
      },
    },
    aUsageHistory: {
      enumerable: true,
      get() {
        return new UsageHistoryBuilder();
      },
    },
    aUsageImportOptions: {
      enumerable: true,
      get() {
        return new UsageImportOptionsBuilder();
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
