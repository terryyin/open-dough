# Get fast proof of the dashboard frame, navigation and settings

**Identity:** SEED-413#speed-dashboard-frame-and-navigation-proof
**Source:** [Get fast proof of the dashboard frame, navigation and settings](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-dashboard-frame-and-navigation-proof)

## Goal and scope

Give developers fast Vitest proof that the dashboard frame, project switching,
recent stories, story references and settings behave correctly. Move the
remaining frontend legacy cases outside Done review, live sessions and the
harness onto plain Vitest under the
[shared acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-frontend-stories).
Prove real deep links, reload and Back/Forward through a named E2E journey only
where a mounted owner cannot observe them; reuse an existing journey when it
already proves the behavior. Remove support that loses its last consumer here.
The built-app runner stays for Done review, live sessions and runner retirement.
`test-harness/` stays with story 8b.

## Current decisions

- Apply the [campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-frontend-stories),
  [Architectural North Star](../../NORTH-STAR.md)
  (directly testable production; act as soon as the page allows; plain Vitest
  for unit),
  [frontend test entry guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses),
  [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md),
  and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
- **PFE.** Reuse `mountBoardFrame` /
  `ConfiguredDashboard` / `pageReadsSupplying` /
  `board-frame-observation-supply` already proven by `frame-*-look`, board
  paging and `story-reference-done*`. Reuse colocated settings owner mounts
  (`system-settings-*-page.ts`) for display-only settings surfaces; open
  settings through the production frame when the proof is frame return, project
  hide or appearance across Board/Intent/Sessions. Reuse
  [`e2e/navigation/development-intent-history.spec.ts`](../../../e2e/navigation/development-intent-history.spec.ts)
  as the Back/Forward/reload journey pattern; extend or add a named story-URL
  history journey only for targeting the mounted frame cannot observe. Keep
  `PageFrame.tsx` (250 lines) and `ConfiguredDashboard.tsx` (210 lines) within
  their established responsibilities.
- Map each legacy title and its distinct assertions to a named replacement or
  inspected existing observation before deletion. Collapse the three project
  keyboard specs when they share setup and each failure still names its distinct
  rule. Consolidate equivalent header viewports and settings look variants when
  setup and risk match. Keep distinct focus, eligibility, unavailable, race and
  cue observations. Use the project's MakeMe and page-object selection; colocate
  page objects beside the specs.
- Act directly with retrying observations. Retire whole-app frame, navigation
  and settings FE consumption of route substitutes as the last scoped consumer
  moves. Keep shared E2E page objects.
- Compare equivalent focused selections at two workers, including preparation,
  counts by engine and destination, any E2E cost, and the slowest remaining
  cases. Maintain an assertion map in this plan as each slice lands under
  ADR 0010.

## Outside-in proof

| Starting evidence and action | Observed result | Slice |
| --- | --- | --- |
| A story URL opens cold, names an unavailable target, or repeats a destination cue | Project and story selection match; unavailable and cue outcomes stay distinct; only real reload/Back/Forward leave the mount for E2E | 1 |
| Keyboard or pointer selects among eligible projects | Focus and eligibility rules hold; Board content follows the chosen project | 2 |
| System appearance or settings chrome changes | Frame look, settings layout and project hide follow the choice through the production settings path | 3 |
| Compact or wide header and connection logo update | Banner controls stay reachable; logo kneads once on revision delivery | 4 |
| A story reference opens, identifies or recovers | Destination, identity and pending/failed recovery stay distinct without late focus theft | 5 |
| Recent stories or the agent roster are used | Recent list and roster collection match selection and published settings | 6 |
| Intent Changes lists files outside locations or with no locations | Outside listing, Purpose reading, Proof labels and no-locations explanations stay truthful | 7 |

## Baseline and decisive premises

Observed in the owned workspace on 2026-11-23 at `7d861c9d3`, Node 24.21.0
from the locked install, on macOS AC power. Commands ran from the project root
under `caffeinate -s -i`. Paths below are relative to
`dashboard/frontend-tests/` unless noted.

