// Prepares one dashboard server's side of the local launch boundary: the
// synthetic `claude` (../fixtures/fake-claude) in its own PATH directory, a
// temporary HOME holding only the project folders a test chooses, and the
// controls a test uses to choose the fake's scenario and read back what it
// was asked. Nothing here starts a server (./dashboardServer.ts does), and no
// test ever reaches the real `claude`: every server puts this one first on
// PATH, or, to observe a missing `claude`, a PATH holding no `claude` at all.

import { mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { installFixtureExecutable } from "./fixtureExecutable.ts";

export type FakeClaudeScenario =
  "launched" | "refused" | "untrusted" | "hang" | "unlisted";

export type ClaudeCall = {
  readonly argv: readonly string[];
  readonly cwd: string;
};

export type FakeClaudeOptions = {
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
  claudeScenario(scenario: FakeClaudeScenario): void;
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
  const stateDir = path.join(tempRoot, "claude-state");
  const home = path.join(tempRoot, "home");
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
  return {
    env,
    controls: {
      home,
      claudeCalls() {
        return (readState(state("calls.jsonl")) ?? "")
          .split("\n")
          .filter((line) => line !== "")
          .map((line) => JSON.parse(line) as ClaudeCall);
      },
      claudeScenario(scenario) {
        writeFileSync(state("scenario"), scenario);
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
