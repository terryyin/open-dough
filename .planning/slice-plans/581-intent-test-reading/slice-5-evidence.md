# Slice 5 implementation handoff

Ready for coordinator acceptance, uncommitted. No active command, writer or watch.
No commit, push, done mark, refactor pass, applied formatter or hook-owned lint.
Workspace `/Users/terryyin/git/open-dough/.worktrees/express-intent-test-reading-through-page-objects`;
branch `codex/express-intent-test-reading-through-page-objects`, story-branch origin/main.
Identity `SEED-300#express-dashboard-test-intent-through-page-objects`, publisher
`dashboard-territory.local-open-dough`, agent `stanly-chan`; published base
`4446ceef699107eee308c7f9545d8e10dd6b8874`, suffix `a7ede26cd2b49c1ea251c98741bba62e0f8bb7b2`.
Planning/source-review changes remain coordinator-owned. Owned20 code paths:
`/tmp/seed300-slice5-owned-paths.json` (includes the removed old reference journey).

## Implemented outcome and PFE

- New `intentScopeHistoryPage.ts` owns the actual scope component's region/facet,
  evidence/rows/disclosure, chart/selected-point/gap/reference and failure/retry observations.
  Complete expected selected/absent/extent/row/chart-unit/mark facts are caller inputs.
  Existing build-history and pure `priorBuildReferencePage.ts` owners remain distinct.
- PFE found mixed scope journeys, not a pure scope browser owner. Actual
  `IntentScopeTimingHistory`/Units/Evidence share those observations; build history has
  different evidence and chart semantics. Modularized the scope observations once.
- `scopeHistoryCollectedPage.ts` retains only existing Done-story setup. The real
  store-corruption/HTTP/reopen/kept-comparison/restore/retry sequence is explicit in
  `intent-scope-collected-timing-history.spec.ts`. Keyboard, attempt IDs/links,
  selected/later revision membership and layout assertions are explicit in both
  entry/file collected scenarios. No collection outcome is supplied by a fixture.
- The existing supplemental read-recovery case now holds its successful retry:
  request count2, old failure and comparison remain observed before explicit release;
  the original replacement/units/provenance/focus checks then run unchanged.
- Generic native DT/DD observation moved intact from private scope reading to
  `proofFigurePage.ts`; body byte-equivalence/hash in `native-figure-equivalence.json`.
  Scope APIs still own their concepts; new comparison-unit wrapper preserves exact
  Counts/Baseline/Branch/Landed/Parts and caller figures. Ordinary/comparison/unit
  consumers retain the same group/columns/values and accepted prior proof.
- G1: removed `scopePriorReferencePage.ts`; its unique assertions and actual Tab/focus
  are now visible in the original prior-average scenario:5 included, Nov1–Nov5,
 7 points, Slow outlier, Exact build, Run201→202 and Run201 URL. Original reported
  provenance remains in plan G1; no assertion/default was dropped.
- G2: that scenario independently identifies Nov1/100ms and Nov5/115ms circle titles,
  reads raw cy and reference y1/y2, requires non-null/distinct anchors, and checks
  y103=y100+(y115-y100)*(103-100)/(115-100), y1=y2. Chart visibility is checked.
  The literal103ms expectation is not derived from production/API reference output.
- Scope selected points are diamonds, not circles. Initial reader narrowing was
  corrected: `points` retains the original broad marker class; `unselectedPoints`
  preserves original circle-specific geometry/style contracts. All expected gaps,
  dates/units/row order/native focus/HTTP/store facts and MakeMe setup remain.

## Proof: current whole scope surface

```sh
caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice5-proof.json npm run test:dashboard -- tests/intent/intent-scope-collected-file-timing-gaps.spec.ts tests/intent/intent-scope-collected-file-timing-history.spec.ts tests/intent/intent-scope-collected-timing-history.spec.ts tests/intent/intent-scope-prior-build-average.spec.ts tests/intent/intent-scope-prior-build-states.spec.ts tests/intent/intent-scope-timing-history-gap-build.spec.ts tests/intent/intent-scope-timing-history-gaps.spec.ts tests/intent/intent-scope-timing-history-legacy.spec.ts tests/intent/intent-scope-timing-history-provenance.spec.ts tests/intent/intent-scope-timing-history-reading.spec.ts tests/intent/intent-scope-timing-history-segments.spec.ts tests/intent/intent-scope-timing-history-units.spec.ts tests/intent/intent-story-dark-appearance.spec.ts --workers=1
```

