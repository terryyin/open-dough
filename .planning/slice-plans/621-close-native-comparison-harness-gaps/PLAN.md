# Close native comparison harness gaps

**Source:** [correction story](../../seeds/SEED-346-native-ab-comparisons.md#close-native-comparison-harness-gaps)
**Source review:** [source-only commitments](source-review.md)
**Identity:** SEED-346#close-native-comparison-harness-gaps

[Retained provenance, findings, PFE, decisive premises and verification decisions](preparation-evidence.md).
Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md) to local and published proof.

## Execution context

- Story Branch Mode, `origin/codex/close-native-comparison-harness-gaps`, with `origin/main` as the integration target. The dashboard-owned worktree starts from the published Take `76fb0f9947ab4743202d99e152f4a9f9d02913e0` following `f731dab6c63b91e9499eb4355aab6cfb5a16c7f8`. Publisher `dashboard-territory.local-open-dough`, agent Maki-chan.
- Story branch observer uses GitHub Actions `ci.yml`, coordinator `Maki-chan`, mailbox `/tmp/dough-ci-501/watch-9g3qxP`.

Paths below are retraced at `86c4e9647` (Native guidance checks layout):
entry `Distribution/evaluation/src/native-guidance-check.sh` with its
`-catalog`, `-run`, `-turn` and `-retain` modules; supervisor
`native-run-supervise.sh` with `native-run-owned.sh`; cases in
`Distribution/evaluation/cases/guidance-checks/`; tests in
`Distribution/evaluation/tests/native-guidance-checks/`.

## Goal and scope

A maintainer running Native guidance checks gets three fixes. Arm-owned
processes are stopped whenever a started arm ends before its normal end:
both the services a case started and the arm's host session. Catalog host
selection names only qualified hosts. The runner records every turn's command
count and harness inspection itself, as `unknown` when the turn's stream
cannot show them, so a case observes only its own project.

**Preserved promises and constraints:**

- Every tracked record under
  `Distribution/evaluation/cases/guidance-checks/*/comparisons/` stays
  byte-for-byte. `--recover` on each `.txt` record still passes: the two
  `20261114T045440-*` records recover case basis
  `9c20a8086fe48e2bd60f283f478607440a057216`, and paused-supplier's
  `20261114T102744-1921.txt` recovers `764c4e0fe0ce9f478750323de6a9f30c76a7e61a`.
- Paid native runs stay manual-only. This correction needs no paid run: every
  proof is deterministic, and no agent-facing case input (task, wake, overlays,
  assessor) changes.
- Every family test stays credential-free. Case identity excludes `case.md` and
  `comparisons/`.
- Runner, case-agnostic contract: `case_cleanup` stays optional and prints its
  own fields. Cases without one are unaffected by Slice 1's cleanup.

**Accepted consequence:** the runner, turn and supervisor files and
`case.bash`/`supplier-fixture.sh` are material inputs of the saved
2026-11-17 baselines (`launch-command-tests` and `unblocked-supplier`
`comparisons/20261117-codex-baseline.json`). After this correction those
baselines no longer apply under
[baselines.md](../../../Distribution/evaluation/baselines.md), so the next
comparison of either case observes a fresh baseline arm. The saved files stay
as historical evidence.

## Ordered slices

### 1. Arm-owned processes stop whenever a started arm ends early
Type: Behavior
Status: done
Proof: A new credential-free cleanup journey test (stand-in case and stand-in host) for failed materialization, a refused host route and interrupts; Doughnut's partial-arm cleanup check; the family's existing journeys still green.

Behavior: an arm whose case has started `case_materialize` either fails to
materialize, is refused by the case's `case_prepare_run`, or is interrupted by
the maintainer, and the run ends. The case's `case_cleanup` has run exactly
once and what it started is stopped.

- **Failed materialization or refused route:** still records `unstarted`,
  with no session and no retained attempt; its observations also carry the
  cleanup's fields. No host session exists on these paths.
- **Interrupt:** each arm running a turn first has its host session's owned
  process group stopped, then its case cleanup runs. Both happen before the
  entry removes the work directory. No later turn starts. The entry then exits
  with the signal's status (130 or 143).
- **Normal path:** unchanged.

Approach: the runner (`native-guidance-check-run.sh`) marks materialization
as started and guarantees cleanup on every exit of the arm subshell: the
unstarted paths, the normal path, and INT or TERM delivered to the arm.

