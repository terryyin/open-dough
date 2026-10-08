# Finding names and current follow-up

Reviewed 2026-10-06 under the retrospective-findings runbook. Retention is a
priority decision, not a claim that discarded problems were fixed or cannot recur.
**Queued** entries name selected follow-up; **delivered, unreleased** entries await a containing release. **Open, unqueued** entries retain
material unresolved consequences; they are not an active implementation commitment.
Released responses under observation are in [the watch list](near-term-watch-list.md).
Codes are permanent; highest allocated is ODF-216. Never reuse a removed code.

## Retained evidence

Each finding keeps its meaning, disposition and linked project evidence. Entries
removed on 2026-10-03 are recoverable at
`99292557:docs/maintainer/finding-names.md`; the earlier pre-trim catalog is at
`9ab3ca6e827da4aed77243ecd89d85908d3b4a4b:docs/maintainer/finding-names.md`.
Count a project/execution once; reports, renamed codes and related symptoms do
not add occurrences. Unknown releases cannot establish post-fix recurrence.

<a id="odf-059"></a>

## ODF-059 — Interrupted agent handoffs
A host-terminated refactor agent leaves changes without a report, requiring recovery from the actual diff and unresolved proof.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-059--delegated-refactor-pass-stalled-after-editing-and-before-reporting).
- **Response / limit:** No lost-agent protocol in delegation guidance. Doughnut plan 132 (0.3.24) reported the same; its log entry was pruned on 2026-10-03.

- **Additional evidence:** Open Dough plan 246 / `0ae01bd4`, 2026-10-05, Claude Code / 0.3.56: a 600-second watchdog stopped an implementation agent with 17 edited files and no report; owned stash/restore and resuming the same agent recovered them. This is the third Open Dough execution with this mechanism; no work was lost.

<a id="odf-074"></a>

## ODF-074 — Unverified planning premises
Concrete only-caller and host-state premises enter a plan without inspection, forcing a changed decision or stopped implementation when checked.

- **Follow-up:** delivered, unreleased: [Observe decisive planning premises through the full promised journey](https://github.com/terryyin/open-dough/blob/c1875574c4f0b5a6703d7a3e45e981e5e9cd9227/.planning/seeds/SEED-108-planning-observations-cover-promised-journeys.md#observe-promised-journey) — SEED-108#observe-promised-journey. **Evidence:** [open-dough](../../DearDough.md#odf-074--a-ready-plan-named-a-validation-command-the-backlog-tool-does-not-have), [open-dough](../../DearDough.md#odf-074--a-plan-left-a-decisive-browser-delivery-premise-open-for-the-developer-though-it-was-locally-observable), [pygardon](../../../pygardon/DearDough.md#odf-074--plan-statements-about-existing-code-and-host-state-were-not-verified-at-planning-time), [pygardon](../../../pygardon/DearDough.md#odf-074--shared-listing-analysis-overlooked-random-setups-explicit-history-rule), [doughnut](../../../doughnut/DearDough.md#odf-074--a-plan-said-the-changed-script-had-no-test-and-nobody-searched-for-one-before-delivery-so-ci-caught-the-stale-test).
- **Response / limit:** Delivered on main; first containing release pending. `3d148f25` requires observations to record the promised operation's result; `ac02ee79` makes readiness name an unreached premise operation. Release verification (2026-10-08): `git tag --contains 3d148f25` and `git tag --contains ac02ee79` both returned no tags. Native host evaluation remains unverified. Delivery is not itself proof that the mechanism has stopped recurring; relevant later use starts the watch, which has not started. Before this response: 2c5ff71 / 0.3.43 and fcc29fad / 0.3.48 (SEED-059, closed at f50499c0) require observing a decisive premise through its consumer. Post-fix reports: Pygardon dependency refresh on 0.3.51, Open Dough plan 197 (base 0.3.51) and plan 206 (0.3.52). The response is not shown to resolve the class; reconsider it in triage (ranked third on 2026-10-03).

- **2026-10-06 assessment:** The `2c5ff71f` / 0.3.43 and `fcc29fad` / 0.3.48 diffs require establishing decisive premises and exercising their consumers. They did not prevent the reported mechanism on 0.3.56; no intervening correction of that mechanism is demonstrated. Current guidance assessed: `9de43de4`. The selected story reconsiders how those observations establish coverage, not another wording-only response.

- **Additional evidence:** Pygardon plans 307 (2026-10-03, stale deployment checkout), 313 (2026-10-04, a teardown assertion stayed green without the cancellation) and 315 (2026-10-05, an inspected command embedded credential-adjacent API fields); Open Dough plan 251 (2026-10-05, repaired product paths missed by spec-history inspection); Doughnut plan 005-recover-failed-transcription (2026-10-05, one catch also covered an excluded save failure). All report Claude Code / 0.3.56. Each observed effect and qualified inference remains in the linked source log; these are five distinct project/executions, not five additional failures for every symptom. New source mapping: [Doughnut / DD-209](../../../doughnut/DearDough.md#odf-074--a-slice-made-the-conversion-step-reject-on-failure-the-existing-catch-also-covered-a-save-the-story-excluded).

<a id="odf-087"></a>

## ODF-087 — Skipped preparation gates
Native execution can implement the requested outcome without the required checkout preparation and command check, while substitute actors and wording checks pass.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-087--cheap-worktree-readiness-substitutes-can-pass-while-native-hosts-skip-the-gate).
- **Response / limit:** Queued-start native acceptance completed; it does not prove the original standalone greeting case obeys preparation. That exact exercise remains unverified.

<a id="odf-097"></a>

## ODF-097 — Publishing after a failed check
A failed formatter or verification result is visible but does not gate the next commit or publication step.

- **Follow-up:** Open, unqueued. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-097--a-failed-verification-result-was-collected-without-gating-the-next-action).
- **Response / limit:** No released guidance response. Three Pygardon executions on 0.3.52–0.3.54 each cost an extra publication. Open Dough's own rows are covered by its pre-commit hook (8a165806 / 0.3.52) and were pruned.

<a id="odf-100"></a>

## ODF-100 — Masked formatter failure
A formatter piped through tail returns the final pipeline stage's success, allowing subsequent delivery steps after formatter failure.

- **Follow-up:** Open, unqueued. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-100--agents-reported-vue-tscs-exit-code-from-a-pipe-into-tail-so-the-coordinator-had-to-rerun-the-typecheck).
- **Response / limit:** Released guidance has no exit-status rule for piped checks. Open Dough's pre-commit hook (8a165806 / 0.3.52, exercised by plan 207) covers only this repository. Four Doughnut executions, latest 0.3.46 accepted a wrong typecheck result. Open Dough and Pygardon rows pruned.

<a id="odf-101"></a>

## ODF-101 — Late CI capacity recovery
A plan inherits a known CI capacity shortage but schedules the owned resource cleanup near the end, leaving early increments without CI verdicts.

