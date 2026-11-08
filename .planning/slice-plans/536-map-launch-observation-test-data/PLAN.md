# Make live launch observation test setup map directly to the domain

**Identity:** SEED-261#map-launch-observation-test-data
**Source:** [Refined story](../../seeds/SEED-261-share-domain-test-data.md#map-launch-observation-test-data)

## Goal and boundaries

Maintainers can see what the test arranges about a kept launch, what was
observed about it, and which attempt is still in progress. Convert the valid
starting facts in backend session rules, frontend service substitutes, and
integrated journeys while preserving each assertion and proof boundary.
The seed supplies the key examples. Kept-record persistence, completion and
landing, host continuation and terminals, and project configuration are
separate stories. Mixed cases convert their observation and attempt facts here.

## Reuse and decisions

- Use [MakeMe](../../../tests/support/makeMe.mjs), extending it behind its
  existing entry point with canonical typed values the converted callers
  need. Compose with the existing
  [kept record builder](../../../tests/support/launchTestData.mjs).
  The [kept record story](../534-map-launch-and-session-test-data/PLAN.md)
  owns the launch-store writer. Keep current store calls in this story and
  use the shared writer when it is available. No supplier agreement is
  needed for the builder or store seam already in use.
- Compose an observed record from a kept record plus explicit
  [session state](../../../dashboard/src/launchRecord.ts), with workspace
  observation when the case arranges it. The real
  [host join](../../../dashboard/server/launchStates.ts) matches by host
  and session ID. Keep that join in the journey where it is under proof.
  Model older or refused answers through the actual read or route control.
- Start with the typed defaults in
  [frontend service state](../../../dashboard/tests/support/frontendServiceState.ts)
  for valid full [machine answers](../../../dashboard/src/agentLaunch.ts).
  Let the fixture delegate domain data construction while retaining its route
  substitutions and mutations. Use
  [machine sessions revision](../../../dashboard/src/machineSessionsRevision.ts)
  for the actual full, unchanged and history envelopes.
- Keep [accepted attempt storage and observation](../../../dashboard/src/launchOutcome.ts)
  distinct. Compose observation from a kept attempt plus explicit ownership,
  running state, and changes when relevant. A launched outcome references a
  host and native ID. An unsettled attempt needs only its acceptance facts.
  Readers such as [keptAttempts and settledOutcome](../../../dashboard/tests/acceptedAttempts.ts)
  continue to read the actual store and endpoint.
- This follows [ADR 0002 §5, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
  [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state),
  and [Agent launch as a requested assignment](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment).
  Keep native stand-ins at their current boundary and deterministic proof in
  CI under [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md#2-keep-deterministic-checks-in-ci).

## Preparation evidence

Keeping typed local fixtures would leave competing constructors. Starting
real attempts and observing native hosts in every case would move frontend
substitute tests across the service boundary. The selected composition borrows
the distinction between a keyed row and its read projection from relational
data modeling. A kept launch supplies identity, an observation supplies its
current facts, and a launched attempt references the session. The analogy
ends at referential enforcement. A pending attempt has no kept launch and a
failed host read gives no observation to join.

Observations used Node 24.21.0 in this preparation worktree at `aa2edcf1b`.
For Playwright, the preparation ran `env -u NO_COLOR -u FORCE_COLOR
PATH="/opt/homebrew/bin:$PATH" npm run test:dashboard -- --workers=2` with
the named files below as individual path arguments.

| Premise and consuming operation | Observed result |
| --- | --- |
| The kept record composes into a live record and a full answer without losing state distinctions at the schema read. | Imported `makeMe`, `launchRecordSchema`, `launchWithStateSchema`, and `launchRecordsSchema` using `node --experimental-transform-types --disable-warning=ExperimentalWarning --input-type=module`. The builder reproduced the kept record in `sessions-sidebar-host-status.spec.ts`. Loaded/waiting, retained/review, unknown with label, and unavailable round-tripped through the answer schema. The persisted record schema strips the live state. |
| The real host join and the browser's session reads distinguish missing, retained, and unavailable evidence. | `launch-observations.spec.ts`, `agent-launch-codex-observation-status.spec.ts`, `agent-launch-story-card-session-states.spec.ts`, and `agent-launch-sessions-unanswered.spec.ts` passed. Changing only the `withStates` fallback in scratch to unavailable made the first join test fail on the unknown assertion. Restoring the source and rerunning that spec with one worker passed. |
| A stored attempt and its observed form reach different consumers. | A Node probe parsed the same accepted facts with `launchAttemptSchema`, and `attemptObservationSchema` required explicit `owned` and `running`. `agent-launch-acceptance.spec.ts`, `launch-attempt-worker.spec.ts`, `launch-attempt-retention.spec.ts`, and `agent-launch-continuation.spec.ts` passed through the actual accept, observe, and recovery paths. The browser's `startup-host-words.spec.ts` and `sessions-sidebar-host-status.spec.ts` passed through the frontend substitute. |
| The attempt-attention generator can supply canonical values while retaining its differential proof. | In `node --disable-warning=ExperimentalWarning --input-type=module`, extracted `generator` through `machine` from `launch-attempt-attention.spec.ts` with `stripTypeScriptTypes` and ran seeds 1–5,000 through the real `attemptObservationSchema`. Of 22,520 observations, 18,316 had missing story titles or incomplete report facts. Adding deterministic titles and the existing `launchOutcomeFacts` report shape made all parse. Comparing original and repaired inputs through the spec's actual `pageReading` and `attemptsNeedingAttention` preserved all 5,000 page readings and attention sets. The unchanged property spec also passed in Playwright. |

## Proof and delivery gates

Before replacing a constructor, compare the old and new values at the
consuming boundary. Preserve case-driving fields, exact bytes where the test
depends on them, and all independent expectations. Record the difference and
the discriminating assertion when completing a previously abbreviated
fixture. Run the focused selections below and additional callers identified
by the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace).
Use [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
to review whether the converted setup exposes the relevant facts and removes
a duplicated constructor or translation.

Local gate: follow [test automation](../../../AGENTS.md#test-automation)
and carry the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written into every delegation and repair handoff. Follow
[native setup](../../../tests/native-setup.md) for a fresh worktree, use
Homebrew Bash 5 first on macOS, and unset `NO_COLOR` and `FORCE_COLOR`
for Playwright. Run `npm run typecheck:dashboard` when shared MakeMe sources
change. Before final delivery run `npm run test:dashboard` and `npm test`
because the common MakeMe entry point loads in both suites. On fully awake
macOS with AC power wrap each full run in `caffeinate -s -i`; on battery
follow the lid-open guard and sleep-log check in
[Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Hosted CI follows the selected execution mode. Keep native protocol tests
and fixture evidence stable and update evidence only if the consumer trace
finds an affected native scenario.

## Slices

### 1. Host joins and session rules read explicit observation facts
Type: Behavior
Status: planned
Proof: Seed example 1. Run `npm run test:dashboard -- 'backend-tests/launches/launch-observations\.spec\.ts$' 'backend-tests/sessions/(done-question-rule|session-working-count-rule|session-unread-rule|session-alerts-helper)\.spec\.ts$'`.

Two host-qualified targets share the same native ID. When one host refuses
and another reports retained review, `withStates` returns unknown and
retained review for the respective targets. Convert arranged session states
and observed records in the join and the rules that consume them. Keep the
host substitutions, controlled deadline and independent join assertions.

### 2. Passive reads keep native evidence and the page's held answer distinct
Type: Behavior
Status: planned
Proof: Seed examples 2 and 4 for session reads. Run `npm run test:dashboard -- 'backend-tests/sessions/(agent-launch-codex-observation[^/]*|session-alerts-input-continuity)\.spec\.ts$' 'backend-tests/launches/agent-launch-codex-startup\.spec\.ts$' 'dashboard/tests/sessions/(agent-launch-codex-observation[^/]*|agent-launch-sessions-unanswered|agent-launch-story-card-session-states|agent-launch-story-card-delete-problems|project-restored-session)\.spec\.ts$'` and other affected consumers.

A page already shows a session in review. A retryable read refusal leaves
the last shown session intact, while a successful read can report confirmed
unavailability. Delegate valid record assembly used only to arrange passive
observations, including `observationRecord`, and compose any synthetic live
records. Keep the fake host's native status and protocol inputs, predecessor
omissions, explicit 503, and held-response or deletion timing in their
harnesses. Real HTTP and browser journeys keep observing those distinctions.

### 3. Accepted attempts keep their own stored and live facts
Type: Behavior
Status: planned
Proof: Seed example 3 at acceptance and settlement, and example 4 at store read. Run `npm run test:dashboard -- 'backend-tests/launches/(launch-attempt-(attention|worker|retention)|settled-attempt-reconciliation|agent-launch-cross-server-accept|agent-launch-acceptance|agent-launch-change-wait)\.spec\.ts$' 'dashboard/tests/launches/(agent-launch-continuation|responsive-session-recovery-ad-hoc)\.spec\.ts$' 'backend-tests/sessions/agent-launch-sessions-history\.spec\.ts$'`.

An accepted attempt can be in progress with no session. Its later launched
outcome identifies the actual session. Convert hand-built kept attempts,
their observation inputs, and valid attempt setup in replay and recovery.
Leave actual POST bodies, malformed attempt-store text, retention times,
legacy omissions, and failure injection in their existing cases. Keep the
deterministic attempt-attention generator and its independent comparison.
Use existing completion facts to supply fields its cast currently hides.

### 4. Frontend substitutes compose the machine's answer
Type: Behavior
Status: planned
Proof: Seed example 3 at the browser boundary and the waiting-session sidebar proof. Run `npm run test:dashboard -- dashboard/frontend-tests` for the shared substitute's consumers and the trace's other callers.

A frontend answer with a running owned attempt and no session shows startup
in progress and disables the relevant Start actions. A waiting session in
a different answer contributes to the sidebar's waiting count. Convert the
shared valid machine-answer factory and its call sites, composing the
session observations and attempts already available through MakeMe. Preserve
the independent controls and counts and keep intentionally partial or
refused wire responses explicit.

## Concern evidence

Slice-plan refinement was not needed. Each slice pairs conversion with its
observing proof, and the machine-answer slice reuses earlier delivered
builders. This review found no remaining slice-specific concern.
