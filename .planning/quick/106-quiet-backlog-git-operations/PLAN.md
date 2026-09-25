# Keep backlog Git operations quiet on success

## Source

Story [Keep backlog Git operations quiet on success](../../seeds/SEED-039-quiet-backlog-git-operations.md#quiet-backlog-git-operations),
refined 2026-09-26. Planned at `e9fcf41`.

**Identity:** SEED-039#quiet-backlog-git-operations

## Goal and scope

A developer or agent running a backlog Git adapter by hand sees only the
adapter's receipt when the operation succeeds, so nothing on the successful
path contradicts what the adapter did. Whenever the adapter stops, refuses, or
fails, they still see Git's, the merge driver's, and the project's hooks'
diagnostics.

### Included

- Merge, rebase, and cherry-pick adapters, including `continue` and
  `validate`: success writes nothing to stderr; stdout receipts are unchanged.
- Every non-success outcome still passes Git's captured stderr to the caller.
- Hook output is silenced on success and shown when the hook fails.
- Remove the stderr workaround in `run_offline_git_merge_proof`
  (`tests/helpers/product-backlog-payload-runtime.bash`).

### Material exclusions

- Execution's publication scripts
  (`src/skills/dough-execute-plan/scripts/workspace-publication-push.mjs`,
  `owned-suffix-reconciliation.mjs`, `history-preserving-publication.mjs`)
  already capture the adapters' stderr and use it only on failure. They are
  not changed.
- Dough Land, other scripts' own Git calls, and the test fixture's own `git`
  helper (`tests/support/product-backlog-git-fixture.mjs`) are not changed.
- No receipt wording change, no silencing of Git's stdout, no verbose or
  pass-through option.
- This repository's installed copies under `.agents/skills/` and
  `.claude/skills/` are updated only from a released payload.

### Assumptions

- The merge driver writes to stderr only when it refuses, and its nonzero exit
  makes Git fail (`product-backlog-git-driver.mjs`, end of file). A successful
  operation therefore never carries a diagnostic the caller needs.
- Each adapter runs one operation per process through `runGitOperationCli`
  (`product-backlog-git-cli.mjs`), which already decides success or failure
  from `failingStatuses`, a `BacklogError`, or an unexpected throw.

## Context and architecture

PFE: the existing solution is `gitOutcome` in
`product-backlog-git-repository.mjs`, which already returns Git's stderr on
failure. Several failure messages already embed it (`blockedStopMessage`,
`commitAcceptedMerge`). The gap is that `git()` sets no `stdio`, so Node also
forwards Git's stderr to the parent on every call, including successful ones.
The merge conflict path (`mergeOperation`'s `conflict` status) relies only on
that forwarding for the driver's "different titles" diagnostic. Plan 096
captured stderr in `gitOutcome` without replaying it and broke
`tests/support/product-backlog-git-merge-conflict.test.mjs`.

**Common rule:** the shared Git primitive captures Git's stderr instead of
forwarding it. The shared CLI dispatch writes the operation's captured Git
stderr to `process.stderr` on every non-success exit — a failing status, a
`BacklogError`, or an unexpected throw — and discards it on success. One rule
in two shared modules covers every adapter and outcome, with no per-path
special case. The executor chooses how the captured text reaches the CLI (for
example a diagnostics collector owned by one dispatch and handed to the Git
calls, rather than hidden module-global state, so in-process importers are not
surprised). No Accepted ADR or North Star topic governs this. It stays inside
`dough-product-backlog`'s scripts.

## Outside-in proof

| Key example | Signal |
| --- | --- |
| Clean merge shows only `accepted`; the merge commit exists | `tests/support/product-backlog-git-merge.test.mjs` "concurrent sibling closures": add `merged.stderr === ""` beside the existing two-parent and not-mid-merge assertions |
| Clean rebase no longer shows Git's progress | `tests/support/product-backlog-git-rebase-clean-accepted.test.mjs` "genuinely compatible multi-commit clean replay": add an empty-stderr assertion |
| Title conflict keeps the driver diagnostic | existing `tests/support/product-backlog-git-merge-conflict.test.mjs` genuine-conflict case, tightened to match "different titles" on `merged.stderr` |
| Hook warning on success is silent; hook failure is shown | new case in `tests/support/product-backlog-git-merge.test.mjs`: a scratch repo `pre-commit` hook that prints a marker and exits 0 → code 0 and empty stderr; exiting 1 → code 1, `blocked`, marker visible to the caller |
| Installed payload merge stays accepted with no workaround | `tests/product-backlog-payload-update.sh` via `run_offline_git_merge_proof`, now asserting empty stderr directly |

## Current decisions

- Hook output on success is silenced like Git's own messages (developer
  decision, 2026-09-26).
- Failure-path messages that already embed Git's stderr keep doing so. A
  caller may see that text once in the message and once in replayed stderr.
  This matches today's behavior and is not deduplicated.

## Ordered slices

### 1. Backlog Git adapters are silent on success and keep every failure diagnostic

Type: Behavior
Status: planned
Proof:

```sh
node --test tests/support/product-backlog-git-*.test.mjs
/opt/homebrew/bin/bash tests/product-backlog-payload-update.sh
npm run lint
```

Behavior: a backlog with independent closures on two branches (or a
cleanly replayable rebase) → the developer runs the merge (or rebase) adapter
→ stdout carries the unchanged receipt, stderr is empty, and the Git result is
committed. With conflicting titles or a failing commit hook, the same run stops
with exit 1 and the driver's or hook's diagnostic on stderr.

Work:

- Capture Git's stderr in `product-backlog-git-repository.mjs` (`git`,
  `gitOutcome`) instead of forwarding it.
- In `product-backlog-git-cli.mjs`, emit the captured Git stderr on every
  non-success exit and drop it on success.
- Add the proof assertions and the hook case above. Tighten the conflict
  test's diagnostic assertion to stderr.
- Remove the `2> "${git_project}.merge-stderr"` capture and its failure-only
  replay from `run_offline_git_merge_proof`, and assert the adapter's stderr
  is empty.

Safe stop: all listed commands green. Before this slice the adapters behave
as today; there is no intermediate state.

## Learnings

None yet.
