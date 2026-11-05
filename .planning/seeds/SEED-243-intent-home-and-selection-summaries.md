---
id: SEED-243
status: active
planted: 2026-11-05
planted_during: Terry Yin's request to improve Intent's homepage, navigation, and entry and folder summaries
trigger_when: A developer reviews CI proof on Intent's homepage or selects an Intent entry, folder, or test file
scope: story
---

# SEED-243: Improve Intent home and selection summaries

<a id="improve-intent-home-and-selection-summaries"></a>

### Improve Intent home and selection summaries

**Identity:** SEED-243#improve-intent-home-and-selection-summaries
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/480-improve-intent-home-and-selection-summaries/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"b5c1de897f7bf7343e79a213573cf1ebaeb7d046db5202c1582314218439c1f2","plan":"1e21a7fef9512d41e1856a1f4d0527e4213d2f7031095fe22adb7bddd71a4bfb"}}
```

**Goal.** A developer reviewing product intent can compare
entries and their CI proof in tables, drill into entry and folder summaries
that include running time, and return to Intent's CI status homepage by
clicking the Intent tab again.

**Scope — required behavior.**

- **Homepage proof table.** Keep the Proof section and its existing CI wall
  time. Show the Intent entries currently listed beneath it as a table, with
  each entry's name/path, proof counts, test execution time, and completeness
  or gaps readable in aligned columns.
- **Return home through Intent.** Remove the **Return to CI status** button
  when an entry/section, folder, or test file is selected. Clicking the
  **Intent** reading tab again clears any selected entry, folder, or file and
  shows CI status, which is Intent's homepage. This also works when Intent
  is already the active tab. Clearing the browsing selection does not clear
  the selected story that determines which branch's CI status is shown.
  Direct keyboard activation with Enter or Space has the same effect;
  arrow/Home/End tab navigation retains its existing reading restoration.
  Opening a child or an Optimization Candidates target is navigation to that
  target, not a home activation.
- **Entry summary.** Selecting an Intent entry (the configured location or
  section) shows its overall/root summary, including running time, in the
  same style as the CI homepage's summaries. Also show a table of summaries
  for its immediate subfolders so the developer can compare them and drill
  down. Files directly in the entry remain visible and selectable.
- **Folder summary.** Selecting a folder shows that folder's summary,
  including running time, and a similar table with one summary row for every
  immediate child file and folder. A child folder's row summarizes that
  folder's contents; deeper descendants appear after drilling into it,
  rather than flattening the whole subtree into this table.
- **Consistent proof meaning.** Use the CI homepage's proof vocabulary and
  timing semantics for these summaries. Keep the run's CI wall time distinct
  from cumulative test execution time. Identify unavailable or partial proof
  and timing rather than treating missing evidence as zero or complete.
  Entry and folder rows must describe the selected scope and name the CI
  evidence they summarize.
- **Account for the whole CI contribution.** Preserve the homepage's
  existing entry totals, including checks outside the configured browsable
  inventory. Explain the contribution not represented by child rows instead
  of implying those rows reconcile the total. Folder summaries aggregate
  CI evidence by the selected folder's path; distinguish evidence outside
  the visible inventory there too. This changes neither the tree's include
  patterns nor what a runner counts.
- **Drill-down.** Child names in summary tables select the corresponding
  folder or file, retaining the existing tree navigation and file reading.

**Key examples.**

1. Open Intent with nothing selected. CI status is the homepage; its Proof
   section still shows CI wall time. Several Intent entries appear as table
   rows with comparable counts, execution time, and proof completeness.
2. Select an entry such as `dashboard/tests`. Its overall summary includes
   running time, and its immediate subfolder summaries appear in a table.
   Files directly in `dashboard/tests` can still be opened.
3. Select a folder containing two files and a nested folder. Its own summary
   includes running time, and the table lists those three immediate children
   with their summaries. Selecting the nested folder shows its own immediate
   children; selecting a file opens that file's reading.
4. With an entry, a nested folder, or a test file selected, there is no
   **Return to CI status** button. Click the already-active **Intent** tab:
   the browsing selection clears and the CI status homepage returns. A
   selected story continues to determine the judged branch.
5. A folder has no recorded timing, or some of its CI evidence is missing.
   Its summary explains that absence or incompleteness consistently with
   the homepage, without showing an invented zero or a complete result.
6. The CI `tests` entry contains a root shell check and a nested
   `tests/support` check, while the configured tree lists only root `.sh`
   files. Select `tests`: its overall counts retain both checks, its table
   lists the browsable children, and it explains the contribution outside
   that inventory. A legacy summary with no file breakdown keeps its entry
   totals and labels the child breakdown unavailable.
7. Read a file, switch to Optimization Candidates, and use arrow keys to
   return to Intent: the file remains selected. Directly activate Intent
   with Enter or Space: home appears. Opening a candidate's file target
   selects that file rather than clearing it. A background revision
   observation follows SEED-241's reading rules, not the home action.
8. The named CI evidence is an ancestor run or belongs to the selected story
   branch while the browser reads a different published revision. Select a
   folder: counts and time identify that evidence and do not imply that a
   newly added path has already passed. A measured zero remains zero; missing
   durations leave any available subtotal partial.

**Scope limits and deferred promises.** This story does not undertake historical
before/after timing comparisons, sorting or filtering tables, a new proof runner,
local proof generation, or changing file reading into a CI case-detail view.
[SEED-244](SEED-244-story-ci-timing-changes.md#compare-story-ci-timing-changes)
owns historical story timing comparisons. These are delivery boundaries, not
requirements to reject naturally supported cases.

**Investigation and challenge.** Observed in the preparation workspace at
`edc058a91be9b175c952415c1a9f69b8e9d51659` on 2026-11-05:

- The published CI summary retains entry/part counts and durations, but no
  child paths. Actual calls through `fragmentsFromOutcomes`,
  `fragmentFromPlaywrightRecord` and `summarize` with named child paths
  produced entry totals only. Their raw inputs already contain check paths
  or Playwright file locations and attempt durations. Extend this existing
  CI evidence pipeline to carry file aggregates; derive folders from those
  aggregates rather than trying to infer them from entry totals.
- The existing homepage distinguishes CI wall time from cumulative test
  execution time, and tests from checks. Playwright retries contribute their
  durations without counting as extra tests. Missing or ambiguous declared
  parts are uncounted gaps. Preserve these meanings at every summary scope;
  timing coverage also needs to identify missing durations within a part.
  Keep an available subtotal visibly partial; a missing duration differs
  from a measured zero.
- The `tests` CI entry includes nested `tests/support` checks, while the
  configured Intent tree includes only root `*.sh` files. The browsable
  inventory and the CI contribution are different sets. Terry chose to
  preserve the totals and explain the contribution outside the inventory.
- CI judgment may name an ancestor run, or a selected story branch, while
  the tree describes another published reading revision. A path match does
  not establish that today's source was verified. Every scope summary must
  retain the CI run/attempt/revision identity and identify incomplete or
  unavailable breakdowns, including older summaries without file evidence.
- The current selection summary still calls `IntentProofSummary`, which
  reads contained source files and combines local proof observations. Reuse
  the existing immediate-child ordering and drill-down, not that evidence
  acquisition. The requested summaries use CI evidence and need no bulk
  source reads. The seed's earlier description of local-proof removal is
  not evidence of this checkout's delivered behavior.
- The adapter answer limit is 64 KiB; GitHub summary extraction allows
  1 MiB. A toy object-row encoding for 744 dashboard spec paths alone was
  86,915 bytes. That is a sizing warning, not a measurement of a selected
  encoding. Existing adapter summaries remain useful when they lack a
  breakdown; do not silently truncate evidence or increase shared limits
  merely to fit a naive representation.

The strongest doubt is that aligned tables could meet the requested wording
while misleading the comparison: invisible CI contributions can make child
rows appear to explain totals they do not, and whole-minute formatting makes
many file durations indistinguishable. Preserve the evidence's units and
identity, account for incomplete contributions, and use enough display
precision to compare child scopes while preserving cumulative timing meaning.
No change to the story's goal or split is proposed.

Evidence sources: `src/skills/dough-test-optimization/scripts/ci-proof-fragments.mjs`,
`ci-proof-collect.mjs` and `ci-proof-contract.mjs` in that directory;
`dashboard/src/ciProof.ts`, `ciProofWording.ts`, `IntentProofSummary.tsx`,
`intentSummaryCoverage.ts`, and `.planning/open-dough.json`.
The fragment, collector and duration checks passed 17/17. Four named dashboard
journeys covering the homepage, CI status and folder controls passed. A
scratch no-op return-home action made the existing homepage test fail at its
expected CI-region observation; restoring the action made it pass. All
scratch product edits were reverted.

**UI and architecture.** A developer sees the evidence identity once for the
summary and comparable path, counts with their unit, cumulative execution
time, and completeness/gaps for the selected scope and its immediate
children. Child names retain the browser's ordering and navigation. Missing
evidence leaves the inventory usable; unavailable and partial evidence are
different from a measured zero. Selection changes or a late answer must not
attach another scope's or attempt's figures to the current selection.

The interaction choices with architectural consequences are:

| Choice | User effect and system consequence |
| --- | --- |
| Return home deliberately | Clear only browsing selection on direct click/Enter/Space activation, retaining the Selected story and its judged branch. Arrow/Home/End retain existing reading restoration. Keep the home action separate from programmatic “show Intent” calls used by child and Optimization Candidates links, which retain their target. |
| Compare CI-backed scopes | Extend the existing published CI artifact and its validation/read path with file aggregates and coverage, then derive folder rows. Older entry-only evidence stays readable with an unavailable breakdown. Preserve existing entry totals and explain evidence outside the browsable inventory. Avoid a second local-proof calculation or another authority for results. |

[ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
keeps the Selected story separate from browsing state, requires rebuildable
derived views, and distinguishes missing, outdated and conflicting evidence.
[ADR 0001 — Ubiquitous language](../../docs/adrs/0001-ubiquitous-language-accepted.md)
keeps observed CI results distinct from maintained verification procedures.
[ADR 0000 — Use ADRs](../../docs/adrs/0000-use-adrs-accepted.md)
leaves this product-intent design in the seed and plan rather than a new ADR.
The relevant index and in-file statuses agree; no supersession, conflict,
exception or metadata mismatch was found.

Reconcile navigation with the completed
[Intent loading and reading-state story](../done/SEED-241_load-intent-without-disruption-or-bulk-source-transfer.json):
an explicit click on Intent returns home, while background observations
should retain the reading place. Shared files alone establish no blocking
story dependency. SEED-241 owns background refresh, reading-revision retention
and perspective restoration. This story's explicit home action must coexist
with that work without resetting its revision or updating its story boundary.

**Decisions.** Terry accepted both recommendations on 2026-11-05: direct
activation returns home while arrow navigation preserves the reading place;
existing CI entry totals remain, with contributions outside the browsable
tree explained. No open goal or scope decision remains.

**Priority and scope.** Terry requested this as the first queued backlog
item, captured directly on `main` and synchronized with `origin`.
This preparation continues into slice planning; product execution requires
its own instruction.
