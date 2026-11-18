// Reads the commits a Default main session made in its checkout
// (`../src/sessionCommits.ts`) from the checkout's `HEAD` log and keeps each
// run's pair by references in the common repository. The log's entries say
// what made a commit there; pulls, fast-forwards and merges made none.

import { realpathSync } from "node:fs";
import path from "node:path";
import type { LaunchRecord } from "../src/agentLaunch.ts";
import type {
  SessionCommitRun,
  SessionCommits,
} from "../src/sessionCommits.ts";
import { defaultGitOutputLimit, runGit } from "./gitRunner.ts";
import { pinPair, removePins } from "./launchLandingGit.ts";
import { sessionCommitsRefPrefix } from "./launchRecordPins.ts";

const git = async (cwd: string, args: readonly string[]) =>
  (
    await runGit(args, {
      cwd,
      maxBuffer: 16 * defaultGitOutputLimit,
      signal: AbortSignal.timeout(30_000),
    })
  ).stdout.trim();

// The Default main checkout a session started in: a default launch's kept
// start, or the start of a session established in the default checkout.
export function defaultMainStart(
  record: Pick<LaunchRecord, "defaultStart" | "establishedSession">,
): { readonly workspace: string } | undefined {
  if (record.defaultStart !== undefined) return record.defaultStart;
  return record.establishedSession?.role === "default-checkout"
    ? record.establishedSession
    : undefined;
}

// The checkout a folder path names, resolved. Throws when it is gone.
export const resolvedCheckout = (workspace: string) =>
  realpathSync(path.resolve(workspace));

interface LogEntry {
  readonly commit: string;
  readonly at: number;
  readonly action: string;
  readonly made: string;
}

const committing =
  /^(?:commit(?: \((?:amend|initial)\))?|cherry-pick|revert): /;
const replaying = /\((?:pick|continue)\): /;

// The checkout's `HEAD` log, newest first: each entry's commit, its time, the
// action that wrote it, and the commit's author time and subject.
async function headLog(checkout: string): Promise<readonly LogEntry[]> {
  const read = await git(checkout, [
    "log",
    "-g",
    "--date=unix",
    "--format=%H%x00%gd%x00%gs%x00%at %s",
    "HEAD",
  ]);
  return read.split("\n").flatMap((line) => {
    const [commit, selector, action, made] = line.split("\0");
    const at = Number(/@\{(\d+)\}$/.exec(selector ?? "")?.[1]);
    return commit === undefined ||
      action === undefined ||
      made === undefined ||
      !Number.isFinite(at)
      ? []
      : [{ commit, at, action, made }];
  });
}

// The commits the log says were made in the checkout at or after `since`,
// oldest first, each once: a commit, or a replay of one made there.
function madeSince(log: readonly LogEntry[], since: number): string[] {
  const entries = log.filter(({ at }) => at >= since).reverse();
  const made = new Set(
    entries.filter(({ action }) => committing.test(action)).map((e) => e.made),
  );
  return [
    ...new Set(
      entries
        .filter(
          ({ action, made: replayed }) =>
            committing.test(action) ||
            (replaying.test(action) && made.has(replayed)),
        )
        .map(({ commit }) => commit),
    ),
  ];
}

async function ancestorOfHead(checkout: string, commit: string) {
  try {
    await git(checkout, ["merge-base", "--is-ancestor", commit, "HEAD"]);
    return true;
  } catch {
    return false;
  }
}

// A run grows while a session commit's first parent is the previous session
// commit; its pair is the first commit's first parent and its last commit.
async function runsOf(
  checkout: string,
  commits: readonly string[],
): Promise<SessionCommitRun[]> {
  const runs: SessionCommitRun[] = [];
  for (const commit of commits) {
    const parent = await git(checkout, ["rev-parse", `${commit}^1`]);
    const last = runs.at(-1);
    if (last !== undefined && last.revision === parent)
      runs[runs.length - 1] = { base: last.base, revision: commit };
    else runs.push({ base: parent, revision: commit });
  }
  return runs;
}

// Read the commits made in the session's Default main checkout since launch.
// Throws when the checkout's log cannot be read or holds no entry.
export async function readSessionCommits(
  record: Pick<LaunchRecord, "launchedAt">,
  start: { readonly workspace: string },
): Promise<SessionCommits> {
  const checkout = resolvedCheckout(start.workspace);
  // The log keeps whole seconds; an entry in the launch's own second is not
  // the session's.
  const since = Date.parse(record.launchedAt) / 1000;
  const log = await headLog(checkout);
  // A log without any entry says nothing of what was made there.
  if (log.length === 0) throw new Error("The checkout's log has no entries.");
  const made: string[] = [];
  for (const commit of madeSince(log, since))
    if (await ancestorOfHead(checkout, commit)) made.push(commit);
  const repository = await git(checkout, [
    "rev-parse",
    "--path-format=absolute",
    "--git-common-dir",
  ]);
  const runs = await runsOf(checkout, made);
  return { repository, runs, readAt: new Date().toISOString() };
}

// Hold the read's pairs in place of any pairs pinned for an earlier Done.
export async function keepSessionCommitRefs(
  session: LaunchRecord["session"],
  { repository, runs }: SessionCommits,
): Promise<void> {
  const prefix = sessionCommitsRefPrefix(session);
  await removePins(repository, prefix);
  for (const [index, run] of runs.entries())
    await pinPair(repository, `${prefix}${String(index)}/`, run);
}
