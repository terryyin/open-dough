# Count comparison verification

Execution identity and live observer are in PLAN.md. Original claim/HEAD is
`abb44e0faa1d6957d36c60e6634f0af87f355603`; no second Take or claim was made.
Developer explicitly answered **yes** to reuse the concrete sibling patch here
and finish. Adopted only this checkout's three files from
`/tmp/count-gaps-sibling-retention.patch`, SHA256
`4c1d35f436f19fa41431939d0ed196665a742c1bdc2ab0943175ea9f8f4d6c13`;
the sibling checkout remains untouched. Its work is reused, not claimed closed.

### Trigger → expected result → actual observation

| Original trigger | Expected result | Inspected observation / owner |
| --- | --- | --- |
| Missing/ambiguous part at either endpoint, at entry/folder/file | Observations/unit/gaps survive; no signed/equality claim or cue | `intent-scope-comparison-count-gaps.test.mjs` consuming rows; both statuses/directions, equal totals, independent Branch/Landed and observed outside cases pass |
| Present shard lacks the scope, or every part is unresolved | Gap rather than added/removed or zero, with unit and part explanation | `intent-scope-comparison-unobserved-counts.test.mjs` hidden/all-missing entry/folder/file/outside rows; reverse endpoints, explicit absence controls, and an unobserved endpoint beside the other supported pair pass |
| Partial + complete contributors of one unit; other complete units | Retain whole observed unit total; withhold its difference; preserve supported units | `intent-ci-comparison-overall-count-gaps.test.mjs` mixed contributors, all-missing contributor, equal totals, absent/unreported controls and untimed recovery pass |
| Complete untimed evidence / legacy / measured zero / absent units | Ordinary matching, timing and distinction rules survive | Existing unit/wording/cue/timing/entry-gap/scope suites pass; new actual `comparisonEntriesOf` → `sortedRows` case proves partial totals sort normally, zero is measured and unobserved sorts last in both directions |
| MakeMe evidence served to each endpoint | Preserve actual missing/ambiguous/multipart shape | `story-ci-comparison-entry-summaries.test.mjs` checks actual collector-produced entries equal arranged evidence, including files/unassigned exactly once and unobserved units beside measured-zero legacy results |
| Read overall Counts/entry rows, then Summary/file Proof/tree evidence | Same observed figures, gaps and eligible cues at rendered/accessibility boundary | Both new journeys passed in the complete Intent selection; final repaired-file replay also passed |

New Node setups use the canonical MakeMe endpoint, entry and evidence builders;
assertions inspect real comparison rows, overall words/cues, sorting and served
summaries independently. Initial red evidence is `/tmp/count-gaps-red.log`;
serving red/green evidence is `/tmp/count-gaps-serving-red.log` and
`/tmp/count-gaps-serving-green.log`. Strengthened hidden-scope assertions first
failed after adoption with `1,000 → no CI result` and `1,000 → nothing counted`;
`/tmp/count-gaps-hidden-after-adoption-red.log` retains those verdicts. The new
unobserved representation corrects those losses without manufacturing zero.

Terminal passing focused command and typecheck (Node 24.21.0, prepared checkout):

```sh
PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/support/intent-scope-comparison-count-gaps.test.mjs tests/support/intent-scope-comparison-unobserved-counts.test.mjs tests/support/intent-ci-comparison-overall-count-gaps.test.mjs tests/support/intent-scope-comparison-unit-gaps.test.mjs tests/support/intent-scope-comparison-units.test.mjs tests/support/intent-scope-comparison-wording.test.mjs tests/support/intent-scope-comparison-cues.test.mjs tests/support/intent-ci-comparison-overall-counts.test.mjs tests/support/dashboard-ci-comparison-entries.test.mjs tests/support/intent-ci-comparison-sort.test.mjs tests/support/story-ci-comparison-entry-summaries.test.mjs tests/support/intent-scope-proof-units.test.mjs tests/support/intent-scope-proof.test.mjs tests/support/intent-scope-comparison-timing.test.mjs tests/support/intent-ci-comparison-signed-sort.test.mjs tests/support/dashboard-ci-comparison-entry-gaps.test.mjs
PATH=/opt/homebrew/bin:$PATH npm run typecheck:dashboard
```

