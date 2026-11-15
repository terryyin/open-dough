# Slice 7 — guidance defaults at shared native fixtures

Implemented uncommitted on accepted `ac99019581d30977a35999f8ed08fbbd162e2dda`.
The nine routine defaults now own their guidance loops/assertions in tests.
Cases retain explicit native entry points and credential-free noarg dispatch.
Shared fixture/preflight/assessment helpers and canonical MakeMe/release helpers
remain reusable; no check-only loader enters a native execution path.
The249-line updated-use helper is untouched. Delivery self-file flag checks in
tests name the actual native case, with independent literal expected flags.

Four new case helpers hold alternate/source fixture preflight, context setup,
installed Codex-use setup and local-guidance installation setup. Context's new
helper is explicitly hashed. Two test-only support files own the delivery
transition and backlog deterministic decision/CLI checks. No old routine-path
caller with native flags remains in executable sources.

## Proof and failure disposition

Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
The initial21-check command below exited1 solely because extracting a Bash
function stopped at a JavaScript heredoc brace, leaving its tail in the case.
The exact original function boundary was restored in test support and the
case's orphaned tail removed. The backlog default and actual native entry
renewed in the second command, terminal0. The other20 initial checks passed;
the repair changes only backlog deterministic support and preserves their
implementation/setup/assertions, so those20 observations remain applicable.

```sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i npm test -- Distribution/tests/adr-awareness/adr-awareness-codex-alternate-layout.sh Distribution/tests/adr-awareness/adr-awareness-codex-equivalence.sh Distribution/tests/adr-awareness/dough-adr-awareness-context.sh Distribution/tests/adr-awareness/dough-adr-awareness-codex-use.sh Distribution/tests/adr-awareness/dough-adr-awareness-codex-delivery-to-use.sh Distribution/tests/adr-awareness/dough-adr-awareness-cursor-delivery-to-use.sh Distribution/tests/adr-awareness/dough-adr-awareness-claude-delivery-to-use.sh Distribution/tests/product-backlog/product-backlog-native.sh Distribution/tests/installation/dough-update-local-guidance-rejection.sh Distribution/tests/adr-awareness/native-case-selection.sh Distribution/tests/adr-awareness/native-adr-behavior.sh Distribution/tests/delivery-evidence/native-delivery-updated-use.sh Distribution/tests/delivery-evidence/native-delivery-updated-use-adapters.sh Distribution/tests/native-harness/native-evidence-identity.sh Distribution/tests/native-harness/native-result-retention.sh Distribution/tests/native-harness/native-run-workspace-isolation.sh Distribution/tests/native-harness/native-run-timeout.sh Distribution/tests/native-harness/native-runner-failures.sh Distribution/tests/native-harness/native-stream-completeness.sh Distribution/tests/installation/install-omits-internal.sh Distribution/tests/installation/payload-declaration-links.sh
```

Log/exit: `/tmp/seed371-slice7-proof.log`, `-proof-exit` (1, repaired above).
This observes the actual nine routine bodies, real case listing/invalid options,
ADR clear/conflict behavior/counterexamples, controlled Codex/Cursor/Claude
updated-use success/failure/adapters, retained identity/artifacts, context
isolation/timeout/runner failure/incomplete streams, and declared-payload limits.
Setup uses existing canonical release/repository/hook builders; host substitutes
supply only the external host boundary. This is harness proof, no paid or native
qualification. Existing assertion anchors are `native-case-selection.sh:41`,
`native-adr-behavior.sh:85`, `native-delivery-updated-use.sh:49`, and
`native-updated-use-adapter-assert.sh:132` (all under Distribution/tests).
`native-evidence-identity.sh:72` independently requires the actual context entry,
new context fixture and installed-use helper; its existing per-input mutation
loop observes each input's digest change, including the newly factored helper.

```sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i npm test -- Distribution/tests/product-backlog/product-backlog-native.sh Distribution/tests/native-harness/guidance-native-entries.sh Distribution/tests/product-backlog/product-backlog-native-take-fixture.sh
```

Terminal0: `/tmp/seed371-slice7-continuation-proof.log` and matching `-exit`.
`tests/native-harness/guidance-native-entries.sh:51` invokes actual backlog
noarg entry, asserts silent output/no host call, invalid host exits2/no host,
and a valid Codex guard reaches the substituted command only after a real
installation/hook preflight, preserving the substitute's exit37.
Lines69–76 invoke actual installation `--native codex`: real tagged fixture
installation, stream reader, rejection checks and snapshots complete; a host
that changes the local guidance instead causes the case to exit1. The stub
provides refusal prose; the test proves case continuation/integrity, not an
agent's understanding. Existing Take fixture checks renew shared setup usage.

```sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i npm test -- Distribution/tests/native-harness/native-stream-replay.sh
```

Terminal0: `/tmp/seed371-slice7-replay-proof.log` and matching `-exit`.
The new substitute's exact Codex acknowledgment/completion writer has one
reasoned guard entry. Existing replay proves all retained reader observations
and guard counterexamples. No guard parser or G13 evaluation-root fix is added.

```sh
PATH=/opt/homebrew/bin:$PATH caffeinate -s -i bash -c 'set -e; for entry in Distribution/evaluation/cases/adr-awareness/adr-awareness-codex-alternate-layout.sh Distribution/evaluation/cases/adr-awareness/adr-awareness-codex-equivalence.sh Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-context.sh Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-codex-use.sh Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-codex-delivery-to-use.sh Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-cursor-delivery-to-use.sh Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-claude-delivery-to-use.sh Distribution/evaluation/cases/product-backlog/product-backlog-native.sh Distribution/evaluation/cases/installation/dough-update-local-guidance-rejection.sh; do bash "$entry"; done'
```

Terminal0 with empty output: `/tmp/seed371-slice7-dispatch-proof.log` and
matching `-exit`. All nine actual case noarg commands dispatch to their checks.

## Boundaries and integrity

Actual-diff trace against accepted base plus moved helper/function terms:
`/tmp/seed371-slice7-consumers.md`;334 rows settled in matching `-disposed.md`
(37 run,297 excluded, no blank dispositions). Each row states its purpose or
why only a generic literal/historical provenance/unchanged other writer is
reached. Controlled updated-use/context observations and identity mutation
cover actual native consumers; Take fixture covers shared backlog setup.
Installed source/payload and comparison runtime/recovery remain unchanged;
no current-baseline applicability is inferred from retained historical records.

All80 frozen inputs preserved:21 ADR fixtures,18 family fixture files and41
comparison records/archive inputs. All changed/new code <=250 lines; all shell
syntax checks and `git diff --check` pass. Owned paths are recorded exactly in
`/tmp/seed371-slice7-owned.json` (this evidence is additional planning ownership).
Original nine selections plus new identity/CLI/replay selections resolve
MakeMe=true/PageObjects=false; no browser work, timeout or scheduler changes.

Host awake on AC,100% charged, load2.75/3.19/3.36,68%free before launch;
one guarded worker, no other owned heavy proof. Every command is terminal.
Active time conservatively counted as10 minutes (running proof excluded).
No refactor/formatter/hook-owned lint/commit/push/done marking was performed.
G8/G11 remain interim until slice8's final tool-test home; G7 remains9 and
G13 remains8. No full-suite, paid session, release or installed-client change.

## Independent refactor

Removed fourteen unused native-only source/comment lines from the routine
Codex-use, context and installation checks. Fixtures/assertions and all native
case/runtime/identity inputs are unchanged. Renewed the three defaults:

```sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i npm test -- Distribution/tests/adr-awareness/dough-adr-awareness-codex-use.sh Distribution/tests/adr-awareness/dough-adr-awareness-context.sh Distribution/tests/installation/dough-update-local-guidance-rejection.sh
```

Terminal0 in `/tmp/seed371-slice7-refactor-proof.log` and `-exit`; the earlier
recorder used zsh's read-only status variable and failed before preserving the
result, so the corrected recorder renewed the same command. Remaining accepted
proof retains its implementation/setup/assertions; noarg routing is unchanged.
Own trace27 rows (11 reused/16 excluded), full scope793 (37/756), all disposed:
`/tmp/seed371-slice7-refactor-{own,head}-disposed.md`. No uncovered refactor
consumer; whitespace/code-size checks pass, all80 frozen hashes match. Fully
awakeAC/load4.23/70%free, one guarded worker; ten active refactor minutes.

## Formatter prerequisite

First fresh delivery stopped before commit on ShellCheck's sourced-global and
source-following findings in four native entries. Verified the actual helper
initializations/consumers, added accurate source hints and scoped file-wide
annotations for that shared-fixture contract. Independent comparison against
all four pre-repair snapshots confirms comments only, identical executable
lines/order and genuine helper-supplied values. No behavioral proof invalidated.
Retry uses the same guarded fresh preparation, never an older HEAD.
