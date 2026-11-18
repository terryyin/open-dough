---
id: SEED-404
status: active
planted: 2026-11-18
planted_during: Terry asked to queue Dashboard Frontend Test at Doughnut's speed, using Doughnut's long-lived browser
trigger_when: selected from the backlog
scope: one story
---

# SEED-404 — Dashboard Frontend Test runs at Doughnut's speed

<a id="run-dashboard-frontend-checks-at-doughnut-speed"></a>

### Run Dashboard Frontend Test at Doughnut's speed

**Identity:** SEED-404#run-dashboard-frontend-checks-at-doughnut-speed
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer waiting for Dashboard Frontend Test gets that suite's
answer in about the time Doughnut's frontend unit tests take: thousands of
cases in roughly a minute. A case mounts the real component, with the real
CSS, in one long-lived Chromium and unmounts it when the case ends. Vitest
browser mode holds that browser, and Playwright only supplies it. A case
whose proof is a real URL load, the production page, or the integrated
server stays a Playwright journey. Service substitutes stay at the service
boundary, as answers inside that browser.

Judge the gain against the cost of the move under
[ADR 0010 — Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md):
the same visible proof, with the per-case browser, static server, and full
app load removed.

**Scope:**

- Move a Dashboard Frontend Test case that asserts a rendered component,
  layout, keyboard, or touch result onto a mount in the long-lived browser.
- Leave a case on Playwright when its proof is a real navigation, the
  production `index.html`, or the integrated server. Those journeys stay in
  E2E Test or the retained Playwright group.
- Keep each case's product assertion. A browser workflow that needs the live
  server stays in E2E Test.
- This is one story until refinement. Refinement may split it. The split
  still follows the mount-or-journey rule above, and a later story dropped
  leaves the cases already moved on the long-lived browser.

#### Starting evidence

CI run 44267762058, an ancestor of the revision that queued this story,
summed 692 Dashboard Frontend Test cases to 1,427.1 seconds, about 2.1
seconds each. Every folder mean sat between 1.6 and 2.3 seconds, and the
slowest file was 1.8% of the sum. Locally the same group, with two workers,
was observed at about 700 cases in 29 minutes. The frontend app fixture
starts a static server for each case, and the case then opens the built app.

Doughnut's frontend suite, Vitest browser mode with Playwright as the
browser provider, ran 2,573 cases in 1 minute 5 seconds. Its configuration
records per-file browser isolation at about 190–280 milliseconds; the cases
inside a file mount and unmount in the page that is already open.

The proposed dashboard technology note says the first board adds no Vitest
layer. No accepted ADR requires this group to stay on Playwright Test.

**Key examples:**

- A comparison component asks for one story's proof → the real component
  mounts in the open browser with the real stylesheet and an in-browser
  service answer → the same rows, sort, and wording appear, and no static
  server starts and no full app load runs.
- A phone board indicator is tapped → the real board screen is mounted at
  the phone viewport → the indicator width and the story's gained room
  match the current assertion.
- A case loads the production page or follows a real URL → it stays a
  Playwright journey → the navigation and the bundle remain observable.
- The developer's wait for Dashboard Frontend Test falls from tens of
  minutes toward about a minute for a suite of this size, and each moved
  case still catches the visible change it catches now.
