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

This seed proposes five user-visible increments. It is decomposition input,
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
browsing. The first story tests that assumption.

## Boundaries Shared by the Stories

- Start with one client project hardcoded in the Open Dough dashboard project.
  Terry selected Open Dough's public GitHub origin, integration branch `main`,
  and local dashboard launch on 2026-09-19. No sign-in, hosted deployment,
  project-registration service, or general project picker in the first story.
  Story 5 removes the Open Dough-only configuration boundary for another real
  project; it does not introduce a portfolio dashboard.
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
- Stories 1-3 observe existing records without assigning names or claiming work
  to make them readable. Story 4 explicitly owns the producer-to-display journey
  for new assignment information. None adds local locks, queues, or messaging.
  Unavailable metadata remains explicit rather than invented.
- Feature and structural perspectives, recent-completion history views,
  automatic takeover, and local operational visualization remain outside this
  set. No percentage estimates of whole-story completion.

## Story Decomposition

<a id="see-published-work"></a>

### 1. See the project's published work in a story dashboard

**Identity:** SEED-021#see-published-work

**Status:** Refined and planned 2026-09-19; queued, not Taken.
**Plan:** [061 — Published story dashboard](../quick/061-published-story-dashboard/PLAN.md).

**Goal:** Terry opens a locally launched dashboard and can answer “What is the
project aiming for, what work is Taken, and what is next?” from Open Dough's
published backlog. He can see connected work stages and read their work cards.
This tests whether spatial presentation helps him orient himself during
single-agent Trunk Mode use. The first outcome is visibility of
selected work, not a claim to measure implementation progress inside a story.

**Scope — required behavior:**

- Read `terryyin/open-dough` on GitHub, resolve published `main`, and read
  `.planning/PRODUCT-BACKLOG.md` at that revision. Launch the dashboard locally;
  no developer checkout is a source of displayed project facts.
- Show the near-future direction when present, Taken entries in their recorded
  order, and queued entries in priority order. Preserve titles and identities;
  existing bounded corrections are ordinary work entries, not parse failures
  merely because they have no story seed.
- Present work as cards in connected **Backlog → Taken** stages. Label the
  connector as the taking-work relationship, not a story dependency or proof
  of live activity. Preserve each group's recorded order and backlog priority.
  Do not invent further lifecycle stages to fill the diagram.
- Keep the full title, identity, membership/priority, and existing source links
  readable from the same snapshot, with the connected overview understandable.
  Direction, source status, and refresh stay reachable. Use ordinary layout,
  wrapping, reflow, and scrolling where sufficient; add a small focus/fit or
  zoom interaction only if actual content presents a reading or orientation
  problem. A general pan/zoom system is not an acceptance requirement.
- Let the user follow existing canonical work and plan links to published source
  records. Link to the inspected revision where applicable. Do not fetch and
  interpret those documents to create a detail view in this story.
- Load on opening and provide explicit Refresh. Show the source project/ref,
  inspected revision, and successful retrieval time. Publish one coherent
  backlog snapshot, not a mixture of records from changing `main` revisions.
- Keep work identity stable on refresh. Any motion must clarify navigation or
  observed change, settle when nothing changes, and respect reduced motion.
  Do not build animated travel or intermediate stages merely to complete the
  visual concept; no looping activity or inferred Done position for removed work.
- Distinguish loading, successfully empty groups, and unavailable or invalid
  source data. A failed refresh retains the last successful view with a clear
  failure/stale indication and retry, rather than changing it to an empty queue
  or presenting it as a newly successful read. Initial failure shows no invented
  backlog. Missing direction is not a failure; an unreadable backlog is.
- Deliver readable titles and clear spatial grouping, with keyboard access to
  source links, refresh, and any navigation controls. Keep the connected view
  usable on a narrow viewport, preserving browser page zoom and normal page
  scrolling. Apply the UX North Star only to this overview and entry scope.

**Backlog details and story states:** No new durable fields or lifecycle state
machine are needed for this goal. Derive membership directly from `Taken` and
`Backlog list`; these are displayed facts, not new values written to stories.
Do not infer Running, Completed, refined, or slice-planned from that membership.
Existing identity and links are sufficient to show and navigate an entry.

