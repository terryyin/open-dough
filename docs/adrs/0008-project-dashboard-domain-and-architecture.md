# 0008 — Project dashboard domain and architecture

**Status:** Proposed

**Date:** 2026-09-19

**Decision makers:** Terry Yin

**Consulted:** Terry Yin supplied the direction in the dashboard requirements
discussion; further advice pending.

## Context

Continuous trunk integration makes project progress harder to understand through
story branches alone. Stories can remain unfinished while their increments are
already integrated, and multiple developers can be progressing different work.
Open Dough should provide a graphical view that helps a developer understand
the project's work and progress.

The [project visibility requirements](../project-visibility-requirements.md)
retain the detailed behavior, examples, and exploratory ideas. This proposal
extracts the more stable domain distinctions and architectural intentions. It
does not select an implementation or authorize execution.

The living [Dashboard UX/UI North Star](../dashboard-ux-ui-north-star.md)
provides temporary interface direction and review criteria. Update it through
actual use without treating its design hypotheses as accepted architecture.
The [dashboard technology recommendation](../dashboard-tech-stack.md) separately
proposes a strongly typed stack; its tool choices are not accepted by this ADR.

## Decision

The following is proposed architectural intent, not an accepted decision.

### Domain concepts and relationships

| Concept | Intended meaning |
| --- | --- |
| Project | The product and development work being observed, with its repository as the durable home of workflow records. |
| Story | An intended change or possibility pursued for user or learning value. It may cross existing product and code boundaries, and can exist outside the backlog. |
| Product backlog | The selected, ordered work for the project. Membership is a workflow fact about a story, not the definition of a story. |
| Taken story | Work claimed for execution, with a recorded developer assignment. Taken does not prove that an agent is currently running. |
| Developer assignment | The association of a Taken story with the named developer carrying out its work. An agent can act as a developer; the assignment is distinct from the story's identity. |
| Execution mode | The workflow by which a story is executed and integrated. Story Branch Mode and Trunk Mode have different publication locations. |
| Slice plan and slice | A plan organizes bounded executable slices of a selected story. Recorded slice completion supplies progress evidence; a plan is not mandatory for every story. |
| Feature | Implemented external behavior that users care about, with maintained definition and design, protected by automated tests. It describes capability rather than a promise that a particular user's goal has been satisfied. |
| Structure | The logical organization of the product's implementation, expressed through its domain model and mapped to packages, folders, files, and functions. |
| Local workspace | A checkout in which a developer prepares changes. Several worktrees can share one local repository and integration target. |
| Integration lock | Machine-local ownership of access to the shared integration workspace, coordinating participating writers. It is neither story ownership nor proof of agent liveness. |

A story changes the product; features and structure remain descriptions of the
product after the story is complete. These are three related dimensions, not
a containment hierarchy. There is no required one-to-one mapping between a
story, a feature, and a structural element. Story-based filtering can expose
relevant features and structure without assigning each exclusively to a story.

Backlog membership, refinement, slice planning, and execution progress are
meaningful facts to expose. Their exact state model remains open; this proposal
does not impose a single linear lifecycle. Recorded facts must remain distinct
from inferred live activity and from expected future impact.

### Durable project state and local operational state

The project's repository owns durable workflow records. The dashboard reads
those records to construct its view; it is not an independent authority for
backlog membership, developer assignments, or progress. Any derived cache or
display model must be rebuildable from its sources rather than becoming the
only home of project state.

Initially, one observed project is hardcoded in the dashboard project. There
is no application/server database; optional browser storage is disposable.
This does not introduce project registration or a second authority for state.

The initial source is Git state published to origin, including relevant branch
contents and history. A reader must not need a developer's clone, unpushed
commits, agent conversation, or temporary runtime files to show published
progress. Fetching or caching remote Git data is compatible with this boundary.

For Taken work, the durable record identifies the assigned developer and
execution mode. Story Branch Mode also identifies its execution branch on
origin so the reader can locate published progress. Trunk Mode needs no remote
story-branch field. Local branch and worktree locations belong to the local
operational view rather than required remote backlog metadata.

Machine-local evidence later supplements this view with workspace and
integration activity. Its absence means that local activity is unknown.
Published progress remains visible independently of that local evidence.

```mermaid
flowchart LR
    G["Git origin: records, branches, history"] --> V["Derived project view"]
    L["Local workspace and coordination evidence: later"] -.-> V
    V --> S["Story perspective: first"]
    V -.-> F["Feature perspective: later possibility"]
    V -.-> A["Structural perspective: later possibility"]
```

These are logical responsibilities and information flows, not prescribed
services, processes, deployment units, or storage technologies.

### Observe coordination without owning it

Workflow behavior maintains the records and coordinates integration; the
dashboard observes the resulting evidence. A GUI must not be required for
agents to cooperate or for the project to retain its progress.

For multiple agents on one machine, participating writers share one integration
lock across their worktrees. Both integration and short, prepared edits in the
default checkout use that lock. Work of uncertain duration uses an owned
workspace so discussion or exploration does not hold up shared integration.
The detailed quick-edit and recovery requirements remain in the requirements
document.

This lock has local scope. Coordination across machines continues through Git
publication and reconciliation. Humans and tools may bypass the local lock,
so ownership alone cannot guarantee exclusive access. Integration must account
for observable intervening changes, preserve others' work, and pause when safe
continuation cannot be established. Universal exclusion of nonparticipants is
not promised.

### Incremental scope

1. Deliver the story perspective from published Git state alone, treating
   developers as using independent machines. This describes the available
   evidence, not a requirement for physically separate machines.
2. Add coordination and operational visibility for multiple agents sharing a
   local repository through worktrees.

Feature and structural perspectives remain future possibilities, not
prerequisites for either stage. Their domain distinctions should stay clear
without building their machinery in advance.

## Consequences

- The dashboard can be replaced or rebuilt without losing authoritative project
  progress, and the first useful view does not depend on local monitoring.
- Remote visibility is limited to published evidence. Taken work and an old
  update cannot establish that an agent is currently running or has stopped.
- Existing records will need sufficient consistent meaning for observation.
  Exact field formats and workflow changes need their own implementation work;
  this proposal does not make today's records sufficient by declaration.
- Story identity, developer assignment, execution mode, and workspace ownership
  remain distinguishable, avoiding accidental coupling to a temporary branch,
  recycled name, or lock holder.
- Local coordination adds recovery obligations and cannot eliminate semantic
  conflicts or prevent arbitrary writers from bypassing its protocol.

## Open design and related decisions

Exact story states, name rotation and reuse, messaging and takeover, recently
finished story views, North Star placement, lock protocols, and UI layout remain
open in the [requirements](../project-visibility-requirements.md#questions-retained-for-later-design).
No GUI framework, daemon, database, schema, or distributed scheduler is selected.

This proposal builds on
[ADR 0001 — Ubiquitous language](./0001-ubiquitous-language-accepted.md),
particularly its story and slice concepts, and
[ADR 0002 — Software development lifecycle principles](./0002-software-development-lifecycle-principles-accepted.md),
particularly whole-product understanding, continuous integration, direct domain
mapping, and incremental learning. No exception to either is proposed.

[ADR 0007 — Software development lifecycles](./0007-software-development-lifecycles.md)
remains Proposed. Its placement of refinement and planning on `main` needs
alignment with the workspace intentions here if those proposals advance; this
record neither accepts nor supersedes it.

Consultation, announcement, and acceptance remain human-owned under
[ADR 0000](./0000-use-adrs-accepted.md) and the [ADR advice process](./README.md).