- **Follow-up:** Open, unqueued. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-101--low-docker-capacity-blocked-in-app-ci-while-the-capacity-freeing-cleanup-was-planned-last).
- **Response / limit:** Pygardon in-app CI capacity; recurred on 0.3.54 (plan 296, whole story unobserved). May belong in Pygardon's ProjectFindings.md; not moved under this run's authorization.

<a id="odf-106"></a>

## ODF-106 — Colliding plan numbers
Concurrent unpublished plan allocation produces two quick plans with the same numeric selector, making a number-only execution request ambiguous.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-106--two-plans-planned-concurrently-on-different-checkouts-both-took-number-132), [pygardon](../../../pygardon/DearDough.md#odf-106--two-concurrently-planned-quick-plans-received-the-same-number), [doughnut](../../../doughnut/DearDough.md#odf-106--two-concurrent-executions-allocated-the-same-slice-plan-number-from-different-bases).

<a id="odf-107"></a>

## ODF-107 — Missed message consumers
A changed user-visible error message is accepted using local unit/API proof while another test consumer of the old contract remains broken.

- **Follow-up:** delivered, unreleased: SEED-095#prove-slices-through-consumers (story and plan recoverable at `56ed987b:.planning/seeds/SEED-095-slice-proof-through-consumers.md` and `56ed987b:.planning/slice-plans/237-prove-slices-through-consumers/PLAN.md`). **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-107--a-changed-user-visible-message-was-accepted-without-checking-its-other-consumers).
- **Response / limit:** Delivered on main, first containing release pending: proof selection, delegation and acceptance now choose a slice's proof from every consumer of what it changes: retired literals and values found by search, callers relying on a changed default, every stand-in of a changed contract, page-wide specs, and the changed surface's suite when it fits the focused-check time; a plan's named proof is a minimum, and the coordinator neither accepts nor publishes while a known consumer, including one left for CI, is unrun. Before it: a changed-message consumer failed on 0.3.38 after f0f355c / 0.3.33.

- **Release verification (2026-10-06):** `git tag --contains` finds no containing release for cca9bff4; `v0.3.56` predates them. Keep active, delivered and unreleased, with no watch start. Native evaluation is not claimed.

- **Additional report:** Pygardon plan 309 / cda42fabf, 2026-10-03, Claude Code, guidance release unknown: a changed CI-deferral message left a current-state doc describing the old holders. Relationship to the earlier test-consumer mechanism is qualified, not a verified post-fix recurrence.

<a id="odf-108"></a>

## ODF-108 — Lost failure tracebacks

A full proof run filters its output down to summaries, losing the failed assertion and stack needed to explain a failure.

- **Source:** [pygardon / DD-212](../../../pygardon/DearDough.md#odf-108--a-full-suite-proof-run-kept-only-summary-lines-losing-an-intermittent-failures-diagnostics).
- **Follow-up:** Open, unqueued.
- **Identity / limits (2026-10-06):** Restores the same concrete issue recorded under Pygardon / DD-098 in `9ab3ca6e:docs/maintainer/finding-names.md`; current delegation requires a terminal result but does not retain diagnostic output. The 0.3.38-to-current relevant delegation/wrap-up history contains no demonstrated diagnostic-retention response. No failed fix is claimed. Current guidance assessed: `9de43de4`.

**Retained supplied evidence — pygardon:**

### Occurrences
- Execution: `SEED-086#story-frontend-tests-ignore-node-env` (`.planning/slice-plans/304-frontend-test-environment/PLAN.md`, removed at wrap-up, recoverable at `b09013ab1`; Take `37b5e9b34`; first implementation commit `7d2a50f45`)
  - Timestamp: unknown (2026-10-03, slice 1 full-suite proof).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: 0.3.54.
  - Evidence: first `NODE_ENV=production … pnpm -C frontend test` run: 1 failed (`src/App.homeNavigation.test.tsx` › `explains disablement and links to settings on direct /ci while off`), 27 s versus the 15 s baseline. Three isolated reruns and a full rerun (log saved to the job directory) passed.
  - Observed effect: the failure was accepted as intermittent without its message; the plan records it as a learning.
  - Inference: writing full-suite output to a log file and grepping the file afterwards keeps the diagnostics for free. The spec reads `getByText('CI is off.')` right after `findByTestId('ci-page-title')`, which is a plausible race under load, but this is not confirmed.

<a id="odf-110"></a>

## ODF-110 — Incomplete readiness replays
A replay resolves the named readiness seam without exercising the rest of the slice's promised journey, leaving a later operation to force a scope stop.

- **Follow-up:** delivered, unreleased: [Observe decisive planning premises through the full promised journey](https://github.com/terryyin/open-dough/blob/c1875574c4f0b5a6703d7a3e45e981e5e9cd9227/.planning/seeds/SEED-108-planning-observations-cover-promised-journeys.md#observe-promised-journey) — SEED-108#observe-promised-journey. **Evidence:** [open-dough](../../DearDough.md#odf-110--a-publisher-seam-premise-was-observed-by-reading-the-seam-not-the-race-it-had-to-stop), [open-dough](../../DearDough.md#odf-110--a-plans-consumer-premise-for-an-admission-rule-swept-function-callers-missing-specs-that-relaunch-the-same-story), [doughnut](../../../doughnut/DearDough.md#odf-110--a-readiness-replay-observed-only-the-plans-named-seam-not-the-rest-of-the-slices-journey).
- **Response / limit:** Delivered on main; first containing release pending. `3d148f25` requires observations to record the promised operation's result; `ac02ee79` makes readiness name an unreached premise operation. Release verification (2026-10-08): `git tag --contains 3d148f25` and `git tag --contains ac02ee79` both returned no tags. Native host evaluation remains unverified. Delivery is not itself proof that the mechanism has stopped recurring; relevant later use starts the watch, which has not started. Before this response: 2c5ff71 / 0.3.43 and fcc29fad / 0.3.48 (SEED-059, closed at f50499c0) require observing a decisive premise through its consumer. Post-fix reports: Pygardon dependency refresh on 0.3.51, Open Dough plan 197 (base 0.3.51) and plan 206 (0.3.52). The response is not shown to resolve the class; reconsider it in triage (ranked third on 2026-10-03).

- **2026-10-06 assessment:** The `2c5ff71f` / 0.3.43 and `fcc29fad` / 0.3.48 diffs require establishing decisive premises and exercising their consumers. They did not prevent the reported mechanism on 0.3.56; no intervening correction of that mechanism is demonstrated. Current guidance assessed: `9de43de4`. The selected story reconsiders how those observations establish coverage, not another wording-only response.

- **Additional evidence:** Open Dough plans 239 (2026-10-03), 243 (2026-10-04), 248 (2026-10-05), and 254 (2026-10-06; a wrapper consumer reached a helper outside the named files) missed boundary/count/server/fixture consumers in premise searches; Doughnut plan 004-hold-worktree-e2e-stack (2026-10-05) proved reachability without the authenticated CLI example. All report Claude Code / 0.3.56; gaps were caught within slices. Source mappings: [Open Dough / DD-228, plan 248 only](../../DearDough.md#odf-110--a-removal-premise-swept-client-names-but-missed-server-and-fixture-consumers), [Doughnut / DD-207](../../../doughnut/DearDough.md#odf-110--a-plans-proof-for-a-cli-key-example-checked-only-that-the-server-answered-not-the-authenticated-step-the-example-needed). The unrelated plan 231 preparation-location report formerly sharing DD-228 was pruned as minor administrative friction.

<a id="odf-120"></a>

## ODF-120 — Satisfied prerequisites leave stale readiness

A dependency lands but its dependent story keeps a not-ready assessment whose only reason was that dependency.

- **Response:** `8bb73be0` and `186ef150`, first released in 0.3.55, record blocking story dependencies and resolve them from completed suppliers.
- **Follow-up:** released response, effectiveness unverified; no watch start. Both clients now have 0.3.56 installed, but installation alone does not exercise supplier completion and consumer dependency resolution.
- **Source:** [Pygardon / DD-176](../../../pygardon/DearDough.md#odf-120--a-plan-held-not-ready-on-a-siblings-unintegrated-story-branch-with-nothing-to-reassess-it-when-that-branch-landed).
- **Last assessed:** 2026-10-06; all three logs checked. Reports are on 0.3.38–0.3.47 or unknown. Limit: whether the response covers a free-text not-ready reason, as opposed to a recorded dependency, is unverified.
- **Additional report:** Pygardon plan 301 / `578a568fb`, 2026-10-03, Claude Code / 0.3.54: a runnable slice waited about 22 minutes and needed two owner prompts before a poll was armed. This predates 0.3.55; it also leaves the relationship between an active wait trigger and completed dependency-state resolution unverified. Keep active rather than begin an unexercised age-based watch.

<a id="odf-121"></a>

## ODF-121 — Transient transport failure ends observation
A reported GitHub transport failure ends observation and leaves later revisions without notification coverage.

- **Follow-up:** Open, unqueued. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-121--one-transient-github-tls-timeout-ended-ci-observation-for-the-rest-of-the-execution).
- **Response / limit:** No retry for transient `gh` errors. Second execution on 0.3.50; managed delivery re-attached at the next publication.

<a id="odf-139"></a>

## ODF-139 — Reported defect dismissed without checking the story

A named gap contradicts the story goal, but acceptance judges it against the plan's narrower scope and delivers it.

- **Sources:** Doughnut / DD-132 (historical evidence at `9ab3ca6e:docs/maintainer/finding-names.md`); [Pygardon / DD-214](../../../pygardon/DearDough.md#odf-139--a-hand-back-gap-was-accepted-as-plan-scoped-without-checking-it-against-the-storys-scope).
- **Follow-up:** Open, unqueued; released response not shown to resolve.
- **Response:** `b7930baf`, first released in 0.3.48, adds the story-goal and named-gap check to `wrap-up.md` Accept proof. The same rule remains at `9de43de4`; no demonstrated intervening correction of agent follow-through warrants a new identity.
- **Post-fix evidence:** Pygardon SEED-078#story-auto-trading-same-basis, plan 303 / `74d86dc20` (Take `e6b1c08c4`, recoverable at `a4673f7b6`), 2026-10-03 date-only, Claude Code / claude-opus-5-5 / 0.3.56. Slice 4 reported that `HoldingsExitSettingsResults.tsx` omitted the source; the story said each signal and exit row names it. Acceptance filed this as outside the plan's ask; retrospective correction plan 311 was required. Qualified inference: acceptance used the plan instead of the story. This is a supported failure after the 0.3.48 response, so its prior watch does not pass.
- **Provenance-limited report:** Pygardon SEED-085#story-ci-capacity-kept-free, plan 308 / `cc959dab8` (Take `b77d4e9ff`, recoverable at `33c3283d2`), 2026-10-03 date-only, Claude Code / claude-opus-5-5, guidance release unknown. Acceptance called missing build cache and container holders plan-scoped despite the story's Scope; correction plan 309 followed. This is the same false-scope mechanism; its unknown release cannot establish post-fix recurrence.
- **Frequency:** Three distinct supported executions including the original Doughnut plan 006 on 0.3.41. The two Pygardon retrospectives do not count as extra executions. ODF-138, ODF-185 and ODF-196 retain distinct mechanisms in the watch list.

<a id="odf-141"></a>

## ODF-141 — Fixed refactor cost on small accepted slices
Every small slice launches a fresh full refactor agent even when the accepted diff needs no further changes, creating substantial repeated cost.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-141--a-delegated-refactor-pass-ran-on-each-of-two-tiny-guidance-changes-and-edited-nothing), [pygardon](../../../pygardon/DearDough.md#odf-141--most-per-slice-refactor-passes-on-a-small-correction-made-no-edits), [doughnut](../../../doughnut/DearDough.md#odf-141--a-fresh-refactor-agent-per-slice-returned-no-edits-on-three-of-eight-small-slices).
- **Response / limit:** No proportionality rule in released guidance. Four Open Dough, nine Pygardon and three Doughnut executions, latest 0.3.54; cost only, and the pass did pay off in Open Dough plans 200 and 221.

- **Additional evidence / limit:** Open Dough plan 249 and Doughnut plans 009-frontend-specs-run-real-internal-modules, 002-specs-share-production-router, 003-one-production-router-builder, 004-hold-worktree-e2e-stack and 005-recover-failed-transcription report 0.3.56; Doughnut 001-join-dictated-passages reports an unknown release. No-edit cost recurs, but the other passes found useful shared helpers and a real promise rejection defect. Count each project/execution once. These remain lower priority than unreviewed trunk publication and failed planning premises.

<a id="odf-142"></a>

## ODF-142 — Abbreviated delivery SHAs produce misleading refusals

An abbreviated published-base SHA is accepted as an argument but compared without normalization, causing misleading delivery refusal and fallback publication without observation.

- **Source:** [pygardon / DD-220](../../../pygardon/DearDough.md#odf-142--managed-delivery-refused-a-fast-forward-candidate-with-rebase-left-the-pre-rebase-sha-as-the-candidate).
- **Follow-up:** Open, unqueued.
- **Identity / limits (2026-10-06):** Restores Pygardon / DD-124’s existing identity from `9ab3ca6e:docs/maintainer/finding-names.md`. At `9de43de4`, `execution-increment-publication.mjs` still compares the supplied base to full fetched SHAs. A full-SHA retry succeeded in the new report; the first fast-forward diagnosis remains qualified. No demonstrated normalization correction or post-fix claim. Current guidance assessed: `9de43de4`.

**Retained supplied evidence — pygardon:**

### Occurrences
- Execution: SEED-094#story-production-observations-without-round-trips (`.planning/slice-plans/315-production-observations-without-round-trips/PLAN.md`, removed at wrap-up, recoverable at `8c16de57e`; Take `2451f59c7`; first implementation commit `b33a4bd4f`)
  - Timestamp: unknown (2026-10-05, delivery of `6fa9842d9`).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: 0.3.56.
  - Evidence: `deliver --previously-published-base 655f21ec2 --target-ref refs/heads/claude/executions-read-the-production-facts-they-need-w` with the remote branch at `655f21ec2` and `6fa9842d9` its only new commit printed `rebase left the pre-rebase SHA as the candidate` and pushed nothing. The base was passed as an abbreviated SHA.
  - Observed effect: the coordinator pushed the fast-forward with plain `git push`; no observer covered it.
  - Inference: likely the abbreviated base. The next `deliver` (completion record `c267e2ed0`) passed `6fa9842d9c` and stopped with `unpublished-base`; the same call with the full SHA was accepted. The usage text does not say the base must be a full SHA.

<a id="odf-147"></a>

## ODF-147 — Reasoned red proof leaves ineffective tests
An agent reasons that new tests would fail instead of observing them against pre-change behavior; round-trip or wrong-boundary tests can pass without the fix.

- **Follow-up:** Open, unqueued. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-147--an-implementer-reasoned-that-a-new-test-would-fail-instead-of-running-it-red-and-one-of-its-tests-could-not-fail).

<a id="odf-150"></a>

## ODF-150 — Implementation proof misses indirect consumers
Proof selection follows edited store areas rather than the changed operation’s whole caller flow, missing a consumer’s failure scenario.

- **Follow-up:** delivered, unreleased: SEED-095#prove-slices-through-consumers (story and plan recoverable at `56ed987b:.planning/seeds/SEED-095-slice-proof-through-consumers.md` and `56ed987b:.planning/slice-plans/237-prove-slices-through-consumers/PLAN.md`). **Evidence:** [open-dough](../../DearDough.md#odf-150--slice-proof-chosen-by-the-changed-components-missed-page-wide-invariant-specs), [open-dough](../../DearDough.md#odf-150--shared-readiness-caller-analysis-missed-queued-escalation-continuation), [pygardon](../../../pygardon/DearDough.md#odf-150--focused-slice-proof-missed-consumers-of-a-changed-shared-default-caught-only-by-coordinator-run-wider-suites), [doughnut](../../../doughnut/DearDough.md#odf-150--an-implementers-slice-proof-ran-only-the-specs-it-chose-missing-consumers-of-the-store-method-it-changed).
- **Response / limit:** Delivered on main, first containing release pending: proof selection, delegation and acceptance now choose a slice's proof from every consumer of what it changes: retired literals and values found by search, callers relying on a changed default, every stand-in of a changed contract, page-wide specs, and the changed surface's suite when it fits the focused-check time; a plan's named proof is a minimum, and the coordinator neither accepts nor publishes while a known consumer, including one left for CI, is unrun. Before it: more than ten Open Dough, five Doughnut and one Pygardon executions, latest 0.3.54, about one failed CI run and repair per execution. Reports continue after f0f355c / 0.3.33 and fcc29fad / 0.3.48; a same-cause match with either is not established. Rows once filed under ODF-003 (plans 113, 140) and ODF-100 (plan 181) are this mechanism.

- **Release verification (2026-10-06):** `git tag --contains` finds no containing release for cca9bff4; `v0.3.56` predates them. Keep active, delivered and unreleased, with no watch start. Native evaluation is not claimed.

- **Additional report:** Open Dough plan 244 / 2d9347c1, 2026-10-04T21:09:46+08:00, Claude Code, execution release unknown (installed VERSION 0.3.56): focused card proof missed three page-wide consumers; slice 3 ran 1,036 specs and repaired them. No tag contains the new consumer-selection response, so this does not establish its failure.

<a id="odf-152"></a>

## ODF-152 — File-size gate conflicts with approved intermediate scope
An absolute changed-file size check conflicts with an approved staged decomposition and mechanical edits to pre-existing oversized callers.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-152--an-unconditional-file-size-check-stopped-a-refactor-with-no-conceptual-candidate), [doughnut](../../../doughnut/DearDough.md#odf-152--the-file-size-rule-conflicted-with-an-approved-staged-simplification-and-mechanical-callers).

<a id="odf-153"></a>

## ODF-153 — Sibling-branch CI failure attribution
A new observer labels a non-ancestor sibling revision as this execution’s branch; observer versus adapter responsibility is unknown.

- **Follow-up:** Open, unqueued. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-153--an-observer-attributed-a-sibling-branch-failure-to-this-execution).
- **Response / limit:** No response. Three Pygardon executions, latest 0.3.54; Pygardon uses a custom CI adapter, so observer versus adapter responsibility is still unknown.

<a id="odf-154"></a>

## ODF-154 — Missing Cursor coordinator identity
Cursor’s first managed delivery lacks conversation/generation identity, requiring a manual observer start and registration.

- **Follow-up:** delivered, unreleased: SEED-094#observe-ci-on-codex-and-cursor (story and plan recoverable at `0dc71704:.planning/seeds/SEED-094-ci-observation-for-codex-and-cursor.md` and `0dc71704:.planning/slice-plans/235-ci-observed-on-codex-and-cursor/PLAN.md`). **Evidence:** [open-dough](../../DearDough.md#odf-154--cursor-managed-delivery-lacks-its-coordinator-session-identity).
- **Response / limit:** Delivered on main, first containing release pending: `deliver --host cursor` takes the coordinator from `CURSOR_CONVERSATION_ID`, and a managed-delivery generation no longer replaces the coordinator's real hook generation. Native Cursor evaluation (paid, manual) not yet run. Before it: six Cursor executions, latest 0.3.54, each lost CI observation.

- **Release verification (2026-10-06):** `git tag --contains` finds no containing release for c02158fc; `v0.3.56` predates them. Keep active, delivered and unreleased, with no watch start. Native evaluation is not claimed.

- **Additional source mapping:** [Open Dough / DD-231](../../DearDough.md#additional-cursor-occurrence), plan 242-cursor-agent-stays-joinable / e7fbca2a, Cursor / Grok 4.7, timestamp unknown; modified revision `2ea2d324`, base 0.3.56. Inspection of that revision’s installed `ci-host-bridge.mjs` confirms the old Claude-only identity fallback. Three accepted publications were unobserved. This is continuity of ODF-154 before its unreleased response, not a failed released fix.

<a id="odf-156"></a>

## ODF-156 — Lost acceptance obligations in delegation
A required later-slice check recorded as a plan learning is omitted from that slice's delegation and acceptance.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-156--a-slice-acceptance-obligation-recorded-as-a-plan-learning-never-reached-the-next-delegation), [pygardon](../../../pygardon/DearDough.md#odf-156--a-gap-deferred-to-a-later-slice-was-not-carried-into-that-slices-delegation).
- **Response / limit:** No response. Second project: Pygardon plan 296 (0.3.54) delivered a story promise incomplete and needed a correction plan.

<a id="odf-157"></a>

## ODF-157 — Identifier-only conceptual searches
An identifier/permission-word sweep misses the same concept expressed in prose, allowing a removal's contradictory guidance to survive.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-157--a-no-other-location-premise-was-swept-with-the-removed-rules-words-missing-the-concepts-other-wording).

<a id="odf-158"></a>

## ODF-158 — Disproportionate required reference reads
Startup boundary instructions require broad references for a small execution whose managed commands already own most of those paths.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-158--execute-plans-required-reference-reads-cost-more-than-a-clean-one-slice-run-used).

<a id="odf-169"></a>

## ODF-169 — Stale replay base includes sibling commits
A managed-delivery retry carries the old published base instead of its newly reconciled suffix base and replays sibling commits into conflicts.

- **Follow-up:** Open, unqueued. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-169--a-stale-previously-published-base-after-a-trunk-merge-made-delivery-replay-a-siblings-commits).

<a id="odf-170"></a>

## ODF-170 — Merge driver rooted in a retired worktree
Repository-wide Git configuration names an absolute merge-driver script in one worktree; retiring it breaks backlog merges in all checkouts.

- **Follow-up:** Open, unqueued. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-170--the-shared-product-backlog-merge-driver-points-at-one-worktrees-copy-of-its-script).

<a id="odf-184"></a>

## ODF-184 — Unbounded managed push stalls delivery
A stalled SSH push leaves managed delivery and the coordinator waiting about fifty minutes with no command bound.

- **Follow-up:** Open, unqueued. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-184--managed-deliverys-git-push-stalled-for-about-50-minutes-with-no-bound).

<a id="odf-189"></a>

## ODF-189 — Small additions force unrelated size extractions
A small addition crosses the numeric file-size ceiling and triggers relocation and re-proof of a substantial previously untouched responsibility.

- **Follow-up:** Open, unqueued. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-189--a-four-line-repository-tip-over-forced-extracting-an-unrelated-assimilation-query-block).
- **Response / limit:** File-size rule unchanged since b86175e4. Five Doughnut executions, latest 0.3.54; with ODF-152, ODF-195 and ODF-207 this is one rule family.

