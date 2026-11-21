# Choose what a story's review compares in Intent

**Identity:** SEED-420#choose-story-comparison-in-intent
**Source:** [Choose what a story's review compares in Intent](../../seeds/SEED-420-unified-intent-review.md#choose-story-comparison-in-intent)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

A developer reviewing a story in Intent chooses what is compared without
leaving it, with every choice the Side panel review offers a story. The seed
holds the full scope, exclusions and key examples. This plan carries them
without enlarging them.

**Excluded** (seed): the Sessions picker and a standalone session's runs,
including merged changes, proof for the chosen comparison, and a link that
carries the choice. **Review changes** on a card stays with
[plan 761](../761-route-review-changes-to-intent/PLAN.md).

**Assumption.** [Plan 759](../759-read-every-changed-file-in-intent/PLAN.md)
may land first or after. This plan names the story's file view by its role,
not by **Changed tests** or **Changes**, and its proof reads changed files
through the page object, so it holds either way. Whichever lands second
rebases onto the other's header and tree edits.

## Key examples and proof

| Example (seed) | Proof owner |
| --- | --- |
| **Commits**, the two oldest commits → only their files, diffs from the commit before, header names two commits and their ends | Slice 2 |
| Switching views keeps the range and file; selecting another story and returning opens on all changes | Slice 2 |
| Clearing **Include uncommitted changes** removes `landing.ts`; **Refresh** shows a new commit and keeps the check | Slice 3 |
| A Done story opens on its published completion; a captured landed run can be chosen; locations stay on the landed result | Slice 4 |
| CI comparison, Proof and Intent coverage say they describe the whole story while another comparison is chosen | Slice 5 |
| A chosen landed run that cannot be read explains itself, with Retry, and still offers **Published completion** | Slice 6 |

## Current decisions

- **One selection model.** Intent's lens reads the story through
  [`useStoryReviewSelection`](../../../dashboard/src/useStoryReviewSelection.ts)
  and [`useStoryReviewComparison`](../../../dashboard/src/useStoryReviewComparison.ts),
  the Side panel review's owners, through
  [`useStoryComparison`](../../../dashboard/src/useStoryComparison.ts). Do
  not add a second selection model. The choice controls reuse
  [`ComparisonSwitch`](../../../dashboard/src/StoryReviewComparison.tsx),
  [`RunChoice`](../../../dashboard/src/StoryReviewRunChoice.tsx),
  [`CommitList`](../../../dashboard/src/StoryReviewCommits.tsx) and the range
  wording of `CommitRangeHeading`.
- **Default and chosen stay apart.** The lens returns the story's default
  review (the selection's default answer) beside the chosen comparison.
  `publishedDoneEndpointOf`, `publishedDoneEndpointReasonOf`
  ([`IntentStorySummary.tsx`](../../../dashboard/src/IntentStorySummary.tsx)),
  [`useHistoricalIntentLocations`](../../../dashboard/src/useHistoricalIntentLocations.tsx)
  and Intent coverage keep reading the default. The overlay in
  [`IntentPage.tsx`](../../../dashboard/src/IntentPage.tsx), the diffs and
  [`ComparedRevisions`](../../../dashboard/src/IntentStoryComparison.tsx)
  read the chosen one.
- **Reset per story.** The selection state is keyed by the selected story's
  identity, so a newly selected story opens on its default comparison.
- **Header.** **Compare** is visible beside the compared-revisions line, as
  the seed's UI records. The header still has no collapsed control, so
  `storyHeaderDetail` in
  [`intentStoryPage.ts`](../../../dashboard/test-support/support/intentStoryPage.ts)
  stays true. The commit list, uncommitted check and run choice show only
  with the choice that needs them.
- Follow [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#spatial-presentation-remains-derived):
  the choice is presentation state and is not part of a link.
- File sizes, at `b281d3f52`: `IntentPerspective.tsx` 235,
  `IntentPage.tsx` 228, `useIntentStoryLens.ts` 160, `IntentHeader.tsx` 141,
  `IntentStoryComparison.tsx` 120. The Compare controls go in a new
  `IntentStoryCompare.tsx` and the default/chosen split stays in the lens,
  so `IntentPerspective.tsx` only passes the lens result on. If an edit
  would take it past 250, move `HistoricalStoryPage` into its own file in
  the same slice.

## Decisive premises observed

Observed in this preparation workspace at `b281d3f52`, after `npm ci`.

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Reading the default through `useStoryReviewSelection` leaves every story-scoped Intent behavior unchanged | Slice 1 | Scratch edit replacing `useDefaultStoryReview` with `useStoryReviewSelection` in `useStoryComparison.ts`, then `caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD=<file> node scripts/test-frontend.mjs` with the 13 `dashboard/frontend-tests/intent` specs `intent-ci-comparison-landed-fallback`, `intent-ci-comparison-taken`, `intent-done-landed-review-mode`, `intent-done-review-modes`, `intent-done-source-selection`, `intent-story-changes-gaps`, `intent-story-changes-only`, `intent-story-coverage`, `intent-story-summary-title`, `intent-story-review-return`, `intent-summary-story-comparison-fallback`, `intent-summary-story-comparison-gaps`, `intent-summary-story-comparison-file`; reverted | exit 0, 32 tests, strict status passed |
| The selection keeps the default answer apart from a chosen run's review | Slice 1's split | Read of `useStoryReviewSelection.ts`: `answer` and its `snapshot` and `published` come from the default read; `review` is the run read only when a run other than the answered one is chosen | The default stays readable while a run is chosen |
| CI's Done endpoint and a Done story's locations follow `comparison.review` | Slices 1, 4 and 5 | Read of `publishedDoneEndpointOf` and `useHistoricalIntentLocations`: both switch on `review.kind` `published` or `landed` | Fed the chosen review, a chosen landed run would move both. They must read the default |
| The header has no disclosure today, and a test holds that | Seed UI and slice 2 | Read of `IntentHeader.tsx` and `intent-page.css`: `.intent-story-detail` is always shown. `storyHeaderDetail` asserts no `button` with `expanded: false`; read by `intent-story-summary-title.spec.ts` and `e2e/intent/intent-story-changes-landed-run.spec.ts` | A visible Compare control keeps it true |
| Session choices are not a story's | Scope | Read of `dashboard/server/storyReviewSessionAdmission.ts`: `sessionComparisonKeys` come from a standalone session's record | Intent offers no session switch |
| Frontend proof can answer a range, a run and a historical snapshot | Slices 2 to 6 | Read of `dashboard/test-support/support/frontendStoryReview.ts`: `answerRange`, `holdNextRange`, `answerRunSnapshot`, `answerHistoricalSnapshot`, `holdNextSnapshot` | New cases need no new boundary |

No premise remains open.

## Slices

### 1. Intent's lens reads the story through the review's selection owners

Type: Structure
Status: done

Internal change: `useStoryComparison` reads through `useStoryReviewSelection`
and returns the default review beside a chosen comparison that, with no
choice made, equals it. The lens keys the selection by story identity. The
Done endpoint, historical locations and coverage read the default; the
overlay, diffs and header read the chosen comparison. No control yet.
External behavior is unchanged. Enables slice 2.

**Proof.** The 13 specs in the premise row stay green with the same
command, plus `npm run typecheck:dashboard`.

**Accepted.** The 13 specs (32 tests), all of `dashboard/frontend-tests/review`
(109, since `useStoryReviewSelection` gained `keyedBy` and returns the
default `answer`), and the retained CI follow-up Intent page's
`e2e/intent/intent-ci-follow-up{,-return,-proof}.spec.ts` (4) passed;
typecheck and lint clean. The lens result carries `review` (chosen) and
`defaultReview`; `useStoryComparison` does not yet pass the selection's
`onRun`/`onWorkspace` on, which slice 2 adds. No spec yet proves the reset
on another story; slice 2 owns it. The refactor pass folded
`useDefaultStoryReview` into `useStoryReviewSelection`, whose result names
the default `defaultReview`; the same proof reran green.
CI repair (run 44923917751, `e2e/intent/intent-story-becomes-done.spec.ts`):
the selection kept an automatic run when the story became Done, so its
unavailable read hid the published default. The selection is now keyed by
identity and Done state; the spec reproduced and now passes, with the 13
intent specs, the review folder and 19 done-related Intent e2e tests. G1
holds the remaining automatic-run retention.

### 2. Choosing a commit range changes the story's files, diffs and header

Type: Behavior
Status: done

Behavior: a Taken story with three commits and an uncommitted edit, read in
Intent → **Compare** → **Commits**, then the two oldest commits as the
range's ends → only the files those commits changed are listed with their
markers, a listed file's diff starts from the commit before the range, and
the header says two commits from the oldest to the second. A selected file
still in the range stays selected with its new diff. Switching to CI
comparison and back keeps the range and the file. Selecting another story
and returning opens on all changes.

**Proof.** New `dashboard/frontend-tests/intent/intent-story-compare-commits.spec.ts`
through `intentStoryPage.ts`, with a `compare()` part added there that alone
knows where the Compare controls live. Answers come from
`installFrontendStoryReview` (`answerSnapshot`, `answerRange`,
`answerFile`). Assert the asked range query names the chosen ends. The
premise row's specs stay green.

**Accepted.** `intent-story-compare-commits.spec.ts` passed with the 13
premise-row specs (33 tests), `dashboard/frontend-tests/review` (109) and
the landed-run and CI follow-up e2e specs (7). Range ends are keyed by
story in `useStoryReviewComparison`; `makeMe.aReviewCommit` is the shared
commit builder. `useStoryReviewSelection` gained `followsDefault`, on for
Intent, so an unchosen run follows each newer default (G1). Its observing
assertion moved to slice 4, whose Done story with captured runs is the
setup it needs; slice 2 used 14.7 of 15 minutes.
The refactor pass moved the keyed reset into `stateKeyedBy.ts`, gave the
range ends the selection's key, and added `makeMe.anUncommittedReviewItem`
for slice 3; the same proof reran green (33, 109, 8 e2e).

### 3. Leaving out uncommitted changes and refreshing the worktree

Type: Behavior
Status: done

Behavior: the same story on **All changes** → clearing **Include
uncommitted changes** removes `landing.ts`, which only the uncommitted edit
changed, and the header no longer says that uncommitted changes are
included. A new commit answered by the next snapshot appears after
**Refresh**, and the check stays cleared. A worktree without uncommitted
changes offers no check.

**Proof.** A case in `intent-story-compare-commits.spec.ts` or a sibling
`intent-story-compare-uncommitted.spec.ts`, with `answerNextSnapshot` for
the refreshed worktree.

**Accepted.** `intent-story-compare-uncommitted.spec.ts` uses
`dashboard/tests/landing.spec.ts` for the story's `landing.ts`, since
Intent's file view lists located files. The refactor pass moved the
include-uncommitted setting and its re-enable rule into
`useStoryReviewSelection` and shared `UncommittedCheck` with the Side
panel. The intent and review frontend specs (143) and the Side panel's
uncommitted e2e journeys (11) passed.
Plan 759 landed first: trunk `f79646813` is merged in, the header keeps
Compare without the removed outside-location action, and the Compare specs
use the **Changes** tab. On the merge, `dashboard/frontend-tests/intent`
and `review` (349) and the 32 e2e specs using the Intent page object or the
uncommitted check (46) passed.

### 4. A Done story chooses its published completion or a captured landed run

Type: Behavior
Status: done

Behavior: a Done story whose worktree is retired opens on **Published
completion**, naming the completion revision → **Landed runs** and a
captured run → that run's changes are listed and the header names its tree.
Its Intent locations and the CI comparison's Done endpoint stay on the
story's landed result. Choosing **Published completion** again returns to
it. G1: until a run is chosen, a newer default answer naming another
captured run moves Intent to that run.

**Proof.** A case beside `dashboard/frontend-tests/intent/intent-done-review-modes.spec.ts`,
with `answerHistoricalSnapshot` and `answerRunSnapshot`, asserting the
locations revision and the CI comparison's endpoint unchanged.

**Accepted.** `intent-story-compare-done.spec.ts` (2 tests) passed with the
whole `dashboard/frontend-tests/intent` folder (242) and the Done and
follow-up e2e specs (7). Compare reuses `ComparisonSwitch` and `RunChoice`;
the locations and landed endpoint already read `defaultReview`. The Node
`makeMe` gained the story-review builders.
The refactor pass gave the Side panel and Intent one switch rule
(`onChoose` in `useStoryReviewSelection`, `shownChoice`); intent and review
frontend folders (351) and 31 e2e specs using the switch, Done or follow-up
paths (57) passed.

### 5. CI views say when they describe the whole story

Type: Behavior
Status: done

Behavior: with a comparison other than the story's default chosen → CI
comparison, a file's Proof and Intent coverage each say that they describe
the whole story, still naming the build measured. With the default chosen,
none says so.

**Proof.** One case per view in a new
`dashboard/frontend-tests/intent/intent-story-compare-evidence.spec.ts`,
choosing a commit range as slice 2 does, and the default case.

**Accepted.** `intent-story-compare-evidence.spec.ts` (2 tests) shows the
note in all three views for a chosen range, none for the default, and for
a Done story's chosen landed run each note names the measured build. Intent
coverage named no build before, so the shared `WholeStoryNote` names it,
from `wholeStoryOf` over the default's landed endpoint. After the refactor
pass the intent folder (244) and 11 e2e Intent CI and Done specs (15)
passed.

### 6. A chosen comparison that cannot be read explains itself

Type: Behavior
Status: planned

Behavior: a chosen landed run answered `unavailable`, or a commit range
answered `unavailable` → Intent explains, where it explains the story's
comparison, that the chosen changes cannot be read, and offers the other
choices. A failed read of the chosen comparison offers Retry, which reads
it again. Neither reads as a story without changes. The default
comparison's no-workspace, several-worktrees and failed-read explanations
are unchanged.

**Proof.** Cases in `intent-story-compare-evidence.spec.ts` or a sibling
gaps spec, using `answerRunSnapshot` and `answerRange` with `unavailable`
answers and `holdNextRange` for a failed read.
`intent-story-changes-gaps.spec.ts` and
`intent-summary-story-comparison-gaps.spec.ts` stay green.

## Local gates and review

- On AC power, prefix test commands with `caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR`,
  as [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  describes. Frontend: `node scripts/test-frontend.mjs <specs>`. Then
  `npm run typecheck:dashboard` and `npm run lint`. Never run suites
  concurrently. Follow the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Apply [dough-makeme](../../../.agents/skills/dough-makeme/SKILL.md) and
  [dough-page-objects](../../../.agents/skills/dough-page-objects/SKILL.md)
  to every changed test.
- Refinement not needed. Six slices, one Structure before the Behavior it
  enables and five behaviors each with one example family and its own proof
  loop. They share one rule: the chosen comparison feeds the file view and
  header, the default feeds evidence. This review found no slice-specific
  concern. Slice 2 is the widest, adding the Compare part and the commit
  list together; if it overruns, split the view-switch and reselection
  examples into their own slice.

## Story obligations

### G1. Intent keeps an earlier automatic run over a newer default (first reported in slice 1)
Reported: slice 1 — "If a later answer for the same read (same story and Done state) names a different selectedRun while the old run is still listed, Intent keeps the old one. Before slice 1 it always followed the newer default."
Story clause: "Intent offers the choices the Side panel review offers a story, with their present defaults and availability"
Disposition: proved by slice 4: dashboard/frontend-tests/intent/intent-story-compare-done.spec.ts, "a newer default run moves an unchosen run but not a chosen one while the old run is still listed" (fails when `explicit` is ignored)
