# Project visibility and state requirements

**Status:** Requirements captured for discussion; not a seed, execution plan, or ADR.

**Date:** 2026-09-19

**Source:** Terry Yin's direction in the project-visibility discussion.

## Purpose

Open Dough should provide a graphical view of a project's progress so a
developer can understand what is happening as agent work becomes more complex.
Terry expects a visual view to make that work easier to grasp and control; this
is a product hypothesis to explore through incremental delivery.

Story branches currently provide a clear boundary around unfinished work, and
Terry has deliberately avoided running dependent stories in parallel. With
continuous trunk integration and eventually more concurrent work, those
boundaries will become less obvious. The view should help the developer
understand the project across stories and agents.

The dashboard will develop incrementally. This document captures its intended
perspectives, sources of state, and local coordination requirement, without
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

### Connected stages and zoom

Terry expects an **animated stage with connected stages of work**, rather than
just a list. The direction includes zooming out for the whole picture and
zooming or focusing in to read relevant work. Canvas is permitted but not
required. Terry explicitly clarified that this UX ambition must follow the
just-in-time principle: build interactions to support the current story's goal,
not to complete the visual concept ahead of a need.

Initially, existing backlog evidence supports connected **Backlog → Taken**
regions, containing work cards in their recorded order. The connection shows
the taking-work relationship; it does not establish dependencies between stories
or a mandatory full lifecycle. Zoom exposes the title, identity, membership,
priority where recorded, and source links already in the snapshot. It does not
require adding metadata or interpreting story/plan contents in the first story.
Richer stages and detail follow when their evidence and semantics are selected.
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

