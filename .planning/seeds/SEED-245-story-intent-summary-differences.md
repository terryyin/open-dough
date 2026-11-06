---
id: SEED-245
status: active
planted: 2026-11-05
planted_during: Terry Yin's request for the next story after selected-story CI timing comparisons, showing start-to-end differences at Intent entry, folder, and file levels
trigger_when: A developer selects a story, especially a done story, and browses Intent entries, folders, or files
scope: story
---

# SEED-245: Compare a story's Intent entry, folder, and file summaries

<a id="compare-story-intent-entry-folder-and-file-summaries"></a>

### Compare a story's Intent entry, folder, and file summaries

**Identity:** SEED-245#compare-story-intent-entry-folder-and-file-summaries
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-245#compare-story-intent-entry-folder-and-file-summaries","dependencies":[{"supplier":{"identity":"SEED-244#compare-story-ci-timing-changes","href":"done/SEED-244_compare-story-ci-timing-changes.json"},"implementation":"SEED-245 applies the scope comparison to entry and folder Summaries and the file reading, adds count differences and change markers, and reuses SEED-244's endpoints, read and homepage comparison rows without copying them.","rationale":"SEED-244 is Taken and building the story CI comparison endpoints, their authenticated read and the homepage comparison rows. Starting SEED-245 first would build a second endpoint resolution and comparison read beside that work in progress, which reconciliation could only undo.","condition":"SEED-244's story CI comparison endpoints (baseline, branch result and landed result), their authenticated read with each endpoint's proof summary, and the homepage entry comparison rows are published on main.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/482-compare-story-intent-summaries/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"cb0b483f54f1b6351ac65fb018917f061356fc7098574632c3a50a76f4ee7fd3","plan":"1d0689142bef71913d159d35ee337dcf732fa89212e638f5be9a13b63aeb8037"}}
```

**Goal.** A developer reviewing a selected story, especially a done one, can
drill from an Intent entry to its folders and test files and see, at each
scope, how test execution time and proof counts changed across the same
builds that Intent's CI status homepage compares for that story: the
pre-story baseline, the final branch result and the landed result. The rows
under each scope show where the scope's change sits, and which of those rows
the story itself changed, so the developer can tell where to look. Like the
homepage, the result shows changes the story's builds observed. It does not
claim the story caused them.

**Scope — required behavior.**

- **Same endpoints as the homepage.** Every figure comes from the story's CI
  comparison endpoints delivered by
  [SEED-244](../done/SEED-244_compare-story-ci-timing-changes.json):
  baseline, branch result and landed result, each with its build identity,
  selection rule, failed-build label, and not-applicable, not-yet-landed,
  running or unavailable state. The figures at a scope are that scope's
  figures in each endpoint's own CI proof summary. A summary never mixes one
  endpoint's total with another endpoint's file figures, and never uses a
  build the homepage does not name. A Taken story's comparison is labelled
  provisional, as on the homepage.
- **Entry and folder Summary.** When a story is selected, the Summary of a
  selected entry or folder compares its own row, each immediate folder and
  file row, and the **Not in the rows above** row. Each row shows its
  execution time at the baseline, then at branch and landed, each with its
  signed difference from the baseline, the same columns and the same
  order the homepage comparison uses. Drilling into a child keeps the
  selected story and its endpoints. With no story selected, the Summary is
  unchanged.
- **Proof counts.** Each compared row also shows its counted results (tests
  or checks) at each endpoint, with signed differences. Its outcome counts
  and parts completeness stay readable for one build, the same build the
  homepage chooses (landed, else branch). The homepage's entry rows show
  the same count differences, so the entry row reads the same on the
  homepage and in that entry's Summary.
- **File summary.** When a story is selected, a selected test file shows a
  compact summary of the same comparison for that file above its existing
  Purpose: source, or the story's diff when the story changed it. The
  reading of source or diff stays primary and unchanged. With no story
  selected, the file reading is unchanged.
- **The story's own changes are marked.** Rows of files and folders the
  story changed carry the change kind the tree already shows: added,
  modified, removed or renamed. A row the story did not change still shows
  its observed difference, which can only come from something other than
  that row's own change, such as other code or runner noise.
- **Added, removed and renamed paths.** A file the story added has no
  baseline figure and is shown as added, with no difference. A removed file
  has no result figure and is shown as removed. A renamed file takes its
  baseline figure from its old path, even when the old path lies in another
  entry, and names that path. A folder's figures at each endpoint are
  summed over whatever that endpoint's summary holds under its path, so a
  file present at only one endpoint counts in the folder's total at that
  endpoint.
- **Precision.** Summary comparisons keep the Summary's existing precise
  durations (`340 ms`, `12.5 s`, `4 min 5 s`) for both values and
  differences, so a file's sub-second change is not rounded away. The
  homepage keeps its own whole-second comparison precision.
- **Honest gaps at each scope.** A value is shown only where that
  endpoint's summary measures it; missing evidence is never a measured zero
  or no change. Each of these has its own explanation:
  - an endpoint with no summary, an expired summary or a running build,
    reusing the homepage's explanation once for the whole Summary;
  - an endpoint summary that has no file breakdown for the scope's entry,
    or no durations at all, which leaves its folder and file values
    unavailable while the entry's own totals still compare;
  - a partial value at one endpoint, because of an untimed test, a missing
    or ambiguous part, or a part without a file breakdown, shown with what
    it lacks, and with no signed difference from a complete value;
  - a path present at neither compared build, such as a file added to trunk
    after the story, shown as not in the compared builds.
  A gap at one scope or endpoint does not hide supported differences at
  another.
- **Done stories stay tied to their own builds.** The comparison at every
  scope stays the same after the story branch and agent profile are removed
  and later work lands on trunk. Selecting another story replaces the
  comparison at every scope. An answer for an earlier selection never
  renders.
- **Observed, not attributed.** Each Summary and file summary carries the
  homepage's statement that differences compare single builds and do not
  establish the story as their cause.

**Scope limits and deferred promises.** These are delivery boundaries. They
are not reasons to reject cases the rules above already handle.

- **No new evidence or storage.** No new CI read, adapter contract or stored
  copy beyond SEED-244's. Availability follows the provider's retention; this
  repository keeps proof summaries for 30 days.
- **No variance band or significance judgment**, as in SEED-244.
- **No file figures without a story.** A test file's CI figures without a
  selected story, and comparisons in Review changes or story cards, are not
  part of this story.
- **No sorting or filtering by difference.** Rows keep the tree's order.

**Key examples.**

1. **Entry drill-down.** A done story is selected, and `dashboard/tests` is
   selected in Intent. Its Summary row shows 2 h 14 min 43 s at the baseline,
   then 2 h 21 min 46 s **+7 min 3 s** on the branch and 2 h 27 min 48 s
   **+13 min 5 s** landed, and 2,090, then 2,092 **+2** tests. The same
   figures show on the homepage. Its child rows show each folder's and
   file's own values and differences, and the story's two changed files are
   marked as modified.
2. **File level.** Inside a nested folder, a file went from 10 s to 14 s.
   Its row and its file summary show 10 s, then 14 s **+4 s**. A faster
   sibling shows a negative difference. A file going from 340 ms to 410 ms
   shows **+70 ms**, not +0 s.
3. **Branch and landed stay apart.** A Story Branch story's branch build and
   landing build differ. Every row shows both, each against the same
   baseline, from the same builds the homepage names. A Trunk Mode story's
   branch column is not applicable at every scope.
4. **Added, removed, renamed.** The story added `a.spec.ts`, removed
   `b.spec.ts` and renamed `c.spec.ts` from `tests/c.sh`. `a.spec.ts` shows
   as added with no difference, `b.spec.ts` as removed, and the renamed file
   compares its baseline at `tests/c.sh`, which it names. A file another
   story added to trunk later shows as not in the compared builds.
5. **Gaps at one scope.** The baseline summary predates file breakdowns and
   durations, as summaries from 2026-11-04 do. The entry row compares its
   test counts and explains that the baseline recorded no execution time.
   Its folder and file rows show branch and landed values and explain that
   the baseline has no file breakdown. A landed build still running leaves
   the branch comparison readable and says the landed build is running.
6. **After cleanup.** The same done story is selected after its branch is
   deleted and newer work landed. Every scope shows the same comparison.
   Selecting another story replaces it at the current scope.

**Investigation and challenge.** Observed in this preparation workspace at
`a3b24e5d4` on 2026-11-06.

- **Facts.**
  - SEED-244 is Taken and has published no implementation: its branch
    `cursor/compare-a-story-s-ci-and-entry-timing-changes` holds no commit
    beyond `main`. The endpoints, `intent=ci-comparison` and the homepage
    comparison rows this story reuses do not exist yet.
  - The latest `main` summary (run 42089732004 attempt 1, `ab65cea84`)
    has a file breakdown with `durationMs` for every file in all three
    entries: 744, 190 and 296 files. The file durations sum exactly to each
    entry's `durationMs`. A few files record a measured `0`.
  - Today a selected file shows no CI figures at all
    (`IntentFileReading.tsx`). Entry and folder Summaries read the one judged
    branch's proof (`IntentScopeProof.tsx`, `IntentCiEvidence.tsx`), which a
    done story does not have.
  - Scope figures are already summed by path over a summary's file
    breakdown, independent of the tree (`ciScopeProof.ts`). The story
    overlay already gives each changed file its kind and a rename's old path
    (`intentStoryOverlay.ts`).
- **Strongest doubt: single-build noise is larger at file level.** A file
  the story never touched can change by many seconds between two builds,
  because of runner load or other code. Without the change markers, a
  reader could take the largest row difference as the story's cost. That is
  why rows the story changed are marked, and why the observed-not-attributed
  statement repeats at every scope. A variance reference stays deferred.
- **Rounding.** Comparing files at the homepage's whole-second precision
  would show most sub-second changes as `+0 s`, which reads as no change.
  The Summary's existing precision avoids that.

**UI and architecture.** The user is a developer reviewing a selected story
who has already read the homepage comparison and drills in to find where a
difference sits. At each scope they first see which builds are compared,
named once as on the homepage. Then they scan rows for large differences,
check whether the story changed that row, and open the row to go deeper. At a
file, the comparison stays one compact block so the diff stays the main
reading. Sketch, for agreement on content and not on layout:

```text
Summary  dashboard/tests/intent          (observed builds; differences are not attributed to the story)
Baseline d1e1ddff6 · Branch 1cbd59f6d · Landed 9cce03246   (as on the homepage)