- **Additional evidence:** Doughnut 001-join-dictated-passages / ba66d94ad3, 2026-10-05, Codex, release unknown: a 249-line preservation spec grew to 304 and was split with 27 replacement mounted tests and typecheck, about four active refactor minutes. Production code did not change; no post-fix claim or net review-value claim is made.

<a id="odf-190"></a>

## ODF-190 — Planned observation route is unavailable
Planning names an observation route or log source that is not available to the executing project, causing owner probing or loss of the intended proof.

- **Follow-up:** delivered, unreleased: [Observe decisive planning premises through the full promised journey](https://github.com/terryyin/open-dough/blob/c1875574c4f0b5a6703d7a3e45e981e5e9cd9227/.planning/seeds/SEED-108-planning-observations-cover-promised-journeys.md#observe-promised-journey) — SEED-108#observe-promised-journey. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-190--the-plan-prescribed-production-observations-whose-access-route-or-log-source-did-not-exist-and-whose-results-could-not-change-the-approach).
- **Response / limit:** Delivered on main; first containing release pending. `3d148f25` requires observations to record the promised operation's result; `ac02ee79` makes readiness name an unreached premise operation. Release verification (2026-10-08): `git tag --contains 3d148f25` and `git tag --contains ac02ee79` both returned no tags. Native host evaluation remains unverified. Delivery is not itself proof that the mechanism has stopped recurring; relevant later use starts the watch, which has not started. Before this response: fcc29fad / 0.3.48 plausibly covers observation routes, but a third Doughnut execution on 0.3.54 (2026-10-03) again planned a paid journey with no available route. Not shown to resolve.

- **2026-10-06 assessment:** The `2c5ff71f` / 0.3.43 and `fcc29fad` / 0.3.48 diffs require establishing decisive premises and exercising their consumers. They did not prevent the reported mechanism on 0.3.56; no intervening correction of that mechanism is demonstrated. Current guidance assessed: `9de43de4`. The selected story reconsiders how those observations establish coverage, not another wording-only response.

- **Additional evidence:** Doughnut plan 008-keep-every-transcribed-sentence / d68937a0d2, 2026-10-04, Claude Code / 0.3.56: the local runner refused the live-service feature in a linked worktree; an owner round-trip and two direct paid calls preceded moving feature proof to CI. Actual feature proof and the manual check were distinct; the log retains that qualification. This is post-0.3.48 evidence of an unavailable planned route, not evidence that CI itself failed.

<a id="odf-195"></a>

## ODF-195 — Pre-existing size overrun handled inconsistently
Two refactor passes within one story treat barely touched, already oversized files differently, forcing an unrelated extraction in one and retaining another.

- **Follow-up:** Open, unqueued. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-195--the-file-size-check-split-an-untouched-block-in-one-slice-of-an-execution-and-was-waived-in-a-later-slice).

