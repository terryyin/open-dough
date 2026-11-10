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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/572-finish-opted-in-stories-with-intent-coverage/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"711d394d83f231a6b7eb91e0eaa6913193030f9ee013dffcc528f64d7d5ddf0d","plan":"3c521b7bca1d10c070d702c973abce84a9baf31a86e569e455054c0580ad1065"}}
```

**Goal:** A developer closing a feature story in a project that
[opts in to Intent Coverage](../../src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage)
can read the returned report in Done and see the disposition of every actionable
finding. Closure must not discard evidence merely because the probe finishes later.

**Scope:**

- For an eligible opted-in story, request the existing targeted check for the
  completed implementation revision. Continue independent wrap-up work while it
  runs, but obtain and preserve the report before publishing Done or deleting or
  retiring context needed to resume. **Insufficient evidence** counts as a report;
  ordinary restoration/cleanup gates still apply. Worker failure or an applicable
  deadline without a report leaves closure unfinished, with recovery surfaced.
- Retain the story/revision, worker continuation, saved report and completed
  dispositions in resumable closure context. Reuse a returned report for that
  revision and recognize already-applied dispositions on resume. Preserve the
  report outside a checkout cleanup may remove. After a repair changes the checked
  promise, establish current applicability before closure. Name the checked revision;
  one probe does not establish protection for the entire story.
- Give each actionable gap a disposition with evidence and rationale. Extend an
  existing retrospective follow-up's plan and proof when its outcome fits;
  otherwise reuse matching queued work or queue a separate correction. Place new
  work after the retrospective follow-up by default, ahead only for a dependency
  or material risk, recording why. Preserve one canonical home and avoid duplicates.
- Queue routine test strengthening quietly within wrap-up's authority. Surface
  findings needing developer judgment, materially changing priorities, or calling
  the completed story's proof into question. Settle evidence of an actual delivered
  defect before closure; a deliberate scratch fault alone is not such evidence.
- Preserve the worker report verbatim and include separately identified wrap-up
  dispositions in the saved Done report. Keep the existing completion-record
  schema and reading surface; no temporary file is the only home of the final result.
- When the ordinary execution process retrospective is selected and automatic
  coverage runs, keep product and proof review before wrap-up and defer that one
  process review until the report and dispositions are available. Supply the
  report, available run history, elapsed time, setup/waiting problems and follow-up
  decision. Existing execution-retrospective selection, explicit skips and missing
  history rules still apply. Do not start another process review just for wrap-up.
  Remove Story Wrap Up's separate `--process-retrospective` flag; retain Dough Land's.

Required restrictions protect truthful completion, recoverable work and human
decision ownership. Deferred promises: changing opt-in selection, the probe's
verdicts or handoff technique, routine-benefit measurement, dashboard redesign,
historical Done backfill, a generic worker service, and release/rollout. Later
work owns verdict and handoff improvements. Opt-in and this lifecycle can
develop independently with one shared wrap-up owner and reconciliation; shared
files do not require a blocking story dependency.

**Key examples:**

| Pre-condition | Trigger | Result |
| --- | --- | --- |
| Opted-in completed feature; probe still running | Independent wrap-up work finishes | Wait at closure; do not publish Done or erase resumable sources. On return, save the report and finish its dispositions before closure. |
| Probe returns **Insufficient evidence** with a missing observation | Wrap-up receives it | Preserve that report and explain the disposition; inconclusive evidence is distinct from a missing report. |
| Worker fails or reaches an applicable deadline without a report | Closure reaches its join | Surface recovery, retain active context, and leave closure unfinished. Resume reuses any report already returned for the same revision. |
| Gap fits an existing retrospective correction | Disposition | Extend that plan and proof, link the evidence, and retain one queued identity. Repeat closure adds no duplicate. |
| Gap needs a different correction; matching queued work may exist | Disposition | Reuse that work or queue a new story after the retrospective follow-up; justify a dependency/risk exception and surface material priority judgment. |
| Report exposes an actual delivered defect or disputed proof | Wrap-up reviews findings | Settle the defect or obtain the responsible developer's decision before closing; ordinary test-strengthening alone can be queued quietly. |
| Process review selected and automatic probe runs | Execution hands off to wrap-up | Product/proof review already stands; process review runs once after report/disposition with their cost/history. A skipped process review stays skipped. |
| Automatic checking off, ineligible work, or already-published Done result | Direct or continued wrap-up | No new coverage wait or duplicate check; preserve existing eligibility, selection and saved results. |

**Investigation, alternatives and challenge:** The audit found three checks that
returned after wrap-up had recorded them as unavailable ([example](https://github.com/terryyin/open-dough/blob/f07d764744ba5cfe56666469356ada584f642830/.planning/done/SEED-283_keep-done-story-intent-pinned.json)).
At `f8dcc87a7`, wrap-up explicitly permits closure without waiting, while the
real completion CLI preserves verbatim reports and repeat results. A focused
completion test passed, failed with report persistence temporarily removed, and
passed after exact restoration. This establishes storage reuse, not native agent
execution of the proposed lifecycle.

A serial check before all closure work is simpler but delays independent work.
The recommended parallel check with a closure join retains that work and fixes
the observed loss. Borrow the manufacturing quality-hold mechanism: the checked
revision identifies the lot, the report is inspection evidence, disposition is
the rework decision, and handover waits for both. Its limit matters: this single
targeted probe is no comprehensive quality certificate. Best-effort closure with
late enrichment leaves the original reader without the promised finished report.
The strongest doubt is that a stored report could hide an unresolved delivered
defect; explicit disposition and the existing defect-before-closure rule address
it. The net benefit of routine probes remains unestablished and outside this story.

**Architecture:** Wrap-up owns the join and disposition; the manual skill owns
scratch restoration, completion owns published persistence, and execution
retrospective owns process selection. Reuse those boundaries and existing closure
recovery rather than copy the CI observer into a worker framework under
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
Keep runtime rules with their owner and link callers under
[ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
The repository's Done record remains authoritative under
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
Author source guidance under [maintainer guidance](../../AGENTS.md), leaving
installed copies to a later release under
[ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md).
Use representative behavior review under
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md), and distinguish
the delivered evidence-preservation outcome from an improvement claim under
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).
The ADR index and relevant statuses agree; no Accepted conflict or new direction is needed.
