---
id: SEED-115
status: active
planted: 2026-10-06
planted_during: Terry's request to investigate the unexplained cancelled dashboard CI run
trigger_when: Dashboard CI reports failures before cancellation without a demonstrated cause
scope: unknown
---

# SEED-115: Explain cancelled dashboard CI failures

## Why This Matters

A maintainer needs to distinguish a remaining defect from failures already
repaired when deciding whether dashboard CI needs further work. Run
37420000326, attempt 1, on `9baca4db8d9509dd20d6ba8869202eb641836c4b`
reported thirteen test failures before its six-minute job limit. The preceding
execution did not establish their cause. Its shard trace upload was skipped,
and later passing runs establish current proof without explaining this run.

## Story Decomposition

<a id="explain-cancelled-ci-failures"></a>

### Determine whether the cancelled dashboard CI failures need repair

**Identity:** SEED-115#explain-cancelled-ci-failures
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless","assessment":"ready","reasons":[],"basis":{"document":"1b4df730a336bbc74ca5c41c2a92eb41b89d7d9a47ca3f3cab53ef7717c73212"}}
```

**Goal:** Establish whether the cancelled run leaves worthwhile repair work,
then repair the confirmed partial-setup cleanup crash in the acceptance-kept-first
test harness. Preserve the primary startup error and release resources acquired
before setup failed.

**Expected behavior:** Dashboard tests provide reliable feedback about the
promised behavior. A test failure is explained by a demonstrated product or
test defect, an already demonstrated repair, or affirmative infrastructure
evidence; cancellation alone establishes none of these.

**Observed behavior:** Run 37420000326, attempt 1, was cancelled after a job
reached its six-minute limit. Thirteen preceding failures remain unexplained
in the closed execution's evidence.

**Scope:** Diagnosis is complete. Terry authorized Dough Bug Fixing on
2026-10-06: one planless repair attempt with a ten-minute hard limit and
`--no-replan`, focused on the demonstrated cleanup defect. Preserve the primary
setup error, clean the acquired fixture, and avoid secondary uninitialized-resource
errors. CI diagnostic retention and the thirteen unclassified primary causes
remain follow-up work; they are not promises of this bounded repair. No execution
guidance changes or speculative timeout/concurrency changes are authorized.

**Key examples:** An affected test whose original failure is reproduced and
removed by an existing repair is accounted for by that proof. A mismatch
reproduced on current code establishes remaining work. Missing historical
evidence remains explicit rather than being cleared by a green rerun.

**Evaluation:** The diagnosis below accounts for each failure and its remaining
evidence gap. Reproduce failed preview setup through the real test runner before
repair, then observe the same primary error with its acquired fixture removed
and without a secondary cleanup crash. Verify the related acceptance journey
and complete independent shared refactoring. Avoid a full dashboard-suite rerun.

**Open decisions:** None blocks the confirmed cleanup repair. The remaining
CI diagnostics design and historical primary causes need separate follow-up.

**Depends on:** No blocking story prerequisite. Preserve the active observer
sharing story and its checkout.

#### Investigation result — 2026-10-06

**Assessment:** A small test-harness repair is worth doing. Failed preview
setup causes the acceptance-kept-first spec's teardown to dereference an
uninitialized push hold, adding a second error and skipping its remaining
cleanup. CI also loses the completed tests' diagnostics when this job hits its
deadline. No remaining dashboard product defect or common cause of the thirteen
primary failures has been demonstrated.

**Investigation baseline:** `5485db8bf7bfc3ce829bcacea4a05ff4f24445ef`
(admission only; product code from `7bf4f5e5bd4a83fccad4fbf0253ec7fb5ba210ea`).
The isolated checkout's locked `npm ci` and `npm run typecheck:dashboard`
completed successfully. All six affected specs then passed in one run with CI
settings and two workers:

```sh
env -u NO_COLOR -u FORCE_COLOR CI=1 npm run test:dashboard -- agent-launch-acceptance-kept-first.spec.ts accessible-overview-keyboard.spec.ts agent-completion-attention.spec.ts agent-launch-card-problems.spec.ts agent-launch-preparation-codex-retry.spec.ts agent-launch-codex-observation.spec.ts --workers=2
```

That run establishes current focused proof, not the cause of historical failures.
No full dashboard-suite rerun or retries until green were used.

**Confirmed partial-setup cleanup defect:** In
`dashboard/tests/agent-launch-acceptance-kept-first.spec.ts`, setup assigns
`server` only after `startDashboardServer` succeeds, then initializes `push`.
Teardown always calls `push.release()`, `server.close()` and `origin.cleanup()`.
When the preview fails, `push.release()` throws before the remaining cleanup.
The original cancelled run records both the preview startup error and
`TypeError: Cannot read properties of undefined (reading 'release')` at this
same teardown.

A disposable copy of the existing spec forced the real spawned preview process
to fail through an external Node preload. With the original teardown, the
runner reported the controlled startup failure and the same secondary
`TypeError` (exit 1). Guarding only incomplete setup in the disposable copy
preserved the startup failure and removed the secondary error (exit 1, expected
because startup was deliberately unavailable). The original test and helper
were unchanged. A first probe had an additional scoping error in its own
cleanup; that harness was corrected before the two accepted observations.

**Proportionate repair:** Ensure this spec releases only resources setup acquired,
and ensure a cleanup error cannot prevent release of its other owned resources.
Observe failure through the test runner, preserving the primary startup error
and removing the fixture. This is a focused harness repair; its reproduction
does not establish why the original preview was slow or failed.

**Confirmed CI diagnostics gap:** The job's GitHub check annotation says
`The job has exceeded the maximum execution time of 6m0s`. This establishes a
deadline cancellation, with no evidence of supersession. Its log names a
retained trace and error context for each completed failing test. The artifact
listing contains reports for shards 2–9 and no report for shard 1. The
workflow's `Keep the Playwright report` step is explicitly skipped under
`if: !cancelled()`, so those existing diagnostics were not uploaded.

Preserving diagnostics from failures completed before the deadline is worthwhile
follow-up. Its design should keep the current bounded job and avoid assuming
that a new condition alone makes upload work after forced job cancellation.
There is no evidence yet supporting a blanket timeout increase or a change to
worker concurrency.

**Individual primary-failure dispositions:** All thirteen remain historically
unclassified. Their six current specs pass. The two previously landed fixes in
`7da9f1533316187860cb318dcac81238a6a538b6` repair relative-geometry observation
and a held-request checkpoint in the new isolation journeys; neither has been
demonstrated to cause or repair these thirteen primary failures.

| Historical case | Observed failure | Remaining evidence needed |
| --- | --- | --- |
| Acceptance kept-first | Preview startup failed; output included its Local URL; secondary cleanup crash is now reproduced | Address arrival versus startup deadline and process state |
| Accessible announcements | Whole-test timeout while awaiting a scheduled revision check | Initial read settlement and page-clock/check timeline |
| Accessible keyboard | Start refinement still focused when Tab was expected to leave the page; whole-test timeout | Complete tab sequence and fact/control arrivals |
| Completion attention | Stored launch count remained zero during a five-second poll | Publication, acceptance, and native-input timeline |
| Card refinement failure | Preview startup failed with empty captured output | Preview exit, output, and address timing |
| Card missing folder | Taken membership had not appeared | Root read and fixture-publication state |
| Card uncertain launch | Three preparation reads were still pending | Initial read completion versus the test's deadline |
| Retry lost workspace | Reconciliation message empty after POST | Accepted attempt's settlement and retained ownership state |
| Codex observation | Whole-test timeout measuring a state label | Journey duration and label visibility at the measurement |
| Retry lost ownership | Reconciliation message absent after POST | Accepted attempt's settlement and retained ownership state |
| Retry lost workspace-and-branch | Start button remained disabled | Accessible gate reason and initial read completion |
| Retry lost allocation | Start button remained disabled | Accessible gate reason and initial read completion |
| Retry lost legacy ownership | Reconciliation message empty after POST | Accepted attempt's settlement and retained ownership state |

Shard 1's npm acquisition took about 25 seconds, compared with roughly 3–6
seconds in the other dashboard jobs; its setup before the browser suite took
about 63 seconds. All other dashboard shards passed. These support a slow-runner
or timing hypothesis, but do not prove resource exhaustion, infrastructure
failure, or a shared cause. `refreshJourney.openAtA` observes membership only;
the current refresh schedule waits for the initial read to settle. That is a
specific synchronization premise to examine in the announcement test, not an
accepted diagnosis from source inspection alone.

**Investigation disposition:** Diagnosis-only authority was honored during
investigation; no repair or guidance change was made. Disposable reproductions
were removed. Terry subsequently requested landing these findings and starting
Dough Bug Fixing. The findings landed at
`a53751f5468350c9033ba84c7f9ea48ae5837626`. The existing Taken claim continues
for the bounded cleanup repair. The original thirteen primary failures have
not been dismissed or marked resolved.

## Breadcrumbs

- [Cancelled CI run](https://github.com/terryyin/open-dough/actions/runs/37420000326).
- [Closed execution evidence](https://github.com/terryyin/open-dough/blob/dc41662d1cc60505be39889aad511122907eb364/.planning/slice-plans/260-available-dashboard-facts/PLAN.md#ci-repair-and-unresolved-verification).
- Landed test-race repair `7da9f1533316187860cb318dcac81238a6a538b6`.
- Terry's request in this conversation, 2026-10-06.
- [Cancelled shard and annotations](https://github.com/terryyin/open-dough/actions/runs/37420000326/job/112127011368).
- Local investigation logs: `/tmp/open-dough-cancelled-ci-run.json`,
  `/tmp/open-dough-cancelled-ci-shard.log`,
  `/tmp/open-dough-cancelled-ci-focused.log`,
  `/tmp/open-dough-cancelled-ci-cleanup-probe-confirmed.log`, and
  `/tmp/open-dough-cancelled-ci-cleanup-probe-guarded.log`.
