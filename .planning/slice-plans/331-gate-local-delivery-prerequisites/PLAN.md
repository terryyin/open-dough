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
Status: planned
Proof: Fresh-work CLI in local-only authority, through actual prerequisite
processes and Git, observes no commit after each failure and the successful
commit receipt after repair. Extend existing commit/obligation controls.

Behavior: Given accepted proof, resolved project requirements and owned changes,
invoking the maintained fresh increment operation executes required preparation
in dependency order. Terminal failure names the operation and its result, leaves
work recoverable, and stops before dependent staging/commit. With successful
preparation, owned staging and the ordinary project hook/commit contract produce
the exact commit receipt.

- Resolve the existing execution context, including planned versus quick work,
  triggered generation, formatter, required plan/status update and selected
  obligation check. Missing required context is a refusal, not an empty list.
  Keep human/agent semantic review outside the mechanical command.
- Run required commands directly with terminal result handling. Where an
  operation needs a compound script, require its own meaningful terminal
  result; do not implement a Bash parser or accept a trailing output filter's
  exit as that of the prerequisite. The maintained path must not build such a
  status-losing pipeline itself.
- Execute required plan/status mutations within this sequence, preserving
  their failure results. Reuse the obligation validator before the applicable
  done/commit transition. Keep quick work's no-plan behavior.
- Preserve owned staging boundaries and ordinary Git hooks. Delegate assigned
  workspace commits to `agentCommit`; keep ordinary-Git callers' existing
  authorship. A failure returns a usable recovery instruction without destructive
  rollback, speculative restaging, or a global latch.
- Teach this commit behavior in the shared runtime source, with any new runtime
  dependencies included in the declared payload and corresponding fixtures.
  Local-only success is committed/pending publication, not published.

Focused proof: Add the cohesive fresh-entry regression suite beside execution
scripts, covering the rows owned above, and run it through `npm test -- <file>`.
Run `agent-commit.test.mjs` and `story-obligations.test.mjs` when their contracts
or direct consumers change. Preserve hook tests as controls; change the project
hook only if independently necessary, not to replace the shared gate.

Safe stopping point: A usable guarded local-only commit operation and its
guidance. Publication still uses the existing separate entry path until slice 2;
this interim does not claim the story's complete failure-to-delivery guarantee
or permit release of the unfinished journey.

Sizing: One preparation-to-commit proof loop, including implementation, focused
proof and cleanup. No numeric slice target or hard limit is supplied. If the
operation requires a general task graph, persistent ledger or independent
project-policy redesign, reassess the approach before adding that machinery.

### 2. Deliver only the successful candidate and preserve publication recovery
Type: Behavior
Status: planned
Proof: The same fresh-entry CLI reaches real managed publication and observation
only after successful preparation/commit; local bare-remote acceptance, candidate
mismatch and retained-candidate recovery distinguish correct downstream effects.

Behavior: Given publish authority, a successful fresh operation passes its commit
SHA into existing managed delivery. A failure cannot invoke delivery or start
its observer. Interrupted delivery resumes the retained successful candidate
through the existing recovery owner, without repeating successful preparation
or creating another commit merely to retry.

- Complete the same operation's publish branch; perform the fresh prerequisites
  and commit before the call that establishes observation. Carry the actual
  successful receipt's SHA and existing suffix base, authorized checkout,
  branch, target, and observation context. Never reread an unrelated later HEAD
  as a replacement.
- Preserve the publisher's candidate-mismatch, rejected-push/reconciliation and
  renewed-proof contract. Recovery of an existing/accepted candidate takes the
  existing resume path and actual Git evidence; it is not classified by
  `HEAD exists`, an empty suffix, or a failed fresh commit alone.
- Align the taught increment/owned-repair journey in `wrap-up.md`,
  `trunk-publication.md`, commit and recovery references, and actual callers.
  Trace `deliverManagedExecutionIncrement`, its CLI, `validatedCandidate`,
  `agentCommit`, and any changed result fields through tests and fixtures.
  Preserve closure settlement, current-branch/one-shot work, host-supplied
  observation and local-only authority according to each consumer's purpose.
  Do not move unrelated Land/preparation operations into an execution workflow.
- Extend the existing deployed CLI fixtures and real local remote observations;
  use existing managed delivery, publication/reconciliation and resume suites
  for preserved behavior. If the payload dependency set changes, run
  `tests/payload-declaration-links.sh` and `tests/install-public-payload.sh`;
  inspect their real setup and assertions before claiming installation coverage.
  Copying source into a fixture alone does not prove a declared release contains it.
- Walk the runtime instructions under [AGENTS.md](../../../AGENTS.md):
  invocation context, project-required inputs, and a failed-prerequisite → repair
  → successful publication example. Record the ODF-097 implemented response and
  remaining limits after delivery, without declaring later recurrence resolved.

Focused proof: Run the fresh-entry regression suite and affected complete
managed-delivery/publication/resume consumer files through `npm test -- <files>`.
Inspect their actual setups and observations when selecting them. Include
`dough-story-wrap-up` closure settlement proof if the changed contract reaches
it, even though that consumer is outside execute-plan. Assert absence of
downstream work after failures, not only command exit status. Disable a new gate
in a scratch edit to confirm its regression test fails, then restore and pass.

Native acceptance handoff: The changed guidance's selection/follow-through is
unproved on Codex, Cursor and Claude Code. Before implementation closure, link
these requirements to a separate native acceptance story under ADR 0005 (reuse
an applicable active home, or record an unqueued candidate through the existing
story/backlog workflow). Require an installed failing prerequisite, refused
commit, repaired successful publication, and already-published recovery, with
representative shared cases and explicit per-host integration evidence/reuse.
Do not run paid native sessions implicitly or claim old publication evidence
proves the new choice. Functional implementation may finish with that linked
acceptance pending; an affected release waits for it or a human-owned exception.

