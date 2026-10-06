# Show available dashboard facts promptly

**Identity:** SEED-113#show-available-facts-promptly
**Source:** [refined story](../../seeds/SEED-113-dashboard-github-responsiveness.md#show-available-facts-promptly).
**Prepared:** 2026-10-06. Planning only, in the story's existing preparation
workspace on `codex/refine-available-dashboard-facts`.

## Execution identity

Story Branch Mode, authorized by Terry's `dough-execute-plan` invocation.
The execution workspace was created for this story at
`/Users/terryyin/git/open-dough/.worktrees/show-available-dashboard-facts-promptly`,
on `codex/show-available-dashboard-facts`, from
`4f535d246471416caf873051c5250f6d05a8f845`. The originating and integration
checkout is `/Users/terryyin/git/open-dough`.

The publisher is `codex-dashboard-facts-20261006`, assigned agent `mike.li-chan`.
The Take was accepted on `origin/main` at
`ead6c3a656b0f1d26f067b84e2d2411d05ddf92d`; startup published the execution
branch at that revision. Increments publish to
`origin refs/heads/codex/show-available-dashboard-facts`.

Checkout setup: `npm ci --offline --no-audit --no-fund` and
`npm run typecheck:dashboard` passed against the unchanged lockfile. Existing
planning authority is retained for bounded replanning; no numeric slice target
or hard limit was supplied. CI uses GitHub Actions `ci.yml`, whose push trigger
and selector were verified for the execution branch. The trunk Take has no
observation receipt; managed increment delivery owns branch observation.

CI observer: repository `terryyin/open-dough`, branch
`codex/show-available-dashboard-facts`, coordinator
`codex-dashboard-facts-20261006`, workflow `ci.yml`; checkout-bound runtime
`.agents/skills/dough-execute-plan`.
Codex yielded cell `138`, PTY session `91572`, PID `66922`, mailbox
`/tmp/dough-ci-501/watch-5B7G8A`.

## Goal and boundaries

After the complete published backlog is read, a developer can use completed
preparation facts, assignments, and done stories while unrelated groups are
still being read. Later arrivals enrich that observation without losing facts,
source qualifications, or the reader's place.

Include the story's loading, failure, timeout, revision, project-switching,
inspection, focus, and column-position examples. Preserve credited humans,
slice clocks, branch progress, local sessions, and the existing requirement that
startup reconciliation waits for a fully read observation.

Observer request sharing, rate-limit scheduling, content reuse across commits,
new polling or concurrency policy, per-file streaming, and layout or launch
redesign are deferred. These slices introduce no API-call or production latency
budget. A group becoming available must not establish another group's absence
or make the whole observation complete.

## Existing solutions and current decisions

PFE found the suitable owner in `dashboard/src/publishedWorkRead.ts`: it already
emits pinned membership followed by partial snapshots. Its consumer,
`publishedObservation.ts`, owns one abort controller per read, rejects abandoned
updates, and keeps whole-read completion distinct from displayed membership.
Change this existing orchestration rather than adding another observation store
or event system.

Reuse the existing preparation, assignment, done-record, progress-source,
attribution, and clock readers and their result meanings. `withAssignments`
projects the same profiles onto cards and the roster. Profile additions already
share their evidence between one profile's human and clock; their callbacks
already publish independent later details. The missing behavior is publication
of the independent groups before the preparation/assignment join, including
done facts before that join.

One common rule governs the sequence: each read owns one observation; a group
updates only its facts, and every published view contains all facts established
so far for that observation. Waiting, a read establishing absence, and a failed
read remain distinct. A callback must not replace a newer accumulated view with
its captured earlier whole snapshot. Use ordinary functions and existing result
types; extract a local assembly function only where the current work needs it.

Preparation and profiles are genuine inputs to progress routing. While profiles
are unread, an already-read trunk plan must not appear as established execution
progress. Once the route is known, retain trunk-copy, branch, conflict, and
unavailable qualifications. Start dependent clock work from the required plan
and allocation evidence; unrelated done records or other profiles' human reads
are not prerequisites.

Keep one owner of the read's final promise and 30-second bound. Observe and
settle every started task, including cancellation and failure; do not create
unobserved background rejections or complete the read on the first partial
publication. Root failure, core detail timeout, and a done/human/clock gap retain
their existing reporting and recovery distinctions.

The searched callers of `readPublishedWork` lead through
`publishedObservation.ts`; no other product caller consumes its result. Shared
assignment/attribution reads also serve `SessionAssignment.tsx`, which credits a
saved session's original allocation at its saved revision. Progress/clock
helpers also serve `movedBranchProgress.ts`. Preserve those contracts and
purposes; the chosen change belongs in snapshot orchestration. If implementation
changes a shared contract, extend proof to its affected purpose before delivery.

Follow [Architectural North Star — one backlog interpretation, separate
observation and presentation](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
and the [UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md): published
facts and transient reading state have separate owners; readable facts keep
their source and uncertainty. Accepted [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md)
keeps this feature-local design with the feature;
[ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) and
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
support one coherent observation model and bounded behavioral delivery.
The index and record statuses agree: ADRs 0000–0006 are Accepted; 0007–0009
are Proposed. No relevant supersession or conflict was found. No new North Star
topic or architectural decision is needed.

## Decisive premises and observations

All observations use product code at `96ddbe4a86473083a43ed0d551c8ea4eba5bc75c`,
before implementation, with Node `v24.5.0` and dependencies installed by
`npm ci --ignore-scripts --offline`. Playwright builds the actual app and serves
its preview through the real local read boundary and a synthetic `gh`. Only
GitHub answers and test-owned repository/session data are supplied by fixtures;
no prebuilt dashboard snapshot is injected and no live GitHub service is used.

| Premise | Consumed by | Observation and result |
| --- | --- | --- |
| Preparation and profiles really hold each other's completed facts, including completed done records. | Slice 1's remedy and proof entry point. | O1 and O2's temporary probe held the seed or Akiho's profile content. The other group's successful local responses and a valid done-record response finished first, but the card still showed both reading labels and no done card. Releasing the held answer showed the same valid assignment, plan count, and done story. Both baseline cases passed, reproducing the wait. |
| Slow done records, human attribution, and clocks already have useful independent results and bounded gaps. | Slices 1–2's preservation obligations. | O1 ran the done and profile-addition latency journeys through the actual reader, including the page's 30-second bound; their expected independent values and detail gaps passed. |
| A branch route depends on the profile and canonical plan evidence; trunk progress is not a fallback for a missing branch. | Slice 1's dependency join and source qualification. | The searched `progressRoute.ts` operations consume `owner`, `planPath`, and preparation; `SliceProgress.tsx` directly renders interpreted counts. O1's branch-progress journey exercised the resulting branch, trunk, conflict, missing, and unreadable cases successfully. Early preparation publication therefore needs a pending progress qualification until routing is known. |
| Timeout reporting, cancellation, and later recovery are observable at the page, not only at a helper. | Slices 2–3. | O1's detail-recovery journey retained a bounded gap and its standing read problem until a replacement read. Its project-isolation journey switched projects with a held detail, retained the new project's facts, open inspection and focus after release, and observed only that project's subsequent check. O2's root-recovery journey retained the earlier pinned snapshot after failed reads. All passed. |
| Whole-read completion has a real consumer beyond rendering. | Slice 1's final promise and launch preservation. | `shownSnapshotOf` passes `complete` to startup reconciliation, whose judgment checks it. O2's real-start journey published a Take in a test-owned bare origin, held its seed, kept actions protected while membership was visible, then restored them only after the full read and accepted publication were established. It passed. |
| The existing UI can preserve a reader's chosen column, open inspection, and focused control through partial updates. | Slice 4's reuse of presentation state. | O2's temporary probe used a paused page clock, reduced motion, and an 864×900 viewport. While the seed was held it paged to Taken/Recently done, opened the Taken story's inspection and focused its canonical link. After release and later details, the same view, inspection, and focus remained. O1's existing column-position journeys also passed. |
| Normal refresh and return-to-project journeys use the real observation owner and pinned record interpretation. | Slice 3's replacement path and assignment display. | O3's automatic-refresh journey read new membership, detail, and pinned links, retained focus, and inspected the actual `gh` calls. Project-isolation journeys exercised late success/failure and return to the original project; roster journeys consumed profiles and their readable/unreadable assignments in the real UI. All passed. |

Literal observation commands, run from the preparation workspace:

```sh
# O1 — passed after the locked dependencies were installed
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- published-facts-planning-probe.spec.ts recently-done-read-latency.spec.ts profile-addition-latency.spec.ts branch-slice-progress.spec.ts auto-refresh-detail-recovery.spec.ts auto-refresh-project-isolation.spec.ts dashboard-columns-kept.spec.ts --workers=2

# O2 — passed; the probe also observed reading context
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- published-facts-planning-probe.spec.ts responsive-session-reconciliation.spec.ts story-readiness.spec.ts auto-refresh-recovery.spec.ts --workers=2

# O3 — passed
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- auto-refresh.spec.ts project-read-isolation.spec.ts agent-roster.spec.ts --workers=2
```

The temporary probe was removed after these observations; it is investigation
evidence, not a product regression test. Its raw input used `sliceClockRecords`,
one record from the shared done-record renderer, and `holdingAnswer`; its
pre-release assertions captured today's withheld facts, not the desired remedy.
Execution writes the opposite observable expectations for the selected outcome.
These observations establish a usable proof route and current behavior, not
implementation completion or a production speedup.

## Promise and proof ownership

| Final promise | Owning slice and observable proof |
| --- | --- |
| Preparation, profile assignments including preparers/roster, and done records appear independently; subsequent groups retain read facts. | 1: held-answer built-preview journeys exercising each delayed group and different release orders. |
| Real evidence dependencies, branch provenance, credited humans, clocks, and whole-read completion remain honest. | 1: pending-route assertions, existing branch/done/addition journeys, and startup reconciliation held until all details settle. |
| Waiting and unsuccessful evidence never imply absence; bounded gaps preserve completed groups and recovery policy. | 2: ordinary failure and 30-second bound journeys, plus existing detail/root recovery. |
| Opening, switching/returning, and new revisions read pinned facts without borrowing old details or accepting obsolete callbacks. | 3: published revision replacement and project-switch/return journeys; source links, record values, and subsequent `gh` calls are observed. |
| A still-present story retains its chosen column, inspection, keyboard focus, and reading position through independent arrivals. | 4: a real narrow-view interaction during held reads followed by successive releases. |
| Membership is complete before display; published reading remains through the local boundary and shared interpreters. | 1 and 3: existing full-path fixture, readiness and root-recovery journeys, with source and membership assertions in new arrival/isolation proof. |

## Ordered slices

### 1. Completed fact groups become usable independently

Type: Behavior
Status: done
Proof: New `dashboard/tests/published-facts-arrival.spec.ts`, through
`dashboardTest.ts` and held raw GitHub answers, plus the existing done/addition
latency, branch-progress, story-readiness, and startup-reconciliation journeys.

Behavior: After pinned membership appears, completion of preparation, profiles,
or done records publishes that group's useful facts while the unrelated groups
remain pending. Releasing those groups in another order retains all read facts.
Profile facts consistently name cards and the roster; canonical preparation
facts appear without inventing ownership or progress from an unknown route.
Dependent progress and clocks become available from their required evidence,
with existing human and clock updates retained. Startup actions still wait for
the complete observation when reconciliation requires it.

Change the existing read assembly and completion ownership together. Establish
the pending snapshot before any detail callback can publish; retain settled
group results in the current observation and compose them without stale whole
snapshot replacement. Start independent work without the unrelated join while
keeping the genuine preparation/profile join for progress. Keep cancellation
checks and the existing bound on every path from this first slice. Reuse current
loading and gap meanings, making an unfinished group's state visible where
needed. Keep local-session listing behavior and published source links intact.

Outside-in cases include both directions of the preparation/profile wait, fast
done records with another group held, and successive group releases. Supply
records for a Taken owner, a queued preparer, useful canonical facts, and a done
story; observe their real cards/detail and the roster. With profiles held, assert
no falsely established branch or trunk progress. With a settled startup and
one detail still held, assert reconciliation remains waiting; release it and
observe normal completion. Reuse the observed latency/branch journeys as
regression proof rather than reimplementing their histories in another suite.

Safe stop: Normal reads deliver available facts earlier, with current source,
timeout, cancellation, and launch gates preserved. The remaining slices directly
qualify the new arrival paths at failure, replacement, and interaction boundaries.

Accepted execution proof: `published-facts-arrival.spec.ts` observes four release
orders through raw held GitHub answers. Its assertions see owners, preparers,
credited humans and roster independently of canonical preparation; canonical
purpose, readiness, dependencies, plans and pinned links independently of
profiles; and done cards independently of both. Route counts remain pending
until preparation and profiles establish their source, then branch/trunk counts
and clocks appear. Later releases retain all completed values. The startup
reconciliation journey keeps actions protected until the whole read completes.
No dashboard snapshot or product hook supplies those outcomes.

Passing terminal commands in the execution checkout:

```sh
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- published-facts-arrival.spec.ts recently-done-read-latency.spec.ts profile-addition-latency.spec.ts branch-slice-progress.spec.ts story-readiness.spec.ts responsive-session-reconciliation.spec.ts auto-refresh-detail-recovery.spec.ts auto-refresh-project-isolation.spec.ts --workers=2
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- auto-refresh.spec.ts auto-refresh-recovery.spec.ts auto-refresh-rate-limit.spec.ts auto-refresh-visibility.spec.ts auto-refresh-detail-recovery.spec.ts auto-refresh-project-isolation.spec.ts --workers=2
npm run typecheck:dashboard
# After independent refactoring:
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- published-facts-arrival.spec.ts published-work.spec.ts --workers=2
# After mechanical lint repairs to the saved core-cutoff result and typed fixture strings:
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- published-facts-arrival.spec.ts auto-refresh-detail-recovery.spec.ts recently-done-read-latency.spec.ts profile-addition-latency.spec.ts --workers=2
npm run typecheck:dashboard
git diff --check
```

Independent refactoring retained the assembly/lifecycle behavior and extracted
the existing backlog projection and raw arrival fixture; enduring reading
documentation now lives in `dashboard/PUBLISHED-OBSERVATION.md`, linked from the
README. Shared session-assignment and moved-branch helper contracts did not
change. Failure, replacement and reader-context promises remain owned by slices
2–4, rather than claimed complete here.

Consequential learning: preparation availability no longer implies profiles or
the whole read have settled. Refresh-count/timing starting checkpoints now
explicitly observe owners after membership and preparation; their existing
count and cadence assertions are retained. Initial proof failures exposed an
invalid missing-settings fixture and these incomplete starting checkpoints;
the raw settings record and checkpoint setup were corrected before the above
passing terminal results. The lint-only async-flag repair returns the saved
core-bound result from the task without moving its cutoff.

### 2. A group's failure leaves other read facts useful

Type: Behavior
Status: planned
Proof: New `dashboard/tests/published-facts-failures.spec.ts` and existing
`auto-refresh-detail-recovery.spec.ts`, `auto-refresh-recovery.spec.ts`,
`recently-done-read-latency.spec.ts`, and `profile-addition-latency.spec.ts`.

Behavior: With assignments and done records already shown, an ordinary canonical
read failure or the existing 30-second bound replaces unread preparation with
its explicit gap without withdrawing those facts. A failed profile read leaves
an assignment/roster gap, not an empty successful assignment read; failed done
records leave the column's gap while read preparation and owners remain useful.
A failed root read retains the prior pinned snapshot, and the existing reload
and unchanged-check recovery rules continue to apply.

Exercise failure through GitHub responses, and advance the paused page clock for
the existing bound. Verify no orphan reading indicators after settlement, no
unhandled page error, preservation of completed values, the appropriate local
or standing read problem, and the existing recovery action. Keep cleanup and
task settlement under the read's lifecycle owner. Extend that owner if the new
arrivals expose a failure; add no independent retry policy.

Safe stop: The available-facts behavior remains useful when a read fails or
stalls, and its uncertainty and recovery are explicit.

### 3. Only the current project's observation can gain facts

Type: Behavior
Status: planned
Proof: New `dashboard/tests/published-facts-isolation.spec.ts` plus existing
`auto-refresh.spec.ts`, `project-read-isolation.spec.ts`, and
`auto-refresh-project-isolation.spec.ts`.

Behavior: After a complete revision A observation, publication of B replaces
membership at B; fast B assignments appear while B preparation or done records
are held, and no A facts masquerade as B facts. A project switch abandons every
unfinished group; its success or failure cannot update the new selection.
Returning to that project reads its current revision afresh, even while an
earlier read for the same project has a held answer.

Use actual page selections and published revisions, with distinct content and
source evidence. For an overlapping same-project case, hold A's details, switch
to another project, publish B on the original project, and return before the
old answer is released. Observe B's partial facts, release the abandoned answer,
and verify values, source links, read status and focus remain B's. Verify later
real request turns and the next scheduled check also belong to the current
observation; assert no page errors. Reuse the established cancellation owner
rather than adding a second project/generation registry.

Safe stop: More independent callbacks cannot revive an abandoned project or
create a view assembled from different backlog revisions.

### 4. Facts arriving preserve the reader's place

Type: Behavior
Status: planned
Proof: New `dashboard/tests/published-facts-reading.spec.ts`, reusing
`dashboardColumnsPage.ts` and `cardControls.ts`, plus existing
`dashboard-columns-kept.spec.ts` and the refresh focus journey.

Behavior: While unrelated groups are held, a developer pages to a column,
scrolls to a still-present story, opens its inspection and focuses an available
control. Each subsequent group arrival updates its facts in place while the
chosen columns, open inspection and valid focused control remain. The page does
not reset to the overview/top. Project switching remains usable during the read.

Use the real card and column controls in a narrow viewport with reduced motion
for deterministic navigation; keep the chosen story and control present for the
whole example. Release groups separately, asserting context after each useful
arrival, including an ordinary failure gap. Observe the visible reader context
and avoid an exact pixel-offset invariant when content reflows naturally.
Retain identity-based cards and current UI state; correct an implicated remount
or focus effect only if the journey exposes it. No new paging or motion feature
is part of this slice.

Safe stop: Independent arrival is usable during actual reading, and the story's
promises are covered across success, failure, replacement, and interaction.

## Verification, sizing, and delivery

Each slice owns its product changes, outside-in proof, and cleanup together.
Write or extend only meaningful behavior tests at the existing host seam;
never inject a prepared snapshot or add a product test hook. Passing a helper
does not stand in for seeing its consumer's result. The quiet reporter requires
silent passing journeys; clear conflicting color environment variables as in
the observed commands. The fixture rebuilds the production app for every run.

At each changed slice, run its new spec and the named regressions it reaches:
`env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- <spec files> --workers=2`.
Run `npm run typecheck:dashboard` for the changed dashboard orchestration and
rendering contracts. This compiler check is selected for the affected typed
interfaces; Playwright alone does not check them. Extend the regression set
when a shared fixture/helper change affects another consumer; do not require
the full repository suite solely because hosted CI runs it.

Execution follows the installed post-change-refactoring and delivery workflow.
The local commit gate is the check-only `.githooks/pre-commit`, which runs
`npm run --silent lint -- --staged`. Hosted checks remain owned by execution's
publication/CI workflow. Keep enduring reading behavior in the affected tests
and `dashboard/README.md` as it is delivered; this temporary plan supplies no
new documentation home or architectural exception.

No numeric slice target, hard limit, or S/M/L bands were supplied. Each slice
has one proof loop and a bounded concern: group composition and real dependency
joins; failed settlement; observation ownership; reader context. The first is
the largest because final-promise and progress semantics must remain coherent;
it is limited to the existing observation path and includes its regression
proof. A separate Structure slice has no independent need, and splitting that
assembly by group would encourage special-case publication paths. If execution
disproves the boundedness or an observed premise, safely stop and revise the
remaining plan within the same outcome; story-boundary changes stay with Terry.