Scope              Baseline        Branch                Landed                Tests
intent/            2 min 10 s      2 min 31 s  +21 s     2 min 40 s  +30 s     40 → 42 +2
  ci/  modified    1 min 2 s       1 min 20 s  +18 s     1 min 25 s  +23 s     20 → 22 +2
  a.spec.ts added  —               4.2 s       added     4.4 s       added     — → 2
  b.spec.ts        8.1 s           8.4 s       +300 ms   8.0 s       -100 ms   3 → 3
Not in the rows above ...
```

Architecture, as design for planning:

- **One comparison, many scopes.** The new concept is a **scope comparison**:
  for one path, its figures at each of SEED-244's endpoints. Each endpoint's
  figures come from the existing scope rule (`scopeFiguresOf` and
  `outsideOf` in `ciScopeProof.ts`) applied to that endpoint's summary,
  with a rename's old path used at the baseline. The homepage entry rows are
  the same concept at entry scope, so SEED-244's per-entry comparison and
  this story's folder and file rows share one rule rather than two.
- **No new read.** The endpoints and their three proof summaries are what
  SEED-244 reads for the homepage. Intent's one CI evidence owner holds them
  for the selected story, so drilling and returning home ask CI nothing
  again, as the Summary does today.
- **Applicable decisions.**
  [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  requires a rebuildable derived view and treats missing evidence as gaps;
  the Selected story scopes the comparison while browsing stays at the
  published revision.
  [ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md) keeps
  observed CI results distinct from procedures. No conflict was found.
- **Prerequisite.** This story cannot start before SEED-244 publishes its
  comparison endpoints, their read and the homepage comparison rows.
  Building them here would create a second copy beside SEED-244's work in
  progress. The dependency is recorded in this story's agreement.

**Priority and scope.** Terry requested this immediately after SEED-244 as
the third queued story, on `main` and synchronized with `origin`.
