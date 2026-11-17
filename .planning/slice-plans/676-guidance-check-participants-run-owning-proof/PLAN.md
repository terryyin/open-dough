# Guidance-check participants can run their owning proof

**Identity:** SEED-393#guidance-check-participants-run-owning-proof
**Source:** [Guidance-check participants can run their owning proof](../../seeds/SEED-393-test-quality-learning-from-effort-replays.md#guidance-check-participants-run-owning-proof)

## Goal and scope

Give a `launch-command-tests` participant an arm environment in which its
owning backend specs and E2E consumer execute, including startup and teardown.
Correct fixture paths and inherited process environment with credential-free
proof. This preparation authorizes no implementation.

Preserve the neutral task, pinned project and overlay, observer semantics,
probes, assessor and committed baseline. Do not repair historical product/tests,
change guidance, add participant-proof assessment, qualify another host or start
a paid session. A later native repeat requires separate authority. Changed
hash-bound environment inputs establish a future basis; they do not rewrite
the 2026-11-17 observation.

## Provenance and findings

Retrospective correction of
SEED-393#repeat-native-guidance-checks-on-real-story-examples (plan 674;
commits `d178ed635`, `cdad2c608`, `88cef0957`, `de03ea470`, `b37f1932c`).
The kept [Codex baseline](../../../Distribution/evaluation/cases/guidance-checks/launch-command-tests/comparisons/20261117-codex-baseline.json)
passed its observer assessment. Its [participant report](../../../Distribution/evaluation/cases/guidance-checks/launch-command-tests/comparisons/20261117-codex-baseline-response.md)
states that the participant's own proof did not run:

- Backend teardown reached `dashboard/tests/support/processGroup.ts:185`:
  `spawnSync("ps", ["-axo", "pid=,pgid=,stat="])` had undefined stdout.
- E2E startup rejected the GitHub-owner socket path as too long. The arm was
  under `$HOME/tmp/native-guidance-checks/tmp.<random>/nc.<random>/workspace`.
- The observer outside the session passed backend 31/0 and E2E 4/0. These
  are observer results, not participant-executed proof.

The source story's wrap-up disposed the raw session; its excerpts above remain
provenance. Fresh model-free observations below support diagnosis.

## Key examples and outside-in proof

Every row belongs to slice 1. A tool or socket smoke check alone does not
establish that the owning specs execute successfully.

| Precondition → trigger | Required observation |
| --- | --- |
| Real materialized arm and participant environment → run both backend specs through the native wrapper | Tests reach launch assertions and teardown; no denied process listing, skipped serial tail or missing report. |
| Same arm/environment → run `e2e/launches/agent-launch-ad-hoc.spec.ts` | Browser, private GitHub owner and dashboard start; every case reaches its assertions and tears down. |
| Unchanged starting tests → run the credential-free case checks | Backend remains 28/0; E2E remains the intentional 0/4 argv-length mismatch, with `Received length: 5`, not an environment error. |
| Disposable arm receives existing `support/launch-command-tests/protective.diff`, outside any participant → run both groups through the wrapper | Backend 28/0 and E2E 4/0, successful teardown. The reference supplies a known final test state and never enters real participant inputs. |
| Prepared arm → attempt a write to protected source/runtime material, then finish | Protection rejects the write; owned temp roots and generated tools are cleaned on success and failure. |
| Corrected environment → inspect final case bytes and retained inputs | Only environment/setup and its regression proof/docs change; preserved inputs and observer/probe/assessor semantics stay intact. |

## Existing solutions and direction

PFE: `case_materialize` already exports environment needed by commands;
`native_codex_prepare`/`native_codex_wrap` own native isolation, including
resume. Keep those owners. The page-object native runner already assigns a
private `TMPDIR` (`Distribution/evaluation/cases/page-objects/page-object-native-run.sh`).
Reuse that concept, not a new runner or experiment engine.

`Distribution/tests/skills/dough-execute-plan/ci-mailbox-denied-inspection.test.mjs`
already documents sandbox denial of setuid `ps`. Its conservative mailbox
fallback does not supply the historical fixture's actual process-group listing;
changing it would not repair this case. No suitable existing repair was found.

Use the shared sandbox owner only when diagnosis proves that responsibility
shared; keep case-only setup in the case. Candidate homes at `572dc361e` are
`case.bash` (118 lines), `native-codex.sh` (137), and, only if allocation must
change, `native-guidance-check.sh` (186) or `native-guidance-check-run.sh` (182).
None needs oversized-file reorganization. These are candidates, not a patch list.

