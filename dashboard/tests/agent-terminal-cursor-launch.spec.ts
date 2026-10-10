// An instructed Cursor launch starts one kept terminal client and enters the
// instruction when that client's screen is ready. Opening the terminal joins
// that client. A screen that is not ready does not receive the instruction.
import { test, expect } from "./support/pageTest.ts";
import { launch } from "./agentLaunchBoundary.ts";
import { shows } from "./agentTerminalBoundary.ts";
import { installFakeCursor } from "./support/fakeCursor.ts";
import { openCursorTerminal } from "./support/cursorTerminal.ts";
import {
  enteredInstruction,
  instructedCursorRequest,
  keptCursor,
  withInstructedCursor,
} from "./support/keptCursorTurn.ts";
import { processRunning } from "./support/processGroup.ts";

const instruction = "hold this launch";
const notice =
  "Cursor is still working on this session's launch prompt. The terminal opens when it finishes.";
const unconfirmed =
  "This launch's recorded conversation has a first input that is not confirmed, so no other conversation was started. Check the recorded conversation for that input.";

for (const mode of ["dev", "preview"] as const) {
  test.describe(`Cursor launch turn (${mode})`, () => {
    test.describe.configure({ timeout: 120_000 });

    test("an instructed launch shows that client and accepts typing", async () => {
      const cursor = installFakeCursor({ screen: "working" });
      await withInstructedCursor(
        mode,
        cursor,
        instruction,
        async (server, launched) => {
          expect(JSON.parse(launched.body)).toMatchObject({
            kind: "launched",
          });
          const recorded = keptCursor(server.home);
          const session = recorded.session;
          if (session.host !== "cursor") {
            throw new Error("Missing recorded Cursor session.");
          }
          const sessionId = session.sessionId;
          const workspace = session.continuation.workspace;
          expect(recorded.firstInput).toMatchObject({
            state: "confirmed",
            instruction: expect.stringContaining(instruction),
          });
          expect(cursor.calls().map((call) => call.args)).toEqual([
            ["create-chat"],
          ]);
          expect(cursor.attaches()).toHaveLength(1);
          const client = cursor.attaches()[0];
          const pid = client?.pid ?? 0;
          expect(client?.args).toEqual([
            "--workspace",
            workspace,
            "--resume",
            sessionId,
          ]);
          expect(enteredInstruction(cursor, pid)).toBe(
            recorded.firstInput?.instruction,
          );
          expect(processRunning(pid)).toBe(true);

          const terminal = await openCursorTerminal(server, sessionId);
          expect(await shows(terminal, "ctrl+c to stop")).toBe(true);
          expect(terminal.output()).toContain("Add a follow-up");
          expect(terminal.output()).not.toContain(notice);
          expect(cursor.attaches()).toHaveLength(1);
          terminal.send({ input: "later" });
          await expect.poll(() => cursor.input(pid)).toContain("later");
          expect(cursor.calls()).toHaveLength(1);

          terminal.socket.close();
          await terminal.closed;
          expect(processRunning(pid)).toBe(true);
          const again = await openCursorTerminal(server, sessionId);
          await expect.poll(() => again.output()).toContain("ctrl+c to stop");
          expect(cursor.attaches()).toHaveLength(1);
          expect(cursor.attaches()[0]?.pid).toBe(pid);
          again.send({ input: "still" });
          await expect.poll(() => cursor.input(pid)).toContain("still");
          expect(server.claudeAttaches()).toEqual([]);
        },
      );
    });

    test("an empty chat that shows Plan, search, build anything receives the instruction", async () => {
      const cursor = installFakeCursor({ screen: "composer" });
      await withInstructedCursor(mode, cursor, instruction, (server) => {
        const recorded = keptCursor(server.home);
        expect(recorded.firstInput).toMatchObject({
          state: "confirmed",
          instruction: expect.stringContaining(instruction),
        });
        const pid = cursor.attaches()[0]?.pid ?? 0;
        expect(enteredInstruction(cursor, pid)).toBe(
          recorded.firstInput?.instruction,
        );
      });
    });

    test("a long multiline instruction is submitted after Cursor shows it as pasted text", async () => {
      const cursor = installFakeCursor({ screen: "composer" });
      const story = `${instruction}\n${"line of the launch instruction. ".repeat(40)}`;
      await withInstructedCursor(mode, cursor, story, async (server) => {
        const pid = cursor.attaches()[0]?.pid ?? 0;
        await expect
          .poll(() => keptCursor(server.home).firstInput?.state)
          .toBe("confirmed");
        expect(enteredInstruction(cursor, pid)).toBe(story);
        expect(keptCursor(server.home).firstInput?.instruction).toBe(story);
      });
    });

    test("an answer typed while the agent is asking reaches that client", async () => {
      const cursor = installFakeCursor({ screen: "waiting" });
      await withInstructedCursor(mode, cursor, instruction, async (server) => {
        const recorded = keptCursor(server.home);
        expect(recorded.firstInput).toMatchObject({ state: "uncertain" });
        const pid = cursor.attaches()[0]?.pid ?? 0;
        expect(enteredInstruction(cursor, pid)).not.toContain(instruction);
        const terminal = await openCursorTerminal(
          server,
          recorded.session.sessionId,
        );
        expect(await shows(terminal, "Clarifying Questions")).toBe(true);
        expect(terminal.output()).not.toContain(notice);
        terminal.send({ input: "Red" });
        await expect.poll(() => cursor.input(pid)).toContain("Red");
        expect(cursor.attaches()).toHaveLength(1);
        expect(keptCursor(server.home).firstInput?.state).toBe("uncertain");
      });
    });

    test("a trust prompt that never becomes the composer does not receive the instruction", async () => {
      const cursor = installFakeCursor({ screen: "trust" });
      await withInstructedCursor(mode, cursor, instruction, (server) => {
        const recorded = keptCursor(server.home);
        expect(recorded.firstInput).toMatchObject({ state: "uncertain" });
        const pid = cursor.attaches()[0]?.pid ?? 0;
        expect(enteredInstruction(cursor, pid)).not.toContain(instruction);
        expect(processRunning(pid)).toBe(true);
        expect(cursor.attaches()).toHaveLength(1);
      });
    });

    test("a screen that is not ready receives the instruction when it becomes ready", async () => {
      const cursor = installFakeCursor({
        screen: "trust",
        becomeReady: true,
      });
      await withInstructedCursor(mode, cursor, instruction, async (server) => {
        const recorded = keptCursor(server.home);
        expect(recorded.firstInput).toMatchObject({ state: "uncertain" });
        const pid = cursor.attaches()[0]?.pid ?? 0;
        expect(enteredInstruction(cursor, pid)).not.toContain(instruction);
        const terminal = await openCursorTerminal(
          server,
          recorded.session.sessionId,
        );
        expect(await shows(terminal, "Do you trust this workspace?")).toBe(
          true,
        );
        terminal.send({ input: "trust-answer" });
        await expect.poll(() => cursor.input(pid)).toContain("trust-answer");
        expect(enteredInstruction(cursor, pid)).not.toContain(instruction);

        cursor.showReady();
        await expect
          .poll(() => enteredInstruction(cursor, pid))
          .toContain(instruction);
        await expect
          .poll(() => keptCursor(server.home).firstInput?.state)
          .toBe("confirmed");
        expect(cursor.attaches()).toHaveLength(1);
        expect(cursor.attaches()[0]?.pid).toBe(pid);
        expect(processRunning(pid)).toBe(true);
      });
    });

    test("the client exiting does not accept the instruction, and a matching launch starts no other conversation", async () => {
      const cursor = installFakeCursor({ screen: "trust" });
      await withInstructedCursor(mode, cursor, instruction, async (server) => {
        const pid = cursor.attaches()[0]?.pid ?? 0;
        process.kill(pid, "SIGKILL");
        await expect.poll(() => processRunning(pid)).toBe(false);
        await new Promise((resolve) => setTimeout(resolve, 300));
        expect(keptCursor(server.home).firstInput?.state).toBe("uncertain");
        expect(enteredInstruction(cursor, pid)).not.toContain(instruction);

        const again = await launch(
          server,
          instructedCursorRequest(instruction),
        );
        expect(JSON.parse(again.body)).toEqual({
          kind: "uncertain",
          reason: "unconfirmed",
          explanation: unconfirmed,
        });
        expect(cursor.calls().map((call) => call.args)).toEqual([
          ["create-chat"],
        ]);
        expect(cursor.attaches()).toHaveLength(1);
      });
    });
  });
}
