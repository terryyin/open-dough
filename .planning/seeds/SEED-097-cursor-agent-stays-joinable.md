---
id: SEED-097
status: active
planted: 2026-10-04
planted_during: Confirmed report that a dashboard Cursor launch does not type the story into the real composer, and the requested goal that the same agent stay joinable
trigger_when: A developer starts a story in Cursor from the dashboard and the agent does not receive that story, or closing the terminal ends the process that should stay available
scope: unknown
---

# SEED-097: A launched Cursor agent stays joinable

## Why This Matters

A developer starts a story in Cursor from the dashboard and then leaves the
terminal. The agent should already be running that story, and opening the
terminal later should join that same process. The developer should not have
to restart the runner or start another `cursor-agent` to continue.

The launch contract already says the runner types the instruction when the
screen shows `Add a follow-up` or `Plan, search, build anything`, and that
closing the terminal leaves the client running. The real `cursor-agent` screen
matches the prompt text and still never receives the instruction. After a
successful write, the same contract hangs the process up once the empty
composer has been showing for 0.203 seconds with no terminal open, so the next
open starts another process.

## Stories

<a id="cursor-agent-stays-joinable"></a>

### A launched Cursor agent receives its story and stays joinable

**Identity:** SEED-097#cursor-agent-stays-joinable
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why:** The developer who starts a story in Cursor from the dashboard
needs that agent to receive the story and remain the same process, so they
can close the terminal and open it again without restarting the session.

**Goal:** The runner types the launch instruction into the composer that
current `cursor-agent` actually paints, the launch record then says that
input was accepted, and that same process stays running so a later terminal
joins it. This includes the time the screen is the empty follow-up prompt
and no terminal is open.

**Expected:** A kept `cursor-agent` whose screen shows `→ Plan, search, build
anything` or `→ Add a follow-up` receives the launch instruction once. The
record changes from uncertain to accepted. Closing the dashboard or the
terminal does not hang that process up. Opening the terminal again joins it
and shows its current screen. The story card shows the runner's screen
label — at the follow-up prompt, working, or waiting for an answer — instead
of always saying Cursor has no passive status.

**Actual:** On 2026-10-03, dashboard launch
`48a770b3-33c1-4eba-9564-625f33685ca2` for
`SEED-052#mark-report-read-keeps-session-state` stayed uncertain. The runner
labeled the screen "at the follow-up prompt". The chat store contains no copy
of `/dough-execute-plan SEED-052#mark-report-read-keeps-session-state`. The
first recorded user message, at 21:10 +0800, was `jjkmk,m.m,.m.,`. The process
was still alive the next morning, about ten hours later, after its worktree
directory was gone, because the instruction was never entered and the idle
hangup therefore never armed.

**Evidence:**

- `cursor-agent` `2026.10.01-e373342`, resumed with `--workspace` and
  `--resume` in `/Users/terryyin/git/open-dough`, painted `→ Plan, search,
  build anything`. Fed through `KeptClientScreen`, `cursorReady`, and
  `cursorDetachedIdle` from commit `8a9c88c3`: the idle label and the
  composer text matched, `cursorVisible` stayed false, and
  `completedFrame` stayed false. The stream sent `ESC [?25l` after the
  prompt and no `ESC [?2026h` or `ESC [?2026l]`. `ESC [?25h` appeared only
  in the shutdown bytes.
- `LaunchInstruction` returns before `cursorReady` until a synchronized
  frame has finished, and `cursorReady` also requires a visible cursor.
  The test stand-in in `dashboard/tests/fixtures/fake-cursor` sends
  `ESC [?2026h`, `ESC [?25h`, the prompt, and `ESC [?2026l`, so the
  empty-composer test passes on a screen the real agent does not paint.
- The written idle rule in `dashboard/AGENT-LAUNCH-TERMINALS.md` hangs a
  detached client up after 0.203 seconds on that prompt, once the
  instruction has been entered. The next open starts a new client.
- The story card's "Activity unknown" text comes from
  `unknownObservation` in `dashboard/src/hostDescription.ts`. The runner's
  label is read only by Running Cursor sessions, and only while the
  process is still held.
- A temp directory stopped on "Workspace Trust Required", with the cursor
  hidden and no synchronized frame. The dashboard launch does not pass
  `--trust`. The story session above was not on that screen.

**Acceptance examples:**

- Resume current `cursor-agent` on an empty chat in a trusted workspace.
  The screen shows `→ Plan, search, build anything`, the terminal cursor
  is hidden, and the stream has no synchronized-update frame. The kept
  client receives the launch instruction, and the launch record says the
  first input was accepted. The chat's first user message is that
  instruction.
- Close the terminal while that process is on the empty follow-up prompt.
  The same process is still alive. Opening the terminal joins it and does
  not start a second `cursor-agent`.
- Close the terminal while the screen is working. The same process keeps
  working, and opening the terminal joins it.
- The story card for that session shows the runner's current screen label.

**Boundary:** The dashboard's Cursor launch, the machine-local Cursor
runner, and the story card's reading of that runner. An untrusted
workspace's trust prompt is in scope only so a launch stopped there is not
recorded as the story having been typed.

**Depends on:** none

**Safe stopping point:** A launched Cursor agent receives its story in the
real composer and the same process can be joined again after the terminal
closes, including from the empty composer.
