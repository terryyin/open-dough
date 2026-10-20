---
id: SEED-144
status: active
planted: 2026-10-20
planted_during: Terry's acceptance of the Open Dough icon and request for product-wide adoption
trigger_when: Open Dough is identified in its dashboard, browser, or desktop notifications
scope: unknown
---

# SEED-144: Recognizable Open Dough product identity

## Why This Matters

A developer using Open Dough needs to recognize its dashboard, browser tab,
and desktop alerts at a glance. Terry accepted the simplified raw-dough icon,
including its small favicon treatment, and requested that it be used wherever
it applies. The macOS notification pop-up must visibly show this same icon.

The mark represents raw dough as a starting point for many creations. Preserve
its recognizable dough silhouette and natural kneaded fold when adapting it
to each display size.

## Selected Story

<a id="recognize-opendough-by-its-icon"></a>

### Recognize Open Dough by its icon across product surfaces

**Identity:** SEED-144#recognize-opendough-by-its-icon
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/326-recognizable-product-identity/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f8879bc1e6ea565d81e01ff9bac9f4cd2f24c40c9dae0adb646cf8e212b21baa","plan":"aed696a9c0301db26aa867b1110808c7416269a81eb32a24bdaa76f9d666fbb0"}}
```

**Goal:** A developer viewing the dashboard, returning to a browser tab or
bookmark, or receiving an attention alert recognizes Open Dough by the accepted
raw-dough mark. Consistent identity makes these entry points recognizable
without changing how the developer reads project work or responds to a session.

**Scope — required behavior:** Adopt the accepted mark on the following
product-owned surfaces. The inventory is based on the current dashboard, not
on every place an image or the word "icon" occurs.

| Surface | Adoption and boundary |
| --- | --- |
| Dashboard shell | Show passive Open Dough identity in the configured dashboard, the no-project first-use view, and System settings. The selected project's heading and evidence remain that project's identity. |
| Browser tab and bookmark | Supply the accepted favicon through the dashboard HTML and served assets, including the retained 16/32-pixel treatments and multi-size ICO. |
| Touch/home-screen metadata | Reference the retained 180-pixel touch icon. This does not promise an installable web app. |
| macOS notification pop-up | The actual sender icon is the accepted mark, with an Open Dough sender identity. An attachment or dashboard image alone does not meet this promise. |
| Built and deployed product | Browser assets and the native sender's required icon resources work from the normal dashboard delivery, including an isolated production deployment. No contributor checkout path is required. |

Use the retained assets and generation prompt as the source of required
derivatives, with stable canonical names. Preserve the silhouette and kneaded
fold at each intended size. Record the adopted inventory and justified
exclusions in maintained feature documentation when implementation finishes.

Preserve existing attention timing, literal title/message data, Glass sound,
shutdown cancellation, and notification-click navigation. Keep permission-aware
availability and recovery, naming the sender whose permission is actually
needed. A missing or refused branded sender remains an alert-availability
problem; it does not stop session observation or become successful icon proof.

**UI and setup:** Product identity is passive and recognizably separate from
project selection, source evidence, Sessions, and System settings actions.
Name it accessibly without duplicating adjacent equivalent text, adding a
keyboard stop, or obscuring existing controls on narrow or zoomed screens.
Do not turn the mark into a new navigation action.

Retain the existing separate native-helper setup pattern: an explicit one-time
setup command prepares the Open Dough sender and offers a clearly identified
test/authorization notification. Ordinary dashboard startup diagnostics stay
passive. The new sender has its own macOS Notifications permission; the old
terminal-notifier grant is not assumed to transfer. Recovery names the right
Notifications entry and, when needed, the separate browser Automation consent.
Refusing consent leaves ordinary dashboard use available. The command is the
preparation's default interaction choice, extending today's separately installed
helper rather than adding a new System settings action.

**Deferred promises and justified exclusions:** No installable PWA, general
desktop application, notification-event redesign, additional notification
platform, or broader interface redesign is required. There is no existing web
manifest or standalone Open Dough application surface to update. Action glyphs,
execution-mode symbols, host/vendor avatars, and human/agent portraits identify
other concepts and retain their meanings. Adding artwork to prose-only README
content is not required for these runtime entry points. These are delivery
boundaries, not new rejection rules for naturally supported behavior.

**Key examples / evaluation:**

- Given a fresh browser context, open the dashboard and bookmark it: the tab
  and bookmark use the accepted mark. Visually inspect the 16- and 32-pixel
  treatments on light and dark browser chrome; an old cached or generic icon
  does not satisfy the example. The declared touch icon serves the accepted
  180-pixel asset.
- Given either a configured project or no configured projects, open the
  dashboard and then System settings: the same passive product identity is
  visible without distortion or clipping. Switch to a different project:
  Open Dough remains the product identity while the selected project keeps
  its own name and evidence. Existing controls remain reachable by keyboard
  and at narrow/zoomed sizes.
- Given a Mac with the supported helper but no Open Dough sender permission,
  run the documented explicit setup: the branded sender can request its own
  permission with a clearly named test. Declining permission yields accurate
  recovery guidance without breaking dashboard use; after granting it,
  diagnostics and real delivery can succeed. Startup does not silently request
  permission or emit setup notifications.
- Given the configured branded sender and enabled notifications, cause a real
  Open Dough attention transition: the macOS pop-up visibly displays the
  accepted sender icon and existing text. After the sending process exits,
  clicking still reaches the correct dashboard project/story. Observe browser
  Automation permission or refusal separately; a helper invocation, attached
  image, or successful delivery exit alone proves neither appearance nor click.
- Given a normal built deployment and a later replacement/restart, browser
  asset requests and native sender resources remain usable without the
  contributor's checkout. Confirm that the same sender identity retains its
  setup across deployment replacement; do not assume macOS permission
  persistence from an unchanged identifier alone.

**Architecture — design and consequences:**

- One canonical brand source under `assets/brand/` supplies browser assets and
  native size/format derivatives. The current Vite root is `dashboard/`, with
  existing static assets in `dashboard/public/`; make exposure deliberate for
  both dev and build rather than referencing the source filesystem from HTML
  or maintaining independently edited copies.
- For the developer, a branded sender makes an external alert identifiable;
  for the system, it adds a product-owned app-bundle identity, local icon
  resources, and first-use permission/recovery. Reuse terminal-notifier's
  native delivery and inline click protocol. Version 3.1 removed `-appIcon`
  and `-sender`; `-contentImage` is an attachment. The supported custom-icon
  mechanism is a separately identified app bundle, documented in the
  [3.1 custom-icon guidance](https://github.com/julienXX/terminal-notifier/tree/3.1.0#custom-icons).
  A real native probe must validate the exact packaged route, consent, icon,
  click, and replacement before dependent rollout relies on it.
- The sender must outlive disposable production checkouts and completed
  worktrees, because a notification can be clicked after its sending process
  or deployment has ended. Keep its stable machine-local identity/resources
  separate from the published story state; no new state registry is needed.
- Follow Accepted [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  for one representation and whole-product coherence, and
  [ADR 0000 — Use ADRs](../../docs/adrs/0000-use-adrs-accepted.md)
  for keeping feature-local design here. No Accepted ADR conflict or exception
  was found. Dashboard deployment is separate from installed skill guidance;
  [ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md) and
  [ADR 0004](../../docs/adrs/0004-client-installation-and-update-accepted.md)
  do not authorize hand-editing managed installed skills to deliver branding.
  Apply [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)
  to distinguish synthetic protocol checks from native visible proof. Proposed
  ADRs 0007–0009 bind no choice in this story.

**Source assets:** [Accepted icon](../../assets/brand/opendough-icon.png),
[favicon assets](../../assets/brand/favicon/), and
[retained generation prompt](../../assets/brand/generation-prompts.txt).
Keep these canonical names unversioned; superseded design attempts are not
alternative rollout choices.

**Depends on:** No blocking story prerequisite. The accepted assets are kept
with this backlog addition; existing notification follow-ups can be developed
independently while preserving their behavior.

**Safe stopping point:** The accepted mark identifies the applicable existing
product surfaces and the macOS pop-up has direct visual confirmation, without
requiring a wider interface redesign.

<a id="branded-alert-click-automation"></a>

### Correction: Name the Automation consent a branded alert click actually needs

**Identity:** SEED-144#branded-alert-click-automation
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/330-branded-alert-click-automation/PLAN.md"}
```