<a id="odf-200"></a>

## ODF-200 — Undocumented delivery target-ref form
Managed delivery accepts only `refs/heads/<branch>` for `--target-ref`, but its usage text and the step guidance say only `REF`, so coordinators read the script or have a first call refused.

- **Follow-up:** delivered, unreleased: SEED-008#story-branch-delivery-target (story and plan recoverable at `b413d0fe:.planning/seeds/SEED-008-worktree-branch-trunk-sync.md` and `b413d0fe:.planning/slice-plans/256-story-branch-delivery-target/PLAN.md`). **Evidence:** [open-dough](../../DearDough.md#odf-200--story-branch-deliverys---target-ref-value-had-to-be-read-from-the-script), [pygardon](../../../pygardon/DearDough.md#odf-200--managed-deliverys-usage-text-does-not-say-that---target-ref-must-be-a-full-branch-ref), [doughnut](../../../doughnut/DearDough.md#odf-200--managed-increment-delivery-rejected-a-remote-tracking-target-ref-the-accepted-form-is-not-shown-next-to-the-step).
- **Response / limit:** Delivered on main, first containing release pending: `9a9e0a6e` makes `deliver` require `--mode trunk|story-branch`, names `--target-ref refs/heads/<branch>` in its usage, and refuses a Story Branch target other than `refs/heads/<execution branch>` before any fetch, push, or observation; one-shot landings declare `--tracking one-shot`. `a1bcad0d` puts the literal command with each mode's target in "Publish the candidate". Before it: plan 250 / `1be19216`, 2026-10-05T14:48:39+09:00, Claude Code / 0.3.56, passed `refs/heads/main` from the established start and published an unreviewed Story Branch increment to trunk. Related lookup/refusal reports in all three projects on 0.3.56 predate the response.

