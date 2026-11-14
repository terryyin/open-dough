// A failed read of one project -- here Pygardon, published to the same fake
// GitHub as Open Dough and Doughnut (../../dashboard/tests/publishedOrigin.ts) -- is recovered in
// the browser without losing project context: switching stays available,
// reloading reads the project once access is restored, and a later failure keeps
// only that project's previous snapshot. No real credentials change.
// Server-side failure categories are covered by
// authenticated-read-boundary.spec.ts; subprocess timeout is covered by
// authenticated-read-subprocess-lifecycle.spec.ts.

import { type Page } from "@playwright/test";
import {
  passTimeUntilChecked,
  pausePageClock,
} from "../../dashboard/tests/autoRefreshJourney.ts";
import { expect, test } from "../../dashboard/tests/dashboardTest.ts";
import { projectTab } from "../../dashboard/tests/projectChoice.ts";
import {
  shortRevision,
  controlsBesideSessions,
  expectMembership,
  expectProblemAndNoSnapshot,
  openDirection,
  parts,
} from "../../dashboard/tests/dashboardPage.ts";
import {
  describedRevision,
  publishedFile,
} from "../../dashboard/tests/describedRevisions.ts";
import type { PublishedRevision } from "../../dashboard/tests/publishedFiles.ts";
import {
  backlogPath,
  notLoggedIn,
  publishMovingOrigin,
  type MovingOrigin,
  type OriginAnswer,
} from "../../dashboard/tests/publishedOrigin.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import type { Backlog } from "../../Distribution/tests/support/repositoryTestData.mjs";

const doughnutRepository = "nerds-odd-e/doughnut";
const pygardonRepository = "terryyin/pygardon";

// The one published revision of a project stating `backlog`.
function publishedWith(revision: string, backlog: Backlog): PublishedRevision {
  return describedRevision(
    makeMe.aRepository.withRevision("published", { backlog }).please(),
    revision,
  );
}

const openDoughTitle = "Open Dough's own queued story";
const openDoughPublished = publishedWith("d0".repeat(20), {
  queued: [
    makeMe.aBacklogEntry
      .with({
        identity: "SEED-900#queued",
        title: openDoughTitle,
        href: "seeds/SEED-900-open-dough.md#queued",
      })
      .please(),
  ],
});

const doughnutRevision = "d1".repeat(20);
const doughnutTitle = "Doughnut's own queued story";
const doughnutPublished = publishedWith(doughnutRevision, {
  queued: [
    makeMe.aBacklogEntry
      .with({
        identity: "SEED-901#queued",
        title: doughnutTitle,
        href: "seeds/SEED-901-doughnut.md#queued",
      })
      .please(),
  ],
});

const pygardonRevision = "c1".repeat(20);
const pygardonTakenTitle = "Pygardon's own taken story";
const pygardonQueuedTitle = "Pygardon's own queued story";
const pygardonDirection =
  "Recover from a failed read without losing project context.";
const pygardonPublished = publishedWith(pygardonRevision, {
  direction: pygardonDirection,
  taken: [
    makeMe.aBacklogEntry
      .with({
        identity: "PYG-200#story",
        title: pygardonTakenTitle,
        href: "slice-plans/200-pygardon-story/PLAN.md",
      })
      .please(),
  ],
  queued: [
    makeMe.aBacklogEntry
      .with({
        identity: "PYG-201#queued",
        title: pygardonQueuedTitle,
        href: "seeds/SEED-200-pygardon.md#queued",
      })
      .please(),
  ],
});

// Moves `origin`'s `main` to `at`.
function pushTo(origin: MovingOrigin, at: PublishedRevision): void {
  origin.push(at.revision, publishedFile(at, backlogPath));
}

// `gh` fails in a way this boundary cannot put a category to.
const unexplainedFailure: OriginAnswer = {
  exitCode: 1,
  stderr: "gh: unexplained failure\n",
};

async function publishOpenDough(page: Page): Promise<void> {
  const openDough = await publishMovingOrigin(page);
  pushTo(openDough, openDoughPublished);
}

async function publishOpenDoughAndDoughnut(page: Page): Promise<void> {
  await publishOpenDough(page);
  const doughnut = await publishMovingOrigin(page, doughnutRepository);
  pushTo(doughnut, doughnutPublished);
}

