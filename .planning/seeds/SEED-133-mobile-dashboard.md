---
id: SEED-133
status: active
planted: 2026-10-12
planted_during: Terry's request to queue remote mobile dashboard use
trigger_when: A developer wants to operate the dashboard comfortably from a phone or tablet browser
scope: unknown
---

# SEED-133: Mobile dashboard use

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
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/306-mobile-dashboard/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"2854037ac683b45a820667890fae83bc52c8e318ad8b311badaae8ada9119ed4","plan":"4de0e3a52c34c3773a88035706acc67a453cd8af76dd52c3243e7c0184fbbb29"}}
```

**Beneficiary:** A developer using the dashboard from a phone or tablet,
including an iPad or iPhone, while retaining efficient desktop operation.

**Goal:** The developer can read and operate the dashboard comfortably in a
mobile browser using touch, while desktop users retain the dashboard's
existing capabilities and efficient mouse and keyboard workflows.

**Scope:** Make the existing dashboard's primary browser workflows comfortable
by touch: selecting projects; reading Backlog, Taken, and Recently done;
inspecting stories and their preparation, dependencies, and evidence; reviewing
changes; starting story work or an unattached session; finding and managing
sessions; and using the available browser terminal and settings. Preserve the
same story meanings, host capabilities, and operations on desktop.

Required interaction behavior:

- Read the information needed to choose an action without hover, including
  session identity/state, attention messages, and a Start action's reason or
  limitation. Long titles and source details remain discoverable in full.
- Reach navigation, actions, and recovery by touch without precise dragging,
  a hardware keyboard, accidental neighbouring activation, or page-wide
  horizontal overflow. A code diff or terminal may keep its own content
  navigation; reading it must not make its surrounding controls unreachable.
- Preserve the current task context and instruction draft across orientation
  or available-space changes. Opening and leaving story details, Sessions,
  reviews, terminals, settings, and launch dialogs follows existing
  project/session selection and focus-return behavior, including an intentional
  project change when selecting another project's session.
- Keep the active input and required submit, cancel, close, and recovery
  actions reachable when the on-screen keyboard appears. Keyboard appearance
  or rotation alone must not start work or reattach a terminal.
- Preserve desktop mouse/keyboard navigation, shortcuts, focus return,
  useful simultaneous columns/panels, resizing, and reduced-motion behavior.

**Deferred promises:** Remote-access provisioning, authentication changes, a
new hosting arrangement, a native mobile app, offline operation, mobile push
notifications, and new agent-host capabilities. These are not rejection
rules for behavior an existing compatible arrangement already supports.

**Browser and acceptance boundary — Terry's 2026-10-12 decision:** Implement
browser-neutral interactions. Use one currently available browser for testing;
there is no Safari/Chrome requirement or browser matrix. In that browser,
exercise phone/tablet-sized touch contexts, portrait/landscape dimensions,
constrained visible height while editing, and corresponding desktop journeys.
Record the browser and conditions actually used. Viewport/touch checks are the
accepted local UI proof; they do not claim physical iOS keyboard behavior or
universal browser compatibility.

Tailscale, remote connectivity, and the previously requested real-device
connection reality check are outside this story. Terry will arrange connection
later; no reachable URL or access setup is a refinement, execution, or
acceptance prerequisite. Test the UI through the existing local harness and
its disposable configuration/sessions. Preserve current request admission,
authentication, and native-host operation semantics.

**Key examples / evaluation:**

1. Given a phone-sized touch view with a project containing entries in
   Backlog, Taken, and Recently done, select that project, move from Backlog to Taken and Recently done, and
   inspect a long-titled story and its dependency/readiness explanation.
   The whole title and reason are available by touch, navigation stays
   reachable, and returning preserves the story's context without page-wide
   sideways scrolling.
2. Given a story with reviewable changes in a tablet-sized view, open Review changes,
   choose a file, read its diff, and rotate. The chosen review/file remains
   selected, content remains navigable, and Close returns to the originating
   work. Repeat at phone width; maximizing and
   returning do not require dragging a thin edge.
3. Given an eligible story or the project's Start session action, open its
   dialog in the selected test browser, enter a multiline instruction with
   the available viewport reduced as while using an on-screen keyboard, inspect host/session choices and their effects,
   then cancel or explicitly Start. Cancel leaves no launch; Start displays
   the existing pending, accepted, uncertain, or failed result accurately.
   Rotation and keyboard dismissal preserve the draft. A recovery choice
   follows the existing launch result instead of disguising it as success.
4. Given sessions with attention and ordinary state, open Sessions by touch,
   identify the intended session and its project/state, then open its terminal
   or available final report. Read an attention message, then choose a session
   whose intended work is not confirmed complete and exercise Keep open on its
   Mark as done question without stopping work. Existing confirmation and
   host-specific Done semantics remain intact.
5. Given a disposable session supplied by the local browser-test harness,
   open its browser terminal, type and submit a harmless follow-up, read the
   response, change orientation dimensions, then close/reopen or reconnect as
   appropriate. Input, output, and panel controls remain usable with constrained
   visible height;
   reopening targets the same session under that host's existing attachment
   lifecycle. Exercise actual browser-to-server terminal traffic with the
   harness native-host stand-in; a page shell alone is insufficient. Record
   the observed host contract without claiming a live remote-device check.
6. Given System settings at phone width, inspect Projects, OpenAI status, and
   Terminal theme, and edit a field with constrained visible height. The required
   save/cancel/retry action stays reachable and a failed operation retains its
   existing recovery. Writes affect the dashboard host's settings; use
   disposable configuration for acceptance, not real credentials.
7. Repeat the corresponding journeys on desktop with mouse and keyboard,
   including focus return, Escape and existing shortcuts, side-panel resizing,
   and navigating columns beside open panels. Desktop work keeps its useful
   simultaneous context and existing actions.

**Approaches considered — recommendation, not a scope change:**

| Approach | User effect and system consequence | Assessment |
| --- | --- | --- |
| Extend the current shared browser journeys | Keeps one familiar project/story/session model across phone, tablet, and desktop. Existing column paging, panel stacking, disclosures, focus restoration, and shared controls can own the adaptation; touch and keyboard gaps still need observation. | Recommended smallest existing solution. Preserve the connected stages and improve their existing interaction owners. |
| A separate guided operating mode, borrowing a dispatch desk's request → acknowledgment → follow-up cycle | A developer would choose the work context, issue an explicit command, receive its host/session acknowledgment, then return to its result or required input. This could reduce competing context on a small screen, but introduces a second navigation flow whose identity, draft, result, and recovery must stay consistent with the ordinary dashboard. | Credible alternative if observation shows existing journeys cannot become comfortable. Current evidence does not justify the added interaction model. It must still cover inspection, settings, and interactive terminals. |

In the borrowed mechanism, the dispatcher is the developer, the request is a
story or unattached-session instruction, the executing crew is the native host
session, and the acknowledgment is the dashboard's actual launch receipt and
session identity. The useful correspondence is explicit context and feedback
across a remote action. Its limit is consequential: an agent conversation can
need continuous input, trust/approval interaction, and terminal control; it is
not a fire-and-forget job. A request queue cannot replace that interaction or
turn an acknowledgment into completed work. This analogy proposes an
alternative; it supplies no evidence that mobile use works.

**Architecture and operation boundaries:**

- Reuse the existing shared frame, column navigation, panel lifecycle,
  session identity, and host operations. Mobile presentation adds no second
  authority for story state, sessions, or readiness. This follows
  [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
  particularly whole-product reuse and one representation of each concept.
- Keep feature interaction design here and in its eventual plan under
  [ADR 0000 — Use Architectural Decision Records](../../docs/adrs/0000-use-adrs-accepted.md).
  The [ADR index](../../docs/adrs/README.md) agrees with the relevant records;
  no Accepted-ADR conflict was found for this UI scope. Dashboard ADR 0008 is
  Proposed and supplies no authority to change the connection boundary.
- The [UX/UI North Star](../../docs/dashboard-ux-ui-north-star.md) retains
  connected work stages, meaningful focus/reading order, and essential
  information available without hover. Its design hypotheses do not select
  a particular mobile layout or component.
- Starts, native CLIs, working directories, saved settings/credentials, and
  session records remain on the dashboard host. A project path is a path on
  that machine, not on the phone. Existing host-local notifications do not
  establish a mobile notification channel.
- Preserve the [terminal and session contract](../../dashboard/AGENT-LAUNCH-TERMINALS.md):
  Claude/Codex socket closure ends their attachment client while retaining
  native work; Cursor retains its kept client. Reconnect uses the same
  session. A missing Codex workspace can lead to its read-only final report.
  Mark as done retains each host's existing confirmation and stop/rename or
  local-Done behavior; mobile access does not promise new host capabilities.
- Browser requests and terminal WebSocket upgrades retain the existing
  admission boundary. UI acceptance uses the local test route; later remote
  connectivity belongs to Terry and does not gate this work.

**Refinement evidence and limits — 2026-10-12:**

Inspection used the established preparation worktree at
`e7455dc2182629e1211d648925fe4c1101153a06`. Existing
[column paging](../../dashboard/src/dashboard-columns.css),
[stacked panels](../../dashboard/src/side-panel.css), and
[narrow Sessions behavior](../../dashboard/src/session-sidebar.css) make reuse
plausible. [SidebarEntry](../../dashboard/src/SidebarEntry.tsx) exposes its
project/state/model details through a native title tooltip; their touch
availability needs attention. Shared controls are 2.5rem, column edge controls
1.75rem wide, and resize strips 0.8rem wide. These measurements identify
comfort candidates, not observed device failures. The existing dependency
disclosure already has a touch-sized control and a tap journey that can inform
the same responsibility elsewhere.

The selected checkout's [server configuration](../../dashboard/vite.config.mts)
and [request admission](../../dashboard/server/localOrigin.ts) require loopback
access. Earlier local production probes returned HTTP 200 for a matching
loopback request and HTTP 403 for a synthetic non-loopback Host; Tailscale
reported no Serve configuration. Those probes neither prove remote use nor
create an access prerequisite under Terry's revised scope. No access setup,
launch, or terminal attachment was performed during those observations.

**Open decisions:** None for story scope. The plan must name bounded proof for
the UI changes in one available browser and distinguish that evidence from
unperformed physical-device or remote-connectivity validation.

**Depends on:** No blocking story prerequisite. Tailscale and remote-access
availability are outside this story and do not block its implementation.

## Breadcrumbs

- Terry's 2026-10-12 capture requested mobile operation with desktop
  preservation. His refinement decisions require browser-neutral implementation
  and testing in one available browser, and remove Tailscale/connectivity and
  its reality check from this story; he will arrange the connection later.
- [Current dashboard behavior](../../dashboard/README.md).
