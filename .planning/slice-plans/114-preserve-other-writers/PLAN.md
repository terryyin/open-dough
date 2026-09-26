# Preserve other writers' work in shared worktrees

## Source

**Identity:** SEED-008#preserve-other-executions-work

[Story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#preserve-other-executions-work),
refined 2026-09-26. Supporting findings
[ODF-093](../../../docs/maintainer/finding-names.md#odf-093) and
[ODF-105](../../../docs/maintainer/finding-names.md#odf-105); ODF-084 is
excluded by the story.

## Goal and scope

Developers running concurrent agents keep every other writer's uncommitted
files and stash entries intact when an execution sets aside, restores, or
commits its own work.

Included:

- The CI repair pause saves and restores unfinished work through one installed
  script that touches only the stash entry it created.
- The delegation contract forbids delegated agents' own stash, pop, reset,
  clean, path checkout, and branch switch in the shared checkout.
- Coordinator commits isolate owned work by staging owned paths only, never by
  stashing or restaging a sibling writer's files.

Excluded: ODF-084 and any worktree-retirement change; cross-session writer
detection, locks, scheduler, takeover; native agent-behavior acceptance (ADR
0005 section 3 lets this story finish on deterministic tests and behavior
review; effectiveness is judged from later use through the near-term watch
list).

Assumptions:

- A `git stash push` failure can be reproduced deterministically in a fixture
  by holding the checkout's `index.lock` (the same abort Git gives any
  concurrent index writer). **Proved 2026-09-26** (Git 2.50.1, isolated
  fixture in a job temp directory): two worktrees of one repository, a foreign
  stash pushed from one, the other dirty with `index.lock` present;
  `git stash push --include-untracked -m mine` exited 1, `git stash list
  --format=%H` still held only the foreign OID, and the dirty change remained.
- The pause stays whole-tree (`--include-untracked`, never `--all`) as
  `ci-monitor.md` step 3 specifies today; the script changes who performs the
  steps, not the contract.

## Current decisions

- **PFE.** Reuse `publication-git.mjs` `git()` for process calls. No existing
  script stashes or restores; the only stash procedure is prose in
  `ci-monitor.md` "Analyze and repair" steps 3 and 5, which the script replaces.
  Wrap-up step 6 (`wrap-up.md`) already requires owned-path staging and
  delegation already says other agents' work must be preserved; slice 2 extends
  those two existing sentences instead of adding new sections.
- **Script shape.** `dough-execute-plan/scripts/ci-repair-stash.mjs` with
  `save --checkout <path> --label <text>` and `restore --record <file>`, JSON
  receipts on stdout. Save records branch, HEAD, staged/unstaged/untracked
  paths and the stack's previous top OID in a private record file it creates
  outside the checkout (mode 0600 under a fresh `mkdtemp` directory), then
  returns the record path. Status is `stashed` (new OID, differs from previous
  top, tree clean), `clean` (nothing to save, no stash), or `failed` (no OID
  recorded; stack untouched). Restore reads only the record: `clean` resumes;
  `stashed` runs `git stash apply --index <oid>`, verifies restoration, finds
  the current selector whose OID matches and drops only that entry; a conflict
  or missing OID keeps the entry and returns `conflict` / `missing` with paths
  and OID. No selector is ever assumed.
- **Payload.** Add the script to `install.sh`'s payload list beside the other
  `dough-execute-plan/scripts/` entries; payload-declaration tests cover it.
- **Guidance tests.** Prose checks follow ADR 0005 section 2: assert intended
  behavior with paraphrase-tolerant patterns, not exact sentences.

## Outside-in proof and verification

| Key example (story) | Proof |
| --- | --- |
| 1 Foreign stash survives a failed save | `ci-repair-stash.test.mjs`: two worktrees of one fixture repository; the other worktree pushes a stash; the execution worktree is dirty with `index.lock` held; `save` returns `failed` with no OID; `restore` of that record changes nothing; `git stash list --format=%H` still equals the foreign OID alone and the dirty files are unchanged |
| 2 Ordinary pause round trip | same file: staged, unstaged, untracked owned work plus a pre-existing foreign entry; `save` → `stashed`, tree clean; a commit lands; a second foreign stash is pushed so selectors shift; `restore` reapplies all three kinds (index state included) and the stack equals exactly the two foreign OIDs |
| 3 Clean tree | same file: clean worktree with a foreign top entry; `save` → `clean`; `restore` → resumed; stack unchanged |
| 4 Restore conflict | same file: saved work and the repair commit change the same line; `restore` → `conflict` naming path and OID; the entry is still on the stack |
| 5 Delegated agent baseline | guidance test on `delegation.md` + behavior review walk (below) |
| 6 Commit beside a sibling slice | guidance test on `wrap-up.md` step 6 + behavior review walk |

Focused commands: `node --test src/skills/dough-execute-plan/scripts/ci-repair-stash.test.mjs`
and `node --test src/skills/dough-execute-plan/scripts/execution-increment-delivery.test.mjs`
(its `ci-monitor.md` assertions move from the literal stash commands to the
script call). Full gate before each delivery: `npm test` and `npm run lint`.

Behavior review walk (AGENTS.md): as the coordinator of a two-slice parallel
execution with a foreign stash present, follow the installed guidance through a
CI failure pause and one increment commit; confirm each step reaches the script
or owned-path staging and nothing directs a stash of sibling files or a bare
pop. Record the walk's result in this plan.

## Ordered slices

### 1. Pause and restore touch only this execution's own stash entry
Type: Behavior
Status: done
Proof: `ci-repair-stash.test.mjs` cases 1–4 above, plus one `missing` case
(the recorded entry was dropped elsewhere: restore reports its OID, applies
nothing, and leaves the stack unchanged); updated
`execution-increment-delivery.test.mjs`; payload-declaration tests.

Accepted proof: `node --test` on `ci-repair-stash.test.mjs` (7 cases: the five
above plus `unclean` from submodule dirt beside owned work, and `ambiguous`
from submodule-only dirt where a successful push creates no entry; restore on
`ambiguous` does not resume), `execution-increment-delivery.test.mjs`,
`execution-increment-publication.test.mjs` (its repair round trip now calls
the script), and the six other `ci-monitor.md` guidance readers: 29 pass.
Payload tests `tests/payload-declaration-links.sh`,
`tests/install-public-payload.sh`, `tests/compare-payload.sh` pass under
Bash 5. Full `npm test` and `npm run lint` pass. A mutation dropping
`stash@{0}` fails the round-trip case.

Learnings: save statuses grew beyond the planned three. A successful push that
yields no single own entry must not report `failed` (which tells the
coordinator the work is still in the tree), so it reports `ambiguous`;
leftover dirt after a push reports `unclean`. Both stop with the record kept.
Untested limits: two new entries carrying the same label (needs a concurrent
push race), and the window between `stash list` and `stash drop` in which a
selector could shift.

Behavior: an execution checkout sharing its stash stack with another
worktree → the coordinator pauses for a CI repair and later resumes through
`ci-repair-stash.mjs` → its own work is restored and only its own entry is
dropped; on a failed save, clean tree, or conflict, every foreign entry and
the owned recovery copy remain.

Includes replacing `ci-monitor.md` steps 3 and 5's Git mechanics with the
script call and its receipt handling (keeping the quiescence, inventory,
no-nesting, and unresolved-repair rules), and listing the script in
`install.sh`.

### 2. Agents never improvise stash or reset in a shared checkout
Type: Behavior
Status: done
Proof: guidance assertions in a `dough-execute-plan` guidance test (paraphrase
tolerant) for `delegation.md` and `wrap-up.md` step 6; behavior review walk
recorded here.

Accepted proof: `node --test
src/skills/dough-execute-plan/scripts/shared-checkout-writers-guidance.test.mjs`
(2 pass; both fail against the pre-change references), plus the other
`wrap-up.md` readers; full `npm test` and `npm run lint` pass. Refactoring
folded the new step 6 sentence into its existing never-clause.

Behavior review walk (after slice 1 landed): coordinator of this two-slice
parallel execution, with foreign stash entries on the shared stack. Delegation
hands each slice agent the ban on stash, pop, reset, clean, path checkout, and
branch switch, with a separate temporary checkout or a report back for a
baseline; a CI repair agent is a delegated agent under the same ban. The CI
pause reaches `ci-repair-stash.mjs save` in step 3 and `restore` in step 5,
which never pops or assumes `stash@{0}`. The slice 1 increment commit was made
by staging slice 1's paths only while slice 2's files stayed unstaged,
unmodified, and unstashed, as step 6 now directs. No step directs a stash of
sibling files or a bare pop. The one remaining reset instruction,
`execution-decisions.md`'s permitted soft reset of an attempt-owned unpushed
commit, leaves the working tree and siblings' files alone.

Behavior: a delegated agent or coordinator working beside another writer in
the same execution worktree → it needs a baseline or must isolate its own
commit → it uses a separate temporary checkout or reports back, and commits
by staging owned paths only; the sibling's files stay unstaged, unmodified,
and unstashed.

Includes extending the "Ownership of the slice's changes" bullet in
`delegation.md` and step 6 of `wrap-up.md`, each by one sentence; the CI pause
remains the only sanctioned stash.

## Completion notes for wrap-up

On ODF-093 and ODF-105, record the mechanism addressed, response commit, and
first containing release, and start their near-term watch; ODF-084 stays open
as excluded (see the story).
