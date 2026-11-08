# Source-only review

The fresh Codex reviewer `source_review_543` received only the correction's
amended Goal and Scope and the developer's instruction to amend plan 543,
preserve the final report admission assertions, refresh readiness and execute.
It had no inherited conversation and was instructed to read no project files.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | The dashboard tests use one machine launch store vocabulary, with one name per operation. | slice 2 | observed: launchStore.ts owns the whole-store and project-record reads, exact-text write and file path; all 36 traced specs passed. |
| 2 | Harness writes of the machine launch store go through one harness owner. | slice 2 | observed: Launch-store writes use keepLaunchStore, keepLaunchRecords or keepLaunchStoreText in the owning harness; the records and replacement specs exercised typed and exact text writes. |
| 3 | Harness reads of the machine launch store go through that same owner. Tests reading the kept store back use the owner. | slice 2 | observed: keptLaunchStore and keptLaunchRecords in launchStore.ts supply the parsed reads; the focused restore, delete and completion specs observed kept records after dashboard operations. |
| 4 | Kept-store reads exclude test-side construction of the store file path. | slice 2 | observed: All traced in-scope path consumers use launchStoreFile; the two literal filenames in host identity and project removal are independently asserted directory contents. |
| 5 | Remove the forwarders that give the machine launch store a second vocabulary. | slice 2 | observed: machineLaunchRecords.ts retains home and clock fixtures; dashboard typecheck and reference search found no callers of storeFile, seedStore or storedRecords. |
| 6 | Exact store text stays explicit at the call site. | slice 2 | observed: agent-launch-records and project removal keep independent exact-byte assertions; explicit text setup uses keepLaunchStoreText. |
| 7 | Malformed store text stays explicit at the call site. | slice 2 | observed: agent-launch-records, records-replaced and creation-gates keep malformed bytes at the call site and check preservation or quarantine. |
| 8 | Legacy store text stays explicit at the call site. | slice 2 | observed: agent-completion-binding preserves the explicit legacy record and observes the same quiet completion and done time. |
| 9 | Sibling stories’ helpers retain their own setup. | slice 2 | observed: codexLaunch, cursorStart, cursorSessionRecovery, completionRecovery, keptCursorTurn and fake Cursor setup are unchanged; converted indirect consumers ran in the same proof selection. |
| 10 | The terminal header portrait case keeps a launch the dashboard can record. The record belongs to the story and names its agent. A story execution record is one permitted journey example. | slice 1 | observed: agent-terminal-avatar.spec.ts, stanly and ruuf execution steps keep the story, agent and original Claude session; attached terminal shows execution rows and the expected cartoon or its absence. |
| 11 | A story refinement record naming its agent is the other permitted terminal header portrait journey example. The source says execution or refinement. | slice 1 | observed: agent-terminal-avatar.spec.ts, Yui refinement step keeps a refinement of the Taken story, attaches its Claude session, and observes Yui’s atlas tile and the refinement rows. |
| 12 | Exclude an ad hoc record given a story’s start in the portrait case. | slice 1 | observed: agent-terminal-avatar.spec.ts, both start steps use the executing builder. The separate ad hoc step keeps no agent or story start and observes no portrait. |
| 13 | Exclude an ad hoc record given a story’s preparation in the portrait case. | slice 1 | observed: agent-terminal-avatar.spec.ts, the Yui preparation uses the refining builder. The separate ad hoc step observes its original rows and no portrait. |
| 14 | Final report admission keeps a coherent dashboard-recordable Claude launch record built through MakeMe. | slice 3 | observed: final-report-admission, separate Claude MakeMe launch with saved report and no workspace yields the original unsupported-reader 400. |
| 15 | Final report admission keeps a coherent dashboard-recordable Cursor launch record built through MakeMe. | slice 3 | observed: final-report-admission, four Cursor MakeMe launches with their own session IDs and continuation workspace observe available, empty, absent and closure-evidence outcomes. |
| 16 | Preserve the wrong-host request. | slice 3 | observed: Final-report admission uses the identical Claude request with the native Codex thread ID and observes 404. |
| 17 | Preserve all existing admission assertions. | slice 3 | observed: The byte-identical request and assertion block checks the same project, session, endpoint, method and origin statuses in the passing spec. |
| 18 | Preserve all existing report assertions. | slice 3 | observed: The byte-identical assertion block checks Claude’s unsupported message and each Cursor saved-report response. |
| 19 | Preserve all existing closure-evidence assertions. | slice 3 | observed: The unchanged Cursor closure response assertion expects productClosureEvidence: true after the existing tracked-closure setup. |
| 20 | Preserve all existing native-read assertions. | slice 3 | observed: The unchanged native call count checks and final successful Codex response were exercised by the full admission spec. |
| 21 | Assertions continue catching the same failures. | slice 3 | observed: All existing final-report request and assertion bytes match the published base. The avatar checks preserve their original attachment, portrait and layout checks with coherent row labels, and the store selection passed with the same assertions. |
| 22 | Product behavior stays the same. | slice 3 | observed: The aggregate execution diff touches only dashboard test code and planning evidence. Focused tests and typecheck passed for all three slices. |
| 23 | Explicit amendment directs amendment of plan 543 to include MakeMe fixture cleanup in final-report-admission.spec.ts. | slice 3 | observed: The preparation on main at 3a72f075b added slice 3 and the matching correction scope for final-report-admission. |
| 24 | Explicit amendment preserves the existing assertions during that cleanup. | slice 3 | observed: The spec suffix from the native call snapshot to the end was compared with the published base and is byte-for-byte identical. |
| 25 | Explicit amendment directs refreshing readiness after the plan amendment. | slice 3 | observed: The canonical correction state in the preparation commit 3a72f075b recorded ready on the amended story and plan digests. |
| 26 | Explicit amendment directs executing the plan. | slice 3 | observed: The original two slices were delivered on the story branch, and the added slice passed its full admission spec and dashboard typecheck. |
