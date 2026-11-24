import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import {
  launchAttachmentLimitBytes,
  launchAttachmentTooLarge,
} from "../../src/launchAttachments.ts";
import type { SessionServices } from "../../src/sessionServices.ts";
import { terminalStatus } from "../sessions/session-terminal-page.ts";
import { tapTerminalControl } from "./terminal-input-controls.ts";
import {
  drawnRows,
  mountTouchTerminal,
  showsRow,
  stubClipboard,
  tapLiveScreen,
  terminalKey,
} from "./terminal-touch-input.ts";

test("phone Paste shows the oversized image refusal and keeps the terminal attached", async () => {
  const image = new Blob([new Uint8Array(launchAttachmentLimitBytes + 1)], {
    type: "image/png",
  });
  stubClipboard(new ClipboardItem({ "image/png": image }));
  const storeTerminalImage = vi
    .fn<SessionServices["storeTerminalImage"]>()
    .mockResolvedValue({ error: launchAttachmentTooLarge });
  const title = "Phone clipboard session";
  const { sent } = await mountTouchTerminal(title, {
    openingLines: ["attached paste01", "Claude Code"],
    storeTerminalImage,
  });
  await tapLiveScreen();
  await tapTerminalControl(terminalKey("Paste"));
  await expect
    .element(terminalStatus)
    .toHaveTextContent(launchAttachmentTooLarge);
  expect(storeTerminalImage).toHaveBeenCalledTimes(1);
  const [record, uploadedImage, contentType] =
    storeTerminalImage.mock.calls[0] ?? [];
  expect(record?.request).toMatchObject({ title });
  expect(uploadedImage).toBe(image);
  expect(contentType).toBe("image/png");
  expect(sent()).toEqual([]);
  await userEvent.keyboard("x");
  await expect.poll(sent).toEqual(["x"]);
  await showsRow("x");
});

test("phone Paste waits for a connecting terminal and sends text only when retried after it opens", async () => {
  const text = "after connecting";
  stubClipboard(
    new ClipboardItem({
      "text/plain": new Blob([text], { type: "text/plain" }),
    }),
  );
  const { attachment, sent } = await mountTouchTerminal(
    "Connecting clipboard session",
    {
      connecting: true,
      openingLines: ["attached conn01", "Claude Code"],
    },
  );
  await tapTerminalControl(terminalKey("Paste"));
  await expect
    .element(terminalStatus)
    .toHaveTextContent(
      "The terminal is still connecting. Tap Paste again once it connects.",
    );
  expect(drawnRows()).not.toContain("attached conn01");
  expect(sent()).toEqual([]);

  attachment.open();
  await showsRow("attached conn01");
  expect(sent()).toEqual([]);
  await tapTerminalControl(terminalKey("Paste"));
  await expect.poll(sent).toEqual([text]);
  await showsRow(text);
  await expect.element(terminalStatus).toBeEmptyDOMElement();
});
