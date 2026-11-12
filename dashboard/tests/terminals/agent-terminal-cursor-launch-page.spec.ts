// An instructed Cursor session takes its instruction with no terminal joined.
// Its entry's Open terminal then joins that same client: the page shows its
// output and accepts typing. There is no launch-wait notice and no second
// agent. Closing and opening again shows that run. A start with nothing
// typed and an attached image still sends Cursor a prompt, and that start
// itself presents the terminal of the client that took it: one socket, one
// client, no entry opened. A session started with
// nothing typed before the page first read the machine's sessions, and so
// before it knew which hosts have a terminal here, still opens its terminal.
import { agentLaunchEndpoint } from "../../src/agentLaunch.ts";
import {
  terminalHandoffAttach,
  terminalHandoffHeader,
} from "../../src/agentTerminal.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { startSessionField, startedSession } from "../launchStoryCardPage.ts";
import { expect, workingCursorTest as test } from "../support/cursorStart.ts";
import { keptCursor } from "../support/keptCursorTurn.ts";
import {
  expectCopiedAttachmentPath,
  pickImagesInDialog,
  pngA,
  writePickedImages,
} from "../support/launchAttachmentFixtures.ts";
import { launchWaitMs } from "../support/launchWait.ts";
import { processRunning } from "../support/processGroup.ts";
import { watchTerminalSockets } from "../support/terminalSockets.ts";

const instruction = "hold this launch";
const notice =
  "Cursor is still working on this session's launch prompt. The terminal opens when it finishes.";

test("an instructed Cursor start takes its instruction with no terminal joined, and Open terminal joins that run and accepts typing", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  const original = (await origin.originGit("rev-parse", "main")).trim();
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: original,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.goto("/");
  const terminalSockets = watchTerminalSockets(page);
  await page
    .getByRole("button", { name: "Start session in Open Dough" })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
  await startSessionField(dialog).fill(instruction);
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  // The startup ended and Cursor took the instruction; no terminal joined.
  const recent = await startedSession(page);
  await expect(recent).toContainText("First input accepted");
  const panel = page.getByRole("region", { name: "Terminal" });
  const rows = panel.locator(".xterm-rows");
  await expect(panel).toHaveCount(0);
  expect(terminalSockets).toEqual([]);
  await expect.poll(() => cursor.attaches()).toHaveLength(1);
  const pid = cursor.attaches()[0]?.pid ?? 0;
  expect(processRunning(pid)).toBe(true);
  expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);
  expect(cursor.attaches()[0]?.args).not.toContain(instruction);
  await expect.poll(() => cursor.input(pid)).toContain(instruction);

  await recent.getByRole("button", { name: "Open terminal" }).click();
  await expect(rows).toContainText("ctrl+c to stop");
  await expect(rows).toContainText("Add a follow-up");
  await expect(rows).not.toContainText(notice);
  expect(terminalSockets).toHaveLength(1);
  await panel.locator(".xterm-screen").click();
  await page.keyboard.type("later");
  await expect.poll(() => cursor.input(pid)).toContain("later");
  expect(cursor.attaches()).toHaveLength(1);

  await panel.getByRole("button", { name: "Close", exact: true }).click();
  await expect(panel).toHaveCount(0);
  expect(processRunning(pid)).toBe(true);
  await recent.getByRole("button", { name: "Open terminal" }).click();
  await expect(rows).toContainText("ctrl+c to stop");
  expect(cursor.attaches()).toHaveLength(1);
  expect(cursor.attaches()[0]?.pid).toBe(pid);
  expect(processRunning(pid)).toBe(true);
  const recorded = keptCursor(dashboard.home);
  expect(recorded.firstInput).toMatchObject({ state: "confirmed" });
  expect(recorded.firstInput?.instruction).toContain(instruction);
});

test("a Cursor start with nothing typed and an attached image presents the terminal of the client that took the image list", async ({
  page,
  dashboard,
  origin,
  cursor,
}, testInfo) => {
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.goto("/");
  const terminalSockets = watchTerminalSockets(page);
  // What the page's requests ask of the terminal handoff, each as sent.
  const handoffs: string[] = [];
  page.on("request", (request) => {
    const asked = request.headers()[terminalHandoffHeader];
    if (asked !== undefined) handoffs.push(asked);
  });
  await page
    .getByRole("button", { name: "Start session in Open Dough" })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
  await expect(startSessionField(dialog)).toHaveValue("");
  await pickImagesInDialog(
    page,
    dialog,
    writePickedImages(testInfo, [{ name: "card.png", bytes: pngA }]),
  );
  await expect(
    dialog
      .getByRole("list", { name: "Attached images" })
      .getByText("Image 1 · card.png"),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  // The start presents the terminal with the keyboard: no entry is opened.
  const panel = page.getByRole("region", { name: "Terminal" });
  const rows = panel.locator(".xterm-rows");
  await expect(panel.locator(".xterm-helper-textarea")).toBeFocused({
    timeout: launchWaitMs,
  });
  await expect(rows).toContainText("ctrl+c to stop");
  await expect(rows).toContainText("Add a follow-up");
  await expect(rows).not.toContainText(notice);
  expect(terminalSockets).toHaveLength(1);
  // The start asked the server once to keep its client for this terminal.
  expect(handoffs).toEqual([terminalHandoffAttach]);

  // It is the client the launch kept, and that client took the image list.
  expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);
  expect(cursor.attaches()).toHaveLength(1);
  const pid = cursor.attaches()[0]?.pid ?? 0;
  expect(processRunning(pid)).toBe(true);
  await expect.poll(() => cursor.input(pid)).toMatch(/\r$/u);
  const prompt = cursor.input(pid);
  const listed = /^Attached images:\n1\. (.+)$/mu.exec(prompt)?.[1] ?? "";
  expect(prompt.startsWith("Attached images:\n1. ")).toBe(true);
  expectCopiedAttachmentPath(listed, dashboard.home, "1-card.png");
  await expect
    .poll(() => keptCursor(dashboard.home).firstInput)
    .toMatchObject({ state: "confirmed" });
  const recorded = keptCursor(dashboard.home);
  expect(recorded.request).not.toHaveProperty("instruction");
  expect(recorded.request.attachments).toEqual([listed]);

  // Typing in the presented terminal reaches that same client.
  await page.keyboard.type("later");
  await expect.poll(() => cursor.input(pid)).toContain("later");
  expect(cursor.attaches()).toHaveLength(1);
  expect(terminalSockets).toHaveLength(1);
});

test("a session started with nothing typed before the page first read the machine's sessions still opens its terminal", async ({
  page,
  origin,
}) => {
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
    follows: true,
  });
  // Every read of the machine's sessions waits until Start was pressed.
  let release: () => void = () => undefined;
  const pressed = new Promise<void>((resolve) => {
    release = resolve;
  });
  let held = 0;
  await page.route(`**${agentLaunchEndpoint}`, async (route) => {
    if (route.request().method() === "GET") {
      held += 1;
      await pressed;
    }
    await route.continue();
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start session in Open Dough" })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
  await expect(startSessionField(dialog)).toHaveValue("");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(held).toBeGreaterThan(0);
  release();

  await startedSession(page);
  await expect(
    page.getByRole("region", { name: "Terminal" }).locator(".xterm-rows"),
  ).toContainText("ctrl+c to stop");
});
