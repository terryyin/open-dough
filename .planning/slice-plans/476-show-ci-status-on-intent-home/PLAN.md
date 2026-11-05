# Show CI status and timing on the Intent homepage

**Identity:** SEED-239#show-ci-status-on-intent-home
**Source:** [selected story](../../seeds/SEED-239-intent-home-ci-status.md#show-ci-status-on-intent-home)
**Source review:** [source-review.md](./source-review.md)
**Prepared:** 2026-11-05; preparation only. Execution is not authorized by this plan.

## Goal and boundaries

A developer opening Intent sees the judged branch's CI result, proof counts,
CI wall time and per-entry test execution time as Intent's first content,
with a kept answer shown at once and its freshness visible while CI is read
again. The story section owns the goal, scope, key examples, UI and
architecture; this plan does not restate them.

Included: the homepage move and return-home control, wall time from the CI
read, test execution durations through the CI proof contract and both report
producers, their display with partial and not-recorded states, the server's
kept CI answer with previously-retrieved freshness, and the request account
and payload manuals those change. Excluded (from the story): persistence
across a dashboard server restart, time-based refresh, per-job breakdowns,
trend history, and Launch base CI changes.

**Failure policy:** [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to execution, verification, delegation and repair
handoffs.

**Local gate:** each slice runs `npm run lint`, `npm run typecheck:dashboard`
and its focused proof (`bash scripts/test.sh <paths>` for Node checks;
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts <specs> --reporter=list`
for dashboard specs, with Homebrew Bash 5 first on `PATH`). Because slices 1
and 5 change the shared Intent perspective and read boundary and slice 3
changes the distributed CI proof collector, run `npm test` and
`npm run test:dashboard` once before landing the story branch, not per slice.
For those long runs follow the maintained
[macOS sleep guard and power condition](../../../tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake; on AC use `caffeinate -s -i`; on battery plug in or keep
the lid open under `caffeinate -i` and inspect the sleep log afterwards.
Hosted CI on the published story branch remains owned under the failure
policy.

## Existing solutions and direction

- **Move the CI status content, do not copy it.** `IntentCiStatus`
  (`dashboard/src/IntentCiStatus.tsx`) with `ciTargetOf`
  (`dashboard/src/intentCiTarget.ts`), `ShownJudgment` and `IntentCiProof`
  already owns targeting, judgment, proof rows, head-following re-reads and
  Check again. It becomes the Intent reading pane's empty-selection content;
  the `ci-status` value of `IntentMode` (`dashboard/src/IntentModeTabs.tsx`),
  `IntentCiStatusPanel`, and the perspective's `ci-status` special cases go.
  Empty selection already exists as `{ path: "" }`
  (`dashboard/src/intentWorkspaceSelection.ts`, `selectionScope` → `none`),
  so returning home is setting that selection; the mode choice
  (`dashboard/src/pageIntentMode.tsx`) is in-memory page state, so removing a
  mode needs no stored-value migration.
- **Wall time from the existing CI reads.** The run listing the judgment
  already asks (`createGitHubActions().listRuns` in
  `src/skills/dough-execute-plan/scripts/ci-github-actions.mjs`) returns each
  run's `run_started_at` and `updated_at`; `observedRun` drops them today.
  The adapter attempt normaliser
  (`src/skills/dough-execute-plan/scripts/ci-command-attempts.mjs`) maps
  `time` to `createdAt` for ordering; it keeps that meaning, and the adapter
  contract gains optional `startedAt` and `completedAt`.
- **Durations from the reports the collector already converts.** CI already
  sets `OPEN_DOUGH_TEST_TIMES` beside `OPEN_DOUGH_TEST_OUTCOMES`
  (`.github/workflows/ci.yml`), and `scripts/test.sh` writes one
  `<seconds>\t<check>` line per check with the same labels as the outcomes
  file. The dashboard proof record's attempts carry `durationMs`
  (`dashboard/tests/proof-record.md`). The fragment command
  (`ci-proof-summary.mjs fragment`, `ci-proof-fragments.mjs`) and the
  `.github/actions/ci-proof-fragments` action gain an optional times input;
  `ci-proof-collect.mjs` carries part and entry durations into the summary.
- **Extend the kept answers the server already has.** The server keeps a
  valid GitHub Actions proof summary per repository, run and attempt for its
  lifetime (`dashboard/server/ciProofArtifact.ts`, latest 256) and branch
  heads (`dashboard/server/branchHeads.ts`). The kept CI status answer is one
  more bounded in-process owner of the same kind beside
  `dashboard/server/intentCiStatusRead.ts`, keyed by repository, judged
  branch and CI reading path. Adapter proof, asked afresh each time today,
  is also kept per attempt, since a completed attempt's proof is fixed by its
  identity. The persisted `~/.open-dough/dashboard/retained-answers/` store
  holds answers fixed at a resolved revision; a branch's latest judgment is
  not such an answer, so it does not go there.
- **Accepted decisions.** [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
  allows the kept answer as disposable derived state rebuilt from CI; it
  never becomes a home of project state, and HTTP answers stay `no-store`.
  Missing timing evidence keeps the UX North Star's
  [evidence and freshness distinctions](../../../docs/dashboard-ux-ui-north-star.md#evidence-freshness-and-uncertainty).
  [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  supplies the before/after basis (slice 1 baseline, slice 5 comparison).
  [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  and [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  govern the payload manual and collector changes: edit `src/skills/`, write
  for the executing agent, and leave installed copies to a release. No
  conflict or new North Star topic is needed.

## Decisive premises observed during preparation

Observed read-only in the established preparation workspace on 2026-11-05 at
`acbbb80b6`.

| Premise | Consuming operation | Observation and result | Remainder |
| --- | --- | --- | --- |
| The run listing the judgment asks carries attempt start and completion | Slice 2 derives wall time from the listed run | `gh api "repos/terryyin/open-dough/actions/workflows/ci.yml/runs?branch=main&event=push&per_page=2"` returned `run_started_at` and `updated_at` for completed runs (run `41992843850`: 08:13:43Z → 08:18:32Z); that attempt's jobs' latest `completed_at` was 08:18:31Z, so `updated_at` marks completion within a second | Wall time for a run re-attempted later is the listed latest attempt's, which is the attempt the judgment shows |
| Test durations exist in the inputs the fragment step already receives | Slice 3 fragments carry durations | `OPEN_DOUGH_TEST_TIMES=… OPEN_DOUGH_TEST_OUTCOMES=… bash scripts/test.sh src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-fragments.test.mjs` (Bash 5) wrote `0.1\t<check>` times and `passed\t<check>` outcomes with matching labels; `ci.yml` sets both for the shard jobs; the proof record documents per-attempt `durationMs` | The Playwright record's `durationMs` is the test's own time, excluding shared hooks (recorded as a decision below) |
| Additive duration fields keep existing validators and readers valid | Slice 3 ships them without a schema version change | `summaryProblems` and `fragmentProblems` from `ci-proof-contract.mjs` returned `[]` for a summary and fragment carrying `durationMs` on entry and part; `dashboard/src/ciProof.ts` uses non-strict `z.object`, which ignores unknown keys | Older released dashboards ignore the field; this story's dashboard shows it |
| Returning home needs no new selection state | Slice 1 return-home control | `selectionScope({ path: "" })` is `none`, the state the reading pane already renders as the empty Purpose/Proof panes (`IntentBrowser.tsx` reading pane) | — |

## Outside-in proof

| Source promise / examples | Owner and observable result |
| --- | --- |
| CI status is the homepage; mode strip; return home; shows without locations (example 1) | Slice 1: dashboard specs show CI status in the reading pane with nothing selected, the strip lists Intent and Optimization Candidates only, a file selection then the return-home control shows CI status again, and a not-configured project shows CI status beside its explanation |
| Targeting, story gap, head re-read, Check again, both reading paths carry over | Slice 1: the existing `intent-ci-status*`, `intent-ci-proof*` and story CI specs pass against the homepage through their page objects |
| CI wall time from the CI read; adapter without times (examples 2, 7) | Slice 2: a spec with a 10:00→10:03 listed run shows CI wall time 3 min; an adapter attempt without `startedAt`/`completedAt` shows CI wall time not recorded; unit proof of the GitHub and adapter mappings |
| Summaries record per-part and per-entry execution durations | Slice 3: collector unit proof; hosted CI on the story branch publishes a summary whose entries carry durations |
| Execution time per entry; partial; not recorded; never zero (examples 2, 6) | Slice 4: specs show 4 min and 2 min beside entry counts, partial with the missing part named, and not recorded for an older summary |
| Kept answer at once with spinner and previously-retrieved label; fresh replaces; failure retains; cold spinner; no other target's answer (examples 3–5) | Slice 5: dashboard specs with held and failing CI fixture responses; server unit proof of keying and no overwrite on failure |
| Request account and evaluation basis | Slices 1 and 5: `dashboard/GITHUB-REQUESTS.md` states Intent-open CI reads and the kept answer; baseline before slice 1 and warm comparison after slice 5 recorded in this plan |

## Slices

### 1. CI status is Intent's homepage
Type: Behavior
Status: done
Proof: `dashboard/tests/intent-ci-status-homepage.spec.ts` plus existing
`intent-ci-*.spec.ts`, `intent-test-optimization-candidates.spec.ts`,
`intent-story-changes-gaps.spec.ts` green through updated page objects;
after refactor also `intent-purpose-proof-tabs|side-by-side`,
`intent-selection-reads`, `intent-gherkin-browse` (empty-selection Purpose/Proof
retired). Commands: `npm run lint`, `npm run typecheck:dashboard`,
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts <those specs> --reporter=list`
(Homebrew Bash 5 first on `PATH`). Consumer trace `--term "CI status"` /
`--term ci-status` (+ empty-selection retirement terms). ADR 0010 baseline
recorded above.

**Behavior:** a project with or without Intent locations → the developer opens
Intent with nothing selected → CI status of the judged branch fills the
reading pane, the strip offers Intent and Optimization Candidates, and after
selecting a file the return-home control shows CI status again.

Before changing code, record the ADR 0010 baseline in this plan: on a
throwaway dev server with the gh-wrapper count, the current journey (open
Intent, choose CI status) for Open Dough's trunk, its GitHub requests per show
and time until the judgment is on screen, with the load average.

Move `IntentCiStatus` into the empty-selection reading and into the
explanation panel shown when locations are not configured, loading or failed;
remove the `ci-status` mode and panel. `intent-ci-status-kept.spec.ts`
promised the tab choice is kept across perspective switches; repurpose it to
the homepage showing again after a switch, or delete it where that promise no
longer exists. Run the consumer trace with `--term "CI status"` and
`--term ci-status`. Update `dashboard/GITHUB-REQUESTS.md`: opening Intent with
nothing selected now costs the judgment and proof reads the tab cost when
shown.

### 2. CI wall time of the shown attempt
Type: Behavior
Status: done
Proof: `ci-github-actions-observed-run.test.mjs` and `ci-command-attempts.test.mjs`
plus observer consumers; `dashboard/tests/intent-ci-status-wall-time.spec.ts`
(10:00→10:03 → **CI wall time 3 min**; running → ancestor; adapter without
fields → not recorded). Gate: `npm run lint`, `npm run typecheck:dashboard`,
`bash scripts/test.sh` (those units + consumers), Playwright wall-time spec
(Homebrew Bash 5 first on `PATH`).

**Behavior:** a judged result naming a completed attempt → the homepage shows
it → CI wall time is that attempt's start-to-completion, or not recorded with
why.

Carry `run_started_at`/`updated_at` through `observedRun` (shared with the CI
observer; additive, so its consumers in `src/skills/dough-execute-plan/scripts`
are traced and their tests run) and `startedAt`/`completedAt` through
`normalizeAttempt` into the judgment answer. Document both optional adapter
fields in `src/skills/dough-execute-plan/manuals/custom-ci.md`. Wording joins
`dashboard/src/ciProofWording.ts`.

### 3. Attempt summaries record test execution time
Type: Behavior
Status: done
Proof: `bash scripts/test.sh` on `ci-proof-{collect,fragments,summary,duration}.test.mjs`
and `tests/support/ci-proof-declaration.test.mjs` (outcomes+times, Playwright
`durationMs`, old shape without durations, entry sums of present parts);
`npm run lint` / `typecheck:dashboard`. Hosted story-branch summary artifact
with entry/part `durationMs` remains post-publish observation.

**Behavior:** a CI attempt's jobs report their tests → the collector writes
fragments and the summary → each present part, and each entry, carries its
summed test execution duration; a part without one carries none.

Add an optional `--times` input to `fragment` and to
`.github/actions/ci-proof-fragments`, pass `OPEN_DOUGH_TEST_TIMES` from the
shard jobs in `.github/workflows/ci.yml`, and sum Playwright attempts'
`durationMs`. Keep schema versions; validate `durationMs` as a non-negative
number when present. Update `src/skills/dough-execute-plan/manuals/custom-ci-proof.md`
and `src/skills/dough-test-optimization/SKILL.md` where they describe the
summary an adapter or project publishes.

### 4. Test execution time beside each proof entry
Type: Behavior
Status: done
Proof: `dashboard/tests/intent-ci-status-execution-time.spec.ts` (4 min / 2 min,
not recorded, partial with part named) plus updated proof/adapter row
expectations; `npm run lint`, `typecheck:dashboard`. Partial derived from
parts in `entryExecutionTimeLine` (`ciProofWording.ts`).

**Behavior:** a shown attempt's summary → the homepage shows its proof rows →
each entry names its cumulative test execution time, partial, or not
recorded.

Extend `dashboard/src/ciProof.ts` and `IntentCiProof` rows; derive partial
from the entry's parts (any part not present, or present without a
duration), not from a new status field.

### 5. Kept CI answer with visible freshness
Type: Behavior
Status: done
Proof: `tests/support/dashboard-intent-ci-status-kept.test.mjs`; Playwright
`intent-ci-status-freshness.spec.ts` (E3–E5) plus reads/boundary/story;
`npm run lint`, `typecheck:dashboard`. ADR 0010 cold/warm comparison in
[execution-notes.md](./execution-notes.md).

**Behavior:** a show of the homepage → the page asks for the kept answer and
a fresh read together → the kept answer, if any, appears labelled previously
retrieved with a spinner until the fresh answer replaces it or a failure is
shown beside it.

Add the kept form of the CI status read (answers without any CI request) and
keep adapter proof per attempt beside the existing summary memory. The
answer marks kept versus fresh, so the page cannot present a kept answer as
newly verified. Update `dashboard/GITHUB-REQUESTS.md` (the kept form asks
nothing; per-show requests unchanged) and the comment in
`dashboard/server/baseCiJudgment.ts` that nothing is kept beyond the request.
After the slice, record the ADR 0010 comparison beside slice 1's baseline in
[execution-notes.md](./execution-notes.md).

## Execution notes

ADR 0010 measurements, learnings, current decisions and concern evidence:
[execution-notes.md](./execution-notes.md).

## Execution complete

Product advice: no change. Intent's empty-selection homepage now shows the
judged branch's CI result, proof counts, wall time and per-entry test
execution time, with a process-local kept answer and visible freshness.
Source commitments through E7 are observed; DD-428 records the keep/memory
journey repairs. No bounded product correction.
