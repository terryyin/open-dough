// A project read can fail, recover on reload, and retain its snapshot on a later failed check.

import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import {
  passTimeUntilChecked,
  pausePageClock,
} from "../../dashboard/test-support/autoRefreshJourney.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { projectTab } from "../../dashboard/test-support/projectChoice.ts";
import {
  shortRevision,
  snapshotDependentControls,
  expectMembership,
  expectProblemAndNoSnapshot,
  openDirection,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  notLoggedIn,
  type OriginAnswer,
} from "../../dashboard/test-support/publishedOrigin.ts";
import { publishMovingHistory } from "../../dashboard/test-support/publishedMovingOrigin.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import type { Backlog } from "../../Distribution/tests/support/repositoryTestData.mjs";

const doughnutRepository = "nerds-odd-e/doughnut";
const pygardonRepository = "terryyin/pygardon";

const publishedWith = (backlog: Backlog) =>
  makeMe.aRepository.withRevision("published", { backlog }).please();

const openDoughTitle = "Open Dough's own queued story";
const openDoughPublished = publishedWith({
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

const doughnutTitle = "Doughnut's own queued story";
const doughnutPublished = publishedWith({
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

const pygardonTakenTitle = "Pygardon's own taken story";
const pygardonQueuedTitle = "Pygardon's own queued story";
const pygardonDirection =
  "Recover from a failed read without losing project context.";
const pygardonPublished = publishedWith({
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

// `gh` fails in a way this boundary cannot put a category to.
const unexplainedFailure: OriginAnswer = {
  exitCode: 1,
  stderr: "gh: unexplained failure\n",
};

test.describe("project read recovery", () => {
  test("an unavailable Pygardon read shows an actionable, project-specific failure while another project remains selectable; restoring access and reloading reads Pygardon; a later failed check keeps only Pygardon's previous snapshot", async ({
    page,
    afterGitHubStops,
    dashboard,
  }) => {
    await publishMovingHistory(
      page,
      openDoughPublished,
      "published",
      afterGitHubStops,
    );
    const doughnut = await publishMovingHistory(
      page,
      doughnutPublished,
      "published",
      afterGitHubStops,
      doughnutRepository,
    );
    const pygardonOrigin = await publishMovingHistory(
      page,
      pygardonPublished,
      "published",
      afterGitHubStops,
      pygardonRepository,
    );
    expect(
      await remoteBranchHead(
        gitHubRepositoryUrl(pygardonRepository),
        "refs/heads/main",
        { cwd: dashboard.home, env: { HOME: dashboard.home }, maxBuffer: 4096 },
      ),
    ).toBe(pygardonOrigin.revisions.published);
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
      await expect(readRevision).toContainText(
        shortRevision(doughnut.revisions.published),
      );
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
      await page.reload();
      await expectMembership(page, {
        taken: [pygardonTakenTitle],
        backlog: [pygardonQueuedTitle],
      });
      await openDirection(page);
      await expect(direction).toContainText(pygardonDirection);
      await expect(readRevision).toContainText(
        shortRevision(pygardonOrigin.revisions.published),
      );
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
      afterGitHubStops,
    }) => {
      await publishMovingHistory(
        page,
        openDoughPublished,
        "published",
        afterGitHubStops,
      );
      const pygardonOrigin = await publishMovingHistory(
        page,
        pygardonPublished,
        "published",
        afterGitHubStops,
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
      await expect(snapshotDependentControls(page)).toHaveCount(0);
      await expect(page.getByRole("article")).toHaveCount(0);

      releaseRef();
      await page.reload();
      await expectMembership(page, {
        taken: [pygardonTakenTitle],
        backlog: [pygardonQueuedTitle],
      });
      await expect(problem).toHaveCount(0);
    });
  });
});
