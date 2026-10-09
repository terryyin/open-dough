# Keep unchanged dashboard stories steady while story information reloads

**Identity:** SEED-126#steady-dashboard-refresh
**Source:** [refined story](../../seeds/SEED-126-steady-dashboard-refresh.md#steady-dashboard-refresh).
**Prepared:** 2026-10-09, planning only, in the established preparation
workspace `/Users/terryyin/git/open-dough/.worktrees/keep-unchanged-dashboard-stories-steady-while-st`
on `claude/keep-unchanged-dashboard-stories-steady-while-st`, under the
preparation assignment for `darren-chan`. Publication target: `origin/main`;
integration checkout: `/Users/terryyin/git/open-dough`.

## Goal and boundaries

When the dashboard finds the configured ref naming a new commit and reads
that revision, every story and assignment it already shows keeps its content
and place until that revision's own answer for the part arrives, and the read
under way is said without moving the columns. Unchanged work stays still;
only what the new revision changed is seen to change.

In scope, from the story: carry-over of shown facts by story identity for
every card part, the roster, the done list, and an open inspection; immediate
membership and order from the new backlog; replacement in place, never a
placeholder, for a carried part; carried facts that do not outlive the read
attempt; the read-under-way sentence in reserved room.

Material exclusions, from the story:

- Initial loading with no shown snapshot keeps today's behavior.
- The failure, limit, and recovery notices keep their room under the banner.
- No animation is added; no change to the machine-session read; no per-part
  revision label.
- Project switching still replaces the whole view; same-revision recovery,
  moved-branch progress reads, hidden and revealed pages, and focus across a
  membership change keep their meaning and their existing specs.

## Published baseline and integration context

Origin was fetched at `3ca3aaa5` (`origin/main`); this workspace branched at
`a4c1913e`. The highest allocated plan on origin is
`283-keep-reported-gaps-owned`; `284-steady-dashboard-refresh` was free
immediately before this write. No North Star topic governs the dashboard's
refresh presentation; the [UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md)
already asks that an unchanged snapshot settle and that refresh completion be
announced without moving focus. No Accepted ADR is affected; ADR 0008 is
Proposed and binds nothing. This plan adds no North Star topic.

## Existing solutions and selected approach

PFE, within the dashboard:

- **Change** the one place that assembles a new revision's snapshot:
  `dashboard/src/publishedWorkDetails.ts` (`assembled()` and `show()`), fed
  by `dashboard/src/publishedWorkRead.ts`, which already receives the shown
  snapshot (`shown`) and already keeps shown facts for the same-revision
  recovery read (`sameRevision`). Carry-over for a new revision is the same
  idea extended by identity: a projection applied to every partial the read
  shows. It belongs in assembly, not in presentation components.
- **Reuse** the by-identity map pattern of `withFacts` in
  `dashboard/src/preparationEnrichment.ts` for matching entries across the
  two snapshots.
- **Reuse and generalize** Recently done's precedent: `useShownDone` in
  `dashboard/src/recentlyDoneView.ts` keeps the last revision's catalog while
  the new one loads, and `dashboard/src/doneDetails.ts` reads records at the
  catalog's revision. The snapshot carry subsumes it once the catalog carries
  its own revision (slice 2), so one concept remains.
- **Change** `dashboard/src/PublishedReadStatus.tsx` and
  `dashboard/src/styles.css`: the status paragraph leaves the flow only in
  the read state (`spoken-only`), so the reading sentence inserts a line.
  Reserve that line in both states instead.
- **Reuse** the test fixtures: `tests/refreshJourney.ts` (revisions A, B, C
  and their backlogs), `tests/autoRefreshJourney.ts` (`openSettledAtA`,
  `passTimeUntilChecked`, `recordsAt`), `tests/publishedOrigin.ts`
  (`push`, `hold` of a record path), and `tests/partArrangement.ts` (`box`).
- **New** `dashboard/tests/steady-refresh.spec.ts`: the outside-in proof for
  the story's examples.

The carry rule, one function applied to every snapshot the read shows:

> For each entry of the new snapshot whose identity the shown snapshot also
> lists, each part that is `loading` in the new snapshot takes the shown
> entry's part. Within `owner` and `preparing`, an assignment whose `human`
> is `loading` takes the shown assignment's `human` for the same agent. The
> roster and the done list carry the same way. A part that is not `loading`
> (answered, `not-recorded`, or a gap) is never replaced by a carried one.

Because every detail reader settles to a gap at the wait bound (premise
below), the read's final snapshot has no `loading` part, so a carried fact
cannot outlive the attempt.

## Current decisions

- **Membership and order come from the new backlog at once.** New entries
  show the first-visit reading presentation; entries no longer listed leave;
  reordered entries move. Carry-over never holds an entry the new revision
  does not list. This keeps the
  [published observation contract](../../../dashboard/PUBLISHED-OBSERVATION.md)
  that cards appear without waiting.
- **Carry is by `loading`, not by equality.** The assembly does not compare
  old and new facts; an answered part replaces a carried one even when equal,
  and React's keyed cards (`WorkStages.tsx` keys by identity) render no
  change for equal content. The proof measures what the user sees.
- **The reading sentence keeps a reserved line.** The status paragraph holds
  one line of room in both states; in the read state its sentence is spoken
  only, inside that room. The sentences themselves are unchanged
  (`tests/published-work.spec.ts`, `tests/transient-read-recovery.spec.ts`,
  and `tests/accessible-overview-keyboard.spec.ts` assert them).
- **Failure notices stay as they are.** Deferred in the story; nothing here
  touches `PublishedReadFailure.tsx`.
- **Done carries through the same rule.** The catalogued done list records
  the revision it was read at, Recently done reads records at that revision,
  and `useShownDone` is removed. Without that revision, carrying A's catalog
  into B's snapshot would read A's records at B (`doneDetails.ts` reads at
  the snapshot's revision), which is why the precedent kept its own state.
- **Local test runs.** `npm ci` in the execution worktree installs the
  locked dependencies (observed at execution start: 162 packages added);
  run the suite from there.

## Decisive premises and observations

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| A new revision with unchanged records blanks carried cards and grows them, and the reading sentence moves the columns | Slices 1, 3 | A throwaway spec on the A→B fixture (same backlog and records at B, `hold` on one record): the dashboard card went from "Not recorded" to "Reading preparation… Execution unavailable while dependency facts are being read.", height 206→259 px, column height 720→877 px; while the status said "Reading published work…" before B's membership, the Backlog column top moved 137→173 px. Production: trunk `a4c1913e`→`3ca3aaa5`, thirteen cards showed "Reading preparation…" for 3.4 s. | Symptom reproduced in the fixture and in production. |
| A quiet check at an unchanged revision changes nothing on screen | Scope | `tests/auto-refresh.spec.ts` ("an unchanged answer … leaves the snapshot") and `findUnchanged` returning the same state (`observationAttempt.ts`). | Confirmed; out of scope. |
| The new-revision path resets every part to loading; the same-revision path keeps shown facts | Slice 3 design | `publishedWorkRead.ts:76-89` (`sameRevision ? {...shown} : awaitingOwners(interpretPublishedBacklog…)`), `publishedBacklog.ts:58-71`, `assignmentPlacement.ts:49-58`, `publishedWorkDetails.ts:42-62`, `interpretAgentProfiles.ts:86` (`human: attributionLoading`). | Confirmed. |
| Every detail reader settles a part to a gap, never leaves `loading`, when the wait bound ends | Slice 3 (carry cannot outlive the attempt), slice 4 | `unavailableGap` at the bound in `preparationEnrichment.ts:126-153`, `agentAssignments.ts:129-165`, `assignmentAttribution.ts:68-123`, `sliceClockStart.ts:143-196`, `doneStories.ts:114-139`; `tests/published-facts-failures.spec.ts` and `tests/transient-detail-recovery.spec.ts` show gaps after the bound. | Confirmed in code and by the existing specs; slice 4 proves it for a carried part. |
| Cards are keyed by identity, so a carried card is not remounted | Slice 3 | `WorkStages.tsx:99` `key={entry.identity}`; `RecentlyDone.tsx` keys by `done ${identity}`. | Confirmed. |
| No existing spec expects a placeholder on a card carried from an earlier revision | Slice 3 consumers | Search of `tests/` for every "Reading …" literal: all assertions are on first loads except `auto-refresh-detail-recovery.spec.ts:117`, which is on the claims card, new in B. | Confirmed; that assertion stays valid. |
| The fixture can hold one record's read at B while the backlog answers | Slices 3, 4 proof | `publishedOrigin.ts:154` `hold(path)` holds that record's reads at any revision; `auto-refresh-detail-recovery.spec.ts` uses it. The probe used it at B. | Confirmed. |
| Recently done reads records at the catalog's revision, kept by `useShownDone` | Slice 2 | `recentlyDoneView.ts:85-95` returns `{done, revision}` of the last catalogued snapshot; `doneDetails.ts:40-61` keys by file name and blob and keeps a `revision`. | Confirmed. |
| The status paragraph takes flow room only while reading | Slice 1 | `PublishedReadStatus.tsx:39-58` (`"announcement spoken-only"` once read); `styles.css:122-130` takes `.spoken-only` out of the flow; probe measured 36 px. | Confirmed. |
| One dashboard spec runs locally in about 3 s after the build | Verification | Probe runs: `npx playwright test --config dashboard/playwright.config.ts tests/<spec>` passed in 2–3 s. | Confirmed. |

## Outside-in proof ownership

| Promise (story example) | Owning slice | Proof |
| --- | --- | --- |
| The read under way moves no column (1) | 1 | `steady-refresh.spec.ts`: the Backlog column's top is the same before the check, while the status says "Reading published work…", and after settlement. |
| Unchanged cards keep content and place across a new revision (1) | 3 | Same spec: B pushed with A's backlog and records, one record held; after B's membership shows, every card's text and box equal the pre-check ones and no "Reading" placeholder is on any card; after release, texts equal and the source shows B. |
| Only the changed story updates (2) | 3 | Same spec: B changes one story's record; that card's purpose reads "as published at B" when released, the others still "as published at A" until their answers, never a placeholder. |
| New and removed entries change membership only (3, 4) | 3 | Same spec, using `backlogB`: the claims card appears with "Reading preparation…" in its place; the workspace card leaves; the queue card keeps its text and the dashboard card moves to Taken with its purpose carried. |
| Open inspection and roster keep their facts (5) | 3 | Same spec: an inspection open at A keeps its purpose during B's read; `tests/agent-roster.spec.ts` stays green. |
| Recently done keeps its list while the catalog loads (precedent) | 2, 3 | `tests/recently-done-progressive-refresh.spec.ts` green after the revision moves into the catalog (2) and after `useShownDone` is removed (3). |
| A carried part does not outlive the attempt (6) | 4 | `steady-refresh.spec.ts`: the queue story's record held at B past the 30-second bound: the card shows A's facts until the bound, then the preparation gap, and the problem names B. |
| Existing refresh behavior is preserved | 1–4 | `tests/auto-refresh*.spec.ts`, `tests/transient-*.spec.ts`, `tests/published-facts-*.spec.ts`, `tests/settled-page.spec.ts`, `tests/accessible-overview-keyboard.spec.ts` green. |

## Ordered slices

### 1. The read under way is said in reserved room
Type: Behavior
Status: done
Proof: new `dashboard/tests/steady-refresh.spec.ts` first test: A settled,
B pushed, `passTimeUntilChecked`; the Backlog column's `box().y` while the
status says "Reading published work…" equals the value before the check and
after `expectSettledPage`. `tests/published-work.spec.ts`,
`tests/transient-read-recovery.spec.ts`, and
`tests/accessible-overview-keyboard.spec.ts` stay green.

Behavior: A snapshot is shown → a read begins (a new revision found, a
read afresh, or a recovery read) → the status region says the reading
sentence inside room the header already reserves; the columns and cards do
not move when the read starts or ends. Spoken text and sentences are
unchanged.

Accepted proof: `npx playwright test --config dashboard/playwright.config.ts
tests/steady-refresh.spec.ts` — "the read of a new revision is said without
moving the columns" at 1280 px and on a phone's width (320 px): the Backlog
column's `box().y` is equal before the check, while `parts(page).reading`
shows the full sentence, and after `expectSettledPage`. It failed before
the change (137 → 173 px). Consumers green: published-facts-reading,
accessible-overview-keyboard, published-work, settled-page, transient-*,
auto-refresh*, dashboard-columns-*, dashboard-header, read-failure,
frame-*-look; full dashboard suite run once locally.

Learnings: the reserved line makes the settled header about 20 px taller.
Two specs whose promises are about scroll, focus, and page tail, not about
an edge control fitting unscrolled, used an 864×480 viewport with no margin;
they now use 864×500 (`published-facts-reading.spec.ts`,
`dashboard-columns-height.spec.ts`). The room is one line at every width:
on a narrow page the shown reading sentence is cut with an ellipsis on its
inner `.read-status-line` span and spoken whole (`tests/pageLayout.ts`
`notReadWhole` would flag the paragraph itself). The read result uses the
existing `.visually-hidden` rule. `dashboard-columns-height.spec.ts` was
split (`dashboard-columns-clamp.spec.ts`) to stay under 250 lines.

### 2. The done catalog names the revision it was read at
Type: Structure
Status: planned
Proof: `tests/recently-done-progressive-refresh.spec.ts` and the done specs
(`tests/*done*.spec.ts`) green; `npm run typecheck:dashboard`.

Structure: `DoneStories` in catalogued state carries the revision its catalog
was read at; `RecentlyDone` and `doneDetails` read records at that revision
instead of the snapshot's. `useShownDone` keeps its behavior for now. This
enables slice 3 to carry the done list through the same rule as every other
part, without reading one revision's records at another.

### 3. Unchanged cards keep content and place while a new revision is read
Type: Behavior
Status: planned
Proof: `steady-refresh.spec.ts` tests for examples 1–5 as the proof table
maps them; `tests/auto-refresh.spec.ts`,
`tests/auto-refresh-detail-recovery.spec.ts`,
`tests/auto-refresh-recovery.spec.ts`,
`tests/recently-done-progressive-refresh.spec.ts`,
`tests/agent-roster.spec.ts`, and `tests/settled-page.spec.ts` green.

Behavior: A snapshot at A is shown → the check finds B and the read begins →
each snapshot the read shows carries, by identity, every shown part that B
has not yet answered (preparation, dependencies, purpose, plan slices,
progress source, owner and preparing with their human credit, slice clock,
roster, done list); membership and order are B's at once; a part B answers
replaces the carried part in place; a new entry shows the first-visit reading
presentation. `useShownDone` is removed, since the carried done list now
names its revision. No card, portrait, or column changes for a part B's
answer leaves equal.

### 4. A carried part gives way to the gap when its read is given up
Type: Behavior
Status: planned
Proof: `steady-refresh.spec.ts` last test: queue story's record held at B;
`page.clock.runFor(30_000)`; the card showed A's facts until then, then
shows the preparation gap text, and the problem says the read was given up
after reading the published work at B.

Behavior: A carried part's read at B is still unanswered when the wait bound
ends → the part shows today's gap presentation and the existing notice and
recovery schedule apply; nothing of A is shown for that part afterwards.

## Verification and sizing

- Each slice is one proof loop; the focused command is
  `npx playwright test --config dashboard/playwright.config.ts tests/<spec>`
  for the named specs, with `npm run typecheck:dashboard` at each commit.
  Slices 1, 2, and 4 are small; slice 3 is the main change, bounded to the
  assembly projection, the roster and done carry, and one spec.
- `node scripts/lint.mjs` at each commit, as the pre-commit hook requires.
- The full dashboard suite is not a local gate; CI runs it on publication.
  Run the refresh-related specs named above locally before each commit,
  since the change reaches every card's reading presentation.
- Execution updates the published observation contract's sentence "Each
  read replaces the whole view with one revision" to describe facts, not
  presentation, in the slice that changes it (slice 3).

## Preparation review

Refinement was not needed: slice 1 is independent of the carry and proves
its own promise; slice 2 is the structure slice 3 depends on and is placed
immediately before it; slice 3 owns one rule for every part; slice 4 proves
the failure boundary of that rule. The parts share one carry rule, not
per-part recognizers. No slice-specific concern remains.
