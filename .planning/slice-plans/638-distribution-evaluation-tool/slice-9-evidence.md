# Slice 9: maintained tool and combined proof candidate

Parent: `20432e7e856618a221dc2e9469b482a4d1d4dc61`; uncommitted local
candidate, not published CI. Root separately inspected source freshness as
unchanged at `c63733aa46876ee996a4c923c1be646d809e24c2` before the full gate.
Named plan 621 remains queued and unaffected. Root owns the PLAN link update
and slice-8 post-publication note; this implementation preserved both.

## Maintained home

The evaluation README now links setup, family layers, sole stream reader,
acceptance, page-object probes, comparisons, baselines and shared CI shares.
Four existing guides moved from `Distribution/tests/native-harness/` into
`Distribution/evaluation/`; their maintained callers in the root README,
Distribution README, publication guide and dashboard commands follow them.
Family layers now describe src runtime, cases fixture/run/observe/assess and
feature-private test counterexamples. Canonical repository/install/MakeMe
builders stay in Distribution/tests. Native options, qualifications, historical
limits and frozen projects are unchanged. The page-object guide now reflects
the two browser controls actually included in focused/default discovery.

## Small proof and consumer closure

Reports are retained under `/tmp/slice9-proof/`.
`focused.log`, `focused.exit`, `focused-outcomes.tsv`,
`focused-case-outcomes.json` (TSV despite its suffix) and `focused-times.tsv`
record exit 0, five passed jobs and one passed Node case for:

```sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=2 npm test -- \
  Distribution/tests/ci/distribution-ci-proof.test.mjs \
  Distribution/tests/installation/install-omits-internal.sh \
  Distribution/tests/installation/payload-declaration-links.sh \
  Distribution/tests/test-runner/test-runner-selection.sh \
  Distribution/tests/test-runner/test-runner-bash.sh
```

The CI fixture invokes the real runner, fragments and Distribution summary.
Its assertions observe mixed-root shell and Node files, passed/failed/skipped/
todo Node cases, unloadable-file failure, shell-only zero cases, and one shared
Distribution file/case proof with file timing kept on files. This is local
controlled producer proof, not a claim that published CI is green.

`discovery.json` and NUL-delimited `default.manifest`, `evaluation.manifest`
and `share-{1,2,3}.manifest` record actual shared discovery/deal: 641 unique
jobs (570 Tests, 70 Evaluation, one self-installation check). Focus is exactly
those 70 Evaluation jobs. Shares contain 216/212/213 jobs; their union is the
default selection exactly once, with no operational src/cases, fixtures or
nested feature support scheduled as evaluation checks.

```sh
PATH=/opt/homebrew/bin:$PATH node scripts/test-shares.mjs preview --split-count 3
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs \
  --checkout "$PWD" --base 20432e7e856618a221dc2e9469b482a4d1d4dc61 \
  --term native-family-layers.md --term native-host-streams.md \
  --term native-page-objects.md --term native-setup.md
```

`shares-preview.txt` records 750.8/749.3/749.3 predicted job-seconds under
existing 926 ceilings; recorded duration values were not refreshed.
The first direct preview refused system Bash 3.2 before checks; selecting the
maintained Homebrew Bash 5 resolved that prerequisite. Node is 24.21.0.
`links.json` verifies every maintained changed guide's local link target.
`consumer-trace.txt` retains the full trace, including generic derived-term
matches and historical/root-owned records for coordinator disposition. Live
guide callers are updated; historical dated/pinned commands and records retain
original path values. `git diff --check` passes.
`frozen.json` verifies all 326 retained hashes and recorded sizes unchanged:
18 family fixtures, 41 comparison inputs/records, 21 ADR inputs, 246 streams.

## Required full local gate: failed, complete terminal reports

