---
id: SEED-375
status: active
planted: 2026-11-15
planted_during: Project-local retrospective findings maintenance
trigger_when: selected from the product backlog
scope: story
---

# SEED-375 — Keep container diagnostics from replacing a live host test-suite owner

<a id="keep-container-diagnostics-from-replacing-host-suite-admission"></a>

### Keep container diagnostics from replacing a live host test-suite owner

**Identity:** SEED-375#keep-container-diagnostics-from-replacing-host-suite-admission
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/684-protect-host-suite-admission-from-container-diagnostics/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"6767069e52af4a68924560e53b4fd43e6d6f37498e1c8a9bd61ee7a5b12dec1c","plan":"df545931f04bd6dd90daef597aa1e7d14d3911e2fbfb57848ee9b8a457b6f314"}}
```

**Goal:** Open Dough contributors can run Linux CI diagnostics while another
worktree holds local full-suite admission, preserving the host run's valid
verdict and successful admission release. This removes the false whole-suite
failure recorded in [DD-432](../../docs/maintainer/project-test-findings.md#dd-432).

**Scope:** Keep the established plain and dashboard container diagnostic paths
outside host full-suite admission. A diagnostic must not acquire, replace, or
release the host's owner record using the container's PID namespace: an unseen
host PID is not evidence that its owner died. The diagnostic returns its own
checks' verdict. Preserve host full-suite serialization across linked worktrees
and stale-owner recovery, including retirement of surviving marked processes.
Keep admission-release failures visible rather than accepting an ownership loss.

Preserve the helper's selected checks, pathless suite, dashboard checks, runtime
and outside-checkout refusals, checkout/common-Git mounts, host-user writes,
isolated dependencies, and cached image behavior. Scope is the existing local
container/host boundary; general PID-namespace ownership, scheduling diagnostics
against each other, new machine resource limits, and admission-record migration
are not delivery commitments.

**Key examples:**

1. A host suite owns admission in a disposable repository, and a linked
   worktree's container cannot see that host PID → run the plain diagnostic
   without paths → its passing checks return success, the exact host owner ref
   remains unchanged until the host releases it, and host release succeeds.
2. The same host owner is active → a diagnostic check fails → the diagnostic
   returns its failing verdict, while the host retains and successfully releases
   its admission.
3. A host full suite is running → another host worktree starts a full suite →
   the second waits and starts only after the first releases. An abruptly killed
   owner instead permits stale recovery, with surviving marked processes retired
   before the next suite enters.

**Evidence:** DD-432's historical command is unknown; the PID/start-time match
is qualified evidence. Preparation reproduced the current pathless container
failure independently, rather than treating that command as established.
