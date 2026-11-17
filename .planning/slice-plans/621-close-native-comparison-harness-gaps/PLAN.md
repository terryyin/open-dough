# Close native comparison harness gaps

**Source:** [correction story](../../seeds/SEED-346-native-ab-comparisons.md#close-native-comparison-harness-gaps)
**Identity:** SEED-346#close-native-comparison-harness-gaps

[Retained provenance, findings, PFE, decisive premises and verification decisions](preparation-evidence.md).

Paths below predate the move to Native guidance checks: the entry is now
`Distribution/evaluation/src/native-guidance-check.sh` (with its `-catalog`,
`-run`, `-turn`, `-retain` modules), cases live in
`Distribution/evaluation/cases/guidance-checks/` and their tests in
`Distribution/evaluation/tests/native-guidance-checks/`
(`native-guidance-check-<case>.sh`). Retrace them when this plan is refined.

## Goal and scope

A maintainer running native comparison cases gets four fixes. Arm-owned
processes are stopped when materialization fails or the run is interrupted:
both the services a case started and the arm's host session. The
credential-free pair, refresh and incomplete journeys install payloads from
the working tree they are about to commit. Catalog host selection names only
qualified hosts. The runner records every turn's command count and harness
inspection itself, as `unknown` when the turn's stream cannot show them, so a
case observes only its own project.

**Preserved promises and constraints:**

- The two tracked records
  `Distribution/evaluation/cases/comparison/*/comparisons/20261114T045440-*.txt`
  stay byte-for-byte, and `--recover` on each still recovers case basis
  `9c20a8086fe48e2bd60f283f478607440a057216` with `recovery: pass`.
- Paid native runs stay manual-only. This correction needs no paid run: every
  proof is deterministic, and no agent-facing case input (task, wake, overlays,
  assessor) changes.
- Every family test stays credential-free. Case identity excludes `case.md` and
  `comparisons/` (`native-comparison-basis.sh` 30).
- Runner, case-agnostic contract: `case_cleanup` stays optional and prints its
  own fields. Paused-supplier defines none and is unaffected.

## Ordered slices

### 1. Arm-owned processes stop whenever an arm ends early
Type: Behavior
Status: planned
Proof: A new credential-free cleanup journey test (stand-in case and stand-in host) for failed materialization and interrupts, Doughnut's partial-arm cleanup check, and the family's existing journeys still green.

Behavior: an arm whose case has started `case_materialize` either fails to
materialize or is interrupted by the maintainer, and the run ends. The
case's `case_cleanup` has run exactly once and what it started is stopped.

- **Failed materialization:** still records `unstarted`, with no session and
  no retained attempt; its observations also carry the cleanup's fields. No
  host session exists on this path.
- **Interrupt:** each arm running a turn first has its host session's owned
  process group stopped, then its case cleanup runs. Both happen before the
  entry removes the work directory. The entry then exits with the signal's
  status (130 or 143).
- **Normal path:** unchanged.

Approach: the runner marks materialization as started and guarantees cleanup
on every exit of the arm subshell: the unstarted path, the normal path, and
INT or TERM delivered to the arm.

- **Host session:** on INT or TERM during a turn, the arm terminates its host
  command's owned process group through the supervisor's existing
  termination (`native_run_terminate_group` and the group `native_run_owned`
  recorded). It does not kill by name, and it does not retry or resume the
  stopped turn.
- **Entry:** passes an interrupt to its running arms (single journey,
  sequential or concurrent pair) and waits for them. Bash holds a trap while
  a foreground child runs, so run the arm where `wait` can be interrupted.
- **Docs:** update the contract text in the runner and supervisor headers,
  the entry header's interrupt and test listing, and the cleanup and
  interrupt paragraph of `Distribution/evaluation/comparison.md`.

Proof: a new test (recommended `Distribution/tests/native-comparison/native-comparison-cleanup.sh`,
a cohesive "an arm cleans up what its case started" journey; resolve its
conventions first). It adds a stand-in case inside the fixture's copied
harness, as `native-comparison-incomplete.sh` already alters the copied
`case.bash`, so the real catalog never lists it. The stand-in's
`case_materialize` starts a sentinel that ignores INT, TERM and HUP, and its
`case_cleanup` stops it.

- The test drives failed materialization through the entry.
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
- Wait with `wait-for.bash` or a FIFO read, never a sleep. The test's own
  EXIT trap force-kills any sentinel or stand-in host, because a
  signal-ignoring sentinel outlives an ordinary TERM.
- The proof must fail on the current runner, as the premise rows observed for
  both the sentinel and the host.

In `native-comparison-doughnut-title-precedence.sh`, add one check:
`case_cleanup` on a stand-in arm whose server started but whose migration
failed (pid file present, admin path unknown) stops that process.

File sizes: the runner (207 lines), entry (182), pair module (200), supervisor
(`native-run-supervise.sh`, 235, if touched) and Doughnut proof (89) should
stay under the 250-line check. The supervisor has the least room. If the
host-session stop would take it over 250, settle its cohesive reorganization
in this slice before implementing, for example separating spawning and waiting
from termination. Do not split it mechanically. Any change to the supervisor reaches its other
native-family consumers. Trace them with the consumer-trace script and run the
consumers it lists. If an edit takes any
of them over, settle its cohesive reorganization in this slice before
continuing. Do not split it mechanically.

This slice changes the runner, a recorded input. Afterwards, rerun `--recover`
on both kept records and confirm they are byte-identical.

### 2. Free pair journeys install the working tree's payload
Type: Behavior
Status: planned
Proof: A discriminating working-tree check plus `native-comparison-pairs.sh`, `-refresh.sh` and `-incomplete.sh` green on the new fixture.

Behavior: a checkout whose payload or installer has uncommitted changes →
the credential-free pair, refresh or incomplete journeys run → the frozen
baseline payload, and so each arm's installed guidance, carries the
working-tree content, not the committed HEAD's.

Approach: `native_comparison_pair_fixture` builds `WORK/payloads` as a fresh
one-commit repository from the working tree's installer inputs (`install.sh`,
`VERSION`, `CHANGELOG.md`, `Distribution/src`). It uses the same copy routine
as `WORK/source`, factored once in the fixture, with the fixture's identity and
clock. `native_comparison_fixture_baseline` is that commit, and
`native_comparison_fixture_rule` commits onto it. Update the fixture header.

