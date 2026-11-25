---
id: SEED-433
status: active
planted: 2026-11-24
planted_during: Execution of SEED-432#finish-story-linked-ad-hoc-sessions (slice 3 overrun)
trigger_when: selected from the product backlog before SEED-432 resumes default-choice admission
scope: two stories
---

# SEED-433 — Run Dashboard launch tests on an installed project

<a id="run-dashboard-launch-tests-on-an-installed-project"></a>

### Run Dashboard launch tests on an installed project

**Identity:** SEED-433#run-dashboard-launch-tests-on-an-installed-project
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-433#run-dashboard-launch-tests-on-an-installed-project","dependencies":[{"supplier":{"identity":"SEED-433#compose-existing-sessions-directly","href":"seeds/SEED-433-run-dashboard-launch-tests-on-an-installed-project.md#compose-existing-sessions-directly"},"implementation":"Reuse the session state composition already delivered by Plan 817. At the dual-layout rollout, compose the remaining saved-session preconditions directly.","rationale":"Plan 817 migrated the consumers reached by the earlier catalog probe. Installing both native layouts reached additional Codex session preconditions. The developer included them in this story and required declarative state construction in each Given.","condition":"The Dashboard backend and E2E consumers that need only an existing session compose it as data on trunk, without launching.","state":"satisfied","resolution":{"revision":"db57040f8fbeb93cf8db44538d3ac4d2ec55e8da","path":".planning/seeds/SEED-433-run-dashboard-launch-tests-on-an-installed-project.md#compose-existing-sessions-directly","summary":"Plan 817 kept real launch behavior in launch cases and migrated existing-session setup to composed records and native listings. The installed-catalog probe passed 144 backend and 88 E2E cases. Full plain backend and E2E suites passed with one existing opt-in backend skip. The integrated tests attach to composed Claude sessions, raise session alerts, and navigate the sidebar without using Start as setup. Plan 816 carries the remaining genuine launch cases.\nCondition satisfied: The Dashboard backend and E2E consumers that need only an existing session compose it as data on trunk, without launching.\nAccepted integration: 83956b350a0cc72710cc16011486f6c908b3abf1 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/816-run-dashboard-launch-tests-on-an-installed-project/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"67ca40245db80e017f828f009f54e8eac999aff44517eec0c0bbae4135d769ab","plan":"2912e0402d0adfed417f12e92e607367038c379e42e8ca3950785fd1cbf93488"}}
```

**Goal:** A maintainer changing the Dashboard launch path gets backend and E2E
results from production-style launches on a test project with the distribution
installed and a matching bare origin. Then
[admitting every ad hoc start](SEED-432-finish-story-linked-ad-hoc-sessions.md#finish-story-linked-ad-hoc-sessions)
changes only the expectations that depend on its story.

**Developer decisions.**

- This work was extracted from SEED-432 as its own test-only story after
  SEED-432's slice 3 overran. It lands on trunk before SEED-432 resumes at
  default-choice admission.
- During execution the developer expanded this story to refuse an installed
  Dashboard execution launch before a Take can be published when Claude Code
  is missing.
- The developer brought the remaining 44 saved-session preconditions into
  this story. The Given declares and constructs the saved session, native
  state and relevant workspace facts directly at the test level.
- On 2026-11-24 the developer set two criteria. Tests use the distribution
  cohesively, not in diverging ways. Most cases stay fast, and slow behavior
  gets its own focused, fast tests. The developer accepted [the supplier story to compose existing sessions directly](https://github.com/terryyin/open-dough/blob/db57040f8fbeb93cf8db44538d3ac4d2ec55e8da/.planning/seeds/SEED-433-run-dashboard-launch-tests-on-an-installed-project.md#compose-existing-sessions-directly)
  landing first, followed by this story's launch-behavior consumers.

**Scope.**

- Every catalog project the harness creates has an installed Open Dough
  checkout and a matching bare origin. Reuse the run-wide prepared origin
  and check each new project once. Servers on the same fixture machine share
  its completed initialization.
- Update tests that observe launch acceptance, the native command or input,
  refusal, a launch record write, or the transition from Start to a session.
  Use the project's own published story for a real start. Use ad hoc work
  where the case needs native input or a record without a story workflow.
- Observe the reporting context that installation adds, the actual started
  workspace, and the installed start's refusal. Keep distinct observations
  about the shell, launch options, host verification, records and continuation.
- The test harness and its launch tests own the migration. The installed
  Dashboard execution launch also checks for Claude Code before publication.
  Reuse Plan 817's conventions to construct remaining saved-session
  preconditions through MakeMe and the native fixture. The existing
  installed start and kept-start journeys provide focused publication and
  recovery proof.

**Key examples.**

- On the installed project, an ad hoc instruction reaches the native host
  with the reporting context for its launch reference. The host opens in the
  project checkout and the launch record keeps the label.
- On a catalog origin with a Ready story, Start execution reaches the native
  host in the linked worktree with its established start. The card's
  placement follows the workflow's publication, and the session remains
  attached to its story.
- With a rough story queued on origin, Start refinement establishes its
  Preparing assignment and opens its workspace. The installed execution
  command refuses the same unprepared story.
- With Claude Code absent, the boundary answers the installed start's
  refusal and keeps no launch record. The Ready story stays on the Backlog
  and the bare origin's trunk remains at its original revision.

## Shared context

Plan 817 landed the session-composition prerequisite. [Plan
816](../slice-plans/816-run-dashboard-launch-tests-on-an-installed-project/PLAN.md#preparation-evidence)
records the post-supplier probe and its launch consumer results. The
2026-11-24 pre-supplier probe covered 37 failing backend and 58 failing E2E
spec files from the earlier scope. Its setup, logs and the SEED-432 attempt
4 patch remain in the common Git directory under
`open-dough/evidence/SEED-433-installed-catalog-probe`.

**Cost of the installed project (2026-11-24, `cde557acd`).** A temporary timing
spec ran under the backend runner, four rounds at load about 12 on 16 cores.
In milliseconds:

| Operation | Plain folder | Installed project |
| --- | --- | --- |
| Make the catalog project for one server (after the first round) | none | 110–160 |
| Start the server | 440–580 | 370–430 |
| Ad hoc launch | 190–330 | 270–340 |
| Execution launch | 330–470 | 1,830–2,100, through the real start, which Takes the story |

The installed catalog adds a small setup cost in this sample. A story launch
through the real start added about 1.5 s. SEED-432 introduces a story
publication to ad hoc admission.
