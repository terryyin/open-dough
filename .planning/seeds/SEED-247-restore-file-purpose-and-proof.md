---
id: SEED-247
status: active
planted: 2026-11-06
planted_during: Terry Yin's clarification that individual Intent files still need Purpose and Proof tabs
trigger_when: A developer selects an individual file in the dashboard's Intent perspective
scope: story
---

# SEED-247: Restore Purpose and Proof for individual Intent files

## Request and context

Terry clarified on 2026-11-06 that the earlier simplification of Intent was
not intended to remove Purpose and Proof from individual files. Each file
needs its source as Purpose and its observed runtime performance as Proof.
An executed story's selection should expose the differences, including the
change in execution time. Keep folders and sections as they are for now.

SEED-238#remove-local-proof removed local proof readers and, with them, the
file-level Purpose/Proof tabs and side-by-side layout. Entry and folder
Summaries and the homepage **CI status → Proof** already show published CI
proof. Selecting a file today shows only Purpose (source or story diff), with
a compact story CI comparison stacked above Purpose when a story is selected —
not a file-level Proof tab.

The current [Intent reading guidance](../../docs/dashboard-development-intent.md)
describes that stacked comparison. This story restores the file-level
Purpose/Proof distinction from published CI evidence while retaining folder
and section summaries and keeping local proof removed.

## Story

<a id="restore-file-purpose-and-proof"></a>

### Restore Purpose and Proof tabs for individual Intent files

