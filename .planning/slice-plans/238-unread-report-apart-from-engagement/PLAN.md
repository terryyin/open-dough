# Show an unread session report apart from a session needing engagement

**Identity:** SEED-052#unread-report-apart-from-engagement
**Source:** [story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#unread-report-apart-from-engagement)

## Goal and scope

A session's left border, its place in the Sessions sidebar's attention group,
the banner badge, and the card's “needs attention” line follow only the
session's own native reading. A completion report not yet marked done becomes a
separate fact, the unread report, shown by its own marker and words
(“Unread report: <completion label>”) and by a card line “N unread report(s)”.
A report's arrival still raises a macOS alert, and a native reading entered
while a report is unread alerts as it would without one.

Excluded, as the story bounds it: report delivery, retention, the full report
view, and Mark as done are unchanged; a new instruction does not mark a report
done; a session marked done keeps today's reading (“Done”, with “Native
session is still working” while it works); the badge never counts unread
reports. Quiet completion is marked done on arrival
(`server/completionDelivery.ts:82`), so it never shows as unread.

Common rule: `sessionShown` (`dashboard/src/sessionShown.ts`) computes the
native reading exactly as it does for a session without a report, and adds an
optional `unreadReport` (the completion label) when a report exists and
`doneAt` is unset. The report branch stops overriding label, tone and
`needsAttention`. Grouping (`openSessionsOf`), the badge and card counts
(`attentionCount`/`attentionSummary`) and entry borders already read
`needsAttention`/`tone`, so they follow without their own rules. No new
architectural concern; no ADR or North Star topic applies.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| Today an unread report overrides the native reading with label = completion label, tone `ready`, `needsAttention: true`, and native Working only as a note | Slice 1 | Read `dashboard/src/sessionShown.ts:42-60` | Confirmed |
| A Claude session whose turn ended reads natively as “Ready for review”, needing attention, so a stopped reported session keeps a border from its own state | Example 1 | Read `server/hosts/claude/runtime.ts:141-157` (`done` → `review`) and `sessionShown.ts:35-38` | Confirmed |
| Sidebar grouping, badge and card attention line all read `sessionShown(...).needsAttention` | Slice 1 | `git grep -n "sessionShown\|attentionCount\|attentionSummary" -- dashboard/src` | `agentLaunch.ts:72` (`openSessionsOf`), `SessionSidebar.tsx:136,153` (badge count and label), `CardLaunches.tsx:66,234` (card line), `SessionEntry.tsx:128` (entry class), `SidebarEntry.tsx:39-40` (tone, tooltip) |
| macOS alerts fire when `alertReading`'s label changes, and that label comes from `sessionShown`; with native Working it returns nothing even when a report arrives | Slice 2 | Read `sessionShown.ts:122-140` and `server/sessionAlerts.ts:134-155` | Confirmed: today a report raises its alert only once the native turn ends (label changes to the completion label) |
| A page journey can launch a Claude session through the synthetic `claude`, submit a real report through the installed reporting command, then change the native state | Proof of both slices | `tests/agent-completion-binding.spec.ts:30-100` (Claude report via the prepared command); `tests/support/fakeClaudeListing.ts:46,88` (`claudeSessionBecomes` on the dashboard server); `unset NODE_ENV; npx playwright test --config dashboard/playwright.config.ts --grep "Claude early attention report binds through normal launch\|installed attention report stays open" --reporter=line` | 2 passed (42.6s) |
| Existing specs that assert today's report reading | Slice 1 consumers | `git grep -n "Native session is still working\|Completed with attention\|Unfinished work\|needs attention" -- dashboard/tests` | `agent-completion-attention.spec.ts:109` asserts the unread report's state line contains “Native session is still working”, which changes; `:165` (“Unfinished work”) and `:224` (after Mark as done) and `agent-completion-quiet.spec.ts:160` (quiet, marked done) keep holding |
| Product docs describe the report reading | Slice 1 and 2 cleanup | Read `dashboard/AGENT-LAUNCH-COMPLETION.md:24-38` | “remain open until Mark as done” and “Native Working remains visible separately” need restating as the unread-report marker beside the native reading |

