# Prove launch attachment admission in Node Vitest

**Identity:** SEED-413#finish-backend-vitest-renovation-after-launch-options

**Source:** [Prove launch attachment admission in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-backend-vitest-renovation-after-launch-options)

## Goal and scope

Developers changing launch attachments can check upload refusal, filename
encoding, and claim cleanup in plain Node Vitest with a private filesystem.
Move `launch-attachment-boundary.spec.ts` and
`launch-attachment-refusals.spec.ts` off backend Playwright and account for
their six cases. Existing browser journeys retain proof of accepted images
reaching native input in order and surviving startup recovery. Launch option
selection, session-terminal image admission, provider behavior, Story Notes,
and runner retirement keep their own scope. The
[campaign remainder](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-backend-vitest-renovation-after-launch-attachments)
carries future cohorts.

## Current decisions

- Follow the North Star for [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Use [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
  for direct mapping, [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
  for machine-local attachment storage, and [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md#decision)
  for comparable proof and cost.
- Reuse [shared attachment rules](../../../dashboard/src/launchAttachments.ts),
  [image admission](../../../dashboard/server/imageAttachments.ts) and its
  [bounded reader](../../../dashboard/server/boundedRawBody.ts). Both launch
  and session image uploads use this reader, and instruction audio uses the
  bounded reader with its own media rules. Give the reader the headers and
  Node stream it already consumes. Keep size, type, and filename decisions
  with their current owners. The
  [launch adapter](../../../dashboard/server/launchAttachmentBoundary.ts)
  continues to own route, origin, method, cancellation, and sending the
  typed answer. Reuse the same JSON answer metadata for success and refusal,
  preserving no-store for an upload answer that must be read fresh and
  connection close when a refusal precedes a complete request.
- Reuse the [claim owner](../../../dashboard/server/launchAttachmentClaims.ts)
  and its existing directory, conversion, and cleanup policy.
  [Machine home](../../../dashboard/server/machineHome.ts) supplies the
  production dashboard directory. Give the claim operations the directory as
  a typed value wherever the selected tests need isolation. Keep the other
  callers' current defaults and use the same directory for validation,
  materialization, and compensation. The upload limit bounds the amount of
  local storage work and the maximum claim count bounds one launch. Caller
  supplied paths bypass claim ownership and are refused.
- The selector at `7a206c76e` enabled
  [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) on both backend specs.
  Compose the valid launch request with `makeMe.aLaunchRequest.adHoc()`, add
  a builder operation for claims only if the test needs it, and state the
  deliberately invalid path in the case. Use real image bytes and temporary
  filesystem operations in the test. The existing browser journeys select
  [page objects](../../../.agents/skills/dough-page-objects/SKILL.md) and
  MakeMe. Recheck selection if a source path changes. Add zero test-support
  wrappers and remove imports or exports only after checking remaining users.

## Decisive premises

Observed at `7a206c76e` on 25 November 2026 in the owned preparation checkout,
on macOS with Node 24.21.0, AC power, one worker, and dependencies from the
lock-identical integration checkout. The starting load average was approximately
13. Treat results as a single local sample.

| Premise | Consuming operation and observed result |
| --- | --- |
| The maintained backend command selects the complete two-file cohort | The baseline command below ran six Playwright cases, all passed without retries. The mounted upload refusal took 1,321 ms, the two real-file cleanup cases 5 and 14 ms, and the three shared rule cases 2, 1 and 2 ms. Total case time was 1.345 s. Five of six met 100 ms. Selection wall time was 6.63 s. The mounted case observed both status/body pairs and no-store, no written claim or attempt directory, and no native start. The cleanup cases observed their specific refusals and empty stores. |
| The image reader can preserve the actual outcomes using plain values and a Node stream | A scratch `RawBodyRequest` narrowed the existing parameter to `Readable` with `IncomingHttpHeaders`. With a `PassThrough`, Node Vitest returned 415 and 413 with the existing reasons before consuming bytes. The accepted image read returned the exact PNG bytes and recovered the encoded filename. The maintained backend command with `'launches/launch-attachment-premise\.spec\.ts$' --workers=1` passed 2/2 in 1.35 s wall. The cases took about 12 and 6 ms. Dashboard typechecking accepted the narrowed contract, including the live callers. The scratch code was removed. This checked the input seam, while the slices still owe the final adapter and filesystem proof. |
| Existing E2E exercises accepted bytes and the kept launch | The E2E command below ran both selected cases without retries in 18.68 s wall. The refinement observed two copied paths in picked order, the files' bytes, and the kept launch. The Codex recovery case observed the kept attachment path and bytes and the same path on the continued first input. In a scratch edit that omitted the first materialized path, refinement failed on the missing native-input line and recovery failed on the missing kept path. After restoring the code, both cases passed again in 13.96 s wall. |

## Ordered slices

### 1. Read attachment rules directly in Node

Type: Behavior
Status: done
Estimate: 5–8 active minutes.
Proof: Through the maintained backend command,
`launch-attachment-refusals.spec.ts` runs on Node Vitest.

Given a non-Latin-1 name, the encoded header can be constructed and decoded
back to the selected name. Given supported and refused files, the selection
keeps the supported file and identifies the filename and reason of each
refusal. Preserve the independent type, size, count, and allowed-file
observations while consolidating repeated checks when one named owner
detects the same regression. Use the shared production functions with Node's
`Headers` and `File`. Supply the bytes needed by the case directly, without
loading the Playwright picker fixture. Keep invalid inputs visible.

### 2. Reject an upload before creating a claim

Type: Behavior
Status: done
Estimate: 12–15 active minutes.
Proof: Typed launch-upload admission, with a real Node stream and temporary
directory, observes the 415 and 413 JSON answers and no-store metadata
consumed by the adapter. The existing refinement E2E observes successful
upload through the real adapter.

Given an unsupported PDF or a length beyond the image limit, the launch
upload yields the appropriate status and reason before calling the claim
writer. Assert the reply and the empty claim and attempt directories using
the same admission operation the middleware calls. Keep the adapter's origin/method gates,
abort lifetime, and incomplete-request framing. Reuse the reader's
pre-read and streaming bounds instead of introducing separate launch
rules. Replace the mounted check in the same slice that gives its proof a
typed owner. Move the full boundary spec to Vitest, keeping the two direct
cleanup observations green with their existing temporary-home setup until
slice 3. Remove server, raw HTTP, and Playwright fixture imports. Rerun the
shared terminal upload and voice request consumers of the reader.

### 3. Remove claims when the launch cannot use them

Type: Behavior
Status: done
Estimate: 10–14 active minutes.
Proof: Both selected files run on Node Vitest. Real-file assertions observe
claims before the call and absence of claims and attempt files after refusal.
Existing E2E observes acceptance and recovery through the launch owner.

Given six valid posted claims, `materializeLaunchAttachments` refuses with
the existing count reason, consumes the claims, and creates no attempt
folder. Given a MakeMe wire request with a real claim and a caller-supplied
path, `recordedRequestWithMaterializedAttachments` refuses and abandons
the claim before writing an attempt folder. Give these calls a private
directory and retain the machine-local default at production callers.
Remove the cases' temporary-home override and retain existing fixture
exports used by other cohorts. Read the bytes at each ordered native-input
path in the existing refinement E2E case, keeping its current path and kept
record assertions. The recovery E2E continues to check bytes and path reuse.

## Proof ownership and local gate

| Former or preserved observation | Owner |
| --- | --- |
| Header-safe and recovered Unicode name, shared type/size/count messages, valid files kept with named refusals | Slice 1 with direct shared functions. The existing frontend tests retain presentation and selection proof. |
| Unsupported type and excessive declared length, status/body/no-store, no claim or attempt files, and no native start | Slice 2 tests the typed reply and absence of claim writes. Upload admission uses only the reader and claim writer, while Start is a separate endpoint. The existing refinement E2E exercises the actual upload before successful Start. |
| Sixth-claim refusal and rejection of caller paths, with neither attempt files nor outstanding claims | Slice 3 observes real claim directories and attempt output. Existing browser proof observes accepted materialization, ordered native paths, and retained recovery. |
| Session image upload and voice request still use the shared body reader | Slice 2 runs the existing `sessions/session-attachment-boundary.spec.ts` and `sessions/session-instruction-voice-boundary.spec.ts` with the maintained backend command. |

Baseline and candidate, one worker and a fresh `$backend_proof`:

```sh
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$backend_proof" /usr/bin/time -p npm run test:dashboard:backend -- 'launches/launch-attachment-(boundary|refusals)\.spec\.ts$' --workers=1
```

Representative browser proof, one worker and a fresh `$e2e_proof`:

```sh
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_E2E_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_E2E_PROOF_RECORD="$e2e_proof" /usr/bin/time -p npm run test:e2e -- 'launches/agent-launch-(story-attachments|ad-hoc-attachments-continuation)\.spec\.ts$' --workers=1
```

Use the affected-consumer trace on the final implementation, including readers
of the shared upload contract and the claim directory. Add a focused existing
journey if the diff reaches another promise. Run Dashboard typechecking because
the body-reader input type reaches live adapters. Compare completed counts,
per-case times against about 100 ms, summed case time, and selection wall
time under comparable conditions. Name every observation moved or
consolidated and any browser-cost change. Use the AC and `caffeinate -s -i`
gate for long macOS checks per [AGENTS.md](../../../AGENTS.md), the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md),
and the normal execution refactoring, staged lint, and CI gates.

Slice-plan refinement was unnecessary. Shared rules, upload admission, and
claim consumption have distinct observations and reuse the same attachment
contract through all three slices. No remaining slice-specific concern was
identified.

## Execution evidence

The established Story Branch execution uses publisher
`dashboard-territory.local-open-dough`, agent Yumi-chan, and branch
`codex/prove-launch-attachment-admission-in-node-vitest` on `origin`.
The claim at `35f189e8610aeecc264a0faf291b103099c6fe99` was accepted on
`origin/main` and initializes the remote execution branch. Locked native
setup, the Chromium launch check, and Dashboard typecheck passed in this
checkout. The Codex observer covers the execution branch on GitHub Actions
`ci.yml`. Coordinator `yumi-842-4194758a`, mailbox
`/tmp/dough-ci-501/watch-rgdDU3`, PID 92914, session 34591, cell `g401:19`.

### Slice 1 proof

`npm run test:dashboard:backend -- 'launches/launch-attachment-refusals\.spec\.ts$' --workers=1`
selected two Vitest cases and both passed. The actual Node header round trip
observes the unchanged Unicode filename. The production partition keeps the
fifth File by identity and names the PDF, oversized image, and sixth-image
refusals. This consolidates the old standalone rule assertions with the
partition assertions. The single focused run took 2.76 s under local contention
and leaves the planned cohort comparison to slice 3. The checkout-bound
evidence directory holds `s1-backend.log.run.json` and `s1-return.md`.
The independent refactoring pass was unnecessary after reviewing the changed
spec and its production and fixture references. It introduces no shared
representation or production change.

### Slice 2 proof

Four Node Vitest cases passed. The one former mounted upload case is now two
typed cases observing 415 and 413 with the respective JSON messages,
`application/json`, `no-store`, no consumed bytes, and no entries in the
private dashboard directory. Start has its own endpoint. The upload returns
its typed answer from the read and claim operation without starting a native
session. The live adapter still owns origin, method, abort, and connection
framing. The two cleanup cases passed with temporary HOME pending slice 3.

The 16 retained backend cases passed for terminal images, instruction voice,
and direct follow-up uploads. Dashboard typechecking passed. Both planned
E2E cases and the existing-changes attachment abandonment journey passed.
The refinement journey showed ordered copied paths in the first input and in
the kept record. The recovery journey showed the exact bytes and the same path
after continuing. The implementation report and exact commands are retained
under the checkout's Git evidence directory in `s2-return.md` and its run
records. Slice 1 was accepted on the execution branch at
`a0bf56a8cc52d5eebc733c5da7c0740ee1307ded`.

### Slice 3 proof

The two claim refusals now use separate private dashboard directories. The
tests read the posted bytes, observe the 400 count or malformed-request
answer, and check both stores after the call. The claim owner uses the same
directory through materialization and compensation. Production paths use the
machine dashboard directory. The malformed example supplies the posted claim
through MakeMe and states the caller-supplied path in the test.

| Measure | Recorded Playwright baseline | Node Vitest candidate |
| --- | ---: | ---: |
| Completed cases | 6 | 6 |
| Cases under approximately 100 ms | 5 | 6 |
| Summed case time | 1,345 ms | 20.36 ms |
| Selection wall time | 6.63 s | 1.90 s |

Candidate case times were 2.03 ms for PDF, 0.32 ms for the oversized
declaration, 3.86 ms for the sixth claim, 0.90 ms for the caller path,
11.19 ms for the filename round trip, and 2.06 ms for selection. The two
upload refusals replace the single mounted case. The partition case observes
the shared type, size, count, and valid-file rules formerly checked separately.
Both samples used one worker on macOS with Node 24.21.0 and AC power. The
workload and checkout setup differed slightly, so the comparison describes
these runs.

The existing two Chromium journeys both passed in 10.13 s wall, versus the
baseline's 18.68 s and the restored-source repeat's 13.96 s. The refinement
journey now reads the exact bytes of both images at the two paths taken from
native input. It also verifies their order and the kept request. The recovery
journey verifies that continuing sends the same path and retains the bytes.
The browser selection still contains two cases. The added work is two local
file reads. Twelve backend claim consumers, the existing-changes browser
case, and Dashboard typecheck passed. The earlier terminal and voice proof
still applies. Exact commands and selections are in `s3-return.md` and its
run records in the checkout's Git evidence directory. Slice 2 was accepted
on the execution branch at `5930174c01cdd767b89c7c4365e231902ce11cd6`.
Its push superseded the earlier branch CI attempt under the workflow's
concurrency rule.

## Story obligations

### G1. Observe both copies in the ordered refinement launch

Reported: slice 2 — "The existing refinement browser test asserts ordered native paths but does not read the bytes at those paths."
Story clause: "existing browser proof observes the copied bytes in the order picked"
Disposition: proved by slice 3: `e2e/launches/agent-launch-story-attachments.spec.ts` reads both numbered native paths and compares their contents to the two distinct picked PNGs. The `s3-e2e` proof record has the passing refinement attempt.