13 specs,17/17 expected cases, runner/strict passed, retry0; terminal0.
Run `9ef17aab-b127-4943-bf4a-e81c75e41bdb`,193.041s runner/193.939s full shell.
`/tmp/seed300-slice5-proof.json`, `.log`, `proof-timing.json` retain terminal evidence.
Observations: all12 scope prior/history/collected files plus affected dark appearance.
Real collector cases establish actual artifacts/retention and no new acquisition;
receiving cases preserve explicit gap/unit/date/represented-landing rows, native links,
failed/held retry and selected-source comparison. Dark case retains exact contrast.

## Newly added position proof and restored fault

```sh
caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice5-coordinate-scratch-proof.json npm run test:dashboard -- tests/intent/intent-scope-prior-build-average.spec.ts --workers=1
```

Exactly1 prior-average case failed at the new numeric assertion: expected
120.03466666666667, actual119.26133333333334 after +10ms ONLY to reference y1/y2.
Title/membership untouched. Exact `IntentCiHistoryPlot.tsx` bytes restored in finally,
sha256 `8577e29ac5aadedf2a8cdb08f8db4648c56fb08c9d020d02b01b05c3507bf362`.
Evidence `coordinate-scratch-proof.json`, `coordinate-scratch.log`, `scope-plot-before.tsx`.

```sh
caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice5-coordinate-restored-proof.json npm run test:dashboard -- tests/intent/intent-scope-prior-build-average.spec.ts --workers=1
```

Restored1/1 strict/runner passed, terminal0, run `0e812931-3636-4673-a588-8233ebe7089c`,
12.636s runner/13.180s shell. Only this newly changed spec rerun; other16 accepted
cases and their boundaries unchanged. Final `npm run typecheck:dashboard` and
`git diff --check` passed. No production diff remains.

Earlier selected-gap discrimination (independently accepted by coordinator):
```sh
caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice5-gap-scratch-proof.json npm run test:dashboard -- tests/intent/intent-scope-timing-history-units.spec.ts --workers=1
```
Exactly1 case reached wrong Selected-versus-Selected-gap locator in file facet and
failed there at default test deadline; this was the intentional impossible locator,
not startup. Exact current reader bytes restored. `gap-scratch-proof.json`/`.log`.

## Cold-budget repair: completed canonical supplier reuse

Initial attempted scratch did not reach history:18.55s Before Hooks (origin8.22,
 dashboard9.40), publication/navigation exhausted default30 at first row-rest poll.
Retained `startup-failure-proof.json`/`.log` and failed run trace under
`dashboard/test-results/2026-11-11T09-57-13.415Z-38504`. Not counted as discrimination.
No row-motion change, timeout increase, fixture-tier change or waiver was used.

Root approved exact completed canonical component reuse from chaifeng-chan:
`90cfdde521e90ccd5a54c4fca4f02bc5e345a2e5` pageTest lazy queuedClaudePreviewReady,
`b7f58fde6403ac154e0c18660e55c36ac9873eea` public preparationPage wrapper.
Both verified ancestors of published remote tip `54f9ab0c9b9d523682e42e943b6ddf6dafc7e404`.
Only those two source paths applied unchanged; prerequisite blobs matched exactly.
Patch `/tmp/seed300-slice5-readiness-reuse.patch`, sha256
`fd0b39909500755cf55856a74c86ad0ff9eef693e6ed38fb508dff63efc636d1`.
All13 actual queued-Claude preview consumers adopt that export; other base users
request no new readiness. No uncommitted supplier code or broader branch work copied.

Supplier independent acceptance:90cfd's `touch-evidence.md` Accepted worker-input
section records12/12 default30 loaded20–25.57, cold concurrency/private isolation,
then9/9 refactor proof; b7f modularizes identical wrapper. Broader SEED287 final
and hosted gates remain that owner's; this does not claim its story complete.
Existing run artifact APIs/keys/lifetimes used; private Git/HOME/server remain fresh.

