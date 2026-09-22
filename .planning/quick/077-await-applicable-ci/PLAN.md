# Await applicable CI with bounded, quiet completion

Status: executing; taken by the current `dough-execute-plan` invocation.

Execution context:

- Mode: Story Branch Mode.
- Owned execution workspace: `/Users/terryyin/.codex/worktrees/await-applicable-ci-077/open-dough` on `codex/await-applicable-ci-077`, created by this execution from `e2d778aa20bf06cdcb15c7e637a2ff46d89cc78c` (`origin/main`).
- Originating and integration checkout: `/Users/terryyin/git/open-dough` on `main`; its pre-existing local plan-075 commits are preserved. After claim publication it diverges from `origin/main`, so default-checkout refresh is stopped.
- Authorized targets: queue claim on `origin/main`; validated increments on `origin/codex/await-applicable-ci-077`.
- Published revisions: queue claim `b279a798da3c070d33707553e8e80014f9ae547b` accepted on `origin/main`; slice 1 `c53527c6af9eeb877f1ce70489ce41b420b100fb` accepted on `origin/codex/await-applicable-ci-077` and registered with the story-branch observer.
- Checkout preparation: `npm ci` followed by `npm run lint` completed successfully for the current lockfile.
- CI observer: Codex coordinator `codex-root-plan-077`, key `ci-watch-execution:terryyin/open-dough:codex/await-applicable-ci-077:codex-root-plan-077`, mailbox `/tmp/dough-ci-501/watch-DIfyas`, PID `20518`, was bound to `terryyin/open-dough` target `codex/await-applicable-ci-077` through GitHub workflow `ci.yml` / `CI` from the checkout-bound installed runtime. After slice 1 registration it ended unavailable following repeated `api.github.com` connection failures; remaining story-branch publications have lost CI coverage and must not be reported as observed or passing.
- Replanning permission: retain the preparation authority already established for this plan; no numeric slice hard limit or exception was supplied.

## Source, authority, and outcome

Identity: `SEED-008#wait-for-applicable-ci-before-advancing`

