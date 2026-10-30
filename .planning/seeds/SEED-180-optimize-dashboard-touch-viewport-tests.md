---
id: SEED-180
status: active
planted: 2026-10-30
planted_during: Terry's review and wrap-up of dashboard test candidate triage
trigger_when: Redundant touch viewport cases may prolong ordinary local dashboard test feedback
scope: dashboard touch test family redundancy and case-count reduction
---

# SEED-180: Optimize dashboard touch viewport tests

## Why This Matters

Developers need prompt, trustworthy dashboard test feedback and touch journeys
that are cheap to maintain. Completed candidate triage identified repeated
phone/tablet journeys as a possible source of cost; refinement on 2026-10-30
found the family's suite-wall cost too small to measure but its redundancy
real, so Terry made reducing redundancy and the number of tests the story's
target. This story owns plan 413's implementation separately from that
completed triage.

## Selected Stories

<a id="optimize-dashboard-touch-viewport-tests"></a>

### Collapse redundant dashboard touch viewport matrices

**Identity:** SEED-180#optimize-dashboard-touch-viewport-tests
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/413-resolve-dashboard-touch-viewport-candidates/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"611016daf826d907e13161d100b50cee02331c190852030fa06996c1181dc9eb","plan":"f34283112ba3c9235c75e5059bb2e3fc17da54c0a82d69b3c0793dd9bc8a732d"}}
```

**Beneficiary:** A developer running the dashboard tests locally and
maintaining the touch journeys.

**Goal:** Reduce redundancy and the number of test cases in the dashboard
touch test family while preserving behavioral coverage and confidence, so
that each touch rule has one owner and local feedback on touch behavior is
shorter. Terry set this target on 2026-10-30: fewer cases and less repeated
proof are the outcome; a shorter focused-family wall time is the evidence that
the reduction took effect, not a suite-wall promise.

**Scope:** The family is the fourteen specs under `dashboard/tests/` that use
`touchLaunchPage.ts`: twelve loop the phone and tablet devices, two select a
phone. Three kinds of reduction, each with surviving proof named before the
removal:

1. **Device repeats.** Run each journey on one device unless the other device
   reaches an asserted CSS branch or arrangement the first does not. The phone
   pair (390×844, 844×390) already crosses every width branch (400, 480, 640,
   800 px) and the ≤480 px height branch; tablet adds the side-by-side story
   review body at 768 portrait and the wide-and-tall landscape.
2. **Repeated patterns across files.** One owner per pattern at the cheapest
   tier; other journeys keep only their own delta. Patterns: a draft survives
   rotation and reduced height and can be edited there; Cancel sends or
   writes nothing and focus returns; a failed local write keeps the
   predecessor bytes and Retry resubmits the exact draft; touch reads settings
   groups and returns after rotation; coarse Session details read without
   hover; open a session by tap, Close detaches only; Maximize/Restore keeps
   fit or reading position; rotation keeps a selection or reading place.
3. **Steps already proven elsewhere.** A touch step that repeats a rule a
   non-touch journey or boundary test owns leaves the touch journey; the
   owner is cited in the plan's surviving-proof record.

Evidence basis (Terry, 2026-10-30): measure the focused family's wall time
over three consecutive passes before and after under recorded load, with the
retained hosted per-test share as context; run the ordinary
`npm run test:dashboard` once after the change as a green check only, not as
speedup evidence. Record case counts before and after, focused wall times,
surviving proof, and comparison limits in
`docs/maintainer/dashboard-test-timings.md`; when the family's placement rule
changes, state it in `dashboard/tests/README.md`.

**Scope limits:** No product behavior changes; no retries, sleeps, skips, or
focus markers. Every unique touch protection stays: native touch input and
terminal fitting at reduced height, touch scrollback and the identity-header
scroll, rotation keeping a draft, selection, or reading position without a
re-read, the Done-row coarse disclosure, the 430×932 band and the held
progress answer in the start-session answer row, and a live terminal surviving
a settings round trip with viewport changes (which may move into its non-touch
owner as one step). Redundancy outside the touch family is a separate story.
Suite-wall speedup claims are out of scope.

**Key examples:**

1. **Plain tablet repeat.** `system-settings-look`'s tablet reading case asserts
   the same groups, rotation read, and Back as its phone case, and the tablet
   reaches no settings branch the phone pair misses → the tablet case goes;
   the phone case and the non-touch 420 px fit case are the surviving proof.
   The same rule removes the other plain repeats.
2. **Branch-bearing device stays.** `story-review-touch` at tablet portrait is
   the only touch view whose review body is wide enough for side-by-side
   panes → its tablet case stays unless the plan names equivalent touch proof
   on that layout.
3. **Pattern owner.** A failed settings write keeping predecessor bytes and
   Retry resubmitting the draft is owned by each settings spec's non-touch
   case → the touch journeys keep only what touch adds (the alert readable
   under the sticky bar, the draft kept through rotation with the failure
   shown) and drop their repeated remove-failure and clear-on-leave blocks.
4. **Already owned elsewhere.** `story-review-mark-touch` repeats the
   uncommitted-check rule that `story-review-uncommitted-check` owns → its
   touch delta (the 44 px label tap, the state kept through rotation) folds
   into `story-review-touch` and the file goes.
5. **Measured outcome.** Before: 36 cases in the family, focused wall over
   three passes under recorded load. After: fewer cases, every removal with
   named surviving proof, focused wall not worse (expected shorter by about
   the removed cases' recorded durations), ordinary suite green once →
   retain and record. A removal whose surviving proof cannot be named stays.
6. **Unique case stays.** `recently-done-sessions-sidebar-touch` is the only
   proof of the Done-row coarse disclosure → unchanged.

**Investigation (2026-10-30 refinement; static inspection, retained hosted
reports, and a local `--list`):** the family lists 36 cases in 14 files, 24 of
them matrix cases. In hosted run 40796911428 at `930974d6` the matrix cases
summed to 237 s of 7,460 s total test seconds (3.2%), the family to 322 s
(4.3%); two green local baselines under like load differed by 150 s, more
than the family's whole cost, which is why suite-wall measurement was dropped
as the evidence basis. Classification found ten plain tablet repeats, three
further tablet or orientation repeats with a named survivor, step-level
repeats of rules owned by non-touch journeys, and five unique protections
(listed in Scope limits). Architecture: nothing consequential.
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md)
governs the keep decision; the
[test guidance](../../dashboard/tests/README.md#where-a-check-goes) already
proves a layout rule once per CSS branch.

**Plan:** [Plan 413](../slice-plans/413-resolve-dashboard-touch-viewport-candidates/PLAN.md).

**Execution authority:** Queued first at Terry's request. Do not Take, profile,
or implement until a later instruction authorizes execution.

## Breadcrumbs

- Completed triage: SEED-178#resolve-dashboard-test-optimization-candidates;
  source at `0136acf88f0f639d368ad94d54d04279a067de34`,
  `.planning/seeds/SEED-178-resolve-dashboard-test-optimization-candidates.md`.
- [Accepted candidate decisions](../../docs/maintainer/dashboard-test-timings.md#resolved-2026-10-30-resolve).
- [Dashboard test guidance](../../dashboard/tests/README.md#where-a-check-goes).
- [ADR 0010: Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md).
