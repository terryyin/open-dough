# Source review — SEED-235#see-running-sessions-with-sidebar-closed

**Launch:** fresh general-purpose reviewer (no conversation inheritance), Cursor Task,
2026-11-05 during slice 1 acceptance.
**Input:** selected story Goal, Scope, key examples, exclusions, and Architecture
only from
`.planning/seeds/SEED-235-see-running-sessions-with-sidebar-closed.md#see-running-sessions-with-sidebar-closed`.
No plan, implementation return, product, or proof supplied. Reviewer instructed to
read no other project files and change nothing.

## Reviewer return (verbatim substance)

### Goal

**1.** A dashboard developer with the Sessions sidebar closed can tell, at a glance at the Sessions toggle (the dashboard logo), how many of this machine’s open sessions across projects are working and how many need them.

**2.** That glance is enough to know whether agents are still progressing without reopening the sidebar.

**3.** Local session evidence stays visible while the board keeps its full width.

### Scope — commitments

**4.** While the sidebar is closed, the Sessions toggle’s badge shows two separate counts in one badge.

- **4a.1** Working count appears first.
- **4a.2** Working count is shown in green.
- **4a.3** Attention count follows the working count.
- **4a.4** Attention count keeps its existing look.

**5.** A session counts as working when its entry reads it as working by the same reading every session entry uses.

- **5a.1** Alternative that counts: native **Working**.
- **5a.2** Alternative that counts: Cursor’s held **working** screen.

**6.** A session does not count as working when it is any of:

- **6a.1** marked done
- **6a.2** awaiting its first instruction
- **6a.3** unavailable
- **6a.4** unknown or unrecognized state
- **6a.5** needing attention

**7.** An unread report does not change which count a session is in.

**8.** The attention count keeps its existing rule: sessions whose entries need attention.

**9.** Each count shows only when it is above zero.

**10.** With neither count above zero, the toggle shows no badge, as now.

**11.** Before the machine’s sessions are first read, there is no badge.

**12.** Each count has its own accessible name, worded as the sessions it counts.

- **12a.1** Working plural form: “N sessions working” (example wording: “3 sessions working”).
- **12a.2** Working singular form: “1 session working”.
- **12a.3** Attention plural form: “N sessions need attention” (example wording: “2 sessions need attention”).

**13.** Position and name, not color alone, distinguish the counts.

**14.** The badge follows the sessions as they change state, on the existing session reads.

**15.** While the sidebar is open, the toggle shows the existing attention-only badge.

**16.** While the sidebar is open, the title row keeps its existing figures.

**17.** “Closed” means closed wherever the toggle shows, including a narrow window where the open sidebar lies over the page.

### Qualifications

**Q1.** Working membership uses the shared entry reading already used by every session entry (not a separate rule for the badge).

**Q2.** Attention membership is the existing attention rule; this story does not redefine it.

**Q3.** Badge absence with both counts zero continues current no-badge behavior.

**Q4.** Badge absence before the first machine session read is an initial-state qualification of **11**.

**Q5.** Accessible naming uses count + role wording; listed strings in **12a.**\* are wording shapes, not an exhaustive rejection set of other phrasings beyond singular/plural and those roles.

**Q6.** Open-sidebar toggle behavior is attention-only; working count is for the closed sidebar path (**4**, **15**).

**Q7.** Closed includes overlay-closed on narrow windows (**17**), not only a layout where the sidebar is off-canvas and invisible.

**Q8.** Counts are of this machine’s open sessions across projects (**1**).

**Q9.** The badge word for the progressing state is “working” (the entry label’s word), not “running” (dashboard term for Cursor’s runner process) — from Architecture.

### Architecture-derived promises

**18.** No new responsibility or read is introduced for this behavior.

**19.** The working count derives in the page from the session records the toggle already holds.

**20.** Derivation goes through the shared session reading (`dashboard/src/sessionShown.ts`), so the badge, entries, and attention count cannot disagree on a session.

