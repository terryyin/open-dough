# Credit the developer on Story Branch integration merges

## Source

**Identity:** SEED-047#integration-merge-credit

[Correction story](../../seeds/SEED-047-credit-agent-and-developer-commits.md#integration-merge-credit).
This is a bounded retrospective correction of the completed execution of
`SEED-047#agent-and-developer-credit` under plan 119, where all four slices
are done:

- claim `4c23f11`;
- attributable commits `01a3e2c`, `ed9a77e`, `6105443`, and `87e019f`;
- branch `claude/119-agent-and-developer-commit-credit`.

That story's outcomes stay as delivered. The retrospective authorized
planning only, so execution needs its own authority.

## Goal and scope

The Story Branch integration merge commit is agent-authored and credits the
configured developer once, through the same `creditDeveloper` rule that the
Take, preparation, and agent commits use.

### Current finding

**F1: the integration merge commit omits developer credit (medium).** This
is a gap in the story's "closure commits" scope.
[Preserve published history](../../../src/skills/dough-execute-plan/references/publish-the-candidate.md#preserve-published-history)
tells the agent to integrate a published Story Branch tip in the owned
workspace in one of two ways:

- with a merge commit (`git merge --no-ff`);
- with `product-backlog-git-merge.mjs merge` when the backlog is touched.
  That adapter's `commitAcceptedMerge` runs `git commit --no-edit`.

Neither way goes through `creditDeveloper` or `agent-commit.mjs`. The owned
workspace's per-worktree config makes the agent the author, so the merge on
trunk lacks the developer trailer. Plan 117's integration merge `199ae44`
shows this: its author is Kirara-chan and its only trailer is the model's.
`history-preserving-publication.mjs` `historyPreservingMerge` has the same
shape.

### Preserved promises and constraints

The following stay unchanged:

- the agent as Git author;
- existing co-authors;
- one developer trailer (email-based dedupe);
- refusal of a missing, malformed, or agent-equal identity before
  publication;
- plain behavior in checkouts that name no agent;
- no hooks installed and no `core.hooksPath` change;
- no historical rewrite.

The history-preserving merge semantics (fast-forward when possible, otherwise
a merge commit), push and recovery, and the adapter's backlog validation and
blocked-merge behavior do not change.

## Current decisions

- **Reuse the shared rule.** The adapter's merge commit and the plain
  integration merge credit their message through `creditDeveloper` when the
  workspace names an agent (`workspaceAgent`). A checkout without an agent
  commits exactly as today. Add no second trailer or identity path.
- **Guidance.** Preserve published history makes the merge commit an
  [agent commit](../../../src/skills/dough-execute-plan/references/agent-commits.md)
  when that reference applies. For example, `git merge --no-ff --no-commit`
  followed by `agent-commit.mjs` commits the in-progress merge. Link the
  reference; do not restate it.
- ADR 0006 and AGENTS.md: edit release source under `src/skills/`.

## Outside-in proof

| Promise | Owning slice and observable proof |
| --- | --- |
| A plain integration merge in an agent workspace credits the developer once | 1: `closure-story-integration.test.mjs` history-preserving case inspects the published merge's author, committer, and trailers |
| A backlog-adapter merge commit in an agent workspace credits the developer once | 1: `tests/support/product-backlog-git-merge.test.mjs` (or the smallest merge-adapter fixture) with a worktree-configured agent author and a configured developer |
| An unusable developer refuses before the merge is committed or published | 1: adapter or integration fixture with an agent-equal committer; no commit and no push |
| A checkout with no agent keeps today's merge commit | 1: existing adapter cases stay unchanged and green |

Focused checks:
`node --test src/skills/dough-story-wrap-up/scripts/closure-story-integration.test.mjs tests/support/product-backlog-git-merge.test.mjs`,
plus the tests that import any changed file, and
`/opt/homebrew/bin/bash tests/payload-declaration-links.sh` when guidance
links change.

## Ordered slices

### 1. Story Branch integration merges credit the developer
Type: Behavior
Status: planned
Proof: Reproduce the missing trailer on an agent-workspace integration merge,
both plain and through the adapter, as a failing assertion. Then route both
through `creditDeveloper` and assert:

- agent author and developer committer;
- one developer trailer;
- the refusal case with no commit and no push;
- unchanged non-agent adapter cases.

Update Preserve published history to link the agent-commit rule. Run the
guidance tests that read `publish-the-candidate.md`.

Behavior: an agent integrates its Story Branch → the published integration
merge credits the agent as author and the configured developer once. An
unusable developer stops the integration before publication.

Safe stop: every agent-enabled commit the product guides carries the
developer credit.
