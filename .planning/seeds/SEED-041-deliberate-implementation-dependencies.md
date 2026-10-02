---
id: SEED-041
status: active
planted: 2026-09-26
planted_during: Product backlog capture requested by the maintainer
trigger_when: A story genuinely cannot start until another story completes
scope: story
---

# SEED-041: Make necessary blocking dependencies visible

## Why This Matters

Each story represents external user value. Internal solution dependencies
between stories are encouraged: shared solutions and architectural cohesion
are desirable. Their existence does not imply that stories should wait for
one another or that those dependencies need story-level visualization.

The normal approach is well-considered upfront design towards a shared
architectural direction and/or later reconciliation. Contributors implement
stories independently, apply PFE, and continually seek one cohesive solution.
When their work integrates, they reconcile the implementation into that
cohesive solution rather than preserving duplicate solutions per story.

Explicit sequencing is an exception. Record and visualize a blocking
story-level dependency only when proceeding without the required sequence
would create serious implementation disorder that the normal design and
reconciliation approach cannot reasonably address. Modest convenience or
shared code alone does not justify introducing a wait.

Trunk Mode exists, but close collaboration between multiple agents is not yet
available as a mechanism. As that capability develops, internal solution
interdependence should be encouraged even more and blocking story-level waits
should become still less necessary. Building that collaboration capability is
outside this story.

## Story

<a id="deliberate-implementation-dependencies"></a>

### Capture and visualize beneficial implementation dependencies between stories

