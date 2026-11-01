# Source review — SEED-211#sessions-sidebar-host-status

Launch: fresh general-purpose subagent (no conversation inheritance), 2026-11-01, during execution before slice 1 acceptance.
Input: only the story's Beneficiary, Goal, Scope, Scope limits, Deferred promises, Key examples and UI text from `.planning/seeds/SEED-211-sessions-sidebar-host-status.md#sessions-sidebar-host-status`, copied to a job temp file; instructed to read nothing else and change nothing. No plan, implementation or proof supplied.
Reviewer notes: 6.6 and 7.4 appear only in key examples; 7.3 only in Scope; waiting membership beyond example 10.1 is defined only by the attention grouping; the 15 s pace is approximate.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 0.1 | Beneficiary: a developer running several agent sessions from the dashboard who needs to judge at a glance whether the machine can take another session | slice 2 | |
| 0.2 | Developer sees session load and host headroom without leaving the sidebar or opening another tool | slice 2 | |
| 1 | When the Sessions sidebar is open, the Sessions title row shows four compact figures beside the Sessions title | slice 2 | |
| 1.1 | Active open-session count | slice 1 | observed: dashboard/tests/sessions-sidebar-host-status.spec.ts 'counts active and waiting' step one: '1 active session' figure shows 1 |
| 1.2 | Waiting open-session count (sessions needing the developer) | slice 1 | observed: dashboard/tests/sessions-sidebar-host-status.spec.ts 'counts active and waiting' step one: '2 sessions need attention' figure shows 2 |
| 1.3 | Host CPU usage as a whole-machine percentage | slice 2 | |
| 1.4 | Free disk space on the volume of `~/.open-dough/dashboard` (this machine's dashboard home) | slice 2 | |
| 2 | Active/waiting follow the sidebar's existing attention grouping of open sessions (`openSessionsOf` / `sessionShown().needsAttention`) | slice 1 | observed: SessionsSidebar.tsx SessionsSidebarStatus: attentionCount over openSessionsOf(records); spec Working/Needs input/Ready for review gives 1/2 |
| 2.1 | Waiting = how many open sessions need the developer (`attentionCount`) | slice 1 | observed: dashboard/tests/sessions-sidebar-host-status.spec.ts waiting figure = attentionCount (Needs input + Ready for review = 2) |
| 2.2 | Active = how many open sessions do not need the developer | slice 1 | observed: dashboard/tests/sessions-sidebar-host-status.spec.ts active figure = open sessions not needing attention (1, then 2 with two Working) |
| 2.3 | Counts use the same machine-sessions reading the list already shows | slice 1 | observed: SessionsSidebar.tsx passes the same openSessionsOf(records) the list reads |
| 2.4 | Counts update when that reading updates | slice 1 | observed: dashboard/tests/sessions-sidebar-host-status.spec.ts steps 'a working session that needs input moves to waiting' (0/3) and 'a new working session adds to active' (1/3), no reload |
| 2.5 | Zero counts remain visible so the active/waiting split stays readable | slice 1 | observed: dashboard/tests/sessions-sidebar-host-status.spec.ts 'keeps a zero waiting count visible': '0 sessions need attention' shows 0 |
| 3 | Each figure uses an icon (or equivalent compact glyph) with its number or amount | slice 2 | |
| 3.1 | Accessible names or tooltips carry the full wording | slice 2 | |
| 3.2 | e.g. "2 sessions need attention", "CPU 24%", "12 GB free" | slice 2 | |
| 3.3 | No separate text labels beside the icons | slice 2 | |
| 4 | CPU usage is the host's recent whole-machine utilization percentage derived from successive `os.cpus()` time counters on the dashboard server | slice 2 | |
| 4.3 | CPU usage is a moving average over roughly the last minute, not one instantaneous snapshot; before a full minute it averages the span sampled so far (developer amendment 2026-11-01) | slice 2 | |
| 4.1 | Not load average alone | slice 2 | |
| 4.2 | Not one browser tab's process | slice 2 | |
| 5 | Free disk is `fs.statfs` available space for the dashboard-home volume | slice 2 | |
| 5.1 | Shown in a compact human unit (e.g. GB) | slice 2 | |
| 6 | Host figures are machine-local operational evidence from the dashboard server | slice 2 | |
| 6.1 | One shared sample answers every open dashboard page | slice 2 | |
| 6.2 | Sampling runs at a modest interval in the same order as the existing machine-sessions pace (`checkIntervalMs`, 15 s) | slice 2 | |
| 6.3 | Sampling does not spawn a heavy external process per read | slice 2 | |
| 6.4 | Sampling stops when no page is watching | slice 2 | |
| 6.5 | A hidden page does not by itself keep the sampler alive | slice 2 | |
| 6.6 | Sampling resumes when a page watches again | slice 2 | |
| 7 | When a host figure cannot be read, that figure shows an explicit unavailable reading, with accessible wording | slice 2 | |
| 7.1 | An unreadable figure invents no number | slice 2 | |
| 7.2 | Session counts remain available when host figures fail | slice 2 | |
| 7.3 | Host figures remain available when the sessions reading fails ("and the reverse") | slice 2 | |
| 7.4 | Each host figure fails independently (disk unavailable while CPU still shows) | slice 2 | |
| 8 | UI: status sits on the Sessions title row inside the Sessions sidebar as one compact composition with the existing `Sessions` heading | slice 1 | observed: dashboard/tests/sessions-sidebar-host-status.spec.ts figures inside .sessions-sidebar-title-row beside heading 'Sessions' |
| 8.1 | Not a second card or banner strip | slice 1 | observed: SessionsSidebar.tsx status renders inside the sidebar title row, no separate card or banner element |
| 8.2 | Icons carry meaning; tooltips or accessible names state the full figure | slice 2 | |
| 8.3 | Figures are display-only | slice 1 | observed: dashboard/tests/sessions-sidebar-host-status.spec.ts expectFigure: no button or link inside each figure |
| 8.4 | Prefer the dashboard's existing icon/tooltip patterns (`Icon.tsx` / Lucide) over new interaction chrome | slice 1 | observed: SessionsSidebar.tsx StatusFigure uses Icon.tsx with Lucide Activity/Hand and title tooltip |
| 9 | Sidebar visibility | slice 1 | observed: dashboard/tests/sessions-sidebar-host-status.spec.ts 'shows the figures only while the sidebar is open' closed/open/closed steps |
| 9.1 | Sidebar closed: the new title-row figures are not shown | slice 1 | observed: dashboard/tests/sessions-sidebar-host-status.spec.ts closed steps: no status figure found on the page by role |
| 9.2 | Opening the sidebar shows them from the current sessions reading and the latest shared host sample, or a first sample if none yet | slice 2 | |
| 10 | Key examples | slice 2 | |
| 10.1 | Three open sessions (Working, Needs input, Ready for review) -> active 1, waiting 2 (attention grouping), CPU and free disk from latest shared sample | slice 2 | |
| 10.2 | Two open sessions both Working, CPU 24%, 110 GB free -> active 2, waiting 0, CPU and disk updating on shared sample pace; zeros visible | slice 2 | |
| 10.3 | Dashboard-home `statfs` fails -> disk shows unavailable; CPU and session counts still show when those readings succeed | slice 2 | |
| 10.4 | Two browser pages open -> both see the same host sample; closing every page stops further host sampling until a page watches again | slice 2 | |
| 10.5 | Sidebar closed -> figures not shown; opening sidebar shows them from current sessions reading and latest shared host sample (or a first sample) | slice 2 | |
| 11 | Scope limits | slice 2 | |
| 11.1 | No memory figure | slice 2 | |
| 11.2 | No GPU figure | slice 2 | |
| 11.3 | No network figure | slice 2 | |
| 11.4 | No sparklines | slice 2 | |
| 11.5 | No thresholds | slice 2 | |
| 11.6 | No colour warnings | slice 2 | |
| 11.7 | No click-through detail surface | slice 2 | |
| 11.8 | No change to the banner Sessions badge beyond what it already shows for attention; the new line lives beside the sidebar title while the sidebar is open | slice 2 | |
| 11.9 | No per-project disk volumes | slice 2 | |
| 11.10 | No choosing among mounts | slice 2 | |
| 11.11 | No recording of host history | slice 2 | |
| 11.12 | No automated block or advice against starting another session | slice 2 | |
| 12 | Deferred promises | slice 2 | |
| 12.1 | Memory or richer host gauges | slice 2 | |
| 12.2 | Warning thresholds | slice 2 | |
| 12.3 | A status line while the sidebar is closed | slice 2 | |
| 12.4 | Click-through host detail | slice 2 | |
| 12.5 | Counting unsettled or awaiting-first-instruction sessions apart from the active/waiting split | slice 2 | |
