---
id: SEED-362
status: active
planted: 2026-11-15
planted_during: Terry reviewed SEED-358 usage-history backend tests after landing and asked for MakeMe builders, quieter defaults, and fewer redundant cases
trigger_when: selected from the product backlog
scope: story
---

# SEED-362 — Shorter usage-history backend tests with MakeMe native builders

## Parent goal and scope

After
[SEED-358#reconstruct-codex-and-claude-code-usage-history](../done/.catalog.json)
landed, Terry reviewed the new usage-history proof and found it too noisy and
too numerous for maintained reading. Native session files and host roles are
built by hand in almost every case; a shared `at` timestamp is imported from
the import harness only to keep fixture rows valid; and many small specs that
drove development now overlap. A developer reading a usage-history backend test
should see only the facts that case cares about. MakeMe builders supply
defaults for the rest, and overlapping cases collapse without dropping distinct
behavior checks.

No dashboard product behavior changes. Scope covers
`dashboard/backend-tests/usage-history/` and the shared harnesses and MakeMe
builders those tests use (including
`dashboard/tests/usage-history/` helpers and
`Distribution/tests/support/` builders). Other backend families are in scope
only where they reuse the same native-file or role construction this story
introduces.

<a id="simplify-usage-history-backend-tests"></a>

### Simplify usage-history backend tests with MakeMe builders

**Identity:** SEED-362#simplify-usage-history-backend-tests

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** Make the usage-history backend tests concise and intent-led: native
session files and host roles are constructed through MakeMe builders that hide
validating defaults (including timestamps that only keep data valid), tests stop
importing harness-only datetime constants for that purpose, and the family has
fewer cases without losing distinct coverage.

#### Starting evidence

Terry's 2026-11-15 review (follow-up to landed SEED-358,
`9e9b0e2b6964a45414b420094edca42779d56260`):

1. **MakeMe for native files and roles.** Hand-built `nativeFile(...)` plus
   literal JSONL rows and role objects appear throughout the family. That
   construction is frequent enough to be a domain concept; builders should make
   each case concise and show only what the test cares about.
2. **Harness `at` is noise.** `dashboard/tests/usage-history/importHarness.ts`
   exports `at = "2026-11-14T10:00:00.000Z"`. Specs import it to stamp rows and
   launches when the exact time is not under assertion. That default belongs in
   the builders, not in the cases.
3. **Too many overlapping cases.** The family grew while driving development.
   Collapse redundant cases; keep distinct behavior checks. Expect a much
   shorter suite.

Observed on trunk starting revision
`45f965a1bb59f049f9828097971d7621c13c64d6`:

- 28 specs under `dashboard/backend-tests/usage-history/` (~4,481 lines, ~45
  `test(...)` cases).
- 74 `nativeFile(` calls in that directory; shared helpers also live under
  `dashboard/tests/usage-history/`.
- Existing `makeMe.aUsageTask` covers persisted task facts only;
  `usageHistoryTestData.mjs` still says native wire rows stay literal in import
  cases — the review reverses that for native files and roles as test data.

#### Expected versus actual

| | |
| --- | --- |
| **Expected** | Usage-history backend tests construct native files and roles through MakeMe builders; validating timestamps and other unused defaults stay in builders; the suite is materially shorter with the same distinct coverage. |
| **Actual** | Cases build native JSONL and roles by hand, import harness `at` for validity, and keep many overlapping development-driver specs. |
| **Gaps for refinement** | Exact builder API shape; which cases merge or drop; whether any non-usage-history backend suite must migrate in the same story or only when it already shares these helpers. |

#### Acceptance examples

- A representative Claude or Codex import case names only the session facts under
  assertion (for example host, tokens, completion, or assignment). Validating
  timestamps and boilerplate native rows come from MakeMe defaults; the case does
  not import `at` from the import harness.
- After consolidation, the usage-history backend family has fewer `test(...)`
  cases and fewer total lines than the starting evidence above, and every
  distinct behavior that remained still has a green proof in that family or a
  named cheaper sibling that still covers it.
- Builders live in the shared MakeMe convention selected for these tests; raw
  `nativeFile` remains only where a case must assert filesystem layout itself.
