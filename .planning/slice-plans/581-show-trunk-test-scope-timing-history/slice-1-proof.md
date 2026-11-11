# Slice 1 implementation return evidence

Base: 4f52bca1dbaac29a5d3d479975c50106774ee5fd. All implementation and test changes are uncommitted in the established execution checkout. Coordinator planning/source-review edits are unowned and untouched.

## Outcome and observations

- `dashboard/tests/intent/intent-project-scope-timing-history.spec.ts` uses actual CLI-produced summary artifacts and actual background collection, then a fresh preview reader. No projected history is injected. With no selected story it opens entry, folder, nested folder and file Proof. Its independent rows assert entry11/14/12s, folder9/12/10s (including a ghost descendant absent from tree), nested/file8/11/9s, case/file units, actual Nov5/6/7 dates, run101/102/103 links and provenance.
- The same journey advances real trunk to an uncollected head, explicitly retains branch/main + observed endpoint SHA + observation timestamp, and reads independently evidenced preceding history plus an explained synthetic endpoint gap. The real live CI judgment describes an older measured build. History does not pin to that older measured revision.
- Its phone390px evidence list is readable, dates/values exist without hover/colour, Builds/evidence links are reached in order by keyboard, Purpose/Proof switching retains history, real store corruption produces local failure, file Proof stays usable, and Retry restores real collected rows. Historical artifact acquisition count does not increase on navigation or retry.
- `dashboard/frontend-tests/intent-project-scope-history-recovery.spec.ts`: configured `trunk` variant keeps endpoint identity on initial503 and empty recovery while the scope table remains usable; request endpoint IDs remain the observed revision, independently of older CI status. Second case proves project endpoint wording for complete measured zero, distinct partial-file-unit gap, plotted zero, chart accessible description and selected endpoint point, with no complete file-unit chart invented.
- Existing collected Done entry/file/gap, timing provenance/legacy/segments/units/recovery, prior-build, Summary and file Proof consumers preserve their observations. Moved synthetic UI checks use the existing live production provider/Scope mount with canonical MakeMe facts; real collection and full-app Done owners remain integrated.

## Commands and truthful verdicts

The first broad command was:

```sh
caffeinate -s -i npm run test:dashboard -- dashboard/tests/intent/intent-project-scope-timing-history.spec.ts dashboard/frontend-tests/intent-project-scope-history-recovery.spec.ts dashboard/tests/intent/intent-scope-collected-timing-history.spec.ts dashboard/tests/intent/intent-scope-collected-file-timing-history.spec.ts dashboard/tests/intent/intent-scope-collected-file-timing-gaps.spec.ts dashboard/tests/intent/intent-scope-timing-history-gap-build.spec.ts dashboard/tests/intent/intent-scope-timing-history-gaps.spec.ts dashboard/tests/intent/intent-scope-timing-history-legacy.spec.ts dashboard/tests/intent/intent-scope-timing-history-provenance.spec.ts dashboard/tests/intent/intent-scope-timing-history-reading.spec.ts dashboard/tests/intent/intent-scope-timing-history-segments.spec.ts dashboard/tests/intent/intent-scope-timing-history-units.spec.ts dashboard/tests/intent/intent-scope-prior-build-average.spec.ts dashboard/tests/intent/intent-scope-prior-build-states.spec.ts dashboard/tests/intent/intent-summary-ci-proof.spec.ts dashboard/tests/intent/intent-summary-ci-proof-gaps.spec.ts dashboard/tests/intent/intent-summary-ci-proof-kept.spec.ts dashboard/tests/intent/intent-summary-ci-proof-table.spec.ts dashboard/tests/intent/intent-summary-ci-proof-sort.spec.ts dashboard/tests/intent/intent-file-purpose-proof.spec.ts dashboard/tests/intent/intent-ci-wall-time-history.spec.ts dashboard/tests/intent/intent-ci-prior-build-average.spec.ts dashboard/tests/intent/intent-ci-prior-build-states.spec.ts --workers=1
```

