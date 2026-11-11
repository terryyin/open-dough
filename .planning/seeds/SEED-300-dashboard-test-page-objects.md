---
id: SEED-300
status: active
planted: 2026-11-11
planted_during: Terry requested a suite-wide audit after the dashboard page-object campaign
trigger_when: Dashboard specs repeat browser mechanics or obscure the user behavior they prove
scope: eight stories
---

# SEED-300 — Dashboard test intent through page objects

## Parent goal and scope

A developer reading dashboard tests in Intent can follow what the user does,
what changes, and what the test proves. When a shared control changes, its
browser mechanics have one maintained owner across the affected tests.
All 26 original findings, including sibling specs that repeat the same
sequence or selector, remain allocated below. Each story owns its allocated
findings; no individual story must complete the entire family.

Preserve distinct behavior checks and existing test tiers. Shared browser
helpers accept caller-supplied expected facts; domain setup stays with MakeMe.
Keep held answers/releases, clock advances, request logs, pinned revisions,
native attach/PTY evidence, exact input modality and expected focus explicit
where they distinguish the outcome. These correctness constraints prevent
abstractions from hiding a regression. Direct accessibility and measurement
observations stay independent when that interface is the tested contract.

This family does not promise faster tests, fewer cases, a new fluent framework,
conversion of every browser statement, or changes to dashboard behavior.
Case-by-case fluent adoption follows the existing pilot evidence. These limits
do not require rejecting naturally supported callers or unlisted valid cases.

## Approved split, trace and order

Terry approved the recommended eight-family split on 2026-11-11. The original
identity and anchor now name the first, narrowed Intent story; its original
suite-wide scope is replaced by the eight receiving stories, not recorded as
delivered or left as competing work. No original executable plan existed:
there are no original slices or completed proof to partition. The mapping is
from the 26 retained audit findings to their canonical receiving stories and
new plans, not an invented slice history.

