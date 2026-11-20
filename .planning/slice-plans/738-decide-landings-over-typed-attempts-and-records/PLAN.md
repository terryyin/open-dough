# Decide reported landings over typed attempts and records

**Identity:** SEED-413#decide-landings-over-typed-attempts-and-records
**Source:** [Decide reported landings over typed attempts and records](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#decide-landings-over-typed-attempts-and-records)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

Dashboard maintainers can prove landing preparation and recording from
composed attempts and records. `handleLanding`
(`dashboard/server/launchLandingReporting.ts`) and `submitRetainedLanding`
(`launchLandingRetained.ts`) become a store adapter over one typed landing
decision. The installed publisher's cases reach the dashboard through
production's own request admission.

Included:

- the typed landing decision for attempt-reported launches and for retained
  records (declared branch landings and expired attempts);
- the adapter taking its attempt and record stores as an explicit
  collaborator, with pinning and follow-up receipt registration before any
  save, as today;
- `branchLandingContext` taking its reporting directory from its caller and
  returning the next record for its caller to save;
- the typed landing request admission that `submitLanding` and the publisher
  bridge in `dashboard/backend-tests/support/installedPublisher.ts` both use;
- moving the four installed-publisher specs onto composed attempts and
  records, keeping the publisher only where its retained comparison and retry
  are the topic.

Excluded: the 29 [server specs](#local-gates) that reach the handler through
a real dashboard server. They stay as the adapter's regression gate here and
move with
[the later backend families](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-later-dashboard-backend-unit-test-families).
Record deletion and `installRecordRemovalDispatch` stay with
branch entry (SEED-413#split-branch-entry-proposal-from-store, done; recoverable at `9969388`)
and [delivery observation](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#observe-done-deliveries-over-typed-records).
Folding launch flavors into MakeMe stays with
[launch flavors](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#fold-done-capture-launches-into-makeme).

## Key examples and proof

| Example | Observable proof and owner |
| --- | --- |
| A record of a deleted reporting session refuses a landing, decided from composed values | Typed decision case with no store, HOME or server (slice 1). |
| Recording a comparison that was never prepared is refused, and a second prepare of the same delivery answers the first receipt, as plain values | Typed decision cases (slice 1). |
| A declared branch landing from another origin is refused, and an expired attempt's retained record still records, as plain values | Typed decision cases (slice 2). |
| A prepared pair survives Done and is recorded at landing, without the attempt store under HOME | `ad-hoc-prepared-landing-done` over a composed Done record and the adapter's store collaborator (slice 3). |
| A wrong origin or route is refused by the production admission in the publisher's bridge | Typed admission cases, and the bridge delegating to the same function (slice 5). |

Each replaced case keeps its assertions.

## Learnings

- Slice 1: under machine load ~20+, the four installed-publisher Vitest cases
  can hit the default 5 s timeout when run in parallel; they pass one-by-one in
  ~3–4 s. Prefer serial or quieter load for that regression gate until load
  drops. Playwright landing suites use the quiet reporter (empty stdout on
  pass).

## Current decisions

- Follow the [Architectural North Star](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support):
  production gets the seams; test support only loses procedures, apart from
  MakeMe steps.
- **Decision.** One function over the submission, origin, operation, kept
  attempts for the source, kept records for the source, a new receipt ID and
  the receipt time. It answers a refusal (`RefusedRequest`), or the landing,
  whether it is new, the receipt state and the next attempts and records.
  It runs `verifyLanding` for a new landing over the authorized repository,
  so it is async and reads Git. It writes no store and no ref; recording's
  check still fetches the target into `FETCH_HEAD`, as today.
- **Adapter.** `handleLanding` keeps its signature for the route and takes
  an optional store collaborator, defaulting to the machine stores. It keeps
  today's write-ahead order: under the attempt lock it decides, pins a new
  landing and registers its follow-up receipt, saves the attempts, then
  writes the records. A failed record write still answers the 500 retry
  message, and a retry finds the accepted landing.
- **Store collaborator.** Exposes the attempt read, the attempt replace and
  the record replace that the adapter uses today. Cases pass one over
  composed values. Build on the delivery observation plan's
  `ObservedLandingStore` (`{ keptRecords, changeSessionRecord }`, plan 736)
  for the record side once it has landed, rather than adding a second
  record-store shape.
- **Context.** `branchLandingContext` takes the reporting directory and
  answers the next record and context file. `submitSessionBranchEntry`
  supplies `machineDashboardPath(...)` and saves through
  `changeSessionRecord`. Reconcile with the branch-entry story's split of the
  same handler if it lands first.
- **Admission.** A typed function over route, method, `Origin` header, host
  and body text answers the operation and submission or a refusal.
  `submitLanding` reads the request into it and keeps `knownSource`, which
  reads the configured projects. The bridge calls the same function, then
  the adapter.
- **Publisher topic.** Keep the installed publisher in the two declared
  publication specs (retry of the retained input) and in
  `ad-hoc-session-comparisons` (prepared pair equals recorded pair). Move
  `ad-hoc-prepared-landing-done` off the publisher onto the adapter.
- **Builder size.** `Distribution/tests/support/launchAttemptTestData.mjs`
  is at 250 lines, the
  [file-size limit](../../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#file-size).
  Reuse the existing `capturingLanding` and `withLandingReporting` steps. A
  new attempt step first moves the landing capture steps into their own
  builder module in the same chain, with callers keeping their
  `makeMe.anAcceptedAttempt` steps.
- **Sibling stories.** This plan edits specs and support that plan 734 and
  the branch-entry and delivery-observation stories also edit. Execute
  after whichever of them is Taken lands, and reconcile with their landed
  form.

## Decisive premises

| Consuming operation | Observation |
| --- | --- |
| The four installed-publisher specs are the slice proofs and pass today | At `cf04e216e` on 2026-11-20 (load ~3.4, AC power), `caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:backend -- backend-tests/launches/declared-blank-launch-publication backend-tests/launches/declared-worktree-publication backend-tests/review/ad-hoc-prepared-landing-done backend-tests/review/ad-hoc-session-comparisons` passed 4/4 (1.05–1.52 s per case). |
| The installed publisher reaches the dashboard only through `fetch` to the two landing routes (slice 5) | Same run: the bridge's `receive` throws for any other URL, origin or method, and both publishing specs and both retries passed through it. |
| The handler's consumers are the four publisher specs and the server specs named in the local gates (slices 1–6) | At `cf04e216e` on 2026-11-20, a scratch `throw new RefusedRequest(418, "scratch")` at the top of `handleLanding`, then the whole group: `caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:backend` (load 12–19). Exactly 33 specs failed: the four publisher specs and 29 server specs, all matched by the gate's selection. With the scratch reverted, the same 33 specs ran clean and exited 0 (4 min, load 10–17). Scratch reverted. |
| Composed records with landing reporting can be built with existing steps (slices 3, 6) | `makeMe.anAcceptedAttempt…capturingLanding(...)` and `makeMe.aLaunchRecord…withLandingReporting(...)` exist at `cf04e216e` (`launchAttemptTestData.mjs:217`, `launchOutcomeTestData.mjs:121`); `reportedIsolatedBranch.ts` already composes its attempt with `capturingLanding`. |

No other premise is left unobserved. Slice 1 records the measurement
baseline before any change.

## Ordered slices

### 1. Attempt-reported landings decide as plain values

Type: Structure
Status: done

Record the [evaluation baseline](#local-gates) first. Extract the decision
for the attempt path of `handleLanding` (no retained record) and make the
adapter apply it. Add typed cases: deleted reporting session, a launch with
an outcome but no bound record, another story's identity, recording an
unprepared comparison, a second prepare of the same delivery, a different
comparison after acceptance, and a new prepare answering `prepared` with the
next attempts holding the pair.

**Proof.** The typed cases pass with no HOME stub, store or server.
Removing the deleted-session check in a scratch edit fails its case. The
four installed-publisher specs and the handler's server specs pass
unchanged. Enables slice 2.

### 2. Retained-record landings decide in the same decision

Type: Structure
Status: done

Fold `declaredLandingRecord`, `expiredAttemptRecord` and
`submitRetainedLanding` into the decision over the composed records, so the
adapter holds the only store reads. Add typed cases: a declared branch
landing from another origin or host is refused, a deleted declared landing
is refused, an expired attempt inside retention is refused, and one beyond
it records against its retained record.

**Proof.** The typed cases pass without HOME. The declared publication specs
and `one-shot-landing-recovery-*` pass. `rg "keptRecords|replaceRecords"
dashboard/server/launchLanding*.ts` finds only the adapter.

### 3. The landing adapter takes its stores as a collaborator

Type: Structure
Status: done

Add the store collaborator. Move `ad-hoc-prepared-landing-done` onto a
composed Done record with landing reporting, calling the adapter with
composed stores in place of the publisher's `prepareLanding` and
`recordLanding` through HOME. Keep its assertions (prepared state, the
preparation kept through Done, the recorded receipt, the landed review).

**Proof.** The spec passes with no HOME stub. Making the adapter skip the
preparation carry-over in a scratch edit fails it. The handler's server
specs pass.

### 4. A declared branch's landing context is written where its caller says

Type: Structure
Status: done

Make `branchLandingContext` take the directory and answer the next record
and file. `submitSessionBranchEntry` keeps writing under the machine
dashboard path and saving through `changeSessionRecord`.
`aDeclaredPublisherBranch` passes a temporary directory and composes the
record it answers.

**Proof.** `declared-blank-launch-publication`,
`declared-worktree-publication` and the session branch handoff specs
(`ad-hoc-session-branch-handoff`, `ad-hoc-session-branch-entry`) pass.
`rg machineDashboardPath dashboard/server/branchLandingContext.ts` finds
nothing.

### 5. The publisher bridge uses production's landing admission

Type: Structure
Status: done

Add the typed admission and make `submitLanding` and `receive` in
`installedPublisher.ts` use it. Add typed cases for another origin, another
route, a non-POST method and a malformed body. The bridge keeps only the
`fetch` stub and the `Response` mapping.

**Proof.** The admission cases pass. Changing the origin rule in a scratch
edit of the production admission fails both its case and a publisher spec.
The four publisher specs pass. `installedPublisher.ts` imports no
`landingSubmissionSchema` or route constants.

### 6. Installed-publisher cases run over composed attempts and records

Type: Structure
Status: planned

Pass the store collaborator through the bridge. Make `aReportedIsolatedBranch`
hand its MakeMe attempt and record to it, retiring `replaceAttempts` and
`keep`; its landing context stays written by `writeLandingContext`. Move the
declared publication specs' landing stores the same way, leaving record
deletion on the record store. Measure the evaluation.

**Proof.** The four publisher specs keep their assertions with no
`replaceAttempts` call in `backend-tests/`. The Done capture family and
`backend-tests/launches/` pass. The evaluation table is recorded under
[Local gates](#local-gates).

## Local gates

- Follow the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Apply [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) before
  editing tests or builders. Keep default test timeouts. Never use
  `test.slow()`.
- On AC power, run tests under `caffeinate -s -i`, as
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  describes, with `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR`.
  Each slice runs `npm run --silent test:dashboard:backend -- <its specs>`
  plus the handler's server specs, then
  `npm run typecheck:dashboard` and `npm run lint`. A slice that adds a
  builder module runs the
  [consumer trace](../../../.claude/skills/dough-execute-plan/scripts/consumer-trace.mjs)
  and its `Distribution/tests` readers. The family gate is
  `npm run --silent test:dashboard:backend -- backend-tests/review backend-tests/launches backend-tests/sessions backend-tests/intent`.
- The handler's server specs are selected by
  `backend-tests/review/one-shot-landing backend-tests/review/story-branch-landing backend-tests/review/story-branch-retained-landing backend-tests/review/story-review-completed-capture-fallback backend-tests/launches/agent-launch-start-session-landing backend-tests/intent/landed-ci`.
  [Decisive premises](#decisive-premises) records how they were found.
- Evaluate under
  [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Before slice 1, at the execution base, record lines and importers of
  `installedPublisher.ts`, `declaredPublisherBranch.ts` and
  `reportedIsolatedBranch.ts`, `replaceAttempts` and `vi.stubEnv("HOME"`
  reach in the four publisher specs, and their per-case time from the
  Vitest JSON report. After slice 6, record the same at comparable load
  (`uptime`), using three interleaved runs on the base and candidate.
  Cases count unchanged or higher, with every assertion kept.

### Evaluation baseline (before slice 1, at `6e9496454`)

Recorded 2026-11-20 on AC power (load ~12). Evidence:
`open-dough/evidence/slice1-evaluation-baseline.md`.

| File | Lines | Backend-test importers |
| --- | ---: | ---: |
| `installedPublisher.ts` | 136 | 3 |
| `declaredPublisherBranch.ts` | 74 | 5 |
| `reportedIsolatedBranch.ts` | 65 | 1 |

`replaceAttempts` reach in the four publisher specs: via
`reportedIsolatedBranch.ts` and directly in
`declared-worktree-publication.spec.ts`. `vi.stubEnv("HOME"` reach: all four
through `doneCaptureCase` / declared and reported branch helpers.

Publisher per-case times (one timed run): worktree 3054 ms, session-comparisons
3526 ms, blank 2918 ms, prepared-landing-done 2570 ms (4/4 pass, 9.11 s).

## Plan review

Slice-plan refinement was not needed. Every slice keeps one group's
assertions at a single owner. Slices 1–2 build the decision, attempt path
first. Slice 3 adds the store collaborator and its first composed case.
Slices 4–5 take the context and admission seams. Slice 6 moves the
remaining publisher cases. Each slice has its own proof loop and the server
specs as its regression gate. This review found no remaining slice-specific
concern. The sibling-story overlap is a reconciliation decision, not a
blocking dependency: this story's production seams do not wait on theirs.
