# Qualify Board fixture routing and request boundaries

**Source:** [SEED-430](../../seeds/SEED-430-read-published-project-data-from-local-git.md#qualify-board-fixture-routing-and-request-boundaries)

**Identity:** SEED-430#qualify-board-fixture-routing-and-request-boundaries

**State:** Planned

## Execution context

Julia-chan is executing in Story Branch Mode in the owned
`.worktrees/qualify-board-fixture-routing-and-request-bounda` checkout on
`codex/qualify-board-fixture-routing-and-request-bounda`. The publisher is
`dashboard-territory.local-open-dough`. Origin main and the story branch both
accepted the Take at `4f25aa5672565f1efc25d58165a5ab021b1d00ff`, based on
`1935edc5c20ed181bdf276b973767ffef83ac292`. This Take is the first increment's
published base. The checkout passed `npm ci` and `npm run typecheck:dashboard`.
The Codex observer uses GitHub Actions `ci.yml` on the story branch with
coordinator `Julia-chan-84a618be` and mailbox `/tmp/dough-ci-501/watch-A78W0t`.
Replanning follows existing planning authority.

## Goal and scope

Make the fixture publication independently readable by Git wherever a configured,
added, or relaunched Dashboard opens the Board. Keep admission, pinning,
retained answers, sharing, and directed waits observable at their live REST
operations. Pass Dashboard Backend Test and E2E Test before the membership cutover.

The fixed and moving browser families have landed as recorded in the source's
supplier agreements. This plan covers remaining fixture setup and the last
pre-cutover gate. [Plan 828](../828-open-and-refresh-board-at-verified-trunk/PLAN.md)
owns the product transport switch, the superseded REST membership assertions
and test controls, and both suites' post-switch run. The scheduled feedback
maintenance reader still uses REST and has its own Git migration
[story](../../seeds/SEED-436-check-feedback-maintenance-from-local-git.md).
Existing intentional failures stay at their affected operation. Fixtures continue
to use local repositories so Git cannot hit live GitHub from the test machine.

## Decisions

- Keep one source of published commits. Reuse `publishes()` and the named
  registration in `fakeGitHub.serve` for fixed data, and
  `publishCommittedOrigin` or the existing materialized history publishers
  for commits a journey advances. `keepingOrigin` retains the underlying
  origin on a REST wrapper. A following committed publisher is suitable when
  the test already pushes the ref at the publication event. A non-following
  publisher moves its own real ref in `advanceTo`.
- `routeOriginThroughServedHomes` preserves a HOME's explicit route and
  replaces the earlier publication's route for the same repository. In an
  installed-launch case with a competing catalog bootstrap route, determine
  whether that origin is also the native checkout's publication target. Keep
  that origin when it is authoritative and serve the corresponding commit.
  The fixed/moving suppliers already have `routeServedHomesToPublication`
  for a case explicitly replacing bootstrap publication. Use it only where
  that replacement matches the fixture's intent. Keep named projects,
  default seed coverage, and local failure for an unserved repository.
- Follow [Share one refresh for published Dashboard Git reads](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads)
  and [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  by making origin authoritative and keeping REST details at the exact admitted
  pin. Keep native session evidence distinct from publication.
- Follow [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e),
  and [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
  Reuse existing builders and routing. Keep new non-browser proof in plain
  Vitest and use the existing browser journeys for the browser outcomes. Keep
  actions and observations at their page-object cues under
  [Act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows).
- Use the [fixture audit inventory](fixture-audit.md) to locate consumers, then
  follow each affected case from its publication or failure setup to the
  request and result it proves. A successful REST answer read after the event
  is a discovery signal. Check the configured ref in each distinct served HOME
  where and when the case opens or reconciles. Verify genuine missing refs and
  failures separately at their trigger.

## Outside-in proof

| Promise | Owner and observable result |
| --- | --- |
| Named, seeded, republished and explicitly overridden routes | 1. Real Git reads resolve the expected configured ref in each HOME, including a late HOME, with no route for an unrelated unserved repository. |
| An added or saved project opens at its own published ref through restart | 2. Assert the exact pin from the served HOME and the existing Add, reopen, and launch result. |
| A Prepare or Start opens the story at its real pin and reaches the right native decision | 3. Check origin before opening and at the fixture's publication cue, then observe the existing base-CI, options, or phase result. |
| Reconciliation, completion, and Review observe the published commit | 4. Check the actual initial and advanced refs in the relevant HOMEs. Observe the real record accepted and kept across restart or opened in Review. |
| Authenticated reads retain admission and exact detail pinning | 5. A cold shared setup reaches its published backlog. Explicit revision, reachable detail, refusal, failure, and held detail assertions still observe their own result. |
| Retained answers reuse only eligible detail at the admitted pin | 6. Read across revision moves, processes, and machine homes. Verify which detail calls recur and which return the same answer. |
| REST owner sharing, wait bounds, directed waits, and recovery still apply | 7. Drive real HTTP scheduling and detail paths with the existing held/failure answers. Observe response timing/status, arrival/non-arrival, and both projects' outcomes. |
| No unexplained fixture mismatch at handoff | 8. Document the operation and timing behind each residual diagnostic event, prove the relevant exact ref or independent REST operation, pass both full suites, and retire scratch evidence. |

## Ordered slices

### 1. Resolve the publication in each fixture HOME

Type: Behavior
Status: done

Given one named project, re-serve a wrapped answer for its second real
publication. Read Git from HOMEs registered before and after its first
publication. Prove through the fake GitHub fixture's public setup and
`git ls-remote` that both reach the second pin, another named route and the
seeded fallback still work, an explicit HOME route keeps precedence, and an
unserved URL fails locally. Put the maintained regression proof at this boundary.
The existing `committed-origin-actions.spec.ts` proves one HOME and one route.

Proof passed with `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run
test:dashboard:backend -- dashboard/backend-tests/runtime/committed-origin-routing.spec.ts`
and `npm run typecheck:dashboard`. The five Vitest cases serve real commits
through the public fake GitHub fixture and read the configured ref with
`git ls-remote` from each disposable HOME. The assertions cover both pins in
early and late HOMEs, the preserved named and seeded pins, explicit route
precedence, and the local missing repository error. The test-only change
uses individual HOME reads because the shared all-HOME assertion cannot
distinguish a registration omission or the explicit override result.
The review found no independent refactor candidate.

### 2. Open a configured or added project from its configured ref

Type: Behavior
Status: done

Use real named fixtures behind `projectAddMachine` and
`projectConfigurationMachine`, with the actual `release+stable` or `trunk`
ref where the case configures it. A seeded catalog fallback covers seeded
projects. For named projects, serve the REST reply and the real ref from
the same publication. Preserve the execution checkout where the
scenario sets it up. Prove the exact ref at Add, configured selection, and
reopen in `project-add`, `project-configuration`, and the related
configuration and project-restored-session cases in the inventory. Existing
environment, selection, launch, and restart assertions must still run.

`projectAddMachine` registers Sample App at `release+stable` under each
server's HOME. The saved-configuration fixture keeps a publication per
project at its configured ref and verifies it before opening. Both machines
serve the seeded `main` fallback and a separate named `master` for Terry
Talks. The Add and saved-selection tests match the displayed revision to the
real Git pin across restart. The restored session test checks the Git pin
alongside the existing passive-service and retained-session outcomes. The
progressive catalog override now keeps `release+stable` when replacing the
added project's publication.

```sh
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/configuration/{project-add,project-configuration,project-hide,project-hide-sessions,project-remove,project-remove-selection,system-settings-running-session,system-settings-client-configuration}.spec.ts e2e/sessions/project-restored-session.spec.ts e2e/stories/recently-done-progressive-added-project.spec.ts --workers=2 --reporter=dot
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run test:dashboard:backend -- dashboard/backend-tests/configuration/project-add-boundary.spec.ts dashboard/backend-tests/observation/authenticated-read-cooldown-reach.spec.ts --workers=1 --reporter=dot
npm run typecheck:dashboard
```

All 24 E2E cases, all 11 backend cases, and typecheck passed. The independent
refactor review found no candidate and reused the proof.

### 3. Start a launch from the fixture's real publication

Type: Behavior
Status: done

For Prepare and Start, check the route selected by the fixture HOME before
opening. Keep the base-CI and Codex/phase journeys' native request evidence.
Use the installed checkout's bare origin when the scenario pushes there.
Where the journey controls a separate publication, establish the route at its
actual open. Check the ref again when preparation or execution publishes a
new pin. Cover the base-CI, effort, preparation/start phase and Taken launch
cases under the committed-origin inventory. Keep scheduled feedback checks
at the watch-list REST request, including failed ref and due/off outcomes.
Only qualify their origin when the case uses it to open a Board.

The installed Prepare and Start fixtures follow the bare origin their native
workflows publish. The tests resolve the initial, accepted and restarted pins
under the served HOMEs. Held pushes still leave the story queued. After the
real Take, refusal and workspace evidence appears on the moved card. The stale
effort case has a distinct Board publication and explicitly routes it while
launching in the installed checkout. Feedback browser cases commit the watch
list to the native origin and still assert the scheduler's REST reads. The
independent refactor limited the Git-backed publisher to publication and its
request log.

```sh
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/launches/agent-launch-{base-ci,codex-effort,codex-stale-effort,preparation-codex,preparation-phases,start-codex,start-phases,start-taken}.spec.ts e2e/launches/feedback-maintenance-{due-row,launch-held,launch}.spec.ts --workers=2 --reporter=dot
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run test:dashboard:backend -- dashboard/backend-tests/launches/feedback-maintenance-launch.spec.ts --workers=1 --reporter=dot
npm run typecheck:dashboard
```

All 17 E2E and three scheduler cases passed. Dashboard typecheck passed again
after the read capability was narrowed. The scheduler's intentional failed ref
and off/due results are exercised at the REST watch-list operation.

### 4. Reconcile the real publication across session views

Type: Behavior
Status: done

For responsive reconciliation, completion attention, and one-shot Review,
observe the configured ref in each HOME that opens the Board. Check it at
initial load and at the push/advance cue the consumer uses. A fixture that
already pushes the authoritative origin only needs matching registration and
an assertion there. Observe the published record on the existing terminal,
restart, and Review paths. Keep subsequent explicit REST record/listing
assertions at the same pin.

The responsive tests resolve the exact initial, accepted, unrelated or
descendant ref at the corresponding event and after restart. A scheduled
REST check admitted before the Take still returns its earlier held pin. The
completion test retains the failing later REST read. Installed attention
uses a separate real Board publication after the native Take, then advances
it before the retained report is redisplayed. One-shot Review follows the
real trunk through advance, revert and restart while keeping its captured
comparison pair. The five subject specs reuse shared publishers and page
objects, with no new refactor candidate.

```sh
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/launches/responsive-session-reconciliation{,-completed}.spec.ts e2e/sessions/agent-completion-attention{,-restart}.spec.ts e2e/review/story-review-one-shot.spec.ts --workers=2 --reporter=dot
npm run typecheck:dashboard
```

All six E2E cases and Dashboard typecheck passed.

### 5. Preserve explicit read admission and detail results

Type: Behavior
Status: planned

Qualify the common cold-publication setup behind the authenticated admission
and revision-boundary inventory, including `revisionReuseBoundary` and
`revisionCheckBoundary` where they open or resolve the configured ref for
later reads. Use the materialized revision in the request and subsequent
assertions. Drive already-pinned cases with their explicit inputs. Keep bad
revisions, unlisted or unreachable paths, and listing failures observable
where refused. Qualify the moving publication used by the held-detail
first-open and settled-page cases while keeping the REST hold on the detail
read. Refer cold membership-only delay/failure controls and tests to plan 828
where their Git trigger is introduced. Prove the existing admission, pinned
content/error, and rendered held-detail results against the prepared fixtures.

### 6. Keep retained-answer proof on the reads that use it

Type: Behavior
Status: planned

Qualify the shared retained-answer fixture's trunk histories where the cases
open the project, keeping explicitly named branch pins, same/different HOME
and process evidence, and the existing store controls. Follow
`retainedAnswersJourney` into the retained, moved, bounded, and browser
reload cases. Prove reuse using pinned results plus upstream calls under a
second process and misses at a different HOME, a new pin, and a failed or
unreadable detail. Preserve refusal and no retained-data leakage at the
actual failing or unadmitted operation. Keep the supported former
membership-only assertion with the cutover.

### 7. Drive waits and sharing through scheduled and detail reads

Type: Behavior
Status: planned

Run the cooldown matrix against an explicit `since` read and a held
`matching-refs` listing, plus explicit pinned detail requests. Keep the
earlier/later wait and either-project assertions, including existing calls
already at GitHub and the distinction between blocked and missing. Exercise
sharing through scheduled checks, listings and pinned details. Keep the CLI
turn-bound test's observable timeout and absent upstream call through a
scheduled check whose failed listing falls back to the configured REST
ref. Hold the listing until the remaining turns are taken, fail it, and
observe that the fallback times out without reaching GitHub.
Keep pure REST membership dispatch assertions in the cutover disposition.
Run the existing cooldown, shared-read, turns, and resumption checks.

### 8. Qualify both suites and retire the diagnostic

Type: Behavior
Status: planned

Replay the [scratch audit](ref-audit.patch.b64) with physical checkout-local
dependencies. Reconcile its events with each qualified fixture and the
[previous inventory](fixture-audit.md). Explain each residual by consumer,
operation, relevant HOME, and event, with proof for a still-live REST call or
an intentional setup/failure. Check unserved refs, failed transport, and held
or advanced publications at their event. An unexplained Board pin belongs
with the owning slice. Run full E2E Test and Dashboard Backend Test. Remove
scratch source edits and the temporary diagnostic when its gate result is
recorded. Keep only the evidence needed by plan 828 until the cutover has used
it, and keep the maintained Git assertion.

## Local gate

Use the focused cases named by each slice and `npm run typecheck:dashboard`
for changed Dashboard fixture boundaries. In slice 8 run the repository's
`npm run test:e2e` and `npm run test:dashboard:backend` in full because
configuration and shared publishers are loaded across both groups. Keep a
physical checkout-local `npm ci` installation for the backend runtime paths.
Run long macOS commands under `caffeinate -s -i` from a fully awake machine
on AC power. Follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
and select test conventions through [AGENTS.md](../../../AGENTS.md).

## Premises and refinement

Observations on 2026-11-25 in the preparation checkout at `f75429565`,
using a physical `npm ci` on AC power and
`env -u GIT_ALTERNATE_OBJECT_DIRECTORIES` for the test processes:

| Consuming operation | Observed result and consequence |
| --- | --- |
| Fake GitHub named registration used by slice 1 | A checkout-local Node probe called `startFakeGitHub`, `routeDashboardHome`, `serve`, and `keepingOrigin`, then ran `git ls-remote --exit-code` with `GIT_ALLOW_PROTOCOL=file` in each disposable HOME. Both registration orders found the first commit and then the wrapped second commit at `release+stable`. An explicit HOME route kept its independent commit. The unrelated named route and seeded fallback still resolved, and the unserved URL returned 128 locally. Carry this case into maintained proof. |
| Configuration, launch and reconciliation in slices 2–4 | All 30 focused E2E cases passed under `npm run test:e2e -- <named specs> --workers=2 --reporter=dot`. Add and saved settings returned synthetic pins for `release+stable` and `trunk` while Git could not resolve the named fixtures. Installed launch cases reported competing real pins. A replay of the four reconciliation/completion/Review files passed all six cases and checked each distinct registered HOME. Eight of 16 successful answer/HOME observations differed from Git, including a post-publication mismatch for responsive completion and a one-shot comparison that matched its earlier read. The diagnostic samples after REST responds. Verify the actual open and publication cues in slices 3–4. |
| Direct readers and retained answers in slices 5–6 | The focused backend run passed all 35 cases via `npm run test:dashboard:backend -- <named specs> --workers=1 --reporter=dot`. Its mismatches included synthetic reuse setup and retained-answer pins across up to four HOME registrations. Its existing pinned data and retained-miss assertions still ran. The feedback suite's fake ref was requested by the watch-list scheduler and the standalone Actions contract's ref had no served HOME. Those read outcomes are distinct from Board fixture routing. |
| Live REST waits in slice 7 | The [cutover probe](../828-open-and-refresh-board-at-verified-trunk/PLAN.md#preparation-probes-on-2026-11-25) at `2d6b55306` exercised all three directed waits with explicit `since` and `matching-refs`. The cooldown spec and supporting server request paths are unchanged at this baseline. A fresh scratch replay of the read-turn case with the scheduled listing held and failed passed using the backend command and `--grep 'a request still waiting' --workers=1 --reporter=line`. It returned a 502 at the wait bound with no fallback ref call. A control releasing one pinned read early reached `ref main` and returned 200 at the expected new pin. |
| Scratch audit in slice 8 | The retained patch was rebased onto the current route file and replayed in the focused runs. The replay and full suite gate use the same repository runners. The focused selection establishes the diagnostic's command path and attribution. The complete pre-cutover verdict belongs to slice 8. |

Slice-plan refinement ran. It separated the routing contract from project
configuration, kept initial launch and later reconciliation on their own
consumer cues, and made the scheduled fallback the turn-bound proof.
The previous fixed and moving publishers supply the same model for the
remaining examples. Each migration has one outside-in proof loop around
a fixture owner. The last slice reconciles evidence and runs the commands.
An independent unexpected migration returns to its owning slice under the
15-active-minute limit. This review found no remaining slice-specific concern.
