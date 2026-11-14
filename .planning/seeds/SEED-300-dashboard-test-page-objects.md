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
The remaining findings, including sibling specs that repeat the same
sequence or selector, are allocated below. Each remaining story owns its
allocated findings; no individual story must complete the entire family.

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
  [fluent pilot](../../dashboard/tests/fluent-side-panel-pilot.md#what-the-pilot-earned)
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
  Two siblings of this finding remain. `recoveryOf` is a pure alias of
  `parts(page).startupRecovery` in both `responsiveRecovery.ts` and
  `claudeVerification.ts`. `agent-launch-claude-verification`,
  `agent-launch-claude-own-record-verification`,
  `responsive-session-reconciliation` and its `-refusals` spec each build
  `openSessionDescription` from production `openSessionStartReason`. The
  shared `describedBy` in `storyCardSessionListing.ts` takes the
  caller-written note instead.

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

Dashboard test browsers start with `--disable-smooth-scrolling`
(`dashboard/tests/support/browserArgs.ts`), so key scrolls and programmatic
smooth reveals are instant. A measurement that needs smooth scrolling sets its
own `launchOptions` group without that argument and states why.

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
  [runtime browser turn](../../dashboard/backend-tests/runtime/observation-measurements.spec.ts#L43).