```sh
caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice5-cold-fixed-proof.json OPEN_DOUGH_DASHBOARD_ARTIFACT_TRACE=/tmp/seed300-slice5-cold-fixed-artifacts.jsonl npm run test:dashboard -- tests/intent/intent-scope-timing-history-units.spec.ts --workers=1 --trace on --reporter=/tmp/seed300-slice5-cold-reporter.mts
```

Isolated fresh cold1/1 strict/runner passed (`e036016f-f3aa-443f-b382-b979f74e4206`),
case20.913s under original30; runner32.216s/shell33.839s includes all cold work.
Artifact starts within316ms; origin6.489/app5.256/bundle1.095s overlap and ALL finish
before private requests. Trace worker readiness6.500s precedes private origin538.8ms
and dashboard843.6ms. Evidence `cold-fixed-{proof,observations,timing}.json`,
`cold-fixed-artifacts.jsonl`, `cold-traces/trace.zip`, literal `cold-fixed-command.txt`.
Diagnostic /tmp .mts reporter inherits unchanged QuietReporter strict lifecycle and
only copies its trace attachment before normal cleanup. Standard cohort uses normal config.

First cold verification exposed the reader's selected-diamond bug; fixed before above
pass (`cold-point-failure-*`). Diagnostic .ts loader failed before tests, corrected to
.mts; a reused proof-path EEXIST left old failed JSON and was never accepted as new
proof. Original passing trace/terminal retained (`cold-unrecorded-pass-*`); subsequent
already-launched fresh-path diagnostic was owned to terminal. No fabricated JSON.

## Trace, source reading and remaining state

Final installed consumer trace has1198 dispositions: `consumer-trace.md`/`-raw.md`.
Terms include scope readers, selected/reference fields, native figure/current scope
APIs, retired journey exports and canonical readiness APIs. New13 consumer specs run;
unchanged native body/caller contracts reuse prior1–3 proof. Default unrequested
fixture consumers reuse supplier registration/private-isolation proof; other lexical
production/guidance/record matches do not reach changed operations. No uncovered caller.

At both7eab3d6ca and execution HEAD, region lookup appeared18 times/13 files and named
 evidence12 times/9 files; now one scope component owner. Before browser chains and
hidden fixed facts obscured protocol; after named readings leave exact expected rows,
G1 reference/keyboard facts and real store/HTTP recovery beside their causal actions.
Cost: scope owner69/native figure39, scope proof226, setup-only helper; old50-line
reference journey removed. Projected maximum249, no arbitrary cuts/applied formatting.

Local16CPU/48GiB/AC,1worker `caffeinate -s -i`; normal prelaunch load17.47/free45%,
new coordinate proof load5.50/free49%. Cold fix prelaunch12.31/free43%; all total time
retained, no cross-condition speedup claim. Other worktrees/processes preserved.
Root freshness source unchanged pinned b757e243d27f803e43b3b3c28fea3f612634639c; incoming
CI-entry activation preserves native row text/roles by root's static inspection.
Current branch proof retained only for matching bytes; combined integration remains root-owned.
No open implementation/proof gap; G1/G2 await coordinator's recorded acceptance.

Coordinator acceptance: inspected G1 caller facts/actual Tab+focus, real store and held retry protocol (reads2/old alert+comparison before release), native figure body and direct100/115/103 coordinate oracle. Verified17-case/full13, restored1-case and isolatedcold1-case strict terminal records; no production diff. Incomingb757 CI-entry buttons preserve names/text/roles and have activation-only effects; no current history/metric reading observation invalidated. Preserve and prove their new journeys on combined integration before dependent source work.

## Incoming reconciliation reopens current proof

Final source check pinnedc6d2645eea2fe0a440a21d6015da12212117761c: accepted
SEED310 changes actual scope/context/history/reference controls and moves reading/units/
segments UI cases to frontend, adding project-scope callers. Source amendment only
retargets two example links; reviewed promises/qualifications remain unchanged.
Old17/1/1 and fault evidence remains attributed to its original bytes. G1/G2
are returned to5 for combined proof; new G3 owns current caller/tier reconciliation.
No done mark/commit/publication of5 until compatible integration and renewed proof.

Current combined acceptance supersedes this historical runtime snapshot: [current evidence](slice-5-current-evidence.md).
