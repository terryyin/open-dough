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
wording and alert rules. The review of the
delivered integrations (2026-10-01, at `1cdd476c`) ranked these four changes
ahead of Cursor; Terry selected them and their order. Each keeps an operation a
host lacks unavailable rather than supplied by another host
([ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)).

## Stories

<a id="host-neutral-session-meaning"></a>

### 3. Session meaning and wording are host-neutral

**Identity:** SEED-075#host-neutral-session-meaning
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/203-host-neutral-session-meaning/PLAN.md","assessment":"not-ready","reasons":["SEED-075#one-host-description is now ready for execution locally, but remains undelivered on freshly fetched origin/main at 285bd2133f071ebd1cd2cf15c6c76b39ea36bd8b. Its shared description contract is absent from current consumers; integrate that contract and freshly observe these consumers before this dependent plan is ready. The explicit-host workspace-spec decision is resolved."],"basis":{"document":"8b5e6a92d84a269de0ce7cc7aaa3210a282c4068771124c6dd3fef803dd7613c","plan":"877cc984b0f1c92dceee47eb59e203b2402988f16d07c57de7b229f52cb7a5ac"}}
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
- **Readiness review (2026-10-01):** Fresh fetched `origin/main` at
  `285bd2133f071ebd1cd2cf15c6c76b39ea36bd8b` still lacks the shared host
  description. The prerequisite's explicit-host workspace-spec decision is
  resolved, and its local preparation at `fdb99a07` is refined / planned / ready.
  Its contract remains undelivered and the story is still queued remotely. This story's
  scope and examples remain settled; integrate that contract and observe these
  consumers against it before reassessing readiness. Preserve the four planned
  slices without absorbing the prerequisite's work.
- **Capture:** Terry selected it on 2026-10-01 from the dashboard multi-tool
  architecture review.
