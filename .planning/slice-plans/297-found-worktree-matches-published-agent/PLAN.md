# A found worktree is reviewed only for the agent trunk publishes

**Identity:** SEED-088#found-worktree-matches-published-agent
**Source:** [story](../../seeds/SEED-088-dashboard-story-code-review.md#found-worktree-matches-published-agent),
a bounded correction from the execution retrospective of
`SEED-088#review-trunk-mode-story-worktree` (plan 296, recoverable at
`0ff0e2421c6260ef25d584323d62b86c51758f3b:.planning/slice-plans/296-trunk-mode-worktree-review/PLAN.md`;
its story at the same revision in
`.planning/seeds/SEED-088-dashboard-story-code-review.md#review-trunk-mode-story-worktree`;
reviewed commits `f2e6e131` and `bc36167e`). Planning only; this plan
grants no Take, execution, or publication.

## Goal and boundaries

A developer reviewing a story that another agent held earlier on this machine
gets the review of the worktree of the agent that holds it now, although the
earlier agent's worktree is still listed at its old claim.

Preserved, as plan 296 delivered: a kept launch record's workspace first; one
found worktree reviewed as a launched one; two worktrees of the story's agent
both holding the claim explained and refused in the decided words; a worktree
before the claim or on another story's claim passed over; no worktree, no
Review changes. It adds no feature promise: the original story already
requires that the worktree's author config “names the card's agent”.

Excluded: Recently done cards, which read no found worktree; retiring leftover
worktrees; the sibling story's landed comparison.

## Current findings

- `reviewWorkspaceOf` (`dashboard/src/storyReviewWorkspace.ts`) keeps the
  found worktrees whose `source` and `identity` match, and the scan
  (`dashboard/server/localWorkspaces.ts`) reports any worktree whose own
  author's profile at its head names a story. Neither asks which agent trunk
  publishes for that story, so the story's Required clause “whose per-worktree
  author config names the card's agent” is not applied.
- Consequence: when a story held by one agent returns to the backlog and
  another agent takes it while the first worktree is still listed, the review
  answers the ambiguity for two agents and reads neither, so the live worktree
  cannot be reviewed until the old one is removed; before the second Take, the
  Backlog card offers the abandoned worktree's review.
- Plan 296's obligation G9 recorded the two-agent state as `no user cost`
  (“not a state the start leaves”) without tracing that path.

## Architecture

The scan stays the one place that decides which worktrees hold a claim, read
from local Git alone. It gains one more read per candidate worktree: the
profile trunk publishes for the worktree's author, as the project's checkout
last fetched it (`git show <remote>/<ref>:<agents directory>/<agent>.json`,
with `origin` and the project's `ref`, the pair `resolvedWorkspace` already
uses). A worktree counts for a story only while that published profile names
the same story. The card's agent is the agent of trunk's profile naming the
story, so a worktree that passes is authored by the card's agent, and the
rule, the sessions answer and the page need no agent parameter.

A real start pushes its claim from the worktree, which moves the shared
repository's remote-tracking ref, so the story's own worktree qualifies at
once. A leftover worktree stops qualifying when any fetch or push in the
repository brings trunk's changed or removed profile; the scan itself fetches
nothing, as today.

Set aside: passing the card's agent from the page through the review, file,
range and mark requests (four request shapes for a fact local Git already
has); reading the published snapshot on the server (the boundary resolves
workspaces without it). No Accepted ADR applies; the Proposed
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
keeps worktree locations in the local view, which this preserves.

## Observed premises

Observed on 2026-10-11 in the execution worktree of plan 296 at `bc36167e`
with Node 24.21.0; the scratch spec was removed afterwards.

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| Worktrees of two agents naming one story are answered as an ambiguity today | Slice 1's failing-first spec | `node -e` importing `dashboard/src/storyReviewWorkspace.ts`: `reviewWorkspaceOf([], [Yui-chan's, Aki-chan's entries for X], …)` | `ambiguous`; explanation “… for Yui-chan, Aki-chan: …” |
| After a real Trunk Mode start, the project checkout's `origin/main` holds the agent's profile naming the story | Slice 1's new read | Scratch Playwright spec: `takenInTrunkMode("trunk-a")`, then in `origin.project` `git rev-parse origin/main` and `git show origin/main:.planning/agents/yui-chan.json` | `origin/main` moved to the claim head; the profile names `SEED-A#a`, agent `Yui-chan` |
| A leftover worktree at an old claim exists on a real machine and trunk no longer publishes that claim | The correction's value | In the default checkout: each linked worktree's `author.name` and `HEAD:.planning/agents/<agent>.json`, against `origin/main`'s profiles | `make-story-cards-modern-compact-information-radi` is authored by aki-chan at the claim of `SEED-091#story-card-information-radiator`; `origin/main` publishes aki-chan for `SEED-088#resolved-integration-survives-reruns` |

## Outside-in proof ownership

| Promise | Owner and observable proof |
| --- | --- |
| A worktree of an agent trunk does not publish for the story is passed over; the review reads the publishing agent's worktree | Slice 1 spec in `dashboard/tests/story-review-trunk-worktree-ambiguity.spec.ts`: Story A taken by the real start; a second worktree authored by another known agent whose head commits that agent's profile naming Story A; the sessions answer lists the first alone and the review opens on it with its baseline, files and context line. The case fails before the change with the two-agent ambiguity |
| Two worktrees of the publishing agent both holding the claim are still explained and refused | The existing ambiguity case in that spec stays green unchanged |
| Everything plan 296 proved | `dashboard/tests/story-review*.spec.ts`, `recently-done-one-shot-review.spec.ts`, the two start-refusal specs; `npm run typecheck:dashboard`; `npm run lint` |

## Ordered slices

### 1. The scan counts a worktree only while trunk publishes its agent for the story
Type: Behavior
Status: done
Proof: the new case and the suites in the proof table. Accepted on
2026-10-11: `npx playwright test --config dashboard/playwright.config.ts
dashboard/tests/story-review*.spec.ts
dashboard/tests/recently-done-one-shot-review.spec.ts
dashboard/tests/agent-launch-start-refusal.spec.ts
dashboard/tests/responsive-session-reconciliation-refusals.spec.ts` (104
passed) and `npm run typecheck:dashboard`; the new case failed first with
Akiho-chan's `earlier-agent` listed beside Yui-chan's `trunk-a` for Story A.

Learnings: “Aki-chan” is no known agent name, so the case uses Akiho-chan.
Plan 296's first case expected the sessions answer to list `closed-b` (the
story's agent, its head naming Story B) for Story B; trunk publishes that
agent for Story A, so under this rule it counts for no story and the case
now expects `trunk-a` alone.

Behavior: Yui-chan holds Story A by the real Trunk Mode start in
`.worktrees/trunk-a`; the checkout also lists `.worktrees/earlier-agent`,
authored by Aki-chan, whose head commits Aki-chan's profile naming Story A,
which trunk does not publish → the Taken card offers Review changes → the
review reads `.worktrees/trunk-a`, and the sessions answer lists no worktree
for Aki-chan.

Change: `localWorkspacesOf` reads the author's profile at
`origin/<source.ref>` in the worktree and keeps the entry only when it parses
and names the identity the head's profile names; a failed read passes the
worktree over, as the other reads do. `STORY-REVIEW-WORKSPACE.md` states the
rule in the found-worktree paragraph. Remove
`severalWorktreesExplanation`'s several-agents join, which no state then
reaches, with its wording in the doc if any.

Safe stopping point: the correction's outcome is delivered.

## Story obligations

### G1. No case for an unparseable profile on trunk
Reported: slice 1 — "No case covers a missing or unparseable profile on `origin/<ref>`."
Story clause: "gets the review of the worktree of the agent that holds it now"
Disposition: no user cost "gets the review of the worktree of the agent that holds it now": a missing profile on trunk is the new case's own path (trunk publishes no Akiho-chan profile, so the read fails and the worktree is passed over); an unparseable one takes the same pass-over branch and can only hide a worktree, never show a wrong one

### G2. No dedicated Backlog-card case for an abandoned worktree
Reported: slice 1 — "a Backlog card no longer offering an abandoned worktree's review before a second Take, has no dedicated case."
Story clause: "The local worktree scan counts a worktree for a story only while"
Disposition: proved by slice 1: `dashboard/tests/story-review-trunk-worktree-ambiguity.spec.ts`, first case — `closed-b` at Story B's unpublished claim is absent from the sessions answer's `workspaces`, the only source a card's found-worktree review reads
