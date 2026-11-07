# Short manual intent assessment brief

Use a fresh assessor in the executing session for each case. Give each one the
same method and only its verified scratch checkout, selected historical seed
section and original plan, base and checkpoint, attributable changed paths,
report path, and UTC cutoff. The assessor uses the attributed paths to scope
the review and judges protection at the full checkpoint.

## Method supplied to every assessor

Independently assess how the maintained tests protect one historical story.
Read only your supplied scratch checkout. Use its absolute path as the explicit
workdir of every command. Never read the original repository, other scratch
stores or reports, any Git remote, or shared or host session logs. Clear
inherited Git alternates for Git commands with
`env -u GIT_ALTERNATE_OBJECT_DIRECTORIES`. Read the selected historical seed
section and original plan first. Use the neutral attributed paths to scope your
review and judge protection at the full checkpoint.

Trace distinct story promises through production entry points to the maintained
tests, identifying starting fixture/setup and the actual observing assertion
or signal. Run relevant existing focused tests where runnable, selecting one
worker where configurable. Use the historical locked project setup and install
dependencies only in your scratch checkout. Check `pmset -g batt` before tests,
then on observed AC use
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i …`.
If on battery use the fully awake, lid-open `caffeinate -i` procedure and
sleep-log inspection in
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
No full suite or live hosted exercise. Use
`python3 .git/assessment-bound.py <command-time-limit-in-seconds> <complete command>`
for installs and tests. It enforces the test budget and a 60-second reporting
reserve.

Follow the historical `AGENTS.md#failing-and-flaky-tests` as written. A baseline
historical failure is evidence for the verdict. At most one optional selective
production break check is allowed, only in this scratch checkout. Reuse an
existing focused test, record exactly what changed, show that its fixture
reached the changed path before taking credit, and restore the identified
scratch edit immediately even on timeout or failure. If the test bypassed the
fault, report that and retain only the verdict supported by source and passing
tests. Do not make repairs or other product changes.

For each assessed promise record a brief, sourced verdict of `protected`,
`protected and break-checked`, `gap`, or `unknown` if relevant proof cannot run.
Identify any unassessed promises explicitly. For each focused command capture
its literal command, actual selected tests or runner count, observed
setup/assertions, terminal exit/result, and runner duration if printed. Give
any measured or estimated effort figures with units, basis and labels. Leave
unavailable figures explicit. Write your usable report to the supplied path
before the absolute cutoff, tell the coordinator when it is ready to copy,
then return promptly. No added product files or commits. On a CI pause, stop
writes and terminate write-capable commands, report state, and wait for
explicit resume.

## Coordinator boundary

- Start the ten-minute clock before generating the case's attributable context
  or preparing its Git store. Record UTC timestamps for setup, launch and
  return, separately from runner duration and human or agent effort. Count
  setup, tests and writing in the end-to-end elapsed time. Keep unavailable
  figures visible. [Confirmed budget](PLAN.md#confirmed-comparison-basis) ·
  [Effort evidence](../../NORTH-STAR.md#intent-assessment-results-carry-their-cost)
- Use a new private scratch directory outside shared worktrees. With inherited
  object alternates cleared, initialize and fetch only the exact base and
  checkpoint into shallow refs. Detach at the checkpoint. Before dispatch,
  verify readable base, checkpoint, seed and original plan, absent
  execution-complete object, and no on-disk alternate, configured remote, or
  `FETCH_HEAD`. A failing blinding check stops dispatch. Keep the later
  execution-record identity and the attribution commits with coordinator
  provenance. The assessor receives the product, test, and documentation paths
  only, with the selected seed and original plan named separately.
- Confirm power and host headroom before dispatch, run at most two assessors
  concurrently, and reserve time for writing. Use the scratch-only command
  limiter for installs and tests. A report ready at the cutoff can carry
  partial evidence. Record the return boundary and qualify any work past the
  cutoff. Check the detached HEAD and tracked status again after the assessor
  returns and before copying the report.
  [Project test failure policy](../../../AGENTS.md#failing-and-flaky-tests)
- Keep blinding checks, exact launch inputs, historical proof links, runner
  results and the restoration outcome with each case record. These assessments
  are in-session subagent runs. Terry's reading and verification are recorded
  separately in the comparison.

## Launch evidence

The Codex assessment coordinator's local session record
`rollout-2026-11-07T21-09-51-01a1b621-33aa-73e1-80f5-d7d92270197d.jsonl`
records the three fresh-context launches at rows 81 (SEED-254), 92 (SEED-256)
and 267 (SEED-257). Each call records `fork_turns: "none"`. Each case record
contains its supplied inputs and the observed receipt of its report. The
historical failure-policy text matched the current policy in all three
stores. [Project test failure policy](../../../AGENTS.md#failing-and-flaky-tests)
