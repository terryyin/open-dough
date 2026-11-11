# Slice 6 source locations and target-line acceptance

## Retained implementation return

Identity: SEED-300#express-dashboard-test-intent-through-page-objects; dashboard-territory.local-open-dough; stanly-chan; story-branch origin/main. Workspace and branch are unchanged. Base HEAD: 3f1c22bf160f7ebb5e9f68ecff511842c7daa5a6. Implementation is uncommitted; coordinator owns independent refactor, formatting/lint, delivery and plan status. No stage/commit/push/stash/checkout/reset/cleanup was performed.

## Result and bounded ownership

26 owned code paths: `/tmp/seed300-slice6-owned-paths.json`. All source selectors/target assertions live in existing `intentCodeBrowsePage.ts`; native Playwright expectation import keeps it independent of integrated fixtures. Existing labelled-source helper now receives expected lines from the case. Fixture-specific open/expectDoughnut helpers and candidate-case local expectTargetLine are retired; fixture module keeps data/publication only. Code/Gherkin, Purpose, candidate, exact-source selector siblings, and revision setup now use that owner. Existing marked story-tree controls and CI entry navigation retain their separate owners.

Dark250 seam uses the existing `systemAppearanceReading.ts`: sourceAppearance and expectSourceReadable share selected-file/number/token observation. The dark case still names unchangedPath, optional-token policy, selected-story state and expected dark/light colors locally. Source owner imports Perspective→dashboardParts, both native/pure; appearance imports source owner, accessibleReading and pageColours; no dependency cycles or top-level harness setup added. No new modules or runtime behavior changes.

Current repo-config Prettier projection was read-only:26 files, maximum247, none over250; `/tmp/seed300-slice6-size-projection.json`. No formatter was applied. Four implicated helper files total328 lines versus325 at both HEAD and7eab3d6ca (net+3); owned paths net176 fewer lines versus HEAD (261 added/437 removed), net170 fewer versus7eab3d6ca (273/443; historical aggregate includes already accepted work). Before: repeated exact-button/source/row markup and fixture-owned expected target. After: sourceFile/fileSource/source row/number/target readings, with expected exact path/text/line independent in scenarios. Purpose explicitly names candidate entry, path, scenario text and line35 instead of opaque fixture action/expectation; candidate cases still distinguish Python line44, Gherkin unique scenario and path:line/ambiguous start.

## Current proof and exact commands

Current44 distinct cases are covered by41 unchanged cases from the full44 receipt, plus the renewed frontend1 and candidate2 below. Full run:28 files,44/44 passed (43 integrated+1 frontend), strict passed, exit0, 2026-11-11T12:02:39.048Z–2026-11-11T12:04:19.125Z; duration99.604s. Actual selected cases and file counts: `/tmp/seed300-slice6-selected-cases.json`; selection args: `/tmp/seed300-slice6-selection.json`. No skipped/failed attempts. No broad repeat after G5/G6 was needed.

```sh
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice6-proof.json caffeinate -i npm run test:dashboard -- 'frontend-tests/dashboard-system-appearance.spec.ts' 'tests/intent/intent-code-browse-projects.spec.ts' 'tests/intent/intent-code-browse-sources.spec.ts' 'tests/intent/intent-code-browse.spec.ts' 'tests/intent/intent-entry-folder-summaries-folders.spec.ts' 'tests/intent/intent-gherkin-browse.spec.ts' 'tests/intent/intent-gherkin-groups.spec.ts' 'tests/intent/intent-gherkin-layout.spec.ts' 'tests/intent/intent-gherkin-settings-problems.spec.ts' 'tests/intent/intent-gherkin-unusable.spec.ts' 'tests/intent/intent-home-activation.spec.ts' 'tests/intent/intent-project-visit.spec.ts' 'tests/intent/intent-purpose-case.spec.ts' 'tests/intent/intent-read-reuse.spec.ts' 'tests/intent/intent-revision-notice.spec.ts' 'tests/intent/intent-revision-planning-only.spec.ts' 'tests/intent/intent-revision-settings-update.spec.ts' 'tests/intent/intent-revision-update-boundaries.spec.ts' 'tests/intent/intent-revision-update-outcomes.spec.ts' 'tests/intent/intent-selection-reads.spec.ts' 'tests/intent/intent-story-dark-appearance.spec.ts' 'tests/intent/intent-summary-ci-proof-gaps.spec.ts' 'tests/intent/intent-summary-ci-proof.spec.ts' 'tests/intent/intent-test-optimization-candidates-case.spec.ts' 'tests/intent/intent-test-optimization-candidates-live.spec.ts' 'tests/intent/intent-test-optimization-candidates-open.spec.ts' 'tests/intent/intent-test-optimization-candidates-states.spec.ts' 'tests/intent/intent-test-optimization-candidates.spec.ts' --workers=1
```

