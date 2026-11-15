# Slice 1 consumer trace dispositions

Command: `node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . --base HEAD --term putFrontendIntentSources --term putFrontendFolderSources --term expectSourceTargetLine`.
Full script output with every located consumer disposition:
`/tmp/647-slice1-consumer-trace-final.md` (retained raw research outside checkout).

The changed effect is detailed regression registration moving from Integrated
UI Test to Frontend, plus one representative real acquisition journey. No
production symbol, shared helper API, fixture value or wire contract changes.
The new frontendIntentSources helper is consumed only by the six new Frontend
specs, all covered by the seven-case focused run in slice-1-proof.md.

| Located meaningful consumer | Disposition and observed result |
| --- | --- |
| Backend authenticated-read-intent-locations | run: exact configured Gherkin listing, pinned source/outside refusal and empty/missing/unsupported classification; all cases passed. |
| Backend authenticated-read-intent-java | run: exact selected Java listing, pinned source, refusals and no refused-path upstream content calls; all three variants passed. |
| E2E intent-gherkin-browse | run: original real Gherkin publication/acquisition, line/text/revision and project switch passed. Its live layout companion link now names Frontend. |
| E2E intent-code-browse-sources | run: real mixed configured source selection and acquisition, Java and grammar-fallback journey passed. |
| E2E intent-ci-status | run: real no-readable-selected-check history judgment and Intent presentation passed. |
| E2E intent-recorded-purpose-read | run: opens real recorded candidate; selected pinned source, target and exactly one GitHub content read passed. |
| intentCandidatesCasePositionFixtures / intentGherkinBrowseFixtures / intentEntryFolderSummariesFixtures | excluded: fixture values and exported APIs unchanged; only live companion-source comments updated. Their relevant observers above ran. |
| Existing page objects and all other callers | excluded: APIs unchanged, none imports a deleted spec; common imports/literals caused matches. Every individual located path has this explicit reason in the full script output. |
| Existing runner configs / CI duration consumers | run: Integrated list command below checks registration; only six retired source rows removed. No runner/configuration retired. |
| Planning/maintainer records, payload and installed guidance, unrelated production/tests | excluded: generic PLAN.md/source-review.md/fixture-literal matches do not consume a retired spec or changed API. Historical source identities remain unchanged. |

Additional PASS: `caffeinate -s -i npm run test:e2e -- intent/intent-gherkin-browse.spec.ts intent/intent-code-browse-sources.spec.ts intent/intent-ci-status.spec.ts --workers=1`; `/tmp/647-slice1-e2e-source-consumers.log`.

No meaningful consumer lacks proof. The covering Frontend run and exact E2E /
Backend observer locations are retained in [assertion disposition](slice-1-proof.md).

PASS: `caffeinate -s -i npm run test:dashboard:backend -- intent/authenticated-read-intent-locations.spec.ts --workers=1`, `/tmp/647-slice1-backend-locations.log`; in particular “marks empty, missing, and unsupported locations while listing usable ones” supplies the old group case’s real classification.

PASS: `npm run test:dashboard:integrated -- --list --reporter=line`, `/tmp/647-slice1-integrated-list.log`: 223 tests / 107 files, all six converted source paths absent; remaining navigation/Intent registration stays usable.

Proof-host confirmation before focused runs: macOS awake on AC, load 8.90/7.05/8.19 and 51% memory free. One-worker runs were sequenced under `caffeinate -s -i`; no proof deferred.

## Independent refactor

New `candidateEntry(intent, name)` in `dashboard/tests/intentModePage.ts` owns
only the repeated candidate article selector used by the Frontend Purpose and
representative E2E Purpose cases. It preserves the exact locator and supplied
name. Normalized Java's MakeMe import to the same resolved module and corrected
two relocated companion links. No backend or production behavior changed.

Moved the plan's settled solution/decisions and preparation observations
verbatim to `preparation-evidence.md`, retaining linked headings in PLAN.md.
The executable plan is 223 lines; every changed file is at most 250 lines.
Updated the old-side scratch pointer here in slice-1-proof.md.

Refactor trace: `node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . --base HEAD --term candidateEntry --term preparation-evidence.md`;
full record and individual dispositions at `/tmp/647-slice1-refactor-consumer-trace.md`.
The two new callers are in the script's changed-file scope: E2E rerun below;
Frontend caller is owned by the coordinator's covering Frontend group before
delivery. Existing page-object exports, fixture values and all other consumers'
behavior are unchanged; their accepted proof is reused or their lexical match
is excluded with a per-path reason in the raw record. No consumer gap is hidden.

PASS: `caffeinate -s -i npm run test:e2e -- intent/intent-recorded-purpose-read.spec.ts --workers=1`,
`/tmp/647-slice1-refactor-e2e.log`, after helper extraction. Setup remains
`publishDoughnutCasePosition`; observations remain source text,
`expectSourceTargetLine` and exact `contentReadsOf(...).toBe(1)`.
The caller's Backend Java/locations and existing E2E source/CI judgment proof
remain valid: only a new page-object export was added, their imports and
observations did not change. The Purpose scratch proof remains valid because
the target observer and product implementation are unchanged.

Pre-launch proof-host decision: macOS awake on AC; load 5.97/11.98/12.99,
53% memory free. An unrelated named Distribution check run was active; one
focused E2E worker under `caffeinate -s -i` remained proportionate. No owned
heavy proof overlapped; the coordinator sequences the Frontend group afterward.

Coordinator covering PASS: `caffeinate -s -i npm run test:dashboard:frontend -- --workers=1`, terminal exit 0; `/tmp/647-slice1-frontend-group.log` and `.exit`. This includes both refactored Frontend callers and every Frontend shared-support consumer. The run waited about five minutes for shared admission, then completed normally on awake AC under the guard; no proof deferred.

Delivery freshness: source unchanged at pinned trunk `fd397339a33b86e4221544401d1702da5373281f`; no named CI/navigation sibling product change landed since base `f8c4841a47719925236f78ff220efe9b0795e4f5`. Incoming changes are unrelated records/claims and the production-watcher test marker.
