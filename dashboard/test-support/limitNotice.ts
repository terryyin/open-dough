// What a limited-reading journey (limited-reading-*.spec.ts) observes of the
// page's one notice while GitHub's rate limit stands, and of the time a gap
// the limit withheld names; and the times a read problem's paragraphs name,
// which recovery journeys read too.

import type { Page } from "@playwright/test";
import { browserLocaleString } from "./browserLocale.ts";
import { expect } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";

// What the page says in the notice while the limit stands, before its time.
export const limitSaid =
  "GitHub limited the rate of the local GitHub CLI's requests, so this page asks GitHub nothing until";

// The page time named by the problem's one paragraph that says `said`.
export async function timeSaid(
  page: Page,
  said: string | RegExp,
): Promise<number> {
  const notice = parts(page).problem.locator("p", { hasText: said });
  await expect(notice).toHaveCount(1);
  return Date.parse(
    (await notice.locator("time").getAttribute("datetime")) ?? "",
  );
}

// The page time the notice says reading resumes at.
export const noticedResumeTime = (page: Page) => timeSaid(page, limitSaid);

// A time this page learned from the server is the first page's `resumesAt`,
// less the real time passed since GitHub's refusal (page time stood still),
// within a second's rounding up.
export async function expectSameResumeTime(
  page: Page,
  resumesAt: number,
  refusedAt: number,
): Promise<void> {
  const shown = await noticedResumeTime(page);
  expect(shown).toBeLessThanOrEqual(resumesAt + 1_000);
  expect(shown).toBeGreaterThanOrEqual(
    resumesAt - (Date.now() - refusedAt) - 1_000,
  );
}

// The page time a failed attempt's alert says it failed at.
export async function failedAt(page: Page): Promise<number> {
  return Date.parse(
    (await parts(page)
      .problem.locator("time")
      .nth(0)
      .getAttribute("datetime")) ?? "",
  );
}

// How a gap the limit withheld says when the limit ends, in the page's
// wording of that time.
export async function limitedUntil(page: Page, at: number): Promise<string> {
  return `Limited until ${await browserLocaleString(page, at)}.`;
}
