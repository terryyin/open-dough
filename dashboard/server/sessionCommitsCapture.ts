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
import { checkAncestry, defaultGitOutputLimit, runGit } from "./gitRunner.ts";

const gitCall = (cwd: string) => ({
  cwd,
  maxBuffer: 16 * defaultGitOutputLimit,
  signal: AbortSignal.timeout(30_000),
});
const git = async (cwd: string, args: readonly string[]) =>
  (await runGit(args, gitCall(cwd))).stdout.trim();

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
  readonly parents: readonly string[];
  readonly at: number;
  readonly action: string;
  readonly authoredAt: number;
  readonly subject: string;
}

const committing =
  /^(?:commit(?: \((?:amend|cherry-pick)\))?|cherry-pick|revert): /;
const replaying =
  /^(?:rebase|pull)\b[^:]* \((?:pick|continue|fixup|squash)\): /;
const moving =
  /^(?:checkout: moving from |reset: moving to |(?:merge|pull)\b[^:]*: Fast-forward\b|(?:rebase|pull)\b[^:]* \((?:start|finish|abort)\): )/;

// The checkout's `HEAD` log, newest first: each entry's commit and parents,
// its time, the action that wrote it, and the commit's author time and subject.
async function headLog(
  checkout: string,
  ref: string,
): Promise<readonly LogEntry[]> {
  const read = await git(checkout, [
    "log",
    "-g",
    "--date=unix",
    "--format=%H%x00%P%x00%gd%x00%gs%x00%at%x00%s",
    ref,
  ]);
  if (read === "") return [];
  return read.split("\n").map((line) => {
    const [commit, parents, selector, action, authorTime, subject] =
      line.split("\0");
    const at = Number(/@\{(\d+)\}$/.exec(selector ?? "")?.[1]);
    const authoredAt = Number(authorTime);
    if (
      commit === undefined ||
      parents === undefined ||
      action === undefined ||
      subject === undefined ||
      !Number.isFinite(at) ||
      !Number.isFinite(authoredAt)
    )
      throw new Error("The checkout's log has an unreadable entry.");
    return {
      commit,
      parents: parents === "" ? [] : parents.split(" "),
      at,
      action,
      authoredAt,
      subject,
    };
  });
}

// Place each entry as work made here, movement or a merge, or a replay of
// older work. The log can settle an empty result only if every entry fits.
function madeSince(log: readonly LogEntry[], since: number): string[] {
  const made = new Set<string>();
  const fingerprints = new Set<string>();
  for (const entry of log.filter(({ at }) => at >= since).reverse()) {
    const { action, parents, commit, authoredAt, subject } = entry;
    if (parents.length > 1 || moving.test(action)) continue;
    const fingerprint = `${String(authoredAt)} ${subject}`;
    if (parents.length === 1 && committing.test(action)) {
      fingerprints.add(fingerprint);
      made.add(commit);
      continue;
    }
    if (parents.length === 1 && replaying.test(action)) {
      if (fingerprints.has(fingerprint)) {
        made.add(commit);
        continue;
      }
      if (authoredAt < since) continue;
    }
    throw new Error("The checkout's log has a commit that cannot be placed.");
  }
  return [...made];
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

// Settle the Default main tip before reading the reflog. Use the tip saved at
// branch entry when available. Otherwise a commit made while the log waits can
// enter a later Done's comparison, after a new tip is settled.
export async function readSessionCommits(
  record: Pick<LaunchRecord, "launchedAt" | "defaultStart" | "branchEntry">,
  start: { readonly workspace: string },
): Promise<SessionCommits> {
  const checkout = resolvedCheckout(start.workspace);
  const entry = record.branchEntry;
  const startRef = record.defaultStart?.branch;
  const branchEntryMissing =
    entry === undefined &&
    startRef !== undefined &&
    (await git(checkout, ["symbolic-ref", "HEAD"]).catch(() => undefined)) !==
      startRef;
  const originalRef =
    entry !== undefined || branchEntryMissing ? startRef : "HEAD";
  if (originalRef === undefined)
    throw new Error("The Default main branch was not recorded.");
  const head =
    entry === undefined
      ? await git(checkout, ["rev-parse", "--verify", originalRef])
      : entry.defaultTip;
  if (head === undefined)
    throw new Error("There is no saved Default main tip at branch entry.");
  const capture = await readSessionCommitsAt({
    checkout,
    originalRef,
    head,
    launchedAt: record.launchedAt,
  });
  return branchEntryMissing
    ? { ...capture, branchEntryMissing: true }
    : capture;
}

// The reflog may already include later work. Keep commits reachable from the
// tip resolved for this capture.
export async function readSessionCommitsAt({
  checkout,
  originalRef,
  head,
  launchedAt,
}: {
  readonly checkout: string;
  readonly originalRef: string;
  readonly head: string;
  readonly launchedAt: string;
}): Promise<SessionCommits> {
  const since = Date.parse(launchedAt) / 1000;
  const log = await headLog(checkout, originalRef);
  // A log without any entry says nothing of what was made there.
  if (log[0]?.commit === undefined)
    throw new Error("The checkout's log has no entries.");
  const candidates = madeSince(log, since);
  const made: string[] = [];
  for (const commit of candidates)
    if (await checkAncestry(commit, head, gitCall(checkout))) made.push(commit);
  if (candidates.length > 0 && made.length === 0)
    throw new Error("None of the session's commits is in the checkout's HEAD.");
  const repository = await git(checkout, [
    "rev-parse",
    "--path-format=absolute",
    "--git-common-dir",
  ]);
  const runs = await runsOf(checkout, made);
  return {
    repository,
    runs,
    readAt: new Date().toISOString(),
  };
}
