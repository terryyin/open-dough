# Complete one-shot work or admit its continuation

## Source

**Identity:** SEED-028#one-shot-work

[Refined story](../../seeds/SEED-028-track-ad-hoc-work.md#one-shot-work).
The developer accepted queued-story eligibility and automatic escalation with
continuation inside the original authorization. On 2026-09-27 the developer
asked to re-check this plan against the current product, redo its architecture
where needed, and then execute it. This revision re-binds the plan to the
delivered shared admission and current publication owners.

## Goal and scope

An explicitly requested, genuinely trivial outcome can be completed, verified and
published to remote trunk without a Taken announcement or lasting temporary
planning records. Both unlisted requests and queued stories are eligible. If the
attempt grows, preserve owned edits and valid proof, publish ordinary admission,
and continue within the original scope and authority.

One-shot is a tracking policy, distinct from planless execution and branching
mode. It applies at independently invoked work-entry workflows: direct contextual
work, bug investigation/repair, profiling/optimization, exploratory testing and
standalone review. Supporting work inherits its existing story. Already-Taken
work keeps its ordinary lifecycle; the option never erases published history.
Preparation-only requests retain existing keep/disposition rules. The option does
not grant permission to implement findings, publish drafts or expand scope.

Eligibility: one understood coherent outcome, no known need for multiple slices
or unresolved domain/architecture decisions, and a credible focused verification
path. A queued story whose recorded preparation carries a `not-ready` reason, or
whose plan has more than one slice, is not eligible. An ordinary test/fix loop
or short diagnosis may fit. Known larger work goes straight to normal admission;
newly discovered complexity, separate outcomes or failure to converge triggers
escalation before further substantive work. No universal time, line-count or
file-count limit is added.

Excluded: a one-shot registry, profile or dashboard state, hidden claims,
another publisher or execution engine, extra branch modes, completed-story
history, migration of existing identities, configurable size thresholds, and
redesign of ordinary CI, default-checkout coordination or preparation publishing.

## Architecture and existing solutions

Follow [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) and
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
one identity, direct domain mapping and one owner per responsibility. Follow
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) for evidence
reuse and native behavior proof, and [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
plus [AGENTS.md](../../../AGENTS.md) for agent-facing shared guidance. Proposed
ADR 0007 records the one-shot direction; its acceptance status is unchanged.

[One admission path for accepted work](../../NORTH-STAR.md#one-admission-path-for-accepted-work)
now names the owners below. No new ADR or architecture layer is needed.

| Responsibility | Owner and decision |
| --- | --- |
| Entry selection | `execution-start.mjs start --one-shot`: third entry beside Take and `--admit`, reusing `startRequest`, published-source reading and `selectOwnedWorkspace`; publishes nothing. `--one-shot` excludes `--admit`. |
| Shared meaning for callers | One new reference, `dough-execute-plan/references/one-shot.md`; `SKILL.md`, bug fixing, test optimization, manual testing and admission guidance link to it instead of restating rules. |
| Result publication and recovery | Existing managed delivery (`execution-increment-delivery.mjs`, `execution-increment-publication.mjs`, `execution-increment-resume.mjs`) with `previouslyPublishedBase` = the start's `startingRevision`. No one-shot publisher. |
| Queued completion | Existing `product-backlog.mjs complete` plus ordinary wrap-up cleanup rules, composed into the one result candidate. An ownership guard at the publisher's existing `beforePush` seam rereads fetched trunk after each reconciliation. |
| Growth | The startup command's admission claim, run in the same workspace after a carry step parks owned edits under a workspace-owned ref and returns the workspace to clean fetched trunk; edits are restored over the Take. Admission accepts a queued story, moving its entry to Taken without a readiness assessment. |
| Explicit no-replan | Existing oversized-slice no-replan stop, unchanged. |
| Completion, CI, retirement | Existing finish-or-stop and closure resource gates. |

### Decisive premises

| Premise | Observation (2026-09-27, trunk `9c02dc4a`) | Result |
| --- | --- | --- |
| Workspace selection can run without a claim | `workspace-publication-select.mjs:66-110` `selectOwnedWorkspace` fetches, validates or creates the worktree at fetched trunk, and commits nothing | Holds |
| Managed delivery needs no claim or profile | `execution-increment-delivery.mjs:15-60` requires only workspace, branch, previouslyPublishedBase, targetRef and repo | Holds |
| `beforePush` runs after every reconciliation, before each push | `execution-increment-publication.mjs:143-197`: attempt 0 after the initial rebase, attempt 1 after the rejected-push rebase | Holds; the guard can throw to stop |
| The admission claim needs a clean workspace at fetched trunk | `workspace-publication-claim.mjs:67-79` and `workspace-publication-select.mjs:69-91` refuse pending changes or a moved HEAD | Holds; growth needs the carry step |
| Admission refuses a queued story | `execution-admission-source.mjs` `readAdmissionSource`: "already queued on fetched trunk; start it as queued work" | Holds; slice 3 changes it |
| `complete` removes an entry from either list | `dough-product-backlog/SKILL.md:119-130`; `tests/support/product-backlog-complete.test.mjs` | Holds |
| Contextual missions always admit today | `dough-execute-plan/SKILL.md` Establish execution context; `references/execution-location.md:12-14` | Holds; one-shot is the only unclaimed exception |
| Focused proof commands run locally | `node --test` over admission, managed-delivery stop and backlog-complete tests: 11 pass in ~4.7 s | Holds |
| No one-shot code exists | Search of `src/`, `tests/`, `scripts/` for one-shot spellings: none | Holds |

The shared Git stash is visible to every worktree, so the carry step must not
use `git stash`; it records a commit object under a ref named for the workspace
branch.

## Outside-in proof

Use disposable Git repositories and local bare remotes through the existing
fixtures (`workspace-publication-fixtures.mjs`,
`workspace-publication-admission-fixtures.mjs`,
`workspace-publication-startup-test-fixtures.mjs`,
`publication-test-fixtures.mjs`). Drive the startup command and managed
delivery entry points; observe remote commit contents and history, backlog and
profile records, workspace bytes and default-checkout preservation. Never seed
the success state a case must prove.

New test file: `src/skills/dough-execute-plan/scripts/one-shot.test.mjs`,
run with `node --test src/skills/dough-execute-plan/scripts/one-shot.test.mjs`.
Split by scenario family if it grows past the project's file size norms.

For changed Markdown, walk invocation, required context and useful outcome under
AGENTS.md. Native cases in `tests/git-publication-native.sh` cost money: add
them as manual-only cases, run each at most once with the developer's
agreement, and record missing native evidence honestly before release.

## Ordered slices

### 1. Finish an unlisted one-shot request with only its result
Type: Behavior
Status: planned

Behavior: an unlisted, eligible request explicitly selects one-shot → the
startup command prepares an owned workspace at fetched trunk and publishes
nothing → the verified result goes through managed delivery → remote trunk
gains only the result, and the workspace retires after normal gates. A
supported no-change result publishes nothing and retires the workspace.

Add `--one-shot` to the startup command (request validation, mutually exclusive
with `--admit`, receipt `status: "prepared"` with `startingRevision`), refusing
an identity that fetched trunk lists as Taken. Write `references/one-shot.md`
(eligibility, entry, delivery, no-change, recovery through the existing managed
resume, and a placeholder growth stop until slice 3 that preserves edits) and
link it from `SKILL.md`, admission guidance and the entry skills. Without the
flag, contextual work still admits.

Proof: `one-shot.test.mjs` starts with no backlog entry, runs start
`--one-shot`, commits a real change, delivers, and asserts remote history since
start contains only that commit (no backlog, seed, plan or profile change) and
that the default checkout refreshed. Cases: no-change (no remote change, clean
retirement), `--one-shot` with `--admit` refused, missing push authority refused
with nothing created, Taken identity refused, and a lost push response recovered
through the existing managed resume without a duplicate commit. Run the
one-shot test plus `workspace-publication-admission.test.mjs` and the managed
delivery tests. Manual native case `publication/one-shot-result`.

Safe stop: unlisted one-shot success works; growth stops with edits preserved.

### 2. Complete a queued story in its own result commit
Type: Behavior
Status: planned

Behavior: an eligible queued story explicitly selects one-shot → its result,
backlog completion and spent story/plan removal form one candidate → remote
trunk shows them in one commit with no Taken transition; unfinished siblings and
unrelated queue order remain. A competing Preparing or Taken holder appearing on
trunk before either push attempt stops publication with the local candidate
preserved.

Extend start `--one-shot` for a Backlog-list identity: refuse when fetched trunk
shows a holder or a recorded `not-ready` reason. The multi-slice rule stays an
eligibility judgement in `one-shot.md`, not a plan parser. Add the queued
ownership guard to managed delivery (CLI flag naming the identity, wired to
`beforePush`), rereading the candidate's fetched trunk with the shared backlog
and profile readers. Document composing `complete` and spent-record removal
into the result commit in `one-shot.md`, keeping lasting product knowledge
before source removal. A queued no-change conclusion publishes the cleanup
alone.

Proof: extend `one-shot.test.mjs` with a queued story, its plan and an
unfinished sibling. Assert one accepted commit containing result and cleanup,
sibling and order intact, and no Taken in history. A remote Take, and separately
a remote Preparing announcement, pushed between start and publication, and one
landing only before the retry push, each stop with that holder intact and the
candidate preserved. An unrelated remote queue change survives reconciliation.
Run the one-shot test, `tests/support/product-backlog-complete.test.mjs` and
the managed delivery reconciliation tests. Manual native case
`publication/one-shot-queued`.

Safe stop: queued success and ownership races are covered; growth still stops.

### 3. Admit a growing attempt in its own workspace and continue
Type: Behavior
Status: planned

Behavior: an unlisted or queued one-shot attempt proves larger → owned edits
are parked and the workspace returns to clean fetched trunk → ordinary
admission publishes the story, Taken entry and profile in one commit from that
workspace → the edits are restored over the Take, and work continues through
ordinary planning under the same claim and the original authority.

Add a carry step to the startup command for `--admit` from a one-shot
workspace: record owned edits (tracked and untracked) as a commit under
`refs/dough/carried/<branch>`, reset the workspace to fetched trunk, run the
existing claim, then restore and delete the ref; a restore conflict keeps the
ref and stops for human judgment. Interrupted runs resume through the existing
`--starting-revision/--candidate-sha` recovery and finish the restore. Extend
admission to accept a queued identity by moving its existing entry. Replace
the placeholder growth stop in `one-shot.md` and route the oversized-slice quick
path through it; explicit `--no-replan` keeps the existing no-replan stop.

Proof: modify real files (including an untracked one) in a one-shot workspace,
escalate, and assert the admission commit carries only story, entry and
profile; the restored workspace bytes equal the pre-escalation bytes; one
identity and profile exist; continuation without `--admit` then reports
`existing`. Cover an unlisted and a queued source, an interruption after the
park and after the push, a restore conflict preserving the ref, and a
`--no-replan` stop. Run the one-shot test, the admission and admission-recovery
tests, and the admission continuation tests. Manual native case
`publication/one-shot-escalation`.

Safe stop: the full one-shot contract holds; success and growth share ordinary
publication and closure.

## Proof coverage

| Promise | Slice / observation |
| --- | --- |
| Explicit selection, one shared meaning, no implicit bypass | 1: start refusals and unchanged admission without the flag |
| Unlisted result or no-change without tracking history | 1: remote history since start |
| Queued result and spent records together, siblings preserved | 2: one accepted commit |
| Concurrent owners preserved, including during retry | 2: `beforePush` guard cases |
| Growth keeps edits and proof and admits atomically | 3: admission commit contents and restored bytes |
| Scoped continuation, no added authority | 3: `existing` continuation and no-replan stop |
| Delivery recovery without duplicates | 1: lost push response; 3: interrupted carry |
| Applicable skills work across hosts | Behavior review per slice; manual native evidence under ADR 0005 |

Author product guidance only in `src/skills/`; do not hand-edit installed
copies. If payload files are added, update declarations and reuse the existing
payload checks.

## Slice review and readiness

Three Behavior slices. Recovery joins the result slices because it reuses the
existing managed resume and admission recovery. Queued completion stays separate
from unlisted success because its cleanup composition and ownership guard differ.
The interim growth stop in slices 1–2 is replaced by slice 3 and is not reported
as the completed contract. No Structure slice is needed: every change extends an
existing owner.

No slice-specific concern remains. All decisive premises are observed above.

## Learnings

No execution learning; implementation has not started.
