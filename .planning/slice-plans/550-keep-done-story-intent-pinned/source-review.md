# Independent source review

Reviewer launch: `/root/source_review`, fresh `fork_turns: none`, on 2026-11-09.
Input: only the selected SEED-283 story's original Goal, Scope, Required
restrictions, Scope limits, Key examples, and UI and architecture prose, supplied
in the launch message. The reviewer was instructed to read no project files,
change nothing, and derive individual commitments without plan or proof input.
The table retains its returned commitments and qualifications. Additional
exclusions: no changes to CI endpoint discovery, collection, proof schemas,
equivalent/later-build provenance rules, assessment process, historical
retention/migration, selection workflow, or common presentation owned by
SEED-282. No new page, tab, layout, or technology choice is needed.

## Slice 1 acceptance evidence

Coordinator compared each source commitment with actual production, real published
completion fixtures, authenticated revision arguments, and observing assertions.
G1/G2 were returned for missing observations and now have targeted passing proof.
The independent refactor moved the historical healthy/gap cases unchanged to
`intent-story-completed-source.spec.ts`; its focused history/navigation/recovery
run passed with the default strict reporter, as did typecheck and whitespace.
Final required full Intent gate passed: coordinator command below ended exit 0 with the default strict reporter and no test output; no product/test edit occurred during it.
Refactor proof: `caffeinate -s -i npm run test:dashboard -- tests/intent/intent-story-completed.spec.ts tests/intent/intent-story-completed-source.spec.ts tests/intent/intent-done-project-refresh.spec.ts tests/intent/intent-done-source-selection.spec.ts tests/intent/intent-project-visit.spec.ts tests/intent/intent-story-changes-gaps.spec.ts --workers=1` — nine passed with no test output.
Refactor disposition: independent `/root/slice1_refactor` returned `## REFACTOR COMPLETE`;
shared page inputs/provider, unused field removal, and cohesive test move inspected.
Trace `/tmp/seed283-slice1-refactor-consumer-trace.md`: 18 run, 16 reused, three excluded.
Final passing gate owned by coordinator: `caffeinate -s -i npm run test:dashboard -- tests/intent --workers=2`,
default strict reporter, log `/tmp/seed283-slice1-final-intent.log`, session `53005`.
Prelaunch AC awake, load 8.64/9.34/14.05, free memory 54%, known configuration/full and
Intent-fixture/focused owners; repaired cumulative journeys and lower current load support two workers.
No other heavy command in this execution; reconsider on failure or new contention.

Implementation proof commands (terminal results retained in the execution handoff):

- `caffeinate -s -i npm run test:dashboard -- tests/intent/intent-story-completed.spec.ts tests/intent/intent-done-project-refresh.spec.ts --workers=1 --reporter=line` — four passed before the cohesive test-file move.
- `caffeinate -s -i npm run test:dashboard -- tests/intent/intent-done-source-selection.spec.ts tests/intent/intent-done-project-refresh.spec.ts --workers=1 --reporter=line` — two passed; real second completion and held reads.
- `caffeinate -s -i npm run test:dashboard -- tests/intent/intent-ci-comparison-drilldown-relative.spec.ts tests/intent/intent-summary-story-comparison.spec.ts tests/intent/intent-summary-story-comparison-renamed.spec.ts tests/intent/intent-ci-comparison-locations.spec.ts tests/intent/intent-done-project-refresh.spec.ts tests/intent/intent-done-source-selection.spec.ts --workers=1 --reporter=line` — nine passed.
- `node --test tests/support/intent-scope-comparison-cues.test.mjs tests/support/intent-scope-comparison-wording.test.mjs tests/support/intent-scope-proof.test.mjs` — twelve passed; no invented gap figures/marks.
- `caffeinate -s -i npm run test:dashboard -- tests/intent/intent-summary-story-comparison-file.spec.ts tests/intent/intent-story-completed.spec.ts --grep 'changed test file shows|unchanged file reads|comparison cannot be recovered' --workers=1` — five passed, strict default reporter, no test output, before the test-file move.

