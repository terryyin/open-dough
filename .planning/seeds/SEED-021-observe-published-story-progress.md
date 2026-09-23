---
id: SEED-021
status: active
planted: 2026-09-19
planted_during: Dashboard direction and ADR 0008 discussion
trigger_when: Building a usable story dashboard from published progress
scope: unknown
---

# SEED-021: Understand published project progress through a story dashboard

## Why This Matters

For Terry and developers using Open Dough, reconstructing project progress by
reading backlog, seed, plan, and branch files should become a coherent visual
view of published work, using only Git origin and without a local coordination
service or database.

Terry is a visual thinker and expects the story perspective to make continuous
trunk integration easier to understand. Today, separate story branches and
manual avoidance of dependent parallel work provide some of that clarity.
Single-agent Trunk Mode experiments are the immediate opportunity to test
whether a dashboard helps before adding same-machine concurrency.
The intended experience is an animated, zoomable stage with connected work
stages, rather than just a list. Apply it just in time: the first increment
needs a readable connected overview, not every interaction in that ambition.

The [story dashboard](../../dashboard/README.md) now delivers the published-work
overview, selection among Open Dough, Doughnut, and Pygardon, and preparation
and readiness inspection. The remaining stories extend ownership and branch
visibility and improve the everyday reading experience. This seed is planning input,
not an executable plan. UX/UI guidance and tech-stack selection are separate
design tasks; their output informs refinement without becoming extra technical
preparation stories.

## Alternatives and Recommendation

- **Defer:** Continue reading Git and Markdown manually. This costs no dashboard
  work but delays testing Terry's explicit visual-understanding hypothesis.
- **Smaller change:** Improve backlog formatting and source links. Useful for
  readers, but still requires assembling a story's context from several files.
- **Existing/manual workflow:** Use the remote repository's file and branch
  browser. This is the strongest simpler alternative and remains the evidence
  reference. It exposes the records but does not provide the requested coherent
  visual account of backlog membership and story progress.
- **Recommended:** Build one read-only story dashboard from actual published
  records. Deliver a useful overview first, then add deeper progress and remote
  story-branch visibility only while their value is supported by use.

The user has selected the visual-dashboard direction and remote-first boundary.
The comparison above and the story cuts below are recommendations for review,
not evidence that a dashboard has already proved more useful than repository
browsing. The delivered overview lets that assumption be tested in use.

## Boundaries Shared by the Stories

- Follow the Git branching and integration direction in
  [ADR 0009](../../docs/adrs/0009-git-branching-and-integration.md), which remains
  Proposed. Remote trunk supplies shared backlog context; a recorded remote
  story branch supplies Story Branch Mode progress. Publication evidence is the
  accepted revision in remote history. Default-checkout freshness and ownership
  are separate machine-local facts, relevant to the later operational view.

- Start with one client project hardcoded in the Open Dough dashboard project.
  Terry selected Open Dough's public GitHub origin, integration branch `main`,
  and local dashboard launch on 2026-09-19. No sign-in, hosted deployment,
  project-registration service, or general project picker in the delivered overview.
  The dashboard now also observes Doughnut and Pygardon as human-selected
  projects, whose metadata may remain hardcoded; this does not introduce a
  portfolio dashboard.
- The dashboard reads published origin state. Its required evidence is available
  from the remote repository across both independent clones and same-machine
  worktrees. Story 4 owns workflow-produced assignment records; the dashboard
  observes their published contents.
- No application/server database or separate persistent project-state authority.
  Disposable browser storage for preferences or cache is allowed, not required.
- Use strong typing across the implementation and validate externally read
  state. The stack task selects concrete tools; Playwright is a candidate, not
  a prerequisite chosen by this seed.
- Preserve story identity, queue order, and distinctions between missing,
  conflicting, and positively recorded information. Taken does not mean live.
- The delivered overview observes existing records. Story 2 owns readiness
  recording through display; story 3 extends inspection to an execution branch.
  Story 4 owns the producer-to-display journey for new assignment information. Unavailable
  metadata remains explicit. Local checkout activity belongs to the later
  operational view.
- Feature and structural perspectives, recent-completion history views,
  automatic takeover, and local operational visualization remain outside this
  set. No percentage estimates of whole-story completion.

## Story Decomposition

<a id="follow-published-story-branch"></a>

### 3. Follow a story's progress on its published execution branch

**Identity:** SEED-021#follow-published-story-branch

**Status:** Decomposed; not refined or planned.

**For / why:** A developer using Story Branch Mode can see progress already
published to origin before it reaches trunk, without mistaking it for
integrated work.

