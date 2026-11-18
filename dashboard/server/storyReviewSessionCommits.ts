// A Default main session's kept commits (`../src/sessionCommits.ts`) answer
// as a landing's pair does: from the saved repository's objects alone.
import type { LaunchRecord } from "../src/launchRecord.ts";
import {
  sessionCommitsAtDone,
  type SessionCommitRun,
  type SessionRunChoice,
} from "../src/sessionCommits.ts";
import type { StoryReview } from "../src/storyReviewContract.ts";
import { runGit } from "./gitRunner.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { retainedCommitPairFiles } from "./retainedReviewPair.ts";

// One kept run of a done session: its pair, where it is kept, and the
// session's launch and Done times.
export interface KeptSessionRun {
  readonly repository: string;
  readonly base: string;
  readonly revision: string;
  // The record's kept runs, oldest first, and this run's position among them.
  readonly runs: readonly SessionCommitRun[];
  readonly position: number;
  readonly launchedAt: string;
  readonly doneAt: string;
  // Whether another session was open in the same checkout meanwhile.
  readonly shared: boolean;
}

// A landing answers in place of the current Done's session commits.
function reviewableCapture(record: LaunchRecord) {
  return record.landing === undefined
    ? sessionCommitsAtDone(record)
    : undefined;
}

// Whether a done session's capture found that it made no commit.
export function keptNoSessionCommits(record: LaunchRecord): boolean {
  return reviewableCapture(record)?.runs.length === 0;
}

// The kept run a done session's review answers: the one at the `named`
// position, or the oldest; undefined when the record keeps none.
export function keptSessionRun(
  record: LaunchRecord,
  named: string | null = null,
): KeptSessionRun | undefined {
  const { launchedAt, doneAt } = record;
  const capture = reviewableCapture(record);
  if (named !== null && !/^\d+$/.test(named))
    throw new RefusedRequest(400, "The review run is malformed.");
  if (capture === undefined || doneAt === undefined) return undefined;
  const { runs, repository } = capture;
  const position = Number(named ?? 0);
  const run = runs[position];
  if (run === undefined) {
    if (named === null) return undefined;
    throw new RefusedRequest(404, "This session kept no run at that position.");
  }
  const shared = capture.shared === true;
  return { repository, ...run, runs, position, launchedAt, doneAt, shared };
}

// The kept pair of `record` a file read names by its two commits, with where
// it is kept, or undefined when the record keeps no such pair.
export function keptSessionPair(
  record: LaunchRecord,
  { baseline, tree }: { readonly baseline: string; readonly tree: string },
) {
  const capture = reviewableCapture(record);
  if (capture === undefined) return undefined;
  const run = capture.runs.find(
    ({ base, revision }) => base === baseline && revision === tree,
  );
  return run === undefined
    ? undefined
    : { repository: capture.repository, ...run };
}

// How a review offers one kept run, read from the saved repository.
async function runChoice(
  repository: string,
  { base, revision }: SessionCommitRun,
  signal: AbortSignal,
): Promise<SessionRunChoice> {
  const read = async (args: readonly string[]) =>
    (
      await runGit(args, { cwd: repository, signal, maxBuffer: 1024 * 1024 })
    ).stdout.trim();
  const commits = await read(["rev-list", "--count", `${base}..${revision}`]);
  const last = await read(["log", "-1", "--format=%ct%x00%s", revision]);
  const [committed = "", subject = ""] = last.split("\0");
  return {
    commits: Number(commits),
    subject,
    committedAt: new Date(Number(committed) * 1000).toISOString(),
    baseline: base,
    tree: revision,
  };
}

export function unavailableSessionCommitsReview(
  explanation: string,
): StoryReview {
  return {
    kind: "landing-unavailable",
    comparison: "session-commits",
    explanation,
  };
}

export async function sessionCommitsReview(
  { launchedAt, doneAt, shared, runs, position, ...pair }: KeptSessionRun,
  signal: AbortSignal,
): Promise<StoryReview> {
  const read = await retainedCommitPairFiles(pair, signal);
  if ("missing" in read)
    return unavailableSessionCommitsReview(
      {
        repository:
          "The repository that kept this session's commits is missing or unreadable.",
        objects: "This session's kept commits are missing or unreadable.",
        changes: "This session's kept changes could not be read.",
      }[read.missing],
    );
  return {
    kind: "session-commits",
    session: { launchedAt, doneAt, ...(shared && { shared }) },
    commitRuns: await Promise.all(
      runs.map((run) => runChoice(pair.repository, run, signal)),
    ),
    commitRun: position,
    baseline: pair.base,
    tree: pair.revision,
    files: read.files,
  };
}
