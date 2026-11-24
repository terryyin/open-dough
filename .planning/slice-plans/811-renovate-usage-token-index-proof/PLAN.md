# Prove Token Index reads and refreshes through typed backend handlers

**Identity:** SEED-413#renovate-usage-token-index-proof
**Source:** [Token Index story](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-usage-token-index-proof)

## Goal and scope

Give maintainers fast feedback on the same Token Index and refresh results
the Dashboard serves. Convert the 19 backend `usage-history/token-index*.spec.ts`
files as one family. Preserve chart read, query admission, attribution,
manual refresh and recovery. Other usage import and effort reports stay
with the remaining campaign. Apply the [campaign criteria](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-later-dashboard-backend-unit-test-families)
and aim for about 100 ms per unit case or faster.

## Current decisions

- Follow the North Star for [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [Vitest and E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Apply [ADR 0002 on direct mapping and feedback](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
  [ADR 0008 on the Dashboard's ownership of local operational state](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  and [ADR 0010 on comparative evidence](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
- Extract the typed read from `usageBoundary.ts` with the existing shared
  `TokenIndexAnswer`, `requestedCohort` and `requestedUsagePeriod` contracts.
  Give it the existing summary, configured projects, launch end evidence,
  tariff and check time. Move only needed admission to a typed method/query
  entry. Keep origin, status mapping, default machine paths and route
  dispatch with the adapter. Reuse `tokenIndexCohort` and `deriveUsageTaskSummary`;
  keep cache and single-flight behavior in their current production owners.
- Use `refreshUsageHistory` with private native transcripts, explicit clock
  and usage documents for importer behavior. Keep `refreshUsage` as the
  Dashboard's process and coalescing owner. Exercise coalescing through that
  entry where it distinguishes the result. A real child is justified only
  when child behavior is itself the observation. Trace shared cache and
  refresh consumers before changing their bindings.
- Follow [Dough MakeMe](../../../.agents/skills/dough-makeme/SKILL.md).
  Reuse configured projects, launches, usage batches and native rollout
  builders. Compose preconditions as data. Read back real documents in
  cases about writes, byte preservation, cache rebuild and freshness.
  Keep the existing suite-local proof only where it observes the topic.
  Remove obsolete `tokenIndexHarness.ts` mechanics when their last
  consumers move. Apply the [file-size check](../../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#file-size)
  if adding the typed admission grows the production file.

## Decisive premises and baseline

At `177084da6`, the backend group's engine classifier selects all 19
`token-index*.spec.ts` files on Playwright. The old harness has two actual
paths: `readCohort` writes and derives a summary before calling
`tokenIndexCohort`, and `usageServer` mounts HTTP for chart reads and
Refresh. Production GET uses `currentUsageTaskSummary`,
`retainedLaunchEnds` and `lastUsageCheck`. POST calls `refreshUsage`,
which shares a child run per store before rebuilding the summary. Use the
already-exported importer for data behavior and hold the child and cache
contract at their production owner.

The preparation baseline ran this cohort alongside the other new cohort on
AC macOS with Node 24.21.0 at two workers. The combined run passed all 92
cases on their first attempts across 29 files and took 100.11 s elapsed.
The 19 Token Index files supplied 58 cases and 113.876 s summed case time. Treat the
summed case time as a planning baseline. Measure standalone cohort elapsed
before edits and retain the per-case proof record for comparison.

```sh
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR \
  OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$proof_dir/proof.json" \
  /usr/bin/time -p npm run test:dashboard:backend -- \
  landed-ci-attempt-start landed-ci-proof- landed-ci-reader-restart \
  landed-ci-follow-up-reading intent-ci-proof-read ci-proof-extraction \
  ci-time-without token-index --workers=2
```

Before editing each selection, run its existing cases and establish the
observed result. For the family baseline use
`npm run test:dashboard:backend -- token-index --workers=2` with a proof
record. Use the same conditions in the final measurement. Repeated
assertions about attribution belong with the narrowest operation that
demonstrates each distinct case.

## Slices and outside-in proof

Each stem below is a file in `dashboard/backend-tests/usage-history/`.
Record where each former purpose survives. Run the relevant file selection
through the maintained backend command at each slice.

### 1. The chart reads configured usage and refuses invalid requests

Type: Behavior
Status: planned

Convert `token-index` and `token-index-period`. Call the typed read with
configured projects including a hidden project, retained task state and a
real summary derivation when missing or stale summary behavior is the
topic. Keep one proof through production cache composition of rebuilding
without changing usage store bytes. Assert priced chart values, calendar
filtering after historical rolling median, and production defaults.
Pass typed invalid tool/workflow and incomplete or malformed period inputs
to request admission and assert refusal with no store read. Check the GET
adapter and frontend reader contract if the binding changes.

### 2. Cohorts and medians include only eligible tasks

Type: Behavior
Status: planned

Convert `token-index-cohort`, `token-index-eligibility` and
`token-index-large-average` at `tokenIndexCohort` with MakeMe usage
summaries, tariff and requested cohort. Observe model and effort filtering,
tie and unknown handling, measured zero, dated/tied ordering, estimated and
unpriced exclusions and the large outlier's effect on median versus average.
Retain production derivation only in proofs that need it.

### 3. Claude and Codex pricing retains task and model distinctions

Type: Behavior
Status: planned

Convert `token-index-claude`, `token-index-claude-population` and
`token-index-estimate-family`. Pass typed task evidence, retained launch
state and the relevant tariff versions. Observe the effect of cache-write
classes and speed, independent worker rates, current and estimated families,
reweighing without changing counters, and the eligibility of completed,
recovered and running launches. Keep a single representative cross-tool
read so Claude evidence cannot leak into Codex's answer.

### 4. Retained launch evidence determines measured and provisional detail

Type: Behavior
Status: planned

Convert `token-index-detail`, `token-index-provisional` and
`token-index-claude-coverage`. Pass retained launch ends, reports, check
time and summary contribution gaps through the read. Observe task-specific
outcomes, provisional and partial reasons, and whether a task enters the
median. For the case about a later refresh, drive the production importer
and read the updated check time and result. Keep the contrast between a
missing transcript and an existing background-work limit.

### 5. Codex reply evidence is attributed once to its launch

Type: Behavior
Status: planned

Convert `token-index-developer-reply-codex` and
`token-index-refresh-developer-reply-codex`. Feed the existing import and
refresh paths Codex rollouts and retained launch identities from MakeMe.
Observe late replies and workers attributed once, host-injected context,
and compaction before turn context. Check where a later typed launch
begins its own attribution. Consolidate matching observations only when
an initial-import or incremental case already catches the same regression.

### 6. Claude reply evidence is attributed once to its launch

Type: Behavior
Status: planned

Convert `token-index-developer-reply` and
`token-index-refresh-developer-reply` through the same import and refresh
paths with Claude native entries. Observe root and worker replies after
completion remain tied to their launch. Keep the distinct handoffs where
a later workflow marker or reporting context owns subsequent turns.
Use stable response IDs to observe that repeated imports do not count
the same response twice.

### 7. Refresh updates contributions and preserves the last answer on failure

Type: Behavior
Status: planned

Convert `token-index-refresh` and `token-index-refresh-claude`.
Use isolated original and changed transcripts with
`refreshUsageHistory`, and `refreshUsage` where concurrent presses
coalescing is the topic. Observe totals after a repeated refresh,
unrelated sessions excluded, older worker data imported, and running data
replaced once the transcript grows. An unreadable store returns a failed
refresh and preserves the prior summary and check time. Observe the actual
bytes and the next read instead of assuming an exception preserved them.

### 8. Refresh clears the evidence gaps it resolves and the cohort runs on Vitest

Type: Behavior
Status: planned

Convert `token-index-refresh-claude-gaps` and
`token-index-refresh-line-separators`. Trigger successive imports with
explicit check time and native transcript rows. Observe a missing root
response become measured, a worker becoming available while its own
descendant stays missing, and row parsing through embedded separators.
Give each independent condition a distinguishing case, retaining the
combined case when a remaining gap changes the final classification.

Compare matched before/after runs of the full cohort. Record every case
duration against the target, file and case counts, command elapsed and
summed case time. Account for proof moved elsewhere. Inspect slow cases
for avoidable process and file work, and explain each retained material
cost. Verify all 19 original files have a disposition, cases enter
production through typed values, and the cohort needs neither Playwright
nor a mounted server. Remove unused harness code after tracing consumers.

## Concern evidence

A separate refinement pass was unnecessary after grouping the reply
proofs by native host within the eight-slice limit. The slices reuse one
read and one refresh operation. Grouping is by
what changes the answer, so overlapping setup and assertions move together.
Both reply slices reuse the earlier read/import seams and each has a separate
assertion only for each attribution distinction. No remaining scope
decision was identified.

## Verification and delivery

- Local gate: use the maintained [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  with `caffeinate -s -i` on AC power for measured runs. Keep the default
  timeout and apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Run `npm run test:dashboard:backend -- <exact files> --workers=2` for each
  slice. Capture `OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD`.
  Run Dashboard typecheck, lint and matched consumer checks for changed
  contracts. Use the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  through usage files, native import, route and frontend readers.
  Where coalescing or rebuilding matters, confirm a representative wrong
  outcome fails the retained assertion. Follow normal refactor and hosted CI gates.
