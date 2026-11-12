# Express Board, navigation and published-read test intent

**Identity:** SEED-300#express-board-test-intent-through-page-objects
**Source:** [Story](../../seeds/SEED-300-dashboard-test-page-objects.md#express-board-test-intent-through-page-objects)

## Goal, scope and evaluation

A developer reading these tests can follow the user's Board navigation and the
published facts retained or replaced. Shared browser controls have one owner;
independent expectations and causal transport evidence remain in the scenario.

Resolve all six source findings and their reached same-control/sequence callers.
Story examples 1–7 map to slices 1–8 below; example 8 and the shared acceptance
criteria belong to every slice. Preserve each distinct behavior check and tier.
No new dashboard behavior, universal fluent conversion, framework, speed/case-count
promise, or wholesale sibling-workflow migration is included. Necessary repair
of failing maintained proof is owned, never waived as an unrelated baseline.

Baseline: audit `7eab3d6ca`, reconciled to this workspace at
`99dcb55b67cc56a67f40ff2c29c97786eb2e3b28` on 2026-11-12. For each finding,
execution retains representative before/after source, caller dispositions,
mechanics edit sites removed, and helper cost. Keep clearer actions/outcomes and
one coherent control owner only when their gain justifies that cost. Passing
commands and fewer raw locators alone do not establish improvement.

## Architecture and existing solutions

Follow Accepted [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
for Inspect versus Selected story, named regions, and published versus local
facts; and [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
for the comparison above. The index and in-file statuses agree, with no relevant
supersession or conflict. Follow [One backlog interpretation, separate observation
and presentation](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
and the [navigation guidance](../../../docs/dashboard-navigation.md). Existing
direction supports this test-side change; no new North Star topic is needed.

PFE decisions from current source and the observations below:

| Responsibility | Existing solution and decision |
| --- | --- |
| Column paging, layout, wheel reading | Extend `boardColumnNavigation.ts` and `boardPage.ts`; reuse `readingPlace.ts`, `touchGestures.ts` and `pageLayout.ts`. Keep expected columns, keys, geometry and modality supplied by callers. |
| Project/frame/destination navigation | Extend `projectChoice.ts`, `dashboardParts.ts`, `pageShortcutsPage.ts`, `sourceNavigationJourney.ts` and `notificationStoryJourney.ts` at their existing boundaries; setup remains setup. |
| Inspection, selection and references | Extend `storyCardControls.ts`, `storyCardSelection.ts`, `storyReferenceDone.ts` and scoped reference operations. Fluent `storyCardPages.ts` composes the same controls; do not create another Board-wide framework. |
| Card, roster and attribution facts | Reuse `rosterParts`, readiness observations, `agentPortrait.ts` and `publishedFactsAssertions.ts`. Extract repeated credit/progress observations into focused card/roster owners where a gap remains; `agentRosterRecords.ts` owns fixture records, not browser expectations. |
| Recently done range and retention | Extend `recentlyDoneColumn.ts` and `recentlyDoneProgressivePage.ts`; keep `recordsAsked` and held-answer evidence independent. `recentlyDoneProgressiveJourney.ts` remains a publication/journey collaborator. |
| Published arrival and recovery | Compose card readers with `transientRecoveryPage.ts`, existing refresh/clock/request owners and focused retained-reading observations. Do not move request holds, revision advancement, or expected results into a page object. |

Expected owner/support edits are at most 250 lines at this revision:
`boardPage.ts` 192, `boardColumnNavigation.ts` 110, `projectChoice.ts` 90,
`storyCardControls.ts` 93, `storyCardSelection.ts` 47, `storyCardPages.ts` 173,
`recentlyDoneProgressivePage.ts` 119, `dashboardPage.ts` 250,
`dashboardParts.ts` 120, `transientRecoveryPage.ts` 27, `pageLayout.ts` 247,
`storyReadinessAccessible.ts` 249, `autoRefreshJourney.ts` 236.
The inspected navigation/stories/observation specs are also at most 250 lines.
Preserve existing composition/re-exports; add cohesive reading/credit modules
rather than growing the near-limit facades. Recheck exact expected edits before
authoring; newly discovered oversized edits need their own cohesive decision.

## Decisive premises and preparation observations

All observations ran in this owned workspace at the revision above on 2026-11-12.
Trial code and injected faults were restored byte-for-byte before record writes.
These observations establish bounded premises, not completed implementation.

| Premise / consuming operation | Form and observed result | Unverified remainder |
| --- | --- | --- |
| The integrated proof route builds its local server here. | Initial pointer probe failed at server-bundle `mkdtemp` because this worktree lacked `node_modules`; `npm ci --silent` repaired setup. The same route then passed. | Execution must install this checkout's dependencies; parent resolution is insufficient. |
| A card operation can expose press without swallowing release or focus proof. | P1 temporarily extracted scroll/box/move/down to `holdCardAction(Locator)` in `storyCardControls.ts`; the original pointer case passed, with release, intermediate expectations and up still explicit. | Execution sweeps every affected caller; this one case is no suite-wide claim. |
| That case detects losing the causal press. | P2 omitted only `mouse.down` in the trial helper. The maintained `not.toBeFocused` failed: Done destination actually held focus. P3 restored the helper and passed. | Preserve this exact assertion strength and split input sequence. |
| Project choice, card gaps, ranges and retained published reads reach real results here. | P4 selected seven actual integrated cases: compact resize, malformed dependencies, 35-entry reveal, published-fact arrival, unchanged carry and failed-check recovery passed; native Board reading failed. | Six passing cases do not establish all variants or excuse the seventh. |
| Native End is a valid unchanged Board baseline. | **False.** P4 and an instrumented diagnostic both saw End focus Board but leave scrollTop 0 instead of 5457. Event log shows keydown, focusin, keyup and scrollend at 0, without scripted scrolling. A separate ordinary-document End comparison passed in the same fixture/profile. | Slice 2 owns diagnosis/repair and full native reading replay. No root cause or remedy has yet been demonstrated; this blocks readiness. |
| The named proof cohorts select real specs in this checkout. | P5 executes each C1–C8 regex through the real runner with `--list --reporter=json`; retain the resulting selection counts below. | Listing is route selection only, not behavioral proof. |

Literal pointer command for P1/P2/P3 (one case each, no retry):
`caffeinate -i npm run test:dashboard -- tests/navigation/story-reference-done-cancellation.spec.ts --grep 'pointer down stops' --workers=1`.
Runs took 16.485 s / 19.268 s (expected fault failure) / 15.053 s.
Evidence: `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/board-refinement-ifk_7pfh/`
contains command, proof records, fault report and restoration hashes.

P4 command (seven cases, six passed, one failed, 70.311 s):

```sh
caffeinate -i npm run test:dashboard -- tests/navigation/board-reading.spec.ts tests/navigation/dashboard-header-compact.spec.ts tests/stories/story-dependencies-malformed.spec.ts tests/stories/recently-done-progressive-loading.spec.ts tests/observation/published-facts-reading.spec.ts tests/observation/steady-refresh-carry.spec.ts tests/observation/auto-refresh-recovery.spec.ts --grep 'body reading keys|resizing keeps Doughnut|malformed and unreadable|35 entries show ten|including done success|an unchanged revision|a failed check keeps A' --workers=1
```

P4 proof/log/command: `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/board-preparation-cohort-7xcn3lkt/`.
Instrumented native-key command: `caffeinate -i npm run test:dashboard -- tests/navigation/board-reading.spec.ts --grep 'body reading keys' --workers=1`;
events/proof/log: `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/board-key-diagnostic-vofc5pe9/`.
Ordinary-document comparison: same file/runner with temporary case selected by
`--grep 'diagnostic native End' --workers=1`; proof/log:
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/board-native-diagnostic-o13wf1p9/`.

Host decision before launch: macOS on battery 65%, lid observed open, load
31.01/26.01/17.47, 57% memory free, with other worktrees' Playwright and Python
work active. Use one worker under `caffeinate -i`; leave other owners' work alone.
Reconsider power/load before larger cohorts; no timeout or assertion was relaxed.

## Ordered slices and outside-in proof

Each Behavior includes its caller sweep, source comparison, implementation,
focused proof and cleanup. C1–C8 below are initial proof cohorts, not file-based
scope limits. Extend them through the effect/consumer trace before delivery.

### 1. Read and page the Board without losing its usable room
Type: Behavior
Status: planned
Proof: C1; retain expected column order, card share, scroll extent, reduced motion,
kept position, and panel/sidebar/dialog conditions. Story example 1.

Behavior: Given a long or paged Board, the developer reads named column paging,
wheel and resize operations and their independent geometry outcomes. Extend the
existing column/layout owners; browser probes remain measurements of the actual
page. Safe stop: layout/column callers are readable and green without keyboard,
reference or recovery migration.

### 2. Follow native keyboard and touch reading with preserved ownership
Type: Behavior
Status: planned
Proof: C2 plus reached C1 callers; retain exact keys/gestures, native-document
comparison, expected focus, modal ownership and reading positions. Example 2.

Behavior: Given body/Board/control focus, reading keys or touch move the intended
region and modal controls keep their keys. First resolve the reproduced End
failure, preserving its bottom/focus assertions and ordinary-document comparator;
replay the whole Home/End/PageDown/PageUp, focused-control, help open/close and
modified-key journeys. Then share their reading mechanics without pre-focusing
Board in a way that removes the body-to-Board promise, synthesizing a passing
measurement, or loosening bounds. No rerun-until-green disposition is allowed.
Safe stop: native/touch reading has current passing proof and independent inputs.

### 3. Follow project, header and destination focus through shared controls
Type: Behavior
Status: planned
Proof: C3; preserve compact/wide transitions, actual key order, perspective,
selected project, sanitized/pinned links and arrival focus/scroll. Example 3.

Behavior: Given a current project and viewport, named project/frame/destination
actions expose where the reader arrives and what stays selected. Reuse existing
project/shortcut/source owners; independent exact-name/URL contracts stay
explicit. Safe stop: these navigation callers stand alone with their assertions.

### 4. Inspect and follow references without hiding interruption
Type: Behavior
Status: planned
Proof: C4, including all three Done-cancellation cases and selection/dependency,
identity, scroll-completion, failure/retry and repeated-destination cues. Example 4.

Behavior: Given a pending reference, the scenario states its later choice,
release and expected destination/focus. Share card/reference controls with
procedural/fluent consumers while retaining separate down/up, Tab, Inspect and
Show latest 10 actions. Keep selected versus inspected state distinct. P1–P3
support this seam. Safe stop: navigation and every interrupted continuation pass.

### 5. Read card and roster facts with independent expected evidence
Type: Behavior
Status: planned
Proof: C5 plus reached launch eligibility, session attribution, published-fact
and branch-refresh consumers. Expected actor, ordering, badge/state, links,
slice counts, malformed text, avatar source and request counts remain explicit.
Example 5; owns the Story card evidence finding.

Behavior: Given published preparation/dependencies/assignments/progress, named
card/roster observations explain available facts and gaps. Reuse scoped readiness
and portrait readers, extracting repeated credit/progress mechanics where needed.
Keep raw invalid bytes, history/HTTP evidence and MakeMe setup outside browser
owners. Safe stop: all card-evidence finding/caller dispositions are supported.

### 6. Reveal and retain Recently done ranges through one column owner
Type: Behavior
Status: planned
Proof: C6 plus reached C1/review/retained-session consumers; preserve visible
entry order/count, nested versus standalone entries, exact requested paths,
held failures/retry, collapse focus, retained position and pending destination.
Example 6; owns the Recently done finding.

Behavior: Given a partial range, reveal/latest/refresh/session-reference actions
show the expected range and keep or supersede the chosen destination as stated.
Extend existing column/progressive owners. Replace the reached `settle` helper's
500 ms wall-clock delay with completed read/render/motion observations; use
controlled clocks where time drives behavior. Retain request-count evidence
rather than swapping the delay for an unconditional immediate check. Safe stop:
all its callers use causal completion and the range/navigation journeys pass.

### 7. Read arriving facts and retained cards through shared observations
Type: Behavior
Status: planned
Proof: C7; retain held group identity, independent release/failure order,
placeholder history, card text/box snapshots, pinned links, selected/inspected
story, focus/viewport and the reader's later wheel move. Example 7, arrival/carry.

Behavior: Given open scrolled inspection and held facts or a new revision,
shared observations show what remains and what changes when each answer arrives.
Extract snapshot/placeholder mechanics from `steady-refresh-carry.spec.ts` into
focused reading support, composed with card owners from slice 5; callers retain
old/new expected values and revision normalization under proof. Safe stop:
arrival/carry finding dispositions are green without recovery changes.

### 8. Read recovery and limits without concealing timing or source truth
Type: Behavior
Status: planned
Proof: C8 plus consumers outside observation reached by changed recovery/card
owners. Retain controlled schedules, request logs/counts, failed/retained/fresh
revisions, profile/credit source, notices, retry, placeholder and focus evidence.
Example 7, recovery; completes the published facts/refresh/recovery finding.

Behavior: Given a failed, limited or independently delayed read, named visible
fact/notice observations explain retained truth and subsequent recovery around
explicit clock and answer steps. Extend focused recovery/card owners rather than
wrapping whole scenarios. Finish all six finding/caller comparisons, including
justified direct-contract observations. Safe stop: every finding and reached
caller has a completed disposition and the combined affected proof passes.

## Proof commands and execution gates

For each Cn regex below, run `caffeinate -i npm run test:dashboard -- '<regex>' --workers=1`
on battery with lid open; on AC use `caffeinate -s -i`. P5 uses the same runner
and regex with `--list --reporter=json` instead of a behavioral run.
P5 selected C1: 19, C2: 16, C3: 35, C4: 22, C5: 26, C6: 39, C7: 26, C8: 27 cases; all eight listings exited 0 without errors.
Selection evidence: `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/board-cohort-selection-1l9gp5uo/cohorts.json`.

| Cohort | Regex |
| --- | --- |
| C1 | `/tests/navigation/board-(scroll|paging[^/]*|height|clamp|kept)\.spec\.ts$` |
| C2 | `/tests/navigation/(accessible-board[^/]*|board-(reading|native-reading|session-reading))\.spec\.ts$` |
| C3 | `/tests/navigation/(dashboard-header[^/]*|project-(keyboard-navigation[^/]*|selection)|development-intent-frame[^/]*|notification-story-navigation|source-navigation)\.spec\.ts$` |
| C4 | `/tests/navigation/(story-card-[^/]*|story-reference-[^/]*|story-destination-repeat-cue)\.spec\.ts$` |
| C5 | `/tests/stories/(backlog-preparing|preparation-legend|story-readiness[^/]*|story-dependencies[^/]*|agent-roster[^/]*|taken-(slice-progress|agent-profile|execution-complete)|branch-(slice-progress|progress-reading))\.spec\.ts$` |
| C6 | `/tests/stories/recently-done-(progressive[^/]*|read-latency|stories)\.spec\.ts$|/tests/navigation/story-reference-done[^/]*\.spec\.ts$|/tests/sessions/recently-done-sessions-sidebar-(navigation|paging-board)\.spec\.ts$` |
| C7 | `/tests/observation/(published-facts-[^/]*|steady-refresh[^/]*)\.spec\.ts$` |
| C8 | `/tests/observation/(auto-refresh-(recovery|rate-limit)|profile-addition-latency|transient-(credit-recovery|read-recovery|detail-recovery|recovery-currentness|recovery-lifecycle)|owner-replacement-recovery|limit-recovery-(credit[^/]*|detail)|limited-reading-profile-history)\.spec\.ts$` |

Run changed specs and transitive consumers per [own executable proof](../../../.agents/skills/dough-story-refinement/references/executable-proof.md),
including aggregate text/count/focus observers and indirect wrappers; produce the
consumer trace and disposition every reached caller as run, reused or excluded
with a boundary reason. Cohorts reuse sufficient proof at unchanged boundaries.
Shared card/column owners reach launch/session/Intent/review callers: their
presence outside the initial cohort never excludes their proof. A changed shared
fixture justifies a broader local cohort; CI configuration alone does not.
Run `npm run typecheck:dashboard` for shared TypeScript changes under the
[test guidance](../../../tests/README.md#waits-fixtures-and-teardown).

Apply [MakeMe](../../../tests/README.md#test-data-architecture) to domain setup;
exact invalid bytes/keys and independent expectations remain explicit. The
installed entry selector at the preparation base resolved both convention flags
false for these spec entries; AGENTS.md independently required MakeMe.
Recheck selection when paths change. Preserve tiers, default timeouts and causal
waits; no wall-clock sleeps, `test.slow()`, suite/file/hook timeout override.
The local-gate sleep guard and power condition are maintained in
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Carry the project's [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written, by this link or verbatim, into every delegation and repair handoff.

## Current decisions, concerns and readiness

Eight cohesive proof loops keep layout separate from input ownership and
arrival/carry separate from recovery; each includes cleanup and caller sweep.
No numeric slice target or hard limit was supplied. Reassess actual scope and
helper cost at each boundary; do not split by file or introduce deferred machinery.
Slice-plan refinement was not needed: the rewritten boundaries have distinct
observable outcomes and reuse the same existing component owners cumulatively.

One blocking concern remains: slice 2's native End baseline reproducibly fails
in this checkout, although the ordinary-document comparator passes. Its root
cause and repair have not reached a passing complete Board-key journey. This is
not a waived pre-existing failure, permitted infrastructure probe, or human-owned
decision. Record **not-ready** until diagnosis/repair and full affected replay
settle that premise, then reassess the current story and plan through the recorder.
No other slice-boundary/proof-ownership concern was identified in this review;
this is neither completed execution nor authority to begin it.