**Outcome:** Inspect the same story's published execution-branch records while
retaining its identity and its integration-branch backlog context. Use a
recorded branch association where available; if absent, allow explicit selection
of a published branch for inspection and label that selection as user supplied.
Do not guess an authoritative assignment from a branch name. Keep source branch
and revision visible, and do not replace the shared queue with a stale copy
from an execution branch.

**Evaluation:** The integration branch still records the story as Taken while
its published execution branch records completed slices. Selecting that branch
shows the recorded progress as branch progress, without claiming it has reached
trunk. If the branch is unavailable or the story cannot be identified there,
show the gap rather than borrowing another story's progress.

**Value / learning:** Complete the useful remote-only view across the two
execution modes without waiting for new ownership metadata or local observers.
Explicit branch inspection is the proposed smaller interim alternative to
requiring changes to all workflow writers first; revisit it if real records
already supply sufficient branch associations.

**Depends on:** Story 2's source-backed story detail and a real published story
branch for evaluation. Use the remote branch association and publication
boundary defined by ADR 0009.

**Safe stopping point:** Both integration-branch and execution-branch evidence
are inspectable, with their distinct publication boundaries clear. Missing
associations remain visible and can inform later metadata requirements.

**Effort hypothesis:** Unestimated; lower confidence than story 2. Identity
association across published refs and independent update times are the main
risks. Refinement must check actual records before committing to automatic
association or expanding the fallback interaction.

<a id="identify-taken-work-owner"></a>

### 4. See who owns Taken work and where it is being executed

**Identity:** SEED-021#identify-taken-work-owner
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Bounded scope is aligned; story refinement and execution approach selection remain."],"basis":{"document":"424b1e0b5dff803d29a2be6a474c4fe4a12bacc0a6311ea7868da8438950ae8b"}}
```

**Status:** Captured 2026-09-19; queued before story 3;
not refined or planned. Story numbers preserve identity, not queue priority.

**Goal:** Terry can distinguish the developers responsible for Taken stories
and understand their execution context from the published dashboard, without
reconstructing ownership from conversations, commit authors, or branch names.

**Scope candidate:** Carry ownership from an authorized workflow claim through
publication to the dashboard. An agent starting story work selects an available
developer name from a circularly rotating list and records that assignment in
the Taken entry, together with its execution mode and, for Story Branch Mode,
the origin execution branch. Trunk Mode identifies remote trunk as its
publication destination. The dashboard shows those published facts with their
source evidence.

The workflow must retain the assignment on resume, keep it distinct from the
story's stable identity, and release it through explicit closure or cancellation
so the name can be reused safely. Do not infer release from silence or age.
Define availability and handling of concurrent published claims during
refinement; successful publication must not leave two different active
developers with the same assignment name. A rejected or uncertain claim cannot
be reported as successfully owned work. Reused names must not make earlier
assignments or messages appear to belong to a new execution.

Extend the backlog's claim domain and the
[shared startup operation](SEED-008-worktree-branch-trunk-sync.md#settle-taken-claims-on-remote-trunk)
so assignment and Taken publish together before implementation. Name availability
is an assignment-domain check, including after a remote race; publication and
recovery stay with the existing publisher. Do not add dashboard-driven claims,
a second publisher, or a local ownership registry. Reuse claim provenance without
confusing its execution identity with the display name. Exact allocation semantics
remain refinement work.

**Included delivery boundary:** Necessary backlog-field support, workflow
recording/publication and assignment lifecycle, delivery of changed guidance
and runtime where needed, and dashboard reading/display belong to this story.
Merely hand-authoring a name in a fixture or adding a UI label is insufficient.
Reuse the existing backlog identity and mutation ownership; align with the
active scripted-backlog work rather than duplicating its rules. Preserve older
entries without metadata and do not mass-assign their owners.

**Key example / evaluation:** Starting an authorized story selects an available
name, publishes its Taken assignment and mode, and refreshing the dashboard
shows who owns it. Another developer can claim different work under a different
available name. Two simultaneous claim attempts reconcile against remote trunk
and result in distinct active assignments. A developer's pending edit in the
default checkout remains intact while a claim published from an owned worktree
becomes visible in the dashboard. Resuming the first story keeps its assignment;
explicit closure allows later safe reuse according to the rotation. For a branch-mode execution,
the recorded origin branch is visible as context without claiming its changes
are on trunk. Entries without these fields remain readable as unrecorded.

**Value / learning:** Make responsibility and execution location understandable
before deeper branch inspection. Test whether memorable developer names provide
useful orientation without introducing messaging or liveness machinery.

**Simpler alternative:** A human manually labels owners, or the dashboard shows
commit authors. Manual labeling does not deliver the requested agent-selected
rotation and can drift from claims; commit authors do not reliably establish
current ownership. Keep the automated assignment bounded to actual Taken work,
not a general developer-directory product.

**Depends on:** The delivered dashboard and
[shared startup publication](SEED-008-worktree-branch-trunk-sync.md#settle-taken-claims-on-remote-trunk).
Published readiness is already delivered. Add assignment semantics through the
existing backlog domain and startup path; ordinary CI automation and local
checkout coordination are not product prerequisites for this visibility outcome.

**Deferred promises:** Messaging, commit mailboxes, presence indicators,
automatic timeouts/takeover, human account management, local workspace discovery,
a generic story-state machine, and following the execution branch's slice
contents. Story 3 owns that last inspection outcome and can consume the new
association without guessing it.

**Safe stopping point:** Published ownership and execution context are useful
without messaging or local monitoring. Missing metadata and pending/unpublished
claims are not presented as known live ownership.

**Effort hypothesis:** Unestimated; lower confidence than the read-only stories.
This crosses workflow production, installed use, concurrent claims, and UI
observation. Refine around the smallest complete assignment journey before
planning; do not mistake a new metadata field for the full outcome. No S/M/L
band is invented without project definitions.

<a id="compact-dashboard-controls"></a>

### 6. Keep dashboard controls in reach and supporting context out of the way

**Identity:** SEED-021#compact-dashboard-controls
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../quick/081-dashboard-header/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"113ef292942ffb348c9e219774041084692a93871b72d18a4665d97e3a53038b","plan":"3ce6e65ce4c833be5a40237a50bd44fa1713606f383bad482b8ec5c2ec2010ad"}}
```

