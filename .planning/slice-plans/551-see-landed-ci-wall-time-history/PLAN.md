# See landed CI wall time change over time

**Identity:** SEED-285#see-landed-ci-wall-time-history
**Source:** [selected story](../../seeds/SEED-285-landed-ci-timing-history.md#see-landed-ci-wall-time-history)
**Source review:** [source-only review](source-review.md)

## Goal and scope

A developer reading Project Intent's **CI status** sees a line of CI wall time
across the newest 20 distinct measured builds of dashboard-recorded trunk
landings. The heading gives the actual count and date span. Gaps are labelled:
pending, failed, or unavailable. A readable evidence list gives each point's
provenance (exact, reused equivalent, later trunk build) and build link.
A background collector fills a machine-local history after each recorded
landing and on start. The chart reads only that history.

The story's Scope and Key examples are the source. Material exclusions are
the moving average, Done-story history, test-scope history, reruns, a time-span
window, and trunk builds no recorded landing names. No change to the Done-story
CI comparison, the CI status judgment, or the request lifecycle of its
**Check again**. This preparation authorizes no implementation.

Assumption: the adapter limitation is the shared Landed rule's. The rule's
cancelled → later-build and skip-equivalent paths are GitHub Actions only
(`baseCiRevisionLookup.ts` gates on `adapterAttempt === undefined`, and
`proofRunOf` needs a GitHub run). For a `ciAdapter` project, a cancelled or
skipped landing therefore becomes an explained gap. Exact adapter builds are
measured when discovery supplies `startedAt`/`completedAt`, as Pygardon's
discovery does (`pygardon-ci-discovery.mjs:134-135`). Extending the rule for
adapters is not part of this story.

## Architecture and existing solutions

Follow [ADR 0008 — durable project state and local operational state](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
and the [Architectural North Star topic](../../NORTH-STAR.md#one-intent-workspace-with-landed-ci-evidence).
The history is derived local evidence, rebuildable from retained landing records
and CI, with no server database. No Accepted ADR conflict. No new North Star
topic is needed.

PFE at `dcd7f0e3b`:

- **Landing event.**
  - `submitLanding` (`dashboard/server/launchLandingReporting.ts:29`, returning
    at 142) writes the accepted landing into `agent-launches.json` in the
    dashboard server process.
  - `submitRetainedLanding` (`launchLandingRetained.ts:17`) and late
    `bindRecord` (`launchRecordBinding.ts:26`) also write landings.
  - So the collector takes landings from a scan of `readStoredRecords()`,
    nudged after `submitLanding`, and not from one hook alone. The scan also
    covers restarts, landings recorded before release, and another process's
    landings.
- **Landing → build.** Reuse `lookupResultBuild(revision, revision, lookup,
  call, workflow, …, storyBranchLandedExactLookup(…, `origin/<ref>`))`
  (`baseCiRevisionLookup.ts:135`, `exactSkippedEquivalent.ts:47`), with the
  setup from `lookupContext` (`intentCiComparisonSlots.ts:90`). It already
  handles:
  - exact builds;
  - the confirmed-skip equivalent;
  - cancelled → later trunk build, including `awaitingLaterBuild`.

  It returns a `failed` build as a slot; the collector turns that into a
  **Failed** gap. Wall time comes from `wallTimeMs`
  (`dashboard/src/ciProofTimeWords.ts:56`) over the slot's
  `startedAt`/`completedAt`. Do not write a second Landed rule.
- **Finality.** Pending is the non-final set that `isFinalCiComparisonAnswer`
  (`intentCiComparisonAnswers.ts:33`) excludes: running, `awaitingLaterBuild`,
  and transient unavailable. Re-check pending entries with
  `repeatUntilStopped` (`repeatingCheck.ts:10`). Construct the collector and
  close it in `installAgentLaunchMiddleware` (`launchBoundary.ts:88-121`), as
  `FeedbackMaintenanceCheck` is.
  - Only the production-environment process collects, as
    `FeedbackMaintenanceCheck` gates at `feedbackMaintenanceCheck.ts:217`.
    The landing reporting origin is the production dashboard.
  - Both environments read the store.
- **Store.** A new `MachineJsonStore` (`machineJsonStore.ts`, with
  `storyReviewMarks.ts:34-45` as the model) under
  `machineDashboardPath("landed-ci-history.json")`.
  - Its lock and replace make collection idempotent across processes,
    duplicate reports and restarts.
  - Key observations by project and landing receipt, and points by measured
    run and attempt, so one build is stored once.
  - Bound the store per project to what the newest-20 window and its gaps
    need, keeping the landing references independently of the 30-day
    expiry of launch records.
  - Retained answers (an LRU) are not the store.
- **Read and UI.**
  - A new authenticated read kind beside `intent-ci-status`
    (`performedRead.ts:143`, `readingRequestedRead.ts:50`,
    `src/authenticatedReadRules.ts`) answers from the store only.
  - The client shows the panel in `JudgedBranch`
    (`src/IntentCiJudgedBranch.tsx:75`), only for trunk, after
    `IntentCiProof` and before **Check again**. It re-reads whenever
    `useIntentCiJudgment` re-reads trunk.
  - The chart is the dashboard's first hand-written inline SVG. No chart
    dependency. Follow the project panel in the
    [mockups](intent-landed-ci-mockups.html), without average, exclusions or
    difference figures.
  - Colour tokens go in `src/intent-ci-history.css`, derived from the frame tokens, because the frame has no dark scheme.

The common rule is "each recorded landing resolves through the Landed rule to
one build, or to one gap with its reason". Pending, provenance and window are
states of that one model, not separate recognizers.

## Outside-in proof ownership

Arrange domain data through the shared MakeMe API
([test data architecture](../../../tests/README.md#test-data-architecture)):
`aLaunchRecord` / `aLaunchLanding` / `aLandingSubmission` for landings,
`aCiRun` / `aCiAdapterAttempt` for CI. State revisions, conclusions and times
at the call site. Fake GitHub through `fakeGitHub.ts` and `baseCiActions.ts`
(`publishProject(...).serveCi(trunkCi(...))`). Do not stub the history answer
the collector must establish. Wait for the observable history change, never a
wall-clock delay. A collector re-check interval may be configured short through
`configuredLimit` for tests. Use the default test timeout.

| Final promise | Owner | Observable proof |
| --- | --- | --- |
| A landing is collected without Intent open, and its exact successful build appears as a point with wall time, exact provenance and run link | 1 | Boundary spec (`backend-tests/intent/`): submit a landing through `/__agent-launch/landing` with a fake trunk run 10:00→10:06:05. With no browser open, the history read eventually answers one exact point at 6 min 5 s. Journey (`tests/intent/`): Project Intent **CI status** shows the chart (an accessible image named for CI wall time) and the **Builds and evidence** list item with date, `6 min 5 s`, exact and its run link. |
| The heading states the actual measured count and date span. No landings, or none measured yet, says so in words with no chart. The current judgment is unchanged | 1 | Same journey: 1-point and 0-landing projects. Assert the heading wording, the empty-state text, and that the existing status line and Proof are intact. |
| Pending CI is a gap at the end that becomes a point once CI completes, shown on the next trunk reading refresh with no timed client polling | 2 | Journey with a running fake run: pending gap reason in the list. Complete the run and move trunk (existing `moveTrunk`/revision journey) → the point appears. Assert that history reads follow trunk re-reads only, through request accounting. |
| Restart while pending, a repeated Done report, and landings recorded before the capability arrive collect exactly once | 2 | Boundary spec: seed `agent-launches.json` landings in the isolated HOME before start. Start, complete CI, restart the server, and submit the same landing again → one point per build and one observation per landing. A development-environment server does not collect but reads the same store. |
| A confirmed skip reuses its equivalent build. Several landings on one build make one point naming them. A not-yet-plotted equivalent is labelled reused with its build identity. A missing equivalent is a gap | 3 | Journey: an execution landing at `a1` plus two planning-only landings whose equivalent is `a1` → one point naming three landings, count 1. A skip whose equivalent `c3` is unmeasured elsewhere → reused point naming `c3`. Without equivalent timing → "equivalent timing unavailable" gap. |
| A cancelled landing joins the nearest later trunk build, labelled as such and counted once. A failed build is a **Failed** gap with its run link and no plotted value | 3 | Journey: cancelled `d4` with later success `d6` (also a landing) → one `d6` point naming both, labelled later trunk build, with no break in the line. A failed `e5` → the list shows Failed with its link, and the chart draws no point for it. |
| The window holds the newest 20 distinct measured builds in trunk order with their gaps | 3 | Boundary or module test over the history read: 35 measured builds → 20 newest plus their interleaved gaps; the heading says "20 measured builds" with the span. |
| Adapter exact builds are measured the same way. Adapter cancelled or skip landings are explained gaps | 3 | Extend the adapter journey (`intentCiAdapterProofProject.ts`) with one timed exact attempt → a point; a cancelled adapter attempt → a gap with its reason. |
| Phone width, keyboard and screen reader get the same evidence without colour | 1 (panel), 3 (all states) | Narrow-viewport assertions in the journeys: the list is reachable by Tab and its items carry the words. The chart has an accessible name; points and gaps are distinguished by text in the list. |
| Maintained guidance describes the delivered behavior | 1–3 | Update `docs/dashboard-development-intent-ci-status.md` (history panel, cohort, gaps, provenance) and `dashboard/GITHUB-REQUESTS.md` (collector requests) in the slice that delivers each. |

## Ordered slices

### 1. Show a collected exact landed build in Project Intent

Type: Behavior
Status: done
Proof: slice 1 rows above.

A production dashboard records an accepted landing whose exact trunk build
succeeded → without Intent open, the collector resolves it through the Landed
rule and stores the observation → **CI status** in Project Intent shows the
history panel with one point, "1 measured build", its date, wall time, exact
provenance and run link. A project without measured landings shows the
empty-state words.

Includes:

- the store;
- the scan-and-nudge collector that resolves completed builds only (this slice
  needs no re-check);
- the read kind;
- the panel with its SVG chart and evidence list;
- CI status documentation.

Safe stopping point: the trend shows exact measured builds collected after
Done. Pending landings simply have no point yet. Sizing: one landing-to-point
proof loop through the existing Landed lookup, with new store, read and panel
plumbing.

Accepted proof (2026-11-09). Every run used `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`,
Homebrew Bash first on PATH, and `--workers=2`.

- **Focused (80 passed):**
  `npm run test:dashboard -- backend-tests/intent tests/intent/intent-ci-status-wall-time.spec.ts backend-tests/launches/agent-launch-start-session-landing-admission.spec.ts backend-tests/intent/landed-ci-history-collection.spec.ts tests/intent/intent-ci-wall-time-history.spec.ts`
  - `landed-ci-history-collection.spec.ts`: a real Story Branch integration's landing is collected with no page open, as one exact point. One `head_sha` listing is made, and a re-read asks GitHub nothing. A default test server collects nothing.
  - `intent-ci-wall-time-history.spec.ts` at 390×844 covers:
    - the heading, wall time, image name, keyboard path, item words and run link;
    - the empty state, with the judgment and Proof intact.
  - Failing-first runs and a nudge mutation failed as expected.
- **Consumers (all passed):**
  - Intent CI status and Proof journeys (42);
  - landing and boundary-lifecycle specs (28);
  - Intent request accounting (22);
  - authenticated-read specs (31);
  - typecheck exit 0.
- **After the refactor pass:** the invalidated part was rerun: focused 24, CI status and Proof 42, request accounting 22, and node tests for the Landed lookup, all passed. The remaining runs were reused.
- **Coordination boundary:** `tests/intent/intent-ci-comparison-retry.spec.ts` "Check again recovers a done Story Branch Baseline…" failed once under load. Its stale gap text satisfies the first wait, so one 5 s wait has to cover the whole re-read.
  - The `make-intent-location-source-and-candidate-test-s` and `make-machine-local-project-configuration-test-se` executions already hold uncommitted repairs of that exact wait, so this execution writes no duplicate.
  - Remaining gate: final target CI.

### 2. Keep collection trustworthy across pending CI and restarts

Type: Behavior
Status: done
Proof: slice 2 rows above.

A recorded landing whose CI is running shows as a pending gap. The collector
re-checks non-final entries until final. The client's trunk re-read shows the
point. Records already present at start, a restart while pending, a repeated
landing report, and a non-production process each give exactly one
observation per landing and one point per build.

Safe stopping point: the history is complete and durable for exact builds.
Sizing: one lifecycle proof loop. Pending, restart and duplicates are states of
the same idempotent collection, not separate outcomes.

Accepted proof (2026-11-09). Same wrapper and `--workers=2` as slice 1.

- **Focused (90 passed):**
  `npm run test:dashboard -- backend-tests/review/story-branch-landing backend-tests/intent tests/intent/intent-ci-wall-time-history.spec.ts tests/intent/intent-ci-status-wall-time.spec.ts`
  - New `backend-tests/intent/landed-ci-history-lifecycle.spec.ts` and `landed-ci-history-pending.spec.ts`:
    - records present at start;
    - restart while pending;
    - two collecting processes;
    - a development server with its own fake GitHub making no Actions call;
    - expired Done records;
    - the G1 no-run, queued and time-bound states;
    - an unread CI.
  - The journey "checking pending landings again" (`tests/intent/intent-ci-wall-time-history-pending.spec.ts`) runs at 390×844 with the page clock paused. It shows the pending gap, then reads that follow trunk readings and Check again only.
  - Failing-first runs against HEAD failed (4 of 5), and ten mutations were each caught.
- **After the refactor pass** (`nearestAncestorBuild` shared with the skip walk, `landedCiResolution.ts` extracted, specs split), the replacement focused proof passed:
  - `npm run test:dashboard -- backend-tests/intent backend-tests/review/story-branch-landing` (84);
  - `npm run test:dashboard -- tests/intent/intent-ci-wall-time-history.spec.ts tests/intent/intent-ci-wall-time-history-pending.spec.ts tests/intent/intent-ci-status-wall-time.spec.ts` (6);
  - `tests/intent/intent-ci-comparison-skipped.spec.ts` (7);
  - the completion-builder specs (7);
  - the Landed lookup node tests.
- **Consumers (all passed):**
  - CI status and Proof journeys (40);
  - request accounting (22);
  - landing and boundary lifecycle (30);
  - authenticated reads (204);
  - `backend-tests/launches` (332).
- **Load timeout:** one `backend-tests/launches/start-origin-isolation.spec.ts` "successive preparations install current working-tree source without a persistent cache" timed out at 30 s at load 37. It passed alone in 24.3 s at load 36–44; its recorded duration is 11.2 s. This change does not touch it. Its fixed bound under external load is recorded as a finding for correction.
- **G1 rule:** a landing with no run yet is pending until a later first-parent trunk revision has a run, or one hour after it was recorded on the server's observation clock.
- **Done-comparison finding for the developer:** the same no-run race reaches the Done-story CI comparison. It remembers a "No build" Landed slot for the life of the process. That is outside this story, which leaves the comparison unchanged.

### 3. Show provenance, gaps and the 20-build window

Type: Behavior
Status: done
Proof: slice 3 rows above.

These landings resolve through the same rule:

- a confirmed skip reuses its equivalent build;
- a cancelled landing joins the nearest later trunk build;
- a failed build is a gap;
- an unavailable equivalent or build is a gap;
- an adapter's cancelled or skipped landing is a gap.

The panel shows one point per build naming its landings, labelled
provenance, distinct gap reasons, and the newest 20 measured builds with their
gaps and date span.

Safe stopping point: the complete story promise. Sizing: the lookup already
yields each case. The work is mapping slot kinds to point or gap reasons,
grouping by build, and the window. That is one presentation-and-grouping
proof loop.

Accepted proof (2026-11-09). Same wrapper and `--workers=2`.

- **Node:** `bash scripts/test.sh tests/support/dashboard-later-trunk-landed.test.mjs tests/support/dashboard-story-branch-ci-adapter.test.mjs tests/support/dashboard-ci-adapter-revision-lookup.test.mjs` passed.
- **Backend:** `npm run test:dashboard -- backend-tests/intent` (81 passed). New specs:
  - `landed-ci-history-gaps`: expired, unreadable after an hour, and a build that ends before it starts read "not recorded";
  - `landed-ci-history-pending-sources`: skip, cancelled and adapter pending states (G4);
  - `landed-ci-history-window`: the store bound (G3).
- **Journeys:** `tests/intent/intent-ci-wall-time-history{,-pending,-provenance,-window,-adapter}.spec.ts` and `intent-ci-status-wall-time.spec.ts` passed.
  - Provenance: one point naming E, R1 and R2; the reused c3 point; "Equivalent timing unavailable" (R4 reads "No CI proof summary" after the G8 return); the d6 later-build point naming G and F with no line break; Failed with its run link and no point.
  - Window: the newest 20 of 35, in trunk order, with the gaps among and after them; "20 measured builds · Oct 16–Nov 4"; a rising, falling and varying line; no window chooser; a gaps-only history says none measured yet.
  - Adapter: points and explained gaps.
  - All run at 390×844 with the keyboard path.
- **Comparison journeys** that reach the shared Landed rule (skipped, cancelled landing and gaps, landing gaps, adapter): 33 passed. **Consumers:** CI status and Proof (40) and request accounting (22).
- **Failing first:** boundary specs 8 failed and journeys 3 failed against HEAD.
- **Load-sensitive tests:** this execution's slice 1–2 collection spec and pending journey timed out at 30 s under load 37–54. They now land through a cheaper real publication path and seeded MakeMe records. Both pass `--repeat-each=3` at load 16–20, and the history sets passed 11 and 8. Commitment 6.2 is now observed by the lifecycle spec's execution landing and the provenance journey.
- **Decisions:**
  - provenance is per landing on a point;
  - a landing is named by its short revision plus its story identity when it has one;
  - `cancelled` and `not-recorded` are added as distinct gap reasons;
  - an unreadable equivalent or later-build proof waits an hour as pending "CI not read yet" before it becomes final;
  - date order equals trunk order for every case the story names.
- **Shared Landed rule:** it gained optional `cancelled` and `unusableProof` no-build fields. The Done comparison answer is unchanged.
- **After the refactor pass** (`landedCiObservation.ts` extracted, one run-attempt copy, one window order, shared test support), the reruns passed:
  - the six `backend-tests/intent/landed-ci-history-*.spec.ts` (11);
  - the five history journeys plus `intent-ci-status-wall-time.spec.ts` (11);
  - the Landed lookup and `makeMe` node tests.
- **Pre-delivery consumer gate:** `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=<tmp> npm run --silent test:dashboard -- tests/intent backend-tests/intent backend-tests/launches --workers=4` selected 623 tests. All 623 passed, with strict status passed, in 8.2 min at load 6–15. Workers were raised from 2 because the load had dropped; coverage is unchanged.
- **Return after the retrospective (2026-11-09).** CI passed on `6f5be8b8a`. The execution retrospective's independent outcome review then found four story-promise gaps, recorded as `return` obligations G6–G9:
  - an unreadable proof stops the walk and can finalize a transient failure;
  - cancelled, expired and unreadable gaps lack their build link;
  - an adapter skip's reason is misleading;
  - the history has a second wall-time rule.
  The same return covers trunk-ordered fixtures and collection-built coverage of cancelled landings. Slice 3 stays done; its return is delivered as a further increment.
- **Return accepted proof (2026-11-09, load 4–11, `--workers=2`).**
  - Node: `bash scripts/test.sh` over the Landed lookup, adapter lookup, CI proof read, later-trunk build, revision-nearest and proof-breakdown tests passed.
  - `backend-tests/intent`: 84 passed. The history specs passed 14, and the gaps and lifecycle specs passed `--repeat-each=3` (18).
  - History journeys: 11 passed. Comparison journeys reaching the shared Landed rule: 33 passed. CI proof journeys: 19 passed.
  - Failing first against HEAD: node 2, backend 3 and journeys 4 failed.
  - **G7 rule:** only GitHub's answer settles a CI proof. An unanswered read (a directed wait, a failed request, a malformed listing) waits as "CI proof not read yet" while the landing stays in the window, and collection steps past it. GitHub's answers (no summary, expired, unopenable, invalid, mismatched, too large) are final at once.
  - **New wording:** G8's reason reads "No CI proof summary".
  - **Corrected premise:** a GitHub cancelled landing with no later build stays pending until a later build comes or the 30-revision bound passes, so the collected Cancelled gap comes from a timed-out landing.
  - **Developer findings left unchanged (shared Landed rule):** the cancelled walk passes over a later build whose proof read went unanswered, and the Done comparison keeps a transient unread Landed answer for the process lifetime.
- **After the return's refactor pass.** `unusableBuild.ts` and `landedWithoutVerdict.ts` were extracted, spec families split into `landed-ci-history-pending-proof`, `intent-ci-wall-time-history-{later,gaps}` and `dashboard-landed-exact-build`, and `runLinkOf` is shared. The reruns passed:
  - Node tests;
  - `backend-tests/intent` (84);
  - repeats (18);
  - history journeys (11);
  - every comparison consumer (76), including the retry spec.
  The pre-delivery consumer gate `tests/intent backend-tests/intent backend-tests/launches --workers=4` passed 626 of 626 with strict status passed, in 8.0 min at load 6–24.

## Execution complete

Product advice:

- **Learning question.** Recorded landings fill the 20-build window quickly enough for a useful trend.
  - On 2026-11-09 the newest 20 recorded trunk landings spanned 0.27 days for Open Dough, 4.1 days for Doughnut and 3.3 days for Pygardon.
  - Shared skips and cancelled landings make measured builds fewer than landings, so Pygardon fills more slowly than the story assumed (G5).
  - Slower projects such as terry-talks would take weeks. The heading's count and span show this.
- **Recommended bug story.** Make the shared Landed rule's transient states non-final for the Done-story CI comparison too. Today the comparison remembers two transient answers for the process lifetime:
  - "No build" for a landed revision whose run GitHub has not created yet;
  - a proof read GitHub left unanswered. The cancelled walk can also skip such a build.
  The history already waits on both. Moving the wait into the shared rule would make both views agree.
- **Developer decision.** Should a CI adapter skip reuse its equivalent attempt's timing without a CI proof summary?
  - The Landed rule requires the summary, so Pygardon's refinement skips (174 of its 371 recorded landings) are "No CI proof summary" gaps that break its line.
  - Reusing the timing changes the shared rule and the Done comparison, so it is a separate story.
  - Recommendation: queue it if Pygardon's trend is to be read.
- **Sibling story.** SEED-285#trace-landed-proof-timing (Taken, plan 554) keeps proof for "the same bounded retained cohort". This history keeps only the newest 20 measured builds per project, about a day of Open Dough landings, so most Done stories older than that would read history-unavailable. That execution should confirm the retained bound or widen it.
- **Wording.** The history says "reused equivalent" (the story's word) where the CI comparison says "equivalent build". Align them when the moving-average comparison story touches both views.

## Consumer trace and verification gates

Consumers of the change:

- `installAgentLaunchMiddleware` gains a collector. Boundary-mode tests that
  start servers must not start real collection against unfaked CI. Gate by
  production environment and confirm that test servers' environment does not
  collect unintentionally.
- `submitLanding` gains a nudge. The landing admission specs
  (`backend-tests/launches/*landing*`, `backend-tests/review/story-branch-landing-*`)
  must stay green.
- The new read kind changes the authenticated read rules, which
  `frontend-tests` and request-accounting journeys observe. The
  `intent-ci-status*` journeys and `GITHUB-REQUESTS.md` accounting assertions
  see the new panel and requests.

For each implementation diff, run the installed `consumer-trace.mjs` with
`--base HEAD` and terms for the touched exports, the read kind and the panel
labels. Disposition each consumer as run, reused or excluded with evidence.

Focused checks (from the repository root):

- Slice 1: `npm run test:dashboard -- backend-tests/intent tests/intent/intent-ci-status-wall-time.spec.ts backend-tests/launches/agent-launch-start-session-landing-admission.spec.ts --workers=2`, plus the new specs.
- Slice 2: `npm run test:dashboard -- backend-tests/launches backend-tests/review/story-branch-landing --workers=2`, plus the new lifecycle specs.
- Slice 3: `npm test -- tests/support/dashboard-later-trunk-landed.test.mjs tests/support/dashboard-story-branch-ci-adapter.test.mjs`, plus the new journeys.
- Changed dashboard code: `npm run typecheck:dashboard` and `npm run lint`.
- Before delivery: `npm run test:dashboard -- tests/intent backend-tests/intent backend-tests/launches --workers=2`. These are the shared CI status, landing and request-accounting consumer suites. A full repository run is not a local gate merely because hosted CI runs it.

**Local gate.** Follow [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake.

- On AC power, wrap long runs in **caffeinate -s -i**.
- On battery, plug in, or keep the lid open under **caffeinate -i** and
  inspect the sleep log.

Before expensive proof, inspect this host's load, memory and competing work.
Choose supported concurrency without reducing coverage. Use Homebrew Bash 5
first on PATH for npm scripts.

Follow [the project's failure policy as written](../../../AGENTS.md#failing-and-flaky-tests)
for every failing or flaky test and published CI, including attribution to the
base, preserving another active repair owner's work, and bounded human
exceptions. Use MakeMe for domain data and controlled clocks or observable
events rather than sleeps. Keep the default timeout, use no test.slow(), and
add no suite, file, group or hook timeout overrides.

## Decisive premises and retained observations

Observed in this owned worktree at `dcd7f0e3b` on 2026-11-09, on AC power,
load about 16–21 from other work. `npm ci --ignore-scripts --no-audit --no-fund`
established the local setup.

| Premise / consuming operation | Literal observation and profile | Result / unverified remainder |
| --- | --- | --- |
| Recorded landings carry the accepted trunk revision the collector consumes, in volume enough for a 20-build trend | `python3` read of `~/.open-dough/dashboard/agent-launches.json` (the production store the collector scans) | 494 Open Dough landings since 2026-10-10, each with `landing.revision`. Non-refinement landings average about 3–9 per active day across the six projects. |
| Landing revisions resolve to completed trunk builds under the Landed rule's cases | `gh run list --workflow ci.yml --branch main --event push --limit 100`, joined with the Nov 6–9 landings over `git rev-list --first-parent` | Of 68 execution landings: 49 exact success, 16 cancelled (10 with a later success, 6 with a later failure), 3 failed. Of 67 refinement landings, 60 skipped with a successful equivalent and 7 with a cancelled equivalent. Successful runs took 5–14 min. |
| `lookupResultBuild` with `storyBranchLandedExactLookup` resolves exact, cancelled → later and adapter revisions as a reusable single-revision call | `bash scripts/test.sh tests/support/dashboard-later-trunk-landed.test.mjs tests/support/dashboard-story-branch-ci-adapter.test.mjs` with Homebrew Bash first | Exit 0 under the quiet-pass rule. A collector call outside `performDoneComparison` is new code, and slice 1's failing-first boundary spec proves it. |
| Pygardon's adapter supplies attempt times for wall time | Read `~/git/pygardon/scripts/pygardon-ci-discovery.mjs:133-135` | `startedAt` and `completedAt` come from the service's attempt times when present. The live service's values are not observed here. An attempt without them is an explained "not recorded" gap, and the existing adapter wall-time spec covers that wording. |

No paid, credentialed, native-host or production-state premise is needed.
Slice proofs use FakeGitHub and isolated HOME stores. New behavior gets failing
observations before implementation.

## Current decisions

- Cancelled landings are measured by the nearest later trunk build with timing
  (Terry, 2026-11-09).
- Failed builds are labelled gaps with no plotted value (Terry, 2026-11-09).
- The window is the newest 20 distinct measured builds.
- One build is one point that names its landings.
- The history read acquires no CI data.
- Only the production-environment dashboard collects. Both environments read
  the store.
- A pass walks a project's trunk landings newest first and stops at 20
  measured builds. Every final resolution, build or gap, is kept by landing
  receipt, and each build once by run and attempt (slice 1).
- Dashboard test servers run in the production environment, so the harness
  sets `DOUGH_TEST_LANDED_CI_COLLECTION=off`. A collection spec turns it on through
  `extraEnv` (slice 1).
- The frame has no dark colour scheme. The history's colour tokens, in `src/intent-ci-history.css`, derive
  from the frame tokens instead of adding dark values (slice 1).

## Story obligations

### G1. A landing nudged before its CI run exists is kept as a final gap
Reported: slice 1 — "At acceptance, finalResolution keeps a none slot as final, and lookupResultBuild answers none with a no-build status when the landed revision has no run yet. The landing nudge follows the push, often before GitHub creates the run, so that landing would never be measured."
Story clause: "It waits while CI is queued or running and takes the result when it completes."
Disposition: proved by slice 2: dashboard/backend-tests/intent/landed-ci-history-pending.spec.ts 'a landing recorded before its trunk run exists…' (no run yet is a pending gap waiting for a run, then queued, then the exact point), 'a landing whose push never gets a run…' (final only after the hour on the controlled observation clock) and 'landings recorded before collection starts…' (the unbuilt landing is final once CI built past it)

### G2. Final gaps are kept but not listed
Reported: slice 2 — "final gaps are kept but not answered, so a landing that becomes a final no-build simply leaves the list until slice 3 adds its wording (21.3.1)."
Story clause: "A landing whose CI is still pending, whose build failed, or whose timing is unavailable (no build, unreadable, expired, no equivalent) breaks the line and is listed with a short reason distinct for each case."
Disposition: proved by slice 3: dashboard/tests/intent/intent-ci-wall-time-history-window.spec.ts 'of 35 measured builds…' lists Pending, Failed, No build, CI proof expired, CI proof unreadable and Cancelled as distinct items; dashboard/tests/intent/intent-ci-wall-time-history-adapter.spec.ts lists Equivalent timing unavailable for T, whose equivalent has no timing; dashboard/backend-tests/intent/landed-ci-history-gaps.spec.ts answers expired, unreadable after the hour and not-recorded gaps

### G3. The history store is unbounded per project
Reported: slice 2 — "the store is still unbounded per project (the plan's PFE asks for a bound). Stale pending entries beyond the window would show until slice 3's window hides them."
Story clause: "A bounded machine-local store of observations and landing references"
Disposition: proved by slice 3: dashboard/backend-tests/intent/landed-ci-history-window.spec.ts 'once a pass holds 20 measured builds…' keeps exactly the window's landings and builds, drops older landings and a stale pending one, and lists runs only for the new revisions

### G4. Pending states of skip, cancelled and adapter landings are unobserved
Reported: slice 2 — "Not tested: the 'waiting for a later trunk build' pending gap; the skip waiting on a running earlier build; adapter projects' pending states."
Story clause: "It waits while CI is queued or running and takes the result when it completes."
Disposition: proved by slice 3: dashboard/backend-tests/intent/landed-ci-history-pending-sources.spec.ts 'a skip resting on a running build and a cancelled landing…' (pending with the running build's run, then the reused point; 'waiting for a later trunk build', then the later-build point) and 'a CI adapter project's landing whose attempt is queued or running…' (pending, then its exact point)

### G5. Pygardon fills 20 builds more slowly than assumed
Reported: slice 3 — "At acceptance, a read of the machine's launch records on 2026-11-09 found Pygardon's newest 20 recorded trunk landings span 3.3 days, so 20 measured builds take longer than the assumed 2–3 days."
Story clause: "Recent Open Dough and Pygardon activity fills 20 builds in about 2–3 days, and Doughnut in about a week."
Disposition: no user cost "The story also tests whether the dashboard observes enough landings to make such a trend useful.": the fill rate describes recent activity, not product behavior; the heading states the actual measured count and date span, so a slower Pygardon shows fewer builds or a longer span rather than a wrong trend, and the reading answers the learning question
Commitment: 31, 31.2


### G6. Cancelled, expired and unreadable gaps drop the build the Landed rule named
Reported: slice 3 — "Retrospective outcome review: a final-gap observation keeps no build (landedCiObservation.ts), so Cancelled, CI proof expired and CI proof unreadable gaps give no build identity or link, although the rule names the cancelled run, the equivalent build or the later build."
Story clause: "a list gives each point and gap its date, wall time or gap reason, provenance (exact, reused equivalent, later trunk build) and build link"
Disposition: proved by slice 3: dashboard/backend-tests/intent/landed-ci-history-gaps.spec.ts 'a final gap names the build…' answers each final gap's build with its run link, and dashboard/tests/intent/intent-ci-wall-time-history-gaps.spec.ts 'a history whose recorded landings are all gaps…' lists the Cancelled, CI proof expired and CI proof unreadable gaps with their builds and Run links reached by keyboard; dashboard/backend-tests/intent/landed-ci-history-gaps.spec.ts 'the CI timing comparison answers a Landed gap without the build…' keeps the Done comparison unchanged

### G7. An unreadable proof stops the project's walk and can finalize a transient failure
Reported: slice 3 — "Retrospective outcome review: landedCiResolution.ts returns waitsFor read for an unreadable proof, which ends the project's walk (landedCiCollection.ts), so an older landing whose CI completed stays pending for up to an hour; the hour counts from the landing's receivedAt, so a rebuild of landings older than an hour turns one transient GitHub acquisition failure or directed wait into a permanent CI proof unreadable gap."
Story clause: "It waits while CI is queued or running and takes the result when it completes."
Disposition: proved by slice 3: dashboard/backend-tests/intent/landed-ci-history-pending-proof.spec.ts 'a skip whose equivalent build's CI proof read GitHub does not answer waits…' measures the older landing past the waiting skip, and 'a skip recorded two hours ago…' reaches the reused point once GitHub answers; only GitHub's answer settles a CI proof

### G8. An adapter skip whose equivalent has timing but no CI proof reads Equivalent timing unavailable
Reported: slice 3 — "Retrospective outcome review: adapter builds have no proof read, so exactSkippedEquivalent.ts answers none and the history says Equivalent timing unavailable for a Pygardon skip although its equivalent build is plotted with its timing."
Story clause: "is listed with a short reason distinct for each case"
Disposition: proved by slice 3: dashboard/tests/intent/intent-ci-wall-time-history-adapter.spec.ts lists the adapter skip S as No CI proof summary naming its equivalent build and keeps Equivalent timing unavailable for T, whose equivalent has no timing; the provenance journey's R4 reads No CI proof summary

### G9. The history adds a second CI wall time rule
Reported: slice 3 — "Retrospective outcome review: slice 3 replaced the shared wallTimeMs with historyWallTimeMs, which reimplements the duration with stricter timestamp and positive-duration checks."
Story clause: "reuses the CI timing comparison's Landed rule and wall-time definition"
Disposition: proved by slice 3: dashboard/src/landedCiHistory.ts historyWallTimeMs computes through wallTimeMs; the provenance journey's wall-time words equal wholeSecondWords(wallTimeMs(...))

## Preparation review

Plan refinement was not needed. The three Behavior slices each own one proof
loop, in this order: collected exact point, collection lifecycle, then
provenance and window. Each has a safe stopping point. No preparatory Structure
is needed, because the Landed lookup, store, observer and read owners already
exist. No remaining slice-specific concern was identified. Execution, Take and
release are not authorized by this preparation.
