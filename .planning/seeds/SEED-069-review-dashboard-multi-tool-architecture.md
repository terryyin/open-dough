---
id: SEED-069
status: active
planted: 2026-10-01
planted_during: Terry's request to review dashboard architecture before expanding AI IDE support
trigger_when: Codex dashboard support is mostly implemented, before adding Cursor or further tools
scope: story
---

# SEED-069: Review dashboard architecture for multiple AI IDE tools

## Why This Matters

Developers should be able to use their preferred AI IDE tool from the dashboard
without each new integration making the shared workflows harder to maintain.
With Claude Code available and Codex support mostly implemented, there is enough
implementation experience to review the architecture again before adding Cursor
and further tools.

## Story

<a id="review-dashboard-multi-tool-architecture"></a>

### Review dashboard architecture before adding more AI IDE tools

**Identity:** SEED-069#review-dashboard-multi-tool-architecture
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/200-review-dashboard-multi-tool-architecture/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"06c6da49817f9464cf7d59ed0aa1b70207c3cd9e4c5ddf891b2f79927d0d5c23","plan":"5f81eeb4d2eacf5850b1985279569a4cf51ad169e866dd54adbd3baca8be0655"}}
```

**Goal:** Give Terry, as the dashboard maintainer, an evidence-backed review of
how the delivered Claude Code and Codex integrations divide shared and
host-specific responsibility, so Terry can decide which improvements precede
Cursor support. The observable outcome is a decision-ready review; a cohesive
multi-tool dashboard is the broader ambition it serves.

**Scope:**

- **Required:** Review the current code and behavior across six concerns:
  launch and preparation handoff, workspace context, conversation identity and
  persistence, native session observation and lifecycle, continuation and
  terminal interaction, and failure/retry recovery. For each concern, state
  which module owns the shared behavior, which native operation each host
  supplies, and where host knowledge leaks outside its host module, citing
  files.
- **Required:** Each finding states its consequence for adding Cursor (what
  Cursor would have to duplicate or change outside its own host module) and a
  bounded improvement, ranked by whether it should precede Cursor. A concern
  whose current design is sound gets an explicit retain decision with its
  evidence.
- **Required:** Separate confirmed findings, grounded in Claude Code and Codex
  code and behavior, from Cursor questions that only native Cursor evidence can
  settle. Do not presume Cursor shares either host's native capabilities
  ([ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)).
- **Required:** Assess the browser test suite's per-host spec families the
  same way: which tests prove shared behavior once and which prove a host's
  native difference, and what Cursor would have to copy
  ([ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) §2).
- **Required:** Correct the maintained launch documentation
  (`dashboard/AGENT-LAUNCH.md`) wherever the review finds it misdescribes the
  current host boundary. Report whether any ADR needs an update; propose one
  only for a decision that affects general-purpose agents.
- **Required:** Revise the North Star's
  [agent-launch topic](../NORTH-STAR.md#agent-launch-as-a-requested-assignment)
  with the unbuilt direction Terry selects from the recommendations. Its
  realized statements were retired during preparation (2026-10-01).
- **Required:** Present the ranked recommendations to Terry. For each one Terry
  selects, record a canonical story in a suitable seed and queue it ahead of
  Cursor; record no story for a recommendation Terry declines.
- **Deferred:** Implementing any improvement, adding Cursor, and observing
  native Cursor behavior. A paid native observation is out of scope.
- **Boundary assumption:** The Codex dashboard story is closed. The
  [Codex terminal attachment investigation](SEED-073-investigate-codex-terminal-attachment.md#investigate-codex-terminal-attachment)
  is still Taken; the review records its outcome if available, or names
  attachment recovery as a limitation it could not assess.

**Key examples:**

1. Given Codex and Claude Code launches recorded on one machine, when the
   review traces a refinement launch through admission, start, recording,
   observation, attachment, and done mark, then it shows which steps run
   common orchestration and which call a `LaunchHost` operation, and explains
   each native difference (for example, Claude chooses its own session id
   while Codex records a saved thread and endpoint).
2. Given shared modules that branch on a host name (for example the
   Codex-only duplicate-launch and creation reconciliation in
   `dashboard/server/agentLaunches.ts`, or the per-host capability switches in
   `dashboard/src/sessionCapabilities.ts`), when the review assesses adding
   Cursor, then it reports each branch Cursor would extend, whether the branch
   expresses a native difference that belongs behind the host boundary or a
   shared rule applied to only one host, and a bounded improvement.
3. Given a concern such as terminal transport, already shared through the host
   `attach` operation, when the review finds no duplication or coupling, then
   it records a retain decision with evidence rather than proposing an
   abstraction for a hypothetical tool.
4. Given whether Cursor exposes a resumable conversation identity that the
   dashboard can observe, when no native Cursor evidence exists, then the
   review lists it as an open question for the Cursor story, not as a finding.
5. Given ranked recommendations, when Terry selects two and declines one, then
   two queued stories precede Cursor in the backlog and the declined one leaves
   no story behind.

**Architecture:**

- **Applicable decisions:**
  [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) (minimal
  platform adapters, shared logic tested once, no inference of one tool's
  success from another's);
  [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  §3 (map directly to one domain model); and
  [ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md). Proposed
  ADR 0008 and the North Star inform the review and bind nothing. No conflict
  was found.
- **Starting evidence (not findings):** Native operations already sit behind
  the `LaunchHost` boundary in `dashboard/server/launchHosts.ts`, which leaves
  operations a host lacks unavailable rather than substituting another host.
  Host modules live in `dashboard/server/hosts/{claude,codex}`. Host-name
  branches also appear in shared server orchestration (`agentLaunches.ts`,
  `agentLaunchAdmission.ts`) and in the browser (`sessionCapabilities.ts`,
  `sessionShown.ts`, `StartLaunch.tsx`, `LaunchHostModel.tsx`,
  `agentLaunchClient.ts`). The review assesses these against the North Star's
  rule that host-specific code stays in one module per host.
- **Recording:** A retained design stays explained by code. Unbuilt direction
  goes into the North Star topic. Propose a `docs/` design document only for
  something the code cannot explain, and an ADR only for a decision with
  impact on general-purpose agents.

**Effort hypothesis:** About one planned session of code reading and tracing,
with no paid native runs.

## Breadcrumbs

- Terry's direction in this chat, 2026-10-01: review the architecture once Codex
  support is mostly implemented, find improvements before adding tools such as
  Cursor, and put the review at the top of the product backlog.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Codex dashboard support](SEED-052-start-agent-work-from-dashboard.md#use-codex-from-dashboard).
- [Cursor dashboard support](SEED-052-start-agent-work-from-dashboard.md#use-cursor-from-dashboard).
- [Dashboard behavior](../../dashboard/README.md).
- [ADR catalog](../../docs/adrs/README.md).
