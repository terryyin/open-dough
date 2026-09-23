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
and readiness inspection. The remaining stories extend slice-plan navigation,
ownership, and branch visibility. This seed is planning input, not an executable
plan. UX/UI guidance
and tech-stack selection are separate design tasks; their output informs refinement without becoming extra technical
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

<a id="open-queued-story-slice-plan"></a>

### 5. Open a queued story's slice plan from the dashboard

**Identity:** SEED-021#open-queued-story-slice-plan
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../quick/081-queued-story-plan-links/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"eb57d91ee8bfac97aff97abdcebaedc0f93afb23f0e30843f65d30948d718adf","plan":"30e04eff6ca90b8f7ac5a1dbd2a59be56190eac86622ddb3ad49fed522b209b5"}}
```

**Status:** Taken on origin/main and implemented on the story branch on
2026-09-23; retained for review and story wrap-up.

**Slice plan:** [Open a queued story's published slice plan](../quick/081-queued-story-plan-links/PLAN.md).

**Goal:** Terry and developers reviewing the dashboard can open a queued
story's published slice plan directly, without searching repository files,
repeating its association in the backlog, or waiting for the story to be
Taken. This makes prepared work inspectable from the story overview.

**Scope:** Expose the associated plan as navigation from the backlog card and
its expanded story detail, retaining the canonical story link, identity,
priority, and preparation facts. Resolve the association from existing
published records at the observed revision, across the dashboard's supported
public and private projects. Preserve existing Taken and explicit backlog-link
navigation. Merely following a link changes no repository or workflow state.

**Recommendations for the open areas:**

- **Backlog structure:** Keep the existing format. The canonical story's
  structured preparation record already names its plan, and the backlog
  already permits an optional plan link. Requiring the queue to repeat that
  path would add synchronization work without new domain information. No
  schema migration, new field, writer change, or payload release is indicated
  by the current evidence.
- **Derivation:** Derive navigation from the recorded association, not a
  filename search, story number, free-form Status prose, or a planning badge.
  Resolve story-state paths relative to the canonical file; explicit backlog
  links remain relative to the backlog. If both identify the same file, offer
  one plan destination and preserve an explicit recorded fragment. Keep
  legacy explicit plan links usable without fabricating preparation facts.
- **Presentation:** Use a normal keyboard-accessible link labelled "Slice
  plan" beside the canonical source link on the card and in expanded detail.
  Open the repository's plan page at the inspected commit, using the existing
  source-link presentation and browser navigation. No embedded plan viewer or
  new modal is needed. A refresh may update the destination to the new snapshot;
  expanding detail uses the already observed snapshot.
- **Uncertainty:** Navigation does not require a ready assessment, a readable
  slice layout, or successful plan-content retrieval. Retain a valid recorded
  destination with the existing read problem when retrieval fails; do not
  claim the file was verified available. If no association is recorded, add
  no plan link. For an invalid path or conflicting records, explain the issue
  and do not derive an authoritative plan destination. Existing raw source
  references remain inspectable as evidence, visibly qualified by the conflict.
  Existing external links retain their external-reference label and are never
  presented as revision-pinned repository plans.

These are evidence-backed recommendations for this delivery, not changes to
the product's architecture or backlog contract. Revisit the format only if a
representative supported record exposes information the current contract
cannot express; name that gap before expanding scope.

**Key examples:**

- A queued story records `approach: planned` and
  `plan: ../quick/example/PLAN.md` in its canonical seed, while its backlog
  entry contains only the story link. Loading the dashboard exposes "Slice
  plan" on the card. Opening it reaches that plan at the inspected revision;
  expanding the story retains the same destination.
- The same story is Not ready or Needs reassessment. Its plan remains
  navigable while the assessment stays unchanged. No Take or ready transition
  occurs. A subsequent refresh uses the newly observed plan association.
- The backlog additionally names the same plan using its own relative path.
  Card and detail each offer one plan destination. If the two records instead
  name different files, the dashboard shows the disagreement without picking
  a winner or displaying either file's slices as the agreed plan.
- The canonical record identifies a valid repository path, but the plan read
  fails. The dashboard retains the pinned source link and reports the read
  problem; unavailable content does not become an absent association. With no
  association, or an unsafe/unresolvable target, it invents no clickable plan.

**Constraints and deferred promises:** Navigation and readiness remain distinct,
as required by [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
Keep the existing path/scheme handling and published-source boundary; no
guessed association or silent conflict resolution. Plan editing, automatic
planning or Take, new workflow stages, local-state discovery, and following
execution-branch contents are deferred promises, not new rejection rules.

**Evidence behind the recommendations:** The shared
[identity contract](../../src/skills/dough-product-backlog/references/identity.md)
already supports optional plan links, and
[preparation recording](../../src/skills/dough-product-backlog/references/record-preparation.md)
stores the canonical plan association. The dashboard's
[preparation enrichment](../../dashboard/src/preparationEnrichment.ts) resolves
that association for both public and private transports. Its
[plan-association check](../../dashboard/src/planAssociation.ts) already detects
disagreement. However, [cards](../../dashboard/src/WorkStages.tsx) and
[detail](../../dashboard/src/StoryDetail.tsx) expose clickable plans only from
the backlog-derived `entry.plan`; preparation's plan path is currently text.
The existing [source-link resolver](../../dashboard/src/sourceLink.ts) already
handles containing-file-relative paths and revision-pinned destinations.
Reuse these responsibilities rather than adding a second discovery mechanism.

**Depends on:** The delivered dashboard and existing published plan records;
no dependency on the queued ownership or execution-branch stories.

**Value / learning:** Make preparation work inspectable directly from the
backlog and establish whether the current records already support this view.

**Safe stopping point:** Queued planned stories expose their recorded plans
directly with source uncertainty intact, independently of the later ownership
and branch-inspection stories.

**Remaining decisions:** The existing-data approach is implemented. No unresolved
goal or scope question remains; integration and closure belong to story wrap-up.

**Effort hypothesis:** Bounded navigation work using existing records and
readers; no project effort band or slice count is assigned during refinement.

## Ordering and Scope Reduction

The delivered overview supplies a usable dashboard for testing the central value
hypothesis in use, now proven useful across Doughnut and Pygardon as well as
Open Dough. Story 5 is the maintainer's selected top backlog priority, exposing
existing slice plans for queued stories. Next, story 4 makes responsibility
and execution context explicit.
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
assignment. The backlog puts story 5 first in the queue while startup is Taken,
followed by frequent execution-delivery simplification and the remaining remote
dashboard outcomes before preparation/closure migration
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
