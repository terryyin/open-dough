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

This seed proposes three user-visible increments. It is decomposition input,
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
The comparison above and the three cuts below are recommendations for review,
not evidence that a dashboard has already proved more useful than repository
browsing. The first story tests that assumption.

## Boundaries Shared by the Stories

- Observe one client project hardcoded in the Open Dough dashboard project.
  The initial repository selection is pending; Open Dough itself is the proposed
  first subject. No project-registration service or general project picker.
- Read published origin state only. No dependency on a developer's clone,
  worktree paths, unpushed work, lock state, or an active agent session.
- No application/server database or separate persistent project-state authority.
  Disposable browser storage for preferences or cache is allowed, not required.
- Use strong typing across the implementation and validate externally read
  state. The stack task selects concrete tools; Playwright is a candidate, not
  a prerequisite chosen by this seed.
- Preserve story identity, queue order, and distinctions between missing,
  conflicting, and positively recorded information. Taken does not mean live.
- Do not write project records, adopt identities, assign names, claim stories,
  or implement lock/queue/messaging behavior to make the dashboard readable.
  Display unavailable metadata honestly rather than inventing it.
- Feature and structural perspectives, recent-completion history views,
  automatic takeover, and local operational visualization remain outside this
  set. No percentage estimates of whole-story completion.

## Story Decomposition

<a id="see-published-work"></a>

### 1. See the project's published work in a story dashboard

**Identity:** SEED-021#see-published-work

**Status:** Decomposed; not refined or planned.

**For / why:** Terry can open a usable dashboard and see what work is Taken and
what is next, without assembling the backlog mentally from Markdown.

**Outcome:** Show the hardcoded project's published near-future direction,
Taken work, and prioritized backlog in a coherent story overview. Preserve the
canonical links so Terry can inspect the source behind an item. Make the
observed repository/revision and refresh outcome understandable; failed reads
must not look like an empty queue or silently current data.

**Evaluation:** Given a published backlog with Taken and queued entries,
opening the dashboard shows the same membership and order. After a backlog
change reaches origin, an explicit refresh shows it. An unpushed local edit
does not appear. If origin cannot be read, the view makes that limitation clear.

**Value / learning:** Test whether a visual account of current work helps Terry
orient himself during a real single-agent Trunk Mode journey. This is a working
view of real Git data, not a static design mockup.

**Depends on:** No new product capability. Select the initial repository and its
read-access route during refinement; it must work without local coordination.

**Safe stopping point:** A useful, read-only project overview remains even if
all later work is cancelled. Broken or unsupported source records are visible
limitations; the source is never repaired by the dashboard.

**Effort hypothesis:** Unestimated; medium confidence in this boundary. It owns
the first complete origin-to-screen journey, including the minimum delivery and
browser proof needed to use it. Remote access and the chosen UI stack are the
main uncertainties. Repository S/M/L definitions have not been found, so no
band or time estimate is invented.

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

## Ordering and Scope Reduction

Story 1 is the recommended first story: it supplies a usable dashboard and tests
the central value hypothesis immediately. Story 2 deepens the immediate
single-agent Trunk Mode experiment. Story 3 extends that established view to
published work that has not reached trunk.

For a smaller finish line, drop story 3 first and use the dashboard for Trunk
Mode. Drop story 2 next only if the overview itself supplies enough value.
Neither the feature/structure perspectives nor recently completed history are
added merely to complete a catalog of potential views.

These stories precede the existing same-machine integration queue story. No
dashboard implementation, story execution, lock implementation, or change to
an already-Taken execution is authorized by this decomposition.

## Open Decisions

- Confirm the hardcoded project and available remote read access. Support for
  other providers or private-repository onboarding is not assumed.
- Review the proposed third story's explicit branch-inspection fallback after
  observing real branch-association records; automatic ownership inference is
  not an accepted substitute.
- Define effort bands if S/M/L estimates are wanted. All three stories remain
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
  remains later work; its mechanism is not a prerequisite of these read-only
  stories.
