# Close native comparison harness gaps

**Source:** [correction story](../../seeds/SEED-346-native-ab-comparisons.md#close-native-comparison-harness-gaps)
**Identity:** SEED-346#close-native-comparison-harness-gaps

## Source and provenance

Bounded retrospective correction of the delivered
[native A/B comparisons story](../../seeds/SEED-346-native-ab-comparisons.md#run-native-ab-comparisons-on-real-work)
(SEED-346#run-native-ab-comparisons-on-real-work), executed through
[plan 618](../618-native-ab-comparisons/PLAN.md) (completed; see its Learnings
and `source-review.md` beside it). Reviewed commits: `03634c3e`, `e4c7cbe3`,
`9c20a808`, the relocation part of `27ad2f0f`, `ff3ce589`, `6a2931f8`; the
repair `e8e5eac2` is unrelated. Findings were verified at HEAD `6a2931f8`
(CI on it was pending at review time) and re-observed during this planning.

## Current findings

1. **Arm services outlive their arm.** The runner
   (`Distribution/tests/support/native-comparison-run.sh`) calls a case's
   `case_cleanup` only on its normal path (lines 185-187). A failed
   `case_materialize` ends as `unstarted` with `exit 0` (153-156), and an
   interrupted run ends without cleanup; the entry's EXIT trap removes the work
   directory but stops no process. The Doughnut case starts the arm's MySQL
   server (`case_database_start`, `case.bash` 110) before `migrateTestDB`
   (113-115), which can fail, so each such arm leaves an orphan `mysqld`. This
   breaks the original restriction "isolate arm writes from each other and live
   projects to prevent contamination" and its G2 isolation and cleanup.
2. **Free pair checks test the committed HEAD, not the working tree.**
   `native_comparison_pair_fixture` (`native-comparison-pair-fixture.sh` 66-67)
   clones `source_dir` for payloads with `baseline=HEAD`, and
   `native_comparison_fixture_rule` writes its substitute rule into HEAD's
   `Distribution/src/skills/...`. The pair, refresh and incomplete journeys
   therefore pass or fail on committed payload content. This produced branch CI
   run 43562552359's failure after a local pre-commit pass (plan 618 Learnings).
   Under [the project's failure policy](../../../AGENTS.md#failing-and-flaky-tests),
   a local/CI difference is a test-environment defect.
3. **Host selection names unqualified hosts.** The catalog
   (`native-comparison-catalog.sh` 37-39) keeps a case when a trait contains the
   filter text. Both `case.md` files read
   `hosts: codex (qualified natively); claude, cursor: not qualified`, so
   `--list --where hosts=cursor` (or `claude`) lists both cases and exits 0.
   This contradicts the original key example 1, which selects by host tags, and
   the scope limit "Cursor and Claude Code remain unqualified until their own
   observations are obtained".
4. **An interrupted arm's host session keeps running.** Found during this
   planning (premise rows below). After every interrupt form that ended the
   entry, the arm's host command (the substitute `codex`, in the process group
   the supervisor owns through `scripts/owned-process-group.bash`) kept running
   while the entry removed its work directory. A real arm would keep a paid
   Codex session writing into a deleted workspace. This breaks the same
   isolation restriction as finding 1. On 2026-11-14 the coordinator, as the
   correction's author, widened the correction story's Scope to cover it.

## Goal and scope

A maintainer running native comparison cases gets three fixes. Arm-owned
processes are stopped when materialization fails or the run is interrupted:
both the services a case started and the arm's host session. The
credential-free pair, refresh and incomplete journeys install payloads from
the working tree they are about to commit. Catalog host selection names only
qualified hosts.

**Exclusions (route as advice, not this correction):** moving each case's
`turn-N-commands` and `harness-inspected` facts into the runner; moving
`delivery_evidence_install_payload` to a neutral module; the repository-wide
symlinked "is main module" check.

**Preserved promises and constraints:**

- The two tracked records
  `Distribution/tests/native-comparison/*/comparisons/20261114T045440-*.txt`
  stay byte-for-byte, and `--recover` on each still recovers case basis
  `9c20a8086fe48e2bd60f283f478607440a057216` with `recovery: pass`.
- Paid native runs stay manual-only. This correction needs no paid run: every
  proof is deterministic, and no agent-facing case input (task, wake, overlays,
  assessor) changes.
- Every family test stays credential-free. Case identity excludes `case.md` and
  `comparisons/` (`native-comparison-basis.sh` 30).
- Runner, case-agnostic contract: `case_cleanup` stays optional and prints its
  own fields. Paused-supplier defines none and is unaffected.

## Existing solution and architectural direction

The correction follows the
[native comparison guide](../../../Distribution/tests/native-comparison.md)
and plan 618's architecture: one case-agnostic runner, an entry, a catalog, and
fixtures for the credential-free journeys. No new module or registry.
Accepted ADRs
[0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(one cohesive owner, reuse) and
[0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
(deterministic counterexamples, native evidence on demand) apply. No conflict
was found.

PFE (existing owners to reuse):

- **Cleanup ownership** stays in the runner, which already owns a journey's
  lifecycle and the optional `case_cleanup` hook. Every case gains the
  guarantee, not just Doughnut. Doughnut's `case_cleanup` already handles a
  partially materialized arm (no pid file prints `no-database-server`; a started
  server with an unknown `mysqladmin` path falls back to `kill`), so
  `case.bash` (232 lines) is not expected to change.
- **Interrupt handling and observation:** `Distribution/tests/test-runner-interrupt.sh`
  is the project's pattern for interrupt journeys (`set -m` own process group,
  a FIFO no one writes, ready markers). `Distribution/tests/helpers/wait-for.bash`
  is the sanctioned bounded wait for an observable condition.
  `scripts/owned-process-group.bash` already owns process-group signalling.
  The supervisor (`native-run-supervise.sh`: `native_run_owned`,
  `native_run_terminate_group`) already owns the host command's process group
  for its deadline. An interrupted arm stops its host session through that
  same owner. Do not add a second process tracker.
- **Working-tree copy:** the pair fixture already copies the working tree's
  harness paths into a fresh one-commit repository (`git ls-files --cached
  --others --exclude-standard`, skipping deleted files, fixed fixture identity
  and clock). The payload repository reuses that same routine, factored once in
  the fixture, over the installer's inputs: `install.sh`, `VERSION`,
  `CHANGELOG.md` and `Distribution/src`. The same input set is used by
  `git_publication_installer_input_hash_lines` and `native-identity-source.mjs`.
- **Catalog:** stays generic. The `hosts` trait is corrected to name only
  qualified hosts, and unqualified hosts move to their own trait. One meaning
  per trait keeps "contains TEXT" filtering correct without a special-cased
  matcher.

## Outside-in proof and decisive premises

Observations made 2026-11-14 at HEAD `6a2931f83513331165d4819ba71abc4e5e01860e`.
Scratch work ran under owned `$TMPDIR/plan621.*` directories and was removed,
along with every leftover process. Interpreter: Homebrew Bash 5.3.20.

| Premise and consuming operation | Observation (form, profile) and result; unverified remainder |
| --- | --- |
| A failed materialization leaves a process the case started running (Slice 1 failure journey) | Bash 5 entry `native-comparison.sh --native codex --case standin --results-dir …` on a scratch copy of the harness. Stand-in `case_materialize` started a background sentinel and then failed, with a tripwire `codex` on PATH. Result: `unstarted: the case could not be materialized`, entry rc 1, sentinel still running. **True; the proof discriminates.** |
| An interrupt leaves case-started processes running (Slice 1 interrupt journey) | Same entry, single journey. The substitute `codex` touched a ready marker, then blocked on a FIFO, and the sentinel ignored INT, TERM and HUP. Results: INT to the entry's process group (Ctrl-C form) gave entry 130, sentinel alive. TERM to the group gave 143, sentinel alive. TERM to the entry alone gave 143, sentinel alive. INT to the entry alone left the entry blocked (bounded at 60 s). In each of the three forms that ended the entry, the substitute `codex` (owned host process group) was also still running. **True for every form, for both the case service and the host session.** A sentinel that does *not* ignore TERM died from the group TERM by itself: the proof's sentinel must ignore the delivered signals, so only cleanup stops it. Pair-mode interrupts were not run, see the next row. |
| Arm subshells can run cleanup when signalled (Slice 1 approach) | Bash 5.3 scratch: an async `( … ) &` subshell ran its own INT trap and its own TERM trap (exit 143). Asynchronous arms are not deaf to INT. Bash defers the parent's trap while a *foreground* child runs, but `wait` on a background job is interruptible. A single journey (foreground subshell) or sequential arms therefore need the entry to hand the signal to the arm and wait for its cleanup before the EXIT trap removes `work`. This is a design constraint, not a remaining unknown. |
| The arm can reach its host's owned group when interrupted (Slice 1 host-session stop) | Read at `6a2931f8`: `native_run_owned` (`native-run-supervise.sh` 96-126) starts the host in its own group, keeps that group in a function-local `pgid`, and starts a background watchdog. It then blocks in `wait "${pid}"`, which a trap can interrupt. A trap firing there runs in that function's context, so `pgid` and `watchdog` are visible to it. Both are arm-owned processes the interrupt must stop. Bash 5.3 scratch: a TERM trap set inside a background arm subshell fired during a function's `wait "$pid"` and printed that function's locals (`pgid=4242 watchdog=77`), with arm status 143. A trap set in the *parent* did not carry into a `&` subshell, which died on TERM's default action. So the trap belongs inside the arm subshell. **Settled.** |
| Doughnut's `case_cleanup` stops a server left by a failed migration (Slice 1 reaches the Doughnut impact) | Bash 5 `set -euo pipefail`, sourced `doughnut-title-precedence/case.bash`. `ROOT/mysql/mysql.pid` named a live stand-in process and `case_mysql_admin` was empty. Result: `cleanup: database-server-killed`, process stopped. **True with no case change.** A real `mysqld` shutdown is not re-observed. It was observed as `database-server-stopped` in plan 618's paid pairs, and the code path is unchanged. |
| The pair fixture freezes the committed HEAD, not the working tree (Slice 2 discrimination) | Scratch `git clone --shared` of this checkout at `6a2931f8` with an uncommitted marker appended to `Distribution/src/skills/dough-execute-plan/SKILL.md`. `native_comparison_pair_fixture` was run on it. Result: baseline = `6a2931f8…`, and the marker count in the frozen baseline's file was 0. **True; the planned check discriminates.** |
| The installer's inputs are `install.sh`, `VERSION`, `CHANGELOG.md` and `Distribution/src` (Slice 2 payload repository) | Those paths only, copied from the scratch working tree (`git ls-files --cached --others --exclude-standard`). Ran `bash install.sh --target <git repo> --source <copy> --platform codex --force`, the form `delivery_evidence_install_payload … --force` uses on the arms' `git archive` copies. Result: rc 0, hooks registered, and the installed `SKILL.md` carried the working-tree marker. **True.** |
| `--where hosts=cursor` and `hosts=claude` select both cases (Slice 3 discrimination) | Bash 5 `native-comparison.sh --list --where hosts=cursor`, `hosts=claude` and `hosts=codex`. Each listed `doughnut-title-precedence` and `paused-supplier`. **True.** |
| The kept records recover to `9c20a808` (preserved promise, baseline) | `native-comparison.sh --recover <record>` for both records: `record-history: unchanged since 9c20a808…`, `case-basis-revision: 9c20a808…`, `recovery: pass`, rc 0. Recovery searches history by recorded hashes, so later edits to the runner (a recorded input) do not move it. |
| Test conventions | `node .claude/skills/dough-execute-plan/scripts/test-entry-rules.mjs --project . --source <path>`: `native-comparison.sh`, `-pairs.sh` and `-incomplete.sh` resolve `makeMe: true`. The fixture and runner resolve `makeMe: false` but follow their consuming tests' MakeMe convention (AGENTS.md "Test automation"). Resolve any new test path the same way before authoring. |

| Correction outcome / preserved promise | Owning slice and observable proof |
| --- | --- |
| Cleanup runs whenever materialization started: failed materialization | 1: stand-in case journey; the sentinel is stopped and the observations name the cleanup |
| Cleanup runs on maintainer interrupt, single journey and concurrent pair | 1: interrupt journeys; sentinels stopped, entry exits with the signal status, nothing of the arm left |
| An interrupted arm's host session stops before its work directory is removed | 1: each interrupt journey asserts that every arm's stand-in `codex` process group is gone, observed before the entry removes `work` |
| Doughnut arm server stopped after a failed migration | 1: runner contract (above) plus Doughnut's credential-free proof calling `case_cleanup` on a partially materialized stand-in arm |
| Free pair, refresh and incomplete journeys test the working tree's payload | 2: an uncommitted working-tree payload change reaches the frozen baseline payload; existing pair, refresh and incomplete journeys stay green on the new fixture |
| Host selection matches qualified hosts only | 3: entry's credential-free catalog checks; `hosts=cursor` and `hosts=claude` select nothing (nonzero), `hosts=codex` still selects |
| Kept records byte-identical and recoverable | 1 and 3 (the slices touching recorded inputs or case files): `git diff --exit-code` on both records and `--recover` on both, `case-basis-revision: 9c20a808…`, `recovery: pass` |

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
  interrupt paragraph of `Distribution/tests/native-comparison.md`.

Proof: a new test (recommended `Distribution/tests/native-comparison-cleanup.sh`,
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

Proof: in `Distribution/tests/native-comparison.sh` default mode, add
`--where hosts=cursor` and `--where hosts=claude` as nonzero, listing nothing,
beside the existing positive checks. The planning observation showed the
negatives fail today.

## Current decisions, verification and concern review

- Follow [the project's failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written for every local and published failure and in every delegation and
  repair handoff. Reproducing a failure on the base is attribution, not an
  exemption. Preserve an exact active repair owner's files and report that
  remaining gate instead of duplicating it. CI on a revision this execution
  publishes is its to diagnose and repair through the applicable final CI;
  never rerun until green.
- Before changing a test, resolve its source path through installed
  dough-makeme (`test-entry-rules.mjs`, above). No browser test is involved.
  Never sleep or wait for wall-clock time: wait on an observable event (FIFO,
  ready marker through `wait-for.bash`). Never use `test.slow()`. Keep the
  default timeouts with no suite, file, group or hook override.
- Focused proof per slice:
  `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh Distribution/tests/native-comparison.sh Distribution/tests/native-comparison-pairs.sh Distribution/tests/native-comparison-refresh.sh Distribution/tests/native-comparison-incomplete.sh Distribution/tests/native-comparison-paused-supplier.sh Distribution/tests/native-comparison-doughnut-title-precedence.sh`,
  plus the new cleanup test from Slice 1 on. Also run the consumer trace for
  each slice, the `--recover` and `git diff --exit-code` check of both kept
  records after Slices 1 and 3, and `npm run --silent lint`, or
  `npm run --silent format` before it.
- A new test job changes the CI deal. Preview it with
  `node scripts/test-shares.mjs preview` at CI's current split count
  ([test shares](../../../Distribution/tests/test-shares.md)) before
  publishing. This is the reason for that one broader local check.
- Local gate: no whole-suite run is required by this plan. Run any long or
  full local run under the
  [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
  on AC power, wrap it in `caffeinate -s -i`. On battery, plug in, or start
  fully awake with the lid open under `caffeinate -i` and read
  `pmset -g log | grep -E 'Entering Sleep|Wake from'` afterwards.
  [Resource admission](../../../Distribution/tests/local-test-resources.md) applies.
- No paid native run. No agent-facing case input changes, and the paid
  baseline (`database-server-stopped` in plan 618's Doughnut pairs) still covers
  the normal cleanup path.
- Slice-plan refinement was not needed. The three findings are independent
  outcomes, each with its own proof loop and one shared owner per concern
  (runner and entry, pair fixture, case traits). There is no preparatory
  Structure and no special-case machinery: cleanup is a runner guarantee for
  every case, the copy routine is shared, and the catalog stays generic.
- Slice 1 includes the arm's host session (finding 4). The coordinator
  widened the story's Scope on 2026-11-14. Both host-session stops and case
  cleanup share the one interrupt path, so this adds no slice.
- Remaining slice-specific concerns: none identified. Slice 1 carries the most
  design (signal handling across foreground and background arms, through the
  supervisor's existing group ownership). Its constraint is observed above and
  bounded by the 250-line check and the supervisor consumer trace.
