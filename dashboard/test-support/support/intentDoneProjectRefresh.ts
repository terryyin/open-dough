// Observation and real publication actions shared by the Done story's
// project-freshness and historical-reading journeys. Callers arrange the
// revision facts and observe the page's promised state.

import type { Page } from "@playwright/test";
import type { RevisionFacts } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { writeRevisionFiles } from "../../../Distribution/tests/support/repository-revision-files.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { storyReviewResultEndpoint } from "../../src/storyReviewResult.ts";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { passTimeUntilChecked } from "../autoRefreshJourney.ts";
import { untilPageReadsAnswered } from "../pageRequestNotes.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { git } from "./storyReviewWorktree.ts";
import { push } from "./storyReviewTrunkCommits.ts";

export function recordIntentLocations(page: Page) {
  const locations: string[] = [];
  let noteFirstRequest = () => {};
  const firstRequested = new Promise<void>((resolve) => {
    noteFirstRequest = resolve;
  });
  page.on("request", (request) => {
    const url = new URL(request.url());
    const revision =
      url.pathname === storyReviewResultEndpoint &&
      !url.searchParams.has("path")
        ? url.searchParams.get("completion")
        : url.pathname === authenticatedReadEndpoint &&
            url.searchParams.get("intent") === "locations"
          ? url.searchParams.get("revision")
          : null;
    if (revision !== null) {
      locations.push(revision);
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
  makeMe
    .theWorkspace(origin.project)
    .commitAll("planning only after the story")
    .please();
  push(origin.project);
  const laterRevision = git(origin.origin, "rev-parse", "main");
  await passTimeUntilChecked(page);
  await untilPageReadsAnswered(page);
  return laterRevision;
}
