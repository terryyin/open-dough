// Prepares one dashboard server's side of the local launch boundary: the
// synthetic `claude` (../fixtures/fake-claude) in its own PATH directory, a
// temporary HOME holding only the project folders a test chooses (inside a
// machine directory the test owns, if it passes one), and the controls a test
// uses to choose the fake's scenario and read back what it was asked. Nothing
// here starts a server (./dashboardServer.ts does), and no test ever reaches
// the real `claude`: every server puts this one first on PATH, or, to observe
// a missing `claude`, a PATH holding no `claude` at all.

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
  "launched" | "refused" | "untrusted" | "hang" | "unlisted";

// What a listed session becomes, as the real `claude agents --json --all`
// lists it: running and busy (`working`) or idle (`idle`); exited once done
// (`finished`) or stopped (`stopped`), with no `status`; or no longer listed
// at all (`forgotten`).
export type ClaudeSessionChange =
  "working" | "idle" | "finished" | "stopped" | "forgotten";

const listedAs = {
  working: { status: "busy", state: "working" },
  idle: { status: "idle", state: "done" },
  finished: { state: "done" },
  stopped: { state: "stopped" },
} as const;

export type ClaudeCall = {
  readonly argv: readonly string[];
  readonly cwd: string;
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
  // The server's own launch wait when unset.
  readonly launchTimeoutMs?: number | undefined;
};

export type FakeClaudeControls = {
  // This server's HOME; project folders are under `<home>/git/`.
  readonly home: string;
  claudeCalls(): ClaudeCall[];
  // The calls other than Claude Code's session listing, which a launch's
  // confirmation and every read of kept launch records also ask.
  claudeLaunchCalls(): ClaudeCall[];
  claudeScenario(scenario: FakeClaudeScenario): void;
  // Changes how the fake lists the session with this id.
  claudeSessionBecomes(sessionId: string, change: ClaudeSessionChange): void;
  // Whether the fake's session listing fails, answering nothing.
  claudeListingFails(fails: boolean): void;
  // The pid of a `hang` launch still holding its answer, and the signal that
  // ended it, once one did.
  heldClaudePid(): number | undefined;
  heldClaudeEndedBy(): string | undefined;
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
  const machine = options.machine ?? tempRoot;
  const stateDir = path.join(machine, "claude-state");
  const home = path.join(machine, "home");
  installFixtureExecutable("fake-claude", binDir, "claude");
  mkdirSync(stateDir, { recursive: true });
  for (const folder of ["", ...(options.projectFolders ?? [])]) {
    mkdirSync(path.join(home, "git", folder), { recursive: true });
  }

  const env: Record<string, string> = {
    // The real `claude` is never reached: the fake one comes first, or no
    // `claude` is on PATH at all.
    PATH:
      options.claude === "absent"
        ? [gh.binDir, nodeOnlyBinDir(tempRoot)].join(path.delimiter)
        : `${binDir}${path.delimiter}${gh.path}`,
    HOME: home,
    FAKE_CLAUDE_DIR: stateDir,
  };
  if (options.launchTimeoutMs !== undefined) {
    env["DOUGH_LAUNCH_TIMEOUT_MS"] = String(options.launchTimeoutMs);
  }

  const state = (file: string) => path.join(stateDir, file);
  const claudeCalls = () =>
    (readState(state("calls.jsonl")) ?? "")
      .split("\n")
      .filter((line) => line !== "")
      .map((line) => JSON.parse(line) as ClaudeCall);
  return {
    env,
    controls: {
      home,
      claudeCalls,
      claudeLaunchCalls() {
        return claudeCalls().filter((call) => call.argv[0] !== "agents");
      },
      claudeScenario(scenario) {
        writeFileSync(state("scenario"), scenario);
      },
      claudeSessionBecomes(sessionId, change) {
        const listed = JSON.parse(
          readState(state("agents.json")) ?? "[]",
        ) as Record<string, unknown>[];
        if (!listed.some((session) => session.sessionId === sessionId)) {
          throw new Error(`The fake claude lists no session ${sessionId}.`);
        }
        const changed = listed.flatMap((session): object[] => {
          if (session.sessionId !== sessionId) return [session];
          if (change === "forgotten") return [];
          const kept = Object.entries(session).filter(
            ([key]) => key !== "status" && key !== "state",
          );
          return [{ ...Object.fromEntries(kept), ...listedAs[change] }];
        });
        // Replaced whole, so the fake never lists a half-written file.
        writeFileSync(state("agents.json.next"), JSON.stringify(changed));
        renameSync(state("agents.json.next"), state("agents.json"));
      },
      claudeListingFails(fails) {
        if (fails) writeFileSync(state("listing-fails"), "");
        else rmSync(state("listing-fails"), { force: true });
      },
      heldClaudePid() {
        const pid = readState(state("pid"));
        return pid === undefined ? undefined : Number(pid);
      },
      heldClaudeEndedBy() {
        return readState(state("pid.exited"));
      },
    },
  };
}
