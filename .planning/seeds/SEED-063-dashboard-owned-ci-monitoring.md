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
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer launching execution from the dashboard gets CI
  observation and session notifications managed by the dashboard, without a
  competing observer started by the skill.
- **Evaluation:** Launch an execution session from the dashboard, publish a
  revision, and observe that a dashboard-run script monitors the applicable CI
  and sends its state to that session. The launch passes an explicit option
  telling the skill to consume externally supplied CI state rather than start
  its own monitor. Exercise pending, success, and failure at the existing
  completion boundary. Separately invoke the skill without that option and
  confirm its independent CI monitoring still works.
- **Scope:**
  - Run CI observation through a script owned by the dashboard for sessions it
    starts; deliver CI state and relevant notifications to the associated session.
  - Pass an explicit externally monitored CI option when starting those sessions.
    Its spelling and precise contract remain to be refined.
  - Make the skill consume dashboard-supplied CI state in that mode and avoid
    launching a duplicate observer. Retain independent monitoring for ordinary
    skill invocations without the option.
  - Reconcile places where execution, review handoff, wrap-up, or integration
    currently waits for CI with externally delivered results. Preserve truthful
    completion and failure handling; external observation does not mean CI may
    be assumed successful or ignored.
  - Keep CI evidence associated with the correct session, repository, publication
    target, and accepted published revision, including after a repair publication.
  - Establish observation ownership and lifecycle across session completion,
    stops, and dashboard interruptions so missing observation is visible.
- **Key examples for later refinement:**
  - A dashboard-launched session publishes while work continues; the dashboard
    monitors CI and delivers the result without the skill starting another monitor.
  - The session reaches its completion boundary with CI pending; externally
    delivered success lets it complete according to the settled wait contract.
  - The dashboard delivers a failure belonging to the session's publication;
    the skill follows applicable failure and repair guidance and receives the
    subsequent repair revision's CI state through the same external mode.
  - A result belongs to another session or an older publication; it cannot
    satisfy the current session's required completion evidence.
  - Dashboard observation or message delivery is unavailable; the session does
    not claim CI success and exposes the missing coverage under a refined policy.
  - A directly invoked skill with no external-monitor option still starts and
    uses its own CI observer.
- **Boundary:** Capture the change in monitoring ownership and its execution
  contract. This does not remove standalone monitoring, grant new repair
  authority, or prescribe a message transport or waiting implementation.
- **Value / learning:** Centralizes observation for dashboard-launched sessions
  and establishes how an agent consumes CI evidence supplied from outside.
- **Effort hypothesis:** Unestimated; completion waits, session message delivery,
  and observer lifecycle need refinement before implementation planning.
- **Capture:** Terry requested this story as the last backlog item on 2026-09-30.

## Open Decisions

- How does a session pause or yield at existing CI completion waits, and how
  does an external result resume it without deadlock or repeated agent polling?
- What is the option's exact meaning, and what evidence and delivery guarantees
  does the dashboard promise when it supplies that option?
- How are accepted publications registered with dashboard observation, and how
  are notifications correlated and deduplicated across sessions and revisions?
- How are messages retained and delivered if the agent is busy, waiting, or
  stopped, or if the dashboard restarts?
- Who stops observation at execution completion, and how is coverage maintained
  or re-established for later wrap-up and integration publications?
- What happens when external monitoring loses coverage: explicit incomplete
  status, recovery, or an agreed handoff to standalone monitoring?

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Dashboard session launch behavior](../../dashboard/AGENT-LAUNCH.md).
- [Existing CI observation and repair guidance](../../src/skills/dough-execute-plan/references/ci-monitor.md).
- [Existing CI completion mechanics](../../src/skills/dough-execute-plan/references/ci-completion-wait.md).
