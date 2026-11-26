# Keep the project reading until Show latest can replace it

**Identity:** SEED-420#keep-project-reading-until-show-latest
**Source:** [Keep the project reading until Show latest can replace it](../../seeds/SEED-420-unified-intent-review.md#keep-project-reading-until-show-latest)

Split during execution from SEED-420#browse-the-project-at-a-revision at its
delivered slice 5 boundary (CI passed at
b5e82660489d76194c2890f20f40c56886bb7899). That story's plan 841 delivered
the project tree and file reads, whole-project browsing, the CI-to-source
journey and mounted fixtures that answer the tree. Its slice 6 attempt and
two open obligations moved here.

## Goal and scope

With no story selected, Project Intent keeps a complete, usable reading while
newer browsing data is read: on first open it says the project files are being
read, inside the browser that stays in place, and **Show latest** moves to a
revision only once its tree and locations both answer. Story pages keep
following their locations alone. Excluded: a new alert surface, changes to the
story-page reading, and the CI overview's own revision following.

Failures follow the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Local proof runs from a fully awake machine on AC power under
`caffeinate -s -i`, as the project's guidance requires for long macOS checks.

## Current decisions

- Carried from plan 841: the tree reads through `readProjectTree`
  ([authenticatedProjectBrowseRead.ts](../../../dashboard/src/authenticatedProjectBrowseRead.ts)),
  once per revision, in
  [useProjectTreeRead.tsx](../../../dashboard/src/useProjectTreeRead.tsx);
  `useIntentLocations` already holds the shown locations while the next
  revision is read.
- [Act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows):
  the Files toggle stays available while project files are read.
- The first-open pending and failed messages are the browser's existing
  `lead` in [IntentBrowser.tsx](../../../dashboard/src/IntentBrowser.tsx),
  which shows beside the tree while Files shows and above the reading
  otherwise (the phone-width placement CI repair 69cd4fc gave the
  no-locations explanation). They are not the page-panel `explanation` in
  `IntentPage.tsx`: that panel mounts its own `IntentCiStatus`, so the
  attempt's move of the CI view from the panel into the reading pane when
  the tree arrived reset its disclosure and focus (premise P3).
- Keep the pairing of tree and locations in project scope, because
  `useShownIntentLocations` also serves story pages.
- [Make production code directly testable](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support):
  the mounted tree answer stays inside the existing MakeMe builder
  [intentReadSourceTestData.ts](../../../dashboard/test-support/intentReadSourceTestData.ts),
  answering each revision's tree when the case's own locations read answers
  there (none for an unconfigured project), with no timer polling and no new
  wrapper.

## Attempt evidence

[attempt.patch](attempt.patch) is plan 841's slice 6 attempt at
b5e82660489d76194c2890f20f40c56886bb7899 (13.9 active minutes, not
converged). It still applies to 0633724b8. Reusable: its three new
`intent-revision-apply.spec.ts` cases (first open, Show latest hold and
failure, stale answer) and the pair-holding logic in its `useProjectReading`.
Rejected, with causes observed below: the page-panel pending explanation,
the Files toggle without its column, and the polling fixture.

## Decisive premises

Observed at 0633724b8 in this workspace, with the attempt applied as a
scratch edit and reverted.

| # | Premise | Observation | Result |
| --- | --- | --- | --- |
| P1 | The attempt's five read-recovery timeouts come from its fixture, not the product change. | `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run test:dashboard:frontend -- dashboard/frontend-tests/intent` with the attempt: 10 failed, 340 passed (5 read-recovery timeouts, 5 Files column cases). Same attempt with the trunk `intentReadSourceTestData.ts`: `intent-read-recovery.spec.ts` 5 passed. | Settled: the attempt's 5 ms `setTimeout` polling never advances under `onRecoveryClock`'s fake timers. |
| P2 | The five Files column failures (`intent-files-drawer` ×2, `intent-sessions-drawer`, `intent-sidebar-toggle`, `intent-story-views-narrow`) are the attempt's toggle without its column. | Same run: each fails at `intent-file-layout-page.ts:62`, `column()?.id` undefined where the toggle's `aria-controls` names `…-locations`. The attempt shows the toggle while pending but renders no browser. | Settled: slice 2 keeps the browser and its Files column mounted while pending. |
| P3 | The CI wall-time history E2E failures come from moving the CI view when the tree arrives. | `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR caffeinate -s -i npm run test:e2e -- e2e/intent/intent-ci-wall-time-history-later.spec.ts e2e/intent/intent-ci-wall-time-history-pending.spec.ts --workers=1`: baseline 2 runs passed; attempt failed in 3 of 4 runs (evidence list empty, focused link lost); attempt with its pending state returning the shown browser instead of the panel explanation passed 3 of 3. | Settled: the pending message must not swap the browser for the page panel. |
| P4 | The CI overview staying at the measured build in five E2E cases. | Full `npm run test:e2e -- e2e/intent` with the attempt: 105 passed, 2 failed (P3's cases only). `e2e/intent/intent-file-purpose-proof.spec.ts` with the attempt and 52cabf9c9's fixture wait reverted failed 2 of 3 runs ("Passed at a1b2c3d" where "Running at <A>" was expected); with the wait restored it passed 3 of 3. | Settled: a fixture race trunk fixed in 52cabf9c9 (trunk moved between the CI history and runs reads), independent of this story. |

## Outside-in proof

| Promise | Slice and observation |
| --- | --- |
| Project scope has one owner; nothing visible changes. | 1. Existing mounted project-browse, revision and story suites, and the project E2E journeys, unchanged and green. |
| On first open the page says project files are being read, keeps the Files toggle, its column and the CI view in place, a failed read retries, and on a phone the message and Retry stay above the reading. CI evidence opened meanwhile stays open with its focus when the tree arrives. | 2. Mount Project Intent with a held, failed and retried first tree, wide and at phone width, and with CI evidence opened and focused before the tree answers. |
| Path navigation keeps the shown pin. **Show latest** advances tree/settings/source coherently, explains deletion, and keeps the old usable reading if an inventory update is held or fails. A late answer cannot replace the reading. | 3. Hold and fail the new inventory answer while the new locations answer independently, then retry. Assert A stays usable until B's matching data is available, B reads exact replacement source, and a path removed at B has no stale text. Resolve an obsolete request after navigation and check that it cannot replace the active reading. |

## Slices

### 1. Give Project Intent's whole-project reading one owner

Type: Structure
Status: done
Proof: `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/intent`
and `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR caffeinate -s -i npm run test:e2e -- e2e/intent/intent-code-browse-projects.spec.ts e2e/intent/intent-file-purpose-proof.spec.ts e2e/intent/intent-project-visit-ci.spec.ts`
stay green.

Whether a reading is whole-project is decided today in `IntentPage.tsx` (the
tree read's revision, `wholeProject` for `intentBrowserSource`), in
`IntentBrowser.tsx` (`project !== undefined` for `leadInFiles`, the
Optimization Candidates `explanation` and `wholeProject`), and threaded
through `IntentSelectionReading.tsx` into `useIntentFileRead.ts`. Derive it
once in `IntentPage.tsx` as the project reading (absent on story pages) that
carries the tree, and have those consumers take it from there. Nothing
visible changes. Enables slice 2, which gives that one reading its pending
state. `IntentPage.tsx` is at 245 of 250 lines, so this slice keeps it under
the limit.

Delivered: `useProjectReading` (`dashboard/src/useProjectReading.ts`) is the
one owner, returning `ModeChoice & { tree }` in Project Intent and `undefined`
on story pages; `IntentBrowser` takes it as `project`, and
`intentBrowserSource` absorbed the story-result branch (`IntentPage.tsx` at
242 lines). Proof: mounted `dashboard/frontend-tests/intent` 347 passed; the
three project E2E specs 4 passed; independent refactor made no edits.

### 2. Show a pending project tree on first open

Type: Behavior
Status: done
Proof: New mounted cases in `intent-project-browse.spec.ts` (or the
attempt's first-open case in `intent-revision-apply.spec.ts`) for held,
failed and retried first trees, wide and at 390px with Files hidden, and
for CI evidence opened and focused before a held tree answers. Then
`env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/intent`
(covers the drawer, sidebar, narrow and read-recovery suites of P1 and P2) and
`env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR caffeinate -s -i npm run test:e2e -- e2e/intent`
(covers P3's wall-time history cases).

Before the first tree arrives, keep the browser, its Files column and the
reading pane with the CI view mounted; the tree lists no location-only files
and the lead says the project files are being read. A failed first read puts
its explanation and Retry in that lead, so it stays in view at phone width.
When the tree answers, the tree fills and the lead clears without remounting
the reading pane. The mounted builder answers each revision's tree from the
case's own locations read there, `[]` for an unconfigured project, with no
timers.

Delivered: `useProjectTreeRead` gives `ProjectTree.unread` and the
pending/failed lead; `IntentBrowser` renders both leads together beside the
tree or above the reading and omits the tree while unread, keeping the Files
column and reading pane mounted. Retry clears the old failure while it reads.
The builder answers `[]` for an unconfigured project and also notes the
locations the page already kept (`keptIntentLocationsAt`), since the page's
locations cache outlives a mounted case. Proof: focused 7 passed; mounted
intent 350 passed; `e2e/intent` 107 passed (proof record); consumer-selected
configuration, navigation and stories suites 180 passed. Slice 3 starts from
G3: a failed later-revision read currently hides the tree.

### 3. Keep the current reading until Show latest can replace it

Type: Behavior
Status: done
Proof: Extend the mounted revision-apply and source-recovery journeys with
held, failed, retried, and stale project inventory answers (the attempt's
two Show latest cases are the starting point). Then
`env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/intent`
and
`env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR caffeinate -s -i npm run test:e2e -- e2e/intent/intent-code-browse-projects.spec.ts e2e/intent/intent-file-purpose-proof.spec.ts e2e/intent/intent-project-visit-ci.spec.ts`.

Make the project reading advance when both the new inventory and its
settings have settled for the offered revision. Keep the last usable pair
with its own pin while either answer is unread or the inventory read fails,
and route inventory failure to `IntentRevisionNotice`'s failed update and
Retry. When the new pair arrives, re-evaluate the selection against the full
inventory, independent of the browsing filter. A retained path reads the new
blob, and a removed path clears its old source. The CI overview keeps
advancing to the observed trunk judgment independently of the browser.

Delivered: `useProjectReading` pairs the shown locations with
the tree read at their revision and keeps the last read pair, with its own
pin and a rebuilt `IntentRevisionNotice` (updating, or the tree failure as
its failed update with Retry), until the new pair is read;
`useShownIntentLocations` gains only an additive `follow` field. Proof:
focused revision-apply 4 passed; mounted intent 352 passed; the three
planned E2E specs plus three the consumer trace added 10 passed; backend
`intent-location-syntax` 3 passed. Learning: fixtures that spread a built
`IntentReadSource` and override `readLocations` bypass the builder's tree
answer, so reading the tree before its locations answer hangs them; the tree
is therefore read at the shown locations' revision.

## Plan review

Refinement ran on the provisional plan: a Structure slice for the
retrospective's one-owner input precedes the two Behaviors, and slice 2's
design changed from a page-panel explanation to the browser's lead (P2, P3).
No remaining slice-specific concern; all three slices fit the active-time
budget with their causes observed.

## Story obligations

### G1. Project tree shows only location files while its inventory is unread (first reported in plan 841 slice 3)
Reported: slice 2 — "While the paths are not read, the browser lists the configured location files; a failed read says why and offers Retry."
Story clause: "Before the first tree arrives it says the project files are being read instead of listing only the configured location files"
Disposition: proved by slice 2: dashboard/frontend-tests/intent/intent-project-browse.spec.ts cases "a failed first project tree read says why with Retry and lists no location file…" and "on a phone with Files hidden…" (alert text, no specs folder, Reading project files… after Retry, tree fills)

### G2. Project tree read failure and Retry are unobserved and use a new surface (first reported in plan 841 slice 3)
Reported: slice 3 — "Untested: the error message and Retry shown when the project tree read fails (in useProjectTreeRead.tsx)."
Story clause: "If the new inventory cannot be read, the current reading remains usable while the developer retries."
Disposition: proved by slice 3: dashboard/frontend-tests/intent/intent-revision-apply.spec.ts case "Show latest keeps the whole reading of A while B's project files fail or are read, then reads B" (notice reads the failed update for B, page stays at A with its reading, Retry reads B)

### G3. A failed later-revision tree read hides the tree (first reported in slice 2)
Reported: slice 2 — "Because unread is true on any failure, a failed read on a later revision now hides the tree. Before, it listed the location files under the alert."
Story clause: "If the new inventory cannot be read, the current reading remains usable while the developer retries."
Disposition: proved by slice 3: dashboard/frontend-tests/intent/intent-revision-apply.spec.ts case "Show latest keeps the whole reading of A while B's project files fail or are read, then reads B" (after B's failed tree read the tree-only README stays listed at A)
