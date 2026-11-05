# Recover failed Intent reads without Retry

**Identity:** SEED-192#recover-failed-intent-reads
**Source:** [selected story](../../seeds/SEED-192-review-product-intent.md#recover-failed-intent-reads)
in SEED-192, refined 2026-11-05 with challenge, clarify, investigate and
architecture.
**Source review:** [Independent source commitments](source-review.md)
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
- **Boundary contract (change):** candidates and settings currently answer
  unreadable with HTTP 200 and discard the classified failure. Carry the
  `recovery` that `readFailureMessage.ts` gives the same `gh` failure.
  The browser parsers (`authenticatedIntentCandidatesRead.ts`,
  `authenticatedIntentRead.ts`) accept the optional field. Location-listing
  failures already propagate through the whole-read response with HTTP 502
  and its existing `recovery`. Preserve and prove that path. The shown
  problem text does not change.
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
  field for transient reads and its absence for non-transient failures.
  Exercise the settings and candidates problem bodies and the existing
  location-listing HTTP 502 path.
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
Status: done
Proof: the preserved-behavior transient and limit-recovery specs listed above
pass unedited; `npm run typecheck:dashboard`.

**Internal change:** contributor-keyed pending state in `transientRecovery.ts`,
with the published observation as its only contributor. It shares the step,
due time and the existing due timer. `useLimitRecovery` reads the
observation's contribution, and a contributor due-signal hook is exported.

**External behavior:** the backlog's recovery is unchanged.

**Enables:** slice 2.

**Accepted proof:** The 37 unedited dashboard cases in the transient,
limit-credit, limited-reading, auto-refresh, project-read-isolation and
Codex launch-reconciliation cohorts passed. The paused-clock assertions in
`transient-read-recovery.spec.ts` check the 15/30/60/60 waits and restored
membership. `transient-recovery-currentness.spec.ts` checks zero heads
requests before the observation recovers and restored checks after.
`transient-recovery-lifecycle.spec.ts` checks hide/reveal and clears the
departed project's wait while the standing login limit remains.
The independent refactor preserved the wake if effect registration happens
after the deadline. It reran the 24 transient and credit cases plus five
auto-refresh and limited-detail cases, all passing. Typecheck passed.
Slice 2 owns the first proof with Intent pending.

The consumer trace connects the schedule to the published observation's
recovery notice, check schedule, source selection, and launch reconciliation.
The change follows [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
by extending the existing schedule, and [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
by retaining recovery state in the observing page.

### 2. Intent locations recover from an unreachable boundary or a GitHub limit
Type: Behavior
Status: done
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

**Accepted proof:** On Slice 1's product, three new journeys missed the
reread at the deadline, on reveal, or at the rate-limit expiry. The
malformed-settings case already stayed actionable. Slice 2 passed all
five new journeys in `intent-read-recovery.spec.ts`, including an actual
standing limit at the tree boundary and simultaneous published-detail
and locations transport failures. The latter initially saw two detail
requests and three locations requests at the first wake. The live due
check fixed the duplicate. The final journey observes two of each at the
shared first wake, no additional request while Intent waits, and a third
locations request after the 30-second wait.

The unchanged published-recovery, limited-read, Intent browse/Retry and
selection cohorts passed alongside the new journeys (61 total). Six
startup-reconciliation cases passed separately. Dashboard typecheck
passed. The shared classifier is consumed only where a read interprets
`ReadProblem.recovery`; other Intent readers still present their existing
failure. The observation passes its existing limit and visibility signals
to Intent, so Intent mounts no timer of its own.

The independent refactor put the provider at the dashboard's single Intent
mount. Twelve Intent recovery, Retry, selection, project-switch and
candidates cases passed. Nine frame and Cucumber proof cases passed,
including the existing Proof Retry beside the same Purpose. Typecheck
passed again.

Previous accepted slice: `b24ddba9d492298853d08155a6596ec8b8c63530`
on the remote story branch.

### 3. Intent reads recover from failures the boundary marks transient
Type: Behavior
Status: planned
Proof: `intent-read-recovery.spec.ts` examples 2 and 6; the two boundary specs'
`recovery` assertions; `intent-test-optimization-candidates-states.spec.ts`.

**Behavior:**

- **Pre-condition:** a visible Intent page whose Test Optimization Candidates
  record or settings answered unreadable, or whose location listing failed,
  because `gh` was unreachable, timed out or met a transient HTTP status.
  Candidates also recover from an unreachable boundary or a rate limit.
- **Trigger:** the schedule comes due.
- **Result:** that read happens again in place, and the record's groups or the
  locations appear without Retry.
- **Unchanged:** non-transient unreadable answers keep waiting for Retry.

**Includes:** the boundary's `recovery` field on settings and candidates
problem answers and their browser parsers, proof of the existing field on
location-listing failures, and `IntentCandidatesRecord` joining the Intent
recovery hook.

**Execution learning:** At `b24ddba9d`, `filesUnderLocation` failures propagate
out of `performIntentLocationsRead` to the common failed-read response.
The classification is already on that response. Slice 3 will prove its
consumption by the locations reader and preserve the existing status and
message.

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


## Execution context

- Story Branch Mode in the owned checkout
  `/Users/terryyin/git/open-dough/.worktrees/recover-failed-intent-reads-without-retry`
  on `codex/recover-failed-intent-reads-without-retry`, assigned to
  `ivan-chan` via publisher `dashboard-territory.local-open-dough`.
  The checkout's creation ref names this story. The default checkout is
  `/Users/terryyin/git/open-dough`.
- Starting revision `55594d875cb110d09bc5c07db232e1ed60139a50`.
  Take `2cec2bfef08c66fad2225d9cef0351c286b3e6b8` confirmed on
  `origin/main` and the remote execution branch. The Story Branch observer
  covers increments on the latter. Take CI coverage was unobserved.
- Checkout setup passed `node scripts/setup-native.mjs npm`, `browser`,
  `check`, and `npm run typecheck:dashboard` with Node 24.21.0.
- GitHub Actions selector `ci.yml`, verified as CI. Codex coordinator
  `ivan-chan-b02a9539`, cell `g11:9`, session `94424`, observer
  `/tmp/dough-ci-501/watch-8qFkCN` (PID 91401).
