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
{"schemaVersion":1,"identity":"SEED-433#run-dashboard-launch-tests-on-an-installed-project","dependencies":[{"supplier":{"identity":"SEED-433#compose-existing-sessions-directly","href":"seeds/SEED-433-run-dashboard-launch-tests-on-an-installed-project.md#compose-existing-sessions-directly"},"implementation":"Install every catalog project and update only the launch-behavior consumers, relying on the session consumers already composing their sessions as data.","rationale":"Installing every catalog project makes story launches run the real start. At cde557acd that failed about 95 spec files, roughly two thirds of them consumers that launch only to obtain a session. The developer chose to move those consumers first, so this story stays within its launch-behavior consumers and keeps every catalog project installed with no opt-out.","condition":"The Dashboard backend and E2E consumers that need only an existing session compose it as data on trunk, without launching.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/816-run-dashboard-launch-tests-on-an-installed-project/PLAN.md","assessment":"not-ready","reasons":["Slice 3: the real start's workspace may change E2E card observations beyond the launch. The baseline left 24 E2E files' toHaveCount/toBeEnabled failures unattributed, so slice 3's sizing is unsettled until they are attributed against the supplier's result.","Slice 5: the remaining consumer set is known only after the supplier story lands. Rerun the scratch full suites on that trunk, then refine slices 3–5 from the failures."],"basis":{"document":"d639f1bdb1fc3e1e7f290b0388c29340f82a6ee906e4b63beb8ce436bbd6d964","plan":"9e1ceaf14f8ae2377f2c516b972b62deec0915a64b12ce43db3e7a3f15fe7375"}}
```

**Goal:** A maintainer changing the Dashboard launch path gets backend and E2E
results from launch tests that use the distribution the way production
launches do: an installed project with a matching bare origin. Then
[admitting every ad hoc start](SEED-432-finish-story-linked-ad-hoc-sessions.md#finish-story-linked-ad-hoc-sessions)
changes only the expectations that depend on its story.

**Developer decisions.**

- This work was extracted from SEED-432 as its own test-only story after
  SEED-432's slice 3 overran. It lands on trunk before SEED-432 resumes at
  default-choice admission.
- On 2026-11-24 the developer set two criteria. Tests use the distribution
  cohesively, not in diverging ways. Most cases stay fast, and slow behavior
  gets its own focused, fast tests. The developer accepted the recommended
  split: [compose existing sessions directly](#compose-existing-sessions-directly)
  lands first, and this story then moves only the launch-behavior consumers.

**Scope.**

- Every catalog project the test harness creates (in
  `dashboard/test-support/support/fakeClaude.ts`) is an installed Open Dough
  project. Its bare `origin` has a matching `main`. Reuse the run-wide
  prepared start origin in `startOriginPreparation.ts`, not a per-test
  install, and check readiness once in shared support. No consumer opts out.
- The consumers whose promise is about launching are those that assert the
  launch request, native command line, instruction, refusal or launch
  record. They launch stories queued on their origin through a MakeMe
  repository description, or they launch ad hoc work.
- Update the expectations that installation changes:
  - instructions gain the Dashboard reporting context;
  - story launches run the real installed start and open in its workspace;
  - the refusal for a missing `claude` becomes the start's refusal.
- Keep each consumer's distinct observation. Production behavior does not
  change.
- The existing real-start specs, such as `agent-launch-preparation-start` and
  the kept-start journeys, stay the focused proof of the real start. A
  launch-behavior consumer that needs no started workspace launches ad hoc
  work rather than paying for a story start.
- Not in scope: consumers that launch only to obtain a session. The
  supplier story moves them.

**Key examples.**

- `agent-launch-ad-hoc-boundary` launches on the installed project and observes
  the instruction with its reporting context.
- `agent-launch-environment` launches a story queued on its origin and keeps
  its developer-shell environment observation.
- `agent-launch-boundary` without Claude Code answers the start's refusal and
  keeps no record.
- The ad hoc problems, Codex and Cursor E2E pass unchanged on the installed
  project.

**Evidence.** SEED-432's fourth slice 3 attempt wired installation into the
harness. It is parked privately as `slice-3/attempt-4.patch` in SEED-432's
execution evidence, and
[plan 813](../slice-plans/813-finish-story-linked-ad-hoc-sessions/PLAN.md) on
its story branch records the finding.

<a id="compose-existing-sessions-directly"></a>

### Compose existing sessions directly in Dashboard tests

**Identity:** SEED-433#compose-existing-sessions-directly
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/817-compose-existing-sessions-directly-in-dashboard-tests/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"6822fe38f47fc656bb16126e4873f8f08d514060ab01838dea5fd67f2c17b416","plan":"2195e556bd6905f33944aa9784368a6b7069e85c1b8e76dab09d750cf72badba"}}
```

**Goal:** A maintainer gets fast backend and E2E feedback on what the Dashboard
does with an existing session. Those tests compose the session as data
instead of launching one, so neither the installed project nor SEED-432's
admission slows them or changes what they observe.

**Scope.**

- Consumers whose observation starts after a session exists stop launching
  through the launch endpoint or Start. Examples are sessions, terminals,
  alerts, Done, delete, history and sidebar journeys. Each composes the
  launch record through `makeMe.aLaunchRecord` in the launch store
  (`dashboard/test-support/support/launchStore.ts`), together with the native
  listing the fake host reads.
- Keep each consumer's observation unchanged. A consumer whose observation
  depends on the launch itself stays a launch consumer for
  [the installed-project story](#run-dashboard-launch-tests-on-an-installed-project).
- Add no wrapper to test support. Extend MakeMe builder steps where a composed
  session needs a fact the builders lack.
- Production behavior does not change.

**Key examples.**

- `agent-terminal-boundary` attaches to a composed Claude session and passes
  output, input and size as it does today.
- `session-alerts` raises one notification for each reading of a composed
  session that needs the developer.
- The E2E `sessions-sidebar-navigation-cases` journeys navigate composed
  sessions without pressing Start.
- With the scratch installed catalog project from the baseline below, these
  consumers pass unchanged.

## Shared context

**Preparation baseline (2026-11-24, `cde557acd`).** Trunk has had 23 commits on
the Dashboard server, test support and spec paths since attempt 4. Attempt 4's
patch omits its server wiring, so preparation reapplied it with every catalog
project installed through `startDashboardServer`. Full local runs then failed
53 backend cases in 37 Playwright spec files (the Vitest part passed) and 109
E2E cases in 58 spec files. By spec file:

- Story launches refused with "The story is not queued in Backlog on origin":
  15 backend and 11 E2E files. Most of the 16 other backend files fail
  because a launch like these is refused and no session follows.
- Ad hoc instructions that gain the reporting context: 3 backend and 9 E2E
  files.
- The not-installed refusal becoming `start-refused`: 1 backend file.
- Card and session observations (`toHaveCount`, `toBeEnabled`): 24 E2E files.
  Together with 14 other E2E files, preparation did not attribute their
  cause.

Consumers launch arbitrary story identities, such as
`SEED-052#launch-claude-planned-execution`, so seeding them changes each
consumer's origin description. Once seeded, the real start Takes the story,
which changes its workspace and handoff. None of the consumers has observed
that change yet. Logs and the wiring are kept privately in the repository's common Git
directory, under `open-dough/evidence/SEED-433-installed-catalog-probe`.

**Cost of the installed project (2026-11-24, `cde557acd`).** A temporary timing
spec ran under the backend runner, four rounds at load about 12 on 16 cores.
In milliseconds:

| Operation | Plain folder | Installed project |
| --- | --- | --- |
| Make the catalog project for one server (after the first round) | none | 110–160 |
| Start the server | 440–580 | 370–430 |
| Ad hoc launch | 190–330 | 270–340 |
| Execution launch | 330–470 | 1,830–2,100, through the real start, which Takes the story |

Installing the catalog project and launching ad hoc work cost almost nothing.
A story launch through the real start adds about 1.5 s and changes what the
test observes. After SEED-432 admits ad hoc starts, ad hoc launches also
publish a story, so they will pay a similar cost.