| Consuming operation | Observed form and result | Use in the plan |
| --- | --- | --- |
| Scoped selection | `npm run --silent test:dashboard:frontend --` with the 22 explicit legacy paths and `--list --reporter=line` selected **58** Playwright cases in 22 files (seed inventory at `24ae92074` was ≈67). | The explicit roster below replaces the earlier estimate. Measure executed cases from the proof record. |
| Baseline journey and timing | The same 22 paths with `dashboard/frontend-tests/` prefixes, `--workers=2 --reporter=line`, passed **58/58 in 1.3 m** Playwright time (~81 s wall including preparation). | Reuse this baseline at this source revision for ADR 0010 comparisons. Each slice uses its roster paths. |
| Production frame composition | Existing Vitest mounts (`frame-board-look`, `frame-roster-look`, `story-reference-done*`, board paging) already drive `ConfiguredDashboard` through `mountBoardFrame` with typed published work and page reads. | Reuse that composition for frame, project, reference and roster cases. |
| Story-URL cold open on the mount | Early probe in slice 1: open one cold story destination through `history` + `mountBoardFrame` / required page reads and prove reveal and focus before retiring the built-app path for that family. | Bounded by slice 1 early probe. |
| Real reload / Back / Forward | `e2e/navigation/development-intent-history.spec.ts` already proves Back, Forward, reload and System settings return for project and perspective. Story-URL reload/history cases that need a real page load extend that pattern or a named sibling journey. | Settled reuse for the history pattern; story-target specifics stay with slice 1's E2E mapping. |
| Settings owner mounts | Configuration Vitest specs already mount `SystemSettingsUsage`, OpenAI and terminal-theme owners with typed sources. | Reuse for look variants that do not need the frame; keep frame path for appearance, hide and navigation return. |

## Local gate

