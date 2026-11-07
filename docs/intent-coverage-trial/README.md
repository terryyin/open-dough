# Story intent protection trial

Three assessors traced story promises to the production paths, fixtures and assertions available at each story’s completion checkpoint. The assessments exposed gaps in keyboard navigation and CI proof attribution that passing tests alone had left open. The calibration also showed that an assessment can miss a specific user journey even when it identifies a related weakness.

## Reports and assessment cost

| Report | Historical test results | Assessor elapsed time |
| --- | --- | --- |
| [SEED-192 · Story impact on test intent](SEED-192-review-story-intent-impact.md) | 11 focused Playwright tests in 33.6 s, 15 supplemental tests in 34.6 s, and one restored-checkpoint folder-default test in 4.7 s, all passing. The faulted test passed in 5.0 s, with a separate Chromium replay in about 0.16 s. | 7 min 19 s |
| [SEED-248 · CI proof through merge resolutions](SEED-248-compare-story-proof-through-merge-resolutions.md) | 37 Playwright tests passed in 100.24 s and seven Node tests passed in 0.30 s across two runs. All 11 faulted Playwright tests passed in 39.73 s. | About 6 min 52 s |
| [SEED-250 · Hide a project while keeping it maintained](SEED-250-hide-client-project-from-dashboard.md) | 31 Playwright tests passed in 27.4 s. | About 6 min |

The trial took about 20 minutes of summed assessor time, including test runs, source tracing and writing, plus about two minutes for the trunk recheck. Coordination and developer review time were unmeasured. Each report records the commands, full revision and what its figures measure.

