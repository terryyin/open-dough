# Reuse unchanged usage pages on repeated writes

**Identity:** SEED-357#reuse-unchanged-usage-pages-on-repeated-writes
**Source:** [correction story](../../seeds/SEED-357-dashboard-task-token-usage.md#reuse-unchanged-usage-pages-on-repeated-writes)

## Source and provenance

This plan is a bounded retrospective correction of the completed
[View token usage for dashboard-launched Codex tasks](../../seeds/SEED-357-dashboard-task-token-usage.md#view-token-usage-for-dashboard-launched-tasks)
(SEED-357#view-token-usage-for-dashboard-launched-tasks). That story was
executed through [plan 627](../627-view-codex-task-token-usage/PLAN.md) in
commits `81146589..8c8d35d4`, with slice commits `ccbb06cb`, `5930697d`,
`65e953de`, `a7087514` and `8c8d35d4`. All five slices passed branch CI. Its
Learnings for slices 4 and 5 describe the tier reread and the Refresh writer
that this correction changes.

## Current findings

The findings come from the retrospective. The retrospective made a read-only
scratch run on an APFS clone of the real store, and the real store was not
changed.

1. **Refresh grows the store without new evidence.** One Refresh against the
   clone published 1,491 new pages (1.03 GB), while the referenced store grew
   from 1.63 GB to 1.64 GB. A second Refresh 47 s later orphaned another 933
   observation pages (861 MB). In a 40-page sample, 770 rows differed as bytes
   and none differed as objects: only the JSON key order changed. A third
   Refresh added 3 pages. Pages are content-addressed and never deleted
   (`dashboard/server/usageSnapshotPublication.ts`). New rows land in the last
   page of up to 256 partitions (`dashboard/server/usageSnapshot.ts`). The
   real store already holds 2.79 GB of unreferenced pages against 1.63 GB
   referenced, all from imports.
   - **Row bytes.** `reconcileObservation`
     (`dashboard/server/usageReconciliation.ts`) builds its result in a field
     order different from the record schema. A row the writer reads but does
     not reconcile is reserialized from its schema-parsed value
     (`parseValue`), so it takes the schema order. A response reconciled by
     one write and carried by the next therefore changes bytes, and so does
     the reverse.
   - **Tier.** Rereading a rollout imported before tiers were kept adds a
     second measurement that differs only in `settings.serviceTier`.
     `reconcileMeasurements` (`dashboard/server/usageMeasurements.ts`) lets only
     completion metadata be acquired. Any other settings difference is
     competing evidence.
2. **The offline import and Refresh store opposite workflows for launch tasks.**
   In the real store this affects 370 Codex launch tasks. The importer runs
   `canonicalUsageTasks([...catalog, ...recovered])`, and `mergeUsageTask`
   (`dashboard/server/usageTaskReconciliation.ts`) lets
   `incoming.workflow` win. That leaves the recovered skill name
   (`dough-story-refinement` 205, `dough-execute-plan` 165), while the
   launch records say `refinement` or `execution`. A Refresh flips them to
   workflow ids, and the next import flips them back. The comment on
   `launchWorkflowOf` (`dashboard/server/tokenIndexTask.ts`) does not match
   this. No test stores a launch task with a skill-name workflow, which is the
   real production shape.
3. **"Checked" can understate freshness after an offline import.**
   `lastUsageCheck` (`dashboard/server/usageCheck.ts`) prefers
   `usage-check.json` over the manifest time. An import after a Refresh is
   therefore in the chart, but Checked still shows the older Refresh time.
4. **Changing a filter during Refresh ends the checking indication early.** In
   `dashboard/src/SystemSettingsUsage.tsx`, the cohort read's `.finally`
   clears `checking`. That hides the note and re-enables Refresh while the run
   continues.
5. **Fixture trap.** `e2e/configuration/usageFixtureStore.ts` writes
   `workflow: recovered ? "dough-execute-plan" : workflow`, so a recovered
   Refinement fixture silently becomes Execution.

## Goal and scope

A usage write over native evidence that is already stored leaves that evidence's
bytes unchanged. The write may be a Refresh, an import, or both in turn. After
one normalizing write, a further write over the same evidence publishes no new
page file and leaves the manifest identical. Usage's "Checked" and checking
indication meet the corrected story's Freshness promise.

Included:

- byte-stable rows;
- a tier first learned on a reread recorded on the existing measurement;
- one stored workflow for launch tasks across the importer and Refresh;
- "Checked" reflecting a later import;
- a checking indication that survives a filter change;
- the fixture trap.

Exclusions (deferred, not rejected): reclaiming pages that no manifest
references, including the existing ~2.8 GB of orphans, and skipping untouched
partitions to cut writer latency. These belong to separate writer-level work
that the wrap-up advises. Also excluded: any change to the importer's command
line, to the tariff, or to the chart.

Assumptions: the first write after this correction lands normalizes the real
store once. It republishes the pages whose rows change order and the 370 launch
tasks whose workflow changes. That one-time cost is accepted.

## Preserved promises and constraints

The corrected story's Scope, Key examples and Required restrictions still hold.
These are the ones this correction touches:

- **Refresh** reads only changed rollouts and counts each response once,
  including when it overlaps an import. Refreshing again with no new rollout
  activity changes no value. A failed Refresh keeps the previous chart, its
  check time and a readable error.
- **Tier restriction:** "A response at a speed tier the tariff does not price
  stays unpriced rather than priced at standard rates". A rollout with no
  recorded tier is priced at the standard rate. Competing evidence stays
  inspectable and is never added together (`dashboard/USAGE-HISTORY.md`).
- **Launch workflow** cohorts. Execution, Refinement and Ad hoc select the
  same tasks whether a task's stored workflow is a workflow id or, for a
  recovered task, its skill.
- **Pages.** Pages are immutable and a manifest is published atomically.
  ADR 0008 holds: no database.

## Existing solutions and direction

- **Canonical row form.** Reads already yield every row in the schema's field
  order, through `parseValue` in `dashboard/server/usageSnapshot.ts`. Make it
  the one stored form. A reconciled row is serialized in the same order as a
  row carried through unreconciled. Prefer building the reconciled observation
  in schema order over a second schema parse per written row: the importer
  writes about 514,000 responses. The slice's spec guards the order against
  later schema edits.
- **Tier acquisition** extends the existing rule that "only identical raw
  evidence can acquire previously absent metadata" in `reconcileMeasurements`.
  A measurement that lacks `serviceTier` can acquire it from otherwise
  identical evidence, as `completion` already does. Two different recorded
  tiers stay competing measurements.
- **Launch workflow precedence** follows `launchedAt` in `mergeUsageTask`.
  Launch evidence decides a launch task's workflow, and recovered evidence fills
  it only when the launch has none. `taskClaims` already normalizes both
  spellings for conflict detection, and `launchWorkflowOf` still maps a
  recovered task's skill.
- **Import check time.** `usage-check.json` is written after a Refresh's store
  write (`dashboard/server/usageRefresh.ts`). A manifest modified later than
  that record therefore means another writer published after the Refresh, and
  so far that writer can only be the importer. The record format needs no
  change, and records written by the plan 627 code keep working.
- **No PFE gap:** every change lands in an existing responsibility. No North
  Star topic is warranted.

## Decisive premises and observations

The scratch observations were made on 2026-11-15 in this worktree at
`8c8d35d4b`, with Node 24.21.0 at a machine load of about 17. Each scratch spec
ran through the slice's own runner and config:
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node node_modules/playwright/cli.js test --config dashboard/backend.playwright.config.ts <scratch spec> --reporter=list`,
or `dashboard/frontend.playwright.config.ts` for the frontend spec. The
scratch backend specs reused the setup of
`dashboard/backend-tests/usage-history/token-index-refresh.spec.ts`: a boundary
server, `runImport`, and `nativeFile` with `settingsApplied`. Every scratch spec
was removed before the records were written.

| Consuming operation / premise | Observation and limits |
| --- | --- |
| Slice 1: alternating writes over unchanged evidence change the manifest | Two launches were imported, and one rollout was aged past the Refresh cutoff. The steps were Refresh, Refresh, import, Refresh, import. The manifest changed at the first Refresh (2 new pages), stayed the same at the second, then changed at every later import and Refresh. Those steps added no new page file because the content-addressed pages of earlier steps were reused. In this small fixture, "no new page file" alone does not detect the flip, so the proof asserts identical manifest bytes as well. The mechanism comes from reading the code plus one observation: zod 4.6.7 `parse` returns schema key order (`{c,b,a}` → `{"a","b","c"}`). |
| Slice 1: a tier-only reread adds a competing measurement | A rollout was imported without `thread_settings_applied`, then rewritten with `service_tier: "default"`. The next Refresh changed the manifest (1 page) and left 2 measurements, with settings tier `default` and no gap. Later Refreshes and an import left it unchanged. |
| Slice 1: a response whose recorded tiers differ is priced at the standard rate today | A rollout was imported with tier `default`, then reread with `fast`. Result: 2 measurements, a `contradictory-observed-settings` gap, no observation tier, and the task plotted at index 4,900 with 0 unpriced. The summary takes the tier from `settings.serviceTier ?? null` (`dashboard/server/usageTaskSummary.ts`), so the competing response is priced as unrecorded, at standard. That contradicts the story's tier restriction, so slice 1 closes it. |
| Slice 2: the import and Refresh flip a launch task's workflow | A launch's rollout had a `$dough-execute-plan` directive and its cwd in the configured project. The workflow went import `dough-execute-plan` → Refresh `execution` → import `dough-execute-plan` → Refresh `execution`, and the manifest changed at each step. The real-store counts (370) are from the retrospective's clone run. |
| Slice 2: an existing assertion depends on the importer's precedence | `dashboard/backend-tests/usage-history/recovered-corroboration.spec.ts` expects a retained Claude launch joined to its recovered task to store `workflow: "dough-execute-plan"`, and that launch is `.executing`. Under the planned precedence it stores `execution`. Slice 2 changes that expectation deliberately. To find every consumer, the launch-first precedence was applied as a scratch edit to `mergeUsageTask`, the whole `dashboard/backend-tests/usage-history` family was run on the backend config, and the edit was reverted. Result: 57 passed and 1 failed. The failure was exactly that assertion (`workflow` expected `dough-execute-plan`, received `execution`). The fixture store in `e2e/configuration` writes launch tasks with workflow ids, so it is not a consumer of this precedence. |
| Slice 3: Checked hides a later import | Steps: import, Refresh (`02:49:10.084Z`), then an import with a new finished launch (manifest `02:49:10.819Z`). The chart showed 2 points and `checkedAt` stayed at the Refresh time. |
| Slice 4: a filter change ends checking during Refresh | A frontend spec served routed answers and held the refresh POST. After Refresh, choosing Refinement re-enabled Refresh within 3 s, and no checking note was left while the POST was still held. |
| Real-store observation (slice 2) | Slice 2 uses the method recorded in plan 627's slice-5 Learnings: an APFS clone of the store and launch records, with the real `~/.codex` read in place. It is unpaid and read-only toward the real store. Nothing has been observed for it yet, and it is that slice's proof, not a premise. |

## Outside-in proof ownership

- **Backend** (`dashboard/backend-tests/usage-history/`). A new sibling spec
  for repeated writes covers slices 1 and 2, and another covers the check time
  (slice 3). `token-index-refresh.spec.ts` is at 249 lines, so the Refresh
  helpers it defines move to a shared usage-history support module when a
  second spec needs them: `configureOpenDough`, `finished`, `rootRows` and
  `usageServer`. Resolve the module's convention through
  [`dough-makeme`](../../../.agents/skills/dough-makeme/SKILL.md). The
  observable result is page files and manifest bytes after each write, plus
  stored values and the chart answer. Per the
  [test automation instructions](../../../AGENTS.md#test-automation), assert
  no copied constants and no internal call counts.
- **Frontend** (`dashboard/frontend-tests/`). Slice 4 uses routed answers and a
  held Refresh request, through the Usage page object
  `dashboard/tests/support/systemSettingsUsagePage.ts`, resolved through
  [`dough-page-objects`](../../../.agents/skills/dough-page-objects/SKILL.md).
- **Integrated journeys** (`e2e/configuration/system-settings-usage*.spec.ts`).
  These are consumers of the fixture fix in slice 2 and must keep passing. No
  journey is added.

## Ordered slices

### 1. Rewriting unchanged responses publishes no new page
Type: Behavior
Status: planned
Proof: new backend spec for repeated usage writes. (a) Store two launches'
rollouts with an import, one of them older than the Refresh cutoff. Then
Refresh, Refresh, import, Refresh. Every step after the first import publishes
no new page file and leaves the manifest bytes identical. (b) Import a rollout
with no recorded tier, then reread it with `service_tier: "default"`. The first
Refresh leaves that response with one measurement whose tier is `default`. Each
later Refresh or import publishes nothing new and keeps the manifest
identical. (c) Import a response with tier `default`, then reread it as `fast`.
It keeps both measurements, and its task has no point and counts as unpriced.
Each case fails on `8c8d35d4` (see premises). Also run the existing
`backend-tests/usage-history` family and the Refresh spec, whose "no value
changes" assertions must still hold.

Behavior: a usage store written once over some native evidence → a Refresh or
import rereads all or part of that evidence → no page file is added, the
manifest is byte-identical, every stored value is unchanged, and a tier the
reread is first to record is kept on the existing measurement. A response with
two different recorded tiers stays competing evidence and leaves its task
unpriced. Update `dashboard/USAGE-HISTORY.md` beside the completion-metadata
enrichment rule: a rescan also records a missing tier, and a write over
unchanged evidence republishes nothing.

### 2. A launch task keeps its launch workflow across import and Refresh
Type: Behavior
Status: planned
Proof: the repeated-writes spec gains a launch whose rollout invoked
`$dough-execute-plan` from the configured project, so the importer recovers its
skill. Import, Refresh, import, Refresh: the stored task's workflow is
`execution` after each step, and every step after the first import publishes
no new page file and leaves the manifest identical. A second case covers the
production shape: a store that already holds the launch task with workflow
`dough-execute-plan`. The first write normalizes it to `execution` and the next
write publishes nothing new. In both, the chart places the task in the
Execution cohort. Update the expectation in `recovered-corroboration.spec.ts` to
`execution` (see premises). The fixture's recovered tasks record their own
workflow's skill, and the existing `e2e/configuration/system-settings-usage*`
journeys pass. Real-store observation on an APFS clone, following plan 627's
slice-5 method: after one normalizing Refresh, a second Refresh with no new
rollout activity adds no page file and leaves the manifest unchanged. Record
the page counts and duration in Learnings.

Behavior: a launch task whose rollout also yields a recovered task → the
importer and Refresh write it in turn → its stored workflow is the launch
record's, recovered evidence supplies one only when the launch has none, and
repeated writes publish nothing new. Make the comment on `launchWorkflowOf`
accurate. In `e2e/configuration/usageFixtureStore.ts`, a recovered task records
`launchWorkflows[workflow].skill`.

### 3. Checked shows an import that wrote after the last Refresh
Type: Behavior
Status: planned
Proof: new backend boundary spec for the check time, using the shared Refresh
helpers. After import and Refresh, the chart's `checkedAt` is the Refresh's.
An import that adds a finished launch then writes the store, and the chart's
`checkedAt` becomes the manifest's modification time, later than the Refresh.
A further Refresh shows its own time again. A Refresh that changed nothing still
reports its own time, so the existing assertions in `token-index-refresh.spec.ts`
hold. The page already shows `checkedAt` through the refresh journey's
`showsCheckedAt`, so no journey is added.

Behavior: the last check is the later of two times: the recorded Refresh check,
and the importer's write when the manifest is newer than `usage-check.json`.
A Refresh's own store write never moves "Checked" past the time that Refresh
recorded. Refresh's cutoff is unchanged. Update the header comment of
`dashboard/server/usageCheck.ts` and the Refresh sentence in
`dashboard/USAGE-HISTORY.md`.

### 4. The checking indication lasts until the Refresh ends
Type: Behavior
Status: planned
Proof: new frontend spec for Usage checking, with routed Token index answers and
a held `POST /__usage/refresh`. Steps: press Refresh, choose another launch
workflow, and wait until that cohort's answer has rendered. The checking note
is still shown and Refresh is still disabled (`showsChecking`). Releasing the
Refresh then reads the cohort again and ends checking (`showsChecked`). A held
Refresh that fails ends checking with its error. Assert only after the chosen
cohort's read has settled in the page, waiting on an observable event, never
on time. The planning scratch showed the old behavior ending checking within
3 s, so confirm that the spec fails against the old `.finally`.

Behavior: while a Refresh runs → Terry changes a filter → the chosen cohort
loads, the checking note shows with it and Refresh stays disabled, until the
Refresh's own reread settles or the Refresh fails.

## Current decisions

- Execute in Story Branch Mode. No slice acts from trunk.
- "Same evidence publishes nothing" is observed as page-file names and manifest
  bytes. Page-file names alone cannot show a flip when earlier pages are reused.
- Canonical stored row form is the schema field order. Launch evidence decides
  a launch task's workflow. Recovered-only tasks keep their skill name.
- Test placement follows plan 627: backend variants in sibling specs under
  `dashboard/backend-tests/usage-history/`, presentation with controlled
  answers in `dashboard/frontend-tests/`, and no new spec in the interim
  `dashboard/tests/` group.

## Learnings

None yet.

## Verification, sizing and concern review

- Local gate: each slice's touched specs and their consumers, using
  `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node node_modules/playwright/cli.js test --config <config> <paths> --reporter=list`.
  - Slices 1–3: `dashboard/backend.playwright.config.ts` with the whole
    `dashboard/backend-tests/usage-history` family, because they change
    reconciliation, task merging or the check time, which every usage-history
    spec consumes.
  - Slice 2: also `e2e/playwright.config.ts` with
    `e2e/configuration/system-settings-usage*.spec.ts` for the fixture change.
  - Slice 4: `dashboard/frontend.playwright.config.ts` with the new spec and
    `dashboard/frontend-tests/system-settings-usage-average.spec.ts`.
  - Every slice: `npm run lint` and `npm run typecheck:dashboard`.
  - A fresh worktree needs `node scripts/setup-native.mjs npm` and `browser`
    first.
  - No whole local suite is required. Hosted CI runs the full suites after
    publication.
- Long local runs follow the maintained
  [macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
  on AC use `caffeinate -s -i`; on battery plug in, or run awake with the lid
  open under `caffeinate -i` and read the sleep log afterwards.
- Failure policy: [Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
  applies as written, including local/CI differences and owned CI repair.
- File size: every expected edit is under 250 lines. The largest are
  `usageSnapshotReconciliation.ts` (220) and `token-index-refresh.spec.ts`
  (249). The spec is not extended; its helpers move out, which shortens it.
  New proof goes in new sibling specs.
- Cumulative design: one rule, the stored form of unchanged evidence, applies
  to observation rows (slice 1) and task rows (slice 2). Slice 1 extends the
  existing metadata-acquisition rule and adds no recognizer. Slices 3 and 4 are
  independent freshness corrections, each with its own proof loop. Nothing is
  built for page reclamation or partition skipping.
- Refinement: not needed. There are four Behavior slices, each with one
  outcome and one proof loop, and no hidden preparation. The helper move happens
  inside slice 1, where a second spec first needs it.
- Remaining slice-specific concerns: none identified. Slice 1 is the largest,
  with three cases in one rule. If it overruns, the competing-tier pricing case
  (c) can become its own Behavior slice right after it.
