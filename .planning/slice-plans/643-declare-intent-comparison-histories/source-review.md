# Source review — SEED-353#declare-intent-comparison-histories

Launch: fresh general-purpose reviewer (no fork, no inherited conversation),
2026-11-18, before slice 1 delegation. Input: only the SEED-353 parent shared
requirements and this story's Goal, Scope, Key examples and Safe stopping
point, verbatim; no plan, return, product or proof. Instructed to read no
project files and change nothing. The commitments below are its numbered
return; quoted source text is abbreviated to its first clause.

Unnumbered context returned: Purpose/CI maintenance reason; test-support took
over the retired integrated tier; "a scan is a starting point" as audit
guidance; review/completion/launch/recovery migrations stay with siblings;
shared consumers gain no completion claim; other families need not migrate
first; no open human decision; no speedup baseline.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Intent comparison, completed/retained Intent, Summary and timing-history arrangement across backend, E2E and Frontend-group tests read as shared MakeMe repository facts without routine Git reconstruction | slice 6 | observed: slice-6-report.md audit table of remaining Intent arrangement (migrated or dispositioned) plus slice 1-6 delivered notes in PLAN.md |
| 2 | Existing owners extended only for demonstrated gaps; no imperative scripts in builder spelling or second representation | slice 6 | observed: per-slice Delivered notes: extensions are named results on existing owners (publishTake claim, branchSide, commitAll/advanceCompletedTrunk commits, publishDeclaredTrunk, completeBacklogStory); deleted uncalled publishers; slice-6-report.md promise 2 |
| 3 | Harnesses keep filesystem, Git, installation, environment and cleanup; materialize only on demand | slice 6 | observed: Distribution/tests/support/repository-fixture.mjs and startOrigin* unchanged in role; Git/files/cleanup stay in harness helpers (publishDeclaredTrunk, commitDeclaredRevision); slice-6-report.md promise 3 |
| 4 | Prepared-prefix, template and worker reuse preserved | slice 6 | observed: kept/prepared origin paths unchanged; kept-copy consumers pass (s5-kept-e2e, s5-kept-backend incl. start-origin-private, s6-e2e projectScopeHistoryFixture cases) |
| 5 | Private mutable refs, objects, config, index and files keep fixtures isolated | slice 6 | observed: s5-kept-backend start-origin-private passed; no origin map/materializer change; endpoints read origin.revision map (slice-6-report.md promise 5) |
| 6 | Named revision and workspace results replace incidental rev-parse setup | slice 6 | observed: declaredSummaryComparisonEndpointsIn reads origin.revision; story.claim; landed-ci-scope bases use setup.claim/trunkSide/advanced, origin.revision(base), trunk.parent (slice-6-report.md Acceptance return s6b; s6b-backend) |
| 7 | Builders derive related incidental IDs, fixed defaults where isolation permits | slice 6 | observed: claim derived by publishTake; laterWithoutBuildBeforeClaim; launch/landing IDs via existing makeMe builders (slice-6-report.md promise 7) |
| 8 | Specs neither import randomUUID for defaults nor pass incidental UUIDs to relate construction | slice 6 | observed: slice-6-report.md audit row: no randomUUID in Intent specs |
| 9 | Meaningful IDs, malformed IDs and real launch-returned reporting contexts stay intact | slice 6 | observed: malformed/meaningful IDs and launch receipts untouched; landed-ci-scope specs keep forLaunch(receipt)/deliveredAs (s6b-backend) |
| 10 | Actions under proof stay visible: post-observation publication, completion/capture, ref movement, shallow recovery, corruption, cleanup, competing writers, failed pushes, destructive operations | slice 6 | observed: Taken head push (intent-ci-comparison-taken.spec.ts:100-140), real CLI completion/landing merge, shallow fetch/unshallow in retry and retained specs, post-read publication kept (slice-6-report.md audit rows) |
| 11 | Staging, dirty state, authorship, topology and byte distinctions explaining each case stay visible | slice 6 | observed: authorship kept (commitAgentWork agent author/developer committer; agent-authored --no-ff landing); topology/bytes verified by workflow faults s1/s3 and completion-byte fault s4 |
| 12 | Test purposes and independent CI/source/proof assertions unchanged | slice 6 | observed: spec diffs across slices are import/argument/setup only; no assertion or expected value changed (slice reports 1-6); CI repair removed only unreachable guards |
| 13 | Given named built baseline, planning-only ancestors, claim and provisional branch/trunk tip, Taken Intent shows the same baseline, provisional identity and CI rows | slice 1 | observed: e2e/intent/intent-ci-comparison-taken.spec.ts:36-94 and intent-ci-comparison-adapter-taken.spec.ts over storyCiComparisonBaseline.ts declared history (slice 1 run s1-e2e-1, s1-restored-1) |
| 14 | Publishing a new branch head after the Taken observation stays a scenario action and triggers the same fresh read | slice 1 | observed: e2e/intent/intent-ci-comparison-taken.spec.ts:100-140 real post-observation push and rerun request assertion :136 (s1-e2e-1) |
| 15 | Given owning landing merge, later completion and later trunk build, Done Intent selects the original landing/branch endpoints | slice 2 | observed: e2e intent-ci-comparison-adapter merge landing row, intent-ci-done-prior-provenance, intent-ci-comparison (ancestor later-revision), backend ci-comparison-endpoints/published-endpoints/history-integration over named branchSide from completedStoryPublication.ts (slice 2 runs s2-e2e-proof, s2-backend-proof, s2-endpoints-proof) |
| 16 | Each build uses its own workflow bytes even when the local tip's workflow differs | slice 3 | observed: slice 3 fault s3-fault: altered historical workflow failed adapter-planning-skip/skipped-landed Landed identity and intent-ci-comparison +17 s; tip-only workflow change s3-tipdiff passed; restored s3-restored passed |
| 17.1 | Planning-only, code, cancelled and proofless cases stay distinct | slice 3 | observed: backend ci-comparison-selection, ci-comparison-cancelled(-awaiting) (s3-backend), e2e skipped-landed/adapter-planning-skip/cancelled-landing/pending-proof/missing-run (s3-e2e2) |
| 17.2 | Exact, ancestor, equivalent, later-build and unavailable results stay distinct | slice 3 | observed: backend ci-comparison-selection (s3-backend) and frontend intent-ci-comparison-mounted-selection/-gaps/-wording (s3-frontend) exact/ancestor/equivalent/later-build/unavailable rows |
| 18 | Done Intent reads the immutable completion despite conflicting later trunk and retained-workspace edits | slice 4 | observed: e2e/intent/intent-done-retained-workspace.spec.ts:137 completed immutable diff (s4 E2E strict record); fault: declared completion bytes changed failed at :137, restored passed |
| 19 | Ordinary Review still reads the local edits in that situation | slice 4 | observed: Review assertions in e2e/intent/intent-done-retained-workspace.spec.ts and intent-done-retained-landing.spec.ts (s4 E2E strict record) |
| 20 | Missing history stays unavailable until the explicit recovery action | slice 4 | observed: shallow-history cases in intent-done-retained-workspace, intent-done-retained-landing and intent-story-completed-source with visible shallow fetch and recovery (s4 E2E strict record) |
| 21 | Summary and collected/retained scope history keep the same counts, timing rows, represented landing and selected build provenance for changed/added/removed/renamed nested files | slice 6 | observed: Summary: s5-e2e source/renamed and s5-frontend (16); scope history: s6-e2e project/collected/file/gaps/prior-build cases; represented-landing fault s6-fault-d failed, s6-restored passed |
| 22 | A measured file absent from the current tree still contributes to history | slice 6 | observed: e2e/intent/intent-scope-collected-file-timing-history.spec.ts removed/renamed nested files (s6-e2e) |
| 23 | Uncollected endpoints and gaps stay visible | slice 6 | observed: e2e/intent/intent-scope-collected-file-timing-gaps.spec.ts (s6-e2e) |
| 24 | Test-data architecture guide updated for delivered capabilities | slice 6 | observed: Distribution/tests/test-data-architecture.md Intent comparison named-results paragraph (lines 82-91) |
| 25 | Selected MakeMe/page-object conventions, ADR 0002 direct mapping and ADR 0008 published/local distinction applied | slice 6 | observed: MakeMe aRepository/aLaunchLanding descriptions and page-object specs unchanged in kind; endpoints from published origin revisions vs local checkout (slice-6-report.md promise 25) |
| 26 | Representative construction compared before/after under ADR 0010; readable construction kept only when benefit justifies builder complexity | slice 6 | observed: slice-6-report.md Story-level before/after (ADR 0010) plus per-slice comparisons in slice-1..5 reports |
| 27 | No production behavior change | slice 6 | observed: git diff 525013d95 --name-only lists only test, test-support, docs and planning paths (slice-6-report.md promise 27) |
| 28 | Speedup claimed only if measured | slice 6 | observed: no speedup claimed in any slice report or commit |
