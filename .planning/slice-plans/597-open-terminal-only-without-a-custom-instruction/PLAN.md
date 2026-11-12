# Open the terminal only when no custom instruction is supplied

**Identity:** SEED-320#open-terminal-only-without-a-custom-instruction
**Source:** [Story](../../seeds/SEED-320-conditional-terminal-opening.md#open-terminal-only-without-a-custom-instruction)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

A developer who starts an ad hoc session or a follow-up with a typed
instruction keeps the view they are working in while the session processes
it; with no typed text the session's terminal opens once it starts, as today.
The typed field alone decides, on every host, for the project row's **Start
session** and Recently done's **Follow up**.

Excluded: story launches and Startup recovery's Continue, any dialog choice or
wording about opening the terminal, and any change to what the session
receives. Attached images and a follow-up's context are input but not an
instruction: with no typed text the terminal still opens.

## Architecture and current decisions

1. No Accepted decision is affected.
   [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)'s
   Side panel holds one item at a time; an instructed start leaves it alone.
2. One rule, stated once, serves both of its uses: whether the page presents
   the started session's terminal (`presentTerminal` in
   `dashboard/src/StartSession.tsx`) and whether a Cursor start asks the server
   for the terminal handoff (`attachTerminal` in `dashboard/src/launchStarts.ts`,
   today `choices.host === "cursor"`). While a handoff is held, the kept Cursor
   client's idle watch does not begin until a terminal joins or the dashboard
   releases it (`dashboard/server/launchInstruction.ts`,
   `dashboard/server/liveTerminalClient.ts`), so the handoff is requested
   exactly when the terminal will be presented. The handoff keeps a caller: a
   Cursor follow-up or images-only start with no typed text still sends a
   prompt and opens the terminal.
3. The rule reads the request as sent: `requestedSettings`
   (`dashboard/src/agentLaunch.ts`) trims the field and omits `instruction`
   when it is blank, so an absent `instruction` is “no typed text”. Add no
   second trim rule.
4. The server, hosts and first input are unchanged. All three hosts already
   take the instruction without a page terminal, as story launches do.
5. Several files this work may edit sit just under the 250-line check
   (`dashboard/AGENT-LAUNCH-HOSTS.md` 248,
   `dashboard/tests/sessions/agent-launch-ad-hoc-sessions.spec.ts` 246,
   `dashboard/LAUNCH-START.md` 240,
   `dashboard/tests/sessions/session-column-membership.spec.ts` 240,
   `dashboard/tests/sessions/agent-session-cursor-stop.spec.ts` 239,
   `dashboard/tests/sessions/agent-session-cursor.spec.ts` 237). None is over
   it today. An edit that would take one past it moves a cohesive part out
   instead; the shared step of slice 1 keeps the spec edits from growing.

## Decisive premises and observations

Scratch observation, 2026-11-12, this workspace at `b68d51e5d` plus the
refined seed, external load average 22–33: `presentTerminal` called only when
`record.request.instruction === undefined`, and `attachTerminal` sent `false`;
`npm run typecheck:dashboard` passed;
`npx playwright test --config dashboard/playwright.config.ts --reporter=list --workers=3 <120 page specs>`,
the specs under `dashboard/tests` and `dashboard/frontend-tests` that name
Start session, Follow up or a support module that starts one. Result: 243
passed, 40 failed in 12.3 minutes. Both edits were reverted afterwards.

