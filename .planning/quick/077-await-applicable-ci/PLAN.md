# Await applicable CI with bounded, quiet completion

Status: planned; not taken; implementation is not authorized.

## Source, authority, and outcome

Identity: `SEED-008#wait-for-applicable-ci-before-advancing`

Source: [refined story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#wait-for-applicable-ci-before-advancing).
Terry authorized feasibility analysis, story refinement, slice planning, and
plan refinement on 2026-09-22. This does not authorize execution or publication.

Outcome: the same agent can review delivered implementation while its existing
CI observer runs. At review completion (or execution completion when review is
skipped), one quiet bounded wait returns the applicable verdict or an explicit
exception. Wrap-up applies the same contract to its published result, including
source changes made during integration. Failure ends waiting and returns to
existing handling; the waiter never retries until green.

## Current decisions and boundaries

- Follow the execution's retained accepted SHA and actual publication target.
  The caller supplies that revision, not the newest branch tip or the
  lexicographically last coverage filename. Reuse the existing applicability
  decision for ignored-only revisions. Never invent a successful skipped run.
- Use one observer per active target/owner, and the same coordinator during
  review. A local wait reader is not a second CI observer: it reads the existing
  mailbox, makes no provider calls, and neither registers nor consumes events.
- Provisional duration: 10 minutes from the final wait invocation, or earlier
  termination of observation. This is an explicit planning assumption awaiting
  Terry's optional preference, not an accepted human decision. The existing
  observer's eight-hour lifetime remains unchanged. Use an internal injectable
  clock/deadline for deterministic tests, not a new configuration framework.
- Success, failure, timeout, unavailable observation, cancellation, and terminal
  incomplete evidence have distinct results. An advisory about delayed discovery
  is not terminal unavailability and must not itself release the wait. No retry
  loop, timeout renewal, or false success after an exception.
- Read-only observation must leave delivery acknowledgments with the existing
  host bridge. Failure coverage can precede its diagnostic event; returning that
  verdict must not suppress later diagnostics or shut down the worker prematurely.
- Retrospective remains analysis-only: no new authority to repair, commit, push,
  or change the backlog. Execution owns failure handling. Review conclusions
  invalidated by authorized repair are revisited selectively, without another
  full retrospective or a persisted review scheduler.
- Reuse a matching live observer through review. Existing explicit shutdown
  remains after the applicable wait and failure handling. Wrap-up reuses a live
  matching observer or follows existing setup. Story Branch integration changes
  the target: close branch observation before starting trunk observation from
  the retained workspace, before publication; register the accepted trunk SHA.
  Do not retarget a mailbox or run duplicate observers for the same target.
- Local-only work creates no new push or CI obligation. The pre-implementation
  Taken claim's separate target-coverage rules stay unchanged.
- Exclude automatic observer startup/registration/shutdown, per-slice waits,
  new providers, path-policy changes, dashboards, deployment checks, branch
  protection, release/version work, and hand-editing managed installed copies.

## Existing solution assessment and architecture

Inspected at `7954674c7dc05d60532953458f93be998ef86b10`:

| Existing owner | Evidence and decision |
| --- | --- |
| `src/skills/dough-execute-plan/scripts/watch-ci-execution.mjs` | Runs independently with a 30-second non-model poll and finite execution budget. Reuse acquisition, error handling, and failure delivery; do not add a GitHub watcher. |
| `scripts/ci-mailbox-revision-coverage.mjs` within that skill | Persists exact verdicts and ignored-only `basis.sha/state`. Reuse this single coverage representation. |
| `scripts/ci-mailbox-store.mjs` | Owns event delivery evidence and worker terminal results. Its five-second `waitForTerminalResult` waits for shutdown, not CI. Do not call it as the CI gate. |
| `scripts/ci-mailbox.mjs` and `ci-mailbox-worker-process.mjs` | Own validated mailbox access, explicit commands, and worker liveness. Extend this existing command surface with a bounded revision wait; reuse liveness checks without signaling unrelated processes. |
| `references/finish-or-stop.md` and retrospective `SKILL.md` | Current shutdown-before-review prevents overlap. Move the wait/shutdown handoff while preserving implementation proof and retrospective authority. |
| `references/trunk-publication.md` and story-wrap-up `SKILL.md` | Trunk closure already sets up observation, but immediately stops it; Story Branch integration lacks target-matching CI completion. Change these callers of one waiting rule. |
| `tests/git-publication-native.sh` and `tests/support/native-run-*.sh` | Reuse disposable Git origins, candidate installs, host launch, stream capture, and bounded supervision for native proof. Current publication assessors do not prove CI waiting; extend only the relevant journeys and observations. |

Paths abbreviated as `scripts/` and `references/` above are relative to
`src/skills/dough-execute-plan/`. All production changes belong in shared
`src/skills/`, with minimal host adaptation.

Follow the existing [North Star's CI coverage responsibility](../../NORTH-STAR.md),
Accepted [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
for feedback and justified process cost,
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) for proof and
native-evidence reuse, and
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
for a single authoritative runtime rule. Ending a wait is neither a waiver of
known failure handling nor proof of release acceptance. No new North Star topic
or Accepted ADR exception is required.

## Feasibility evidence, not implementation proof

Ran from this preparation workspace at the inspected revision:

```sh
node --test src/skills/dough-execute-plan/scripts/ci-revision-coverage-not-required-shutdown.test.mjs src/skills/dough-execute-plan/scripts/ci-revision-coverage-ignored-only-failure.test.mjs src/skills/dough-execute-plan/scripts/ci-target-branch-worktree.test.mjs
```

Result: 3 tests passed. Inspected setup drives a real temporary Git repository
and mailbox worker, substitutes GitHub responses, and observes persisted
coverage/events. Evidence supports inherited pending/failure attribution,
shutdown retention, and target isolation. It does not prove the new wait command,
review overlap, or actual hosted CI latency. No infrastructure experiment beyond
these matching local seams is required for planning.

## Ordered slices

### 1. Await an exact published revision without polling through the agent

Type: Behavior
Status: planned

Behavior: a caller has a validated execution mailbox and registered SHA → it
invokes one local revision-wait command → the command stays quiet while pending
and returns once with the observed verdict or bounded exceptional outcome,
without stopping the observer, contacting CI, acknowledging events, or renewing
its deadline.

Extend the existing mailbox CLI with `await-revision DIRECTORY SHA`. Keep the
bounded local wait and result projection near the mailbox/coverage owners; no
second coverage ledger. Validate mailbox ownership and selected registration.
Use race-safe local notification/recheck (or a bounded local timer) and existing
worker evidence. Missing registration, unreadable evidence, dead/ended observation,
and absent readiness must not become success. Treat explicit cancellation of
this command separately from cancellation of the whole execution. Define one
structured result containing the requested SHA, target, outcome, and reason or
applicable evidence; don't make ordinary exceptional results look like crashes.

Proof: add a focused process-level `ci-mailbox-await.test.mjs` beside the existing
mailbox tests. Invoke the real CLI while the actual mailbox worker observes
controlled provider responses. Cover already terminal and pending-to-terminal
success/failure, timeout, observer unavailability/death, cancellation, incomplete
CI, missing registration, and a nonterminal discovery advisory. Observe silent
stdout before one result, finite exit, unchanged event acknowledgment, a live
worker after a normal return, and no extra provider calls made by the wait
reader. Use deterministic short test deadlines; don't wait ten minutes in tests.

Command after implementation:
`node --test src/skills/dough-execute-plan/scripts/ci-mailbox-await.test.mjs`.
Safe stopping point: an unused bounded command works for exact revisions;
existing callers and per-slice delivery remain unchanged.
Sizing: one mailbox consumer and one process proof loop, medium confidence.

### 2. Resolve ignored-only publication waits through existing applicable evidence

Type: Behavior
Status: planned

Behavior: registered B is `not_required` with applicable ancestor A → the same
wait command follows coverage's existing basis → pending A keeps the wait open,
terminal A supplies its actual outcome, and unresolved A ends only through the
same bounded exceptions. An exact B attempt already observed by the coverage
owner takes precedence. Unrelated later trunk revisions do not change selection.

Use one effective-verdict projection for exact and inherited evidence; do not
rerun path classification or introduce an ancestor search in the waiter. Preserve
source attribution when A is not registered in this mailbox. Unknown basis stays
unknown. This is an extension of the same state model, not a second waiter.

Proof: extend the process test with the real Git/path-policy setup from
`ci-revision-coverage-not-required-shutdown.test.mjs` and controlled GitHub
responses. Observe B waiting on pending A and exiting on A's success/failure;
prove no B discovery request is added by the waiter and no success is fabricated.
Include missing basis, an exact B attempt, and an unrelated writer's publication.
Keep the existing inherited-failure and target-isolation tests green.

Command: the slice 1 test plus the three feasibility-test files above.
Safe stopping point: all supported coverage states share one quiet wait operation.
Sizing: small extension to one reader with an existing integrated fixture.

### 3. Complete review and execution after one bounded observation

Type: Behavior
Status: planned

Behavior: implementation is delivered with CI pending → the same coordinator
starts retrospective work while its observer runs → review completion invokes
the common wait before the final handoff, handles the returned outcome, and
performs existing shutdown. If review is skipped, the same wait occurs at
execution completion. No per-slice wait is introduced.

Make `ci-monitor.md` the authoritative bounded-wait procedure. Align
`finish-or-stop.md`, retrospective's input/completion requirements, and relevant
Codex/Cursor/Claude adapter wording so delivered implementation is sufficient
for review to start while CI remains explicitly pending. Defer the final
completion/handoff report until review and its bounded observation resolve;
do not create a circular prerequisite requiring that report to start review.
Keep partial review and existing interruption recovery truthful. Failure returns
to execution's existing handling at a safe boundary; retain unread diagnostics
and reconsider only conclusions affected by an authorized repair. Retrospective
itself gains no mutation authority.

Proof: extend the existing native journey runner with a bounded execution-review
case using an installed candidate and controlled CI source. CI result availability
must be controlled independently of the model. The transcript must show review
work while coverage is pending, one wait if review ends first, and no final
handoff before that wait resolves. A second ordering makes the verdict available
during review and confirms no needless wait. Exercise skip-retro and a late
failure with truthfully unresolved reporting; deterministic boundary cases own
all exception permutations. Do not provide the command or desired sequence in
the native prompt. Reject self-report-only evidence and a fixture that supplies
the orchestration being proved.

Use shared host lifecycle tests for adapter isolation and quiet delivery, and
perform AGENTS.md behavior review of changed instructions. Select fresh native
runs by unresolved host risk (Codex yielded stream versus detached Cursor/Claude
observation); reuse only inspected matching evidence per affected host under
ADR 0005. New overlap behavior cannot inherit proof merely from old publication
success. Add targeted case selection to the existing runner only as needed to
avoid running unrelated journeys; record its literal command and observations
in this plan when implemented.

Safe stopping point: execution/review has bounded CI completion in both review
and skip-review paths; wrap-up still has its old boundaries until slices 4 and 5.
Sizing: medium; one lifecycle handoff with two existing notification mechanisms.
Native model/API time is external verification cost, not grounds for expanding
scope or repeatedly rerunning unsuccessful proof.

### 4. Await Trunk Mode closure before cleanup

Type: Behavior
Status: planned

Behavior: Trunk Mode wrap-up publishes its accepted final result → its existing
trunk observer supplies the same bounded wait → wrap-up reports the verdict or
exception before explicit observer shutdown and cleanup. Ignored-only closure
with resolved applicable evidence returns immediately.

Replace the immediate-stop/no-wait closure rule with the shared bounded wait.
Reuse matching observation or the existing setup when observation already ended.
Preserve current-branch local-only authority and missing-observation reporting.
Wait for the last applicable publication before this invocation completes, not
between each intermediate recovery-record publication. No automatic lifecycle.

Proof: extend the existing trunk-closure native journey with independently
controlled CI and observe accepted SHA, registration, wait result, shutdown,
and cleanup order. Exercise one source-requiring closure and one ignored-only
closure. Keep existing local-only checks. Reuse slices 1–2 for the complete
exception/applicability matrix instead of repeating it in every native host.
Use the same native runner extension as slice 3; the fixture must not inject
coverage or completion on behalf of the agent.

Commands: selected trunk-closure native journey and
`bash tests/git-publication-native.sh` for deterministic assessor checks.
Record the exact bounded case-selector invocation after extending the runner.
Safe stopping point: Trunk Mode closure has the promised bounded observation;
Story Branch integration retains its old behavior until slice 5.
Sizing: one existing closure path and one native proof loop; medium confidence.

### 5. Observe the integrated Story Branch result on trunk

Type: Behavior
Status: planned

Behavior: Story Branch wrap-up integrates and publishes a source-changing result
→ observation follows the accepted trunk SHA → the shared bounded wait resolves
on trunk evidence before shutdown and resource cleanup. A green execution-branch
run does not release the trunk wait.

Close old branch observation through its existing lifecycle; establish the same
observer implementation bound to trunk from the retained execution workspace
before integration publication. Register the accepted candidate, never the old
branch tip or superseded candidate. Do not retarget a mailbox or create a second
simultaneous observer for the same target. Preserve publication recovery,
cleanup ownership, and explicit unavailability. Reuse slice 4's closure wait.

Proof: extend the existing story-branch-closure native journey. Create a real Git
conflict whose resolution changes source; the accepted integrated SHA differs
from the previously green branch tip. Controlled CI responds independently on
both targets. Transcript and mailbox evidence must show target-correct setup,
registration, awaiting the integrated result, explicit shutdown, then cleanup.
A fixture supplying the target switch or wait does not prove this behavior.
Reuse existing exact-target process isolation and shared exception tests.

Commands: selected story-branch-closure native journey,
`bash tests/execution-ci-runtime.sh` once for aggregate runtime regression, and
`bash tests/install-ci-host-hooks.sh` only if host packaging/binding changed.
Record the literal native case-selector command when implemented. Assess native
behavior and host integration evidence separately under ADR 0005.
Safe stopping point: all selected execution, review, and closure outcomes are
covered; observer automation stays independent.
Sizing: one target transition and one integration proof loop, medium confidence.

## Proof ownership and execution gates

| Source promise | Owner | Decisive observation |
| --- | --- | --- |
| Quiet bounded exact verdict and distinct exceptions | 1 | Real CLI result/exit, silence, unchanged acknowledgment and provider calls |
| Last applicable execution publication, skipped ancestry, no unrelated moving target | 2 | Worker-generated coverage and actual await result with real Git ancestry |
| Review overlap, wait only at handoff, skip-retro | 3 | Native transcript ordering against independently controlled coverage |
| Existing failure handling and selective reconsideration | 3 | Late-failure native result and authority/affected-review behavior assessment |
| Wrap-up source conflict and target change | 5 | Accepted integration SHA, matching target coverage, wait before cleanup |
| Ignored-only closure, truthful unresolved outcomes, local-only preservation | 2, 4, 5 | Effective-verdict proof plus closure journey |
| Minimal shared cross-tool delivery | 3, 4, 5 | Per-host evidence/reuse assessment; no inferred native pass from static checks |

For each slice: focused proof, independent post-change refactoring under the
execution workflow, selective formatting/lint, then CI-safe commit/delivery.
Keep proof with its owning behavior. No implementation-only failing boundary.
Run `git diff --check` for each record/code increment. Do not run full CI locally
merely as ceremony; broader runs need changed coverage or a concrete concern.
Apply AGENTS.md's invocation/input/outcome review and runtime-audience rules.
No numeric slice target/hard limit was supplied for this feature; each slice is
judged by its cohesive change and proof loop. Retain source and plan for the
execution retrospective and story wrap-up.

## Plan assessment and learnings

Cumulative design: one worker, one coverage representation, one quiet wait reader,
and caller lifecycle changes. Different target setup is required by existing
publication semantics, not a new coordinator. The five slices add examples to
that model without adding per-phase watchers or state registries.

Remaining verification risks: slices 3–5 need fresh native evidence for changed
ordering; existing process tests alone cannot establish agent behavior. Their
fixtures must provide CI responses, never the wait/handoff decision. The
10-minute duration is a provisional assumption, clearly separable from the
implementation structure. No other unresolved product-scope decision was found.

Refinement: split the original closure slice into 4 (existing trunk lifecycle)
and 5 (Story Branch target transition). They have different setup/observation
risks and can prove useful outcomes independently. All five slices now have a
cohesive Behavior gate and one owned proof loop. No numeric sizing exceptions
or story resplit are needed. Assessment: ready for direct execution under the
stated duration assumption; this is an assessment, not execution authority.
Native availability and the required observations remain execution-time proof
obligations, never presumed passes.

No implementation has started. Feasibility evidence above is retained only for
its observed boundary; it is not proof that these planned slices are complete.
