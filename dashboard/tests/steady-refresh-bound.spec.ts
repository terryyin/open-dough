// A story the dashboard keeps showing while a new revision is read keeps its
// shown facts only for as long as that read is under way: when the read's
// wait bound gives up a record still unanswered, the story shows the gap a
// first read shows and the notice says what was read; when a hidden page lets
// go of a recovery read, the story shows what that read itself had read. The
// journey's commits and records are those of ./refreshJourney.ts and
// ./autoRefreshJourney.ts; the queue story's record is held at B. The page's
// clock is paused and advanced by the test. The carry itself:
// ./steady-refresh-carry.spec.ts.

import { expect, test } from "./dashboardTest.ts";
import { expectSettledPage, parts } from "./dashboardPage.ts";
import { inspectedDetail } from "./cardControls.ts";
import type { Page } from "@playwright/test";
import {
  contentReads,
  openSettledAtA,
  passTimeUntilChecked,
  queueStory,
  recordsAt,
  setPageVisibility,
} from "./autoRefreshJourney.ts";
import { backlogA, revisionB } from "./refreshJourney.ts";
import { givePageItsTurns } from "./pageRequestNotes.ts";
import { noConnection, type MovingOrigin } from "./publishedOrigin.ts";

const syncRecord = ".planning/seeds/SEED-008-sync.md";
const gap = "The canonical record could not be read for preparation facts.";
const unpinned = (text: string) => text.replace(/at revision [0-9a-f]{7}/g, "");

// B's membership is shown, and the held record has been asked for at B.
async function untilBShownWhileHeld(page: Page, origin: MovingOrigin) {
  await expect(parts(page).source).toContainText(revisionB);
  await expect
    .poll(() => contentReads(origin.requests))
    .toContain(`${syncRecord}?ref=${revisionB}`);
  await givePageItsTurns(page);
}

test("a story's shown facts give way to the gap when the read of its record at B is given up", async ({
  page,
}) => {
  const origin = await openSettledAtA(page);
  const { source, stages, problem } = parts(page);
  const queueCard = stages.getByRole("article", { name: queueStory });
  const detail = await inspectedDetail(queueCard);
  const atA = `${queueStory}, as published at A.`;
  await expect(detail).toContainText(atA);
  const shownAtA = await queueCard.innerText();
  origin.hold(syncRecord);
  origin.push(revisionB, backlogA, recordsAt("B"));
  await passTimeUntilChecked(page);

  await test.step("while B's read of the record is under way, the story shows what it showed at A", async () => {
    await untilBShownWhileHeld(page, origin);
    await expect(detail).toContainText(atA);
    await expect(queueCard).not.toContainText("Reading");
    await expect(queueCard).not.toContainText(gap);
    expect(unpinned(await queueCard.innerText())).toBe(unpinned(shownAtA));
  });

  await test.step("at the wait bound the story shows the preparation gap, nothing of A, and the notice says B's work was read", async () => {
    await page.clock.runFor(30_000);
    await expect(problem).toContainText(
      "GitHub did not answer within 30 seconds, so the read was given up.",
    );
    await expect(problem).toContainText(
      `after reading the published work at revision ${revisionB.slice(0, 7)}`,
    );
    await expect(queueCard).toContainText(gap);
    await expect(queueCard).not.toContainText("as published at A");
    await expect(queueCard).not.toContainText("Reading");
    await expectSettledPage(page);
    await expect(source).toContainText(revisionB);
  });
});

test("a story's shown facts give way to what the read itself read when a hidden page lets go of its recovery read of B", async ({
  page,
}) => {
  const origin = await openSettledAtA(page);
  const { source, stages, problem } = parts(page);
  const queueCard = stages.getByRole("article", { name: queueStory });
  const detail = await inspectedDetail(queueCard);
  const atA = `${queueStory}, as published at A.`;
  const restoreBacklogAtB = origin.answerWith(revisionB, noConnection);
  origin.push(revisionB, backlogA, recordsAt("B"));
  await passTimeUntilChecked(page);
  await expect(problem).toContainText("this page reads it");
  restoreBacklogAtB();
  const release = origin.hold(syncRecord);
  await page.clock.runFor(15_250);

  await test.step("while the recovery read of B is under way, the story shows what it showed at A", async () => {
    await untilBShownWhileHeld(page, origin);
    await expect(detail).toContainText(atA);
    await expect(queueCard).not.toContainText("Reading");
  });

  await test.step("once the hidden page lets go of that read, nothing of A is shown for the story", async () => {
    await setPageVisibility(page, "hidden");
    await expect(queueCard).toContainText("Reading preparation…");
    await expect(queueCard).not.toContainText("as published at A");
  });

  await test.step("seen again, the page reads B and the story shows B's facts", async () => {
    release();
    await setPageVisibility(page, "visible");
    await page.clock.runFor(1);
    await expectSettledPage(page);
    await expect(source).toContainText(revisionB);
    await expect(detail).toContainText(`${queueStory}, as published at B.`);
    await expect(page.locator("body")).not.toContainText("as published at A");
  });
});
