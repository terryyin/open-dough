// Done stories are a later detail of the published read: a slow or stalled
// done-record read never holds back or fails the Taken cards' owners,
// preparation, and slice clocks. Done cards fill in when their read answers;
// a read still unanswered at the wait bound is the Recently done column's
// gap, not the project's read problem. The fake GitHub only publishes the
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
  doneRecordAt,
  executed,
  removedQueued,
} from "./recentlyDoneRecords.ts";
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
  await keepLaunchRecords(
    dashboard,
    sessionsOutsideDoneStories(dashboard, opened.getTime()),
  );
  await pausePageClockAt(page, opened);
  const published = publishes({
    revision,
    files: { ...files, ...doneRecords },
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
    problem,
    release,
  };
}

test("a slow done-record read never holds back a Taken card's owner, preparation, or clock, and done cards fill in when it answers", async ({
  page,
  dashboard,
}) => {
  const { card, recent, problem, release } = await openedWithHeldDoneRecord(
    page,
    dashboard,
  );

  await test.step("while a done record's read is held, the Taken card shows its owner, preparation, and clock, and no done card shows", async () => {
    await expect(card.locator(".owner-line")).toContainText(
      "Akiho-chan · Fixture Committer · Claude Code",
    );
    await expect(
      card.getByRole("img", { name: "1 of 2 slices recorded complete" }),
    ).toBeVisible();
    await expect(card).toContainText("Current slice started 12 min ago");
    await expect(recent.locator(".done-story")).toHaveCount(0);
  });

  await test.step("the record's answer shows the done cards, with no read problem", async () => {
    release();
    await expectEntries(recent, [
      adHocEntry,
      executed.title,
      queuedEntry,
      removedQueued.title,
    ]);
    await expect(card).toContainText("Current slice started 12 min ago");
    await expect(problem).toHaveCount(0);
  });
});

test("a done-record read still unanswered at the wait bound is the Recently done column's gap, not the project's read problem", async ({
  page,
  dashboard,
}) => {
  const { card, recent, problem } = await openedWithHeldDoneRecord(
    page,
    dashboard,
  );
  await expect(card).toContainText("Current slice started 12 min ago");
  await page.clock.runFor(30_000);
  await expect(recent).toContainText(
    "Done stories could not be read. GitHub did not answer within 30 seconds while reading the done records.",
  );
  await expectEntries(recent, [adHocEntry, queuedEntry]);
  await expect(card.locator(".owner-line")).toContainText(
    "Akiho-chan · Fixture Committer · Claude Code",
  );
  await expect(card).toContainText("Current slice started 12 min ago");
  await expect(problem).toHaveCount(0);
});