Developer names, execution mode, and origin execution-branch fields are deferred
until a story promises to use them. Likewise, explicit refinement/planning
metadata and a broader story-state model remain later questions. This first
view omits those fields rather than making a screen of unused “unknown” facts.
No migration, identity adoption, or backlog writer change is required merely to
display the current published document. If existing read parsing needs a bounded
compatibility repair, it belongs here with preservation of existing callers;
rewriting the project's records is not the fallback.

**Technical setup included in delivery:**

- Establish the minimal React, strict TypeScript, Vite, and runtime-validation
  setup needed for the actual overview, using the stack recommendation. Type
  check application code, tests, and configuration; validate consumed external
  data instead of asserting its shape. Keep the existing npm toolchain and
  extend applicable lint/format checks to the new source.
- Semantic HTML cards with ordinary CSS layout and simple connectors are the
  starting direction; canvas is optional and must preserve accessible reading
  if selected. Introduce viewport/focus/animation state only when needed, kept
  separate from snapshot interpretation. No graph editor, physics layout,
  persisted coordinates, or advance support for future perspectives.
- For this public fixed project, prefer browser reads of GitHub's REST API and
  static UI assets. GitHub documents CORS support. Node may run build, local
  serving, and test tools; no application read server or database is needed for
  this first outcome. Verify actual unauthenticated browser access during
  delivery; failure must be reported, not worked around by silently adding
  sign-in, a token field, or private-project infrastructure.
- Reuse the established backlog interpretation where it fits. The source
  parser's current rejection of legacy Taken plan-link syntax is known from
  decomposition; inspecting the actual published format is necessary before
  choosing a reader. Do not duplicate mutation or reconciliation rules or
  require delivery of the broader scripted-backlog installation story.
- Provide documented commands for local launch, type checking, the behavioral
  suite, and a production build. Commit compatible dependency/lockfile and
  configuration changes with implementation. Keep the dashboard outside the
  installed guidance payload; no release/installer story is introduced.

**Testing and existing CI — included, not follow-up work:**

Use one new behavioral suite: **Playwright on Chromium**, exercising the built
UI, real remote-reading code, and real backlog interpretation. Substitute only
the external GitHub response boundary with representative ref/file responses;
do not supply preinterpreted dashboard rows that bypass the promised reader.
Include connected-stage reading and the success, refresh, empty, and failure
boundaries below in that suite, including reduced motion for any animation
introduced. Use existing parser tests as applicable when shared code changes;
retain existing repository tests. Do not add Vitest, a component-test layer, a
separate API-test suite, or a cross-browser matrix for this story.

Wire the dashboard suite into the existing GitHub Actions CI so ordinary pushes
and pull requests run it alongside the existing checks. CI installs the needed
browser, builds and serves the real app for the journey, reports failure, and
retains useful failure diagnostics. It also runs explicit TypeScript checks and
lint; these are static checks, not another behavioral test layer. The production
build must succeed. Playwright execution alone does not establish type safety.
No green result may skip the new suite because the existing shell discovery
only finds `.sh` tests.

Normal CI uses controlled responses and needs neither GitHub credentials nor
live project contents. A bounded read-only browser observation against the real
public origin additionally proves the selected access path works and the
published format is understood; this is delivery evidence, not another test
framework or a permanent live-network CI dependency. Native Codex/Cursor/Claude
acceptance is not added for this browser-only capability.

**Key examples:**

1. *Real overview.* Origin `main` contains a direction, a Taken entry with an
   existing plan link, and queued entries. Opening the dashboard shows those
   facts as cards in connected stages in source order, with working source
   navigation and the read revision.
   A local unpushed backlog edit has no effect on the view.
2. *Published change.* The user has loaded revision A. A queue-to-Taken change
   reaches origin as revision B. Refresh shows B's membership and order together
   and updates the source indication; the same work appears in Taken without a
   duplicate or a guessed intermediate state. Any visual transition respects
   reduced motion. An unchanged revision implies no new work or activity.
