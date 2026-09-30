# Correct continued-command reading and corpus admission in the native harness

## Source and authority

- **Identity:** SEED-055#native-harness-replay-corrections
- **Source:** [story](../../seeds/SEED-055-trustworthy-project-proof.md#native-harness-replay-corrections),
  a bounded correction from the execution retrospective of
  SEED-055#native-harness-observes-agent-behavior (plan 163; story and plan at
  `2b20ed61:.planning/seeds/SEED-055-trustworthy-project-proof.md` and
  `2b20ed61:.planning/slice-plans/163-native-harness-replay/PLAN.md`).
  Reviewed commits: `daaf3c1e`, `f5088cf6`, `942d7636`, `f7d61115`,
  `6173d733`, `26467b51`, `f68bfe00`, `b4d82278` on
  `claude/native-harness-observes-agent-behavior`.
- **Depends on:** plan 163's story branch integrated into trunk; the files
  and line locations below are on `claude/native-harness-observes-agent-behavior`
  at `e0e96586`.
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication.

## Outcome and boundaries

A continued shell command reads as one single-spaced command, so a literal
matcher such as `worktree-retirement.mjs retire` finds it. Every accepted paid
run, of any family, can join the replay corpus through the one command. The
closure assessors and documentation carry no residue from plan 163.

Preserved promises (plan 163): one reader holds every host shape; the corpus
replays with reviewed, not generated, expectations; example 1's corrected
count; example 4's replayed verdicts; the guard and its exact shape-writer
list; the shim check; verdicts on existing counterexamples and substitute
journeys.

