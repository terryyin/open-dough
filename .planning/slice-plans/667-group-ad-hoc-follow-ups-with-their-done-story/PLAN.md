# Group ad hoc follow-ups with their Done story

**Source:** [selected story](../../seeds/SEED-390-group-ad-hoc-follow-ups-with-their-done-story.md#group-ad-hoc-follow-ups-with-their-done-story)
**Identity:** SEED-390#group-ad-hoc-follow-ups-with-their-done-story

## Goal and scope

An open follow-up of a Done story is an entry in Taken that names its source
and reveals that story's Recently done card. Marked Done, it leaves Taken and
is held by the source card with the story's other closed sessions, keeping
its label, status and actions. Reopened, it returns to Taken.

Terry's 2026-11-16 answers settle two boundaries. “One home”: a follow-up is
never shown in Taken and on the card at once; the card holds only closed
sessions, as it does today. “As recommended”: a source reference reveals a
catalogued source outside the normal 30-day window on demand. The default
recent list, session retention, selected story, and Side panel remain as
before. Show latest 10 or reload restores the default range; a source
reference can reveal the old card again. A missing or unreadable published
record is a stated gap, never a fabricated card. A Done follow-up whose
source card is not included keeps its standalone entry.

Use the saved request's configured project and full `followUp.story.identity`.
Card, file, and line launches share this rule while preserving their distinct
launch identities. Ordinary ad hoc launches and session-sourced follow-ups
retain their existing placement. Excluded: a card cue for follow-ups still
open in Taken, a standalone Done follow-up naming its source, earlier
follow-ups in a new follow-up's context, manual association, ancestry
inference, context-text parsing, migration, native-host change, cross-machine
session history, and new published story state. Preparation authorizes no
implementation.

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
- Change Recently done's existing projection (`recentlyDoneView.ts`
  `newestFirst`) so a listed source card also holds its closed follow-ups;
  `held` then removes them from the standalone list, and range, held focus,
  and counts follow the one `Listed` shape. Board already passes only Done
  sessions there, so open follow-ups stay Taken's local entries unchanged.
  `RecentlyDoneEntry` passes one `sessions` list to the card's display and
  to `StoryFollowUp`'s offer and context: carry the follow-ups as a separate
  collection so `StoryFollowUp`, `doneStoryFollowUp.ts`, and server
  `followUpStory.ts` still compose the same context and offer.
- Reuse `useDoneDetails` for source titles with identity fallback, and
  `useStoryNavigation`, `useRecentlyDoneRange`, and `revealStory` for reveal,
  read feedback, cancellation, focus, and the destination cue. Modularize the
  existing semantic reference/title responsibility from
  `StoryCardDependencies.tsx` where useful; add no second navigation owner.
- Carry an explicit source reveal's inclusion of a catalogued older record
  through the page's disposable range. Do not bypass the age filter for
  ordinary references, change selection to force inclusion, or persist a new
  relationship. Show latest 10 and a reload discard that inclusion.
- A session keeps one Board home, so sidebar destinations, opener return, and
  deletion keep their existing rules: a Done follow-up's home is its source
  card when listed, as a Done story session's is.

Expected product edits are at most 250 lines at baseline. Keep growth cohesive:
extract the Recently done entry projection and membership
queries from its read/range hook as part of slice 1 if needed
(`recentlyDoneView.ts` is 248 lines). `SessionEntry.tsx`
is exactly 250 lines: its existing contextual-action slot lets its owners add
the reference without expanding that shared renderer. `pageSidePanel.ts` is
247; its keyboard return already prefers the still-present opener. Any edit
that grows a file past 250 lines must split along its implicated responsibility
in the owning slice, with caller imports and observable proof preserved.

## Premises and preparation observations

Observation 1 ran in this owned checkout at
`0ff63d1ad575f443aaf7e47c0ec2ee194cdcfde5` on 2026-11-16. Observations 2 and 3
are retained from the same day at `d8e2b3487d2385ce1384000b48735aea1b0a506d`.
Since then `dashboard/src`, `dashboard/server` and the frontend test support
are unchanged; `dashboard/tests/support/claudeLaunch.ts`, which observation
2's spec imports, changed, so its reveal case was rerun at `0ff63d1ad` and
passed in 7.1 seconds. All scratch edits were reverted before writing; these
observations establish mechanisms, not delivered story proof.

