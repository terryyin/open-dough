# Exercise Board navigation on published story fixtures

**Identity:** SEED-442#exercise-board-navigation-on-published-story-fixtures
**Source:** [Exercise Board navigation on published story fixtures](../../seeds/SEED-442-exercise-board-navigation-on-published-story-fixtures.md#exercise-board-navigation-on-published-story-fixtures)

## Goal and scope

Use published story membership to verify Board paging, focused reveals, and
native session actions. The supplier changes only the test suites and their
fixture owners. SEED-439 consumes that proof when it retires standalone rows.

## Execution context

Story Branch Mode on `codex/exercise-board-navigation-on-published-story-fixtures`
in the owned worktree of that name. Publisher
`dashboard-territory.local-open-dough`, agent Maria-chan, and target
`origin/main`. Starting revision `7a8c78b369bf0da3ea5c5e3b2f850e9c70d5d57e`.
The accepted claim and first story-branch tip are
`758efa5db911b7466bf258d1a3a9e35ff9a8498b`. The checkout's reused locked
installation matches those inputs, and Dashboard typecheck passed there.

Branch CI uses GitHub Actions `ci.yml`, display name `CI`. Codex observer
`codex-seed-442-20261125` watches the execution branch at
`/tmp/dough-ci-501/watch-N9QUs0`, PID `38215`, session `65850`,
cell `g419:50`.

## Decisions and retained evidence

- Keep the real, routed Git publications for progressive and moving Board
  fixtures. Trunk integrated the session-navigation routing in `2343db420`
  and real Recently done history in `9b3a0186a`. Reuse their committed origins,
  repository revisions and held detail reader. Align test records with Git
  membership under [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
- Publish a Done record for every top-level Recently done position under
  test. Use the existing native session and MakeMe owners for retained
  launches attached to those stories. Use the shared Dashboard page objects
  for conditional visibility, selection, keyboard and terminal actions.
- Slice 6 of [SEED-439](../833-complete-story-linked-ad-hoc-sessions/PLAN.md)
  paused with an implementation patch based on `aed91f904`. Its
  `SLICE-6-REPORT.md`, `slice-6-consumer-dispositions.md` and
  `slice-6-remaining-journey-check.log.run.json` record two fixture failures and
  verified linked checkout, review, and warning claims. Those records live in
  SEED-439's worktree Git evidence directory. Reuse the applicable proofs;
  ownership of the product candidate and its combined acceptance stays with
  SEED-439. The fixture changes here should also apply on that candidate.
- Leave the existing page entry that matches published Done membership in
  control of selection and location. A local Done mark can alter a session's
  state and close its native controls. A published story's state controls the
  story's column.

## Decisive premises

| Consuming operation | Evidence and result | Remaining verification |
| --- | --- | --- |
| Progressive Board resolves each fixture revision and reads only the requested bodies | Preparation ran the existing Playwright baseline on the exact supplier checkout with its locked dependencies and one worker. See the preparation evidence record below. | Slices 1 and 2 replace session-only positions with Done records and verify reads and focus on the selected revision. |
| A retained session can reveal its published Done story in Development | The same baseline includes `recently-done-sessions-select-ad-hoc-development`, which reaches an actual catalogued Done card beyond the default Board window. | Slice 2 observes this route under held reads, a competing selection, and a different project. |
| Local native Done can succeed independently of the published story's phase | Existing linked report and terminal cases exercise the local controls. SEED-439 passed `session-column-membership` on a linked fixture with refusal, retry, reopening, focus and deletion. | Slice 3 verifies the applicable native actions on the shared linked support in this checkout. |

Preparation on `e9415a39` passed Dashboard typecheck and nine browser cases
from `recently-done-sessions-select-ad-hoc-development`,
`recently-done-progressive-failed-read-refresh`,
`recently-done-progressive-navigation.spec` and
`recently-done-progressive-state.spec` with one worker.
The focused linked native actions in `agent-terminal-done-report` and
`final-report-done-native` also passed. These include local Done from a
story-linked terminal and the final report while its story is still Taken.
The matching `prepare-*.log.run.json` and browser records are in this
worktree's Git evidence directory.

## Ordered slices

### 1. Page and refresh published Done stories
Type: Behavior
Status: done
Proof: Recently done reads the displayed Done records for the actual published
revision. Show latest 10 and a revision refresh preserve the selected range,
read only the intended records and retain or recover focus.

Move the refresh, reset, failed-read refresh, loading and added-project paging
checks reached by the changed shared fixture. Use the existing records and
publication helpers. Handle a held record and Retry through their existing
route. Keep the observation that the first session inventory can delay the
initial page read even when the top-level entries all come from Git. Verify
the sidebar paging boundary and concrete case-specific consumers from the trace.

Accepted proof: Published Done catalogs now own the tested top-level
positions. The 17-case browser selection checks exact body-request bounds,
Retry, revision refresh, focus, Show latest 10 and independent Sidebar
paging. Eleven neighboring native/navigation cases and five mounted
Sidebar cases passed alongside Dashboard typecheck. The remaining
navigation-specific mixed fixtures belong to slices 2–3.
See `SLICE-1-REPORT.md` in the worktree's Git evidence directory.

### 2. Reveal a published Done story from its native session
Type: Behavior
Status: planned
Proof: Selecting the session of a later Done story reveals its card. Held
details preserve the reading bound and keyboard target. A later selection,
project change, or Show latest 10 supersedes the pending reveal. The terminal
retains its own open, close, and return behavior.

Move the progressive navigation and state cases that exercise reveal,
including the Cursor and cross-project sidebar routes. Seed a Done catalog
with retained sessions referencing the owning story. Account for read paths
through the target ordinal. Keep the native run and the catalog revision
separately observable. Use the existing focus and panel support.

### 3. Preserve native Done actions on linked sessions
Type: Behavior
Status: planned
Proof: Mark as done from the Board, terminal and final report settles a
native session and preserves the applicable panel and keyboard behavior
with a published story fixture.

Move the native actions left in the progressive scenarios, including the
covering terminal and final report routes. Reuse existing linked proofs
where they make the same observations. Remove the assertion that a local
Done mark creates a top-level Board item, and identify the remaining
coverage by case in the return. Verify the affected families together and
check the fixture paths for compatibility with SEED-439's paused candidate.

## Proof gates

Run Dashboard typecheck and the owning E2E selections. Use one local
Playwright worker with a proof record and trace affected consumers. When
a case is dropped, identify the retired outcome and the retained evidence
for its other applicable observations.
Apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
On macOS, start awake on AC under `caffeinate -s -i`. On battery, plug in or
start awake with the lid open under `caffeinate -i` and check the sleep log.
