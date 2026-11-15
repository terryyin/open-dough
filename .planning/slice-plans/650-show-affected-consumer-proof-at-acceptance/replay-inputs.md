# Frozen acceptance replay inputs

Frozen before candidate-guidance replay, 2026-11-15. Baseline source:
`65fcf1bafe89d591f3b387c2cefd361c72f7b510:docs/maintainer/findings/ODF-150.md`.
The original four execution observations below are copied without alteration.
This is an exploratory reconstruction, not randomized or fresh native use.
Future CI verdicts are assessor evidence, not facts the historical implementer
could know at acceptance. Do not rerun archived implementations.

## Quality basis fixed before replay

Expose every retained missed boundary, keep all useful original discoveries,
and preserve valid reused observations and supported exclusions. Keep SEED-358
acceptable once its recorded nine-case proof is supplied. Reject a candidate-only
miss, lost lead, unsupported acceptance or unnecessary rerun. Compare the initial
return with the same return plus its recorded relevant outcome. Keep a mixed
control with a sufficient behavior observation, an unreachable boundary and an
independent missing static/layout observation. A bare `run`, re-export exclusion
or CI deferral is insufficient. A failed historical check stays failed until its
recorded repair; acceptance never converts failure into missing-only evidence.
No causal saving, population missed-check rate or ordinary-use benefit follows.

## Original inputs and complete recovery locations

Original discovery/return material remains available, without replacing it by a
compact handoff: SEED-331 full plan at
`33eb3f8cd99cb7e9131d072bf06576ef01cf3eaa:.planning/slice-plans/609-read-ci-history-at-a-glance/PLAN.md`;
SEED-358 at `55d98f179:.planning/slice-plans/625-close-launches-returned-to-the-backlog/PLAN.md`;
SEED-364 at `ea5742187:.planning/slice-plans/629-chart-ci-time-without-runner-waits-in-intent/PLAN.md`;
SEED-372 at `70fb3664d:.planning/slice-plans/639-confirm-dashboard-updates-on-return/PLAN.md`.
SEED-372's original full generated traces were private `/tmp` files named in
that plan; their present availability is unknown. The recorded trace and
exclusion claims below are the retained input, not an invented full trace.
Other unretained conversational detail and historical marginal review effort
remain unknown. Read repair diffs and observing setup/assertions at those
revisions to judge the named boundary; current dashboard green is irrelevant.

### Retained source evidence — Open Dough (2026-11-15)

