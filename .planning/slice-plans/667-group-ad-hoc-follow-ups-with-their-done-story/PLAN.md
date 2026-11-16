# Group ad hoc follow-ups with their Done story

**Source:** [selected story](../../seeds/SEED-390-group-ad-hoc-follow-ups-with-their-done-story.md#group-ad-hoc-follow-ups-with-their-done-story)
**Identity:** SEED-390#group-ad-hoc-follow-ups-with-their-done-story

## Goal and scope

Find a Done story's ad hoc follow-ups on its Recently done card and follow
the source reference from Taken to that card. Open sessions remain in Taken;
Done removes that entry while preserving source, label, status and actions.

Terry's 2026-11-16 answer, “as recommended”, authorizes revealing a catalogued
source outside the normal 30-day window on demand. The default recent list,
session retention, selected story, and Side panel remain as before. Show
latest 10 or reload restores the default range; a source reference can reveal
the old card again. A missing or unreadable published record is a stated gap,
never a fabricated card. A Done session without an included source card keeps
standalone access.

Use the saved request's configured project and full `followUp.story.identity`.
Card, file, and line launches share this grouping rule while preserving their
distinct launch identities. Ordinary ad hoc launches and session-sourced
follow-ups retain their existing placement. No manual association, ancestry
inference, context-text parsing, migration, native-host change, cross-machine
session history, or new published story state is included. Preparation
authorizes no implementation.

## Reuse and architectural direction

Follow [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
(published workflow facts versus local launch evidence, Session entry and Story
card meanings, selection), [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
(one representation per domain responsibility), and the existing
[navigation contract](../../../docs/dashboard-navigation.md). The ADR index
and these records agree on Accepted status; no supersession or conflict applies.
The [Architectural North Star](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
already supports this derived projection; no new topic or ADR is warranted.

PFE findings and choices:

- Reuse retained `request.followUp.story`, preserved by `sessionListing.ts`,
  for the source relationship. Keep `storySessionsOf` and
  `completedStoryAssociation` as owners of their existing meanings: executing
  a story and proving that a launch completed a story are different from
  following it up. Do not broaden either to mean display membership.
- Change Recently done's existing projection (`recentlyDoneView.ts`), its
  card renderer, and Board input to include source follow-ups. Reuse
  `SessionEntry`/`StorySessions` for status and actions. Keep the original
  story-session collection distinct from display follow-ups so
  `StoryFollowUp`, `doneStoryFollowUp.ts`, and server `followUpStory.ts` still
  compose the same launch context and offer the same source actions.
- Reuse `useDoneDetails` for source titles with identity fallback, and
  `useStoryNavigation`, `useRecentlyDoneRange`, and `revealStory` for reveal,
  read feedback, cancellation, focus, and the destination cue. Modularize the
  existing semantic reference/title responsibility from
  `StoryCardDependencies.tsx` where useful; add no second navigation owner.
- Carry an explicit source reveal's inclusion of a catalogued older record
  through the page's disposable range. Do not bypass the age filter for
  ordinary references, change selection to force inclusion, or persist a new
  relationship. Show latest 10 and a reload discard that inclusion.
- Preserve the primary session destination: an open source follow-up still
  navigates to Taken from the sidebar; a historical display copy does not
  force that journey to expand Recently done. Marking Done resolves against
  the current record and can reveal its grouped destination. Closing a panel
  returns to its still-present opener; deletion keeps a useful nearby home.

Expected product edits are at most 250 lines at baseline. Keep growth cohesive:
extract the Recently done entry projection and membership
queries from its read/range hook as part of slice 1 if needed. `SessionEntry.tsx`
is exactly 250 lines: its existing contextual-action slot lets its owners add
the reference without expanding that shared renderer. `pageSidePanel.ts` is
247; its keyboard return already prefers the still-present opener. Any edit
that grows a file past 250 lines must split along its implicated responsibility
in the owning slice, with caller imports and observable proof preserved.

## Premises and preparation observations

Observed in this owned checkout at `d8e2b3487d2385ce1384000b48735aea1b0a506d`
on 2026-11-16. Target `43ae7f5be6ad3125386141646f879f85f2019806` adds only
another preparation profile. All scratch edits were reverted before writing;
these observations establish mechanisms, not delivered story proof.

1. **The saved source reaches the browser without full history.** A direct
   Node call constructed ad hoc records with `makeMe.aLaunchRecord`, passed
   open and Done variants through real `sessionListing`, and printed the
   retained `followUp.story` identity and revision with context absent. A
   disposable frontend fixture also passed card and line source records
   through `sessionListing` into the real app, exercising actual request
   validation and rendering. It observed no grouped sessions before or after
   reload. Adding a scratch source projection grouped both, retained the open
   Taken copies and ordinary ad hoc access, and survived reload. Command:
   `caffeinate -s -i npm run test:dashboard:frontend -- --workers=1 --reporter=line dashboard/frontend-tests/sessions/recently-done-follow-up-grouping.spec.ts dashboard/frontend-tests/sessions/recently-done-story-sessions.spec.ts dashboard/frontend-tests/sessions/recently-done-active-story-sessions.spec.ts`.
   Four cases passed in 7.0 seconds. With that projection removed, the scratch
   grouping case `--grep done=false` failed at the source card's session count,
   expected 2, observed 0. The two baseline compatibility cases also passed
   before the scratch change. This settles data availability and the display
   mechanism; the final distinct source group and Done operation remain
   slice 1's implementation and proof.
2. **The existing range proves exact reveal beyond the first batch.**
   `caffeinate -s -i npm run test:dashboard:integrated -- --workers=1 --reporter=line dashboard/tests/navigation/story-reference-done.spec.ts --grep 'a Done reference without sessions'`
   passed in 8.9 seconds. Setup publishes 35 real Done records through the
   isolated origin; assertions inspect card 27's focus, viewport, exact prefix,
   requested bodies, and preservation of a longer range. Limiting
   `useDestinationAnswer` to ten entries in a scratch edit made that same case
   fail at card 27's focus because the card was absent. The ordinary reference
   recovery case `--grep 'expired and unlisted'` passed in 8.2 seconds, proving
   today's age-filtered unavailable behavior; source navigation deliberately
   extends that behavior only for its explicit older source.
3. **An older source can use the same range without selecting it.** A
   disposable frontend case supplied twelve recent Done records, one
   catalogued 31-day-old source, and an open ad hoc request naming it. A
   scratch Taken source link carried explicit older-source inclusion through
   the real story-navigation/range owners. At 390×844 with reduced motion,
   keyboard activation focused the correctly titled old card in view, left no
   selected story, and Show latest 10 removed it. Command:
   `caffeinate -s -i npm run test:dashboard:frontend -- --workers=1 --reporter=line dashboard/frontend-tests/sessions/follow-up-source-window-probe.spec.ts`.
   Passed in 5.4 seconds; disabling only older-record inclusion made the same
   assertion fail because the source card was absent. Backend substitution is
   at the frontend service boundary; the catalog, range, card read/render, and
   focus code are real. This settles the frontend mechanism, not authenticated
   launch or final recovery proof.

Execution authors maintained cases at the intended paths below. Existing E2E
entry points were selected with `npm run test:e2e -- --list --reporter=list e2e/stories/recently-done-follow-up.spec.ts e2e/review/story-review-follow-up.spec.ts`.
No paid, credentialed, native-host, or developer-operated premise needs a probe.

## Ordered slices

### 1. Find open and Done follow-ups on their source story

Type: Behavior
Status: planned

Behavior: given a Done story and its card/file/line follow-ups, read or reload
the Board → the source card groups the related sessions with their own labels,
status and supported actions; open copies also remain in Taken. Mark a
follow-up Done → its Taken copy disappears while the same session stays
grouped. Other sources/projects and ordinary ad hoc sessions retain their
correct homes. No included source card leaves retained Done sessions
accessible as standalone entries. Later launches do not reorder the Done
story, and nested sessions add nothing to Recently done's top-level count.

Implement one source-membership rule using the existing saved identity, with
separate original story sessions and source follow-up display membership.
Apply the same membership to rendering, standalone fallback, held focus, and
counts. Session destinations retain primary-home semantics described above.
Update `dashboard/LAUNCH-FOLLOW-UP.md` and `AGENT-LAUNCH-HISTORY.md` with the
delivered placement and its source-versus-completion distinction.

Proof: frontend unit journeys in
`dashboard/frontend-tests/sessions/recently-done-follow-up-grouping.spec.ts`
exercise real app rendering with substituted service answers: two different
source anchors, per-session status, same identity in another project, reload,
Done transition, standalone fallback, primary navigation and focus return.
Reuse the existing MakeMe and focused session/card page-object owners. Extend
`e2e/stories/recently-done-follow-up.spec.ts` so a real card launch is grouped
and its original context/actions remain unchanged; align its old card-session
count with the newly promised display. Preserve its first-input assertions.
The existing file-launch E2E in `e2e/review/story-review-follow-up.spec.ts`
adds the source-card observation after the real launch, preserving its file
context and typed-instruction assertions. These exercise real persistence,
admission and service interaction through synthetic external host/GitHub APIs.

Sizing: 15 active minutes, medium confidence; projection, shared presentation,
and the two-home lifecycle form one outcome. No separate infrastructure slice.

### 2. Follow the source reference to its exact Done card

Type: Behavior
Status: planned

Behavior: given a Taken follow-up, activate its source title or identity
fallback → reveal/focus the exact source card, extending through an older
batch or explicitly including its catalogued record beyond 30 days. Preserve
a longer range, selection, Side panel and ordinary reference behavior. Read
failure or absence keeps the session accessible with the existing honest
feedback/retry; a newer user action wins over a late answer. Show latest 10
and reload restore the default range, and the link can reveal the source again.

Reuse the title read and semantic-reference owner; carry explicit older-source
inclusion through its existing disposable range rather than a new lookup or
navigation store. Update the launch/history and navigation contracts for the
delivered on-demand source reveal. Keep slice 1's display model unchanged.

Proof: frontend unit journeys in
`dashboard/frontend-tests/sessions/follow-up-source-navigation.spec.ts`
start with a real Taken source reference, exercise title/fallback, destination
beyond ten and beyond 30 days, reset/repeat, delayed/failed/absent records and
retry/cancellation. Include keyboard activation, a long source title, a narrow
reduced-motion viewport, preserved selected story and existing Side panel.
Run the existing `dashboard/tests/navigation/story-reference-*.spec.ts`
journeys to preserve default reference policy, exact range and cancellation.
Extend the representative real card/file launch journey's source-reference
assertions, without duplicating the frontend's detailed matrix in E2E.

Sizing: 15 active minutes, medium confidence; the scratch observation settled
the range integration, leaving the contextual reference and its proof.

## Outside-in proof ownership and consumer boundaries

| Source promise / affected consumer                                                                              | Owner and observable proof                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Card/file/line relationship, labels, status, reload, project isolation                                          | Slice 1 frontend grouping; real card/file launch E2E establishes saved-source propagation.                                                 |
| Done removes Taken, keeps grouping; ordinary and unshown-source access                                          | Slice 1 frontend transition/fallback, existing ad hoc/Done-entry suites.                                                                   |
| Two views of one session preserve actions, opener focus and primary sidebar destination                         | Slice 1 frontend lifecycle; inspect `pageEntries`, `sessionNavigation`, `keyboardReturn` and their session/report callers.                 |
| Display grouping does not change launch context, source actions, published state or completed-story association | Slice 1 card/file launch E2E retains first-input/source assertions; keep membership separate from the existing context/completion readers. |
| Counts, range, held focus, current and expired source cards                                                     | Slice 1 projection cases; slice 2 exact reveal/reset cases and existing story-reference suites.                                            |
| Title/fallback, keyboard/narrow access, preserved selection/panel, failures and newer user action               | Slice 2 frontend source-reference journeys and current reference recovery/cancellation suites.                                             |

For each implementation diff, generate and disposition the shared
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace),
including changed rendered text, aggregate card counts and session homes, not
only imports. Recheck source paths through the installed test-entry selector:
the intended frontend and E2E sources currently select MakeMe and page objects.
Recheck new paths before authoring. Keep the frontend service boundary real
below substituted responses; E2E alone claims launch/persistence integration.

## Local gates and delivery

Use the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Keep default timeouts and never `test.slow()`, under
[AGENTS.md](../../../AGENTS.md). Run post-change refactoring before commit.
Choose bounded focused checks for the affected consumers; the initial commands
are:

- `npm run test:dashboard:frontend -- --workers=1 dashboard/frontend-tests/sessions/recently-done dashboard/frontend-tests/sessions/follow-up-source-navigation.spec.ts dashboard/frontend-tests/sessions/agent-launch-ad-hoc-sessions.spec.ts dashboard/frontend-tests/sessions/agent-terminal-done`
- `npm run test:dashboard:integrated -- --workers=1 dashboard/tests/navigation/story-reference`
- `npm run test:e2e -- --workers=1 e2e/stories/recently-done-follow-up.spec.ts e2e/review/story-review-follow-up.spec.ts e2e/intent/intent-story-follow-up.spec.ts`
- `npm run typecheck:dashboard`, and eslint/Prettier on the changed files.

Run the applicable slice selection, then broaden for any additional consumer
the trace identifies; reuse sufficient unchanged proof. Inspect current host
load/memory and competing owned work before expensive runs. Preparation used
one worker on AC power with natural load around 14 on this 16-core Mac and
adequate free memory; this is not a future headroom guarantee. Start fully
awake and wrap long commands in `caffeinate -s -i` **on AC power**, under
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
On battery, plug in or follow that reference's lid-open `-i` and sleep-log rule.
Hosted CI retains its existing checks; planning adds no local full-suite gate
or CI observer. Execution owns delivery, applicable CI, and wrap-up.

## Plan review

Slice-plan refinement was not needed: grouping/lifecycle and explicit source
navigation are two independently useful Behavior outcomes, each within the
15-active-minute budget and the eight-slice limit. Both use one recorded-source
rule; neither adds a special recognizer per anchor, host, or status. Slice 1's
interim lack of a source link is replaced by slice 2. The age decision is
settled and its frontend mechanism was observed. No remaining slice-specific
concern or human-owned decision was identified in this review.
