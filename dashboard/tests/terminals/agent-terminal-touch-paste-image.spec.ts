// Clipboard images pass through the real page and session attachment boundary.
// The oversized-image refusal UI case lives in
// dashboard/frontend-tests/agent-terminal-touch-paste-image.spec.ts.

import { readFileSync } from "node:fs";
import path from "node:path";
import { expect } from "../dashboardTest.ts";
import { phonePasteJourney, test } from "../terminalPastePage.ts";
import { focusByTouch, tapTerminalKey } from "../touchTerminalPage.ts";
import { sessionAttachmentEndpoint } from "../../src/agentTerminal.ts";
import { launchAttachmentNameHeader } from "../../src/launchAttachments.ts";
import { pngA, pngB } from "../support/launchAttachmentFixtures.ts";

const openPasteTerminal = phonePasteJourney();

test("phone Paste stores clipboard image bytes and pastes only the path, including when text is present", async ({
  page,
  dashboard,
}) => {
  const { panel, sent, native } = await openPasteTerminal(page, dashboard);
  await focusByTouch(panel);
  for (const [index, bytes] of [pngA, pngB].entries()) {
    const clipboardBytes = await page.evaluate(
      async ({ image, mixed }) => {
        const data = Uint8Array.from(atob(image), (character) =>
          character.charCodeAt(0),
        );
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": new Blob([data], { type: "image/png" }),
            ...(mixed
              ? {
                  "text/plain": new Blob(["do not paste this text"], {
                    type: "text/plain",
                  }),
                }
              : {}),
          }),
        ]);
        // Chromium normalizes PNG bytes on read; compare with that same input.
        const [item] = await navigator.clipboard.read();
        if (!item || (mixed && !item.types.includes("text/plain"))) {
          throw new Error("The clipboard did not retain the test content.");
        }
        return Array.from(
          new Uint8Array(await (await item.getType("image/png")).arrayBuffer()),
        );
      },
      { image: bytes.toString("base64"), mixed: index === 1 },
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
    await expect(panel.getByRole("status")).toHaveText(
      `Image pasted as ${stored}.`,
    );
    expect(sent).toHaveLength(index + 1);
    expect(sent[index]).toBe(stored);
    expect(readFileSync(stored)).toEqual(Buffer.from(clipboardBytes));
    expect(dashboard.claudeAttaches()[0]?.lines).toEqual([]);
  }
});