3. *Empty versus unavailable.* A successfully read empty Taken section is
   shown as empty. A network/rate-limit failure, missing backlog, or unsupported
   document produces an actionable read problem, not an empty or complete
   project. After an earlier successful load, that snapshot remains visibly old.
4. *No new state needed.* An entry has no owner, mode, or refinement metadata.
   It still appears correctly in its source group with its title and links.
   Taken alone produces no live-status badge or completion claim.
5. *Readable connected work.* With long titles, more entries than fit onscreen,
   or a narrow viewport, the user can still understand Backlog's connection to
   Taken, read each entry, and reach its source links using the keyboard.
   Reflow and ordinary scrolling can satisfy this; if a bounded focus/zoom
   interaction is needed, it preserves orientation and a way back. No fetched
   story or slice details are required to make the stage useful.

**Scope — rejection constraints:** Read published Git state only; do not edit
the observed repository or depend on machine-local activity. No application
database, separately authoritative status store, or required browser persistence.
Never execute repository content or render fetched Markdown as trusted HTML.
Do not silently discard malformed entries to make a partial backlog look complete.

**Deferred promises:** Owner/mode/branch enrichment; new persisted story states;
refinement and slice detail; discovering stories outside the backlog; execution
branch/history traversal; recently finished work; feature/structure views;
backlog editing, lock/queue or messaging; automatic polling, project selection,
private repository access, sign-in, hosted deployment, and persistent caching.
Dependency graphs, configurable workflow stages, and dragging cards to change
work state are also deferred; connected-stage navigation does not require them.
The North Star's richer zoom/pan and animation direction is pursued as actual
reading and navigation needs emerge, not built as a first-story prerequisite.
These are delivery exclusions, not arbitrary rejection rules for naturally
supported source content.

