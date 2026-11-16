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
  queuedIdentity,
  queuedTitle,
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

// Active story owns its open session beside a matching done card's closed one.
export async function openFrontendActiveStorySessions(
  page: Page,
  services: FrontendServiceState,
): Promise<{
  readonly openKey: string;
  readonly closedKey: string;
}> {
  const now = Date.now();
  const openId = "queued-open-execution";
  const closedId = "99999999-aaaa-bbbb-cccc-000000000009";
  putQueuedBacklog(services);
  putFrontendDoneRecords(services, "open-dough", [
    makeMe.aDoneRecord
      .with({
        identity: queuedIdentity,
        title: queuedTitle,
        completedAt: at(now, placed.executedDone),
        developer: "Terry Yin",
      })
      .please(),
  ]);
  const closed = makeMe.aLaunchRecord
    .refining({ identity: queuedIdentity, title: queuedTitle })
    .inClaudeSession({ sessionId: closedId })
    .launchedAt(at(now, placed.executedDoneSessionLaunched))
    .markedDoneAt(at(now, placed.executedDoneSessionMarked))
    .please();
  const open = makeMe.aLaunchRecord
    .executing({ identity: queuedIdentity, title: queuedTitle })
    .inClaudeSession({ sessionId: openId })
    .launchedAt(at(now, placed.queuedLaunched))
    .please();
  const adHoc = makeMe.aLaunchRecord
    .adHoc({ title: adHocTitle })
    .inClaudeSession({ sessionId: "ad-hoc-done-active" })
    .launchedAt(at(now, placed.adHocLaunched))
    .markedDoneAt(at(now, 30 * 60_000))
    .please();
  services.answerMachine(
    makeMe.aMachineAnswer
      .observingDone(closed)
      .observingOpen(open)
      .observingDone(adHoc)
      .please(),
  );
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: /Start session in/ }),
  ).toBeVisible();
  return {
    openKey: `claude:${openId}`,
    closedKey: `claude:${closedId}`,
  };
}
