---
id: SEED-133
status: active
planted: 2026-10-12
planted_during: Terry's request to queue remote mobile dashboard use
trigger_when: A developer wants to operate the dashboard remotely from an iPad or iPhone browser over Tailscale
scope: unknown
---

# SEED-133: Mobile dashboard use over Tailscale

## Why This Matters

A developer away from the dashboard's host machine wants to use the dashboard
from an iPad or iPhone browser. A narrow layout alone does not establish that
its controls, dialogs, panels, and session workflows are comfortable to use
with touch. Mobile improvements must preserve the dashboard's desktop
operability.

## Story

<a id="operate-dashboard-from-mobile-browser"></a>

### Use the dashboard from an iPad or iPhone browser without compromising desktop operation

**Identity:** SEED-133#operate-dashboard-from-mobile-browser

**Beneficiary:** A developer using an iPad or iPhone away from the machine
running the dashboard, with a connection through their Tailscale network.

**Goal:** The developer can read and operate the dashboard comfortably in a
mobile browser using touch, while desktop users retain the dashboard's
existing capabilities and efficient mouse and keyboard workflows.

**Scope:** Make the dashboard's UI and UX mobile-friendly across its primary
browser workflows: selecting projects, reading and inspecting stories,
reviewing changes, starting work, managing sessions, and using the available
browser terminal and settings. Address navigation, readable content,
reachable touch controls, dialogs and panels, scrolling, orientation changes,
and the on-screen keyboard as those journeys require. Preserve desktop
operability and accessibility; refinement identifies representative journeys
and any genuine host-specific limits before selecting a design.

**Remote-access boundary and reality check:** Tailscale is the expected
connection, but configuring remote access is outside this story. Do not add
network provisioning, authentication, or a new hosting arrangement to its UI
scope. The current [dashboard guide](../../dashboard/README.md#commands)
documents loopback URLs; capture must not imply remote reachability already
works. During refinement and acceptance, check the intended path from an
actual iPad or iPhone browser over Tailscale to the running dashboard,
including interactive requests and browser terminal connections where used.
Identify any connection, browser-origin, or host-local operation constraints
that prevent the intended journeys. Record access prerequisites and observed
limits separately rather than claiming remote usability from viewport
simulation alone. An unavailable connection leaves that reality check
unproven; it does not silently expand this story into remote-access setup.

**Key examples / evaluation:**

1. On an iPhone, select a project, move among Backlog, Taken, and Recently
   done, and inspect a story. Content and actions remain readable and
   reachable by touch without relying on hover or accidental page overflow.
2. On an iPad, review changes or use the Sessions panel, open a dialog, and
   rotate the device. The active content, close controls, and navigation stay
   usable; the on-screen keyboard does not trap a required action out of reach.
3. Through Tailscale on an actual mobile browser, exercise representative
   operational journeys, including starting work and interacting with a
   browser terminal where supported. Distinguish a UI failure from an access
   prerequisite or a host-specific operation; retain observations and limits.
4. On desktop, repeat the corresponding journeys with mouse and keyboard.
   Existing actions, shortcuts, focus behavior, and useful panel/column
   operation remain available without a mobile redesign adding avoidable
   friction.

**Open questions for refinement:** Representative iPhone/iPad browser and
device coverage, the connection arrangement available for the reality check,
and which existing host-specific actions need an explicit remote-use boundary.

**Depends on:** No blocking story prerequisite established at capture.
Remote-access availability is a reality-check prerequisite, not an invented
implementation dependency.

## Breadcrumbs

- Terry's 2026-10-12 request to place this story last in the product backlog,
  preserve desktop operability, and use Tailscale for the remote reality check
  while keeping access setup outside the story.
- [Current dashboard behavior](../../dashboard/README.md).
