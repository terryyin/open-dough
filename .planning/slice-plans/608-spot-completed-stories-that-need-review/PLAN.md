# Spot completed stories that need review

**Identity:** SEED-333#spot-completed-stories-that-need-review
**Source:** [Story](../../seeds/SEED-333-spot-completed-stories-that-need-review.md#spot-completed-stories-that-need-review)
**Source review:** [Independent source commitments](source-review.md)

## Execution context

- Mode: story-branch; owned/reused workspace `/Users/terryyin/git/open-dough/.worktrees/spot-completed-stories-that-need-review`, branch `codex/spot-completed-stories-that-need-review`; remote `origin`, trunk `main`.
- Established start: publisher `dashboard-territory.local-open-dough`, agent `joey-chan`; start `8f70215aca94f40e3a42fbe2ed5e239d6e5f6489`, accepted claim/candidate `7eae86d553974c1b60bfe997df6c826ed73ac4ef` on origin/main. Claim CI: unobserved.
- Checkout setup: `npm ci` and `npm run typecheck:dashboard` passed in this checkout with unchanged locked dependencies on 2026-11-13. Hook is check-only staged lint plus script-change dashboard typecheck; formatter is changed-file `npm run format`.
- CI: GitHub Actions `terryyin/open-dough`, execution branch, verified `ci.yml` (CI, id 351271804); coordinator `seed333-joey`, yielded cell `g278:19`, stream session `37185`, directory `/tmp/dough-ci-501/watch-dI5jKt`, PID `33962`, watching.
- Replanning: preserve existing planning authority; no numeric slice budget or hard limit supplied.
- Proof decision: this Mac on AC, 40% memory free, natural load 74/54/52; Board/session test worktrees are active. Run only focused proof with one worker under `caffeinate -s -i`; implementation owner rechecks host before launch/repeat and diagnoses failures under the linked failure policy. Duration unknown; no unrelated processes modified.

## Goal and scope

A developer scanning the Board's Recently done cards and the Sessions sidebar's
Recently done sessions can spot completed stories not yet marked reviewed on
this machine, before selecting them. Give the card's Mark as reviewed action
prominent red warning styling and linked rows the same warning meaning with
visible, accessible Needs review words. Preserve quiet Reviewed/Unreview styling.

Use the linked project's existing machine-local review state. A successful card
change updates every linked row on the page; Unreview restores the cues. Include
story launches and confirmed Ad hoc associations, including other configured
projects while the Board remains on its current project. Unknown evidence never
becomes an inferred warning or a claim that a story was reviewed. Preserve
Select/Open, focus, selection, perspective, Side panel, unread-report meaning,
session disposition, and failed-save behavior.

No sidebar review action, review-based ordering/filter, count, new persistence,
published review fact, retention change, or new completed-story linking rule.
Necessary shared-state and observation work belongs to the cue's delivery.

## Architecture and existing solutions

Follow Accepted [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
for derived published facts, machine-local review evidence, and selection;
[ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md#dashboard-product-concepts)
for Story, Session entry, Board, and Sessions sidebar; and
[ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
for a coherent product model and incremental delivery. Their index and in-file
statuses agree; no relevant supersession or conflict was found. Proposed ADRs
0007/0009 supply no constraint here.

Use [One backlog interpretation, separate observation and presentation](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
and [Agent launch as a requested assignment](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment).
The latter now distinguishes the Board's selected-project snapshot from bounded
link observations for shown cross-project rows. No new topic or database is needed.
[Visual and accessibility direction](../../../docs/dashboard-ux-ui-north-star.md#visual-and-accessibility-direction)
supplies text contrast (4.5:1), control/focus contrast (3:1), and non-color access.
The source explicitly extends red warning styling to outstanding review, with
words keeping it distinct from a failure.

PFE assessment at `66dde2be1f7031412e4bddfc2454fda6852a3b63`:

| Responsibility | Existing owner and decision |
| --- | --- |
| Completed-story link | Reuse `dashboard/src/recentlyDoneLink.ts`, the published catalog reader in `doneStories.ts`, and the confirmed server-held Ad hoc association boundary in `completedStoryAssociation.ts`. `recentlyDoneSelection.ts` currently invokes them on selection. Expose coherent observation for shown rows; share link meaning with selection rather than inventing another recognizer. Preserve current story-launch/Ad hoc association semantics. |
| Story review state | Change `storyReviewStates.ts` from a Board-local hook owner to shared page/project state consumed by Board cards and sidebar cues. Reuse its endpoint, successful-save answer, periodic reads, and response ordering. The store in `server/storyReviewStates.ts` remains authoritative for this machine. Its successful empty answer, including its established missing-file fallback, means unreviewed; an unanswered or failed HTTP read supplies no such fact. |
| Row presentation | Extend `SessionsSidebarSessionEntry.tsx` only for Recently done rows; reuse its Select/Open controls, title, session-state border, unread mark, selection ring, and touch details. Review meaning needs its own visible words, without replacing those signals or adding a tab stop. |
| Card action | Change `StoryReviewStateAction.tsx` and `story-review-state.css`; retain save, failure, announcement, and focus semantics. Snapshot review marks are a different concept and remain independent. |

Keep review state keyed by project and identity, never by title or session key.
Observe only the projects/links required by the Board and shown rows; reuse each
project's catalog and review-state read across its consumers. Newly revealed
rows join the same rule. Avoid a full cross-project Board snapshot or per-row
duplicate polling. Cancel or disregard obsolete observations after project,
revision, association, or shown-row changes. Background observation never calls
selection, navigation, native attachment, or review mutation.

Expected production edit candidates (`wc -l`, preparation revision):
`PageFrame.tsx` 240, `RecentlyDone.tsx` 148, `RecentlyDoneSessions.tsx` 178,
`recentlyDoneSelection.ts` 215, `recentlyDoneLink.ts` 90,
`SessionsSidebarSessionEntry.tsx` 189, `SessionsSidebarOptionalSections.tsx` 142,
`storyReviewStates.ts` 71, `sessions-sidebar-session-entry.css` 222,
`story-review-state.css` 37. None is already over 250 lines. Keep page/project
review ownership and shown-row link observation in cohesive modules, rather
than enlarging frame/row orchestration. `SessionsSidebar.tsx` is exactly 250;
prefer context at the existing frame/consumer boundary over more pass-through
props there. If it must change and grow, slice 2 owns extracting its optional
section orchestration with its existing room/selection proof. Add cue specs
instead of growing the existing 250-line review-state spec.

## Decisive premises and preparation observations

Observations used this owned checkout at the revision above on 2026-11-13,
with synthetic GitHub, real isolated dashboard servers, Chromium, and the
maintained Playwright fixture profiles that execution will extend.

| Premise and consuming operation | Observation and result | Remainder |
| --- | --- | --- |
| Existing review-state reads and saves can supply shared page facts (both slices). | Baseline command below passed all three cases in `recently-done-review-state.spec.ts`: keyboard mark/unreview, reload/restart persistence, unchanged repository/snapshot marks/sessions, and another page's periodic update. Trace: `RecentlyDone` → `StoryReviewStateAction` → `storyReviewStates` → existing local endpoint/store → returned reviewed set → card. | Baseline does not prove the new red treatment or sidebar propagation. Their new proof is owned below. |
| Cross-project story links and confirmed Ad hoc links are usable without a new identity source (slice 2). | Same command passed both `recently-done-sessions-select.spec.ts` cases and the real completion-publish case in `recently-done-sessions-select-ad-hoc.spec.ts`: linked story selection, independent Open, standalone miss, and retained Ad hoc identity. Trace: shown row → selection → catalog/association reader → page-selected story. | Move observation ahead of selection; new cue proof must reach an unselected row through these real boundaries. Do not mock the completed association in its sole integration proof. |
| The named proof route works in this worktree (both slices). | The runner's `--list` with the same three file paths exited 0. The first actual run failed before product setup because the worktree lacked local `node_modules`; `npm ci` installed it. The same actual command then exited 0, reaching all six existing journeys. | No waived test failure and no product/test scratch edits. |

Baseline command:

```sh
caffeinate -s -i npm run test:dashboard -- --workers=1 dashboard/tests/stories/recently-done-review-state.spec.ts dashboard/tests/sessions/recently-done-sessions-select.spec.ts dashboard/tests/sessions/recently-done-sessions-select-ad-hoc.spec.ts
```

Proof ownership below describes new tests, not proof already supplied by this
baseline. Execution must observe their pre-change failure and changed pass;
disabling the cue or propagation must fail the corresponding assertion.

## Outside-in proof and consumer trace

| Source promise | Owner | Observable proof |
| --- | --- | --- |
| Example 1: red unreviewed card action, quiet reviewed state, both appearances | 1 | New `dashboard/tests/stories/recently-done-review-cue.spec.ts`: rendered red action, readable label and measured contrast in light/dark, followed by Mark/Unreview; reuse existing persistence/focus/failure journeys. |
| Example 2: every linked row, including confirmed Ad hoc, updates without selection | 2 | New `dashboard/tests/sessions/recently-done-sessions-review-cue.spec.ts`: one story with multiple retained sessions, a real confirmed Ad hoc association, visible Needs review before a click, card Mark clears all, Unreview restores all. |
| Example 3: other projects and standalone/reviewed rows | 2 | Same cue journey includes another configured project's row while Board stays put; equal story identities across projects retain independent review states. Reviewed and standalone rows have no cue. Newly revealed rows use the same rule. |
| Example 4: pending, failed, and obsolete evidence; recovery | 2 | New `dashboard/tests/sessions/recently-done-sessions-review-cue-evidence.spec.ts`: hold/fail catalog, association, and review-state answers at external boundaries; no initial warning, Select/Open remain usable, successful retry/read supplies it, late old answers cannot restore a cleared cue or transfer it to another project/row. Use observable response gates and controlled polling clock. |
| Example 5: unread, selection and failure are independent | 2 | Cue journey keeps unread mark and selection signal alongside Needs review; Select/read-report do not mark reviewed. A refused save preserves card/row cues with existing error feedback. |
| UI: non-color access, narrow/touch, long titles, keyboard controls | 1 and 2 | Card proof owns action text/focus/contrast. Sidebar cue proof observes visible words and accessible description at the row, readable contrast in both appearances, and a narrow touch case with a long title and usable Select/Open. |

Known consumers traced before planning: Board cards consume the shared reviewed
set; the sidebar row's enclosing list, tooltip/details, accessible naming and
description, unread icon, selected/current rings, and size/paging controls consume
its rendered output. `recently-done-sessions-select.spec.ts` observes accessible
names, title tooltip, equal ordinary row heights, keyboard order, and navigation;
the Ad hoc spec observes unchanged Ad hoc labeling. Preserve these purposes.
Selection-check/supersede fixtures currently start reads on click; adapt their
external response gates to background observation while retaining their actual
navigation-race and recovery assertions. A cue fixture must supply published
Done evidence and local reviewed-state input, not a precomputed needs-review flag.

Run the installed consumer-trace command on each implementation diff with
`--base HEAD --term 'Mark as reviewed' --term 'Needs review'` and, for slice 2,
`--term 'useStoryReviewStates' --term 'readLink' --term 'associatedIdentity'`.
Follow reached support exports to enclosing scenarios, disposition every consumer,
and include newly reached ones in the relevant gate. The unchanged snapshot-mark
backend and native-host execution protocols need no new behavior test unless an
implementation change reaches them.

## Ordered slices

### 1. Make an unreviewed done card recognizable at a glance
Type: Behavior
Status: done
Accepted proof: `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed333-slice1-corrected-proof.json caffeinate -s -i npm run test:dashboard -- --workers=1 dashboard/tests/stories/recently-done-review-cue.spec.ts dashboard/tests/stories/recently-done-review-state` passed 10/10 (78.34s), plus `npm run typecheck:dashboard` and `git diff --check`. Both cue cases failed before the action class/CSS edit. Inspected MakeMe published-record setup, rendered red/quiet/contrast/focus assertions, failed-save recovery, and retained real restart/selection/repository observations. Consumer dispositions: `/tmp/seed333-slice1-final-consumer-trace.md`; actual rendering owners DoneStoryCard/RecentlyDoneEntry covered by the gate; no persistence/native protocol change. Source freshness unchanged at trunk `15377f89304821fdb8bc29c71b45e1d30926e0a7`; no named sibling coordination hold.
Test repair: cold new-spec setup uses maintained worker-prepared preview fixture; focus assertion establishes real keyboard modality; long state/restart case split into interaction and prefix-selected persistence specs with all assertions retained. Final proof has no timeout changes or waived failures. Reused proof after test-title-only correction.
Refactor: independent `refactor1` returned `## REFACTOR COMPLETE`, none — already clean; no edits/tests, all accepted proof unchanged. Final delivery freshness unchanged at the same pinned trunk; no named sibling hold.
Proof: New card cue spec plus the existing review-state, offer, and failed-save
specs; light/dark rendered contrast and the preserved keyboard/save journey.

Behavior: Given reviewed and unreviewed done stories, viewing Recently done shows
a prominent red Mark as reviewed action only for the unreviewed story. Mark and
Unreview retain their current state, feedback, and focus behavior.

Implement the specific action styling through the existing review-state action,
leaving quiet reviewed presentation intact. Keep any common warning styling
cohesive for the next slice without adding unused presentation machinery.
Update `dashboard/STORY-CARDS.md` for this behavior. This is an independently
useful stopping point; sidebar delivery remains unfinished until slice 2.

### 2. Show the linked story's review need in every shown done-session row
Type: Behavior
Status: planned
Proof: New sidebar cue/evidence specs, card-state regressions, and the affected
Recently done sessions and shared sidebar-row cohorts described below.

Behavior: Given shown done-session rows, observing a confirmed completed-story
link and that project's unreviewed state shows red Needs review words before
selection, including cross-project and Ad hoc rows. A successful review change
updates all matching rows; unknown, standalone, and reviewed rows show no cue.
Other session/selection signals and Select/Open keep their meanings.

Move the existing review-state owner to a shared page/project boundary; factor
link observation out of selection where necessary, reusing current evidence
semantics. Wire it to the actual shown rows, not all retained history. Implement
stale-answer isolation and background recovery with the existing read lifecycle.
Retain the server's local store and association authority. Update the maintained
sidebar contract in `dashboard/AGENT-LAUNCH-HISTORY.md` and remove STORY-CARDS'
now-obsolete statement that the sidebar never shows review state. Reconcile the
temporary North Star topic into maintained behavior at wrap-up.

## Gates and delivery

- Follow [the failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written for every slice, delegation brief, and repair handoff. Base/main
  attribution is no exemption; published CI failures remain owned through the
  applicable final CI. Preserve another active execution's exact owned repair.
- Before test edits, resolve paths through the installed MakeMe and page-object
  skills. `.planning/open-dough.json` selects both conventions for
  `dashboard/tests/**/*.spec.ts`; builders/page objects follow their consumers.
  Reuse `recentlyDoneReviewState.ts`, `recentlyDoneSessionsSidebarPage.ts`,
  `recentlyDoneSelectionJourney.ts`, and the real Ad hoc completion fixture.
- Local gate: affected proof, `npm run typecheck:dashboard`, and staged lint.
  For long macOS runs, start fully awake; on AC use the maintained
  [`caffeinate -s -i` guard](../../../tests/local-test-resources.md#machine-sleep-on-macos).
  On battery, plug in or use `caffeinate -i` awake with lid open and inspect the
  sleep log afterwards. Never sleep in tests, use `test.slow()`, or increase
  suite/file/group/hook timeouts.
- Slice 1: `npm run test:dashboard -- --workers=1
  dashboard/tests/stories/recently-done-review-cue.spec.ts
  dashboard/tests/stories/recently-done-review-state`.
- Slice 2: `npm run test:dashboard -- --workers=1
  dashboard/tests/sessions/recently-done-sessions
  dashboard/tests/sessions/sessions-sidebar-row.spec.ts
  dashboard/tests/sessions/sessions-sidebar-state-edge.spec.ts
  dashboard/tests/sessions/sessions-sidebar-keyboard.spec.ts
  dashboard/tests/sessions/sessions-sidebar-touch.spec.ts
  dashboard/tests/stories/recently-done-review`.
  This includes selection, checking, supersession, paging, and room/navigation
  consumers; extend only when the implementation trace reaches other purposes.
- Before an expensive run, inspect the actual host and competing work. The
  preparation baseline used one worker on AC with 16 cores, load about 49,
  and 36% memory free; duration evidence was unavailable before launch. It
  passed after dependency setup. Do not assume that headroom at execution.
- Post-change refactor each slice, then run its focused proof and commit through
  the assigned-agent helper. Use Execute Plan's delivery, CI ownership, and
  wrap-up lifecycle when implementation is authorized. Preparation grants no
  execution, Take, or mode selection. No native-host launch probe is required:
  this story consumes existing session evidence and changes no host protocol.

## Plan review

Slice-plan refinement was not needed: card prominence is an independent useful
increment; sidebar observation, shared review state, and row presentation form
one remaining externally observable result and proof loop. Cross-project and
Ad hoc examples exercise the same project/identity review rule rather than
adding separate handlers. Both slices include their proof and cleanup. No numeric
slice target or hard limit is supplied; neither slice contains a release or
other trunk-only operation. No remaining slice-specific concern was identified
after the successful baseline. Readiness is recorded by the shared recorder.

## Current decisions

- Preserve the established scope and completed-story association rules.
- A warning needs confirmed link plus successfully read unreviewed state.
- Share the project's state across page consumers; do not persist session flags.
- Background evidence reads have no selection or native-session effects.
- Review cue text must coexist with unread, failure, selection, and focus meaning.

## Learnings

The fresh preparation worktree needed its own `npm ci`: ancestor-resolved tooling
could list tests but the real fixture's bundle allocation needed local
`node_modules`. Setup is now complete; all six baseline journeys passed.
