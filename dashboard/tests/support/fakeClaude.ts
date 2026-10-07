// Prepares one dashboard server's side of the local launch boundary: the
// synthetic `claude` (../fixtures/fake-claude, with its attach module) in its
// own PATH directory, the synthetic `osascript` (../fixtures/fake-osascript)
// before it, a temporary HOME holding only the project folders a test chooses
// (inside a machine directory the test owns, if it passes one), and the
// controls a test uses to choose the fake's scenario and read back what it was
// asked. Nothing here starts a server (./dashboardServer.ts does), and no test
// ever reaches the real `claude` or `osascript`: every server puts these first
// on PATH, or, to observe a missing one, a PATH holding none, so no test
// raises a real notification.

import { mkdirSync, symlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { installFixtureExecutable } from "./fixtureExecutable.ts";
import {
  fakeClaudeControls,
  type FakeClaudeControls,
} from "./fakeClaudeControls.ts";
export type {
  FakeClaudeScenario,
  ClaudeCall,
  OsascriptCall,
  ClaudeAttach,
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
  // How the fake `osascript` starts: `absent` puts none on the server's PATH;
  // `failing` refuses every notification; `hang` holds each one open. Working
  // when unset.
  readonly osascript?: "absent" | "failing" | "hang" | undefined;
  // How often the server reads the sessions to alert; an hour when unset, so
  // only a test about alerts sees the server read the sessions on its own.
  readonly alertCheckMs?: number | undefined;
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
export function installFakeClaude(
  tempRoot: string,
  gh: { readonly binDir: string; readonly path: string },
  options: FakeClaudeOptions,
): {
  readonly env: Record<string, string>;
  readonly controls: FakeClaudeControls;
} {
  const binDir = path.join(tempRoot, "claude-bin");
  const osascriptBinDir = path.join(tempRoot, "osascript-bin");
  const machine = options.machine ?? tempRoot;
  const stateDir = path.join(machine, "claude-state");
  const home = path.join(machine, "home");
  installFixtureExecutable("fake-claude", binDir, "claude");
  installFixtureExecutable(
    "fake-claude-attach.cjs",
    binDir,
    "fake-claude-attach.cjs",
  );
  if (options.osascript !== "absent") {
    installFixtureExecutable("fake-osascript", osascriptBinDir, "osascript");
  }
  mkdirSync(stateDir, { recursive: true });
  for (const folder of ["", ...(options.projectFolders ?? [])]) {
    mkdirSync(path.join(home, "git", folder), { recursive: true });
  }

  const env: Record<string, string> = {
    // The real `claude` and `osascript` are never reached: the fake ones come
    // first, or none is on PATH at all.
    // Where either is absent, the system's own PATH is left out, so a real
    // `osascript` on a Mac is out of reach too.
    PATH: [
      ...(options.osascript === "absent" ? [] : [osascriptBinDir]),
      ...(options.claude === "absent"
        ? [gh.binDir, nodeOnlyBinDir(tempRoot)]
        : options.osascript === "absent"
          ? [binDir, gh.binDir, nodeOnlyBinDir(tempRoot)]
          : [binDir, gh.path]),
    ].join(path.delimiter),
    HOME: home,
    FAKE_CLAUDE_DIR: stateDir,
  };
  if (options.launchTimeoutMs !== undefined) {
    env["DOUGH_LAUNCH_TIMEOUT_MS"] = String(options.launchTimeoutMs);
  }
  env["DOUGH_ALERT_CHECK_MS"] = String(options.alertCheckMs ?? 3_600_000);
  if (options.doneRenameWaitMs !== undefined) {
    env["DOUGH_DONE_RENAME_WAIT_MS"] = String(options.doneRenameWaitMs);
  }

  const state = (file: string) => path.join(stateDir, file);
  if (options.osascript === "failing" || options.osascript === "hang") {
    writeFileSync(state("osascript-mode"), options.osascript);
  }
  return { env, controls: fakeClaudeControls(stateDir, home) };
}
