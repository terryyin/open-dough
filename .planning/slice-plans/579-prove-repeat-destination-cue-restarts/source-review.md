# Source-only review

Reviewer launch: collaboration.spawn_agent, task `/root/source_review`, fork_turns `none`.
Input: only the original SEED-296 Goal, Scope, exclusions and all three key examples, copied verbatim from its seed. No plan, implementation, proof or suspected omission supplied. Reviewer was instructed to read no files and change nothing. Returned commitments are retained below verbatim. The launch and return are inspectable in this execution conversation.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | Detect a regression where repeating the same story reference leaves the destination cue fading from its first activation. | slice 1 | observed: renewed refactor fault /tmp/seed296-refactor-fault.log: restart expected <1000, observed1000 after class/name checks passed; source restored exactly; full three-test spec terminal pass /tmp/seed296-refactor-final.log |
| C02 | Strengthen the existing repeated dependency-reference browser journey. | slice 1 | observed: dashboard/tests/navigation/story-reference-navigation.spec.ts existing repeated dependency journey, full three-test spec passed |
| C03 | Assert deterministically that the repeated cue starts at full opacity. | slice 1 | observed: dashboard/tests/destinationCue.ts expectDestinationCueRestarted asserts opacity 1 after real reference.click() |
| C04 | Assert deterministically that the repeated cue’s animation progress resets to its beginning. | slice 1 | observed: dashboard/tests/destinationCue.ts expectDestinationCueRestarted asserts nonnegative time less than fading time |
| C05 | Control page time for the cue’s lifetime. | slice 1 | observed: story-reference-navigation.spec.ts pausePageClock, passPartOfCue and expectCueEnds retain controlled timer proof |
| C06 | Arrange a known state in which the first cue is partway through fading. | slice 1 | observed: destinationCue.ts holdDestinationCueWhileFading pauses/seeks first animation, awaits ready and asserts positive time/partial opacity |
| C07 | Avoid wall-clock waits. | slice 1 | observed: diff and helper inspection: no wall-clock waits; page clock and animation-ready event control setup |
| C08 | Preserve the journey’s selection checks. | slice 1 | observed: story-reference-navigation.spec.ts expectSelected assertions before/after repeat and expiry |
| C09 | Preserve its inspection checks. | slice 1 | observed: story-reference-navigation.spec.ts visible Detail region and Hide detail controls before/after repeat and expiry |
| C10 | Preserve its focus checks. | slice 1 | observed: story-reference-navigation.spec.ts supplier focused on arrival, repeat and expiry; refresh retains consumer focus |
| C11 | Preserve its scrolling checks. | slice 1 | observed: story-reference-navigation.spec.ts expectReadingTop on arrival and selected supplier before repeat |
| C12 | Preserve its cue-ending checks. | slice 1 | observed: story-reference-navigation.spec.ts expectCueEnds retained before selection and after repeated activation |
| C13 | Demonstrate that removing the layout read between removing and reapplying the cue class makes the maintained restart assertion fail. | slice 1 | observed: renewed refactor fault /tmp/seed296-refactor-fault.log: restart expected <1000, observed1000 after class/name checks passed; source restored exactly; full three-test spec terminal pass /tmp/seed296-refactor-final.log |
| C14 | Demonstrate that restoring the current layout-read behavior makes the journey pass. | slice 1 | observed: renewed refactor fault /tmp/seed296-refactor-fault.log: restart expected <1000, observed1000 after class/name checks passed; source restored exactly; full three-test spec terminal pass /tmp/seed296-refactor-final.log |
| C15 | Retain the promises of the existing normal-motion checks. | slice 1 | observed: additive helper exports only; expectDestinationCue and all normal-motion callers unchanged; existing journey full-spec pass |
| C16 | Retain the promises of the existing reduced-motion checks. | slice 1 | observed: story-reference-done.spec.ts reduced-motion example and notification-story-navigation.spec.ts reduced-motion example import unchanged exports; production/CSS/motion assertions unchanged, effect excluded |
| Q01 | The repeated-activation proof concerns a card that is already selected. | slice 1 | observed: story-reference-navigation.spec.ts expectSelected(supplier,true) before fading setup |
| Q02 | That card is already inspected. | slice 1 | observed: story-reference-navigation.spec.ts Hide detail visible before fading setup |
| Q03 | That card is already in view. | slice 1 | observed: story-reference-navigation.spec.ts expectReadingTop(supplier) before fading setup |
| Q04 | Its first cue is partway through fading when the same reference is activated again. | slice 1 | observed: destinationCue.ts holdDestinationCueWhileFading first animation time 1000 and partial opacity before real repeat click |
| Q05 | The layout-read removal is a disposable fault. | slice 1 | observed: git diff confirms production source restored exactly before final full-spec pass |
| Q06 | The fault demonstration distinguishes a restarted animation from the mere presence of the cue class. | slice 1 | observed: renewed refactor fault /tmp/seed296-refactor-fault.log: restart expected <1000, observed1000 after class/name checks passed; source restored exactly; full three-test spec terminal pass /tmp/seed296-refactor-final.log |
| Q07 | It also distinguishes a restarted animation from the mere presence of the animation name. | slice 1 | observed: renewed refactor fault /tmp/seed296-refactor-fault.log: restart expected <1000, observed1000 after class/name checks passed; source restored exactly; full three-test spec terminal pass /tmp/seed296-refactor-final.log |
| J01 | Following an unselected supplier’s dependency reference inspects the supplier card. | slice 1 | observed: story-reference-navigation.spec.ts initial dependency click yields visible Detail for Story B region |
| J02 | That arrival focuses the card. | slice 1 | observed: story-reference-navigation.spec.ts supplier focused after initial dependency click |
| J03 | That arrival brings the card into view. | slice 1 | observed: story-reference-navigation.spec.ts expectReadingTop after initial dependency click |
| J04 | That arrival cues the card. | slice 1 | observed: story-reference-navigation.spec.ts expectDestinationCue after initial dependency click |
| J05 | That arrival leaves the card unselected. | slice 1 | observed: story-reference-navigation.spec.ts selected class count zero on initial arrival |
| J06 | The first cue ends without changing selection. | slice 1 | observed: story-reference-navigation.spec.ts expectCueEnds followed by expectSelected(supplier,false) |
| J07 | Repeating the reference during the selected supplier’s fading cue starts a fresh cue at full opacity. | slice 1 | observed: destinationCue.ts expectDestinationCueRestarted full opacity observed after real repeat click |
| J08 | That repeated activation resets animation progress. | slice 1 | observed: destinationCue.ts expectDestinationCueRestarted animation progress reset observed after real repeat click |
| J09 | That repeated activation preserves selection. | slice 1 | observed: story-reference-navigation.spec.ts expectSelected(supplier,true) immediately after repeat |
| J10 | That repeated activation preserves inspection. | slice 1 | observed: story-reference-navigation.spec.ts Hide detail visible immediately after repeat |
| J11 | That repeated activation preserves focus. | slice 1 | observed: story-reference-navigation.spec.ts supplier focused immediately after repeat |
| J12 | Advancing controlled page time ends the repeated cue. | slice 1 | observed: story-reference-navigation.spec.ts passPartOfCue and expectCueEnds after repeat |
| J13 | Ending the repeated cue leaves the selection intact. | slice 1 | observed: story-reference-navigation.spec.ts expectSelected(supplier,true) after repeated cue expires |
| J14 | Removing the layout read causes the maintained restart assertion to fail despite the cue class and animation name remaining present. | slice 1 | observed: renewed refactor fault /tmp/seed296-refactor-fault.log: restart expected <1000, observed1000 after class/name checks passed; source restored exactly; full three-test spec terminal pass /tmp/seed296-refactor-final.log |
| J15 | Restoring the layout read makes the journey pass. | slice 1 | observed: renewed refactor fault /tmp/seed296-refactor-fault.log: restart expected <1000, observed1000 after class/name checks passed; source restored exactly; full three-test spec terminal pass /tmp/seed296-refactor-final.log |
| X01 | Cue styling changes are outside this increment. | slice 1 | observed: git diff: only test/helper changes, cue styling untouched |
| X02 | Cue duration changes are outside this increment. | slice 1 | observed: git diff: only test/helper changes, production cue duration untouched |
| X03 | Navigation behavior changes are outside this increment. | slice 1 | observed: git diff: only test/helper changes, production navigation untouched |
| X04 | New motion preferences are outside this increment. | slice 1 | observed: git diff: only test/helper changes, no motion preference changes |

