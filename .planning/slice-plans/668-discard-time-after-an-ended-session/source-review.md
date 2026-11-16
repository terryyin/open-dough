# Source-only review

Launch: fresh general-purpose agent `/root/source_review`, `fork_turns: none`.
Input: only SEED-367#discard-time-after-an-ended-session's original Goal,
Scope, exclusions and all four key examples, transcribed in the launch message.
No plan, implementation, proof, suspected omission or slice scope supplied.
Reviewer instructed to read no files and change nothing. The numbered return
below preserves its qualified source commitments; allocation and observations
belong to the coordinator.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Record each start command’s time in the checkout. Source: “records the time of every clock command in the checkout: start”. | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-ended-session.test.mjs: start timestamp assertion |
| 2 | Record each pause command’s time in the checkout. Source: the same recording requirement includes “pause”. | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-ended-session.test.mjs: pause timestamp assertion |
| 3 | Record each status command’s time in the checkout. Source: the same recording requirement includes “status”. | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-ended-session.test.mjs: status timestamp assertion |
| 4 | Record each run’s start time in the checkout. Source: “the start … of each run”. | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-ended-session.test.mjs: dead-run start timestamp assertion |
| 5 | Record each run’s end time in the checkout. Source: “the … end of each run”. | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-ended-session-compatibility.test.mjs: run completion timestamp assertion |
| 6 | Allow a coordinator to identify a new session through a start option. Source: “A coordinator starting in a new session names that with a start option.” The option’s spelling is unspecified. | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-ended-session.test.mjs: new-session same-slice start |
| 7 | With that option and a running slice, end its open period at the last clock command. Source: “its open period ends at the last clock command”. Examples qualify that boundary as 10:00 after the last status, or 10:02 after the focused-suite run starts. | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-ended-session.test.mjs: period ends at 10:00 and restarts 14:00 |
| 8 | If the ended session left a run open, end that run at the same boundary. Source: “a run the ended session left open ends there too”. The open-run example requires the run to end at 10:02. | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-ended-session.test.mjs: SIGKILL run ends at 10:02 |
| 9 | When the named slice is the running slice, resume it from the current time. Source: “The named slice then starts or resumes from now”; the examples restart slice 3 at 14:00. | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-ended-session.test.mjs: resumed status counts later three minutes |
| 10 | When another slice is named, leave the previously running slice paused. Source: “slice 3 is paused at 9 minutes”. | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-ended-session.test.mjs: different-slice prior report paused at nine |
| 11 | Start the different named slice without requiring a preceding pause. Source: “a new coordinator can start a different slice without a pause”; the example requires “slice 4 starts at zero”. | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-ended-session.test.mjs: different slice starts at zero without pause |
| 12 | When nothing is running, the option has the same effect as a plain start. Source: “When nothing is running, the option changes nothing.” The paused-slice example qualifies this: slice 3 “resumes exactly as a plain start does”. | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-ended-session.test.mjs: nothing-running initial and paused start examples |
| 13 | Without the option, continue refusing a start of another slice while a slice runs. Source: “Without the option the same start is still refused while slice 3 runs.” | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-ended-session.test.mjs: plain start refused while another slice runs |
| 14 | The resume guidance in “continue or recover at an execution boundary” instructs a coordinator in a new session to start with the option. Source: “The resume guidance in continue or recover at an execution boundary … tells a coordinator in a new session to start with the option.” | slice 2 | observed: Distribution/src/skills/dough-execute-plan/SKILL.md: Continue or recover new coordinator first-start instruction; same/different/paused behavior walkthrough |
| 15 | The resume guidance in “track active time” gives that instruction too. Source: the same guidance requirement explicitly includes “track active time”. | slice 2 | observed: Distribution/src/skills/dough-execute-plan/references/oversized-slice.md: Track active time new-session start and settlement instruction; same/different/paused behavior walkthrough |
| 16 | Preserve existing pause behavior when execution stops for either the coordinator or a human. Source: “Pausing when execution stops for the coordinator or a human keeps its current behavior.” | slice 2 | observed: Distribution/src/skills/dough-execute-plan/references/oversized-slice.md: unchanged pause bullet covers coordinator/human stops and CI repair; slice-clock.test.mjs paused-time assertions |
| 17 | Elapsed-time reporting retains settled active time, excludes the ended-session gap, and counts subsequent active time. Source: the goal gives the developer the slice’s “active time back without the idle gap”. Qualified examples require 9 elapsed after the 10:00–14:00 gap, and 11 elapsed at 14:03 when the earlier open period and run end at 10:02. | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-ended-session.test.mjs: same-slice nine elapsed and dead-run eleven elapsed |
| 18 | Remaining-time reporting reflects that elapsed time. Source examples require “6 remaining” with 9 elapsed, and “4 remaining” with 11 elapsed. | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-ended-session.test.mjs: six remaining and dead-run four remaining |
| 19 | Do not report an overrun caused only by the ended-session gap. Source: “the slice limit reports no overrun that did not happen”; the 9-minute example explicitly requires “no overrun”. | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-ended-session.test.mjs: withinLimit assertions report no idle-gap overrun |
| 20 | Continue reporting an overrun when settled time reaches the limit. Source: “A slice settled at the limit is reported as an overrun as before”; “its report now counts only the settled time”. | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-ended-session-compatibility.test.mjs: settled limit status reports fifteen and one overrun |

Unnumbered reviewer context: The motivating condition is an execution session
ending during a slice. Automatic session-end detection, counting work after the
last clock command, host-hook tool-call recording, changing the limit, and
changing what counts as active time are excluded. Settlement may therefore
undercount work performed after the last clock command.
