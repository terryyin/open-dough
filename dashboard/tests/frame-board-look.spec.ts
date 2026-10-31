// The frame's look: the row below the banner, the
// Board's headings and counts, and what the frame
// says in place of work -- an empty column, a failed read, no projects -- read
// clearly, keep their names, and fit a narrow window without sideways
// scrolling. With no project, Open Dough's mark still leads the banner and
// System settings. The cards inside the Board are not this look's to change.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test as machineTest } from "./support/pageTest.ts";
import { expect, test } from "./dashboardTest.ts";
import { pausePageClock, passTimeUntilChecked } from "./autoRefreshJourney.ts";
import {
  expectControlContrast,
  expectReadableContrast,
  narrowWindow,
  zoomedWindow,
} from "./accessibleReading.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { openDirection, parts } from "./dashboardPage.ts";
import { expectDecorativeIcon } from "./frameIconControl.ts";
import { expectProductMark } from "./productMark.ts";
import {
  compactProjectSelectCut,
  expectNoSidewaysScrollAndWholeText,
} from "./pageLayout.ts";
import {
  emptyBacklog,
  publishMovingOrigin,
  rateLimitedAnswer,
} from "./publishedOrigin.ts";
import { buildOpenDoughReadinessRepo } from "./storyReadinessFixture.ts";
import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";
import { back, settings } from "./support/systemSettingsPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";

test("the row below the banner and the Board read clearly in the frame's look", async ({
  page,
  afterGitHubStops,
}) => {
  const repo = buildOpenDoughReadinessRepo(afterGitHubStops);
  await publishCommittedOrigin(page, {
    repoDir: repo.directory,
    revision: repo.revision,
    repository: "terryyin/open-dough",
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await openUntilRead(page);
  const { backlog, taken, directionToggle } = parts(page);
  await expect(backlog.getByRole("article").first()).toBeVisible();

  const start = page.getByRole("button", {
    name: "Start session in Open Dough",
  });
  await expect(start).toHaveText("Start session");
  await expectDecorativeIcon(start);
  await expectReadableContrast(start);
  await expectControlContrast(start);

  await expectDecorativeIcon(directionToggle);
  await expectReadableContrast(
    directionToggle.getByRole("heading", { name: "Near-future direction" }),
  );

  for (const [column, name] of [
    [backlog, "Backlog"],
    [taken, "Taken"],
  ] as const) {
    await expectReadableContrast(
      column.getByRole("heading", { level: 2, name, exact: true }),
    );
    await expectReadableContrast(column.getByText(/^\d+ entr(y|ies)$/));
  }

  for (const size of [narrowWindow, zoomedWindow]) {
    await page.setViewportSize(size);
    await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);
  }
  await openDirection(page);
  await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);
});

test("an empty column and a failed read are said in the frame's look, whole in a narrow window", async ({
  page,
}) => {
  await pausePageClock(page);
  const origin = await publishMovingOrigin(page);
  origin.push("e1".repeat(20), emptyBacklog);
  await page.setViewportSize(narrowWindow);
  await openUntilRead(page);
  const { backlog, problem } = parts(page);
  const empty = backlog.getByText("No Backlog entries are recorded.");
  await expect(empty).toBeVisible();
  await expectReadableContrast(empty);

  origin.answerWith("main", rateLimitedAnswer());
  await passTimeUntilChecked(page, 502);
  const heading = problem.getByRole("heading", {
    name: "Published work could not be read",
  });
  await expect(heading).toBeVisible();
  await expectDecorativeIcon(heading);
  for (const text of await problem.locator("h2, p").all())
    await expectReadableContrast(text);
  await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);
  await page.setViewportSize(zoomedWindow);
  await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);
});

machineTest(
  "no projects configured reads clearly and whole in a narrow window",
  async ({ page }) => {
    const machine = mkdtempSync(path.join(tmpdir(), "dough-frame-look-"));
    const server = await startDashboardServer({
      mode: "dev",
      machine,
      prebuilt: builtDashboardDir,
      configureDevelopmentProjects: false,
    });
    try {
      await page.setViewportSize(narrowWindow);
      await openUntilRead(page, server.baseURL);
      const heading = page.getByRole("heading", {
        name: "No projects configured",
      });
      await expect(heading).toBeVisible();
      await expectReadableContrast(heading);
      await expectReadableContrast(
        page.getByText("Open System settings → Projects", { exact: false }),
      );
      await expect(settings(page)).toBeInViewport({ ratio: 1 });
      await expectProductMark(page.getByRole("banner"));
      await expectNoSidewaysScrollAndWholeText(page);
      await page.setViewportSize(zoomedWindow);
      await expect(settings(page)).toBeInViewport({ ratio: 1 });
      await expectProductMark(page.getByRole("banner"));
      await expectNoSidewaysScrollAndWholeText(page);

      await settings(page).click();
      await expect(
        page.getByRole("heading", { name: "System settings", exact: true }),
      ).toBeFocused();
      await expectProductMark(page.getByRole("main"));
      await expect(back(page)).toBeVisible();
      await back(page).click();
      await expect(heading).toBeVisible();
      await expectProductMark(page.getByRole("banner"));
    } finally {
      await server.close();
      rmSync(machine, { recursive: true, force: true });
    }
  },
);
