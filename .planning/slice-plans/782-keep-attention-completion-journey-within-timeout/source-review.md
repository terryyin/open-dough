# Independent source review

The fresh `source_review` agent received only the Goal, Scope and Key
examples of [the selected story](../../seeds/SEED-341-simplify-session-tests.md#keep-attention-completion-journey-within-timeout),
with no conversation inheritance, and was instructed to read no project
files, change nothing and enumerate independently observable promises.
The scope limits edits to the attention spec and leaves refused delivery
with existing backend proof. The default timeout, dashboard behavior,
shared test support and CI job configuration stay outside the change.
P01 and P02 each include a local and a CI result. The CI clauses are
allocated to target CI so a local timing observation leaves them open
until the integrated revision passes.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P01 | The installed-report case passes within the default 30 seconds on a busy development machine. The reported contention example is around load 50 on 16 logical CPUs. Private setup and observations count toward the budget. | slice 2 | observed: natural-load-candidate.json, installed case passes in 25.871 s with four workers and natural load 35.84–36.05 |
| P02 | The retained-unfinished-report case passes within the same budget and under the same conditions, including its private setup and observations. | slice 2 | observed: natural-load-candidate.json, retained case passes in 12.236 s under the same four-worker conditions |
| P01-ci | The installed-report case passes within the default 30 seconds in CI, including private setup and observations. | target CI | |
| P02-ci | The retained-unfinished-report case passes within the default 30 seconds in CI, including private setup and observations. | target CI | |
| P03 | The installed-report case time is recorded against the unsplit journey under matched conditions. | slice 2 | observed: Plan Slice 2 matched comparison and natural-load-baseline.json / natural-load-candidate.json, unsplit timed out at 30 s versus 25.871 s |
| P04 | The retained-unfinished-report case time is recorded against the unsplit journey under matched conditions. | slice 2 | observed: Plan Slice 2 matched comparison and natural-load-baseline.json / natural-load-candidate.json, unsplit timed out at 30 s versus 12.236 s |
| P05 | The existing attention spec carries the proof in two cases split at the retained unfinished report. The first uses the actual installed report through the open Board, published Take, workspace removal and dashboard restart. The second starts with that kind of retained record and uses the real Final report, Mark as read and Mark as done. | slice 2 | observed: attention spec, installed case lines 51–160 uses real launch through restart and retained case lines 163–226 independently drives real Read and Done |
| P06 | The split reduces setup compared with the unsplit journey and reuses existing builders and page objects. | slice 2 | observed: attention spec lines 57–63 and 166–195, existing MakeMe builders, launch boundary, published revision and page objects eliminate duplicate launch/restart setup |
| P07 | Submitting an installed completed-with-attention report returns a receipt. | slice 1 | observed: slice 1 focused proof, attention spec lines 104–121, installed child and schema parse require a recorded UUID receipt |
| P08 | That receipt contains the submitted message. | slice 1 | observed: slice 1 focused proof, attention spec lines 100–121, exact submitted text matches receipt |
| P09 | That receipt identifies the Codex session. | slice 1 | observed: slice 1 focused proof, attention spec lines 114–121, recorded launch reference and Codex thread match |
| P10 | The store retains the completed-with-attention completion. | slice 1 | observed: slice 1 focused proof, attention spec lines 122–126, persisted receipt, outcome and message |
| P11 | After that completion is stored, `doneAt` is absent. | slice 1 | observed: slice 1 focused proof, attention spec lines 127, `doneAt` absent after completed receipt |
| P12 | Delivery of the completed-with-attention report sends no interrupt to the native session. | slice 1 | observed: slice 1 focused proof, attention spec lines 110–114 and 136, zero `turn/interrupt` calls since delivery |
| P13 | Delivery sends no rename to the native session. | slice 1 | observed: slice 1 focused proof, attention spec lines 110–114 and 136, zero `thread/name/set` calls since delivery |
| P14 | Delivery starts no new turn in the native session. | slice 1 | observed: slice 1 focused proof, attention spec lines 110–114 and 136, zero `turn/start` calls since delivery |
| P15 | On the next session read, the open Backlog card displays the installed message as text. | slice 1 | observed: slice 1 focused proof, attention spec lines 87–99 and 128–129, settled empty message then exact text after one observed records read |
| P16 | The rendered message has zero script elements. | slice 1 | observed: slice 1 focused proof, attention spec lines 130, zero scripts in the message part |
| P17 | The open Backlog card shows `Working`. | slice 1 | observed: slice 1 focused proof, attention spec lines 131, exact Working on open Backlog card |
| P18 | The open Backlog card shows `Unread report: Completed with attention`. | slice 1 | observed: slice 1 focused proof, attention spec lines 132–134, exact unread status |
| P19 | The open Backlog card offers `Mark as read`. | slice 1 | observed: slice 1 focused proof, attention spec lines 135, visible card Mark as read |
| P20 | A later installed unfinished report returns `unfinished`. | slice 1 | observed: slice 1 focused proof, attention spec lines 137–138, second installed report returns unfinished |
| P21 | The store retains the later unfinished message. | slice 1 | observed: slice 1 focused proof, attention spec lines 139–143, stored second receipt, outcome and text |
| P22 | After the unfinished message is stored, `doneAt` remains absent. | slice 1 | observed: slice 1 focused proof, attention spec lines 144, `doneAt` absent for unfinished receipt |
| P23 | The later unfinished receipt changes the open card to `Unfinished work`. | slice 1 | observed: slice 1 focused proof, attention spec lines 145–146, one more observed records read displays Unfinished work |
| P24 | A published Take moves the same message to the Taken card. | slice 1 | observed: slice 1 focused proof, attention spec lines 147–155, published revision read shows same message in Taken with old Backlog card absent |
| P25 | After the workspace directory is removed, the installed command still returns a receipt. | slice 1 | observed: slice 1 focused proof, attention spec lines 156–159, removed workspace confirmed absent and fresh installed receipt parsed |
| P26 | After the dashboard process restarts, the stored receipt matches the receipt retained after workspace removal. | slice 1 | observed: slice 1 focused proof, attention spec lines 159–176, restarted server reads retained receipt and message from same machine |
| P27 | A fresh page read after workspace removal and dashboard restart still shows the message on the Taken card. | slice 1 | observed: slice 1 focused proof, attention spec lines 154 and 171–172, exact Taken message before removal and after fresh page read |
| P28 | With an unread unfinished report on a Taken Codex session whose workspace is gone, the Final report panel shows the native report text as its report content. | slice 2 | observed: attention spec lines 164–192, retained unfinished Codex record references absent workspace and the panel displays distinct exact native text |
| P29 | In that state, the reminder appears on the card and stays out of the Final report panel. | slice 2 | observed: attention spec lines 193 and 196–198, reminder absent from Final report and exact on Taken card |
| P30 | In that state, `Mark as read` appears on the card and stays out of the Final report panel. | slice 2 | observed: attention spec lines 194 and 196–199, zero panel Read controls and visible card Read button |
| P31 | Mark as read clears the card’s button. | slice 2 | observed: attention spec lines 197–201, real card button disappears after click |
| P32 | Mark as read records `reportRead`. | slice 2 | observed: attention spec lines 202–203, persisted reportRead is the completion receipt |
| P33 | Mark as read leaves `doneAt` unset. | slice 2 | observed: attention spec line 204, persisted doneAt still absent |
| P34 | Mark as read adds no control to the Final report panel. | slice 2 | observed: attention spec lines 195 and 205, open panel's remembered controls gain none |
| P35 | Mark as done closes the panel. | slice 2 | observed: attention spec lines 206–208, real Done closes the report panel |
| P36 | Mark as done removes the message from the story card. | slice 2 | observed: attention spec line 209, live Taken card no longer has the message part |
| P37 | Mark as done sets `doneAt`. | slice 2 | observed: attention spec line 210, persisted doneAt present after Done |
| P38 | Mark as done leaves no done problem. | slice 2 | observed: attention spec line 211, no persisted doneProblem |
| P39 | Mark as done renames the native session. | slice 2 | observed: attention spec lines 222–224, exact native thread rename call with new name |
| P40 | Mark as done interrupts the native session’s in-progress turn. | slice 2 | observed: attention spec lines 222–225, exact native turn interrupt with observed in-progress turn and no resume or start |
| P41 | The resulting Done entry shows `Done`. | slice 2 | observed: attention spec lines 213–214, Done entry shows Done |
| P42 | The Done entry displays the new native session name. | slice 2 | observed: attention spec lines 212–215, Done entry displays the native rename |
| P43 | In the Done entry, the unfinished message starts collapsed under `Unfinished work`. | slice 2 | observed: attention spec lines 216–217, message is absent with collapsed Unfinished work disclosure |
| P44 | Expanding `Unfinished work` reveals that message. | slice 2 | observed: attention spec lines 218–219, actual disclosure reveals the exact reminder |
| P45 | After marking the session done, the Final report still shows the native report. | slice 2 | observed: attention spec lines 220–221, report reopened from Done displays exact native text |
