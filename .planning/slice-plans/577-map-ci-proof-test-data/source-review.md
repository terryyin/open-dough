# Source review

Source inventory for `SEED-261#map-ci-proof-test-data`, using only the supplied text.

Launch/input: reviewer `/root/source_review`, `fork_turns: none`; source-only supplied Goal, Scope and Key examples of `SEED-261#map-ci-proof-test-data`. The actual launch and numbered return are inspectable in this conversation. No project files were read or changed for that source-only review.

Coordinator qualification for C20–C26: extend only where a consumer needs construction; existing suitable builders may remain unchanged. Slice 4 owns this qualification in the final audit.

The values and paths below are illustrative scenarios, not additional universal input restrictions.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | Maintainers can read which Intent paths a CI attempt proved. | slice 4 | |
| C02 | Maintainers can read the unit of that proof. | slice 4 | |
| C03 | Maintainers can read its part statuses. | slice 4 | |
| C04 | Maintainers can read its counts. | slice 4 | |
| C05 | Maintainers can read its timing. | slice 4 | |
| C06 | Maintainers can read its file breakdown. | slice 4 | |
| C07 | Collector proof tests use the shared MakeMe vocabulary. | slice 1 | observed: ci-proof-collect.test.mjs two dashboard shards and missing/ambiguous assertions; direct MakeMe setup; slice-1-proof.md |
| C08 | Converter proof tests use the shared MakeMe vocabulary. | slice 1 | observed: ci-proof-collect.test.mjs two dashboard shards and missing/ambiguous assertions; direct MakeMe setup; slice-1-proof.md |
| C09 | Node support proof tests use the shared MakeMe vocabulary. | slice 2 | observed: Node read/sort/timing/scope/comparison direct MakeMe setup and 52-suite proof in slice-2-proof.md |
| C10 | Dashboard proof tests use the shared MakeMe vocabulary. | slice 3 | observed: Intent and comparison MakeMe entries through actual collector/ZIP/listed artifact builder; intent-ci-proof.spec.ts exact run/counts/time/request-order; backend landed-ci-proof-collection |
| C11 | Shared construction owns the arranged facts. | slice 4 | |
| C12 | Shared construction reduces repeated mapping decisions. | slice 4 | |
| C13 | Existing independent behavioral proof is preserved. | slice 4 | |
| C14 | Convert remaining valid synthetic CI proof fragments. | slice 1 | observed: ci-proof-collect.test.mjs two dashboard shards and missing/ambiguous assertions; direct MakeMe setup; slice-1-proof.md |
| C15 | Convert remaining valid synthetic CI proof summaries. | slice 4 | |
| C16 | Convert remaining valid synthetic proof entries. | slice 2 | observed: Node read/sort/timing/scope/comparison direct MakeMe setup and 52-suite proof in slice-2-proof.md |
| C17 | Convert remaining valid synthetic proof evidence. | slice 2 | observed: Node read/sort/timing/scope/comparison direct MakeMe setup and 52-suite proof in slice-2-proof.md |
| C18 | Convert remaining valid synthetic runner proof records. | slice 1 | observed: ci-proof-test-fixtures.mjs playwrightRecord/locatedRecord delegate shared record; real converter consumers and eight equivalence comparisons in slice-1-proof.md |
| C19 | Convert the listed synthetic summary artifacts. | slice 3 | observed: Intent and comparison MakeMe entries through actual collector/ZIP/listed artifact builder; intent-ci-proof.spec.ts exact run/counts/time/request-order; backend landed-ci-proof-collection |
| C20 | Extend the existing `aCiProofFragment` builder. | slice 1 | observed: ci-proof-collect.test.mjs two dashboard shards and missing/ambiguous assertions; direct MakeMe setup; slice-1-proof.md |
| C21 | Extend the existing `aCiProofSummary` builder. | slice 4 | |
| C22 | Extend the existing `aCiProof` builder. | slice 4 | |
| C23 | Extend the existing `aCiProofEntry` builder. | slice 4 | |
| C24 | Extend the existing `aCiProofEvidence` builder. | slice 4 | |
| C25 | Extend the existing `aCiProofArtifact` builder. | slice 4 | |
| C26 | Extend the existing `aDashboardProofRecord` builder. | slice 1 | observed: ci-proof-test-fixtures.mjs playwrightRecord/locatedRecord delegate shared record; real converter consumers and eight equivalence comparisons in slice-1-proof.md |
| C27 | Retain already-converted consumers on the shared owner. | slice 4 | |
| C28 | Remove or delegate displaced constructors. | slice 4 | |
| C29 | Remove or delegate displaced suite-local wrappers in `ci-proof-test-fixtures`. | slice 1 | observed: ci-proof-test-fixtures.mjs playwrightRecord/locatedRecord delegate shared record; real converter consumers and eight equivalence comparisons in slice-1-proof.md |
| C30 | Remove or delegate displaced positional `ProofPart` tuples in `ciProofArtifacts`. | slice 3 | observed: ciProofArtifacts.ts/ciProofEntryInputs.ts/ciProofCollected.ts direct named production inputs, removed tuples/casts; typecheck and story-ci-comparison-entry-summaries.test.mjs |
| C31 | Remove or delegate displaced positional declaration tuples in `ciProofArtifacts`. | slice 3 | observed: ciProofArtifacts.ts/ciProofEntryInputs.ts/ciProofCollected.ts direct named production inputs, removed tuples/casts; typecheck and story-ci-comparison-entry-summaries.test.mjs |
| C32 | State the entry path at the call site whenever it drives the case. | slice 4 | |
| C33 | State `part/of` at the call site whenever it drives the case. | slice 4 | |
| C34 | State attempt identity at the call site whenever it drives the case. | slice 4 | |
| C35 | State the checked revision at the call site whenever it drives the case. | slice 4 | |
| C36 | State the unit at the call site whenever it drives the case. | slice 4 | |
| C37 | Include the legacy unit’s label when that unit drives the case. | slice 4 | |
| C38 | State counts at the call site whenever they drive the case. | slice 4 | |
| C39 | State duration at the call site whenever it drives the case. | slice 4 | |
| C40 | State breakdown at the call site whenever it drives the case. | slice 4 | |
| C41 | Correct path-based unit inference so an outcomes path under `dashboard/tests` does not become test cases. | slice 1 | observed: ci-proof-outcomes.test.mjs outcomes path never declares a unit; ci-proof-unit-declarations.test.mjs first case; ci-proof-units.test.mjs cases under tests remain cases |
| C42 | Keep Playwright cases as cases regardless of path. | slice 1 | observed: ci-proof-outcomes.test.mjs outcomes path never declares a unit; ci-proof-unit-declarations.test.mjs first case; ci-proof-units.test.mjs cases under tests remain cases |
| C43 | Keep a summary and its fragments on one attempt identity. | slice 1 | observed: ci-proof-collect.test.mjs exact identity and part summaries; ci-proof-attempt.test.mjs mismatches excluded and missing/ambiguous parts uncounted |
| C44 | Keep a summary and its fragments on one checked revision. | slice 1 | observed: ci-proof-collect.test.mjs exact identity and part summaries; ci-proof-attempt.test.mjs mismatches excluded and missing/ambiguous parts uncounted |
| C45 | Preserve present parts as distinct evidence. | slice 2 | observed: intent-scope-proof-units.test.mjs missing/ambiguous and no-present gap assertions; intent-scope-proof.test.mjs each row names its gap |
| C46 | Preserve missing parts as distinct evidence. | slice 2 | observed: intent-scope-proof-units.test.mjs missing/ambiguous and no-present gap assertions; intent-scope-proof.test.mjs each row names its gap |
| C47 | Preserve ambiguous parts as distinct evidence. | slice 2 | observed: intent-scope-proof-units.test.mjs missing/ambiguous and no-present gap assertions; intent-scope-proof.test.mjs each row names its gap |
| C48 | Preserve a recorded zero as distinct evidence. | slice 2 | observed: intent-ci-proof-timing.test.mjs zero versus No timings; dashboard-ci-comparison-entry-gaps.test.mjs partial endpoint; intent-scope-proof.test.mjs absent path no CI result |
| C49 | Preserve absent evidence as distinct evidence. | slice 2 | observed: intent-ci-proof-timing.test.mjs zero versus No timings; dashboard-ci-comparison-entry-gaps.test.mjs partial endpoint; intent-scope-proof.test.mjs absent path no CI result |
| C50 | Preserve unavailable reasons as distinct evidence. | slice 4 | |
| C51 | Never count file breakdown paths as test files. | slice 2 | observed: intent-scope-proof-units.test.mjs folder two source files versus case5/file1; scope figures/counts/parts independently expected |
| C52 | Keep real report conversion in its harness. | slice 1 | observed: real converters/collector/CLI retained; ciProofFragmentTestData.mjs uses production fragment constructor; independent validators; slice-1-proof.md |
| C53 | Keep collector summarization in its harness. | slice 1 | observed: real converters/collector/CLI retained; ciProofFragmentTestData.mjs uses production fragment constructor; independent validators; slice-1-proof.md |
| C54 | Keep artifact zip assembly in its harness. | slice 2 | observed: ci-proof-read.test.mjs archive/request-order/limits/refusals; dashboard-ci-proof-breakdown-read.test.mjs whole read and ZipEntryTooLarge assertions |
| C55 | Keep artifact download in its harness. | slice 2 | observed: ci-proof-read.test.mjs archive/request-order/limits/refusals; dashboard-ci-proof-breakdown-read.test.mjs whole read and ZipEntryTooLarge assertions |
| C56 | Keep parse failures in their harnesses. | slice 2 | observed: ci-proof-read.test.mjs archive/request-order/limits/refusals; dashboard-ci-proof-breakdown-read.test.mjs whole read and ZipEntryTooLarge assertions |
| C57 | Keep size limits in their harnesses. | slice 2 | observed: ci-proof-read.test.mjs archive/request-order/limits/refusals; dashboard-ci-proof-breakdown-read.test.mjs whole read and ZipEntryTooLarge assertions |
| C58 | Keep source positions in their harnesses. | slice 4 | |
| C59 | Keep clocks in their harnesses. | slice 4 | |
| C60 | Keep teardown in its harness. | slice 4 | |
| C61 | A producer or collector case still lets the real boundary write or read. | slice 1 | observed: real converters/collector/CLI retained; ciProofFragmentTestData.mjs uses production fragment constructor; independent validators; slice-1-proof.md |
| C62 | Prefer production fragment constructors at the boundary. | slice 1 | observed: real converters/collector/CLI retained; ciProofFragmentTestData.mjs uses production fragment constructor; independent validators; slice-1-proof.md |
| C63 | Prefer production summary constructors at the boundary. | slice 2 | observed: dashboard-ci-proof-units-read.test.mjs MakeMe entries through real proofSummaryForEntries/zip/check/parser with independent case5/time1500 and file1 assertions |
| C64 | Prefer production schemas at the boundary. | slice 1 | observed: real converters/collector/CLI retained; ciProofFragmentTestData.mjs uses production fragment constructor; independent validators; slice-1-proof.md |
| C65 | Keep malformed or legacy exact summary JSON outside builders. | slice 4 | |
| C66 | Keep malformed or legacy exact fragment JSON outside builders. | slice 4 | |
| C67 | Keep deliberate unit contradictions outside builders. | slice 4 | |
| C68 | Keep captured archive bytes outside builders. | slice 4 | |
| C69 | Keep independently written expectations outside builders. | slice 4 | |
| C70 | Use MakeMe for valid surrounding facts. | slice 4 | |
| C71 | In mixed tests, convert this story’s facts only. | slice 4 | |
| Q01 | The conversion inventory includes collector tests. | slice 1 | observed: ci-proof-collect.test.mjs two dashboard shards and missing/ambiguous assertions; direct MakeMe setup; slice-1-proof.md |
| Q02 | The conversion inventory includes converter tests. | slice 1 | observed: ci-proof-collect.test.mjs two dashboard shards and missing/ambiguous assertions; direct MakeMe setup; slice-1-proof.md |
| Q03 | The conversion inventory includes Node support readers. | slice 2 | observed: Node read/sort/timing/scope/comparison direct MakeMe setup and 52-suite proof in slice-2-proof.md |
| Q04 | The conversion inventory includes scope comparisons. | slice 2 | observed: Node read/sort/timing/scope/comparison direct MakeMe setup and 52-suite proof in slice-2-proof.md |
| Q05 | The conversion inventory includes dashboard proof journeys. | slice 3 | observed: Intent and comparison MakeMe entries through actual collector/ZIP/listed artifact builder; intent-ci-proof.spec.ts exact run/counts/time/request-order; backend landed-ci-proof-collection |
| Q06 | “About 35 files” describes a consumer inventory; it is not a completion limit. | slice 4 | |
| Q07 | Attempt identity means a GitHub run attempt **or** an adapter `attemptId`, as applicable. | slice 4 | |
| Q08 | The unit alternatives are case, file, or legacy with its label. | slice 4 | |
| Q09 | Builders may supply a stored fragment only when it is that consumer’s starting fact. | slice 2 | observed: dashboard-ci-proof-units-read.test.mjs MakeMe entries through real proofSummaryForEntries/zip/check/parser with independent case5/time1500 and file1 assertions |
| Q10 | Builders may supply a stored summary only when it is that consumer’s starting fact. | slice 2 | observed: dashboard-ci-proof-units-read.test.mjs MakeMe entries through real proofSummaryForEntries/zip/check/parser with independent case5/time1500 and file1 assertions |
| Q11 | Builders may supply a stored proof record only when it is that consumer’s starting fact. | slice 1 | observed: ci-proof-test-fixtures.mjs playwrightRecord/locatedRecord delegate shared record; real converter consumers and eight equivalence comparisons in slice-1-proof.md |
| Q12 | Valid surrounding facts include nonqualifying attempts. | slice 2 | observed: ci-proof-check.test.mjs GitHub/adapter summary identity refusal reasons; ci-proof-read.test.mjs accepted run; unit-reader checked identity |
| Q13 | Valid surrounding facts include mismatched attempts. | slice 2 | observed: ci-proof-check.test.mjs GitHub/adapter summary identity refusal reasons; ci-proof-read.test.mjs accepted run; unit-reader checked identity |
| Q14 | The work is test-data conversion and exposed mapping repair. | slice 4 | |
| J01 | A Playwright record under `dashboard/tests` reports one expected case. | slice 1 | observed: ci-proof-outcomes.test.mjs outcomes path never declares a unit; ci-proof-unit-declarations.test.mjs first case; ci-proof-units.test.mjs cases under tests remain cases |
| J02 | An outcomes report under `dashboard/backend-tests` arrives without a declared unit. | slice 1 | observed: ci-proof-outcomes.test.mjs outcomes path never declares a unit; ci-proof-unit-declarations.test.mjs first case; ci-proof-units.test.mjs cases under tests remain cases |
| J03 | An outcomes report under `tests` arrives without a declared unit. | slice 1 | observed: ci-proof-outcomes.test.mjs outcomes path never declares a unit; ci-proof-unit-declarations.test.mjs first case; ci-proof-units.test.mjs cases under tests remain cases |
| J04 | Conversion keeps the example Playwright fragment as test cases. | slice 1 | observed: ci-proof-outcomes.test.mjs outcomes path never declares a unit; ci-proof-unit-declarations.test.mjs first case; ci-proof-units.test.mjs cases under tests remain cases |
| J05 | Conversion keeps the example outcomes reports as legacy checks. | slice 1 | observed: ci-proof-outcomes.test.mjs outcomes path never declares a unit; ci-proof-unit-declarations.test.mjs first case; ci-proof-units.test.mjs cases under tests remain cases |
| J06 | Those outcomes paths do not cause conversion to invent a case unit. | slice 1 | observed: ci-proof-outcomes.test.mjs outcomes path never declares a unit; ci-proof-unit-declarations.test.mjs first case; ci-proof-units.test.mjs cases under tests remain cases |
| J07 | Those outcomes paths do not cause conversion to invent a file unit. | slice 1 | observed: ci-proof-outcomes.test.mjs outcomes path never declares a unit; ci-proof-unit-declarations.test.mjs first case; ci-proof-units.test.mjs cases under tests remain cases |
| J08 | A declaration naming file for `tests` excludes a case fragment for that entry. | slice 1 | observed: ci-proof-unit-declarations.test.mjs exclusion notes and unchanged file/legacy status/count assertions |
| J09 | That declaration excludes a legacy fragment for that entry. | slice 1 | observed: ci-proof-unit-declarations.test.mjs exclusion notes and unchanged file/legacy status/count assertions |
| J10 | The exclusion carries a note. | slice 1 | observed: ci-proof-unit-declarations.test.mjs exclusion notes and unchanged file/legacy status/count assertions |
| J11 | The declaration does not relabel the excluded fragment. | slice 1 | observed: ci-proof-unit-declarations.test.mjs exclusion notes and unchanged file/legacy status/count assertions |
| J12 | Fragments for entry `tests` are parts 1 and 2 of 2. | slice 1 | observed: ci-proof-collect.test.mjs exact identity and part summaries; ci-proof-attempt.test.mjs mismatches excluded and missing/ambiguous parts uncounted |
| J13 | Those fragments and a matching summary all name run attempt 2. | slice 1 | observed: ci-proof-collect.test.mjs exact identity and part summaries; ci-proof-attempt.test.mjs mismatches excluded and missing/ambiguous parts uncounted |
| J14 | Those fragments and the matching summary all name revision `a5b0…`. | slice 1 | observed: ci-proof-collect.test.mjs exact identity and part summaries; ci-proof-attempt.test.mjs mismatches excluded and missing/ambiguous parts uncounted |
| J15 | The collector accepts that shared identity. | slice 1 | observed: ci-proof-collect.test.mjs exact identity and part summaries; ci-proof-attempt.test.mjs mismatches excluded and missing/ambiguous parts uncounted |
| J16 | A dashboard read accepts that shared identity. | slice 2 | observed: ci-proof-check.test.mjs GitHub/adapter summary identity refusal reasons; ci-proof-read.test.mjs accepted run; unit-reader checked identity |
| J17 | A fragment or summary naming another attempt is mismatched evidence. | slice 2 | observed: ci-proof-check.test.mjs GitHub/adapter summary identity refusal reasons; ci-proof-read.test.mjs accepted run; unit-reader checked identity |
| J18 | A fragment or summary naming another `attemptId` is mismatched evidence. | slice 2 | observed: ci-proof-check.test.mjs GitHub/adapter summary identity refusal reasons; ci-proof-read.test.mjs accepted run; unit-reader checked identity |
| J19 | A fragment or summary naming another revision is mismatched evidence. | slice 2 | observed: ci-proof-check.test.mjs GitHub/adapter summary identity refusal reasons; ci-proof-read.test.mjs accepted run; unit-reader checked identity |
| J20 | Missing part 2 is shown as missing. | slice 1 | observed: ci-proof-collect.test.mjs exact identity and part summaries; ci-proof-attempt.test.mjs mismatches excluded and missing/ambiguous parts uncounted |
| J21 | Two candidates for part 1 are ambiguous. | slice 1 | observed: ci-proof-collect.test.mjs exact identity and part summaries; ci-proof-attempt.test.mjs mismatches excluded and missing/ambiguous parts uncounted |
| J22 | Those ambiguous candidates are uncounted. | slice 1 | observed: ci-proof-collect.test.mjs exact identity and part summaries; ci-proof-attempt.test.mjs mismatches excluded and missing/ambiguous parts uncounted |
| J23 | Entry `dashboard/tests` holds case evidence with 4 passed in `12_040 ms`. | slice 3 | observed: intentSummaryStoryComparisonProofs.noBreakdownBaselineProofs case4/time12040 versus file2/time2500 part1; nineteen real collector comparisons; Summary comparison file/source/sort journeys |
| J24 | That case evidence has part 1 present. | slice 3 | observed: intentSummaryStoryComparisonProofs.noBreakdownBaselineProofs case4/time12040 versus file2/time2500 part1; nineteen real collector comparisons; Summary comparison file/source/sort journeys |
| J25 | Entry `tests` holds file evidence with 2 passed in `2_500 ms`. | slice 3 | observed: intentSummaryStoryComparisonProofs.noBreakdownBaselineProofs case4/time12040 versus file2/time2500 part1; nineteen real collector comparisons; Summary comparison file/source/sort journeys |
| J26 | Intent surfaces show the case and file units apart. | slice 3 | observed: intent-ci-proof-units.spec.ts separate units at CI status/Summary/folder/file; intent-ci-status-execution-time.spec.ts separate4min/2min and exact zero/untimed/missing assertions |
| J27 | Comparison surfaces show the case and file units apart. | slice 3 | observed: intent-ci-comparison-mounted-units.spec.ts separate case+2 and file counts at overall/entry/folder/file levels; legacy/count-gap mounted cases; slice-3-proof.md |
| J28 | Intent surfaces never sum those different units. | slice 3 | observed: intent-ci-proof-units.spec.ts separate units at CI status/Summary/folder/file; intent-ci-status-execution-time.spec.ts separate4min/2min and exact zero/untimed/missing assertions |
| J29 | Comparison surfaces never sum those different units. | slice 3 | observed: intent-ci-comparison-mounted-units.spec.ts separate case+2 and file counts at overall/entry/folder/file levels; legacy/count-gap mounted cases; slice-3-proof.md |
| J30 | A file breakdown listing `a.spec.ts` and `b.spec.ts` contributes figures to the file unit. | slice 2 | observed: intent-scope-proof-units.test.mjs folder two source files versus case5/file1; scope figures/counts/parts independently expected |
| J31 | Those two paths are not two additional test-file counts. | slice 2 | observed: intent-scope-proof-units.test.mjs folder two source files versus case5/file1; scope figures/counts/parts independently expected |
| J32 | A present zero remains zero. | slice 2 | observed: intent-ci-proof-timing.test.mjs zero versus No timings; dashboard-ci-comparison-entry-gaps.test.mjs partial endpoint; intent-scope-proof.test.mjs absent path no CI result |
| J33 | That present zero remains distinct from a missing part. | slice 2 | observed: intent-ci-proof-timing.test.mjs zero versus No timings; dashboard-ci-comparison-entry-gaps.test.mjs partial endpoint; intent-scope-proof.test.mjs absent path no CI result |
| J34 | That present zero remains distinct from unavailable proof. | slice 2 | observed: intent-ci-proof-timing.test.mjs zero versus No timings; dashboard-ci-comparison-entry-gaps.test.mjs partial endpoint; intent-scope-proof.test.mjs absent path no CI result |
| J35 | A Node reader starts from MakeMe-built entries for the attempt. | slice 2 | observed: dashboard-ci-proof-units-read.test.mjs MakeMe entries through real proofSummaryForEntries/zip/check/parser with independent case5/time1500 and file1 assertions |
| J36 | A dashboard journey starts from MakeMe-built entries for the attempt. | slice 3 | observed: Intent and comparison MakeMe entries through actual collector/ZIP/listed artifact builder; intent-ci-proof.spec.ts exact run/counts/time/request-order; backend landed-ci-proof-collection |
| J37 | The real collector **or** artifact zip supplies the summary bytes those consumers observe. | slice 2 | observed: dashboard-ci-proof-units-read.test.mjs MakeMe entries through real proofSummaryForEntries/zip/check/parser with independent case5/time1500 and file1 assertions |
| J38 | Suite-local positional part tuples are gone from those setups. | slice 3 | observed: ciProofArtifacts.ts/ciProofEntryInputs.ts/ciProofCollected.ts direct named production inputs, removed tuples/casts; typecheck and story-ci-comparison-entry-summaries.test.mjs |
| J39 | Casts are gone from those setups. | slice 3 | observed: ciProofArtifacts.ts/ciProofEntryInputs.ts/ciProofCollected.ts direct named production inputs, removed tuples/casts; typecheck and story-ci-comparison-entry-summaries.test.mjs |
| J40 | Exact version-1 legacy JSON stays literal. | slice 4 | |
| J41 | A deliberately corrupt archive stays literal. | slice 4 | |
| J42 | An expired artifact stays literal. | slice 4 | |
| J43 | An oversized artifact stays literal. | slice 4 | |
| J44 | Independently written expectations stay literal. | slice 4 | |
| J45 | Unavailable reason `none` remains distinct. | slice 4 | |
| J46 | Unavailable reason `expired` remains distinct. | slice 4 | |
| J47 | Unavailable reason `unreadable` remains distinct. | slice 4 | |
| J48 | Unavailable reason `invalid` remains distinct. | slice 4 | |
| J49 | Unavailable reason `mismatched` remains distinct. | slice 4 | |
| J50 | Unavailable reason `too-large` remains distinct. | slice 4 | |
| X01 | Do not introduce another proof representation. | slice 4 | |
| X02 | Avoid suite-specific intermediate models. | slice 4 | |
| X03 | Avoid unnecessary casts. | slice 4 | |
| X04 | GitHub run conversion remains with its sibling story. | slice 4 | |
| X05 | GitHub job conversion remains with its sibling story. | slice 4 | |
| X06 | CI adapter attempt conversion remains with its sibling story. | slice 4 | |
| X07 | CI adapter queue conversion remains with its sibling story. | slice 4 | |
| X08 | CI adapter coverage conversion remains with its sibling story. | slice 4 | |
| X09 | Installation setup conversion remains with its sibling story. | slice 4 | |
| X10 | Native setup conversion remains with its sibling story. | slice 4 | |
| X11 | No new UI promise. | slice 4 | |
| X12 | No new collector protocol promise. | slice 4 | |
| X13 | No new proof-unit policy promise. | slice 4 | |
| X14 | No new CI workflow promise. | slice 4 | |
| X15 | No new installation promise. | slice 4 | |
