---
id: SEED-140
status: active
planted: 2026-10-19
planted_during: Terry's report of repeated session alerts and notification click behavior
trigger_when: Reconnecting to an agent session repeats its input notification, or a notification click opens Script Editor instead of the dashboard
scope: unknown
---

# SEED-140: Trustworthy dashboard session notifications

## Why This Matters

A developer relying on dashboard notifications needs one useful alert when an
agent needs input, and a direct route back to the corresponding work. Terry
reports hearing the same notification repeatedly after what appears to be a
lost connection to an agent session followed by reconnection. Terry also reports
that clicking a macOS notification opens Script Editor rather than the dashboard.

The connection loss is a reported hypothesis, not a reproduced cause. The current
alert loop remembers each session's immediately preceding reading and unread
report. It replaces that snapshot on each successful poll; an unknown observation
can yield no alerting reading, and a missing session leaves no entry in the next
snapshot. Returning to the earlier waiting state can therefore look like a new
reason to notify. These are investigation leads, not proof of Terry's incident.

## Selected Stories

<a id="avoid-repeating-input-notifications-after-reconnection"></a>

### Avoid repeating input notifications after session reconnection

**Identity:** SEED-140#avoid-repeating-input-notifications-after-reconnection
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/319-input-alert-continuity/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5051f159c3b182853f99fa65179b347a6c57f5b28f46b35cfb685e832e7796b6","plan":"048cbd51f478798f552384ffce8341d9a4c69cf90889f654fb952c62f8ca2677"}}
```

**Beneficiary:** A developer waiting for dashboard alerts while an agent session
needs their input.

**Goal:** Recognize an already-notified input request when session observation
recovers, so that the same outstanding request does not repeatedly show a macOS
notification or play its sound.

**Scope:** Establish how to distinguish the same outstanding input request from
a genuinely new request within a native session. Preserve that distinction across
temporary disconnection, unreadable or unknown observations, and temporary absence
from session listings. Repeated reads and reconnects alone must not rearm an
alert. Keep different native sessions independent, including across hosts, and
preserve alerts for new requests after positively observed resumed work. A
complete answer/work/new-question cycle between successful observations may
remain quiet; Terry accepted this limit on 2026-10-19. Investigate and reproduce the
reported failure before selecting a repair; do not assume the transport or agent
host responsible. Preserve the existing startup baseline, acknowledgement, and
unrelated notification behavior.

**Key examples / evaluation:**

- A session needs input and raises one notification. Observation becomes unknown,
  unavailable, unreadable, or temporarily omits the session. When the same
  outstanding request reappears, no second input notification or sound occurs,
  even after several reconnect cycles.
- Repeated observations of the same request stay quiet. A changed summary alone
  does not establish a new request.
- The developer answers, the dashboard observes the agent working, and the
  agent later asks a new question. That new request raises one notification, even if its displayed
  wording happens to match the previous request. A gap in observation alone is
  not evidence of resumed work.
- The agent answers/works/asks again entirely between successful observations.
  With no observed resumed work, the next waiting reading stays quiet; this is
  the accepted limitation, even if the question is genuinely new.
- Two distinct sessions asking the same question each receive their own alert;
  deduplication must not compare message text globally.
- Restarting the dashboard with an already-waiting session preserves the existing
  quiet baseline rather than replaying historical input notifications.

**Interaction and architecture options:**

| Direction | What the developer experiences | System consequence and limit |
| --- | --- | --- |
| Remember the outstanding input alert until positively observed resumed work (selected) | Reconnection stays quiet; a later request after observed work alerts even with identical wording. A complete answer/work/new-question cycle between polls may remain quiet. | Extend the existing server-run, host-qualified session alert memory. Unknown, unavailable, incomplete, unrecognized, and omitted observations do not prove resumed work. No new persistence or host protocol is needed for the reproduced cases. |
| Track native request identity or durable progress | A new request could alert even when its intervening work was not polled. | Requires additional host-specific evidence. The shared observation contract has no request identity; current Codex and Claude adapters do not supply one. Feasibility for every affected host and for multiple waits within one turn is unproved. A turn ID alone must not be presumed to identify an input request. |
| Rate-limit repeated alerts by elapsed time | Reduces interruption frequency, but an old request may alert again when the interval expires; a genuinely new request may be silenced inside the interval. | Adds a timing rule without establishing request continuity; does not satisfy the existing examples. |

Turning off notifications or relying solely on the existing dashboard state is
a simpler workaround, but removes the promised useful alert while the developer
is away from the page. It does not meet this story's goal. Terry selected the
first direction on 2026-10-19, including its missed-cycle limitation. Native request tracking and rate limiting are not selected.

**Investigation (2026-10-19):**

- At `b2a19339d29fc55159355591d88ecb21a92806e2`, the real server polling and
  notification-command boundary reproduced a duplicate after Claude's listing
  failed and recovered, after the same Claude session disappeared from and
  returned to its native listing, and after a Codex passive metadata read was
  refused and then returned to `waitingOnUserInput`. Each began with one input
  notification; recovery produced a second identical notification with Glass.
  These are controlled failure-path reproductions, not attribution of Terry's
  original incident to a particular host or transport.
- The scratch Claude examples extended
  [session-alerts.spec.ts](../../dashboard/tests/session-alerts.spec.ts): start
  working, enter blocked, observe one notification, fail the listing (or save
  its JSON and omit the session), observe further polls, restore the listing,
  then require exactly one input notification. Both failed with two. The
  Codex example extended
  [agent-launch-codex-observation-alerts.spec.ts](../../dashboard/tests/boundary/agent-launch-codex-observation-alerts.spec.ts):
  after its existing metadata refusal, restore the same waiting flags and
  require the count to remain one. It failed with two. No real agent session,
  production store, or macOS notification was used.
- Reproduction command in the established preparation workspace:
  `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/session-alerts.spec.ts dashboard/tests/boundary/agent-launch-codex-observation-alerts.spec.ts --grep 'observation keeps|native transition alerts'`.
  Result: all three selected scenarios failed on the duplicate-notification
  assertion. An earlier attempt to restore a forgotten session through the
  fixture's change helper failed in setup; saving and restoring its native
  listing fixed the observation route before this result.
- A disposable experiment remembered notified waiting sessions by the existing
  `sessionKey`, populated that memory during the initial quiet baseline,
  retained it across observation loss, and cleared it only on an available
  `working` reading. It suppressed repeat waiting notifications without
  changing other alert transitions or unread-report comparison.
  `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/session-alerts.spec.ts dashboard/tests/boundary/agent-launch-codex-observation-alerts.spec.ts dashboard/tests/boundary/session-alerts-unread-report.spec.ts`
  then passed all 12 scenarios, including the three new discriminating replays,
  startup baseline, changed reason, actual observed work and re-entry,
  acknowledgement, other alert readings, and completion reports. Product and
  test edits were reverted before this refinement write. This establishes
  feasibility for those observed cases, not a completed repair or full story
  acceptance; repeated gap cycles, omitted machine records, cross-host ID
  collisions, and progress missed between polls were not runtime-proved by that
  initial run. Subsequent planning observations are recorded in the associated
  plan; they do not establish detection of unseen progress.
- [SessionAlerts](../../dashboard/server/sessionAlerts.ts) replaces the preceding
  reading map on each successful poll.
  [alertReading](../../dashboard/src/sessionShown.ts) yields no reading for
  unknown/incomplete observation; an unavailable reading replaces Needs input.
  Thus recovery compares against something other than the earlier waiting
  reading. A native omission does not necessarily remove the machine record:
  [withStates](../../dashboard/server/launchStates.ts) retains recorded targets,
  while the Claude adapter reports native absence as unavailable.
- [SessionState](../../dashboard/src/launchRecord.ts) carries normalized
  activity and optional waiting text, with no input request/message identity.
  [Codex observation](../../dashboard/server/hosts/codex/sessions.ts) maps active
  flags and latest-turn status to that contract;
  [Claude listing](../../dashboard/server/hosts/claude/listing.ts) supplies state
  and waiting text. [Cursor observation](../../dashboard/server/hosts/cursor/sessions.ts)
  carries held-screen labels as unknown; current alert interpretation leaves
  those quiet. The investigation found no basis to add a new Cursor input-alert
  capability to this repair.
- What remains a hypothesis: the exact observation sequence in Terry's
  incident, and whether additional passive native evidence can distinguish
  every new request whose intervening work was never polled. An incident trace
  could attribute the former; a controlled native answer/work/new-request cycle
  with observation paused would need to expose stable request/progress evidence
  to settle the latter. Neither is claimed observed here.

**Architecture:** Keep notification history distinct from the latest displayed
session observation. Retaining that history must not make the page claim a
stale waiting state is current, change acknowledgement, or combine input alerts
with completion-report delivery receipts. The existing alert loop is the owner
of this responsibility and `sessionKey` already qualifies identities by host.
PFE also inspected first-input `turnId` evidence and completion-delivery receipt
identity: they identify startup acceptance and completion submissions,
respectively, not later input requests, so neither is a suitable replacement.
The existing run-local baseline supports the selected approach; persistent
history, subscriptions and protocol expansion are not needed for the reproduced
cases and are not selected.

[ADR 0000 — Use ADRs](../../docs/adrs/0000-use-adrs-accepted.md) places this
feature-local design in the seed/plan and maintained feature documentation;
[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
favors one coherent responsibility and reuse of the existing alert owner. The
current ADR index and in-file statuses agree: 0000–0006 are Accepted, 0007–0009
are Proposed. Dashboard ADR 0008 is not binding. No conflict or exception was
identified. The [dashboard North Star](../../docs/dashboard-ux-ui-north-star.md)
requires truthful current observation and visible uncertainty; historical alert
memory must not replace either. No new layout, control, or North Star topic is
needed for the selected approach.

**Deferred promises:** Notification click navigation remains the sibling story.
This story does not add new alert categories, change delivery retry policy,
replay notifications across dashboard restarts, or redesign notification
presentation. These are delivery boundaries, not rejection rules for naturally
supported behavior. Detecting a new request whose intervening work is never observed is deferred
by Terry's decision below.

**Decision (Terry, 2026-10-19):** Require observed resumed work before a later
input alert can be raised for the same native session. A request whose entire
answer/work/new-question cycle occurs between observations may remain quiet.
A change in summary, elapsed time, unknown reading, disappearance, or restored
connection alone does not establish resumed work. This resolves the scope
question; no human decision remains open for this story.

**Slice plan:** [Input alerts survive observation gaps](../slice-plans/319-input-alert-continuity/PLAN.md).

**Depends on:** No blocking story prerequisite.

**Safe stopping point:** Reconnecting observation no longer repeats an outstanding
input alert, even if notification clicks still use the current behavior.

<a id="open-notified-story-from-macos-notification"></a>

### Open the relevant dashboard story from a macOS notification

**Identity:** SEED-140#open-notified-story-from-macos-notification
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/318-notification-story-navigation/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"bf6978a6df138d9463c5a3f2c244ff29e5188ce8429563cb48718055949dace0","plan":"886b9f19d3689ecf4793d043d3b4c4e89b200a23d916ebb9e46f1285e51c692f"}}
```

