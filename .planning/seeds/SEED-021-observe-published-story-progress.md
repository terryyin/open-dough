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
  worktrees. Agent profiles published beside the backlog are the
  workflow-produced assignment records; the dashboard observes their published
  contents.
- No application/server database or separate persistent project-state authority.
  Disposable browser storage for preferences or cache is allowed, not required.
- Use strong typing across the implementation and validate externally read
  state. The stack task selects concrete tools; Playwright is a candidate, not
  a prerequisite chosen by this seed.
- Preserve story identity, queue order, and distinctions between missing,
  conflicting, and positively recorded information. Taken does not mean live.
- The delivered overview observes existing records. Story 2 owns readiness
  recording through display; story 3 reads slice progress where it is
  published, including an execution branch. Story 5 owns the producer-to-display journey
  for execution completion
  and product learnings. Unavailable
  metadata remains explicit. Local checkout activity belongs to the later
  operational view.
- Feature and structural perspectives, recent-completion history views,
  automatic takeover, and local operational visualization remain outside this
  set. No percentage estimates of whole-story completion; a count of recorded
  slice statuses is recorded fact, not such an estimate.

## Story Decomposition

<a id="follow-published-story-branch"></a>

### 3. Follow a story's progress on its published execution branch

**Identity:** SEED-021#follow-published-story-branch
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../quick/092-follow-published-story-progress/PLAN.md","assessment":"not-ready","reasons":["Slices 3-5 rely on story 4's published agent profile and its dashboard profile read (SEED-021#identify-taken-work-owner, Taken); reassess after it closes against its final profile spelling."],"basis":{"document":"40e231ecfa9143d7cd8b5253b029c5bf2984126d71c2fe861786889b1b17b128","plan":"e49dda73eeb4ea5a3176fd1af61bda83b1a4f148d05ee86077264cb063c9c3c2"}}
```

**Status:** Refined 2026-09-24 with Terry. Execution waits for story 4,
whose agent profile supplies the branch association.

**Goal:** Terry can see how far each Taken story has come without reading plan
files or branches: a slice progress bar and how long the current slice has
been running since its last recorded plan update. For Story Branch Mode work,
that progress comes from the published story branch rather than the trunk
copy, which stays as it was at Take. Progress on a branch is labeled as branch
progress, never as work in trunk. On 2026-09-24 no Taken plan in the three
observed projects was readable at all: each used a `## Slices` heading that
the shared plan reader refuses.

**Scope:**

- **Progress source.** For each Taken story with an associated plan, read the
  plan at the ref where its progress is published: remote trunk for Trunk
  Mode, or the story branch recorded in its published agent profile
  (story 4) for Story Branch Mode. Membership, queue order, direction, and the
  canonical story always come from trunk; nothing is copied from a branch.
- **Plans written today are readable.** The shared plan reader, still the
  one owner of plan meaning, also accepts a `## Slices` section heading; the
  planning guidance names that element "Ordered slices" without prescribing
  the heading. Slice statuses keep the `planned | done` vocabulary: a plan
  with another status stays uninterpretable and is shown as that gap.
- **Progress bar on the Taken card.** One segment per recorded slice, filled
  for recorded-done slices, with "N of M slices recorded done". It is a count
  of recorded slice statuses, not a percentage estimate of whole-story
  completion. The detail view keeps its slice list and shows the same source.
- **Current-slice clock.** Elapsed time from the later of the plan's last
  commit at that ref and the Take (the commit that added the story's agent
  profile) until now, updated as time passes. The plan format does not change:
  each slice commit already updates the plan. It measures time since the last
  recorded update, not evidence that an agent is active.
- **Branch label.** Branch-sourced progress names the branch and its revision
  and states that the work is not in trunk. The trunk copy's count is not
  shown as the story's progress.
- **Active watch of all branches.** The automatic check watches every
  published branch head of the observed project, not only trunk, and reads
  again when trunk or a branch that a Taken story's profile names moves.
  Movement of other branches reads nothing further.
- **Gaps, never guesses.** A Taken story without a published profile
  (including entries taken before story 4) shows trunk's plan labelled as the
  trunk copy with its execution branch not recorded, since its mode is
  unknown. A recorded branch that is no longer published, a plan missing or uninterpretable on the
  branch, or an unavailable plan commit time are each shown as that gap. No
  assignment is inferred from branch names, and no manual branch selection
  is offered.

**Key examples:**

- A Taken story's profile records Story Branch Mode on `story/example`.
  Trunk's copy of the plan records no slices done; the branch's copy, under a
  `## Slices` heading, records 6 of 8 done (as Pygardon's branch plan did on
  2026-09-24). The card shows 6 of 8 from the branch, names the branch and
  revision, and says it is not in trunk.
- The branch's plan records a slice as `Status: merged into slice 1`. The card
  says the plan's slice progress cannot be interpreted rather than counting
  around it.
- A Trunk Mode story's plan on trunk was last changed by the slice-2 commit
  12 minutes ago, after its Take. The card shows the bar from trunk and
  "current slice running for 12 min".
