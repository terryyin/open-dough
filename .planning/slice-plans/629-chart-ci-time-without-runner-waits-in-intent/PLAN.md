# Chart CI time without runner waits in Intent

**Identity:** SEED-364#chart-ci-time-without-runner-waits
**Source:** [selected story](../../seeds/SEED-364-intent-ci-history-without-runner-waits.md#chart-ci-time-without-runner-waits)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

Project Intent's CI history shows each build's **CI time without runner
waits**, so its line, readouts and prior-build average follow CI execution,
not runner queues. The story's Goal, Scope and Key examples are the contract;
this plan does not restate them.

Exclusions, as the story limits them: the selected Done story's **CI wall time
history**, the automatic CI follow-up rule and its saved references, Proof's
**CI wall time**, and any switch between the two measures. The retained
window, build selection, provenance, failed and pending gaps, and the
reference's median, 15% and five-build rules do not change.

## Existing solutions and direction

- **The measure is reused, not rebuilt.** `dashboard/server/ciTimeWithoutRunnerWaits.ts`
  calculates it, and each CI lookup already answers it for one attempt:
  `timeWithoutRunnerWaitsOf` in `baseCiGithubRevisionLookup.ts` (workflow file
  at the build's revision plus the attempt's jobs) and in
  `baseCiAdapterRevisionLookup.ts` (the adapter's `jobs` operation). Its
  answer type, a time or a reason, is `CiTimeWithoutRunnerWaits` in
  `dashboard/src/storyCiComparison.ts`. Collection reaches the same lookup
  through its pass read, as `landedCiAttemptTiming.ts` reaches `attemptOf`.
- **The kept build gains the measure.** `keptBuildSchema`
  (`landedCiObservation.ts`) keeps the answer with the build; absent means
  not asked yet. `landedCiAttemptTiming.ts` is the model for supplying
  evidence to an already retained build from its same recorded attempt, and
  `landedCiCollectedProof.ts` for telling a settled answer from a read to ask
  again.
- **A history has one measure.** The prior-build reference
  (`dashboard/src/ciPriorBuildReference.ts`) already takes samples of a time
  or a reason, whatever the measure. `wallTimeReferenceOf` supplies wall-time
  readings today; the project history supplies the same eligibility with the
  measure in place of the wall interval. The chart series, words and compact
  readout stay one path for the project history and the Done wall-time
  history, told apart by the history's measure and its label.
- **Open tabs keep reading.** The history read sends a newer shape only to a
  reader that names it (`gap-reasons=timing-basis`, `history=glance`;
  `ciHistoryGapVocabulary.ts`, `ci-history-reader-compatibility.spec.ts` with
  its frozen previous reader). The measure follows the same rule: a project
  read that names it gets points by the measure and the new gap reasons; a
  read that does not, including a page opened before deployment, keeps today's
  wall-time answer.
- No North Star topic is involved. The change stays inside the collector,
  store, history reader and Intent CI evidence owners that
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  names, and uses the story's term for the measure
  ([ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md)).

## Decisive premises and observations

| Consuming operation / premise | Observation and limits |
| --- | --- |
| The measure's calculation, background collection and the reader-compatibility gate run green in this workspace and form | At `0982f6f9d` in this workspace, with the integration checkout's matching `node_modules` symlinked (lockfiles identical, Node 24.21.0): `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node node_modules/playwright/cli.js test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/intent/ci-time-without-runner-waits.spec.ts dashboard/backend-tests/intent/landed-ci-history-collection.spec.ts dashboard/backend-tests/intent/ci-history-reader-compatibility.spec.ts dashboard/backend-tests/intent/landed-ci-attempt-start.spec.ts --reporter=list` → 15 passed in 8.6 s, load average 4–8. The collecting-server case and the legacy-bounds repair case are the routes slices 1 and 2 extend. |
| Retained builds carry the identity the lookup needs to supply the measure later | Read-only query of the production history file on 2026-11-15 (`~/.open-dough/dashboard/landed-ci-history.json`): six projects, 20 passed builds each. Five GitHub Actions projects keep `runId` and `runAttempt` on all 20; the custom CI project keeps `adapterAttempt` and `runBranch` on all 20. |
| CI still answers the jobs of the oldest retained builds | Same day, `gh api repos/<repository>/actions/runs/<runId>/attempts/1/jobs` for the oldest retained build across the projects (started 2026-10-12, five weeks old): two jobs with start, completion and conclusion. Its revision is a commit in that project's local folder, so `git show <revision>:<workflow>` can read the workflow. Not observed: every retained build; one whose jobs CI no longer answers becomes the explained gap of slice 2. |
| The custom CI project's adapter supplies a job graph | That project's adapter script handles `request.operation === "jobs"` (read 2026-11-15). Its answer for a retained attempt was not requested; an attempt it answers `unavailable` for is the explained gap of slice 2. |
| Only Project Intent's CI status reads the unscoped project history | `git grep readIntentCiHistory -- dashboard/src` at `0982f6f9d`: `useIntentCiHistory.ts` alone. Done and scope readers use their own reads; the follow-up reads the store through `collectCiFollowUps`. |
| The window is wide enough that waiting for new builds would empty the chart | Same history file: one project's 20 builds span 2026-10-12 to now. Supplying the measure for retained builds is therefore part of the story, not an optional extra. |

## Outside-in proof ownership

Backend proof runs through the local authenticated history read on a
collecting test server, as `landed-ci-history-collection.spec.ts` does; rule
proof for the reference stays in the Node tests beside
`Distribution/tests/support/ci-prior-build-reference.test.mjs`; the page is
proved in `dashboard/tests/intent/` and `e2e/intent/`. Test sources follow
[test automation](../../../AGENTS.md#test-automation): resolve each path
through `dough-makeme` and, for browser tests, `dough-page-objects`.

| Story promise | Owning slice and proof |
| --- | --- |
| Example 1: two dependent jobs of 2 min and 3 min read **5 min**, whatever the runner waits | Slice 1: a collected build's history point is 5 min for two different waits. Slice 4: the chart, **Latest measured build** and **Builds and evidence** show **5 min**. |
| The measure is kept with the build attempt the point represents, asked once, and reading asks CI nothing | Slice 1: a second pass and a history read add no jobs request (request log of the test's CI). |
| Retained builds get the measure from their same recorded attempt | Slice 2: a history file without the measure gains it after one pass, with the original run and attempt. |
| Example 3: a build with wall time and no measure is a gap with its reason, named by its build | Slice 2 (answer) and slice 4 (chart mark and **Builds and evidence** words). |
| An unanswered read is asked again; an answered reason is final | Slice 2: request log across two passes. |
| Example 2: average **5 min** from five builds, **−1 min (−20%)** for a **4 min** landing; builds without the measure are excluded | Slice 3 (reference rule and answer), slice 4 (reference line, readout and evidence list). |
| The history and its chart are labelled by the measure | Slice 4. |
| Done **CI wall time history**, follow-up and Proof keep wall time; a page opened before deployment keeps reading | Slices 1 and 3: `ci-history-reader-compatibility`, `ci-done-wall-reference` and the follow-up specs stay green unchanged. Slice 4: the Done history still reads **CI wall time history**. |

## Ordered slices

### 1. The collected history answers a build's CI time without runner waits
Type: Behavior
Status: done
Proof: `landed-ci-history-time-without-runner-waits.spec.ts` (collect+keep; 5 min for two waits; one jobs read/build; second pass and read ask no jobs; default wall time); `ci-history-measure-compatibility.spec.ts` and `ci-history-reader-compatibility.spec.ts` (named measure + previous reader + refusals); `landed-ci-history-collection.spec.ts` green. Local: `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node node_modules/playwright/cli.js test --config dashboard/backend.playwright.config.ts` on those four paths — 6 passed; `npm run lint`; `npm run typecheck:dashboard`; `bash scripts/test.sh Distribution/tests/native-harness/native-evidence-identity.sh` after builder edit.

Behavior: a production dashboard collects an accepted landing whose passed
build ran a 2 min job, then a dependent 3 min job, with 30 s and 1 min runner
waits → the pass asks the build's lookup for its time without runner waits
once and keeps the answer with the kept build → a project history read that
names the measure answers that build as a point of 5 min; the same build
with longer waits also reads 5 min; a second pass and the read ask CI for no
jobs; a read that does not name the measure answers the wall-time point as
today. The page still asks without the capability, so it shows wall time
until slice 4. The answer's reference is still the wall-time one until
slice 3; no reader asks for the measure before slice 4.

Also in this slice: [request accounting](../../../dashboard/GITHUB-REQUESTS.md)
names collection's jobs read, and the collection half of the CI status
document moves to its own document (see Current decisions) with the new rule.

### 2. A build without the measure is an explained gap, and retained builds are supplied
Type: Behavior
Status: done
Proof: `landed-ci-history-measure-gaps.spec.ts` and `landed-ci-history-adapter-measure-gaps.spec.ts` (retained supply; final reason gaps; unanswered pending re-ask; adapter no job graph); slice 1 specs remain green; retained-window expects unanswered measure left unset. Local: caffeinate + backend.playwright on those paths — passed.

Behavior: the history already holds passed builds with wall time and no kept
measure → a pass asks each one's same recorded attempt and keeps the answer,
so a measure-naming read answers them as points. A build whose answer is a
reason (a job without valid times, an adapter that gives no job graph) is, in
that read, a final gap for each landing it stands for, naming the build, how
it stands for the landing, and the reason; later passes do not ask again. A
build whose read CI left unanswered (jobs or workflow could not be read, the
adapter failed to answer) is a pending gap, **CI time without runner waits
not read yet**, and is asked again at the next pass. A build not asked yet
reads as that same pending gap. Failed and other existing gaps are unchanged.

### 3. The prior-build average comes from the measure
Type: Behavior
Status: done
Proof: `ci-prior-build-reference.test.mjs` (5×5 min / 4 min → −20%; excluded without measure); `ci-project-measure-reference.spec.ts`; `ci-done-wall-reference.spec.ts`, `landed-ci-follow-up-reading.spec.ts`, follow-up policy/ledger green. Local gates passed.

Behavior: five prior builds eligible under the existing rule each keep 5 min
without runner waits, and the latest landing's build keeps 4 min → the
measure-naming project read's reference gives the selected time 4 min, an
average of 5 min from five builds, and −1 min (−20%). A prior build that
meets the wall-time rule and has no measure is an excluded sample with its
reason and does not count toward the five. The Done read's reference and the
follow-up's reference are calculated from wall time as before.

### 4. Project Intent's CI status shows the history by the measure
Type: Behavior
Status: planned
Proof: `dashboard/tests/intent/intent-ci-wall-time-history*.spec.ts`,
`dashboard/frontend-tests/intent-ci-compact-readout.spec.ts`,
`e2e/intent/intent-ci-wall-time-history*.spec.ts`,
`e2e/intent/intent-ci-prior-build-average.spec.ts` and
`intent-ci-prior-build-states.spec.ts` updated to the measure;
`e2e/intent/intent-ci-done-prior-build.spec.ts` and
`dashboard/tests/intent/intent-ci-done-*` green with wall-time wording.

Behavior: the collected history holds the builds of the three key examples →
a developer opens Project Intent's **CI status** → the page reads the history
naming the measure; its heading, reading and failure words, the chart's
image name and **Latest measured build** name **CI time without runner
waits**; each point, its hover, focus and tap readout and its **Builds and
evidence** line give that time (**5 min**, **4 min**); the dashed line and
compact readout give **5 min** from five builds and **−1 min (−20%)**; the
build without the measure is a hollow mark whose status and evidence line
say the measure is unavailable and why, with its build and run attempt. A
selected Done story's history still reads **CI wall time history** with wall
times. [CI status](../../../docs/dashboard-development-intent-ci-status.md)
and the [prior-build reference](../../../docs/dashboard-development-intent-ci-reference.md)
describe the project history by its measure.

## Current decisions

- **Capability, not a second endpoint.** The project read names the measure
  with one query parameter, parsed and refused as `gap-reasons` is. The new
  pending wait and final gap reason are sent only to that reader; the frozen
  previous reader in `dashboard/tests/support/previousCiHistoryReader/` keeps
  parsing the default answer.
- **A point's time is the history's measure.** The page-side point carries
  one time under its history's measure, in place of a field named for wall
  time, so the series, words and readout are not duplicated per measure. The
  Done wall-time history supplies wall time through the same path.
- **Window unchanged.** `measuredBuildOf` and the 20-build window keep their
  wall-time definition, which the Done history, scope history and follow-up
  share. The project heading counts the points it shows.
- **Answered or unanswered.** The lookups fold a failed read into a reason
  today, which the comparison shows. Collection needs them apart, so the
  lookup marks an unanswered read; the comparison's words do not change.
- **Eligibility.** A project-history sample is eligible when
  `wallTimeReadingOf` accepts the build and the build keeps a time; its value
  is that time.
- **File sizes.** `docs/dashboard-development-intent-ci-status.md` is at 250
  lines. Slice 1 moves its collection and retention part (from “A production
  dashboard collects that history” to the end, about 85 lines: what a pass
  walks, pending and final rules, the file and its window) to
  `docs/dashboard-development-intent-ci-history-collection.md`, linked from
  CI status and from the documents that cite those rules; the judgment, Proof
  and history display stay. `dashboard/server/landedCiHistoryStore.ts` is at
  250 lines: the measure's keep joins `keepLandedCiProof` as one “keep a kept
  build's collected evidence” write instead of a second copy, and the
  backfill and its answered/unanswered rule live in their own module beside
  `landedCiAttemptTiming.ts`. No file expected to change is over the limit
  today.
- **Wording.** One name everywhere: **CI time without runner waits**, as the
  comparison shows it. Whole-second words stay `wholeSecondWords`.
- No local whole suite is required. Hosted CI runs the full suites after
  publication.

## Verification, sizing and concern review

- Local gate per slice: the slice's focused specs with the command form in
  the premise table (`dashboard/frontend.playwright.config.ts` or
  `dashboard/integrated.playwright.config.ts` for those families, the
  project's e2e runner for `e2e/intent`); `bash scripts/test.sh <paths>` for
  Node tests; `npm run lint`; `npm run typecheck:dashboard`; and, when a
  builder module under `Distribution/tests/support/` changes,
  `bash scripts/test.sh Distribution/tests/native-evidence-identity.sh`. A
  fresh worktree needs `node scripts/setup-native.mjs npm` first. Long local
  runs follow the maintained
  [macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
  `caffeinate -s -i` on AC power.
- Failing and flaky tests follow the project's
  [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests),
  carried as written: a failing or flaky test is a defect to fix, a failure
  reproduced on trunk is attribution, not an exemption, and CI failing on a
  revision this execution published is this execution's to repair.
- Sizing: four slices, each one outcome and one proof loop. Slices 1–3 are
  server-side with backend or Node proof of seconds to a few minutes. Slice 4
  is the widest: about a dozen existing history specs name wall-time values
  and words. Their history builder gives a kept build a measure by default
  equal to its wall interval, so specs that do not assert the difference
  change only where they name the measure.
- Each slice leaves the product coherent: until slice 4 the page asks
  without the capability and shows wall time as today.
- Slice-plan refinement was not needed: the slices split by outcome
  (collect, explain and supply, average, show), each with one proof loop.
- Remaining concerns: none identified in this review.

## Story obligations

### G1. Page still reads wall time until Intent names the measure
Reported: slice 1 — "The page still asks without the capability, so it shows wall time until slice 4."
Story clause: "Use that measure for the chart points and their readouts, **Latest measured build**, the selected landing’s time, and the times in **Builds and evidence**."
Disposition: interim until slices 4

### G2. Prior-build average still from wall time until the measure reference
Reported: slice 1 — "The answer's reference is still the wall-time one until slice 3."
Story clause: "Calculate the **Prior-build average**, its sample count and evidence, and the elapsed and percentage change against it from the same measure."
Disposition: proved by slice 3: ci-prior-build-reference.test.mjs and ci-project-measure-reference.spec.ts (4 min vs 5 min average −20%; Done/follow-up wall)

### G3. Measure-naming read without a kept measure time still presents wall time as a point
Reported: slice 1 — "When measure is named but the build has no kept milliseconds, timeMs is omitted and measuredHistoryOf still presents wall time rather than a gap."
Story clause: "When the retained evidence cannot supply a measurement, show a gap with its reason and exclude it from the chart’s prior-build average."
Disposition: proved by slice 2: landed-ci-history-measure-gaps.spec.ts pending/final measure gaps; measuredHistoryOf no wall-time fallback
