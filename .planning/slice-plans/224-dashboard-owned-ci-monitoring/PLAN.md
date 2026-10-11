# Shared GitHub request admission

**Identity:** SEED-063#dashboard-owned-ci-monitoring
**Source:** [refined story](../../seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring).
**Prepared:** 2026-10-03; revised 2026-10-11 for Terry's standalone,
replacement, shared-throttling and integrity direction. Planning only.
**Preparation workspace:** `/Users/terryyin/git/open-dough/.worktrees/background-ci-preparation`,
branch `codex/background-ci-preparation`, fetched base `b8e3e6694634bcac9b7353e179f1aec9fda12116`;
assignment `030446f5e2a5f34f7c485f757a1661afdd13024b`.

**Split:** 2026-10-11, by Terry's decision during execution. This plan keeps
the delivered request-admission slices 2–6 under their original numbers. Its
former slice 1 and slices 7–15 are slices 1–10 of
[plan 299](../299-background-ci-failure-delivery/PLAN.md), which serves
[background CI failure delivery](../../seeds/SEED-063-dashboard-owned-ci-monitoring.md#background-ci-failure-delivery).
The direction and premises below were written for the whole original story.

## Goal and boundaries

Dashboard reads and product-controlled CI discovery and diagnostic requests
share one GitHub request-admission owner on this machine, per API host and
login, whose hold survives its replacement. The source story owns scope,
constraints and the example; slices 2–6 deliver and prove it.

Excluded here and kept by plan 299: native failure delivery, enrollment,
publication registration, nonblocking completion, target repair, retirement
and whole-lifecycle recovery. No new execution permission, generic queue
framework or database.

## Direction, domain mapping and PFE

Follow [North Star](../../NORTH-STAR.md) topics "One owner admits reads to
GitHub" and "Background CI monitoring and session delivery", revised by this
preparation because the old process-local dashboard ownership cannot serve
standalone obligations. This is feature design, not acceptance of Proposed
ADRs 0007–0009. Current Accepted constraints:

- [0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md):
  preserve distinct published story facts and local session/CI facts.
- [0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
  one conceptual solution, direct domain mapping, bounded proof and necessary
  whole-product structure rather than component-local duplicates.
- [0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  and [0004 — Client installation and update](../../../docs/adrs/0004-client-installation-and-update-accepted.md):
  self-contained installed dependencies; runtime support is not fetched during use.
- [0005 — Native acceptance](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
  feasibility before dependent work; separate native acceptance before release.
- [0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  one instruction source, minimal host adaptation and project-local perspective.

### One runtime, two entry adapters

The installed runtime owns durable subscriptions, evidence, delivery and
completion. It is started on demand by dashboard or installed skill entry
points, retained outside removable worktrees, and independent of Vite/browser
lifetime. A private per-user local endpoint and singleton lease identify one
owner. Clients verify protocol/runtime compatibility and project/session
binding before acknowledgment. A retained installed launcher watches the runtime child and restarts a failed
owner with bounded backoff. The launcher does no provider observation or AI
work. Replacement verifies the old owner and its exact upstream children have
ended/reconciled, then takes a fenced generation; PID existence alone is not
ownership. Launcher loss/reboot is resumed by the next installed, status or
dashboard entry. That unobserved interval remains a visible gap, reconciled
before completion; no unattended reboot-resurrection promise is inferred.

Reuse existing machine-JSON write discipline and mailbox ordered records,
extending them for recoverable ownership rather than inventing a second
journal. Keep native session identity/continuation in one retained session
representation: evolve current launch persistence to accommodate standalone
origin without fabricating a dashboard launch request. Subscription records
reference that binding. For a claim accepted before native launch, retain a
pending binding by the existing execution/start identity, reusing pending-native
reporting semantics. Store coverage while delivery is held, then bind exactly
the launched recipient; never discover a newest session by story/repository.
An authorized coordinator transfer requires a new binding generation preserving
obligations and revoking the old route, not silent rebinding. Dashboard launch/report receipts stay adapters of their
current authorization contract, not a competing CI registry. Active obligations
pin required records past normal retention.

The local protocol accepts fixed domain operations, not arbitrary commands,
paths or upstream URLs. Preserve the dashboard's loopback/same-origin/project
refusal. Standalone enrollment verifies repository, execution ownership and
native recipient through the installed entry path. Authenticate local callers,
protect endpoint/state for the same OS user, and keep credentials out of
receipts, browser state and persisted request keys.

### Domain-to-code responsibility map

New module names below are proposed responsibilities, not existing files.
Place shared runtime sources/dependencies in the declared installed payload;
use the existing execute-plan script graph unless modularization proves a
narrower shared home. Dashboard and host imports consume it, never copy it.

| Story concept | Existing candidate and planned ownership |
| --- | --- |
| Session binding | `dashboard/src/sessionReference.ts`, `hostSession.ts`, host identity and continuation modules. Expose the shared installed contract once; generalize retained session storage for standalone origin. Host adapters own native route validation. |
| Monitoring subscription | `ci-observer-owner.mjs`, `ci-mailbox-store.mjs`, `ci-mailbox-revision-coverage.mjs`, `launchRecordStore.ts`/`machineJsonStore.ts`. A runtime supervision module owns subscription transitions; mailbox compatibility reads do not claim it as a host-hook observer. |
| Accepted publication | `execution-increment-delivery.mjs`, `execution-increment-resume.mjs`, `history-preserving-publication.mjs`, installed landing/closure receipts. Retain operation ID, accepted evidence and publication sequence outside the worktree; registration recovers from these receipts. |
| CI evidence | `watch-ci-execution.mjs`, `ci-runs.mjs`, `ci-failures.mjs`, applicability/coverage classifiers. Reuse normalization and classification; separate shared acquisition evidence from per-subscription delivery dedup. |
| Failure delivery | Current Codex first-input intent/reconciliation, Claude attachment, Cursor terminal transport behind one session delivery port. Runtime owns durable delivery intents; hosts return accepted evidence, refusal or uncertainty. |
| Failure disposition | Existing `ci-monitor.md` handling and repair publication. One installed reporting operation records disposition/repair links; the supervisor does not diagnose test defects or invent repair authority. |
| Completion boundary | Existing completion record/report and `trunk-closure.mjs`/wrap-up integration. One runtime completion decision uses explicit acknowledged-publication fence and generation. Dashboard quiet-Done projection consumes that result. |
| Retirement request | `dough-land/scripts/worktree-retirement.mjs`; retain repository management context and closure authority outside the checkout. No duplicate cleanup checks in dashboard/runtime. |
| GitHub request admission | `ghRead.ts`, `ReadAdmission`, `OutstandingReads`, `ghAnswer.ts`, `rateLimitDirection.ts`. Extract once into installed transport ownership used by all Open Dough consumers. Dashboard keeps source admission, immutable caching, timing and rendering adapters. |

### GitHub transport and ownership

One runtime process owns admission state, keyed by API host and effective
principal with resource-specific limits. Authentication binding is established
once and revalidated on a credential/account change; sharing admission is not
sharing answers across incompatible permissions. Request keys include the
actual authorization context without secrets. Separate sessions, projects,
dev/production dashboards and worker processes cannot create private copies
of the same allowance controller. Other machines/tools remain outside its scope.

Use explicit separately admitted `gh api --include` requests for CI provider
transport, including each pagination page and failure logs. Opaque `gh run`
commands cannot be counted as one HTTP request or reliably expose rate-limit
headers. Resolve workflow once per valid binding, then preserve existing
workflow/run/attempt/job and applicability semantics. Agent diagnostic reads
must use the same installed diagnostic path; leaving `gh run view --log-failed`
in shared guidance would bypass admission.

Reuse the current eight-turn concurrency, directed cooldown, exponential
fallback and one recovery probe. Persist active cooldown before acknowledging
rate-limit outcome, and carry it through runtime replacement. Retain ownership
of actual upstream children; replacing a killed broker cannot open eight new
turns while eight orphaned old requests still run. Reconcile or terminate exact
owned children before reopening admission. Credential changes requalify pending
requests and reject stale incompatible live answers while preserving existing
user-owned private immutable-content cache retention. Preserve individual
waiter cancellation/bounds: dashboard shutdown ends its waiters, not standalone
subscriptions. A known hold suspends acquisition to its allowed time rather
than incrementing the observer's three-error counter. Registration can request
one shared recheck but cannot bypass admission. Poll only while unsettled
obligations need acquisition; dormant enrollment needs no periodic GitHub reads.

Share acquisition by repository/target/provider/auth context and cadence where
requests are equivalent; keep subscription evidence and delivery ownership
separate. A failure seen by one subscription cannot suppress another's event.
Pending/no-run evidence remains refreshable; terminal evidence is attempt-specific
and later attempts remain discoverable. Stop acquisition only when no subscriber
needs it. Preserve bounded observation and visible budget expiry.

### Publication, completion and native delivery integrity

Retain publication intent before push, exact accepted receipt after confirmed
acceptance, and idempotent registration before coverage acknowledgment. Resume
never infers publication from current HEAD or a moving target tip. Completion
submits the acknowledged publication IDs/targets and a generation; service
arrival order or alphabetic coverage filenames cannot establish the final SHA.
Reserve the next boundary generation before admitting repair work or a new
publication, so runtime settlement cannot race an active writer. An accepted
repair then binds that generation to its new acknowledged publication fence. Recover missing registration instead of fencing past it.

Every covered publication needs applicable terminal evidence or a disposition
per existing guidance; the final boundary needs affirmative effective success.
Unresolved older failures, missing evidence, uncertain delivery and attention
hold settlement. A failure disposition may link an owned repair, whose relevant
CI must settle; a newer unrelated green publication is insufficient. Preserve
ignored-only basis, incomplete/cancelled and infrastructure/flaky-test rules.

Write a stable failure delivery intent before the native call. Serialize sends
per recipient; confirm native acceptance with turn/message/history evidence.
Replayed events with accepted receipts are suppressed. Possible acceptance with
missing acknowledgment enters reconciliation; if the host cannot establish the
answer, hold uncertain delivery without blind retry. Avoid a claim of exactly
once across the native-call/storage crash window. Do not replace a session,
fork a running Claude session, overwrite a developer's composer, or inherit
Cursor Recover's replacement fallback. Host capability is specific to native
session form and continuation route, not just a host-name boolean.

Only actionable CI failure starts an agent turn. Coverage, throttle and
retirement gaps remain visible for developer judgment. Delivery/repair authorization has a durable generation, rechecked at dispatch.
Stop/delete revokes it before later sends. Already-dispatched input cannot be
promised recalled: retain accepted/revoked-after-dispatch or uncertain evidence
and reconcile it without resending. A missing worktree or session yields a gap;
supervision never recreates them. A retirement permit uses the same per-execution
transition serialization as publication/repair admission, so active owned writers
or a newly reserved generation prevent cleanup.

## Premises, observations and open native proof

Evidence below was read in the preparation checkout at `030446f5`; inspections
locate reusable boundaries but do not establish new behavior. Native feasibility
is deliberately bounded by plan 299's slice 1; no native wakeup pass is claimed.

| Premise / consuming operation | Literal observation and consequence |
| --- | --- |
| Current dashboard admission and cancellation are reusable contracts | In this workspace: `env -u NO_COLOR npm run test:dashboard -- authenticated-read-turns.spec.ts authenticated-read-shared-waiters.spec.ts` → exit 0, seven tests through the real local HTTP boundary and synthetic `gh`. Covers eight slots/FIFO, cancellation/bound before admission, other-waiter preservation, last-waiter cancellation/retry and shutdown. Does not prove cross-process ownership. |
| Current CI bypasses dashboard throttling | `ci-runs.mjs` directly invokes `gh`; `ghRead.ts` has process-local singleton admission/coalescing. Code path inspection: hosted mailbox spawning alone cannot deliver shared throttling. Slices 2–6 replace that responsibility. |
| Opaque CLI commands expose several upstream operations | Current `ci-runs.mjs` uses `run list/view`; headers are only included for `api` by `ghRead.ts`. Exact installed HTTP-cost behavior remains unmeasured; slice 3 proves separately admitted API pages with an instrumented provider instead of assuming CLI call count. |
| Durable observer restart needs more than retained SHA files | Startup filtering drops older completed runs; tracked attempts and failure dedup are memory state; coverage filenames sort by SHA. Inspection rejects reuse of startup filtering as recovery or sorted filenames as publication order. plan 299's slices 2–3 reconcile exact outstanding registrations. |
| Existing publication resume/classification is a usable entry point | Current scripts retain accepted revision and inject acquisition/coverage. `node --test src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-resume-ownership.test.mjs src/skills/dough-execute-plan/scripts/ci-command-adapter.test.mjs` in this checkout → exit 0, four tests. Another target owner is not adopted; command-provider pending/success, opaque attempt retention and startup history behavior reach their fixtures. New supervision is owned by plan 299's slices 2–3, not an inherited pass. |
| Native idle/busy delivery and standalone binding | Cheap presence/help checks found Claude 2.1.296 (`--bg`/`--resume`), Codex CLI 0.162.1 (App Server daemon/proxy and native listen transports), Cursor desktop 3.24.12 and agent CLI 2026.10.01-e373342 (`--resume`). These are candidate routes, not observed same-session delivery. plan 299's slice 1 must establish exact recipient, accepted input and safe busy/idle handling for each promised mechanism before its dependent slice. |
| Installed runtime and state must survive worktree/dashboard removal | Reporting already retains installed entry support outside the checkout; that alone proves neither daemon lifetime nor split-brain fencing. plan 299's slice 2 owns new enrollment/lifetime fault proof; installation self-containment is included in its proof. |
| Final integration receipt must remain the owner's publication | `history-preserving-publication.mjs` returns to execution branch; already-accepted recovery can return fetched tip with null receipt. plan 299's slice 8 recovers the owned integration evidence and authorized trunk repair route rather than consuming that tip as completion. |

Cheap proof routes: existing dashboard specs ran from this owned checkout with
temporarily reused local dependencies, no native agents or real GitHub reads.
The default sandbox refused localhost listening; scoped test escalation and
removing conflicting `NO_COLOR` made the runner usable. Temporary dependency
symlink was removed. Paid native parts remain with explicit native-check authority.

## Ordered slices

Slices keep the numbers of the original plan. All are done.

### 2. Expose one installed GitHub request implementation
Type: Structure
Status: done

Delivered: `src/skills/dough-execute-plan/scripts/github-requests.mjs`
(`GitHubRequests.request(args, signal)`) with `github-request-admission.mjs`,
`-answer.mjs`, `-outstanding.mjs` and `-rules.mjs`, declared in `install.sh`.
`dashboard/server/ghRead.ts` and `ghFailure.ts` are its dashboard adapters; the
four former dashboard modules are removed. Accepted proof: whole dashboard
suite (`env -u NO_COLOR npm run test:dashboard -- --reporter=line`, 1470
passed), `node --test` on `github-request-answer.test.mjs` and
`github-requests.test.mjs` (17 passed), `npm run typecheck:dashboard`, and
`bash tests/execution-payload-update.sh`, which loads the installed module and
fails when a dependency is left undeclared.

Internal result: move the existing admission, answer/rate-limit interpretation
and outstanding-request lifecycle into one payload-owned runtime source.
Dashboard callers use its adapter; preserve current external behavior and
immutable answer-cache/source validation ownership.

Proof: existing admission/shared-waiter/shared-failure/limit-recovery specs
through their HTTP boundaries plus focused contract tests for extracted answer
classification. Every current `execGh` caller still reaches the one source;
static import/dependency checks complement, rather than replace, runtime proof.
Preserve installation/update self-containment for the moved dependency graph.
Immediately enables slice 3; do not add a second local admission class.

### 3. Ask GitHub for CI evidence through admitted API requests
Type: Behavior
Status: done

Delivered: `ci-github-actions.mjs` holds the CI engine's one `GitHubRequests`
instance and its `repos/OWNER/REPO/actions/` routes (workflow, run listing,
run, attempt, paginated attempt jobs, job log); `ci-runs.mjs` and
`ci-command-adapter.mjs` each offer one acquisition factory to
`watch-ci-execution.mjs`. A hold emits `CI_MONITOR_THROTTLED` and sleeps to
the directed time within the budget. `ci-github-diagnostic.mjs` offers
`failure OWNER/REPO RUN_ID ATTEMPT` and `workflow OWNER/REPO`; `ci-monitor.md`
and `runtime-setup.md` name it. Accepted proof: `node --test
src/skills/dough-execute-plan/scripts/*.test.mjs` (638 passed), notably
`ci-github-acquisition.test.mjs`, `ci-github-diagnostic.test.mjs` and
`watch-ci-execution-hold.test.mjs`; `bash scripts/test.sh
tests/execution-payload-update.sh tests/payload-declaration-links.sh
tests/install-public-payload.sh tests/update-removes-dropped-files.sh`; and a
read-only run of both diagnostic subcommands against the real `gh`. Measured
for one failed run with a prior attempt and 150 jobs plus one diagnostic:
before, 4 unadmitted `gh run` invocations of unobservable HTTP cost; after, 8
admitted API requests (observer 5, diagnostic 3).

Result: the installed CI engine's GitHub default acquires discovery, attempt,
jobs, applicability and failure diagnostics as explicit `gh api` requests
through the one request source, each pagination page admitted separately. One
observer process holds at most eight calls, a rate-limit answer suspends its
acquisition until the directed time instead of counting toward the
three-error loss path, and identical pending acquisition costs once. Agents
read failed-job diagnostics through one installed diagnostic entry instead of
`gh run view --log-failed`. Sharing across processes arrives in slice 4.

Proof: the installed observer and diagnostic entry against an instrumented
synthetic `gh` that counts upstream requests per route and page; run,
attempt, job and applicability normalization and provider-specific rules stay
as their existing tests observe them. Zero calls during a hold, one recovery
probe after it, and hold reported as suspension. No `gh run` invocation
remains in installed scripts or shared guidance (`ci-monitor.md`,
`runtime-setup.md`). Report measured request counts for an equivalent
discovery/attempt/jobs/diagnostic workload before and after. Guidance
behavior review follows repository `AGENTS.md`.

### 4. Share one machine owner of admission across processes
Type: Behavior
Status: done

Delivered: `github-request-owner.mjs` is a detached, on-demand owner running
`AdmittedCalls` (`github-request-calls.mjs`); `GitHubRequests` is the consumer
side over a Unix socket (`github-request-owner-link.mjs`, `-wire.mjs`) in a
0700 per-user directory with a token record (`-endpoint.mjs`). Default root
`/tmp/dough-github-requests-<uid>`, beside the CI mailboxes, overridable with
`DOUGH_GITHUB_REQUEST_OWNER_ROOT`. Consumers whose `gh` or login settings
differ get separate owners. No private fallback: an unreachable owner is a
failed read. The owner ends five seconds after its last consumer unless a hold
stands. Accepted proof: `github-request-owner.test.mjs`,
`github-request-owner-endpoint.test.mjs`, `github-requests-real-gh.test.mjs`
(installed `gh` against a loopback provider) and
`dashboard/tests/shared-request-owner.spec.ts` within the whole script
directory (647 passed) and whole dashboard suite; the install, update, payload
and release shell tests; one real read through the default endpoint. Measured:
two dashboards reading ten records plus the CI engine's workflow read cost 11
requests, eight at GitHub at a time; five processes asking one call cost one;
after a limit, zero from every peer and then one probe.

CI repair recorded here: run 38112217052 on `93f43b59` failed
`agent-completion-quiet.spec.ts` and `agent-completion-recovery.spec.ts`
because slice 3 left `dashboard/tests/support/completionCi.ts` answering
`gh run` JSON. This slice's publication carries the converted fixture.

Result: two dashboard processes and the CI engine ask GitHub through one
on-demand machine runtime behind `GitHubRequests.request`, reached over a
private per-user local endpoint with one owner. They share eight turns,
cooldown, the single recovery probe and identical pending acquisition. A
caller's cancellation or bound ends only its wait; dashboard shutdown ends its
waiters, not another consumer's. Failed-read diagnostics still reach the
asking dashboard process. Each existing observer remains its single current
owner until plan 299's slice 9 activates the transfer staged and proved in plan 299's slice 2.

Proof: separate OS processes — two dashboard servers through their HTTP
boundary and the installed CI acquisition — against one instrumented provider:
eight combined upstream calls maximum, a limit met by any consumer holds every
peer with zero calls, one recovery probe, identical pending acquisition costs
once, cancelling one waiter preserves another, concurrent first entry yields
one owner, and a registration-like recheck cannot bypass cooldown. The endpoint
accepts only the fixed request operation and refuses another OS user's or an
unauthenticated caller. Run one real `gh api --include` route against a local
provider where the installed `gh` can reach it, to prove header/result
interpretation; otherwise name that as a gap. Existing dashboard reader specs
stay green. Update `dashboard/GITHUB-REQUESTS.md` ownership/cost descriptions
with measured counts.

Launcher supervision, restart and enrollment stay with plan 299's slice 2; this owner
starts on demand and ends when idle or is replaced under slice 6.

### 5. Scope allowance and answers by API host and principal
Type: Behavior
Status: done

Delivered: one owner process per allowance scope. A consumer learns its scope
locally — API host plus an HMAC, under the per-user naming key, of the token
its own `gh auth token` yields — and the endpoint directory carries that name;
every wire request names its scope and an owner refuses another. A cheap
signature (the `GH_*`, `GITHUB_*` and `DOUGH_GITHUB_*` environment and the
stat of gh's `hosts.yml`) triggers re-resolution. After a switch, owner and
consumer both discard answers asked under the earlier login and the consumer
asks again under the new one; a hold stays with its login. Each owner keeps
one admission per resource (`core`, `search`, `graphql`, by route). Wire
protocol 2. Accepted proof: `github-request-login.test.mjs` and
`github-request-login-secrecy.test.mjs` within the whole script directory
(654 passed), the whole dashboard suite (1474 passed), typecheck, and the
install, update, payload and release shell tests.

Result: admission state is keyed by API host and effective authenticated
principal with resource-specific limits, and request keys carry the
authorization context without secrets. A credential or account change
requalifies pending requests and rejects stale incompatible live answers;
existing user-owned private immutable-content cache retention is unchanged.

Proof: through the slice 4 owner with a synthetic `gh` whose principal and
permissions change: two principals' limits do not hold each other, the same
principal from two processes shares one allowance, a switch or rotation while
requests are pending delivers no old answer to the changed binding, restart
under the changed binding shares nothing incompatible, and no credential
appears in receipts, persisted keys or browser state. Dashboard
immutable-cache specs stay green.

### 6. Keep the hold and owned calls through owner replacement
Type: Behavior
Status: done

Delivered: `github-request-kept-admissions.mjs` stores each resource's wait as
`hold.<resource>.json` in the scope's endpoint directory (draft, fsync, rename,
directory fsync) before any answer reveals it; a wait that cannot be stored is
answered `failed` and told to nobody. `github-request-owned-calls.mjs` records
each running `gh` child as `call.<generation>.<pid>.json`; a replacement, after
claiming its generation and before admitting, ends each earlier child it can
identify by pid, command line and start time, and lets one it cannot inspect
occupy a turn. An overtaken owner asks nothing more. Waiters of a killed owner
get `failed`. Accepted proof: `github-request-owner-replacement.test.mjs`,
`github-request-owned-calls.test.mjs` and
`github-request-kept-admissions.test.mjs` within the whole script directory
(671 passed), full `npm test`, the whole dashboard suite (1474 passed) and
typecheck.

Owners are per allowance scope and several may live at once: persist each
hold with its endpoint directory and resource, and reconcile each owner's
children within its own directory.

Result: an active cooldown is persisted before its rate-limit outcome is
acknowledged and survives owner restart; a replacement owner reconciles or
ends the exact upstream children of the old owner before admitting new work.

Proof: kill the owner with eight held upstream calls — its replacement admits
nothing until those exact children are ended or reconciled, then at most
eight; PID existence alone is not treated as ownership. Restart during a hold
makes zero calls until expiry and then one recovery probe. Interrupt the
cooldown write: no acknowledgment precedes durable storage. Waiters of the
killed owner get an explicit failure or reattach, never a stale answer.
Finish `dashboard/GITHUB-REQUESTS.md` restart and ownership wording.

Slices 3–6 use no production GitHub credentials and no extra live requests.

## Execution complete

Product advice: The retrospective found no broken promise of this story.

- Its one behavior correction is planned as
  [SEED-063#request-owner-says-why](../300-request-owner-says-why/PLAN.md): a
  request that never reached `gh`, or a failed log that cannot be read, should
  say why. It is not queued; queue it ahead of the next release of this
  payload if agents are to diagnose a sandboxed or mismatched owner unaided.
- Before a release carries this payload, observe one sandboxed host reaching
  the request owner (obligation G11, kept by plan 299). An observer that cannot
  reach it loses coverage visibly after three failed reads.
- The dashboard reads the request source from its checkout while observers
  run the installed payload, and both use one endpoint directory per login. A
  later owner-protocol change makes the later starter's reads fail while the
  other's owner lives. Plan 299 keeps the decision whether the protocol belongs
  in the directory name.
- The CI mailbox root `/tmp/dough-ci-<uid>` is created without the ownership
  and mode check the new request-owner root has. That is an older weakness and
  a backlog candidate.
- `install.sh`'s declaration list and `references/ci-monitor.md` sit at the
  250-line limit and were packed to stay there. Whether the limit should apply
  to them is Terry's decision.

## Execution state

Story Branch Mode in `.worktrees/monitor-ci-in-the-background-and-wake-execution`
on `claude/monitor-ci-in-the-background-and-wake-execution`; remote `origin`,
trunk `main`. Claim `eac731e5a4d0e5082aef73a2766b7694eefcbe3f` accepted on
`main` (starting revision `7e212a019295f5e86e5639ec61def0c873828a2d`). CI
source: GitHub Actions default. Overrun replanning is allowed.

Published on the execution branch: `b5cb2f7b` (slice 2), `6054dbd1` (plan
refinement), `93f43b59` (slice 3), `c6c8f9d6` (slice 4), `deb540bb` (slice 5),
`f9ef7368` (test-isolation repair), `752f8606` (slice 6), `51980e45` and
`f1345331` (test repairs). CI passed on `f1345331` (run 38135393039).

## Story obligations

### G1. Installed CI requests bypass the shared request source
Reported: slice 2 — "No installed CI script imports the new modules yet, so installed-runtime use is proven only by the module-load check."
Story clause: "one admission owner per allowance scope"
Disposition: proved by slice 3: src/skills/dough-execute-plan/scripts/ci-github-acquisition.test.mjs "the observer asks GitHub one admitted API request per route and page" and "no installed file asks gh outside the one request source or names a gh run command"; tests/execution-payload-update.sh runs the installed observer and diagnostic against a logging gh

### G2. Admission state is process-local and unkeyed
Reported: slice 2 — "the outstanding-call key is `JSON.stringify(args)` only, with no API host or principal, and `ReadAdmission` is a single allowance."
Story clause: "Cooldown, concurrency and recovery are shared across dashboard processes and standalone subscriptions."
Disposition: proved by slice 5: src/skills/dough-execute-plan/scripts/github-request-login.test.mjs "each API host and login has one endpoint, whether a token variable or gh's stored login names it" and "one login's rate limit holds back its processes however they come by it, and no process of another login"

### G3. Admission and outstanding classes have no isolated unit tests
Reported: slice 2 — "`ReadAdmission` and `OutstandingReads` have no isolated unit tests."
Story clause: "Cooldown, concurrency and recovery are shared across dashboard processes and standalone subscriptions."
Disposition: proved by slice 2: dashboard/tests/authenticated-read-turns.spec.ts, authenticated-read-cooldown.spec.ts, authenticated-read-backoff.spec.ts and limit-recovery-check.spec.ts exercise eight turns, cooldown, backoff doubling and the single recovery probe through the dashboard HTTP boundary on the moved source

### G4. Diagnostic excerpt lacks per-step log attribution
Reported: slice 3 — "The job-log route has no step attribution, so the excerpt is the lines around `##[error]` markers (or the last 40 lines) plus failed step names from the jobs answer."
Story clause: "failure-diagnostic requests pass through"
Disposition: no user cost "Open Dough monitoring and dashboard reads share one GitHub request-admission owner on this machine.": the excerpt keeps the error-marked lines and the failed step names, which a real failed run showed sufficient to classify; a missing or oversized log is reported as `logUnavailable`, never as evidence

### G5. Diagnostic entry does not share the observer's hold
Reported: slice 3 — "A rerun in a new process probes immediately because the cooldown is not shared or persisted (G2)."
Story clause: "Cooldown refusal costs no upstream call."
Disposition: proved by slice 4: src/skills/dough-execute-plan/scripts/github-request-owner.test.mjs "a rate limit one process meets holds back every other process unasked, a newly started diagnostic entry included"

### G6. Workflow selector no longer accepts a display name
Reported: slice 3 — "`gh run list --workflow` also accepted a workflow display name; the API route takes only a filename or numeric ID."
Story clause: "Reuse the installed non-AI observer and provider classification."
Disposition: no user cost "Open Dough monitoring and dashboard reads share one GitHub request-admission owner on this machine.": the documented selector was already a workflow filename or ID, an unknown selector fails visibly at setup with HTTP 404, and the default `ci.yml` is unaffected

### G7. Native closure fixtures converted without their native journeys
Reported: slice 3 — "I converted their `gh` shims and only checked the shims' answers per route with a standalone script, not the native journeys."
Story clause: "Paid native runs require explicit native-check authority"
Disposition: excluded "Paid native runs require explicit native-check authority and are outside this story and routine CI."

### G8. A long limit can repeat the throttling advisory
Reported: slice 3 — "A long-lived limit with short directed waits could produce several advisories."
Story clause: "Throttling suspends acquisition visibly"
Disposition: no user cost "Open Dough monitoring and dashboard reads share one GitHub request-admission owner on this machine.": the advisory alone never blocks Stop or starts a turn (`ci-host-hook-discovery-advisory.test.mjs`), and each one reports a real suspension

### G9. No connection from a real second OS user was run
Reported: slice 4 — "A real second-user connection was not run."
Story clause: "Scope is Open Dough requests on this machine"
Disposition: proved by slice 4: src/skills/dough-execute-plan/scripts/github-request-owner-endpoint.test.mjs observes refusal of a foreign owner, group or other access and a non-directory, and "a consumer whose endpoint is open to other users is answered as failed, asks nothing and starts no owner"; the 0700 directory leaves the rest to the operating system

### G10. Owner kill loses the hold and is untested mid-request
Reported: slice 4 — "The hold is still lost on owner kill or reboot (slice 6)."
Story clause: "Restart cannot reset a hold"
Disposition: proved by slice 6: src/skills/dough-execute-plan/scripts/github-request-owner-replacement.test.mjs "a rate limit's wait is stored before it is answered and holds back each owner started after the one that met it was killed" and "an owner killed with eight calls at GitHub is replaced by one that ends those eight before it asks anything"

### G11. A host that cannot reach the endpoint fails every CI read
Reported: slice 4 — "An observer in a sandbox that cannot write `~/.open-dough`, connect to a Unix socket, or spawn a detached process will see every request fail as `gh failed` and hit the three-error path."
Story clause: "Missing observation or delivery is visible, never success."
Disposition: excluded "Observation from a sandboxed host that cannot reach the owner's endpoint is proved there."

### G12. Mixed installed protocol versions fail every read
Reported: slice 4 — "A consumer with an older installed protocol fails every read while a newer owner lives, and vice versa."
Story clause: "Mixed installed versions and an owner started before an update are proved there."
Disposition: excluded "Mixed installed versions and an owner started before an update are proved there."

### G13. Default owner timings and failed-read notice details are unexercised
Reported: slice 4 — "The 30 s start limit, the default 5 s idle and the 10 s first-consumer grace (only 100 ms idle is exercised)."
Story clause: "Cooldown, concurrency and recovery are shared across dashboard processes and standalone subscriptions."
Disposition: no user cost "Open Dough monitoring and dashboard reads share one GitHub request-admission owner on this machine.": the limits are constants on the paths the 100 ms runs exercise, and the changed failed-read notice fields keep `authenticated-read-diagnostics*.spec.ts` green

### G14. One account reached by two tokens has two allowances
Reported: slice 5 — "Same account, two different tokens is two scopes; the account behind a token cannot be learned without a GitHub request."
Story clause: "one admission owner per allowance scope"
Disposition: no user cost "Open Dough monitoring and dashboard reads share one GitHub request-admission owner on this machine.": dashboards and observers of one developer resolve the same stored or exported token and so one scope; learning the account would cost a GitHub request per process, and answers stay correctly separated

### G15. Some login changes are noticed only at process restart
Reported: slice 5 — "A keyring-only token change that does not rewrite `hosts.yml`, and the Windows config location, are not picked up until the process restarts."
Story clause: "Changed authorization cannot reuse incompatible live acquisition answers"
Disposition: excluded "Login changes that rewrite no gh configuration are proved there."

### G16. A discarded stale answer leaves no dashboard diagnostic
Reported: slice 5 — "A discarded stale answer is not recorded in the dashboard's failed-read history."
Story clause: "Changed authorization cannot reuse incompatible live acquisition answers"
Disposition: no user cost "Open Dough monitoring and dashboard reads share one GitHub request-admission owner on this machine.": the discarded call is asked again under the new login and its reader receives that answer, so no read failed

### G17. Paid native fixtures' gh shims may not answer the login read
Reported: slice 5 — "I did not check whether their `gh` shims reach the request owner. If they do, each needs the same `auth` early exit."
Story clause: "Paid native runs require explicit native-check authority"
Disposition: excluded "The paid native fixtures' gh stand-ins are exercised there."

### G18. Child identity through Linux ps was not run locally
Reported: slice 6 — "the Linux `ps` path was not run locally (the Docker VM's storage is broken), so CI's Ubuntu jobs will be its first exercise."
Story clause: "leave uncounted upstream children alive"
Disposition: proved by slice 6: CI run 38134105125 on `752f8606` passed all three Ubuntu `test` jobs, which run `github-request-owned-calls.test.mjs` and `github-request-owner-replacement.test.mjs` against procps `ps`

### G19. A reboot that clears the endpoint root loses the hold
Reported: slice 6 — "A reboot that clears `/tmp` still loses the hold, because of where the root lives; the docs say so."
Story clause: "Restart cannot reset a hold"
Disposition: no user cost "Open Dough monitoring and dashboard reads share one GitHub request-admission owner on this machine.": a hold lasts at most an hour, and after such a reboot the first request GitHub still refuses stores the hold again, so the cost is bounded to that one refused request

### G20. Two narrow windows can leave one call uncounted
Reported: slice 6 — "An owner killed between spawn and the record write (same tick) leaves one unrecorded child."
Story clause: "leave uncounted upstream children alive"
Disposition: no user cost "Open Dough monitoring and dashboard reads share one GitHub request-admission owner on this machine.": the window is one synchronous step of one call, which then ends at its own bound; no test can place a kill inside it and no held request is repeated

### G21. A stopped owner that still accepts connections is not replaced
Reported: slice 6 — "A stopped owner whose socket still accepts connections is not replaced. This predates the slice."
Story clause: "An owner that has stopped but still accepts connections is replaced there."
Disposition: excluded "An owner that has stopped but still accepts connections is replaced there."

### G22. An owner from before an update serves without persistence until idle
Reported: slice 6 — "An owner from before this slice that is still running after an update serves without persistence or child records until it idles out."
Story clause: "Mixed installed versions and an owner started before an update are proved there."
Disposition: excluded "Mixed installed versions and an owner started before an update are proved there."

## Proof ownership and acceptance

| Source promise / constraint | Decisive owner |
| --- | --- |
| One installed request source for dashboard and CI | 2 preserved dashboard contracts; 3 admitted CI requests and diagnostic entry |
| Shared turns, cooldown, recovery probe and identical pending acquisition across processes (key example) | 4 mixed cross-process request counts |
| Allowance and answers scoped by API host and login; no credential stored or sent | 5 login scope, switch and secrecy tests |
| Restart cannot reset a hold or leave uncounted upstream children (constraint 1) | 6 kill-and-replace tests |
| Shared source and installed dependency closure | Each slice's import review; installed-payload checks in `npm test` |

Deterministic provider fixtures stay in CI. Every test with a `gh` stand-in
uses a private request owner; the runner and the dashboard teardown fail a
run that asks GitHub without one.

## Current decisions

- One request owner process per API host and login, on demand, under
  `/tmp/dough-github-requests-<uid>`; Terry confirmed both on 2026-10-11.
- The admission, answer and outstanding-call logic lives once in the installed
  execute-plan scripts; dashboard and CI engine are consumers.
- No private fallback: an unreachable owner is a failed read.

## Learnings

- 2026-10-11: old plan's separate dashboard mailbox root would isolate hooks
  but not GitHub throttling or standalone wakeup. Code-sharing alone cannot
  share admission state across processes; one request owner is needed.
- 2026-10-11: older accepted failure and current completion fence are different
  facts. Sorted SHA files and fetched target tips cannot decide completion.
- 2026-10-11: native input acceptance, handling and CI repair need distinct
  durable evidence. Existing attach/Recover actions are not acceptance proofs.
- 2026-10-11 (slice 2): `GitHubRequests` adds `--include` only when the first
  argument is `api`; `gh run list/view` calls would pass unadmitted in effect,
  so slice 3 converts CI acquisition to `gh api` routes. A waiter's bound is
  classified as timed out only when it aborts with the payload's `GhFailure`.
  The dashboard's failed-read diagnostics rely on the `failed` observer running
  in the starting request's async context; a cross-process owner must carry
  that context explicitly.
- 2026-10-11: former slice 3 combined four proof loops — admitted CI API
  routes, a cross-process owner, principal scoping and replacement recovery.
  It is now slices 3–6 and former slices 4–12 are 7–15; no promise was removed.
- 2026-10-11 (slice 3): the CI engine's request owner is one module-level
  instance in `ci-github-actions.mjs` with `askGitHub` its only caller, so
  slice 4 swaps one place. Log reads need a 16 MiB answer bound that a
  cross-process owner must carry per request. `install.sh` and `ci-monitor.md`
  sit at the 250-line limit; the next payload file or guidance line needs a
  structural move.
- 2026-10-11 (slice 4): the endpoint root moved from `~/.open-dough` to
  `/tmp/dough-github-requests-<uid>` — a coordinator decision for Terry to
  confirm — so hosts that can already write CI mailboxes can reach it and the
  socket path stays within 103 bytes. plan 299's slice 10 must observe a sandboxed host.
  Owner records carry pid, protocol, token and a never-reused generation;
  withdrawing or overtaking a record ends that owner (slice 6's lever).
  Principal keying belongs in `AdmittedCalls.request` and can replace the
  directory fingerprint (slice 5). `AdmittedCalls` reports no timed-out call.
  Any test with a fake `gh` must set a private owner root and end its owner.
- 2026-10-11 (slice 3 acceptance): the dashboard completion specs consume the
  installed CI engine through their own `gh` fixture; a change to CI
  acquisition needs the whole dashboard suite, not only the reader specs.
- 2026-10-11 (slice 5): a process can authenticate only as its own
  environment's login and no credential may cross the endpoint, so the request
  owner is one process per allowance scope, not one keyed process. plan 299's slice 2's
  supervising runtime is therefore a client of the request owner of its own
  login and cannot supervise or restart "the" request owner; request owners
  stay on demand. Retrospective correction: installs speaking different owner
  protocols share one endpoint directory, since its name carries only the API
  host and login; the later starter is refused at greeting and every read of
  its fails while the other's owner lives (G12). Every fake `gh` must answer `auth` before it
  records, counts or blocks.
- 2026-10-11 (slice 5 refactor): `agent-completion-quiet-claude.spec.ts:195`
  failed once in a subset run under machine load with no error captured, then
  passed 20 consecutive repeats and the whole suite. Cause unknown; capture
  the error if it recurs.
- 2026-10-11 (repair after slice 5): CI run 38126614188 on `deb540bb` was
  cancelled at the six-minute job limit because
  `tests/git-publication-native.sh` and
  `tests/git-publication-native-owned-context.sh` asked their `gh` shims
  through no request owner of their own. `publishedMainFixture` leaked the
  same way. Each now has a private owner, and `scripts/test.sh` and the
  dashboard global teardown fail a run that asks GitHub without one. Slice
  acceptance for a change to the request path needs the full `npm test`, not
  only the install subset.
- 2026-10-11 (slice 6): an endpoint directory now holds `hold.*.json` and
  `call.*.json` beside `owner.*.json`; anything that enumerates or transfers it
  must carry or tolerate them. Request owners stay on demand: a replacement
  appears only when a consumer next asks. A consumer of a killed owner gets
  `failed` and must ask again.
- 2026-10-11 (repair after slice 6): CI run 38134105125 failed
  `agent-launch-acceptance-kept-first.spec.ts:154` in one dashboard job. The
  test compared the server's answer with the kept record while the separate
  settled-time write could land between the two reads. It now retries the
  comparison until both agree. The race does not involve the request owner.
- 2026-10-11 (second repair after slice 6): CI run 38134518549 failed
  `authenticated-read-diagnostics.spec.ts:83`, which answered two reads on a
  server with a 300 ms read bound; the rate-limited read now includes a `gh`
  spawn and the durable hold write and crossed that bound on a slow runner. A
  read's bound covering the whole call is designed, so the spec now uses the
  short bound only for the read meant to time out. A short `readTimeoutMs` is
  only for reads meant to time out.
