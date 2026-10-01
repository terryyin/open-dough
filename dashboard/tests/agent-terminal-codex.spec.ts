// Actual HTTP/store/WS/PTY: substitute CLI supplies only native startup/transport output.
import { writeFileSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { test as base, expect, stored } from "./support/codexLaunch.ts";
import {
  launch,
  refinementRequest,
  machineSessions,
} from "./agentLaunchBoundary.ts";
import { shows, refusedStatus, terminalUrl } from "./agentTerminalBoundary.ts";
import {
  codexAttaches,
  codexEnded,
  codexLines,
  codexTerminalMode,
  expectCodexHungUp,
  openCodexTerminal,
} from "./support/codexTerminal.ts";
import { processRunning } from "./support/processGroup.ts";

import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";
const test = base.extend<{ mode: "dev" | "preview" }>({
  mode: ["preview", { option: true }],
  dashboard: async ({ mode, github, machine, codexProtocol }, use) => {
    const server = await startDashboardServer({
      mode,
      prebuilt: builtDashboardDir,
      github,
      machine,
      codexProtocol,
      projectFolders: ["open-dough"],
    });
    await use(server);
    await server.close();
  },
});
test.use({ projectFolders: ["open-dough"] });
for (const mode of ["dev", "preview"] as const) {
  test.describe(`Codex native terminal boundary (${mode})`, () => {
    test.use({ mode });
    test("saved context supplies native resume, transport and detach without replay or fork", async ({
      dashboard,
      codexProtocol: native,
    }) => {
      if (native === undefined) throw new Error("Missing native fixture");
      await launch(dashboard, { ...refinementRequest, host: "codex" });
      const record = stored(dashboard.home)[0];
      if (record?.session.host !== "codex")
        throw new Error("Missing saved Codex record.");
      const before = [...native.calls];
      const terminal = await openCodexTerminal(dashboard, native.threadId);
      expect(await shows(terminal, "original retained history")).toBe(true);
      const attach = codexAttaches(native)[0];
      expect(attach).toMatchObject({
        cwd: realpathSync(record.session.continuation?.workspace ?? ""),
        cols: 80,
        rows: 24,
      });
      expect(attach?.args).toEqual([
        "resume",
        "--remote",
        record.session.continuation?.endpoint,
        "--cd",
        record.session.continuation?.workspace,
        "--no-alt-screen",
        native.threadId,
      ]);
      terminal.send({ input: "answer\r" });
      expect(await shows(terminal, "echo answer")).toBe(true);
      terminal.send({ resize: { cols: 120, rows: 40 } });
      expect(await shows(terminal, "resized 120x40")).toBe(true);
      expect(codexLines(native, attach?.pid ?? 0)).toEqual(["answer"]);
      terminal.socket.close();
      await expectCodexHungUp(native, attach?.pid ?? 0);
      expect(await machineSessions(dashboard)).toHaveLength(1);
      expect(
        native.calls.filter((call) =>
          [
            "thread/start",
            "thread/resume",
            "turn/start",
            "turn/interrupt",
          ].includes(call.method),
        ),
      ).toEqual(
        before.filter((call) =>
          [
            "thread/start",
            "thread/resume",
            "turn/start",
            "turn/interrupt",
          ].includes(call.method),
        ),
      );
      const unknown = new URL(terminalUrl(dashboard, "open-dough", "unknown"));
      unknown.searchParams.set("host", "codex");
      expect(
        await refusedStatus(unknown.href, { origin: dashboard.origin }),
      ).toBe(404);
      expect(codexAttaches(native)).toHaveLength(1);
      unknown.searchParams.set("session", native.threadId);
      expect(
        await refusedStatus(unknown.href, { origin: "http://evil.example" }),
      ).toBe(403);
      expect(codexAttaches(native)).toHaveLength(1);
    });
    test("failed exit and unconfigured startup preserve done intent; native ready clears only this host's mark", async ({
      dashboard,
      codexProtocol: native,
    }) => {
      if (native === undefined) throw new Error("Missing native fixture");
      await launch(dashboard, { ...refinementRequest, host: "codex" });
      const file = path.join(
        dashboard.home,
        ".open-dough",
        "dashboard",
        "agent-launches.json",
      );
      const state = JSON.parse(readFileSync(file, "utf8")) as Record<
        string,
        unknown[]
      >;
      const record = stored(dashboard.home)[0];
      if (record === undefined) throw new Error("Missing saved record");
      const doneAt = "2026-10-01T00:00:00Z";
      state["open-dough"] = [
        { ...record, doneAt },
        {
          ...record,
          session: {
            host: "claude",
            sessionId: native.threadId,
            shortId: "another-host",
            name: "same ID",
          },
          doneAt,
        },
      ];
      writeFileSync(file, JSON.stringify(state));
      codexTerminalMode(native, "fail");
      const failed = await openCodexTerminal(dashboard, native.threadId);
      expect(await failed.closed).toBe(1011);
      expect(codexEnded(native, codexAttaches(native)[0]?.pid ?? 0)).toBe(
        "refused",
      );
      await expect
        .poll(() => processRunning(codexAttaches(native)[0]?.pid ?? 0))
        .toBe(false);
      expect(stored(dashboard.home).map((entry) => entry.doneAt)).toEqual([
        doneAt,
        doneAt,
      ]);
      codexTerminalMode(native, "unready");
      const pending = await openCodexTerminal(dashboard, native.threadId);
      expect(await shows(pending, "Input disabled.")).toBe(true);
      pending.send({
        cursorVisible: true,
        screen: [
          "OpenAI Codex (v0.159.3)",
          "Resuming session…",
          "› Ask Codex to do anything",
        ],
      });
      await machineSessions(dashboard);
      expect(stored(dashboard.home)[0]?.doneAt).toBe(doneAt);
      pending.send({
        cursorVisible: false,
        screen: ["› retained draft", "custom native footer"],
      });
      await machineSessions(dashboard);
      expect(stored(dashboard.home)[0]?.doneAt).toBe(doneAt);
      pending.socket.close();
      const pendingPid = codexAttaches(native).at(-1)?.pid ?? 0;
      await expect.poll(() => codexEnded(native, pendingPid)).toBe("SIGHUP");
      codexTerminalMode(native, "ready");
      const ready = await openCodexTerminal(dashboard, native.threadId);
      expect(await shows(ready, "GPT-6.1-Sol default")).toBe(true);
      ready.send({
        cursorVisible: true,
        screen: ["› already typed draft", "configured custom footer"],
      });
      await expect
        .poll(() => stored(dashboard.home)[0]?.doneAt)
        .toBeUndefined();
      expect(stored(dashboard.home)[1]?.doneAt).toBe(doneAt);
      ready.send({ input: "\u001a" });
      expect(await ready.closed).toBe(4000);
      await expect
        .poll(() => processRunning(codexAttaches(native).at(-1)?.pid ?? 0))
        .toBe(false);
    });
  });
}
