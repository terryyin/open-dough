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
4 tests: it still expects a three-argument launch command.

`task.txt` names the three files and asks for refactoring that keeps product
behavior and runs the owning proof, without naming the failing consumer, its
expected command or any prior outcome.

After the turn the observer keeps `final-turn-N.diff` against the starting
state and the JSON reports of the backend specs and the E2E consumer under
`case-evidence/`, and prints `turn-N-source`, `turn-N-changed-files`,
`turn-N-backend[-tests]` and `turn-N-e2e[-tests]`.

## Assessment

`assess.bash` defines no refactoring basis yet and fails every observation
with that reason; plan 674 slice 3 adds the basis.

## Measurements

2026-11-17, load 24–31: materialization 10 s, `npm ci` 11 s, the two backend
specs 30 s (28 passed), the E2E consumer 30 s (4 failed). The whole
controlled journey with an unchanged substitute host took 34.5 s at load
12–19 (`Distribution/evaluation/tests/native-guidance-checks/native-guidance-check-launch-command-tests.sh`).
