# Compare a short manual intent assessment with ordinary review

## Ordinary review (exploratory)

This historical baseline uses the three completed execution retrospectives and
their source reviews that Terry confirmed on 2026-11-07. The findings below
record what ordinary review reported. The [delegated verification](#terry-verification)
records what counted in the comparison. [Confirmed comparison basis](PLAN.md#confirmed-comparison-basis)

### SEED-254#use-later-ci-proof-for-cancelled-landings

- **Story-attributable finding.** On a cancelled landing, the forward walk
  passes a finished build whose proof is unavailable and then meets a running
  build. The running result discards the earlier build's proof reason. Landed
  says no later trunk build has finished yet. The walk test supplied this
  sequence with expired proof and asserted only the running result. The
  correction planned in Plan 497 carries the proof absence into the running
  result and checks the explanation at the walk, slot and browser levels. The
  explanation gives the reason and running status, leaves figures empty and
  allows a fresh read. [Product advice](https://github.com/terryyin/open-dough/blob/8296c54b10b76a6cb654fe565da24a5557bc6025/.planning/slice-plans/496-use-later-ci-proof-for-cancelled-landings/PLAN.md#L202-L209) ·
  [Planned correction](https://github.com/terryyin/open-dough/blob/8296c54b10b76a6cb654fe565da24a5557bc6025/.planning/slice-plans/497-explain-running-after-proofless-later-build/PLAN.md)
- **Pre-existing finding, outside the story-attributable counts.** Ordinary
  review found that a transient listing failure or read deadline can leave an
  unavailable slot cached for the dashboard process's lifetime, so **Check
  again** cannot recover it. Baseline and Branch are also affected, and the
  forward walk adds listing requests. The review recommended treating
  unavailable slots as eligible for a fresh read. The recommendation was
  later queued separately under SEED-118. [Product advice](https://github.com/terryyin/open-dough/blob/8296c54b10b76a6cb654fe565da24a5557bc6025/.planning/slice-plans/496-use-later-ci-proof-for-cancelled-landings/PLAN.md#L210-L216) ·
  [Retry unavailable CI comparison slots](https://github.com/terryyin/open-dough/blob/c6db7ffcdd721e310baeccbb498b068f44f5d729/.planning/seeds/SEED-118-dashboard-reading-reliability.md#retry-unavailable-ci-comparison-slots)
- **Source review.** A fresh reviewer extracted commitments from the seed.
  The acceptance record maps them to proof for landing identity, precedence
  of exact proof, first-parent selection and its bound, Landed's presentation,
  the no-proof explanations and the unaffected comparison paths. Its running
  and unavailable proof examples cover the outcomes individually. Plan 497
  records the combined sequence and the limit of its existing assertion.
  [Source review](https://github.com/terryyin/open-dough/blob/8296c54b10b76a6cb654fe565da24a5557bc6025/.planning/slice-plans/496-use-later-ci-proof-for-cancelled-landings/source-review.md)

### SEED-256#compare-ci-time-without-runner-waits

- **Product advice.** No change or correction planned. The review found the
  observed dependency-chain durations and explanations for missing observations
  consistent with ADR 0008. It credited the browser journeys for endpoint
  selection and display, the focused module cases for job evidence, and reuse
  of the GitHub reader and disposable cache. The proof-cue and adapter stories
  already owned their follow-ups. The process review returned no new finding.
  Branch CI was pending at the review boundary.
  [Execution retrospective](https://github.com/terryyin/open-dough/blob/46d2ea4a40607fb9085ced0bb5087fe4066a0d03/.planning/slice-plans/492-compare-ci-time-without-runner-waits/PLAN.md#L204-L226)
- **Source review.** A fresh reviewer separated completed-attempt job
  observations from the estimate derived on read, and workflow dependencies
  from GitHub timestamps. Carry-over can put a job's creation after its start.
  Jobs finishing before creation can include jobs outside its dependencies.
  Signed differences require both observations on the same measure.
  [Source review and evidence mapping](https://github.com/terryyin/open-dough/blob/46d2ea4a40607fb9085ced0bb5087fe4066a0d03/.planning/slice-plans/492-compare-ci-time-without-runner-waits/source-review.md)

### SEED-257#compare-story-ci-through-adapters

- **Product advice.** No change or correction planned. Both live Pygardon
  stories recovered the intended builds from retained attempts. Pygardon's
  timestamp story settled the wall-time premise, and the comparison reported a
  reason for the one missing proof summary. The review found the code, focused
  proof and live observations consistent with the source contract and ADR 0008.
  The process review recorded a post-push confirmation race as DD-442. Branch
  CI completion was a separate gate.
  [Execution retrospective](https://github.com/terryyin/open-dough/blob/76565b1c29fa2370a868fbe7c97e46bfbd4d95cf/.planning/slice-plans/495-compare-story-ci-through-adapters/PLAN.md#L305-L326)
- **Source review.** A fresh reviewer enumerated endpoint selection and
  first-parent and branch rules, proof and timing via the adapter, named gaps,
  and the live Pygardon examples. The execution record resolved the earlier
  obligations to fetch proof for selected attempts and preserve the adapter
  reason when discovery times out.
  [Source review and evidence mapping](https://github.com/terryyin/open-dough/blob/76565b1c29fa2370a868fbe7c97e46bfbd4d95cf/.planning/slice-plans/495-compare-story-ci-through-adapters/source-review.md) ·
  [Resolved obligations](https://github.com/terryyin/open-dough/blob/76565b1c29fa2370a868fbe7c97e46bfbd4d95cf/.planning/slice-plans/495-compare-story-ci-through-adapters/PLAN.md#L328-L338)

### Ordinary-review effort

Wall-clock time is the coordinator's recorded retrospective span, starting
at the review announcement or skill invocation and ending when the host
returned publication of the review in the execution-complete record. The
completion CI wait and story wrap-up followed. Overlapping agent spans are
reported separately. Active agent time, with waits removed, is unavailable
for all three cases.

| Case | End-to-end wall clock and coordinator span | Overlapping retrospective agent elapsed | Reported test runtime | Terry reading | Terry verification |
| --- | --- | --- | --- | --- | --- |
| SEED-254 | **Measured**, 491.551 s | **Measured**, 291.269 s | **Unavailable** | **Unavailable** (s) | **Unavailable** (s) |
| SEED-256 | **Measured**, 74.560 s | **Unavailable**, no retrospective subagent recorded | **Unavailable** | **Unavailable** (s) | **Unavailable** (s) |
| SEED-257 | **Measured**, 111.719 s | **Unavailable**, no retrospective subagent recorded | **Unavailable** | **Unavailable** (s) | **Unavailable** (s) |

The retrospective intervals have no test-runner duration to attribute. The
source reviews reference test evidence from execution. Total human effort
and any comparative time savings remain undetermined.

#### Timestamp and token evidence

All timestamps are UTC on 2026-11-07. Row numbers are one-based JSONL lines.
Token figures are **measured** host counters within the timestamp boundaries.
Codex input totals include cached input. Claude Code records cache creation and
cache reads separately from uncached input. The counters describe recorded
usage by host and provide no common estimate of billed cost.

| Case and local record | Exact boundaries | Recorded agent tokens |
| --- | --- | --- |
| SEED-254 Claude Code coordinator, session `5d899319-a194-4cb4-8c89-2fdec0d3ad71` | Line 733, retrospective skill invocation at 10:37:17.818Z. Line 1181, publication of `068d13a` returned at 10:45:29.369Z. | 82 uncached input, 59,430 cache creation, 8,985,993 cache read, 21,914 output. |
| SEED-254 Claude Code outcome reviewer, subagent `a714b43c96e842812` | Line 1, initial task at 10:37:35.878Z. Line 293, handback emitted at 10:42:27.147Z. Coordinator line 875 received it at 10:42:27.473Z. | 82 uncached input, 113,422 cache creation, 3,900,405 cache read, 26,229 output. |
| SEED-256 Codex coordinator, session `01a1b4ea-2038-70b0-8f61-e9772c2b11b2` | Line 1082, retrospective announcement at 08:09:42.765Z. Line 1122, publication of `46d2ea4` returned at 08:10:57.325Z. | 1,491,331 input, including 1,471,744 cached, and 2,292 output. |
| SEED-257 Codex coordinator, session `01a1b500-42fb-7a12-bcba-7e8877f49c3b` | Line 1763, retrospective announcement at 09:00:56.814Z. Line 1825, publication of `76565b1` returned at 09:02:48.533Z. | 2,993,551 input, including 2,980,096 cached, and 3,524 output. |

Local evidence is in the Claude Code project directory
`~/.claude/projects/-Users-terryyin-git-open-dough--worktrees-use-a-later-trunk-build-s-ci-proof-for-cancelled/`
and the Codex rollouts under `~/.codex/sessions/2026/11/07/`. The Claude Code
subagent logs are under the coordinator session's `subagents/` directory.
Claude Code sums one usage record per assistant message ID. Codex sums
`token_usage_record.payload.usage` in the respective line interval.

The independent source reviews happened earlier during execution. Their own
elapsed spans are **measured** separately from the retrospective intervals
above.

| Case and local source-review agent | Elapsed | Exact boundaries |
| --- | --- | --- |
| SEED-254 Claude Code subagent `a80a69d7a8e8fc6ae` | 20.545 s | Line 1, initial task at 09:58:02.568Z. Line 19, handback acknowledged at 09:58:23.113Z. |
| SEED-256 Codex session `01a1b4ec-2e03-7e93-9f02-2c1901514ade` | 62.888 s | Line 2, task started at 07:32:19.648Z. Line 22, task completed at 07:33:22.536Z. |
| SEED-257 Codex session `01a1b502-3417-7f10-a638-56f0f5cb2296` | 65.621 s | Line 2, task started at 07:56:23.003Z. Line 20, task completed at 07:57:28.624Z. |

## Terry verification

Terry delegated verification and the pilot decision to the executing agent
with “You look for reasonable ideas and decide by yourself.” This replaces
the timed human review in the basis he confirmed on 2026-11-07. The agent
checked selected excerpts and evidence within the existing 10-minute per-case
ceiling. The cases, source selection, assessment budget, and criteria are
as confirmed. [Confirmed comparison basis](PLAN.md#confirmed-comparison-basis)

The union below preserves each review's reported status. The
[verification record](#verification-record) gives the agent's dispositions.
It separates unchecked claims, source verdicts of unknown or unassessed,
and pre-existing observations. A match requires both reviews to identify
the same specific failure path with evidence that supports a decision.
A consequential miss requires a specific consequential finding verified
in one review and omitted by the other. File references in the assessment
rows are at the case's [checkpoint](PLAN.md#case-checkpoints).

### SEED-254 cancelled landings

[Ordinary retrospective](https://github.com/terryyin/open-dough/blob/8296c54b10b76a6cb654fe565da24a5557bc6025/.planning/slice-plans/496-use-later-ci-proof-for-cancelled-landings/PLAN.md#L202-L216) ·
[Ordinary source review](https://github.com/terryyin/open-dough/blob/8296c54b10b76a6cb654fe565da24a5557bc6025/.planning/slice-plans/496-use-later-ci-proof-for-cancelled-landings/source-review.md) ·
[Assessment verdicts](assessment-254.md#verdicts)

| ID | Source and reported status | Evidence |
| --- | --- | --- |
| 254-01 | Ordinary defect and planned correction. Assessment cites the same fixture for advancement and stopping, and separate browser cases for wording. | In the actual walk fixture, finished run 31 has expired proof, then run 32 is running. The assertions check `running`, run 32 and the listed revisions. Ordinary review says the running result loses the prior proof reason and Landed falsely says no later build has finished. The assessment cites the proofless-only and running-only wording fixtures separately (`intent-ci-comparison-cancelled-landing-gaps.spec.ts:32–83`). [Walk fixture](https://github.com/terryyin/open-dough/blob/1359d6fb76b8ff2b4295e2b4febe0e467ec72be1/tests/support/dashboard-later-trunk-build.test.mjs#L89-L107) · [Plan 497 findings](https://github.com/terryyin/open-dough/blob/8296c54b10b76a6cb654fe565da24a5557bc6025/.planning/slice-plans/497-explain-running-after-proofless-later-build/PLAN.md#L15-L27) |
| 254-02 | Ordinary pre-existing finding, outside counts. | A listing failure or read deadline can cache an `unavailable` slot for the process lifetime. **Check again** cannot recover it. Baseline and Branch are affected too. [Ordinary recommendation](https://github.com/terryyin/open-dough/blob/8296c54b10b76a6cb654fe565da24a5557bc6025/.planning/slice-plans/496-use-later-ci-proof-for-cancelled-landings/PLAN.md#L210-L216) · [SEED-118 retry story](https://github.com/terryyin/open-dough/blob/c6db7ffcdd721e310baeccbb498b068f44f5d729/.planning/seeds/SEED-118-dashboard-reading-reliability.md#retry-unavailable-ci-comparison-slots) |
| 254-03 | Assessment break check for a waiting Landed head gap. | Removing the `none`/`awaitingLaterBuild` cache exception in `intentCiComparisonAnswers.ts:38–42` left the second view stale after a push and serving passing run 403 with proof. The journey failed at `intent-ci-comparison-cancelled-landing-gaps.spec.ts:112` and passed after restoration. [Runner and assertion](assessment-254.md#focused-runs) |
| 254-04 | Assessment gap claim for a selected later rerun. | The later-build journeys check attempt `#1`; the report found no later attempt other than `#1` exercised there. `intent-ci-comparison-cancelled-landing.spec.ts:31,75,129,160`. |
| 254-05 | Assessment gap claim for later-proof entry figures. | The journey checks selected build wall time and artifact listing. The report found no observing assertion on the later-summary entries or counts supplied through `useIntentCiComparisonEntries.ts`. `intent-ci-comparison-cancelled-landing.spec.ts:31,75,129,160`. |
| 254-06 | Assessment gap claim for forward handling and Landed wording across proof errors. | The walk injects expired/unreadable reasons and the shared artifact reader tests expired, unreadable, invalid, and wrong-attempt or wrong-revision proof. The report found no cancelled-Landed journey covering the full matrix. `dashboard-later-trunk-build.test.mjs:89–139`, `intent-ci-proof-reasons.spec.ts:35`. |
| 254-07 | Assessment gap claim for proof-sensitive exact rerun precedence. | A timed exact attempt 2 takes precedence in one fixture; another prefers a timed prior attempt over a cancelled latest. The assessment flags the combination where the prior timed attempt lacks usable proof. Exact lookup disables the proof gate before the cancelled branch. `dashboard-later-trunk-landed.test.mjs:112`, `dashboard-ci-revision-nearest.test.mjs:15`, `baseCiRevisionLookup.ts:152–185`. |
| 254-08 | Assessment gap claim for the literal 30-revision cutoff. | The long fixture derives its history from `baselineAncestorLimit + 1`; the report found no independent +30 versus +31 usable-build assertion. `dashboard-later-trunk-landed.test.mjs:90`, `exactSkippedEquivalent.ts:22`. |
| 254-09 | Assessment gap claim for the all-cancelled or unbuilt outcome. | The report found no assertion on the no-finished-build wording when every revision inside the bound is cancelled or unbuilt. The browser gap fixtures cover absent proof, running, and empty head. `intent-ci-comparison-cancelled-landing-gaps.spec.ts:32–100`. |
| 254-10 | Assessment gap claim for the adapter exclusion. | The adapter tests exercise discovery, ordering, retry and timeout. The report found no cancelled adapter attempt driven through the GitHub-only forward-walk guard. `baseCiRevisionLookup.ts:181–183`, `dashboard-ci-adapter-revision-lookup.test.mjs`. |
| 254-11 | Assessment gap claim for downstream archive requests. | The request assertions filter artifact listings and do not wait for rendered later-proof entry data before checking calls. The report flags direct coverage of archive request counts. `intent-ci-comparison-cancelled-landing.spec.ts:67,120`, `dashboard/GITHUB-REQUESTS.md:67–89`. |
| 254-12 | Assessment observation about push-run wording and an untested competing run. | The request doc says push runs. Lookup queries by SHA without an event/ref filter and selection uses SHA/time. The fixtures supply main pushes, leaving a competing same-SHA manual or other-ref run untested. `dashboard/GITHUB-REQUESTS.md:67–89`, `baseCiGithubRevisionLookup.ts:122–152`, `baseCiNearest.ts:130–148`, `storyCiComparisonFixture.ts:156–161`. |
| 254-13 | Assessment unassessed reread transitions. | The head-gap journey in 254-03 covers a newly pushed proofed build. Browser transitions from running to completed and from proofless at head to new proof were unassessed. [Waiting-answer verdict](assessment-254.md#verdicts) |
| 254-14 | Assessment scope limits. | Hosted examples and live requests, the full comparison family, and the deferred no-run substitution and ignored-revision features were unassessed. The code-landing regression checks the current No build boundary. [Focused-run scope](assessment-254.md#focused-runs) |

### SEED-256 CI time without runner waits

[Ordinary retrospective](https://github.com/terryyin/open-dough/blob/46d2ea4a40607fb9085ced0bb5087fe4066a0d03/.planning/slice-plans/492-compare-ci-time-without-runner-waits/PLAN.md#L204-L226) ·
[Ordinary source review](https://github.com/terryyin/open-dough/blob/46d2ea4a40607fb9085ced0bb5087fe4066a0d03/.planning/slice-plans/492-compare-ci-time-without-runner-waits/source-review.md) ·
[Assessment verdicts](assessment-256.md#promise-verdicts)

| ID | Source and reported status | Evidence |
| --- | --- | --- |
| 256-01 | Ordinary recommendation of no change. | Credits journeys for endpoint selection and display, focused job evidence, and the shared GitHub reader and cache. It found observed dependency-chain durations and explanations of missing observations consistent with ADR 0008. [Product advice](https://github.com/terryyin/open-dough/blob/46d2ea4a40607fb9085ced0bb5087fe4066a0d03/.planning/slice-plans/492-compare-ci-time-without-runner-waits/PLAN.md#L204-L220) |
| 256-02 | Assessment break check for the historical workflow revision. | Reading `HEAD:<path>` instead of the selected build revision in `baseCiGithubRevisionLookup.ts:121` reached the fixture's incompatible `jobs: {}`. Three timing cells showed unreadable job definitions instead of the exact estimates at `intent-ci-comparison.spec.ts:138`. [Break check and restoration](assessment-256.md#selective-workflow-revision-break-check) |
| 256-03 | Assessment gap claim for an unavailable Baseline estimate. | The report flags a possible invented delta against zero. The gap journeys keep Baseline measured and make Landed unavailable. `storyCiComparisonWording.ts:50–54`, `intent-ci-comparison-gaps.spec.ts:101–162`. |
| 256-04 | Assessment gap claim for noncausal framing. | The browser assertion checks for `observedNotAttributed` imported from production. The report says this observes presence while allowing a shared edit to causal wording. `intent-ci-comparison.spec.ts:17,92`, `storyCiComparisonWording.ts:57–58`. |
| 256-05 | Assessment gap claim for cache separation of two attempts of one run. | The Taken refresh changes `102/1` to `103/2`, so the report says a cache key missing attempt could pass. The attempt-2 endpoint and timing assertions cover selection. `baseCiGithubRevisionLookup.ts:86–104`, `intent-ci-comparison-taken.spec.ts:29–121`. |
| 256-06 | Assessment gap claim for transitive chain accumulation. | Successful fixtures use a dashboard shard followed by `ci-proof`. The report says an immediate-predecessor-only calculation could match them. `ciTimeWithoutRunnerWaits.ts:87–104`, `ci-time-without-runner-waits.spec.ts:10–40`. |
| 256-07 | Assessment gap claim for an unresolvable dependency graph. | Existing unavailable examples use missing files, jobs or names. The report found no assertion for an unresolved dependency ID or cycle. `ciTimeWithoutRunnerWaits.ts:87–104`, `ci-time-without-runner-waits.spec.ts:43–77`. |
| 256-08 | Assessment gap claim for skipped jobs after failure. | The estimator cases pass `false` for the failed flag, and the failed-landing journey supplies no skipped job rows and requires no Landed estimate. The special path counts a skipped job with missing bounds as zero. `ciTimeWithoutRunnerWaits.ts:25–35`, `ci-time-without-runner-waits.spec.ts:10–77`, `intent-ci-comparison-landing-gaps.spec.ts:17–48`. |
| 256-09 | Assessment limit on browser evidence for missing job bounds. | The module asserts the missing-bounds reason and the report traces the common UI plumbing. The browser fixtures do not independently serve a row with null start or finish. [Verdicts and limits](assessment-256.md#promise-verdicts) |
| 256-10 | Assessment scope limits. | Deferred critical-job or per-job wait wording, a no-wait Proof-line figure and later visual cues were unassessed. The report records no full suite, live exercise, cache-eviction/retry probe or cross-tool check. [Verdicts and limits](assessment-256.md#promise-verdicts) |

### SEED-257 adapter comparisons

[Ordinary retrospective](https://github.com/terryyin/open-dough/blob/76565b1c29fa2370a868fbe7c97e46bfbd4d95cf/.planning/slice-plans/495-compare-story-ci-through-adapters/PLAN.md#L305-L326) ·
[Ordinary source review](https://github.com/terryyin/open-dough/blob/76565b1c29fa2370a868fbe7c97e46bfbd4d95cf/.planning/slice-plans/495-compare-story-ci-through-adapters/source-review.md) ·
[Assessment verdicts](assessment-257.md#promise-verdicts)

| ID | Source and reported status | Evidence |
| --- | --- | --- |
| 257-01 | Ordinary recommendation of no change. | The review credits code, focused proof and live observations for both Pygardon stories. The intended endpoints were recovered from retained attempts, the timestamp story settled wall time, and one missing proof summary had a reason. [Product advice](https://github.com/terryyin/open-dough/blob/76565b1c29fa2370a868fbe7c97e46bfbd4d95cf/.planning/slice-plans/495-compare-story-ci-through-adapters/PLAN.md#L305-L319) |
| 257-02 | Assessment break check for listing-branch identity. | Substituting the provider's validated branch for `listedBranch` in `baseCiAdapterAttempts.ts:87` failed the Branch JSON assertion. Run `402`, attempt `2` carried `ci/another-branch` instead of `claude/another-agent`. The break reached identity at `intent-ci-comparison-adapter.spec.ts:185` before the downstream proof-log assertion. [Break check and restoration](assessment-257.md#selective-break-check) |
| 257-03 | Assessment gap claim for a settled Done build whose attempt later expires. | The merge starts with missing proof. The report found no adapter journey where retention changes between reads and a cached build stays visible beside a newly unavailable proof. `intentCiComparisonRead.ts:42–64`, `intentCiComparisonAnswers.ts:24–40`, `ciAdapterProof.ts:106–139`. |
| 257-04 | Assessment gap claim for non-default target-branch discovery. | The code reads `source.ref`. The focused comparison and revision-lookup fixtures use `main`, so the report says a hardwired `main` would satisfy their assertions. `baseCiAdapterAttempts.ts:67–76`. |
| 257-05 | Assessment unknown for live Pygardon. | Ordinary review used retained live observations. The assessment modeled endpoints in a fixture and left current hosted retention, summaries, wall time and service configuration unassessed. [Historical observation](https://github.com/terryyin/open-dough/blob/76565b1c29fa2370a868fbe7c97e46bfbd4d95cf/.planning/slice-plans/495-compare-story-ci-through-adapters/PLAN.md#L273-L303) · [Assessment limits](assessment-257.md#promise-verdicts) |
| 257-06 | Assessment limit on adapter browser evidence for a selected failure. | The shared Actions browser checks failed rendering and the adapter module checks selection of a failed completed attempt. The report found no dedicated adapter browser fixture for that result. `dashboard-ci-adapter-revision-lookup.test.mjs:31–77`. |
| 257-07 | Assessment limit on adapter browser evidence for identity without a URL. | The Done journey checks identity and exact href. The report found no dedicated adapter browser fixture for the absent-URL case. `intent-ci-comparison-adapter.spec.ts:128–200`. |
| 257-08 | Assessment limit on one-sided wall timestamps. | The fixtures cover both attempt bounds or no recorded time. The report says a one-sided bound is not independently exercised. `intent-ci-comparison-adapter.spec.ts:128–194`, `intent-ci-comparison-adapter-gaps.spec.ts:60–62`, `storyCiComparisonWording.ts:39–44`. |
| 257-09 | Assessment limit on successful Landed proof figures. | Adapter journeys assert valid Baseline and Branch counts and duration. Successful Landed cells have shared-layer evidence only in the report. `intent-ci-comparison-adapter.spec.ts:212–245`, `dashboard-ci-comparison-entries.test.mjs:33–77,132–145`. |
| 257-10 | Assessment limit on successful Taken Provisional proof figures. | The Taken adapter journeys do not supply a valid Provisional summary. The report cites shared-layer evidence for the figures. [Proof-figures verdict](assessment-257.md#promise-verdicts) |
| 257-11 | Assessment limit on an exact adapter landing with a tempting built ancestor. | The report cites shared Actions coverage for missing endpoints and a second-parent decoy. Adapter fixtures do not independently exercise a missing exact landing with a retained build on an otherwise tempting ancestor. `intent-ci-comparison-gaps.spec.ts:165–229`. |
| 257-12 | Assessment scope limits. | Documentation-specific lint, release checks and the full suite were outside the focused selection. New history operations, runner-wait estimation, skipped-build ancestor proof, comparison cues and the Pygardon timestamp rollout are separate work. [Assessment limits](assessment-257.md#promise-verdicts) |

### Effort for the comparison

All recorded figures in this table are **measured**. Wall spans use the
historical retrospective's invocation through the published result for
ordinary review, and case start through returned report, including setup and
tests, for the assessment. Source-review elapsed spans are recorded
[separately](#timestamp-and-token-evidence). Agent elapsed includes waits.
Host token counters have different cache accounting. Active agent and
coordinator effort is unavailable. [Cost evidence basis](../../NORTH-STAR.md#intent-assessment-results-carry-their-cost)

| Case and review | Wall span | Agent elapsed and token evidence | Separate test runtime |
| --- | --- | --- | --- |
| SEED-254 ordinary (exploratory) | 491.551 s | Coordinator 491.551 s, overlapping agent 291.269 s. [Both token records](#timestamp-and-token-evidence) | Unavailable |
| SEED-254 assessment | 422.023 s | Assessor 379.959 s, 2,387,005 input and 13,523 output tokens. [Host counters](assessment-254.md#effort) | [Runner durations and silent runner limit](assessment-254.md#effort) |
| SEED-256 ordinary (exploratory) | 74.560 s | Coordinator 74.560 s, subagent elapsed unavailable. 1,491,331 input and 2,292 output tokens. [Host counters](#timestamp-and-token-evidence) | Unavailable |
| SEED-256 assessment | 464.105 s | Assessor 364.423 s, 2,488,461 input and 11,960 output tokens. [Host counters](assessment-256.md#effort) | [Runner durations and typecheck limit](assessment-256.md#effort) |
| SEED-257 ordinary (exploratory) | 111.719 s | Coordinator 111.719 s, subagent elapsed unavailable. 2,993,551 input and 3,524 output tokens. [Host counters](#timestamp-and-token-evidence) | Unavailable |
| SEED-257 assessment | 376.442 s | Assessor 350.553 s, 2,451,094 input and 11,577 output tokens. [Host counters](assessment-257.md#effort) | [Runner durations](assessment-257.md#effort) |

The **measured sum of case wall spans** is **677.830 s** for ordinary review
and **1,262.570 s** for the assessment. These sums add case intervals, some
overlapping, and stand separately from active effort and study elapsed time.
Comparable total effort and any speed savings are unresolved.

#### Verification effort

| Case | Ordinary reading (s) | Ordinary verification (s) | Assessment reading (s) | Assessment verification (s) |
| --- | --- | --- | --- | --- |
| SEED-254 | Unavailable | Unavailable | Unavailable | Unavailable |
| SEED-256 | Unavailable | Unavailable | Unavailable | Unavailable |
| SEED-257 | Unavailable | Unavailable | Unavailable | Unavailable |

Terry delegated this work, so human reading and verification times are
**unavailable**. The coordinator measured **14.126 s** of initial reading
of selected excerpts and **13.345 s** of initial grouped evidence checking,
using UTC wall-clock boundaries around tool groups. Both figures are joint
across the cases and reviews. Additional source spot checks fall outside
these measurements. The figures cover a subset of elapsed verification work.
Full verification cost and active effort are unavailable.

### Verification record

| ID | Verified finding and decision |
| --- | --- |
| 254-01 | **Ordinary protection decision and assessment consequential miss.** The running walk result drops the prior finished build's unavailable proof reason and makes Landed say no later trunk build has finished. The fixture checks stop and identity. The assessment's separate wording examples never assert the combined sequence. Keep the Plan 497 correction and its combined-path proof. [Running result](https://github.com/terryyin/open-dough/blob/1359d6fb76b8ff2b4295e2b4febe0e467ec72be1/dashboard/server/laterTrunkBuild.ts#L75-L103) · [Wording](https://github.com/terryyin/open-dough/blob/1359d6fb76b8ff2b4295e2b4febe0e467ec72be1/dashboard/server/laterTrunkBuild.ts#L116-L126) |
| 254-02 | **Ordinary pre-existing finding.** The cache predicate excludes `running` and a `none` slot awaiting a later build, so an `unavailable` slot can be retained. Credit ordinary review and keep it outside story-attributable counts. SEED-118 owns the retry issue. [Cache predicate](https://github.com/terryyin/open-dough/blob/1359d6fb76b8ff2b4295e2b4febe0e467ec72be1/dashboard/server/intentCiComparisonAnswers.ts#L24-L42) |
| 254-03 | **Assessment protection decision.** Keep the existing second-view head-gap assertion. The scratch edit reached the stale Landed identity, then the restored assertion passed. This was protection already present at the checkpoint. [Break check](assessment-254.md#focused-runs) |
| 256-01 | **Ordinary no-change context.** The retrospective's product advice is recorded. |
| 256-02 | **Assessment protection decision.** Keep the historical-workflow selection assertion. The scratch edit reached the exact estimate cells and replaced them with the unavailable-workflow reason. [Break check](assessment-256.md#selective-workflow-revision-break-check) |
| 256-04 | **Assessment protection decision and ordinary consequential miss.** The story promises that differences stay framed as observations between single builds. The comparison and Summary wording assertions read the same production constant as the UI, so a change to that constant alone can make the text causal while those expectations still agree with it. Strengthen the comparison assertion with an independent noncausal expectation. This gap was verified from source. The workflow-revision break check was the case's only scratch probe. [Story promise](https://github.com/terryyin/open-dough/blob/6f6d27f0ad119fd1a645b787b28e1c41b066e86e/.planning/seeds/SEED-256-compare-ci-time-without-runner-waits.md#L38-L44) · [Comparison assertion](https://github.com/terryyin/open-dough/blob/6f6d27f0ad119fd1a645b787b28e1c41b066e86e/dashboard/tests/intent/intent-ci-comparison.spec.ts#L89-L93) · [Summary assertion](https://github.com/terryyin/open-dough/blob/6f6d27f0ad119fd1a645b787b28e1c41b066e86e/dashboard/tests/intent/intent-summary-story-comparison.spec.ts#L107-L114) |
| 257-01 | **Ordinary no-change context.** Verified that the retained live observations show the intended endpoints and give a reason for the one missing summary. [Historical observation](https://github.com/terryyin/open-dough/blob/76565b1c29fa2370a868fbe7c97e46bfbd4d95cf/.planning/slice-plans/495-compare-story-ci-through-adapters/PLAN.md#L277-L297) |
| 257-02 | **Assessment protection decision.** Keep the listing-branch identity assertion. The scratch substitution reached the exact JSON `runBranch` check. Break-check credit ends at that assertion. [Break check](assessment-257.md#selective-break-check) |
| 257-05 | **Assessment unknown.** The historical live observation was checked. Current hosted retention remains unknown, and the evidence establishes no specific missed defect or protection decision on that path. |

| Case | Verified protection decisions, ordinary / assessment | Consequential misses, ordinary / assessment | Verified matches | Unsupported claims adjudicated, ordinary / assessment |
| --- | --- | --- | --- | --- |
| SEED-254 | 1 / 1 | 0 / 1 (254-01) | 0 | 0 / 0 |
| SEED-256 | 0 / 2 | 1 / 0 (256-04) | 0 | 0 / 0 |
| SEED-257 | 0 / 1 | 0 / 0 | 0 | 0 / 0 |
| Total | **1 / 4** | **1 / 1** | **0** | **0 / 0** |

Zero unsupported claims were adjudicated on either side. This count covers
only the selected verification. The table separates the remaining dispositions.

| Case | Unverified at cutoff | Unassessed in the source | Unknown | Pre-existing, outside counts |
| --- | --- | --- | --- | --- |
| SEED-254 | 254-04 through 254-12 | 254-13, 254-14 | — | 254-02 |
| SEED-256 | 256-03, 256-05 through 256-08 | 256-09, 256-10 | — | — |
| SEED-257 | 257-03, 257-04 | 257-06 through 257-12 | 257-05 | — |

The seed's illustrative identical-figures substitution did not occur in
this run. All three actual scratch edits caused their intended assertions
to fail. The SEED-256 shared-wording gap was verified by reading the fixture
and source. The Branch and Landed figures remain a separate follow-up.
[Branch and Landed follow-up](../../seeds/SEED-258-dough-intent-coverage.md#distinguish-branch-and-landed-summary-figures)

### Delegated decision

**Narrow.** Use one targeted scratch break check on demand during ordinary
review when a high-consequence promise has an existing assertion that may
pass under a plausible wrong implementation. Start with a passing focused
baseline, introduce the plausible error in scratch, confirm that it reaches
the intended assertion, restore the edit, and record the observed cost and
the scope of the result.

All three break checks reached their intended assertions, giving a concrete
way to confirm what the existing tests detect. SEED-256 separately yielded
a consequential test decision from source. The assessment missed the specific
SEED-254 defect, so Proceed's zero-miss requirement failed. Comparable total
effort is unavailable. The measured case wall-span sums were 677.830 s for
ordinary review and 1,262.570 s for assessment. The pilot supports the targeted
test-design technique. A public full assessment skill and automatic wrap-up
use would need further evidence. [Confirmed criteria](PLAN.md#confirmed-comparison-basis)
· [Decision in the story](../../seeds/SEED-258-dough-intent-coverage.md#pilot-result)
