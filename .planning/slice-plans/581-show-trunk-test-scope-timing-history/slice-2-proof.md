# Slice 2 proof and uncommitted return

Base: `2e8d46e0ecfdca9183102690c26c34a075bde715`. Established checkout/branch retained. No commit, push, independent post-change refactor, formatting, lint or plan/source-review/status mutation by this implementation agent. Coordinator-owned planning edits were preserved.

## Current outcome and observing locations

- C33–C36, C57, C63–C65, Q01/Q02, J12/J16/J17: `dashboard/frontend-tests/intent-project-scope-history-refresh.spec.ts` drives the whole app: first8s answer, controlled-clock checks without new history reads, same-head Check again + held answer retaining8s/previously-retrieved label, new11s answer/read time, failed matching refresh keeping11s beside usable Summary table, Retry9s and newly observed head changing request endpoint/date. Its SSE substitute follows the actual frontend delivery protocol.
- C40–C44, C61/C62/C81, J13–J15: `dashboard/tests/intent/intent-project-scope-timing-refresh.spec.ts` uses actual Git publication, actual CLI-produced proof artifacts, real background collection/store and preview reading. A middle Done file has8/11s and excludes later9s; Project Intent while that story stays selected shows3 builds through its own head; returning restores exact Done endpoint, selected Modified file, Proof tab and reading-pane scroll offset. A new real trunk head remains named with an endpoint gap/preceding3 builds while live CI evidence explicitly names the older measured revision. Earlier historical artifact IDs1001/1002/1003 are not reacquired; Project's first live CI proof104 is independently legitimate.
- C58–C60: provider endpoint-isolation test holds an old answer, updates the head, waits for the new11s reading, releases AND awaits old handler completion, then verifies evidence stays new. Whole-app project-isolation test changes from held entry to file11s, switches project to9s, awaits old handler completion and verifies current evidence stays9s. Its second case completes entry8s, fails the newly selected file read at the same endpoint, and verifies old entry evidence is absent while File Proof stays usable. Same-ID repository/ref configuration variants verify an old8s answer never accompanies the new source's failed read.
- The provider key-isolation test also updates only work.retrievedAt at the same revision, gives the mounted page its turns, and observes unchanged endpoint date/request count.
- `intent-project-scope-history-remount.spec.ts` hides/unmounts the actual evidence provider while retaining the outer page reading place, updates same-head retrievedAt while hidden, then reenters with a failed local refresh. Both requests retain the original through date and the old8s answer is explicitly previously retrieved. This covers the actual lifetime seam below.
- C97: `docs/dashboard-development-intent-scope-reference.md` now describes Project observed-head context, separate history-answer freshness, explicit refresh/local retry, exact Done restoration and shared prior-build endpoint meaning.

## Ownership and remount rationale

`ConfiguredDashboard.tsx` conditionally renders IntentPerspective. `PageFrame.tsx` keeps IntentReadingProvider above it. `publishedWorkRead.ts` refreshes retrievedAt during same-revision recovery, so a provider-local observed endpoint could manufacture a new date across reentry and lose a matching prior answer. The observed endpoint now uses existing disposable reading state. The existing story IntentReadingScope was lifted around its evidence provider; Project already inherits its own outer scope. The two providers therefore never share the observation slot, and their element/lifetime behavior stays stable. All3 live provider mounts (production2, comparison mount1) are inside an Intent reading place.

Scope answer retention belongs only to `useIntentCiScopeHistory` via existing useKeptReading. The shared endpoint lifecycle accepts an optional kept answer/onAnswer callback; `useIntentCiDoneWallTimeHistory` omits them and preserves its mount-local behavior/cadence. Full source id/repository/ref, path and endpoint identify an answer. Abort guards still reject late responses. There is no new cache/store/collector/polling/arithmetic or wire model. CiEvidence model types moved cohesively out of the provider with a public type re-export; other consumers retain the same fields.