[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) supports
deterministic environment proof while reserving native claims for native
observations. [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
bounds the benefit to the observed environment. No Accepted decision conflict
or new North Star direction is identified; its current dashboard host/launch
topics do not govern this fixture correction.

## Decisive premises and preparation evidence

Observed 2026-11-17 in this owned checkout at `572dc361e`, Codex CLI 0.169.0,
Node 24, macOS; no model, credentials or native session used.

| Consuming operation, form and profile | Result and remaining limit |
| --- | --- |
| Source `native-codex.sh`; `native_codex_prepare ARM SOURCE`; wrap Node calling `spawnSync("ps", ["-axo", "pid=,pgid=,stat="], {encoding:"utf8"})` | Both `ps` and `/bin/ps`: `EPERM`, null status, undefined stdout. Unwrapped Node succeeds; `/bin/ps` is setuid. Reproduces the reported failure without a model. |
| Same wrapper; private copy of `/bin/ps`, `chmod 755`, then `codesign --force --sign - COPY`, private bin first on PATH | Plain copy is killed; re-signed copy returns status 0, a real nonempty process table and Node's own PID. Proves a smoke check, not backend completion or CLI inheritance. |
| `new EndpointBinding({DOUGH_GITHUB_REQUEST_OWNER_ROOT: ROOT, GH_TOKEN: "isolated-proof-token", GH_HOST: "github.com"}).directory()` through the endpoint module, byte-identical to pinned `4b75c2888` | Root length 119 rejects the socket path; root length 30 through a short alias's real child establishes a 54-byte socket path. A root that is itself a symlink is refused. No login request. Proves endpoint selection, not a browser journey. |
| Real `case_materialize`, frozen protective reference, provisional PATH/private temp alias, then the commands in [observe-environment.bash](observe-environment.bash) | Backend: 0 passed, 2 failed, 26 skipped; initial launch answers `existing-changes`/`failed`. E2E: 0 passed, 4 failed, no Taken session entry; one timeout. Candidate environment is insufficient; causes remain open. |

Literal full-fixture observation:

```sh
PATH=/opt/homebrew/bin:$PATH caffeinate -s -i /opt/homebrew/bin/bash \
  .planning/slice-plans/676-guidance-check-participants-run-owning-proof/observe-environment.bash
```

The retained script is working planning evidence, not an environment fix. It
now returns nonzero on a failed group; the observed version printed failed
verdicts but exited zero. Its fixture is nested in the owned checkout. An
initial prototype protected that ancestor and denied writes to its fixture;
that run is invalid. The reported run omits the explicit protected-source
parameter to avoid this overlap. Default-deny still protects paths outside
scratch roots. This is a proxy for the real runner's sibling source/arm layout,
so its complete journey and protection remain unverified.

Before the run: 16-core Mac, AC, load 5.49/5.64/6.86, 74% memory free; one
other checkout's E2E run visible. Chose sequential backend then E2E under
`caffeinate -s -i`, informed by the case's roughly one-minute group timings.
Reconsider on contention, sleep or new failures; do not raise timeouts.

## Current decisions

- Diagnose the remaining launch failures in the faithful sibling source/arm
  profile before selecting a repair. Distinguish prototype artifacts from
  runner defects; keep regression proof on the environment being repaired.
- Use the smallest environment correction. The copied/re-signed tool is a
  demonstrated possibility, not an adopted implementation. Preserve sandbox
  protection and real process observations.
- Trace changed environment, paths and wrapper behavior through consumers,
  including resume, comparison arms and cleanup. Shared changes need those
  callers' proof; case-only changes do not promise every case.
- Run no model. If only a paid/native observation can settle a remaining
  question, stop that path and name the missing evidence and authority.

## Slices

### 1. Participants execute the case's complete owning proof
Type: Behavior
Status: planned

Behavior: a materialized arm gives participant commands usable native tools
and writable private temp paths within existing isolation; backend and E2E
proof reach assertions and tear down.

Proof: reproduce actual environment failures without a model, then show all
examples above discriminating the repaired environment from its predecessor.
Extend credential-free case checks through the real wrapper. Preserve the
starting-state argv mismatch; pass both groups with the existing protective
reference. Inspect failures and skipped cases, not just exit status. Preserve
protection and cleanup. Record the cause, demonstrated boundary and remaining
native-inheritance limit in `case.md`.

Sizing: one cohesive environment outcome and proof loop, with the shared
15-active-minute budget excluding command time. Diagnosis is a material risk;
apply execution's sizing/escalation rule if it defeats that budget. Do not
hide setup or weaken historical assertions.

## Verification and preparation assessment

Apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Select test conventions before authoring: existing shell evaluation
checks select MakeMe, not page objects. The scratch reference's E2E selects
both; backend selects MakeMe only. No maintained historical test change is in
scope.

Local gate: changed case/wrapper checks through `bash scripts/test.sh`, including
`native-guidance-check-launch-command-tests.sh`, `…-e2e.sh`, `…-probes.sh` and
`…-assessor.sh`, then `npm run test:evaluation`. The broader gate is justified
by shared wrapper/path consumers and hash-bound case inputs. Long checks use
the maintained [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos),
fully awake, `caffeinate -s -i` on AC. Reuse unaffected proof. No paid
qualification; ordinary execution refactoring, delivery and CI duties apply.

Slice-plan refinement was not needed: one cohesive complete environment
journey; repartitioning cannot resolve the observed launch failures.
Remaining slice-1 concern: faithful wrapped backend/E2E success is unobserved,
and the scratch proxy fails before promised launches. Candidate correction
and sizing are not established. Record not-ready until diagnosis and a
matching observation settle these premises. No human-owned scope or pre-Take
decision is identified by this preparation.