Hosted GitHub Actions CI also passed on 2026-11-06 for the exact SEED-248 checkpoint `d03cf60f11e9f9599ae99db17932a029e854ecf8`. Attempt 1 ran on the push to `cursor/compare-story-proof-through-merge-resolutions` and passed lint, all three test shards, all twelve dashboard shards and `ci-proof`. The hosted run used the checkpoint code. The fault probe reported above ran locally with the deliberate substitution. [Hosted CI run 42254504909](https://github.com/terryyin/open-dough/actions/runs/42254504909).

## What ordinary review found

The calibration retrospective identified two behavior gaps at the same SEED-192 checkpoint. The initial assessment was written before seeing those findings. [Calibration retrospective][calibration-review].

| Known gap | Independent assessment | Historical verdict after comparison |
| --- | --- | --- |
| Clicking explanation text inside an opened Dependencies disclosure toggled card selection. | **Missed.** The assessor rated nested-control protection partial and cited the summary and link journey. It left the disclosure body and its effect on selection unexamined. | **Partially protected.** The historical test exercised the summary and a dependency link. A click on non-link content inside the open disclosure was outside that proof. [Original disclosure test][disclosure-test]. |
| Following Intent’s outside-count **Review changes** action on a marked story opened Review with a different comparison. | **Missed.** The assessor found different defaults for Intent and marked Review. It left the outside-count action’s choice of default unexamined. | **Partially protected.** The historical test followed the action and compared diffs in an unmarked fixture. It could not expose the different result on a marked story. [Original Review action test][review-link-test]. |

The [SEED-248 completion review][merge-review] found that Intent retained three CI endpoints through attribution refusals and used the landing revision. The trial found evidence for those identities and the homepage figures. It narrowed claims about the precise Summary figures and about a later fast-forward moving an earlier landing off the first-parent line. The [SEED-250 completion review][visibility-review] found that the design preserved configured inventory while filtering the dashboard. The trial corroborated the saved-file boundary and separated it from the evidence still needed for maintenance workflows that consume that file. Those completion reviews report delivered behavior. This trial separately asks which failures the existing tests would expose.

## Findings Terry can act on

- **Keyboard reachability.** The SEED-192 test focused **Select story** programmatically and still passed after the button left the Tab order. The browser trace confirmed the altered markup, and Chromium skipped the control during sequential navigation. [SEED-192 probe](SEED-192-review-story-intent-impact.md#probe).
- **Independent Branch and Landed figures.** The SEED-248 Summary fixtures gave both runs identical counts and durations. The production fault copied Branch figures into Landed, and eight browser traces confirmed the substitution ran. [SEED-248 probe](SEED-248-compare-story-proof-through-merge-resolutions.md#executed-proof).
- **Hidden-project behavior.** The SEED-250 tests cover saving configuration and opening a hidden project’s running terminal while Board and Intent stay on a visible project. Maintenance eligibility and opening a hidden project’s final report have gaps in direct evidence. [SEED-250 configuration](SEED-250-hide-client-project-from-dashboard.md#persistence-configuration-and-consumers), [SEED-250 sessions](SEED-250-hide-client-project-from-dashboard.md#runtime-sessions).

Before the trial, an 11-test baseline at the SEED-192 checkpoint passed in 52.3 s. Removing the changed-file overlay then failed at the changed-file lookup. That separate calibration supports a **protected, break-checked** verdict for that overlay fault. The independent assessor chose the Tab-order fault instead. Both independent faults reached the intended behavior while their original tests stayed green, which establishes a gap for each tested fault. [Pre-trial calibration record][pre-trial], [Changed-file lookup][review-link-test].

## Recheck on trunk

The recheck used source and specs on remote trunk
`550875ae5c991a1b2811fb40f1e46159bc974cc3` and took about two minutes.
Current trunk tests were inspected. The executable evidence above comes from
the historical checkpoints and faults.

| Historical claim | Status on trunk |
| --- | --- |
| SEED-192 · Open disclosure text | **Fixed.** The selector protects descendants of `details`. A journey clicks the opened explanation with the card selected and unselected, checking selection and detail. [Selector](https://github.com/terryyin/open-dough/blob/550875ae5c991a1b2811fb40f1e46159bc974cc3/dashboard/src/pageStorySelection.tsx#L120-L162), [Journey](https://github.com/terryyin/open-dough/blob/550875ae5c991a1b2811fb40f1e46159bc974cc3/dashboard/tests/navigation/story-card-dependency-selection.spec.ts#L36-L60) |
| SEED-192 · Intent’s Review action for a marked story | **Fixed.** The action requests All changes. The marked journey checks matching files and diffs both on opening and when switching an open review. The card still opens on Since the review. [Link request](https://github.com/terryyin/open-dough/blob/550875ae5c991a1b2811fb40f1e46159bc974cc3/dashboard/src/IntentStorySummary.tsx#L54-L73), [Journey](https://github.com/terryyin/open-dough/blob/550875ae5c991a1b2811fb40f1e46159bc974cc3/dashboard/tests/intent/intent-story-changes-marked.spec.ts#L58-L90) |
| SEED-192 · Recently done Tab order | **Narrower test gap.** Recently done still calls `focus()` in its test. The selection control is shared with active cards, where a real Tab assertion now protects it. The inspected tests do not establish Tab reachability specifically in Recently done. [Shared control](https://github.com/terryyin/open-dough/blob/550875ae5c991a1b2811fb40f1e46159bc974cc3/dashboard/src/pageStorySelection.tsx#L99-L118), [Done caller](https://github.com/terryyin/open-dough/blob/550875ae5c991a1b2811fb40f1e46159bc974cc3/dashboard/src/DoneStoryCard.tsx#L123-L133), [Done test](https://github.com/terryyin/open-dough/blob/550875ae5c991a1b2811fb40f1e46159bc974cc3/dashboard/tests/navigation/story-card-selection.spec.ts#L181-L195), [Active Tab test](https://github.com/terryyin/open-dough/blob/550875ae5c991a1b2811fb40f1e46159bc974cc3/dashboard/tests/navigation/accessible-board-keyboard.spec.ts#L57-L90) |
| SEED-248 · Precise Branch and Landed figures | **Fixture gap remains.** Run and revision identities differ, while precise counts and durations still match. The formatter receives both inputs. The current source check did not reproduce a substitution. [Proof fixture](https://github.com/terryyin/open-dough/blob/550875ae5c991a1b2811fb40f1e46159bc974cc3/dashboard/tests/support/intentSummaryStoryComparisonProofs.ts#L16-L101), [Formatter](https://github.com/terryyin/open-dough/blob/550875ae5c991a1b2811fb40f1e46159bc974cc3/dashboard/src/ciScopeComparison.ts#L123-L140) |
| SEED-248 · Later fast-forward moves an earlier Story Branch landing off first-parent | **Fixture gap remains.** The second branch starts after the earlier landing and leaves that landing on the first-parent chain. The fixture misses the history shape it claims to protect. A separate Trunk Mode test starts a branch before completion and checks its Landed revision. [Story Branch setup](https://github.com/terryyin/open-dough/blob/550875ae5c991a1b2811fb40f1e46159bc974cc3/dashboard/tests/support/storyCiComparisonLaterFastForward.ts#L42-L79), [Trunk Mode counterpart](https://github.com/terryyin/open-dough/blob/550875ae5c991a1b2811fb40f1e46159bc974cc3/dashboard/tests/intent/intent-ci-comparison-fast-forward.spec.ts#L119-L152) |
| SEED-250 · Hidden projects in release and feedback | **Consumer execution remains unproved.** Hide/show checks exact saved membership. The release and feedback guidance consumes the production configuration. The inspected paths give no downstream hidden-entry execution evidence. [Saved configuration](https://github.com/terryyin/open-dough/blob/550875ae5c991a1b2811fb40f1e46159bc974cc3/dashboard/tests/configuration/project-hide.spec.ts#L80-L116), [Release](https://github.com/terryyin/open-dough/blob/550875ae5c991a1b2811fb40f1e46159bc974cc3/.agents/skills/release-and-update-clients/SKILL.md#L35-L49), [Shared feedback](https://github.com/terryyin/open-dough/blob/550875ae5c991a1b2811fb40f1e46159bc974cc3/.agents/skills/collect-client-feedback/SKILL.md#L35-L58), [Combined cycle](https://github.com/terryyin/open-dough/blob/550875ae5c991a1b2811fb40f1e46159bc974cc3/.agents/skills/maintain-feedback-cycle/SKILL.md#L29-L37) |
| SEED-250 · Opening a hidden project’s final report | **Direct evidence remains unresolved.** The sidebar opens the panel separately from visible-project selection, with separate terminal and report paths. The hidden-project journey exercises terminal attachment. [Sidebar handler](https://github.com/terryyin/open-dough/blob/550875ae5c991a1b2811fb40f1e46159bc974cc3/dashboard/src/PageFrame.tsx#L125-L144), [Panel dispatch](https://github.com/terryyin/open-dough/blob/550875ae5c991a1b2811fb40f1e46159bc974cc3/dashboard/src/pageSidePanel.ts#L196-L212), [Hidden terminal journey](https://github.com/terryyin/open-dough/blob/550875ae5c991a1b2811fb40f1e46159bc974cc3/dashboard/tests/configuration/project-hide-sessions.spec.ts#L76-L116) |

## Evidence limits

These are three retrospective cases from one project. The fault probes distinguish particular gaps. Other verdicts draw on the source and the selected tests that passed at the historical revisions. A claim that depends on a relevant test that could not be run is **unknown** until that evidence exists. The selected baseline runs in all three cases completed successfully. SEED-250’s inventory conclusions cover named consumers only.

The assessors started in fresh contexts with bounded source excerpts and attest that they did not open later review records. The first two standalone Git checks inherited a host object alternate, while their named Playwright commands removed it. The third assessor verified a materialized single-checkpoint object store and assessed with the alternate removed. The host filesystem was shared throughout.

## Terry’s evaluation and decision

Terry Yin found test gaps worth acting on. Evidence for adopting the method routinely is inconclusive, so SEED-258 stays waiting. Count both concrete SEED-192 calibration journeys as misses in the initial assessment even though it found related weaknesses. Retain the focused trunk tests for clicks inside the opened disclosure and the marked-story **Review changes** action. Retain SEED-250’s saved-configuration and hidden-terminal journeys. [Calibration comparison](#what-ordinary-review-found), [Trunk recheck](#recheck-on-trunk).

The trial lacks a timed ordinary-review comparison. If the method is revisited, Terry would start with a short manual pilot alongside ordinary review on the same stories. Compare verified decisions, important misses and total effort before considering public delivery or automatic invocation during wrap-up. [ADR 0010](../adrs/0010-definition-of-improvement-accepted.md#decision).

## Test follow-up candidates

### SEED-248 · Distinguish Branch and Landed figures

Terry’s highest-priority test follow-up. Give Branch and Landed distinct counts and durations in the existing precise Summary fixtures at entry, folder and file scope. Replay the same Branch-for-Landed substitution and confirm that the strengthened tests catch it. [SEED-248 probe](SEED-248-compare-story-proof-through-merge-resolutions.md#executed-proof).

### SEED-192 · Reach Recently done selection by Tab

Extend the existing Recently done journey so it reaches **Select story** with Tab. Retain the Enter and Space activation assertions. [SEED-192 probe](SEED-192-review-story-intent-impact.md#probe).

### SEED-250 · Check actual maintenance selection

Run a focused check that follows actual maintenance selection with an otherwise eligible hidden project and verifies that the consumer still selects it. Terry prioritizes this check among the SEED-250 evidence gaps. [SEED-250 configuration](SEED-250-hide-client-project-from-dashboard.md#persistence-configuration-and-consumers).

[calibration-review]: https://github.com/terryyin/open-dough/blob/6a3a18c5d558404d4cd863fb5fdb0c707902ddd1/.planning/slice-plans/448-align-intent-story-lens/PLAN.md#L18-L35
[disclosure-test]: https://github.com/terryyin/open-dough/blob/7c71049bac64d7a6520a33628e485704a21ee855/dashboard/tests/story-card-selection.spec.ts#L222-L253
[review-link-test]: https://github.com/terryyin/open-dough/blob/7c71049bac64d7a6520a33628e485704a21ee855/dashboard/tests/intent-story-changes.spec.ts#L132-L150
[merge-review]: https://github.com/terryyin/open-dough/blob/d03cf60f11e9f9599ae99db17932a029e854ecf8/.planning/slice-plans/485-compare-story-proof-through-merge-resolutions/PLAN.md#L175-L186
[visibility-review]: https://github.com/terryyin/open-dough/blob/22fa90aefd3dbed75eba38917fb4dd5b19312d25/.planning/slice-plans/476-hide-client-project-from-dashboard/PLAN.md#L128-L142
[pre-trial]: https://github.com/terryyin/open-dough/blob/45db12b34ffe4d88ed0e9ae381259e001a25454c/.planning/slice-plans/472-assess-story-intent-protection/PLAN.md#L77
