# Express Story review and Side panel test intent

**Identity:** SEED-300#express-review-test-intent-through-page-objects
**Source:** [Story](../../seeds/SEED-300-dashboard-test-page-objects.md#express-review-test-intent-through-page-objects)

**Source review:** [Source-only commitments](source-review.md)

## Goal, scope and evaluation

A developer follows review entry, comparison, file/diff reading, freshness and
Side panel interactions through named actions and independent outcomes. Each
shared control has one browser owner across affected procedural/fluent callers.
Resolve the source's three findings and their same-control/sequence siblings,
including callers in Intent, Final report and Terminal. Preserve every distinct
behavior check, test tier, held-answer order, revision/file/diff expectation,
input modality, focus/scroll/geometry observation and native/HTTP/Git evidence.

No dashboard behavior change, universal fluent conversion, new framework or
suite-wide speed promise. Unrelated Terminal, session/report, Board and Intent
migration stays with the sibling stories. The cold harness repair below is
necessary to preserve this story's complete proof, not a wider speed campaign.

For each finding, execution retains one representative before/after at the
source audit `7eab3d6ca` and current preparation base `47b348b3a`, names clearer
actions/outcomes, counts mechanics edit sites and states added helper cost.
Keep the change only when those gains justify that cost under ADR 0010.
Locator counts alone and passing examples do not establish improved readability.

## Architecture and existing solutions

PFE inspected shared controls, procedural helpers, fluent phases, fixture tiers,
consumer specs and [the pilot](../../../dashboard/tests/fluent-side-panel-pilot.md#what-the-pilot-earned).
Use `storyCardControls.ts` for the shared Review changes control, reached by
`StoryCard` and procedural opening helpers. Keep `openStoryReview`'s card-settling
and response handling distinct from locating/pressing the control: held-read
callers must be able to press without awaiting the answer.

Extend the suitable existing `storyReviewPages.ts`, `support/reviewTreeRows.ts`,
`reviewPanes.ts`, `reviewContextLine.ts`, `expandContextDiff.ts`, `reviewLineNumbers.ts`,
`reviewRead.ts` and `storyReviewCommitChoice.ts`. The last waits before and after
commit choice because a completed read moves its target; preserve that contract.
Reuse `sidePanelFramePages.ts`, `sidePanelWidthPage.ts`, `pageLayout.ts` and
`support/sidePanelContents.ts` for frame/divider geometry and operations. Reuse
Terminal/touch reading primitives for panel consumers without migrating their
unrelated input workflows. Keep existing touch journey/protocol seams.

Procedural helpers are the default; fluent phases earn their extra machinery
where handoffs recur. A generic click wrapper, duplicate observation model or
helper deriving expectations from rendered/production values would miss the goal.

Follow Accepted [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md),
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
The index and in-file statuses agree; no supersession, conflict or exception was
found. In particular, closing the Side panel preserves the Selected story.
The existing [.planning North Star](../../NORTH-STAR.md) and
[UX/UI direction](../../../docs/dashboard-ux-ui-north-star.md) need no new topic
for test-side owner reuse.

Expected owner sizes at preparation: `storyCardControls` 93, `storyCardPages` 173,
`storyReviewPages` 132, `sidePanelFramePages` 98, `sidePanelWidthPage` 234,
`support/pageTest` 126, `preparationPage` 82, `storyReviewMark` 230 and
`reviewTouchReading` 244 lines. No inspected expected owner exceeds 250 lines.
Keep control, geometry, observation and fixture responsibilities cohesive;
extract their actual shared seam when extending a near-limit file rather than
append orchestration or mechanically cut it. Migrated specs should shrink.

## Preparation evidence

[Premise rows, P0–P3 commands and original observations](preparation-evidence.md)
retain the accepted planning basis and bounded cold-preparation candidate.

## Ordered slices

Each slice includes implementation, focused proof and cleanup. The first Structure
restores required proof for the following Behavior; each slice leaves working tests.

### 1. Restore complete review handoff proof within the default case budget
Type: Structure
Status: done
Original contract and proof: [delivered slice 1](delivered-slice-contracts.md#slice-1).

### 2. Read review entry and comparisons through shared controls
Type: Behavior
Status: done
Original contract and proof: [delivered slice 2](delivered-slice-contracts.md#slice-2).

### 3. Read tree, file and diff retention without local selector plumbing
Type: Behavior
Status: done
Original contract and proof: [delivered slice 3](delivered-slice-contracts.md#slice-3).

### 4. Keep freshness and held-answer causality visible
Type: Behavior
Status: done
Original contract and proof: [delivered slice 4](delivered-slice-contracts.md#slice-4).

### 5. Express Panel divider and Board return through their owners
Type: Behavior
Status: done
Proof: Geometry/width persistence, actual drag/cancel/key/touch input, focus,
Selected story, retained file/report/terminal, and attach/read counts stay visible.

Behavior: A reviewer resizes, cancels, changes viewport, maximizes/restores or
closes/reopens panel content → shared frame/divider operations expose that input
→ original measurements and independent observations still establish retained
width/content and Board return across review, report and Terminal callers.
The helper may take a caller-chosen key/count or geometry fact, not choose it
silently; use existing Terminal primitives only where this panel journey needs them.

Starting gate: `caffeinate -s -i npm run test:dashboard -- 'tests/navigation/side-panel-width' tests/navigation/side-panel-content-replacement.spec.ts tests/navigation/side-panel-content-switching.spec.ts tests/sessions/final-report-touch-divider.spec.ts tests/terminals/agent-terminal-maximize.spec.ts tests/intent/intent-story-review-return.spec.ts --workers=1`.
Trace shared layout/close effects through narrow/touch/frontend consumers too.

Execution proof: [slice 5](slice5-evidence.md), [handoff](slice5-handoff.md), [cost](slice5-benefit-cost.md), [consumer trace](slice5-consumer-trace.md); [slice 1](slice-evidence.md), [slice 2](slice2-evidence.md), [slice 3](slice3-evidence.md); [slice 4](slice4-evidence.md), with [prior failures](slice4-progress.md) and [AC resume](slice4-resume-evidence.md).

## Execution complete

Product advice: no change. The shared test owners complete the selected outcome; retain the existing sibling-story priorities. Product/proof review is complete; selected process review is deferred until wrap-up's Intent Coverage report and dispositions.

## Execution context

[Workspace, publication and observer identity](execution-context.md).

## Verification, current decisions and concern review

Source example1 → slice2; example2 → slice3; example3 → slice4 (with its shared
race gate after slice5); example4 → slice5. Example5 and shared acceptance are
owned per finding by slices2–5: each records its caller disposition, assertion
preservation and before/after benefit/cost before delivery. Slice1 restores the
whole handoff proof used by those mappings. The Ordered slices statuses are authoritative.

Use MakeMe for domain data, stating driving facts at the call site. Keep exact
inputs/actions and independent expectations outside the builder. No sleeps,
`test.slow()`, retries/skips to absorb failure, or timeout extensions. Preserve
existing tiers, causal waits, controlled clocks and native/HTTP/Git boundaries.
The [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to every slice, delegation and repair handoff. A base failure
is not exempt; slice1 repairs P0 before the dependent migration proceeds.

Local gate: changed specs plus all affected transitive consumers and
`npm run typecheck:dashboard` for shared TypeScript changes. Moderate CPU usage
in a moderately busy context is supported; no idle-machine or quiet-window
prerequisite applies (developer clarification). Use the maintained
[macOS sleep guard](../../../tests/local-test-resources.md#machine-sleep-on-macos):
on AC run long proof under `caffeinate -s -i`; on battery plug in or start fully
awake with lid open under `caffeinate -i` and inspect sleep logs afterwards.
These checks follow [project test guidance](../../../AGENTS.md#test-automation)
and shared proof ownership; CI configuration alone adds no full local suite gate.
A changed common fixture warrants its affected fixture-consumer cohort, including
both hosts. Run the installed consumer-trace script for each delivered effect,
follow helper names into real scenarios and disposition matches as run/reused/
excluded with a reason. Extend the starting gates above; do not infer full caller
coverage from a representative passing sample. Run the whole affected cohort
when it is the bounded proof loop. Hosted CI failures remain owned under policy.

The original [construction rationale](preparation-evidence.md#plan-construction-rationale)
is retained with the preparation premises; current gaps are owned below.

## Story obligations

### G1. Preserve exact review region matching
Reported: slice 2 — "Coordinator inspection found board-scroll exact:true review-region lookup replaced by the partial-match reviewRegion helper."
Story clause: "independent accessibility/geometry observations"
Disposition: proved by slice 2: storyReviewMark.ts31–35 retains the caller exact option; board-scroll.spec.ts46 supplies exact:true; final 14-case proof passed, including both board viewports.

### G2. Restore the cold held-choice race within the default budget
Reported: slice 4 — "The held one-shot run/file race timed out at Hide files after cold setup and three native preparations; trace has no sleep or selector stall."
Story clause: "preserves the default timeout and complete journeys"
Disposition: proved by slice 4: slice4-resume-evidence.md records two independent cold runs with immutable-key chronology and the complete native/held/panel journey at the default timeout. Total elapsed improvement is not attributed wholly to the fixture change.

### G3. Settle the final trunk-review Refresh timeout
Reported: slice 4 — "The trunk-worktree case exhausted30s at final Refresh under recurring external CPU pressure; its origin was warm, so G2 is not its fix."
Story clause: "preserves the default timeout and complete journeys"
Disposition: proved by slice 4: slice4-evidence.md records inspected real Take/publish/mark/finalRefresh paths, distributed prior host latency and the complete53-case strict renewal under supported moderate-busy conditions; default timeout and source unchanged.

### G4. Restore the complete phone touch retention proof
Reported: slice 4 — "Timeout began during third native scroll while remaining code reported later final-label cancellation; errorstack alone misleading."
Story clause: "preserves the default timeout and complete journeys"
Disposition: proved by slice 4: slice4-evidence.md records the complete native/rotation/file/Refresh/commits/check/focus continuation,4-case strict proof and failed/full trace comparison under supported moderate-busy conditions, without reducing observations or extending timeout.

### G5. Preserve the held-choice divider's scope and matching
Reported: slice 5 — "Coordinator WIP inspection found one-shot-choice-races' review-scoped partial-name divider replaced with shared exact matching and page-scoped focus."
Story clause: "exact input and focus expectations"
Disposition: proved by slice 5: slice5-evidence.md: inspected review-scoped partial divider/focus and explicit ArrowLeft/width+32; complete held-choice run/file/release/narrow/Refresh/Close continuation passed in current review66 and lifecycle11.

### G6. Include shared frame actions across sibling test families
Reported: slice 5 — "Initial consumer assessment proposed leaving raw Side panel Close actions in sibling families; coordinator confirmed actual same-control actions belong to this story, while dialogs and independent contract observations remain distinct."
Story clause: "same-control or same-sequence sibling callers"
Disposition: proved by slice 5: slice5-consumer-trace.md and slice5-evidence.md:61frame actions/48files plus procedural/fluent facades share action-only controls; actual dialog and independent-contract exclusions inspected; all84changed specs and transitive cohorts passed.

### G7. Route the pane Refresh action through its semantic owner
Reported: slice 5 — "Aggregate audit found story-review-panes using generic control(review,Refresh), bypassing the shared reviewRefresh owner despite the literal-selector check finding only one lookup."
Story clause: "Shared review and divider controls have one browser owner"
Disposition: proved by slice 5: slice5-evidence.md: pane Refresh now reviewRefresh(review,{exact:true}).click with original wait ownership; both complete pane scenarios passed in current review66 after inspected cold setup.

### G8. Restore the warm conflicted-file baseline proof
Reported: slice 5 — "story-review-since-trunk's conflicted-file case timed out at30s after private fixture, real Git and two snapshot reads; exact Close completed normally, and immutable inputs were warm."
Story clause: "preserves the default timeout and complete journeys"
Disposition: proved by slice 5: slice5-evidence.md and slice5-progress.md: inspected real integration/mark/reopen and flagged c.ts baseline diff; original complete conflicted-file shape passed in current lifecycle11 and full review66 after accepted lifecycle supplier reconciliation. Earlier failed broad verdict retained.

### G9. Restore the retired Story Branch fixed-pair journey
Reported: slice 5 — "The complete retired Story Branch journey timed out after warm setup and real refinement, claimed execution and integration; default-budget retirement/fixed-pair continuation remains unproved in this gate."
Story clause: "preserves the default timeout and complete journeys"
Disposition: proved by slice 5: slice5-evidence.md: inspected real refinement/claim/integration/retirement, fixed captured pair and later-trunk-revert Refresh; complete original journey passed in lifecycle11 and full review66 with unchanged budgets and boundary evidence.

### G10. Restore cold pane proof before testing its Refresh owner
Reported: slice 5 — "The fresh pane renewal timed out before Refresh after26.706s Before Hooks, including sequential cold origin10.623s, app9.403s and bundle1.355s preparation."
Story clause: "preserves the default timeout and complete journeys"
Disposition: proved by slice 5: slice5-evidence.md: existing queuedClaudePreviewTest prepares all3immutable worker inputs before private origin; real pane setup/actions remain; both full pane cases passed at default budget in current review66. Prior26.706s cold failure retained.

### G11. Restore complete native frame-consumer proof
Reported: slice 5 — "Native cohort timed out in two ad-hoc Codex retention/restart variants and the card's multi-session Preparing/reload journey; changed Close actions retain their original exact click and add no wait."
Story clause: "preserves the default timeout and complete journeys"
Disposition: proved by slice 5: slice5-evidence.md: original84case native cohort strictpassed84/84,retry0; all3ad-hoc Codex variants and all Preparing/reload continuations observed with original inputs/records/protocol. No native work, observations or timeout reduced.

### G12. Preserve matching in migrated Terminal opening actions
Reported: slice 5 — "Width-spec Open terminal and Terminal maximize's local opening used partial matching, but their new shared openTerminalControl call inherited exact:true."
Story clause: "independent accessibility/geometry observations"
Disposition: proved by slice 5: slice5-evidence.md: inspected old partial-name scope against explicit exact:false getter options; all width cases and full Terminal Maximize continuation retain native output/focus/geometry/attach expectations and passed.

### G13. Complete actual shared Session-entry opening reach
Reported: slice 5 — "Aggregate opening audit found additional raw Session-entry Open terminal actions in avatar, Cursor launch and Board paging consumers; only their shared opening action is included, with independent contract observations retained."
Story clause: "Shared panel/control callers in those families are included"
Disposition: proved by slice 5: slice5-consumer-trace.md and slice5-evidence.md:54additional Terminal getters/35paths plus8width sites retain exact scope/name/options;39remaining raw queries are independent expectations; full opening62/native84/continuation25 observations passed.

### G14. Restore the normal frame starting gate
Reported: slice 5 — "Normal14-case renewal reported12passes/2timeouts: Intent return's first cold input cost17.397s Before Hooks, and the first full fluent content-replacement journey also timed out."
Story clause: "preserves the default timeout and complete journeys"
Disposition: proved by slice 5: slice5-evidence.md: exact14required identities mapped to9review,2current report-entry and3current native passing whole observations;8review observations match manifest caller hashes, unchanged content-switching matches sameHEAD76413 bytes. Original failed14verdict retained; no invented runner pass.

### G15. Settle the full held-choice diagnostic setup timeout
Reported: slice 5 — "The full5-case warm GitTrace2 diagnostic timed out in its first G2journey before navigation or panel input,36.395s including teardown; the earlier normal complete case passed22.063s."
Story clause: "preserves the default timeout and complete journeys"
Disposition: proved by slice 5: slice5-evidence.md and slice5-progress.md: inspected unchanged complete held-choice fixture/protocol and accepted lifecycle supplier; current normal lifecycle11 and review66 prove full G2 through final focus without instrumentation or reduced inputs. Failed GitTrace2 setup verdict retained with context; no isolated causal claim.

### G16. Share actual Read final report opening actions
Reported: slice 5 — "Opening audit found raw Read final report actions in StoryCard, touch, Intent keyboard and retirement consumers; independent report availability/name observations remain distinct."
Story clause: "Express Side panel opening/closing"
Disposition: proved by slice 5: slice5-consumer-trace.md and slice5-evidence.md:25actual report actions/13paths and indirect conditional row/showReport consumers use pure named access;7independent expectations remain. Complete report6/native84/opening62/continuation25 proof passed; quiet loop/native includeTurns/receipt facts preserved.


### G17. Complete the reached progressive-reset divider sequence
Reported: slice 5 — "Independent refactor found recently-done-progressive-reset still using panelDivider(page).focus and two raw ArrowLeft presses instead of the shared divider operations."
Story clause: "keyboard resizing"
Disposition: proved by slice 5: slice5-refactor.md: inspected exact page-scoped focus then two ArrowLeft keys through shared operations, with original complete range/native/read-count/reload/late-answer continuations; renewed whole spec2/2 strictpassed,retry0,18.234s; all4trace matches dispositioned and other99source hashes unchanged.
Commitment: 44
