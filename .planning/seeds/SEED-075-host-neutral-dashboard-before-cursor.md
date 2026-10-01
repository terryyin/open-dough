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

<a id="startup-advice-from-host-description"></a>

### Startup recovery advice comes from the host description

**Identity:** SEED-075#startup-advice-from-host-description
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/208-startup-advice-from-host-description/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a63be08c2189c0542c5f3aed38747d5992619c062119b312781167552a0f2ddd","plan":"da0a56b1ba8e4460b323b3a10a4a2bdad26cda32c9002911fb68eb79324b57dd"}}
```

- **Goal:** A developer watching or recovering an interrupted or uncertain
  session start reads that session's host's own startup words and recovery
  advice. Shared presentation can use another host's description without
  inheriting Claude Code's or Codex's recovery instructions.
- **Scope:**
  - Startup status and the native-check advice beside Continue in Startup
    recovery consume host-specific wording from the existing host description.
    Shared presentation neither selects advice by host name nor rewrites a
    literal “Claude Code” sentence to name another host.
  - Preserve Claude Code's and Codex's current startup wording for execution
    and refinement, including “Preparing execution…” and “Preparing
    refinement…” during preparation and the selected host's name during
    launching. Apply the same host wording when the card has no reported
    phase; the installed skill's start-establishment behavior still determines
    whether it says Preparing or Starting.
  - Preserve the current native-check advice where Continue is offered:
    Claude Code says “Check `claude agents` before continuing: continuing
    starts its session again unless its kept evidence resumes it.” Codex says
    “Check the dashboard history and native Codex conversations before
    continuing; a recorded conversation is resumed, never submitted again.”
  - A host description without native-check advice contributes no such advice.
    Omit that advice and its control description reference; retain the
    recovery entry and the controls its attempt already permits. Missing
    advice does not establish or remove a launch or continuation capability.
  - Preserve startup causes, local-progress and published-state explanations,
    story protection, recovery eligibility, and Recheck/Continue behavior.
    Story and ad hoc recovery entries use the same host advice when their
    existing attempt rules offer Continue.
- **Constraints:** Unsupported operations stay unavailable rather than taking
  another host's operation or advice
  ([ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)). Wording
  describes existing recovery behavior; it does not authorize a fresh attempt
  or change which evidence resumes a session.
- **Deferred promises:** Cursor launch integration or native recovery guidance,
  new recovery controls, changes to reconciliation or persistence, and forming
  recovery answers at their source instead of `forContinuation` rewriting.
  The latter belongs to SEED-072#durable-startup-reconciliation. These are
  delivery exclusions, not reasons to reject naturally supported host behavior.
- **Key examples:**
  1. An accepted Claude Code attempt needs reconciliation and offers Continue
     → Startup recovery renders it → its host description supplies the
     `claude agents` advice above; the existing Recheck and Continue controls
     retain their behavior.
  2. An accepted Codex story or ad hoc attempt offers Continue → its recovery
     entry is shown → Codex's description supplies the dashboard-history and
     native-conversation advice above, including that a recorded conversation
     is resumed, never submitted again.
  3. A host description supplies no native-check advice → an otherwise eligible
     recovery entry is rendered → it shows no borrowed advice or dangling
     advice reference, and preserves the controls the attempt permits. This
     example requires no new host integration.
  4. Codex execution or refinement is starting → the card reports its phase
     → preparing says “Preparing execution…” or “Preparing refinement…”;
     launching says “Starting execution in Codex…” or “Starting refinement in
     Codex…”. Claude Code retains its corresponding current wording. With
     no reported phase, the existing start-establishment choice gives the
     same Preparing or host-specific Starting sentence directly.
- **Related:** Pending startup words now derive workflow, phase and the
  actual host directly, as described in the
  [maintained launch documentation](../../dashboard/AGENT-LAUNCH.md).
  The completed session-wording story delivered that part of this outcome;
  preserve it and verify this story's startup examples against it.
  [Keep reconciled startups settled](SEED-072-responsive-session-start-reconciliation.md#durable-startup-reconciliation)
  still owns recovery-answer wording and native Claude Code verification.
  Reconcile advice with any delivered change to Continue semantics.
- **Current basis:** At integrated trunk `4b00bfd7`, `StartupStatus.tsx`
  consumes the actual running host and phase through `startPhaseWords` without
  literal replacement. `StartupRecovery.tsx` still selects `NativeCheck` by
  host name and borrows Codex advice for any non-Claude host.
- **Plan:** [Startup advice follows the host description](../slice-plans/208-startup-advice-from-host-description/PLAN.md).
- **Open decisions:** None for goal, scope, or key examples. The planned
  approach remains preparation only; execution requires a separate instruction.
- **Capture:** Terry asked for this story on 2026-10-01 after the SEED-072
  integration found these two places still choosing wording by host name.
