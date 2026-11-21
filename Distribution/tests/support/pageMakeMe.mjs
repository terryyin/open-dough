// @ts-check
// MakeMe entry a browser (page) case can load: Node-free builders only.
// makeMe.mjs exposes the same builders from the same definitions.
import { storyNoteMakeMeProperties } from "./storyNoteTestData.mjs";
import { ciHistoryAnswerMakeMeProperties } from "./ciHistoryAnswerTestData.mjs";
import { ciProofMakeMeProperties } from "./ciProofTestData.mjs";
import { intentCiStatusMakeMeProperties } from "./comparisonViewTestData.mjs";
import { publishedReadingMakeMeProperties } from "./publishedReadingMakeMe.mjs";
import { sessionRecordMakeMeProperties } from "./sessionRecordTestData.mjs";
import { TestOptimizationCandidatesRecordBuilder } from "./testOptimizationCandidatesTestData.mjs";
import { copyFacts } from "./factBuilder.mjs";
import { LaunchRecordBuilder } from "./launchTestData.mjs";
import {
  ObservedLaunchBuilder,
  SessionStateBuilder,
} from "./launchObservationTestData.mjs";
import { MachineAnswerBuilder } from "./machineAnswerTestData.mjs";
import { TokenIndexAnswerBuilder } from "./usageAnswerTestData.mjs";

/**
 * @typedef {import("./storyNoteTestData.mjs").StoryNoteMakeMe &
 *   import("./ciHistoryAnswerTestData.mjs").CiHistoryAnswerMakeMe &
 *   import("./ciProofTestData.mjs").CiProofMakeMe &
 *   import("./comparisonViewTestData.mjs").IntentCiStatusMakeMe &
 *   import("./publishedReadingMakeMe.mjs").PublishedReadingMakeMe &
 *   import("./sessionRecordTestData.mjs").SessionRecordMakeMe & {
 *     readonly aTestOptimizationCandidatesRecord: TestOptimizationCandidatesRecordBuilder;
 *     readonly aLaunchRecord: LaunchRecordBuilder;
 *     readonly aSessionState: SessionStateBuilder;
 *     readonly anObservedLaunch: ObservedLaunchBuilder;
 *     readonly aMachineAnswer: MachineAnswerBuilder;
 *     readonly aTokenIndexAnswer: TokenIndexAnswerBuilder;
 *     readonly anOpenAIConfigurationStatus: import("./factBuilder.mjs").FactBuilder<
 *       import("../../../dashboard/src/openAIConfiguration.ts").OpenAIConfigurationStatus
 *     >;
 *     readonly aHostStatus: import("./factBuilder.mjs").FactBuilder<
 *       import("../../../dashboard/src/hostStatus.ts").HostStatus
 *     >;
 *   }} PageMakeMe
 */

/** @type {PageMakeMe} */
export const makeMe = Object.defineProperties(/** @type {PageMakeMe} */ ({}), {
  ...storyNoteMakeMeProperties(),
  ...ciHistoryAnswerMakeMeProperties(),
  ...ciProofMakeMeProperties(),
  ...intentCiStatusMakeMeProperties(),
  ...publishedReadingMakeMeProperties(),
  ...sessionRecordMakeMeProperties(),
  aTestOptimizationCandidatesRecord: {
    enumerable: true,
    get() {
      return new TestOptimizationCandidatesRecordBuilder();
    },
  },
  // Node-free launch record; Node-only reviewed-session examples stay on makeMe.mjs.
  aLaunchRecord: {
    enumerable: true,
    get() {
      return new LaunchRecordBuilder();
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
  aMachineAnswer: {
    enumerable: true,
    get() {
      return new MachineAnswerBuilder();
    },
  },
  aTokenIndexAnswer: {
    enumerable: true,
    get() {
      return new TokenIndexAnswerBuilder();
    },
  },
  aHostStatus: {
    enumerable: true,
    get() {
      return { with: copyFacts };
    },
  },
  anOpenAIConfigurationStatus: {
    enumerable: true,
    get() {
      return { with: copyFacts };
    },
  },
});
