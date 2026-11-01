---
id: SEED-211
status: active
planted: 2026-11-01
---

# Show session load and host resources beside the Sessions title

<a id="sessions-sidebar-host-status"></a>

### Show session counts and host resources beside the Sessions title

**Identity:** SEED-211#sessions-sidebar-host-status
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/436-sessions-sidebar-host-status/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ef33e46f171ecb664dca73a9668c17e7d96111b62dd385950a50b9f03df020fd","plan":"23a0285247d8510dee69add8104fe793e6b6e64cb129003239e42f3dd0518b1d"}}
```

**Beneficiary:** A developer running several agent sessions from the Open
Dough dashboard who needs to judge, at a glance, whether the machine can take
another session.

**Goal:** Next to the Sessions title in the dashboard's Sessions sidebar, show
a compact status line: how many open sessions are active versus waiting
(needing the developer), the host machine's current CPU usage, and free disk
space on the volume that holds this machine's dashboard home. The developer
sees session load and host headroom without leaving the sidebar or opening
another tool.

**Scope:**

- When the Sessions sidebar is open, the Sessions title row shows four compact
  figures beside the title: active open-session count, waiting open-session
  count, host CPU usage as a whole-machine percentage, and free disk space on
  the volume of `~/.open-dough/dashboard` (this machine's dashboard home).
- Active and waiting follow the sidebar's existing attention grouping of open
  sessions (`openSessionsOf` / `sessionShown().needsAttention`): waiting is
  how many need the developer (`attentionCount`); active is how many open
  sessions do not. Counts use the same machine-sessions reading the list
  already shows; they update when that reading updates.
- Each figure uses an icon (or equivalent compact glyph) with its number or
  amount; accessible names or tooltips carry the full wording (for example
  "2 sessions need attention", "CPU 24%", "12 GB free"). No separate text
  labels beside the icons.
- CPU usage is the host's whole-machine utilization percentage as a moving
  average over roughly the last minute, derived from successive `os.cpus()`
  time counters on the dashboard server (not one instantaneous snapshot, not
  load average alone, and not one browser tab's process). Until a minute of
  samples exists, such as on the first read after sampling resumes, it averages
  the span sampled so far. Free disk is
  `fs.statfs` available space for that dashboard-home volume, shown in a
  compact human unit (for example GB).
- Host figures are machine-local operational evidence from the dashboard
  server. One shared sample answers every open dashboard page; sampling runs
  at a modest interval in the same order as the existing machine-sessions
  pace (`checkIntervalMs`, 15 s), does not spawn a heavy external process per
  read, and stops when no page is watching. A page that is hidden does not
  keep the sampler alive by itself.
- When a host figure cannot be read, that figure shows an explicit unavailable
  reading (accessible wording included) and invents no number. Session counts
  remain available from the sessions reading even when host figures fail, and
  the reverse.

**Scope limits:**

- No memory, GPU, network, sparklines, thresholds, colour warnings, or
  click-through detail surface in this story.
- No change to the banner Sessions badge beyond what it already shows for
  attention; the new line lives beside the sidebar title while the sidebar is
  open.
- No per-project disk volumes, no choosing among mounts, and no recording of
  host history.
- No automated block or advice against starting another session.

**Deferred promises:**

- Memory or richer host gauges; warning thresholds; a status line while the
  sidebar is closed; click-through host detail; counting unsettled or
  awaiting-first-instruction sessions apart from the active/waiting split.

**Key examples:**

- Three open sessions: one Working, one Needs input, one Ready for review →
  the title row shows active 1 and waiting 2 (attention grouping), with CPU
  and free-disk figures from the latest shared sample.
- Two open sessions both Working, host sample CPU 24% and 110 GB free on the
  dashboard-home volume → active 2, waiting 0, with CPU and free disk updating
  on the shared sample pace. Zero counts remain visible so the split stays
  readable.
- Dashboard-home volume `statfs` fails → disk shows unavailable; CPU and
  session counts still show when those readings succeed.
- Two browser pages open the dashboard; both see the same host sample; closing
  every page stops further host sampling until a page watches again.
- Sessions sidebar closed → the new title-row figures are not shown; opening
  the sidebar shows them from the current sessions reading and the latest
  shared host sample (or a first sample if none yet).

**UI:** The status sits on the Sessions title row inside the Sessions sidebar,
as one compact composition with the existing `Sessions` heading—not a second
card or banner strip. Icons carry meaning; tooltips or accessible names state
the full figure. Figures are display-only. Prefer the dashboard's existing
icon/tooltip patterns (`Icon.tsx` / Lucide) over new interaction chrome.

**Architecture:** Host CPU and free disk are new machine-local operational
observations on the dashboard server, rebuildable and without an application
database, as
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
requires. They supplement the Sessions sidebar
([ADR 0008 UI concepts](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts))
without becoming workflow authority. Reuse the server's existing shared
observation pattern (`sharedObservation.ts`) so concurrent pages share one
sample and idle servers stop work when demand ends—the Activity Monitor /
status-bar sampler analogy adapted to this boundary. Session counts stay
derived in the page from the machine-sessions reading already polled at
`checkIntervalMs`; only host scalars need a new local JSON endpoint under the
existing local-origin boundary. Disk path is the volume of
`machineDashboardDirectory()` (`~/.open-dough/dashboard`), which is this
machine's shared dashboard home.

**Explore / Borrow / Challenge (2026-11-01):**

- Compared: (A) compact status beside the Sessions title (captured direction);
  (B) session counts only; (C) host figures only on a global status bar /
  banner. (B) and (C) each drop half of the goal. Recommend (A).
- Borrowed mechanism: one host sampler, many observers (Activity Monitor / IDE
  status bar). Maps cleanly onto `SharedObservation` plus page watchers. Limit:
  those UIs show many metrics and trends; this story ships only the four
  compact figures and stops when unwatched.
- Strongest doubt: CPU % and free disk are imperfect proxies for "can this
  machine take another session" (memory and I/O can dominate). The goal is
  visible headroom, not an automated go/no-go, so the purpose still holds;
  memory and thresholds stay deferred.

**Investigation (2026-11-01):**

- Fact (`SessionsSidebar.tsx`): the title is a plain `Sessions` heading with
  no status line today; the banner badge already uses `attentionCount` /
  `attentionSummary`.
- Fact (`agentLaunch.ts` `openSessionsOf`, `sessionShown.ts`): open sessions
  already split into needing attention vs not; waiting maps to
  `needsAttention`.
- Fact: no existing host CPU/disk product endpoint; `SharedObservation` and
  `localJsonEndpoints` already exist for shared local JSON answers.
- Fact (Node on this host): `fs.statfsSync` reports free bytes for `/` and
  `$HOME` on the same volume; `machineDashboardDirectory()` resolves under
  `$HOME/.open-dough/dashboard`. Differential `os.cpus().times` yields a
  whole-machine CPU percentage (observed ~24% over 200 ms); `os.loadavg()[0]
  / cpus` is a different, cheaper proxy and is not the chosen reading.
- Fact (`agentLaunches.ts`): machine sessions already poll at
  `checkIntervalMs` (15 s) while the page is visible.
- Hypothesis left settled for planning: host sample interval may match that
  15 s pace; exact endpoint path and icon choice are implementation detail
  within this scope.
