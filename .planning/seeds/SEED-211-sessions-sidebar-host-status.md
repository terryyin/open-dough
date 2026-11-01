---
id: SEED-211
status: active
planted: 2026-11-01
---

# Show session load and host resources beside the Sessions title

<a id="sessions-sidebar-host-status"></a>

### Show session counts and host resources beside the Sessions title

**Identity:** SEED-211#sessions-sidebar-host-status

**Beneficiary:** A developer running several agent sessions from the Open
Dough dashboard who needs to judge, at a glance, whether the machine can take
another session.

**Goal:** Next to the Sessions title in the dashboard's Sessions sidebar, show
a compact status line: how many open sessions are active (working) versus
waiting (needing the developer), the host machine's current CPU usage, and its
free disk space. The developer can see session load and host headroom without
leaving the sidebar or opening another tool.

**Captured notes (to refine):**

- Space beside the title is limited, so the line must be very compact: use an
  icon for each figure instead of text labels (for example a running and a
  waiting icon with counts, a CPU icon with a percentage, a disk icon with free
  space), with accessible names or tooltips carrying the full wording.
- "Waiting" and "active" follow the sidebar's existing attention grouping
  (`dashboard/src/SessionsSidebar.tsx`, `attentionCount` in
  `dashboard/src/sessionShown.ts`); keep wording consistent with the rest of
  the dashboard.
- CPU usage and free disk space describe the machine the dashboard server runs
  on; refinement decides which disk (for example the volume holding the
  dashboard's project workspaces) and how an unreadable figure is shown.
- Resource use must stay reasonable: measuring the host must not itself load
  the machine. Sample at a modest interval, share one sample across all open
  dashboard pages, avoid spawning heavy processes per read, and stop sampling
  when no page is watching.
