import type { ReviewedWorkspace } from "../src/storyReviewWorkspace.ts";
import { gitExitedOne, runGit, type GitCall } from "./gitRunner.ts";
import type { PublishedStoryHistory } from "./publishedStoryHistory.ts";
import { recordedExecution } from "./storyPublishedEndpointDerived.ts";
import {
  publishedStoryEvidence,
  type ReviewedStory,
} from "./storyPublishedEvidence.ts";

// Recover the parent of the published Take on this branch's first-parent
// line. The current merge base may be a later trunk integration.
export async function storyReviewBranchStart({
  reviewed,
  story,
  head,
  trunk,
  evidence,
  history,
  call,
}: {
  readonly reviewed: ReviewedWorkspace;
  readonly story: ReviewedStory;
  readonly head: string;
  readonly trunk: string;
  readonly evidence: Awaited<ReturnType<typeof publishedStoryEvidence>>;
  readonly history: PublishedStoryHistory;
  readonly call: GitCall;
}): Promise<string | undefined> {
  const named =
    reviewed.mode === "story-branch" ? reviewed.publishedSha : undefined;
  const claim = named ?? evidence.claims[0];
  if (claim === undefined) return undefined;
  const claims =
    named !== undefined &&
    reviewed.agent !== undefined &&
    reviewed.agent !== evidence.agent
      ? await publishedStoryEvidence(story, trunk, history, reviewed.agent)
      : evidence;
  if (claims.agent === undefined || !claims.claims.includes(claim))
    return undefined;
  const recording = await recordedExecution(story, claim, claims.agent, call);
  call.signal?.throwIfAborted();
  if (
    recording?.mode !== "story-branch" ||
    recording.branch !== reviewed.branch
  )
    return undefined;
  const git = async (...args: string[]) =>
    (await runGit(args, call)).stdout.trim();
  const optional = async (...args: string[]) =>
    git(...args).catch((error: unknown) => {
      call.signal?.throwIfAborted();
      if (gitExitedOne(error)) return undefined;
      throw error;
    });
  const checkedOut = await optional(
    "symbolic-ref",
    "--quiet",
    "--short",
    "HEAD",
  );
  if (checkedOut !== reviewed.branch) return undefined;
  const start = await optional("rev-parse", "--verify", "--quiet", `${claim}^`);
  if (start === undefined) return undefined;
  const line = await git("rev-list", "--first-parent", head, `^${start}`);
  return line.split("\n").includes(claim) ? start : undefined;
}
