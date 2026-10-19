# Open the notified dashboard story on macOS

**Source:** [Selected notification-navigation story](../../seeds/SEED-140-notification-story-navigation.md#open-notified-story-from-macos-notification)
**Identity:** SEED-140#open-notified-story-from-macos-notification

## Goal and scope

A developer clicking a dashboard session notification reaches the correct
project and story card, with useful focus, in Safari or Chrome as the default
browser, reusing an existing tab for this running dashboard and foregrounding its
window. Open a tab only when none matches, using an existing browser window when
available. Direct URL opening and reload still resolve the target. Receipt and
dismissal do not navigate; a click does
not start or resume agent work. Missing targets are explained without selecting
unrelated work. An unreachable dashboard is a failed destination.

Terry accepted the separately installed `terminal-notifier` recommendation on
2026-10-19. Document that prerequisite and its notification permission; report
missing/refused delivery through the existing alert-availability surface while
the dashboard remains usable. Preserve the server's existing alert decisions,
title/message/sound, startup baseline, unread-report behavior and cleanup.

No automatic helper installation/update, custom native application, browser push
service, automatic terminal attachment, or duplicate-request
policy change is committed. The sibling deduplication story is independent;
reconcile shared `sessionAlerts.ts` changes without taking over its outcome.
Ad-hoc sessions have no story identity: preserve their alerts and never invent
a story target; an ordinary project destination is sufficient for them.

## Current decisions and reuse

- The URL contract is the serving dashboard's loopback HTTP origin followed by
  `/?project=<encoded-project-id>&story=<encoded-story-identity>`. It selects the
  stories view and encodes the entire stable identity, including `#`. A title,
  source-file path or board position cannot substitute for identity. Resolve
  only in the named project's data, even if another project has the same ID.
- PFE: `launchSubject(request)` already owns extracting a story's identity;
  `dashboardRoute.ts` owns project/view routing and history;
  `ConfiguredDashboard` and `publishedObservation` own selection and loaded
  membership; `workFocus.ts` owns `workCard` and `keepInView`, including hidden
  columns, reduced motion and ending reveal when the user moves. Extend these
  responsibilities. `sessionNavigation.ts` is evidence of their composition,
  but its sidebar caller also attaches a terminal and is not a suitable whole
  action to reuse for a notification click.
- PFE: `SessionAlerts` already owns server-side notification decisions and
  child-process shutdown. Replace its AppleScript delivery with the selected
  helper. `launchBoundary.ts` already receives the listening server; use the
  actual bound address when available, including an ephemeral port. Do not
  infer the destination from a previous browser request or hard-code 4173.
  Keep URL construction shared between sender and page without pulling React
  or browser state into the server. No generic notification-provider framework
  or new persisted target/session registry is needed.
- Terry's explicit existing-tab requirement replaces the earlier new-tab scope.
  Plain native URL opening is insufficient. PFE found no existing dashboard tab
  coordinator; browser scripting dictionaries can select an existing tab without
  injecting page JavaScript. First prove the native click's Automation permission
  path. A fixed callback may carry literal URL data through safely quoted system
  tool arguments; the earlier no-shell design assumed tab reuse was excluded.
  Never treat refused tab inspection as an absent tab or silently duplicate it.
- Follow [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  for cohesive responsibility and existing solutions, and
  [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md) for keeping this
  feature-local design in its maintained feature documentation. The current
  [Architectural North Star](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
  keeps authoritative membership in published project data and navigation in
  transient UI state. [Dashboard navigation](../../../docs/dashboard-navigation.md)
  supplies existing reveal/focus conventions. No new North Star topic or ADR
  exception is required; ADR 0008 remains Proposed.

## Preparation evidence and decisive premises

[Preparation observations](PREPARATION-EVIDENCE.md) retain the original revision,
locations, literal test commands, negative-control result, and their limits.
They justify the reused reveal/alert boundaries; native final acceptance is
still owned by slice 3 below.

## Outside-in proof ownership

| Final-state promise | Owning slice | Observable proof |
| --- | --- | --- |
| Real native activation uses the default browser, after helper exit; receipt/dismissal stay quiet | 1, confirmed end to end in 3 | Actual notifications clicked in Safari and Chrome conditions; observe destination and absence of navigation on delivery/dismissal. A directly opened URL or recorded `-open` argument is insufficient. |
| Correct project and story after delayed loading, cold open, reload and direct open | 2; composed notification journey in 3 | Page fixture with two projects sharing a story identity, another off-screen target, held data, and assertions on selected project, card viewport and keyboard focus; repeat via the emitted URL. |
| Reuse an existing dashboard tab and window, or open only when none matches | 3 | Actual Safari/Chrome clicks preserve matching tab/window identities and counts, foreground the reused tab at the target, preserve unrelated addresses, and still open a cold destination. |
| Stale/unknown target is explicit, with useful project navigation | 2 | Unknown project and successfully loaded project with missing story show the requested target and a usable route back; no unrelated card is focused. Failed read is a read failure, not proof of absence; retry can resolve the target. |
| User navigation wins over a pending target; ordinary project/view/history behavior survives | 2 | Move to another project while response is held, release it and assert no delayed jump; Back/Forward and reload use the URL target, and project-only routes retain their existing behavior. |
| Actual serving origin and stable encoded identity travel from notification decision into the page | 3 | Isolated dev and preview servers on non-default/ephemeral ports emit their own reachable URL; visit the captured URL and observe the target card. Identity with `#`, changed title, and same identity in another project cannot misdirect it. |
| Navigation does not launch/resume work or attach a terminal | 2 and 3 | Fake host launch/resume/attach logs remain unchanged across direct URL navigation and notification-click acceptance. Receipt/dismissal leave page and browser unchanged. |
| Missing/refused helper is explained; current alert semantics and literal text survive | 3 | Existing alert scenarios adapted to a fake notifier, unavailable sidebar and recovery, unread-report/Codex callers, quoted/backslash/leading-special-character text, and held child termination. Native setup/refusal check confirms what the helper can actually report. |
| Unreachable destination is never called successful navigation | 1 and 3 | Stop the isolated destination before a click, observe browser connection failure and no product-success assertion; no server-start or agent-start side effect. Restore the test server for later cases. |

## Execution context

[Retained execution identity, setup, delivery and observer state](EXECUTION-CONTEXT.md)
keeps the accepted earlier boundaries. [Sender evidence](SENDER-EVIDENCE.md)
records the current native observations and remaining gaps.

## Story obligations

### G1. Native click surface is unavailable
Reported: slice 1 — "Native activation in Safari and Chrome remains unobserved because the supported computer controls cannot reach the notification click surface."
Story clause: "Observe a real click into Safari and Chrome as default browsers, with and without an existing dashboard page, and observe that receipt/dismissal does not navigate."
Disposition: proved by slice 1: accepted native observations above; Terry's real Notification Center body clicks/dismissals, exact HTTP requests and browser user agents, Chrome rendered query, and restored default-browser settings.

### G2. Final native story-card acceptance
Reported: slice 3 — "Actual Safari/Chrome clicks into the final story cards under the required open/cold conditions, receipt/dismissal, stale target and stopped-server observations remain uncovered."
Story clause: "Clicking the notification opens the dashboard at the correct project and reveals the associated story card, ready for the developer to inspect the session needing attention."
Disposition: proved by slice 3: [final native evidence](FINAL-NATIVE-EVIDENCE.md) records real product Safari/Chrome body clicks, quiet receipt/dismissal, correct focused target, stale and stopped-server outcomes, and unchanged host actions; automated captured-URL/origin proof remains in [sender evidence](SENDER-EVIDENCE.md).

### G3. Existing-tab reuse added by Terry
Reported: slice 3 — "The plain URL sender does not identify or reuse an existing dashboard tab."
Story clause: "Reuse an existing tab for the same running dashboard when one exists"
Disposition: proved by slice 3: [native callback identities/counts](TAB-REUSE-EVIDENCE.md) and [final product clicks](FINAL-NATIVE-EVIDENCE.md) establish tab/window selection, cold existing-window opening, repeat reuse and preserved unrelated tabs; [automated callback proof](SENDER-EVIDENCE.md) covers refused inspection and zero-window fallback.

## Ordered slices

### 1. Establish native notification activation in the default browser

Type: Behavior
Status: done
Proof: A bounded real macOS notification probe using the selected helper and an
isolated loopback destination owned by the execution checkout.

Behavior: Given a separately installed helper and granted notification
permission, issuing a notification leaves the browser untouched; clicking it
after the command exits opens its complete URL in the current default browser.
Dismissal opens nothing. Repeat for Safari and Chrome, including no destination
tab open. Record the actual helper version and macOS version, install route,
permission outcome, literal invocation, clicked UI surface and reached URL.

Use `dough-manual-testing` for this native observation when execution is
authorized. Inspect existing setup first; use the owner's normal installation
and permission flow, and restore any changed default-browser setting. Never
bypass permission or infer a click from process exit. An isolated destination
may simply display the received query for this probe: it proves the OS/browser
handoff, not the final story card. Include one refused/not-authorized observation
or truthful diagnostic limitation and the unreachable-destination check.

This is the permitted early probe for the state-changing native premise.
Failure or inability to observe either default browser stops slices 2 and 3;
record the evidence and replan with the coordinator, preserving the selected
goal. Do not silently substitute a custom helper, weaken browser coverage, or
count direct URL opening as activation. No production implementation is
delivered by this slice. Its safe stopping value is the selected mechanism's
observed feasibility and setup requirements.

### 2. Resolve a story URL into a visible, focused card or an explicit unavailable target

Type: Behavior
Status: done
Proof: [Accepted URL journeys and affected consumers](URL-EVIDENCE.md), including
`dashboard/tests/notification-story-navigation.spec.ts` and focused regressions.

Behavior: Opening or reloading a target URL selects its named project's stories,
waits for that project's successful read, and reveals/focuses only the requested
card. Unknown project, absent story, and failed read have distinct outcomes and
useful navigation/retry. A later user selection cancels pending reveal. URLs
without a story target retain current project/view behavior.

Extend the existing route/observation and card-reveal owners. Target resolution
uses one rule for all projects and active story stages; do not add title or
stage-specific recognizers. Reuse column/reduced-motion behavior and end reveal
when the user moves. A route's story target must survive reload and browser
history while being cleared when the user chooses ordinary navigation. Keep
status accessible and focus useful without opening the terminal or executing
launch actions. Update `docs/dashboard-navigation.md` with the final contract.

Start with a failing cold-open scenario at the preview page. Cover delayed data,
matching identities in two projects, encoded identity, visible keyboard focus,
stale target/retry, and leaving while loading. Assert host action logs as well
as DOM outcomes. Inspect `project-selection.spec.ts`, `agent-roster.spec.ts`,
project-keyboard navigation and session-sidebar navigation consumers for the
actual effect on history, normalized routes and focus; run the affected suites
with the new journey. The earlier sidebar proof remains for its existing
terminal-opening purpose; it cannot replace the new navigation-only proof.

This slice delivers useful directly openable story URLs. Notifications still
use their existing sender until slice 3 replaces it; notification-click
acceptance remains unfinished, not silently dropped.

### 3. Deliver server notifications with usable story destinations

Type: Behavior
Status: done
Proof: [Sender/origin/page journeys, callback tests and independent refactor](SENDER-EVIDENCE.md)
and [final native product acceptance and cleanup](FINAL-NATIVE-EVIDENCE.md) passed.
The [bounded callback probe](TAB-REUSE-EVIDENCE.md) retains both browsers' actual
identity/count evidence separately from automated external-API proof.

Behavior: When the existing server alert rule emits a story session notification,
the helper receives its unchanged title/message/sound and the serving
dashboard's project/story URL. The notification can be clicked with no page
open and reaches slice 2's destination. A missing/refused helper explains the
setup problem while session observation continues. Closing the server ends any
owned in-flight command without inventing an unavailable result.

Use the actual server listening address and a shared URL contract; cover startup
before listening and an unavailable address without inventing a successful
destination. Preserve the notification loop's policy rather than taking on the
sibling deduplication repair. Preserve ad-hoc notifications without a story ID.
Retain literal text behavior observed in slice 1. First settle the browser-aware
callback's native permission and durable-click feasibility in a bounded early
probe; failure stops dependent production changes. Then implement tab reuse with
no duplicate on refused inspection. Verify existing-tab identities
and tab/window counts in both browsers; retain cold-opening behavior.
Document the separate prerequisite, tested version, browser permission and
setup/recovery in `dashboard/README.md` and `AGENT-LAUNCH-HISTORY.md`, and align
the helper-process description in `AGENT-LAUNCH-HOSTS.md`.

Adapt the shared fake sender/control boundary coherently: its callers include
`support/sessionAlerts.ts`, `support/fakeClaudeControls.ts`,
`session-alerts.spec.ts`, `session-alerts-unavailable.spec.ts`,
`boundary/session-alerts-unread-report.spec.ts`, and
`boundary/agent-launch-codex-observation-alerts.spec.ts`. Keep the whole existing
alert suites green, including startup silence, repeated readings, unread
reports, independent sessions, unavailable recovery, literal text and shutdown.
Add server-origin checks for dev and preview on allocated ports; navigate to an
emitted URL through the isolated project's published-data fixture and assert
the card, without the fixture supplying the new URL itself.

Finish through `dough-manual-testing`: induce an attention transition in an
isolated dashboard session, click its actual notification with Safari default
and another project selected, then with Chrome default and no dashboard page
open. Also cover the converse open/cold conditions, receipt, dismissal, stale
target and unreachable server. Observe the selected project, card visibility
and focus, and unchanged launch/resume/attach logs. Keep automated fake-process
proof and native evidence distinct. Missing native evidence leaves this slice
unfinished. Preserve/restore machine settings and remove probe-only artifacts.

## Verification and review

[Preparation and verification criteria](PREPARATION-EVIDENCE.md#verification-and-review)
retain the focused checks, proof ownership and bounded native acceptance.
