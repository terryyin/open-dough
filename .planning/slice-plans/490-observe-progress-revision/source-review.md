# Source review for SEED-010#observe-progress-revision-before-slice-done

Launch: fresh general-purpose Task agent `6a96cfb6-b65c-4f0b-b35d-ec0ba104d845` without conversation inheritance, fork, or resume.
Input: only the original story text from `.planning/seeds/SEED-010-learn-from-execution-retrospectives.md#observe-progress-revision-before-slice-done` (Goal, Scope, Key examples, Evaluation); no plan, implementation return, product files, or slice boundaries. No human amendments.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1.1 | Update maintained dough-execute-plan guidance to connect guarded progress: true delivery to ci-mailbox.mjs await-revision using the attached observer mailbox | slice 1 | observed: fresh-increment.md## Observe progress proof 'attached mailbox from the delivery attachment' + receipt.sha |
| 1.2 | Update maintained dough-execute-plan guidance to connect guarded progress: true delivery to ci-mailbox.mjs await-revision using the full remote-accepted SHA from the delivery receipt | slice 1 | observed: src/skills/dough-execute-plan/references/fresh-increment.md## Observe progress proof await-revision command + progress-observation-guidance.test.mjs |
| 2 | When the plan calls for a hosted Intent proof summary, follow the project's documented CI status read for that same revision and attempt | slice 1 | observed: fresh-increment.md## Observe progress proof Intent CI status read → custom-ci-proof.md |
| 3 | Keep the required evidence and its attribution before recording the obligations and using ordinary guarded fresh delivery to mark the slice done | slice 1 | observed: fresh-increment.md## Observe progress proof Record attributable proof; settle obligations before ordinary fresh without progress |
| 4 | Failed, unresolved, unavailable, or mismatched evidence leaves the required proof open so completion cannot outrun the observation | slice 1 | observed: fresh-increment.md## Observe progress proof Failed/pending/unavailable/mismatched leaves planned |
| 5 | Use the existing owned CI failure and repair path | slice 1 | observed: fresh-increment.md## Observe progress proof repair path → ci-monitor.md; observe accepted repair SHA |
| 6 | For a later records-only delivery, use the project's existing CI applicability rules | slice 1 | observed: fresh-increment.md## Observe progress proof Applicability ignored-only vs triggering + records-only done |
| 7 | An ignored-only revision may reuse its observer-confirmed applicable basis | slice 1 | observed: fresh-increment.md## Observe progress proof ignored-only may reuse applicable basis |
| 8 | A revision that triggers CI stays covered by the existing observer and the normal completion boundary | slice 1 | observed: fresh-increment.md## Observe progress proof triggering change needs own coverage; observer through completion |
| 9 | Keep complete-revision and its shutdown at the existing completion boundary, including after the final slice | slice 1 | observed: fresh-increment.md## Observe progress proof Keep complete-revision at completion boundary only + ci-completion-wait.md Progress await-revision link |
| 10 | Keep the ordinary delivery path when hosted proof is optional | slice 1 | observed: fresh-increment.md## Observe progress proof optional/observational omit progress ordinary delivery |
| 11 | This increment covers guidance and its representative behavior review | slice 1 | observed: progress-observation-guidance.test.mjs representative walkthrough + Outside-in proof walk in plan |
| 12 | At completion, record the actual response revision and first containing release (or explicitly unreleased status) at ODF-418 and cross-reference ODF-275; queued, not resolved | landing |  |
| E1 | Intermediate slice: guarded progress returns accepted SHA while planned; coordinator reads successful exact receipt from attached mailbox; records proof; ordinary guarded fresh; slice done; observer remains for subsequent slices | slice 1 | observed: fresh-increment.md## Observe progress proof full sequence + wrap-up.md progress link + progress-observation-guidance.test.mjs delivery checklist test |
| E2 | Final slice Intent summary: progress receipt identifies accepted SHA and attempt; read that attempt's summary in Intent before completing the slice; neither ignored nor triggering done record adds a separate foreground watch for the done record | slice 1 | observed: fresh-increment.md## Observe progress proof Intent summary + no extra done watch + E2.a/b applicability |
| E2.a | If the done record is ignored by the project's workflow, the final completion action can settle against the observer's applicable basis | slice 1 | observed: fresh-increment.md## Observe progress proof ignored-only may reuse applicable basis; complete-revision at completion only |
| E2.b | If the workflow runs for that done record, the same normal completion action handles applicable CI | slice 1 | observed: fresh-increment.md## Observe progress proof triggering change needs own coverage; same completion action |
| E3 | Exact failure, pending or unavailable receipt, or summary for a different attempt leaves the slice unfinished; owned failure goes through repair; observe accepted repair revision before retrying done; green ancestor or newer tip cannot supply proof that names the slice's own revision | slice 1 | observed: fresh-increment.md## Observe progress proof failure/repair/ancestor tip negatives |
| X1 | CI trigger changes — deferred |  | X1 |
| X2 | Observer or delivery API changes — deferred |  | X2 |
| X3 | Intent UI changes — deferred |  | X3 |
| X4 | Eliminating the guarded done publication — deferred |  | X4 |
| X5 | Release or rollout — deferred |  | X5 |