It exited1 with exactly3 failing cases, all default30s timeouts: history-reading, segments/all-gaps, units. Other selected cases passed. This was not treated as green. Trace retained at `dashboard/test-results/2026-11-11T08-20-28.463Z-63002/`. The synthetic presentation cases spent their budget publishing full Done histories and navigating the Board/acquiring unrelated comparisons before the history assertions. The repair moves all3 files unchanged in promise/assertions to the frontend root and supplies their already-synthetic inputs through the existing production provider mount; no timeout is increased. Old → current locations:

- dashboard/tests/intent/intent-scope-timing-history-reading.spec.ts → dashboard/frontend-tests/intent-scope-timing-history-reading.spec.ts
- dashboard/tests/intent/intent-scope-timing-history-segments.spec.ts → dashboard/frontend-tests/intent-scope-timing-history-segments.spec.ts
- dashboard/tests/intent/intent-scope-timing-history-units.spec.ts → dashboard/frontend-tests/intent-scope-timing-history-units.spec.ts

The repair and direct default-render consumer command was:

```sh
caffeinate -s -i npm run test:dashboard -- dashboard/frontend-tests/intent-scope-timing-history-reading.spec.ts dashboard/frontend-tests/intent-scope-timing-history-segments.spec.ts dashboard/frontend-tests/intent-scope-timing-history-units.spec.ts dashboard/tests/intent/intent-ci-comparison-mounted-retry.spec.ts dashboard/tests/intent/intent-ci-comparison-mounted-scope-selection.spec.ts dashboard/tests/intent/intent-project-scope-timing-history.spec.ts dashboard/frontend-tests/intent-project-scope-history-recovery.spec.ts dashboard/tests/intent/intent-ci-done-prior-build.spec.ts dashboard/tests/intent/intent-ci-follow-up.spec.ts --workers=1
```

All moved history cases, both existing mounted-provider consumers, new Project collector journey (now default30s, no new individual override), and Project frontend variants passed. The command exited1 because two additional real integration owners failed: Done prior-build consumed30s in fixture/publication/collection/phone selection before its comparison table; follow-up's5s poll started before asynchronous collection reached its rerun. Traces: `dashboard/test-results/2026-11-11T08-28-53.689Z-19187/`.

Their bounded repairs keep real publication, collection/store, restart and preview page reading. Pre-page collectors use the existing boundary serving mode. Done story selection happens at desktop, then every history/keyboard/phone observation stays390px. Follow-up observes its real rerun submission through the existing holdSubmission callback, which returns immediately and leaves no held resource, before asserting exactly one request. Default test timeouts remain.

```sh
caffeinate -s -i npm run test:dashboard -- dashboard/tests/intent/intent-ci-done-prior-build.spec.ts dashboard/tests/intent/intent-ci-follow-up.spec.ts --workers=1
```

Both passed, exit0. These exercise actual `IntentCiDoneWallTimeReference` and `IntentCiFollowUp` consumers of default shared metrics/membership, not just an equivalent helper. A subsequent TypeScript check found Promise.withResolvers is absent from this project's selected lib; the event was expressed with the ordinary Promise constructor without changing its behavior. Final follow-up verification:

```sh
caffeinate -s -i npm run test:dashboard -- dashboard/tests/intent/intent-ci-follow-up.spec.ts --workers=1
```

Passed, exit0, after the Promise-constructor adjustment.

```sh
PATH="/opt/homebrew/bin:$PATH" npm test -- tests/support/dashboard-ci-scope-history-read.test.mjs tests/support/intent-ci-scope-history-cohort.test.mjs
```

Passed, exit0. Real pinned reader parsing/identity/refusal and local cohort filtering/unknown ancestry, no historical acquisition.

```sh
npm run typecheck:dashboard
```

Final result: passed, exit0. `git diff --check` passed. No lint, format, commit, push or slice status mutation was performed.

## Consumer disposition groups

