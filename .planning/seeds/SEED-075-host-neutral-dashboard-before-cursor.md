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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer reads each session's state, refusals, and
  continuation in that session's own host's name, and alerting follows what
  the host reported rather than which host it is.
- **Evaluation:** The unknown reading, the terminal attach refusal, and the
  continuation label name the session's host; whether an unrecognized state
  raises an alert comes from a fact the host sets, with no host-name check in
  shared presentation.
- **Current basis:** `src/sessionShown.ts:48-60` gives every non-Codex host
  Claude's unknown wording, and `:117-122` alerts on an unrecognized state for
  Claude but not Codex, because Codex reports a partial read in the same shape
  (`server/hosts/codex/sessions.ts:99-101`). The attach refusal says "Claude
  Code no longer lists this session" for every host
  (`server/agentLaunchAdmission.ts:242`). `src/LaunchSession.tsx:21-29` shows
  "Continue in Codex" whenever a continuation exists. The pending launch words
  say "Claude Code" (`src/launchWorkflow.ts:43`, `:65`, and the comment at
  `:92`) and are rewritten by string substitution
  (`src/StartLaunch.tsx:105-106`). Comments in
  `server/agentLaunchPlugin.ts:8-12` and `:20-21` still describe a Claude-only
  boundary, and `src/agentTerminal.ts:3` omits the `host` the page sends
  (`src/useAttachedTerminal.ts:15-20`).
- **Boundary:** Refinement decides with Terry whether Codex's unrecognized
  states should alert. Claude's and Codex's current wording is kept wherever it
  already names the right host.
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
