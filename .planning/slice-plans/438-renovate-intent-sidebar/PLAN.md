# Renovate the Intent sidebar with expandable group panels

**Identity:** SEED-213#renovate-intent-sidebar
**Source:** [selected story](../../seeds/SEED-213-intent-sidebar-panels.md#renovate-intent-sidebar).

## Goal and scope

In the Intent locations column, each configured Intent group is a recognizable
expandable section using Sessions-style header/body expand chrome. At most one
group's file list (or empty/unsupported explanation) is open at a time; the
developer can return to all groups collapsed. On each Intent browser mount every
group starts collapsed; expansion is not persisted. File selection and
Purpose/Proof reading survive collapsing the selected file's group. Nested
folder disclosure inside an expanded tree stays local. Purpose/Proof layout,
Intent configuration, Sessions multi-open/height/resize behavior, and Side panel
chrome stay out of scope. Product language must not call these sections the
dashboard Side panel.

## Existing solutions and decisions

PFE:

- **Intent locations column.** Keep `IntentBrowser` / `IntentLocationTree` and
  the existing locations-beside-reading grid (`intent-perspective.css`). Own
  exclusive expanded-group state at the browser (or equivalent parent of the
  group list); each location tree remains the body for one group.
- **Sessions optional-section chrome.** Reuse the interaction pattern from
  `RecentlyDoneSessions` / `RunningCursorSessions` (`sessions-sidebar-section-header`,
  `aria-expanded`, `aria-controls`, body shown only when open)—presentation and
  accessibility likeness only. Do not adopt multi-open toggles,
  `sessionsSidebarHeights`, or resize dividers.
- **Nested file tree.** Keep `FileTree` / `reviewFileTree` folder collapse local
  to the expanded group's body; it is not an Intent group.
- **Existing Intent browse proof.** Extend
  `dashboard/tests/intent-gherkin-browse.spec.ts` (and any sibling Intent browse
  journey that clicks files assuming always-visible trees) so journeys expand
  the needed group before selecting files, and add exclusive-expand / all-closed
  / selection-survives-collapse coverage. Neighbor reading, Proof placeholder,
  project-change, and dual-pane scroll promises stay green.

Applicable Accepted decisions: [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
(Product intent presentation; disposable presentation state; Side panel is a
distinct Board auxiliary region). No conflict; no new ADR or North Star topic.
ADR 0007 / 0009 remain Proposed and unbound here.

## Outside-in proof

| Story promise / example | Slice | Observable proof |
| --- | --- | --- |
| On opening Intent, group headers visible and every file list hidden | 1 | Playwright Intent journey: configured groups show headers; file buttons absent until expand |
| Expanding B while A is open closes A and shows B | 1 | Same journey: exclusive `aria-expanded` and only B's files (or explanation) visible |
| Collapsing the open group leaves all collapsed | 1 | Same journey: after collapse, no group body / file list shown |
| Select file, collapse its group: Purpose still shows that file; re-expand keeps selection | 1 | Same journey: Purpose text retained across collapse; selected row restored when re-expanded |
| Empty/unsupported group body still participates in exclusive expansion | 1 | Fixture with problem/empty location: expand shows existing explanation; expand another collapses it |
| Nested folder toggle does not collapse the Intent group | 1 | Nested folder disclosure while group stays expanded |
| Prior browse/read/scroll Intent promises | 1 | Updated `intent-gherkin-browse` (and siblings) remain green after expand-then-select |

## Ordered slices

### 1. Exclusive expandable Intent group sections
Type: Behavior
Status: planned
Proof: Playwright Intent journeys covering start-collapsed, exclusive expand,
all-closed, selection surviving collapse, empty/unsupported body, nested folder
local disclosure; existing Intent browse/read/scroll neighbors updated and
green. Apply the repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests).

```
Behavior: Intent open with several configured groups → expand A, expand B,
collapse B, select a file then collapse its group, expand an empty/unsupported
group, toggle a nested folder → at most one group body open; all-closed
reachable; Purpose keeps the selected file across collapse; nested folders do
not change Intent group expansion; group headers stay scannable
```

## Decisive premises

- **Current Intent browse specs assume always-visible file buttons.**
  Observation: `intent-gherkin-browse.spec.ts` clicks feature buttons and
  nested folder controls without an expand step; the height/scroll case does
  the same. Settled: slice 1 must update those journeys to expand the owning
  group first (and assert start-collapsed). No approach risk beyond that proof
  rewrite.
- **Sessions section-header pattern is available to mirror.** Observation:
  `RecentlyDoneSessions` / `RunningCursorSessions` expose
  `sessions-sidebar-section-header` with `aria-expanded` / `aria-controls`.
  Settled as the presentation pattern to follow, not a shared-module
  requirement.

## Current decisions

- One Behavior slice delivers the whole story outcome.
- Expansion starts collapsed on each Intent browser mount; no persistence.
- Exclusive expansion is required; Sessions multi-open is not borrowed.
- Do not introduce a shared Sessions/Intent section abstraction unless it is
  the simplest local implementation of the likeness promise.

## Concern evidence

Refinement not needed: one Behavior slice owns one exclusive-expand Intent
locations model with a single outside-in proof loop; no accumulating
special-case rules or independent second outcome.

No remaining slice-specific concern identified in this review.
