// Recovery must judge the whole synchronized screen before sending a continuation.
import { expect, test } from "./support/pageTest.ts";
import { LaunchInstruction } from "../server/launchInstruction.ts";
import { showsCursorComposer } from "../server/hosts/cursor/idleScreen.ts";

function recoveryInstruction() {
  const observed = { typed: [] as string[], confirmed: 0 };
  const instruction = new LaunchInstruction(
    {
      instruction: "Continue the recorded session.",
      ready: showsCursorComposer,
      completePaint: true,
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
