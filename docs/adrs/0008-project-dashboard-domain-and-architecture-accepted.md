# 0008 — Project dashboard domain and architecture

**Status:** Accepted

## Context

Continuous trunk integration makes project progress harder to understand through
story branches alone. Unfinished stories can already have increments integrated,
while multiple developers progress different work. A graphical view should help
developers understand the project's work and progress.

The [project visibility requirements](../project-visibility-requirements.md)
keep open questions that are not implemented yet. This decision records the
stable domain distinctions and architectural intentions. It does not select an
implementation or authorize execution.

The [Dashboard UX/UI North Star](../dashboard-ux-ui-north-star.md) holds
temporary interface direction that is not implemented yet. It is not accepted
architecture.

## Decision

### Domain concepts and relationships

| Concept | Intended meaning |
| --- | --- |
| Project | The product and development work being observed, with its repository as the durable home of workflow records. |
| Development | The continuous effort to shape the product through exploration, decomposition, refinement, planning, execution, verification, integration, and learning. |
| Story | A unit of planning within Development, expressing an intended change or possibility pursued for user or learning value. It may cross existing product and code boundaries, and can exist outside the backlog. |
| Product backlog | The selected, ordered work for the project. Membership is a workflow fact about a story, not the definition of a story. |
| Taken story | Work claimed for execution, with a recorded developer assignment. Taken does not prove that an agent is currently running. |
| Developer identity | A reusable name, distinct from a story, assignment, or AI session. |
| Developer assignment | An undertaking to prepare or execute identified work. Its profile records the current developer, activity, and available tool/model information. |
| Launch workflow | What a dashboard launch starts on one work item, such as execution or refinement: the skill it runs. A launch is local evidence and never settles or moves a story. |
| Follow-up | A new ad hoc session that carries the records of a retained Done session or done story whose conversation can no longer be continued. The source stays Done. |
| Execution mode | The workflow by which a story is executed and integrated. Story Branch Mode and Trunk Mode have different publication locations. |
| Slice plan and slice | A plan organizes bounded executable slices of a selected story. Recorded slice completion supplies progress evidence; a plan is not mandatory for every story. |
| Product intent | The maintained definition of intended behavior: what the current product is meant to do and why. It evolves with the product and survives individual stories. Each Product intent contains Purpose and Proof. |
| Structure | The logical organization of the product's implementation, expressed through its domain model and mapped to packages, folders, files, and functions. |
| Local workspace | An owned checkout in which a developer prepares changes and publishes to an authorized remote destination. Several worktrees can share one local repository. |
| Optional default checkout | A developer's checkout that may be refreshed after remote trunk publication. Its presence, edits, and freshness are local operational facts, not workflow authority. |

Development, Product intent, and Structure are independent related perspectives.
Development creates, changes, and maintains the product. Its lasting results are
assimilated into product intents and structure, while learning informs further
attempts. Stories are units of planning within Development. Relationships can
be many-to-many: a story can affect several product intents and structural
elements, and a product intent can endure through many stories and span several
structural elements. Mapping and filtering remain design possibilities.

Product intents describe the current product and evolve with intentional
changes. A regression supplies evidence against fulfillment while the product
intent remains the expectation to evaluate. Completing and removing planning
records leaves enduring behavior in automated tests and enduring structure in
code ([ADR 0000](./0000-use-adrs-accepted.md)). Future possibilities stay in
planning.

Each Product intent contains **Purpose**, the
expected behavior and why it matters, and **Proof**, executable verification
and supporting evidence. Proof distinguishes maintained procedures from
particular observed results. CI observations identify the revision measured.
A delta attributed to a contribution requires comparable observations that
isolate it.

Intent is the shared context for reading and reviewing a project. Its scope
identifies the project, optional story and sessions, revision or comparison,
and repository path. Purpose, source, diffs and Proof share that scope.