- **Evidence correction:** The plan 245 / `d754256c` target-ref lookup row was moved from ODF-059 to ODF-200 without counting another execution.
- **Frequency:** 32 distinct current-log project/executions: 19 Open Dough, seven Pygardon and six Doughnut, deduplicated by their implementation identities. Most report lookup or refusal friction; plan 250 is the one demonstrated unreviewed trunk publication. No severity or recurrence score is inferred from the number alone.

<a id="odf-201"></a>

## ODF-201 — Codex stream leaves delivered failures unacknowledged
The Codex stream binding notifies CI failures without advancing the durable delivery cursor, so completion retains shutdown for failures already repaired.

- **Follow-up:** delivered, unreleased: SEED-094#observe-ci-on-codex-and-cursor (story and plan recoverable at `0dc71704:.planning/seeds/SEED-094-ci-observation-for-codex-and-cursor.md` and `0dc71704:.planning/slice-plans/235-ci-observed-on-codex-and-cursor/PLAN.md`). **Evidence:** [open-dough](../../DearDough.md#odf-201--codex-stream-notifications-leave-handled-failures-unread-at-completion).
- **Response / limit:** Delivered on main, first containing release pending: the documented Codex binding acknowledges each notified batch through `ci-mailbox.mjs acknowledge`; a record never notified still retains shutdown. Native Codex evaluation (paid, manual) not yet run. Before it: nine Open Dough Codex executions, latest 0.3.54.