`full-launch.json` records the prelaunch decision and exact command. Own host:
16 CPUs, AC 100%, load 3.26/2.86/2.84, 69% free memory, no other owned heavy
proof. Ordinary four-worker default, shared full-suite admission, unchanged
180-second job and existing run settings; no idle prerequisite.
[Maintained macOS sleep/power guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Observation window began `2026-11-15T20:07:35Z`, bounded at `20:52:35Z`.

```sh
PATH=/opt/homebrew/bin:$PATH \
OPEN_DOUGH_TEST_OUTCOMES=/tmp/slice9-proof/full-outcomes.tsv \
OPEN_DOUGH_TEST_CASE_OUTCOMES=/tmp/slice9-proof/full-case-outcomes.tsv \
OPEN_DOUGH_TEST_TIMES=/tmp/slice9-proof/full-times.tsv \
  caffeinate -s -i npm test
```

Terminal exit 1 at `20:25:26Z`; `full.log`, `full.exit`, `full-finish.txt` and
`full-summary.json` retain the failed verdict. All 641 selected current labels
appear exactly once with terminal outcomes and timing: 639 passed, two failed,
none unfinished. All 70 Evaluation jobs passed. Node-case results: 2,220 passed,
six failed; Evaluation contributes 74 passed cases. Elapsed 1,070.9 seconds is
this run's observation, not a performance claim or calibration input.

- `Distribution/tests/native-harness/native-setup.sh`: workflow guard combines
  both workflows but permits exactly one compatible Chromium cache step;
  slice 8 added the second compatible cache. Read-only causal evidence is its
  final workflow awk `count != 1` and both workflows' named cache steps.
- `story-obligations-drift-replay.test.mjs`: six ENOENT cases; helper line 18
  reads the retired `Distribution/tests/fixtures/delivery-evidence/` home.

Root owns these repairs and the separately discovered published-CI
`git-publication-native-entry.sh` scratch assertion failure. That entry passed
locally here; a local pass does not resolve the reported CI difference.
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
No repeated full gate, timeout relaxation or duplicate repair was attempted.

## Source obligations and remaining gate

C01/C06/C32/C46 and Q01: documented one maintenance home, current navigation,
commands and prerequisites. C24/C25 and Q02/Q03, J08–J12: same Distribution
Intent/CI producer, actual once-per-check share union and mixed-root file/case
producer proof; final full/CI green remains outstanding until owned repairs.
C40–C45/C41 and J33–J36: declared payload is unchanged; installation enumeration,
managed-byte comparison, unrelated sentinels and payload links passed, including
ordinary supported installs with evaluation present in release source. Every
other selected installation check also completed in the full local run.
X01–X07/X09/X10: no host, qualification, experiment, performance claim, release,
installation change, separate Intent or paid/native session was added or run.
No new North Star topic, policy, runner, registry, reader or pool was introduced.

All 33 allocated source IDs are addressed by the candidate and retained proof;
required failed full-suite/CI closure is a real remaining gate, not completion.
Active implementation including this evidence: approximately 14 minutes;
commands and source-freshness/full-suite waits excluded. Changes are uncommitted.

## Resumed repair boundary and second full observation

CI repair4856382 accepted before exact installed stash restoration. The helper
restored the17 original paths; its one append conflict in slice8 evidence was
resolved by keeping both notes. Only owned stash e3265c9 was dropped through the
helper; prior unowned00c1a7d remains. Same implementation author resumed,
verified restoration and completed three known documentation corrections at
approximately15active minutes total, excluding repair pause and command waits:
publication advertises actual --help, scheduling names its test/native entries,
and ci-completion names its real cases directory. Actual public --help exits0.

Final gate attempt2: `/tmp/slice9-final-proof/launch.json`, command and reports
retain terminal1 at2026-11-15T21:39:28Z after1099.8seconds. Same641unique
manifest, byte-identical to prior three-share proof;640jobs passed, all2226
Node cases passed. NativeSetup and all six drift cases now pass. The sole
failure is native-stream-replay: the new retention assertion used raw
turn.completed instead of the sole shared reader. This is a real failed gate.
The initial direct discovery precheck required an explicit root and stopped
before this full run; prelaunch-error.json retains that setup error.

G16 correction: the existing retention-proof owner resumed within its original
CI-repair budget (12.1active minutes total), replaced only that raw grep with
standalone native_host_stream status capture plus complete assertion. The
existing sourced helper propagates reader failure; CLI/sentinel/current-hash/
artifact/default/KEEP/failed-run/scratch assertions are unchanged. No guard
exception, writer allowlist change, parallel reader or runtime edit.

- `PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i bash scripts/test.sh Distribution/evaluation/tests/native-harness/native-stream-replay.sh Distribution/evaluation/tests/git-publication/git-publication-native-entry.sh`:0, full246-corpus replay/guard and actual public modes.
- `PATH=/opt/homebrew/bin:$PATH DOCKER_CONTEXT=colima CI=true OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i bash scripts/ci-container.sh Distribution/evaluation/tests/git-publication/git-publication-native-entry.sh`:0, maintained Linux aarch64 recipe; no x64 claim.

Exact source/helper, red diagnostic, current terminal logs and consumer purposes
are in `/tmp/seed371-ci-retention-proof/stream-guard-HANDOFF.md`. No other
owned proof remains active before required full-gate renewal. Current17guide/
evidence files plus this one test correction form the slice9 candidate.

## Accepted current full gate

Attempt3: `/tmp/slice9-renewed-proof/launch.json` records awake AC100%,16cores,
four ordinary local workers, shared full-suite admission, no competing owned
heavy proof, unchanged180-second job deadlines and45-minute observation bound.
Changed-input hashes identify the candidate. The optional slot-gate file only
records progress; no discovery/deadline/worker setting changes.

```sh
PATH=/opt/homebrew/bin:$PATH \
OPEN_DOUGH_TEST_OUTCOMES=/tmp/slice9-renewed-proof/outcomes.tsv \
OPEN_DOUGH_TEST_CASE_OUTCOMES=/tmp/slice9-renewed-proof/case-outcomes.tsv \
OPEN_DOUGH_TEST_TIMES=/tmp/slice9-renewed-proof/times.tsv \
OPEN_DOUGH_TEST_SLOT_GATE=/tmp/slice9-renewed-proof/started-count \
  caffeinate -s -i npm test
```

Terminal0 at2026-11-15T22:03:01Z,1044.8seconds. Inspected manifest/outcomes/
times each contain exactly641current labels once: allpassed, noneunfinished;
570Tests jobs,70Evaluation jobs and the self-installation checker. All2226
Node cases pass (2152Tests,74Evaluation). Full current guard/replay, original
baseline purposes, browser controls, real CI producer and installations pass.
`summary.json`, `finish.json`, `full.log` and TSV reports retain that actual
verdict. Both failed full observations above remain failed historical evidence.
This is local controlled regression proof, not published CI or host qualification.

Current discovery manifest is byte-identical to the three-share witness; no
repeated preview is needed. Exact retired-guide search finds only one historical
preparation reference, with no maintained live caller. All1075doc trace rows
have dispositions in `/tmp/slice9-final-proof/consumer-trace-dispositions.md`;
changed prose mentions many unchanged APIs without changing their contracts.
The stream-guard supplement above observes the only current test-side effect.

Independent refactor complete: none/already clean, approximately6active minutes.
Actual path validation disproved a proposed guide regrouping; the sole temporary
edit was reversed and its SHA matches the passing full-gate input. No lasting
code/doc refactor, proof invalidation, uncovered consumer or extra test run.
Root retains published CI completion; local641/2226 is not a CI verdict.
