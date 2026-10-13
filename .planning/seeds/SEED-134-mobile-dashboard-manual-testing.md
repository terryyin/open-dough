---
id: SEED-134
status: active
planted: 2026-10-13
---

# SEED-134: Mobile dashboard manual testing

<a id="one-hour-mobile-dashboard-observation"></a>

### Observe the completed mobile dashboard story for one hour

**Identity:** SEED-134#one-hour-mobile-dashboard-observation
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal:** Spend one hour manually observing the completed SEED-133 mobile
dashboard behavior and its corresponding desktop workflows, reporting evidenced
discrepancies and material coverage gaps.

**Scope:** Chromium phone and tablet touch contexts, portrait and landscape,
reduced visible height while editing, dashboard reading and navigation, story
inspection and review, launch dialogs, session management, browser terminal
traffic, settings, and desktop mouse/keyboard regressions. Recover promises
from SEED-133 at 2b88b055 and current product documentation. Use the existing
local disposable browser harness; no physical-device or remote-connectivity
claim. Observation only: no diagnosis, product repair, or permanent tests.

**Known expectations:** Touch actions and recovery remain reachable, reading
needs no hover, context and drafts survive space changes, terminal traffic uses
the same disposable native session, and desktop retains navigation, shortcuts,
focus return, simultaneous context, resizing, and reduced motion.

**Observation outcome:** Google Chrome 155.0.8059.40, using real local dashboard
builds and the existing disposable GitHub and Claude fixtures. Phone and tablet
portrait/landscape, reduced visible height, desktop mouse/keyboard, terminal
traffic and reopening, review panes, launch failure/uncertainty/recovery,
sessions and retained reports, settings writes/recovery, dependency/readiness
reading, and focus/shortcuts were observed. Physical iOS and remote connectivity
remain outside the accepted boundary. The browser-control stall of 9,463.7345
seconds did not count toward the requested hour; expired fixture failures were
environment failures and the fixtures were restarted at the same URLs.

Two observed discrepancies were retained for the developer; no product repair,
diagnosis, or permanent test change was made:

- After successful Start session, the result beside that action reduces the
  collapsed Near-future direction heading to 13.27 pixels wide and 469.69 pixels
  tall at 390x844 and 430x932. The heading is readable at 768x1024.
- The Final report's unfinished-work Done confirmation clips Keep open at
  390x320 (button bottom y233.66; panel bottom y224), and hides both choices at
  390x240. Touch scrolling moves the panel without exposing those buttons; its
  intended Keep open location hits the dashboard underneath. Restoring height
  exposes the actions. The desktop confirmation and keyboard dismissal work.

Evidence is retained at
`/Users/terryyin/.codex/visualizations/2026/10/13/01a132ea-4211-7be0-8c6b-18c79a1a9b75/manual-testing/`:
`findings.json`, `phone-ad-hoc-direction-collapse.jpg`, and
`phone-final-report-confirmation-hidden.jpg` include conditions and reproduction.
A historical launch warning beside a recovered Working session is recorded as
a messaging improvement because current documentation preserves older answers.
