# Keep the shown reading through failed updates

**Identity:** SEED-241#keep-the-shown-reading-through-failed-updates
**Source:** [correction story](../../seeds/SEED-241-intent-loading-and-traffic.md#keep-the-shown-reading-through-failed-updates)
**Prepared:** 2026-11-05 by the execution retrospective of
`SEED-241#load-intent-without-disruption-or-bulk-source-transfer`. Planning
only; execution needs a separate instruction.

## Source and provenance

The reviewed execution delivered plan 477 on
`claude/load-intent-without-disruption-or-bulk-source-tr` in commits
`fa9fd1a02` (slice 1), `83589f5ff` (slice 2), `43cc96a50` (slice 3) and
`027e9a204` (slice 4), on top of its claim `9cd866dee`. Its source promises
(retained in that plan's `source-review.md` until wrap-up) include S6.4
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
   (`dashboard/tests/intent-revision-update-outcomes.spec.ts`, "an unusable
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
- Precondition: `main` changed after this execution's claim. The SEED-239
  landing restored local-proof dashboard code (`IntentProofSummary.tsx` reads
  each file of a selected location; the locations answer carries `proof`
  problems), and `useIntentLocations.ts`, `IntentPerspective.tsx`,
  `IntentBrowser.tsx` conflict with this branch. Execute this correction on
  the integrated shape, after the developer's decision on that code; if
  proof problems remain in the locations answer, the memo's `fixed` rule
  must not keep them, and proof Retry must bypass the kept answer.

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
Status: planned
Proof: two new tests in `intent-revision-update-outcomes.spec.ts`
(findings 1 and 2); the existing failed-update and malformed-settings tests
green; focused Intent suite green.

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

## Plan concerns

Slice 1 depends on the integrated shape of `useIntentLocations.ts` after the
developer's decision on main's restored local-proof code.
