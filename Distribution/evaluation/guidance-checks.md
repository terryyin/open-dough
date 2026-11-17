# Native guidance checks

A Native guidance check runs a versioned example from real work in a fresh
native host session and judges whether Open Dough guidance led to the intended
decision and proof. `Distribution/evaluation/src/native-guidance-check.sh` is
the entry. It is maintainer tooling; nothing here is installed in a client
project. `npm test`, CI and the entry's default mode never start a real host;
paid sessions run only when a human asks for them. Put Bash 5 first on PATH
(`PATH=/opt/homebrew/bin:$PATH` on macOS) for every command below.

Each case lives in `Distribution/evaluation/cases/guidance-checks/<case>/`:
`case.md` (origin, extraction, selection traits, measured durations and kept
observations), the neutral `task.txt` (and `wake.txt` for later turns), the
fixture and observer `case.bash`, and the separate assessor `assess.bash`,
which never reaches the agent's workspace.

## Procedure

1. Select a case whose traits match the guidance under question.
2. State the criteria before running: the decision and proof the guidance
   should produce and what would count as a wrong outcome (the basis).
3. Pin the inputs and settings: payload commit, host, model and effort.
4. Run one journey, or a [pair](comparison.md#run-a-pair) when two variants
   are compared.
5. Inspect the produced code and proof, not only the assessor's verdict.
6. Retain reusable evidence: a kept record or a
   [baseline](baselines.md), and remove spent raw attempts.

Both procedures were demonstrated on 2026-11-17: the effort-derived
[launch-command-tests](cases/guidance-checks/launch-command-tests/case.md#native-qualification)
(its own first baseline, reviewed code and residue) and
[unblocked-supplier](cases/guidance-checks/unblocked-supplier/case.md#repeat-on-2026-11-17)
(its own completion, once and proof criteria). A comparison needs a matched
task and basis: reuse a case's own frozen baseline only under the
[sufficiency rules](baselines.md#compare-another-candidate-with-saved-evidence),
or observe both arms fresh. An extracted case never treats the whole-story
runs it came from as its baseline. An interrupted journey stays incomplete;
the entry never retries it.

## Redo the source phase for an uncovered finding

When no case exercises the moment a retained finding concerns, one short
native redo of the phase where it occurred gives a first decision on a
proposed guidance change before a case is extracted or the change is adopted:

1. State the criteria before running: the intended gain, two to four concrete
   criteria, what would count as a wrong outcome, and the moment the session
   must reach.
2. Name the baseline: the source execution's recorded commits and returns, or
   an applicable [saved baseline](baselines.md), unchanged. List each mismatch
   in host, model, effort, release and task.
3. Pin the inputs: a scratch clone outside this repository at the source
   revision, with a local bare repository as its only remote. Commit the
   candidate guidance into the installed skill copies that revision's host
   reads, re-expressed for that revision's paths.
4. Run one fresh native session with the source phase's own instruction under
   a stated deadline. Give it no prior outcome, finding text or comparison
   purpose, and send it nothing afterwards.
5. Read first whether the session reached the moment, then inspect the
   produced files and proof against the criteria.
6. Return keep, revise or drop for the change, or inconclusive with the
   missing evidence; separately say whether extracting a case is worthwhile.
7. Record the result as the finding's follow-up note, and remove the scratch
   clone and raw session.

One run supports revise or drop when the wrong outcome appears under the
candidate, and inconclusive when the moment is not reached or a mismatch
decides the reading. Keep is a predicted benefit within the observed context
under [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md),
not an observed improvement.

## Select a case

```sh
Distribution/evaluation/src/native-guidance-check.sh --list
Distribution/evaluation/src/native-guidance-check.sh --list --where hosts=codex --where workflow=blocked
Distribution/evaluation/src/native-guidance-check.sh --list --where prerequisites=nix
```

`--list` prints each case's traits from its `case.md` Selection section:
workflow, hosts, prerequisites, decisions-and-proof and duration. Each
`--where TRAIT=TEXT` keeps the cases whose trait contains TEXT, ignoring case.

| Case                        | What it exercises                                                                                                         | Preparation and run, as measured on 2026-11-14                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `paused-supplier`           | hold a blocked slice through a diagnostic pass, an unchanged wake and an early publication, then continue once with proof | under 2 s; four turns of about 20 min per arm                                                       |
| `unblocked-supplier`        | discover the already-completed supplier and finish the same partial execution once, with no event wakes                   | 1.7 s; one turn of 15 min                                                                           |
| `doughnut-title-precedence` | calibrate a real project's maintained proof against a plausible fault                                                     | about 1–1.6 min and 4.5 GB per arm, with Nix, network and an arm-owned MySQL; one turn of 10–15 min |
| `launch-command-tests`      | refactor launch-command tests after a real product change, including an unchanged E2E consumer                            | 38 s; one turn of 14 min, 17 min with observer proof and probes                                     |

These are single observations at host load about 3–16, not cost estimates.

## Run one journey

One journey of a case, with this checkout's working tree as the payload
(arms live under `TMPDIR`, which must exist):

```sh
mkdir -p "$HOME/tmp/native-guidance-checks"
PATH=/opt/homebrew/bin:$PATH TMPDIR=$HOME/tmp/native-guidance-checks \
  Distribution/evaluation/src/native-guidance-check.sh --native codex --case paused-supplier \
  --model gpt-6.1-sol --effort xhigh --results-dir "$HOME/tmp/native-guidance-checks-results"
```

Supported hosts, sandbox constraints and refusals are in the
[comparison guide](comparison.md#supported-conditions).

## Add a case

Extract a case from a real decision with its proof: keep its source session or
replay, project revision, extraction recipe, starting state, neutral task,
setup and separate assessor. Keep the smallest context that still requires the
original judgment; a controlled event or scripted proof must replace waiting,
not the decision being measured. Keep expected answers in the assessor and
`case.bash` controller, never in the agent's workspace, and leave the project's
ordinary requirements and tests available to the agent.

Before a case informs a comparison, qualify it natively: one journey must show
the intended decision and its proof, and a plausible wrong decision must fail
the assessor as a rejected case. Record measured preparation and native
durations in `case.md`, labelling older timings as historical. Reuse the
family's runner, payload installation, host supervision and stream helpers;
recover earlier cases through Git rather than a separate registry.

## Credential-free checks

`npm test` runs the default mode (the catalog), each case's own proof
(`native-guidance-check-<case>.sh`), substitute pairs and the pair judge's
rejected cases (`native-comparison-pairs.sh`), refusals and incomplete pairs
(`native-comparison-incomplete.sh`) and refresh and recovery
(`native-comparison-refresh.sh`). Substitute hosts prove the runner,
observer, assessors and judge; they never stand in for native behavior.
`native-comparison-baselines.sh` also exercises frozen capture, export and
reassessment after raw cleanup, complete failures and insufficient proof.
