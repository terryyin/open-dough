# Retained correction preparation evidence

Findings were first verified at `6a2931f8` under the earlier `native-comparison-*` names and
retraced on 2026-11-19 at `86c4e9647` (Native guidance checks layout); see
[Retrace at 86c4e9647](#retrace-at-86c4e9647). Line numbers in the 2026-11-14 rows
refer to the earlier files.

## Source and provenance

Bounded retrospective correction of the delivered
native A/B comparisons story
(SEED-346#run-native-ab-comparisons-on-real-work, at
`caeb237278b6dff869fb08e325d9d435e37e58c0:.planning/seeds/SEED-346-native-ab-comparisons.md`), executed through
plan 618 (`caeb237278b6dff869fb08e325d9d435e37e58c0:.planning/slice-plans/618-native-ab-comparisons/PLAN.md`; see its Learnings
and `source-review.md` beside it). Reviewed commits: `03634c3e`, `e4c7cbe3`,
`9c20a808`, the relocation part of `27ad2f0f`, `ff3ce589`, `6a2931f8`; the
repair `e8e5eac2` is unrelated. Findings were verified at HEAD `6a2931f8`
(CI on it was pending at review time) and re-observed during this planning.

## Current findings

1. **Arm services outlive their arm.** The runner
   (`Distribution/evaluation/src/native-comparison-run.sh`) calls a case's
   `case_cleanup` only on its normal path (lines 185-187). A failed
   `case_materialize` ends as `unstarted` with `exit 0` (153-156), and an
   interrupted run ends without cleanup; the entry's EXIT trap removes the work
   directory but stops no process. The Doughnut case starts the arm's MySQL
   server (`case_database_start`, `case.bash` 110) before `migrateTestDB`
   (113-115), which can fail, so each such arm leaves an orphan `mysqld`. This
   breaks the original restriction "isolate arm writes from each other and live
   projects to prevent contamination" and its G2 isolation and cleanup.
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
5. **Each case reads per-turn facts the runner already has.** Both
   `case.bash` files end `case_observe` with the same two fields, read from
   the turn stream the runner just classified: `turn-N-harness-inspected`
   (paused-supplier 217-218, Doughnut 227-229, which only adds
   `init\.d|test-runs` to the runner's harness pattern) and `turn-N-commands`
   (219-220 and 230-231, `wc -l` of the stream's commands). The runner passes
   its harness pattern in only for this (`case_observe`'s HARNESS argument).
   A missing or truncated stream yields `0` commands and `false`, so an
   unreadable value would read as an observed zero, while the guide promises
   "Nothing unknown is counted as zero". Today a stopped turn skips
   `case_observe`, so the defect is latent, but every new case would copy it.
   Plan 618 recommended moving both facts into the runner; on 2026-11-14 Terry
   adopted that recommendation into this correction.

## Existing solution and architectural direction

The correction follows the
[native comparison guide](../../../Distribution/evaluation/comparison.md)
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
- **Interrupt handling and observation:** `Distribution/tests/test-runner/test-runner-interrupt.sh`
  is the project's pattern for interrupt journeys (`set -m` own process group,
  a FIFO no one writes, ready markers). `Distribution/tests/helpers/wait-for.bash`
  is the sanctioned bounded wait for an observable condition.
  `scripts/owned-process-group.bash` already owns process-group signalling.
  The supervisor (`native-run-supervise.sh`: `native_run_owned`,
  `native_run_terminate_group`) already owns the host command's process group
  for its deadline. An interrupted arm stops its host session through that
  same owner. Do not add a second process tracker.
- **Per-turn host facts:** the runner's `native_comparison_turn` already
  owns the turn stream, its classification, status, thread and seconds, and
  the harness pattern. It records the command count and harness inspection
  beside them. A case adds its own controller paths to the pattern through
  one optional case value instead of re-reading the stream.
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
| `--where hosts=cursor` and `hosts=claude` select both cases (Slice 2 discrimination) | Bash 5 `native-comparison.sh --list --where hosts=cursor`, `hosts=claude` and `hosts=codex`. Each listed `doughnut-title-precedence` and `paused-supplier`. **True.** |
| The kept records recover to `9c20a808` (preserved promise, baseline) | `native-comparison.sh --recover <record>` for both records: `record-history: unchanged since 9c20a808…`, `case-basis-revision: 9c20a808…`, `recovery: pass`, rc 0. Recovery searches history by recorded hashes, so later edits to the runner (a recorded input) do not move it. |
| The two cases' command and harness fields differ only in Doughnut's extra pattern (Slice 3 moves them unchanged) | Read at `55da0eec`: paused-supplier `case.bash` 217-220 and Doughnut 227-231 print the same two fields from `native_host_stream codex STREAM commands`; HARNESS is used nowhere else in either case. Field names stay, so both assessors' `harness` signal, `native-comparison-pair-observe.sh` (reads `turn-N-commands`) and the kept records' grammar are unaffected. **Settled.** |
| A missing or truncated stream reads as an observed zero today (Slice 3 discrimination) | Bash 5.3, sourced `native-host-stream.sh` and `native-observation.sh`, on a nonexistent stream and on a stream cut mid-JSON in the job scratch: reader rc 0, `wc -l` gives `0`, `native_harness_inspected` gives `false`. **True; the planned `unknown` check discriminates.** The incomplete journey's stopped arms (`native-comparison-incomplete.sh` 112-119) already hold such streams. |
| Test conventions | `node .claude/skills/dough-execute-plan/scripts/test-entry-rules.mjs --project . --source <path>`: `native-comparison.sh`, `-pairs.sh` and `-incomplete.sh` resolve `makeMe: true`. The fixture and runner resolve `makeMe: false` but follow their consuming tests' MakeMe convention (AGENTS.md "Test automation"). Resolve any new test path the same way before authoring. |

| Correction outcome / preserved promise | Owning slice and observable proof |
| --- | --- |
| Cleanup runs whenever materialization started: failed materialization | 1: stand-in case journey; the sentinel is stopped and the observations name the cleanup |
| Cleanup runs on maintainer interrupt, single journey and concurrent pair | 1: interrupt journeys; sentinels stopped, entry exits with the signal status, nothing of the arm left |
| An interrupted arm's host session stops before its work directory is removed | 1: each interrupt journey asserts that every arm's stand-in `codex` process group is gone, observed before the entry removes `work` |
| Doughnut arm server stopped after a failed migration | 1: runner contract (above) plus Doughnut's credential-free proof calling `case_cleanup` on a partially materialized stand-in arm |
| Host selection matches qualified hosts only | 2: entry's credential-free catalog checks; `hosts=cursor` and `hosts=claude` select nothing (nonzero), `hosts=codex` still selects |
| The runner records each turn's commands and harness inspection, `unknown` when its stream cannot show them | 3: incomplete journey asserts the stopped turn's `unknown` fields and unchanged partial effort; both cases' harness counterexamples and the family journeys stay green with no case printing either field |
| Kept records byte-identical and recoverable | 1, 2 and 3 (the slices touching recorded inputs or case files): `git diff --exit-code` on every tracked record and `--recover` on the three `.txt` records, each recovering its recorded case basis with rc 0 |

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
  `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh Distribution/evaluation/tests/native-guidance-checks/*.sh Distribution/evaluation/tests/native-harness/*.sh`
  (the guidance-check and native-harness families, including the new cleanup
  test from Slice 1 on). Also run the consumer trace for each slice, the
  `--recover` and `git diff --exit-code` check of the kept records after every
  slice, and `npm run --silent lint`, or `npm run --silent format` before it.
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
- Slice-plan refinement was not needed. The three remaining outcomes are
  independent, each with its own proof loop and one shared owner per concern
  (runner, entry and supervisor; case traits; runner turn facts). There is no preparatory
  Structure and no special-case machinery: cleanup is a runner guarantee for
  every case, the copy routine is shared, and the catalog stays generic.
- Slice 1 includes the arm's host session (finding 4). The coordinator
  widened the story's Scope on 2026-11-14. Both host-session stops and case
  cleanup share the one interrupt path, so this adds no slice.
- Remaining slice-specific concerns: none identified. Slice 1 carries the most
  design (signal handling across foreground and background arms, through the
  supervisor's existing group ownership). Its constraint is observed above and
  bounded by the 250-line check and the `native-run-owned.sh` consumer trace.

## Retrace at 86c4e9647

Observed 2026-11-19 in this workspace at `86c4e9647a107ba29cf11ebd971f8b12b99db362`
(trunk had no later change to these paths), Homebrew Bash 5.3. Scratch work ran
under the job's temporary directory and was removed.

| Premise and consuming operation | Observation and result |
| --- | --- |
| Finding 2 (pair fixture freezes the committed HEAD) still holds | Scratch `git clone --shared` with an uncommitted marker appended to `Distribution/src/skills/dough-execute-plan/SKILL.md`; ran `native_comparison_pair_fixture` from `tests/native-guidance-checks/support/native-comparison-pair-fixture.sh`. The frozen baseline's file carried the marker (count 1). **Resolved on trunk** by `c4259d055` (payloads built by `Distribution/tests/support/release-source.mjs` from the working tree); dropped from the story's scope. |
| Finding 1: unstarted paths and interrupts skip cleanup | Read: `native-guidance-check-run.sh` 109-130 end failed materialization and a refusing `case_prepare_run` with `exit 0` before `case_cleanup` (160-162, normal path only); the entry's traps (92, 112, 150) only remove `work`. **Unchanged; the refused-route path is a new instance.** `case_cleanup` exists in Doughnut and `launch-command-tests` (`case-environment.bash`). |
| Finding 4: the host session survives an interrupt | Read: plain `native_run_owned` (`native-run-owned.sh` 34-53) sets no INT/TERM trap. `native_run_owned_controlled` (75-127, used when a case supplies `native_run_controller_command`, today supplier-watch) already stops both groups on INT/TERM, returns 130/143 and restores the caller's traps, proven by `native-guidance-check-inflight.sh` 68-91. **Holds for the plain route; the controlled route is the reusable owner.** The runner then continues to assessment after such a turn instead of ending. |
| Slice 2 discrimination | `native-guidance-check.sh --list --where hosts=cursor` and `hosts=claude` each listed doughnut-title-precedence, launch-command-tests, paused-supplier and unblocked-supplier, rc 0; `hosts=codex` listed those and supplier-watch. **True.** |
| Slice 3 discrimination | Sourced `native-host-stream.sh` and `native-observation.sh`: a missing stream and one cut mid-JSON each gave `commands=0`, `harness=false`. **True.** It is now live, not latent: supplier-watch's `case_observe_stopped` runs `supplier_case_observe` on a stopped turn's stream. `launch-command-tests` prints neither field. |
| Kept records recover | `native-guidance-check.sh --recover` on the three `.txt` records: rc 0 each; the two `20261114T045440-*` records give `case-basis-revision: 9c20a808…`, `20261114T102744-1921.txt` gives `764c4e0f…`. |
| Saved baselines' material inputs | `jq .inputs` on `launch-command-tests` and `unblocked-supplier` `comparisons/20261117-codex-baseline.json`: both include `native-guidance-check-run.sh`, `-turn.sh`, `native-run-supervise.sh` and `native-run-owned.sh`, plus their `case.bash` or `supplier-fixture.sh`. `native-comparison-baseline-applicability.mjs` treats these as material, so this correction ends their reuse (accepted consequence in the plan). |

