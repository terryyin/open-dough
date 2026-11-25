# Diagnose the one-shot review diff read

The story-branch push at `e2e7f3f33c3e42a0bb83babaaebc271052756fcb`
reported an actionable E2E failure in
[CI attempt 1, shard 5](https://github.com/terryyin/open-dough/actions/runs/45614062657/job/139204782705).
In the unfinished attention-session journey at
`e2e/review/recently-done-one-shot-review.spec.ts:160`, the first unread
Done-card review stayed at “Reading the file's diff…” for `earlier.txt` and
timed out in `ReviewDiffs.expectShows`. Other jobs were still running when
this failure arrived. No other active repair owner is known.

Round 1 starts at clean `410724b49f2e037aa00f4315c36d65028d6b4569`.
No edits were parked. First experiment, one focused native reproduction on
this checkout. Hypothesis: the diff request from the held-Done state can
reproduce the same visible loading failure with its ordinary local setup.
If it passes, inspect causality or instrument the read before considering
another run. No rerun of hosted CI without a diagnosis.

### Local reproduction

The first experiment failed once in one Chromium worker on this AC-powered
16-core Mac. Load averages before launch were 9.29, 12.05, and 12.48, with no
other owned local proof known. The same timeout obtained after the first
unread Done-card opening and the call log showed the exact CI signature.

`caffeinate -s -i npm run test:e2e -- --reporter=list recently-done-one-shot-review.spec.ts -g 'an unfinished attention session outside its done card'`

Evidence under the checkout's `open-dough/evidence`: `ci-repair-r1-repro.log`,
its `.run.json`, the copied `ci-repair-r1-repro-trace.zip`, and
`ci-repair-r1-repro-context.md`. The trace shows the selected landed review
reply completing 200, then six identical pending Done-body requests already
ahead of the first file diff request. That diff has no response or send
timing. All six Done-body reads use the catalogued revision and the same
record file. The test deliberately holds that record until after this
phase's diff observations.

### Isolation experiment

Slice 2's landed comparison title now mounts another reader of the Done
record. Intent's lens already reads the same record for its heading. The
leading cause is the duplicate request consuming a browser connection slot
while the record is held. Gate the title launcher temporarily on the lens's
readable record while leaving the diff and all test assertions intact. Run
the full one-shot spec once to see whether the stalled diff becomes readable.
This experimental change affects only the title launcher mount while the
record is unresolved. Revert that experimental patch before the final repair.

The experiment passed both one-shot journeys with two Chromium workers.
The previously stalled first diff returned HTTP 200 after 216 ms with five
Done-body requests still pending, observed in
`ci-repair-r1-gated-trace.zip`. This isolates the added title read as the
sixth held request. The original test still inspected all three Git texts
before release, and repeated the inspections when Done detail failed and
after it became readable. Evidence is `ci-repair-r1-gated.log.run.json`.

Round 1 used 3.3 active minutes and established the cause in the delivered
story change. The repair
will use the selected lens's already-read Done record when building the
title's existing launcher subject. File and line callers retain their
current Done lookup and review admission.

### Local repair proof

The title now renders from the lens's read record and passes the story to the
shared launcher lookup with the visible comparison. The lookup takes the
Done catalog revision and launch context as before, with the body read
disabled when Intent supplies that story.

The unchanged one-shot journeys passed again on the final repair in a
12-test E2E selection that also exercised title, file and line follow-up.
The mounted Intent, Review, and Launches groups passed 476 tests, including
the title's widened comparison request, pending read, and focus return.
Dashboard typecheck passed. The hypothesis for branch CI is that the title
no longer fills the sixth connection slot during the held read, so the
one-shot review can complete the first diff and the rest of its journey.
Observe the next published repair once through its applicable CI attempt.
