# Source-only review

**Launch:** fresh general-purpose reviewer, no conversation inheritance; model inherit.
**Input:** SEED-261#map-ci-adapter-and-coverage-test-data Goal, Scope, and Key
examples only (no plan, product, proof, or current-slice scope).
**Reviewer agent:** 24503727-4bdb-4ea5-9f7c-fd58a7e8577d

## Reviewer return

### 1. Shared readable CI attempt / queue / mailbox facts
**Commitment:** Maintainers can read, in the same domain vocabulary across tests:
**1.1** which custom CI attempt checked a revision
**1.2** which revision is only queued
**1.3** what evidence the execution mailbox holds

**Qualification:** Shared MakeMe construction owns those arranged facts so
repeated mapping decisions shrink, while independent behavioral proof stays as
it is.

**Exclusions:** Not a new UI, adapter protocol, CI policy, timing algorithm, or
installation promise; this is test-data conversion and exposed mapping repair.

### 2. Convert valid synthetic adapter discovery attempts onto `aCiAdapterAttempt`
**Commitment:** Convert valid synthetic adapter discovery attempts used by:
**2.1** dashboard base-CI judgment
**2.2** Intent status
**2.3** proof selection
**2.4** comparisons
**2.5** landed history
**2.6** execution command-adapter fixtures
**2.7** revision-observation fixtures
**2.8** Node support adapter readers

**Qualification:** Extend the existing `aCiAdapterAttempt`; do not introduce
another attempt representation. Retain already-converted consumers on that
shared owner; remove or delegate displaced constructors.

**Journey / trigger examples:**
- Opaque run `run:opaque` with attempts `attempt/first`, `attempt/retry`,
  `attempt:failed`, `attempt:incomplete` at the checked revision stay pending,
  success, failure, and incomplete after acquisition.
- A newer incomplete attempt and an older completed retry for one
  revision/check/context leave lookup selecting the eligible completed retry;
  another check’s attempt does not replace it; status, proof requests, and
  comparison endpoints keep the selected identity, including ambiguity when
  another run shares the attempt ID.

**Exclusions:** Mixed tests convert only this story’s facts. Sibling stories
keep GitHub run/job, CI proof fragment/summary, and native shell setup
conversion.

### 3. Convert queue entries and persisted revision-coverage records
**Commitment:** Convert arranged:
**3.1** adapter queue entries
**3.2** persisted revision-coverage records
**3.3** accepted records supplied to integrated-state judgment
**3.4** accepted records supplied to mailbox wait/completion cases

**Qualification:** Keep discovery input, normalized attempts, observed coverage,
and completion receipts distinct. Whenever they drive the case, state at the
call site: revision, run/attempt identity, branch, check/context, outcome, and
times.

**Journey / trigger examples:**
- Registered revision with no attempt: successive controlled polls report
  queued → running → retrying; worker records fresh progress while coverage
  stays undiscovered and verdict absent.
- A real pending attempt replaces queue progress; only a resolved attempt
  supplies a verdict.
- Empty, unsupported, foreign, or failed discovery withdraws queue progress
  without inventing success.
- Mailbox reader starts from arranged `not_required` with succeeded ancestor
  basis; completion reports success with that basis and confirms worker
  shutdown.

**Exclusions:** Builders do not invent missing evidence. Queue facts carry no
attempt verdict—progress alone is not a check result.

### 4. Preserve identity, omission, order, and ambiguity semantics
**Commitment:** Preserve:
**4.1** opaque identities
**4.2** numeric identities
**4.3** omitted legacy branch
**4.4** omitted legacy check/context
**4.5** omitted timing
**4.6** discovery order
**4.7** current-attempt ambiguity

**Qualification:** Missing timing stays unavailable; a shared exact attempt
remains one piece of evidence.

**Journey / trigger examples:**
- Legacy omitted branch remains unattested; normalizing it must not manufacture
  permission to validate another target.
- Selected identity retained even when another run shares the attempt ID
  (ambiguity preserved).

**Exclusions:** Do not manufacture attestation or validation permission from
omitted legacy fields.

### 5. Keep coverage / outcome statuses distinct
**Commitment:** Keep distinct:
**5.1** undiscovered
**5.2** pending
**5.3** incomplete
**5.4** `not_required` with its ancestor basis
**5.5** exact success
**5.6** exact failure
**5.7** integrated validation

**Qualification:** Locally observed freshness is separate from provider
timestamps. Queue progress is not a verdict.

**Journey / trigger examples:**
- Ignored-only revision inherits applicable ancestor pending / successful /
  failed coverage; its own exact attempt supersedes that basis.
- Descendant success validates accepted work only with the existing policy,
  target, current-attempt, and Git-ancestry evidence.