Record `/tmp/seed300-slice6-proof.json`, receipt `/tmp/seed300-slice6-proof-receipt.json`, console `/tmp/seed300-slice6-proof.log` (npm header only; strict runner passed).

G5 frontend ordinary notes.check choice now uses sourceFile(intent, plainPath). Renewal1/1 strict passed, exit0, 2026-11-11T12:07:01.505Z–2026-11-11T12:07:14.305Z.

```sh
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice6-frontend-renewal-proof.json caffeinate -i npm run test:dashboard -- 'frontend-tests/dashboard-system-appearance.spec.ts' --workers=1
```

Record/receipt/log: `/tmp/seed300-slice6-frontend-renewal-{proof.json,receipt.json,log}`. G6 movedAway and analogous outside-configured pygardonClipPath absences now use sourceFile. Renewal2/2 strict passed, exit0, 2026-11-11T12:07:44.763Z–2026-11-11T12:08:07.945Z.

```sh
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice6-candidate-renewal-proof.json caffeinate -i npm run test:dashboard -- 'tests/intent/intent-test-optimization-candidates-open.spec.ts' --grep 'Intent opens a recorded location into the Intent tab|Intent explains outside configured locations' --workers=1
```

Record/receipt/log: `/tmp/seed300-slice6-candidate-renewal-{proof.json,receipt.json,log}`. This runs the original full open/return/focus/read-count/Markdown sequence and outside-configured case.

```sh
npm run typecheck:dashboard > /tmp/seed300-slice6-typecheck-final.log 2>&1
```

Final typecheck terminal0. Initial implementation typecheck had three missing-import TS2552 errors; repaired before full proof. No test failure/flakiness occurred in positive proof. The coordinator-owned CI pause and repair3f1c22bf were completed separately; no proof existed before that pause.

## Setup and observations inspected

- `intent-code-browse-sources.spec.ts`: MakeMe locations/syntax hints and exact source strings remain at setup; sourceFile selects shell/node/plain paths, sourceLineText compares shellCheck and each raw plain string, absence of token spans stays explicit; styling checks unchanged.
- `intent-gherkin-browse.spec.ts`: published Doughnut/Pygardon contents unchanged; selected feature path, first line1, exact joined recallFeature, copied native selection text, keyword/step colors, observed revision and project replacement remain local.
- `intent-purpose-case.spec.ts:30`: grammar route requested/released promises, viewport640, publication and contentReads1 remain local. Path, unique scenario and line35 are explicit at67/87; scroll-away/not-in-viewport checks bracket grammar release. Native mode/selection assertions retained.
- `intent-test-optimization-candidates-case.spec.ts:32`: configured Python path/content and expected line44 at55; unique Gherkin path/scenario/line35 at81; path:line expectation at108; duplicated name still asserts no target, first line1 and scroll0. Independent expected fixture constants never read the product target.
- `intentRevisionJourney.ts:63`: shared fixed selected-feature setup uses sourceFile/fileSource; original moving publication, paused clock and settled read sequence remain. All six importing revision/home-activation specs ran; request arrays, held reads, revisions, focus and retained scroll are unchanged.
- `intent-story-dark-appearance.spec.ts:135,226`: exact unchangedPath now identifies both contrast and preference-retention observations. Optional token checks and expected darkColour/light/dark selected story assertions remain. Frontend system appearance names highlightedPath/plainPath and raw source expectations; G5 renewal proves final choice.
- Other exact source selector siblings (selection/reuse, project visit, folder summaries, Summary source opening, candidate live/states/open, Gherkin layout/groups/unusable) all ran in the44 cohort. Data still enters through existing MakeMe-backed publishers/builders; exact source text under test remains outside builders. No tier conversion, timeout override, sleep or test.slow added.

