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

<a id="keep-project-reading-until-show-latest"></a>

### Keep the project reading until Show latest can replace it

**Identity:** SEED-420#keep-project-reading-until-show-latest
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/855-keep-project-reading-until-show-latest/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"9c6acd1e88bf5d1ac7f30d59d47451523a0a46c26cda6a42756e71b54117480b","plan":"bfc2662072c23d0f35292bbf42a251bedd705a94896ee49ec59d23c0e4c4a777"}}
```
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-420#keep-project-reading-until-show-latest","dependencies":[{"supplier":{"identity":"SEED-420#browse-the-project-at-a-revision","href":"seeds/SEED-420-unified-intent-review.md#browse-the-project-at-a-revision"},"implementation":"Project Intent's whole-project tree and file reads at the shown revision","rationale":"This story holds and replaces the project reading that the supplier introduces. Its reading hooks, project tree read and mounted fixtures exist only on the supplier's execution branch until it lands, so starting earlier would rebuild or conflict with that unlanded work.","condition":"Project Intent lists every tracked path at the shown revision through the project tree read, reads selected source through the project file read, and its mounted fixtures answer the project tree.","state":"satisfied","resolution":{"revision":"33c048704c68d68815d8e8eb40e2cd695375c573","path":".planning/seeds/SEED-420-unified-intent-review.md#browse-the-project-at-a-revision","summary":"Plan 841 slices 1-5 are done at the before-cleanup revision and integrated on main at 51a2dc8de. Project Intent lists every tracked path at the shown revision through the project tree read (dashboard/server/projectBrowseRead.ts, dashboard/src/useProjectTreeRead.tsx; proved by dashboard/backend-tests/intent/authenticated-read-project-browse.spec.ts and dashboard/frontend-tests/intent/intent-project-browse.spec.ts), reads selected source through the project file read (useIntentFileRead.ts; Intent Coverage at 7624ed6e7 caught routing it back to the upstream read in e2e/intent/intent-recorded-purpose-read.spec.ts), and mounted fixtures answer the project tree through makeMe.anIntentReadSource (dashboard/test-support/intentReadSourceTestData.ts). CI passed on b5e826604 and on the before-cleanup revision 33c048704.\nCondition satisfied: Project Intent lists every tracked path at the shown revision through the project tree read, reads selected source through the project file read, and its mounted fixtures answer the project tree.\nCondition satisfied: Project Intent lists every tracked path at the shown revision through the project tree read, reads selected source through the project file read, and its mounted fixtures answer the project tree.\nAccepted integration: 51a2dc8de3e9370624aecedb0061d4ad89197dfa on origin/refs/heads/main."}}]}
```

Split during execution from SEED-420#browse-the-project-at-a-revision, which
delivered whole-project browsing at a pinned revision.

**Goal.** A developer browsing the whole project in Project Intent keeps a
complete, usable reading while newer browsing data is read, and moves to the
newer revision only when its tree and settings can replace the reading.

**Scope.** With no story selected, Project Intent shows the full tracked
tree only once it is read. Before the first tree arrives it says the project
files are being read instead of listing only the configured location files,
and the Files toggle, its column and the project CI view stay in place while
they are read. **Show latest** applies an update when
the new tree and its Intent locations are both available for that revision,
and preserves the existing retry and missing-path explanations. A failed
tree read uses the existing failed-update notice or first-open retry, not a
separate alert. A late answer for a revision the reading has moved past
cannot replace the reading.

**Key examples.**

- When **Show latest** moves from A to B, a retained path reads B's version
  and a removed path gets the existing missing-path explanation. If the
  new inventory cannot be read, the current reading remains usable while
  the developer retries.
- On first open, before the project tree is read, the page says the project
  files are being read rather than showing only the location files, and a
  failed read offers Retry. On a phone with Files hidden, that message and
  Retry stay in view above the reading.
- A developer who opened the CI history evidence while the project files are
  read keeps it open, with focus where it was, when the tree arrives.

**Effort hypothesis:** M, medium confidence. The first attempt showed the
hold spans two reading hooks, mounted fixtures, focus and fake-timer cases,
and the CI overview's advance to the observed trunk.

## Order and scope

The [product backlog](../PRODUCT-BACKLOG.md#backlog-list) carries the priority
of the annotated review outcomes. The story header and Home can improve with
the comparisons already available. The shared story tree gives the filtering
and folder cues one inventory, and project browsing applies the same reading
to the published project revision. Session subset attribution, Structure,
and generating new paired CI runs remain separate directions.
