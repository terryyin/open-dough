# A launched Cursor agent receives its story and stays joinable

**Identity:** SEED-097#cursor-agent-stays-joinable
**Source:** [refined story](../../seeds/SEED-097-cursor-agent-stays-joinable.md#cursor-agent-stays-joinable).
**Prepared:** 2026-10-04. Planning only; this request authorizes no implementation or publication.

## Goal and scope

A developer who starts a story in Cursor from the dashboard gets that story
into the agent, then closes the terminal and opens it again on the same
process. The story card shows whether that held process is at the follow-up
prompt, working, or waiting for an answer.

Include the seed's real empty-composer write, the same process remaining after
the terminal or dashboard closes, including on the empty follow-up prompt, and
the story card reading the runner's held-screen label. A trust prompt does not
receive the story and is not recorded as accepted. Update the Cursor sentences
in `dashboard/AGENT-LAUNCH-HOSTS.md`, `dashboard/AGENT-LAUNCH-TERMINALS.md`,
and `dashboard/AGENT-LAUNCH-HISTORY.md` in the slice that changes each sentence.

Deferred: passing `--trust`, keeping an agent alive across a runner restart,
and using `cursor-agent persist`. Stopping the runner still hangs up the
processes it holds. These require no machinery in this delivery.

## Preparation context

- Workspace: `/Users/terryyin/git/open-dough/.worktrees/cursor-agent-stays-joinable`.
- Branch: `cursor/cursor-agent-stays-joinable`.
- Established Preparing assignment: joseph-chan, published revision
  `13e1af88ea50b1f9464f1add8c37e60bbb33833a`. Reuse this assignment and
  workspace; no second announcement is needed.
- Authorized target for a later explicit keep: `origin/main`; integration
  checkout: `/Users/terryyin/git/open-dough`.
- The seed and plan are an uncommitted preparation draft. Preparing remains
  published until the preparation disposition ends it. This draft is not yet
  visible in the origin-derived dashboard.

## Existing solutions and direction

PFE outcome: change the runner's existing screen rule and the card's existing
session reading. Do not add a second agent, a second status channel, or
`cursor-agent persist`.

- `cursorReady` admits a screen only when the terminal cursor is visible and
  the composer text is present. `LaunchInstruction.evaluate` returns before
  that check until a synchronized-update frame (`?2026`) has finished.
  `cursorDetachedIdle` already recognizes `→ Add a follow-up` and
  `→ Plan, search, build anything` without those two gates, and that is the
  label Running Cursor sessions shows.
- After the instruction is entered, `LaunchInstruction` releases the idle
  hold. `DetachedIdleWatch` then hangs the client up when that follow-up
  prompt has held for `cursorIdleSettleMs` (0.203 seconds) with no socket.
  A working, waiting, or unrecognized screen already stays.
- `heldCursorSessions` already reads the runner without starting it and joins
  each held client to its launch record. `cursorHost` supplies no `sessions`
  operation, so `withStates` leaves every Cursor record `unknown`, and the
  card shows the fixed "Activity unknown" wording.
- The fake cursor paints every screen, including `composer`, inside
  `ESC [?2026h` and `ESC [?25h]`. That is why the empty-composer launch test
  passes on a screen the installed agent does not paint.

One screen rule covers the story: the follow-up prompt is ready for the one
launch instruction and is a reason to keep the process, whether or not the
terminal cursor is visible and whether or not a synchronized frame arrived.
The card shows the label that rule already names. A screen that is not that
prompt, and is not working, stays held and does not receive the instruction.

Accepted [ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
keeps the session distinct from story progress. Accepted
[ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports changing the existing representation in small increments. The index
and in-file statuses agree: 0000–0006 Accepted, 0007–0009 Proposed; no
supersession or relevant conflict. Proposed dashboard ADR 0008 is not a
constraint. This host-behavior change needs no new ADR or North Star topic.

## Key examples and proof ownership

Paths are under `dashboard/tests/` unless noted. The existing Cursor launch,
idle, session, and runner-list specs are the proof homes. They run in both
`dev` and `preview`.

| Source promise | Owner | Observable proof |
| --- | --- | --- |
| The empty composer current `cursor-agent` paints receives the launch instruction once, and the record says the first input was accepted | 1 | Extend `agent-terminal-cursor-launch.spec.ts`: the `composer` stand-in paints `→ Plan, search, build anything` with the cursor hidden and with no `?2026` frame. The kept client's entered input equals the recorded instruction, and `firstInput.state` is `confirmed`. One attach, still the same process |
| A trust prompt does not receive the story and is not recorded as accepted | 1 | Same launch spec, trust screen that never becomes the composer: `firstInput.state` stays `uncertain` and the entered input does not contain the instruction. The existing become-ready trust journey still accepts only after the screen becomes the composer |
| Closing the terminal on the empty follow-up prompt leaves that process, and the next open joins it | 2 | Replace the idle-hangup assertion in `agent-terminal-cursor-idle.spec.ts`: after the follow-up prompt is showing, closing the socket does not send SIGHUP, the same pid stays up, and the next open attaches once more to that pid and can type |
| A working, waiting, or unrecognized detached screen still stays | 2 | The existing waiting and unrecognized cases in that idle spec stay green. Add the working screen to the same stay observation |
| The story card shows the runner's held-screen label, and a missing runner does not start an agent | 3 | Extend `agent-session-cursor.spec.ts`: while the runner holds the client, the session entry shows "at the follow-up prompt", "working", or "waiting for an answer" for that screen, not "Activity unknown". When the runner is stopped or cannot be reached, the entry says so, shows no screen label, and no `cursor-agent` is started. `cursor-runner-sessions.spec.ts` still lists the same held client and still starts nothing when the runner is down |

## Decisive premises observed during planning

No Playwright run was required. The current launch test passes by painting a
screen the installed agent does not paint, so a green run would not explain
the missed instruction.

| Premise and consuming operation | Observation reaching it | Result |
| --- | --- | --- |
| Slice 1 cannot wait for a visible cursor or a `?2026` frame, because the installed composer supplies neither | Read `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/cursor-composer-probe.raw`, 364 bytes, from `cursor-agent` `2026.10.01-e373342` resumed in `/Users/terryyin/git/open-dough`. Counted `ESC [?25h` (2, both in the shutdown tail), `ESC [?25l` (1, after the prompt), `ESC [?2026h` (0), `ESC [?2026l` (0), and `Plan, search, build anything` (1). Read `LaunchInstruction.evaluate` and `cursorReady` | The prompt is on the screen while the cursor is hidden and no synchronized frame exists. `evaluate` returns at `completedFrame()` before `cursorReady`. `cursorReady` also requires `cursorVisible`. The idle label does not use either gate |
| The launch proof stand-in currently paints the other screen | Read `dashboard/tests/fixtures/fake-cursor` `paint` | Every mode, including `composer`, is written as `ESC [?2026h` + `ESC [?25h` + body + `ESC [?2026l` |
| Slice 1's trust screen is already a not-ready screen, and it becomes ready only when it changes to the composer | Read `agent-terminal-cursor-launch.spec.ts` trust `becomeReady` test and the fixture's `trust` body | The trust body is `Do you trust this workspace?` and contains neither composer prompt. The test accepts the instruction only after the screen becomes the ordinary prompt |
| Slice 2 reverses a specified hangup, not an accidental one | Read `agent-terminal-cursor-idle.spec.ts` idle test, `cursorDetachedIdle`, and `liveTerminalClient` hold release | The test expects SIGHUP no sooner than `cursorIdleSettleMs` after close, then a second attach with a different pid. The follow-up prompt is the idle match. Waiting and unrecognized screens are asserted to stay. The hold releases once the instruction is entered, so slice 1 arms this hangup |
| Slice 3 has a runner read and no card read | Read `heldSessions.ts`, `cursorHost.ts`, `launchStates.ts`, and `agent-session-cursor.spec.ts` | `heldCursorSessions` joins runner labels to records and does not start the runner. `cursorHost` has no `sessions`. `withStates` therefore leaves Cursor `unknown`. The session spec expects "Activity unknown: Cursor has no passive status for this session" and asserts `cursorHost.sessions` is undefined |

These observations establish why the instruction is missed and which tests own
the change. They do not establish the future ready rule, the kept idle
process, or the card label. No paid or owner-held premise needs an early
probe slice.

## Ordered slices

### 1. The real empty composer receives the story
Type: Behavior
Status: planned
Proof: Slice-1 table rows in `agent-terminal-cursor-launch.spec.ts`, both `dev` and `preview`.

Behavior: a trusted empty chat shows `→ Plan, search, build anything` or
`→ Add a follow-up`, the terminal cursor is hidden, and the stream has no
synchronized-update frame → the dashboard keeps that client for an instructed
launch → that client receives the instruction once, the launch record says
the first input was accepted, and one process is still held. A trust prompt
that never becomes the composer does not receive the instruction and stays
uncertain.

Change the existing ready decision so the composer text is enough. Do not add
a second prompt recognizer. Keep one instruction write. Update the ready
sentences in `AGENT-LAUNCH-HOSTS.md` and `AGENT-LAUNCH-TERMINALS.md`.

Interim: once that write succeeds, the current idle hangup still ends a
detached follow-up client. Slice 2 removes that ending.

### 2. The same process stays on the empty composer
Type: Behavior
Status: planned
Proof: Slice-2 table rows in `agent-terminal-cursor-idle.spec.ts`, both `dev` and `preview`.

Behavior: the launch instruction has been entered and the screen is the
follow-up prompt → the developer closes the terminal → that process stays,
and opening the terminal joins it instead of starting another. A working,
waiting, or unrecognized screen still stays.

Stop treating the follow-up prompt as a hangup. Leave the runner's own stop,
which still hangs up every client it holds. Update the idle-hangup sentences
in `AGENT-LAUNCH-HOSTS.md` and `AGENT-LAUNCH-TERMINALS.md`.

### 3. The story card shows the held screen
Type: Behavior
Status: planned
Proof: Slice-3 table rows in `agent-session-cursor.spec.ts` and `cursor-runner-sessions.spec.ts`.

Behavior: the runner holds the Cursor client → the story card shows that
client's screen label, "at the follow-up prompt", "working", or "waiting for
an answer". The runner is not running, or cannot be reached → the card says
so, shows no screen label, and starts no agent. A recorded Cursor session the
runner does not hold does not gain a screen label.

Use the runner read `heldCursorSessions` already performs, through the host
session observation the card already displays. Do not start the runner from
that read, and do not give Cursor stop or rename. Update the Cursor
observation sentence in `AGENT-LAUNCH-HISTORY.md`.

## Current decisions

- The composer text is the ready signal. Cursor visibility and a
  synchronized-update frame are not.
- The follow-up prompt keeps the process after the instruction has been
  entered. It is not an idle hangup.
- The card uses the runner's three labels while that runner holds the
  session. It does not translate them into another host's activity words.
- `--trust`, runner-restart survival, and `cursor-agent persist` stay out.

## Learnings

None yet. The captured composer bytes and the current gates are planning
observations, not execution learnings.
