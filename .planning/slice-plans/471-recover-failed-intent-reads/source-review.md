# Independent source review

The fresh Codex agent `/root/source` ran without inherited conversation on
2026-11-05. The launch supplied only the selected story's
[Goal, Scope, and Key examples](../../seeds/SEED-192-review-product-intent.md#recover-failed-intent-reads),
including the scope exclusions, and no human amendments. It was instructed
to read no files, change nothing, and extract numbered source commitments
without assigning ownership or judging acceptance. The source text in that
launch and the numbered return are also retained in the execution conversation.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Intent shows published locations again after an eligible read failure passes, without manual Retry. | slice 2 | |
| 2 | Intent shows Test Optimization Candidates again after an eligible read failure passes, without manual Retry. | slice 3 | |
| 3 | A failed eligible locations read is repeated in place. | slice 2 | |
| 4 | A failed eligible Test Optimization Candidates read is repeated in place. | slice 3 | |
| 5 | Automatic rereads use the existing recovery schedule. | slice 2 | |
| 6 | The work adds no second timer. | slice 3 | |
| 7 | A scheduled reread runs when recovery is due and the page is visible. | slice 2 | |
| 8 | The first recovery wait is 15 seconds. | slice 2 | |
| 9 | The next wait after another eligible failure is 30 seconds. | slice 2 | |
| 10 | The following wait is 60 seconds. | slice 2 | |
| 11 | Further waits stay at 60 seconds while eligible failures continue. | slice 2 | |
| 12 | Recovery makes no request while the page is hidden. | slice 2 | |
| 13 | If recovery comes due while the page is hidden, it asks once when the page becomes visible again. | slice 2 | |
| 14 | A recovered answer replaces the displayed problem as a successful Retry answer would. | slice 3 | |
| 15 | Manual Retry remains available. | slice 2 | |
| 16 | Manual Retry keeps its current behavior. | slice 3 | |
| 17 | An unreachable local boundary qualifies. | slice 2 | |
| 18 | A GitHub rate limit qualifies. | slice 2 | |
| 19 | A rate-limited read waits until the standing limit ends before it is repeated. | slice 3 | |
| 20 | The recovery backoff cannot shorten the standing rate-limit wait. | slice 3 | |
| 21 | A failure the boundary classifies as transient qualifies. | slice 3 | |
| 22 | Intent settings failures qualify through that rule once the boundary carries the transient classification on those answers. | slice 3 | |
| 23 | Intent location-listing failures qualify through that rule once the boundary carries the transient classification on those answers. | slice 3 | |
| 24 | Test Optimization Candidates failures qualify through that rule once the boundary carries the transient classification on those answers. | slice 3 | |
| 25 | Malformed settings remain outside automatic recovery and wait for Retry. | slice 2 | |
| 26 | Malformed records remain outside automatic recovery and wait for Retry. | slice 3 | |
| 27 | Absent records remain outside automatic recovery and wait for Retry. | slice 3 | |
| 28 | Access refusal remains outside automatic recovery and waits for Retry. | slice 3 | |
| 29 | Unexpected answer shapes remain outside automatic recovery and wait for Retry. | slice 3 | |
| 30 | Failures the boundary does not mark transient remain outside automatic recovery under the source’s stated exclusion rule. The source also expressly lists unreachable-boundary and rate-limit failures as eligible. | slice 3 | |
| 31 | Published-work recovery from an unreachable boundary is deferred. A shared classification may extend it naturally, provided the existing published-work recovery proof still holds. | slice 2 | |
| 32 | Automatic recovery for Intent proof reads is deferred. Those reads keep Retry. | slice 3 | |
| 33 | Automatic recovery for Purpose file-text reads is deferred. Those reads keep Retry. | slice 3 | |
| 34 | A notice saying when Intent reads again is deferred. The source neither promises nor rules it out. | slice 3 | |
| 35 | A production dashboard restart interrupts a Doughnut locations read by making the local boundary unreachable. | slice 2 | |
| 36 | The interrupted locations read first displays a problem with Retry. | slice 2 | |
| 37 | On a visible page, the locations are reread about 15 seconds later. | slice 2 | |
| 38 | The locations browser appears without the developer pressing Retry. | slice 2 | |
| 39 | With the Optimization Candidates tab open, the boundary reports the record as unreadable because `gh` timed out. | slice 3 | |
| 40 | The candidates record is reread after the due wait. | slice 3 | |
| 41 | The Pending group appears after recovery. | slice 3 | |
| 42 | The Accepted group appears after recovery. | slice 3 | |
| 43 | If the boundary remains unreachable at the second attempt, the next wait is 30 seconds, followed by 60-second waits. | slice 2 | |
| 44 | A page hidden when recovery comes due makes no request until it is seen again, when it makes one request. | slice 2 | |
| 45 | If `.planning/open-dough.json` is malformed at the revision, the settings problem stays visible and no reread occurs until Retry. | slice 2 | |
| 46 | A rate-limited candidates read resumes after the standing limit ends, even if the backoff would expire sooner. | slice 3 | |
| 47 | With the backlog snapshot fully shown, its revision checks keep their steady pace while an eligible Intent locations failure awaits recovery. | slice 2 | |