1. **A closed follow-up nests through the existing projection, and its
   neighbours do not observe the old placement.** A disposable frontend case
   passed a Done ad hoc record whose saved `followUp.story.identity` names a
   listed Done story through real `sessionListing` into the real app. A
   scratch edit of `newestFirst` added a card's same-project closed follow-ups
   to its sessions. The rendered tree showed the article “Ad hoc session for
   Probe follow-up” inside the card “Explain the CI pause”; with the edit
   removed the same case failed because the card held no such text. With the
   edit applied,
   `caffeinate -s -i npm run test:dashboard:frontend -- --workers=1 --reporter=line dashboard/frontend-tests/sessions/recently-done dashboard/frontend-tests/sessions/agent-launch-ad-hoc-sessions.spec.ts dashboard/frontend-tests/review/story-review-diff-syntax-arrival.spec.ts dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts dashboard/frontend-tests/stories/recently-done`
   passed 51 cases in 56.5 seconds: no existing frontend case observes a
   closed story follow-up as standalone. No spec under `e2e/` or
   `dashboard/tests/` marks a story follow-up Done (searched `markedDoneAt`
   and `doneAt` in the follow-up specs; each closes only the story's own
   sessions), and the server reads no display membership. Unverified
   remainder: the scratch rule fed the follow-ups into the card's single
   `sessions` list; the separate collection is slice 1's implementation.
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

Execution authors maintained cases at the intended paths below. The E2E
entry point was selected at `0ff63d1ad` with
`npm run test:e2e -- --list --reporter=list e2e/stories/recently-done-follow-up.spec.ts`
(one test listed).
No paid, credentialed, native-host, or developer-operated premise needs a probe.

## Ordered slices

### 1. Find closed follow-ups on their source story

Type: Behavior
Status: planned

Behavior: given a Done story with open card and file or line follow-ups, read
the Board → each is a Taken entry and the card holds neither. Mark one Done →
it leaves Taken and the source card holds it with its own label, status and
actions; mark the other → the card holds both; reload preserves this. Reopen
one → it returns to Taken. A closed follow-up of another story, or of a
same-identity story in another project, does not join them. A closed
follow-up whose source card is not listed stays a standalone entry. The
card's Follow up offer and the context it names are as before.

Implement one source-membership rule on the saved identity, used by the
Recently done projection, with the story's own sessions kept as a separate
collection from the follow-ups the card displays. Update
`dashboard/LAUNCH-FOLLOW-UP.md` and `AGENT-LAUNCH-HISTORY.md` with the
delivered placement and its source-versus-completion distinction.

Proof: frontend unit journeys in
`dashboard/frontend-tests/sessions/recently-done-follow-up-grouping.spec.ts`
exercise real app rendering with substituted service answers, one behavior
per case: closing moves a follow-up from Taken to its source card; two
anchors of one story share the card; reopening returns it; another story's
and another project's follow-ups stay apart; an unlisted source leaves the
entry standalone; a card holding a closed follow-up names the same Follow up
context. Each case observes its own subject, not the whole column. Reuse the
existing MakeMe and focused session/card page-object owners. No E2E change:
the real launch journey's card stays as it was while the follow-up is open,
which `e2e/stories/recently-done-follow-up.spec.ts` already asserts.

Sizing: 10 active minutes, medium confidence; observation 1 settled the
projection, leaving the separate collection and its proof.

### 2. Follow the source reference to its exact Done card

Type: Behavior
Status: planned

Behavior: given a Taken follow-up, its entry names the source story by title,
or by identity while the title is unread or unavailable. Activate it →
reveal/focus the exact source card, extending through an older batch or
explicitly including its catalogued record beyond 30 days. Preserve a longer
range, selection, Side panel and ordinary reference behavior. Read failure or
absence keeps the session accessible with the existing honest feedback/retry.
Show latest 10 and reload restore the default range, and the link can reveal
the source again.