## Literal commands and verdicts

The19-path affected browser command passed, exit0:

```sh
caffeinate -s -i npm run test:dashboard -- dashboard/frontend-tests/intent-project-scope-history-refresh.spec.ts dashboard/frontend-tests/intent-project-scope-history-key-isolation.spec.ts dashboard/frontend-tests/intent-project-scope-history-project-isolation.spec.ts dashboard/frontend-tests/intent-project-scope-history-source-identity.spec.ts dashboard/tests/intent/intent-project-scope-timing-refresh.spec.ts dashboard/tests/intent/intent-project-scope-timing-history.spec.ts dashboard/tests/intent/intent-project-visit-ci.spec.ts dashboard/tests/intent/intent-ci-wall-time-history-pending.spec.ts dashboard/tests/intent/intent-ci-done-endpoint-readiness.spec.ts dashboard/tests/intent/intent-ci-done-prior-build.spec.ts dashboard/tests/intent/intent-ci-done-reference-lifecycle.spec.ts dashboard/frontend-tests/intent-scope-timing-history-reading.spec.ts dashboard/frontend-tests/intent-scope-timing-history-units.spec.ts dashboard/frontend-tests/intent-scope-timing-history-segments.spec.ts dashboard/tests/intent/intent-ci-comparison-mounted-retry.spec.ts dashboard/tests/intent/intent-ci-comparison-mounted-scope-selection.spec.ts dashboard/tests/intent/intent-summary-ci-proof-kept.spec.ts dashboard/tests/intent/intent-summary-ci-proof.spec.ts dashboard/tests/intent/intent-file-purpose-proof.spec.ts --workers=1
```

After observed-endpoint persistence across remount and scope ownership alignment, the following8-path command exited1 solely because the existing slice1 Project collector exhausted30s during nested rows. Its other7 paths passed, including new remount, whole-app refresh and source/scope/endpoint/request-count cases. This command is not reported green:

```sh
caffeinate -s -i npm run test:dashboard -- dashboard/frontend-tests/intent-project-scope-history-remount.spec.ts dashboard/frontend-tests/intent-project-scope-history-refresh.spec.ts dashboard/frontend-tests/intent-project-scope-history-key-isolation.spec.ts dashboard/frontend-tests/intent-project-scope-history-project-isolation.spec.ts dashboard/frontend-tests/intent-project-scope-history-source-identity.spec.ts dashboard/tests/intent/intent-project-scope-timing-refresh.spec.ts dashboard/tests/intent/intent-project-scope-timing-history.spec.ts dashboard/tests/intent/intent-project-visit-ci.spec.ts --workers=1
```

The old collector setup still launched/landed another native session and started a preview collector before restarting a preview reader. Repair: use the shared publisher's already-published later head, canonical MakeMe landing records for all3 observations, the maintained rechecking boundary collector, then the same preview reader. All value/phone/keyboard/actual-corruption/Retry assertions remain. No timeout increased. Both real collector journeys passed together, exit0, after that repair and the explicit older-CI/new-endpoint assertion:

```sh
caffeinate -s -i npm run test:dashboard -- dashboard/tests/intent/intent-project-scope-timing-history.spec.ts dashboard/tests/intent/intent-project-scope-timing-refresh.spec.ts --workers=1
```

The final additional retained-scope failure observation (C59) and unchanged late-project case both passed, exit0:

```sh
caffeinate -s -i npm run test:dashboard -- dashboard/frontend-tests/intent-project-scope-history-project-isolation.spec.ts --workers=1
```

```sh
npm run typecheck:dashboard
git diff --check
```

Passed, exit0 after the production and collector corrections. The last addition was only the C59 test using existing typed helpers; no product or fixture API changed afterward. All runtime proof used the maintained runner, default test timeout and one worker.

## Consumer trace and reusable proof

