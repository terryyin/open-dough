# Refused-storage Recent stories test in CI

[Run 45303682537, attempt 1, frontend shard 1/2](https://github.com/terryyin/open-dough/actions/runs/45303682537/job/138142156283) failed on `1fdc0577db5884cd2c6f1e2d4cdfacbe0b4740d4`. 495 mounted cases passed and one failed. After two successful Highlight assertions the test invoked the bookmark, then `showsHistory` observed zero options while expecting two. The exact CI job log and bounded diagnostic are in Git evidence `ci-failure-45303682537-1-job.log` and `ci-failure-45303682537-1.json`. Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

Leading hypothesis for one differentiating experiment: direct card activation can
select a card whose reading edge is outside the Board. At that boundary the
production bookmark reveals the card before opening the popover. Inspect the
failed screenshot and render path and exercise the same independent conditions
before changing the case. Keep the refused-storage and remount observations.

Slice 7 is parked at stash OID `15d2c9a238580627f42b79e5add2c3af57b2fbf6`
with an empty index and four Intent paths. It has no running proof.

## Round 1 experiment

On local macOS Chromium at two requested workers and on AC power, run the
original refused-storage case once with a temporary `min-height: 200vh` on
its first card. This makes the second card's start land below the actual Board
reading room while direct activation can still select it. Assert that setup
and that the first bookmark activation focuses the second card. If the original
history assertion then sees zero options, this reproduces the CI signature
and distinguishes a reveal from a missing in-memory write. Stop after one
run. Remove the temporary instrumentation before accepting the repair.

The one run reproduced the same failure at `showsHistory`, expected two and
received zero, after the target was independently observed below the reading
room and then focused by the bookmark. The hosted screenshot shows the same
focused second card, newly opened detail, and no popover. The root cause is an
offscreen selection made by direct DOM activation. The production control
correctly reveals that card on the first press. The test mistook that reveal
for a lost history write. This behavior exists in the product and the test
precondition was introduced in the mounted migration. Round 1 took 1.6 active
minutes. See Git evidence `ci-recent-storage-before.log`,
`ci-recent-storage-before.log.run.json`, and `ci-recent-storage-failure.png`
from [the CI report artifact](https://github.com/terryyin/open-dough/actions/runs/45303682537/artifacts/14879384559).

## Repair proof

Repeat the forced offscreen experiment once with the second selection made
through a native hit-tested heading click. The runner should bring the heading
into reach before input, and the same one bookmark activation should show both
ordered rows. This checks the fix under the precise failing condition. Then
remove the temporary height and range assertions and run both storage cases
plus the three mounted Recent stories journeys once at two workers.

The forced run passed 1/1. The unchanged assertion saw both rows after a single
activation, with the same initially offscreen geometry and same throwing
storage. The final two files passed 5/5 after temporary instrumentation was
removed. The storage case still verifies latest first and selected, earlier
unchecked, fresh empty frame with selection cleared, and no window errors.
The separate reveal case still verifies first activation reveals and the
second opens the list. Evidence is in `ci-recent-storage-after-forced.log`
and `ci-recent-storage-final.log` and their run records. No unrelated failure
was found. Linux's precise font or preparation timing that moved the card
was not needed to reproduce the observed boundary.

On the next single hosted verification, the native click should make the
second title reachable under the runner layout and the observed two rows
should pass. The coordinator owns inspection of that candidate's CI.
If it fails once at the same point, inspect the new screenshot and trace for
the card's reading edge and dialog state before choosing a new experiment.