Logs: `/tmp/count-gaps-adoption-complete-focused.log` and
`/tmp/count-gaps-adoption-typecheck.log`. Root inspected the actual hidden/all-
missing/outside/sorting assertions and per-unit/overall implementation; the
return is a location index, not substituted acceptance.

Browser commands:

```sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/count-gaps-browser-focused-proof.json caffeinate -s -i npm run test:dashboard -- tests/intent/intent-ci-comparison-count-gaps.spec.ts --workers=2
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/count-gaps-browser-drilldown-proof.json caffeinate -s -i npm run test:dashboard -- tests/intent/intent-ci-comparison-count-gaps.spec.ts --grep 'ambiguous Baseline parts' --workers=1
```

First command selected two: overall/entry passed (8.608 s); drill-down failed
because its cue assertion targeted the location-name button rather than header.
Corrected only the observation with existing `intentLocationHeader`; kept the
name assertion, count/gap promises and full Proof continuation. The second
command selected that one complete corrected journey and passed (8.263 s).
Original failed verdict retained; this was no unchanged retry. Host was awake
on AC, load 2.65/3.70/5.99, 71% memory free, no competing browser process.
These observations precede final adoption; final broad proof remains open.

Consumer trace: `/tmp/count-gaps-consumers-adopted-disposition.md`; all listed
consumers have dispositions and required final integrated observations stay
open until run. No production/test-support `holdsResultInside` references
remain; consuming tests/typecheck exercise `showsEvidenceInside` and compatible
old Units exports after cohesive endpoint/group extraction.

Independent refactor `/root/refactor_counts` completed the shared
`countPartGapsOf` interpretation, with exact REFACTOR COMPLETE and focused counts,
signed-sort/timing, typecheck and whitespace proof. Final fresh independent
pass `/root/refactor_final_counts` accepted the adopted/unobserved paths.
Earlier selective formatting/full lint passed; new edits still require final
formatting and lint. G1/G2's focused behavior is accepted; G3/G4 remain open.

Source freshness after implementation: unchanged at pinned trunk
`7ff9a21f86addd3d3bbe47e0b0007f019dbffaba`, base the claim. No named sibling
product change is accepted on that trunk; shared paths are unchanged there.
Sibling 557 remains at claim `f75a5e64d` with its separate active execution.
The explicit developer approval above settles this reuse's overlap. Slice 1
remains planned, with no commit, publication, completion record or closure yet.

Final independent pass `/root/refactor_final_counts` returned exact REFACTOR
COMPLETE: none — already clean; no edits or repeated tests. Corrected trace
dispositions include rendered `CiProofFigures` (full Intent), `ciProofWording`
(focused single-run suites) and comparison timing (focused timing suite).
Final selective formatting and full lint passed (root session 48897 exited 0).

Whole Intent gate launched by root:
`PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/count-gaps-full-intent-proof.json OPEN_DOUGH_DASHBOARD_TIMES=/tmp/count-gaps-full-intent-times.txt caffeinate -s -i npm run test:dashboard -- tests/intent --workers=2`.
Actual host: awake/AC, 16 CPUs, load 3.72/3.81/4.49, 70% free memory; sibling
557 also runs two workers. Two workers retain every selected observation and
leave credible headroom; reconsider on failures or changed contention. Root
owns the run through its terminal result; no full repository run is selected.

This first broad run reported a default-30-second timeout in
`intent-ci-comparison-drilldown-relative.spec.ts:43`, at the final
`untilPageRequestsAnswered`/`pageRequestNotes.ts:133` wait. Trace retained under
`dashboard/test-results/2026-11-10T03-14-58.584Z-42808/`; the complete run subsequently ended failed/interrupted. No sleep/wake occurred in 11:14–11:22. Host load rose
to 27.42/18.02/11.52, 61% memory free; attribution does not waive the defect.
`/root/diagnose_drilldown_timeout` owns read-only trace/cause investigation;
no unchanged retry, timeout increase or peer edit is authorized. SEED-286's
published c216 leaves this first journey unchanged (only its second predecessor
case was removed); broad family ownership alone proves no exact active repair.
Four further comparison cases timed out at the initial reading wait. Root
verified runner PID 42808 and its exact checkout, sent only that owned process
SIGINT to reduce contention, and observed terminal exit 1. The interrupted run
retains 218 passed, 5 timed out and 2 interrupted of 386 selected
(734.141 s); all remaining selected coverage is still owed.

