# Get fast proof of Intent source and story reading

**Identity:** SEED-413#speed-intent-source-and-story-reading
**Source:** [Get fast proof of Intent source and story reading](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-source-and-story-reading)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Dashboard maintainers get quicker feedback on how developers find, recover,
and resume a project's or story's Intent reading. Move the 71 legacy
Playwright cases across 37 files identified below. Each slice preserves the
observable results and retires the legacy proof it replaces. The comparison
and timing stories own independent CI evidence rules. This story owns the
evidence that the selected source and reading place survive changes to the
view. The last campaign story owns the dual runner's retirement.

## Current decisions

- Apply the [campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories),
  [North Star](../../NORTH-STAR.md) and
  [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Use the [frontend entry guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses)
  and project-selected MakeMe and page-object conventions. Use existing
  page-loadable data and `mountComponent` with direct actions and retrying
  observations. Do not add shared test wrappers or retain settle waits in
  migrated cases.
- Reuse `ProjectIntentReading` and `IntentPerspective` for their respective
  reading scopes, `IntentPageProviders` for page-owned reading and mode,
  and `IntentReadSource` for typed locations, file and Candidates replies.
  The production owners keep the keys, caches, recovery and cancellation.
  Compare the requested source, revision and path where those select the
  answer. Supply held data only for proofs of presentation. Use the shared
  recovery clock for timing cases, and preserve the real page for cases that
  depend on authenticated adapters, native navigation or whole-page focus.
- Follow [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
  Published source, Done records and Taken progress retain their actual
  provenance; Story Notes stay on the existing machine-local project
  subscription. Keep the notes source and its ordering rules in
  `storyNotesState` and `localSettingState`. Resolve the shared project state
  at the control's production entry so existing card and Review callers can
  use it while the mounted control takes the state directly.
- Before deleting a legacy title, record its distinct assertions and their
  new or existing proof owner. Preserve named native focus, layout, wording,
  failure and stale-reply risks. Consolidate equivalent setup only when the
  observations survive. Report case counts by engine and destination, whole
  selection elapsed including preparation, any E2E time, and the slowest
  remaining cases. Keep the proof mapping and measurements with this plan
  during execution. Clean up support when its last consumer moves.

## Local gate

On macOS run from an awake machine on AC with `caffeinate -s -i`, the
maintained [sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Use the default test timeouts and two workers for comparable runs. Apply the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run explicit affected frontend paths through each relevant engine, list the
final selections, and run the named E2E paths when a slice moves or changes
their proof or reaches a shared composed boundary. Run
`npm run typecheck:dashboard` for changed production inputs or callers.

## Decisive premises and proof

Observations below are from this preparation's owned checkout at
`f981fc912` on 2026-11-21, macOS on AC with Node 24.21.0 and the locked
install.

| Premise and consuming operation | Observation and consequence |
| --- | --- |
| The normal frontend runner selects the legacy roster used to compare feedback. | `caffeinate -s -i npm run --silent test:dashboard:frontend -- --list --reporter=line` listed 71 legacy cases in the 37 scoped specs. The comparison registration modules and mounted Vitest specs were excluded from that legacy count. |
| The typed production reader can retain the pinned file and switch after Retry. | The normal runner at two workers, selecting `intent-source-target-recovery.spec.ts` and `intent-revision-update-failures.spec.ts`, passed five Chromium cases. A failed locations update kept the old tree usable until Retry applied the new revision. A held or failed file reply kept line 44 until release or Retry. The typed source and actual reader are the route for slices 1–4. |
| Production Candidates and Notes readers can expose recovery and save ordering through typed replies. | The same run also selected `intent-candidates-read-recovery.spec.ts` and `story-notes-control.spec.ts` and passed their ten cases. Candidates recovery distinguished a standing limit from manual Retry, absence and mismatched content. Notes refresh updated the open list and a late read left the saved note visible. Slices 4 and 8 verify those same outcomes when changing their mount inputs. |
| The Candidates publication mount works through the page's providers. | With the fixture's separate Intent mode and reading providers replaced by `IntentPageProviders` in scratch, the normal runner at two workers passed all 12 cases in its eight consuming specs. They observed opening and returning with focus, exact source line and revision, and the same record recovery. The edit was reverted. |

The normal runner with the 37 explicit legacy paths, `--workers=2` and
`OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` passed all 71 Playwright cases
in 209.26 s elapsed including preparation (376.66 summed case-seconds).
The slowest cases were pinned source navigation, invalid source targets,
and Done dark appearance (each about 14 s). Repeat at the execution
baseline if the checkout or load differs materially.

## Slices

Names below omit `.spec.ts`. Intent names are relative to
`dashboard/frontend-tests/intent/`; navigation and stories paths are named
explicitly.

### 1. Unreadable, malformed and failed Intent location reads explain their cause and retry on demand

Type: Behavior
Status: done

Move `intent-gherkin-settings-problems` (2). Reshape zero-caller
`makeMe.anIntentLocationsAnswer` (`Distribution/tests/support/intentLocationTestData.mjs`)
to build `IntentLocations` and observe `ProjectIntentReading` over typed
replies. Check callers and remove the unused `locationsRequest` export
(`intentReadRecoveryPage.ts`) and `pygardon`
(`intentGherkinUnusableFixtures.ts`).

**Proof.** Unreadable and malformed settings stay distinct from
not-configured, a failed locations read names its specific cause and
revision, and manual Retry reads it again and shows the configured or
absent result.

### 2. Failed Intent locations recover on the shared transient and rate-limit schedule

Type: Behavior
Status: done

Move `intent-read-recovery` (5). Reuse `anIntentLocationsAnswer` and
observe `ProjectIntentReading` with the real `IntentReadRecovery` and
shared transient schedule over isolated monotonic fake-clock epochs.
Forward optional `readFile` on `loadRepositoryTexts`
(`dashboard/src/repositoryFileReads.ts`) so the shared-wait case
exercises both real published-detail recovery and Intent locations where
their waits interact. Retain the authenticated boundary in
`e2e/intent/intent-read-boundary-recovery.spec.ts`.

**Proof.** Preserve the 15/30/60/60 schedule, visibility and rate-limit
rules, independent recovery of published detail, and manual Retry for
malformed settings with no spontaneous retry.

### 3. Source opens at the location and revision the reader chose

Type: Behavior
Status: planned

Move `intent-code-browse-java`, both `intent-entry-folder-summaries*`,
`intent-gherkin-groups`, `intent-gherkin-layout`, `intent-purpose-case`
and `navigation/source-navigation*` (10). Use the tree and file reading
owners for scopes, expansion, line anchors and plain-text fallback. Use
`sourceLink` for distinct path and link decisions and `WorkSourceLinks`
for the actual pinned links. Keep the real navigation observation where
activation must leave the page. Retain `e2e/intent/intent-code-browse-sources.spec.ts`,
`intent-gherkin-browse.spec.ts` and `intent-gherkin-unusable.spec.ts`
in the same E2E folder for published settings and source reads.

**Proof.** Clicking names and toggles selects or expands the intended
item, Gherkin panes keep independent scrolling, and selecting a case keeps
its exact source and line. A missing Java grammar keeps readable text.
Canonical and plan links use the inspected revision. External, invalid
and unsafe targets retain their distinct results.

### 4. A detour returns the developer to the same reading

Type: Behavior
Status: planned

Move `intent-home-activation`, `intent-project-visit*`,
`intent-read-reuse`, `intent-reading-place`, `intent-recent-stories`,
`intent-selection-reads`, and `intent-story-review-return` (13).
Use production `IntentPageProviders` in the reused Candidates publication
fixture and check its existing recovery and revision consumers before
moving dependent cases. Use the real selection and reading-place owners,
including Review's open/close and focus wiring. Retain
`e2e/intent/intent-project-visit-ci.spec.ts` for the composed visit. Carry
the keyboard Review-return case to E2E if only the full page can observe
its focus handoff, keeping one focus proof for that journey.

**Proof.** Selecting a story opens its own view while a Project Intent
visit uses the published file. On return, restore the nested path, tab,
scroll and focus without extra reads. A late selection answer cannot
replace the current text. A project switch resets the place, and keyboard
activation and an unread-revision notice keep their existing meaning.

### 5. Changed tests stays usable with the selected story's context

Type: Behavior
Status: planned

Move `intent-read-reuse-story`, `intent-sidebar-toggle`,
`intent-story-changes-*`, `intent-story-ci-cues`,
`intent-story-dark-appearance`, `intent-story-summary-title`, and
`intent-story-views-narrow` (16). Share the story-reading arrangement
when examining multiple views of the same selection. Exercise the actual
story lens for overlay changes or a held comparison, and direct production
rules for value-only membership. Keep `e2e/intent/intent-story-changes.spec.ts`
for composed diff and source proof.

**Proof.** Selected story only follows the current revision. An empty or
failed comparison names its cause, permits recovery where offered, and
keeps the tree usable. An opened changed file uses its diff without
rereading published text. Preserve exact title, accessible CI cues,
dark appearance, keyboard activation, narrow layout and independent
sidebar state through story and project visits.

### 6. Done Intent and ordinary Review use the selected historical or live source

Type: Behavior
Status: planned

Move the four `intent-done-*` legacy specs that cover source selection,
project refresh and Review modes. Hold the actual comparison, locations
or review reply at its existing boundary. Retain
`e2e/intent/intent-done-project-refresh.spec.ts` and
`e2e/intent/intent-story-completed-source.spec.ts` for real historical source.

**Proof.** A new Done story replaces the old source only with its own
historical answer. Refresh leaves Done Purpose and its place readable.
Switching Review modes in the open panel waits for each mode's actual
answer, and ordinary Review clears the captured-run selection.

### 7. Done references lead to the intended story or explain what stopped them

Type: Behavior
Status: planned

Move the three `navigation/story-reference-done*` files (11).
Reuse `useStoryReferenceJourney` and its production notice and
destination. Supply the catalog and story answer through the real owner
when recovery or cancellation is the observation. Keep a representative
composed reveal in E2E if reaching and focusing the actual destination
requires the built app.

**Proof.** Pending, unavailable, expired and failed answers remain
distinct; Retry reaches the recovered answer without reading older stories.
The destination retains the required range and focus, including at the
narrow reduced-motion viewport. Navigation, pointer input and Tab can
supersede a held reveal, and disclosure waits for opening before reading
the replaced dependency.

### 8. Story notes update in place and keep the reader's context

Type: Behavior
Status: planned

Move `intent-story-notes` (4) and narrow the existing
`stories/story-notes-control` mount to the real subscribed project state.
Mount directly without `act` or `IS_REACT_ACT_ENVIRONMENT`, keeping the
actual state and typed source for refresh and save ordering. Where line
notes depend on the Review subject, exercise production
`StoryDiffNote` with the selected Intent view. Use
`e2e/terminals/agent-terminal-lifetime.spec.ts` for notes beside the terminal
when shared project wiring changes.

**Proof.** The icons and unreadable warning fit beside the title; opening
and closing Notes keeps the file and restores focus. A line note records
the Intent subject. Refresh updates the subscribed control and a held
older read leaves the saved note visible.

### 9. Recorded slice progress and completion expose their actual evidence

Type: Behavior
Status: planned

Move `stories/taken-slice-progress`, `stories/plan-execution-complete-detail`
and `intent-story-coverage` (6). Use the production card, `SliceProgress`,
`StoryDetail`, and `IntentStoryCoverage` with the read evidence they own.
Keep the real Done read for pending, failure and Retry. Retain
`e2e/stories/branch-slice-progress.spec.ts` and
`e2e/stories/taken-execution-complete.spec.ts` for publication-to-page proof.
Reconcile the whole roster and compare it with the focused legacy
selection using its normal proof reporter before claiming the speed gain.

**Proof.** Show recorded completed slices, plan gaps and product advice
without reading on disclosure or inferring past evidence from prospective
proof. Distinguish absent, unavailable, failed and insufficient coverage
records. Every retired test has an observed owner and the end-of-story
measurements cover all selected destinations.

## Learnings

- **Original Slice 1 overrun (`17` elapsed active minutes, `storyOverruns: 1`, completed proof: none):** Unfinished attempt-owned edits were parked and reverted before in-place slice refinement. The sizing assumption that `anIntentLocationsAnswer` and published-detail recovery were already directly usable on `IntentReadSource` / fake clock proved false: `makeMe.anIntentLocationsAnswer` (`Distribution/tests/support/intentLocationTestData.mjs`, zero callers after `556535c335`) still returned the retired wire `IntentLocationsAnswer` shape rather than `IntentLocations`, and `loadRepositoryTexts` (`dashboard/src/repositoryFileReads.ts`) lacked the optional `readFile` collaborator parameter that `readCachedFile` in the same module already accepts. In addition, `readingLimit.ts` keeps a monotonic module-level `limitedUntil`, so fake-clock cases in `intent-read-recovery` must use past, monotonically increasing epochs (`2020-01-01` + `1h` per case) and `>= 15s` `directedSeconds`. Splitting the in-progress slice into Slice 1 (typed builder + settings explanations/Retry + unused export cleanup, 2 cases) and Slice 2 (`loadRepositoryTexts` `readFile` seam + fake-clock schedule/shared-wait recovery, 5 cases) brings the plan to 9 slices within the 10-slice execution split cap; former Slices 2–8 become Slices 3–9 unchanged in scope.
- **Story-boundary reassessment after Slice 2 clock crossed 15m during report assembly (`17.7` elapsed active minutes at pause, `storyOverruns: 2`):**
  - *Delivered value so far (Slices 1–2):* All 7 Intent locations recovery and settings-problem legacy Playwright cases now run on plain Vitest browser mode (`8` `[mounted-chromium]` cases in `3.9–4.9 s`), `makeMe.anIntentLocationsAnswer` builds typed `IntentLocations`, `loadRepositoryTexts` accepts an optional `readFile` collaborator, and `-6` lines of unused `dashboard/test-support/` exports are retired.
  - *Remaining scope:* Slices 3–9 (`64` legacy Playwright cases across `35` files: source browsing & navigation, detours & reading place, Changed tests story context, Done Intent & Review modes, Done story references, Story notes, and slice progress/completion/coverage + whole-roster reconciliation).
  - *Concrete sizing reason for continuing without resplitting or slice-only refinement:* Slice 2 completed all code edits and all 7 verification commands at `15.0` active minutes (`overrun: false` on the final `slice-clock.mjs run`), crossing the 15-minute mark only during verbose report drafting (`2.7` minutes). No slice-only refinement is proposed; the shared `ProjectIntentReading`, `IntentReadSource`, and `anIntentLocationsAnswer` seams are now settled, and keeping implementation reports concise (table-based substance without prose duplication) recovers the `2.5–3` minutes spent on report assembly so remaining cohesive slices fit the 15-minute active-time budget.

## Plan review

The nine slices follow distinct reading transitions and use the same
source, revision and reading-place model. The Changed tests cases share
the selected-story setup, with product read lifecycle and native layout
assertions kept where each is observed. Original Slice 1 was refined in
place after its overrun to separate the typed locations-answer and
settings-explanation proof loop from the fake-clock transient/shared-wait
recovery proof loop; remaining slices retain their boundaries.

## Execution resume context

- **Mode:** Story Branch Mode (`story-branch`)
- **Workspace:** `/Users/terryyin/git/open-dough/.worktrees/get-fast-proof-of-intent-source-and-story-readin` on branch `cursor/get-fast-proof-of-intent-source-and-story-readin` (default/integration checkout: `/Users/terryyin/git/open-dough`)
- **Target:** `origin` / `main`
- **Publisher ID:** `dashboard-territory.local-open-dough` (agent `Nana-chan`)
- **Published revisions:** claim `c346263b78d91b9d8cabb18ee418360f56ce0462` on `origin/main` (startingRevision `0648ff017ce13c60a489a5442c1bad3e2f2f41a6`, candidateSha `c346263b78d91b9d8cabb18ee418360f56ce0462`; claim `pendingCi: unobserved`); plan-refinement increment `cd05ef9b75ba42c388af72e491affb22a9b6f00a` and Slice 1 increment `b2c7b1dc319336bc0216fe265d207c1bbca614ca` on `origin/cursor/get-fast-proof-of-intent-source-and-story-readin`
- **CI observer:** GitHub Actions, workflow `ci.yml` (`CI`), watching `terryyin/open-dough` branch `cursor/get-fast-proof-of-intent-source-and-story-readin`, mailbox `/tmp/dough-ci-501/watch-dqoYbt`
- **Baseline `dashboard/test-support/` surface at `c346263b7`:** 792 files, 82,277 lines (after Slice 2: 792 files, 82,271 lines; `-6` lines)

## Proof mapping and measurements

### Slice 1 (`intent-gherkin-settings-problems` — 2 legacy Playwright → 3 `mounted-chromium` Vitest, 0 E2E)

- **Accepted proof:**
  - `caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/intent/intent-gherkin-settings-problems.spec.ts --workers=2` (`pass`, `4.91 s` elapsed incl. preparation; cases `240 ms`, `438 ms`, `666 ms`): mounts `ProjectIntentReading` + `IntentReadSourceOnPage` + `requestIntentLocationsAt` over `makeMe.anIntentLocationsAnswer` (`Distribution/tests/support/intentLocationTestData.mjs:131-171`), observing unreadable vs. malformed vs. not-configured explanations (`:137-156`) and failed locations read cause/revision + manual Retry to absent (`:170-177`) and configured Gherkin source (`:205-216`).
  - `caffeinate -s -i npm run typecheck:dashboard` (`pass`), `caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/intent/intent-revision-update-failures.spec.ts dashboard/frontend-tests/intent/intent-read-recovery.spec.ts --workers=2` (`pass`), `caffeinate -s -i npm run test:e2e -- e2e/intent/intent-gherkin-unusable.spec.ts e2e/intent/intent-read-boundary-recovery.spec.ts --workers=2` (`pass`), and Distribution `intent-candidates-location-match.test.mjs` + `test-entry-rules.test.mjs` (`pass`).
- **Retired legacy case mapping (`dashboard/frontend-tests/intent/intent-gherkin-settings-problems.spec.ts`):**
  - `"unreadable and malformed Intent settings stay distinct from not-configured"` → same title (`:105-156`, preserves Doughnut unreadable + Pygardon malformed + competing-text exclusions and adds Doughnut not-configured check).
  - `"an Intent locations read that fails names its cause, and Retry reads it again"` → same title (`:158-178`, preserves exact `.planning/open-dough.json` + revision alert, Retry alert removal, and `No intent locations are configured for Doughnut.`), paired with `"retrying a failed Intent locations read opens the configured source at its revision"` (`:180-217`, proves commitment `3b` configured source & revision recovery).
- **Support retired:** `locationsRequest` (`dashboard/test-support/intentReadRecoveryPage.ts`), `pygardon` (`dashboard/test-support/intentGherkinUnusableFixtures.ts`).

### Slice 2 (`intent-read-recovery` — 5 legacy Playwright → 5 `mounted-chromium` Vitest, 0 new E2E)

- **Accepted proof:**
  - `caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/intent/intent-read-recovery.spec.ts --workers=2` (`pass`, `4.44 s` Vitest duration after refactor / `3.94 s` pre-refactor; summed case time `1.29 s`): mounts `PageIntentRecovery` (`dashboard/frontend-tests/intent/intent-read-recovery-page.tsx:62-155`) wiring `usePageVisibility`, `ObservationOutcomes`, `loadRepositoryTexts` (`dashboard/src/repositoryFileReads.ts:72,99-102`), `recordSettledOutcomes`, `useLimitRecovery`, `PublishedReadStatus`, `IntentReadRecovery`, and `ProjectIntentReading` over `makeMe.anIntentLocationsAnswer` and monotonic fake-clock epochs (`onRecoveryClock()`).
  - `caffeinate -s -i npm run typecheck:dashboard` (`pass`), `caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/intent/intent-gherkin-settings-problems.spec.ts dashboard/frontend-tests/intent/intent-revision-update-failures.spec.ts --workers=2` (`pass`), `caffeinate -s -i npm run test:dashboard:backend -- dashboard/backend-tests/intent/intent-shared-reads.spec.ts --workers=2` (`pass`), and `caffeinate -s -i npm run test:e2e -- e2e/intent/intent-read-boundary-recovery.spec.ts --workers=2` (`pass`, `8.03 s`, 3 boundary cases).
- **Retired legacy case mapping (`dashboard/frontend-tests/intent/intent-read-recovery.spec.ts`):**
  - `"unreachable Intent locations recover after 15, 30, 60 and 60 seconds while revision checks continue"` → `"unreachable Intent locations recover after 15, 30, 60 and 60 seconds"` (`:67-103`, preserves 15/30/60/60 window bounds, Retry offer, `scripts` + revision recovery, and no 6th read after `+61 s`, plus `showsNoUnansweredDetail()`); composed `headsChecks` continuation at `15 s` is already owned by retained `e2e/intent/intent-read-boundary-recovery.spec.ts:78-85`.
  - `"Intent locations make no recovery request while hidden and ask once on reveal"` → same title (`:105-123`).
  - `"published detail and Intent locations share a wait, and healing detail leaves Intent pending"` → same title (`:125-165`).
  - `"malformed Intent settings stay visible until manual Retry"` → same title (`:167-186`).
  - `"rate-limited Intent locations reread when the standing limit ends"` → same title (`:188-221`).
- **Support check:** All `dashboard/test-support/` symbols dropped from `intent-read-recovery.spec.ts` retain active E2E or remaining legacy frontend consumers (`0` zero-caller exports exposed yet).
