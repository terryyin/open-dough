# Source review

**Launch:** fresh general-purpose subagent, no conversation inheritance, 2026-11-18, by coordinator Maki-chan.
**Input:** the seed section's Goal and Scope
([SEED-334#keep-navigation-conversion-proof-whole](../../seeds/SEED-334-product-wide-end-to-end-tests.md#keep-navigation-conversion-proof-whole))
and this plan's complete `## Correction input` section, verbatim; no slicing, proof or product.
Instructed to read no project files and change nothing.

**Unnumbered context returned:** provenance; scope as a limit (no rejection rule beyond 8 and 12);
the drift mechanism (transient 404 re-ask, 15 s revision check, `untilPageReadsAnswered` leaving
first checks); plan 648 slice 3's misnamed home; why finding 4's checks cannot fail; a possible
tension between 6 and 7 if finding 4's checks were removed (the plan keeps both, sequenced after
`untilPageReadsAnswered`); the beneficiary is a maintainer relying on the converted checks.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Header layout journeys' openDoughReads() counts after settling and after the Shift+Tab walk hold however long the journey runs, including past the 15 s transient re-ask (Goal; finding 1 first bullet) | slice 1 | observed: dashboard-header.spec.ts layout journeys toBe(20) settled and after walk via countProjectWorkReads; scratch 17 s wait before walk count held 20 (evidence s1-break-c), one extra read failed 21 (s1-break-ab) |
| 2 | Layout journeys' "reads nothing again" is observed against answered story records, not 404 transient failure answers (finding 1 first bullet) | slice 1 | observed: publishLargeBacklogWithRecords (dashboard/tests/accessibleBoard.ts) publishes all 17 story records for the layout journeys; s1-break-c held 20 past the 15 s transient re-ask that 404 answers caused (40) |
| 3 | Project-switch journey's per-project counts hold over time, past the 15 s revision check, accounting for each project's first check (Goal; finding 1 second bullet) | slice 1 | observed: dashboard-header.spec.ts banner project selection toBe(5) for open-dough and doughnut excluding the at check; held 5/5 after 17 s (s1-break-c), one extra Doughnut read failed 6 (s1-break-ab) |
| 4 | One Frontend check covers the paging view beside a newly arrived session: paged back to Backlog/Taken beside the panel, a session started from a Backlog card stays on its card, the right control keeps "Recently done 0 entries", the view stays (Goal; finding 2) | slice 2 | observed: board-paging-side-panel.spec.ts test "paged back to Backlog beside the side panel, a session started from the ready Backlog card…": storyCardSessions toHaveCount(1) and expectShown Backlog/Taken with Recently done 0 entries (s2-refactor-specs pass; s2-refactor-break-b failed 1 entry) |
| 5 | project-read-isolation.spec.ts:204 cites ../../dashboard/frontend-tests/navigation/project-selection.spec.ts; no live comment points at a deleted interim spec (Goal; finding 3; Scope) | slice 2 | observed: e2e/observation/project-read-isolation.spec.ts:204 cites ../../dashboard/frontend-tests/navigation/project-selection.spec.ts; grep of paths deleted in 161830d70^..40bba4d8e finds no other live citation (s2-report.md) |
| 6 | The focus spec's post-release "no Doughnut story" and Doughnut read-count checks sit where they observe something real, or stop claiming to refuse a late answer that cannot exist (finding 4; provenance) | slice 1 | observed: project-keyboard-navigation-focus.spec.ts held-read step: untilPageReadsAnswered after heldDoughnut.release(), both checks kept, comment states the cancelled read (s1-specs-2) |
| 7 | Every assertion the converted specs make today stays | slice 2 | observed: diffs 46aa7f7c0..HEAD and slice 2: every prior assertion kept; only the header switch pin restated 6/6 to 5/5 without the at check, as planned |
| 8 | No product code changes | slice 2 | observed: git diff 46aa7f7c0 -- dashboard/src dashboard/server is empty |
| 9 | Default timeouts only, no test.slow() | slice 2 | observed: no test.slow or timeout override in the changed specs |
| 10 | Every touched file is 250 lines or fewer | slice 2 | observed: touched files: dashboard-header 198, focus 116, accessibleBoard 135, read control 65, board-paging-side-panel 129, project-read-isolation 248 lines |
| 11 | Changed Frontend test sources follow the MakeMe and page-object conventions | slice 2 | observed: test-entry selection makeMe+pageObjects; makeMe.aRepository/aSessionState builders and page objects (backlogLaunchers, storyCardSessions, columnPagingControl) used |
| 12 | The interim group, its shards and the sibling story's specs are not changed | slice 2 | observed: no change under the interim group, its shards (ci.yml, shards.md) or the sibling story specs |
