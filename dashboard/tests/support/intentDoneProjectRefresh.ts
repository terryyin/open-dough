// Observation and real publication actions shared by the Done story's
// project-freshness and historical-reading journeys. Callers arrange the
// revision facts and observe the page's promised state.

import type { Page } from "@playwright/test";
import type { RevisionFacts } from "../../../tests/support/repositoryTestData.mjs";
import { writeRevisionFiles } from "../../../tests/support/repository-revision-files.mjs";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { passTimeUntilChecked } from "../autoRefreshJourney.ts";
import { untilPageReadsAnswered } from "../pageRequestNotes.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { commitAll, git } from "./storyReviewWorktree.ts";
import { push } from "./storyReviewTrunkCommits.ts";

export function recordIntentLocations(page: Page) {
  const locations: string[] = [];
  let noteFirstRequest = () => {};
  const firstRequested = new Promise<void>((resolve) => {
    noteFirstRequest = resolve;
  });
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.pathname === authenticatedReadEndpoint &&
      url.searchParams.get("intent") === "locations"
    ) {
      locations.push(url.searchParams.get("revision") ?? "");
      noteFirstRequest();
    }
  });
  return { locations, firstRequested };
}

export async function advanceDoneProject(
  page: Page,
  origin: StartOrigin,
  revision: RevisionFacts,
): Promise<string> {
  writeRevisionFiles(origin.project, revision);
  commitAll(origin.project, "planning only after the story");
  push(origin.project);
  const laterRevision = git(origin.origin, "rev-parse", "main");
  await passTimeUntilChecked(page);
  await untilPageReadsAnswered(page);
  return laterRevision;
}
