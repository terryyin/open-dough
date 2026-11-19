// Claim-only trunk and multi-workspace ambiguity descriptions for Trunk Mode
// review (./story-review-trunk-worktree-ambiguity.spec.ts): Yui-chan's claim,
// her `trunk-a` with one slice, and agent-authored worktrees beside it — or
// two worktrees at the claim. Published attribution stays in
// ./storyReviewTrunkMode.ts.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { agentIdentity } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { direction } from "../../../Distribution/tests/support/product-backlog-fixture.mjs";
import {
  queuedReadyRepository,
  storyA,
  storyB,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { withLocalState } from "../../../Distribution/tests/support/repository-local-state.mjs";
import { otherQueuedIdentity, queuedIdentity } from "./queuedStories.ts";
import type { StartRepository } from "./startOriginPreparation.ts";
import { mina, yui } from "./storyReviewTrunkCommits.ts";
import { lines } from "./storyReviewWorktree.ts";

// An agent's profile naming the story it executes in Trunk Mode.
const executing = (name: string, identity: string) =>
  makeMe.anAgentProfile
    .executing({ name, identity, mode: "trunk", branch: "origin/main" })
    .please();

const yuiExecuting = (identity: string) => executing("Yui", identity);

export const byYui = { author: { name: yui.agent, email: yui.email } };
export const byMina = { author: { name: mina.agent, email: mina.email } };
const akiho = agentIdentity("Akiho");
const byAkiho = { author: { name: akiho.agent, email: akiho.email } };

// Trunk up to Yui-chan's claim: `src/a.ts`, `src/b.ts` and `src/c.ts`, an
// earlier story she took, changed and closed, and then her claim, which moves
// Story A to Taken in Trunk Mode.
export const trunkModeClaimBuilder = () =>
  queuedReadyRepository()
    .withRevision("trunk files", {
      files: Object.fromEntries(
        ["a", "b", "c"].map((word) => [`src/${word}.ts`, lines(word)]),
      ),
    })
    .withRevision("take the earlier story", {
      ...byYui,
      agentProfiles: [yuiExecuting("SEED-OLD#old")],
    })
    .withRevision("earlier story", {
      ...byYui,
      files: { "old.md": "earlier story\n" },
    })
    .withRevision("close the earlier story", {
      ...byYui,
      remove: [`.planning/${yui.path}`],
    })
    .withRevision("take Story A", {
      ...byYui,
      backlog: { direction, taken: [storyA], queued: [storyB] },
      agentProfiles: [yuiExecuting(storyA.identity)],
    });

// Claim-only trunk for cases that declare their own agent-authored worktrees.
export const trunkModeClaim = (): StartRepository =>
  trunkModeClaimBuilder().please();

// The claim on trunk, Yui-chan's `trunk-a` with one unpublished slice, and
// agent-authored worktrees beside it that the review passes over: one at
// trunk before the claim with an untracked file, one holding her unpublished
// claim of Story B, one holding Akiho-chan's unpublished claim of Story A.
export function trunkModeAmbiguityAlone(): StartRepository {
  return withLocalState(
    trunkModeClaimBuilder()
      .withWorkspace("exec/trunk-a", {
        from: "take Story A",
        agent: yui.agent,
      })
      .withUnpublishedRevision("first slice", {
        ...byYui,
        files: { "slice.txt": "slice\n" },
      })
      .withWorkspace("exec/earlier", {
        from: "close the earlier story",
        agent: yui.agent,
      })
      .withWorkspace("exec/closed-b", {
        from: "close the earlier story",
        agent: yui.agent,
      })
      .withUnpublishedRevision("claim Story B", {
        ...byYui,
        agentProfiles: [executing("Yui", otherQueuedIdentity)],
        files: { "closed-b.txt": "closed-b\n" },
      })
      .withWorkspace("exec/earlier-agent", {
        from: "close the earlier story",
        agent: akiho.agent,
      })
      .withUnpublishedRevision("claim Story A earlier", {
        ...byAkiho,
        agentProfiles: [executing("Akiho", queuedIdentity)],
        files: { "earlier-agent.txt": "earlier-agent\n" },
      })
      .please(),
    { untracked: { "earlier.txt": "earlier\n" } },
    "exec/earlier",
  );
}

// The claim on trunk with two worktrees at it: `trunk-a` and `trunk-b`.
export function trunkModeAmbiguityBoth(): StartRepository {
  return withLocalState(
    withLocalState(
      trunkModeClaimBuilder()
        .withWorkspace("exec/trunk-a", {
          from: "take Story A",
          agent: yui.agent,
        })
        .withWorkspace("exec/trunk-b", {
          from: "take Story A",
          agent: yui.agent,
        })
        .please(),
      { untracked: { "notes.md": "notes\n" } },
      "exec/trunk-a",
    ),
    { untracked: { "second.txt": "second\n" } },
    "exec/trunk-b",
  );
}
