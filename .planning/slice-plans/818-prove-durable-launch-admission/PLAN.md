# Prove durable launch admission through the typed attempt owner

**Identity:** SEED-413#renovate-later-dashboard-backend-unit-test-families
**Source:** [Prove durable launch admission through the typed attempt owner](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-later-dashboard-backend-unit-test-families)

## Goal and scope

Give maintainers fast, compile-time-checked proof that launch admission keeps
the exact request before effects, respects closure during that write, and
admits concurrent starts according to story identity. Move these four cases
in two specs to Node Vitest.

- `dashboard/backend-tests/launches/launch-attempt-admission-close.spec.ts`
- `dashboard/backend-tests/launches/agent-launch-cross-server-accept.spec.ts`

The effort is limited to these two test files. HTTP admission, native launch
and installed start retain their proof in `agent-launch-acceptance.spec.ts`,
`agent-launch-duplicate.spec.ts` and the installed-project launch plan.
Session composition, change-wait, settlement, reconciliation, Story Notes
and final runner retirement have their own scope in the seed.

## Current decisions

- Use the production `LaunchAttemptOwner.accept(request, run)` and
  `keptAttempts()`. The HTTP adapter uses that same owner through
  `AgentLaunches.accept`. The case's contract begins at durable admission,
  where the owner needs the typed request, the file-backed machine evidence
  and a typed `AttemptRun` to observe effects. Reuse the actual lock,
  acceptance checks and JSON file. Compose requests and pre-existing attempts
  with MakeMe. This needs no production seam change.
