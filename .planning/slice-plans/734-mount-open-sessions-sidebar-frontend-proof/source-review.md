# Source-only review

**Story:** SEED-413#mount-open-sessions-sidebar-frontend-proof
**Obtained:** before first implementation delegation
**Reviewer launch:** fresh general-purpose agent; inputs were Goal, Scope, Key
examples, Effort hypothesis, and Evaluation and stopping point only; no plan,
product, or proof.

## Unnumbered source context

- **Identity:** SEED-413#mount-open-sessions-sidebar-frontend-proof — “Prove open Sessions sidebar readings in mounted frontend tests.”
- **Goal (proof framing):** Dashboard developers can check Sessions sidebar open-session and machine-status presentation from typed inputs in Vitest Chromium; four specs currently build the dashboard and substitute machine and host reads for five cases about what the sidebar displays.
- **Ownership / coordination (not extra rejection rules):** Existing E2E journeys own polling, cross-project navigation, focus return, and touch behavior. This story owns these four frontend specs within the session renovation coordinated with SEED-341. Recently done and Running Cursor, shared sidebar layout changes, terminal and report interactions, and backend observation stay with their existing owners.
- **Effort hypothesis:** M, five slices. The view already has typed session observations and status. The open list needs a narrow render seam; Chromium must retain the real row layout and elapsed tick.
- **Evaluation / stopping point:** Compare the focused selection at two workers with the legacy baseline; remove unused arrangement while keeping the shared E2E readers. The open-list checks stand on their own.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Open-session ordering (attention older-first, then remaining newest-first). Scope — “open-session ordering and its attention badge”; Key examples — “Two sessions need the developer, so their older launch comes first, then the remaining open sessions newest first.” When two sessions need the developer, those attention sessions order by older launch first; remaining open sessions then order newest first. | slice 1 | observed: dashboard/frontend-tests/sessions/sessions-sidebar-order.spec.ts titles() poll: Story B,C,E,D,A; attention badge "2" |
| 2 | Working → Needs input: reorder into attention group and attention badge rises. Scope — “open-session ordering and its attention badge”; Key examples — “A working row changes to Needs input and moves to its launch position in the attention group as the badge rises.” A working row becomes Needs input; it moves to its launch position in the attention group; the attention badge rises with that change. | slice 1 | observed: dashboard/frontend-tests/sessions/sessions-sidebar-order.spec.ts after rerender: titles B,C,D,E,A; badge "3"; entryAt(2) Needs input / tone-needs-input |
| 3 | Long title truncates on one line beside elapsed age. Scope — “one-line title and tooltip”; Key examples — “A long title truncates on one line beside the elapsed age.” Long title; one-line truncation; shown beside the elapsed age. | slice 2 | |
| 4 | Tooltip retains state, project, workflow, and launch time. Scope — “one-line title and tooltip”; Key examples — “Its tooltip retains the state, project, workflow and launch time.” Tooltip content for the (long-title) row keeps state, project, workflow, and launch time. | slice 2 | |
| 5 | Elapsed age updates on the existing tick. Scope — “elapsed time”; Key examples — “The age changes on the existing tick…” Age changes driven by the existing tick. | slice 3 | |
| 6 | Elapsed age shows the largest whole unit. Scope — “elapsed time”; Key examples — “…and shows the largest whole unit.” Displayed age uses the largest whole unit. | slice 3 | |
| 7 | Left edge and hidden words distinguish working, attention, halted, and unsettled. Scope — “state edges and hidden labels”; Key examples — “The left edge and hidden words distinguish working, attention, halted and unsettled states.” Distinction via left edge and hidden words across those four states. | slice 4 | |
| 8 | If disk is unread, CPU and the counts still show. Scope — “independently available session and host figures”; Key examples — “If disk is unread, CPU and the counts still show.” Disk unread; CPU and counts remain visible. | slice 5 | |
| 9 | If sessions are unread, host figures still show on their own. Scope — “independently available session and host figures”; Key examples — “If the sessions are unread, host figures still show on their own.” Sessions unread; host figures still appear independently. | slice 5 | |
