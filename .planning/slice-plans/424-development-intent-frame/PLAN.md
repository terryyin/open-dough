# Experience the Development and Intent frame

**Identity:** SEED-192#open-development-intent-frame
**Source:** [Refined story](../../seeds/SEED-192-review-product-intent.md#open-development-intent-frame)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Let Terry experience Development and Intent on the selected project in the
working dashboard, with truthful forthcoming Intent content and a useful return
to Development. The source owns the complete scope and examples. This plan
implements that one navigation outcome, including its settings, session,
keyboard and narrow-screen conditions; it adds no reader or Proof machinery.

Terry selected the navigation rules on 2026-10-31: changing projects keeps the
perspective; Development is the first-visit default; choosing a session goes to
its Development stories; an open terminal, report or review stays visible
across perspectives. Preserve current story destinations, Development's
stories/roster and near-future direction, session lifetime and settings recovery.
Structure, source browsing, Purpose/Proof layouts, story scoping, report
collection and final Start session placement remain deferred. Keep Start
session in its present Development location for this increment.

The useful stopping point is a working frame that remains understandable and
preserves Development even if Intent readers never follow. Terry can evaluate
the implemented result; passing browser checks establishes navigation behavior,
not a subjective improvement or the usefulness of future Intent content.

## Design and reuse

Follow [the initial Intent direction](../../../docs/dashboard-ux-ui-north-star.md#initial-intent-workspace)
and Accepted [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md),
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
No ADR conflict or new architectural decision is proposed.

PFE found existing owners for the needed responsibilities:

- Extend `dashboardRoute.ts` and `dashboardNavigation.ts` for perspective
  navigation and browser history. Perspective is independent of Development's
  stories/roster view; use one coherent route representation, not another store
  with competing authority. Existing story URLs and session activation select
  Development's stories, including the same-project case.
- Reuse `ConfiguredDashboard` and the stable `PageFrame` for project selection,
  sessions and the Side panel. Retain their mounted lifecycle across
  perspectives. The new Intent content is a bounded presentation responsibility;
  it needs no API, project configuration, catalogue or persistence service.
- Extend `App`'s existing settings return and focus handling. Retain its guard
  for an empty project catalogue; project-dependent routing must not acquire a
  first-project requirement on that path.
- Reuse project selection and keyboard ownership. The perspective control owns
  its interaction keys; existing global project/Board shortcuts must not also
  act on that same event or operate hidden Development content. Use accessible
  semantics appropriate to the actual control, without a new shortcut system.
- Preserve one visible main content region and shared frame layout. Published
  work-read status must keep its meaning: a failed Development read cannot make
  the forthcoming Intent state claim that tests or Proof are absent.

The common rule is one perspective selection over the selected project, with
existing Development destinations retaining their domain meaning. The frame,
route and session behavior form one proof loop, so there is no preparatory
Structure slice or separate routing/UI/testing delivery.

### Build on the simplified project header

[SEED-198](../../seeds/SEED-198-responsive-project-header.md#responsive-project-header)
was Taken and executing on 2026-10-31 (its slice 1, journey evidence
migration, was in progress in its own worktree). It redesigns the same banner
this story extends, so this plan takes its delivered header as the base rather
than the banner observed below. It is not a recorded prerequisite: both
stories stand alone, and SEED-198 records that shared-frame work reconciles its
header without a blocking dependency. Expect SEED-198 to land first. At
execution start, rebase onto trunk and recheck the banner: if SEED-198 has
landed, apply the rules below to its header; if it is still unlanded, report
that to Terry before changing the banner instead of designing the perspective
control a second time against the disclosure layout.

Assimilate, do not duplicate, its header:

- The banner's level-1 heading stays the plain project name on wide screens and
  SEED-198's single title selector at narrow widths. The perspective control is
  its own banner item beside the project control, not a third project-selection
  form and not part of `ProjectSelect`. Intent content uses lower heading levels.
- Keep one compact-header rule. SEED-198 switches layouts where the project tabs
  stop fitting the banner; with the perspective control present, that point is
  where the tabs plus the perspective control stop fitting. Adjust that one
  breakpoint, rather than adding a second competing one. The compact header must
  still fit a phone width without a multi-row project list; the perspective
  control may take its own row there if one row cannot hold it, but no tab row
  returns.
- Use the existing arrow exemption in `projectKeyboardNavigation.ts` (a
  `radiogroup`/`tablist` target already keeps its own arrows) for the
  perspective control. Reuse SEED-198's generalized focus fallback ("whichever
  project control is shown") when focused content disappears; do not add a
  second fallback path for project cycling.
- New and changed journeys read published-read evidence through the
  `parts(page)` read-status/failure accessors SEED-198 introduces, not the
  deleted source panel. Extend `dashboard-header.spec.ts` for the perspective
  control's place and geometry in both layouts instead of a separate header spec.
- Edit `docs/dashboard-navigation.md` on top of SEED-198's header text. Do not
  reintroduce the banner's disclosure-only `focusin` re-measure or source panel
  styles that SEED-198 deletes.

The delivered mobile session screen covering (see
[dashboard navigation](../../../docs/dashboard-navigation.md)) is likewise not
a prerequisite. An active covering Side panel may hide the dashboard under that
contract; perspective changes must not close it or create a competing view.

## Outside-in proof ownership

Every row belongs to slice 1. Add representative Intent journeys to the real
built page under `dashboard/tests/`; extend existing fixtures rather than
imitating route, session or settings behavior inside the new test setup.

| Source promise | Observation and existing proof to reuse |
| --- | --- |
| Clear two-perspective frame; same selected project; honest forthcoming content | New `development-intent-frame.spec.ts`: use actual controls, observe active perspective/project, meaningful forthcoming message, Development-only direction, and return to useful Development. The UI provides neither invented observations nor an unimplemented Structure destination. |
| Project changes keep perspective; ordinary navigation remains coherent | The new journey changes projects in Intent, exercises Back/Forward and reload, and returns to Development with its relevant stories/roster context. `project-keyboard-navigation.spec.ts` and `agent-roster.spec.ts` retain existing project/view and detail-return contracts. Route variants can use focused module proof; a seeded route alone does not prove its UI transition. |
| Settings returns to the selected project and perspective with usable focus | Extend the new round trip through actual System settings and Back. Preserve `system-settings.spec.ts`, including the direct settings/reload and project-management cases; retain the existing no-project journey. |
| Session selection from Intent opens its project's Development stories | Extend `sessions-sidebar-navigation.spec.ts` or reuse its setup in a new journey: actual session selection, project and perspective transition, terminal text, focus, current marks and card reveal when available. Observe the same-project early-return case too. Existing story/notification destinations remain Development destinations. |
| Terminal, report and review remain visible with their context | New perspective round trips with each existing panel content kind at its actual owner. For terminal, observe typed content and one live attachment, not merely a panel heading. Reuse the existing settings attachment observer and real synthetic-host fixture; report/review selections must remain the same on return. |
| Keyboard and narrow-screen operation, without unintended project selection or hidden focus | One representative keyboard journey and a responsive journey at the actual CSS branches of SEED-198's header: selected perspective stays clear beside the plain title (wide) and the title selector (compact), controls/message remain reachable, choosing a project from the compact title in Intent keeps Intent, the project does not change from perspective keys, focus remains visible, and no unintended horizontal page scroll appears. Preserve SEED-198's header journeys, Board reading and Side panel behavior. |
| Useful Development and truthful published facts | Retain direction disclosure, Board/detail and current published-read recovery observations. Preserve empty-project settings access. No new Intent test reader or report fixture substitutes for the current Development data path. |

## Observed premises

Observed in the owned preparation checkout
`/Users/terryyin/git/open-dough/.worktrees/experience-the-development-and-intent-frame`
at product revision `c3d976f547eb3f75bc84fbc70ce7edf2b209c2f4` on 2026-10-31.
Later fetched changes through `b7356dd6` are planning records only.

Setup: `node scripts/setup-native.mjs check` first reported missing locked
Playwright. `node scripts/setup-native.mjs npm` installed the lockfile;
`node scripts/setup-native.mjs check` then launched Chromium 153.0.8010.12.
The real suite builds production assets and uses isolated fake GitHub and native
hosts; it does not operate the developer's live sessions. Its setup and assertions
were inspected in `support/globalSetup.ts`, `support/pageTest.ts`,
`system-settings.spec.ts:28,129`, `project-keyboard-navigation.spec.ts:121`,
and `sessions-sidebar-navigation.spec.ts:57`.

The literal baseline command was:

```sh
env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/frame-preparation-baseline.json npm run test:dashboard -- dashboard/tests/system-settings.spec.ts dashboard/tests/project-keyboard-navigation.spec.ts dashboard/tests/sessions-sidebar-navigation.spec.ts --grep 'global settings has narrow local facts|opening settings preserves one running native session|keyboard project selection reuses history|goes to its story and its session across projects' --workers=2
```

Result: four selected journeys passed, strict verdict passed, 20.8 seconds.
An initial run without `env -u NO_COLOR` was rejected by the strict reporter for
the inherited NO_COLOR/FORCE_COLOR warning; it is not accepted proof. No reporter
rule was relaxed.

Scratch discrimination, using the same four-test command with the proof-record
path `/tmp/frame-preparation-mutation.json`, temporarily disabled session
destination routing, retained project view, settings focus return and mounted
dashboard continuity. The first three observers failed at the intended result:
wrong selected project, missing roster route and inactive returned settings
control. The terminal scenario stopped earlier during project setup, so that
run did not establish terminal discrimination.

A second isolated scratch remounted the dashboard only when entering settings
with an existing terminal. The following command reached its live attachment
assertion and failed because the attachment process had ended:

```sh
env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/frame-preparation-terminal-mutation.json npm run test:dashboard -- dashboard/tests/system-settings.spec.ts --grep 'opening settings preserves one running native session' --workers=1
```

All scratch source edits were restored byte-for-byte to HEAD before this plan
was written. These observations establish the reusable current behavior and
discriminating observers. The selected tests' header and published-read
assertions predate SEED-198; after it lands, rerun the same four journeys on
the rebased trunk as the execution baseline. New Intent acceptance remains work for slice 1.

The local host had 16 logical CPUs, 48 GiB RAM, reported 34% memory free and
load averages 8.39/10.78/11.85 before the baseline. Competing work was not fully
known; two workers bounded this small observation, and the isolated retry used
one. Recheck current host conditions before execution's broader checks; these
measurements say nothing about a later host or CI runner.

## Ordered slices

### 1. Move between Development and Intent while retaining working context

Type: Behavior
Status: done
Proof: The mapped built-page journeys observe the entire perspective round
trip and its session/settings/keyboard conditions; focused existing consumers
remain green, with no remount or unintended project transition.

Behavior: Given a configured project and useful Development context, selecting
Intent shows its forthcoming state in the same frame; project changes preserve
the perspective, the Side panel remains usable, settings returns coherently,
and choosing a session or returning to Development resumes the appropriate
Development journey. The behavior stays operable with a keyboard and at narrow
widths. Existing story links and the no-project recovery journey continue to
work.

Implement the minimum coherent navigation and frame change, its new outside-in
proof, responsive/focus treatment and maintained behavior documentation together.
Update `dashboard/README.md` and relevant `docs/dashboard-navigation.md` passages;
the North Star's later reader/Proof direction remains needed by sibling stories.
Do not implement later source or report machinery. No intermediate broken
navigation state is a delivery boundary.

Trace the actual diff's consumers before accepting proof, on the header that
SEED-198 delivered. Known enclosing
observers include `dashboardPage.ts`'s total-button count (used by
`read-failure.spec.ts` and `auto-refresh-recovery.spec.ts`),
`dashboard-header.spec.ts`'s control order, geometry and wide/compact project
selector journeys, `project-keyboard-navigation-focus.spec.ts`'s focus
fallback, `board-scroll.spec.ts`'s
banner/scroll relationship, and `sessionsSidebarPage.ts`'s single visible main
and panel geometry. Reconcile them with the intended frame behavior; do not
weaken surviving promises merely to accept new controls.

Run the new frame journey and focused affected suites in the single dashboard
runner, following `dashboard/tests/README.md` and `writing-journeys.md`.
The initial regression set is `system-settings`, `project-keyboard-navigation`
and its focus/eligibility companions, `sessions-sidebar-navigation`,
`agent-roster`, `notification-story-navigation`, `direction-disclosure`,
`dashboard-header`, `board-scroll`, `read-failure`, `auto-refresh-recovery`,
`frame-board-look`, and `project-remove`, plus the existing panel-kind journey
used by each new round trip. These are capability names of `.spec.ts` files.
Use the consumer trace to add reached observers or explain why a listed
observer's boundary is unchanged. New UI controls require proof at the control,
not a unit test that supplies already-selected perspective state.

Run `npm run typecheck:dashboard` for changed route/component contracts and the
staged lint gate from `.githooks/pre-commit`. After the behavior is coherent,
apply the execution workflow's independent post-change refactor, affected proof,
agent commit, delivery and asynchronous CI ownership. No additional all-suite
local gate is inferred from CI configuration.

## Story obligations

### G1. Later Intent capabilities are not built here
Reported: slice 1 — "I did not implement Structure, source browsing, Purpose/Proof layouts, readers or report machinery."
Story clause: "Source browsing and configuration, story-scoped Intent, Purpose/Proof layouts, observed Proof and history, Structure, and new report machinery belong to later work."
Disposition: excluded "belong to later work"
Commitment: 12, 13, 14, 15, 16, 17

### G2. Covering Side panel across a perspective change was unobserved
Reported: slice 1 — "A covering Side panel staying open across a perspective change (only reachable by Back/Forward while covered) is stated in the docs but not separately observed"
Story clause: "An already open terminal, report or review stays visible in the shared Side panel when changing perspectives."
Disposition: proved by slice 1: development-intent-frame-sessions.spec.ts "a covering terminal at a phone width stays shown and attached while Back and Forward change the perspective beneath it…" observes, at 390×844 with expectCovering, the same heading and echoed text after Back to Intent, Forward and Back again, exactly one attach with no endedBy, and Intent's forthcoming content with perspective=intent after Close; the panel's content kind does not depend on the route, so the terminal represents report and review, which SPCR observes uncovered

### G3. A long plain title wraps between about 401 and 430 pixels
Reported: slice 1 — "between about 401 and 430px a long title wraps to two lines in row 1."
Story clause: "Both perspectives and the shared navigation remain usable with a keyboard and at narrow widths."
Disposition: no user cost "judge whether the frame is understandable while ordinary Development work remains useful": the wrapped title stays whole and readable beside the perspective control, nothing is cut off or hidden, and no control moves out of reach; DH and DIF observe no clipping or sideways scroll at 390 and 320 pixels.

### G4. Back from a directly loaded settings URL in Intent was unobserved
Reported: slice 1 — "Back from a directly loaded settings URL that carries `perspective=intent`, without a dashboard history entry, is not directly observed."
Story clause: "System settings remains reachable and returns to the selected project's prior perspective, with usable focus."
Disposition: proved by slice 1: App.tsx:31 builds the settings URL from the current query, keeping perspective=intent, and App.tsx:47 closes settings without history by restoring view and leaving perspective in place, so a direct load parses the same route as the observed reload case; development-intent-frame.spec.ts "System settings from Intent returns…" observes return to Intent with the gear focused after reloading settings

## Current decisions and concern evidence

- Execution, 2026-10-31: SEED-198 landed (closed at `e87f1d19`) and SEED-199's
  covering Side panel landed before slice 1, so the slice was built on trunk
  `22eb4b3e`. The four baseline journeys passed there (strict verdict, 11.8 s).
- Slice 1 learnings: the two-row header threshold moved from 800 to 900 pixels,
  measured for title, perspective and four project tabs; the compact title stays
  at 400 pixels with the perspective in its second row (G3). Route address and
  parsing moved to `dashboardRouteUrl.ts`. The intermittent "a story on no card"
  sidebar case was a test race with the product's deliberate keep-in-view after
  a Side panel press; it now counts reveals from the entry press
  (`revealsAtClick`), 8 of 8 passing repeated.
- CI repair of slice 1 (runs 41196159364, 41196250164, `published-facts-reading`):
  at 864×500 the new two-row header shrank the Board region, so the paging strip
  overflowed the window at rest, and a 0.03 px scroll overshoot made a revealed
  focused link count as scrolled away. The strip's height now allows the page
  header's usual 8rem, and `storyCardFocus.ts` `inView` allows 1 px of edge slack.
  The slice's local selection missed this spec; 38 viewport and focus specs passed.
- Preparation authorizes no execution or Take. No planless authority is claimed.
- No formal blocking dependency, unobserved decisive current-state premise or
  human scope decision remains. The new behavior is acceptance work, not a
  claimed preparation observation.
- SEED-198's header is the expected base, handled by the execution-start
  recheck above rather than a recorded dependency.
- One Behavior slice retains one cohesive navigation model and proof loop.
  No numeric slice target or calibrated effort band is supplied, so none is
  invented. Implementation, proof and cleanup are included in this bounded slice.
- Slice-plan refinement was not needed: the source, proof ownership and single
  behavior boundary are aligned, without speculative Structure or independent
  outcomes. No remaining slice-specific concern was identified in this review.

## Execution complete

Product advice: no backlog change. The frame's value still depends on Terry
trying it, as the story says: browser proof shows navigation is preserved, not
that the distinction is understandable. Terry's hands-on review of
Development → Intent → Development, including a session and settings, should
come before `SEED-192#browse-test-purpose` starts adding reader cost. At wrap-up,
assimilate the now-built "Perspective boundaries and shared frame" direction
from the North Star into maintained docs. Keep its later reader, Purpose/Proof
and story-scope direction for the sibling stories.