| Premise / consuming operation | Observation, result and remainder |
| --- | --- |
| The page rule is one condition at the existing presentation call, for Start session and Follow up alike (slice 2) | The scratch condition typechecked and changed the outcome. `dashboard/src/FollowUp.tsx` renders the same `StartSession`. |
| Existing proof observes the automatic opening for an instructed start (slice 2's negative control) | Under the scratch change `terminals/agent-launch-ad-hoc-terminal.spec.ts:25` (“starting with text opens the session in the terminal…”) and `terminals/agent-terminal-cursor-launch-page.spec.ts:18` failed. |
| Which journeys rely on the automatic opening (slices 1 and 2) | The 40 failures, all a missing terminal panel or what it would have shown, in: `launches/agent-launch-ad-hoc-codex`, `agent-launch-ad-hoc-resolved`, `agent-launch-start-session-answer-touch`, `agent-launch-start-session-isolated`, `agent-launch-start-session-touch`, `responsive-session-access`; `sessions/agent-launch-ad-hoc-sessions` (4), `agent-session-cursor-done` (3), `agent-session-cursor-stop` (5), `agentSessionCursorUnavailableCases` (3), `agent-session-cursor` (6), `compact-session-entry`, `cursor-session-recovery-stops`, `cursor-session-recovery` (5), `session-column-membership` (2); `terminals/agent-launch-ad-hoc-terminal`, `agent-terminal-cursor-launch-page` (2), `agent-terminal-cursor-page`. Remainder: the run was under external load, so a failure there may be load and not this change, and the 878 specs outside the selection were not run; hosted CI on the story branch is the complete verdict, and slice 2 reruns this selection. |
| An instructed Cursor start takes its instruction with no handoff requested (slice 2) | Proxy: story launches and HTTP launches reach the same `launchCursor` without the handoff header, and `LaunchInstruction` then releases its hold as soon as the instruction is entered. The only difference from an ad hoc start is the header this plan stops sending, so the outcome cannot differ. Slice 2's Cursor journey observes it directly. |
| Blank starts keep today's behavior (slice 2) | Every blank-field journey in the selection passed under the scratch change. |

## Ordered slices

### 1. Journeys that need a started session's terminal open it themselves
Type: Structure
Status: done
Proof: Each journey listed in the premises that uses the terminal of an
instructed ad hoc start as its setup, not as its promise, reaches that
terminal through one shared step in test support that opens it from the
session's entry when it is not shown. Those journeys pass unchanged in what
they assert, before the product change:
`npm run test:dashboard -- <the listed specs>` and
`npm run typecheck:dashboard`.

Structure: journeys about sessions, Cursor states, recovery, stopping and
column membership start an instructed session and then read a terminal that
only the automatic opening put there. This slice makes that dependence an
explicit step, so the next Behavior changes only the journeys whose promise
is the opening itself. Product behavior is unchanged. Journeys whose promise
is the automatic opening
(`terminals/agent-launch-ad-hoc-terminal.spec.ts:25`,
`terminals/agent-terminal-cursor-launch-page.spec.ts`,
`launches/responsive-session-access.spec.ts:159`,
`launches/agent-launch-ad-hoc-resolved.spec.ts`) stay as they are for slice 2.
Read each listed failure's assertion before changing it: where a journey
needs no instruction, starting it blank is the smaller change.

Outcome: the shared step is `startedSessionTerminal`
(`dashboard/tests/support/startedSessionTerminal.ts`);
`startAdHocAndClose` and `takenAdHocSession` moved to
`dashboard/tests/support/startedAdHocSession.ts`. The held touch journey of
`agent-launch-start-session-answer-touch.spec.ts` starts blank. Proof on the
unchanged product after the refactor pass: the 22 specs that reach the changed
support (61 tests, two workers, external load 27–33) gave 59 passed.
`sessions/agent-session-cursor-stop-several.spec.ts:23` and
`sessions/cursor-runner-replacement-controls.spec.ts:32` failed by the 30 s
test timeout, again at one worker, and again at one worker with
`cursorSessionReading.ts` at its base content, so the cause is not this
slice. Earlier runs at load 31–46 timed out the same way in
`launches/responsive-session-access.spec.ts:44` (untouched file, a story
launch; the `origin` and `dashboard` fixtures took 21–23 s before the body)
and intermittently in `launches/agent-launch-start-session-touch.spec.ts:32`,
which passed in the final run. These stay open under the failure policy until
hosted CI of the story branch gives their verdict.

CI repair: hosted CI of `43782e67d` failed only
`launches/agent-launch-start-session-touch.spec.ts:32`, in the shared step's
wait for the entry. A terminal covering a narrow page sets `aria-hidden` on
the page column (`dashboard/src/PageFrame.tsx`), so role locators find no
entry while it is shown; the step now takes a presented terminal or the listed
entry as the start. Every other dashboard shard passed there, which is the
hosted verdict for the load timeouts above.

Learning for slice 2: with the rule applied in scratch, the remaining
failures were the four promise journeys above plus
`launches/agent-launch-ad-hoc-codex.spec.ts`'s instructed variant, whose
`await expect(start).toBeFocused()` after Close holds only when the start
presented the terminal; opened from the entry, Close returns the keyboard to
the entry's **Open terminal**. Every Cursor journey passed under the rule
through the shared step, joining the kept client.

### 2. An instructed start keeps the current view; a blank one opens the terminal
Type: Behavior
Status: done
Proof: Browser journeys in `dashboard/tests/terminals/` and
`dashboard/tests/launches/`, each key example observed once:

- instructed Start session with a final report open in the Side panel: the
  report stays, a Taken entry appears, no terminal socket is requested, and
  the entry's **Open terminal** shows the session;
- instructed start with the Side panel closed: it stays closed and the
  keyboard is on the button that started it (Start session, and Follow up in
  the follow-up journey);
- blank Start session: the terminal opens with the keyboard in it, and Close
  returns the keyboard to Start session (the existing journey, restated for a
  blank field);
- whitespace-only Follow up: the terminal opens and the first input carries
  the recorded context;
- images attached with a blank field: the terminal opens;
- instructed Cursor start: Cursor takes the instruction with no terminal
  joined and no second `cursor-agent`; the entry's **Open terminal** joins
  that same client.

Negative control: with the rule removed (always present), the instructed
journeys fail; restore afterwards. The developer-opened-during-startup
journeys in `agent-launch-ad-hoc-terminal.spec.ts` stay green.
`npm run test:dashboard -- <the 120-spec selection of the premises>` and
`npm run typecheck:dashboard`.

Behavior: a developer types an instruction in Start session or Follow up and
presses Start → the session starts and nothing is presented: the Side panel
is as it was, the session is an entry in Taken and the Sessions sidebar with
**Open terminal**, and the keyboard returns to the launching button when it
still rests on the startup's progress. With no typed text → the terminal is
presented as today. A Cursor start requests the terminal handoff only in the
second case. Update the maintained descriptions in the same slice:
`StartSession.tsx`'s header comment, `dashboard/AGENT-LAUNCH-STARTUP.md` (a
settled launch's presentation), `dashboard/LAUNCH-START.md` and
`dashboard/LAUNCH-FOLLOW-UP.md` where they say a started session opens, the
Cursor launch paragraph of `dashboard/AGENT-LAUNCH-HOSTS.md`, and the comments
in `dashboard/src/agentLaunchClient.ts` and `dashboard/server/terminalHandoff.ts`
that say Start session opens the terminal.

Outcome: `startAdHoc` (`dashboard/src/launchStarts.ts`) states the rule once
and passes the page's presentation on only for a request sent with no
instruction; the `presentTerminal` call in `StartSession.tsx` is unchanged.
Learning: an instructed Follow up left the keyboard on the source entry,
because Recently done's held-entry rescue (`dashboard/src/recentlyDoneFocus.ts`,
a layout effect) took it before the launcher's return ran. The launcher
(`dashboard/src/launchDialogLauncher.ts`) now places the keyboard in a layout
effect, which also puts it in the terminal after a whitespace-only Follow up.
Proof, external load 44–51, two workers: the 121-spec selection gave 318
passed, 4 failed by the 30 s test timeout or a 5 s Git poll
(`launches/responsive-session-access.spec.ts:44`,
`sessions/cursor-runner-helper-survival.spec.ts:24`,
`sessions/cursor-runner-replacement-controls.spec.ts:32`, each passing alone
afterwards, and `sessions/agent-session-cursor-stop-several.spec.ts:23`, which
fails locally at this load on the base product too). Negative control with
the rule forced to present: all six instructed journeys failed and every blank
one passed. No journey substitutes a host without a Dashboard terminal; that
guard in `dashboard/src/pageSidePanel.ts` is unchanged. Hosted CI of the story
branch is the verdict for the four.

