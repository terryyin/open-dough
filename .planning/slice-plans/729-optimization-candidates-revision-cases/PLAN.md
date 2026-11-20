# Read the Optimization Candidates record across Show latest in mounted cases

**Identity:** SEED-413#optimization-candidates-revision-cases
**Source:** [Read the Optimization Candidates record across Show latest in mounted cases](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#optimization-candidates-revision-cases)
**Source review:** [Independent source review](source-review.md)

## Goal and scope

Replace the built-app
[`intent-test-optimization-candidates-revision.spec.ts`](../../../dashboard/frontend-tests/intent/intent-test-optimization-candidates-revision.spec.ts)
with three plain Vitest cases on mounted Chromium. Optimization Candidates
stays chosen across a new revision and reads the new record after **Show
latest**. An old read still outstanding at **Show latest** shows no failure
when it departs, and cannot replace the new record when it answers late.
Follow the
[source file read cases](../../../dashboard/frontend-tests/intent/intent-source-target-recovery-mounted.spec.ts)
and [Which entry a case uses](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses).
Mount the real `ProjectIntentReading` through `mountIntentReading` on
Optimization Candidates, with typed locations and record replies. Offer the
new revision with `offerRevision`.

Exclusions: the other Optimization Candidates cases (record content, opening
sources, record states, live records and read recovery), every other family,
the full-group timing comparison and the `frontendApp.ts` retirement all stay
with `SEED-413#renovate-later-dashboard-frontend-unit-test-families`.

## Key examples and proof

| Example | Observable signal |
| --- | --- |
| Stays chosen and reads the new record | At `before`, the Optimization Candidates tab is selected, the record reads `Recorded at revision <before>` and shows entry `launch-records-poll-waits`. After the new revision is offered, the notice shows and all three still hold. After **Show latest**, the tab is still selected, the record reads `Recorded at revision <after>` and shows entry `launch-records-page-clock`. The old entry is absent. |
| The old read departs | The read at `before` is outstanding and rejects with its signal's abort reason. After **Show latest**, with the read at `after` held, the record reads `Recorded at revision <after>` and `Reading Test Optimization Candidates…`. The record holds no alert. After release, the new entry shows. |
| A late old answer | The read at `before` ignores its abort. After the new entry shows, it answers with the old record. The record stays at `after`, the new entry shows and the old entry is absent. |

## Current decisions

- **Mount.** Use `mountIntentReading(readSource, before, "candidates")` from
  [`intent-revision-fixtures.ts`](../../../dashboard/frontend-tests/intent/intent-revision-fixtures.ts)
  unchanged. The read source gives empty configured locations, a `readFile`
  no case reaches, and a `readCandidates` reply chosen by revision in the
  case.
- **Chosen view.** The page keeps the chosen view per project and selected
  story in `pageIntentMode.tsx`, which takes no revision. The fixture's
  `ChosenView` stands in for it, as in the source file read cases. The
  mounted cases prove that the reading keeps showing the chosen view's
  record across the offer and **Show latest**, and asks for no other view.
  [`intent-ci-status-kept.spec.ts`](../../../dashboard/frontend-tests/intent/intent-ci-status-kept.spec.ts)
  proves the page's keeping across Development and a project change.
- **Old reads.** `offerRevision` builds new published work, so the record
  asks for `before` again when the revision is offered. Each case answers
  every read at `before` the same way. Assert that the read at `after` was
  asked, with no exact count of reads at `before`.
- **Two endings for the old read.** The page's read rejects when its reader
  departs (`joinRead` in `dashboard/src/sharedRead.ts`), which reaches the
  record's `catch` guard. A typed reply may also answer after its abort,
  which reaches the `then` guard. Each ending gets its own case, sharing the
  arrangement.
- **Data.** Build each record with
  `makeMe.aTestOptimizationCandidatesRecord.pending(<slug>, …)` from
  `pageMakeMe.mjs`. Do not import `intentCandidatesFixtures.ts`.
- **Page object.** Extend
  [`intent-candidates-page.ts`](../../../dashboard/frontend-tests/intent/intent-candidates-page.ts)
  with what the reader observes: the view is chosen, the record's revision
  line, an entry shown or absent, the reading moment, and no failure. Offer
  and **Show latest** go through the fixture and
  `intent-revision-notice-page.ts`. Add nothing to `dashboard/test-support/`.
- **Spec name.** The mounted cases live in
  `dashboard/frontend-tests/intent/intent-candidates-revision.spec.ts`, so
  both specs can exist during slice 1.
- **Revision check.** Drop the built-app steps that pass page time until the
  page checks its revision. The check schedule reads no Intent state, and
  [`e2e/observation/auto-refresh.spec.ts`](../../../e2e/observation/auto-refresh.spec.ts)
  proves its pace with reads outstanding.
- **Test-support retirement.** At `37dc94fbd` the moved spec is the last
  outside caller of `passTimeUntilCheckedWhileReadsOutstanding` in
  `dashboard/test-support/autoRefreshJourney.ts`; fold it into
  `passTimeUntilChecked`. `dashboard/test-support/intentMovingOpenDough.ts`
  names this spec as its purpose and has no importer; delete it. Every other
  module the spec imports has another consumer. Recheck after slice 2
  removes the spec.

## Decisive premises

| Consuming operation | Observation |
| --- | --- |
| A mounted `ProjectIntentReading` on Optimization Candidates keeps the view chosen across an offered revision and reads the new record after **Show latest** | Scratch at `37dc94fbd` in this workspace, now reverted: a mounted spec under `dashboard/frontend-tests/intent/` with the mount and read source above. Ran `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:frontend -- intent/zz-scratch-candidates-revision`. The tab stayed selected, the record read `before` with the old entry until **Show latest**, then `after` with the new entry alone. Passed in 371 ms. |
| A late old answer cannot replace the new record, and the case discriminates | Same scratch and command. The old reply ignored its abort and answered after the new entry showed. Passed in 277 ms. With the `then` guard in `IntentCandidatesRecord.tsx` replaced by an always-true check, the case failed with entry `poll-waits` present. The reads asked were `before`, `before`, `after`. |
| A departed old read shows no failure while the new read is held, and the case discriminates | Scratch at `37dc94fbd`, now reverted, run as `… -- intent/zz-scratch-candidates-departed`. The old reply rejected with its signal's abort reason. Passed in 389 ms. With the `catch` guard replaced by an always-true check, the case failed. |

## Ordered slices

### 1. The chosen view and the new record across Show latest are proven on the mounted reading

Type: Structure
Status: done

This removes the built-app mount, the moving project publication and
page-clock driving from the stays-chosen proof. Extend the record page
object. Write the stays-chosen case in
`intent-candidates-revision.spec.ts`. Narrow the built-app spec to its
held-answer case.

| Promise | Slice 1 proof |
| --- | --- |
| The stays-chosen example holds | The new mounted case passes and asserts every signal in its row. |
| The case discriminates | A scratch edit makes `IntentCandidatesPanel` render the record at a fixed first revision. The case fails on the revision line or the entries, then passes once the edit is reverted. |
| Production reads unchanged | The remaining built-app held-answer case and `intent/intent-source-target-recovery-mounted` still pass. |

Learning: `npm run test:dashboard:frontend` given a mix of Vitest and
Playwright selections runs only the Vitest ones. Select the built-app spec on
its own and set `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` to confirm its
result.

### 2. Both endings of the old read are proven on the mounted reading, and the built-app spec is gone

Type: Structure
Status: done

Add the departing and late-answer cases with their held replies. Delete
`intent-test-optimization-candidates-revision.spec.ts`. Fold
`passTimeUntilCheckedWhileReadsOutstanding` into `passTimeUntilChecked`,
delete `intentMovingOpenDough.ts`, and recheck test-support consumers.

| Promise | Slice 2 proof |
| --- | --- |
| Both old-read examples hold | Both mounted cases pass with every signal in their rows. |
| Each case discriminates | With the `catch` guard in `IntentCandidatesRecord.tsx` made always true in a scratch edit, the departing case fails. With the `then` guard made always true, the late-answer case fails. Both pass once reverted. |
| Spec removed with no orphan | `grep -rn "intent-test-optimization-candidates-revision\\|intentMovingOpenDough\\|passTimeUntilCheckedWhileReadsOutstanding" dashboard e2e` lists nothing. `npm run typecheck:dashboard` and `npm run lint` pass. Run `npm run test:dashboard:frontend -- navigation/story-reference-done-recovery` as a caller of the folded `passTimeUntilChecked`; it passes. |
| Focused speed | Run `npm run test:dashboard:frontend -- intent/intent-test-optimization-candidates-revision --workers=2` at `37dc94fbd`, and the new spec's selection after the change. Interleave three warm runs each and record median command time and load. |

Learnings:

- The **Old reads** decision was wrong in one respect: the revision notice
  appears only after the first read at `before` settles. Each old-read case
  answers that first read at once, and its departing or late reply applies
  from the re-read at the offer onward.
- The late-answer case waits one task after the late answers resolve;
  without it the case passed with the `then` guard broken.
- Focused speed, three interleaved warm runs at `--workers=2`, with proof
  records confirming the cases ran: the built-app spec at `e92db760b` (same
  spec as `37dc94fbd`, 2 cases) took 5.5, 4.5 and 3.1 s, median 4.5 s at
  load about 11. The mounted spec (3 cases) took 4.4, 3.0 and 2.9 s, median
  3.0 s at load about 10.6.
- The fold of `passTimeUntilChecked` is a pure inline with the same
  statements in order. Its 39 other callers reuse unchanged behavior;
  `navigation/story-reference-done-recovery` ran as the representative
  caller and CI covers the rest.

## Execution complete

Product advice: no change. The move delivered the three mounted cases and took
one more built-app consumer off the frontend group, with the focused median
falling from 4.5 s to 3.0 s. The next SEED-413 frontend families keep their
order. When the parent story takes the remaining Optimization Candidates
cases, its old-read cases answer the first read before offering a revision,
as slice 2 learned.

## Local gates

Apply [Dough MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
[Dough page objects](../../../.agents/skills/dough-page-objects/SKILL.md)
before test edits. Run the focused selections through
`npm run test:dashboard:frontend -- <selection>` with `NO_COLOR`,
`FORCE_COLOR` and `GIT_ALTERNATE_OBJECT_DIRECTORIES` unset. Also run
`npm run typecheck:dashboard` and `npm run lint`. On AC, run them under
`caffeinate -s -i` per
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Follow the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Keep default test timeouts.

## Plan review

Slice-plan refinement was not needed: two Structure slices, each one proof
loop within 15 active minutes, with all three cases observed in scratch. This
review found no remaining slice-specific concern.