The earlier required `caffeinate -s -i npm run test:dashboard -- tests/intent --workers=2 --reporter=line`
ended 275 passed/one whole-test timeout in the owning-merge file journey (14.7m).
The trace reached its final unchanged-source read at the 30s deadline, no sleep,
load 32.76. The independent unchanged-source/Proof loop is now a separate test for
each variant, preserving all assertions and default timeouts. Earlier drilldown
had the same cumulative-journey issue and was split at its independent sort loop;
a stale later-only Summary cue was corrected to the historical inventory.
The full failed verdict remains retained, not replaced by targeted passes.
Line-reporter runs were audited for unexpected output, without claiming the
strict reporter ran: `/tmp/seed283-slice1-intent-suite-audit.json`.
Full trace/dispositions: `/tmp/seed283-slice1-consumer-dispositions.md`;
raw trace `/tmp/seed283-slice1-consumer-trace.md`, broad log
`/tmp/seed283-slice1-intent-suite.log`, final focused log
`/tmp/seed283-slice1-final-focused.log`. No actual test output was overlooked.

Mechanical delivery correction: the selective formatter refused redundant `!reading` guards
in `useIntentStoryLens` after its earlier reading branch. Removed those tautologies,
without a new representation, path or observable behavior. Already-traced disposition:
`/root/slice1_refactor` inspected this lens consumer and its failed/held-read proof;
all accepted proof boundaries remain unchanged. No commit or push occurred on refusal.

## Slice 2 acceptance evidence

Coordinator inspected the header/page shown-revision binding, the planning-only
no-file journey, held/failure/retry/reopening, independent file-text and CI
provenance, project switching, narrow/zoom, Done-return and maintained wording.
Focused fourteen-case default-reporter proof and the four-case outside-Intent
navigation consumer passed; typecheck passed. Initial full Intent gate was owned
by `/root/slice2`, one worker under the AC sleep guard after load21 resource
reassessment; other worktree runs are preserved. No dependent publication yet.
Full gate: `caffeinate -s -i npm run test:dashboard -- tests/intent --workers=1`,
owned by `/root/slice2`, session `14436`, Playwright PID `66269`, result directory
`dashboard/test-results/2026-11-09T03-50-36.580Z-66269`; failed with the two G3 cases, as retained below.
Focused pass: `caffeinate -s -i npm run test:dashboard -- tests/intent/intent-revision-notice.spec.ts tests/intent/intent-revision-update-outcomes.spec.ts tests/intent/intent-revision-update-boundaries.spec.ts tests/intent/intent-project-visit.spec.ts tests/intent/intent-story-views-narrow.spec.ts tests/intent/intent-revision-planning-only.spec.ts tests/intent/intent-revision-settings-update.spec.ts tests/intent/intent-project-visit-ci.spec.ts tests/intent/intent-done-project-refresh.spec.ts --workers=1` — fourteen passed, strict default reporter, no test output.
Outside-Intent pass: `caffeinate -s -i npm run test:dashboard -- tests/navigation/development-intent-frame.spec.ts --workers=1` — four passed, strict default reporter, no output.
Red proof before product edits: `caffeinate -s -i npm run test:dashboard -- tests/intent/intent-revision-planning-only.spec.ts --workers=1` — missing browser label; retained artifacts at `2026-11-09T03-44-22.165Z-97837`.
The same command's first green attempt exposed a harness mismatch (`innerText`
capture versus `textContent` assertion); corrected to matching exact textContent
capture/assertion, with no product workaround or reduced equality. Artifacts:
`2026-11-09T03-44-50.182Z-54326`; the focused pass covers the corrected case.
Implementation proof/report: `/tmp/seed283-slice2-report.md`; complete consumer
trace/dispositions: `/tmp/seed283-slice2-consumer-dispositions.md`, all 506 rows
owned (77 run pending full terminal, 429 excluded with concrete boundary reasons).


## Slice 3 acceptance evidence

Retrospective identified G4: real Done stories with readable retained workspaces still returned live snapshots.
The in-place plan refinement preserved slices 1/2 and the unchanged source; a real preparation browser probe
confirmed the defect. G4 red before product edits expected published completion but received snapshot:
`caffeinate -s -i npm run test:dashboard -- tests/intent/intent-done-retained-workspace.spec.ts --grep 'a readable Done workspace' --workers=1`, session78231 exit1, artifacts2026-11-09T05-35-48.322Z-63089.
Read-only acceptance found G5: an obsolete active automatic run could survive the completed-mode transition.
Its actual browser red returned a valid published completion while the same selected story stayed unavailable:
`caffeinate -s -i npm run test:dashboard -- tests/intent/intent-story-becomes-done.spec.ts --workers=1`, session75850 terminal7a9159 exit1, artifacts2026-11-09T05-50-03.789Z-60937.

