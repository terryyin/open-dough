// Refresh and isolation observations for story readiness: failed refresh
// retention, Retry, project-switch rejection of late held reads, and no
// polling after settlement.

import { expect, type Locator, type Page } from "@playwright/test";
import { planHref } from "./queuedPlanNavigation";
import type { CommittedOrigin } from "./committedOrigin";
import { expectMembership, parts } from "./dashboardPage";
import { rateLimitedAnswer } from "./originAnswers";
import {
  externalPlan,
  legacy,
  malformed,
  plannedBlocked,
  plannedReady,
  planless,
  type ReadinessRepo,
  unrefined,
} from "./storyReadinessFixture";

export async function expectFailedRefreshKeepsPriorRevision(
  source: Locator,
  refresh: Locator,
  retry: Locator,
  problem: Locator,
  openDough: ReadinessRepo,
  origin: CommittedOrigin,
  taken: Locator,
  backlog: Locator,
) {
  const retainedRevision = openDough.revision;
  const restore = origin.answerWith("main", rateLimitedAnswer());
  origin.requests.splice(0, origin.requests.length);

  await refresh.click();
  await expect(problem).toContainText("Published work could not be read");
  await expect(problem).toContainText("earlier snapshot");
  await expect(source).toContainText(retainedRevision);
  await expect(retry).toBeVisible();
  await expect(refresh).toHaveCount(0);

  await expect(
    taken
      .getByRole("article", { name: plannedReady.title })
      .getByText("Slice planned", { exact: true }),
  ).toBeVisible();
  await expect(
    backlog
      .getByRole("article", { name: plannedBlocked.title })
      .getByText("Readiness unavailable", { exact: true }),
  ).toBeVisible();
  await expect(
    taken.locator(`a[href*="/blob/${retainedRevision}/"]`).first(),
  ).toBeVisible();

  await expect(
    backlog
      .getByRole("article", { name: plannedBlocked.title })
      .getByRole("link", { name: /^Slice plan / }),
  ).toHaveAttribute("href", planHref("terryyin/open-dough", retainedRevision));

  restore();
  const afterFail = origin.requests.length;
  await retry.click();
  await expect(problem).toHaveCount(0);
  await expect(source).toContainText(retainedRevision);
  await expect(refresh).toBeVisible();
  await expect(retry).toHaveCount(0);
  expect(origin.requests.length).toBeGreaterThan(afterFail);
}

export async function expectProjectSwitchRejectsLateHeldRead(
  page: Page,
  project: Locator,
  refresh: Locator,
  openDoughOrigin: CommittedOrigin,
  openDough: ReadinessRepo,
  doughnut: ReadinessRepo,
) {
  await project.selectOption("open-dough");
  await expectMembership(page, {
    taken: [plannedReady.title],
    backlog: [unrefined.title, plannedBlocked.title],
  });
  await expect(parts(page).source).toContainText(openDough.revision);

  const releaseMain = openDoughOrigin.hold("main");
  await refresh.click();
  await expect(parts(page).reading).toBeVisible();

  await project.selectOption("doughnut");
  await expectMembership(page, {
    taken: [],
    backlog: [
      planless.title,
      legacy.title,
      malformed.title,
      externalPlan.title,
    ],
  });
  const { source, backlog } = parts(page);
  await expect(source).toContainText(doughnut.revision);

  releaseMain();
  await expect(source).toContainText(doughnut.revision);
  await expect(page.getByText(plannedReady.title)).toHaveCount(0);
  await expect(
    backlog.getByRole("article", { name: planless.title }),
  ).toBeVisible();
}

export async function expectNoPollingAfterSettlement(
  origin: CommittedOrigin,
  page: Page,
) {
  const settled = origin.requests.length;
  await page.waitForTimeout(1500);
  expect(origin.requests.length).toBe(settled);
}
