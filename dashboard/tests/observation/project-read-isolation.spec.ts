// A project selection owns its read: success or failure from a deselected
// project never replaces the current project. Switching aborts the request,
// so releasing a held answer only finishes the test handler; it cannot reach
// the page. Assertions after release therefore need no arbitrary wait.

import type { Page } from "@playwright/test";
import { expect, test } from "../dashboardTest.ts";
import { shortRevision, expectMembership, parts } from "../dashboardPage.ts";
import {
  doughnutBacklog,
  doughnutRepository,
  doughnutSharedTitle,
  revisionDoughnut,
  sharedStoryIdentity,
} from "../doughnutProject.ts";
import { describedRevisions, publishedFile } from "../describedRevisions.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  backlogPath,
  pathsRead,
  publishMovingOrigin,
  rateLimitedAnswer,
  type MovingOrigin,
} from "../publishedOrigin.ts";

const revisionOpenDoughFirst = "a1".repeat(20);
const revisionOpenDoughSecond = "a2".repeat(20);
const revisionOpenDoughThird = "a3".repeat(20);

// Doughnut's telling of the shared identity is in ../doughnutProject.ts; Open
// Dough's tellings differ, and neither may appear under the other's label.
const openDoughSharedTitleFirst =
  "Open Dough's first telling of the shared story";
const openDoughSharedTitleSecond =
  "Open Dough's second telling of the shared story";
const openDoughSharedTitleThird =
  "Open Dough's third telling of the shared story";

const sharedStoryTold = (title: string) =>
  makeMe.aBacklogEntry
    .with({
      identity: sharedStoryIdentity,
      title,
      href: "seeds/SEED-777-shared.md#shared-story",
    })
    .please();
const openDoughRevisions = describedRevisions(
  makeMe.aRepository
    .withRevision("first", {
      backlog: { queued: [sharedStoryTold(openDoughSharedTitleFirst)] },
    })
    .withRevision("second", {
      backlog: { queued: [sharedStoryTold(openDoughSharedTitleSecond)] },
    })
    .withRevision("third", {
      backlog: { queued: [sharedStoryTold(openDoughSharedTitleThird)] },
    })
    .please(),
  {
    first: revisionOpenDoughFirst,
    second: revisionOpenDoughSecond,
    third: revisionOpenDoughThird,
  },
);

// Moves Open Dough's `main` to the named revision.
function pushOpenDough(
  openDough: MovingOrigin,
  name: keyof typeof openDoughRevisions,
): void {
  const at = openDoughRevisions[name];
  openDough.push(at.revision, publishedFile(at, backlogPath));
}

async function openBothOrigins(
  page: Page,
): Promise<{ openDough: MovingOrigin; doughnut: MovingOrigin }> {
  const openDough = await publishMovingOrigin(page);
  const doughnut = await publishMovingOrigin(page, doughnutRepository);
  pushOpenDough(openDough, "first");
  doughnut.push(revisionDoughnut, doughnutBacklog);
  await page.goto("/");
  await expectMembership(page, {
    taken: [],
    backlog: [openDoughSharedTitleFirst],
  });
  return { openDough, doughnut };
}

