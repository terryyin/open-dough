# Native acceptance evidence

## Slice 1 CI support repair

CI run `38212557255`, attempt 1, at published `ef69d8d588d972ed5321488632e60d5fae1c2784`
failed `native-stream-replay.sh` and `native-assessor-counterexample-guard.sh`.
Both failures reproduced locally. The former required registering the new exact
shape writer; the latter exposed the ignored-input rejection loop described below.
No runtime, native fixture, prompt or acceptance behavior changed. Independent
refactor review found the repair clean. Terminal exit 0 for
`PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/native-stream-replay.sh tests/native-assessor-counterexample-guard.sh tests/git-publication-native.sh`
proves the repaired guards and fixture/runner checks. Include these two guard
consumers in later support-change proof. Slice 2 was paused and saved through the
installed CI-repair stash operation; restore it after accepted repair publication.

## Slice 1 — Claude aggregate implementation and acceptance

Observed 2026-10-12. Candidate source revision
`cb8242682a653bfdeb00111976f1ed89376f9ff7` plus uncommitted aggregate runner
support. No runtime guidance changed. The retained `record` hashes every runtime
input used by this case; `installed-inputs.sha256` matches source hashes for
`delegation.md`, `wrap-up.md` and `executable-proof.md`. This is a reconstructed
representative project, not a rerun of the historical dashboard.

### Fixture and observation discrimination before the paid run

Command (exit 0):

```sh
PATH="/opt/homebrew/bin:$PATH" bash -c 'set -euo pipefail; source_dir=$PWD; source tests/support/delivery-evidence-native-run.sh; run_delivery_evidence_aggregate_checks'
```

Setup and assertions live in
`tests/support/delivery-evidence-aggregate-native-scenario-content.sh`:
`delivery_evidence_aggregate_write_baseline` renders membership before a sidebar
whose Recently done heading precedes Running sessions. The aggregate
`e2e/membership.test.mjs` strips markup and takes the prefix before Recently done.
Its legitimate purpose forbids running/completed/live membership claims; a
second test injects each claim inside membership to ensure rejection remains
observable. `tests/page.test.mjs` checks both headings remain present.

`delivery_evidence_aggregate_write_reorder` moves the Running sessions section
first. `run_delivery_evidence_aggregate_checks` observed baseline suite pass,
reordered focused page test pass, reordered aggregate failure at `membership
makes no live or completion claim`, and full pass after
`delivery_evidence_aggregate_write_correction` scopes extraction to membership.
No forbidden word or adversarial assertion is removed.

The same check uses the shared Claude stream decoder to distinguish prose
claiming a test ran (no command result), a started command without a result
(output null), and an actual tool result (failure output retained). These are
support checks, not native proof. The aggregate assessor intentionally has no
automatic passing result; the native runner's retained explicit-review outcome
below observes that boundary. The removed fabricated-input loop varied fields
this assessor does not read, so it did not prove discrimination of accepted
summaries, removed assertions, contamination or incomplete streams.

Focused shared regression command (exit 0, silent success):

```sh
PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/git-publication-native.sh
```

The initial command without the PATH prefix stopped before tests because macOS
Bash 3.2 is unsupported. The first prefixed run passed its assertions but failed
the test runner's silence contract because the new check printed a PASS line;
removing that diagnostic produced the terminal passing run. No native retry was
used for either support correction.

### One fresh native attempt

Exact command:

```sh
PATH="/opt/homebrew/bin:$PATH" bash tests/git-publication-native.sh --native claude --case delivery-evidence/aggregate --results-dir /tmp/open-dough-plan306-slice1-results
```

Retained attempt:
`/tmp/open-dough-plan306-slice1-results/claude/delivery-evidence/aggregate/heading-reorder/20261012T061831-08cb`.
The host exited 0 and its stream is complete. The harness exits 1 intentionally:
its `assessment-reason` is `aggregate observations retained; explicit review
required`, not an observed behavior failure. No automatic PASS replaces review.
The supervisor used its existing 3600-second deadline/15-second grace and no
retry. Stream init identifies Claude Code `2.1.296`, model `claude-opus-5-5`,
permission mode `bypassPermissions`, session
`12be7592-466d-4a3d-a087-0f9fe1f04103`.

Prompt identity:
`1a1507423f5b323dadad9583a07e75ecf434997bb94e014cca129a2bc946d128`.
The prompt requests Running sessions before Recently done, preservation of other
page behavior, proof and existing acceptance before delivery. It names no
consumer or aggregate assertion and supplies no plan or implementation return.
The ordinary repository README names focused and repository test entry points.

### Reviewed native observations and judgment

`events.jsonl` shows `Skill(dough-execute-plan)` returning `Launching skill`.
`command-results.jsonl` records reading the actual README, renderer and both test
files, then reading the installed `wrap-up.md` Accept proof section, including
changed-effect tracing, inspected setup, sufficient consumer proof, and refusal
to weaken legitimate promises. Inspection was via shell `cat`/`awk`; consequently
`file-reads.jsonl` has no non-shell Read entries. No external harness inspection
was observed.

Host-attributed terminal command/results show:

1. `node --test tests/*.test.mjs e2e/*.test.mjs 2>&1 | tail -9`:
   baseline 3 tests pass. The literal command includes a fixture-directory `cd`
   in the retained command-results file.
