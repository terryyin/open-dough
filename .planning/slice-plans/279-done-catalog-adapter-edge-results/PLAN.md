# Backlog Git adapters end edge outcomes in an actionable result

**Identity:** SEED-119#done-catalog-adapter-edge-results-correction
**Source:** [correction story](../../seeds/SEED-119-recently-done-progressive-loading.md#done-catalog-adapter-edge-results-correction),
from the execution retrospective of
SEED-119#done-catalog-currency-correction (plan 276, recoverable at
`a19f7186:.planning/slice-plans/276-done-catalog-currency-correction/PLAN.md`).
**Prepared:** 2026-10-08, planning only, in the execution checkout
`/Users/terryyin/git/open-dough/.worktrees/done-catalog-stays-current-through-git-integrati`
on `claude/done-catalog-stays-current-through-git-integrati` at `e634f974`,
whose coordinator commits these records. This plan grants no execution or
publication.

## Provenance

- Original contract: SEED-119#done-catalog-currency-correction and plan 276
  as they stand at `e634f974`. Their promises, decisions 1–4, and exclusions
  are unchanged.
- Reviewed manifest: `24fb8d48` (merge adapter keeps the catalog current),
  `75422d16` (rebase and cherry-pick adapters), `f49e686f` (dashboard names the
  `catalog-done` repair), `e634f974` (failed record reads asked again). Base
  before the correction: `c794b7f0`. CI for `e634f974` was pending at review.

## Findings (current, evidenced)

1. **Merging an already-contained ref crashes the merge adapter (regression).**
   `commitAcceptedMerge` in
   `src/skills/dough-product-backlog/scripts/product-backlog-git-merge.mjs:80-85`
   runs `git rev-parse MERGE_HEAD` unconditionally. When the ref is an
   ancestor of `HEAD` (not equal to it, so the fast-forward branch at
   `:118-122` is not taken), `git merge --no-commit --no-ff <ref>` is a no-op
   that leaves no `MERGE_HEAD`, and the CLI now exits 1 with an uncaught
   `Command failed: git rev-parse MERGE_HEAD` stack trace. At `c794b7f0` the
   same call returned the structured `blocked` result (exit 1) whose message
   wrongly says something unrelated is still unresolved. Reached only by direct
   CLI use: `history-preserving-publication.mjs:167` returns `already-accepted`
   before merging an already-contained tip.
2. **Publication guidance can continue an adapter rebase with raw Git, and
   does not name `catalog-uncommitted`.**
   `src/skills/dough-execute-plan/references/publication-rebase-conflict.md:11-12`
   routes only "the backlog's own unmerged path" through the adapter's
   `continue`; its other-paths text (`:20-31`) says "Continue the rebase", so a
   done-record conflict in an adapter rebase could be continued with
   `git rebase --continue`, skipping the catalog rebuild that
   `src/skills/dough-product-backlog/references/merge-conflicts.md:121-125`
   promises on the adapter's `continue`. The failing status
   `catalog-uncommitted` (replay finished, rebuilt catalog staged, not
   committed) appears only in `merge-conflicts.md:127-131`;
   `publish-the-candidate.md:97-98` and `:159` and
   `publication-rebase-conflict.md:9,18` list only conflict, refusal, blocked,
   or disputed results.

## Goal and boundaries

One correction outcome: the backlog Git adapters' edge outcomes end in a
structured, actionable result, and publication guidance resumes an adapter
stop through the adapter and names `catalog-uncommitted` as a finished replay
whose staged catalog is to be committed, not a conflict to continue.

Included:

- The merge adapter, given a ref the current branch already contains (and
  that is not the current commit), stops before any merge with a structured
  `blocked` result — exit 1, as at `c794b7f0` — whose message says the branch
  already contains the ref, nothing was merged or changed, and there is
  nothing to `continue`. No stack trace; refs, index, worktree, and Git's
  merge state are untouched.
- `publication-rebase-conflict.md`: any unmerged path in a rebase the adapter
  runs — the backlog, a done record, or another product path — is resolved,
  `git add`ed, and resumed with that adapter's `continue`; the other-paths
  guidance keeps its combine-by-intent rules but resumes through the adapter
  when the adapter ran the rebase. A `catalog-uncommitted` result is a
  finished replay: settle what the report names, commit the staged catalog
  alone (crediting the developer like any other agent commit), take the
  owned-branch tip as the candidate, and revalidate as candidate step 4.
- `publish-the-candidate.md`'s two stop sentences (`:97-98`, `:159`) cover
  every stopping adapter result, including `catalog-uncommitted`, and point to
  publication rebase conflicts for the resume.

