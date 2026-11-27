// @ts-check
import { DoneRecordBuilder } from "./doneRecordTestData.mjs";
import { FileFollowUpBuilder } from "./followUpFileTestData.mjs";
import { FollowUpBuilder } from "./followUpTestData.mjs";
import { copyFacts } from "./factBuilder.mjs";
import { StoryPreparationBuilder } from "./storyPreparationTestData.mjs";
import { IntentSettingsBuilder } from "./intentLocationTestData.mjs";
import { optionsDefinitionMakeMeProperties } from "./optionsDefinitionTestData.mjs";
import { ConfiguredProjectBuilder } from "./projectConfigurationTestData.mjs";
import { projectCiSettingsMakeMeProperties } from "./projectCiSettingsTestData.mjs";
import { ReleaseBuilder } from "./releaseTestData.mjs";
import { RepositoryBuilder } from "./repositoryTestData.mjs";
import { CheckoutWorkBuilder } from "./repositoryCheckoutWorkTestData.mjs";
import { projectRevisionMakeMeProperties } from "./projectRevisionTestData.mjs";
import { PlanSliceBuilder, SlicePlanBuilder } from "./slicePlanTestData.mjs";
import { terminalThemeSettingMakeMeProperties } from "./terminalThemeSettingTestData.mjs";
import { storyReviewMakeMeProperties } from "./storyReviewMakeMe.mjs";
import { TestOptimizationCandidatesRecordBuilder } from "./testOptimizationCandidatesTestData.mjs";
import { NativeEvidenceRecordBuilder } from "./nativeEvidenceTestData.mjs";
import { PublishedIntegrationBuilder } from "./publicationTestData.mjs";
import { ciMakeMeProperties } from "./ciMakeMe.mjs";
import { launchMakeMeProperties } from "./launchMakeMe.mjs";
import { usageMakeMeProperties } from "./usageMakeMe.mjs";
import { HostHookSettingsBuilder } from "./hostHookSettingsTestData.mjs";
import { feedbackMakeMeProperties } from "./feedbackTestData.mjs";
import { storyNoteMakeMeProperties } from "./storyNoteTestData.mjs";
import { publishedReadingMakeMeProperties } from "./publishedReadingMakeMe.mjs";
import { sessionRecordMakeMeProperties } from "./sessionRecordTestData.mjs";
import { reporterRunMakeMeProperties } from "./reporterRunMakeMe.mjs";
import { WorkspaceBuilder } from "./workspaceTestData.mjs";
import { StoryResultTreeBuilder } from "./storyResultTreeTestData.mjs";

/** @typedef {import("./publishedReadingMakeMe.mjs").BacklogEntry} BacklogEntry */
/** @typedef {import("../../../dashboard/test-support/publishedFiles.ts").PublishedRevision} PublishedRevision */
/** @typedef {Parameters<typeof import("../../src/skills/dough-execute-plan/scripts/execution-increment-publication.mjs").publishExecutionIncrement>[0]} IncrementPublication */
/** @typedef {Record<keyof Pick<IncrementPublication, "branch" | "previouslyPublishedBase" | "targetRef">, string>} IncrementPublicationFacts */
/** @typedef {Parameters<typeof import("../../src/skills/dough-execute-plan/scripts/publication-resume.mjs").resumeInterruptedPublication>[0]} PublicationResume */
/** @typedef {Record<keyof Pick<PublicationResume, "candidateSha" | "suffixBase">, string>} RetainedComparison */
/** @typedef {NonNullable<import("../../../dashboard/src/storyReviewLandedRun.ts").ReviewRunChoice["comparison"]>} PublishedComparison */
/** @typedef {import("./ciMakeMe.mjs").CiMakeMe} CiMakeMe */
/** @typedef {import("./launchMakeMe.mjs").LaunchMakeMe} LaunchMakeMe */
/** @typedef {import("./usageMakeMe.mjs").UsageMakeMe} UsageMakeMe */
/** @typedef {import("./feedbackTestData.mjs").FeedbackMakeMe} FeedbackMakeMe */
/** @typedef {import("./storyNoteTestData.mjs").StoryNoteMakeMe} StoryNoteMakeMe */
/** @typedef {import("./optionsDefinitionTestData.mjs").OptionsDefinitionMakeMe} OptionsDefinitionMakeMe */
/** @typedef {import("./projectCiSettingsTestData.mjs").ProjectCiSettingsMakeMe} ProjectCiSettingsMakeMe */
/** @typedef {import("./terminalThemeSettingTestData.mjs").TerminalThemeSettingMakeMe} TerminalThemeSettingMakeMe */
/** @typedef {import("./publicationTestData.mjs").PublishedIntegration} PublishedIntegration */
/**
 * @template {object} Facts
 * @typedef {import("./factBuilder.mjs").FactBuilder<Facts>} FactBuilder
 */

