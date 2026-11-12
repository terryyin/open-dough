// Observe canonical-only association through the browser after CLI records and
// committed Git bytes cross the local authenticated read boundary.
import { execFileSync } from "node:child_process";
import { expect, type Locator, type Page } from "@playwright/test";
import {
  plannedBlocked,
  plannedReady,
  planBlockedPath,
  planReadyPath,
  type ReadinessRepo,
} from "./storyReadinessFixture.ts";
import {
  canonicalRecord,
  focusCanonicalRecord,
  hideDetail,
  inspectedDetail,
  storyCard,
} from "./storyCardControls.ts";
import { expectBadges } from "./storyCardFacts.ts";

export function planHref(
  repository: string,
  revision: string,
  path = planBlockedPath,
) {
  return `https://github.com/${repository}/blob/${revision}/.planning/${path}`;
}

export async function expectQueuedPlanStoryCardAndDetail(
  backlog: Locator,
  repository: string,
  repo: ReadinessRepo,
  readCount: () => number,
) {
  const card = storyCard(backlog, plannedBlocked.title);
  await expectBadges(card, { shown: ["Not ready"] });
  // The scan view offers no link; Inspect story reveals them without a read.
  await expect(card.getByRole("link")).toHaveCount(0);
  const reads = readCount();
  const detail = await inspectedDetail(card);
  const plan = detail.getByRole("link", { name: /^Slice plan / });
  await expect(plan).toHaveCount(1);
  await expect(plan).toHaveAttribute(
    "href",
    planHref(repository, repo.revision),
  );
  await expect(canonicalRecord(detail)).toHaveAttribute(
    "href",
    `https://github.com/${repository}/blob/${repo.revision}/.planning/${plannedBlocked.href}`,
  );
  expect(readCount()).toBe(reads);
  await hideDetail(card);
  await expect(card).toBeFocused();
  await expect(card.getByRole("link")).toHaveCount(0);
}

export async function expectPlanKeyboardDestination(
  page: Page,
  backlog: Locator,
  repo: ReadinessRepo,
) {
  const status = () =>
    execFileSync("git", ["-C", repo.directory, "status", "--porcelain=v1"], {
      encoding: "utf8",
    });
  const before = status();
  const destination = planHref("terryyin/open-dough", repo.revision);
  await page.context().route(destination, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<h1>Published blocked slice plan</h1>",
    }),
  );
  const card = storyCard(backlog, plannedBlocked.title);
  await focusCanonicalRecord(card);
  await page.keyboard.press("Tab");
  await expect(card.getByRole("link", { name: /^Slice plan / })).toBeFocused();
  const [popup] = await Promise.all([
    page.waitForEvent("popup"),
    page.keyboard.press("Enter"),
  ]);
  await expect(popup).toHaveURL(destination);
  await expect(
    popup.getByRole("heading", { name: "Published blocked slice plan" }),
  ).toBeVisible();
  await popup.close();
  expect(status()).toBe(before);
}

export async function expectAgreeingFragment(
  taken: Locator,
  repository: string,
  revision: string,
) {
  const card = storyCard(taken, plannedReady.title);
  const plan = card.getByRole("link", { name: /^Slice plan / });
  await inspectedDetail(card);
  await expect(plan).toHaveCount(1);
  await expect(plan).toHaveAttribute(
    "href",
    `${planHref(repository, revision, planReadyPath)}#ordered-slices`,
  );
  await expectBadges(card, { absent: ["Plan association conflict"] });
  await hideDetail(card);
  await expect(card).toBeFocused();
}