Excluded and open (Terry's decisions, not represented as agreed):

- **Already-contained merge as success.** The alternative to restoring the
  structured stop is reporting a non-failing "nothing to merge" result, like
  the fast-forward path's `fast-forwarded`. That changes the exit status the
  adapter had at `c794b7f0`, so this plan keeps the stop; switching is a small
  later change to the same branch and test if Terry prefers it.
- Strict catalog mode and release ordering between the producer and the
  dashboard stay open as in plan 276.
- The publication scripts (`workspace-publication-push.mjs:181-186`,
  `execution-increment-publication.mjs:55-70`) keep classifying any failing
  adapter replay as a `conflict` stop. They cannot tell `catalog-uncommitted`
  apart without a machine-readable adapter status — the CLI prints only the
  result's message and exits 1 for every failing status — and that would be an
  output-contract change across all adapters. The stop already carries the
  adapter's report (`replay.stdout`), which the guidance teaches the agent to
  read.
- `creditMergeInProgress` now reads and rewrites `MERGE_MSG` unchanged when no
  agent is named; harmless, left as is.
- A rebase onto an upstream the branch already contains reports `disputed`
  (observed at both `e634f974` and `c794b7f0`); structured and not a
  regression, so not changed here.
- Recorded native closure evidence that hashes `publish-the-candidate.md` is
  already stale after plan 276; this edit keeps it stale. Refreshing it is a
  paid manual run and is not part of this correction.

## Existing solution and direction

- `mergeOperation` already computes `mergeBase` of `HEAD` and the ref; the
  already-contained case is `mergeBase` equal to the ref's commit. Return the
  stop there, before driver registration and `git merge`, next to the existing
  fast-forward branch. `commitAcceptedMerge` stays as is for real merges.
- `failingStatuses` already contains `blocked`, so the CLI's existing output
  and exit handling apply unchanged.
- `merge-conflicts.md` already states the adapter `continue` and
  `catalog-uncommitted` semantics; the publication references link to it
  rather than restating it.

Accepted [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
and [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
apply: edit `src/skills` only, never the installed copies under `.agents/` or
`.claude/`, and write guidance for the executing agent. No new runtime file,
so `install.sh` is unchanged. No Accepted-ADR conflict and no North Star topic.

## Current decisions

1. An already-contained merge keeps the `blocked` status and exit 1 it had at
   `c794b7f0`, with an accurate message; the success alternative is Terry's.
2. `catalog-uncommitted` and done-record conflicts are handled in guidance;
   the publication scripts are unchanged.

## Observed decisive premises

Prefix for every command: `/Users/terryyin/.claude/jobs/1711204c/tmp/run`
(unsets `NODE_ENV`, `FORCE_COLOR`, `NO_COLOR`; Node 24.21.0 and Bash 5 first).

| Premise and consuming operation | Observation | Result |
| --- | --- | --- |
| An already-contained ref crashes the merge CLI at `e634f974`; consumed by slice 1's fix and its failing-first case | Disposable `node --test` spec (removed) using `scratchRepo`, `commitBranch`, `commitOn`, and `run(repo, ["merge", "--ref", "main"])` on a branch two commits ahead of `main` | Exit 1, empty stdout, stderr `Error: Command failed: git rev-parse MERGE_HEAD` with a stack through `commitAcceptedMerge` (`product-backlog-git-merge.mjs:81`); no `MERGE_HEAD`, clean status |
| The same call at `c794b7f0` returned a structured `blocked`; consumed by decision 1 | Same spec in a detached temporary worktree at `c794b7f0` (removed) | Exit 1, stdout "…own result is accepted, but the merge could not be committed. Something unrelated to this file is still unresolved…", empty stderr, no `MERGE_HEAD`, clean status |
| Publication never merges an already-contained tip; consumed by the exclusion of publication changes for finding 1 | Read `history-preserving-publication.mjs:167` | `isAncestor(publishedTip, tracking)` returns `already-accepted` before `constructCandidate` |
| The publication stops carry the adapter's report, and the CLI prints the message, not the status word; consumed by decision 2 | Read `product-backlog-git-cli.mjs` (`console.log(outcome.message ?? outcome.status)`), `workspace-publication-push.mjs` `replaySuffix` and `:181-186`, `owned-suffix-reconciliation.mjs` `rebaseThroughAdapter`, `execution-increment-publication.mjs:55-70`, and `product-backlog-git-done-catalog.mjs` `commitRebuiltDoneCatalog` | Every failing status exits 1; the stop is `conflict` with `replay.stdout` holding the message, which for `catalog-uncommitted` says the replay completed and the rebuilt catalog is staged but not committed, and what to commit |
| Guidance gaps are as reported; consumed by slice 2 | `grep -rn catalog-uncommitted src/skills`; read `publication-rebase-conflict.md`, `publish-the-candidate.md:85-105,145-170`, `merge-conflicts.md:63-72,108-136` | `catalog-uncommitted` only in `merge-conflicts.md` and the adapter scripts; `publication-rebase-conflict.md:11` and `:28` as in finding 2; `publish-the-candidate.md:97,159` list conflict, refusal, disputed |
| No test asserts the edited guidance text except native evidence identity hashing `publish-the-candidate.md`; consumed by slice 2's proof selection | `grep -rln "publication-rebase-conflict\|catalog-uncommitted\|publish-the-candidate"` over `tests`, `src`, `scripts` excluding Markdown | Only native evidence scripts and retained native fixtures (paid, manual) |
| The merge adapter's real-CLI tests pass locally; consumed as slice 1's baseline | `npm test -- tests/support/product-backlog-git-merge.test.mjs tests/support/product-backlog-git-done-catalog.test.mjs` | Exit 0 |

## Proof and execution gates

Follow [tests/README.md](../../../tests/README.md). No paid or native host run.
Run lint for edited scripts and tests. Hosted CI owns the rest after
authorized publication.

- **Git adapters** (slice 1): the plan 276 Git adapters group —
  `npm test -- tests/support/product-backlog-git-merge.test.mjs
  tests/support/product-backlog-git-merge-ancestry.test.mjs
  tests/support/product-backlog-git-merge-conflict.test.mjs
  tests/support/product-backlog-git-merge-hook.test.mjs
  tests/support/product-backlog-git-merge-agent-credit.test.mjs
  tests/support/product-backlog-git-done-catalog.test.mjs` plus
  `src/skills/dough-story-wrap-up/scripts/closure-story-integration.test.mjs`,
  the history-preserving merge caller.
- **Guidance** (slice 2): the AGENTS.md behavior review of each edited
  reference, walking one done-record conflict in an adapter rebase and one
  `catalog-uncommitted` stop through the edited text; `tests/payload-declaration-links.sh`
  if a link changes.

| Correction promise | Owning slice / observable proof |
| --- | --- |
| An already-contained merge ends in a structured stop, no stack, nothing changed | 1: real merge CLI case in `product-backlog-git-merge-ancestry.test.mjs`, failing first |
| Publication guidance resumes adapter stops through the adapter and treats `catalog-uncommitted` as a finished replay to commit | 2: behavior review of `publication-rebase-conflict.md` and `publish-the-candidate.md` |

## Slices

### 1. Merging a ref the branch already contains stops with a structured report

Type: Behavior
Status: done
Accepted proof: the new real-CLI case failed first (exit 1, empty stdout,
the `MERGE_HEAD` crash), then passed with an early `blocked` return in
`mergeOperation`; the Git adapters group (with the ancestry file) passed and
lint passed. The refactor split the case, with the fast-forward case, into
`tests/support/product-backlog-git-merge-ancestry.test.mjs` (history-decided
outcomes) to keep the merge test file within size.
Proof: add a case to `tests/support/product-backlog-git-merge.test.mjs`: a
branch two commits ahead of `main` runs `merge --ref main` through the real
CLI → exit 1; stdout says the branch already contains `main` and nothing was
merged; stderr has no `Error:` or stack frame; no `MERGE_HEAD`; `HEAD`
unchanged; `git status --porcelain` empty. Watch it fail first with the
current stack trace. Run the Git adapters group and lint.

Behavior: the current branch already contains `--ref` and is ahead of it →
the merge adapter reports `blocked` with an accurate message and changes
nothing, instead of crashing.

Safe stopping point: the regression is fixed; guidance is unchanged.

### 2. Publication guidance resumes adapter stops through the adapter and names a staged catalog

Type: Behavior
Status: done
Accepted proof: behavior review walked (a), (b), and (c) through the edited
text; `tests/payload-declaration-links.sh` passed. The adapter CLI prints only
the message, so the guidance names `catalog-uncommitted` by its report's
"staged but not committed" wording and defers its commit to
`merge-conflicts.md`; every stop sentence covers any adapter result that exits
non-zero.
Proof: AGENTS.md behavior review of the edited `publication-rebase-conflict.md`
and `publish-the-candidate.md`: (a) a done record conflicts during the
adapter's owned-suffix rebase → the text leads to resolving it, `git add`, and
the adapter's `continue`, never `git rebase --continue`; (b) the adapter
reports the replay completed with the rebuilt catalog staged but not committed
→ the text leads to committing that catalog alone with developer credit,
taking the owned-branch tip as candidate, and revalidating, not to resolving a
conflict; (c) an ordinary backlog conflict and a `disputed` result read as
before. Run `tests/payload-declaration-links.sh` if a link changes.

Behavior: an agent publishing an owned suffix whose adapter rebase stops →
the guidance resumes every unmerged path through the same adapter's
`continue`, and recognizes `catalog-uncommitted` as a finished replay whose
staged catalog is committed before publication continues.

Safe stopping point: the correction is complete; retain this story and plan
for wrap-up.

## Cumulative review

Slice 1 adds one early return beside the existing fast-forward branch of the
merge adapter, reusing its computed merge base and existing `blocked` status.
Slice 2 edits two publication references to defer to `merge-conflicts.md`'s
existing adapter semantics. Each slice owns one observable outcome and its
proof; neither depends on the other. Refinement was not needed: no slice
combines independent outcomes, no Structure is required, and no numeric slice
target was supplied.
