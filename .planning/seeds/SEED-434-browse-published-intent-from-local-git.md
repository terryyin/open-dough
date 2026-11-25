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
{"schemaVersion":1,"identity":"SEED-434#browse-published-intent-from-local-git","dependencies":[{"supplier":{"identity":"SEED-430#read-published-project-data-from-local-git","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git"},"implementation":"Board-opening test fixtures that publish through real routed Git origins","rationale":"The Board's Git read can only be proved where the suites hold a real origin at the answered revision; switching it first would break every Board open in the suites.","condition":"SEED-430#read-published-project-data-from-local-git has landed on origin/main: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.","state":"waiting"},{"supplier":{"identity":"SEED-430#follow-published-progress-from-local-git","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#follow-published-progress-from-local-git"},"implementation":"The shared verified project refresh and pinned Git reads in the Dashboard Review repository","rationale":"Intent must share the Board’s admitted revision and the verified local objects for that revision. A separate resolver could show divergent published pins in the same view.","condition":"SEED-430#follow-published-progress-from-local-git has landed on origin/main. Board and Review use one bounded project refresh that publishes locally readable trunk and watched branch revisions and can require a new check within the caller’s wait bound.","state":"waiting"}]}
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

**Source.** Split from [SEED-430](SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git).
Begin with [Intent locations](../../dashboard/server/intentLocationsRead.ts),
[candidates](../../dashboard/server/intentCandidatesRead.ts),
[path commit time](../../dashboard/server/ghCommitTime.ts),
[profile addition](../../dashboard/server/ghProfileAddition.ts), and
[attribution](../../dashboard/server/additionRead.ts).
