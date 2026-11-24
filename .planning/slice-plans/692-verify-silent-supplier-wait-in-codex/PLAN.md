# Verify the silent supplier wait in Codex

**Identity:** SEED-389#verify-silent-supplier-wait-in-use
**Source:** [Verify the silent supplier wait in Codex](../../seeds/SEED-389-verify-silent-supplier-wait.md#verify-silent-supplier-wait-in-use)

## Goal and scope

A maintainer gets a keep, revise, or remove recommendation for the silent
supplier wait on Codex from three different executions monitoring named
blocking dependencies, or a record of what is missing. Both developer-requested
and coordinator-initiated watches can qualify. The seed defines eligibility,
request attribution and the decision rule. Apply
[ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
by comparing watches with the historical wait where comparable and limiting
the recommendation to the observed versions, workstreams and result paths.

Excluded: acting on a revise or remove recommendation, the Claude Code
sibling story, a staged or paid watch, and maintained trace tooling.
Open Dough 0.3.102 introduced the supplier watch. The Codex long-wait
correction shipped in 0.3.107. Both use the seed's evaluation bars.

The local gate is a repeatable read-only trace check. For long local runs,
use `caffeinate -s -i` on AC power under
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Failures follow the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Outside-in proof

| Key example | Owner | Observable signal |
| --- | --- | --- |
| A coordinator watches for a named outcome while its supplier works | 1 | The watch row records what is blocked, the expected supplier outcome, the initiator and whether the supplier was working or paused. |
| A coordinator ends its turn on a hold or awaits its own routine CI | 1 | The sample excludes the trace. Record the reason when a candidate could be mistaken for a watch. |
| Fewer than three qualifying executions | 1 | `## Watches` lists the watches, clear misses, shortfall, new backlog position and resume condition. |
| An ad hoc route or an interval of five minutes or less | 1 | An ad hoc watch has route `missed`. A short interval is recorded as ineligible. |
| Intervals within both bars, including zero requests | 2 | Rows show the allowance, requests and cache share where applicable. If handling succeeded throughout, recommend keep. |
| Excess wakes with correct handling of the observed results | 2 | Recommend revise and cite the host action and the interval exceeding the bar. A lower bound above the bar establishes excess wakes. |
| A proven bypass, missed result, or failed continuation | 2 | Once the sample qualifies, recommend remove and cite the failure. |
| Publication during judgment of the previous result | 2 | The next interval starts on a rerun with the same deadline. Its row shows how the coordinator handled the publication. |
| Evidence gaps prevent a verdict | 2 | Recommend inconclusive and name the gap. |

Reuse the retained November traces and Codex's native response IDs and
token counters. The controlled traces show the command's receipt shapes.
Natural watches supply eligibility and result-handling evidence. A second
reader can recompute a row from its rollout locator and interval bounds.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| A blocked outcome and watch can be linked in retained rollouts | Slices 1 and 2 search and result handling | Rollout `01a1f70e-656e-7d32-baf8-ee066c533a92` links the held merge at lines 3049 and 3099 to launch 3069, publication 3147 and continuation decision 3159. The pre-release developer request appears in the separate compressed rollout `01a1d22f-e0cd-7032-930d-5a9ff3011a64` at line 2819. In the controlled November 18 rollouts ending `eb2305d55dcb` and `eb5be690b336`, the respective publication and deadline outputs are at line 19. | Both initiation paths can be identified in context. The natural trace covers publication. The controlled deadline gives its receipt shape. |
| Requests and cached input can be attributed once | Slice 2 measurement | The natural rollout ending `ee066c533a92`, lines 3069–3147, pairs wait calls on cell `g2:262` with distinct Codex token-usage response IDs. The historical rollout `01a1e7c4-7085-7903-83b8-bcfeec6241f9` exposes the same counters for polling the Docker proof process. | The final recount records the exact bounds, excludes mixed actions, and leaves ambiguous attribution unknown. |
| The installed release can be attributed | Slice 1 eligibility | Reading `.agents/skills/dough-update/VERSION` at the three natural watches' launch revisions returned 0.3.109. Their session metadata records Codex 0.171.0. | Use the rollout's checkout and Git revision or direct version evidence. Mark the release unknown when it cannot be established. |
| The retained rollouts can be searched as a bounded snapshot | Slice 1 search and repeatability | The two November 18 searches agreed on 767 request and 31 command-name matches. The expanded November 24 scan identified three natural watches by command and verified the surrounding dependency context. | Reuse the retained candidates and scan the period since the cutoff. A shortfall leads to deferral. |

## Ordered slices

### 1. Confirm the Codex watch sample
Type: Behavior
Status: done
Proof: `## Watches` lists each watch's rollout, project, installed release,
Codex version, blocking outcome, initiator, route (`command` or `missed`),
and interval bounds and eligibility. A repeat search of the frozen window
reproduces the candidate list.

Behavior: confirm eligibility for the three retained watches. Freeze the
new period from the November 24 cutoff to the current cutoff in
`~/.codex/sessions` and `~/.codex/archived_sessions`. Search concrete command
launches, developer watch requests and ad hoc publication monitoring.
Read the surrounding turn and supplier evidence to establish what blocks
the execution. For a bypass, cite the bounds of active monitoring of the
same outcome or mark the duration unknown. Count each execution once.
With fewer than three eligible executions, record the shortfall and clear
misses, move the story below the next eligible entry, and stop.

### 2. Measure the watches and record the recommendation
Type: Behavior
Status: done
Proof: each eligible interval's row shows its duration, attributable
requests or a supported bound, allowed requests, cached input share where
known, and how the result was handled. Record missed publications, failed
continuation, developer intervention and material unknowns. Recount one row
from the rollout. The recommendation applies the seed's rule and names any
unobserved terminal path.

Behavior: once three executions qualify, measure each distinct request
attributable to the watch, starting with the retained intervals. Record
independent work and mixed or unknown attribution separately. Map each
result to its launch, refs and deadline, and follow the coordinator's next
action. Use the named dependency outcome and any agreement in effect to
judge continuation. Verify reuse of the original deadline after a
nonqualifying publication. When recommending revise, name the host step
that woke the model. Use the historical baseline where comparable and
quantify savings where supported.

## Watches

The first take found zero eligible watches under the original criteria.
The expanded search found three natural candidate watches in different
executions. Slice 1 checks their eligibility under the adopted scope and
looks for newer evidence.

### Search on 2026-11-18

The window ran from 2026-11-16 00:00 SGT to
2026-11-18 15:25:06.305685 SGT, excluding the cutoff. The search inventoried
`rollout-*.jsonl` and compressed rollouts under `~/.codex/sessions` and
`~/.codex/archived_sessions`. It selected 408 active rollouts by filename
date or modification time, including older sessions that ran into the window.
The earliest retained rollout was dated 2026-05-14. Archived rollouts ranged
from 2026-06-22 to 2026-11-04, with none selected for the window.

For a repeat, freeze the selected paths, their byte lengths, and the cutoff.
Read the JSONL records by timestamp within that window:

- Select `response_item` messages with `payload.role = user`. Match watch,
  monitor, poll, keep an eye, check back, and notification requests, plus
  wait, hold, pause, dependency, supplier and publication language.
  Check brief approvals against the preceding assistant message and
  use the surrounding turn to identify the thing being watched. Strip skill
  and environment envelopes before judging the request. A request can count
  even when the command was bypassed.
- Select `response_item` calls with `payload.type` of `function_call` or
  `custom_tool_call` whose arguments or input mention
  `wait-for-publication.mjs`. Inspect those calls for an actual invocation
  with concrete remote and ref arguments.

Both scans of the frozen snapshot returned the same 767 message matches
in 364 rollouts and 31 command-name references in eight rollouts. The
message matches included 486 in coordinator rollouts. They resolved to
workflow boilerplate, scheduled ticket or upstream-news monitoring,
unrelated waits and notifications, authoring the follow-up, or this
investigation. The command-name references were source reads, searches,
and development or test material. None launched the command.

This result covers the retained files through the cutoff and requests the
query and surrounding turns could identify. Missing rollouts and requests
outside those search terms remain unobserved.

### Relevance review on 2026-11-24

Read the retained Codex JSONL and Zstandard rollouts from 2026-11-01 00:00
through 2026-11-24 10:58:16 SGT (exclusive), including older rollouts
modified during the window. Search user messages after stripping workflow
envelopes for watch, wait, follow-up, notification and dependency language.
Independently search tool inputs for `wait-for-publication`, supplier or
publication watch helpers, and Git polling loops. Check actual commands,
their receipts, and surrounding turns. Deduplicate copied worker history
against the coordinator. Since the seed was queued on 2026-11-16 at
15:26:01 SGT, 1,202 distinct threads had a task start, including 266
top-level threads. These are scan coverage counts. The number of executions
that encountered a paused supplier is unknown.

The original is confirmed in rollout `01a1d22f-e0cd-7032-930d-5a9ff3011a64`,
lines 2811–2822, 10405–10429 and 13972. The coordinator had already handed
off the blocked work when the developer said “you watch it.” The
[historical audit](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/session-token-efficiency-research.md#1-wake-the-coordinator-for-results-changes-and-bounded-deadlines)
associated 300 requests and 71.72 million processed tokens with empty
waits, timeouts or clock checks. The raw rollout reproduces 447 distinct
requests and 105,393,914 processed tokens in that prolonged interval.
Those are observed costs. Savings from an alternative remain unmeasured.
An earlier Lizard watch for an actively repaired collector ended after
about 11 minutes and used multi-minute sleeps (November 7, rollout
`01a1b63a-ea5a-7f83-a3c9-603c930f6e18`, lines 393–475).

No second developer-requested watch of a paused supplier surfaced. Three
coordinators nevertheless launched the installed command in ordinary
SEED-413 work on November 20–21, each on Codex 0.171.0 and Open Dough
0.3.109. The launch revisions `d7bcd9af3`, `44d066285` and
`7ed7478c8` each contain that installed version. The three executions
belong to one related workstream and provide no frequency estimate for
blocked executions generally.

### Confirmed sample and forward search on 2026-11-24

All three retained watches qualify, with five unchanged intervals over
five minutes. All are in Open Dough, on installed release 0.3.109 and
Codex 0.171.0. In each rollout, line 1 supplies the project and Codex
version. The checkout revision supplies the installed release from
`.agents/skills/dough-update/VERSION`. Line 12 supplies the execution
identity. The user messages preceding the watch consist of the initial
instructions, execution launch and skill body at lines 8, 12 and 14.
The coordinators initiated these watches.

| Rollout suffix and checkout revision | Execution | Blocked outcome and supplier state | Route and eligibility |
| --- | --- | --- | --- |
| `ee066c533a92` at `d7bcd9af3` | `SEED-413#renovate-remaining-dashboard-backend-unit-tests` | The consumer held its reconciled merge until the sibling's story-launch file-admission repair reached `main`. The sibling was monitoring the failing revision and owned the active repair (3049, 3099). | `command`, eligible, 506.493 s (3069–3147). |
| `4d89225b0f3c` at `44d066285` | `SEED-413#restore-done-capture-proof-after-composed-reviews` | The consumer could finish local proof but needed plan 742's accepted changes before migrating its two handoff readers. The supplier had published its final slice and was resolving a trunk merge conflict (2683, 2941, 3299). | `command`, eligible, 2,020.828 s (2658–3309). |
| `2bc24d19d267` at `7ed7478c8` | `SEED-413#correct-landing-record-writes-and-tests` | The consumer needed plan 743's Done-helper cleanup on trunk for its combined check and closure. The supplier was reconciling trunk, publishing branch review and closure commits, and then integrating (3042, 3197, 3245, 3439, 3496). | `command`, eligible once for three intervals of 1,081.616 s, 1,008.777 s and 401.189 s (2970–3227, 3238–3413, 3424–3491). |

The forward window ran from 10:58:16 SGT through 15:43:02 SGT
(end exclusive). The scan froze paths and byte lengths for rollout JSONL
and Zstandard files dated or modified into the window under
`~/.codex/sessions` and `~/.codex/archived_sessions`. It selected 59 active
paths, including 37 worker paths, and zero archived paths. Each of two
reads covered the same 38,525 timestamped records. Their candidate indexes
matched byte for byte, with 30 developer-language hits, one brief
approval, 15 command or helper-name references, 217 remote or agent
status reads, and 793 general watch-language tool inputs. These categories
can overlap. Worker traces were checked in the context of their
coordinators. The command or helper-name references were confined to
this story's preparation and execution and showed search, source reads
or plan editing.

The tool and developer hits yielded no additional launch or substantiated
bypass. For example, rollout `01a20b69-73b3-7af1-87bb-64c4009bcf0b`
(773–848) coordinated resumption of a paused session and waited for
message delivery. Rollout `01a20bc1-a2ad-7570-aea7-1f04d742960e`
(247, 307–649) followed CI for its own fixes. Rollout
`01a20bfd-efb9-7f12-ad85-4ddd3fc22db6` (173–278) recorded a remaining
dependency and completed its preparation update without watching for
publication. Rollout `01a20c5f-91a6-7cb1-9d10-b823f104d592` checked a
sibling's branch for overlapping changes (357, 931) while independently
publishing its first two slices (690, 893).

No shortfall remains. This search covers the retained trace window and
observable cues, with possible gaps from missing rollouts or unrecognized
ad hoc monitoring. The eligible sample is still one workstream on one
Codex and Open Dough version pair. It contains publication results only.

### Measured watches and recommendation

**Revise the Codex wait.** All five intervals exceeded the wake bar even
when counting only requests whose sole observed action was waiting on the
same command. The command stayed quiet until it returned a publication, and
each coordinator continued or resumed the hold as the result warranted.
No bypass surfaced in the bounded search. The natural traces show no missed
result, failed continuation, or developer intervention through the observed
next actions.

| Coordinator rollout | UTC launch → receipt and JSONL lines | Seconds | Wait-only requests / allowance | Processed tokens | Cached input | Publication and next action |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| `01a1f70e-656e-7d32-baf8-ee066c533a92` | Nov 20 05:51:38.469 → 06:00:04.962 (3069–3147) | 506.493 | 7 / 2 | 2,888,983 | 99.88% | The shared review-input and session-admission paths changed on `main`. The coordinator recognized sibling repair `c5840ccd7` (3159), rebuilt the merge (3160, 3173), and reported 43 focused passes and landing (3265, 3292). |
| `01a1fb74-984f-75c0-81cb-4d89225b0f3c` | Nov 21 01:49:15.359 → 02:22:56.187 (2658–3309) | 2,020.828 | 18 / 7 | 6,336,214 | 99.83% | Plan 742's Done record appeared on `main`. The coordinator integrated `be03d5643` (3314, 3322, 3334), then verified the migrated readers (3453). |
| `01a1fb85-54bb-7a32-a5f7-2bc24d19d267` | Nov 21 02:33:24.634 → 02:51:26.250 (2970–3227) | 1,081.616 | 30 / 4 | 11,561,223 | 99.88% | Execution review `fd759fc69` appeared on the supplier branch. The coordinator checked the review and trunk ancestry (3231–3234) and resumed the hold (3238). |
| Same | Nov 21 02:51:44.961 → 03:08:33.738 (3238–3413) | 1,008.777 | 29 / 4 | 11,405,747 | 99.92% | Closure `bd66bffac` appeared on the supplier branch. The coordinator inspected the prospective merge (3417–3420) and resumed the hold (3424). |
| Same | Nov 21 03:08:49.539 → 03:15:30.728 (3424–3491) | 401.189 | 10 / 2 | 3,979,430 | 99.92% | The Done-helper change and plan removal appeared on `main` at `f6f42edab`. The coordinator started the merge (3496, 3504), resolved overlaps and reported 46 combined passes (3664). |

The allowance is the ceiling of elapsed seconds divided by 300. Between
the command launch and receipt, group actions by distinct
`token_usage_record` response ID. Exclude the launch response, replies to
the developer, and responses to the terminal receipt. Count an outer
`wait` only on a cell that owns the command or a verified poll of its
process. Count a shell poll only when the empty `write_stdin` targets the
recorded process. For example, in the first rollout the seven wait-only
meters are at 3078, 3084, 3107, 3113, 3119, 3139 and 3145. They sum to
2,883,968 cached input tokens out of 2,887,347 input tokens. Across all
five intervals, the lower bound is 94 requests against 19 allowed, using
36,171,597 processed tokens. Cached shares describe those counted requests.

| Interval start line | Independent work | Supplier inspection | Wait plus commentary | Wait mixed with another tool action | Unknown |
| --- | ---: | ---: | ---: | ---: | ---: |
| 3069 | 0 | 3 | 1 | 0 | 0 |
| 2658 | 51 | 9 | 3 | 11 | 2 |
| 2970 | 3 | 6 | 2 | 0 | 0 |
| 3238 | 0 | 2 | 1 | 0 | 0 |
| 3424 | 0 | 0 | 1 | 0 | 0 |

Those requests are outside the wait-only bound. For example, the plan 742
coordinator ran its own focused proof during the watch (2816–2853) and
polled that work and the supplier in the same response (2777–2779). Its
reasoning-only meters at 2715 and 3064 have no observable action to attribute.
The first coordinator inspected the sibling revision and shared lookup
(3091, 3124, 3131) during the installed watch. These reads supplement the
launch rather than establishing an alternate watch route.

All launches used `origin`. The first watched `main` paths
`dashboard/server/storyReviewInput.ts`,
`dashboard/server/storyReviewSessionAdmission.ts` and
`dashboard/server/storyReviewSessionFileAdmission.ts` with deadline
`2026-11-20T06:06:38.534Z`. The second watched
`main:.planning/done/SEED-413_prove-ad-hoc-review-handoffs-with-typed-handlers.json`
with deadline `2026-11-21T02:49:15.417Z`. For the third, the three launches
watched the same `refs/heads/main` paths
`dashboard/backend-tests/support/doneCaptureReview.ts` and
`.planning/slice-plans/743-restore-done-capture-proof-after-composed-reviews/PLAN.md`,
and branch `refs/heads/codex/restore-done-capture-proof-and-focus-session-rev`.
The first receipt returned deadline `2026-11-21T03:33:24.705Z`. The first
rerun stored and passed it (3238), the second loaded and passed it (3424),
and both receipts returned it unchanged. The qualifying landing was
reported in the third interval. A qualifying change during either judgment
gap was unobserved.

The observed re-entry came from the Codex tool returning before the shell
command did. The first coordinator started a one-second outer cell, then
used 30- or 60-second `functions.wait` calls on the still-running cell
(3069–3079, 3138–3147). The second called empty `write_stdin` in successive
`functions.exec` cells. Those calls returned the same running session with
empty output, typically after 30 or 60 seconds (2897–2905, 3279–3287).
The third resumed each one-second cell with `functions.wait`. A 60-second
inner `write_stdin` then handed back a still-running shell session, often
requiring a fresh cell and a fresh wait (2976–3006, 3254–3266). The final
loop in one cell still re-entered through a 60-second outer wait (3476–3491).
The revision should address these host returns while retaining publication
judgment and the original deadline on rerun.

The historical Docker proof wait in Codex 0.169.0-alpha.11.1
(`01a1e7c4-7085-7903-83b8-bcfeec6241f9`, lines 3190–3312) supplies a
mechanism comparison. In a 1,032.099-second observed window, 14 interior
poll requests used 6,239,076 processed tokens, with 99.96% of input cached.
Its 300-second inner polls also returned the coordinator through shorter
outer waits. The first natural supplier interval used about 0.83 wait-only
requests per minute, compared with about 0.81 in that historical window.
The older wait was for a proof on another Codex version, with no matched
supplier workload or terminal outcome. The comparison supports recurrence
of the host behavior and leaves realized savings unknown.

This retrospective result applies to coordinator-initiated SEED-413 watches
on Codex 0.171.0 and Open Dough 0.3.109. All five natural receipts were
publications. The controlled November 18 deadline receipt at line 19 in
`01a1edf4-66c1-7891-afde-eb5be690b336` verifies its shape. Natural deadline
handling and other workstreams, version pairs and developer-initiated watches
remain unobserved in the qualifying sample.

### Deferral and resume

The November 18 execution deferred the story behind the Codex long-wait
correction, which has since shipped. The next take starts with the
retained candidate watches and searches forward from the latest cutoff.
Carry the cutoff, watch facts and any shortfall into a later take.

## Current decisions

- Terry set the two bars and recommendation rule on November 18.
- Terry approved including coordinator-initiated watches for named
  blocking dependencies on November 24. The three SEED-413 watches may
  count as separate executions. Their common workstream limits what they
  establish about other workstreams.
- Use one-off reads of the retained traces. Keep locators and measured
  facts in the plan. The three natural watches cover publication. The
  review will state any remaining gap in natural deadline evidence.

## Execution context

- Aino-chan's first take `a5b5f6dc5cacdac28139c15ba9496187975d2b4a` was
  accepted on `origin/main`. It completed the search under the original
  eligibility criteria.
- The revised first slice confirms the candidates under the broader scope
  and searches only the new period.
- Maria-chan's current take `f7c7b9a346f65a8eb5a3e0af07dada1cadad862c`
  was accepted on `origin/main` and on the story branch
  `codex/verify-the-silent-supplier-wait-in-codex`. It started at
  `c952ee3a10870f06a7ef76585820837c5fbfa238` in Story Branch Mode through
  publisher `dashboard-territory.local-open-dough`. The source had changed
  since readiness review. The November 18 search remains attributed to
  Aino-chan, whose stale assignment was released on trunk in `23fb23548`.
- The Codex CI observer tracks the remote story branch through GitHub Actions
  `ci.yml`, coordinator `maria-chan-d6e8985d`, mailbox
  `/tmp/dough-ci-501/watch-Qv6asu`, cell `g67:13`, shell session 9127 and PID
  4477. The Take's trunk revision has no attached observation in this session.
- Slice 1 delivery is records-only. The two forward search indexes matched
  exactly, and the natural watches still meet the eligibility threshold.
  The story branch accepted slice 1 at `1905a4a1cd7a081fa5b4c7da25361c88bc9fea23`.
- Slice 2 delivery is records-only. The recount confirms every wake-bar
  miss after excluding mixed requests and locates each continuation in the
  original rollout.

## Story obligations

## Plan review

The first slice establishes eligibility and owns deferral if the sample
falls short. The second owns measurement, result handling and the
recommendation. The retained observations cover the trace and measurement
routes, including a repeated count for a live interval.
