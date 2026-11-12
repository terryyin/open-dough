---
id: SEED-324
status: active
planted: 2026-11-12
planted_during: follow-up to SEED-314#speed-up-landed-ci-repeat-checks, whose remaining real journeys and two unowned checks of the same repeat scenario still reach the 30 s default above a load of about 33
trigger_when: Terry asked for this story at the top of the backlog on 2026-11-12
scope: story
---

# SEED-324 — Landed CI repeat checks pass under moderately high load

## Why this matters

SEED-314#speed-up-landed-ci-repeat-checks cut the landed CI repeat family
from 111 s to 35 s at one worker, and it passes at local load 24–26 on two
workers. Above a one-minute load of about 33, the checks that still take a
real receipt-to-admission journey reach the 30 s default case timeout, on the
base as well as on that story's code:

- the three remaining real journeys in
  `dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts` and
  `dashboard/backend-tests/intent/landed-ci-repeat-verdict.spec.ts`;
- `dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts`, whose
  phone journey polls the rerun count for 5 s after the receipt and failed
  once at load 27–40;
- `dashboard/tests/intent/intent-ci-follow-up.spec.ts`, whose phone journey
  takes 22–23 s at load 20–25 and reaches 30 s above about 33.

No story names the last two. Other worktrees routinely hold this machine at
that load, so a loaded local run can fail on any of these without a product
defect. The evidence is the SEED-314 occurrence of
[DD-476](../../ProjectFindings.md#dd-476).

On 2026-11-12 Terry asked for a story in which these tests pass safely at a
moderately high CPU load without a customized timeout, which means
simplifying them by a lot so that they are both faster and stable.

SEED-287#fit-dashboard-journeys-in-default-timeout owns the five
`landed-ci-repeat-admission` cases, and
SEED-319#hold-landed-ci-follow-up-observations-under-load owns the
reconciliation, follow-up reading and receipt boundary observations at load
20–30.

<a id="pass-landed-ci-repeat-checks-under-high-load"></a>

### Make landed CI repeat checks pass under moderately high load

**Identity:** SEED-324#pass-landed-ci-repeat-checks-under-high-load
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

Maintainers get a passing verdict from the landed CI repeat and follow-up
checks named above while the machine is under moderately high CPU load, with
the default case timeout and with wide margin, because each check is
simplified enough to be much faster.

#### Scope to refine

- Fix the load profile the story promises. The starting proposal is a
  one-minute load of 30–50 on two workers, the range in which these checks
  failed; Terry named "moderately high CPU usage" without a figure.
- Simplify the named checks substantially: find what each real journey proves
  that no cheaper check proves, keep that once, and move or remove the rest.
  Speed comes from doing less in each case, not from tuning waits.
- Replace each remaining fixed 5 s observation that load can miss with a wait
  for the observable event it depends on.
- Keep behavioral coverage: every promise the current cases protect stays
  protected by some maintained check, shown by a coverage map and fault
  controls as in SEED-314's plan.
- Use shared MakeMe for domain data and existing external-provider fixtures.

Required restrictions and reasons: keep the default case timeout; no timeout
overrides, `test.slow()`, sleeps, retries or skips to absorb load, under
[test automation](../../AGENTS.md#test-automation). A flaky check is failing
under the project's
[failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests)
until it is stable locally and in CI.

#### Key examples to refine

- At the promised load profile on two workers, every named check passes in
  three consecutive runs, and its slowest case stays well inside 30 s (the
  margin is a figure to set in refinement).
- The same checks pass in hosted CI with unchanged verdicts.
- A fault injected into each promise the simplified checks still own makes a
  named check fail.
