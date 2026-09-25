// A failed read of one project -- here Pygardon, published to the same fake
// GitHub as Open Dough and Doughnut (./publishedOrigin.ts) -- is recovered in
// the browser without losing project context: switching stays available,
// Retry reads the project once access is restored, and a later failure keeps
// only that project's previous snapshot. No real credentials change.
// Server-side failure categories are covered by
// authenticated-read-boundary.spec.ts; subprocess timeout is covered by
// authenticated-read-subprocess-lifecycle.spec.ts.

import { type Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import {
  expectMembership,
  expectProblemAndNoSnapshot,
  openDirection,
  parts,
} from "./dashboardPage.ts";
import {
  notLoggedIn,
  publishMovingOrigin,
  type OriginAnswer,
} from "./publishedOrigin.ts";

const doughnutRepository = "nerds-odd-e/doughnut";
const pygardonRepository = "terryyin/pygardon";

const openDoughRevision = "d0".repeat(20);
const openDoughTitle = "Open Dough's own queued story";
const openDoughBacklog = `# Product backlog

## Taken

## Backlog list

- [${openDoughTitle}](seeds/SEED-900-open-dough.md#queued) — SEED-900#queued
`;

const doughnutRevision = "d1".repeat(20);
const doughnutTitle = "Doughnut's own queued story";
const doughnutBacklog = `# Product backlog

## Taken

## Backlog list

- [${doughnutTitle}](seeds/SEED-901-doughnut.md#queued) — SEED-901#queued
`;

const pygardonRevision = "c1".repeat(20);
const pygardonTakenTitle = "Pygardon's own taken story";
const pygardonQueuedTitle = "Pygardon's own queued story";
const pygardonDirection =
  "Recover from a failed read without losing project context.";
const pygardonBacklog = `# Product backlog

## Near-future direction

${pygardonDirection}

## Taken

- [${pygardonTakenTitle}](quick/200-pygardon-story/PLAN.md) — PYG-200#story

## Backlog list

- [${pygardonQueuedTitle}](seeds/SEED-200-pygardon.md#queued) — PYG-201#queued
`;

// `gh` fails in a way this boundary cannot put a category to.
const unexplainedFailure: OriginAnswer = {
  exitCode: 1,
  stderr: "gh: unexplained failure\n",
};

async function publishOpenDough(page: Page): Promise<void> {
  const openDough = await publishMovingOrigin(page);
  openDough.push(openDoughRevision, openDoughBacklog);
}

async function publishOpenDoughAndDoughnut(page: Page): Promise<void> {
  await publishOpenDough(page);
  const doughnut = await publishMovingOrigin(page, doughnutRepository);
  doughnut.push(doughnutRevision, doughnutBacklog);
}

test.describe("project read recovery", () => {
  test("an unavailable Pygardon read shows an actionable, project-specific failure while another project remains selectable; restoring access and pressing Retry reads Pygardon; a later failed Refresh keeps only Pygardon's previous snapshot", async ({
    page,
  }) => {
    await publishOpenDoughAndDoughnut(page);
    const pygardonOrigin = await publishMovingOrigin(page, pygardonRepository);
    const restoreLogin = pygardonOrigin.answerWith("main", notLoggedIn);

    await page.goto("/");
    const { project, direction, source, problem, retry, refresh } = parts(page);
    const pygardon = project.getByRole("radio", {
      name: "Pygardon",
      exact: true,
    });
    const selectedProject = project.getByRole("radio", { checked: true });
    await expectMembership(page, { taken: [], backlog: [openDoughTitle] });

    await test.step("selecting Pygardon while gh is not logged in shows an actionable failure and no snapshot", async () => {
      await pygardon.check();
      await expectProblemAndNoSnapshot(
        page,
        "The local GitHub CLI is not logged in, so main of terryyin/pygardon could not be read. Run `gh auth login` (check with `gh auth status`), then press Retry.",
        pygardonRepository,
      );
    });

    await test.step("the selector stays enabled and keyboard-operable, and another project remains fully readable", async () => {
      await expect(selectedProject).toBeEnabled();
      await selectedProject.focus();
      await expect(selectedProject).toBeFocused();
      await page.keyboard.press("ArrowLeft");
      await expectMembership(page, { taken: [], backlog: [doughnutTitle] });
      await expect(source).toContainText(doughnutRevision);
      await expect(problem).toHaveCount(0);
      await expect(refresh).toBeVisible();
      await expect(retry).toHaveCount(0);
    });

    await test.step("returning to Pygardon while access is still unavailable starts a fresh, still-failing read -- not stale Doughnut data", async () => {
      await pygardon.check();
      await expect(problem).toContainText(
        "The local GitHub CLI is not logged in, so main of terryyin/pygardon could not be read.",
      );
      await expect(page.locator("body")).not.toContainText(doughnutTitle);
      await expect(page.getByRole("article")).toHaveCount(0);
    });

    await test.step("restoring existing access and pressing Retry reads Pygardon's actual published work", async () => {
      restoreLogin();
      pygardonOrigin.push(pygardonRevision, pygardonBacklog);
      await retry.click();
      await expectMembership(page, {
        taken: [pygardonTakenTitle],
        backlog: [pygardonQueuedTitle],
      });
      await openDirection(page);
      await expect(direction).toContainText(pygardonDirection);
      await expect(source).toContainText(pygardonRevision);
      await expect(problem).toHaveCount(0);
      await expect(refresh).toBeVisible();
      await expect(retry).toHaveCount(0);
    });

    await test.step("a later failed Refresh keeps only Pygardon's previous snapshot, with the failure reported alongside it", async () => {
      pygardonOrigin.answerWith("main", unexplainedFailure);
      await refresh.click();
      await expect(problem).toContainText(
        "The local authenticated read failed while reading main of terryyin/pygardon.",
      );
      await expect(problem).toContainText(
        "What is shown is the earlier snapshot, retrieved at",
      );
      await expectMembership(page, {
        taken: [pygardonTakenTitle],
        backlog: [pygardonQueuedTitle],
      });
      await expect(source).toContainText(pygardonRevision);
      await expect(page.locator("body")).not.toContainText(doughnutTitle);
      await expect(page.locator("body")).not.toContainText(openDoughTitle);
      await expect(retry).toBeVisible();
      await expect(refresh).toHaveCount(0);
    });
  });

  test.describe("with a read bound short enough to wait out here", () => {
    // Yet long enough that the ordinary Open Dough read finishes under load.
    test.use({ readTimeoutMs: 2_000 });

    test("the bounded stalled-read timeout resolves into the same ordinary recoverable failure as any other cause, and Retry after restored access succeeds", async ({
      page,
    }) => {
      await publishOpenDough(page);
      const pygardonOrigin = await publishMovingOrigin(
        page,
        pygardonRepository,
      );
      const releaseRef = pygardonOrigin.hold("main");

      await page.goto("/");
      const { project, problem, retry } = parts(page);
      await expectMembership(page, { taken: [], backlog: [openDoughTitle] });

      await project
        .getByRole("radio", { name: "Pygardon", exact: true })
        .check();
      await expect(problem).toContainText("Published work could not be read", {
        timeout: 10_000,
      });
      await expect(problem).toContainText(
        "The local GitHub CLI did not answer within 2 seconds while reading main of terryyin/pygardon.",
      );
      await expect(page.getByRole("button")).toHaveAccessibleName("Retry");
      await expect(page.getByRole("article")).toHaveCount(0);

      releaseRef();
      pygardonOrigin.push(pygardonRevision, pygardonBacklog);
      await retry.click();
      await expectMembership(page, {
        taken: [pygardonTakenTitle],
        backlog: [pygardonQueuedTitle],
      });
      await expect(problem).toHaveCount(0);
    });
  });
});
