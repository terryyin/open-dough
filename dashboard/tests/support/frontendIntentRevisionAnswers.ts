// Immutable published source answers for revision and cross-project journeys.
// Each source owns its head; historical locations and file text stay revision-keyed.
import type { Page } from "@playwright/test";
import type { CatalogPublication } from "../catalogProjectRecords.ts";
import type { IntentLocationsAnswer } from "../../server/intentLocationsRead.ts";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { answerAuthenticatedRead } from "./frontendAuthenticatedReadSubstitute.ts";
import type { FrontendServiceState } from "./frontendServiceState.ts";
import { fulfillJson } from "./frontendSubstituteAnswers.ts";

type Publication = {
  readonly project: CatalogPublication;
  readonly locations: IntentLocationsAnswer;
  readonly files: Readonly<Record<string, string>>;
};

export async function installFrontendIntentRevisionAnswers(
  page: Page,
  services: FrontendServiceState,
) {
  const snapshots = new Map<string, Omit<Publication, "project">>();
  const heads = new Map<string, string>();
  const key = (source: string, revision: string) => `${source}@${revision}`;
  await page.route(
    (url) => url.pathname === authenticatedReadEndpoint,
    async (route) => {
      const params = new URL(route.request().url()).searchParams;
      const source = params.get("source") ?? "open-dough";
      const head = heads.get(source);
      if (head === undefined || params.get("intent")?.startsWith("ci-")) {
        await route.fallback();
        return;
      }
      const revision = params.get("revision") ?? head;
      const snapshot = snapshots.get(key(source, revision));
      if (snapshot === undefined) {
        await fulfillJson(
          route,
          { error: `Unknown ${source}@${revision}` },
          404,
        );
        return;
      }
      const answer = answerAuthenticatedRead(
        {
          ...services,
          revision: head,
          files: { ...snapshot.files },
          backlog: snapshot.files[".planning/PRODUCT-BACKLOG.md"] ?? "",
          locations: snapshot.locations,
        },
        params,
      );
      if (answer.stream)
        throw new Error("Frontend revision journeys must prehold stream slots");
      await fulfillJson(route, answer.body, answer.status);
    },
  );
  return {
    publish({ project, locations, files }: Publication) {
      snapshots.set(key(project.id, project.revision), {
        locations: structuredClone(locations),
        files: { ...project.files, ...files },
      });
      heads.set(project.id, project.revision);
      Object.assign(services, {
        projects: [
          ...services.projects.filter(({ id }) => id !== project.id),
          project,
        ],
      });
    },
  };
}
