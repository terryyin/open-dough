// Clipboard images pass through the real page and session attachment boundary.
// The oversized-image refusal UI case lives in
// dashboard/frontend-tests/agent-terminal-touch-paste-image.spec.ts.

import { readFileSync } from "node:fs";
import path from "node:path";
import { expect } from "../../dashboard/tests/dashboardTest.ts";
import {
  copyClipboardPng,
  phonePasteJourney,
  test,
} from "../../dashboard/tests/terminalPastePage.ts";
import { terminalStatus } from "../../dashboard/tests/terminalScreenPage.ts";
import {
  focusByTouch,
  tapTerminalKey,
} from "../../dashboard/tests/touchTerminalPage.ts";
import { sessionAttachmentEndpoint } from "../../dashboard/src/agentTerminal.ts";
import { launchAttachmentNameHeader } from "../../dashboard/src/launchAttachments.ts";
import {
  pngA,
  pngB,
} from "../../dashboard/tests/support/launchAttachmentFixtures.ts";

const openPasteTerminal = phonePasteJourney();

test("phone Paste stores clipboard image bytes and pastes only the path, including when text is present", async ({
  page,
  dashboard,
}) => {
  const { panel, sent, native } = await openPasteTerminal(page, dashboard);
  const status = terminalStatus(panel);
  await focusByTouch(panel);
  for (const [index, bytes] of [pngA, pngB].entries()) {
    const clipboardBytes = await copyClipboardPng(
      page,
      bytes.toString("base64"),
      index === 1 ? "do not paste this text" : undefined,
    );
    const post = page.waitForRequest(
      (request) =>
        new URL(request.url()).pathname === sessionAttachmentEndpoint,
    );
    await tapTerminalKey(panel, "Paste");
    const request = await post;
    expect(request.method()).toBe("POST");
    expect(request.headers()).toMatchObject({
      "content-type": "image/png",
      [launchAttachmentNameHeader]: "pasted.png",
    });
    expect(request.postDataBuffer()).toEqual(Buffer.from(clipboardBytes));
    const stored = path.join(
      dashboard.home,
      ".open-dough",
      "dashboard",
      "session-attachments",
      "claude",
      native.sessionId,
      `${String(index + 1)}-pasted.png`,
    );
    await expect(status).toHaveText(`Image pasted as ${stored}.`);
    expect(sent).toHaveLength(index + 1);
    expect(sent[index]).toBe(stored);
    expect(readFileSync(stored)).toEqual(Buffer.from(clipboardBytes));
    expect(dashboard.claudeAttaches()[0]?.lines).toEqual([]);
  }
});
