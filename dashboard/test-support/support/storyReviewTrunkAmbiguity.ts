// Published Trunk claim and recorded authors used by the review histories.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { direction } from "../../../Distribution/tests/support/product-backlog-fixture.mjs";
import {
  queuedReadyRepository,
  storyA,
  storyB,
} from "../../../Distribution/tests/support/queued-repository.mjs";
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
