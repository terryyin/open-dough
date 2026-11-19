# Source review

Fresh reviewer `/root/source_review` received the correction story's Goal and
Scope verbatim at the Take, with no inherited conversation, plan, or proof,
and was asked to read no files and derive independently observable promises.
[Reviewer input](../../seeds/SEED-346-native-ab-comparisons.md#close-native-comparison-harness-gaps).

C is the Goal's “arm-owned processes stopped” and the Scope's “both the services
a case started and the arm’s host session” “when a started arm ends before its
normal end,” including all three early-end examples.

H is the Goal's “host selection that names only qualified hosts” and Scope's
“make catalog host selection match qualified hosts only.” The source leaves the
number of matches and behavior when no host qualifies unspecified.

T is the Goal's “per-turn command and harness facts the runner records once for
every case” and the Scope's two facts, `unknown` when unavailable from the
turn's stream, and runner ownership “instead of each case.” Each turn outcome
inherits the once-per-turn, every-case and runner-ownership qualifications.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P01 | When a started arm ends early because materialization fails, the services a case started are stopped (C, failed materialization). | slice 1 | observed: Distribution/evaluation/tests/native-guidance-checks/native-guidance-check-cleanup.sh: failed-materialization asserts one cleanup observation and that the case service PID is gone |
| P02 | Under the same condition, the arm’s host session is stopped (C, failed materialization). | slice 1 | observed: Distribution/evaluation/tests/native-guidance-checks/native-guidance-check-cleanup.sh: failed-materialization asserts no host start marker and no retained attempt |
| P03 | When a started arm ends early because a case refuses its host route, the services a case started are stopped (C, host-route refusal). | slice 1 | observed: Distribution/evaluation/tests/native-guidance-checks/native-guidance-check-cleanup.sh: refused-route asserts one cleanup observation and that the case service PID is gone |
| P04 | Under the same condition, the arm’s host session is stopped (C, host-route refusal). | slice 1 | observed: Distribution/evaluation/tests/native-guidance-checks/native-guidance-check-cleanup.sh: refused-route asserts no host start marker and no retained attempt |
| P05 | When an interruption ends a started arm early, the services a case started are stopped (C, interrupted run). | slice 1 | observed: Distribution/evaluation/tests/native-guidance-checks/native-guidance-check-cleanup.sh: pair and single terminal INT and targeted single TERM all assert cleaned services and the entry signal status |
| P06 | Under the same condition, the arm’s host session is stopped (C, interrupted run). | slice 1 | observed: Distribution/evaluation/tests/native-guidance-checks/native-guidance-check-cleanup.sh: each interrupted host is gone before case cleanup and records its workspace present at exit, with no later event or assessment |
| P07 | Catalog host selection matches qualified hosts (H). | slice 2 | observed: Distribution/evaluation/tests/native-guidance-checks/native-guidance-check.sh asserts positive Codex and blocked filters. Real catalog lists the four qualified cases, with only paused-supplier under the blocked intersection |
| P08 | Catalog host selection excludes unqualified hosts (H). | slice 2 | observed: Distribution/evaluation/tests/native-guidance-checks/native-guidance-check.sh asserts an unqualified-only host is visible but filters to no output and failure. The real Claude and Cursor filters returned empty results and exit 1 |
| P09 | When the turn’s stream shows the command count, the runner records the count (T). | slice 3 | observed: Doughnut runner calibration asserts exactly one turn-1-commands field with value 1, supplier archive verifies count 1, launch-command qualification observes count 0 |
| P10 | When the turn’s stream cannot show the command count, the runner records `unknown` for it (T). | slice 3 | observed: Distribution/evaluation/tests/native-guidance-checks/native-comparison-incomplete.sh asserts unknown command count on missing, truncated and wrong-thread streams and unchanged earlier observed command effort |
| P11 | When the turn’s stream shows the harness inspection, the runner records the inspection (T). | slice 3 | observed: Doughnut runner calibration asserts exactly one false inspection field for a project command, then true for init.d. Native harness inspection checks source, controller, and project paths. Launch-command qualification observes false |
| P12 | When the turn’s stream cannot show the harness inspection, the runner records `unknown` for it (T). | slice 3 | observed: Distribution/evaluation/tests/native-guidance-checks/native-comparison-incomplete.sh asserts unknown harness inspection for missing, truncated and wrong-thread streams |
