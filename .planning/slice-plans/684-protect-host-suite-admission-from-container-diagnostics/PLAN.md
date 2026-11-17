# Protect host suite admission from container diagnostics

**Source:** [selected story](../../seeds/SEED-375-keep-container-diagnostics-from-replacing-host-suite-admission.md#keep-container-diagnostics-from-replacing-host-suite-admission)
**Source review:** [source commitments](source-review.md)
**Identity:** SEED-375#keep-container-diagnostics-from-replacing-host-suite-admission

## Goal and scope

Contributors can run the existing Linux container diagnostic while a host
worktree owns full-suite admission. The diagnostic returns its checks' verdict;
the exact host owner record survives until its successful release. Host suites
continue to serialize and recover stale owners.

Cover the plain pathless and selected-check entry points, preserving the
dashboard diagnostic, runtime/path refusals, mounts, host identity, isolated
dependencies and cached image behavior. Do not suppress admission release
errors. General namespace-aware ownership, scheduling diagnostics against each
other, new machine resource limits and admission-record migration are outside
this delivery. No installation or release of shared guidance is required.

## Existing solution and direction

PFE traced the admission responsibility across `scripts/test.sh`,
`scripts/local-test-suite.mjs`, `scripts/local-test-processes.mjs`,
`dashboard/tests/support/runnerConfig.mjs`, and `scripts/ci-container.sh`.
Host repository and browser groups already share one common-Git ref. Both
admission callers already skip it under `CI`; the helper's dashboard path
already sets `CI=true`. Reuse that CI behavior at the plain container entry
point rather than introducing another owner schema, ref or bypass variable.

Set `CI=true` on the plain diagnostic's runner invocation. This also selects
the existing CPU-derived CI job default; explicit job overrides remain the
runner's responsibility. The diagnostic is meant to reproduce CI's platform
and behavior. Its previous documented `CI`-unset behavior has no independent
product restriction requiring local admission or the four-job local default.
Update [the diagnostic guide](../../../Distribution/tests/ci/ci-container.md)
and the helper's explanation together. Leave the host admission algorithm and
its strict release check intact.

This is a local command behavior correction under existing responsibilities,
not a new product-wide architectural choice. The
[ADR index](../../../docs/adrs/README.md) and
[North Star](../../NORTH-STAR.md) supply no conflicting direction; no ADR or
North Star change is needed. Expected edits are the 170-line helper, 116-line
diagnostic guide, and a new focused test and any necessary fixture support.
The existing 174-line container capture test need not gain a second harness.
Apply the 250-line cohesive-file check if the actual edits grow these files.

## Decisive premises and retained observation

Observed in this owned preparation workspace at
`b315ec7680d2554a1fe414131cb927cd68641b9c`, 2026-11-17, before planning writes.

| Premise and consuming operation | Form and profile observed | Result and remainder |
| --- | --- | --- |
| A plain pathless diagnostic can steal a live host owner; the proposed entry-point change prevents it | `DOCKER_CONTEXT=colima node .seed-375-scratch/repro.mjs`: disposable main repository and linked worktree inside this owned workspace; host `node scripts/local-test-suite.mjs repository ...` holds admission; linked worktree runs real `bash scripts/ci-container.sh` without paths | Baseline: diagnostic 0, host 1 with `Could not release local test-suite admission.`, original ref lost. Scratch `CI=true exec bash ...` at the plain entry: diagnostic 0, exact ref unchanged before host release, host 0, ref absent afterwards. No namespace-protection premise remains unobserved. |
| Diagnostic failure remains its own verdict with the same change | Same real helper and image, with the fixture's selected shell check exiting 7 | Diagnostic runner 1, exact host ref unchanged before release, host 0, ref absent afterwards. |
| Existing host admission proof reaches waiting, release and stale retirement; CI diagnostics preserve the established helper contract | `PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 bash scripts/test.sh Distribution/tests/ci/ci-container.sh Distribution/tests/ci/ci-container-workflow.sh Distribution/tests/support/local-test-suite.test.mjs Distribution/tests/support/local-test-suite-lifecycle.test.mjs Distribution/tests/support/local-test-suite-focused-runners.test.mjs` | Exit 0. Inspected `repositoryAtAdmissionGate` observations, exact ref assertions, released waiter entry, and predecessor-state assertions after failure/signals/SIGKILL. Container tests observe refusals, consumed Docker recipe and arguments, cache reuse and workflow agreement. These tests do not execute the container entry; the new test owns that gap. |

The disposable replay copied the real runner using `copy_runner`, the real
helper, Node version and package lock. It provided one shell check under
`Distribution/tests/probe/`, an empty evaluation directory, a passing stub for
the unrelated self-installation check, and a file-controlled host child. The
fixture removed `package.json`'s prepare hook because it contains no hook
installer. These substitutions do not affect admission or the diagnostic's
runner verdict. Assertions read the exact ref immediately after the diagnostic,
before permitting the host child to exit. The failure variation changed only
the shell check's exit status. The baseline and remedy therefore discriminate
at the promised boundary. The historical DD-432 command remains unknown.

Runtime was Colima Docker 29.5.2, 8 CPUs/15.58 GiB, cached image
`open-dough-ci:2835799436`, Ubuntu 24.04, Node v24.21.0 and Git 2.56.0.
Default Docker context was unreachable; explicit `DOCKER_CONTEXT=colima`
reached the real engine without changing its global selection. Before launch,
the VM's existing containers used about 4.4 GiB, one at about 17% CPU; host
load was 19.24/12.33/10.85 on a 48-GiB machine. Chosen workload was one tiny
diagnostic at a time with cached dependencies and no browser/full product
suite. Scratch repositories, wrapper edits and their module volume were
removed. This is retained preparation evidence, not execution completion.

## Outside-in proof and consumers

| Promise | Owner and observation |
| --- | --- |
| Pathless plain diagnostic preserves a live host's exact owner and successful release | Slice 1: new `Distribution/tests/ci/ci-container-admission.test.mjs` executes the actual helper's entry through a Docker boundary stand-in, real runner and disposable Git/admission fixture; observe the same ref before release and host success afterwards. Also replay once on real Colima for the PID-namespace boundary. |
| Diagnostic reports its passing or failing checks | Slice 1: same journey with success and deliberate check failure; assert the caller's exit status and check execution, with host ownership unchanged in both cases. Cover selected-check invocation too. |
| Host full suites serialize and stale owners retire surviving processes | Slice 1: retain the three existing host admission test files named above, including repository/browser sharing and focused/CI independence. No change to their ownership contract. |
| Existing dashboard checks, runtime/path refusals, mounted Git and dependency isolation, cached image and workflow alignment remain | Slice 1: `Distribution/tests/ci/ci-container.sh` and `ci-container-workflow.sh`; inspect the unchanged dashboard entry and its existing `CI=true` contract. |
| Diagnostic's documented profile matches what runs | Slice 1: guide and script comment review against the executed plain/dashboard entry and the runner's CI defaults. |

The helper's entry is a shell program handed to Docker, so an argument-capture
assertion alone cannot prove the admission promise. The new unit proof must
execute that entry, substituting Docker and dependency acquisition only at
their external boundaries; keep real Git, the runner and admission/release.
Its fixture must force attempted host admission to be observable (for example,
a hidden host identity in the runtime stand-in), so removing the plain CI
assignment fails the test rather than quietly waiting or passing. Do not
substitute the promised preservation, set `CI` in the fixture, copy the entry
string into the test, or silence release errors. Keep bounded observations and
teardown under the existing fixture/process owners.

Trace the changed CI effect through the plain runner's admission and CPU job
default, invoked checks and the diagnostic guide. Existing host tests clear
inherited CI for local scenarios and explicitly exercise CI behavior. Existing
container tests capture rather than execute the entry; their green result is
preservation proof only. Execution retains the full consumer-trace record and
adds newly reached consumers before acceptance.

## Ordered slices

### 1. Container diagnostics leave the host's suite admission intact
Type: Behavior
Status: done
Proof: all promise rows above, including the new entry-executing regression,
its failure with the plain CI assignment removed, and a real Colima replay.

Behavior: a host suite owns admission in a disposable repository and a linked
worktree starts an established plain container diagnostic whose namespace
cannot observe the host PID → the diagnostic runs its checks independently,
returns their verdict, and never changes the host owner ref; the host can
then release successfully. Other host full suites still wait or recover stale
ownership under the existing contract.

Include the entry-point change, focused proof, guide update and implicated
cleanup together. Reuse `local-test-suite-fixtures.mjs` / the repository builder
and `copy_runner` where suitable; add only fixture capabilities the regression
needs. The test selector resolved the new CI test, existing container test and
host admission sources to `makeMe: true`, `pageObjects: false`; apply the
installed MakeMe convention to domain fixtures. Keep external runtime capture,
expected verdicts and observation signals outside builders. No browser test is
being authored. No `test.slow()` or suite/file/group/hook timeout override.

Sizing: one cohesive entry-point rule and one regression journey with passing
and failing outcomes, existing host regression proof and a short guide change
fit one 15-active-minute slice; command time is separate. There is no preceding
Structure slice or interim behavior. The cumulative design remains one CI
admission rule, with no additional namespace policy.

Accepted proof (2026-11-17): the plain entry runs `scripts/test.sh` with
`CI=true`; guide and helper header agree. The focused gate above plus the new
`ci-container-admission.test.mjs` passed (passing pathless, failing pathless,
selected); removing the plain `CI=true` failed both pathless cases at the exact
ref assertion. Real Colima replay, pass and fail variants, kept the exact host
ref until release and the host exited 0; scratch volumes were removed. The
refactor pass exported the fixtures' `launch` for the diagnostic run, rerunning
only the new test. Commitments C001–C017 are observed in
[source-review.md](source-review.md). Learnings: Colima mounts only home paths,
so a real-runtime fixture needs `TMPDIR` under home; a pathless runner fixture
must create `Distribution/evaluation/tests`, which Git does not keep empty.

## Local gates and current decisions

- Focused gate: the five-file command in the premise table plus the new
  `Distribution/tests/ci/ci-container-admission.test.mjs`. Run the whole CI
  feature group if the changed fixture/entry reaches additional CI consumers.
  Use the repository's normal formatting and staged lint hook. A planning-only
  change does not make a whole product suite a local gate.
- Real-runtime gate: use the explicit reachable Colima context, one tiny
  disposable pathless diagnostic at a time, with a live host owner and pass/fail
  checks; observe the ref before releasing the host. Reuse the same profile
  above. Reconsider resources if that workload/runtime changes; do not run the
  full product suite merely to prove admission. Never borrow this repository's
  live host ref for the experiment.
- For any long/full macOS run, start fully awake; on AC use `caffeinate -s -i`.
  On battery plug in, or use `caffeinate -i` with lid open and inspect the sleep
  log afterwards, under [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- All failing/flaky checks follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Slice-plan refinement was not needed: one cohesive outcome, mapped proof,
  observed decisive premises and no fragmented structure.
- Remaining slice-specific concerns: none identified in this review. No human
  decision or early probe is required before execution; future execution still
  needs its own instruction and fresh runtime availability check.

## Execution complete

Product advice: no product change. This delivery resolves
[DD-432](../../../docs/maintainer/project-test-findings.md#dd-432); wrap-up
settles that finding's catalog entry.
