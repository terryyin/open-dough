# Evaluate recoverable proof evidence in the next real planned execution

**Source:** [selected story](../../seeds/SEED-397-evaluate-recoverable-proof-evidence.md#evaluate-recoverable-proof-evidence)
**Source review:** [source-only review](source-review.md)
**Identity:** SEED-397#evaluate-recoverable-proof-evidence

## Goal and scope

Open Dough maintainers get a keep, revise, stop-and-rethink or inconclusive
verdict on the retained run records and compact hand-backs delivered at
`45ff02fee774a270826cd7507fee2ce1c9d077cc`, judged from one qualifying real
planned execution under the story's decision. The verdict, trace references,
installed release, figures and limits are recorded in this plan; a revise or
stop verdict also queues one follow-up story carrying that evidence.

The evaluation reads retained local traces only. It changes no guidance,
script, product code or test, starts no agent, and makes no paid comparison or
replacement execution. One execution is the sample.

## Decisive premises and retained observations

Observed in this owned preparation workspace at
`b8953aee81243b1c6646d1cb0a6908b74ce59992`, 2026-11-18, Node 24.21.0.

| Premise and consuming operation | Form and profile observed | Result and remainder |
| --- | --- | --- |
| Whether a qualifying execution exists (slice 1's selection) | `git tag --contains 45ff02fee774a270826cd7507fee2ce1c9d077cc`; installed `dough-update/VERSION` and its commit time per project; Claude Code `subagents` directories and Codex rollouts modified after 2026-11-18 08:53:30 +0800, each with its first timestamp, working directory, `dough-execute-plan` and "run record" mentions and `SubagentHandback` sizes; observed 2026-11-18 14:15 +0800 | `v0.3.105` contains the revision and was installed 08:48:59–08:53:30 +0800 in clipboard, doughnut, lizard, open-dough, pygardon and terry-talks. The earliest Claude Code session started after it is `139586cf-01ce-4b0d-9d06-987375063a2f` in the open-dough worktree `share-one-frontend-arrangement-of-an-agent-execu`, first timestamp `2026-11-18T01:34:44.216Z`: it follows a plan, mentions the run record 31 times and holds 5 worker hand-backs (2,754–4,513 characters). Eleven later Claude Code sessions with workers follow in open-dough, pygardon and doughnut; no Codex rollout with a planned execution starts before 13:30 +0800. Remainder: slice 1 confirms from that trace that a slice reached proof acceptance under the run record, and otherwise takes the next candidate in launch order. |
| The effort command selects one execution and reports coordinator and worker effort (slice 2) | `node dashboard/server/compareAgentEffort.ts --list`, then `--task '<id>' --json` for a listed Claude task, from this checkout | `--list --json` exited 0 after more than two minutes and listed the task `["open-dough","claude","50829ac2-3fd4-4e88-9f59-b0411b7f8743","2026-11-13T01:08:17.988Z"]`. Its `--task` report exited 0 with identity `SEED-334#run-and-observe-product-wide-end-to-end-tests`, 1 coordinator and 45 worker agents, 785,085,465 total tokens (status `partial`), of which workers 660,420,839, and gaps `auxiliary-usage-not-covered`, `idle-wake-evidence-unavailable`, `retained-native-evidence-only`. The 45 workers match the hand-back count below. Slice 2 records the report's status and gaps with its figures. Remainder: a Codex or Cursor task report, unobserved here. |
| Worker hand-back sizes can be measured from a retained Claude Code trace (slice 2) | Python read of `~/.claude/projects/<project>/50829ac2-3fd4-4e88-9f59-b0411b7f8743/subagents/agent-*.jsonl`, summing the string lengths of each `SubagentHandback` tool call's `input.message` | 45 worker transcripts, 45 hand-backs, median 6,494, 90th percentile 12,968, maximum 15,428, total 308,256 characters. This agrees with the research record for that coordinator (about 316k characters, reports of 10k–17k). The coordinator's own transcript does not hold the report: the `Agent` tool result is a 1,120-character launch notice and the task notification a 148-character pointer, so neither is a hand-back measure. Remainder: a Codex or Cursor execution keeps hand-backs in its own trace form, unobserved here; slice 2 locates it in that host's trace and names the method, or records the size as unavailable. |
| The coordinator's acceptance reads, reruns and second rounds are visible in its trace (slice 3) | Same coordinator transcript: tool calls counted by name | 438 `Bash`, 35 `Agent`, 2 `Edit`, 2 `Write` calls with their literal commands and prompts retained, so each read of a record, log or report and each repeated proof command is observable. The evidence directory itself is gone once the worktree retires. No remainder for Claude Code. |

## Outside-in proof

| Promise | Owner and observation |
| --- | --- |
| The evaluated execution qualifies, or the plan says what is missing and the story stays queued | Slice 1: recorded release, tag containment, execution identity and trace paths, or the missing condition |
| Hand-back sizes against the baseline, and total coordinator and worker effort | Slice 2: recorded figures with their literal commands and trace paths, reproducible by rerunning them |
| What acceptance read, what was rerun and why, second rounds, later defects | Slice 3: a table of each acceptance decision with its trace location |
| One verdict under the story's decision, with limits, and a queued follow-up on revise or stop | Slice 3: the verdict record in this plan; `read-state` of the follow-up story and its backlog line |

## Ordered slices

### 1. A qualifying execution is selected, or its absence recorded
Type: Behavior
Status: done
Proof: this plan records the installed release and the tag-containment result,
then either the execution's host, project, story identity, task ID and trace
paths, or the missing condition.

Behavior: the story is taken → the plan names the first planned execution that
started under an installed release containing the revision, delegated at
least one slice to a worker and reached proof acceptance; or it names what is
missing.

Check the installed release in each project on this machine whose executions
are retained (`VERSION` of its installed Open Dough, and `git tag --contains`
in this repository). Find candidates with
`node dashboard/server/compareAgentEffort.ts --list`, launched after that
installation; confirm from the trace that the execution followed a plan and
delegated a slice. The earliest qualifying one is the sample; do not pick by
result. This is the probe for the later slices: when none qualifies, record
what is missing, perform no later slice, and return the story to the queue for
a later attempt through the human-decision stop in
[execution decisions](../../../Distribution/src/skills/dough-execute-plan/references/execution-decisions.md#stop-for-human-judgment).

The preparation observation in the premise table names the candidate. The
earlier attempt, before any release contained the revision, is in Git history
at `25a24391b`.

#### Selected execution

- `git tag --contains 45ff02fee774a270826cd7507fee2ce1c9d077cc`
  returned v0.3.105 through v0.3.108. The first rollout was v0.3.105.
  `git -C "$HOME/git/<project>" log --all -1 --format='%h %ci %s' --grep='Update Open Dough guidance to 0.3.105'`
  returned clipboard `004cb5f` (08:50:03), doughnut `bf6ae30876` (08:48:59),
  lizard `0dac4c96` (08:51:57), open-dough `3f10a59ab` (08:51:37),
  pygardon `e0871522a` (08:51:37) and terry-talks `cd408e7` (08:53:30),
  all on 2026-11-18 +0800. At the sample's own Take,
  `git show 02e33c0182e14a7862af44f2424b7442135b:.claude/skills/dough-update/VERSION`
  returned `0.3.105`.
- `node dashboard/server/compareAgentEffort.ts --list --from 2026-11-18T00:48:59+00:00 --json`
  exited 0. Before 01:34:44.715Z the catalog lists Codex
  `01a1ec2d-2f93-7753-8556-de8c0c2041be` (an automation watching OpenGSD)
  and Claude Code `e670e246-9628-4476-926c-85edae91434e` and
  `b2e85b3d-e21f-437f-a44f-b4d5d2c8a6c6` (story refinement and slice
  planning, each with zero worker traces). The first dated row of each retained
  Claude coordinator and Codex live or archived rollout in the release-to-sample
  window confirmed the same order. The Cursor catalog lists families without
  timestamps. No retained Cursor root transcript file was created in the
  window, using local file birth times as the Cursor observation.
- The sample is the Claude Code execution of
  `SEED-334#share-one-executing-agent-roster-arrangement` in open-dough,
  plan 694, task ID
  `["open-dough","claude","139586cf-01ce-4b0d-9d06-987375063a2f","2026-11-18T01:34:44.715Z"]`.
  The coordinator trace is under
  `~/.claude/projects/-Users-terryyin-git-open-dough--worktrees-share-one-frontend-arrangement-of-an-agent-execu/`
  as `139586cf-01ce-4b0d-9d06-987375063a2f.jsonl`. Line 9 is its
  planned-execution invocation (01:34:44.465Z in the transcript). Line 232
  delegates slice 1, and lines 434–443 record proof acceptance. Worker
  traces are in the sibling `139586cf-01ce-4b0d-9d06-987375063a2f/subagents/`
  directory. The implementer's retained hand-back names the run records and
  report, which establishes that this execution exercised the delivered workflow.

Delivery disposition: records-only.

### 2. Hand-back sizes and total effort are recorded
Type: Behavior
Status: done
Proof: recorded commands, trace paths and figures; rerunning the commands
gives the same figures.

Behavior: a selected execution → the plan records each worker hand-back's
size in characters with count, median, 90th percentile and total; the
comparison with the 7.8k baseline median where the host is Claude Code; and
total coordinator and worker effort from
`node dashboard/server/compareAgentEffort.ts --task '<id>' --json`.

For Claude Code use the `SubagentHandback` measure in the premise table. For
another host, name the trace field measured, or record the size as
unavailable with the reason; report sizes without the median comparison. For
comparable-work context, cite the effort report's totals beside the scope of
the execution (slices, workers); claim no saving from a single execution
without a comparable earlier one, and say so as a limit.

#### Hand-back sizes

Count Unicode characters in each worker's `SubagentHandback.input.message`.
The coordinator's received hand-back frames identify the same five workers.

| Worker trace under `subagents/` | Call line | Coordinator receipt line | Characters |
| --- | ---: | ---: | ---: |
| `agent-a9174da98aa29c1b1.jsonl` (source review) | 17 | 210 | 2,983 |
| `agent-a6344a5de0cd970e2.jsonl` (slice implementation) | 156 | 284 | 4,478 |
| `agent-ad95292cc3436ea66.jsonl` (slice refactor review) | 54 | 524 | 2,754 |
| `agent-accf8901126c18f3b.jsonl` (CI repair) | 264 | 1,086 | 4,513 |
| `agent-a0d018af08829d007.jsonl` (CI repair refactor review) | 88 | 1,143 | 3,496 |

Five hand-backs, 18,224 characters total. Median 3,496 and nearest-rank
90th percentile 4,513. The median is about 55% below 7,800, from 315
Claude Code hand-backs across whole sessions in the seed's baseline. That
comparison is descriptive. This one-slice sample includes two CI-repair
hand-backs and has no comparable earlier execution, so it supplies no
estimate of token or elapsed-time savings. It supplies no result for Codex
or Cursor.

Rerun the character count from the coordinator path in slice 1:

```sh
python3 - "$HOME/.claude/projects/-Users-terryyin-git-open-dough--worktrees-share-one-frontend-arrangement-of-an-agent-execu/139586cf-01ce-4b0d-9d06-987375063a2f.jsonl" <<'PYCOUNT'
import json, math, statistics, sys
from pathlib import Path

coordinator = Path(sys.argv[1])
sizes = []
for trace in sorted((coordinator.parent / coordinator.stem / "subagents").glob("agent-*.jsonl")):
    for line_number, line in enumerate(trace.open(), 1):
        content = json.loads(line).get("message", {}).get("content")
        if not isinstance(content, list):
            continue
        for item in content:
            if item.get("type") == "tool_use" and item.get("name") == "SubagentHandback":
                size = len(item["input"]["message"])
                print(trace.name, line_number, size)
                sizes.append(size)
sizes.sort()
print(len(sizes), statistics.median(sizes), sizes[math.ceil(0.9 * len(sizes)) - 1], sum(sizes))
PYCOUNT
```

#### Task effort

```sh
node dashboard/server/compareAgentEffort.ts --task '["open-dough","claude","139586cf-01ce-4b0d-9d06-987375063a2f","2026-11-18T01:34:44.715Z"]' --from 2026-11-18T00:48:59+00:00 --json
```

The task-mode run exited 0 and selected the expected story, root session
and one native turn. It reported these partial subtotals across one Structure
slice, its source review, its refactor review, and its subsequent CI repair
and repair refactor:

| Role | Agents | Requests | Input tokens | Output tokens | Total tokens |
| --- | ---: | ---: | ---: | ---: | ---: |
| Coordinator | 1 | 98 | 15,469,910 | 43,787 | 15,513,697 |
| Workers | 5 | 68 | 4,124,545 | 47,635 | 4,172,180 |
| Execution | 6 | 166 | 19,594,455 | 91,422 | 19,685,877 |

The workers row sums the five worker entries. Claude input includes cache
reads and writes. The report lists `auxiliary-usage-not-covered`,
`idle-wake-evidence-unavailable` and `retained-native-evidence-only`; it
reported zero unowned responses in the selected family. The initial
all-history scan was stopped after over nine minutes without a report.
The completed rerun applies a lower time bound before this task launched and
leaves its upper bound open. The slice ran from published selection
`ca78bb1cb7268c6074cb745dc125e4fe129c8282`.

Delivery disposition: records-only.

### 3. Acceptance observations and the verdict are recorded
Type: Behavior
Status: done
Proof: a table of acceptance decisions with trace locations, and one verdict
record; for revise or stop, the follow-up story's `read-state` and backlog
line.

Behavior: the measured execution → the plan records, for each slice's proof
acceptance, what the coordinator read (run record, log excerpt, full report,
whole log), each proof command repeated and its reason, each second round to
a worker and its cause, and what CI, the retrospective and later slices found
by the evaluation time; then one verdict under the story's decision with its
limits, including what had not yet run and the baseline's host and
whole-session scope.

On revise or stop, add one follow-up story with its evidence to this seed
under the installed product-backlog skill and queue it; implement nothing. On
keep or inconclusive, add no story.

Sizing: each slice is one read-and-record pass over one execution's retained
trace. No Structure slice and no interim behavior.

#### Acceptance decisions

The table uses one-based JSONL lines from the coordinator trace in slice 1.
The sampled plan has one Structure slice. The remaining rows cover its
refactor and the CI repair that followed integration.

| Decision | Evidence the coordinator read | Observed result |
| --- | --- | --- |
| Slice 1, shared roster arrangement | Received hand-back at 284, inspected the source diff and fixtures at 307–330, read the exit results and excerpts from its own counted reruns at 391–420, and read the first 40 lines of the consumer trace at 411. The hand-back names the worker's run records and full report. The trace shows no direct read of those worker run-record files, the full report, or a whole proof log. | The hand-back reported exit 0 and eight cases inferred from source, with no printed count. The coordinator accepted after the new proof record showed eight selected cases and the command exited 0. It displayed one expected outcome directly, then recorded eight expected outcomes and checked the obligations at 434–443. |
| Slice 1 refactor | Fresh refactor launch at 458 and its returned hand-back at 524. | The refactor review found no changes needed. The trace shows no additional proof rerun or full report read at this acceptance. |
| Trunk CI diagnosis and repair | CI failure receipt at 963, bounded failed-job diagnostic at 995–1005, repair hand-back at 1086, refactor hand-back at 1143, and the focused rebase validation summary at 1184–1185. | An unrelated feedback-maintenance E2E spec raced a startup read. The repair changed that spec. After trunk advanced, the coordinator ran the repaired spec five times on the rebased candidate and observed five expected outcomes. Final trunk CI succeeded at 1207. |

#### Repeated commands and worker rounds

- The slice implementer ran the same two frontend specs again with
  `OPEN_DOUGH_DASHBOARD_PROOF_RECORD` after the original command exited 0
  with an empty log. The rerun sought a count and followed a whitespace
  correction. The first run and the retry each exited 0, and the generic
  environment variable produced no frontend proof file. The implementer also
  reran `npm run lint` after correcting the newline. See worker
  `agent-a6344a5de0cd970e2.jsonl` lines 90–110, 129–151.
- The coordinator ran those two frontend specs at 391–392 to acquire a count
  with `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD`. Playwright exited 0.
  The surrounding read failed because the coordinator prefixed an already
  absolute evidence path with `$PWD`. It repeated the command at 397–398 with
  the corrected path, obtaining `acc2-proof.json` and exit 0. The literal
  commands and bounded reads are retained at those trace lines.
- The coordinator did not return slice 1 to its implementer for a missing
  proof row. The independent refactor at 458 and the new diagnosis at 1072
  served distinct purposes. The diagnosis worker's successive reproductions
  changed the way the race was forced. The initial setup passed both versions,
  the load-event stall timed out, and the real-time stall exposed the same
  assertion failure in five of five attempts before the fix. The equivalent
  after-fix probe passed five of five, and the repaired spec passed 20 of 20
  locally. See `agent-accf8901126c18f3b.jsonl` lines 141–209 and 233–264.
  The coordinator's later five-repeat run at 1184 validated a new revision
  after rebasing the repair. Its purpose was candidate validation.

#### Later findings and limits

Evidence cutoff: 2026-11-19 18:34 +0800.

- Story-branch CI succeeded on `b886da46e05a0131e748bbc818e159cec482d799`
  (run `44218421269`, attempt 1, coordinator line 737). The branch closure
  used that CI basis (line 925). After integration, trunk CI on
  `f9f1b7c156423e39c65a185a3e738bbec21b7582` failed in E2E shard 1/6
  (run `44219732025`, attempt 1, lines 963 and 995–1008). The reported
  race occurred in `system-settings-feedback-maintenance-unchanged.spec.ts`,
  outside the original frontend roster proof. Repaired trunk revision
  `615ce8114b79844327869fe2ce178a2c0c75bb42` passed CI
  (run `44222562048`, attempt 1, lines 1207–1214).
- The retrospective found the intended roster change complete. Its DD-571
  occurrence identified an omitted reporter flag in the brief and the
  incorrect proof-record variable in the worker command, both before the
  hand-back. The two forms of return already exposed the missing count.
  See coordinator lines 667–698 and the implementer's full report write
  and hand-back at worker lines 151 and 156. Neither the retrospective nor
  CI supplies evidence of a defect the full worker report would have exposed
  and the hand-back concealed.
- The sample finished its only planned slice, retrospective, branch CI,
  trunk CI repair and final trunk CI before the cutoff. Its coordinator
  records retirement and completion at 1242–1257. It had no later planned
  slice or outstanding check in the retained session. The worktree evidence
  directory retired with it, so the record relies on persisted transcript
  fields and excerpts. There is no independent comparison execution, and
  the baseline covers Claude Code whole sessions.

#### Verdict

**Inconclusive.** The v0.3.105 sample had a 3,496-character median against
the 7,800-character baseline. Acceptance used a short hand-back, source
inspection and bounded evidence. It still repeated the frontend command
to get a verified selection count. The missing observation for **Keep** is
acceptance from the retained original proof without recreating its output.
Both forms of the original return exposed the count gap, and the coordinator
resolved it directly without a second worker round. The later CI failure
concerned a different spec. The trace establishes neither the **Revise**
condition nor the **Stop and rethink** condition of reading whole reports
or logs. The story's inconclusive path queues no follow-up.

Delivery disposition: records-only.

## Local gates and current decisions

- No product, guidance or test source changes, so no test suite is a local
  gate; the recorded commands are the proof. Hosted CI runs after
  publication. If a full local suite is nevertheless run on macOS, start
  fully awake and on AC use `caffeinate -s -i`, under
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- All failing or flaky checks follow the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- The effort command's `--list` took over ten minutes at execution; run it
  through the slice clock's `run`, in the background.
- Slice-plan refinement was not needed: three sequential read-and-record
  outcomes, each with its own proof.
- Execution resumed from the published Take `0afa50da09802acefffcb99c0aae7146fc5b00c4`
  in the owned `codex/evaluate-recoverable-proof-evidence-in-the-next` worktree.
  Story Branch Mode publishes to the same remote branch before integration
  into `origin/main`. Coordinator Honoka-chan, observer `honoka-seed397`
  watches GitHub Actions `ci.yml` in `/tmp/dough-ci-501/watch-5x2fro`.
- Remaining slice-specific concerns: none beyond the qualifying condition,
  which slice 1 bounds as the early probe.

## Execution complete

Product advice: no change. The one-sample evaluation is complete and its
inconclusive verdict does not trigger a follow-up. The three published slice
commits (`ca78bb1cb`, `00bbb4a4d`, and `1856bb524`) preserve the selection,
measurements, and decision. The records-only change did not alter test
coverage. The retrospective confirmed the sample and evidence limits and
retained the bounded task invocation in slice 2.