**Identity:** SEED-041#deliberate-implementation-dependencies
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/216-blocking-story-dependencies/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"06a87bd95e0269ef3a6b00aaeb75e0fb0d9f42ffa8e12ae720a87512e3176d0c","plan":"ed295ca002fd77c589a10dc31a446c5a289bf244e9e9721bd246ae14f36a2ab7"}}
```

**Goal:** Developers and agents can recognize, explain, and resolve the rare
implementation dependency that genuinely requires another story to complete
before this story can start, while preserving internal solution sharing as
the normal approach.

**Scope:**

- This delivery handles blocking dependencies only. A dependent story cannot
  start execution while a recorded blocking prerequisite is unfinished or its
  fulfillment remains unresolved. A partial-work advisory that permits the
  dependent story to start is not this version's meaning.
- Record why sequencing is necessary, including why shared design and later
  reconciliation are insufficient for this case. Do not infer blocking from
  shared code, shared architecture, overlapping user value, or backlog order.
  Do not require an exhaustive inventory or numerical justification.
- Show dependencies only on the story that depends on others. Its story block
  expands to list the supplying stories, reasons for sequencing, prerequisite
  completion conditions, and current state or resolution. The supplying story
  needs no reverse-dependency annotation. Preserve backlog priority and stage.
- During a supplying story's landing or wrap-up, its agent finds the stories
  depending on it and considers each from that dependent story's perspective.
  Completion must be positively established; disappearing from Taken or a
  local commit alone is insufficient evidence.
- For a simple satisfied dependency, update its state. For a moderately
  complex case, attempt reconciliation from the dependent story's perspective
  and update after resolution. For a complicated case, stop the affected
  reconciliation and wait for a developer decision. Do not clear an unresolved
  dependency merely because the supplying story has finished.
  Reconciliation updates dependency evidence and existing story/plan assumptions
  within the dependent story's established goal and scope. It does not implement
  the unstarted dependent story; that requires its own execution authorization.
- Resolving one dependency does not clear another. Once every blocking
  dependency is resolved, dependency blocking no longer prevents execution;
  other preparation requirements and execution authorization remain distinct.
- Repeated landing and wrap-up visits preserve completed resolution instead
  of duplicating reconciliation. Retain sufficient resolution evidence before
  source/plan cleanup so dependents remain understandable afterwards.

**UI:** The developer is choosing a story to execute or inspecting why it must
wait. The dependent story card's expandable Dependencies section makes the
start block apparent before expansion, for example "Dependencies · 2 blocking".
Beside the unavailable Start execution action, explain that prerequisites remain
unresolved. Inspection and Start refinement remain available; dependency
blocking does not prevent understanding or preparing the story.

On expansion, the developer can identify and follow each supplying story,
read why sequencing is necessary and what would fulfill it, and distinguish
waiting, satisfied, and developer-decision-needed outcomes in text. A needed
decision states the actual question rather than merely labeling a failure.
Available resolution evidence remains inspectable, including when the supplying
story's current records have been cleaned up. A satisfied relationship does
not count as blocking.

After supplier resolution is published, refresh shows the remaining blockers
without moving the card, changing backlog order, or losing keyboard focus.
When all are resolved, remove the dependency-derived start block while retaining
other preparation judgments and execution requirements. An unreadable dependency
record is an evidence gap with its cause and available source link, never a
claim that there are no blockers; retry the read when retrieval can recover it.
Use text as well as visual treatment and support keyboard, touch, and narrow
screens. No separate relationship screen or whole-backlog graph is needed.

**Key examples:**

- **Encouraged internal dependency:** Two externally valuable stories share a
  row representation. Contributors establish a common architectural direction
  and/or implement independently and reconcile through PFE at integration.
  Both stories can execute in parallel; no blocking record or visualization
  is created merely because their solutions depend on each other.
- **Necessary sequence:** A shared implementation transition would leave the
  dependent story building against incompatible assumptions, and ordinary
  design/reconciliation cannot reasonably avoid the resulting disorder. A
  blocking prerequisite is recorded with that explanation. Starting the
  dependent story is prevented until the prerequisite completes and the
  dependency is resolved. The dependent card explains the block.
- **Two prerequisites:** A story has two justified blocking dependencies. One
  supplying story completes; its landing agent finds the consumer and resolves
  that relationship. The other dependency still blocks starting the story.
  Resolving the second removes the dependency-derived start block.
- **Moderate reconciliation:** A supplying story completes with a bounded
  difference from the consumer's recorded assumption. The supplying agent
  attempts reconciliation using the consumer's goal and scope. Its dependency
  stays unresolved until reconciliation succeeds.
- **Developer decision:** Reconciliation requires choosing a behavior that the
  dependent story does not settle. Stop that reconciliation and retain the
  start block with the decision needed; wait for the developer. Expanding the
  dependent card exposes that question and the relevant supplier evidence.
  The developer can still inspect or refine the dependent story.
- **Published resolution and refresh:** The card shows two blockers. One
  resolution is published and the developer refreshes; one blocker remains,
  the satisfied relationship stays inspectable, and execution stays unavailable.
  After the second resolution is published, refresh removes the dependency
  block but preserves an unrelated Not ready judgment. Card position and focus
  survive both updates.
- **Unreadable evidence:** A dependency record cannot be interpreted or fetched.
  Inspecting the card shows the affected evidence gap rather than zero blockers.
  A successful retry restores the published dependency facts; the actual start
  workflow still checks its source before claiming or launching execution.
- **Cleanup and repeated visits:** Landing resolves a dependency. Later wrap-up
  preserves that outcome and its evidence instead of applying the change again.
  Missing source records without fulfillment evidence never imply completion.

**Deferred promises:** Informational or speculative dependencies that allow
parallel execution, close multi-agent collaboration, a whole-backlog graph,
a separate focused relationship view, automatic scheduling, and reprioritizing
the backlog are outside this delivery. These exclusions add no speculative
machinery or universal rejection rules.

## Recording Recommendation

Keep one authoritative dependency record in the dependent story's canonical
seed section, using stable story identities. Landing/wrap-up discovers reverse
references for its update work without maintaining another authoritative copy
or exposing a reverse UI. A plan may refer to the same agreement.

Proposed content: supplying story identity, relevant shared implementation,
why the sequence is necessary, completion condition, current resolution, and
evidence. The dependent story provides the other endpoint by context. Agent
profile names are not durable dependency identities. The dependency is not
inferred from prose mentions alone. The slice plan selects a separate versioned
dependency block in this canonical home, interpreted by shared pure readers.

## Planning Decisions

- Completion combines the selected supplier's evidenced outcome with accepted
  delivery to the integration target. An increment landing or cleanup alone
  does not qualify. Preserve evidence at a recoverable revision before deletion.
- Dependency blocking is a separate execution condition. Resolution preserves
  unrelated readiness reasons and the existing changed-review indication;
  it neither renews Ready nor authorizes execution.
- Discover consumers through current canonical homes; retain historical supplier
  evidence in each consumer's record without maintaining a reverse registry.
- Interruption/recovery for a blocker discovered after execution starts is
  outside this start-gate policy. Leave that case for a developer decision.
- **Selected reconciliation boundary:** Update dependency evidence and existing
  story/plan assumptions only, within the dependent story's established intent.
  Each story owns its own goal; supplier completion does not authorize
  implementing the unstarted consumer. If satisfying the condition still needs
  consumer implementation or an unsettled product decision, retain the block
  and report that need rather than clearing it through assumption edits.

**Slice plan:** [Necessary blocking story dependencies](../slice-plans/216-blocking-story-dependencies/PLAN.md).

## Future Direction — Not Current Scope

Two kinds may eventually be useful: blocking dependencies that prevent a
story from starting, and informational dependencies that expose a speculative
relationship while permitting parallel execution and decentralized
collaboration. Future collaboration should further reduce the need to block
stories, while encouraging shared internal solutions. Do not introduce the
informational kind or build its supporting mechanisms in this story.

## Research and Project Context

- Accepted [ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md)
  supplies the story vocabulary and canonical seed ownership;
  [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  supports decentralized integration, PFE, cohesion, and one authoritative
  record per fact. Its principle 2 clarification was authorized by Terry and
  remains an uncommitted draft alongside this refinement.
- [LeSS coordination and integration](https://less.works/less/framework/coordination-and-integration)
  supports direct coordination and continuous integration as normal practice.
- [Linear issue relations](https://linear.app/docs/issue-relations) and
  [project dependencies](https://linear.app/docs/project-dependencies) supply
  directional-label and resolution precedents. They do not decide Open
  Dough's threshold for introducing blocking dependencies.
- The original automatic-readiness idea used Doughnut's `SEED-064#story-6`
  shared-row prerequisite as motivation. That identity belongs to Doughnut,
  not this repository. Supplier-driven resolution is now the selected trigger.

