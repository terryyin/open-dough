// Story A waits on Story B and needs a decision about Story C. Following
// Story A's reference opens Story B's detail at its reading top with the
// keyboard on the card and a cue that does not select it; the canonical
// record opens GitHub at the published revision; a later revision leaves the
// keyboard where the developer put it. While Story B's accepted start runs,
// following the reference reveals it with its protected detail closed. Nothing
// here launches or attaches an agent; a real Take is
// ../../../e2e/launches/agent-launch-story-card.spec.ts.

import { expect, test } from "../../tests/support/frontendApp.ts";
import { parts, shortRevision } from "../../tests/dashboardPage.ts";
import { pausePageClock } from "../../tests/autoRefreshJourney.ts";
import { advanceFrontendDoneProject } from "../../tests/support/frontendDoneProjectRefresh.ts";
import { recordHostRequests } from "../../tests/support/frontendHostRequests.ts";
import { installFrontendLaunchBoundary } from "../../tests/support/frontendLaunchSubstitutes.ts";
import { frontendAttempt } from "../../tests/support/frontendLaunchAttempts.ts";
import { backlogLaunchers } from "../../tests/launchStoryCardPage.ts";
import { agentAcceptEndpoint } from "../../src/agentLaunch.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { preholdRevisionStreamSlots } from "../../tests/support/revisionStreamSlots.ts";
import {
  failFrontendSupplierSeed,
  putFrontendActiveReference,
} from "../../tests/support/frontendStoryReferences.ts";
import { putFrontendDependencies } from "../../tests/support/frontendStoryDependencies.ts";
import { twoDependencies } from "../../tests/storyDependencyFixture.ts";
import { expectReadingTop } from "../../tests/readingPlace.ts";
import {
  emptyArea,
  expectInspected,
  expectSelected,
  storyDetail,
} from "../../tests/storyCardSelection.ts";
import {
  canonicalRecord,
  hideDetail,
  inspectionToggle,
  storyCard,
} from "../../tests/storyCardControls.ts";
import {
  dependencySummary,
  followReference,
  openDependencies,
  referenceNotice,
} from "../../tests/storyReference.ts";
import {
  expectCueEnds,
  expectDestinationCue,
  expectDestinationCueRestarted,
  holdDestinationCueWhileFading,
  passPartOfCue,
} from "../../tests/destinationCue.ts";

test.use({ hasTouch: true });