`/tmp/seed310-slice2-consumer-trace.md` was generated with the installed consumer-trace script, base2e8d46e0, and explicit terms useIntentCiEndpointHistory/useIntentCiScopeHistory/CiEvidence/previously-retrieved/history-read/projectEndpoint/checkedAgain/ciObservedTrunkEndpoint/onAnswer. All778 located consumers have dispositions (23 run,13 reused,742 lexical/unaffected exclusions). The large count mostly comes from generic field/type and planning terms; the artifact remains inspectable.

- Scope/endpoint lifecycles and disposable context: new frontend cases and actual Project/Done journeys above observe identity, freshness, local retry, remount and restoration.
- Project CI wall-time cadence: `intent-project-visit-ci.spec.ts` exact judgment request lists and `intent-ci-wall-time-history-pending.spec.ts` judgment/history counts, pending refresh/Check again observations passed.
- Done generic endpoint caller: `intent-ci-done-endpoint-readiness`, `intent-ci-done-prior-build` and `intent-ci-done-reference-lifecycle` passed; they observe no premature local history, exact published endpoint, repeated refresh and local failure/retry. Scope-only retained inputs leave this caller's state local.
- Existing comparison mount identity-string callers: mounted retry/scope-selection and moved scope reading/units/segments cases passed. Optional project identity and shown flag add only the new provider boundary arrangements. Prepared comparisonRenderFacts explicitly retains its required string identity; runtime transforms are unchanged.
- Summary/File output: existing summary-ci-proof/main+kept and file-purpose-proof passed. The new history freshness note is outside evidence rows/table figures.
- Public CiEvidence type re-export is unchanged for non-history consumers; typecheck passed. Collection/projector/cohort/units/provenance/reference/chart rules and parsers are unedited, so accepted slice1 detailed proof remains reusable. Source/guidance/planning/server and unrelated display lexical matches consume no changed browser lifecycle contract.

## Truthful earlier failures and retained diagnostics

Initial new tests exposed test arrangement defects: invalid changed:true for an unchanged revision and then the frontend SSE-versus-check substitute; collapsed tree/Modified accessible-name navigation; an8s chart-axis tick mistaken for an old evidence point; acquisition totals including Project's legitimate current live proof; and serializing a helper function instead of only the mount DTO. They were corrected without changing promises, supplying projected integration history, or increasing timeouts. Retained trace roots: `dashboard/test-results/2026-11-11T08-59-58.467Z-84635`, `2026-11-11T09-03-12.448Z-75736`, `2026-11-11T09-09-04.157Z-97829`, `2026-11-11T09-12-49.114Z-66420`, `2026-11-11T09-16-11.946Z-46012`. The later30s collector failure/repair is `2026-11-11T09-31-14.466Z-1364` and the two-path pass above. Passing cases from failed broad commands are reused only at unchanged boundaries; failed command verdicts remain failed.

## Resources and refactor handoff

All browser runs were sequential at one worker under caffeinate-s-i, awake AC100%. Host load varied4–23, free memory38–50%; unrelated work was preserved. Before the final collector repair proof load8.62/free44%; before final C59 path load12.04/free42%. No full suite, external acquisition, unowned-file repair or observer operation was performed. All started commands reached terminal results.

Read-only Prettier measurement (no source formatting) finds all owners within250: IntentPerspective245, repaired Project collector242, provider217, new Project visit195, comparisonMountPage182, scope view155, frontend refresh153, project/scope isolation130, endpoint hook115, endpoint isolation108, mount85, source identity80, remount79, comparisonRenderFacts72, facts68, context57, evidence model51, scope hook45, mount types38. The existing source identity appears in the observed-endpoint and answer keys; independent refactor may judge whether a shared private identity seam is warranted. No size split is required by current evidence.

No known required behavior/proof gap or running verification remains. G1's final disposition and all source-review acceptance cells remain coordinator-owned.

## Owned paths

