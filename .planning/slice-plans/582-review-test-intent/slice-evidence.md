# Accepted slice evidence

## Slice 1 — complete review handoff

Trigger: the complete Codex review/report replacement and retention journeys
exhausted the default case budget on cold setup. Source commitments70–72 require
a repaired harness, unchanged default timeout and complete journeys.

Attribution: original three-file implementation passed four handoff attempts
(40.827s) and all15 Claude-preview caller specs plus native Codex provenance
(19 cases,167.206s). Freshness then found SEED-287 landed at pinned trunk
`8aa440077950f3b96cda82c5d96dffcf2b3c43e2`: `9739dd6eb` already supplied the
same Codex preview fixture and causal review waits. Preserved the original patch
at `/tmp/seed300-slice1-before-sibling.patch`, fast-forwarded through the backlog
merge adapter, and kept only the replacement spec fixture selection. All published
history and coordinator records were preserved; no duplicate fixture remains.

Named siblings: accepted SEED-287 is incorporated at8aa440077; other named
SEED-300 family stories remain queued. SEED-324's accepted CI helper changes
are incorporated and do not change this fixture selection. No pending sibling hold.

Renewed proof against the reconciled candidate: both full replacement cases twice,
4 passes/retry0,22.229s runner; all15 Claude-preview caller specs plus native
Codex completion-provenance,19 passes/retry0,186.468s; typecheck and diff check pass.

Commands:

```sh
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice1-reconciled-replacement-proof.json caffeinate -i npm run test:dashboard -- tests/navigation/side-panel-content-replacement.spec.ts --workers=1 --repeat-each=2
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice1-reconciled-consumer-proof.json caffeinate -i npm run test:dashboard -- tests/intent/intent-ci-comparison-drilldown-relative.spec.ts tests/intent/intent-ci-done-prior-build.spec.ts tests/intent/intent-project-scope-timing-history.spec.ts tests/intent/intent-project-scope-timing-refresh.spec.ts tests/intent/intent-scope-collected-file-timing-gaps.spec.ts tests/intent/intent-scope-collected-file-timing-history.spec.ts tests/intent/intent-scope-collected-timing-history.spec.ts tests/intent/intent-scope-prior-build-average.spec.ts tests/intent/intent-scope-prior-build-states.spec.ts tests/intent/intent-scope-timing-history-gap-build.spec.ts tests/intent/intent-scope-timing-history-gaps.spec.ts tests/intent/intent-scope-timing-history-legacy.spec.ts tests/intent/intent-scope-timing-history-provenance.spec.ts tests/intent/intent-story-dark-appearance.spec.ts tests/intent/intent-summary-story-comparison-sort.spec.ts tests/intent/intent-done-completion-provenance.spec.ts --workers=1
npm run typecheck:dashboard
git diff --check
```

Inspected outcome: the spec's actions/assertions are byte-for-byte unchanged;
only imports select queuedCodexPreviewTest. Held-read order81–102, native
report/divider116–133, request counts136–179/205–222, and retained report/session
227–249 stay intact. The later B review cancels A's browser fetch in
useReviewRead.ts; pageRequestNoting removes the abandoned promise without
releasing the test's held transport answer. Both repetitions observe that order.
The native provenance case still asserts published completion, chosen source,
source-read revision and Intent-to-review diff equality. Claude caller assertions
and fixtures are unchanged; their full scenario cohort passed.

Consumer trace: `/tmp/seed300-slice1-reconciled-consumer-trace.md` (installed
consumer-trace script, base8aa440077; all479 rows dispositioned). The sole local
effect reaches the two replacement cases; inherited fixture chains were
reverified with the19-case cohort. Filename/record matches and inherited launch
callers are excluded because this local import does not change their behavior.
Actual setup/observation boundaries remain in the specs and fixture owners.

Host: battery/lid open/awake, one worker under caffeinate -i. Latest load
13.35/8.72/8.93, battery74%; no sleep event in either run's window. Slow cohort
progress was checked at17/19 live passes; its owner observed the terminal result.
No other coordinator-owned heavy proof ran. No promise, tier, timeout or journey
was weakened; no gaps remain. Initial6m plus5m renewal; independent refactor `/root/refactor1`: none — already clean, no edits/tests,
`## REFACTOR COMPLETE`; accepted proof unchanged.