Root inspected historical admission, both hook callers, state reset, side-panel mode key, actual published and
captured provenance, source requests, original diffs, outside Review equality, missing-history explanations,
held answers, explicit-run preservation and MakeMe fixtures. Done uses existing capture/published resolvers;
ordinary card Review keeps its live workspace default. No CI resolver/proof schema or new evidence store changed.
Independent refactor `/root/slice3_refactor` returned `## REFACTOR COMPLETE`: named options preserve every hook
value/default; one shared real-capture setup retains all facts, publication/listener order and assertions.
Post-refactor pass: `caffeinate -s -i npm run test:dashboard -- tests/intent/intent-story-becomes-done.spec.ts tests/intent/intent-done-review-modes.spec.ts tests/intent/intent-done-landed-review-mode.spec.ts tests/intent/intent-done-retained-landing.spec.ts tests/intent/intent-story-changes-marked.spec.ts tests/review/story-review-one-shot-choice-refresh.spec.ts --workers=1` — eight whole journeys, strict default reporter, session15567 terminaleff8f0 exit0; no edits during proof. Final typecheck77665/f09c21 and whitespace passed.

Implementation68883's published-history/shallow-gap/held-mode/backend fallback/refusal cases passed; its sole
captured-source collapsed-folder failure was repaired and that whole journey passed58341 and post-refactor15567.
58341 retained two cumulative30s failures (captured mode duplicated its separately owned source proof; existing
Refresh combined independent deletion and expiry/legacy loops). Removing only duplicated proof and splitting
those independent loops preserved every assertion/default timeout; all repaired whole journeys passed92754
and15567. Its aggregate failed verdict is retained, never rewritten as whole-run green. Earlier heading/viewport
harness errors and identifier/type build errors were repaired before these current observations.
Implementation/causal evidence: `/tmp/seed283-slice3-report.md`; root inspected original/surviving assertions.
Complete implementation trace `/tmp/seed283-slice3-consumer-dispositions.md`:751 consumers,109 accepted/pending,
8 reused,634 excluded; independent refactor trace/dispositions account747 matching-boundary consumers.
Root completed full Intent I1: `caffeinate -s -i npm run test:dashboard -- tests/intent --workers=1`, session30807,
terminal9e33e1 exit0, strict default reporter/no test output; log `/tmp/seed283-slice3-final-intent.log`. Candidate: fa740eda plus accepted/refactored slice3.
Prelaunch AC awake, load8.12/11.66/16.11,62% free memory, external configuration/Review/Intent owners preserved;
sequential one-worker sleep-guarded gate, no other owned heavy proof and no product/test edits during it.

