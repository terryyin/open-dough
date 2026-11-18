# Verify the silent supplier wait in Claude Code

**Identity:** SEED-389#verify-silent-supplier-wait-in-claude-code
**Source:** [Verify the silent supplier wait in Claude Code](../../seeds/SEED-389-verify-silent-supplier-wait.md#verify-silent-supplier-wait-in-claude-code)

## Goal and scope

A maintainer gets a keep, revise, or remove recommendation for the silent
supplier wait on Claude Code from three real watches, or a record of what is
missing. The seed's Scope holds the watch definition, the interval bounds,
the two bars, and the recommendation rule; its Shared evaluation holds the
facts to retain and the request-counting rule.

Excluded: acting on a revise or remove recommendation, the Codex sibling
story, a staged or paid watch, and maintained trace tooling.

This story changes no product code, test, or guidance, so it has no local
test gate. Failures follow the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Outside-in proof

| Key example | Observable signal |
| --- | --- |
| Fewer than three eligible watches | `## Watches` lists each watch found with its facts and names what is missing; the story sits lower in the backlog list; no recommendation is recorded |
| Three eligible watches | `## Watches` has one row per unchanged interval with the retained facts, and `## Recommendation` states keep, revise, remove, or inconclusive with the rule that produced it and the longest unchanged interval observed |
| A silent watch whose resume request is under 90% cached | Its row shows no counted request and the resume request's cached share, and the recommendation is revise, naming the expired prompt cache |
| A watch that bypassed the command | Its row is present with route `missed`, and the recommendation is remove |
| An unchanged interval of five minutes or less | Its row is present and marked not eligible |

A second reader can recompute any row from its transcript path and the two
timestamps bounding its interval while the transcript is retained.

## Decisive premises

| Premise | Consuming operation | Observation (2026-11-18, `python3 -I` over `~/.claude/projects` on this machine) | Result |
| --- | --- | --- | --- |
| A developer's message can be found in a coordinator transcript | Slice 1 search | `<project>/<session>.jsonl` records with `type` `user`, no `isSidechain`, and `message.content` as text or `text` blocks hold developer messages; the search for a watch request over 3,890 transcripts returned none | Settled for the record shape. No real request exists yet to confirm its wording |
| A background launch, its return, and its task notification can be paired and timed | Slices 1 and 2 interval bounds | Session `549942db-0325-422c-993c-a1992c321e3b`: the `Bash` `tool_use` holds `input.command` and `input.run_in_background`; its `tool_result` carries the `tool_use_id`; a `queue-operation` record with `operation` `enqueue` holds `<task-notification>` with the same `<tool-use-id>`; all are timestamped. 344 notifications paired this way | Settled |
| Coordinator model requests can be counted once each with their cached input | Slice 2 measurement | Assistant records without `isSidechain` carry `message.id` and `message.usage` with `input_tokens`, `cache_read_input_tokens`, and `cache_creation_input_tokens`; one request repeats its `message.id` across content blocks. 1,443 resume requests were measured | Settled |
| The installed release at the time of a watch can be read | Slice 1 eligibility | `git log --grep='Open Dough guidance to'` in `~/git/open-dough`, `~/git/pygardon`, and `~/git/doughnut` lists dated "Update Open Dough guidance to 0.3.10N" commits; the transcript's directory and `cwd` name the project | Settled for projects updated through those commits. For any other project, record the release as unknown |
| Transcripts from the watch period are still on this machine when the story is taken | Slice 1 search | The oldest of 770 coordinator transcripts was last written on 2026-10-19, 30 days ago, and no `cleanupPeriodDays` is set | Settled: a watch is readable for 30 days. Slice 1 records the earliest retained transcript date it finds |

## Ordered slices

### 1. Find the real Claude Code watches
Type: Behavior
Status: planned
Proof: `## Watches` in this plan lists every watch found, each with
transcript path, project, installed release, Claude Code version, request
timestamp, route (`command` or `missed`), and each unchanged interval's
bounds and eligibility; a second search with the recorded query returns the
same transcripts.

Behavior: Claude Code transcripts since 2026-11-16 exist on this machine →
the maintainer searches the coordinator transcripts under
`~/.claude/projects` for developer messages asking a held execution to watch
its supplier and for `Bash` calls running `wait-for-publication.mjs` with
`--ref` arguments outside this repository's development of the command →
every watch is listed with its eligibility. A watch found on a visit that
ends here also gets its slice 2 measurements recorded, because its
transcript may be gone at the next visit. With fewer than three eligible
watches from different executions, the section names what is missing, the
story moves below the next eligible backlog entry, and execution stops
there with that resume condition.

### 2. Measure the watches and record the recommendation
Type: Behavior
Status: planned
Proof: each eligible interval's row shows unchanged duration, counted model
requests inside it, requests for independent work recorded separately, the
resume request's cached share and input tokens, and the publication or
deadline outcome with any missed publication, failed continuation, or
developer intervention; `## Recommendation` follows from those rows by the
seed's rule. Recounting one row from its transcript gives the same numbers.

Behavior: three eligible watches are listed → the maintainer measures each
unchanged interval and its resume request and applies the rule → the plan
records the Claude Code recommendation with the longest unchanged interval
observed, a comparable historical wait and the token difference when one
supports it, and the host step that woke the model or let the cache expire
when the recommendation is revise.

## Current decisions

- Bars and recommendation rule are fixed in the seed before any watch is
  read (Terry, 2026-11-18): no counted request in the unchanged interval,
  and a resume request at least 90% cached.
- Each read is a one-off query kept in the conversation. The plan keeps
  transcript paths, timestamps, and measured numbers, never trace contents.

## Learnings

- 2026-11-18: no transcript runs the command for a real watch, so slice 1
  is expected to end at "missing" until developers ask Claude Code to
  watch.
- 2026-11-18: a watch that reaches the default 60-minute deadline is
  expected to resume under 90% cached, which gives revise.

## Story obligations

**Source:** [Verify the silent supplier wait in Claude Code](../../seeds/SEED-389-verify-silent-supplier-wait.md#verify-silent-supplier-wait-in-claude-code)

## Plan review

Refinement was not needed: two slices, each with one outcome and its own
proof. This review identified no remaining slice-specific concern.
