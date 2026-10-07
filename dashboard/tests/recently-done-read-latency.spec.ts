// Done stories are a later detail of the published read: a slow or stalled
// done-record read never holds back or fails the Taken cards' owners,
// preparation, and slice clocks. The done catalog places each done story,
// with this machine's sessions for it, before its record is read; its card
// fills in when that read answers. A read still unanswered at the wait bound
// is the Recently done column's gap, not the project's read problem, and the
// story keeps its place and its sessions. The fake GitHub only publishes the
// slice clock records (sliceClockRecords.ts) with two done records spelled by
// the shared done-record renderer, holding one record's content read; the
// synthetic `claude` lists this machine's sessions; the page clock is paused,
// and the local read boundary and the page decide everything shown.

import type { Page } from "@playwright/test";
import { renderDoneRecord } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { expect, githubFor, pausePageClockAt, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { publishes } from "./support/fakeGitHub.ts";
import type { GhRequest } from "./support/ghRequest.ts";
import { holdingAnswer } from "./support/heldGitHubAnswer.ts";
import { keepLaunchRecords } from "./support/storyLaunchRecord.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import {
  afterTake,
  committed,
  files,
  history,
  opened,
  repository,
  revision,
  stories,
} from "./sliceClockRecords.ts";
import {
  doneDirectory,
  doneRecordAt,
  executed,
  removedQueued,
} from "./recentlyDoneRecords.ts";
import { withDoneCatalog } from "./doneCatalogAnswers.ts";
import {
  adHocEntry,
  expectEntries,
  queuedEntry,
  sessionsOutsideDoneStories,
} from "./recentlyDoneColumn.ts";

const hour = 60 * 60_000;
// The done record whose content read GitHub answers only once released.
const heldRecord = doneRecordAt(executed.identity);
const isHeld = (request: GhRequest) =>
  request.kind === "content" && request.path === heldRecord;
const doneRecords = {
  [heldRecord]: renderDoneRecord({
    ...executed,
    completedAt: new Date(opened.getTime() - 2 * hour).toISOString(),
    developer: "Terry Yin",
  }),
  [doneRecordAt(removedQueued.identity)]: renderDoneRecord({
    ...removedQueued,
    completedAt: new Date(opened.getTime() - 24 * hour).toISOString(),
    developer: "Terry Yin",
  }),
};

async function openedWithHeldDoneRecord(
  page: Page,
  dashboard: DashboardServer,
) {
  const closedId = dashboard.claudeListsSession({
    name: executed.title,
    cwd: dashboard.home,
    startedAt: opened.getTime() - 4 * hour,
  });
  await keepLaunchRecords(dashboard, [
    ...sessionsOutsideDoneStories(dashboard, opened.getTime(), {
      adHoc: true,
      queued: true,
    }),
    {
      request: {
        source: "open-dough",
        workflow: "execution",
        host: "claude",
        ...executed,
      },
      session: {
        host: "claude",
        sessionId: closedId,
        shortId: closedId.slice(0, 8),
        name: executed.title,
      },
      launchedAt: new Date(opened.getTime() - 4 * hour).toISOString(),
      doneAt: new Date(opened.getTime() - hour).toISOString(),
    },
  ]);
  await pausePageClockAt(page, opened);
  const published = publishes({
    revision,
    files: withDoneCatalog({ ...files, ...doneRecords }, doneDirectory),
    committed,
    history,
  });
  const { answer, release } = holdingAnswer(published, isHeld);
  const github = githubFor(page);
  github.serve(repository, answer);
  await page.goto("/");
  await expectMembership(page, {
    taken: stories.map(({ title }) => title),
    backlog: [],
  });
  // The held done record's read has reached GitHub through the local `gh`.
  await expect
    .poll(() => github.calls.some(({ request }) => isHeld(request)))
    .toBe(true);
  const { taken, recentlyDone, problem } = parts(page);
  return {
    card: taken.getByRole("article", { name: afterTake }),
    recent: recentlyDone,
    closed: recentlyDone.locator(`[data-shows-session="claude:${closedId}"]`),
    problem,
    release,
  };
}

test("a slow done-record read never holds back a Taken card's owner, preparation, or clock, and done cards fill in when it answers", async ({
  page,
  dashboard,
}) => {
  const { card, recent, closed, problem, release } =
    await openedWithHeldDoneRecord(page, dashboard);

  await test.step("while a done record's read is held, the Taken card shows its owner, preparation, and clock, and each done story holds its place and sessions under its identity", async () => {
    await expect(card.locator(".owner-line")).toContainText(
      "Akiho-chan · Fixture Committer · Claude Code",
    );
    await expect(
      card.getByRole("img", { name: "1 of 2 slices recorded complete" }),
    ).toBeVisible();
    await expect(card).toContainText("Current slice started 12 min ago");
    await expectEntries(recent, [
      adHocEntry,
      executed.identity,
      queuedEntry,
      removedQueued.identity,
    ]);
    await expect(
      recent.getByRole("article", { name: executed.identity }),
    ).toContainText("Reading done story…");
    await expect(recent.locator(".stage-count")).toHaveText("4 entries");
    await expect(closed).toHaveCount(1);
    await expect(
      recent
        .getByRole("article", { name: executed.identity })
        .locator(".session-entry"),
    ).toHaveCount(1);
    await expect(
      closed.getByRole("button", { name: "Open terminal" }),
    ).toBeEnabled();
  });

  await test.step("the record's answer shows the done cards, with no read problem", async () => {
    release();
    await expectEntries(recent, [
      adHocEntry,
      executed.title,
      queuedEntry,
      removedQueued.title,
    ]);
    await expect(closed).toHaveCount(1);
    await expect(
      recent
        .locator(".done-story")
        .filter({ hasText: executed.title })
        .locator(".session-entry"),
    ).toHaveCount(1);
    await expect(card).toContainText("Current slice started 12 min ago");
    await expect(problem).toHaveCount(0);
  });
});

test("a done-record read still unanswered at the wait bound is the Recently done column's gap, not the project's read problem", async ({
  page,
  dashboard,
}) => {
  const { card, recent, closed, problem } = await openedWithHeldDoneRecord(
    page,
    dashboard,
  );
  await expect(card).toContainText("Current slice started 12 min ago");
  await page.clock.runFor(30_000);
  await expect(recent).toContainText(
    "Done stories could not be read. GitHub did not answer within 30 seconds while reading the done records.",
  );
  await expect(
    recent.getByRole("button", { name: "Retry done stories" }),
  ).toBeVisible();
  await expectEntries(recent, [
    adHocEntry,
    executed.identity,
    queuedEntry,
    removedQueued.identity,
  ]);
  const unread = recent.getByRole("article", { name: executed.identity });
  await expect(unread).toContainText("This done story could not be read.");
  await expect(unread.locator(".session-entry")).toHaveCount(1);
  await expect(
    closed.getByRole("button", { name: "Open terminal" }),
  ).toBeEnabled();
  await expect(card.locator(".owner-line")).toContainText(
    "Akiho-chan · Fixture Committer · Claude Code",
  );
  await expect(card).toContainText("Current slice started 12 min ago");
  await expect(problem).toHaveCount(0);
});
