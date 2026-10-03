# One active refinement or execution session per story

**Identity:** SEED-052#one-active-story-session
**Source:** [refined story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#one-active-story-session).
**Prepared:** 2026-10-03. Planning only, in the established preparation workspace.

## Goal and boundaries

From startup until the developer closes it, a story has at most one
dashboard-launched refinement or execution session on this machine. While one is
starting or open, both Start actions for that story cannot be invoked: neither
on the card nor through the local launch boundary, whichever page, dialog or
dashboard server asks. Mark as done or Delete record closes the session. Gray
means "cannot start". "Being prepared" and "Not marked Ready for execution"
stay clickable, in a look that differs from disabled.

Excluded, as the story defers: sessions on other machines or started outside
the dashboard, closing a session automatically from native state, refusing to
reopen a done session, and Mark as done for Cursor. A published Preparing
announcement from elsewhere does not block. Ad hoc sessions and other stories
are unaffected.

## Direction and PFE

- Follow [North Star](../../NORTH-STAR.md) "Agent launch as a requested
  assignment": later stories build on the machine's launch records rather than
  inventing a session registry. An open session is a launch record of the
  project and story that has no `doneAt`. That is the existing card rule
  (`isOpen` and `cardSessionsOf` in `dashboard/src/agentLaunch.ts`). Server and
  page share it, as they already share `unresolvedAttempt`.
- Extend the existing launch-attempt conflict rule
  (`dashboard/server/launchAttemptConflicts.ts` `conflicting`, called from
  `launchAttemptOwner.ts` `accept`/`continueAttempt`). Do not add a second
  admission path. Startup exclusion stays the unresolved-attempt rule.
- Reuse `machineJsonStore.ts`'s directory lock for cross-process atomicity.
  Add no new lock or locking tooling.
- Reuse the existing refusal display. The dialog closes, and a refused answer
  stays beside the card's Start (`LaunchDialog.tsx` `onStart`,
  `StartLaunch.tsx` `LaunchProblemAnswer`). Reuse the existing unavailable
  action with its describing reason (`StartLaunch` `unavailable` /
  `unavailableReason`).
