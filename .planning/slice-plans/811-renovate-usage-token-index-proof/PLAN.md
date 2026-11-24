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
observed result. For the matched family measurements use
`npm run test:dashboard:backend -- 'usage-history/token-index[^/]*\.spec\.ts$' --workers=2`
with a proof record. Playwright matches absolute paths, so the original bare
`token-index` filter matches the worktree name and selects other backend specs.
That run was stopped. The filename-anchored baseline at `3969b5307` passed all
58 first attempts across 19 files on AC macOS with Node 24.21.0 at two
workers. It took 58.70 s elapsed and 107.479 s summed case time. The
checkout-bound evidence directory retains `baseline.json` and the command
and terminal result in `baseline.log.run.json`. Use the same conditions
in the final measurement. Repeated assertions about attribution belong
with the narrowest operation that demonstrates each distinct case.

## Execution context

- Story Branch Mode, `codex/prove-token-index-reads-and-refreshes-through-ty`.
  Established claim `3969b53078464221a79fe2e82ebd1e4d803e9b30` on
  `origin/main` and the story branch, from `038abcb59dafba765e072468091d95802c5e1c36`.
- Codex observer for `terryyin/open-dough`, workflow `ci.yml`, story branch,
  coordinator `honoka-811-dfd89717`, directory `/tmp/dough-ci-501/watch-sDxS8N`,
  PID 77876, shell session 16385, cell `g130:15`.

## Ordered slices

Each stem below is a file in `dashboard/backend-tests/usage-history/`.
Record where each former purpose survives. Run the relevant file selection
through the maintained backend command at each slice.

### 1. The chart reads configured usage and refuses invalid requests

Type: Behavior
Status: done

Convert `token-index` and `token-index-period`. Call the typed read with
configured projects including a hidden project, retained task state and a
real summary derivation when missing or stale summary behavior is the
topic. Keep one proof through production cache composition of rebuilding
without changing usage store bytes. Assert priced chart values, calendar
filtering after historical rolling median, and production defaults.
Pass typed invalid tool/workflow and incomplete or malformed period inputs
to request admission and assert refusal with no store read. Check the GET
adapter and frontend reader contract if the binding changes.

The former chart and period cases now run in their original files
through `readTokenIndex` and `tokenIndexAnswer`. The configured-project case
reads a retained end for a hidden project's worker-bearing task and asserts
default cohort, rates and check time. The real stale-cache case observes
updated chart and cache bytes with unchanged usage bytes. Bypassing the
digest check returned the stale task and failed that case. The two Vitest
specs passed nine cases. The existing `system-settings-usage.spec.ts` E2E
passed the real chart and refresh journeys, and the frontend
`system-settings-usage-source.spec.ts` passed three reader cases. Dashboard
typecheck passed. Retained records use the `slice-1-` prefix in checkout
evidence.

### 2. Cohorts and medians include only eligible tasks

Type: Behavior
Status: done

Convert `token-index-cohort`, `token-index-eligibility` and
`token-index-large-average` at `tokenIndexCohort` with MakeMe usage
summaries, tariff and requested cohort. Observe model and effort filtering,
tie and unknown handling, measured zero, dated/tied ordering, estimated and
unpriced exclusions and the large outlier's effect on median versus average.
Retain production derivation only in proofs that need it.

The original three specs now call `tokenIndexCohort` on Vitest. The
selection and median assertions preserve root response counts, ties,
recovered workflow options, estimated and unpriced exclusions, measured
zero, date and ID ordering, and the 65-million outlier. The four partial
conditions in the rolling-window case still arise from deriving the
summary from a real usage document. All seven cases passed before and
after, with summed case time falling from 887 ms to 90.05 ms. The slowest
Vitest case took 62.12 ms. Checkout evidence uses the `slice-2-` prefix.

### 3. Claude and Codex pricing retains task and model distinctions

Type: Behavior
Status: done

Convert `token-index-claude`, `token-index-claude-population` and
`token-index-estimate-family`. Pass typed task evidence, retained launch
state and the relevant tariff versions. Observe the effect of cache-write
classes and speed, independent worker rates, current and estimated families,
reweighing without changing counters, and the eligibility of completed,
recovered and running launches. Keep a single representative cross-tool
read so Claude evidence cannot leak into Codex's answer.

