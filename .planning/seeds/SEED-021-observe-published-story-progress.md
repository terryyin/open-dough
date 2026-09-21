---
id: SEED-021
status: active
planted: 2026-09-19
planted_during: Dashboard direction and ADR 0008 discussion
trigger_when: Building a usable story dashboard before same-machine coordination
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

This seed proposed five user-visible increments. The first, a locally launched
overview of published work, is delivered as the [story dashboard](../../dashboard/README.md);
four remain. It is decomposition input,
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

- Start with one client project hardcoded in the Open Dough dashboard project.
  Terry selected Open Dough's public GitHub origin, integration branch `main`,
  and local dashboard launch on 2026-09-19. No sign-in, hosted deployment,
  project-registration service, or general project picker in the delivered overview.
  Story 5 extends the view to the three human-selected projects, whose
  metadata may remain hardcoded; it does not introduce a portfolio dashboard.
- The dashboard reads published origin state only. No dependency on a
  developer's clone, worktree paths, unpushed work, lock state, or active agent
  session. Story 4 adds workflow-produced ownership records visible after
  publication; it does not make the dashboard a writer.
- No application/server database or separate persistent project-state authority.
  Disposable browser storage for preferences or cache is allowed, not required.
- Use strong typing across the implementation and validate externally read
  state. The stack task selects concrete tools; Playwright is a candidate, not
  a prerequisite chosen by this seed.
- Preserve story identity, queue order, and distinctions between missing,
  conflicting, and positively recorded information. Taken does not mean live.
- The delivered overview and stories 2-3 observe existing records without assigning names or claiming work
  to make them readable. Story 4 explicitly owns the producer-to-display journey
  for new assignment information. None adds local locks, queues, or messaging.
  Unavailable metadata remains explicit rather than invented.
- Feature and structural perspectives, recent-completion history views,
  automatic takeover, and local operational visualization remain outside this
  set. No percentage estimates of whole-story completion.

## Story Decomposition

<a id="inspect-recorded-story-progress"></a>

### 2. Inspect a story's published readiness and slice progress

**Identity:** SEED-021#inspect-recorded-story-progress

**Status:** Decomposed; not refined or planned.

**For / why:** Terry can select current work and understand what has been
recorded about its readiness and implementation, without opening several
documents and conflating their different statuses.

**Outcome:** From the overview, inspect the story's purpose, recorded refinement
and planning state, and linked plan's slices and completion evidence from the
published integration branch. Show owner and execution mode when supported by
the records. Keep membership, planning, and execution facts distinct; missing
data stays unknown. A planless story remains inspectable.

**Evaluation:** A Taken story whose linked plan still records all slices as
planned shows those two facts separately, rather than claiming execution is
running. After a slice completion is published on trunk, refreshing the selected
story reveals the recorded change and its source. A story without a plan shows
no invented slices or required planning failure.

**Value / learning:** Determine whether source-backed detail gives enough
visibility for Terry to use Trunk Mode with confidence, and expose actual
metadata gaps before adding workflow fields or a new state machine.

**Learning from the delivered overview (2026-09-20):** Reads are
unauthenticated browser calls to GitHub's REST API, limited to 60 requests per
hour from one address. One overview read costs two requests: the ref, then the
backlog at that commit. Reading a seed and a plan for an inspected story adds at
least two more per story on every refresh. Read detail on selection, at the
snapshot's pinned revision, rather than for every card, and state the request
budget of the key examples during refinement. A rate-limit answer already shows
as a read problem that keeps the last snapshot. Each card already carries its
canonical and plan links resolved to repository paths at the inspected revision
(`dashboard/src/sourceLink.ts`); start from those rather than deriving paths
again. The overview deliberately holds no Markdown parsing, so refinement must
name which existing reader owns story and slice-status meaning, or make that
interpretation part of this story's scope.

**Depends on:** The delivered overview and its origin access. This story reads
existing records; it does not depend on the installed scripted-backlog gate or
new local locks. Remote execution-branch progress belongs to story 3.

**Safe stopping point:** Trunk-published story progress is useful on its own.
The view identifies its integration-branch scope so missing branch-local
progress is not presented as lack of work.

**Effort hypothesis:** Unestimated; medium confidence. More source variation
than the delivered overview, but reuse of its access and presentation. Contradictory records
and planless work are the key boundary checks, not reasons to normalize the
whole project's workflow in this story.

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

**Depends on:** Story 2's source-backed story detail. Requires a real published
story branch for evaluation, not a lock service or a new backlog write path.

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
the origin execution branch. Trunk Mode needs no remote story-branch field.
The dashboard shows those published facts with their source evidence.

