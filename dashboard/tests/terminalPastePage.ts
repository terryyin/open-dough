// Browser setup shared by the phone clipboard journeys.
import type { Page } from "@playwright/test";
import { test } from "./dashboardTest.ts";
import { launched } from "./agentTerminalBoundary.ts";
import {
  publishStoryColumnsJourney,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { tapWhereShown } from "./pageLayout.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";
import { openStoryColumnsJourney } from "./storyColumnsPage.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import {
  expectTerminalText,
  terminalPanel,
  terminalScreenParts,
} from "./terminalScreenPage.ts";
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
    const { sent, sizes } = noteTerminalTraffic(page);
    await tapWhereShown(sidebar.entry(title));
    const panel = terminalPanel(page);
    const { rows } = terminalScreenParts(panel);
    await expectTerminalText(panel, `attached ${native.shortId}`);
    await expectTerminalText(panel, "Claude Code");
    return { panel, rows, sent, sizes, native };
  };
}