- Accepted ADRs [0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
  (one meaning per term: "open session" keeps the card's meaning) and
  [0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  (small increments). No ADR conflict.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| An open session is a story launch record without `doneAt`; ad hoc records have no identity | Slices 2, 4 | Read `dashboard/src/agentLaunch.ts:45-60` and `launchWorkflow.ts:145-150` (`launchSubject` identity is `storyOf(request)`) | Confirmed. `cardSessionsOf` filters by project, identity and `isOpen`. |
| Mark as done sets `doneAt`; Delete record removes the record | Slices 2, 4 | `server/launchRecordStore.ts` exports `setRecordDoneAt` and `deleteRecord`; [terminal docs](../../../dashboard/AGENT-LAUNCH-TERMINALS.md) | Confirmed. Both existing operations close the session under the rule above. |
| The boundary refuses a story start only for an unresolved attempt, not for an open session | Slice 2 | Read `server/launchAttemptConflicts.ts` `conflicting` and `launchAttemptOwner.ts:70-93` | Confirmed. Only attempts are consulted, and launch records are not. |
| Acceptance is atomic within one server only | Slice 3 | `launchAttemptOwner.ts:73-79` reads `keptAttempts()` outside any lock, then registers in memory ("exactly one is accepted" per server). `launchAttemptStore.ts` `replaceAttempts` chains writes per server, and the file lock covers only the later write. | Confirmed by reading. Two servers can each read before the other writes, so both accept. Slice 3 runs its new proof red before the change. |
| Two dashboard servers can share one machine directory in a test | Slice 3 | `dashboard/tests/agent-launch-records.spec.ts:76` (`serverOn("dev")`, `serverOn("preview")`). Ran `NODE_ENV= npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-acceptance.spec.ts dashboard/tests/agent-launch-records.spec.ts` | 7 passed (6.8 s). |
| Page attempts and session records arrive in one machine read, and Starts are unoffered until it answers | Slice 4 | `src/agentLaunches.ts:120-128, 223` and `src/CardLaunches.tsx:77-82` | Confirmed. The open-session check can use `launches.launched` under the same `attemptEvidence === "read"` gate. |
| A refused start closes the dialog and shows its answer beside Start | Slice 4 | `src/LaunchDialog.tsx:122-130`, `src/StartLaunch.tsx:127-161` | Confirmed. The seed's earlier "shown in the dialog" was aligned to this existing display. |
| Noted and disabled Starts look nearly alike | Slice 5 | `src/agent-launch.css:33-45`: noted uses `--quiet` color and `--edge` dashed border, disabled uses `--quiet` and `--line` | Confirmed. |
| Existing specs launch a second session for a story with one still open | Slices 1, 2, 4 | Probe: a temporary open-session refusal in `launchAttemptOwner.accept` (reverted, never committed), then `NODE_ENV= npx playwright test --config dashboard/playwright.config.ts --reporter=line` | 742 passed, 32 failed, 91 did not run (serial blocks after a failure). Failures span about 25 spec files: agent-launch boundary, model, options, options-groups, card, card-sessions, card-session-states, card-delete, delete, recent-sessions, recent-session-states, recent-delete, records, session-listing, start-duplicate, codex, attention, done-refusal, agent-terminal boundary, done, done-codex-boundary, reopen, responsive-session-access, session-alerts, and production-watcher-failures (that last one may be unrelated). Too much rework for one Behavior slice, so slice 1 is a Structure slice. |

Local test runs here need `NODE_ENV` unset and `npm ci --include=dev`, because
this session's environment sets `NODE_ENV=production`.

## Ordered slices

### 1. Existing launch specs no longer depend on a second open session of one story
Type: Structure
Status: done
Proof: with no product change, rearranged launch specs and helpers stay green under `NODE_ENV= npx playwright test --config dashboard/playwright.config.ts` (full suite: rearranged set green; `production-watcher-failures` and `quiet-reporter` fail without this change and stay out of scope). With a temporary open-session refusal in `launchAttemptOwner.accept` (never committed; reverted), none of the rearranged specs failed for an open-session reason. Accepted setup: `dashboard/tests/openStorySessionSetup.ts` (`closeOpenSessions`, `distinctStoryRequest`).

Internal change: rearrange each existing spec the probe found, plus any of the
91 tests that did not run and fail the same way under the probe. Each one
either marks the earlier session done (through the existing done operation, or
a seeded record with `doneAt`) before launching again, or launches on a second
story or project. Each keeps what it proves: ordering of two entries, keyboard
handoff to the newest entry, attention counts, deletion, records retention,
the two-launches-at-once claim, and so on. Where a spec's purpose is the
replaced tolerance itself (`agent-launch-card-sessions.spec.ts` "another
refinement launched there is a second entry at once",
`agent-launch-card.spec.ts` "a later launch takes the keyboard to its newest
entry"), keep the part still promised and leave the rest to slices 2 and 4's
new assertions rather than preserving it. First check
`production-watcher-failures.spec.ts` without the probe: if it also fails
there, it is outside this plan and is reported, not rearranged.

Enables: slice 2, whose refusal would otherwise break these specs.

### 2. The launch boundary refuses a story start while that story has an open session
Type: Behavior
Status: done
Proof: new cases in `dashboard/tests/agent-launch-open-session.spec.ts` and `dashboard/tests/agent-launch-open-session-continue.spec.ts` (split from acceptance) over real HTTP; `NODE_ENV= npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-acceptance.spec.ts dashboard/tests/agent-launch-open-session.spec.ts dashboard/tests/agent-launch-open-session-continue.spec.ts` green. Whole suite green for launch coverage; `production-watcher-failures` and `quiet-reporter` remain out-of-scope pre-existing failures.

Behavior: This machine keeps an open refinement or execution launch record
(Claude, Codex or Cursor) for story S. A `POST /__agent-launch/accept` for S in
either workflow, Standard or One-shot, is answered `failed` with a new reason
`session-open`. Its explanation says the story already has an open session on
this machine that must be marked done or have its record deleted first. Nothing
is started or launched: no start script runs, no native call is made, and no
attempt is kept. A continuation (`/__agent-launch/continue`) for S is refused
the same way unless the open record is that attempt's own launched session.
After `setRecordDoneAt` or `deleteRecord`, the same request is accepted.
Requests for another story, ad hoc launches, and another project's same
identity are accepted. An unreadable launch-record file refuses story starts
with an explanation, as an unreadable attempt file already does.

Shape: add an open-session check beside `unresolvedAttempt` in `conflicting`,
reusing the shared `isOpen` and story-matching rule. Put the reason and wording
in `src/launchOutcome.ts`. Also update
`dashboard/AGENT-LAUNCH.md#startup-handoff-and-reconciliation` and the header
comments that say Starts stay "whatever sessions are listed".

Local check: the touched specs, then the whole dashboard suite. That broader
run is justified because `accept` is the shared admission every launch spec
uses, and the probe showed its reach.

### 3. Two dashboard servers on this machine accepting one story at once start one
Type: Behavior
Status: planned
Proof: a new case in `dashboard/tests/agent-launch-records.spec.ts` (or a sibling spec), run red before the change and green after. To make the race deterministic, the test holds `launch-attempts.json.lock`, the directory lock another server's read-modify-write holds. It sends server B's accept for S, then writes server A's unsettled attempt for S into the file and releases the lock. Before the change, B reads outside the lock and accepts. After the change, B waits for the lock, reads A's attempt, and is refused. The lock wait is bounded at 10 s (`machineJsonStore.ts` `acquireWriteLock`), well beyond the test's hold. A second case sends real simultaneous accepts from servers A and B (`serverOn("dev")`, `serverOn("preview")`) and asserts exactly one acceptance.

Behavior: Two dashboard servers share this machine's evidence. Each receives
an accept for story S, in the same or different workflows, while the other's
acceptance is in flight. Exactly one is accepted. The other is answered
`already-starting`, and `launch-attempts.json` keeps one attempt for S.
Accepts for different stories from the two servers are both accepted.

Shape: perform the conflict check, against freshly read attempts and launch
records, inside the attempt store's locked read-modify-write that keeps the new
attempt. That `change` callback is synchronous today
(`machineJsonStore.ts` `replaceMachineJson`), so let it return a promise for
the record read, keeping existing callers unchanged. Without that, a record
read just before the lock leaves a narrow window. A refusal leaves the attempt
document unchanged. Keep the existing per-server synchronous registration, so in-server
behavior is unchanged.

### 4. A story's card offers no Start while its session is open
Type: Behavior
Status: planned
Proof: `dashboard/tests/agent-launch-card-sessions.spec.ts` (revised) and a new card case using the committed-origin journey (`launchJourney.ts`, `storyStagesPage.ts`) with the synthetic `claude`.

Behavior: A Backlog card lists an open session for its story, whichever
workflow launched it. Start execution and Start refinement are disabled and
described by "This story has an open session. Mark it done or delete its record
to start another." The kept-start Start execution on a Taken card is disabled
the same way. After Mark as done, or Delete record (the Cursor case), both
Starts return under their existing notes and dependency rules, without a
reload. A card for another story with no open session keeps its Starts. A Start
dialog opened before another page launched on the same story answers Start
with the slice 2 refusal beside the action, and nothing launches. Keyboard
focus and the accessible description follow the existing unavailable-action
pattern.

Shape: in `CardLaunches.tsx`, derive "has open session" from the existing
`sessions` list and pass it into `unavailable`/`unavailableReason` for every
Start on the card. Update `dashboard/AGENT-LAUNCH.md`'s card paragraph.

### 5. A clickable noted Start does not look disabled
Type: Behavior
Status: planned
Proof: a Playwright case in `dashboard/tests/agent-launch-card.spec.ts` comparing computed styles in light and dark schemes.

Behavior: A Backlog card shows Start refinement noted "Being prepared" and
Start execution noted "Not marked Ready for execution", with no open session.
Both buttons are enabled, and their computed text and border colors differ
from a disabled Start's on the same page. Their notes keep the current wording.

Shape: restyle `.start-launch-noted` in `src/agent-launch.css`, using existing
tokens and following [dashboard UX/UI direction](../../../docs/dashboard-ux-ui-north-star.md).
Update the CSS header comment.

## Proof ownership

| Promise (story scope / example) | Slice |
| --- | --- |
| Open session blocks both workflows' Starts, any tracking (scope 1; example 1) | 2 (boundary), 4 (card) |
| Startup blocks both workflows (example 1) | Existing `agent-launch-acceptance.spec.ts:93` "one start across workflows", kept green in 2 |
| Only Mark as done or Delete record closes (scope 2; examples 2, 4) | 2, 4 |
| Idle, detached, or unavailable sessions still block (scope 2) | 2. A record's native state is not consulted, so a seeded open record with any observation is refused. |
| Already-open dialog, other pages, and overlapping processes refused, nothing starts (scope 3; example 3) | 2, 3, 4 |
| Disabled Start says why (scope 4) | 4 |
| Clickable noted Starts not gray, wording unchanged (scope 5; example 6) | 5 |
| Other stories, ad hoc, and other projects in parallel (scope 6; example 5) | 2, 3, 4 |
| Taken kept-start Start blocked by an open session (scope 1) | 4 |

## Current decisions

- An open session is a launch record without `doneAt`, the same as the card's
  rule. Native state never closes it.
- A refusal shows beside the action after the dialog closes, matching existing
  refusals.

## Learnings

- `production-watcher-failures.spec.ts` fails without an open-session probe
  (SIGHUP vs exit code 1) and stays outside this plan.
- `quiet-reporter.spec.ts` can fail when `FORCE_COLOR`/`NO_COLOR` warnings
  pollute a nested quiet Playwright run; unrelated to open-session rearrange.
- Dual-open same-story fixtures were widespread; `closeOpenSessions` and
  `distinctStoryRequest` cover relaunch and sibling-story cases. Concurrent
  “two at once” under a future open-session refusal may answer `failed` or
  `uncertain` for the second start while still keeping one claim/workspace.
- Continue must treat an open record of the continued attempt's exact launch
  (`sameLaunch`) as own, not only `outcome.kind === "launched"`, or recovery
  continues break when a conversation record already exists under an uncertain
  outcome.
