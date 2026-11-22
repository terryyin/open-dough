# Prove Intent's Compare on the mounted Intent view

**Identity:** SEED-420#test-compare-on-mounted-intent
**Source:** [Prove Intent's Compare on the mounted Intent view](../../seeds/SEED-420-unified-intent-review.md#test-compare-on-mounted-intent)
**Source review:** [source-review.md](source-review.md)

## Correction source and findings

This corrects SEED-420#choose-story-comparison-in-intent (plan 760, which can be
recovered at
`beb2e240:.planning/slice-plans/760-choose-story-comparison-in-intent/PLAN.md`).
Its implementation ran from `29cd279ec` to `97eecc17a` and landed at `c64549aac`.
Terry reviewed it on 22 November 2026 and found that it broke the
[Architectural North Star](../../NORTH-STAR.md):

- **Playwright in unit tests.** All five new specs import `test` from
  `dashboard/test-support/support/frontendApp.ts`. They serve the built app,
  answer reads with `page.route`, and use `test.step`. The North Star reserves
  Playwright for `e2e/`. Each spec has to become a plain Vitest Browser Mode
  case that mounts the owning production component with typed inputs. The
  five specs are `dashboard/frontend-tests/intent/intent-story-compare-{commits,uncommitted,done,evidence,gaps}.spec.ts`,
  with 10 cases between them.
- **New wrappers in Dashboard Test Support.** Test support may only shrink,
  except for MakeMe builders, but the story added these:
  - `failNextRange` and `failNextRunSnapshot` in
    `dashboard/test-support/support/frontendStoryReview.ts`;
  - `failNextReviewRead` in `frontendStoryReviewRoutes.ts`;
  - in `dashboard/test-support/support/intentStoryPage.ts`: `storyCompare`
    and the `compare`, `panel` and `wholeStoryNote` members of
    `intentStory`, `header.alert`, and the `storyTabPanel` re-export.
- **Builders only in the Node MakeMe entry.** `aReviewCommit` and
  `anUncommittedReviewItem` (`Distribution/tests/support/reviewCommitTestData.mjs`)
  were added only to the Node `makeMe.mjs`. Browser-mode cases load
  `pageMakeMe.mjs`.
- **The follow-up repeats the pattern.** Plan 761 slice 1 calls for proof with
  `holdNextRange` and `holdNextSnapshot`, which are the same Playwright
  wrappers.

Baseline: at `404354c56` on 22 November 2026, under load about 12, the 10
Playwright cases took 20.8 s summed (`OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD`).
The longest was 3.9 s and the shortest 1.2 s.

## Preserved promises

Every behavior the 10 cases observe stays proved and keeps the same
distinguishing observation. Case titles may stay as they are. No product
behavior changes.

## Decisions

