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

<a id="review-standalone-done-work"></a>

### Reopen completed ad hoc work and its follow-ups under one identity

**Identity:** SEED-420#review-standalone-done-work
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-420#review-standalone-done-work","dependencies":[{"supplier":{"identity":"SEED-418#attribute-every-workflow-session-record","href":"seeds/SEED-418-review-published-session-changes.md#attribute-every-workflow-session-record"},"implementation":"Published session records for ad hoc Land and ad hoc story follow-ups, carrying the associated story identity","rationale":"The Done story is published with the session's record and read across machines through it. Building it first would define the record's story association and the ad hoc Land publication path twice.","condition":"An ad hoc session's Land and an ad hoc story follow-up's Land each publish a versioned session record on trunk that carries the UUID, close time, comparisons and story identity when associated, and the Dashboard reads it from another clone.","state":"satisfied","resolution":{"revision":"c546ff771b47b42f549a153cbbef4604bb89560d","path":".planning/seeds/SEED-418-review-published-session-changes.md#attribute-every-workflow-session-record","summary":"Satisfied: a Dashboard-launched ad hoc Land and an ad hoc story follow-up Land each publish a versioned record with UUID, close time, comparisons and the associated story identity, and the Dashboard reads it from another clone. Delivered at before-cleanup c546ff771 and integrated on main at 3dbaff36c. Proof: Land closes (Distribution/tests/skills/dough-land/session-record-publication.test.mjs, session-close-resume.test.mjs), Trunk Mode wrap-up (dough-story-wrap-up/trunk-closure-session-record*.test.mjs read from a default-branch-only clone), Story Branch wrap-up (story-branch-session-record.test.mjs), refinement and ad hoc follow-up Lands (dough-story-refinement/preparation-*session-record-land.test.mjs), and another machine reviewing each range (e2e/sessions/recently-done-published-sessions.spec.ts).\nCondition satisfied: An ad hoc session's Land and an ad hoc story follow-up's Land each publish a versioned session record on trunk that carries the UUID, close time, comparisons and story identity when associated, and the Dashboard reads it from another clone.\nAccepted integration: 3dbaff36c0b21730ff23ba5948b5199522b0f103 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/756-reopen-completed-ad-hoc-work/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"7d52617075cb0e0be64ce12922313b8af12355998760de9122f3dfadcf5d690d","plan":"9c32af159260f67e24598d51c27d615c8aff0e17f5645f647e81c8268d7a2257"}}
```

**Goal.** A developer can return to completed ad hoc work as a story, from
any machine once the work is published. Each ad hoc session marked Done
with no story gets a new Done story, and the session is attached to it.
Later follow-ups join that story, so the Board, Recent stories and the
shared Intent review treat the work like any
other Done story.

**Scope.**

- Marking an ad hoc session Done with no story creates a Done story and
  attaches the session to it. The original session's UUID gives the story's
  identity, so a repeated Done, a lost response or a second writer closing
  the same session all reach the same story. The story's title comes from
  the session. A session that already has a story keeps that association
  and the story's current status. No new story is created for it.
- A follow-up started from that Done story gets its own session UUID and
  belongs to the same story. Marking it Done leaves one card, the story at
  Done, with the follow-up's session added under it.
- The session's Land publishes the Done story with that session's record
  through the workflow's authorized publication path. The Done story
  follows the same done-record window and catalog as any other Done
  story. Records carry the original UUID, close time, story identity
  and published comparisons. Dashboard Done stays local-only: a session
  marked Done without a published Land has a Done story on this machine
  only. It appears under Recently done and its review states that there is
  no published comparison.
- In Recently done sessions, choosing a new ad hoc Done row selects its
  Done story, as a linked row does. Intent opens the story on the original
  session's published comparison. Follow-up sessions keep their own
  comparisons.
- Standalone records from before this change keep their existing
  references and still open their own comparison. Attach an older session
  to a story only when a published record or a launch record names that
  story. Never infer the association from timing or file overlap. When a
  session's records name different stories, show the conflict and leave the
  association for the developer to resolve. Never choose one silently.
- Extend the Distribution work item identity contract to include this
  session-derived story identity. Seed allocation and the existing
  `SEED-NNN#anchor` identities are unchanged.

