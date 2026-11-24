import { realpath } from "node:fs/promises";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  objectIdSchema,
  type StoryReview,
} from "../src/storyReviewContract.ts";
import { executionCheckout } from "./executionCheckout.ts";
import { gitProblem, runGit } from "./gitRunner.ts";
import { publishedStoryHistory } from "./publishedStoryHistory.ts";
import { agentProfileDirectoryOf } from "./recordsBesideBacklog.ts";
import { publishedStoryEvidence } from "./storyPublishedEvidence.ts";
import { publishedStoryComparison } from "./storyReviewPublished.ts";
import {
  publishedTakenBranchTip,
  takenStoryClaim,
} from "./takenStoryEndpoints.ts";

type PublishedTakenReview = Extract<
  StoryReview,
  { kind: "published-taken" | "unavailable" }
>;

const unavailable = (explanation: string): PublishedTakenReview => ({
  kind: "unavailable",
  explanation,
});

// A named head is usable only while the recorded branch still contains it.
// Git may already hold the object locally, which does not establish publication.
export async function publishedTakenReview(
  source: PublishedSource,
  identity: string,
  signal: AbortSignal,
  namedHead?: string,
): Promise<PublishedTakenReview | undefined> {
  try {
    const directory = executionCheckout(source).path;
    const call = { cwd: directory, signal, maxBuffer: 64 * 1024 * 1024 };
    const git = async (...args: string[]) =>
      (await runGit(args, call)).stdout.trim();
    if (
      (await realpath(await git("rev-parse", "--show-toplevel"))) !==
      (await realpath(directory))
    )
      return unavailable(
        "The execution checkout no longer points to this project's Git root.",
      );
    const taken = await takenStoryClaim(source, identity, call);
    if (taken.kind === "absent") return undefined;
    if (taken.kind === "unavailable") return taken;
    const { mode, branch, trunk, claim, storyStart, agent } = taken.facts;
    if (mode !== "story-branch") return undefined;
    if (branch === undefined)
      return unavailable("The Taken story does not record a published branch.");
    const tip = await publishedTakenBranchTip(branch, call);
    if (tip === undefined)
      return unavailable(
        `The recorded story branch ${branch} is not published on origin.`,
      );

    const history = publishedStoryHistory(call);
    if (namedHead !== undefined) {
      if (!objectIdSchema.safeParse(namedHead).success)
        return unavailable(
          "The published comparison names an invalid revision.",
        );
      if (!(await history.isAncestor(namedHead, tip)))
        return unavailable(
          "The named comparison is not contained in the published story branch.",
        );
    }
    const head = namedHead ?? tip;
    if (!(await history.isAncestor(claim, head)))
      return unavailable(
        "The published story branch does not contain its recorded Take.",
      );
    const published = await publishedStoryEvidence(
      { identity, profileDirectory: agentProfileDirectoryOf(source) },
      head,
      history,
      agent,
    );
    const base = await git("merge-base", head, trunk);
    const compared = await publishedStoryComparison(
      {
        storyStart,
        commits: published.commits,
        owningMerges: new Set(published.merges),
      },
      head,
      base === claim ? undefined : storyStart,
      call,
    );
    if ("explanation" in compared) return unavailable(compared.explanation);
    return {
      kind: "published-taken",
      agent,
      head,
      remote: "origin",
      target: branch,
      ...compared,
    };
  } catch (error) {
    if (signal.aborted) throw error;
    return unavailable(
      `Published Taken story changes could not be read: ${gitProblem(error)}`,
    );
  }
}