- Shared scope admission/context/units/evidence/chart and scope reference metrics/membership: new Project journey/frontend cases plus existing Done collected/timing/prior-build commands observe changed semantics and preserved defaults.
- Generic chart/reference default consumers: existing CI wall-history/prior-reference checks plus actual Done-reference and retained follow-up journeys observe default output. Collection arithmetic, window/filter rules and wire shapes were not edited.
- `IntentScopeProof` / `IntentFileProof` / provider consumers / Summary: selected Summary main/gaps/kept/table/sort and file Purpose/Proof tests passed; new Project history works beside these existing readings.
- Optional Done endpoint in existing test mount: moved history tests plus existing mounted retry and scope-selection consumers passed. Other mount callers omit the new optional field and retain identical inputs; typecheck verifies their contract.
- Server/read/projector/cohort: reused unchanged path, observed through actual collection/new caller plus named Node checks. Other server variants are excluded because no backend grammar/schema/retention/arithmetic changed.
- Source/guidance/planning/installer lexical matches have no changed runtime dependency. Lasting Project scope-history documentation belongs to slice2. Existing old timing-list entries are historical measurements, not discovery.

Full inspectable trace, including supplied effect terms and each located consumer disposition: `/tmp/seed310-slice1-consumer-trace.md`.

## Remaining planned work / interim

Slice2 still owns stable endpoint observation time for unchanged revision (current provider uses work.retrievedAt), Check again refresh at same head, freshness/prior-answer labels, controlled-clock/no-time-only reads, failed matching refresh and held stale replies, and Project visit/Done return with selected test/reading place. This is planned interim behavior, not execution completion. No slice1 product promise intentionally omitted. No CI registration/delivery was attempted by this agent.

## Resource decision and repair ownership

macOS awake on AC100%; focused browser commands all use one worker under `caffeinate -s -i`. Startup load4–9/free41–45%; contention later reached25/free35–44% with unrelated watcher-estimate work. No unrelated process or SEED-287 file was touched. Coordinator checked no sleep during the run and no exact other owner for these failures. Repeated proof followed concrete fixture/event repairs, not reruns until green. Latest prelaunch load7.28/17.39/18.64 free45% for final follow-up verification. No broad suite launched.

## Refactor handoff

Current raw owners remain below250 lines, but selective formatting will expand dense new Project expected-row/arrangement expressions and two Done-endpoint mount calls in the236-line moved segments spec. Inspect formatted size during independent refactor: segments versus empty/all-gaps is a cohesive test split; Project collection setup/evidence-row reading are possible seams. This agent performed no post-change refactor. Comments in IntentScopeProof/IntentFileProof still describe the former Done-only admission and can be aligned with the lasting contract during the authorized refactor/slice2.

## Accepted independent refactor

Centralized marker wording in the existing context, aligned Project/Done comments,
shared actual-store corruption/retry helper with case-owned assertions and shared
Project evidence-row shape with explicit expected values. Inspected both recovery
callbacks and production context consumers. No new behavior or subsystem crossing.

```sh
caffeinate -s -i npm run test:dashboard -- dashboard/tests/intent/intent-project-scope-timing-history.spec.ts dashboard/tests/intent/intent-scope-collected-timing-history.spec.ts dashboard/frontend-tests/intent-project-scope-history-recovery.spec.ts dashboard/frontend-tests/intent-scope-timing-history-segments.spec.ts dashboard/frontend-tests/intent-scope-timing-history-units.spec.ts dashboard/tests/intent/intent-scope-timing-history-gaps.spec.ts --workers=1
```

Passed, exit0; concrete original observations remain at the same spec paths;
recovery now goes through `scopeHistoryCollectedPage.ts` with caller-owned
`expectPreserved` / `expectRecovered`. Typecheck and diff whitespace passed.
Other accepted collection/calculation/default-reference proof remains unchanged.
Refactor trace `/tmp/seed310-refactor1-consumer-trace.md` has all49 dispositions;
no uncovered consumer. REFACTOR COMPLETE received. Read-only formatted sizes
fit250 (Project246, Done collector241, provider247, moved segments249).

Guarded preparation initially stopped at formatting (no commit/publication):
no-param-reassign on frontendServices.projects and require-await on immediate
rerun notification callback. Mechanical repair uses Object.assign for the same
projects array and returns Promise.resolve from the same synchronous callback.
No input, assertion, event ordering or product boundary changed; accepted proof
remains applicable. This is a small repair wholly within the accepted refactor
review/consumer trace, adding no representation/helper/dependency/path.
