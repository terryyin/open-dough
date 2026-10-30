# Project visibility and state requirements

**Status:** Requirements captured for discussion; not a seed, execution plan, or ADR.

**Date:** 2026-09-19

**Source:** Terry Yin's direction in the project-visibility discussion.

**Updated:** 2026-10-30, for Development, Product intent, and Structure.

## Purpose

Open Dough should provide a graphical view of a project's progress so a
developer can understand what is happening as agent work becomes more complex.
Terry expects a visual view to make that work easier to grasp and control; this
is a product hypothesis to explore through incremental delivery.

Stories represent external value and may share internal solutions while
executing in parallel. Follow [ADR 0002](adrs/0002-software-development-lifecycle-principles-accepted.md#2-decentralized-coordination-through-continuous-integration-of-user-centric-work)
for shared design, reconciliation, and exceptional blocking sequences. The
dashboard should make necessary waits understandable without presenting
ordinary internal dependencies as barriers to parallel work.

The dashboard develops incrementally. This document owns the detailed account
of its three perspectives, sources of state, and open design questions.
[ADR 0001](adrs/0001-ubiquitous-language-accepted.md#dashboard-product-concepts)
supplies the shared vocabulary,
[ADR 0008](adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
the cross-task architectural boundaries, and the
[UX/UI North Star](dashboard-ux-ui-north-star.md) the current interface direction.

## Three perspectives

The dashboard has three independent but related perspectives: Development,
Product intent, and Structure. They describe the ongoing work of shaping the
product, its current intended behavior, and its implementation organization.
The current dashboard presents Development through stories, recorded progress,
and local sessions. Product intent and Structure remain further design work.

### Development perspective: the project's ongoing work

Development is the continuous effort to shape the product through exploration,
decomposition, refinement, planning, execution, verification, integration,
and learning. This perspective shows the attempts being pursued, their progress,
and the evidence of their outcomes. Lasting results are assimilated into the
maintained product intents and structure; learning informs subsequent
attempts, including when the product remains unchanged.

A Story is a unit of planning within Development. It expresses an intended
change or possibility worth exploring, can cross product intent and structural
boundaries, and evolves through refinement and execution.

The repository-backed backlog, Taken state, assignments, execution modes, and
slice progress provide published evidence of that work. The delivered dashboard
also exposes local sessions, with their operational evidence kept distinct from
published story facts. Completing a story and cleaning up its planning records
does not remove the product's maintained definition or verification.

### Product intent perspective: the current product

Product intent is the maintained definition of intended behavior: what the
current product is meant to do and why. Product intents endure beyond the
stories that introduce or change them and describe the product at its current
revision. An intentional product change updates the relevant product intents.
A regression supplies contrary evidence about fulfillment while the product
intent remains the expectation to evaluate. The current account contains
adopted expectations; future possibilities stay in planning.

Each Product intent contains two sub-concepts: Purpose and Proof.

#### Purpose

Purpose expresses the expected behavior and why it matters: the maintained
descriptive part of a Product intent.

#### Proof

Proof concerns executable verification and evidence of whether the
implementation fulfills a Product intent. Verification procedures are
maintained artifacts; the results of particular executions are observations.
Storage and presentation remain separate design choices.

##### Interpreting verification evidence

The [initial Intent workspace](dashboard-ux-ui-north-star.md#initial-intent-workspace)
selects test-file browsing, switchable side-by-side or tabbed Purpose/Proof,
last-validation and duration observations, hierarchical group statistics, and
story-scoped inspection. Revision, environment, coverage, freshness, and result
help interpret available observations. Proof collection, revision matching, and
exact aggregation remain open design questions.

A passing check supports the claim it actually observed under its conditions.
A pass on an older revision must be assessed for relevance to the current
product. An absent result communicates missing evidence. Missing, stale,
partial, and conflicting evidence remain distinguishable. A check's runtime
describes verification cost; evaluating the product's performance requires
observations of that product behavior.

### Structural perspective: the product's architecture

This perspective describes the logical organization of the implementation.
That organization maps to the domain model and connects it to packages,
folders, files, and functions.

Development, Product intent, and Structure are independent related perspectives.
Development creates, changes, and maintains product intents and structure.
Relationships can be many-to-many: one story can affect several product intents
and structural elements; one product intent can endure through many stories and
involve several structural elements. Mapping and filtering could help reveal
those relationships. Their recording, derivation, and navigation remain open
design choices.

The architectural North Star may belong in this perspective. Its placement
remains open; temporary architectural direction and implemented structure are
distinct information.

<a id="initial-scope"></a>

### Delivered scope and further direction

The implemented dashboard presents Development through story planning,
execution progress, and its existing local-session capabilities. The maintained
[dashboard guide](../dashboard/README.md) and
[agent launch contract](../dashboard/AGENT-LAUNCH.md) describe those capabilities.
The Product intent and Structure perspectives remain future design work.
Their meaning is useful now without making their implementation a prerequisite
for the existing dashboard or committing to build all three.

### Board and zoom

Terry expects an **animated Board with connected Columns of work**, rather than
just a list. The direction includes zooming out for the whole picture and
zooming or focusing in to read relevant work. Canvas is permitted but not
required. Terry explicitly clarified that this UX ambition must follow the
just-in-time principle: build interactions to support the current story's goal,
not to complete the visual concept ahead of a need.

The delivered Board presents Backlog, Taken, and Recently done, with Story
cards and local Session entries as defined by
[ADR 0008](adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts).
Published records support membership, order, source links, and the available
story, assignment, and slice facts. Local sessions retain their own evidence.
The current [navigation guidance](dashboard-navigation.md) owns the interactions
that make this information readable. Broader zoom and animation hypotheses
remain subject to the selected reading need and available evidence.

Motion should explain navigation and changes between successfully retrieved
snapshots, such as the same work becoming Taken. It must not imply continuous
agent activity or animate an imagined path through unobserved states. Missing
work does not automatically move to Done. Reading and navigation must remain
available by keyboard and on narrow screens. When zoom is introduced, provide
a way to regain the whole Board; when motion is used, reduced-motion preferences
retain the same information and navigation without animation.

The [UX/UI North Star](dashboard-ux-ui-north-star.md#board-and-spatial-navigation)
owns the revisable layout and interaction guidance. These visual Columns
are distinct from the two capability-delivery stages below.

## Two stages of the direction

The [delivery direction](dashboard-delivery-direction.md) defines:

- <a id="stage-1-published-git-state-across-independent-machines"></a>[Stage 1: published Git state across independent machines](dashboard-delivery-direction.md#stage-1-published-git-state-across-independent-machines).
- <a id="stage-2-multiple-agents-sharing-one-machine"></a>[Stage 2: multiple agents sharing one machine](dashboard-delivery-direction.md#stage-2-multiple-agents-sharing-one-machine).
- <a id="initial-application-constraints"></a>[Initial application constraints](dashboard-delivery-direction.md#initial-application-constraints).

## Repository-backed project state

[Repository state](dashboard-repository-state.md) defines durable published facts:

- <a id="story-states"></a>[Story states](dashboard-repository-state.md#story-states).
- <a id="blocking-story-dependencies"></a>[Blocking story dependencies](dashboard-repository-state.md#blocking-story-dependencies).
- <a id="recently-finished-stories"></a>[Recently finished stories](dashboard-repository-state.md#recently-finished-stories).
- <a id="taken-item-information"></a>[Taken-item information](dashboard-repository-state.md#taken-item-information).
- <a id="agent-profiles-and-rotating-names"></a>[Agent profiles and rotating names](dashboard-agent-assignments.md#agent-profiles-and-rotating-names).
- <a id="future-messaging-and-handover"></a>[Future messaging and handover](dashboard-agent-assignments.md#future-messaging-and-handover).

## Limited machine-local state

[Machine-local state](dashboard-machine-local-state.md) supplements published facts:

- <a id="refreshing-the-default-checkout"></a>[Refreshing the default checkout](dashboard-machine-local-state.md#refreshing-the-default-checkout).
- <a id="quick-edits-in-the-default-checkout"></a>[Quick edits in the default checkout](dashboard-machine-local-state.md#quick-edits-in-the-default-checkout).
- <a id="coexistence-with-human-edits-and-other-tools"></a>[Coexistence with human edits and other tools](dashboard-machine-local-state.md#coexistence-with-human-edits-and-other-tools).

## Combining the two sources in the dashboard

The [source comparison](dashboard-machine-local-state.md#combining-the-two-sources-in-the-dashboard)
explains how local evidence supplements an independently useful repository view.

## Incremental learning

Use experience with the delivered Development view and development workflows
to learn which information helps people understand and direct work. Further
perspectives and interactions should grow from those needs, following the
just-in-time principle rather than completing a predetermined visual system.

## Questions retained for later design

The following choices remain open:

- How each project identifies its test locations and how proof observations
  are collected, matched to source revisions, and aggregated. The selected
  [initial Intent UX/UI](dashboard-ux-ui-north-star.md#initial-intent-workspace)
  owns the file browser, Purpose/Proof layout switch, runtime information,
  hierarchy, and story-scope direction; those choices are settled for design,
  while their implementation remains future work.
- Whether Start session belongs only in Development or remains visible as a
  project-level action across perspectives. Structure is deferred from the
  initial UI; its later UX/UI remains separate design work.
- How relationships among development work, its stories, product intents, and
  structure are recorded or derived beyond the initial changed-test-file lens,
  including expected impact versus observed change and semantic mappings.
- Whether and how architectural North Star artifacts belong in the structural
  perspective.
- Whether to introduce a commit mailbox and timeout-based handover, including
  how to transfer ownership safely when the former agent might still be active.

Further design must preserve the distinction between published progress and
local activity, missing and negative evidence, and observed facts and derived
views. Existing workflow and launch contracts own the implemented record and
session semantics. This document selects no new storage schema, proof
collection, service, scheduler, or dashboard control mechanism.

## Relationship to existing work and decisions

The [dashboard](../dashboard/README.md) provides the current Development view.
Its published story records and local-session capabilities follow their
maintained contracts. The
[delivery direction](dashboard-delivery-direction.md) explains the separation
of published and machine-local evidence. Those capabilities remain available
while another perspective is explored.

The [product backlog](../.planning/PRODUCT-BACKLOG.md) owns work priority.
Owned workspaces remain independent of the default checkout, whose refresh is
optional. Installed execution and default-checkout maintenance guidance apply
the shared remote publication contract to implemented workflows.
These requirements supply refinement context; execution records own delivery evidence.

[ADR 0002 — Software development lifecycle principles](adrs/0002-software-development-lifecycle-principles-accepted.md)
supports small valuable increments, incremental learning, and decentralized
coordination through continuous integration.

Detailed requirements stay here; domain concepts and architectural boundaries
belong in [Accepted ADR 0008 — Project dashboard domain and architecture](adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
[ADR 0000 — Use Architectural Decision Records](adrs/0000-use-adrs-accepted.md)
reserves architectural acceptance to humans. This document accepts or supersedes no ADR.