Repair: the relative spec uses existing `pausePageClockAt` before navigation,
preserving all actions, geometry/preferences, counters and final waits. Its
trace showed a real recurring revision check entering this interaction-only
no-reread journey after UI checks. Other four initial-readiness cases had
16–19 s setup under load; their code is unchanged and resource conditions
were corrected separately. Private synthetic GitHub owners were verified.
Complete affected three-file family passed at one worker (10/10, 93.707 s),
then a bounded two-worker proof passed 10/10 in 31.399 s, maximum case 10.536 s:
`/tmp/count-gaps-timeout-repair-focused-proof.json` and
`/tmp/count-gaps-timeout-two-worker-proof.json`. No failed verdict was erased.
Fresh independent `/root/refactor_clock_repair` returned REFACTOR COMPLETE,
none — already clean, no edits/reruns. Trace: `/tmp/drilldown-timeout-consumer-trace.md`.
Selective formatting passed with the repair; source freshness stayed unchanged
at `226785156b5d68df828547c4e5b63eda0b63722d`; no named sibling product landing.

Renewed complete Intent command uses the same selection/two workers/AC guard,
proof `/tmp/count-gaps-full-intent-proof-2.json`, times
`/tmp/count-gaps-full-intent-times-2.txt`; root owns its terminal result.
Before launch: load 11.67/8.29/9.42, 51% free memory, one other focused backend
run and no competing full/browser suite. The measured two-worker family margin
supports this bounded choice; keep all 386 cases and reconsider on new failure.


Second full run ended failed/interrupted, not green: 213 passed, 5 failed,
9 timed out, 2 interrupted, 386 selected, 1,144.522 s. Root verified its
runner PID 88056 and checkout before interrupting only that owned runner.
Artifacts: `dashboard/test-results/2026-11-10T03-40-05.039Z-88056/`.
The retained-window case reached its decisive retention poll at +31.089 s;
20 prior real Git publications consumed 14.124 s. Board navigation also
started its 5 s stability poll while the requested column was unattached,
so attachment consumed the poll before it could observe two positions.
No count-comparison semantic assertion failed; failed readiness and retry
assertions remain defects until the repaired complete selections pass.

Repairs preserve default test timeouts and all behavioral assertions:

- `trunkCommitBatch.ts` batches prior cohort commits with real Git trees,
  parent chains and a private temporary ref, then fast-forwards the checkout.
  `landedCiTrunk` and `retainedTrunkProofs` retain their public contracts. The
  actual final retention publication remains the normal product operation.
  A MakeMe-arranged native Git contract proves ancestry, changed trees,
  UTF-8/quoted paths, executable mode, staged/working/untracked facts,
  clean checkout and private-ref cleanup. It passed twice, including after
  formatter fixes. Existing whole-product Git constructors lacked changed-tree
  support; PFE selected the existing fixture owner rather than a new framework.
- `boardColumnNavigation.ts` owns the extracted navigation responsibility;
  `boardPage.ts` preserves its existing exports. The requested column must
  attach before the unchanged two-position motion check begins. Paging,
  geometry, slide state and scroll assertions remain unchanged.

Fresh independent `/root/refactor_gate_repairs` reviewed all six repaired
files and returned exact REFACTOR COMPLETE, none — already clean. Every
edited file is at most 250 lines. Final selective formatting and dashboard
typecheck passed. Source freshness stayed unchanged at
`6894595d74b58a6a4f90ba7f2b02d88cacc3b924`; named sibling product paths are
unchanged on that trunk. No peer files were edited.

The combined affected selection (seven Git-history consumers, four Board
paging suites and seven failed comparison suites) now runs at one worker,
under the AC sleep guard. Proof: `/tmp/count-gaps-gate-repairs-focused-proof.json`.
Launch host: AC/awake, load 14.99/12.13/12.22, 57% memory free. This retains
all selected observations while reducing local contention. Root owns the
terminal result; final whole Intent proof remains open.


Focused run ended failed/interrupted: 38 passed, 1 timed out, 1 interrupted
of 42 selected, 445.740 s. The Git-history and comparison selections passed;
retained-window took 8.106 s. Board launch-dialog failed because the new
visibility wait rejects a legitimate zero-height, hidden paging target.
Its existing box still provides the target's x coordinate; readiness needs
attachment, not visibility. Root verified/interrupted only owned PID 57203
and observed terminal exit 1. The failed verdict and trace are retained.
The repair changes that precondition only. Root will renew the four complete
Board paging suites, retaining the unchanged history/count observations,
then run the required whole Intent selection at one worker.