## Proof ownership

| Promise | Slice | Proof |
| --- | --- | --- |
| Typed text presents nothing; Side panel left as it is | 2 | instructed journeys, open and closed panel |
| Entry in Taken and Sessions sidebar offers Open terminal | 2 | instructed journey; existing sidebar journeys of slice 1 |
| Keyboard returns to the launching button | 2 | closed-panel journey, Start session and Follow up |
| Blank or whitespace-only presents the terminal as today | 2 | blank Start session and whitespace Follow up journeys |
| Developer-opened or closed terminal during startup stays | 2 | existing journeys stay green |
| Session input unchanged | 2 | existing first-input assertions in the follow-up and ad hoc journeys |
| Images or context without typed text open the terminal | 2 | images journey, whitespace Follow up journey |
| Cursor instructed start runs with no terminal joined | 2 | Cursor journey |

## Verification and delivery gates

Follow [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
as written in every delegation and repair handoff, and
[AGENTS.md — Test automation](../../../AGENTS.md#test-automation): MakeMe for
domain data, observable events instead of wall-clock waits, the default
timeout, never `test.slow()`. Run the named commands from the repository root
with `npm run typecheck:dashboard`, `git diff --check` and the selective
pre-commit gates. The 120-spec selection is the local check for slice 2
because the change's consumers are spread across those journeys; no project
rule requires the whole dashboard suite locally, and hosted CI runs it after
publication.

Before the selection run inspect current load and competing work and choose
bounded concurrency; the planning run took 12.3 minutes at three workers
under load 22–33. On macOS start fully awake: on AC use `caffeinate -s -i`;
on battery plug in, or keep the lid open under `caffeinate -i` and inspect
sleep logs under
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).

## Plan concern assessment

Slice-plan refinement was not needed: one Structure slice directly enabling
one Behavior, each with one proof loop. No remaining slice-specific concern
was found. This plan grants no execution.
