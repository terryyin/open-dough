// Prepares one dashboard server's side of the local launch boundary: the
// synthetic `claude` (../fixtures/fake-claude) in its own PATH directory, the
// synthetic `osascript` (../fixtures/fake-osascript) before it, a
// temporary HOME holding only the project folders a test chooses (inside a
// machine directory the test owns, if it passes one), and the controls a test
// uses to choose the fake's scenario and read back what it was asked. Nothing
// here starts a server (./dashboardServer.ts does), and no test ever reaches
// the real `claude` or `osascript`: every server puts these first on PATH, or,
// to observe a missing one, a PATH holding none, so no test raises a real
// notification.

import {
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { installFixtureExecutable } from "./fixtureExecutable.ts";

export type FakeClaudeScenario =
  "launched" | "refused" | "untrusted" | "hang" | "held" | "unlisted";

// What a listed session becomes, as the real `claude agents --json --all`
// lists it (Claude Code 2.1.284): working with its process busy (`working`)
// or idle between steps (`working-idle`); blocked, waiting on the developer
// (`blocked`, with what it waits for when a test gives it); done with its
// process still running idle (`done-live`) or exited (`done-exited`); failed
// or stopped with its process exited (`failed`, `stopped`); or no longer
// listed at all (`forgotten`); or in a state this dashboard does not know
// (`unrecognized`). Each replaces the session's `state`, `status`,
// and `waitingFor` whole.
export type ClaudeSessionChange =
  | "working"
  | "working-idle"
  | "blocked"
  | "done-live"
  | "done-exited"
  | "failed"
  | "stopped"
  | "forgotten"
  | "unrecognized";

const listedAs = {
  working: { state: "working", status: "busy" },
  "working-idle": { state: "working", status: "idle" },
  blocked: { state: "blocked", status: "waiting" },
  "done-live": { state: "done", status: "idle" },
  "done-exited": { state: "done" },
  failed: { state: "failed" },
  stopped: { state: "stopped" },
  unrecognized: { state: "napping" },
} as const;

const replacedFields = new Set(["state", "status", "waitingFor"]);

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

export type FakeClaudeControls = {
  // This server's HOME; project folders are under `<home>/git/`.
  readonly home: string;
  claudeCalls(): ClaudeCall[];
  // The `claude --bg` launches alone, without the session listings, attaches,
  // and stops the page also runs.
  claudeLaunchCalls(): ClaudeCall[];
  claudeScenario(scenario: FakeClaudeScenario): void;
  // Lets a `held` launch go on and launch its session.
  releaseHeldClaude(): void;
  // Changes how the fake lists the session with this id; only a blocked
  // one may say what it waits for.
  claudeSessionBecomes(
    sessionId: string,
    change: ClaudeSessionChange,
    waitingFor?: string,
  ): void;
  // Whether a session's typed `/rename` is left unapplied: the listing keeps
  // the session's name, as when Claude Code is busy.
  claudeRenamesIgnored(ignored: boolean): void;
  // Whether the fake's session listing fails, answering nothing.
  claudeListingFails(fails: boolean): void;
  // Lists an interactive session running in a terminal, as Claude Code
  // 2.1.285 does: with no short `id` and no `state`.
  claudeListsInteractiveSession(): void;
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
  // Every session the fake lists, as `claude agents --json --all` would.
  claudeListing(): Record<string, unknown>[];
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
  const claudeListing = () =>
    JSON.parse(readState(state("agents.json")) ?? "[]") as Record<
      string,
      unknown
    >[];
  return {
    env,
    controls: {
      home,
      claudeCalls,
      claudeLaunchCalls() {
        return claudeCalls().filter((call) => call.argv[0] === "--bg");
      },
      claudeScenario(scenario) {
        writeFileSync(state("scenario"), scenario);
      },
      releaseHeldClaude() {
        writeFileSync(state("release"), "");
      },
      claudeListing,
      claudeSessionBecomes(sessionId, change, waitingFor) {
        if (waitingFor !== undefined && change !== "blocked") {
          throw new Error(`A ${change} session waits for nothing.`);
        }
        const listed = claudeListing();
        if (!listed.some((session) => session.sessionId === sessionId)) {
          throw new Error(`The fake claude lists no session ${sessionId}.`);
        }
        const changed = listed.flatMap((session): object[] => {
          if (session.sessionId !== sessionId) return [session];
          if (change === "forgotten") return [];
          const kept = Object.entries(session).filter(
            ([key]) => !replacedFields.has(key),
          );
          return [
            {
              ...Object.fromEntries(kept),
              ...listedAs[change],
              ...(waitingFor === undefined ? {} : { waitingFor }),
            },
          ];
        });
        // Replaced whole, so the fake never lists a half-written file.
        writeFileSync(state("agents.json.next"), JSON.stringify(changed));
        renameSync(state("agents.json.next"), state("agents.json"));
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
      heldOsascriptPid() {
        const pid = readState(state("osascript.pid"));
        return pid === undefined ? undefined : Number(pid);
      },
      heldOsascriptEndedBy() {
        return readState(state("osascript.pid.exited"));
      },
      claudeListingFails(fails) {
        if (fails) writeFileSync(state("listing-fails"), "");
        else rmSync(state("listing-fails"), { force: true });
      },
      claudeListsInteractiveSession() {
        const interactive = {
          pid: 3394,
          cwd: home,
          kind: "interactive",
          startedAt: Date.now(),
          sessionId: "3ab4613a-744d-4545-adba-15346379854a",
          name: "terminal session",
          status: "busy",
        };
        writeFileSync(
          state("agents.json.next"),
          JSON.stringify([...claudeListing(), interactive]),
        );
        renameSync(state("agents.json.next"), state("agents.json"));
      },
      claudeRenamesIgnored(ignored) {
        if (ignored) writeFileSync(state("renames-ignored"), "");
        else rmSync(state("renames-ignored"), { force: true });
      },
      heldClaudePid() {
        const pid = readState(state("pid"));
        return pid === undefined ? undefined : Number(pid);
      },
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
