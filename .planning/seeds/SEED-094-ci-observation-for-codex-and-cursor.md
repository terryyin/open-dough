---
id: SEED-094
status: active
planted: 2026-10-03
planted_during: Retrospective-findings runbook, 2026-10-03, first selected problem
trigger_when: A Codex or Cursor execution publishes an increment and no CI verdict reaches its coordinator
scope: story
---

# SEED-094: CI observation for Codex and Cursor executions

## Why This Matters

Managed delivery attaches CI observation for a Claude Code coordinator. On
Codex and Cursor the same delivery reports the publication unobserved, so
increments land with no CI verdict, and a Codex failure that was repaired
still holds completion open. The retained reports cover every recent Cursor
execution and most Codex executions across three projects.

## Story

<a id="observe-ci-on-codex-and-cursor"></a>

### Keep CI observed for Codex and Cursor executions

**Identity:** SEED-094#observe-ci-on-codex-and-cursor
**Slice plan:** [Keep CI observed for Codex and Cursor executions](../slice-plans/235-ci-observed-on-codex-and-cursor/PLAN.md).
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/235-ci-observed-on-codex-and-cursor/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"069713d1b61f05d1bc78c50931b2235af32d357695660eb4bb5d6d0e4b85b7e0","plan":"3c429345f6043717b34038582a1745211fc77e8821f9cad9809a59a75d6fdb96"}}
```

**For / why:** A developer running an execution on Codex or Cursor needs each
published increment's CI failure to reach the coordinator, as it does on
Claude Code, without reading scripts to find a workaround.

**Goal:** A Codex or Cursor coordinator's first managed delivery, and each
later one, is observed. A CI failure reaches that coordinator, and a failure
it has handled no longer holds completion open.

**Findings:**
[ODF-154](../../docs/maintainer/finding-names.md#odf-154),
[ODF-201](../../docs/maintainer/finding-names.md#odf-201),
[ODF-202](../../docs/maintainer/finding-names.md#odf-202).
Execution evidence stays in the catalog and the project logs.

**Decisions (2026-10-03, Terry):** This story fixes the execution skill's own
observer. It does not depend on dashboard-owned observation
([SEED-063](SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring)),
which covers dashboard-launched Claude Code sessions first and may add these
hosts later. On Codex, the coordinator arms its yielded stream once at
execution start, and managed delivery reuses it. There is no second attach
path.

**Scope:**

- **Cursor identity.** When `deliver` runs from a Cursor coordinator's own
  Shell tool, it takes that coordinator's identity from what Cursor supplies
  to the shell. It then verifies the bridge, starts or reuses the observer,
  and binds it through the existing Cursor hook. This matches how Claude Code
  uses `CLAUDE_CODE_SESSION_ID`. An explicit `--session-json` stays
  authoritative. When no identity is available, the receipt still reports an
  unobserved gap and names its missing source.
- **Codex arming at start.** A Codex execution arms the yielded stream at
  execution start, before its first publication. Managed delivery reuses that
  live stream observer, so the first increment and every later one are
  observed. When no live stream exists, the unobserved receipt names the
  supported arming step instead of "bridge unavailable". After the
  coordinator arms the stream, the next `deliver` reuses it. Guidance states
  this one route and no longer reads as forbidding it.
- **Codex acknowledgment.** A failure that the Codex binding has notified to
  the coordinator counts as delivered, the same way the Claude Code and Cursor
  hooks record delivery when they inject it. A notified failure that has been
  handled no longer holds completion open. A failure that has never been
  notified still does.
- **Deferred:** re-registering a revision published while observation was
  missing, a Codex coordinator without the yielded-cell tools (stays an
  unavailable gap), transient transport loss (ODF-121), and dashboard-owned
  observation for these hosts.

**Key examples:**

1. Cursor coordinator, no live observer. The first `deliver` runs from its
   Shell with no `--session-json`. Result: the receipt reports `attached`, a
   CI failure on that revision reaches the coordinator at its next boundary,
   and no manual `ci-mailbox.mjs start` or `register-push` is needed.
2. Cursor coordinator whose shell exposes no identity. Result: publication is
   accepted and the receipt reports unobserved with the missing source named,
   as it does today.
3. Codex coordinator that armed the yielded stream at start. Result: the first
   `deliver` reports `reused` for that stream's mailbox, and a later repair
   delivery reuses the same observer.
4. Codex coordinator that skipped arming. Result: `deliver` accepts the
   publication and reports unobserved, naming the arming step. After the
   coordinator arms the stream, the next `deliver` reports `reused`.
5. Codex execution notified of two CI failures, both repaired. Completion on
   the green revision returns success with no retained shutdown for those
   failures and no manual `recordDeliveryProgress`. A failure recorded in the
   mailbox but never notified still retains shutdown.
6. Claude Code coordinator. Delivery, binding, and acknowledgment behave as
   they do today.

**Boundary:** Claude Code observation is unchanged. Transient transport loss
(ODF-121) and a lost observer mid-execution are not in this story.

**Evaluation:** A Codex and a Cursor execution each deliver an increment whose
CI fails. Neither needs an observer start beyond Codex arming at execution
start. The coordinator receives the failure, repairs it, and completes without
a retained shutdown for the repaired failure.

**Completion:** Record the actual response and its first containing release on
ODF-154, ODF-201 and ODF-202 in the catalog.
