# Plan 364: Starting Cursor opens the session

**Source:** [Starting a Cursor refinement or execution opens the session](../../seeds/SEED-159-cursor-start-opens-the-session.md#cursor-start-opens-the-session) — SEED-159#cursor-start-opens-the-session

**Source review:** [source review](source-review.md)

## Goal and scope

A person starting a Cursor refinement or execution gets that session running,
with the start's first prompt delivered into it. A workspace already trusted
through a parent directory starts the same way.

When Cursor exits before the prompt is accepted, the dashboard shows the text
Cursor printed, including `No prompt provided for print mode`, and records
that the session ended. Continue does not create another session id.

Excluded: repairing Pygardon `0e93f076-3827-46d6-8970-672a7fd036ea` and Lizard
`037ce608-8457-4daa-b8f2-c1ff732b7da1`; changing the prompt wording; passing
`--trust` or granting trust for a directory that is not already trusted.

## Outside-in proof

| Promise | Observation |
| --- | --- |
| A refinement start and an execution start keep Cursor on a terminal, accept the first prompt, and leave the process running | One dashboard launch boundary for each start. The resumed client reports stdin and stdout as terminals, the prompt is accepted, and the process is still running |
| A closed-input resume would exit with `No prompt provided for print mode`; the dashboard start does not | The same launch boundary: the client is that terminal and receives the prompt |
| An exit before acceptance shows Cursor's text, says the session ended, and Continue adds no session id | The launch boundary with a client that exits immediately, printing `Error: No prompt provided for print mode`. The recorded explanation contains that text. Continue creates no new session id |

Proof command, after the behavior exists:

```sh
npm run test:dashboard -- dashboard/tests/agent-launch-start-cursor.spec.ts dashboard/tests/agent-launch-unconfirmed-input.spec.ts
```

Extend the existing fake Cursor and those launch specs. A stand-in that never
checks its own terminal, or an assertion that only reads the short "kept
session" sentence, does not own these promises.

## Ordered slices

### 1. A Cursor start opens the session or shows why it quit

Type: Behavior
Status: done
Proof: the three observations above, through `npm run test:dashboard -- dashboard/tests/agent-launch-start-cursor.spec.ts dashboard/tests/agent-launch-unconfirmed-input.spec.ts`

Behavior: A trusted workspace, including trust inherited from a parent, is
started as a Cursor refinement or execution. The resumed `cursor-agent` is
attached to a terminal, the conversation stays up, and the first prompt is
accepted. When that client exits before acceptance, the dashboard shows
Cursor's own text and says the session ended, and Continue adds no session id.

## Execution complete

Product advice: No further product change. The start records Cursor's own
exit and leaves that session in place. Repairing the two starts that already
quit stays outside this story.

## Current decisions

Reuse the runner's existing terminal keep (`spawnCursorPty` in
`dashboard/server/hosts/cursor/terminal.ts`, used by `answerKeep`). The start
already intends to type the prompt after the composer is open. Keep that
path. The change is that the resumed client is on a terminal when Cursor
chooses its mode, and that an exit before acceptance is reported from the
captured text in `dashboard/server/hosts/cursor/launch.ts` and
`dashboard/server/hosts/cursor/unconfirmedReplacement.ts`. Today both of
those return "Cursor kept session … The first prompt was not confirmed" for
an exit, and Continue creates a new id. Do not add a second launcher and do
not pass `--trust`.

Feature behavior stays with this start. No ADR is required.

## Learnings

Slice-plan refinement was not needed: the story is one start outcome, one
proof loop, and one behavior slice. This review found no remaining
slice-specific concern.

Accepted proof for slice 1, in this checkout: an exit before acceptance
records Cursor's text and `The session ended.`, and Continue keeps that
session id (`dashboard/tests/boundary/agent-terminal-cursor-exit.spec.ts`).
A resumed client has a terminal on stdin and stdout, and a refinement start
and an execution start accept the first prompt
(`dashboard/tests/boundary/agent-terminal-cursor-launch.spec.ts`,
`dashboard/tests/agent-launch-preparation-cursor.spec.ts`,
`dashboard/tests/agent-launch-start-cursor.spec.ts`).

## Decisive premises

1. **Closed input exits before a chat exists.** Consuming operation:
   `cursor-agent --workspace <this checkout> --resume <new id>` with stdin
   closed. Observed here on 2026-10-28 with `cursor-agent` 2026.10.22-27dcf5f,
   resume `f9fe57e2-c3ce-4aea-bf17-39e4975f8a63`: exit 1, stderr
   `Error: No prompt provided for print mode`, empty stdout, and no chat
   directory under `~/.cursor/chats`.
2. **A terminal resume opens the composer.** Consuming operation: the same
   resume through `@lydell/node-pty` 1.2.0-beta.15 at 80×24, which is the
   library and size `spawnCursorPty` uses. Observed here the same day, resume
   `29e0806a-4381-4976-917d-76944299443c`: the screen contained
   `→ Plan, search, build anything`, and it did not contain
   `No prompt provided for print mode`. The probe chat directory was removed
   afterward.
