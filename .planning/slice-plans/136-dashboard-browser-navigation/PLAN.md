# Dashboard browser navigation

## Source

[Open external links in new tabs and route agent rosters](../../seeds/SEED-053-dashboard-browser-navigation.md#dashboard-browser-navigation)
— Identity: SEED-053#dashboard-browser-navigation.

## Goal and scope

Developers can follow source and external-reference links without losing the
dashboard tab, and can navigate between each project's stories and agent
roster using URLs that agree with browser history and the visible view.

Included: new-tab behavior for every dashboard link that leaves the app;
project-aware stories and roster URLs; portrait opening, Back to stories,
browser Back/Forward, direct load and refresh, project switching, unknown
project handling, truthful snapshot/read-failure presentation, and focus return.
Individual-story routes, persisted detail expansion, and extra roster reads
are outside this story.

Use the existing locally served single-page dashboard. A query-based route on
`/` can name project and view without depending on a server path fallback;
the exact parameter spelling is an implementation choice. Treat the URL as the
navigation source for project and view. Reuse the fixed project catalog and the
existing project-observation switch, rather than adding a second project
catalog or a second snapshot lifecycle. A direct roster visit has no portrait
opener; the roster heading is a useful initial focus target. An invalid project
route resolves to the default project's stories and normalizes its URL, never
labels another project's roster with the invalid route.

## Outside-in proof

| Key example | Slice | Observable signal |
| --- | --- | --- |
| Canonical and plan links to revision-pinned GitHub pages, and ordinary external references, open a new tab while the dashboard and open detail remain in place | 1 | `dashboard/tests/source-navigation.spec.ts` observes a popup's exact destination and the original page's project, URL, and expanded detail; all rendered outbound links follow the policy |
| Portrait opening, browser Back/Forward, and Back to stories keep URL, project, roster/stories, snapshot, and focus coherent | 2 | `dashboard/tests/agent-roster.spec.ts` drives each navigation action through the built preview and checks URL, view, selected project, retained detail, and focus |
| Direct roster load/refresh, project change while on the roster, and unknown project URL show the right project or a valid fallback, with truthful reading/failure state | 2 | The same browser journey enters URLs directly, switches projects, walks history, and checks that no other project's roster or stale assignment appears |

## Decisive premises observed before planning

- `rg -n '<a|window.open|location.|navigate' dashboard/src --glob '*.tsx' --glob '*.ts'` and the inspected callers found only the two outbound anchors in `dashboard/src/RecordedLink.tsx`; both snapshot and external references pass through it. `dashboard/tests/source-navigation.spec.ts` currently asserts same-tab navigation for a snapshot link and only `rel` for an external reference. Result: one link rendering policy and its existing browser journey own slice 1.
- `dashboard/src/App.tsx` holds the roster opening in local state and its Back button clears that state; it writes no URL. `dashboard/src/publishedObservation.ts` initializes `defaultSource` and `selectSource` clears the prior project's observation before reading the new one. `dashboard/src/publishedSource.ts` already validates IDs with `sourceById`. Result: slice 2 connects URL navigation to these existing owners without duplicating snapshot state.
- `dashboard/tests/agent-roster.spec.ts` already proves portrait focus, open detail on return, project switching, and unknown assignments against a built preview with a fake GitHub CLI. `dashboard/playwright.config.ts` builds and serves the production app for each journey. Result: extending this boundary can prove routes and history through their consuming view, not only a parser or `pushState` seam.
- The dashboard's [North Star](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation) makes the roster one view of the selected published snapshot; [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md) favors one coherent representation. The route affects view selection, not repository facts. No new architecture topic is needed.

## Ordered slices

### 1. Keep the dashboard available when following outbound links
Type: Behavior
Status: planned
Proof: Extend `dashboard/tests/source-navigation.spec.ts` to observe a new tab
for a snapshot file link and an ordinary external reference, verify their
destinations, verify the original dashboard URL, project, and expanded detail
remain, and check the rendered outbound anchors. Run the focused Playwright
spec, `npm run typecheck:dashboard`, and `npm run lint`.

Behavior: a developer viewing a card or detail follows any dashboard link to
GitHub source or an ordinary external web address → the destination opens in a
new tab with its existing URL/anchor and safe opener relationship, while the
dashboard's current view remains available. Unusable targets remain text.

Apply the policy in the existing `RecordedLink` renderer for both snapshot and
external links. Update the existing same-tab assertion and any affected
documentation in `dashboard/README.md`.

### 2. Navigate project stories and rosters through browser history
Type: Behavior
Status: planned
Proof: Extend `dashboard/tests/agent-roster.spec.ts` with portrait → URL →
browser Back/Forward, Back to stories, direct roster load and reload, project
switch while on roster and history back, unknown project fallback, loading and
failed-read states, and keyboard focus assertions. Run that focused Playwright
spec, `npm run typecheck:dashboard`, and `npm run lint`; run the dashboard suite
once after the shared project-selection behavior changes.

Behavior: a developer opens a roster from a project's stories, visits a
project-aware URL directly, switches projects, or walks browser history → the
URL, selected project, visible stories or roster, and published observation
agree. Returning to stories restores the open detail and portrait focus when
that opener still exists; direct visits and missing openers retain a useful
focus target. An invalid project URL resolves to a valid stories view.

Keep route reading/writing and `popstate` handling together near `App`, using
the project catalog to validate IDs. Adapt `usePublishedObservation` so the
route can select the project through its existing reset/read path. Preserve
the roster's current snapshot and no-extra-read behavior. Update
`dashboard/README.md` for the routes and browser navigation.

## Current decisions

- A dashboard-internal project/view route stays in the current tab; a link
whose destination leaves the dashboard opens another tab.
- Project IDs come from the existing catalog. The URL identifies the project
and view; transient portrait origin and story-detail state can remain in memory.
- Back to stories follows the history entry made by portrait opening. On a
direct roster visit without such an entry, it navigates to that project's
stories rather than leaving the dashboard.

## Learnings

None yet.
