---
id: SEED-227
status: active
planted: 2026-11-04
planted_during: Project findings maintenance for DD-412
trigger_when: An Open Dough contributor plans a long local dashboard test run on macOS
scope: story
---

# SEED-227: Protect long local proof from Maintenance Sleep

## Selected Stories

<a id="protect-long-local-proof-from-maintenance-sleep"></a>

### Protect long local proof from Maintenance Sleep

**Identity:** SEED-227#protect-long-local-proof-from-maintenance-sleep

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/458-protect-long-local-proof-from-maintenance-sleep/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"aa3270fa39950eb85c0a13f1739b6c1be53811dad3113a0115c17aa5aa4558db","plan":"4ccbdb26727675e46e37368e1e735de60fe52e8073f2b3c6355e067a932acf4d"}}
```

**Goal.** An Open Dough contributor, a developer or an executing agent, who
runs a full local repository or dashboard suite on a macOS laptop finds in
the maintained local proof instructions the sleep guard that fits the
machine's power state, and a way to tell a machine that slept from a product
or test defect. Fewer whole-suite runs are lost to a laptop entering its
sleep cycle, and sleep-caused scattered failures are attributed in minutes
rather than the 3.4 hours
[DD-412](../../docs/maintainer/project-test-findings.md#dd-412) cost.

**Scope.**

Required behavior:

- [`tests/local-test-resources.md`](../../tests/local-test-resources.md), the
  local full-suite instructions that `dashboard/tests/README.md` links, gains
  a macOS machine-sleep section with the setup and the diagnosis:
  - the guard for a full run on AC power is `caffeinate -s -i` around the
    run; `-s` is honored only on AC; `-i` alone prevents idle sleep from a
    fully awake machine and has no effect once the machine is in its
    sleep/dark-wake cycle, which is how the two DD-412 runs failed;
  - on battery, `-s` is inert: plug in, or start from a fully awake machine
    with the lid open under `-i` and read the sleep log afterwards;
  - start every long run from a fully awake machine, whatever the guard;
  - diagnosis: when a full run fails with worker or command timeouts or with
    scattered failures that a rerun does not repeat, read `pmset -g log` for
    `Sleep` and `Wake` entries inside the run's window (its start time, for
    the dashboard suite the `test-results/<stamp>` directory name, and the
    runner-reported duration) before reading the failures as defects. The
    log on a machine reaches back about a week, so read it soon.
- The maintainer guidance planners carry into every plan,
  [AGENTS.md](../../AGENTS.md), points at that section in one line beside the
  failing-and-flaky-tests policy, so a plan's local-gate line names the
  maintained guard rather than a remembered one.
- DD-412 records the delivered instructions and keeps its observation
  criterion for the next ordinary-use result.

Constraints:

- A sleep inside the run's window explains a failure; it changes no verdict.
  The run is rerun under the guard, under the repository's
  [failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests),
  and no test is excused by the sleep record.
- The instructions claim only what is observed or documented (see
  Investigation): they do not promise that `-s` rescues a run started inside
  the sleep cycle until an ordinary run shows it.

Scope limits:

- Local macOS proof only. CI, Linux, and the runner scripts are unchanged.
- No machine-wide power setting is instructed (for example `pmset
  disablesleep`); that is the contributor's own machine choice.

Deferred promises:

- **Automatic guard from the full-run admission owner (recommended; decision
  for Terry before Take).** `acquireLocalSuite` in
  `scripts/local-test-suite.mjs` is the one place every full local run
  passes: `scripts/test.sh` re-enters through it for a full `npm test`, and
  `dashboard/playwright.config.ts` calls it for a full dashboard run, across
  linked worktrees and never in CI. On macOS it could start
  `caffeinate -s -i -w <its own pid>` when it takes admission, so every full
  run carries the guard without anyone remembering it, and `-w` releases the
  assertion with the owner, including after an abrupt death. Proof with a
  substitute guard command, as ADR 0005 tests maintained runner logic, reads
  the same on macOS and in Linux CI. Architecture consequence: the admission
  owner gains one platform-specific responsibility; no Accepted decision
  conflicts. Not in the seeded scope, which is the instructions; see the
  decision below.
- **Automatic sleep report.** A failing full local run on macOS could print
  the sleep entries inside its own window. Deferred until a sleep-attributed
  failure recurs after this story.

**Key examples.**

1. AC-powered laptop, full dashboard suite. The contributor follows the
   section and runs the suite under `caffeinate -s -i` → the run completes
   with no `Sleep` entry in `pmset -g log` inside its window; the verdict is
   read as reported.
2. Battery. The section says `-s` is inert on battery → the contributor
   plugs in, or starts from a fully awake machine with the lid open under
   `caffeinate -i` and reads the sleep log after the run.
3. Unattended agent session. The laptop entered its sleep cycle before the
   run started (as on 2026-11-03 at 11:06) → a run under `-i` alone executes
   only in dark-wake slices and fails scattered; the section names this case,
   says `-i` has no effect there, and names `-s` on AC and a fully awake start
   as the guard.
4. Diagnosis. A full dashboard run fails 52 specs that do not overlap the
   previous run's 95 → the contributor reads the sleep log for the run's
   window, finds `Maintenance Sleep` entries, records the run as invalid for
   sleep, and reruns under the guard; the failing-test policy applies to the
   rerun as written.
5. Same symptom, no sleep in the window → sleep is excluded and the
   contributor continues under the ordinary policy, such as external-load
   classification.
6. A planner writing a plan's local-gate line follows the AGENTS.md pointer →
   the plan names the maintained guard with its power condition.

**Investigation (2026-11-04).** Facts, each with its source:

- `man caffeinate`: `-s` prevents system sleep and "is valid only when
  system is running on AC power"; `-i` prevents idle sleep; `-w <pid>` holds
  the assertion until that process exits.
- IOKit `IOPMLib.h` (MacOSX27.0 SDK): `PreventUserIdleSystemSleep`, which
  `-i` creates, "has no effect if the system is in Dark Wake" and does not
  cover lid close, the Apple menu, or low battery.
- `pmset -g log` on the DD-412 laptop: 2026-11-03 11:06:27 `Idle Sleep` on
  AC, then `DarkWake`/`Maintenance Sleep` cycles with no awake window longer
  than about 11 minutes, until a `DarkWake to FullWake` from HID activity at
  20:26:37; no `Sleep` entry since. DD-412's two failing runs (about
  12:00–17:00) fall inside that cycle. The log reaches back to 2026-10-28.
- `pmset -g` there: on AC, `sleep 1` and `displaysleep 10`, so the machine
  sleeps one minute after the display goes off unless an assertion holds it.
- Claude Code itself holds `caffeinate -i -t 300` for each running command
  (six such processes from `claude bg-spare` were live during this
  refinement), so plan 454's `caffeinate -i` added nothing in that host; the
  missing assertion was `-s`.
- Plan 454's Learnings (`1c8898b23ac6`): two runs under `-i` failed 95 and 52
  specs; the run under `-s -i` passed 1945 of 1945.

Hypotheses:

- `caffeinate -s` keeps a run going on AC once the machine is already in its
  sleep/dark-wake cycle. The man page supports it, but the 1945/1945 run
  cannot have run inside the cycle (no sleep-free window was long enough), so
  it ran after the 20:26 full wake and does not show it. The settling
  observation is one long run started under `-s -i` while the machine is in
  its sleep cycle, with no `Sleep` entry in its window; it was not run here
  because it means putting this laptop to sleep under six live sessions. The
  instructions therefore say to start from a fully awake machine and to hold
  `-s`, and DD-412's observation criterion collects the evidence.
- Why the laptop idle-slept at 11:06 while a long-running `caffeinate -md`
  from a shell held a display assertion is unknown. The instructions do not
  depend on it.

**Alternatives considered.**

- Instructions only (selected scope): no product change; relies on the reader
  finding the section, which the AGENTS.md pointer makes cheap.
- Automatic guard in the admission owner: protects every full run on every
  host with no reading; one small script change plus a substitute-command
  test. Recommended; deferred above pending Terry's decision.
- Automatic sleep report in the runner's failure output: deferred above.
- A machine-wide setting (`pmset -c sleep 0` or `disablesleep`): needs sudo
  and changes a personal machine outside a run; not instructed.
- Borrowed mechanism, cold-chain shipping: a shipment travels with a
  temperature logger, its refrigeration unit runs only while the container is
  powered, and the receiving lab reads the logger's excursions for the
  shipment's own transit window before trusting the assay. Mapped here: the
  run is the shipment, `caffeinate -s` the unit that works only on AC, `pmset
  -g log` the logger, and the window-scoped reading before interpretation is
  the transferred practice, which is why the section ties the diagnosis to
  the run's start stamp and duration. The analogy breaks at the verdict: an
  excursion discards the batch, while a sleep changes no test verdict under
  the failing-test policy, and the logger is per shipment while the sleep log
  is per machine, shared by concurrent runs and kept about a week.

**Architecture.** Nothing consequential in the selected scope; the automatic
guard's consequence is noted with its deferred promise.

**Decision for Terry before Take.** Keep the instructions-only scope, or
promote the automatic guard into this story. Recommendation: promote it,
because the guard is a mechanical step the admission owner can apply for every
full run on every host, and DD-412 arose from a planner copying a guard from
memory, which a section still asks the reader to find. If promoted, slice-plan
refinement adds one Structure/Behavior slice to the plan before execution.

**Evaluation.** Walk the instructions for an AC-powered Mac and check that
they lead to the guard verified in plan 454. Check that they state the power
condition for system-sleep prevention and give a concrete way to check the
sleep log when worker timeouts cluster. Record the delivered instructions
and the next relevant ordinary-use result at
[DD-412](../../docs/maintainer/project-test-findings.md#dd-412).
