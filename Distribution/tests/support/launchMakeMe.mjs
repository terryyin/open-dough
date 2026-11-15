// @ts-check
// Launch/landing MakeMe builders kept as accessors for fresh-builder semantics.
import { LaunchRecordBuilder } from "./launchTestData.mjs";
import { CreationRecordBuilder } from "./launchCreationTestData.mjs";
import { LaunchRequestBuilder } from "./launchRequestTestData.mjs";
import { AcceptedAttemptBuilder } from "./launchAttemptTestData.mjs";
import { AttemptObservationBuilder } from "./launchAttemptObservationTestData.mjs";
import { MachineAnswerBuilder } from "./machineAnswerTestData.mjs";
import {
  ObservedLaunchBuilder,
  SessionStateBuilder,
} from "./launchObservationTestData.mjs";
import { CompletionReportBuilder } from "./completionReportTestData.mjs";
import { CompletionSubmissionBuilder } from "./completionSubmissionTestData.mjs";
import {
  LandingContextBuilder,
  LandingReceiptBuilder,
  LandingSubmissionBuilder,
} from "./launchLandingTestData.mjs";
import {
  LandingAuthorityBuilder,
  LaunchLandingBuilder,
} from "./launchLandingEvidenceTestData.mjs";
import { hostSessionChoices } from "./hostSessionTestData.mjs";
import { ClaudeListingRowBuilder } from "./claudeListingTestData.mjs";
import { CursorCliConfigBuilder } from "./cursorCliConfigTestData.mjs";
import { RunningCursorSessionsBuilder } from "./runningCursorSessionsTestData.mjs";
import { copyFacts } from "./factBuilder.mjs";

/** @typedef {import("../../../dashboard/server/startStore.ts").StartRecord} StartRecord */
/** @typedef {import("../../../dashboard/src/hostStatus.ts").HostStatus} HostStatus */
/**
 * @template {object} Facts
 * @typedef {import("./factBuilder.mjs").FactBuilder<Facts>} FactBuilder
 */

/**
 * Launch/landing builders exposed on MakeMe (fresh on each access).
 *
 * @typedef {object} LaunchMakeMe
 * @property {FactBuilder<StartRecord>} aStartRecord
 * @property {import("./launchTestData.mjs").LaunchRecordBuilder} aLaunchRecord
 * @property {import("./launchRequestTestData.mjs").LaunchRequestBuilder} aLaunchRequest
 * @property {import("./launchCreationTestData.mjs").CreationRecordBuilder} aCreationRecord
 * @property {import("./completionReportTestData.mjs").CompletionReportBuilder} aCompletionReport
 * @property {import("./completionSubmissionTestData.mjs").CompletionSubmissionBuilder} aCompletionSubmission
 * @property {import("./launchLandingTestData.mjs").LandingContextBuilder} aLandingContext
 * @property {import("./launchLandingTestData.mjs").LandingSubmissionBuilder} aLandingSubmission
 * @property {import("./launchLandingTestData.mjs").LandingReceiptBuilder} aLandingReceipt
 * @property {import("./launchLandingEvidenceTestData.mjs").LandingAuthorityBuilder} aLandingAuthority
 * @property {import("./launchLandingEvidenceTestData.mjs").LaunchLandingBuilder} aLaunchLanding
 * @property {typeof hostSessionChoices} aHostSession
 * @property {import("./claudeListingTestData.mjs").ClaudeListingRowBuilder} aClaudeListingRow
 * @property {FactBuilder<HostStatus>} aHostStatus
 * @property {import("./runningCursorSessionsTestData.mjs").RunningCursorSessionsBuilder} aRunningCursorSessions
 * @property {import("./cursorCliConfigTestData.mjs").CursorCliConfigBuilder} aCursorCliConfig
 * @property {import("./launchObservationTestData.mjs").SessionStateBuilder} aSessionState
 * @property {import("./launchObservationTestData.mjs").ObservedLaunchBuilder} anObservedLaunch
 * @property {import("./launchAttemptTestData.mjs").AcceptedAttemptBuilder} anAcceptedAttempt
 * @property {import("./launchAttemptObservationTestData.mjs").AttemptObservationBuilder} anAttemptObservation
 * @property {import("./machineAnswerTestData.mjs").MachineAnswerBuilder} aMachineAnswer
 */

/** @returns {PropertyDescriptorMap} */
export function launchMakeMeProperties() {
  return {
    aStartRecord: {
      enumerable: true,
      /** @returns {FactBuilder<StartRecord>} */
      get() {
        return { with: copyFacts };
      },
    },
    aLaunchRecord: {
      enumerable: true,
      get() {
        return new LaunchRecordBuilder();
      },
    },
    aLaunchRequest: {
      enumerable: true,
      get() {
        return new LaunchRequestBuilder();
      },
    },
    aCreationRecord: {
      enumerable: true,
      get() {
        return new CreationRecordBuilder();
      },
    },
    aCompletionReport: {
      enumerable: true,
      get() {
        return new CompletionReportBuilder();
      },
    },
    aCompletionSubmission: {
      enumerable: true,
      get() {
        return new CompletionSubmissionBuilder();
      },
    },
    aLandingContext: {
      enumerable: true,
      get() {
        return new LandingContextBuilder();
      },
    },
    aLandingSubmission: {
      enumerable: true,
      get() {
        return new LandingSubmissionBuilder();
      },
    },
    aLandingReceipt: {
      enumerable: true,
      get() {
        return new LandingReceiptBuilder();
      },
    },
    aLandingAuthority: {
      enumerable: true,
      get() {
        return new LandingAuthorityBuilder();
      },
    },
    aLaunchLanding: {
      enumerable: true,
      get() {
        return new LaunchLandingBuilder();
      },
    },
    aHostSession: {
      enumerable: true,
      get() {
        return hostSessionChoices;
      },
    },
    aClaudeListingRow: {
      enumerable: true,
      get() {
        return new ClaudeListingRowBuilder();
      },
    },
    aHostStatus: {
      enumerable: true,
      /** @returns {FactBuilder<HostStatus>} */
      get() {
        return { with: copyFacts };
      },
    },
    aRunningCursorSessions: {
      enumerable: true,
      get() {
        return new RunningCursorSessionsBuilder();
      },
    },
    aCursorCliConfig: {
      enumerable: true,
      get() {
        return new CursorCliConfigBuilder();
      },
    },
    aSessionState: {
      enumerable: true,
      get() {
        return new SessionStateBuilder();
      },
    },
    anObservedLaunch: {
      enumerable: true,
      get() {
        return new ObservedLaunchBuilder();
      },
    },
    anAcceptedAttempt: {
      enumerable: true,
      get() {
        return new AcceptedAttemptBuilder();
      },
    },
    anAttemptObservation: {
      enumerable: true,
      get() {
        return new AttemptObservationBuilder();
      },
    },
    aMachineAnswer: {
      enumerable: true,
      get() {
        return new MachineAnswerBuilder();
      },
    },
  };
}
