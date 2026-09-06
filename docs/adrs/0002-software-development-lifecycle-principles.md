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

We treat the beliefs in this ADR as enduring first principles against which
processes, rules, and skills are judged across model generations. Current
practices are provisional choices for serving those principles efficiently.

This draft captures two optimization goals and seven principles from the
discussion. It remains open for advice and refinement.

## Decision

### Optimization goals

- **Have the ability to deliver the highest user value first.** This requires
  both identifying the highest user value and being able to deliver it ahead
  of less valuable work. The goal does not prescribe a delivery speed or
  volume: when capacity is limited, we should be able to identify a smaller
  valuable outcome and deliver the highest-value outcome within reach, with
  a transaction cost low enough to keep selecting, completing, and delivering
  small pieces of work practical. Users receive value early, and delivery
  creates an opportunity to learn from actual use and feedback. Learning is
  the most important outcome of this process, not an incidental byproduct.
  It informs what we understand to be valuable and enables us to reconsider
  priorities and direction.
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

### Principles

We believe coordination cost is a major cause of the productivity paradox:
gains in individual productivity from programming practices and technological
breakthroughs, including AI-augmented programming, do not reliably scale into
better product outcomes. As a product's size and complexity require more
participants to understand the problem and construct a solution, coordination
can absorb those gains.

#### 1. Centralized product focus and customer view

The problem definition and customer view are centralized. All participants,
including developers and AI agents, need access to a whole-product view while
solving problems, even when a particular task requires only part of that
context. Everyone must deeply understand customer needs, current business
goals, and top items in the product backlog to the same depth. A view confined
to an assigned component is insufficient.

#### 2. Decentralized coordination through continuous integration of user-centric work

Solution construction and coordination are decentralized. Each participating
unit, whether a team, a developer, or an AI agent, can pull a user-centric
story and focus on solving it independently while keeping the solution
cohesive with the whole product. The shared understanding established by the
first principle gives the solution its purpose and bounds, so participants
can usually proceed without extensive upfront discussion of how to construct
it.

Participants must build in small increments, pulling the work needed for
their story just in time and continuously integrating their changes into the
same shared branch or trunk.

Integration exposes shared decisions when they become relevant. A conflict
in code or solution choices indicates a decision the affected participants
must resolve directly so their respective stories form a cohesive system.
They coordinate just in time, using those stories and shared product goals
as context, while unaffected participants continue working. Delayed
integration undermines this coordination model.

#### 3. Use a clear domain model and map directly to it throughout the solution

We believe a clear domain model, expressed through ubiquitous language, is
critical to a shared understanding of the problem and solution. Every layer
of the solution, including database structures, internal implementation,
API design, tests, and documentation, must map directly to its concepts and
meanings, with no translation or the minimum necessary. Keep these aligned
as the product evolves, so readers can move between layers without
translating vocabularies or reconstructing the domain model from different
representations.

System boundaries can require a special case: a data transfer object (DTO)
may pass only a subset of the domain data. It should preserve the domain
concepts and meanings while keeping necessary translation to a minimum.

#### 4. High cohesion

We believe high cohesion is critical to the health of the system. Things that
belong together must stay together: parts that need one another to be useful
should stay close to one another. Parts that have little need for each other,
or are not used together, should be kept apart so that they do not dilute the
focus of what belongs together.

The domain model in principle 3 helps identify which concepts and
responsibilities belong together, guiding the solution's organization.

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

#### 5. Reduce the judgment left in the repository

Judgment is the ability of a human or AI agent to use intelligence and context
to make decisions. Exercising judgment is an essential and welcome part of
solving a problem. The repository, however, holds the output of that work and
becomes the working material and input for future problem solving.

Use judgment while building to resolve the current problem and leave as
little further judgment as possible in the result. Simple, highly cohesive
code with clear intentions embodies decisions already made. Open choices,
interpretation, and flexibility for hypothetical future needs pass that work
to future humans and agents.

For example, a log still requires someone to interpret it and decide what to
do with it before it becomes useful. A simple unit test makes clear what it
protects and directly reports whether that expectation holds. Its author has
already decided the expected behavior, so checking it requires no repeated
interpretation of the evidence.

A solution with fewer parts, and fewer moving parts, leaves less judgment
for future work. When the user need can be met without a part or additional
code, there is no judgment burden from that absent part. In this sense,
**no code is the best code**.

We measure the total weight of our payload—the codebase—by the total amount
of judgment-intensive work it leaves for the future. Reducing that burden
supports both inexpensive delivery and changes of direction.

#### 6. Stop and fix

When something is wrong, stop. Continuing to produce creates more waste,
even though pressure for output can make stopping difficult in practice.

The response must be systematic. First analyze what caused the stop and
determine whether it is a special cause or a general cause:

- **Special cause:** Address the cause associated with the specific instance
  and fix that instance.
- **General cause:** Address the underlying system or process that produces
  the problem, putting a systematic fix in place to prevent recurrence.

In either case, put the proper fix in place and verify that it addresses the
identified cause before restarting the cycle.

This follows a more fundamental belief: **hasty work leads to low quality,
which leads to rework that slows a software project down.**

#### 7. Empiricism and continuous improvement toward perfection

We believe improvement must be based on experience. Start from where we are:
use the process we have, observe what happens, gather feedback, and improve
in response to a currently observed need. Repeat this cycle with the improved
process. Stop and fix is one way that an observed problem prompts a step.

Our vision of perfection gives these improvements their direction. That
vision is expressed in large part by the optimization goals and principles
in this document, and extends beyond what is captured here. Choose solutions
that address the observed need and move us closer to that vision; reject
those that solve the immediate problem while moving us further away. We
approach perfection through these successive improvements and fixes, without
expecting to achieve it all at once.

## Consequences

- Output volume and adherence to a plan are insufficient evidence of success.
- Maintaining Open Dough includes continually observing how current AI models
  use its tools and rules, and assessing whether they serve these goals and
  principles in the most efficient way. Model changes prompt reassessment.
  Alongside adding or improving guidance, revise, simplify, or retire practices
  that obstruct the goals or add cost without sufficient benefit.
- Concrete workflows, tools, evaluation methods, and review cadence remain
  practical choices to develop separately.

## Related

- [ADR 0000 — Use Architectural Decision Records (ADRs)](./0000-use-adrs-accepted.md)
- [ADR 0001 — Ubiquitous language (Proposed)](./0001-ubiquitous-language.md)
- [ADR playbook and index](./README.md)