Mechanical delivery repair: formatter refused each first-entry undefined check on MakeMe's nonempty revision
array. Root first removed whole guards; the check-only hook correctly refused potentially absent later entries.
Restored guards for later/local entries, removing only the redundant first-entry term. Actual setup/assertions
remain identical to full30807. Independent refactor confirmed the unchanged boundary; no new concept/path or
invalidated proof. Neither failed preparation nor failed commit published anything; original failures retained.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 01 | CI comparison uses the Done story’s published comparison and recorded evidence. Retains story endpoints; observed CI proof keeps its own provenance. | slice 1 | observed: intent-summary-story-comparison-file.spec.ts, clean/owning-merge Proof endpoint labels and actual source request completion; CI gap/retry journeys retained. |
| 02 | Changed tests uses the Done story’s published comparison and recorded evidence. Later project changes do not rewrite the view. | slice 3 | observed: intent-done-retained-workspace.spec.ts and intent-done-retained-landing.spec.ts: real published/captured immutable answer and original diff despite later trunk/local edits; full30807 exit0. |
| 03 | Intent coverage retains the story’s saved assessment. Does not change the assessment process. | slice 1 | observed: intent-done-project-refresh.spec.ts, exact saved assessment through project refresh; intent-story-completed-source.spec.ts, exact saved report with history unavailable. |
| 04 | The historical test browser shows baseline-to-landed-result changes. A later-only test does not enter its tree. No historical retention/migration is added. | slice 3 | observed: retained-workspace/landing specs: original baseline-result diff and no later/local-only tests; existing history resolvers reused with no retention machinery; full30807 exit0. |
| 05 | The historical browser uses test-source locations from landing. Later removal of a configured location does not change them. | slice 3 | observed: retained-workspace/landing specs: landing locations survive current settings removal; actual authenticated locations revision equals completion/capture; full30807 exit0. |
| 06 | The historical browser uses the inventory from landing. Later files, renames, deletions, and settings changes do not rewrite it. | slice 3 | observed: retained-workspace/landing specs: landing inventory after later test removal/rename/addition/settings removal and local edits; full30807 exit0. |
| 07 | An unchanged historical file reads source from landing. Current trunk source does not replace it. | slice 3 | observed: retained-workspace/landing specs: kept11 unchanged source, exact authenticated completion/capture request and caption despite local/trunk rewrites; full30807 exit0. |
| 08 | Deleted or renamed story files remain available. Applies when subsequent trunk changes rename or delete them. | slice 1 | observed: intent-story-completed-source.spec.ts, deleted story file remains after later deletion; intent-summary-story-comparison-renamed.spec.ts, rename target remains after later trunk rename. |
| 09 | Those story files retain their original diffs. Later trunk changes do not replace the diffs. | slice 3 | observed: retained-workspace spec: original modified/added/deleted/renamed differences and exact modified/rename outside-Review equality; captured original diff equality; full30807 exit0. |
| 10 | Preserve existing location selection. No new selection workflow is added. | slice 1 | observed: intent-summary-story-comparison-renamed.spec.ts, selection retained through story-only and outside Review; existing location/overlay and project visit consumers inspected. |
| 11 | Preserve the existing outside-location explanation. Applies to the historical file view. | slice 3 | observed: retained-workspace and both Review-mode specs: outside explanation/action opens same historical answer/diff and returns keyboard focus; full30807 exit0. |
| 12 | Place the project revision notice in Project Intent beside its test browser. Project freshness and historical story evidence have different owners within Intent. | slice 1 | observed: intent-done-project-refresh.spec.ts, notice visible only on Project Intent after later planning push. |
| 13 | Place Show latest in Project Intent beside the browser it updates. The existing Project Intent visit supplies the update journey. | slice 1 | observed: intent-done-project-refresh.spec.ts, Show latest requests the later project revision, followed by keyboard return. |
| 14 | All three Done-story tabs contain no project revision notice. Includes observing a newer trunk revision while any tab is open. | slice 1 | observed: intent-done-project-refresh.spec.ts, each Done tab has no revision notice after observing later trunk. |
| 15 | All three Done-story tabs contain no project refresh action. Includes Show latest. | slice 1 | observed: intent-done-project-refresh.spec.ts, each Done tab has no Show latest action. |
| 16 | Visiting Project Intent, refreshing, and returning preserves Selected story. Uses the existing journey. | slice 1 | observed: intent-done-project-refresh.spec.ts, data-selected-story stays SEED-A#a through project refresh/return. |
| 17 | That journey preserves the story’s historical evidence. Refreshing project reading does not replace story evidence. | slice 1 | observed: intent-done-project-refresh.spec.ts, endpoints, exact saved report and original diff stay equal through project refresh. |
| 18 | That journey preserves the selected story file. Explicit return-journey example. | slice 1 | observed: intent-done-project-refresh.spec.ts, same historical file remains aria-pressed after keyboard return. |
| 19 | That journey preserves the Purpose/Proof choice. Explicit return-journey example. | slice 1 | observed: intent-done-project-refresh.spec.ts, Purpose and later Proof each restore after project visit. |
| 20 | That journey preserves the story’s reading place. The returned story remains on its historical comparison. | slice 1 | observed: intent-done-project-refresh.spec.ts, restored exact scroll offset and unchanged original diff. |
| 21 | Keep keyboard return. Existing navigation remains supported. | slice 1 | observed: intent-done-project-refresh.spec.ts, Enter on Back focuses Project Intent return control; existing active project visit journey retained. |
| 22 | Keep independent reading places. Project and historical story reading retain their respective places. | slice 1 | observed: intent-done-project-refresh.spec.ts and intent-project-visit.spec.ts, independent project/story file, tab, candidate and scroll reading. |
| 23 | Show the revision currently represented by the Project Intent test browser. Visible even with no file selected; names shown source, independently of comparison endpoints and CI proof provenance. | slice 2 | observed: intent-revision-planning-only.spec.ts: no-file home labels accepted source; intent-project-visit-ci.spec.ts: CI advances independently while browser label stays old; IntentHeader consumes shownRevision only. |
| 24 | Keep that revision label after refresh. Includes a successful update whose commit changes only planning records and leaves test files looking identical. | slice 2 | observed: intent-revision-planning-only.spec.ts: planning-only commit preserves identical file text and persistent accepted label, including Development/Intent reopening and no-file home. |
| 25 | Advance the shown revision only when the new locations answer is successfully shown. Merely observing a newer revision is insufficient. | slice 2 | observed: intent-revision-planning-only.spec.ts and intent-revision-notice.spec.ts: new observation retains A, held locations retains A, accepted locations moves label to B with exact authenticated revision arguments. |
| 26 | Keep the prior shown revision during updating or after failure. A successful retry can advance it. | slice 2 | observed: intent-revision-update-outcomes.spec.ts and intent-revision-settings-update.spec.ts: held/network-failed/unreadable-settings updates and reopening preserve old label; accepted Retry advances it. |
| 27 | Keep the prior reading during updating or after failure. Failed locations retrieval does not replace the current reading. | slice 2 | observed: intent-revision-update-outcomes.spec.ts: old text, selected feature, group and focus remain during failed update; accepted locations can advance label while independently failed text keeps old source. |
| 28 | Preserve existing updating and failure feedback. Applies while updating and after a failed update, respectively. | slice 2 | observed: intent-revision-notice.spec.ts, intent-revision-update-outcomes.spec.ts and intent-revision-settings-update.spec.ts retain Updating and explicit failure feedback through the existing notice lifecycle. |
| 29 | Preserve Retry. Failed locations retrieval retains Retry alongside the old label and reading. | slice 2 | observed: intent-revision-update-outcomes.spec.ts and intent-revision-settings-update.spec.ts: old reading and label retain Retry; successful retry requests/applies the requested revision and removes the notice. |
| 30 | Explain missing historical evidence in its affected view. Covers comparison, locations/source, CI proof, or saved coverage; includes an unrecoverable comparison, failed locations read, or absent assessment. | slice 3 | observed: retained-workspace shallow readable-workspace gap and backend historical-choice fallback/refusal; existing CI/source/coverage gap/retry journeys in full30807 exit0. |
| 31 | Distinguish reading, failed retrieval, absent evidence, and an explicit assessment result. These are distinct states; absence must not be presented as an assessment. | slice 3 | observed: both Review-mode specs hold actual answers, show reading without prior mode files, then own answer; historical unavailable state distinct; independent evidence states in full30807 exit0. |
| 32 | Preserve supported recovery. Existing Check again, retries, and explicit CI fallback explanations remain; recovery is offered only where supported. Historical comparison neither freezes unfinished CI nor makes its measured revision the source revision. | slice 1 | observed: intent-ci-comparison-locations.spec.ts, Retry requests completion and CI stays readable; existing CI retry/cancellation/equivalent/later-build journeys passed in broad run. |
| 33 | Each evidence source remains independently useful. Available CI or saved coverage remains readable when another source is unavailable. | slice 1 | observed: intent-story-completed-source.spec.ts, exact saved report with unavailable history; intent-ci-comparison-locations.spec.ts, available CI while source held/failed. |
| 34 | Never silently substitute current trunk’s test tree or evidence for unavailable Done-story history. An unavailable comparison is not evidence of no test changes. | slice 3 | observed: retained-workspace shallow-history case: readable local workspace never substitutes for unavailable history and no no-changes claim; G5 in-place published recovery shown; full30807 exit0. |
| 35 | Do not treat an absent assessment as a negative coverage result. Applies when no saved assessment exists. | slice 1 | observed: intent-story-coverage.spec.ts, no-assessment absence differs from explicit unavailable and unknown failed-record states; exact saved reports retained. |

