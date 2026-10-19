# Open the notified dashboard story on macOS

**Source:** [Selected notification-navigation story](../../seeds/SEED-140-dashboard-session-notifications.md#open-notified-story-from-macos-notification)
**Identity:** SEED-140#open-notified-story-from-macos-notification

## Goal and scope

A developer clicking a dashboard session notification reaches the correct
project and story card, with useful focus, in Safari or Chrome as the default
browser. This must work without a previously open dashboard page and after a
direct URL open or reload. Receipt and dismissal do not navigate; a click does
not start or resume agent work. Missing targets are explained without selecting
unrelated work. An unreachable dashboard is a failed destination.

Terry accepted the separately installed `terminal-notifier` recommendation on
2026-10-19. Document that prerequisite and its notification permission; report
missing/refused delivery through the existing alert-availability surface while
the dashboard remains usable. Preserve the server's existing alert decisions,
title/message/sound, startup baseline, unread-report behavior and cleanup.

No automatic helper installation/update, custom native application, browser push
service, exact-tab reuse, automatic terminal attachment, or duplicate-request
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
- Native delivery opens an HTTP URL through macOS, with no shell command
  activation. Preserve argument text as data. Probe the installed helper's
  accepted version, option-value escaping and diagnostics before selecting
  those details. Do not use an AppleScript fallback that reproduces the wrong
  click destination, or report delivery success from executable presence alone.
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

Observed in `/Users/terryyin/git/open-dough/.worktrees/open-the-relevant-dashboard-story-from-a-macos-n`
at `2446f02c17735b08df833c3a4483fabb6f4b150a` on 2026-10-19. The same
preparation branch is `codex/open-the-relevant-dashboard-story-from-a-macos-n`;
the publication target is `origin/main`, and the integration checkout is
`/Users/terryyin/git/open-dough`. These are preparation locations, not a future
execution claim. Plan 318 follows the highest allocated number 317 in current
paths and Git history; its path was checked immediately before creation.

| Premise / consuming operation | Observation and limit |
| --- | --- |
| Existing cross-project navigation waits for the right data and reveals the intended card | `env -u NO_COLOR npm run test:dashboard -- session-sidebar-navigation.spec.ts --workers=1` passed. Its real preview page opens the other project's sidebar entry, withholds that project's response, then asserts the identified card in the viewport after release. This is reusable reveal behavior, not proof of a notification URL. |
| That proof detects a missing reveal | Temporarily omitted only `element.scrollIntoView(...)` in `workFocus.ts`'s `keepInView`, then ran the same command. It failed at `session-sidebar-navigation.spec.ts:109`: target card viewport ratio was 0. Restored the exact source bytes; the combined run below passed. No scratch product edit remains. |
| The local fixtures reach alert decisions, process arguments, unavailable UI, and shutdown without native notifications | `env -u NO_COLOR npm run test:dashboard -- session-sidebar-navigation.spec.ts session-alerts.spec.ts session-alerts-unavailable.spec.ts boundary/session-alerts-unread-report.spec.ts boundary/agent-launch-codex-observation-alerts.spec.ts --workers=2` passed. Tests drive isolated launch/session records and assert fake sender calls, alert availability in the page, and termination of a held sender. They do not establish actual delivery or clicks. |
| A real helper can activate the correct default browser after the sending command exits, without navigating on receipt/dismissal | Unsettled, owned by slice 1. `sw_vers` reports macOS 26.6.2 (25G83); `command -v terminal-notifier` finds none on PATH. Safari and Chrome app bundles are present. The seed links the helper's documented URL action and Homebrew distribution. Presence and documentation are not a native result. Installing/authorizing a helper and changing the default browser are machine-state changes, so the permitted early probe owns them before dependent implementation. |

The initial test invocation with inherited `NO_COLOR` failed the project's
quiet-output rule on a Node color warning. The listed commands unset that
variable and passed. Existing fixtures do not implement the new URL contract;
slice 2 must add a discriminating test before implementing it. The complete
native journey remains required in slice 3 even after the helper probe passes.

## Outside-in proof ownership

| Final-state promise | Owning slice | Observable proof |
| --- | --- | --- |
| Real native activation uses the default browser, after helper exit; receipt/dismissal stay quiet | 1, confirmed end to end in 3 | Actual notifications clicked in Safari and Chrome conditions; observe destination and absence of navigation on delivery/dismissal. A directly opened URL or recorded `-open` argument is insufficient. |
| Correct project and story after delayed loading, cold open, reload and direct open | 2; composed notification journey in 3 | Page fixture with two projects sharing a story identity, another off-screen target, held data, and assertions on selected project, card viewport and keyboard focus; repeat via the emitted URL. |
| Stale/unknown target is explicit, with useful project navigation | 2 | Unknown project and successfully loaded project with missing story show the requested target and a usable route back; no unrelated card is focused. Failed read is a read failure, not proof of absence; retry can resolve the target. |
| User navigation wins over a pending target; ordinary project/view/history behavior survives | 2 | Move to another project while response is held, release it and assert no delayed jump; Back/Forward and reload use the URL target, and project-only routes retain their existing behavior. |
| Actual serving origin and stable encoded identity travel from notification decision into the page | 3 | Isolated dev and preview servers on non-default/ephemeral ports emit their own reachable URL; visit the captured URL and observe the target card. Identity with `#`, changed title, and same identity in another project cannot misdirect it. |
| Navigation does not launch/resume work or attach a terminal | 2 and 3 | Fake host launch/resume/attach logs remain unchanged across direct URL navigation and notification-click acceptance. Receipt/dismissal leave page and browser unchanged. |
| Missing/refused helper is explained; current alert semantics and literal text survive | 3 | Existing alert scenarios adapted to a fake notifier, unavailable sidebar and recovery, unread-report/Codex callers, quoted/backslash/leading-special-character text, and held child termination. Native setup/refusal check confirms what the helper can actually report. |
| Unreachable destination is never called successful navigation | 1 and 3 | Stop the isolated destination before a click, observe browser connection failure and no product-success assertion; no server-start or agent-start side effect. Restore the test server for later cases. |

## Ordered slices

### 1. Establish native notification activation in the default browser

Type: Behavior
Status: planned
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
Status: planned
Proof: New `dashboard/tests/notification-story-navigation.spec.ts` browser
journeys, plus affected project, roster, history and session-reveal regressions.

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
Status: planned
Proof: Server alert journeys and captured-URL page navigation, followed by real
default-browser notification clicks into the completed dashboard behavior.

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
Use the argument and permission behavior observed in slice 1; do not invoke
shell click commands. Document the separate prerequisite, tested version and
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

Each implementation slice includes its focused verification and local cleanup;
use the execution workflow's post-change refactor and commit gates. There is no
project-supplied numeric slice limit to invent. Slice 1 has one native handoff
question; slice 2 has one URL-resolution rule; slice 3 composes that rule with
the existing notification lifecycle. Native final acceptance stays with the
delivered behavior rather than becoming an unowned later task.

For dashboard source changes run `npm run typecheck:dashboard` and the focused
Playwright suites above, adding consumers when the effect trace requires them.
These checks cover the changed typed boundary and actual rendered/process
effects; a full repository suite is not a blanket local requirement. At each
new proof boundary, confirm failure without its claimed behavior before green.
For maintained prose, check links and the described setup against the observed
journey. Keep temporary native observations here until wrap-up assimilates
lasting behavior into the feature documentation.

No remaining slice-specific concern was found in this construction review.
Separate slice-plan refinement was not needed: the slices have distinct
learning/delivery outcomes, one common target model and explicit proof owners.
Native feasibility remains bounded by slice 1, not asserted as already proved.
This plan grants no execution authority and records no execution completion.