- A story was Taken 5 minutes ago and its plan was last committed at
  planning, two days earlier. The clock shows 5 minutes, measured from the
  Take. For an entry taken before profiles existed, the clock is measured from
  the plan commit and says so.
- A new slice commit is pushed to the story branch while trunk stays still.
  Within the automatic check's pace, the card shows the new done count and a
  restarted clock without pressing Refresh.
- Pygardon's Taken story has no profile; a branch named for it exists. The
  card shows trunk's plan labelled as the trunk copy with the execution
  branch not recorded, and reads nothing from the similarly named branch.
- The recorded branch was deleted. The card says it is no longer published and
  does not fall back to the trunk count as progress.

**Value / learning:** Replace a misleading stale count with the actual
published progress and show whether work is moving, across both execution
modes, from published Git alone. Test whether a bar and slice clock are
enough to orient Terry without liveness machinery.

**Simpler alternative:** Label Story Branch Mode cards "trunk progress is
stale" and leave progress reading to the branch browser. Rejected because
Story Branch Mode is in real use in two of the three observed projects.

**Depends on:** Story 2's source-backed detail and slice interpretation, and
story 4's published profile with its origin branch. Follow ADR 0009's
distinction between publication on a story branch and integration into trunk.

**Deferred promises:** Branch commit lists, diffs, ahead/behind counts, CI
status, merge-readiness, or age warnings; seeds, backlog, or new plans read
from branches; progress for stories not Taken; time-remaining estimates;
manual branch selection; new slice statuses or plan-format rules and
catching malformed plans when they are written (SEED-024); and the completion
and product-learning signal, which story 5 owns.

**Safe stopping point:** Every Taken story's progress comes from the ref
where it is published, with its publication boundary clear, and missing
associations stay visible gaps.

**Effort hypothesis:** Unestimated; the all-branch watch and the plan commit
time add read-boundary requests, and the Take-time rule depends on story 4's
final profile format.

<a id="see-finished-execution"></a>

### 5. See when an execution has finished and what it learned before wrap-up

**Identity:** SEED-021#see-finished-execution
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Status:** Decomposed 2026-09-24 from story 3's refinement; not refined or
planned. Queued directly after story 3.

**For / why:** Terry can see in the dashboard that a Taken story's execution
and retrospective have finished and it is waiting for wrap-up, and can read
its product learnings there, instead of finding them only in an execution's
chat.

**Outcome:** When the execution retrospective finishes, it commits and
publishes what it wrote (a correction plan or process findings) to the
execution's publication destination, and records in the story's plan that
execution is complete, along with the retrospective's product learnings. The
dashboard shows the completed state and those learnings. Wrap-up digests the
learnings and deletes the plan as it does today.

**Evaluation:** After a retrospective finishes on a Story Branch Mode story,
the dashboard shows the story as execution complete with its product
learnings, from the published branch, before wrap-up runs.

**Value / learning:** Makes "done but not wrapped up" visible and keeps
product learnings from being lost in a conversation.

**Depends on:** Story 3's progress source.

**Open questions for refinement:** The retrospective currently must not
commit or push and leaves its records to wrap-up; this reverses that
ownership. Settle the destination for each mode, what marks completion when
the retrospective is skipped, how the plan records completion and learnings
(its header `Status:` is not maintained today), and CI observation of that
push. The change spans installed guidance in Codex, Cursor, and Claude Code
as well as the dashboard.

**Effort hypothesis:** Unestimated.

## Ordering and Scope Reduction

The delivered overview supplies a usable dashboard for testing the central value
hypothesis in use, now proven useful across Doughnut and Pygardon as well as
Open Dough. Published agent profiles now make responsibility and execution
context explicit. Story 3 follows that context into published work that has not reached trunk.
Story 5 follows directly, making finished executions and their product
learnings visible before wrap-up. This moves an important excluded outcome ahead of branch inspection without
enlarging the delivered overview.

For a smaller finish line, drop story 5 first, then story 3, and use the dashboard for Trunk
Mode.
The delivered overview is the smallest selected finish line for a usable
overview beyond Open Dough. Neither the feature/structure perspectives nor
recently completed history are added merely to complete a catalog of potential
views.

Refinement and readiness facts stay with the workflow that records them and the
dashboard that reads them. A separate state framework is not independently
valuable. Recent-completion history remains an unselected hypothesis for the
same reason.

Execution-delivery simplification and the remaining remote
dashboard outcomes precede preparation/closure migration and same-machine
coordination. This preserves the remote-first direction without
making dashboard value wait for every publication caller to migrate. The product
backlog owns the actual order; this seed supplies non-executable story scope.

## Open Decisions

- The delivered overview's project and launch are settled: public Open Dough on GitHub,
  `main`, launched locally. Other providers and private access remain outside
  the selected first outcome.
- Story 3's manual branch-selection fallback was dropped on 2026-09-24:
  entries without a recorded branch show that gap.
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
  owns direct edits, refresh access, and local recovery. Agent profiles are
  recorded through owned workflow workspaces and remote publication; the
  dashboard reads the resulting evidence.
