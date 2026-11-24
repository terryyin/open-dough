import type { PublishedSource } from "../src/publishedSource.ts";
import {
  objectIdSchema,
  type StoryReview,
} from "../src/storyReviewContract.ts";
import { isSafeBranchName } from "../src/authenticatedReadRules.ts";
import { gitProblem, runGit, type GitCall } from "./gitRunner.ts";
import { publishedStoryHistory } from "./publishedStoryHistory.ts";
import { agentProfileDirectoryOf } from "./recordsBesideBacklog.ts";
import { publishedStoryEvidence } from "./storyPublishedEvidence.ts";
import { publishedStoryComparison } from "./storyReviewPublished.ts";
import {
  reviewRepositoryPath,
  syncedReviewRepository,
} from "./reviewRepository.ts";
import { takenStoryClaim } from "./takenStoryEndpoints.ts";

type PublishedTakenReview = Extract<
  StoryReview,
  { kind: "published-taken" | "unavailable" }
>;

const unavailable = (explanation: string): PublishedTakenReview => ({
  kind: "unavailable",
  explanation,
});

// Comparisons already built for a head over the same synced refs: the named
// head is immutable, and the source's target and backlog with the refs fix the
// claim and published bound, so a file read reuses the comparison its open
// built instead of rebuilding it. The oldest kept goes first.
const builtComparisons = new Map<string, PublishedTakenReview>();
const builtComparisonLimit = 32;

function keepBuiltComparison(key: string, review: PublishedTakenReview) {
  builtComparisons.delete(key);
  builtComparisons.set(key, review);
  for (const oldest of builtComparisons.keys()) {
    if (builtComparisons.size <= builtComparisonLimit) break;
    builtComparisons.delete(oldest);
  }
}

// A live open syncs the target and the story branch into the Review
// repository by exact ref. A named head (a file read) makes no remote request:
// it is usable only while the last synced target or branch contains it. Git
// may already hold the object locally, which does not establish publication.
export async function publishedTakenReview(
  source: PublishedSource,
  identity: string,
  signal: AbortSignal,
  namedHead?: string,
): Promise<PublishedTakenReview> {
  try {
    const live = namedHead === undefined;
    const directory = live
      ? await syncedReviewRepository(source, signal)
      : reviewRepositoryPath(source);
    const call = { cwd: directory, signal, maxBuffer: 64 * 1024 * 1024 };
    const git = async (...args: string[]) =>
      (await runGit(args, call)).stdout.trim();
    const comparisonKey = async (head: string) =>
      [
        directory,
        source.ref,
        source.backlogPath,
        identity,
        head,
        await git(
          "for-each-ref",
          "--format=%(refname) %(objectname)",
          "refs/remotes/origin",
        ),
      ].join("\n");
    if (namedHead !== undefined) {
      const built = builtComparisons.get(await comparisonKey(namedHead));
      if (built !== undefined) return built;
    }
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
    if (!isSafeBranchName(target))
      return unavailable("The recorded branch name is not usable.");
    const tip =
      mode === "trunk"
        ? trunk
        : await syncedBranchTip(source, target, live, call);
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
    const review: PublishedTakenReview = {
      kind: "published-taken",
      mode,
      agent,
      head,
      remote: "origin",
      target,
      ...compared,
    };
    keepBuiltComparison(await comparisonKey(head), review);
    return review;
  } catch (error) {
    if (signal.aborted) throw error;
    return unavailable(
      `Published Taken story changes could not be read: ${gitProblem(error)}`,
    );
  }
}

// The story branch as last synced into the Review repository, syncing it
// first on a live open. A branch origin does not publish has no tip.
async function syncedBranchTip(
  source: PublishedSource,
  branch: string,
  live: boolean,
  call: GitCall & { readonly signal: AbortSignal },
): Promise<string | undefined> {
  try {
    if (live) await syncedReviewRepository(source, call.signal, branch);
    return (
      await runGit(
        ["rev-parse", "--verify", `refs/remotes/origin/${branch}^{commit}`],
        call,
      )
    ).stdout.trim();
  } catch (error) {
    if (call.signal.aborted) throw error;
    return undefined;
  }
}
