# Launch-command tests: refactor tests after a real launch change

A bounded test-refactoring request over the tests that observe the launch
command, in the real project state a frozen effort replay left behind. The
participant receives only the task and the project; the observer keeps the
final change and runs the owning backend specs and their unchanged E2E
consumer itself.

## Selection

- workflow: test refactoring after a product change (launch-command tests, Open Dough dashboard)
- behavior: refactor the launch-command boundary specs and their E2E consumer without changing product behavior
- hosts: codex (not yet qualified); claude, cursor: not qualified
- qualification: none yet; its own baseline comes from one frozen native capture (plan 674, slice 4)
- environment: whole Open Dough checkout at a pinned revision with a tracked overlay; no external services
- prerequisites: Bash 5, Git, Node 24, jq, npm registry or cache access, Playwright Chromium; a logged-in Codex CLI for explicit native capture
- decisions and proof: notice the incidental command details the owning specs and the unchanged E2E consumer depend on, refactor them to the launch behavior they protect, and run that proof
- duration: about 21 s preparation and 60 s observer proof at load 30 (2026-11-17); no native turn measured yet

## Source and extraction

The project starts at origin `4b75c28885e49ace352561cad01907926e066fdd`
(fetched from `NATIVE_GUIDANCE_CHECK_OPEN_DOUGH_SOURCE`, default the public
repository). `overlay/` holds the whole bytes at commit `8b9005acc` of
exactly the 33 paths `git diff --name-only 4b75c2888 8b9005acc -- dashboard
e2e` names (31 modified, 2 added, none deleted): the dashboard and E2E
changes of the frozen Codex B replay of the effort story, which is not on
origin. The fixture copies the tree over the checkout and commits it as the
starting state; `case_project_basis` names the tree by the sha256 of its
sorted file manifest.

The frozen replays stay provenance, never matched arms: the original A
`4b75c2888..eda73008b` with completion `c741f265f`, and both frozen Bs (Codex
`8b9005acc`/`57f805ee2`, Claude `9cd8ee5f2`). The corrected comparison that
names the missed consumer is assessor-only provenance.

Differences from the original whole-story task: the participant does not
implement the effort story; it starts from B's finished product and test
code and receives a bounded refactoring request over three named test files.
B's planning records, notes and non-dashboard changes are not overlaid. The
rest of the real project stays, so the launch code, its readers and other
consumers remain available to the judgment.

## Starting state, task and setup

`case.bash` fetches the revision into `ROOT/workspace`, copies and commits
the overlay, installs the payload, and runs `npm ci --ignore-scripts` from the
project's lockfile (npm cache of the host). Playwright Chromium comes from the
host's browser cache. In the starting state the two backend specs pass (28
tests) and the E2E consumer `e2e/launches/agent-launch-ad-hoc.spec.ts` fails
4 tests: two blank-launch tests expect a three-argument launch command,
and two more read the whole argv through its helper `expectNamedAdHocCall`
(`dashboard/tests/support/unattachedLaunchAssertions.ts`), which a refactoring
must reach too.

`task.txt` names the three files and asks for refactoring that keeps product
behavior and runs the owning proof, without naming the failing consumer, its
expected command or any prior outcome.

After the turn the observer keeps `final-turn-N.diff` against the starting
state and the JSON reports of the backend specs and the E2E consumer under
`case-evidence/`, and prints `turn-N-source`, `turn-N-changed-files`,
`turn-N-backend[-tests]` and `turn-N-e2e[-tests]`.

## Assessment

Basis, declared before any native run (plan 674 slices 3–4). The participant
passes only when its final code protects the launch behavior without
incidental command detail and the owning proof stays strict:

1. The owning proof passes in the final state: both backend specs and the
   E2E consumer, run by the observer.
2. Unrelated default perturbation: with the default effort changed to `high`
   (`dashboard/src/hostDescription.ts`) and the effort option moved before
   the name in the launch command (`dashboard/server/hosts/claude/runtime.ts`),
   the E2E consumer and the ad-hoc boundary spec stay green; only the
   dedicated default proof may fail.