**Beneficiary:** A developer clicking a dashboard session notification on macOS,
using Safari or Chrome.

**Goal:** Clicking the notification opens the dashboard at the correct project
and reveals the associated story card, ready for the developer to inspect the
session needing attention.

**Scope:** Give a session notification a click action that opens a dashboard URL
identifying its project and story, and let the page resolve that target after
loading its data. Support Safari and Chrome as the user's default browser,
whether or not a dashboard page is already open. Opening a new tab is acceptable;
reusing an exact existing browser tab is not required. Keep receipt and dismissal
of notifications free of navigation. Handle an outdated target explicitly rather
than opening unrelated work. Notification clicks must not start or resume agent
work by themselves. Use separately installed `terminal-notifier`, with documented
setup and macOS notification permissions. Explain a missing or refused helper
through alert availability while the rest of the dashboard remains usable.
Automatic helper installation/updates and an Open Dough native helper are
deferred promises.

**Key examples / evaluation:**

- With Safari as the default browser and another project currently selected,
  click a session notification: the dashboard shows the notification's project
  and brings the identified story card into view with useful focus. Script Editor
  is not the click destination.
- Repeat with Chrome as the default browser and no dashboard page open. The
  correct project and story are reached after initial data loading.
- Reload or directly open the notification's URL: it resolves the same project
  and story without relying on the state of a previously open tab.