- **Host session:** `native_run_owned_controlled` (`native-run-owned.sh`
  85-87, 120-126) already stops both owned groups on INT or TERM through
  `native_run_terminate_group`, reports 130 or 143, and restores the caller's
  traps; `native-guidance-check-inflight.sh` 68-91 proves it. Give the plain
  `native_run_owned` route the same interrupt stop by sharing that handling
  between both routes in `native-run-owned.sh`, not a second tracker. It does
  not kill by name and does not retry or resume the stopped turn.
- **Runner:** after a turn reports an interrupt, the arm ends instead of
  observing, assessing or continuing; cleanup runs, then the arm re-raises or
  exits with the signal status.
- **Entry:** passes an interrupt to its running arms (single journey,
  sequential or concurrent pair in `native-comparison-pair.sh`) and waits for
  them. Bash holds a trap while a foreground child runs, so run the arm where
  `wait` can be interrupted.
- **Docs:** update the contract text in the runner header, the
  `native-run-owned.sh` header, the entry header's interrupt and test listing,
  and the interrupt and cleanup text of
  `Distribution/evaluation/guidance-checks.md` and `comparison.md`.

Proof: a new test (recommended
`Distribution/evaluation/tests/native-guidance-checks/native-guidance-check-cleanup.sh`,
a cohesive "an arm cleans up what its case started" journey; resolve its
conventions with `test-entry-rules.mjs` first). It adds a stand-in case inside
the fixture's copied harness, as `native-comparison-incomplete.sh` already
alters a copied `case.bash`, so the real catalog never lists it. The
stand-in's `case_materialize` starts a sentinel that ignores INT, TERM and HUP,
and its `case_cleanup` stops it.

- The test drives failed materialization and a refusing `case_prepare_run`
  through the entry.
- It drives three interrupt forms during turn 1, once the substitute host
  signals ready: INT to the entry's process group, as from a terminal, on a
  concurrent pair; INT to the group on a single journey; TERM to the entry
  alone on a single journey.
- Each journey asserts its sentinels stopped.
- Each interrupt journey also asserts, for every arm, that the stand-in host
  (the substitute `codex`, in its owned process group) is stopped. The
  stand-in host records on exit, to a file outside the work directory,
  whether its workspace still existed. The test requires "existed", so the
  host stopped before the work directory was removed, and requires that no
  stand-in host process remains after the entry exits.
- Wait with `Distribution/tests/helpers/wait-for.bash` or a FIFO read, never
  a sleep. The test's own EXIT trap force-kills any sentinel or stand-in host,
  because a signal-ignoring sentinel outlives an ordinary TERM.
- The proof must fail on the current runner, as the premise rows observed for
  both the sentinel and the host.

In `native-guidance-check-doughnut-title-precedence.sh`, add one check:
`case_cleanup` on a stand-in arm whose server started but whose migration
failed (pid file present, admin path unknown) stops that process.

File sizes: the runner (182 lines), entry (186), pair module (229),
`native-run-owned.sh` (128), supervisor (203) and Doughnut proof (112) stay
under the 250-line check. The pair module has the least room. If an edit would
take any file over, settle its cohesive reorganization in this slice before
implementing; do not split it mechanically. Changes to `native-run-owned.sh`
reach its other native-family consumers: trace them with the consumer-trace
script and run the consumers it lists.

This slice changes the runner, a recorded input. Afterwards, rerun `--recover`
on all three kept `.txt` records and confirm every tracked record is
byte-identical.

The cleanup journey failed at the Take for missing cleanup
and a surviving interrupted host. All 51 selected native and shared test-runner
checks passed after the change, with the final cleanup, controlled-turn and
watchdog checks repeated after trap restoration was simplified. The three
records recovered to the expected revisions and their comparisons diff was
empty. See the source review and the worktree's `slice-1-return.md` Git evidence.

The shared process-group helper's duplicate TERM could interrupt
the host exit handler after the group signal. The isolated observation
missed 20 of 60 exit receipts before the repair and none of 60 after.

The [Linux CI repair](diagnosis-native-linux-arm.md) gives each arm its own
process group, checks detachment against the supervisor's group, and reads
load averages through Node. The three original Linux failures were reproduced
and the 15-check affected Linux selection passed after repair. The macOS
archive deadlines in larger batches remain timing evidence from the repair.

### 2. Catalog host selection names qualified hosts only
Type: Behavior
Status: done
Proof: The entry's credential-free catalog checks, with negative host filters, plus `--list` on the real catalog.

