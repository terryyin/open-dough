// @ts-check
// MakeMe entry a browser (page) case can load: Node-free builders only.
// makeMe.mjs exposes the same builders from the same definitions.
import { storyNoteMakeMeProperties } from "./storyNoteTestData.mjs";
import { ciHistoryAnswerMakeMeProperties } from "./ciHistoryAnswerTestData.mjs";
import { ciProofMakeMeProperties } from "./ciProofTestData.mjs";
import { comparedStoryMakeMeProperties } from "./comparedStoryTestData.mjs";
import { comparisonViewMakeMeProperties } from "./comparisonViewTestData.mjs";
import { publishedReadingMakeMeProperties } from "./publishedReadingMakeMe.mjs";
import { sessionRecordMakeMeProperties } from "./sessionRecordTestData.mjs";
import { storyReviewMakeMeProperties } from "./storyReviewTestData.mjs";
import { TestOptimizationCandidatesRecordBuilder } from "./testOptimizationCandidatesTestData.mjs";
import { DoneRecordBuilder } from "./doneRecordTestData.mjs";
import { copyFacts } from "./factBuilder.mjs";
import { LaunchRecordBuilder } from "./launchTestData.mjs";
import { AcceptedAttemptBuilder } from "./launchAttemptTestData.mjs";
import { AttemptObservationBuilder } from "./launchAttemptObservationTestData.mjs";
import { CreationRecordBuilder } from "./launchCreationTestData.mjs";
import {
  ObservedLaunchBuilder,
  SessionStateBuilder,
} from "./launchObservationTestData.mjs";
import { MachineAnswerBuilder } from "./machineAnswerTestData.mjs";
import { TokenIndexAnswerBuilder } from "./usageAnswerTestData.mjs";
import { terminalThemeSettingMakeMeProperties } from "./terminalThemeSettingTestData.mjs";

/**
 * @typedef {import("./storyNoteTestData.mjs").StoryNoteMakeMe &
 *   import("./ciHistoryAnswerTestData.mjs").CiHistoryAnswerMakeMe &
 *   import("./ciProofTestData.mjs").CiProofMakeMe &
 *   import("./comparedStoryTestData.mjs").ComparedStoryMakeMe &
 *   import("./comparisonViewTestData.mjs").ComparisonViewMakeMe &
 *   import("./publishedReadingMakeMe.mjs").PublishedReadingMakeMe &
 *   import("./terminalThemeSettingTestData.mjs").TerminalThemeSettingMakeMe &
 *   import("./sessionRecordTestData.mjs").SessionRecordMakeMe &
 *   import("./storyReviewTestData.mjs").StoryReviewMakeMe & {
 *     readonly aTestOptimizationCandidatesRecord: TestOptimizationCandidatesRecordBuilder;
 *     readonly aLaunchRecord: LaunchRecordBuilder;
 *     readonly aLaunchHostOptions: import("./factBuilder.mjs").FactBuilder<
 *       import("../../../dashboard/src/launchHostOptions.ts").LaunchHostOptions
 *     >;
 *     readonly anAcceptedAttempt: AcceptedAttemptBuilder;
 *     readonly anAttemptObservation: AttemptObservationBuilder;
 *     readonly aCreationRecord: CreationRecordBuilder;
 *     readonly aDoneRecord: DoneRecordBuilder;
 *     readonly aSessionState: SessionStateBuilder;
 *     readonly anObservedLaunch: ObservedLaunchBuilder;
 *     readonly aMachineAnswer: MachineAnswerBuilder;
 *     readonly aTokenIndexAnswer: TokenIndexAnswerBuilder;
 *     readonly aProjectSettings: import("./factBuilder.mjs").FactBuilder<
 *       import("../../../dashboard/src/projectConfiguration.ts").ProjectSettings
 *     >;
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
  ...comparedStoryMakeMeProperties(),
  ...comparisonViewMakeMeProperties(),
  ...publishedReadingMakeMeProperties(),
  ...terminalThemeSettingMakeMeProperties(),
  ...sessionRecordMakeMeProperties(),
  ...storyReviewMakeMeProperties(),
  aTestOptimizationCandidatesRecord: {
    enumerable: true,
    get() {
      return new TestOptimizationCandidatesRecordBuilder();
    },
  },
  aDoneRecord: {
    enumerable: true,
    get() {
      return new DoneRecordBuilder();
    },
  },
  // Node-free launch record; Node-only reviewed-session examples stay on makeMe.mjs.
  aLaunchRecord: {
    enumerable: true,
    get() {
      return new LaunchRecordBuilder();
    },
  },
  aLaunchHostOptions: {
    enumerable: true,
    get() {
      return { with: copyFacts };
    },
  },
  aCreationRecord: {
    enumerable: true,
    get() {
      return new CreationRecordBuilder();
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
  aProjectSettings: {
    enumerable: true,
    get() {
      return { with: copyFacts };
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
