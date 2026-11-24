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
| A blocked outcome and watch can be linked in retained rollouts | Slices 1 and 2 search and result handling | On November 24, rollout `01a1f70e-656e-7d32-baf8-ee066c533a92` linked the held merge at lines 3049 and 3099 to launch 3069, publication 3147 and continuation decision 3159. The compressed original at line 2819 shows a developer-requested watch. In the controlled November 18 rollouts ending `eb2305d55dcb` and `eb5be690b336`, the respective publication and deadline outputs are at line 19. | Both initiation paths can be identified in context. The natural trace covers publication. The controlled deadline gives its receipt shape. |
| Requests and cached input can be attributed once | Slice 2 measurement | On November 24, a `python3 -I` reread of the natural rollout ending `ee066c533a92`, lines 3069–3147, paired wait calls on cell `g2:262` with seven distinct response IDs and 2,885,504 cached of 2,890,075 input tokens. The historical rollout `01a1e7c4-7085-7903-83b8-bcfeec6241f9` has 15 distinct responses with 6,667,648 cached of 6,670,639 input tokens from 08:40:21 to 08:57:34 UTC on November 17. | The natural row can be recounted. Missing meters or ambiguous attribution remain unknown. |
| The installed release can be attributed | Slice 1 eligibility | Reading `.agents/skills/dough-update/VERSION` at the three natural watches' launch revisions returned 0.3.109. Their session metadata records Codex 0.171.0. | Use the rollout's checkout and Git revision or direct version evidence. Mark the release unknown when it cannot be established. |
| The retained rollouts can be searched as a bounded snapshot | Slice 1 search and repeatability | The two November 18 searches agreed on 767 request and 31 command-name matches. The expanded November 24 scan identified three natural watches by command and verified the surrounding dependency context. | Reuse the retained candidates and scan the period since the cutoff. A shortfall leads to deferral. |

## Ordered slices

### 1. Confirm the Codex watch sample
Type: Behavior
Status: planned
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
Status: planned
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

| Coordinator rollout | Launch → receipt (UTC and raw JSONL lines) | Duration | Requests issuing only wait calls / seed allowance | Processed tokens on those requests / cached input share | Outcome |
| --- | --- | --- | --- | --- | --- |
| `01a1f70e-656e-7d32-baf8-ee066c533a92` | Nov 20 05:51:38 → 06:00:05 (3069→3147) | 8m 26s | 7 / 2 | 2,891,109 / 99.84% | Sibling repair published and the consumer rebuilt its merge. |
| `01a1fb74-984f-75c0-81cb-4d89225b0f3c` | Nov 21 01:49:15 → 02:22:56 (2658→3309) | 33m 41s | 32 / 7 | 11,327,244 / 99.82% | Plan 742's Done record landed and the consumer integrated it. |
| `01a1fb85-54bb-7a32-a5f7-2bc24d19d267` | Nov 21 02:33:25 → 02:51:26 (2970→3227) | 18m 02s | 31 / 4 | 11,956,242 / 99.88% | Plan 743's branch review published. The command was restarted with the same deadline. |
| Same | Nov 21 02:51:45 → 03:08:34 (3238→3413) | 16m 49s | 29 / 4 | 11,405,747 / 99.92% | Plan 743's closure commit published on its branch. The command was restarted with the same deadline. |
| Same | Nov 21 03:08:50 → 03:15:31 (3424→3491) | 6m 41s | 10 / 2 | 3,979,607 / 99.91% | Plan 743 landed and the consumer merged trunk. |

The request counts are conservative. In each interval, deduplicate
`token_usage_record` by response ID, exclude the launch response and the
first response to its return, and stop before the terminal result. Count
only responses whose tool calls wait on the publication cell or make empty
`write_stdin` calls to its process. Exclude tool calls that also advance
other work. The command returned publication in every interval. The host
repeatedly returned control between results through 60-second `wait`
calls or 60-second `write_stdin` calls in cells that yielded after one
second. Across the five intervals, 109 requests issued only wait calls
and processed 41,559,949 tokens. The counts establish recurrence of the
wake pattern and observed polling cost. They establish no realized saving
or natural deadline result.

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

## Story obligations

## Plan review

The first slice establishes eligibility and owns deferral if the sample
falls short. The second owns measurement, result handling and the
recommendation. The retained observations cover the trace and measurement
routes, including a repeated count for a live interval.
