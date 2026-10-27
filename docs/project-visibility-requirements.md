# Project visibility and state requirements

**Status:** Requirements captured for discussion; not a seed, execution plan, or ADR.

**Date:** 2026-09-19

**Source:** Terry Yin's direction in the project-visibility discussion.

**Updated:** 2026-10-02, to distinguish shared solutions from blocking story dependencies.

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

The dashboard will develop incrementally. This document captures its intended
perspectives, sources of state, and local maintenance requirement, without
prescribing a complete dashboard or its implementation.

## Three perspectives

The longer-term idea is a dashboard with three independent but related
dimensions: user stories, features, and structure. These might appear as panes,
panels, or separate views; the physical layout is not decided.

### User-story perspective: the project's dynamics

This perspective shows how ideas move through development and eventually become
assimilated into the product. It explains the project's changing work rather
than serving as a catalog of its implemented capabilities.

Stories express intended changes. As ideas, they do not yet have the settled
design and boundaries of implemented behavior. A story can cross several
features and areas of the code; it need not fit within one existing product or
structural boundary. This distinction does not remove the existing disciplines
of story refinement and execution.

The repository-backed backlog, Taken state, execution modes, and completed
slices described below provide the initial basis for this perspective.

### Feature perspective: the product's implemented behavior

Features represent external behavior that users care about. They are already
implemented, well defined, designed, maintained, and protected by automated
tests. A feature describes a product capability; it is not itself a promise
that a particular user need has been satisfied or a story's desired outcome
achieved.

This perspective shows the product's existing behavioral capabilities. Filtering
by a story should reveal the features involved in, or expected to be affected
by, that story. Features and stories are distinct concepts, with no required
one-to-one correspondence.

### Structural perspective: the product's architecture

This perspective shows how the code is organized logically. The logical
organization should map directly to the domain model and connect that model
to code packaging, folders, files, and functions.

Structure is a dimension independent of features and stories. Neither features
nor stories have a required one-to-one mapping to structural elements. A
story-based filter should bring the relevant parts of the structure into view,
helping the developer understand the architectural context of that work.

The architectural North Star artifact may also belong in this perspective.
That placement remains tentative; temporary architectural direction and the
structure already implemented are distinct information.

### Initial scope

Start with the user-story perspective, potentially keeping it as the only
implemented perspective for the foreseeable work. The feature and structural
perspectives preserve the broader idea for later exploration; they are not
prerequisites for the first useful view or commitments to build all three.

### Board and zoom

Terry expects an **animated Board with connected Columns of work**, rather than
just a list. The direction includes zooming out for the whole picture and
zooming or focusing in to read relevant work. Canvas is permitted but not
required. Terry explicitly clarified that this UX ambition must follow the
just-in-time principle: build interactions to support the current story's goal,
not to complete the visual concept ahead of a need.

Initially, existing backlog evidence supports **Backlog** and **Taken**
regions, containing work cards in their recorded order. Zoom exposes the title, identity, membership,
priority where recorded, and source links already in the snapshot. It does not
require adding metadata or interpreting story/plan contents in the first story.
Richer Columns and detail follow when their evidence and semantics are selected.
The first story requires a readable connected overview and access to each
entry's evidence. Ordinary layout, wrapping, and scrolling can serve that goal;
general pan/zoom, multiple detail levels, and animated card travel are not
prerequisites. Add the smallest navigation or transition only when it improves
reading or orientation with this story's actual data.

Motion should explain navigation and changes between successfully retrieved
snapshots, such as the same work becoming Taken. It must not imply continuous
agent activity or animate an imagined path through unobserved states. Missing
work does not automatically move to Done. Reading and navigation must remain
available by keyboard and on narrow screens. When zoom is introduced, provide
a way to regain the overview; when motion is used, reduced-motion preferences
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

Terry intends to experiment more with Trunk Mode using one agent before
introducing parallel execution. Those journeys can help mature the lifecycle
and reveal what information is useful to display. This is a learning direction,
not a requirement to build the entire dashboard before parallel work begins.

## Questions retained for later design

The following considerations arose in discussion but are not settled design
decisions:

- How to distinguish recorded progress from live activity. A Taken entry alone
  does not establish that an agent is currently running.
- How to show freshness and missing evidence. A remote view cannot see
  unpublished local changes, and unavailable local state does not mean idle.
- How existing backlog and plan records expose sufficient information without
  introducing a duplicate status representation that can drift.
- How the dashboard accesses local evidence, and how later story facts expand
  the Board view without imposing a false linear lifecycle.
- How story-to-feature and story-to-structure relationships would be recorded
  or derived, including the distinction between expected impact and observed
  changes, if those later perspectives are pursued.
- Whether and how North Star artifacts belong in the structural perspective.
- The Taken-item field format and how mode, developer assignment, and origin
  branch information are kept consistent through execution and closure.
- How circular name allocation avoids simultaneous claims and distinguishes
  separate assignments when names are reused.
- Whether to introduce a commit mailbox and timeout-based handover, including
  how to transfer ownership safely when the former agent might still be active.

No GUI technology, state schema, lock protocol, background service, distributed
scheduler, or dashboard control interface is selected by this document.

## Relationship to existing work and decisions

The remote-only [story dashboard](../dashboard/README.md) precedes
same-machine visibility. Its overview uses existing backlog membership and
links; new entry metadata and persisted story states remain outside it.
It begins the Board direction with readable entry facts from the same
snapshot rather than fetched story/plan detail. The broader zoom and animation
ambition does not expand this outcome into a general navigation system.
Its required setup includes one Playwright behavioral suite connected to current
CI, alongside type checking, lint, and a production build.

The [product backlog](../.planning/PRODUCT-BACKLOG.md) retains the near-future
direction of parallel story execution through trunk-based development in
separate worktrees. Owned workspaces are independent of the default checkout, and its refresh is
optional. Installed execute-plan
publication and default-checkout maintenance guidance apply the shared remote
publication contract to implemented workflows.
These requirements supply refinement context; the backlog owns priority and
execution records own delivery evidence.

[ADR 0002 — Software development lifecycle principles](adrs/0002-software-development-lifecycle-principles-accepted.md)
supports learning through small valuable increments and decentralized
coordination through continuous integration. The incremental exploration here
follows that direction.

The domain concepts and architectural boundaries are defined in
[Accepted ADR 0008 — Project dashboard domain and architecture](adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
Detailed requirements and exploratory ideas stay here.
Under
[ADR 0000 — Use Architectural Decision Records](adrs/0000-use-adrs-accepted.md),
architectural acceptance remains a separate human-owned process. This document
does not accept or supersede an ADR.
