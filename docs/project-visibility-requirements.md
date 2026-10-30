# Project visibility and state requirements

**Status:** Requirements captured for discussion; not a seed, execution plan, or ADR.

**Date:** 2026-09-19

**Source:** Terry Yin's direction in the project-visibility discussion.

**Updated:** 2026-10-30, for the current three-perspective direction and enduring intended behavior.

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

The dashboard has three independent but related dimensions: changing work,
the current product's intended behavior, and implementation structure. The
story perspective is delivered; the other two remain design direction. These
are conceptual perspectives, not a requirement for three panes or any other
presentation. Their UX/UI remains a separate design discussion.

### User-story perspective: the project's dynamics

This perspective shows how ideas move through planning, learning, and execution
to affect the product. Stories express intended changes or possibilities worth
exploring. They can cross existing product and structural boundaries and evolve
through refinement and execution. They are not the permanent definition of the
product they change.

The repository-backed backlog, Taken state, assignments, execution modes, and
slice progress provide published evidence of that work. The delivered dashboard
also exposes local sessions, with their operational evidence kept distinct from
published story facts. Completing a story and cleaning up its planning records
does not remove the product's maintained definition or verification.

### Intended-behavior perspective: the current product

This perspective describes what the current product is meant to do and why.
Its account endures beyond the stories that introduce or change behavior,
while being maintained for the product's current revision. Enduring does not
mean frozen: an intentional product change updates the account. A regression
is contrary evidence about fulfillment of an expectation, not a reason to
silently delete that expectation. Accidental implementation behavior is not
automatically intended behavior, and future wishes do not belong in the
current baseline.

The existing **Feature** concept names external behavior users care about,
with maintained definition, design, and automated verification. This direction
clarifies its enduring intended meaning without completing a product-wide
rename. The best name remains open: **feature**, **intent**, **intention**, or
**product intent**. “Product intent is the maintained definition of what the
current product is meant to do and why” is a working explanation. Product
specification and behavioral contract are other suggested formulations, not
selected replacements. A defined capability does not itself establish that
a particular user's goal has been achieved.

#### Purpose and proof

Purpose and proof are proposed aspects of this account:

- **Purpose** expresses the expected behavior and why it matters: the
  maintained descriptive side.
- **Proof** concerns executable verification and evidence of whether the
  implementation fulfills that expectation. Verification procedures can be
  maintained artifacts; the results of particular executions are observations.

This conceptual distinction selects no separate stores, catalogs, files,
or services.

#### Interpreting verification evidence

Duration, supporting evidence, and when verification last ran are exploratory
considerations. Revision, environment, coverage, freshness, and result may help
interpret an observation. Their scope remains open: they are not mandatory
fields, a finalized state model, or a promise to collect and display them.

A passing check supports the claim it actually observed under its conditions;
it does not establish universal correctness. A pass on an older revision must
be assessed for relevance to the current product. An absent result is missing
evidence, not a passing or failing result. Missing, stale, partial, and conflicting
evidence remain distinguishable rather than collapsing into a single verdict.
A check's runtime describes verification cost; it does not by itself measure
the product's performance. A slow verification run alone therefore does not
establish a product performance defect.

### Structural perspective: the product's architecture

This perspective describes the logical organization of the implementation.
That organization maps to the domain model and connects it to packages,
folders, files, and functions.

Stories, intended behavior, and structure are independent related dimensions,
without a required one-to-one mapping or containment hierarchy. One story can
change several intentions and structural elements; one intention can endure
through many stories and involve several structural elements. Mapping and
filtering could help reveal those relationships, but no recording, derivation,
or navigation mechanism has been selected.

The architectural North Star may belong in this perspective. Its placement
remains open; temporary architectural direction and implemented structure are
distinct information.

<a id="initial-scope"></a>

### Delivered scope and further direction

The implemented dashboard provides the story planning and execution perspective,
including its existing local-session capabilities. The maintained
[dashboard guide](../dashboard/README.md) and
[agent launch contract](../dashboard/AGENT-LAUNCH.md) describe those capabilities.
The intended-behavior and structural perspectives remain future design work.
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

Use experience with the delivered story dashboard and development workflows
to learn which information helps people understand and direct work. Further
perspectives and interactions should grow from those needs, following the
just-in-time principle rather than completing a predetermined visual system.

## Questions retained for later design

The following choices remain open:

- Which name best communicates the enduring intended-behavior account, while
  preserving its relationship to the existing Feature concept.
- How purpose and proof should be represented, and which execution information
  is useful. Duration, evidence, last-run time, revision, environment, coverage,
  freshness, and result are considerations, not a selected schema.
- How the intended-behavior and structural perspectives should work in the UX/UI.
  No new tabs, panels, layouts, interactions, or presentation states are chosen.
- How relationships among stories, intended behavior, and structure would be
  recorded or derived, including expected impact versus observed change, and
  whether mapping or filtering would help.
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

The [story dashboard](../dashboard/README.md) provides the current planning and
execution view. Its published story records and local-session capabilities
follow their maintained contracts; the original remote-only delivery boundary
does not restrict today's product. The
[delivery direction](dashboard-delivery-direction.md) explains the separation
of published and machine-local evidence, not a requirement to remove delivered
capabilities while exploring another perspective.

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
