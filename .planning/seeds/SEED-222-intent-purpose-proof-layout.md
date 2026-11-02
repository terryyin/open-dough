---
id: SEED-222
status: active
planted: 2026-11-02
planted_during: Terry Yin's request for Purpose and Proof tabs with a remembered split-panel toggle
trigger_when: Developers switch between reading Purpose or Proof and reviewing both together in Intent
scope: story
---

# Read Purpose and Proof in tabs or remembered split panels

<a id="intent-purpose-proof-layout"></a>

### Read Purpose and Proof in tabs or remembered split panels

**Identity:** SEED-222#intent-purpose-proof-layout
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/449-intent-purpose-proof-layout/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"afe5ce27b33418397c56edd5e372243d532f76be03913637b1819bb892d095a1","plan":"dd0d93b449b029542a8bd94eb13a96b05bfc8d779e3ca83d3e3950a254d209a0"}}
```

**For / why:** Developers reviewing product intent can give Purpose or Proof
the reading space they need, or compare both together, without repeatedly
restoring their preferred layout. Today a selected file shows Purpose stacked
above Proof in one scrolling pane, so reading Proof means scrolling past the
whole test source.

**Goal:** A developer reading a file in Intent sees **Purpose** and **Proof**
as two tabs sharing the reading area, and can turn on **Side by side** to see
both together as two panels. The browser remembers that choice, so the
developer finds their layout again after navigating, reloading, or switching
project. This delivered the North Star's former Purpose and Proof layouts,
now explained by [Development and Intent](../../docs/dashboard-development-intent.md).

**Scope:**

- When a file is selected, or nothing is selected yet, the reading area offers
  the **Purpose** and **Proof** tabs and, beside them, a **Side by side**
  toggle. With the toggle off, the chosen tab's content fills the reading
  area; **Purpose** is chosen when Intent opens. The chosen tab stays while
  the developer selects other files. Tabs use Intent's existing tab keyboard
  behavior (arrow keys, Home, End), which never reaches page-wide project
  cycling; the toggle is a keyboard-operable button showing its pressed state.
- With the toggle on, Purpose and Proof appear together as two panels, each
  scrolling on its own, so reading a long source keeps Proof in view. Where
  the reading area is too narrow for two readable columns, the two panels
  stack, Purpose above Proof, while the toggle stays on; widening returns
  them side by side. Turning the toggle off restores the tabs with the
  previously chosen tab.
- The browser remembers the toggle choice across perspective switches,
  reloads, and later visits, as one choice for every project. Without a
  remembered choice, or when the browser keeps no preferences, Intent starts
  with tabs, and a choice made then lasts for the page.
- Switching layouts or tabs never changes the selection: the selected file,
  its positioned case, the Intent tab (Intent, Optimization Candidates, and
  any later tab), and any selected story stay as they were, and both layouts
  show the same file read and proof.
- Opening a recorded file from **Optimization Candidates** shows its Purpose,
  positioned on its case, in either layout: with tabs, Purpose is chosen.

**Scope limits (deferred promises):**

- Keeping the chosen Purpose/Proof tab across leaving Intent or reloading;
  only the Side by side choice is remembered.
- Layout choices for a location or folder Summary, which keeps its single
  reading pane with no tabs or toggle; selecting a file brings the layout back.
- Resizing the panels, collapsing the locations tree, or linking the panels'
  scrolling.
- A per-project layout choice.

**Refinement decisions:**

- One browser-wide choice, not per project: the layout reflects the
  developer's screen and reading habit rather than the project's content, and
  the dashboard's other kept view preferences (board position, sessions
  sidebar, sidebar sizes) are browser-wide. Per project remains possible
  later without changing these examples except 5.
- Narrow screens stack the panels rather than fall back to tabs, so the
  developer's choice to see both together is honored at every width and the
  remembered choice never changes because of the screen.
- The choice uses the dashboard's existing disposable browser preference
  (`dashboard/src/keptPreference.ts`), the browser storage
  [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
  permits.

**Key examples:**

1. With Side by side off, select a feature file in Intent: **Purpose** is
   chosen and shows its source. Choose **Proof**: that same file's observed
   proof fills the reading area. Select another file: **Proof** stays chosen
   and shows the new file's proof.
2. Turn on **Side by side**: Purpose and Proof appear together for the same
   file. Scroll a long Purpose: Proof stays in view. Select another file:
   both panels follow the selection.
3. With Side by side on, switch to Development and back, or reload the
   dashboard: Side by side is still on. Turn it off and reload: tabs show,
   with Purpose chosen.
4. With Side by side on, narrow the window until the locations sit above the
   reading area: Purpose shows above Proof and the toggle still reads on.
   Widen it: the panels return side by side.
5. With Side by side on in one project, switch to another project's Intent:
   it also opens side by side.
6. A browser with no remembered choice, or one that refuses storage, opens
   Intent with tabs; turning Side by side on there lasts until the page is
   reloaded.
7. With a story selected and a file read with its case positioned, switch
   layouts or tabs: the selected story, file, and case position stay
   unchanged and nothing is read again.
8. With tabs on Proof, open a recorded file from **Optimization Candidates**:
   Intent shows Purpose positioned on that case.

**Architecture:** The Side by side choice is a browser-kept view preference
like the board position and sessions sidebar, read and kept through
`keptPreference.ts`; it is not page or project state, so it does not join
Intent's selection owner (`intentWorkspaceSelection.ts`) or a per-project
Intent tab owner. The chosen Purpose/Proof tab is page state of the Intent
reader. Intent's two tab strips share one tablist behavior: the keyboard
handling now specialised to the Intent reading strip
(`IntentModeTabs.tsx`) becomes one shared Intent tablist, not a second copy.
[Show CI status in an Intent tab](SEED-219-intent-ci-status-tab.md#intent-ci-status-tab),
which is Taken, changes the same strip and reader; whichever lands second builds
on the other's result. Once delivered, the code explains this design, so the
North Star's Purpose and Proof layouts section is removed.

**Request evidence / priority:** Terry requested this on 2026-11-02 as a new
story at the top of the [product backlog](../PRODUCT-BACKLOG.md#backlog-list).
It advances the existing direction to make Purpose and Proof reviewable
together in story context.