Excluded:
- One shared host-shape writer for the substitute agents, the owned-context
  suite, and the stream-field unit test: three writers with different jobs,
  and merging them saves a few `jq` lines (the plan 163 slice 2 refactor
  pass's reasoning still holds).
- Whole-transcript greps that are not host shapes: `harness-inspected` reads
  the whole transcript on purpose, and the delivery-evidence observers match
  products, not commands.
- Moving the per-host closure counterexamples into the reader unit test; the
  saving is small.

## Current findings

1. **Continuations keep a double space.** `joinContinuations`
   (`tests/support/native-host-stream.mjs`) replaces `\\\n[ \t]*` with one
   space and keeps the space before the backslash, so
   `node x/worktree-retirement.mjs \<newline>  retire` reads as
   `…mjs  retire`. `story_closure_retire_seen` (literal
   `worktree-retirement.mjs retire`) and `use_assert_host_adapter_call`
   (`… product-backlog-git-merge.mjs merge --ref close-b`) would miss such a
   command. The retire check also reads the node log; the merge-adapter
   check has no fallback, so a correct paid run could fail. The unit test at
   `native-host-stream.test.mjs:41-46` has no space before its backslash, and
   the comment "as a shell reads them" hides the gap.
2. **The corpus command refuses cases that are not `<family>/<journey>`.**
   `tests/support/native-stream-retained-attempt.mjs:56-59`. Worktree
   preparation records `case: fresh-node` and similar
   (`execution-worktree-prep-native-run.sh:97`), and delivery-evidence
   scenarios record `delivery-evidence/<case>/<scenario>`
   (`delivery-evidence-native-run.sh:203`). Replay needs no fixed depth;
   only the publication family reads a journey.
3. **Closure residue.** `trunk-closure-native-assess.sh:77` prints
   `transcript-finish`, which no assessor reads.
   `story-branch-closure-native-assess.sh:118` derives `transcript-complete`
   by grepping the whole transcript, and :158 requires it, although the
   reader-based completion count already covers it. Both closure assessors
   source the substitute agent `native-agent-admission.sh` at top level only
   to build counterexample streams, so the paid assessor path loads
   substitute code.
4. **Small dead or duplicate code.** The reader's `outputs` CLI view has no
   shell caller. A `strings()` walker exists in both
   `native-host-stream.mjs` and `native-stream-corpus-add.mjs`.
5. **Stale documentation.** `tests/native-adr-awareness-wrappers.md:118-123`
   describes Codex activity as `item.completed` events and does not mention
   the shared reader or corpus admission. `tests/native-publication.md:10-17`
   omits the missing-`observations.txt` refusal and reads as publication-only.
   Comments: `native-host-stream.test.mjs:34` ("as for jq -s"),
   `tests/native-stream-completeness.sh:4`.
6. **Redundant per-host runs.** `tests/native-stream-completeness.sh` runs 8
   wrapper runs (about 10 s in CI): truncated and unknown for all three
   hosts, and missing for two. Per-host classification is now owned by
   `native-host-stream.test.mjs` (missing and unknown for every host) and
   corpus replay (truncated on real streams for every host).
   `native_run_classify_stream` is host-agnostic. The suite alone proves the
   runner's mapping (incomplete, not run, retention) and its two output
   branches: Codex `-o`, and the reader response for Cursor and Claude.

## Current decisions

- Join a continuation to exactly one space, removing whitespace on both sides
  of `\<newline>`. The reviewed `command:` lines that change are whitespace
  only. Review them by diff, and have replay fail on the old spelling.
- Non-publication cases map to `<host>/<case segments…>/<attempt>` in the
  corpus. The publication family still requires `publication/<journey>`.
- Closure assessors source the shape writer only inside their counterexample
  functions.
- Keep in `tests/native-stream-completeness.sh`:
  - truncated for Codex (its `-o` response branch) and for Cursor (the reader
    response branch);
  - missing for one host;
  - unknown for one host.

  The dropped runs stay covered by the reader unit test and corpus replay.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| The double space is real | `commandSegments("node x/worktree-retirement.mjs \\\n  retire --x")` through `node -e` | `["node x/worktree-retirement.mjs  retire --x"]` |
| Corpus lines affected | `grep -rln 'mjs  \|start  --' tests/fixtures/native-streams` | 10 files |
| Callers of `joinContinuations`/`commandSegments` | `grep -rn` over `tests` and `scripts` `.mjs` | the reader, its unit test, `native-stream-corpus-add.mjs` |
| Non-two-segment cases exist | `grep -rn "printf 'case: "` and `delivery-evidence-native-run.sh:203` | worktree prep `case: <name>`; delivery-evidence `<family>/<case>/<scenario>` |
| Those families' records name their stream | `grep -rn "artifact-events\|artifact-.*-events" tests/support/*.sh` | worktree prep (`execution-worktree-prep-native-run.sh:109`) and the generic retention (`native-result-retain.sh:175`) write `artifact-events: events.jsonl` |
| `transcript-finish` is unread; `transcript-complete` is required | `grep -rn "transcript-finish\|transcript-complete" tests` | only the print at `trunk-closure-native-assess.sh:77`; `story-branch-closure-native-assess.sh:118,158,190` |
| Completeness runs | `tests/native-stream-completeness.sh:163-183` | loop over codex, cursor, claude: truncated, missing (not Claude), unknown |
| CI headroom | branch runs of `tests/git-publication-native.sh` | 43.4–54.0 s against `per-job-seconds=71` |

## Promise → proof

| Promise | Slice | Proof |
| --- | --- | --- |
| A continued command reads single-spaced | 1 | `native-host-stream.test.mjs` with a space before `\`; replay of the re-reviewed corpus |
| Any accepted run joins the corpus | 2 | `tests/native-stream-replay.sh` retention case with a one-segment and a three-segment case |
| Closure residue gone, verdicts unchanged | 3 | `tests/git-publication-native.sh` closure counterexamples and substitute journeys |
| Redundant runs trimmed, runner mapping kept | 4 | `tests/native-stream-completeness.sh` green with the kept runs |

## Slices

### 1. A continued command reads as one single-spaced command
Type: Behavior
Status: done
Proof: `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh
tests/support/native-host-stream.test.mjs tests/native-stream-replay.sh`.

Behavior: a command `a \<newline>  b` → the reader returns `a b`. The unit
test covers a space before the backslash, and replay of the re-reviewed
`command:` lines passes. Replay fails on an entry still holding the
double-spaced spelling. Remove the reader's unused `outputs` CLI view and the
duplicate `strings()` walker, and correct the reader comment.

### 2. Any accepted paid run joins the corpus
Type: Behavior
Status: planned
Proof: `tests/native-stream-replay.sh` retention case.

Behavior: a retained worktree-preparation attempt (`case: fresh-node`) and a
delivery-evidence scenario (`case: delivery-evidence/<case>/<scenario>`) →
the command adds each under its case segments, and replay passes after
review. A publication case without a journey is still refused, naming the
case. Documentation: `tests/native-publication.md` lists every refusal and
states that the step covers every family; `tests/native-adr-awareness-wrappers.md`
names the shared reader and corpus admission instead of host events.

### 3. Closure assessors carry no dead or duplicate observation
Type: Structure
Status: planned
Proof: `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh
tests/git-publication-native.sh tests/native-stream-replay.sh`.

Internal change: drop `transcript-finish`. Replace the requirement for
`transcript-complete` with the existing reader-based completion count, and
remove the field. Source `native-agent-admission.sh` only inside the closure
counterexample functions. The guard's shape-writer list stays exact. External
verdicts are unchanged.

### 4. The completeness suite keeps only runs no other check owns
Type: Structure
Status: planned
Proof: `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh
tests/native-stream-completeness.sh tests/support/native-host-stream.test.mjs
tests/native-stream-replay.sh`.

Internal change: keep the runs named under Current decisions and drop the
rest. A comment names the surviving coverage for the dropped runs. Update the
stale header comment.

## Local gates

- Run changed checks through `scripts/test.sh` with Bash 5 first on PATH
  (`tests/README.md`).
- Run `dough-post-change-refactor` before each commit, as this repository's
  practice requires.
- Delegation briefs name the lint rules (ESLint, shellcheck `enable=all`) and
  the 250-line file bound, since this repository has no commit hook.
