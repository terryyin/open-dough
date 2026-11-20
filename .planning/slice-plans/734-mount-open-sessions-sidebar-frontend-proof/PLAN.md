# Prove open Sessions sidebar readings in mounted frontend tests

**Identity:** SEED-413#mount-open-sessions-sidebar-frontend-proof
**Source:** [Prove open Sessions sidebar readings in mounted frontend tests](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#mount-open-sessions-sidebar-frontend-proof)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

Give dashboard developers a fast Vitest Chromium check of the open Sessions
list, attention badge, compact row and host figures using typed observations.
Move five cases out of the built-app engine in these four
`dashboard/frontend-tests/sessions/` specs:

- `sessions-sidebar-order.spec.ts`
- `sessions-sidebar-row.spec.ts`
- `sessions-sidebar-state-edge.spec.ts`
- `sessions-sidebar-host-status.spec.ts`

The E2E journeys keep ownership of page assembly, machine and host reading
pace, cross-project navigation and focus, and touch. Preserve their behavior.
Recently done and Running Cursor, layout changes to the frame, terminals and
reports, and service contracts belong to their existing work. This story
owns only the four named frontend specs within the session family coordinated
with [SEED-341](../../seeds/SEED-341-simplify-session-tests.md#simplify-remaining-session-tests).

## Key examples and proof

| Observation supplied to the sidebar | Observable proof and owner |
| --- | --- |
| An old Needs input session and a newer failed session precede three working sessions. A working one changes to Needs input. | The open list orders attention by oldest launch, then other sessions by newest launch. The row moves to the right position and the existing Sessions button's badge increases. The mounted list and button share the production grouping (slice 1). |
| Short and long titles appear side by side with their own launch ages | The long title is clipped to one line with an ellipsis and time inside its row. Full state, project, workflow and launch time remain in the tooltip and the desktop disclosure stays hidden (slice 2). |
| The clock crosses minute, hour and day thresholds | The real row's launch age changes on its tick and uses the largest whole unit. Changing system time alone does not update it (slice 3). |
| The host reports seven working, attention, failed, stopped or unread states | Real CSS supplies the matching border color, style and thickness, and the row includes the corresponding hidden label. Unavailable and an unrecognized activity keep distinct explanations (slice 4). |
| Sessions and machine figures answer independently | Active and waiting counts stand beside available CPU and disk figures. Either unread figure says unavailable, both say unavailable when the host read fails, and CPU and disk still appear while sessions are unread. New input updates the figures (slice 5). |

## Current decisions

- Reuse `openSessionsOf`, `SessionList`, `SessionsButton`, `shownSession`,
  `SessionsSidebarSessionEntry` and `SessionsSidebarStatus`; each already
  owns part of the reading. Follow the
  [Architectural North Star](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
  Keep one open-session grouping, one sidebar row, and distinct facts for
  open sessions and the machine. The production frame still owns opening
  across projects and receives the existing `SessionRequest`.
- `SessionsSidebar.tsx` is 255 lines. In slice 1, extract the existing open
  list and its alert and empty-state rendering into a focused production
  view. Keep the sidebar frame, optional sections, and toggle ownership at
  the existing entry point. Feed the list the typed open reading and the
  project label and current-session facts used for the shared row. Resolve
  page contexts at the production composition boundary. Keep the row's
  Recently done selection, review and access inputs within that existing row
  path. The open-row mount needs no terminal actions, retained-history
  provider or host discovery. Preserve DOM and CSS hooks for the `PageFrame`
  and `RecentlyDoneSessions` consumers. Verify the same markup behavior in
  the relevant existing frontend and E2E readers in slice 1.
- Use the page MakeMe entry and existing record, observation and host-status
  builders. Expose the Node-free launch builder and existing observed state
  and status builder accessors there for these tests. Keep the Node-only
  `LaunchReviewedSessionBuilder` examples in `makeMe.mjs`; they extend the
  same base. Use a real narrow viewport or sidebar-width container with the
  production classes for layout. Keep the 30-second `useTickingNow` rule and
  use a controlled browser clock for its mounted observation.
- Reuse `SessionsSidebarStatus` directly for figures and keep
  `readHostStatus` and `useHostStatus` on the production path. Exercise a
  failed transport at the client adapter and use the typed unread result at
  the view. The existing `e2e/sessions/sessions-sidebar-host-status.spec.ts`
  owns actual reading cadence, visibility and repeated updates. Audit imports
  from the four moved specs before retiring any helpers. Keep
  `sessionsSidebarPage.ts`, `sessionsSidebarFigures.ts` and the shared
  machine answers wherever E2E and other frontend cases still use them.

## Decisive premises

| Consuming operation | Observation |
| --- | --- |
| Chromium can render the production row and title figures from typed inputs without the app | In the preparation checkout at `382995572`, `caffeinate -s -i npm run --silent test:dashboard:frontend -- intent-candidates-planning-probe sessions-sidebar-planning-probe --workers=2` ran a scratch Vitest mount using the production row, title figures, current providers and Node-free MakeMe builders. At actual sidebar width it observed a long title with `ellipsis` and `scrollWidth > clientWidth`, one active session and unread disk. Rerendering the working record as waiting changed the named figure to one needing attention and the same row's tooltip to Needs input with the project label retained. The case passed in 135 ms. Slice 1 narrows the providers used for this observation. Scratch files and builder accessors were removed. |
| The built-app cases provide the comparison behavior | At `382995572` on November 20, the built-app frontend selection of these four specs and six Optimization Candidates specs passed 17/17 at two workers on AC. Sessions contributed five first-attempt cases and 9.081 summed case seconds. The mixed selection's 29.66 s wall time includes preparation and is diagnostic on a busy machine. |

## Ordered slices

### 1. The open list reorders when a session needs attention

Type: Structure
Status: done

Give the existing open list the focused production entry described above and
move the ordering case. Feed joined MakeMe records into the real grouping
and existing badge. Rerender with a single session's state changed. Keep the
frame's full reading and click behavior as it passes the typed facts.

**Proof.** Observe waiting and failed first in launch order, working newest
first, then the newly waiting row in the right position with the badge at
three and its Needs input cue. Reverse one order in a scratch check and
observe the mounted proof fail, then restore. Run `sessions-sidebar-order`
and the existing `recently-done-sessions-select`,
`recently-done-sessions-sidebar` and `board-paging-sessions-sidebar` frontend
readers reached by the production edit. Run E2E `sessions-sidebar-reading`,
`sessions-sidebar-navigation` and `recently-done-sessions-sidebar-navigation`
to verify composed consumers.

**Accepted.** Extracted `SessionsSidebarOpenList`; mounted
`sessions-sidebar-order` observes B,C,E,D,A with badge `2`, then after D
waits B,C,D,E,A with badge `3` and Needs input. Scratch reverse-order fail
restored. Frontend readers (5) and E2E (5) passed; typecheck and lint clean.
Evidence: `open-dough/evidence/SEED-413-mount-open-sessions-sidebar-frontend-proof/slice-1-return-report.md`.
Refactor: none — already clean.

### 2. An open row keeps its full title and facts in a compact reading

Type: Structure
Status: planned

Move the row's sizing, tooltip and desktop-disclosure assertions. Use the
real row CSS within the sidebar width, with a long and a short title of the
same age. Keep the legacy file until its elapsed-age assertions also move.

**Proof.** Verify the text, one visible line, actual overflow and ellipsis,
equal row heights and elapsed time within the long row. Inspect the tooltip
for state and reason, project and workflow, and formatted launch time.
Observe the hidden disclosure and full accessible title. Run the mounted
row proof and retained row-time case.

### 3. Open-session age advances on the established browser tick

Type: Structure
Status: planned

Move the elapsed-age example onto the rendered open row. Initialize a fixed
clock and drive the production timer. Cover below a minute, the first
minute, and larger whole minute, hour and day values. Remove the last
Playwright row case when the mounted proof passes.

**Proof.** Observe the old age after a time change before the timer fires,
then the updated age at the tick, including the checked floors. Run both
row selections. A scratch skipped tick or rounded-up unit must change its
corresponding assertion.

### 4. State edges and hidden labels preserve their distinctions

Type: Structure
Status: planned

Move the edge case to real Chromium layout with typed observations for
Working, Needs input, Ready for review, failed, stopped, unavailable and
unrecognized activity. Keep the independent color, style, width, and
wording assertions where they distinguish those states.

**Proof.** Observe the exact hidden words and computed edge per state,
including the two distinct halted words, the unrecognized description and
equal thick attention edges over the thinner Working edge. Run the edge,
row and ordering selections. Removing one state edge in a scratch edit
must break the corresponding computed-style assertion.

### 5. Session and host figures remain independently readable

Type: Structure
Status: planned

Move the status cases to the real title figures with typed inputs for unread
disk, unread CPU, new samples and unread sessions. Preserve conversion of an
unanswered host read into unavailable figures through the client adapter.
Leave the existing E2E owner for reading pace. Retire any setup without
consumers and record the focused comparison.

**Proof.** Observe exact values and accessible wording for available,
unavailable and zero figures. Rerender with newer e.g. `61%` and `1.2 TB`
and with hosts available before sessions. Check that a failed host response
yields both unavailable figures while the session figures remain. Run the
four moved families, the host-status E2E and a final engine listing.

## Local gates

- Follow the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Apply [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [test-entry selection](../../../.agents/skills/dough-page-objects/SKILL.md)
  before test edits. Keep the selected local mounted controls, frontend
  cases with default timeouts and direct rendering and retrying assertions.
  Keep `actSettled`, React `act` and `IS_REACT_ACT_ENVIRONMENT` out of the
  mounted cases.
- On AC power, run tests under `caffeinate -s -i`, as described in
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  Run `npm run typecheck:dashboard`, `npm run lint` and the changed readers
  of the production seams. The focused family gate is
  `npm run test:dashboard:frontend -- sessions-sidebar-order sessions-sidebar-row sessions-sidebar-state-edge sessions-sidebar-host-status --workers=2`.
  For slice 1 run the e2e specs named there under `e2e/sessions/` with
  `npm run test:e2e -- <spec paths> --workers=2`. For slice 5 run
  `npm run test:e2e -- e2e/sessions/sessions-sidebar-host-status.spec.ts --workers=2`.
- Apply [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Compare median elapsed time over three warm, interleaved base/candidate
  runs of the same two-worker family selection under comparable load on AC.
  Record equivalent proof coverage, fewer setup steps or helpers and any
  measurement limits. The parent campaign owns the complete-suite check.

## Plan review

Slice-plan refinement was unnecessary. Five slices each retain a separate
observable check. The same session reading, row and host presentation serve
all cases. The open-list boundary is the only UI reorganization planned and
the composed readers cover its existing consumers. This review found no
remaining slice-specific concern.

## Learnings

- Playwright-only frontend filters need `CI=1` / `--reporter=list` for visible
  case results in evidence logs.
