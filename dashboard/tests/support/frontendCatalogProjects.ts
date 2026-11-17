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

// Lists `publications` after the listed projects, each answering its own; a
// later `publish` moves a project to its newly published revision.
export async function answerOwnPublications(
  page: Page,
  services: FrontendServiceState,
  publications: readonly CatalogPublication[],
) {
  const answers = await installFrontendIntentRevisionAnswers(page, services);
  const publish = (project: CatalogPublication) => {
    answers.publish({
      project,
      locations: { revision: project.revision, locations: null },
      files: {},
    });
  };
  publications.forEach(publish);
  return { publish };
}

// Lists `publications` only, each answering its own.
export async function answerOnlyPublications(
  page: Page,
  services: FrontendServiceState,
  publications: readonly CatalogPublication[],
) {
  Object.assign(services, { projects: [] });
  return answerOwnPublications(page, services, publications);
}

// Lists the catalog projects only, each answering its own publication.
export async function answerCatalogProjects(
  page: Page,
  services: FrontendServiceState,
): Promise<void> {
  await answerOnlyPublications(
    page,
    services,
    Object.values(catalogPublications),
  );
}