The journey examples describe supported scenarios; they do not establish rejection rules for other starting states or reference journeys.

## CI repair acceptance

The registered execution-complete revision f82a153376a54b707233b65d11fb98c05e6f2a57
failed CI run42838175500 attempt1 solely in test(1/3): runner-failure-report
remained unfinished135.6s until the absolute cutoff. Final diagnostic and full
469line log (/tmp/seed296-ci-final-failure.json, /tmp/seed296-test-shard1.log)
account for the parser's no-recognized-failure gap; no other jobs failed.
Completion receipt returned failure with shutdown retained; observer unchanged.

Fresh repair agent reproduced real Ubuntu/Bash5.2 scheduler hang on twoCPUs:
wait -n20691 blocked after worker20691 exited/status0, only watchdog20695 left.
Evidence /Users/terryyin/.cache/seed296-runner-race/waits-30.log and
hung-waits-processes.txt; completed records in hung-scheduler-state.
Initial native Bash3 refusal was the expected environment guard; Bash5 resolved it.
No other exact repair owner found among active worktrees. Clean repair save:
/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-Ak8RhG/record.json.

Accepted patch uses completed status or observed exit to reap explicit worker
PIDs, retires watchdogs at handoff and drains through existing slot events with
bounded dead-worker detection. Removes redundant wait-any and jobs_started.
Coordinator inspected both scripts and their reporting/deadline callers.
No original cue promise or observation changed. A new controlled-completion
candidate passed baseline and duplicated existing coverage, so was removed;
the actual failing maintained runner execution is the pre-repair observation.
Same previously failing phase workload passed30/30 after the cause change.
This bounded stability observation is not a deterministic unit reproduction.

