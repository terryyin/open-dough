// Raw publication and local-session selectors for mixed Taken membership.
// These supply only facts/selectors; the journeys perform starts and observe
// the real dashboard's entry placement, counts, focus, and persistence.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { recordsOf } from "./agentLaunchBoundary.ts";
import { parts } from "./dashboardPage.ts";
import { emptyBacklog, publishFiles } from "./publishedOrigin.ts";
import { repository, revision } from "./recentlyDoneRecords.ts";

export const publishMembership = (
  page: Parameters<typeof publishFiles>[0],
  backlog = emptyBacklog,
) =>
  publishFiles(page, {
    repository,
    revision,
    files: { ".planning/PRODUCT-BACKLOG.md": backlog },
  });
export const localEntries = (page: Parameters<typeof parts>[0]) =>
  parts(page).taken.locator(":scope > ol > li > .session-entry");
export const savedLocalSessionRecords = async (
  dashboard: Parameters<typeof recordsOf>[0],
) => (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
