# Name the Automation consent a branded alert click actually needs

**Identity:** SEED-144#branded-alert-click-automation
**Source:** [Correction story](../../seeds/SEED-144-opendough-product-icon.md#branded-alert-click-automation), a bounded retrospective correction of SEED-144#recognize-opendough-by-its-icon (plan 326; attributable commits `80dbc29e`, `3683628d`, `2f99e1d5`, `597db2d4`, `ba2fce6e` on published claim `fb071924`).

## Goal and scope

When a branded Open Dough alert's click cannot script the developer's browser,
the recovery dialog and the alert docs name the exact Automation entry macOS
consults, established by direct observation of a grant and a refusal on a
Mac. Setup documentation says to re-run setup after updating terminal-notifier.

Excluded: changing the click mechanism, the sender identity or its
Notifications permission; any new setup action or automatic refresh; other
browsers than the supported Safari and Google Chrome.

## Current findings (evidence)

- Plan 326 G2 (`f248ce357226b7ad2ccea65a926e40676b3d8a2c:.planning/slice-plans/326-recognizable-product-identity/PLAN.md`): both observed clicks navigated Safari with no Automation prompt,
  although `dev.opendough.dashboard-notifier` was never granted Automation.
  Which process macOS credits for the inline `osascript` callback is unknown;
  it may be an older grant (previously documented as
  **Automation → terminal-notifier**), so a machine without that grant may
  behave differently from what was observed.
- `dashboard/server/notificationActivation.ts` (recovery `displayAlert`),
  `dashboard/README.md` (alert click paragraph) and
  `dashboard/AGENT-LAUNCH-HISTORY.md` (click section) now say "the alert
  sender", a name no Automation row carries; the refusal recovery was never
  observed.
- `dashboard/server/notifierApp.ts` `prepareBrandedNotifierApp` snapshots the
  installed helper; `dashboard/COMMANDS.md` does not say an updated
  terminal-notifier reaches alerts only after setup is re-run.

Preserved promises: inline self-contained click callback with a safely quoted
URL argument; tab reuse and foregrounding; a refused inspection shows the
recovery dialog instead of opening an extra tab; the branded sender's identity,
icon and Notifications permission.

## Outside-in proof ownership

| Promise | Owner | Observable result |
| --- | --- | --- |
| Entry macOS consults for the click is known | 1 | On a Mac, after resetting Apple Events consent for the candidate identities with the developer's agreement, a real branded alert click raises the Automation prompt; record the app it names and the row it creates |
| Refusal yields accurate recovery | 1 | Denying that prompt shows the recovery dialog naming that same entry; allowing it afterwards lets the next click navigate |
| Wording matches the observed entry | 1 | Dialog text and README/AGENT-LAUNCH-HISTORY name the observed entry; `boundary/session-alerts-activation-command.spec.ts` and `notification-story-navigation.spec.ts` stay green |
| Setup refresh after helper update is documented | 1 | `dashboard/COMMANDS.md` setup paragraph says to re-run setup after updating terminal-notifier, keeping the same identity and permission |

Proof boundary: direct native observation under the manual-testing workflow
(it changes this Mac's consent state and needs the developer's clicks, so
announce the desktop takeover once), plus the focused alert specs and
`npm run typecheck:dashboard`.

## Ordered slices

### 1. Observe and name the Automation entry for branded alert clicks
Type: Behavior
Status: planned
Proof: As in the table above. If the observed attribution shows the click
depends on a grant other than the branded sender's own and that cannot be
named stably for a fresh machine, stop with the evidence for a product
decision instead of guessing wording.

Given a branded alert and no Automation consent for the attributed process,
when the developer clicks it, macOS asks about one named app; refusing shows
the recovery dialog naming that app's Automation entry, and allowing lets later
clicks reuse the dashboard tab. Keep the dialog text free of apostrophes (it
sits in a single-quoted JXA string).