Behavior: cases qualified natively on Codex only → a maintainer runs
`--list --where hosts=cursor` or `--where hosts=claude` → no case is listed and
the command fails, while `--where hosts=codex` selects the four natively
qualified cases, and `hosts=codex --where workflow=blocked` still selects
`paused-supplier`. The listing still shows each case's unqualified hosts, so
the scope limit stays visible.

Approach: in each `case.md` Selection section, `hosts` names only qualified
hosts, for example `codex (qualified natively 2026-11-14)`. Move `claude,
cursor` to their own trait, for example `unqualified hosts: claude, cursor
(no native observations yet)`. `supplier-watch` has no natively qualified
host (its native profile is retired), so its `hosts` names none and the new
trait carries `codex controlled substitute only; native execution is retired`.
Update the trait lists in the catalog header, the entry header (line 23) and
`guidance-checks.md` (line 87). `case.md` is outside case identity, so records
and recovery are unaffected; confirm with `--recover` on the kept records.

Proof: in `native-guidance-check.sh` (the test) default mode, its synthetic
catalog gains a case whose unqualified trait names a host its `hosts` does
not; add that host as a `--where hosts=` filter that is nonzero and lists
nothing, beside the existing positive checks. Then on the real catalog,
`--where hosts=cursor` and `hosts=claude` list nothing and fail, and
`hosts=codex` lists exactly the four qualified cases. The planning observation
showed the negatives fail today.

The real catalog and synthetic check passed for the positive and negative
filters. All three historical records recovered at their expected bases.
All 43 focused files passed after the cleanup fixture retired settled PIDs.
The earlier local SIGKILL sender could not be identified. See the source
review and the worktree's `slice-2-return.md` Git evidence.

### 3. The runner owns per-turn command and harness facts
Type: Structure
Status: done
Proof: The incomplete journey's `unknown` check, the four cases' credential-free proofs (including their harness-inspected counterexamples), and the family's journeys green.

Behavior: every turn the runner runs records `turn-N-commands` and
`turn-N-harness-inspected` from the runner, after its status, thread and
seconds. A turn whose stream is not complete records `unknown` for both,
never `0` or `false`. Field names, completed-turn values and the assessors
are unchanged, and effort still counts only observed turns: an `unknown`
count is never summed. `launch-command-tests`, which records neither field
today, gains both.

Approach: `native_guidance_check_turn` (`native-guidance-check-turn.sh`)
prints both fields from the stream it classified, using the run's harness
pattern plus the case's optional addition (for example
`case_harness_paths='init\.d|test-runs'` in Doughnut's `case.bash`). Remove
the two fields from Doughnut's `case_observe` (`case.bash` 229-233) and from
`supplier_case_observe` (`supplier-fixture.sh` 229-233, shared by
paused-supplier, unblocked-supplier and supplier-watch, including
supplier-watch's `case_observe_stopped`). Drop the HARNESS argument from
`case_observe`/`case_observe_stopped` and from the runner's case contract
header. Update `native-comparison-pair-observe.sh` (line 48 sums
`turn-N-commands`) so a non-numeric count is not summed, and the
case-contract text in `guidance-checks.md` and `comparison.md`.

Proof: in `native-comparison-incomplete.sh`, the stopped candidate arm's
turn 2 (stopped, `turn-2-status: failed`, line 128) records
`turn-2-commands: unknown` and `turn-2-harness-inspected: unknown`, and its
partial effort line is unchanged (lines 118-120). The planning observation
showed the reader yields `0` and `false` there today. The existing harness
counterexamples (`native-guidance-check-paused-supplier.sh` 128,
`native-guidance-check-doughnut-title-precedence.sh` 110) and the
supplier-watch and unblocked-supplier proofs now exercise the runner's fields
and stay green.

This slice changes the runner, turn module, Doughnut `case.bash` and
`supplier-fixture.sh`, recorded inputs and case identity. Afterwards, rerun
`--recover` on all three kept `.txt` records and confirm every tracked record
is byte-identical. No agent-facing case input changes, so no paid run. Keep
the runner and turn module under the 250-line check together with Slice 1's
growth; if one would pass, settle a cohesive reorganization first.

All 43 focused files passed. The incomplete-pair assertions observed
`unknown` for missing, truncated and wrong-thread streams and preserved
partial effort. Doughnut and launch-command qualification exercised readable
command and inspection facts. All three archives recovered at their expected
bases and stayed byte-identical. See the source review and `slice-3-return.md`.

## Execution complete

Product advice: no change. The guides explain all three outcomes, and the
baseline applicability rule requires a fresh arm when its inputs change.
The retrospective recorded the Linux parity finding in DearDough.