**Source:** Terry's dashboard improvement request, 2026-09-23: capture first in
the product backlog, refine, and plan; implementation is not requested yet.

**Goal:** For Terry and developers reading published story progress, keep project
context and common controls available while scrolling, with supporting direction
and badge explanations available on demand so the work receives more space.

**Scope:**

- An always-visible banner pinned to the viewport top carries the exact brand
  **OpenDO**, the existing project selector, compact project/repository and ref
  information, and the existing manual refresh action rendered as an SVG icon.
  Preserve access to the full source revision and retrieval time in the header's
  source context. Wrap as needed; the banner must not cover focused content or
  consume the whole usable viewport on narrow/zoomed screens.
- Retain one refresh control. Its accessible name is **Refresh**, or **Retry**
  after a failed read; the SVG replaces its visible text. Keep focus and the
  existing no-op behavior while reading, plus readable loading/error feedback.
  Terry's final instruction to move it and use an SVG supersedes the earlier
  tentative removal. No new polling or retrieval behavior is introduced.
- **Near-future direction** is a labeled disclosure, initially collapsed. One
  activation expands its complete published text; another collapses it. An empty
  direction reveals the existing no-direction explanation. Selecting a different
  project starts collapsed; a same-project refresh preserves the user's choice.
- Replace the always-visible **Preparation badges** legend with one compact
  question-mark help control beside the work overview, accessible as
  **Preparation badge legend**. One activation opens a titled modal dialog with
  the existing legend. Keep individual cards' badges and preparation facts
  visible and unchanged. This interprets the requested question mark as the
  legend launcher, not a replacement for each story's status information.
- Keyboard and pointer users can open the dialog and close it through a visible
  Close control or Escape. Move focus inside on opening, contain focus while
  modal, and return it to the launcher on closing. Keep the modal above the pinned
  header. The small symbol still has a comfortably sized hit target.
- Update the existing dashboard UX/UI guidance where these decisions supersede
  its single-project/header assumptions. No general AI-skill revision is justified
  by this local presentation change.

**Key examples:**

1. With a long published backlog, scroll to lower cards → OpenDO, the selector,
   selected-project information, and refresh remain reachable at the top. At
   320 CSS pixels / equivalent 400% zoom, controls wrap without sideways page
   scrolling, obscured keyboard focus, or an unusable reading area.
2. Select Doughnut from the banner → only Doughnut's source and stories appear.
   Activate the refresh icon → the existing explicit read updates that project;
   a failed attempt retains its earlier snapshot and exposes the same icon as
   Retry. Repeated activation while reading does not start another request.
3. Open the page → direction text is collapsed. Expand it with keyboard or
   pointer → read its complete text, or the no-direction message. Refresh the
   same project → choice is retained; switch projects → the new direction is
   collapsed and never shows the previous project's text.
