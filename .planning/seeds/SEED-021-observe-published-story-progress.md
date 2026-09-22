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

This seed proposed five user-visible increments. Two are delivered as the
[story dashboard](../../dashboard/README.md): the first, a locally launched
overview of published work, and the extension to observe Doughnut and
Pygardon alongside Open Dough. Three remain. It is decomposition input,
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

<a id="inspect-recorded-story-progress"></a>

### 2. Inspect a story's published readiness and slice progress

**Identity:** SEED-021#inspect-recorded-story-progress

**Status:** Refined on 2026-09-22; slice plan prepared for review. No execution
is authorized. [Plan](../quick/075-published-story-readiness/PLAN.md).

**Goal:** Terry can decide which queued story needs preparation and understand
what a Taken story has published, without reconstructing seed and plan files.
Workflow operations produce trustworthy story facts that the dashboard displays;
colored badges alone do not fulfill this outcome.

**Why now / priority:** This advances the remote-first Trunk Mode experiment in
the near-future direction before adding ownership and local coordination. Keep
its existing position after the two CI-observer improvements; those address
recurring execution overhead but are not prerequisites. Earlier ownership or
checkout coordination would be more valuable if concurrent assignment or local
contention became the immediate problem. Existing source links remain the simpler
alternative, but cannot provide the requested overview of preparation. Success
means Terry can identify a story needing refinement and explain published slice
progress without assembling multiple documents; visual usefulness remains a
hypothesis to evaluate, not a consequence of shipping more UI.

**Scope:** One complete chain from workflow-maintained story records through Git
publication to a read-only dashboard, for the existing three observed projects.

- Preserve stable identity and the story's canonical home. Backlog membership,
  refinement, planning approach, readiness assessment, and slice progress remain
  separate facts. Store each fact once and reuse its meaning in writer and reader.
  The catalog here concerns stories and their plans, not features or structure.
- Record refinement explicitly as not refined or refined. Refined means goal,
  scope, and key examples are understood. Record whether a plan exists, planless
  execution is deliberately selected, or no approach is recorded; missing a plan
  never proves planless intent. Existence of a plan does not certify readiness.
- The preparing agent records ready or not ready, with the assessed source basis
  and blocking reasons when applicable. Ready requires understood scope, a
  selected execution approach, and no blocking concern. Planned work also needs
  bounded slices and proof covering the outcome. Planless selection follows the
  existing explicit skip-planning authority. Assessment adds no human approval
  gate and no authority to start, take work, or change priority.
- Changes to assessed story or plan content require reassessment. A reader can
  detect an outdated assessment without trusting that an editor cleared a flag.
  The writer refuses a stale assessment submission rather than blessing unseen
  changes. Ordinary progress updates retain their own slice evidence; they must
  not silently renew readiness. Exact normalization and storage are implementation
  choices constrained by the plan's minimal contract.
- Overview cards show labeled color badges: Not refined (gray), Refined (blue),
  Slice planned (purple), and Ready for execution (green). Preparation and
  readiness remain separately inspectable; a ready badge does not erase a
  planless approach. Unknown, unavailable, conflicting, and needs-reassessment
  states remain explicit and never masquerade as not refined. Text conveys every
  color distinction, with accessible contrast and keyboard access.
- Selecting a card shows purpose, preparation and readiness evidence, and the
  linked plan's slice names, recorded status, and available completion evidence.
  Counts describe recorded slices, not effort or percentage of story value.
  Taken, all slices done, and readiness do not establish live activity or closure.
- Read all facts from the same pinned trunk revision; deduplicate canonical files
  and plans needed for overview facts. Fetch additional detail only when needed.
  Preserve source links, explicit refresh, project isolation, and dated prior
  observations after failure. A detail failure does not erase the readable queue.
- Include the shared data reader/writer and changes to the preparation/execution
  guidance that owns the facts, with payload delivery checks. Older records remain
  inspectable; structured facts are adopted during ordinary authorized workflow
  use, with no speculative status backfill or migration of other repositories.

**Key examples:**

1. An explicitly unrefined queued story appears gray. Refinement establishes
   goal, scope, and examples and records refined; after publication and refresh
   its card is blue, with the same identity and queue position.
2. An agent writes a plan with a blocking decision: after publication the card
   shows Slice planned, and detail shows Not ready with the reason. Resolving
   the concern and recording an assessment makes Ready for execution visible
   after publication, without moving the story to Taken or starting execution.
3. A ready story's scope or assessed plan changes without reassessment: refresh
   shows Needs reassessment. An assessment submitted against older content is
   refused without modifying records. Reassessment restores ready only if justified.
4. A human explicitly selects planless execution for an understood story. The
   agent records that approach and assesses readiness. The dashboard can show
   Ready for execution and Planless together; an older story lacking a plan link
   instead shows the absence of planning evidence.
