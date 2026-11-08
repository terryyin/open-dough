# Select recently done sessions from the dashboard sidebar

**Identity:** SEED-272#select-recently-done-sessions

**Source:** [Select recently done sessions from the dashboard sidebar](../../seeds/SEED-272-select-recently-done-sessions.md#select-recently-done-sessions)
**Source review:** [source-review.md](source-review.md)

## Goal and boundaries

A developer can choose a completed story or retained session in Recently done
sessions and continue in Development or Intent. Selection is repeatable and
leaves the Side panel as it was. Explicit Open keeps the existing access and
navigation when a terminal or final report is available. Open-list and Running
Cursor behavior, history retention, native session lifecycle, and follow-up
launches stay outside this change.

## Current decisions

- [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts)
  gives linked rows the same page-owned Selected story as cards and panel
  content. Reuse the idempotent project-qualified selection in
  [pageStorySelection.tsx](../../../dashboard/src/pageStorySelection.tsx).
  Use the host-qualified [session key](../../../dashboard/src/sessionReference.ts)
  for standalone selection. A row's selected indication and the existing
  "Shown in" panel indication answer different questions.
- Use the same published completion evidence and recent window that
  [Board Recently done](../../../dashboard/src/recentlyDoneView.ts) uses.
  Resolve an attached launch by project and exact story identity. Reuse the
  matching current-revision catalog when present and the existing authenticated
  [snapshot](../../../dashboard/src/authenticatedRead.ts) and
  [catalog readers](../../../dashboard/src/authenticatedDoneRead.ts) on
  demand otherwise. An ad hoc row needs no catalog. A confirmed miss can
  select the session. Keep an unread or failed catalog distinct from a miss,
  including when it names an unreadable file for that identity. Keep the
  current reading and allow the developer to select again or use existing
  session access. Ignore answers superseded by a later choice or navigation.
  The sidebar list needs no eager project-wide or done-body reads.
- Reuse [perspective-preserving project selection](../../../dashboard/src/dashboardRoute.ts)
  and the normal [Intent story lens](../../../dashboard/src/useIntentStoryLens.ts)
  for linked rows. In Intent a standalone choice keeps project, story and
  reading. In Development, the destination's project and Board can be shown
  within Development. Keep existing project visibility rules.
- Separate the row's Select and explicit Open requests at the shared
  [PageFrame](../../../dashboard/src/PageFrame.tsx) boundary. Open reuses the
  current session access, navigation, feedback and focus return. Development
  selection reuses [Board destination and range](../../../dashboard/src/recentlyDoneRange.ts)
  without opening the Side panel. Standalone selection leaves the Selected
  story alone. Where this changes existing guidance, carry the Select/Open
  distinction into [session history](../../../dashboard/AGENT-LAUNCH-HISTORY.md)
  and [Development and Intent](../../../docs/dashboard-development-intent.md).

## Outside-in proof

| Promise | Slice | Observable check |
| --- | --- | --- |
| Select a linked story in Intent | 1 | With a different report shown, choose a verified done story in another configured project. Its title and selected story appear in Intent and the perspective stays selected. The other report stays in the panel, no terminal attaches, and repeating Select keeps the selection. |
| Select a standalone session in Intent | 1 | With a story and file selected, choose a foreign standalone Done row. It is selected, and the existing project, file, story and panel are still shown. Include a Done launch with an active linked story and no matching done record. |
| Catalog gaps and superseded choices preserve the current reading | 1 | Hold a foreign catalog answer while selecting, then select another row before releasing it. The earlier answer cannot change the destination. An unavailable catalog leaves the project and story alone with distinct feedback and usable session access. |
| Select and Open are distinct and accessible | 1 | Reach Select and Open through actual Tab navigation, activate them separately, and exercise the coarse-input controls. Select preserves panel state. Open reaches the existing terminal or final report and retains its reopen, unavailable and focus-return behavior. Open-list navigation from Intent still opens its existing Development destination. |
| See the selected destination in Development | 2 | A linked selection highlights its Story card. A standalone choice visibly selects and reveals its Board entry. Exercise a foreign project and an entry beyond the initial Board range. Development and the existing panel stay as they were in the relevant respects, and the other perspective is never opened. |

## Decisive premises

Observed on 2026-11-08 in the preparation worktree at `2adfa4298`, using
Node 24.21.0 and the dashboard Chromium profile with synthetic GitHub and
native-session boundaries.

| Consuming operation | Observation and result |
| --- | --- |
| Intent consumes the page's selected completed story and project reading scope | The focused command below passed the completed-story and reading-place specs. A selected done record produced its published title and comparison. An unavailable comparison kept the tree usable. Same-project perspective changes restored the reading place and a project change gave it a new scope. |
| Open and Board reveal retain their existing routes and effects | The same command passed the frame and Recently done navigation specs. Opening from Intent moved to Development and kept one attachment across later perspective changes. The Board ranged through entry 27 before reveal. Explicit native report access reached Final report without a terminal. |
| Read a foreign published completion before choosing its project | The temporary `dashboard/tests/sessions/recently-done-foreign-catalog-premise.spec.ts` used the same browser profile and authenticated endpoint. `caffeinate -s -i npm run test:dashboard -- tests/sessions/recently-done-foreign-catalog-premise.spec.ts --workers=1 --reporter=line` passed. With Open Dough's Intent visible, the Pygardon snapshot and revision-pinned catalog both returned HTTP 200. The shared parser found the exact MakeMe story identity at the expected revision while Open Dough and Intent stayed selected. The scratch spec was removed. This establishes the read boundary used by slice 1. Slice 1 owns proof of the new row-triggered behavior. |

```sh
caffeinate -s -i npm run test:dashboard -- tests/sessions/recently-done-sessions-sidebar-navigation.spec.ts tests/navigation/development-intent-frame-sessions.spec.ts tests/intent/intent-story-completed.spec.ts tests/intent/intent-reading-place.spec.ts --workers=1 --reporter=line
```

The four-spec baseline passed all eight tests. Use these specs and the
existing Recently done sidebar reopen, touch, listing and paging specs as
applicable to the changed controls. Keep the intentional old Open assertions
on explicit Open, and add discriminating assertions for Select. Extend shared
MakeMe builders for a retained Done launch when needed. Arrange stories,
catalogs and launches through MakeMe. Keep actions and independent expectations
in the tests. Hold and release reads through observable fixture events.

**Local gate.** Run the affected Chromium journeys and consumers, lint, and
dashboard typecheck for script changes. For a long full run, start awake on
AC power under `caffeinate -s -i`. On battery use the fully awake, lid-open
`caffeinate -i` procedure and inspect the sleep log.
[Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)
and [failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests).

## Slices

### 1. Choose a recent session without opening it

Type: Behavior
Status: done
Proof: Select/Open, linked and standalone Intent choices, catalog gaps and
supersession from the outside-in table. Exercise the real row controls and
normal project/selection consumers.

A developer choosing a retained Done row gets a visibly selected story or
session and stays in the current perspective with the Side panel as it was.
Explicit Open still reaches the existing destination. A verified linked
selection also gives Development its normal story highlight wherever its card
is already shown. This slice can stop with an offscreen Development
destination selected but unrevealed, and with standalone selection indicated
in the sidebar. Slice 2 completes the Board response.

### 2. Bring the selected work into view in Development

Type: Behavior
Status: done
Proof: Development destination from the outside-in table. Check a normal
linked story and an older standalone row in another project's Board, with
visible selection and viewport assertions. Retain the explicit Open
journeys for range, focus and access.

A developer choosing a row in Development sees the selected story card or
standalone session in the destination Board, extending the existing range
only when needed. The reveal follows the current choice, keeps Development
selected and leaves the Side panel as it was.

Learning from slice 1: PageFrame holds the current choice as
`useRecentlyDoneSelection(...).choice` (`{key, kind}` with kind linked,
standalone, checking or unknown) in `dashboard/src/recentlyDoneSelection.ts`;
the reveal consumes it there. Slice 1 accepted proof:
`dashboard/tests/sessions/recently-done-sessions-select{,-check,-touch}.spec.ts`
with the four baseline specs and the Recently done sidebar family (28 passed).
G1 returns the Board reveal assertions of the two rewritten sidebar and paging
steps under Select.

CI disposition: run 42463320829 attempt 1 on slice 1 revision `2d8fcf4` failed
only `ci-proof` at `actions/setup-node` (HTTP 504 twice downloading Node
24.21.0 from GitHub releases, 60 s step bound); all 16 other jobs, including
every dashboard shard, passed, and other branches acquired Node in the same
window. Ignored as infrastructure; slice 2 publication runs full CI.

## Preparation review

Slice-plan refinement was unnecessary. Selection and Board reveal each have
their own observable result and proof, and the second consumes the first's
one selection rule. No slice-specific concerns remain.

## Story obligations

### G1. (first reported in slice 1) A Done row without Open no longer reveals its Board entry (sidebar "an unavailable Done entry" and paging "older cross-project session" steps now assert the project stays)
Reported: slice 2 — "a Done row without terminal or final-report access no longer goes to its project's Board. Before, row activation switched the project and revealed the Board entry; now it has no Open and Select only selects it."
Story clause: "In Development, selection brings the story card or standalone session into view in its project's Board, extending the Recently done range as needed."
Disposition: proved by slice 2: dashboard/tests/sessions/recently-done-sessions-sidebar.spec.ts step "an unavailable Done entry offers no Open, and choosing it selects it and brings its Board entry into view in its project" and recently-done-sessions-sidebar-paging.spec.ts step "choosing an older cross-project session selects it and brings its Board entry into view in its project" assert the project switch, toBeInViewport and selection under Select
