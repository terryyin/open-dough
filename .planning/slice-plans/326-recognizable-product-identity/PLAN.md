# Recognize Open Dough across dashboard, browser, and macOS alerts

**Identity:** SEED-144#recognize-opendough-by-its-icon
**Source:** [Selected story](../../seeds/SEED-144-opendough-product-icon.md#recognize-opendough-by-its-icon)

## Goal and scope

A developer recognizes the accepted raw-dough mark inside the dashboard, when
returning to its browser tab/bookmark, and in the actual macOS attention pop-up.
Use the retained assets; do not redesign the mark. Cover the configured shell,
no-project shell, System settings, favicon/bookmark and 180-pixel touch metadata,
and the native sender. Preserve project identity, controls, notification timing,
literal text, Glass sound, cancellation, and durable click navigation.

The setup default preserves today's separately provisioned helper: an explicit
one-time command creates the branded sender and can request authorization with
a clearly named test. Startup remains diagnostic only. A separate Notifications
grant and potentially browser Automation consent are real user consequences;
neither is assumed to migrate from terminal-notifier. No new in-dashboard setup
action, installable PWA, full desktop application, notification platform/event,
or prose-only documentation artwork is promised. Preserve mode symbols, action
glyphs, host avatars, and people/agent portraits.

No implementation is authorized by this plan. Preparation does not send a
notification, create a sender identity, request consent, or change system state.

## Current decisions and reuse

- PFE: reuse `assets/brand/opendough-icon.png`, the supplied favicon exports,
  and retained generation prompt. One canonical source supplies deterministic
  size/format and build derivatives. The current `dashboard/public`/Vite asset
  mechanism owns browser delivery; extend it deliberately for the canonical
  root assets instead of parallel hand-edited copies or source filesystem URLs.
  Keep source filenames unversioned; normal build output naming may follow Vite.
- PFE: `dashboard/server/terminalNotifier.ts` owns the native protocol and
  fixed availability explanations; `sessionAlerts.ts` owns attention/rearming
  and the diagnostic gate; `notificationActivation.ts` owns the self-contained
  click callback. Extend these responsibilities. Do not add another attention
  tracker, persisted destination registry, or notification service.
- terminal-notifier 3.1's `-appIcon` and `-sender` were removed;
  `-contentImage` attaches content. The upstream supported custom-icon mechanism
  is a separately identified `.app`, with converted icon resources, a bundle
  identifier/display name, and signing. Retain the executable name and version
  protocol `terminal-notifier` so existing diagnostics remain meaningful.
  [3.1 documentation](https://github.com/julienXX/terminal-notifier/tree/3.1.0#custom-icons),
  [Makefile](https://github.com/julienXX/terminal-notifier/blob/3.1.0/Makefile#L86-L120).
  Rebranding a copy of the locally installed supported helper is a candidate,
  not validated packaging. Slice 1 must establish the exact usable route.
- Upstream diagnosis requests no permission; undetermined permission exits
  unsuccessfully, and `SessionAlerts.attempt()` stops before delivery when its
  diagnostic fails. First-use setup must explicitly enter delivery/authorization;
  merely changing the executable path cannot bootstrap this identity.
  [Native implementation](https://github.com/julienXX/terminal-notifier/blob/3.1.0/Terminal%20Notifier/AppDelegate.m#L553-L599).
- Keep the branded app at one stable machine-local location under the existing
  Open Dough dashboard home, outside production deployment checkouts/worktrees.
  Choose and document one bundle identifier and location in slice 1; refresh
  the product-owned copy, never the installed Homebrew app. No hard-coded
  contributor path or download during ordinary alert delivery. Existing helper
  installation remains a separately documented prerequisite.
- PFE: `DashboardBanner.tsx`, `App.tsx`'s no-project header, and
  `SystemSettings.tsx` are the shell entry points. Add one small passive brand
  representation they can share. `SourceStatus.tsx` identifies the selected
  project; neither its heading nor `Icon.tsx`'s action glyph model becomes
  product branding. Choose presentation during execution while preserving the
  story's reachability and accessible naming promises.
- `productionDeployment.mjs` already builds an exact full source checkout and
  retires replaced deployments. `publishedMainFixture(true)` copies tracked and
  new nonignored source, including brand assets. Extend existing deployment proof
  for brand assets; keep native identity resources stable outside that lifecycle.
- Accepted [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  constrains reuse and coherent ownership; [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md)
  keeps this feature-local design here. Follow [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  when distinguishing native observation from fake-helper protocol proof.
  [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) and
  [ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
  preserve release/installation ownership: no managed installed skill edits or
  release operation is part of this dashboard story. The ADR index and in-file
  statuses agree: 0000–0006 Accepted, 0007–0009 Proposed, no supersession/conflict
  found. No ADR exception or new ADR is proposed.
- The existing [architectural North Star](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment)
  leaves session observation/alerts at the local server boundary, separate from
  repository story state. The [UX/UI direction](../../../docs/dashboard-ux-ui-north-star.md)
  requires reachable controls and equivalent reading at narrow/zoomed sizes.
  This feature fits those directions; no new North Star topic is needed.

## Outside-in proof ownership

| Source promise | Owning slice | Observable proof |
| --- | --- | --- |
| First-use branded sender, explicit consent, accurate recovery | 1 | Run documented setup on macOS; see branded authorization/test, decline/recover as applicable; ordinary diagnostic emits nothing. A second setup/refresh retains a usable identity. |
| Actual accepted sender icon and existing notification behavior | 2 | Cause a real dashboard attention transition; directly inspect the pop-up's sender icon and text. Synthetic alert suites preserve timing, content, rearming, failures and cancellation. |
| Click after helper exit and deployment replacement | 2 | Click an actual branded alert after sender exit and after replacing/restarting its dashboard deployment; existing browser reuse and correct project/story destination remain observable. Observe Automation consent/refusal separately. |
| Favicon, bookmark, small-size/light-dark recognition, touch metadata | 3 | Built-preview HTTP bytes and HTML references; fresh browser tab/bookmark and direct 16/32-pixel light/dark chrome observation; touch link resolves to the accepted 180-pixel file. |
| Configured/no-project/settings identity without lost project meaning or controls | 4 | Real page journeys show the mark, switch project, enter/leave settings, and retain project evidence, keyboard reachability, and narrow/zoom layout. |
| Normal delivery without contributor absolute paths | 1–4 | Setup uses delivered sources then stable local resources (1); native survives replacement (2); deployment fixture serves exact brand bytes from its isolated build (3); shared shell renders that same delivered mark (4). |
| Adopted inventory and exclusions remain discoverable | 4 | `dashboard/README.md` describes adopted surfaces; native setup/current behavior stays in `dashboard/COMMANDS.md` and `dashboard/AGENT-LAUNCH-HISTORY.md`, beside the corresponding implementation. |

## Decisive premises and preparation observations

Named checkout:
`/Users/terryyin/git/open-dough/.worktrees/recognize-open-dough-by-its-icon-across-product`,
base `a09612b577f39b287654264145884c0671b6c397`, 2026-10-20, Node 24.21.0.

- `npm ci --no-audit --no-fund` completed. `node scripts/setup-native.mjs check`
  reached Chromium prerequisite validation successfully (Chromium 153.0.8010.12).
  The unpaid isolated browser proof route is available in this checkout.
- `npm run test:dashboard -- boundary/session-alerts-helper.spec.ts
  session-alerts-delivery.spec.ts dashboard-header.spec.ts
  frame-overview-look.spec.ts system-settings-look.spec.ts
  notification-story-navigation.spec.ts --list` selected successfully (exit 0).
  These files use the real alert owner/build/page with isolated host/GitHub
  boundaries; they do not exercise the system notification UI.
- Discrimination: temporarily return before sending in
  `sendTerminalNotification`, then run `npm run test:dashboard --
  boundary/session-alerts-helper.spec.ts --grep 'all leading characters'`.
  It failed at line 201: expected one helper delivery, observed zero. The
  command also reported the inherited NO_COLOR/FORCE_COLOR warning. Restore
  the scratch edit, then run `env -u NO_COLOR npm run test:dashboard --
  boundary/session-alerts-helper.spec.ts session-alerts-delivery.spec.ts
  dashboard-header.spec.ts frame-overview-look.spec.ts
  system-settings-look.spec.ts notification-story-navigation.spec.ts`:
  exit 0 with the suite's silent passing reporter. The complete selected route
  reaches actual built pages and delivery/click consumers. All scratch product
  edits and judged failed-run artifacts were removed before record writes.
  This is existing behavior/regression-route evidence, not new icon proof.
- Read-only native observations on this Mac: terminal-notifier 3.1.0;
  macOS 26.6.2; installed helper bundle
  `fr.julienxx.oss.terminal-notifier`, `CFBundleIconFile=Terminal`, ad hoc signed;
  Command Line Tools installed. `terminal-notifier -help` explicitly says the
  custom sender/icon flags were removed; `terminal-notifier -diagnose` reports
  the existing helper authorized with banners/sounds. These consuming diagnostic
  results establish the current helper contract, not the new app's consent.
- Browser serving direction is new behavior to implement and test: the HTML
  currently declares no icons, root brand assets are outside the Vite root and
  current dev allow list, and the dashboard has no product mark. The existing
  page build/preview route ran above; new asset assertions must fail before the
  new exposure exists. Do not count file presence or baseline suites as proof
  of future browser identity.
- **Permitted early probe, slice 1:** branded packaging, macOS sender appearance,
  first-use consent, Automation consent, and permission/identity persistence
  after bundle refresh require system mutation, notification delivery and human
  OS interaction. Preparation observed their harmless prefixes only. All
  slices depending on native feasibility stop if the probe cannot establish the
  promised route. Re-plan within scope if possible; a missing visual observation
  is unfinished proof, never success by exit code or plausibility.

## Ordered slices

### 1. Set up and observe a persistent Open Dough notification sender
Type: Behavior
Status: planned
Proof: The explicit setup command builds/prepares the branded helper from the
supported local prerequisite, names its stable app path and permission entry,
and can emit a clearly labelled authorization/test notification. Direct native
observation sees the accepted sender icon and a usable click callback after the
sending process exits. Re-running setup/refresh preserves a usable identity.

Given a supported Mac/helper and no branded sender, when the developer runs
setup, the product-owned app with the accepted icon is prepared without
modifying Homebrew's bundle. Permission is requested only through the explicit
setup/test action; refusal has an accurate recovery path. Diagnostic-only use
does not post or request permission. Existing helper permissions are not treated
as the branded sender's grant.

Use the upstream custom-bundle mechanism as the first bounded experiment. Keep
the tested native delivery protocol and existing inline callback. Establish one
stable identifier/location outside retiring deployments. Derive `.icns` from the
canonical accepted asset. Verify signing/launch and permission behavior on this
Mac, including one refresh at that same location. Document the exact command,
native runtime, observations and setup recovery in the plan/feature docs. Reuse
the resulting setup implementation in slice 2; retain no disposable prototype.
Use fixture tests for setup's filesystem/resource and refusal contracts with an
isolated machine home/helper, without sending real notifications in automation.

This is the risk gate. If the app cannot show the actual accepted sender icon,
retain the evidence and stop dependent native work for replanning. Do not weaken
the story to an attachment or an old helper icon. Native Automation consent must
be observed, not inferred. Interim behavior: the dashboard still uses its current
sender until slice 2, while the new setup is explicitly invoked only.

### 2. Recognize and open real dashboard attention alerts from the branded sender
Type: Behavior
Status: planned
Proof: The real dashboard attention transition posts the accepted sender icon;
after helper exit, a click reaches the correct project/story using existing
browser reuse. Repeat across a normal deployment replacement/restart. Focused
synthetic suites prove preserved content, timing/rearming, failure and shutdown
contracts without ever reaching the machine's real notification app.

Given the configured branded sender, when the existing attention owner emits an
alert, it uses that sender and unchanged literal data/sound/click destination.
Missing setup or denied Notifications permission gives accurate availability
guidance; observation continues, and existing recovery/retry semantics apply.
Browser Automation permission/refusal keeps its separate truthful recovery.

Extend `terminalNotifier.ts`'s single executable/resource owner and fixed
explanations. Keep `SessionAlerts`'s ownership, cancellation and attention policy,
the inline `notificationActivationSource`, and the executable's argument/version
contract. Adapt `fakeClaude`/`fake-terminal-notifier` at the native executable
boundary so isolated tests never fall through to a real installed app when the
default path changes. Test absence and consent/refusal as well as success. Build
and restart from an isolated delivered checkout, then verify sender identity and
click resources do not depend on the retired checkout or the sending Node
process. Update setup/permission wording in the maintained notification docs.

Run `env -u NO_COLOR npm run test:dashboard -- session-alerts
boundary/session-alerts notification-story-navigation.spec.ts` for the affected
alert/activation consumers; include any further host-specific consumers found
when changing the executable seam. Inspect their setup/assertions before reusing
coverage. Perform the real macOS observation separately under the manual-testing
workflow: automated argv/exit assertions do not establish the icon.

### 3. Recognize the dashboard in browser tabs, bookmarks, and touch metadata
Type: Behavior
Status: planned
Proof: Fresh built-preview HTML references served accepted ICO/PNG and touch
assets with correct type/size/content. The isolated production-deployment
fixture requests and compares the brand bytes from its built pinned checkout.
Direct fresh-browser observation confirms tab/bookmark use and recognizable
16/32-pixel silhouette/fold on light and dark chrome.

Given the delivered dashboard, when the developer opens/bookmarks it, browser
identity uses the accepted mark. The HTML's touch-icon reference resolves to the
accepted 180-pixel export. No web manifest/installability is introduced.

Extend `index.html` and one deliberate asset-exposure route that works in both
Vite dev and production build from canonical sources. Serve normal URLs without
contributor paths. Reuse supplied exports; do not regenerate the accepted design.
Add discriminating asset/metadata proof using the existing built server, and
extend `production-deployment.spec.ts`'s full-source build/HTTP-byte check. Since
that fixture consumes the whole source and build, run its complete affected
deployment file, not only the new assertions. Run the new focused identity spec
and `boundary/serving-modes.spec.ts` if exposure changes shared dev/preview
configuration. A browser/OS bookmark that does not consume the supplied icon
remains an observation to resolve, not success from HTML alone.

### 4. Recognize Open Dough inside each dashboard shell state
Type: Behavior
Status: planned
Proof: Extend the existing frame/header/settings journeys to show the accepted
passive mark in configured and no-project views and System settings; switch to a
different project and verify its name/evidence retain their meaning. The mark
loads from the delivered asset, fits without clipping, is named without duplicate
announcement or an added keyboard stop, and leaves controls reachable in each
affected CSS branch and at the existing narrow/zoom sizes.

Given any top-level shell state, when the developer views the dashboard, the same
Open Dough mark is visible independently of the currently selected project.
Use one small shared brand representation and the asset route from slice 3.
Preserve the current action/portrait/mode identities. Adapt the banner's layout
only as needed for the mark; inspect enclosing text/heading/role and keyboard
consumers, not only direct imports. Keep existing project headings and source
disclosure names unambiguous.

Run `env -u NO_COLOR npm run test:dashboard -- dashboard-header.spec.ts
frame-overview-look.spec.ts system-settings-look.spec.ts` plus any additional
enclosing consumer identified by the final layout change. Add assertions to the
journeys owning each CSS branch instead of a duplicate static width matrix.
Record the adoption inventory/exclusions in `dashboard/README.md`; maintain
native setup/current behavior beside slices 1–2 in `dashboard/COMMANDS.md` and
`dashboard/AGENT-LAUNCH-HISTORY.md`. Inspect the resulting light/dark page and
narrow/zoom rendering under manual testing; completion still requires slices
1–3's direct external icon observations.

## Sizing, cumulative design, and safe stopping

Four bounded proof loops: native setup/feasibility, real attention delivery and
durable click, browser identity, and in-page identity with preserved controls.
No numerical slice limit was supplied. Slice 1 isolates the consequential macOS
unknown before relying on it; its native observations cannot be substituted by
unit fixtures. Slices 3 and 4 reuse one browser asset route, while native icon
conversion is a format derivative of the same accepted mark. The different
representations follow actual consumers, not separate branding definitions.

Each completed slice leaves current external behavior usable. The native setup
is opt-in before slice 2 switches the sender; slices 3 and 4 can safely deliver
independently after that risk is resolved. Neither the probe nor partial icon
adoption completes the story. There is no blocking story prerequisite.

During execution apply the existing post-change refactor/delivery workflow and
focused proof per slice. `npm run typecheck:dashboard` checks changed TS and test
contracts; the repository pre-commit hook owns staged lint. Hosted CI remains
owned by execution, but does not make the whole suite an extra local gate.
`dashboard/tests/README.md` owns test tiers, fixture isolation, and CSS-branch
placement; `dashboard/COMMANDS.md` owns native prerequisite validation. No skill
guidance or cross-tool activation mechanism changes, so no routine tool-by-tool
skill discovery matrix is added.

## Learnings

Preparation found that macOS sender identity, rather than a missing icon flag,
owns the difficult part of the requested outcome. The current helper is
authorized but its grant is not evidence for a new branded bundle. Direct native
proof and first-use setup therefore lead the plan. No execution has started.