- Missing basis, terminal incomplete coverage, unreadable bytes, cancellation,
  and lost observation keep distinct unresolved outcomes.

**Exclusions:** No builder turns unresolved / incomplete / cancelled / lost /
unreadable cases into a success receipt. Building test input leaves the real
observer and judge responsible for those results.

### 6. Keep live harness concerns out of builders (except starting stored facts)
**Commitment:** Keep in their harnesses:
**6.1** actual Git histories
**6.2** executed provider commands and observed outputs
**6.3** adapter programs and response encoding
**6.4** workers
**6.5** wake-ups
**6.6** controlled clocks
**6.7** process lifetime and teardown

**Qualification:** A test of observation still lets the worker produce coverage.
Builders may supply a stored record only when that record is the consumer’s
starting fact.

**Journey / trigger examples:**
- Observation cases: worker still produces coverage under controlled polls /
  wake-ups.
- Mailbox wait/completion: arranged starting `not_required` record is the
  consumer’s starting fact; completion/shutdown still come from the live path.

**Exclusions:** Builders are not a substitute for executed observation, judging,
or harness lifetime.

### 7. Keep form-under-proof literals and independent expectations outside builders
**Commitment:** Keep literal where form is under proof:
**7.1** malformed/partial responses
**7.2** exact protocol examples
**7.3** deliberate contradictions
**7.4** captured evidence

**Qualification:** Independently written expectations remain outside builders.
Valid surrounding facts, including nonqualifying attempts, use MakeMe.

**Alternatives preserved (not rejection rules):** Surrounding facts may be
MakeMe-built even when the proof target itself stays literal; nonqualifying
attempts are valid surrounding facts when they use MakeMe.

**Exclusions:** Do not fold independent expectations into builders. Do not
soften literal protocol/malformed/contradiction/evidence forms that the case
proves.

### 8. Story boundary vs sibling conversion
**Commitment:**
**8.1** GitHub run/job conversion remains with its sibling story
**8.2** CI proof fragment/summary conversion remains with its sibling story
**8.3** native shell setup conversion remains with its sibling story
**8.4** Mixed tests convert only this story’s facts

