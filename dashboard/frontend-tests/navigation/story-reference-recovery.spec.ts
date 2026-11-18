// Story A waits on Story B and needs a decision about Story C, whose seed is
// published while it is not yet queued. Following SEED-C#c tells, in the one
// live region, that it is unavailable, that a retry is reading, or that the
// read failed; a retry after Story C is queued at a later revision reaches it.
// Choosing another project or inspection while the retry is held wins.

import { expect, test } from "../../tests/support/frontendApp.ts";
import { parts } from "../../tests/dashboardPage.ts";
import {
  chooseProject,
  expectProjectChoice,
  shownProjectControl,
} from "../../tests/projectChoice.ts";
import { catalogPublications } from "../../tests/catalogProjectRecords.ts";
import { answerOwnPublications } from "../../tests/support/frontendCatalogProjects.ts";
import { putFrontendRecoverableReference } from "../../tests/support/frontendStoryReferenceRecovery.ts";
import { storyDetail } from "../../tests/storyCardSelection.ts";
import { inspectionToggle, storyCard } from "../../tests/storyCardControls.ts";
import {
  followReference,
  openDependencies,
  referenceNotice,
  retryReference,
  storyReference,
} from "../../tests/storyReference.ts";

test.use({ hasTouch: true });

const releases: (() => void)[] = [];
test.afterEach(() => {
  releases.splice(0).forEach((release) => {
    release();
  });
});

test("missing, reading and failed reference destinations stay distinct and retry reaches a newly published block", async ({
  page,
  frontendServices,
}) => {
  const backlog = await putFrontendRecoverableReference(
    page,
    frontendServices,
    releases,
  );
  await page.goto("/");
  const consumer = storyCard(parts(page).backlog, "Story A");
  // The same live region announces each outcome: it is marked while empty.
  const notice = referenceNotice(page);
  await expect(notice).toBeEmpty();
  await notice.evaluate((element) => {
    element.setAttribute("data-known", "true");
  });
  await openDependencies(consumer);
  await expect(storyReference(consumer, "SEED-C#c")).toBeVisible();
  await followReference(consumer, "SEED-C#c");
  await expect(notice).toHaveAttribute("data-known", "true");
  await expect(notice).toContainText(
    "SEED-C#c is unavailable in Open Dough's dashboard",
  );
  await expect(inspectionToggle(consumer)).toBeEnabled();

  backlog.queueStoryC();
  backlog.fail();
  const release = await backlog.hold();
  await retryReference(page);
  await expect(notice).toContainText("Reading Open Dough to find SEED-C#c");
  const destination = storyCard(parts(page).backlog, "Story C");
  await expect(destination).toHaveCount(0);
  release();
  await expect(notice).toContainText(
    "Could not read Open Dough to find SEED-C#c",
  );
  await expect(notice).not.toContainText("unavailable");

  backlog.pass();
  await retryReference(page);
  await expect(storyDetail(destination)).toBeVisible();
  await expect(destination).toBeFocused();
  await expect(destination).toBeInViewport({ ratio: 0.5 });
  await expect(notice).toBeEmpty();
});

test("leaving during a pending reference prevents the delayed read from moving focus or opening inspection", async ({
  page,
  frontendServices,
}) => {
  await answerOwnPublications(page, frontendServices, [
    catalogPublications.pygardon,
  ]);
  const backlog = await putFrontendRecoverableReference(
    page,
    frontendServices,
    releases,
  );
  await page.goto("/");
  const consumer = storyCard(parts(page).backlog, "Story A");
  await openDependencies(consumer);
  await followReference(consumer, "SEED-C#c");
  const notice = referenceNotice(page);
  await expect(notice).toContainText("unavailable");
  backlog.queueStoryC();
  const release = await backlog.hold();
  await retryReference(page);
  await expect(notice).toContainText("Reading Open Dough");
  await chooseProject(page, "Pygardon");
  await expectProjectChoice(page, "Pygardon");
  release();
  await expectProjectChoice(page, "Pygardon");
  await expect(notice).toBeEmpty();
  await expect(storyDetail(page)).toHaveCount(0);
  await expect(shownProjectControl(page)).toBeFocused();
});

test("choosing another inspection during a pending reference keeps that choice when its destination arrives", async ({
  page,
  frontendServices,
}) => {
  const backlog = await putFrontendRecoverableReference(
    page,
    frontendServices,
    releases,
  );
  await page.goto("/");
  const consumer = storyCard(parts(page).backlog, "Story A");
  await openDependencies(consumer);
  await followReference(consumer, "SEED-C#c");
  const notice = referenceNotice(page);
  await expect(notice).toContainText("unavailable");
  backlog.queueStoryC();
  const release = await backlog.hold();
  await retryReference(page);
  await expect(notice).toContainText("Reading Open Dough");
  await inspectionToggle(consumer).click();
  await expect(storyDetail(consumer)).toBeVisible();
  release();
  const destination = storyCard(parts(page).backlog, "Story C");
  await expect(destination).toBeVisible();
  await expect(storyDetail(destination)).toHaveCount(0);
  await expect(inspectionToggle(consumer)).toBeFocused();
  await expect(notice).toBeEmpty();
});
