// After successful startup handoff, further PTY chunks must not keep launch
// readiness evaluating. Disposal stays on the existing releaseIdle path.
import { expect, test } from "../support/pageTest.ts";
import { LaunchInstruction } from "../../server/launchInstruction.ts";
import { showsCursorComposer } from "../../server/hosts/cursor/idleScreen.ts";

const idleComposer = "\u001b[?25l→ Plan, search, build anything\r\n";

test("after first-screen instruction entry, further chunks do not evaluate launch readiness", async () => {
  let readinessChecks = 0;
  const observed = { typed: [] as string[], confirmed: 0, holdReleased: 0 };
  const instruction = new LaunchInstruction(
    {
      instruction: "Continue the recorded session.",
      ready: (text) => {
        readinessChecks += 1;
        return showsCursorComposer(text);
      },
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
      holdReleased: () => {
        observed.holdReleased += 1;
      },
    },
  );
  try {
    await instruction.write(idleComposer);
    await instruction.firstScreen;
    expect(observed.typed).toEqual(["Continue the recorded session.\r"]);
    expect(observed.confirmed).toBe(1);
    expect(observed.holdReleased).toBe(1);
    expect(instruction.holdsIdle()).toBe(false);
    const afterEntry = readinessChecks;
    expect(afterEntry).toBeGreaterThan(0);

    for (let i = 0; i < 512; i += 1) {
      await instruction.write(`post-startup chunk ${i}\r\n`);
    }
    expect(readinessChecks).toBe(afterEntry);
    expect(observed.typed).toHaveLength(1);
    expect(observed.confirmed).toBe(1);
  } finally {
    instruction.dispose();
  }
});

test("handoff hold survives observation end until releaseHandoff", async () => {
  let readinessChecks = 0;
  const instruction = new LaunchInstruction(
    {
      instruction: "Continue the recorded session.",
      ready: (text) => {
        readinessChecks += 1;
        return showsCursorComposer(text);
      },
      onEntered: () => Promise.resolve(),
      handoff: true,
    },
    { cols: 80, rows: 24 },
    {
      tracked: () => true,
      writeInstruction: () => true,
      holdReleased: () => {},
    },
  );
  try {
    await instruction.write(idleComposer);
    await instruction.firstScreen;
    expect(instruction.holdsIdle()).toBe(true);
    const afterEntry = readinessChecks;
    await instruction.write("more output after handoff entry\r\n");
    expect(readinessChecks).toBe(afterEntry);
    expect(instruction.holdsIdle()).toBe(true);
    instruction.releaseHandoff();
    expect(instruction.holdsIdle()).toBe(false);
  } finally {
    instruction.dispose();
  }
});