**Qualification / exclusion:** No new product surface or policy: no new UI,
adapter protocol, CI policy, timing algorithm, or installation promise.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1.1 | which custom CI attempt checked a revision | slice 5 | observed: MakeMe aCiAdapterAttempt across status/proof/command/revision consumers — custom attempt identity readable in domain vocabulary |
| 1.2 | which revision is only queued | slice 5 | observed: MakeMe aCiQueueEntry + ci-queue-coverage — queued-only revisions readable without verdict |
| 1.3 | what evidence the execution mailbox holds | slice 5 | observed: MakeMe aRevisionCoverage through publishRevisionRecord in mailbox await/complete — mailbox evidence starting facts shared |
| 2.1 | Convert valid synthetic adapter discovery attempts used by: dashboard base-CI judgment | slice 1 | observed: dashboard/tests/launches/agent-launch-base-ci-adapter.spec.ts — MakeMe-built failing/pending/passed attempts; base warning and running-ancestor assertions |
| 2.2 | Convert valid synthetic adapter discovery attempts used by: Intent status | slice 1 | observed: dashboard/tests/intent/intent-ci-status-reads.spec.ts — MakeMe discover attempts; shared-commit and nearer-own status judgment |
| 2.3 | Convert valid synthetic adapter discovery attempts used by: proof selection | slice 1 | observed: dashboard/tests/intent/intent-ci-proof-adapter.spec.ts (+reasons) — selected attempt identity, retry, held proof, ambiguity |
| 2.4 | Convert valid synthetic adapter discovery attempts used by: comparisons | slice 2 | observed: intent-ci-comparison-adapter(+taken/planning-skip) + mountedComparison* — MakeMe attempts; endpoint identity, shared-attempt and proof-read assertions held |
| 2.5 | Convert valid synthetic adapter discovery attempts used by: landed history | slice 2 | observed: intent-ci-wall-time-history-adapter + landed-ci-scope-adapter* + landed-ci-proof-adapter-units — shared/distinct attempt evidence retained |
| 2.6 | Convert valid synthetic adapter discovery attempts used by: execution command-adapter fixtures | slice 3 | observed: ci-command-adapter*.test.mjs + ci-command-attempts.test.mjs — MakeMe-built discovery facts encoded into generated adapters |
| 2.7 | Convert valid synthetic adapter discovery attempts used by: revision-observation fixtures | slice 4 | observed: ci-revision-coverage* + watch-ci-execution-coverage — MakeMe attempt/queue inputs into real observation |
| 2.8 | Convert valid synthetic adapter discovery attempts used by: Node support adapter readers | slice 1 | observed: tests/support/dashboard-{story-branch-ci-adapter,ci-adapter-revision-lookup,ci-adapter-proof}.test.mjs — MakeMe facades; retry/check/context and proof limits |
| 3.1 | Convert arranged: adapter queue entries | slice 4 | observed: aCiQueueEntry + delegated queueEntry in ci-queue-coverage and revision fixtures |
| 3.2 | Convert arranged: persisted revision-coverage records | slice 4 | observed: aRevisionCoverage + revision-coverage fixtures/tests arrange stored records |
| 3.3 | Convert arranged: accepted records supplied to integrated-state judgment | slice 4 | observed: accepted() → aRevisionCoverage in integrated-state judge fixtures |
| 3.4 | Convert arranged: accepted records supplied to mailbox wait/completion cases | slice 5 | observed: mailbox await/complete/pending/unavailable + cursor-session pending-ci publish arranged records via aRevisionCoverage |
| 4.1 | Preserve: opaque identities | slice 3 | observed: controlledDiscoverAttempts run:opaque / attempt/* identities retained through acquisition |
| 4.2 | Preserve: numeric identities | slice 1 | observed: intent-ci-proof-adapter numeric attemptId + story-branch runId:7/attemptId:1 retained through acquisition/request |
| 4.3 | Preserve: omitted legacy branch | slice 3 | observed: ci-command-attempts legacy omitted branch stays unattested |
| 4.4 | Preserve: omitted legacy check/context | slice 1 | observed: status-reads/base-ci omit check/context; revision-lookup states them only when selecting by check/context |
| 4.5 | Preserve: omitted timing | slice 2 | observed: ci-comparison-timing-gaps + mounted gap wording — discovery .with omits timing; Not recorded / not.toHaveProperty startedAt\|completedAt |
| 4.6 | Preserve: discovery order | slice 3 | observed: controlled pending→success→failure→incomplete poll order preserved |
| 4.7 | Preserve: current-attempt ambiguity | slice 1 | observed: intent-ci-proof-adapter-reasons same-check-across-runs + story-branch shared attemptId ambiguity retained |
| 5.1 | Keep distinct: undiscovered | slice 4 | observed: queue progress leaves coverage undiscovered in ci-queue-coverage |
| 5.2 | Keep distinct: pending | slice 3 | observed: pending outcome in controlled fixture retained |
| 5.3 | Keep distinct: incomplete | slice 3 | observed: incomplete outcome in controlled fixture retained |
| 5.4 | Keep distinct: not_required with its ancestor basis | slice 4 | observed: not_required with ancestor basis arranged via aRevisionCoverage for ignored-only paths |
| 5.5 | Keep distinct: exact success | slice 4 | observed: exact success coverage records remain distinct in revision/judge suites |
| 5.6 | Keep distinct: exact failure | slice 3 | observed: failure outcome encoded and asserted in failures/unavailable suites |
| 5.7 | Keep distinct: integrated validation | slice 4 | observed: integrated validation via real judge on arranged accepted records |
| 6.1 | Keep in their harnesses: actual Git histories | slice 4 | observed: real Git histories remain harness-owned in integrated/custom journeys |
| 6.2 | Keep in their harnesses: executed provider commands and observed outputs | slice 3 | observed: real command acquisition still executes adapter programs and observes outputs |
| 6.3 | Keep in their harnesses: adapter programs and response encoding | slice 3 | observed: parent encodes built facts; child processes have no MakeMe import |
| 6.4 | Keep in their harnesses: workers | slice 4 | observed: workers still produce coverage under controlled observation |
| 6.5 | Keep in their harnesses: wake-ups | slice 4 | observed: wake-ups remain harness-owned |
| 6.6 | Keep in their harnesses: controlled clocks | slice 4 | observed: controlled clocks remain harness-owned |
| 6.7 | Keep in their harnesses: process lifetime and teardown | slice 5 | observed: process lifetime/teardown and worker-loss remain harness-owned; builders only supply starting stored facts |
| 7.1 | Keep literal where form is under proof: malformed/partial responses | slice 3 | observed: malformed/partial responses remain literal in unavailable suite |
| 7.2 | Keep literal where form is under proof: exact protocol examples | slice 3 | observed: exact protocol examples remain literal where form is under proof |
| 7.3 | Keep literal where form is under proof: deliberate contradictions | slice 4 | observed: invalid queue / not JSON counterexamples stay literal |
| 7.4 | Keep literal where form is under proof: captured evidence | slice 5 | observed: captured evidence / malformed bytes / result files stay literal under proof |
| 8.1 | GitHub run/job conversion remains with its sibling story |  | X1 |
| 8.2 | CI proof fragment/summary conversion remains with its sibling story |  | X2 |
| 8.3 | native shell setup conversion remains with its sibling story |  | X3 |
| 8.4 | Mixed tests convert only this story’s facts |  | X4 |
