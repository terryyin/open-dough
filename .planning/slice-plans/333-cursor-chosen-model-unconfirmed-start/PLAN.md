# Start a chosen-model Cursor session again when its first prompt was never confirmed

**Identity:** SEED-052#cursor-chosen-model-unconfirmed-start
**Source:** [Start a chosen-model Cursor session again when its first prompt was never confirmed](../../seeds/SEED-052-start-agent-work-from-dashboard.md#cursor-chosen-model-unconfirmed-start)

## Goal and scope

A developer whose chosen-model Cursor execution start's client exits before
the first prompt is confirmed can Continue: that submits the same prompt in
a new conversation, and the story's actions return.

Included: Continue when the runner no longer holds that client. While the
client is still held, Continue still starts no other conversation. A missing
or unreadable recorded scope still refuses continuation and starts nothing.

Excluded: Claude and Codex. Changing the terminal-open wording for a missing
scope. A separate Default-model promise. Diagnosing the 2026-10-20 native
exit except as the early probe below; if that probe fails, slice 2 stops and
this plan changes.

## Current decisions and reuse

- Reuse the launch boundary that already treats a second launch of an
  unconfirmed Cursor conversation as Continue
  (`dashboard/server/launchRun.ts`, `pending` with `host.recover`). Cursor's
  host currently has no `recover`, so that path starts nothing
  (`dashboard/server/cursorHost.ts`).
- Reuse replacement of a Cursor chat that cannot be resumed
  (`dashboard/server/hosts/cursor/recoveryReplacement.ts`): a new
  `create-chat`, the same recorded scope, and the saved instruction. Do not
  resume the exited session id.
- While the runner still holds the client, keep today's refusal to start
  another conversation.
- Per [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md),
  the dashboard protocol is proved with the fake Cursor. The native question
  of whether a scoped client reaches a ready screen is the probe in slice 1,
  not a CI suite. No Accepted ADR is contradicted.

## Outside-in proof ownership

| Source promise | Owner | Observable result |
| --- | --- | --- |
| A scoped client established as launch does either reaches a screen ready for the first prompt or the plan stops | 1 | One native observation records the screen or the client exit; an exit stops slice 2 |
| Continue after that client has exited submits the prompt and the story's actions can return | 2 | The exiting-client journey's next launch create-chats again, enters the instruction, and records first input confirmed |
| Continue while the client is still held starts no other conversation | 2 | A launch while that client is alive does not create-chat again and does not enter the instruction |
| A missing recorded scope still refuses and starts nothing | 2 | The missing-scope terminal journey stays green |

Proof for slice 2: `dashboard/tests/boundary/agent-terminal-cursor-launch.spec.ts`
and the existing missing-scope journey in
`dashboard/tests/cursor-session-scope-continuation.spec.ts`, plus
`npm run typecheck:dashboard`. Whole-suite dashboard runs stay CI's.

## Decisive premises and preparation observations

1. **A second launch after the client exits starts no other conversation.**
   Settled in this checkout on 2026-10-20 by
   `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/boundary/agent-terminal-cursor-launch.spec.ts -g "client exiting does not accept"`,
   which passed (quiet reporter, exit 0). The journey kills the client, sees
   first input still uncertain, and the next launch returns `uncertain` /
   `unconfirmed` with one `create-chat` and one attach. `node_modules` for
   that run was the integration checkout's, then removed.
2. **That next launch is Continue, because Cursor has no `recover`.**
   Settled by the same test's explanation string, which is the `pending`
   branch in `launchRun` when `host.recover` is absent, and by
   `cursorHost` omitting `recover`.
3. **A scoped client reaches a screen ready for the instruction.** Open.
   The only production scoped launch (session `1a53c2fb`, 2026-10-20) exited
   about a second after resume, and no chat was stored for that id. That log
   is not an observation of this plan's probe. Slice 1 is the observation;
   its failure stops slice 2.

## Ordered slices

### 1. See whether a scoped Cursor client reaches the first prompt
Type: Behavior
Status: planned
Proof: In the execution workspace, establish a scope the way
`establishCursorSessionScope` does, run `create-chat` and
`cursor-agent --workspace <scratch> --resume <id> --model auto` with that
scope, and record whether the screen becomes ready for an instruction or the
client exits, including any exit text. Do not submit a story prompt. Stop
the client and remove the scratch chat and scope afterward. An exit stops
slice 2 and changes this plan. This observation is native and credentialed;
it is not a CI test.

Behavior: Given a chosen-model Cursor launch's configuration scope, when a
client is started the way that launch starts it, the developer can see
either a screen ready for the first prompt or the client's exit. The story
does not claim Continue can deliver the prompt until this is a ready screen.

### 2. Continue an exited Cursor start into a new conversation
Type: Behavior
Status: planned
Proof: The exiting-client journey in
`agent-terminal-cursor-launch.spec.ts` next-launches after the client has
exited, create-chats again, enters the instruction, and records first input
confirmed. A launch while that client is still alive does not create-chat
again and does not enter the instruction. The missing-scope terminal journey
stays green. `npm run typecheck:dashboard` passes. Slice 1's exit stops this
slice.

Behavior: Given a chosen-model Cursor start whose client has exited before
the first prompt was confirmed and whose runner no longer holds it, when the
developer Continues, a new conversation receives that prompt and the attempt
settles launched. Given the same start while the runner still holds the
client, Continue starts no other conversation.

## Current decisions

- Continue after an exit replaces the conversation; it does not resume the
  exited session id.
- A held client keeps the current refusal, including its explanation.
- Slice 1's failure is a plan change, not a skipped observation.
