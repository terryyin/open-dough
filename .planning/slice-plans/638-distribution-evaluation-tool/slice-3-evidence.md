# Remaining-runtime acceptance evidence

Slice 3; tested candidate based on `bc2bc0ac8b236e992fdabc7da21879297ac13938`.
`31b673533eef27cbd577bceae8ffa331bb2ff87a` changes planning records only; the
same runtime bytes were restored from the verified attempt-3 manifest. Keep the
full 15-active-minute implementation/diagnosis history. The initial review made no
implementation or test run. The bounded correction below follows the runtime-only
refinement, retaining the earlier full history and independent G7 owner.

Twenty-five original shared modules plus the retained-attempt reader move from
test support to evaluation/src. At initial acceptance, thirteen original bodies were byte-identical;
the other bodies change documented identities,
source/import resolution or G5's owner search. Delivered reader/ADR paths,
canonical builders and the three test-only identity helpers remain in place.

## Retained terminal commands

Commands use Homebrew first on PATH, two runner jobs and `caffeinate -s -i` on
the awake shared Mac, AC power, observed load 5.20 and 54% free memory. All
commands below are retained from the implementation handoff, not rerun here.

1. Terminal exit 1 only for G5 before its repair; the other nine checks passed:
```sh
export PATH=/opt/homebrew/bin:$PATH
OPEN_DOUGH_TEST_JOBS=2 caffeinate -s -i npm test -- Distribution/tests/native-harness/native-runner-failures.sh Distribution/tests/native-harness/native-run-timeout.sh Distribution/tests/native-harness/native-run-watchdog-cleanup.sh Distribution/tests/native-harness/native-run-workspace-isolation.sh Distribution/tests/native-harness/native-result-retention.sh Distribution/tests/native-harness/native-evidence-identity.sh Distribution/tests/native-harness/native-stream-replay.sh Distribution/tests/support/native-codex-owned-proof.test.mjs Distribution/tests/support/native-admission-reuse.test.mjs Distribution/tests/git-publication/git-publication-native.sh
```
Failure/timeout/watchdog/isolation/retention checks start at the real supervisor
with controlled hosts, observing terminal failures, owned-process cleanup and
immutable prior results. Wire/corpus fixtures supply inputs, not verdicts.
`native-codex-owned-proof.test.mjs`'s fixture writes actual Codex rollout shapes;
assertions distinguish current ownership, forked/copied history, failure and
unknown proof. Standalone comparison sourcing and runner silence cover G4.
Admission `setup()` creates a real copied Git source; `compare()` invokes the
CLI, observing compatibility/refusal and retained-evidence preservation.

2. Terminal pass after G5 repair:
```sh
OPEN_DOUGH_TEST_JOBS=2 caffeinate -s -i npm test -- Distribution/tests/git-publication/git-publication-native.sh Distribution/tests/native-harness/native-evidence-identity.sh Distribution/tests/native-comparison/native-comparison-pairs.sh Distribution/tests/native-comparison/native-comparison-refresh.sh Distribution/tests/native-comparison/native-comparison-incomplete.sh
```
Publication reaches `run_native_harness_counterexamples` and the moved
`native-harness-observation.sh`: actual owner discovery, login-shell shim
resolution and deliberately lost-shim counterexamples cover G5.
Identity's supervision-list probe and per-input mutation use canonical
`capture_identity_hashes()` against copied source and real writers/import closure.
This proves listed inputs, not omitted shell/native-entry inputs (see G9).
Pair checks observe actual verdicts and pinned payload/source identities;
refresh checks recover committed bases and print immutable original records;
incomplete checks observe refusal/retention through real setup and assessors.

3. Terminal pass:
```sh
OPEN_DOUGH_TEST_JOBS=2 caffeinate -s -i npm test -- Distribution/tests/adr-awareness/native-case-selection.sh Distribution/tests/support/native-import-closure.test.mjs Distribution/tests/support/native-host-stream.test.mjs Distribution/tests/native-harness/native-assessor-counterexamples.sh
```
Case selection invokes entries/listing/invalid options; closure tests inspect
real imports; stream tests observe real decoded views; assessor counterexamples
change declared signals and require rejection. These are not native qualification.
`npm run typecheck:dashboard` separately reached terminal 0.

4. Terminal pass:
```sh
export PATH=/opt/homebrew/bin:$PATH
OPEN_DOUGH_TEST_JOBS=2 OPEN_DOUGH_TEST_TIMES=/tmp/seed371-one-shot-times.txt caffeinate -s -i npm test -- Distribution/tests/git-publication/git-publication-native-one-shot-results.sh Distribution/tests/git-publication/git-publication-native-one-shot-reviews.sh Distribution/tests/git-publication/git-publication-native-one-shot-workspaces.sh
```
Wrappers reach `run_substitute_one_shot_*_journeys`; `substitute_run_passes()`
checks actual status and assessment after real start/delivery/completion CLIs,
followed by real-state counterexamples. Times: 72.3s, 35.1s, 83.8s.
The unchanged aggregate diagnostic passed in 107.2s (time file retained in
attempt-3.md). Its full launch command is not copied into this handoff; it is
not accepted as a causal G7 repair. G7 remains independently owned by slice 7.

## Inspected consumer and import boundaries

Map: `/tmp/seed371-runtime-moves.json`. Existing source roots, module-relative
imports, copied-source inventory and actual caller diffs were inspected.
No literal deleted full runtime path remains outside captured/basis history.
G4's comparison runner sources supervision/Codex/observation/retention from its
physical module path without requiring caller source_dir. The identity inventory
correctly retains the supplied copied source_dir boundary.