/**
 * @typedef {object} CoreMakeMe
 * @property {NativeEvidenceRecordBuilder} aNativeEvidenceRecord
 * @property {RepositoryBuilder} aRepository
 * @property {CheckoutWorkBuilder} aCheckoutWork
 * @property {ConfiguredProjectBuilder} aConfiguredProject
 * @property {FactBuilder<PublishedRevision>} aPublishedRevision
 * @property {StoryPreparationBuilder} aStoryPreparation
 * @property {ReleaseBuilder} aRelease
 * @property {DoneRecordBuilder} aDoneRecord
 * @property {FileFollowUpBuilder} aFileFollowUp
 * @property {FollowUpBuilder} aFollowUp
 * @property {IntentSettingsBuilder} intentSettings
 * @property {TestOptimizationCandidatesRecordBuilder} aTestOptimizationCandidatesRecord
 * @property {FactBuilder<import("../../../dashboard/server/storyPublishedEvidence.ts").ReviewedStory>} aReviewedStory
 * @property {FactBuilder<import("../../../dashboard/src/storyReviewFiles.ts").ReviewedFile>} aReviewedFile
 * @property {FactBuilder<IncrementPublicationFacts>} anIncrementPublication
 * @property {PublishedIntegrationBuilder} aPublishedIntegration
 * @property {FactBuilder<RetainedComparison>} aRetainedComparison
 * @property {FactBuilder<PublishedComparison>} aPublishedComparison
 * @property {PlanSliceBuilder} aPlanSlice
 * @property {SlicePlanBuilder} aSlicePlan
 * @property {HostHookSettingsBuilder} hostHookSettings
 * @property {(root: string) => WorkspaceBuilder} theWorkspace
 * @property {StoryResultTreeBuilder} aStoryResultTree
 */

/** @type {CoreMakeMe & OptionsDefinitionMakeMe & ProjectCiSettingsMakeMe & TerminalThemeSettingMakeMe & import("./storyReviewMakeMe.mjs").StoryReviewMakeMe & CiMakeMe & LaunchMakeMe & UsageMakeMe & FeedbackMakeMe & StoryNoteMakeMe & import("./projectRevisionTestData.mjs").ProjectRevisionMakeMe & import("./publishedReadingMakeMe.mjs").PublishedReadingMakeMe & import("./sessionRecordTestData.mjs").SessionRecordMakeMe & import("./reporterRunMakeMe.mjs").ReporterRunMakeMe} */
export const makeMe = Object.defineProperties(
  /** @type {CoreMakeMe & OptionsDefinitionMakeMe & ProjectCiSettingsMakeMe & TerminalThemeSettingMakeMe & import("./storyReviewMakeMe.mjs").StoryReviewMakeMe & CiMakeMe & LaunchMakeMe & UsageMakeMe & FeedbackMakeMe & StoryNoteMakeMe & import("./projectRevisionTestData.mjs").ProjectRevisionMakeMe & import("./publishedReadingMakeMe.mjs").PublishedReadingMakeMe & import("./sessionRecordTestData.mjs").SessionRecordMakeMe & import("./reporterRunMakeMe.mjs").ReporterRunMakeMe} */ ({}),
  {
    theWorkspace: {
      enumerable: true,
      value: (/** @type {string} */ root) => new WorkspaceBuilder(root),
    },
    aStoryResultTree: {
      enumerable: true,
      get() {
        return new StoryResultTreeBuilder();
      },
    },
    hostHookSettings: {
      enumerable: true,
      get() {
        return new HostHookSettingsBuilder();
      },
    },
    aNativeEvidenceRecord: {
      enumerable: true,
      get() {
        return new NativeEvidenceRecordBuilder();
      },
    },
    aRepository: {
      enumerable: true,
      get() {
        return new RepositoryBuilder();
      },
    },
    aCheckoutWork: {
      enumerable: true,
      get() {
        return new CheckoutWorkBuilder();
      },
    },
    aConfiguredProject: {
      enumerable: true,
      get() {
        return new ConfiguredProjectBuilder();
      },
    },
    aPublishedRevision: {
      enumerable: true,
      get() {
        return { with: copyFacts };
      },
    },
    aStoryPreparation: {
      enumerable: true,
      get() {
        return new StoryPreparationBuilder();
      },
    },
    aRelease: {
      enumerable: true,
      get() {
        return new ReleaseBuilder();
      },
    },
    aDoneRecord: {
      enumerable: true,
      get() {
        return new DoneRecordBuilder();
      },
    },
    aFileFollowUp: {
      enumerable: true,
      get() {
        return new FileFollowUpBuilder();
      },
    },
    aFollowUp: {
      enumerable: true,
      get() {
        return new FollowUpBuilder();
      },
    },
    intentSettings: {
      enumerable: true,
      get() {
        return new IntentSettingsBuilder();
      },
    },
    aTestOptimizationCandidatesRecord: {
      enumerable: true,
      get() {
        return new TestOptimizationCandidatesRecordBuilder();
      },
    },
    aReviewedStory: {
      enumerable: true,
      get() {
        return { with: copyFacts };
      },
    },
    aReviewedFile: {
      enumerable: true,
      get() {
        return { with: copyFacts };
      },
    },
    anIncrementPublication: {
      enumerable: true,
      get() {
        return { with: copyFacts };
      },
    },
    aPublishedIntegration: {
      enumerable: true,
      get() {
        return new PublishedIntegrationBuilder();
      },
    },
    aRetainedComparison: {
      enumerable: true,
      get() {
        return { with: copyFacts };
      },
    },
    aPublishedComparison: {
      enumerable: true,
      get() {
        return { with: copyFacts };
      },
    },
    aPlanSlice: {
      enumerable: true,
      get() {
        return new PlanSliceBuilder();
      },
    },
    aSlicePlan: {
      enumerable: true,
      get() {
        return new SlicePlanBuilder();
      },
    },
    ...optionsDefinitionMakeMeProperties(),
    ...projectCiSettingsMakeMeProperties(),
    ...terminalThemeSettingMakeMeProperties(),
    ...storyReviewMakeMeProperties(),
    ...ciMakeMeProperties(),
    ...launchMakeMeProperties(),
    ...usageMakeMeProperties(),
    ...feedbackMakeMeProperties(),
    ...storyNoteMakeMeProperties(),
    ...projectRevisionMakeMeProperties(),
    ...publishedReadingMakeMeProperties(),
    ...sessionRecordMakeMeProperties(),
    ...reporterRunMakeMeProperties(),
  },
);