- dashboard/src/IntentCiEvidence.tsx
- dashboard/src/intentCiEvidenceModel.ts
- dashboard/src/IntentPerspective.tsx
- dashboard/src/IntentScopeTimingHistory.tsx
- dashboard/src/intentScopeHistoryContext.ts
- dashboard/src/useIntentCiEndpointHistory.ts
- dashboard/src/useIntentCiScopeHistory.ts
- dashboard/tests/comparison-mount/entry.tsx
- dashboard/tests/support/comparisonMountPage.ts
- dashboard/tests/support/comparisonMountTypes.ts
- dashboard/tests/support/comparisonRenderFacts.ts
- dashboard/tests/support/projectScopeHistoryFacts.ts
- dashboard/tests/intent/intent-project-scope-timing-history.spec.ts
- dashboard/tests/intent/intent-project-scope-timing-refresh.spec.ts
- dashboard/frontend-tests/intent-project-scope-history-refresh.spec.ts
- dashboard/frontend-tests/intent-project-scope-history-key-isolation.spec.ts
- dashboard/frontend-tests/intent-project-scope-history-project-isolation.spec.ts
- dashboard/frontend-tests/intent-project-scope-history-source-identity.spec.ts
- dashboard/frontend-tests/intent-project-scope-history-remount.spec.ts
- docs/dashboard-development-intent-scope-reference.md

# Slice 2 independent post-change refactor

Completed one cohesive browser Intent CI-history refactor. No plan, acceptance, source-review, status, test, fixture, persistent store, server, schema or public API changes were made by this refactor.

## Read-only decision pass

- Duplication / shotgun surgery: observed-endpoint and answered-history keys independently encoded configured history-source identity (project ID/repository/ref). Consolidated exactly that prefix in `dashboard/src/intentCiHistorySourceKey.ts` (8 lines). `IntentCiEvidence.tsx:56` and `useIntentCiEndpointHistory.ts:41` now call it. Both prior composite key bytes and their distinct revision versus scope/revision/date suffixes are unchanged.
- Existing owners inspected: `ciComparisonReading.ts` keys project/story; `repositoryFileReads.ts` joins project/repository/revision/path; server `HeardRevisions`/`PinnedMemo` own repository-content identities. Their distinct meanings do not fit the configured history-source identity. No suitable existing owner was bypassed.
- Naming, dead/redundant code, test documentation: no further candidate. Scope answer retention remains scope-owned through existing disposable reading state; wall-time caller continues to omit optional retention. Story and Project provider reading scopes remain distinct, with unchanged element/lifetime behavior. Extracted evidence model keeps the public type re-export. No unrelated cleanup.
- Actual collector arrangements and observations inspected: original Project journey setup38-113 and value/navigation/phone/keyboard/corruption/Retry assertions129-242 remain complete. New visit/return setup22-38 and observations46-93 prove middle Done versus later Project history, exact file/tab/scroll return and older-live-CI/new-endpoint separation. The repair uses real published Git heads, MakeMe landing inputs, actual producer summaries and collection/store, never projected history as setup.
- ADR0001 ubiquitous vocabulary, ADR0002 one conceptual representation, ADR0008 distinct project/story/published/local evidence and disposable presentation state are preserved. The current ADR index and relevant records show no conflict or supersession. This refactor changes only the browser Intent CI-history responsibility; no production subsystem crossing or disputed plan restriction.

## Accepted proof dispositions

Identity construction moved out of both owners, so the source/configuration/endpoint/path/remount cases and separate generic Done caller were re-observed. Their fixture and assertion locations are unchanged:

