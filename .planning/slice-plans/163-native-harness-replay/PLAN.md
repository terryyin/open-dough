# Catch native harness faults before paying for a native run

## Source and authority

- **Identity:** SEED-055#native-harness-observes-agent-behavior
- **Source:** [story](../../seeds/SEED-055-trustworthy-project-proof.md#native-harness-observes-agent-behavior),
  refined with Terry on 2026-09-29. During planning the same day, he chose
  the shared reader with a guard, and a gzipped corpus in the test fixtures.
  Findings: [ProjectFindings.md](../../../ProjectFindings.md#native-acceptance-harness-observations-that-do-not-match-what-the-native-agent-did-first-priority)
  (DD-179).
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication.

## Execution

- **Mode:** Story Branch Mode; worktree
  `.worktrees/native-harness-observes-agent-behavior`, branch
  `claude/native-harness-observes-agent-behavior`, publisher ID
  `claude-native-harness-observes-agent-behavior`.
- **Claim:** published on `origin/main` at `0c857874`.

## Outcome and boundaries

Real host output from paid runs becomes free, replayable proof of how the
native harness reads each host's stream, and the free suite proves harness
shims survive each host's login shell. A new or changed journey meets these
harness faults in the free suite, not in a paid run.

Key examples (from the story):

1. Plan 082 Cursor `startup-selected-source`, recorded `startup-cli-count: 0`
   and failed, whose start command is one multi-line, quoted shell call →
   replay finds that start command once → its reviewed expectation records the
   corrected count and cites the harness fault.
2. Plan 082 Codex `startup-trunk`, whose commands arrive as `item.started`
   `command_execution` events → the reader returns every started command. A
   reader that reads only `item.completed`, or drops Cursor `tool_call`
   commands, fails the free suite.
3. A new journey whose observation greps `"type":"item.started"` itself → the
   free suite fails, naming that file.
4. Plan 140 Cursor `one-shot-result` → its replayed stream fields plus
   retained fixture fields reassess as pass, its recorded verdict.
5. A zsh startup file that rebuilds PATH from scratch → the shim check finds
   `gh` or `node` resolving outside the harness → the free suite fails.
6. A paid run is accepted → one command adds it to the corpus → the next
   free-suite run replays it.

Excluded (story): assessor counterexample discipline (DD-160, DD-175,
ODF-087's harness facet), which belongs to
[its own story](../../seeds/SEED-055-trustworthy-project-proof.md#assessor-counterexample-discipline);
any gate on the paid native runner; new paid captures. Replay is not native
behavioral evidence
([ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) §2).

## Current decisions

- **One reader, one implementation.** A Node module with a small CLI (for
  example `tests/support/native-host-stream.mjs`) reads a plain or gzipped
  stream for a named host. It returns the started shell commands (with line
  continuations joined, and also split at command separators for matching),
  command outputs, the final response, and the stream status (complete,
  truncated, missing, unknown). It has one adapter per host: Claude
  `assistant` `tool_use` Bash with `user` `tool_result`, Codex
  `item.started`/`item.completed` `command_execution` with `turn.completed`,
  and Cursor `tool_call` started/completed with `result`. Shell callers use
  the CLI, and `.mjs` callers import it. This follows ADR 0005 §2: shared
  logic is tested once, and adapter differences per tool.
- **Corpus layout.** Each corpus entry sits at
  `tests/fixtures/native-streams/<host>/<case>/<attempt>/` and holds
  `events.jsonl.gz`, the retained `record` and `observations.txt` as
  provenance, and a reviewed `expected` file (key: value). `expected` names the
  stream-derived fields and their values, and a `verdict:` line holding either
  the expected assessment or `not-replayable: <missing fields>`. Where it
  differs from the retained observation, a `corrected:` line cites the
  harness fault.
- **Expectations are reviewed, not generated.** The oracle for recognizing
  every command is the reviewed `expected` list. For accepted attempts it comes
  from the retained observations; for a harness-faulted attempt it is written
  by hand with the reason. The reader never writes its own expectations.
- **Verdict replay rule.** The stream-derived fields from replay replace
  those fields in the retained observations, and today's assessor then
  reassesses. Replay applies only when the retained observations carry every
  field today's assessor reads; otherwise `expected` says `not-replayable`
  and names those fields. A drifted schema is not rewritten.
- **The guard catches host-event literals.** It fails any file under
  `tests/` or `scripts/` outside the reader that contains a host stream event
  marker: `item.started`, `item.completed`, `turn.completed`, `tool_call`,
  `tool_use`, `"subtype":"started"`, or a `type == "result"` selection. An
  explicit list of shape writers is allowed: substitute agents, and
  counterexample stream builders that emit shapes rather than read them.
  Generic `.command` walkers contain no literal, so the guard cannot see them;
  slices 2, 4, and 5 remove them instead.
- **Placement.** Replay and guard go in a new free check (for example
  `tests/native-stream-replay.sh`). `tests/git-publication-native.sh` is
  already the largest CI job (47.3 s against the 71 s `per-job-seconds`), so
  replay does not go there.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| Real streams for current journeys survive in history | `git log --all --diff-filter=A --name-only -- '*events.jsonl'` | 38 streams. 18 map to current cases: `publication/startup-*` on all three hosts at `820077c3`, `publication/{one-shot-*,admission-investigation}` on Cursor at `0901bbab`, and `delivery/updated-use` on all three at `64a188e8`, `923a49e3`, `e485816b`. The `.planning/quick/039…/slice-2/{correction,predecessor}/transcript.jsonl` Cursor streams (`ab447d4c`) carry multi-line heredoc commits. All are real host output; two Claude streams at `820077c3` are weekly-limit stops. |
| The plan 142/146/154 faulting streams exist | the same log, plus `find` over the worktrees and `/tmp` | Absent; never retained. |
| Observers need live fixture state | read each family's observer (startup-fixture.sh:79-169, one-shot.sh:61-103, closure assessors, delivery-evidence observers) | Yes: origin, markers, push/node/gh logs, mailboxes. Only stream-derived fields replay. |
| Today's assessor reproduces an accepted attempt | `git_publication_assess` on `0901bbab` one-shot-result `observations.txt` minus assessment lines, with `response.md` | `pass / only the one-shot result reached remote trunk and its workspace retired`, the recorded verdict. |
| Old retained observations drift | the same on `820077c3` Cursor startup-story-branch `27de` (recorded pass) | `fail / …crossed claim boundary…`: the field `command` postdates it → `not-replayable`. |
| Today's observation corrects a harness-faulted attempt | `git_publication_transcript_start_commands` on `820077c3` Cursor startup-selected-source `5692` | 1 command (retained `startup-cli-count: 0`). |
| Host-shape parse sites | `grep -rlE 'item\.started\|item\.completed\|tool_call\|tool_use\|"subtype":"started"\|turn\.completed\|type == "result"' tests scripts src` | 23 files, all under `tests/`. Readers: git-publication shared/fixture/startup-fixture, native-completion-observation, trunk- and story-branch-closure assess, native-run-stream, native-run-supervise, product-backlog take/use-hosts, dough-adr-awareness-context/codex-use, dough-update-local-guidance-rejection. Writers: native-agent-*.sh, counterexamples, the owned-context suite, plus tests that build streams. Generic walkers without literals: `execution-worktree-prep-native-observe.mjs:24-52` and `prep_native_extract_commands` (`execution-worktree-prep-native-run.sh:185-190`). |
| Shims in a harness bin | `grep -rnoE '\$\{harness\}/bin/…' tests/support`, plus the closure fixtures' `*_write_gh` | `node` (with the in-process recorder for Codex) and `gh`, all created under `native_harness_observe_node`, which applies `native_harness_keep_login_path`. The free check (`run_native_harness_counterexamples`) proves only `gh` on one synthetic harness with a decoy-prepend profile. |
| The corpus fits | `gzip -9` on the largest Cursor stream | 697 364 → 110 842 bytes; about 8 MB raw gives roughly 1.3 MB. |
| CI has history and time | `.github/workflows/*.yml` `fetch-depth: 0`; `tests/time-budget` | `per-job-seconds=71`, `total-job-seconds=470`. |

## Promise → proof

| Promise | Slice | Proof |
| --- | --- | --- |
| Reader proved on real streams, all three hosts (ex. 2) | 1 | `tests/native-stream-replay.sh`: every corpus entry's commands and stream status match `expected`; the item.completed-only and cursor-less reader counterexamples fail |
| Harness-faulted attempt corrected (ex. 1) | 3 | Replay of `5692` gives count 1, matching `expected` with `corrected:` |
| Accepted verdict reproduced (ex. 4) | 3 | Replay reassesses the four `0901bbab` attempts as pass |
| Every journey reads through the reader | 2, 4, 5 | Each family's existing free suite stays green after migration; the guard (slice 6) finds no reader outside the allowed list |
| Guard names a stray parser (ex. 3) | 6 | Counterexample file with an `item.started` grep fails, naming it |
| Retention adds a run to the corpus (ex. 6) | 7 | A substitute attempt added by the command replays on the next run |
| Shims survive login shells (ex. 5) | 8 | Every shim name × {decoy-prepend, rebuilt-from-scratch} profile resolves to the harness; a harness missing the repair fails, naming shim and profile |

## Slices

### 1. The shared reader recognizes every command in real streams from all three hosts
Type: Behavior
Status: done
Proof: `bash scripts/test.sh tests/native-stream-replay.sh`, green, plus two
reader counterexamples that fail it.

Behavior: the corpus holds the 18 journey-mapped streams and the two Cursor
heredoc transcripts, gzipped, each with its provenance and a reviewed
`expected` (commands, stream status, response presence) → the free suite runs
the reader over each entry → the started commands and stream status match
`expected` for every entry, and each of Claude, Codex, and Cursor has at least
one entry. Reading Codex from `item.completed` only, or dropping Cursor
`tool_call`, fails and names the entry. The two weekly-limit Claude streams
read as complete with no commands.

Accepted proof: `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh
tests/native-stream-replay.sh tests/support/native-host-stream.test.mjs`,
exit 0 (0.7 s). The reader is `tests/support/native-host-stream.mjs` (CLI views
`status`, `response`, `commands`, `segments`, `outputs`); replay and the
`--variant` counterexamples are in `tests/support/native-stream-replay.mjs`.

Learnings for later slices:
- History holds 24 journey-mapped streams in 22 attempts on the listed
  commits, not 18; all are in the corpus at
  `tests/fixtures/native-streams/<host>/<family>/<case>/<attempt>/`. Attempts
  with two streams use `update-`/`use-` prefixed `events.jsonl.gz` and
  `expected`.
- Every real Codex command completes in order, so an `item.completed`-only
  reader fails only on a stream cut mid-command. Replay also cuts each entry
  after its reviewed `last-start-line`, derived independently of the reader.
- Codex `delivery/updated-use` 43e0 is harness-faulted: recorded incomplete,
  yet it ends in `turn.completed`. Its `update-expected` carries `corrected:`.
- Claude 58dd and 0152 and Codex 0585 recorded `startup-cli-count: 2`; today's
  rule counts 1 (the old counter took `--help` probes and did not dedupe).
  Slice 3 treats that field as drifted. Cursor 5692 reads 1, as expected.
- A stream cut mid-line reads `unknown`, as today's `jq -s` does.
- Slice 6's guard allows `native-stream-replay.mjs` (counterexample variants)
  and `native-host-stream.test.mjs`, and skips the binary `.jsonl.gz` files.

### 2. Publication observers read host streams through the reader
Type: Structure
Status: done
Proof: `tests/git-publication-native.sh`, `tests/git-publication-native-one-shot.sh`,
and `tests/git-publication-native-owned-context.sh` stay green.

Internal change: the publication observers get commands, outputs, and
receipts from the reader instead of their own parsing. That replaces
`git_publication_transcript_commands`/`_outputs`, the startup conflict-receipt
jq (which gains Cursor through the reader), and the story-branch-increment
push count at `git-publication-native-fixture.sh:184`. Each journey's
stream-derived observation fields come from one function per journey that
takes only the stream and host. External verdicts on the existing
counterexamples and substitute journeys are unchanged. Enables slice 3.

Accepted proof: `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh
tests/git-publication-native.sh tests/git-publication-native-one-shot.sh
tests/git-publication-native-owned-context.sh tests/native-stream-replay.sh
tests/support/native-host-stream.test.mjs
tests/support/git-publication-native-stream-fields.test.mjs`, exit 0.
`tests/git-publication-native.sh` measured 54.0 s against a 53.6 s paired
baseline.

Learnings for later slices:
- Stream fields per journey come from
  `tests/support/git-publication-native-stream-fields.mjs`
  (`publicationStreamFields(journey, host, streamPath, commandLog)`, or its CLI
  `<journey> <host> <stream> [<command-log>]` printing `key: value`), which
  reads gzipped corpus streams directly. Keys: `startup-*`
  `startup-cli-count`, `startup-conflict-observed`; `admission-*` adds
  `admit-cli-observed`, `plain-start-observed`, `existing-receipt-observed`;
  `one-shot-*` `one-shot-start-observed` (escalation adds
  `carry-admission-observed`, `edits-carried`).
- On the 18 publication corpus entries the fields equal the retained
  observations except the drift and correction slice 1 recorded.
- The reader returns `calls` (each started command with its output).
- Shape writers for slice 6's allow-list: `native-agent-admission.sh`,
  `owned_context_append_started` in the owned-context suite, the
  single-marker stream in `git-publication-native-counterexamples.sh`, and
  `git-publication-native-stream-fields.test.mjs`.

### 3. Retained publication attempts replay their stream fields and verdicts
Type: Behavior
Status: done
Proof: `tests/native-stream-replay.sh` covers examples 1 and 4.

Behavior: every publication corpus attempt with a reviewed `expected` → replay
runs its journey's stream-field function on the stream → the fields match
`expected`, and verdicts replay per the rule above. `5692` gives count 1 with
`corrected:`, the four `0901bbab` attempts pass, and the drifted `820077c3`
attempts are `not-replayable`, naming their fields. Changing a journey's
stream-field function so that one field differs from `expected` fails, naming
the attempt and the field.

Accepted proof: `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh
tests/native-stream-replay.sh tests/support/native-host-stream.test.mjs
tests/support/git-publication-native-stream-fields.test.mjs`, exit 0 (about
2 s). Field and verdict replay live in
`tests/support/native-stream-publication-replay.mjs`, which reassesses through
`tests/support/git-publication-native-reassess.sh`. The counterexamples are
the `startup-count-plus-one` and `admit-unobserved` variants.

Learnings for later slices:
- Missing fields come from instrumenting today's assessor, not from a list.
  All 14 `820077c3` attempts lack `workspace-source-published` (added in
  `9597bf61`), so no startup attempt replays a verdict. Only the four
  `0901bbab` Cursor attempts do. Claude and Codex verdict replay waits for a
  paid run added through slice 7.
- Claude 58dd and 0152 recorded count 2 because the old generic `.command`
  walk read the Bash input and its `wire_tool_inputs` copy: a harness fault,
  with `corrected:`. Codex 0585's 2 counted a `--help` probe: a rule change,
  noted with `#`.
- Slice 7's draft `expected` can reuse `publicationStreamFields` and the
  reassess helper, which stays a draft for review.

### 4. Closure and execution-review observations read through the reader
Type: Structure
Status: planned
Proof: `tests/git-publication-native.sh` (the trunk-closure, story-closure,
and native-harness counterexamples, plus substitute journeys) stays green.

Internal change: `native_completion_call_count`, `trunk_closure_finish_count`,
`story_closure_retire_seen`, and the whole-file started-event greps in the
closure assessors use the reader's started commands. That also gives Claude
coverage, which `native_completion_call_count` lacks today. External verdicts
on existing counterexamples are unchanged. Enables slice 6.

### 5. The runner and the remaining observations read through the reader
Type: Structure
Status: planned
Proof: `tests/native-stream-completeness.sh`, `tests/native-runner-failures.sh`,
`tests/native-run-timeout.sh`, `tests/native-result-retention.sh`,
`tests/native-delivery-updated-use.sh`, `tests/execution-worktree-preparation-native.sh`,
`tests/dough-adr-awareness-context.sh`, `tests/dough-adr-awareness-codex-use.sh`,
`tests/dough-update-local-guidance-rejection.sh`, and
`tests/product-backlog-native.sh` stay green.

Internal change: stream completeness (`native-run-stream.sh`) and response
extraction (`native-run-supervise.sh`, `product-backlog-native-take.sh`) come
from the reader. So do the `extractStreamCommands` and
`prep_native_extract_commands` walkers, the per-host inspection-target and
Codex-use jq, and the product-backlog use-hosts parsing. The reader gains read
targets (Read/Glob/Grep inputs, Cursor read args) only as those callers need
them. External verdicts are unchanged. Enables slice 6.

### 6. The free suite refuses host-stream parsing outside the reader
Type: Behavior
Status: planned
Proof: `tests/native-stream-replay.sh` guard, green on the tree, plus one
counterexample.

Behavior: every host-event literal in `tests/` and `scripts/` sits in the
reader or an explicitly listed shape writer → the free suite passes. A file
that greps `"type":"item.started"` → it fails naming that file (example 3).
Host coverage of the corpus stays with slice 1.

### 7. One command adds an accepted paid run to the corpus
Type: Behavior
Status: planned
Proof: `tests/native-stream-replay.sh` retention case; `tests/native-publication.md`
documents the step.

Behavior: given a retained attempt directory → the command (for example
`tests/support/native-stream-corpus-add.sh <attempt>`) gzips its stream and
copies `record`, `observations.txt`, and `response.md` into the corpus path.
It writes a draft `expected` from the retained observations and reports any
field where the reader disagrees, for review → after review, the next
free-suite run replays it. A substitute attempt proves the round trip. An
attempt without a complete stream or a `record` is refused, and the refusal
names what is missing. `tests/native-publication.md` states that accepting a
paid run adds it this way.

### 8. Every harness shim survives each host's login shell
Type: Behavior
Status: planned
Proof: `tests/git-publication-native.sh` (`run_native_harness_counterexamples`)
green, plus a counterexample.

Behavior: the harness bin holds every shim name the native fixtures write
(`node`, `gh`), enumerated from the fixtures' shim writers → under a
decoy-prepend profile and a profile that rebuilds PATH from scratch, the
emulated login shell resolves each shim to the harness. A harness set up
without `native_harness_keep_login_path` fails, naming the shim and profile
(example 5).

## Local gates

- Run changed checks through `scripts/test.sh` with Bash 5 first on PATH
  (`tests/README.md`; macOS system Bash hides `set -e` assertion failures).
- Run `dough-post-change-refactor` before each commit, as this repository's
  practice requires.
- A slice's new job must stay well under `per-job-seconds=71`. Replay does not
  enter `tests/git-publication-native.sh`.