Safe stopping point: One complete guarded execution journey with failures and
recovery proved deterministically, usable runtime guidance and tracked native
acceptance. No later workflow-engine or telemetry story is needed for its value.

Sizing: One commit-receipt-to-managed-delivery/recovery proof loop. Reuse the
existing publisher and observation lifecycle rather than rebuilding them.
No separate Structure slice is justified by current evidence.

## Current decisions

- Preparation-only request: do not Take or implement. Planned slices remain
  `planned`; execution starts only from a later explicit instruction.
- Two Behavior slices share one attempt model. The first delivers guarded
  local-only commits; the second completes publication with preserved recovery.
  The named interim belongs to slice 2 and is not a final scope exclusion.
- Project-specific commands and plan context are resolved from the project
  being worked on. Do not hard-code Open Dough's npm command or planning layout
  into published runtime guidance.
- Commit success, proof acceptance, publication acceptance, observer coverage
  and readiness remain different facts. Add no duplicate state authority.
- Source edits belong in `src/skills/`; leave installed managed copies unchanged.
  Follow the installed execution workflow's independent review/refactor and
  commit gates when authorized execution begins. In this repository, run the
  selective `npm run format` before staging, use `git diff --cached --check`,
  and let `.githooks/pre-commit` own staged lint and conditional typecheck.
  Hosted CI alone does not make the full suite a local gate.

## Decisive premises and observations

Observed on 2026-10-20 in
`/Users/terryyin/git/open-dough/.worktrees/block-commits-and-delivery-after-failed-local-pr`
at `f24c716fd8f289b70b5a65cb7002a5cf8f036503`, Node `v24.21.0`
(matching `.node-version`). Scratch source was removed before preparation writes;
fixtures and workers were cleaned up. No product implementation changed.

1. **The missing gate is outside successful lower-layer failure reporting.**
   `node .seed146-observe.mjs` constructed disposable repositories with
   `createManagedFixture`, configured agent authorship, staged `work.txt`, and
   deliberately invoked `agentCommit` and managed delivery after failures.
   Formatter substitute exit 7, plan-edit substitute exit 1 and actual
   `git diff --cached --check` exit 2 all still allowed commit/publication.
   An actual rejecting pre-commit hook produced `commit-failed`, unchanged HEAD
   and retained staged `work.txt`; subsequent delivery published the prior
   fixture SHA and attached observation. A further inline observation through
   `node --input-type=module` composed `story-obligations.mjs check --plan
   <fixture PLAN.md> --slice 4`, `agentCommit`, and managed delivery, using
   `story-obligations-test-fixtures.mjs`'s real open-obligation record and
   `createManagedFixture`. It observed exit 1 / `open-obligation`, then
   `committed`, `accepted`, the exact new SHA on the bare remote, and `attached`.
   Both fixtures and the observer were cleaned up. These deliberately independent
   calls reproduce the gap; slice 1/2 must prove the guarded entry prevents it.
2. **Publication and recovery can retain their current owner.**
   In that same scratch journey, each delivered SHA matched the bare remote,
   repeat delivery returned `already-published`, the observer was `reused`,
   and a `beforePush` counter stayed at one. This proves the constructed
   already-accepted case, not every resume variation or native follow-through.
   The fixture supplies an earlier unpublished commit and a controlled external
   CI adapter; real Git, publisher, observer and registration execute.
3. **The maintained local proof route works in this worktree.**
   Initial hook controls could not reach lint/typecheck because dependencies
   were absent. `npm ci --ignore-scripts --no-audit --no-fund` installed the
   locked packages. Direct control runs then passed (40 tests across seven
   files), but [tests/README.md](../../../tests/README.md) requires the runner.
   The runner initially refused system Bash 3.2; using Homebrew Bash resolved it.
   The following invocation passed all seven maintained control files; its
   scratch probe alone was refused for printing output despite its assertions
   passing:

   ```sh
   PATH="/opt/homebrew/bin:$PATH" npm test -- .seed146-observe.mjs \
     tests/support/pre-commit-lint-hook.test.mjs \
     tests/support/pre-commit-typecheck-hook.test.mjs \
     src/skills/dough-execute-plan/scripts/agent-commit.test.mjs \
     src/skills/dough-execute-plan/scripts/execution-increment-publication.test.mjs \
     src/skills/dough-execute-plan/scripts/execution-increment-publication-reconciliation.test.mjs \
     src/skills/dough-execute-plan/scripts/story-obligations.test.mjs \
     src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery.test.mjs
   ```

   Removing diagnostic printing, without changing the observed operations or
   success assertions, made
   `PATH="/opt/homebrew/bin:$PATH" npm test -- .seed146-observe.mjs`
   exit 0 silently. The scratch probe was then deleted. No repeated test was used
   to hide a product failure.

The control suites are evidence for existing protections, not proof of the
proposed gate. New-entry proof remains implementation work. Native behavior is
an explicitly separate acceptance requirement, not a cheap premise asserted
without observation.

## Learnings

The initial managed delivery establishes observation before calling publication.
Therefore adding a failure flag only in the lower publisher would leave the
story's no-observer-after-failed-fresh-commit example unfulfilled. Place the
fresh success dependency before the managed delivery call, while retaining the
existing already-committed and accepted-candidate recovery responsibilities.
