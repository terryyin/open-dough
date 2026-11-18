// Two published projects, each with its own revision and its own telling of
// a story identity the two happen to share. Selecting a project shows only
// that project's Board, through the same reader and presentation Open Dough
// already used when it was the only source. The page's one selected story
// names its project: a project that does not own it has none, even for the
// identity they share, and selecting one of its cards moves the selection.

import type { CatalogPublication } from "../../test-support/catalogProjectRecords.ts";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { answerOnlyPublications } from "../../test-support/support/frontendCatalogProjects.ts";
import { countProjectReads } from "../../test-support/support/frontendAuthenticatedReadControl.ts";
import { untilPageReadsAnswered } from "../../test-support/pageRequestNotes.ts";
import {
  shortRevision,
  expectMembership,
  expectProjectChoice,
  openDirection,
  parts,
  projectTab,
} from "../../test-support/dashboardPage.ts";
import {
  doughnutPublication,
  doughnutSharedTitle,
  doughnutTakenTitle,
  openDoughPublication,
  openDoughSharedTitle,
  openDoughTakenTitle,
  sharedStoryIdentity,
  titlesOfDoughnut,
  titlesOfOpenDough,
} from "../../test-support/projectSelectionProjects.ts";
import { describedRevision } from "../../test-support/describedRevisions.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  emptyArea,
  expectSelected,
} from "../../test-support/storyCardSelection.ts";
import {
  canonicalRecord,
  inspectedDetail,
} from "../../test-support/storyCardControls.ts";

const sharedHref = ({ repository, revision }: CatalogPublication) =>
  `https://github.com/${repository}/blob/${revision}/.planning/seeds/SEED-777-shared.md#shared-story`;

test("project selection shows each project's own Board, and returning to a project asks its ref again", async ({
  page,
  frontendServices,
}) => {
  await answerOnlyPublications(page, frontendServices, [
    openDoughPublication,
    doughnutPublication,
  ]);
  const openDoughReads = countProjectReads(page, openDoughPublication.id);
  const doughnutReads = countProjectReads(page, doughnutPublication.id);

  await page.goto("/");
  const { direction, readRevision } = parts(page);
  const body = page.locator("body");
  const card = (title: string) =>
    page.getByRole("article", { name: title, exact: true });

  await test.step("Open Dough is the default selection, and Doughnut is not read", async () => {
    await expect(projectTab(page, "Open Dough")).toBeChecked();
    await expectMembership(page, titlesOfOpenDough);
    await openDirection(page);
    await expect(direction).toContainText(
      "Show Open Dough's own published direction",
    );
    await expectProjectChoice(page, "Open Dough");
    await expect(readRevision).toContainText(
      shortRevision(openDoughPublication.revision),
    );
    await untilPageReadsAnswered(page);
    expect(openDoughReads()).toBeGreaterThan(0);
    expect(doughnutReads()).toBe(0);
    await emptyArea(card(openDoughSharedTitle)).click();
    await expectSelected(card(openDoughSharedTitle), true);
  });

  const openDoughOpening = openDoughReads();

  await test.step("selecting Doughnut shows only Doughnut's Board; Open Dough is not read again", async () => {
    await projectTab(page, "Doughnut").check();
    await expectMembership(page, titlesOfDoughnut);
    await openDirection(page);
    await expect(direction).toContainText(
      "Show Doughnut's own published direction",
    );
    await expectProjectChoice(page, "Doughnut");
    await expect(readRevision).toContainText(
      shortRevision(doughnutPublication.revision),
    );
    await expect(body).not.toContainText(openDoughTakenTitle);
    await expect(body).not.toContainText(openDoughSharedTitle);
    await untilPageReadsAnswered(page);
    expect(doughnutReads()).toBeGreaterThan(0);
    expect(openDoughReads()).toBe(openDoughOpening);
    // Open Dough owns the selection, so Doughnut's telling has none.
    await expectSelected(card(doughnutSharedTitle), false);
  });

  await test.step("the shared story identity is Doughnut's own entry, linked into Doughnut's snapshot", async () => {
    const sharedCard = card(doughnutSharedTitle);
    await emptyArea(sharedCard).click();
    await expectSelected(sharedCard, true);
    const detail = await inspectedDetail(sharedCard);
    await expect(sharedCard).toContainText(sharedStoryIdentity);
    await expect(canonicalRecord(detail)).toHaveAttribute(
      "href",
      sharedHref(doughnutPublication),
    );
  });

  await test.step("returning to Open Dough shows its Board again, read afresh", async () => {
    await projectTab(page, "Open Dough").check();
    await expectMembership(page, titlesOfOpenDough);
    await openDirection(page);
    await expect(direction).toContainText(
      "Show Open Dough's own published direction",
    );
    await expect(readRevision).toContainText(
      shortRevision(openDoughPublication.revision),
    );
    await expect(body).not.toContainText(doughnutSharedTitle);
    await expect(body).not.toContainText(doughnutTakenTitle);
    // A fresh observation, not a replay: Open Dough is asked again.
    await expect.poll(openDoughReads).toBeGreaterThan(openDoughOpening);
    // Selecting Doughnut's card moved the page's one selection there.
    await expectSelected(card(openDoughSharedTitle), false);
    const detail = await inspectedDetail(card(openDoughSharedTitle));
    await expect(canonicalRecord(detail)).toHaveAttribute(
      "href",
      sharedHref(openDoughPublication),
    );
  });
});

test("project selection preserves empty Taken/Backlog groups and no-direction handling for the newly selected project", async ({
  page,
  frontendServices,
}) => {
  // Doughnut publishes nothing in its backlog at its own revision.
  await answerOnlyPublications(page, frontendServices, [
    openDoughPublication,
    {
      ...doughnutPublication,
      ...describedRevision(
        makeMe.aRepository.please(),
        doughnutPublication.revision,
      ),
    },
  ]);
  await page.goto("/");
  await expectMembership(page, titlesOfOpenDough);
  const { backlog, taken, direction, readRevision } = parts(page);

  await projectTab(page, "Doughnut").check();

  await expect(taken).toContainText("No Taken entries are recorded.");
  await expect(taken).toContainText("0 entries");
  await expect(backlog).toContainText("No Backlog entries are recorded.");
  await expect(backlog).toContainText("0 entries");
  await openDirection(page);
  await expect(direction).toContainText(
    "No near-future direction is recorded.",
  );
  await expectProjectChoice(page, "Doughnut");
  await expect(readRevision).toContainText(
    shortRevision(doughnutPublication.revision),
  );
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(openDoughSharedTitle);
  await expect(page.locator("body")).not.toContainText(openDoughTakenTitle);
});
