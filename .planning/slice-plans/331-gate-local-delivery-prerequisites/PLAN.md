# Gate local prerequisites before commit and delivery

**Source:** [SEED-146 — Block commits and delivery after failed local prerequisites](../../seeds/SEED-146-gate-local-delivery-prerequisites.md#gate-local-prerequisites-before-commit-and-delivery).

**Identity:** SEED-146#gate-local-prerequisites-before-commit-and-delivery

## Goal and scope

A developer can rely on the maintained execution path to stop dependent commit
and delivery after a failed required local operation. The same path carries the
successful commit SHA into managed delivery, retaining project hooks, authorship,
owned/unowned work, publication authority, and legitimate interrupted-publication
recovery.

Cover project-required preparation (including triggered generation, formatting,
plan/status mutation, planned-work obligations, and staged whitespace checks),
commit refusal, exact-candidate delivery, and repair/resume. Missing required
context stops its dependent operation. Semantic proof acceptance and refactoring
retain their current owners. Commit success does not establish semantic proof.

Do not add a workflow engine, universal hook, execution ledger, global failure
history, shell parser, automatic semantic repair, exact-index lint redesign,
dashboard workflow, or release. No forced rollback or new observer/retry
lifecycle. Arbitrary direct shell operations outside the maintained journey
remain outside this gate. This plan authorizes no execution by itself.

## Architecture and PFE

The common rule is a success dependency within one attempt: execute an applicable
required operation, inspect its terminal result, then permit its dependent
operation. Keep the current project context and exact committed candidate as
inputs rather than inferring them from command output, HEAD alone, or a new
registry. Adapt the build-dependency mechanism compared in the seed; do not
introduce a build tool.

| Responsibility | Existing owner and decision |
| --- | --- |
| Which operations and proof apply | [Slice wrap-up](../../../src/skills/dough-execute-plan/references/wrap-up.md), runtime/project context, and proof acceptance. Resolve applicable operations before mutation; execute their mechanical portion in the guarded path rather than accepting unconditional caller success flags. |
| Commit and authorship | [Agent commit](../../../src/skills/dough-execute-plan/scripts/agent-commit.mjs) already awaits ordinary Git and reports refusal correctly. Reuse it where [agent-commits](../../../src/skills/dough-execute-plan/references/agent-commits.md) applies; preserve ordinary Git for other callers. Keep project hooks enabled. |
| Planned obligation validation | [story-obligations.mjs](../../../src/skills/dough-execute-plan/scripts/story-obligations.mjs) owns the interpretation. Invoke it; add no second obligation parser. Required plan mutation must itself succeed before dependent commit. |
| Fresh increment orchestration | Change the existing [managed delivery boundary](../../../src/skills/dough-execute-plan/scripts/execution-increment-delivery.mjs) and its taught entry path. This is the gap: preparation and commit results currently do not reach it. A small internal extraction is allowed when needed for this outcome; no separate generic workflow framework. |
| Exact candidate, authorized suffix, reconciliation and proof | Reuse [execution-increment-publication](../../../src/skills/dough-execute-plan/scripts/execution-increment-publication.mjs), `validatedCandidate`, [reconciliation](../../../src/skills/dough-execute-plan/scripts/execution-increment-reconciliation.mjs), and [applicable-candidate-proof](../../../src/skills/dough-execute-plan/scripts/applicable-candidate-proof.mjs). A later branch tip cannot replace a fresh commit receipt. |
| Recovery and observation | Retain [execution-increment-resume](../../../src/skills/dough-execute-plan/scripts/execution-increment-resume.mjs), [publication-resume](../../../src/skills/dough-execute-plan/scripts/publication-resume.mjs), and existing observer ownership. Fresh failure returns before invoking observation. Recovery reads retained candidate/base and actual remote acceptance. |

No other product owner found by the search provides the whole success-dependent
chain. The project hook protects its own checks, and the formatter owns terminal
failure for its tools; neither knows required plan updates or downstream
delivery. `trunk-closure-settlement.mjs` consumes managed delivery for an existing
closure commit, so a new fresh-work requirement must not accidentally force that
caller to invent a new commit or plan.

Follow [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
for one coherent owner and low change cost,
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) for source
and released-copy separation,
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) for
deterministic versus native acceptance, and
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
for runtime audience and shared guidance. No conflict found. The current
[North Star](../../NORTH-STAR.md) supplies no additional constraint on this
feature-local integration; leave it unchanged.

