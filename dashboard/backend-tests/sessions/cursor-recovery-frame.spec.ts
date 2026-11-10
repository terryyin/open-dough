// Recovery must judge the whole synchronized screen before sending a continuation.
import { expect, test } from "../../tests/support/pageTest.ts";
import { LaunchInstruction } from "../../server/launchInstruction.ts";
import { showsCursorComposer } from "../../server/hosts/cursor/idleScreen.ts";

const continuation = [
  "Continue the recorded Execution from this launch.",
  "Worktree: /tmp/clipboard-worktree.",
  "Continue from this worktree's committed and uncommitted state without opening another assignment.",
].join("\n");

function recoveryInstruction(text = "Continue the recorded session.") {
  const observed = { typed: [] as string[], confirmed: 0 };
  const instruction = new LaunchInstruction(
    {
      instruction: text,
      ready: showsCursorComposer,
      onEntered: () => {
        observed.confirmed += 1;
        return Promise.resolve();
      },
    },
    { cols: 80, rows: 24 },
    {
      tracked: () => true,
      writeInstruction: (data) => {
        observed.typed.push(data);
        return true;
      },
      holdReleased: () => {},
    },
  );
  return { instruction, observed };
}

test("a fragmented working paint never receives the recovery continuation, then an idle paint receives it once", async () => {
  const { instruction, observed } = recoveryInstruction();
  let firstScreen = false;
  void instruction.firstScreen.then(() => {
    firstScreen = true;
  });
  try {
    // A PTY can split anywhere, including before the working marker.
    await instruction.write(
      "\u001b[?2026h\u001b[2J\u001b[H→ Add a follow-up\r\n",
    );
    expect(observed.typed).toEqual([]);
    expect(firstScreen).toBe(false);
    await instruction.write("ctrl+c to stop\r\n\u001b[?2026l");
    await instruction.firstScreen;
    expect(observed.typed).toEqual([]);
    expect(observed.confirmed).toBe(0);

    await instruction.write(
      "\u001b[?2026h\u001b[2J\u001b[H→ Add a follow-up\r\n\u001b[?2026l",
    );
    expect(observed.typed).toEqual(["Continue the recorded session.\r"]);
    expect(observed.confirmed).toBe(1);
    await instruction.write(
      "\u001b[?2026h\u001b[2J\u001b[H→ Add a follow-up\r\n\u001b[?2026l",
    );
    expect(observed.typed).toHaveLength(1);
    expect(observed.confirmed).toBe(1);
  } finally {
    instruction.dispose();
  }
});

test("an unframed idle composer receives one recovery continuation", async () => {
  const { instruction, observed } = recoveryInstruction();
  try {
    // Current Cursor builds can show this composer with no synchronized frame.
    await instruction.write("\u001b[?25l→ Plan, search, build anything\r\n");
    await instruction.firstScreen;
    expect(observed.typed).toEqual(["Continue the recorded session.\r"]);
    expect(observed.confirmed).toBe(1);
    await instruction.write(
      "\u001b[2J\u001b[H→ Plan, search, build anything\r\n",
    );
    expect(observed.typed).toHaveLength(1);
    expect(observed.confirmed).toBe(1);
  } finally {
    instruction.dispose();
  }
});

test("a multiline continuation left in the composer is submitted once", async () => {
  const { instruction, observed } = recoveryInstruction(continuation);
  const draft =
    "\u001b[?2026h\u001b[2J\u001b[H→ Continue from this worktree's committed and uncommitted state without opening another assignment.\r\n\u001b[?2026l";
  try {
    await instruction.write(
      "\u001b[?2026h\u001b[2J\u001b[H→ Add a follow-up\r\n\u001b[?2026l",
    );
    expect(observed).toEqual({ typed: [continuation], confirmed: 0 });
    await instruction.write(draft);
    expect(observed).toEqual({ typed: [continuation, "\r"], confirmed: 1 });
    await instruction.write(draft);
    expect(observed).toEqual({ typed: [continuation, "\r"], confirmed: 1 });
  } finally {
    instruction.dispose();
  }
});

test("a multiline continuation stays unsent when the next frame is not that draft", async () => {
  const { instruction, observed } = recoveryInstruction(continuation);
  try {
    await instruction.write(
      "\u001b[?2026h\u001b[2J\u001b[H→ Add a follow-up\r\n\u001b[?2026l",
    );
    await instruction.write(
      "\u001b[?2026h\u001b[2J\u001b[HCursor is waiting for workspace trust\r\n\u001b[?2026l",
    );
    expect(observed).toEqual({ typed: [continuation], confirmed: 0 });
  } finally {
    instruction.dispose();
  }
});

test("an unframed composer draft of a multiline continuation is submitted once", async () => {
  const { instruction, observed } = recoveryInstruction(continuation);
  const draft =
    "\u001b[?25l\u001b[2J\u001b[H→ Continue from this worktree's committed and uncommitted state without opening another assignment.\r\n";
  try {
    await instruction.write("\u001b[?25l→ Plan, search, build anything\r\n");
    expect(observed).toEqual({ typed: [continuation], confirmed: 0 });
    await instruction.write(draft);
    expect(observed).toEqual({ typed: [continuation, "\r"], confirmed: 1 });
    await instruction.write(draft);
    expect(observed).toEqual({ typed: [continuation, "\r"], confirmed: 1 });
  } finally {
    instruction.dispose();
  }
});
