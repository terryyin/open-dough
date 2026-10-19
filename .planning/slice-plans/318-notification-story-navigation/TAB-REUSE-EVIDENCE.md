# Existing-tab requirement and bounded native feasibility

On 2026-10-19 Terry explicitly required reusing the existing dashboard tab,
replacing the earlier scope that allowed a new tab. The selected story and
remaining slice 3 now carry that requirement; G3 remains open. Existing URL,
membership, literal-text and alert-policy proof remains valid at those boundaries.
Actual plain-URL native clicks do not prove the new tab-selection outcome.

## PFE and primary-source findings

The product has route/history, card reveal and server notification owners, but
no browser-tab coordinator. A focused repository search for BroadcastChannel,
client matching, window focus, NSWorkspace and browser scripting found no
existing implementation to reuse. Keep routing and stable identity with their
current owners; browser tab selection is the missing native-click responsibility.

terminal-notifier 3.1.0's [click implementation](https://github.com/julienXX/terminal-notifier/blob/3.1.0/Terminal%20Notifier/AppDelegate.m#L944-L1005)
uses ordinary NSWorkspace URL opening for `-open`; it does not identify tabs.
Its stored `-execute` action runs through `/bin/sh -c` after a real click, so a
possible small callback must use fixed code, absolute system paths and safely
quoted URL arguments. Inline callback code avoids a retired-worktree file or a
running Node/dashboard process being needed for the native action.

Safari and Chrome's installed scripting dictionaries expose tab URL navigation
and window/tab selection without injecting JavaScript into web pages. The
candidate matches only the serving dashboard origin and must not overwrite an
unrelated tab or equate denied inspection with no match. Existing-window and
cold-open fallbacks still need proof.

