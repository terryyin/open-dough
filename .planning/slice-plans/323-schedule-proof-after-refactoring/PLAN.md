# Schedule complete proof on the final changed state

**Identity:** SEED-010#schedule-proof-after-refactoring
**Source:** [Selected story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#schedule-proof-after-refactoring)
**Finding:** [ODF-249](../../../docs/maintainer/findings/ODF-249.md)

## Goal and scope

Avoid an unnecessary whole-suite run immediately before independent refactoring
invalidates it, while obtaining all required proof on the final changed state.
Coordinate implementation checks, independent refactoring, generation,
formatting and acceptance. Preserve necessary baselines, explicit project gates,
pre-live-action observations, failure handling and affected-consumer coverage.
The source's six examples are the acceptance basis; fewer runs alone cannot pass.

No test acceleration, general scheduler, telemetry store, sibling formatting or
original-promise acceptance implementation, release, or client rollout is included.
Pending release/adoption evidence remains explicit at ODF-249. No sibling is a
blocking prerequisite; reconcile shared guidance with concurrent work at delivery.

## Current decisions and reuse

- Change execution's existing coordination seam:
  [delegation](../../../src/skills/dough-execute-plan/references/delegation.md)
  selects implementation proof and
  [slice wrap-up](../../../src/skills/dough-execute-plan/references/wrap-up.md)
  accepts it before independent refactoring, generation and formatting.
  Assign final proof explicitly without representing it as accepted early.
  Keep the scheduling rule at one owner and link callers to it.
- Reuse [executable proof ownership](../../../src/skills/dough-story-refinement/references/executable-proof.md)
  for consumer tracing, baseline validity and sufficient observations, and
  [post-change refactor](../../../src/skills/dough-post-change-refactor/SKILL.md)
  for independent judgment and proof invalidation. Its existing no-edit/no-test
  and unchanged-proof rules already solve those controls. Align the handoffs
  where necessary; do not copy or weaken their rules. Pending final suite proof
  differs from missing implementation behavior or failed targeted proof.
- PFE also considered test optimization's measurement workflow and the test
  runner's scheduling machinery. They own experiments and test execution,
  respectively, not when a coordinator asks for proof around edits. Reuse
  necessary comparisons; add no second scheduler or persistent evidence ledger.
- Reuse the native delivery-evidence scaffolding and host adapters in
  `tests/support/delivery-evidence-native-run.sh`, with its consumers and gaps
  controls. Existing selection logging records commands, selected tests and
  results; extend only as needed to observe ordering and the tested state.
  Current acceptance-only prompts do not establish implementation-to-refactor
  scheduling. The probe must reach that earlier decision and final acceptance.
- Follow [AGENTS.md](../../../AGENTS.md): source edits belong in `src/skills/`,
  never installed managed copies. Apply Accepted
  [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  (one coherent responsibility and observed improvement),
  [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  (source changes versus first containing release),
  [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  (native behavior, bounded runs and reusable evidence), and
  [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  (one authoritative rule addressed to the executing project).
  The dashboard UX/UI North Star governs a different concern; no topic or ADR
  change is warranted.

## Outside-in proof ownership

| Source promise | Slice | Observable result |
| --- | --- | --- |
| Example 1: foreseeable extraction and expensive final suite | 1 establishes replay; 2 proves changed scheduling | Actual command trace shows sufficient targeted implementation proof, independent refactoring, applicable generation/formatting, then required broad proof covering the final state; no redundant broad run before the foreseeable move. |
| Example 2: no-edit review | 2 | Valid accepted proof is reused; deliberately pending final proof still runs before acceptance. |
| Example 3: another consumer becomes affected | 2 | Its distinct purpose is observed on the changed state; failing or unavailable proof withholds dependent delivery, while independent valid evidence survives. |
| Example 4: baseline and explicit project gates | 2 | Required pre-change and final measurements remain comparable and both observed; an explicit pre-refactor gate is honored. |
| Example 5: consequential live action | 2 | Required current regression proof precedes the fixture's simulated action; absent/failing proof prevents that action. |
| Example 6: later invalidation or failure | 2 | Post-proof edits invalidate only affected evidence; failure is diagnosed under existing policy, without accepting stale green or blindly retrying. |
| Useful behavior and cost comparison | 2 | Native command/order/state evidence and final defect checks distinguish improvement from mere fewer checks; report fixture elapsed/resource observations separately from qualified historical costs. |
| Response provenance and release/adoption limits | 2 | ODF-249 names actual response revision and observed outcomes, with first containing release/adoption evidenced or explicitly pending. |

Use small executable fixture checks that observe real behavior, record selected
commands and results, and identify the state tested. A logged invocation or
exit zero alone proves neither coverage nor final acceptance. A deliberately
broken consumer must fail its observing check and prevent acceptance; a stale
pre-move result must not pass the final-state control. A neutral task supplies
project constraints and starting change, not the expected schedule or answer.
Equivalent controls may share scenarios when their observation boundaries agree.
Reconstructed cases are controlled replays, not reruns of historical products.

## Decisive premises and preparation observations

Named checkout:
`/Users/terryyin/git/open-dough/.worktrees/avoid-repeating-whole-suite-proof-around-refacto`,
base `b1147ba2440a796553a388cea296e134c929db38`, 2026-10-20.

- ODF-249 retains the two reported command sequences and source revisions.
  They establish historical repeated cost, with loaded retries qualified. They
  do not establish reproduction on today's hosts. Slice 1 owns that paid
  observation before a remedy is selected.
- Inspected delegation, wrap-up, executable-proof and refactor guidance, plus
  the delivery-evidence runner, selection logger and case profiles. The current
  native cases do not observe the full scheduling journey, so no existing test
  is claimed to discriminate this new behavior.
- Ran `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/native-assessor-counterexamples.sh`:
  exit 0, no failure output. This exercised the existing toy assessor's rejection
  controls, not this story's future scheduler assessment.
- Ran `PATH="/opt/homebrew/bin:$PATH" bash -c 'source tests/support/delivery-evidence-native-run.sh; delivery_evidence_case_profile consumers; printf "%s\n" "$delivery_evidence_scenarios"; delivery_evidence_case_profile gaps; printf "%s\n" "$delivery_evidence_scenarios"'`:
  exit 0; selected `changed-contract corrected-consumer unchanged-boundary` and
  `repair-and-proceed unavailable-proof sufficient-reused`. This reaches shared
  runner loading/selection only, not the new journey or native acceptance.
- Native unpaid prefixes succeeded: `codex --version` → `codex-cli 0.163.0`,
  `claude --version` → `2.1.304 (Claude Code)`, `agent --version` →
  `2026.10.18-ea085cb`. Authenticated native launches consume paid work; slice 1
  bounds that unsettled premise. No paid launch or product edit occurred during
  preparation. Bash 5 must be first on PATH under `tests/README.md`.

## Ordered slices

### 1. Observe proof scheduling through an independent refactor
Type: Behavior
Status: done
Proof: A bounded native replay reaches proof selection, actual refactor and final
acceptance; its command/state trace establishes reproduction or explicit contrary
evidence against a corrected scheduling control.

Behavior: Given the retained stylesheet-extraction case and current guidance,
when an isolated native coordinator handles a representative slice, the
maintainer learns whether it schedules redundant broad proof and whether the
fixture can distinguish that cost from necessary proof before choosing a remedy.

Recover the cited historical inputs and build the smallest replay using existing
native infrastructure. Use a fast representative suite with a stated realistic
cost, rather than adding artificial fourteen-minute waits. Observe actual chosen
commands, revision/content identity and coverage; do not infer resource savings
from a declared cost. Include sufficient targeted proof and a real extraction
that invalidates the broad boundary. Exercise the fixture's product commands and
assessor rejection controls through `scripts/test.sh` before launching a host.
The baseline must expose redundant scheduling without prescribing it in the
prompt; a controlled corrected sequence must retain final coverage. Prove that
dropping final checks or hiding a broken consumer fails assessment.

Select Claude Code first because both retained occurrences name it. Reuse the
bounded native supervisor and one initial attempt; diagnose an inconclusive or
failed run before any retry. Retain candidate, installed guidance, host/runtime,
input, actual command order, refactor return and acceptance result in this plan
during execution. If the host cannot perform independent refactoring, the case
does not reach its claimed boundary.

Stop dependent slice 2 on an unavailable route, answer leakage, non-reproduction
or inability to observe final coverage. Record contrary evidence and revise the
approach within scope; do not call a baseline that already passes a reproduced
defect. Credential or owner-held barriers name the missing input and owner.
This early probe bounds paid uncertainty; preparation grants no launch authority.

Execution record (2026-10-20, coordinator Jane-chan, Claude Code / claude-opus-5-5):

- Authority: Terry authorized all paid native runs for this plan in session
  (one attempt per launch, diagnose before any retry).
- Replay: case `delivery-evidence/scheduling`, scenario `stylesheet-extraction`
  (`tests/proof-scheduling-native.sh`, `tests/support/delivery-evidence-scheduling-native-*.sh`,
  case registry `tests/support/delivery-evidence-native-cases.sh`). Fixture
  stylesheet 138/150 lines; requested row adds ~26 lines; product commands log
  kind, product-state hash, stylesheet count and named tests to the repository's
  common Git directory; the observer reruns the suite on the final state.
- Accepted unpaid proof on the final formatted state:
  `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/proof-scheduling-native.sh tests/native-evidence-identity.sh tests/native-assessor-counterexample-guard.sh tests/native-assessor-counterexamples.sh tests/git-publication-native.sh tests/native-stream-replay.sh`
  → exit 0. Rejected controls (`run_delivery_evidence_scheduling_assessor_counterexamples`):
  baseline redundancy; dropped-final, stale-pre-move, invocation-only and
  partial-suite missing final coverage; broken-consumer accepted with a failing
  final observation; no-targeted; unaccepted/missing acceptance; no-extraction
  and upfront-extraction inconclusive; missing fields. Product sequences:
  `run_delivery_evidence_scheduling_product_checks`.
- Native run: `bash tests/proof-scheduling-native.sh --native claude --results-dir <job tmp>/native-scheduling`
  on candidate `c6b37d26` plus the uncommitted harness; host `2.1.304 (Claude Code)`,
  model not reported by the stream; installed guidance hashed in the attempt's
  `installed-guidance.sha256`. Command order (`proof-runs.log`): targeted on the
  pre-change state exit 1 (new test red, 5/1), targeted on the final state exit 0
  (6/0), size, format, size, suite on the final state exit 0 (7/0). One suite run,
  none before any move. The coordinator implemented locally and put the new
  rules in a new `styles/project-actions.css` during implementation, citing the
  138/150 limit and AGENTS.md's “new stylesheets go in `styles/`… group rules by
  component”. Its refactor brief said “Do NOT run `bin/suite.sh` — the whole
  suite costs ~14 minutes… the coordinator runs it once after your pass”; the
  delegated refactor returned `## REFACTOR COMPLETE` with no edits. Acceptance:
  accepted, citing the single final-state suite run.
- Assessment: first reported `fail: no passing focused implementation proof
  before the refactor`, a misclassification of an implementation-time
  extraction. Diagnosed and corrected in the observer/assessor
  (`extraction-in-implementation`); re-assessing the retained observations gives
  `inconclusive: extraction made during implementation; the refactor move
  boundary was not reached`. No retry.
- Result: **non-reproduction / contrary evidence.** With the suite cost stated
  in project instructions, current guidance scheduled one broad run on the final
  state and excluded it from the refactor pass. The fixture did not reach the
  historical boundary (refactor-time move after a pre-refactor suite) because
  implementation made the extraction itself. Per this slice's stop rule,
  dependent slice 2 is stopped pending the maintainer's decision.

### 2. Coordinate required proof around the final changed state
Type: Behavior
Status: planned
Proof: Changed native execution satisfies the source's six examples through
actual command/state observations; meaningful fixture/assessor counterexamples
reject omitted final coverage, stale proof and suppressed prerequisites.

Behavior: Given a working implementation with sufficient targeted proof and
remaining final verification, when independent refactoring and final edits
settle, the coordinator obtains all still-required proof on that state without
an unnecessary whole-suite run before foreseeable invalidation. Valid existing
evidence remains reusable and all genuinely earlier prerequisites keep their order.

Change the existing coordination guidance and the smallest linked handoffs.
State what implementation proves now, what remains for final acceptance, and
who owns it. Preserve independent refactoring and its focused verification;
final suite ownership must not cause the refactor agent to duplicate it. Keep
pending final proof visible through generation/formatting and reassess consumers
after edits. Use one rule based on purpose, ordering and validity, not separate
runtime exceptions for each fixture. No delivery can pass with a known missing
affected observation.

Run the probe's changed-guidance journey and controls, assessing actual behavior
and fixture state. Record native evidence or justified reuse for each affected
requirement on Codex, Cursor and Claude Code under ADR 0005; shared integration
proof does not prove this scheduling behavior. Select representative runs rather
than every scenario on every host. Missing native proof remains explicitly
unfinished; never clear affected release from a wording check or another host's
success. Compare command counts/order, measured fixture cost, coverage and any
missed defects with the baseline; qualify historical resource estimates.

After edits and independent post-change refactoring, run the focused new fixture
and assessor checks and affected existing native harness controls through
`scripts/test.sh` with Bash 5 first on PATH. If a shared helper changes, cover
every affected consumer purpose rather than only this case. Use
`tests/native-assessor-counterexamples.sh` for its shared controls and
`tests/payload-declaration-links.sh` when runtime references/declarations change.
AGENTS.md requires the invocation, required-context and useful-outcome walkthrough,
including a missing prerequisite/conflicting gate case. Hosted CI alone does
not make the entire local suite a gate. Ordinary execution owns agent delivery
and CI repair; no knowingly failing increment is published.

Update ODF-249 with actual response revision, evaluated cases, counterevidence
and limitations. Name the first containing release only when verified; otherwise
leave release/adoption pending. Do not perform a release or client rollout.

## Sizing and safe stopping

Two proof loops isolate the uncertain native observation from the one coordinated
behavior change. All controls exercise the same proof-validity rule; splitting
them into separate production mechanisms would fragment the result. No numeric
slice limit or S/M/L calibration is supplied. Native follow-through is the main
effort uncertainty. A failed probe preserves useful contrary evidence and stops
the remedy. Source-scope changes require the human's decision.

## Learnings

- Slice 1 did not reproduce ODF-249 on Claude Code with current guidance: a
  stated fourteen-minute suite cost led the coordinator to run the suite once on
  the final state, and the foreseeable extraction happened during implementation.
  Historical differences not replayed: planned execution with a delegated
  implementer, a suite cost the project did not state (plan 302's brief
  estimated "a few minutes"), and no layout rule steering new rules into a new
  stylesheet. Slice 2's remedy premise is unconfirmed; it waits for the
  maintainer's decision.
- Preparation found that existing unchanged-proof reuse does
not by itself coordinate broad proof before the independent refactor phase.

## Story obligations

### G1. Direct suite invocations outside the product commands are unlogged
Reported: slice 1 — "a run made outside `bin/*.sh`, such as a direct `node --test`, is missing from `proof-runs.log` and would read as missing coverage."
Story clause: "Run required broad final proof after the changes that would invalidate it"
Disposition: receiving slice 2

### G2. Codex and Cursor routes are unexercised
Reported: slice 1 — "only Claude Code is targeted for slice 1. Codex and Cursor are wired but unexercised."
Story clause: "Coordinate proof scheduling across implementation, independent refactoring, generation when applicable, formatting, and final acceptance."
Disposition: receiving slice 2

### G3. Extraction attribution
Reported: slice 1 — "the log does not attribute it to the implementer or the refactor agent."
Story clause: "independent refactoring performs the extraction"
Disposition: proved by slice 1: `extraction-in-implementation` in tests/support/delivery-evidence-scheduling-native-observe.sh with the `upfront-extraction` rejection in run_delivery_evidence_scheduling_assessor_counterexamples; retained native run re-assessed inconclusive

### G4. Refactor return retained only in the event stream
Reported: slice 1 — "it is kept only inside `events.jsonl`, not extracted separately."
Story clause: "preserving defect detection and the independent refactor judgment"
Disposition: no user cost "Reduce avoidable elapsed time and resource contention while preserving defect detection and the independent refactor judgment.": the full refactor return is retained verbatim in the attempt's events.jsonl and quoted in this plan's execution record

### G5. Model identity not reported
Reported: slice 1 — "the record's `native-model` may read `unknown`."
Story clause: "preserving defect detection and the independent refactor judgment"
Disposition: no user cost "Reduce avoidable elapsed time and resource contention while preserving defect detection and the independent refactor judgment.": host version is retained; model identity does not affect the scheduling observation

### G6. Separate-worktree hosts read as inconclusive
Reported: slice 1 — "if the host works in a separate worktree, the final workspace is unchanged and the result is `inconclusive`."
Story clause: "Run required broad final proof after the changes that would invalidate it"
Disposition: no user cost "Reduce avoidable elapsed time and resource contention while preserving defect detection and the independent refactor judgment.": an unchanged workspace is classified inconclusive, never as passing or reproduced, so no wrong verdict reaches acceptance
