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
| 1 | Intent comparison, completed/retained Intent, Summary and timing-history arrangement across backend, E2E and Frontend-group tests read as shared MakeMe repository facts without routine Git reconstruction | slice 6 | |
| 2 | Existing owners extended only for demonstrated gaps; no imperative scripts in builder spelling or second representation | slice 6 | |
| 3 | Harnesses keep filesystem, Git, installation, environment and cleanup; materialize only on demand | slice 6 | |
| 4 | Prepared-prefix, template and worker reuse preserved | slice 6 | |
| 5 | Private mutable refs, objects, config, index and files keep fixtures isolated | slice 6 | |
| 6 | Named revision and workspace results replace incidental rev-parse setup | slice 6 | |
| 7 | Builders derive related incidental IDs, fixed defaults where isolation permits | slice 6 | |
| 8 | Specs neither import randomUUID for defaults nor pass incidental UUIDs to relate construction | slice 6 | |
| 9 | Meaningful IDs, malformed IDs and real launch-returned reporting contexts stay intact | slice 6 | |
| 10 | Actions under proof stay visible: post-observation publication, completion/capture, ref movement, shallow recovery, corruption, cleanup, competing writers, failed pushes, destructive operations | slice 6 | |
| 11 | Staging, dirty state, authorship, topology and byte distinctions explaining each case stay visible | slice 6 | |
| 12 | Test purposes and independent CI/source/proof assertions unchanged | slice 6 | |
| 13 | Given named built baseline, planning-only ancestors, claim and provisional branch/trunk tip, Taken Intent shows the same baseline, provisional identity and CI rows | slice 1 | observed: e2e/intent/intent-ci-comparison-taken.spec.ts:36-94 and intent-ci-comparison-adapter-taken.spec.ts over storyCiComparisonBaseline.ts declared history (slice 1 run s1-e2e-1, s1-restored-1) |
| 14 | Publishing a new branch head after the Taken observation stays a scenario action and triggers the same fresh read | slice 1 | observed: e2e/intent/intent-ci-comparison-taken.spec.ts:100-140 real post-observation push and rerun request assertion :136 (s1-e2e-1) |
| 15 | Given owning landing merge, later completion and later trunk build, Done Intent selects the original landing/branch endpoints | slice 2 | observed: e2e intent-ci-comparison-adapter merge landing row, intent-ci-done-prior-provenance, intent-ci-comparison (ancestor later-revision), backend ci-comparison-endpoints/published-endpoints/history-integration over named branchSide from completedStoryPublication.ts (slice 2 runs s2-e2e-proof, s2-backend-proof, s2-endpoints-proof) |
| 16 | Each build uses its own workflow bytes even when the local tip's workflow differs | slice 3 | |
| 17.1 | Planning-only, code, cancelled and proofless cases stay distinct | slice 3 | |
| 17.2 | Exact, ancestor, equivalent, later-build and unavailable results stay distinct | slice 3 | |
| 18 | Done Intent reads the immutable completion despite conflicting later trunk and retained-workspace edits | slice 4 | |
| 19 | Ordinary Review still reads the local edits in that situation | slice 4 | |
| 20 | Missing history stays unavailable until the explicit recovery action | slice 4 | |
| 21 | Summary and collected/retained scope history keep the same counts, timing rows, represented landing and selected build provenance for changed/added/removed/renamed nested files | slice 6 | |
| 22 | A measured file absent from the current tree still contributes to history | slice 6 | |
| 23 | Uncollected endpoints and gaps stay visible | slice 6 | |
| 24 | Test-data architecture guide updated for delivered capabilities | slice 6 | |
| 25 | Selected MakeMe/page-object conventions, ADR 0002 direct mapping and ADR 0008 published/local distinction applied | slice 6 | |
| 26 | Representative construction compared before/after under ADR 0010; readable construction kept only when benefit justifies builder complexity | slice 6 | |
| 27 | No production behavior change | slice 6 | |
| 28 | Speedup claimed only if measured | slice 6 | |
