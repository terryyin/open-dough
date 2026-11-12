// Optional phone composer Insert without submit on the ordinary
// page/xterm/WebSocket/PTY path. Insert places draft text once without
// Enter; deliberate toolbar Enter submits; unavailable attachment keeps the
// draft for a deliberate retry and never auto-replays after reconnect.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test as base } from "../dashboardTest.ts";
import { launched } from "../agentTerminalBoundary.ts";
import {
  expectTerminalText,
  insertTerminalText,
  reconnectTerminal,
  terminalPanel,
  terminalStatus,
} from "../terminalScreenPage.ts";
import {
  publishStoryColumnsJourney,
  type StoryColumnsJourney,
} from "../launchJourney.ts";
import { openStoryColumnsJourney } from "../storyColumnsPage.ts";
import { sessionsSidebarParts } from "../sessionsSidebarPage.ts";
import { tapWhereShown } from "../pageLayout.ts";
import { phoneLaunchTouchViewport } from "../touchLaunchPage.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
  type DashboardServer,
} from "../support/dashboardServer.ts";
import {
  composeToggle,
  expectMinTouchTarget,
  focusByTouch,
  insertDraftButton,
  noteTerminalTraffic,
  openTerminalComposer,
  tapTerminalKey,
  terminalComposerDraft,
} from "../touchTerminalPage.ts";

const test = base.extend<{ machine: string }>({
  // Playwright's fixture API requires the empty destructuring pattern.
  // eslint-disable-next-line no-empty-pattern
  machine: async ({}, use) => {
    const machine = mkdtempSync(path.join(tmpdir(), "dough-phone-composer-"));
    await use(machine);
    rmSync(machine, { recursive: true, force: true });
  },
  dashboard: async ({ github, machine }, use) => {
    const server = await startDashboardServer({
      mode: "preview",
      prebuilt: sharedDashboardBuild,
      github,
      machine,
      projectFolders: ["open-dough"],
    });
    await use(server);
    await server.close();
  },
});

let journey: StoryColumnsJourney;
test.beforeAll(async () => {
  journey = await publishStoryColumnsJourney();
});
test.afterAll(() => (journey as StoryColumnsJourney | undefined)?.cleanup());

const composerTitle = "Phone terminal composer session";

test.describe("phone terminal composer Insert without submit", () => {
  test.use({
    viewport: phoneLaunchTouchViewport.portrait,
    hasTouch: true,
  });

  test("composer Insert places text once without Enter; deliberate Enter submits; unavailable attachment keeps the draft", async ({
    page,
    dashboard,
    github,
    machine,
  }) => {
    const native = await launched(dashboard, "open-dough", {
      identity: "SEED-901#phone-terminal-composer",
      title: composerTitle,
    });
    const opened = await openStoryColumnsJourney(page, journey);
    await opened.settled();
    const sidebar = sessionsSidebarParts(page);
    await tapWhereShown(sidebar.button);
    const { sent } = noteTerminalTraffic(page);
    await tapWhereShown(sidebar.entry(composerTitle));
    const panel = terminalPanel(page);
    const draftText = "revise this longer phone instruction";
    await expectTerminalText(panel, `attached ${native.shortId}`);
    await expect(composeToggle(panel)).toHaveCount(0);
    await expect(terminalComposerDraft(panel)).toHaveCount(0);
    await openTerminalComposer(panel);
    const draft = terminalComposerDraft(panel);
    const insert = insertDraftButton(panel);
    await expect(insert).toBeVisible();
    await expectMinTouchTarget(insert);

    await test.step("Insert reaches the PTY once without trailing Enter; direct typing stays available", async () => {
      await draft.fill(draftText);
      await tapWhereShown(insert);
      await expect(draft).toHaveValue("");
      await expect.poll(() => sent.join("")).toBe(draftText);
      expect(sent.join("").includes("\r")).toBe(false);
      expect(dashboard.claudeAttaches()[0]?.lines).toEqual([]);
      await focusByTouch(panel);
      // Soft-keyboard typing inserts without submitting; toolbar Enter alone submits.
      await insertTerminalText(page, " and typed");
      await expect.poll(() => sent.join("")).toBe(`${draftText} and typed`);
    });

    await test.step("deliberate toolbar Enter submits the line", async () => {
      await tapTerminalKey(panel, "Enter");
      await expectTerminalText(panel, `echo ${draftText} and typed`);
      await expect
        .poll(() => dashboard.claudeAttaches()[0]?.lines)
        .toEqual([`${draftText} and typed`]);
      expect(sent.join("")).toBe(`${draftText} and typed\r`);
    });

    const port = Number(new URL(dashboard.baseURL).port);
    let restarted: DashboardServer | undefined;
    try {
      await test.step("unavailable attachment keeps the unsent draft; reconnect never auto-replays", async () => {
        const retained = "held until deliberate Insert after reconnect";
        await draft.fill(retained);
        await dashboard.close();
        await expect(terminalStatus(panel)).toContainText(
          "Disconnected from the session",
        );
        await expect(draft).toHaveValue(retained);
        const beforeFailedInsert = [...sent];
        await tapWhereShown(insert);
        await expect(draft).toHaveValue(retained);
        expect(sent).toEqual(beforeFailedInsert);
        restarted = await startDashboardServer({
          mode: "preview",
          prebuilt: sharedDashboardBuild,
          github,
          machine,
          projectFolders: ["open-dough"],
          port,
        });
        await page.clock.install();
        await reconnectTerminal(panel);
        await expectTerminalText(panel, `attached ${native.shortId}`);
        await expect(terminalStatus(panel)).toBeEmpty();
        await expect(draft).toHaveValue(retained);
        // Explicit advance: reconnect must not auto-send the retained draft.
        await page.clock.runFor(150);
        expect(sent).toEqual(beforeFailedInsert);
        await tapWhereShown(insert);
        await expect(draft).toHaveValue("");
        await expect
          .poll(() => sent.slice(beforeFailedInsert.length).join(""))
          .toBe(retained);
        expect(
          sent.slice(beforeFailedInsert.length).join("").includes("\r"),
        ).toBe(false);
        expect(dashboard.claudeAttaches().at(-1)?.lines).toEqual([]);
      });
    } finally {
      await restarted?.close();
    }
  });
});