test("a dependency opens its active story, keeping the dashboard and inspection on repeated activation", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 500 });
  const canonicalUrl = await putFrontendActiveReference(page, frontendServices);
  // The case passes cue time and revision-check time itself.
  await pausePageClock(page);
  await preholdRevisionStreamSlots(page);
  const hostRequests = recordHostRequests(page);
  await page.goto("/");
  const consumer = storyCard(parts(page).backlog, "Story A");
  const supplier = storyCard(parts(page).backlog, "Story B");

  await test.step("following the reference opens Story B's detail at its reading top, focused and cued without selecting it", async () => {
    await openDependencies(consumer);
    await followReference(consumer, "Story B");
    await expect(storyDetail(supplier)).toBeVisible();
    await expect(supplier).toBeFocused();
    expect(
      await supplier.evaluate((card) => card.getBoundingClientRect().height),
    ).toBeGreaterThan(await page.evaluate(() => innerHeight));
    await expectReadingTop(supplier);
    await expectDestinationCue(page, supplier, { motion: true });
    await expect(page.locator(".story-card-selected")).toHaveCount(0);
    await expectCueEnds(page, supplier);
    await expectSelected(supplier, false);
    expect(new URL(page.url()).hostname).toBe("127.0.0.1");
  });

  await test.step("following again keeps the developer's selection and detail at the reading top", async () => {
    await emptyArea(supplier).click();
    await expectSelected(supplier, true);
    await followReference(consumer, "Story B");
    await expectDestinationCue(page, supplier, { motion: true });
    await expectSelected(supplier, true);
    await expectInspected(supplier, true);
    await expectReadingTop(supplier);
  });

  await test.step("following while the cue fades restarts it and keeps selection, detail and focus", async () => {
    await passPartOfCue(page, 1000);
    const fadingTime = await holdDestinationCueWhileFading(supplier, 1000);
    await followReference(consumer, "Story B");
    await expectDestinationCue(page, supplier, { motion: true });
    await expectDestinationCueRestarted(supplier, fadingTime);
    await expectSelected(supplier, true);
    await expectInspected(supplier, true);
    await expect(supplier).toBeFocused();
    await passPartOfCue(page, 1000);
    await expectDestinationCue(page, supplier, { motion: true });
    await expectCueEnds(page, supplier);
    await expectSelected(supplier, true);
    await expectInspected(supplier, true);
    await expect(supplier).toBeFocused();
  });

  await test.step("the canonical record opens GitHub's blob of the published revision", async () => {
    const popup = page.waitForEvent("popup");
    await canonicalRecord(supplier).click();
    const evidence = await popup;
    await expect(
      evidence.getByRole("heading", { name: "Source evidence" }),
    ).toBeVisible();
    expect(evidence.url()).toBe(canonicalUrl);
    await evidence.close();
  });

  await test.step("a later revision leaves the keyboard on Story A's Inspect", async () => {
    await hideDetail(supplier);
    const inspect = inspectionToggle(consumer);
    await inspect.focus();
    const refreshed = await advanceFrontendDoneProject(page, frontendServices);
    await expect(parts(page).readRevision).toContainText(
      shortRevision(refreshed),
    );
    await expectInspected(supplier, false);
    await expect(inspect).toBeFocused();
  });
  expect(hostRequests()).toEqual([]);
});

test("a reference reveals a starting story without opening its protected inspection or starting another host action", async ({
  page,
  frontendServices,
}) => {
  putFrontendDependencies(frontendServices, twoDependencies());
  const attempt = frontendAttempt(frontendServices);
  const boundary = await installFrontendLaunchBoundary(page, {
    accept: attempt.accept,
  });
  const hostRequests = recordHostRequests(page);
  await page.goto("/");
  const { start, dialog } = backlogLaunchers(page);
  const consumer = storyCard(parts(page).backlog, "Story A");
  const supplier = storyCard(parts(page).board, "Story B");
  await start("Story B").click();
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(inspectionToggle(supplier)).toBeDisabled();

  await openDependencies(consumer);
  await followReference(consumer, "Story B");
  await expect(supplier).toBeFocused();
  await expect(storyDetail(supplier)).toHaveCount(0);
  await expect(canonicalRecord(supplier)).toBeVisible();
  expect(hostRequests()).toEqual([`POST ${agentAcceptEndpoint}`]);

  attempt.launch(
    makeMe.aLaunchRecord
      .executing({ identity: "SEED-B#b", title: "Story B" })
      .please(),
  );
  await boundary.tellChanged();
  await expect(inspectionToggle(supplier)).toBeEnabled();
  expect(boundary.acceptances).toHaveLength(1);
});

test("an identified active block with unreadable detail still opens with its existing read gap", async ({
  page,
  frontendServices,
}) => {
  putFrontendDependencies(frontendServices, twoDependencies());
  await failFrontendSupplierSeed(page);
  const hostRequests = recordHostRequests(page);
  await page.goto("/");
  const consumer = storyCard(parts(page).backlog, "Story A");
  await expect(dependencySummary(consumer)).toBeVisible();
  await openDependencies(consumer);
  await followReference(consumer, "Story B");
  const supplier = storyCard(parts(page).backlog, "Story B");
  await expect(
    storyDetail(supplier).locator(".preparation-problem").first(),
  ).toBeVisible();
  await expect(supplier).toBeFocused();
  await expect(supplier).toBeInViewport({ ratio: 0.5 });
  await expect(referenceNotice(page)).toBeEmpty();
  expect(hostRequests()).toEqual([]);
});
