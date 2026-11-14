---
id: SEED-341
status: active
planted: 2026-11-13
planted_during: Terry reviewed the session tests SEED-300 changed and asked for shorter cases and cheaper proof
trigger_when: Session test cases read long, loop over case tables, or prove pure reading rules end to end
scope: story
---

# SEED-341 — Short session tests with proof at the cheapest tier

## Parent goal and scope

Terry reviewed the session-related dashboard tests that
[Express session discovery and report test intent through page objects](https://github.com/terryyin/open-dough/blob/891a05400ffabebbe64505d67561c0a6e20afd42/.planning/seeds/SEED-300-dashboard-test-page-objects.md#express-session-test-intent-through-page-objects) changed and found
them verbose: long cases, loops over case tables outside and inside tests, and
long comments explaining what the code already says. A developer reading a
session test should see only the facts that matter to its case. MakeMe
builders supply defaults for everything else.

Most session tests are end-to-end browser journeys over the real server.
Pure rules — how a session reads, which readings need attention, how many a
card counts — belong in browser-free module tests in `dashboard/backend-tests/`
(or built-frontend tests in `dashboard/frontend-tests/` for UI-only
behavior), where every variant costs little. A few end-to-end journeys remain
for what only the integrated page shows: pace, placement, persistence across
restarts and reloads, and no unintended reads.

Preserve every distinct behavior check at some tier. Remove an end-to-end
variant only when a cheaper test proves the same rule and a remaining journey
still proves the integration. No dashboard behavior changes.

<a id="simplify-remaining-session-tests"></a>

### Simplify the remaining session tests

**Identity:** SEED-341#simplify-remaining-session-tests
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** Simplify the session families in
`dashboard/tests/sessions/`: sidebar reading and navigation, Recently done
selection and paging, final reports and touch, workspace retirement,
completion reporting, and Running Cursor. Remove case-table loops, shorten
cases through builder and page-object defaults, and move pure rules to
backend or frontend tests while keeping a few end-to-end journeys.

#### Starting evidence

On 2026-11-13 the 112 session specs averaged 60 lines per case. The longest
cases (150–206 lines) are in `agent-launch-codex-observation`,
`agent-completion-quiet`, `agent-completion-attention`,
`agent-launch-recent-delete`, `recently-done-sessions-select-ad-hoc`,
`session-attribution`, `sessions-sidebar`, `session-management-touch`,
`recently-done-sessions-sidebar` and `recently-done-sessions-sidebar-paging`.
Existing browser-free rule tests beside `session-reading-rule.spec.ts` in
`dashboard/backend-tests/sessions/` show the receiving tier for pure rules.
Refinement should split this into stories small enough to finish quickly.

Since SEED-334 (`64f15182b`), the session families no longer sit in one
folder. Representative workflows are in E2E Test (`e2e/sessions/`, 56 specs,
`npm run test:e2e`). Those include eight of the ten longest specs above; only
`recently-done-sessions-sidebar` and its `-paging` sibling stayed behind. The
remaining 51 specs are in the interim Dashboard Integrated UI Test
(`dashboard/tests/sessions/`, `npm run test:dashboard:integrated`). The queued
[SEED-334#focus-detailed-dashboard-ui-checks](SEED-334-product-wide-end-to-end-tests.md#focus-detailed-dashboard-ui-checks)
moves those interim specs to Dashboard Frontend or Backend Test through its
"sessions and terminals" batch, which overlaps this story's move of pure
rules to cheaper tiers. Refinement should settle the overlap before work
starts, either by ordering the two stories or by merging that batch here.
