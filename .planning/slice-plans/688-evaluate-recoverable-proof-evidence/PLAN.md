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
| Whether an installed release contains the delivered revision (slice 1's qualifying check) | `git tag --contains 45ff02fee774a270826cd7507fee2ce1c9d077cc`; `git log -1 --format='%H %ci' v0.3.104`; `grep -c "run record" .claude/skills/dough-execute-plan/references/*.md` against the same under `Distribution/src/skills/` | No tag contains it. The latest tag `v0.3.104` is `d9266746c`, 2026-11-17 15:42 +0800; the revision is dated 2026-11-18 00:59 +0800. Installed guidance has no "run record" text; source has it in five references. No execution qualifies today. Slice 1 repeats this observation at execution time and stops the later slices when it still fails. |
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
Status: planned
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

Result, observed in the execution workspace at
`36fa2883b86a9094cab77ea9b0c7214424be1fc8` on 2026-11-18 after
`git fetch origin --tags`: no execution qualifies.

| Observation | Command | Result |
| --- | --- | --- |
| Release containing the revision | `git tag --contains 45ff02fee774a270826cd7507fee2ce1c9d077cc` | No tag. The revision is on `origin/main` (`git merge-base --is-ancestor` succeeds) and unreleased. |
| Latest release | `git tag --sort=-creatordate \| head -1`; `git log -1 --format='%H %ci' v0.3.104`; `VERSION` | `v0.3.104`, `d9266746caa3034b15ee4f9daca2254f43a115bc`, 2026-11-17 15:42:25 +0800; the revision is dated 2026-11-18 00:59:55 +0800. |
| Installed release per project | `dough-update/VERSION` under each `~/git/*/.claude/skills` or `.agents/skills` | 0.3.104 in clipboard, doughnut, lizard, open-dough, pygardon and terry-talks; 0.3.60 in random. |
| Installed guidance | `grep -rl "run record"` in each project's installed `dough-execute-plan` | No file in any of the seven projects; five references under `Distribution/src/skills/dough-execute-plan/references/`. |

Second observation, 2026-11-18 09:06 +0800, after merging `origin/main` at
`3f10a59abf343aae8301eec06885487439fba5e9` into the execution branch: the
release condition is met and no execution has yet started under it.

| Observation | Command | Result |
| --- | --- | --- |
| Release containing the revision | `git tag --contains 45ff02fee774a270826cd7507fee2ce1c9d077cc` | `v0.3.105`. |
| Installed release per project | `dough-update/VERSION`; `git log -1 --format=%ci -- <that file>`; `grep -rl "run record"` in the installed `dough-execute-plan` | 0.3.105 with the run record in six files, installed 2026-11-18 between 08:48:59 and 08:53:30 +0800 in clipboard, doughnut, lizard, open-dough, pygardon and terry-talks; random stays at 0.3.60. No Cursor trace was modified since. |
| Sessions since the installation | Claude Code `subagents` directories and Codex rollouts modified in the last hour, each with its first timestamp and working directory | Two Claude Code planned executions with workers are in progress, `SEED-340#declare-every-worker-preparation-with-its-own-budget` (started 08:44 +0800) and `SEED-334#retire-integrated-ui-test-and-its-documents` (started 07:34 +0800); both started before the installation and their worktrees hold 0.3.104. The one session started after it, a Codex rollout at 09:02 +0800 in the open-dough default checkout, is the scheduled `watch-opengsd-ideas` automation and follows no plan. |
| Listed executions | `node dashboard/server/compareAgentEffort.ts --list --json` through the slice clock's `run`, started 08:56 +0800 | Exit 0 after more than ten minutes: 4,311 selections, 3,547 with a launch time. The latest launch is `2026-11-18T00:44:37.463Z`, the Claude Code task for `SEED-340#declare-every-worker-preparation-with-its-own-budget`; none is launched after the installation. |

Missing condition: a planned execution that starts after the 0.3.105
installation in its project, delegates a slice and reaches proof acceptance.
Slices 2 and 3 are not performed. This slice stays `planned`: a later attempt
repeats the candidate search with
`node dashboard/server/compareAgentEffort.ts --list` for tasks launched after
2026-11-18 08:53:30 +0800.

### 2. Hand-back sizes and total effort are recorded
Type: Behavior
Status: planned
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

### 3. Acceptance observations and the verdict are recorded
Type: Behavior
Status: planned
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
- Remaining slice-specific concerns: none beyond the qualifying condition,
  which slice 1 bounds as the early probe.
