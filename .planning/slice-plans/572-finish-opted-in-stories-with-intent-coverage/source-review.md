# Source-only review

**Story:** SEED-258#finish-opted-in-stories-with-intent-coverage
**Launch:** Fresh general-purpose reviewer; input was Goal, Scope, Key examples,
required restrictions, deferred promises, and independence note only. No plan,
product, proof, or project files.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer closing a feature story in a project that opts in to Intent Coverage can read the returned report in Done. | slice 1 | observed: tests/support/product-backlog-complete-intent-coverage.test.mjs + src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage combined Done report text |
| 2 | That Done view shows the disposition of every actionable finding. | slice 1 | observed: tests/support/product-backlog-complete-intent-coverage.test.mjs + src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage combined Done report text |
| 3 | Closure must not discard evidence merely because the probe finishes later. | slice 1 | observed: src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage join before Done/delete/retire; unfinished+recovery |
| 4 | For an eligible opted-in story, request the existing targeted check for the completed implementation revision. | slice 1 | observed: src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage request + continue while running; opt-in selection unchanged |
| 5 | Continue independent wrap-up work while the check runs. | slice 1 | observed: src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage request + continue while running; opt-in selection unchanged |
| 6 | Obtain and preserve the report before publishing Done. | slice 1 | observed: src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage join before Done/delete/retire; unfinished+recovery |
| 7 | Obtain and preserve the report before deleting or retiring context needed to resume. | slice 1 | observed: src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage join before Done/delete/retire; unfinished+recovery |
| 8 | Insufficient evidence counts as a report. | slice 1 | observed: src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage Insufficient evidence is a report; ordinary gates |
| 9 | Ordinary restoration/cleanup gates still apply. | slice 1 | observed: src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage Insufficient evidence is a report; ordinary gates |
| 10 | Worker failure without a report leaves closure unfinished, with recovery surfaced. | slice 1 | observed: src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage join before Done/delete/retire; unfinished+recovery |
| 11 | An applicable deadline without a report leaves closure unfinished, with recovery surfaced. | slice 1 | observed: src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage join before Done/delete/retire; unfinished+recovery |
| 12 | Retain the story/revision in resumable closure context. | slice 1 | observed: src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage retain/resume context; report outside cleanup |
| 13 | Retain worker continuation in resumable closure context. | slice 1 | observed: src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage retain/resume context; report outside cleanup |
| 14 | Retain the saved report in resumable closure context. | slice 1 | observed: src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage retain/resume context; report outside cleanup |
| 15 | Retain completed dispositions in resumable closure context. | slice 1 | observed: src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage retain/resume context; report outside cleanup |
| 16 | On resume, reuse a returned report for that revision. | slice 1 | observed: src/skills/dough-story-wrap-up/references/follow-up-disposition.md#dispose-intent-coverage-findings On resume, reuse a returned report for that revision |
| 17 | On resume, recognize already-applied dispositions. | slice 1 | observed: src/skills/dough-story-wrap-up/references/follow-up-disposition.md#dispose-intent-coverage-findings On resume, recognize already-applied dispositions |
| 18 | Preserve the report outside a location a checkout cleanup may remove. | slice 1 | observed: src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage retain/resume context; report outside cleanup |
| 19 | After a repair changes the checked promise, establish current applicability before closure. | slice 1 | observed: src/skills/dough-story-wrap-up/references/follow-up-disposition.md#dispose-intent-coverage-findings revision naming, applicability, scratch≠defect |
| 20 | Name the checked revision. | slice 1 | observed: src/skills/dough-story-wrap-up/references/follow-up-disposition.md#dispose-intent-coverage-findings revision naming, applicability, scratch≠defect |
| 21 | One probe does not establish protection for the entire story. | slice 1 | observed: src/skills/dough-story-wrap-up/references/follow-up-disposition.md#dispose-intent-coverage-findings revision naming, applicability, scratch≠defect |
| 22 | Give each actionable gap a disposition with evidence. | slice 1 | observed: src/skills/dough-story-wrap-up/references/follow-up-disposition.md#dispose-intent-coverage-findings dispositions, routing, priority, judgment |
| 23 | Give each actionable gap a disposition with rationale. | slice 1 | observed: src/skills/dough-story-wrap-up/references/follow-up-disposition.md#dispose-intent-coverage-findings dispositions, routing, priority, judgment |
| 24 | When a gap's outcome fits an existing retrospective follow-up, extend that follow-up's plan and proof. | slice 1 | observed: src/skills/dough-story-wrap-up/references/follow-up-disposition.md#dispose-intent-coverage-findings dispositions, routing, priority, judgment |
| 25 | Otherwise, reuse matching queued work or queue a separate correction. | slice 1 | observed: src/skills/dough-story-wrap-up/references/follow-up-disposition.md#dispose-intent-coverage-findings dispositions, routing, priority, judgment |
| 26 | Place new work after the retrospective follow-up by default. | slice 1 | observed: src/skills/dough-story-wrap-up/references/follow-up-disposition.md#dispose-intent-coverage-findings dispositions, routing, priority, judgment |
| 27 | Place new work ahead of the retrospective follow-up only for a dependency or material risk, recording why. | slice 1 | observed: src/skills/dough-story-wrap-up/references/follow-up-disposition.md#dispose-intent-coverage-findings dispositions, routing, priority, judgment |
| 28 | Preserve one canonical home for follow-up work. | slice 1 | observed: src/skills/dough-story-wrap-up/references/follow-up-disposition.md#dispose-intent-coverage-findings dispositions, routing, priority, judgment |
| 29 | Avoid duplicate follow-up identities / queued work. | slice 1 | observed: src/skills/dough-story-wrap-up/references/follow-up-disposition.md#dispose-intent-coverage-findings dispositions, routing, priority, judgment |
| 30 | Queue routine test strengthening quietly within wrap-up's authority. | slice 1 | observed: src/skills/dough-story-wrap-up/references/follow-up-disposition.md#dispose-intent-coverage-findings dispositions, routing, priority, judgment |
| 31 | Surface findings that need developer judgment. | slice 1 | observed: src/skills/dough-story-wrap-up/references/follow-up-disposition.md#dispose-intent-coverage-findings dispositions, routing, priority, judgment |
| 32 | Surface findings that materially change priorities. | slice 1 | observed: src/skills/dough-story-wrap-up/references/follow-up-disposition.md#dispose-intent-coverage-findings dispositions, routing, priority, judgment |
| 33 | Surface findings that call the completed story's proof into question. | slice 1 | observed: src/skills/dough-story-wrap-up/references/follow-up-disposition.md#dispose-intent-coverage-findings dispositions, routing, priority, judgment |
| 34 | Settle evidence of an actual delivered defect before closure. | slice 1 | observed: src/skills/dough-story-wrap-up/references/follow-up-disposition.md#dispose-intent-coverage-findings dispositions, routing, priority, judgment |
| 35 | A deliberate scratch fault alone is not evidence of an actual delivered defect. | slice 1 | observed: src/skills/dough-story-wrap-up/references/follow-up-disposition.md#dispose-intent-coverage-findings revision naming, applicability, scratch≠defect |
| 36 | Preserve the worker report verbatim in the saved Done report. | slice 1 | observed: tests/support/product-backlog-complete-intent-coverage.test.mjs + src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage combined Done report text |
| 37 | Include separately identified wrap-up dispositions in the saved Done report. | slice 1 | observed: tests/support/product-backlog-complete-intent-coverage.test.mjs + src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage combined Done report text |
| 38 | Keep the existing completion-record schema. | slice 1 | observed: tests/support/product-backlog-complete-intent-coverage.test.mjs + src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage combined Done report text |
| 39 | Keep the existing reading surface. | slice 1 | observed: tests/support/product-backlog-complete-intent-coverage.test.mjs + src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage combined Done report text |
| 40 | No temporary file is the only home of the final result. | slice 1 | observed: tests/support/product-backlog-complete-intent-coverage.test.mjs + src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage combined Done report text |
| 41 | When the ordinary execution process retrospective is selected and automatic coverage runs: keep product and proof review before wrap-up. | slice 2 | observed: src/skills/dough-execute-plan/references/finish-or-stop.md#deferred-process-review-into-wrap-up product/proof before wrap-up when coverage runs |
| 42 | Under that same condition: defer that one process review until the report and dispositions are available. | slice 2 | observed: src/skills/dough-execute-plan/references/finish-or-stop.md#deferred-process-review-into-wrap-up defer process until report/dispositions; not skip-process |
| 43.1 | Supply to that deferred process review: report. | slice 2 | observed: src/skills/dough-story-wrap-up/SKILL.md#complete-a-deferred-process-review supply report |
| 43.2 | Supply to that deferred process review: available run history. | slice 2 | observed: src/skills/dough-story-wrap-up/SKILL.md#complete-a-deferred-process-review supply available run history |
| 43.3 | Supply to that deferred process review: elapsed time. | slice 2 | observed: src/skills/dough-story-wrap-up/SKILL.md#complete-a-deferred-process-review supply elapsed time |
| 43.4 | Supply to that deferred process review: setup/waiting problems. | slice 2 | observed: src/skills/dough-story-wrap-up/SKILL.md#complete-a-deferred-process-review supply setup/waiting problems |
| 43.5 | Supply to that deferred process review: follow-up decision. | slice 2 | observed: src/skills/dough-story-wrap-up/SKILL.md#complete-a-deferred-process-review supply follow-up decision |
| 44 | Existing execution-retrospective selection rules still apply. | slice 2 | observed: src/skills/dough-execution-retrospective/SKILL.md#select-reviews existing selection rules |
| 45 | Existing explicit-skip rules still apply. | slice 2 | observed: src/skills/dough-execution-retrospective/SKILL.md#select-reviews explicit-skip rules |
| 46 | Existing missing-history rules still apply. | slice 2 | observed: src/skills/dough-execution-retrospective/SKILL.md#select-reviews missing-history rules |
| 47 | Do not start another process review just for wrap-up. | slice 2 | observed: src/skills/dough-story-wrap-up/SKILL.md#complete-a-deferred-process-review no wrap-up-only invented process review |
| 48 | Remove Story Wrap Up's separate `--process-retrospective` flag. | slice 2 | observed: src/skills/dough-story-wrap-up/SKILL.md#complete-a-deferred-process-review flag removed; docs/installation-and-updates.md |
| 49 | Retain Dough Land's `--process-retrospective` flag. | slice 2 | observed: src/skills/dough-land/SKILL.md --process-retrospective retained |
| 50 | Protect truthful completion. | slice 1 | observed: src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage join before Done/delete/retire; unfinished+recovery |
| 51 | Protect recoverable work. | slice 1 | observed: src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage join before Done/delete/retire; unfinished+recovery |
| 52 | Protect human decision ownership. | slice 1 | observed: src/skills/dough-story-wrap-up/references/follow-up-disposition.md#dispose-intent-coverage-findings dispositions, routing, priority, judgment |
| 53 | Opt-in and this lifecycle can develop independently with one shared wrap-up owner and reconciliation. | slice 1 | observed: src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage request + continue while running; opt-in selection unchanged |
| 54 | Shared files do not require a blocking story dependency. | slice 1 | observed: src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage request + continue while running; opt-in selection unchanged |

## Trigger / journey examples

- E1. Opted-in completed feature; probe still running → independent wrap-up finishes → wait at closure; on return save report and finish dispositions.
- E2. Insufficient evidence with missing observation → preserve report and explain disposition; inconclusive ≠ missing report.
- E3. Worker fails or deadline without report → surface recovery, retain context, unfinished; resume reuses same-revision report.
- E4. Gap fits existing retrospective correction → extend plan/proof, one queued identity; no duplicate.
- E5. Different correction; matching queued work may exist → reuse or queue after retrospective follow-up; justify priority exception.
- E6. Actual delivered defect or disputed proof → settle or obtain developer decision; quiet strengthening alone allowed.
- E7. Process review selected and automatic probe → product/proof already stands; process once after report/disposition; skipped stays skipped.
- E8. Coverage off, ineligible, or already-published Done → no new wait or duplicate check; preserve eligibility/selection/saved results.

## Exclusions / deferred

- Changing opt-in selection; probe verdicts or handoff technique; routine-benefit measurement; dashboard redesign; historical Done backfill; generic worker service; release/rollout.
- Verdict and handoff improvements owned by the next story.
