# Diagnose reveal in the unified story tree

Slice 1 reached 15.9 active minutes and is paused before acceptance. The owned
product and test edits remain in the execution checkout at `be88ccf45242`;
none are staged. The working plan records the execution identity and the
unrelated trunk amendment to the sleep guard.

The corrected mounted batch passed 10/10, backend overlay passed 7/7, and the
static dashboard typecheck passed. The real-Git Chromium batch passed 11/15
with one worker on the macOS execution host on AC power. Candidate, literal
commands, results, and failure artifacts are in the checkout's Git evidence
directory, in `s1-return.md` and `s1-final-gates.log.run.json`. The geometry
failure is observed on the candidate. Other worktrees share this host; no
separate CI attempt exists for this unpublished result.

The larger comparison's Next click selects the intended file, scrolls the files
pane and keeps keyboard focus, then fails the fully-visible-row assertion in
`e2e/review/story-review-file-moves.spec.ts`. Nested moves passed. The Playwright
trace does not retain the numeric geometry. The leading hypothesis is that
`revealRow`'s fractional scroll delta rounds inward for the new list layout.
A competing explanation is a follow-up layout or scroll anchoring move.

Round 1 experiment. Run the single large-comparison test once, collecting
the DOM pane client bounds, row bounds and scroll offsets around the failed
visibility check. Compare the expected movement with the resulting delta and
keep the independent requirements for focus and unmoved page scroll. Use the
existing test path with a temporary instrumentation edit, and remove only the
instrumentation after securing the evidence. If the failure does not reproduce,
capture before and after values and make a different targeted observation.
Three other failed tests have known selector or fixture-count causes listed in
`s1-return.md`. Their separate repairs remain owed.

## Parked paths

 D dashboard/src/IntentOutsideGroup.tsx
 M .planning/slice-plans/838-browse-one-selectable-review-tree/PLAN.md
 M dashboard/backend-tests/intent/intent-story-overlay.spec.ts
 M dashboard/frontend-tests/intent/intent-scope-tree-page.ts
 M dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts
 M dashboard/frontend-tests/intent/intent-story-changes-gaps.spec.ts
 M dashboard/frontend-tests/intent/intent-story-changes-no-locations.spec.ts
 M dashboard/frontend-tests/intent/intent-story-changes-only.spec.ts
 M dashboard/frontend-tests/intent/intent-story-ci-cues.spec.ts
 M dashboard/frontend-tests/intent/intent-story-compare-done.spec.ts
 M dashboard/frontend-tests/intent/intent-story-compare-fixed.spec.ts
 M dashboard/frontend-tests/intent/intent-story-compare-gaps.spec.ts
 M dashboard/frontend-tests/intent/intent-story-compare-page.ts
 M dashboard/frontend-tests/intent/intent-story-file-notes.spec.ts
 M dashboard/frontend-tests/intent/intent-story-notes.spec.ts
 M dashboard/frontend-tests/intent/intent-story-outside-locations.spec.ts
 M dashboard/frontend-tests/intent/intent-story-outside-proof.spec.ts
 M dashboard/src/IntentBrowser.tsx
 M dashboard/src/IntentLocationHeader.tsx
 M dashboard/src/IntentSelectionReading.tsx
 M dashboard/src/IntentTreeGroups.tsx
 M dashboard/src/StoryReviewFileTree.tsx
 M dashboard/src/change-kinds.css
 M dashboard/src/intent-browser.css
 M dashboard/src/intentStoryOverlay.ts
 M dashboard/src/reviewFileTree.ts
 M dashboard/src/story-review-files.css
 M dashboard/src/useIntentStoryTree.ts
 M dashboard/test-support/intentPerspectivePage.ts
 M dashboard/test-support/intentReviewFiles.ts
 M dashboard/test-support/support/intentStoryPage.ts
 M dashboard/test-support/support/reviewTreeRows.ts
 M e2e/intent/intent-story-changes-moves.spec.ts
 M e2e/intent/intent-story-changes.spec.ts
 M e2e/intent/intent-story-completed-source.spec.ts
 M e2e/intent/intent-story-follow-up.spec.ts
 M e2e/review/story-review-file-moves.spec.ts
 M e2e/review/story-review-tree-collapse.spec.ts
 M e2e/review/story-review-tree.spec.ts
?? .planning/slice-plans/838-browse-one-selectable-review-tree/diagnosis-story-tree-reveal.md
?? dashboard/frontend-tests/intent/intent-story-tree.spec.ts
?? dashboard/src/IntentStoryFileTree.tsx

## Round 1 result

