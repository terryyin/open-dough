// Projects with their own publications as frontend substitute answers: a
// listed source's reads answer its own published backlog and files at its own
// revision (./frontendIntentRevisionAnswers.ts), with no intent locations
// configured. The catalog projects (../catalogProjectRecords.ts) are listed
// this way together.

import type { Page } from "@playwright/test";
import {
  catalogPublications,
  type CatalogPublication,
} from "../catalogProjectRecords.ts";
import { installFrontendIntentRevisionAnswers } from "./frontendIntentRevisionAnswers.ts";
import type { FrontendServiceState } from "./frontendServiceState.ts";

// Lists `publications` after the listed projects, each answering its own.
export async function answerOwnPublications(
  page: Page,
  services: FrontendServiceState,
  publications: readonly CatalogPublication[],
): Promise<void> {
  const answers = await installFrontendIntentRevisionAnswers(page, services);
  for (const project of publications) {
    answers.publish({
      project,
      locations: { revision: project.revision, locations: null },
      files: {},
    });
  }
}

// Lists the catalog projects only, each answering its own publication.
export async function answerCatalogProjects(
  page: Page,
  services: FrontendServiceState,
): Promise<void> {
  Object.assign(services, { projects: [] });
  await answerOwnPublications(
    page,
    services,
    Object.values(catalogPublications),
  );
}
