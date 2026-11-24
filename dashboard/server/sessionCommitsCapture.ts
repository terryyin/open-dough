// Reads the commits an execution checkout session made in its checkout
// (`../src/sessionCommits.ts`) from the checkout's `HEAD` log and keeps each
// run's pair by references in the common repository. The log's entries say
// what made a commit there; pulls, fast-forwards and merges made none.

import { realpathSync } from "node:fs";
import path from "node:path";
import type { LaunchRecord } from "../src/agentLaunch.ts";
import type { SessionCommits } from "../src/sessionCommits.ts";
import { checkAncestry, defaultGitOutputLimit, runGit } from "./gitRunner.ts";
import {
  type LogEntry,
  type MadeCommit,
  madeSince,
  runsOf,
} from "./sessionCommitAttribution.ts";

const gitCall = (cwd: string) => ({
  cwd,
  maxBuffer: 16 * defaultGitOutputLimit,
  signal: AbortSignal.timeout(30_000),
});
const git = async (cwd: string, args: readonly string[]) =>
  (await runGit(args, gitCall(cwd))).stdout.trim();

// The Execution checkout a session started in: a default launch's kept
// start, or the start of a session established in the execution checkout.
export function recordedExecutionCheckoutStart(
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

// Settle the execution checkout tip before reading the reflog. Use the tip saved at
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
    throw new Error("The execution checkout branch was not recorded.");
  const head =
    entry === undefined
      ? await git(checkout, ["rev-parse", "--verify", originalRef])
      : entry.defaultTip;
  if (head === undefined)
    throw new Error(
      "There is no saved execution checkout tip at branch entry.",
    );
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
  const made: MadeCommit[] = [];
  for (const candidate of candidates)
    if (await checkAncestry(candidate.commit, head, gitCall(checkout)))
      made.push(candidate);
  if (candidates.length > 0 && made.length === 0)
    throw new Error("None of the session's commits is in the checkout's HEAD.");
  const repository = await git(checkout, [
    "rev-parse",
    "--path-format=absolute",
    "--git-common-dir",
  ]);
  const runs = runsOf(made);
  return {
    repository,
    runs,
    readAt: new Date().toISOString(),
  };
}