| Order | Receiving story | Findings | Preparation / scheduling |
| --- | --- | --- | --- |
| 1 | [Express Intent test reading through page objects](#express-dashboard-test-intent-through-page-objects) | 7 | Refined first plan; retains original queue position |
| 2 | [Express review and Side panel test intent through page objects](#express-review-test-intent-through-page-objects) | 3 | Provisional plan; selected for queue |
| 3 | [Express Terminal test intent through page objects](#express-terminal-test-intent-through-page-objects) | 1 | Provisional plan; selected for queue |
| 4 | [Express Board and published-read test intent through page objects](#express-board-test-intent-through-page-objects) | 6 | Provisional plan; queued 2026-11-11 |
| 5 | [Express session discovery and report test intent through page objects](#express-session-test-intent-through-page-objects) | 3 | Provisional plan; queued 2026-11-11 |
| 6 | [Express launch dialog and startup test intent through page objects](#express-launch-test-intent-through-page-objects) | 3 | Provisional plan; queued 2026-11-11 |
| 7 | [Express settings test intent through page objects](#express-settings-test-intent-through-page-objects) | 2 | Provisional plan; queued 2026-11-11 |
| 8 | [Express browser measurement test intent through shared setup](#express-browser-measurement-test-intent) | 1 | Provisional plan; queued 2026-11-11 |

Intent most directly serves the backlog direction of reviewing Purpose and CI
proof. Review follows with the pilot's concrete control/handoff evidence;
Terminal tests a broad shared-control ownership claim. Retain published Taken ownership and higher-priority work; place these three
at the original SEED-300 position. Preserve the shared MakeMe/page-object
rules and SEED-301 in their published relative order. Terry queued the five
remaining stories on 2026-11-11, directly after Terminal: Board first for
causal navigation value, then session reading, launch variants, settings, and
measurement setup.

Every story delivers a useful reading/maintenance improvement if later stories
are cancelled. Shared owners are reused across boundaries; there is no new
blocking dependency or duplicated owner implied by the split. Terminal and
Board have the broadest caller sweeps; the focused measurement setup has the
smallest proposed extraction. No project S/M/L band definitions were found,
so no band estimates are invented. Slice boundedness is assessed by cohesive
outcome and proof loop without an invented timing limit.

## Approach and investigation

The comparison basis is the audited source at `7eab3d6ca` and the initial
preparation base `07320772f`. The result worth keeping is readable actions and
independent outcomes, plus one maintained control owner, at a helper cost
justified by those gains. Locator counts alone do not establish improvement.

| Candidate | Fit to the goal and cost |
| --- | --- |
| Keep local helpers and use naming/review guidance | Least code, but leaves shared selectors and sequences with multiple edit sites; does not deliver the stated ownership outcome. |
| Extend existing procedural/component helpers | Recommended default: reuses established scoped observations and actions, shares controls with fluent callers, and leaves causal evidence in each scenario. |
| Convert the suite to fluent phases | Useful where recurring handoffs earn their cost; the pilot demonstrates three journeys, not a benefit for all 26 findings. A universal conversion adds machinery without that evidence. |
| Adapt a laboratory instrument/protocol separation | A mechanism within the procedural approach: the instrument adapter owns operation/measurement mechanics; the experiment protocol owns inputs, intervention order and expected results. The analogy breaks where accessibility or measurement tests examine the instrument interface itself; helpers must preserve those signals rather than normalize them. |

The strongest doubt is that page-object compliance can conceal test meaning:
one `cancelPendingJump` operation could hide the intermediate focus contract
in the Done-reference example. Page objects are a means to the reading and
maintenance outcome. Merely moving locators, deriving expected values from
production code, or hiding a held-response sequence would miss that purpose.
The existing acceptance criteria require preserving those distinctions; no goal
or audit finding is removed by this challenge.

Source observations on 2026-11-11 at `07320772f`:

- `intentCiProofPage.ts` already accepts caller-supplied expected rows;
  `support/expectCiComparisonEntryRows.ts` and `intentScopeProofPage.ts` own
  related table reading. Extend the suitable owner rather than add another
  representation of the table.
- `support/comparisonRendering.ts` supplies static SSR markup and production
  CSS; `support/comparisonMountPage.ts` mounts a live component with routed
  service answers. They return the same named comparison region, but static
  markup has no interactive event handlers. Share browser observations across
  these boundaries while preserving each setup's proof meaning.
- `storyCardPages.ts` and `support/storyReviewMark.ts` independently locate
  Review changes. `navigation/story-reference-done-cancellation.spec.ts`
  visibly splits pointer-down, held-answer release and pointer-up.
- `intentReadRecoveryPage.ts` is already shared by integrated/frontend cases.
  Sessions sidebar host-status cases still repeat their figure observation.
  `support/ciFollowUpReadingPage.ts` embeds expected run IDs/counts that should
  become caller facts as its reading API is extended.
- The historical audit is not a fresh inventory: 158 dashboard test/support
  files changed between its baseline and this preparation base. Reconcile
  current callers and assertions during planning/execution; do not treat the
  historical 589/12/376 counts as current or as coverage proof.

The suitability of these seams is supported by source inspection. The gain
from the complete migration, actual added helper cost and preservation of all
affected callers remain hypotheses for execution's before/after evaluation.

The unchanged baseline selection passed all six cases in two files on
2026-11-11 at `07320772f`:
`caffeinate -s -i npm run test:dashboard -- tests/intent/intent-ci-comparison-mounted-units.spec.ts frontend-tests/sessions-sidebar-host-status.spec.ts --workers=1`.
This observes static comparison figures and frontend host-status readings,
not a completed shared API or suite-wide regression coverage. The host had
16 logical CPUs, 48 GiB RAM, AC power and a competing SEED-287 pressure probe;
the bounded selection used one worker. No scratch product edit was made.

## Architecture

The consequential responsibility is shared test-side control and observation
ownership across procedural/fluent callers and multiple fixture tiers.
Browser helpers accept a page or scoped region plus caller facts; fixture
construction, transport holds and expected domain values keep their existing
owners. Production and test expectations remain independent.

Follow Accepted [ADR 0001 — Ubiquitous language](../../docs/adrs/0001-ubiquitous-language-accepted.md)
and [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
for Board, Story card, Selected story, Session entry, Side panel and Panel
divider responsibilities. Follow [ADR 0002 — Software development lifecycle
principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
for one representation of each conceptual solution and PFE, and
[ADR 0010 — Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md)
for evaluating clarity and edit savings against helper cost. The ADR index
and these in-file statuses agree; no conflict or exception was found. Existing
North Star direction needs no addition for this test-side change.


## Examples shared across the family

1. Integrated and rendered comparison cases show the same entry table → a
   developer reads their scenarios → both name the comparison and supply their
   own expected rows, units, order and missing comparisons through one reading
   owner. Static-render cases supply sort/percentage options as inputs;
   live-mounted and integrated cases still activate the actual controls.
2. A CI answer remains visible while a new read is held → the scenario starts
   the read, observes the retained answer, then releases it → the expected old
   and new answers and the release order remain visible in the scenario, while
   shared helpers own how each displayed fact is found.
3. A Done reference is pending → the user presses another action, the held
   detail answers before pointer release → the scenario still proves that the
   destination does not take focus and the chosen action receives the click.
   Pointer-down, answer release, intermediate focus and pointer-up remain
   separate operations.
4. Review, Final report and Terminal journeys use shared controls → a control's
   selector changes → one browser owner is edited for its affected callers;
   scenarios retain their chosen story/session, diff, report text, terminal
   input/output and attach/request-count evidence. An exact-name contract test
   keeps its independent expected name.
5. A frontend-only host-status case and an integrated Sessions sidebar case
   read the same figures → they use shared browser observations → both retain
   caller-supplied CPU/disk values without making the frontend fixture start
   the dashboard server or fake hosts.
6. A developer reviews the completed migration → each audit finding and its
   discovered sibling callers has an evidence-backed disposition → representative
   before/after scenarios show clearer intent and fewer selector edit sites,
   with the added helper cost stated and every distinct behavior check retained.


## Shared acceptance for each receiving story

- Each finding has a resolved disposition backed by the affected specs.
  A representative before/after from each feature family shows the user
  action and expected outcome in domain terms, with repeated locators and
  interaction sequences owned by shared helpers. Prefer existing procedural
  helpers and component owners. The
  [fluent pilot](../../dashboard/tests/writing-journeys.md#what-the-pilot-earned)
  supplies evidence for shared controls and recurring handoffs. Adopt fluent
  phases where those benefits justify the extra code.
- A shared control edit, such as the Story card's Review changes action or
  the Terminal's input locator, has one maintained selector owner for the
  affected callers. A test of the exact name, accessibility contract, or DOM
  measurement retains its independent expected value. Use the audited source
  as the comparison baseline and weigh call-site clarity, edit sites and
  helper cost under the
  [definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md).
- Held-read tests still show which action happens before the answer, which
  user choice supersedes it, and what stays selected after release. Touch
  and keyboard tests still identify the actual input and expected focus.
  Keep Git, HTTP, host and record evidence at the boundary it observes,
  along with the assertions that distinguish outcomes.
- Preserve each distinct behavior check and the existing test tiers. Use
  MakeMe for domain data and the existing causal waits. Run the changed
  specs and the applicable dashboard gates under the project's
  [failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests).

<a id="express-dashboard-test-intent-through-page-objects"></a>

### Express Intent test reading through page objects

**Identity:** SEED-300#express-dashboard-test-intent-through-page-objects
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/581-intent-test-reading/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"9cc3ee7f898078773bcfe34b8c4389aeaf79df6d2a4a7f7bae6b9c316eb191dd","plan":"d1379fee0506467a3fdaed9734bfecc2ade2a37e83a0103e131ee5aced957e88"}}
```

#### Goal

A developer reading Intent tests can follow CI evidence, source choices and retained reading without reconstructing browser mechanics. Shared Intent controls have one maintained owner across integrated, static-rendered and live-mounted callers.

#### Scope

Resolve the seven Intent findings below, including their same-sequence and selector siblings. Preserve expected rows, units, dates, gaps, reference membership, unsupported-comparison absence, selected source/revision, keyboard/focus and request/held-answer evidence at the call site. The first story delivers its reading and ownership improvement independently of the deferred families.

**Plan:** [Mapped plan](../slice-plans/581-intent-test-reading/PLAN.md)

#### Key examples

- Integrated and static-rendered comparisons show the same table → a developer
  reads their scenarios → both use one reading owner with explicit expected
  rows, order, units and unsupported-comparison absence. Static sort/percent
  options remain fixture inputs; live cases activate the real controls.
- A CI answer is kept while its next read is held → the scenario observes it,
  releases the answer and reads the replacement → both expected answers and
  their causal ordering remain explicit outside the reading helper.
- A selected source line survives a revision notice or failed read → the
  scenario retries or releases a held replacement → its expected file, target
  line, revision, focus and retained reading place remain independently proved.
- A Done card leads to retained CI follow-up → pointer or keyboard follows
  original/repeat/reference evidence → exact timings, attempt links, saved
  membership and absence of new acquisition stay at the call site.

#### Audit findings owned by this story

- **CI comparison and Summary.** Integrated and mounted specs each reach into
  the comparison's identity, wall time, active time, gaps, and table markup.
  The mounted legacy and units specs even define their own `fileProofRows`.
  Give comparison metrics, entry tables and Summary rows a shared reading API
  usable by both test setups. Keep the expected values, order, and absence of
  unsupported comparisons in each case.
  [Integrated counts](../../dashboard/tests/intent/intent-ci-comparison-count-gaps.spec.ts#L61),
  [adapter outcomes](../../dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts#L97),
  [retry and gaps](../../dashboard/tests/intent/intent-ci-comparison-mounted-retry.spec.ts#L32),
  [mounted legacy](../../dashboard/tests/intent/intent-ci-comparison-mounted-legacy.spec.ts#L16),
  [mounted units](../../dashboard/tests/intent/intent-ci-comparison-mounted-units.spec.ts#L23).

- **CI sorting and relative presentation.** Summary and comparison tests
  separately locate rows and sort state, gather percentage marks, and drive
  keyboard activation of the time presentation controls. Name the table,
  sort, and display-mode operations across mounted and integrated specs.
  [Comparison drilldown](../../dashboard/tests/intent/intent-ci-comparison-drilldown-relative.spec.ts#L33),
  [relative comparison](../../dashboard/tests/intent/intent-ci-comparison-relative.spec.ts#L101),
  [Summary sort](../../dashboard/tests/intent/intent-summary-ci-proof-sort.spec.ts#L75),
  [mounted Summary percentages](../../dashboard/tests/intent/intent-summary-story-comparison-mounted-relative.spec.ts#L171).

- **CI status and Proof.** Many cases already open the view through
  `intentCiStatusPage.ts` and `intentCiProofPage.ts`, then reconstruct the
  displayed state, time, checking and gap locators. Extend those owners for
  freshness, kept answers, scope and proof rows, so the test can say which
  answer the user still sees while a read is outstanding.
  [Freshness](../../dashboard/tests/intent/intent-ci-status-freshness.spec.ts#L57),
  [kept status](../../dashboard/tests/intent/intent-ci-status-kept.spec.ts#L105),
  [story gaps](../../dashboard/tests/intent/intent-ci-status-story-gaps.spec.ts#L59),
  [adapter reasons](../../dashboard/tests/intent/intent-ci-proof-adapter-reasons.spec.ts#L85),
  [unit rows](../../dashboard/tests/intent/intent-ci-proof-units.spec.ts#L103).

- **Timing history.** The CI wall-time, prior-build and scope histories repeat
  disclosure, sample selection, SVG point/reference-line access, and reading
  of the selected observation. Expose those observations through the history
  helpers, with expected dates, values, gaps and reference placement in the
  scenarios that prove them.
  [CI wall-time ordering](../../dashboard/tests/intent/intent-ci-wall-time-history-order.spec.ts#L58),
  [prior-build reference](../../dashboard/tests/intent/intent-ci-prior-build-average.spec.ts#L191),
  [scope history reading](../../dashboard/frontend-tests/intent-scope-timing-history-reading.spec.ts#L143),
  [scope history units](../../dashboard/frontend-tests/intent-scope-timing-history-units.spec.ts#L148).

- **Locations, source and recovery.** Code and Gherkin browsers, Purpose,
  revision notices and candidate journeys rebuild source rows, target lines,
  selected-file and reading-place probes. Share the operations for choosing a
  location, reading the target line, retaining the reading place, and seeing
  or retrying a failed read. Keep the request, hold, and revision sequence
  visible where it determines the outcome.
  [Source browse](../../dashboard/tests/intent/intent-code-browse-sources.spec.ts#L99),
  [Gherkin browse](../../dashboard/tests/intent/intent-gherkin-browse.spec.ts#L77),
  [Purpose target line](../../dashboard/tests/intent/intent-purpose-case.spec.ts#L59),
  [revision notice](../../dashboard/tests/intent/intent-revision-notice.spec.ts#L57),
  [candidate source](../../dashboard/tests/intent/intent-test-optimization-candidates-case.spec.ts#L32),
  [integrated recovery](../../dashboard/tests/intent/intent-read-recovery.spec.ts#L45),
  [frontend candidate recovery](../../dashboard/frontend-tests/intent-candidates-read-recovery.spec.ts#L56).

- **Story Intent and perspective changes.** The existing tab and tree helpers
  leave the story header, revision evidence, file selection, diff and
  scroll retention to individual specs. Share these across changed-tests,
  Done, project visit and source selection cases. Include narrow views and
  Files sidebar behavior, with keyboard and expected focus explicit.
  [Story changes](../../dashboard/tests/intent/intent-story-changes.spec.ts#L69),
  [Done reading after refresh](../../dashboard/tests/intent/intent-done-project-refresh-reading.spec.ts#L63),
  [project visit](../../dashboard/tests/intent/intent-project-visit.spec.ts#L68),
  [reading place](../../dashboard/tests/intent/intent-reading-place.spec.ts#L68),
  [Files sidebar](../../dashboard/tests/intent/intent-sidebar-toggle.spec.ts#L51),
  [narrow story views](../../dashboard/tests/intent/intent-story-views-narrow.spec.ts#L32).

- **Retained CI follow-up.** The Done card and retained comparison journeys
  repeat entry through the card, navigation between Development and Intent,
  and reading the original, repeat and saved reference. Extend the existing
  follow-up reading helper to own those operations, including the attempt
  links and keyboard path. Keep the expected timings, attempt IDs, reference
  membership and absence of new CI acquisition explicit.
  [Retained comparison](../../dashboard/tests/intent/intent-ci-follow-up.spec.ts#L61),
  [Done card follow-up](../../dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts#L49),
  [existing Proof helper](../../dashboard/tests/support/ciFollowUpReadingPage.ts#L14).

<a id="express-review-test-intent-through-page-objects"></a>

### Express review and Side panel test intent through page objects

**Identity:** SEED-300#express-review-test-intent-through-page-objects
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/582-review-test-intent/PLAN.md","assessment":"not-ready","reasons":["Awaiting story refinement and same-plan realignment; mapped slices are provisional."],"basis":{"document":"eae29f862b14b5c5f49ccf6b2612ca8c27aa8afd7e3905b2c21d41592911d217","plan":"24b76dd1ee6d136a2ae01f2a40650f22f4ec91b73b23536b55c9b392326bb84f"}}
```

#### Goal

A developer can read how review content opens, changes and returns beside the Board, with one owner for shared review and divider controls.

#### Scope

Resolve review entry/comparison, tree/diff/freshness, and divider/covering/return findings with all affected sibling callers. Preserve exact revisions, files, diff lines, held-answer order, input modality, width/geometry and attach/request evidence. Procedural and fluent Review changes callers share their control owner.

**Plan:** [Mapped plan](../slice-plans/582-review-test-intent/PLAN.md)

#### Preparation hold

Awaiting story refinement — not ready for slice-plan refinement or execution.
The mapped plan is provisional input. Resume with `dough-story-refinement` on
this identity, clarify its Goal, Scope and Key examples, then realign the same
plan before slice-plan refinement and readiness assessment. This is not an
execution prerequisite on another story.

#### Audit findings owned by this story

- **Opening review and reading a comparison.** The fluent pilot owns
  `Review changes` within its three journeys. A literal role-name search
  still finds that control in 22 specs. Procedural review, Intent handoffs
  and panel resize cases repeatedly select the review region, comparison,
  file, additions/removals and line counts. Share those controls with the
  existing review helpers across branch, trunk, completed and one-shot
  review. Keep the revision, file and diff expectations at the call site.
  [Review entry](../../dashboard/tests/review/story-review-action.spec.ts#L49),
  [trunk commit review](../../dashboard/tests/review/story-review-commit-trunk.spec.ts#L29),
  [completed review](../../dashboard/tests/review/story-review-completed.spec.ts#L34),
  [one-shot choice](../../dashboard/tests/review/story-review-one-shot-choice.spec.ts#L44),
  [review from Intent](../../dashboard/tests/intent/intent-story-review-return.spec.ts#L32).

- **Review tree, diff and freshness.** Tree, pane, diff context and refresh
  specs duplicate selected-file, diff-row, focus and scroll mechanics.
  Commit refresh and uncommitted check specs also rebuild refresh controls
  and displayed file checks. Compose these observations using the tree,
  pane and commit-choice helpers, while leaving held responses and the
  ordering of their release in the test.
  [Tree](../../dashboard/tests/review/story-review-tree.spec.ts#L71),
  [diff context](../../dashboard/tests/review/story-review-diff-context.spec.ts#L79),
  [refresh](../../dashboard/tests/review/story-review-refresh.spec.ts#L56),
  [commit refresh](../../dashboard/tests/review/story-review-commit-refresh.spec.ts#L35),
  [uncommitted check refresh](../../dashboard/tests/review/story-review-uncommitted-check-refresh.spec.ts#L46).

- **Divider, covering and returning to the Board.** The width specs already
  share geometry helpers, yet repeat panel open/close, drag cancellation,
  arrow-key loops, viewport transitions and xterm access. Share panel and
  divider actions with Final report and Terminal journeys. Keep chosen
  widths, bounds, input modality, before/after measurements and attach or
  request counts legible.
  [Width and cancellation](../../dashboard/tests/navigation/side-panel-width.spec.ts#L87),
  [covering](../../dashboard/tests/navigation/side-panel-width-covering.spec.ts#L94),
  [kept width](../../dashboard/tests/navigation/side-panel-width-kept.spec.ts#L34),
  [Final report divider](../../dashboard/tests/sessions/final-report-touch-divider.spec.ts#L48),
  [Terminal maximize](../../dashboard/tests/terminals/agent-terminal-maximize.spec.ts#L165).

<a id="express-terminal-test-intent-through-page-objects"></a>

### Express Terminal test intent through page objects

**Identity:** SEED-300#express-terminal-test-intent-through-page-objects
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/583-terminal-test-intent/PLAN.md","assessment":"not-ready","reasons":["Awaiting story refinement and same-plan realignment; mapped slices are provisional."],"basis":{"document":"654a3f1f2cee282cb479e1779c90b9bb82b04e36df3f2e85e7c82b70bf7d1585","plan":"704c536514caae5de537934e94302a336ccac3aaa1376248f83ea39d72ee1748"}}
```

#### Goal

A developer can follow Terminal input, output and recovery in each scenario while maintaining one browser owner for the shared screen and input controls.

#### Scope

Resolve the Terminal finding across all affected integrated/frontend and cross-feature callers, including the audited 63 direct-selector specs as a historical starting set. Cover keyboard, touch/soft keyboard, compose, paste, voice, trust/prompts and ended-input recovery. Keep literal input/output, terminal/session identity, native attach, WebSocket and PTY evidence at their observing boundaries.

**Plan:** [Mapped plan](../slice-plans/583-terminal-test-intent/PLAN.md)

#### Preparation hold

Awaiting story refinement — not ready for slice-plan refinement or execution.
The mapped plan is provisional input. Resume with `dough-story-refinement` on
this identity, clarify its Goal, Scope and Key examples, then realign the same
plan before slice-plan refinement and readiness assessment. This is not an
execution prerequisite on another story.

#### Audit findings owned by this story

- **Terminal input and output.** Direct xterm rows or helper-textarea selectors
  occur in 63 browser specs, across Terminal, launch, session, navigation,
  configuration and frontend tests. Share reading output, sending commands,
  checking the current draft and terminal identity, and opening or closing
  the panel. Use the existing Terminal, touch and paste helpers to cover
  prompts, trust, ended-input recovery, keyboard, soft keyboard, compose,
  paste, and voice. Keep actual input, output, and native attach/PTY evidence
  as test facts.
  [Keyboard](../../dashboard/tests/terminals/agent-terminal-keyboard.spec.ts#L103),
  [touch keys](../../dashboard/tests/terminals/agent-terminal-touch-keys.spec.ts#L59),
  [keyboard fit](../../dashboard/tests/terminals/agent-terminal-touch-keyboard-fit.spec.ts#L85),
  [voice](../../dashboard/tests/terminals/session-terminal-voice.spec.ts#L32),
  [frontend paste](../../dashboard/frontend-tests/agent-terminal-touch-paste-image.spec.ts#L66),
  [frontend prompts](../../dashboard/frontend-tests/terminal-prompts-recovery.spec.ts#L100).

<a id="express-board-test-intent-through-page-objects"></a>

### Express Board and published-read test intent through page objects

**Identity:** SEED-300#express-board-test-intent-through-page-objects
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/584-board-test-intent/PLAN.md","assessment":"not-ready","reasons":["Awaiting story refinement and same-plan realignment; mapped slices are provisional."],"basis":{"document":"9636b8ec6a8c899c159f9c1efd63c658838b0547d26f856b4d28117aaf9d15d0","plan":"8b52dae222f87b52d42104c68fe3f4b9c3d9518b48e10690b23db2dddd668eea"}}
```

#### Goal

A developer can read Board navigation and changing published facts as user actions and independent outcomes, with shared controls and reading observations maintained once.

#### Scope

Resolve all six Board/navigation/published-read findings and their sibling callers: column reading, project/header/destination focus, inspection/references, card evidence, Recently done stories, and published refresh/recovery. Keep pointer-down and pointer-up separately invocable, request holds/releases explicit, and expected order, focus, viewport, clocks, pinned revisions and retained positions legible.

**Plan:** [Mapped plan](../slice-plans/584-board-test-intent/PLAN.md)

#### Preparation hold

Awaiting story refinement — not ready for slice-plan refinement or execution.
The mapped plan is provisional input. Resume with `dough-story-refinement` on
this identity, clarify its Goal, Scope and Key examples, then realign the same
plan before slice-plan refinement and readiness assessment. This is not an
execution prerequisite on another story.

#### Audit findings owned by this story

- **Board columns and accessible reading.** The Board helpers own some
  layout and paging actions, while individual specs reconstruct keyboard
  walks, DOM scroll probes, responsive transitions and covering behavior.
  Express reading or paging a named column, reaching the next action and
  returning to a kept position through the Board. Preserve the expected
  order, viewport and input modality in each scenario.
  [Board scroll](../../dashboard/tests/navigation/board-scroll.spec.ts#L62),
  [column paging](../../dashboard/tests/navigation/board-paging.spec.ts#L95),
  [reading with a Side panel](../../dashboard/tests/navigation/board-reading.spec.ts#L53),
  [keyboard Board](../../dashboard/tests/navigation/accessible-board-keyboard.spec.ts#L84),
  [touch Board](../../dashboard/tests/navigation/accessible-board-touch.spec.ts#L77).

- **Project choice, header and destination focus.** The project keyboard,
  compact/wide header, development frame, notification and source navigation
  cases duplicate reaching controls, changing perspective/project, and
  reading focus or scroll after arrival. Extend the project choice and
  frame/navigation helpers for those actions. Keep expected key order,
  selected project, destination and sanitized-link expectations explicit.
  [Header](../../dashboard/tests/navigation/dashboard-header.spec.ts#L137),
  [compact header](../../dashboard/tests/navigation/dashboard-header-compact.spec.ts#L91),
  [project keyboard eligibility](../../dashboard/tests/navigation/project-keyboard-navigation-eligibility.spec.ts#L59),
  [notification destination](../../dashboard/tests/navigation/notification-story-navigation.spec.ts#L107),
  [source link](../../dashboard/tests/navigation/source-navigation.spec.ts#L130).

- **Story inspection and references.** Story selection, dependency and
  reference suites re-find the same card, dependency disclosure, destination
  and notice. The Done cancellation spec repeats the first half of the
  pending jump three times and computes pointer/focus operations inline.
  Give the story card and Board a shared reference flow, with separate
  actions for pointer-down and release so a held read can answer between them.
  [Card selection](../../dashboard/tests/navigation/story-card-selection.spec.ts#L118),
  [dependency selection](../../dashboard/tests/navigation/story-card-dependency-selection.spec.ts#L51),
  [reference navigation](../../dashboard/tests/navigation/story-reference-navigation.spec.ts#L69),
  [Done cancellation](../../dashboard/tests/navigation/story-reference-done-cancellation.spec.ts#L35),
  [Done recovery](../../dashboard/tests/navigation/story-reference-done-recovery.spec.ts#L40).

- **Story card evidence.** Preparation, dependencies, readiness, ownership,
  roster and branch progress tests repeat card subregions, badge classes,
  avatar and owner lookups, and expansion controls. Extend the existing
  card/roster helpers to read the visible evidence. Keep expected ordering,
  actor, links, statuses, slice counts and malformed-record messages explicit.
  [Preparing](../../dashboard/tests/stories/backlog-preparing.spec.ts#L55),
  [readiness](../../dashboard/tests/stories/story-readiness.spec.ts#L77),
  [dependencies](../../dashboard/tests/stories/story-dependencies.spec.ts#L57),
  [roster and credit](../../dashboard/tests/stories/agent-roster-avatar.spec.ts#L44),
  [slice progress](../../dashboard/tests/stories/taken-slice-progress.spec.ts#L125),
  [branch progress reading](../../dashboard/tests/stories/branch-progress-reading.spec.ts#L35).

- **Recently done stories.** Progressive loading and reset, refresh and
  retained-range journeys share some setup but still inline the column count,
  latest-range controls, wheel/scroll and collapse focus mechanics. Share
  those Board operations with reference and retained session cases. Keep
  which requests answer, visible entry order, and the distinction between
  showing fewer stories and abandoning a pending destination.
  [Progressive loading](../../dashboard/tests/stories/recently-done-progressive-loading.spec.ts#L81),
  [retained state](../../dashboard/tests/stories/recently-done-progressive-state.spec.ts#L111),
  [refresh](../../dashboard/tests/stories/recently-done-progressive-refresh.spec.ts#L113),
  [read latency](../../dashboard/tests/stories/recently-done-read-latency.spec.ts#L38).

- **Published facts, refresh and read recovery.** Observation tests repeat
  card/owner/progress selectors, timestamps and notices, and inline browser
  probes for retained focus, scroll and placeholders. Extend the existing
  dashboard and recovery helpers so the spec can say what remains visible
  while the next answer is held, and what appears when it arrives. Keep
  held reads, controlled clock steps, request logs and pinned revisions
  where the causal order is the proof.
  [Published facts reading](../../dashboard/tests/observation/published-facts-reading.spec.ts#L40),
  [steady refresh](../../dashboard/tests/observation/steady-refresh-carry.spec.ts#L43),
  [automatic recovery](../../dashboard/tests/observation/auto-refresh-recovery.spec.ts#L68),
  [rate limit](../../dashboard/tests/observation/auto-refresh-rate-limit.spec.ts#L92),
  [profile latency](../../dashboard/tests/observation/profile-addition-latency.spec.ts#L100),
  [transient credit](../../dashboard/tests/observation/transient-credit-recovery.spec.ts#L102).

<a id="express-session-test-intent-through-page-objects"></a>

### Express session discovery and report test intent through page objects

**Identity:** SEED-300#express-session-test-intent-through-page-objects
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/585-session-test-intent/PLAN.md","assessment":"not-ready","reasons":["Awaiting story refinement and same-plan realignment; mapped slices are provisional."],"basis":{"document":"b99940224770c06e559d6ef014fedbc7518ad99d7ebc82807396c0e50e54fb4a","plan":"0176a2d534b3a6311e870baa8bbad0048a1f756fb96ffa0c5d86148a50eaed28"}}
```

#### Goal

A developer can follow session membership, discovery and report reading across the Board and sidebars while shared session controls have one browser owner.

#### Scope

Resolve session rows/actions/membership, Sessions sidebar/Running Cursor, and Final report/retained-session/retirement findings plus sibling callers. Preserve selecting versus opening a report, independent readings of one session in different surfaces, expected host figures, exact report/session facts, keyboard/focus and retired-workspace evidence. Frontend setup remains independent of integrated servers.

**Plan:** [Mapped plan](../slice-plans/585-session-test-intent/PLAN.md)

#### Preparation hold

Awaiting story refinement — not ready for slice-plan refinement or execution.
The mapped plan is provisional input. Resume with `dough-story-refinement` on
this identity, clarify its Goal, Scope and Key examples, then realign the same
plan before slice-plan refinement and readiness assessment. This is not an
execution prerequisite on another story.

#### Audit findings owned by this story

- **Session rows, actions and membership.** Board, sidebar and retained
  session tests repeat the row selector, disclosures, state/badge locators
  and Done/Delete controls. Share row operations and observations for open,
  inspect, confirm/cancel and placement in Taken or Recently done, using the
  existing session-entry and mark-done helpers. Keep separate checks for the
  same session shown in different surfaces where that is the promise.
  [Compact entry](../../dashboard/tests/sessions/compact-session-entry.spec.ts#L69),
  [story-card session rows](../../dashboard/tests/sessions/agent-launch-story-card-sessions.spec.ts#L203),
  [Delete](../../dashboard/tests/sessions/agent-launch-story-card-delete.spec.ts#L99),
  [column membership](../../dashboard/tests/sessions/session-column-membership.spec.ts#L82),
  [unread reports](../../dashboard/tests/sessions/session-unread-report.spec.ts#L91),
  [Cursor recovery](../../dashboard/tests/sessions/cursor-session-recovery-stops.spec.ts#L56).

- **Sessions sidebar and Running Cursor sessions.** Keyboard walks,
  selection, paging, scroll retention and resize are still built from
  locators, coordinates and raw focus checks. The frontend and integrated
  host-status specs each define `expectFigure`. The frontend Running Cursor
  spec duplicates opening the list. Share those observations and actions
  without coupling frontend fixtures to integrated servers.
  [Sidebar keyboard](../../dashboard/tests/sessions/sessions-sidebar-keyboard.spec.ts#L81),
  [kept scroll](../../dashboard/tests/sessions/sessions-sidebar-stays-as-left.spec.ts#L129),
  [Recently done paging](../../dashboard/tests/sessions/recently-done-sessions-sidebar-paging.spec.ts#L174),
  [Cursor resize](../../dashboard/tests/sessions/cursor-sessions-sidebar-resize.spec.ts#L96),
  [integrated host status](../../dashboard/tests/sessions/sessions-sidebar-host-status.spec.ts#L21),
  [frontend host status](../../dashboard/frontend-tests/sessions-sidebar-host-status.spec.ts#L20),
  [frontend Running Cursor](../../dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts#L73).

- **Final report, retained sessions and workspace retirement.** The
  Recently done selection, unread report, completion and retirement families
  repeat report text, panel title, session ID and read/open/close mechanics.
  Expose those facts through the report and session pages. Keep exact
  report text, the distinction between selecting a session and opening its
  report, and retired-workspace evidence visible.
  [Recently done selection](../../dashboard/tests/sessions/recently-done-sessions-select.spec.ts#L82),
  [report reading by touch](../../dashboard/tests/sessions/final-report-touch.spec.ts#L57),
  [completion attention](../../dashboard/tests/sessions/agent-completion-attention.spec.ts#L160),
  [retirement attach](../../dashboard/tests/sessions/session-workspace-retirement-attach.spec.ts#L85),
  [retirement and reports](../../dashboard/tests/sessions/session-workspace-retirement.spec.ts#L47).

<a id="express-launch-test-intent-through-page-objects"></a>

### Express launch dialog and startup test intent through page objects

**Identity:** SEED-300#express-launch-test-intent-through-page-objects
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/586-launch-test-intent/PLAN.md","assessment":"not-ready","reasons":["Awaiting story refinement and same-plan realignment; mapped slices are provisional."],"basis":{"document":"8913439d1e674c5a75ae7a2c8f069e2394b22197a13e88a20004be40f212bb0a","plan":"0229430035393fe53599583760c6d2a82b5cc97d1d5d0099747442a49b680f75"}}
```

#### Goal

A developer can read a launch scenario as chosen workflow, host, inputs and startup answer, with shared dialog and recovery controls maintained once.

#### Scope

Resolve entry/dialog, input/attachments/touch layout, and startup answers/recovery findings with affected siblings. Preserve workflow/host/options, existing-change disclosure and refusal, exact payloads, provider faults, focus/gestures, accepted progress gates and verification/refusal wording at the call site.

**Plan:** [Mapped plan](../slice-plans/586-launch-test-intent/PLAN.md)

#### Preparation hold

Awaiting story refinement — not ready for slice-plan refinement or execution.
The mapped plan is provisional input. Resume with `dough-story-refinement` on
this identity, clarify its Goal, Scope and Key examples, then realign the same
plan before slice-plan refinement and readiness assessment. This is not an
execution prerequisite on another story.

#### Audit findings owned by this story

- **Launch entry and dialog.** The base-CI siblings repeat opening a card's
  start menu, choosing a host and confirming. Story, ad hoc, preparation,
  model/options and existing-changes cases likewise rebuild dialog controls.
  Extend the launch and session dialog helpers to express workflow, host,
  options, review of existing changes and confirmation. Keep refusal and
  disclosure steps visible in cases that prove them.
  [Base CI](../../dashboard/tests/launches/agent-launch-base-ci.spec.ts#L34),
  [unread base CI](../../dashboard/tests/launches/agent-launch-base-ci-unread.spec.ts#L39),
  [model controls](../../dashboard/tests/launches/agent-launch-model.spec.ts#L73),
  [exclusive options](../../dashboard/tests/launches/agent-launch-options-exclusive.spec.ts#L44),
  [existing changes](../../dashboard/tests/launches/agent-launch-start-session-existing-changes.spec.ts#L68).

- **Launch input, attachments and touch layout.** Host-specific attachment
  tests repeat preview and draft controls, and input-voice cases repeat
  recording, cancellation and overflow editing. Launch layout cases
  repeatedly disclose, scroll to and touch the same dialog controls.
  Give the dialog reusable operations for attach, paste, draft, record,
  edit and touch reachability. Keep payloads, provider faults, expected
  focus and gesture distinctions in the cases.
  [Attachment cancellation](../../dashboard/tests/launches/agent-launch-ad-hoc-attachments-cancel.spec.ts#L28),
  [Cursor attachments](../../dashboard/tests/launches/agent-launch-ad-hoc-attachments-cursor.spec.ts#L42),
  [frontend refusal](../../dashboard/frontend-tests/agent-launch-ad-hoc-attachments-refusal.spec.ts#L59),
  [voice overflow](../../dashboard/tests/launches/session-instruction-voice-overflow.spec.ts#L98),
  [touch dialog](../../dashboard/tests/launches/agent-launch-dialog-touch.spec.ts#L44).

- **Startup answers and recovery.** Launch response, accepted progress,
  retry/recheck/continue and refusal selectors are repeated across
  preparation, responsive and recovery families. Use shared operations to
  read a launch result and take the next available action. Keep host
  progress gates and exact verification/refusal wording as scenario evidence.
  [Story start answers](../../dashboard/tests/launches/agent-launch-start-story-card.spec.ts#L81),
  [preparation retry](../../dashboard/tests/launches/agent-launch-preparation-codex-retry.spec.ts#L78),
  [responsive access](../../dashboard/tests/launches/responsive-session-access.spec.ts#L100),
  [recovery verification](../../dashboard/tests/launches/responsive-session-recovery-verification.spec.ts#L93),
  [frontend startup words](../../dashboard/frontend-tests/startup-host-words.spec.ts#L52).

<a id="express-settings-test-intent-through-page-objects"></a>

### Express settings test intent through page objects

**Identity:** SEED-300#express-settings-test-intent-through-page-objects
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/587-settings-test-intent/PLAN.md","assessment":"not-ready","reasons":["Awaiting story refinement and same-plan realignment; mapped slices are provisional."],"basis":{"document":"5c670340f703e84572ea34df388c8a2d4cf8c6ad628457e400ef687faeecf698","plan":"a36aaba85c0b1c00d7540491289948393255641f6bef0f3c3af90b03cbf8bd73"}}
```

#### Goal

A developer can follow project/settings changes and appearance observations through named controls without duplicating their browser mechanics.

#### Scope

Resolve projects/settings navigation and settings controls/appearance findings, including integrated Intent dark appearance and frontend appearance callers. Preserve URLs, paths, chosen project, filesystem evidence, focus destination, expected settings/status values, color scheme and dimensions.

**Plan:** [Mapped plan](../slice-plans/587-settings-test-intent/PLAN.md)

#### Preparation hold

Awaiting story refinement — not ready for slice-plan refinement or execution.
The mapped plan is provisional input. Resume with `dough-story-refinement` on
this identity, clarify its Goal, Scope and Key examples, then realign the same
plan before slice-plan refinement and readiness assessment. This is not an
execution prerequisite on another story.

#### Audit findings owned by this story

- **Projects and settings navigation.** Add/refusal and settings management
  repeat the add dialog's fields and submit action. Remove, hide and project
  configuration cases rebuild settings row controls and focus recovery.
  Reuse the settings and project-add helpers for rows, dialogs and return
  to Board. Keep the URLs, paths, chosen project, focus destination and
  filesystem evidence explicit.
  [Add refusal](../../dashboard/tests/configuration/project-add-refusal.spec.ts#L29),
  [project removal](../../dashboard/tests/configuration/project-remove.spec.ts#L20),
  [hide with sessions](../../dashboard/tests/configuration/project-hide-sessions.spec.ts#L78),
  [settings project management](../../dashboard/tests/configuration/system-settings-project-management.spec.ts#L24),
  [touch project management](../../dashboard/tests/configuration/system-settings-project-management-touch.spec.ts#L48).

- **Settings controls and appearance.** Credential recovery, terminal
  theme, feedback maintenance and system appearance cases repeat selected
  options, status, focus and visibility/contrast reads. Reuse settings
  controls and appearance helpers for these operations, including the
  integrated Intent dark-appearance case. Keep expected values, color
  scheme and dimensions where the behavior depends on them.
  [Credential recovery](../../dashboard/tests/configuration/system-settings-openai-recovery.spec.ts#L26),
  [terminal theme](../../dashboard/tests/configuration/system-settings-terminal-theme.spec.ts#L25),
  [feedback maintenance](../../dashboard/tests/configuration/system-settings-feedback-maintenance.spec.ts#L57),
  [frontend system appearance](../../dashboard/frontend-tests/dashboard-system-appearance.spec.ts#L126),
  [Intent dark appearance](../../dashboard/tests/intent/intent-story-dark-appearance.spec.ts#L48).

<a id="express-browser-measurement-test-intent"></a>

### Express browser measurement test intent through shared setup

**Identity:** SEED-300#express-browser-measurement-test-intent
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/588-browser-measurement-test-intent/PLAN.md","assessment":"not-ready","reasons":["Awaiting story refinement and same-plan realignment; mapped slices are provisional."],"basis":{"document":"a37b0eca16636030e1c9de2e7f3a21c4fbd8298e113b4d808a94c416c794ce79","plan":"d4ff11849f3cc9f5e7488ce27a6f3a8e7cb1424e70af0d57eb0129ae5e472736"}}
```

#### Goal

A developer can read the exact browser measurement contract being proved while repeated fixture and gesture setup has one suitable test-side owner.

#### Scope

Resolve only repeated surrounding fixture DOM access, coordinate plumbing and CDP touch setup in the measurement finding. Keep direct utility calls and independent measurements visible, including runtime browser-turn, trace, metadata and request-drain observations that are themselves the contract. A naturally direct observation can retain that form with an evidence-backed disposition.

**Plan:** [Mapped plan](../slice-plans/588-browser-measurement-test-intent/PLAN.md)

#### Preparation hold

Awaiting story refinement — not ready for slice-plan refinement or execution.
The mapped plan is provisional input. Resume with `dough-story-refinement` on
this identity, clarify its Goal, Scope and Key examples, then realign the same
plan before slice-plan refinement and readiness assessment. This is not an
execution prerequisite on another story.

#### Audit findings owned by this story

- **Browser measurement proofs.** Frontend observation, reachability and
  touch-reading cases deliberately exercise the measurement utilities. The
  surrounding fixture DOM lookups, coordinate plumbing and CDP touch setup
  can use shared test-side primitives where repeated. Keep the direct
  utility call and independent measurement evidence visible. Runtime specs
  use browser turns, trace reporting, document metadata and request draining
  as their proof. Their direct observations serve the tested contract.
  [Observation measurements](../../dashboard/frontend-tests/observation-measurements.spec.ts#L13),
  [reachability](../../dashboard/frontend-tests/control-reachability-observation.spec.ts#L99),
  [touch reading](../../dashboard/frontend-tests/touch-reading-observation.spec.ts#L37),
  [runtime browser turn](../../dashboard/tests/runtime/observation-measurements.spec.ts#L43).
