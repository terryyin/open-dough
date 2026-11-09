import type { Page } from "@playwright/test";
import { historyOf, openProjectCiStatus } from "../intentCiHistoryPage.ts";
import {
  judged,
  publishProject,
  runUrl,
  trunkCi,
} from "../intentCiStatusPage.ts";
import { openDough } from "../intentCodeBrowseFixtures.ts";

// Trunk's judged CI, published, and Project Intent's CI status opened on it.
export async function openCiStatus(page: Page) {
  publishProject(page, openDough).serveCi(
    trunkCi(openDough.revision, () => [
      {
        headSha: judged,
        conclusion: "success",
        url: runUrl,
        id: 41,
        startedAt: "2026-11-05T10:00:00Z",
        completedAt: "2026-11-05T10:03:00Z",
      },
    ]),
  );
  return historyOf(await openProjectCiStatus(page));
}
