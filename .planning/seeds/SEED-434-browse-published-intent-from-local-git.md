---
id: SEED-434
status: active
planted: 2026-11-25
planted_during: Split of SEED-430 into independently verifiable published reads
trigger_when: selected after the Board shares a verified local Git observation
scope: one story
---

# SEED-434 — Browse published Intent and attribution from local Git

<a id="browse-published-intent-from-local-git"></a>

### Browse published Intent and attribution from local Git

**Identity:** SEED-434#browse-published-intent-from-local-git
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-434#browse-published-intent-from-local-git","dependencies":[{"supplier":{"identity":"SEED-430#read-published-project-data-from-local-git","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git"},"implementation":"Board-opening test fixtures that publish through real routed Git origins","rationale":"The Board's Git read can only be proved where the suites hold a real origin at the answered revision; switching it first would break every Board open in the suites.","condition":"SEED-430#read-published-project-data-from-local-git has landed on origin/main: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.","state":"satisfied","resolution":{"revision":"1e2edf48ff3abdb521ad2bef8828b47dafa80eef","path":".planning/seeds/SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git","summary":"Origin main accepted f05e15351e85617fab1bf8fa97b8f7f6c0eb7568. At the before-cleanup revision, plan 819 slices 1-4 are done: publishCommittedOrigin routes its origin through every dashboard HOME its fake GitHub serves and keeps the origin's main at the answered revision; publishes() without a revision commits a real origin that serving by name routes, with a republication replacing only its own earlier route; the default answer commits a real origin linked for the seeded projects; answer wrappers keep their origin. committed-origin-actions.spec.ts checks ls-remote under the dashboard HOME, and both full suites passed on each slice. Intent Coverage at 4baf31b4f found the republication path missing from maintained checks; plan 824 slice 6 owns that proof.\nCondition satisfied: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.\nCondition satisfied: SEED-430#read-published-project-data-from-local-git has landed on origin/main: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.\nAccepted integration: f05e15351e85617fab1bf8fa97b8f7f6c0eb7568 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-430#follow-published-progress-from-local-git","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#follow-published-progress-from-local-git"},"implementation":"The shared verified project refresh and pinned Git reads in the Dashboard Review repository","rationale":"Intent must share the Board’s admitted revision and the verified local objects for that revision. A separate resolver could show divergent published pins in the same view.","condition":"SEED-430#follow-published-progress-from-local-git has landed on origin/main. Board and Review use one bounded project refresh that publishes locally readable trunk and watched branch revisions and can require a new check within the caller’s wait bound.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer can browse Intent at a published revision and inspect
the history behind its source and agent assignment using the same local
project history as the Board.

**Scope to refine.** Read Intent location configuration, selected files,
directory and recursive tree listings, and proof optimization candidates
from the Review repository. Move published path history and the attribution
of a current agent allocation to local Git. Preserve the adding commit,
name, and date and look up GitHub account and avatar facts at that exact
commit. Keep admitted pins, path reachability, and missing and unreadable
outcomes distinct.

**Evaluation.** From a confirmed published view, open Intent, browse the
selected tree, open a source file, and check candidate and allocation
evidence. Verify the exact paths and commits with zero GitHub API calls or
remote Git operations for the Git data. Verify provider enrichment separately.
Capture cold and warm counts and timings for the migrated entry points.

**Source.** Split from [SEED-430](SEED-430-read-published-project-data-from-local-git.md).
Begin with [Intent locations](../../dashboard/server/intentLocationsRead.ts),
[candidates](../../dashboard/server/intentCandidatesRead.ts),
[path commit time](../../dashboard/server/ghCommitTime.ts),
[profile addition](../../dashboard/server/ghProfileAddition.ts), and
[attribution](../../dashboard/server/additionRead.ts).
Project Intent's whole-project tree and file reads already come from the
Review repository through
[projectBrowseRead.ts](../../dashboard/server/projectBrowseRead.ts); start
from it. What remains is the story-scope generic `file-at` read, locations,
candidates, path history and attribution. The zero-GitHub-call evaluation can
reuse the `noteProjectFileReads` request count in
[intentCodeBrowsePage.ts](../../dashboard/test-support/intentCodeBrowsePage.ts).
