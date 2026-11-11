# Slice 4 implementation handoff

Uncommitted slice4 only; no commit/push/done/refactor/formatting/independent lint.
Checkout `/Users/terryyin/git/open-dough/.worktrees/express-intent-test-reading-through-page-objects`;
branch `codex/express-intent-test-reading-through-page-objects`, story-branch origin/main.
Identity `SEED-300#express-dashboard-test-intent-through-page-objects`, publisher
`dashboard-territory.local-open-dough`, agent `stanly-chan`; published base
`a7ede26cd2b49c1ea251c98741bba62e0f8bb7b2`, suffix base `298d51c27b626fb99f171bebba279b91e091d06d`.
Planning/source-review edits are coordinator-owned and preserved.

## Implemented outcome and ownership

- `intentCiHistoryPage.ts`: `buildHistoryReading` owns heading/latest/disclosure,
  named chart/all-chart absence, measured points, evidence rows and reference line/title.
  `showBuildHistoryEvidence` exposes the pointer disclosure; keyboard journeys retain
  actual Shift+Tab/Enter/Tab/focus/link expectations. `buildEvidenceRows` is the one
  evidence-row observation. `chartOf` retains its independent coordinate/stroke read.
- `support/ciHistoryWindowPage.ts`: window setup delegates to existing
  `openJudgedCiStatus`, preserving the same judged run and returned history region.
  That implicated run arrangement now uses `makeMe.aCiRun` with the original
  headSha/conclusion/url/id/start/end facts. Inspected `githubCiRunFacts` and
  `observedRunForApi`: only incidental createdAt changes from the old listing fallback
  to its stated start; all callers have one judged run and history dates come from
  measured starts/receipts, so no observed outcome depends on that incidental field.
- `priorBuildReferencePage.ts`: one pure component reader for the actual shared
  PriorBuildReferenceEvidenceList group and Included/Excluded/Selected observations.
  All8 existing component caller files use it, including Done, scope and follow-up.
  Their chart, provenance, HTTP/store/request, held-read and keyboard facts stay distinct.
- Build history has no sample-click interaction. Selected samples are the existing
  retained endpoint/reference membership; the new reader exposes that observation.
  No chart action, runtime behavior, fixture tier or product contract was invented.
- `intent-ci-prior-build-average.spec.ts` independently checks reference placement:
  the103s reference lies3/15 of the vertical distance from its100s point to115s point,
  and raw y1/y2 agree. Exact coordinate reads and expected calculation remain in case.

Owned19 code paths: `/tmp/seed300-slice4-owned-paths.json`. All original distinct
checks and expected dates/values/gaps/order/membership/attempt links remain present.
Domain arrangement stays MakeMe; no production source change remains.

## PFE: shared component responsibility

Applied installed Dough PFE after trace exposed non-project membership callers.
Source `PriorBuildReferenceEvidenceList.tsx` explicitly owns one membership/date/value/
exclusion presentation for both measures; it is used by project, scope and follow-up.
`scopePriorReferencePage.ts` is a scope journey with example/keyboard/layout facts;
`intentCiHistoryPage.ts` also carries build setup/chart responsibilities. Neither is
an appropriate cross-view owner for the pure shared membership operation.
Modularized that operation into a15-line component reader; retained distinct chart
owners and every caller's expectations. Search across source/test/support/docs found
no other suitable pure membership owner; stopped once the source/caller evidence settled fit.
Expanded proof covers Done prior family, follow-up, scope states and the scope-average
journey receiving the changed scope helper. No duplicated ownership is left for5/9.

## Source commitments and concrete observations

| Commitments | Setup / observing boundary |
| --- | --- |
|24,72,75|`intent-ci-wall-time-history-order.spec.ts` keeps reversed measured dates, explicit datetime attributes, numeric point ordering and no stroke crossing a gap. Window/later/provenance cases retain exact point count/stroke runs. Prior-average case uses independent100/115/103 expected values and direct y1/y2 measurement.|
|28,68,74|Whole wall-time-history family arranges real published/retained MakeMe landing and CI facts, reads explicit heading/date span/latest timing/ordered samples and gaps through the build owner. No-heading/no-chart cases still check every image, preserving broad absence.|
|69,71,73|Prior-average/states retain exact included/excluded/selected values, dates, causes, attempt links and absence/title of numeric reference. Done/scope/follow-up callers use the same membership owner while retaining their exact own reference/provenance expectations. Selected means retained reference membership, not a new browser action.|

Setup supplies starting projects/retained observations/CI answers. Real authenticated
reads and UI assertions establish results; no fixture supplies the rendered reference.

## Normal proof

