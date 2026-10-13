import { createRequire } from "node:module";
import type { Terminal } from "@xterm/headless";
import { expect, test } from "./support/pageTest.ts";
import { KeptClientScreen } from "../server/keptClientScreen.ts";

const { Terminal: HeadlessTerminal } = createRequire(import.meta.url)(
  "@xterm/headless",
) as {
  Terminal: new (options: {
    cols: number;
    rows: number;
    allowProposedApi: true;
  }) => Terminal;
};

function write(terminal: Terminal, output: string): Promise<void> {
  return new Promise((resolve) => {
    terminal.write(output, resolve);
  });
}

for (const alternate of [false, true]) {
  for (const positioned of [false, true]) {
    test(`replay preserves ${alternate ? "alternate" : "normal"} screen rendition, ${positioned ? "positioned cursor" : "pending wrap"} and later output`, async () => {
      const screen = new KeptClientScreen(10, 4);
      const original = new HeadlessTerminal({
        cols: 10,
        rows: 4,
        allowProposedApi: true,
      });
      const restored = new HeadlessTerminal({
        cols: 10,
        rows: 4,
        allowProposedApi: true,
      });
      try {
        const output = `${alternate ? "\x1b[?1049h" : ""}\x1b[1;33mABCDEFGHIJ\x1b[0m${positioned ? "\x1b[1;10H" : ""}\x1b[?25l\x1b[?2004h`;
        screen.write(output);
        await write(original, output);
        const replay = await screen.replay();
        expect(replay).toMatchObject({ cols: 10, rows: 4 });
        await write(restored, replay?.output ?? "");
        expect(restored.buffer.active.type).toBe(original.buffer.active.type);
        expect(restored.buffer.active.cursorX).toBe(
          original.buffer.active.cursorX,
        );
        expect(restored.buffer.active.cursorY).toBe(
          original.buffer.active.cursorY,
        );
        const title = restored.buffer.active.getLine(0)?.getCell(0);
        expect(title?.getChars()).toBe("A");
        expect(title?.isBold()).toBeTruthy();
        expect(title?.getFgColor()).toBe(3);
        expect(restored.modes.bracketedPasteMode).toBe(true);
        expect(replay?.output).toContain("\x1b[?25l");
        await write(original, "!");
        await write(restored, "!");
        expect(restored.buffer.active.getLine(0)?.translateToString(true)).toBe(
          original.buffer.active.getLine(0)?.translateToString(true),
        );
        expect(restored.buffer.active.cursorX).toBe(
          original.buffer.active.cursorX,
        );
      } finally {
        screen.dispose();
        original.dispose();
        restored.dispose();
      }
    });
  }
}

test("the replay contains the current resized screen without erased earlier output", async () => {
  const screen = new KeptClientScreen(80, 24);
  try {
    screen.write("erased transcript\x1b[2J\x1b[Hheld prompt");
    await screen.settled();
    screen.resize(120, 40);
    const replay = await screen.replay();
    expect(replay).toMatchObject({ cols: 120, rows: 40 });
    expect(replay?.output).toContain("held prompt");
    expect(replay?.output).not.toContain("erased transcript");
  } finally {
    screen.dispose();
  }
});

test("a replay captures queued output before later writes and keeps an unfinished paint open", async () => {
  const screen = new KeptClientScreen(80, 24);
  const restored = new KeptClientScreen(80, 24);
  try {
    screen.write("\x1b[?2026h\x1b[?25hfirst part");
    const pending = screen.replay();
    screen.write(" second part\x1b[?2026l");
    const replay = await pending;
    expect(replay?.output).not.toContain("second part");
    restored.write(replay?.output ?? "");
    await restored.settled();
    expect(restored.text()).toContain("first part");
    expect(restored.updating()).toBe(true);
    expect(restored.completedFrame()).toBe(false);
    restored.write(" second part\x1b[?2026l");
    await restored.settled();
    expect(restored.text()).toContain("first part second part");
    expect(restored.updating()).toBe(false);
    expect(restored.completedFrame()).toBe(true);
  } finally {
    screen.dispose();
    restored.dispose();
  }
});
