---
id: SEED-258
status: active
planted: 2026-11-07
scope: epic
---

# Dough Intent Coverage

<a id="dough-intent-coverage"></a>

### Assess story intent coverage across projects and during wrap-up

The completed pilot tested whether developers could decide which promises in a
completed story its maintained tests protect and which tests to retain,
clarify, or strengthen.

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

## Pilot result

**Narrow.** Use one targeted scratch break check on demand during ordinary
review when an important promise has a plausible failure that an existing
assertion may let through. Start from a passing focused baseline, confirm
that the scratch fault reaches the intended assertion, restore the edit,
and record the cost and scope of the result.

The delegated review found that the broader assessment missed the
proofless-then-running Landed defect. The three break checks showed what
their respective tests catch. Comparable total effort remains unavailable.
The evidence supports the targeted technique. A broader assessment and
automatic wrap-up would need further evidence. The pilot also identified
one test improvement. Give the noncausal CI comparison wording assertion
an independent expected result.
[Comparison and decision](https://github.com/terryyin/open-dough/blob/72e0c2f318a4283bff32acd5767a27ecaa576ba8/.planning/slice-plans/498-compare-manual-intent-coverage/comparison.md#delegated-decision)

## Terry's decision

On 2026-11-08 Terry chose **Narrow**. The
[manual skill](../../src/skills/dough-intent-coverage/SKILL.md) offers one
targeted scratch break check when ordinary review raises a plausible
protection gap for an important promise. The
[Done report story](https://github.com/terryyin/open-dough/blob/ca4003714aeaac836819a02f1ec51a95ce4516c9/.planning/done/SEED-258_assess-intent-coverage-during-wrap-up.json)
closed separately. Revisit automatic use if observation of the manual skill
shows that the verified decisions justify the added cost.

On 2026-11-10 Terry asked to remove Story Wrap Up's optional
`--process-retrospective` flag and keep the ordinary execution retrospective
before wrap-up.

## Separate test follow-up candidate from the trial

- Exercise maintenance selection with an otherwise eligible hidden project
  and verify the consumer still selects it. The existing save-and-reload
  check establishes the inventory input.

The trial's trunk recheck identified this test opportunity.
[Test follow-up rationale][trial-test-candidates].

[trial-evidence]: https://github.com/terryyin/open-dough/blob/b0ad4c799d4b659ed072591e8dc0e66b4caefc2e/docs/intent-coverage-trial/README.md
[trial-test-candidates]: https://github.com/terryyin/open-dough/blob/b0ad4c799d4b659ed072591e8dc0e66b4caefc2e/docs/intent-coverage-trial/README.md#test-follow-up-candidates

<a id="finish-opted-in-stories-with-intent-coverage"></a>

### Finish opted-in stories with an Intent Coverage report

**Identity:** SEED-258#finish-opted-in-stories-with-intent-coverage
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

A developer closing a feature story in a project that
[opts in to Intent Coverage](../../src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage)
can read the finished report in Done and see what wrap-up decided to do about
any actionable findings.

- Wrap-up can continue independent work while the probe runs. Before publishing
  Done or retiring the context needed to resume, wait for the probe and preserve
  its report for the completed revision. A returned **Insufficient evidence**
  report counts. If the worker fails or reaches a deadline without a report,
  preserve resumable state and surface the problem. On resume, reuse a report
  already returned for that revision and avoid duplicating follow-ups.
- Give each actionable gap a disposition. If it fits an existing retrospective
  follow-up's outcome, extend that plan and its proof. If it needs a separate
  correction, reuse matching queued work or queue a new story. Put new work
  after the retrospective follow-up by default and before it when a dependency
  or material risk warrants higher priority. Link the evidence and record why.
- Queue routine test-strengthening work quietly when the decision is within
  wrap-up's authority. Surface findings that need developer judgment, materially
  change priorities, or call the completed story's proof into question. Settle
  evidence of an actual defect in the delivered promise before closing the story.
- When the ordinary execution process retrospective is selected and automatic
  coverage runs, keep product and proof review before wrap-up and defer that one
  process review until the probe and its disposition are available. Hand the
  reviewer the report, available run history, elapsed time, setup or waiting
  problems, and follow-up decision. Remove Story Wrap Up's separate
  `--process-retrospective` flag. Use the existing execution retrospective
  selection rules to decide whether process review runs.

In the audit, three checks finished after wrap-up had recorded them as
unavailable, so a developer opening Done could not see their returned evidence.
[Example Done record](https://github.com/terryyin/open-dough/blob/f07d764744ba5cfe56666469356ada584f642830/.planning/done/SEED-283_keep-done-story-intent-pinned.json)

<a id="make-intent-coverage-results-easier-to-act-on"></a>

### Make Intent Coverage results easier to act on

**Identity:** SEED-258#make-intent-coverage-results-easier-to-act-on
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

A developer reviewing an Intent Coverage result can tell whether to add proof
for a missing path, strengthen an assertion, or gather more evidence. A short
comparison shows whether preparing a more focused handoff earns its cost.

- Report a **Confirmed missing test path** when independent observation shows
  the fault causes wrong behavior and the relevant maintained checks omit that
  path. Name the checks examined and preserve the passing baseline and restored
  observation. Use **Assertion gap** when a maintained check exercises the path
  and its assertion misses the wrong behavior. Use **Insufficient evidence**
  when reach, wrong behavior, or restoration is unresolved.
- Reuse the promise, plausible fault, focused command, fixture, and assertion
  when ordinary review or execution already established them. Let the worker
  validate or revise the suggestion. When the context is incomplete, look for
  the narrowest relevant proof and report the remaining gap if the search
  would require a broad exploratory run.
- Compare the current workflow with the candidate on the same revision and
  promise for one search-heavy and one already-focused check. Use the existing
  report and [wrap-up disposition](#finish-opted-in-stories-with-intent-coverage)
  to capture the decision before the probe, any change attributable to its
  evidence, and the cost. Include preparation and probe time, distinguish test
  runtime from added wrap-up wait, and record unknowns. Use comparable host
  token counters when already available for sampled runs. Automated token
  collection stays deferred until a decision needs finer cost evidence.

Keep the clearer verdict if a reviewer can distinguish a missing journey from
an inconclusive attempt and choose the right next action. The Recently done
case below should point to missing journey proof. The [Side panel pilot report](https://github.com/terryyin/open-dough/blob/401bc8bd5d5c12d6d7cd64b43b6763786c59e58e/.planning/done/SEED-268_conclude-fluent-side-panel-pilot.json)
had no observed wrong behavior and should remain inconclusive.
Keep the handoff change if the comparison shows lower total effort by avoiding
an unnecessary broad run or equivalent setup, with equally strong proof and
no material extra preparation on the already-focused case. If it falls short,
record the result and settle the trial using
[ADR 0010, Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md).

The Recently done probe independently reproduced a wrong navigation path,
yet its report called the result **Insufficient evidence**. The report already
pointed to a planned correction, so it shows a classification problem without
establishing a missed repair. Its stopped 222-test sweep consumed about three
minutes before the probe reached the relevant checks. A landed CI probe already
had the suggested fault and one focused file, yet took ten minutes with about
40 seconds of runner time. Together these reports justify testing a narrower
handoff and measuring the entire check. [Recently done report](https://github.com/terryyin/open-dough/blob/fe715e5730f2ab3e627517f6b38c7d6eb2683207/.planning/done/SEED-272_select-recently-done-sessions.json) · [Landed CI report](https://github.com/terryyin/open-dough/blob/d887ac73e87d981dc59bae792543907b2b1bbf45/.planning/done/SEED-285_see-landed-ci-wall-time-history.json)
