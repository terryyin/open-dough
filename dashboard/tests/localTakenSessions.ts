// Raw publication and local-session selectors for mixed Taken membership.
// These supply only facts/selectors; the journeys perform starts and observe
// the real dashboard's entry placement, counts, focus, and persistence.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { recordsOf } from "./agentLaunchBoundary.ts";
import { parts } from "./dashboardPage.ts";
import { describedBacklog } from "./describedRevisions.ts";
import { backlogPath, publishFiles } from "./publishedOrigin.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";
import {
  queuedIdentity,
  queuedTitle,
  repository,
  revision,
} from "./recentlyDoneRecords.ts";

// The queued story of ./recentlyDoneRecords.ts, recorded in Taken instead.
export const queuedStoryTaken = describedBacklog(
  makeMe.aRepository
    .withRevision("taken", {
      backlog: {
        taken: [
          makeMe.aBacklogEntry
            .with({
              identity: queuedIdentity,
              title: queuedTitle,
              href: "seeds/SEED-008-worktree-branch-trunk-sync.md#planning-workspace-procedure",
            })
            .please(),
        ],
      },
    })
    .please(),
);

// Publishes the exact backlog bytes when given, or else a project stating no
// planning facts, at the shared revision unless another is given.
export const publishMembership = (
  page: Parameters<typeof publishFiles>[0],
  {
    backlog = describedBacklog(makeMe.aRepository.please()),
    at = revision,
  }: { backlog?: string; at?: string } = {},
) =>
  publishFiles(page, {
    repository,
    revision: at,
    files: { [backlogPath]: backlog },
  });
export const localEntries = (page: Parameters<typeof parts>[0]) =>
  parts(page).taken.locator(":scope > ol > li > .session-entry");
export const savedLocalSessionRecords = async (
  dashboard: Parameters<typeof recordsOf>[0],
) => (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
