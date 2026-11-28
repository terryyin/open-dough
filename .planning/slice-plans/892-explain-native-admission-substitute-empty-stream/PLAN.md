# Explain and repair an empty native admission substitute stream

**Identity:** SEED-349#explain-native-admission-substitute-empty-stream
**Source:** [Story](../../seeds/SEED-349-native-admission-substitute-empty-stream.md#explain-native-admission-substitute-empty-stream)

## Goal and scope

Name why the substitute host occasionally admits the claim and then leaves an
empty stream in `git-publication-native-admission-correction.sh` and
`-investigation.sh`, and repair that cause with a test that fails first, or
show with evidence that it lies outside this repository. Excluded: other
load-sensitive jobs and the 180 s job deadline unless the cause is shared,
real (paid) native host runs, and any change to what the assessor accepts as
a complete stream.

## Current decisions

- Slice 1 is an early probe; its result chooses slice 2's content and stops
  the plan when it finds no recurrence (story example 4). A recurrence whose
  record names a cause outside this repository (example 3) replaces slice 2
  with recording that evidence in the story.
- The probe's scratch script and logs live in the session's job tmp, not in
  the repository; only the cause, its evidence excerpt and the load profile
  go into this plan's Learnings.
- The scripts/test.sh runner does not pass arbitrary exported variables to a
  check (premise P2), so a scratch fault must be a file edit in the owned
  workspace, reverted before any commit.
- Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written; carry this link into every delegation and repair handoff.

## Decisive premises

Observed 2026-11-28 at `f68589ec5` in this workspace (Node 24.21.0, Homebrew
bash 5, macOS on AC under `caffeinate -s -i`, load 7.6).

| Premise / consuming operation | Observation and result |
| --- | --- |
| P1. Both checks run alone through the repository runner in seconds, so a probe can repeat them many times (slice 1) | `caffeinate -s -i /opt/homebrew/bin/bash scripts/test.sh Distribution/evaluation/tests/git-publication/git-publication-native-admission-correction.sh` exited 0 in 14.3 s; the same for `-investigation.sh` exited 0. |
| P2. A failing substitute run prints a host-exit record that names how the host ended (slice 1 reads it) | Scratch `kill -TERM $$` as the first line of `native_admission_substitute` (`Distribution/evaluation/tests/native-harness/support/native-agent-admission.sh`), same command: exited 1 printing `FAIL: substitute codex admission-correction exited 1, assessment fail: incomplete or stale native stream (missing)`, then `host-exit.log` lines `codex pid 34368 after 0.0 s: caught SIGTERM` and `run exited 1 after 1.5 s; native outcome incomplete: missing terminal stream`. Reverted. The same edit guarded by an exported `SCRATCH_TERM=1` stayed green, so the runner does not pass that variable to the check. |
| P3. Load near 2026-11-13's makes a recurrence likely enough to observe in a bounded run (slice 1) | Unverified: the only recurrence came during a full local suite at load 77 and a direct run minutes after; about 570 later targeted runs passed at unrecorded load. Bounded by slice 1, whose no-recurrence result stops the plan. |

## Ordered slices

### 1. Reproduce the empty stream under load and name its cause
Type: Probe (early; no repository change)
Status: planned
Proof: a scratch loop in the job tmp runs eight parallel workers, each
repeating
`caffeinate -s -i /opt/homebrew/bin/bash scripts/test.sh Distribution/evaluation/tests/git-publication/git-publication-native-admission-correction.sh Distribution/evaluation/tests/git-publication/git-publication-native-admission-investigation.sh`,
beside a full local suite (`caffeinate -s -i npm test`, Homebrew bash 5), for
at most 60 minutes, recording `sysctl -n vm.loadavg` each minute and keeping
the output of every failing run. Stop at the first empty-stream failure. A
failure of any other check during the run is attributed under the failure
policy and does not end the probe.

Result: either a failing run's `host-exit.log` lines and the load at that
time, recorded in Learnings with the cause they point to (the command and line
under errexit, the signal and what sends it, a KILL, or a host still running,
read against `native-agent-publication.sh`, `native-agent-admission.sh` and
`Distribution/evaluation/src/native-run-owned.sh`), or the run count, load
range and duration with no recurrence, which stops the plan for Terry's
close-or-wait decision (story example 4; recommendation: close).

### 2. Repair the named cause with a test that fails first
Type: Behavior
Status: planned
Proof: a focused test that induces slice 1's cause deterministically at the
boundary where it arises fails on the unrepaired code with the empty-stream
signature and passes after the repair, run with
`/opt/homebrew/bin/bash scripts/test.sh <its path>` (or the owning npm runner
for a Node test). Then the slice 1 load loop runs the two admission checks
for 20 minutes with no empty-stream failure, and `npm run lint` passes.

Behavior: the condition slice 1 named arises during an admission substitute
run → the run either completes its stream or fails naming that condition,
never an unexplained missing stream (story example 2). The test's layer and
substitutes follow the
[test boundary rule](../../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#choose-the-test-boundary)
once the cause is known.

## Proof map

| Promise | Owner | Proof |
| --- | --- | --- |
| The cause is named from a recurrence or reproduction (examples 1, 3) | Slice 1 | Failing run's host-exit record in Learnings |
| The repair has a test that fails first (example 2) | Slice 2 | Focused test red before, green after |
| The admission checks stay green under comparable load (goal) | Slice 2 | 20-minute load loop without recurrence |
| No recurrence ends with a reported decision (example 4) | Slice 1 | Run count, load range, duration reported |

## Verification and delivery gates

- Before test edits run installed `test-entry-rules.mjs` on exact paths and
  apply [`dough-makeme`](../../../.agents/skills/dough-makeme/SKILL.md).
- Local gates per [AGENTS.md](../../../AGENTS.md): the focused proofs above
  and `npm run lint`. Run long macOS checks from a fully awake machine on AC
  power under `caffeinate -s -i`. Slice 1's full suite is load, not a gate.
- Keep the default test timeout; never `test.slow()`.

## Plan concern assessment

Refinement not needed: one early probe and one repair, each with its own
proof loop. Slice 2's mechanism is unknown until slice 1 names the cause; the
probe bounds that, and its no-recurrence result stops the plan rather than
widening it. No other slice-specific concern.

## Learnings

## Story obligations
