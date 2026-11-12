# Source-only review

Reviewer: fresh generalPurpose Task launch (agent `0d44a87d-626c-4adc-b8ab-3b23e3d51957`) on 2026-11-12.
Input: only the original correction story Goal and Scope for
SEED-316#prove-swipe-under-button-event-tracking, supplied verbatim in the
launch message. The reviewer was instructed to read no project files, change
nothing, separate compound commitments, and derive no slice ownership or
acceptance. Actual launch and numbered return are retained in this execution
conversation. Allocation below is the coordinator's subsequent responsibility.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | When a maintainer changes how a one-finger swipe decides between the terminal's scrollback and the session's application, a maintained test tells them if that swipe stops scrolling an application that asks for button-event or drag pointer tracking. Trigger/journey: maintainer changes the scrollback-vs-application swipe decision. Qualification: today only any-motion tracking is protected (Claude Code is named as an any-motion reporter). Examples (not exclusions): tmux and vim as apps that ask for button-event or drag tracking. | slice 1 | observed: agent-terminal-touch-application-scroll.spec.ts:?1000h and ?1002h cases; fail when corresponding wheelTracking entry removed (verified in execution, source restored) |
| 2.1 | Maintained proof that a one-finger swipe gives wheel input to an application on the alternate screen under xterm `vt200` (`?1000h`). | slice 1 | observed: agent-terminal-touch-application-scroll.spec.ts: a swipe scrolls an application that announces ?1000h — wheel reports + earlier conversation lines + nothing else |
| 2.2 | Maintained proof that a one-finger swipe gives wheel input to an application on the alternate screen under `drag` (`?1002h`). | slice 1 | observed: agent-terminal-touch-application-scroll.spec.ts: a swipe scrolls an application that announces ?1002h — wheel reports + earlier conversation lines + nothing else |
| 2.3 | Maintained proof that a one-finger swipe gives wheel input to an application on the alternate screen under `any` (`?1003h`). | slice 1 | observed: agent-terminal-touch-application-scroll.spec.ts: existing any-motion selfScrollingApplication journey (default ?1003h) unchanged and green |
| 3 | No product behavior changes (qualification: the swipe already works under all three modes in 2.1–2.3). | slice 1 | observed: dashboard/src/terminalTouchScroll.ts unchanged vs HEAD; focused application-scroll and terminals scrollback suites green |
| 4 | Adds no promise about a product intent. | slice 1 | observed: diff limited to terminalSubstituteApplication.ts tracking parameter and frontend application-scroll mode cases; no product-intent surface |
