---
id: SEED-002
status: dormant
planted: 2026-09-06
planted_during: unknown
trigger_when: when relevant
scope: unknown
---

# SEED-002: Experiment with trunk-based multi-agent collaboration

## Idea

Experiment with multiple agents developing different but interdependent,
user-centric stories or product backlog items on the same main branch or
another single shared branch. Each agent does the work needed to implement
its item and continuously integrates its changes into that shared branch.

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

## Why This Matters

Explore whether agents can deliver interdependent product work through
continuous integration on a shared branch, resolving conflicts directly with
each other while allowing unaffected work to continue. The experiment should
seek both cohesive results and a passing shared CI baseline.

## When to Surface

**Trigger:** when relevant.

Relevant context includes future exploration of multi-agent collaboration,
shared-branch development, or continuous integration practices in Open Dough.

## Scope Estimate

**Unknown.** This is a draft idea for an experiment, not a commitment to an
implementation or an estimate of effort.

## Breadcrumbs

- Owner's idea captured on 2026-09-06: shared-branch work on interdependent
  product items, delayed notification, decentralized conflict resolution,
  and reverting CI-breaking changes while affected agents coordinate.
- [Product definition](../../README.md): shared philosophies, principles,
  processes, rules, and skills for people and AI working together.
- [Existing product backlog](../PRODUCT-BACKLOG.md): context for the kinds of
  user-centric items agents could work on in a future experiment.

## Notes

Keep this seed as a general idea. The owner explicitly requested no story
decomposition. Notification timing, attribution mechanisms, coordination
protocols, and the concrete experiment setup remain open for later exploration.
