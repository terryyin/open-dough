// Takes a story review's snapshot (`../src/storyReview.ts`) of one launch
// workspace the launch boundary resolved from its kept records: fetches the
// record's trunk target, takes the review baseline as the merge-base of the
// workspace's head and the fetched `<remote>/<target>`, writes the
// workspace's files -- commits, staged, unstaged, and untracked, never
// ignored -- into a tree object through a temporary index, and lists what
// changed from the baseline to that tree. The workspace's own index and
// status stay as they were; the tree is an ordinary unreachable object of
// its repository. A step Git cannot take answers why, never a partial list.

import { mkdtemp, rm } from "node:fs/promises";
import type { ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import type { EstablishedContext } from "../src/launchRecord.ts";
import type { ReviewedFile, StoryReview } from "../src/storyReview.ts";
import type { AgentLaunchAnswer } from "./agentLaunchResponse.ts";
import { GitFailure, runGit } from "./gitRunner.ts";
import { withResponseSignal } from "./responseSignal.ts";
import type { AdmittedReview } from "./storyReviewAdmission.ts";

const outputLimit = 64 * 1024 * 1024;

// How long a story review's snapshot, trunk's fetch included, may take.
const reviewWaitMs = 60_000;

// The changed files `git diff --name-status -M -z` printed: a status field,
// then the path, or for a rename the old path and then the new one.
function reviewedFiles(nameStatus: string): ReviewedFile[] {
  const fields = nameStatus.split("\0");
  const files: ReviewedFile[] = [];
  let index = 0;
  while (index + 1 < fields.length) {
    const status = fields[index] ?? "";
    const first = fields[index + 1] ?? "";
    if (status.startsWith("R")) {
      files.push({
        kind: "renamed",
        oldPath: first,
        path: fields[index + 2] ?? "",
      });
      index += 3;
      continue;
    }
    files.push({
      kind: status === "A" ? "added" : status === "D" ? "deleted" : "modified",
      path: first,
    });
    index += 2;
  }
  return files;
}

// The last line Git printed about a failure, or its own message.
function gitProblem(error: unknown): string {
  const said =
    error instanceof GitFailure
      ? error.stderr.trim().split("\n").at(-1)
      : undefined;
  return said !== undefined && said !== ""
    ? said
    : error instanceof Error
      ? error.message
      : String(error);
}

// The admitted review's snapshot, abandoned when the caller leaves or its
// bounded wait expires.
export async function storyReviewResponse(
  { established, shown }: AdmittedReview,
  res: ServerResponse,
): Promise<AgentLaunchAnswer> {
  return {
    status: 200,
    body: await withResponseSignal(
      res,
      (signal) => storyReviewSnapshot(established, shown, signal),
      reviewWaitMs,
    ),
  };
}

async function storyReviewSnapshot(
  established: EstablishedContext,
  // The workspace as the page shows it.
  shown: string,
  signal: AbortSignal,
): Promise<StoryReview> {
  const { workspace, branch, remote, target } = established;
  // What Git printed, as printed.
  const printed = async (
    args: readonly string[],
    env?: Readonly<Record<string, string>>,
  ) =>
    (
      await runGit(args, {
        cwd: workspace,
        signal,
        maxBuffer: outputLimit,
        ...(env === undefined ? {} : { env }),
      })
    ).stdout;
  const git = async (
    args: readonly string[],
    env?: Readonly<Record<string, string>>,
  ) => (await printed(args, env)).trim();
  const unavailable = (explanation: string): StoryReview => ({
    kind: "unavailable",
    workspace: shown,
    explanation,
  });
  try {
    await git(["fetch", "--quiet", remote, target], {
      GIT_TERMINAL_PROMPT: "0",
    });
  } catch (error) {
    return unavailable(
      `${remote}/${target} could not be fetched: ${gitProblem(error)}`,
    );
  }
  const index = await mkdtemp(path.join(tmpdir(), "dough-review-"));
  try {
    const head = await git(["rev-parse", "--verify", "HEAD"]);
    const baseline = await git(["merge-base", "HEAD", `${remote}/${target}`]);
    const temporaryIndex = { GIT_INDEX_FILE: path.join(index, "index") };
    await git(["read-tree", "HEAD"], temporaryIndex);
    await git(["add", "--all"], temporaryIndex);
    const tree = await git(["write-tree"], temporaryIndex);
    const files = reviewedFiles(
      await printed([
        "diff",
        "--name-status",
        "-M",
        "-z",
        baseline,
        tree,
        "--",
      ]),
    );
    return {
      kind: "snapshot",
      workspace: shown,
      branch,
      remote,
      target,
      baseline,
      head,
      tree,
      files,
    };
  } catch (error) {
    return unavailable(
      `The workspace's changes could not be read: ${gitProblem(error)}`,
    );
  } finally {
    await rm(index, { recursive: true, force: true });
  }
}
