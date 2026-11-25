# Prove Intent CI comparison and landed history reads through their typed reads

**Identity:** SEED-413#renovate-remaining-backend-families-after-launch-admission
**Source:** [Prove Intent CI comparison and landed history reads through their typed reads](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-remaining-backend-families-after-launch-admission)

## Goal and scope

Give maintainers fast, compile-time-checked feedback, with no dashboard
server, when they change how Intent compares a story's CI with trunk or reads
landed CI history. Move the seed's 22 Playwright-selected specs under
`dashboard/backend-tests/intent/` to plain Node Vitest, at about 100 ms per
case:

- comparison memory: `ci-comparison-client-identity`,
  `ci-comparison-finality-{answered,equivalent-recovery,no-run,receipts,unanswered}`,
  `ci-comparison-memory-{final,fresh,later,recovery}` and
  `ci-proof-memory-github-gaps`;
- landed history reads: `ci-done-history-retry`,
  `ci-done-wall-{availability,reference}`,
  `ci-history-{glance,measure,reader}-compatibility`,
  `ci-history-slim-response`, `ci-prior-build-revision-order` and
  `ci-project-measure-reference`;
- server-arranged comparison: `intent-ci-comparison-pending-proof` and
  `intent-ci-comparison-receipt`.

Exclusions are the seed's boundary: the landed CI repeat and lifetime specs
stay with SEED-324's correction. Runner proof-record specs retire with the
runner. GitHub-backed authenticated reads, including
`authenticated-read-intent-*` and `intent-ci-status-read-boundary`, stay with
their family. Every other Playwright-selected spec stays with
SEED-413#renovate-remaining-backend-families-after-intent-ci-readers. The
shared authenticated-read boundary keeps its origin, method, caching and
status framing (such as a failed outcome's 502) with its existing owners.

## Current decisions

- Entries and inputs:
  - Comparison cases call `performIntentCiComparisonRead(source, read,
    signal, evidence)` with a typed `StoryCiComparisonSource`, which supplies
    endpoints, builds, receipts and the observation clock. Each case
    clears and restores the default comparison memory through
    `clearCiComparisonAnswers`.
  - History cases parse their query with `parseIntentCiHistoryRead` and call
    `performIntentCiHistoryRead(source, read, { home, localRepository })`.
    They keep MakeMe `aLandedCiHistory` in a temporary home and stub no
    `HOME`. A real Git origin is used only where local landing order decides
    the answer.
  - Request refusals are unit cases of `parseIntentCiHistoryRead` with
    `URLSearchParams`.
- One production seam. The launch record store reads only this machine's
  home (`launchStore()` in `dashboard/server/launchRecordDocument.ts`). The
  landed CI history store already takes `home`
  (`historyStore(home?)`). Give the launch store and `readableRecordsByProject`
  the same optional `home`, and let the comparison source's receipt reading
  take it, so a case reads real unreadable bytes from its own home. The
  adapter keeps resolving this machine's home.
- Give each behavior one owner. `ci-comparison-finality-receipts` already
  proves unreadable launch and history captures over typed
  `LandingReceiptFacts`. `ci-comparison-finality-unanswered` already proves
  equivalent and later malformed listings and provider waits in process.
  `landed-ci-history-pending-proof` proves the pending history gap becoming a
  point. `observation/authenticated-read-shared-listing-failures.spec.ts`
  proves a directed wait ends when the request-owner clock advances (slice 5
  discrimination); `observation/shared-request-owner.spec.ts` covers shared
  owner waits by wall time. A server case is dropped only when every one of
  its observations has a named surviving owner. An observation without one
  becomes an in-process case.
- Follow the North Star topics
  [make production code directly testable](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Delete support that only this cohort uses once it is unused:
  `test-support/support/pendingLandedComparison.ts`,
  `test-support/support/missingLandedRun.ts`, and the HTTP reader in
  `backend-tests/support/retainedGlanceHistory.ts`. The comparison-memory
  fixture in `backend-tests/support/comparisonMemory.ts` stops using
  Playwright. Add no wrapper to `dashboard/test-support/`. Shared helpers
  (`landedCiTrunk`, `landedCiHistoryTest`, `preparationPage`, `rawHttp`,
  `landedCiHistory`, `listingReuseWithOwnerClock`) keep their other users.
- [ADR 0010, definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  judges speed, clarity and deleted support together. Each moved case keeps
  its observation. A dropped one names its owner.
- Vitest selection (`isVitestFile`) requires a direct `import … from "vitest"`
  in each moved **spec** file. A fixture that re-exports `test`/`expect` from
  Vitest is not enough for selection. Later history and comparison slices must
  give each converted spec that import.

## Baseline and decisive premises

Baseline at `2bf3fe927` on 25 November 2026 in the preparation worktree,
Node 24.21.0, macOS on AC power, load average about 26 from unrelated work.
Maintained command, default workers:

```sh
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES \
  PATH=/opt/homebrew/bin:$PATH \
  OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$proof_file" \
  npm run --silent test:dashboard:backend -- <the 22 spec paths>
```

All 22 files on Playwright passed: 59 cases, 54.3 s summed and 48 s
elapsed, with 16 cases over 100 ms. `intent-ci-comparison-pending-proof`
took 24.0 s and `intent-ci-comparison-receipt` 11.7 s. The other nine history
specs took 1.4–3.1 s each, and the eleven comparison-memory specs under
0.2 s together. CI run `45535651060` on `b127d984f` gave the selection 20.3 s.
Under load, compare after-times against this baseline only relatively, or
rerun both on a quieter host.

| Consuming operation | Observation in the preparation checkout | Result |
| --- | --- | --- |
| Comparison-memory specs run on Node Vitest through the maintained runner | Scratch at `2bf3fe927`: `comparisonMemory.ts` imported `test` from `vitest`, and each of the 11 specs imported from `vitest`. Ran the same command filtered to the 11 paths. | 11 files and 43 cases passed in 3.1 s; the largest case took 29 ms. `npx eslint` refused `no-unsafe-assignment` at `ci-comparison-client-identity.spec.ts:55` and `ci-proof-memory-github-gaps.spec.ts:101`, where an asymmetric matcher is assigned. Slice 1 changes those two assertions. Reverted. |
| A history case answers in process from a temporary home with no server | Disposable Vitest spec under the same command. MakeMe history from `ci-done-wall-availability` kept in a `mkdtemp` home, `parseIntentCiHistoryRead` of its query, then `performIntentCiHistoryRead(source, read, { home })`. | Passed in 16 ms with `uncollected` (5 samples, 100,000 ms average) and `order-unavailable`, as the server case asserts. Removed. |
| The comparison source can read receipts from a case's own home | Read `storyCiComparisonSource.landingReceipts`, `readableRecordsByProject` and `launchStore()`. | The launch store has no `home` parameter; the history store has one. Slice 3 adds the seam described above. |
| The pending-proof server observations have in-process owners | Read the test titles of the owners named in Current decisions. | Titles match the observations but do not settle ownership. Slice 4 checks each owner by discrimination before dropping anything. Otherwise the observation stays as an in-process case. Either outcome fits the slice. |

## Slices

### 1. Comparison memory runs on Node Vitest

Type: Behavior
Status: done
Proof: the 11 comparison-memory specs select Node Vitest under the maintained
runner and pass all 43 cases with unchanged titles and assertions. Make the
two asymmetric-matcher assertions pass lint without weakening them. The
comparison-memory fixture clears answers before and after each case on
Vitest. `npm run typecheck:dashboard` and lint pass for the changed files.

Behavior: given the arranged comparison facts, each repeated read in one
process answers the same comparison it did on Playwright. Each case starts
from empty memory.

Estimated active work 8–12 minutes.

Accepted proof (coordinator): focused `test:dashboard:backend` on the 11
paths → Vitest `RUN v5.1.0`, 11 files / 43 cases passed (~4.6 s); typecheck and
eslint on changed paths exit 0. Evidence:
`open-dough/evidence/slice1-comparison-memory-vitest-20261125-121237-report.md`
and run records `slice1-tests|typecheck|lint|consumer-trace-20261125-121237`.
Fixture: `comparisonMemory.ts` uses Vitest `test.extend` and still clears
answers before/after each case. Asymmetric matchers cast `as unknown` without
weakening. Refactor disposition: skip fresh pass — subject specs plus their
fixture only; no new product representation.

### 2. Done and endpoint history reads answer in process

Type: Behavior
Status: done
Proof: `ci-done-history-retry`, `ci-done-wall-availability`,
`ci-done-wall-reference`, `ci-prior-build-revision-order` and
`ci-project-measure-reference` run on Node Vitest. They call
`performIntentCiHistoryRead` with MakeMe history in a temporary home and a
real Git origin only where local landing order is the subject. They keep
their availability, reference, sample, ordering and measure assertions. The
retry case observes a `failed` outcome with its retry message, then the
answer after the document is restored. The read takes no CI client, so it
cannot ask Actions.

Behavior: given kept landed history, a Done or project read for an exact
endpoint answers the same selection, availability and reference as through
the server.

Estimated active work 12–15 minutes.

Accepted proof (coordinator): focused `test:dashboard:backend` on the five
paths → Vitest, 5/5 passed (~3.1 s); typecheck and eslint exit 0. Evidence:
`open-dough/evidence/slice2-done-endpoint-history-vitest-20261125-122228-report.md`.
Temp home + `keepLandedCiHistory`; no HOME stub; Git origin only in
prior-build-revision-order. Retry asserts failed Outcome then answered.
Refactor disposition: skip — subject specs only; no new product representation.

### 3. History capability projections and refusals answer in process

Type: Behavior
Status: done
Proof: `ci-history-glance-compatibility`, `ci-history-measure-compatibility`,
`ci-history-reader-compatibility` and `ci-history-slim-response` run on Node
Vitest. Glance and measure answers are compared with the full answer from
the same kept history. Capability negotiation refusals (repeated or
unsupported values, mixed scopes, a glance of project history) become
`parseIntentCiHistoryRead` unit cases. Delete the HTTP reader in
`retainedGlanceHistory.ts`.

Behavior: given the kept glance history, a selected Done or scoped read with
the glance or measure capability answers the projection of its default
answer, and refused parameters return the refusal without a read.

Estimated active work 10–14 minutes.

Accepted proof (coordinator): focused Vitest 4 files / 6 cases; typecheck and
eslint exit 0. Evidence:
`open-dough/evidence/slice3-history-capability-vitest-20261125-123017-report.md`.
HTTP `rawRequest` reader removed from `retainedGlanceHistory` (in-process
`historyAnswer(home, query)` kept). Refusals are parse-only unit cases.
Refactor disposition: skip — subject specs + cohort helper only.

### 4. Unreadable captures are read from the case's own home

Type: Behavior
Status: done
Proof: add the launch-store `home` seam, then replace
`intent-ci-comparison-receipt` with a Node Vitest case. Write unreadable
bytes into a temporary home's launch store or history document. Read the
receipts through the comparison source with that home. The resulting
comparison answers `none`, then the exact build once that run exists.
`ci-comparison-finality-receipts` keeps the typed variants. The existing
launch-record consumers pass unchanged, with the store's default home.
Delete `missingLandedRun.ts` once unused. Run the
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
for `launchStore`, `readStoredRecords` and `readableRecordsByProject`.

Behavior: given an unreadable launch store or history document in the
machine home the read names, the comparison takes no age from it and still
reports published completion.

Estimated active work 12–15 minutes.

Accepted proof (coordinator): Vitest receipt 2/2; finality-receipts 6/6;
launch-record Playwright consumers 7/7; typecheck/eslint exit 0. Evidence:
`open-dough/evidence/slice4-unreadable-captures-home-20261125-123742-report.md`.
Optional `home` on launchStore/readStoredRecords/readableRecordsByProject and
`storyCiComparisonSource(..., home?)`. `missingLandedRun.ts` kept — still used
by `e2e/intent/intent-ci-comparison-missing-run.spec.ts`. Refactor disposition:
skip — optional home mirrors historyStore; no new domain representation.

### 5. Pending proof keeps one owner for each observation

Type: Behavior
Status: done
Proof: for each observation in `intent-ci-comparison-pending-proof`, name its
owner. For each named owner, temporarily disable the behavior in production
and show that the owner fails, then restore it. Observations: malformed
listing recovery beyond the landing hour, final reuse with no further
listing, the pending history gap becoming a point, a held provider wait for
equivalent and later proof, and the wait ending at the owner's clock. Delete
the spec only when every observation has a discriminating owner. Otherwise
move the uncovered observation into an in-process comparison or history
case. Delete `pendingLandedComparison.ts` once unused. Record each
disposition in this plan.

Behavior: given a pending equivalent or later proof, Intent's comparison and
history still recover, and repeat no acquisition once final, with every
regression check on Node Vitest or in a named owning family.

Estimated active work 10–15 minutes.

Accepted proof / dispositions (implementation; Status stays planned for
coordinator delivery): every observation has a discriminating owner; deleted
`dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts`
and unused `dashboard/test-support/support/pendingLandedComparison.ts`.
Scratch discrimination at `/tmp/slice5-pending-proof-disc-*` on
`fc5779c46`, then restored; evidence under
`open-dough/evidence/slice5-disc-*-20261125-125015.*`.

| Observation | Owner | Discrimination |
| --- | --- | --- |
| Malformed listing recovery beyond the landing hour | `ci-comparison-finality-unanswered` (`equivalent`/`later` `malformed listing` stays live beyond receipt and walk bounds…) | Break: `ciProofArtifact.ts` `unreadable-listing` returns without `unansweredAs`. Fail: `expected [1,0] to equal [2,0]` on second ask. Restore pass. Logs: `slice5-disc-obs1-malformed-{break,restore}-20261125-125015`. |
| Final reuse with no further listing | `ci-comparison-finality-unanswered` (same family; `toBe(recovered)` / no further acquisitions) | Break: `isFinalCiComparisonAnswer` always `false`. Fail: Object.is on remembered recovered answer for all six unanswered cases. Restore pass. Logs: `slice5-disc-obs2-final-reuse-{break,restore}-20261125-125015`. |
| Pending history gap becoming a point | `landed-ci-history-pending-proof` | Break: `landedCiHistoryEntries.ts` suppresses `points.push`. Fail: expected `kind: "point"` after GitHub answers; got gap-only. Restore pass. Logs: `slice5-disc-obs3-history-point-{break,restore}-20261125-125015`. |
| Held provider wait for equivalent and later proof | `ci-comparison-finality-unanswered` (`equivalent`/`later` `provider wait`…) | Break: `GitHubAcquisitionHeld` in `unreadableBy` returns without `unansweredAs`. Fail: only the two provider-wait cases (`[1,0]` vs `[2,0]`); malformed/transient still pass. Restore pass. Logs: `slice5-disc-obs4-provider-wait-{break,restore}-20261125-125015`. |
| Wait ending at the owner's clock | `observation/authenticated-read-shared-listing-failures` (rate-limited listing + `advanceOwnerClock`; same `listingReuseWithOwnerClock` seam as the retired server cases). Plan candidate `shared-request-owner` covers shared-owner wait ending by wall time, not the controlled owner clock. | Break: `ReadAdmission.heldBack` clamps `nowMs` so a directed wait never ends when the owner clock advances. Fail at `advanceOwnerClock` then `status).toBe(200)` → received 502. Restore pass. Logs: `slice5-disc-obs5c-owner-clock-{break,restore}-20261125-125015`. |

No in-process comparison/history cases were added; coverage stays with the named owners.

## Concern evidence

Slice-plan refinement was not needed. The slices follow the cohort's three
entry groups. The history group divides by Done and endpoint reads versus
capability projections, to fit the slice time. Slice 4 holds the only
production seam, and slice 5 holds the only proof-ownership decision. Its
outcome is bounded either way. No remaining slice-specific concerns were
identified.

## Verification and delivery

- The local gate uses the maintained
  [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  (`caffeinate -s -i`, on AC power) and the shared
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Keep the default timeout. Apply MakeMe for the backend sources.
- Run each slice's specs focused with the maintained backend runner. After
  slice 5, rerun the baseline command for the surviving selection and
  confirm every file selects Node Vitest. Record individual case times
  against about 100 ms, case count, summed case time and elapsed time. Note
  the host load. Account for coverage moved to or kept by other families.
- Run `npm run typecheck:dashboard` and `npm run lint -- --staged`. Search
  for consumers of every deleted helper before deleting it. Slice 4 changes
  a shared production store, so its slice reruns the launch-record consumers
  the trace lists.
