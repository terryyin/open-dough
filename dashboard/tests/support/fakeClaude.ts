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

import {
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { installFixtureExecutable } from "./fixtureExecutable.ts";
import {
  fakeClaudeListing,
  type ClaudeListingControls,
} from "./fakeClaudeListing.ts";

export type { ClaudeSessionChange } from "./fakeClaudeListing.ts";

export type FakeClaudeScenario =
  | "launched"
  | "refused"
  | "untrusted"
  | "hang"
  | "held"
  | "unlisted"
  | "launched-hang";

export type ClaudeCall = {
  readonly argv: readonly string[];
  readonly cwd: string;
};

export type OsascriptCall = { readonly argv: readonly string[] };

// One `claude attach` the fake ran: its pid, the short id it attached to,
// each line entered in it, and the signal, or `Ctrl+Z`, that ended it, once
// one did.
export type ClaudeAttach = {
  readonly pid: number;
  readonly id: string;
  readonly lines: readonly string[];
  readonly endedBy: string | undefined;
};

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

export type FakeClaudeControls = ClaudeListingControls & {
  // This server's HOME; project folders are under `<home>/git/`.
  readonly home: string;
  claudeCalls(): ClaudeCall[];
  // The `claude --bg` launches alone, without the session listings, attaches,
  // stops, and removals the page also runs.
  claudeLaunchCalls(): ClaudeCall[];
  // The native `claude stop` calls alone, oldest first, whatever asked for them.
  claudeStopCalls(): ClaudeCall[];
  // The native `claude rm` calls alone, oldest first.
  claudeRemovalCalls(): ClaudeCall[];
  // Whether the fake's `claude rm` fails, removing nothing.
  claudeRemovalFails(fails: boolean): void;
  claudeScenario(scenario: FakeClaudeScenario): void;
  // Lets a `held` launch go on and launch its session.
  releaseHeldClaude(): void;
  // Whether a session's typed `/rename` is left unapplied: the listing keeps
  // the session's name, as when Claude Code is busy.
  claudeRenamesIgnored(ignored: boolean): void;
  // The pid of a `hang` launch still holding its answer, and the signal that
  // ended it, once one did.
  heldClaudePid(): number | undefined;
  heldClaudeEndedBy(): string | undefined;
  // Every `claude attach` run so far, oldest first.
  claudeAttaches(): ClaudeAttach[];
  // Every `osascript` the fake ran so far, oldest first.
  osascriptCalls(): OsascriptCall[];
  // Every start probe the server ran, apart from those calls.
  osascriptProbes(): OsascriptCall[];
  // Changes how the fake `osascript` answers from now on.
  osascriptBecomes(mode: "working" | "failing" | "hang"): void;
  // The pid of a `hang` notification still open, and the signal that ended
  // it, once one did.
  heldOsascriptPid(): number | undefined;
  heldOsascriptEndedBy(): string | undefined;
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

function readState(file: string): string | undefined {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return undefined;
  }
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
  installFixtureExecutable("fake-claude-attach.cjs", binDir, "attach.cjs");
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
  const jsonLines = <T>(file: string): T[] =>
    (readState(state(file)) ?? "")
      .split("\n")
      .filter((line) => line !== "")
      .map((line) => JSON.parse(line) as T);
  const claudeCalls = () => jsonLines<ClaudeCall>("calls.jsonl");
  const callsOf = (command: string) =>
    claudeCalls().filter((call) => call.argv[0] === command);
  // Sets a control file whose presence alone changes how the fake answers.
  const flag = (file: string) => (on: boolean) => {
    if (on) writeFileSync(state(file), "");
    else rmSync(state(file), { force: true });
  };
  const pidIn = (file: string) => {
    const pid = readState(state(file));
    return pid === undefined ? undefined : Number(pid);
  };
  return {
    env,
    controls: {
      ...fakeClaudeListing(stateDir, home),
      home,
      claudeCalls,
      claudeLaunchCalls: () => callsOf("--bg"),
      claudeStopCalls: () => callsOf("stop"),
      claudeRemovalCalls: () => callsOf("rm"),
      claudeRemovalFails: flag("removal-fails"),
      claudeScenario(scenario) {
        writeFileSync(state("scenario"), scenario);
      },
      releaseHeldClaude() {
        writeFileSync(state("release"), "");
      },
      osascriptCalls() {
        return jsonLines<OsascriptCall>("osascript-calls.jsonl");
      },
      osascriptProbes() {
        return jsonLines<OsascriptCall>("osascript-probes.jsonl");
      },
      osascriptBecomes(mode) {
        writeFileSync(state("osascript-mode"), mode);
      },
      heldOsascriptPid: () => pidIn("osascript.pid"),
      heldOsascriptEndedBy() {
        return readState(state("osascript.pid.exited"));
      },
      claudeRenamesIgnored: flag("renames-ignored"),
      heldClaudePid: () => pidIn("pid"),
      heldClaudeEndedBy() {
        return readState(state("pid.exited"));
      },
      claudeAttaches() {
        return jsonLines<{ pid: number; id: string }>("attaches.jsonl").map(
          ({ pid, id }) => ({
            pid,
            id,
            lines: jsonLines<string>(`attach.${String(pid)}.lines`),
            endedBy: readState(state(`attach.${String(pid)}.ended`)),
          }),
        );
      },
    },
  };
}
