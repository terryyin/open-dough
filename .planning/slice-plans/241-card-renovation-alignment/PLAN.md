# Align product guidance, shared styles, and tests with the renovated cards

**Identity:** SEED-091#card-renovation-alignment
**Source:** [correction story](../../seeds/SEED-091-dashboard-ui-renovation.md#card-renovation-alignment),
a bounded retrospective correction of
[SEED-091#story-card-information-radiator](https://github.com/terryyin/open-dough/blob/bf0d9ad52cfbe4c0a01fac4907361016f1f8d7d5/.planning/seeds/SEED-091-dashboard-ui-renovation.md#story-card-information-radiator)
and its plan [231](https://github.com/terryyin/open-dough/blob/bf0d9ad52cfbe4c0a01fac4907361016f1f8d7d5/.planning/slice-plans/231-story-card-information-radiator/PLAN.md).
**Provenance:** reviewed commits `c58dc07d` (slice 1, compact reading),
`dc03853b` (slice 2, action groups) and `138f693c` (CI repair) on
`claude/make-story-cards-modern-compact-information-radi-2`, base `07641aca`.
**Prepared:** 2026-10-03. Planning only; implementation, commit and
publication are not authorized by this request.

## Goal and scope

A maintainer reading the dashboard's guidance, or changing the renovated
cards later, finds documentation that places each card fact where it is
actually shown, roster and session identity lines laid out as before the
renovation, and card tests that open detail explicitly and own each focus walk
once.

Included: the six current findings below. Excluded: any change to card
behavior, presentation or wording on the page; new feature promises; and the
5s launch-answer waits in `agent-launch-start-taken.spec.ts` and
`agent-launch-start-cursor.spec.ts`, owned by the launch-card-waits finding in
`ProjectFindings.md` (DD-222). Historical promises of the original story stay
intact.

## Preparation context

- Workspace: the execution checkout
  `/Users/terryyin/git/open-dough/.worktrees/make-story-cards-modern-compact-information-radi-2`,
  branch `claude/make-story-cards-modern-compact-information-radi-2`, HEAD
  `138f693c`, supplied by the invoking execution's coordinator, which owns
  commit and publication of these records.
- No preparation assignment is announced: the work is a new correction story,
  not a queued story.

## Current findings (verified at `138f693c`)

1. `dashboard/README.md` (story card paragraph, "Inspect story opens its
   detail ...") says the detail holds "preparation and dependency
   explanations". Dependencies stay a native in-place `<details>` on the card
   (`DependenciesCard` in `WorkCard.tsx`; `StoryDetail.tsx` has no dependency
   block) so supplier links stay reachable during protected startup (plan 231
   slice-1 learnings). The README's own "Blocking story dependencies" section
   already says it expands in place.
2. `docs/project-visibility-requirements.md` (Dashboard bullet under agent
   assignments) says each Taken card shows agent, mode, branch context, host,
   and model, with mode and host marks on the card. The card's scan view now
   shows portrait and name (`DeveloperName` in `AgentAssignmentFacts.tsx`);
   mode, host, model, branch context and human credit are in the inspected
   detail (`AssignmentDetail` in `AssignmentRecords.tsx`, via `StoryDetail`)
   and the roster.
3. `dashboard/AGENT-ASSIGNMENTS.md` says only "the detail and roster" say the
   human developer is unknown; the card's scan view also shows the short
   "Human developer unknown" (`HumanCreditGap`, asserted in
   `profile-addition-latency.spec.ts`). The `AssignmentDetail` comment in
   `AssignmentRecords.tsx` says "Gaps stay on the card's scan view", but
   "host not recorded" / "model not recorded" appear only in the detail
   (`RecordedFacts`); only profile-level gaps and the short human-credit
   warning stay on the card.
4. Slice 1 removed `.card-identity { margin-top: 0.15rem }` from the globally
   loaded `stages.css`. `.card-identity` is shared: block `<p>` in
   `AgentRoster.tsx` (grid item of `.roster-assignment`), `SessionEntry.tsx`
   (off-card Recent-session entries) and `StoryDetail.tsx`; inline `<span>`
   inside a `<p>` subject in `StoryReviewAction.tsx` and `StartLaunch.tsx`
   (via `LaunchDialog`'s `launch-dialog-subject`). Plan 231 required card
   changes scoped to card consumers.
5. `expectWholeSnapshot` in `dashboard/tests/dashboardPage.ts` opens a detail
   through `someInspectedDetail` (`cardControls.ts`) with
   `dispatchEvent("click")` inside an `expect*` helper and leaves it open, for
   seven auto-refresh/read-failure call sites in five specs.
6. The "Hide detail returns focus to the card" walk is asserted in
   `storyReadinessScan.ts`, `accessible-overview-keyboard.spec.ts`,
   `agent-launch-card-noted-start.spec.ts` and `story-review-action.spec.ts`.
   The review dialog's Escape return overlaps between
   `story-review-action.spec.ts` (`expectEscapeReturnsThenTabMovesOn`) and the
   end of `story-review.spec.ts` (Escape → hidden → action focused). The first
   test in `agent-launch-card-noted-start.spec.ts` sets
   `dashboard.claudeScenario("launched")` although it only cancels a Start
   and asserts `claudeLaunchCalls()` stays empty.

## Existing solutions and direction

PFE outcome: change in place. Shared identity styling already lives in
`styles.css` (`.card-identity` font and color rules); detail-only styling in
`story-detail.css`. The explicit card-detail opener already exists
(`inspectedDetail` in `cardControls.ts`, real click, idempotent when the
detail is open). Escape-then-Tab focus proof already exists
(`expectEscapeReturnsThenTabMovesOn` in `accessibleReading.ts`). No new
helper, framework, North Star topic or ADR is warranted; Accepted ADRs
0000–0006 raise no conflict for a guidance, style-scope and test-ownership
correction.

## Preserved promises and constraints

- The card's scan/detail split, action groups, protected-startup reachability
  of source and dependency links, and every card visual delivered by plan 231
  stay unchanged, including the inspected detail's identity line.
- Each refresh/read-failure journey keeps observing the shown revision in an
  inspected detail's source links and the absence of every other revision in
  text and in rendered stage links.
- Each removed duplicate leaves one named surviving proof (table below).

## Proof ownership

| Correction promise | Slice | Observable proof |
| --- | --- | --- |
| Guidance places the dependency explanation, assignment metadata, human-developer gap and field gaps where the page shows them | 1 | Each corrected sentence traced to the rendering code and the spec that asserts it: `story-dependencies.spec.ts` (in-place Dependencies), `agent-roster.spec.ts` / `backlog-preparing.spec.ts` (portrait and name on card, metadata in detail), `profile-addition-latency.spec.ts` (short gap on card, full reason in detail) |
| Roster and off-card session identity lines regain the pre-renovation spacing; the inspected detail and dialogs keep their current layout | 1 | One focused observation recorded in the plan: computed `margin-top` and top offset of `.card-identity` from its preceding sibling in a roster assignment, a Recent-sessions story entry, the story detail, the review dialog subject and the launch dialog subject, captured before the edit (at `138f693c`) and after. Roster/session values equal `0.15rem` (the `07641aca` rule, the only one that set it); detail and dialog offsets equal their before values. Existing `agent-roster.spec.ts`, `agent-launch-card-sessions.spec.ts`, `story-review.spec.ts`, `story-review-action.spec.ts`, `agent-launch-card-noted-start.spec.ts`, `story-readiness.spec.ts` stay green |
| Snapshot checks observe a detail that the journey opened explicitly with a real click, with unchanged revision coverage | 2 | `auto-refresh.spec.ts`, `auto-refresh-recovery.spec.ts`, `auto-refresh-rate-limit.spec.ts`, `auto-refresh-visibility.spec.ts`, `read-failure.spec.ts` green; `expectWholeSnapshot` performs no click and fails if no detail is open; existing focus assertions in those specs unchanged |
| Each focus walk has one owner | 2 | Hide-detail focus return: `storyReadinessScan.ts` (via `story-readiness-accessible.spec.ts`) and `accessible-overview-keyboard.spec.ts`. Launch dialog Escape-then-Tab: `agent-launch-card-noted-start.spec.ts`. Review dialog Escape-then-Tab: `story-review.spec.ts`. Group specs end at their line/wrap/reading-order and keyboard-order proof. All named specs green |

## Decisive premises observed during planning

| Premise and consuming operation | Literal observation | Result |
| --- | --- | --- |
| Finding 1 wording and in-place dependencies (slice 1 README edit) | `sed -n 140,160p dashboard/README.md`; `grep -n -i depend dashboard/src/StoryDetail.tsx`; `grep -n DependenciesCard dashboard/src/WorkCard.tsx` | README line 153 says "preparation and dependency explanations"; `StoryDetail.tsx` has no dependency block (only an unrelated "independent" comment); `WorkCard.tsx:106` renders `DependenciesCard` on the card. README lines 210–215 already describe in-place expansion |
| Findings 2–3 wording and actual placement (slice 1 doc and comment edits) | `sed -n 340,362p docs/project-visibility-requirements.md`; `sed -n 35,50p dashboard/AGENT-ASSIGNMENTS.md`; read `AgentAssignmentFacts.tsx`, `AssignmentRecords.tsx`; `grep -rn HumanCreditGap dashboard/src`; `grep -n 'Human developer unknown' dashboard/tests/profile-addition-latency.spec.ts` | Requirements bullet (348–356) puts mode/host/model/branch and their marks on each Taken card; `DeveloperName` renders portrait, name and `HumanCreditGap` only; `AssignmentDetail` renders `RecordedFacts` (with "host not recorded"/"model not recorded"), `HumanCredit` and branch context; `profile-addition-latency.spec.ts:187,196` assert the short scan warning. The `AssignmentDetail` comment (lines 102–106) says gaps stay on the scan view |
| Finding 4 drift is real for block consumers only (slice 1 restore and scope) | `git diff 07641aca 138f693c -- dashboard/src/stages.css`; `grep -rn card-identity dashboard/src dashboard/tests`; `grep -rn stages.css dashboard/src`; read `styles.css` (global `p { margin: 0 }`), `agent-roster.css` (`.roster-assignment` grid, gap 0.15rem), `story-review.css`, `LaunchDialog.tsx` | The removed rule was the only `margin-top` on `.card-identity`; `stages.css` is imported once by `main.tsx`, so it applied globally. Roster and Recent-session `<p>` identities lost 0.15rem; review and launch subjects are inline spans in a `<p>`, so a top margin never affected them. `StoryDetail` is the only card consumer of the class |
| Finding 5 call sites and focus interactions (slice 2 explicit steps) | `grep -n expectWholeSnapshot dashboard/tests/*.ts`; `grep -n 'toBeFocused\|\.focus()\|Inspect story' dashboard/tests/auto-refresh*.spec.ts dashboard/tests/read-failure.spec.ts` | Seven call sites: `auto-refresh.spec.ts:91,163`, `auto-refresh-recovery.spec.ts:76,121,169,193`, `auto-refresh-rate-limit.spec.ts:120`, `auto-refresh-visibility.spec.ts:106`, `read-failure.spec.ts:169,216`. The three specs with focus assertions (`auto-refresh.spec.ts:77`, `auto-refresh-recovery.spec.ts:139`, `auto-refresh-visibility.spec.ts:75`) already open a named card's detail by real click before focusing elsewhere, so the helper does not click there; explicit steps go only where no detail is open, placed before any focus setup |
| Finding 6 duplicates and the scenario's irrelevance (slice 2 trimming) | Read `agent-launch-card-noted-start.spec.ts:60–123`, `story-review-action.spec.ts:30–78`, `story-review.spec.ts:109–111,236–238`, `storyReadinessScan.ts:72–90`, `accessible-overview-keyboard.spec.ts:100–140`, `accessibleReading.ts` (`expectEscapeReturnsThenTabMovesOn`), `support/fakeClaude.ts` (`claudeScenario` writes the fake's launch scenario only) | As stated in finding 6. The review dialog uses the same deferred-focus guard (`keyboardRestsOn` in `StoryReviewAction.tsx:172`), so its Escape-then-Tab proof is kept, moved to the review journey. The second noted-start test (line 133) launches and keeps its scenario |
| The affected journeys and typecheck are a green baseline | `env -u NODE_ENV -u npm_config_local_prefix -u npm_package_json ./node_modules/.bin/playwright test --config dashboard/playwright.config.ts --reporter=line --workers=2 dashboard/tests/auto-refresh.spec.ts dashboard/tests/auto-refresh-recovery.spec.ts dashboard/tests/auto-refresh-rate-limit.spec.ts dashboard/tests/auto-refresh-visibility.spec.ts dashboard/tests/read-failure.spec.ts dashboard/tests/agent-launch-card-noted-start.spec.ts dashboard/tests/story-review-action.spec.ts dashboard/tests/story-review.spec.ts dashboard/tests/accessible-overview-keyboard.spec.ts dashboard/tests/story-readiness-accessible.spec.ts dashboard/tests/agent-roster.spec.ts dashboard/tests/agent-launch-card-sessions.spec.ts dashboard/tests/source-navigation.spec.ts`; `env -u NODE_ENV npm run typecheck:dashboard` | 30 passed (29.2s) at `138f693c`; typecheck clean |

Remaining execution-time detail, not a decisive premise: the Tab stop after
Review changes in `story-review.spec.ts` (opened there by click, which focuses
the action in Chromium). If the click path does not leave the keyboard resting
on the action, open it with focus and Enter as `story-review-action.spec.ts`
does today.

## Ordered slices

### 1. Guidance and shared identity styling match the delivered card boundary
Type: Structure
Status: done
Proof: Slice-1 rows of the proof table; before/after `.card-identity` measurement recorded below as accepted proof; focused command over `agent-roster.spec.ts`, `agent-launch-card-sessions.spec.ts`, `story-review.spec.ts`, `story-review-action.spec.ts`, `agent-launch-card-noted-start.spec.ts`, `story-readiness.spec.ts`, `story-dependencies.spec.ts`, `profile-addition-latency.spec.ts`; `typecheck:dashboard` only if a `.tsx` changes beyond its comment.

Correction: removes the guidance drift (findings 1–3) and the uncontained
shared-style removal (finding 4) left by slice 1 of plan 231, with no page
change on any card.

- `dashboard/README.md`: the detail holds preparation explanations; the
  dependency explanation opens in place from the card's **Dependencies**
  summary, consistent with "Blocking story dependencies".
- `docs/project-visibility-requirements.md`: a Taken card's scan view shows
  the agent's portrait and name (and Preparing's developer on a queued card);
  the inspected detail and the roster show mode, host, model, branch context
  and human credit with their marks beside text labels. Keep the existing gap,
  branch-labelling and portrait-hover requirements, relocated only where their
  location changed.
- `dashboard/AGENT-ASSIGNMENTS.md`: the card's scan view shows the short
  "Human developer unknown"; the detail and roster say why.
- `AssignmentRecords.tsx` comment: profile-level gaps and the short
  human-credit warning stay on the scan view; unrecorded host or model shows in
  the detail.
- Styles: before editing, capture the before values for all five consumers.
  Restore `.card-identity { margin-top: 0.15rem; }` in `styles.css` beside the
  other shared `.card-identity` rules, and keep the inspected detail as
  delivered with `.story-detail .card-identity { margin-top: 0; }` in
  `story-detail.css`. Capture after values with the same fixtures and viewport.

Safe stopping point: guidance and shared styles are aligned; tests unchanged.

Accepted proof (execution checkout
`.worktrees/align-product-guidance-shared-styles-and-tests-w`, base `67deea72`):

- Focused command (slice-1 Proof list) passed: 13 passed. No typecheck; the
  only `.tsx` change is the `AssignmentDetail` comment.
- `.card-identity` measurement, Chromium 1440x900, root 16px, with a
  disposable spec (removed) over `publishRosterOrigins` and the preparation
  page fixtures. Offset is top minus preceding sibling's bottom:

  | Consumer | margin-top before → after | Offset before → after |
  | --- | --- | --- |
  | Roster assignment (`.roster-assignment`, after `p.roster-title`) | 0 → 2.4px | 2.39 → 4.78 |
  | Recent-sessions entry (after `h3`) | 0 → 2.4px | 0 → 2.39 |
  | Story detail (after `h4`) | 0 → 0 | 4 → 4 |
  | Review dialog subject (inline span) | 0 → 2.4px, no effect | −16 → −16 |
  | Launch dialog subject (inline span) | 0 → 2.4px, no effect | −16 → −16 |

- Guidance traced to code: `DependenciesCard` (`WorkCard.tsx`) /
  `story-dependencies.spec.ts`; `DeveloperName`, `PreparingFacts` /
  `agent-roster.spec.ts`; `AssignmentDetail` / `backlog-preparing.spec.ts`;
  `HumanCreditGap` / `profile-addition-latency.spec.ts`.

Learning: the roster's `MemberAssignment` shows mode, host, model and human
credit but no branch context, so the requirements text places branch context
in the inspected detail only.

### 2. Card tests open detail explicitly and own each focus walk once
Type: Structure
Status: planned
Proof: Slice-2 rows of the proof table; focused command over the five snapshot specs, `agent-launch-card-noted-start.spec.ts`, `story-review-action.spec.ts`, `story-review.spec.ts`, `accessible-overview-keyboard.spec.ts`, `story-readiness-accessible.spec.ts`, `source-navigation.spec.ts`; `typecheck:dashboard`.

Correction: removes a hidden synthetic interaction from an assertion helper
and duplicated focus proofs added by plan 231, preserving every product
observation they make.

- `expectWholeSnapshot` observes only: it requires an open detail in the
  stages and checks its shown-revision source link, then the existing
  other-revision text and stage-link absence checks. Remove
  `someInspectedDetail` from `cardControls.ts` once unused.
- Each call site without an already open detail gets a named step that opens
  a named card's detail with `inspectedDetail` (real click), placed before any
  focus setup the journey asserts. Prefer a card present at both revisions so
  the detail stays open across the refresh the journey observes.
- `agent-launch-card-noted-start.spec.ts` first test: drop
  `claudeScenario("launched")`; end after the launch dialog's
  `expectEscapeReturnsThenTabMovesOn` reaches Inspect story; keep
  `claudeLaunchCalls()` empty.
- `story-review-action.spec.ts`: end after the keyboard reaches Review changes
  from Inspect story/Hide detail and the review opens; drop its Escape and
  Hide-detail tail.
- `story-review.spec.ts`: replace the final Escape/hidden/focused lines with
  `expectEscapeReturnsThenTabMovesOn` from Review changes to its next Tab stop.
- Update helper and spec header comments that name the moved ownership.

Safe stopping point: the correction is complete.

## Execution, verification, and design assessment

- Both slices are Structure under the retrospective-correction exception:
  each names the weakness it removes and proves preserved behavior at the
  affected boundaries. Slice 1 pairs guidance and style because both repair
  slice 1's card-scoping drift and share one review against rendering code;
  its only executable observation is the identity measurement. Slice 2 is one
  test-ownership proof loop. No Behavior promise is added.
- No numeric slice target or hard limit is supplied by this project's
  guidance; each slice is one proof loop of a few files.
- Local gates: the focused Playwright prefix above and
  `env -u NODE_ENV npm run typecheck:dashboard` for changed TypeScript. Never
  run two Playwright invocations concurrently in this checkout (shared
  `dashboard/dist`). The full suite is not a local gate; hosted CI failures
  after publication stay owned by the execution workflow. No paid native host
  run is needed.
- Delivery follows the installed execution workflow's
  [delivery sequence](../../../.agents/skills/dough-execute-plan/references/wrap-up.md#deliver-the-change),
  including the post-change refactor pass before commit. This planning request
  invokes none of it.

## Current decisions and remaining concerns

- Considered and excluded: DD-222's launch-answer waits; a per-card loop over
  every detail in the snapshot check (one detail is open at a time by product
  rule, and per-card link safety is owned by `source-navigation.spec.ts`
  `forEachCardsSources`); a durable spacing regression test (the measured
  correction is recorded proof; existing consumer journeys stay green).
- No remaining slice-boundary, cumulative-design or proof-ownership concern
  was identified in this review.