- **Release verification (2026-10-06):** `git tag --contains` finds no containing release for 8ac67735; `v0.3.56` predates them. Keep active, delivered and unreleased, with no watch start. Native evaluation is not claimed.

<a id="odf-202"></a>

## ODF-202 — Managed Codex delivery lacks observer attachment
Managed delivery under Codex has no supported binding to the yielded stream observer, and guidance forbids the separate stream start that would cover it, so publications go unobserved.

- **Follow-up:** delivered, unreleased: SEED-094#observe-ci-on-codex-and-cursor (story and plan recoverable at `0dc71704:.planning/seeds/SEED-094-ci-observation-for-codex-and-cursor.md` and `0dc71704:.planning/slice-plans/235-ci-observed-on-codex-and-cursor/PLAN.md`). **Evidence:** [open-dough](../../DearDough.md#odf-202--managed-codex-delivery-and-yielded-stream-have-no-documented-attachment-seam), [pygardon](../../../pygardon/DearDough.md#odf-202--managed-codex-delivery-has-no-attachment-for-its-detached-observer), [doughnut](../../../doughnut/DearDough.md#odf-202--managed-codex-delivery-left-ci-unobserved-without-a-retained-stream-binding).
- **Response / limit:** Delivered on main, first containing release pending: a Codex execution arms its yielded stream at execution start, `deliver --host codex` reuses it, and without one the receipt names that step; `--codex-bridge-available` is removed. Native Codex evaluation (paid, manual) not yet run. Before it: Thirteen Open Dough, six Pygardon (releases unknown) and one Doughnut Codex executions, latest 0.3.54. Arming the yielded stream before first delivery worked in Open Dough plans 203 and 204.

- **Release verification (2026-10-06):** `git tag --contains` finds no containing release for abeb79f9; `v0.3.56` predates them. Keep active, delivered and unreleased, with no watch start. Native evaluation is not claimed.

<a id="odf-203"></a>

## ODF-203 — Wrap-up queues a correction it already applied
Wrap-up applies a documentation correction and in the same commit queues a follow-up story whose premise quotes the old wording.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-203--a-wrap-up-applied-a-documentation-correction-and-also-queued-it-as-a-follow-up-story).
- **Response / limit:** One execution on 0.3.54, after 0bb546e4 / 0.3.53 required an explicit follow-up disposition; whether that response relates is not established.

<a id="odf-204"></a>

## ODF-204 — Interrupted delegated agent keeps running and publishes
After its call is interrupted, a delegated agent continues, commits and pushes its slice despite a no-commit delegation, leaving two writers in one checkout.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-204--an-interrupted-refactor-agent-went-on-to-commit-and-push-its-slice).
- **Response / limit:** One Cursor execution on 0.3.54; severe one-off, possibly host-side. Related to ODF-059; not the same mechanism.

<a id="odf-205"></a>

## ODF-205 — Execution starts on a red trunk unannounced
Startup does not report that the target trunk is already failing CI, so each branch publication re-raises a failure the execution does not own.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-205--execution-started-on-a-red-trunk-and-spent-ci-triage-on-a-failure-it-did-not-own).

<a id="odf-206"></a>

## ODF-206 — Over-budget slice not stopped
The slice time bound is checked only at hand-back, so a delegated slice runs past it and is accepted or extended without re-sizing.

- **Follow-up:** Open, unqueued. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-206--a-slice-ran-past-the-ten-minute-stop-rule-without-a-coordinator-stop).

<a id="odf-207"></a>

## ODF-207 — Size convention missing from implementation delegation
Implementation handoffs omit the file-size convention the refactor pass enforces, so newly created files are split after proof and the proof reruns.

- **Follow-up:** Open, unqueued. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-207--refactor-passes-repeatedly-split-files-the-same-slices-implementation-had-just-created-over-the-size-convention).
- **Response / limit:** Related to ODF-152, ODF-189 and ODF-195 (same unchanged 250-line rule); distinct cause.

<a id="odf-208"></a>

## ODF-208 — Observer worker exits without a recorded cause
The CI observer's worker exits mid-execution without a terminal result or a reported transport error, ending notification coverage.

- **Follow-up:** Open, unqueued. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-208--the-ci-observers-worker-exited-without-a-terminal-result-with-no-recorded-cause).
- **Response / limit:** One Doughnut execution on 0.3.54; the loss was detected and announced. Relationship to ODF-121 (transient transport failure) is not established, so this is a separate identity.
<a id="odf-209"></a>

## ODF-209 — Concurrent CI reproduction overloads slice proof

Asynchronous CI repair runs many-worker repetitions alongside a slice’s full suite on the same machine, producing load-only failures and slower proof.

