# Keep story sessions linked until deliberately closed

## Source and authority

- **Identity:** SEED-052#keep-story-session-links
- **Source:** [story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#keep-story-session-links),
  refined with Terry on 2026-09-29.
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication.

## Outcome and boundaries

A developer who launches execution or refinement from a story finds and
reopens its sessions on that story's card while the work progresses. A
session leaves the card only when the developer marks it done.

Key examples (from the story):

1. Start execution on a Ready Backlog story → the card lists an Execution
   session, Working, with Open terminal, and still offers Start execution. After
   origin shows the story Preparing and then Taken, the Taken card still lists
   the session.
2. Start refinement on a Backlog story that origin later shows Preparing → the
   card keeps the Refinement session. A second Start refinement adds a second
   entry.
3. A listed session stops, the dashboard restarts, and the developer switches
   project and back → the card still lists it as Stopped, and Open terminal
   attaches.
4. Claude Code no longer lists a session → the card shows Session unavailable
   without Open terminal. Mark as done on that entry removes it from the card
   without `claude stop`, and Recent sessions shows it Done.
5. A session marked done from the terminal panel leaves its card, and its
   Recent sessions entry keeps Open terminal. It is no longer answered 30 days
   after its done time. An unclosed session launched 40 days ago is still listed
   on its card and in Recent sessions.
6. Closing the terminal panel, or losing its connection, leaves the session
   listed on its card.

Constraint (story): session facts stay local evidence and never move a story
between stages or establish its progress or completion.

Excluded (story): a completed-story view and completion evidence (the
Recently done candidate); sessions this dashboard did not launch. A story
that leaves every list keeps its sessions only in Recent sessions.

## Current decisions

- **One membership rule:** a launch record belongs on its story's card, in
  whatever stage origin shows that story, until the record has `doneAt`.
  Story stage, session state, and age do not affect membership. This replaces
  `launchAwaitsPublication`, `sessionMayRun`, and `latestRecordOf` in
  `src/agentLaunch.ts`, and the Backlog-only record filter in
  `src/WorkStages.tsx`. They are deleted, not kept beside the new rule.
- **One session entry:** a card's session and a Recent sessions entry show
  their session the same way: state words, workflow, launch time, session id,
  and Open terminal. The state words move out of `RecentSessions.tsx` into the
  shared entry that both use. The card entry leaves out the story title and
  identity that the card already shows. `LaunchStarted.tsx`, its
  "not yet published" wording, and the Started words are removed.
- **Start actions:** `StartLaunch` stays on Backlog cards with its existing
  notes, whatever sessions are listed. The Preparing note "Being prepared"
  stays, but its comment about settling goes. Taken cards list sessions and
  offer no Start action.
- **Focus after launching from a card:** the keyboard lands on the new session
  entry on that card, as it landed on Started before.
- **One Mark as done path:** a card entry's Mark as done and the panel's go
  through the same page operation (`TerminalSplit`'s done handling, using
  `useAgentLaunches().markDone`). A panel open on the marked session closes, and
  focus follows terminal-residue's rule: the opener while it is on the page,
  otherwise the session's Recent sessions entry. The boundary
  (`server/doneMarks.ts`) runs `claude stop` only for a session Claude Code
  still lists. It already types the rename only through an open attachment,
  which an unlisted session cannot have.
- **Focus when the opener is gone** (Terry, 2026-09-29): when the opener has
  left the page and the session's Recent sessions entry offers no Open
  terminal (for example Session unavailable), focus goes to that Recent
  sessions entry itself, made programmatically focusable. When the session's
  entry is not on the page (another project), focus goes to the Recent
  sessions region. Focus follows the session to where it now lives.
- **Rename typing stays** (Terry, 2026-09-29): Mark as done keeps typing
  `/rename done-…` only through an open attachment, as today. A card entry
  without its panel open types nothing.
- **Done wording for an unlisted session:** Recent sessions shows Done for a
  session marked done even when Claude Code no longer lists it (today
  `sessionStateWords` answers Session unavailable for every unlisted session).
- **Retention:** `server/launchRecordStore.ts` keeps a record without
  `doneAt` indefinitely and a done record for `launchRetentionDays` after its
  `doneAt`. The shared constant keeps its name and value.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| Started and its settlement live only in the client, and the records answered by the server are already the whole kept list. | Read `src/CardLaunches.tsx`, `src/LaunchStarted.tsx`, `src/agentLaunches.ts`, `src/WorkStages.tsx:170-176`, `src/agentLaunch.ts`. `grep -rn "launchAwaitsPublication\|latestRecordOf\|LaunchStarted" dashboard/src dashboard/server dashboard/tests`. | Yes. `WorkStages` filters records with `launchAwaitsPublication` and passes them only to the Backlog stage. There are no other consumers. |
| Taken cards receive no launch records today. | `src/WorkStages.tsx`: `WorkCard`'s `launches` prop is "Backlog cards only". | Yes. Slice 1 must pass records to Taken cards without offering Start there. |
| Retention counts from `launchedAt` only, and both reads and writes apply it. | `server/launchRecordStore.ts` `withinRetention`, used by `keptRecords` and `replaceRecords`. | Yes. There is one filter to change. |
| The boundary stops every done session, whatever its listing. | `server/doneMarks.ts` `markSessionDone` always calls `stopClaude`. | Yes. Slice 2 adds the listed-only condition. |
| The fake `claude` can forget or stop a session, and its calls can be asserted. | `tests/fixtures/fake-claude` header (appends argv to `calls.jsonl`, `stop` handling) and the header of `tests/agent-launch-session-settlement.spec.ts` (controls end, forget, or fail to list a session). | Yes. Example 4's "without `claude stop`" is observable at the boundary. |
| Records can be seeded with old launch times. | `tests/agent-launch-records.spec.ts:111-131` (`recordLaunchedDaysAgo`, `seedStore`). | Yes. Slice 3 extends the seeding with `doneAt`. |
| The focused proof commands run locally. | From the main checkout at `3da84888`: `npx playwright test --config dashboard/playwright.config.ts --reporter=line dashboard/tests/agent-launch-records.spec.ts dashboard/tests/agent-launch-session-settlement.spec.ts dashboard/tests/agent-launch-done.spec.ts`. | 11 passed (5.7s). |
| Execution starts from a trunk that contains SEED-052#terminal-residue. | Fetched `origin/main` at `f9fe3fdc` contains `27a08c8c Close SEED-052#terminal-residue`. Read `src/TerminalSplit.tsx` (opener, else `recentSessionControl`), `src/terminalOpening.ts`, `src/RecentSessions.tsx` (`sessionStateWords`), `src/CardLaunches.tsx`, `server/doneMarks.ts`, and `server/claudeLaunch.ts`. | Yes. The landed modules and focus rule match this plan's decisions. |
| SEED-052#preparing-card-refinement-journey (plan 154) is Taken at `f9fe3fdc` and edits the same Preparing steps in the settlement and Recent sessions specs. | `.planning/PRODUCT-BACKLOG.md` Taken section. | Slice 1 rebases onto whatever plan 154 lands and keeps one Preparing-card journey. |

## Slices

### 1. A story's card lists its unclosed sessions in every stage, beside its Start actions
Type: Behavior
Status: done
Accepted proof: `npm run typecheck:dashboard`; `npx playwright test --config
dashboard/playwright.config.ts --reporter=line` over
`agent-launch-card-sessions`, `agent-launch-card-session-states`,
`agent-launch-card`, `agent-launch-card-problems`,
`agent-launch-recent-sessions`, `agent-launch-recent-session-states`,
`agent-terminal`, `agent-terminal-done`, `agent-terminal-lifetime`,
`agent-launch-done`, `agent-launch-records`, `accessible-overview`,
`accessible-overview-keyboard`, `backlog-preparing`, and `published-work`
specs: 36 passed.
Learnings: the shared entry is `src/SessionEntry.tsx` (`namesStory`), the
membership rule is `cardSessionsOf`, and `ProjectLaunches.start` resolves to
the launched record so focus lands on the new entry. The test journey is now
`tests/storyStagesPage.ts` (`openStoryStagesJourney`). Plan 154 removes the
same Recent sessions Preparing step; expect a trivial conflict.
Proof: rewritten `agent-launch-settlement.spec.ts` journey (examples 1, 2),
rewritten `agent-launch-session-settlement.spec.ts` (example 3 and the
unavailable and unknown states on the card), `agent-launch-card.spec.ts`
(entry after starting, action still offered, focus), and a Close step on a
card session in `agent-terminal-close.spec.ts` or the settlement journey
(example 6). `npm run typecheck:dashboard`.

Behavior: A Backlog story with a confirmed launch shows the session on its
card, alongside both Start actions. After origin shows the story Preparing or
Taken, and after the session stops, becomes unlisted, or its listing becomes
unreadable, and across reloads, project switches, and dashboard restarts, the
card still lists the session with the state Recent sessions shows. A
refinement launched on a Preparing card is listed there at once. Two launches
are two entries. Taken cards list sessions and offer no Start.

Remove `LaunchStarted.tsx` and the settlement functions under the decisions
above. Extract the shared session entry from `RecentSessions.tsx`. Update
`AGENT-LAUNCH.md` (replace the Started and settlement paragraphs with the
card's session list; rewrite the note on a Preparing refinement), the North
Star's "Launch actions / Started / Recent sessions" row, and
`dashboard/tests/README.md`'s listing of the renamed or rewritten specs. Rename
the two settlement specs to describe the listing, for example
`agent-launch-card-sessions*.spec.ts`. Remove the Recent sessions spec's
Preparing step that only proved "no Started", leaving the Preparing listing to
the card journey. Change `agent-terminal-done.spec.ts`'s "offers Start again"
to "the session leaves its card".

### 2. Mark as done on a card's session closes it, even when Claude Code no longer lists it
Type: Behavior
Status: done
Accepted proof: `npm run typecheck:dashboard`; `npx playwright test --config
dashboard/playwright.config.ts --reporter=line` over `agent-launch-done`,
`agent-launch-done-refusal`, `agent-terminal-done`, `agent-launch-card-done`,
`agent-launch-card-sessions`, `agent-launch-card-session-states`,
`agent-launch-card`, `agent-launch-recent-sessions`,
`agent-launch-recent-session-states`, `agent-terminal`,
`agent-terminal-close`, `agent-terminal-lifetime`, and `agent-launch-records`
specs: 27 passed. The unlisted case is `agent-launch-done.spec.ts` "marks a
session Claude Code no longer lists without stopping it"; the page case is
`agent-launch-card-done.spec.ts`.
Learnings: `server/doneMarks.ts` stops unless `AgentLaunches.stateOf` answers
unlisted, so an unreadable listing still stops the session. Card entries and
the panel share `useMarking` and `SessionsOnPage.markDone`; focus falls back
through `sessionKeyboardHome`. Untested: the Recent sessions region fallback
for another project's session. Run Playwright from the checkout root.
Proof: `agent-launch-done.spec.ts` gains an unlisted-session case: the fake
forgets the session, the done POST answers the marked record, `calls.jsonl`
has no `stop`, and the mark survives a restart. The card journey (in the slice 1
card-sessions spec, or `agent-terminal-done.spec.ts`) covers example 4 on the
page and marking from a card while the panel shows that session: the panel
closes, the entry leaves the card, Recent sessions shows Done, and focus lands
on that Recent sessions entry. `npm run typecheck:dashboard`.

Behavior: Every session listed on a card offers Mark as done. Marking removes
it from the card, and Recent sessions shows it Done under its `done-` name. A
listed session is stopped as today. An unlisted session only records its done
time. A terminal panel open on the marked session closes through the same
operation as the panel's own Mark as done. An unlisted session marked done shows
Done in Recent sessions. When the opener is gone and that entry offers no Open
terminal, focus lands on the entry itself.

Update `AGENT-LAUNCH.md`'s Mark as done paragraph (where it is offered, and
stop only for a listed session) and the North Star row.

### 3. Unclosed sessions are kept indefinitely; done ones 30 days after marking
Type: Behavior
Status: planned
Proof: `agent-launch-records.spec.ts` retention case rewritten with seeded
records: unclosed and launched 40 days ago is answered; launched 60 days ago
and done 29 days ago is answered; done 31 days ago is not answered. A launch
write then drops only the last. `npm run typecheck:dashboard`.

Behavior: Reads and writes of the launch store keep every record without a
done time. They drop a done record once its done time is more than 30 days old.
Recent sessions says that sessions marked done are kept for 30 days after
marking, instead of "kept on this machine for 30 days".

Update `launchRecordStore.ts`'s header and `launchRecordSchema`'s comment,
`AGENT-LAUNCH.md`'s retention sentence, and the North Star row if it states
retention.

## Proof ownership

| Promise | Owner |
| --- | --- |
| Card lists its sessions through Preparing and Taken; Start still offered; Taken offers none | 1: card-sessions journey |
| Stopped, unavailable, or unknown sessions stay on the card; restart, reload, and switch keep them | 1: card-sessions state spec |
| Two launches are two entries | 1: card-sessions journey |
| Close or disconnect keeps the card listing | 1: Close step |
| Focus lands on the new entry after launching | 1: `agent-launch-card.spec.ts` |
| Mark as done from a card entry; panel closes; focus | 2: page case |
| Unavailable session marked done without `claude stop` | 2: `agent-launch-done.spec.ts` |
| Done session leaves the card; Recent sessions keeps Done and Open terminal | 2: page case; the existing `agent-terminal-done.spec.ts` for the panel path |
| Retention from done time; unclosed never dropped | 3: `agent-launch-records.spec.ts` |
| Session facts never move a story | Existing journeys: origin alone places the story in every step above |

## Delivery checks

Focused Playwright specs per slice, plus `npm run typecheck:dashboard`. Check
`npm run format`'s exit status directly, as in plan 155, because this
repository has no commit hook. Run the `dough-post-change-refactor` pass before
each commit. The whole dashboard suite is not a local gate. There are no payload
or skill changes.

## Concern review

The three slices each have one outcome and one proof loop: card membership,
deliberate closure, and retention. Slice 2 depends on slice 1's card entry.
Slice 3 is independent and could run first. The cumulative design has one
membership rule, one session entry, and one Mark as done path; later slices
extend it without a second representation. Slice 1 is the largest: it removes
Started and rewrites two specs. It stays one slice because removing the
settlement rules is exactly what makes the listing persist, and splitting by
stage would leave an interim card that drops Taken sessions. Terminal-residue
has landed and the decisions left open for Terry are settled, so no concern
remains.