```sh
caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice4-proof.json npm run test:dashboard -- tests/intent/intent-ci-done-prior-build.spec.ts tests/intent/intent-ci-done-prior-provenance.spec.ts tests/intent/intent-ci-done-prior-states.spec.ts tests/intent/intent-ci-follow-up.spec.ts tests/intent/intent-ci-prior-build-average.spec.ts tests/intent/intent-ci-prior-build-states.spec.ts tests/intent/intent-ci-wall-time-history-adapter.spec.ts tests/intent/intent-ci-wall-time-history-gaps.spec.ts tests/intent/intent-ci-wall-time-history-later.spec.ts tests/intent/intent-ci-wall-time-history-order.spec.ts tests/intent/intent-ci-wall-time-history-pending.spec.ts tests/intent/intent-ci-wall-time-history-provenance.spec.ts tests/intent/intent-ci-wall-time-history-window.spec.ts tests/intent/intent-ci-wall-time-history.spec.ts tests/intent/intent-scope-prior-build-average.spec.ts tests/intent/intent-scope-prior-build-states.spec.ts --workers=1
```

Terminal exit0:16 specs selected22 cases; all22 expected, all attempts passed, no retry.
Runner and strict verdict passed; run `efa68cae-2201-4bf5-b191-bfa3d9dc1e51`,153.9s.
Verdict `/tmp/seed300-slice4-proof.json`; raw output `/tmp/seed300-slice4-proof.log`.
Final `npm run typecheck:dashboard` and `git diff --check` passed. Earlier typechecks
caught mechanical stale evidence bindings during extraction; corrected before final proof.
Read-only Prettier projection max236; owner195, component15, window7, no formatting applied.

## Restored reference-coordinate discrimination

```sh
caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice4-scratch-proof.json npm run test:dashboard -- tests/intent/intent-ci-prior-build-average.spec.ts --workers=1
```

Temporarily offset only the plotted reference y1/y2 by10000ms in
`IntentCiHistoryPlot.tsx`; title and membership stayed intact. Exactly1 case failed
at the new reference-position assertion: expected61.622222..., actual55.177777....
Observed terminal exit1, then exact source bytes restored in finally, sha256
`8577e29ac5aadedf2a8cdb08f8db4648c56fb08c9d020d02b01b05c3507bf362`.
Scratch evidence `/tmp/seed300-slice4-scratch-proof.json`, `.log`, and exact backup
`/tmp/seed300-slice4-plot-before.tsx`. No scratch source diff remains; no second fault.

## Consumer trace and source-reading gain

Installed consumer trace used `--checkout` this workspace, `--base HEAD`, and terms
buildHistoryReading/buildEvidenceRows/showBuildHistoryEvidence/priorBuildReferenceReading/
expectScopePriorReference/chartOf/openCiStatus/openJudgedCiStatus plus Builds and evidence,
Prior-build reference evidence and .intent-ci-history-reference. Raw record
`/tmp/seed300-slice4-consumer-trace-raw.md`; all657 located consumers have dispositions
in `/tmp/seed300-slice4-consumer-trace.md`; exact16-spec selection in
`/tmp/seed300-slice4-selection.json`. All changed component/setup readers and their
receiving journeys are in this run. Other imports use unchanged operations; generic
chart/status/source/record lexical matches do not invoke the changed reader and are excluded.
Production implementation is unchanged. Earlier matching proof remains valid for
unchanged operations; no required affected caller is left for CI.

Before: scenarios rebuilt history heading/list/reference locators and each view
repeated the membership group/markers. After: `buildHistoryReading(shown).samples`
and `priorBuildReferenceReading(history).selected` name the observation while the
exact expected rows/dates/provenance remain beside them. At both7eab3d6ca and HEAD,
membership group appeared10 times across8 files; now one component owner. Build-list
wording appeared6 times in4 scenario files, reference selectors6 times in3; those
mechanics now belong to the build owner. Cost is small procedural readers in existing
seams and a15-line shared component, offset by removing duplicated window setup;
no framework, performance promise or locator-count-only improvement claim.

## Retained gap and resources

G1 (coordinator recorded receiving slice5, commitment70): original implementation
report — scopePriorReferencePage still has its pre-existing hardcoded5 included
samples/Nov1–Nov5/Run201→202 keyboard expectations; this edit only routes its group/
markers through the pure owner. Its caller currently supplies average/selected/difference.
Slice5 owns moving those expected facts visibly to the scope scenario. No new default
was introduced and no current assertion was removed. Preserve this original provenance.

Normal proof on local Mac16CPU/48GiB/AC, prelaunch load17.54/free39%, one worker under
`caffeinate -s -i`; scratch reached intended boundary on same host at load16.09/free46%.
Known other-worktree proof/processes untouched. Reconsider on changed workload/contention/failure.
No active verification or writer remains. No other gap, unresolved domain decision or
uncovered slice4 observation. Coordinator still owns acceptance/refactor/format/delivery.

Coordinator acceptance: freshness unchanged at31f14719b, no new incoming sibling changes. Inspected shared build/reference owners, reused MakeMe run normalization and direct100/115/103 coordinate assertion. G1 retains legitimate receiving owner5; all slice4 commitments accepted.

## Independent refactor and delivery boundary

`/root/refactor4` returned `## REFACTOR COMPLETE`: none, already clean.
All22-case/typecheck/whitespace and restored-coordinate proof remains applicable;
no tests rerun. Shared component/source/callers and MakeMe normalization inspected.
No new gap; G1 remains receiving5. Complete handoff `/tmp/seed300-refactor4-handoff.md`.
Final freshness unchanged pinned31f14719b; no new incoming sibling change.