test.describe("project read recovery", () => {
  test("an unavailable Pygardon read shows an actionable, project-specific failure while another project remains selectable; restoring access and reloading reads Pygardon; a later failed check keeps only Pygardon's previous snapshot", async ({
    page,
  }) => {
    await publishOpenDoughAndDoughnut(page);
    const pygardonOrigin = await publishMovingOrigin(page, pygardonRepository);
    const restoreLogin = pygardonOrigin.answerWith("main", notLoggedIn);

    await pausePageClock(page);
    await page.goto("/");
    const { project, direction, problem, readRevision } = parts(page);
    const pygardon = projectTab(page, "Pygardon");
    const selectedProject = project.getByRole("radio", { checked: true });
    await expectMembership(page, { taken: [], backlog: [openDoughTitle] });

    await test.step("selecting Pygardon while gh is not logged in shows an actionable failure and no snapshot", async () => {
      await pygardon.check();
      await expectProblemAndNoSnapshot(
        page,
        "The local GitHub CLI is not logged in, so main of terryyin/pygardon could not be read. Run `gh auth login` (check with `gh auth status`), then reload the page.",
        undefined,
        "Pygardon",
      );
    });

    await test.step("the selector stays enabled and keyboard-operable, and another project remains fully readable", async () => {
      await expect(selectedProject).toBeEnabled();
      await selectedProject.focus();
      await expect(selectedProject).toBeFocused();
      await page.keyboard.press("ArrowLeft");
      await expectMembership(page, { taken: [], backlog: [doughnutTitle] });
      await expect(readRevision).toContainText(shortRevision(doughnutRevision));
      await expect(problem).toHaveCount(0);
    });

    await test.step("returning to Pygardon while access is still unavailable starts a fresh, still-failing read -- not stale Doughnut data", async () => {
      await pygardon.check();
      await expect(problem).toContainText(
        "The local GitHub CLI is not logged in, so main of terryyin/pygardon could not be read.",
      );
      await expect(page.locator("body")).not.toContainText(doughnutTitle);
      await expect(page.getByRole("article")).toHaveCount(0);
    });

    await test.step("restoring existing access and reloading reads Pygardon's actual published work", async () => {
      restoreLogin();
      pushTo(pygardonOrigin, pygardonPublished);
      await page.reload();
      await expectMembership(page, {
        taken: [pygardonTakenTitle],
        backlog: [pygardonQueuedTitle],
      });
      await openDirection(page);
      await expect(direction).toContainText(pygardonDirection);
      await expect(readRevision).toContainText(shortRevision(pygardonRevision));
      await expect(problem).toHaveCount(0);
    });

    await test.step("a later failed check keeps only Pygardon's previous snapshot, with the failure reported alongside it", async () => {
      pygardonOrigin.answerWith("main", unexplainedFailure);
      await passTimeUntilChecked(page, 502);
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
      // Failed check: status names no revision; membership proves Pygardon's snapshot.
      await expect(page.locator("body")).not.toContainText(doughnutTitle);
      await expect(page.locator("body")).not.toContainText(openDoughTitle);
    });
  });

  test.describe("with a read bound short enough to wait out here", () => {
    // Yet long enough that the ordinary Open Dough read finishes under load.
    test.use({ readTimeoutMs: 2_000 });

    test("the bounded stalled-read timeout resolves into the same ordinary recoverable failure as any other cause, and a reload after restored access succeeds", async ({
      page,
    }) => {
      await publishOpenDough(page);
      const pygardonOrigin = await publishMovingOrigin(
        page,
        pygardonRepository,
      );
      const releaseRef = pygardonOrigin.hold("main");

      await page.goto("/");
      const { problem } = parts(page);
      await expectMembership(page, { taken: [], backlog: [openDoughTitle] });

      await projectTab(page, "Pygardon").check();
      await expect(problem).toContainText("Published work could not be read", {
        timeout: 10_000,
      });
      await expect(problem).toContainText(
        "The local GitHub CLI did not answer within 2 seconds while reading main of terryyin/pygardon.",
      );
      await expect(problem).toContainText(
        "This page reads the published work at",
      );
      await expect(controlsBesideSessions(page)).toHaveCount(0);
      await expect(page.getByRole("article")).toHaveCount(0);

      releaseRef();
      pushTo(pygardonOrigin, pygardonPublished);
      await page.reload();
      await expectMembership(page, {
        taken: [pygardonTakenTitle],
        backlog: [pygardonQueuedTitle],
      });
      await expect(problem).toHaveCount(0);
    });
  });
});
