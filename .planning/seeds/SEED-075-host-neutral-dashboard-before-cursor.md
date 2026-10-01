---
id: SEED-075
status: active
planted: 2026-10-01
planted_during: Terry's selection from the dashboard multi-tool architecture review (SEED-069)
trigger_when: Before Cursor joins the dashboard (SEED-052#use-cursor-from-dashboard)
scope: story
---

# SEED-075: Make shared dashboard code host-neutral before Cursor

## Why This Matters

Claude Code and Codex already sit behind one `LaunchHost` boundary in
`dashboard/server/launchHosts.ts`, and shared code never imports another host's
private helpers. Shared server and browser code still decides by host name,
though, and its fallbacks answer for any host it does not name. Adding Cursor on
top of that would mean editing shared ternaries, inheriting Claude's or Codex's
wording and alert rules, and joining Codex-only gates by name. The review of the
delivered integrations (2026-10-01, at `1cdd476c`) ranked these four changes
ahead of Cursor; Terry selected them and their order. Each keeps an operation a
host lacks unavailable rather than supplied by another host
([ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)).

## Stories

<a id="one-host-description"></a>

### 1. Shared dashboard code reads one host description

**Identity:** SEED-075#one-host-description
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A maintainer adding a host describes it once instead of
  editing every shared `=== "codex"` ternary, and no shared fallback silently
  answers for a host it does not know.
- **Evaluation:** Shared server and browser code reach host facts — display
  name, skill sigil, offered models, the "no trusted answer" hint, and whether
  a host can mark done or attach — through one host description, with no
  host-name comparison outside the host modules for those facts; every
  dashboard spec passes unchanged.
- **Current basis:** Dispatch is a ternary in `server/launchHosts.ts:71-73`.
  Browser host names and done/attach flags are hard-coded in
  `src/sessionCapabilities.ts:5-15`, while the server already decides the same
  from whether the host has `stop`/`attach` (`server/agentLaunchAdmission.ts`).
  The skill sigil is chosen by name in `src/StartLaunch.tsx:191`; the recovery
  hint in `src/agentLaunchClient.ts:52` gives Codex text to every non-Claude
  host. Models are a Codex "no model" refusal in
  `server/agentLaunchAdmission.ts:174` and `src/LaunchHostModel.tsx:56`, over a
  shared enum that only knows Claude's models (`src/launchWorkflow.ts`
  `launchModels`). Branch prefixes are hand-written in `server/startGit.ts:44-50`.
  Shared helpers default `host = "claude"` (`server/launchWorkspace.ts:60`,
  `server/launchOptions.ts:34`, `server/executionStart.ts:64`, `:212`,
  `server/preparationCommand.ts:83`, `:99`, and browser helpers such as
  `src/launchAttempts.ts`, `src/launchOffers.ts`, `src/optionsOffer.ts`).
- **Boundary:** Make host parameters required rather than defaulted; each host
  declares its offered models. Behavior for Claude and Codex stays the same.
  Stored-record and request schema defaults for host-less data are out of
  scope.
- **Depends on:** None.
- **Capture:** Terry selected it on 2026-10-01 from the dashboard multi-tool
  architecture review.

<a id="session-record-per-host"></a>

### 2. Each host has its own session record shape

