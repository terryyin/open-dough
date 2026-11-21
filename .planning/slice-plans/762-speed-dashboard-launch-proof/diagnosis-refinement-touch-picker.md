# Diagnose refinement touch after the native selects

The exact published repair `092de062ebfae7eba77ed8ea638477ab831e22a9`
ran as GitHub CI 44929929877 attempt 1. Frontend shard 2/2 job
136924104817 passed 127 of 128 mounted cases, including the desktop
offers. The refinement touch case timed out at the default 15 seconds.
Its last recorded completed action was selecting Sonnet. The next
action is the native tap on the Standard radio label. The raw job log
and bounded diagnostic are in the checkout Git evidence directory.

The earlier coordinate problems were reproduced and repaired. The
current failure is after both native select taps and their programmatic
value selections. Investigate the native popup or a blocked locator
command rather than repeating uninstrumented input. The first two
repair attempts each settled a distinct preceding observation.

Slice 4 is paused after 8.5 active minutes. Its six tracked changes and
three new test files are parked in managed stash
`76580735e61562c686cc33ffbbc5ed7f24e64af7`, record
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-0q6j00/record.json`.
Round 1 starts at zero active minutes with a clean candidate.

## Round 1

Artifact 14716809941 contains the exact failing screenshot. It shows the
native Model menu still open over the dialog. The field already says
Sonnet, but the open menu still highlights Default. Standard is below
that menu. The JSON reporter confirms a 15-second timeout. The raw job
trace ends after Model selectOptions and before the next tap completes.

Hypothesis: the browser-owned picker opened by the native tap survives
Playwright's programmatic value change and can prevent the following tap.
Observe one unchanged focused run under DEBUG=pw:api with the locked
Linux arm64 image, two workers, Mac on AC, load 5.72, and no concurrent
verification of my own. This traces each tap's actionability and target.
Stop after one run and switch to a controlled contrast if it passes.

The traced Linux arm64 case passed 1 of 1. All taps resolved, including the
Standard label. The next experiment samples the browser's select open state
around the Model tap, programmatic selection, and Standard tap. Temporarily
give the native menu more options so it can overlap the subsequent action
while preserving the original Sonnet value and product handlers. Run once
under the same two-worker Linux conditions. The evidence must show whether
the browser retains an open picker and the subsequent native action loses
its intended target or stalls. Remove all temporary instrumentation and
options before retaining any repair.

The instrumented case passed 1 of 1 even with more options. The locked
browser did reproduce the hosted screenshot's key state: Model was
closed before the tap, open after the tap, and still open after
selectOptions returned and selected Sonnet. On this local platform
the Standard tap happened to close the menu and land successfully.

One final before probe removes the extra options and asserts the native
menu is closed after Model value setup, before trying the Standard tap.
It tests the leaked browser state directly on the original controls.
Run once with the same worker and platform conditions. The candidate
contrast will check whether a trusted Escape can end the menu interaction
without ringing the product dialog's Escape handler.

The original-size menu probe failed as expected with
`Model picker closed before touching Standard: expected true to be false`.
Sonnet had been selected and the native menu was still open. Round 1 ended
at 3.1 active minutes. The hosted timeout itself was not reproduced locally.

## Repair

Hypothesis: a trusted Escape delivered while the select picker is open
closes the browser menu and leaves the product dialog open. Keep the same
native Host and Model hit checks, explicitly finish each picker interaction
before installing its desired value, and check the picker remains closed
before continuing the app gesture sequence. Run one Linux contrast on
the same spec and setup. Then run one uninstrumented local pass on macOS
and Linux with two workers if the picker contrast and owning dialog both
pass. Preserve the existing long-title fixture and every rotation gesture.

The trusted Escape candidate closed both native pickers without closing
the dialog on Linux. The macOS comparison failed because Escape instead
closed the launch dialog after the Host tap, despite the native select
matching `:open`. Discard the Escape candidate.

New hypothesis: prevent the select's browser default on the compatibility
mousedown for this test setup. The existing trusted `pointerdown` listener
still verifies that a real Chromium touch reaches the select. Playwright
then chooses the named value as before. Verify the picker remains closed
after the same touch and the real control takes the value. Run one
instrumented Linux case and one macOS case. Leave all other touch targets
and application behavior unchanged.

This candidate passed the instrumented Linux contrast and the ordinary
focused runs on Linux arm64 and macOS. Each selected and passed one
mounted case at two workers. The trusted tap receiver assertion ran on
both selects. The new picker-closed assertion passed after each named
selection, and the original tracking, Explore, draft, rotation, restricted
height, reachability, and Cancel checks ran unchanged. The production
dialog stayed open for these actions. No temporary fixture or debug
instrumentation remains. Hosted amd64 shard confirmation is pending.

The before probe is `refinement-picker-linux-leak-before.log.run.json`.
The instrumented fixed contrast is
`refinement-picker-linux-prevent-picker.log.run.json`. The final runs are
`refinement-picker-linux-maintained.log.run.json` and
`refinement-picker-macos-prevent-picker.log.run.json`. The hosted PNG and
JSON are under `refinement-picker-hosted/` in the checkout's Git evidence
directory.

## Hosted confirmation

Use one automatic hosted attempt on the published repair to check that
the native Model picker remains closed before later application taps.
The hosted capture established the leaked state. The locked local Linux
contrast and final Mac/Linux cases cover the fix before publication.
Any further failure needs its new observation before another attempt.