## CI repair proof and remaining gate

Owned published c5 failure: run42557683177/attempt1, dashboard11/12, configuration/project-hide-sessions.spec.ts retained an obsolete current-tree fallback expectation after restoring a project with an uncatalogued selected Done story. Connected GitHub decoded logs filled the native403 log gap and name only that failure. Preserve the complete hidden/session/selection journey while observing historical absence.
Later slice2 full Intent run failed two owning-merge file journeys; G3 retains their current-slice proof. Current label work and root records are preserved by the sanctioned CI stash; a fresh repair owns all three failures before restoration. No timeout relaxation, discarded broad verdict, or rerun-green disposition is authorized.

Diagnosis accepted: actual merge diff response was correct but took4.89s, leaving about200ms for rendering under a five-second assertion. The unchanged-source journey spent13.17s in unrelated CI readiness before reading source. A controlled held-CI red proved the selector precondition defect; file journeys now select Changed tests early and await actual response/read completion at the consuming boundary, with all assertions/default timeouts retained. The hidden-session journey now asserts retained Done identity, historical gap, and no current browser.
Focused repair passed: `caffeinate -s -i npm run test:dashboard -- tests/intent/intent-summary-story-comparison-file.spec.ts tests/configuration/project-hide-sessions.spec.ts --workers=1` (five whole journeys).
Independent `/root/ci_repair_refactor` extracted one shared Done navigation owner, retaining public wrappers/readiness/return keys and beforeIntent callback; `## REFACTOR COMPLETE`. Root inspected its actual expanded calls.
Refactor proof passed: `caffeinate -s -i npm run test:dashboard -- tests/intent/intent-summary-story-comparison-file.spec.ts tests/intent/intent-summary-story-comparison.spec.ts tests/intent/intent-story-ci-cues.spec.ts --workers=1` (seven whole journeys).
Callback/gap proof passed: `caffeinate -s -i npm run test:dashboard -- tests/intent/intent-ci-comparison-retry.spec.ts tests/intent/intent-story-coverage.spec.ts --grep 'unrecoverable published history|coverage waits for the done record' --workers=1` (two whole journeys). All used strict default reporter with no test output.
Traces: `/tmp/seed283-ci-repair-consumer-trace-final.md` and `/tmp/seed283-ci-refactor-navigation-trace.md`, all located consumers dispositioned. Config's arranged/expected identity value stayed identical, so its current whole-journey proof remains accepted. No production behavior changed.
G3 is received by slice2 for the still-required final full Intent gate after sanctioned restoration. Its failed broad verdict remains retained; no whole-run success claimed from these focused passes. Same CI observer now honors GitHub-directed wait until2026-11-09T05:09:59.127Z, without lost coverage.

