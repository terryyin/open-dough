# Independent source review

Launch: `collaboration.spawn_agent`, task `/root/source_review`, `fork_turns: none`,
2026-11-17. Actual launch and supplied input are retained in that tool call in
this execution conversation. Input contained only the selected story's Goal,
Scope, limits and six examples, plus its evaluation context, reproduced as plain
text from `ace536b5e:.planning/seeds/SEED-345-session-token-efficiency.md`.
The reviewer was told to use only those inputs, read no files, change nothing,
number independent results with their qualifications, group repeated results,
and derive no slice ownership or acceptance. No plan, implementation or proof
was supplied. The following retains every returned id and its qualified text.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P01 | A run record exists from command launch. For “a proof command run through the slice clock’s run”: “The record exists from launch.” | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-run.test.mjs — a run outside an active slice leaves its command and checkout record before launching; real CLI/child handshake asserts launch record shape and terminal record; large-output failure and termination cases assert status recovery |
| P02 | The run record sits beside its log. The command “leaves, beside its log, a record.” | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-run.test.mjs — a run outside an active slice leaves its command and checkout record before launching; real CLI/child handshake asserts launch record shape and terminal record; large-output failure and termination cases assert status recovery |
| P03 | The record preserves the literal command. “A record of the literal command.” | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-run.test.mjs — a run outside an active slice leaves its command and checkout record before launching; real CLI/child handshake asserts launch record shape and terminal record; large-output failure and termination cases assert status recovery |
| P04 | The record preserves the checkout revision. “The checkout revision.” | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-run.test.mjs — a run outside an active slice leaves its command and checkout record before launching; real CLI/child handshake asserts launch record shape and terminal record; large-output failure and termination cases assert status recovery |
| P05 | The record states whether the checkout had uncommitted changes. “Whether the checkout had uncommitted changes.” | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-run.test.mjs — the run retains its launch revision and dirty state when the command commits those changes; executionWorktree supplies real Git preconditions, CLI record preserves launch state |
| P06 | The record preserves the start time. “The start time.” | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-run.test.mjs — a run outside an active slice leaves its command and checkout record before launching; real CLI/child handshake asserts launch record shape and terminal record; large-output failure and termination cases assert status recovery |
| P07 | After the command ends, the record contains its exit status. “Once it ends, the exit status.” | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-run.test.mjs — a run outside an active slice leaves its command and checkout record before launching; real CLI/child handshake asserts launch record shape and terminal record; large-output failure and termination cases assert status recovery |
| P08 | The record identifies the log. The record “names the log.” | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-run.test.mjs — a run outside an active slice leaves its command and checkout record before launching; real CLI/child handshake asserts launch record shape and terminal record; large-output failure and termination cases assert status recovery |
| P09 | The record identifies the exit file. The record “names the … exit file.” | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-run.test.mjs — a run outside an active slice leaves its command and checkout record before launching; real CLI/child handshake asserts launch record shape and terminal record; large-output failure and termination cases assert status recovery |
| P10 | A still-running command’s record has no exit status yet. Example 3: the overdue check reads the record and finds “no exit status yet.” | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-run.test.mjs — a run outside an active slice leaves its command and checkout record before launching; real CLI/child handshake asserts launch record shape and terminal record; large-output failure and termination cases assert status recovery |
| P11 | Guidance names one evidence location for logs, exit files, run records and worker reports. “The guidance names one place for an execution’s logs, exit files, run records and worker reports.” The hand-back’s full report uses this location too. | slice 2 |  |
| P12 | That evidence location is with the execution checkout. “With the execution checkout.” | slice 2 |  |
| P13 | The execution evidence remains uncommitted. The named location is “uncommitted.” | slice 2 |  |
| P14 | The evidence location is outside directories the test runner clears. “Outside any directory the test runner clears.” | slice 2 |  |
| P15 | Execution evidence lasts until the checkout is retired. “So it lasts until the checkout is retired.” This supplies the goal’s recoverability when repair or acceptance decisions need it. | slice 2 |  |
| P16 | A decisive diagnostic artifact vulnerable to removal or overwrite is preserved in the evidence location before another run starts. “When a decision rests on a diagnostic artifact the runner may remove or overwrite,” the owner “directs it to the evidence location or copies it there before starting another run.” | slice 2 |  |
| P17 | Before an expensive diagnostic run, the owner confirms artifact survival with a small run. “Before an expensive diagnostic run, the owner first confirms on a small run that the artifact survives.” | slice 2 |  |
| P18 | The consumer obtains the terminal result from the run record. “The consumer takes the terminal result from the record.” Example 1 also obtains command and revision there. | slice 2 |  |
| P19 | Log retrieval is limited to the failing assertion or summary the consumer needs. The consumer “reads from the log only the failing assertion or summary it needs, under targeted retrieval.” Example 1 expressly avoids loading the whole log or rerunning the suite. | slice 2 |  |
| P20 | The worker’s targeted hand-back is a short verdict. Goal: “a worker’s hand-back is a short verdict that points to them.” Hand-back: “The targeted return becomes a short verdict.” | slice 3 |  |
| P21 | The verdict covers every slice promise. “Each slice promise”; example 4 returns six lines for six promises. | slice 3 |  |
| P22 | For each promise, the verdict supplies its observation location and result, or its named gap. “Each slice promise with its observation location and result, or its named gap.” | slice 3 |  |
| P23 | The verdict supplies the changed paths. “The changed paths.” | slice 3 |  |
| P24 | The verdict supplies the run records. “The run records.” Examples 1 and 4 repeat this requirement. | slice 3 |  |
| P25 | The verdict supplies stops. “Stops.” | slice 3 |  |
| P26 | The verdict supplies consequential learnings. “Consequential learnings.” | slice 3 |  |
| P27 | The verdict supplies the full report’s path. “The path of the full report in the evidence location.” | slice 3 |  |
| P28 | The full report retains the proof detail currently required in the return. “The full report holds what the return requires today, including proof detail.” | slice 3 |  |
| P29 | The full report retains the consumer-trace record. “Including … the consumer-trace record.” Example 4 opens the report specifically for that record. | slice 3 |  |
| P30 | The coordinator reads the portions of the report and logs needed for its proof comparison. “The coordinator’s proof acceptance reads from the report and logs the parts its comparison needs.” | slice 3 |  |
| P31 | A promise absent from the verdict is treated as incomplete proof and returned with the missing promise named. “A promise absent from the verdict … is incomplete proof.” Example 5: five of six promises causes the coordinator to return the slice “naming the missing promise.” | slice 3 |  |
| P32 | A missing referenced report is treated as incomplete proof and returned with the missing report named. “A verdict whose report … is missing, is incomplete proof.” Example 5 names a report absent from disk and returns the slice “naming the missing … report.” | slice 3 |  |
| P33 | A missing referenced run record is treated as incomplete proof. “A verdict whose … record is missing, is incomplete proof.” | slice 3 |  |
| P34 | An overdue check uses the existing running command’s evidence and continues that run instead of launching a second one. Example 3: the coordinator reads “the command, its revision, the log so far, and no exit status yet” and “continues that run rather than starting a second one.” | slice 2 |  |
| P35 | Proof from before a later checkout edit is treated as covering the earlier state. Example 6: “The coordinator treats that proof as covering the earlier state.” | slice 3 |  |
| P36 | When a later edit affects an observation, the coordinator obtains that affected observation. Example 6: the coordinator “obtains the observation the edit affects.” | slice 3 |  |
| P37 | Each rule is edited at its existing owner. “Edit each rule’s existing owner in place.” | slice 3 |  |
| P38 | No competing rule is added. “Add no competing rule.” | slice 3 |  |