On macOS run from an awake machine on AC with `caffeinate -s -i`, the maintained
[sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Keep default test timeouts and follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run each affected frontend engine's explicit paths separately through
`npm run test:dashboard:frontend -- <paths> --workers=2` while both exist.
Run the named E2E paths with `npm run test:e2e -- <paths> --workers=2` when
changing their observations or their composed boundary. Typecheck changed
dashboard production inputs and callers with `npm run typecheck:dashboard`.

## Ordered slices

Frontend spec names omit `.spec.ts` unless otherwise specified.

### 1. Story URL destinations select, refuse and cue on the page frame

Type: Behavior
Status: done

**Roster (9 cases).** `navigation/story-url-destination`,
`navigation/story-url-destination-unavailable`,
`navigation/story-destination-repeat-cue`.

**Early probe.** Mount one cold story-URL arrival through `mountBoardFrame`
(or the same `ConfiguredDashboard` + required page-reads entry) with the story
query on `history`, and prove reveal and keyboard focus before moving the
family.

**Behavior.** A cold or held story URL waits for the named project's data, then
reveals and focuses that identity. Unavailable project or story outcomes stay
distinct from failed reads; retry and superseding project choice prevent late
reveals. Asking again for an already selected inspected destination cues it
again without clearing Highlight or detail. Promote reload, Back and Forward
story-target preservation that needs a real page load to a named E2E journey
(reuse or extend `e2e/navigation/development-intent-history`); keep mounted
proof for everything the frame can observe.

**Proof.** Focused Vitest selection for the three files (minus any promoted E2E
titles) stays green on the production frame. The named E2E journey covers
reload/history story targeting. Built-app substitutes used only by these cases
are gone once their last consumer moves.

**Accepted assertion map.** Paths below are in `dashboard/frontend-tests/navigation/`
except the named E2E journey.

| Retired case | Replacement observation |
| --- | --- |
| Cold URL and encoded target | `story-url-arrival` holds Doughnut's typed read while checking the query and sole read, then checks its card's reveal, focus, native Tab, and no scroll back after inspection. |
| Reload and history | `e2e/navigation/story-url-history.spec.ts` restores the story on Retry, reload and Back, checks cue appearance and expiry, and clears the story on project choice and Forward. |
| Hidden Taken column | `story-url-arrival` reveals the clipped column at 650 × 750 with reduced motion and card focus. |
| Roster detour | `story-url-arrival` opens the assigned agent's roster and checks Back restores the story address, visibility and keyboard focus. |
| Unknown project | `story-url-destination-unavailable` preserves the project and story in the error and clears the target when returning to configured stories. |
| Missing, failed and recovered | `story-url-destination-unavailable` checks the separate reasons, identity, focus and Retry availability. The E2E history journey performs the real reload after a failed read. |
| Superseded held destination | `story-url-destination-unavailable` releases the held read after project choice and checks no stale card or reveal. |
| Project removal in settings | `story-url-destination-unavailable` removes the selected project through System settings, clears the target and returns to the next project. |
| Repeat cue with inspection | `story-destination-repeat-cue` restores focus and the moving cue on both returns, preserving Highlight and detail after cue expiry. |

**Result.** The cold mounted probe passed. Nine migrated Vitest cases (4.59 s)
and one history E2E (5.80 s) took 10.39 s with preparation versus 12.17 s for the
nine legacy cases at the same two-worker limit. The single E2E file used one
worker. The slowest mount was repeat cue (1.20 s). Separate cold setups keep
absent and failed reads independently diagnosable. The history journey also
preserves the product's real reload on Retry. The App return now keeps focus
already placed within the dashboard. Seven existing settings E2Es, 22 affected
mounted cases and typecheck passed. The obsolete Story URL substitute was
removed. The independent refactor expressed the E2E with named steps. That
journey passed again in 6.37 s with preparation, for 10.96 s combined with the
unchanged Vitest run. Exact commands and assertions are in Git evidence
`slice1-return.md` and `slice1-refactor-e2e.log.run.json`.

### 2. Project selection and keyboard navigation keep focus and eligibility

Type: Behavior
Status: done

**Roster (8 cases).** `navigation/project-selection`,
`navigation/project-keyboard-navigation`,
`navigation/project-keyboard-navigation-focus`,
`navigation/project-keyboard-navigation-eligibility`.

**Behavior.** Choosing a project shows that project's Board and re-asks its
ref. Unmodified Left/Right cycle eligible catalog projects with wrap; focused
radios advance once; help, editing, other arrow owners and modified keys leave
the project unchanged. Focus stays useful across switches; held previous reads
stay isolated. Collapse the three keyboard specs when they share setup and each
failure still names its distinct rule.

**Proof.** Mounted frame selection covers project content, keyboard cycling,
focus and eligibility. No built-app project-keyboard path remains for these
titles.

**Accepted assertion map.**

| Retired case | Replacement observation |
| --- | --- |
| Project selection and ref re-ask | `project-selection` checks both projects' distinct Boards, revisions, direction, Highlight and commit-pinned source links for a shared identity, plus a fresh ref ask on return. |
| Project selection with no direction | `project-selection` switches from a populated Board to exact empty Taken and Backlog groups, with the selected project's revision and no direction or error. |
| Page arrows and wrap | `project-keyboard-navigation` drives both native arrow orders with exact Board, revision and address checks. |
| Focused radio and wrap | `project-keyboard-navigation` checks one native advance at a time, including wrap and radio focus. |
| History and roster | `project-keyboard-navigation` restores keyboard choices through Back and Forward and keeps the roster aligned on a keyboard switch. |
| Focus and held earlier read | `project-keyboard-navigation` preserves banner focus, moves focus from departed content to the selected radio, observes the real abort and checks a late answer leaves the current Board intact. |
| Modal, editing, native controls and prevented events | `project-keyboard-navigation` checks both arrows in the production help dialog, focused input controls, prevented arrows and normal cycling after dismissing help. |
| Modified arrows | The same protected-keys case checks each modifier with separate failure context and confirms an unmodified arrow still selects the next project. |

**Result.** Seven Vitest cases took 6.18 s with preparation versus 9.65 s for
eight legacy cases at two workers. There was no new E2E cost. Shared identity
and ref re-ask (1.54 s) and protected keys (1.30 s) were the slowest cases. The two
eligibility cases share their setup while focus and the late-read race keep
their own case. Ten affected mount checks and typecheck passed. Exact proof
and commands are in Git evidence `slice2-return.md`. After unifying held
snapshot and exact card setup, the final seven navigation cases took 7.11 s
including preparation, and nine affected Story URL cases and typecheck passed.

### 3. System appearance and settings chrome follow through the frame

Type: Behavior
Status: done

**Roster (7 cases).** `configuration/dashboard-system-appearance`,
`configuration/system-settings-look`,
`configuration/system-settings-navigation`,
`configuration/project-hide-selection`.

**Behavior.** System appearance changes Board, Sessions, Side panel, dialog and
Intent source readability together without an in-dashboard appearance switch.
Settings groups stay headed, readable and reachable at narrow and phone widths.
Global settings returns to roster with focus; browser history keeps project
selection where the mount can observe it, otherwise the existing history E2E
owns it. Hiding the selected project selects another visible one; hiding all
keeps settings usable and refuses deep links to hidden projects.

**Proof.** Appearance and hide run through the production frame and settings
path. Look variants that only need the settings owner reuse the existing
colocated mounts. Legacy built-app settings specs in this roster retire once
every assertion has a new owner.

**Accepted assertion map.**

| Retired case | Replacement observation |
| --- | --- |
| System appearance across the dashboard and Intent | `dashboard-system-appearance` changes Chromium's scheme, checks readable Board, Sessions, launch dialog, legend, settings and Intent source, and preserves source selection and the attached Side panel. |
| Headed and recognisable groups | `system-settings-look` checks headings, column alignment, text/control contrast, the passive mark's visible size, unobscured bounds and canonical image bytes. |
| Settings and project dialogs at 420 px | The same case resizes the frame and checks complete text, no horizontal scrolling, readable dialogs, expected entry focus and cancellation. |
| Long facts and 200% zoom | `system-settings-look` checks the full local facts at 360 px and 200% zoom and keyboard restoration of the Settings opener. |
| Touch reading after rotation | `system-settings-look` uses native touch at phone width, checks local facts and settings groups through rotation, and returns to the same roster with the opener focused. |
| Global settings and roster return | `system-settings-navigation` checks each project's local facts, no project switch while settings owns focus, and roster/focus on Back and Forward. Existing configuration and perspective-history E2E prove gear affordances and real reload. |
| Hidden selection and links | `project-hide-selection` drives real settings actions, selection and showing projects through typed reads, then verifies hidden addresses and the all-hidden fallback. Existing `e2e/configuration/project-hide.spec.ts` now also opens fresh hidden addresses through persisted settings in a separate tab. |

**Result.** Six mounted cases took 7.88 s including preparation versus 15.14 s
for seven legacy cases at two workers. Adding 0.86 s for the measured cold-link
steps in the two existing E2E cases gives 8.73 s of comparable proof. No new
E2E case was registered. Appearance (3.85 s) and project visibility (2.72 s)
were the slowest mounts in the first passing run. Eleven unchanged E2E
consumers and 12 affected mounted cases also passed with dashboard typecheck.
Production App supplies the required typed settings reads. Vitest serves brand
assets through the same plugin as the built dashboard. Exact commands,
assertions and timing are in Git evidence `slice3-return.md`. The independent
refactor passed all 12 affected mounts, both visibility E2Es and typecheck.
The later E2E rerun took 29.01 s versus 8.50 s for the same two E2Es earlier,
with 4.36 s in the new steps including tab lifecycle. Use the earlier pair for
the comparison and the later run for functional confirmation.

### 4. Dashboard header chrome and connection logo stay reachable

Type: Behavior
Status: done

**Roster (10 runtime cases).** `navigation/dashboard-header`,
`navigation/dashboard-header-compact`,
`navigation/dashboard-connection-logo`.

**Behavior.** The selected-project banner stays reachable across wide, mid and
phone widths. Compact title select keeps Sessions, perspective, Recent stories,
project select and settings on one line; keyboard and resize preserve choice and
focus. The connection logo kneads once when the waiting dashboard receives
updates. Consolidate equivalent banner viewport cases when setup and risk match.

**Proof.** Mounted frame header and logo observations stay green; compact
phone and keyboard paths use native input. Built-app header specs in this
roster are gone.

**Accepted assertion map.**

| Retired case | Replacement observation |
| --- | --- |
| Banner at 1280, 700, 520 and 320 CSS px | One `dashboard-header` case checks the same four rendered widths, including Verdana at 320 px. It observes pinned one-row layout, readable and reachable controls, radio or compact mode, Sessions/Settings paint and accessible names, and ten reverse Tabs below the banner per width. Typed read counts stay stable. |
| Banner project selection | `dashboard-header` checks both exact Boards and revisions when selecting another project, with the Sessions mark and name kept and no extra source read. |
| Compact one-row layout, phone touch and resize | One `dashboard-header-compact` case checks native touch project choice, one-row layout and exact new Board, then retains that choice through wide and narrow layouts. |
| Compact Escape and Enter | `dashboard-header-compact` observes native input, unchanged choice on Escape, accepted choice on Enter and focus returned to the title after both. |
| Page arrow and compact focus | `dashboard-header-compact` presses Right Arrow from a departing story's canonical link and checks focus on the new project's compact control. |
| Logo waiting, receiving updates and returning | `dashboard-connection-logo` holds both real stream locks and the typed fallback check. It observes a waiting PNG, the canonical kneading SVG and its expiry, no replay on a steady answer, and exactly one new SVG load on the later return. |

**Result.** Six mounted cases took 9.34 s including preparation versus
11.71 s for ten selected legacy registrations at two workers. The banner
widths were four generated legacy cases. Compact touch and resize now share
their setup. No E2E cost was added. Ten affected mounts and typecheck passed.
Unused exports left four shared Playwright helpers. Exact observations and
commands are in Git evidence `slice4-return.md`. The refactor shared the
served asset check across the header, logo and Settings mark. All six cases
from the three affected files passed with typecheck. That selection differs
from the measured header/compact/logo pair.

**CI repair.** At 700 px, a touch context on Linux can show compact Project
instead of the desktop radio group when text and controls use more room. The
mounted case now checks the mode against the rendered fit and preserves the
four width, layout and native focus observations. The matching failure was
reproduced on Ubuntu. Both radio and compact conditions passed after the fix,
as did the six focused macOS cases and typecheck. See
[the diagnosis](diagnosis-header-viewport.md) for the failed attempt and proof.

### 5. Story references navigate, identify and recover without late theft

Type: Behavior
Status: planned

**Roster (8 cases).** `navigation/story-reference-navigation`,
`navigation/story-reference-identity`,
`navigation/story-reference-recovery`.

**Behavior.** A dependency opens its active story and keeps inspection on
repeated activation; a starting reference reveals without protected inspection
or host action. Distinct seed identities follow keyboard and touch at a narrow
reduced-motion viewport; each project's pinned reference opens its own telling.
Missing, reading and failed destinations stay distinct; retry reaches a newly
published block; leaving or choosing another inspection during a pending read
prevents late focus or inspection theft.

**Proof.** Mounted frame (reuse `story-reference-done*` composition patterns)
covers navigation, identity and recovery. Built-app reference specs in this
roster retire.

### 6. Recent stories and agent roster follow selection and collection settings

Type: Behavior
Status: planned

**Roster (7 runtime cases).** `navigation/recent-stories`,
`stories/agent-roster-collection`.

**Behavior.** Recent stories lists card and Side panel selections, caps at the
ten most recent, survives storage failure for the page only, and choosing a row
selects and reveals across projects including unavailable. The roster lists the
current collection or the nerds collection from published settings; unknown
settings say so and list no agent; an existing assignment from the other
collection stays visible. Promote a real reload survival check that needs a
page load to the named history E2E only when the mount cannot observe storage
across reload.

**Proof.** Mounted frame recent-stories and roster views stay green with typed
published files / executing roster answers. Built-app consumers for these
titles are gone.

### 7. Intent outside and no-locations Changes stay truthful on Vitest

Type: Behavior
Status: planned

**Roster (8 cases).** `intent/intent-story-outside-proof`,
`intent/intent-story-outside-locations`,
`intent/intent-story-changes-no-locations`.

**Behavior.** Changed files outside every Intent location follow the locations
in open folders, are omitted from the header count, and read as Purpose under
Selected story only, including a Done published completion. An outside file's
Proof names the story's CI comparison, says it has no file-level CI evidence,
and keeps scrolled place. Without configured locations, Changes lists every
file beside the explanation; Taken stories with no local workspace or several
claiming worktrees keep their review explanation. Real Git overlay stays in
`e2e/intent/intent-story-changes.spec.ts`.

**Proof.** Mount Intent Changes / Proof owners over typed intent and review
reads as prior Intent stories did. The three built-app leftovers retire. Shared
Intent substitutes lose these consumers.

## Execution context

- Hitomi-chan, Story Branch Mode, `codex/get-fast-proof-of-the-dashboard-frame-navigation`.
  Publisher `dashboard-territory.local-open-dough`. Take `f733216e15155dc251b9617b6726f16e2ee588fa`
  is on `origin/main` and is the story branch's published starting point.
- Checkout-bound `npm ci` and `npm run typecheck:dashboard` passed on AC power.
- GitHub Actions `ci.yml`, observer `frame-navigation-hitomi` on the story branch,
  directory `/tmp/dough-ci-501/watch-9WUqm2`, PID `73735`, Codex cell `g500:14`.
  The Take was published before this story-branch observer was armed.

## Plan review

- **Refinement.** Not needed: seven Behavior slices follow distinct proof loops
  (story URL, project keyboard, settings/appearance, header chrome, story
  references, recent/roster, Intent outside) within the slice limit; the
  story-URL mount premise is bounded by an authorized early probe in slice 1;
  key examples map to slices 1–3; no duplicated domain rule remains.
- **Remaining concerns.** None identified beyond the early-probe-bounded
  story-URL mount premise above.
