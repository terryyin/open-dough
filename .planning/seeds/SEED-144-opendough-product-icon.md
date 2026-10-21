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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/330-branded-alert-click-automation/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"20aaee07281d8aacd608d50e13d6c38e4078c916b36239a304fc226cccecb7c2","plan":"48e2fd2d50fe737fb7e0e0b4aebb7dd499fc6405671163ffd51edcc9e5736017"}}
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
The name is established by a real branded alert click, its Automation prompt,
and the resulting System Settings row, not inferred from the notification's
Open Dough branding. The existing correction plan owns the examples and the
early native probe; an unstable attribution stops dependent wording changes.
Preserved: the inline click callback, destination quoting, tab reuse and the
dialog-instead-of-extra-tab behavior; the branded sender identity and its
Notifications permission. Plan:
[330-branded-alert-click-automation](../slice-plans/330-branded-alert-click-automation/PLAN.md).

**Developer-approved proof amendment (2026-10-21):** Establish the granting
identity from the observed System Settings Automation app/browser entries and
controlled refusal/retry tests through real branded alert clicks. The developer
selected this evidence instead of reproducing the first permission prompt,
whose wording was not retained. This supersedes the prompt-evidence requirement
above; it does not waive refusal/recovery, tab preservation, successful retry,
or support for either Safari or Google Chrome. No consent reset is needed to
recapture the first prompt.