## Retained journey examples

- Large output — P03, P04, P07, P18, P19, P24: 2,791 tests, two failures;
  use the record and two failing assertions, without loading the whole log or
  rerunning the suite.
- Runner cleanup — P14–P16: preserve the failing E2E trace before a rerun
  clears the runner's output; it remains when the rerun passes.
- Still running — P01, P03, P04, P08, P10, P34: the overdue suite's record
  and log identify the existing run; continue it.
- Compact hand-back — P20–P24, P27, P29, P30: six promises, six observations,
  changed paths, two run records and a report path; open only needed detail.
- Exposed gap — P21, P31, P32: five of six promises or missing report is
  returned naming the missing evidence.
- Changed revision — P04, P35, P36: proof before a later edit covers the
  earlier state; obtain the observation that edit affects.

## Unnumbered source context

Recoverable evidence should reduce rereading, rerunning and context carried.
Shared guidance and the slice clock apply on every host. Required proof,
acceptance comparison, stopping rule and every proof row stay unchanged.
Promise allocation, waiting, coordinator read selection, CI bounded excerpts,
project runner settings and explicit markers keep their existing owners and
contracts. No runner-specific adapter. The small artifact check extends the
expensive-proof decision. Deterministic checks accompany the change; the next
real planned execution after release owns keep/revise/stop evaluation. No paid
comparison or immediate evaluation run is requested.
