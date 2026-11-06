// Phone Paste follows the browser clipboard through xterm to the live PTY.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { Page } from "@playwright/test";
import { expect } from "../dashboardTest.ts";
import { tapWhereShown } from "../pageLayout.ts";
import {
  builtDashboardDir,
  startDashboardServer,
} from "../support/dashboardServer.ts";
import { phonePasteJourney, test as base } from "../terminalPastePage.ts";
import {
  expectMinTouchTarget,
  focusByTouch,
  tapTerminalKey,
  terminalKey,
} from "../touchTerminalPage.ts";

const openPasteTerminal = phonePasteJourney();

const test = base.extend<{ restartMachine: string }>({
  // Playwright's fixture API requires the empty destructuring pattern.
  // eslint-disable-next-line no-empty-pattern
  restartMachine: async ({}, use) => {
    const machine = mkdtempSync(path.join(tmpdir(), "dough-phone-paste-"));
    try {
      await use(machine);
    } finally {
      rmSync(machine, { recursive: true, force: true });
    }
  },
});

const copyText = (page: Page, text: string) =>
  page.evaluate((value) => navigator.clipboard.writeText(value), text);

test("phone Paste offers text once, keeps focus as it was, and reports empty or unreadable clipboard", async ({
  page,
  dashboard,
}) => {
  const { panel, rows, sent } = await openPasteTerminal(page, dashboard);
  const paste = terminalKey(panel, "Paste");
  const status = panel.getByRole("status");
  const textarea = panel.locator("textarea.xterm-helper-textarea");
  await expect(terminalKey(panel, "More terminal keys")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await expect(paste).toBeVisible();
  await expectMinTouchTarget(paste);
  await focusByTouch(panel);

  await copyText(page, "");
  await tapTerminalKey(panel, "Paste");
  await expect(status).toHaveText("There was nothing to paste.");
  expect(sent).toEqual([]);

  const text = "Why is this card clipped?";
  await copyText(page, text);
  await tapTerminalKey(panel, "Paste");
  await expect(rows).toContainText(text);
  await expect(status).toBeEmpty();
  expect(sent).toEqual([text]);
  expect(dashboard.claudeAttaches()[0]?.lines).toEqual([]);

  await page.evaluate(() =>
    navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob(["<strong>html only</strong>"], {
          type: "text/html",
        }),
      }),
    ]),
  );
  await tapTerminalKey(panel, "Paste");
  await expect(status).toHaveText("There was nothing to paste.");
  expect(sent).toEqual([text]);

  await textarea.evaluate((element) => {
    element.blur();
  });
  await copyText(page, " again");
  await tapWhereShown(paste);
  await expect(rows).toContainText("again");
  await expect(textarea).not.toBeFocused();
  expect(sent).toEqual([text, " again"]);

  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", { value: undefined });
  });
  await tapWhereShown(paste);
  await expect(status).toHaveText(
    "Could not read the clipboard. Open Compose and use your keyboard’s Paste.",
  );
  expect(sent).toEqual([text, " again"]);
});

test("phone Paste keeps typed input and sends clean multi-line text in one bracketed paste", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeAttachBracketedPaste(true);
  const { panel, rows, sent } = await openPasteTerminal(page, dashboard);
  await focusByTouch(panel);
  await page.keyboard.type("typed ");
  await expect(rows).toContainText("typed");
  const beforePaste = sent.length;
  await copyText(page, "\u001b[2Jfirst\r\n\u0003second\u001b[201~");

  await tapTerminalKey(panel, "Paste");
  await expect(rows).toContainText("typed first");
  await expect(rows).toContainText("second");
  expect(sent.slice(beforePaste)).toEqual([
    "\u001b[200~first\rsecond\u001b[201~",
  ]);
  expect(dashboard.claudeAttaches()[0]?.lines).toEqual([]);
});

test.describe("phone Paste after the attachment disconnects", () => {
  test.use({ machine: async ({ restartMachine }, use) => use(restartMachine) });

  test("a failed paste sends nothing and reconnect never replays it", async ({
    page,
    dashboard,
    github,
    restartMachine,
  }) => {
    const { panel, rows, sent, native } = await openPasteTerminal(
      page,
      dashboard,
    );
    const status = panel.getByRole("status");
    await copyText(page, "retry deliberately");
    const port = Number(new URL(dashboard.baseURL).port);
    await dashboard.close();
    await expect(status).toContainText("Disconnected from the session");
    await tapWhereShown(terminalKey(panel, "Paste"));
    await expect(status).toContainText(
      "Reconnect to the terminal, then tap Paste again.",
    );
    expect(sent).toEqual([]);

    const restarted = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      github,
      machine: restartMachine,
      projectFolders: ["open-dough"],
      port,
    });
    try {
      await tapWhereShown(panel.getByRole("button", { name: "Reconnect" }));
      await expect(rows).toContainText(`attached ${native.shortId}`);
      await expect(rows).toContainText("Claude Code");
      await expect(rows).not.toContainText("retry deliberately");
      expect(sent).toEqual([]);

      await tapWhereShown(terminalKey(panel, "Paste"));
      await expect(rows).toContainText("retry deliberately");
      await expect(status).toBeEmpty();
      expect(sent).toEqual(["retry deliberately"]);
      expect(restarted.claudeAttaches().at(-1)?.lines).toEqual([]);
    } finally {
      await restarted.close();
    }
  });
});