Browser scripting needs macOS Automation consent. The shipped helper's plist
has no `NSAppleEventsUsageDescription`; [Apple's usage-description requirement](https://developer.apple.com/documentation/bundleresources/information-property-list/nsappleeventsusagedescription)
and the actual responsible process leave its native permission path unsettled.
Do not modify the installed helper's plist or infer permission from a script
started in Terminal. A real notification click must establish this boundary.

## Prepared permission probe

`/tmp/seed140-tab-reuse-probe.mjs` prepares a private disposable directory and
embeds a read-only JXA callback in the notification. Node compiled its syntax
without executing it. No browser inspection occurs until Terry clicks the
native notification; no navigation or activation is performed by this probe.
Only counts and matching test-tab positions are retained, never unrelated URLs.

The prepared descriptor is
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/seed140-tab-reuse-probe-QCn4Zp/notification.json`;
the reviewable JXA source, result JSON and stderr are beside it. The destination
is the owned live fixture at `http://127.0.0.1:58312`.

At preparation, browser-control consent, actual reuse and fallback were unproved.
The observations below settle consent; actual reuse and fallback remain open.

## Safari permission observation

The actual helper notification was posted at 10:59:32 UTC. Terry clicked its
body and approved the prompt to control Safari before reading the requester.
The probe returned `state: inspected`, browser `com.apple.Safari`, with two
matching test tabs and no stderr. It performed no navigation or activation.
The ordinary Settings UI then independently showed **Automation →
terminal-notifier → Safari** switched on. No installed helper plist was changed.
This settles Safari's permission path for this native helper click chain on this
Mac; it does not yet prove selecting/navigating a tab.

## Chrome permission observation

Terry clicked the equivalent Chrome permission notification and answered "done".
The private probe directory is
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/seed140-tab-reuse-probe-UJUlkB/`.
Its result was `state: inspected`, browser `com.google.Chrome`, two windows,
13 tabs and one matching fixture tab, with empty stderr. This proves the native
helper click chain can inspect Chrome after human consent; it performed no
navigation or activation. No installed helper plist was changed.

Safari was restored as the default through the ordinary Settings UI; its
selected value was independently observed. The live dashboard fixture is
unchanged. At that point actual tab navigation/foregrounding and durable callback
execution remained the bounded native premises before dependent production
changes. No-match fallback also remained required final acceptance.

## Bounded callback observation

Use the existing owned fixture; retain its one intentional fake launch and
Terry's separate sidebar attach as the host-action baseline. Prepare the inline
callback without running browser scripting from a terminal. Post its actual
helper notification and let Terry click the body after the posting process
exits. Observe Safari first, then Chrome: pre/post tab and window identities
and counts, selected target, foreground window, rendered project/card and focus.
Repeat one click to detect duplicates. Preserve unrelated addresses and settings.

Preparation and review take roughly one third of this bounded check; both-browser
breadth takes one third; reserve the rest for unexpected native API behavior and
confirmation. Stop dependent production changes if selection/foregrounding or
durability fails. After implementation, replay the actual product notification,
no-matching-tab fallback, dismissal, stale target and stopped-server cases under
G2/G3; the scratch callback alone is not final acceptance.

Before posting the callback probe, CUA selected Open Dough in the existing
fixture tab in both browsers. Chrome tab `137234276` and Safari's second tab
then showed `http://127.0.0.1:58312/`, Open Dough selected and `Other project story`.
The parent closed only the fixture's terminal panel left by Terry's earlier
sidebar action. This provides a wrong-project starting state without a new tab
or another host action; target navigation is not supplied by the fixture.

The prepared callback is `/tmp/seed140-tab-reuse-candidate.FyP38X/callback.jxa`.
The parent caught and the agent corrected Safari's inherited `miniaturized`
property, distinct from Chrome's `minimized`. Strict mocked dictionary objects
now reject the wrong setter; that negative control failed as expected and ten
candidate cases passed. Native execution has not been inferred from those mocks.
The corrected Safari descriptor is `seed140-tab-reuse-click-Hk8pTb/notification.json`
under the system temporary directory. Its posting command exited before Terry's
requested human body click. The superseded `PE3yzc` descriptor was never posted.

At handoff, neither result nor stderr existed for the Safari callback descriptor:
no human click was observed. Production remains unchanged. Agent
`/root/slice3_tab_reuse` returned with no live commands or watches; resume this
same implementation task after actual native candidate results. The next Chrome
descriptor `seed140-tab-reuse-click-9Bkx9y/notification.json` is prepared, unposted.
The isolated server remains live for the pending Safari click.

## Safari callback result

Terry replied "done". `Hk8pTb/result.json` reports actual native action
`reused-tab`, browser `com.apple.Safari`, window ID 109. Its four-tab window
changed selection from tab 1 to tab 2; tab 2 changed from a non-target URL to
the exact target. Before and after window IDs 109/108 and counts 4/30 were
unchanged. The selected tab's target equality and browser `frontmost` were true;
stderr was empty. This proves durable click execution, native tab selection and
navigation without duplicates. Later CUA bound the production 4173 tab rather
than the fixture, so it supplies no independent final rendered-card observation.
The callback result does not close final product-composition G2/G3.

The parent temporarily selected Chrome again and posted descriptor `9Bkx9y`
after observing the selected default. Its equivalent human click is pending;
Safari must be restored after that observation.

## Chrome callback result

Terry replied "done". `9Bkx9y/result.json` reports native `reused-tab` in Chrome,
preserving tab ID `137234276` in window `137234262`. That window moved from
index 6 to index 1, frontmost changed from false to true, and the existing tab's
target equality changed from false to true. Window IDs and tab counts 11/2 were
unchanged; stderr was empty. CUA independently observed the exact target URL,
Doughnut selected and `Doughnut's renamed notified story` as the focused element,
with no terminal container. Safari's restored default was verified in Settings.

Both browsers have now consumed the browser-aware existing-tab click mechanism
after the posting process exited. The core mechanism is feasible; dependent
production changes may proceed. No-match fallback uses the scripting dictionaries'
tab creation operation and remains required final native acceptance, alongside
actual product composition and negative cases under G2/G3.
