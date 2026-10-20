# Choose a Cursor session model without changing later defaults

**Identity:** SEED-052#cursor-session-model-scope
**Source:** [Choose a Cursor session model without changing later defaults](../../seeds/SEED-052-start-agent-work-from-dashboard.md#cursor-session-model-scope)

## Goal and scope

A developer choosing a model for one dashboard Cursor launch gets that
model for the requested session, including its later resumption, while
later sessions retain the developer's own Cursor default. The chosen model
persists only into a session-scoped Cursor configuration cloned from the
developer's current configuration at launch; the shared Cursor
configuration is never written by that session, on launch or on any
resume. Default launches keep following the developer's current Cursor
setting, and a deliberate intervening default change is preserved.

Included: a native re-probe of the `CURSOR_CONFIG_DIR` hook on the
then-installed Cursor before dependent work relies on it; session-scope
establishment and recording at chosen-model launch with corrected dialog
wording; scope reuse on every continuation (terminal attach/open,
recovery/resume, and cannot-load replacement); non-interference for
overlapping launches and intervening deliberate default changes; scope
removal with the launch record that remembers it.

Excluded: isolating Default sessions or changing their resume behavior;
session scope for Claude Code or Codex; reconciling a session's frozen
non-model settings after launch; any mechanism a future native check
shows superseding the environment hook. A blank ad hoc Cursor start with
a chosen model remains refused.

## Current decisions and reuse

- Terry decided on 2026-10-20 during refinement: the session-scoped
  configuration direction, over save-and-restore of the shared
  configuration's model fields and over dropping the session-only promise
  (keeping today's warning). The borrowed mechanism is a browser's
  per-session profile cloned from the default profile; its recorded limit
  is that the clone also snapshots non-model CLI settings at launch.
- PFE / existing solutions: Codex already scopes its choice to native
  conversation creation and Claude sends `--model` per session, so the
  product already promises session-scoped models on two hosts; Cursor is
  the outlier because its `--model` persists globally (see premises).
  Cursor itself already keeps a per-chat `lastUsedModel` and restores it
  on resume — reuse that native per-session memory inside the session's
  own configuration instead of fighting it, rather than building a
  dashboard-side model memory or a save-and-restore of the shared file.
  The dashboard already resolves machine-local state through
  `machineDashboardPath` (`~/.open-dough/dashboard/`); session scopes live
  under that home, not inside any project workspace, so retiring a
  workspace never strands a scope and deleting a scope never touches a
  project. The Cursor boundary already owns every process that runs a
  session — the runner keep protocol, `attachCursor`, recovery, and
  replacement — so one scope resolution at that boundary serves all of
  them; no shared launch code gains Cursor model logic.
- Follow [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
  deterministic fake-Cursor tests prove the dashboard protocol (scope
  creation, inheritance, non-interference, cleanup), not native Cursor
  persistence; slices 1 and 5 own the native evidence. UI wording follows
  the existing host-description facts, and any skill prose touched follows
  [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
  is Proposed, binds nothing, and is not contradicted; no Accepted ADR
  conflicts with this scope and no North Star topic is warranted — the
  change follows the existing host-boundary pattern.

## Outside-in proof ownership

| Source promise (seed key example) | Owner | Observable result |
| --- | --- | --- |
| 1. Chosen B launch runs on B, shared config still A, dialog no longer warns B becomes later sessions' setting | 2 (deterministic), 5 (native) | Fake-Cursor journey shows the session scope cloned and inherited, the shared fake config untouched, and the new wording; native run observes the real session on B with the real shared model fields still A |
| 2. Resumed B session runs on B from its recorded scope, shared still A | 3 (deterministic), 5 (native) | Attach and recovery journeys resume through the same scope; native resume observes B with shared fields unchanged |
| 3. Deliberate default change to C is preserved across a B resume; a later Default launch uses C | 3, 4 | Journey changes the fake shared default between launch and resume and observes scope, shared value, and the Default launch each keeping their own |
| 4. Overlapping B and C launches each keep their own model; shared stays A | 4 | Two-session journey observes separate scopes and an untouched shared config |
| 5. Default Cursor, Claude, and Codex launches unchanged | 2, 4 | Existing Cursor Default and Claude/Codex model specs stay green; no scope is created for a Default launch |
| 6. Removing the launch record removes its scope, leaving shared config and saved conversation untouched | 4 | Deletion journey observes the scope directory gone and the fake shared config and chat evidence intact |
| 7. Blank ad hoc Cursor start with a chosen model remains refused | 2 | Existing blank-start refusal spec stays green |

Proof boundaries: focused dashboard Playwright specs at the real
page/server boundary with the fake Cursor runner
(`dashboard/tests/support/fakeCursor.ts`), extended so the fake records
the scope environment it was kept/attached with and can simulate Cursor's
config persistence inside the scope it is given, plus
`npm run typecheck:dashboard`. Whole-suite dashboard runs stay CI's unless
a changed shared fixture makes focused selection unrepresentative.

## Decisive premises and preparation observations

Named checkout: this preparation worktree,
`/Users/terryyin/git/open-dough/.worktrees/choose-a-cursor-session-model-without-changing-l`,
base `27800e47497536d9c3cbd0f6b969d22f1b5cb920`, 2026-10-20.

Settled by tracing the consuming operations and by the refinement probe:

- The current launch sends `--model` only on the first kept client and
  never in the stored resume command (`dashboard/server/hosts/cursor/launch.ts`);
  the stored continuation is just workspace plus resume args
  (`dashboard/src/hostSession.ts`), and every continuation — runner keep,
  `attachCursor` in `dashboard/server/hosts/cursor/terminal.ts`, recovery
  in `recover.ts`, and replacement in `recoveryReplacement.ts` — spawns
  from that continuation with `developerShellEnvironment(process.env)`
  and no per-session environment in the runner keep protocol
  (`dashboard/server/hosts/cursor/runnerProtocol.ts`). So the record's
  continuation is the one durable place a scope can be remembered, and
  the spawn sites are enumerable.
- From the installed `cursor-agent` 2026.10.19-6bbf2c4 bundle: a startup
  `--model` persists into the CLI configuration file
  (`$CURSOR_CONFIG_DIR/cli-config.json`, defaulting to `~/.cursor/`) with
  `hasChangedDefaultModel: true`; each turn records a per-chat
  `lastUsedModel`; resuming without `--model` restores that model through
  a setter that persists it into the same CLI configuration again. User
  MCP configuration is read from `~/.cursor/mcp.json` by home path and
  chat storage resolves under the data directory, so isolating only the
  config directory leaves MCP and saved conversations shared.
- Refinement's unpaid native probe (no prompt submitted, no inference):
  with `CURSOR_CONFIG_DIR` pointed at a copied `cli-config.json`,
  `cursor-agent --workspace <scratch> --model gpt-5.2` showed GPT-5.2 as
  the session model and persisted `gpt-5.2` only in the isolated file;
  the shared configuration's model fields remained `default`/Auto, and
  `cursor-agent models` read the isolated configuration. Scratch
  artifacts were removed afterwards.
- A cannot-load replacement starts a brand-new chat with no `--model`
  (`recoveryReplacement.ts`): under a session scope, that new chat reads
  the scope's already-persisted model, so replacement needs the scope but
  no model flag of its own.

Left to the early probe (slice 1), because Cursor versions move:

- That the then-installed `cursor-agent` still honors `CURSOR_CONFIG_DIR`
  as the probe observed — isolated persistence, shared model fields
  untouched, session on the chosen model, models/MCP/chat sharing intact.
  This is a permitted early probe: it is cheap, unpaid, and needs no
  prompt; its failure stops slices 2–4 and replans the mechanism (for
  example back to the developer with the save-and-restore alternative)
  rather than letting them build on a dead hook.

## Ordered slices

### 1. Re-probe the session-config hook on the installed Cursor
Type: Behavior
Status: planned
Proof: A bounded unpaid native probe against the then-installed
`cursor-agent`, run as in refinement (isolated config copy, chosen model,
no prompt submitted): the session shows the chosen model, the isolated
configuration alone persists it, the shared configuration's model fields
are unchanged, and model listing still reads the isolated configuration.
The observed Cursor version and results are recorded in this plan's
learnings.

Behavior: Given the installed Cursor, when a client starts with a chosen
model under a session-scoped configuration, the maintainer observes the
choice confined to that scope. If the hook is not honored, dependent
slices stop and the mechanism returns to the developer as a decision;
nothing is built on the unproved hook.

### 2. Launch a chosen-model Cursor session in its own configuration scope
Type: Behavior
Status: planned
Proof: Fake-Cursor journeys in `agent-launch-cursor-model.spec.ts` show:
choosing a model clones the current fake Cursor configuration into a new
session scope under the dashboard machine home, records that scope on the
session's continuation, and keeps the first client with that scope in its
environment and `--model` as today; the fake shared configuration is
byte-unchanged after launch; the dialog's chosen-model wording states the
choice applies to this session and no longer warns it becomes the setting
for later sessions. Default Cursor launches create no scope and send no
`--model`, Claude/Codex model specs stay green, and the blank ad hoc
chosen-model refusal is unchanged.

Behavior: Per seed key examples 1, 5, and 7: a chosen-model Cursor launch
establishes its scope before the first client starts, so Cursor's own
persistence for that session lands in the scope from the first turn. If
the scope cannot be established (the current configuration cannot be
read or cloned), the launch is refused before `create-chat` with that
explanation, rather than launching against the shared configuration.

### 3. Continue a scoped session in its scope on every resume path
Type: Behavior
Status: planned
Proof: Fake-Cursor journeys show terminal attach/open, recovery resume,
and cannot-load replacement for a scoped record each spawning with the
recorded scope in their environment — the replacement chat needs no model
flag because the scope already carries the model — while a scope that is
missing or unreadable refuses the continuation with an explanation and
spawns nothing against the shared configuration. A Default record's
continuations carry no scope, exactly as today.

Behavior: Per seed key examples 2 and 3: every continuation resolves the
scope from the recorded continuation through the one Cursor-boundary
resolution, so resumption restores the session's model from its per-chat
memory inside its own scope and cannot rewrite the shared default,
however that default changed since launch. Older records without a
recorded scope keep today's behavior.

### 4. Prove non-interference across sessions and remove the scope with its record
Type: Behavior
Status: planned
Proof: Fake-Cursor journeys show two overlapping chosen-model launches
keeping separate scopes and models with the fake shared configuration
untouched; a deliberate change to the fake shared default between launch
and resume surviving the resume, with a subsequent Default launch
following the new default; and deleting a scoped session's launch record
removing exactly its scope directory while the shared configuration and
the saved conversation evidence remain. Existing session deletion,
retention, and Recently done behavior is otherwise unchanged.

Behavior: Per seed key examples 3, 4, and 6: scopes are independent per
session, no session writes outside its own scope, and a scope's lifetime
is its launch record's — retained while the record keeps the session
resumable, removed when that record is removed, never before.

### 5. Verify the scoped model behavior natively
Type: Behavior
Status: planned
Proof: A bounded native Cursor run from the dashboard on this machine:
launch with a chosen model different from the current default and observe
the session on that model with the shared configuration's model fields
unchanged; resume it after its client is no longer held and observe the
same; then a Default launch following the unchanged default. Any native
failure is recorded as the story's explicit limit, per ADR 0005, instead
of being simulated by the deterministic proof.

Behavior: Per seed key examples 1–3 against real Cursor: the delivered
mechanism confines the chosen model to its session natively, not only
against the fake. Missing native proof leaves the requirement pending;
it is not passed on deterministic evidence.

## Current decisions

- Session scope is established only for a Cursor launch with an explicitly
  chosen model; Default launches and other hosts create none.
- The scope is a clone of the developer's effective Cursor configuration
  at launch, held under the dashboard machine home and remembered on the
  Cursor continuation; spawn sites resolve it in one place at the Cursor
  boundary, and a recorded scope that cannot be re-established refuses
  the continuation rather than falling back to the shared configuration.
- The dialog keeps offering Cursor's transient model catalog; only the
  chosen-model note changes, from the saved-for-later-sessions warning to
  a this-session statement.
