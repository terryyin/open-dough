import type { Locator, Page } from "@playwright/test";
import { test as base, expect } from "./support/voiceTest.ts";
import { voiceBrowserOptions } from "./support/voiceRecovery.ts";
import {
  observeMicrophone,
  seedVoiceKey,
  stoppedTracks,
  holdCompletedVoiceResponse,
} from "./support/voicePage.ts";
import {
  beginTerminalClip,
  openTerminalVoice,
  stopTerminalClip,
} from "./support/terminalVoicePage.ts";
import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";
import { noteTerminalTraffic } from "./touchTerminalPage.ts";

type TerminalServer = {
  disconnect: () => Promise<void>;
  start: () => Promise<void>;
};

// The same machine and port preserve records while the real server and its
// native attachment stop and restart, as in agent-terminal-lifetime.spec.ts.
const test = base.extend<{ terminalServer: TerminalServer }>({
  terminalServer: async ({ dashboard, github, provider }, use) => {
    let active = dashboard;
    await use({
      disconnect: () => active.close(),
      start: async () => {
        active = await startDashboardServer({
          mode: "preview",
          prebuilt: builtDashboardDir,
          github,
          machine: provider.machine,
          projectFolders: voiceBrowserOptions.projectFolders,
          extraEnv: provider.extraEnv,
          port: Number(new URL(dashboard.baseURL).port),
        });
      },
    });
    await active.close();
  },
});

test.use(voiceBrowserOptions);
test.beforeEach(async ({ page }) => {
  await observeMicrophone(page);
});

async function completeWhileDisconnected(
  page: Page,
  panel: Locator,
  server: TerminalServer,
) {
  const delivery = await holdCompletedVoiceResponse(page);
  await beginTerminalClip(page, panel);
  await stopTerminalClip(page, panel);
  await delivery.ready();
  await server.disconnect();
  await expect(panel.getByRole("status")).toContainText(
    "Disconnected from the session",
  );
  await delivery.release();
}

test("a retained transcript waits through reconnect, Insert offers it once, and later reconnect never resends it", async ({
  page,
  dashboard,
  provider,
  launchJourney,
  terminalServer,
}) => {
  seedVoiceKey(dashboard.home);
  provider.setText("the recovered header\nand controls\u0007");
  const transcript = "the recovered header and controls";
  const { sent } = noteTerminalTraffic(page);
  const { panel } = await openTerminalVoice(page, dashboard, launchJourney);
  const session = dashboard.claudeAttaches()[0]?.id;
  const retained = panel.getByRole("textbox", { name: "Unsent transcript" });
  const insert = panel.getByRole("button", { name: "Insert transcript" });
  const record = panel.getByRole("button", { name: "Dictate into terminal" });
  const input = panel.locator(".xterm-helper-textarea");
  await completeWhileDisconnected(page, panel, terminalServer);
  await expect(retained).toHaveValue(transcript);
  await expect(panel.getByRole("status")).toContainText("was not inserted");
  await expect(record).toBeDisabled();
  await insert.click();
  await expect(retained).toHaveValue(transcript);
  expect(sent).toEqual([]);
  await terminalServer.start();
  await panel.getByRole("button", { name: "Reconnect", exact: true }).click();
  await expect(panel.locator(".xterm-rows")).toContainText(
    `attached ${session}`,
  );
  await expect(retained).toHaveValue(transcript);
  // Absence has no completion event: observe a quiet, attached input window.
  await page.waitForTimeout(150);
  expect(sent).toEqual([]);
  await expect(record).toBeDisabled();
  await input.focus();
  await page.keyboard.type("Review ");
  await insert.click();
  await expect(retained).toHaveCount(0);
  await expect(record).toBeEnabled();
  await expect(input).toBeFocused();
  await expect
    .poll(() => sent.filter((text) => text === transcript))
    .toEqual([transcript]);
  await expect(panel.locator(".xterm-rows")).toContainText(transcript);
  expect(dashboard.claudeAttaches().at(-1)?.id).toBe(session);
  expect(dashboard.claudeAttaches().at(-1)?.lines).toEqual([]);
  await page.keyboard.press("Backspace");
  await page.keyboard.type("!");
  await page.keyboard.press("Enter");
  await expect
    .poll(() => dashboard.claudeAttaches().at(-1)?.lines)
    .toEqual(["Review the recovered header and control!"]);
  await terminalServer.disconnect();
  await expect(panel.getByRole("status")).toContainText("Disconnected");
  await terminalServer.start();
  await panel.getByRole("button", { name: "Reconnect", exact: true }).click();
  await expect(panel.getByRole("status")).toBeEmpty();
  await expect(panel.locator(".xterm-rows")).toContainText(
    `attached ${session}`,
  );
  await page.waitForTimeout(150);
  expect(sent.filter((text) => text === transcript)).toEqual([transcript]);
  expect(dashboard.claudeAttaches().at(-1)?.lines).toEqual([]);
  expect(provider.calls).toHaveLength(1);
});