Literal accepted native proof (all14 files, terminal pass):
`PATH=/opt/homebrew/bin:$PATH caffeinate -s -i npm test -- tests/test-runner-selection.sh tests/test-runner-bash.sh tests/test-runner-failure-report.sh tests/test-runner-ci-environment.sh tests/test-runner-budget.sh tests/test-runner-interrupt.sh tests/test-runner-github-requests.sh tests/test-runner-split.sh tests/support/test-runner-deadline.test.mjs tests/support/test-runner-deadline-cutoff.test.mjs tests/support/test-runner-deadline-continuation.test.mjs tests/support/test-runner-deadline-cutoff-proof.test.mjs tests/support/local-test-suite.test.mjs tests/support/local-test-suite-lifecycle.test.mjs`
Literal accepted Linux proof (same14 files, terminal pass):
`DOCKER_CONTEXT=colima PATH=/opt/homebrew/bin:$PATH caffeinate -s -i scripts/ci-container.sh tests/test-runner-selection.sh tests/test-runner-bash.sh tests/test-runner-failure-report.sh tests/test-runner-ci-environment.sh tests/test-runner-budget.sh tests/test-runner-interrupt.sh tests/test-runner-github-requests.sh tests/test-runner-split.sh tests/support/test-runner-deadline.test.mjs tests/support/test-runner-deadline-cutoff.test.mjs tests/support/test-runner-deadline-continuation.test.mjs tests/support/test-runner-deadline-cutoff-proof.test.mjs tests/support/local-test-suite.test.mjs tests/support/local-test-suite-lifecycle.test.mjs`
The real copied runner drives silent success, queued ordering, failed/killed
worker diagnostics, timings/outcomes, deadlines, signals and admission.
Each named test observes its own public result, including kept/killed jobs and
cutoff continuation. Logs /tmp/seed296-runner-all-native.log,
/tmp/seed296-runner-all-linux.log and /tmp/seed296-repaired-phases.log.

Consumer trace /tmp/seed296-runner-repair-consumer-trace-disposed.md:
all62 matches disposed. Runtime runner, report/deadline, copy-runner fixtures,
selection/failure/environment/split/budget/signal/deadline/admission callers run;
unchanged parser/schema/documentation/historical matches excluded with reasons.
No remaining proof gap besides new published CI. Owned containers retired.
Source freshness unchanged at pinned origin/main40a9e74; incoming dark-theme
work affects no runner path and is not a named coordination sibling.
Product/proof retrospective reconsidered affected runner conclusions only:
cause-based repair and focused public behavior proof preserve the original
story and runner promises; product advice remains no change.

Independent repair refactor /root/repair_refactor: none — already clean;
REFACTOR COMPLETE, git diff --check passed; both scripts204/231lines.
No new consumer or proof gap; accepted14file native/Linux and30run proof reused.
