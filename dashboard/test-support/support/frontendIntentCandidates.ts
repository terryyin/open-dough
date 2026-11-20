// Published candidate records with their selected sources for whole-app
// Intent candidate reading. Location selection mirrors each project's
// configured locations; selection judgment itself belongs to Backend.
import type { Page } from "@playwright/test";
import type { CatalogPublication } from "../catalogProjectRecords.ts";
import type { IntentSettings } from "../../../Distribution/tests/support/intentLocationTestData.mjs";
import {
  putFrontendCandidates,
  type FrontendServiceState,
} from "./frontendServiceState.ts";
import {
  locationsSelectingUnder,
  putFrontendIntentSources,
} from "./frontendIntentSources.ts";
import { answerFrontendIntentCi } from "./frontendIntentCi.ts";
import type { IntentCandidatesAnswer } from "../../server/intentCandidatesRead.ts";
import { preholdRevisionStreamSlots } from "./revisionStreamSlots.ts";
import { testOptimizationCandidatesPath } from "../../src/testOptimizationCandidatesPath.ts";
import {
  browseSpec,
  doughnut,
  openDough,
  openDoughSettings,
  pygardon,
  pygardonSettings,
} from "../intentCodeBrowseFixtures.ts";
import {
  openDoughCaseLineRecord,
  openDoughCaseLineSource,
  openDoughCandidatesRecord,
  openDoughSources,
  openDoughSpecPaths,
} from "../intentCandidatesFixtures.ts";
import {
  doughnutCandidatesRecord,
  doughnutFeaturePath,
  doughnutFeatureSettings,
  pygardonCandidatesRecord,
  pygardonClipPath,
  pygardonClipSource,
  pygardonGherkinOnlySettings,
} from "../intentCandidatesOtherProjectFixtures.ts";
import {
  doughnutCaseCandidatesRecord,
  doughnutCaseFeaturePath,
  doughnutCaseFeatureSource,
} from "../intentCandidatesCasePositionFixtures.ts";

// The record among `project`'s published `files`, or `null` when absent.
const candidatesAnswer = (
  project: CatalogPublication,
  files: Readonly<Record<string, string>>,
): IntentCandidatesAnswer => ({
  revision: project.revision,
  candidates: files[testOptimizationCandidatesPath] ?? null,
});

export async function prepareFrontendCandidates(
  page: Page,
  services: FrontendServiceState,
  project: CatalogPublication,
  settings: IntentSettings,
  files: Readonly<Record<string, string>>,
): Promise<void> {
  putFrontendIntentSources(
    services,
    project,
    locationsSelectingUnder(settings, Object.keys(files)),
    files,
  );
  putFrontendCandidates(services, candidatesAnswer(project, files));
  await preholdRevisionStreamSlots(page);
  await answerFrontendIntentCi(page, project.revision);
}

export const prepareOpenDoughCandidates = (
  page: Page,
  services: FrontendServiceState,
  record: string = openDoughCandidatesRecord,
) =>
  prepareFrontendCandidates(page, services, openDough, openDoughSettings, {
    ...openDoughSources,
    [testOptimizationCandidatesPath]: record,
  });

export const prepareOpenDoughCaseLine = (
  page: Page,
  services: FrontendServiceState,
) =>
  prepareFrontendCandidates(page, services, openDough, openDoughSettings, {
    ...openDoughSources,
    [testOptimizationCandidatesPath]: openDoughCaseLineRecord,
    [openDoughSpecPaths.caseLine]: openDoughCaseLineSource,
  });

export const prepareDoughnutCandidates = (
  page: Page,
  services: FrontendServiceState,
  record: string = doughnutCandidatesRecord,
) =>
  prepareFrontendCandidates(page, services, doughnut, doughnutFeatureSettings, {
    [testOptimizationCandidatesPath]: record,
    [doughnutFeaturePath]:
      "Feature: notebook LFS\n  Scenario: cold start\n    Given a notebook\n",
  });

export const prepareDoughnutCasePosition = (
  page: Page,
  services: FrontendServiceState,
) =>
  prepareFrontendCandidates(page, services, doughnut, doughnutFeatureSettings, {
    [testOptimizationCandidatesPath]: doughnutCaseCandidatesRecord,
    [doughnutCaseFeaturePath]: doughnutCaseFeatureSource,
  });

const pygardonFiles = {
  [testOptimizationCandidatesPath]: pygardonCandidatesRecord,
  [pygardonClipPath]: pygardonClipSource,
  "frontend/src/devices.spec.ts": browseSpec,
};

export const preparePygardonCandidates = (
  page: Page,
  services: FrontendServiceState,
  configured: "tests configured" | "gherkin only",
) =>
  prepareFrontendCandidates(
    page,
    services,
    pygardon,
    configured === "tests configured"
      ? pygardonSettings
      : pygardonGherkinOnlySettings,
    pygardonFiles,
  );