The workflow must retain the assignment on resume, keep it distinct from the
story's stable identity, and release it through explicit closure or cancellation
so the name can be reused safely. Do not infer release from silence or age.
Define availability and handling of concurrent published claims during
refinement; successful publication must not leave two different active
developers with the same assignment name. A rejected or uncertain claim cannot
be reported as successfully owned work. Reused names must not make earlier
assignments or messages appear to belong to a new execution.

This is useful in Stage 1 with independently owned checkouts on separate
machines. It must coordinate through published Git state, not depend on the
future same-machine integration lock. It does not authorize concurrent mutation
of one shared default checkout. Exact claim reconciliation and allocation
mechanisms remain design questions rather than a prescribed new service.

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
available name. Resuming the first story keeps its assignment; explicit closure
allows later safe reuse according to the rotation. For a branch-mode execution,
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

**Depends on:** The delivered dashboard. Story 2 is prioritized first for
single-agent value, not a hard implementation prerequisite. Existing workflow
claims/publication are the starting point; compatibility with ongoing backlog
delivery and publication behavior must be checked in refinement. The local
integration queue is not a prerequisite.

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

<a id="observe-another-project"></a>

### 5. Use the dashboard for another Open Dough project

**Identity:** SEED-021#observe-another-project

**Status:** Refined 2026-09-21; planned, remains first queued.

**Plan:** [View three projects independently](../quick/066-view-three-projects/PLAN.md).

**Goal:** Terry has one place to see the published work of Open Dough,
Doughnut, and Pygardon, each independently, because all three consume his time.
This is not shared work or coordination among projects. Select a project to
understand its direction, Taken work, and prioritized backlog using the existing
overview.

**Decisions (2026-09-21):** Terry selected these three projects and permitted
hardcoding their metadata in Open Dough source. This replaces the earlier
requirement for generic setup without application-source edits. Terry explicitly
accepted using existing authenticated GitHub CLI access for private Pygardon.
The project names in conversation map to these existing repositories:

| Project | GitHub repository | Access | Ref and backlog |
| --- | --- | --- | --- |
| Open Dough | `terryyin/open-dough` | Public | `main`, `.planning/PRODUCT-BACKLOG.md` |
| Doughnut | `nerds-odd-e/doughnut` | Public | `main`, `.planning/PRODUCT-BACKLOG.md` |
| Pygardon | `terryyin/pygardon` | Private, existing local authentication | `main`, `.planning/PRODUCT-BACKLOG.md` |

**Scope:** A small selector in one locally launched dashboard, showing one
project's existing overview at a time. Open Dough is the initial selection.
Read only published origin state, pin each observation to one revision, and
preserve each project's direction, membership, order, and source links. No
project's work is moved into another repository. Empty Taken lists and absent
direction remain valid observations. Taken does not imply live agent activity.

Selection changes the source and visible observation together. Clear the old
project's view during a new selection; do not retain it under the new name.
Late responses and overlapping identities from other projects cannot alter the
selected project's snapshot or move focus to another project's work. Preserve
same-project refresh behavior: a failed refresh retains the clearly identified
previous snapshot. An initial read failure shows no invented or partial work.
Retry is explicit. Reading Pygardon successfully is required; listing its name
with a permanent access error is insufficient.

**UI:** A labeled keyboard-operable project selector remains available while
reads are pending or fail. Source evidence identifies the repository, ref,
revision, and retrieval time. Loading/failure announcements identify the selected
project. Keep the existing connected Backlog/Taken view and narrow-screen use.
No simultaneous combined view or project-level summary cards are promised.

**Key examples:**

- Open the dashboard, select Doughnut, and see its own published direction,
  ordered work, and revision-pinned source links; return to Open Dough through
  the same selector.
- Select Pygardon with existing authorized local GitHub access: its actual
  published Taken work and queue appear without a separate dashboard sign-in.
- Select Doughnut, then Pygardon before Doughnut responds: a late Doughnut
  success or failure cannot replace Pygardon's observation. The same story
  identity in two repositories does not make them the same work.
- Without usable Pygardon access, see an actionable project-specific read
  failure and remain able to select a public project. Restore access and Retry
  to read Pygardon; an unsuccessful same-project refresh preserves only that
  project's earlier snapshot.
- A missing or unsupported backlog is a read problem, distinct from a valid
  empty backlog. No local clone is consulted and no observed records are written.