- **Source:** [open-dough / DD-221](../../DearDough.md#odf-209--an-asynchronous-ci-repairs-repeated-reproductions-ran-beside-the-slices-full-suite-on-one-machine).
- **Follow-up:** Open, unqueued.
- **Identity / limits (2026-10-06):** Related to ODF-172’s unpaired measurements, but concurrent repair pressure disrupting another proof is a distinct cause. One 0.3.54 execution; no net cost beyond the reported waits is inferred. Current guidance assessed: `9de43de4`.

**Retained supplied evidence — open-dough:**

### Occurrences

- Execution: `SEED-091#dashboard-frame-renovation` / plan 230, first related implementation commit `fdcc45f6`
  - Timestamp: 2026-10-03T17:23:00+08:00 (repair agent start, approximately; it ran until about 17:45 +08:00)
  - Tool: Claude Code (coordinator and delegated agents)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.54 (installed `dough-update/VERSION` at claim `bb9cda47`)
  - Evidence: the CI repair for run 37111699644 ran `--repeat-each 24/30` with 6–12 workers in a temporary worktree while slice 5's full suite (about 17:18–17:21 +08:00) and its refactor pass's tests (until about 17:38 +08:00) ran; load averages reached 83–89. The repair reported six load-only failures; the refactor pass saw `codexEffortDialogCases.ts:114/:166` fail once and reran `agent-launch-codex-model` four times (10.6 minutes against about 2 for the other slices' passes); slice 5's delivery took about 6 minutes against about 1.3.
  - Observed effect: extra reruns and diagnosis of load-only failures; no wrong verdict was accepted.
  - Inference: Qualified. The published guidance runs CI repair concurrently with slice work and says nothing about shared machine load; one sample.

<a id="odf-210"></a>

## ODF-210 — Removal proof omits an existing user capability

A removal traces what a path displays but misses what it lets the user do, delivering a capability loss caught only by retrospective.

- **Source:** [open-dough / DD-234](../../DearDough.md#odf-210--removing-a-panel-path-lost-the-only-mark-as-done-of-cardless-unavailable-reported-sessions-unseen-until-retrospective).
- **Follow-up:** Open, unqueued.
- **Identity / limits (2026-10-06):** Related to ODF-074/110 and ODF-156, but there was no reported gap or lost handoff: the removed path’s Mark as done capability was never inventoried. Plan 249 locally repairs the delivered product outcome; it does not establish a shared process correction. Current guidance assessed: `9de43de4`.

**Retained supplied evidence — open-dough:**

### Occurrences

- Execution: `SEED-103#attention-message-on-story-card` / plan 248 (`d60da8d0:.planning/slice-plans/248-attention-message-on-story-card/PLAN.md`), first related implementation commit `0b3d3c78`
  - Timestamp: unknown (slice 3, before `58ea4c37` committed 2026-10-05T11:31:23+09:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: `e8a1ef8a:dashboard/src/sessionAccess.ts` returned `"result"` for a record with a message when `!attachOpens(record.sessionState)` or no embedded terminal; `58ea4c37` drops it, and `SessionEntry.tsx` renders `MarkDone` only `onCard`. Plan 248 premise "A session that the side panel cannot open is left alone" covered opening only. The destructive later-outcome check compares later slices, and slice 3 was last. Implementation, refactor, and proof acceptance did not name it; the retrospective's outcome review did.
  - Observed effect: a delivered capability loss awaiting the developer's decision on where Mark as done is offered.
  - Inference: Qualified. A removal premise listed what the removed path showed, not what it let the developer do; a removal's existing capabilities had no check before delivery. One sample.

<a id="odf-211"></a>

## ODF-211 — Admission is ambiguous for an unlanded story correction

An accepted retrospective correction is directed toward admission on remote trunk although it needs its active story branch’s unlanded code.

- **Source:** [open-dough / DD-237](../../DearDough.md#odf-211--a-retrospective-correction-of-an-unlanded-story-could-not-be-admitted-where-its-code-lives).
- **Follow-up:** Open, unqueued.
- **Identity / limits (2026-10-06):** Related to ODF-123’s plan-during-execution handoff, but the new mission-admission rule and existing-claim exemption create this distinct ambiguity. One refused call, then correction under the current claim; no new admission authority or implementation is inferred. Current guidance assessed: `9de43de4`.

**Retained supplied evidence — open-dough:**

### Occurrences

- Execution: `SEED-088#review-since-correction` / plan 251, first related implementation commit `440ad871`
  - Timestamp: unknown (between the plan 245 completion record `94ab0b57` committed 2026-10-05T15:04:40+09:00 and `440ad871` committed 2026-10-05T17:07:41+09:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: after the developer said "do it before wrap up", `execution-start.mjs start --admit` with the story's own workspace and branch answered `{"ok":false,"status":"invalid-request","error":"queued work requires a separate owned workspace"}`. `admit-accepted-work.md` lists "a retrospective's follow-up correction accepted for execution" as a mission, and also exempts "a supporting step of an active story". The coordinator ran the correction under the story's existing claim on its branch.
  - Observed effect: one refused call; the correction was delivered on the story branch with no Taken entry of its own.
  - Inference: Qualified. A correction that must land with its unlanded story fits the "supporting step of an active story" exemption better than admission, but the guidance does not say which applies, so the coordinator had to try admission first to find out.

<a id="odf-212"></a>

## ODF-212 — Acceptance misses an ADR outside the named brief

Acceptance checks only the ADRs the brief names and publishes a write path that conflicts with another Accepted writer-ownership decision.

- **Source:** [pygardon / DD-218](../../../pygardon/DearDough.md#odf-212--an-approved-store-change-was-checked-only-against-the-adrs-the-brief-named-missing-an-accepted-writer-ownership-rule).
- **Follow-up:** Open, unqueued.
- **Identity / limits (2026-10-06):** Distinct from a factual premise about code: an architectural constraint was omitted from the acceptance boundary. One 0.3.56 execution; the report says an owner decision was needed before integration and establishes no production impact. Current guidance assessed: `9de43de4`.

**Retained supplied evidence — pygardon:**

### Occurrences
- Execution: SEED-092#story-ci-verdict-under-three-minutes (`.planning/slice-plans/312-ci-verdict-under-three-minutes/PLAN.md`, removed at wrap-up, recoverable at `5f44c3a71`; Take `f72b1da02`; first implementation commit `a80c1567f`)
  - Timestamp: unknown (2026-10-04; slice 2 accepted before `a80c1567f` at its commit time, found by the retrospective after `bebf57520`).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: 0.3.56.
  - Evidence:
    - The slice 2 brief and the coordinator's acceptance cited only ADR-0004 and ADR-0008.
    - `bootstrap_provisioned_planes` (`pygardon/plane_provisioning.py`), called at service start (`pygardon_service/service_lifecycle.py:88`), opens `search_runs.duckdb` for writing.
    - ADR-0003 (Accepted, line 22) says "Search CLI owns search-run writes. Other consumers use read access."
  - Observed effect: an ADR conflict published on the story branch, now an owner decision before integration. No production impact yet.
  - Inference: when a slice changes which process opens a store, or how it opens it, running `dough-adr-awareness` across all Accepted ADRs at acceptance, not only the ones the brief names, would catch writer-ownership rules.

<a id="odf-213"></a>

## ODF-213 — Refinement reproduces a test mechanism already forbidden

Refinement makes reproducing a flaky mock the prerequisite for a remedy although the project’s existing rules already forbid that mock.

- **Source:** [doughnut / DD-204](../../../doughnut/DearDough.md#odf-213--refinement-planned-a-search-to-reproduce-a-flaky-mock-but-the-projects-test-rules-already-forbade-that-mock).
- **Follow-up:** Open, unqueued.
- **Identity / limits (2026-10-06):** Related to ODF-148’s conflicting refinement examples, but no same cause is established: this is remedy framing against an existing test constraint. One 0.3.56 execution with owner-approved probes, about 107 minutes and 630k reported reproduction tokens before removal. Current guidance assessed: `9de43de4`.

**Retained supplied evidence — doughnut:**

### Occurrences
- Execution: SEED-039#mainmenu-mock-flake / `8ab270cae5:.planning/slice-plans/006-automocked-specs-pass-reliably/PLAN.md` / 74b20fdcac
  - Timestamp: 2026-10-03T18:54:53+08:00 (plan committed) through 2026-10-03T22:00:06+08:00 (owner rescope committed)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (execution-checkout VERSION, unchanged during execution)
  - Evidence: plan premises and scope excluded "a change to the mocks without a reproduced cause". Slice 1 ran four owner-approved reproduction rounds: local instrumentation, a standalone suite with 1,940 runs, a Linux container with 23 shard runs, and a Vitest version diff. None reproduced the failure (Learnings in 99089600b4). The owner then asked "what is the feature it is testing? Does it have to be implemented in this way?" and said "this test is wrong from the very beginning". `.agents/skills/unit-testing/SKILL.md` already says "Do not mock unless external or exceptional". Slices 2–4 removed the mocks in about 30 minutes of agent work (74b20fdcac, c7944701f2, 330cd1820b).
  - Observed effect: about 107 minutes and about 630k tokens of reproduction-agent work (1,465 s + 674 s + 4,256 s by the hand-back records), three owner round-trips, and Docker cleanup, before a fix that needed no reproduction.
  - Inference: when refining a story about a failing test mechanism, check the failing mechanism against the project's test rules first. A mechanism the rules forbid is a removal story, not a reproduction search. Qualified: one execution. The reproduction search was owner-approved at each round, so the cost comes from how the story was framed, not from a broken execution step.

<a id="odf-214"></a>

## ODF-214 — A planned real observation loses a contract distinction

Replacing captured router push/replace calls with current-location proof cannot distinguish the behaviors the story promises to preserve.

- **Source:** [doughnut / DD-206](../../../doughnut/DearDough.md#odf-214--a-slice-plan-told-the-implementer-to-replace-a-pushreplace-assertion-with-a-current-location-check-which-drops-the-replace).
- **Follow-up:** Open, unqueued.
- **Identity / limits (2026-10-06):** Related to ODF-187’s ineffective planned observations, but the discarded contract distinction is a different concrete cause; keep a separate identity. One 0.3.56 execution; history-position proof restored the distinction before delivery. Current guidance assessed: `9de43de4`.

**Retained supplied evidence — doughnut:**

### Occurrences
- Execution: SEED-039#internal-mocks-to-real-modules / slice-plans/009-frontend-specs-run-real-internal-modules / a70529a3fb
  - Timestamp: unknown (slice 10 acceptance on 2026-10-04, about 09:55 +08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (execution-checkout VERSION, unchanged during execution)
  - Evidence: plan slice 10: "`AddRelationship.spec.ts` and `WikidataAssociationDialog.titleActions.spec.ts` assert `replace`/`push`; assert the current location instead." Plan Goal and scope: "without weaker assertions". The implementer reported the loss as a gap; the coordinator returned the slice, and the implementer added a history-position check (later `countHistoryEntriesAdded`), shown to fail for a push. Commit f7cc9a2293.
  - Observed effect: one extra implementation round (about 3 minutes, 76,592 subagent tokens in total for the slice's implementer). No weakened assertion was delivered.
  - Inference: when a plan swaps a mock observation for a real one, check that the real observation still tells apart every case the mock did. Qualified: one occurrence.

<a id="odf-215"></a>

## ODF-215 — Coordinator-only formatting blocks delegated E2E proof

An implementer must prove an E2E slice before coordinator formatting, while the dev-server checker refuses unformatted touched files.

- **Source:** [doughnut / DD-211](../../../doughnut/DearDough.md#odf-215--e2e-startup-fails-on-unformatted-files-but-implementers-are-told-not-to-format).
- **Follow-up:** Open, unqueued.
- **Identity / limits (2026-10-06):** Related to ODF-094’s overbroad lint restrictions, but that issue concerned a project without a hook; here a real startup formatter gate blocks the assigned proof. Keep separate. One 0.3.56 execution; extra time and the implementer’s resolution are unknown. Current guidance assessed: `9de43de4`.

**Retained supplied evidence — doughnut:**

### Occurrences
- Execution: SEED-066#recover-failed-transcription / `212e428968:.planning/slice-plans/005-recover-failed-transcription/PLAN.md` / ab773157bb
  - Timestamp: unknown (slice 3, before commit 2026-10-05T14:58:50+09:00)
  - Tool: Claude Code
  - Open Dough release: 0.3.56 (execution-checkout VERSION, unchanged during execution)
  - Evidence: slice 3 implementer learning, recorded in the plan's Learnings at ab773157bb: "E2E stack startup runs a Biome format check, so an unformatted frontend file stops `cy:run` before any scenario runs"; CLAUDE.md "implementers/refactorers run neither it nor standalone `lint:changed`".
  - Observed effect: the slice 3 E2E proof was blocked until files were formatted; extra time not recorded.
  - Inference: the rule and the project tooling conflict for any slice whose proof is an E2E run; the agent map or the slice delegation could say that formatting the touched files before `cy:run` is allowed. Qualified: one occurrence; how the implementer resolved it was not supplied.

<a id="odf-216"></a>

## ODF-216 — Landing retires a workspace with a remaining continuation

Explicitly authorized landing removes an execution workspace while the Taken story still has a final real-stack check and wrap-up owed.

- **Source:** [doughnut / DD-212](../../../doughnut/DearDough.md#odf-216--landing-retired-the-execution-workspace-while-its-final-slice-still-needed-a-continuation).
- **Follow-up:** Open, unqueued.
- **Identity / limits (2026-10-06):** Related to historical ODF-084’s unknown remover of a running worktree, but here authorized Dough Land retired a landed checkout despite a saved continuation. Guidance release unknown; continuity or a failed retirement fix cannot be established. One execution, implementation preserved, takeover needed. Current guidance assessed: `9de43de4`.

**Retained supplied evidence — doughnut:**

### Occurrences
- Execution: SEED-069#reliable-development-stack-lifecycle / `404892b54af9d40804a0309c8bd92204d41c3e7d:.planning/slice-plans/006-stop-and-restart-development-stack/PLAN.md` / 4101f03be4
  - Timestamp: 2026-10-05T17:05:29+09:00 (retirement)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown
  - Evidence: native session `26f67388-7040-4fff-b68a-786f5f7e7b95` landed `77df78ed15` after the owner's `/dough-land`, then received `worktree: removed`, `branch: removed`, `remoteBranch: removed`. Its completion message explicitly retained slice 4 and wrap-up; the saved session cwd and dashboard start still name the removed worktree. Dashboard `doneAt` is 2026-10-05T21:52:08+09:00; native job state is `stopped`. The owner subsequently asked why the Taken story had neither a worktree nor an attached session.
  - Observed effect: an investigation and takeover were needed to recover the remaining real-stack check and closure. Implementation was preserved on main; no code or data was lost.
  - Inference: when an approved proof runs after landing, the workflow could retain a usable continuation checkout and its remaining obligation before retiring the execution workspace. Qualified: one execution; who marked the dashboard session done is not established.
