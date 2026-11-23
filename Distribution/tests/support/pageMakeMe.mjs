// @ts-check
// MakeMe entry a browser (page) case can load: Node-free builders only.
// makeMe.mjs exposes, from the same definitions, the builders Node cases use.
import { storyNoteMakeMeProperties } from "./storyNoteTestData.mjs";
import { ciHistoryAnswerMakeMeProperties } from "./ciHistoryAnswerTestData.mjs";
import { ciComparisonAnswerMakeMeProperties } from "./ciComparisonAnswerTestData.mjs";
import { ciProofMakeMeProperties } from "./ciProofTestData.mjs";
import { comparedStoryMakeMeProperties } from "./comparedStoryTestData.mjs";
import { comparisonViewMakeMeProperties } from "./comparisonViewTestData.mjs";
import { publishedReadingMakeMeProperties } from "./publishedReadingMakeMe.mjs";
import { RateLimitedIntentReplyBuilder } from "./rateLimitedIntentReplyTestData.mjs";
import { UnreachableAuthenticatedReadBuilder } from "./unreachableAuthenticatedReadTestData.mjs";
import { sessionRecordMakeMeProperties } from "./sessionRecordTestData.mjs";
import { storyReviewMakeMeProperties } from "./storyReviewMakeMe.mjs";
import { reviewCommitMakeMeProperties } from "./reviewCommitTestData.mjs";
import { TestOptimizationCandidatesRecordBuilder } from "./testOptimizationCandidatesTestData.mjs";
import { DoneRecordBuilder } from "./doneRecordTestData.mjs";
import { SlicePlanBuilder } from "./slicePlanTestData.mjs";
import { DoneCatalogBuilder } from "./doneCatalogTestData.mjs";
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
import { StartupRecoveryItemBuilder } from "./startupRecoveryItemTestData.mjs";
import { optionsDefinitionMakeMeProperties } from "./optionsDefinitionTestData.mjs";
import { TokenIndexAnswerBuilder } from "./usageAnswerTestData.mjs";
import { terminalThemeSettingMakeMeProperties } from "./terminalThemeSettingTestData.mjs";

/**
 * @typedef {import("./storyNoteTestData.mjs").StoryNoteMakeMe &
 *   import("./ciHistoryAnswerTestData.mjs").CiHistoryAnswerMakeMe &
 *   import("./ciComparisonAnswerTestData.mjs").CiComparisonAnswerMakeMe &
 *   import("./ciProofTestData.mjs").CiProofMakeMe &
 *   import("./comparedStoryTestData.mjs").ComparedStoryMakeMe &
 *   import("./comparisonViewTestData.mjs").ComparisonViewMakeMe &
 *   import("./optionsDefinitionTestData.mjs").OptionsDefinitionMakeMe &
 *   import("./publishedReadingMakeMe.mjs").PublishedReadingMakeMe &
 *   import("./terminalThemeSettingTestData.mjs").TerminalThemeSettingMakeMe &
 *   import("./sessionRecordTestData.mjs").SessionRecordMakeMe &
 *   import("./storyReviewMakeMe.mjs").StoryReviewMakeMe &
 *   import("./reviewCommitTestData.mjs").ReviewCommitMakeMe & {
 *     readonly aTestOptimizationCandidatesRecord: TestOptimizationCandidatesRecordBuilder;
 *     readonly aRateLimitedIntentReply: RateLimitedIntentReplyBuilder;
 *     readonly anUnreachableAuthenticatedRead: UnreachableAuthenticatedReadBuilder;
 *     readonly aLaunchRecord: LaunchRecordBuilder;
 *     readonly aDoneCatalog: DoneCatalogBuilder;
 *     readonly aSlicePlan: SlicePlanBuilder;
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
 *     readonly aStartupRecoveryItem: StartupRecoveryItemBuilder;
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
  ...ciComparisonAnswerMakeMeProperties(),
  ...ciProofMakeMeProperties(),
  ...comparedStoryMakeMeProperties(),
  ...comparisonViewMakeMeProperties(),
  ...optionsDefinitionMakeMeProperties(),
  ...publishedReadingMakeMeProperties(),
  ...terminalThemeSettingMakeMeProperties(),
  ...sessionRecordMakeMeProperties(),
  ...storyReviewMakeMeProperties(),
  ...reviewCommitMakeMeProperties(),
  aRateLimitedIntentReply: {
    enumerable: true,
    get() {
      return new RateLimitedIntentReplyBuilder();
    },
  },
  anUnreachableAuthenticatedRead: {
    enumerable: true,
    get() {
      return new UnreachableAuthenticatedReadBuilder();
    },
  },
  aTestOptimizationCandidatesRecord: {
    enumerable: true,
    get() {
      return new TestOptimizationCandidatesRecordBuilder();
    },
  },
  aSlicePlan: {
    enumerable: true,
    get() {
      return new SlicePlanBuilder();
    },
  },
  aDoneRecord: {
    enumerable: true,
    get() {
      return new DoneRecordBuilder();
    },
  },
  aDoneCatalog: {
    enumerable: true,
    get() {
      return new DoneCatalogBuilder();
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
  aStartupRecoveryItem: {
    enumerable: true,
    get() {
      return new StartupRecoveryItemBuilder();
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