The replacement four-file Board run ended failed: 7 passed, 1 failed,
34.672 s (`/tmp/count-gaps-board-repair-proof.json`). Launch-dialog and
hidden-zero-height paging now pass. The Sessions-sidebar journey exposed a
separate race: two x readings matched before width/ResizeObserver-derived
paging controls appeared. `showColumn` saw zero controls and returned without
any paging click, while the target lay beyond the Board view. Its original
not-in-viewport assertion correctly caught Backlog still showing. Repair
must distinguish all columns fitting from controls not yet ready; no assertion
or timeout is weakened. The failed trace is retained under
`dashboard/test-results/2026-11-10T04-39-37.339Z-58103/`.


The final shared navigation predicate waits for a real geometry-selected
paging control or the target's entire horizontal box inside `.board-view`
(using the existing 0.5 px layout tolerance). The direction loop is unchanged
in `pagingControlToward`; default motion budgets, mouse clicks and row
style/slide assertions are unchanged. Zero controls while the target is
outside now waits for the pending control render. Installed consumer trace:
`/tmp/count-gaps-board-consumer-trace.md`; all matches are disposed, with
shared Board proof pending rather than claiming every caller ran.


Independent `/root/refactor_gate_repairs` accepted the final readiness seam;
only formatting and explicit `Locator | undefined` capture typing changed.
Typecheck, focused ESLint/Prettier and whitespace checks passed. Refactor
trace: `/tmp/refactor-board-readiness-consumers.md`.
All four renewed Board suites passed: 8/8, strict passed, 34.408 s;
`/tmp/count-gaps-board-readiness-proof.json`. Shared attachment, actual paging,
sidebar, launch-dialog, keyboard, resizing and geometry assertions are retained.
This supersedes the open Board runtime observation, not its failed verdicts.

Required complete Intent selection now runs at one worker under the AC guard:
`PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/count-gaps-full-intent-proof-3.json OPEN_DOUGH_DASHBOARD_TIMES=/tmp/count-gaps-full-intent-times-3.txt caffeinate -s -i npm run test:dashboard -- tests/intent --workers=1`.
Launch host: awake/AC, load 6.12/6.04/8.82, 61% memory free. Root owns terminal
completion and all 386 selected observations; no test timeout is raised.


Later source freshness: unchanged at `e6852fbe8e7ef406c640acd86b6d0bd65937a219`.
Incoming SEED-291 completed-story association changes were inspected: Board
includes an already selected Done identity; ad hoc session selection resolves
that identity. No count interpretation, retained unit/gap representation,
proof-serving helper or selected story/plan changes. Named sibling 557 and
SEED-286 remain Taken; no related product publication is accepted here.
Current count observations remain valid on this branch; final trunk integration
will retain the required CI observation of the reconciled candidate.


The complete one-worker run ended **failed**, 385 passed / 1 failed of 386,
1,629.152 s; no interrupted or omitted cases. Its only failure was
`intent-ci-status-freshness.spec.ts:195`: the kept response arrived in 1.866 ms,
but its unheld fresh replacement arrived in 138.141 ms; the preceding state
assertion took 184.1 ms. The test asked for the transient kept label after
freshness correctly won. No timer or product-cache defect was observed.
A localized test-only hold makes kept → stale-trunk fencing → fresh ordering
observable, including the spinner while the fresh story read stays held. All original assertions and transitions remain; the whole freshness
file is renewed. Other 385 unchanged observations are reused under repair
acceptance, not reported as a strict-green full run. No failure is waived.

Fresh source unchanged at `f1a992a75154f58bde278ef13dc8deba5c375771`.
Reused only that accepted history-test collector/read lifecycle fix, preserving
this branch's original assertions; unrelated newer trunk expectations are excluded.

Final combined replay passed 7/7, strict passed, 23.806 s:
`/tmp/count-gaps-final-repairs-proof.json` (whole freshness, story-status and backend history-gap files).
Independent final review, selective lint/format, dashboard typecheck and whitespace passed;
`/tmp/freshness-story-fence-consumer-trace.md` retains all affected consumer dispositions.
