# Show session counts and host resources beside the Sessions title

**Identity:** SEED-211#sessions-sidebar-host-status
**Source:** [selected story](../../seeds/SEED-211-sessions-sidebar-host-status.md#sessions-sidebar-host-status).
**Source review:** [source-review.md](source-review.md)

## Goal and scope

When the Sessions sidebar is open, the Sessions title row shows four compact
figures: active open-session count, waiting (needs-developer) count, host CPU
usage %, and free disk on the volume of `~/.open-dough/dashboard`. Active and
waiting follow `openSessionsOf` / `sessionShown().needsAttention`. Host figures
come from one shared server sample, polled at the machine-sessions pace while a
page watches, with an explicit unavailable reading when a figure cannot be
read. Excluded: memory/GPU/thresholds/sparklines, click-through detail, banner
badge changes, per-project disks, automated start blocking, sidebar-closed
status line.

## Existing solutions and decisions

PFE:

- **Session bipartition.** Reuse `sessionShown().needsAttention`,
  `attentionCount`, and `openSessionsOf` (`dashboard/src/sessionShown.ts`,
  `agentLaunch.ts`). Waiting = needing attention; active = other open
  sessions. Do not invent a second attention rule.
- **Title and look.** Extend `SessionsSidebar.tsx`'s `Sessions` heading row
  (`h2#sessions-sidebar-heading`). Locators already exist:
  `sidebar.getByRole("heading", { level: 2, name: "Sessions" })` in
  `frame-sessions-look.spec.ts` and `runningCursorSessionsPage.ts`. Icons and
  tooltips follow `Icon.tsx` / Lucide.
- **Machine sessions pace.** `agentLaunches.ts` already polls
  `readMachineSessionsSince` at `checkIntervalMs` (15 s) while the page is
  visible and stops when hidden. Host reads follow the same client pace and
  visibility rule; do not add a server-side ticker.
- **Shared host sample.** New local JSON endpoint under
  `localJsonEndpoints` + `verifyLocalOrigin`, sampling via
  `SharedObservation` (`sharedObservation.ts`) the way
  `MachineSessionObservation` shares session reads. Observe with
  differential `os.cpus().times` for whole-machine CPU % and `fs.statfs` on
  `machineDashboardDirectory()` for free bytes. No `df` subprocess.
- Applicable Accepted decisions: ADR 0008 (machine-local operational evidence,
  no application database, Sessions sidebar UI concept) — no conflict; no new
  North Star topic. Product wording belongs beside the Sessions sidebar
  contract in `dashboard/AGENT-LAUNCH.md` (or the sidebar section it points
  to), not a new durable architecture record.

## Outside-in proof

| Story promise / example | Slice | Observable proof |
| --- | --- | --- |
| Working + Needs input + Ready for review → active 1, waiting 2 | 1 | New `dashboard/tests/sessions-sidebar-host-status.spec.ts` (or focused cases on the existing sessions-sidebar journey): open sidebar; accessible names/tooltips on the title row report active 1 and waiting 2 for that fixture. |
| Two Working → active 2, waiting 0 (zeros visible) | 1 | Same spec: both counts shown, waiting 0. |
| Existing sidebar journeys still group and read sessions | 1 | `sessions-sidebar.spec.ts` (and related row/state specs touched by the heading markup) stay green. |
| CPU % and free disk from shared sample on dashboard-home volume | 2 | Boundary: GET host-status answers CPU percent and free bytes (or equivalent compact fields) from real Node sample; E2E: title row shows matching accessible CPU and free-disk figures after the page's host read. |
| CPU % is a ~60 s moving average, not the last interval alone | 2 | Boundary: with injected counter snapshots (idle intervals followed by one busy interval), the answered CPU % reflects the whole window, not only the newest interval; with only one interval so far, it averages that span. |
| `statfs` failure → disk unavailable; other figures remain | 2 | Boundary or E2E with injected sample failure: disk accessible name says unavailable; counts and CPU still shown when those succeed. |
| Two pages share one sample; no watchers → no further samples | 2 | Boundary: two concurrent demands produce one `observe` while reuse holds; after demand stops, no further observe until the next demand. |
| Sidebar closed → figures not shown | 1–2 | E2E: with sidebar closed, title-row status figures are absent; open shows them. |

## Ordered slices

### 1. Show active and waiting counts beside the Sessions title
Type: Behavior
Status: done
Proof: `sessions-sidebar-host-status.spec.ts` active/waiting cases (including
visible zeros); existing `sessions-sidebar.spec.ts` green for grouping.

Behavior: with the Sessions sidebar open and open sessions present → the
Sessions title row shows compact active and waiting counts from the current
machine-sessions reading, using the existing attention bipartition, with
accessible names or tooltips; zeros stay visible; closing the sidebar hides
the figures. Lands the title-row status composition for the two counts (host
slots may be absent until slice 2). Accepted interim: counts without host
figures until slice 2.

### 2. Show shared host CPU and free disk beside the Sessions title
Type: Behavior
Status: planned
Proof: boundary shared-sample and unavailable cases; E2E title-row CPU and
free-disk figures; discrimination by a scratch failure that forces
unavailable or wrong values and makes the focused case fail, then revert.

Behavior: while any visible dashboard page watches → one shared server sample
supplies whole-machine CPU % as a moving average over about the last minute and free disk on the dashboard-home volume to
every open page at the machine-sessions pace; the title row shows both with
accessible wording; an unreadable figure shows unavailable without inventing a
number; when no page watches, sampling stops. Lands the local host-status
endpoint, `SharedObservation` sampler, client poll aligned with
`checkIntervalMs` / visibility, and the two host figures on the title row.
Documents the status line in the Sessions sidebar product contract.

## Current decisions

- Demand-driven shared sampling (client poll + `SharedObservation` reuse), not
  a server push ticker.
- Disk volume is `machineDashboardDirectory()`'s volume; CPU is differential
  `os.cpus().times`, not load average alone.
- CPU % is a moving average (developer amendment, 2026-11-01): busy/total
  `os.cpus().times` across a trailing window of about 60 s (the newest counter
  snapshot against the oldest one retained within the window, roughly four
  samples at the 15 s pace), not the latest single interval. Before a full
  window exists, such as the first read after sampling resumes, it uses the span
  sampled so far. The snapshot ring is in-memory only and is discarded when
  sampling stops.
- Active/waiting is the attention bipartition of open sessions, not
  Working-tone-only.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Open sessions already split by `needsAttention` for list order and `attentionCount` | Slice 1 counts | Read `openSessionsOf` / `attentionCount` in this checkout | Settled: waiting = `needsAttention`; active = other open sessions. |
| Sessions heading is locatable for outside-in proof | Slice 1–2 E2E | Existing specs locate `heading` level 2 name `Sessions` inside the Sessions sidebar (`frame-sessions-look.spec.ts`, `runningCursorSessionsPage.ts`) | Settled: proof route available without new navigation helpers. |
| Node can sample whole-machine CPU % and free disk on the dashboard-home volume without a subprocess | Slice 2 sampler | Shell in this checkout: differential `os.cpus().times` (~24% over 200 ms); `fs.statfsSync` on `$HOME` reports free bytes; `machineDashboardDirectory()` is under `$HOME/.open-dough/dashboard` | Settled: chosen readings work on this host. |
| `SharedObservation` starts work only on demand (no idle ticker) | Slice 2 "stop when unwatched" | Read `sharedObservation.ts`: observe runs from `demand` / `start` only | Settled: pair with client poll that stops when the page is hidden (`agentLaunches.ts` pattern). |

## Learnings and preparation review

Slice-plan refinement: not needed — two Behavior slices, one coherent status-line
model, independent proof loops for counts vs host, no special-case accumulation,
no sizing exception, no unresolved decisive premise.

Remaining slice-specific concerns: none identified.

Slice 1 accepted proof (2026-11-01): `dashboard/tests/sessions-sidebar-host-status.spec.ts`
(2 tests: 1/2 split with live updates 0/3 then 1/3; zero waiting visible and
figures absent while closed) plus `frame-sessions-look`, `sessions-sidebar` and
the changed sidebar surface (80 passed; `recently-done-sessions-sidebar-room`
failed once at load ~10 on a wheel-scroll bound, then passed 3/3 at 2 workers
and 4/4 at default workers). Refactor reran the wording consumers (9 passed).
For slice 2: the title row is `div.sessions-sidebar-title-row` (h2 still named
"Sessions"); add CPU and free-disk figures through `StatusFigure` (icon,
shown value, words) inside `.sessions-sidebar-status`; the room observer
watches the title row, so wrapping figures still resize the lists. Waiting
wording reuses "N sessions need attention"; active is "N active sessions".
