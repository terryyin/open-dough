// The held current screen reaches first join and reconnect, including the
// native trust boundary: no completed frame and no output from a join nudge.
// A completed-frame substitute remains the compatible observation.
import { test, expect } from "./support/pageTest.ts";
import { shows } from "./agentTerminalBoundary.ts";
import { openCursorTerminal } from "./support/cursorTerminal.ts";
import { installFakeCursor } from "./support/fakeCursor.ts";
import {
  enteredInstruction,
  keptCursor,
  withInstructedCursor,
} from "./support/keptCursorTurn.ts";
import { processRunning } from "./support/processGroup.ts";

const instruction = "hold this trust launch";

for (const mode of ["dev", "preview"] as const) {
  test.describe(`Cursor trust screen join (${mode})`, () => {
    test.describe.configure({ timeout: 120_000 });

    for (const screen of ["trust", "trust-unframed"] as const) {
      test(`a terminal joined after the launch wait shows the ${screen} Cursor trust prompt`, async () => {
        const cursor = installFakeCursor({ screen });
        const prompt =
          screen === "trust"
            ? "Do you trust this workspace?"
            : "Workspace Trust Required";
        await withInstructedCursor(
          mode,
          cursor,
          instruction,
          async (server, launched) => {
            // The native-shaped screen keeps the launch wait open; the
            // completed fixture paint settles it with input still undelivered.
            expect(JSON.parse(launched.body)).toMatchObject({
              kind: screen === "trust" ? "launched" : "uncertain",
            });
            const recorded = keptCursor(server.home);
            expect(recorded.firstInput?.state).toBe("uncertain");
            const sessionId = recorded.session.sessionId;
            const pid = cursor.attaches()[0]?.pid ?? 0;
            expect(processRunning(pid)).toBe(true);
            expect(enteredInstruction(cursor, pid)).not.toContain(instruction);

            const terminal = await openCursorTerminal(server, sessionId);
            expect(await shows(terminal, prompt)).toBe(true);
            if (screen === "trust")
              expect(terminal.output()).toContain("\x1b[?2026l");
            expect(terminal.controls()).toContainEqual({
              readiness: "observe",
            });
            await expect
              .poll(() => cursor.sizes(pid).length)
              .toBeGreaterThan(0);
            terminal.socket.close();
            await terminal.closed;

            const again = await openCursorTerminal(server, sessionId);
            expect(await shows(again, prompt)).toBe(true);
            expect(again.controls()).toContainEqual({ readiness: "observe" });
            expect(cursor.attaches()).toHaveLength(1);
            expect(cursor.attaches()[0]?.pid).toBe(pid);
            expect(processRunning(pid)).toBe(true);
            expect(keptCursor(server.home).firstInput?.state).toBe("uncertain");
            expect(cursor.input(pid)).toBe("");
          },
          1_500,
        );
      });
    }
  });
}
