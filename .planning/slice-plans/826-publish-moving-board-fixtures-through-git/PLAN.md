# Publish moving Board test fixtures through real Git

**Source:** [SEED-430](../../seeds/SEED-430-read-published-project-data-from-local-git.md#publish-moving-board-fixtures-through-git)

**Identity:** SEED-430#publish-moving-board-fixtures-through-git

## Execution context

Story Branch Mode in the owned worktree
`/Users/terryyin/git/open-dough/.worktrees/publish-moving-board-test-fixtures-through-real`
on `codex/publish-moving-board-test-fixtures-through-real`, with default
checkout `/Users/terryyin/git/open-dough` and authorized trunk `origin/main`.
The dashboard publisher `dashboard-territory.local-open-dough` assigned
Tsukasa-chan. The Take and initial execution branch are published at
`75de19e9cb5a12c7582daf922cf89b58181573cb`, based on
`34cca84a20f27c3b3591aeb4ec7c46bd6def0380`.

Checkout readiness passed with `node scripts/setup-native.mjs npm`,
`node scripts/setup-native.mjs check`, and `npm run typecheck:dashboard`.
GitHub Actions observes `ci.yml` on the remote execution branch.

## Goal and scope

Give maintainers real trunk moves and rewinds in browser fixtures while
preserving scheduled checks, pinned details, published sessions, and Intent
CI observations. Use the same real commit in Git and successful REST trunk
answers at each publication. A deliberate REST hold or failure belongs to
the request that exercises it. Keep old commits and their pinned records
readable for the fixture's existing consumers.

[Fixed file publications](../824-open-published-board-from-local-git/PLAN.md),
[configured projects, actual launch and reconciliation, direct backend proofs,
and the final audit](../827-qualify-board-fixture-routing-and-request-boundaries/PLAN.md),
and [membership dispatch and its failure proofs](../828-open-and-refresh-board-at-verified-trunk/PLAN.md)
have their own delivery owners. Where a spec combines those concerns, assign
the publication and each continuing request assertion by what they drive.

## Current decisions

- Reuse MakeMe's named histories and
  [repository materialization](../../../Distribution/tests/support/repository-fixture.mjs),
  [ref movement](../../../dashboard/test-support/committedOriginRepo.ts) and
  [served-HOME routing](../../../dashboard/test-support/support/fixtureOriginRoute.ts).
  Keep each scenario's publication on one real history. Resolve named scenario
  revisions to actual SHAs when publishing and carry those SHAs into successful
  REST answers and consuming assertions. A rewind reuses the original commit.
- Preserve the existing REST controls in
  [raw backlog](../../../dashboard/test-support/publishedMovingOrigin.ts)
  and [moving files](../../../dashboard/test-support/publishedFiles.ts)
  where a live scheduled or detail request uses them. The committed origin's
  generic compare path serves containment; observation's paged commit-range
  compare, made commits and path histories need their existing answers.
  Keep branch-only variations at the scheduled or CI seam that exercises
  them. Preserve the fixture's actual Git ancestry when a case relies on it.
- Follow [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  and [Share one refresh for published Dashboard Git reads](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads).
  A served HOME reaches the fixture origin, and a detail refers to a
  published commit independently of the execution checkout. The cutover
  and later observation work own production dispatch.
- Follow [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
  [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [Act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows)
  and [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Extend existing data builders and publication seams. Keep UI actions in
  their current page objects and independent Git/REST observations in the
  cases. The browser journeys stay in E2E.

## Premises and proof

| Consumer and premise | Observation and limit |
| --- | --- |
| Scheduled branch observation and 429/403 recovery can use a real trunk alongside REST checks | On `2d6b55306`, real A/B versions of `auto-refresh-branches` and `auto-refresh-rate-limit` passed with the phone Board in 32.2 seconds on the [scratch Git membership dispatch](../828-open-and-refresh-board-at-verified-trunk/PLAN.md#preparation-probes-on-2026-11-25). They retained conditional listing, the scheduled backlog read, a held owner and recovery. Each adaptation took about one active minute after trace. |
| One named history can drive the raw move and rewind | At `9dc3e801e`, the A/B rate-limit and A/B/A direction cases passed in 5.8 seconds through scratch Git membership and live scheduled REST. The shared sample and two adaptations took a few active minutes. The consuming Dashboard and fixture paths were unchanged between that revision and `f9ebb225d`. |
| The moving-file compare can use the real A and B without losing the REST reuse proof | At `f9ebb225d` in the preparation worktree, baseline `unchanged-records-refresh` passed in 8.2 seconds. A temporary MakeMe A/B origin committed the scenario's A files and a product-only B change. `git ls-remote` under the original and restarted served HOMEs matched the published SHAs. The browser checked the A/B comparison, one real B commit read, no unchanged record rereads on the move, reuse in a second tab, and a full B read on restart. It passed in 7.7 seconds with the current REST membership path. Suppressing only the Git move left REST at B and failed the independent routed-ref assertion at A. The scratch changes were reverted. |
| Intent can judge real trunk and story heads independently | In the [November 25 probes](#november-25-readiness-probes), Project Intent kept its admitted browse revision while it judged the hidden trunk advance. A later story push left judgment waiting on the revision-check body, then showed the story's own passing result. The ancestor proof used the real completed ancestor's run attempt. |
| Mixed REST answerers keep their detail, scheduled, and admission controls with real Git pins | The [November 25 probes](#november-25-readiness-probes) reached the directed detail rate limit, held a shared scheduled listing across a Git advance, and preserved the eight-read admission bound for two real origins. The existing answer wrappers supplied each control. |

Raw sample command at `9dc3e801e`:

```sh
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/stories/direction-disclosure.spec.ts e2e/observation/auto-refresh-rate-limit.spec.ts --grep 'same-project refresh|auto refresh rate limit' --workers=1 --reporter=line
```

Moving-file sample command at `f9ebb225d`:

```sh
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/observation/unchanged-records-refresh.spec.ts --workers=1 --reporter=line
```

The negative moving-file run also set `DOUGH_SCRATCH_SKIP_TRUNK_MOVE=1`.
The sample used one Chromium worker on AC power and the main checkout's
dependencies via a temporary symlink with a matching lockfile. The symlink
was removed. The sample does not establish the physical-dependency backend
gate in plan 827.

## November 25 readiness probes

The scratch worktree used source revision `bdb1621dd`, Chromium with one
worker, AC power, and the main checkout's dependencies after verifying the
lockfiles matched. The baseline across the four focal specs passed 7 cases
in 14.5 seconds.

- **Moving Intent judgments.** In `intent-project-visit-ci`, one MakeMe
  origin supplied the earlier browse commit, the separate trunk and story
  advances, and their parents. Each advance matched `git ls-remote` from
  the Dashboard HOME while the other branch stayed at its previous pin.
  The trunk advance asked main's history and Actions and kept the earlier
  browse SHA. The story advance waited for the held revision-check body,
  then asked the story history and showed its own passing SHA. Revisiting
  a scope reused the judgment, and accepting the new browse revision
  showed the real trunk advance. Suppressing the Git move while updating
  the REST answer failed the routed-ref assertion (`8af92cf` vs
  `bccd421` in the faulted run).
- **Intent fixture size.** `intent-ci-proof-ancestor` reused the same graph
  with its extra files. Its running head and completed ancestor came from
  Git, and the displayed proof and cached artifact requests still named
  run 12, attempt 2, at the ancestor. The seven files that use
  `publishStoryCi` and the three mixed observation files passed 18
  cases in 26.5 seconds with the visit and ancestor cases adapted. A
  separate probe used one fixed publisher change to give
  `intent-ci-status`, `intent-ci-measure-history`, and
  `intent-ci-prior-build-states` real Board heads and supplied those heads
  to the CI history answer. All 10 cases passed in 10.7 seconds. Keep fixture
  ancestry, run heads, and display names derived from the same named
  revisions wherever the journey joins those inputs. History-only data
  such as an earlier CI result still belongs to the test that models it.
- **Mixed REST waits.** In `limit-recovery-tabs`, the withheld seed at
  the routed SHA reached the directed two-second 429. Both tabs recovered
  to that SHA, and GitHub received only one ref read and one read for each
  withheld record after the wait. In `shared-observer-reads`, both tabs
  used one held matching-refs request. Git already named B while the
  request was pending, and releasing it after hiding the other tab gave
  the visible tab a successful changed check at B. In
  `read-turns-across-tabs`, each project had its own routed origin and
  both boards settled after the eight admitted reads were released.
  These adapters used the existing route, answer wrappers, and test
  controls.

The final focused run below passed 8 cases in 13.8 seconds after
`npm run typecheck:dashboard` passed. The probe edits and dependency symlink
were removed.

```sh
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/intent/{intent-project-visit-ci,intent-ci-proof-ancestor}.spec.ts e2e/observation/{limit-recovery-tabs,read-turns-across-tabs,shared-observer-reads}.spec.ts --workers=1 --reporter=line
```

## Ordered slices

For every publication group, keep a maintained observation of the advertised
SHA from the served HOME at initial open and each move the case proves. Keep
the associated browser and request assertions in the same slice. For the
named spec families below, run the affected cases with the E2E entry in
[Local gate](#local-gate), including unchanged callers of an edited shared
entry point. Record a case's Git pin and the live request or visible result
that discriminates its promise.

### 1. Publish scheduled backlog observations at real revisions

Type: Behavior
Status: done
Behavior: With a raw test Board open at A, publish B through the existing
raw-history seam. A scheduled check discovers B and reads its backlog while
the origin reports the same SHA. Use `autoRefreshJourney`,
`refreshJourney` and `revisionStreamJourney` where they own the setup.
Proof: Run `auto-refresh.spec.ts`, `steady-refresh*.spec.ts` and the
`revision-stream*` and `revision-check-return` cases that use the raw
setup. Keep the subscription, lost-stream fallback, and visible/hidden
cadence assertions. Prove one moved real pin at the scheduled operation.
Use the shared path for the repeated setups within the 15-minute budget.

Accepted proof at the Take plus slice 1 changes. `publishMovingHistory`
materializes the MakeMe history once per fixture, moves its `main`, and
gives the raw REST controls the same revision. The scheduled `auto-refresh`
held-backlog case independently checks A/B/C under the served HOME, sees the
exact B request while C is already published, and then settles at C. The
steady and shared-check cases check A/B and preserve held reads and shared
listing counts. The stream cases check A/B, matching-refs reuse, fallback,
visibility cadence, and the B pin from a restarted Dashboard HOME.

```sh
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/observation/{auto-refresh,auto-refresh-visibility,auto-refresh-detail-recovery,auto-refresh-project-isolation,auto-refresh-rate-limit,auto-refresh-recovery,steady-refresh*,revision-stream*,revision-check-return,shared-observer-check-reuse}.spec.ts --workers=1 --reporter=line
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/observation/{owner-replacement-recovery,transient-recovery-currentness,transient-recovery-lifecycle}.spec.ts --workers=1 --reporter=line
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard:backend -- 'runtime/(first-open-waits-for-read|settled-page)\.spec\.ts' --workers=1 --reporter=line
npm run typecheck:dashboard
```

The browser runs passed 38 and 9 cases, the backend run passed 5, and the
typecheck passed after refactoring. The compatibility runs retain the current
raw fixture behavior for recovery callers while slice 2 migrates them.

### 2. Preserve scheduled and detail recovery on a moving origin

Type: Behavior
Status: done
Behavior: With a confirmed snapshot and a held, refused or interrupted
scheduled check or pinned detail, publish the next real trunk and recover
through the operation that incurred the wait. A companion project or waiter
continues under the journey's existing request-owner rules.
Proof: Run the affected `auto-refresh-*-recovery`, `auto-refresh-rate-limit`,
`project-read-*`, `transient-*`, `read-failure`,
`owner-replacement-recovery` and isolation cases. Observe the directed
429 and 403 wait/reset at the scheduled or detail request, the retained
snapshot, and recovery at the expected pin. Keep membership-only controls
with the cutover. Use the shared raw setup and its established override
points. Count any residual owner rewrites against this slice before dispatch.

Accepted proof at `d7513707b85b964bddca4b2d9a071bee46c6b3b4` plus slice 2
changes. The shared `openSettledAtA` now always opens a real history. The
rate-limit journey independently resolves A and B under its Dashboard HOME
and sees the scheduled 429, 403, directed waits, retained A, and recovered B.
The detail cases isolate a REST 404 and a held request at immutable B. The
malformed-backlog case publishes invalid data before the repair and observes
all three routed pins. The owner-replacement and project-return cases keep
their held requests, selected snapshot, and exact recovery pin. The published
facts case retains A's independent record groups while B settles.

```sh
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/observation/{auto-refresh,auto-refresh-visibility,auto-refresh-detail-recovery,auto-refresh-project-isolation,auto-refresh-rate-limit,auto-refresh-recovery,owner-replacement-recovery,project-read-isolation,project-read-recovery,published-facts-isolation,read-failure,revision-check-return,revision-stream*,shared-observer-check-reuse,steady-refresh*,transient-read-exclusions,transient-read-recovery,transient-recovery-currentness,transient-recovery-lifecycle}.spec.ts --workers=1 --reporter=line
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard:backend -- 'runtime/(observation-measurements|first-open-waits-for-read|settled-page)\.spec\.ts' --workers=1 --reporter=line
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/observation/owner-replacement-recovery.spec.ts --workers=1 --reporter=line
npm run typecheck:dashboard
```

The focused browser and backend groups passed 77 and 6 cases. The
owner-replacement case and typecheck passed after refining the REST answer
registration seam. The initial malformed membership-only refusal still uses
the cutover story's boundary.

[Watcher CI setup repair](diagnosis-pinned-watcher-codex-setup.md) reproduced
the pinned native Codex acquisition timeout on the slice 2 publication.
The exact browser case passed with the same stalled registry and a prepared
launcher. Only the owning E2E shard prepares the binary in its existing
acquisition window. Native watcher, backend, and workflow contract proof
passed locally. The branch observer covers the hosted verification.

### 3. Follow real trunk rewinds through story navigation

Type: Behavior
Status: done
Behavior: When a published history returns to A or the reader changes
project, the Board's direction and story navigation reflect that project's
current real pin. A link or detail keeps the pin its journey establishes.
Proof: Run `direction-disclosure`, `story-url-history` and reached
project navigation cases. Observe A/B/A with the same A commit, the visible
direction change, and any detail requested at an earlier pin. Keep
independent project origins distinct. Size from the retained raw rewind
sample and the directly reached navigation setups.

Accepted proof on the slice 2 branch plus slice 3 changes. The direction
journey resolves A, B, and the original A under its served HOME, holds B's
backlog, and shows B's direction followed by A's original text. The project
switch journey retains separate commits and its exact returning A requests.
Story URL history verifies two Git routes during the directed Doughnut 503,
checks both exact REST backlog pins, and preserves Retry, reload, Back, and
Forward. Dev and preview session alerts reach the routed Doughnut commit.
The unrelated catalog checkout rewrite shadowed the fixture route and was
removed from those read-only navigation setups.

```sh
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/stories/direction-disclosure.spec.ts e2e/navigation/story-url-history.spec.ts e2e/sessions/session-alerts-navigation.spec.ts --workers=1 --reporter=line
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/navigation/story-url-history.spec.ts e2e/sessions/session-alerts-navigation.spec.ts --workers=1 --reporter=line
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard:backend -- 'runtime/test-preparation-dev-notifications\.spec\.ts' --workers=1 --reporter=line
npm run typecheck:dashboard
```

The first run passed all four direction cases and exposed the shadowed
route. The corrected navigation run passed three cases, the dev preparation
run passed one, and Dashboard typecheck passed. The direction fixture and
its four observing cases were unchanged by that correction and the CI repair.

### 4. Preserve session navigation while its published Board moves

Type: Behavior
Status: done
Behavior: A reader following an existing session through sidebar, story or
Recently done navigation keeps the recorded session choice and reaches the
right publication across project and Board changes. Update the first
shared publication in `sessionNavigationJourney`,
`recentlyDoneSessionsSidebarPage` or the role-specific setup it reaches.
Proof: Run the reached `sessions-sidebar*`,
`cursor-sessions-sidebar-*`, `recently-done-sessions-sidebar-*` and
progressive navigation cases. Check the pin and the retained selection,
panel or route. Keep machine-local session signals distinct from published
records. Qualification owns cases whose proof is launch, terminal startup
or reconciliation. Keep fixed auxiliary projects with the publisher that
already owns their route.

Accepted proof at `8d95ff3d647fcd6dc30ed4f87d10fc1ae1ec6e00` plus slice 4
changes. Session navigation keeps its selected terminal while Pygardon's
exact backlog is held and selects its story after release. The Done session
case verifies queued and completed Open Dough pins while the session opens
under local Taken. The Cursor, Recently done, and progressive journeys
compare their selected Boards with the routed Git pin and exact REST read.
The read-only role retains the local folders needed for attachment. The
unchanged launch and keyboard role keeps its existing setup.

```sh
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/sessions/{sessions-sidebar,sessions-sidebar-navigation,sessions-sidebar-navigation-cases,sessions-sidebar-touch,sessions-sidebar-stays-as-left,cursor-sessions-sidebar-navigation,cursor-sessions-sidebar-resize-lasting,cursor-sessions-sidebar-size-kept,recently-done-sessions-sidebar-navigation,recently-done-sessions-sidebar-reopen,recently-done-sessions-sidebar-paging-board}.spec.ts e2e/stories/recently-done-progressive-{navigation,navigation-cursor,reset}.spec.ts --workers=1 --reporter=line
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/sessions/{sessions-sidebar-stays-as-left,sessions-sidebar-keyboard}.spec.ts e2e/stories/recently-done-progressive-navigation.spec.ts --grep 'starts closed, and once open|choosing another project before|Command\+B|open launch dialog' --workers=1 --reporter=line
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run typecheck:dashboard
```

The browser runs passed 32 and 4 cases. Dashboard typecheck passed. The
refactor shortened the binding of the same composed session identifier and
kept its attach assertion.

### 5. Keep comparison and branch observations at their published pins

Type: Behavior
Status: done
Behavior: After a file history advances, the Dashboard compares the
actual trunk pins and keeps the correct record reuse, attribution, clock
or branch progress result. A reopened Dashboard reads from the served
origin of its new HOME.
Proof: Run affected `unchanged-*`, `story-cards-before-comparison`,
`reopened-project-reads`, `agent-roster-avatar`, `branch-progress-reading`
and `branchRefreshJourney` cases. Preserve held compare, the exact A/B
comparison, no unnecessary reads, branch-tip deletion or unusable listing,
and profile history identity where asserted. Use the sampled file path and
shared branch setup. Keep `publishedFiles.ts`'s publication and answer
dispatch cohesive. If the near-limit file grows, simplify that seam
without changing the request controls.

Accepted proof at local merge `fbfc1662714740dbbad0d92389f2d9283d3e6630`
plus slice 5 changes. That merge preserves the published slice 4 tip and
trunk `e5b15f59`, including the fixed-file publisher which shares this
seam. The named committed-file history moves actual refs and keeps the
existing REST comparisons, holds, and history controls. A/B reuse checks
the exact comparison, single changed commit, and full B read after restart
under a new HOME. Credit and clock cases use actual profile-history commits.
Branch cases independently observe real advances and deletion and retain
the unusable listing and held comparison controls. Reopen keeps the story
branch separate from trunk.

```sh
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/observation/{unchanged-*,story-cards-before-comparison,reopened-project-reads,auto-refresh-branches,auto-refresh-unusable-branch,revision-stream-stopped,steady-refresh-inspection,profile-addition-latency}.spec.ts e2e/stories/{agent-roster-avatar,branch-progress-reading,branch-slice-progress}.spec.ts --workers=1 --reporter=line
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/observation/{auto-refresh,published-facts-isolation}.spec.ts e2e/sessions/sessions-sidebar-navigation-cases.spec.ts --workers=1 --reporter=line
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard:backend -- 'runtime/committed-origin-actions\.spec\.ts' --workers=1 --reporter=line
npm run typecheck:dashboard
```

The focused and compatibility runs passed 17 and 12 browser cases plus
two backend cases. Refactoring compared the generated attribution answers
for exact equality and passed typecheck.

### 6. Keep Intent CI evidence attached to its published head

Type: Behavior
Status: planned
Behavior: When a project or story's published head changes during an
Intent visit, the existing judgment reads that head's CI evidence and
retains the previously admitted browse revision where the case requires it.
Proof: Begin with `intent-project-visit-ci.spec.ts` through
`intentCiStoryRecords`, then run affected Intent CI callers of that setup
and the shared project CI publishers in the audit. Match actual trunk,
history, run head and displayed SHA where they represent the same commit.
Keep held check, nearest-result, differing branch verdicts and proof-source
assertions. Resolve named commits in the shared story fixture once and
derive callers' CI evidence and displays from those SHAs. Move the story
refs in that same origin, making divergent branch tips available before
advertising them. Supply the fixed project head through its shared
publisher and reuse `intentCiHistoryPage`'s real-origin path where already
active. Budget 12–15 active minutes for the two shared entry points,
the remaining caller substitutions, and focused proof review.

### 7. Follow moving Recently done and published session histories

Type: Behavior
Status: planned
Behavior: Moving a published story through queue, re-Take and Done, or
refreshing a progressive Done catalog, updates the browser at the correct
commit while earlier admitted details keep their record and session links.
Proof: Run `recently-done-returned-sessions`, the progressive
refresh/reset/failure journeys reached through `recentlyDoneRefresh`,
and catalog retry where it replaces a publication. Check the exact pins,
session relationship and request order, including a failed listing or
record read where the journey holds it. Preserve one publication history
for each scenario and its earlier pins.

### 8. Keep custom observation faults at the consuming request

Type: Behavior
Status: planned
Behavior: Where an inline browser answerer controls a moving publication,
the real trunk remains available at the announced pin while the explicit
scheduled, detail or comparison fault still reaches the existing consumer.
Proof: Group live overrides by held ref/listing, held content/history,
or mixed owner turn. Preserve the actual withheld detail, the shared
matching-refs wait, and the admission limit through the existing answerers.
Run each affected case at its original trigger and recovery boundary.
Record the routed pin and the still-live request observation. Keep pure
membership proofs with cutover, fixed publications with their fixed owner
and configured-project cases with qualification. Budget 8–12 active minutes
for the three confirmed mixed cases and the remaining inline substitutions
already assigned to this slice.

## Boundary review and remaining concerns

Slice-plan refinement applied. Each slice owns a consumer-visible
fixture result and its preserved proof. The [audit inventory](../827-qualify-board-fixture-routing-and-request-boundaries/fixture-audit.md)
lists 51 raw-origin, 27 moving-file and 17 inline spec hits. These overlap.
Most raw scheduled cases reach the three shared journey setups in slice 1;
the failure overrides belong to slice 2, and the same raw publisher is
reused for the separate navigation and session consumers in slices 3–4.
The moving-file hits reach shared branch/reuse callers in slice 5, 16
Intent files in slice 6, and the returned-session publication in slice 7.
Some hits use a fixed or already-real publisher alongside a moving one.
Count a setup once, and cover every consumer through the slice that changes
its first affected setup.

Inline source tracing puts owner replacement and the two transient lifecycle
overlaps with slice 2, catalog retry with slice 7, added-project setup with
qualification, and fixed Intent recovery, detail, credit and clock setups
with their fixed publication owner. The mixed `limit-recovery-tabs`,
`read-turns-across-tabs` and `shared-observer-reads` cases retain their
detail, admission, and scheduled proofs in slice 8. Their successful
trunk answers use the real routed pin while REST retains ownership of
the request under test. The samples for slices 6 and 8 supported the
existing eight-slice boundary.

## Local gate

Use `npm run test:e2e -- <affected-specs> --workers=1 --reporter=line` for
focused proof, and `npm run typecheck:dashboard` when editing shared typed
support. Trace and run the affected readers when changing either publisher,
including backend callers of a changed shared raw contract. Plan 827 owns
final whole-suite qualification. Run long checks under
[`caffeinate -s -i` on AC power](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
and [AGENTS.md](../../../AGENTS.md) for MakeMe, page-object selection and
default timeouts. Recheck active slice size before expanding any boundary.
