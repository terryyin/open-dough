// Frontend fixtures for Recently done board story-card nesting: published
// done records for Open Dough and the machine's observed launches those cards
// nest or leave as standalone entries.

import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { backlogApart, describedRevision } from "../describedRevisions.ts";
import {
  at,
  executed,
  placed,
  recentlyDoneNestingRecords,
  workspaceEntry,
} from "../recentlyDoneRecords.ts";
import { doneStorySessions } from "../recentlyDoneSessions.ts";
import { expect } from "./frontendApp.ts";
import {
  defaultFrontendPublishedFiles,
  frontendRevision,
} from "./frontendPublishedFixtures.ts";
import {
  putFrontendDoneRecords,
  type FrontendServiceState,
} from "./frontendServiceState.ts";

const adHocTitle = "Open Dough session";

function putQueuedBacklog(services: FrontendServiceState): void {
  const published = backlogApart(
    describedRevision(
      makeMe.aRepository
        .withRevision("queued", {
          backlog: { queued: [workspaceEntry] },
          files: defaultFrontendPublishedFiles(),
        })
        .please(),
      frontendRevision,
    ),
  );
  Object.assign(services, {
    revision: frontendRevision,
    backlog: published.backlog,
    files: { ...defaultFrontendPublishedFiles(), ...published.files },
  });
}

function storyCardLaunches(now: number): LaunchRecord[] {
  return [
    makeMe.aLaunchRecord
      .adHoc({ title: adHocTitle })
      .inClaudeSession({ sessionId: "ad-hoc-done" })
      .launchedAt(at(now, placed.adHocLaunched))
      .markedDoneAt(at(now, 30 * 60_000))
      .please(),
    makeMe.aLaunchRecord
      .executing(executed)
      .inClaudeSession({ sessionId: "newer-closed-card-session" })
      .launchedAt(at(now, placed.adHocLaunched / 2))
      .markedDoneAt(at(now, placed.adHocLaunched / 4))
      .please(),
    ...doneStorySessions(now, {
      executedDone: "0e5c2d7a-done-session-of-card-shows-avatar",
      executedOpen: "executed-open-refinement",
      lastWeek: "last-week-done-session",
      expired: "expired-retained-session",
    }),
  ];
}

// Opens the Frontend board with Open Dough's done cards and nested sessions.
export async function openFrontendStoryCardSessions(
  page: Page,
  services: FrontendServiceState,
): Promise<void> {
  const now = Date.now();
  putQueuedBacklog(services);
  putFrontendDoneRecords(
    services,
    "open-dough",
    recentlyDoneNestingRecords(now),
  );
  const launches = [...storyCardLaunches(now)].sort(
    (one, other) => Date.parse(one.launchedAt) - Date.parse(other.launchedAt),
  );
  const answer = makeMe.aMachineAnswer;
  // Closed Done rows nest without Open/actions; unavailable matches the
  // interim home's unmarked-live Claude listing for those retained records.
  for (const record of launches) {
    if (record.doneAt === undefined) answer.observingOpen(record);
    else answer.observingUnavailable(record);
  }
  services.answerMachine(answer.please());
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: /Start session in/ }),
  ).toBeVisible();
}