- If the story has since left the active board, identify the unavailable target
  and offer useful project navigation; do not silently select a different story.
  An unreachable dashboard remains a failed destination, not successful navigation.
- Receiving or dismissing a notification does not open the browser or change the
  selected work. Clicking it does not launch a second agent session.
- If the required helper is absent or notifications are refused, the dashboard
  explains the setup problem and still lists sessions; it does not claim that a
  notification or its click destination was delivered successfully.

**Exploration — selected direction:** Terry accepted the separately installed
`terminal-notifier` recommendation on 2026-10-19.

| Direction | Fit to the same click-to-story outcome | Consequence |
| --- | --- | --- |
| Keep AppleScript notifications and navigate manually through Sessions | Smallest existing workaround, but clicking still activates the sender rather than the target dashboard story | Does not deliver the selected goal; keep only as the current baseline |
| Use separately installed `terminal-notifier` | Its documented `-open URL` action supplies the native click boundary while the existing dashboard owns the destination | Selected: a documented macOS prerequisite and notification permission; missing or refused helper must be explained through existing alert availability |
| Distribute/manage `terminal-notifier` with the dashboard | Same click mechanism with installation handled by Open Dough | Adds helper acquisition, versioning, app-bundle placement and update responsibility; no evidence yet that this convenience is needed |
| Build an Open Dough native notification helper | Apple's notification-response APIs can open the dashboard URL | Adds native application identity, packaging, permissions and lifecycle ownership; justified if the existing helper proves unsuitable, not merely for branding |

