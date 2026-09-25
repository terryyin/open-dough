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

A developer or agent reconciling the product backlog across branches by hand
runs the installed backlog Git adapters (`product-backlog-git-merge.mjs` and
its rebase and cherry-pick siblings), as the product backlog's merge guidance,
publication-conflict recovery, and story wrap-up direct. On success the
adapter reports its own receipt, yet Git's own messages reach the caller's
stderr too. They are not only noise: after a clean merge the adapter prints
`accepted` and has committed the merge, while Git's leaked "Automatic merge
went well; stopped before committing as requested" says the opposite. An
agent reading both can believe the merge is still uncommitted and act on it.

Execution's publication scripts are not affected: they already capture the
adapters' stderr and use it only on failure. The benefit is limited to direct
adapter runs and to removing a test workaround, which is why this story ranks
below work that serves the near-future direction.

## Story Decomposition

<a id="quiet-backlog-git-operations"></a>

### 1. Keep backlog Git operations quiet on success

**Identity:** SEED-039#quiet-backlog-git-operations
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../quick/106-quiet-backlog-git-operations/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"77419098ed9d3e248d33e0d26f425e66a5da4f23d84085dfed0260c9c188f112","plan":"eedeb2e2c1291465cfb868ab3137c7dc55c940694e09bf3e66b7e10ce13db2ad"}}
```

**Status:** Refined 2026-09-26.

**Goal:** A developer or agent running a backlog Git adapter by hand sees only
the adapter's own receipt when the operation succeeds, so nothing on the
successful path contradicts what the adapter did, and still sees Git's and the
merge driver's diagnostics whenever the adapter stops, refuses, or fails.

**Scope:**

- Required: every successful merge, rebase, and cherry-pick adapter operation,
  including `continue`, writes nothing to stderr; its stdout receipt is
  unchanged.
- Required: every outcome that is not a success keeps the diagnostics a caller
  sees today — the merge driver's refusal (for example "different titles"),
  Git's own message for a refused commit or an unrelated unresolved path, and
  the adapter's own refusal.
- Required: output that the project's own Git hooks print while the adapter
  commits or continues is silenced on success like Git's own messages; a hook
  that fails still shows its output, because its failure stops the adapter.
- Required: remove the test-only workaround that captured the merge adapter's
  stderr (`run_offline_git_merge_proof` in
  `tests/helpers/product-backlog-payload-runtime.bash`).
- Deferred: execution's publication scripts, Dough Land, and any other
  script's own Git calls; they are separate owners and the publication path
  is already quiet.
- Deferred: changing receipt wording, silencing Git's stdout, and a verbose
  or pass-through option; nobody has asked for them.

**Key examples:**

- Two branches each close a different backlog entry → the merge adapter
  reconciles them → stdout shows `accepted`, stderr is empty, and a two-parent
  merge commit exists; nothing the caller sees says the merge stopped before
  committing.
- A branch closed an entry and trunk moved on → the rebase adapter replays it
  cleanly → stdout shows the rebase receipt and stderr no longer shows Git's
  "Rebasing (1/1) … Successfully rebased" progress.
- Two branches give one entry different titles → the merge adapter runs → it
  stops mid-merge and the merge driver's "different titles" diagnostic still
  reaches the caller.
- The project's pre-commit hook prints a warning and exits 0 → a clean merge
  is committed → stderr is empty. The same hook exits nonzero → the adapter
  reports the refused commit with the hook's output.

**Evidence:**

- `src/skills/dough-product-backlog/scripts/product-backlog-git-repository.mjs`
  runs Git through `execFileSync` without setting `stdio`, so Git's stderr is
  inherited by the caller. Reproduced on 2026-09-26 for merge and rebase; a
  clean cherry-pick printed nothing to stderr.
- The merge driver writes to stderr only when it refuses, and a refusal makes
  Git fail. Plan 096 slice 4 captured Git's stderr in `gitOutcome` and broke
  `product-backlog-git-merge-conflict.test.mjs` because it dropped that
  diagnostic on failure as well; the failure path must pass it on.

- **Value / learning:** a successful manual backlog Git operation no longer
  contradicts itself, consistent with SEED-037's "silence means success".
- **Effort hypothesis:** S.
- **Depends on:** none.
