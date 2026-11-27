# Prove Cursor turns in Node Vitest

**Identity:** SEED-413#prove-cursor-turns-on-vitest

**Status:** awaiting story refinement — not ready for slice-plan refinement or execution.

**Source:** [Prove Cursor turns in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-cursor-turns-on-vitest)

This plan is provisional input from the split of
[terminal attach](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-terminal-attach-and-cursor-turns-on-vitest).
Story refinement resumes it. The slice list below is the mapped remainder,
not an execution plan.

## Mapped remainder

Playwright listed these 18 cases on 27 November 2026 at `20bcf3013` with
`node node_modules/playwright/cli.js test --config dashboard/backend.playwright.config.ts --reporter=list --list`
and the eleven-spec terminal pattern. `groupFiles` classified each file as
Playwright.

| Provisional slice | Specs | Cases | Observation to preserve |
| --- | --- | --- | --- |
| 1 | `agent-terminal-cursor.spec.ts` | 1 | A working client survives detach, a new socket joins the same process, a second socket shares output, and closing the server leaves the process running. An unknown session and a foreign origin add no attach. |
| 2 | `agent-terminal-cursor-idle.spec.ts` | 4 | A detached follow-up, question, unrecognized screen, or working screen leaves the process running. The next open of the follow-up client joins it and accepts typing. |
| 3 | `agent-terminal-cursor-launch.spec.ts` | 6 | The instruction is submitted only when the screen is ready. A question accepts a typed answer and leaves the instruction unconfirmed. A trust prompt that never becomes the composer does not receive the instruction. A screen that becomes ready later does. |
| 4 | `agent-terminal-cursor-launch-wait.spec.ts`, `agent-terminal-cursor-trust-join.spec.ts` | 5 | A held first paint, a silent paste chip, or workspace trust answers uncertain and leaves the client running. A later ready screen or the developer's terminal answer confirms the instruction. A terminal joined during the wait shows the trust prompt. |
| 5 | `agent-terminal-cursor-exit.spec.ts` | 2 | A client that exits before acceptance records Cursor's text and repeating the launch adds no session. Killing the client leaves the instruction unconfirmed, and the next launch submits it in a new conversation. |

Terminal attach, Codex resume, and `closeServer` stay with plan 871. Runner
start and replacement stay with the Cursor runner story. Refinement records
goal, scope, and key examples, then realigns these slices before any
readiness assessment.