The selected direction preserves server-originated alerts when no dashboard tab is
open and delegates HTTP URL opening to macOS's default browser. Browser-owned
notifications would change that lifecycle and require a separate background
delivery mechanism for the closed-page example; they are not the smaller route
to this story. No exact-tab reuse, custom URL scheme, desktop dashboard shell,
or automatic terminal attachment is promised.

**Architecture — feature design:**

- Keep the server's current session observation and notification decision in
  `SessionAlerts`; change the notification delivery boundary without changing
  the sibling story's request-continuity policy. Preserve title, message, sound,
  quiet startup, unread-report alerts, availability reporting, and shutdown
  ownership. An ad-hoc launch has no story identity: preserve its alert rather
  than fabricating a story target.
- Build an ordinary HTTP dashboard URL from the serving dashboard's actual
  loopback origin, its configured project ID, and the launch's recorded story
  identity. Contract: `/?project=<encoded-id>&story=<encoded-identity>`
  on the stories view. Use URL encoding, including the identity's `#`; titles,
  seed paths, queue positions and session IDs are not story identifiers. Do not
  hard-code production port 4173: development and isolated tests use other
  ports. The boundary is installed before listening, so the actual address
  must be available before emitting a destination. A server without a usable
  destination must not claim successful click navigation.
- Extend the existing route and published-data observation. Resolve the target
  only against the named project's loaded membership; reuse `workCard` and
  `keepInView` for identity lookup and reveal, with useful keyboard focus.
  Sidebar navigation also opens a terminal, so it cannot be called wholesale
  for this navigation-only action. Reload/direct opening must carry all
  targeting information in the URL. A later user project choice must supersede
  a pending reveal rather than let a delayed read pull them back.
- Preserve the requested target until it can be resolved or explicitly reported
  unavailable. Today's invalid-project route silently normalizes to the default
  project; notification targeting must instead explain the unknown project and
  offer project navigation. An absent story after a successful read is distinct
  from loading or a failed read. Neither may silently focus unrelated work.
  Clicking is navigation only: no start, resume or new session.

