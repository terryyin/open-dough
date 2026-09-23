# Complete CI observation without separate agent bookkeeping

Status: planned.

Identity: `SEED-008#self-ending-ci-observer`

Source: [refined story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#self-ending-ci-observer).
Terry accepted the narrower completion-operation outcome and made architectural
cohesion and concise agent instructions first-class requirements on 2026-09-23.
This request authorizes refinement and planning, not implementation or Take.

## Goal and scope

At execution and wrap-up completion, one operation owns the applicable CI wait
and local observer shutdown. The agent handles one truthful result instead of
performing a separate stop, process check, and coverage-report reading sequence.
Reuse the existing failure/repair path and cancellation authority. Preserve
retrospective overlap, exact target/revision attribution, inherited applicable
coverage, unresolved outcomes, and cleanup safety in both execution modes.

No idle timer: a quiet interval between slices is not completion. Retain the
existing ten-minute completion wait and eight-hour observer budget, with finite
local shutdown independent of CI waiting. Automatic startup/registration,
elimination of handles, session-end hooks, providers, path-policy changes,
shared observers, dashboards, publication changes, and release/version work are
outside this delivery. Later closure publications may still require setup.

## Current decisions and existing solutions

PFE inspected runtime, callers, host adapters, installed delivery, and tests at
`79856300d18e0b8e8811d2de7b1e5d2d88ce9f01`:

| Responsibility | Existing owner and decision |
| --- | --- |
| Applicable verdict and bounded reading | `src/skills/dough-execute-plan/scripts/ci-mailbox-await.mjs`: reuse `awaitRevision` and its exact/inherited evidence projection; do not duplicate applicability or add provider queries. |
| Completion command and shutdown | `ci-mailbox.mjs` in the same scripts directory already owns CLI dispatch and `stopMailbox`; compose these existing operations. Keep the read-only reader for its existing purpose; expose one completion action, provisionally `complete-revision DIRECTORY SHA`, rather than adding shutdown flags to every caller. |
| Evidence, delivery, and worker identity | `ci-mailbox-store.mjs`, `ci-mailbox-worker-process.mjs`, the Codex stream, and host hooks remain owners. Reuse or narrowly expose their shutdown/exit checks; no parallel registry or new evidence format for the same facts. |
| Lifecycle policy | `references/ci-monitor.md` owns when completion occurs and failure handling; `ci-completion-wait.md` supplies command/receipt mechanics. Callers and host adapters link to the shared rule. |
| Execution caller | `references/finish-or-stop.md` and retrospective handoff use the completion action without changing review or repair authority. |
| Closure callers | `references/trunk-publication.md` and `dough-story-wrap-up/SKILL.md` supply actual targets/revisions and gate resource deletion on completion evidence. |
| Proof | Reuse real mailbox/process fixtures, existing lifecycle tests, and `tests/git-publication-native.sh` execution-review and closure journeys. Extend observations, not a second harness. |

Unqualified paths above are within `src/skills/dough-execute-plan/`.
Read-only `await-revision` currently promises no shutdown; preserve that low-level
purpose and reuse it inside completion. Ordinary agents receive only the action
appropriate to their completion task, not a menu of interchangeable recipes.
The new action is a thin composition, not another lifecycle engine.

The completion receipt keeps CI evidence distinct from shutdown evidence. A
success or bounded unresolved result permits ending observation; it does not
turn unavailable CI into success. Validate mailbox/owner identity before any
mutation. Invalid identity never authorizes guessing or stopping another worker.
If shutdown cannot be confirmed, return the limitation and retain resources.

Failure is not completed work. Return it into existing handling with observation
still available for diagnostics and authorized repair. Coverage can precede the
failure event, so do not stop on the first failure verdict or acknowledge unseen
events. Already-delivered or unread actionable failures cannot be hidden by the
latest revision's green receipt. A human-judgment stop/cancellation uses existing
explicit stop; repair uses existing publication/registration and a later
completion boundary. No retry-until-green or automatic repair is introduced.

Normal completion must confirm local quiescence through shared runtime, including
the Codex stream and detached workers, without asking the agent to poll a PID.
A terminal JSON file alone is not proof that the process no longer uses the
checkout. Preserve unread evidence and delivery ownership through shutdown; late
records remain actionable through the established bridge/receipt boundary.

## Architecture and instruction acceptance

Follow the [North Star's remote-publication and CI ownership](../../NORTH-STAR.md):
publication acceptance, CI verdict, observer exit, and checkout cleanup retain
their separate meanings. No new architectural topic or ADR is needed.
Accepted [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
requires one coherent conceptual solution and less future judgment;
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
requires one authoritative, concise agent-facing rule.
[ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
requires standalone shared delivery, and
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
owns deterministic and native evidence. No relevant Accepted ADR conflict was found.

Review against [AGENTS.md](../../../AGENTS.md): edit `src/skills/`, never hand-sync
managed copies. If modularization adds a runtime dependency, declare and prove
its installed delivery through existing payload mechanisms. No version bump/tag.

Both slices must pass these non-behavioral checks:

- Trace completion policy from execution and wrap-up through adapters to runtime.
  One owner decides lifecycle behavior; callers supply context. Necessary host
  transport differences must not copy wait/stop/failure policy.
- Compare the before/after agent reading path: fewer routine commands and fewer
  repeated procedural decisions, with concise replacement instructions. Review
  failure, cancellation, recovery, and cleanup paths too. Count removed/additional
  directives and loaded prose as supporting evidence, not a word-count quota.
  Moving text to another file or adding reminders is not simplification.
- Walk representative success and failure uses with invocation context, required
  inputs, and useful outcome. Keep failure authority and truthful uncertainty
  visible. Static phrase matches cannot prove usability; revise brittle prose
  tests to permit equivalent concise phrasing.

## Ordered slices and proof ownership

### 1. Finish execution through one CI completion operation

Type: Behavior
Status: done

Behavior: delivered work reaches its execution/review completion boundary → the
agent invokes the shared completion action for its retained mailbox and accepted
SHA → success or unresolved CI and local shutdown are returned together, with no
separate shutdown command, process polling, or terminal-report read. A failure
returns to the existing diagnosis/repair owner without premature observer loss.

Implement the small composition and adopt it in execution, retrospective
handoff, and necessary host bindings as one coherent change. Keep old read-only
callers working while closure adoption follows in slice 2. Remove the execution
shutdown recipe when replacing it; do not append another optional workflow.

Proof:

- Extend real CLI/process tests alongside `ci-mailbox-await.test.mjs` and existing
  mailbox/stream lifecycle suites. Drive pending-to-success and already-terminal
  success; inspect the single receipt, terminal evidence, actual process exit,
  and preserved delivery state. No fixture-supplied shutdown is completion proof.
- Preserve exact and ignored-only inherited evidence; cover timeout, unavailable
  worker, unreadable evidence, wait cancellation, invalid identity, and bounded
  shutdown failure at the smallest sufficient boundary. Short deterministic
  injected clocks test bounds without changing production defaults.
- Drive failure coverage before diagnostic delivery, plus an unread earlier
  failure with a later green revision; prove actionable evidence reaches its
  owner and cannot be silently acknowledged or erased. Exercise authorized repair
  registration and its later completion using the same live observation owner.
- A gap between publications leaves observation alive; coordinator loss is still
  bounded by the existing budget; explicit stop remains isolated to its owner.
- Extend execution-review native journeys to observe one completion invocation
  and zero separate agent stop/process/report commands on normal completion.
  Assert retrospective overlap and skip-retro behavior remain intact. Observe
  product state before fixture cleanup: the existing runner's fallback stop must
  never turn a missing product shutdown into passing evidence. Include a failing
  assessor example whose observer remained alive until fixture teardown.

Focused commands (extend the suites rather than introduce a parallel runner):

```sh
node --test src/skills/dough-execute-plan/scripts/ci-mailbox*.test.mjs src/skills/dough-execute-plan/scripts/ci-*-lifecycle.test.mjs src/skills/dough-execute-plan/scripts/ci-completion-lifecycle-guidance.test.mjs
bash tests/git-publication-native.sh
bash tests/git-publication-native.sh --native codex --case execution-review/pending
bash tests/git-publication-native.sh --native cursor --case execution-review/ready
bash tests/git-publication-native.sh --native claude --case execution-review/failure
bash tests/product-backlog-payload-update.sh
```

Supplement native success for a host whose selected failure journey leaves its
new completion/shutdown behavior unproved; use `execution-review/ready`. Reuse
unchanged install/discovery evidence only with an explicit applicability check.
Normal and failure behavior must have evidence or justified reuse for all three
hosts; deterministic tests do not establish native agent behavior.

Safe stopping point: execution has the simpler completion contract; closure's
existing read-only wait and explicit stop still work. No later automation story
is needed for this benefit.

### 2. Close stories through the same completion contract

Type: Behavior
Status: planned

Behavior: wrap-up publishes its final accepted closure revision → it invokes the
same completion action on the matching observer → CI evidence and shutdown are
handled before owned-resource removal, without a separate closing procedure.
Story Branch integration uses trunk evidence; branch success is not reused as
trunk success. Intermediate closure publications introduce no wait.

Replace closure's wait/stop/report repetition with the shared contract. Preserve
existing matching-observer recovery or setup and target-change ownership; do not
add automatic startup. Consolidate remaining routine shutdown prose across
finish-or-stop, publication, wrap-up, and adapters. Keep explicit cancellation
instructions conditional and authoritative in one place.

Proof:

- Extend existing trunk-closure source/ignored-only and story-branch-closure
  journeys. Inspect the actual remote accepted SHA, mailbox target, completion
  receipt, worker exit, and checkout existence/order independently. Cover a new
  closure observer after execution ended, live matching reuse, and branch-to-trunk
  transition without duplicate or retargeted observers.
- Success and bounded unresolved CI retain their distinct meanings. Unconfirmed
  shutdown preserves the checkout; a failure follows existing repair/decision
  handling. No cleanup supplied by the harness may count as product cleanup.
- Complete the whole-path cohesion and instruction review above; compare the
  revised reading paths with the preparation base. Use the ordinary native prompts
  without supplying the expected command sequence. Assess semantic outcomes and
  command traces rather than exact prose.

Focused commands:

```sh
bash tests/git-publication-native.sh
bash tests/git-publication-native.sh --native codex --case trunk-closure/source
bash tests/git-publication-native.sh --native cursor --case trunk-closure/ignored-only
bash tests/git-publication-native.sh --native claude --case story-branch-closure/source-conflict
bash tests/execution-ci-runtime.sh
bash tests/product-backlog-payload-update.sh
npm run lint
git diff --check
```

Use focused deterministic cases for failure/timeout/cleanup safety; expand native
coverage only where these representative cases and existing evidence leave an
affected host requirement unproved. Missing required native evidence stays
unfinished; this plan does not waive it or authorize a release.

Safe stopping point: execution and wrap-up share one completion policy and receipt
contract; agents still own startup/registration, while routine shutdown bookkeeping
is gone. Resource and failure safety remain observable.

## Sizing, refinement, and readiness

Two cohesive Behavior slices; no standalone infrastructure or documentation slice.
The boundary separates independently useful execution completion from closure's
publication/cleanup proof. Each slice includes runtime as needed, concise guidance,
focused tests, and its native journey. No project numeric target or hard limit was
supplied; no timing exception or unvalidated S estimate is asserted.

Refinement review: retain both boundaries. Splitting code, prose, and hosts would
fragment the outcome; combining execution and closure would obscure their different
proof loops. All examples reuse one coverage and completion model. Failure is the
existing non-completion path, not a second observer lifecycle. No additional
Structure slice, speculative abstraction, or story resplit is warranted.

No unresolved product choice or blocking slice-specific concern was identified.
Process-exit confirmation, delayed diagnostics, and fixture masking are explicit
implementation obligations with mapped proof, not presumed passing results.
Reassess if these require a second lifecycle or substantial restart machinery;
that would invalidate the small-simplification rationale and require scope/priority
review before extending implementation. Readiness is preparation judgment only.

## Preparation context

Session-created workspace: `/Users/terryyin/git/open-dough-worktrees/plan-ci-completion`,
branch `codex/plan-ci-completion`, base `79856300d18e0b8e8811d2de7b1e5d2d88ce9f01`.
Originating/integration checkout: `/Users/terryyin/git/open-dough`.
Target for a later authorized keep/publication: `origin/refs/heads/main`.
No claim, implementation, commit, or publication is part of this preparation.
Plan root/layout recovered from this project's completed plans in Git; 078 is the
highest allocated entry observed, and 079 was checked absent before writing.

## Execution resume

Mode: Story Branch. Replanning permission: existing planning authority preserved
(no `--replan` or `--no-replan`).

Owned workspace: `/Users/terryyin/git/open-dough-worktrees/079-complete-ci-observation`,
branch `cursor/079-complete-ci-observation`, starting revision
`de32de87ff83d7175a065ae82d05b20a816f849a`, created for this execution.
Originating checkout and integration checkout: `/Users/terryyin/git/open-dough`.

Published claim: `1352844646ab35356446b9807fc6f9146ba25ea9` accepted on
`refs/heads/main`. `pendingCi: unobserved` — trunk is not the Story Branch
observer target. Default-checkout refresh: advanced to that same SHA.

Increment target: `refs/heads/cursor/079-complete-ci-observation`.
Observer: `/tmp/dough-ci-501/watch-9Auvy6`, GitHub Actions workflow `ci.yml`
display name `CI`, repository `terryyin/open-dough`, branch
`cursor/079-complete-ci-observation`. Checkout preparation: `npm ci` then
`npm run lint` passed in the owned workspace.

## Learnings and accepted proof

Slice 1 accepted. `complete-revision` composes `awaitRevision` and conditional
`stopMailbox` in `ci-mailbox-complete.mjs`. Success and bounded unresolved
outcomes shut down together; failure, unread actionable failure, and
`wait_cancelled` retain the observer. `await-revision` stays read-only. Closure
still uses its existing wait and stop until slice 2.

Accepted deterministic proof, rerun after the completion module extraction:

```sh
node --test src/skills/dough-execute-plan/scripts/ci-mailbox*.test.mjs src/skills/dough-execute-plan/scripts/ci-*-lifecycle.test.mjs src/skills/dough-execute-plan/scripts/ci-completion-lifecycle-guidance.test.mjs
```

Result: 70 pass. Observations live in
`ci-mailbox-complete-{success,retain,unresolved}-cases.mjs`. Setup is process
mailboxes and injected clocks. Eight-hour budget remains the assertion in
`watch-ci-execution-coverage.test.mjs`.

Accepted native execution-review observations under `/tmp/079-native-results`:
Codex pending `20260923T020631-0ea4`, Cursor ready `20260923T020438-65c2`,
Claude failure `20260923T020126-4284`, Claude ready `20260923T020306-1902`,
Codex failure `20260923T020844-119e`, Cursor failure `20260923T022352-734e`.
Each is one `complete-revision`, zero separate stop/await calls. Success shuts
the worker down; failure leaves it alive. `forced-stop` is false.
