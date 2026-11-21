# Correct the published session review after its outcome review

**Identity:** SEED-418#correct-published-session-review
**Source:** [Correct the published session review after its outcome review](../../seeds/SEED-418-review-published-session-changes.md#correct-published-session-review)
**Source review:** [source-review.md](./source-review.md)

## Correction input

- **Provenance.** This plan follows the outcome review of the completed
  execution of
  SEED-418#review-published-session-changes (`2d82175d5:.planning/seeds/SEED-418-review-published-session-changes.md#review-published-session-changes`)
  (plan 739 at `2d82175d5:.planning/slice-plans/739-review-published-session-changes/PLAN.md`, commits
  `953a8a123..9d33efde9`). Each finding was rechecked at `9d33efde9` on
  2026-11-21.
- **Preserved promises.** A developer can review a published session from a
  machine without its launch history. Only accepted Git evidence enters the
  record, and launch state stays local. A Done launch whose reporting
  reference equals the record UUID keeps its native controls as one entry.
  Plan 739's promises and history stay as written.
- **Genuine constraints.**
  - `publishSessionClose` must stop before any push when the identity is
    missing or conflicting. This is an approved API rule, and changing it is
    Terry's decision. This correction only routes Land so that it does not
    reach that case.
  - Under the native evidence identity check, MakeMe builders do not import
    runtime publication code.
  - [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
    and the [North Star on directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
    apply.
- **Boundaries.**
  - [Plan 747](../747-attribute-every-workflow-session-record/PLAN.md) owns
    multiple ranges, run selection, other workflows' records and the 30-day
    window. This plan keeps exactly one range.
  - Load-sensitive branch-attribution backend timeouts belong to SEED-367
    or test optimization.

### Findings

1. **Land routing.** Several gaps make the Land route unreliable:
   - `publish-reviewed-checkout.md` routes a native start to
     `publishSessionClose` with "the retained `sessionId`", which no shipped
     guidance supplies.
   - With no Dashboard landing context, the producer then stops with
     `session-identity-missing` before the work is pushed.
   - Land's `SKILL.md` and `dashboard-completion.md` never mention the
     route.
   - The guidance writes `workflow: "standalone"`. The Dashboard launch
     vocabulary, the E2E journeys and the builder use `"ad-hoc"`.
   - Land never passes `backlogPath`.
2. **The published review misdescribes itself.** `publishedSessionReview`
   answers `kind: "session-commits"` with `launchedAt: record.closedAt`. The
   page then shows "Commits made in the Default main checkout while the
   session was open, launched … and done …". A refresh says "kept session
   commits". The backend spec pins that kind.
3. **Duplicate entry on the originating machine.** `newestFirst` suppresses
   a record only by Done launches' references. Land publishes before the
   completion report stores Done, and attention or unfinished completions
   never store Done. A live launch therefore appears beside a "Published
   session" duplicate.
4. **The record contract is spread out.**
   - The producer owns the path, a loose UUID regex and the version.
   - The Dashboard derives its directory through `sessionRecordPath` with a
     nil UUID, which imports the publication module graph. It validates with
     `z.uuid()` and `z.literal(1)`.
   - The builder writes `version: 1` separately.
5. **Read cost.**
   - Every review open and every file diff or text request runs
     `git fetch origin`.
   - The fetch and the fallback `rev-parse` share one 30 s `admissionBound`,
     so a hung fetch turns the fallback into a 404.
   - The listing reads all records concurrently with unbounded `git show`.
6. **Lost protection.** `dashboard-header.spec.ts` replaced the exact
   opening-read budget (20, and 5/5, from correction 687 at `41d93d114`)
   with relative checks. Growth in opening reads now goes unnoticed.
7. **Residue.** Two pieces of the delivered code are left over:
   - The guard at `storyReviewInput.ts:150-152` and the empty-range guard in
     `publishedSessionReview` cannot be reached.
     `commitRuns` maps every range, yet the published query refuses `run`.
   - `recentlyDoneView.ts:134-139` shows the listing's modelled
     `unavailable` gap as an empty set. `publishedSessions.ts` promises "a
     failed read is a gap, never an empty set".

## Goal and scope

A developer landing through Dough Land, or reviewing a published session on
any machine, gets a faithful published-session review:

- Landing without a session UUID publishes the work and reports that no
  session record was written.
- The review says it shows published changes and when the session closed.
- The originating machine lists each session once, including while it is
  live.
- A failed listing shows as a gap.
- Opening a review does not refetch, and a hung fetch still falls back.

**Exclusions.** This plan does not change the stop-before-push rule, add
records for other workflows, or select among multiple ranges (plan 747). It
does not include the branch-attribution test timeouts.

## Current decisions

- **One Node-free contract.** Add
  `Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs`,
  modelled on `product-backlog-done-record.mjs`, with no `node:` imports. It
  owns:
  - `sessionRecordVersion` and `sessionRecordDirectory = "sessions"` beside
    the backlog;
  - the record file name for a UUID;
  - one session-UUID rule (`isSessionId`);
  - the standalone workflow value `"ad-hoc"`, from the Dashboard launch
    vocabulary.

  The following consume it:
  - the producer;
  - the Dashboard schema, which uses the contract version and UUID rule and
    keeps `workflow` an open string because plan 747 adds values;
  - a new `sessionRecordDirectoryOf(source)` in
    `dashboard/server/recordsBesideBacklog.ts`;
  - the MakeMe builder.

  The Dashboard stops importing `session-record-publication.mjs`.
- **Land route.** Land calls `publishSessionClose` only when a session UUID
  exists. Today that is the Dashboard launch's landing-context `reference`.
  It passes `session: { workflow: "ad-hoc" }` and the project's backlog path
  as `backlogPath` when that path is not the default. Without a landing
  context, Land uses the plain publisher and reports `record: no session
  record`. The API's retained `sessionId` stays for plan 747. The guidance
  names no source for it.
- **The published review is its own kind.** The review answers a distinct
  `kind: "published-session"` carrying `session: { closedAt }`, the one
  recorded `baseline`/`tree` and its `files`, with no `commitRuns`. Its own
  context reads "Published changes of this session, closed <time>", and its
  refresh line names published changes. Kept-session wording and the run
  switch stay kept-only. Each consumer that branches on
  `"session-commits"` (`StoryReviewContext`, `StoryReviewFeedback`,
  `StoryReviewDetailsSection`, `storyReviewContract.ts`) decides
  explicitly.
- **Exactly one range.** The Dashboard schema reads `ranges` as a
  one-element tuple. The page can review only one comparison, so a
  several-range record is skipped as malformed rather than shown partly.
  Plan 747 widens this when it adds run selection.
- **Suppression by any kept launch.** `newestFirst` takes the project's kept
  launches, Done or not, through a required parameter. It drops a record
  whose UUID equals any of their `reportingReferenceOf`. The Board passes
  that project's `launches.launched`. Non-Done listings keep the full
  `request.reporting`, so no listing change is needed.
- **Fetch only when missing.** The review first resolves the record at the
  last fetched `origin/<ref>`. It fetches only when that ref or the UUID's
  record is absent. The fetch gets its own bound, injected as a typed
  dependency, and the fallback `rev-parse` keeps a separate one. The listing
  reads records through `mapPool` at the listed-records concurrency.
- **Listing gap.** An `unavailable` published listing shows its problem in
  Recently done as an `assignment-gap`, like the done-catalog gap, and lists
  no published entries.

## Decisive premises

Observed read-only in this checkout at `9d33efde9` on 2026-11-21.

| Consuming operation | Observation |
| --- | --- |
| Land without a UUID stops before the work push (slice 2) | `closeIdentity` in `session-record-publication.mjs` returns `session-identity-missing` when there is no landing context and no retained id, and `publishSessionClose` returns before `publishExecutionIncrement`. `git grep sessionId Distribution/src/skills/dough-land Distribution/src/skills/dough-execute-plan/scripts/established-session.mjs` finds only the routing sentence. |
| Workflow vocabulary (slices 1–2) | `dashboard/src/agentLaunch.ts:230` admits `[...launchWorkflowNames, "ad-hoc"]`. E2E journeys and `sessionRecordTestData.mjs` use `"ad-hoc"`. Only `session-record-publication.test.mjs` and the Land guidance use `"standalone"`. |
| MakeMe closure constraint (slice 1) | `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES /opt/homebrew/bin/bash Distribution/evaluation/tests/native-harness/native-evidence-identity.sh` exited 0 in 31 s. It traces each identity's import closure and lists `publish-reviewed-checkout.md` among the Land inputs. |
| Published review consumers (slice 3) | `git grep '"session-commits"' dashboard/src` lists `StoryReviewContext.tsx`, `StoryReviewFeedback.tsx` (including "kept session commits"), `StoryReviewDetailsSection.tsx` and `storyReviewContract.ts:126,145,207`. |
| Non-Done launches carry their reference (slice 4) | `sessionListing` returns a non-Done record unchanged, so the full `request.reporting` is kept, and `reportingReferenceOf` falls back to it. `Board.tsx` passes `placed.done` as `records`. `newestFirst` builds `launched` from `doneSessions` only. |
| Review fetch path (slice 5) | `reviewInput` calls `fetchedPublishedSessionSource(…, admissionBound(signal))` for review, file-diff and file-text reads alike. `admissionBound` is one 30 s deadline shared by the fetch and the `rev-parse`. |
| Hung fetch is reproducible and abortable (slice 5 proof) | A scratch repository in a temp dir had origin `ssh://example.invalid/x.git` and `core.sshCommand "sh -c 'sleep 20'"`. `execFile("git", ["fetch", …], { signal: AbortSignal.timeout(500) })` aborted at 505 ms and closed at 506 ms. The orphaned `sleep` outlives git, so the case should use a sleep just longer than its bound. |
| Shorter fetch bound frees the review (slice 5) | `fetchGitTarget` shares its fetch through `GitTargetFetches` → `OutstandingReads.waitFor`, with the caller's signal as the waiter. `github-request-outstanding.mjs` states that a read "ends once no requester waits for it", so the sole review waiter's bound aborts the fetch. The hung-fetch probe above closed 6 ms after its abort under `execFile`, which `runGitUntilClosed` also awaits. Later fetches of the repository still queue behind `settling` until that close. |
| Listing gap is dropped (slice 7) | `recentlyDoneView.ts` passes `[]` unless `publishedSessions.status === "listed"`. The done-catalog gap renders through `problem` as `assignment-gap` in `RecentlyDone.tsx`. |
| Relative header counts (slice 8) | `git diff 953a8a123..HEAD -- dashboard/frontend-tests/navigation/dashboard-header.spec.ts` replaces `toBe(20)` and `toBe(5)` with comparisons to `openingReads`. |

**Unverified remainders.**
- The exact restored counts, expected to be 21 and 6/6, were not run here.
  Slice 8 sets them from a run and proves that an extra opening read fails
  them.

## Outside-in proof

| Promise | Owning slice and observation |
| --- | --- |
| One contract owns version, directory, UUID rule and workflow | 1. The producer test, the published backend and frontend specs and the native identity check pass. `git grep session-record-publication -- dashboard` finds no import. |
| Land without a UUID publishes the work | 2. A behavior review walks a Dashboard launch, which gets a record, and a native start, which gets the plain publisher and "no session record". The producer test uses `"ad-hoc"`. |
| The review describes published changes and their close time | 3. A frontend case shows "Published changes … closed" and no "launched"/"done". The backend asserts `kind: "published-session"` and `session.closedAt`, and skips a two-range record. |
| One entry for a live launch | 4. A frontend `newestFirst` case with a non-Done launch shows no published entry, and the existing cases pass. |
| No refetch, bounded fallback | 5. A backend case shows `origin/<ref>` unchanged after review and file reads of a present UUID while origin advanced. A hung-fetch case answers from the last fetched trunk. |
| Bounded listing reads | 6. The listing specs pass unchanged with `mapPool`. |
| Listing gap shows as a gap | 7. A frontend case with an `unavailable` listing shows its problem. |
| Opening-read budget | 8. The header journeys assert exact counts, and a scratch extra read fails them. |

## Ordered slices

### 1. One Node-free session record contract

Type: Structure
Status: done

**Structure.** Add the contract module from Current decisions. The
following then read from it:
- the producer (`session-record-publication.mjs`), which keeps
  `sessionRecordPath` as a thin join beside `backlogPath`;
- `dashboard/src/publishedSessionRecord.ts`, for the version literal and
  UUID rule;
- `recordsBesideBacklog.ts`, which gains `sessionRecordDirectoryOf`;
- `publishedSessionsRead.ts`, which drops its nil-UUID derivation and its
  producer import;
- `published-session-listing.spec.ts`;
- `sessionRecordTestData.mjs`, for the version and `"ad-hoc"`.

Remove the unused export duplication. This removes the spread contract
(finding 4) and leaves external behavior unchanged.

**Proof.**
```
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR /opt/homebrew/bin/bash scripts/test.sh Distribution/tests/skills/dough-land/session-record-publication.test.mjs
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:backend -- review/published-session-listing review/published-session-review review/published-session-review-request
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:frontend -- review/published-session-subject sessions/recently-done-published-session-launch
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR /opt/homebrew/bin/bash Distribution/evaluation/tests/native-harness/native-evidence-identity.sh
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run typecheck:dashboard
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run lint
git grep -n "session-record-publication" -- dashboard   # no import remains
```
The changed builder closure makes recorded native evidence keyed on it stale
until its next manual run. Paid runs stay manual.

Accepted in this checkout: evidence `s1-slice1-return-report.md` with run
records `s1-publication`, `s1-backend-2`, `s1-frontend`, `s1-native-identity`,
`s1-typecheck-2`, `s1-lint-2`, `s1-grep` (no dashboard import), and
`s1-consumer-trace`. Commitments 13 and 16 observed. Refactor: none — already
clean (PLAN.md size excepted as planning record).

### 2. Land records a session close only when the session has a UUID

Type: Behavior
Status: done
Proof: delivered on trunk by the 2026-11-21 Land guidance follow-up, with the
behavior review below; `session-record-publication.test.mjs` uses `"ad-hoc"`
and `git grep standalone` finds nothing under the Land guidance or its tests.
Behavior review: a Dashboard-launched ordinary Land of a wholly unpublished
suffix matches the session-close row of `publish-reviewed-checkout.md` and
calls `publishSessionClose` with the request, `backlogPath` and
`workflow: "ad-hoc"`; a native start has no landing context, matches the
publish-the-candidate row and reports that no session record was written.

**Behavior.** Land's guidance has one route, applied in `SKILL.md` §
Publish, `dashboard-completion.md` and `publish-reviewed-checkout.md`:
- With a Dashboard landing context, Land publishes the wholly unpublished
  suffix through `publishSessionClose`. It passes
  `session: { workflow: "ad-hoc" }`, plus `backlogPath` when the backlog path
  is not the default. It reports `work` and `record.status`.
- Without one, Land uses the plain publisher and reports "no session
  record".

The shipped text then never routes Land into `session-identity-missing`.
Apply
[author-open-dough-skills](../../../.agents/skills/author-open-dough-skills/SKILL.md),
and switch `session-record-publication.test.mjs` to the contract's workflow
value.

**Proof.**
- Record the behavior review in this plan. Walk a Dashboard-launched
  standalone Land, which gets a record, and a native start with no landing
  context, which gets the plain publisher and "no session record".
- Run:
```
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR /opt/homebrew/bin/bash scripts/test.sh Distribution/tests/skills/dough-land/session-record-publication.test.mjs
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR /opt/homebrew/bin/bash Distribution/evaluation/tests/native-harness/native-evidence-identity.sh
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run lint
git grep -n '"standalone"' -- Distribution/src/skills/dough-land Distribution/tests/skills/dough-land   # none
```

### 3. The published review names its published changes and close time

Type: Behavior
Status: done

**Behavior.**
- **Pre-condition:** a published record with one range, read on a machine
  without launch history.
- **Trigger:** opening its review.
- **Postcondition:** the review answers `kind: "published-session"` with
  `session.closedAt`, its baseline, tree and files. The page shows
  "Published changes of this session, closed <time>" with its description,
  and a refresh names published changes. No "launched", "done" or Default
  main wording appears.

The schema reads `ranges` as a one-element tuple. The review is built from
that one range, which removes the per-range `commitRuns` and the unreachable
empty-range guard. A two-range record is skipped as malformed.

**Proof.**
- A frontend case in `published-session-subject.spec.ts` renders the
  context. It fails on the current "launched … done" text.
- `published-session-review.spec.ts` asserts the new kind and `closedAt`.
- A listing case skips a two-range record.
- The published-sessions E2E journey still opens the diff.
```
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:frontend -- review/published-session-subject
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:backend -- review/published-session-review review/published-session-listing review/published-session-review-request
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run test:e2e -- e2e/sessions/recently-done-published-sessions.spec.ts
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run typecheck:dashboard
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run lint
```


Accepted: evidence `s3-slice3-return-report.md` (s3-frontend-2/s3-backend/s3-e2e). Commitments 3 and 9 observed. Refactor: `storyReviewFiles.ts` seam; follow-up: unavailable published gap still session-commits-shaped.

### 4. A live launch stands for its published record

Type: Behavior
Status: done

**Behavior.**
- **Pre-condition:** a kept, non-Done launch whose reporting reference
  equals a published record's UUID.
- **Trigger:** Recently done lists the project.
- **Postcondition:** no "Published session" entry appears for that UUID.
  Done launches still suppress as before.

`newestFirst` takes the project's kept launches as a required parameter,
and the Board passes `launches.launched` for the source.

**Proof.**
- A `newestFirst` case in `recently-done-published-session-launch.spec.ts`
  with a non-Done launch, given both by listing and in full, fails before the
  fix.
- The existing cases and the published-sessions journey pass.
```
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:frontend -- sessions/recently-done-published-session-launch sessions/board-done-session-placement
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run test:e2e -- e2e/sessions/recently-done-published-sessions.spec.ts
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run typecheck:dashboard
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run lint
```


Accepted: evidence `s4-slice4-return-report.md`. Commitments 4 and 5 observed. Refactor: required keptLaunches end-to-end.

### 5. Published reviews fetch only when the record is missing

Type: Behavior
Status: done

**Behavior.**
- Given a record present at the last fetched `origin/<ref>`, opening the
  review and its file diff and text answer without fetching.
  `origin/<ref>` stays at its old SHA after origin advances.
- Given an absent UUID, one fetch runs before the answer.
- Given an origin whose fetch hangs, the review answers from the last
  fetched trunk once the fetch's own injected bound ends, not with a 404.

Remove the unreachable story-subject guard in `storyReviewInput.ts`.

**Proof.** Backend cases with real Git in
`published-session-review-request.spec.ts`. The hung-fetch case uses
`core.sshCommand "sh -c 'sleep <bound+2s>'"` and a short injected bound.
Both new cases fail before the fix.
```
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:backend -- review/published-session-review-request review/published-session-review review/ad-hoc-review-subject review/ad-hoc-review-file
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run test:e2e -- e2e/sessions/recently-done-published-sessions.spec.ts
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run typecheck:dashboard
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run lint
```


Accepted: evidence `s5-slice5-return-report.md`. Commitments 7 and 8 observed.

### 6. Bound the published listing's record reads

Type: Structure
Status: done

**Structure.** `performPublishedSessionsRead` reads its records through
`mapPool` at the listed-records concurrency (shared from
`listedRecordsRead.ts`) instead of an unbounded `Promise.all`. This removes
the unbounded `git show` fan-out (finding 5), and the listing answers stay
unchanged.

**Proof.**
```
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:backend -- review/published-session-listing observation/authenticated-read-listed-records
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run typecheck:dashboard
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run lint
```


Accepted: evidence `s6-slice6-return-report.md`. Commitment 14 observed. Refactor: already clean.

### 7. Recently done shows a failed published listing as a gap

Type: Behavior
Status: done

**Behavior.**
- **Pre-condition:** the published-session listing is `unavailable`.
- **Trigger:** Recently done renders.
- **Postcondition:** its problem shows as an `assignment-gap` beside any
  done-catalog gap, and no published entries are listed. A `listed` answer
  renders as today.

**Proof.** A frontend case in `dashboard/frontend-tests/sessions/` (beside
`recently-done-ad-hoc-review-gaps.spec.ts`) fails while the gap shows as
empty. The listed-session cases pass.
```
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:frontend -- sessions/recently-done-published-session-launch sessions/recently-done-ad-hoc-review-gaps
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run typecheck:dashboard
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run lint
```


Accepted: evidence `s7-slice7-return-report.md`. Commitment 6 observed. Refactor: publication helpers + RecentlyDoneReadGaps.

### 8. Header journeys hold the exact opening-read budget

Type: Structure
Status: done

**Structure.** Restore exact counts in `dashboard-header.spec.ts`: the
settled opening reads and the walk, and each project's reads after
switching. Take the values from a run, expected to be 21 and 6/6. Keep the
comparison that walking reads nothing again. This restores the protection
that correction 687 added (finding 6).

**Proof.** The journeys pass, and fail with a scratch extra opening read,
which is then reverted. Use the Intent Coverage fault from the SEED-418
wrap-up at `68c2371449bf`: `readPublishedDetails` in
`dashboard/src/publishedWorkDetails.ts` asking `readPublishedSessions` twice
per snapshot. At that revision it raised project selection's opening reads
from 6 to 7 per project while all five header journeys passed (verdict
Assertion gap). The settled project-selection budget measured there is 6.
```
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:frontend -- navigation/dashboard-header
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run lint
```

Accepted: evidence `s8-slice8-return-report.md`. Commitment 15 observed (21 and 6/6). Refactor: already clean (test-only exact pin).

## Local gates

- Apply the
  [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written.
- Use [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [Dough Page Objects](../../../.agents/skills/dough-page-objects/SKILL.md)
  where their test selection applies.
- Keep default timeouts and never use `test.slow()`.
- Apply
  [author-open-dough-skills](../../../.agents/skills/author-open-dough-skills/SKILL.md)
  to slice 2.
- Run long macOS checks on AC power under `caffeinate -s -i`, per
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- Use the pinned Node from `.node-version`, and put Homebrew Bash 5 on
  `PATH` for `scripts/test.sh`.
- Run each slice's focused commands as written, with
  `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR`.
  Hosted CI settles the full groups.

## Plan review

Slice-plan refinement was not needed. Each slice owns one finding's outcome
or one structural weakness with its own proof loop. Slice 3 takes finding
7's range residue because it reshapes the same answer, and slice 5 takes the
input guard because it changes the same function. No slice prepares for
another beyond slice 1's contract, which slices 2–3 consume.

Plan size is eight slices, the maximum. Slice 1 touches about seven files
mechanically within one proof loop. This review found no remaining
slice-specific concern.

## Execution complete

Product advice:
- Queue SEED-418#name-unavailable-published-session-review (plan 750) after closure.
- Before Dough Land publishes this story branch, integrate `origin/main` so `eed84c8c4` is an ancestor of the tip; confirm Land guidance and session-record-publication match slice 2 (`ad-hoc`, plain publisher without UUID). Absorb `126fabd26` marked slice 2 done without carrying that product onto this branch tip.
- Commitments 1–2 and 10–12 are observed on trunk only until that integrate.
- No North Star or priority change. Supplier story attribute-every-workflow-session-record can re-judge after Land is on tip.
- Direction aligned (ADR 0008). Named follow-up for unavailable published gap wording is plan 750 / DD-604 context.
