# 0002 — Software development lifecycle principles

**Status:** Accepted

**Accepted:** 2026-09-11, by Terry Yin.

**Date:** 2026-09-06

**Decision makers:** Terry Yin

**Consulted:** Terry Yin supplied the goals, principles, and clarifications.

## Context

Open Dough's products are agent rules and skills that help AI agents participate
in software development. These instructions express practical ways of working
with current models. As models evolve, useful instructions can become unnecessary
or counterproductive, potentially within the next one or two model generations.

These enduring first principles guide how we judge processes, rules, and skills
across model generations. Current practices are provisional choices for serving
those principles efficiently.

Many of these ideas come from [LeSS (Large-Scale Scrum)](https://less.works/).

These are internal Open Dough principles for developing and judging our product
and guidance. They may influence published guidance, but are not decisions
imposed on projects using it or required runtime dependencies.

## Decision

### Optimization goals

- **Have the ability to deliver the highest user value first.** This requires
  identifying the highest user value and delivering it ahead of less valuable
  work. The goal does not prescribe speed or volume: when capacity is limited,
  identify smaller outcomes and deliver the highest-value one within reach. Keep
  transaction costs low enough to make selecting, completing, and delivering
  small pieces of work practical. Delivery gives users value early and lets us
  learn from actual use and feedback. Learning is the most important outcome:
  it informs what we understand to be valuable and lets us reconsider direction
  and priorities.
- **Have the ability to change direction at extremely low cost.** This goal
  reinforces the first: learning has limited value if acting on it requires
  abandoning a large investment or undertaking expensive rework. Building
  infrastructure ahead of the features that demonstrate its value can commit
  effort to a direction that later learning challenges. Our current approach
  includes just-in-time work: make commitments and build supporting capabilities
  when the value being delivered needs them. Fast feedback from unit tests,
  end-to-end tests, and other relevant checks supports inexpensive changes.
  Do not assume every story in a decomposition will be implemented. Each stopping
  point should leave useful software without complexity whose benefit depends on
  unfinished future work. Necessary current domain coherence is part of today's
  value, even when substantial work across components is required.

### Principles

We believe coordination cost is a major cause of the productivity paradox:
individual gains from programming practices and technological breakthroughs,
including AI-augmented programming, do not reliably scale into better product
outcomes. As size and complexity require more participants to understand the
problem and construct a solution, coordination can absorb those gains.

#### 1. Centralized product focus and customer view

The problem definition and customer view are centralized. Everyone, including
developers and AI agents, must deeply understand customer needs, current
business goals, and top items in the product backlog to the same depth. This
shared view defines and prioritizes work by external customer value.

#### 2. Whole product focus

Typically, principle 1 bounds work by external customer value. Within that
scope, develop with a whole-product view and consider all parts needed
for a cohesive result. Component and story boundaries must not limit a
necessary solution. The user value scope keeps cognitive load and workload
manageable while allowing the solution to span the product.

High cohesion gives this focus its structure. Keep together parts that need
one another to be useful; keep unrelated responsibilities apart. The domain
model in principle 5 identifies which concepts and responsibilities belong
together. Related parts reduce the cost of understanding, completing, and
delivering value; separating unrelated parts limits the cost of changing
direction. Both serve the optimization goals.

Each conceptual solution has exactly one representation in the system.
Duplication violates cohesion, including different abstractions that express
the same solution despite different names, structures, or implementations.

Find and use suitable existing solutions across the whole product, including
across process boundaries when relevant. PFE, Proudly Found Elsewhere, names
this preference over NIH, Not Invented Here. Domain meaning determines fit,
not superficial code similarity. Modularization may expose a suitable part
while preserving its original purpose. Do not combine unrelated responsibilities
merely to reduce duplicated code. Distinguish confidence in domain meaning
from confidence in a proposed restructuring.

<a id="2-decentralized-coordination-through-continuous-integration-of-user-centric-work"></a>

#### 3. Decentralized coordination through continuous integration of user-centric work

Solution construction and coordination are decentralized. Participants build
small increments, pull supporting work just in time, and continuously integrate
changes into the same shared branch or trunk. Internal solution dependencies
between stories are encouraged where they support cohesion.

Proportionate upfront design can establish a common architectural direction.
PFE and reconciliation during integration bring independent work into a cohesive
solution. Use either approach or both as needed.

Integration exposes shared decisions when they become relevant. Conflicts in
code or solution choices prompt the independent reconciliation described in
principle 4, using affected stories and shared product goals as context.
Unaffected participants continue working. Delayed integration undermines this
coordination model.

Blocking story-level dependencies are exceptional. Require sequencing only
when proceeding without it would cause serious implementation disorder that
shared design and ongoing reconciliation cannot reasonably address. Shared code
or modest convenience alone does not justify blocking.

#### 4. Cross-functional

Equip all AI agents with the same capabilities and skill set, without narrow
domain specialization. We also seek to avoid narrow specialization among people.
Participants may temporarily take a role to focus on a particular perspective
within a particular context. A role directs attention without restricting
capability or responsibility for the outcome.

Multiple agents may work in parallel with overlapping roles, collaborating
through continuous integration. Collaboration proceeds through independent
action and informing others: any agent can broaden its temporary role and
extend its context to understand affected work, make a coherent decision,
integrate the result, and inform the others. Discussion among agents is not
the mechanism for resolving these decisions.

Independent judgment considers evidence, consequences for affected work,
established domain meaning, and Accepted ADRs. It does not transfer human-owned
domain or ADR decisions to agents or replace the human advice process in
[ADR 0000](./0000-use-adrs-accepted.md). Assignments of planning, execution, and
coordination duties remain workflow choices.

#### 5. Use a clear domain model and map directly to it throughout the solution

A clear domain model, expressed through ubiquitous language, is critical to
shared understanding. Every layer, including database structures, implementation,
APIs, tests, and documentation, must map directly to its concepts and meanings,
with the minimum necessary translation. Keep these aligned as the product
evolves so readers need not reconstruct the model between layers. The model
does not determine one unique implementation structure; judgment is required.
Ordinary technical mechanisms can retain honest technical names without
invented domain counterparts; they must not hide or redefine domain rules.

System boundaries may require a data transfer object (DTO) carrying only a
subset of domain data. Preserve domain concepts and meanings while minimizing
necessary translation.

Story membership, refinement, slice planning, execution readiness, and slice progress
are distinct domain facts, each with one authoritative repository record.
Dashboards derive views from published records. Readiness records the preparing
agent's assessment that no unresolved concern prevents the selected approach,
including planless execution. It requires no additional human approval, grants
no execution permission, and needs reassessment when invalidated by changes.

#### 6. Reduce the judgment left in the repository

Judgment is essential to problem solving: it uses intelligence and context to
make decisions. The repository holds the result as input for future work.

Use judgment while building to resolve the current problem and leave as little
further judgment as possible in the result. Simple, cohesive code with clear
intentions embodies decisions already made. Open choices, interpretation, and
flexibility for hypothetical needs pass that work to future humans and agents.

A log still needs interpretation and a decision; a simple unit test states
expected behavior and directly reports whether it holds.

Fewer parts, and fewer moving parts, leave less judgment for future work.
Meeting a need without additional code avoids its judgment burden:
**no code is the best code**.

Choose the least complexity that delivers the current outcome while preserving
understood domain meaning and agreed direction. Examples demonstrate required
behavior; they do not justify rejecting other cases. Generalize as evidence and
current needs justify it, not as a target that must increase with each story.
Do not narrow a naturally simple solution or build structure solely for future benefit.

Internally, a North Star is a disposable decision cache for consequential,
evidenced direction in relevant upcoming work. Keep uncertainty explicit rather
than treating possibilities as constraints.
Retire it when substantially realized or no longer useful, preserving lasting
rules under the document ownership in [ADR 0000](./0000-use-adrs-accepted.md).
The cache and effort/token rationale is maintainer-only; public guidance describes
behavior and lifecycle. Permissions and update procedures remain workflow choices.

We measure the weight of our payload—the codebase—by the judgment-intensive work
it leaves for the future. Reducing that burden supports both optimization goals.

#### 7. Stop and fix

When something is wrong, stop. Continuing to produce creates more waste,
even though pressure for output can make stopping difficult in practice.

Analyze the cause and determine whether it is a special cause or a general cause:

- **Special cause:** Address the cause associated with the specific instance
  and fix that instance.
- **General cause:** Address the underlying system or process that produces
  the problem, putting a systematic fix in place to prevent recurrence.

Put the proper fix in place and verify that it addresses the identified cause
before restarting the cycle. This follows a more fundamental belief:
**hasty work leads to low quality, which leads to rework that slows a software
project down.**

#### 8. Empiricism and continuous improvement toward perfection

Improvement must be based on experience. Use the process we have, observe what
happens, gather feedback, and improve in response to a current need. Repeat with
the improved process. Stop and fix is one way an observed problem prompts a step.

Our vision of perfection, expressed in large part by these goals and principles,
gives improvements their direction and extends beyond this document. Choose
solutions that address the observed need and move us closer to that vision;
reject those that move us further away. Approach perfection through successive
improvements and fixes without expecting to achieve it all at once.

Keep a guidance mechanism only while observed benefit justifies its maintenance
and interruption cost. Simplify or retire it when experience shows otherwise.
Use actual work to assess it; do not require new measurement machinery merely
to justify the mechanism. The North Star is one such experiment, not a reason
to make its current workflow permanent.

## Consequences

- Output volume and adherence to a plan are insufficient evidence of success.
- Work is organized around customer value with whole-product responsibility.
  Temporary roles permit independent reconciliation across overlapping work.
- Maintaining Open Dough includes observing how current models use its tools
  and rules, and whether they serve these goals and principles efficiently.
  Model changes prompt reassessment. Revise, simplify, or retire practices that
  obstruct the goals or add cost without sufficient benefit.
- Concrete workflows, tools, evaluation methods, and review cadence remain
  practical choices to develop separately.

## Related

- [ADR 0000 — Use Architectural Decision Records (ADRs)](./0000-use-adrs-accepted.md)
- [ADR 0001 — Ubiquitous language](./0001-ubiquitous-language-accepted.md)
- [ADR playbook and index](./README.md)
