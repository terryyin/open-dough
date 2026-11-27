// What a recovery journey reads of the page's read problem while a failed or
// unanswered read waits to be read again on its own: the snapshot it says is
// still shown and when that was retrieved, and when it says this page reads
// again; the controlled step of the page's clock to that time; and the
// failed revision check that starts a recovery from a shown snapshot. The
// scenario names every expected time, wait and request count.

import type { Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";
import { passTimeUntilChecked } from "./autoRefreshJourney.ts";
import { expect } from "./dashboardTest.ts";
import {
  expectSettledPage,
  parts,
  type StoryMembership,
} from "./dashboardPage.ts";
import { timeSaid } from "./limitNotice.ts";
import type { OriginAnswer } from "./originAnswers.ts";
import type { MovingOrigin } from "./publishedMovingOrigin.ts";
import { defaultRepository } from "./publishedOrigin.ts";

// What the problem says while no published work is shown: when this page
// reads it again.
export const transientRecovery = "This page reads the published work at";

// What the problem says when Git cannot read `repository`'s trunk from its
// origin: the cold open's failure the page recovers from on its own.
export const originUnreachable = (repository: string = defaultRepository) =>
  `The published trunk is unavailable: Git could not read main of ${repository} from origin.`;

// What the problem says while detail of the shown snapshot, still unread or
// withheld by the limit, is labeled where it is shown and read again later.
export const detailRecovery = "this page reads it";

// What the problem says while an earlier snapshot stays shown.
const earlierSnapshot = "What is shown is the earlier snapshot, retrieved at";

// The page's cold opens of project `source`, noted as they are sent: reads
// naming only that source, before any revision of it is known.
export function noteColdOpens(page: Page, source: string): readonly string[] {
  const opens: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.pathname === authenticatedReadEndpoint &&
      [...url.searchParams.keys()].join() === "source" &&
      url.searchParams.get("source") === source
    )
      opens.push(request.url());
  });
  return opens;
}

// The page time the problem says this page next reads on its own: the
// published work while none is shown, or detail still unread.
export const recoversAt = (page: Page): Promise<number> =>
  timeSaid(page, new RegExp(`${transientRecovery}|${detailRecovery} at`));

// The problem says once that this page reads the published work again
// `waitSeconds` after the attempt that failed at `failedMs`.
export async function expectRecoversAfter(
  page: Page,
  failedMs: number,
  waitSeconds: number,
): Promise<void> {
  expect(await timeSaid(page, transientRecovery)).toBe(
    failedMs + waitSeconds * 1_000,
  );
}

// Moves the page's paused clock to the time the problem says this page reads
// again on its own, firing what is due then.
export async function passTimeToRecovery(page: Page): Promise<void> {
  const due = await recoversAt(page);
  await page.clock.fastForward(due - (await page.evaluate(() => Date.now())));
}

// The problem says the snapshot shown is the earlier one, retrieved at
// `retrieved` (the status's retrieval time from when it was read).
export async function expectEarlierSnapshotKept(
  page: Page,
  retrieved: string,
): Promise<void> {
  const { problem } = parts(page);
  await expect(problem).toContainText(earlierSnapshot);
  await expect(
    problem.locator("p", { hasText: earlierSnapshot }).locator("time").nth(1),
  ).toHaveAttribute("datetime", retrieved);
}

// Opens the page on `titles`, then answers `main` with `answer` until the
// returned restore is called, and lets page time pass until the page's next
// revision check has failed: the problem says `failure`, and the snapshot
// opened stays shown.
export async function openThenFailCheck(
  page: Page,
  origin: Pick<MovingOrigin, "answerWith">,
  titles: StoryMembership,
  answer: OriginAnswer,
  failure: string,
): Promise<() => void> {
  await page.goto("/");
  await expectSettledPage(page, titles);
  const retrieved =
    (await parts(page).retrievedAt.getAttribute("datetime")) ?? "";
  const restore = origin.answerWith("main", answer);
  await passTimeUntilChecked(page, 502);
  await expect(parts(page).problem).toContainText(failure);
  await expectEarlierSnapshotKept(page, retrieved);
  return restore;
}
