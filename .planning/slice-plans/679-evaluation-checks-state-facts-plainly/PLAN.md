# Evaluation shell checks state each fact in one line at the family entry

**Identity:** SEED-396#replace-evaluation-shell-checks
**Source:** [Evaluation shell checks state each fact in one line at the family entry](../../seeds/SEED-396-evaluation-javascript-tests.md#replace-evaluation-shell-checks)

## Goal and scope

A maintainer changing native evaluation behavior reads and writes shell
checks that state each expected fact in one line, and one guideline in
`Distribution/evaluation` says where a check enters, what it leaves untested,
and which words it uses.

Included: a test-only expectation vocabulary with its own check, the six
run-entry checks rewritten onto it with every fact kept, and the guideline in
`Distribution/evaluation/README.md` and `native-family-layers.md`.

Excluded: removing or merging any check, changing where a check enters,
other families' checks, `cases/`, `src/`, `Distribution/tests`, the
`node --test` files, JavaScript replacement, and Bach.

## Outside-in proof

| Key example | Signal |
| --- | --- |
| A fact in one line | Each rewritten check has no `FAIL:` line and no private cleanup trap, and passes through `bash scripts/test.sh` |
| A failed expectation shows its evidence | The vocabulary's own check runs a failing expectation and reads the named fact, expected and actual values, and the printed evidence from its output, with a non-zero status |
| Same facts after the rewrite | One scratch break per check, named in its slice, fails the check before and after the rewrite |
| Data stays in one place; entry, not helper | The guides state both rules; the next real change to a check judges them |

## Premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| The six run-entry checks pass as named paths | Every slice's focused proof | `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh` with the six paths, this workspace at `d06fbd825`, 2026-11-17 | exit 0, 73 s wall |
| A helper under `support/` is not scheduled as a job | Slice 1 adds the helper | Read `scripts/test-jobs.sh`: evaluation discovery excludes `*/support/*` | Not a job |
| Vocabulary lines do not trip the rejected-case guard | Slices 2–6 state `assessment-status` and `execution-status` facts | Scratch-appended three `native_check_expect_*` lines to `native-run-timeout.sh`, ran `native-assessor-counterexample-guard.sh`, reverted, same workspace and date | Guard exit 0 |
| The six checks call four production functions | Slices 2–6 keep those calls | `grep` of the six files | `native_result_assert_no_discovery_fields` (4 checks), `native_host_stream` (2), `native_run_watchdog` with `native_run_owned` (watchdog cleanup), `native_run_write_output` (workspace isolation) |

Each check's discrimination under its named break is observed inside its
slice, before the rewrite; a check that stays green under its break stops
that slice and changes the plan.

## Slices

### 1. A failed expectation names its fact and prints its evidence
Type: Behavior
Status: planned

Behavior: a check sources
`Distribution/evaluation/tests/native-harness/support/native-check-expectations.sh`
and states a fact that does not hold → the job exits non-zero and standard
error names the fact with its expected and actual values and prints the
evidence read. A fact that holds prints nothing. The words cover: a scratch
workspace removed at exit, running an entry with substitute hosts first on
`PATH` while keeping its status, standard output and standard error, and
expecting a status, a record field, a line in a file, and an absent path.

Proof: new `tests/native-harness/native-check-expectations.sh` runs each
word in a subshell on a passing and a failing fact and reads the status and
output. Run it through `bash scripts/test.sh`.

### 2. The timeout check states its facts through the vocabulary
Type: Behavior
Status: planned

Behavior: `native-run-timeout.sh` keeps every fact it asserts today, each as
one vocabulary line or an existing one-line test, with no `FAIL:` block and
no private cleanup trap. Add a word only when two facts need it.

Proof: scratch break — make the substitute-host run retry once after the
deadline (or, if no such switch exists, drop the deadline kill in
`src/native-run-watchdog.sh`); the check fails before and after the rewrite,
then passes with the break reverted.

### 3. The result-retention check states its facts through the vocabulary
Type: Behavior
Status: planned

Behavior: as slice 2, for `native-result-retention.sh`.

Proof: scratch break — skip copying `events.jsonl` into the retained
attempt in `src/native-result-retain.sh`; fails before and after, passes
when reverted.

### 4. The runner-failures check states its facts through the vocabulary
Type: Behavior
Status: planned

Behavior: as slice 2, for `native-runner-failures.sh`.

Proof: scratch break — record a launch failure as `execution-status:
completed`; fails before and after, passes when reverted.

### 5. The stream-completeness check states its facts through the vocabulary
Type: Behavior
Status: planned

Behavior: as slice 2, for `native-stream-completeness.sh`.

Proof: scratch break — accept a truncated stream as complete in the shared
reader; fails before and after, passes when reverted.

### 6. The watchdog-cleanup and workspace-isolation checks state their facts through the vocabulary
Type: Behavior
Status: planned

Behavior: as slice 2, for `native-run-watchdog-cleanup.sh` and
`native-run-workspace-isolation.sh` (181 lines together). Both keep their
current calls into `native-run-supervise.sh`; moving them to the command is
the sibling story's.

Proof: scratch breaks — leave the owned child alive in the watchdog, and
write run output inside the project workspace; each check fails before and
after, passes when reverted.

### 7. The evaluation guides state the entry, data and vocabulary rules
Type: Behavior
Status: planned

Behavior: a maintainer adding a check reads, in
`Distribution/evaluation/README.md` and `native-family-layers.md`, the five
rules in the story's Scope and the vocabulary's words by name, with
`native-run-timeout.sh` as the example. The guides no longer tell a new
check to source `src/` helpers; the `src/` reuse list is addressed to
family code.

Proof: read both guides against the story's Scope; the Distribution
documentation and link checks that cover these files pass through
`bash scripts/test.sh`.

## Current decisions

- The vocabulary is one file of `native_check_`-prefixed functions. It adds
  no test runner, no named test cases and no mocking. Bach is not adopted;
  the seed records why.
- `native_result_assert_no_discovery_fields` and `native_host_stream` stay
  called as today: the first is production's own record assertion and the
  second is the shared reader the family guide names.
- A fact already stated in one line (`[[ -d … ]]`, `grep -Fq …`) may stay
  as it is when its failure needs no evidence beyond the line itself.

## Learnings

None yet.

## Preparation review

Slice-plan refinement was not needed: seven slices, each one check file or
one helper with one proof loop. No slice-specific concern remains from this
review. The scratch breaks in slices 2–6 name the intended fault; the
executing agent picks the exact edit and stops the slice if the unrewritten
check stays green.

## Verification and delivery

Apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Local gate per slice: the changed checks and
`Distribution/evaluation/tests/native-harness/native-assessor-counterexample-guard.sh`
through `bash scripts/test.sh`. Before landing: `npm run test:evaluation`
under `caffeinate -s -i` on AC, because the helper sits beside support files
other evaluation checks source.
