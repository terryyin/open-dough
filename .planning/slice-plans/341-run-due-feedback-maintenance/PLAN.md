# Start the due feedback maintenance cycle from the dashboard

**Identity:** SEED-010#run-due-feedback-maintenance
**Source:** [Selected story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#run-due-feedback-maintenance)

## Goal and scope

Let the maintainer receive each due feedback assessment, the result of the
existing combined project and shared feedback maintenance cycle, from this
machine's dashboard without starting it. The cycle records when its next
review is due on Open Dough's trunk; the dashboard, under a machine-local
standing authorization in System settings, reads that date, starts one
unattached session in Open Dough's configured local folder with the
maintain-feedback-cycle invocation when the date is reached, and lets the
cycle's own completion report be the assessment: quiet when nothing needs
attention, one notification when something does. One automatic launch serves
one due date on this machine; a served date is never relaunched
automatically, and the project row says when the cycle is still due.

Included: the due block the cycle writes and its first instance in the current
watch list; the setting, its storage, endpoints, and settings section; the
server-side due check and automatic unattached launch with its record marker;
the sidebar label, project-row due state, and settings status line; the
dashboard documentation and the maintainer runbook pointer; and one
developer-run observation of a real cycle on this machine.

Excluded, as the story defers: a general scheduler, cron, or daemon; automatic
launches of any other workflow; automatic retry of a served due date;
cross-machine coordination; per-project due dates; paid native runs in
automated tests; changes to the cycle's phases, selection limit, delivery, or
authority; and the later comparison with the manual workflow, which the watch
list's review dates and the launch records make possible over the following
weeks. The host setting takes every registered host through the shared launch
path; native observation covers Claude Code only.

Assumptions: the production dashboard runs on one machine; Open Dough is a
configured project with a local folder there; the maintain-feedback-cycle
skill and its completion reporting are delivered (plan 321, closed); and the
cycle's rerun rule makes a manual rerun after a failed automatic session safe.

## Existing solutions and architectural direction

PFE across the dashboard server and the maintenance skills found every
mechanism this story composes:

- Unattached launches: `dashboard/server/agentLaunches.ts` `accept(source,
  request, reportingOrigin)` is the one entry every launch takes, called by
  the HTTP answer and usable from the server itself, with
  `dashboardOrigin(httpServer)` already supplying the reporting origin to
  `SessionAlerts` in `dashboard/server/launchBoundary.ts`. An ad hoc request
  with an instruction sends that instruction as first input with the
  reporting context (`dashboard/server/reportingInstruction.ts`), and
  `completionClosesSession` in `dashboard/server/completionClosure.ts` marks
  a non-execution session done on a report without attention, while unread
  reports alert once through `dashboard/server/sessionAlerts.ts`. Reuse all
  of it; add only the maintenance marker on the recorded ad hoc request.
- Server-side periodic observation: `SessionAlerts` is the pattern for one
  loop started and closed with the boundary, with its check period overridable
  by environment for tests. The due check is a second such loop, never a
  browser-driven read.
- Published reads: `ghRevision` resolves a project's ref and
  `readRepositoryFileViaGh` in `dashboard/server/ghContents.ts` reads one file
  at a resolved revision, memoized in retained answers. The watch list read
  reuses them; it is a new path only in the budget documented in
  `dashboard/GITHUB-REQUESTS.md`.
- Machine-local settings: `dashboard/server/openAICredential.ts` and
  `openAIConfigurationBoundary.ts` are the pattern for one machine-local JSON
  setting under `~/.open-dough/dashboard/` with `replaceFile`, local JSON
  endpoints, and a System settings section (`dashboard/src/OpenAISettings.tsx`
  within `SystemSettings.tsx`). The feedback-maintenance setting follows them
  as a plain settings file, not a credential.
- Machine-readable blocks in Markdown: the story-state fence
  (`.claude/skills/dough-product-backlog/scripts/product-backlog-story-state-block.mjs`)
  is the pattern for a fenced JSON block inside a maintained document. The
  watch list's due block follows it with its own fence name and a small
  reader under `dashboard/src/`.
- The cycle itself: `.agents/skills/maintain-feedback-cycle/SKILL.md` and
  `.agents/skills/collect-client-feedback/` own the review and already write
  the watch list's review line; the due block is one more fact they record
  under [retention and watch](../../../.agents/skills/collect-client-feedback/references/retention-and-watch.md).

Accepted ADRs: [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
keeps durable project state on origin and operational evidence machine-local;
the due date is published state, the authorization and launch records are
local, and the local server observing one published date selects no scheduler
or daemon. [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
asks mechanisms to justify their burden: the check is bounded to one ref
request and one memoized read per period. [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
keeps the fake-host proof distinct from the one native observation.
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
keeps the skill change in the maintainer's internal skill. The
[North Star](../../NORTH-STAR.md) topic "Agent launch as a requested
assignment" asks later launch stories to extend the one launch model rather
than add a parallel one; the automatic launch is an unattached launch with a
recorded requester, so no new topic is needed.

## Preparation observations and decisive premises

Observed on 2026-10-21 in the established preparation checkout
`/Users/terryyin/git/open-dough/.worktrees/receive-due-feedback-assessments-without-manual`
at `9b8f6b9e2f8e7ada53a109bc2f76c44279ceec2b` after `npm ci`. No production
dashboard, native host, or project write ran.

| Premise and consuming operation | Literal observation | Result and limit |
| --- | --- | --- |
| The plan's proof route is available here: an ad hoc launch with a first input on the fake Claude host, the real installed reporting command, and a quiet report that marks the session done. | `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-completion-quiet-claude.spec.ts --reporter=list` | 4 passed in 9.1 s under load average 2.2. The spec launches through `launchedAdHoc`, submits the installed completion command, and observes the done mark. This settles the route and example 2's quiet closure for an ad hoc session; it does not exercise a server-started launch, which slice 3 proves. |
| The server can start a launch without a browser request. | `agentLaunches.ts:149-183` `accept` takes source, request, and an optional reporting origin and runs admission and the owner's accept; `launchBoundary.ts` already computes `dashboardOrigin(httpServer)` for alerts. | Presence by reading: nothing in `accept` reads the HTTP request. Slice 3's proof reaches the operation. |
| The fake origin fixture can serve the watch list at a revision. | `dashboard/tests/publishedOrigin.ts:140-160` `publishMovingOrigin().push(revision, backlog, files)` keeps record files by repository path readable at every pushed revision. | Settled for the fixture shape; slice 3 publishes `docs/maintainer/near-term-watch-list.md` through it. |
| The watch list is at its path on trunk and its first line is the review line the block sits beside. | `git show origin/main:docs/maintainer/near-term-watch-list.md \| head -3` | Prints the heading and "Reviewed 2026-10-21 (Asia/Tokyo): …". Slice 1 adds the block below the heading. |

No premise needs a paid or owner-held observation before `ready`; slice 5 is
the developer-run observation of the whole on this machine and does not gate
the earlier slices.

## Outside-in proof

Dashboard Playwright specs with the fake Claude host, fake `gh`, the fake
terminal notifier, and the real installed reporting command, under
`dashboard/tests/`, with `DOUGH_MAINTENANCE_CHECK_MS` shortening the check
period as `DOUGH_ALERT_CHECK_MS` does. Node unit tests for the due-block
reader and the due decision. The internal skill change gets the behavior
review walk AGENTS.md requires. The native run is developer-run.

| Story example | Proof and owner |
| --- | --- |
| Block written by the cycle; due date from the seven-day policy or an earlier pending review date | Slice 1: reader unit test against the real watch list and malformed, missing, and earlier-review-date cases; behavior review walk of the skill text. |
| Setting on with host and model; persisted; off by default | Slice 2: settings spec saves, reloads, shows status, turns off; the stored file is private to the user. |
| 1, 6: due and on starts one session; not due, off, unreadable block, or failed read starts nothing and notifies nothing | Slice 3: spec publishes a watch list with a due date before and after the local date, toggles the setting, observes one or zero launches, the fake Claude's first input holding the invocation and reporting context, and the notifier's silence. |
| 2, 3: quiet report closes quietly and the advanced date ends the due state; an attention report notifies once and keeps the session listed; no second launch while open | Slice 3: the spec submits the installed completion command with and without a message, pushes a new revision with the advanced date, and reads the notifier calls and the record's done mark. |
| 4, 5: restart or repeated check while open, or an ended session without an advanced date, starts nothing again; the row shows the due state; a manual Start session still runs | Slice 3 owns the no-relaunch rule; slice 4 the row and settings status, and the manual Start session on a served date. |
| Real cycle on this machine | Slice 5, developer-run: one observed automatic launch, its completion, and the advanced block on trunk, recorded here. |

## Ordered slices

### 1. The maintenance cycle records when its next review is due
Type: Behavior
Status: done
Proof: `node --test` of the new reader `dashboard/src/feedbackReview.ts` parsing a fenced `json dough-feedback-review` block `{"schemaVersion":1,"reviewed":"YYYY-MM-DD","reviewAfter":"YYYY-MM-DD"}` from the real `docs/maintainer/near-term-watch-list.md` and from texts with no block, two blocks, a malformed date, and a block after other text; a behavior review walk of the revised skill text with one representative review.

Behavior: the shared-feedback cycle finishes its review → it writes or replaces the due block directly below the watch list's heading, with `reviewed` as the review's local date and `reviewAfter` seven calendar days later or the earliest pending **Review after** date when that is sooner → the block parses to those two dates; the current watch list carries `reviewed` 2026-10-21 and `reviewAfter` 2026-10-28. The instruction lives in [retention and watch](../../../.agents/skills/collect-client-feedback/references/retention-and-watch.md) beside the review line it already describes, and the runbook names the dashboard as a reader.

### 2. The maintainer turns feedback maintenance on in System settings
Type: Behavior
Status: done
Proof: Playwright spec: System settings shows a Feedback maintenance section off by default; turning it on with Claude Code and a model, reloading, and reading `~/.open-dough/dashboard/feedback-maintenance.json` shows the saved choice; Off removes it; a malformed file reports a problem and is left untouched. Interim: the section states that nothing starts until the due check of slice 3 exists, replaced there.

Behavior: the maintainer opens System settings → chooses On, a host, and optionally a model → the setting is saved machine-locally through local JSON endpoints like the OpenAI setting, the section shows the saved choice, and no session, record, or configuration write results. New document `dashboard/FEEDBACK-MAINTENANCE.md`, indexed from `dashboard/README.md`.

### 3. A due cycle starts one feedback-maintenance session and nothing more
Type: Behavior
Status: planned
Proof: Playwright spec with `DOUGH_MAINTENANCE_CHECK_MS` short: a published Open Dough watch list due yesterday and the setting on yield exactly one ad hoc launch in Open Dough's folder on the fake Claude host whose first input holds the host-spelled maintain-feedback-cycle invocation and the reporting context, listed in the Sessions sidebar as "Feedback maintenance", with no notifier call; restarting the server or waiting further checks adds none; the installed completion command without a message marks it done and a pushed revision with `reviewAfter` tomorrow ends the due state; with a message, the notifier is called once and the record stays open; the session ended without the date advancing is not relaunched; due tomorrow, setting off, no block, and a failed ref read each launch nothing. Unit test of the due decision function.

Behavior: the setting is on, the local date reaches the published `reviewAfter`, no record on this machine serves that due date → the check (at boundary start and each period) → one `accept` of an ad hoc request `{source: open-dough, host, model, instruction, maintenance: {due}}` with the reporting origin, recorded with the marker, on the default checkout with the default unattached policy. The marker is an optional field of the recorded ad hoc request, labels the record in `adHocLabelText`'s place, and is what later checks and the row read; a record serving a date, open or ended however, blocks another automatic launch for it. The check reads the ref and the memoized file through the existing `gh` path; `dashboard/GITHUB-REQUESTS.md` states the added requests per period. A read failure or unparsable block is "not due" and is shown through the existing read diagnostics.

### 4. The dashboard says when feedback maintenance is still due
Type: Behavior
Status: planned
Proof: Playwright spec: with a served due date whose session ended without the date advancing, Open Dough's project row states "Feedback maintenance due since 2026-10-28; its automatic session did not complete", the settings section's status line names the due date and that outcome, and the developer's Start session with the invocation runs through the ordinary dialog; while the automatic session is open the row says it is running; once a pushed revision advances the date both lines clear.

Behavior: the sessions answer carries the machine's maintenance state (recorded due date, serving record and its state, next due date read) → the project row beside Start session and the settings status line render it → the developer sees whether the cycle is running, done, or still due and acts through existing controls. `dashboard/FEEDBACK-MAINTENANCE.md` and `dashboard/AGENT-LAUNCH-HISTORY.md` describe the label and the row.

### 5. One real due cycle starts and completes on this machine (developer-run)
Type: Behavior
Status: planned
Proof: Terry turns the setting on in the production dashboard with the delivered release installed, with the watch list's `reviewAfter` reached; the dashboard starts the session; the cycle completes and its report arrives; the advanced block is on trunk. Record the launch record id, the report outcome, the notifier result, and the due dates before and after here. Paid, native, owner-held; not run by automated tests.

Behavior: a reached due date on this machine → one automatic session → the cycle's completion report and advanced due date, or an attention message the maintainer answers; whichever happens is recorded as the first real observation for the story's evaluation.

## Current decisions

- The trigger is the dashboard server, not a cron job or launchd: it already
  holds the project list, the hosts, the launch records, the reporting
  channel, and the notification; the North Star asks launch stories to extend
  that one model.
- The due date is published by the cycle on trunk, not inferred locally from
  the last launch, so a cycle run by hand is respected and two readers agree.
- One automatic launch per due date per machine bounds spend; recovery from a
  failed automatic session is the developer's manual Start session, which the
  cycle's rerun rule makes safe.
- The host-spelled skill invocation reuses the spelling story launches use
  for each host's first input; find it in the hosts' first-input composition
  rather than adding a second spelling.

## Learnings

- Slice 1: a pending **Review after** date is one later than `reviewed`;
  earlier dates were due in that review. `readFeedbackReview` in
  `dashboard/src/feedbackReview.ts` returns `scheduled`, `absent`, or
  `invalid` with a reason, accepts the one block wherever it sits, and has no
  Node import, so slice 3's server check consumes it directly. Proof:
  `node --test tests/support/feedback-review.test.mjs` (in `npm test`), whose
  real-watch-list case asserts the writer's 1–7 day rule, not today's dates,
  because the cycle rewrites the block.
- Slice 2: `readFeedbackMaintenance()` in `dashboard/server/feedbackMaintenance.ts`
  returns `{enabled:false}` for no file and throws `FeedbackMaintenanceProblem`
  for a malformed one; slice 3 treats both as not authorized. The setting
  holds `host`, optional `model`, and Codex's optional `effort` for the ad hoc
  request; `feedbackMaintenanceRepository` in
  `dashboard/src/feedbackMaintenanceSetting.ts` names the project whose
  folder the session starts in. The interim text is `automaticStartNote` in
  `dashboard/src/FeedbackMaintenanceSettings.tsx` and one paragraph of
  `dashboard/FEEDBACK-MAINTENANCE.md` (G1). Proof:
  `dashboard/tests/system-settings-feedback-maintenance.spec.ts` and
  `dashboard/tests/boundary/feedback-maintenance-boundary.spec.ts`.

## Story obligations

### G1. Settings section says nothing starts automatically yet
Reported: slice 2 — "The section shows: \"Nothing starts automatically yet: this dashboard does not check when feedback maintenance is due.\" The text is in one constant, `automaticStartNote`, in `dashboard/src/FeedbackMaintenanceSettings.tsx`. `dashboard/FEEDBACK-MAINTENANCE.md` also has one paragraph starting **Nothing starts automatically yet.** Slice 3 must replace both."
Story clause: "When the cycle is due, the authorization is on, no feedback-maintenance session is open on this machine, and no automatic launch has served that due date, the dashboard starts one unattached session"
Disposition: interim until slices 3

## Concern evidence

Slice-plan refinement was not needed: each slice has one outcome and one proof
loop, slice 2's interim behavior is named with slice 3 as its replacement, and
slice 5 is the paid observation the story defers to the developer. No
remaining slice-specific concern was identified.