The [UX/UI North Star](dashboard-ux-ui-north-star.md#connected-stages-and-spatial-navigation)
owns the revisable layout and interaction guidance. These visual work stages
are distinct from the two capability-delivery stages below.

## Two stages of the direction

### Stage 1: published Git state across independent machines

Build the initial story perspective using only state published to Git origin:
remote branches and their committed contents and history. Treat developers as
working on separate machines, with no shared local checkout or operational
state available to the dashboard. This is the first stage's working model, not
a requirement to place agents on physically different machines.

All state used to depict progress in this stage must be available from origin.
Unpushed commits, working-tree edits, local branches, locks, and live agent
sessions cannot supply required information. The dashboard may fetch or cache
remote Git data; it must not need access to a developer's clone. Its view shows
published progress, not necessarily the latest work occurring on a machine.

This stage shows concurrent work published from independent clones or local
worktrees. Synchronization uses the common remote Git publication contract;
the dashboard reads its published evidence.

### Stage 2: multiple agents sharing one machine

Extend local coordination and visibility to multiple agents working in separate
worktrees of the same repository. Coordinate direct edits and refreshes of the
default checkout and use machine-local evidence to show its ownership and
freshness. Each owned workspace publishes through the same remote Git contract
used across independent machines.

This stage includes default-checkout coordination as described below. Its
mechanism remains to be designed. The remote Git view remains independently
useful, with local information supplementing published progress.

These stages describe the intended order of capability development. They do
not commit to building the feature or structural perspectives, or make the
exploratory mailbox and takeover mechanism prerequisites for Stage 1.

### Initial application constraints

Initially, the observed client project is hardcoded in the Open Dough dashboard
project. For the first story, Terry selected Open Dough's public GitHub `main`,
with local launch and no sign-in or hosted deployment. Authoritative state stays
in the observed repository. There is no
application/server database or separate persistent project-state store;
disposable browser storage for preferences or cache is permitted if useful.

The delivered [story dashboard](../dashboard/README.md) observes Open Dough,
Doughnut, and Pygardon, one selected project at a time. Its project catalog and
access boundary supply published records for the selected project. Further
story detail and assignment visibility are scoped in
[SEED-021](../.planning/seeds/SEED-021-observe-published-story-progress.md).

The implementation should have very strong typing. The
[dashboard technology recommendation](dashboard-tech-stack.md) proposes the UI,
runtime-validation, and test tooling; it remains a recommendation rather than
an accepted ADR or implemented stack. Playwright was the user's initial
candidate, with alternatives welcome. The living
[Dashboard UX/UI North Star](dashboard-ux-ui-north-star.md) guides the interface
and evolves as the dashboard is used. Its design hypotheses are revisable.

## Repository-backed project state

Most project state must remain in the project's Git repository and be published
to origin to become visible remotely. Access to that published Git state should
be sufficient for the dashboard to recover most of the project's recorded
status, even without access to a developer's local clone or temporary runtime
data.

The state available from the repository should include:

- Which stories are in the product backlog.
- Which stories are Taken.
- Whether a story has been refined or slice planned.
- The execution mode recorded for each active story.
- The developer name assigned to each Taken story.
- The origin branch carrying a Taken story's execution in Story Branch Mode.
- Which slices have been completed.

These facts must not depend on temporary files, an active agent session, or
retained conversation context. The dashboard should observe the project's
records rather than require the project to keep its durable workflow state
only inside the dashboard.

### Story states

Terry anticipates needing explicit story states for visualization, despite a
preference to avoid additional state-management overhead. Stories can exist
outside the product backlog; membership in the backlog is itself a meaningful
state, not a condition that defines whether a story exists.

The view should be able to distinguish backlog membership, Taken work, and
whether refinement and slice planning have occurred. The exact vocabulary,
transitions, and storage remain open. These facts need not form a single linear
sequence: this document does not decide whether to represent them as one state
or several attributes, or require every story to pass through slice planning.
Prefer deriving facts from authoritative repository records where sufficient;
decide what additional explicit metadata is needed through concrete dashboard
stories.

### Recently finished stories

A view of recently finished stories is an open possibility, potentially useful
for review or testing. A maintained completion list existed previously and was
removed because the information was already recoverable from Git history and
was not useful enough to retain separately.

Visualization may create a new reason to show that information. First explore
recovering it from Git history rather than restoring a maintained completion
list. Whether the view is needed, what counts as recently finished, and whether
any additional durable record is justified should be decided by the dashboard
stories that require it. This document does not restore a completed section in
the backlog or change the current wrap-up cleanup behavior.

### Taken-item information

The backlog needs enough information on each Taken item to identify its owner
and interpret its execution:

| Information | Requirement |
| --- | --- |
| Developer name | Record which named agent has taken the story. |
| Execution mode | Distinguish Story Branch Mode from Trunk Mode. |
| Origin execution branch | For Story Branch Mode, identify the story's branch on origin so a repository reader can locate its published progress. Trunk Mode does not require this story-branch field. |

Here, origin execution branch means the branch carrying the story's work, not
the base branch from which it was created. Exact field syntax and representation
remain to be designed. Local worktree paths and local branch details should be
derived from dynamic machine information when available, rather than required
as durable backlog fields for the repository-only view.

This is a requirement for extending backlog behavior. Existing Taken entries
have not been assigned invented developer names or branch metadata by this
document, and the backlog scripts and workflow guidance still need corresponding
implementation work.

### Rotating developer names

Maintain a list of developer names used in circular rotation. When an agent
starts a task or story, it assigns itself an available name from that list.
For a Taken story, record that name on its backlog entry so the developer and
other agents can identify who owns the work.

These names identify agent developers; they need not be the names of human
contributors. The list, allocation record, and assignment lifecycle need a
design that supports repository-backed ownership visibility. Simultaneous
allocation, availability, release, and safe reuse are unresolved details.

This outcome is queued as
[See who owns Taken work and where it is being executed](../.planning/seeds/SEED-021-observe-published-story-progress.md#identify-taken-work-owner),
after the initial overview and readiness/slice view, before execution-branch
inspection. It includes workflow-produced assignment and dashboard display;
it does not expand the first story or include the messaging idea below.

### Future messaging and handover

A later possibility is to address messages to a named developer through a
commit mailbox or a similar repository-backed mechanism. Another agent or a
human could send a message and wait for that developer's response.

Terry suggested a response deadline, for example ten minutes, after which the
developer could be considered gone and someone else could continue the work.
The mailbox mechanism, deadline, and takeover protocol are exploratory, not
requirements for the first dashboard phase.

An unanswered message establishes a lack of observed response, not proof that
the previous agent has stopped. Later design must settle how reassignment
prevents competing owners, how a late response or returning agent is handled,
and how recycled names remain distinguishable from earlier assignments.

## Limited machine-local state

Some operational state belongs to a development machine and its local
repository. It need not be committed to Git. Git-ignored files are one possible
representation; the storage mechanism is not selected here.

The first identified example is exclusive access to the default local checkout
for direct edits and refreshes. Participating writers share one local ownership
mechanism across worktrees:

- Acquire access before inspecting and mutating the checkout, index, or branch
  for a direct edit or refresh.
- Retain access through the owned operation until safe release or explicit
  recovery/handoff.
- Writers awaiting this checkout continue independent work and remote
  publication from their own workspaces.

The remote trunk is the integration authority under the direction in
[ADR 0009](adrs/0009-git-branching-and-integration.md). Reconciliation and
publication happen in owned workspaces. Local ownership protects the default
checkout's files and Git state.

### Refreshing the default checkout

After each trunk publication, attempt a coordinated refresh. A clean checkout
that is only behind fetched trunk advances by fast-forward. Pending edits,
unpublished commits, active operations, or unclear ownership preserve their
state and produce a visible deferred-refresh result. Publication success and
checkout freshness are reported separately.

Before using the default checkout's revision as a new task's base, verify it
against freshly fetched trunk. A task can create its owned worktree directly
from the fetched base while checkout maintenance is pending. Including local
unpublished work requires a deliberate ownership and dependency decision.

### Quick edits in the default checkout

Allow short, prepared changes directly in the default checkout under the same
local ownership mechanism used for refreshes. Inspect the current state, apply
the bounded change, verify and commit the owned result, and leave a recoverable
state at release. Preserve other writers' staged and working-tree content.
The direct-edit owner follows the shared remote publication contract and its
established publication authority.

“Quick” describes the operation's shape:

- The intended change is already decided and bounded.
- Required discussion and investigation are complete before acquiring access.
- The change can be verified and committed promptly.

Updating a known backlog field is a representative quick action. Story
refinement and slice planning use owned workspaces. Reuse a suitable workspace
through related preparation, publish explicitly retained results to remote
trunk, then clean up when publication and session ownership permit it.
The origin-based dashboard observes the published records.

If a direct edit is interrupted or needs further discussion, preserve its work
and establish a safe recovery or handoff before another writer mutates the
checkout. A timeout can identify an operation needing attention; release
requires evidence that ownership has been resolved.

### Coexistence with human edits and other tools

Human developers and other tools can change the default checkout independently
of the participating agents' coordination mechanism. Inspect its state after
acquiring access and revalidate before a mutation where practical. Preserve
unowned edits, staged content, unfinished Git operations, and unexpected branch
or revision changes; report the observed ownership issue and resume after it is
resolved. Re-read current state when resuming and reconcile the owned work with
fresh remote history.

Representative cases include a human's staged edit before refresh, a commit
made while an agent awaits checkout access, and an edit made during an agent's
owned operation. Each case preserves the human's work and the agent's prepared
result, with a visible maintenance outcome. Another agent's owned worktree can
continue publishing independently.

An advisory mechanism coordinates its participants. Detection of external edits
is limited by observable state and races between inspection and mutation.
Refinement owns the precise checks, waiting behavior, and recovery interaction.

## Combining the two sources in the dashboard

The dashboard should provide useful project visibility from repository state
alone. When it also has access to a machine's local operational state, it should
use that evidence to provide more detailed information about activity on that
machine, such as default-checkout ownership, deferred refresh, or waiting where
those facts are recorded.

| Source | Intended information | Availability |
| --- | --- | --- |
| Git origin | Durable published backlog and execution progress | Without access to a developer's local clone |
| Machine-local state | Default-checkout ownership, freshness, and deferred refresh | When that machine's state is accessible |

The local layer supplements the repository layer; durable project progress
should not become dependent on the local layer.

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
- Where to store default-checkout ownership shared across worktrees, how to
  acquire it atomically, and how to recover safely after interruption.
- How to detect and recover from edits by writers who bypass the lock, including
  races during an operation and safe handoff when a quick edit becomes blocked.
- Whether waiting needs an explicit queue, including ordering and fairness.
  Exclusive access alone does not define these behaviors.
- How existing backlog and plan records expose sufficient information without
  introducing a duplicate status representation that can drift.
- Whether completed-work views should reconstruct deleted plans from Git
  history or require another durable summary.
- How the dashboard accesses local evidence, and how later story facts expand
  the connected-stage view without imposing a false linear lifecycle.
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

The first remote-only dashboard increments are decomposed in
[SEED-021](../.planning/seeds/SEED-021-observe-published-story-progress.md).
They precede same-machine coordination; the seed does not authorize execution.
The refined first story uses existing backlog membership and links; new entry
metadata and persisted story states remain outside its selected overview scope.
It begins the connected-stage direction with readable entry facts from the same
snapshot rather than fetched story/plan detail. The broader zoom and animation
ambition does not expand this outcome into a general navigation system.
Its required setup includes one Playwright behavioral suite connected to current
CI, alongside type checking, lint, and a production build.

The [product backlog](../.planning/PRODUCT-BACKLOG.md) retains the near-future
direction of parallel story execution through trunk-based development in
separate worktrees. The existing
[default-checkout coordination story](../.planning/seeds/SEED-008-worktree-branch-trunk-sync.md#same-machine-merge-queue)
captures local access for direct edits and refreshes. Installed execute-plan
publication and default-checkout maintenance guidance apply the shared remote
publication contract to implemented workflows.
These requirements supply refinement context; the backlog owns priority and
execution records own delivery evidence.

[ADR 0002 — Software development lifecycle principles](adrs/0002-software-development-lifecycle-principles-accepted.md)
supports learning through small valuable increments and decentralized
coordination through continuous integration. The incremental exploration here
follows that direction.

The emerging domain concepts and architectural intentions are summarized in
[ADR 0008 — Project dashboard domain and architecture](adrs/0008-project-dashboard-domain-and-architecture.md),
which remains Proposed. Detailed requirements and exploratory ideas stay here.
Under
[ADR 0000 — Use Architectural Decision Records](adrs/0000-use-adrs-accepted.md),
architectural acceptance remains a separate human-owned process. This document
does not accept or supersede an ADR.
