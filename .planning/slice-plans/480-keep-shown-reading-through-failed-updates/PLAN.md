# Keep the shown reading through failed updates

**Identity:** SEED-241#keep-the-shown-reading-through-failed-updates
**Source:** [correction story](../../seeds/SEED-241-intent-loading-and-traffic.md#keep-the-shown-reading-through-failed-updates)
**Source review:** [source review](source-review.md)
**Prepared:** 2026-11-05 by the execution retrospective of
`SEED-241#load-intent-without-disruption-or-bulk-source-transfer`. Planning
only; execution needs a separate instruction.

## Source and provenance

The reviewed execution delivered plan 477 on
`claude/load-intent-without-disruption-or-bulk-source-tr` in commits
`fa9fd1a02` (slice 1), `83589f5ff` (slice 2), `43cc96a50` (slice 3) and
`027e9a204` (slice 4), on top of its claim `9cd866dee`. Its source promises
(recoverable at
`1ff9804b9:.planning/slice-plans/477-load-intent-without-disruption/source-review.md`,
with the plan beside it) include S6.4
"Preserve the reading place through slow or failed refreshes", S6.3 "Keep the
rest usable during loading", U9 "If the update fails, the shown reading
stays" and U10 "the failure and a retry appear beside the notice".

## Current findings

1. **Leaving Intent during a held or failed update loses the shown
   revision.** `useIntentReadingRevision` (`dashboard/src/IntentRevisionNotice.tsx`)
   keeps the target revision C in the page reading place, while the revision
   actually shown (A) lives only in `useIntentLocations`' component state
   (`dashboard/src/useIntentLocations.ts`, `read.shown`). After **Show latest**
   with C held or failed, Development → Intent remounts the body:
   `keptIntentLocationsAt(source, C)` finds nothing, so the page shows
   "Reading Intent locations…" and then a full "could not be read" failure,
   with no notice and without A's tree or text, although A's answer is still
   in the answer memo. No test covers it.
2. **An unreadable settings answer at the newer revision replaces the shown
   reading.** `useIntentLocations` stores any answered result, including
   `settings-problem` with `problem: unreadable`, as the new shown answer;
   only thrown failures keep A. The server marks unreadable settings as a
   recoverable read failure (`dashboard/server/intentLocationsRead.ts`,
   `recovery`). Slice 4 tested only malformed settings
   (`dashboard/tests/intent-revision-update-boundaries.spec.ts`, "an unusable
   settings file at the latest revision …"), which is a real answer and may
   keep replacing the reading.
3. **Overlapping read-reuse journeys.** `dashboard/tests/intent-read-reuse.spec.ts`
   tests "reopening a feature and returning from Development ask nothing more
   at the same revision" and "a feature read before, and Intent opened again,
   show without a reading moment" run the same fixture and journey; the
   first test's re-expand and reopen steps after the return predate the kept
   reading place, which `intent-reading-place.spec.ts` test 1 now proves more
   strongly.

## Preserved promises and constraints

- Malformed settings at the newer revision stay a real answer that replaces
  the reading, with focus moved to its explanation (current slice 4
  behavior and test).
- No server change; answers stay `no-store`; failures, limited and refused
  answers are never kept (`answerMemo.ts`).
- The CI status mode keeps following the observed head.
- Integrated shape: the reviewed branch merged main at `94ed10204`
  (Intent CI homepage in `IntentSelectionReading.tsx`, two modes) and
  removed the local-proof code SEED-239's landing had restored, so the
  locations answer carries no proof problems.

## Outside-in proof

| Finding | Owner and observable result |
| --- | --- |
| 1 | Slice 1: in `intent-revision-update-outcomes.spec.ts`, a held then failing C read after **Show latest**, then Development → Intent: A's tree, selection and text show with the notice's failure and Retry, and no repeat A locations read |
| 2 | Slice 1: an unreadable settings answer at C keeps A's reading with the failure and Retry; Retry with a readable answer applies C. The malformed-settings test stays green unchanged |
| 3 | Slice 2: the two `intent-read-reuse.spec.ts` journeys become one test asserting both the read counts and no reading moment; `intent-reading-place.spec.ts` test 1 keeps the restored-place proof |

**Local gate:** each slice runs `npm run lint`, `npm run typecheck:dashboard`
and the focused Intent suite (`dashboard/tests/intent-*.spec.ts`,
`development-intent-frame*.spec.ts`, `boundary/intent-*`) with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts … --reporter=list`
and Homebrew Bash 5 first on `PATH`.

**Failure policy:** [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written.

## Slices

### 1. A failed or unreadable update keeps the shown revision
Type: Behavior
Status: done
Proof: remount and unreadable tests in `intent-revision-update-outcomes.spec.ts`
(findings 1 and 2); existing failed-update green there; malformed-settings and
cross-project isolation in `intent-revision-update-boundaries.spec.ts` green;
focused Intent suite green (124). Product: `useKeptReading("shown-revision")`
with `shownFromKept` fallback; `settings-problem`/`unreadable` →
`settleFailedLocationsRead` / `failedUpdate`.

**Behavior:** **Show latest** pressed and C's locations read is held, fails
or answers unreadable settings → A's reading stays with the failure and
Retry, also after Development → Intent; Retry applies C when it can be read.

Keep the shown revision in the page reading place beside the reading
revision, and have `useIntentLocations` fall back to that revision's kept
answer when the reading revision has none. Treat a `settings-problem` with
`problem: unreadable` as a failed update.

### 2. One read-reuse journey
Type: Structure
Status: planned
Proof: the merged `intent-read-reuse.spec.ts` test passes and fails when
either the repeat read or the reading moment is reintroduced (checked by a
temporary revert); `intent-reading-place.spec.ts` green.

Merge the two overlapping journeys and drop the post-return steps that
`intent-reading-place.spec.ts` covers.

## Current decisions

- Malformed settings remain a replacing answer; only unreadable settings and
  thrown failures are failed updates.

## Learnings

- Unreadable settings must be classified on the answered path (`.then`), not
  only `.catch`; remount needs the shown revision in the page place because
  `read.shown` is component state.
- Refactor: shared `settleFailedLocationsRead`; split update-outcomes over
  250 lines into keep-shown vs replace/isolation specs.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Leaving Intent during a held then failing C locations read loses A's tree, selection and text, with no revision notice | Slice 1 Behavior proof in `intent-revision-update-outcomes.spec.ts` | Scratch Playwright defect journey at workspace HEAD after `npm ci` (2026-11-06): hold/fail C after **Show latest**, hold C again, Development → Intent, fail C; `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts dashboard/tests/intent-revision-update-outcomes.spec.ts -g 'SCRATCH' --reporter=list`. Scratch reverted before recording. | Confirmed: no feature source or selection; body shows could-not-be-read; revision notice absent |
| An unreadable settings answer at C replaces A's reading | Slice 1 Behavior proof for unreadable settings | Same scratch run: move trunk to C with `unanswered: [.planning/open-dough.json]`, **Show latest**, wait for reads | Confirmed: `.intent-settings-problem` names the unreadable settings file; feature source and selection gone |
| Two `intent-read-reuse.spec.ts` journeys share fixture and remount shape; post-return expand/reopen steps overlap `intent-reading-place.spec.ts` test 1 | Slice 2 Structure merge | Read `dashboard/tests/intent-read-reuse.spec.ts` (tests at lines 48 and 128) and `dashboard/tests/intent-reading-place.spec.ts` test 1 at workspace HEAD | Confirmed: same publish/open/expand/open-feature journey; first test re-expands and reopens after Development return; reading-place test 1 already proves restored place without re-read |

## Plan concerns

Slice-plan refinement was not needed: two slices, one Behavior correction and
one Structure test consolidation within the understood outcome; proof ownership
maps 1:1; no unresolved integration assumption beyond the settled premises
above. Remaining concerns: none.