The one instrumented retry reproduced the original fully-visible-row assertion
failure after the correct file, its diff, the increased pane scroll position,
and Next focus were observed. Local Chromium used one worker and a device pixel
ratio of 1 on macOS with AC power. At start, the host reported a one-minute load
average of 25.19 and 66% memory free. Other platform and device scale variants
were outside this round. The case failed on both candidate runs and has no
published CI attempt.

The internal files pane had a client bottom of 719.578125px and the selected
row initially ended at 2501.828125px. The shared `revealRow` requested an
increment of 1782.25px. Chromium moved by 1782px and left the row ending at
719.828125px, 0.25px below the client bottom. Exactly those bounds and the same
pane `scrollTop` remained after the visibility assertion's poll, and page
`scrollY` stayed at zero. This confirms inward fractional rounding and rules
out a later layout or anchoring shift in the reproduced failure.

The helper's arithmetic is unchanged from the base. The unified tree layout
exposed the latent rounding assumption in this existing reveal consumer. A
separate base test run was outside the one-attempt round. Round 1 used 1.7
active minutes at evidence collection. The passing nested case and the three
independent browser failures remain documented in `s1-return.md`.

The checkout's Git evidence directory holds `reveal-round1.log` with requested
and actual positions, `reveal-round1.log.run.json` with the literal command and
exit status, and `reveal-round1.trace.zip` and `reveal-round1-error-context.md`
with browser evidence. Temporary measurement in `reviewPanes.ts` and
`story-review-file-moves.spec.ts` was removed after preserving the instrumented
copies in the same evidence directory. Both sources match their exact pre-round
contents.

Round the existing reveal increments outward with `Math.floor(above)` and
`Math.ceil(below)`. The stable snapshot shows that a 1783px move would place
the row within the pane with room to spare and would preserve its page position.
Use the existing strict visibility, focus, and page-scroll assertions in the
real-Git story browser, with the shared review browser consumer included for
the helper change. The completed round makes no production or permanent test
edit.

## Repair confirmation

The restarted Slice 1 uses the confirmed outward rounding repair. One repeat
of the four previously failing specs will test this prediction: Next brings
the entire below-fold row into the pane while its focus and page position stay
unchanged. The same batch checks independent test adaptations that target the
exact former folder path and the marked configured root, and enumerate all
three changed files on Board re-entry while still opening the outside file.
Stop after one attempt. If the same required assertion fails, examine the
observed state before another run.

Use one local Chromium worker on the Mac on AC power. At repair entry, it
reported 15.79 one-minute load average. Sequence this batch ahead of the
published-session and shared repository tree consumer checks. Reconsider
concurrency on evidence of contention, setup failure or a missing artifact.

The four-spec browser batch passed all six cases. The original large case's
strict full-pane visibility, unchanged page position, selected diff, and
keyboard focus assertions passed without a tolerance or a new test path.
The other three failures' shared folder and inventory assertions passed.
See `s1-repair-failed-specs.log.run.json` and the trace retained from Round 1
for the before/after proof.

Companion browser check. Run one single-worker batch on the same Mac to
verify the shared rounded reveal in published-session touch review and that
existing count, row-order, offline, landing and retained-pair consumers can
read the unified Intent tree. The hypothesis is that projection of the
already admitted comparison and scroll rounding preserve each of these
readers' selection and reading, with independent regressions possible at
both boundaries. Stop after one batch and inspect a failure's own proof
before any further attempt.

The companion browser batch passed all 27 cases. The published-session
browser moved by touch and retained selection across its controls. The real
Git cases also observed the repopulated tree and diff after offline recovery,
retained runs, different revisions, filters, and reopening from the Board.
See `s1-repair-companion-e2e.log.run.json`.

One mounted batch rechecks the affected reveal, layout, root cues and folder
selection, alongside the Project Intent candidate return and shared Snapshot
entry. The expected discriminating outcomes are a keyboard-selected empty
configured root's Summary, expanded directed paths with the correct reading,
and preserved independent project location and disclosure controls. Run once
on the same local host after the single-worker browser batch; investigate any
failure at the boundary that observed it before retrying.

The mounted batch passed 36 cases and failed only the new empty-root test.
Its recorded accessibility tree still showed the other test's default
`dashboard/tests` and `tests` configuration. The fixture had declared two
different location answers for the same published revision, while `answerMemo`
correctly caches fixed answers by project and revision. Vary the starting
revision together with the new answer and wait for that folder to be visible
before choosing it. Run its two-case spec once in order to check that the
published fixture cache and the empty folder selection now agree. Preserve the
failed DOM trace and original report in `s1-repair-mounted.log`.

The focused independent-revision mounted spec passed both cases. The new
empty configured root stayed collapsed while keyboard selection opened its
0-file Summary. No product change was needed to repair the fixture. See
`s1-repair-empty-root.log.run.json`.
