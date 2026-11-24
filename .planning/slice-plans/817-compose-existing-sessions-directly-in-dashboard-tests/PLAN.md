# Compose existing sessions directly in Dashboard tests

**Identity:** SEED-433#compose-existing-sessions-directly
**Source:** [Compose existing sessions directly in Dashboard tests](../../seeds/SEED-433-run-dashboard-launch-tests-on-an-installed-project.md#compose-existing-sessions-directly)

## Goal and scope

Backend and E2E consumers whose observation starts after a session exists
stop launching through the launch endpoint or the card's Start. They compose
the session as data: a launch record from `makeMe.aLaunchRecord` kept in the
machine launch store, and the native listing row the fake `claude` reads.
Each consumer keeps its observation. Production code is unchanged. Then
[the installed-project story](../../seeds/SEED-433-run-dashboard-launch-tests-on-an-installed-project.md#run-dashboard-launch-tests-on-an-installed-project)
(plan 816) moves only launch-behavior consumers.

Key examples, from the seed: `agent-terminal-boundary` attaches to a composed
session; `session-alerts` raises one notification per reading of a composed
session that needs the developer; the E2E `sessions-sidebar-navigation-cases`
journeys navigate composed sessions without pressing Start; and these
consumers pass unchanged on the scratch installed catalog project.

Excluded, and left to plan 816's slice 5: consumers whose observation is the
launch, its attempt or its record write. The baseline names
`launches/agent-launch-records`, `-records-replaced` and `-change-wait`
(backend), and the E2E `terminals/agent-terminal`, whose promise is that a
session launched from the page opens in its terminal. Codex and Cursor
launches that did not fail in the baseline stay as they are.

## Current decisions

- Follow the North Star topic
  [make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support).
  Add no support module or wrapper. `launched()` in
  `dashboard/test-support/agentTerminalBoundary.ts` already hands about 30
  consumers and five page-object modules their session. Rewrite its body to
  compose instead of launch, which shrinks it, and rename it for what it
  answers. Keep its signature (source, identity, title, workflow). Missing
  record facts become MakeMe builder steps in `Distribution/tests/support/`.
- Compose with existing owners: `server.claudeListsSession` (listing row),
  `makeMe.aLaunchRecord.ofWorkflow(...).inClaudeSession({ sessionId })`, and
  `keepMoreLaunchRecordsBesideServer`, which writes under the running
  server's store lock.
- Classify every launch site before changing it. If the launch is a
  precondition, compose the session. If the launch is under test, the
  consumer stays a launch consumer and goes to plan 816. Where one spec
  needs the same composed session in several cases, compose it once in that
  spec's setup. Never repeat an identical block across cases. Spec files
  stay at or under 250 lines. Several in scope are at 241–250 already.
- In E2E, the session is composed on the page's dashboard server before the
  step that needs it. The page opens it through its card or sidebar entry
  using the existing page objects, as
  `e2e/navigation/side-panel-terminal-continuity.spec.ts` does. Add any
  missing step to a page object, never to a spec-shared helper.
- Execute in Story Branch Mode from the established worktree. Publish each
  green slice to `codex/compose-existing-sessions-directly-in-dashboard` and
  integrate at wrap-up. Plan 816's recorded dependency waits for this story
  on `main`.

## Execution context

- Worktree `.worktrees/compose-existing-sessions-directly-in-dashboard` under
  the Open Dough integration checkout. Publisher
  `dashboard-territory.local-open-dough`, agent Kirara-chan.
- The Take at `aa4e0a66dd03322376bc220bd36ed27c54b6a44d` was accepted on
  `origin/main` and started the remote story branch. The starting revision
  was `d9c75458f9a8286eccf7c5b6d0fd8ceca4eb8991`.
- Codex observer for GitHub Actions `ci.yml` on the story branch:
  coordinator `kirara-seed433`, mailbox `/tmp/dough-ci-501/watch-ce97an`,
  PID `87152`, shell session `95690`, cell `g190:7`.

## Decisive premises and baseline

| Consuming operation | Observation | Result |
| --- | --- | --- |
| A composed Claude session attaches at the terminal boundary (slice 1) | At `856b3a0fd`, 24 November 2026, load about 8 on 16 cores, Node 24.21.0: a scratch `beforeAll` in `agent-terminal-boundary.spec.ts` composed the session with `claudeListsSession` and `keepMoreLaunchRecords`, then ran `OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD=… env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:backend -- dashboard/backend-tests/terminals/agent-terminal-boundary.spec.ts` | 16 of 16 passed. The attach `cwd` was the project checkout. Reverted |
| Composing inside `launched()` moves its callers (slice 1) | Same revision. A scratch `launched()` composed the record and the listing, then the same command ran all 27 backend specs that call `launched(` | 107 passed, 7 failed, 10 skipped (serial). Six of the failures are one missing fact: the record's session name lacks the launch's `Open Dough · Execution · ` prefix. With the name set, the five Done specs passed 16 of 16. The other failure, `agent-launch-sessions-history.spec.ts:95`, reads `launch-attempts.json`, which only a real launch writes |
| The same `launched()` serves the E2E callers (slice 1) | Same revision and scratch, `npm run --silent test:e2e --` over the 24 E2E specs using `launched(`, `sessionNavigationJourney`, `terminalPastePage` or `terminalVoicePage` | Two failed: `sessions-sidebar.spec.ts:65` (`toHaveText`), and `agent-terminal-touch.spec.ts:66`, where the chosen entry was a Doughnut story instead of the expected Pygardon one and a recorded list had 0 of 4 entries. Scratch reverted, test results removed |
| A composed session opens in the page's terminal from the Board (slices 4–7) | `e2e/navigation/side-panel-terminal-continuity.spec.ts` composes with `claudeListsSession` and `keepLaunchRecords` and attaches from the Board. It passed in the installed-catalog baseline run at `cde557acd` (it is not in the failing set) | Settled for the E2E profile. No later commit touches the composition path |
| The in-scope set fails with an installed catalog project and does not without it | [Seed baseline](../../seeds/SEED-433-run-dashboard-launch-tests-on-an-installed-project.md#shared-context), `cde557acd`, logs and wiring under the common Git directory at `open-dough/evidence/SEED-433-installed-catalog-probe` | Failing files listed per slice below. They are the discriminating proof for each slice: rerun them with the scratch wiring applied, then revert |

Scratch installed wiring, for every slice's discriminating run: apply
`attempt-4.patch` from that evidence directory, and add the one line that
`wiring.md` there names to `dashboard/test-support/support/dashboardServer.ts`.
Run, then revert both before any commit.
For cases sharing one machine between concurrent server starts, also use
`slice1-scratch-catalog-lock.patch` from the execution evidence directory.
This covers the reproduced bare-origin initialization race in the probe.

## Slices

Each slice runs the
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
with `--term launched --term launch( --term claudeScenario`. Run its files
plainly, then again with the scratch installed wiring, and revert the wiring.
Run Dashboard typecheck and lint.

### 1. Hand out composed sessions where `launched()` answered a launched one
Type: Behavior
Status: done
Proof: Every spec that calls `launched(` or uses a page object that does
passes plainly, and its in-scope files pass with the scratch wiring.
Among the backend files are `agent-terminal-boundary`,
`agent-terminal-reopen`, `agent-terminal-done-codex-boundary`,
`session-attachment-boundary`, the
`agent-launch-done*` family, `agent-launch-delete`,
`agent-launch-sessions-encoding`, `-sessions-history` and
`launch-history-removed`. Among the E2E files are `sessions-sidebar`,
`-host-status`, `-reading`, `-touch`, `-navigation-cases`,
`session-column-membership` and the `agent-terminal-touch*` specs.
`server.claudeLaunchCalls()` stays empty for the composed sessions.

Slice 1 proof: plain and installed backend passed 119 and 118 cases. Plain
and installed E2E passed 47 and 41. See `slice1-return.md` in execution
evidence for the retained commands, observations and exclusions. The
mounted-boundary launch wait and the second sidebar-reading case remain
launch consumers for plan 816. Terminal delete's Start moves in slice 5.

A consumer asks for an existing session → it gets a listed, recorded
session without a launch, named as the launch names it. Add the MakeMe step
that gives the record the launch's session name. Repair the three known
gaps: the sessions-history case composes its attempt through existing
attempt builders, or moves to plan 816 if the attempt is its subject; the
sidebar and touch orders state their sessions' start times. Launch sites
that `launched()` callers still need for a launch use `launch(...)` there.

### 2. Compose sessions for backend listing, history and retention reads
Type: Behavior
Status: planned
Proof: `agent-launch-session-listing`, `-retention-scope`,
`launch-history-aged-out` and `agent-launch-codex-observation-status` pass
plainly and with the scratch wiring.

A machine store and listing hold the Claude sessions each case reads →
listing, history, retention and the observation status answer as today.
The direct Claude `launch(...)` and `distinctStoryRequest` sites that are
preconditions move to composition, with each record's age stated through
`launchedAt` or `markedDoneAt`. Codex launches stay. Their cases passed in
the installed baseline, which failed only Claude cases.

### 3. Raise alerts for composed sessions
Type: Behavior
Status: planned
Proof: `session-alerts`, `-activation`, `-delivery`, `-input-continuity` and
`-refused` pass plainly and with the scratch wiring. `session-alerts` still
raises exactly one notification per reading that needs the developer.

A composed session not marked done enters a reading other than Working →
the server raises one notification, not repeated after restart. Classify
the "launched after the server started" case: the session appears in the
listing after start, which composition states without a launch.

### 4. Show composed sessions on cards and in Recently done in E2E
Type: Behavior
Status: planned
Proof: `agent-launch-held-revision-after-action`, `-recent-delete`,
`-recent-delete-unavailable`, `-recent-sessions`, `-session-state-pace`,
`-story-card-done` and `-story-card-sessions` pass plainly and with the
scratch wiring.

Composed sessions of the journey's stories → cards list them beside their
Start actions, Recently done retains the closed ones, and Mark as done,
Delete record and state pace act as today, without pressing Start. Replace
the board's `launch(...)` steps where the session is a precondition.

### 5. Act on composed sessions from the terminal and on retired workspaces in E2E
Type: Behavior
Status: planned
Proof: `agent-terminal-delete`, `-done`, `-done-pending`, `-done-reopen`,
`session-workspace-retirement-claude`, `-claude-done` and `-cursor` pass
plainly and with the scratch wiring.

A composed session opened in the page's terminal, or a composed record whose
workspace is retired → Done, Delete record, reopen and the retired-workspace
handling read as today.

### 6. Alert and toggle the sidebar over composed sessions in E2E
Type: Behavior
Status: planned
Proof: `session-alerts`, `-alerts-navigation`, `-alerts-unavailable`,
`sessions-sidebar-keyboard`, `-stays-as-left` and `-navigation` pass
plainly and with the scratch wiring.

Composed sessions needing the developer → the page's alerts, their
navigation and the sidebar's keyboard and persistence behave as today.

### 7. Drive the desktop terminal and voice over composed sessions in E2E
Type: Behavior
Status: planned
Proof: `agent-terminal-close-shortcut`, `-keyboard`, `-lifetime`,
`-maximize`, `-submit-and-close`, `session-terminal-voice-lifecycle` and
`-recovery` pass plainly and with the scratch wiring. Then the full backend
and E2E suites pass plainly, run as
`caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:backend`
with `OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD` set, and the same for
`test:e2e`. With the scratch wiring, no in-scope file fails. Record any
remaining failing consumer here as a launch consumer for plan 816.

A composed session opened in the page's one terminal → close, keyboard,
lifetime across a project switch and server restart, maximize, submit and
voice behave as today. Full suites are the local gate for this slice
because slice 1 changed a helper that many consumers and page objects share.

## Concern evidence

Refinement was not needed. Each slice owns one surface and its consumers,
and slice 1 carries the one shared seam. Scratch runs settled the seam's
reach. Slices 2–7 apply one rule: compose when the launch is a
precondition. The open question is how many E2E files are launch consumers
after all. Execution answers it by moving those files to plan 816, so it
does not affect this plan's sizing.

## Story obligations

### G1. The terminal delete journey still starts a session on the board
Reported: slice 1 — "The E2E terminal delete case keeps its direct Start precondition for this file's plan 817 receiving slice 5."
Story clause: "Consumers whose observation starts after a session exists stop launching through the launch endpoint or Start."
Disposition: receiving slice 5

## Verification and delivery

- Local gate: use the maintained [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  with `caffeinate -s -i` on AC power for slice 7's full runs. Keep the
  default timeout and apply the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Run slice files with
  `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:backend -- <files>`
  or `… npm run --silent test:e2e -- <files>`. When a slice changes
  `Distribution/tests/support/` builders, run `scripts/test.sh` on the
  MakeMe support tests it touches.
