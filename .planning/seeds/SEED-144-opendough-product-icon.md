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

## Correction

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
