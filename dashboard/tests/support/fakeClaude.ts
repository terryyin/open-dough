// Prepares one dashboard server's side of the local launch boundary: the
// synthetic `claude` (../fixtures/fake-claude, with its attach module) in its
// own PATH directory, a temporary HOME holding only the project folders a test
// chooses (inside a machine directory the test owns, if it passes one) and,
// as that HOME's Open Dough notification sender, the synthetic
// `terminal-notifier` (../fixtures/fake-terminal-notifier), and the controls a
// test uses to choose the fake's scenario and read back what it was asked.
// Nothing here starts a server (./dashboardServer.ts does), and no test ever
// reaches the real `claude` or the real sender: every server puts the fake
// `claude` first on PATH, or, to observe a missing one, a PATH holding none,
// and finds its sender only under this temporary HOME, so no test raises a
// real notification.

import {
  existsSync,
  mkdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { installFixtureExecutable } from "./fixtureExecutable.ts";
import type { FakeHostWiring } from "./launchEnvironment.ts";
import {
  fakeClaudeControls,
  serverClaudeAttaches,
  type ClaudeAttach,
  type FakeClaudeControls,
  type NotifierMode,
} from "./fakeClaudeControls.ts";
export type {
  FakeClaudeScenario,
  ClaudeCall,
  NotifierCall,
  ClaudeAttach,
  ClaudeEnvironment,
  FakeClaudeControls,
} from "./fakeClaudeControls.ts";

export type { ClaudeSessionChange } from "./fakeClaudeListing.ts";

export type FakeClaudeOptions = {
  // A directory the caller owns that holds this server's HOME and the fake's
  // state, and outlives the server, so another server can start on the same
  // machine state. A private one, removed with the server, when unset.
  readonly machine?: string | undefined;
  // Folder names created under `<home>/git/`, as catalog projects' folders.
  readonly projectFolders?: readonly string[] | undefined;
  // `absent`: no `claude` anywhere on the server's PATH, which then holds
  // only the fake `gh` and Node.
  readonly claude?: "fake" | "absent";
  // How the fake sender starts: `absent` sets none up in HOME, leaving only a
  // `terminal-notifier` on PATH, which the server must not use; `failing`
  // refuses every notification; `hang` holds each one open. Working when
  // unset.
  readonly notifier?: "absent" | NotifierMode | undefined;
  // How often the server reads the sessions to alert; an hour when unset, so
  // only a test about alerts sees the server read the sessions on its own.
  readonly alertCheckMs?: number | undefined;
  // How long a settled sessions observation answers later reads
  // (`../../server/machineSessionObservation.ts`); 1 ms when unset, so a read
  // after a native or installation change observes it, as journeys that hold
  // page time and alert polls expect. A spec about reuse sets the production
  // second.
  readonly sessionsReuseMs?: number | undefined;
  // How often the server checks whether feedback maintenance is due; an hour
  // when unset, so only a test about that check sees it after the first.
  readonly maintenanceCheckMs?: number | undefined;
  // The server's own launch wait when unset.
  readonly launchTimeoutMs?: number | undefined;
  // How long Mark as done waits for the fake to list a rename; the server's
  // own wait when unset.
  readonly doneRenameWaitMs?: number | undefined;
};

// A PATH directory holding only this Node, for a server that must find no
// `claude` anywhere: the Vite launcher and the fake `gh` still start through
// `env node`.
function nodeOnlyBinDir(tempRoot: string): string {
  const binDir = path.join(tempRoot, "node-bin");
  mkdirSync(binDir, { recursive: true });
  symlinkSync(process.execPath, path.join(binDir, "node"));
  return binDir;
}

// The environment entries this server's launch boundary sees, given the
// fake `gh` wiring's own PATH and bin directory, and the controls over it.
// The fake's directory and wiring, for reading its recorded environment.
export const fakeClaudeHost: FakeHostWiring = {
  binDir: "claude-bin",
  wiring: "FAKE_CLAUDE_DIR",
};

// Open Dough's notification sender app under this HOME, where the server runs
// it from: written out here rather than taken from the server, so the
// location is checked too.
function fakeSenderApp(home: string): string {
  return path.join(
    home,
    ".open-dough",
    "dashboard",
    "notifier",
    "Open Dough.app",
  );
}

export function installFakeClaude(
  tempRoot: string,
  gh: { readonly binDir: string; readonly path: string },
  options: FakeClaudeOptions,
): {
  readonly env: Record<string, string>;
  readonly controls: FakeClaudeControls;
  readonly ownedAttaches: () => ClaudeAttach[];
} {
  const binDir = path.join(tempRoot, fakeClaudeHost.binDir);
  const notifierBinDir = path.join(tempRoot, "notifier-bin");
  const machine = options.machine ?? tempRoot;
  const stateDir = path.join(machine, "claude-state");
  const home = path.join(machine, "home");
  installFixtureExecutable("fake-claude", binDir, "claude");
  installFixtureExecutable(
    "fake-claude-attach.cjs",
    binDir,
    "fake-claude-attach.cjs",
  );
  installFixtureExecutable(
    "fake-host-environment.cjs",
    binDir,
    "fake-host-environment.cjs",
  );
  // Recorded like the sender, so a server that ran a helper from PATH is seen.
  installFixtureExecutable(
    "fake-terminal-notifier",
    notifierBinDir,
    "terminal-notifier",
  );
  // A machine another server already used may hold it. Removing the whole
  // app never follows a link inside it out of this HOME.
  const senderApp = fakeSenderApp(home);
  const senderDir = path.join(senderApp, "Contents", "MacOS");
  if (options.notifier === "absent")
    rmSync(senderApp, { recursive: true, force: true });
  else if (!existsSync(path.join(senderDir, "terminal-notifier")))
    installFixtureExecutable(
      "fake-terminal-notifier",
      senderDir,
      "terminal-notifier",
    );
  mkdirSync(stateDir, { recursive: true });
  for (const folder of ["", ...(options.projectFolders ?? [])]) {
    mkdirSync(path.join(home, "git", folder), { recursive: true });
  }

  const env: Record<string, string> = {
    // The real `claude` is never reached: the fake one comes first, or, where
    // it is absent, the system's own PATH is left out.
    PATH: [
      notifierBinDir,
      ...(options.claude === "absent"
        ? [gh.binDir, nodeOnlyBinDir(tempRoot)]
        : [binDir, gh.path]),
    ].join(path.delimiter),
    HOME: home,
    FAKE_CLAUDE_DIR: stateDir,
  };
  if (options.launchTimeoutMs !== undefined) {
    env["DOUGH_LAUNCH_TIMEOUT_MS"] = String(options.launchTimeoutMs);
  }
  env["DOUGH_ALERT_CHECK_MS"] = String(options.alertCheckMs ?? 3_600_000);
  env["DOUGH_SESSIONS_REUSE_MS"] = String(options.sessionsReuseMs ?? 1);
  env["DOUGH_MAINTENANCE_CHECK_MS"] = String(
    options.maintenanceCheckMs ?? 3_600_000,
  );
  if (options.doneRenameWaitMs !== undefined) {
    env["DOUGH_DONE_RENAME_WAIT_MS"] = String(options.doneRenameWaitMs);
  }

  const state = (file: string) => path.join(stateDir, file);
  if (options.notifier !== undefined && options.notifier !== "absent") {
    writeFileSync(state("notifier-mode"), options.notifier);
  }
  return {
    env,
    controls: fakeClaudeControls(stateDir, home),
    ownedAttaches: serverClaudeAttaches(stateDir, binDir),
  };
}
