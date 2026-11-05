# Recover failed Intent reads without Retry

**Identity:** SEED-192#recover-failed-intent-reads
**Source:** [selected story](../../seeds/SEED-192-review-product-intent.md#recover-failed-intent-reads)
in SEED-192, refined 2026-11-05 with challenge, clarify, investigate and
architecture.
**Prepared:** 2026-11-05. Planning only, in the story's established workspace
(branch `claude/recover-failed-intent-reads-without-retry`, agent
bastiaan-chan), continuing the refinement in the same session.

## Goal and boundaries

An Intent locations read or Test Optimization Candidates read that fails
eligibly is read again in place when the page's recovery schedule is due on a
visible page, so a developer sees the locations and candidates again without
pressing Retry. The seed's seven key examples are the acceptance.

Included, as the seed records:

- Eligibility for an unreachable local boundary.
- Recovery from a GitHub limit once the standing limit ends.
- Boundary-classified transient failures, which the boundary must now carry on
  Intent's settings, location-listing and candidates problems.
- The schedule's second contributor.

Excluded:

- Intent proof and Purpose file-text reads, which keep their Retry.
- A notice saying when Intent reads again.
- Any new promise about published-work recovery. A published-work behavior
  change that the shared classification brings is allowed only while the
  existing published-work recovery proof stays green.

Apply this repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
throughout.

**Local gate:**

- Each slice runs its focused Playwright specs through the dashboard's runner
  (`npx playwright test --config dashboard/playwright.config.ts <specs>
  --reporter=list`, with `NO_COLOR`, `FORCE_COLOR` and
  `GIT_ALTERNATE_OBJECT_DIRECTORIES` unset), plus `npm run
  typecheck:dashboard` and `npm run lint`.
- Before landing, because the page-wide recovery schedule and the shared read
  path change, run `npm run test:dashboard` once. Put Homebrew Bash 5 first on
  PATH and run under `caffeinate -s -i` on AC power
  ([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)).
- This workspace already ran `setup-native.mjs npm` and `browser`.

## Direction and PFE

- **Recovery schedule (change):** `dashboard/src/transientRecovery.ts` keeps
  one due time and backoff step for the page. Its single `pending` flag
  becomes a set of named contributors: the published observation, and Intent.
  - `noteTransientFailure(contributor)` advances the step only when no
    contributor was already pending in the current wait. This stops one
    restart from advancing the step twice.
  - `clearTransientFailure(contributor)` removes only that contributor. The
    step and due time reset when none remains.
  - Leaving the project (`selectSource`) clears every contributor.
  - `limitRecovery.ts` `useLimitRecovery` derives `checksMayRun`,
    `blocksFreshRead` and its due `readAfresh` from the observation's own
    contribution only, as today.
  - A new hook gives a contributor its due signal: due on a visible page, no
    standing limit, and that contributor pending. Hidden/reveal follows the
    same `Visibility` rule.
  - No second timer is added: the existing `useStandingTransientRecovery` due
    timer drives both contributors.
- **Intent contributor (new, small):** one Intent recovery hook shared by
  `useIntentLocations` and `IntentCandidatesRecord`.
  - Each reader reports a settled read as eligible-unanswered (`ReadProblem`
    with `recovery: "transient"`, or `limited`) or as answered.
  - When the schedule is due for Intent, the hook asks each failed reader to
    read again in place, through the same path as its Retry.
  - Intent's contribution clears only when no Intent reader is still
    eligible-unanswered.
  - Rate limits: a `limited` failure is due when the standing limit ends,
    through the existing `useStandingLimit`, never earlier.
- **Unreachable boundary (shared classification):** `authenticatedGet.ts`
  already turns a `fetch` rejection into a `ReadProblem`. It now carries
  `recovery: "transient"` as well; `AbortError` stays as it is. This is one
  rule for every read and needs no Intent-only recognizer. Through the
  published observation it also makes an empty page or a detail gap after a
  rejected fetch eligible. The seed allows this without promising it, and
  slice 2's preserved-behavior specs guard it.
- **Boundary contract (change):** `server/intentCandidatesRead.ts`,
  `server/intentLocationsRead.ts` and `server/intentLocationsSettings.ts`
  answer an unreadable record, settings or location listing with the
  `recovery` that `readFailureMessage.ts` `recoveryOf` gives the same `gh`
  failure. Reuse that function and do not copy its table. The browser parsers
  (`authenticatedIntentCandidatesRead.ts`, `authenticatedIntentRead.ts`)
  accept the optional field and turn an eligible problem into eligible
  unanswered. The shown problem text does not change.
- No Accepted ADR is contradicted. ADR 0008 keeps recovery timing as
  page-local observation state, and ADR 0002 favors reusing the schedule. No
  North Star topic is needed: the change stays inside the existing schedule's
  module comments.

## Decisive premises

| Premise | Consuming operation | Observation (form, profile, time) | Result | Remainder |
| --- | --- | --- | --- | --- |
| An unreachable-boundary locations read is never read again (the symptom) | Slice 2 | Scratch Playwright spec in this workspace at `64d0d1c16`, 2026-11-05: Doughnut fixture, `page.route` aborting the first `intent=locations` request (`connectionreset`), paused page clock advanced 70 s on a visible page; dashboard runner with list reporter; spec deleted afterwards | 1 locations request after 70 s; "could not be reached" alert still shown | none |
| A `gh`-unreachable candidates read answers `200` `unreadable` with no recovery mark and is never read again | Slice 3 | Same scratch spec: Open Dough fixture with the candidates path `unanswered` (`noConnection`), Optimization Candidates tab chosen, 70 s advanced | 1 answer: `200 {"revision":…,"candidates":null,"candidatesProblem":"unreadable"}`; no reread | none |
| The browser gives a rejected `fetch` no transient eligibility | Slice 2 classification | `dashboard/src/authenticatedGet.ts` catch block read at `64d0d1c16`; the first scratch observation above reached it (the alert names "could not be reached") | Plain `ReadProblem`, no `recovery` | none |
| The observation's settle clears the shared store, and its `pending` gates revision checks and launch fresh reads | Slice 1 | `limitRecovery.ts` `recordSettledOutcomes` / `useLimitRecovery` and `publishedObservation.ts` read at `64d0d1c16` | Holds. A naive shared `pending` would either be cleared under Intent or hold back the backlog's checks | Slice 1 preserves this through the existing recovery specs; slice 2's example 7 spec discriminates the gate |
| Paused-clock Playwright specs drive Intent with the production boundary and `gh` fixtures | All slices' proof | The scratch spec above passed both tests in 8.9 s | Route available | none |

## Outside-in proof

- **Examples 1, 3, 4, 5 and 7** (unreachable locations recover with backoff;
  hidden waits; malformed settings stay; backlog checks not held back): new
  `dashboard/tests/intent-read-recovery.spec.ts`.
  - It uses a paused page clock and `page.route` aborts on `intent=locations`.
  - It counts reads, as `transientRecoveryPage.ts` does for `main`.
  - It counts heads checks through `autoRefreshJourney.ts` `headsChecks`.
- **Examples 2 and 6** (gh-transient candidates recover; rate-limited
  candidates wait for the limit): the same spec. It uses the
  `unanswered`/`noConnection` fixture, and a limited answer through the
  existing limit fixtures (`limitNotice.ts`, `limitedReadingRecords.ts`).
- **Boundary contract:** `dashboard/tests/boundary/authenticated-read-intent-candidates.spec.ts`
  and `authenticated-read-intent-locations.spec.ts` assert the `recovery`
  field for a `gh`-unreachable read and its absence for a non-transient
  failure.
- **Preserved behavior:**
  - `transient-read-recovery.spec.ts`, `transient-detail-recovery.spec.ts`,
    `transient-read-exclusions.spec.ts`, `transient-recovery-lifecycle.spec.ts`,
    `transient-recovery-currentness.spec.ts` and `limit-recovery-credit-*.spec.ts`
    stay green unedited.
  - `intent-gherkin-settings-problems.spec.ts` (Retry still works) and
    `intent-test-optimization-candidates-states.spec.ts` stay green.

## Slices

### 1. The recovery schedule keeps each contributor's pending recovery
Type: Structure
Status: planned
Proof: the preserved-behavior transient and limit-recovery specs listed above
pass unedited; `npm run typecheck:dashboard`.

**Internal change:** contributor-keyed pending state in `transientRecovery.ts`,
with the published observation as its only contributor. It shares the step,
due time and the existing due timer. `useLimitRecovery` reads the
observation's contribution, and a contributor due-signal hook is exported.

**External behavior:** the backlog's recovery is unchanged.

**Enables:** slice 2.

### 2. Intent locations recover from an unreachable boundary or a GitHub limit
Type: Behavior
Status: planned
Proof: `intent-read-recovery.spec.ts` examples 1, 3, 4, 5 and 7 (example 1
fails without the Intent contributor); the preserved-behavior specs.

**Behavior:**

- **Pre-condition:** a visible Intent page whose locations read was refused
  because the local boundary is unreachable or GitHub's limit stands.
- **Trigger:** the schedule comes due (15, 30, 60, then 60 seconds; or when
  the limit ends).
- **Result:** the locations are read again in place and shown without Retry.
  A hidden page asks only once seen again.
- **Unchanged:** malformed settings wait for Retry, and the backlog's
  revision checks keep their pace.

**Includes:** the shared `authenticatedGet` classification, and the Intent
recovery hook wired into `useIntentLocations`.

### 3. Intent reads recover from failures the boundary marks transient
Type: Behavior
Status: planned
Proof: `intent-read-recovery.spec.ts` examples 2 and 6; the two boundary specs'
`recovery` assertions; `intent-test-optimization-candidates-states.spec.ts`.

**Behavior:**

- **Pre-condition:** a visible Intent page whose Test Optimization Candidates
  record, settings or location listing was answered unreadable because `gh`
  was unreachable, timed out or met a transient HTTP status; or whose
  candidates read was refused by the unreachable boundary or a limit.
- **Trigger:** the schedule comes due.
- **Result:** that read happens again in place, and the record's groups or the
  locations appear without Retry.
- **Unchanged:** non-transient unreadable answers keep waiting for Retry.

**Includes:** the boundary's `recovery` field on Intent problem answers and
their browser parsers, and `IntentCandidatesRecord` joining the Intent
recovery hook.

## Current decisions

- Story Branch Mode; no trunk step.
- The unreachable-boundary classification lives in `authenticatedGet.ts` for
  every read: one rule, not an Intent-only recognizer. The published
  observation's resulting recovery is allowed but not promised.
- Intent's pending recovery never gates the observation's revision checks or
  launch reconciliation. Those gates guard only the observation's own wait.
- A recovered read goes through the same path as Retry, so selection and
  Purpose behave exactly as after Retry.

## Concern evidence

- Slice-plan refinement was not needed. Slice 1 prepares only slice 2's
  contributor. Slices 2 and 3 each own one eligibility source and proof loop,
  and slice 3 extends slice 2's Intent hook rather than adding a second
  recovery path.
- No remaining slice-specific concern was identified.
