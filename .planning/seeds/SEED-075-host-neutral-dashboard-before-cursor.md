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

- **Goal:** A developer recovering an interrupted or uncertain session start
  reads advice in that session's host's own terms, so a new host such as Cursor
  gets correct startup status and recovery wording without shared code naming
  hosts.
- **Scope:** The startup status and Startup recovery wording added by
  SEED-072 (`dashboard/src/StartupStatus.tsx`, which replaces a literal
  “Claude Code” with the host's name, and `NativeCheck` in
  `dashboard/src/StartupRecovery.tsx`, which branches on `host === "claude"`)
  read host-specific advice from the host description
  (`dashboard/src/hostDescription.ts`, e.g. beside `uncertaintyHint`). Preserve
  today's Claude Code and Codex wording and the recovery controls offered.
- **Key examples:**
  1. A Codex start needs reconciliation → Startup recovery shows its native
     check → the advice is Codex's, taken from Codex's host description.
  2. A host whose description supplies no native-check advice → its start
     needs reconciliation → no other host's advice is shown.
  3. A Codex execution is starting → the card's startup status names Codex
     without shared code rewriting a Claude Code sentence.
- **Related:** Pending startup words already derive workflow, phase and the
  actual host directly, as described in the
  [maintained launch documentation](../../dashboard/AGENT-LAUNCH.md).
  The plan for SEED-072#durable-startup-reconciliation also rewords recovery
  answers; native-check recovery advice remains part of this story.
- **Capture:** Terry asked for this story on 2026-10-01 after the SEED-072
  integration found these two places still choosing wording by host name.
