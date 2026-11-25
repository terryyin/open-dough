---
id: SEED-436
status: active
planted: 2026-11-25
planted_during: Split of SEED-430 into independently verifiable published reads
trigger_when: selected after the Board shares a verified local Git observation
scope: one story
---

# SEED-436 — Check the feedback maintenance watch list from local Git

<a id="check-feedback-maintenance-from-local-git"></a>

### Check the feedback maintenance watch list from local Git

**Identity:** SEED-436#check-feedback-maintenance-from-local-git
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-436#check-feedback-maintenance-from-local-git","dependencies":[{"supplier":{"identity":"SEED-430#read-published-project-data-from-local-git","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git"},"implementation":"Board-opening test fixtures that publish through real routed Git origins","rationale":"The Board's Git read can only be proved where the suites hold a real origin at the answered revision; switching it first would break every Board open in the suites.","condition":"SEED-430#read-published-project-data-from-local-git has landed on origin/main: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.","state":"waiting"},{"supplier":{"identity":"SEED-430#follow-published-progress-from-local-git","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#follow-published-progress-from-local-git"},"implementation":"The shared verified project refresh and pinned Git reads in the Dashboard Review repository","rationale":"The scheduled launch must consume an observation verified after its fresh demand. A separate watch-list refresh would reintroduce a competing freshness boundary.","condition":"SEED-430#follow-published-progress-from-local-git has landed on origin/main. Board and Review use one bounded project refresh that publishes locally readable trunk and watched branch revisions and can require a new check within the caller’s wait bound.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A maintainer who has enabled scheduled feedback maintenance gets a
launch decision based on the watch list at a freshly confirmed trunk revision.

**Scope to refine.** Have the existing authorized maintenance check request
fresh trunk evidence through the project refresh and read the watch list
from that pinned local tree. Preserve the bounds, enabled setting, due
decision, and single-launch admission. Keep an unavailable watch list or
failed fresh check from supplying launch authority.

**Evaluation.** With maintenance enabled and due, publish an updated watch
list, run the check, and observe the due decision for that revision. With a
warm Dashboard and unavailable origin, the same check leaves the launch
unadmitted. Observe the shared Git check and zero separate Contents or Refs
requests for the watch list.

**Source.** Split from [SEED-430](SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git).
Begin with [scheduled maintenance](../../dashboard/server/feedbackMaintenanceCheck.ts).
