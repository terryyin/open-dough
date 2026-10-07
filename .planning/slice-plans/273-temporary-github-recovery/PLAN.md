# Recover automatically from temporary GitHub failures

**Identity:** SEED-118#recover-from-temporary-github-failures
**Source:** [refined story](../../seeds/SEED-118-dashboard-reading-reliability.md#recover-from-temporary-github-failures).
**Prepared:** 2026-10-07. Planning only in the established preparation workspace
on `codex/recover-automatically-from-temporary-github-fail`, under the preparation
assignment for `joey-chan`.

## Goal and boundaries

When an ordinary temporary GitHub failure leaves the dashboard empty or leaves
detail unread, a visible page recovers without reload or publication. Successfully
read facts remain useful; continuing failures and the next recovery time remain
explicit. A timeout or refusal establishes no absence and supplies no fact from
another revision.

Include all eight story examples and required behavior: evidence-based eligibility;
15/30/60-second backoff, thereafter at most one attempt per minute; recovery at
an unchanged revision; shared human-credit/Take evidence; retained successful
facts; hidden-page and observation lifetimes; existing rate-limit admission;
and locally inspectable, bounded, sanitized diagnostics.

Keep the story's exclusions: faster basic cards, request savings across tabs or
server replacement, persistent diagnostics, a diagnostics screen, metrics export,
proactive quota management, automatic access repair, and mutating-command retries.
The production report's uncaptured timeout and 403 remain unclassified; controlled
replays prove recovery behavior, not the cause of that report.

## Published baseline and integration context

The preparation checkout starts at `88a8c2b4da20464ecf2191d8e3b335644c0cb048`.
During planning, fetched `origin/main` advanced to
`f6f1cae8ca5b3300a5c11b76b45294a792695dff`, containing the delivered rate-limit
feature. The approach below targets that published implementation, not a second
implementation against the older checkout. No merge, commit, or publication was
performed during planning. Execution must reconcile the owned checkout with the
authorized remote through its ordinary startup/integration workflow, preserving
these planning records.

The active [rate-limit correction](https://github.com/terryyin/open-dough/blob/f6f1cae8ca5b3300a5c11b76b45294a792695dff/.planning/slice-plans/272-rate-limit-recovery-residue-correction/PLAN.md)
on published main owns unusable zero waits, reopening admission after a first
non-limit failure, and uniform limit labels. Its current observations reproduce
those defects. Do not assume those fixes are already delivered, duplicate them,
or turn their shared code into a blocking story prerequisite. Reconcile changes
through ordinary continuous integration, and keep both stories' proof aligned.
The linked plan is present on published main but not the older preparation base.

Plan number 273 follows 272, the highest allocation observed on fetched main;
271 was the highest in the preparation checkout. The candidate was unoccupied
in both before writing.

## Existing solutions and selected approach

PFE searched published-read producers, browser readers, fixtures and request
accounting, plus the watcher, completion-delivery and execution retry paths.
Those latter retries have publication/process lifetimes and cannot own a page's
read recovery. Their similarly named retry logic is not reused.

| Responsibility | Existing solution and decision |
| --- | --- |
| Recognize GitHub failure and direction | **Change** `server/ghAnswer.ts` and `readFailureMessage.ts`: extend the existing single failure description with safe recovery eligibility. `GhAnswer` already retains included status/headers. Never infer an upstream failure from the boundary's generic 502 or from rendered prose. |
| Own shared calls and admission | **Reuse** `OutstandingReads`, `spawnedGh`, and `ReadAdmission`. Recovery is a new observation request, not retries inside their call. No second semaphore, cooldown, or waiter owner. |
| Own browser failure and wait bounds | **Change** `authenticatedGet`, `ReadProblem`, and `withinReadWait`: carry validated failure meaning and distinguish the owned deadline from departure. Keep browser modules free of Node imports. |
| Decide when an observation reads again | **Change** `publishedObservation`, `limitRecovery`, `readingLimit`, and `revisionCheckSchedule` into one coordinated recovery path. Extend their ownership; retain the login-wide rate-limit record and project-local transient backoff as distinct facts. |
| Reuse successful immutable answers | **Reuse** `PinnedTexts`/`PinnedMemo`, browser file caching, and the memoized profile-history/commit walk. Moving refs and branch heads still require fresh evidence. |
| Retain facts and recover selected gaps | **Change** `snapshotRetrieval` and the normal requested-read/enrichment flow. **Gap:** one observation-scoped record of settled read outcomes is needed to retain successes and avoid repeatedly asking missing or terminally refused facts during recovery. This is not a process-wide failure cache. |
| Share credit and Take evidence | **Reuse** `profileAdditionsAt` and the existing addition walk. Both consumers wait on one addition promise per profile; answered walk steps remain in the pinned memo. |
| Inspect recent failures safely | **Gap:** no suitable upstream-read diagnostic history exists. Add one bounded in-memory history at the shared invocation and one guarded read-only response; reuse `verifyLocalOrigin` and configured-source admission. |

Follow [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md): feature-local
recovery design stays here and in maintained dashboard documentation. Follow
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
one representation for failure meaning, read outcomes, scheduling, and admission.
The index and in-file statuses agree: ADRs 0000–0006 are Accepted, 0007–0009
Proposed, with no relevant supersession or conflict. Preserve the existing
[North Star admission topic](../../NORTH-STAR.md#one-owner-admits-reads-to-github);
no new topic or ADR is needed.

## Current decisions

- Failure eligibility is typed data, produced at the existing failure boundary
  and validated at HTTP ingress. Recognized connectivity failures, owned
  timeouts, and upstream HTTP 408/500/502/503/504 are eligible. GitHub-marked
  limits and held-back reads use rate-limit recovery. Authentication, permission,
  unmarked 403, missing facts, invalid answers/records, and unknown failures do
  not become transient merely because another read is recovering.
- A page has one active observation and recovery schedule. Waits start after
  an attempt settles: 15, 30, 60, then 60 seconds. Each attempt retains the
  30-second bound, including admission waiting. No retry/check overlap, no
  catch-up burst, and no shortening a standing GitHub wait. Unrelated success
  or an unchanged check does not reset an unresolved failure's backoff.
- A recovery read may resolve the configured ref afresh, as existing rate-limit
  recovery does. At the same revision/head, retain answered facts while failed
  questions are retried. At a changed revision/head, use the ordinary provenance
  and replacement rules rather than projecting earlier facts onto it.
- Keep settled terminal failures/established missing results only within the
  active observation and pinned question. They remain explicit gaps or valid
  absence, as applicable. They are not durable facts or entries in the shared
  success memo. A new observation/revision invalidates their scope; an explicit
  fresh visit can try again after access is corrected.
- The outcome owner identifies a question by configured source, actual pinned
  revision/head when known, and existing read operation/path. Gap producers
  retain failure meaning even when the normal read finishes with explicit gaps.
  An outcome is settled only after the consuming reader validates its answer;
  HTTP success alone cannot establish a usable fact or hide an invalid answer.
  The page must not depend solely on a top-level rejected promise: credited
  humans, clocks, and done records often settle as gaps instead.
- Reuse the existing snapshot projection. Retain successful same-revision facts
  while recovery publishes progress, with generation/abort checks before each
  update. Keep the distinction between a finished read with labeled gaps and
  a fully answered recovery. Do not change startup reconciliation into proof
  that all detail exists or silently clear failures on a ref-check success.
- Diagnostics record one failed shared invocation, with its initiating configured
  source and fixed operation category. Carry safe context from the admitted
  reader without changing the sharing key; do not claim attribution to every
  waiter. Elapsed time measures the invocation actually started. A deadline
  before admission is not an upstream HTTP answer.
- The proposed diagnostic route is a same-origin, loopback GET at
  `/__authenticated-read-diagnostics?source=<configured-id>`. It returns that
  source's entries from the latest 100 failures across this process. Unknown
  sources and disallowed origins/methods are refused before any GitHub call.
  Diagnostics reads themselves ask GitHub nothing.
- Diagnostic strings are bounded and validated (at most 256 characters per
  textual metadata field); numeric values must be finite, nonnegative safe
  values. Whitelist status, GitHub request ID, rate-limit limit/remaining/reset/
  resource, and validated Retry-After only. Never retain bodies, credentials,
  raw CLI output, arbitrary headers, or caller-supplied command/path text.
  Missing metadata remains unknown. Cancellation is not a retryable failure.

## Decisive premises and observations

All runtime observations below used a temporary `git archive` export of
`f6f1cae8ca5b3300a5c11b76b45294a792695dff`, removed afterward. It had no Git
checkout or assignment. Its `node_modules` pointed at this workspace's offline
installation, Node `v24.5.0`; `package.json` and `package-lock.json` are unchanged
between the two revisions (`git diff --exit-code HEAD..origin/main -- package.json
package-lock.json`, exit 0). Planning records stayed in the established workspace.
Every page journey built the production UI and used its real local read boundary
and synthetic `gh`; only GitHub's answers were supplied.

| Premise | Consumed by | Observation and result |
| --- | --- | --- |
| An ordinary initial failure is not automatically recovered, including a browser-owned deadline. | Slice 1's trigger and replacement proof. | O1: `read-failure.spec.ts` holds the initial ref, advances the page deadline, releases it and advances time; only one ref read occurred until reload. Its connection-failure/reload journey also passed. Controlled discrepancy reproduced; no production cause inferred. |
| A core detail remains a gap at an unchanged revision and reload closes it. | Slices 2–3's recovery scope. | O1: `auto-refresh-detail-recovery.spec.ts` and `published-facts-failures.spec.ts` hold a canonical read through the core bound; unchanged checks read no content, retain the gap, and reload closes it. Ordinary canonical/profile/done failures retain independently completed facts. |
| A fresh read reuses successful upstream answers, but also re-asks missing or other failed questions. | Slices 2–3's selective outcome ownership. | O1: `reopened-project-reads.spec.ts` asserts successful pinned reads are not repeated and missing records are. `limit-recovery-detail.spec.ts` observes the normal fresh recovery also re-ask the unrelated unreachable seed. This is why simply scheduling a full reread is insufficient. |
| The existing addition walk can recover credit/clock without rereading answered history steps. | Slice 3's reuse and proof. | O1: `limit-recovery-credit-history.spec.ts` recovers the human on card, inspection and roster and its Take clock at the same revision; request assertions name only the ref, refused history, addition and an unrelated unread plan time. Read `profileAdditionsAt`, `PinnedTexts.additionOf`, and `ghProfileAddition` to locate the owners. Ordinary transient recovery is new proof, not established by this limited case. |
| Shared waiting belongs to requests, not the page that first asked. | Slices 1 and 4's cancellation rule; slice 5's diagnostic count. | O1: `authenticated-read-shared-waiters.spec.ts` passes one-waiter departure, last-waiter termination, later fresh request, and server shutdown with two waiters. |
| Admission is bounded, login-wide, and resumes through one first read; visibility and project isolation have usable real journeys. | Slice 4's preservation proof. | O2 passed 16 tests through real HTTP/page routes: cooldown, turns, resumption, visibility and project isolation. The turns case holds twelve calls and observes eight reaching GitHub, four waiting, and shutdown ending both groups. Known zero-wait/non-limit-resumption defects remain owned by plan 272, not assumed fixed by these regressions. |
| Every upstream call has one included-header/classification point. | Slices 1 and 5. | Read `git show origin/main:dashboard/server/ghRead.ts` and `:dashboard/server/ghAnswer.ts` at the observed revision: `includedArgs` adds `--include`; `spawnedGh` learns the answer once before releasing its turn. O1's authenticated boundary specs exercise the invocation and prove raw stderr/credential-like markers are withheld. |
| Failure meaning is currently lost before some gap projections and fresh reads rebuild pending facts. | Slices 2–3's structure and retained view. | Read `:dashboard/src/authenticatedGet.ts`, `:readWaitBound.ts`, `:repositoryFileReads.ts`, `:snapshotRetrieval.ts` and `:publishedWorkRead.ts`: HTTP parsing forwards message and limit time only; record gaps discard ordinary cause; fresh membership uses `awaitingOwners` and a new pending done set. Change these owners rather than assuming a reread preserves their projection. |
| The harness can supply failures and observe the actual consuming operations. | Every Behavior slice's proof entry. | O1/O2 use `dashboardTest` → built-preview boundary → synthetic `gh` → `asGhReply`. `RawAnswer` supports arbitrary status/headers, `CliAnswer` supplies fixed CLI failures, held-answer helpers delay responses, page clock advances page scheduling, and server read/admission time remains real. O1 passed 26 tests. |
| No upstream-failure history can be reused; local origin protection already has external proof. | Slice 5. | Product-wide search for diagnostics/eviction/history owners found watcher/CI/process-reporting mechanisms with different lifetimes, not this responsibility. Read `localOrigin` and `authenticatedRead.admitted`; O1's boundary tests retain the safe response, and `authenticated-read-refusal.spec.ts` is the existing origin/method/source proof consumer. |

O1 literal command, from the exported source root (exit 0, 26 passed, 15.8 s
including command startup):

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- --workers=2 --reporter=line read-failure.spec.ts auto-refresh-detail-recovery.spec.ts reopened-project-reads.spec.ts authenticated-read-shared-waiters.spec.ts limit-recovery-credit-history.spec.ts limit-recovery-detail.spec.ts authenticated-read-boundary.spec.ts published-facts-failures.spec.ts
```

O2 literal command, from the same exported revision (exit 0, 16 passed, 20.1 s
including command startup):

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- --workers=2 --reporter=line authenticated-read-cooldown.spec.ts authenticated-read-turns.spec.ts authenticated-read-resumption.spec.ts auto-refresh-visibility.spec.ts auto-refresh-project-isolation.spec.ts
```

No credentialed live GitHub probe is required for this plan. Classified fixture
failures establish the selected recovery journeys; newly recognized CLI forms
must have evidence and unknown forms stay non-retryable. No unobserved production
latency or workload premise is used.

## Outside-in proof ownership

| Final promise / source example | Owner | Observable proof |
| --- | --- | --- |
| Empty-page recovery, eligibility and access exclusions (1, 6) | 1 | Initial ref/backlog timeout, recognized connection and transient HTTP failures heal through the production page/boundary; refusals/invalid records never get automatic repeats. |
| Continuing backoff and honest failure/status (3) | 1 | Page clock proves no earlier call at 15/30/60/60-second settlement-based intervals; each attempt keeps its bound; eventual success clears only the recovered failure. |
| Same-revision groups, human/Take and successful-answer reuse (2) | 3, enabled by 2 | Held/refused canonical, profiles, history/addition, plan/progress/clock and done answers later fill their gaps; successful facts stay visible and upstream counts show only eligible gaps plus fresh moving-ref evidence. Credit and Take share one walk. |
| Missing/terminal facts are not looped by unrelated recovery (6) | 3 | One transient and one missing/access-refused/invalid detail coexist; transient heals while terminal detail retains its explanation without another upstream request for the same pinned question. |
| Hidden/revealed pages and shared wait lifetime (4) | 1 and 4 | No hidden demand or budget reset; one due reveal; departing one tab leaves another's shared request alive; final departure/shutdown terminates it. |
| Rate cooldown, process bound and unrelated projects (5) | 4 | Multi-page recovery obeys the reported time and existing first-read/eight-read admission; ordinary transient failure does not hold back another project. |
| Revision/head/project provenance and late-result rejection (7) | 4 | Hold A's recovery, move ref or watched branch or select another source, release the old answer; only current pinned facts appear and previous snapshot evidence stays honest until replacement. |
| Bounded diagnostic inspection and secrecy (8) | 5 | Guarded GET distinguishes timeout/unmarked 403/rate limit; 101 failures retain the newest 100; shared waiters produce one entry; adversarial headers/bodies/stderr cannot enter returned data. |
| Columns, inspection, focus and reconciliation retain meaning | 3 and 4 | Keep controls focused through partial recovery; unrelated group failure leaves successful facts usable; responsive launch-reconciliation consumers still settle from actual evidence. |

## Ordered slices

### 1. A failed initial read recovers on its own at a bounded pace
Type: Behavior
Status: planned
Proof: Extend `read-failure.spec.ts` and add `transient-read-recovery.spec.ts`;
run the real page/preview/boundary with controlled upstream failures and paused
page time. Include `auto-refresh-recovery.spec.ts` and the changed authenticated
failure-boundary consumers.

Behavior: No snapshot is shown → the ref/backlog read times out, loses its
connection, or receives an eligible HTTP refusal → the visible page says when
it will read again and automatically obtains membership when GitHub answers.
Repeated eligible failures wait 15, 30, 60, then 60 seconds after settlement.
Access, malformed-data and unknown failures remain actionable without a loop.

Carry the existing single failure classification as validated typed data through
the boundary and `ReadProblem`. Mark the browser-owned deadline distinctly from
caller departure; never classify from a 502 wrapper or human message. Extend the
existing observation/limit recovery schedule, not a second timer beside it.
Keep the 30-second bound, visible-only demand, cancellation, cooldown precedence,
and settled-read exclusion of checks from the outset. Existing snapshot recovery
and missing-detail automation remain for later slices.

Proof cases cover initial ref and pinned backlog, first and continuing failures,
an unrelated success that must not reset the failure's wait, unmarked 403/401/404,
invalid answers/records, and cancellation. Validate all eligible status classes
at the real HTTP boundary with focused cases; one representative journey owns
the timing rule. Preserve rate-limit responses and admission. Update affected
initial-failure wording/assertions and the corresponding reading-contract text.

Safe stopping point: Initial transient failures heal without reload; unchanged
snapshot detail still has today's gap behavior. One loop and one proof journey;
classification, deadline and timing changes stay together with their consumers.

### 2. Retain settled read outcomes for the active observation
Type: Structure
Status: planned
Proof: Keep slice 1's outside-in recovery and the O1 preservation journeys green,
including pinned reuse, partial facts, credit/Take sharing and terminal gaps.

Internal change: Expose one observation-scoped outcome owner to the normal
requested-read/enrichment flow. Retain the question's identity and typed failure
through gap projections; retain successes/established missing/terminal failures
for recovery without converting failures into cached content. Track questions
interrupted by the owned bound separately from departure. Preserve existing
public view, wait policy and independent fact arrivals at this boundary.

This structure immediately enables slice 3's recovery of eligible details while
holding terminal gaps and already answered facts. Reuse existing success caches
and projection types. Do not add a failure memo shared across pages, a parallel
state model per detail kind, or a cache for future restart/tab savings.

Safe stopping point: Existing behavior remains green; outcome ownership is
internal, and automatic detail recovery is still not advertised.

### 3. Recover unanswered facts without losing successfully shown facts
Type: Behavior
Status: planned
Proof: Add `transient-detail-recovery.spec.ts` and
`transient-credit-recovery.spec.ts`, using the published-facts and slice-clock
records through the existing dashboard fixture. Run `published-facts-failures`,
`auto-refresh-detail-recovery`, `reopened-project-reads`, `unchanged-assignment-credit`,
`taken-slice-clock`, and both limit-recovery credit/history consumers affected.

Behavior: At revision A, one or several eligible detail questions fail while
others succeed → the next due recovery observes A again → successful facts stay
shown, only eligible unanswered questions heal, and each recovered fact clears
its own gap without reload or publication. A terminal or genuinely missing fact
beside them retains its meaning and is not asked repeatedly for that same pin.

Use slice 2's common outcome rule for preparation, profiles/assignments,
plans/progress, credited humans, clocks and done records. Add no retry recognizer
or timer per fact kind. Recovery can use the normal fresh-ref route, but its
same-revision projection retains successful facts rather than returning them to
loading. Existing pinned answers prevent upstream rereads. The existing shared
profile addition supplies both human credit and Take time, and its memo retains
answered history/walk steps.

Prove a multi-beat journey with temporary and terminal gaps together, inspecting
the view while recovery is held as well as after completion. For credit, refuse
the history and, separately, a later addition-walk step: card, inspection, roster
and Take clock recover from one shared addition. Observe actual upstream calls,
not a fixture that precredits the human. Include deadline-created gaps and
remaining failure/backoff after a different gap heals. Preserve selected columns,
inspection and focused controls. Reconciliation still distinguishes settled
reading from unavailable facts. Update existing reload-only assertions only for
the now-eligible cases; keep missing/invalid/access cases distinct.

Safe stopping point: Both empty-page and same-revision detail recovery are useful;
all current fact kinds follow the same question/outcome rule. Structure is
immediately preceding this Behavior because retaining outcomes is its real risk.

### 4. Recovery belongs to the current observation and obeys shared admission
Type: Behavior
Status: planned
Proof: Add `transient-recovery-lifecycle.spec.ts`; use real page/boundary journeys
and the fake's held answers/unanswered-call observer. Run visibility, project
isolation, branch movement, shared waiters/subprocess lifecycle, cooldown/turns/
resumption, and limit-recovery consumers. Include affected responsive-session
reconciliation/recovery consumers of observation completion.

Behavior: Recovery is pending or under way → visibility, selected project,
published revision/head or GitHub's cooldown changes → only a due, visible,
current observation can make requests or publish its answers. Each leaving page
releases only its wait; the shared upstream read and server admission keep their
existing owners.

Finish the common observation lifetime: cancel the pending timer and recovery
wait on hiding; retain its due time and step; reveal once when due without
replaying missed attempts. Switching projects clears project-local recovery
state while retaining a standing login limit. Replacing a revision/head abandons
obsolete question outcomes; a late callback cannot update current facts.
Do not allow a periodic check, launch-reconciliation fresh read, or visibility
toggle to reset or bypass an outstanding recovery wait. Fresh-ref reads continue
to discover publication; successful immutable content stays pinned.

Exercise two waiting pages and another project: one page hides/switches while
the other finishes; no transient failure creates a login-wide wait; a rate-limit
refusal postpones all new upstream demand, including recovery already waiting
for admission. Observe the first resumed read and the eight-read upper bound.
Reconcile plan 272's rate-limit fixes and wording in the shared owners, preserving
its proof rather than implementing a competing fix. Prove shutdown ends pending
timers/turns/calls and their failures are observed by the owning flow, with no
late publication or background rejection. Keep source evidence and focus through
recovery and replacement, using the existing unlisted-story notice.

Safe stopping point: Recovery is coherent across visibility/publication changes
and concurrent observers, with one admission owner. The proof loop is the
active observation's lease and its termination, not separate polling subsystems.

### 5. A maintainer can inspect the latest failures without unsafe output
Type: Behavior
Status: planned
Proof: Add `authenticated-read-diagnostics.spec.ts`, using a real dev boundary
and the synthetic upstream. Reuse shared-read, short-bound and local-refusal
fixtures. Run authenticated boundary/refusal/sharing/subprocess lifecycle
consumers affected by instrumentation and both launch modes where the boundary
plugin is mounted.

Behavior: Upstream reads fail, including a shared timeout, unmarked 403 and
marked rate limit → a maintainer requests the admitted local diagnostic route →
the response names the established causes and available request evidence, keeps
only the newest 100 failure entries, and discloses no raw or credential-bearing
input. A refused diagnostic request makes no upstream call.

Collect once where `spawnedGh` owns the call, after classifying its outcome,
including the timeout rejection path. Carry known safe source/category/pin from
the admitted reader; do not change the sharing key or use unvalidated request
text. Never invent a GitHub status/ID for held-back, local-deadline, or
connectivity failures. Do not add per-waiter duplicates or log ordinary departures
as retryable failures. Leave admission-held reads identifiable in their existing
response rather than fabricating an upstream diagnostic event.

Inspect 101 failures and verify order/eviction, same read with concurrent waiters,
optional/malformed/oversized headers, and secret-like markers in stdout/stderr/
bodies/arbitrary headers. Assert the whitelist and bounded values, GET/source/
origin restrictions, no extra GitHub demand, empty history in a new server, and
safe browser/build output. A visible browser-only deadline with no upstream
answer retains its own explicit category; unavailable server metadata remains
unknown. Document the exact local inspection route, lifetime, fields and
recovery policy in `PUBLISHED-OBSERVATION.md` and request accounting.

Safe stopping point: The complete recovery story is diagnosable on the launching
machine without persistent storage or a new dashboard screen.

## Verification, delivery and sizing

All proof enters the existing Playwright Chromium suite; no new runner,
browser matrix, or live/credentialed GitHub dependency is introduced. Preserve
the harness transformations: supply only upstream answers, never final snapshot,
credited human, retry timing or endpoint result. Advance the page clock for
scheduling; use a shortened server read bound only for termination proof and
real reported-time waits for server admission. Keep initial/final production
defaults covered without replacing the scheduler under test.

Run focused suites from the execution checkout with inherited output variables
unset:

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- --workers=2 <owning-and-affected-specs>
env -u NODE_ENV npm run typecheck:dashboard
```

The concrete owning specs and consumer groups are named per slice. Before
accepting a changed contract/default/message, search its exact consumers and
retired literals across production and test support. Run the affected read
surface as a suite when changes reach it, including consumers outside that
surface such as responsive reconciliation. Broader local browser proof is
justified when changing shared classification, `authenticatedGet`, observation
completion or the synthetic CLI fixture; unrelated launch/terminal/installer
suites are not automatically local gates. The published CI still owns its full
checks after delivery. O1/O2 are planning observations, not accepted proof of
this story's new behavior.

Keep implementation, owned outside-in proof, documentation, and slice-local
cleanup together. Authorized execution applies its existing
[proof/refactoring/delivery gates](../../../.agents/skills/dough-execute-plan/references/wrap-up.md),
including post-change refactoring and the check-only commit hook. Planning
grants no Take, implementation, commit, push, landing or workspace retirement.

No numeric slice target/hard limit or S/M/L bands were supplied. Each boundary
has one proof loop; no timing limit or unsupported effort band is invented.
Slice 2 isolates the concrete outcome-retention risk immediately before its
Behavior. Slice 3 is the largest boundary: its breadth comes from applying one
already-established rule to current facts, with the existing per-group fixtures,
not introducing separate recovery policies. If execution disproves that sizing,
retain completed compatible proof and reassess the same plan under the supplied
execution workflow; do not silently drop a fact kind or add a permanent special
case. Slice 4 owns observation lifetime; slice 5 owns diagnostic inspection.

## Preparation review

Cumulative design: one failure description, one active observation's outcome
owner and recovery schedule, existing pinned success caches, and the existing
process admission. The Structure slice exists only for the immediately following
detail-recovery Behavior. Diagnostic retention is a separate bounded maintainer
outcome and does not own retry decisions. No infrastructure for deferred storage,
metrics, quota management, or tab coordination is prepared.

Slice-plan refinement was not needed: the construction review isolated outcome
retention immediately before its Behavior and kept initial recovery, observation
lifetime, and diagnostic inspection in separate proof loops. The review found
no remaining slice-specific concern. The known concurrent rate-limit correction
is explicit integration context with a named owner, not an assumed completed
fix or a new dependency. All story promises have owners, and O1/O2 establish
the current premises through their consuming operations.

Readiness is recorded only in the story's canonical structured block, with
current story and plan digests; this plan has no parallel readiness/status record
or execution completion section.