CI repair accepted on the story branch at `fea15e65c8e28dfe49919d549a1001535c7510a5`, suffix base `c5edb96346b68c9397a775fbfc81c9357d40e13e`, same observer reused. Sanctioned stash restoration returned `resumed` and verified original contents/index; only its exact entry87eea98561846d4e48000f9c701af6c3e2787167 was dropped.
The earlier slice2 full command ended exit1 with exactly the two owning-merge file failures; its old pending status above is superseded by that terminal observation. All focused revision/navigation positives remain retained. G3 stays received by slice2 until its new full run proves the combined restored label plus repaired navigation.

## Final slice 2 gate

`caffeinate -s -i npm run test:dashboard -- tests/intent --workers=1` passed exit0 on fea15e65 plus unchanged restored label work, session35088, terminalchunk36296c, resultdirectory2026-11-09T04-47-16.491Z-62976. Default strict quiet reporter emitted no test output; no product/test edits occurred during this run. This actual terminal pass settles G3 and observes the combined source/Proof repair and label promises23–29. Prior failures and their causal repairs remain retained above; all earlier pending-full statuses are historical and superseded by this pass.
Updated handoff `/tmp/seed283-slice2-report.md` and `/tmp/seed283-slice2-consumer-dispositions.md` contain the final positive dispositions for all affected consumers and the preserved earlier failure history. No known implementation or proof gap remains before independent slice2 refactor/delivery.

Independent `/root/slice2_refactor` returned `## REFACTOR COMPLETE`, none—already clean, no edits/tests. Root accepted its current authority/caller/geometry/proof inspection and preserved full35088 proof. All changed files<=250; traces `/tmp/seed283-slice2-refactor-consumer-trace.md` and `/tmp/seed283-slice2-refactor-consumer-dispositions.md` account537 rows (77 reused,460 unrelated excluded), no gap.

## Original preparation observations

Observed in this owned worktree on 2026-11-09 at `c7e41e9e4abdd957e3b1117a1bba13d27749d1e6`, using the normal
dashboard Playwright config and Chromium fixtures. Domain setup reused the canonical completion and
published-revision fixtures. Temporary observation specs were removed before recording refinement; no product
edit or probe file remains.

