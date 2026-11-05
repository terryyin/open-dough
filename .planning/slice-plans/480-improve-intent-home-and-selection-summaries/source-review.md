# Source review: Improve Intent home and selection summaries

**Launch:** 2026-11-05, a fresh general-purpose sub-agent (no conversation inheritance, fork or resume) launched by the execution coordinator.
**Input:** only the story text of `SEED-243#improve-intent-home-and-selection-summaries` from **Goal.** through **Scope limits and deferred promises** (seed lines extracted verbatim, sha256 `1323b3ffb95eef5fb220afeab7014e2d1b7add06f03817bdf3805ca0f74f8e7a`); no plan, return, product, proof or slice scope. Instructions: read only that text, change nothing, return numbered individual commitments, examples and exclusions.
**Reviewer notes:** clause 6.5 is kept as a stated boundary of clause 6; 2.6, E7.1 and E7.3 define how those actions behave rather than act as rejection rules. Exclusions are delivery boundaries, not rejection rules.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G1 | A developer reviewing product intent can compare entries and their CI proof in tables. | slice 3 | |
| G2 | The developer can drill into entry and folder summaries that include running time. | slice 3 | |
| G3 | The developer can return to Intent's CI status homepage by clicking the Intent tab again. | slice 2 | |
| 1.1 | Keep the Proof section. | slice 1 | observed: dashboard/tests/intentCiProofPage.ts proofOf region 'Proof' used by intent-ci-proof*.spec.ts |
| 1.2 | Keep the Proof section's existing CI wall time. | slice 1 | observed: dashboard/tests/intent-ci-status-execution-time.spec.ts 'complete entry durations…' expectProofRows + .intent-ci-wall-time: CI wall time 3 min. kept outside the table |
| 1.3 | Show the Intent entries currently listed beneath it as a table. | slice 1 | observed: dashboard/src/IntentCiProof.tsx ProofEntries → CiProofTable; intentCiProofPage.ts expectProofRows table 'CI proof by declared entry' |
| 1.4.1 | The table shows, in aligned columns, readable: each entry's name/path. | slice 1 | observed: expectProofRows rowheader per entry path (intent-ci-proof.spec.ts, execution-time spec) |
| 1.4.2 | The table shows, in aligned columns, readable: proof counts. | slice 1 | observed: expectProofRows Counts cell e.g. '12 passed tests' / '5 passed checks' |
| 1.4.3 | The table shows, in aligned columns, readable: test execution time. | slice 1 | observed: execution-time spec executionCells ['4 min','2 min'], not recorded, partial cells |
| 1.4.4 | The table shows, in aligned columns, readable: completeness or gaps. | slice 1 | observed: expectProofRows Parts cell e.g. '1 of 2 parts present; part 2 of 2 missing'; narrow/200% zoom test in intent-ci-proof.spec.ts |
| 2.1 | Remove the **Return to CI status** button when an entry/section, folder, or test file is selected. | slice 2 | |
| 2.2 | Clicking the **Intent** reading tab again clears any selected entry, folder, or file and shows CI status, which is Intent's homepage. | slice 2 | |
| 2.3 | This also works when Intent is already the active tab. | slice 2 | |
| 2.4 | Clearing the browsing selection does not clear the selected story that determines which branch's CI status is shown. | slice 2 | |
| 2.5 | Direct keyboard activation with Enter or Space has the same effect as clicking (alternatives: click, Enter, or Space). | slice 2 | |
| 2.6 | Arrow/Home/End tab navigation keeps its existing reading restoration. It is not a home activation. | slice 2 | |
| 2.7 | Opening a child or an Optimization Candidates target is navigation to that target, not a home activation. | slice 2 | |
| 3.1 | Selecting an Intent entry (the configured location or section) shows its overall/root summary. | slice 3 | |
| 3.2 | That summary includes running time. | slice 3 | |
| 3.3 | That summary is in the same style as the CI homepage's summaries. | slice 3 | |
| 3.4 | Also show a table of summaries for the entry's immediate subfolders, so the developer can compare them and drill down. | slice 3 | |
| 3.5 | Files directly in the entry remain visible and selectable. | slice 3 | |
| 4.1 | Selecting a folder shows that folder's summary, including running time. | slice 3 | |
| 4.2 | Also show a similar table with one summary row for every immediate child file and folder. | slice 3 | |
| 4.3 | A child folder's row summarizes that folder's contents. | slice 3 | |
| 4.4 | Deeper descendants appear after drilling into the child folder, rather than flattening the whole subtree into this table. | slice 3 | |
| 5.1 | These summaries use the CI homepage's proof vocabulary. | slice 3 | |
| 5.2 | These summaries use the CI homepage's timing semantics. | slice 3 | |
| 5.3 | Keep the run's CI wall time distinct from cumulative test execution time. | slice 3 | |
| 5.4 | Identify unavailable or partial proof and timing, rather than treating missing evidence as zero or as complete. | slice 3 | |
| 5.5 | Entry and folder rows must describe the selected scope. | slice 3 | |
| 5.6 | Entry and folder rows must name the CI evidence they summarize. | slice 3 | |
| 6.1 | Preserve the homepage's existing entry totals, including checks outside the configured browsable inventory. | slice 3 | |
| 6.2 | Explain the contribution not represented by child rows, instead of implying those rows reconcile the total. | slice 3 | |
| 6.3 | Folder summaries aggregate CI evidence by the selected folder's path. | slice 3 | |
| 6.4 | In folder summaries, distinguish evidence outside the visible inventory too. | slice 3 | |
| 6.5 | This changes neither the tree's include patterns nor what a runner counts. | slice 3 | |
| 7.1 | Child names in summary tables select the corresponding folder or file. | slice 3 | |
| 7.2 | The existing tree navigation and file reading are kept. | slice 3 | |
| E1.1 | Open Intent with nothing selected: CI status is the homepage. | slice 1 | observed: intent-ci-proof.spec.ts and intent-ci-status-homepage.spec.ts open Intent with nothing selected and see CI status |
| E1.2 | Its Proof section still shows CI wall time. | slice 1 | observed: dashboard/tests/intent-ci-status-execution-time.spec.ts 'complete entry durations…' expectProofRows + .intent-ci-wall-time |
| E1.3 | Several Intent entries appear as table rows with comparable counts, execution time, and proof completeness. | slice 1 | observed: dashboard/tests/intent-ci-status-execution-time.spec.ts 'complete entry durations…' expectProofRows + .intent-ci-wall-time: two entry rows with counts, time and parts |
| E2.1 | Select an entry such as `dashboard/tests`: its overall summary includes running time. | slice 3 | |
| E2.2 | Its immediate subfolder summaries appear in a table. | slice 3 | |
| E2.3 | Files directly in `dashboard/tests` can still be opened. | slice 3 | |
| E3.1 | Select a folder containing two files and a nested folder: its own summary includes running time. | slice 3 | |
| E3.2 | The table lists those three immediate children with their summaries. | slice 3 | |
| E3.3 | Selecting the nested folder shows its own immediate children. | slice 3 | |
| E3.4 | Selecting a file opens that file's reading. | slice 3 | |
| E4.1 | With an entry, a nested folder, or a test file selected, there is no **Return to CI status** button. | slice 2 | |
| E4.2 | Click the already-active **Intent** tab: the browsing selection clears and the CI status homepage returns. | slice 2 | |
| E4.3 | A selected story continues to determine the judged branch. | slice 2 | |
| E5.1 | A folder has no recorded timing, or some of its CI evidence is missing: its summary explains that absence or incompleteness consistently with the homepage. | slice 3 | |
| E5.2 | It shows no invented zero and no complete result. | slice 3 | |
| E6.1 | Setup: the CI `tests` entry contains a root shell check and a nested `tests/support` check, while the configured tree lists only root `.sh` files. Select `tests`: its overall counts keep both checks. | slice 3 | |
| E6.2 | Its table lists the browsable children. | slice 3 | |
| E6.3 | It explains the contribution outside that inventory. | slice 3 | |
| E6.4 | A legacy summary with no file breakdown keeps its entry totals. | slice 3 | |
| E6.5 | That legacy summary labels the child breakdown unavailable. | slice 3 | |
| E7.1 | Read a file, switch to Optimization Candidates, and use arrow keys to return to Intent: the file remains selected. | slice 2 | |
| E7.2 | Directly activate Intent with Enter or Space: home appears. | slice 2 | |
| E7.3 | Opening a candidate's file target selects that file rather than clearing it. | slice 2 | |
| E7.4 | A background revision observation follows SEED-241's reading rules, not the home action. | slice 2 | |
| E8.1 | Setup: the named CI evidence is an ancestor run, or belongs to the selected story branch, while the browser reads a different published revision. Select a folder: counts and time identify that evidence. | slice 3 | |
| E8.2 | They do not imply that a newly added path has already passed. | slice 3 | |
| E8.3 | A measured zero remains zero. | slice 3 | |
| E8.4 | Missing durations leave any available subtotal partial. | slice 3 | |
| X1 | Exclusion (delivery boundary, not a rejection rule): historical before/after timing comparisons are not undertaken; SEED-244 owns historical story timing comparisons. | slice 3 | |
| X2 | Exclusion: sorting or filtering tables is not undertaken. | slice 3 | |
| X3 | Exclusion: a new proof runner is not undertaken. | slice 3 | |
| X4 | Exclusion: local proof generation is not undertaken. | slice 3 | |
| X5 | Exclusion: changing file reading into a CI case-detail view is not undertaken. | slice 3 | |
