// Read and isolation observations for story readiness: a failed check's
// retention and recovery on reload, project-switch rejection of late held
// reads, and no re-read after settlement across a steady check interval.

import { expect, type Locator, type Page } from "@playwright/test";
import {
  expectSteadyPace,
  passTimeUntilAsked,
  passTimeUntilCheckedAfterSettled,
} from "./autoRefreshJourney.ts";
import { planHref } from "./queuedPlanNavigation.ts";
import type { CommittedOrigin } from "./committedOrigin.ts";
import {
  chooseProject,
  expectMembership,
  shortRevision,
  parts,
} from "./dashboardPage.ts";
import { noConnection } from "./originAnswers.ts";
import {
  externalPlan,
  legacy,
  malformed,
  plannedBlocked,
  plannedReady,
  planless,
  type ReadinessRepo,
  unrefined,
} from "./storyReadinessFixture.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";
import { inspectedDetail, storyCard } from "./storyCardControls.ts";
import { expectBadges } from "./storyCardFacts.ts";

export async function expectFailedCheckKeepsPriorRevision(
  page: Page,
  problem: Locator,
  openDough: ReadinessRepo,
  origin: CommittedOrigin,
  taken: Locator,
  backlog: Locator,
) {
  const retainedRevision = openDough.revision;
  const restore = origin.answerWith("main", noConnection);
  origin.requests.splice(0, origin.requests.length);

  await passTimeUntilCheckedAfterSettled(page, 502);
  await expect(problem).toContainText("Published work could not be read");
  await expect(problem).toContainText("earlier snapshot");
  // Failed check: status names no revision; Board links prove the retained one.

  const readyCard = storyCard(taken, plannedReady.title);
  const blockedCard = storyCard(backlog, plannedBlocked.title);
  await expectBadges(readyCard, { shown: ["Slice planned"] });
  await expectBadges(blockedCard, { shown: ["Readiness unavailable"] });
  // The retained snapshot's links stay pinned to it in each story's detail.
  // Its detail may still be open from earlier; several can be open at once.
  await inspectedDetail(readyCard);
  await expect(
    readyCard.locator(`a[href*="/blob/${retainedRevision}/"]`).first(),
  ).toBeVisible();

  await inspectedDetail(blockedCard);
  await expect(
    blockedCard.getByRole("link", { name: /^Slice plan / }),
  ).toHaveAttribute("href", planHref("terryyin/open-dough", retainedRevision));

  restore();
  const afterFail = origin.requests.length;
  await reloadUntilRead(page);
  await expect(problem).toHaveCount(0);
  await expect(parts(page).readRevision).toContainText(
    shortRevision(retainedRevision),
  );
  await expect.poll(() => origin.requests.length).toBeGreaterThan(afterFail);
}

export async function expectProjectSwitchRejectsLateHeldRead(
  page: Page,
  openDoughOrigin: CommittedOrigin,
  openDough: ReadinessRepo,
  doughnut: ReadinessRepo,
) {
  await chooseProject(page, "Open Dough");
  await expectMembership(page, {
    taken: [plannedReady.title],
    backlog: [unrefined.title, plannedBlocked.title],
  });
  await expect(parts(page).readRevision).toContainText(
    shortRevision(openDough.revision),
  );

  const releaseMain = openDoughOrigin.hold("main");
  await page.reload();
  await expect(parts(page).reading).toBeVisible();

  await chooseProject(page, "Doughnut");
  await expectMembership(page, {
    taken: [],
    backlog: [
      planless.title,
      legacy.title,
      malformed.title,
      externalPlan.title,
    ],
  });
  const { backlog, readRevision } = parts(page);
  await expect(readRevision).toContainText(shortRevision(doughnut.revision));

  releaseMain();
  await expect(readRevision).toContainText(shortRevision(doughnut.revision));
  await expect(page.getByText(plannedReady.title)).toHaveCount(0);
  await expect(storyCard(backlog, planless.title)).toBeVisible();
}

// With the page clock paused since the page opened, lets page time pass the
// steady check interval until the selected project's revision check is asked
// and answered, then until the next check is asked. Checks wait for any read
// to settle, so a read that settlement, a retry, or the unchanged answer
// started would already be among what these origins observed.
export async function expectNoRereadAfterSettlement(
  page: Page,
  origins: readonly CommittedOrigin[],
) {
  const settled = origins.map((origin) => origin.requests.length);
  await passTimeUntilCheckedAfterSettled(page);
  const passed = await passTimeUntilAsked(page);
  expect(origins.map((origin) => origin.requests.length)).toEqual(settled);
  expectSteadyPace(passed);
}