5. A Taken story has five planned slices. It remains Taken with zero recorded
   complete, without an activity claim. After a workflow records two completed
   slices with accepted proof and publishes trunk, refresh shows two of five
   recorded complete and their evidence, regardless of default-checkout freshness.
6. Several cards share a seed; all retain their own facts. A malformed record or
   unreadable plan affects only its dependent facts. An older seed without the
   new record stays inspectable as Not recorded. Conflicting identities or plan
   associations are shown explicitly, without choosing a source by recency.
7. Switching from a slow private-project detail read to a public project cannot
   mix results. Failed refresh retains dated prior evidence; Retry can recover.
   Public and private paths interpret identical record semantics.

**Architecture:** Follow Accepted ADR 0002's state and workflow ownership rule
(as amended at Terry's direction in this session), ADR 0001's identity concepts,
and ADRs 0003–0006 for source guidance and delivery. ADR 0008 remains Proposed
and describes presentation. Reuse the existing backlog contracts and published
source boundaries; the dashboard acquires no state-writing authority.

**Deferred promises:** Ownership allocation or new execution-mode metadata,
execution-branch inspection, automatic work selection/start, a generic lifecycle
engine, local activity/coordination, polling, historical completion views,
feature/structure catalogs, dashboard editing, and whole-story percentages.
Existing recorded owner/mode information can remain reachable through source
links; adding dedicated displays belongs to the ownership story. Releasing or
updating live installations is separate from preparing and validating this change.

**Read cost:** At one revision, the public overview uses one ref read, one backlog
read, S unique canonical-file reads, and P unique associated-plan reads: 2 + S + P,
counting a file only once across both sets. Plans are needed when establishing
planning/readiness, not just on selection. Three stories sharing one seed and two
plans cost five requests; inspecting their already-read detail adds none. No
polling or automatic retries. This replaces the earlier selection-only assumption.
Bound concurrent reads and preserve the existing timeout/error behavior. Private
reads use the existing authenticated boundary with the same deduplication.

**Depends on / safe stopping point:** The delivered overview supplies access and
membership. Complete producer-to-display readiness and trunk slice progress are
useful without assignment or branch inspection. No generic catalog infrastructure
is a separately deliverable prerequisite.

**Open decisions:** None blocking this refinement. Field encoding, operation names,
and component layout are implementation choices under the plan's contract. The
broader sibling-story decisions below remain deferred.

**Effort hypothesis:** Crosses workflow, shared record interpretation, and both
read transports; moderate sizing confidence. No project S/M/L definitions or
numeric slice limits were supplied. Judge slices by bounded outcomes and proof.

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

**Status:** Captured 2026-09-19; queued after story 2 and before story 3;
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

The same claim contract serves owned worktrees on one machine and independent
clones on several machines. Publish the assignment with the Taken claim to
remote trunk before implementation starts. A concurrent remote update requires
rechecking name availability and reconciling the claim before retrying. An
uncertain response is resolved from remote history and the retained claim
identity. Local default-checkout maintenance follows its own ownership rules.
Exact assignment allocation and reconciliation details remain refinement work.

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

**Depends on:** The delivered dashboard and installed execute-plan publication
guidance, which supply claim publication and recovery. Story 2 precedes this story for
single-agent learning value. Reuse the delivered backlog mutation and identity
contracts when adding assignment semantics.

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

## Ordering and Scope Reduction

The delivered overview supplies a usable dashboard for testing the central value
hypothesis in use, now proven useful across Doughnut and Pygardon as well as
Open Dough. Story 2 deepens the single-agent Trunk Mode experiment. Next,
story 4 makes responsibility and execution context explicit. Story 3 then
follows that context into published work that has not reached trunk. This
moves an important excluded outcome ahead of branch inspection without
enlarging the delivered overview.

For a smaller finish line, drop story 3 first and use the dashboard for Trunk
Mode. Defer story 4 next if single-agent use makes assignment unimportant, then
story 2 if the overview itself supplies enough value. The delivered overview
is the smallest selected finish line for a usable overview beyond Open Dough.
Neither the feature/structure perspectives nor recently completed history are
added merely to complete a catalog of potential views.

No separate generic story-state story is queued: story 2 owns the workflow-maintained refinement and readiness facts together
with their visible outcome. Its refinement includes the necessary recording contract where existing
records cannot support a truthful view. A state framework is not independently valuable
merely because it was excluded from the delivered overview. Recent-completion history remains
an unselected hypothesis for the same reason.

The migration story establishes the shared Git publication contract. These
dashboard stories then add published detail and assignment visibility, followed
by the default-checkout coordination story. The product backlog owns priority;
this seed supplies non-executable story scope.

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
