---
id: SEED-259
status: active
planted: 2026-11-07
scope: story
---

# Scan CI summaries in dashboard Intent

<a id="scan-intent-ci-summaries"></a>

### Scan CI summaries in dashboard Intent

**Identity:** SEED-259#scan-intent-ci-summaries
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/499-scan-intent-ci-summaries/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"bc356392c3c146d1effadfb58e946322a01d8c2cf41f2a21af014c0f45e3908f","plan":"2fcaa1bb4216f7b0e9ec5b787357892bf21003946ea74e2bf0888b9b18fb191a"}}
```

**Goal.** A developer reviewing test evidence in dashboard Intent can find
the rows they care about and understand counts, execution times, and gaps at
a glance across CI status and the entry and folder summaries.

**Scope.**

Required behavior:

- Every Intent CI figures table sorts by its columns: the CI status Proof
  table (one row per declared entry), the CI status story comparison table,
  and the entry and folder summary breakdown, single-run and story
  comparison alike. One shared table owns sorting, so every such table
  behaves the same. Each column header is a keyboard-operable control; the
  first activation sorts that column ascending, the next reverses it, and
  the header carries `aria-sort` and a visible direction mark. Until a
  header is activated, rows keep today's order (declaration order on CI
  status, tree order in a summary).
- Sort keys are the figures, not their words: **Scope**/**Entry** by path
  name; **Counts** by the number of counted results, failed first among
  equal totals; a timing column (**Test execution time**, **Baseline**,
  **Branch**, **Landed**) by its measured time; **Parts** by the number of
  gaps. A row without a measured value for the sorted column (partial,
  unavailable, no CI result, an endpoint gap) follows the measured rows in
  either direction, in its default order. Ties keep default order.
- In a story comparison the story's change kind (added, modified, removed,
  renamed) moves from trailing words on the name into a short **Change**
  column, sortable by kind, with unchanged rows last.
- An entry or folder summary shows the selected scope's own figures (counts,
  execution time or its comparison times, parts) as a labelled group above
  the breakdown table, not as its first row; the table holds only the
  immediate folders and files, plus **Not in the rows above** when it
  applies. That row stays last under any sort, since it is not a child.
  Child names still select their folder or file as the tree does. Sorting is
  kept while drilling down within the same Intent visit (memory only, like
  the rest of Intent's reading place); a sorted column the next table lacks
  falls back to default order.
- Timing gaps read as short labels instead of sentences, consistently in
  every table and the overall group: for example `Part 2 untimed`,
  `Part 3 missing`, `4 tests untimed`, `No timings`. Measured zero stays
  `0 ms`; partial shows its gap labels; unavailable (`No timings`,
  `no CI result`) stays distinct from both. The full explanation stays
  available to assistive technology and on hover.
- The evidence and comparison identity above a summary or the CI status
  Proof table reads as grouped short labels instead of sentences, with
  icons where they help recognition, each with an accessible name: run and
  attempt (linked), revision, branch, a running result's completed ancestor,
  and CI wall time; a story comparison's Baseline, Branch and Landed
  revisions with their status words and the provisional mark. The facts
  that change how the figures read stay visible as short labels: evidence
  of another revision than the tree (and that newer files are unproved
  there), a previously retrieved judgment or failed refresh, the
  observed-not-attributed comparison framing, an entry without a child
  breakdown, and what **Not in the rows above** holds.

Required restrictions:

- Measured zero, partial timing and unavailable timing remain
  distinguishable (labels never collapse absence into a number), because
  the figures are evidence and a missing duration must never read as fast.
- Shorter wording keeps one term per fact across CI status, summaries, file
  Proof (which shares the evidence identity) and
  [Intent's documentation](../../docs/dashboard-development-intent.md) and
  [CI timing comparison](../../docs/dashboard-development-intent-ci-comparison.md).

Scope limits:

- No new figures: no lower-bound time for partial scopes, no totals row on
  CI status, no added counts or filters.
- No change to what CI evidence is read, judged or compared, or when.
- Sort choice is not put on the URL or in storage.
- Optimization Candidates and file Purpose are unchanged. A selected file's
  Proof changes only as far as it shares the evidence identity and timing
  labels.

**Key examples.**

1. CI status shows Proof for entries `tests/a`, `tests/b`, `tests/c` with
   times `12.5 s`, `340 ms`, `Part 2 untimed`. Activating **Test execution
   time** orders `tests/b`, `tests/a`, `tests/c` with the header announcing
   ascending; activating it again orders `tests/a`, `tests/b`, `tests/c`
   (the partial row still last), announced descending. Tab reaches the
   header and Enter or Space activates it.
2. A folder summary for `features/billing` with children `invoices/`
   (5 tests), `refunds.feature` (12 tests, 1 failed) and an outside row:
   above the table, the folder's own `20 tests · 1 failed` (3 tests not in any child row), its time and
   parts. Sorting **Counts** descending puts `refunds.feature` first,
   `invoices/` next and **Not in the rows above** last; the overall group
   does not move. Activating `invoices/` opens that folder's summary with
   the same layout, still sorted by **Counts** descending.
3. A selected Done story's entry summary: overall Baseline / Branch /
   Landed above; children with a **Change** column. Sorting **Change**
   brings `added` and `modified` rows together ahead of unchanged rows;
   sorting **Landed** puts the endpoint-gap rows last.
4. An entry whose part 2 of 3 recorded no durations shows `Part 2 untimed`
   in **Test execution time**; an entry with every part timed and zero
   duration shows `0 ms`; an older summary without durations shows
   `No timings`. A screen reader and hover give the full explanation
   ("part 2 of 3 has no duration").
5. Evidence of attempt 2 of run 41 at `abc1234` on `main` while the tree
   shows `def5678` reads as compact labels such as `Run 41 · attempt 2`,
   `abc1234`, `main`, and a `Tree at def5678 — newer files unproved here`
   label, not two sentences; the run link and each icon's accessible name
   still identify the build.

**Architecture.** The shared figures table (`dashboard/src/CiProofTable.tsx`)
becomes the one owner of sortable columns for every Intent CI table; callers
supply rows whose cells carry sortable values beside their words, and pinned
rows (the outside row). Timing classification (measured, partial with named
gaps, unavailable) has one owner producing both the short label and its full
explanation, replacing the parallel phrasing in `ciProofWording.ts` and
`ciScopeComparisonTiming.ts`.

[Current Intent behavior](../../docs/dashboard-development-intent.md).
