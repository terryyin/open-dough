# Execution delivery keeps its observer owner

**Identity:** SEED-121#retain-execution-observer-owner
**Source:** [refined story](../../seeds/SEED-121-execution-observer-ownership.md#retain-execution-observer-owner).
**Prepared:** 2026-10-08, planning only, in the established preparation workspace
`/Users/terryyin/git/open-dough/.worktrees/register-trunk-delivery-with-its-own-execution-o`,
branch `codex/register-trunk-delivery-with-its-own-execution-o`, Preparing agent
`yilv-chan`. Reuse its assignment; do not announce another one. Starting revision:
`d78b5aa6601f237eb4018c11c4eb3674016cb1bb`. Publication destination when authorized:
`origin/main`; integration checkout: `/Users/terryyin/git/open-dough`.

## Execution

Story Branch Mode, taken by `ziqing-chan` (Claude Code). Execution checkout
`/Users/terryyin/git/open-dough/.worktrees/register-trunk-delivery-with-its-own-execution-o`
on branch `claude/register-trunk-delivery-with-its-own-execution-o`, published
to `origin` at that branch; trunk `main`. Claim `f9ddf723` on `origin/main`,
starting revision `0a846541`. Replanning follows existing planning authority.
Commands run with Node `24.21.0` from
`/private/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin` and
`/opt/homebrew/bin` first on `PATH`. CI source: GitHub Actions `ci.yml`.

## Goal and boundaries

An execution registers each accepted trunk increment or authorized repair on
its own observer and completes against that exact revision. Sibling worktrees
may share a repository and target without gaining each other's observation
ownership. Missing or unverifiable ownership remains a visible coverage gap
alongside an accurate publication receipt.

Include host-session resolution, retained Codex stream ownership, normal and
repair reuse, interrupted-registration recovery, sufficient legacy ownership,
and the existing closure caller of changed observation helpers. Preserve
cross-worktree access, Story Branch Mode target binding, host notifications,
acknowledgment, and completion/shutdown behavior. Closure integration is consumer
alignment for this ownership rule, not a new wrap-up outcome.

Exclude dashboard-owned CI monitoring, new CI discovery or transport behavior,
repair scheduling, and taking over another execution. No installation/update
or release is part of this plan. Modify published guidance in `src/skills/`;
leave this repository's installed managed copies to the released update path,
as [AGENTS.md](../../../AGENTS.md) requires.

## Existing solutions and direction

PFE responsibility: select and retain the coordinator that owns observation for
one published execution revision.

| Existing solution | Decision and evidence |
| --- | --- |
| `ci-host-hook.mjs` owner claim and binding | **Modularize the existing rule.** Its owner hashes repository checkout identity, host, session/conversation, and child identity. A mailbox's `owner` claim is exclusive. Share that meaning with managed selection rather than maintaining another fingerprint. Preserve Cursor's separate generation gate. |
| `ci-host-bridge.mjs` session resolution | **Reuse.** Explicit session input wins; ambient identity comes only from that host. Resolve it before looking for an owned observer, not after repository/branch reuse. |
| `ci-mailbox-location.mjs` access checks | **Reuse unchanged in meaning.** Common Git identity intentionally permits sibling-worktree access. It is an access boundary, not proof of the caller's ownership. |
| `ci-mailbox-match.mjs` discovery/classification | **Change selection.** Filter by verified owner before choosing or classifying liveness. Keep generic repository/target listing available for callers that need discovery; do not make a new owner-free fallback. |
| Codex yielded stream and observer note | **Extend the existing handoff.** Retain an explicit coordinator identity and exact receipt at arming, and supply them to delivery/recovery. No detached observer, new native-session lookup, or cross-cell store lookup is needed. |
| Managed-delivery and closure fixtures | **Reuse.** They install source into disposable project layouts, push to local bare remotes, use real workers, and expose coverage and completion. Their controlled provider is the only CI stand-in. |
| Dashboard launch/agent records | **Not an observer owner.** They describe assignments or launches and do not select this standalone execution's mailbox. The separate dashboard CI plan retains its own mailbox root. |

Follow [Remote history and optional local refresh](../../NORTH-STAR.md#remote-history-and-optional-local-refresh):
publication, execution ownership, checkout freshness, and CI coverage have
separate evidence. No North Star topic changes. Accepted
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) owns focused
cross-tool proof and native evidence; [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
owns shared guidance with only host adaptations. This is feature-local design
under [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md), with no new ADR
or conflict. Proposed ADRs 0007–0009 create no constraint.

## Current decisions

- One ownership rule applies to start, reuse, recovery, registration, and
  completion. Repository/branch, directory ordering, and a sole live candidate
  never substitute for ownership. Filter owner evidence first, then classify
  missing, ambiguous, ended, lost, or live observation.
- Cursor and Claude Code retain the current session/conversation and child
  identity contract, explicit precedence, and native generation behavior.
  Existing verified legacy `owner` claims remain usable without a new schema.
- Codex uses the existing observer note's stable coordinator value. Add an
  explicit `--coordinator <value>` at stream arming and retain that ownership
  on the mailbox before exposing its receipt. Delivery and recovery take that
  value plus `--observer-directory <exact retained directory>` from the note.
  Verify repository, target, stream identity, and ownership; an arbitrary
  detached observer or sibling handle cannot replace it. Reuse the shared
  owner meaning, with the Codex host discriminator. Do not depend on an
  undocumented ambient Codex variable. Update the note and copied bindings in
  the same slice as the new command input.
- Retain existing CLI forms for low-level mailbox operations. An old observer
  with adequate host ownership evidence can be selected; an unidentified old
  Codex stream reports recovery input rather than being adopted. No automatic
  legacy takeover or replacement launch is part of resume.
- Owner evidence must survive the existing closure's management-context rerun
  after its worktree is retired. Reuse the retained receipt/owner and repository
  context; do not recompute ownership from a now-missing checkout path or scan
  sibling coverage to guess it.
- Source commands and receipts must carry the owner through their callers.
  A fixture may supply two existing observers as starting conditions, but
  cannot manually register the delivered revision or seed its success result.
- Independent branch discovery is preserved. An observer with no registered
  revisions currently considers all matching branch runs. Both coordinators
  can therefore receive independently discovered branch diagnostics. Prove
  registration attribution and mailbox-specific acknowledgment, not global
  exclusivity of branch events. Repair ownership still follows `ci-monitor.md`.

## Observed premises and consumers

The observations use this workspace at `d78b5aa6`, Node `v24.5.0`, and local
fixtures only. This is a product-supported Node runtime, not the contributor
pin `24.21.0` in `.node-version`; execution verification must select that pin
under [native setup](../../../tests/native-setup.md). No CI-platform or native
agent behavior is claimed by these local results.

Fetched `origin/main` is `db9026fade984650bf6573d7d252d544b3c1bd97`.
`git ls-tree -r --name-only origin/main .planning/slice-plans` showed the highest
allocated plan as 279. Plan 280 was absent locally immediately before writing.
`git diff --stat HEAD origin/main -- src/skills/dough-execute-plan src/skills/dough-story-wrap-up .planning/NORTH-STAR.md AGENTS.md`
returned no changes in the inspected product/guidance basis.

| Premise and operation that consumes it | Observation and result |
| --- | --- |
| Concurrent managed delivery can select a sibling, breaking the publisher's completion gate; slices 1–3 depend on the diagnosis | `node .planning/slice-plans/280-execution-observer-ownership/observe-concurrent-ownership.mjs` installs two sibling-checkout runtimes, starts real observers, binds distinct Claude sessions, assigns the publisher the later-sorting directory, and runs installed `deliver` through `deliverThroughCli`. Remote acceptance matches the receipt, but the sibling gets registration and the publisher has none. Calling `completeRevision` on the publisher returns `missing_registration`. Fixture teardown stops both workers before removal. |
| Session binding allows access across worktrees while distinguishing coordinator and child; slice 1 reuses it | Reading `ci-host-hook.mjs` traces `checkoutIdentity` → host/session/child hash → exclusive `owner` file → owner binding list → per-mailbox progress. The full `ci-host-hook.test.mjs` passed, including cross-worktree ownership and child rejection. The observation script also checks that a publisher hook does not acknowledge the sibling mailbox. |
| Unregistered observers can independently discover branch failures; proof must not add filtering policy | The two-observer run delivered failure diagnostics to both coordinators. Reading `watch-ci-execution.mjs` shows that zero registered SHAs uses all matching runs, while registered SHAs constrain actionable attempts. This explains the observation; no provider/filter redesign is needed. |
| Exact accepted SHA survives reconciliation; slices 1–3 reuse publication and registration | The full `execution-increment-managed-delivery-reconciliation.test.mjs` passed. Its second delivery consumes the first `needs-validation` candidate, observes bare-remote acceptance, and asserts coverage contains the reconciled SHA, not the original candidate. |
| Codex's real stream is usable through installed delivery and completion; slice 2 changes its ownership handoff | The full `execution-increment-managed-delivery-codex.test.mjs` passed through `deliverThroughCli` and `createCodexReplay` with the installed stream. `ci-codex-completion.test.mjs` passed real stream identity checks and exact success/failure shutdown. Its injected coverage isolates completion only; it does not prove provider-driven green completion after delivery. Slice 2 supplies that missing combined journey. |
| Resume and closure have distinct owner-discovery consumers; slices 3–4 must align them | Product-wide `rg -n 'findLiveMatchingMailbox\|classifyMatchingObservationOwnership\|isLiveMatchingMailbox\|listMatchingMailboxes\|checkoutIdentity' src dashboard tests` found ordinary delivery/recovery, hook binding, and `trunk-closure-settlement.mjs`. Reading closure shows managed delivery for a new closure and separate mailbox selection/accepted-SHA recovery for reruns. Existing closure suites passed, including ended-observer reuse and rerun after worktree removal. |

Literal baseline suite commands, both passed through the required runner:

```sh
PATH="/opt/homebrew/bin:$PATH" npm test -- \
  src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery.test.mjs \
  src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-codex.test.mjs \
  src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-reconciliation.test.mjs \
  src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-resume.test.mjs \
  src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-resume-ownership.test.mjs \
  src/skills/dough-execute-plan/scripts/ci-host-hook.test.mjs \
  src/skills/dough-execute-plan/scripts/ci-codex-completion.test.mjs

PATH="/opt/homebrew/bin:$PATH" npm test -- \
  src/skills/dough-story-wrap-up/scripts/trunk-closure.test.mjs \
  src/skills/dough-story-wrap-up/scripts/trunk-closure-resume.test.mjs \
  src/skills/dough-story-wrap-up/scripts/trunk-closure-rebased-rerun.test.mjs \
  src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-session.test.mjs
```

Searches for `execution-increment-delivery`, `execution-increment-resume`,
`CI_OBSERVER`, `session-json`, and the matching exports included production
scripts, tests, and native harnesses. Besides the direct tests above, changing
the handoff reaches managed-delivery gaps/reconciliation-stop/resume-lifecycle
tests, `ci-host-hook-process` and lifecycle tests, Codex lifecycle/guidance tests,
and `tests/support/trunk-closure-native-*` / `ci-completion-native-*`. There are
no feature files in this repository; shell native families are the outer
consumers. Do not count their substitute/replay runs as fresh native evidence.

## Outside-in proof ownership

| Source promise | Owner and observable proof |
| --- | --- |
| Examples 1–2: owner-selected delivery and repair, accepted reconciled SHA | Slices 1–2: installed CLI, two real owners of the same repository/target, exact coverage/remote receipts, repeated delivery, and provider-produced completion. |
| Example 3: legitimate cross-worktree access without sibling ownership | Slice 1's host boundary and slice 2's retained stream handle are used from another same-repository checkout; foreign coordinator evidence cannot acquire them. |
| Example 4: establish only the publisher's observation or report a gap | Slice 1 starts a new bound host observer when only a foreign one exists; slice 2 reports an unarmed/unverifiable Codex gap. Both retain accepted publication and leave sibling coverage/process untouched. |
| Examples 5–7: exact owned recovery, legacy evidence, ambiguity, ended/lost state | Slice 3: installed `resume`, bare-remote push count, registration counts, retained owner/liveness, and explicit gap receipts with sibling workers still alive. |
| Existing closure consumer preserves completion and safe retirement | Slice 4: installed `finish`, own accepted final SHA, one completion receipt, sibling worker/coverage/progress intact, and management-context rerun after retirement. |
| Notification routing, child boundaries, acknowledgment and shutdown | Slices 1–2 consume their own failures at real hook/stream boundaries. Before invoking the sibling boundary, inspect its unchanged delivery progress. Complete the publisher against provider-produced success, confirm only its worker ended, and retain sibling evidence. |
| Shared target and publication contracts remain intact | Each changed boundary runs its full affected suites, including Story Branch Mode, explicit/ambient session precedence, malformed input, reconciliation validation, and accurate accepted-but-unobserved receipts. |

## Ordered slices

### 1. Host-session delivery registers on its coordinator's observer
Type: Behavior
Status: done
Proof: Extend installed managed-delivery concurrency proof for Cursor and Claude
Code, using real owner claims and a controlled provider. Observe accepted SHA
registration, host failure delivery/acknowledgment, repair reuse after target
advance, and completion on the publisher while its sibling stays live.

Behavior: Two host coordinators have live observers of the same repository and
target → one publishes through its own `deliver` command → its owner is resolved
before reuse and only its observer receives registration. When only a foreign
observer exists, establish a new observer for the publisher when its bridge is
ready; missing identity/readiness leaves acceptance with an ownership gap.

Extract only the hook's established owner computation/claim access needed by
managed selection, preserving generation semantics and child identity. Keep
mailbox access based on the repository. Include cross-worktree use, explicit
identity precedence, unidentified legacy rejection, verified legacy host reuse,
and owner ambiguity in this same selection loop. Update the current host
guidance at its authoritative home. Run the full managed-delivery/session/gaps,
hook/process, and affected host lifecycle suites, not only the new case.

Safe stopping point: Cursor/Claude delivery is owner-aware with its regression
proof green. Codex's existing discovery gap is explicitly unfinished until
slice 2; do not claim the story complete.

Accepted proof: `npm test -- src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-owner.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-owner-gaps.test.mjs`
(six tests at the installed `deliver`, hook, and `complete-revision` boundaries;
setup in `execution-increment-managed-delivery-owner-test-fixtures.mjs` supplies
only starting observers and claims). Consumers passed: every
`dough-execute-plan`, `dough-story-wrap-up`, `dough-manual-testing`, and
`dough-land` script suite, and `tests/*.sh tests/support/*.test.mjs`.

Learnings for remaining slices:

- `ci-observer-owner.mjs` holds the one owner meaning: `observerOwner({root,
  host, session, child})`, `hostInputOwner`, `readOwnerClaim`, `claimMailbox`.
  `classifyOwnedObservation` in `ci-mailbox-match.mjs` filters by claim, then
  returns the resume classifier's kinds. The Codex branch of
  `establishObservation` is the last `findLiveMatchingMailbox` caller.
- The owner hash includes `checkoutIdentity(root)`. Slice 4's rerun after
  worktree retirement computes it from retained repository context.
- Delivery receipts gained `observation.ownership` (`unidentified`,
  `ambiguous`) and `observation.directories`.
- A claim written without the hook's `owner-<hash>/` binding is selectable by
  delivery but receives no hook notifications; reuse does not rebind.
- The native trunk-closure fixture now claims its pre-started observer for a
  fixture coordinator session and records `Observer owner session:`; its
  substitute passes that as `--session-json` to `finish`. Slice 4 owns whether
  a native agent can supply that input.
- Native evidence pending for this slice: no native Cursor or Claude Code run
  of concurrent delivery, repair, and completion exists, and retained
  trunk-closure and git-publication evidence identities changed with the
  hashed modules. Taught inputs for these hosts are unchanged. Native runs are
  paid and manually triggered only.

### 2. Codex delivery retains its coordinator's yielded stream
Type: Behavior
Status: done
Proof: Extend `execution-increment-managed-delivery-codex.test.mjs` through the
installed stream and delivery commands, with two live streams and retained
coordinator/directory receipts. Use controlled-provider results for one delayed
failure, an owned repair, and green completion; no fixture-written success
coverage or manual registration after `deliver`.

Behavior: A Codex coordinator arms and records its stream → delivery or repair
passes that retained identity and exact directory → only that stream registers
the accepted revision, not the sibling that sorts first. Missing, foreign,
unidentified legacy, wrong-target, detached-worker, or conflicting input reports
the ownership gap without replacing a stream or erasing remote acceptance.

Add the coordinator input to stream arming and the exact observer handoff to
delivery using the shared ownership rule. Align the copied yielded-cell binding,
observer note, `trunk-publication.md`, `wrap-up.md`, and fixtures in this slice.
Keep exact worker/session/cell handles and acknowledgment behavior. Test absent
input even when a single foreign stream is live. Run the full Codex delivery,
stream/lifecycle/completion, supported-host/guidance, and affected CLI suites.

Safe stopping point: Normal delivery and repairs for all supported hosts use
verified owners. Interrupted recovery remains unfinished until slice 3.

Accepted proof: `npm test -- src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-codex.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-codex-owner.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-codex-owner-gaps.test.mjs`
at the installed `stream`, `deliver`, `acknowledge`, and `complete-revision`
boundaries with the documented yielded cell; setup in
`execution-increment-managed-delivery-codex-test-fixtures.mjs` supplies only
armed streams and the retained inputs. The slice 1 consumer sets passed again.
The `lost` and `unavailable` stream gaps have no direct observation.

Learnings for remaining slices:

- `stream --coordinator VALUE` claims the mailbox before its receipt;
  `deliver --host codex` requires `--coordinator` and `--observer-directory`
  and verifies them through `classifyRetainedStream` in `ci-mailbox-match.mjs`
  with `codexStreamOwner`. `findLiveMatchingMailbox` is removed.
- `resume --host codex` and closure `finish --host codex` still select by
  repository and branch. `finish --host codex` forwards only host and session,
  so a Codex closure delivery reports an `unidentified` gap until slice 4
  passes the coordinator and directory through, including its rerun path and
  the `finish` synopsis in `wrap-up-closure-publication.md`.
- The native trunk-closure fixture pre-starts a detached observer; a Codex
  closure journey needs a `stream --coordinator` fixture and note fields.
- `ci-mailbox.mjs`, `execution-increment-observation.mjs`, and
  `execution-increment-delivery.mjs` are within a few lines of the 250-line
  limit, and each new payload module needs an `install.sh` entry.
- Native evidence pending for this slice: retained Codex process evidence
  (plan 203's observer note; ODF-202 occurrences in
  `docs/maintainer/near-term-watch-list.md`) shows a real coordinator keeping
  its stream directory and a self-chosen coordinator value in the note. No
  native Codex run of `stream --coordinator`, of `deliver --coordinator
  --observer-directory`, or of concurrent delivery exists. The manual probe:
  arm the documented cell with `COORDINATOR` set, confirm `<directory>/owner`
  after the first yielded output, deliver with both inputs, expect
  `observation.state: "reused"` on that directory, then repeat with a second
  coordinator's stream live on the same target.

### 3. Interrupted delivery recovers only the retained owner
Type: Behavior
Status: planned
Proof: Extend installed resume proofs with two owner-bound live mailboxes,
an accepted but unregistered SHA, and owner-specific ended/lost/ambiguous or
legacy cases. Observe zero extra pushes for accepted work, exactly one coverage
entry on its owner, unchanged unread evidence, and sibling survival.

Behavior: Remote already contains an execution's increment, but registration
was interrupted → `resume` consumes the same retained host/coordinator/observer
evidence as delivery → it verifies acceptance, recovers that owner, and registers
the accepted SHA once. A live sibling cannot disguise the publisher's missing,
ended, lost, mismatched, or ambiguous ownership.

Carry explicit session input and host-specific ambient precedence through the
resume CLI and internal request. Apply owner filtering before liveness
classification; do not choose by revision coverage alone or start a replacement.
Preserve informative terminal/loss receipts and accurate publication state.
Update the recovery instruction with the input callers must retain. Run the
full managed resume, ownership, lifecycle, and reconciliation-stop suites plus
the delivery consumers of the shared selector.

Safe stopping point: Delivery and interrupted registration preserve their owner
across hosts; the closure consumer is still pending slice 4.

### 4. Closure consumes the same owner through completion and retirement
Type: Behavior
Status: planned
Proof: Extend the existing installed `finish` suites with sibling observers,
including an accepted closure missing registration, already-ended successful
completion, rebased final SHA, and a rerun from management context after the
execution worktree is gone. Inspect push count, own completion/shutdown,
retirement ordering, and untouched sibling coverage/progress/process.

Behavior: Closure publishes or resumes the execution's final accepted revision
→ its existing managed-delivery and recovery calls retain the execution owner
→ completion and cleanup use only that owner. Lost ownership reports accepted
publication with an unresolved coverage obligation and preserves the workspace
when the existing completion gate requires it.

Align `trunk-closure-settlement.mjs`, `trunk-closure.mjs`, and their CLI/guidance
with the selected ownership contract, including the retired-worktree rerun.
Keep the current acceptance, completion reuse, refresh, and safe retirement
rules; this is not a new closure protocol. Run all closure and rebased-rerun
suites and managed-delivery consumers. Reassess the installed native closure
and completion harnesses because they supply observer handoff inputs; align
those inputs and their observations/counterexamples when needed.

Safe stopping point: All source promises and known shared consumers have owned
proof. Execution completion still follows the normal execute-plan workflow.

## Verification, native evidence, and execution gates

Run focused suites through `npm test -- <paths>` with Bash 5 first on PATH,
per [tests/README.md](../../../tests/README.md). Use the pinned Node for execution;
the planning observations above do not replace that prerequisite. Keep fixture
changes, implementation, proof, and cleanup in the owning slice. If a shared
fixture or owner contract changes, run all its affected consumers found above;
that is the reason for broadening beyond the new regression test. Hosted CI's
whole-suite configuration alone is not a blanket local gate.

Each slice includes the installed execute-plan's proof acceptance, independent
post-change refactoring, and coordinator-owned delivery/review gates. The
tracked [pre-commit hook](../../../.githooks/pre-commit) checks staged lint.
Planning authorizes none of Take, implementation, commit, or publication.

Native proof is required for changed taught ownership inputs on each affected
host, or justified reuse with matching source/adapter/harness evidence under
ADR 0005. Existing single-owner replay and substitute results do not prove
concurrent native use. In slices 1–2, first assess available native evidence and
the actual host input/receipt route; if obtaining a missing input requires a
paid native session, make that the slice's first bounded probe before dependent
implementation. For Cursor/Claude, use the existing installed session-input
route and inspect the mailbox owner it binds. For Codex, consume the current
stream's emitted receipt into the coordinator's retained note and use its exact
directory in a supported mailbox operation; this observes handle handoff, not
the new delivery flags before they exist. Never claim that probe proves the
final managed-delivery journey. Stop dependent work
and revise this plan if it cannot supply the retained identity without borrowing
another host or relying on unavailable store state.

Reuse the native publication family's fixture/run/observe/assess boundaries;
extend a representative installed concurrent delivery/repair/completion case
instead of creating a full host-by-scenario matrix. Fresh native runs remain
opt-in under [native publication](../../../tests/native-publication.md); this
planning session runs none. Leave missing native evidence pending in its
owning slice or linked acceptance work before release, never label replay or
direct API execution as native agent acceptance. Slice 4 reuses sufficient
closure/retirement evidence or obtains only proof its handoff changes invalidate.

## Sequence review and sizing

No numeric slice target, hard limit, or repeated-overrun threshold was supplied.
Each slice has one owner-preservation journey and one focused proof loop,
including implementation, refactoring, caller alignment, and cleanup. Slices 1
and 2 separate the already-bound native hook from the explicitly retained
yielded stream; slice 3 isolates interrupted-registration recovery, and slice 4
isolates the closure/retirement consumer. They share one owner model, not four
matchers. No separate preparatory Structure slice or generic owner framework is
needed. Native waits retain their opt-in authority and bounded harness behavior.

Refinement was not needed after construction: the four boundaries keep those
distinct lifecycle risks without separating implementation from its proof.
This review found no remaining slice-specific concern. The native input premise
has an early bounded probe in its owning delivery slice where existing evidence
is insufficient. No human goal, scope, or ADR decision is open. Assess readiness
against this plan and the current seed digests; the assessment grants no
execution authority.
