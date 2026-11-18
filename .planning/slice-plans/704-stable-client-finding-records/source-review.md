# Source review

Launch: a fresh general-purpose reviewer without conversation inheritance, at
execution start on 2026-11-18. Input: only the seed story's heading, Goal, Scope,
Key examples and Historical evidence (commit links elided) from
`SEED-402#keep-client-finding-evidence-and-ids-stable`. Instructions: use only that
text, read no files, change nothing, number independently observable promises.

Unnumbered context returned: goal reasons (one copy saves duplicate editing;
stable numbers make older references trustworthy); SEED-401 pilots own admission;
historical logs are examples and are not rewritten; recreation applies when a
supported finding needs a missing log; the Pygardon 262-line cleanups and the
three Terry Talks `DD-001` findings are the settled baseline.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A verified duplicate becomes one revision-pinned link that recovers the original: "replace duplicated narrative with one revision-pinned link after verifying that the committed destination contains the same project's execution, observation, provenance and qualifications"; "Following it recovers the original account." | slice 1 | observed: retention-and-watch.md#link-a-verified-shared-account steps 1-3; independent walk (evidence slice1-independent-walk.md) pinned accepted 671ab12 not pre-rebase af96010; slice1-walk.log RECOVERED == INPUT (8 lines) |
| 2 | The source finding keeps its ID and former aliases after collection: "Keep the source finding ID, former aliases"; "The client entry retains its identity" | slice 1 | observed: retention-and-watch.md#link-a-verified-shared-account step 3; independent walk kept ## ODF-153 heading and Former local code: DD-393. |
| 3 | Each execution stays identifiable when a later execution reports the same symptom: "execution identity"; "each distinct execution can still be identified." | slice 1 | observed: retention-and-watch.md#link-a-verified-shared-account step 2; independent walk kept DD-900 (other execution) intact and SEED-20261065 execution line in linked entry |
| 4 | Only the verified duplicate portion becomes a link; project-specific effects and working local links stay: "Only the verified duplicate portion becomes a link. The local effect and links remain" | slice 1 | observed: retention-and-watch.md#link-a-verified-shared-account step 3; independent walk kept Project effect line with .planning/ibkr.md link |
| 5 | Evidence whose destination cannot be verified stays intact: "An unreadable or mismatched destination leaves the affected source evidence intact." | slice 1 | observed: retention-and-watch.md#link-a-verified-shared-account step 4; independent walk kept DD-901 (missing ODF-999) and DD-902 (partial ODF-141) intact |
| 6 | Collecting the same input a second time changes nothing: "The second pass leaves the finding files byte-identical." | slice 1 | observed: retention-and-watch.md#link-a-verified-shared-account closing rule; independent walk round 2 sha256 identical for source and catalog files, pyg clean |
| 7 | A first finding in a project with no earlier log is numbered `DD-001`. | slice 2 | observed: process-finding-recording.md missing-log recovery first-use bullet; independent walk (evidence slice2-report.md), fixture a/DearDough.md heading DD-001 |
| 8 | A recreated log continues from the recovered high-water mark, for the next allocation and every later one: "a different finding gets `DD-008` … Subsequent allocations still respect the recovered high-water mark." | slice 2 | observed: process-finding-recording.md missing-log recovery recreation bullet and next-number rule; independent walk (evidence slice2-report.md), fixture b1 DD-008 high-water 8; b2 ODF-003 recurrence then DD-008, high-water 8 |
| 9 | A verified recurrence after recreation keeps its established DD or adopted ODF identity and any former alias. | slice 2 | observed: process-finding-recording.md missing-log recovery matching rule; independent walk (evidence slice2-report.md), fixture b2 keeps ODF-003 heading and Former local code: DD-002. |
| 10 | When history cannot establish a safe allocation, the finding is left unallocated. | slice 2 | observed: process-finding-recording.md missing-log recovery shallow bullet; independent walk (evidence slice2-report.md), fixture c depth-one clone: not recorded, DearDough.md absent |
| 11 | In that same case, the recorder names the missing evidence. | slice 2 | observed: process-finding-recording.md missing-log recovery shallow bullet; independent walk (evidence slice2-report.md), fixture c names full history of DearDough.md and former paths |
| 12 | Older references that share a number can still be told apart by revision: "Keep historical collisions distinguishable by revision." | slice 2 | observed: process-finding-recording.md missing-log recovery revision citation rule; evidence slice2-terrytalks.txt: three distinct DD-001 at 276b222da, 33bb07f5a, fc30efe10; walker cited 9f2b126:DearDough.md ODF-003 |
