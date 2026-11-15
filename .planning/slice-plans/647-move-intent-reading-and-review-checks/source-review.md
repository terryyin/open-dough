# Source-only review

Reviewer launch: `collaboration.spawn_agent`, task `/root/source_review`,
`fork_turns: none`; fresh agent instructed to use only the supplied original
Goal, Scope, Scope limits and four Key examples, read no project files and
change nothing. The actual launch/input and full returned three-column table
are retained in this execution conversation. Input is the unchanged selected
story at `f8c4841a47719925236f78ff220efe9b0795e4f5`,
`.planning/seeds/SEED-334-product-wide-end-to-end-tests.md#move-intent-reading-and-review-checks`;
no plan, product, proof, suspected omission or slice scope was supplied.
A follow-up requested a concise independently inspectable return; no source
amendment was supplied. The reviewer returned C01–C42. The table retains
commitments and their qualifications together; slice allocation is the
coordinator’s subsequent work.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | Convert the specified 37 remaining Intent specs. “37 remaining non-CI Intent specs mapped in plan 647,” explicitly including `intent-ci-done-glance` and `intent-ci-done-reference-lifecycle`; their Done reading promises belong here despite their filenames. | slice 8 |  |
| C02 | Keep controlled-answer interaction and rendering proof at Frontend. “actual rendering, keyboard, focus, source/case selection and reading position.” These are facets of the stated Frontend boundary. | slice 8 |  |
| C03 | Keep real source judgment at Backend or representative E2E boundaries. “Keep real source judgment … at Backend or representative E2E boundaries.” The source permits either boundary. | slice 8 |  |
| C04 | Keep real historical/live answer selection at Backend or representative E2E boundaries, followed by browser rendering of that answer. “historical/live review selection”; example 2: “the correct historical/live answer is selected for real, then the browser renders it.” | slice 5 |  |
| C05 | Keep HTTP refusal proof at Backend or representative E2E boundaries. “HTTP refusals.” No particular status or refusal scenario is specified. | slice 2 |  |
| C06 | Keep acquisition proof at Backend or representative E2E boundaries. “acquisition.” No additional acquisition behavior is supplied. | slice 8 |  |
| C07 | Keep GitHub request-count proof at Backend or representative E2E boundaries. “GitHub request counts.” | slice 8 |  |
| C08 | Keep SSE connection proof at Backend or representative E2E boundaries. “SSE connections.” | slice 6 |  |
| C09 | Split mixed cases according to their assertions, retaining negative effects. “Split mixed cases by their assertions, including negative effects.” File movement alone does not decide ownership. | slice 8 |  |
| C10 | Preserve selected-story changes, gaps, coverage and appearance. “Preserve selected-story changes/gaps, coverage, appearance”; example 1: a Taken story’s Summary and Purpose show the same changes after browsing folders and opening a changed test. | slice 4 |  |
| C11 | Preserve Review return to the reading position and header focus. “Review return”; example 1 opens and closes Review by keyboard, and closing restores “the reading and header focus.” | slice 4 |  |
| C12 | Preserve isolation between Done historical, live and captured review contexts. “Done historical versus live/captured review modes”; example 2 switches to another Done story **or** ordinary live Review while an answer is held: the old context’s source and captured run do not leak. | slice 5 |  |
| C13 | Preserve the Done reading context across project refresh. Example 2 preserves “the Done file, endpoints, Purpose/Proof choice and reading place.” These are the stated persistence facets. | slice 5 |  |
| C14 | Show one revision notice while retaining the displayed revision. “revision notices”; example 3: with a source case selected, a newer revision produces “one notice” that “retains the shown revision.” | slice 6 |  |
| C15 | Preserve the correct reading state through update and recovery actions. “held/failed/latest updates”; example 3 covers Show latest, held/failed locations **or** file answers, Retry, and project switching, retaining focus, source revision, target line and reading place. These remain alternative journey branches. | slice 6 |  |
| C16 | Exclude stale answers from the displayed context. “stale-answer exclusion”; example 3 specifically excludes another project’s late answer. Example 2 additionally supplies old-story/mode isolation under C12. | slice 6 |  |
| C17 | Preserve nested source and Purpose reading, including source-case fidelity and interaction. “nested source/Gherkin/Java/Purpose reading”; example 4 uses nested Gherkin **or** Java source **or** a recorded case, followed by revisiting Intent **or** changing its file column. Exact text, line numbers, highlighting/fallback, selection, keyboard reachability and reading position remain protected. | slice 7 |  |
| C18 | Preserve activation behavior. “activation.” The original input supplies no narrower activation example. | slice 7 |  |
| C19 | Preserve reuse behavior. “reuse.” The original input supplies no narrower reuse example. | slice 8 |  |
| C20 | Preserve recovery at its existing retry conditions. “recovery”; example 4: hidden/unreachable reads recover “only at their existing retry conditions.” This does not introduce new retry triggers. | slice 2 |  |
| C21 | Keep malformed settings distinct from unconfigured settings. Example 4: “malformed settings stay distinct from unconfigured settings.” | slice 2 |  |
| C22 | Browsing locations and nested folders asks for no text. Example 1: “browsing asks for no text,” in the Taken-story browsing journey. | slice 8 |  |
| C23 | Read the diff once in the example’s browsing/Review journey. Example 1: “the diff is read once.” This is a request-count promise for that journey, not a speed claim. | slice 8 |  |
| C24 | Preserve the diff-reading journey without published text. Example 1: “without published text.” The source does not elaborate a new publication rule. | slice 8 |  |
| C25 | Account for every distinct original assertion before deleting its case. “Before removing each original case,” account for assertions in “named maintained cases,” including applicable existing proof. Existing proof can contribute; every replacement need not be newly written. | slice 8 |  |
| C26 | Demonstrate preservation with the same representative scratch break across a changed boundary. “failing before and after a changed proof boundary, with restored passes.” The break is representative; the source does not demand a separate break for every assertion or combination. | slice 1 | observed: slice-1-proof.md#scratch-discrimination: preparation old-side baseline/fault/restored at 4df4b24298cf313bdbac952a5edd6421345f6f21; maintained Purpose fault failed expectSourceTargetLine expected1 got0, proper restored pass; production diff empty |
| C27 | Do not treat movement or equal case counts as preservation evidence. “A move or an equal case count alone is not preservation evidence.” Every distinct assertion must remain useful. | slice 8 |  |
| C28 | Limit deletion to converted specs and their interim duration rows. “Remove only converted specs and their interim duration rows.” This does not authorize broader cleanup. | slice 8 |  |
| C29 | Keep shared support and remaining runner consumers usable. “Keep shared support and remaining runner consumers usable.” | slice 8 |  |
| C30 | Reach the joint end state with no product specs in `dashboard/tests/intent/`. “After this and the CI conversion both land.” This is conditional on both conversions; it does not require deleting shared support or the directory itself. | slice 8 |  |
| C31 | Keep navigation running in Dashboard Integrated UI Test; defer its conversion. “navigation still runs in Dashboard Integrated UI Test”; “Navigation conversion … belong[s] to the next story.” | slice 8 |  |
| C32 | Defer runner retirement to the next story. “runner retirement belong[s] to the next story.” | slice 8 |  |
| C33 | Leave Intent CI conversion in plan 633. “Intent CI conversion remains in plan 633.” C01’s explicitly included Done-reading specs are the stated filename exception. | slice 8 |  |
| C34 | Make no product behavior change. “No product behavior change.” Preservation examples describe existing promises. | slice 8 |  |
| C35 | Introduce no new tier. “No … new tier.” | slice 8 |  |
| C36 | Perform no E2E rename. “No … E2E rename.” | slice 8 |  |
| C37 | Add no tagged-install proof requirement. “No … tagged-install proof.” | slice 8 |  |
| C38 | Adopt no timing target. “No … timing … target.” | slice 8 |  |
| C39 | Adopt no shard target. “No … shard target.” | slice 8 |  |
| C40 | Claim no speed improvement without measurement. “The gain is clearer proof ownership; no speed improvement is claimed without measurement.” This supplies no speed-improvement requirement. | slice 8 |  |
| C41 | Allow conversion to start independently. “Conversion can start independently”; “Shared support alone is no start dependency.” This does not erase dependencies that particular later work actually needs. | slice 1 | observed: Established start and slice1 execution at f8c4841a47719925236f78ff220efe9b0795e4f5 while CI sibling remains Taken: existing controlled source/location/candidate answers reused; minimal explicit CI rendering answers do not duplicate acquisition |
| C42 | Reuse CI answer families when delivered instead of creating parallel families. “reuse CI answer families when delivered rather than creating parallel ones.” Delivery is the reuse trigger, not a prerequisite for starting the conversion. | slice 8 |  |
