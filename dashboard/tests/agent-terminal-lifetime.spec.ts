// The page's one terminal (./agent-terminal.spec.ts) over its lifetime, on
// the committed story-stages origin (./launchJourney.ts): switching projects
// keeps it attached to the same session; when the dashboard server restarts,
// the panel says it is disconnected, and Reconnect attaches to the same
// session again; when the attached CLI exits on its own (Ctrl+Z), the panel
// says the terminal ended, and Open again reattaches; a reload shows no
// terminal. The page's dashboard server keeps its HOME and the synthetic
// `claude`'s state (./fixtures/fake-claude) in a machine directory, so the
// server restarted on the same port answers the same records and sessions; the
// real `claude` is never reached.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test as base, expect } from "./dashboardTest.ts";
import { cardSessions, expectMembership, parts } from "./dashboardPage.ts";
import { doughnutSharedTitle } from "./doughnutProject.ts";
import {
  notRefinedStory,
  publishStoryStagesJourney,
  readyStory,
  takenStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";

const projectFolders = ["open-dough"];

const test = base.extend<{ machine: string }>({
  // Playwright's fixture API requires the empty destructuring pattern.
  // eslint-disable-next-line no-empty-pattern
  machine: async ({}, use) => {
    const machine = mkdtempSync(path.join(tmpdir(), "dough-lifetime-"));
    await use(machine);
    rmSync(machine, { recursive: true, force: true });
  },
  dashboard: async ({ github, machine }, use) => {
    const server = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      github,
      machine,
      projectFolders,
    });
    await use(server);
    await server.close();
  },
});

test.describe("the terminal's lifetime", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("the open terminal survives a project switch, says when it is disconnected or ended, and attaches again", async ({
    page,
    dashboard,
    github,
    machine,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    const { project } = parts(page);
    const panel = page.getByRole("region", { name: "Terminal" });
    const rows = panel.locator(".xterm-rows");
    const status = panel.getByRole("status");
    const button = (name: string) => panel.getByRole("button", { name });
    const queued = {
      taken: [],
      backlog: [takenStory, readyStory, notRefinedStory],
    };
    await expectMembership(page, queued);
    await settled();

    await launch(notRefinedStory, "Execution");
    const listed = cardSessions(card(notRefinedStory));
    await listed.getByRole("button", { name: "Open terminal" }).click();
    await expect(rows).toContainText("attached ");
    const [attach] = dashboard.claudeAttaches();
    const shortId = attach?.id ?? "";
    // Each attach the page made, to the one session it opened.
    const attaches = () =>
      dashboard.claudeAttaches().map((each) => each.id === shortId);

    await test.step("switching projects and back keeps the terminal attached to the same session", async () => {
      await project
        .getByRole("radio", { name: "Doughnut", exact: true })
        .check();
      await expectMembership(page, {
        taken: [],
        backlog: [doughnutSharedTitle],
      });
      await expect(panel.getByRole("heading", { level: 2 })).toHaveText(
        notRefinedStory,
      );
      await panel.locator(".xterm-screen").click();
      await page.keyboard.type("still here");
      await page.keyboard.press("Enter");
      await expect(rows).toContainText("echo still here");

      await project
        .getByRole("radio", { name: "Open Dough", exact: true })
        .check();
      await expectMembership(page, queued);
      await panel.locator(".xterm-screen").click();
      await page.keyboard.type("and back");
      await page.keyboard.press("Enter");
      await expect(rows).toContainText("echo and back");
      await expect(status).toBeEmpty();
      expect(attaches()).toEqual([true]);
    });

    const port = Number(new URL(dashboard.baseURL).port);
    let restarted: DashboardServer | undefined;
    try {
      await test.step("a restarted dashboard server leaves the panel disconnected, and Reconnect attaches to the same session again", async () => {
        await dashboard.close();
        await expect(status).toHaveText(
          /^Disconnected from the session\s*Reconnect$/,
        );
        await expect(panel.getByRole("heading", { level: 2 })).toHaveText(
          notRefinedStory,
        );
        // Losing the connection only detaches: the card still lists the
        // session.
        await expect(listed).toHaveCount(1);

        restarted = await startDashboardServer({
          mode: "preview",
          prebuilt: builtDashboardDir,
          github,
          machine,
          projectFolders,
          port,
        });
        await button("Reconnect").click();
        await expect(status).toBeEmpty();
        await expect(rows).toContainText(`attached ${shortId}`);
        await expect(rows).not.toContainText("echo and back");
        expect(attaches()).toEqual([true, true]);
        await page.keyboard.type("reconnected");
        await page.keyboard.press("Enter");
        await expect(rows).toContainText("echo reconnected");
      });

      await test.step("the attached CLI exiting on its own ends the terminal, and Open again reattaches", async () => {
        await page.keyboard.press("Control+z");
        await expect(status).toHaveText(/^The terminal ended\s*Open again$/);
        await expect(button("Close")).toBeVisible();
        expect(dashboard.claudeAttaches()[1]?.endedBy).toBe("Ctrl+Z");

        await button("Open again").click();
        await expect(status).toBeEmpty();
        await expect(rows).toContainText(`attached ${shortId}`);
        await expect(rows).not.toContainText("echo reconnected");
        expect(attaches()).toEqual([true, true, true]);
      });

      await test.step("a reload shows no terminal, and the card still lists the session", async () => {
        await page.reload();
        await expectMembership(page, queued);
        await expect(panel).toHaveCount(0);
        await expect(listed).toHaveCount(1);
      });
    } finally {
      await restarted?.close();
    }
  });
});
