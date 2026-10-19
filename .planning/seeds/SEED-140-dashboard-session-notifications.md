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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
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
preserve alerts for genuinely new requests. Investigate and reproduce the
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
- The developer answers, the agent actually resumes work, and it later asks a
  new question. That new request raises one notification, even if its displayed
  wording happens to match the previous request. A gap in observation alone is
  not evidence of resumed work.
- Two distinct sessions asking the same question each receive their own alert;
  deduplication must not compare message text globally.
- Restarting the dashboard with an already-waiting session preserves the existing
  quiet baseline rather than replaying historical input notifications.

**Open questions for refinement:** Which native request/message/turn identity or
other evidence can establish continuity and genuine progress for the affected
host, and which observed failure path reproduces the report? Identical wording
alone is insufficient to decide whether a request is new.

**Depends on:** No blocking story prerequisite.

**Safe stopping point:** Reconnecting observation no longer repeats an outstanding
input alert, even if notification clicks still use the current behavior.

<a id="open-notified-story-from-macos-notification"></a>

### Open the relevant dashboard story from a macOS notification

**Identity:** SEED-140#open-notified-story-from-macos-notification
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
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
work by themselves.

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

**Technical feasibility:** Feasible in principle, with a notification sender that
handles click actions and a dashboard link that identifies the story. Apple's
AppleScript documentation explains that notification activation opens the sending
app; `display notification` offers message, title, subtitle, and sound rather
than a destination URL. Apple's `UNUserNotificationCenterDelegate` provides
notification response handling, and `NSWorkspace` can open URLs in an application.
The maintained `terminal-notifier` documentation also exposes an `-open URL`
click action. These establish available mechanisms, not a selected dependency or
verified behavior on this machine. The existing dashboard route selects project
and stories/roster view; it does not yet select a story from the URL. Existing
sidebar navigation already reveals the associated story after selecting its
project and can inform the page behavior.

**Open questions for refinement:** Choose and prove the notification sender and
its installation/permission behavior on the supported macOS version; establish
the reachable dashboard address and story link contract. Verify actual click
navigation in Safari and Chrome, not only notification command arguments. No
promise is made to discover which browser tab originally opened the dashboard.

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
