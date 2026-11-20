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
import { openDough, openDoughSettings } from "../intentCodeBrowseFixtures.ts";
import {
  openDoughCandidatesRecord,
  openDoughSources,
} from "../intentCandidatesFixtures.ts";

// The record among `project`'s published `files`, or `null` when absent.
const candidatesAnswer = (
  project: CatalogPublication,
  files: Readonly<Record<string, string>>,
): IntentCandidatesAnswer => ({
  revision: project.revision,
  candidates: files[testOptimizationCandidatesPath] ?? null,
});

async function prepareFrontendCandidates(
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