Source: [refined story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#wait-for-applicable-ci-before-advancing).
Terry authorized feasibility analysis, story refinement, slice planning, and
plan refinement on 2026-09-22, then explicitly kept and published that result
as `4d52800`. The later refresh instruction authorized only preparation and was
published as `e2d778a`; Terry's current `dough-execute-plan 77` instruction
authorizes implementation and delivery of this plan.

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
- Retained planning default: 10 minutes from the final wait invocation, or
  earlier termination of observation. Terry kept the plan containing this
  assumption; no separate duration preference was supplied. Preserve that
  default without treating the optional preference as a new blocking decision.
  The observer's eight-hour lifetime remains unchanged. Use an internal injectable
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

Rechecked against local and fetched `origin/main` at
`e2af6d2ffdd33872670752c2227480ba5a62b0ae` (release 0.3.29 installed):

- The story is second in Backlog list, Taken is empty, and all plan slices
  remain planned. The only committed plan change is its preparation in `4d52800`.
  Available Git refs/worktrees show no implementation of this plan: the
  `await-revision` command is absent and finish-or-stop still shuts down without
  waiting before retrospective. This is repository evidence, not a claim about
  work in inaccessible clones.
- No `src/skills/` code changed since that preparation. `0f85d44` declared the
  existing applicability modules in the installer, `311be78` released 0.3.29,
  and `e2af6d2` refreshed managed installed guidance/runtime. These delivered
  existing prerequisites; they did not implement this plan.
- Installed preparation guidance now requires a digest-based readiness record
  and asks that cohesive slice boundaries be consolidated. Apply those rules
  below without changing backlog membership or execution authority.

Existing solution decisions remain supported:

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
`src/skills/dough-execute-plan/`. Shared behavioral changes belong in `src/skills/`, with minimal host
adaptation. Any new runtime module must also be declared in `install.sh`
and delivered by the existing installer; never hand-sync managed copies.

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

Previously ran in the original preparation workspace at
`7954674c7dc05d60532953458f93be998ef86b10`:

```sh
node --test src/skills/dough-execute-plan/scripts/ci-revision-coverage-not-required-shutdown.test.mjs src/skills/dough-execute-plan/scripts/ci-revision-coverage-ignored-only-failure.test.mjs src/skills/dough-execute-plan/scripts/ci-target-branch-worktree.test.mjs
```

Result: 3 tests passed. Inspected setup drives a real temporary Git repository
and mailbox worker, substitutes GitHub responses, and observes persisted
coverage/events. Evidence supports inherited pending/failure attribution,
shutdown retention, and target isolation. It does not prove the new wait command,
review overlap, or actual hosted CI latency. The source implementation and these test files are unchanged at the refreshed
basis, so retain this evidence without rerunning it. Installer changes need the
new installed-runtime proof below, not a stronger claim about these old tests.

## Ordered slices

### 1. Await the applicable published revision without agent polling

Type: Behavior
Status: done

Behavior: a caller has a validated execution mailbox and registered SHA → it
invokes one local wait → the command quietly follows that revision's effective
coverage and returns once with its verdict or bounded exception. It neither
stops the observer nor contacts CI, acknowledges events, or renews the deadline.

Extend the existing mailbox CLI with `await-revision DIRECTORY SHA`. Validate
mailbox ownership and registration. Use one effective-verdict projection for
exact evidence and `not_required` evidence's existing `basis.sha/state`; do not
add an ancestor search or duplicate path-policy interpretation. An exact attempt
already recorded by coverage takes precedence. Unknown basis stays unresolved;
an unrelated writer's newer trunk SHA never replaces the selected revision.

Use race-safe local notification/recheck or a bounded local timer and existing
worker evidence. Missing/unreadable evidence, dead/ended observation, timeout,
cancellation, and terminal incomplete CI must produce distinct truthful
outcomes. A discovery-delay advisory does not itself end the wait. Explicit
wait cancellation does not cancel the execution. Return the requested SHA,
actual target, effective evidence, and verdict or unresolved reason once.
Leave delivery acknowledgment with the bridge and preserve later diagnostics
when failure coverage precedes its event.

Proof: add `ci-mailbox-await.test.mjs` beside the mailbox tests. Invoke the real
CLI against the actual mailbox worker with controlled provider responses.
Cover already-terminal and pending-to-terminal exact success/failure plus all
bounded exceptions, missing registration, and a nonterminal advisory. Observe
silence before one result, finite exit, unchanged acknowledgment, retained
observer lifetime, and no provider calls from the wait reader.

Extend that same fixture with real Git/path-policy setup from
`ci-revision-coverage-not-required-shutdown.test.mjs`: ignored-only B follows
pending A to success/failure, even when A is not registered. Include missing
basis, a later observed exact B attempt, and another writer's publication.
Use deterministic short test deadlines, not ten-minute test sleeps.

Declare any introduced module in the existing payload manifest. Extend
`tests/execution-payload-update.sh` to invoke the installed wait entrypoint from
both managed skill roots after install/update, with the release source no longer
available. Observe a real worker-generated verdict, not merely module presence
or a `probe` receipt. Reuse the process fixture and host delivery mechanism;
this proof owns the installation dependency risk exposed by `0f85d44`.

Commands after implementation:
`node --test src/skills/dough-execute-plan/scripts/ci-mailbox-await.test.mjs`,
the three retained feasibility-test files above, and
`bash tests/execution-payload-update.sh`.

Accepted proof:

- `node --test src/skills/dough-execute-plan/scripts/ci-mailbox-await.test.mjs`
  passed 18/18 after refactoring. The stable entrypoint loads cohesive exact,
  bounded-exception, and inherited-coverage cases. The inspected real CLI and
  worker fixtures prove quiet exact success/failure, distinct terminal and
  exceptional outcomes, unchanged delivery acknowledgment and observer lifetime,
  no provider call by the reader, ignored-only ancestry, exact precedence, and
  unrelated-publication isolation.
- `node --test src/skills/dough-execute-plan/scripts/ci-mailbox-worker-loss.test.mjs`
  passed 4/4 after worker-loss detection moved behind its existing public export.
- `node --test src/skills/dough-execute-plan/scripts/ci-revision-coverage-not-required-shutdown.test.mjs src/skills/dough-execute-plan/scripts/ci-revision-coverage-ignored-only-failure.test.mjs src/skills/dough-execute-plan/scripts/ci-target-branch-worktree.test.mjs`
  passed 3/3. Its existing coverage boundaries remained unchanged by refactoring.
- `bash tests/execution-payload-update.sh` passed after helper extraction. The
  installed `.agents` and `.claude` entrypoints each consumed a worker-generated
  verdict after the remembered release source was removed.
- `bash -n tests/execution-payload-update.sh tests/helpers/installed-wait-entrypoint-fixture.bash`,
  `git diff --check`, and the project formatter/linter passed. The formatter
  exposed one fixture-local `prefer-const` issue, which was corrected without
  changing the behavior boundary.

Learning: keep `ci-mailbox-await.test.mjs` as the public proof entrypoint while
cohesive case modules stay below the project's 250-line refactor ceiling. The
wait reuses persisted coverage and worker identity only; hosted-CI latency
remains outside this deterministic slice proof.

Safe stopping point: one installed command handles the complete existing
coverage model; existing callers and per-slice delivery are unchanged.
Sizing: medium; one mailbox consumer and integrated proof, including packaging.
The former exact/inherited slices are consolidated because they are two inputs
to this single rule; shipping a temporarily incomplete projection yields no
separate useful outcome or new learning. Existing ancestry tests bound that risk.

### 2. Complete review and execution after one bounded observation

Type: Behavior
Status: done

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

Accepted proof:

- `bash tests/git-publication-native.sh --native codex --case execution-review/pending`
  passed with retained result
  `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.CZPa1hZuVw/results/codex/execution-review/pending/20260922T105643-31d0`.
  Independent observations place review start before exactly one wait and CI
  release, then record applicable success, observer shutdown, and one final marker.
- `bash tests/git-publication-native.sh --native cursor --case execution-review/ready`
  passed with retained result
  `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.ehjeVGbBQO/results/cursor/execution-review/ready/20260922T110041-430a`.
  Coverage became terminal during review; transcript evidence shows one bounded
  await at handoff, followed by shutdown and the final marker without a needless
  pending interval.
- `bash tests/git-publication-native.sh --native claude --case execution-review/skip-retro`
  passed with retained result
  `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.d2MEJRrtyY/results/claude/execution-review/skip-retro/20260922T110219-2b83`.
  No review ran; execution completion performed one await and then reported
  success, stopped observation, and emitted the completion marker.
- `bash tests/git-publication-native.sh --native codex --case execution-review/failure`
  passed with retained result
  `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.clCZkIWn0d/results/codex/execution-review/failure/20260922T110642-2901`.
  Review overlapped pending coverage, one await returned failure, the observer
  stopped, and no false execution-complete marker was emitted.
- `node --test src/skills/dough-execute-plan/scripts/ci-completion-lifecycle-guidance.test.mjs src/skills/dough-execute-plan/scripts/ci-supported-host-contract.test.mjs`
  passed 3/3; the shared host lifecycle suite passed 21/21; and
  `bash tests/git-publication-native.sh` passed its credential-free assessor.
  `bash tests/execution-payload-update.sh`,
  `bash tests/retrospective-reference-payload.sh`, shell syntax checks,
  `git diff --check`, and the project formatter/linter also passed.
- Independent refactoring extracted the retrospective process-finding guidance
  and native completion fixture while preserving the tested lifecycle. All owned
  changed files remain below the project's 250-line refactor threshold.

Learning: native failures first exposed a retrospective marker that ended the
execution before waiting, a process-liveness race, invalid discovery revisions,
PATH-based overcounting, and a false completion marker after CI failure. The
accepted runner now registers the real fixture revision, counts the transcript's
tool invocation, and requires no completion marker on failure. CI observation for
this real story branch remains unavailable after the recorded provider connection
failure, so this slice has deterministic and native proof but no live hosted-CI
verdict.

Safe stopping point: execution/review has bounded CI completion in both review
and skip-review paths; wrap-up still has its old boundaries until slices 3 and 4.
Sizing: medium; one lifecycle handoff with two existing notification mechanisms.
Native model/API time is external verification cost, not grounds for expanding
scope or repeatedly rerunning unsuccessful proof.

### 3. Await Trunk Mode closure before cleanup

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
closure. Keep existing local-only checks. Reuse slice 1 for the complete
exception/applicability matrix instead of repeating it in every native host.
Use the same native runner extension as slice 2; the fixture must not inject
coverage or completion on behalf of the agent.

Commands: selected trunk-closure native journey and
`bash tests/git-publication-native.sh` for deterministic assessor checks.
Record the exact bounded case-selector invocation after extending the runner.
Safe stopping point: Trunk Mode closure has the promised bounded observation;
Story Branch integration retains its old behavior until slice 4.
Sizing: one existing closure path and one native proof loop; medium confidence.

### 4. Observe the integrated Story Branch result on trunk

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
cleanup ownership, and explicit unavailability. Reuse slice 3's closure wait.

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
| Last applicable execution publication, skipped ancestry, no unrelated moving target | 1 | Worker-generated coverage and actual await result with real Git ancestry |
| Review overlap, wait only at handoff, skip-retro | 2 | Native transcript ordering against independently controlled coverage |
| Existing failure handling and selective reconsideration | 2 | Late-failure native result and authority/affected-review behavior assessment |
| Wrap-up source conflict and target change | 4 | Accepted integration SHA, matching target coverage, wait before cleanup |
| Ignored-only closure, truthful unresolved outcomes, local-only preservation | 1, 3, 4 | Effective-verdict proof plus closure journey |
| Minimal shared cross-tool delivery | 1–4 | Per-host evidence/reuse assessment; no inferred native pass from static checks |

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

Cumulative design: one worker, one coverage representation, one quiet wait
reader, and caller lifecycle changes. Target setup is required by existing
publication semantics, not a new coordinator. Four slices extend that model
without per-phase watchers or state registries.

Boundary review: consolidate old slices 1–2 into the complete applicable-verdict
command. Retain review handoff, Trunk closure, and Story Branch target transition
as separate outcomes: each has a different caller/lifecycle risk and useful
recovery boundary. All statuses remain planned; no completed proof was removed.
No numeric sizing exceptions or story resplit are needed.

Verification obligations: slices 2–4 still require native proof of agent ordering;
fixtures supply CI responses, never the waiting or handoff decision. Slice 1
owns new installed-runtime proof. These are explicitly mapped acceptance work,
not unresolved design concerns or presumed passes. The retained ten-minute
planning default needs no new configuration or duration-selection workflow.
No remaining blocking scope, design, or proof-mapping concern was identified.

Record refined/planned preparation and current readiness through the installed
backlog recorder in the canonical story home, using this plan and the current
home digests. The assessment is ready for direct execution; it does not Take
the story, move the backlog, or authorize implementation. Future plan delivery
changes invalidate the basis until a genuine reassessment occurs; they must not
automatically renew readiness.

No implementation has started in the inspected repository evidence. Retained
feasibility results prove only their stated boundary, not these planned slices.
