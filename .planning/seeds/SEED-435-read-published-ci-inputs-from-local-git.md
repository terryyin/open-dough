---
id: SEED-435
status: active
planted: 2026-11-25
planted_during: Split of SEED-430 into independently verifiable published reads
trigger_when: selected after the Board shares a verified local Git observation
scope: one story
---

# SEED-435 — Read published Git inputs to CI from local Git

<a id="read-published-ci-inputs-from-local-git"></a>

### Read published Git inputs to CI from local Git

**Identity:** SEED-435#read-published-ci-inputs-from-local-git
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-435#read-published-ci-inputs-from-local-git","dependencies":[{"supplier":{"identity":"SEED-430#read-published-project-data-from-local-git","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git"},"implementation":"Board-opening test fixtures that publish through real routed Git origins","rationale":"The Board's Git read can only be proved where the suites hold a real origin at the answered revision; switching it first would break every Board open in the suites.","condition":"SEED-430#read-published-project-data-from-local-git has landed on origin/main: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.","state":"satisfied","resolution":{"revision":"1e2edf48ff3abdb521ad2bef8828b47dafa80eef","path":".planning/seeds/SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git","summary":"Origin main accepted f05e15351e85617fab1bf8fa97b8f7f6c0eb7568. At the before-cleanup revision, plan 819 slices 1-4 are done: publishCommittedOrigin routes its origin through every dashboard HOME its fake GitHub serves and keeps the origin's main at the answered revision; publishes() without a revision commits a real origin that serving by name routes, with a republication replacing only its own earlier route; the default answer commits a real origin linked for the seeded projects; answer wrappers keep their origin. committed-origin-actions.spec.ts checks ls-remote under the dashboard HOME, and both full suites passed on each slice. Intent Coverage at 4baf31b4f found the republication path missing from maintained checks; plan 824 slice 6 owns that proof.\nCondition satisfied: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.\nCondition satisfied: SEED-430#read-published-project-data-from-local-git has landed on origin/main: committed origins, publishes() and the default answer publish through real routed origins whose main holds the answered revision.\nAccepted integration: f05e15351e85617fab1bf8fa97b8f7f6c0eb7568 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-430#follow-published-progress-from-local-git","href":"seeds/SEED-430-read-published-project-data-from-local-git.md#follow-published-progress-from-local-git"},"implementation":"The shared verified project refresh and pinned Git reads in the Dashboard Review repository","rationale":"CI display and pre-launch judgment need the same published branch evidence as the Board. A separate CI fetch cannot provide the shared observation or its freshness guarantees.","condition":"SEED-430#follow-published-progress-from-local-git has landed on origin/main. Board and Review use one bounded project refresh that publishes locally readable trunk and watched branch revisions and can require a new check within the caller’s wait bound.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer inspecting CI or starting work can see a judgment for
the published revision the Dashboard verified. Published Git evidence is
readable with the execution checkout absent or behind.

**Scope to refine.** Replace the GitHub branch-history read used by CI
status and launch judgment and the Taken branch lookup and fetch used by
CI comparisons. Read first-parent history, commit subjects, and landing
order from the Review repository where it holds the recorded revisions.
Keep the existing CI providers for runs, jobs, artifacts, and adapter
discovery. Preserve the freshness requirement for launch judgment, the
exact-run rules, and the difference between a missing run and unavailable
evidence. Local configuration, adapter execution, and actual launch actions
retain their existing requirements.

**Evaluation.** Compare CI status, Taken evidence, and retained landing
history against their exact published revisions. When a launch needs a
fresh Git check, make origin unavailable after a previously successful
judgment and observe that the cached evidence cannot establish a fresh
result. Verify the published Git inputs make no separate provider history
lookup or execution-checkout fetch.

**Source.** Split from [SEED-430](SEED-430-read-published-project-data-from-local-git.md).
Begin with [branch history](../../dashboard/server/baseCiGitHubReads.ts),
[CI judgment](../../dashboard/server/baseCiJudgment.ts),
[Taken endpoints](../../dashboard/server/takenStoryEndpoints.ts),
[revision history](../../dashboard/server/baseCiRevisionGit.ts), and
[landing order](../../dashboard/server/intentCiHistoryRead.ts).
