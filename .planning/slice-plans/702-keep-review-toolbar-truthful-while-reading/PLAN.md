# Keep the Review changes toolbar truthful while it reads

**Source:** [Keep the Review changes toolbar truthful while it reads](../../seeds/SEED-384-keep-review-changes-focused-on-the-diff.md#keep-review-toolbar-truthful-while-reading)
**Source review:** [source-review.md](./source-review.md)
**Identity:** SEED-384#keep-review-toolbar-truthful-while-reading


## Provenance and findings

Retrospective correction of
Keep Review changes focused on the diff
(SEED-384#keep-review-changes-focused-on-the-diff; story and plan 695 at
`a53f0d5dff97`), reviewed commits
`1b33fda6a`, `5911f9ae7`, `902b0139d`, `8d1132cb5`. That story's promises stand:
one toolbar naming the comparison shown, details collapsed on every opening
behind the eye, and full-size touch toggles with room to read the diff.

Findings at `8d1132cb5`, each a regression of those commits:

1. **Toolbar before the answer.** `dashboard/src/StoryReview.tsx` derives the
   toolbar name from `shownComparison`, which falls back to the workspace
   choice (`"all"`) while `review` is undefined. A completed story, published
   completion or ad hoc landing therefore reads “All changes” until its first
   answer, and keeps it when the read fails. In those states `ComparisonSwitch`,
   `RunChoice` and `ReviewContext` render nothing, yet the eye is offered and
   reveals an empty “Review details” group.
2. **Touch height.** `dashboard/src/story-review-touch.css` gives
   `.story-review-top` and `.story-review-details` each their own 30% height
   cap. Before the story the status area alone had that cap, kept so a short
   landscape view leaves room for the diff; with details revealed and a status
   shown the two now take up to 60%.
3. **Test layer.** `e2e/review/story-review-details-runs.spec.ts` (84 lines)
   pays for three real launches to check toolbar text, revealed state across a
   run choice and Refresh, and Escape from the picker, all frontend
   behaviour; it opens through the details step, so no test opens a two-run
   landed review as the reader first meets it. Choosing a run and reading its
   facts end to end stays covered by `e2e/review/story-review-one-shot-choice*.spec.ts`.

Outcome: the toolbar and eye stay truthful before and without an answer, the
touch layout keeps one height budget for what sits above the work area, and
the landed-run key examples are proved at the frontend layer.

The existing single-run picker and the wording used to identify a run are
outside this correction. Touch proof covers layout and control size. It
requires no separate journey for tapping the eye.

## Current decisions

- Let the review on screen supply the comparison name. An opening request alone
  supplies no name. A held Refresh can still show the previous comparison.
  A returned landing evidence gap can identify a selected run and offer its
  picker even though it has no files. A returned empty comparison can still
  have context. Derive the eye from the choices and facts the details actually
  contain, independently of the file count.
- Reuse the selection from `useStoryReviewSelection`, the existing comparison
  vocabulary and the details rendered by `StoryReview`. The review already
  owns the status, range heading and touch scroll area. Keep the header,
  toolbar and work area outside the shared height budget. This follows the
  [review contract](../../../dashboard/STORY-REVIEW-FILES.md#toolbar-and-review-details)
  and [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
  The correction needs no new read endpoint or stored preference.

## Preparation observations

At `07bf0c6ba`, the disposable frontend spec ran with `npm run --silent
test:dashboard:frontend -- story-review-preparation-probe.spec.ts --workers=2
--reporter=list` against the real Board and Side panel with substitute review
replies. The named E2E specs ran through `npm run --silent test:e2e`.
The scratch edits were reverted.

| Question | Operation and result |
| --- | --- |
| What does the first read actually show? | Hold `installFrontendStoryReview`'s first snapshot before clicking a Recently done card. The reading status appeared with “All changes” and one eye. Pressing it expanded an empty, zero-height group. Releasing the published answer showed “Published completion”. A held Refresh kept that name and eye, then a refused Refresh (JSON HTTP 500) reverted to “All changes” and one eye beside the problem. From a standalone ad hoc Done row a refused first read also offered that name and eye. A scratch change withheld both while unanswered, kept them on the held published Refresh, and allowed the session's retry to reveal its landed facts. |
| Which existing checks depend on the empty eye? | With the scratch change, `intent-done-landed-review-mode.spec.ts` waited for the eye before releasing the first live read, `story-review-trunk-worktree-ambiguity.spec.ts` tried to reveal an empty group after the ambiguity reply, and `story-review-details.spec.ts` expected a collapsed eye after the failed Refresh. All three passed again with the original product. The legacy landed-run gap in `story-review-one-shot-unavailable.spec.ts` still offered meaningful details and passed with the scratch change. |
| Can the touch proof distinguish the two layouts? | Use `hasTouch: true`, a 780 × 390 viewport, and `frontendReviewSnapshot` with two published commits kept in the baseline. Reveal details while its Git status and selected file are present. From the toolbar's bottom to the work area's top the two caps consumed 175.72 px. One cap on their common parent consumed 117 px. The status could scroll into view and the selected diff's 46 px code pane and added line were in view. At 844 × 390 the split panel used 198.91 px before and 117 px after. Its stacked code pane could be below the fold even at 46 px high, so use the covering layout for the visible-line assertion. All four existing phone/tablet touch cases passed with the shared cap. |
| Can the frontend own the two-run example? | Open the ordinary Done card directly with two capture choices, distinct launch times, revisions, paths and diff lines. The default reply selected the newer key. The existing run-reply map answered a nonnumeric older key after widening the substitute's numeric parameter to accept a string. The picker, revision, time and diff changed, the choice survived Refresh, and Escape returned focus to the eye. Forcing details open initially made the opening assertion receive **Hide review details**. Restoring the collapsed default made it pass. The separate real-launch keyboard journey in `story-review-one-shot-choice.spec.ts` passed with both captures and its legacy run. |

## Ordered slices

### 1. Mode-switch and ambiguity checks observe the review as opened
Type: Structure
Status: done

Structure: prepare the two incidental eye callers for slice 2. In the Done
Intent handoff, observe the pending live read before revealing anything.
Verify that the previous run's picker, facts and files are gone even from
the hidden content. Release the held reply, reveal its details, then check
the live diff and checked workspace comparison. In the ambiguous-worktree
journey, read the explanation directly. Keep the checks for absent
comparison controls and content, Refresh, and the refusal to read either
worktree. Keep the strict reveal helper for callers that need details.

Proof: run `intent-done-landed-review-mode.spec.ts` and
`story-review-trunk-worktree-ambiguity.spec.ts` against the current UI with
their respective frontend and E2E runners. Preserve the tests' actual HTTP
and UI observations, including the selected mode after the held read.

### 2. The toolbar reflects the review the developer can read
Type: Behavior
Status: done

Behavior: open a Done story or standalone ad hoc landing before the first
answer. Show progress with no comparison name or eye. On a failed read
that leaves no answer, show the problem and keep Refresh available. When the
answer arrives, show its comparison name and offer the eye for actual details.

Proof: drive the Done card and ad hoc row through the frontend Board. Hold
the first answer, observe progress and the absence of a comparison name and
accessible eye, then release a published or landed reply. Exercise a refused
read and successful retry. Hold Refresh of a readable comparison and verify
its name, details affordance and prior diff remain while Refresh reports
progress. Check the workspace's “All changes”, the session's “Session
commits”, a selected landed gap with run choices, and a bare explanation
without details. Preserve the all-files toggle's independent rule. Update
the failed-Refresh assertion at its call site. Keep the collapsed-eye
assertions for reads that still show their previous answer.

### 3. Touch details and status share room above the diff
Type: Behavior
Status: done

Behavior: when a touch user reveals details above a review with status, both
fit in one scrollable area bounded by the larger of 30% of the panel height
and the control size plus 1 rem. The status stays outside the collapsible
details and available when they close. The work area receives the remaining
height.

Proof: repeat the 780 × 390 observation above in the frontend suite. Measure
the visible space between toolbar and body against the panel-derived budget,
reach the status, and see the selected line inside a usable code pane. The
existing touch journey covers full-size toggles, independent scrolling,
rotation and reading position. Run it and the desktop panes and narrow
layout readers that share this markup.

### 4. The frontend proves how a two-run review opens
Type: Structure
Status: done

Structure: move the dedicated real-launch details journey to the frontend.
Reuse the Done board setup and click the card's **Review changes** action
directly. The existing `openFrontendStoryReviewAsOpened` opens a Taken card,
and `openFrontendDoneStoryReview` reveals details as part of setup. Use the
same run-keyed answer map for captured identifiers and session positions.

Proof: before pressing the eye, see **Landed runs**, the files toggle, the
newest run's file and first diff. Check the collapsed eye, hidden picker and
hidden run facts. Reveal the picker and verify both runs by their workflow,
time, target, base/revision and distinct diff. Choosing the older run and
refreshing keeps the selection and details revealed. Escape in the picker
collapses them, focuses the eye and leaves the older diff visible. Once that
journey passes, remove the redundant `story-review-details-runs.spec.ts`.
Keep `story-review-one-shot-choice*.spec.ts` for real capture, admission,
identity and Refresh reconciliation.

## Verification and delivery

- Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  and the [project test conventions](../../../AGENTS.md#test-automation).
  Select MakeMe and page objects for each changed spec. Keep synchronization
  tied to the held reply or observed UI.
- Local gates use `npm run --silent test:dashboard:frontend -- <specs>`,
  `npm run --silent test:e2e -- <specs>`, `npm run typecheck:dashboard`,
  post-change refactoring and staged lint. Run on AC under `caffeinate -s -i`.
  On battery, use `caffeinate -i` fully awake with the lid open and inspect
  the sleep log afterward, per [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- Run the frontend suite whole for the shared toolbar change, including the
  Intent and Sessions consumers. Run the affected E2E gap, ambiguity and
  no-changes journeys at that boundary. After moving the two-run proof, run
  `npm run --silent test:e2e -- e2e/review` for the remaining real-review
  journeys. Hosted CI owns its broader shards.
- Keep the shared review files within the project's 250-line check.
  `StoryReview.tsx` has 246 lines and `story-review-details.spec.ts` has 249
  at the observed revision. Put related details rendering with its availability
  decision and add focused sibling specs where needed.

## Slice review

Slice-plan refinement separated the two incidental reveal calls from the
toolbar change. The failed-Refresh expectation directly describes the
changed behavior and stays in slice 2. The touch geometry and the transfer
of two-run proof each have their own observation. Each slice is sized for
15 active minutes on the observed routes. No remaining slice-specific
concern was identified.