The trace at `/tmp/seed371-runtime-consumers-final.md` was produced against bc2bc0ac;
only records changed before restoration. All 904 listed unchanged-file rows now
have dispositions in `/tmp/seed371-runtime-consumers-disposed.md`. Most are
unchanged API/field tokens inferred from whole moved bodies or immutable history.
Current timing labels still name existing tests. The scanner excludes changed
files; their actual source/copy/identity callers are covered above or explicitly
pending below. No unobserved path is silently deferred to CI.

## Bounded acceptance correction and renewed observations

G9 is corrected: the updated-use writer hashes the actual selected native entry
under cases/adr-awareness, not its thin routine wrapper. The independent expected
journey-input row names the actual Codex entry. The existing mutation loop then
changes that entry's bytes and checks its reported digest changes.

After adding the expectation but before fixing the writer, this command exited 1:
```sh
export PATH=/opt/homebrew/bin:$PATH
OPEN_DOUGH_TEST_JOBS=2 caffeinate -s -i npm test -- Distribution/tests/native-harness/native-evidence-identity.sh
```
Observed failure: `native_result_journey_input_hash_lines omits journey input
Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-codex-delivery-to-use.sh`.
Red log: `/tmp/seed371-runtime-g9-red.log`. The path correction makes it pass.

G10's shared reader is now `evaluation/src/native-stream-retained-attempt.mjs`.
Operational admission assessment and corpus-add import that same implementation;
API/refusal behavior is unchanged. Family-owned publication fields/replay/reassess
helpers remain explicitly for slice 4, so G10 stays interim through that slice.

All six following checks reached terminal 0 after both corrections:
```sh
export PATH=/opt/homebrew/bin:$PATH
OPEN_DOUGH_TEST_JOBS=2 caffeinate -s -i npm test -- Distribution/tests/native-harness/native-evidence-identity.sh Distribution/tests/delivery-evidence/native-delivery-updated-use.sh Distribution/tests/delivery-evidence/native-delivery-updated-use-adapters.sh Distribution/tests/native-comparison/native-comparison-baselines.sh Distribution/tests/support/native-admission-reuse.test.mjs Distribution/tests/native-harness/native-stream-replay.sh
```
The identity check observes expected native-entry inclusion and content sensitivity.
Both updated-use checks observe the actual two-stage record/adapter identity
through controlled Codex/Cursor/Claude hosts and declared assessor signals.
Baselines exports/reassesses with the moved observation helper after raw cleanup,
asserting the archive hash remains unchanged (native-comparison-baselines.sh's
raw-cleanup/reassessment section). Admission setup materializes real source/Git
state and the CLI observes compatibility/refusal plus retained bytes. Replay
exercises the corpus-add importer/shared retained reader, refusing incomplete
streams and comparing reviewed corpus outcomes through actual assessors.
`npm run typecheck:dashboard` separately reached terminal 0. `git diff --check`
passed. Current host was awake on AC, natural load 4.67; proof used two jobs and
`caffeinate -s -i` with no other owned heavy command. No real or paid host ran.

Fresh current-diff trace reached terminal 0:
```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . --base 31b673533eef27cbd577bceae8ffa331bb2ff87a --term Distribution/tests/support/native-stream-retained-attempt.mjs --term native_result_journey_input_hash_lines
```
Raw `/tmp/seed371-runtime-correction-consumers.md`; all 1322 rows are disposed in
`/tmp/seed371-runtime-correction-consumers-disposed.md`. Existing valid dispositions
are reused; added rows are unchanged API/body/field or planning/history references.
Specific retained-reader/identity terms found no additional unchanged-file caller.
The changed actual importers/identity writer are separately inspected in that
record and exercised by the renewed checks above. Historical records stay intact.

G7 remains pending slice 7 and G8 remains owned by slice 6. No timeout, scheduler, assertion
weakening, installed-guidance or payload change was made. The bounded correction
adds no missing family implementation; G10's family portion remains owned by slice 4.

## Independent refactor acceptance

The independent pass consolidated physical runtime-root resolution in 15 shell
owners; no data, assertion, scheduler or family migration changed. Twelve focused
checks reached terminal 0 with one worker under `caffeinate -s -i` (awake AC Mac,
load 15.60, 52% free). Supervisor, identity, selection/import, updated-use, publication,
comparison pairs and standalone-source observations were renewed; archive/replay,
admission, retention, one-shot group and typecheck proof stayed applicable.
All 123 refactor consumer rows are disposed in
`/tmp/seed371-runtime-refactor-consumers-disposed.md`; exact command arguments are
in `/tmp/seed371-runtime-refactor-trace-command.json`. No gap emerged. Current
byte-identical count is 14 of the original 25 relocated modules; the import-closure
wrapper now reuses its original cached-directory implementation.

```sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i npm test -- Distribution/tests/native-harness/native-runner-failures.sh Distribution/tests/native-harness/native-run-timeout.sh Distribution/tests/native-harness/native-run-watchdog-cleanup.sh Distribution/tests/native-harness/native-run-workspace-isolation.sh Distribution/tests/native-harness/native-evidence-identity.sh Distribution/tests/adr-awareness/native-case-selection.sh Distribution/tests/support/native-import-closure.test.mjs Distribution/tests/delivery-evidence/native-delivery-updated-use.sh Distribution/tests/delivery-evidence/native-delivery-updated-use-adapters.sh Distribution/tests/git-publication/git-publication-native.sh Distribution/tests/native-comparison/native-comparison-pairs.sh Distribution/tests/support/native-codex-owned-proof.test.mjs
```
