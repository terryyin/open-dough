---
id: SEED-341
status: active
planted: 2026-11-13
planted_during: Terry reviewed the session tests SEED-300 changed and asked for shorter cases and cheaper proof
trigger_when: Session test cases read long, loop over case tables, or prove pure reading rules end to end
scope: two stories
---

# SEED-341 — Short session tests with proof at the cheapest tier

## Parent goal and scope

Terry reviewed the session-related dashboard tests that
SEED-300#express-session-test-intent-through-page-objects changed and found
them verbose: long cases, loops over case tables outside and inside tests, and
long comments explaining what the code already says. A developer reading a
session test should see only the facts that matter to its case. MakeMe
builders supply defaults for everything else.

All session tests are end-to-end browser journeys over the real server.
Pure rules — how a session reads, which readings need attention, how many a
card counts — belong in browser-free module tests in `dashboard/backend-tests/`
(or built-frontend tests in `dashboard/frontend-tests/` for UI-only
behavior), where every variant costs little. A few end-to-end journeys remain
for what only the integrated page shows: pace, placement, persistence across
restarts and reloads, and no unintended reads.

Preserve every distinct behavior check at some tier. Remove an end-to-end
variant only when a cheaper test proves the same rule and a remaining journey
still proves the integration. No dashboard behavior changes.

<a id="simplify-session-state-tests"></a>

### Simplify session state and attention tests

**Identity:** SEED-341#simplify-session-state-tests
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless","assessment":"ready","reasons":[],"basis":{"document":"c982c5159c81d5f55396fa8c13efa6a45b206919ab3bf88120debb71f002c6a1"}}
```

**Goal:** The session state and attention tests read briefly: each case states its
scenario, action and expected outcome, without loops over case tables or
explanatory narration. Every reading of a native session state is proven by a
browser-free rule test; the end-to-end journeys keep one representative change
per integrated behavior.

#### Scope

- Session reading rules (`dashboard/src/nativeSessionShown.ts`,
  `dashboard/src/sessionShown.ts` attention count): cover every native state's
  words, note, tone and attention in a backend module test built with MakeMe.
- `dashboard/tests/sessions/agent-launch-session-state-pace.spec.ts`,
  `agent-launch-story-card-session-states.spec.ts`,
  `agent-launch-story-card-sessions.spec.ts`,
  `agent-launch-attention.spec.ts`, `agent-launch-attention-taken.spec.ts`
  and their case modules: shorter cases, no case-table loops, builder and
  page-object defaults instead of restated facts.

#### Key examples

1. A blocked session with a reason reads `Needs input` with that reason as its
   note and needs attention — proven by a module test, not by a browser
   journey per state.
2. The pace journey still proves that one host change appears within one
   records-read pace without a reload.
3. The card-states journey still proves an open session's entry, blocked
   Starts and state survive a server restart, a reload and a project switch.

<a id="simplify-remaining-session-tests"></a>

### Simplify the remaining session tests

**Identity:** SEED-341#simplify-remaining-session-tests
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** Apply the same simplification and tier move to the other session families in
`dashboard/tests/sessions/`: sidebar reading and navigation, Recently done
selection and paging, final reports and touch, workspace retirement,
completion reporting, and Running Cursor. Remove case-table loops, shorten
cases through builder and page-object defaults, and move pure rules to
backend or frontend tests while keeping a few end-to-end journeys.