test("Discard sends no retained text and makes another capture available", async ({
  page,
  dashboard,
  provider,
  launchJourney,
  terminalServer,
}) => {
  seedVoiceKey(dashboard.home);
  const transcript = "retain all these words ".repeat(210).trim();
  provider.setText(transcript);
  const { sent } = noteTerminalTraffic(page);
  const { panel } = await openTerminalVoice(page, dashboard, launchJourney);
  await completeWhileDisconnected(page, panel, terminalServer);
  const retained = panel.getByRole("textbox", { name: "Unsent transcript" });
  await expect(retained).toHaveValue(transcript);
  await terminalServer.start();
  await panel.getByRole("button", { name: "Reconnect", exact: true }).click();
  await expect(panel.locator(".xterm-rows")).toContainText("attached ");
  await expect(retained).toHaveValue(transcript);
  await panel.getByRole("button", { name: "Discard transcript" }).click();
  await expect(retained).toHaveCount(0);
  await expect(panel.getByRole("status")).toBeEmpty();
  await page.waitForTimeout(150);
  expect(sent).toEqual([]);
  expect(dashboard.claudeAttaches().at(-1)?.lines).toEqual([]);
  await beginTerminalClip(page, panel);
  await panel.getByRole("button", { name: "Close", exact: true }).click();
  await expect.poll(() => stoppedTracks(page)).toBe(true);
  expect(provider.calls).toHaveLength(1);
});

for (const action of ["Close", "switch"] as const) {
  test(`${action} clears retained text before B or a reopened A can receive it`, async ({
    page,
    dashboard,
    provider,
    launchJourney,
    terminalServer,
  }) => {
    seedVoiceKey(dashboard.home);
    provider.setText("belongs only to this view of A");
    const { sent } = noteTerminalTraffic(page);
    const { panel, open } = await openTerminalVoice(
      page,
      dashboard,
      launchJourney,
    );
    await completeWhileDisconnected(page, panel, terminalServer);
    const retained = panel.getByRole("textbox", { name: "Unsent transcript" });
    await expect(retained).toHaveValue("belongs only to this view of A");
    await terminalServer.start();
    if (action === "Close") {
      await panel.getByRole("button", { name: "Close", exact: true }).click();
      await expect(panel).toHaveCount(0);
    }
    await open("Voice session B");
    await expect(retained).toHaveCount(0);
    await expect(panel.getByRole("status")).toBeEmpty();
    await open();
    await expect(retained).toHaveCount(0);
    await expect(panel.getByRole("status")).toBeEmpty();
    await expect(
      panel.getByRole("button", { name: "Dictate into terminal" }),
    ).toBeEnabled();
    await page.waitForTimeout(150);
    expect(sent).toEqual([]);
    expect(
      dashboard.claudeAttaches().every((attach) => attach.lines.length === 0),
    ).toBe(true);
  });
}