The three specs retain all 15 cases on Vitest. Typed reads check model
family substitution before and after a tariff update, the tenth task's
median admission, model filters and cross-tool pricing. The cache-write
lifetime case still derives counters from stored responses, and the
population case reads archived and operational launch state to distinguish
Done-marked, recovered and running launches. The before and after
selections both passed. Summed case time fell from 3,497 ms to 249 ms.
Checkout evidence uses the `slice-3-` prefix.

### 4. Retained launch evidence determines measured and provisional detail

Type: Behavior
Status: done

Convert `token-index-detail`, `token-index-provisional` and
`token-index-claude-coverage`. Pass retained launch ends, reports, check
time and summary contribution gaps through the read. Observe task-specific
outcomes, provisional and partial reasons, and whether a task enters the
median. For the case about a later refresh, drive the production importer
and read the updated check time and result. Keep the contrast between a
missing transcript and an existing background-work limit.

The original three specs pass seven cases on Vitest. The detail and
coverage cases use retained records and derived usage to preserve the
report, Done, archived history, missing-root, missing-worker and
background-limit distinctions. The provisional cases vary the selected
launch end and check time. The real incremental refresh reads new Claude
reply rows at a controlled time, checks the persisted timestamp, and
moves the median from 1,950 to 3,425. Summed case time fell from
7,756 ms to 197.04 ms. The slowest case took 88.33 ms in the final focused
run. Checkout evidence uses the `slice-4-` prefix.

### 5. Codex reply evidence is attributed once to its launch

Type: Behavior
Status: done

Convert `token-index-developer-reply-codex` and
`token-index-refresh-developer-reply-codex`. Feed the existing import and
refresh paths Codex rollouts and retained launch identities from MakeMe.
Observe late replies and workers attributed once, host-injected context,
and compaction before turn context. Check where a later typed launch
begins its own attribution. Consolidate matching observations only when
an initial-import or incremental case already catches the same regression.

The original two specs pass six cases through real private rollouts and
typed import or refresh. The host-context case reads stable response IDs
from the export. The compaction case uses different models across turns.
Explicit file times distinguish an older parent reached through its late
worker. A later typed turn stays out of the original launch before and
after it begins contributing to its own kept launch. Summed case time
fell from 12,079 ms to 400.80 ms. Checkout evidence uses the
`slice-5-` prefix.

### 6. Claude reply evidence is attributed once to its launch

Type: Behavior
Status: done

Convert `token-index-developer-reply` and
`token-index-refresh-developer-reply` through the same import and refresh
paths with Claude native entries. Observe root and worker replies after
completion remain tied to their launch. Keep the distinct handoffs where
a later workflow marker or reporting context owns subsequent turns.
Use stable response IDs to observe that repeated imports do not count
the same response twice.

The two original Claude reply specs pass eight cases on Vitest. Typed
import and refresh keep root and worker replies attributed after
completion and preserve both workflow-marker forms and the distinct
reporting-context handoff. Repeated typed reads of stable response IDs
preserve exact owners and totals, including an older root reached by its
late worker. The remaining shared fixture supplies only launch and
transcript data. Summed case time fell from 17,638 ms to 1,193.02 ms.
Checkout evidence uses the `slice-6-` prefix.

### 7. Refresh updates contributions and preserves the last answer on failure

Type: Behavior
Status: done

Convert `token-index-refresh` and `token-index-refresh-claude`.
Use isolated original and changed transcripts with
`refreshUsageHistory`, and `refreshUsage` where concurrent presses
coalescing is the topic. Observe totals after a repeated refresh,
unrelated sessions excluded, older worker data imported, and running data
replaced once the transcript grows. An unreadable store returns a failed
refresh and preserves the prior summary and check time. Observe the actual
bytes and the next read instead of assuming an exception preserved them.

Both original specs use typed import, refresh and chart reads. The five
Vitest cases preserve the older-worker and unrelated-session checks,
unchanged bytes on repeat, and replacement of a running launch's
contribution. The concurrent and unreadable cases enter through
`refreshUsage` and retain real child and cache composition. Bypassing
single-flight failed the promise identity assertion. The original code
was restored, and all five cases passed. The failure case checks the
malformed store and prior summary and check bytes, then rereads the
restored healthy store. Summed case time fell from 10,778 ms for four
cases to 881.05 ms for five. Checkout evidence uses the `slice-7-` prefix.

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
