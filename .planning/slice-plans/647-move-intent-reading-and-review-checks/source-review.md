# Source-only review

Fresh reviewer launch: `collaboration.spawn_agent`, task
`/root/atomic_source_review`, `fork_turns: none`. Input supplied only the
unchanged selected story's original Goal, Scope, Scope limits and four Key
examples, with instructions to read no project files, change nothing, and
separate each compound-list item. No plan, product, proof, suspected omission
or current-slice scope was supplied. The exact launch/input and returned table
are retained in this execution conversation; the verbatim returned table is
also `/tmp/647-atomic-source-review-return.md`.

Source: `.planning/seeds/SEED-334-product-wide-end-to-end-tests.md#move-intent-reading-and-review-checks`,
unchanged since the established claim. This finer-grained return replaces the
initial 42-item review retained at `f3afab3d:source-review.md` in this plan's
directory; the source did not change. Independently inspected completed proof
is reused only for matching individual promises. All text below is the
reviewer's actual return; the coordinator supplied allocation and observation.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C001 | “story/Done review” — keep story-review regressions at their owning Frontend, Backend and E2E boundaries. | slice 8 |  |
| C002 | “story/Done review” — keep Done-review regressions at their owning Frontend, Backend and E2E boundaries. | slice 8 |  |
| C003 | “source/Purpose” — keep source regressions at their owning boundaries. | slice 8 |  |
| C004 | “source/Purpose” — keep Purpose regressions at their owning boundaries. | slice 8 |  |
| C005 | “reading-recovery regressions” — keep these at their owning boundaries. | slice 8 |  |
| C006 | “Every distinct assertion remains useful” — preserve assertion usefulness throughout conversion. | slice 8 |  |
| C007 | “navigation still runs in Dashboard Integrated UI Test” — retain navigation there. | slice 8 |  |
| C008 | “The gain is clearer proof ownership” — the stated benefit is clearer ownership. | slice 8 |  |
| C009 | “no speed improvement is claimed without measurement” — speed claims require measurement. | slice 8 |  |
| C010 | “Convert the 37 remaining non-CI Intent specs mapped in plan647” — this is the conversion population. | slice 8 |  |
| C011 | “including intent-ci-done-glance” — include this named spec. | slice 8 |  |
| C012 | “and intent-ci-done-reference-lifecycle” — include this named spec. | slice 8 |  |
| C013 | “Their Done reading promises belong here even though their filenames contain CI” — the filenames do not exclude those promises. | slice 8 |  |
| C014 | “actual rendering” — place this at Frontend with “controlled service answers.” | slice 8 |  |
| C015 | “keyboard” — place keyboard observations at Frontend with controlled service answers. | slice 8 |  |
| C016 | “focus” — place focus observations at Frontend with controlled service answers. | slice 8 |  |
| C017 | “source/case selection” — place source-selection observations at Frontend with controlled service answers. | slice 8 |  |
| C018 | “source/case selection” — place case-selection observations at Frontend with controlled service answers. | slice 8 |  |
| C019 | “reading position” — place reading-position observations at Frontend with controlled service answers. | slice 8 |  |
| C020 | “real source judgment” — keep this at Backend or representative E2E boundaries. | slice 8 |  |
| C021 | “historical/live review selection” — keep real historical-review selection at Backend or representative E2E boundaries. | slice 5 |  |
| C022 | “historical/live review selection” — keep real live-review selection at Backend or representative E2E boundaries. | slice 5 |  |
| C023 | “HTTP refusals” — keep these at Backend or representative E2E boundaries. | slice 8 |  |
| C024 | “acquisition” — keep this at Backend or representative E2E boundaries. | slice 8 |  |
| C025 | “GitHub request counts” — keep these at Backend or representative E2E boundaries. | slice 8 |  |
| C026 | “SSE connections” — keep these at Backend or representative E2E boundaries. | slice 8 |  |
| C027 | “Split mixed cases by their assertions” — assertion responsibility determines the split. | slice 8 |  |
| C028 | “including negative effects” — retain negative-effect assertions when splitting mixed cases. | slice 8 |  |
| C029 | “selected-story changes/gaps” — preserve selected-story changes. | slice 3 | observed: slice-3-proof.md Every original browser assertion: six maintained full-app cases preserve changed rows/renames, filtering, expansion, outside counts, no-test state and source refresh; real E2E intent-story-changes and moves pass actual Git baseline/head/diff and Review equality. |
| C030 | “selected-story changes/gaps” — preserve selected-story gaps. | slice 3 | observed: slice-3-proof.md gaps three cases: exact no-workspace, failed comparison/retry, no-locations explanations and negative tree/count/revision assertions retained; real E2E no-workspace HTTP404 and Backend not-configured classification passed. |
| C031 | “coverage” — preserve selected-story coverage. | slice 4 |  |
| C032 | “appearance” — preserve selected-story appearance. | slice 4 |  |
| C033 | “Review return” — preserve return from Review. | slice 4 |  |
| C034 | “Done historical versus live/captured review modes” — preserve historical mode and its distinction from live/captured modes. | slice 5 |  |
| C035 | “Done historical versus live/captured review modes” — preserve the live-mode facet of that distinction. | slice 5 |  |
| C036 | “Done historical versus live/captured review modes” — preserve the captured-mode facet of that distinction. | slice 5 |  |
| C037 | “project refresh” — preserve Done project-refresh behavior. | slice 5 |  |
| C038 | “revision notices” — preserve revision notices. | slice 6 |  |
| C039 | “held/failed/latest updates” — preserve held-update behavior. | slice 6 |  |
| C040 | “held/failed/latest updates” — preserve failed-update behavior. | slice 6 |  |
| C041 | “held/failed/latest updates” — preserve latest-update behavior. | slice 6 |  |
| C042 | “stale-answer exclusion” — preserve exclusion of stale answers. | slice 6 |  |
| C043 | “nested source/Gherkin/Java/Purpose reading” — preserve nested-source reading. | slice 1 | observed: slice-1-proof.md assertion maps: controlled Frontend folder/group/source reading and exact unchanged old/new assertion bodies; real source E2E consumers passed. |
| C044 | “nested source/Gherkin/Java/Purpose reading” — preserve Gherkin reading. | slice 1 | observed: slice-1-proof.md Gherkin groups/layout/Purpose maps and slice-1-consumers.md real Gherkin browse: full-app source reading retained, actual configured acquisition and exact source observations passed. |
| C045 | “nested source/Gherkin/Java/Purpose reading” — preserve Java reading. | slice 1 | observed: slice-1-proof.md Java two-case map: exact text/line numbers/light-dark styling and plain-text grammar fallback passed; real Backend Java3 and E2E mixed-source acquisition passed. |
| C046 | “nested source/Gherkin/Java/Purpose reading” — preserve Purpose reading. | slice 1 | observed: slice-1-proof.md recorded Purpose target/lifetime map: exact target, pinned source, reading offset/highlighting lifetime passed; representative E2E exact GitHub content-read count passed. |
| C047 | “activation” — preserve activation. | slice 7 |  |
| C048 | “reuse” — preserve reuse. | slice 8 |  |
| C049 | “recovery” — preserve recovery. | slice 8 |  |
| C050 | “Before removing each original case, account for every distinct assertion” — accounting precedes each removal. | slice 8 |  |
| C051 | “in named maintained cases” — identify maintained cases carrying those assertions. | slice 8 |  |
| C052 | “including applicable existing proof” — include applicable proof already present. | slice 8 |  |
| C053 | “the same representative scratch break failing before” — observe that break failing before a changed proof boundary. | slice 8 |  |
| C054 | “and after a changed proof boundary” — observe the same representative break failing afterward. | slice 8 |  |
| C055 | “with restored passes” — accompany the scratch-break observations with restored passes. | slice 8 |  |
| C056 | “A move … alone is not preservation evidence” — relocation alone does not establish preservation. | slice 8 |  |
| C057 | “an equal case count alone is not preservation evidence” — equal counts alone do not establish preservation. | slice 8 |  |
| C058 | “Remove only converted specs” — spec removal is limited to converted specs. | slice 8 |  |
| C059 | “and their interim duration rows” — remove the corresponding interim duration rows. | slice 8 |  |
| C060 | “Keep shared support … usable” — retain usable shared support. | slice 8 |  |
| C061 | “remaining runner consumers usable” — retain usability for remaining runner consumers. | slice 8 |  |
| C062 | “After this and the CI conversion both land, no product spec remains in dashboard/tests/intent/” — this end state depends on both conversions landing. | slice 8 |  |
| C063 | “Navigation conversion … belong[s] to the next story” — navigation conversion is outside this conversion. | slice 8 |  |
| C064 | “runner retirement belong[s] to the next story” — runner retirement is outside this conversion. | slice 8 |  |
| C065 | “Intent CI conversion remains in plan633” — retain that scope boundary, subject to the explicitly included Done-reading specs. | slice 8 |  |
| C066 | “No product behavior change” — product behavior changes are excluded. | slice 8 |  |
| C067 | “No … new tier” — adding a tier is excluded. | slice 8 |  |
| C068 | “No … E2E rename” — renaming E2E is excluded. | slice 8 |  |
| C069 | “No … tagged-install proof” — tagged-install proof is excluded. | slice 8 |  |
| C070 | “No … timing … target” — a timing target is excluded. | slice 8 |  |
| C071 | “No … shard target” — a shard target is excluded. | slice 8 |  |
| C072 | “Conversion can start independently” — conversion has an independent start. | slice 1 | observed: Established claim and slice1 execution proceeded independently at f8c4841a while CI sibling remained Taken; minimal valid interaction answers reused existing contracts. |
| C073 | “reuse CI answer families when delivered” — reuse those families once available. | slice 8 |  |
| C074 | “rather than creating parallel ones” — avoid parallel CI answer families. | slice 8 |  |
| C075 | “Shared support alone is no start dependency” — shared support by itself does not block starting. | slice 1 | observed: Established start and successful slice1 delivery cd02f6a5 before any CI sibling trunk product delivery: shared support was not treated as a start dependency. |
| C076 | “With a Taken story selected, browse a location” — include this journey action under the Taken-story condition. | slice 3 | observed: Frontend intent-story-changes-only first case, openStoryIntent then chooseStoryTab: real card selection for Taken StoryA then actual location/folder tree controls; expected selected-story expansion and paths are observed. Real E2E main/moves journeys retain Git-backed selection. |
| C077 | “and nested folders” — include nested-folder browsing in that journey. | slice 3 | observed: Frontend intent-story-changes-only first case: manual boundary/other folder arrangement, enabling/disabling filter and preserved arriving/boundary/out expansion; exact original folder/row observers retained and six-case run passes. |
| C078 | “open a changed test” — include opening a changed test in that journey. | slice 3 | observed: Frontend intent-story-changes-only reading/coverage return step: actual changed.modified row click opens exact diff heading, selected state and reading persist; real E2E main journey proves actual diff equals Review with more hunk. |
| C079 | “open … Review by keyboard” — include keyboard opening of Review. | slice 4 |  |
| C080 | “and close Review by keyboard” — include keyboard closing of Review. | slice 4 |  |
| C081 | “Summary … show[s] the same changes” — Summary retains the same changes through the example journey. | slice 8 |  |
| C082 | “Purpose show[s] the same changes” — Purpose retains the same changes through the example journey. | slice 8 |  |
| C083 | “browsing asks for no text” — protect that negative acquisition effect during browsing. | slice 8 |  |
| C084 | “the diff is read once” — protect the single diff read in this journey. | slice 8 |  |
| C085 | “without published text” — retain that qualification on the diff read. | slice 8 |  |
| C086 | “closing restores the reading” — closing Review restores the reading state. | slice 4 |  |
| C087 | “and header focus” — closing Review restores header focus. | slice 4 |  |
| C088 | “With Done historical Intent open, select another Done story … while its answer is held” — include this held-answer transition. | slice 5 |  |
| C089 | “or ordinary live Review while its answer is held” — retain ordinary live Review as the alternative transition. | slice 5 |  |
| C090 | “the old story/mode’s source … do[es] not leak” — exclude the old story’s source during those transitions. | slice 5 |  |
| C091 | “the old story/mode’s source … do[es] not leak” — exclude the old mode’s source during those transitions. | slice 5 |  |
| C092 | “the old story/mode’s … captured run do[es] not leak” — exclude the old story’s captured run. | slice 5 |  |
| C093 | “the old story/mode’s … captured run do[es] not leak” — exclude the old mode’s captured run. | slice 5 |  |
| C094 | “the correct historical/live answer is selected for real” — protect real selection of the correct historical answer when applicable. | slice 5 |  |
| C095 | “the correct historical/live answer is selected for real” — protect real selection of the correct live answer when applicable. | slice 5 |  |
| C096 | “then the browser renders it” — render the correctly selected answer after selection. | slice 5 |  |
| C097 | “Project refresh preserves the Done file” — retain the Done file through project refresh. | slice 5 |  |
| C098 | “endpoints” — retain endpoints through project refresh. | slice 5 |  |
| C099 | “Purpose/Proof choice” — retain a Purpose choice through project refresh when selected. | slice 5 |  |
| C100 | “Purpose/Proof choice” — retain a Proof choice through project refresh when selected. | slice 5 |  |
| C101 | “reading place” — retain the reading place through project refresh. | slice 5 |  |
| C102 | “With a source case selected, a newer revision arrives → one notice” — show one notice under that trigger. | slice 6 |  |
| C103 | “retains the shown revision” — the notice retains the revision already shown. | slice 6 |  |
| C104 | “Show latest” — include this action in the newer-revision journey. | slice 6 |  |
| C105 | “a held/failed locations or file answer” — include a held-answer state, retaining the locations-or-file alternatives. | slice 6 |  |
| C106 | “a held/failed locations or file answer” — include a failed-answer state, retaining the locations-or-file alternatives. | slice 6 |  |
| C107 | “locations or file answer” — retain the locations-answer path within the held/failed alternatives. | slice 6 |  |
| C108 | “locations or file answer” — retain the file-answer path within the held/failed alternatives. | slice 6 |  |
| C109 | “Retry” — include Retry in the newer-revision recovery journey. | slice 6 |  |
| C110 | “switching projects” — include project switching in that journey. | slice 6 |  |
| C111 | “retain the correct focus” — protect correct focus across the stated latest, answer-state, Retry and project-switching circumstances. | slice 6 |  |
| C112 | “source revision” — protect the correct source revision across those circumstances. | slice 6 |  |
| C113 | “target line” — protect the correct target line across those circumstances. | slice 6 |  |
| C114 | “reading place” — protect the correct reading place across those circumstances. | slice 6 |  |
| C115 | “without showing another project’s late answer” — exclude another project’s late answer throughout that journey. | slice 6 |  |
| C116 | “Open nested Gherkin … source” — include this source-opening alternative. | slice 7 |  |
| C117 | “or Java source” — include Java source as an alternative. | slice 7 |  |
| C118 | “or a recorded case” — include a recorded case as an alternative. | slice 7 |  |
| C119 | “then revisit Intent” — include revisiting Intent after the stated opening alternatives. | slice 7 |  |
| C120 | “or change its file column” — retain changing the file column as the alternative continuation. | slice 7 |  |
| C121 | “exact text” — protect exact text through those source-reading journeys. | slice 7 |  |
| C122 | “line numbers” — protect line numbers through those journeys. | slice 7 |  |
| C123 | “highlighting/fallback” — protect highlighting where applicable. | slice 7 |  |
| C124 | “highlighting/fallback” — protect fallback where applicable. | slice 7 |  |
| C125 | “selection” — protect selection through those journeys. | slice 7 |  |
| C126 | “keyboard reachability” — protect keyboard reachability through those journeys. | slice 7 |  |
| C127 | “reading position” — protect reading position through those journeys. | slice 7 |  |
| C128 | “Hidden/unreachable reads recover only at their existing retry conditions” — hidden reads retain their existing recovery conditions. | slice 2 | observed: slice-2-proof.md read-recovery hidden-page case: original no-retry-while-hidden and recovery-on-visible counts retained; all9 Frontend pass and renewed private-setup5 pass. |
| C129 | “Hidden/unreachable reads recover only at their existing retry conditions” — unreachable reads retain their existing recovery conditions. | slice 2 | observed: slice-2-proof.md recovery map/discrimination: original15/30/60/60 and exact request deltas/manual recovery retained; same15-to16 fault fails old/new count2vs1 and both restored pass; real E2E classified/directed recovery passed. |
| C130 | “malformed settings stay distinct from unconfigured settings” — preserve the distinction between these settings states. | slice 2 | observed: slice-2-proof.md settings map and real Backend locations[-problems]: malformed, unreadable and unconfigured explanations and negative content remain distinct; real parsing/refusal and Frontend cases pass. |