## Consumer closure

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/express-intent-test-reading-through-page-objects --base HEAD --term 'expectDoughnutCasePositioned' --term 'openDoughnutRecordedCase' --term 'expectTargetLine' --term '.source-line.is-target' --term '.source-line-text' --term '.source-line-number' --term 'intentCodeBrowsePage' --term 'intentCandidatesCasePositionFixtures' --term 'fileSource' --term 'sourceFile' --term 'sourceAppearance' --term 'expectSourceReadable' --term 'expectSourceTargetLine' --term 'sourceLineText' --term 'sourceLineNumbers' --term 'sourceTargetLine' --term 'sourceText' --term 'expectLabelledEntrySource' > /tmp/seed300-slice6-consumer-trace.raw.md
```

Trace terminal0. Raw `/tmp/seed300-slice6-consumer-trace.raw.md`; complete522 located-row dispositions `/tmp/seed300-slice6-consumer-trace.disposition.md` and JSON sibling. Six unchanged actual consumers added to the edited22 specs: Gherkin settings problems plus home activation and four revision specs. Other located rows match unchanged fixture imports, document/example text, unchanged native attributes or backend/product declarations; no changed-export consumer is left for CI. Root record changes are not browser consumers. Later G5/G6 edits use already-traced sourceFile and already-selected files, so the closure is unchanged; current renewals attached.

Authored Evidence Markdown button `/second-server journey/i` stays direct: `dashboard/src/RecordedMarkdownText.tsx:21` Linked renders authored label and resolves canonical path into onOpenIntentFile; fixture `intentCandidatesFixtures.ts:133` supplies both independently. It differs from recorded-location Reference in `IntentCandidatesLocationsText.tsx:27`. The renewed owning case independently checks fileSource(intent, openDoughSpecPaths.polesSecond). Ordinary movedAway/outside-configured paths migrated; native broad source-absence regexes and token-styling predicates retain their distinct observation contracts. No generic button framework.

## One discriminating scratch fault

At product `dashboard/src/SourceLines.tsx`, changed `const isTarget = targetLine === lineNumber;` to `const isTarget = targetLine === lineNumber - 1;`, marking the following line as target. Same maintained Python case selected1 and failed1, strict failed/exit1 at shared expectSourceTargetLine line37: expected data-line44, received45. It reached the actual rendered replacement boundary, not a helper-only fault.

```sh
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice6-scratch-proof.json caffeinate -i npm run test:dashboard -- 'tests/intent/intent-test-optimization-candidates-case.spec.ts' --grep 'Intent opens a configured Pygardon ::name case at its line in Purpose' --workers=1
```

Record/log/receipt `/tmp/seed300-slice6-scratch-{proof.json,log,receipt.json}`. Before/restored SHA256: ecb434cd1734b23eb97a19d8f11a6d55f7a1f685c1da9fcdeee001d1ccce0adc. Finally restored exact bytes and Git shows no product diff. An initial anchored grep selected0 and reached No tests found; its receipts are retained under `/tmp/seed300-slice6-scratch-no-selection-*` and are not evidence. Same fault was then reached once with corrected grep. Existing positive proof remains valid after exact restoration; no receipt-only rerun.

## Resource and terminal state

Mac16 logical CPU/48GiB; immediately before full proof load5.08/memory58% free, battery91%, AppleClamshellState No. All browser commands used workers1 and maintained battery/lid-open caffeinate-i. Saved sleep log `/tmp/seed300-slice6-sleep-log.txt` has no Sleep/Wake in the run windows (full12:02:39–12:04:19, scratch12:05:58–12:06:25, renewals12:07:01–12:08:07 UTC). No heavy command remains active; each owned command reached terminal. Do not touch other worktrees or root observer.

Untested gaps: no affected source-reading consumer remains unproved. This slice does not claim independent revision/failed-read protocol refactoring (slice7), marked-story navigation (slice8) or whole-suite proof. Root owns PLAN.md, slice-5-current-evidence.md and execution-context.md, including their untracked state; untouched by this implementation. No pending product/design decision. Ready for coordinator independent refactor/review/delivery.

## Coordinator acceptance

Freshness is unchanged at pinned28e7236d, basec6. The only newly attributed
trunk work is SEED316 terminal preparation and its phone-terminal design
direction; it changes no selected source promise, source-reading runtime or proof.
Root inspected every26-file diff, representative complete caller setup and
observations, controller/component ownership, actual strict receipts and exact
SourceLines hash restoration. Source/file/text/line facts remain independent
where Code, Gherkin, Purpose, candidate and revision scenarios use them.

The current44 distinct cases consist of41 retained unchanged cases plus current
frontend1 and candidate2 renewals; all pass without retry. Renewals cover both
G5's plain-file choice and G6's ordinary candidate absence probes through the
shared owner. The authored Markdown label has a supported distinct-component
disposition. G5/G6 are proved by this current code and proof; no missing source
commitment for6 remains. The three missing imports and zero-selection scratch
command were corrected, and neither failed attempt is claimed as passing proof.
The independent refactor and guarded delivery boundary is recorded below.

## Independent refactor and delivery boundary

`/root/refactor6` returned `## REFACTOR COMPLETE`: none, already clean. It
independently inspected all26 code paths, current record sizes, exported and
enclosing consumer contracts, actual44+renewal receipts and SourceLines equality.
No edit invalidated accepted proof, and no test was rerun. All32 reviewed files
project to at most247 lines. The only whitespace finding is the removed fixture
journey's extra EOF blank line, reserved for normal coordinator formatting.
Handoff: `/tmp/seed300-refactor6-handoff.md`. Final freshness remains unchanged
at pinned28e7236d; source commitments33/76/77 and G5/G6 have current observations.
Root's guarded fresh delivery owns formatting, check-only hook and publication.
First fresh preparation stopped before commit at the new execution-context
record's extra EOF blank line. Root removed only that blank line; no semantic
proof or source observation was invalidated.