**Architecture and evidence:** Follow Accepted ADRs
[0001](../../docs/adrs/0001-ubiquitous-language-accepted.md) for work concepts and
[0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
for one owner per interpretation and the smallest useful increment. ADR 0008
remains Proposed. The public repository and `main` default were verified through
GitHub metadata on 2026-09-19; Terry selected Open Dough and local launch in this
refinement. See [GitHub CORS](https://docs.github.com/en/rest/using-the-rest-api/using-cors-and-jsonp-to-make-cross-origin-requests)
and [Playwright type checking](https://playwright.dev/docs/test-typescript) for
the two relevant tool boundaries. This scope narrows the broader stack guide's
optional server and multiple test layers; it does not adopt all of that guide.

**Depends on / remaining uncertainty:** No new product prerequisite and no
remaining product-input question for this story. Planning must resolve the
smallest compatible read boundary for the actual backlog syntax and carry the
browser access observation. These do not authorize schema expansion.

**Safe stopping point:** A real, locally usable overview with passing CI remains
valuable if the later stories are cancelled. Use it before adding more states
or metadata. No executable plan or implementation is created by this refinement.

**Effort hypothesis:** Unestimated; medium confidence. The initial app and CI
setup are real delivery cost within this story, not separate preparation work.
Backlog-read compatibility is the main remaining implementation uncertainty.

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

**Depends on:** Story 1's usable overview and origin access. This story reads
existing records; it does not depend on the installed scripted-backlog gate or
new local locks. Remote execution-branch progress belongs to story 3.

**Safe stopping point:** Trunk-published story progress is useful on its own.
The view identifies its integration-branch scope so missing branch-local
progress is not presented as lack of work.

**Effort hypothesis:** Unestimated; medium confidence. More source variation
than story 1, but reuse of its access and presentation. Contradictory records
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

**Depends on:** Story 1's usable dashboard. Story 2 is prioritized first for
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

**Status:** Captured 2026-09-19; queued immediately after story 1, before
readiness/slice detail. Not refined or planned.

**Goal:** A developer using Open Dough in another project can point the
dashboard at that project's published repository and understand its current
work without changing dashboard application code or moving project state into
the Open Dough source repository.

**Scope candidate:** Replace the first story's hardcoded observed project with
the smallest usable way to supply one project's repository and necessary
read context. Display its direction, Taken work, queue, and source links using
that project's records. Keep the initial local-launch and read-only model.
Switching the supplied project must not leave the previous project's data or
source identity presented as the new project's state.

Prove the journey with one real project other than Open Dough, chosen during
refinement. Inspect its origin, access, integration branch, and backlog location
before prescribing configuration or delivery details. Support the selected
project's actual records and clearly identify unsupported or unreadable input;
do not require it to adopt the source repository's incidental layout or migrate
its data merely to make the dashboard work.

**Key example / evaluation:** A developer follows the documented launch/setup
route for the chosen second project without editing dashboard source. The view
shows that project's published membership, order, and links. Open Dough remains
usable through the same route. A failure to read the selected project does not
fall back to Open Dough data under the new name. Both observations use origin
state without scanning developer clones or writing client records.

**Value / learning:** Establish that this is useful tooling for projects using
Open Dough, rather than an interface coupled to Open Dough's own development.
Expose real portability assumptions before deepening the view around one
repository's records.

**Simpler alternative:** Change a hardcoded repository constant and rebuild for
each user. This can prove an internal example, but leaves ordinary use dependent
on editing the dashboard and can hide source-specific assumptions. Prefer a
small one-project setup route over either source editing or a project-management
platform.

**Depends on:** Story 1's working overview. Readiness detail, named ownership,
and same-machine locks are not prerequisites.

**Deferred promises:** Simultaneous multi-project views, project registration,
accounts, a general hosting-provider abstraction, arbitrary workflow formats,
hosted deployment, local monitoring, and a new authentication platform. Private
access is not silently promised or excluded: establish the chosen project's
actual access needs in refinement and keep any necessary read access bounded
to that user journey.

**Safe stopping point:** The existing overview works for Open Dough and a second
real project through a documented setup route, even if richer views are never
built. State remains in each observed repository; no database is introduced.

**Effort hypothesis:** Unestimated; medium-to-low confidence until the second
project and access path are selected. The meaningful unknown is record/access
compatibility, not the effort of replacing a constant. Preserve first-story
behavior and include the second-project journey in the existing test approach.

## Ordering and Scope Reduction

Story 1 is the recommended first story: it supplies a usable dashboard and tests
the central value hypothesis immediately. Story 5 then proves usefulness in
another project before we deepen source-specific assumptions. Story 2 deepens
the single-agent Trunk Mode experiment. Next, story 4 makes responsibility and
execution context explicit. Story 3 then follows that context into published
work that has not reached trunk. This moves an important excluded outcome ahead
of branch inspection without enlarging the already-refined first story.

For a smaller finish line, drop story 3 first and use the dashboard for Trunk
Mode. Defer story 4 next if single-agent use makes assignment unimportant, then
story 2 if the overview itself supplies enough value. Stories 1 and 5 together
are the smallest selected finish line for a usable overview beyond Open Dough.
Neither the feature/structure perspectives nor recently completed history are
added merely to complete a catalog of potential views.

No separate generic story-state story is queued: story 2 already tests the user
outcome that refinement/planning metadata would support. If existing records
cannot support a truthful view, use that evidence to refine its scope or capture
one bounded recording outcome. A state framework is not independently valuable
merely because it was excluded from story 1. Recent-completion history remains
an unselected hypothesis for the same reason.

These stories precede the existing same-machine integration queue story. No
dashboard implementation, story execution, lock implementation, or change to
an already-Taken execution is authorized by this decomposition.

## Open Decisions

- The first story's project and launch are settled: public Open Dough on GitHub,
  `main`, launched locally. Other providers and private access remain outside
  the selected first outcome.
- Review the proposed third story's explicit branch-inspection fallback after
  observing real branch-association records, including story 4's new fields.
  The fallback may remain useful for older entries; reassess it rather than
  assuming the new assignment story covers every historical execution.
- Refine story 4's name availability, concurrent claim handling, release/reuse,
  and backlog/publication compatibility before choosing its implementation.
- Choose the real second project for story 5 and inspect its remote access and
  record conventions before defining its minimal setup experience.
- Define effort bands if S/M/L estimates are wanted. All five stories remain
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