This follows [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
by extending the existing domain responsibilities, and the current
[Architectural North Star](../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
and [dashboard navigation](../../docs/dashboard-navigation.md) direction.
Under [ADR 0000 — Use ADRs](../../docs/adrs/0000-use-adrs-accepted.md), this
feature design stays here and in its eventual plan rather than becoming an ADR
proposal. The ADR index and records agree; no relevant Accepted conflict or
supersession was found. ADR 0008 remains Proposed and supplies no binding rule.

**Evidence and remaining feasibility:** On 2026-10-19 in this preparation
workspace at `2446f02c17735b08df833c3a4483fabb6f4b150a`:

- `sw_vers` reported macOS 26.6.2 (25G83); `command -v terminal-notifier`
  found no executable on the session PATH. No helper was installed, notification
  permission changed, or default browser changed during refinement.
- [Apple's AppleScript guide](https://developer.apple.com/library/archive/documentation/LanguagesUtilities/Conceptual/MacAutomationScriptingGuide/DisplayNotifications.html)
  documents sender activation and offers no destination argument.
  [terminal-notifier's documentation](https://github.com/julienXX/terminal-notifier#click-actions)
  documents URL click actions, application-bundle identity and permission
  diagnostics. [Homebrew](https://formulae.brew.sh/formula/terminal-notifier)
  lists stable 3.1.0. These are mechanism and distribution evidence, not a
  successful local click or compatibility claim.
- `env -u NO_COLOR npm run test:dashboard -- session-sidebar-navigation.spec.ts --workers=1`
  passed. Its fixture selects another project's sidebar session, holds that
  project's data response, then checks the revealed card after release. It
  supports reuse of the existing reveal behavior. It neither exercises a story
  URL nor proves native notification activation, actual Safari, or actual Chrome.
  The first run without `env -u NO_COLOR` failed the quiet-output rule because
  inherited color settings caused a Node warning; no product edit was needed.
- `launchBoundary.ts` already receives the HTTP server;
  `launchSubject(request).identity` supplies the recorded story identity;
  `dashboardRoute.ts` currently handles only project/view; `workFocus.ts`
  owns card lookup and reveal. These inspected responsibilities locate the
  changes; the proposed full journey remains unimplemented and unverified.

**Open decisions:** None. Helper feasibility is an observation owned by the early
probe in the slice plan, with a stop/replan if the selected mechanism fails.

**Required native proof:** Establish the selected helper's
actual installation, permission and click behavior on the target Mac before
depending on it for broader implementation. Observe a real click into Safari
and Chrome as default browsers, with and without an existing dashboard page,
and observe that receipt/dismissal does not navigate. Final acceptance must
reach the correct project and focused story after loading, not just inspect
command arguments or call the URL directly. An unreachable dashboard is still
a failed destination. These state-changing observations have not run; plan a
bounded early feasibility probe with a stop/replan on failure. No promise is
made to discover which browser tab originally opened the dashboard.

**Depends on:** No blocking story prerequisite. It can be delivered independently
of notification deduplication; queue order reflects Terry's stated priorities.

**Safe stopping point:** Notification clicks reach the relevant dashboard story
without requiring broader browser automation or a desktop dashboard application.

## Ordering and Scope Reduction

Terry requested the duplicate input-notification story first in the product
backlog, followed by notification navigation if technically possible. The latter
has a supported technical path and is queued second. Preserve the existing
Taken work and the relative order of all other queued stories. This capture
authorizes neither implementation nor executable slice planning.

## Breadcrumbs

- Terry's report, feasibility question, explicit first/second backlog priorities,
  and authorization to edit main and synchronize origin, 2026-10-19.
- [Session alert loop](../../dashboard/server/sessionAlerts.ts).
- [Alert interpretation](../../dashboard/src/sessionShown.ts) and
  [native session identity](../../dashboard/src/sessionReference.ts).
- [Existing notification scenarios](../../dashboard/tests/session-alerts.spec.ts).
- [Project/view URL routing](../../dashboard/src/dashboardRoute.ts) and
  [dashboard navigation](../../docs/dashboard-navigation.md).
- [Apple: Displaying Notifications](https://developer.apple.com/library/archive/documentation/LanguagesUtilities/Conceptual/MacAutomationScriptingGuide/DisplayNotifications.html).
- [Apple: UNUserNotificationCenterDelegate](https://developer.apple.com/documentation/usernotifications/unusernotificationcenterdelegate).
- [Apple: Open URLs in a specified application](https://developer.apple.com/documentation/appkit/nsworkspace/open(_:withapplicationat:configuration:completionhandler:)).
- [terminal-notifier click actions](https://github.com/julienXX/terminal-notifier#click-actions).
