# Run Dashboard launch tests on an installed project

**Identity:** SEED-433#run-dashboard-launch-tests-on-an-installed-project
**Source:** [Run Dashboard launch tests on an installed project](../../seeds/SEED-433-run-dashboard-launch-tests-on-an-installed-project.md#run-dashboard-launch-tests-on-an-installed-project)

## Execution context

- Rio-chan, publisher `dashboard-territory.local-open-dough`, executes in
  the established linked checkout
  `/Users/terryyin/git/open-dough/.worktrees/run-dashboard-launch-tests-on-an-installed-proje`,
  branch `codex/run-dashboard-launch-tests-on-an-installed-proje`.
- Story Branch Mode publishes increments to that branch on `origin` and
  integrates the completed story on `origin/main`.
- Starting revision `6838003df3b88fb6f42e9dfe8bab6929e2838d07`.
  Claim `6e146d8ba709e5b3ca285238089ef95a9d618756` was accepted on
  `origin/main` and on the execution branch as its first published base.
- Slice 1 was accepted on the execution branch at
  `902165eaf1870b425a00934a229c7b49a0580810`.
- Slice 2 and the approved plan expansion were accepted at
  `344f64cb7e7fc7692f976015c6d905b81de1c919` on the execution branch.
- Slice 3 was accepted on the execution branch at
  `1c39c80dd843876b678fc965abbf1299d152a6db`.
- Slice 4 was accepted on the execution branch at
  `e98c81b6cd2153168dead084e5e1432a4f54112d`.
- Slice 5 was accepted on the execution branch at
  `e86c9fa362b2737602a88e9e6658af43763bcc75`.
- Slice 6 was accepted on the execution branch at
  `9cb22125f37e17265bc2465ed42505c159f496f4`.
- Slice 7 was accepted on the execution branch at
  `9e653e3870f6658ef228cdb766acc7ca309a55a1`.

## Goal and scope

Dashboard maintainers get backend and E2E launch results from installed Open
Dough test projects with matching bare origins. Launches keep their command,
refusal, record and visible-session observations. Fast cases use ad hoc work
when the observation is independent of a story. Existing real-start journeys
continue to prove publication, retry and kept work. SEED-432 can then change
the expectations its ad hoc admission reaches. The installed Dashboard
execution path also refuses missing Claude Code before publishing a Take.

The [session-composition prerequisite](https://github.com/terryyin/open-dough/blob/db57040f8fbeb93cf8db44538d3ac4d2ec55e8da/.planning/seeds/SEED-433-run-dashboard-launch-tests-on-an-installed-project.md#compose-existing-sessions-directly)
is satisfied. Consumers whose setup only needs an existing session use the
composed data from Plan 817. A case whose subject includes a newly written
launch record, acceptance or the transition from Start to a session keeps
that launch.

## Current decisions

- Use the existing run-wide origin preparation and `initializeStartOrigin`
  for catalog projects. Keep fixture routing aligned with the configured
  repository, including Doughnut's `nerds-odd-e/doughnut`. Preserve caller-owned
  installed origins and cases that intentionally omit local projects. Validate a
  fixture-created project's installed skill, bare origin and matching
  `main` once at initialization. Concurrent starts on a shared machine wait
  for the same initialization. A failed initialization cannot leave a
  partly initialized project reusable as a ready project.
- Use MakeMe repository descriptions. Extend the prepared `queuedReadyRepository`
  base with later revisions for selected readiness, Taken entries, and installed
  file variants. Select the installation layout that owns the host's path
  under test. Keep host-specific files and runtime stand-ins distinct from
  the actual distribution installation. Leave the dedicated `startOrigin`
  and `preparationPage` cases on their existing private origins.
- For a case observing a real publication, have its page read the same
  fixture origin the workflow writes. Reuse `publishCommittedOrigin` with
  `follows` or an explicit advance at the observation's publication boundary.
  The workflow publishes the Take or Preparing assignment. The page reports
  the resulting placement and local session. This follows
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#observe-workflow-outcomes-without-owning-them).
- Use the installed start when a case observes an execution or refinement
  workflow. Stage successful execution with recorded Ready on origin. Keep a
  separate rough story for refinement and cases about eligibility. Keep
  distinct effects at their existing proof boundaries. Follow the North Star
  topics [test production directly](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows),
  and [unit tests and E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Reuse the existing fixture seam and page objects. Keep runner migration
  with SEED-413.
- Slices 1–8 select the installed fixture for the consumers they move.
  Slice 9 makes installation the default for every catalog project and
  removes the temporary selection. Each increment remains independently
  verifiable in the established Story Branch Mode.

## Preparation evidence

The post-supplier probe at `698cbd33` installed the shared queued Claude
origin in each catalog folder provisioned by `startDashboardServer`.
It reused caller-owned installations and serialized initialization for
servers on the same machine. The earlier Plan 817 probe reproduced an
`EACCES` when two servers initialized one project at the same time.

Both maintained suites ran to completion with four workers on macOS
on AC power, 25 November 2026, 06:42–07:10 +08, Node 24.21.0. Backend
recorded 1,923 passed, 47 skipped and 17 failed. Fifteen failures were
launch cases across 12 files, covered by slices 1, 2 and 4. Two were Review
timeouts. E2E recorded 739 passed and 40 failed. Thirty-nine launch
failures across 19 files are covered by slices 1 and 5–8. One was a
Review navigation test. The installed-catalog results replace the
pre-supplier failure inventory. The old timing sample in the seed still
explains the choice to keep the real start focused. Competing host work
during the full probe makes its elapsed times unsuitable for a cost baseline.

| Consuming operation | Result on the installed fixture |
| --- | --- |
| Ad hoc boundary with developer text | `agent-launch-ad-hoc-boundary` reached the native call in the project checkout and differed at the old exact instruction assertion by the reporting context and branch-entry block. |
| Backend story boundary and shell | With the original request seeded as Ready, `agent-launch-environment` passed. `agent-launch-boundary` reached the legacy checkout-scoped native command assertion. The no-Claude case answered `start-refused`. |
| Page Start on a queued story | The seeded story-card run observed execution refuse a rough story with “Preparation is not recorded”. Refinement opened in `.worktrees/story-c` with the established preparation. The Ready control reached native execution in the same worktree with the established start and reporting context. |
| Card placement after real publication | The seeded control kept the page fixture pinned and reached the session and focus assertions there. `agent-launch-start-phases`, which passed in the full probe, advances the page's displayed revision to the actual origin's accepted publication and observes the story in Taken. Slice 5 owns the corresponding final-state journeys. |
| Every fixture-created catalog folder | The scratch wiring exercised the server seam. The direct fake-host calls in the two terminal-close files rely on the same project-folder option and are explicit verification in slice 9. |

The common Git directory retains the scratch inputs, literal commands,
consumer trace, logs, and runner proof records under
`open-dough/evidence/SEED-433-post-supplier-698cbd33`. The full run locates
affected cases. Use the focused before-and-after checks to accept each
slice's preserved behavior.

## Slices

### 1. Launch ad hoc work on an installed catalog project

Type: Behavior
Status: done
Proof: Backend `agent-launch-ad-hoc-boundary` and E2E `agent-launch-ad-hoc*`,
`agent-launch-ad-hoc-terminal` and `responsive-session-recovery-ad-hoc`.
Observe independent native input, its launch-reference reporting context
and branch-entry block, the project checkout, and the stored label.
Keep the Pygardon, attachment, host and problem observations that these
cases cover.

When a launch consumer selects the installed catalog fixture, starting ad
hoc work sends the developer's text with the reporting context for that
launch and opens in the project checkout. Establish the one shared
initialization path through existing support and make the installed fixture
available to this slice's consumers. Pair the existing shared-machine
startup case with one origin and a usable post-initialization checkout.
Use the catalog project route for the matching origin and confirm the
launch's configuration through the regular HTTP boundary.

Accepted proof at the initial claim revision with the slice change applied:

- The strict backend runner passed 36 cases. In
  `agent-launch-ad-hoc-boundary.spec.ts`, the installed catalog supplies a
  checkout and the HTTP launch must deliver the developer text, reference and
  branch-entry command to Claude and keep the label. In
  `agent-launch-records-shared-machine.spec.ts` the two startup results
  expose one ready Doughnut checkout and its configured bare origin. The
  actual launch record is visible on production and after restart.
- The strict E2E runner passed 44 cases for the ad hoc journey and consumers
  of the shared native input observer. The page journeys retain Pygardon,
  attachment, host, problem and recovery observations. The one-case
  refactor check passed after selecting the Codex installation for
  `responsive-session-recovery-ad-hoc.spec.ts`.
- Dashboard typecheck passed. The focused post-clone failure probe verified
  cleanup and successful retry plus preservation of a caller-owned origin.
  The commands, selectors, observations and terminal records are retained
  under the checkout Git path `open-dough/evidence`, in
  `s1-implementation-report.md`, its linked run records and
  `s1-refactor-codex-recovery.log.run.json`.

### 2. Launch queued stories with their native command and refusal

Type: Behavior
Status: done
Proof: Backend `agent-launch-boundary`, `agent-launch-environment`,
`agent-launch-model-boundary`, `agent-launch-options-boundary` and
`agent-launch-options-groups`. Observe the installed receipt, workspace,
native command with the model, effort, arguments and instructions the case
already checks, and the launch record. The environment case still checks the
developer's shell. Slice 3 owns the missing-Claude behavior change.

A Ready queued story receives execution or a queued story receives
refinement over the normal boundary. Use the existing queued identities or
publish the request's own identity as a later revision. Stage an independent
eligible story or a fresh origin where a second launch would otherwise
depend on a prior Take or Preparing assignment. Keep explicit refusal
fixtures at their original boundary, including absent, invalid and
unreadable installed option definitions.

The five focused backend specs passed all 44 cases, and Dashboard typecheck
passed. The observations and command records are retained in
`s2-implementation-report.md` in the checkout's Git evidence directory.
The test migration used a fixture with Git and its local transport available
when Claude Code is absent. The slice used 11.8 of its 15 active minutes.

### 3. Refuse installed execution when Claude Code is missing

Type: Behavior
Status: done
Proof: The existing missing-Claude HTTP case in `agent-launch-boundary`
uses a Ready queued story and a real local bare origin with Git and its
transport available. Observe the installed-start refusal with an actionable
Claude Code explanation, unchanged bare `main`, no execution worktree,
no native call and no launch record. The adjacent Ready launch with Claude
available still publishes the Take and opens its linked checkout.

The diagnostic in `s2-missing-host-transport.log` showed the Take publishing
before the native spawn detected Claude's absence. The developer authorized
the pre-publication refusal. Resolve host availability using the native
launch environment at the installed Dashboard execution boundary before
the workflow can create a workspace or publish. Keep the workflow as the
owner of publication per [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#observe-workflow-outcomes-without-owning-them).
The proof loop is limited to the refusing boundary and its normal Ready
control, plus directly affected installed-start consumers.

The existing HTTP regression failed before the change because the Take
published before the native refusal. With the change, the strict backend run
passed 44 cases. The missing-Claude case checked identical bare `main` and
worktree lists, an actionable `start-refused` explanation, and no native call
or launch record. The Ready control checked the published receipt against
bare `main` and the native call's actual workspace. Dashboard typecheck and
the future-worktree executable probe passed. The kept-start browser cases
passed twice at the default timeout after removing a redundant setup reload.
Commands and observations are in `s3-implementation-report.md` under the
checkout Git evidence path.

### 4. Preserve acceptance, continuation and launch-record writes

Type: Behavior
Status: done
Proof: Backend `agent-launch-change-wait`, `agent-launch-duplicate`,
`agent-launch-uncertain-continuation`, `agent-launch-records`,
`agent-launch-records-replaced` and
`runtime/mounted-boundary-server`. Observe the attempt change count and
settlement, the held-wait outcome, one native conversation and input,
retained continuation effort, and real record writes visible to other
servers, after restart, and during retention.

A held or continued launch produces the same lifecycle and store effects
through the installed catalog fixture. Use ad hoc requests for a native
hold or launch-record write whose observation does not use story
membership. Keep a Ready queued story when the assertion depends on its
identity or the start's phase or policy. Exercise concurrent server starts
on a shared machine with the shared initialization path from slice 1.

The strict 39-case backend selection passed before and after the migration.
The change-count case observed the Ready attempt progress into a held native
launch and settle after release. The duplicate and continuation cases
observed one conversation, independent submitted input and retained effort.
The existing record-store and mounted HTTP cases observed actual writes
and settlement. The unchanged shared-machine case passed across concurrent
starts and restart. Dashboard typecheck passed. Commands and observation
locations are in `s4-implementation-report.md` under the checkout's Git
evidence path. Acceptance found no refactor candidate in the six subject
specs. They reuse the installed fixture without changing its contract.

### 5. Start a story from its card and follow it through publication

Type: Behavior
Status: done
Proof: E2E `agent-launch-story-card`, `agent-launch-story-card-open-session`,
`agent-launch-story-card-problems`,
`sessions/sessions-sidebar-reading` and `terminals/agent-terminal`.
Keep layout, focus, refusal, Mark as done and terminal observations. Check
the published placement after a Take, the started workspace in native input,
the one session entry after the first session read, and both Starts' actual
availability in each Backlog or Taken state.

Seed the successful execution card as Ready on the origin. Keep the rough
card for refinement and preserve the unready evidence in the eligibility
observation. Watch the same origin for the launch's publication, address the
card by story across the move to Taken, and assert the role and membership in
each phase. Retain the phone's exact-draft and held-native checks. For
journeys that later exercise an independent published transition, declare it
on the fixture origin and observe the corresponding card or standalone
entry. Preserve the source identity and the terminal attach target.

The strict eight-case E2E selection passed before and after the migration.
The Ready, rough and touch cases observe native commands and actual origin
publication. The focus cases pin the current Board read until the focused
session is visible, then advance to the same origin's accepted revision and
verify card placement and session identity. The problem, open-session,
sidebar and terminal cases keep their original actions and outcomes on
that origin. Dashboard typecheck passed. Commands, observed cases and
the initial focus and recovery failures are in `s5-implementation-report.md`
under the checkout's Git evidence path.

### 6. Observe verified or continued launches in the page

Type: Behavior
Status: done
Proof: E2E `agent-launch-claude-verification`,
`agent-launch-claude-own-record-verification`, `agent-launch-codex` and
`agent-launch-follow-up-session`. Observe verification, Recheck and
the adopted native session and message. Follow-up retains the source story's
status, keeps its context and has a distinct session. The host-switch case
still reads the selected host's changed options and binds its own record.

Use a Ready queued story when a launch's record must carry an established
start. Arrange an existing source session through MakeMe for the follow-up
when only the follow-up is under test. Match the host installation to the
command exercised and keep the native fake's distinguishing behavior. Keep
the retained attempt and final session ID assertions independent of setup.

Eight E2E cases passed before and after the migration, and Dashboard
typecheck passed. The Claude cases capture the accepted attempt ID before
Recheck and observe the adopted session or unchanged refusal on that attempt.
The mixed-host case publishes a Codex option revision after opening the
dialog, observes the native turn and Preparing receipt independently,
and reads that revision before checking session actions. Both follow-ups
preserve the composed Done source and observe their distinct native sessions.
Exact observations and strict run records are in
`s6-implementation-report.md` under the checkout Git evidence path.

### 7. Carry dialog choices through the installed launch

Type: Behavior
Status: done
Proof: E2E `agent-launch-options`, `agent-launch-options-exclusive`,
`agent-launch-options-kept` and `agent-launch-model`.
Keep the dialogs' definition, exclusion, kept selections, model, effort and
ordered outgoing flags or text. Check native input and the recorded choices
through the corresponding host.

Supply actual installed option definitions, including variants committed
through the repository description. Keep the missing file, invalid file,
other command and absent-skill cases intentional. A missing-skill example
keeps the project's installation and omits the specific skill whose
absence it proves. Where a file changes after the dialog opens, preserve
that temporal distinction and the re-read from the selected host.

All 15 original E2E cases passed on the baseline. The installed selection
passed all 16 cases including the shared Codex dialog consumer. The suite
observes committed shipped, altered, absent, invalid, foreign-command and
missing-skill definitions, native flags and model/effort, and the saved
requests. The retention path changes the same origin while the dialog is
open. Session options are observed after the Board reads the actual
Preparing assignment and again after reload. Dashboard typecheck passed.
Exact runner records and observations are in `s7-implementation-report.md`
under the checkout Git evidence path.

### 8. Send voice input through the installed launch

Type: Behavior
Status: done
Proof: E2E `session-instruction-voice`,
`session-instruction-voice-key-failures` and
`session-instruction-voice-provider-failures`.
Keep the dictated and typed instruction, the send boundary, and the
provider failure and recovery observations.

The launch uses the final draft from the composer. Use a real start where
the case asserts its command and ad hoc work where the promise is the
native submission. Observe the visible voice state and exact draft, then the complete native
instruction with the appropriate established and reporting context.

The nine voice cases passed on the baseline. The final strict selection
passed 24 cases, including option and model consumers of the shared native
assertion. The voice tests check the exact edited composer draft against
the native instruction and that same attempt's kept record. The Ready
launches also check the actual published receipt and linked worktree.
The provider cases preserve failure, cancellation, deadline and recovery
observations. Dashboard typecheck passed. Exact commands and observations
are in `s8-implementation-report.md` under the checkout Git evidence path.

### 9. Install every fixture-created catalog project

Type: Behavior
Status: planned
Proof: Full backend and E2E suites, with the strict proof records. Check the
fixture path for all `projectFolders` callers, including direct
`installFakeClaude` users in `agent-terminal-close` and
`agent-terminal-codex-close`. Check that concurrently reused projects share
one ready checkout and that pre-installed fixture checkouts keep their own
origins. Check elapsed time against a plain run under comparable conditions,
using retained case and group times to attribute any difference. Preserve the
cheap path for composed sessions and put any unexpected slow behavior in the
focused case that owns it.

Remove the interim fixture selection. Every catalog folder made by the
harness has an installed checkout and its own bare origin with matching
`main`. Run the catalog consumer trace before the change and account for
every affected assertion. Full suites are the local gate because every
fixture-created catalog project receives the new default.

## Review verification

The preparation plan split the backend command and record lifecycles, the
E2E card and host outcomes, and dialog and voice submissions into eight
slices. During execution, the developer expanded the story and its
missing-Claude behavior became a separate slice. All nine slices share one
installation path, and the final slice removes temporary fixture selection.

- `review/story-review-offline-sync.spec.ts` prepares the synced refs
  directly and expires the shared deadline after observing the trunk fetch
  in the case that checks for a second fetch. The other hanging-origin cases
  exercise the real deadline. All six cases passed in the full backend suite.
- `review/story-review-tree-collapse.spec.ts` waits for visible refresh
  confirmation before checking the collapsed rows and returning to
  Development. It passed in the full E2E suite, including reopening Intent
  and checking the selected diff.

The existing harness passed both unfiltered suites at `4feb7b600` with
these fixes on 25 November 2026. Both ran with four workers on macOS under
the AC sleep guard. Backend passed 1,986 cases with the opt-in Sessions replay
skipped. E2E passed all 779 cases. The first backend run also exposed a
Codex observation race. The passing run used the test harness's observation
clock to expire reuse before requesting a new read.

Strict proof records, logs, and the tested patch are in the common Git
directory under `open-dough/evidence/SEED-433-review-verification`. This
establishes the baseline for the installed-catalog comparison in slice 9.

## Story obligations

### G1. Make the installed catalog the default
Reported: slice 1 — "The temporary installation selection is the planned interim until slice 8."
Story clause: "Every catalog project the harness creates has an installed Open Dough checkout and a matching bare origin."
Disposition: receiving slice 9

### G2. Settle missing-Claude behavior on an installed Ready launch
Reported: slice 2 — "With Claude absent and Git fully available, the installed start published the Take. The native launch then returned `not-installed` and kept no launch record."
Story clause: "With Claude Code absent, the boundary answers the installed start's refusal and keeps no launch record."
Disposition: proved by slice 3: `dashboard/backend-tests/launches/agent-launch-boundary.spec.ts`, missing-Claude and Ready controls, strict `s3-backend-final.json`.

## Verification and delivery

- Local gate on macOS uses the maintained
  [sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  with `caffeinate -s -i` on AC power. Keep the default case timeout and
  apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Run `node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs
  --checkout "$PWD" --base HEAD --term projectFolders --term catalog
  --term launchRequest --term claudeLaunches` with the relevant fixture and
  assertion terms for each slice. Run its named and newly reached cases
  before and after. Inspect the setup and observing assertion for each distinct
  purpose. Keep the full trace and its dispositions in execution evidence.
- Use `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES
  npm run --silent test:dashboard:backend -- <files>` and the equivalent
  `test:e2e` command, with the respective
  `OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD` and `OPEN_DOUGH_E2E_PROOF_RECORD`.
  For slice 9 run both without file selectors under the AC guard. Run
  Dashboard typecheck and lint. For changed Distribution test builders, run
  the existing affected MakeMe support tests through `scripts/test.sh`.
  Follow the repository's installed MakeMe and page-object selections.