Reuse the title read and semantic-reference owner; carry explicit older-source
inclusion through its existing disposable range rather than a new lookup or
navigation store. Update the launch/history and navigation contracts for the
delivered on-demand source reveal. Keep slice 1's display model unchanged.

Proof: frontend unit journeys in
`dashboard/frontend-tests/sessions/follow-up-source-navigation.spec.ts`
start with a real Taken source reference: title and identity fallback; a
destination beyond ten by keyboard on a narrow reduced-motion viewport with a
selected story and open Side panel kept; a destination beyond 30 days, reset
and repeat; a failed and an absent record. Cancellation by a newer action and
default reference policy belong to the navigation owner: run the existing
`dashboard/tests/navigation/story-reference-*.spec.ts` journeys unchanged to
show they are preserved. Extend `e2e/stories/recently-done-follow-up.spec.ts`
with one observation after its real card launch: the Taken entry names the
source story. This alone claims launch and persistence integration; file and
line launches save the same field.

Sizing: 15 active minutes, medium confidence; the scratch observation settled
the range integration, leaving the contextual reference and its proof.

## Outside-in proof ownership and consumer boundaries

| Source promise / affected consumer | Owner and observable proof |
| --- | --- |
| Open in Taken only; closed on the source card; reopen returns; reload | Slice 1 frontend grouping cases. |
| Card/file/line share one source; other story and project stay apart | Slice 1 frontend grouping cases. |
| Unlisted source keeps the standalone entry; ordinary ad hoc unchanged | Slice 1 fallback case; existing ad hoc and Done-entry suites (observation 1). |
| Card's Follow up offer, context, published state and completed-story association unchanged | Slice 1 context case; existing card-launch E2E “leaves the card as it was”. |
| Counts, range and held focus with nested follow-ups | Existing Recently done suites over the one `Listed` shape (observation 1). |
| Source title/fallback, exact reveal beyond ten and beyond 30 days, reset, failures | Slice 2 frontend source-reference journeys. |
| Default reference policy, exact range, cancellation | Existing story-reference suites, unchanged. |
| A real launch's saved source reaches the Taken entry | Slice 2 observation in the card-launch E2E. |

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

- `npm run test:dashboard:frontend -- --workers=1 dashboard/frontend-tests/sessions/recently-done dashboard/frontend-tests/stories/recently-done dashboard/frontend-tests/sessions/follow-up-source-navigation.spec.ts dashboard/frontend-tests/sessions/agent-launch-ad-hoc-sessions.spec.ts`
- `npm run test:dashboard:integrated -- --workers=1 dashboard/tests/navigation/story-reference`
- `npm run test:e2e -- --workers=1 e2e/stories/recently-done-follow-up.spec.ts`
- `npm run typecheck:dashboard`, and eslint/Prettier on the changed files.

Run the applicable slice selection, then broaden for any additional consumer
the trace identifies; reuse sufficient unchanged proof. Inspect current host
load/memory and competing owned work before expensive runs. Preparation used
one worker on AC power with natural load around 6 to 14 on this 16-core Mac
and adequate free memory; this is not a future headroom guarantee. Start fully
awake and wrap long commands in `caffeinate -s -i` **on AC power**, under
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
On battery, plug in or follow that reference's lid-open `-i` and sleep-log rule.
Hosted CI retains its existing checks; planning adds no local full-suite gate
or CI observer. Execution owns delivery, applicable CI, and wrap-up.

## Plan review

Slice-plan refinement was not needed: closed-follow-up grouping and source
navigation are two independently useful Behavior outcomes, each within the
15-active-minute budget and the eight-slice limit. Both use one recorded-source
rule; neither adds a special recognizer per anchor, host, or status. Slice 1's
interim lack of a source link is replaced by slice 2. Both human-owned
boundaries are settled and their frontend mechanisms were observed. No
remaining slice-specific concern or human-owned decision was identified in
this review.
