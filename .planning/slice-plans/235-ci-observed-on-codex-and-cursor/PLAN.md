# Keep CI observed for Codex and Cursor executions

**Identity:** SEED-094#observe-ci-on-codex-and-cursor
**Source:** [refined story](../../seeds/SEED-094-ci-observation-for-codex-and-cursor.md#observe-ci-on-codex-and-cursor).
**Prepared:** 2026-10-03. Planning only, in the established preparation workspace. This instruction authorizes neither implementation nor publication.

## Goal and boundaries

A Codex or Cursor coordinator's first managed delivery, and each later one,
is observed. A CI failure reaches that coordinator, and a failure it has
handled no longer holds completion open. Claude Code is unchanged.

Included scope is the story's scope. Material exclusions (deferred in the
story):

- Re-registering a revision published while observation was missing.
- A Codex coordinator without the yielded-cell tools. It stays an unavailable
  gap.
- Transient transport loss (ODF-121) and a lost observer mid-execution.
- Dashboard-owned observation (SEED-063).

## Direction and PFE

All three gaps are in the existing mailbox, hook and stream path. This plan
reuses that path and adds no new observer kind.

- **Cursor identity:** extend `resolveHostSession` in
  `src/skills/dough-execute-plan/scripts/ci-host-bridge.mjs`. For
  `--host cursor` it takes `{ conversation_id: CURSOR_CONVERSATION_ID }` from
  the supplied environment, the same way Claude takes
  `CLAUDE_CODE_SESSION_ID`. Explicit `--session-json` stays authoritative.
  When the variable is missing, the missing-identity reason names it, as the
  Claude reason does.
