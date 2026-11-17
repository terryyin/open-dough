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

Keep the correction in the case's materialization/environment lifecycle.
The unchanged shared wrapper already supports writable arm roots and protects
sibling source/runtime paths. Give this case a private, usable process-listing
tool and short private temp paths; export that environment before native start
so resumed turns and the observer inherit it. Own generated tools, aliases and
temp cleanup in that same case lifecycle, including partial setup failure.
There is no demonstrated need to change the shared wrapper or arm allocator.
At `fc5bfc051`, `case.bash` is 118 lines; an environment helper may keep its
fixture and observation responsibilities clear. No expected edit is already
oversized. This adds no new runner or host adapter.

[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) supports
deterministic environment proof while reserving native claims for native
observations. [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
bounds the benefit to the observed environment. No Accepted decision conflict
or new North Star direction is identified; its current dashboard host/launch
topics do not govern this fixture correction.

## Decisive premises and preparation evidence

Observed 2026-11-17 in this owned checkout at `fc5bfc051`, Codex CLI 0.169.0,
Node 24.21.0, macOS. No model, credentials or native session was used.
The fixture uses the real `case_materialize`, frozen `4b75c2888` project and
committed overlay, and current payload; only the existing protective reference
is applied in the disposable arm when the row names it.

Literal observation (run from the owned preparation checkout):

```sh
PATH=/opt/homebrew/bin:$PATH caffeinate -s -i /opt/homebrew/bin/bash \
  .planning/slice-plans/676-guidance-check-participants-run-owning-proof/observe-environment.bash
```

The [script](observe-environment.bash) copies the source at HEAD, then uses
sibling protected-source and work/arm trees. It calls
`native_codex_prepare ARM SOURCE` and asserts real isolation is enabled.
The consuming commands are `npx playwright test --config CONFIG --reporter=json
SPECS`, with both backend spec paths or the E2E path from the case, through
`native_codex_wrap env` with the private PATH/TMPDIR. Reports live inside the
wrapper's writable temporary root. Test assertions and default timeouts are
unchanged; no serial tail may be accepted as a pass.

| Consuming operation, form and profile | Result and remaining limit |
| --- | --- |
| Wrapped Node `spawnSync("ps", ["-axo", "pid=,pgid=,stat="], {encoding:"utf8"})` with the original tool | `EPERM`, null status, undefined stdout. A complete backend negative run without the private tool reached 26 passes and two teardown failures at `processGroup.ts:185` (`stdout.split`); global cleanup also reported `ps failed (EPERM)`. It stranded workers and was interrupted after 122.4 s, then its four owned worker/server processes were terminated. The retained recipe repeats the direct tool negative rather than stranding workers again. |
| Private copy of `/bin/ps`, `chmod 755`, `codesign --force --sign - COPY`, private bin first on PATH; full wrapped backend commands | Starting tests and the existing protective reference both pass 28/0, zero skips/flakes/global errors, successful teardown. This replaces the earlier tool-only smoke observation. |
| Short alias to a private temp parent, whose generated endpoint roots are real children; full wrapped E2E command with the protective reference | All four cases pass, zero skips/flakes/global errors, browser/dashboard/private GitHub startup and teardown complete. The private process tool remains enabled. |
| Same corrected environment, unchanged starting tests; full wrapped E2E command | 0/4, zero skips; each reaches the preserved `Received length: 5` assertion. No environment error substitutes for the intended starting-state failure. |
| Same protective reference/tool, long canonical TMPDIR instead of the short alias; full wrapped E2E command | 0/4, zero skips; the page reports that published work could not be read and shows no Taken/Backlog entries. A separate invocation of the pinned `EndpointBinding.directory()` with the same long/short root forms confirms `path-too-long` for the long root and a socket path within 103 bytes for the short one, without a gh executable or stored login. The short-path browser journey above passes. |
| Real wrapper attempts `touch SOURCE/.forbidden` on disposable protected source | Write denied and no file created. Runtime protection is unchanged and stays owned by native-wrapper proof; no write is attempted on the actual runtime. |
| Observation exits | Owned fixture, generated tool, and short alias were removed on successful and failed observation EXIT paths. Final inspection found zero scratch roots and zero fixture-owned Node children. Setup-failure cleanup for the eventual maintained implementation remains slice-1 acceptance. |

The old scratch launch failures were observation artifacts, not additional
runner defects. Its empty fake project folders let Git walk into this owned
worktree and report its changes; its extensionless CommonJS fake host scripts
inherited this repository's `type: module`, causing `Illegal return statement`.
The corrected owned observation bounds Git ancestor discovery with
`GIT_CEILING_DIRECTORIES=WORK` and adds `{"type":"commonjs"}` at its private
temp parent. These compensate for nesting the observation inside a repository:
the actual runner's temp tree outside a Git/Node project has neither ancestor.
They do not change any historical project, test, fake host, task, or overlay.
The earlier report path outside writable TEMP_ROOT is corrected too. Source
protection is enabled throughout the successful observations.

The complete positive/starting-state sequence at 10:15 UTC returned backend
28/0 in 10.6 s, starting E2E 0/4 at its exact argv assertion in 14.9 s,
protective backend 28/0 in 7.4 s, and protective E2E 4/0 in 13.2 s. All had
zero skips/flakes/global errors. The boundary-only repeat uses the same script
with `--boundaries-only`; it reuses those complete journey results and repeats
source protection, original-tool denial, long-path browser failure and the
pinned endpoint witness. Its 10:18 UTC run completed with exit 0; the intended
long-path E2E counterexample was 0/4 in 18.8 s, with no skips/flakes/global
errors. Source writes were denied and both endpoint outcomes matched. The
long-path page error is generic, so its observing
assertion names that error and the separate endpoint witness owns the cause.

Before the full sequence: 16-core Mac on AC, 73% memory free; load initially
21.69/19.60/14.01, falling to about 8.8 before complete positive journeys.
Other machine work was visible. Chose sequential groups with the unchanged
two-worker default and `caffeinate -s -i`, using the roughly 9–18-second group
observations. Reconsider on renewed contention or failures; raise no timeout.
The wrapper is exercised by real child commands; this establishes environment
feasibility, not that a paid native participant chooses to run its proof.

## Current decisions

- Use the demonstrated case-private environment: writable short temp paths
  and a non-setuid, ad-hoc-signed copy of the real process-listing tool on
  macOS, with cleanup owned by the case. Keep actual process observations;
  never substitute synthetic process tables or weaken source/runtime isolation.
- Keep private endpoint roots as real children of the short alias, not a
  symlink root (the endpoint owner refuses the latter). Bound fixture ancestor
  discovery if setup can be nested in a Git/Node project. These are fixture
  environment choices, not repairs to the historical project or tests.
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
15-active-minute budget excluding command time. Diagnosis and a complete
passing route are now observed; work is bounded to case setup/cleanup and its
regression proof/docs. Keep them together because the outcome is one usable
participant environment. Apply execution's sizing/escalation rule to any new
cause. Do not hide setup or weaken historical assertions.

## Verification and preparation assessment

Apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Select test conventions before authoring: existing shell evaluation
checks select MakeMe, not page objects. The scratch reference's E2E selects
both; backend selects MakeMe only. No maintained historical test change is in
scope.

Local gate: changed case/wrapper checks through `bash scripts/test.sh`, including
`native-guidance-check-launch-command-tests.sh`, `…-e2e.sh`, `…-probes.sh` and
`…-assessor.sh`, then `npm run test:evaluation`. The broader gate is justified
by the case's exported environment, fixture callers and hash-bound inputs.
Use the real macOS wrapper for the owning backend/E2E environment regression;
portable checks alone cannot claim its sandbox behavior. Keep wrapper/resume
checks as reused unchanged proof unless implementation actually changes that
shared owner. Long checks use
the maintained [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos),
fully awake, `caffeinate -s -i` on AC. Reuse unaffected proof. No paid
qualification; ordinary execution refactoring, delivery and CI duties apply.

Slice-plan refinement was not needed: one bounded environment journey with
settled diagnosis, mapped proof and no independent outcome to split. One slice
is within the eight-slice limit. This review identifies no remaining
slice-specific or cumulative-design concern, and no human-owned pre-Take
decision. The observed complete route settles the previous readiness blocker;
record ready against this current story and plan. Preparation implements no
product correction and starts no execution.
