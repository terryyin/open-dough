# Source review

Launch: a fresh general-purpose reviewer without conversation inheritance,
2026-11-17, before the first implementation delegation. Input: only the seed
story's Goal and Scope for SEED-393#guidance-check-participants-run-owning-proof
and the plan's original correction input (the three participant-report
findings: `processGroup.ts:185` undefined `ps` stdout, the too-long GitHub-owner
socket path under `$HOME/tmp/native-guidance-checks/...`, and the observer-only
31/0 and 4/0 results). No plan slicing, product, proof or suspected omission.

Unnumbered context returned: environment failures currently hide whether the
participant verifies its change; the observer's 31/0 and 4/0 are not
participant proof; no historical product/test repair, no other host, no paid
native session; the plan owns findings, examples, decisions and proof.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C1 | The participant can run the owning backend proof through startup and teardown; teardown no longer fails at `processGroup.ts:185` from undefined `ps` stdout; shown credential-free through the real materialization and native sandbox wrapper. | slice 1 | observed: Distribution/evaluation/tests/native-guidance-checks/native-guidance-check-launch-command-tests-environment.sh (private ps first on PATH and not setuid; starting backend through native_codex_wrap counts_are 28/0 with zero skip/flake/global error; original ps EPERM) and Distribution/evaluation/tests/native-guidance-checks/native-guidance-check-launch-command-tests-environment-protective.sh (protective backend 28/0); focused 8-test run exit 0 at load 42-50, 2026-11-17 20:22 |
| C2 | The participant can run the owning E2E proof through startup and teardown; startup no longer rejects the GitHub-owner socket path as too long under the native guidance-check tmp workspace; shown credential-free through the real materialization and native sandbox wrapper. | slice 1 | observed: Distribution/evaluation/tests/native-guidance-checks/native-guidance-check-launch-command-tests-environment-e2e.sh (starting E2E through native_codex_wrap 0/4, each at Received length: 5, zero skip/flake/global error), Distribution/evaluation/tests/native-guidance-checks/native-guidance-check-launch-command-tests-environment-protective-e2e.sh (4/0 startup and teardown) and the EndpointBinding short-root/long-root path-too-long witness in Distribution/evaluation/tests/native-guidance-checks/native-guidance-check-launch-command-tests-environment.sh; same focused run |
| C3 | The case's task stays unchanged. | slice 1 | observed: git status/diff empty for Distribution/evaluation/cases/guidance-checks/launch-command-tests/task.txt at slice 1 acceptance |
| C4 | The frozen project and overlay stay unchanged. | slice 1 | observed: git status/diff empty for Distribution/evaluation/cases/guidance-checks/launch-command-tests/overlay/ and the pinned case_revision line in case.bash at slice 1 acceptance |
| C5 | The observer stays unchanged. | slice 1 | observed: case.bash diff at slice 1 acceptance only sources case-environment.bash and calls case_environment_prepare in case_materialize; case_observe, case_observe_proof, case_run_specs and their fields are unchanged |
| C6 | The probes stay unchanged. | slice 1 | observed: git status/diff empty for Distribution/evaluation/cases/guidance-checks/launch-command-tests/case-probes.bash at slice 1 acceptance |
| C7 | The assessor stays unchanged, and so does the way participant proof is assessed. | slice 1 | observed: git status/diff empty for Distribution/evaluation/cases/guidance-checks/launch-command-tests/assess.bash at slice 1 acceptance; no assessment input or field changed |
| C8 | The committed baseline stays unchanged. | slice 1 | observed: git status/diff empty for Distribution/evaluation/cases/guidance-checks/launch-command-tests/comparisons/20261117-codex-baseline.json at slice 1 acceptance |
