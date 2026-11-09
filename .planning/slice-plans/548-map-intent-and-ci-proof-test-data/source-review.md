# Source review

Launched 2026-11-09 by the execution coordinator (steven-chan) as a fresh
general-purpose agent with no conversation inheritance. Input: only the
selected story's title, Goal, Scope and Key examples from
[SEED-261#map-intent-and-ci-proof-test-data](../../seeds/SEED-261-share-domain-test-data.md#map-intent-and-ci-proof-test-data),
with instructions to read no project files, change nothing, and return
numbered commitments, qualifications, examples and exclusions. The returned
table is retained below; allocations are the coordinator's.

Returned exclusions and qualifications: CI runs, CI adapter attempts and
coverage, and CI proof data belong to sibling stories; contracts and UI do
not change; MakeMe covers only valid settings; the builder applies where a
test arranges a locations answer, not where it observes one; labels only when
the case shows one; example literals are not an exhaustive rejection list.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Maintainers reviewing Intent tests can see "which locations a project declares" | slice 1 | observed: dashboard/tests/intentGherkinUnusableFixtures.ts mixedSettings, intentCodeBrowseFixtures.ts, intent-code-browse.spec.ts settings: declared locations stated via makeMe.anIntentLocation; tests/intent run 294/295 pass (one unrelated timeout, owned repair) |
| 2 | …"which published files each location selects at a revision" | slice 2 | observed: tests/support/intentLocationTestData.mjs selecting(...files) states the files an answered location selects; used in intent-story-overlay.spec.ts, frontendServiceState.ts, intent-candidates-location-match.test.mjs |
| 3 | …"which Test Optimization Candidates the project records" | slice 3 | |
| 4 | That setup is expressed "in the vocabulary of the product's settings, locations answer and candidates record" | slice 3 | |
| 5 | "The same declaration or record reads the same way" in all of these: | slice 3 | |
| 5.1 | integrated journeys | slice 1 | observed: dashboard/tests/intent/*.spec.ts and fixtures publish makeMe.intentSettings through intentSettingsText; tests/intent + recently-done-sessions-select passed |
| 5.2 | backend specs | slice 1 | observed: backend-tests/intent/authenticated-read-intent-(locations\|locations-problems\|selection\|candidates).spec.ts build settings via makeMe; 15 passed |
| 5.3 | frontend specs | slice 2 | observed: dashboard/tests/support/frontendServiceState.ts locations answer built via makeMe.anIntentLocation...selecting(); frontend-tests 23 passed; malformed builder files failed both intent-candidates-read-recovery cases |
| 5.4 | Node support tests | slice 2 | observed: tests/support/intent-candidates-location-match.test.mjs inventories from makeMe answered locations; bash scripts/test.sh exit 0; omitting agent-launch-second-server.spec.ts failed 3 cases |
| 6 | "A change to one of these contracts is followed in one place" | slice 3 | |
| 7 | Valid Intent settings in `.planning/open-dough.json` are arranged through `makeMe.intentSettings` and `makeMe.anIntentLocation` | slice 1 | observed: makeMe.intentSettings.withLocations(makeMe.anIntentLocation...) in every converted fixture/spec (e.g. intentStoryWorktree.ts intentSettings) |
| 7a.1 | A location's "path" can be stated | slice 1 | observed: makeMe.anIntentLocation.at(path) in every converted declaration |
| 7a.2 | Its "kind with optional include patterns", or alternatively "its source entries with optional syntax" | slice 1 | observed: .ofKind(kind, include) e.g. intent-code-browse.spec.ts; .withSources in intent-code-browse-sources.spec.ts and selection a8 |
| 7a.3 | Its "label when the case shows one" | slice 1 | observed: .labelled("Dashboard Frontend Test") intent-code-browse.spec.ts; .labelled(" Feature scenarios ") backend locations a1 |
| 8 | Those settings are published "as JSON with the project's other files at the published revision through the existing published-file harness" | slice 1 | observed: dashboard/tests/support/intentSettingsFile.ts intentSettingsText, used by publishIntentProject.ts and direct writers via publishFiles/publishes/writeRevisionFiles |
| 9 | The per-fixture settings strings are replaced in each of these fixtures: | slice 1 | observed: fixture settings exports now built IntentSettings values: intentCodeBrowse, intentGherkinBrowse, intentGherkinUnusable, intentJobsFeature, intentLocationsBoundary, intentEntryFolderSummaries, intentCandidatesOtherProject fixtures, support/intentStoryWorktree.ts |
| 9.1 | Intent browse | slice 1 | observed: dashboard/tests/intentCodeBrowseFixtures.ts openDoughSettings/doughnutSettings/pygardonSettings |
| 9.2 | Gherkin | slice 1 | observed: dashboard/tests/intentGherkinBrowseFixtures.ts and intentGherkinUnusableFixtures.ts mixedSettings |
| 9.3 | candidates | slice 1 | observed: dashboard/tests/intentCandidatesOtherProjectFixtures.ts pygardonGherkinOnlySettings, doughnutFeatureSettings |
| 9.4 | boundary | slice 1 | observed: dashboard/tests/intentLocationsBoundaryFixtures.ts settings |
| 9.5 | story-worktree | slice 1 | observed: dashboard/tests/support/intentStoryWorktree.ts intentSettings |
| 10 | Settings "written inline in Intent specs" are replaced | slice 1 | observed: intent-code-browse.spec.ts and intent-ci-proof-ancestor.spec.ts inline settings now makeMe.intentSettings |
| 11 | A locations answer (a declared location with "the files it selects at a revision and its problem when one applies") is built "through the same location builder" wherever a test "arranges that answer instead of observing it", in each of these: | slice 2 | observed: answered locations built through the same builder wherever arranged (overlay spec, frontend substitute, matcher test); no arranged answer carries a problem today: problem answers appear only as independent expectations in authenticated-read-intent-locations.spec.ts a4 |
| 11.1 | backend tests | slice 2 | observed: dashboard/backend-tests/intent/intent-story-overlay.spec.ts locations via selecting(); 5 passed, removing leaving.spec.ts failed :88 :111 :126 |
| 11.2 | frontend tests | slice 2 | observed: dashboard/tests/support/frontendServiceState.ts defaultFrontendServiceState locations |
| 11.3 | Node tests | slice 2 | observed: tests/support/intent-candidates-location-match.test.mjs inventory, frontendOnly |
| 12 | The frontend service substitute's answers are typed "against the product's answers": | slice 2 | observed: FrontendServiceState.locations: IntentLocationsAnswer, candidates and putFrontendCandidates: IntentCandidatesAnswer (named in dashboard/server/intentLocationsRead.ts, intentCandidatesRead.ts; readOutcome Answer union references them) |
| 12.1 | its locations answer | slice 2 | observed: frontendServiceState.ts locations: IntentLocationsAnswer; typecheck |
| 12.2 | its candidates answer | slice 2 | observed: frontendServiceState.ts candidates / putFrontendCandidates: IntentCandidatesAnswer; typecheck |
| 13 | The candidates' configured inventory is derived with the product's `inventoryFromIntentLocations` "instead of restating it" | slice 2 | observed: intent-candidates-location-match.test.mjs derives inventory and frontendOnly via inventoryFromIntentLocations |
| 14 | Test Optimization Candidates records are built through `makeMe.aTestOptimizationCandidatesRecord`, "extended for entries in each finding section with the facts a case states" | slice 3 | |
| 15 | Hand-written record Markdown is replaced in these places: | slice 3 | |
| 15.1 | the Intent candidates fixtures | slice 3 | |
| 15.2 | the backend candidates read spec | slice 3 | |
| 16 | The suite-local `candidateRecordEntry` is removed | slice 3 | |
| 17 | What a case proves "by its exact form" stays literal, including each of these: | slice 3 | |
| 17.1 | "malformed, empty or unreadable settings" | slice 1 | observed: literal {not json in intent-read-recovery.spec.ts and authenticated-read-intent-locations-problems.spec.ts, {} and unreadable injections kept |
| 17.2 | declarations the reader must ignore, "such as a non-string label, unsafe or empty include patterns, and malformed source entries" | slice 1 | observed: literal label 42 entry beside MakeMe entries in authenticated-read-intent-locations.spec.ts a4; selection a9 malformed sources kept literal |
| 17.3 | "mismatched or partial record Markdown" | slice 3 | |
| 17.4 | "recorded location references matched as written" | slice 2 | observed: intent-candidates-location-match.test.mjs recorded reference strings and expectations unchanged in the diff |
| 17.5 | "authored test sources and Gherkin features whose syntax, lines or wording are the subject" | slice 1 | observed: feature and source texts unchanged in the converted fixtures (git diff shows settings-only edits) |
| 18 | "Independent expectations stay as they are" | slice 3 | |
| 19 | These stay "at their existing boundaries": | slice 3 | |
| 19.1 | real server reads | slice 3 | |
| 19.2 | published-file serving | slice 3 | |
| 19.3 | Git worktrees | slice 3 | |
| 19.4 | fake GitHub answers | slice 3 | |
| 19.5 | injected read faults | slice 3 | |
| 20 | In a mixed case (for example a journey that publishes Intent settings and serves CI), "convert the Intent facts here and leave the CI setup for its story" | slice 1 | observed: intent-ci-proof-ancestor.spec.ts: only open-dough.json converted, CI runs/artifacts untouched |
| 21 | Each converted case is evaluated against its original, and each must meet these points: | slice 3 | |
| 21.1 | "the facts that drive each outcome stay visible" | slice 3 | |
| 21.2 | "assertions catch the same failure" | slice 3 | |
| 21.3 | "the shared setup removes a translation or a second model" | slice 3 | |
| E1 | Example 1: An Open Dough-shaped project declares `dashboard/tests` TypeScript specs and `tests` shell checks, and Intent lists both locations with their published files. Both locations are stated through MakeMe, the settings are "published from that value", and "the expected tree is written independently" | slice 1 | observed: intent-code-browse.spec.ts: four MakeMe locations incl. dashboard/tests typescript and tests shell, expected tree literal and unchanged; fault check shell->python failed at line 244 |
| E2 | Example 2: A project declares a usable Gherkin location, a missing path, an empty folder, a `java` kind and a JavaScript location with include patterns. The locations read lists the usable files and marks `no-matching-files` and `unsupported-kind` "as before". "All five come from MakeMe with those facts visible". A label of `42` or a malformed `sources` list that a case proves is ignored "stays literal JSON in that case" | slice 1 | observed: intentGherkinUnusableFixtures.ts mixedSettings five MakeMe locations; backend a4 expects unsupported-kind (fault java->typescript failed line 184), label 42 literal |
| E3 | Example 3: A candidates record holds a pending candidate naming a file by `path:line` and an accepted necessary cost naming a case by `path::case`. MakeMe builds the record with those entries, and opening each from Optimization Candidates "positions Purpose as before". An empty record "still shows its four sections with `None.`". A record with a different heading "stays literal Markdown" | slice 3 | |
| E4 | Example 4: The recorded-location matcher derives its configured inventory from answered locations built through MakeMe. The story overlay and the frontend service substitute use "the same answered-location shape". "The recorded reference strings stay literal" | slice 2 | observed: matcher test inventory via inventoryFromIntentLocations over makeMe answered locations; overlay spec and frontendServiceState use the same selecting() shape; recorded strings literal |
