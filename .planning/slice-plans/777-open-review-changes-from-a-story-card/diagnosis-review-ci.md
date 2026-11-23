# Diagnose the review CI failures

The first card-route and first-file publications, `af73329d` and
`d31aee723`, have owned failures in runs 45108969606 and 45111917098,
attempt 1. The records-only completion revision `471eaed79` uses the
latter as its CI basis. Both attempts completed. The installed
diagnostics and full failed-job logs are in the execution Git evidence.
The failed frontend jobs list all nine failures in the raw Vitest logs,
including names the installed inventory could not extract.

Round 1 has two reproductions to distinguish. First, open the shared
width/read fixture through its legacy Story card and observe the absent
Side panel review. Preserve the actual session entry, width,
file/line reading, close, storage, and Board observations in the fix.
Second, read the captured Playwright traces for the four exact E2E
comparison timeouts and the held file-read assertion. Determine whether
the input reached the correct control, whether the default review
request occurred, and which endpoint the held request matched.
Use one focused pre-fix replay for each distinct mechanism where the
remote trace does not settle it, then one focused run per changed
boundary. Avoid broad repetitions or widening deadlines without proof.

The execution checkout was clean at `471eaed79` when the diagnostics
started. No implementation or refactor agent was writing. The stash
receipt is retained in the coordinator's resume context.

## Round 1 result

The coordinator paused diagnosis after 2.2 active minutes. The single
local width reproduction, `review-ci-width-red.log.run.json`, matched
the failed heading and absent panel in both frontend attempts. All nine
failures in the five frontend files use the same width fixture. It
pressed a Story card and waited for the removed Story review panel.

All four one-shot input snapshots in the shard 5 artifact for run
45111917098 show the resolved Review changes button inside the disabled
startup fieldset on Story A. The keyboard press completed without
activation, Development remained selected, and no review read followed
in the remaining 22 to 55 seconds. The affected opening helper needs
the enabled control before capturing the response and pressing Enter.

The commit refresh trace shows that the unfiltered hold took the
refreshed All changes read for `first.txt` (base `f11c1fcb`, tree
`2119d7ee`). The chosen commit's diff for `second.txt` (base
`d8a50bec`, same tree) reached the browser normally, so its loading
status had already cleared. Hold the requested file path and check
its exact diff content before observing loading and Refresh.

## Fix verification

Use one local frontend batch of the five failing specs to confirm the
retained ad hoc Done entry exercises the same width and Board assertions.
Then run the four implicated E2E spec files, including all failed cases,
with existing deadlines. Use one worker initially on the AC-powered Mac
to avoid competing with the native captures. Stop after the first batch
per boundary and investigate any different signature before a repeat.

The first frontend and E2E batches exited zero. The local E2E quiet reporter
prints nothing on success. One final focused batch retains the runner's
structured counts for the four failure files and exercises the existing
done-card details hold to verify that waiting for the button still permits an
opening while unrelated story details are pending. The other hold paths
retain the prior route behavior because they do not supply a predicate.

Both final batches and Dashboard typecheck passed. Capture one successful
real empty one-shot trace to compare its enabled-control and review-request
sequence with the disabled-input CI trace. The bounded observation is one
case with the existing deadline.

The final frontend batch passed all nine cases. The final E2E batch passed
all nine cases, including both commit Refresh cases, all four one-shot
timeout cases, the third unavailable comparison, and the two Recently
done cases. The held Done details still allow the actual card's Review
changes action to open. The discriminating fixed empty-one-shot trace
`review-ci-one-shot-fixed.zip` records `rvkd@74` waiting 259 ms for
the action, `rvkd@79` pressing Enter, followed by the story review's
HTTP 200 response. In the corresponding failed CI trace, `gtsq@3754`
pressed the button inside the disabled fieldset and no request followed.
No deadlines changed.

The width opening remains through the real Review changes action of a
retained ad hoc Done session. The Board keeps one Taken card as a separate
scroll measurement. At 700 px the close journey pages back through Taken
because the session opens from Recently done. The panel still supplies the
same two files, and the test keeps the selected diff and exact read counts
through width and sidebar changes.
