// Taken-story CI comparison endpoints from the published claim and live
// agent profile: story-start from the claim parent (same bound as done
// stories), mode and branch from the live profile, and the live tip to look
// up as a provisional result. No completion or landing — Landed stays
// not-landed until wrap-up.
import { publishedStoryHistory } from "./publishedStoryHistory.ts";
import { agentNameOf } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { isSafeBranchName } from "../src/authenticatedReadRules.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { ciConfiguration } from "./baseCiJudgment.ts";
import { resolveBranchHeadViaGh } from "./ghRevision.ts";
import { runGit, gitProblem, type GitCall } from "./gitRunner.ts";
import { fetchGitTarget, remoteBranchHead } from "./gitTargetFetch.ts";
import { executionCheckout } from "./executionCheckout.ts";
import { agentProfileDirectoryOf } from "./recordsBesideBacklog.ts";
import type { StoryExecutionMode } from "./storyPublishedEndpointDerived.ts";
import {
  publishedStoryEvidence,
  type ReviewedStory,
} from "./storyPublishedEvidence.ts";
import { liveClaimsAt } from "./takenStoryLiveClaims.ts";

export type TakenStoryEndpointFacts = {
  readonly identity: string;
  readonly mode: StoryExecutionMode;
  readonly storyStart: string;
  readonly agent: string;
  // Live tip whose completed build is the provisional result: story-branch
  // head, or the configured trunk tip for Trunk Mode.
  readonly liveTip: string;
  // Recorded story-branch name when mode is story-branch.
  readonly branch?: string;
};

type TakenClaimGap =
  | { readonly kind: "unavailable"; readonly explanation: string }
  | { readonly kind: "absent" };

export type TakenStoryEndpoints =
  | { readonly kind: "facts"; readonly facts: TakenStoryEndpointFacts }
  | TakenClaimGap;

type TakenClaim = Omit<TakenStoryEndpointFacts, "liveTip"> & {
  readonly claim: string;
  readonly trunk: string;
};

async function storyStartOf(
  claim: string,
  call: GitCall,
): Promise<string | undefined> {
  try {
    return (await runGit(["rev-parse", `${claim}^`], call)).stdout.trim();
  } catch {
    return undefined;
  }
}

async function publishedBranchHead(
  branch: string,
  call: GitCall,
): Promise<string | undefined> {
  if (!isSafeBranchName(branch))
    throw new Error("The recorded branch name is not usable.");
  return remoteBranchHead("origin", `refs/heads/${branch}`, call);
}

async function liveTipOf(
  source: PublishedSource,
  mode: StoryExecutionMode,
  trunk: string,
  branch: string | undefined,
  call: GitCall,
  signal: AbortSignal,
  directory: string,
): Promise<string | { explanation: string }> {
  if (mode === "trunk") return trunk;
  if (branch === undefined || branch === "") {
    return {
      explanation:
        "The Taken story's live agent profile records Story Branch Mode without a branch name.",
    };
  }
  try {
    const fetch = { ...call, env: { GIT_TERMINAL_PROMPT: "0" } };
    const adapter = ciConfiguration(directory).adapter !== undefined;
    const head = adapter
      ? await publishedBranchHead(branch, fetch)
      : await resolveBranchHeadViaGh(source.repository, branch, signal);
    if (head === undefined) {
      return {
        explanation: `The recorded story branch ${branch} is no longer published on ${adapter ? "origin" : "GitHub"}.`,
      };
    }
    await fetchTip(head, fetch);
    return head;
  } catch (error) {
    return {
      explanation: `The Taken story's live branch tip could not be read: ${gitProblem(error)}`,
    };
  }
}

// Fetch exactly the advertised commit, also in readers that only track trunk.
async function fetchTip(head: string, call: GitCall): Promise<void> {
  await runGit(
    ["fetch", "--quiet", "--no-write-fetch-head", "origin", head],
    call,
  );
  await runGit(["rev-parse", "--verify", `${head}^{commit}`], call);
}

// Both Review and CI recover the claim and its story-start bound from the
// configured target as last fetched into the repository `call` reads. The
// caller owns fetching it and resolving the story branch's tip.
export async function takenStoryClaim(
  source: PublishedSource,
  identity: string,
  call: GitCall & { readonly signal: AbortSignal },
): Promise<
  { readonly kind: "claim"; readonly facts: TakenClaim } | TakenClaimGap
> {
  const trunk = (
    await runGit(
      ["rev-parse", "--verify", `origin/${source.ref}^{commit}`],
      call,
    )
  ).stdout.trim();
  const story: ReviewedStory = {
    identity,
    profileDirectory: agentProfileDirectoryOf(source),
  };
  const live = await liveClaimsAt(story, trunk, call);
  if ("explanation" in live)
    return { kind: "unavailable", explanation: live.explanation };
  if (live.length === 0) return { kind: "absent" };
  if (live.length > 1) {
    return {
      kind: "unavailable",
      explanation:
        "More than one agent profile names this Taken story, so its comparison endpoints cannot be attributed safely.",
    };
  }
  const [claiming] = live;
  if (claiming === undefined) return { kind: "absent" };
  if (agentNameOf(claiming.agent) === undefined) {
    return {
      kind: "unavailable",
      explanation:
        "The Taken story's live agent profile does not name a usable execution agent.",
    };
  }
  const evidence = await publishedStoryEvidence(
    story,
    trunk,
    publishedStoryHistory(call),
    claiming.agent,
  );
  const [claim] = evidence.claims;
  if (claim === undefined) {
    return {
      kind: "unavailable",
      explanation:
        "Published execution claim history does not establish a claim for this Taken story.",
    };
  }
  const storyStart = await storyStartOf(claim, call);
  if (storyStart === undefined || storyStart === "") {
    return {
      kind: "unavailable",
      explanation:
        "Published execution claim history does not name a usable story-start bound.",
    };
  }
  return {
    kind: "claim",
    facts: {
      identity,
      claim,
      trunk,
      storyStart,
      mode: claiming.mode,
      agent: claiming.agent,
      ...(claiming.mode === "story-branch" && claiming.branch !== undefined
        ? { branch: claiming.branch }
        : {}),
    },
  };
}

export async function takenStoryEndpoints(
  source: PublishedSource,
  identity: string,
  signal: AbortSignal,
): Promise<TakenStoryEndpoints> {
  try {
    const directory = executionCheckout(source).path;
    const call = { cwd: directory, signal, maxBuffer: 64 * 1024 * 1024 };
    await fetchGitTarget("origin", source.ref, call);
    const taken = await takenStoryClaim(source, identity, call);
    if (taken.kind !== "claim") return taken;
    const {
      identity: claimed,
      mode,
      trunk,
      branch,
      storyStart,
      agent,
    } = taken.facts;
    const tip = await liveTipOf(
      source,
      mode,
      trunk,
      branch,
      call,
      signal,
      directory,
    );
    if (typeof tip !== "string")
      return { kind: "unavailable", explanation: tip.explanation };
    return {
      kind: "facts",
      facts: {
        identity: claimed,
        mode,
        storyStart,
        agent,
        liveTip: tip,
        ...(branch === undefined ? {} : { branch }),
      },
    };
  } catch (error) {
    if (signal.aborted) throw error;
    return {
      kind: "unavailable",
      explanation: `Taken story comparison endpoints could not be read: ${gitProblem(error)}`,
    };
  }
}

export { notLandedYet } from "./intentCiComparisonSlots.ts";
