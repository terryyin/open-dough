# Bounded trial of a compact consumer-tracing handoff

**Source:** [Selected story](../../seeds/SEED-172-consumer-handoff-trial.md#trial-compact-consumer-handoff)
**Source review:** [Source review](source-review.md)
**Identity:** SEED-172#trial-compact-consumer-handoff
**Basis:** [ODF-150 assessment](../../../docs/maintainer/consumer-tracing-evaluation.md)
**Authority:** User selected “land. Then execute”; execute this bounded trial.
**Activation:** 2026-10-29T06:23:43Z (14:23:43 Singapore). Recruitment ends
2026-11-12T06:23:43Z; final decision due 2026-11-19T06:23:43Z.

## Goal, hypothesis and scope

Test whether a compact, navigable handoff lets a reviewer reach correct
consumer/proof judgments with less effort. Discovered responsibilities must
still reach their observing assertions; populated match rows alone prove nothing.
The unit is one real change reviewed twice, not two product implementations.

Scope is Open Dough only. No tracing engine, runtime guidance, installation,
delivery-policy, cross-project, telemetry service or automation change is included.
The ordinary change owner retains every existing proof and publication obligation.
No experiment permits a missing required disposition or deliberate live defect.

## Comparison and eligibility

- Enrol the first four consecutive eligible changes after an authorized start.
  Before seeing review results, record every screened change and exclusion reason.
- Eligible: a real change to a shared observable contract, operation/default,
  test-support behavior or aggregate surface with at least two potential consumer
  purposes; immutable source/candidate, full trace and normal handoff are available.
  Cosmetic-only work and cases lacking safe read-only access are excluded.
- Freeze the source promise, diff/base, guidance version, complete search population,
  per-path dispositions, inspected proof and two lead sets: pre-trace `I0` and
  common-packet `H0`. Correctness of the packet is not assumed. A
  changed snapshot starts neither a silent replacement case nor a revised result.
- A is the complete current handoff, including its required proof information.
  B adds the compact effect → responsibility → observing assertion → proof/gap
  summary and groups evidenced noise for navigation. Both expose exactly the
  same underlying facts, full candidate list and required disposition for each path.
- B may reference a shared reason/proof group from each path, but must preserve
  membership and evidence. It may not manufacture semantic exclusions from paths,
  omit rows, replace an earlier population or gain private extra facts/test results.
  A new lead found while preparing B is a producer observation: mirror it into
  the common packet before either review. After an arm starts, new private facts
  make the pair non-comparable; retain it as incomplete, with no replacement.
- Record a coin flip for A-first or B-first before each pair. Use two fresh
  reviewers with no conversation inheritance, identical brief/access/budget and
  the same host/model/settings requested. Run arms sequentially, not on each other’s
  reports. Format itself cannot be blinded; the other arm and audit remain hidden.
- Reviewers inspect the frozen code with `git show <candidate>:<path>` and
  trace/proof artifacts. They neither edit the change nor start duplicate tests.
  Both follow the same current proof standard and report human-needed decisions
  to the steward; do not solicit duplicate human answers for the experiment.
  Record requested proof; the ordinary owner handles the union once and reports
  actual outcomes and attributable added test/rework cost separately.
- A case steward prepares the packets and preserves outcomes. An independent
  assessor builds a purpose/observer reference from source/diff/code before seeing
  either report and finishes that audit before either review starts, then judges
  reports with arm labels masked where possible.
  New valid leads may extend that reference using the same criterion for both;
  disclose amendments and rescore both. It is an audited reference, not omniscience.

## Observation window and budget

Day 0 is the authorized activation timestamp, not this plan's date. Recruitment
ends at four pairs or day 14, whichever is first. Check each integrated change
for attributable CI/ordinary-use misses for seven days, finishing by day 21;
unintegrated, unexposed or unavailable outcomes remain unknown. Do not invent work
to fill the sample or create scheduled wakeups without separate authorization.

Activated incremental caps: 120 summed agent task-minutes and 30 measured human
minutes for the whole trial. Within that cap allow at most eight task-minutes
per reviewer, four per independent audit, three extra minutes of packet preparation
per case, and 20 combined minutes for calibration and final scoring. These are
experimental resource limits, not general slice timing policy. Stop at the first
cap reached; do not restart slow reviews or silently replace unfavorable cases.

Agent task time is observed dispatch-to-return elapsed time, including tool/queue
wait; it is an effort proxy, not active CPU or money. Record queue/blocking time
separately when available. Sum leaf work and non-overlapping coordinator work;
do not count the coordinator waiting on a child again. Record host contention.
Normal change work is not incremental trial overhead, but common tracing effort
is included in the mechanism comparison below. Missing measurements stay unknown.
Reserve eight of the 120 minutes for final scoring. Do not start another arm or
case when its remaining capped work would consume that reserve. Ordinary safety
actions continue under their existing owner; report their cost separately.

## Definitions and measurements

Use [CASE-TEMPLATE.md](CASE-TEMPLATE.md). Keep evidence in this plan's case records
while active; preserve the assessed result at ODF-150 at closure. No new registry.

| Measure | Definition and evidence |
| --- | --- |
| Exposure | Cases screened/enrolled/completed; audited required consumer purposes per case. Identify a purpose by responsibility + changed observable behavior + observer, not a filename. Deduplicate equivalent files/assertions; keep distinct promises distinct. |
| Missed consumer `M` | An audited required purpose neither covered by inspected sufficient proof nor specifically flagged as unresolved when that arm finishes. Unsupported exclusion or false completion counts. A generic caveat does not identify a gap. Record discovery, traversal, proof-selection or acceptance failure stage. |
| Proof gap caught `G` | A specific missing or inadequate observer/proof obligation surfaced before acceptance, including a consumer already named in the raw match list. Keep separate from novel discovery. |
| Useful discovery `U` | A validated purpose that changes justified proof, correction or exclusion. Record common producer discoveries `H0-I0` once per case. For A/B, credit only reviewer additions absent from `H0`, once per purpose with the concrete decision. Restating a supplied lead is confirmation, not a new discovery. |
| Lost useful lead `L` | A valid A discovery has neither a B disposition nor inspected equivalent coverage. Compare purpose sets, not just equal counts. |
| Review effort `R` | Each arm's observed dispatch/return timestamps and elapsed minutes, tool calls and lookup/reread work when available. Record acceptance judgment and unfinished state. |
| Mechanism effort `T` | Common trace/normal-record preparation `C`, variant presentation preparation `P`, plus reviewer time: `T_A=C+P_A+R_A`, `T_B=C+P_B+R_B`. Measure `C` once and use it for both; extra B preparation is never free. |
| Consequences and controller cost | Separate human minutes/interruptions; union proof actually run, test/CI time and attributable later repair; calibration/audit/scoring cost; usage split fresh/cached/output and money only when supplied by the host. Never infer money from raw token totals. |

Report `M / audited purposes` with numerator/denominator and unknowns for each arm,
plus per-case paired differences. Cases share context; do not count every match,
test or gap as an independent trial. No population-rate or significance claim.
Initial audited omissions also supply the denominator for gap-detection claims;
if there are none, catching omissions is unexercised, even when review is faster.
Delayed defects extend the reference only when attributable to the frozen change;
rescore both arms. Do not charge unrelated changes or the old 32-hour wait to tracing.

## Predeclared decision and stop rules

Adopt no permanent guidance in this trial. A positive pilot supports a separately
selected bounded rollout only when all of the following hold:

1. Four complete, independently audited pairs with positive audited-purpose
   denominators; all primary measurements known and
   each case's later-effect status assessed. No authority breach, weakened promise,
   fabricated proof, hidden relevant lead or unjustified exclusion by B.
2. `M_B=0` and `L=0` across the sample, including attributable delayed findings.
   B preserves every useful A discovery or establishes inspected equivalent proof.
3. Median of paired `(R_A-R_B)/R_A` is at least 20%, and median paired time saved
   is at least one minute. A zero baseline duration is unassessable, not a gain.
4. Summed `T_B` is at least 10% below summed `T_A`, and `T_B<=T_A` in at least
   three of four pairs. B causes no additional human decision requests; actual
   shared human time is reported jointly, not falsely allocated to either arm.
   Measured added proof/rework and ongoing packet maintenance have no consequential
   unexplained cost.

Any B-only audited miss, false completion, loss of a relevant lead, authority
breach or weakened proof stops recruitment and candidate promotion immediately.
Resolve live risks through the normal owner immediately; do not withhold a repair
for the experiment. Retain completed observations; never retry until favorable.
Both-arm misses remain failures and block promotion, even if no B-only regression.

With quality intact but effort below threshold: keep the current handoff and
record no worthwhile gain. With better correctness but cost above the limit:
surface the explicit human tradeoff; do not relax thresholds afterward.
Insufficient cases, missing timing/reference/exposure or infrastructure caps mean
inconclusive. Changing criteria starts a newly versioned prospective trial, with
these results preserved. Zero complaints or installation alone are never success.

## Ordered slices

### 1. Comparable packets and scoring are ready for a first case
Type: Behavior
Status: done
Behavior: Given this frozen basis, construct A/B presentation rules, a case ledger
and reviewer/auditor briefs; demonstrate that neither format drops required records.
Proof: Walk the known plan-411 indirect fake consumer, plan-430 discovered owner,
and publication-repair automatic labels through the rubric. Each missing observer
or unsupported exclusion remains a gap regardless of match/test count. Verify the
host can issue two independent same-configuration review tasks and retain timing.
This early feasibility probe owns host-dependent observation; a refusal stops
later slices. Calibration is known-case rehearsal, never scored as a trial case.

### 2. One prospective pair has an independently assessed result
Type: Behavior
Status: planned
Behavior: Enrol the first eligible real change, freeze inputs and order, collect
both capped reviews and the independent reference, then complete its case form.
Proof: Every `M/G/U/L` judgment links purpose, assertion and source; every effort
entry has observed timestamps or explicit unknown. Check population identity and
information isolation. A safety, comparability or budget failure stops expansion.

### 3. The bounded sample and later effects are observed
Type: Behavior
Status: planned
Behavior: Continue the same rule for the next three eligible changes within the
remaining budget/window; preserve all attempts and perform the later-effect checks.
Proof: At most four enrolled pairs, a complete screened-case ledger, first-case
rules unchanged, per-case denominators, attributed outcomes and explicit gaps.
The time/budget cap is a valid stop; do not create extra cases to replace failures.

### 4. The maintainer receives a reproducible decision
Type: Behavior
Status: planned
Behavior: Apply the frozen gates, reconcile unknowns and cost, and decide whether
to retain current practice, propose a bounded rollout, revise, or remain inconclusive.
Proof: Recompute paired medians/totals from case records, trace every changed
reference decision, and report controller cost and limitations at ODF-150 without
new occurrence counts or an automatic finding retirement. No automatic adoption.

## Existing solutions, architecture and preparation observations

PFE: reuse `consumer-trace.mjs`, current per-path dispositions and proof records;
reuse ADR 0010 and the empirical-control report's experiment contract. A temporary
case form is the gap; no tracing engine, second store or new architectural boundary
is needed. Reject an unpaired before/after comparison because task/model mix changes;
reject showing both packets to one reviewer because the first reveals the case.

Current runtime contract inspected at
`src/skills/dough-story-refinement/references/executable-proof.md:105-123`.
In this preparation checkout, the unpaid command
`node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/consumer-handoff-trial --path src/skills/dough-execute-plan/scripts/resolve-publication-landing-context.mjs --term resolvePublicationLandingContext`
produced a complete Markdown record (5,189 bytes/59 lines), its disposition column
and a real publication caller. It settles the output/retention route, not correctness
of any hypothetical exclusion. Full paired-review execution remains slice 1's probe.

Unpaid synthetic arithmetic check: A review minutes `[5,6,7,8]`, B `[3,4,4,5]`,
common preparation one minute each, A extra preparation zero and B extra 0.5
each yields median paired reduction 38.75%, 2.5 minutes saved and T totals
30 vs 22 minutes (26.67% lower). It is
calibration only; a missing purpose, lost A lead or unknown timing overrides it.

## Plan concerns and readiness basis

Refinement ran: retain all four boundaries for calibration, first-case learning,
bounded collection and decision. Separate common/receiver discoveries, preserve
packet equivalence and reserve closing effort. No remaining slice-specific concern identified.
Host-dependent observation is explicitly owned by the authorized early probe.
The sample cannot establish sustained effectiveness; this is an evaluation limit,
not an extra implementation promise. Proposed criteria are fixed before activation.
The reviewed preparation landed before execution admission. Current authority
is this bounded trial; runtime guidance and standing automation remain excluded.

## Execution and resume

Owned checkout `/Users/terryyin/git/open-dough/.worktrees/consumer-handoff-trial`,
branch `codex/consumer-handoff-trial`; default checkout `/Users/terryyin/git/open-dough`.
Story Branch Mode, remote `origin`, trunk `main`; pushes authorized. Preparation
accepted at `8caaa6507a5fd9b123d5e449aba13ac1fa971358`; execution claim
`9f5bf344ec08f6160886c4e2f9a14e015f771bf9`, agent `YeongSheng-chan`.
Reuse this checkout and claim; this session created the worktree before preparation.
Locked setup and checkout-local lint passed. No tracing/runtime source change is authorized.
[Trial ledger](TRIAL-LEDGER.md) owns screenings, calibration, timing and remaining budget.
Pre-activation landing/setup is separate and its total effort is unknown.
Slice1 proof: CALIBRATION-RECEIPT.md preserves v1 failure; corrected rubric in
CALIBRATION-SCORING.md and independent refactor (no edits) accept limited host/gap
feasibility, not corrected-reviewer performance. Original six hashes match.
Next: first potential prospective candidate90ea7710 awaits eligibility/freeze;
never turn rehearsal into a prospective pair. All case proof/later effects remain owed.

## Story obligations

### G1. Initial scoring brief omitted M/G definitions
Reported: slice 1 — "calibration reviewers caught specific gaps but v1's missing definitions produced inconsistent numeric labels; source review acceptance inspected both retained reports."
Story clause: "measuring missed consumers, useful discoveries and review effort before deciding whether to change the mechanism."
Disposition: proved by slice 1: CALIBRATION-SCORING.md applies the frozen definitions to each observed purpose, preserves failed v1 results and unknown historical denominators; REVIEWER-BRIEF.md revision 2 supplies those definitions. First-case audit remains required.
