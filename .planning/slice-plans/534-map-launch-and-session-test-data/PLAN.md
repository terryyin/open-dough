# Make kept launch record test setup map directly to the domain

**Identity:** SEED-261#map-launch-and-session-test-data
**Source:** [Refined story](../../seeds/SEED-261-share-domain-test-data.md#map-launch-and-session-test-data)
**Source review:** [source-review.md](source-review.md)

## Goal and boundaries

Make the kept launches a dashboard test starts from readable at the call site
as persisted `LaunchRecord` facts, built by `makeMe.aLaunchRecord` and kept in
the machine launch store by one harness owner. The seed owns the scope, the
four key examples, and the split into five stories that Terry chose during
refinement.

Live observation and attempts, completion and landing, Codex and Cursor
continuations and terminals, and machine-local project configuration belong
to the four sibling stories queued after this one. Their helpers change here
only where they write the store: the write goes through the one owner, and
their record construction stays for their story. Launch request bodies sent
to start a launch are test actions and stay as they are.

## Reuse and decisions

- `makeMe.aLaunchRecord` ([builder](../../../tests/support/launchTestData.mjs))
  is the one record constructor. Extend it only with a variant a converted
  caller needs (for example a Done problem, an unconfirmed stop, a read
  mark, or an established ad hoc session in the default checkout), typed
  against `LaunchRecord`. Its outcome and workspace helpers stay behind it.
- The harness writes the store's plain document, `{ [project]: records }`
  under `<home>/.open-dough/dashboard/agent-launches.json`, the shape
  [`launchRecordDocument.ts`](../../../dashboard/server/launchRecordDocument.ts)
  reads. Do not call its `replaceRecords`: that resolves the test process's
  `HOME`, applies retention and drops records, which retention cases must
  arrange themselves. Grow the existing writer in
  [`storyLaunchRecord.ts`](../../../dashboard/tests/support/storyLaunchRecord.ts)
  (`keepProjectLaunchRecords`, `keepMoreLaunchRecords`, `keepLaunchRecord(s)`)
  into that owner rather than adding another, in a module named for the
  store, and delete the duplicates it replaces. The store also holds creation
  records; keep them writable through the same owner when a case keeps one.
- [`machineLaunchRecords.seedStore`](../../../dashboard/tests/machineLaunchRecords.ts)
  keeps writing exact text for malformed, legacy and unreadable-store cases.
  Reading the store back for assertions stays with the harness.
- A kept record's request comes from the builder, never from the incoming
  `launchRequest` body cast to `LaunchRecord["request"]`. Valid setup keeps
  the record's host and its session's host the same.
- Follow [ADR 0002 §5](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
  and [ADR 0008, Durable project state and local operational state](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state):
  kept launches are machine-local evidence; the record is the domain fact and
  the store file is the harness. Keep test support outside the managed
  payload ([ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md))
  and keep the proof deterministic
  ([ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md#2-keep-deterministic-checks-in-ci)).

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Dashboard servers read a plain `{ [project]: records }` document written by a test into the machine home | Server start and session reads in the store-keeping journeys | Existing writers (`keepProjectLaunchRecords`, `writeSharedLaunchRecord`, specs' `JSON.stringify` writes) ran in GitHub Actions `ci.yml` run `42482471658` at `54cc27451`, the last trunk commit touching `dashboard`, `tests` or `src` before this plan | Success. Settled. |
| The record schema accepts a Claude session inside a Claude record as it does inside a Codex record, keeping the session unchanged | `launchRecordSchema.parse` in `launch-record-session-rules.spec.ts` | `node --experimental-strip-types` parse of both records against `dashboard/src/launchRecord.ts` at `93ae8f311`, with the integration checkout's `zod` (the schema has no cross-field host rule, so the package version cannot change this) | Both parse and keep the session. Settled: the coherent record keeps the spec's assertions. |

No other premise decides a slice's approach or sizing. Builder variants a
caller needs are in scope and proved by each slice's byte comparison.

## Proof and delivery gates

Each slice converts one family, keeps every assertion, and compares the
records it now builds with the ones the replaced setup wrote: identical
store bytes, or a recorded field-order-only or incidental-value difference
with the assertion that still discriminates. Before each change, trace the
consumers of every altered or removed helper with the
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
and run the specs it lists. No native scenario arranges kept launch records;
confirm that in the trace and update a scenario's evidence identity if one
does.

Local gate: follow the [test automation rules](../../../AGENTS.md#test-automation)
and the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written, carried into every slice and delegation. A fresh worktree needs
[native setup](../../../tests/native-setup.md) first. Run Playwright through
`npm run test:dashboard -- <spec selection>` with `NO_COLOR` and
`FORCE_COLOR` unset, and `npm run typecheck:dashboard` whenever shared
MakeMe sources change. Once before landing, run `npm run test:dashboard` and
`npm test`, because `tests/support/makeMe.mjs` is loaded by every runner. On
fully awake macOS with AC power wrap each full run in `caffeinate -s -i` with
Homebrew Bash 5 first on `PATH`; on battery follow the lid-open and log-check
guidance in
[Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Hosted CI and publication follow the selected execution mode.

For the final [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
evaluation, compare original and converted cases at their call sites: the
facts governing each outcome are visible, the observations stay independent,
and a translation or duplicate constructor is gone.

## Slices

### 1. One harness owner keeps launch records in the machine store
Type: Structure
Status: done
Proof: Every spec the consumer trace lists for the moved and removed writers passes; the bytes each writer produced are unchanged.

Grow the existing store writer into the one owner described above and route
every valid-record write through it: `storyLaunchRecord`, `sharedLaunchRecord`,
`sessionsReplaySeed`, `retainedReport.save`, `codexObservation.saveObservations`,
`codexLaunch`, `keptCursorTurn`, `cursorRunnerReplacement`,
`completionRecovery`, and the specs that `JSON.stringify` records into
`agent-launches.json` themselves. Exact-text writes stay on `seedStore`.
Record construction does not change in this slice. Enables slice 2, whose
records reach the store only through this owner.

Accepted: `dashboard/tests/support/launchStore.ts` is the one owner
(`keepLaunchStore`, `keepLaunchRecords`, `keepMoreLaunchRecords`,
`changeLaunchStore`, `keepLaunchStoreText` for exact text, `launchStoreFile`,
`keptLaunchStore`), synchronous. 301 traced specs passed (796 tests); byte
comparison of every rerouted writer identical. `codexLaunch` and
`completionRecovery` only read or fault-hook the store. Learning for slices
2–4: removing the G2 casts belongs with each family's builder conversion;
about 30 files still build the store path by hand to read it back.

### 2. History and Recently done start from kept records the builder states
Type: Behavior
Status: done
Proof: Seed example 1. `recently-done-sessions-sidebar*.spec.ts`, `agent-launch-done-listing.spec.ts`, `agent-launch-retained-history.spec.ts`, `agent-launch-sessions-listing.spec.ts`, and every other caller the trace lists for the converted helpers pass with unchanged assertions.

Two projects each keep an execution launch, one marked Done yesterday →
the sidebar loads → Recently done lists only the Done one under its project.
Convert the remaining hand-built records in `recentlyDoneProgressive`,
`recentlyDoneSessions`, `stories/recentlyDoneReadLatencyFixture`,
`sessionsReplayRecords`/`sessionsReplaySeed`, and the record helpers in
`machineLaunchRecords` (`recordLaunchedDaysAgo`, `openStoryRecord`,
`seedEarlierDoneMark`), with launch and Done times visible where retention
or ordering depends on them. Delete each displaced factory.

Accepted: kept records in history, Recently done and the sessions listing
are built by `makeMe.aLaunchRecord` (new variants: `adHoc`, `inCodexSession`,
`markedDoneAt` problem, `reportingThrough`, `onStoryBranch` claim details).
A dedicated E1 case in `recently-done-sessions-sidebar-projects.spec.ts` observes the
key example. Learning for slice 3: a record's `launchedAt` drives own-launch
matching (`server/ownLaunchRecord.ts`, launchedAt >= acceptedAt); state it at
the call site when dropping an implicit now. Remaining G2 casts: slice 3
(sharedLaunchRecord, claude-verification, own-record verification,
project-remove, project-hide-sessions, project-restored-session,
creation-gates, responsive-session-recovery-verification, avatar) and slice 4
(host-identity).

### 3. Shared and story-card records keep a recorded request, not the launch body
Type: Behavior
Status: planned
Proof: Seed example 2. `sharedLaunchRecord` callers (development/production switch), `agent-launch-story-card-open-session.spec.ts`, `agent-launch-start-story-card.spec.ts`, `agent-launch-claude-verification.spec.ts`, `agent-launch-claude-own-record-verification.spec.ts`, `agent-launch-unconfirmed-input.spec.ts`, `project-remove.spec.ts`, `productionUpdateJourney.ts` callers, `story-review-trunk-worktree.spec.ts`, `agent-launch-held-revision-after-action.spec.ts`, and the trace's other callers pass with unchanged assertions.

A server starts with a kept launch shared from the machine store → it
answers that record. Build these Claude kept records with the builder,
including `sharedLaunchRecord`, `sessionAttributionFixture`,
`keptExecutionStart` and `keptPreparation` where they keep Claude records.
Find stored setup that reuses the incoming body (`request: launchRequest`,
`...launchRequest`, `launchRequest as LaunchRecord["request"]` inside a
record kept in the store) across the touch, review, configuration, runtime,
alert and second-server specs, and give it a recorded request. A
`launchRequest` posted to start a launch, and `as LaunchRecord` on a value
read back from the server, stay. Setup in completion, landing, Codex or
Cursor families stays for its sibling story. Delete each displaced factory.

### 4. Record rules state coherent host records and keep malformed input explicit
Type: Behavior
Status: planned
Proof: Seed examples 3 and 4. `launch-record-session-rules.spec.ts`, `agent-launch-host-identity.spec.ts`, and the `agent-launch-records*.spec.ts` store-text cases pass with unchanged assertions.

A Claude session with its alias → the session and record schemas parse it →
both keep it. Wrap each host's session in a record of the same host built by
`makeMe.aLaunchRecord`, and keep the deliberately incomplete or legacy
sessions, the older `created` established-session fact, and exact store
text literal at the call site.

## Concern evidence

Slice-plan refinement was not needed: the slices follow the story's four
examples, each with one proof loop, and the one Structure slice enables the
next Behavior. This review found no remaining slice-specific concern.

## Story obligations

### G1. Opt-in Sessions replay measurement times out (first reported in slice 1)
Reported: slice 1 — "DOUGH_SESSIONS_REPLAY=1 sessions-replay.spec.ts exceeds the 30 s test timeout; it fails identically at e75b693ab, before any change. It is skipped unless opted in."
Story clause: "Evaluate each converted family against its original cases"
Disposition: proved by slice 2: dashboard/backend-tests/sessions/sessions-replay.spec.ts test.setTimeout(120_000) inside the test (its ~41 s of real pauses measure a separate server's event loop; 6e6d16cef removed the override by mistake); DOUGH_SESSIONS_REPLAY=1 run passed twice, 54 s and 49 s (tmp/slice2-replay*.log)

### G2. Stored setup gained type-only record casts (first reported in slice 1)
Reported: slice 1 — "Typing the store as LaunchRecord | CreationRecord added launchRequest as LaunchRecord[\"request\"] in recordHolding and the own-record verification spec, and as LaunchRecord / as CreationRecord / as KeptLaunch casts in project-add, project-remove, project-hide-sessions, project-restored-session, creation-gates, host-identity, retention-scope, responsive-session-recovery-verification and avatar.establish."
Story clause: "a record states its request through the builder"
Disposition: interim until slices 2, 3, 4