**Source:** [Open Dough / ODF-150](https://github.com/terryyin/open-dough/blob/face6fd05b3f5c4f20159db9b41480afbe90d592/DearDough.md#odf-150).

- Execution: SEED-331#read-ci-history-at-a-glance (spent plan 609 recoverable at before-cleanup `33eb3f8cd99cb7e9131d072bf06576ef01cf3eaa`; first implementation `147fb83afa7f3e6a517862bb286bdb6e314f79cb`)
  - Timestamp: unknown (2026-11-13, slice 4 published about 16:00+08:00; CI failure reported shortly after)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.98 (checkout-bound installed `VERSION`)
  - Evidence: slice 4 `56dde3c` added `wallTimeReferenceOf` overloads so an explicit endpoint always returns a reference. Its consumer trace listed `server/ciFollowUpDecision.ts` as run through follow-up specs, and delivery formatting linted only changed files. CI run 43387096022 job `lint` failed `no-unnecessary-condition` at `ciFollowUpDecision.ts:29,32`; repair `45e6965` removed the now-dead guards.
  - Observed effect: one owned CI failure and repair publication; behavior proof of the consumer passed, its static check did not run.
  - Inference: a narrowed type reaches untouched callers' lint, which selective formatting skips; running the check-only full lint when a changed signature narrows would have caught it.

- Execution: SEED-358#close-launches-returned-to-the-backlog (spent plan 625; first implementation `fe871dfe5a9366fdedddd33e3794f67bb16130b3`)
  - Timestamp: unknown (2026-11-15, slice 2 acceptance before publication of `55d98f179`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.99 (checkout-bound installed `VERSION`)
  - Evidence: the slice 2 return traced five e2e consumers of the Done reading and moved count wording (`e2e/sessions/agent-launch-attention*`, `sessions-sidebar`, `agent-completion-quiet`, `agent-terminal-done-reopen`, `e2e/review/recently-done-one-shot-review`) and left them unrun with "hosted CI covers them", although the brief required the changed surface's suites within focused time. The coordinator ran them before acceptance: 9 passed in 41.2 s.
  - Observed effect: no CI failure; the acceptance rule refusing a consumer left for CI held, at one extra coordinator run.
  - Inference: the implementer still defers traced consumers to CI under the released response; the coordinator's acceptance guard, not delegation, stopped it here.

- Execution: SEED-364#chart-ci-time-without-runner-waits (plan 629; first implementation `33717676c1a7af5cd9b53f91b6239fd8e86ccc21`)
  - Timestamp: 2026-11-15T09:29:06Z (slice 1 hosted CI failure completed)
  - Tool: Cursor
  - Open Dough release: 0.3.101 (checkout-bound installed `VERSION`)
  - Evidence: slice 1 return ran plan-named measure/compat/collection specs and dispositioned store consumers as unchanged via re-export; coordinator accepted without `landed-ci-scope-*`. CI run 43698671685 failed `landed-ci-scope-proof-lifecycle` (extra `actions-workflow`) and `landed-ci-scope-retained-window` (kept `timeWithoutRunnerWaits`); repair `4c148b732` updated those expectations. Slice 4 `ef78f762a` left `ci-history-reader-compatibility` (`wallTimeMs`→`timeMs`), `intent-ci-status-wall-time` (always-shown measure chart label), and the same scope lifecycle request set for CI; run 43705198875 failed; repair `ea5742187`.
  - Observed effect: two owned CI failures and repair publications; final CI succeeded on `ea5742187`. Intent Coverage Caught key example 1 (no follow-up).
  - Inference: collection and history-contract changes reached scope and Intent status assertion suites outside the focused selection; re-export and plan-named proof did not force those consumers before publish.

- Execution: SEED-372#see-dashboard-connection-status-on-return (first implementation `1fc77eab2eee607e85106a7ecd6942a517aa3c4c`)
  - Timestamp: unknown (2026-11-15 execution; exact event time not retained)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance at established claim `c124365d015aec64b5186160980db9205b11955a`)
  - Evidence: launch `4932fa52-2d2b-4f2a-b439-2a21bf998478`; `1fc77eab2` added an empty one-pixel connection-status span. The accepted trace covered status/live-region, header and Sessions assertions but excluded an indirect frontend layout consumer. CI run `43705938729/1` failed `agent-launch-story-card-noted-start.spec.ts:68` with `not read whole: ["SPAN: "]`; `pageLayout.ts` only exempts hidden elements with nonempty text. Repair `70fb3664d` supplied the existing label as text. The exact frontend case failed before and passed after, and six streaming cases passed after.
  - Observed effect: one CI defect, a pause/stash/restore cycle and an additional repair publication after slice 1 had been accepted.
  - Inference: tracing matched the new accessible status but missed a whole-page layout assertion reached through an unchanged frontend rendering entry. This was an acceptance gap, not infrastructure; repaired before closure.

**Response observation (2026-11-15):** For the consumer-trace response first
released in v0.3.69, plan 629 on installed v0.3.101 is one qualifying
execution with two owned CI failures from consumers omitted or accepted
without proof. Plan 609 on installed v0.3.98 supplies a proof-mode gap:
the consumer was traced and exercised through behavior checks while
the changed type contract's static check was skipped. Plan 625 on installed
v0.3.99 supplies bounded positive evidence: the coordinator ran the five
traced E2E consumers before acceptance after the delegation return left
them for CI. Keep the three distinct executions and their different
outcomes. SEED-372 proves trace use, a missed page-wide consumer and a CI
repair. Its guidance release remains unknown. The response remains open.


Recovery correction before replay: the initially guessed plan-629 directory
omitted `-in-intent`; `git ls-tree -r --name-only ea5742187 .planning/slice-plans`
identified the exact owner above. Original observation rows are unchanged.
