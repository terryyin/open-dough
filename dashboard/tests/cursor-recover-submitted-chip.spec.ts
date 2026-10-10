// Drive the kept-client registry, launch instruction, and Cursor screen label
// with a native PTY replaced, so Recover's continuation is pasted onto the
// idle composer and Enter submits the chip while Cursor keeps showing it until
// a later repaint. Keep settles on that repaint, not on the submitted chip.
import { expect, test } from "./support/pageTest.ts";
import { TerminalAttachments } from "../server/terminalAttachments.ts";
import { cursorSessionLabel } from "../server/hosts/cursor/idleScreen.ts";
import { cursorHeldLabel } from "../src/cursorHeldLabel.ts";
import {
  continuationInstruction,
  keepRecoveredCursor,
} from "./support/recoveredCursorPty.ts";

const followUpPaint =
  "\x1b[?2026h\x1b[?25h\x1b[2J\x1b[H→ Add a follow-up\r\n\x1b[?2026l";
const chipPaint = "\x1b[?25l\x1b[2J\x1b[H→ [Pasted text #1 +2 lines]\r\n";

test("Recover's keep settles only once the submitted paste chip is repainted, and reads the follow-up prompt", async () => {
  const attachments = new TerminalAttachments();
  try {
    const recovered = keepRecoveredCursor(attachments, "Submitted chip");
    let settled = false;
    const kept = recovered.kept.finally(() => {
      settled = true;
    });
    recovered.read(followUpPaint);
    await expect
      .poll(() => recovered.written)
      .toEqual([continuationInstruction]);
    recovered.read(chipPaint);
    await expect
      .poll(() => recovered.written)
      .toEqual([continuationInstruction, "\r"]);
    // The registry's screen still shows the submitted chip.
    await expect
      .poll(async () => (await attachments.held())[0]?.screen ?? "")
      .toContain("Pasted text");
    expect(settled).toBe(false);
    recovered.read(followUpPaint);
    const outcome = await kept;
    const [held] = await attachments.held();
    expect({
      kept:
        outcome.kind === "kept"
          ? cursorSessionLabel(outcome.screen ?? "")
          : outcome.kind,
      held: cursorSessionLabel(held?.screen ?? ""),
    }).toEqual({
      kept: cursorHeldLabel.followUp,
      held: cursorHeldLabel.followUp,
    });
  } finally {
    attachments.close();
  }
});
