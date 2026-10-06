# Show available dashboard facts promptly

**Identity:** SEED-113#show-available-facts-promptly
**Source:** [refined story](../../seeds/SEED-113-dashboard-github-responsiveness.md#show-available-facts-promptly).
**Prepared:** 2026-10-06. Original execution-ready plan and its observations are
recoverable at `4f535d246471416caf873051c5250f6d05a8f845`; this same plan retains
current decisions, judged proof and execution state in a compact form.

## Execution identity

Story Branch Mode, authorized by Terry's `dough-execute-plan` invocation.
Workspace: `/Users/terryyin/git/open-dough/.worktrees/show-available-dashboard-facts-promptly`.
Branch: `codex/show-available-dashboard-facts`.
Starting revision: `4f535d246471416caf873051c5250f6d05a8f845`.
Originating/integration/default checkout: `/Users/terryyin/git/open-dough`.
Publisher: `codex-dashboard-facts-20261006`; assigned agent: `mike.li-chan`.
Take accepted on `origin/main`: `ead6c3a656b0f1d26f067b84e2d2411d05ddf92d`.
Increments publish to `origin refs/heads/codex/show-available-dashboard-facts`.

Setup passed: `npm ci --offline --no-audit --no-fund` and
`npm run typecheck:dashboard`, unchanged lockfile, Node `v24.5.0`.
Bounded replanning authority retained; no numeric slice budget or bands supplied.
Check-only `.githooks/pre-commit` runs `npm run --silent lint -- --staged`.
Coordinator owns `npm run format`, agent commits and managed increment delivery.
No Ready renewal is required for execution records.

CI: GitHub Actions `ci.yml`, push trigger and selector verified. Observer
repository `terryyin/open-dough`, branch `codex/show-available-dashboard-facts`,
coordinator `codex-dashboard-facts-20261006`, checkout-bound
`.agents/skills/dough-execute-plan`; yielded cell `138`, PTY `91572`, PID `66922`,
mailbox `/tmp/dough-ci-501/watch-5B7G8A`. Managed deliveries reuse this observer.
The trunk Take has no observation receipt; branch completion is separate.

Accepted published increments (no reconciliation; observer reused each time):

- Slice 1: `cba2dedfe40de7bf9c7956e974b2021c279cd5fe`.
- Slice 2: `9baca4db8d9509dd20d6ba8869202eb641836c4b`.
- Slice 3: `31458fce60b1a38c982dec7d6214657c85de12e9`.
- Slice 4: `eaa279dc026764cdb96d5abe54d7d8533163af08`.

## Goal, boundaries and current decisions

After complete pinned membership, preparation, profiles/assignments/roster and
done facts appear independently. Later arrivals retain established facts and
source qualifications. Preserve credited humans, progress, clocks, local
sessions, startup's whole-read gate, inspection, focus and the reader's place.
Waiting, successful absence and unavailable evidence remain distinct. Keep the
30-second bound, root/detail problem distinctions and existing recovery policy.
Replacement and project selection abandon all earlier callbacks.

Request sharing, rate-limit scheduling, reuse across commits, per-file streaming,
new polling/concurrency/authentication/retry/cache/layout/launch policy are
separate stories. No production latency threshold or API-count claim is made.

Valid PFE: `publishedWorkRead.ts` owns current group assembly and final promise;
`publishedObservation.ts` owns abort/replacement and invokes `workFocus.ts`.
`publishedBacklog.ts` uses the shared backlog interpreter. Reuse existing
preparation, profiles, attribution, done, progress and clock readers; add no
observation store or generation registry. Every publication composes accumulated
facts, and every started task is settled on completion, failure or abandonment.
Preparation and profiles genuinely join for progress routing; clocks need plan
and allocation evidence. An unrelated done read is never a prerequisite.

Shared saved-session allocation credit and moved-branch helper contracts remain
unchanged. Extend proof if later work changes them. Follow the
[North Star: one backlog interpretation, separate observation and presentation](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation),
[UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md), and Accepted
[ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md),
[0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) and
[0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
ADRs 0000–0006 are Accepted; 0007–0009 Proposed. No conflict/supersession found.

Original premises were observed at `96ddbe4a86473083a43ed0d551c8ea4eba5bc75c`:
preparation and profiles withheld each other's completed facts and fast done;
slow done/human/clock reads already had independent gaps; progress needed real
profile/plan evidence; startup consumed whole-read completion; existing abort,
refresh and narrow-view controls were suitable owners. Original O1–O3 commands
and temporary-probe disposition remain in the execution-ready plan's Git record.
These are investigation provenance, not implementation or production timing.

## Ordered slices and judged proof

All browser commands below use the actual built preview, production local read
boundary and synthetic `gh` with raw published records. No dashboard snapshot
or product test hook supplies the expected result. Full named specs are selected;
passing terminal results are explicitly distinguished from diagnosed failures.

### 1. Completed fact groups become usable independently

Type: Behavior
Status: done
Proof: `published-facts-arrival.spec.ts`, `publishedFactsAssertions.ts` and raw
`publishedFactsArrival.ts`. Four release orders observe owners, preparers,
credited humans and roster before preparation; purpose, readiness, dependencies,
plans and pinned links before profiles; and done facts before either. Pending
progress stays honest until its route joins, then branch/trunk counts and clocks
appear. Later updates retain all facts. Startup stays protected until completion.

`publishedWorkRead.ts` assembles current results and awaits/settles every task.
Independent refactoring extracted the shared backlog projection and raw fixture,
and moved enduring reading behavior into `dashboard/PUBLISHED-OBSERVATION.md`.
Passing terminal implementation/regression commands:

```sh
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- published-facts-arrival.spec.ts recently-done-read-latency.spec.ts profile-addition-latency.spec.ts branch-slice-progress.spec.ts story-readiness.spec.ts responsive-session-reconciliation.spec.ts auto-refresh-detail-recovery.spec.ts auto-refresh-project-isolation.spec.ts --workers=2
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- auto-refresh.spec.ts auto-refresh-recovery.spec.ts auto-refresh-rate-limit.spec.ts auto-refresh-visibility.spec.ts auto-refresh-detail-recovery.spec.ts auto-refresh-project-isolation.spec.ts --workers=2
npm run typecheck:dashboard
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- published-facts-arrival.spec.ts published-work.spec.ts --workers=2
# After mechanical core-cutoff/fixture typing repairs:
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- published-facts-arrival.spec.ts auto-refresh-detail-recovery.spec.ts recently-done-read-latency.spec.ts profile-addition-latency.spec.ts --workers=2
npm run typecheck:dashboard
git diff --check
```

Learning: preparation availability is no longer a settled-profile precondition.
Initial failures exposed missing valid raw project settings, a vacuous owner
wait before cards existed, and refresh count/cadence checkpoints before profiles
settled. Valid settings and explicit card-owner starting observations corrected
setup; count/cadence expectations remained. The lint repair returns the saved
core-bound result from its task without moving that cutoff.
Safe stop: useful early facts with source, bound, cancellation and startup gates.

### 2. A group's failure leaves other read facts useful

Type: Behavior
Status: done
Proof: `published-facts-failures.spec.ts`: canonical, profile and done failures,
plus core preparation pending at 29,999 ms and its standing problem at 30,000 ms.
Completed groups survive; positive gaps reject false absence; the ordinary roster
shows unknown assignments. No orphan reading/page errors remain. An unchanged
check reads no content and preserves the problem; reload closes it at the same
revision. Existing root recovery retains the earlier snapshot; later detail gaps
remain local. `workEntryFacts.ts::planSlicesFor` now preserves unavailable
preparation as unavailable plan evidence, keeping genuine absence unchanged.

Passing terminal proof (then both affected specs again after shared assertion
refactoring):

```sh
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- published-facts-failures.spec.ts auto-refresh-detail-recovery.spec.ts auto-refresh-recovery.spec.ts recently-done-read-latency.spec.ts profile-addition-latency.spec.ts published-facts-arrival.spec.ts story-readiness.spec.ts published-work.spec.ts branch-slice-progress.spec.ts --workers=2
npm run typecheck:dashboard && git diff --check
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- published-facts-failures.spec.ts published-facts-arrival.spec.ts --workers=2
npm run typecheck:dashboard && git diff --check
```

Learning: initial proof exposed false absent-plan reporting and an incorrect
assumed recovery-message substring. A failed canonical also blocks other plan
path authorization in `server/reachablePaths.ts`; the queued purpose already
read stays useful with readiness/plan gaps. Corrected that extra queued-plan
success assertion; per-file independence and authorization changes stay deferred.
Only preparation projection and raw fixture support changed; their consumers
are covered, saved-session/moved-branch contracts unaffected.
Safe stop: completed facts remain useful through failure and bounded settlement.

### 3. Only the current project's observation can gain facts

Type: Behavior
Status: done
Proof: five `published-facts-isolation.spec.ts` journeys; raw distinct revisions
in `publishedFactsIsolation.ts`, current/obsolete facts and real request checks
in `publishedFactsIsolationAssertions.ts`, context in its journey helper.
Complete A explicitly observes credited humans and clock before B. Partial B
shows current membership/assignments/roster while preparation/done are held,
without A facts/links. Late success/failure of all three held A groups cannot
change Doughnut or same-project B after return. Inspection, focus, source, read
status and retrieval remain current; subsequent requests and scheduled checks
name the selected repository/revision. No page errors. No product change needed.

Passing terminal proof:

```sh
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- published-facts-isolation.spec.ts --workers=2
npm run typecheck:dashboard
git diff --check
# After refactoring shared held-group answers and Doughnut selection:
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- published-facts-isolation.spec.ts auto-refresh.spec.ts project-read-isolation.spec.ts auto-refresh-project-isolation.spec.ts published-facts-arrival.spec.ts published-facts-failures.spec.ts --workers=2
npm run typecheck:dashboard
git diff --check
# After arrow-function receiver repair:
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- published-facts-isolation.spec.ts published-facts-arrival.spec.ts published-facts-failures.spec.ts --workers=2
npm run typecheck:dashboard && git diff --check
```

The initial four-spec isolation/refresh selection exited 1 only on new negative
assertions targeting absent cards in Doughnut's empty Taken stage. Corrected
locators and optional card-name typing; the passing six-spec run above replaces
that failed command. Formatting found an unbound test method; a type-only
receiver annotation conflicted with another lint rule. Final `releaseAll` uses
an arrow closure, with replacement proof and independent review. Shared holding
and Doughnut setup have one test owner; production contracts remain unchanged.
Safe stop: independent callbacks cannot revive obsolete observations.

### 4. Facts arriving preserve the reader's place

Type: Behavior
Status: done
Proof: new `published-facts-reading.spec.ts`, existing
`dashboard-columns-kept.spec.ts` and refresh focus journey.

In a narrow reduced-motion view, page to Taken/Recently done, actually scroll to
a still-present story, open inspection and focus its available control. Release
groups separately, including an ordinary failure gap. Chosen columns, inspection,
valid focus and visible reading context remain; allow natural content reflow,
without an exact pixel-offset invariant. Project switching remains usable.
Correct only an implicated presentation/focus owner; no paging/motion redesign.

Execution learning: the 864×480 journey exposes preparation expanding above a
focused canonical link and shifting it outside the viewport, despite retained
DOM focus/inspection/columns. The earlier 864×900 probe did not establish this
scrolled context. Capture visibility in the existing observation/focus owner
before each publication and minimally reveal a formerly visible control after
render; respect a reader who deliberately scrolled away. No new store is needed.

Implementation proof: three reading journeys observe the scrolled inspection,
pinned link visible below the banner, focused control and chosen columns after
profiles, done success/failure and preparation; a real wheel-scroll-away journey
keeps its deliberately off-screen focus. The initial no-op-scroll setup was
corrected. Expanded accessibility proof exposed capture of fallback-card focus
overriding a deferred plan link; deferred role precedence now remains intact.
Passing terminal commands (all named full specs):

```sh
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- published-facts-reading.spec.ts branch-progress-reading.spec.ts auto-refresh-branches.spec.ts dashboard-columns-kept.spec.ts auto-refresh.spec.ts story-readiness-accessible.spec.ts agent-roster.spec.ts published-facts-isolation.spec.ts auto-refresh-project-isolation.spec.ts project-read-isolation.spec.ts --workers=2
# After restoring the sensitivity experiment:
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- branch-progress-reading.spec.ts auto-refresh-branches.spec.ts --workers=2
npm run typecheck:dashboard
git diff --check
```

No raw fixture or fact-reader contract changed; session navigation's existing
`keepInView`, `workHolding` and `returnFocusTo` remain unchanged.
Independent refactoring unified group and moved-branch publication/capture. The
moved-progress journey fails with the original bypass (focused link offscreen),
then passes with the final path restored. Assertions share `readingPlace.ts`;
no new state owner was introduced.
Safe stop: available facts stay usable during actual reading.

## Verification and delivery

Fresh implementation and independent refactor per slice; coordinator accepts
actual setup/assertions, formats, updates this plan, stages, agent-commits and
publishes before the next slice. Verify changed contracts/consumers, not a blanket
suite. Every started verification is owned to terminal. No live-service timing
or API savings are inferred from synthetic proof. Retain this plan/owned branch
for automatic retrospective, completion publication/CI handoff and later wrap-up.

## Execution complete

Product advice: Preserve the current order of observer request sharing, consistent rate-limit recovery, and unchanged-content reuse. This story establishes earlier useful facts and honest gaps; it makes no production latency or request-count savings claim. Outcome review found no required correction; process review used available coordinator history and agent reports, with full internal agent histories unavailable and no supported process-log change. CI remains pending until execution's completion operation.
