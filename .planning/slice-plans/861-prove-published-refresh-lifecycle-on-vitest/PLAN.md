# Prove published refresh lifecycle in Node Vitest

**Source:** [Prove published refresh lifecycle in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#published-refresh-lifecycle-via-vitest)

**Identity:** SEED-413#published-refresh-lifecycle-via-vitest

## Goal and scope

Give Dashboard maintainers fast, direct Node Vitest feedback that published
revision checks, shared listings, SSE revision streams, cross-revision reuse,
and machine-retained answers preserve their confirmation, failure, cleanup,
and byte-budget guarantees. The fifteen legacy observation specs below (60
Chromium cases) are the complete selection; every case needs a named observable
replacement or maintained proof owner before removal.

Reconciliation with related work:
- [Plan 856](https://github.com/terryyin/open-dough/blob/e4faafbdb/.planning/slice-plans/856-open-the-board-from-the-verified-git-trunk/PLAN.md)
  moved the Board's cold open (`case "ref"`) to `SharedVerifiedOriginTrunk`,
  which still calls `pinned.answeredBacklog(source, revision)` so subsequent
  revision-reuse reads compare against the verified trunk revision.
- [Plan 853](../853-refresh-published-board-in-place/PLAN.md) owns in-place
  Board Refresh over `SharedVerifiedOriginTrunk` and durable confirmation
  records, keeping automatic observation on the current revision-check and
  revision-stream path.
- [Plan 823](../823-follow-published-progress-from-local-git/PLAN.md) owns
  moving automatic observation and pinned Board reads to local Git.
- [Plan 860](../860-prove-published-read-admission-on-vitest/PLAN.md) owns
  published read admission, and
  [plan 862](../862-prove-authenticated-github-observation-on-vitest/PLAN.md)
  owns authenticated GitHub request ownership (retaining shared callers of
  `revisionCheckBoundary.ts` such as `authenticated-read-turns.spec.ts` and
  `authenticated-read-output-bound.spec.ts`).

## Current decisions

- [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
  [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md),
  and the North Star topics
  [Make production code directly testable](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [Plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
  govern the proof boundary. Exercise the production typed classes and
  functions directly in Node Vitest, injecting only the upstream provider,
  storage directory/budget, scope, or clock seam where the case controls
  timing, failure, or call counts. Add zero wrappers or mini-servers to
  `dashboard/test-support/`.
- [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  and [Share one refresh for published Dashboard Git reads](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads)
  govern the surviving architecture. Keep browser rendering, recovery cues,
  visibility pacing, and real-origin Board journeys with their existing E2E
  owners (`e2e/observation/revision-stream*.spec.ts`,
  `e2e/observation/auto-refresh*.spec.ts`) and keep verified-trunk Git open
  proof in `dashboard/backend-tests/review/shared-verified-origin-trunk.spec.ts`.
- Keep a small in-process Node HTTP witness (no Vite server boot, no
  Chromium) only where the wire contract supplies the proof: `no-store` and
  `text/event-stream` headers, cross-origin 403 refusal, preview-mode gzip
  first-event flushing, SSE subscriber/setup departure, and real subprocess
  survival/abort on requester departure or boundary close.
- File-size discipline before editing: `retainedAnswers.ts` (144 lines),
  `revisionMemo.ts` (66), `pinnedMemo.ts` (247), `pinnedTexts.ts` (150),
  `commitsBetween.ts` (120), `revisionChecks.ts` (191),
  `performedRevisionCheck.ts` (69), `revisionStreamObservation.ts` (102),
  `ghRevision.ts` (134), `authenticatedRead.ts` (243), and `performedRead.ts`
  (228) are within 250 lines; `sourceRevisionStream.ts` is 255 lines.
  `pinnedMemo.ts` has almost no room: a later slice that injects an upstream
  there extracts that read first so the edited file stays within 250 lines.
  If slice 8 edits `sourceRevisionStream.ts`, separate per-subscriber delivery
  and teardown cleanly so every edited file stays within 250 lines.
- Test-support cleanup: `retainedAnswersJourney.ts`, `revisionReuseOrigin.ts`,
  `revisionReuseAnswers.ts`, and `revisionReuseCalls.ts` also serve
  `e2e/observation/authenticated-read-retained-answers-reload.spec.ts`, which
  this story keeps as the preview-reload E2E owner. Leave those four modules.
  After slices 4 and 5 retire their backend callers, delete
  `dashboard/backend-tests/observation/revisionReuseBoundary.ts` only when it
  has no remaining caller. Delete `listingTimeoutBoundary.ts` in slice 7 and
  `revisionStreamBoundary.ts` plus `controlledRevisionStream.ts` in slice 8
  once their last callers migrate. Keep `revisionCheckBoundary.ts` because
  `authenticated-read-turns.spec.ts` and `authenticated-read-output-bound.spec.ts`
  (owned by plan 862) still import it.

## Premises and baseline

Observed in this isolated preparation workspace at `d8ae63ddb` on 27 November
2026 (Node v24.21.0, macOS on AC power, one worker, default timeout, load
20–24 on 16 logical CPUs). The exact 15-spec legacy selection passed all 60
Chromium cases on the first attempt with 77.3 s summed case time (~1,288 ms
per case) and 84.62 s wall time (an earlier warm-up run at load 24–31 took
102.90 s). The existing Node Vitest observation witnesses
(`observation/shared-observation.spec.ts` and
`review/shared-verified-origin-trunk.spec.ts`) passed all 10 cases in 8.13 s
(6 `SharedObservation` cases in 105 ms total).

```sh
caffeinate -s -i npm run test:dashboard:backend -- \
  'observation/authenticated-read-(retained-answers(-bounded|-moved)?|revision-(backlog|check(-failures)?|reuse(-bounds|-compared|-failures|-history)?|stream(-setup-departure)?)|shared-listing(-failures)?)\.spec\.ts$' \
  --workers=1
```

| Consuming operation | Observed result at `d8ae63ddb` | Plan consequence |
| --- | --- | --- |
| Legacy 15-spec Playwright baseline (command above) | 60 Chromium cases passed: retained-answers (9 cases, 32.2 s), revision-backlog & revision-check (10 cases, 9.9 s), revision-reuse (24 cases, 20.7 s), shared-listing (6 cases, 7.0 s), revision-stream (11 cases, 7.5 s). | Exact migration inventory: 60 cases across 15 specs, all currently active and green. |
| Production call-graph reconciliation with plans 856, 853, 823 | `performedRefRead.ts` owns cold open (`case "ref"`) via `SharedVerifiedOriginTrunk` and calls `pinned.answeredBacklog`. `authenticatedRead.ts`, `performedRead.ts`, `RevisionChecks`, `PinnedTexts`, `RetainedAnswers`, `RevisionStreamObservation`, and `SourceRevisionStream` remain the live paths for revision checks, streams, reuse, and retained answers until plan 823 moves them to local Git. | Preserve all 60 cases' product behavior directly on the current production seams; do not prematurely remove active revision-check or reuse behavior. |
| Node Vitest backend runner (`observation/shared-observation.spec.ts`, `review/shared-verified-origin-trunk.spec.ts`) | `backend.vitest.config.mts` selects every `.spec.ts` in `dashboard/backend-tests/` that imports `vitest` and runs it in Node alongside retained Playwright specs. Passed 10/10 cases in 8.13 s. | New/migrated Node Vitest specs in `dashboard/backend-tests/observation/` run automatically under the maintained `npm run test:dashboard:backend` selector with zero runner-config changes. |
| Support-module consumer check across `dashboard/` and `e2e/` at execution start `29e840285` | The four retained-answer helpers also serve `e2e/observation/authenticated-read-retained-answers-reload.spec.ts`. `revisionReuseBoundary.ts`, `listingTimeoutBoundary.ts`, `revisionStreamBoundary.ts`, and `controlledRevisionStream.ts` are imported only by this story's backend specs. `revisionCheckBoundary.ts` also serves 2 specs in plan 862. | Leave the four helpers the preview-reload E2E still imports. Delete the four backend-only modules as their last callers retire; leave `revisionCheckBoundary.ts` intact for plan 862. |

## Ordered slices

Legacy paths are in `dashboard/backend-tests/observation/`. Parenthetical
counts are the observed baseline cases (total 60). Each slice budgets 15 active
minutes or less and owns one proof loop. Keep legacy specs running until their
Node Vitest replacements are green, then retire the replaced specs in the same
slice.

### 1. Retain answer files within a byte budget

Type: Behavior
Status: done

Behavior: `RetainedAnswers` accepts optional `{ directory, budgetBytes }`,
defaulting to the production home directory and byte budget, and existing
`new RetainedAnswers()` callers keep working. A kept answer is an owner-only
file (`0o700` directory, `0o600` file) that a second instance on the same
directory reads back, while an instance on another directory does not.
`RevisionMemo.recalled` keeps only a read that resolves, so a rejected read
leaves nothing in the store. `held` misses a removed store, a file whose key
does not match, and torn JSON. An unwritable directory is warned once and
later keeps are skipped. A write past the budget evicts least-recently-used
files down to seven eighths of the budget, and a file touched by `held`
outlasts files written later but not used since.

Proof: Direct Node Vitest over `RetainedAnswers` and `RevisionMemo` with real
temp directories. No `PinnedTexts`, no GitHub collaborator, and no HTTP server.
Do not write the real `~/.open-dough` store. Replaces the two budget cases in
`authenticated-read-retained-answers-bounded.spec.ts` and the store-miss half
of `authenticated-read-retained-answers.spec.ts`. Delete only the bounded spec
in this slice. Leave the other two retained-answer specs and
`retainedAnswersJourney.ts`.

Accepted proof at `29e840285` with the constructor and spec uncommitted.
Promise: owner-only files, a second directory reads them back, another
directory does not, rejected reads are not stored, removed/foreign/torn
entries miss, an unwritable directory warns once, and a past-budget write
evicts least-recently-used files to at most 7/8 while a just-held entry
survives. Boundary: `RetainedAnswers` and `RevisionMemo.recalled` in temp
directories. Setup and observations:
`dashboard/backend-tests/observation/retained-answers-store.spec.ts` (6 tests).
Command: `caffeinate -s -i npm run test:dashboard:backend -- 'observation/retained-answers-store.spec.ts$' --workers=1`
(renewed after the lint repair as `slice1-store-lint.log.run.json`, exit 0, 6 tests).
Typecheck renewed as `slice1-typecheck-lint.log.run.json`, exit 0.
`new RetainedAnswers()` in `review/shared-verified-origin-trunk.spec.ts`
passed (`slice1-callers.log.run.json`).
Refactor pass skipped: the optional constructor is the planned seam, the
class stays at 115 lines, and no second store representation was found.

### 2. Answer a later process from pins it has heard

Type: Behavior
Status: done

Behavior: A second `PinnedTexts` on the same retained directory, once this
process has heard the revision, answers a pinned read from the store and does
not ask the file upstream again. Another directory reads afresh. A read at a
revision this process never heard asks upstream even when those bytes are on
disk, and a logged-out or otherwise rejected upstream answers no retained text
for that unheard pin. Branch-head resolution stays where it already lives.

Proof: Direct Node Vitest over `PinnedTexts` with a typed file-read
collaborator injected where `pinnedTexts.ts` (150 lines) has room. Do not grow
`pinnedMemo.ts` (247 lines); extract first if the injection cannot land without
passing 250. No HTTP server. Replaces the later-process, rejected-answer, and
unheard-revision cases in `authenticated-read-retained-answers.spec.ts` (4).
Delete that spec once these cases and slice 1's store cases cover it. Leave
`retainedAnswersJourney.ts`.

Accepted proof at `a81c910` with the reader and spec uncommitted, published
in `1e2fd49`. Promise: a second `PinnedTexts` on the same directory, after
hearing the revision, returns the stored backlog text and does not call the
file reader again; another directory calls the reader; an unheard revision
calls the reader even when the bytes are on disk; a rejected unheard read
does not answer that text. Boundary: `namedRevisionText` and `reader()` at
`source.backlogPath`. Comparison still calls `readRepositoryFileViaGh`
directly. Setup and observations:
`dashboard/backend-tests/observation/retained-answers-heard.spec.ts` (4 tests).
Command: `caffeinate -s -i npm run test:dashboard:backend -- 'observation/retained-answers-heard.spec.ts$' --workers=1`
(`slice2-heard.log.run.json`, exit 0). Typecheck
`slice2-typecheck.log.run.json` and `new PinnedTexts(memo)` in
`review/shared-verified-origin-trunk.spec.ts` (`slice2-callers.log.run.json`)
passed. Refactor pass skipped: the optional reader is the planned seam on
`pinnedTexts.ts`, and `pinnedMemo.ts` was not edited.

### 3. Reuse retained records across a moved revision

Type: Behavior
Status: done

Behavior: Across a moved revision, a later instance reuses untouched retained
records via comparison while still asking upstream for an unheard pin or an
unbounded or failed comparison.

Proof: Direct Node Vitest on the slice 2 seam. Replaces
`authenticated-read-retained-answers-moved.spec.ts` (3). Delete that spec in
this slice. Leave `retainedAnswersJourney.ts`.

Accepted proof at `1e2fd49` with the comparison collaborator and spec
uncommitted. Promise: after the backlog is answered at A and the ref names B,
an untouched path returns A's retained text and the file reader is not called;
a touched path is read at B; a null comparison reads at B; an unheard B reads
at B even when A's text is on disk. Boundary: `reader()` for a non-backlog
path after `answeredBacklog` and `namedByRef`. Setup and observations:
`dashboard/backend-tests/observation/retained-answers-moved.spec.ts` (4 tests).
Command: `caffeinate -s -i npm run test:dashboard:backend -- 'observation/retained-answers-moved.spec.ts$' --workers=1`
(`slice3-moved.log.run.json`, exit 0). Typecheck
`slice3-typecheck.log.run.json`, `new PinnedTexts(memo)` in
`review/shared-verified-origin-trunk.spec.ts` (`slice3-callers.log.run.json`),
and the heard spec (`slice3-heard.log.run.json`) passed. `pinnedMemo.ts` is
249 lines. Refactor pass skipped: the optional comparison argument is the
planned seam, and the default call is still `touchedBetweenViaGh`.

### 4. Reuse unchanged records across a moved revision within bounds

Type: Behavior
Status: planned

Behavior: Once a process answers a project's backlog at A and its ref moves to
B, the backlog at B is read directly while records and listings compare A→B
(`per_page=10`) and read each commit between, reusing untouched answers from A
and fetching only touched, newly added, or removed records/listings at B (a
removed record fails 404 rather than falling back to A). A move past B to C
compares A→C. Behind or diverged revisions, more than 10 commits between, a
commit or comparison capped at 300 files, a story branch head, and a fresh
process with an empty store establish no cross-revision reuse (while keeping
blob reuse for listed records) and ask the comparison/commits at most once.

Proof: Direct Node Vitest cases over `PinnedTexts`, `PinnedMemo`,
`RevisionMemo`, and `touchedBetweenViaGh` using the typed upstream seam from
slice 2 and MakeMe `aProjectRevision` fixtures. Replaces
`authenticated-read-revision-reuse.spec.ts` (6) and
`authenticated-read-revision-reuse-bounds.spec.ts` (7) — 13 cases total.

### 5. Handle merge and rename diffs, comparison failures, and history reuse

Type: Behavior
Status: planned

Behavior: Coinciding reads at B wait on one in-flight comparison and commit
read. A file differing between A and B is read at B even when a merge commit
omits it; a path renamed away in either the comparison or a commit between is
missing at B and its new path is read. The backlog at B never waits on a held
comparison; a failed comparison or failed commit read is not remembered (that
read proceeds from upstream and a later read retries and reuses); a
rate-limited comparison leaves the backlog answered and reports the rate limit
with `retryAfterSeconds` without reading the record. Profile additions and
last-committed times reuse A's answers when untouched, walk B when touched,
and credit the re-adding commit when a profile is removed and re-added with
identical bytes.

Proof: Direct Node Vitest cases on the same `PinnedTexts`/`PinnedMemo` seam
with controlled deferred promises for concurrency and failure injection.
Replaces `authenticated-read-revision-reuse-compared.spec.ts` (4),
`authenticated-read-revision-reuse-failures.spec.ts` (4), and
`authenticated-read-revision-reuse-history.spec.ts` (3) — 11 cases total.
Delete `revisionReuseBoundary.ts` after verifying zero remaining callers.
Leave `revisionReuseOrigin.ts`, `revisionReuseAnswers.ts`, and
`revisionReuseCalls.ts`; the preview-reload E2E still reaches them.

### 6. Check published revisions with conditional ETags, fallback, and rate-limit waits

Type: Behavior
Status: planned

Behavior: A pinned backlog read answers the named revision without resolving
`main`, and refuses a non-SHA revision before calling upstream. A revision
check returns `changed: false` on matching head or 304 and `changed: true`
with an updated ETag when `main` moves, never sharing one source's ETag with
another, and refuses malformed, mixed, unknown-source, or cross-origin queries
before calling upstream. A non-rate-limit listing failure falls back to the
ref alone without branch heads for that check only; a rate limit never falls
back to the ref alone, reports logged-out `gh` guidance distinctly, validates
and bounds `Retry-After` and `X-RateLimit-Reset` to 3600 s (defaulting to 60 s
on missing/unusable/past headers), and treats a 200 spending the last
allowance as a normal answer.

Proof: Node Vitest cases over `parseRequestedRead`, `RevisionChecks`,
`performRevisionCheck`, `checkHeadsViaGh` / `resolveRevisionViaGh`, and
`reportedFailure` / rate-limit parsing, plus a lightweight in-process Node
HTTP witness for `no-store`, status codes, and cross-origin 403 refusal.
Replaces `authenticated-read-revision-backlog.spec.ts` (2),
`authenticated-read-revision-check.spec.ts` (4), and
`authenticated-read-revision-check-failures.spec.ts` (4) — 10 cases total.

### 7. Share settled listings across checks and clear them on failure or close

Type: Behavior
Status: planned

Behavior: A settled listing serves later checks for the same source and
request-owner scope within the reuse window (while a zero window asks again),
answering each caller's own `since` and watched branches without repeating the
listing. A departing requester leaves the listing to settle so the next check
within the window reuses it. A 504 fallback, a timed-out listing (distinguishing
waiter bound from listing bound and recording the timeout diagnostic), a
rate-limited listing (holding back during cooldown and resuming after), or a
different request-owner scope keeps no reusable listing; closing the boundary
aborts a running listing.

Proof: Direct Node Vitest cases over `RevisionChecks` (using its existing
`listHeads`, `reuseMs`, `scope`, and `tracked` options) for window/zero-window
reuse, multi-caller `since`/watched branches, fallback clearing, and scope
isolation, plus a focused in-process Node HTTP / real-subprocess witness for
departing-requester settlement, waiter-vs-listing timeout with diagnostic and
process exit, cooldown holdback/resumption, and abort-on-close. Replaces
`authenticated-read-shared-listing.spec.ts` (3) and
`authenticated-read-shared-listing-failures.spec.ts` (3) — 6 cases total.
Delete `dashboard/backend-tests/observation/listingTimeoutBoundary.ts`.

### 8. Stream revision updates over SSE and clean up on departure or close

Type: Behavior
Status: planned

Behavior: A revision stream responds `200`, `text/event-stream`, `no-store`
with an immediate first event; two streams for one source at different
revisions and watched branches share one listing per pace tick and stop
polling once the last stream closes. Cross-site opens are refused 403 before
upstream calls; closing the boundary ends open streams and stops timers; 504
listings answer the ref alone without branches; rate-limited listings emit an
event carrying `retryAfterSeconds`; preview-mode `Accept-Encoding: gzip`
flushes the first event promptly without buffering. A page departing or
boundary closing while request-owner scope setup is held makes zero upstream
listings and leaves no timer, while a live sibling or connected page still
receives events and cleans up on close.

Proof: In-process Node HTTP / SSE Vitest cases over
`RevisionStreamObservation`, `SourceRevisionStream`, and
`parseRequestedRevisionStream` (with injectable scope, checks, and controllable
pace clock, plus a real gzip-wrapped response check for preview flushing).
Keep browser SSE delivery, visibility, and recovery cues in
`e2e/observation/revision-stream*.spec.ts` and
`e2e/observation/auto-refresh*.spec.ts`. Replaces
`authenticated-read-revision-stream.spec.ts` (7) and
`authenticated-read-revision-stream-setup-departure.spec.ts` (4) — 11 cases
total. Delete `dashboard/backend-tests/observation/revisionStreamBoundary.ts`
and `dashboard/backend-tests/observation/controlledRevisionStream.ts`.

## Local gate and delivery

- Apply [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) selection
  before authoring or changing any test, and
  [page-object selection](../../../.agents/skills/dough-page-objects/SKILL.md)
  if browser tests change. Follow [AGENTS.md](../../../AGENTS.md) for default
  timeouts (no `test.slow()`, no suite/file/hook timeout overrides) and awake
  macOS on AC power under `caffeinate -s -i` for long local checks. Apply the
  shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Run the slice-focused `npm run test:dashboard:backend -- <selection> --workers=1`
  check after each slice and `npm run typecheck:dashboard` whenever typed
  seams change. Apply
  [consumer tracing](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  to every changed server seam and deleted test-support file, verifying
  unaffected callers (including `shared-observation.spec.ts`,
  `shared-verified-origin-trunk.spec.ts`, and plan 862's specs that still use
  `revisionCheckBoundary.ts`).
- Recount at the execution starting revision and record the final exact
  maintained one-worker command with runner counts, per-case times against the
  campaign's ~100 ms target, summed case time, elapsed time, host load, and
  retained E2E owners. Require zero legacy Chromium cases for this family and
  account for every retired case before removing its witness.

## Learnings

- At `29e840285`, `e2e/observation/authenticated-read-retained-answers-reload.spec.ts`
  imports `retainedAnswersJourney.ts`, `revisionReuseOrigin.ts`, and
  `revisionReuseCalls.ts`, and the journey helper reaches `revisionReuseAnswers.ts`.
  The preparation premise that those modules served only this story's 15 backend
  specs was false. The preview-reload journey stays an E2E owner, so those four
  modules stay for the rest of this plan.
- Slice 1 overran at 16.7 active minutes with no owned code and no proof
  (`storyOverruns` 1). The failed sizing assumption was that one slice could
  open the store seam and also port heard-revision reads and moved-revision
  comparison. Those are separate proof loops. Nothing was reverted. The store
  loop is slice 1; heard pins are slice 2; moved retained records are slice 3.
- Slice 3's proof passed at 14.9 active minutes. Pausing after that return
  recorded 15.4 minutes, so `storyOverruns` is 2. Delivered value is the nine
  retained-answer cases on the Node seams. Remaining scope is slices 4–8, the
  other 51 cases, already one proof loop each. The second overrun is handoff
  time after a finished proof. Continue slice 4 on that plan; do not split
  again for this overrun.

## Execution identity

- Mode: story-branch. Identity: SEED-413#published-refresh-lifecycle-via-vitest.
  Publisher ID: dashboard-territory.local-open-dough. Agent: Nao-chan.
- Owned workspace, reused from the established start (this session did not
  create it): `/Users/terryyin/git/open-dough/.worktrees/prove-published-refresh-lifecycle-in-node-vitest`,
  branch `cursor/prove-published-refresh-lifecycle-in-node-vitest`, starting
  revision `9379098d55410b514abf36b8fb8e42b0c0931181`.
- Originating checkout: that same workspace. Integration checkout: none.
- Target selection: remote `origin`, branch `main`.
- Published revision `1e2fd49f64047a1991fa8613486adefa93095bda` accepted on
  `origin/cursor/prove-published-refresh-lifecycle-in-node-vitest`. That SHA is
  the previously published base for the next increment. The Story Branch claim
  `29e8402851ac887b9d4cdd7838b8a20db7bb08f9` remains `pendingCi: unobserved`.

## Plan review

Refinement not needed: the six slices cover all 60 observed baseline cases
across the 15 legacy specs with direct typed Node Vitest seams, minimal
in-process HTTP witnesses for genuine wire/SSE/process behaviors, clear
test-support deletions, and explicit reconciliation with plans 856, 853, 823,
860, and 862. No slice-specific concern remains on the observed basis.