## Outside-in proof and ownership

Exercise the maintained installed entry point in disposable repositories and
local bare remotes. Use real preparation execution, obligations, Git commits,
publication, and observer machinery; replace only external tools/providers when
injecting failure. Observe hook/process invocation logs, HEAD, staged and
unstaged bytes, remote refs, and observer/registration state. A returned refusal
alone does not prove downstream operations were withheld.

| Source promise | Owning slice and observable proof |
| --- | --- |
| Required formatter/generator/tool failure; failed plan/status mutation; missing required inputs; nonzero, thrown or unterminated operation cannot permit commit | 1: enter the real fresh-work command, make the relevant prerequisite fail, and assert no commit hook invocation or new commit, with preparation edits preserved. Include a plan update that fails while product files otherwise pass checks; plan-file existence cannot pass it. |
| Planned obligation refusal and required staged whitespace failure | 1: real obligations check with an open obligation and real `git diff --cached --check` rejection stop commit. Planned context cannot omit its plan/slice to bypass the check; quick work needs no fabricated plan. |
| Git/hook refusal preserves recovery and authorship | 1: rejecting hook and Git failure retain HEAD and index; success observes the existing author/committer/trailer rules and actual hook execution. No hook bypass. |
| Failure blocks delivery and its observer, including when output is filtered | 2: run the fresh CLI through an output consumer whose exit is zero; verify no remote change, publication call, new observer, or registration after failed preparation/commit. Include an existing older HEAD that could otherwise be delivered. |
| Successful commit is the exact candidate; changed candidate cannot substitute | 2: successful route publishes/registers the returned SHA, then a controlled branch advance between commit and delivery produces the existing mismatch/refusal or proof-governed reconciliation, never silent substitution. |
| Preserve authority, modes, ordinary commit contexts, staged ownership and unrelated edits | 1 owns commit/index behavior; 2 owns local-only no publication/observation, authorized Trunk/Story Branch destinations, caller-selected checkout and owned repair integration. Assert unrelated bytes and refs remain unchanged; ambiguous staged ownership stops rather than unstaging someone else's work. |
| Repair/retry reuses still-valid proof and does not require another commit to resume publication | 1 owns repair of preparation; 2 owns retained successful candidate/base recovery, including a stopped publication. Observe the original candidate, no duplicate commit, applicable renewed proof only when reconciliation changes its boundary. |
| Lost response and already-published acceptance stay valid | 2: the bare remote already contains the retained candidate, including with a later remote tip; recover acceptance and existing observation without another commit/push. Empty/no-new-work recovery is distinct from a failed fresh attempt. |
| Portable shared runtime and truthful completion evidence | Each slice updates guidance with its behavior and checks deployed dependencies it changes. Slice 2 completes the representative authoring walkthrough, native-requirement handoff, and ODF-097 response/limits record. No deterministic result claims native follow-through. |

## Ordered slices

### 1. Required local preparation controls whether work can be committed
Type: Behavior
Status: done
Proof: Installed fresh-work CLI, local-only authority, real prerequisites,
obligations, Git and hooks; observe withheld commit after every failure and the
exact commit receipt after repair. The proof mapping above remains authoritative.

Resolve planned/quick context, applicable generator/formatter/summary, executable
plan/status mutation, selected obligations and owned staging before mutation.
Run direct argv commands to their terminal result in dependency order; compound
scripts own a meaningful exit. Missing context, nonzero, throw, signal or
unterminated operation must not permit commit. Check obligations before the done
mutation and again before commit. Preserve hooks, agent/ordinary authorship,
partial owned staging and unrelated bytes. Refuse ambiguous staging without
unstaging; retain recoverable edits/index and useful repair instructions.
Declare every deployed dependency and teach the shared source entry.