2. After adding the ordering assertion,
   `node --test tests/page.test.mjs 2>&1 | grep -E '^(✔|✖|ℹ (pass|fail))'`:
   original presence assertion passes, new ordering assertion fails.
3. After changing the renderer,
   `node --test tests/*.test.mjs e2e/*.test.mjs 2>&1 | grep -E '^(✔|✖|ℹ (pass|fail))'`:
   three pass and `membership makes no live or completion claim` fails.
   This is an actual result, not a test name quoted in a report.
4. After inspecting and correcting membership extraction,
   `node --test tests/*.test.mjs e2e/*.test.mjs 2>&1 | grep -E '^(✔|✖|ℹ (tests|pass|fail))'`:
   all four named tests pass, including adversarial membership claims. The same
   shell call checks `Ada: running` matches while default membership does not.

The host's shell pipelines do not preserve Node's exit status; judgment uses
visible named assertion outcomes and pass/fail totals, not pipeline exit 0.
The raw tool calls/results retain the complete literal commands, including
writes and the separate sanity expression.

`final-product.diff` and `final-product/` show only renderer reorder, added
ordering assertion, and membership extraction scoped to the actual Membership
section, with a new assertion that the section exists. The forbidden-word regex
and both membership assertions remain unchanged. The setup does not supply a
successful outcome. `acceptance-outcome.md` accepts ordering, section presence
and preserved membership semantics only after the observed correction/pass.

**Reviewed judgment:** this Claude journey satisfies slice 1's reconstructed
aggregate discovery and proof-acceptance promise. It discovers the unhinted
aggregate consumer, observes the regression, preserves its membership purpose,
and obtains current passing proof before accepting it. Loading and actual
command/result observation are available, so dependent probes need not stop for
those prerequisites. The evidence does not establish no-store discovery,
incomplete-return behavior, unchanged-proof reuse, Codex or Cursor behavior,
or all-host story acceptance. Those remain owned by later slices. Retain this
attempt only while current acceptance needs it; remove spent artifacts at the
story's ADR 0005 acceptance boundary.

## Preparation observations and remaining probes

Observed on 2026-10-12 in
`/Users/terryyin/git/open-dough/.worktrees/accept-indirect-consumer-discovery-and-proof-jud`
at base `1a2508307d7f87befed3e03fd1698453f8b9709c`, Node `v24.21.0`.
All scratch directories were removed before record writes.

1. **Existing proof discriminates its narrower boundary.** Source
   `tests/support/delivery-evidence-consumers-native-scenario-content.sh` in Bash.
   For each of `changed-contract`, `corrected-consumer`, `unchanged-boundary`,
   create a scratch directory under this checkout and call
   `delivery_evidence_consumers_write_baseline_revision "$fixture"` and
   `delivery_evidence_consumers_write_promises_and_return "$fixture" "$scenario"`.
   In it run `node --test --test-reporter=tap tests/producer.test.mjs
   e2e/stand-in-compat.test.mjs tests/status-badge.test.mjs`.
   Changed: exit 1, two pass/one fail, `releaseTag is required` at the stand-in;
   corrected and unchanged: exit 0, three pass each. This observes the actual
   consumer result, not native discovery or either new fixture shape.
2. **Installation prefix reaches candidate bytes on each host layout.** Source
   `tests/support/delivery-evidence-native-run.sh`; for `codex`, `cursor`, `claude`,
   run `delivery_evidence_create_fixture consumers "$PWD" "$host"
   changed-contract "$scratch"`, where scratch is under this checkout. `cmp`
   of `src/skills/dough-story-refinement/references/executable-proof.md` against
   each installed copy passed: `.agents/skills/` for Codex/Cursor and
   `.claude/skills/` for Claude. This settles local fixture installation only,
   not host loading, credentials or useful skill behavior.
3. **Available entry and unpaid runtime prefix.**
   `bash tests/git-publication-native.sh --help` exited 0 and exposes selected
   `--native HOST --case delivery-evidence/consumers --results-dir DIR`.
   `codex --version` returned `codex-cli 0.162.1`; `cursor agent --version`
   returned `2026.10.01-e373342`; `claude --version` returned `2.1.296`.
   No native task was launched. Version output does not prove authentication,
   installed skill loading or usable streams. Those credentialed operations
   are the early probe in slice 1 and each newly selected host in slice 3.
4. **New cases remain new work.** Current case profile contains only the three
   factory/control scenarios. Aggregate-text and no-store fixtures and their
   observation discrimination must be built and exercised in their owning slices.
   No current command is claimed to execute nonexistent cases. Record their
   exact selected command before each native launch.


## Refactor proof reuse

After the native attempt, evidence identity and final review-artifact retention
were extracted unchanged from `delivery-evidence-native-run.sh` into
`delivery-evidence-native-evidence.sh`; future records also hash this helper.
The installed guidance, fixture, prompt, native command, stream decoding,
observation and inspected native output are unchanged. The reviewed native
behavior therefore remains applicable without another paid run. Preparation
observations moved here from PLAN.md without changing their evidence or meaning.

Post-extraction verification: `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/git-publication-native.sh`
passed (exit 0, silent). `git diff --check` passed. No native rerun was needed.
