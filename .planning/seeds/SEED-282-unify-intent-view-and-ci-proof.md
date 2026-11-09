---
id: SEED-282
status: active
planted: 2026-11-09
scope: story
---

# Unify the Intent view and CI proof

<a id="unify-intent-view-and-ci-proof"></a>

### Unify the Intent view and CI proof

**Identity:** SEED-282#unify-intent-view-and-ci-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/547-unify-intent-view-and-ci-proof/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"331d360f046f4cefb05d0fddb3c04c326e1e813259e5d2ab96031c78521b3974","plan":"6750e0e0b75d38199c2055070ee7140b0e63c32cf405343c43b1c6c39bad8052"}}
```

**Goal.** Developers can use the same Intent layout with or without a selected
story, keep their place when moving between project and story evidence, and
read CI comparisons the same way as they drill into test evidence. They can
interpret the evidence without relearning the page or mistaking project trunk
evidence for a selected story's comparison.

**Scope.**

- Use one Intent page implementation and layout for Project Intent and the
  selected story's views. Model them as the same Intent perspective, with
  optional selected-story context. Use the delivered story view as the
  reference for the persistent header, tab row, and content arrangement.
  When selection is empty, show **No story selected** in the header and offer
  the project's **CI status** and **Optimization Candidates** views. With a
  story selected, retain its title, actions, and applicable **CI comparison**,
  **Changed tests**, and **Intent coverage** views.
- Keep Project Intent reachable while a story is selected. Its project
  evidence is clearly identified, and **Back to selected story** restores the
  story view and reading place. A visit does not clear Selected story or
  replace either context's file, Purpose/Proof choice, expansion, scroll, or
  Hide files choice. Clearing selection returns to project CI status; a new
  selection starts at the story's CI comparison, as today.
- Share the story-level CI comparison model and presentation with location
  and folder **Summary** and individual file **Proof** in **Changed tests**.
  Use the same active comparison label, Baseline / Branch / Landed timing
  columns, signed changes from Baseline, relative marks, and **Show %**
  wherever evidence supports them. Keep observed-build framing and the same
  explanations for unused endpoints, partial timing, and unavailable proof.
- Keep precise file and folder times, including sub-second changes; the
  story's overall and entry comparison retains its whole-second wording.
  Share the scale rule rather than scanning unseen descendants: each
  displayed comparison uses one symmetric scale for its own figures and
  rows, at least 50% and widened to the largest relative change shown. Faster
  extends left, slower right. **Show %** is one preference in the story's
  reading place, initially off, shared across comparison scopes; it changes
  labels without changing values, marks, or order.
- Sort timing rows by the quantity shown: Baseline by measured time, Branch
  and Landed by signed change from Baseline. Rows lacking a comparable change
  follow comparable rows in either direction; ties retain the supplied
  order, and the existing outside row stays last. Counts and Change keep
  their existing meanings. Preserve the sort when drilling down.
- Preserve keyboard navigation and focus return, narrow and zoomed reading,
  independent tree/reader scrolling, and usable CI while locations load or
  fail. Align maintained Intent documentation with the delivered behavior.

**Required restrictions.** A relative mark or percentage requires a positive
measured Baseline and comparable measured after timing; otherwise it would
imply a ratio the evidence cannot establish. A measured zero Baseline still
permits a signed change. An added scope keeps its measured time without
claiming a change. Gaps keep their reason rather than becoming zero. Project
Intent always uses project evidence even while a story remains selected, so a
visit cannot misattribute that evidence to the story.

**Scope limits.** This increment does not change endpoint discovery, CI proof
collection or schema, revision/freshness/retry policy, count units, or the
Intent coverage assessment. It adds no project equivalent of Changed tests or
Intent coverage. [SEED-281](SEED-281-distinguish-test-cases-and-files-in-ci-proof.md#distinguish-test-cases-and-files-in-ci-proof)
owns distinguishing test cases and test files; it is not a prerequisite here.

**Key examples.**

- No story is selected → open Intent → **No story selected**, project tabs,
  and trunk CI use the same persistent header/tab/content arrangement as a
  selected story. Select a story → its title and applicable views appear;
  clear selection → project CI status returns in that arrangement.
- A story file's Proof is open, with a kept tree and scroll → visit Project
  Intent, browse a project test, and return → the story stayed selected,
  project evidence used published project text and trunk CI, and the story's
  file, Proof, and reading position return. Keyboard focus reaches the
  control that goes back in either direction.
- **CI comparison** says **Baseline compared with Landed** → open a location
  Summary, a folder Summary, then a file's Proof → each names the same active
  endpoints and uses the shared signed-change presentation. A file changing
  from 340 ms to 410 ms shows **+70 ms**, with a slower mark and **+21%** when
  Show % is on. Returning to the story comparison keeps that preference;
  each scope uses the same scale rule for the evidence it displays.
- One row changes 600 s → 660 s (+60 s), another 60 s → 90 s (+30 s), and
  another 300 s → 280 s (−20 s) → sort Branch or Landed ascending → the
  −20 s, +30 s, +60 s rows appear in that order, independent of measured
  durations or percentages; added, partial, and unavailable changes follow.
- Landed is still running or has no usable proof → drill into Summary and
  Proof → the same Branch (or Taken Trunk Mode's Provisional) comparison and
  unused-Landed explanation apply. A renamed file uses its old Baseline
  path. A gap stays explained; a zero Baseline gives a signed change without
  a ratio; a file without breakdown never acquires invented timing.
- Locations are unavailable, or the viewport is narrow/zoomed → use the
  shared page → its header and applicable views remain reachable by keyboard,
  CI keeps its own result or recovery, and the reading pane remains usable.

**UI.** The header, views, revision notice, and reading area keep a stable
order. Project and story are evidence contexts within Intent, not separate
perspectives. The active context and its evidence are explicit even during a
project visit with a retained story selection. Project views and story views
keep their applicable names and actions rather than showing inapplicable
tabs. Comparison tables use signed words and relative marks as the story
comparison does; tree cues keep their current meaning. Keyboard tab choice,
direct home activation, file toggling, and return controls keep their current
behavior in the shared presentation.

**Architecture.** Follow
[ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts):
Selected story belongs to the page; selecting project evidence does not clear
it. One page implementation does not merge the two evidence owners or disposable
reading places. Reuse their current boundaries and the shared Intent browser,
tabs, scope comparison, proof tables, and sorting; move shared presentation
responsibility rather than adding a parallel model or another CI read path.
This follows [ADR 0002, principles 2 and 5](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
and [ADR 0001's dashboard vocabulary](../../docs/adrs/0001-ubiquitous-language-accepted.md).
The existing architecture supports the outcome; no Accepted-ADR conflict or
new durable decision is required. Precise drill-down wording preserves useful
evidence, and per-display scaling avoids a new full-tree evidence scan.

**Maintained references.** [Intent](../../docs/dashboard-development-intent.md),
[story views](../../docs/dashboard-development-intent-story.md), and
[CI timing comparison](../../docs/dashboard-development-intent-ci-comparison.md).
