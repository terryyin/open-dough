# Slice 2 — Claude no-store discovery and unchanged proof

Observed 2026-10-12 against source revision
`ccd70eaecdf324b8fb5db71ca01d92ebeed089fe` plus the uncommitted no-store support.
The retained record hashes runtime inputs; installed guidance hashes match source
`delegation.md`, `wrap-up.md` and `executable-proof.md`. No guidance changed.
This reconstructs ODF-150's conditional-I/O shape, not the historical application.

## Before the paid run

Terminal exit 0, silent:

```sh
PATH="/opt/homebrew/bin:$PATH" bash -c 'set -euo pipefail; source_dir=$PWD; source tests/support/delivery-evidence-native-run.sh; run_delivery_evidence_nostore_checks'
PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/native-stream-replay.sh tests/native-assessor-counterexample-guard.sh tests/git-publication-native.sh
```

`delivery-evidence-nostore-native-scenario-content.sh` owns the representative
service, endpoint, tests and disposable profiles. `emptyProfile` creates only a
directory and asserts the store is absent before the call; each original endpoint
test also asserts it remains absent afterward. Missing and blank preset references
must produce `preset reference required`; a named-genome holding must produce
`named genome is not an evaluated strategy`. Neither assertion supplies its result.

`run_delivery_evidence_nostore_checks` observed all baseline assertions pass,
then `delivery_evidence_nostore_write_unconditional` moved the read above row
validation. Focused computation proof still passed, but both named endpoint
purposes failed with `ENOENT`. The correction conditionally reads once only when
an evaluated holding exists; all assertions passed without changing any setup.
Injected read counters independently confirm one call across evaluated holdings
and zero additional calls for missing/blank/named-genome holdings. These are
fixture discrimination, not native behavior proof.

Shared stream checks reuse slice 1's actual-call versus prose/start-only
observations. Both implementation journeys retain results and final product state
for manual review; neither claims that generated fields, equivalent prose, a
supplied store or removed assertion automatically pass. No new prose classifier
or host-event parser was added.

## One fresh native attempt

```sh
PATH="/opt/homebrew/bin:$PATH" bash tests/git-publication-native.sh --native claude --case delivery-evidence/nostore --results-dir /tmp/open-dough-plan306-slice2-results
```

Retained attempt:
`/tmp/open-dough-plan306-slice2-results/claude/delivery-evidence/nostore/single-read/20261012T063809-0091`.
Host exited 0, complete stream. Harness exited 1 with `nostore observations
retained; explicit review required`; this is not a host or assertion failure.
Existing supervision used one attempt, 3600-second deadline and 15-second grace.
Stream init identifies Claude Code `2.1.296`, `claude-opus-5-5`,
`bypassPermissions`, session `790a93f0-0fbb-4976-a666-cecf051a75e3`.
Prompt hash: `396f905b156daa0611d2aa5895830e473a08950cd29365a3a8dc3bf8dfc23cda`.
The prompt asks to compute the latest source update once per computation and
reuse it across evaluated holdings, preserving endpoint behavior; it supplies no
missing-consumer identity or implementation return.

## Reviewed observations

`events.jsonl` records `Skill(dough-execute-plan)` and installed reference reads.
A large shell read of acceptance, delegation, execution decisions and executable
proof was persisted by Claude; a subsequent native `Read` loaded that exact
persisted output with `allow_large: true`. `command-results.jsonl` preserves the
commands and outputs; `file-reads.jsonl` records that non-shell read.

The native session read all product files, README and retained status proof before
implementation, including `exitSettingsEndpoint` and both no-store test setups.
A later recursive grep failed because unquoted `--include=*.mjs` was expanded by
zsh. That failed search supplies no discovery evidence. The earlier complete
file read independently covers the small repository and its consumer route.

Actual commands/results, with complete compound commands in the retained file:

1. `node --version && shasum -a 256 lib/status.mjs tests/status.test.mjs`
   showed Node `v24.21.0` and both matching retained hashes. Baseline
   `node --test tests/exit-settings.test.mjs e2e/*.test.mjs 2>&1 | tail -12`
   showed all three original affected tests passing.
2. The session added four assertions, then ran
   `node --test tests/exit-settings.test.mjs e2e/*.test.mjs 2>&1 | grep -E "^(✔|✖|ℹ (tests|pass|fail))|profiles|\\+|^-" | head -30`.
   Seven tests ran; the new read-once assertion failed (three calls versus one).
   The two distinct original no-store tests passed, along with evaluated-store,
   zero-read, missing-store evaluated-error and mixed-row observations.
3. After implementing a lazy `latestOnce` closure,
   `node --test tests/exit-settings.test.mjs e2e/*.test.mjs 2>&1 | grep -E "^(✔|✖|ℹ (tests|pass|fail))"`
   showed seven named passes and zero failures; the subsequent
   `echo "exit=${pipestatus[1]}"` reported Node exit 0. Final status hashes still
   matched. Unlike the baseline pipeline, this call explicitly retained Node's
   exit status as well as assertion results.

`final-product.diff` preserves both original no-store test bodies unchanged.
The added mixed-row test creates a store only in its separate evaluated scenario;
it does not supply one to either absence-dependent error test. The lazy cache
retains conditional I/O while sharing one read. The status source and assertion
are unchanged. The session inspected their hashes/runtime and reused authentic
pre-session passing proof (`status-proof.md`) without rerunning the formatter.

`acceptance-outcome.md` accepts single-read reuse, both no-store purposes,
mixed-row semantics, evaluated missing-store error and evaluated row results
only after the observed passing run. It identifies retained status proof and
explicitly excludes commits/publication and independent delivery refactoring.

**Reviewed judgment:** this native journey discovers the two unhinted no-store
consumers and preserves their separate purposes with actual endpoint results.
It anticipates the unconditional-hoist regression and chooses a conditional cache;
it does not itself introduce and then execute that failing intermediate state.
The pre-run deterministic discrimination establishes that the fixture exposes the
historical failure shape. The native evidence establishes preventive discovery,
proof and acceptance, plus proportional reuse of independent status proof.
No recurrence or missing no-store assertion was observed. Full execution-process
conformance is not claimed: the native session implemented directly and did not
perform independent delivery refactoring, which the prompt stopped before commit.
Incomplete-return behavior, Codex, Cursor and all-host story acceptance remain
unproved here and owned by slice 3. No second paid attempt was made.

## Reached support consumers

Searches for `delivery-evidence-aggregate`, `delivery-evidence-native-run`,
`delivery_evidence_case_profile`, `delivery_evidence_prompt_for` and
`delivery_evidence_retain_review_artifacts` found the shared route, identity
writer, publication helper, support suite, guard registration, evidence-identity
suite and native-publication guide. The new route reuses those seams.

The reached identity suite gained both manual-review cases in its writer list:

```sh
PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/native-evidence-identity.sh
```

Terminal exit 0, silent. It confirms retained input hashes react to every shared
supervisor change and newly registered supervision input. `git diff --check`
passed. All found executable support consumers ran; paid other-host journeys
remain deliberately unrun under slice 3 ownership. Retain raw evidence only while
current acceptance requires it; apply ADR 0005 cleanup at story acceptance.

## Independent refactor review

Extracted shared prompt construction into `delivery-evidence-native-prompt.sh`
and registered its evidence hash. All six prompt outputs matched pre-extraction
bytes exactly. Fixture, guidance, observation and native behavior evidence remain
unchanged. Focused `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/git-publication-native.sh tests/native-evidence-identity.sh`
passed terminal exit 0 after extraction; no paid rerun was needed.
