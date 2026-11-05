# Read session assignment history when Session details opens

**Identity:** SEED-240#read-session-assignments-on-demand
**Source:** [selected story](../../seeds/SEED-240-reliable-dashboard-updates-and-session-details.md#read-session-assignments-on-demand)
**Source review:** [source review](source-review.md)
**Prepared:** 2026-11-05; preparation only. Execution is not authorized by this plan.

## Goal and boundaries

A Session entry asks for its historical assignment credit only while its
Session details are open; opening them reads and shows that session's original
allocation as today, closing them abandons the page's read, and reopening asks
again through the existing readers. The story section owns the goal, scope,
key examples and selected approach; this plan does not restate them.

Included: gating the assignment line's read on disclosure in
`dashboard/src/SessionEntry.tsx` / `dashboard/src/SessionDetails.tsx` (and
`dashboard/src/SessionAssignment.tsx` only if the gate belongs there), the
request-proof updates to `dashboard/tests/session-attribution.spec.ts`, and
one sentence in `dashboard/GITHUB-REQUESTS.md`. Excluded (from the story):
distinguishing unreadable from unrecorded history in wording, a page-held
answer across close and reopen, and credit recorded in the local launch
record.

**Failure policy:** [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to execution, verification, delegation and repair
handoffs.

**Local gate:** the slice runs `npm run lint`, `npm run typecheck:dashboard`
and its focused proof
(`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts <specs> --reporter=list`
with Homebrew Bash 5 first on `PATH`; a fresh worktree first runs
`node scripts/setup-native.mjs npm` and `browser`). The change touches only
browser components that every Session entry renders, and the consumer
observation below already ran the specs that depend on them, so no whole local
suite is required before landing. Running `npm run test:dashboard` anyway
follows the maintained
[macOS sleep guard and power condition](../../../tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake; on AC use `caffeinate -s -i`; on battery plug in or keep
the lid open under `caffeinate -i` and inspect the sleep log afterwards.
Hosted CI on the published revision remains owned under the failure policy.

## Existing solutions and direction

- **Gate the existing component on disclosure.** `SessionEntry` already holds
  `detailsOpen` and renders `SessionDetails` hidden; render
  `SessionAssignment` only while open. Its effect already aborts on unmount
  and creates a fresh `ObservationOutcomes` per run, so closing abandons the
  read and reopening asks again without new state. The server's pinned memo
  (`dashboard/server/pinnedTexts.ts`) supplies GitHub-side reuse. Keep the
  rest of `SessionDetails` rendered hidden as today; only the historical read
  is gated.
- **Rejected:** a page-level answer cache (adds state and a failure-retry rule
  the server memo makes unnecessary); unmounting all of `SessionDetails` when
  closed (changes unrelated local content for no request saving); prefetch on
  hover or focus (adds unrequested reads).
- **Browser-level hold and failure.** Playwright `page.route` on the
  authenticated-read endpoint, filtered by the session's saved revision, holds
  or fails the historical read without touching the fake GitHub, as
  `dashboard/tests/intent-gherkin-unusable.spec.ts` already routes that
  endpoint.
- Accepted ADR: [0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  (published assignment facts stay in the repository; machine-local evidence
  only supplements); no conflict. No North Star topic governs this choice.

## Decisive premises observed during preparation

| Premise | Consuming operation | Observation (form, profile) | When | Result |
| --- | --- | --- | --- | --- |
| Collapsed entries ask for historical reads today, and expanding adds none | Browser requests of the `session-attribution.spec.ts` fixture (three entries at saved revisions `refiningAllocation`, none, `ff…ff`), collected with `page.on("request")` | Scratch `dashboard/tests/zz-scratch-collapsed-reads.spec.ts`, local-gate Playwright command; removed | 2026-11-05 at `ba4696daf` | Collapsed: 3 `agents=profiles` and 2 `committed=added` at saved revisions, beside the Board's own reads at its revision; after expanding one entry: none |
| Gating on disclosure removes them and expanding reads them (discrimination) | Same | Same scratch with a scratch gate (`open && <SessionAssignment …/>` fed from `detailsOpen`); reverted | Same | Collapsed: none; after expanding: 1 `agents=profiles` and 1 `committed=added` at the saved revision |
| Which specs depend on the collapsed read | The 11 specs naming the assignment line or counting profile reads, plus 8 session specs counting requests, local-gate command, scratch gate applied | Two runs; reverted | Same | Only `session-attribution.spec.ts` fails (`toContainText` of the historical line on a collapsed entry); 22 + 20 others pass |
| A browser route can hold and fail the read for the close and failure examples | Scratch `zz-scratch-route.spec.ts` on the same fixture with the scratch gate: route holds then fails `committed=added` at the saved revision | Local-gate command; removed and reverted | Same | Opened → "Reading human developer…"; closed and released → no assignment line later; reopened → "Human developer unknown"; route then passed through, closed and reopened → "Integration Checkout" credit. At the close only the saved-revision profile listing had been asked, so the abandoned read was not the held addition; the slice's proof therefore holds the first saved-revision request |

## Outside-in proof

| Promise (story example) | Slice | Observation |
| --- | --- | --- |
| Collapsed entries at different saved revisions ask nothing historical; the Board's own read still happens | 1 | `session-attribution.spec.ts`: requests at saved revisions are none after the overview settles; one Board `agents=profiles` at its revision |
| Expanding one entry reads and shows its original allocator despite a reused name; others still ask nothing | 1 | Same spec, existing reused-name assertions moved behind opening that entry; request list gains only that entry's saved revision |
| A duplicate of the story card's assignment is omitted once known | 1 | Same spec's matching entry: opened, `.session-assignment` count reaches 0, other details visible |
| Closing during the read shows nothing later; reopening reads again | 1 | Same spec: route holds the entry's first saved-revision request, close, release, no assignment line; reopen shows credit |
| Unreadable history keeps local facts and "Human developer unknown"; reopen asks again | 1 | Existing `ff…ff` entry, opened; plus the route failing once then passing through on reopen |
| Request accounting names the on-demand cost | 1 | `dashboard/GITHUB-REQUESTS.md` sentence |

## Slices

### 1. Session details read historical credit only while open

Type: Behavior
Status: done
Proof: `dashboard/tests/session-attribution.spec.ts` with
`dashboard/tests/support/sessionAttributionFixture.ts`,
`dashboard/tests/support/historicalCreditReads.ts`, and
`closeSessionDetails` in `sessionEntryDisclosure.ts` — collapsed historical
reads empty; open/close/reopen credit and request counts; hold/fail first
saved-revision read. Keep-green:
`dashboard/tests/agent-launch-retained-history.spec.ts`,
`dashboard/tests/recently-done-sessions-sidebar.spec.ts`,
`dashboard/tests/agent-roster-avatar.spec.ts` and
`dashboard/tests/published-facts-failures.spec.ts`. Literal focused run:
`PATH=/opt/homebrew/bin:$PATH caffeinate -s -i -- env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts dashboard/tests/session-attribution.spec.ts dashboard/tests/agent-launch-retained-history.spec.ts dashboard/tests/recently-done-sessions-sidebar.spec.ts dashboard/tests/agent-roster-avatar.spec.ts dashboard/tests/published-facts-failures.spec.ts --reporter=list` (10 passed); post-refactor attribution-only rerun 1 passed.

Behavior: a Board shows collapsed Session entries saved at different
publication revisions → the developer opens, closes, and reopens one entry's
Session details → no historical credit is asked while collapsed, the opened
entry reads and shows its original allocation (or "Human developer unknown"),
a read abandoned by closing shows nothing, and reopening asks again.

## Current decisions

- One slice: the gate, its request proof and the accounting sentence form one
  observable outcome.
- The assignment line keeps today's rendering while reading, including for a
  line later omitted as a duplicate of the story card (story Kept behavior).
- Gate in `SessionDetails` via `open && <SessionAssignment/>` fed from
  `SessionEntry`'s `detailsOpen`; rest of details stay mounted hidden.
- Refactor: attribution journey fixture and historical-credit request
  helpers extracted so the spec stays under the 250-line file gate.

## Concern evidence

Refinement not needed: one cohesive slice with settled premises and mapped
proof. This review identified no remaining slice-specific concern.

## Learnings

- On-demand credit proof's request shape and disclosure close pair belong in
  support beside the fixture, or the journey spec exceeds the file-size gate.


## Story obligations

### G1. Unreadable vs unrecorded wording deferred
Reported: slice 1 — "Deferred distinguishing unreadable from unrecorded wording"
Story clause: "Distinguishing an unreadable history from an unrecorded one in the details' wording"
Disposition: excluded "Distinguishing an unreadable history from an unrecorded one in the details' wording"
Commitment: 18


### G2. Page-held answer across close deferred
Reported: slice 1 — "Deferred keeping an answer in the page across close and reopen"
Story clause: "keeping an answer in the page across close and reopen"
Disposition: excluded "keeping an answer in the page across close and reopen"
Commitment: 19

### G3. Credit in local launch record deferred
Reported: slice 1 — "Deferred recording credit in the local launch record"
Story clause: "recording credit in the local launch record"
Disposition: excluded "recording credit in the local launch record"
Commitment: 20

## Execution complete

Product advice: no change
