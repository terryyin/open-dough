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

export function planHref(
  repository: string,
  revision: string,
  path = planBlockedPath,
) {
  return `https://github.com/${repository}/blob/${revision}/.planning/${path}`;
}

export async function expectQueuedPlanCardAndDetail(
  backlog: Locator,
  repository: string,
  repo: ReadinessRepo,
  readCount: () => number,
) {
  const card = backlog.getByRole("article", { name: plannedBlocked.title });
  await expect(card.getByText("Not ready", { exact: true })).toBeVisible();
  const plan = card.getByRole("link", { name: /^Slice plan / });
  await expect(plan).toHaveCount(1);
  await expect(plan).toHaveAttribute(
    "href",
    planHref(repository, repo.revision),
  );
  await expect(
    card.getByRole("link", { name: /^Canonical record / }),
  ).toHaveAttribute(
    "href",
    `https://github.com/${repository}/blob/${repo.revision}/.planning/${plannedBlocked.link}`,
  );
  const reads = readCount();
  await card.getByRole("button", { name: "Inspect story" }).click();
  const detail = card.getByRole("region", {
    name: `Detail for ${plannedBlocked.title}`,
  });
  await expect(detail.getByRole("link", { name: /^Slice plan / })).toHaveCount(
    1,
  );
  await expect(plan).toHaveAttribute(
    "href",
    planHref(repository, repo.revision),
  );
  expect(readCount()).toBe(reads);
  await card.getByRole("button", { name: "Hide detail" }).click();
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
  await page.route(destination, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<h1>Published blocked slice plan</h1>",
    }),
  );
  const card = backlog.getByRole("article", { name: plannedBlocked.title });
  await card.getByRole("link", { name: /^Canonical record / }).focus();
  await page.keyboard.press("Tab");
  await expect(card.getByRole("link", { name: /^Slice plan / })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(destination);
  await expect(
    page.getByRole("heading", { name: "Published blocked slice plan" }),
  ).toBeVisible();
  expect(status()).toBe(before);
}

export async function expectAgreeingFragment(
  taken: Locator,
  repository: string,
  revision: string,
) {
  const card = taken.getByRole("article", { name: plannedReady.title });
  const plan = card.getByRole("link", { name: /^Slice plan / });
  await expect(plan).toHaveCount(1);
  await expect(plan).toHaveAttribute(
    "href",
    `${planHref(repository, revision, planReadyPath)}#ordered-slices`,
  );
  await expect(
    card.getByText("Plan association conflict", { exact: true }),
  ).toHaveCount(0);
}
