// A Cursor client that leaves before the first prompt is accepted.
// An exit Cursor printed is recorded as ended, and Continue adds no
// session. A client that is gone without that ending is replaced.
import { test, expect } from "../support/pageTest.ts";
import { launch } from "../agentLaunchBoundary.ts";
import { installFakeCursor } from "../support/fakeCursor.ts";
import {
  enteredInstruction,
  instructedCursorRequest,
  keptCursor,
  withInstructedCursor,
} from "../support/keptCursorTurn.ts";
import { processRunning } from "../support/processGroup.ts";

const instruction = "hold this launch";

test.describe(`Cursor client exit`, () => {
  test.describe.configure({ timeout: 120_000 });

  test("a client that exits before the prompt is accepted shows Cursor's text and Continue adds no session", async () => {
    const printed = "Error: No prompt provided for print mode\r\n";
    const cursor = installFakeCursor({
      screen: "exit",
      exitText: printed,
    });
    const story = "start this session";
    await withInstructedCursor(
      { mode: "boundary" },
      cursor,
      story,
      async (server, launched) => {
        const ended = `Error: No prompt provided for print mode\nThe session ended.`;
        expect(JSON.parse(launched.body)).toEqual({
          kind: "uncertain",
          reason: "unconfirmed",
          explanation: ended,
        });
        const recorded = keptCursor(server.home);
        expect(recorded.firstInput).toMatchObject({
          state: "uncertain",
          explanation: ended,
        });
        const sessionId = recorded.session.sessionId;
        expect(cursor.calls().map((call) => call.args)).toEqual([
          ["create-chat"],
        ]);
        expect(cursor.attaches()).toHaveLength(1);
        expect(cursor.attaches()[0]).toMatchObject({
          stdinTTY: true,
          stdoutTTY: true,
          sessionId,
        });
        expect(processRunning(cursor.attaches()[0]?.pid ?? 0)).toBe(false);

        const again = await launch(server, instructedCursorRequest(story));
        expect(JSON.parse(again.body)).toEqual({
          kind: "uncertain",
          reason: "unconfirmed",
          explanation: ended,
        });
        expect(cursor.calls().map((call) => call.args)).toEqual([
          ["create-chat"],
        ]);
        expect(keptCursor(server.home).session.sessionId).toBe(sessionId);
        expect(cursor.attaches()).toHaveLength(1);
      },
    );
  });

  test("the client exiting does not accept the instruction, and the next launch submits it in a new conversation", async () => {
    const cursor = installFakeCursor({ screen: "trust" });
    const replacementId = "b1c2d3e4-f5a6-4789-abcd-ef0123456789";
    await withInstructedCursor(
      { mode: "boundary" },
      cursor,
      instruction,
      async (server) => {
        const pid = cursor.attaches()[0]?.pid ?? 0;
        process.kill(pid, "SIGKILL");
        await expect.poll(() => processRunning(pid)).toBe(false);
        await new Promise((resolve) => setTimeout(resolve, 300));
        expect(keptCursor(server.home).firstInput?.state).toBe("uncertain");
        expect(enteredInstruction(cursor, pid)).not.toContain(instruction);

        cursor.setAttachMode("follow-up");
        cursor.queueCreateChatId(replacementId);
        const again = await launch(
          server,
          instructedCursorRequest(instruction),
        );
        expect(JSON.parse(again.body)).toMatchObject({
          kind: "launched",
          record: {
            session: { sessionId: replacementId },
            firstInput: { state: "confirmed", instruction },
          },
        });
        expect(cursor.calls().map((call) => call.args)).toEqual([
          ["create-chat"],
          ["create-chat"],
        ]);
        const resumed = cursor.attaches().at(-1);
        expect(resumed?.sessionId).toBe(replacementId);
        expect(enteredInstruction(cursor, resumed?.pid ?? 0)).toContain(
          instruction,
        );
        expect(keptCursor(server.home).session.sessionId).toBe(replacementId);
        expect(keptCursor(server.home).firstInput).toMatchObject({
          state: "confirmed",
          instruction,
        });
      },
    );
  });
});