- Follow the
  [frontend guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses),
  [`dough-makeme`](../../../.agents/skills/dough-makeme/SKILL.md) and the
  [test boundary rule](../../../.claude/skills/dough-post-change-refactor/references/refactor-checks.md#choose-the-test-boundary).
  Specs import `expect` and `test` from `vitest` and `page` and `userEvent`
  from `vitest/browser`. They do not use `@playwright/test`, `page.route`,
  `test.step`, React `act`, or any module under `dashboard/test-support/`
  except `component-mount/` and `pageReadsSupplying`.
- **Entry.** Mount production `IntentPerspective` through the typed page
  entry (`PageReadsOnPage` with `pageReadsSupplying({ review, intent, ci })`).
  The review answers are a typed `ReviewSource`, built with page MakeMe, and
  each case owns its answers in plain closures. To hold or fail a read, the
  case returns a pending or rejected promise from its own `ReviewSource`
  function. No wrapper does this.
- **Shared mount.** Extend the existing colocated
  `dashboard/frontend-tests/intent/intent-ci-perspective-mount.ts` for these
  cases. It should accept a review source and let the case select a story,
  which also covers selecting another story and coming back. Do not add a
  second copy of the composition. Plan 764 slice 2 replaces this mount with
  the production page frame (`BoardOrIntent`), so these specs are among its
  consumers.
- **Page object.** Put one small Vitest page object for the story's Compare,
  header and views beside the specs, as
  `dashboard/frontend-tests/intent/intent-story-compare-page.ts`. It locates by
  role and replaces `storyCompare` and the related `intentStory` members.
- **Done records.** A Done story's Intent reads its done record through
  `authenticatedDoneRead.ts`, which uses a global `fetch` outside the typed
  entry. When a Done case reaches that read, move the done-record read behind
  `PageReads`, as plan 764 slice 1 does for story notes, so the case supplies
  it. No case makes a global `fetch` or opens a `WebSocket`.
- **Data.** Load `aReviewCommit` and `anUncommittedReviewItem` from
  `pageMakeMe.mjs`. Add domain-named builder steps for setup that repeats.
  Do not hand-write review records, and do not run production transforms
  such as `storyComparisonShown` to make inputs.
- **Speed.** Each case acts as soon as the page allows. It waits only through
  retrying assertions (`expect.element`, `expect.poll`) and has no sleep or
  settle wait.

## Local gate

On macOS, run from an awake machine on AC power using `caffeinate -s -i`
under the
[sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Use two workers, the default test timeouts, focused path selection
(`npm run test:dashboard:frontend -- <paths>`), and the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run `npm run typecheck:dashboard` whenever production code or types change.
Before landing, run the full `dashboard-frontend` group, because slice 4
removes shared test support.

| Promise | Owning proof |
| --- | --- |
| A Taken story's commit range and uncommitted check are proved on the Vitest mount. | Slice 1 |
| A Done story's record is read through the typed page entry; no Done reader fetches it on its own. | Slice 2 |
| A Done story's published completion and landed runs, and the gaps for an unreadable or failed choice, are proved on the Vitest mount without an outside call. | Slice 3 |
| The whole-story notes in the CI views are proved on the Vitest mount; Dashboard Test Support loses the story's additions; the cases run faster. | Slice 4 |

## Slices

### 1. A Taken story's commit range and uncommitted check on the mounted Intent view

Type: Structure
Status: done
Move `intent-story-compare-commits.spec.ts` (1 case) and
`intent-story-compare-uncommitted.spec.ts` (1 case) to Vitest Browser Mode.
Add the review source and story selection to the shared perspective mount,
create `intent-story-compare-page.ts`, and load the review-commit builders
from `pageMakeMe.mjs`.
Proof: both specs pass on the Vitest runner at `--workers=2`, with every
observation from the Playwright version: files and diffs follow the range,
the header names the range, the choice survives a view switch, selecting
another story and coming back opens on All changes, the uncommitted check
appears and clears, and Refresh keeps the choice. Neither spec imports
`@playwright/test` or anything from `dashboard/test-support/support/`.
Accepted (22 November 2026, `9012e94fe` plus this slice, load about 12–14,
`--workers=2`): both cases pass on Vitest. The commits case ran in 2.54 s
(3.9 s on Playwright) and the uncommitted case in 1.87 s (2.1 s). The mount's
existing consumers (`intent-ci-status-{homepage,kept,side-panel}`) and
`review/` pass, 24 files and 107 tests. `npm run typecheck:dashboard` passes.
Every observation from the Playwright cases has its assertion in
`intent-story-compare-{commits,uncommitted}.spec.ts`. Evidence is in the
worktree's `open-dough/evidence/s1-report.md`. The refactor pass covers this
slice together with slice 4, which removes the support these cases replaced.

### 2. Done records are read through the typed page entry

Type: Structure
Status: done
Refined on 22 November 2026, after 2.3 active minutes. The first attempt at
the former slice 2 found that a Done story selected in the mounted Intent view
reads its done record through `useDoneDetails` (`dashboard/src/doneDetails.ts`
→ `readDoneRecordBodiesAt` in `authenticatedDoneRead.ts`). That read uses the
global `fetch`, outside `PageReads`. The attempt changed nothing; its evidence
is `s2-report.md` and the consumer traces in the worktree's evidence location.

Move the read into the typed page entry:
- `doneDetails.ts` reads a new required `done` member of `PageReads`.
- `authenticatedPageReads.done` uses `readDoneRecordBodiesAt`.
- `unreadPageReads.ts` gets a rejecting default for it.

The `useDoneDetails` consumers read through the entry:
`doneStoryFollowUp.ts`, `FollowUpSourceReference.tsx`,
`recentlyDoneView.ts`, `StoryCardDependencies.tsx` and
`useIntentStoryLens.ts`. Four tests replace `authenticatedDoneRead.ts` with
`vi.mock`: `navigation/accessible-board-touch.spec.ts`, `board-height.spec.ts`,
`story-card-selection.spec.ts` and `board-work.ts`. They switch to supplying
typed done reads through their board mount.
Proof: `npm run typecheck:dashboard` passes, and no frontend test mocks
`authenticatedDoneRead.ts`. These pass at `--workers=2`:
- the board-mount and board-frame-mount consumers;
- `recently-done-*`;
- the Vitest specs that mount `PageReadsOnPage`.

Two representative E2E journeys that read Done records also pass: Recently
done, and a Done story in Intent.
Accepted (22 November 2026, on top of `1240413`):
- `PageReads.done` (`dashboard/src/doneRecordReadSource.ts`) supplies
  `useDoneDetails`. The board mounts take typed done reads, and no frontend
  test mocks `authenticatedDoneRead.ts`.
- `npm run typecheck:dashboard` passes.
- 81 selected frontend paths pass: 51 Vitest files with 114 tests, and the
  Playwright `recently-done-*` specs (69 cases, proof record strict pass).
- Two E2E journeys pass: `sessions/recently-done-published-sessions` and
  `intent/intent-done-completion-provenance`.

Evidence is in `s2b-report.md` in the worktree's evidence location.

### 3. A Done story's choices and a chosen comparison's gaps on the mounted Intent view

Type: Structure
Status: done
Move `intent-story-compare-done.spec.ts` (2 cases) and
`intent-story-compare-gaps.spec.ts` (4 cases). Failed and held reads are the
cases' own `ReviewSource` answers, and the Done cases supply their done
record through slice 2's `done` page read.
Proof: the 6 cases pass on Vitest at `--workers=2` with their observations
intact:
- the locations and the CI landed endpoint stay at the completion;
- a later default answer moves an unchosen run but not a chosen one;
- an unreadable choice is explained in the header and never reads as a
  story without changes;
- Retry reads the range or run again.

Recording `fetch` and `WebSocket` shows no call outside the typed reads. Run
`npm run typecheck:dashboard`.

Accepted (22 November 2026, on top of `0b12cc4`, load about 7):
- All 6 cases pass on Vitest at `--workers=2`, beside slice 1's cases and the
  mount's `intent-ci-status-*` consumers: 24 selected, all passing
  (`s3-proof-2.json`). `npm run typecheck:dashboard` passes.
- Case times: done 1.73 s and 0.64 s; gaps 1.59 s, 0.63 s, 1.47 s and
  0.60 s.
- The Done cases still make two outside reads that plan 764 moves behind the
  typed entry: story notes (764 slice 1) and the CI Done wall-time history
  glance (764 slice 4). Each Done case asserts that its outside calls are
  exactly those two kinds (`outsideKinds`/`doneOutsideKinds` in
  `intent-story-compare-page.ts`), so plan 764 turns that check into `[]`.

Evidence is in `s3-report.md`.

### 4. Whole-story notes on the mounted view, and Test Support cleanup

Type: Structure
Status: planned
Move `intent-story-compare-evidence.spec.ts` (2 cases). Remove what the story
added to Dashboard Test Support once nothing uses it:
- `failNextRange`, `failNextRunSnapshot` and `failNextReviewRead`;
- `storyCompare` and the `compare`, `panel` and `wholeStoryNote` members of
  `intentStory`;
- `header.alert` and the `storyTabPanel` re-export.

Remove the Node `makeMe.mjs` registration of the review-commit builders if no
Node consumer remains. Rewrite plan 761 slice 1's proof onto this mount, with
the case's own pending `ReviewSource` answers in place of `holdNextRange` and
`holdNextSnapshot`. Add these specs to plan 764 slice 2's list of mount
consumers.
Proof: both cases pass on Vitest. `rg` finds no use of the removed names.
Run the 10-case cohort with `--workers=2` and record its summed time against
the 20.8 s baseline, noting the load. The full `dashboard-frontend` group
passes.
