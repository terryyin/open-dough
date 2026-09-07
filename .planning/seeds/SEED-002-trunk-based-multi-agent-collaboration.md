---
id: SEED-002
status: dormant
planted: 2026-09-06
planted_during: unknown
trigger_when: Real interdependent shared-branch work exposes a coordination problem
scope: unknown
---

# SEED-002: Experiment with trunk-based multi-agent collaboration

## Idea

Experiment with multiple agents developing different but interdependent,
user-centric stories or product backlog items on the same main branch or
another single shared branch. Each agent does the work needed to implement
its item and continuously integrates its changes into that shared branch.

Each agent identifies itself in its commits, so another agent can trace a
conflicting change to the agent that made it and address that agent directly.
The exact representation of agent identity remains open.

When a conflict or integration problem appears, the detecting agent identifies
which agent introduced the conflicting change and notifies that agent.
Notification and coordination may happen with a delay; immediate awareness
is not assumed. The affected agents then discuss the problem and collaborate
on a solution that makes their changes work together as a cohesive result.

This coordination is decentralized and localized to the affected agents.
Other agents whose work is unaffected can continue implementing and integrating
their items while that discussion takes place.

If an integration breaks CI, the responsible agents revert the breaking
change or changes to restore passing CI, then continue their localized
discussion and work toward a compatible solution before integrating again.

## Possible Communication Mechanism

Agents might communicate through a mailbox committed to the shared repository.
A message identifies its sending agent and intended receiving agent, describes
the conflict, and offers a proposal for resolving it. The receiving agent reads
the message after some delay, considers the proposal, and commits a reply to
continue the discussion. Immediate delivery or response is not assumed.

This would keep the discussion alongside the work and let the affected agents
coordinate asynchronously while other agents continue. The mailbox is a
candidate mechanism for the experiment; its format and delivery timing remain
open.

## Illustrative Conflict Scenario

1. Agent A makes a change, checks it locally, and finds that everything looks
   good. It commits the change with its agent identity.
2. Agent A pulls with rebase and encounters a conflict with a change already
   integrated by Agent B.
3. Agent A analyzes the conflict, uses the commit identity to identify Agent B,
   and recognizes that their approaches to overlapping work conflict.
4. Agent A sets its own change aside by stashing or shelving it, preserving
   the work while making room to coordinate. Because the change was already
   committed, the exact Git procedure for shelving it is left for the
   experiment to define.
5. Agent A commits a mailbox message addressed to Agent B, explaining the
   conflicting approaches and proposing a way to make them work together.
6. After a delay, Agent B receives the message, reviews the proposal, and
   commits a reply. The affected agents continue the exchange toward a
   cohesive solution, while unaffected agents keep working.

This scenario concerns a conflict discovered before integration. If an
integrated change instead breaks CI, the earlier rule still applies: revert
the breaking changes to restore passing CI while the localized discussion
continues.

## Why This Matters

Explore whether agents can deliver interdependent product work through
continuous integration on a shared branch, resolving conflicts directly with
each other while allowing unaffected work to continue. The experiment should
seek both cohesive results and a passing shared CI baseline.

## When to Surface

**Trigger:** real interdependent shared-branch work exposes a coordination
problem worth a bounded experiment, after the client installation/update path
works. Existing communication is sufficient until the experiment demonstrates
otherwise; no mailbox or new installed guidance is a prerequisite.

## Scope Estimate

**Unknown.** This is a draft idea for an experiment, not a commitment to an
implementation or an estimate of effort.

## Breadcrumbs

- Owner's idea captured on 2026-09-06: shared-branch work on interdependent
  product items, delayed notification, decentralized conflict resolution,
  and reverting CI-breaking changes while affected agents coordinate.
- Owner's enrichment on 2026-09-06: identify agents in commits and explore a
  committed mailbox with explicit receivers and delayed replies; preserve a
  conflicting local change by shelving it while discussing a proposal.
- [Product definition](../../README.md): shared philosophies, principles,
  processes, rules, and skills for people and AI working together.
- [Existing product backlog](../PRODUCT-BACKLOG.md): context for the kinds of
  user-centric items agents could work on in a future experiment.

## Review — 2026-09-07

Still relevant as a future experiment, outside the active queue. It neither
blocks Donut adoption nor justifies adding coordination machinery to clients.
If it eventually produces distributable guidance, require separate native
application/use, installation/update, and coexistence evidence in Codex, Cursor,
and Claude Code. No native evidence is claimed for this idea.

## Notes

Keep this seed as a general idea. The owner explicitly requested no story
decomposition. Commit identity format, mailbox structure, notification timing,
shelving mechanics, coordination protocols, and the concrete experiment setup
remain open for later exploration.