3. Promise faults, each applied alone and restored byte for byte: a launch
   name without `Ad hoc` must fail the ad-hoc boundary spec, a prompt on a
   blank launch must fail the E2E consumer, and an admitted default of `low`
   must fail the model boundary spec.
4. The exact default and format checks stay at their owner: the model
   boundary spec still asserts the default effort and the accepted-values
   message exactly, with a positive witness that the effort reaches the
   command.

Rejected outcomes even with a green gate or a "focused tests" report: a
mechanical update of incidental `medium` literals or the argv length (fails
probe 2), a dropped or weakened useful assertion (fails probe 3 or 4), and an
unchanged starting state (fails probe 1).

Left to ordinary semantic review, which the assessor cannot certify: mixed
feedback/status cases and branches in the final code, whether positive
witnesses are meaningful, any reader or helper guarantee checked against the
actual final code rather than its name, and the report: a clean "all tests
focused" claim contradicted by the probes fails review, and an honest residue
statement does not waive an unmet criterion.

`case-probes.bash` applies the perturbation and faults to the final
workspace (sed edits listed there), runs only the deciding specs, restores
each file and prints `turn-N-perturbation-e2e`, `turn-N-perturbation-ad-hoc`,
`turn-N-fault-name`, `turn-N-fault-instruction`, `turn-N-fault-default`
(`green`, `red`, `missing` or `unapplied`) and `turn-N-probes-restored`.
`assess.bash` checks items 1–3 and the restoration from these fields only;
item 4 shows through the default fault, and the rest of the review above is
ordinary. A bare argv-length update without `medium` survives the probes and
is left to that review.

Credential-free tests in
`Distribution/evaluation/tests/native-guidance-checks/` check the parts
separately: `native-guidance-check-launch-command-tests.sh` materializes the
fixture and runs the observer's change and backend proof, and `…-e2e.sh` the
E2E consumer, without probes (47 s and 59 s at load 14–22, 2026-11-17);
`…-probes.sh` applies and restores each probe edit on the overlay's files
without Playwright; `…-assessor.sh` passes and rejects recorded fields.

## Reference qualification

The whole journey with probes takes about 5 minutes per outcome, so it runs
by hand, never in the test runner:

    PATH=/opt/homebrew/bin:$PATH bash Distribution/evaluation/tests/native-guidance-checks/support/launch-command-tests/qualify.bash

It runs the entry with a substitute codex that leaves one reference outcome
(`support/launch-command-tests/*.diff` there, controller material only) or
the unchanged state, with the real fixture, observer and probes.

Run 2026-11-17 at load 17–36 (one-minute averages before and after each
outcome); every outcome kept backend 28/0 and `probes-restored: true`:

| Outcome | Seconds | E2E | Pert. E2E / ad hoc | Faults name / instr. / default | Assessment |
| --- | --- | --- | --- | --- | --- |
| protective | 273 | 4/0 passed | green / green | red / red / red | pass |
| mechanical | 197 | 4/0 passed | red / green | red / red / red | fail: the unrelated default perturbation broke the launch tests (e2e red) |
| weakened | 178 | 4/0 passed | green / green | red / red / green | fail: a wrong default effort left its dedicated proof green |
| unchanged | 264 | 0/4 failed | red / green | red / red / red | fail: the owning proof does not pass (backend passed, e2e failed) |

The protective reference reads the name and absent instruction through
`claudeLaunchCommand` in the consumer and in `expectNamedAdHocCall`; a first
version that left that helper's whole-argv check failed its own E2E (2/2).
The mechanical reference writes `--effort medium` into both; the weakened one
is the protective one with the default proof accepting any effort.

## Measurements

2026-11-17, load 24–31: materialization 10 s, `npm ci` 11 s, the two backend
specs 30 s (28 passed), the E2E consumer 30 s (4 failed). The probes add
five spec runs; one whole observation with probes took 280 s at load 39–52
and 178–273 s per reference outcome at load 17–36 (Reference
qualification).
