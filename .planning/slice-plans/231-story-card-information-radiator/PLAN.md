# Make story cards modern, compact information radiators

**Identity:** SEED-091#story-card-information-radiator
**Source:** [refined story](../../seeds/SEED-091-dashboard-ui-renovation.md#story-card-information-radiator).
**Prepared:** 2026-10-03. Planning only; implementation and publication are not authorized by this request.

## Goal and scope

A developer monitoring and directing work can scan Backlog and Taken cards,
understand the story's published state, choose an available action, and inspect
supporting evidence without secondary metadata dominating the overview. Cards
become more compact and visually coherent with the renovated frame.

Include the source story's card and inspection behavior, grouped actions,
warning visibility, provenance, keyboard navigation, narrow-width reading, and
selection/startup/terminal marks. Preserve source order and backlog priority.
Session blocks, Recent sessions, the frame, roster content, dialog content,
terminal contents, lifecycle rules, launch policy, and source reads keep their
existing responsibilities. No search, sorting, new statuses, zoom, dark theme,
or new launch/review capability is promised.

The source's proposed visibility split remains a proposal. This plan describes
that direction so it is reviewable, but slice 1 must not implement the disputed
visibility change until Terry settles it. Keep independently supported styling,
warning preservation, and action-group work available without treating the
proposal as accepted.

## Preparation context

- Owned workspace: `/Users/terryyin/git/open-dough/.worktrees/make-story-cards-modern-compact-information-radi`.
- Branch: `codex/make-story-cards-modern-compact-information-radi`.
- Creation record: `SEED-091#story-card-information-radiator`, starting revision
  `bb9cda475107a9c1f94439dda2005f6a987dc7b1`; planning checkout HEAD is
  `231ddecf61d9cbdf8e6cad60329b0b00cd45b704`.
- Established preparation: `d.kanai-chan`, allocation
  `231ddecf61d9cbdf8e6cad60329b0b00cd45b704`. The preparation `start` command
  returned `continued`; no new assignment was published.
- Authorized remote target for a later explicit keep: `origin/main`.
  Integration checkout: `/Users/terryyin/git/open-dough`.
- Seed and plan remain uncommitted in this workspace for review. The published
  Preparing assignment stays in place until the preparation workflow ends it.

## Existing solutions and direction

PFE outcome: change existing card presentation and inspection in place.

- `WorkCard.tsx` owns the title, priority, identity, facts, inspection toggle,
  protected fieldset, and selection/terminal marks; `WorkStages.tsx` owns
  source order and selection by identity. Keep those responsibilities.
- `PreparationCard.tsx`, `AgentAssignmentFacts.tsx`, `DependenciesCard.tsx`,
  and `SliceProgress.tsx` present facts already interpreted by shared readers.
  Reuse those meanings when separating summary from detail; add no second
  fact parser, readiness calculation, or lifecycle model.
- `StoryDetail.tsx` already reveals purpose, assessment, slice evidence,
  product advice, and pinned sources from the same entry without another read.
  Extend that journey to reach the proposed secondary facts. `WorkSourceLinks`
  remains the shared link policy for card and detail, including disputed plans.
- `CardLaunches.tsx` owns Start availability, notes, failures, startup state,
  Review changes, and session entries. Group its offered actions while leaving
  launch/session decisions with their current owners. Avoid parallel session
  lists or a generic action framework.
- `RecordedFacts` is also consumed by `AgentRoster.tsx`; its host/model/mode
  content remains available there. Shared `.card-identity` and
  `.start-launch-button` styling reaches roster, dialogs, and session controls.
  Scope card presentation changes to their actual consumers; prove unchanged
  consumers when shared behavior or styles do change.
- Reuse the `:root` visual tokens in `styles.css`. The frame story's
  [plan](../230-dashboard-frame-renovation/PLAN.md) expands that foundation and
  introduces the shared icon wrapper. Adopt its published foundation when
  available; do not create a competing token system or introduce a component
  library. This plan adds no dependency requirement of its own.

The [North Star's visual and accessibility direction](../../../docs/dashboard-ux-ui-north-star.md#visual-and-accessibility-direction)
and [agent launch contract](../../../dashboard/AGENT-LAUNCH.md) supply the
reading direction and startup invariants. Accepted
[ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) keeps story
and slice meanings distinct; Accepted
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports valuable increments and inexpensive changes. The ADR index and record
statuses agree: 0000–0006 Accepted, 0007–0009 Proposed, with no supersession or
relevant conflict found. No new architectural decision or North Star topic is
needed for this presentation change.

## Key examples and proof ownership

| Source promise | Owning slice | Observable proof |
| --- | --- | --- |
| Ordinary Backlog cards expose readable titles, priorities, badges, and actions with less secondary clutter | 1 (reading), 2 (actions) | Same-fixture before/after screenshots and measured card heights at 1440px, plus default-visible versus inspected-fact assertions. Compare settled cards with the same titles, facts, session state, viewport, and font; do not impose a universal height |
| Preparing and assigned developer remain apparent; missing/conflicting assignments remain explicit | 1 | Extend `backlog-preparing.spec.ts` and `agent-roster.spec.ts`: summaries show the agreed scan facts, inspection exposes metadata and human credit, portrait/Back preserve focus and card context |
| Preparation/readiness remain independent, including Planless, absent, Changed since review, unavailable, and conflict states | 1 | Extend `story-readiness.spec.ts` and `story-readiness-gaps.spec.ts` against CLI-committed records. Warning summaries are visible while long explanations remain reachable |
| Taken count, clock, awaiting-wrap-up state, and branch/trunk-copy qualifications remain meaningful | 1 | `branch-slice-progress.spec.ts`, `taken-slice-progress.spec.ts`, `taken-slice-clock.spec.ts`, and `taken-execution-complete.spec.ts`; retain count semantics and short visible provenance, move exact branch/revision only if agreed |
| Purpose, full identity, assignment metadata, dependencies, evidence, and product advice remain reachable through inspection | 1 | Extend `storyReadinessDetail.ts`, `story-dependencies.spec.ts`, and `plan-execution-complete-detail.spec.ts`. Opening/closing detail reads no additional source; inspect request counts and the named detail region |
| Links retain their snapshot and conflict meanings; startup does not strand links behind disabled Inspect | 1, preserved in 2 | Adapt `source-navigation.spec.ts` to the agreed inspection journey without dropping target/unsafe-link assertions. `responsive-session-start.spec.ts` and its `expectProtected` helper still observe readable links while every action is disabled |
| Launch actions share a wrapping group, inspection/review actions another, with existing names and effects | 2 | Extend `agent-launch-card-open-session.spec.ts` and `story-review.spec.ts`: measure controls on the same line when space permits, operate both groups, close/cancel and verify useful focus return |
| Dependency blocking, open sessions, kept starts, startup, failure, and recovery remain understandable beside actions | 2 | `story-dependencies.spec.ts`, `agent-launch-card-open-session.spec.ts`, `agent-launch-card-problems.spec.ts`, `responsive-session-start.spec.ts`, and the Codex startup counterpart; readiness alone does not disable Start |
| Long titles, keyboard reading, warning text, and actions stay usable at 420px and 200% zoom | 1 and 2 | Extend `story-readiness-accessible.spec.ts` and `accessible-overview-keyboard.spec.ts`; use `pageLayout.ts` and `accessibleReading.ts` for whole text, no sideways loss, named controls, contrast, focus, and reduced motion. Check 420px and the existing 640×450 CSS-pixel proxy for a 1280×900 window at 200%; retain existing 320px coverage |
| Card selection, shown-in-terminal and startup marks remain distinct; session blocks and shared consumers retain behavior | 1 and 2 | Existing startup, roster and session journeys plus before/after session screenshots. If shared session/control selectors change, run the affected sidebar/dialog/session checks rather than assuming their styling is unaffected |

## Decisive premises observed during planning

The commands below ran in this worktree at the planning checkout HEAD, with
local dependencies installed using `npm ci --include=dev --ignore-scripts`.
The browser harness builds current production assets and serves each journey
through its real dashboard read/launch boundary, with loopback fake GitHub and
synthetic native hosts (`dashboardTest.ts`, `support/globalSetup.ts`). It proves
browser behavior against controlled evidence, not contact with a real agent or
an observation of the proposed design.

| Premise and consuming operation | Literal observation | Result |
| --- | --- | --- |
| Existing preparation/branch summaries, source navigation, keyboard detail, and protected startup are a usable baseline for slice 1 | `env -u NODE_ENV -u npm_config_local_prefix -u npm_package_json ./node_modules/.bin/playwright test --config dashboard/playwright.config.ts --reporter=line --workers=2 dashboard/tests/story-readiness-accessible.spec.ts dashboard/tests/branch-slice-progress.spec.ts dashboard/tests/backlog-preparing.spec.ts dashboard/tests/source-navigation.spec.ts dashboard/tests/responsive-session-start.spec.ts` | 12 passed, 21.8s. Inspected setup/assertions include `preparingJourney.ts`, `sourceNavigationJourney.ts`, `storyReadinessAccessible.ts`, and `responsiveStart.ts`: links are visible during protected startup, Inspect is disabled, and keyboard closing returns focus to the card |
| Existing offered actions, open-session gating, launch errors, review, and roster return can be preserved during slice 2 | `env -u NODE_ENV -u npm_config_local_prefix -u npm_package_json ./node_modules/.bin/playwright test --config dashboard/playwright.config.ts --reporter=line --workers=2 dashboard/tests/agent-launch-card-open-session.spec.ts dashboard/tests/agent-launch-card-problems.spec.ts dashboard/tests/story-review.spec.ts dashboard/tests/agent-roster.spec.ts` | 7 passed, 13.1s. These journeys invoke the launch/review boundaries, observe disabled Starts and visible failures, and open/close roster and review; synthetic hosts avoid real agent launches |
| Inspection adds no source read; dependency warnings/gating and awaiting-wrap-up semantics can remain unchanged in both slices | `env -u NODE_ENV -u npm_config_local_prefix -u npm_package_json ./node_modules/.bin/playwright test --config dashboard/playwright.config.ts --reporter=line --workers=2 dashboard/tests/story-readiness.spec.ts dashboard/tests/story-dependencies.spec.ts dashboard/tests/taken-execution-complete.spec.ts` | 4 passed, 6.0s. `storyReadinessDetail.ts` checks unchanged request counts after inspection; dependency tests distinguish execution/refinement availability; completion tests distinguish recorded completion from wrap-up |
| Moving shared summaries/styles could affect roster/dialog/session consumers | `rg -n 'WorkCard|PreparationFacts|TakenOwnerFacts|PreparingFacts|RecordedFacts|StartLaunch|StoryDetail|WorkSourceLinks' dashboard/src`; read `AgentRoster.tsx`, `agent-launch.css`, `styles.css`, and the corresponding browser helpers | Confirmed the shared consumers described under PFE. Existing tests often assert default-view metadata or Tab stops; update their journey when presentation changes, retaining semantic, source-target, focus and availability assertions |
| Renovated-frame tokens are not yet part of the inspected product revision | Read `styles.css`, the frame story and plan; `git diff --name-only HEAD..origin/main -- dashboard/src package.json .planning/seeds/SEED-091-dashboard-ui-renovation.md` after preparation `start` fetched `4a02456e26a64dbaa20d9d11ffc17ab1175ea773` | Existing colour tokens available; frame foundation still planned/Taken. Remote advance at inspection added only another preparation announcement. Final visual alignment needs that foundation or a human decision about the source promise |

These passes establish current behavior only. They do not establish reduced
height, the proposed visibility split, renovated-frame alignment, or acceptance
of the future presentation.

## Ordered slices

### 1. Compact cards with an understandable scan-to-evidence journey
Type: Behavior
Status: planned
Proof: The slice-1 rows above, with changed journeys and equivalent before/after screenshots; focused browser command described below.

Behavior: Backlog and Taken entries have settled published facts → the developer
scans a card, opens inspection, follows evidence or the agent portrait, and
returns → the agreed scan facts and warnings remain readable, secondary facts
are available without another read, and useful focus and stage context survive.
Taken count/clock/completion and short source qualifications stay apparent.
During startup, evidence links stay readable despite protected actions.

Before product edits, settle the source visibility decision and update the seed
and this plan together. Recheck the frame's published visual foundation. Capture
a representative ordinary Backlog card, Preparing card, branch Taken card,
warning card, and card with a session at 1440px and 420px using the inspected
browser fixtures. Retain the baseline's revision and conditions outside product
code; measure ordinary card heights after reads settle. Capture the same cases
afterward. Without a comparable baseline, leave the density claim unproved.

Change the existing fact presenters and detail journey coherently: one set of
interpreted entry facts, short summaries, accessible secondary reading, and
card-scoped styles using the existing/shared frame foundation. Do not remove a
warning simply because its expanded explanation is secondary. Adapt source and
keyboard tests that assumed always-visible links/metadata; retain their actual
navigation and interpretation proof. Update the card-related North Star and
navigation descriptions to the implemented visibility journey in this slice.

Focused proof: use the first baseline command plus
`story-readiness.spec.ts`, `story-readiness-gaps.spec.ts`,
`story-dependencies.spec.ts`, `taken-slice-progress.spec.ts`,
`taken-slice-clock.spec.ts`, `taken-execution-complete.spec.ts`,
`plan-execution-complete-detail.spec.ts`, `agent-roster.spec.ts`, and
`accessible-overview-keyboard.spec.ts` under `dashboard/tests/`, adding assertions
to those journeys for the new reading boundary. All use the same Playwright
command prefix above. Run additional consumer checks only for boundaries the
diff actually affects. Visual inspection compares readability and frame
coherence; browser assertions prove visibility, focus, provenance and sources.

Safe stopping point: cards have a useful compact reading journey with every
existing action and session still accessible in its prior arrangement. Slice 2
improves action density; it is not required to make this reading result valid.

### 2. Compact action groups with clear availability and recovery
Type: Behavior
Status: planned
Proof: The slice-2 rows above; the second baseline command plus `story-dependencies.spec.ts`, `responsive-session-start.spec.ts`, `responsive-session-start-codex.spec.ts`, `accessible-overview-keyboard.spec.ts`, and the updated `story-readiness-accessible.spec.ts`.

Behavior: a card offers launch and inspection/review actions → the developer
scans or operates those actions → related buttons share a line when space
permits and wrap in reading order when it does not. Launch notes, failure
feedback, disabled-action reasons, protected startup and recovery stay attached
to the action they explain. Both Starts remain gated by an open session;
dependency blocking affects execution as before; a kept start still resumes its
own work. Closing dialogs or inspection returns useful focus.

Keep startup/availability decisions in `CardLaunches` and its current owners.
Group action presentation without duplicating launch state or extracting
session blocks into a new model. Card-local changes must not accidentally
reshape shared dialog, terminal, sidebar, or Recent-session controls.
Extend existing interactive journeys with same-line measurements at 1440px,
wrapping and keyboard operation at 420px/200%, and visible feedback after a
failure or uncertain start. Compare equivalent before/after action arrangements
and session entries. Final screenshots cover both slices together and the
available renovated frame. Update changed action-presentation guidance in the
same slice.

Safe stopping point: the complete card outcome is delivered, including compact
reading and actions, with no new workflow or deferred capability machinery.

## Execution, verification, and design assessment

- Both slices are Behavior: presentation changes, required small internal
  refactoring, focused proof and documentation stay with their user outcome.
  A separate Structure slice is not currently justified. One common rule
  separates scan facts from evidence; independent local launch/session facts
  retain their existing domain owners rather than becoming a fabricated status.
- No numeric slice target or hard limit is supplied by this project's guidance.
  Each slice has one user journey and proof loop; include implementation,
  verification and cleanup when reassessing size. If movement of action
  ownership becomes substantial, or frame integration changes these premises,
  revise remaining slices in this plan before extending work.
- Run focused proof and `npm run typecheck:dashboard` for changed TypeScript
  contracts. Playwright already builds production assets. A full repository or
  dashboard suite is not a local gate solely because hosted CI runs it. Broaden
  only when changed shared consumers justify the scope; own CI failures through
  the ordinary execution workflow after publication.
- Future authorized execution uses the installed execution workflow's
  [delivery sequence](../../../.agents/skills/dough-execute-plan/references/wrap-up.md#deliver-the-change):
  accepted outside-in proof, independent post-change refactoring before commit,
  selective `npm run format`, plan evidence update, and the check-only staged
  lint hook (`.githooks/pre-commit`). Do not run hook-owned lint separately.
  Finish delivery before the next slice; never publish intentionally failing
  intermediate journeys. This planning request invokes none of that delivery.

## Current decisions and remaining concerns

- **Slice 1 visibility decision:** the seed's scan-first split is recommended,
  not accepted. Terry may retain mode/branch and source links in the scan view,
  or move assignment into detail. Do not interpret this plan request or silence
  as deciding that choice. Align source and plan before the dependent edit.
- **Slice 1 and final visual proof:** the renovated-frame foundation is still
  pending at the observed revision. Inspect it when published and reuse it;
  final alignment remains unproved until the cards can be compared with it.
  Do not copy another worktree's unfinished foundation or invent a substitute
  while reporting the source's alignment promise complete.
- No remaining slice-boundary, cumulative-design or proof-ownership concern
  was identified in this review. The two concerns above are source/availability
  concerns, not a reason to invoke plan refinement to make a human decision.
- Screenshots/height measurements are future execution proof, not obtained
  acceptance. The preparation recorder owns readiness; no plan status or
  execution-complete record is created here.