**Identity:** SEED-075#session-record-per-host
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/202-session-record-per-host/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"bcef4e28c91e68a5778a565e54018550eb50cb450dfc2d1e70e0c3f9ad5f66a7","plan":"1f9b0b74b02cae303b37f1643b4cf6bded25fed822526b0153bd4dc341bb400d"}}
```

- **Goal:** A maintainer adding a host (Cursor next) gives its native identity
  and continuation their own record variant, instead of adding optional fields
  to one shape that Claude and Codex share and guarding them by host name.
  Claude and Codex users see no change; the gain is that the next host's record
  cannot borrow or break another host's fields.
- **Scope:**
  - The kept session record (`hostSessionSchema` in `src/launchRecord.ts`)
    becomes one variant per host, chosen by `host`. Each variant keeps the
    shared `sessionId` and `name`.
  - Claude's variant requires its native short alias (`shortId`). Codex's
    variant may carry a continuation, and a continuation it carries holds its
    `workspace`, saved `endpoint`, resume `args`, and optional `notice`.
    Neither variant carries the other host's fields, and the host-name check
    in the schema's refinement goes away.
  - Host code reads its own fields from its own variant: Claude's alias lookup
    (`server/claudeHost.ts`) and Codex's terminal, done, recovery, observation,
    and conversation code narrow to their host's variant inside their host
    module instead of reading optional fields off a shared shape.
  - Every launch record already on a machine still loads and reads the same.
    That includes predecessor Codex records with no continuation, which load,
    observe as unknown, record "Saved native endpoint is missing" when marked
    done, and refuse Open terminal, as specs already require
    (`tests/agent-launch-host-identity.spec.ts`,
    `tests/agent-launch-codex-observation-boundary.spec.ts`). One record failing
    the schema would fail the whole machine document
    (`server/launchRecordDocument.ts`), so no variant may become stricter than
    today's shape for its host.
  - Every dashboard spec passes unchanged.
- **Deferred:** A Cursor variant (SEED-052#use-cursor-from-dashboard); the
  continuation's host-neutral label "Continue in Codex"
  (SEED-075#host-neutral-session-meaning); migrating or rewriting stored
  records — nothing stored changes.
- **Key examples:**
  - A stored Claude record with `host: "claude"`, a session ID, alias `a1b2`,
    and a name → loads; attach and stop use `a1b2`.
  - A stored Codex record with its continuation (workspace, endpoint
    `ws://127.0.0.1:…`, `codex resume` args) → loads; Open terminal, done, and
    recovery use that endpoint and workspace, and the page still shows its
    continuation.
  - A predecessor Codex record without a continuation → still loads and reads
    unknown; done records "Saved native endpoint is missing", as today.
  - A Codex continuation without an endpoint, or a Claude record without an
    alias → refused, as today.
  - A Codex record whose native connection ended → keeps its continuation with
    the notice, as today.
  - A machine document written before this change, holding both Claude and
    Codex records and a pending creation → loads with the same sessions shown.
- **Depends on:** SEED-075#one-host-description.
- **Capture:** Terry selected it on 2026-10-01 from the dashboard multi-tool
  architecture review. Refined 2026-10-01 against `2cd2e9d6`: the shared shape
  and its readers are `src/launchRecord.ts:11-37`, `server/claudeHost.ts:14-19`,
  and `server/hosts/codex/{terminal,done,recovery,conversation,sessions}.ts`.

<a id="host-neutral-session-meaning"></a>

### 3. Session meaning and wording are host-neutral

**Identity:** SEED-075#host-neutral-session-meaning
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/203-host-neutral-session-meaning/PLAN.md","assessment":"not-ready","reasons":["SEED-075#one-host-description is undelivered on fetched origin/main at 8dfd2bf19a4a451f66513944b780b9edf9c0d2b9; its shared description contract must be integrated and its consumers observed before this dependent plan is ready."],"basis":{"document":"256e0822beb2b9af9308cae4cbce0b4e238f16333f65dafcde60ee6684813e91","plan":"f1cb2888f293f4e7320199086413c19e1b2acb6e4e2259dbbc6796c4e9bc17e1"}}
```

- **Goal:** A developer reading or continuing dashboard sessions sees each
  session described in its own host's terms, and receives notifications based
  on the observation's meaning. This removes inherited Claude Code or Codex
  assumptions before another host joins the shared dashboard.
- **Scope:**
  - Read host-specific unknown-observation wording through the host description
    supplied by `SEED-075#one-host-description`. Preserve Claude Code's and
    Codex's existing wording wherever it already names the correct host.
  - Name the recorded session's host in an unavailable-session terminal attach
    refusal and in its continuation label. Keep the recorded continuation
    command, workspace, and notice intact; a label does not establish a host
    capability or invent a continuation.
  - Produce pending execution and refinement wording for the selected host
    directly, including the launching phase after preparation. Preserve the
    preparation-phase wording. Shared presentation must not choose a host by
    name or replace a literal "Claude Code" to produce another host's words.
  - Let the host's observation distinguish an explicit unrecognized native
    state from an incomplete read and supply the fact governing an
    unrecognized-state alert. Shared presentation and alerting consume that
    fact without checking the host's name. Explicit unrecognized Codex native
    statuses alert; incomplete or unreadable observations stay quiet.
  - Preserve confirmed absence versus unknown observation, existing recognized
    activity readings, attention counts, and marked-done semantics. An
    unrecognized state stays unsettled and does not increase the number of
    sessions needing attention, even if it raises a notification. Preserve
    notification baselining and deduplication.
  - Correct the implicated launch-boundary and terminal-contract comments to
    describe supported hosts and the existing `host` query parameter.
- **Constraints:** A failed or partial read does not establish session absence
  or developer-needed activity. Unsupported operations stay unavailable; this
  story does not supply another host's operation or infer support from a label
  ([ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)).
- **Deferred promises:** Cursor integration, additional continuation or terminal
  capabilities, changes to stored session records or their legacy defaults,
  launch gates, and a new notification delivery mechanism. These are delivery
  exclusions, not reasons to reject naturally supported host observations.
