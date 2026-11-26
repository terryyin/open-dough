// Raw publication and local-session selectors for mixed Taken membership.
// These supply only facts/selectors; the journeys perform starts and observe
// the real dashboard's entry placement, counts, focus, and persistence.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { recordsOf } from "./agentLaunchBoundary.ts";
import { githubFor } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  publishCommittedFileHistory,
  publishCommittedFiles,
} from "./committedFiles.ts";
import { describedBacklog } from "./describedRevisions.ts";
import { backlogPath } from "./publishedOrigin.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { repository, workspaceEntry } from "./recentlyDoneRecords.ts";
import { expectServedHomesReach } from "./support/fixtureOriginRoute.ts";

// The queued story of ./recentlyDoneRecords.ts, recorded in Taken instead.
const queuedStoryTaken = describedBacklog(
  makeMe.aRepository
    .withRevision("taken", { backlog: { taken: [workspaceEntry] } })
    .please(),
);

// A project stating no planning facts.
const unplannedBacklog = describedBacklog(makeMe.aRepository.please());

// The story is first Taken, then absent from the same published history.
export async function publishTakenMembership(
  page: Parameters<typeof publishCommittedFiles>[0],
  afterGitHubStops: (cleanup: () => Promise<void>) => void,
) {
  const description = makeMe.aRepository
    .withRevision("taken", { files: { [backlogPath]: queuedStoryTaken } })
    .withRevision("unplanned", { files: { [backlogPath]: unplannedBacklog } })
    .please();
  const published = await publishCommittedFileHistory(page, description, {
    repository,
    trunk: "taken",
    afterGitHubStops,
  });
  const firstRevision = published.at("taken").revision;
  expectServedHomesReach(githubFor(page), repository, firstRevision);
  return {
    firstRevision,
    publishUnplanned() {
      const unplanned = published.at("unplanned");
      published.moveTrunk(unplanned);
      expectServedHomesReach(githubFor(page), repository, unplanned.revision);
      return unplanned.revision;
    },
  };
}
// Commits the unplanned backlog and serves it at that commit.
export const publishCommittedMembership = (
  page: Parameters<typeof publishCommittedFiles>[0],
  publishedRepository = repository,
) =>
  publishCommittedFiles(page, {
    repository: publishedRepository,
    files: { [backlogPath]: unplannedBacklog },
  });
export const localEntries = (page: Parameters<typeof parts>[0]) =>
  parts(page).taken.locator(":scope > ol > li > .session-entry");
export const savedLocalSessionRecords = async (
  dashboard: Parameters<typeof recordsOf>[0],
) => (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
