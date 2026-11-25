// Releasing a deselected project's held answer cannot replace the selected view.

import type { Page } from "@playwright/test";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  shortRevision,
  expectMembership,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  doughnutBacklog,
  doughnutRepository,
  doughnutSharedTitle,
  sharedStoryIdentity,
} from "../../dashboard/test-support/doughnutProject.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import {
  focusCanonicalRecord,
  storyCard,
} from "../../dashboard/test-support/storyCardControls.ts";
import { projectTab } from "../../dashboard/test-support/projectChoice.ts";
import {
  backlogPath,
  pathsRead,
  rateLimitedAnswer,
} from "../../dashboard/test-support/publishedOrigin.ts";

import { publishMovingHistory } from "../../dashboard/test-support/publishedMovingOrigin.ts";
import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";

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
const openDoughHistory = makeMe.aRepository
  .withRevision("first", {
    backlog: { queued: [sharedStoryTold(openDoughSharedTitleFirst)] },
  })
  .withRevision("second", {
    backlog: { queued: [sharedStoryTold(openDoughSharedTitleSecond)] },
  })
  .withRevision("third", {
    backlog: { queued: [sharedStoryTold(openDoughSharedTitleThird)] },
  })
  .please();

const doughnutHistory = makeMe.aRepository
  .withRevision("published", { files: { [backlogPath]: doughnutBacklog } })
  .please();

async function openBothOrigins(
  page: Page,
  afterGitHubStops: (cleanup: () => Promise<void>) => void,
) {
  const openDough = await publishMovingHistory(
    page,
    openDoughHistory,
    "first",
    afterGitHubStops,
  );
  const doughnut = await publishMovingHistory(
    page,
    doughnutHistory,
    "published",
    afterGitHubStops,
    doughnutRepository,
  );
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
    afterGitHubStops,
  }) => {
    const { openDough, doughnut } = await openBothOrigins(
      page,
      afterGitHubStops,
    );
    const { project, backlog, readRevision } = parts(page);

    const releaseDoughnut = doughnut.hold("main");
    await projectTab(page, "Doughnut").check();
    await expect.poll(() => doughnut.requests.length).toBeGreaterThan(0);

    await test.step("the selector is never blocked while Doughnut's read is outstanding", async () => {
      const selectedProject = project.getByRole("radio", { checked: true });
      await expect(selectedProject).toBeEnabled();
      await selectedProject.focus();
      await expect(selectedProject).toBeFocused();
    });

    openDough.advanceTo("second");
    await page.keyboard.press("ArrowLeft");

    await test.step("Open Dough's fresh read is shown; Doughnut's outstanding read is not waited on or shown", async () => {
      await expectMembership(page, {
        taken: [],
        backlog: [openDoughSharedTitleSecond],
      });
      await expect(readRevision).toContainText(
        shortRevision(openDough.revisions.second),
      );
      await expect(page.locator("body")).not.toContainText(doughnutSharedTitle);
    });

    const secondLink = await focusCanonicalRecord(
      storyCard(backlog, openDoughSharedTitleSecond),
    );
    await expect(secondLink).toBeFocused();

    await test.step("Doughnut's held read answers late with success, after Open Dough is already shown", async () => {
      releaseDoughnut();
      // Switching aborted the old read, so release cannot revive it.
      await expect(page.locator("body")).not.toContainText(doughnutSharedTitle);
      await expect(readRevision).toContainText(
        shortRevision(openDough.revisions.second),
      );
      await expect(projectTab(page, "Open Dough")).toBeChecked();
      expect(doughnut.requests).toHaveLength(1);
    });

    await test.step("focus stayed in the selection context: the late response did not pull it onto Doughnut's cards or the board", async () => {
      await expect(secondLink).toBeFocused();
      await expect(parts(page).notice).toBeEmpty();
    });
  });

  test("a late failure from a deselected project's outstanding read never surfaces as the newly selected project's failure", async ({
    page,
    afterGitHubStops,
  }) => {
    const { openDough, doughnut } = await openBothOrigins(
      page,
      afterGitHubStops,
    );
    const { readRevision } = parts(page);

    doughnut.answerWith("main", rateLimitedAnswer());
    const releaseDoughnut = doughnut.hold("main");
    await projectTab(page, "Doughnut").check();
    await expect.poll(() => doughnut.requests.length).toBeGreaterThan(0);

    openDough.advanceTo("second");
    await projectTab(page, "Open Dough").check();
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
        shortRevision(openDough.revisions.second),
      );
      expect(doughnut.requests).toHaveLength(1);
    });
  });

  test("returning to a project whose read is still outstanding elsewhere starts a third, fresh read rather than replaying its first snapshot, even with a shared work identity", async ({
    page,
    afterGitHubStops,
    dashboard,
  }) => {
    const { openDough, doughnut } = await openBothOrigins(
      page,
      afterGitHubStops,
    );
    const pins = openDough.revisions;
    const routedHead = (repository: string) =>
      remoteBranchHead(gitHubRepositoryUrl(repository), "refs/heads/main", {
        cwd: dashboard.home,
        env: { HOME: dashboard.home },
        maxBuffer: 4096,
      });
    expect(await routedHead("terryyin/open-dough")).toBe(pins.first);
    expect(await routedHead(doughnutRepository)).toBe(
      doughnut.revisions.published,
    );
    const { backlog, readRevision } = parts(page);

    const releaseDoughnut = doughnut.hold("main");
    await projectTab(page, "Doughnut").check();
    await expect.poll(() => doughnut.requests.length).toBeGreaterThan(0);

    openDough.advanceTo("third");
    expect(await routedHead("terryyin/open-dough")).toBe(pins.third);
    await projectTab(page, "Open Dough").check();

    await test.step("the third, fresh Open Dough read is shown -- not the first snapshot, and not Doughnut's", async () => {
      await expectMembership(page, {
        taken: [],
        backlog: [openDoughSharedTitleThird],
      });
      await expect(readRevision).toContainText(shortRevision(pins.third));
      await expect(page.locator("body")).not.toContainText(
        openDoughSharedTitleFirst,
      );
      await expect(page.locator("body")).not.toContainText(doughnutSharedTitle);
      // The mount and return read Open Dough; Doughnut is never retried.
      expect(pathsRead(openDough)).toEqual([
        "main",
        `PRODUCT-BACKLOG.md?ref=${pins.first}`,
        "main",
        `PRODUCT-BACKLOG.md?ref=${pins.third}`,
      ]);
      expect(doughnut.requests).toHaveLength(1);
    });

    const thirdCard = backlog.getByRole("article", {
      name: openDoughSharedTitleThird,
    });
    const record = await focusCanonicalRecord(thirdCard);

    await test.step("Doughnut's stale first-round read answers even later; the third Open Dough read still stands", async () => {
      releaseDoughnut();
      await expectMembership(page, {
        taken: [],
        backlog: [openDoughSharedTitleThird],
      });
      await expect(record).toBeFocused();
    });
  });
});
