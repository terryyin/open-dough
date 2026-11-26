---
id: SEED-420
status: active
planted: 2026-11-21
planted_during: Review of the SEED-413 file-count comparison and unified Intent design
trigger_when: selected from the product backlog
scope: story and project review in Intent
---

# SEED-420 — Review code and proof in the same Intent workspace

A developer reviewing a story should be able to follow one revision and path
from source to proof and back. Filtering today's Changed tests table alone
would hide one symptom while leaving the two review destinations and their
different baselines in place. Keep the current review, history, notes and CI
evidence capabilities in one workspace. [Design direction](../../docs/dashboard-ux-ui-north-star.md#review-in-intent)
and [dashboard ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships).
The [interactive design example](SEED-420-unified-intent-review/preview.html)
uses illustrative sessions. Narrow the window to see the icon-only bookmark.

Keep the existing owners for [published session records and session selection](SEED-418-review-published-session-changes.md),
[sidebar behavior](https://github.com/terryyin/open-dough/blob/e4a350d35ee26dfe98375118520523dd1ca648f6/.planning/seeds/SEED-417-use-sidebars-consistently-across-the-dashboard.md),
[Board actions](SEED-416-put-story-actions-in-the-comment-toolbar.md) and
[outgoing follow-up context](https://github.com/terryyin/open-dough/blob/9d70e5741139db0443e0cf37f16c0881c7b1b55f/.planning/seeds/SEED-415-choose-clear-follow-up-context.md#choose-clear-follow-up-context).

The annotated review on 2026-11-25 used the Done story
`SEED-413#trim-follow-up-context-e2e-journeys` with a file diff open. It showed
an icon-only banner, stacked comparison details and actions, page-wide story
tabs, and separate Intent sections and outside files. The current entry
points are [IntentPage](../../dashboard/src/IntentPage.tsx),
[IntentHeader](../../dashboard/src/IntentHeader.tsx), and
[IntentBrowserTree](../../dashboard/src/IntentBrowserTree.tsx).

<a id="browse-the-project-at-a-revision"></a>

### Read the whole repository and its CI from Project Intent

**Identity:** SEED-420#browse-the-project-at-a-revision
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-420#browse-the-project-at-a-revision","dependencies":[{"supplier":{"identity":"SEED-420#recognize-intent-folders-and-read-proof","href":"seeds/SEED-420-unified-intent-review.md#recognize-intent-folders-and-read-proof"},"implementation":"The shared selectable folder tree and Summary navigation in Project Intent","rationale":"The current Project Intent browser uses separate location accordions. Its folder-cue supplier moves Project Intent into the shared repository tree and retires those accordions. Building or hooking up a second Project Intent browser would take that supplier's integration and duplicate selection and Summary ownership.","condition":"Project Intent uses the same selectable repository folder tree as story review, with separate disclosure and selection, persistent Intent root and collapsed ancestor cues, and root and nested Intent folder Summary navigation. Its location-group accordion has been retired.","state":"satisfied","resolution":{"revision":"af4986541deba01a4177f66c9f6233ebc075a369","path":".planning/seeds/SEED-420-unified-intent-review.md#recognize-intent-folders-and-read-proof","summary":"IntentBrowserTree renders IntentFileTree for both Project Intent and story review. The independent Project disclosure cases in intent-gherkin-groups.spec.ts observe root and collapsed-ancestor cues and two open roots at once. intent-entry-folder-summaries.spec.ts observes independent selection, root and nested Summary, and the ancestor's path reading. The Project CI Summary E2E case checks scoped proof from a collected artifact. The separate Intent location-group and header components were removed. The filter supplier remains separately pending.\nCondition satisfied: Project Intent uses the same selectable repository folder tree as story review, with separate disclosure and selection, persistent Intent root and collapsed ancestor cues, and root and nested Intent folder Summary navigation. Its location-group accordion has been retired.\nAccepted integration: 5d5bc2d1bee86d198bef0c0bcfad38c587bb23cb on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-420#filter-review-files","href":"seeds/SEED-420-unified-intent-review.md#filter-review-files"},"implementation":"Project-scoped Intent only filtering of the shared repository inventory","rationale":"The installed filter is a story-only comparison choice. Project browsing needs to pass its full path inventory into the shared filter and preserve one reading-place choice and one Intent membership rule. Adding the project choice here would take that supplier's explicitly planned Project Intent behavior.","condition":"Project Intent offers the persisted Intent only choice, initially off when no choice is kept, applies the shared location admission to the displayed inventory, and omits Changes only. The shared filter distinguishes a hidden path from a missing path and explains when no locations are configured.","state":"satisfied","resolution":{"revision":"a40805a4e6914dce18caf003e66042c92f3dd630","path":".planning/seeds/SEED-420-unified-intent-review.md#filter-review-files","summary":"Project Intent offers Intent only (kept in the reading place's own whole-project arrangement, off when none is kept) and omits Changes only; Intent only applies the shared location admission (intentAdmits over locationSelectsRepositoryPath) to the displayed shared tree; a hidden open path stays open without the not-in-revision notice; with no configured locations the existing notice explains the empty scope. Proved by intent-story-intent-only.spec.ts (whole project keeps Intent only across leaving Intent; open production file stays open), intent-story-changes-no-locations.spec.ts, intent-story-changes-only.spec.ts (hidden untouched file not called missing) and intent-story-repository-tree.spec.ts, all passing on the merged state before integration.\nCondition satisfied: Project Intent offers the persisted Intent only choice, initially off when no choice is kept, applies the shared location admission to the displayed inventory, and omits Changes only. The shared filter distinguishes a hidden path from a missing path and explains when no locations are configured.\nAccepted integration: c51f8636a795269fa1210eb5402c77121ff4f490 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/841-browse-the-project-at-a-revision/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"39ba6e2920e4660a81a21c5223e4ddaf545861fe6844e54cb7be1f904bfce190","plan":"5daa78c97034cd113cc685898e8483940eeffac6dec9e63c47296865dad4898a"}}
```

**Goal.** A developer can move from the project's measured CI results to any
file's source at the published revision shown in Intent, follow the nearby
code and tests, and return to the CI overview in the same workspace.

**Scope.** With no story selected, start at the existing project CI overview.
Reuse the shared selectable repository tree and its Intent folder cues. List
the published repository's tracked paths by default, with **Intent only**
available and **Changes only** omitted. Select regular folders for their
path and configured Intent folders for their Summary. A repository with no
configured Intent locations still has its full tree and file reading.

Keep navigation pinned to the displayed revision. The tree, its Intent
locations, and selected source use that revision. A newer observed revision
is offered through the existing **Show latest** action. Apply an update when
the new browsing data is available, and preserve the existing retry and
missing-path explanations. Keep source and CI provenance distinct. Tests
keep **Purpose** and **Proof** with the measured build identified. Other
files show their source, and Proof explains when no file-level result is
available. **Home** returns to the project's CI changes and measured builds
regardless of the browsing filter.

**Key examples.**

- At published revision A with a newer revision B available, open a production
  file, a neighboring document, and a configured test. Their source comes
  from A. The test's Proof names the measured build, and the production
  file's Proof explains the absence of a file-level result. **Home** restores
  the same project CI overview.
- With a configured test and a nonmatching file in the same directory,
  **Intent only** keeps the test and the folder's Intent cue. Clearing it
  restores the other file. With no configured locations, the default tree
  still opens a tracked document and **Intent only** explains the empty scope.
- When **Show latest** moves from A to B, a retained path reads B's version
  and a removed path gets the existing missing-path explanation. If the
  new inventory cannot be read, the current reading remains usable while
  the developer retries.

**Deferred.** An arbitrary revision picker, new CI runs, and migration of
the existing published Intent and attribution readers to local Git remain
outside this increment.

**Effort hypothesis:** M, medium confidence. This expands the inventory beyond
test locations while preserving revision-pinned reads.

<a id="share-completed-intent-review-response-watching"></a>

### Share completed Intent review response watching across E2E specs

**Identity:** SEED-420#share-completed-intent-review-response-watching
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** Dashboard test maintainers can change how completed story-review
responses are captured and parsed in one place while keeping each journey's
review evidence explicit.

**Scope.** Reuse the response-watching and parsing pattern in
[`completedReviewRequests.ts`](../../dashboard/test-support/support/completedReviewRequests.ts)
for the repeated historical story-review watchers in these four E2E specs:

- [`intent-done-completion-provenance`](../../e2e/intent/intent-done-completion-provenance.spec.ts)
- [`intent-done-prior-execution`](../../e2e/intent/intent-done-prior-execution.spec.ts)
- [`intent-done-retained-landing`](../../e2e/intent/intent-done-retained-landing.spec.ts)
- [`intent-story-becomes-done`](../../e2e/intent/intent-story-becomes-done.spec.ts)

**Acceptance.** All four specs use the shared capture for historical review
responses and keep their existing assertions. The watcher is armed before the
action that triggers the request and matches the story-review endpoint with
`historical=true`. Keep the Taken response observation in the transition
journey and the unavailable-history observations in the affected specs.
Run the four specs through the existing E2E entry point.

## Order and scope

The [product backlog](../PRODUCT-BACKLOG.md#backlog-list) carries the priority
of the annotated review outcomes. The story header and Home can improve with
the comparisons already available. The shared story tree gives the filtering
and folder cues one inventory, and project browsing applies the same reading
to the published project revision. Session subset attribution, Structure,
and generating new paired CI runs remain separate directions.
