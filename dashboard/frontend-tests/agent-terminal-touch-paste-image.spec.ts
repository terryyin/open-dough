// Phone Paste shows the server's oversized image refusal from an explicit
// attachment substitute; the terminal stays attached via a WebSocket substitute.
// A held WebSocket substitute keeps the terminal connecting, where Paste says
// so instead of naming a recovery action.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../tests/support/frontendApp.ts";
import { putFrontendMachine } from "../tests/support/frontendServiceState.ts";
import { installAttachedTerminalSubstitute } from "../tests/support/frontendServiceSubstitutes.ts";
import { focusByTouch, tapTerminalKey } from "../tests/touchTerminalPage.ts";
import { sessionsSidebarParts } from "../tests/sessionsSidebarPage.ts";
import { tapWhereShown } from "../tests/pageLayout.ts";
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

const title = "Phone clipboard session";

test("phone Paste shows the server's oversized image refusal and keeps the terminal attached", async ({
  page,
  frontendServices,
}) => {
  putFrontendMachine(
    frontendServices,
    makeMe.aMachineAnswer
      .observing(
        makeMe.anObservedLaunch
          .of(
            makeMe.aLaunchRecord
              .adHoc({ instruction: "paste", title })
              .inClaudeSession({
                sessionId: "paste-session-1",
                shortId: "paste01",
              })
              .launchedAt("2026-10-01T00:00:00.000Z")
              .please(),
          )
          .withSessionState(makeMe.aSessionState.loaded("working").please())
          .please(),
      )
      .please(),
  );
  const { sent } = await installAttachedTerminalSubstitute(page, {
    attachedLine: "attached paste01\r\nClaude Code\r\n",
  });
  await openFrontendTakenBacklog(page);
  const sidebar = sessionsSidebarParts(page);
  await tapWhereShown(sidebar.button);
  await expect(sidebar.sidebar).toBeVisible();
  await expect(sidebar.entries).toHaveCount(1);
  await tapWhereShown(sidebar.entry(title));
  const panel = page.getByRole("region", { name: "Terminal" });
  await expect(panel).toBeVisible();
  const rows = panel.locator(".xterm-rows");
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
  await expect(panel.getByRole("status")).toHaveText(launchAttachmentTooLarge);
  expect(sent).toEqual([]);
  await panel.locator("textarea.xterm-helper-textarea").press("x");
  await expect.poll(() => sent).toEqual(["x"]);
  await expect(rows).toContainText("x");
});

test("phone Paste while the terminal is still connecting says so, sends nothing, and pastes once it connects", async ({
  page,
  frontendServices,
}) => {
  const connecting = "Connecting clipboard session";
  putFrontendMachine(
    frontendServices,
    makeMe.aMachineAnswer
      .observing(
        makeMe.anObservedLaunch
          .of(
            makeMe.aLaunchRecord
              .executing({
                identity: "SEED-901#connecting-paste",
                title: connecting,
              })
              .onStoryBranch({
                workspace: "/work/connecting-paste",
                branch: "claude/connecting-paste",
              })
              .inClaudeSession({ sessionId: "connecting-1", shortId: "conn01" })
              .please(),
          )
          .withSessionState(makeMe.aSessionState.loaded("working").please())
          .please(),
      )
      .please(),
  );
  let open = () => {};
  const opens = new Promise<void>((resolve) => {
    open = resolve;
  });
  const { sent } = await installAttachedTerminalSubstitute(page, {
    attachedLine: "attached conn01\r\nClaude Code\r\n",
    opens,
  });
  await openFrontendTakenBacklog(page);
  const sidebar = sessionsSidebarParts(page);
  await tapWhereShown(sidebar.button);
  await tapWhereShown(sidebar.entry(connecting));
  const panel = page.getByRole("region", { name: "Terminal" });
  const status = panel.getByRole("status");
  const rows = panel.locator(".xterm-rows");
  await expect(panel).toBeVisible();
  await page.evaluate(() => navigator.clipboard.writeText("after connecting"));

  await tapTerminalKey(panel, "Paste");
  await expect(status).toHaveText(
    "The terminal is still connecting. Tap Paste again once it connects.",
  );
  await expect(rows).not.toContainText("attached conn01");
  expect(sent).toEqual([]);

  open();
  await expect(rows).toContainText("attached conn01");
  await tapTerminalKey(panel, "Paste");
  await expect.poll(() => sent).toEqual(["after connecting"]);
  await expect(status).toBeEmpty();
});
