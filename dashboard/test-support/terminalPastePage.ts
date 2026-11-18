// Phone clipboard setup and Paste control. Ordinary screen/status/input and
// reconnect stay on ./terminalScreenPage.ts; touch key tapping stays on
// ./touchTerminalPage.ts. Clipboard payloads remain caller facts; helpers do
// not submit, reconnect, or retry on their own.
import type { Locator, Page } from "@playwright/test";
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
import { noteTerminalTraffic, terminalKey } from "./touchTerminalPage.ts";

export { test };

export function pasteKey(panel: Locator) {
  return terminalKey(panel, "Paste");
}

export async function copyClipboardText(page: Page, text: string) {
  await page.evaluate((value) => navigator.clipboard.writeText(value), text);
}

export async function copyClipboardHtmlOnly(page: Page, html: string) {
  await page.evaluate(
    (markup) =>
      navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([markup], { type: "text/html" }),
        }),
      ]),
    html,
  );
}

// Puts PNG (and optional plain text) on the clipboard. Returns Chromium's
// normalized PNG bytes after read — the same input Paste will POST.
export async function copyClipboardPng(
  page: Page,
  pngBase64: string,
  mixedText?: string,
) {
  return page.evaluate(
    async ({ image, mixed }) => {
      const data = Uint8Array.from(atob(image), (character) =>
        character.charCodeAt(0),
      );
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": new Blob([data], { type: "image/png" }),
          ...(mixed
            ? {
                "text/plain": new Blob([mixed], {
                  type: "text/plain",
                }),
              }
            : {}),
        }),
      ]);
      const [item] = await navigator.clipboard.read();
      if (!item || (mixed && !item.types.includes("text/plain"))) {
        throw new Error("The clipboard did not retain the test content.");
      }
      return Array.from(
        new Uint8Array(await (await item.getType("image/png")).arrayBuffer()),
      );
    },
    { image: pngBase64, mixed: mixedText },
  );
}

export async function revokeClipboardAccess(page: Page) {
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", { value: undefined });
  });
}

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
