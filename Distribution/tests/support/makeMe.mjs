// @ts-check
import { AgentProfileBuilder } from "./agentProfileTestData.mjs";
import { DoneRecordBuilder } from "./doneRecordTestData.mjs";
import { copyFacts } from "./factBuilder.mjs";
import { PublishedSourceBuilder } from "./publishedSourceTestData.mjs";
import { StoryPreparationBuilder } from "./storyPreparationTestData.mjs";
import {
  IntentLocationBuilder,
  IntentSettingsBuilder,
} from "./intentLocationTestData.mjs";
import { optionsDefinitionMakeMeProperties } from "./optionsDefinitionTestData.mjs";
import { ConfiguredProjectBuilder } from "./projectConfigurationTestData.mjs";
import { projectCiSettingsMakeMeProperties } from "./projectCiSettingsTestData.mjs";
import { ReleaseBuilder } from "./releaseTestData.mjs";
import { RepositoryBuilder } from "./repositoryTestData.mjs";
import { PlanSliceBuilder, SlicePlanBuilder } from "./slicePlanTestData.mjs";
import { supplierAgreementBuilder } from "./supplierAgreementTestData.mjs";
import { terminalThemeSettingMakeMeProperties } from "./terminalThemeSettingTestData.mjs";
import { TestOptimizationCandidatesRecordBuilder } from "./testOptimizationCandidatesTestData.mjs";
import { NativeEvidenceRecordBuilder } from "./nativeEvidenceTestData.mjs";
import { PublishedIntegrationBuilder } from "./publicationTestData.mjs";
import { ciMakeMeProperties } from "./ciMakeMe.mjs";
import { launchMakeMeProperties } from "./launchMakeMe.mjs";
import { HostHookSettingsBuilder } from "./hostHookSettingsTestData.mjs";
import { feedbackMakeMeProperties } from "./feedbackTestData.mjs";
import { jobDurations } from "./jobDurationTestData.mjs";
import { HeldExecutionBuilder } from "./heldExecutionTestData.mjs";
/** @typedef {Parameters<typeof import("../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs").renderEntry>[0]} BacklogEntry */
/** @typedef {import("../../../dashboard/tests/publishedFiles.ts").PublishedRevision} PublishedRevision */
/** @typedef {Parameters<typeof import("../../src/skills/dough-execute-plan/scripts/execution-increment-publication.mjs").publishExecutionIncrement>[0]} IncrementPublication */
/** @typedef {Record<keyof Pick<IncrementPublication, "branch" | "previouslyPublishedBase" | "targetRef">, string>} IncrementPublicationFacts */
/** @typedef {Parameters<typeof import("../../src/skills/dough-execute-plan/scripts/publication-resume.mjs").resumeInterruptedPublication>[0]} PublicationResume */
/** @typedef {Record<keyof Pick<PublicationResume, "candidateSha" | "suffixBase">, string>} RetainedComparison */
/** @typedef {NonNullable<import("../../../dashboard/src/storyReviewLandedRun.ts").ReviewRunChoice["comparison"]>} PublishedComparison */
/** @typedef {import("./ciMakeMe.mjs").CiMakeMe} CiMakeMe */
/** @typedef {import("./launchMakeMe.mjs").LaunchMakeMe} LaunchMakeMe */
/** @typedef {import("./feedbackTestData.mjs").FeedbackMakeMe} FeedbackMakeMe */
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
 * @property {AgentProfileBuilder} anAgentProfile
 * @property {FactBuilder<BacklogEntry>} aBacklogEntry
 * @property {PublishedSourceBuilder} aPublishedSource
 * @property {ConfiguredProjectBuilder} aConfiguredProject
 * @property {FactBuilder<PublishedRevision>} aPublishedRevision
 * @property {StoryPreparationBuilder} aStoryPreparation
 * @property {typeof supplierAgreementBuilder} aSupplierAgreement
 * @property {ReleaseBuilder} aRelease
 * @property {DoneRecordBuilder} aDoneRecord
 * @property {IntentLocationBuilder} anIntentLocation
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
 * @property {{ with: typeof jobDurations }} jobDurations
 * @property {HeldExecutionBuilder} aHeldExecution
 */

/** @type {CoreMakeMe & OptionsDefinitionMakeMe & ProjectCiSettingsMakeMe & TerminalThemeSettingMakeMe & CiMakeMe & LaunchMakeMe & FeedbackMakeMe} */
export const makeMe = Object.defineProperties(
  /** @type {CoreMakeMe & OptionsDefinitionMakeMe & ProjectCiSettingsMakeMe & TerminalThemeSettingMakeMe & CiMakeMe & LaunchMakeMe & FeedbackMakeMe} */ ({}),
  {
    aHeldExecution: {
      enumerable: true,
      get() {
        return new HeldExecutionBuilder();
      },
    },
    jobDurations: {
      enumerable: true,
      get() {
        return { with: jobDurations };
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
    anAgentProfile: {
      enumerable: true,
      get() {
        return new AgentProfileBuilder();
      },
    },
    aBacklogEntry: {
      enumerable: true,
      get() {
        return { with: copyFacts };
      },
    },
    aPublishedSource: {
      enumerable: true,
      get() {
        return new PublishedSourceBuilder();
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
    aSupplierAgreement: {
      enumerable: true,
      get() {
        return supplierAgreementBuilder;
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
    anIntentLocation: {
      enumerable: true,
      get() {
        return new IntentLocationBuilder();
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
    ...ciMakeMeProperties(),
    ...launchMakeMeProperties(),
    ...feedbackMakeMeProperties(),
  },
);
