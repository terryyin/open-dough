# 0002 — Software development lifecycle principles

**Status:** Proposed

**Date:** 2026-09-06

**Decision makers:** Terry Yin

**Consulted:** Further advice pending.

## Context

Open Dough's products are agent rules and skills that help AI agents participate
in software development. These instructions express practical ways of working
with current models. As models evolve, instructions that help today can become
unnecessary or counterproductive, potentially within the next one or two model
generations.

The project therefore needs an enduring foundation against which its changing
processes, rules, and skills can be judged. We treat the high-level beliefs in
this ADR as first principles intended to hold across model generations. The
current practices are ways to serve those principles, and must evolve when
they no longer do so efficiently.

This draft captures two optimization goals and the first four principles from the
ongoing discussion. Further principles will be added as that discussion
continues.

## Decision

### Optimization goals

- **Have the ability to deliver the highest user value first.** This requires
  both identifying the highest user value and being able to deliver it ahead
  of less valuable work. The goal does not prescribe a delivery speed or
  volume: when capacity is limited, we should be able to identify a smaller
  valuable outcome and deliver the highest-value outcome within reach, with
  a low transaction cost. The overhead of selecting, completing, and
  delivering work must keep small deliveries practical. Users receive value
  early, and delivery creates an opportunity to learn from actual use and
  feedback. Learning is the most important outcome of this process, not an
  incidental byproduct. It informs what we understand to be valuable and
  enables us to reconsider priorities and direction.
- **Have the ability to change direction at extremely low cost.** This goal
  reinforces the first: learning from delivery has limited practical value
  if acting on it requires abandoning a large investment or undertaking
  expensive rework. A rigid plan can create this problem, for example by
  building infrastructure ahead of the features that will demonstrate its
  value, committing effort to a direction that later learning may challenge.
  Our current approach includes just-in-time work: make commitments and build
  supporting capabilities when they are needed for the value being delivered.
  Fast feedback from unit tests, end-to-end tests, and other relevant checks
  exposes mistakes and regressions quickly, supporting inexpensive changes.
  These practices serve the ability to change direction; their particular
  implementation is not the optimization goal.

### Principles

We believe coordination cost is a major reason why improvements in individual
developer productivity do not reliably scale into better product outcomes.
Programming practices and technological breakthroughs, including AI-augmented
programming, can make individuals more productive while coordination absorbs
the gains. As a product's size and complexity require more participants to
understand the problem and construct a solution, improving individual output
alone does not solve this productivity paradox.

#### 1. Centralized product focus and customer view

The problem definition and customer view are centralized. All participants,
including developers and AI agents, need access to a whole-product view while
solving problems, even when a particular task requires only part of that
context. Everyone must deeply understand the
customer needs, current business goals, and top items in the product backlog,
to the same depth. A view confined to an assigned component is insufficient.

#### 2. Decentralized coordination through continuous integration of user-centric work

Solution construction and coordination are decentralized. Each participating
unit, whether a team, a developer, or an AI agent, can pull a user-centric
story and focus on solving it independently while keeping the solution
cohesive with the whole product. The shared understanding established by the
first principle gives the solution its purpose and bounds, so participants
can usually proceed without extensive upfront discussion of how to construct
it.

Participants must break solution construction into small increments, pulling
the work needed for their story just in time and continuously integrating
their changes into the same shared branch or trunk. This brings independently
developed solutions together throughout development and exposes shared
decisions when they become relevant.

When integration reveals a conflict, the affected participants coordinate
directly. The conflict indicates a shared decision they need to make so that
their respective user-centric stories can work together in a cohesive system.
They resolve that decision in the context of those stories and the shared
product goals. This applies to conflicting solution choices as well as code
conflicts. Coordination is localized to the participants involved and happens
just in time, driven by continuous integration; unaffected participants can
continue their work.

#### 3. Use a clear domain model and map directly to it throughout the solution

We believe a clear domain model, expressed as a shared set of domain concepts
through ubiquitous language, is critical. Those concepts and their meanings
provide a common understanding of the problem and the solution for everyone
working on the product.

Every layer of the solution must map directly to that domain model, with no
translation or the minimum necessary. Database structures, internal
implementation, API design, tests, and documentation must all use the domain
concepts directly and consistently. Moving between these parts of the product
should preserve the same concepts and meanings, without requiring readers to
translate between different vocabularies or reconstruct the domain model from
layer-specific representations.

System boundaries can require a special case. A data transfer object (DTO)
may be needed to pass only a subset of the domain data across a boundary.
Such DTOs should preserve the domain concepts and their meanings, keeping
any necessary translation to a minimum. Elsewhere, direct use of the domain
model remains the default.

#### 4. High cohesion

We believe high cohesion is critical to the health of the system. Things that
belong together must stay together: parts that need one another to be useful
should stay close to one another. Parts that have little need for each other,
or are not used together, should be kept apart so that they do not dilute the
focus of what belongs together.

This principle is closely related to the third principle. The domain model
helps us identify which concepts and responsibilities belong together, and
the solution's organization should preserve those relationships and their
focus.

High cohesion serves both optimization goals. Keeping related parts together
reduces the transaction cost of understanding, completing, and delivering
valuable work. Keeping unrelated parts separate reduces the cost of changing
direction by limiting how much of the system must be understood and changed
for a particular purpose.

High cohesion also means that each conceptual solution has exactly one
representation in the entire system. Duplication is the simplest violation
of this principle. A subtler violation is duplicated abstract solutions:
different abstractions can express the same conceptual solution even when
their names, structure, or implementation differ.

### Keep practices accountable to the enduring goals

The beliefs and goals above provide the basis for judging our processes,
agent rules, and skills. The instructions themselves are provisional practical
choices, not permanent truths.

We must continually observe how current AI models use the tools and rules,
and assess whether they still serve these goals in the most efficient way.
New model generations are a reason to reassess those choices, not to assume
that previously useful guidance remains useful. Revise, simplify, or remove
practices when observation shows that they obstruct the goals or add cost
without sufficient benefit.

## Consequences

- Process choices are judged by their contribution to early user value,
  learning, and inexpensive changes of direction. Output volume and adherence
  to a plan are insufficient evidence of success.
- Small deliveries need low overhead so that learning and redirection remain
  practical even when delivery capacity is limited.
- Plans and supporting infrastructure must leave room to act on learning;
  premature commitments can undermine both optimization goals.
- Whole-product context, current business goals, and top backlog items must be
  available and deeply understood across participants so that independent
  solution work can remain cohesive.
- Coordination focuses on shared decisions exposed by continuous integration.
  Component-local understanding or delayed integration undermines this model.
- The domain model and ubiquitous language must remain aligned across
  implementation, tests, and documentation as the product evolves, reducing
  the translation needed to understand and change the system.
- System structure must keep related parts together, preserve their focus,
  and avoid duplicate representations of conceptual solutions, including
  duplication hidden in different abstractions.
- Maintaining Open Dough includes observing agent behavior and retiring
  obsolete guidance, as well as adding or improving rules and skills.
- Concrete workflows, tools, evaluation methods, and review cadence remain
  practical choices to develop separately. This ADR does not fix them for
  future model generations.

## Related

- [ADR 0000 — Use Architectural Decision Records (ADRs)](./0000-use-adrs-accepted.md)
- [ADR 0001 — Ubiquitous language (Proposed)](./0001-ubiquitous-language.md)
- [ADR playbook and index](./README.md)
