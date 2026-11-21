# Get fast proof of Intent locations read recovery and settings problems

**Identity:** SEED-413#speed-intent-source-and-story-reading
**Source:** [Get fast proof of Intent locations read recovery and settings problems](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-source-and-story-reading)
**Source review:** [source-review.md](source-review.md)
**Split:** Terry authorized splitting at delivered Slice 2 on 2026-11-21; former Slices 3–4 moved to `SEED-413#speed-intent-source-browsing-and-detours` ([plan 762](../762-speed-intent-source-browsing-and-detours/PLAN.md), Slices 1–6) and former Slices 5–9 moved to `SEED-413#speed-story-changes-notes-and-progress-reading` ([plan 763](../763-speed-story-changes-notes-and-progress-reading/PLAN.md), provisional Slices 1–5).

## Goal and scope

Dashboard maintainers get fast Vitest feedback that a developer reading Project
Intent sees the specific cause when Intent settings are unreadable, malformed
or not configured or when a locations read fails, can Retry on demand to reach
the configured source or absent explanation, and recovers unreachable or
rate-limited Intent locations on the shared schedule without conflating
published-detail waits. Move the 7 legacy Playwright cases across the 2 Intent
locations read-recovery and settings-problem files in
`dashboard/frontend-tests/intent/` (`intent-gherkin-settings-problems` and
`intent-read-recovery`), reshape `makeMe.anIntentLocationsAnswer`
(`Distribution/tests/support/intentLocationTestData.mjs`) to build typed
`IntentLocations`, forward optional `readFile` on `loadRepositoryTexts`
(`dashboard/src/repositoryFileReads.ts`), and retire unused `locationsRequest`
(`dashboard/test-support/intentReadRecoveryPage.ts`) and `pygardon`
(`dashboard/test-support/intentGherkinUnusableFixtures.ts`). Source browsing,
pinned navigation links, and reading-place detours belong to
`SEED-413#speed-intent-source-browsing-and-detours` (`plan 762`), story
changes, Done Intent, Done references, Story notes, and recorded progress
belong to `SEED-413#speed-story-changes-notes-and-progress-reading`
(`plan 763`), independent CI comparison, status, timing history, and Summary
proof belong to the preceding stories, and frontend runner retirement belongs
to `SEED-413#retire-legacy-dashboard-frontend-runner`.

## Current decisions

