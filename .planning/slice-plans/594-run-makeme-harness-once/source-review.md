# Source review — Run MakeMe harness checks once by default

Launch: one fresh general-purpose reviewer without conversation inheritance,
started by the execution coordinator on 2026-11-11 before the first
implementation delegation. It was told to use only its inputs, read no project
files, run no commands and change nothing.

Input: the title, Goal and Scope of
[the story](../../seeds/SEED-307-shared-test-pattern-rules.md#run-makeme-harness-once)
as published at `0cc07ac0443d5f9d1c807e4cc533cda165136426`, word for word. The
source has no key examples, separate exclusions or human amendments. No plan,
return, product, proof, suspected omission or slice scope was supplied.

Return: the reviewer reported no trigger or journey examples and flagged, without
resolving them, that the source counts nine controls without listing them, does
not name the two harness files, and does not describe the existing runner
behavior it keeps.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| T1 | "Run MakeMe harness checks once by default": MakeMe harness checks run once in a default run. | slice 1 | observed: tests/test-runner-selection.sh final Node block: wrapper count 0 and each harness file count 1 in the full default listing |
| T1q | "by default": the once-only promise is about default runs; it says nothing about explicitly requested runs. | slice 1 | observed: tests/test-runner-selection.sh final Node block: explicit tests/makeme-native-use.sh listing equals its one shell job |
| G1.1 | "Developers and CI retain all nine maintained MakeMe assessment controls": developers retain all nine maintained MakeMe assessment controls. | slice 1 | observed: tests/test-runner-selection.sh final Node block: both harness files listed once in the full listing; five and four test cases in the unchanged tests/support/makeme-native-harness.test.mjs and makeme-native-refactor-harness.test.mjs |
| G1.2 | "Developers and CI retain all nine maintained MakeMe assessment controls": CI retains all nine maintained MakeMe assessment controls. | slice 1 | observed: tests/test-runner-selection.sh final Node block: both harness files listed once in the three-share union CI runs |
| G1q | "all nine maintained": the count is nine and none may be dropped; "maintained" limits the set to currently maintained controls. | slice 1 | observed: nine test cases (five plus four) in the two unchanged harness files, each file still a default job |
| G2.1 | "without repeating their fixture installation, Git setup and mutation checks in each default run": the controls' fixture installation is not repeated within a default run. | slice 1 | observed: tests/test-runner-selection.sh final Node block: wrapper absent, so its second run of the fixture installation is gone from full and split listings |
| G2.2 | "without repeating their fixture installation, Git setup and mutation checks in each default run": the controls' Git setup is not repeated within a default run. | slice 1 | observed: tests/test-runner-selection.sh final Node block: wrapper absent, so its second run of the Git setup is gone from full and split listings |
| G2.3 | "without repeating their fixture installation, Git setup and mutation checks in each default run": the controls' mutation checks are not repeated within a default run. | slice 1 | observed: tests/test-runner-selection.sh final Node block: wrapper absent, so its second run of the mutation checks is gone from full and split listings |
| G2q | "in each default run": the non-repetition applies per default run, for developers and CI alike. | slice 1 | observed: tests/test-runner-selection.sh final Node block: the same counts hold for the full listing and the three-share union |
| S1 | "Give each MakeMe harness test one default execution route.": every MakeMe harness test has exactly one default execution route, neither two or more nor zero. | slice 1 | observed: tests/test-runner-selection.sh final Node block: wrapper count 0 and each harness file count exactly 1, in full and split listings |
| S2a.1 | "Preserve the two directly discovered Node harness files": the first of the two directly discovered Node harness files is preserved. | slice 1 | observed: tests/test-runner-selection.sh final Node block: node tests/support/makeme-native-harness.test.mjs listed once |
| S2a.2 | "Preserve the two directly discovered Node harness files": the second of the two directly discovered Node harness files is preserved. | slice 1 | observed: tests/test-runner-selection.sh final Node block: node tests/support/makeme-native-refactor-harness.test.mjs listed once |
| S2aq | "the two directly discovered": there are exactly two such files, identified by being directly discovered. | slice 1 | observed: tests/node-test-files unchanged; both files listed as kind node through its tests/support pattern |
| S2b.1 | "including common-command authoring and refactor scope compatibility controls": the common-command authoring controls are preserved, as part of those files. | slice 1 | observed: tests/support/makeme-native-harness.test.mjs unchanged: ordinary guidance evidence accepts the shared command and rejects a different project or flag |
| S2b.2 | "including common-command authoring and refactor scope compatibility controls": the refactor scope compatibility controls are preserved, as part of those files. | slice 1 | observed: tests/support/makeme-native-refactor-harness.test.mjs unchanged: refactor evidence accepts the shared changed command and rejects omitted opted-out scope |
| S3.1 | "the explicit zero-argument and native uses of `tests/makeme-native-use.sh`": the explicit zero-argument use of `tests/makeme-native-use.sh` is preserved. | slice 1 | observed: tests/test-runner-selection.sh final Node block explicit listing; npm test -- tests/makeme-native-use.sh passed after the change |
| S3.2 | "the explicit zero-argument and native uses of `tests/makeme-native-use.sh`": the explicit native use of `tests/makeme-native-use.sh` is preserved. | slice 1 | observed: tests/makeme-native-use.sh differs from the Take only in its header comment; the host-argument path does not pass through discovery |
| S3q | "explicit": these uses are preserved as explicit invocations, as distinct from the default route. | slice 1 | observed: scripts/test-jobs.sh add_chosen_jobs unchanged; tests/test-runner-selection.sh final Node block explicit listing |
| S4.1 | "Keep existing runner selection, split and failure behavior.": existing runner selection behavior is unchanged. | slice 1 | observed: tests/test-runner-selection.sh earlier assertions unchanged and passing |
| S4.2 | "Keep existing runner selection, split and failure behavior.": existing runner split behavior is unchanged. | slice 1 | observed: tests/test-runner-split.sh unchanged and passing |
| S4.3 | "Keep existing runner selection, split and failure behavior.": existing runner failure behavior is unchanged. | slice 1 | observed: tests/test-runner-failure-report.sh and the bad-path cases of tests/test-runner-selection.sh unchanged and passing |
| S5 | "This is bounded retrospective suite correction": the work is bounded and is a retrospective correction of the test suite, not new feature work. | slice 1 | observed: diff from the Take: scripts/test-jobs.sh, tests/test-runner-selection.sh and one wrapper comment |
| X1.1 | "with no MakeMe rule, selector, native-host or adoption change": no MakeMe rule change. | slice 1 | observed: diff from the Take touches no MakeMe rule file |
| X1.2 | "with no MakeMe rule, selector, native-host or adoption change": no selector change. | slice 1 | observed: diff from the Take touches no MakeMe selector file |
| X1.3 | "with no MakeMe rule, selector, native-host or adoption change": no native-host change. | slice 1 | observed: diff from the Take leaves the wrapper's host-argument code unchanged |
| X1.4 | "with no MakeMe rule, selector, native-host or adoption change": no adoption change. | slice 1 | observed: diff from the Take touches no installation or adoption file |
| X2 | "and no paid native probe": no paid native probe is run. | slice 1 | observed: only the zero-argument wrapper and runner listings were run; no host-argument or native CLI run |
