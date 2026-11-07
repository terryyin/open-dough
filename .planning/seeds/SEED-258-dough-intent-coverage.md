---
id: SEED-258
status: active
planted: 2026-11-07
scope: epic
---

# Dough Intent Coverage

<a id="dough-intent-coverage"></a>

### Assess story intent coverage across projects and during wrap-up

The three stories below replace the original backlog item `SEED-258#dough-intent-coverage`.

**Parent outcome.** Developers can decide which promises in a completed
story are protected by its maintained tests and which protections to retain,
clarify, or strengthen. The sequence below tests whether the assessment
earns the cost of making it a public skill and invoking it during wrap-up.

## Why this matters

The Open Dough trial traced three completed stories to their implementation
and maintained tests. All focused baselines passed. Two deliberate production
faults reached the relevant behavior while the original tests stayed green.
One removed a Recently done control from Tab order while the test focused it
programmatically. The other substituted Branch CI figures for Landed figures
while the fixtures gave both runs identical counts and durations. The review
also distinguished saved project membership from proof that downstream
maintenance consumers still select hidden projects.

The independent assessment missed both known calibration journeys: clicking
inside an opened disclosure and opening Review from Intent for a marked story.
It found related weaknesses without exercising the two specific paths. Across
the three cases, assessors spent about 20 minutes in total, plus about two
minutes for the trunk recheck. Coordination, developer review, and a timed
ordinary-review baseline were unmeasured. These results support testing a
shorter comparison and leave routine adoption inconclusive.
[Trial evidence and Terry's evaluation][trial-evidence].

## Alternatives and decision

Ordinary review remains the baseline. Deferring saves assessment effort but
leaves the value of the useful fault probes unanswered. Repeating the full
historical exercise would produce more verdicts while leaving the comparison
cost unanswered. Start with a short manual assessment beside an independent
ordinary review on the same completed stories. Pursue a public skill when
Terry judges that the verified decisions and important misses justify the
total effort. Evaluate automatic wrap-up after developers have used the
manual skill. [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Story decomposition

<a id="compare-manual-intent-coverage"></a>

### 1. Compare a short manual intent assessment with ordinary review

**Identity:** SEED-258#compare-manual-intent-coverage
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/498-compare-manual-intent-coverage/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"fdc81fba912f0082ec457dd9bdc7c7b38a2f01fbfa977fc11078862580c514fc","plan":"91b8c282b6bb2501cbc0376be49f53926539e08b949401f00e3791b1242a0af2"}}
```

**Goal.** Terry decides whether to proceed with, narrow, or stop a public
intent-coverage skill, based on a measured comparison. The comparison sets a
short AI intent assessment beside the ordinary review that already ran on the
same completed stories. It compares verified decisions about protecting story
intent, consequential misses, unsupported claims, and total effort. An
equivalent useful outcome with lower total effort can qualify
([ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md#decision)).
The comparison and any test decisions it produces stand on their own if
Terry declines public delivery.

**Scope.**

- **Basis before the run.** Terry confirmed the cases, ordinary-review
  source, effort budgets, and decision criteria in
  [Plan 498](../slice-plans/498-compare-manual-intent-coverage/PLAN.md#confirmed-comparison-basis)
  on 2026-11-07. A later change requires his decision and is disclosed with
  the result.
- **Cases.** Three recent completed stories whose recorded execution
  retrospective is recoverable from Git and whose host sessions are on this
  machine. The cases are
  SEED-254#use-later-ci-proof-for-cancelled-landings, whose retrospective
  found the running-after-proofless defect, and SEED-256 and SEED-257, whose
  retrospectives advised no change.
- **Ordinary review.** The ordinary review is the execution retrospective
  that already ran for each case: its product advice, any correction it
  planned, and the source review. Its agent time comes from the recorded
  host session timestamps, or is recorded as unknown. Terry rereads each
  retrospective result, timed, for his reading and verification effort.
  Credit the pre-existing unavailable-slot retry issue to ordinary review
  and keep it outside the story-attributable comparison counts.
- **Short intent assessment.** A fresh agent assesses each case at its last
  attributable implementation revision, before the execution-complete
  record, using the brief the plan writes. Its ten minutes per story cover
  setup, test runs, and writing the report. It traces the story's promises to
  production paths and maintained tests. It runs the relevant existing tests
  and at most one selective break check per story. It returns brief, sourced
  verdicts of protected, protected and break-checked, gap, or unknown, and
  identifies promises left unassessed at the limit. Give it a fresh context
  with a brief limited to the historical
  inputs. Before it starts, verify the checkpoint is readable with inherited
  Git object alternates cleared and the case's execution-complete commit is
  unavailable from that store.
- **Verification and decisions.** Terry has ten minutes per case to read both
  reviews and verify findings, timing those activities separately. Each
  distinct finding becomes one entry. Credit a verified match when both
  reviews identify the same failure path with evidence. Keep unknown
  verdicts, unsupported claims, and findings unverified at the time limit
  distinct. Count a consequential miss when one review fails to identify
  the specific consequential finding verified in the other. Terry records
  decisions on verified findings and applies the confirmed criteria.
- **Time and effort.** Each assessment report, and the comparison for each
  case and review, shows the measured end-to-end wall-clock time from start
  to returned result, including setup and test runs. It shows test runtime
  separately when observed. It also shows human and agent effort separately
  where there is evidence, each with its unit and basis. Every figure is
  labelled measured or estimated, and a figure that cannot be observed is
  shown as unavailable rather than omitted or zero. Elapsed time and effort
  are reported as different figures. In the comparison, the reviewer's
  reading time and verification time are separate figures, apart from the
  assessment's own runtime. Use counts rather than rates. Label the
  ordinary-review side exploratory because it is historical. Claim lower
  total effort only with comparable cost evidence.
  [Architectural North Star](../NORTH-STAR.md#intent-assessment-results-carry-their-cost).
- **Result.** The comparison record lives with the plan. Terry's decision to
  proceed, narrow, or stop, with its reasons and a link to the record, is
  recorded in this story. Wrap-up carries the decision and a pinned
  comparison link into surviving context or the next story's dependency
  resolution.
- **Scope limits.** Implementing test changes the decisions call for, and
  further SEED-258 test follow-ups, are separate queued work. Also out of
  scope: a new skill, script, or dashboard view; seeded-fault calibration of
  either review; a rerun of the ordinary retrospective; Cursor-hosted cases
  with no local session timing; and statistical estimates of total gaps.
- **Boundary assumptions.** Assessment agents run inside the executing
  session; they are not paid native host runs. Break checks are local
  scratch edits that are reverted, and their tests run under the project's
  [failure policy](../../AGENTS.md#failing-and-flaky-tests).

**Key examples.**

- *Known ordinary finding.* SEED-254's cancelled-landing retrospective found
  that Landed says no later trunk build has finished when the forward walk
  passes a proofless build and then meets a running one. Credit the blinded
  assessment when it identifies that specific sequence and supports the
  finding. An unknown stays unresolved. If the assessment leaves that
  verified path unresolved, rates it protected, or omits it, record a
  consequential miss for the assessment.
- *Pre-existing issue.* The SEED-254 retrospective already reported that
  **Check again** could not recover a cached unavailable comparison. If the
  assessment independently spots it, record the observation with the
  existing retry story and exclude it from the story-attributable counts.
- *Assessment-only finding.* For a case whose retrospective advised no
  change, the assessment reports that a fixture gives two compared runs
  identical values for a displayed figure. A break check that substitutes one figure
  for the other reaches the formatter, and the test still passes. The gap
  is verified, it counts as a miss for the ordinary review, and Terry
  decides whether to strengthen the test.
- *Break check that proves nothing.* The fault never reaches the intended
  path, for example because the fixture bypasses the changed function. The
  probe is recorded as not reaching the path, and the verdict stays at what
  source and passing tests support.
- *Unsupported claim.* The assessment calls a promise unprotected, but Terry
  finds a maintained test that exercises it. The finding counts as
  unsupported, and its reading and verification time counts as cost.
- *Unavailable evidence.* The historical checkpoint cannot run the relevant
  tests, for example because native setup fails. The verdict is unknown,
  not inferred from source.
- *Blinding fails.* With alternates cleared, the checkpoint store still
  resolves the case's execution-complete commit. The assessment does not
  start until a store without that object is in place.
- *Decision.* With the counts and effort table in front of him, Terry
  can proceed on verified added value at justified cost or equivalent
  useful decisions at demonstrably lower total effort. If the assessment
  adds a useful break check while missing a consequential gap, he can narrow
  the method to that technique. The next story's dependency records which
  scope he authorizes or remains waiting after a stop.

<a id="invoke-intent-coverage-manually"></a>

### 2. Invoke Dough Intent Coverage manually across test mixes

**Identity:** SEED-258#invoke-intent-coverage-manually
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-258#invoke-intent-coverage-manually","dependencies":[{"supplier":{"identity":"SEED-258#compare-manual-intent-coverage","href":"seeds/SEED-258-dough-intent-coverage.md#compare-manual-intent-coverage"},"implementation":"Generalize the assessment method that the measured manual comparison supports.","rationale":"The public skill needs a demonstrated improvement over ordinary review before it is generalized.","condition":"The measured comparison records verified decisions, consequential misses, and total effort, and Terry records a decision to proceed with generalizing the method.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer can invoke the public `dough-intent-coverage`
  skill for a selected story and receive a sourced account of the promises
  the project's tests protect, along with the time and effort it took to
  assess them.
- **Evaluation.** A developer invokes the installed skill in a project with
  browser and unit tests and in a project with a different test stack. The
  assessment uses each project's own test commands and relates end-to-end,
  integration, and unit assertions to the promises they exercise. It
  distinguishes observed results, gaps, and missing evidence. The skill
  returns the assessment and its cost evidence as output. The rendered
  assessment shows measured end-to-end wall-clock time, separate test
  runtime, and human and agent effort where there is a basis to report it.
  Show the units and evidence labels for measured and estimated figures and
  identify unavailable values. The caller decides whether and where to save
  the result.
  [Architectural North Star](../NORTH-STAR.md#intent-assessment-results-carry-their-cost).
- **Prerequisite.** A measured pilot that Terry judges worth generalizing.
  Use the supported method and project conventions with one shared source
  for Codex, Cursor, and Claude Code.
  [AGENTS.md](../../AGENTS.md),
  [ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md),
  [ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
- **Effort and stopping point.** Largest candidate because it needs evidence
  across real test mixes and supported hosts. Manual invocation is useful
  on its own if wrap-up integration is deferred.

<a id="assess-intent-coverage-during-wrap-up"></a>

### 3. Find the intent assessment in a recently done story

**Identity:** SEED-258#assess-intent-coverage-during-wrap-up
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-258#assess-intent-coverage-during-wrap-up","dependencies":[{"supplier":{"identity":"SEED-258#invoke-intent-coverage-manually","href":"seeds/SEED-258-dough-intent-coverage.md#invoke-intent-coverage-manually"},"implementation":"Invoke the public manual skill from wrap-up and store the returned result in the done-story record.","rationale":"Wrap-up consumes the same proven assessment that developers can invoke manually.","condition":"The public dough-intent-coverage skill can be invoked manually, returns its assessment as output, and has been demonstrated with different test stacks.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer can close an eligible story and read the
  assessment afterward without a separate invocation.
- **Evaluation.** Wrap-up calls the same assessment before cleaning up the
  story's source records and stores the returned result, including its
  timing and effort evidence, in the story's done-record JSON beside the
  backlog. The rendered assessment for the recently done story shows the
  recorded wall-clock time, separate test runtime, and any reported effort,
  preserving the units, evidence labels, and unavailable values. A repeat
  wrap-up leaves one result. The existing rolling 30-day cleanup prunes the
  result with the record.
  Settle eligibility and the handling of incomplete evidence in refinement.
  [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state).
- **Prerequisite.** A usable manual skill and evidence from its use that
  justifies the additional wrap-up cost.
- **Effort and stopping point.** Narrower than public delivery, with
  uncertainty around eligibility and recovery. The recent assessment stays
  readable through the existing completion record.

## Ordering and scope reduction

The backlog lists the comparison first. The manual skill waits for the
comparison and Terry's decision to generalize. Wrap-up waits for the manual
skill, and its additional cost is evaluated before execution. Effort is
comparative and unbanded because Open Dough has no established S/M/L
calibration.

## Separate test follow-up candidates from the trial

- Reach the Recently done **Select story** control through actual Tab
  navigation while retaining the Enter and Space activation checks.
- Exercise maintenance selection with an otherwise eligible hidden project
  and verify the consumer still selects it. The existing save-and-reload
  check establishes the inventory input.

These are test opportunities identified at the trial's trunk recheck.
[Test follow-up rationale][trial-test-candidates].

## When to surface

Surface the first candidate when Terry selects a measured comparison. Review
the later candidates against its outcome and the cost of the manual workflow
before selecting them.

[trial-evidence]: https://github.com/terryyin/open-dough/blob/b0ad4c799d4b659ed072591e8dc0e66b4caefc2e/docs/intent-coverage-trial/README.md
[trial-test-candidates]: https://github.com/terryyin/open-dough/blob/b0ad4c799d4b659ed072591e8dc0e66b4caefc2e/docs/intent-coverage-trial/README.md#test-follow-up-candidates
