---
id: SEED-039
status: active
planted: 2026-09-25
planted_during: Retrospective of plan 096 (SEED-037 story 1), on the maintainer's request
trigger_when: The product backlog's Git merge, rebase, or cherry-pick adapters run for a developer or an agent
scope: small
---

# SEED-039: Keep the product backlog's Git operations quiet on success

## Why This Matters

A developer or agent reconciling the product backlog across branches runs the
installed backlog Git adapters (`product-backlog-git-merge.mjs` and its
rebase and cherry-pick siblings). On success the adapter already reports its
own receipt, yet Git's own messages, such as "Automatic merge went well;
stopped before committing as requested", reach the caller's stderr too. The
caller cannot tell routine chatter from a real problem, and every caller that
wants quiet output has to capture and discard stderr itself.

## Story Decomposition

<a id="quiet-backlog-git-operations"></a>

### 1. Keep backlog Git operations quiet on success

**Identity:** SEED-039#quiet-backlog-git-operations

**Status:** Not refined. Raised by plan 096's retrospective.

**Goal:** A developer or agent running a backlog Git adapter sees only the
adapter's own receipt when the operation succeeds, and still sees Git's and
the merge driver's diagnostics when something needs attention.

**Evidence and constraints:**

- `src/skills/dough-product-backlog/scripts/product-backlog-git-repository.mjs`
  runs Git through `execFileSync` without setting `stdio`, so Git's stderr is
  inherited by the caller.
- Plan 096 slice 4 tried capturing Git's stderr in `gitOutcome`; that broke
  `product-backlog-git-merge-conflict.test.mjs`, because the merge driver's
  "different titles" diagnostic must still reach the adapter's stderr. The
  story must keep that diagnostic visible.
- Plan 096 silenced the chatter only in a test helper
  (`tests/helpers/product-backlog-payload-runtime.bash`,
  `run_offline_git_merge_proof`), which captures stderr and shows it on
  failure. That workaround can go once the adapter is quiet.

**Key examples:**

- A clean backlog merge prints the adapter's acceptance receipt and nothing on
  stderr.
- A merge whose entries conflict in title still shows the merge driver's
  diagnostic on stderr.
- A Git failure (for example a refused commit) shows Git's own message.

- **Value / learning:** quiet success for one more tool agents run routinely,
  consistent with SEED-037's "silence means success".
- **Effort hypothesis:** S, provisional.
- **Depends on:** none.
