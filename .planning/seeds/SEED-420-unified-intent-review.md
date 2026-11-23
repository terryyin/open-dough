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

<a id="read-proof-for-the-comparison"></a>

### Read CI proof for the selected comparison

**Identity:** SEED-420#read-proof-for-the-comparison
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/791-read-ci-proof-for-the-selected-comparison/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"104802e7239241fea950d7813fb778ab0813f7d940ffc9409693464ab8309bd5","plan":"4056545ae782c7851c27dffecf197fbc2a330c6e1066595362786a2bc0f0a228"}}
```

**Goal.** A reviewer reading a story in Intent can tell what CI measured for
the comparison they chose, not only for the whole story. For each side of
the selected comparison they see the measured revision and run, and whether
those runs support a before-and-after delta for the selected work. They
can then judge a narrower slice of the story's proof without reading CI by
hand.

**Scope.**

- Intent's CI proof follows Intent's **Compare** selection: a Taken
  story's commit range, a Done story's captured landed run, or the default
  comparison. The endpoint table, the Changes counts and a selected scope's
  Summary and file Proof all read the same two measured builds. They no
  longer say that they describe the whole story. Intent coverage is not CI
  proof, so it keeps that note. A captured run that recorded no revisions
  also keeps the note, and its proof stays on the whole story.
- Each side names its measured revision and run. The start side uses the
  newest completed build at or before the comparison's start. The end side
  uses the build at its end or the nearest measured ancestor after the
  start. Each side states how the build relates to the requested
  revision, in today's selection words: exact, ancestor with N revisions
  without a build, equivalent or later trunk build.
- A delta, such as **1 → 9** cases, appears only when both sides have a
  build and the end-side build includes some of the selected work.
  Otherwise the side that ran is still shown, for example **9 passed at
  completion**. The reason for the missing delta is given in place: no
  matching baseline, or no build includes the selected changes.
- Uncommitted workspace changes have no CI. When they are included, the
  proof says that they were not measured.
- The default comparison keeps today's Baseline, Branch and Landed rules
  and wording. Home's project and story CI overview are unchanged, so a
  failure in an untouched test stays visible there.

Out of scope: proof for several selected sessions with disjoint ranges.
[SEED-418](SEED-418-review-published-session-changes.md#review-selected-sessions-together)
already owns per-range evidence for that selection. The story-only view of a branch
is also out of scope. Its base tree has no build of its own, so under the rule above it
shows the completion side with a missing matching baseline. This story
makes no delivery commitment for that view. Running new or paired CI builds
is out of scope. This story reads existing runs.

**Key examples.**

- A Done story's default comparison shows the same Baseline, Branch and
  Landed builds and counts as before this change.
- In the landing-record story's full comparison, baseline build `8ecbf43`
  ran one case of the handoff spec and completion `daf6997` ran nine. The
  proof names both runs and shows **1 → 9**.
  [Baseline run](https://github.com/terryyin/open-dough/actions/runs/44839032104) ·
  [Completion run](https://github.com/terryyin/open-dough/actions/runs/44861394227)
- A Taken story's later commit range is chosen. The range's start has no
  build of its own. The start side names the nearest earlier build as an
  ancestor with N revisions without a build. The end side names its exact
  build, and the delta is shown with both revisions named.
- A range whose commits were never built, with no later ancestor build after
  its start, shows the start side's build. It says that no build includes
  the selected changes, and shows no delta.
- A captured landed run is chosen. The proof switches to that run's start
  and end builds. Returning to the default restores the story's comparison.
- All changes, including uncommitted changes, shows the last commit's build
  and says that the uncommitted changes were not measured.

**Effort hypothesis:** M, medium confidence. Existing endpoint lookups
generalize from the story's start and result to the comparison's start and
end. The comparison read must carry the selection.

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
