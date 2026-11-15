# Slice 4 consumer trace dispositions

Trace command: `node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/move-intent-reading-and-review-checks-out-of-das --base HEAD --term putFrontendIntentStory --term answerFrontendIntentChanges --term serveComparison --term prepareFrontendDoneIntent --term answerFrontendIntentComparison --term groupRunnerExamples --term startOwnSelection --term holdAuthenticatedReadsWhere --term 'closing Review changes' --term 'a long story title'`.

Full discovery: `/tmp/dough-647-slice4-consumer-trace-final.txt`.
Every located path has an individual disposition in
`/tmp/dough-647-slice4-consumer-dispositions.md`; generic removed assertion
literals plus coordinator-owned PLAN.md records produce many unrelated matches.
No changed production module is left. No shared helper was removed.

| Meaningful consumer | Disposition and actual observing path |
| --- | --- |
| Six new Frontend destinations | run: all ten original cases; cue Proof, Done coverage holds/failure/Retry, dark/narrow/source/history, title, Review file/tab/scroll/header focus. |
| `frontendIntentStory` → existing changes-only/gaps | run: six existing cases in final Frontend16 command; workspace absence, comparison failure/Retry, no locations and filters/refresh still work. New optional story only affects supplied long-title scenario. |
| `frontendIntentDoneStory` / `frontendIntentComparison` | run: the three new Done destinations, all six cases; actual Done entry, explicit landed-location/source responses, canonical positive comparison and proof values; final Frontend16 passed. |
| `serveComparison` → all mounted comparison/history callers | reused: accepted e234 covering Frontend group. Only the parameter type narrows to the two callbacks it mutates; body and canonical facts/values are unchanged. Final full dashboard typecheck validates callers. Whole-app new consumers run directly above. |
| `groupRunnerExamples` → `runner-ownership` / `startOwnSelection` | run: Integrated runner case passes both normal npm and direct config from another working directory, each with exact selectedCount 1, own target, clean terminal/result/output paths. Quick example now names still-maintained `intent-sidebar-toggle` narrow case. Other three group entries and their values are unchanged; accepted e234 proof reused. |
| Existing hold/authenticated-read/source/review page helpers | excluded from another runtime run: API, value and implementation unchanged. New Done body hold is observed in coverage's fourth case; all UI helpers are directly exercised in Frontend16. Live coverage companion comment updated. |
| `e2e/intent/intent-story-changes` | run: actual Taken worktree comparison and Review diff equality; live title/Review companion links now point to Frontend. |
| `e2e/intent/intent-story-completed` | run: real completion, exact saved assessment, published comparison/source distinct from newer trunk. |
| `e2e/intent/intent-summary-story-comparison-source` | run: both clean and conflict-extra merges; actual landed source revision, exact one request, later inventory absent, compact Proof. |
| Backend historical choice | run: published completion bypasses readable local workspace; explicitly selected unusable capture remains refused. |
| CLI completion coverage | run: all four actual CLI cases, including Insufficient evidence/unavailable-cost text, unavailable reason and older record; no arranged Frontend response claims CLI serialization. |
| Runner configs and timing consumers | run: final Integrated listing proves six exact retired paths absent; only their six timing rows removed. Frontend registration is proved by focused16. No runner/configuration retired. |
| Other located tests, journeys, unchanged production and support | individually excluded in raw dispositions: only common removed assertion/fixture words or unchanged helper imports match; none imports a retired spec or consumes an altered runtime contract. |
| Planning, maintainer, payload and installed guidance records | individually excluded: lexical PLAN.md/source/spec identities do not consume runtime contracts; preserved historical source identities. |

No required affected observation is deferred to CI. Coordinator retains the
separate independent refactor, formatting/lint and covering-group delivery gates.
