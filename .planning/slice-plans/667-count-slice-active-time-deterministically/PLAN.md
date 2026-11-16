# Count a slice's active time without the agent's own clock

**Identity:** SEED-367#count-slice-active-time-deterministically
**Source:** [Selected story](../../seeds/SEED-367-bounded-slice-active-time.md#count-slice-active-time-deterministically)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

A developer gets the 15-active-minute slice limit applied the same way on
Claude Code, Codex and Cursor. One slice clock decides a slice's active time,
so briefs carry the same remaining time and an overrun is reported. The source
owns the scope and examples. Deliver one installed execute-plan script, Claude
Code and Cursor hook entries, and execute-plan guidance that uses them. The
limit's value, diagnosis rounds, proof conditions, model-time or cost
measurement, and enforcement by killing an agent or command are excluded.

## Existing solution and architecture

PFE: no slice-time mechanism exists. Guidance in
`Distribution/src/skills/dough-execute-plan/references/oversized-slice.md#track-active-time`
asks each agent to count with the host clock; `delegation.md` asks the brief
to carry remaining time; `wait-for-proof.md` asks each agent to write its own
log and exit file. Reuse these:

- Script shape and CLI entry: the existing execute-plan scripts, for example
  `wait-for-publication.mjs` with `isDirectCliEntry` from
  `ci-direct-entry.mjs`, declared in `src/install/open-dough-execution-payload.sh`
  beside `wait-for-publication.mjs` (line 183).
- Hook output shapes: `ci-host-hook.mjs` already emits Claude
  `hookSpecificOutput.additionalContext` for `PostToolUse` and Cursor
  `additional_context` for `postToolUse`. Add a separate small hook entry to
  `assets/claude-hooks.json` and `assets/cursor-hooks.json`, not new behavior
  inside the CI hook: the CI hook binds mailboxes to coordinators, while the
  clock hook reads only the checkout's running slice. Registration goes through
  the existing fragment inventory
  (`Distribution/src/install/open-dough-register-hooks-fragments.mjs`); no new
  fragment file.
- Test time: the product-backlog scripts already read an injected time from
  `DOUGH_BACKLOG_COMPLETION_TIME`. Use one similar environment variable for
  the clock's current time so specs exercise minute arithmetic without waiting.

The record is local execution state, not a workflow authority or committed
fact: store it under `git rev-parse --git-path open-dough/slice-clock`, which
is per worktree, so a replacement implementer, a resumed handback and a later
coordinator session in the same checkout share it. The plan still records
elapsed time on an overrun, as `oversized-slice.md` requires. No ADR or North
Star topic is needed; this adds a script, not a product boundary.

Expected file sizes: `delegation.md` is 246 lines at preparation, so its edit
replaces the existing remaining-time and limit sentences rather than adding
lines. If it would pass 250, move the brief's active-time items into
`oversized-slice.md#track-active-time` and link them. `oversized-slice.md`
(81) and `wait-for-proof.md` (62) have room. New script modules stay cohesive
and under 250 lines each.

## Current decisions

- Slice identity is the story identity (or the quick execution's identity)
  plus a slice key the coordinator supplies, normally the plan's slice number.
  A refinement that renumbers or retitles an unfinished slice starts the new
  key as a continuation of the old one, so elapsed time moves with it. A split
  after an overrun starts new keys at zero; the story's record keeps the
  overrun count.
- One slice runs at a time per checkout. `run` and `status` default to the
  running slice, so an implementer's brief gives one literal command form and
  no identity bookkeeping.
- Active time is the wall time while the slice runs, minus the union of the
  intervals of commands run through the clock. The coordinator starts or
  resumes the slice at dispatch and pauses it at a return, acceptance or stop.
  The refactor pass and CI repair run while it is paused.
- `run` writes the command's output to the named log and its exit status to
  the named exit file when it ends, so waiting for proof keeps its per-host
  steps and waits on that file.
- An overrun is detected when a clock command or hook observes elapsed active
  time at or past 15 minutes. The first detection records it once in the
  story's record. Every later clock command reports it again. The hook reports
  it once per overrun to each agent that makes a tool call: the coordinator's
  own tool call must not use up the implementer's report. Slice 1 found the
  agent in the hook's input (Claude Code `agent_id`, Cursor `conversation_id`).
- The limit stays 15 minutes, read from one constant; the guidance link to
  `problem-decomposition.md#size-and-escalate-slices` stays the source of the
  rule.

## Proof ownership

Specs drive the actual script entry in a temporary Git repository with a
linked worktree and the injected time variable. Apply the installed MakeMe
selection before writing them. Hook specs feed recorded host input JSON to the
hook entry and assert its stdout.

| Source example | Slice and outside-in observation |
| --- | --- |
| 6 + 9-minute command + 4 → 10 elapsed, 5 remaining, no `date` | 2: `slice-clock.test.mjs` starts slice 3, advances time, runs a command through the clock that advances time across its run, and reads `status`: 10 elapsed, 5 remaining. A second, overlapping command is excluded once. |
| Handback at 11, 20-minute coordinator review, resume or replacement → 4 remaining | 2: same spec pauses, advances 20 minutes, starts again from a second process and from the linked worktree's other caller; both read 4 remaining. |
| Cursor suite exits nonzero; exit file holds status; time excluded | 2: same spec runs `sh -c 'exit 3'` with a log and exit file; the exit file holds `3`, the log holds the output, and elapsed time is unchanged. |
| Refactor pass and CI repair after acceptance leave elapsed unchanged | 2: same spec pauses at acceptance, advances time, reads the same elapsed. |
| Codex overrun reported at the next clock command | 3: `slice-clock-overrun.test.mjs` passes 15 minutes without a command, then `status` and `run` report the overrun with elapsed time; the story record counts one overrun, and a later command reports it again without counting a second. |
| Refined in place at 13 → 2 remaining; split after overrun → 15 each, one overrun kept | 3: same spec continues slice 3 as `3` retitled and as renumbered `4`, and starts split keys after an overrun. |
| Claude Code overrun reported after the next tool call | 4: `slice-clock-hook.test.mjs` feeds Claude `PostToolUse` and Cursor `postToolUse` input past the limit; the hook emits one additional-context message naming the slice and elapsed time, then emits `{}`. Emits `{}` with no running slice. Hook-fragment registration consumers (`Distribution/tests/helpers/host-hooks-fixture.bash` users) pass. Slice 1 settles host delivery. |
| Every brief and resume carries the clock's value; guidance stops asking for the host clock | 5: installed guidance links resolve, the payload declaration check passes, and the skill behavior review under author-open-dough-skills reads the changed references against the examples above. |

## Decisive premises and preparation observations

Observed 2026-11-16 in this owned checkout at
`08be9431a1acc8fa4d949a46b48d181c909bd8a8`, Node v24.21.0. No native session
was started.

| Premise / consuming operation | Result and limit |
| --- | --- |
| Claude Code runs `PostToolUse` command hooks for a subagent's tool calls; slice 4 | Retained subagent transcript `-Users-terryyin-git-open-dough--worktrees-avoid-redundant-board-reads/66e74827-0938-4613-9118-e74e25d30691/subagents/agent-a54e5461d643c209a.jsonl` (Claude Code 2.1.319, 2026-11-08T01:09:39Z) records `hook_success` for `PostToolUse` running `ci-host-hook.mjs claude` with `isSidechain: true`. Settled that the hook runs. |
| A subagent receives a `PostToolUse` hook's `additionalContext`; slice 4 | Settled by slice 1: delivered (Claude Code 2.1.325). |
| A Cursor subagent receives `postToolUse` `additional_context`; slice 4 | Settled by slice 1: delivered (Cursor agent 2026.11.13-eacade1). |
| `git rev-parse --git-path open-dough/slice-clock` is per worktree in a linked worktree; slices 2–3 | Ran in this linked worktree: `/Users/terryyin/git/open-dough/.git/worktrees/count-a-slice-s-active-time-without-the-agent-s/open-dough/slice-clock`. Settled. |
| The payload declaration lists execute-plan scripts individually; slice 2 | Read `src/install/open-dough-execution-payload.sh`: `selected-slice-status.mjs` (line 146) and `wait-for-publication.mjs` (line 183) are listed one per line. A new script needs its own line. |

Codex detection depends only on clock commands, so no Codex hook premise is
assumed.

## Ordered slices

Each slice targets 15 active minutes, including its focused proof and cleanup.

### 1. Probe whether hook context reaches Claude Code and Cursor implementers
Type: Behavior
Status: done
Proof: developer-authorized native observation, retained here with the fields
from [plan and reuse developer-operated observation](../../../Distribution/src/skills/dough-story-refinement/references/executable-proof.md#plan-and-reuse-developer-operated-observation).

Question: does a subagent see a `PostToolUse` hook's additional context on its
next turn? One round per host. This is a paid native run, so it needs the
developer's authorization before it starts; ask once, with these steps:

1. In a scratch Git repository outside this checkout, register a scratch
   `PostToolUse` hook (Claude: `.claude/settings.json`; Cursor:
   `.cursor/hooks.json` `postToolUse`) that prints the host's additional-context
   shape with a fixed marker word.
2. Ask the host, with the cheapest model, to dispatch one subagent that runs
   `true` once and then replies with any hook message it saw, verbatim.
3. Read the subagent's reply and transcript for the marker.

Result per host: delivered or not. A host where it is not delivered stops
slice 4 for that host. The story example "reported after the next tool call"
then needs a human scope decision; detection there falls back to clock
commands. Remove the scratch repository afterwards.

Result (2026-11-16, authorized by the developer for both hosts; scratch
repository removed): delivered on both hosts, so slice 4 covers both.

- Claude Code 2.1.325, `claude -p --model haiku`, session
  `579d20a0-f3bf-4d83-a26a-99997e9cf25e`: the subagent quoted the marker after
  its `Bash` call, and its `subagents/agent-a382d11ed22480119.jsonl` transcript
  holds a `hook_additional_context` attachment for `PostToolUse`. The hook's
  input for a subagent tool call carries `agent_id` and `agent_type`; the
  coordinator's own call carries neither.
- Cursor agent 2026.11.13-eacade1, `cursor-agent -p --model composer-2.5`,
  session `e6144a9c-7210-4bfd-9bdc-a31f2b596624`: the subagent's reply was the
  marker alone. The hook's input for the subagent's `Shell` call has its own
  `conversation_id`, a `transcript_path` under `subagents/`, an empty `cwd`
  and the checkout in `workspace_roots`.

### 2. Count a slice's active time across handbacks with commands excluded
Type: Behavior
Status: done
Proof: `Distribution/tests/skills/dough-execute-plan/slice-clock.test.mjs`
through `bash scripts/test.sh <path>`; payload declaration check
`bash scripts/test.sh Distribution/tests/installation/payload-declaration-links.sh`.

Behavior: a coordinator starts slice 3 → an implementer works and runs
commands through the clock → `status` reports elapsed and remaining active
time with command time excluded once; pause and resume, from another process
in the same worktree, keep it; `run` writes the log and the exit file. Add
`dough-execute-plan/scripts/slice-clock.mjs` and declare it in the payload.

### 3. Report and keep a slice overrun at the next clock command
Type: Behavior
Status: done
Proof: `Distribution/tests/skills/dough-execute-plan/slice-clock-overrun.test.mjs`,
`slice-clock-continues.test.mjs` beside it, and the slice 2 spec.

Behavior: elapsed active time reaches 15 minutes → the next `status` or `run`
reports the overrun with the slice and elapsed time, and the story record
counts it once; a continued key carries elapsed time, and split keys start at
zero while the overrun count stays.

### 4. Report an overrun after the next tool call on Claude Code and Cursor
Type: Behavior
Status: done
Proof: `Distribution/tests/skills/dough-execute-plan/slice-clock-hook.test.mjs`;
existing hook registration specs that load `claude-hooks.json` and
`cursor-hooks.json`, found by the consumer trace.

Behavior: a running slice past the limit → the host's next tool call returns
one additional-context message naming the slice and elapsed time, through a
new clock hook entry in each host's execute-plan fragment; no running slice or
an already reported overrun gives `{}`. Only for hosts slice 1 found delivered.

### 5. Brief, wait and track active time through the slice clock
Type: Behavior
Status: done
Proof: guidance link and payload checks run by `bash scripts/test.sh` on the
changed paths; the behavior review under
[author-open-dough-skills](../../../.agents/skills/author-open-dough-skills/SKILL.md).

Behavior: a coordinator following execute-plan dispatches, resumes, accepts
or stops a slice → it starts or pauses the clock and puts the clock's
remaining time and the literal `run` form in each brief; an implementer runs
proof through the clock, waits on its exit file, and returns at a reported
overrun. Replace the host-clock counting in `oversized-slice.md#track-active-time`,
the brief items in `delegation.md`, and the log and exit file step in
`wait-for-proof.md`.

## Execution complete

Product advice: no change to the queue. Two things to judge on the first real
executions that use the clock, before the sibling slice-limit stories build on
it:

- A session that ends in the middle of a slice leaves that slice's clock
  running. The next coordinator in the checkout has to pause it before it can
  start another slice, and the abandoned time counts toward that slice.
- A project gets the clock hook entry when its Open Dough installation is next
  updated; until then its overruns show only at clock commands.

## Concerns and cumulative design

Slice-plan refinement was not needed: slices 2–4 extend one record and one
rule (wall time while running minus the union of command intervals), each
with its own proof loop; slice 5 changes only guidance, after the behavior it
describes exists. Slice 1 is the permitted early probe for the one open host
premise and stops only slice 4; it asks the developer to authorize its paid
native run when execution reaches it. This review identified no other
slice-specific concern and no decision needed before Take.

## Local gates and execution discipline

Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written, and carry it by link into every brief and repair handoff. Before
test edits apply the installed [`dough-makeme`](../../../.agents/skills/dough-makeme/SKILL.md)
selection. Keep default timeouts and never use `test.slow()`. Run focused
specs with `bash scripts/test.sh <paths>`; the consumer trace owns any
additional affected checks, and full suites stay in hosted CI.
Local-gate sleep guard: [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos);
on AC wrap any long run in `caffeinate -s -i`.

## Learnings

- Slice 2's clock contract, for slices 3–5: `start --identity ID --slice KEY`,
  `pause`, `status [--identity ID --slice KEY]` and
  `run --log FILE --exit-file FILE -- COMMAND…`, each printing one JSON line
  with `state`, `elapsedMinutes`, `remainingMinutes` and `limitMinutes`.
  `start` refuses while a different slice runs, so a coordinator pauses first.
  `run` exits with the command's status and still runs it when no slice is
  running. Reported minutes round to 0.1; compare the limit in milliseconds
  through `elapsedMs`. Test time comes from `DOUGH_SLICE_CLOCK_TIME_FILE`, a
  file read at every observation.
- Slice 3 added `start … --continues OLD-KEY` (the entry moves to the new key
  with its elapsed time and overrun) and `start … --split-from OLD-KEY` (an
  overrun OLD-KEY entry is dropped and the new key starts at zero, also when
  it reuses the old number). Every report carries `overrun` and
  `storyOverruns`, plus `message` at the limit. `status` now writes the
  record, so every reader of a report goes through `updateRecord`.
- Slice 4's hook, `slice-clock-hook.mjs <claude|cursor>`, finds the checkout
  from the hook input (`cwd`, then Cursor's `workspace_roots`), so a session
  working in a linked worktree reads that worktree's clock. Its message ends
  "Stop and return the unfinished work with the elapsed time." A paused slice
  gives no hook message. This repository's own installed hooks gain the entry
  at its next Open Dough update.
- "Slice clock" also names an unrelated dashboard feature
  (`dashboard/src/SliceClock.tsx`); a `slice-clock` consumer trace matches it.


## Story obligations

### G1. A split slice that reuses the overrun slice's number resumes past the limit
Reported: slice 3 — "Reusing an overrun slice's key after a split is not supported. If slice 3 overruns and splits into new slices numbered 3 and 4, start --slice 3 resumes the old entry, still past the limit, instead of starting at zero."
Story clause: "A slice split after an overrun starts new slice clocks."
Disposition: proved by slice 3: Distribution/tests/skills/dough-execute-plan/slice-clock-overrun.test.mjs 'a slice split after an overrun onto its own number starts at 15 remaining, and the next split slice leaves the new slice's time alone' — start --split-from drops the overrun entry, so the reused number starts at zero and the story keeps one overrun; new keys 3a and 3b start at 15 in the neighbouring case
Commitment: 17
