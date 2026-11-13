// Phone Paste shows the server's oversized image refusal from an explicit
// attachment substitute; the terminal stays attached via a WebSocket substitute.
// A held WebSocket substitute keeps the terminal connecting, where Paste says
// so instead of naming a recovery action.

import { expect, test } from "../tests/support/frontendApp.ts";
import { openFrontendTerminalByTouch } from "../tests/support/frontendTouchTerminal.ts";
import { echoingApplication } from "../tests/support/terminalSubstituteApplication.ts";
import { copyClipboardText } from "../tests/terminalPastePage.ts";
import { terminalStatus } from "../tests/terminalScreenPage.ts";
import { focusByTouch, tapTerminalKey } from "../tests/touchTerminalPage.ts";
import { sessionAttachmentEndpoint } from "../src/agentTerminal.ts";
import {
  launchAttachmentLimitBytes,
  launchAttachmentTooLarge,
} from "../src/launchAttachments.ts";
import { phoneLaunchTouchViewport } from "../tests/touchLaunchPage.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";

test.use({
  viewport: phoneLaunchTouchViewport.portrait,
  hasTouch: true,
  permissions: ["clipboard-read", "clipboard-write"],
});

test("phone Paste shows the server's oversized image refusal and keeps the terminal attached", async ({
  page,
  frontendServices,
}) => {
  const { panel, rows, input, sent } = await openFrontendTerminalByTouch(
    page,
    frontendServices,
    makeMe.aLaunchRecord
      .adHoc({ instruction: "paste", title: "Phone clipboard session" })
      .inClaudeSession({ sessionId: "paste-session-1", shortId: "paste01" })
      .launchedAt("2026-10-01T00:00:00.000Z")
      .please(),
    {
      application: echoingApplication("attached paste01\r\nClaude Code\r\n"),
    },
  );
  const status = terminalStatus(panel);
  await expect(rows).toContainText("attached paste01");
  await expect(rows).toContainText("Claude Code");
  await focusByTouch(panel);
  await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 2000;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not create an image.");
    const pixels = context.createImageData(canvas.width, canvas.height);
    for (let offset = 0; offset < pixels.data.length; offset += 65_536) {
      crypto.getRandomValues(pixels.data.subarray(offset, offset + 65_536));
    }
    for (let offset = 3; offset < pixels.data.length; offset += 4) {
      pixels.data[offset] = 255;
    }
    context.putImageData(pixels, 0, 0);
    const image = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not encode PNG."));
      });
    });
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": image }),
    ]);
  });
  await page.route(`**${sessionAttachmentEndpoint}?*`, (route) =>
    route.fulfill({ status: 413, json: { error: launchAttachmentTooLarge } }),
  );
  const post = page.waitForRequest(
    (request) => new URL(request.url()).pathname === sessionAttachmentEndpoint,
  );
  await tapTerminalKey(panel, "Paste");
  expect((await post).postDataBuffer()?.length).toBeGreaterThan(
    launchAttachmentLimitBytes,
  );
  await expect(status).toHaveText(launchAttachmentTooLarge);
  expect(sent).toEqual([]);
  await input.press("x");
  await expect.poll(() => sent).toEqual(["x"]);
  await expect(rows).toContainText("x");
});

test("phone Paste while the terminal is still connecting says so, sends nothing, and pastes once it connects", async ({
  page,
  frontendServices,
}) => {
  let open = () => {};
  const opens = new Promise<void>((resolve) => {
    open = resolve;
  });
  const { panel, rows, sent } = await openFrontendTerminalByTouch(
    page,
    frontendServices,
    makeMe.aLaunchRecord
      .executing({
        identity: "SEED-901#connecting-paste",
        title: "Connecting clipboard session",
      })
      .onStoryBranch({
        workspace: "/work/connecting-paste",
        branch: "claude/connecting-paste",
      })
      .inClaudeSession({ sessionId: "connecting-1", shortId: "conn01" })
      .please(),
    {
      application: echoingApplication("attached conn01\r\nClaude Code\r\n"),
      opens,
    },
  );
  const status = terminalStatus(panel);
  await copyClipboardText(page, "after connecting");

  await tapTerminalKey(panel, "Paste");
  await expect(status).toHaveText(
    "The terminal is still connecting. Tap Paste again once it connects.",
  );
  await expect(rows).not.toContainText("attached conn01");
  expect(sent).toEqual([]);

  // Release the held substitute, then explicit Paste retry.
  open();
  await expect(rows).toContainText("attached conn01");
  await tapTerminalKey(panel, "Paste");
  await expect.poll(() => sent).toEqual(["after connecting"]);
  await expect(status).toBeEmpty();
});
