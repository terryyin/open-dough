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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/628-simplify-usage-history-backend-tests/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d0e6e98f064b290d958ac589a5e17a03e240675e0a05d868b6a57189f69dd092","plan":"f0f74208fbf2cbac4dd347852244d893b2d2db81b5a0a3d448f0b450df1c8a31"}}
```

**Goal:** A developer reading a usage-history backend test sees only the
native session facts that case proves. Codex rollouts and Claude transcripts,
with their user, assistant, worker and session-meta rows, come from MakeMe
builders whose defaults keep the data valid, including in-window timestamps.
Cases stop importing the harness `at` constant. Overlapping
development-driver cases collapse, so the family is much shorter and keeps
every distinct behavior check. Maintaining usage-history proof gets cheaper
without changing what the dashboard does.

#### Starting evidence

Terry's 2026-11-15 review (follow-up to landed SEED-358,
`9e9b0e2b6964a45414b420094edca42779d56260`):

1. **MakeMe for native files and roles.** Hand-built `nativeFile(...)` plus
   literal JSONL rows and role objects (Claude `user`/`assistant` rows, Codex
   `session_meta`/`turn_context`/`token_usage_record` rows) appear throughout
   the family. That construction is frequent enough to be a domain concept;
   builders should make each case concise and show only what it cares about.
2. **Harness `at` is noise.** `dashboard/tests/usage-history/importHarness.ts`
   exports `at = "2026-11-14T10:00:00.000Z"`. Specs import it to stamp rows and
   launches when the exact time is not under assertion. That default belongs in
   the builders, not in the cases.
3. **Too many overlapping cases.** The family grew while driving development.
   Collapse redundant cases; keep distinct behavior checks. Expect a much
   shorter suite.

Observed at preparation revision `75912ec19ec3eb8474e11f89dc89e5b89ca61f0f`
(family last changed on trunk at `be0a53bcd8c2a7208310f7829d834dd0a96bfcb6`):

- 28 specs under `dashboard/backend-tests/usage-history/`: 4,481 lines and 47
  tests as Playwright lists them; 237 more lines of helpers under
  `dashboard/tests/usage-history/`.
- 74 `nativeFile(` calls in the specs; 18 specs import `at`.
- Only this family builds Codex rollout or Claude transcript rows in
  dashboard tests. `Distribution/tests/support/native-codex-session*.mjs`
  observes real (paid) native host runs, a different concept.
- `makeMe.aUsageTask` covers persisted task facts only;
  `usageHistoryTestData.mjs` still says native wire rows stay literal in import
  cases. This story reverses that for valid native rows used as test data.
- `makeMe.aLaunchRecord` defaults `launchedAt` to 2026-01-01, before the
  import harness's `--since 2026-09-16` window, which is why cases stamp
  launches with `at`.

#### Scope

Required:

- Shared MakeMe builders, behind `makeMe` in `Distribution/tests/support/`,
  for a Codex rollout and a Claude transcript. A case names the session,
  turns, responses with their usage counters, workers or subagents, launch
  input and the other facts it asserts; the builder derives the
  surrounding rows, ids, parent links and in-window timestamps. Builder
  modules import no dashboard runtime module, as the
  [test data architecture](../../Distribution/tests/test-data-architecture.md)
  requires.
- The import harness keeps the filesystem, process and window boundary:
  it writes a built session to its native file and runs the import. Its default
  timestamp is no longer exported to cases. Usage-history launch setup gets
  in-window defaults from the builders, not from a case-supplied `at`.
- Consolidate the family: merge cases whose setup and assertions repeat the
  same behavior, and regroup specs by concern. Each distinct behavior one of the
  47 starting tests proves keeps an observation in a surviving case.
- Update the shared helpers under `dashboard/tests/usage-history/`, the
  builder comment in `usageHistoryTestData.mjs`, and the test data
  architecture guide so they describe the new construction boundary.
- Any spec this family gains on trunk before execution finishes, such as
  SEED-357's usage specs, follows the same builders.

Scope limits:

- No dashboard product change. A defect the consolidated tests reveal is
  handled under the project failure policy, not by weakening the assertion.
- No other backend family migrates: none builds these native rows.
- Paid native-host evidence helpers in `Distribution/tests/support/` stay as
  they are.

Kept in the case, per the shared MakeMe convention:

- Malformed, unsupported or deliberately contradictory wire rows and exact
  bytes under proof.
- Timestamps, ids and counters the case asserts, including out-of-window
  times.
- Filesystem layout under proof, such as a compressed `.zst` archive or a
  Claude `subagents/` directory. Raw `nativeFile` remains only there.

#### Key examples

- **Codex own response.** A case proving that a task's own response is charged
  to it builds a rollout for the launched session with one response on the
  launch's first turn and its counters, then asserts the task usage. It writes
  no `session_meta` row, no timestamp and no `at` import.
- **Claude streaming and worker join.** A case proving streamed updates of one
  message count once and an explicitly joined worker is charged to the root
  task names the launch, the two streamed usage snapshots and the worker's
  usage. The transcript builder supplies the launch-input row with its
  reporting context, the attachment row and the `uuid`/`parentUuid` chain.
- **Time under assertion.** A case proving that a response before the import
  window is excluded states that response's timestamp
  (`2026-09-15T15:59:59.000Z`); every other row takes the builder's
  in-window default.
- **Damaged evidence stays visible.** A case proving that a truncated JSONL
  line is reported as damaged keeps the broken bytes literal in the case
  beside builder-made valid rows.
- **Consolidation keeps behavior.** Two starting cases that each prove replay
  idempotence on their own setup become one assertion in a surviving case,
  and the plan's inventory names that survivor. A behavior only one starting
  case proved, such as bounded memory on a long Claude parent chain, keeps its
  own case.
- **Measured result.** After execution, the family has fewer tests
  cases and fewer lines than the 47 tests and 4,481 lines above, with no new
  `at` import and `nativeFile` used only for layout under proof. The focused
  backend run of the family is green.
