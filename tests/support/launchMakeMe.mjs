// @ts-check
// Launch/landing MakeMe builders kept as accessors for fresh-builder semantics.
import { LaunchRecordBuilder } from "./launchTestData.mjs";
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
import { hostSessionChoices } from "./hostSessionTestData.mjs";
import { copyFacts } from "./factBuilder.mjs";

/** @typedef {import("../../dashboard/server/startStore.ts").StartRecord} StartRecord */
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
 * @property {import("./launchOutcomeTestData.mjs").CompletionReportBuilder} aCompletionReport
 * @property {import("./launchOutcomeTestData.mjs").CompletionSubmissionBuilder} aCompletionSubmission
 * @property {import("./launchLandingTestData.mjs").LandingContextBuilder} aLandingContext
 * @property {import("./launchLandingTestData.mjs").LandingSubmissionBuilder} aLandingSubmission
 * @property {import("./launchLandingTestData.mjs").LandingReceiptBuilder} aLandingReceipt
 * @property {import("./launchLandingEvidenceTestData.mjs").LandingAuthorityBuilder} aLandingAuthority
 * @property {import("./launchLandingEvidenceTestData.mjs").LaunchLandingBuilder} aLaunchLanding
 * @property {typeof hostSessionChoices} aHostSession
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
