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

// A named head is usable only while the published target still contains it.
// Git may already hold the object locally, which does not establish publication.
export async function publishedTakenReview(
  source: PublishedSource,
  identity: string,
  signal: AbortSignal,
  namedHead?: string,
): Promise<PublishedTakenReview> {
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
    if (taken.kind === "absent")
      return unavailable(
        "Origin does not record an execution claim for this Taken story.",
      );
    if (taken.kind === "unavailable") return taken;
    const { mode, branch, trunk, claim, storyStart, agent } = taken.facts;
    const target = mode === "trunk" ? source.ref : branch;
    if (target === undefined)
      return unavailable("The Taken story does not record a published branch.");
    const tip =
      mode === "trunk" ? trunk : await publishedTakenBranchTip(target, call);
    if (tip === undefined)
      return unavailable(
        `The recorded story branch ${target} is not published on origin.`,
      );

    const history = publishedStoryHistory(call);
    if (namedHead !== undefined) {
      if (!objectIdSchema.safeParse(namedHead).success)
        return unavailable(
          "The published comparison names an invalid revision.",
        );
      if (!(await history.isAncestor(namedHead, tip)))
        return unavailable(
          mode === "trunk"
            ? "The named comparison is not contained in published trunk."
            : "The named comparison is not contained in the published story branch.",
        );
    }
    const head = namedHead ?? tip;
    if (!(await history.isAncestor(claim, head)))
      return unavailable(
        "The published target does not contain the story's recorded Take.",
      );
    const published = await publishedStoryEvidence(
      { identity, profileDirectory: agentProfileDirectoryOf(source) },
      head,
      history,
      agent,
    );
    const includesTrunk =
      mode === "story-branch" &&
      (await git("merge-base", head, trunk)) !== claim;
    const compared = await publishedStoryComparison(
      {
        storyStart,
        commits: published.commits,
        owningMerges: new Set(published.merges),
      },
      head,
      includesTrunk ? storyStart : undefined,
      call,
    );
    if ("explanation" in compared) return unavailable(compared.explanation);
    return {
      kind: "published-taken",
      mode,
      agent,
      head,
      remote: "origin",
      target,
      ...compared,
    };
  } catch (error) {
    if (signal.aborted) throw error;
    return unavailable(
      `Published Taken story changes could not be read: ${gitProblem(error)}`,
    );
  }
}