Focused proof: fresh-entry suite, agent-commit and story-obligations controls,
changed consumers and declared-payload checks via `npm test -- <files>`.
Safe stop: guarded local-only commit, pending publication; slice 2 owns the
complete failure-to-delivery guarantee. No release of this interim journey.
Sizing: one preparation-to-commit proof loop, no numeric limit; reassess any
need for a general task graph, ledger or independent policy redesign.

### 2. Deliver only the successful candidate and preserve publication recovery
Type: Behavior
Status: done
Proof: Installed fresh CLI reaches real managed publication/observation only
through successful prerequisite and commit results, with bare-remote acceptance,
exact candidate, changed-tip mismatch and retained-candidate recovery.

Carry the successful commit SHA and retained suffix/base into the existing
publisher before observation. Preserve authorization, local-only/caller checkout,
Trunk/Story Branch modes, current-branch, one-shot ordinary authorship and owned
repairs. Existing closure settlement and retained-result landing keep their
already-committed APIs; do not move unrelated Land/preparation operations here.
Keep mismatch, rejected-push reconciliation, renewed proof, actual remote
acceptance and resume with their existing owners. A failed fresh attempt never
becomes recovery merely because HEAD exists or no new work remains.

Align shared increment/repair, commit and recovery guidance and actual consumers.
Trace result fields, declarations and deployed fixtures. Observe no fetch/push,
observer or registration after filtered preparation/commit failure, exact SHA on
success, changed-tip refusal, stopped and already-accepted recovery without a
new commit or duplicate push, including later remote tips. Run affected complete
managed/publication/resume/closure consumer suites through `npm test -- <files>`;
check actual declaration/installer when dependencies change. Disable the new
gate in scratch, observe intended regression failure, restore and pass.

Complete AGENTS authoring walkthrough: invocation, required project context,
failed prerequisite → repair → successful publication. After delivery record
ODF-097 implemented response and limits without claiming recurrence resolved.
Link separate native acceptance before closure: installed failed prerequisite,
refused commit, repair/publication and already-published recovery, representative
shared cases plus explicit Codex/Cursor/Claude evidence/reuse. No implicit paid
runs. Functional closure may finish pending native acceptance; affected release
waits for it or a human-owned exception. Safe stop: complete deterministic
guarded journey, current guidance and tracked native acceptance; no new engine.

## Current decisions

- Explicit execution authorized on 2026-10-20; established start reused.
- Two Behavior slices share one attempt model; slice 2 owns the interim journey.
- Resolve project commands/context from the executing project; no Open Dough
  npm command or planning layout in runtime guidance.
- Commit/proof/publication/observation/readiness remain distinct; no new ledger.
- Edit `src/skills/` only. Coordinator uses selective `npm run format`, staged
  `git diff --cached --check`, and check-only `.githooks/pre-commit` lint/typecheck.
  Full hosted CI is not an additional local gate.

## Preparation evidence

Preparation observations at `f24c716fd8f289b70b5a65cb7002a5cf8f036503`
used disposable Git repositories, local bare remotes and real commit,
obligation, managed publication and observer machinery. Controlled formatter
exit 7 and plan-update exit 1, real whitespace exit 2 and obligations refusal
all permitted independently invoked later commit/delivery; rejecting hooks
retained HEAD/index but separate delivery accepted the older candidate.
Repeated delivery recovered already-published acceptance without another push.
These establish the orchestration gap, not defective helpers or native proof.
Full setup, literal control commands and qualified observations are recoverable
from this plan at `44bf5b369c7cee3f5091f454200c075784e72acd`.

## Learnings

