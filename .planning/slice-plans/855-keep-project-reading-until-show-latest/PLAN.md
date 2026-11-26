# Keep the project reading until Show latest can replace it

**Identity:** SEED-420#keep-project-reading-until-show-latest
**Source:** [Keep the project reading until Show latest can replace it](../../seeds/SEED-420-unified-intent-review.md#keep-project-reading-until-show-latest)

Split during execution from SEED-420#browse-the-project-at-a-revision at its
delivered slice 5 boundary (CI passed at
b5e82660489d76194c2890f20f40c56886bb7899). That story's plan 841 delivered
the project tree and file reads, whole-project browsing, the CI-to-source
journey and mounted fixtures that answer the tree. Its slice 6 moves here
with its attempt and its two open obligations. This plan is provisional
input: refine the story and these slices before execution.

## Current decisions

- Carried from plan 841: the tree reads through `readProjectTree`
  ([authenticatedProjectBrowseRead.ts](../../../dashboard/src/authenticatedProjectBrowseRead.ts)),
  once per revision, in
  [useProjectTreeRead.tsx](../../../dashboard/src/useProjectTreeRead.tsx);
  `useIntentLocations` already holds the shown locations while the next
  revision is read.
- [Act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows):
  the Files toggle stays available while project files are read (decided
  during the plan 841 slice 6 attempt).
- Keep the pairing of tree and locations in project scope, because
  `useShownIntentLocations` also serves story pages.

## Attempt evidence

[attempt.patch](attempt.patch) is plan 841's slice 6 attempt at
b5e82660489d76194c2890f20f40c56886bb7899 (13.9 active minutes, not
converged). It pairs the tree with locations in a `useProjectReading` hook,
routes failures to `IntentRevisionNotice` and a `FailedIntentRead` first-open
paragraph, shows "Reading project files…" on first open, and answers mounted
fixture trees from `keptIntentLocationsAt`. Its three new cases in
`intent-revision-apply.spec.ts` passed. Still failing on that attempt:

- Five mounted cases expect the toggle's controlled Files column, which is
  missing while files are pending (`intent-files-drawer`, `intent-sessions-drawer`,
  `intent-sidebar-toggle`, `intent-story-views-narrow`).
- Five `intent-read-recovery` cases time out, probably because the fixture's
  5 ms `setTimeout` wait never advances under fake timers.
- Two CI wall-time history cases (focus loss, timeout), cause open.
- Five E2E cases where the CI overview stays at the measured build instead
  of advancing to the observed trunk judgment, cause open and not compared
  with a baseline.

## Outside-in proof

| Promise | Slice and observation |
| --- | --- |
| Path navigation keeps the shown pin. **Show latest** advances tree/settings/source coherently, explains deletion, and keeps the old usable reading if an inventory update is held or fails. | 2. Hold and fail the new inventory answer while the new locations answer independently, then retry. Assert A stays usable until B's matching data is available, B reads exact replacement source, and a path removed at B has no stale text. Resolve an obsolete request after navigation and check that it cannot replace the active reading. |
| On first open the page says project files are being read, keeps the Files toggle, and a failed read retries. | 1. Mount Project Intent with a held, failed and retried first tree. |

## Slices

### 1. Show a pending project tree on first open

Type: Behavior
Status: planned
Proof: Mounted Project Intent cases for held, failed and retried first
trees, plus the mounted drawer, sidebar and read-recovery suites.

Before the first tree arrives, say the project files are being read instead
of listing only the location files, keep the Files toggle with its column,
and route a failed first read through the first-open Retry. Mounted fixture
trees answer without timer polling.

### 2. Keep the current reading until Show latest can replace it

Type: Behavior
Status: planned
Proof: Extend the mounted revision-apply and source-recovery journeys with
held, failed, retried, and stale project inventory answers. Re-run the
end-to-end project revision and CI visit journeys.

Make the project reading advance when both the new inventory and its
settings have settled for the offered revision. Keep the last usable pair
with its own pin while either answer is unread or the inventory read fails,
and route inventory failure to `IntentRevisionNotice`'s failed update and
Retry. When the new pair arrives, re-evaluate the selection against the full
inventory, independent of the browsing filter. A retained path reads the new
blob, and a removed path clears its old source. The CI overview keeps
advancing to the observed trunk judgment independently of the browser.

## Story obligations

### G1. Project tree shows only location files while its inventory is unread (first reported in plan 841 slice 3)
Reported: slice 1 — "While the paths are not read, the browser lists the configured location files; a failed read says why and offers Retry."
Story clause: "Before the first tree arrives it says the project files are being read instead of listing only the configured location files"
Disposition: return

### G2. Project tree read failure and Retry are unobserved and use a new surface (first reported in plan 841 slice 3)
Reported: slice 2 — "Untested: the error message and Retry shown when the project tree read fails (in useProjectTreeRead.tsx)."
Story clause: "If the new inventory cannot be read, the current reading remains usable while the developer retries."
Disposition: return
