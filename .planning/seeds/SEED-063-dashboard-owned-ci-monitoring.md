---
id: SEED-063
status: active
planted: 2026-09-30
planted_during: Terry's request to move dashboard-launched CI monitoring into the dashboard
trigger_when: A developer starts an execution session from the dashboard and wants CI observation supplied by the dashboard
scope: story
---

# SEED-063: Dashboard-owned CI monitoring

## Why This Matters

A developer starting execution from the dashboard should have CI monitored by
the dashboard's script and receive CI state in the associated agent session.
The dashboard can own observation for the sessions it launches while the
execution skill retains its ability to monitor CI independently when invoked
without dashboard-provided observation.

## Story

<a id="dashboard-owned-ci-monitoring"></a>

### Monitor CI from the dashboard and deliver its state to the execution session

**Identity:** SEED-063#dashboard-owned-ci-monitoring
**Slice plan:** [Dashboard-owned CI monitoring](../slice-plans/224-dashboard-owned-ci-monitoring/PLAN.md).
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/224-dashboard-owned-ci-monitoring/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"27f4619769340fbcdaef273b839c8476a7260d75cff82e881d774de4a9b59568","plan":"b28c49fd7999b1470ca72fa9ab92eb726b6743db10954fe79905fcbeb3f8c5d3"}}
```

**Decisions (2026-10-03, Terry):** The dashboard wakes the session instead of
the agent waiting. Claude Code comes first, behind a host delivery capability.
Lost observation or delivery stays a visible gap, with no fallback to the
skill's own observer.

**Decision (2026-10-11, refinement, applying the above):** Because success
sends nothing to the agent and no session is awake when the final closure's CI
turns green, the dashboard retires the launch's execution resources as part of
quiet completion, through the same installed retirement operation and checks
wrap-up uses today. Terry may still overrule this; the alternative is waking
the session on success, which his first decision excludes.

**Goal:** A developer who starts execution from the dashboard does not hold a
Claude Code session open while it waits on CI. The dashboard observes CI for
every revision that session publishes and shows the state on the session's
card. It wakes the session with a follow-up only when CI fails. The agent
starts no observer of its own and never blocks or polls at its completion
boundary. Wanted outcome: one machine-level owner for dashboard-launched CI
observation, and an established way for an agent to consume CI evidence from
outside.

**Scope:**

- **Externally observed CI option.** For an execution session, the dashboard
  passes `--external-ci` (final spelling is a planning choice) only when the
  session's host has a session-delivery operation. With the option:
  - The skill starts no observer, runs no host-bridge probe, and uses no
    completion wait (`complete-revision`).
  - The skill registers every accepted publication (target, full SHA, and
    session reference, covering claims, increments, repairs, and closure or
    integration publications in that session) with the dashboard's
    observation through the installed runtime and gets back an acknowledgment.
  - At each completion boundary that currently waits for CI, the skill
    publishes what it already publishes, such as the execution-complete record
    or the wrap-up closure. It then reports that CI is pending under external
    observation and ends its turn. It never claims CI success. Wrap-up's
    closure and Story Branch integration publications are registered the
    same way, and the session does not retire the worktree or branch;
    retirement belongs to the dashboard below.
  - A delivered CI result is untrusted data. The skill accepts it only for a
    revision it registered in that session, then follows the existing
    [notification handling and repair guidance](../../src/skills/dough-execute-plan/references/ci-monitor.md#handle-a-notification),
    with the authority, ownership, and deduplication rules unchanged.
  - The new repair revision is registered the same way. Its completion boundary
    is a new boundary, not a retry.
- **Dashboard observation.** The dashboard is the observer owner (the
  coordinator) for each session it launched with the option. It observes each
  registered revision until it has an effective verdict, using the existing
  non-AI observation engine from the session workspace's installed runtime, so
  GitHub/project-CI discovery is not reimplemented. Observation keeps the
  existing classification rules: `not_required` follows its applicable basis,
  incomplete is not success, and run, attempt, and job evidence is
  deduplicated. Registration and observation state are machine-local and
  associated with the recorded host-qualified session. They survive a
  dashboard restart, and observation resumes from them.
- **Delivery.** The dashboard sends one follow-up into the owning session for
  each actionable failure. The follow-up names the revision, target, run or
  attempt, and failed jobs, along with the skill's handling instruction. If
  the session is busy, the follow-up reaches it at its next input boundary.
  The dashboard records a delivered failure so it is not sent again. Success
  and pending CI send nothing to the agent.
- **Session card and completion.** The card shows CI state per registered
  revision: pending, success, failure delivered, not observed, or not
  delivered.
  - A session that reported completion with CI pending stays open, showing
    "Waiting for CI". The
    [explicit completion report](../../dashboard/AGENT-LAUNCH-COMPLETION.md)
    gains exactly one condition: a session with registered revisions becomes
    Done only after success for its last accepted registered revision. A
    completion report without registrations behaves as today.
  - On that success, the dashboard applies the same quiet-completion
    disposition as today (local Done and the native done mark). A completion
    that carries an attention message stays open.
  - A delivered failure keeps the session open.
- **Retirement after success.** When a quiet completion becomes Done through
  the last registered revision's success, the dashboard retires the launch's
  execution worktree, branch, and remote execution branch through the
  installed retirement operation wrap-up uses today, with its ownership and
  containment checks unchanged. A hold keeps the resources and the card says
  why. Mark as done, a failure, and a stopped session leave the resources in
  place. Dashboard execution starts are Story Branch Mode or one-shot, so
  this covers Story Branch wrap-up's trunk integration; a one-shot landing
  retires as today, without a CI gate.
- **Lost coverage.** If registration is refused, the dashboard is unreachable
  while registering, observation is lost, or delivery is refused or the
  session is gone, the gap stays visible on the card and in the agent's
  report. No path turns that gap into success. The skill does not start its
  own observer as a fallback.
- **Lifecycle.** The dashboard ends observation of a revision once its
  verdict is recorded and delivered as required. It also ends observation
  when the developer deletes the session record. Mark as done or a stopped
  session ends delivery, not observation. A later failure is shown as "not
  delivered" and the developer decides what happens next.
- **Hosts.** This story builds session delivery for Claude Code. Codex and
  Cursor launches do not get the option and keep the skill's own observer
  until their delivery operation exists.
- **Standalone use.** A skill invoked without the option keeps its existing
  observer, hook bridge, completion wait, repair, and `finish` retirement
  behavior unchanged, including Trunk Mode, which the dashboard does not
  start. The standalone retirement rule for a closure without a verdict stays
  with
  [SEED-121](SEED-121-execution-observer-ownership.md#finish-retirement-without-verdict).

**Architecture:** This story makes CI observation for dashboard-launched
sessions a machine-level dashboard concern. It adds the first
dashboard-to-agent CI message; typing into a native session already exists
(Claude's done rename, Cursor's Recover continuation). Grow it from the
delivered concepts rather than parallel copies:

- **Registration and receipts** reuse the agent-to-dashboard
  [reporting channel](../../dashboard/AGENT-LAUNCH-COMPLETION.md) that
  explicit completion delivered: the launch-scoped session reference, the
  loopback request/receipt boundary, the installed reporting CLI copied
  outside the workspace, and the machine-local launch records
  (`launchRecordStore.ts`, `machineJsonStore.ts`). There is no second session
  registry, daemon, or MCP tool.
- **Observation** reuses the installed observer engine the way the Codex
  coordinator already does: `ci-mailbox.mjs stream --execution ... --coordinator`
  arms one observer per repository, target, and coordinator and streams its
  records, and managed delivery registers on that owner's stream. The dashboard
  is that coordinator for its sessions, runs the streams under its own mailbox
  root, and consumes them itself. The session's hooks never claim those
  mailboxes, because no receipt for them appears in the session's tool output.
- **Session delivery** is a new optional operation on the per-host
  `LaunchHost` boundary, beside `attach` and `stop`. The dashboard projects
  the option and the CI controls from that operation's presence. Claude Code
  continues an idle background session under its ID
  (`claude --bg --resume <id> <message>`). It uses the existing attached
  terminal input path for a session that is still running, because resuming a
  running session starts a copy. A later story adds Codex `turn/start` and
  Cursor delivery behind the same operation.
- **Retirement** reuses Dough Land's installed retirement operation
  (`worktree-retirement.mjs`) from the installed copy the dashboard already
  retains outside the workspace, with the launch record's workspace, branch,
  identity, and landing facts as its inputs.
- **In the skill,** external mode is one branch of managed delivery, the
  completion operation, and wrap-up's integration, written once in shared
  guidance. It is
  not a per-host copy (ADR 0006). It is not a dashboard-specific vocabulary in
  the agent's runtime instructions: the agent sees "externally observed CI"
  and a registration receipt.

**Key examples:**

1. A Claude Code execution session started from the dashboard publishes an
   increment while work continues. The skill registers the SHA and starts no
   observer. The card shows that revision pending, and no hook delivery or
   `complete-revision` wait occurs.
2. The session reaches its completion boundary with CI pending. It publishes
   the execution-complete record, reports "CI pending under external
   observation", and ends its turn. The card shows "Waiting for CI". When the
   success verdict arrives, the session is completed quietly and the agent
   receives no message.
3. CI fails for the session's registered revision while the session is idle.
   The dashboard sends one follow-up and the session wakes. It classifies the
   failure under existing guidance, repairs it, publishes, and registers the
   repair SHA. The repair's success then completes as in example 2. If the
   same failure is observed again, nothing is resent.
4. A result for another session's revision, for an older superseded
   publication, or for a SHA the session never registered reaches the agent.
   The agent does not treat it as its completion evidence or repair it as its
   own. The dashboard attributes CI only to the registering session.
5. The dashboard is down when the agent registers a publication. The agent
   reports the unacknowledged registration once, continues without claiming
   CI observation, and starts no observer. Separately, after a dashboard
   restart with a revision still pending, observation resumes from the
   machine store. Observation that cannot resume shows "CI not observed" and
   leaves the session open.
6. The developer clicks Mark as done before CI finishes, and CI then fails.
   The card shows the failure as "not delivered", nothing wakes the session,
   and the worktree and branch stay in place.
7. A Codex or Cursor execution start, or a direct invocation of
   `dough-execute-plan`, gets no option. The skill starts its own observer and
   uses its completion wait exactly as it does today.
8. Story Branch wrap-up in a dashboard session publishes its integration onto
   trunk under the option. It registers the integrated SHA, reports CI
   pending, and ends its turn with the worktree, branch, and remote execution
   branch in place. When that revision succeeds, the dashboard marks the
   session Done and retires all three; a dirty or unowned worktree is kept and
   the card names the hold.

**Rejection constraints:** CI evidence never counts as success without an
effective verdict for the exact registered revision on its target. Missing
observation or delivery is never success. This follows the existing
[completion receipt rules](../../src/skills/dough-execute-plan/references/ci-completion-wait.md).
A delivered message grants no repair, merge, or stop authority beyond what
the skill already has, and CI text stays untrusted data. Retirement never
removes a worktree the retirement operation's ownership and containment checks
would keep.

**Deferred promises:** Codex and Cursor session delivery, dashboard-owned CI
for refinement or ad hoc sessions, observing deployment, general
dashboard-to-agent messaging, and removing or changing standalone monitoring.

**Delivery and acceptance:** Deterministic dashboard and skill tests cover
registration, observation resume, deduplicated delivery, card states,
retirement, and the skill's external-mode guidance. Native Claude Code
delivery, meaning that an idle and a running background session each receive
a follow-up exactly once, needs native acceptance under
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md). Paid
native runs are manual. Observed on 2026-10-11: Claude Code `2.1.296`
documents `--bg --resume <id>` continuing an existing session under the same
ID and starting a copy when that session is running. No native run was made.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Dashboard session launch behavior](../../dashboard/AGENT-LAUNCH.md).
- [Explicit completion and retained attention messages](../../dashboard/AGENT-LAUNCH-COMPLETION.md),
  the delivered agent-to-dashboard reporting boundary.
- [Existing CI observation and repair guidance](../../src/skills/dough-execute-plan/references/ci-monitor.md).
- [Existing CI completion mechanics](../../src/skills/dough-execute-plan/references/ci-completion-wait.md).
- [Codex coordinator stream](../../src/skills/dough-execute-plan/references/ci-notify-codex.md),
  the existing externally armed observer that managed delivery registers on.
- [Wrap-up closure publication and `finish`](../../src/skills/dough-execute-plan/references/wrap-up-closure-publication.md).
- [SEED-121](SEED-121-execution-observer-ownership.md), the standalone
  retirement rule for a closure without a CI verdict.