The initial managed delivery establishes observation before calling publication.
Therefore adding a failure flag only in the lower publisher would leave the
story's no-observer-after-failed-fresh-commit example unfulfilled. Place the
fresh success dependency before the managed delivery call, while retaining the
existing already-committed and accepted-candidate recovery responsibilities.

## Execution context

Identity `SEED-146#gate-local-prerequisites-before-commit-and-delivery`;
publisher `dashboard-territory.local-open-dough`; agent `terry-chan`.
Story Branch Mode; reused owned checkout
`/Users/terryyin/git/open-dough/.worktrees/block-commits-and-delivery-after-failed-local-pr`,
branch `codex/block-commits-and-delivery-after-failed-local-pr`.
Remote `origin`, trunk `main`; increments target `refs/heads/codex/block-commits-and-delivery-after-failed-local-pr`.
Claim `2e26b32763bf0b3263305bfbd805ead2219c3e98`; accepted slice 1 and next base
`4a1fb686b9b30c83403172f017a0271879d5eb71` (suffix base: claim);
starting revision `44bf5b369c7cee3f5091f454200c075784e72acd`.
Node v24.21.0; locked `npm ci --ignore-scripts --no-audit --no-fund` and
`npm run --silent lint -- package.json` passed (lint selected the whole repo).
No numeric slice limit/replanning override. CI: verified GitHub `ci.yml` (`CI`), same-checkout installed runtime;
coordinator `seed146-terry-chan`, cell 13, session 63052,
`/tmp/dough-ci-501/watch-cGbcTb`, PID 97562. Trunk claim remains unobserved.
Accepted ADRs 0002/3/5/6 reviewed; source-only edits and separate native acceptance.

## Story obligations

### G1. Fresh publication and recovery await slice 2
Reported: slice 1 — "Remaining limits belong to slice 2: fresh publication, exact-receipt downstream delivery, output-filter failure observation, and retained-candidate publication recovery."
Story clause: "successful commit before delivery"
Disposition: proved by slice 2: installed fresh publication/candidate/recovery suites; exact receipt, withheld operations and retained acceptance observed.

### G2. Native follow-through remains unproved
Reported: slice 1 — "Native host follow-through remains unproved."
Story clause: "Keep native host requirements distinct from deterministic proof"
Disposition: proved by slice 2: SEED-053#guarded-local-delivery-prerequisites tracks pending host behavior and release condition separately; no native pass claimed.

## Accepted slice 1 proof

Installed fresh CLI observes real prerequisite/Git/index/hook/remote outcomes;
`execution-increment-fresh-test-fixtures.mjs` supplies disposable repositories,
bare remotes and controlled project programs. Fresh preparation, ownership,
authorship and commit suites assert retained bytes, withheld downstream work,
plan mutation, hook/signing refusal, repairs and exact successful commit metadata.
Request extraction preserves existing managed/closure/one-shot contracts.
Refactor proof passed (61778): `PATH="/opt/homebrew/bin:$PATH" npm test -- src/skills/dough-execute-plan/scripts/execution-increment-fresh.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-fresh-ownership.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-fresh-authorship.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-fresh-commit.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery.test.mjs src/skills/dough-execute-plan/scripts/symlinked-skill-entry.test.mjs src/skills/dough-execute-plan/scripts/one-shot.test.mjs src/skills/dough-story-wrap-up/scripts/trunk-closure.test.mjs src/skills/dough-story-wrap-up/scripts/trunk-closure-resume.test.mjs tests/payload-declaration-links.sh tests/install-public-payload.sh`.
Unchanged commit/obligation proof passed (26342): `PATH="/opt/homebrew/bin:$PATH" npm test -- src/skills/dough-execute-plan/scripts/execution-increment-fresh.test.mjs src/skills/dough-execute-plan/scripts/agent-commit.test.mjs src/skills/dough-execute-plan/scripts/story-obligations.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery.test.mjs src/skills/dough-execute-plan/scripts/symlinked-skill-entry.test.mjs src/skills/dough-execute-plan/scripts/one-shot.test.mjs src/skills/dough-story-wrap-up/scripts/trunk-closure.test.mjs src/skills/dough-story-wrap-up/scripts/trunk-closure-resume.test.mjs tests/payload-declaration-links.sh tests/install-public-payload.sh`.
Selective format passed after removing an unused test import; staged/hook gates follow.
Publication/native gaps remain G1/G2, owned by slice 2; slice 1 published/registered.

