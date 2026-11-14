# Review of ADR 0005's A/B guidance against the native comparison cases

Maintainer record, 2026-11-14. [ADR 0005](../adrs/0005-cross-tool-validation-accepted.md)
section 4 (compare outcomes when choosing an improvement) was written from an
earlier comparison, before a reusable capability existed. SEED-346 built that
capability ([native comparison cases](../../Distribution/tests/native-comparison.md))
and was asked to review the guidance after its first end-to-end runs. This
record states whether the guidance fits and recommends changes for a human
decision. It does not amend the ADR; Terry owns amendment and acceptance.

## Evidence reviewed

- Two cases extracted from real work, each qualified natively on Codex
  0.169.0 (`gpt-6.1-sol`, `xhigh`): the paused-supplier hold (one four-turn
  journey, 21.6 min) and the Doughnut proof calibration (one turn, 12.7 min,
  after a first journey that could not start Nix from `/var/folders`), with
  plausible wrong decisions rejected by each separate assessor.
- Two paid pairs, release v0.3.98 against trunk `91f32d39`, kept in each
  case's `comparisons/`: paused-supplier preserved (candidate 59 commands
  against 69, 66 s slower); Doughnut improved, but the installed
  `dough-intent-coverage` skill the case exercises was identical in both
  payloads, so the difference is not attributable to the factor.
- A refresh of the paused-supplier assessment and recovery of both earlier
  records' bases from Git after the harness moved under `Distribution/`.
- Credential-free journeys of refused requests and of arms that stop, lose
  their stream, report another session or leave no session record
  (`Distribution/tests/native-comparison-incomplete.sh`); no paid run.

## Fit

The guidance fits what was built and observed; nothing here argues for
reversing it.

| ADR 0005 statement | Observation |
| --- | --- |
| State the expected gain and quality criteria before running | Each pair records its factor, gain and criteria before either arm starts; this worked without friction. |
| Same task, isolated runs, matched conditions | Task, case and project basis, host, requested settings and events matched by construction; arms were isolated down to their own MySQL server. Host load, service latency and how many workers Codex spawned (three per arm in both pairs) could only be recorded, not matched. |
| Pin the payload in each arm and vary the factor | Freezing each payload as a commit and tree before either arm worked; a release tag alone was a label. Pinning did not show whether the factor reached what the case exercises (the Doughnut pair). |
| Judge outcome and proof first, then total effort | Decisive in practice: the Doughnut baseline reported Caught but its fault run instrumented production code, and the assessor failed it from observed test runs, not the agent's report. Total effort was only partly available (below). |
| Representative real-work examples, kept in Open Dough, with origin, smallest runnable context and selection tags | Both cases keep provenance, extraction recipes and tags; a catalog selects them. Extraction fidelity and harness faults (a path naming the harness, Nix's temporary directory, live database ports) surfaced only in native runs. |
| Remove spent evidence at wrap-up; recover tracked evidence through Git | Compact records stay tracked and recover their exact basis through Git; raw attempts are spent after assessment. Raw Codex session records carry account identities. |
| Deterministic counterexamples for runners and assessors; actual sessions for native behavior | Substitute hosts proved the runner, observer, assessors, judge, refusals and incomplete evidence; records now say when a host was a substitute. |

## Difficulties the guidance does not yet name

- Qualifying a case cost more than running it: the Doughnut case needed a
  diagnostic second paid journey, and the paused-supplier observer was
  corrected after its paid run.
- One pair is one stochastic observation. The Doughnut verdict changed
  with no difference in the guidance it exercised.
- Tokens and cost were unavailable without reusable accounting (SEED-345);
  recoveries and interventions were runner facts, not the maintainer's
  qualification and diagnosis effort.
- Missing evidence needed explicit handling: an arm can stop, lose its
  stream or session record, and the honest result is incomplete or not
  comparable with the unknowns named, not a verdict or a zero.

## Recommendations for a human decision

1. Add to section 4 that an example is qualified natively before it informs
   a decision: it still requires the judgment, a plausible wrong decision
   fails its separate assessment, and its preparation and run time are
   measured. Evidence: both qualifications found faults only a native run
   showed.
2. Add that a comparison confirms the payloads differ in what the example
   exercises; otherwise it measures run-to-run variance, not the factor.
   Evidence: the Doughnut pair.
3. Say that conditions that cannot be matched (host load, service latency,
   delegated workers) are recorded, and that an unknown condition or effort
   dimension stays unknown, never zero: a pair with unmatched or unknown
   conditions, or with an arm that did not complete, supports no outcome or
   effort conclusion. Evidence: the incomplete and not comparable journeys,
   and token accounting still unavailable.
4. Say that a single pair supports only its observed comparison; a decision
   that depends on the size of an effect needs repeated pairs or a stated
   variance limit, as ADR 0010 already bounds conclusions.
5. In section 5, note that raw native session records may hold account
   identities: keep them local and remove them with the other spent
   evidence.

None of these changes the ADR's decision; each makes explicit what these
runs needed. Section 3's host rule also held: the evidence covers Codex
only, and Claude Code and Cursor remain unqualified.