The machine was on AC, with load 6.31/7.14/6.63, memory_pressure reporting 76% free, and no other observed
test run. The small two-worker observations ran under the AC sleep guard; they are not a full-suite capacity
claim. This fresh worktree lacked node_modules; `npm ci --ignore-scripts --no-audit --no-fund` established its
local setup before the probes.

| Premise / consuming operation | Literal observation and profile | Result / unverified remainder |
| --- | --- | --- |
| The reported Done notice and source-context leak exists through the actual browser | `caffeinate -s -i npm run test:dashboard -- tests/intent/preparation-done-probe.spec.ts tests/intent/preparation-project-probe.spec.ts --workers=2 --reporter=line` using disposable specs in this checkout | 2/2 passed in 14.1 s, asserting the current undesirable behavior: Done tree contains later-trunk-only `later.spec.ts`; after a planning-only published commit all three tabs offer Show latest; applying it removes the notice and leaves the changed-file diff identical. This reproduces the symptom, not the remedy. |
| The authenticated source reader consumes a historical result commit, independently of current settings | Done probe used browser same-origin `fetch('/__authenticated-read?source=open-dough&revision=<completion>&intent=locations')` after real CLI Story Branch completion, and again after deleting current `.planning/open-dough.json` | HTTP 200 with the exact requested completion, landing's added file, and no later-only test; the answer remained identical after current settings deletion. The UI meanwhile lost its browser after refreshing to those deleted settings. Read the completion commit, not `review.tree`'s raw Git tree, for source/settings. No new server storage mechanism is assumed. |
| Project planning-only refresh already reaches the new revision despite unchanged source text | Project probe used `openWithFeatureSelected`, unchanged jobs-feature files plus one changed planning file, controlled `moveTrunk`, and authenticated-request accounting | Locations request reached B and source text stayed identical; the notice disappeared. The selected-file caption did show B, while the locations browser had no revision label. A new persistent browser-wide label remains implementation work. |
| Saved coverage independently preserves absence, explicit unavailable, loading, failed retrieval and successful Retry | `caffeinate -s -i npm run test:dashboard -- tests/intent/preparation-done-probe.spec.ts tests/intent/preparation-project-probe.spec.ts tests/intent/intent-story-coverage.spec.ts --workers=2 --reporter=line` after extending the Done probe with current-settings removal | 6/6 passed in 23.9 s: both probes and all four saved-coverage journeys, including failed read → Retry → exact saved report. The existing setup does not fake the coverage rendering. New cross-context isolation assertions belong to slice 1. |

The first probe attempt exposed two observation-harness mistakes, both fixed before the retained passes:
APIRequestContext omitted the browser same-origin metadata and received 403; an overbroad no-SHA assertion
found the truthful file-source caption. The corrected browser fetch and locations-scoped check settled the
actual claims. These were probe defects, not product test failures. No unverified external, paid,
credentialed, native-host or production premise is needed for this approach. New behavior must get failing
regression observations before implementation; current undesirable-behavior passes do not prove it. Reuse
retained evidence only while relevant paths/profile still match.


## Original consumer inspection

Inspected consumers include the landed `IntentPage.tsx`, `IntentHeader.tsx`, `IntentBrowser.tsx`,
`IntentFileReading.tsx`, `IntentStoryComparison.tsx`, `useIntentLocations.ts`, and `pageIntentReading.tsx`. A
source revision reaches the location inventory, unchanged-file Purpose, candidates, overlays/outside counts,
and file/folder CI views. Shared comparison wording also reaches Review changes; specialize missing-history
presentation only where Done meaning requires it. Never weaken active-story gap expectations by accident.

Observed test support includes `intentPerspectivePage.ts` (revision notice selected by status text),
`intentStoryPage.ts` (tab/diff/summary observers), `intentRevisionJourney.ts` (paused-clock moving
revisions/request accounting), `intentCompletedStory.ts`, and `intentSummaryStoryComparisonFixture.ts` (real
CLI completion and published Git). The latter currently deliberately includes `later.spec.ts` in the current
tree: historical inventory changes can affect Summary/outside rows and expected totals in
`intent-summary-story-comparison*` fixtures, not merely the new regression. Inspect their assertions and align
them with the same evidence rule. A file's existing source-revision caption must remain truthful independently
of the new browser-wide label.
