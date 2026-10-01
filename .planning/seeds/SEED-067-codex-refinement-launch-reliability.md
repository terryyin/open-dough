---
id: SEED-067
status: active
planted: 2026-10-01
scope: story
---

# SEED-067: Codex refinement launch reliability

## Story

<a id="resolve-codex-refinement-launch-failures"></a>

### Resolve reported Codex refinement launch failures

**Identity:** SEED-067#resolve-codex-refinement-launch-failures
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** Diagnose the reported dashboard launch failures and resolve supported
violations of the intended launch and continuation behavior.

**Scope:** Investigate native conversation creation and transfer to the Codex
desktop app for dashboard-started refinement. Preserve the original conversation,
its fork, both preparation workspaces, their assignments, and configured Codex
settings. Do not expand into general desktop session management or CI monitoring.

**Expected:** Starting refinement creates a conversation with the first input
accepted. The developer can continue that same conversation in the Codex desktop
app, including answering refinement questions, without having to fork it.

**Reported actual and evidence:**

- The SEED-066 attempt created conversation
  `01a0f4e3-0f7f-79e0-9678-ad57dd19c824`. The desktop app initially refused
  interaction because another app had it open. Terry forked it; the original later
  became operable. The original first turn ran from 08:35:17 to 08:38:51 Singapore
  time on 2026-10-01 and asked refinement questions. These times are observed
  thread history; a causal relation to ownership release remains unconfirmed.
- A subsequent SEED-063 attempt at revision `f5d31a4` showed: “Codex refused to
  create a conversation. No first input was submitted.” It retained the Preparing
  assignment as bastiaan-chan and workspace
  `~git/open-dough/.worktrees/monitor-ci-from-the-dashboard-and-deliver-its-st`.
  The first screenshot retained the SEED-066 Preparing assignment as ebacky-chan.

**Remaining uncertainty:** The native refusal's underlying reason, the desktop
ownership contract during an active first turn, reproducibility, and whether the
two failures share a cause. Investigation must establish scope before repair.

**Acceptance examples:** A developer launches refinement and answers its questions
in the original desktop conversation; a second story launches independently.
If native creation is refused, the dashboard preserves the preparation and reports
actionable native evidence without claiming a conversation or accepted input.
