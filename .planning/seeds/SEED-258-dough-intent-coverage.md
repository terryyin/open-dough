---
id: SEED-258
status: active
planted: 2026-11-07
scope: epic
---

# Dough Intent Coverage

<a id="dough-intent-coverage"></a>

### Assess story intent coverage across projects and during wrap-up

The pilot and the remaining stories grew out of the original intent coverage backlog item.

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

On 2026-11-08 Terry chose **Narrow** for the public manual skill. Offer one
targeted scratch break check when ordinary review raises a plausible
protection gap for an important promise. The pilot's miss and incomplete
effort comparison limit the decision to this technique. Evaluate automatic
use separately after observing developers use the manual skill.

## Story decomposition

<a id="assess-intent-coverage-during-wrap-up"></a>

### 3. Find the intent assessment in a recently done story

**Identity:** SEED-258#assess-intent-coverage-during-wrap-up
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-258#assess-intent-coverage-during-wrap-up","dependencies":[{"supplier":{"identity":"SEED-258#invoke-intent-coverage-manually","href":"seeds/SEED-258-dough-intent-coverage.md#invoke-intent-coverage-manually"},"implementation":"Invoke the public manual skill from wrap-up and store the returned result in the done-story record.","rationale":"Wrap-up consumes the same proven assessment that developers can invoke manually.","condition":"The public dough-intent-coverage skill can be invoked manually, returns its assessment as output, and has been demonstrated with different test stacks.","state":"satisfied","resolution":{"revision":"3f5fdf1888448d520292624d934902b280ac660e","path":".planning/seeds/SEED-258-dough-intent-coverage.md#invoke-intent-coverage-manually","summary":"Plan 503 slices 2–4 proved direct manual invocation in fresh installations of Codex with Open Dough Playwright and Cursor with Lizard Nix/pytest. Both returned a scoped Caught assessment after a passing baseline, the intended assertion failure, and a restored pass. The public v0.3.90 tag on origin (5539586fd440c1a71c6f7c4868d95b965ef715dc) declares dough-intent-coverage/SKILL.md and finish-report.mjs in install.sh. Both files match the supplier revision that retained the completed proof, so the tested manual skill and its report helper are available through the released payload.\nCondition satisfied: The public dough-intent-coverage skill can be invoked manually, returns its assessment as output, and has been demonstrated with different test stacks.\nAccepted integration: 360c43923d7470247aeb57d057b85676cb2e1b68 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/509-assess-intent-coverage-during-wrap-up/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"05fe7b65728d76d6fe9b3db572d80c805228be3bc664e4f6711809039ce8198d","plan":"c516acef296028bbb7e76b60b7ea74a5a797ec97dbf97f9fb80ddac14d81255f"}}
```

**Goal.** A developer who closes a feature story through wrap-up can later
select it in Recently done and read one targeted intent coverage result for
it, with its cost, without invoking the check separately. The results show
how the targeted check performs on real stories and what it costs, which
informs whether automatic use stays worthwhile.

**Scope.**

- *Eligibility.* Wrap-up runs the check for each completed feature story it
  closes, planned or planless. Bounded retrospective corrections and
  context-only instructions are excluded: neither adds a story promise to
  check.
- *Invocation.* Once execution completion is established and before the
  before-cleanup commit, wrap-up invokes the installed `dough-intent-coverage`
  skill with the story section, its plan when one exists, and the completed
  work's revision. Prefer a plausible protection gap for an important
  promise raised by the retrospective or another review of the story;
  otherwise the check selects the most important promise from the story's
  key examples.
- *Storage.* `complete` stores the returned report verbatim in the story's
  done record beside the backlog. One record holds at most one result. The
  existing rolling 30-day cleanup prunes it with the record. Records
  without a result, including older records, stay valid.
- *Incomplete evidence.* Wrap-up stores whatever outcome the skill returns,
  including **Insufficient evidence** and unavailable cost entries with their
  reasons. When the invocation returns no report, wrap-up stores an
  unavailable result naming the reason and continues closure. The check
  never blocks or delays the remaining cleanup decisions.
- *Rendering.* Selecting a completed story from Recently done shows its
  stored result in Intent's story summary: the outcome, promise, fault, and
  evidence, and the four cost entries as recorded, including test runtime,
  human and agent effort, and invocation-to-report elapsed. Units,
  measured or estimated labels, and unavailable values are shown as
  recorded. A story without a result shows no assessment.
- *Repeat.* A repeated wrap-up of the same story, or a repeated `complete`,
  leaves one result. When the done record already holds a result, wrap-up
  does not run the check again.
- *Scope limits.* No assessment of more than one promise per story, no test
  repair, no new finding records, and no change to the manual skill's
  outcomes or cost entries. Whether automatic use continues is a later
  decision informed by these results.
- *Architecture.* The done record remains the durable published fact
  [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
  describes. The dashboard reads it the same way it reads the title.

**Key examples.**

1. A completed planned feature story whose retrospective named a weak
   assertion for its main promise → wrap-up runs the check on that promise and
   gets **Caught** with a 2.1 s measured test runtime, unavailable human
   effort, estimated agent effort, and a measured elapsed time. The developer
   selects the story in Recently done and sees the same outcome and the four
   entries with their labels.
2. A completed guidance-only feature story with no maintained assertion for
   its promise → the check returns **Insufficient evidence** naming the
   missing assertion. The record stores it, and Recently done shows that
   outcome and its reason.
3. The check is interrupted before it returns a report → the done record holds
   an unavailable result naming the interruption. Closure finishes, and
   Recently done shows the result as unavailable with that reason.
4. A bounded retrospective correction closes → no check runs, and its done
   record has no assessment.
5. Wrap-up of a story whose done record already holds a result is repeated →
   no second check runs, and the record still holds one result.
6. A done record completed 31 days ago → the next `complete` removes it with
   its result, as before.

## Ordering and scope reduction

Wrap-up waits for a public release that contains the manual skill. On
2026-11-08 Terry chose to automate the check in wrap-up once that release
ships, without waiting for further manual use. The stored results supply the
cost evidence for later review.

## Separate test follow-up candidates from the trial

- Reach the Recently done **Select story** control through actual Tab
  navigation while retaining the Enter and Space activation checks.
- Exercise maintenance selection with an otherwise eligible hidden project
  and verify the consumer still selects it. The existing save-and-reload
  check establishes the inventory input.

These are test opportunities identified at the trial's trunk recheck.
[Test follow-up rationale][trial-test-candidates].

[trial-evidence]: https://github.com/terryyin/open-dough/blob/b0ad4c799d4b659ed072591e8dc0e66b4caefc2e/docs/intent-coverage-trial/README.md
[trial-test-candidates]: https://github.com/terryyin/open-dough/blob/b0ad4c799d4b659ed072591e8dc0e66b4caefc2e/docs/intent-coverage-trial/README.md#test-follow-up-candidates