Storage, proof representation, and presentation remain design choices.
Detailed semantics, evidence considerations, and open questions belong in the
[requirements](../project-visibility-requirements.md#product-intent-perspective-the-current-product).

Derive Preparing from an active preparation assignment; keep refinement,
planning, and readiness as independent story facts. One AI session may carry
successive assignments. [ADR 0007](./0007-software-development-lifecycles.md#shared-work-assignments)
proposes assignment lifecycle and recovery; neither an assignment nor its age
proves that an agent is running or has stopped.

Present the story state defined by [ADR 0002](./0002-software-development-lifecycle-principles-accepted.md)
without implying live activity. Distinguish missing, outdated, and conflicting
evidence from an explicit negative result.

### Dashboard UI concepts

| Concept | Meaning |
| --- | --- |
| Board | The selected project's work overview, containing the Backlog, Taken, and Recently done columns. |
| Column | One named region of the Board, grouping work by recorded story membership or session disposition. |
| Story card | A representation of one story within a Column, holding its facts, actions, and associated Session entries. |
| Session entry | A representation of one agent session, within a Story card, directly in a Column, or in the Sessions sidebar. |
| Sessions sidebar | The left-hand region listing open agent sessions across projects, with an optional Running Cursor sessions section. |
| Side panel | The auxiliary region, normally to the Board's right, showing one terminal or final report at a time. |
| Panel divider | The resize control between the Board and Side panel when they appear side by side. |
| Scrollbar | A control that scrolls its owning region; qualify it by that region, such as Board scrollbar or Side panel scrollbar. |
| Selected story | The page's one story, or none, that the dashboard is showing. Opening its review in Intent or its content in the Side panel, clicking an empty area of its Story card, selecting a Recently done sessions row linked to the completed story, or choosing a Recent stories row can set it. Closing the Side panel preserves the current selection. Clicking an empty area of the selected Story card or showing a session attached to no story clears it. Intent reads it. |
| Recent stories | The banner control and its list of recently set Selected stories in this browser. A filled bookmark shows that a story is selected; an outline bookmark shows that none is. The list is most recent first, each project and story pair once, and clearing the Selected story leaves the list as it is. |
| Highlight | The selected story's visual indication on its Story card. |
| Inspect | Opening or closing a Story card's inline detail, which leaves the Selected story as it is. |

In Recently done sessions, choosing a linked row selects its completed story.
Choosing a standalone row selects the retained session and preserves the
Selected story. The selection updates the current perspective and leaves the
Side panel as it was. Development shows the selected story or session in its
Board. Intent uses the Selected story and keeps its current reading when a
standalone session is selected.

Use these names directly across UI language, architecture, code, tests, and
documentation, adapting casing only to programming syntax. Each concept has
one name and responsibility; keep no competing synonym or alias layer. A Panel
divider resizes. A Scrollbar scrolls. Layout and scrolling mechanics stay with
the dashboard UI implementation.

### Durable project state and local operational state

The project repository owns the workflow records for backlog membership,
developer assignments, and published progress. A done record beside the backlog
identifies each completed story. Each session that publishes work has its own
record linking the session to its changes and, where applicable, its story.
Published session identities and comparisons survive checkout retirement.
The dashboard can rebuild its views and caches from their sources.

Marking an ad hoc session Done creates a Done story if the session has no
story. An existing association and the story's status are preserved. Each
follow-up has its own session ID under that story.

Project configuration is machine-local operational state, separate from the
observed repositories' workflow records. There is no application/server
database; optional browser storage is disposable.

Published progress comes from Git state on origin, including relevant branch
contents and history. A reader must not need a developer's clone, unpushed
commits, agent conversation, or temporary runtime files to show published
progress. Fetching or caching remote Git data is compatible with this boundary.

For Taken work, the durable record identifies the assigned developer and
execution mode. Story Branch Mode also identifies its execution branch on
origin so the reader can locate published progress. Trunk Mode needs no remote
story-branch field. Local branch and worktree locations belong to the local
operational view rather than required remote backlog metadata.

Launch records and live session activity are machine-local. Owned-workspace
activity and optional default-checkout refresh outcomes remain separate local
operational concerns. Missing observation
means local activity is unknown; an observed absence of a default checkout is a normal
condition, not blocked work. Published progress remains visible independently
of that local evidence.

```mermaid
flowchart LR
    G["Git origin: records, branches, history"] --> V["Derived project view"]
    L["Local operational evidence"] -.-> V
    V --> D["Development perspective: current work view"]
    V -.-> I["Product intent perspective: design direction"]
    I --> P["Purpose"]
    I --> E["Proof"]
    V -.-> A["Structural perspective: design direction"]
```

These are logical responsibilities and information flows, not prescribed
services, processes, deployment units, or storage technologies.

### Spatial presentation remains derived

The Board presents connected Columns with zoom, focus, and animation, as
detailed in the requirements and UX/UI North Star. A Column
groups supported workflow facts; drawing a connector does not establish a new
persisted state, a dependency between stories, or a mandatory linear lifecycle.
Story identity and source evidence remain stable independently of card placement.

Viewport position, zoom, focused work, animation, review navigation, and file
filters are presentation state, separate from published project facts and
machine-local operational evidence.
Losing them loses no project progress. Motion can explain a change between
observed snapshots; it cannot establish unobserved activity. This
intention does not prescribe canvas, a graph library, or stored layout data.
Build these interactions just in time for the selected story's reading goal;
the visual direction does not justify advance navigation infrastructure.

### Observe workflow outcomes without owning them

Keep record maintenance, remote integration, and local workspace management in
the workflow. Let the dashboard observe their evidence without requiring a GUI
for agent cooperation.

Prefer server-sent events (SSE) for live dashboard status updates and WebSocket for interactive terminal input and output.
Dashboard data maps directly to the domain model across the wire and in each layer, with the minimum necessary translation under [ADR 0002](./0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution).

Owned workspaces publish to remote destinations; remote trunk is the shared
integration authority. The dashboard observes accepted remote revisions for
published progress and uses machine-local evidence for checkout activity.

Fresh preparation and execution use fetched remote history in an owned workspace
under the applicable workflow procedure, including the
[preparation workspace procedure](../../Distribution/src/skills/dough-story-refinement/references/preparation-workspace.md).
They do not depend on a default checkout. Land and wrap-up share the remote
publication and recovery contract across worktrees and machines; a dashboard
must not infer successful integration merely from a local branch advancing.

After remote trunk accepts work, optional local refresh may advance a clean
checkout on the expected branch. Deferred or failed refresh preserves local
work and remains visible separately from successful remote publication. A
missing default checkout requires no ownership or handoff state and does not
prevent owned-workspace retirement. Explicit developer checkout edits use their
existing task authority; this model requires no automated checkout coordination
protocol.

Recheck observable checkout state around local mutations and preserve changes
from human developers and other tools.

### Incremental scope

The implemented dashboard presents Development through story planning,
execution progress, and local-session capabilities. Published progress remains
independently readable from Git; local observations add information about this
machine without becoming the authority for project state. Current capabilities
are documented by the dashboard's code, automated tests, and configuration
([ADR 0000](./0000-use-adrs-accepted.md)).

Intent already reads test source and CI observations. The shared review
interface is described in the
[Dashboard UX/UI North Star](../dashboard-ux-ui-north-star.md#review-in-intent).
Structure remains a separate design direction.

## Consequences

- The dashboard can be replaced or rebuilt without losing authoritative project
  progress, and the first useful view does not depend on local monitoring.
- Remote visibility is limited to published evidence. Taken work and an old
  update cannot establish that an agent is currently running or has stopped.
- New perspectives require sufficient evidence for their claims. A maintained
  product intent inventory and Proof model need their own design and
  implementation work.
- Story identity, developer assignment, execution mode, and workspace ownership
  remain distinguishable, avoiding accidental coupling to a temporary branch,
  recycled name, or default checkout.
- Local evidence can explain workspace activity and deferred refresh, but
  cannot establish unobserved activity or imply that a default checkout is
  required for remote work.

## Open design and related decisions

Purpose and Proof representation within Product intent, cross-perspective
relationships and UX/UI, architectural North Star placement, and possible
assignment messaging and takeover remain open in the
[requirements](../project-visibility-requirements.md#questions-retained-for-later-design).
This direction selects no new GUI framework, daemon, database, schema, or
distributed scheduler.

This decision builds on
[ADR 0002 — Software development lifecycle principles](./0002-software-development-lifecycle-principles-accepted.md),
particularly whole-product understanding, continuous integration, direct domain
mapping, and incremental learning. No exception to it is proposed.

Treat [ADR 0007](./0007-software-development-lifecycles.md) as a proposal;
follow ADR 0002 while its delayed-integration conflict remains unresolved.
Leave acceptance, supersession, and exceptions to humans under the
[ADR advice process](./README.md).
