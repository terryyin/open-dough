---
id: SEED-420
status: active
planted: 2026-11-21
planted_during: Review of the SEED-413 file-count comparison and unified Intent design
trigger_when: selected from the product backlog
scope: nine stories
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
[sidebar behavior](SEED-417-use-sidebars-consistently-across-the-dashboard.md),
[Board actions](SEED-416-put-story-actions-in-the-comment-toolbar.md) and
[outgoing follow-up context](SEED-415-choose-clear-follow-up-context.md).
The effort bands below are relative hypotheses. Each section delivers a
usable change, independently of the later polish.

<a id="compare-story-contributions"></a>

### Compare a story branch with and without incoming trunk changes

**Identity:** SEED-420#compare-story-contributions
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

A reviewer can inspect the branch's own contribution by default and widen the
same comparison to include merged changes. Retain edits made while resolving
the branch's own merge and identify inseparable changes. The control applies
only to branch comparisons with the necessary history. In Trunk Mode, show
the recorded ranges and identify shared-checkout ambiguity.

In the landing-record story, the handoff spec is byte-identical in the
attributed baseline tree `44a059b` and completion `daf6997`. Widening to the
full interval reveals the separate handoff story's edit. The selected file,
diff, folder summary and displayed range agree on the choice.

**Effort hypothesis:** M, medium confidence, using existing Git attribution.

<a id="read-proof-for-the-comparison"></a>

### Read CI proof for the selected comparison

**Identity:** SEED-420#read-proof-for-the-comparison
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

A reviewer can tell what ran at the selected revision and whether the available
CI runs support a delta for the selected work. Display the measured revision
and run for each side, including an ancestor or a later build. For a combined
session selection with disjoint ranges, show supported observations per range
and say when a combined delta is unavailable. This story reads existing proof.

For the handoff spec, the baseline build `8ecbf43` ran one case and the
completion `daf6997` ran nine. The full-range view can show **1 → 9**. The
story-only view can show **9 passed at completion** and the missing matching
baseline. A failure in an untouched test remains visible in the CI overview.
[Baseline run](https://github.com/terryyin/open-dough/actions/runs/44839032104) · [Completion run](https://github.com/terryyin/open-dough/actions/runs/44861394227)

**Effort hypothesis:** M, medium confidence. The meaningful comparison is
between equivalent proof units on revisions that isolate the contribution.

<a id="choose-review-scope"></a>

### Choose the whole project or a recent story from the bookmark

**Identity:** SEED-420#choose-review-scope
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

A developer uses the banner bookmark to switch stories or choose **Whole
project**. Clearing the story preserves its recent-list entry. On mobile the
closed control shows only the bookmark icon, with a touch target and accessible
name conveying its scope. At desktop width it can show the current scope.

Repair the reported failure to open the menu while the selected story is
already visible. Verify Board and Intent: the first click on a visible story
opens the list, the first click with the story offscreen reveals it, and the
next click opens the list. Selecting another project's recent story navigates
to it. Exercise keyboard activation as well as touch.

**Effort hypothesis:** S, medium confidence. Reproduce the visibility
regression at the affected viewport before changing its detection.

<a id="filter-review-files"></a>

### Filter the file browser by Intent and by changes

**Identity:** SEED-420#filter-review-files
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

A developer sees the same files in the tree and folder list for the selected
revision and filters. **Intent only** means configured Intent locations.
**Changes only** means added, modified, removed or renamed paths in the chosen
comparison. With both enabled, a changed spec appears and an untouched spec
and changed production file are hidden. Turning off either filter widens the
selection along that dimension. Preserve historical locations, deletion and
rename navigation, and the full comparison's evidence on Overview.

Home precedes both filters in the sidebar header and returns to the current
overview. Opening and hiding the sidebar follows SEED-417. A snapshot with
no comparison offers Intent filtering and explains why Changes only is
unavailable.

**Effort hypothesis:** M, medium confidence, given the current story overlay.

<a id="browse-the-project-at-a-revision"></a>

### Read the whole repository and its CI from Project Intent

**Identity:** SEED-420#browse-the-project-at-a-revision
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

With no story selected, a developer starts at the project's existing CI
overview and can open a production file, test, or document at the named
revision. Read a test's Purpose and Proof or a production file's source.
Explain missing file-level evidence. Moving to another path keeps the named
revision. Returning to Home restores the project's CI changes and measured
builds. Project browsing also works for a repository with no Intent locations.

**Effort hypothesis:** M, medium confidence. This expands the inventory beyond
test locations while preserving revision-pinned reads.

## Order and scope

Prioritize readable, retry-safe session identity and existing record-format
work before designs that depend on those facts. The shared review and its
proof baseline are the first opportunity to replay the reported discrepancy.
The bookmark repair travels with scope selection at ordinary priority. Whole
project browsing can be deferred while the existing story review remains useful. Structure and generating new paired CI runs are separate directions.
