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

<a id="make-intent-coverage-results-easier-to-act-on"></a>

### Make Intent Coverage results easier to act on

**Identity:** SEED-258#make-intent-coverage-results-easier-to-act-on
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/573-make-intent-coverage-results-easier-to-act-on/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"53d8949f52c12354c8e277d0c41fb6856af2fc302cbeebba6b9d23c62520d206","plan":"c693b4785cc8d35a1dc945b862296287ad00e8d13d537899d90168fdf302c3d3"}}
```

**Goal:** A developer reviewing an Intent Coverage result can choose whether to
add proof for a missing journey, strengthen an existing assertion, or gather more
evidence. Establish whether reusing a focused handoff earns its total cost before
keeping that workflow change.

**Scope:**

- Add **Confirmed missing test path** when an independent scratch observation
  establishes that the fault causes the promised behavior to go wrong, while
  the relevant maintained checks pass and omit that path. Name the checks
  examined and the omitted transition; preserve the passing baseline, faulted
  observation, exact restoration and restored pass. Bound the finding to the
  examined checks rather than claiming absence across the whole suite.
- Keep **Assertion gap** for a maintained check that exercises the wrong
  behavior but whose assertion passes, and **Caught** for a maintained assertion
  that fails on that wrong behavior. Identify the assertion that actually caught
  it, including an earlier helper assertion. Use **Insufficient evidence** when
  passing baseline, reach, wrong behavior or restoration remains unresolved.
  Merely finding no matching test does not confirm a missing path. The report
  gives the next proof action and distinguishes an already-planned repair from
  a new decision caused by the probe.
- Reuse the promise, plausible fault, focused command, fixture and assertion
  already established by review or execution. These are suggestions: the worker
  validates or revises them and explains a consequential change. Missing hints
  do not prevent a check; search for the narrowest relevant proof, and state the
  remaining gap when proceeding would require a broad exploratory run. Preserve
  the one-promise check, independent behavior evidence and scratch restoration.
- Prospectively compare current and candidate workflows on the same revision
  and promise within each of two cases: one search-heavy and one already focused.
  Record the decision before the probe, the evidence returned, the resulting
  decision and what changed because of the probe, including no change. Use the
  existing report and wrap-up disposition when available; a retained report
  alone does not establish a changed repair decision.
- Include handoff preparation and probe/setup effort, runner time and complete
  invocation-to-report elapsed. Distinguish extra wrap-up wait from elapsed and
  runner time; record unavailable observations with reasons rather than infer
  waiting from either. Keep human and agent costs separate, measured or estimated
  with their basis. Use comparable host token counters when already available;
  their absence does not require new collection infrastructure.

The evidence requirements prevent a green but unexercised path from becoming an
assertion verdict, an unobserved fault from becoming a confirmed gap, or incomplete
cleanup from becoming a successful probe. They protect truthful action and scratch
recovery. Search boundedness limits the cost of this targeted check; it does not
forbid a separately authorized broader investigation.

Deferred promises: changing opt-in, wrap-up's join/disposition lifecycle, Done
storage or dashboard presentation, repairing sampled product tests, historical
report backfill, automatic token collection, general benchmarking, release and
rollout. The [closure story](#finish-opted-in-stories-with-intent-coverage) keeps
ownership of persistence and follow-up routing. Shared files require reconciliation,
not a blocking story dependency.

**Key examples:**

| Pre-condition | Trigger | Result |
| --- | --- | --- |
| Recently done: the examined selection checks pass; a separate scratch journey changes project during a pending read and reproduces wrong navigation; restored checks and journey pass | Classify the report | **Confirmed missing test path**, naming the omitted project-change transition and examined checks; add journey proof. Recognize the existing planned correction rather than claim a new repair decision. |
| A maintained journey reaches the wrong behavior, but its assertion stays green; restoration is verified | Classify the report | **Assertion gap**; strengthen the observing assertion, with independent evidence of the wrong behavior. |
| The fault fails a maintained helper assertion before a later expected assertion | Classify the report | **Caught**, naming the actual catch and limiting the claim to the observed path. |
| Side panel: inspection finds no guide-content assertion, but no fault or wrong-behavior observation ran | Classify the report | **Insufficient evidence**; name the observation still needed. Missing restoration or an unrelated failure is also inconclusive. |
| Review supplies a plausible fault and focused command/fixture/assertion | Request the check | Validate and reuse them, or explain a better target; avoid rediscovering equivalent setup. Incomplete hints lead to bounded proof search, not an obligatory broad sweep. |
| Search-heavy and already-focused samples have paired current/candidate runs | Decide whether to keep the handoff | Compare equally strong evidence and total effort including preparation; report the decision delta, cost limits and any unobserved wait. An unsupported saving remains unknown. |

**Evaluation:** Keep the clearer verdict if a reviewer can distinguish missing
journey proof from inconclusive evidence and choose the appropriate action on the
examples above. Keep the handoff change only if the paired comparison shows lower
total effort by avoiding an unnecessary broad run or equivalent setup, with equally
strong proof and no material extra preparation on the already-focused case. Set
the comparison basis before running; disclose host/setup differences and unknowns.
If evidence falls short, record the negative or inconclusive result and simplify
or retain the existing handoff under
[ADR 0010 — Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md).
The verdict can be retained independently of an unsuccessful handoff trial; neither
result establishes the value of routine automatic checking.

**Architecture:** The checker owns verdicts, proof search, restoration and its
report; Wrap Up passes available context and owns the resulting disposition.
Reuse these owners and the existing report finisher, with no new worker service
or report schema. Author runtime changes in `src/skills/` under
[maintainer guidance](../../AGENTS.md) and
[ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
The conventional skill review and the empirical workflow comparison serve
different proof purposes under
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md).

The Recently done probe independently reproduced a wrong navigation path,
yet its report called the result **Insufficient evidence**. The report already
pointed to a planned correction, so it shows a classification problem without
establishing a missed repair. Its stopped 222-test sweep consumed about three
minutes before the probe reached the relevant checks. A landed CI probe already
had the suggested fault and one focused file, yet took ten minutes with about
40 seconds of runner time. Together these reports justify testing a narrower
handoff and measuring the entire check. [Recently done report](https://github.com/terryyin/open-dough/blob/fe715e5730f2ab3e627517f6b38c7d6eb2683207/.planning/done/SEED-272_select-recently-done-sessions.json) · [Landed CI report](https://github.com/terryyin/open-dough/blob/d887ac73e87d981dc59bae792543907b2b1bbf45/.planning/done/SEED-285_see-landed-ci-wall-time-history.json)