- **Cursor generation:** identity alone is not enough (see premise 3).
  `hookInput` fills a missing `generation_id` with `"managed-delivery"`. The
  probe and the bind each write that value into the owner's
  `generation-<owner>` file. The coordinator's real hooks then carry a
  different `generation_id`, and `selectCiEvents` returns nothing until the
  next `beforeSubmitPrompt`. An autonomous execution can run a whole story in
  one generation. Managed delivery must leave the coordinator's real
  generation as the gate. Where this is fixed (no synthetic generation write
  from managed delivery, or the hook adopting the real generation when it
  sees its own owner's receipt) is an execution choice. The proof below fixes
  the outcome.
- **Codex:** the yielded stream armed at execution start is the one observer.
  `ci-mailbox.mjs stream` already creates a mailbox that
  `findLiveMatchingMailbox` matches on repository and target branch, so
  managed delivery reuses it (premise 4). Without a live stream, `deliver
  --host codex` reports unobserved with a reason that names the arming step
  in `ci-notify-codex.md`. Remove the `--codex-bridge-available` input and
  the `codex stream binding retained by caller` bind. With them, `deliver`
  starts a detached mailbox that no yielded cell streams, which is a second
  attach path the story rejects. No guidance documents the flag (premise 6).
- **Codex acknowledgment:** follow what the Claude Code and Cursor hooks
  already do. `selectCiEvents` records `deliveredThrough` once the host
  accepts the injected output. The Codex stream path must record delivery for
  the records it hands to `notify`, and only those. Whether the stream worker
  records on emission or the binding acknowledges after `notify` is an
  execution choice, constrained by example 5: a record never handed to the
  coordinator still holds completion open.
- **Guidance:** `SKILL.md` ("Before arming observation") and `ci-monitor.md`
  host selection say that a Codex execution arms its yielded stream at
  execution start, before the first publication. `trunk-publication.md`
  ("Run `deliver` through the coordinator's own Bash or Shell tool") gains
  the Cursor identity sentence. That section and `wrap-up.md:199` ("Do not
  run a separate observer probe, start, or `register-push`") also state that
  a Codex coordinator's start-time stream is the observer that managed
  delivery reuses. `ci-notify-codex.md` drops any manual
  `recordDeliveryProgress` expectation and keeps its stop binding. Write it
  for the executing agent (ADR 0006).

Accepted ADRs: [0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
for guidance wording. No ADR conflict. No North Star topic is warranted.
Edit `src/skills/dough-execute-plan/` only, not installed copies (AGENTS.md).

## Key examples and proof

| Story example | Owning slice | Observable proof |
| --- | --- | --- |
| 1. Cursor coordinator, no live observer, first `deliver` from its Shell with no `--session-json` | 1 | Managed-delivery test with `CURSOR_CONVERSATION_ID=conv-1` in `env` and `session: null`: receipt `attached`. After a released failure, the installed Cursor hook invoked as the coordinator (`conversation_id: conv-1`, a real `generation_id` different from any managed-delivery value, `postToolUse`/`Shell`, with and without the deliver receipt in `tool_output`) returns `additional_context` containing `CI_FAILURE` and the SHA. No `start` or `register-push`. Before the change, this hook call returns `{}` (premise 3) |
| 2. Cursor shell without identity | 1 | Same test without the variable: publication accepted, `unobserved`, reason names `CURSOR_CONVERSATION_ID`; no mailbox storage created |
| 3. Codex armed at start; first and repair delivery reuse it | 2 | Test that starts `ci-mailbox.mjs stream --execution owner/project main` (blocked provider), then runs `deliver --host codex` twice: both receipts `reused` with the stream's directory, coverage holds both SHAs, one launch |
| 4. Codex skipped arming, then arms | 2 | `deliver --host codex` with no live stream: accepted, `unobserved`, reason names arming the yielded stream; no mailbox created. After starting the stream, the next `deliver` reports `reused`. The CLI rejects `--codex-bridge-available` as an unknown flag |
| 5. Codex: two notified, repaired failures; completion succeeds; an unnotified one retains | 3 | Codex replay that consumes the stream output the way `ci-notify-codex.md`'s binding does: after two failure records are notified and the final revision is green, `complete-revision` returns exact success with no retained shutdown, and `readDeliveryProgress` shows `deliveredThrough: 2` without a manual `recordDeliveryProgress`. A record published after the consumer stopped reading stays unread and completion retains shutdown |
| 6. Claude Code unchanged | 1, 2, 3 | Existing Claude managed-delivery, session and lifecycle tests stay green unchanged, including "explicit session JSON ... wins over a different ambient Claude session" |
| Cursor and Codex never adopt the ambient Claude session | 1, 2 | `execution-increment-managed-delivery-session.test.mjs` "Cursor and Codex delivery never adopt the ambient Claude session" keeps that assertion, with only the reasons updated |

Local proof per slice: the named test files plus the related CI test files
(`ci-cursor-*`, `ci-codex-*`, `ci-host-*`, `execution-increment-managed-*`,
`ci-mailbox-complete*`) through `bash scripts/test.sh <files>`. These files
consume the changed bridge, hook and stream. `npm run lint` covers the
changed scripts.

## Decisive premises

Observed 2026-10-03 at `c5bfd172` in this workspace.

| # | Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- | --- |
| 1 | A Cursor agent's Shell environment carries the coordinator's conversation identity | Slice 1 identity source | `ps eww` over local processes: a mailbox worker started from a Cursor agent Shell (pid 95893, checkout `.worktrees/cursor-runner-survives-dashboard-restart`) | Carries `CURSOR_AGENT=1`, `CURSOR_CONVERSATION_ID=2f4c1ff3-…`, `CURSOR_REQUEST_ID=04a038ec-…` |
| 2 | That variable equals the `conversation_id` the real Cursor hook keys ownership on, with no `agent_id` | Slice 1 binding matches the coordinator's hooks | sha256 of `[checkoutIdentity(that checkout), "cursor", CURSOR_CONVERSATION_ID, ""]` compared with that mailbox's `owner` file (`/tmp/dough-ci-501/watch-lDQFl1/owner`) | Equal (`347616e2…`), so the real hook bound it with that identity and an empty agent id |
| 3 | After managed delivery binds a Cursor coordinator, its real hooks in the same generation receive nothing | Slice 1 must fix generation, not only identity | Disposable local test (deleted after the run): `createManagedFixture`, deliver with `session: { conversation_id: "conv-1" }`, release a failure, then invoke the installed hook as `conv-1` with `generation_id: "real-gen"`, once with the deliver receipt in Shell output and once without | Delivery `attached`; both hook calls returned `{}`. The field mailbox above also has `generation-347616e2…` = `managed-delivery` |
| 4 | A stream-created mailbox matches managed delivery's reuse lookup | Slice 2 reuse | `establishObservation` calls `findLiveMatchingMailbox` with the target branch (`execution-increment-delivery.mjs:76-78`); `streamMailboxWorker` creates the mailbox with stream worker identity. Field receipts for plans 203, 204 report `reused` for yielded-stream mailboxes (ODF-202 occurrences) | Matches; slice 2's test pins it locally |
| 5 | Delivery acknowledgment exists only in the Claude/Cursor hook path | Slice 3 | `grep recordDeliveryProgress` over non-test scripts: only `ci-host-hook.mjs`. `streamMailboxWorker` passes `onRecord` straight to `write` (`ci-mailbox.mjs:116-119`) | Confirmed; Codex records are printed but never acknowledged |
| 6 | `--codex-bridge-available` has no documented or tested caller | Slice 2 removal | `grep` over `src/skills` guidance and all `*.test.mjs`/fixtures | Only the CLI parser, `execution-increment-observation.mjs` and `ci-host-bridge.mjs` reference it |

The CI host-hook generation gate is the most likely place to need rework
(slice 1). Premise 3 has been reproduced, so slice 1 starts from a red test,
not a hypothesis.

## Slices

### 1. A Cursor coordinator's managed delivery is observed from its own Shell

Type: Behavior
Status: planned
Proof: examples 1, 2, 6 and the session test, as tabled above.

Behavior: Cursor coordinator with `CURSOR_CONVERSATION_ID` in its Shell, no
live observer → `deliver --host cursor` without `--session-json` → the
receipt reports `attached`, and a CI failure on that revision reaches the
coordinator's own hooks in its current generation. Without the variable, the
receipt reports the unobserved gap naming it. `trunk-publication.md` states
the Cursor identity source next to the Claude one.

### 2. A Codex coordinator's start-time stream is the observer managed delivery reuses

Type: Behavior
Status: planned
Proof: examples 3, 4, 6, as tabled above.

Behavior: Codex coordinator that armed `ci-mailbox.mjs stream` at execution
start → `deliver --host codex` for each increment and repair → every receipt
reports `reused` for that stream's mailbox. Without a live stream, the
receipt is unobserved and names the arming step. Managed delivery never
starts a detached Codex observer. `SKILL.md`, `ci-monitor.md`,
`ci-notify-codex.md`, `trunk-publication.md` and `wrap-up.md` describe this
single route.

### 3. A failure notified to a Codex coordinator no longer holds completion open

Type: Behavior
Status: planned
Proof: example 5 and the existing Codex lifecycle and completion tests, as
tabled above.

Behavior: Codex yielded stream has handed two failure records to the
coordinator, and both are repaired → `complete-revision` on the green
revision → exact success with no retained shutdown and no manual
acknowledgment. A record the coordinator never received still retains
shutdown. Existing Codex tests that assert `deliveredThrough: 0` after an
unconsumed publication keep that meaning. Update only those whose stream
output was actually consumed.

## Native evaluation (manual)

The story's Evaluation needs a native Codex run and a native Cursor run whose
increment's CI fails. These are paid host runs, which in this project are
manual only. After the slices land, Terry runs them or authorizes them. They
are not a slice gate. Completion records the outcome, the first containing
release, and the responses on ODF-154, ODF-201 and ODF-202 in
`docs/maintainer/finding-names.md`.

## Current decisions

- 2026-10-03 (Terry, refinement): the skill's own observer; Codex arms its
  stream at start; there is no second attach path.