4. With preparation available, the full legend does not occupy the overview.
   Activate its question mark → read the modal legend without a source request.
   Close or press Escape → return to the same control and scroll context; card
   badges retain their original text, evidence, and meanings.

**UI:** Keep the banner compact and distinct from the scrolling overview. Use
the current typography, quiet surfaces, and accent. Keep direction and the help
launcher below the banner rather than pinning expanded supporting content.
OpenDO is the dashboard brand; the observed project may still be Open Dough,
Doughnut, or Pygardon. This is not a rename of the project or domain language.

**Depends on:** The already-delivered dashboard only. Ownership records,
publication automation, and branch inspection are not prerequisites.

**Deferred promises:** Project registration, persistent UI preferences, new
badge semantics, automatic refresh, navigation redesign, a general modal/icon
framework, and changes to published-record readers or authentication.

**Safe stopping point:** Each of the three presentation improvements is useful
with the existing read-only dashboard; partial delivery must preserve access to
evidence, existing controls, and preparation meanings.

**Sizing:** Three bounded UI behaviors with existing read/proof owners. No
project S/M/L bands or numeric slice-time limit have been supplied.

**Slice plan:** [Compact dashboard controls](../quick/081-dashboard-header/PLAN.md).

## Ordering and Scope Reduction

Terry explicitly prioritised story 6 first on 2026-09-23. It improves the delivered
dashboard independently of pending startup/ownership work. Preserve all other
backlog order and the published near-future direction. The following ordering
continues to apply after this presentation improvement.

The delivered overview supplies a usable dashboard for testing the central value
hypothesis in use, now proven useful across Doughnut and Pygardon as well as
Open Dough. Next, story 4 makes responsibility and execution context explicit.
Story 3 then follows that context into published work that has not reached trunk.
This moves an important excluded outcome ahead of branch inspection without
enlarging the delivered overview.

For a smaller finish line, drop story 3 first and use the dashboard for Trunk
Mode. Defer story 4 next if single-agent use makes assignment unimportant.
The delivered overview is the smallest selected finish line for a usable
overview beyond Open Dough. Neither the feature/structure perspectives nor
recently completed history are added merely to complete a catalog of potential
views.

Refinement and readiness facts stay with the workflow that records them and the
dashboard that reads them. A separate state framework is not independently
valuable. Recent-completion history remains an unselected hypothesis for the
same reason.

Reliable startup publication is the prerequisite for extending claims with
assignment. The backlog puts startup and frequent execution-delivery simplification
first, then these remote dashboard outcomes before preparation/closure migration
and same-machine coordination. This preserves the remote-first direction without
making dashboard value wait for every publication caller to migrate. The product
backlog owns the actual order; this seed supplies non-executable story scope.

## Open Decisions

- The delivered overview's project and launch are settled: public Open Dough on GitHub,
  `main`, launched locally. Other providers and private access remain outside
  the selected first outcome.
- Review the proposed third story's explicit branch-inspection fallback after
  observing real branch-association records, including story 4's new fields.
  The fallback may remain useful for older entries; reassess it rather than
  assuming the new assignment story covers every historical execution.
- Refine story 4's name availability, concurrent claim handling, release/reuse,
  and backlog/publication compatibility before choosing its implementation.
- Define effort bands if S/M/L estimates are wanted. The remaining stories stay
  unestimated rather than importing another project's sizing policy.

## When to Surface

While Terry trials Trunk Mode and the common publication contract, use each
delivered view to reconsider the next visibility outcome.

## Breadcrumbs

- [Project visibility requirements](../../docs/project-visibility-requirements.md)
  retain the detailed product direction and deferred local behavior.
- [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
  is Proposed; this seed follows its discussed intention without accepting it.
- [ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md) supplies story
  and slice language; [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  supports small valuable increments and learning before further machinery.
- The [UX/UI North Star](../../docs/dashboard-ux-ui-north-star.md) supplies
  revisable design guidance. Deliver only the breadth selected by each story;
  its broader discovery ideas are not implicit expansion of this seed.
  The [strongly typed stack recommendation](../../docs/dashboard-tech-stack.md)
  informs implementation choices; its broader test examples and discovery
  possibilities do not expand the selected story's outcome.
- [Default-checkout coordination](SEED-008-worktree-branch-trunk-sync.md#same-machine-merge-queue)
  owns direct edits, refresh access, and local recovery. Story 4 records
  assignments through owned workflow workspaces and remote publication;
  the dashboard reads the resulting evidence.