**Goal:** A developer whose branded Open Dough alert cannot open the dashboard
in their browser is told the exact System Settings Automation entry to allow,
and that entry is the one macOS actually consults for the click; updating
terminal-notifier tells them to refresh the Open Dough sender.

**Scope:** Bounded retrospective correction of
SEED-144#recognize-opendough-by-its-icon (plan 326); adds no feature promise.
Included: observe on a Mac which app macOS asks about (and records) for the
branded alert's browser scripting, including a refusal; name that entry in the
click-recovery dialog and the maintained alert docs; one setup sentence on
re-running `npm run setup-notifier:dashboard` after updating terminal-notifier.
Preserved: the inline click callback, destination quoting, tab reuse and the
dialog-instead-of-extra-tab behavior; the branded sender identity and its
Notifications permission. Plan:
[330-branded-alert-click-automation](../slice-plans/330-branded-alert-click-automation/PLAN.md).

## Priority and Preparation

Terry explicitly requested this story at the top of the product backlog on
2026-10-20. This queues adoption; it does not start the rollout. Refinement
establishes the applicable surface inventory and the supported custom-app
notification mechanism above. Exact native packaging and macOS behavior remain
an early execution probe, because they require permission and visible delivery;
they have not been claimed as observed during preparation.

## Breadcrumbs

- Terry's accepted latest icon, request to retain only the latest assets and
  generation prompt, and explicit product-wide adoption request, 2026-10-20.
- [Dashboard browser entry](../../dashboard/index.html) and
  [dashboard banner](../../dashboard/src/DashboardBanner.tsx).
- [Native notification integration](../../dashboard/server/terminalNotifier.ts)
  and [current notification behavior](../../dashboard/AGENT-LAUNCH-HISTORY.md).
