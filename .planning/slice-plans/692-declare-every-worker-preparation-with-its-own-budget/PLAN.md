# Declare every worker preparation with its own budget

**Identity:** SEED-340#declare-every-worker-preparation-with-its-own-budget
**Source:** [Worker preparation correction](../../seeds/SEED-340-test-preparation-outside-case-budgets.md#declare-every-worker-preparation-with-its-own-budget)
**Source review:** [Source-only commitments](source-review.md)

## Correction input

The maintainer should be able to select a preparation-page case with any of
the delivered histories, run it first or later, and rely on the same worker
pool and the same 30-second case budget. The retrospective of
SEED-340#keep-one-time-test-preparation-out-of-case-budgets identified six
gaps in the test support and its proof. Plan 685 is recoverable on
`claude/keep-one-time-browser-test-preparation-out-of-ca`, range
`29c9ce209..b4a3dce32`, slice commits `06eccefa7`, `dc6519dd5`,
`cbc0fb182`, `6a7043c2b`, `938e9cac7`, `b4a3dce32` and CI repairs
`d7fbd57e1`, `d285e9d2b`. The [delivered queued-origin check](../../done/SEED-340_keep-one-time-test-preparation-out-of-case-budgets.json)
records the missing-dependency failure and its restoration at `a47cbf7f7`.

Scope covers the kept histories, native queued input, superseded opt-ins,
Codex observation helper and runtime proofs below. Product behavior, other
worker resources, and a new throughput or load benchmark are outside this
correction. Keep the original scenario assertions, real Git history, host
layouts, and each case's private writable origin, checkout, HOME and server.

## Current decisions and evidence

Reuse the worker pool declared by `dashboard/tests/support/pageTest.ts`, the
60-second `coldInputPreparation` option in `publishedMainWorkerFixtures.ts`,
and the existing run artifact owner. The pool registers each preparation once
and resolves it on demand. A test-scoped override can select what its own
origin copies. The startup, boundary and development profiles keep their
distinct serving needs. These choices follow the [dashboard worker convention](../../../dashboard/tests/README.md)
and the feedback principle in [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).

The following observations used this preparation checkout at `099dbe6f1`,
locked Playwright 1.65.0 and Node 24.21.0 on AC power. Commands below use
the strict local gate at the end of this plan. Scratch changes were reverted.

| Decisive premise | Consuming operation and observed result |
| --- | --- |
| A spec-local worker declaration causes a restart. | `test:e2e -- intent/intent-ci-comparison-retry.spec.ts --workers=1` ran both real journeys on worker indexes 0 and 1. With the compared history registered in the common pool and only the origin override in the spec extension, both passed on index 0. Only the first requested the kept history. |
| Four cold preparations have the wrong allowance. | A disposable Backend case took `keptStory`, `keptIntentStory`, `keptSummaryComparisonStory` and `queuedCodexOriginReady`. A temporary observation at the locked runner's active timeout slot recorded 30,000 ms and a slot distinct from the case for **each**. Substituting `coldInputPreparation` recorded 60,000 ms for all four. In the real retry journey the compared history already had 60,000 ms and the private `origin` used the case's 30,000 ms. Ordering alone cannot distinguish the two worker allowances. |
| The old preview imports and the landed-CI wrapper have different effects. | With the two direct aliases replaced at all 21 E2E import sites, the side-panel replacement journey passed. With the redundant in-body wait removed, Backend's lost-workspace Codex retry passed. Moving bundle readiness from the landed-CI wrapper to `startServer` kept `intent/landed-ci-server-lifetime.spec.ts` green, including late server cleanup. Its trace contained two bundle requests, zero app requests and two Claude queued-origin requests (previously three). The combined import/fixture edits passed `typecheck:dashboard`. |
| The common log reader preserves the two observation boundaries. | With `codexEnvironments` using `appendedFileRecords`, the saved-conversation daemon-startup case and saved-context terminal-resume case both passed. The helper reads complete newline-terminated records and returns an empty list for an absent file. `daemonStarts` currently requires its log to exist. |
| Group registration has an independent witness. | The three existing nested budget cases passed. In normal group runs, Integrated's `navigation/story-destination-repeat-cue.spec.ts` and E2E's `intent/intent-ci-comparison-retry.spec.ts` requested both queued keys. Withholding **each key in turn** from each actual global setup failed the selected case naming the missing key (four failures). Restored runs passed 1/1 and 2/2. These existing runs detect missing registrations without starting another group or building another eager story-columns history for that purpose. |
| The development notification journey lacks a demand assertion. | `test:e2e -- sessions/session-alerts-navigation.spec.ts --grep 'dev on its own ephemeral port' --workers=1` passed with zero app/bundle requests, and also passed with an injected preview dependency that requested both. A disposable nested Backend run shared the actual dev fixture, fetched `/@vite/client`, and checked its owner's request trace. It passed clean, failed with both unexpected keys, and passed after restoration. |

## Ordered slices

### 1. Kept and ordinary histories share a worker

Type: Structure
Status: done
Proof: Register `keptComparedStoryBranch` lazily in the common pool, keeping
its existing cold budget. Keep the real-CLI preparation in
`keptComparedStoryBranch.ts` and the per-case `originRepository` override
that consumes its description. Exercise the kept and ordinary paths in one
fresh one-worker run. Record the actual worker index for each, the kept
history only where requested, and independent private origins. A local
worker registration must break the same-worker assertion. Retain both real
retry cases, including upstream read counts, reselection and shallow recovery.
Accepted proof: `runtime/kept-history-worker.spec.ts` (Backend) runs
`kept-history.proof.ts` once with one worker: ordinary, kept and ordinary cases
share one worker index, only the kept case takes `keptComparedStoryBranch`, and
the three origins differ with the kept completion only in the kept one. A
spec-local worker fixture moved the kept case to another worker and failed it.
The retry spec stays unchanged and passed 2/2. Learning: cross-case records in a
product spec make assertions order-dependent; worker-pool claims belong in a
nested proof run.

### 2. Cold history and native origin setup get 60 seconds

Type: Structure
Status: done
Proof: Use the shared cold option on the three kept stories and the native
Codex queued origin. Correct the explanation of the worker default. Extend
the focused preparation proof to take the real fixtures and observe kept
setup finishing before the private origin starts. Pair that runtime proof
with a check of the 60-second allowance on the actual registrations used by
the pool. Reverting one to plain worker scope must fail the allowance check
even on a fast machine. Keep the 30-second case default and the full setup
in run elapsed time. The preparation probe's runner instrumentation is
disposable and need not ship.
Accepted proof: `pageTest.ts` exports `workerPreparationFixtures`, every
worker input preparation in the pool. The Backend
`runtime/kept-history-worker.spec.ts` checks each non-option registration
against `coldInputPreparation`; reverting `keptIntentStory` or
`launchJourney` failed it. Its nested `kept-story.proof.ts` run shows each
kept story ending before its case's private origin starts and the native
Codex origin prepared only where taken. `launchJourney` joined the cold
preparations; `comparisonRenderer` and `serverMode` keep plain worker scope.

### 3. Preparation-page readers use the ordinary test

Type: Structure
Status: planned
Proof: Remove both no-op preview aliases from `preparationPage.ts`. Migrate
their importers, preserving local names and history overrides. Remove the
duplicate native-origin wait in Backend's
`agent-launch-preparation-codex-retry.spec.ts`. Run the moved readers
through their groups, including the side panel and damaged retained retry.
Resolve imports by module. The identically named fixture from
`responsiveStart.ts` supplies real readiness to its own origin, as do the
independent Codex-start fixtures. Preserve those dependencies and the native
readers that use `queuedCodexOriginReady` directly.

### 4. Landed-CI boundary starts prepare their own bundle

Type: Structure
Status: planned
Proof: Make `landedCiHistoryTest.ts`'s custom `startServer` fixture take
`dashboardBoundaryReady` once. The inherited origin already takes both
queued bases. Remove `queuedClaudeBoundaryTest` at its ten consumer sites,
preserve their case-specific extensions, and remove its now-unused combined
readiness registration. Trace custom starts and the cases that take the
common `dashboard` directly. In a fresh former opt-in case, observe the
bundle completed before custom server setup and zero app requests. Run
the landed-CI consumers, including the late-start teardown and kept-history
cases. Keep bundle preparation attached to the consumer of the bundle.

### 5. Codex startup and resume read complete environment records

Type: Structure
Status: planned
Proof: Reuse `appendedFileRecords` in `codexEnvironments`. Preserve the
command filter, record order, and absent-file and unterminated-tail behavior.
Keep `daemonStarts`'s required-file behavior. Run the existing
`agent-launch-codex-startup` and `agent-terminal-codex` specs that inspect
the actual fake's app-server and resume environments.

### 6. One cold origin run proves timing and isolation

Type: Structure
Status: planned
Proof: Keep the full gated `test-preparation-budget.spec.ts` journey under
`backendGlobalSetup.ts` once. Retain both held layouts, completion relative
to private setup, the separate case intervals, three independent writable
origins, and the later-revision assertions. Replace the Integrated and E2E
nested repetitions with their ordinary group registration coverage identified
above. Preserve a cheap real check of both keys in each group if a consuming
journey moves. Confirm one nested budget selection and each group's rejection
of an omitted key. Keep existing artifact failure and teardown coverage.

### 7. Development notifications serve source with zero build requests

Type: Structure
Status: planned
Proof: Share the existing `dashboardServedIn` fixture from
`session-alerts-navigation.spec.ts` with one minimal nested consumer through
`startPreparationProofRun`. Open the development server, verify it serves
the Vite client, and inspect the fresh owner's trace for zero `app` and
`server-bundle` requests. Adding preview readiness to this dev fixture must
fail the new assertion. Restore and run the strict nested proof and the
original dev and preview notification cases, including the actual serving
URL and absence of extra host actions. Keep the common boundary and frontend
proofs with their existing owners.

## Execution gates and readiness review

For each slice, run the installed test-entry selection and consumer trace
before editing shared test support. Apply MakeMe where selected and Page
Objects for the selected browser tests. Keep files at or below 250 lines.
Each slice owns its external proof and independent post-change refactor
before commit. Run the changed group specs and `npm run --silent typecheck:dashboard`.
Local gate (awake macOS on AC power) follows [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).

```sh
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent <group-script> -- <affected-specs> --workers=1
```

Use the group's strict reporter and its proof record when retaining results.
Keep existing timeouts and event-driven synchronization. Apply the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written and carry that link into every delegation brief and repair handoff.

Slice-plan refinement split the draft's three mixed proof loops into seven
bounded Structure slices, each sized for the 15-active-minute limit. All
six retrospective findings have an owner. The review identified no remaining
slice-specific concern.
