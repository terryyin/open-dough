// Phone Paste shows the server's oversized image refusal from an explicit
// attachment substitute; the terminal stays attached via a WebSocket substitute.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../tests/support/frontendApp.ts";
import {
  emptyMachineAnswer,
  putFrontendMachine,
} from "../tests/support/frontendServiceState.ts";
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

test.use({
  viewport: phoneLaunchTouchViewport.portrait,
  hasTouch: true,
  permissions: ["clipboard-read", "clipboard-write"],
});
test.setTimeout(60_000);

const title = "Phone clipboard session";

test("phone Paste shows the server's oversized image refusal and keeps the terminal attached", async ({
  page,
  frontendServices,
}) => {
  putFrontendMachine(frontendServices, {
    ...emptyMachineAnswer(),
    records: [
      {
        request: {
          source: "open-dough",
          host: "claude",
          workflow: "ad-hoc",
          title,
          instruction: "paste",
        },
        session: {
          host: "claude",
          sessionId: "paste-session-1",
          shortId: "paste01",
          name: title,
        },
        launchedAt: "2026-10-01T00:00:00.000Z",
        sessionState: {
          kind: "available",
          availability: "loaded",
          activity: "working",
        },
      },
    ],
  });
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
