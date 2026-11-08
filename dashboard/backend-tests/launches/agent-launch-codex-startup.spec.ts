// Saved conversations survive machine restart; startup restores only the daemon,
// in the developer's shell environment when the dashboard starts as a
// deployment's does (../../tests/support/launchEnvironment.ts).
import { test, expect } from "../../tests/support/pageTest.ts";
import {
  mkdtempSync,
  rmSync,
  existsSync,
  realpathSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  codexEndpoint,
  fakeCodexHost,
  installFakeCodex,
} from "../../tests/support/fakeCodex.ts";
import { startDashboardServer } from "../../tests/support/dashboardServer.ts";
import {
  observationRecord,
  saveObservations,
  observationStates,
  observed,
  passive,
  daemonStarts,
  codexEnvironments,
} from "../../tests/support/codexObservation.ts";
import {
  openCodexTerminal,
  codexAttaches,
} from "../../tests/support/codexTerminal.ts";
import { stored } from "../../tests/support/codexLaunch.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
} from "../../tests/launchJourney.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  deploymentLikeStart,
  expectDeveloperShellEnvironment,
} from "../../tests/support/launchEnvironment.ts";

test(`saved Codex conversation reconnects after daemon loss at startup`, async () => {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-codex-startup-"));
  const native = await installFakeCodex(
    machine,
    process.env["PATH"] ?? "",
    "on-start",
  );
  const home = path.join(machine, "home");
  // A kept Codex thread with its saved workspace and app-server endpoint.
  const workspace = path.join(home, "git", "open-dough");
  const endpoint = codexEndpoint(native);
  const saved = makeMe.aLaunchRecord
    .refining({ identity: notRefinedIdentity, title: notRefinedStory })
    .inCodexSession({
      sessionId: "saved-conversation",
      continuation: { workspace, endpoint },
    })
    .please();
  // This helper needs only HOME: the record exists before the server starts.
  saveObservations({ home }, [saved]);
  observed(native, "saved-conversation", { type: "notLoaded" }, "completed");
  expect(existsSync(native.env["FAKE_CODEX_SOCKET"] ?? "")).toBe(false);
  const start = deploymentLikeStart(path.join(machine, "deployment"));
  start.create();
  const server = await startDashboardServer({
    mode: "boundary",
    machine,
    codexProtocol: native,
    projectFolders: ["open-dough"],
    pathPrefix: start.pathPrefix,
    extraEnv: start.extraEnv,
  });
  try {
    // No launch or HTTP read is needed to start the vendor service.
    await expect
      .poll(() => existsSync(native.env["FAKE_CODEX_DAEMON_LOG"] ?? ""))
      .toBe(true);
    expect(daemonStarts(native)).toEqual([{ cwd: realpathSync(home) }]);
    const daemonEnvironments = codexEnvironments(native, "app-server");
    expect(daemonEnvironments).toHaveLength(1);
    expectDeveloperShellEnvironment(
      daemonEnvironments[0],
      fakeCodexHost("FAKE_CODEX_SOCKET"),
    );
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
      // The terminal resumes that thread at the saved endpoint and workspace.
      expect(codexAttaches(native)[0]).toMatchObject({
        cwd: realpathSync(workspace),
        args: [
          "resume",
          "--remote",
          endpoint,
          "--cd",
          workspace,
          "--no-alt-screen",
          "saved-conversation",
        ],
      });
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
      mode: "boundary",
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
        expect(daemonStarts(native)).toHaveLength(1);
        await observationStates(server);
        expect(daemonStarts(native)).toHaveLength(1);
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
