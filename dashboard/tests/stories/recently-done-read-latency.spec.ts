// A held done record leaves Taken facts readable and keeps the done card's
// place. The wait bound distinguishes a record read from a catalog read.
import { expect, test } from "../dashboardTest.ts";
import {
  adHocEntry,
  expectEntries,
  queuedEntry,
} from "../recentlyDoneColumn.ts";
import { executed, removedQueued } from "../recentlyDoneRecords.ts";
import {
  isHeldCatalog,
  openedWithHeldDoneRecord,
} from "./recentlyDoneReadLatencyFixture.ts";
import { openTerminalOf, sessionEntriesIn } from "../dashboardPage.ts";

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
    await expect(recent.locator(".column-count")).toHaveText("4 entries");
    await expect(closed).toHaveCount(1);
    await expect(
      sessionEntriesIn(
        recent.getByRole("article", { name: executed.identity }),
      ),
    ).toHaveCount(1);
    await expect(openTerminalOf(closed)).toBeEnabled();
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
      sessionEntriesIn(
        recent.locator(".done-story").filter({ hasText: executed.title }),
      ),
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
  await expect(sessionEntriesIn(unread)).toHaveCount(1);
  await expect(openTerminalOf(closed)).toBeEnabled();
  await expect(card.locator(".owner-line")).toContainText(
    "Akiho-chan · Fixture Committer · Claude Code",
  );
  await expect(card).toContainText("Current slice started 12 min ago");
  // The record was read for the entries shown; its retry asks it again.
  await expect(problem).toHaveCount(0);
});

test("a done catalog read still unanswered at the wait bound is the Recently done column's gap, with detail recovery scheduled", async ({
  page,
  dashboard,
}) => {
  const { card, recent, closed, problem } = await openedWithHeldDoneRecord(
    page,
    dashboard,
    isHeldCatalog,
  );
  await expect(card).toContainText("Current slice started 12 min ago");
  await page.clock.runFor(30_000);
  await expect(recent).toContainText(
    "Done stories could not be read. GitHub did not answer within 30 seconds while reading the done catalog.",
  );
  await expect(openTerminalOf(closed)).toBeEnabled();
  await expect(card.locator(".owner-line")).toContainText(
    "Akiho-chan · Fixture Committer · Claude Code",
  );
  await expect(card).toContainText("Current slice started 12 min ago");
  // Bound interruption is eligible for same-revision detail recovery; the
  // observation did not fail membership — only unanswered detail is pending.
  await expect(problem).toContainText("Reading unanswered detail again");
  await expect(problem).not.toContainText("Published work could not be read");
});
