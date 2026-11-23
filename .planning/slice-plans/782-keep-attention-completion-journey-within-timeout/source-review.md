# Independent source review

The fresh `source_review` agent received only the Goal, Scope and Key
examples of [the selected story](../../seeds/SEED-341-simplify-session-tests.md#keep-attention-completion-journey-within-timeout),
with no conversation inheritance, and was instructed to read no project
files, change nothing and enumerate independently observable promises.
The scope limits edits to the attention spec and leaves refused delivery
with existing backend proof. The default timeout, dashboard behavior,
shared test support and CI job configuration stay outside the change.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P01 | The installed-report case passes within the default 30 seconds on a busy development machine and in CI. The reported contention example is around load 50 on 16 logical CPUs. Private setup and observations count toward the budget. | slice 2 | |
| P02 | The retained-unfinished-report case passes within the same budget and under the same conditions, including its private setup and observations. | slice 2 | |
| P03 | The installed-report case time is recorded against the unsplit journey under matched conditions. | slice 2 | |
| P04 | The retained-unfinished-report case time is recorded against the unsplit journey under matched conditions. | slice 2 | |
| P05 | The existing attention spec carries the proof in two cases split at the retained unfinished report. The first uses the actual installed report through the open Board, published Take, workspace removal and dashboard restart. The second starts with that kind of retained record and uses the real Final report, Mark as read and Mark as done. | slice 2 | |
| P06 | The split reduces setup compared with the unsplit journey and reuses existing builders and page objects. | slice 2 | |
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
| P28 | With an unread unfinished report on a Taken Codex session whose workspace is gone, the Final report panel shows the native report text as its report content. | slice 2 | |
| P29 | In that state, the reminder appears on the card and stays out of the Final report panel. | slice 2 | |
| P30 | In that state, `Mark as read` appears on the card and stays out of the Final report panel. | slice 2 | |
| P31 | Mark as read clears the card’s button. | slice 2 | |
| P32 | Mark as read records `reportRead`. | slice 2 | |
| P33 | Mark as read leaves `doneAt` unset. | slice 2 | |
| P34 | Mark as read adds no control to the Final report panel. | slice 2 | |
| P35 | Mark as done closes the panel. | slice 2 | |
| P36 | Mark as done removes the message from the story card. | slice 2 | |
| P37 | Mark as done sets `doneAt`. | slice 2 | |
| P38 | Mark as done leaves no done problem. | slice 2 | |
| P39 | Mark as done renames the native session. | slice 2 | |
| P40 | Mark as done interrupts the native session’s in-progress turn. | slice 2 | |
| P41 | The resulting Done entry shows `Done`. | slice 2 | |
| P42 | The Done entry displays the new native session name. | slice 2 | |
| P43 | In the Done entry, the unfinished message starts collapsed under `Unfinished work`. | slice 2 | |
| P44 | Expanding `Unfinished work` reveals that message. | slice 2 | |
| P45 | After marking the session done, the Final report still shows the native report. | slice 2 | |
