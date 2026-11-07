# Compare a short manual intent assessment with ordinary review

## Ordinary review (exploratory)

This historical baseline uses the three completed execution retrospectives and
their source reviews that Terry confirmed on 2026-11-07. The findings below
record what ordinary review reported. Terry's verification and comparison
counts are pending. [Confirmed comparison basis](PLAN.md#confirmed-comparison-basis)

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
| SEED-254 | **Measured**, 491.551 s | **Measured**, 291.269 s | **Unavailable** | **Unavailable**, pending (s) | **Unavailable**, pending (s) |
| SEED-256 | **Measured**, 74.560 s | **Unavailable**, no retrospective subagent recorded | **Unavailable** | **Unavailable**, pending (s) | **Unavailable**, pending (s) |
| SEED-257 | **Measured**, 111.719 s | **Unavailable**, no retrospective subagent recorded | **Unavailable** | **Unavailable**, pending (s) | **Unavailable**, pending (s) |

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
