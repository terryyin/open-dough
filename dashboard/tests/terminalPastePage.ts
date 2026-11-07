// Browser setup shared by the phone clipboard journeys.
import type { Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { launched } from "./agentTerminalBoundary.ts";
import {
  publishStoryColumnsJourney,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { tapWhereShown } from "./pageLayout.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";
import { openStoryColumnsJourney } from "./storyColumnsPage.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { phoneLaunchTouchViewport } from "./touchLaunchPage.ts";
import { noteTerminalTraffic } from "./touchTerminalPage.ts";

export { test };

export function phonePasteJourney() {
  test.use({
    projectFolders: ["open-dough"],
    viewport: phoneLaunchTouchViewport.portrait,
    hasTouch: true,
    permissions: ["clipboard-read", "clipboard-write"],
  });
  let journey: StoryColumnsJourney;
  test.beforeAll(async () => {
    journey = await publishStoryColumnsJourney();
  });
  test.afterAll(() => (journey as StoryColumnsJourney | undefined)?.cleanup());

  return async function openPasteTerminal(
    page: Page,
    dashboard: DashboardServer,
  ) {
    const title = "Phone clipboard session";
    const native = await launched(dashboard, "open-dough", {
      identity: "SEED-901#phone-terminal-paste",
      title,
    });
    const opened = await openStoryColumnsJourney(page, journey);
    await opened.settled();
    const sidebar = sessionsSidebarParts(page);
    await tapWhereShown(sidebar.button);
    const { sent } = noteTerminalTraffic(page);
    await tapWhereShown(sidebar.entry(title));
    const panel = page.getByRole("region", { name: "Terminal" });
    const rows = panel.locator(".xterm-rows");
    await expect(rows).toContainText(`attached ${native.shortId}`);
    await expect(rows).toContainText("Claude Code");
    return { panel, rows, sent, native };
  };
}
