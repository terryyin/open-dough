# Source review: SEED-227#protect-long-local-proof-from-maintenance-sleep

Launch: fresh general-purpose agent, no conversation inheritance, 2026-11-04.
Input: the story's Goal, Scope (required behavior, constraints, scope limits,
deferred promises) and Key examples, extracted verbatim from
`.planning/seeds/SEED-227-protect-long-local-proof-from-maintenance-sleep.md`
(Goal through Key examples) into one file; instructed to read nothing else and
change nothing. Exclusions X.1–X.3 and deferred D.1–D.2 are recorded as
returned and owe no product change.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G.1 | Contributor finds in the maintained local proof instructions the sleep guard that fits the machine's power state | slice 1 | observed: tests/local-test-resources.md Machine sleep on macOS, paragraph 1 |
| G.2 | The instructions give a way to tell a machine that slept from a product or test defect | slice 1 | observed: tests/local-test-resources.md Machine sleep on macOS, paragraphs 2–3 |
| G.3 | Fewer whole-suite runs are lost to a laptop entering its sleep cycle | slice 1 | observed: tests/local-test-resources.md guard paragraph; ordinary-use evidence pending at DD-412 Follow-up |
| G.4 | Sleep-caused scattered failures are attributed in minutes rather than 3.4 hours | slice 1 | observed: tests/local-test-resources.md diagnosis paragraph with literal pmset command |
| 1 | tests/local-test-resources.md, linked from dashboard/tests/README.md, gains a macOS machine-sleep section with setup and diagnosis | slice 1 | observed: tests/local-test-resources.md:27 ## Machine sleep on macOS; dashboard/tests/README.md:10 link mentions machine sleep |
| 1.1 | Guard for a full run on AC is caffeinate -s -i around the run | slice 1 | observed: tests/local-test-resources.md 'On AC power, wrap a full run in caffeinate -s -i' |
| 1.2 | -s is honored only on AC | slice 1 | observed: tests/local-test-resources.md '-s prevents system sleep and is honored only on AC' |
| 1.3 | -i alone prevents idle sleep from a fully awake machine | slice 1 | observed: tests/local-test-resources.md '-i alone prevents idle sleep from a fully awake machine' |
| 1.4 | -i alone has no effect once in the sleep/dark-wake cycle, how DD-412's runs failed | slice 1 | observed: tests/local-test-resources.md 'has no effect once the machine is in its sleep/dark-wake cycle; two whole dashboard runs under -i failed that way on 2026-11-03 (DD-412)' |
| 1.5 | On battery, -s is inert | slice 1 | observed: tests/local-test-resources.md 'On battery -s is inert' |
| 1.6 | On battery: plug in, or start fully awake with lid open under -i and read the sleep log afterwards | slice 1 | observed: tests/local-test-resources.md 'plug in, or start fully awake with the lid open under caffeinate -i and read the sleep log afterwards' |
| 1.7 | Start every long run from a fully awake machine, whatever the guard | slice 1 | observed: tests/local-test-resources.md 'Start every long run from a fully awake machine.' |
| 1.8 | Diagnosis trigger: worker or command timeouts or scattered failures a rerun does not repeat | slice 1 | observed: tests/local-test-resources.md 'When a full run fails with worker or command timeouts, or with scattered failures a rerun does not repeat' |
| 1.9 | Read pmset -g log for Sleep and Wake entries inside the run's window before reading failures as defects | slice 1 | observed: tests/local-test-resources.md pmset code block and 'Look for Sleep and Wake entries inside the run's window'; command run 2026-11-04 printed dated entries |
| 1.10 | Run's window: start time (dashboard: test-results/<stamp> name) and runner-reported duration | slice 1 | observed: tests/local-test-resources.md 'its start time plus the runner-reported duration ... dashboard/test-results/<stamp> directory name' |
| 1.11 | The log reaches back about a week, so read it soon | slice 1 | observed: tests/local-test-resources.md 'The log reaches back about a week, so read it soon.' |
| 2 | AGENTS.md points at that section in one line beside the failing-and-flaky-tests policy | slice 1 | observed: AGENTS.md end of ## Failing and flaky tests, link to tests/local-test-resources.md#machine-sleep-on-macos (anchor at tests/local-test-resources.md:27) |
| 2.1 | A plan's local-gate line names the maintained guard rather than a remembered one | slice 1 | observed: AGENTS.md 'A plan's local-gate line names the maintained macOS sleep guard and its power condition' |
| 3.1 | DD-412 records the delivered instructions | slice 1 | observed: docs/maintainer/project-test-findings.md DD-412 Follow-up links Machine sleep on macOS |
| 3.2 | DD-412 keeps its observation criterion for the next ordinary-use result | slice 1 | observed: docs/maintainer/project-test-findings.md DD-412 'Subsequent ordinary-use evidence is pending.' |
| C.1 | A sleep inside the run's window explains a failure; it changes no verdict | slice 1 | observed: tests/local-test-resources.md 'A sleep in the window explains a failure but changes no verdict' |
| C.2 | The run is rerun under the guard, under the failing and flaky test policy | slice 1 | observed: tests/local-test-resources.md 'rerun under the guard. The failing and flaky test policy applies to the rerun as written' |
| C.3 | No test is excused by the sleep record | slice 1 | observed: tests/local-test-resources.md 'and no test is excused' |
| C.4 | Instructions claim only what is observed or documented | slice 1 | observed: tests/local-test-resources.md section compared with seed Investigation: man caffeinate, IOPMLib, pmset log, playwright.config.ts:44 stamp |
| C.5 | Do not promise -s rescues a run started inside the sleep cycle | slice 1 | observed: tests/local-test-resources.md 'Whether -s keeps a run going once the machine is already in its sleep cycle is not yet observed.' |
| X.1 | Local macOS proof only | slice 1 | observed: diff touches only four Markdown files |
| X.2 | CI, Linux, and runner scripts unchanged | slice 1 | observed: git diff --cached --stat: no scripts/, .github/, dashboard/playwright.config.ts |
| X.3 | No machine-wide power setting is instructed | slice 1 | observed: tests/local-test-resources.md section names no pmset setting |
| D.1 | Deferred: automatic guard from the admission owner | slice 1 | observed: not implemented; scripts/local-test-suite.mjs unchanged |
| D.2 | Deferred: automatic sleep report | slice 1 | observed: not implemented; runner unchanged |
| E.1 | AC laptop, full dashboard suite under caffeinate -s -i; no Sleep entry in window; verdict read as reported | slice 1 | observed: tests/local-test-resources.md AC guard sentence and 'No sleep in the window excludes sleep; continue under the ordinary policy' |
| E.2 | Battery: -s inert; plug in, or fully awake start with lid open under caffeinate -i and read the log after | slice 1 | observed: tests/local-test-resources.md battery sentence |
| E.3 | Run started inside sleep cycle under -i alone fails scattered; section names the case, says -i has no effect, names -s on AC and fully awake start | slice 1 | observed: tests/local-test-resources.md paragraph 1 dark-wake sentence with DD-412 2026-11-03, AC guard and fully awake start |
| E.4 | 52 non-overlapping failures: read log for window, find Maintenance Sleep, record invalid for sleep, rerun under guard; policy applies to rerun | slice 1 | observed: tests/local-test-resources.md paragraphs 2–3: 'record the run as invalid for sleep and rerun under the guard' |
| E.5 | Same symptom, no sleep in window: sleep excluded, continue under ordinary policy such as external-load classification | slice 1 | observed: tests/local-test-resources.md 'No sleep in the window excludes sleep; continue under the ordinary policy, for example by classifying external load.' |
| E.6 | Planner follows the AGENTS.md pointer; the plan names the maintained guard with its power condition | slice 1 | observed: AGENTS.md pointer resolves to tests/local-test-resources.md#machine-sleep-on-macos, which names caffeinate -s -i on AC |