## Key examples and proof

Proof lives in one new page journey, `dashboard/tests/session-unread-report.spec.ts`,
driving a Claude launch through the synthetic `claude` and the real reporting
command (as `agent-completion-binding.spec.ts` does), and one addition to
`dashboard/tests/session-alerts.spec.ts`.

| # | Example (story key example) | Observable signal | Owner |
| --- | --- | --- | --- |
| 1 | Report “Completed with attention”, native done | Sidebar entry has the ready edge (`expectSidebarSessionShown`), the unread-report marker, tooltip line “Unread report: Completed with attention”, sits in the attention group; badge named “1 session needs attention”; card shows “1 session needs attention” and “1 unread report” | Slice 1 |
| 2 | New instruction, native working, no Mark as done | Entry reads “Working” with the working edge, ordered among non-attention entries by launch time, marker kept; badge absent; card shows “1 unread report” and no attention line | Slice 1 |
| 3 | Then native blocked | Entry reads “Needs input” with the needs-input edge, moves into the attention group; badge counts it; marker kept | Slice 1 |
| 4 | Mark as done | Marker, tooltip line and card unread line gone; entry reads as marked done today | Slice 1 |
| 5 | Native forgotten (unavailable) with unread report | Entry reads “Session unavailable”, unsettled edge, not counted, marker kept | Slice 1 |
| 6 | Report arrives while native working | One alert “Unread report: Completed with attention”; native then blocked raises “Needs input: …”; no repeat while unchanged; marked done never alerts | Slice 2 |

Each slice also runs its consumers: the existing specs that read sessions'
state — `npm run test:dashboard -- --grep "completion|attention|session-sidebar|Sessions sidebar|session state|alert"`
from the repository root with `NODE_ENV` unset — and `npm run typecheck:dashboard`
and `npm run lint`, as the repository's commit hooks require.

## Ordered slices

### 1. An unread report is its own mark beside the session's native reading
Type: Behavior
Status: planned
Proof: examples 1–5 in `session-unread-report.spec.ts`; update
`agent-completion-attention.spec.ts:109` to expect “Working” and
“Unread report: Completed with attention”; consumer specs above.

Behavior: a launched session with an unread report → its native state changes
working / blocked / done / forgotten, or the developer marks it done → the
card entry, sidebar entry (edge, group, marker, tooltip), badge and card lines
show the native reading with the unread report apart, as examples 1–5.

Changes: `sessionShown` adds `unreadReport` and no longer overrides the native
reading; card entry state words show the unread-report words; `SidebarEntry`
renders the marker (a lucide message icon before the elapsed time, faint
background tint via a class, words hidden for assistive technology) and the
tooltip line; `CardLaunches` adds the “N unread report(s)” line beside the
attention line, from one shared counting helper in `sessionShown.ts`;
`session-sidebar.css` styles the tint; `AGENT-LAUNCH-COMPLETION.md` and the
comments heading `sessionShown.ts`, `SidebarEntry.tsx`, `SessionSidebar.tsx`
and `CardLaunches.tsx` describe the new reading.

Interim behavior until slice 2: a report arriving while native Working raises
no alert; the alert comes when the turn ends, as “Ready for review” instead of
the completion label.

### 2. A report's arrival alerts in its own words
Type: Behavior
Status: planned
Proof: example 6 added to `session-alerts.spec.ts` (synthetic `claude` and
`osascript`, real reporting command); existing `session-alerts*.spec.ts` and
`agent-launch-codex-observation-alerts.spec.ts` still pass.

Behavior: a session not marked done → a report arrives (native working or
not), or its native reading changes while the report is unread → the server
raises one alert “Unread report: <completion label>” for the arrival and one
for each native reading entered, as it would without a report; Mark as done
silences both.

Changes: `server/sessionAlerts.ts` remembers each session's unread report
alongside its native reading and alerts on either change; `alertReading` reads
only the native reading; `AGENT-LAUNCH-HISTORY.md`'s alert sentence names the
report alert.