Trace consumers: pairs line 34 compares the baseline tree against
`source_dir`; it moves to the payload repository. The refresh test tags the
baseline and recovers with `--payload-repo` in both repositories, and the
incomplete test reads `baseline`. Run
`node .claude/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . --base HEAD`
with terms such as `native_comparison_fixture_baseline` and `WORK/payloads`.

Proof: one check in `native-comparison-pairs.sh` (or the fixture's consuming
test that fits best). It builds a scratch source checkout whose working tree
holds an uncommitted marker in a payload file, runs the fixture on it, and
requires the frozen baseline commit's file to carry the marker. The planning
observation showed this check fails today. Then the three journeys run green.
No recorded input or case file changes here.

### 3. Catalog host selection names qualified hosts only
Type: Behavior
Status: planned
Proof: The entry's credential-free catalog checks, with negative host filters.

Behavior: cases qualified natively on Codex only → a maintainer runs
`--list --where hosts=cursor` or `--where hosts=claude` → no case is listed and
the command fails, while `--where hosts=codex` still selects both, and
`hosts=codex --where workflow=blocked` still selects `paused-supplier`. The
listing still shows each case's unqualified hosts, so the scope limit stays
visible.

Approach: in both `case.md` Selection sections, `hosts` names only qualified
hosts, for example `codex (qualified natively 2026-11-14)`. Move `claude,
cursor` to their own trait, for example `unqualified hosts: claude, cursor
(no native observations yet)`. Update the trait lists in the catalog header,
the entry header and `native-comparison.md`, and the entry's trait-name check
(line 176) if it names the new trait. `case.md` is outside case identity, so
records and recovery are unaffected; confirm with `--recover` on both records.

Proof: in `Distribution/evaluation/tests/native-comparison/native-comparison.sh` default mode, add
`--where hosts=cursor` and `--where hosts=claude` as nonzero, listing nothing,
beside the existing positive checks. The planning observation showed the
negatives fail today.

### 4. The runner owns per-turn command and harness facts
Type: Structure
Status: planned
Proof: The incomplete journey's `unknown` check, both cases' credential-free proofs (including their harness-inspected counterexamples), and the family's journeys green.

Behavior: every turn the runner runs records `turn-N-commands` and
`turn-N-harness-inspected` from the runner, after its status, thread and
seconds. A turn whose stream is not complete records `unknown` for both,
never `0` or `false`. Field names, completed-turn values and both assessors
are unchanged, and effort still counts only observed turns: an `unknown`
count is never summed.

Approach: `native_comparison_turn` prints both fields from the stream it
classified, using the run's harness pattern plus the case's optional
addition (for example `case_harness_paths='init\.d|test-runs'` in Doughnut's
`case.bash`). Remove the two fields and the HARNESS argument from both
`case_observe` functions and from the runner's case contract header. Update
`native-comparison-pair-observe.sh` if it would sum a non-numeric count, and
the case-contract text in `Distribution/evaluation/comparison.md`.

Proof: in `native-comparison-incomplete.sh`, the stopped candidate arm's
turn 2 (truncated stream) records `turn-2-commands: unknown` and
`turn-2-harness-inspected: unknown`, and its partial effort line is
unchanged (lines 112-119). The planning observation showed the reader
yields `0` and `false` there today. The existing harness counterexamples
(`native-comparison-paused-supplier.sh` 128,
`native-comparison-doughnut-title-precedence.sh` 87) now exercise the
runner's fields and stay green.

This slice changes the runner and both `case.bash` files, recorded inputs
and case identity. Afterwards, rerun `--recover` on both kept records and
confirm they are byte-identical. No agent-facing case input changes, so no
paid run. Keep the runner under the 250-line check together with Slice 1's
growth; if it would pass, settle a cohesive reorganization first.
