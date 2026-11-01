# Source review — SEED-208#trustworthy-ci-completion

Launch: a fresh general-purpose reviewer in this execution session (no fork, no
conversation inheritance), 2026-11-01, before accepting slice 1. Input: only the
story's verbatim Goal, Value now, Human direction, Scope, Key examples,
Constraints, and Evaluation and closure (seed lines 14–141 and 171–190 at
74fabfdd), with instructions to read no files and change nothing. No plan,
return, product, or proof was supplied. Rows below are its returned ids and
text; slice allocation and observations are the coordinator's.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Terry and developers using Open Dough can trust an execution's final completion | slice 5 |  |
| 1.1 | The applicable published state has successful CI | slice 5 |  |
| 1.2 | Known failed or flaky proof has been diagnosed and repaired | slice 5 |  |
| 1.3 | The result's claimed behavior is actually observed | slice 5 |  |
| 1.4 | A later green run never erases an earlier unresolved failure | slice 5 |  |
| 2 | Value now: stable, meaningful proof supports the product-intent direction and reduces repair loops and unnecessary developer interruptions | slice 5 |  |
| 3.1 | One improvement plan, first backlog story, every known detail preserved in the story | slice 5 |  |
| 3.2 | Editing main directly and synchronizing origin is authorized only to prepare and publish this story and plan | slice 5 |  |
| 3.3 | That authorization does not execute the story's product or guidance changes | slice 5 |  |
| 3.4 | Keep the current Taken assignment and all unrelated queue order and near-future direction | slice 5 |  |
| 3.5 | The outcome spans the existing completion workflow and the concrete proof defects that made its green result unreliable | slice 5 |  |
| 3.6 | Deliver incrementally within this one requested story | slice 5 |  |
| 3.7 | Do not silently drop a diagnosed cause | slice 5 |  |
| 3.8 | Do not turn a diagnosed cause into an unowned suggestion | slice 5 |  |
| 3.9 | Do not expand into general test optimization | slice 5 |  |
| 4a.1 | The project's failed/flaky-test policy is available to Codex, Cursor and Claude Code through shared project guidance | slice 1 | observed: AGENTS.md "Failing and flaky tests" (root AGENTS.md read by Codex and Cursor; Claude Code via CLAUDE.md @AGENTS.md) |
| 4a.2 | Preserve an active sibling repair owner's work | slice 1 | observed: AGENTS.md "Failing and flaky tests" other-owner bullet; execution-decisions.md "Diagnose failed proof" |
| 4a.3 | A defect that predates this change is not, by that fact alone, an exemption | slice 1 | observed: AGENTS.md attribution bullet; execution-decisions.md "Diagnose failed proof"; executable-proof.md known-failure sentence |
| 4b.1 | Return a complete inventory of failed-job and failed-test identities | slice 2 | observed: ci-github-diagnostic-inventory.test.mjs "the inventory names an early failure, a later one and every job's beyond the excerpted ten" (12 jobs, every identity); hosted run 41261530651 inventory named all five failed journeys |
| 4b.2 | Return it alongside bounded diagnostic details | slice 2 | observed: ci-github-diagnostic-inventory.test.mjs same test, first job's excerpt at most 24 lines lacks the early identity the inventory holds; stdout bounds kept |
| 4b.3 | Expose unavailable, omitted or still-changing evidence instead of presenting a partial view as complete | slice 2 | observed: ci-github-diagnostic-logs.test.mjs held-only and mixed held/expired/readable gaps; ci-github-diagnostic-inventory.test.mjs "failure lines past each job's bound are counted, not dropped silently" |
| 4c.1 | Remove the demonstrated mismatch between the coordinates a native touch helper checks and the coordinates it taps | slice 3 | observed: dashboard/tests/controlReachability.ts tapWhereShown taps the point it measured and hit-tested in one browser turn; control-reachability-observation.spec.ts "a control that moves before the touch is refused, not silently missed" failed before (resolved) and passes after |
| 4c.2 | Retain real touch, reachability, clipping and sufficiently sized target observations | slice 3 | observed: tapWhereShown keeps clippedEdges, 44px size checks, hit check and native touchscreen.tap; existing observation tests including the modal tap pass |
| 4c.3 | Settle the transitions that need it | slice 3 | observed: the 20-file reached touch batch (48 tests, --workers 4) passed under the stricter landing check, so no journey transition needed settling |
| 4d.1 | Restore genuine temporal proof for regular unmarked polling after a settled fresh Host-switch read | slice 4 | observed: agent-launch-host-switch-fresh.spec.ts Start session test advances the clock only after the settled fresh answer and rendered offer, then asserts a later ask exists and every later ask is unmarked; fails when the poll is suppressed (D1) or marked (D2) |
| 4d.2 | That proof includes the Start session offer result | slice 4 | observed: same test asserts the fresh answer offers Codex ad-hoc, Isolated workspace is enabled and the dialog lacks the not-offered text |
| 4e.1 | Judge repairs against the complete affected behavioral lifecycle and existing consumers | slice 5 |  |
| 4e.2 | After a repair, reconsider only the affected retrospective conclusions | slice 5 |  |
| 4e.3 | Preserve source promises and regression discrimination | slice 5 |  |
| 4f.1 | Finish on the applicable accepted revision and required target | slice 5 |  |
| 4f.2 | Account for all known actionable failures when finishing | slice 5 |  |
| 4f.3 | Account for observation shutdown when finishing | slice 5 |  |
| 4f.4 | Keep an honest incomplete stop for a real unresolved gate | slice 5 |  |
| 4g.1 | Retain evidence and link the supported findings to their response | slice 5 |  |
| 4g.2 | When executed, reconcile the duplicated diagnostic finding and the stale setup observation through the existing bounded findings procedures | slice 5 |  |
| 4g.3 | Do not mark a process issue fixed solely because guidance was edited | slice 5 |  |
| E1.1 | An unrelated fixed-date fixture fails on my published revision: establish its cause, repair it under the project policy, then finish the relevant CI obligation | slice 1 | observed: AGENTS.md published-revision bullet; ci-monitor.md "Repair only a failure this execution owns" predates sentence; delegation.md failure-policy carry |
| E1.2 | Reproducing the failure on the base is attribution, not a waiver | slice 1 | observed: AGENTS.md attribution bullet; execution-decisions.md "Attribution explains the cause" |
| E2.1 | Another active execution owns that exact repair and its uncommitted files: preserve them and report the real coordination boundary, with no duplicate writer, stash or claim | slice 1 | observed: AGENTS.md other-owner bullet; ci-monitor.md known other owner paragraph |
| E2.2 | A vague assertion of pre-existing origin is not evidence of that ownership | slice 1 | observed: AGENTS.md other-owner bullet, "pre-existing" is not evidence of such an owner |
| E3.1 | Early failure, many detail lines, later failure before exit marker; more than ten failed jobs: the diagnostic names every available failed test and job | slice 2 | observed: ci-github-diagnostic-inventory.test.mjs "the inventory names an early failure, a later one and every job's beyond the excerpted ten" |
| E3.2 | The diagnostic distinguishes bounded details from completeness | slice 2 | observed: ci-github-diagnostic-inventory.test.mjs excerpt versus inventory assertions; inventory.complete only without gaps |
| E3.3 | Missing logs remain explicit unknown evidence | slice 2 | observed: ci-github-diagnostic-logs.test.mjs held-only test asserts gap reason log-unavailable |
| E4.1 | npm setup fails first but a later sibling asserts incorrectly: the attempt is not waived as infrastructure | slice 2 | observed: ci-github-diagnostic-inventory.test.mjs "an npm setup failure beside a later sibling's assertion is not an infrastructure-only inventory, even while the sibling still runs"; ci-monitor.md: a gap is never infrastructure |
| E4.2 | Recurring acquisition trouble is examined for a repository setup cause rather than ignored indefinitely | slice 5 |  |
| E5.1 | A touch target moves between measurement and activation: the helper cannot report successful reachability for a different point and silently miss the target | slice 3 | observed: control-reachability-observation.spec.ts moving-target test asserts the refusal "native touch lands on the intended control" and zero clicks |
| E5.2 | Stable native-touch journeys and clear obstruction diagnosis survive | slice 3 | observed: control-reachability-observation.spec.ts stable target gets one click; early and late cover refusals name DIV#cover; reached touch journeys pass |
| E6.1 | Initial read saw Option A, configuration changes to B, Host switches: a settled fresh response renders B | slice 4 | observed: agent-launch-host-switch-fresh.spec.ts story-launch test renders Codex Option B, not A, after the Host switch with a fresh ask; Start session test renders the newly installed offer |
| E6.2 | A subsequent actual regular poll is observed and carries no fresh marker | slice 4 | observed: expect.poll(asks.length) greater than the settled index and asks.slice(settled).every(!fresh) |
| E6.3 | Initial requests, or a timer advanced before scheduling, cannot stand in for this observation | slice 4 | observed: later asks counted only from the index recorded after the settled render; the predecessor spec passed under D1+D2 while the repaired spec fails |
| E7.1 | A banner/dialog repair fixes its first zoom assertion; acceptance still exercises opening, Close clear of the banner, End revealing the last explanation, and affected focus/navigation consumers | slice 5 |  |
| E7.2 | Do not publish three successive single-assertion fixes | slice 5 |  |
| E8.1 | A CI repair follows a provisional retrospective: its affected product and proof conclusions are reviewed on the repaired candidate | slice 5 |  |
| E8.2 | Deleting the only distinguishing temporal assertion cannot make the original promise proved | slice 5 |  |
| E9 | A story branch passes, or the same SHA fails on main, or an older unread failure remains after a later green tip: the owning execution diagnoses the failure and completes required trunk observation before successful closure | slice 5 |  |
| E10.1 | Terry explicitly waives a specific native probe or authorizes one landing exception: preserve its exact scope and truthful outcome | slice 1 | observed: AGENTS.md exception bullet; execution-decisions.md explicit human exception scope |
| E10.2 | Never turn the historical exception into the default completion rule | slice 1 | observed: AGENTS.md exception bullet, never becomes the default for later work |
| C1.1 | Keep Accepted ADR 0002's whole-product focus, continuous integration, decentralized reconciliation and stop-and-fix principles | slice 5 |  |
| C1.2 | Keep ADR 0008's separation of published facts from local evidence | slice 5 |  |
| C1.3 | Keep ADR 0010's evidenced-benefit standard | slice 5 |  |
| C1.4 | ADR 0009 is Proposed, not Accepted | slice 5 |  |
| C2.1 | Keep one shared behavioral source | slice 5 |  |
| C2.2 | Future reusable guidance changes belong in src/skills and must respect AGENTS.md | slice 5 |  |
| C2.3 | Do not hand-synchronize the installed .agents or .claude managed copies | slice 5 |  |
| C2.4 | The explicit Open Dough failure policy stays project guidance, not a policy imposed on other projects | slice 1 | observed: src/skills edits name "this project's failure policy"; Open Dough rule only in AGENTS.md |
| C3.1 | Reuse current diagnostic/provider acquisition, bounded evidence, consumer tracing, CI observer, completion receipts and publication mechanisms | slice 5 |  |
| C3.2 | Preserve held-log waits, cancellation, safe diagnostics and exact-attempt identity | slice 2 | observed: unchanged held-wait, exit 75, safe-cause and attempt-identity tests pass in ci-github-diagnostic.test.mjs and ci-github-diagnostic-logs.test.mjs |
| C3.3 | Add no new scheduler, global lock or completion ledger | slice 5 |  |
| C4 | No retry-until-green repair, arbitrary sleeps, blanket timeout inflation, muted failures, force clicks, or replacing native touch with locator activation to bypass the observed problem | slice 5 |  |
| C5.1 | E2E scenarios keep useful integration and user-intent protection | slice 5 |  |
| C5.2 | Rule details may use smaller black-box tests when meaningful coverage survives | slice 5 |  |
| C5.3 | Fewer tests, more tests, or a passing run alone is not an improvement | slice 5 |  |
| C6.1 | Do not reimplement the already delivered relative-date, no-audit, native deadline, attachment-byte, WebSocket-registration or consistency repairs | slice 5 |  |
| C6.2 | Keep the accepted bounded-refresh heap tradeoff accepted | slice 5 |  |
| C7 | Old sessions-sidebar-touch and final-report-touch failures are candidates for diagnosis, not proven instances of the same touch race | slice 3 | observed: slice 3 diagnosis in PLAN.md — sessions-sidebar-touch #3346 (Board read under a cover) and final-report-touch #3352 (project-control locator) are not this race; only #3316 focusByTouch is plausibly one |
| C8.1 | Preserve ongoing SEED-207 assessment ownership; do not duplicate its general test-value/optimization work | slice 5 |  |
| C8.2 | Shared files do not create a blocking story dependency; reconcile actual overlapping changes through normal work | slice 5 |  |
| C9.1 | Changes to installation, native host delivery or release rollout require their established functional checks | slice 5 |  |
| C9.2 | This planning publication is not a release, nor permission to update every installation | slice 5 |  |
| V1 | Each planned change needs discriminating failure-before/pass-after evidence at the behavior boundary | slice 5 |  |
| V2 | Each planned change needs preserved consumer proof | slice 5 |  |
| V3 | Each planned change needs successful applicable CI | slice 5 |  |
| V4 | Walk the guidance through the failed-fixture, active-other-owner, mixed-failure and post-review-repair cases from the executing agent's perspective; file presence or a wording test alone does not prove usefulness | slice 5 |  |
| V5 | Compare the next relevant ordinary executions with the concrete failure and repair loops, keeping numerator/denominator, target/revision, known misses, human interruptions, rework and observation limits | slice 5 |  |
| V6 | A lower aggregate red-run percentage alone is not causal proof | slice 5 |  |
| V7 | Do not invent a universal reliability target or promise no future environment failure | slice 5 |  |
| K1 | Before closure, every scoped defect is repaired or has an explicit human-owned changed disposition | slice 5 |  |
| K2 | Final target CI and observation shutdown are settled | slice 5 |  |
| K3 | Affected review conclusions are current | slice 5 |  |
| K4 | No known flaky observation is left as unrelated noise | slice 5 |  |
| K5 | This evidence is preserved through source/plan cleanup using normal Git recovery and durable test/document ownership | slice 5 |  |
