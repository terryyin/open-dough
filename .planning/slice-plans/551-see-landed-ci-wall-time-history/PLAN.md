# See landed CI wall time change over time

**Identity:** SEED-285#see-landed-ci-wall-time-history
**Source:** [selected story](../../seeds/SEED-285-landed-ci-timing-history.md#see-landed-ci-wall-time-history)

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
  - Colour tokens go in `src/intent-ci-status.css`, light and dark.

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
Status: planned
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

### 2. Keep collection trustworthy across pending CI and restarts

Type: Behavior
Status: planned
Proof: slice 2 rows above.

A recorded landing whose CI is running shows as a pending gap. The collector
re-checks non-final entries until final. The client's trunk re-read shows the
point. Records already present at start, a restart while pending, a repeated
landing report, and a non-production process each give exactly one
observation per landing and one point per build.

Safe stopping point: the history is complete and durable for exact builds.
Sizing: one lifecycle proof loop. Pending, restart and duplicates are states of
the same idempotent collection, not separate outcomes.

### 3. Show provenance, gaps and the 20-build window

Type: Behavior
Status: planned
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

## Preparation review

Plan refinement was not needed. The three Behavior slices each own one proof
loop, in this order: collected exact point, collection lifecycle, then
provenance and window. Each has a safe stopping point. No preparatory Structure
is needed, because the Landed lookup, store, observer and read owners already
exist. No remaining slice-specific concern was identified. Execution, Take and
release are not authorized by this preparation.
