# Reopen completed ad hoc work and its follow-ups under one identity

**Identity:** SEED-420#review-standalone-done-work
**Source:** [Reopen completed ad hoc work and its follow-ups under one identity](../../seeds/SEED-420-unified-intent-review.md#review-standalone-done-work)

## Goal and scope

A developer can return to a completed ad hoc session as a Done story. The
original session and later follow-ups appear under one card, and a second
clone can open the published result in Intent. The seed defines the
[scope and exclusions](../../seeds/SEED-420-unified-intent-review.md#review-standalone-done-work),
including local Done, existing associations and historical standalone
records. Session selection within Intent, follow-up context choices and
open follow-up card cues belong to their own stories.

The completed
[SEED-418 supplier](../../done/SEED-418_attribute-every-workflow-session-record.json)
owns the session close format, sealed comparison, and retry of a stopped
publication. Build on that boundary.

| Seed example | Proof owner |
| --- | --- |
| A lands with no story and is visible from another clone | 1 publishes, 5 lists, 6 opens its comparison |
| Lost response and repeated or racing Done converge on one close | 1 covers Land, 2 covers local writes |
| B follows up A under the same story and keeps its own UUID | 4 and 5 |
| A Taken story retains its association and status | 2 |
| C is marked Done without Land | 3 and 6 |
| Older standalone review and competing associations | 6 preserves standalone review, 7 handles the conflict |

## Current decisions

- Follow [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
  for recorded story membership, separate session identity and repository-owned
  publication. Follow [Review in Intent](../../../docs/dashboard-ux-ui-north-star.md#review-in-intent)
  for Done work grouping and opening the story comparison. Preserve the
  selection and Side panel behavior in
  [Board interaction](../../../docs/dashboard-board-interaction.md).
- Allocate `ad-hoc#<uuid>` from the original session's close UUID. For a
  Dashboard launch this is its reporting reference. Persist the identity on
  first Done or in the published record, using the existing done-record naming
  rule (`ad-hoc_<uuid>.json`). Keep the seed allocator and queued-story claim
  rules as they are.
- Extend [sealed close publication](../../../Distribution/src/skills/dough-execute-plan/scripts/sealed-session-record.mjs).
  Store the title and completion facts with the sealed close, so the initial
  write and resume produce the same done record. Reuse
  [done-record and catalog operations](../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-complete.mjs)
  and the publisher's catalog reconciliation. The session record, done record
  and derived catalog travel together in the close-record commit after Land
  accepts the work. Retain the published comparison's work endpoints. A
  follow-up publishes only its own session record.
- Dashboard Done remains local. Write the first Done time and attachment in
  the existing launch-record update shared by manual and reported completion.
  Reopening and marking the same session Done can reuse that identity. Use
  the retained session label for the local title. For a new Dashboard Land,
  carry that same label through the launch context, which currently supplies
  the UUID and target but lacks the title. Land invoked without Dashboard
  context can supply the native session's title. Preserve legacy Done rows
  without a usable recorded UUID and already published standalone closes.
- Use one membership rule for the Board, row selection and follow-up
  launches. Preserve explicit story launches, story follow-ups and verified
  completed-story association. An ad hoc follow-up from an attached session
  carries the same story and a fresh session UUID. Join local and published
  evidence by project and session UUID. Keep native controls when a retained
  launch represents a published record. Conflicting associations require a
  developer choice. Record that resolution locally against the observed
  candidates while retaining the published evidence.
- Reuse the published done catalog for completed cards. An unpublished local
  card uses launch evidence and is replaced by the published card with the
  same identity when available. Intent's completed-story reader currently
  needs claim and agent history. For this identity, recover the original
  session record at the pinned published revision, verify that it names the
  selected story, and reuse its exact pair for the overview and file
  admission. Use the published-session comparison facts, including shared
  checkout uncertainty, without requiring an execution-agent claim. Keep
  the story selected. Use the existing gap presentation when the comparison
  is unavailable. Follow-up ranges remain available from their existing
  individual review entry points.

## Planning observations

The observations exercise existing operations. New story behavior is owned
by the slices below.

| Operation | Observation and result |
| --- | --- |
| Decode a done record for the session-derived identity and scan identity evidence | Retained observation at `80da1cdb3`: `parseDoneRecordFile(doneRecordFileName(id), text)` accepted `ad-hoc_<uuid>.json`. The installed `identity-evidence --identity ad-hoc#…` query reported `next: SEED-421` and the missing catalog row with the disposable record. The work adds that catalog row through the existing builder. |
| Publish and resume a sealed Land close | At `3b242b92f`, `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh Distribution/tests/skills/dough-land/session-record-publication.test.mjs Distribution/tests/skills/dough-land/session-close-resume.test.mjs Distribution/tests/support/product-backlog-identity-evidence.test.mjs` exited 0 under the local sleep guard. The fixtures cover a work push whose result was lost, a stopped record stage, rebase after trunk advances and a competing close for the same UUID. |
| Read a pinned published session and admit its file | At `3b242b92f`, `npm run --silent test:dashboard:backend -- --workers=1 dashboard/backend-tests/review/published-session-review.spec.ts dashboard/backend-tests/review/published-session-listing.spec.ts dashboard/backend-tests/review/ad-hoc-session-quiet-done-receipts.spec.ts` passed all 16 cases under the guard. It observed anchored range and file reads, refusal off the recorded pair, pinned listing and a quiet Done retry while a native Done was pending. |
| Deduplicate published sessions by kept launch UUID | At `3b242b92f`, `node scripts/test-frontend.mjs dashboard/frontend-tests/sessions/recently-done-published-session-launch.spec.ts` passed all four mounted Chromium cases. The existing listing prefers both live and Done kept launches for a matching UUID. |
| Open a published comparison from another clone after trunk advances | At `3b242b92f`, `npm run test:e2e -- --workers=1 e2e/sessions/recently-done-published-sessions.spec.ts` under the guard passed the single- and multiple-range journeys. The shared-checkout case timed out on the loaded host while its assertions finished. An isolated one-worker run of the same command with `--grep 'warns that another machine'` passed in 15.3 s. Run the clone proof with one worker and check host load before running it alongside other browser work. |

## Slices

### 1. Land publishes an ad hoc Done story with its originating session

Type: Behavior
Status: done

Behavior: an ad hoc session with a valid close UUID, a title and no story →
Land → the accepted close commit holds the Done card facts, the updated
catalog and a session record naming `ad-hoc#<uuid>`. Resume uses the first
accepted conclusion after a lost response or a concurrent close for the same
UUID. A different published association is reported as a conflict. Land of
a follow-up keeps its named story and adds no second done record.

**Proof.** Extend the Land session-record publication and close-resume specs
with real Git fixtures. Assert the accepted record commit contains all three
artifacts, the catalog survives an intervening catalog write, the captured
range excludes the record commit, and a retry preserves title and close time.
Retain named-story, non-Dashboard and historical standalone close behavior.
Exercise the title handoff and include the identity contract update with the
behavior, using the repository's skill-authoring guidance.

The Land fixture reads all three artifacts from the accepted commit and
compares the recorded range with the original work. The recovery fixtures
hold the first title, time and comparison across lost responses, settle a
competing association as a conflict, and read both catalog entries after
reconciliation. A later unrelated shared-checkout commit stays local.
Both Dashboard title handoffs and the existing capture wire path passed.
The commands and assertions are indexed in `slice-1-implementation.md` in
the worktree's Git evidence directory.
The independent refactor reran the affected Land and Dashboard handoff
proof and typecheck. Its commands and observations are in
`slice-1-refactor.md` in the same directory. A losing concurrent close
retains the local candidate if normal retirement requires it.

### 2. Done writes one local attachment for the original session

Type: Behavior
Status: planned

Behavior: a kept ad hoc launch without a story → manual or quiet reported
Done → both write routes settle the same Done time and `ad-hoc#<uuid>` on
the retained launch. A linked session keeps its association, including a
follow-up of a Taken story whose Done leaves the story Taken. A legacy
record with no usable close UUID keeps its existing standalone behavior.

**Proof.** Extend the backend quiet-Done receipt and manual-Done path tests.
Assert the saved attachment and original Done time after repeated reporting
and a manual/report race. Observe the launch's published evidence and native
Done lifecycle through the existing entry points. Slice 3 reads this write.

### 3. Recently done shows and selects the local Done story

Type: Behavior
Status: planned

Behavior: C marked Done with no published done record → Recently done
shows C under the session title, and choosing its row selects its Done
story and records it in Recent stories. A published record of that identity
replaces the local card without duplicating it. The Board and Recently done
sessions use the same selection, and the Side panel stays as it was.

**Proof.** A frontend journey through Done, the Board card, the Recently
done sessions row and the bookmark. Use the typed local launch answer
and then a published catalog refresh. Slice 6 covers the selected story's
Intent comparison.

### 4. A follow-up keeps its parent story and gets a session of its own

Type: Behavior
Status: planned

Behavior: follow up from the Done card or its attached session → B starts
with its own UUID and the same story identity. A published card supplies the
story from the catalog. For a local card, the server verifies the story
against the originating Done launch. Marking B Done shows it under the
existing card, with A still present. The story remains Done and B has no
separate Done card.

**Proof.** Extend the Recently done follow-up grouping and membership specs
to observe the launch request and the transition into the parent card when B
is marked Done. Cover a local source through the follow-up admission, and
preserve the contexts sent by both follow-up actions.

### 5. Recently done groups published sessions on a second machine

Type: Behavior
Status: planned

Behavior: a clone without retained launches fetches a done catalog and the
published records for A and B → Recently done shows both under the same
Done card. A kept launch on the originating machine still stands for its
published row by UUID. A prior standalone record remains standalone. If B
lands before a local A has published its story, B's record still keeps that
association. The published card appears when A's close supplies its done
record.

**Proof.** Exercise the pinned published listing and the Board with an
empty local launch store, then with a kept launch for the same UUID. Assert
the card and its two UUIDs once each, along with a standalone record from
before the change. Reuse the existing published session row for each
individual comparison. Slice 6 proves the story review from that card.

### 6. Intent reads the Done story's originating comparison

Type: Behavior
Status: planned

Behavior: choose a published ad hoc Done story in a second clone after
trunk has advanced → Intent opens on A's recorded changes. Opening a file
uses the same admitted pair and shows A's edit. If the story has only a
local Done attachment, Intent names the missing published comparison.

**Proof.** Extend the published-sessions e2e journey to publish through the
close operation, open the Done card's Review changes and read a changed
file from another clone after an unrelated trunk change. Read a prior
standalone session through its existing row in that fixture. Exercise the
local-only gap through the same story-opening boundary. Preserve historical
review for selected Done stories and reject a file outside the admitted pair.

### 7. Recently done surfaces conflicting story association

Type: Behavior
Status: planned

Behavior: a session's retained and published evidence name different
stories → Recently done shows the candidates and withholds the session's
story placement until the developer chooses. After the choice the session
appears under the selected story once. The choice survives reload and does
not change either story's status or the published record.

**Proof.** A frontend journey through the conflict, the developer's choice
and reload. Inspect the retained write and the listing after refresh. A
candidate from another project or a stale choice cannot attach the session.
Until this slice delivers the choice, ambiguous membership stays unresolved.

## Local gates and review

- Use the maintained [machine sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  on AC power. Prefix focused commands with
  `caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR`.
  Use Bash 5 first on PATH for `bash scripts/test.sh <paths>`, the dashboard
  group runners for the specs named above, and `npm run test:e2e -- <spec>`
  for the real clone journey. Run suites sequentially. Use
  `npm run typecheck:dashboard` for changed cross-boundary types and
  `npm run lint` for changed product sources. Apply the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Slice-plan refinement separated published listing from opening and reading
  the story in Intent. Each of the seven slices has a single proof loop.
  Slices 2 and 5 supply the local and durable evidence that slices 6 and 7
  consume. No remaining slice-specific concern was found.

## Execution context

- Maria-chan, Story Branch Mode, publisher `dashboard-territory.local-open-dough`.
  The Take `7a3a582dba57d4fb03d965c7db29f99cac345c36` was accepted on
  `origin/main` and published as the starting tip of
  `origin/codex/reopen-completed-ad-hoc-work-and-its-follow-ups`. The worktree
  is `.worktrees/reopen-completed-ad-hoc-work-and-its-follow-ups` relative to the
  repository's default checkout. The starting revision was
  `8a41b269fa1b1591fb5f1e55a62dde54a2a6b2e2`. Locked setup ran `npm ci` and
  confirmed TypeScript 6.0.3 from this worktree.
- Codex observes GitHub Actions `ci.yml` (CI) on the remote execution branch.
  Coordinator `maria-chan-seed-420`, mailbox `/tmp/dough-ci-501/watch-ko8sUU`,
  PID `23782`, stream session `12451`, cell `g375:8`.
