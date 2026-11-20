# Keep a selected case's source through the Show latest file read in mounted cases

**Identity:** SEED-413#show-latest-source-file-read-cases
**Source:** [Keep a selected case's source through the Show latest file read in mounted cases](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#show-latest-source-file-read-cases)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Replace the built-app
[`intent-source-target-recovery.spec.ts`](../../../dashboard/frontend-tests/intent/intent-source-target-recovery.spec.ts)
with two plain Vitest cases on mounted Chromium. The new revision's file
read is held then released in one case and fails then is retried in the
other. Follow the
[Project Intent revision family](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#project-intent-revision-family-example)
and [Which entry a case uses](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses).
Mount the real `ProjectIntentReading`
with typed locations, file and Optimization Candidates record replies, and
offer the new revision by rerendering with the new published work.

Exclusions: the two Optimization Candidates revision cases, every other
family, the full-group timing comparison and the `frontendApp.ts` retirement
all stay with
`SEED-413#renovate-later-dashboard-frontend-unit-test-families`.

## Key examples and proof

| Example | Observable signal |
| --- | --- |
| Held then released | Before release, the browser is at the new revision. The source reads `at revision <before>` with `assert True`, line 44 is the in-view current location, the reading offset and focus are kept, and no failure shows. After release, the source shows `assert 2 == 2` at the new revision with line, offset and focus kept. |
| Failed then retried | The Purpose region reads `<path> could not be read at revision <after>; showing <before>. Retry`. The old text, line, offset and focus are kept. **Retry** shows the new text at the new revision, and the failure is gone. |
| Read order at the new revision | The typed replies record locations first, then the record and the file in either order. Retry adds exactly one file read. |

## Current decisions

- **Optimization Candidates record seam.** `IntentCandidatesRecord` calls
  `readIntentCandidatesAt` directly, so a mounted case cannot supply the
  record. Add `readCandidates` to `IntentReadSource`
  (`dashboard/src/intentReadSource.ts`), with `readIntentCandidatesAt` as the
  page default, and read through it in `IntentCandidatesRecord`. Include the
  reader in that effect's dependencies. The page keeps its memo, which lives
  inside the default.
- **Chosen view.** Opening a case's source switches Project Intent's chosen
  view through `ModeChoice.onModeChange`. The case keeps that view in state
  owned by a component defined once at module level. Rerendering with an
  inline component remounts it and loses the open source, as the premise
  observation found.
- **Data.** Build the record with `aTestOptimizationCandidatesRecord` exposed on
  `pageMakeMe.mjs` (`testOptimizationCandidatesTestData.mjs` loads in the
  browser). Build locations with `makeMe.anIntentLocation`. The clip source
  text stays in the spec. Do not import
  `intentCandidatesOtherProjectFixtures.ts`, which pulls in Playwright-era
  publishing.
- **Page objects.** Extend the existing page objects beside the specs
  (`intent-browser-page.ts`, `intent-file-reading-page.ts`,
  `intent-revision-notice-page.ts`) or add one for the Optimization
  Candidates entry. Add nothing to `dashboard/test-support/` except the
  pageMakeMe builder.
- **Steady-pace check.** Drop the built-app case's
  `expectSteadyPace(passTimeUntilCheckedWhileReadsOutstanding)` step. The
  revision-check schedule (`dashboard/src/publishedObservation.ts` and its
  imports) reads no Intent state. Its steady pace with its own read
  outstanding is proven by
  [`e2e/observation/auto-refresh.spec.ts`](../../../e2e/observation/auto-refresh.spec.ts)
  ("main moving again while B's backlog is read…") and the other auto-refresh
  E2E specs. The mounted held case keeps the pinned-answer assertion: the
  source stays at `before` until release.
- **Test-support retirement.** No `dashboard/test-support/` module has this
  spec as its last consumer at `0be467145`, so nothing retires. Each module it
  imports has another consumer. Recheck after slice 2 removes the spec.

## Decisive premises

| Consuming operation | Observation |
| --- | --- |
| A mounted `ProjectIntentReading` in Optimization Candidates shows the record from a typed reply, and choosing the entry's source opens it at line 44 in view | Scratch at `0be467145` in this workspace, now reverted: the seam above plus a mounted spec under `dashboard/frontend-tests/intent/`. Ran `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:frontend -- intent/zz-scratch-candidates-source`. The record rendered, and `.source-line.is-target` had `data-line` 44 with `aria-current="location"` in the viewport. Passed in 268 ms. |
| Show latest with a failed file read keeps the old source and Retry loads the new one in the mounted form | Same scratch and command, extended. The case rerendered with work at `cdcd…` and clicked Show latest. The first `readFile` at that revision rejected with a transient `ReadProblem`. Purpose read `tests/test_clip_core.py could not be read at revision cdcdcdc; showing abababa. Retry`, and the source kept `assert True`. Retry showed `assert 2 == 2` with line 44 still targeted. Passed in 769 ms. |
| The held-then-released variant | Uses the same rerender and Show latest path, with a deferred reply in place of the rejection, as the revision family's pending-read cases already do. Slice 2 settles it in the case itself. |

## Ordered slices

### 1. The failed Show latest file read is proven on the mounted reading

Type: Structure
Status: done

This removes the built-app mount, held HTTP reads and page-clock driving from
the failed-read proof. Add the `readCandidates` seam, the pageMakeMe record
builder and the page-object extensions. Write the failed-then-retried case in
a new mounted spec under `dashboard/frontend-tests/intent/`. Narrow the
built-app spec to its held-then-released outcome.

| Promise | Slice 1 proof |
| --- | --- |
| The failed-read example holds | The new mounted case passes and asserts every signal in the failed-then-retried row. |
| The case discriminates | A scratch edit makes `IntentCandidatesRecord` or the source reading ignore the failure and show the new revision's text at once. The case fails, then passes once the edit is reverted. |
| Production reads unchanged | The remaining built-app source-target case and `intent/intent-test-optimization-candidates` still pass. They read the record through the page default. |

Accepted proof and learnings:

- `intent-source-target-recovery-mounted.spec.ts` ("…failed then retried")
  mounts through `mountIntentReading(readSource, before, "candidates")` in
  `intent-revision-fixtures.ts`, which now owns the module-level chosen view;
  slice 2's held case reuses it. Discrimination: a scratch immediate retry in
  `useIntentFileRead.ts` failed the case at `failsWith`, then passed once
  reverted. The narrowed built-app spec, `intent/intent-test-optimization-candidates*`,
  the revision specs and typecheck passed.
- After Show latest, focus rests on the file's button, not the previously
  focused source element; the case asserts it there as the built-app spec did.

### 2. The held Show latest file read is proven on the mounted reading, and the built-app spec is gone

Type: Structure
Status: done

Add the held-then-released case with its deferred reply, and assert the read
order in both cases. Delete `intent-source-target-recovery.spec.ts`. Update
references to it, including the comment in
`intent-revision-update-failures.spec.ts`, and recheck
test-support consumers.

| Promise | Slice 2 proof |
| --- | --- |
| Held example and read order hold | Both mounted cases pass with every signal in their rows. |
| Spec removed with no orphan | `grep -rn intent-source-target-recovery dashboard e2e .planning` lists only planning history. No `dashboard/test-support/` module is left without a consumer. |
| Focused speed | Run `npm run test:dashboard:frontend -- intent/intent-source-target-recovery --workers=2` at `0be467145`, and the new spec's selection after the change. Interleave three warm runs each and record median command time and load. |

Accepted proof and learnings:

- Both cases in `intent-source-target-recovery-mounted.spec.ts` pass; the
  held case failed when its scratch edit stopped awaiting the deferred reply.
  The built-app spec is deleted and no `dashboard/test-support/` module lost
  its last consumer.
- Focused speed, `--workers=2`, three interleaved warm runs at load 11–12:
  median 5.51 s for the built-app spec at `0be467145`, 4.71 s for the mounted
  spec after.
- File reads are cached per repository, revision and path
  (`dashboard/src/fileContentCache.ts`), so each case offers its own new
  revision.

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

Slice-plan refinement was not needed: two Structure slices, each one proof loop
within 15 active minutes, with the seam observed in scratch. This review found no
remaining slice-specific concern.