**Why now:** Terry needs one place for the independent projects consuming his
time. This supplies immediate use of the existing overview beyond Open Dough,
consistent with the remote-first visibility direction. It is a value priority,
not a technical prerequisite for richer story detail. Separate repository pages
remain a simpler alternative but do not provide the selected common entry point.
The user has clarified this value and requested planning; a previous proposed
requirement to trial the overview before refining this story is superseded.
Whether the overview improves day-to-day understanding remains a learning outcome,
not a claimed result or a blocker to this selected story.

**Observed context:** On 2026-09-21 the current shared `parseBacklog` reader
accepted published backlogs from all three repositories. Public Open Dough and
Doughnut reads succeeded without credentials; authenticated Pygardon access
succeeded. Pygardon had two Taken entries, the public projects had none. These
are source observations, not completed UI proof. Pinned-read evidence is retained
in the plan. No format migration or new backlog grammar is indicated.

**Depends on:** The delivered overview and existing GitHub read access. Richer
readiness/slice details, named ownership, execution-branch inspection, and
same-machine coordination are independent later work.

**Deferred promises:** Cross-project shared work, dependencies, coordination,
combined portfolio views, global prioritization, time tracking, project
registration/editing/discovery, arbitrary configuration or hosting providers,
hosted deployment, a new account/authentication platform, local monitoring,
automatic polling, selection persistence/deep links, richer story details, and
ownership production. These are omitted commitments, not extra rejection rules.
Necessary authenticated access to Pygardon is included.

**Safe stopping point:** Terry can inspect each of the three projects from one
local dashboard even if no later dashboard story is delivered.

**Open decisions:** None required for this story's scope. User evaluation of
usefulness can inform later dashboard priorities.

**Effort hypothesis:** Bounded project selection and one local private-read
boundary. Slice sizing and proof ownership are in the linked plan; no numeric
time policy is supplied.

## Ordering and Scope Reduction

The delivered overview supplies a usable dashboard for testing the central value
hypothesis in use. Story 5 next proves usefulness in
another project before we deepen source-specific assumptions. Story 2 deepens
the single-agent Trunk Mode experiment. Next, story 4 makes responsibility and
execution context explicit. Story 3 then follows that context into published
work that has not reached trunk. This moves an important excluded outcome ahead
of branch inspection without enlarging the delivered overview.

For a smaller finish line, drop story 3 first and use the dashboard for Trunk
Mode. Defer story 4 next if single-agent use makes assignment unimportant, then
story 2 if the overview itself supplies enough value. The delivered overview and story 5
together are the smallest selected finish line for a usable overview beyond Open Dough.
Neither the feature/structure perspectives nor recently completed history are
added merely to complete a catalog of potential views.

No separate generic story-state story is queued: story 2 already tests the user
outcome that refinement/planning metadata would support. If existing records
cannot support a truthful view, use that evidence to refine its scope or capture
one bounded recording outcome. A state framework is not independently valuable
merely because it was excluded from the delivered overview. Recent-completion history remains
an unselected hypothesis for the same reason.

These stories precede the existing same-machine integration queue story. No
dashboard implementation, story execution, lock implementation, or change to
an already-Taken execution is authorized by this decomposition.

## Open Decisions

- Terry clarified the immediate value of story 5 on 2026-09-21 and authorized
  planning: one place to inspect three independent projects consuming his time.
  Practical usefulness is still to be learned from use; no pre-refinement trial
  is required for this selected story.
- The delivered overview's project and launch are settled: public Open Dough on GitHub,
  `main`, launched locally. Other providers and private access remain outside
  the selected first outcome.
- Review the proposed third story's explicit branch-inspection fallback after
  observing real branch-association records, including story 4's new fields.
  The fallback may remain useful for older entries; reassess it rather than
  assuming the new assignment story covers every historical execution.
- Refine story 4's name availability, concurrent claim handling, release/reuse,
  and backlog/publication compatibility before choosing its implementation.
- Story 5 uses three hardcoded projects and existing local GitHub authentication
  for Pygardon, as Terry explicitly accepted. Its scope decisions are settled.
- Define effort bands if S/M/L estimates are wanted. The remaining stories stay
  unestimated rather than importing another project's sizing policy.

## When to Surface

Now, before adding same-machine integration coordination, while Terry trials
single-agent Trunk Mode. Revisit scope after using each delivered view.

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
- [Same-machine integration](SEED-008-worktree-branch-trunk-sync.md#same-machine-merge-queue)
  remains later work; its mechanism is not a prerequisite of this remote-first
  set. Story 4 records assignments through independently owned workflow
  checkouts; the dashboard remains read-only.
