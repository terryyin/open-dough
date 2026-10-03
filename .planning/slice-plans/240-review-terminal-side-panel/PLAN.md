# Review and terminal in one resizable side panel

**Identity:** SEED-091#review-and-terminal-share-side-panel
**Source:** [refined story](../../seeds/SEED-091-dashboard-ui-renovation.md#review-and-terminal-share-side-panel).
**Prepared:** 2026-10-03. Planning only; this request authorizes no implementation or publication.

## Goal and scope

A developer reviews story changes or works in a session through one right-side
panel, with the dashboard available beside it. The panel has coherent controls,
supports mouse and keyboard resizing, and remembers one shared preferred width
in this browser.

Include the seed's exclusive selection, read-only review journey, common panel
chrome, Maximize/Restore, Close and focus return, live resizing, usable limits,
responsive arrangement, and width persistence. Replacing a terminal detaches
its attachment without ending or marking the native session done. Preserve
review workspace admission, snapshot/diff semantics, terminal themes, session
actions, retained reports, and the Sessions sidebar's meanings and access.

Terry accepted all recommended UX/UI choices on 2026-10-03. Changing panel
content restores the normal split; reopening a review reads a fresh snapshot.
The initial unsaved width is half the room available to dashboard and panel.
Left on the resize edge enlarges the right panel; Right narrows it. A temporary
viewport constraint or maximization does not erase the preferred split width.

Deferred: simultaneous review and terminal, tabs/content history, separate
widths per content type, persisted maximization, a final-report redesign,
new review comparison modes, and new session actions. These require no machinery
in this delivery.

## Preparation context

- Workspace: `/Users/terryyin/git/open-dough/.worktrees/show-story-review-and-terminal-in-one-resizable`.
- Branch: `codex/show-story-review-and-terminal-in-one-resizable`.
- Established Preparing assignment: DavidKo-chan, published revision
  `bbed4c396065bf77132ffccf37d278f27388d029`; this is also planning checkout HEAD.
  Reuse this assignment and workspace; no second announcement is needed.
- Authorized target for a later explicit keep: `origin/main`; integration
  checkout: `/Users/terryyin/git/open-dough`.
- The seed and plan are an uncommitted preparation draft. Preparing remains
  published until the preparation disposition ends it. This draft is not yet
  visible in the origin-derived dashboard.

## Existing solutions and direction

PFE outcome: extend the existing page panel and reuse the current content
readers, native attachment, frame controls, and browser-preference pattern.

- `TerminalSplit.tsx` keeps the page mounted while placing the terminal or
  retained report beside it. `usePageSessionPanel` already owns one selected
  session, maximization, close/focus return, and protection against stale
  session-operation answers. Extend that responsibility to a shown review;
  keep one selection rather than coordinating separate terminal/review flags.
- `pageSessions.ts` exposes host-qualified session operations and shown-session
  marks. Its production consumers include `LaunchSession`, `StartSession`,
  `SidebarEntry`, `TerminalPanel`, and `SessionResultPanel`. Keep these actual
  session meanings when a review occupies the same region: a review is not a
  session and must not acquire a session mark or lifecycle action.
- `StoryReviewAction` is called by `CardLaunches`; its local modal currently
  owns the review. Relocate its opening/closing responsibility to the page
  panel while reusing `useReviewRead`, `SnapshotView`, `FileDiff`, and the
  existing HTTP/Git review boundary. Preserve the source project and story
  identity on each opening request, including if the dashboard selection
  changes while content remains open. No new server or review-data model is needed.
- `TerminalPanel` and `Icon.tsx` already provide Lucide frame controls.
  Reuse that visual foundation for review chrome; keep native-session controls
  conditional on the session's capabilities. `useAttachedTerminal` observes
  its screen's size and fits xterm without reattaching. Its cleanup detaches
  the socket, with native-session continuity owned by the existing host boundary.
- `agent-terminal.css` and `session-sidebar.css` both describe the split,
  including the three-column sidebar arrangement. Change their common width
  rule coherently, measuring room remaining beside the sidebar. Keep the
  existing narrow stacked arrangement and page mounting/scroll continuity.
- `SessionSidebar` already reads and writes a disposable browser preference
  with storage refusal handled safely. Reuse that small pattern for width.
  The saved terminal-theme endpoint owns a machine setting and continues to
  own it. Product-wide searches found no existing panel resize interaction;
  add one width rule used by dragging, keyboard changes, restore, and viewport
  clamping, with the remembered preference distinct from its effective width.

Follow the [UX/UI North Star's accessibility direction](../../../docs/dashboard-ux-ui-north-star.md#visual-and-accessibility-direction),
[navigation guidance](../../../docs/dashboard-navigation.md),
[review contract](../../../dashboard/AGENT-LAUNCH.md#story-review), and
[terminal contract](../../../dashboard/AGENT-LAUNCH-TERMINALS.md).
The architectural North Star's
[separate observation and presentation](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
keeps width/selection as UI state and repository facts authoritative.

Accepted [ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
preserves story/session/workflow distinctions; Accepted
[ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports one coherent representation and small useful increments.
The index and in-file statuses agree: 0000–0006 Accepted, 0007–0009 Proposed;
no supersession, relevant conflict, or metadata mismatch was found. Proposed
dashboard ADR 0008 is not a constraint. This local presentation change needs
no new ADR or North Star topic.

## Key examples and proof ownership

All paths in this table are under `dashboard/tests/`. Existing journeys are
adapted through the actual page and boundaries, retaining their semantic
assertions. New specs named below are proposed proof homes, not existing files.

| Source promise | Owner | Observable proof |
| --- | --- | --- |
| Review replaces terminal; terminal replaces review; only one review/report/session item is shown, and dashboard remains interactive | 1 | New `story-panel-switching.spec.ts`: combine real isolated review worktrees with a synthetic launched session, operate card and sidebar open controls, count the shown named panel regions, use a dashboard control while reviewing, observe detach and unchanged native-session identity/done state on reopening |
| Switching resets maximization; both review and terminal expose coherent named icon controls, Maximize/Restore and Close | 1 | Extend `agent-terminal-maximize.spec.ts` and the switching journey: review and terminal use frame icon controls, cover the same available room, preserve content on Restore, and return to split on replacement. Update the existing assertion that another session remains maximized to the accepted reset behavior |
| Close/shortcut returns useful focus, respects dialogs/settings, and ordinary terminal Escape remains input | 1 | Extend `agent-terminal-keyboard.spec.ts` and switching proof for review Close/Command+Shift+Escape, named content focus without a trap, and opener removal followed by useful dashboard focus. Preserve dialog shortcut suppression and terminal input assertions; `system-settings.spec.ts` observes suppressed shortcuts and the preserved attachment while Settings is open |
| Fresh opening/reopening, fixed snapshots until Refresh, file navigation/evidence, no-change/unavailable/recovery, and read-only Git behavior survive relocation | 1 | Adapt `story-review.spec.ts`, `story-review-refresh.spec.ts`, `story-review-nothing.spec.ts`, and `story-review-landed.spec.ts` from dialog to named panel. Retain actual Git index/status, baseline, list/diff, file hiding, refresh focus/status, and recovery assertions; add an edit while closed and verify reopening reads it |
| A pending review of A cannot become B's result; retained reports remain passive and exclusive | 1 | Hold and release an actual review response in the switching journey, using the held-response technique from `session-workspace-retirement.spec.ts`. Preserve that spec's card/Recent/sidebar report access, cancellation, focus, unchanged store and no native continuation. Add review/report replacement observation |
| Mouse and keyboard resize the same width within usable limits; terminal stays attached and review retains snapshot/selection | 2 | New `side-panel-width.spec.ts`: actual mouse drag and keyboard Left/Right from a focusable edge, measured panel/dashboard boxes, visible focus and accessible width, overdrag/arrow clamping. Count terminal attachments and review requests, preserve terminal output and selected diff, and observe actual terminal resize output |
| Resizing, maximize/restore, content switching, sidebar changes and close/reopen all use one preferred width | 2 | Same width journey with sidebar closed/open, terminal and review, Maximize/Restore, and reopening. Compare actual geometry rather than reading internal state; no resize edge is offered while maximized |
| Bounds and narrow reading keep controls/navigation reachable at 420px and 200% zoom; wide preference survives temporary limits | 2, retained in 3 | Same width journey at 1440px, 420px and the existing 640×450 CSS-pixel proxy for 1280×900 at 200%. Use `pageLayout.ts` and `accessibleReading.ts` for no page-wide horizontal loss, readable header/facts, keyboard targets, and visible focus. Limit overflow exceptions to genuinely scrollable code/path/terminal areas. Verify stacked order, absent horizontal resizing, and restored wide geometry; bounded visual observation checks both contents |
| One width persists in this browser across reloads; absence, unusable storage or a malformed preference leaves the panel usable | 3 | Extend width journey: choose width through the UI, reload the same browser context, reopen different content and compare geometry. Use a fresh isolated browser context for the initial half-width case; deny browser storage as in `session-sidebar-stays-as-left.spec.ts` and verify in-memory resizing still works without page errors. Corrupt only the width preference and verify safe fallback. Reload while narrow, then widen, to prove the constrained effective width did not overwrite the preference |
| Theme, terminal/session controls, selection marks and background lifetime remain meaningful | 1 and 2 | Preserve `agent-terminal-codex-page.spec.ts`, `agent-terminal-theme.spec.ts`, `session-workspace-retirement.spec.ts`, and affected `session-sidebar-navigation.spec.ts` observations. If shared lifecycle operations change, run the affected done/delete/lifetime journeys identified by their callers |

## Decisive premises observed during planning

Dependencies were installed in this owned workspace with
`npm ci --include=dev --ignore-scripts`. The observed engine was Node v24.5.0
and Playwright 1.63.0. The browser harness builds production assets, then serves
each journey through its own loopback dashboard boundary, fake GitHub, isolated
machine/home, bare Git origin when needed, and synthetic native hosts. It does
not launch a real paid agent or touch the integration checkout.

Literal baseline command:

```sh
env -u NODE_ENV -u npm_config_local_prefix -u npm_package_json ./node_modules/.bin/playwright test --config dashboard/playwright.config.ts --reporter=line --workers=2 dashboard/tests/story-review.spec.ts dashboard/tests/story-review-refresh.spec.ts dashboard/tests/story-review-nothing.spec.ts dashboard/tests/story-review-landed.spec.ts dashboard/tests/agent-terminal-maximize.spec.ts dashboard/tests/agent-terminal-keyboard.spec.ts dashboard/tests/agent-terminal-codex-page.spec.ts dashboard/tests/session-workspace-retirement.spec.ts dashboard/tests/session-sidebar-stays-as-left.spec.ts
```

Result at the planning checkout HEAD: **15 passed, 57.0s**.

Additional shared-consumer command:

```sh
env -u NODE_ENV -u npm_config_local_prefix -u npm_package_json ./node_modules/.bin/playwright test --config dashboard/playwright.config.ts --reporter=line --workers=2 dashboard/tests/system-settings.spec.ts dashboard/tests/agent-terminal-theme.spec.ts dashboard/tests/session-sidebar-navigation.spec.ts
```

Result: **5 passed, 10.5s**. Inspected assertions reach opening Settings while
the native attachment remains mounted, suppressed dashboard shortcuts from
Settings, live terminal theme changes without reattachment, and sidebar opening,
shown-session marks and focus return across projects. These consumers therefore
have usable existing proof for slice 1; they do not prove the new review panel.

| Premise and consuming operation | Observation reaching it | Result |
| --- | --- | --- |
| Slice 1 can preserve real review snapshot/admission/diff behavior while relocating presentation | Baseline command's review journeys; inspected `support/preparationPage.ts`, `support/storyReviewWorktree.ts`, and the four review spec assertions | Real bare-origin/worktree inputs reach the page's HTTP/Git read. Assertions observe filtered changed files, diffs, preserved index/status, fixed snapshots, explicit Refresh, landed-change exclusion and unavailable recovery. The fixture supplies launch-record eligibility; it does not prove launching a session |
| Shared page ownership has to retain terminal and report lifecycle distinctions during slice 1 | Baseline command's terminal/retirement journeys; inspected `pageSessionPanel.ts`, `pageSessions.ts`, `LaunchSession.tsx`, `StartSession.tsx`, and retirement assertions | Page opening reaches a real synthetic native attachment or passive report read. Keyboard, close, reattach identity, unchanged report store and late report cancellation pass. One existing maximize expectation differs from the accepted new behavior and is intentionally changed |
| Slice 2 can fit an existing live terminal to element-size changes without opening another attachment | Baseline command's maximize and Codex page journeys; inspected `useAttachedTerminal.ts` through its ResizeObserver, FitAddon, socket resize frames and cleanup | Geometry/viewport changes retain the attachment; the Codex fixture's rendered resize output is observed. New edge dragging and keyboard resizing still need their own execution proof |
| Browser-local persistence with storage refusal is viable for slice 3 | Baseline command's `session-sidebar-stays-as-left.spec.ts` journeys, including its actual Chromium storage getter refusal and reload; inspected `SessionSidebar` storage functions | The existing preference survives reload normally; refused storage leaves the page usable without errors. This establishes the browser mechanism, not persistence of the future width setting |
| One page panel can serve all actual callers; no current width interaction should be duplicated | `rg -n 'StoryReviewAction|TerminalSplit|usePageSessionPanel|SessionResultPanel|openTerminal|openResult' dashboard/src`; `rg -n 'pointermove|pointerdown|resize.*panel|panel.*resize|localStorage|usePageSessionPanel|StoryReviewDialog' --glob '!package-lock.json' --glob '!DearDough.md' --glob '!PLAN.md' --glob '!SEED-091*' src dashboard/src scripts`; inspected the matched caller bodies and both split stylesheets | The PFE consumers above are the production call chain. Review dialog locators occur in the four page-review specs; no feature/step layer wraps the relocated UI owner. Browser preference precedent exists; panel-width interaction is a gap. Sidebar CSS currently repeats half-width columns and must consume the shared sizing rule |

These observations establish the baseline and proof entry points. They do not
establish the future shared panel, its appearance, edge interaction, or saved
width. No owner-held or paid premise needs an early probe slice.

## Ordered slices

### 1. Review and session work through one coherent panel
Type: Behavior
Status: done
Proof: Slice-1 table rows; updated four review page specs plus `story-panel-switching.spec.ts`, `agent-terminal-maximize.spec.ts`, `agent-terminal-keyboard.spec.ts`, `agent-terminal-codex-page.spec.ts`, `session-workspace-retirement.spec.ts`, `system-settings.spec.ts`, and affected session navigation/theme journeys.

Behavior: a story has an eligible review workspace and a session can be opened
from its normal controls → the developer alternates between review, terminal
and retained report, maximizes/restores or closes the shown content → exactly
one named item occupies the panel, the split dashboard remains usable, native
session semantics and review evidence are preserved, and focus returns usefully.

Extend the existing page-panel selection coherently, carrying each request's
source identity and opener. Keep session operations/marks separate from review
content. Move review reads/rendering out of the card's modal while preserving
fresh-open/fixed-snapshot semantics and guarding replaced reads. Common panel
chrome owns shared Close/Maximize styling and interaction; content owns its
specific operations and status. Maintain page mounting and scroll continuity.
Adapt every affected modal locator, Escape-close assumption and geometric
assertion to the actual nonmodal journey, retaining its original domain proof.
For file-list hiding's width observation, use enough available panel room to
exercise side-by-side content rather than requiring old dialog dimensions.

Add the combined outside-in switching proof using the existing real worktree
and synthetic-session fixtures; it must operate actual opening controls and
observe the native attachment/read boundaries. Hold a review response while
opening a second story and observe both identities before and after release.
Do not satisfy switching by injecting a final selected state into a UI fixture.
Capture both panel headers at the same viewport and use the existing icon-control
assertions plus bounded visual observation to assess shared styling and reading.
Update maintained review/terminal/navigation documentation in this slice.

Safe stopping point: useful review/terminal/report switching and coherent
controls work at the existing half-width and narrow arrangement. Edge resizing
arrives in slice 2; persistent width arrives in slice 3. All affected current
journeys are green at this delivery boundary.

Delivered 2026-10-03. Accepted proof: the literal baseline Playwright prefix over
the four review specs, `story-panel-switching.spec.ts`,
`story-panel-replacement.spec.ts` (held review of A never answers B; report/review
replacement and fresh reopen; shared header look), `agent-terminal-maximize`,
`-keyboard`, `-codex-page`, `-avatar`, `agent-launch-codex`,
`session-workspace-retirement`, `session-sidebar-stays-as-left`,
`system-settings`, `agent-terminal-theme`, `session-sidebar-navigation`, plus the
panel-operation consumers `agent-terminal-done/-delete/-close/-reopen/-done-reopen/-lifetime/-codex-close/-done-codex-page`,
`agent-launch-card-delete/-recent-delete/-card-done/-done/-codex`,
`story-review-workspace` and `story-review-diff`: 55 passed after refactoring;
`npm run typecheck:dashboard` passed.

Learnings for remaining slices:
- The shared panel now lives in `PageFrame.tsx` (was `TerminalSplit.tsx`) and
  `pageSidePanel.ts` (`usePageSidePanel`, was `pageSessionPanel.ts`); reviews
  open through `pageReviews.ts` into `StoryReviewPanel.tsx`; common chrome is
  `PanelControls.tsx`. Split/frame/maximized/narrow rules moved to
  `side-panel.css` (`.side-panel`, `.side-panel-header`); `agent-terminal.css`
  keeps terminal-only rules. Slice 2's width rule belongs in `side-panel.css`
  and `session-sidebar.css`, which still repeats the half-width columns.
- Maximization is stored on the shown content, so content changes start split.
- The review in the narrow stacked arrangement relies on the shared frame rule
  without its own assertion; slice 2's 420px proof covers both contents.
- A fake `claude` attach records the record's `shortId`; assert attach counts
  before filtering to avoid vacuous checks.

### 2. Choose a usable panel width by mouse or keyboard
Type: Behavior
Status: planned
Proof: Slice-2 table rows through `side-panel-width.spec.ts`, preserving the slice-1 switching proof and terminal maximize/keyboard/Codex page observations.

Behavior: either review or terminal occupies the normal split → the developer
drags its edge or uses Left/Right with the keyboard → one preferred width
changes within usable bounds, content fits live without losing reading or
attachment state, and that width is reused across close/reopen, switching and
Maximize/Restore for the current page lifetime.

Add one preferred-width representation and derive the effective width from
available room, usable minima and panel mode. Mouse and keyboard use the same
rule. Handle the pointer's release outside the edge and cancellation so resizing
cannot remain stuck. Expose a named, focusable edge with current width and
visible focus; resizing keys apply only while that edge holds focus. Keep
controls, story/session identity and evidence reachable at the bounds. Choose
usable minima from the actual rendered reading/control needs, not fixture counts.

Make both split stylesheets, including the open-sidebar case, consume that
rule. While maximized or stacked, offer no horizontal resize interaction;
retain the underlying preference. Test both content types, sidebar transitions,
extreme drags/arrow changes, same-attachment and no-extra-review-read evidence,
and 420px/200% reading with returning wide geometry. Final screenshots and a
bounded visual/keyboard observation assess control reachability, coherent
chrome and the edge affordance. When this active slice requests that observation,
use the installed manual-testing workflow; it does not replace browser assertions.
Update maintained sizing/accessibility guidance with the implemented behavior.

Safe stopping point: panel resizing is useful and accessible, with width shared
through the current page lifetime. Reload still starts at half width; this
explicit interim behavior is replaced by slice 3.

### 3. Recover the shared width after reopening the dashboard
Type: Behavior
Status: planned
Proof: Slice-3 table row through the width journey, plus `session-sidebar-stays-as-left.spec.ts` when changing shared preference code.

Behavior: a developer chooses a split width → they reload and reopen either
review or terminal in this browser → it recovers the shared preferred width
within current bounds; a temporary narrow or maximized view does not replace
the saved preference.

Read and save only the disposable browser preference using the existing small
error-tolerant pattern. Validate a saved value; absent or malformed data uses
the half-width default. Refused storage still permits page-lifetime resizing.
Persist user choices, not viewport-induced clamping or temporary maximization.
Do not add a server setting, per-project registry, content-specific widths or
maximized-state persistence. Test actual UI choice → reload → different content,
narrow reload → wide recovery, fresh-context default, malformed preference and
storage refusal; keep changes isolated to each test's browser context.
Document that this preference is local, disposable, and shared across contents.

Safe stopping point: the complete story outcome is delivered with shared width
recovery and no deferred-capability machinery.

## Execution, verification and design assessment

- All three slices are Behavior. Required small internal restructuring,
  outside-in proof, documentation and cleanup belong with their corresponding
  user outcome; no preparatory Structure slice is justified. One selected
  panel and one preferred-width rule keep the cumulative design coherent.
  Session lifecycle, passive report and review snapshot meanings remain distinct.
- No numeric slice target/hard limit is configured in this project's guidance.
  Each slice has one proof loop and includes implementation, verification and
  cleanup in its sizing hypothesis. If selecting a review forces a substantial
  change to session ownership or if bounds cannot satisfy the recorded reading
  examples, revise the remaining plan from that evidence before extending work.
- Run the owning browser proofs with the literal baseline command's Playwright
  prefix, selecting the listed files for the current slice. Run
  `npm run typecheck:dashboard` when changing TypeScript contracts; the browser
  harness already builds production assets. Broaden checks only when changed
  shared consumers justify them, rather than treating all hosted CI as a local
  gate. Baseline fixtures prove local browser/native-boundary integration with
  substitutes, not real-agent native acceptance.
- Future authorized execution uses the installed execution workflow's
  [delivery sequence](../../../.agents/skills/dough-execute-plan/references/wrap-up.md#deliver-the-change):
  accepted proof, independent post-change refactoring before commit, selective
  `npm run format`, plan evidence update, and the check-only staged lint hook
  (`.githooks/pre-commit`). Hook-owned lint is not run separately. Deliver green
  work before the next slice and retain proof boundaries/results in this plan.
- The related compact-card story may change `CardLaunches` concurrently. Shared
  code is ordinary reconciliation, not a blocking story dependency. Keep its
  grouping, startup protections and existing Review changes availability intact.

## Current decisions and remaining concerns

Terry's accepted seed choices govern all slices. Exact resize step size and
usable pixel minima remain ordinary implementation decisions, assessed by the
mapped bounds/readability proof rather than a new product approval.

No remaining slice-boundary, cumulative-design, sizing or proof-ownership
concern was identified. Slice-plan refinement was not needed: selection,
live width and persisted width are distinct cohesive outcomes with mapped
proof and safe stopping points. The half-width/no-persistence interim states
are explicit trade-offs, replaced by slices 2 and 3 respectively.

The preparation recorder owns the readiness assessment. This plan creates no
execution identity, Take, publication, or execution-complete record.
