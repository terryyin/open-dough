// Controls and observations for one synthetic Claude launch boundary.
// State files select external behavior; observations read what the fake did.
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { appendedRecords } from "./appendedRecords.ts";
import {
  fakeClaudeListing,
  type ClaudeListingControls,
} from "./fakeClaudeListing.ts";

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

// The part of its environment a `claude` call or attach recorded:
// `NODE_ENV`, `PATH`, every `npm_*` key, `INIT_CWD`, `FAKE_CLAUDE_DIR`, and
// the spec's pass-through marker `DOUGH_SPEC_PASSTHROUGH`, where set.
export type ClaudeEnvironment = Readonly<Record<string, string>>;

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
  // The recorded environment of each `claude --bg` launch, oldest first.
  claudeLaunchEnvironments(): ClaudeEnvironment[];
  // Whether the fake's `claude rm` fails, removing nothing.
  claudeRemovalFails(fails: boolean): void;
  claudeScenario(scenario: FakeClaudeScenario): void;
  // Lets a `held` launch go on and launch its session.
  releaseHeldClaude(): void;
  // Whether a session's typed `/rename` is left unapplied: the listing keeps
  // the session's name, as when Claude Code is busy.
  claudeRenamesIgnored(ignored: boolean): void;
  // Whether a `claude attach` prints nothing, as one that never opens.
  claudeAttachesSilent(silent: boolean): void;
  // Delay the composer after the attach banner; early keys are discarded.
  claudeAttachPromptDelay(ms: number): void;
  // The pid of a `hang` launch still holding its answer, and the signal that
  // ended it, once one did.
  heldClaudePid(): number | undefined;
  heldClaudeEndedBy(): string | undefined;
  // Every `claude attach` run so far, oldest first.
  claudeAttaches(): ClaudeAttach[];
  // The recorded environment of each `claude attach`, oldest first.
  claudeAttachEnvironments(): ClaudeEnvironment[];
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

function readState(file: string): string | undefined {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return undefined;
  }
}

export function fakeClaudeControls(
  stateDir: string,
  home: string,
): FakeClaudeControls {
  const state = (file: string) => path.join(stateDir, file);
  const jsonLines = <T>(file: string): T[] =>
    appendedRecords<T>(readState(state(file)) ?? "");
  type Recorded = { readonly env: ClaudeEnvironment };
  const recordedCalls = () => jsonLines<ClaudeCall & Recorded>("calls.jsonl");
  // Calls compare by argv and cwd alone; the environment has its own reader.
  const asCall = ({ argv, cwd }: ClaudeCall): ClaudeCall => ({ argv, cwd });
  const claudeCalls = () => recordedCalls().map(asCall);
  const recordedCallsOf = (command: string) =>
    recordedCalls().filter((call) => call.argv[0] === command);
  const callsOf = (command: string) => recordedCallsOf(command).map(asCall);
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
    ...fakeClaudeListing(stateDir, home),
    home,
    claudeCalls,
    claudeLaunchCalls: () => callsOf("--bg"),
    claudeStopCalls: () => callsOf("stop"),
    claudeRemovalCalls: () => callsOf("rm"),
    claudeLaunchEnvironments: () =>
      recordedCallsOf("--bg").map((call) => call.env),
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
    claudeAttachesSilent: flag("attaches-silent"),
    claudeAttachPromptDelay(ms) {
      writeFileSync(state("attach-prompt-delay-ms"), String(ms));
    },
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
    claudeAttachEnvironments: () =>
      jsonLines<Recorded>("attaches.jsonl").map((attach) => attach.env),
  };
}
