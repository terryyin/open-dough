// An instructed Cursor launch starts one kept terminal client and enters the
// instruction when that client's screen is ready. Opening the terminal joins
// that client. A screen that is not ready does not receive the instruction.
import { test as base, expect } from "./support/pageTest.ts";
import { launch } from "./agentLaunchBoundary.ts";
import { shows } from "./agentTerminalBoundary.ts";
import { installFakeCursor } from "./support/fakeCursor.ts";
import { openCursorTerminal } from "./support/cursorTerminal.ts";
import {
  enteredInstruction,
  keptCursor,
  withCursorLaunch,
} from "./support/keptCursorTurn.ts";
import { processRunning } from "./support/processGroup.ts";

const instruction = "hold this launch";
const notice =
  "Cursor is still working on this session's launch prompt. The terminal opens when it finishes.";
const unconfirmed =
  "This launch's recorded conversation has a first input that is not confirmed, so no other conversation was started. Check the recorded conversation for that input.";

const test = base.extend<{
  mode: "dev" | "preview";
}>({
  mode: ["preview", { option: true }],
});

for (const mode of ["dev", "preview"] as const) {
  test.describe(`Cursor launch turn (${mode})`, () => {
    test.use({ mode });

    test("an instructed launch shows that client and accepts typing", async ({
      mode: launchMode,
    }) => {
      test.setTimeout(120_000);
      const cursor = installFakeCursor({ screen: "working" });
      await withCursorLaunch(
        launchMode,
        cursor,
        async (server) => {
          const launched = await launch(server, {
            source: "open-dough",
            workflow: "ad-hoc",
            host: "cursor",
            instruction,
          });
          expect(launched.status).toBe(200);
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
        1_000,
      );
    });

    test("an empty chat that shows Plan, search, build anything receives the instruction", async ({
      mode: launchMode,
    }) => {
      test.setTimeout(120_000);
      const cursor = installFakeCursor({ screen: "composer" });
      await withCursorLaunch(launchMode, cursor, async (server) => {
        const launched = await launch(server, {
          source: "open-dough",
          workflow: "ad-hoc",
          host: "cursor",
          instruction,
        });
        expect(launched.status).toBe(200);
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

    test("an answer typed while the agent is asking reaches that client", async ({
      mode: launchMode,
    }) => {
      test.setTimeout(120_000);
      const cursor = installFakeCursor({ screen: "waiting" });
      await withCursorLaunch(launchMode, cursor, async (server) => {
        const launched = await launch(server, {
          source: "open-dough",
          workflow: "ad-hoc",
          host: "cursor",
          instruction,
        });
        expect(launched.status).toBe(200);
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

    test("a screen that is not ready receives the instruction when it becomes ready", async ({
      mode: launchMode,
    }) => {
      test.setTimeout(120_000);
      const cursor = installFakeCursor({
        screen: "trust",
        becomeReady: true,
      });
      await withCursorLaunch(launchMode, cursor, async (server) => {
        const launched = await launch(server, {
          source: "open-dough",
          workflow: "ad-hoc",
          host: "cursor",
          instruction,
        });
        expect(launched.status).toBe(200);
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

    test("the client exiting does not accept the instruction, and a matching launch starts no other conversation", async ({
      mode: launchMode,
    }) => {
      test.setTimeout(120_000);
      const cursor = installFakeCursor({ screen: "trust" });
      await withCursorLaunch(launchMode, cursor, async (server) => {
        const body = {
          source: "open-dough" as const,
          workflow: "ad-hoc" as const,
          host: "cursor" as const,
          instruction,
        };
        expect((await launch(server, body)).status).toBe(200);
        const pid = cursor.attaches()[0]?.pid ?? 0;
        process.kill(pid, "SIGKILL");
        await expect.poll(() => processRunning(pid)).toBe(false);
        await new Promise((resolve) => setTimeout(resolve, 300));
        expect(keptCursor(server.home).firstInput?.state).toBe("uncertain");
        expect(enteredInstruction(cursor, pid)).not.toContain(instruction);

        const again = await launch(server, body);
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

    test("the launch wait abort leaves the client running and a later ready screen accepts the instruction", async ({
      mode: launchMode,
    }) => {
      test.setTimeout(120_000);
      const cursor = installFakeCursor({
        screen: "working",
        paintDelayMs: 3_000,
      });
      await withCursorLaunch(
        launchMode,
        cursor,
        async (server) => {
          const launched = await launch(server, {
            source: "open-dough",
            workflow: "ad-hoc",
            host: "cursor",
            instruction,
          });
          expect(launched.status).toBe(200);
          const pid = cursor.attaches()[0]?.pid ?? 0;
          expect(processRunning(pid)).toBe(true);
          expect(keptCursor(server.home).firstInput?.state).toBe("uncertain");
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
  });
}
