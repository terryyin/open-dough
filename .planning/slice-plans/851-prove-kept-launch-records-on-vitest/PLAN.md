# Prove retained launch records in Node Vitest

**Identity:** SEED-413#prove-kept-launch-records-on-vitest

**Source:** [Prove retained launch records in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-kept-launch-records-on-vitest)

## Goal and scope

Give Dashboard maintainers fast, typed Node Vitest proof that kept starts
and launch records survive restart, another process's reads and writes,
replacement and expiry, and that each native session stays bound to its
host. Move the seven legacy backend Playwright specs below to Node Vitest
and leave product behavior unchanged. The catalog fixture observations in
`agent-launch-records-shared-machine.spec.ts` (one bare catalog origin, the
same installed checkout for both servers, Claude cwd in that checkout) test
`test-support/support/catalogProjectOrigin.ts`, not product records.
[Runner cutover](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#retire-legacy-dashboard-backend-runner)
owns them with the rest of the test infrastructure. Other launch, session
and terminal outcomes have the owners named in the
[campaign coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage).

## Current decisions

- Follow the North Star on [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Apply [local operational state in ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
  and [the proof and cost comparison in ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md#decision).
- Call the existing production operations directly:
  [start store](../../../dashboard/server/startStore.ts) (`startStore`,
  `keptStart`, `keptStartsByProject`, `resumeArguments`),
  [launch record store](../../../dashboard/server/launchRecordStore.ts) and
  [record document](../../../dashboard/server/launchRecordDocument.ts),
  [done marks](../../../dashboard/server/doneMarks.ts) through
  `AgentLaunches`, [record deletion](../../../dashboard/server/launchRecordDeletion.ts),
  [host observation](../../../dashboard/server/launchStates.ts) (`withStates`),
  `AgentLaunches.keptStarts` and `runningStarts`, and
  [terminal admission](../../../dashboard/server/terminalAdmission.ts).
  Start no Dashboard server or Vite host for these cases.
- Follow the existing Node pattern in
  [`agent-launch-cross-server-accept.spec.ts`](../../../dashboard/backend-tests/launches/agent-launch-cross-server-accept.spec.ts):
  use a private machine home, real machine files, and a forked Node child
  bound to the same home whenever another process is the observation. Where
  a native start is needed, use the setup of
  [`agent-launch-boundary.spec.ts`](../../../dashboard/backend-tests/launches/agent-launch-boundary.spec.ts)
  (installed origin and fake Claude).
- Use [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) for start
  records, launch records, requests and listing rows. Add no test-support
  request or server wrappers. Once the last caller of a helper in
  `test-support/agentLaunchBoundary.ts`, `machineLaunchRecords.ts`,
  `support/launchStore.ts`, `support/machineFileIdentity.ts` or
  `support/machineRecordNames.ts` has moved, remove it.
- Leave each host's terminal close codes to the
  [native session and terminal lifecycle](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-session-and-terminal-lifecycle-on-vitest)
  story. [`agent-terminal-codex.spec.ts`](../../../dashboard/backend-tests/terminals/agent-terminal-codex.spec.ts) already observes the Codex
  1011 close. Slice 4 asserts only host-qualified routing at terminal
  admission.

## Decisive premises

Observed in this preparation checkout at `b2e6f2a0d` on 26 November 2026
with Node 24.21.0, locked dependencies, one worker, and macOS on AC under
`caffeinate -s -i`. Other work ran on the host, with load average rising
from 8 to 20. These runs supply behavioral evidence. Take a comparable
before-and-after pair for the execution's cost claim.

| Premise | Consuming operation and result |
| --- | --- |
| The maintained selector still reaches all seven legacy specs, and they pass | The baseline command below selected 21 cases: 18 Chromium cases across the seven legacy specs and three Node controls in `start-store-exit-lock.spec.ts`. All 21 passed on the first attempt. The Chromium cases took 43.039 s summed, 1–10,084 ms each, with eight at or below 100 ms. The Node controls took 1.193 s summed, 394–400 ms each. The selection took 57.66 s wall. The slowest cases were one `start-store` case at 10,084 ms and the record retention, concurrency and unreadable cases at 2,936–7,819 ms. |
| Every observed operation has a typed production entry callable without a server | The checkout exports `startStore`, `keptStart`, `keptStartsByProject` and `resumeArguments` from `startStore.ts`. It exports `keptRecords` and `machineRecordStore` from `launchRecordStore.ts`, and `readStoredRecords` and `replaceRecords` from `launchRecordDocument.ts`. `deleteRecord(sourceId, session, store)` is exported, and so is `withStates(folder, records)`. `AgentLaunches` exposes `keptStarts()`, `runningStarts()` and `stateOf()`, and `NativeDoneMarks.markDone(source, record, folder, launches)`. `admittedAttach` reads the `host` parameter before the record lookup. |
| Existing Node specs already use a forked writer, a private machine home and a native start | The baseline ran `start-store-exit-lock.spec.ts`, which spawns a Node writer against a private home, and it passed. `agent-launch-cross-server-accept.spec.ts` and `agent-launch-boundary.spec.ts` are Vitest specs at this revision and use `fork`, and `startOrigin` with `installFakeClaude`, respectively. |
| The shared-machine catalog checks observe test support | `catalog-origins` appears only in `test-support/support/catalogProjectOrigin.ts` and `codexLaunch.ts`, and in no `dashboard/server` or `dashboard/src` file. |

## Ordered slices

### 1. Keep starts safely in the machine store

Type: Behavior
Status: done
Estimate: 10–15 active minutes.

Proof: Convert `start-store.spec.ts` to Vitest against a private home. Keep
these observations: the per-project and per-story kept start, the update
and ignore cases, the held-lock refusal with the bytes and lock unchanged,
reclaiming a lock whose owner process has gone, the writer that exits at
the owner write, one start per story, the resume arguments, and the
predecessor hostless decode. Find the cause of the 10 s case. A real wait
in production code stays and is recorded. A harness cost does not
survive the move. Convert `agent-launch-start-kept-not-running.spec.ts`
into a typed `AgentLaunches` start that the fake Claude refuses. The kept
execution start remains in `execution-starts.json`, `keptStarts()` names
it, and `runningStarts()` is empty.

Outcome: `start-store.spec.ts` runs in Vitest (eight cases, 1–302 ms).
The 10 s case was the production `acquireWriteLock` wait in
`dashboard/server/machineJsonLock.ts`, up to 10,000 ms for a held lock with
no owner record. That wait stays; the case advances `Date.now` past it.
The refused kept start is a case in `agent-launch-boundary.spec.ts`
(3,020 ms, a native start), and its legacy spec is deleted. No
test-support helper lost its last caller.

### 2. Read records another process wrote or marked done

Type: Behavior
Status: done
Estimate: 12–15 active minutes.

Proof: In a private machine home, this process reads a settled store. A
forked child then records a launch through the production recording path,
and the next read here returns both records in order. A fresh child reading
the same home afterwards answers the same records. This is the
restart-equivalent read from
`agent-launch-records-shared-machine.spec.ts`. Give 24 kept sessions done
marks concurrently from this process and a forked child. Every `doneAt`
survives in the store. After a done-exited native listing, `stateOf` or
the machine read answers retained review state, `attentionCount` is 0, and
no alert is raised. Convert `agent-launch-records-replaced.spec.ts` case 1
and `agent-launch-records.spec.ts` case 1. Remove the record checks of
`agent-launch-records-shared-machine.spec.ts` and record that
runner cutover owns its catalog fixture checks.

Outcome: `launch-records-across-processes.spec.ts` holds both cases in
Vitest (about 1.6–1.8 s each, each forking one Node child). Case 1 of the
two records specs moved there, and `agent-launch-records-shared-machine.spec.ts`
is deleted. Its remaining catalog fixture checks (one bare catalog origin,
the same installed checkout for both servers, Claude cwd in that checkout)
belong to [runner cutover](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#retire-legacy-dashboard-backend-runner).
The refactor pass kept the forked-child plumbing in each spec, because the
two child protocols differ. No test-support helper lost its last caller.

### 3. Recover unreadable stores and expire done records

Type: Behavior
Status: planned
Estimate: 10–15 active minutes.

Proof: Replace a store this process already read with an unreadable file
of the same size and times. Reads answer no records, the bytes stay, and
no `.unreadable` copy appears. An unreadable store at startup answers no
records. The next ad hoc recording moves it aside as `.unreadable`. A
second unreadable store is moved aside next to the first, keeping both
copies. With an unclosed 40-day-old record, a done record marked 29 days
ago and one marked 31 days ago, reads keep all three in the file. The
next recording drops only the 31-day record. Convert
`agent-launch-records-replaced.spec.ts` case 2 and
`agent-launch-records.spec.ts` cases 2–3.

### 4. Keep equal native IDs bound to their own host

Type: Behavior
Status: planned
Estimate: 12–15 active minutes.

Proof: Keep a predecessor Claude record and a Codex record with the same
native ID. `withStates` gives Claude unavailable and Codex unknown, and
calls Claude only with its own record. A Done naming Codex marks only the
Codex record with the missing-endpoint problem and makes no Claude call.
Terminal admission with `host=codex` resolves the Codex record and starts
no Claude attach. A Done that names no host marks the Claude record. Both
writes leave other machine records unchanged, with no quarantine copy. A
Delete naming Codex leaves only the marked Claude record. Convert
`launch-observations.spec.ts` to Vitest with `vi.spyOn` on
`claudeHost.sessions`, `codexHost.sessions` and `AbortSignal.timeout`.
Keep the failed-host isolation, the 10,000 ms bound and the
unknown-not-absent result. Convert `agent-launch-host-identity.spec.ts`.

## Proof ownership and local gate

Files are relative to `dashboard/backend-tests/launches/`.

| Slice | Legacy selection | Observable proof |
| --- | --- | --- |
| 1 | `start-store.spec.ts`, `agent-launch-start-kept-not-running.spec.ts` | Kept start per story, lock refusal, reclaim and owner-exit recovery, resume arguments, predecessor decode, kept and never running |
| 2 | `agent-launch-records-replaced.spec.ts` case 1, `agent-launch-records-shared-machine.spec.ts`, `agent-launch-records.spec.ts` case 1 | Another process's record and done marks are read here and by a fresh reader; no revived attention |
| 3 | `agent-launch-records-replaced.spec.ts` case 2, `agent-launch-records.spec.ts` cases 2–3 | Unreadable replacement left in place, moved aside with every earlier copy, retention boundary at 30 days after done |
| 4 | `launch-observations.spec.ts`, `agent-launch-host-identity.spec.ts` | Per-host targets, failed or unsettled host isolation, host-qualified Done, Delete and terminal routing |

Run the baseline and candidate with fresh absolute proof-record paths from
the repo root, using one worker. Select the seven legacy basenames plus the
`start-store-exit-lock` control. When a replacement takes a new filename,
add its exact selector to the candidate run. Account for all 18 legacy
cases before accepting zero Playwright selections at this boundary. If
affected paths or measurement conditions changed, repeat the baseline at
the execution base.

```sh
selection='launches/(start-store(-exit-lock)?|agent-launch-(start-kept-not-running|records(-replaced|-shared-machine)?|host-identity)|launch-observations)\.spec\.ts$'
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$backend_proof" /usr/bin/time -p npm run test:dashboard:backend -- "$selection" --workers=1
```

Run `npm run typecheck:dashboard`. Run the consumers in the
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
of any test-support helper removed or changed. Record the engine and case
counts, per-case time against roughly 100 ms, summed case time, and elapsed
selection time.

Use awake macOS on AC under `caffeinate -s -i` for long local checks per
[AGENTS.md](../../../AGENTS.md). Apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
to every failure and repair handoff. Keep default test timeouts.

## Plan review

Refinement was not needed. The four slices map one-to-one to the
story's observable record outcomes. Each converts complete legacy specs or
named cases, so no slice depends on another's interim state. No
slice-specific concern remained after this review.
