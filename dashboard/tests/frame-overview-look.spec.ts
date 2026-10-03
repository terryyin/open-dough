// The overview's frame in the frame's look: the row below the banner, the
// stages' headings and counts, the Taking work connector, and what the frame
// says in place of work -- an empty stage, a failed read, no projects -- read
// clearly, keep their names, and fit a narrow window without sideways
// scrolling. The cards inside the stages are not this look's to change.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test as machineTest } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import {
  expectControlContrast,
  expectReadableContrast,
  narrowWindow,
  zoomedWindow,
} from "./accessibleReading.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { openDirection, parts } from "./dashboardPage.ts";
import { expectDecorativeIcon } from "./frameIconControl.ts";
import { expectNoSidewaysScrollAndWholeText } from "./pageLayout.ts";
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
import { settings } from "./support/systemSettingsPage.ts";

test("the row below the banner, the stages, and the connector read clearly in the frame's look", async ({
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
  await page.goto("/");
  const { stages, backlog, taken, connector, directionToggle } = parts(page);
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

  for (const [stage, name] of [
    [backlog, "Backlog"],
    [taken, "Taken"],
  ] as const) {
    await expectReadableContrast(
      stage.getByRole("heading", { level: 2, name, exact: true }),
    );
    await expectReadableContrast(stage.getByText(/^\d+ entr(y|ies)$/));
  }
  await expectReadableContrast(connector);
  await expectReadableContrast(
    stages.getByText("not a dependency between entries", { exact: false }),
  );

  for (const size of [narrowWindow, zoomedWindow]) {
    await page.setViewportSize(size);
    await expectNoSidewaysScrollAndWholeText(page);
  }
  await openDirection(page);
  await expectNoSidewaysScrollAndWholeText(page);
});

test("an empty stage and a failed read are said in the frame's look, whole in a narrow window", async ({
  page,
}) => {
  const origin = await publishMovingOrigin(page);
  origin.push("e1".repeat(20), emptyBacklog);
  await page.setViewportSize(narrowWindow);
  await page.goto("/");
  const { backlog, refresh, problem } = parts(page);
  const empty = backlog.getByText("No Backlog entries are recorded.");
  await expect(empty).toBeVisible();
  await expectReadableContrast(empty);

  origin.answerWith("main", rateLimitedAnswer());
  await refresh.click();
  const heading = problem.getByRole("heading", {
    name: "Published work could not be read",
  });
  await expect(heading).toBeVisible();
  await expectDecorativeIcon(heading);
  for (const text of await problem.locator("h2, p").all())
    await expectReadableContrast(text);
  await expectNoSidewaysScrollAndWholeText(page);
  await page.setViewportSize(zoomedWindow);
  await expectNoSidewaysScrollAndWholeText(page);
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
      await page.goto(server.baseURL);
      const heading = page.getByRole("heading", {
        name: "No projects configured",
      });
      await expect(heading).toBeVisible();
      await expectReadableContrast(heading);
      await expectReadableContrast(
        page.getByText("Open System settings → Projects", { exact: false }),
      );
      await expect(settings(page)).toBeInViewport({ ratio: 1 });
      await expectNoSidewaysScrollAndWholeText(page);
      await page.setViewportSize(zoomedWindow);
      await expectNoSidewaysScrollAndWholeText(page);
    } finally {
      await server.close();
      rmSync(machine, { recursive: true, force: true });
    }
  },
);