- Apply the [campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories),
  [North Star](../../NORTH-STAR.md) and
  [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Use the [frontend entry guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses)
  and project-selected MakeMe and page-object conventions. Use page-loadable
  `makeMe.anIntentLocationsAnswer` inputs, colocated page objects, and
  `mountComponent` with direct actions and retrying observations. Do not add
  shared test wrappers or retain settle/`act` waits in migrated cases.
- Reuse `ProjectIntentReading`, `IntentReadSourceOnPage`, `requestIntentLocationsAt`,
  `IntentReadRecovery`, `PublishedReadStatus`, `ObservationOutcomes`,
  `useLimitRecovery`, and `loadRepositoryTexts` so the production owners keep
  the request keys, caches, recovery windows, rate-limit deadlines, and
  visibility transitions. Use isolated monotonic fake-clock epochs via
  `onRecoveryClock()` for timing cases, and retain
  `e2e/intent/intent-read-boundary-recovery.spec.ts` and
  `e2e/intent/intent-gherkin-unusable.spec.ts` for authenticated HTTP boundary
  and published Gherkin repository reads.
- Follow [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  so published source and location explanations preserve their actual
  provenance and revision.
- Record each retired legacy case's distinct assertions and new or existing
  proof owner, why cases were consolidated or split, case counts by engine and
  destination, paired two-worker before/after elapsed times including
  preparation, E2E runtime, shared `dashboard/test-support/` delta, and
  remaining slow cases.

## Local gate

On macOS run from an awake machine on AC with `caffeinate -s -i`, the
maintained [sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Use the default test timeouts and two workers for comparable runs. Apply the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run explicit affected frontend paths through each relevant engine, list the
final selections, and run the named E2E paths when a slice moves or changes
their proof or reaches a shared composed boundary. Run
`npm run typecheck:dashboard` for changed production inputs or callers.

## Decisive premises and proof

Observations below are from preparation at `f981fc912` and execution baseline
`c346263b78d91b9d8cabb18ee418360f56ce0462` on 2026-11-21, macOS on AC with
Node 24.21.0 and the locked install.

| Premise and consuming operation | Observation and consequence |
| --- | --- |
| The normal frontend runner selects the legacy locations cohort used to compare feedback. | At `c346263b78`, `caffeinate -s -i npm run --silent test:dashboard:frontend -- dashboard/frontend-tests/intent/intent-gherkin-settings-problems.spec.ts dashboard/frontend-tests/intent/intent-read-recovery.spec.ts --list --reporter=line` listed 7 legacy `chromium` cases across the 2 scoped files (within the 37-file / 71-case pre-split roster, which ran in `209.26 s` elapsed / `376.66` summed case-seconds at `f981fc912`). |
| Production `ProjectIntentReading` and `IntentReadRecovery` expose settings causes, manual Retry, and scheduled recovery over typed collaborators. | Reshaping zero-caller `makeMe.anIntentLocationsAnswer` to build typed `IntentLocations` and forwarding optional `readFile` on `loadRepositoryTexts` let Slices 1 and 2 exercise the real readers over typed replies and monotonic fake-clock epochs without HTTP route mini-servers. |

## Slices

Names below omit `.spec.ts` and are relative to `dashboard/frontend-tests/intent/`.

### 1. Unreadable, malformed and failed Intent location reads explain their cause and retry on demand

Type: Behavior
Status: done

Move `intent-gherkin-settings-problems` (2). Reshape zero-caller
`makeMe.anIntentLocationsAnswer` (`Distribution/tests/support/intentLocationTestData.mjs`)
to build `IntentLocations` and observe `ProjectIntentReading` over typed
replies. Check callers and remove the unused `locationsRequest` export
(`intentReadRecoveryPage.ts`) and `pygardon`
(`intentGherkinUnusableFixtures.ts`).

**Proof.** Unreadable and malformed settings stay distinct from
not-configured, a failed locations read names its specific cause and
revision, and manual Retry reads it again and shows the configured or
absent result.

### 2. Failed Intent locations recover on the shared transient and rate-limit schedule

Type: Behavior
Status: done

Move `intent-read-recovery` (5). Reuse `anIntentLocationsAnswer` and
observe `ProjectIntentReading` with the real `IntentReadRecovery` and
shared transient schedule over isolated monotonic fake-clock epochs.
Forward optional `readFile` on `loadRepositoryTexts`
(`dashboard/src/repositoryFileReads.ts`) so the shared-wait case
exercises both real published-detail recovery and Intent locations where
their waits interact. Retain the authenticated boundary in
`e2e/intent/intent-read-boundary-recovery.spec.ts`.

**Proof.** Preserve the 15/30/60/60 schedule, visibility and rate-limit
rules, independent recovery of published detail, and manual Retry for
malformed settings with no spontaneous retry.

## Execution complete

Product advice: no change — the remaining 64 legacy reading cases are already split and queued first in `PRODUCT-BACKLOG.md` as `SEED-413#speed-intent-source-browsing-and-detours` (plan `762`, `ready`) and `SEED-413#speed-story-changes-notes-and-progress-reading` (plan `763`, awaiting story refinement).

## Learnings

- **Original Slice 1 overrun (`17` elapsed active minutes, `storyOverruns: 1`) and in-place split into Slices 1–2:** `makeMe.anIntentLocationsAnswer` (`Distribution/tests/support/intentLocationTestData.mjs`, zero callers after `556535c335`) still returned the retired wire `IntentLocationsAnswer` shape rather than `IntentLocations`, `loadRepositoryTexts` (`dashboard/src/repositoryFileReads.ts`) lacked the optional `readFile` collaborator parameter that `readCachedFile` already accepts, and `readingLimit.ts` keeps a module-level monotonic `limitedUntil` requiring past monotonically increasing fake-clock epochs (`2020-01-01` + `1h` per case) and `>= 15s` `directedSeconds`.
- **Slice 3 overrun (`16.8` elapsed active minutes, `storyOverruns: 3`) and authorized resplit at delivered Slice 2:** Combining Navigation pinned/refused source links and 6 Intent source-browsing specs across 18 paths exceeded the 15-minute slice budget, and `plan 755` had reached 9 slices. On 2026-11-21 Terry authorized narrowing `SEED-413#speed-intent-source-and-story-reading` to delivered Slices 1–2 and splitting the remaining 64 legacy cases (35 files) into `SEED-413#speed-intent-source-browsing-and-detours` (`plan 762`, 6 single-seam slices, `ready`) and `SEED-413#speed-story-changes-notes-and-progress-reading` (`plan 763`, 5 provisional slices `awaiting story refinement`).

## Plan review

Slices 1 and 2 separate immediate settings-problem explanations and manual
Retry (`intent-gherkin-settings-problems`) from fake-clock transient,
visibility, rate-limit, and shared-wait recovery (`intent-read-recovery`)
over the same `ProjectIntentReading`, `IntentReadSourceOnPage`, and
`makeMe.anIntentLocationsAnswer` model. Remaining source-browsing/detour and
story-reading slices were split into `plan 762` and `plan 763` on Terry's
authorization.

## Execution resume context

- **Mode:** Story Branch Mode (`story-branch`)
- **Workspace:** `/Users/terryyin/git/open-dough/.worktrees/get-fast-proof-of-intent-source-and-story-readin` on branch `cursor/get-fast-proof-of-intent-source-and-story-readin` (default/integration checkout: `/Users/terryyin/git/open-dough`)
- **Target:** `origin` / `main`
- **Publisher ID:** `dashboard-territory.local-open-dough` (agent `Nana-chan`)
- **Published revisions:** claim `c346263b78d91b9d8cabb18ee418360f56ce0462` on `origin/main` (`pendingCi: unobserved`); plan-refinement increment `cd05ef9b75ba42c388af72e491affb22a9b6f00a`, Slice 1 `b2c7b1dc319336bc0216fe265d207c1bbca614ca`, Slice 2 `634838a4976b8beb67e2315ad387b5622d5f08ff`, and stop record `f84c12ab2e6ff8fd8e565502f1b785d38455bc0d` on `origin/cursor/get-fast-proof-of-intent-source-and-story-readin`
- **CI observer:** GitHub Actions, workflow `ci.yml` (`CI`), watching `terryyin/open-dough` branch `cursor/get-fast-proof-of-intent-source-and-story-readin`, mailbox `/tmp/dough-ci-501/watch-B31gkw`

## Proof mapping and measurements

### Two-worker before/after comparison (`intent-gherkin-settings-problems` + `intent-read-recovery`)

Measured on 2026-11-21 on the AC-powered Mac under `caffeinate -s -i`, Node 24.21.0, `--workers=2`, explicit paths `dashboard/frontend-tests/intent/intent-gherkin-settings-problems.spec.ts dashboard/frontend-tests/intent/intent-read-recovery.spec.ts` with `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD`, interleaving pre-change baseline `c346263b78d91b9d8cabb18ee418360f56ce0462` (`chromium`, 7 legacy Playwright cases) and the delivered Vitest suite (`mounted-chromium`, 8 Vitest cases; `0` `actSettled`, React `act`, or `IS_REACT_ACT_ENVIRONMENT` uses):

| Pair | Legacy Playwright (`chromium`, 7 cases) | Plain Vitest (`mounted-chromium`, 8 cases) |
| --- | ---: | ---: |
| Cold warmup | `6.35 s` (`6,348 ms`, runner `5,761 ms`; load `10.62 → 10.61`) | `4.64 s` (`4,641 ms`, runner `4,201 ms`; load `10.61 → 10.48`) |
| Warm pair 1 | `5.52 s` (`5,518 ms`, runner `4,887 ms`; load `10.48 → 10.12`) | `3.43 s` (`3,428 ms`, runner `3,200 ms`; load `10.12 → 10.12`) |
| Warm pair 2 | `4.85 s` (`4,851 ms`, runner `4,410 ms`; load `10.12 → 9.79`) | `4.20 s` (`4,204 ms`, runner `3,935 ms`; load `9.79 → 10.37`) |
| Warm pair 3 | `5.97 s` (`5,973 ms`, runner `5,328 ms`; load `10.37 → 10.42`) | `4.43 s` (`4,434 ms`, runner `4,133 ms`; load `10.42 → 10.87`) |
| **Warm median** | **`5.52 s` (`5,518 ms`, runner `4,887 ms`)** | **`4.20 s` (`4,204 ms`, runner `3,935 ms`; `-23.8%` command elapsed)** |

- **Counts by engine and destination:**
  - Owned unit specs: `7` legacy Playwright `chromium` cases (`0` remaining on `@playwright/test`) → `8` plain Vitest `mounted-chromium` cases across the same 2 spec files (`intent-gherkin-settings-problems.spec.ts`: `3`, `intent-read-recovery.spec.ts`: `5`).
  - Case consolidation / expansion rationale: Neither legacy file had loop-generated or redundant table-driven cases; each of the 5 `intent-read-recovery` cases tests a distinct state-machine transition (15/30/60/60 window bounds, hidden-tab deferral, shared published-detail wait, malformed non-retry until manual Retry, and rate-limit deadline) and was kept separately named for failure diagnosis. In `intent-gherkin-settings-problems`, the 2 legacy cases were kept and 1 focused case (`"retrying a failed Intent locations read opens the configured source at its revision"`) was added so manual Retry proves recovery to both an absent configuration and a configured Gherkin source at its exact revision (`c3c3c3c`).
  - Promoted E2E proof cost: `0` cases promoted to `e2e/` (`0.00 s` added E2E cost). Existing composed E2E companions remain passing and unchanged: `e2e/intent/intent-read-boundary-recovery.spec.ts` (`3` cases, `8.03 s` at `--workers=2`, owning composed `headsChecks` continuation and authenticated HTTP recovery) and `e2e/intent/intent-gherkin-unusable.spec.ts` (`2` cases, owning real repository Gherkin discovery problems).
- **Per-case durations (3 warm interleaved runs, ms) and retired-assertion mapping:**

| Spec | Legacy `chromium` title (median ms) | `mounted-chromium` Vitest title & line | Mounted attempts (ms) | Mounted median (ms) |
| --- | --- | --- | --- | ---: |
| `intent-gherkin-settings-problems.spec.ts` | `"unreadable and malformed Intent settings stay distinct from not-configured"` (`878`) | same title (`:108-156`, preserves Doughnut unreadable + Pygardon malformed + competing-text exclusions + Doughnut not-configured) | `225, 268, 337` | `268` |
| `intent-gherkin-settings-problems.spec.ts` | `"an Intent locations read that fails names its cause, and Retry reads it again"` (`750`) | same title (`:158-178`, `.planning/open-dough.json` + revision alert and manual Retry to absent explanation) | `216, 214, 299` | `216` |
| `intent-gherkin-settings-problems.spec.ts` | *(added for configured-source Retry)* | `"retrying a failed Intent locations read opens the configured source at its revision"` (`:180-217`, Retry opens `e2e_test/features/jobs.feature` at `c3c3c3c`) | `805, 463, 580` | `580` |
| `intent-read-recovery.spec.ts` | `"unreachable Intent locations recover after 15, 30, 60 and 60 seconds while revision checks continue"` (`688`) | `"unreachable Intent locations recover after 15, 30, 60 and 60 seconds"` (`:67-103`, 15/30/60/60 bounds, Retry offer, `scripts` + revision recovery, no 6th read after `+61 s`; `headsChecks` continuation owned by `e2e/intent/intent-read-boundary-recovery.spec.ts:78-85`) | `422, 329, 373` | `373` |
| `intent-read-recovery.spec.ts` | `"Intent locations make no recovery request while hidden and ask once on reveal"` (`605`) | same title (`:105-123`) | `235, 292, 165` | `235` |
| `intent-read-recovery.spec.ts` | `"published detail and Intent locations share a wait, and healing detail leaves Intent pending"` (`618`) | same title (`:125-165`, exercises `loadRepositoryTexts` optional `readFile` + `IntentReadRecovery`) | `204, 150, 266` | `204` |
| `intent-read-recovery.spec.ts` | `"malformed Intent settings stay visible until manual Retry"` (`759`) | same title (`:167-186`, no spontaneous retry after `+60 s`, manual Retry opens `scripts`) | `312, 170, 266` | `266` |
| `intent-read-recovery.spec.ts` | `"rate-limited Intent locations reread when the standing limit ends"` (`517`) | same title (`:188-221`, waits until 25 s Retry-After expires) | `153, 146, 297` | `153` |

- **Summed per-case medians and remaining slow cases:** Summed per-case medians fell from **`4,815 ms`** (`7` cases, per-case median `688 ms`) to **`2,295 ms`** (`8` cases, `-52.3%`, per-case median `250.5 ms`). No slow case (`>= 1 s`) remains; the longest mounted case is `"retrying a failed Intent locations read opens the configured source at its revision"` (`580 ms` median), which loads the Gherkin syntax grammar when rendering the recovered `.feature` file, while the other 7 cases run in `153–373 ms` median.
- **Shared `dashboard/test-support/` surface:** Shrank by `-6` net lines (`1` insertion, `7` deletions; `792` files, `82,277 → 82,271` lines from `c346263b7`), retiring `locationsRequest` from `dashboard/test-support/intentReadRecoveryPage.ts` and `pygardon` from `dashboard/test-support/intentGherkinUnusableFixtures.ts`. Remaining exports in `intentReadRecoveryPage.ts`, `intentGherkinUnusableFixtures.ts`, and `intentGherkinSettingsPage.ts` still serve `e2e/intent/intent-read-boundary-recovery.spec.ts` and `e2e/intent/intent-gherkin-unusable.spec.ts`.