## Accepted slice 2 proof

Fresh publication/candidate/recovery suites use deployed `localFixture`/`freshApi`,
real Git/hooks/bare remotes/observers and controlled CI. Assertions inspect
withheld fetch/push/observer/provider calls behind filtered failures; exact commit,
receipt, remote and coverage; unrelated bytes; changed candidate, reconciliation
proof and throws; stopped/accepted recovery with later tips and no extra commits
or pushes; caller-owned Codex stream. Existing closure/one-shot consumers retain
already-committed APIs; renewed validation throws retain a proof-required stop.
Final focused run passed (80380): `PATH="/opt/homebrew/bin:$PATH" npm test -- src/skills/dough-execute-plan/scripts/execution-increment-fresh.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-fresh-ownership.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-fresh-authorship.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-fresh-commit.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-fresh-publication.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-fresh-candidate.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-fresh-recovery.test.mjs src/skills/dough-execute-plan/scripts/one-shot-guidance.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-delivery.test.mjs tests/payload-declaration-links.sh tests/install-public-payload.sh`.
Preserved consumer run passed (66254): `PATH="/opt/homebrew/bin:$PATH" npm test -- src/skills/dough-execute-plan/scripts/execution-increment-fresh.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-fresh-ownership.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-fresh-authorship.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-fresh-commit.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-fresh-publication.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-fresh-recovery.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-delivery-target.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-reconciliation.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-reconciliation-stops.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-resume.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-publication.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-publication-reconciliation.test.mjs src/skills/dough-execute-plan/scripts/publication-resume.test.mjs src/skills/dough-execute-plan/scripts/publication-resume-comparison.test.mjs src/skills/dough-execute-plan/scripts/symlinked-skill-entry.test.mjs src/skills/dough-execute-plan/scripts/one-shot.test.mjs src/skills/dough-story-wrap-up/scripts/trunk-closure.test.mjs src/skills/dough-story-wrap-up/scripts/trunk-closure-resume.test.mjs tests/payload-declaration-links.sh tests/install-public-payload.sh`.
Mutation: `PATH="/opt/homebrew/bin:$PATH" npm test -- /tmp/seed146-runner-mutation-jxargkwr/src/skills/dough-execute-plan/scripts/execution-increment-fresh-publication.test.mjs`.
Scratch disabled `!commit.ok`: exit 1 (35504), both filtered failures published
older HEAD/attached observation; restored identical full suite exit 0 (70054).
Scratch removed after judgment. Earlier direct-node experiment was replaced by
this required runner/environment observation, not counted as final proof.
AGENTS walkthrough inspected `fresh-increment.md`: invocation after proof/refactor,
explicit requirements/context, failed formatter/hook → repair → exact publication;
recovery separate. SEED-053 tracks all hosts and pending affected-release gate.
Refactor guidance proof passed (cd73ea): `PATH="/opt/homebrew/bin:$PATH" npm test -- src/skills/dough-execute-plan/scripts/execution-increment-delivery.test.mjs src/skills/dough-execute-plan/scripts/ci-supported-host-contract.test.mjs src/skills/dough-execute-plan/scripts/observer-owner-guidance.test.mjs src/skills/dough-execute-plan/scripts/shared-checkout-writers-guidance.test.mjs src/skills/dough-execute-plan/scripts/interrupted-delegation-guidance.test.mjs src/skills/dough-execute-plan/scripts/story-obligations-guidance.test.mjs`.
Only guidance/blank-line edits; all runtime/mutation/installation evidence retained.
Selective format passed after removing an unused test import; all changed files ≤250 lines.
