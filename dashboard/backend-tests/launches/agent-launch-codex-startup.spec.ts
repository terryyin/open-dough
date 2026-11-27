// Startup restores the service a saved conversation needs. It observes without resuming it.
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { codexHost } from "../../server/codexHost.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { attachableSession } from "../../server/terminalAdmission.ts";
import { agentTerminalEndpoint } from "../../src/agentTerminal.ts";
import {
  codexEndpoint,
  fakeCodexHost,
  installFakeCodex,
  type FakeCodex,
} from "../../test-support/support/fakeCodex.ts";
import {
  observationRecord,
  saveObservations,
  observed,
  passive,
  daemonStarts,
  codexEnvironments,
} from "../../test-support/support/codexObservation.ts";
import { codexAttaches } from "../../test-support/support/codexTerminal.ts";
import {
  deploymentLikeStart,
  developerShellViolations,
} from "../../test-support/support/launchEnvironment.ts";

const source = "open-dough";
const sessionId = "saved-conversation";

async function machine(serve: Parameters<typeof installFakeCodex>[2]) {
  const directory = mkdtempSync(path.join(tmpdir(), "dough-codex-startup-"));
  const native = await installFakeCodex(
    directory,
    process.env["PATH"] ?? "",
    serve,
  );
  const home = path.join(directory, "home");
  const workspace = path.join(home, "git", source);
  mkdirSync(workspace, { recursive: true });
  onTestFinished(async () => {
    await native.close();
    vi.unstubAllEnvs();
    rmSync(directory, { recursive: true, force: true });
  });
  for (const [key, value] of Object.entries(native.env)) vi.stubEnv(key, value);
  vi.stubEnv("HOME", home);
  return { directory, native, home };
}

function startDashboard() {
  const unmount = mountProjectConfiguration("production");
  const marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: () => undefined,
    reportingFolder: machineFolder,
  });
  const launches = new AgentLaunches(marks);
  onTestFinished(async () => {
    launches.close();
    await marks.close();
    unmount();
  });
  return launches;
}

test("saved Codex conversation reconnects after daemon loss at startup", async () => {
  const { directory, native, home } = await machine("on-start");
  const workspace = path.join(directory, "saved-worktree");
  mkdirSync(workspace);
  const endpoint = codexEndpoint(native);
  const saved = observationRecord({ home }, native, sessionId, { workspace });
  saveObservations({ home }, [saved]);
  observed(native, sessionId, { type: "notLoaded" }, "completed");
  expect(existsSync(native.env["FAKE_CODEX_SOCKET"] ?? "")).toBe(false);
  const deployment = deploymentLikeStart(path.join(directory, "deployment"));
  deployment.create();
  for (const [key, value] of Object.entries(deployment.extraEnv))
    vi.stubEnv(key, value);
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv(
    "PATH",
    [...deployment.pathPrefix, native.env["PATH"]].join(path.delimiter),
  );

  const launches = startDashboard();

  // Construction restores the daemon before any call to the session read or attach.
  await expect
    .poll(() => existsSync(native.env["FAKE_CODEX_DAEMON_LOG"] ?? ""))
    .toBe(true);
  expect(daemonStarts(native)).toEqual([{ cwd: realpathSync(home) }]);
  const daemonEnvironments = codexEnvironments(native, "app-server");
  expect(daemonEnvironments).toHaveLength(1);
  expect(
    developerShellViolations(
      daemonEnvironments[0],
      fakeCodexHost("FAKE_CODEX_SOCKET"),
    ),
  ).toEqual([]);
  expect(
    (await launches.machineObservation()).records.map(
      ({ session, sessionState }) => [session.sessionId, sessionState],
    ),
  ).toEqual([
    [
      sessionId,
      { kind: "available", availability: "retained", activity: "review" },
    ],
  ]);
  passive(native.calls);
  expect(await keptRecords(source)).toEqual([saved]);

  const terminalUrl = new URL(agentTerminalEndpoint, "http://127.0.0.1:4173");
  terminalUrl.search = new URLSearchParams({
    source,
    host: "codex",
    session: sessionId,
  }).toString();
  const admitted = await attachableSession(terminalUrl, launches);
  const terminal = codexHost.attach?.(admitted.session, admitted.folder, {
    cols: 80,
    rows: 24,
  });
  if (terminal === undefined || !("pty" in terminal))
    throw new Error("Expected the saved Codex terminal.");
  const exited = new Promise<void>((resolve) => {
    terminal.pty.onExit(() => {
      resolve();
    });
  });
  try {
    await expect.poll(() => codexAttaches(native)).toHaveLength(1);
    expect(codexAttaches(native)[0]).toMatchObject({
      cwd: realpathSync(workspace),
      args: [
        "resume",
        "--remote",
        endpoint,
        "--cd",
        workspace,
        "--no-alt-screen",
        sessionId,
      ],
    });
  } finally {
    terminal.pty.kill("SIGHUP");
    await exited;
  }
  expect(await keptRecords(source)).toEqual([saved]);
});

function saveActiveConversation(native: FakeCodex, home: string) {
  const saved = observationRecord({ home }, native, sessionId);
  saveObservations({ home }, [saved]);
  observed(
    native,
    sessionId,
    { type: "active", activeFlags: [] },
    "inProgress",
  );
  return saved;
}

test("dashboard startup uses an already-running Codex service once across repeated observations", async () => {
  const { native, home } = await machine(true);
  const saved = saveActiveConversation(native, home);

  const launches = startDashboard();

  expect(
    (await launches.machineObservation()).records.map(
      ({ sessionState }) => sessionState,
    ),
  ).toEqual([
    { kind: "available", availability: "loaded", activity: "working" },
  ]);
  expect(daemonStarts(native)).toHaveLength(1);
  await launches.machineObservation();
  expect(daemonStarts(native)).toHaveLength(1);
  passive(native.calls);
  expect(await keptRecords(source)).toEqual([saved]);
});

test.each(["refused", "absent"])(
  "dashboard startup preserves a conversation when Codex is %s",
  async (scenario) => {
    const { native, home } = await machine(false);
    const saved = saveActiveConversation(native, home);
    if (scenario === "absent") {
      rmSync(path.join(native.binDir, "codex"));
      symlinkSync(process.execPath, path.join(native.binDir, "node"));
      vi.stubEnv("PATH", native.binDir);
    }

    const launches = startDashboard();

    expect(
      (await launches.machineObservation()).records.map(
        ({ sessionState }) => sessionState,
      ),
    ).toEqual([{ kind: "unknown" }]);
    passive(native.calls);
    expect(await keptRecords(source)).toEqual([saved]);
  },
);

test("dashboard startup has no Codex daemon to restore without a saved conversation", async () => {
  const { native, home } = await machine(true);
  saveObservations({ home }, []);

  const launches = startDashboard();

  expect((await launches.machineObservation()).records).toEqual([]);
  expect(existsSync(native.env["FAKE_CODEX_DAEMON_LOG"] ?? "")).toBe(false);
  passive(native.calls);
  expect(await keptRecords(source)).toEqual([]);
});