**Identity:** SEED-247#restore-file-purpose-and-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/484-restore-file-purpose-and-proof/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"8ce6d38bbe1b95a8773b2df51abd0ee5a95665d244309658dbeb0d595ff2292d","plan":"9c16b8151eb425468015bd67ca571c5275fc558a7f6412287e27f20701bb5774"}}
```

**Beneficiary:** A developer, including Terry, reading a test file in Intent
and reviewing how an executed story changed its behavior and runtime cost.

**Goal:** Selecting an individual Intent file offers Purpose and Proof as
named tabs. Purpose remains the file's source (or the selected story's source
diff). Proof shows that file's published CI runtime results and execution
time, and with an executed story selected, the file's measured timing
comparison across the story's available endpoints — so the developer can
separate expected behavior from observed verification cost without leaving
the file.

**Facts observed during refinement (2026-11-06):**

- `dashboard/src/IntentFileReading.tsx` shows Purpose only; with a selected
  story, `IntentFileComparison` stacks a compact CI timing comparison above
  Purpose.
- Commit `6644e55c7` (SEED-238#remove-local-proof) removed Purpose/Proof tabs,
  side-by-side layout, and local proof readers together.
- Entry/folder Summaries (`IntentSummary` / `IntentScopeProof`) and homepage
  **CI status → Proof** already present file-breakdown CI evidence through
  Intent's one CI evidence owner (`IntentCiEvidence`);
  `IntentFileComparison` reuses the same comparison figures at file scope.
- [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  and [ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md): each
  Product intent contains Purpose and Proof; Proof presentation remains a
  design choice; the dashboard observes published evidence and does not own
  workflow state. The North Star's homepage **CI status → Proof** direction
  stays; this story restores the same named distinction at file selection.

**Challenge (refinement):** The purpose is the Purpose/Proof distinction for a
file from published evidence. Restoring SEED-222's full layout (side-by-side
and remembered split) or any local proof would meet "tabs" wording while
missing Terry's CI-runtime intent and undoing SEED-238. Strongest doubt
resolved by scope below: tabs with CI evidence only.

**Scope:**

- **Required:**
  - When an individual file in a configured Intent location is selected,
    the reading pane offers **Purpose** and **Proof** tabs (shared Intent
    tablist pattern). Purpose is chosen first for a fresh file reading;
    the chosen tab is kept across file selections in the same Intent visit
    as disposable page state (not URL or durable storage).
  - **Purpose:** the existing source reader and, when the selected story
    changed the file, that story's source diff — unchanged content, no
    stacked CI comparison above it.
  - **Proof:** that file's published CI runtime evidence from Intent's
    existing CI evidence owner (no new CI fetch path, no test execution on
    selecting Proof). Without a story, show the file's results and execution
    time for the judged run's proof (same columns and gap wording Summaries
    use for a file row). With a selected executed or Taken story that has a
    comparison, show the file's baseline / branch / landed comparison with
    measured times and signed timing differences, story change markers, and
    the existing observed-not-attributed qualification; move today's stacked
    file comparison into this tab rather than duplicating it above Purpose.
  - Keep evidence tied to its actual revision and run. A missing measurement
    or unusable proof explains the gap without treating absence as zero or
    borrowing another file's figures.
  - Opening from Optimization Candidates still lands on Purpose positioned
    on the case.
- **Required restrictions:** Proof remains published CI observation only.
  Do not restore local proof readers, location `proof` / `runner` settings, or
  on-demand test execution from Intent.
- **Scope limits:** Leave location and folder presentation and behavior
  unchanged (existing Summary, navigation, and story comparison). Do not
  change the Intent / Optimization Candidates mode strip, homepage **CI
  status → Proof**, or Structure. Do not revive side-by-side Purpose/Proof
  layout or a remembered split preference.
- **Deferred promises (neither delivered nor rejected):** side-by-side
  Purpose/Proof reading; durable remembered Proof tab across reloads;
  Purpose/Proof tabs on location or folder selections; Structure.

**Key examples:**

1. No story selected; developer selects `features/login.feature` → Purpose
   shows its published source; choosing Proof shows that file's CI counts and
   execution time for the judged run (or explains why proof is unavailable).
2. A completed story is selected and changed that file → Purpose shows the
   story's source diff with no comparison stacked above it; Proof shows the
   file's baseline / branch / landed runtime comparison with signed timing
   differences and the observed-not-attributed statement.
3. The file measured 12.5 s at baseline and 10 s in landed proof → Proof
   shows both measurements and a −2.5 s difference.
4. A file or comparison endpoint has no usable runtime proof → Proof names
   the gap; Purpose remains readable; figures are not shown as zero and not
   taken from another file.
5. Before and after the change, selecting a location or folder keeps today's
   Summary, child navigation, and story comparison; no Purpose/Proof tabs
   appear there.
6. Developer reads Proof on one file, then selects another file → Proof
   remains the chosen tab and shows the new file's evidence; activating
   Optimization Candidates and returning via a case still opens Purpose on
   that case.

**UI:** Nested Purpose/Proof tabs in the file reading pane (same tablist
control as Intent's mode strip). Purpose holds source or story diff; Proof
holds the file's CI single-proof or story comparison content. No layout
sketch required beyond that named distinction.

**Architecture:** Restore the Product-intent Purpose/Proof pair at file
selection ([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md),
[ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md)) by composing
existing Intent reading and CI evidence ownership (`IntentCiEvidence`, scope
comparison already used by Summaries and `IntentFileComparison`). No new
evidence authority, persistence, or local-proof path. Nested tab state stays
disposable presentation state, consistent with Intent's mode strip. No ADR
conflict; SEED-238's removal of local proof remains in force.

**Priority:** First queued item, on Terry's explicit instruction. Other
queued work retains its relative order.

## References

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Current Development and Intent behavior](../../docs/dashboard-development-intent.md).
- [Initial Intent workspace](../../docs/dashboard-ux-ui-north-star.md#initial-intent-workspace).
- [Completed entry, folder and file comparison story](../done/SEED-245_compare-story-intent-entry-folder-and-file-summaries.json).
- [Completed local-proof removal](../done/SEED-238_remove-local-proof.json).
- [Completed Purpose/Proof layout](../done/SEED-222_intent-purpose-proof-layout.json).
