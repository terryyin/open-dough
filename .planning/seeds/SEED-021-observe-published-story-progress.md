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
  recording through display; Taken cards already read slice progress where it
  is published, including an execution branch. Story 5 owns the producer-to-display journey
  for execution completion
  and product learnings. Unavailable
  metadata remains explicit. Local checkout activity belongs to the later
  operational view.
- Feature and structural perspectives, recent-completion history views,
  automatic takeover, and local operational visualization remain outside this
  set. No percentage estimates of whole-story completion; a count of recorded
  slice statuses is recorded fact, not such an estimate.

## Story Decomposition

<a id="see-finished-execution"></a>

### 5. See when an execution has finished and what it learned before wrap-up

**Identity:** SEED-021#see-finished-execution
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../quick/094-see-finished-execution/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"603d849b2ed8b2bee81257c998f469988f8beebdddb629819e4cc0de4f9f866a","plan":"8f5c26ab4c1a0f50727fc1da63236a0ae078f536572e5d4d2f80660609414cba"}}
```

**Status:** Refined 2026-09-24 with Terry; kept as one story at the top of
the queue. Not planned.

**Goal:** Terry can see in the dashboard that a Taken story's execution and
retrospective have finished and it is waiting for wrap-up, and can read the
retrospective's product advice there. The same recorded advice reaches
wrap-up even when wrap-up runs in a later session. Today that advice lives
only in the execution's chat. Execute-plan's final handoff does not list it,
and wrap-up uses it only when its own conversation carries it. On 2026-09-22
to 24, 15 automatic retrospectives across the three observed projects showed
the advice usually present but silently omitted in 3 (two Codex, one long
Claude Code run) and reduced to one line in several others.

"Product advice" means the retrospective's product-learning review: its
recommendations, or a reasoned no-change. It excludes the code review and the
process review.

**Scope:**

- **One completion commit.** When the automatic retrospective returns, or is
  skipped with `--skip-retro`, execute-plan commits, in one commit:
  - the plan's execution-complete record,
  - the product-advice entry,
  - any correction plan or process findings the retrospective wrote in the
    execution checkout.

  It publishes that commit to the execution's publication destination before
  the completion CI wait. That destination is the story branch in Story Branch
  Mode and trunk in Trunk Mode. The existing completion operation therefore
  observes CI for this revision, and no separate observation is added. The
  retrospective stays review-only: it still does not commit or push. Terry
  confirmed both points on 2026-09-24, including that Trunk Mode correction
  plans and process findings reach trunk before wrap-up.
- **A required advice entry.** The plan's completion record always carries
  one of:
  - the recommendations;
  - an explicit no-change with its reason;
  - "retrospective skipped" when the retrospective did not run;
  - "product review skipped" when it ran with `--skip-product`.

  An empty or missing entry is not allowed. Execute-plan's final handoff
  reports the same advice. The shared plan reader interprets the record; its
  exact Markdown form is a planning decision, named in the planning guidance
  and kept from spreading into other formats.
- **Dashboard.** For a Taken story whose plan at its delivered progress source
  carries the completion record, the card shows "Execution complete, awaiting
  wrap-up" and how long it has waited since the completion commit, in place of
  the current-slice clock. The detail view shows the product advice as
  recorded. Branch-sourced completion keeps the delivered label that the work is
  not in trunk.
- **Wrap-up.** Wrap-up takes product advice from the plan's record when its
  conversation does not supply it. Explicit human input still wins. Wrap-up
  then digests the advice and deletes the plan as it does today.
- **Gaps, never guesses.** A completion record without a readable advice entry
  is shown as that gap, not as "no advice". Recorded-done slices without a
  completion record are shown as slice progress, not as complete.
- The change applies to the shared guidance used by Codex, Cursor, and Claude
  Code.

**Key examples:**

- A Story Branch Mode execution finishes all slices. Its retrospective
  recommends queueing one correction first and writes that correction plan.
  One commit carrying the plan's completion record, the advice, and the
  correction plan is pushed to the story branch. The card shows "Execution
  complete, awaiting wrap-up", sourced from the branch. The detail view shows
  the recommendation.
- A Trunk Mode retrospective finds nothing. The completion commit on trunk
  records "no product change, because …". In Open Dough it touches only
  `.planning/`, so CI's path filter skips it and the completion operation
  treats it as not applicable.
- An execution runs with `--skip-retro`. The completion commit records
  "retrospective skipped", and the card still shows execution complete.
- A retrospective records process findings in `DearDough.md` beside the plan
  update. The same commit carries them, and the completion operation awaits
  the CI run it triggers.
- Wrap-up starts in a fresh session with no retrospective in its context. It
  applies the advice recorded in the plan.
- A retrospective stops for missing context. No completion record is written,
  and the card keeps showing slice progress.

**Value / learning:** Makes "done but not wrapped up" visible. It turns
product advice from chat text into a published, durable record that the
dashboard and a later wrap-up can both use. Recording the advice also exposes
executions whose retrospective gave none.

**Simpler alternative:** Show "all slices recorded complete" from the delivered progress source
without any workflow change. Rejected by Terry on 2026-09-24: the completion
record is one commit either way, and the product advice is the part he wants
to see and keep.

**Depends on:** The delivered Taken progress source, branch label, and
current-slice clock (see the dashboard README). Uses the existing increment publication and completion operation of
execute-plan.

**Deferred promises:**
- Showing process findings, correction plans, or CI verdicts in the dashboard.
- A separate "slices done, retrospective running" state.
- Changing what the retrospective reviews, or how it words its advice.
- Completion records for wholly planless quick executions, which have no plan
  and no automatic retrospective.
- Age warnings for stories left waiting for wrap-up.

**Safe stopping point:** Every completed planned execution publishes one
completion commit with its product advice, and the dashboard and wrap-up read
it from the published plan.

**Effort hypothesis:** Unestimated; spans execute-plan finish, the shared plan
reader and planning guidance, wrap-up input, and the dashboard.

## Ordering and Scope Reduction

The delivered overview supplies a usable dashboard for testing the central value
hypothesis in use, now proven useful across Doughnut and Pygardon as well as
Open Dough. Published agent profiles now make responsibility and execution
context explicit, and Taken cards follow it into published work that has not
reached trunk.
Story 5 follows directly, making finished executions and their product
learnings visible before wrap-up. This moves an important excluded outcome ahead of branch inspection without
enlarging the delivered overview.

For a smaller finish line, drop story 5.
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
