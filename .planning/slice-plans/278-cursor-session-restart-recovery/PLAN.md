# Recover a Cursor session after the computer restarts

**Identity:** SEED-120#cursor-session-restart-recovery
**Source:** [refined story](../../seeds/SEED-120-cursor-session-restart-recovery.md#cursor-session-restart-recovery).
**Prepared:** 2026-10-08, planning only, in the established preparation
workspace `/Users/terryyin/git/open-dough/.worktrees/recover-a-cursor-session-after-the-computer-rest`
on `cursor/recover-a-cursor-session-after-the-computer-rest`, under the
preparation assignment for `juacompe-chan`. Publication target: `origin/main`;
integration checkout: `/Users/terryyin/git/open-dough`.

## Goal and boundaries

Once the dashboard is up, an unfinished Cursor session whose agent the runner
does not hold shows that the agent is not running, and the developer can
recover that same launch in the recorded worktree. Recovery resumes the
recorded chat. It sends one continuation only when that client is at the idle
composer and the first input is already confirmed. It starts one replacement
agent only when resume reports that the chat cannot be loaded.

Unfinished means not marked done, and the latest completion report is missing
or `unfinished`. The runner is running and does not hold the session, or the
runner is not running, or it cannot be reached. Recovery starts only when the
developer uses the offer.

Material exclusions, from the story:

- Claude and Codex recovery, a notification that a restart left sessions
  stopped, persisting the runner's held set, and surviving restart by moving
  the agent off the machine.
- Starting recovery by itself, including when the dashboard becomes ready.
- A second agent for a session the runner still holds.
- Recovery of a session marked done, or whose latest report outcome is
  `completed`, including when that report asks for attention.
- Writing an unconfirmed or blank first prompt into the resumed chat.
- Creating a worktree, switching branches, ending the published assignment,
  or publishing another assignment.
- `--trust`, `--force`, and `--yolo`.
- A second launch record, a session registry, or a new skill.

Open terminal stays the existing attach. It does not gain this continuation.

## Published baseline and integration context

Origin was fetched at `150d27a8745d9334a9819e40d50cf52a9fbe7b6a` (`origin/main`).
The highest plan directory allocated on that history is
`277-review-selected-commits`. `278-cursor-session-restart-recovery` was free
immediately before this write. This workspace is `53a2abae`, behind that
trunk, with the uncommitted seed draft. The Cursor session files this plan
uses match trunk except `dashboard/server/hosts/cursor/runnerPaths.ts`, which
on trunk calls `machineDashboardDirectory`. That helper returns the same
`~/.open-dough/dashboard` path this workspace still inlines. The observations
below were made in this workspace.

[Agent launch as a requested assignment](../../NORTH-STAR.md) already governs
this: a launch record is machine-local evidence, later work attaches to that
record rather than adding a registry, read-only monitoring must not resume a
conversation, and Cursor proves its own boundary. This plan follows that
topic. It does not add or revise a North Star topic. Accepted ADRs 0000,
0002, 0005, and 0006 apply as the story records. ADR 0001 adds no further
constraint. Proposed ADRs 0007, 0008, and 0009 inform the story and bind
nothing. No Accepted ADR conflicts.

## Existing solutions and selected approach

PFE for one responsibility: a developer-requested continuation of an
unfinished Cursor launch the current runner does not hold.

| Need | Finding |
| --- | --- |
| Not-held reading | **Change** `observeCursorSessions`. A running runner that does not hold an unfinished session today returns no observation, and `launchStates` then uses `{kind:"unknown"}`, which `sessionShown` reads as Activity unknown. Supply that case as a labeled unknown, "The agent is not running." Runner-down and unreachable already label every Cursor record with `cursorRunnerSentence`; keep those sentences. |
| Attention and delete | **Reuse** `sessionShown`, `alertReading`, `attentionCount`, and `recordDeletable`. Kind `unknown` needs no attention, raises no alert, and stays deletable. Do not switch the reading to `available` or `interrupted`. |
| Resume process | **Reuse** the stored continuation: `cursor-agent` with `continuation.args` in `continuation.workspace`. **Change** runner `keep` so the instruction may be omitted. When it is omitted, keep waits for the first classified screen or process exit, types nothing, does not confirm first input, and reports the held label or the exit text. When a client is already held, keep still drops the extra PTY and reports that fact. An instruction, when supplied, still types through `LaunchInstruction` and confirms first input only when it was not already confirmed. |
| Continuation words | **Reuse** one launch instruction, the way `cursorPrompt` already joins workflow, handoff, and `reportingInstruction`. Recovery builds that continuation from the record. It is not a skill and not `host.recover`. |
| Replacement prompt | **Reuse** `cursorPrompt` for the original prompt, then the same continuation facts. **Change** the same launch record's `session.sessionId` and `continuation.args` to the new id before that instruction is written. |
| Where the action is admitted | **Gap.** No developer-requested session recovery route exists. Add one POST, `/__agent-launch/recover`, beside done and delete, admitted in `postRequests` and `launchBoundaryPaths`. |
| Workspace present | **Reuse** `directoryState(session.continuation.workspace)`. `recordedWorkspace` returns nothing for Cursor. |
| Runner down versus unreachable | **Reuse** `cursorRunnerPort`, which starts the runner when none is accepting, and `acceptingCursorRunnerPort` / `readCursorRunnerSessions`, which do not. The card's observation stays the read that starts nothing. The action uses the start. |
| Completion identity | **Reuse** `reserveCompletion`. A report whose `session` differs from the record is 409, "The report does not name this launch's recorded session." The reporting command in `reportingContext` does not pass `--session`. Leave that command as it is. |
| Not this recovery | **Preserve** `launchRun`'s `host.recover` and `recoverCodex`. That path reconciles an unconfirmed launch ("no other conversation was started"). `cursorHost` has no `recover`. Do not add one. Startup recovery, Claude continue, and Codex continue stay unused. |

## Current decisions

- **One rule.** An unfinished Cursor session the runner does not hold offers
  Recover. The action resumes the recorded command. It types one continuation
  only when the resulting screen is the idle composer (`showsCursorComposer`:
  `Add a follow-up` or `Plan, search, build anything`) and `firstInput.state`
  is `confirmed`. It types nothing when the screen is working or waiting, or
  when first input is `awaiting`, `uncertain`, or `not-requested`. Missing
  workspace, trust, an unreachable runner, or any other exit leaves no agent
  running and starts no replacement. Slice 3 is the one exception: an exit
  whose text is the sentence slice 1 recorded starts one replacement.
- **Trust is text, not the waiting label.** Waiting also means a clarifying
  question, and that question stays a held session with nothing typed. Trust
  is the observed native phrase `Workspace Trust Required`, or the fake's
  trust screen `Do you trust this workspace?`. Explain, hang up any client
  this action started, and start no replacement.
- **Labels.** Running and not held, unfinished: "The agent is not running."
  Runner not running: "The Cursor runner is not running." Unreachable: "The
  Cursor runner cannot be reached." Finished sessions the runner does not
  hold stay omitted, so they keep Activity unknown. A completed report with
  `doneAt` still reads Done. Held screens keep their three labels. The new
  sentence is the session-state label. Recover is a button on the session
  entry, outside `.session-state`, on every surface that renders that entry.
  The Running Cursor sessions list does not gain it.
- **Same record.** Resume keeps the chat id. Replacement updates session id
  and continuation on that record before the new agent is instructed, using
  `create-chat` in `continuation.workspace`. No second record, no new
  worktree, no branch switch. The original prompt is `cursorPrompt`. A blank
  or `not-requested` launch has no saved prompt; replacement sends the
  continuation facts and does not submit an empty turn.
- **Continuation text.** Name the recorded workflow, the identity and branch
  when `start` or `preparation` has them, and the worktree
  (`continuation.workspace`). Tell the agent to continue from the worktree's
  committed and uncommitted state without opening another assignment. Include
  the record's existing reporting command when it has one. Do not paste the
  original first prompt on resume.
- **Kind stays unknown** for the not-held and runner-down readings, so
  attention and Delete record stay as they are today.
- **Interim.** Until slice 3, an exit that says the chat cannot be loaded is
  treated as any other unclassified exit: the card shows the text and no
  second agent starts. Slice 3 replaces that one case.

## Decisive premises and observations

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| A recorded session the runner does not hold shows Activity unknown and starts no agent | Slice 2 replaces that reading for unfinished sessions | `env -u NODE_ENV npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-session-cursor.spec.ts -g "the runner does not hold" --reporter=line`, after linking this workspace to the integration checkout's `node_modules` (`package.json` matches trunk; this workspace has none). The link was removed afterward. | 1 passed (3.7s). The spec asserts `.session-state` is `unknownWords`, projected `sessionState` is `{kind:"unknown"}`, and agent calls are unchanged. |
| That unknown reading needs no attention, raises no alert, and stays deletable; a label on kind `unknown` becomes the reading without changing those facts | Slice 2's label and offer | `node --experimental-strip-types` calling `sessionShown`, `alertReading`, `attentionCount`, `recordDeletable` | Omitted unknown: label Activity unknown, note "Cursor has no passive status for this session", `needsAttention` false, `alertReading` undefined, attention 0, deletable true. Label "The agent is not running.": that label, same attention and delete facts. Runner sentence "The Cursor runner is not running." stays that sentence even when `doneAt` is set and completion is absent. Completed plus `doneAt` plus unknown reads Done and is still deletable while kind is unknown. Completed with a message and no `doneAt` stays Activity unknown plus unread report "Completed with attention". Unfinished report plus unknown stays Activity unknown plus "Unfinished work". |
| Runner sentences | Slice 2 keeps them | `cursorRunnerSentence` | running: "The Cursor runner is running." not-running: "The Cursor runner is not running." unreachable: "The Cursor runner cannot be reached." |
| Observation does not start the runner; the action can | Card versus Recover | `sessions.ts` uses `heldCursorSessions`. `acceptingCursorRunnerPort` does not start a runner. `cursorRunnerPort` calls `ensureCursorRunner` and returns undefined when the runner cannot be reached. | Card keeps the non-starting read. Recover uses `cursorRunnerPort`. |
| A not-held unfinished card is the only consumer of the Activity unknown sentence that this change rewrites | Slice 2's spec edits | Search for `Activity unknown`, `unknownWords`, `no passive status`, and the runner sentences | The page assertion to change is `agent-session-cursor.spec.ts` "a recorded session the runner does not hold". `expectCursorUnknownWording` locks `hostDescription` and stays. `agent-launch-card-delete-problems.spec.ts` uses Claude's different sentence. `cursor-runner-sessions.spec.ts` asserts the running-list region (sentence, no list items, one button, no new agent), not the card. `agent-session-cursor.spec.ts` not-running and unreachable tests assert `.session-state` only. `agent-completion-cursor.spec.ts` asserts the unreachable sentence on a completed, already-read session, which is not relabeled and gains no Recover. `AGENT-LAUNCH-HISTORY.md` lines 105–106 state the not-held Activity unknown wording. |
| Held sessions do not assert the absence of Recover | Slice 2 must add that assertion | `expectCursorSessionActions` counts Open terminal and Delete record…, and the absence of Mark as done and rename. It is used for the held session in `agent-session-cursor.spec.ts`. | A Recover button would not fail that helper. The held entry needs an explicit absence check. |
| Empty instruction would still type a return and confirm first input | Slice 2 omits the instruction instead of sending `""` | `LaunchInstruction` types `instruction` plus `\r` when the screen is ready, then `onEntered`. `confirmInstruction` sets `firstInput` to confirmed unless it already is. `keep` with no `launchInput` resolves `firstScreen` immediately. | Omission must still wait for a screen or exit, and must not type or confirm. |
| Composer text is also a new empty chat | Slice 1; slice 2 does not treat the composer as loaded history | `idleScreen.ts` `composerPrompts` | `Add a follow-up` and `Plan, search, build anything`. |
| Resume after the process is gone is unpaid | Slice 1 probe; slices 2 and 3 stop where the probe says | Paid native probe detail is under slice 1. CLI help/stores already in the story. Untrusted `/tmp` still stops at workspace trust without `--trust`/`--force`/`--yolo`. | Slice 1 recorded. Resume path proceeds. Slice 3 waits for cannot-load text. |
| A mismatched completion session is refused | Slice 3, after the record's id changes | `reserveCompletion` and `previousCompletion`; `agent-completion-attention.spec.ts` posts `{session:"another-session"}` and expects 409 | 409, "The report does not name this launch's recorded session." The rule stays. The proof posts against the updated record. |
| Fake cursor has no exit-with-text mode | Slice 2 adds an unclassified exit; slice 3 adds the probed sentence | `dashboard/tests/fixtures/fake-cursor` | Modes include working, waiting, trust, and composer. Resume with no prompt is the terminal client. Trust prints `Do you trust this workspace?`. |

## Outside-in proof ownership

| Promise | Slice | Proof |
| --- | --- | --- |
| Example 1. Unfinished, runner running, not held: the card says the agent is not running, offers Recover, and starts no agent. No attention and Delete record remains. | 2 | New Playwright spec on fake cursor. Update the not-held assertion in `agent-session-cursor.spec.ts`. |
| Example 2. Recover reaches the idle composer with confirmed first input: same chat id and record, one continuation, no second agent, original prompt not pasted. | 2 | Same spec. The fake does not settle native resume; slice 1 does. |
| Example 3. Resume reports the chat cannot be loaded: one new agent, same record now names the new id, completion for that id is accepted, the old id is 409. | 3 | Same spec, after slice 1 records the sentence. Until then this case is the slice 2 unclassified exit. |
| Example 4. Held: no Recover. Open terminal joins the held client. | 2 | Held case in `agent-session-cursor.spec.ts`, plus an explicit no-Recover assertion. |
| Example 5. Marked done, or latest outcome `completed`: no Recover. Completed-with-attention keeps Activity unknown and its unread report. | 2 | New spec. `agent-completion-cursor.spec.ts` stays green on the completed unreachable sentence. |
| Example 6. Runner not running: the runner sentence and Recover. Nothing starts before the click. The click starts the runner and resumes. | 2 | New spec. `cursor-runner-sessions.spec.ts` stays on the running-list region. |
| Example 7. Unconfirmed first input: resume, nothing typed, unconfirmed notice stays. The saved instruction is sent only with the replacement chat. | 2 and 3 | Resume half in slice 2. Replacement half in slice 3. |
| Example 8. Missing workspace, trust, or unreachable runner: explain, no agent, no replacement. Unclassified exit: the same, and the developer can see the text. | 2 | New spec. Slice 3 does not reopen these. |
| Working or waiting, and blank `not-requested`: resume, type nothing. | 2 | Same spec. These are the same rule, not extra offers. |
| History and host docs match the reading and the action. | 2, and the replacement paragraph in 3 | `AGENT-LAUNCH-HISTORY.md`, `AGENT-LAUNCH-HOSTS.md`. |

A passing fake-cursor spec does not settle native resume (ADR 0005). Slice 1
is that evidence. Cursor evidence is not reused for Claude or Codex.

## Ordered slices

### 1. See whether a gone Cursor chat resumes, and what it says when it cannot
Type: Behavior
Status: done
Proof: Evidence only; no product change. Observed on `cursor-agent`
`2026.10.01-e373342` in a trusted disposable workspace under this checkout.
Resume used no `--print`, `--trust`, `--force`, or `--yolo` (setup ask
`--print` only wrote the prior turn). Gone process, store remains
(`6a11b145-35e0-4239-b139-678c706b2636`): interactive
`--workspace <probe> --resume <id>` showed `Loading conversation`, the prior
user prompt and `PROBE_MARKER_91a2`, then `Add a follow-up`; process stayed
running (probe ended it with SIGTERM). No chat store (fresh UUID; same id
after deleting `~/.cursor/chats/.../<id>`): empty
`Plan, search, build anything` composer, stayed running; no cannot-load exit
text or code. Dashboard sessions were not resumed. Paid under the execution
instruction's authority (ADR 0005).

Behavior: Prior conversation appears when the store remains. Missing store
opens an empty idle composer; no cannot-load exit sentence. Consequence:
slice 2 proceeds; slice 3 stops until cannot-load text is recorded. Ships
nothing.

### 2. An unfinished Cursor session the runner does not hold can be resumed
Type: Behavior
Status: done
Proof: `dashboard/tests/cursor-session-recovery.spec.ts` and
`cursor-session-recovery-stops.spec.ts` on the fake cursor;
`agent-session-cursor.spec.ts` updated for the unfinished not-held reading and
held no-Recover. Accepted command (23 passed, thrice):

```text
env -u NODE_ENV npx playwright test --config dashboard/playwright.config.ts dashboard/tests/cursor-session-recovery.spec.ts dashboard/tests/cursor-session-recovery-stops.spec.ts dashboard/tests/agent-session-cursor.spec.ts dashboard/tests/cursor-runner-sessions.spec.ts dashboard/tests/agent-completion-cursor.spec.ts dashboard/tests/cursor-runner-environment.spec.ts --reporter=line
```

`AGENT-LAUNCH-HISTORY.md` and `AGENT-LAUNCH-HOSTS.md` updated. Fake
unclassified exit is not cannot-load text. Runner stop clears the address
file and accepting reads require a live address pid (port reuse after stop
was reading as running-with-empty-held).

Behavior: An unfinished Cursor session the runner does not hold shows "The
agent is not running.", or the existing runner-down or unreachable sentence,
and offers Recover. No agent starts before the click. The click resumes the
recorded command in the runner. Composer and confirmed first input send one
continuation naming workflow, identity, worktree, and branch, and not the
original prompt. Working, waiting, unconfirmed, and blank not-requested type
nothing. A missing workspace, trust, an unreachable runner, or any other exit
explains and leaves no agent running. A held, done, or completed session
offers no Recover. Stopped reading does not need attention and does not raise
the session alert. Delete record remains.

Depends on slice 1 finding the prior conversation. An exit that matches the
cannot-load text, once that text exists, still starts no replacement until
slice 3.

### 3. A chat that cannot be loaded is replaced on the same launch
Type: Behavior
Status: planned
Proof: Extend the fake with an exit mode that prints the sentence slice 1
recorded, and extend `cursor-session-recovery.spec.ts`. The resume exits with
that sentence; one `create-chat` runs in the recorded workspace; the stored
record's session id and continuation change to that id before any instruction
is written; the instruction contains the original prompt and the continuation
facts; a completion POST naming the new id is accepted; the old id returns
409 with "The report does not name this launch's recorded session." An
unclassified exit, trust, a missing workspace, and an unreachable runner still
start no agent. Run the slice 2 command again. Add the replacement paragraph
to `AGENT-LAUNCH-HOSTS.md`.

Behavior: When resume's output is the probed cannot-load text, one new agent
starts in the same workspace on the same launch record. The record names the
new chat before that agent is instructed. A completion report naming the new
id is accepted, and one naming the old id is refused. The workspace is not
recreated and the branch is not switched.

Depends on slice 1 recording the cannot-load text. **Stopped after slice 1:**
no cannot-load exit text observed; see slice 1 proof. Do not implement until
that text is recorded; slice 2's other exits stay stopped.

## Verification and sizing

The Playwright command above is local proof for slices 2 and 3; hosted CI
runs the rest. Execution uses the workspace's dependencies (premise run
linked the integration checkout's `node_modules`). No numeric slice target;
slice 2 largest, slice 1 evidence only, slice 3 adds replacement.
Authorized execution applies its proof, refactoring, and delivery gates.
Planning grants no Take, implementation, commit, push, landing, or
workspace retirement.

## Preparation review

One reading and one Recover action on the existing Cursor launch record.
Examples are cases of that offer and resume rule; cannot-load replacement is the remaining branch, split so resume can stop first. No resplit needed.