- **Key examples:**
  1. A recorded session cannot be observed → its state is displayed → Claude
     Code retains "State unknown: Claude Code's session list could not be
     read"; Codex retains "Live observation unavailable: Continue this
     conversation in Codex". Neither observation raises a notification or
     contributes to the attention count, and neither proves absence.
  2. A recorded session has continuation information → its entry is opened →
     the label is "Continue in <the session's host name>" and its saved command
     and workspace are shown unchanged. A session without continuation
     information gains no command merely from its host name.
  3. A host supports attachment and a kept session is confirmed unavailable →
     a terminal attach request reaches admission → it is refused and names
     that session's host. Claude Code keeps "Claude Code no longer lists this
     session"; Codex does not receive a Claude Code refusal.
  4. Execution or refinement is launching → the pending sentence is displayed
     → it says "Starting execution in Codex…" or "Starting refinement in
     Claude Code…" for the selected host. During start preparation it still
     says "Preparing execution…" or "Preparing refinement…".
  5. An unmarked session changes from a recognized state to an explicit native
     status the host cannot recognize → the page displays "State not
     recognized" with the host's description → it stays unsettled with no
     attention-count increase. Shared alerting follows the host-supplied fact;
    Claude Code continues to alert, and Codex now alerts too. The notification
    occurs once on entering that reading, not on every poll or startup baseline.
  6. Codex metadata confirms a retained conversation, but its latest turn cannot
     be read → the partial observation is presented with Codex's explanation →
     it stays quiet and available for supported continuation. The host reports
     the incomplete observation rather than shared code suppressing every
     unrecognized Codex state by name.
- **Decision:** Terry accepted the proposed Codex alert policy on 2026-10-01:
  explicit unrecognized native statuses alert, as Claude Code's do; incomplete
  or unreadable observations stay quiet. The host reports the observation's
  meaning; shared presentation contains no host-name exception. No goal,
  scope, or example decision remains open.
- **Current basis:** `dashboard/src/sessionShown.ts` selects unknown wording
  and suppresses unrecognized-state alerts by host name.
  `dashboard/server/hosts/codex/sessions.ts` can distinguish unexpected native
  statuses from a failed latest-turn read, but currently represents both as
  available activity `unknown` with a description.
  `dashboard/tests/agent-launch-codex-observation-alerts.spec.ts` confirms both
  currently stay quiet. The other affected wording and contracts are in
  `dashboard/server/agentLaunchAdmission.ts`, `dashboard/src/LaunchSession.tsx`,
  `dashboard/src/launchWorkflow.ts`, `dashboard/src/StartLaunch.tsx`,
  `dashboard/server/agentLaunchPlugin.ts`, and `dashboard/src/agentTerminal.ts`.
- **Plan:** [Session meaning and wording follow the host](../slice-plans/203-host-neutral-session-meaning/PLAN.md).
- **Depends on:** SEED-075#one-host-description.
- **Capture:** Terry selected it on 2026-10-01 from the dashboard multi-tool
  architecture review.

<a id="launch-gates-every-host"></a>

### 4. Launch gates apply to every host

**Identity:** SEED-075#launch-gates-every-host
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer cannot start the same launch twice by accident,
  whatever the host, and a host that records creation before native start gets
  the same reconciliation without a name check in shared code.
- **Evaluation:** Requesting the same in-flight launch again, for example from
  two open pages, is refused for Claude as it is for Codex; the
  unresolved-creation gate and its recovery wording apply to any host that
  records creation evidence, with recovery arguments the host supplies.
- **Current basis:** `server/agentLaunches.ts:144` refuses a duplicate only
  when `request.host === "codex"`; an ad hoc or start-less Claude launch
  requested twice starts two sessions, since only an installed start is gated
  (`server/startLaunch.ts:197-205`). The creation gate at
  `server/agentLaunches.ts:178` is tied to Codex by name, while Codex already
  enforces its record before native creation (`server/hosts/codex/launch.ts:31-35`);
  removing the name alone would refuse Claude launches when the record store is
  unreadable (`server/launchRecordStore.ts:167`). The recovery text and
  `codex resume` command are spelled in shared code (`server/agentLaunches.ts:185`,
  `src/launchCreation.ts:12-22`).
- **Boundary:** Refinement confirms with Terry the Claude behavior change.
  Claude launches stay allowed when the record store is unreadable unless that
  is decided otherwise.
- **Depends on:** SEED-075#session-record-per-host.
- **Capture:** Terry selected it on 2026-10-01 from the dashboard multi-tool
  architecture review.
