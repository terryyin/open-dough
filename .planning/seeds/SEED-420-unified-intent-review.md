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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/855-keep-project-reading-until-show-latest/PLAN.md","assessment":"not-ready","reasons":["Slices 1 and 2 are provisional from a non-converged attempt and need slice-plan refinement against the attempt evidence and the retrospective's refinement input before execution.","The cause of the CI overview no longer advancing to the observed trunk judgment in five E2E cases is unobserved; compare the attempt with a baseline before planning slice 2's proof."],"basis":{"document":"a78e68abd8659c4c7f902a3db994fa0fc0fb16f0ac2a26e698f17de46c0b3289","plan":"c594ee177d177c4a665eda539d9c95056f92179bd5aa8b806c75be08c051335d"}}
```
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-420#keep-project-reading-until-show-latest","dependencies":[{"supplier":{"identity":"SEED-420#browse-the-project-at-a-revision","href":"seeds/SEED-420-unified-intent-review.md#browse-the-project-at-a-revision"},"implementation":"Project Intent's whole-project tree and file reads at the shown revision","rationale":"This story holds and replaces the project reading that the supplier introduces. Its reading hooks, project tree read and mounted fixtures exist only on the supplier's execution branch until it lands, so starting earlier would rebuild or conflict with that unlanded work.","condition":"Project Intent lists every tracked path at the shown revision through the project tree read, reads selected source through the project file read, and its mounted fixtures answer the project tree.","state":"waiting"}]}
```

Split during execution from SEED-420#browse-the-project-at-a-revision, which
delivered whole-project browsing at a pinned revision.

**Goal.** A developer browsing the whole project in Project Intent keeps a
complete, usable reading while newer browsing data is read, and moves to the
newer revision only when its tree and settings can replace the reading.

**Scope.** With no story selected, Project Intent shows the full tracked
tree only once it is read. Before the first tree arrives it says the project
files are being read instead of listing only the configured location files,
and the Files toggle stays available. **Show latest** applies an update when
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
  failed read offers Retry.

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
