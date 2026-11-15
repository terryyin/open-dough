# ADR acceptance home evidence

Slice 2; base `47478eacb64f35121d5cfafce24a87f391645db7`.
Thirteen ADR family/entry files and 21 reusable fixture files move to
`evaluation/cases/adr-awareness/`. Existing routine entries dispatch the moved
case scripts with the original arguments. Canonical release, installation and
MakeMe helpers remain in tests; the six delivered reader paths remain intact.
Other families and remaining runtime stay at their current locations.

README gives the actual listing/native context commands and links the maintained
ADR guide, whose live paths now use the case home (C07). Existing case IDs, host
options, deadlines, retention and lifecycle remain unchanged. The 21 moved fixture
files were compared byte-for-byte with HEAD. No captured stream, archived record,
comparison basis or installed-guidance bytes changed.

## Proof and observations

All commands use Homebrew first on PATH, two runner jobs and `caffeinate -s -i`.
The awake shared Mac was on AC, natural load 9.11, with initial memory 56% free;
no other owned heavy verification. No real or paid native host ran.

1. Terminal pass:
```sh
OPEN_DOUGH_TEST_JOBS=2 caffeinate -s -i npm test -- Distribution/tests/adr-awareness/adr-awareness-codex-alternate-layout.sh Distribution/tests/adr-awareness/adr-awareness-codex-equivalence.sh Distribution/tests/adr-awareness/dough-adr-awareness-claude-delivery-to-use.sh Distribution/tests/adr-awareness/dough-adr-awareness-codex-delivery-to-use.sh Distribution/tests/adr-awareness/dough-adr-awareness-codex-use.sh Distribution/tests/adr-awareness/dough-adr-awareness-context.sh Distribution/tests/adr-awareness/dough-adr-awareness-cursor-delivery-to-use.sh Distribution/tests/adr-awareness/native-adr-behavior.sh Distribution/tests/adr-awareness/native-case-selection.sh Distribution/tests/delivery-evidence/native-delivery-updated-use.sh Distribution/tests/delivery-evidence/native-delivery-updated-use-adapters.sh Distribution/tests/native-harness/native-journey-state.sh Distribution/tests/native-harness/native-stream-replay.sh Distribution/tests/native-harness/native-evidence-identity.sh Distribution/tests/native-harness/native-assessor-counterexample-guard.sh Distribution/tests/installation/dough-update-local-guidance-rejection.sh
```
`native-case-selection.sh` invokes the new entries: listing has no host launch,
all supported selections/retention metadata remain, and invalid combinations fail.
Context/use wrappers perform real three-platform installation/snapshot assertions.
Delivery wrappers exercise `delivery_run_deterministic_transition`; updated-use
substitutes observe real update/use execution and retained helper/fixture identity.
ADR assessor checks use declared rejected signals through the shared helper.
Replay reads retained streams through real readers and assessors; identity mutates
real input bytes and checks their hashes/closure. The guard now scans evaluation
as well as tests. Setup supplies fixture/start state, never a native verdict.

2. Terminal pass:
```sh
OPEN_DOUGH_TEST_JOBS=2 caffeinate -s -i npm test -- Distribution/tests/native-harness/native-runner-failures.sh Distribution/tests/native-harness/native-run-timeout.sh Distribution/tests/native-harness/native-run-workspace-isolation.sh Distribution/tests/native-harness/native-result-retention.sh Distribution/tests/native-harness/native-stream-completeness.sh Distribution/tests/native-harness/native-run-watchdog-cleanup.sh Distribution/tests/native-harness/native-assessor-counterexamples.sh Distribution/tests/installation/install-omits-internal.sh Distribution/tests/installation/payload-declaration-links.sh
```
The migrated context entry runs through real supervision with controlled hosts:
missing/nonzero/denied hosts, timeout, owned-process cleanup, workspace isolation,
truncated/missing streams and immutable result directories retain their outcomes.
Install checks enumerate three-platform managed bytes and exclude evaluation.

3. Terminal pass after following retention into copied source closures:
```sh
OPEN_DOUGH_TEST_JOBS=2 caffeinate -s -i npm test -- Distribution/tests/native-comparison/native-comparison-pairs.sh Distribution/tests/native-comparison/native-comparison-incomplete.sh Distribution/tests/native-comparison/native-comparison-refresh.sh Distribution/tests/support/native-admission-reuse.test.mjs
```
Comparison/admission snapshots include the moved ADR assessor's real source
closure. The same comparison entries exercise real Git basis/recovery, pair
assessment and incomplete-run refusal. Admission reuse checks preserved evidence,
identity comparison and refusal. This updates location inputs, not comparison
behavior. `npm run typecheck:dashboard` separately reached terminal 0.

## Consumer trace and interim

Installed consumer-trace command is retained with raw and disposed output:
```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . --base 47478eacb64f35121d5cfafce24a87f391645db7 --term Distribution/tests/support/native-adr-behavior.sh --term Distribution/tests/fixtures/adr-awareness --term Distribution/tests/adr-awareness/dough-adr-awareness-context.sh
```
Trace and whitespace checks reached terminal 0. All 1,249 located rows have dispositions.
Raw `/tmp/seed371-adr-consumers-final.md`; dispositions are in
`/tmp/seed371-adr-consumers-disposed.md`. Changed files are not searched by this
script; their source/caller diffs were inspected and exercised above. Dynamic
host-entry prefixes, retention helper/fixture/assessor identity lists, source-relative
imports and copied fixture closure use the new home. Unchanged timing-report
fixtures and automated wrapper labels stay intact. Other matches are historical
observations or unchanged API/scenario wording from whole moved bodies.

G8 remains interim through slice 6. The seven mixed default branches are guidance
checks: equivalence/alternate-layout skill wording, installed-use/context payload
and preservation, and three ordinary release/update transitions. Extract these
back into guidance tests at final layout. `native-case-selection.sh` and
`native-adr-behavior.sh` are tool checks, with lifecycle/identity/replay checks;
they belong in evaluation/tests at slice 6. No native session is started in
routine mode. Test-entry selection applied MakeMe and no page-object convention.
All changed files are <=250 lines. No known uncovered ADR relocation consumer.
