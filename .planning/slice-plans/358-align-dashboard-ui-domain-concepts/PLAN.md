# Align the dashboard globally with its UI domain concepts

**Identity:** SEED-153#align-dashboard-ui-domain-concepts
**Source:** [Selected story](../../seeds/SEED-153-dashboard-ui-domain-concepts.md#align-dashboard-ui-domain-concepts)

## Goal and scope

Use ADR 0008's Board, Column, Story card, Session entry, Sessions sidebar, Side panel, Panel divider and region-qualified Scrollbar names directly throughout UI/accessibility, implementation, CSS, tests/support and maintained docs. No competing synonyms or vocabulary aliases. Make the Board its own scroll region in every layout (Terry, 2026-10-27).

Included: `dashboard/src`, `dashboard/tests` (specs, page objects/support and writing guidance), `dashboard/*.md`, `docs/dashboard-*.md`, dashboard references in `docs/project-visibility-requirements.md`, and server names representing adopted UI concepts.
Preserve facts, session identities, story URLs, behavior and saved preferences, including former-key recovery. Exclude new ADR concepts and redesign beyond Board scrolling. Outside-table concepts retain names unless they overload an adopted concept; published record formats retain their names.
Casing adapts to syntax. Session entry presentation may vary by placement while keeping the same concept name.

## Architecture and current decisions

ADR 0001 (dashboard UI vocabulary) and ADR 0008 (Dashboard UI concepts, Spatial
presentation remains derived) apply; the navigation guidance owns layout and
scrolling mechanics. PFE: the concepts already have one implementation each,
under competing names (seed findings table), except the Session entry, which
has two components (`SessionEntry`, `SidebarEntry`); renaming the existing
solutions is the reuse decision. No new module boundary is introduced; files
move to the concept they implement.

- **Names chosen (Terry delegates wording):**
  - Board: `DashboardColumns`/`WorkStages`/`stages` → `Board`; accessible region name "Board".
  - Column: `stage`/`StageView`/`stage-header` → `Column`/`column-header`.
  - Story card: `WorkCard` → `StoryCard`; `DoneStoryCard` stays a Story card in Recently done.
  - Session entry: `SidebarEntry`/`sidebar-entry` → a Session entry presented in the Sessions sidebar.
  - Sessions sidebar: `SessionSidebar`/`session-sidebar` → `SessionsSidebar`/`sessions-sidebar`.
  - Side panel content: `TerminalPanel` → terminal, `SessionResultPanel`/"session result" → final report, `StoryReviewPanel` → story review, and the opening operations named for their content.
  - Panel divider: `SidePanelEdge` → `PanelDivider`, accessible name "Panel divider".
  - Other resize and paging controls: the generic `ResizeEdge` becomes a divider component, and the Running Cursor sessions control is named "Running Cursor sessions divider". `ColumnEdge` is renamed for its hidden-column paging responsibility, without "edge".
- **Saved preferences:** each renamed browser key (`open-dough.dashboardColumns.position`, `open-dough.sessionSidebar.open`, `open-dough.sessionSidebar.runningCursorHeight`) is read from its new key, falls back to the former key once, and is then kept under the new key. `open-dough.sidePanel.width` already matches its concept.
- **Board scroll region:** the region below the banner scrolls instead of the document. The banner sits above it unpinned by `position: sticky`. Focus and reveal padding, the readable/in-view checks (`pageMovement.ts`, `storyCardFocus.ts`), the Preparation legend's reading-position restore, and the sticky Column headers and paging controls refer to that region instead of `html`/`window`. When the agent roster replaces the Board, it scrolls in its own region. Stacked, the Side panel takes 50dvh above the Board instead of 70dvh, so the banner and Board keep room to read a Story card. This is a reversible layout value.

## Preparation observations and decisive premises

Observed here on 2026-10-27, Darwin arm64, `94b93cd6` plus seed draft, Node 24.21.0; native npm/browser/check setup passed:

1. With story review open at `127.0.0.1:4173`, a wheel scroll at 1400×420 moved `.page-column` 362px while sticky `.side-panel` stayed at top 0. At 700×800 the Side panel moved to −542. This is slice 4's baseline; seed findings retain details.
2. Scratch `.page-column { height:100dvh; overflow-y:auto; scroll-padding-* as html }` in `side-panel.css` produced 20 failures/154 passes across 67 scroll/viewport specs at eight workers. Reverted, the 15 failing files passed all 36 checks (load about 11). Affected families: accessible overview, column clamp/height/paging, published-facts reading, story-reference navigation/identity/scroll completion, Recently done progressive refresh/navigation, branch progress, ad-hoc terminal and card delete. Consumers are `pageMovement.ts`, `workFocus.ts`, html padding, `pageLayout.ts`, `readingPlace.ts`, Board page support, `recentlyDoneProgressivePage.ts`, `sessionNavigationJourney.ts` and touch objects. Scratch edits were reverted before execution.
3. `touchTerminalPage.ts` asserts stacked Side panel height 0.7; slice 4 adopts the decided 0.5.
4. Existing reload journeys cover the four preference constants (`columnPaging.ts`, former `SessionSidebar.tsx`, `runningCursorHeight.ts`, `sidePanelWidth.ts`). Slices 1–2 add former-key recovery.

No paid or owner-held premise remains.

## Outside-in proof ownership

The source-only acceptance table below maps every promise, trigger and qualification to its owning slice and observation. Each slice runs typecheck and full lint with `/opt/homebrew/bin` first on PATH, plus consumer-traced specs. When most dashboard journeys consume the effect, run the full dashboard suite. Slice 5 runs full dashboard proof and `npm test` on the final state before publication; CI follows publication. Board scroll proof includes both 1400×420 and 700×800 with an open Side panel, stationary panel/document and preserved reveal/focus behavior.

## Ordered slices

### 1. The Board and its Columns carry their concept names
Type: Behavior
Status: done
Proof: Board-region and Column-paging journeys (renamed from `dashboard-columns-*`) with the "Board" accessible name and a former-key position; consumer-trace-listed specs green

Behavior: a developer opens the dashboard → the work overview is announced as
the Board region, its regions are Columns, and a Column position saved before
the rename shows the same Columns. Code, CSS, test files, page objects, and
docs for these concepts use Board and Column, including the hidden-column
paging control's new name.

### 2. Story cards, Session entries, and the Sessions sidebar carry their concept names
Type: Behavior
Status: done
Proof: card, Sessions sidebar, and Running Cursor journeys with former-key open state and height; consumer-trace-listed specs green

Behavior: a developer opens the Sessions sidebar or a Story card's sessions →
each session shows as a Session entry in every placement, the sidebar is the
Sessions sidebar everywhere, and its saved open state and Running Cursor
sessions height survive the rename.

### 3. Side panel content and its dividers carry their concept names
Type: Behavior
Status: done
Proof: terminal, final report, story review, side panel width, and Running Cursor resize journeys; consumer-trace-listed specs green

Behavior: a developer opens a terminal, final report, or story review → the
same Side panel shows it, under content names. The separator beside it is the
Panel divider, which resizes it by drag and keys as before. The Running Cursor
sessions divider keeps its resizing under its own name. No "edge" names a
resize control.

### 4. The Board scrolls in its own region
Type: Behavior
Status: planned
Proof: new Board scroll journey (side by side and stacked, Side panel open); the 20 tests from observation 2 and the remaining scroll-observing specs green against the Board region; reveal and focus journeys land below the banner and Column heading

Behavior: with the Side panel open beside or above a long Board → scrolling
the Board moves only the Board, through the Board scrollbar at its own edge,
and the Side panel stays in place. Story reveal, keyboard focus, column paging,
reading position, and Maximize/Restore behave as before. The agent roster
scrolls in its own region. Navigation docs name the Board scrollbar and the
other region scrollbars.

### 5. A whole-dashboard review finds one name per concept
Type: Behavior
Status: planned
Proof: recorded name review (search terms in Current decisions plus "page"/"dashboard"/"panel"/"edge" meaning an adopted concept) with every remaining match dispositioned; full dashboard suite, `npm test`, typecheck, and lint green

Behavior: a developer reviews the dashboard after slices 1–4 → no remaining
code, test, or maintained-document wording uses a competing name for an adopted
concept or one name for incompatible concepts. Any residue is renamed in this
slice, and the existing journeys pass.

## Plan review

Five cohesive concept/proof groups; Board scrolling is separated from naming and bounded by preparation observation. No original slice-review concern remained.

## Execution context

- Established Story Branch start: `SEED-153#align-dashboard-ui-domain-concepts`, publisher `dashboard-territory.local-open-dough`, agent `bas-chan`.
- Originating and integration checkout: `/Users/terryyin/git/open-dough`; execution checkout: `/Users/terryyin/git/open-dough/.worktrees/align-the-dashboard-globally-with-its-ui-domain` (existing owned linked worktree), branch `codex/align-the-dashboard-globally-with-its-ui-domain`.
- Authorized trunk `origin/main`; ordinary delivery targets the origin execution branch. Starting revision `421fbf9e9dbdeb561e4f886a50a06ae2b37c383e`; published claim and initial candidate `3901d3ac8ddd5717744a0af36d53160033595add`. Claim CI is unobserved on trunk.
- Checkout readiness: Node 24.21.0; `node scripts/setup-native.mjs npm`, `browser`, `check`, then `npm run typecheck:dashboard` passed in this checkout. Selective formatting is `PATH=/opt/homebrew/bin:$PATH npm run format`; `.githooks/pre-commit` is check-only staged lint and script-triggered dashboard typecheck.
- CI observer: GitHub Actions `terryyin/open-dough`, execution branch, selector `ci.yml` (verified active, display name `CI`); coordinator `seed153-codex`, live directory `/tmp/dough-ci-501/watch-8HHXKr`, PID 3898, PTY 11390, yielded cell 6, checkout as above. Rearmed after confirmed old shutdown; unchanged locked setup and resume typecheck passed.
- No numeric slice budget or overrun permission supplied; preserve the planned scope and ordinary planning authority.
- Expensive proof decision: local Darwin arm64 host, 16 cores / 48 GiB RAM, load 4.23 at startup; no known competing owned heavy proof. Run one suite at a time with at most 8 workers, preserving coverage. Reconsider on contention, failure, or workload change; each implementation agent owns its verification through terminal result.

## Source-only acceptance review

Fresh isolated `/root/source_review1` received only original story Goal, Scope, examples/exclusions and Terry's scroll decision; launch input and 36 commitments remain in agent history. Compared with canonical source, all qualifications/examples are retained below. `/root/source_review2` independently reviewed the same source for slice 2; its input/return are retained there too.

| Original trigger / qualification | Expected result | Current proof or legitimate remaining owner |
| --- | --- | --- |
| Developer names an adopted concept (syntax casing may vary) | Same name in UI, architecture, code, tests, and docs | Slices 1–3 align their groups; slice 5 audits the whole dashboard |
| An ADR 0008 concept occurs in wording, accessible names, components, modules, files, types, functions, state, CSS/custom properties, selectors, support, docs or comments | Every such representation uses the adopted name | Slice 1 Board/Column inspection; slices 2–3 other groups; slice 5 residual review |
| Existing competing synonym or alias | Remove it rather than retain vocabulary translation | All naming slices and final review; preference recovery remains expressly required |
| Open terminal, final report, or story review | Same Side panel responsibility, each content and component named by content without container name | Slice 3 |
| Final report formerly called session result | One final-report name | Slice 3, residual review slice 5 |
| Session entry in Story card, Column, or Sessions sidebar | One concept name; placement can vary presentation | Slice 2, all three placements |
| Resize or scroll control | Distinct responsibilities | Slice 3 dividers; slice 4 scrolling; slice 5 review |
| Board–Side panel control | Only this control is Panel divider, consistently in code/styles/tests/docs, and resizes Side panel | Slice 3 |
| Drag Running Cursor sessions resize control | Section still resizes; own responsibility name, neither edge nor Panel divider | Slice 3 |
| Hidden-column control | Own paging responsibility name, neither edge nor Panel divider; existing paging behavior preserved | Slice 1 names; slice 4 preserves against Board scrolling |
| A Scrollbar is named | Qualify it by the region actually scrolled | Slice 4 docs and scroll ownership; slice 5 review |
| Board in any layout, including side by side and stacked | Own scroll region instead of document; Board scrollbar at its edge | Slice 4 |
| Scroll long Board beside open Side panel | Only Board moves; scrollbar left of Panel divider; panel stays in place | Slice 4 journey |
| Scroll Board below stacked Side panel | Only Board moves; Side panel stays above | Slice 4 journey |
| Reveal through story URL | Story card top readable below banner and Column heading, including tall cards as range allows | Slice 4 existing URL/reveal journeys |
| Reveal through Session entry | Same card-top positioning | Slice 4 existing session/reveal journeys |
| Keyboard scrolling after scroll-region move | Existing behavior against Board region | Slice 4 |
| Hidden-column paging after scroll-region move | Existing behavior against Board region | Slice 4 |
| Banner after scroll-region move | Remains pinned and visible | Slice 4 |
| Maximize/Restore after scroll-region move | Existing behavior preserved | Slice 4 |
| Existing published story facts, session identities, story URLs | Unchanged | All slices preserve record formats; existing journeys and final full suite |
| Existing other behavior | Preserved except explicitly requested scroll-region change | Per-slice consumer proof plus final whole suite |
| Previously saved Side panel width | Same layout after change | Slice 3 existing width journeys, key unchanged |
| Previously saved Sessions sidebar open state | Same layout after rename | Slice 2 former-key/reload journey |
| Previously saved Running Cursor sessions height | Same layout after rename | Slice 2 former-key/reload journey |
| Previously saved Board column position | Same layout after rename | Slice 1 former-key/reload journey |
| Renamed preference key contains only former-key value | Recover former value; new key subsequently owns it | Slices 1–2 |
| Outside-table concept, including banner/roster/project selection/settings/dialogs/frame style | Keep name unless it overloads an adopted concept | Each slice; slice 5 residual review |
| Sessions sidebar across projects | Separate cross-project region | Slice 2 existing sidebar journeys |
| Screen reader reaches Board | Announces Board, covering Backlog, Taken, Recently done | Slice 1 `Board.tsx`, `published-work.spec.ts` and role-based helpers |
| Whole-dashboard review | No competing synonym and no name for incompatible concepts | Slice 5 |
| Existing relevant automated journeys after alignment | Pass with names/selectors aligned | Per-slice consumer suites and slice 5 full dashboard / npm tests |
| Deferred concepts or layout redesign | Do not define new ADR concepts or redesign beyond Board scroll region | All slices; no such expansion selected |

## Slice 1 acceptance

- Source review: Board/Column names, full Board region, paging-control name, former-key recovery and preservation apply now; other groups/scrolling remain with slices 2–5 in the table above.
- Observed `Board.tsx` role/name and focus fallback encompass all three Columns. `Columns.tsx`, `ColumnPagingControl.tsx`, CSS/imports, renamed specs/support and maintained docs use the names directly. `dashboardParts.ts` finds the real Board; `published-work.spec.ts` observes three regions and unchanged headings. Published/session formats are unchanged.
- `board-kept.spec.ts` supplies only the former stored position; reload observes Taken/Recently done plus new key, proves new-key precedence, then saves/reloads a later move. The fixture supplies stored state; `readKept` and the page establish recovery/layout. Existing paging/focus/storage-refusal journeys cover preservation.
- `env -u NO_COLOR -u FORCE_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed153-slice1-final-proof.json npm run test:dashboard -- --workers=8`: 1,667 selected/executed, runner/strict passed, exit 0, 697.279 s.
- `node --test tests/support/dashboard-test-files.test.mjs`: 6 passed, including spec discovery and exactly-once assignment across twelve shards. `npm run typecheck:dashboard`: passed.
- `env -u NO_COLOR -u FORCE_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed153-slice1-focused-proof.json npm run test:dashboard -- agent-launch-recent-delete.spec.ts auto-refresh-recovery.spec.ts cursor-sidebar-size-kept.spec.ts --workers=8`: 5 passed, strict passed, 13.044 s. Observations preserve the done card, check active membership only in Backlog/Taken, assert three Board Columns without weakening snapshot assertions, and validate the final new-key test.
- Initial verdict `/tmp/seed153-slice1-proof.json`, `dashboard/test-results/2026-10-27T03-13-55.622Z/report.txt`: 1,645 passed/22 failed, 73 printed-output entries, 725.888 s. Corrected two stale region assertions and one pre-edit loaded test. Nineteen failures were host `NO_COLOR=1` plus Playwright's `FORCE_COLOR=1`; inspected inheritance and bounded subprocess reproduction confirmed that warning. Clearing both variables produced the strict pass without a product workaround.
- `/tmp/seed153-slice1-consumer-trace-final-dispositioned.md`: 1,079 paths, retired symbols/selectors/key and shared helper consumers. Full dashboard proof covers runtime/support, the Node test covers discovery, maintained docs were inspected; historical/generic matches have explicit exclusions. Root inspected product, aggregate assertions, migration setup/observations and dispositions. No unresolved implementation/proof gap remains.

## Refactor continuation

Terry rejected the size-only exception on 2026-10-27: “no. Make it shorter.” Shorten/split the identified long files coherently, preserving facts, behavior and timing rows; no exception applies. `/root/refactor1` resumes this authorized scope. Coordinator shortens this plan without losing source/proof/ownership evidence. Slice 1 still awaits refactor and delivery.
Observer `/tmp/dough-ci-501/watch-SEWXXM` stopped at the judgment boundary: unread 0, recorded/delivered through 0, pendingCi unobserved; PID 51741 absent. No slice published. Rearm before delivery; retain the stopped observer as historical identity.

## Slice 1 refactor acceptance

- Independent `/root/refactor1` returned `## REFACTOR COMPLETE`; full inspected handoff `/tmp/seed153-refactor1-report.md`, trace `/tmp/seed153-refactor1-consumer-trace-final-dispositioned.md` (1,162 dispositioned consumers). All 181 changed/new files <=250 before formatting; original docs paragraphs/anchors and 66 links validated. Root inspected duration read/refresh seam, callers, extracted test setup, doc splits and unchanged sticky CSS declarations.
- Preserved 549 timing rows and exact twelve-shard map/allocation, including public CLI refresh roundtrip (`node /tmp/seed153-verify-timing.mjs`; before snapshot `/tmp/seed153-refactor-timing-before.json`, result `/tmp/seed153-refactor-timing-proof.json`). Existing plain-list contracts remain; parsing/storage extracted coherently from oversized `share-deal.mjs`. Copied shell fixture includes the new module.
- Renewed extracted-case/setup and Column-header CSS proof: `env -u NO_COLOR -u FORCE_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed153-refactor1-spec-and-column-proof.json npm run test:dashboard -- agent-launch-session-state-pace.spec.ts session-column-membership.spec.ts board-height.spec.ts accessible-overview.spec.ts --workers=8` — 11 passed, strict, 11.844s. All original assertions/triggers retained.
- Renewed timing-output boundary: `env -u NO_COLOR -u FORCE_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed153-refactor1-spec-times-proof.json npm run test:dashboard -- boundary/spec-times.spec.ts --workers=8` — 4 passed, strict, 3.232s. `npm run typecheck:dashboard` and `git diff --check` passed.
- `env -u NO_COLOR -u FORCE_COLOR node --test tests/support/duration-list.test.mjs tests/support/share-deal.test.mjs tests/support/share-deal-recorded-runs.test.mjs tests/support/dashboard-test-files.test.mjs` — 19 passed; `PATH=/opt/homebrew/bin:$PATH env -u NO_COLOR -u FORCE_COLOR node --test tests/support/test-shares.test.mjs` — 7 passed. First CLI attempt omitted required PATH and hit the explicit Bash3 guard in two tests; corrected PATH passed without product edits.
- With `PATH=/opt/homebrew/bin:$PATH`, `bash tests/test-runner-bash.sh`, `bash tests/test-runner-split.sh`, `bash tests/test-runner-failure-report.sh`, `bash tests/test-runner-interrupt.sh` each passed. `python3 /tmp/seed153-check-docs.py` confirmed retained paragraphs/anchors/links. Remaining 1,667-test proof is reused only for unchanged boundaries; no gap or running verification remains.

Formatter expanded membership spec to254 lines; size guard withheld commit/publication. Shortened redundant comments to250 without executable edits; accepted proof remains applicable. Fresh preparation is retried with the same owned paths.

Slice 1 delivered to the origin execution branch at `801f62c3bb2427ab838588ef2ba48f217ab156f6`, suffix base `3901d3ac8ddd5717744a0af36d53160033595add`; observer reused `/tmp/dough-ci-501/watch-8HHXKr`. Formatting, full lint, staged hook/typecheck and final size guard passed. This accepted SHA is the next increment’s published base.

## Story obligations

### G1. Sessions sidebar accessible region name
Reported: slice 2 — "implementation reports the complementary region still has accessible name "Sessions"; coordinator requires "Sessions sidebar" to expose its adopted concept. Heading/button Sessions retain their existing content/action wording."
Story clause: "align UI wording and accessible names"
Disposition: proved by slice 2: sessions-sidebar.spec.ts opening journey observes exact complementary name; final full proof selects all55 region consumers; /tmp/seed153-slice2-handoff.txt.

### G2. Required process-cleanup proof
Reported: slice 2 — "full dashboard run observed boundary/run-processes.spec.ts:110 intentional timeout without its expected orphan-cleanup diagnostic; initial broad run was stopped gracefully and retained at /tmp/seed153-slice2-proof.json. Sanitized diagnosis /tmp/seed153-slice2-process-observation.json confirms spawnSync ps ENOBUFS at1,114,112 bytes versus successful1,967,922-byte observation locating the exact owned orphan. Repair observation completeness/failure handling without changing run ownership; preserve the separately observed foreign orphan. New fake-ps regression also needs explicit platform-boundary setup so Linux CI reaches the intended PS path; slice 2 owns that focused correction after the current full run."
Story clause: "Existing relevant automated journeys still pass after their names and selectors are aligned."
Disposition: proved by slice 2: boundary/run-process-observation.spec.ts covers complete large PS output, actual own-child termination/other-owner survival, sanitized failure and resource removal; original boundary/run-processes.spec.ts observes real nested orphan cleanup. Final portable six-test proof and full proof passed; /tmp/seed153-slice2-handoff.txt includes inspected lifecycle and exact-owned cleanup receipts. Actual Linux execution remains CI-owned.

### G3. Story card geometry after rename
Reported: slice 2 — "published-facts-reading scroll checks fail because StoryCard's className array retains literal "card" while its styling moved to ".story-card". Correct after the frozen run ends; fresh full proof must cover the corrected geometry and G1 accessibility together."
Story clause: "Preserve published story facts, session identities, story URLs, existing behavior, and saved browser preferences."
Disposition: proved by slice 2: StoryCard base class restored under adopted name; all nine geometry failures pass focused and full; /tmp/seed153-slice2-handoff.txt retains original traces/causal limits.

### G4. Current selection marker overload
Reported: slice 3 — "Frozen review finds .in-terminal also marks final-report content on Story cards and both Session entry placements. Rename to .in-side-panel after terminal proof and validate traced observers."
Story clause: "A whole-dashboard review finds no competing name for an adopted concept or single name used for incompatible concepts."
Disposition: proved by slice 3: final marker twelve-case proof observes Story card and both Session entry placements for terminal/final report, close/replacement/navigation; declarations and selection expressions unchanged. /tmp/seed153-slice3-handoff.md.

### G5. Side panel controls global names
Reported: slice 3 — "Coordinator inspection finds PanelControls/usePanelCloseShortcut/closeShortcutLabel exclusively implement shared Side panel controls. Rename global module/API to expose that adopted region while preserving implementation."
Story clause: "components, modules, files, types, functions, state"
Disposition: proved by slice 3: exact SidePanelControls module/API comparison and typecheck, with shared controls exercised in twelve marker cases; shortcut/resize/full content proof retained. /tmp/seed153-slice3-handoff.md.

### G6. Component/model basename collision
Reported: slice 3 — "Required formatter/lint project service omits FinalReport.tsx and StoryReview.tsx because case-insensitive TypeScript roots select paired finalReport.ts/storyReview.ts schema modules. Installed parser confirms only model roots; no commit or publication occurred. Rename schema/transport modules to explicit finalReportContract.ts/storyReviewContract.ts and renew affected module-loading proof."
Story clause: "components, modules, files, types, functions, state"
Disposition: proved by slice 3: all four compiler roots present on actual case-insensitive host, forced typecheck and eight fresh content/schema/native-report module-loading cases passed; exact module/API equivalence and1177-consumer trace in /tmp/seed153-slice3-handoff.md. Required formatter/lint retry remains the delivery gate.

## Slice 2 acceptance

- Independent source-only `/root/source_review2` input/commitments retained in agent history and compared with canonical story/source table: Story cards, one Session entry across all placements, separate cross-project Sessions sidebar, saved preferences and preservation apply now; content/divider/scroll promises remain slices3–5. No qualification or example removed.
- Inspected StoryCard/Columns and Story-card focus marks, SessionEntry/SessionsSidebarSessionEntry placements, exact complementary region naming, legacy/current preference reads, both real reload/precedence/subsequent-choice journeys, public process observation/lifecycle assertions and source setup. All original identity/URL/fact846 values retained; all52 class-name values audited. New split case modules preserve registrations/assertions.
- Complete acceptance evidence `/tmp/seed153-slice2-handoff.txt` retains literal commands, setup/assertions, failure dispositions and cleanup. `PATH=/opt/homebrew/bin:$PATH env -u NO_COLOR -u FORCE_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed153-slice2-proof-final.json npm run test:dashboard -- --workers=8` passed all1,671, runner/strict,717.659s, all55 region consumers selected.
- Focused27 passed all initial failures plus migrations/region/resource observations. Final portability/original-cleanup6 passed after only test platform-boundary setup changed; full product proof remains valid for unchanged boundaries. Typecheck, spec-discovery6, `PATH=/opt/homebrew/bin:$PATH bash tests/dashboard-repeat.sh`, whitespace check passed. Actual Linux execution is left to required CI observation.
- Trace `/tmp/seed153-slice2-consumer-trace-dispositions.md`: all1,482 consumers dispositioned (845run/637excluded); external diagnostic-reader test passed after heavy browser proof. Initial failed/interrupted run is preserved: 1,507pass/10fail/6interrupted/146unattempted. One real truncated-process-list defect and nine geometry failures were corrected without weakening assertions/timeouts; exact-owned5 leftovers ended, unrelated orphan preserved.
- All current297 owned files <=250 before formatting. Root accepts G1–G3 as proved; no remaining source or proof gap. Independent refactor and delivery remain.

Slice 2 independent refactor `/root/refactor2` returned `## REFACTOR COMPLETE`: only dangling report-control prose became an explicit link to retained terminal instructions. Exact replacement, four relative links, operation/return pointer, six-consumer trace and whitespace passed; all297 files plus plan <=250. Root inspected `/tmp/seed153-refactor2-consumer-trace-dispositioned.md`; no executable boundary changed, all accepted proof reused. No unresolved gap or live verification remains.

Slice 2 formatter expanded seven files beyond250; size guard withheld commit. Shortened comments and reused one existing Taken locator across identical assertions; runtime, setup and observing predicates unchanged, accepted proof reused.

Slice 2 delivered at `08b604666d982b7140faab011cfb801aae5a7fe2` to origin execution branch, suffix base `801f62c3bb2427ab838588ef2ba48f217ab156f6`, observer reused `/tmp/dough-ci-501/watch-8HHXKr`. Formatting, full lint, final <=250 guard and staged hook/typecheck passed. This is the next increment’s published base.

## Slice 3 acceptance

- Fresh isolated source-only `/root/source_review3` input/commitments retained and compared with canonical source/table: content/container distinction, one final-report name, exclusive Panel divider, Running Cursor divider and preserved behavior/preferences apply now. Scroll behavior remains slices4–5; no qualification/example dropped.
- Root inspected content region names, opening-state routing, PanelDivider/ResizeDivider pointer+key/range flow, shared controls and unchanged host-options response extraction. Handoff `/tmp/seed153-slice3-handoff.md` maps all three content replacement journeys, width drag/keys/reload, Running Cursor drag/keys/floors and report touch proof to real starting preconditions and observations; all622 audited identity/URL/fact literals,549 durations and wire fields/endpoints retained.
- `PATH=/opt/homebrew/bin:$PATH env -u NO_COLOR -u FORCE_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed153-slice3-proof.json npm run test:dashboard -- --workers=8`: all1,671 passed, runner/strict,671.203s. Final marker12 passed at4workers (literal command/selection in handoff); G4/G5 proved. Only spelling/API/private/prose changes after full proof, declarations/selection expressions unchanged, so other broad proof reused.
- Typecheck passed after final edits. `PATH=/opt/homebrew/bin:$PATH env -u NO_COLOR -u FORCE_COLOR node --test tests/support/dashboard-test-files.test.mjs tests/support/duration-list.test.mjs tests/support/share-deal.test.mjs`:13 passed. Owned whitespace, <=250 sizes, all7 stylesheet declaration sequences and39 relative doc links checked.
- Trace `/tmp/seed153-slice3-consumer-trace-dispositions.md`:1,173 consumers,714run/458excluded/1reused, none uncovered. Wire/native-operation result identifiers are explicit protocol exclusions, not UI aliases. No remaining source/proof gap or running verification; independent refactor/delivery follows.

Slice 3 independent `/root/refactor3` returned `## REFACTOR COMPLETE`: none/already clean, no edits or tests. All accepted proof and1173-consumer trace reused unchanged; independent size/whitespace check passed for150 current owned files plus plan (17 retired). No gap or live verification.

Targeted independent `/root/refactor3` continuation returned `## REFACTOR COMPLETE`, none/already clean: contract roles/names and63-reference equivalence inspected, all4roots and forced typecheck/eight module-load observations accepted,1177-consumer trace complete; no edits/tests. Existing185 files <=250.
