---
id: SEED-411
status: active
planted: 2026-11-19
planted_during: Developer asked to refactor the Command+Enter submit-and-close spec through the Playwright and page-object conventions, in a worktree, and land it
trigger_when: accepted for planless execution from that contextual instruction
scope: one story
---

# SEED-411 — Express submit-and-close test intent

<a id="express-submit-and-close-test-intent"></a>

### Express submit-and-close test intent

**Identity:** SEED-411#express-submit-and-close-test-intent
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless","assessment":"ready","reasons":[],"basis":{"document":"51b0b479f54c1e24bda37dd6bfec6eaa5084d8a207e05d4c011487212021b6eb"}}
```

**Goal:** A developer reading the Command+Enter submit-and-close scenario can
follow the terminal actions and the outcomes they prove, with one page-object
owner for the browser mechanics those tests would otherwise repeat.

**Scope:**

- Start from `e2e/terminals/agent-terminal-submit-and-close.spec.ts`.
- Apply the selected MakeMe and page-object conventions. Keep scenario order,
  concrete inputs, variants, and expected answers in the test. Shared browser
  mechanics get one focused page or component owner, reached by fluent
  hand-off.
- Extend only to related tests whose page objects would duplicate or
  potentially duplicate the owners this scenario needs. Leave other suites
  on their current practice.
- Preserve distinct behavior: ready Command+Enter submits one Enter and
  closes after leave-ready; disconnect without leave-ready keeps the panel
  and names confirmation unavailable; a working session or unfocused input
  does not submit-and-close; plain Enter still submits without closing.
  Attach lines, the taken chord, process end, and the launch record stay
  observable at the boundary that proves them.

**Expectations:** Dashboard behavior does not change. Which sibling specs
share an owner is settled by reading them while the page objects are shaped,
and only those specs move.
