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
{"schemaVersion":1,"identity":"SEED-436#check-feedback-maintenance-from-local-git","dependencies":[{"supplier":{"identity":"SEED-430#read-published-project-data-from-local-git","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git"},"implementation":"Board-opening test fixtures that publish through real routed Git origins","rationale":"The Board's Git read can only be proved where the suites hold a real origin at the answered revision; switching it first would break every Board open in the suites.","condition":"SEED-430#read-published-project-data-from-local-git has landed on origin/main: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.","state":"satisfied","resolution":{"revision":"1e2edf48ff3abdb521ad2bef8828b47dafa80eef","path":".planning/seeds/SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git","summary":"Origin main accepted f05e15351e85617fab1bf8fa97b8f7f6c0eb7568. At the before-cleanup revision, plan 819 slices 1-4 are done: publishCommittedOrigin routes its origin through every dashboard HOME its fake GitHub serves and keeps the origin's main at the answered revision; publishes() without a revision commits a real origin that serving by name routes, with a republication replacing only its own earlier route; the default answer commits a real origin linked for the seeded projects; answer wrappers keep their origin. committed-origin-actions.spec.ts checks ls-remote under the dashboard HOME, and both full suites passed on each slice. Intent Coverage at 4baf31b4f found the republication path missing from maintained checks; plan 824 slice 6 owns that proof.\nCondition satisfied: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.\nCondition satisfied: SEED-430#read-published-project-data-from-local-git has landed on origin/main: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.\nAccepted integration: f05e15351e85617fab1bf8fa97b8f7f6c0eb7568 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-430#follow-published-progress-from-local-git","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#follow-published-progress-from-local-git"},"implementation":"The shared verified project refresh over trunk and watched branches","rationale":"The scheduled launch must consume an observation verified after its fresh demand. A separate watch-list refresh would reintroduce a competing freshness boundary.","condition":"SEED-430#follow-published-progress-from-local-git has landed on origin/main: the Board's verified check publishes locally readable trunk and watched branch revisions and can require a new check within the caller's wait bound.","state":"satisfied","resolution":{"revision":"00f50db1827d870ecd899ba2e3cde097f7c38300","path":".planning/seeds/SEED-430-read-published-project-data-from-local-git.md#follow-published-progress-from-local-git","summary":"Plan 823 slices 8–10 and obligations G1–G2 verify that the Board checks trunk and the authorized watched heads in Git, validates that the objects are locally readable, and publishes those heads and time in one durable confirmation. The real HTTP and stream boundary verifies fresh demand receives the next eligible check within its own wait bound. The real-origin deletion and race cases verify unavailable or unverified heads preserve the prior confirmation.\nCondition satisfied: SEED-430#follow-published-progress-from-local-git has landed on origin/main: the Board's verified check publishes locally readable trunk and watched branch revisions and can require a new check within the caller's wait bound.\nAccepted integration: 57d07d1a23d4ddef7b903aaae3e5f090ace90b11 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-430#read-board-records-at-published-pins","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#read-board-records-at-published-pins"},"implementation":"Pinned Git reads of published records at the verified revision","rationale":"The scheduled launch must consume an observation verified after its fresh demand. A separate watch-list refresh would reintroduce a competing freshness boundary.","condition":"SEED-430#read-board-records-at-published-pins has landed on origin/main: published records read locally at the admitted pin with zero GitHub API calls.","state":"waiting"},{"supplier":{"identity":"SEED-430#share-one-refresh-across-board-and-review","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#share-one-refresh-across-board-and-review"},"implementation":"One bounded project refresh shared by the Board and the Review repository","rationale":"The scheduled launch must consume an observation verified after its fresh demand. A separate watch-list refresh would reintroduce a competing freshness boundary.","condition":"SEED-430#share-one-refresh-across-board-and-review has landed on origin/main: Board and Review use one bounded project refresh.","state":"waiting"}]}
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

**Source.** Split from [SEED-430](SEED-430-read-published-project-data-from-local-git.md).
Begin with [scheduled maintenance](../../dashboard/server/feedbackMaintenanceCheck.ts).
