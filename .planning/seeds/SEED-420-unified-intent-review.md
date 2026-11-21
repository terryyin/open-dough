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
{"schemaVersion":1,"identity":"SEED-420#review-standalone-done-work","dependencies":[{"supplier":{"identity":"SEED-418#attribute-every-workflow-session-record","href":"seeds/SEED-418-review-published-session-changes.md#attribute-every-workflow-session-record"},"implementation":"Published session records for ad hoc Land and ad hoc story follow-ups, carrying the associated story identity","rationale":"The Done story is published with the session's record and read across machines through it. Building it first would define the record's story association and the ad hoc Land publication path twice.","condition":"An ad hoc session's Land and an ad hoc story follow-up's Land each publish a versioned session record on trunk that carries the UUID, close time, comparisons and story identity when associated, and the Dashboard reads it from another clone.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/756-reopen-completed-ad-hoc-work/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ca95967715c47174aa8d7ecdbf27d7dceb1313c8da50865b723318f01cc2e69e","plan":"593d31baf36cf1ed44907b3e890190e868281ef545c9b52f04e1c2a0e4d45bb5"}}
```

**Goal.** A developer can return to completed ad hoc work as a story, from
any machine once the work is published. Each ad hoc session marked Done
with no story gets a new Done story, and the session is attached to it.
Later follow-ups join that story, so the Board, Recent stories and the
[shared Intent review](#route-review-changes-to-intent) treat the work like any
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
  Done story, as a linked row does.
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
  UUID appears with `A` attached. On another clone after fetching, the same
  story and `A`'s published comparison appear.
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
[workflow session records](SEED-418-review-published-session-changes.md#attribute-every-workflow-session-record)
define. This story adds the session-derived identity and the attachment,
generalizing the current split into linked and standalone Done rows. It does
not add a third kind of Done row.

**Effort hypothesis:** L, medium confidence. The critical uncertainty is
reconciling workflow publication and local Done across machines.

<a id="open-review-in-intent"></a>

### Read every file a story changed in Intent

**Identity:** SEED-420#open-review-in-intent
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/759-read-every-changed-file-in-intent/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e2846f0afd3789904856983d69ca602b6f8de18bc5cb9e06cd40fb32a4b2c671","plan":"9dbd97a002241b323f9c6e6300ba9130657859e3100e8f29029936f45b315f8f"}}
```

This is the first of three stories that together open a story's change
review in Intent. The second
[moves the comparison choices](#choose-story-comparison-in-intent) and the
third [sends **Review changes** there](#route-review-changes-to-intent).

**Goal.** A developer reading a selected story in Intent sees every file the
story changed, production code beside tests, and reads each diff next to its
Proof. Today Intent lists only the changed tests in its Intent locations and
counts the rest, so the production code needs a second review in the Side
panel.

**Scope.**

- **Changes** replaces **Changed tests** as the name of the selected story's
  file view.
- **Changes** lists every file the story's comparison changed. A file in an
  Intent location stays in that location's tree. Any other changed file,
  such as production code, a plan or a document, is listed after the
  locations under its repository folders, with the same rows, change
  markers and folder controls.
- A listed file's Purpose is its diff, with the diff notes and Follow up
  that Intent's diffs offer today. Proof reads a test file's CI evidence as
  today and says when a file has no file-level CI evidence. Going from a
  diff to Proof or to CI comparison and back returns to the same file and
  line, as it does today for a changed test.
- **Selected story only** narrows the tree to the changed files, including
  those outside Intent locations.
- The header's count of changed files outside Intent locations goes, since
  the files are listed.
- A project with no configured Intent locations still lists the selected
  story's changed files under their repository folders.
- The comparison is the story's default one, as Intent reads it today. A
  Taken story with no workspace on this machine, several worktrees holding
  its claim, or a failed read keeps today's explanation and Retry.

Out of scope: the comparison choices and **Review changes** on a card, which
the next two stories own. Also the
[Intent only and Changes only filters, the Home control and the repository
inventory](#filter-review-files), and
[sidebar behavior](SEED-417-use-sidebars-consistently-across-the-dashboard.md).
The selected file and line stay presentation state and are not part of a
link.

**Key examples.**

- A Taken story's worktree changed `dashboard/server/landing.ts`, the spec
  `dashboard/backend-tests/review/landing.spec.ts` in an Intent location, and
  its `PLAN.md`. The story's **Changes** view lists the spec in its location
  and the other two after the locations. Selecting `landing.ts` shows its
  diff. No count of outside files shows in the header.
- The developer scrolls the spec's diff to a changed case, opens Proof,
  reads its CI evidence and returns to Purpose. The diff is at the same
  line. Proof of `landing.ts` says that it has no file-level CI evidence.
- **Selected story only** leaves the spec, `landing.ts` and `PLAN.md`. A
  story that changed only product code lists that code and says that no
  test files in Intent locations changed.
- A Done story whose worktree is retired lists every file of its published
  completion, production code included.
- In a project with no Intent locations, the selected story's **Changes**
  lists its changed files and still says that no locations are configured.

**UI.** The story's Intent keeps its three views in the order CI comparison,
**Changes**, Intent coverage. Files outside Intent locations follow the
locations in the same tree under one heading that says they are outside
Intent locations.

**Architecture.** [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships)
makes Intent the shared context for reviewing, with a scope of project,
optional story, comparison and path. The tree becomes one join of the Intent
locations with all changed files, replacing the count of files it left out.
No Accepted decision conflicts.

**Effort hypothesis:** M, medium confidence. The diff, the Proof round trip
and the default comparison already exist in Intent.

<a id="choose-story-comparison-in-intent"></a>

### Choose what a story's review compares in Intent

**Identity:** SEED-420#choose-story-comparison-in-intent
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/760-choose-story-comparison-in-intent/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a3b58c95cb3489f4d68489e15849ae8aac2bc8a72cd9c134046c2e408c0e56e5","plan":"20c4e9c13174fa34094872bf05497dbb88309424b16822476ffe5c7e624f7c99"}}
```

Split from [Read every file a story changed in Intent](#open-review-in-intent).
[Plan](../slice-plans/760-choose-story-comparison-in-intent/PLAN.md).

**Goal.** A developer reviewing a story in Intent chooses what is compared
without leaving it. The Side panel review no longer holds a choice of a
story's comparison that Intent lacks, so
[Review changes can send a story to Intent](#route-review-changes-to-intent)
without losing one.

**Scope.**

- Intent offers the choices the Side panel review offers a story, with their
  present defaults and availability: **All changes** of the worktree, with
  **Include uncommitted changes** while it holds some; **Commits**, a
  contiguous range of the story's commits and its uncommitted changes chosen
  by its two ends; **Published completion**; and **Landed runs** with the
  choice among captured runs. **Refresh** reads the worktree again and keeps
  the choice.
- A choice changes the listed changed files, their change markers and every
  diff together. The header names what is compared: its two revisions, or
  for a commit range its count and its two ends, as the Side panel review
  names them. A selected file that is still changed stays selected and shows
  its new diff. Unchanged files keep the source Intent reads today.
- CI comparison, Proof and Intent coverage keep reading the story's default
  comparison and keep naming the build measured. While another comparison is
  chosen, each says that it describes the whole story. A Done story's
  locations stay at its landed revision.
- Switching among the story's views keeps the choice. Selecting a story,
  including the same story again later, opens on its default comparison.
- A chosen comparison that cannot be read, such as a commit range or a
  landed run whose objects are missing, is explained where Intent explains
  the story's comparison, with Retry for a failed read and the other choices
  still offered. It never reads as a story without changes. The default
  comparison's gaps (no workspace on this machine, several worktrees holding
  the claim, a failed read) keep today's explanations.

Out of scope: the Sessions picker and session runs of a standalone session
([SEED-418](SEED-418-review-published-session-changes.md#select-a-story-session-for-review)),
[including merged changes](#compare-story-contributions) and
[proof for the chosen comparison](#read-proof-for-the-comparison). The chosen
comparison stays presentation state and is not part of a link.

**Key examples.**

- A Taken story's worktree has three commits and an uncommitted edit to
  `landing.ts`. Intent opens on all changes with uncommitted changes
  included, as today. The developer chooses **Commits** and picks the two
  oldest commits. Only the files those commits changed are listed, each diff
  starts from the commit before them, and the header says two commits from
  the oldest to the second. CI comparison says that it describes the whole
  story.
- Back on **All changes**, clearing **Include uncommitted changes** removes
  `landing.ts`, which only the uncommitted edit changed. A new commit made
  in the worktree appears after **Refresh**, and the check stays cleared.
- A Done story whose worktree is retired opens on its published completion,
  with the completion revision named. Choosing a captured landed run lists
  that run's changes and names its tree. Its locations and CI views stay on
  the story's landed result.
- The developer reads `landing.spec.ts` within a two-commit range, switches
  to CI comparison and back, and finds the same range and file. After
  selecting another story and returning, the story opens on all changes.
- A chosen landed run's objects are missing. Intent explains that its
  changes cannot be read and still offers **Published completion**.

**UI.** A visible **Compare** choice sits beside the compared-revisions line
in the Intent header, as the [design direction](../../docs/dashboard-ux-ui-north-star.md#review-in-intent)
places Compare in the review's toolbar. The header stays uncollapsible, as
it has been since the story disclosure was removed. The controls a choice
needs appear only with it: the uncommitted check with **All changes**, the
story's commits to pick the range's ends with **Commits**, and the run
choice with **Landed runs**.

**Architecture.** Intent's story scope gains one chosen comparison, read
through the Side panel review's selection and comparison owners rather than
a second selection model. The lens keeps two reads apart: the story's
default comparison, which CI comparison, Proof, Intent coverage and a Done
story's landed revision read today, and the chosen comparison, which the
file view, its diffs and the header read. The choice is presentation state
under [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#spatial-presentation-remains-derived),
and Intent remains the comparison's shared reading context as the ADR's
[domain concepts](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships)
define. No Accepted decision conflicts.

**Effort hypothesis:** M, low confidence. The choices and their reads exist
in the Side panel review. Separating the default from the chosen comparison
in Intent's lens is new.

<a id="route-review-changes-to-intent"></a>

### Open Review changes on a Story card in Intent

**Identity:** SEED-420#route-review-changes-to-intent
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-420#route-review-changes-to-intent","dependencies":[{"supplier":{"identity":"SEED-420#open-review-in-intent","href":"seeds/SEED-420-unified-intent-review.md#open-review-in-intent"},"implementation":"Intent's Changes view listing every file a story's comparison changed","rationale":"Sending Review changes to Intent before it lists production code would remove the only review of those files. Shared direction cannot avoid that, since the card has one destination.","condition":"A selected story's Changes view in Intent lists every changed file, inside and outside Intent locations, each with its diff.","state":"waiting"},{"supplier":{"identity":"SEED-420#choose-story-comparison-in-intent","href":"seeds/SEED-420-unified-intent-review.md#choose-story-comparison-in-intent"},"implementation":"The story review's comparison choices offered in Intent","rationale":"Sending Review changes to Intent before it offers commits, uncommitted changes and landed runs would remove those choices for a story. The card has one destination, so both cannot stay reachable.","condition":"In Intent a developer chooses a story's worktree commits, uncommitted changes, landed run or published completion, and the tree and diffs follow the choice.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

Split from [Read every file a story changed in Intent](#open-review-in-intent)
with a [provisional plan](../slice-plans/761-route-review-changes-to-intent/PLAN.md).

**Goal.** A story has one review destination. **Review changes** on a Story
card opens Intent on that story's changes instead of a separate review in
the Side panel.

**Scope.**

- **Review changes** on a Story card, wherever a card offers it today, makes
  that story the Selected story, shows Intent and opens the story's
  **Changes** view on the first changed file. The Side panel keeps what it
  showed, so a terminal stays beside the review. Returning to Development
  shows the Board with the story still selected.
- Entering Intent with the story already selected opens CI comparison as
  today. Its **Changes** view shows the same files and comparison.
- Story notes, the Done card's review state, Intent coverage and story links
  keep working as they do today.
- **Review changes** on an ad hoc session entry or a published session entry
  still opens the Side panel review. These have no story for Intent to
  select until
  [completed ad hoc work becomes a Done story](#review-standalone-done-work).

**Key examples.**

- The Side panel shows a Taken story's terminal. **Review changes** on its
  card shows Intent on that story's **Changes** with the first changed
  file's diff open. The terminal is still in the Side panel.
- With the same story selected, the developer switches to Intent from the
  banner. CI comparison shows first. **Changes** lists the same files.
- A Taken story has no workspace on this machine. Its card offers no
  **Review changes**, as today.
- **Review changes** on a retained ad hoc Done entry opens that session's
  comparison in the Side panel, as today.

**Architecture.** The Side panel review remains for reviewed work without a
story and shares the reader and diff with Intent. Opening a review sets the
Selected story, as [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts)
defines.

**Effort hypothesis:** L, low confidence. The review journeys reach the
review through one page object that moves with it. Their number is the cost.

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
The review opens in Intent through three stories in order: every changed
file, then the comparison choices, then **Review changes** on the card. Each
of the first two is useful while the Side panel review remains.
The bookmark repair travels with scope selection at ordinary priority. Whole
project browsing can be deferred while story review, once delivered, remains
useful. Structure and generating new paired CI runs are separate directions.
