// When Cursor's keep wait is still open at the shared launch bound, Start
// answers uncertain/timed-out for unconfirmed instruction delivery and leaves
// the client kept. Ordinary ready settlement is covered in
// agent-terminal-cursor-launch.spec.ts.
import { test, expect } from "./support/pageTest.ts";
import { shellCommand } from "../src/sessionCapabilities.ts";
import { installFakeCursor } from "./support/fakeCursor.ts";
import {
  enteredInstruction,
  keptCursor,
  withInstructedCursor,
} from "./support/keptCursorTurn.ts";
import { processRunning } from "./support/processGroup.ts";
import type { CursorSession } from "../src/launchRecord.ts";
import type { RawResponse } from "./support/rawHttp.ts";

const instruction = "hold this launch";

function instructionDeliveryTimedOut(session: CursorSession) {
  return {
    kind: "uncertain",
    reason: "timed-out",
    explanation: `Cursor did not show it took the instruction in time. Session ${session.sessionId} is kept. Continue with \`${shellCommand(session.continuation.args)}\`.`,
  };
}

function expectInstructionDeliveryTimedOut(
  launched: RawResponse,
  session: CursorSession,
) {
  expect(JSON.parse(launched.body)).toEqual(
    instructionDeliveryTimedOut(session),
  );
}

for (const mode of ["dev", "preview"] as const) {
  test.describe(`Cursor launch wait (${mode})`, () => {
    test.describe.configure({ timeout: 120_000 });

    test("the launch wait abort leaves the client running and a later ready screen accepts the instruction", async () => {
      const cursor = installFakeCursor({
        screen: "working",
        paintDelayMs: 3_000,
      });
      await withInstructedCursor(
        mode,
        cursor,
        instruction,
        async (server, launched) => {
          const recorded = keptCursor(server.home);
          const session = recorded.session;
          if (session.host !== "cursor") {
            throw new Error("Missing recorded Cursor session.");
          }
          expectInstructionDeliveryTimedOut(launched, session);
          const pid = cursor.attaches()[0]?.pid ?? 0;
          expect(processRunning(pid)).toBe(true);
          expect(recorded.firstInput?.state).toBe("uncertain");
          expect(enteredInstruction(cursor, pid)).not.toContain(instruction);
          await expect
            .poll(() => keptCursor(server.home).firstInput?.state, {
              timeout: 10_000,
            })
            .toBe("confirmed");
          expect(enteredInstruction(cursor, pid)).toContain(instruction);
          expect(processRunning(pid)).toBe(true);
          expect(cursor.attaches()).toHaveLength(1);
        },
        1_500,
      );
    });

    test("a submitted paste chip left silent times out as uncertain while first input stays confirmed", async () => {
      const cursor = installFakeCursor({
        screen: "composer",
        holdAfterPaste: true,
      });
      const story = `${instruction}\n${"line of the launch instruction. ".repeat(40)}`;
      await withInstructedCursor(
        mode,
        cursor,
        story,
        (server, launched) => {
          const recorded = keptCursor(server.home);
          const session = recorded.session;
          if (session.host !== "cursor") {
            throw new Error("Missing recorded Cursor session.");
          }
          expectInstructionDeliveryTimedOut(launched, session);
          expect(recorded.firstInput).toMatchObject({
            state: "confirmed",
            instruction: story,
          });
          const pid = cursor.attaches()[0]?.pid ?? 0;
          expect(processRunning(pid)).toBe(true);
          expect(cursor.attaches()).toHaveLength(1);
        },
        1_500,
      );
    });
  });
}