## Refinement Decisions and Breadcrumbs

- 2026-09-26: Terry requested capture and visualization of beneficial
  implementation waits while preferring ordinary collaboration.
- 2026-10-02: Terry started refinement, selected dependency details only inside
  the dependent story card, and assigned updates to the supplying story's
  landing/wrap-up with simple, moderate, and developer-decision cases.
- 2026-10-02 clarification: internal solution dependencies are encouraged;
  visualized blocking sequences are exceptional. This delivery blocks starting
  the dependent story; informational dependencies are future scope. This
  supersedes the earlier partial-work-wait proposal and sketches, including
  their suggestion that filtering work could start while integration waited.
- 2026-10-02: Terry requested a slice plan. Four Behavior slices are recorded;
  the reconciliation authority question remains open. Planning is authorized,
  implementation is not. Preserve the current backlog position.
- 2026-10-02 UX/UI refinement: made the developer's inspection, unavailable
  execution action, decision feedback, published refresh, and evidence recovery
  journey explicit using the existing dashboard direction. No additional view
  or dependency kind is proposed; reconciliation authority remains unresolved.
- [Product backlog](../PRODUCT-BACKLOG.md).

- 2026-10-02: Terry selected the narrower reconciliation boundary: evidence and
  story/plan assumptions only; dependent implementation needs its own execution
  authorization. Stories deliver user value rather than separate technical
  layers. This settles the previously open slice 4 authority question.