test.describe("project read isolation", () => {
  test("a late success from a deselected project's outstanding read never replaces the newly selected project's shown work, and the selector stays keyboard-operable throughout", async ({
    page,
  }) => {
    const { openDough, doughnut } = await openBothOrigins(page);
    const { project, backlog, readRevision } = parts(page);

    const releaseDoughnut = doughnut.hold("main");
    await project.getByRole("radio", { name: "Doughnut", exact: true }).check();
    await expect.poll(() => doughnut.requests.length).toBeGreaterThan(0);

    await test.step("the selector is never blocked while Doughnut's read is outstanding", async () => {
      const selectedProject = project.getByRole("radio", { checked: true });
      await expect(selectedProject).toBeEnabled();
      await selectedProject.focus();
      await expect(selectedProject).toBeFocused();
    });

    pushOpenDough(openDough, "second");
    await page.keyboard.press("ArrowLeft");

    await test.step("Open Dough's fresh read is shown; Doughnut's outstanding read is not waited on or shown", async () => {
      await expectMembership(page, {
        taken: [],
        backlog: [openDoughSharedTitleSecond],
      });
      await expect(readRevision).toContainText(
        shortRevision(revisionOpenDoughSecond),
      );
      await expect(page.locator("body")).not.toContainText(doughnutSharedTitle);
    });

    const secondCard = backlog.getByRole("article", {
      name: openDoughSharedTitleSecond,
    });
    await secondCard.getByRole("button", { name: "Inspect story" }).click();
    const secondLink = secondCard.getByRole("link", {
      name: /^Canonical record/,
    });
    await secondLink.focus();
    await expect(secondLink).toBeFocused();

    await test.step("Doughnut's held read answers late with success, after Open Dough is already shown", async () => {
      releaseDoughnut();
      // Immediate assertions, matching ./auto-refresh.spec.ts's own
      // held-response races: nothing about the page depends on this release, so there is
      // no later moment at which it could still take effect.
      await expect(page.locator("body")).not.toContainText(doughnutSharedTitle);
      await expect(readRevision).toContainText(
        shortRevision(revisionOpenDoughSecond),
      );
      await expect(
        project.getByRole("radio", { name: "Open Dough", exact: true }),
      ).toBeChecked();
      expect(doughnut.requests).toHaveLength(1);
    });

    await test.step("focus stayed in the selection context: the late response did not pull it onto Doughnut's cards or the board", async () => {
      await expect(secondLink).toBeFocused();
      await expect(parts(page).notice).toBeEmpty();
    });
  });

  test("a late failure from a deselected project's outstanding read never surfaces as the newly selected project's failure", async ({
    page,
  }) => {
    const { openDough, doughnut } = await openBothOrigins(page);
    const { project, readRevision } = parts(page);

    const releaseDoughnut = doughnut.hold("main");
    await project.getByRole("radio", { name: "Doughnut", exact: true }).check();
    await expect.poll(() => doughnut.requests.length).toBeGreaterThan(0);
    doughnut.answerWith("main", rateLimitedAnswer());

    pushOpenDough(openDough, "second");
    await project
      .getByRole("radio", { name: "Open Dough", exact: true })
      .check();
    await expectMembership(page, {
      taken: [],
      backlog: [openDoughSharedTitleSecond],
    });

    await test.step("Doughnut's held read answers late with a failure, after Open Dough is already shown", async () => {
      releaseDoughnut();
      await expect(page.getByRole("alert")).toHaveCount(0);
      await expectMembership(page, {
        taken: [],
        backlog: [openDoughSharedTitleSecond],
      });
      await expect(readRevision).toContainText(
        shortRevision(revisionOpenDoughSecond),
      );
      expect(doughnut.requests).toHaveLength(1);
    });
  });

  test("returning to a project whose read is still outstanding elsewhere starts a third, fresh read rather than replaying its first snapshot, even with a shared work identity", async ({
    page,
  }) => {
    const { openDough, doughnut } = await openBothOrigins(page);
    const { project, backlog, readRevision } = parts(page);

    const releaseDoughnut = doughnut.hold("main");
    await project.getByRole("radio", { name: "Doughnut", exact: true }).check();
    await expect.poll(() => doughnut.requests.length).toBeGreaterThan(0);

    // Returning to Open Dough while Doughnut's read is still outstanding.
    // Its own backlog changed underneath it since the first read (the same
    // "returning to a project starts a fresh read" rule ./project-selection.spec.ts
    // proves for the sequential case), so a cached replay of the first
    // snapshot would show the wrong title.
    pushOpenDough(openDough, "third");
    await project
      .getByRole("radio", { name: "Open Dough", exact: true })
      .check();

    await test.step("the third, fresh Open Dough read is shown -- not the first snapshot, and not Doughnut's", async () => {
      await expectMembership(page, {
        taken: [],
        backlog: [openDoughSharedTitleThird],
      });
      await expect(readRevision).toContainText(
        shortRevision(revisionOpenDoughThird),
      );
      await expect(page.locator("body")).not.toContainText(
        openDoughSharedTitleFirst,
      );
      await expect(page.locator("body")).not.toContainText(doughnutSharedTitle);
      // Two Open Dough reads (main+file each): the first at mount, the
      // second (fresh, not cached) on returning. Only one Doughnut request:
      // its held read was never retried.
      expect(pathsRead(openDough)).toEqual([
        "main",
        `PRODUCT-BACKLOG.md?ref=${revisionOpenDoughFirst}`,
        "main",
        `PRODUCT-BACKLOG.md?ref=${revisionOpenDoughThird}`,
      ]);
      expect(doughnut.requests).toHaveLength(1);
    });

    const thirdCard = backlog.getByRole("article", {
      name: openDoughSharedTitleThird,
    });
    await thirdCard.getByRole("button", { name: "Inspect story" }).click();
    await thirdCard.getByRole("link", { name: /^Canonical record/ }).focus();

    await test.step("Doughnut's stale first-round read answers even later; the third Open Dough read still stands", async () => {
      releaseDoughnut();
      await expectMembership(page, {
        taken: [],
        backlog: [openDoughSharedTitleThird],
      });
      await expect(
        thirdCard.getByRole("link", { name: /^Canonical record/ }),
      ).toBeFocused();
    });
  });
});
