// Saved conversations survive machine restart; startup restores only the daemon.
import { test, expect } from "@playwright/test";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  existsSync,
  realpathSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { installFakeCodex } from "./support/fakeCodex.ts";
import {
  startDashboardServer,
  builtDashboardDir,
} from "./support/dashboardServer.ts";
import {
  observationRecord,
  saveObservations,
  observationStates,
  observed,
  passive,
} from "./support/codexObservation.ts";
import { openCodexTerminal, codexAttaches } from "./support/codexTerminal.ts";
import { stored } from "./support/codexLaunch.ts";

for (const mode of ["dev", "preview"] as const) {
  test(`saved Codex conversation reconnects after daemon loss at ${mode} startup`, async () => {
    const machine = mkdtempSync(path.join(tmpdir(), "dough-codex-startup-"));
    const native = await installFakeCodex(
      machine,
      process.env["PATH"] ?? "",
      "on-start",
    );
    const home = path.join(machine, "home");
    // These helpers need only HOME: the record exists before the server starts.
    const saved = observationRecord({ home }, native, "saved-conversation");
    saveObservations({ home }, [saved]);
    observed(native, "saved-conversation", { type: "notLoaded" }, "completed");
    expect(existsSync(native.env["FAKE_CODEX_SOCKET"] ?? "")).toBe(false);
    const server = await startDashboardServer({
      mode,
      prebuilt: builtDashboardDir,
      machine,
      codexProtocol: native,
      projectFolders: ["open-dough"],
    });
    try {
      // No launch or HTTP read is needed to start the vendor service.
      await expect
        .poll(() => existsSync(native.env["FAKE_CODEX_DAEMON_LOG"] ?? ""))
        .toBe(true);
      expect(
        JSON.parse(
          readFileSync(
            native.env["FAKE_CODEX_DAEMON_LOG"] ?? "",
            "utf8",
          ).trim(),
        ),
      ).toEqual({ cwd: realpathSync(home) });
      expect(
        (await observationStates(server)).map(({ session, sessionState }) => [
          session.sessionId,
          sessionState,
        ]),
      ).toEqual([
        [
          "saved-conversation",
          { kind: "available", availability: "retained", activity: "review" },
        ],
      ]);
      passive(native.calls);
      expect(stored(home)).toEqual([saved]);
      const terminal = await openCodexTerminal(server, "saved-conversation");
      try {
        await expect.poll(() => codexAttaches(native).length).toBe(1);
        expect(codexAttaches(native)[0]?.args).toContain("saved-conversation");
      } finally {
        terminal.socket.close();
      }
      expect(stored(home)).toEqual([saved]);
    } finally {
      await server.close();
      await native.close();
      rmSync(machine, { recursive: true, force: true });
    }
  });
}

for (const scenario of [
  "already-running",
  "refused",
  "absent",
  "no-sessions",
] as const) {
  test(`dashboard startup preserves records with ${scenario} Codex`, async () => {
    const machine = mkdtempSync(path.join(tmpdir(), "dough-codex-startup-"));
    const native = await installFakeCodex(
      machine,
      process.env["PATH"] ?? "",
      scenario !== "refused" && scenario !== "absent",
    );
    const home = path.join(machine, "home");
    const saved = observationRecord({ home }, native, "saved-conversation");
    const records = scenario === "no-sessions" ? [] : [saved];
    saveObservations({ home }, records);
    observed(
      native,
      "saved-conversation",
      { type: "active", activeFlags: [] },
      "inProgress",
    );
    if (scenario === "absent") {
      rmSync(path.join(native.binDir, "codex"));
      symlinkSync(process.execPath, path.join(native.binDir, "node"));
    }
    const server = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      machine,
      codexProtocol: native,
      projectFolders: ["open-dough"],
      ...(scenario === "absent" ? { extraEnv: { PATH: native.binDir } } : {}),
    });
    try {
      const states = await observationStates(server);
      expect(states.map(({ sessionState }) => sessionState)).toEqual(
        scenario === "no-sessions"
          ? []
          : scenario === "refused" || scenario === "absent"
            ? [{ kind: "unknown" }]
            : [
                {
                  kind: "available",
                  availability: "loaded",
                  activity: "working",
                },
              ],
      );
      if (scenario === "already-running") {
        expect(
          readFileSync(native.env["FAKE_CODEX_DAEMON_LOG"] ?? "", "utf8")
            .trim()
            .split("\n"),
        ).toHaveLength(1);
        await observationStates(server);
        expect(
          readFileSync(native.env["FAKE_CODEX_DAEMON_LOG"] ?? "", "utf8")
            .trim()
            .split("\n"),
        ).toHaveLength(1);
      } else if (scenario === "no-sessions") {
        expect(existsSync(native.env["FAKE_CODEX_DAEMON_LOG"] ?? "")).toBe(
          false,
        );
      }
      passive(native.calls);
      expect(stored(home)).toEqual(records);
    } finally {
      await server.close();
      await native.close();
      rmSync(machine, { recursive: true, force: true });
    }
  });
}
