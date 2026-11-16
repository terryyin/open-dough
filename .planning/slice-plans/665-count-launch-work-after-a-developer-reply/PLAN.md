# Count a dashboard launch's work after a developer reply

**Identity:** SEED-388#count-claude-code-work-after-a-developer-reply
**Source:** [Count a dashboard launch's work after a developer reply](../../seeds/SEED-388-measure-and-control-agent-launch-cost.md#count-claude-code-work-after-a-developer-reply)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

A developer reading System settings → Usage sees the whole cost of a dashboard
launch on Claude Code or Codex, including the turns after a developer reply,
until an input in the same session starts another task. The story section owns
the scope, deferred promises and key examples; this plan adds none.

Assumptions: no change to which launches Usage shows, the tariff, pricing,
coverage gaps or the chart; no store format change; retained history is
recomputed by the documented offline importer.

## Existing solution and direction

PFE result: the task record already holds a list of turns, `nativeTurns`
(`dashboard/server/usageRecords.ts`), and both associations already claim a
response through it: Claude Code matches the human input its response climbs
to (`claudeUsageLineage.ts`, `task.nativeTurns?.includes(root.uuid)`), Codex
matches the response's turn or root turn (`codexUsageLineage.ts`).
`mergeUsageTask` (`usageTaskReconciliation.ts`) unions `nativeTurns`, so a
launch record and the facts read from its transcript join into one task. What
is missing is a writer: each fact carries one `turnId`, and
`recoveredUsageTasks.ts` and `nativeTaskActivity.ts` set
`nativeTurns: [fact.turnId]`.

Direction: one rule in the shared native task reading — a plain developer input
continues the active task; a task-starting input (a recognised workflow
invocation or reporting context, as `nativeTaskDirective` already decides)
replaces it. `nativeTaskCorroboration.ts` already holds the active task for
both readers; it becomes the one owner of “the active task”, extending its
turns on a plain input and sinking it again, so `claudeTaskReader` and
`codexTaskReader` share it instead of diverging (today the Claude Code reader
drops its active task at a plain reply and the Codex reader keeps it). Facts
carry their turns; the two task builders read them. No association code
changes.

Consequence for completion receipts: with the active task kept across a reply,
a receipt after a reply joins its task on both tools. This follows from the one
active-task notion; the consumer runs below observe it.

No Accepted ADR governs usage attribution. [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)'s
“no application database” is kept: the history document and its format stay.

## Current decisions

- `dashboard/USAGE-HISTORY.md` states the old rule (“Unclassified human
  follow-ups have an unknown task boundary and remain unassigned…”). The
  developer reversed it in refinement on 2026-11-16; slice 1 replaces that
  sentence. The file is 250 lines, at the
  [file-size](../../../.claude/skills/dough-post-change-refactor/references/refactor-checks.md#file-size)
  limit: the replacement must not lengthen it.
- Two existing tests encode the old rule and change with it, keeping their
  other promises:
  `dashboard/backend-tests/usage-history/claude-usage.spec.ts` (“another task”
  as a plain follow-up: make that later input a workflow invocation so the
  test still proves a later task's usage stays out) and
  `dashboard/backend-tests/usage-history/recovered-corroboration.spec.ts`
  (“Thanks, tell me more”: its response now counts in the task).
- Retained history is recomputed in slice 2 by the documented importer
  (`dashboard/USAGE-HISTORY.md`, “Run the offline importer”), first into a
  copy, then into this machine's store after a backup copy of
  `~/.open-dough/dashboard/launch-history/usage.json`. Refresh rereads only
  changed sessions, so it does not recompute older launches.

## Proof ownership

| Promise (story scope / example) | Owning slice and observable proof |
| --- | --- |
| Claude Code reply continues its launch, root and subagent | 1: new `dashboard/backend-tests/usage-history/token-index-developer-reply.spec.ts` — launch input, response, plain reply "1", root response and a worker joined after the reply → index includes both (premise run: 1,950 today, 4,900 with the reply's root response) |
| Codex reply continues its launch | 1: same spec — rollout with a launch turn and a reply turn ("yes") with its own `turn_id` → both turns' responses in the launch (premise run: 1 response today, 2 with the rule) |
| Later-turn workers count once; copied ancestor responses are not the worker's | 1: same spec — a Codex worker rollout whose responses name the reply turn as `root_turn_id` (`workerRollout`-style) counts once in the launch; the existing copied-ancestor cases in `codex-usage.spec.ts` / `codex-coverage.spec.ts` stay green in the consumer run |
| Ambiguous ownership stays a gap | 1: the existing unresolved-lineage and contradictory-lineage cases in the consumer run stay green; the rule adds turns only from the reader's ordered inputs, never by time |
| After a completion report | 1: same spec — a reply after the launch's completion receipt still counts |
| Another task starts | 1: same spec — `/dough-land` typed after an execution in the same session → that turn and its successor count in the land task, not the execution; no response in two tasks |
| Single input unchanged | 1: existing `token-index-refresh-claude.spec.ts` and `token-index-refresh.spec.ts` values unchanged; the usage-history consumer run stays green |
| Maintained rule | 1: `dashboard/USAGE-HISTORY.md` replaces the unassigned-follow-up sentence; `dashboard/USAGE-TOKEN-INDEX.md` says a launch's index includes its later developer turns |
| History recomputed; evaluation on 30 days to 2026-11-16 | 2: importer into a copied home, then this machine's store; a job-tmp script reports SEED-192#open-development-intent-frame's execution near 7.0M, Claude Code executions with a later input against their transcript cost to the next task-starting input, zero Codex launches with an unclaimed later developer turn, and the seed's two Codex threads (`01a1d22f…`, Open Dough SEED-324; `01a1d285…`, Doughnut SEED-073) gaining their later-turn root responses (22.36M and 25.35M before workers) plus their later-turn workers |

Consumers (scratch-observed below): the whole
`dashboard/backend-tests/usage-history/` directory, 93 tests in about 50 s.

## Decisive premises

The [November undercount sample](../../seeds/SEED-388-measure-and-control-agent-launch-cost.md#count-claude-code-work-after-a-developer-reply)
found that the median Usage index captured 53% of launch-window transcript
cost for the 82 Claude Code launches with a later developer input, versus
100% for the 183 with a single input. The Codex story examples count later
root responses and give lower bounds because later-turn workers were excluded.

| Premise | Consuming operation | Observation and result |
| --- | --- | --- |
| A Claude Code reply's responses count in no task today, and extending the launch task's `nativeTurns` from the reader is enough to count them | Slice 1 rule and proof | 2026-11-16, this workspace at `0eb81b520`, integration `node_modules` linked: scratch spec through `runImport` and `usageServer(...).refresh()` / `chart("?tool=claude")` with launch input, response (100 output), human reply "1", response (300 output). Today: `[["SEED-7#claude-1",{"kind":"measured"},1950]]`. With a scratch reader change adding the reply's uuid to the active fact's turns and `nativeTurns: fact.turns ?? [fact.turnId]` in `recoveredUsageTasks.ts` and `nativeTaskActivity.ts`: `4900`. Reverted. |
| The same holds for Codex, whose reply opens a new `turn_id` | Slice 1 rule and proof | Same date and workspace: scratch spec with `makeMe.aCodexRollout` turn `first-turn` (user `/dough-execute-plan SEED-7#first`, 100 output) and turn `reply-turn` (user "yes", 300 output), launch `finished("first")`, `runImport` then `refresh()`. Today `storedUsage` shows 1 response, 100 output; with the same scratch change in `codexTaskReader`, 2 responses, 400 output. Reverted. |
| A later task-starting input in the same session takes its own turns, and no response counts twice | Slice 1 “another task” case | Same date and workspace, same Claude scratch change: transcript launch input → response (100) → "1" → response (300) → `/dough-land` → response (700) → "ok" → response (900), then `runImport` and `readImported`. Tasks: launch `["launch-input","reply"]`, recovered `dough-land` `["land","ok"]`; session entries: launch 2 responses / 400 output, land task 2 / 1,600. Reverted. |
| The trunk story's two Codex acceptance threads continue through plain developer inputs the rule covers | Slice 2 evaluation | 2026-11-16 read-only scan of `~/.codex/sessions/2026/11/13/rollout-…-01a1d22f-….jsonl` and `…-01a1d285-….jsonl`: after the launch input, every later turn opens with a plain developer message (“OK”, “you watch it”, questions about the wait; “yes”, “LGTM”, “go ahead”, “approved”, “ready”), none a workflow invocation. A Codex worker's responses carry its parent's `root_turn_id`, matched by the same `codexAssociation` field as the root premise above. |
| Which existing tests observe the change | Slice 1 consumer run | Same scratch (both readers) with `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history --reporter=list`: 91 passed, 2 failed — `claude-usage.spec.ts:15` (requests 4, expected 3: the plain “another task” follow-up now counted) and `recovered-corroboration.spec.ts:17` (output 108, expected 8: “Thanks, tell me more” now counted). Both encode the reversed rule (Current decisions). The scratch kept the Claude reader's active-task reset, so receipt joining after a reply is not yet observed; slice 1's consumer run observes it. |
| Real launches have such replies on both tools, and the rule's boundary fits them | Story scope; slice 2 evaluation | 2026-11-16 read-only scan of `~/.open-dough/dashboard/launch-history/usage.json` with `~/.claude/projects` and `~/.codex/sessions/2026`: 84 of 266 Codex launches since 2026-10-17 have a later developer turn no task claims; Claude Code launches show 316 later inputs before a completion report, 19 after it (continuing the same work) and 4 that start another task. |
| The offline importer recomputes an existing store's launch with the added turns | Slice 2 | Same date and workspace: fixture home in job tmp (launch record, Claude transcript with launch input, response, reply "1", response). `node dashboard/server/importUsageHistory.ts import --home <fixture> --claude-root <fixture>/.claude/projects --codex-root <fixture>/.codex/sessions --since 2026-01-01T00:00:00Z` with today's code → task `nativeTurns: ["launch-input"]`. With the slice-1 scratch change, the same import over that existing store → `nativeTurns: ["launch-input","reply"]`, session entry `responses: 2`, `output: 400`, candidate the launch task. Reverted. The real store's size and runtime remain slice 2's to observe on its copy. |

## Concerns

Slice-plan refinement was not needed: slice 1 is one rule with one proof loop
across both tools; slice 2 is the evaluation over retained history, an
independent outcome with its own observation. This review found no remaining
slice-specific concern.

## Ordered slices

Each slice targets 15 active minutes.

### 1. A developer reply continues its launch until another task starts
Type: Behavior
Status: done
Proof: new `dashboard/backend-tests/usage-history/token-index-developer-reply.spec.ts`
(cases in the proof table for slice 1), through `runImport`,
`usageServer(...).refresh()` and `chart(...)` / `storedUsage`; then the
consumer run
`env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history --reporter=list`;
`npm run typecheck:dashboard`; `npm run lint`.

Behavior: a dashboard launch's session on Claude Code or Codex receives a
plain developer input after its first → that input's turn and its root and
worker responses count in the launch's Token index, through a completion
report, until an input that starts another task, whose turns count in that
task instead.

- `nativeTaskCorroboration.ts` owns the active task for both readers: a
  task-starting fact replaces it, a plain input extends its turns and sinks
  it again. Remove the Claude Code reader's reset at a plain input.
- `NativeTaskFact` carries its turns; `recoveredUsageTasks.ts` and
  `nativeTaskActivity.ts` build `nativeTurns` from them.
- Update the two tests named in Current decisions and the two documents.
- Before writing tests, apply MakeMe selection (AGENTS.md); add a builder step
  for a plain developer input to `aClaudeTranscript` and `aCodexRollout` if
  the spec would otherwise hand-build rows.

### 2. Retained history shows the whole cost of past launches
Type: Behavior
Status: done
Proof: a job-tmp script (not committed) over the importer's stored history and
the retained transcripts reports the three evaluation figures in the proof
table, first for a copied home, then for this machine's store.

Behavior: this machine's retained usage history over the 30 days to
2026-11-16 → after the importer runs with slice 1, SEED-192#open-development-intent-frame's
execution shows close to its 7.0M transcript cost, Claude Code executions with
a later developer input match their transcript cost up to the next
task-starting input, no Codex launch leaves a later developer turn without
a task, and the seed's two Codex threads include their later-turn root and
worker responses.

- Run `node dashboard/server/importUsageHistory.ts import --home <copy> --claude-root ~/.claude/projects --codex-root ~/.codex/sessions --since '2026-10-17T00:00:00+08:00'`
  into a copy of `~/.open-dough/dashboard` first; if the copy keeps the old
  values, stop and replan before touching the real store.
- Then back up `~/.open-dough/dashboard/launch-history/usage.json` and run the
  same import against this machine's home.
- Record the figures in Learnings.

## Local gates and execution discipline

Apply the linked
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Run Playwright with `env -u NO_COLOR -u FORCE_COLOR` and
`--reporter=list`. Per [AGENTS.md](../../../AGENTS.md), keep default
timeouts, never use `test.slow()`, and apply MakeMe selection before test
edits. The focused spec and the `usage-history/` consumer run are the local
gate; they cover every spec that reads native task facts. The full suites run
in hosted CI. The local-gate sleep guard is
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake; on AC wrap long or full runs in `caffeinate -s -i`.

## Learnings

- Slice 1 (2026-11-16): accepted proof is
  `dashboard/backend-tests/usage-history/token-index-developer-reply.spec.ts`
  (Claude reply 6,850; reply after completion 4,900; `/dough-land` and a second
  reporting context each take their own turns, 4 associations) and
  `token-index-developer-reply-codex.spec.ts` (reply turn 2 responses / 400;
  reply-turn worker once, 1 / 70); all six fail without the rule. Consumer run
  of `dashboard/backend-tests/usage-history` 98/98 after the refactor;
  typecheck and lint pass. Facts sharing a key already merge `nativeTurns` by
  union, so re-sinking the extended active fact needed no merge code. A Claude
  bookkeeping input (such as a `/model` wrapper) now extends the active task;
  it has no responses, so it adds no cost.
- Slice 2 (2026-11-16), copy import: 746.7 s, peak 3.8 GB, store 24.4 → 30.3 MB.
  SEED-192's execution 0.14M → 6.99M (transcript 6.99M); 95 of 112 Claude Code
  executions with a later input match their transcript cost within
  max(1%, 1,000); Codex launches with an unclaimed later developer turn 154 → 0.
  But 17 of 424 Codex launches fell to 0 (G1): a stored placeholder task rooted
  on a continued turn made the extended fact match two kept records, so
  `usageTaskIndex.only` kept a duplicate. Repaired after slice 1: a kept record
  sharing the id, root turn or launch reference now wins over one matched only
  through a continued turn (`usageTaskMatch`); proof is the
  `token-index-developer-reply-codex.spec.ts` case "a reply turn that opens with
  host-injected context counts once in the launch on every import" (fails at
  `dcd69ec`), usage-history 99/99, and a narrowed reimport of the two Codex
  example threads (`01a1d22f` 6.23M → 31.31M, no duplicate). Compare every
  launch's index before and after an import (job-tmp `compare.ts`), not only
  the target launches.
- Slice 2 rerun at `5145a57`, real store recomputed (backup
  `~/.open-dough/dashboard/launch-history/usage.json.before-SEED-388-202611161656`):
  no index decreased; SEED-192 6.99M; 93 of 111 Claude Code executions match;
  0 Codex launches with an unclaimed later turn; SEED-324 31.31M. Two further
  defects surfaced and were repaired: G2, a turn-start compaction response is
  recorded before its turn's `turn_context`, so `codexUsage.ts` gave it no model
  and 11 launches became unpriced (no chart point); it now waits for that
  turn's settings in the same file (narrowed reimport: SEED-285 57.41M,
  SEED-073 80.26M, SEED-144 5.63M, all priced). G3, Claude Code writes an
  argless slash workflow without `<command-args>`, so `/dough-land` did not
  start another task (SEED-133 2.07× its transcript); the wrapper pattern now
  accepts it when nothing follows `</command-name>`. Both repairs have
  failing-first cases; usage-history 101/101.
- Slice 2 final (2026-11-16): stored task turns merge by union across imports,
  so an import with a defect leaves its turns behind. The real store was
  restored from its pre-story backup and recomputed once at `0a58de1` (530 s,
  4.1 GB): no launch dropped or became unpriced; SEED-192 6.99M; Claude Code
  94 of 111 within 1%, 106 within 3%; Codex 0 unclaimed later turns; SEED-324
  31.31M, SEED-073 80.26M; SEED-133 14.18M vs 14.02M. Terry amended the
  Evaluation and moved the two remaining reader gaps (second-level background
  agents; rows split at U+2028/U+2029) to their own queued SEED-388 stories.

## Story obligations

### E1. Per-turn cost split is deferred
Reported: slice 1 — "Per-turn cost split is deferred by the story"
Story clause: "Splitting a launch's cost by turn or showing the developer's inputs in task detail."
Disposition: excluded "Splitting a launch's cost by turn or showing the developer's inputs in task detail."
Commitment: X1

### E2. Recovery of sessions started outside the dashboard is deferred
Reported: slice 1 — "Native-session recovery changes are deferred by the story"
Story clause: "Changing how sessions started outside the dashboard are recovered as tasks."
Disposition: excluded "Changing how sessions started outside the dashboard are recovered as tasks."
Commitment: X2

### G1. Extended Codex launches lose all usage to a duplicate recovered task
Reported: slice 2 — "17 of 424 Codex dashboard launches now show a Token index of 0, and both of the story's Codex example threads are among them."
Story clause: "A later developer input in a launch's session belongs to that launch"
Disposition: proved by slice 2: token-index-developer-reply-codex.spec.ts 'a reply turn that opens with host-injected context counts once in the launch on every import'; clean real-store recompute: 0 launches dropped, 01a1d22f 31.31M with no duplicate task

### G2. A launch whose later turns include a response without a recorded model becomes unpriced (first reported in slice 2)
Reported: slice 2 — "11 Codex launches became unpriced, all for the G2 cause"
Story clause: "A developer or maintainer reading System settings → Usage sees the whole cost of a dashboard launch on Claude Code or Codex"
Disposition: proved by slice 2: token-index-developer-reply-codex.spec.ts 'a reply turn's compaction response, recorded before its turn context, counts at that turn's model'; clean real-store recompute: 0 launches became unpriced, 01a1d285 80.26M

### G3. A Claude Code workflow command without arguments does not start another task
Reported: slice 2 — "The `/dough-land` input did not start another task."
Story clause: "a recognised Open Dough workflow invocation or another dashboard launch's reporting context"
Disposition: proved by slice 2: token-index-developer-reply.spec.ts 'a Claude Code slash workflow without arguments after an execution…'; clean real-store recompute: SEED-133 14.18M vs 14.02M to its /dough-land input (was 2.07×)

### G4. Responses of second-level Claude Code background agents climb to no task
Reported: slice 2 — "SEED-334 loses all responses from second-level subagents."
Story clause: "the Claude Code executions with a later developer input match their transcript cost from launch until the next task-starting input"
Disposition: owner changed "second-level background agents and rows split at U+2028/U+2029 move to their own stories"

### G5. Claude Code rows containing U+2028 or U+2029 are split and lost
Reported: slice 2 — "SEED-124 drops rows that contain U+2028 or U+2029."
Story clause: "the Claude Code executions with a later developer input match their transcript cost from launch until the next task-starting input"
Disposition: owner changed "second-level background agents and rows split at U+2028/U+2029 move to their own stories"
