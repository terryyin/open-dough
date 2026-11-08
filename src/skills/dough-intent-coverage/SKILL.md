---
name: dough-intent-coverage
description: >-
  Runs one targeted scratch break check when a developer explicitly requests
  Dough Intent Coverage during review. Reports whether an existing test catches
  one plausible fault in an important story promise.
---

# Check one story promise

Use this skill on explicit request. Return evidence the caller can use to
decide whether to retain or strengthen the selected test protection. Leave
test repairs, broader assessment, automation, and persistence to their owners.

## Choose the check

Capture the invocation start from the host clock when available. Otherwise
take a clock reading at the start of your work, before looking up the story
or preparing the checkout.

Identify the selected story and revision, the promise and its expected
observable behavior, one plausible fault, and an existing assertion that
could catch it. Use this project's recorded intent, maintained focused test
command, and scratch checkout conventions. Ask for the story source if
you cannot establish the promise. If other required context is missing,
name what you need and stop before editing.

## Run and restore

1. Prepare an isolated scratch checkout of the selected revision, or verify
   that a supplied checkout is already isolated at that revision. Record its
   pre-probe state so you can distinguish your edits from existing changes.
   Run the focused test there. Require a passing baseline that actually
   exercised the selected test before applying any fault.
2. Arrange to undo your temporary edit even if the run fails or is
   interrupted. Introduce one fault, leaving the fixture and assertion
   intact. Rerun the same focused command. Check that the behavior changed
   on the intended path and whether the run reached the intended assertion.
   A fault executing somewhere in the test is insufficient evidence that
   the selected behavior went wrong.
3. Restore the edit, compare the scratch state to its pre-probe state, and
   rerun the same command. Verify that the restored check passes. Preserve
   changes that were already present. If you cannot verify restoration or
   the restored pass, report the remaining gap.

## Return the result

Report one outcome for the selected promise, fault, and observed path:

- **Caught.** The fault reached the intended assertion, which failed on the
  changed behavior.
- **Assertion gap.** The intended assertion passed and independent evidence
  shows that the fault produced wrong behavior on the path it exercised.
- **Insufficient evidence.** Identify the missing setup, passing baseline,
  reach, behavior observation, or restoration check. An unrelated failure
  or a green run without evidence of wrong behavior belongs here.

Cite the story and revision, fault location and change, fixture, maintained
assertion, and run observations, including how you verified reach and
restoration. Return the finding and its cost together to the caller. The
caller owns any saved record.

Include measured elapsed time from invocation through producing the report,
including lookup, setup, and runs. Show test runtime separately when observed,
and separate human effort from agent effort when supported. Give each figure's
unit and basis and label it measured or estimated. Mark unavailable figures
explicitly. If the clock missed part of the invocation, identify the measured
interval and mark the complete elapsed time unavailable. Include the cost
evidence for an inconclusive attempt.