- `dashboard/frontend-tests/intent-project-scope-history-source-identity.spec.ts`: MakeMe source change29-35, failed-read and no inherited answer36-39.
- `dashboard/frontend-tests/intent-project-scope-history-key-isolation.spec.ts`: held endpoint response21-30; same-head date/request count37-40; new endpoint and awaited old completion41-49.
- `dashboard/frontend-tests/intent-project-scope-history-remount.spec.ts`: route18-24; hide/reenter29-33; stable endpoint/prior answer and exact through values34-38.
- `dashboard/frontend-tests/intent-project-scope-history-project-isolation.spec.ts`: real app file/project transition34-48 and awaited old-answer isolation49-54; separate failed file read64-69 and no retained entry answer79-83.
- `dashboard/tests/intent/intent-ci-done-reference-lifecycle.spec.ts`: real publication/local canonical history17-18, failed/unavailable/live modes38-50, same generic caller's exact read cadence58-78 and retained answer/refresh/Retry across actual store corruption83-125.

Literal focused command (exit0; all started verification reached terminal result):

```sh
PATH=/opt/homebrew/bin:$PATH caffeinate -s -i npm run test:dashboard -- dashboard/frontend-tests/intent-project-scope-history-key-isolation.spec.ts dashboard/frontend-tests/intent-project-scope-history-source-identity.spec.ts dashboard/frontend-tests/intent-project-scope-history-remount.spec.ts dashboard/frontend-tests/intent-project-scope-history-project-isolation.spec.ts dashboard/tests/intent/intent-ci-done-reference-lifecycle.spec.ts --workers=1
PATH=/opt/homebrew/bin:$PATH npm run typecheck:dashboard
git diff --check
```

All passed. Dashboard reporter is intentionally silent on passing tests. No full suite, lint or source formatting was run. Read-only formatting measurement only.

Reused proof from slice-2-proof.md: both actual collector journeys, whole-app Check again/freshness/refresh, Project judgment/history cadence and Done readiness/prior-reference consumers retain their original setup, observations and behavior. Detailed slice1 collection/projector/cohort/units/provenance/reference/chart proof remains unchanged. Their behavior and paths were not invalidated by the private prefix extraction; no process-only reruns.

## Consumer trace

`/tmp/seed310-refactor2-consumer-trace.md` is produced by the installed script with the three actual refactor paths plus the helper/caller symbols, expanded through `mountComparison`/`updateComparison` and both enclosing history-region labels. All69 consumers have dispositions:13 run,25 reused,31 exclusions with reasons; no uncovered consumer. Incoming whole-change `/tmp/seed310-slice2-consumer-trace.md` and its778 dispositions remain retained.

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . --path dashboard/src/IntentCiEvidence.tsx --path dashboard/src/useIntentCiEndpointHistory.ts --path dashboard/src/intentCiHistorySourceKey.ts --term intentCiHistorySourceKey --term useIntentCiEndpointHistory --term useIntentCiScopeHistory --term useIntentCiDoneWallTimeHistory --term scopeHistoryContextOf --term mountComparison --term updateComparison --term 'Done CI wall time reference' --term 'Test execution time history' > /tmp/seed310-refactor2-consumer-trace.md
```

## Resources, sizes and ownership

Before browser proof: same macOS host, AC100%, load13.48/12.68/13.64, free memory46%; no active browser test/build/lint process found, only idle MCP browser services. Known unrelated executions, including other worktrees, were preserved. One browser worker under maintained caffeinate-s-i; no failed proof, repetition to seek green, deferred required observation, or running verification remains. Future heavy proof needs a fresh resource decision. User-selected Intent Coverage remains coordinator-owned at normal Story Wrap Up and was not started here.

Raw line counts checked for every current changed/untracked file; all are at most250. Refactor owners: provider217, generic hook95, new source-key module8. Read-only formatted measurements218/116/8 respectively. Existing largest edited owners remain Perspective245, Project collector242; plan245. No rename, split or deletion by this refactor; one8-line extraction. Whitespace clean. Approximate active elapsed time7minutes.

Failure policy retained by exact project link for any later repair handoff: `/Users/terryyin/git/open-dough/.worktrees/show-trunk-test-scope-timing-history/AGENTS.md#failing-and-flaky-tests`.

## REFACTOR COMPLETE