**21.** This remains machine-local session evidence beside published story facts under ADR 0008.

### Exclusions

**E1.** No change to which sessions are read.

**E2.** No change to how often sessions are read.

**E3.** No change to the sidebar’s title-row figures.

**E4.** No change to sidebar entries.

**E5.** No change to sidebar ordering.

**E6.** No change to sidebar alerts.

### Trigger / journey examples

**Ex1.** Sidebar closed; three working and two needing attention across two projects → badge shows green **3** then attention **2**, named “3 sessions working” and “2 sessions need attention”.

**Ex2.** From **Ex1**, one working session starts waiting for input → **2** working and **3** needing attention.

**Ex3.** Sidebar closed; two working, one awaiting first instruction, none needing attention → only green **2**.

**Ex4.** Sidebar closed; one Cursor session at held **working** screen and one Claude session marked done while still working natively → only green **1**.

**Ex5.** Sidebar closed; nothing working, one needing attention → only attention **1**, as today.

**Ex6.** Developer opens the sidebar with three working and two needing attention → toggle shows only attention **2**; closing again restores **3** and **2**.

## Comparison at acceptance (slice 1)

| Id | Source-expected | Actual observation | Disposition |
| --- | --- | --- | --- |
| 1–3, Q8 | Closed toggle shows working and attention across projects | `sessions-sidebar.spec.ts` closed 3/2 then 2/3 across projects | observed |
| 4, 4a.1–4a.4 | Dual badge; working first, green (`--ready`), attention after with `--problem` | `SessionsButton` + `sessions-sidebar.css` + journey order `["3","2"]` | observed |
| 5, 5a.1–5a.2, Q1 | Shared `readsWorking` (native Working or held working) | `sessionShown.ts` `readsWorking` / `workingCount`; unfinishedIntention reuses it | observed |
| 6a.1–6a.5 | Done, awaiting-instruction, unavailable, other unknown, needing attention excluded | `workingCount` requires `doneAt === undefined && readsWorking`; boundary + product | observed |
| 7 | Unread does not move counts | `session-working-count-rule.spec.ts` unread on working still workingCount 1, attention 0 | observed |
| 8, Q2 | Existing `attentionCount` | unchanged `attentionCount` → `needsAttention` | observed |
| 9–11, Q3–Q4 | Hide zeros; no badge before first read | `SessionsButton` guards; `sessions-sidebar-reading.spec.ts` | observed |
| 12–13, 12a.*, Q5, Q9 | Own accessible names; “working” not “running”; position+name | journey + `workingWords` / `attentionWords` | observed |
| 14 | Follows state on existing reads | journey `passOnePace` after `claudeSessionBecomes` | observed |
| 15–16, Q6, E3 | Open: attention-only; title row unchanged | journey open hides working; `SessionsSidebarStatus` untouched | observed |
| 17, Q7 | Closed includes narrow overlay | `frame-sessions-look.spec.ts`, `sessions-sidebar-touch.spec.ts` | observed |
| 18–21 | Page derivation via `sessionShown`; no new read | `SessionsButton` uses `openSessionsOf(records)` + `workingCount` | observed |
| E1–E2, E4–E6 | No change to reads/pace/entries/ordering/alerts | diff limited to badge reading/render and tests | observed |
| Ex1–Ex6 | Journey / boundary examples | journey + `session-working-count-rule.spec.ts` | observed |

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A dashboard developer with the Sessions sidebar closed can tell, at a glance at the Sessions toggle (the dashboard logo), how many of this machine’s open sessions across projects are working and how many need them. | slice 1 | observed: sessions-sidebar.spec.ts closed 3 then 2 across projects; workingBadge and badge accessible names |
| 2 | That glance is enough to know whether agents are still progressing without reopening the sidebar. | slice 1 | observed: sessions-sidebar.spec.ts closed dual counts without opening; open path attention-only |
| 3 | Local session evidence stays visible while the board keeps its full width. | slice 1 | observed: SessionsButton closed badge; sidebar remains optional overlay/column |
| 4 | While the sidebar is closed, the Sessions toggle’s badge shows two separate counts in one badge. | slice 1 | observed: SessionsSidebar.tsx sessions-toggle-counts with working and attention children |
| 4a.1 | Working count appears first. | slice 1 | observed: sessions-sidebar.spec.ts countsBadge getByRole img toHaveText ["3","2"] |
| 4a.2 | Working count is shown in green. | slice 1 | observed: sessions-sidebar.css .sessions-toggle-working background var(--ready) (#1b6e3c) |
| 4a.3 | Attention count follows the working count. | slice 1 | observed: sessions-sidebar.spec.ts order ["3","2"] then ["2","3"] |
| 4a.4 | Attention count keeps its existing look. | slice 1 | observed: sessions-toggle-attention background var(--problem); white text unchanged |
| 5 | A session counts as working when its entry reads it as working by the same reading every session entry uses. | slice 1 | observed: sessionShown.ts readsWorking shared with unfinishedIntention |
| 5a.1 | Alternative that counts: native Working. | slice 1 | observed: readsWorking available+working; session-working-count-rule.spec.ts |
| 5a.2 | Alternative that counts: Cursor’s held working screen. | slice 1 | observed: readsWorking unknown+cursorHeldLabel.working; boundary held working counts |
| 6 | A session does not count as working when it is any of the listed non-working memberships. | slice 1 | observed: workingCount doneAt undefined && readsWorking only |
| 6a.1 | marked done | slice 1 | observed: session-working-count-rule.spec.ts done while working natively excluded |
| 6a.2 | awaiting its first instruction | slice 1 | observed: session-working-count-rule.spec.ts awaiting-instruction excluded; count 2 of 3 |
| 6a.3 | unavailable | slice 1 | observed: sessionShown.ts readsWorking excludes non-available non-held-working kinds |
| 6a.4 | unknown or unrecognized state | slice 1 | observed: readsWorking only held working label among unknown; held waiting excluded in boundary |
| 6a.5 | needing attention | slice 1 | observed: waiting/blocked not readsWorking; journey move working→blocked drops working count |
| 7 | An unread report does not change which count a session is in. | slice 1 | observed: session-working-count-rule.spec.ts unread on working still workingCount 1 attention 0 |
| 8 | The attention count keeps its existing rule: sessions whose entries need attention. | slice 1 | observed: attentionCount still filters sessionShown.needsAttention |
| 9 | Each count shows only when it is above zero. | slice 1 | observed: SessionsButton renders each span only when count > 0 |
| 10 | With neither count above zero, the toggle shows no badge, as now. | slice 1 | observed: SessionsButton (working > 0 \|\| attention > 0) guard; open with zero attention hides both |
| 11 | Before the machine’s sessions are first read, there is no badge. | slice 1 | observed: sessions-sidebar-reading.spec.ts workingBadge and badge count 0 while reads held |
| 12 | Each count has its own accessible name, worded as the sessions it counts. | slice 1 | observed: workingSummary and attentionSummary aria-labels on separate role=img spans |
| 12a.1 | Working plural form: N sessions working | slice 1 | observed: sessions-sidebar.spec.ts "3 sessions working"; workingWords |
| 12a.2 | Working singular form: 1 session working | slice 1 | observed: session-working-count-rule.spec.ts workingWords(1) |
| 12a.3 | Attention plural form: N sessions need attention | slice 1 | observed: sessions-sidebar.spec.ts "2 sessions need attention" |
| 13 | Position and name, not color alone, distinguish the counts. | slice 1 | observed: separate aria-labels and DOM order in countsBadge |
| 14 | The badge follows the sessions as they change state, on the existing session reads. | slice 1 | observed: sessions-sidebar.spec.ts after claudeSessionBecomes + passOnePace 3/2 → 2/3 |
| 15 | While the sidebar is open, the toggle shows the existing attention-only badge. | slice 1 | observed: sessions-sidebar.spec.ts open workingBadge count 0; badge attention only |
| 16 | While the sidebar is open, the title row keeps its existing figures. | slice 1 | observed: SessionsSidebarStatus unchanged (active/waiting via attentionCount) |
| 17 | Closed means closed wherever the toggle shows, including a narrow window where the open sidebar lies over the page. | slice 1 | observed: frame-sessions-look.spec.ts and sessions-sidebar-touch.spec.ts closed dual counts in viewport |
| Q1 | Working membership uses the shared entry reading already used by every session entry. | slice 1 | observed: readsWorking in sessionShown.ts used by unfinishedIntention and workingCount |
| Q2 | Attention membership is the existing attention rule; this story does not redefine it. | slice 1 | observed: attentionCount implementation unchanged |
| Q3 | Badge absence with both counts zero continues current no-badge behavior. | slice 1 | observed: SessionsButton dual-count guard |
| Q4 | Badge absence before the first machine session read is an initial-state qualification of 11. | slice 1 | observed: sessions-sidebar-reading.spec.ts |
| Q5 | Accessible naming uses count + role wording shapes. | slice 1 | observed: workingWords / attentionWords via countedWords |
| Q6 | Open-sidebar toggle behavior is attention-only; working count is for the closed sidebar path. | slice 1 | observed: SessionsButton working = open ? 0 : workingCount(sessions) |
| Q7 | Closed includes overlay-closed on narrow windows. | slice 1 | observed: frame-sessions-look.spec.ts / sessions-sidebar-touch.spec.ts |
| Q8 | Counts are of this machine’s open sessions across projects. | slice 1 | observed: sessions-sidebar.spec.ts multi-project launches; openSessionsOf(records) |
| Q9 | The badge word for the progressing state is working, not running. | slice 1 | observed: workingWords "session working" / "sessions working" |
| 18 | No new responsibility or read is introduced for this behavior. | slice 1 | observed: SessionsButton derives from existing records prop; no new fetch |
| 19 | The working count derives in the page from the session records the toggle already holds. | slice 1 | observed: SessionsButton sessions = openSessionsOf(records) |
| 20 | Derivation goes through the shared session reading (sessionShown.ts). | slice 1 | observed: workingCount / readsWorking in sessionShown.ts |
| 21 | This remains machine-local session evidence beside published story facts under ADR 0008. | slice 1 | observed: page-local SessionsButton badge; no trunk publication of counts |
| E1 | No change to which sessions are read. | slice 1 | observed: diff does not alter session read selection |
| E2 | No change to how often sessions are read. | slice 1 | observed: diff does not alter read pace |
| E3 | No change to the sidebar’s title-row figures. | slice 1 | observed: SessionsSidebarStatus body unchanged in diff |
| E4 | No change to sidebar entries. | slice 1 | observed: SessionList / entry components untouched |
| E5 | No change to sidebar ordering. | slice 1 | observed: openSessionsOf / list ordering untouched |
| E6 | No change to sidebar alerts. | slice 1 | observed: alerts path untouched |
| Ex1 | Closed 3 working + 2 attention → green 3 then 2 with names. | slice 1 | observed: sessions-sidebar.spec.ts closed step |
| Ex2 | One working waits for input → 2 working / 3 attention. | slice 1 | observed: sessions-sidebar.spec.ts after block |
| Ex3 | Two working + awaiting-instruction → only green 2. | slice 1 | observed: session-working-count-rule.spec.ts awaiting excluded |
| Ex4 | Held working + done-while-native-working → only green 1. | slice 1 | observed: session-working-count-rule.spec.ts held working counts; done excluded |
| Ex5 | Nothing working + one attention → only attention 1. | slice 1 | observed: sessions-sidebar.spec.ts closed only attention 1 |
| Ex6 | Open shows attention only; close restores both. | slice 1 | observed: sessions-sidebar.spec.ts open/close restore 2/3 |
