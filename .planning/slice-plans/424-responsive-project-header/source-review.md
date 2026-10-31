# Source review — SEED-198#responsive-project-header

**Launch:** Fresh general-purpose reviewer; no conversation inheritance; only
the selected story Goal, Scope, key examples, exclusions, accepted
consequence, and deferred promises. No plan, product, or proof.

**Input:** `.planning/seeds/SEED-198-responsive-project-header.md` section
`#responsive-project-header` as supplied at first slice acceptance.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Remove the project title’s source-information disclosure completely | slice 2 | observed: `SourceStatus.tsx` deleted; `DashboardBanner.tsx` mounts plain `h1.project-title`; `.source*` styles and disclosure tests/docs removed |
| 1a | Remove the disclosure UI | slice 2 | observed: no `<details className="source-evidence">`; banner has plain heading |
| 1b | Remove its repository / ref / revision / retrieval content and note | slice 2 | observed: deleted SourceStatus body; navigation docs drop metadata promise |
| 1c | Remove supporting state, handlers, styles, imports, props, helpers, and documentation that become obsolete with the disclosure | slice 2 | observed: banner drops `work` prop; `source`/`sourceEvidence` locators removed; `docs/dashboard-navigation.md` + `dashboard/README.md` updated |
| 1d | Remove banner behavior that exists only for the disclosure | slice 2 | observed: disclosure-only `focusin` re-measure removed; `keepHeight` remains for banner footprint |
| 1e | Remove comments elsewhere that justify behavior by the disclosure | slice 2 | observed: `PublishedReadStatus.tsx` / `publishedWork.ts` comments no longer cite source evidence |
| 1f | `SourceStatus` renders only already-read `source` and `work`; it has no API call, endpoint, or server processing of its own | slice 2 | observed: SourceStatus deleted; no replacement API — Board read path unchanged |
| 1g | The shared Board read stays | slice 2 | observed: ConfiguredDashboard still drives published observation; no read endpoint removed |
| 2 | On a wide screen, the active project’s name is a plain, non-interactive page title | slice 2 | observed: `DashboardBanner.tsx` `<h1 className="project-title">`; `dashboard-header.spec.ts` asserts plain heading |
| 3 | On a wide screen, the existing tab-shaped project choices keep their current behavior | slice 2 | observed: `ProjectSelect` still mounted; header journey switches project via tabs |
| 4 | At narrow widths, the active project’s title is the project selector | slice 3 | |
| 5 | At narrow widths, the separate tab list is not shown | slice 3 | |
| 6 | The compact control shows the current project’s name | slice 3 | |
| 7 | The compact control is recognizable as a dropdown | slice 3 | |
| 8 | Opening the compact control offers the configured projects with the current one indicated | slice 3 | |
| 9 | Choosing a project uses the existing project selection (URL, history, published read) and updates the title | slice 3 | |
| 10 | Dismissing without a choice leaves the project unchanged and returns focus to the title control | slice 3 | |
| 11 | The compact selector works by touch | slice 3 | |
| 12 | The compact selector works by keyboard | slice 3 | |
| 13 | The compact header fits a phone width without a multi-row project list | slice 3 | |
| 14 | Resizing between layouts keeps the selected project | slice 3 | |
| 15 | Resizing between layouts leaves the appropriate control reachable | slice 3 | |
| 16 | Layout switches where the tabs no longer fit the header (not at the screenshot’s dimensions) | slice 3 | |
| 17 | Page-wide Left/Right project cycling keeps working at narrow widths | slice 3 | |
| 18 | Where cycling currently moves focus to the selected project radio after focused content disappears, it moves focus to whichever project control is shown | slice 3 | |
| 19 | Delete the disclosure’s own tests and assertions without negated replacements | slice 2 | observed: disclosure open/source-panel assertions deleted from header and journeys; no `not.toBeVisible` source replacements |
| 20 | For journeys that used the disclosure’s region only as evidence of which revision the page has read, move that surviving published-read evidence to a boundary that remains | slice 1 | observed: `dashboard/tests/dashboardParts.ts` `readRevision`/`retrievedAt`/`shortRevision`; migrated journeys under `dashboard/tests/*.spec.ts` and helpers assert short revision / retrieval time there (or `problem`/Board when status names none); product `dashboard/src/**` unchanged |
| 20a | The always-present read status announces the read revision (short form) | slice 1 | observed: `dashboard/src/PublishedReadStatus.tsx` announces `shortRevision`; journeys e.g. `published-work.spec.ts` `expect(readRevision).toContainText(shortRevision(revision))` |
| 20b | The always-present read status announces retrieval time | slice 1 | observed: status `<time>` via `parts(page).retrievedAt`; e.g. `published-work.spec.ts` datetime attribute assertion |
| 20c | Failure alerts name the revision | slice 1 | observed: `PublishedReadFailure.tsx` names `shortRevision(work.revision)` when `work && attempt.afterMembership`; journeys assert via `parts(page).problem` on that path; pre-membership failure keeps earlier retrieval on `problem` and Board membership (no status revision) |
| 20d | Rate-limit alerts name the revision | slice 1 | observed: rate-limited check path uses `problem` (retrieval time retained) and Board membership while status names no revision (`auto-refresh-rate-limit.spec.ts`); after-membership naming follows the same failure alert as 20c |
| 21 | Update maintained navigation documentation | slice 3 | |
| 22 | Add positive proof of responsive selection | slice 3 | |
| E1 | Wide screen: plain “Open Dough” heading; Doughnut tab updates title and work | slice 2 | observed: `dashboard-header.spec.ts` project-switch journey — plain title via `projectTitle` + Board membership for selected project |
| E2 | Phone width: dropdown title, no tabs; touch selects Doughnut | slice 3 | |
| E3 | Phone width keyboard: open, reach Pygardon, select or Escape | slice 3 | |
| E4 | Resize keeps Doughnut across plain title and dropdown | slice 3 | |
| E5 | Narrow Right Arrow cycles to Doughnut; focus lands on compact title control | slice 3 | |
| E6 | After origin advances and reread, journey asserts new short revision on read status | slice 1 | observed: refresh/reread journeys assert `shortRevision` on `readRevision` (e.g. `steady-refresh-bound.spec.ts`, `storyReadinessGaps.ts`) |
| X1 | Accepted consequence: sighted header no longer shows repository/ref/full revision/retrieval/note; spoken read and problems remain | slice 2 | observed: header has no source disclosure; `parts(page).status` / `problem` remain |
| X2 | Deferred: making the read result visible elsewhere |  | G1 |
| X3 | Deferred: project search or grouping in the selector |  | G2 |
| X4 | Deferred: moving Sessions, System settings, or product mark beyond compact fit needs |  | G3 |
| X5 | No new required restrictions by project count | slice 3 | |
| X6 | Do not replace deleted disclosure tests with negated absence replacements | slice 2 | observed: deleted disclosure assertions without negated “source absent” checks |

## Comparison notes (slice 1)

- Trigger: journeys that previously read revision/time from the source panel.
- Source-expected: assert remaining read status (short revision + retrieval time) or failure/rate-limit alert evidence.
- Actual: tests-only migration to `readRevision`/`retrievedAt`/`problem`/Board; focused Playwright of changed specs and helper consumers passed; no `dashboard/src` edits.
- Owner: slice 1 complete for 20–20d and E6; disclosure deletion and UI examples remain on slices 2–3.