Out of scope: selecting individual sessions in the review
([SEED-418](SEED-418-review-published-session-changes.md#select-a-story-session-for-review)),
the review destination itself, follow-up context choices
([SEED-415](SEED-415-choose-clear-follow-up-context.md)) and card cues for
open follow-ups
([SEED-395](SEED-395-richer-done-follow-up-card-cues.md)). This story also
does not migrate older standalone records in bulk.

**Key examples.**

- Ad hoc session `A` lands and is marked Done. A Done story named for `A`'s
  UUID appears with `A` attached. On another clone after fetching, choosing
  the same Done story opens `A`'s published changes in Intent. A changed
  file opens against that recorded comparison even after trunk advances.
- `A`'s Done is repeated after a lost response, and a quiet completion
  report and a manual Done race on the same session. One story and one
  record of `A`, with its original close time, result.
- Follow up from that story starts session `B` with a new UUID. `B` lands
  and is marked Done. The Board still shows one Done card, now listing `A`
  and `B`.
- A follow-up of a Taken story is marked Done. It stays under that story,
  the story stays Taken, and no new story is created.
- Ad hoc session `C` is marked Done without landing. A Done story for `C`
  appears only on this machine. Its review states that no published
  comparison exists.
- A retained standalone record from before the change still opens its own
  comparison. A session whose records name two different stories shows the
  conflict instead of choosing one.

**Architecture.** [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
already decides that Done creates a story only for a session with none.
It also decides that follow-ups keep their own session IDs under that story.
The durable story is a done record beside the backlog, published with the
session record that SEED-418's
workflow session records (SEED-418#attribute-every-workflow-session-record, done)
define. This story adds the session-derived identity and the attachment,
generalizing the current split into linked and standalone Done rows. It does
not add a third kind of Done row.

**Effort hypothesis:** L, medium confidence. The critical uncertainty is
reconciling workflow publication and local Done across machines.

<a id="compare-story-contributions"></a>

### Compare a story branch with and without incoming trunk changes

**Identity:** SEED-420#compare-story-contributions
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/790-compare-story-contributions/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"4a951e3d4aa09ea4f4cdcd9de8f362a9e0bbccd35e2bcd6052922545b9dea2f9","plan":"a744ba215417f6b60c692dc558af78a08d02e00a0e1350d17374eeafac4c23b5"}}
```

**Goal.** A developer reviewing a story in Intent can see what the story
branch contributed and inspect the incoming trunk changes it picked up when
those changes matter to the review.

**Scope.** Intent opens a Story Branch Mode comparison with the story's
contribution. The **Include merged changes** checkbox widens that comparison
to the net diff across the same branch interval. A cumulative interval
starts at the established story start. A selected commit interval starts
at its first selected item's parent. Both views end at the same selected
revision or snapshot, with the existing uncommitted choice still in effect.
The file list, folder counts, header, file diff and note context follow the
displayed comparison. Keep the selected file when it is still in the
comparison and clear its diff when it drops out.

The contribution includes the branch's own merge edits. Flag files whose
resolution mixes branch and trunk work and use their actual diff baselines.
Offer the checkbox only when the history establishes a branch interval and
its comparison choices. Explain missing history or attribution when it
prevents a comparison, since a raw diff could otherwise be mistaken for
isolated work. Captured landed runs and published Trunk Mode session ranges
keep their recorded endpoints. Surface the recorded shared-checkout warning
with the affected range.

The story covers the existing Taken workspace, commit-range and Done
completion selections. Session selection and combining session ranges
belong to [SEED-418](SEED-418-review-published-session-changes.md).
[Comparison-specific CI proof](#read-proof-for-the-comparison) is separate.
Until then, the existing whole-story evidence keeps its provenance when the
reviewer chooses a wider comparison.

**Key examples**

- A developer opens the Done landing-record story after its worktree is
  retired. The handoff spec is absent from the attributed diff from
  `44a059b` to `daf6997`. Checking **Include merged changes** reveals the
  other story's edit from the recorded story start `f7190a3b1` to the same
  completion. The folder summary and file diff include it. Unchecking clears
  the incoming-only file's diff if it was selected.
- A developer selects a live branch interval spanning a trunk merge. The
  contribution shows a branch edit made in the merge and flags a conflict
  resolved with both sides' changes. Widening adds a clean incoming-only
  path. A later trunk commit outside the selected interval never appears.
- A developer reviews a direct-trunk session with a recorded range marked
  as shared checkout. The review shows that range and its warning. A recorded
  range without that marker has no shared-checkout warning.

**Effort hypothesis:** M, medium confidence, using existing Git attribution.

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
already owns per-range evidence for that selection. The story-only view in
[compare-story-contributions](#compare-story-contributions) is also out of
scope. Its base tree has no build of its own, so under the rule above it
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