- Use the [direct testability](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
  North Star topics. Keep the disposable home, process coordination and
  synchronization in the cases. Reuse MakeMe data builders. Add no support
  wrappers. The existing HTTP acceptance suite retains its own fixtures.
- [ADR 0002, direct domain mapping](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
  and [ADR 0008, Dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  keep the launch request and attempt in the shared contract and the
  evidence machine-local. [ADR 0010, definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  requires comparing useful coverage and maintenance cost as well as time.
  Keep all four regression observations and account for the cost of a real
  second process where it supplies independent lock ownership.

## Baseline and decisive premises

Measured at `a31b7eee9` on 24 November 2026 in the established preparation
worktree, Node 24.21.0, macOS on AC power, load roughly 5. Run the maintained
backend command at two workers with the same selection before and after.

```sh
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES \
  OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$proof_file" \
  OPEN_DOUGH_DASHBOARD_BACKEND_TIMES="$times_file" \
  /usr/bin/time -p npm run --silent test:dashboard:backend -- \
  'launches/(agent-launch-cross-server-accept|launch-attempt-admission-close)\.spec\.ts$' \
  --workers=2
```

Use fresh paths for both outputs. The Playwright baseline passed all four
cases. Close took 444 ms, the lock recheck took 1,706 ms, same-story contention
took 1,988 ms and distinct stories took 1,239 ms. The run took 5.39 s elapsed
and 5.38 summed case-seconds.

| Consuming operation | Observation in the preparation checkout | Result |
| --- | --- | --- |
| The Node Vitest close case can hold a real attempt-file replacement and observe the live owner close | Same runner, environment and worker count, filtered to disposable `launch-attempt-admission-probe.spec.ts`. A Vitest module mock delegated to the actual `node:fs/promises` exports and gated only `rename` to the attempt file. It called `owner.close()` while held and then allowed the real replacement to finish. | Passed in 9 ms, with recovery evidence and zero effect calls. Removing the post-write close check produced an accepted answer and failed the assertion. Direct namespace spying was refused by Node ESM. Use the observed module-mock seam. |
| The contender can reach the real store recheck in a separate process under Vitest | Same disposable spec. The minimal Node child loaded the production owner with `--experimental-transform-types --disable-warning=ExperimentalWarning --input-type=module` and received the MakeMe request over the process boundary. Its first real `EEXIST` at the attempt lock sent an IPC cue. The parent wrote a MakeMe pending refinement before releasing the lock. | The child refused with `already-starting`, ran no effects, and the file held the first attempt. Passed in 254 ms. Removing the locked check's freshly held attempts made the contender answer `accepted` and failed the assertion. |
| Independent owners can check same- and different-story requests under the same runner | The same disposable spec started a Vitest owner and a separate Node owner against one attempt file, with independently supplied MakeMe execution and refinement requests and outstanding launch callbacks. | The same story yielded one acceptance and one effect in 220 ms. Different stories yielded two acceptances and two effects in 238 ms. The mutation run isolated the lock and close observations. All four cases passed again after restoring production, in 1.35 s elapsed and 0.72 summed case-seconds. |

The scratch edits were reverted. These observations settle the proof route
and justify sizing. Measure the finished cases independently before claiming
a delivered improvement.

## Ordered slices

### 1. Keep recoverable evidence when the owner closes during admission

Type: Behavior
Status: done
Proof: `launch-attempt-admission-close.spec.ts` runs on Node Vitest. A
MakeMe ad hoc request reaches the real attempt-file replacement. Hold that
rename, close the same owner and release the actual rename. Check that
`accept` returns the closed-admission refusal, the effect callback is never
called, and `keptAttempts()` reads the accepted request with its attempt ID
and no result. Release the gate and drain the owner before tearing down its
disposable home. The assertion fails if the post-write close guard is
removed.

Estimated active work 8–12 minutes.

Accepted proof: the focused backend runner selected one Node Vitest case and
passed in 9 ms. The case holds the actual rename, closes the owner, then
checks the refusal, zero callback calls, a nonblank attempt ID, the exact
request and no outcome in `keptAttempts()`. Removing only the post-write
close guard in a detached checkout produced `accepted` and failed the
refusal assertion. Dashboard typecheck passed. The checkout's
`open-dough/evidence` holds the `slice-1-*` records and `slice-1-return.md`.
After the formatter flagged the callback and asymmetric matcher, the
equivalent typed callback and refusal assertions passed in 13 ms.
The change is confined to the subject spec and the two promise gates follow
the existing in-case synchronization convention. No refactor candidate arose.

### 2. Enforce story-specific admission across independent writers

Type: Behavior
Status: done
Proof: `agent-launch-cross-server-accept.spec.ts` runs on Node Vitest with
its three distinct observations. Feed MakeMe execution and refinement
requests to the existing attempt owner, with optional effects observed at
its callback. Use a minimal Node subprocess where a separate machine-store
writer or reader is part of the fact. Use a private shared home, explicit
IPC for synchronization and the real attempt-file lock. Keep each admitted
run pending through the competing request, then end the processes and clean
their home.

- When the contender has reached the held lock, keep the first pending
  refinement using a MakeMe attempt and release the lock. The contender
  answers `already-starting`, runs no effect and leaves the first attempt as
  the sole kept request.
- For overlapping execution and refinement of the same story, one owner
  accepts, one refuses with `already-starting`, one callback starts and the
  store keeps the winner's request. The assertion permits either owner to
  win.
- For overlapping requests for different stories, both owners accept, both
  callbacks start and the store keeps both story identities.

The locked recheck case fails when it cannot consult the attempts newly
kept under that lock. The other cases retain the independent one-story and
two-story outcomes.

Estimated active work 10–15 minutes.

Accepted proof: the maintained backend runner selected three Node Vitest
cases for this file and passed. The lock cue comes from a real `EEXIST`.
Removing freshly kept attempts from the locked conflict check in a detached
checkout produced `accepted` and failed the `already-starting` assertion.
The two overlapping cases held the accepted runs open through the competing
request and checked the kept winner or both story identities. Dashboard
typecheck passed, including the child entry in the same typed spec.

The two-worker selection passed all four cases on Node 24.21.0 on macOS AC.
Mean one-minute load at launch was 14.95 compared with about 5 for the
preparation run, which limits a like-for-like timing comparison.

| Observation | Playwright baseline | Node Vitest |
| --- | ---: | ---: |
| Close during admission | 444 ms | 63 ms |
| Recheck under the held lock | 1,706 ms | 609 ms |
| Same-story contenders | 1,988 ms | 569 ms |
| Distinct-story contenders | 1,239 ms | 637 ms |
| Summed case time | 5.38 s | 1.878 s |
| Elapsed | 5.39 s | 3.65 s |

The close case meets the campaign target of about 100 ms. Each contention
case includes starting an independent Node process and loading the same owner.
A separate three-sample probe measured 540–712 ms from fork to readiness at
load 16.98. These samples show the cost of process startup in this profile.
The checkout's `open-dough/evidence` holds `slice-2-return.md`, its run
records, the combined selection and timings, and the lock mutation witness.
Independent refactor review found no candidate after inspecting the typed
IPC boundary, lock cue and child shutdown. The accepted proof still applies.
The full formatter produced 251 lines. A delivery follow-up consolidated the
duplicate distinct-story assertions, preserving one acceptance and effect
per owner and both kept identities. The 249-line spec passed the affected
focused case. Its separate run is `slice-2-file-size-refactor.log.run.json`.

## Concern evidence

Slice-plan refinement was unnecessary. The two slices exercise one
production owner with independent shutdown and contention contracts.
The scratch runs demonstrated both proof routes. The contention cases took
220–254 ms including the separate process in this profile. Report the
finished cases' cost against the campaign target of about 100 ms per case.
No remaining slice-specific concerns were identified.

## Verification and delivery

- Local gate uses the maintained
  [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos),
  `caffeinate -s -i` on AC power. Apply the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Keep the default timeout and select MakeMe for the backend sources.
- Run each focused slice with the maintained backend runner. After slice 2,
  rerun the combined baseline command, confirm both specs select Vitest, and
  record individual times, case count, summed case time and elapsed time.
  Account for the case-specific costs still needed to reach a real lock.
- Run `npm run typecheck:dashboard` to prove the new entry is exercised with
  checked inputs and `npm run lint -- --staged` for the changed sources.
  Search consumers of any retired helper imports before deleting code and
  reuse the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  if a shared effect changes. A slice that reaches a shared production or
  fixture boundary reruns the proof for that boundary before delivery.

## Execution context

- Story Branch Mode. Julia-chan owns the established worktree
  `.worktrees/prove-durable-launch-admission-through-the-typed` on
  `codex/prove-durable-launch-admission-through-the-typed`. The integration
  checkout is `/Users/terryyin/git/open-dough` and the trunk target is `origin/main`.
- Publisher `dashboard-territory.local-open-dough`. The starting revision is
  `698cbd33cead3c23ff51f211896a26d48f609d32`. The accepted claim and first
  published story-branch base are `f4bd0d8c5d57f22de27d721b8501b1c1c589a170`.
- Slice 1 was accepted on the remote story branch at
  `6d1ea9be8941fd7862346841ba10f16313b33efe` and registered with the observer.
- Slice 2 was accepted on the remote story branch at
  `05d3c39844908d23a08e009ef74720f5812b73ef` and registered with the observer.
- Locked `npm ci` and `npm run typecheck:dashboard` succeeded in the execution
  checkout on Node 24.21.0. Retain the existing planning authority for overruns.
- GitHub Actions `ci.yml` (`CI`) on the remote story branch. Codex observer
  `julia-chan-c609a25e`, directory `/tmp/dough-ci-501/watch-KlkXuy`, PID `98709`,
  shell session `6241`, cell `g209:13`.
