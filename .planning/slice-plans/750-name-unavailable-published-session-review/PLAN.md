# Correct the published-session review’s gap naming and tests

**Identity:** SEED-418#name-unavailable-published-session-review
**Source:** [Correct the published-session review’s gap naming and tests](../../seeds/SEED-418-review-published-session-changes.md#name-unavailable-published-session-review)
**Source review:** [Independent source commitments](source-review.md)

## Execution context

Story Branch Mode in the established `codex/correct-the-published-session-review-s-gap-namin` checkout.
Publisher `dashboard-territory.local-open-dough`, agent Nao-chan.
The Take `ff70603c59747a7ecc1d581cb68ccd0137596d90` was confirmed on
`origin/main` and the execution branch, with starting revision
`389f7268ad3ebeb72c97382cb8a15cd7605f738e`. Existing planning authority
applies, with no separate overrun replanning instruction. Checkout setup used
Node 24.21.0, `npm ci`, and a passing Dashboard typecheck.

## Correction input

- **Provenance.** Outcome reviews of the completed execution of
  SEED-418#correct-published-session-review (plan 746 at
  `6302d70889f6b798df1fd8d8a5381e71d729f3ae:.planning/slice-plans/746-correct-published-session-review/PLAN.md`).
  Attributable commits after Take `343b15f2c89edef12b755475e513d5561277a90e`:
  `126fabd26` (plan), `8ef85eb94`, `205af4d48`, `3b475c758`, `205282d0e`,
  `632f4b41d`, `6cb718146`, `576150249`, and the CI repairs `33defaba0` and
  `85cdf9d64`; landed through merge `cb341cec7`. Interleaved trunk work
  (`eed84c8c4`, `1cf323753`, the System Settings and Done capture stories)
  is excluded. The first review (finding 1) was rechecked at `576150249`; the
  second review (findings 2–6) at `42a660a17` on 2026-11-21.
- **Preserved promises.** Plan 746's promises and history stay as written: a
  successful published-session review answers `kind: "published-session"` with
  published-changes wording and close time; kept-session wording stays on
  `session-commits` only; a developer can still open a published session from
  a machine without launch history when Git holds the pair; a live or Done
  kept launch stands for its published record; an unavailable listing shows as
  a Recently done gap while a missing sessions directory lists empty; opening a
  review of a present UUID does not fetch; the header journeys hold 21 and 6/6.
- **Genuine constraints.**
  - The [North Star](../../NORTH-STAR.md): test support only shrinks outside
    MakeMe builders and page objects; new frontend cases mount the owning
    component with neither `actSettled` nor React `act`; no
    `@playwright/test` in `dashboard/frontend-tests/` or
    `dashboard/backend-tests/` beyond what exists, and none in new or rewritten
    cases.
  - Unit cases take the typed dependencies a handler reads, not environments
    or module spies; frontend cases mount as
    [Which entry a case uses](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses)
    describes.
  - ADR 0008 durable project state versus local operational state.
  - Plan 747 still owns multiple ranges and other workflows' records.
- **Boundaries.** Does not change Land routing, listing suppression, the
  pinned GitHub listing path, the opening-read budgets, or the review's
  success answer.

### Findings

1. **Unavailable published gap still looks like kept session commits.**
   When the recorded pair is missing from this machine's Git,
   `publishedSessionReview` returns `unavailableSessionCommitsReview`, which
   answers `kind: "landing-unavailable"` with `comparison: "session-commits"`.
   `reviewsSessionCommits` then matches, so the review description becomes
   "Read-only: this session's kept commits." and the toolbar name becomes
   "Session commits", while the explanation text still says published
   commits.
2. **Test support grew for a Playwright full-app case** (`6cb718146`).
   The listing-gap proof is a new `@playwright/test` frontend-app journey,
   `frontend-tests/sessions/recently-done-published-listing-gap.spec.ts`
   (`page.goto("/")`, `test.step`, `parts(page)`), for what is a pure
   derivation (`problems` in `useRecentlyDone`) and one list render. To arrange
   it, the execution added to test support: a new module
   `test-support/support/frontendRecentlyDonePublications.ts` (79 lines, with
   the new `putFrontendPublishedSessions` and
   `FrontendPublishedSessionsPublication`), a `publishedSessionsBySource`
   field in `FrontendServiceState`, its plumbing in
   `mountedDashboardCommands.ts`, a new arranged branch in
   `frontendAuthenticatedReadSubstitute.ts`, and re-export indirection in
   `frontendServiceState.ts` — net +65 lines. The third case ("a listed
   published session still appears") repeats the `newestFirst` cases and the
   E2E journey `e2e/sessions/recently-done-published-sessions.spec.ts`.
3. **The listing's unit spec became a server-and-HTTP Playwright spec**
   (CI repair `33defaba0`). `backend-tests/review/published-session-listing.spec.ts`
   used to call `performPublishedSessionsRead` directly. It now starts a
   dashboard server (`startDashboardServer`), serves a fake GitHub, sends raw
   HTTP, imports `test` from Playwright's `test-support/support/pageTest.ts`,
   and runs `test.describe.configure({ mode: "serial" })` with `beforeAll`
   setup. The handler takes the whole `PinnedTexts` class, though it uses only
   a directory lister and a blob reader, so no narrow typed fake could stand in.
4. **New review cases hand-roll React `act` mounting** (`205af4d48`).
   The two cases added to `frontend-tests/review/published-session-subject.spec.ts`
   each repeat `createRoot` + `act(...)` + `onTestFinished` unmount instead of
   `mountComponent` with retrying assertions. The spec's older heading case has
   the same shape.
5. **The record-path rule is derived again in several places** (`205282d0e`,
   `33defaba0`), undoing slice 1's one contract. The path of a UUID's record
   beside the backlog is computed by the producer's `sessionRecordPath`, by
   `recordPathBesideBacklog` in `publishedSessionSource.ts`, by
   `sessionRecordPathOf` in `publishedSessionReview.ts`, and by a local
   `recordPath` in each of three backend specs, one of which hardcodes
   `.planning/`. The listing imports `publishedRecordFromText` from the review
   handler's module.
6. **The hung-fetch fallback holds only for the test's injected bound**
   (`205282d0e`). `reviewInput` passes `admission: admissionBound(signal)` and
   `fetch: admissionBound(signal)`: two 30 s deadlines started together, under
   a comment claiming "a hung fetch must not spend rev-parse". A fetch that
   hangs to its bound leaves the fallback `rev-parse` already aborted, so the
   page reports "This machine has not fetched this project's published trunk."
   instead of answering from the last fetched trunk. The backend cases reach
   the function only by `vi.spyOn(projectFolders, "projectFolder")`, and assert
   wall-clock `elapsed` windows, which are load-sensitive. The same commit
   replaced a type guard in `reviewInput` with `subject as ReviewedStorySubject`.

## Goal and scope

A developer who opens a published session whose recorded commits this machine
lacks sees a published-session gap, and a hung fetch still answers from the
last fetched trunk. The published-session review and listing are proved by
tests that exercise production code directly, with test support smaller than
before plan 746's execution.

**Exclusions.** Does not change the successful published-session answer, kept
session unavailable gaps, Land routing, listing suppression, or the pinned
listing path. Does not convert unrelated existing Playwright frontend or
backend specs.

## Current decisions

- **Published unavailable has its own comparison.** Stop calling
  `unavailableSessionCommitsReview` from `publishedSessionReview`. Answer
  `kind: "landing-unavailable"` with `comparison: "published-session"` (widen
  the contract literal union) and the same published-missing explanations.
  Extend `reviewsPublishedSession` so that unavailable shape names published
  changes the way the success kind does. Kept-session callers keep
  `comparison: "session-commits"`.
- **Recently done's gaps are a pure derivation.** The gap list is a function
  of the done read and the published-sessions read
  (`recentlyDoneProblems(done, publishedSessions)` or equivalent, beside
  `useRecentlyDone`). `RecentlyDoneReadGaps` takes narrow typed inputs
  (`problems`, `unreadable`, `details`) and is exported so a spec mounts it.
  The frontend-app substitute answers the published listing as before
  `6cb718146`: an empty listed set.
- **The listing handler takes what it reads.** `performPublishedSessionsRead`
  takes a directory lister (`PinnedLister`) and a blob reader
  (`(file: ListedPath) => Promise<string>`), not `PinnedTexts`;
  `performedRead.ts` adapts `pinned.lister(...)` and `pinned.blobReader(...)`.
  A missing directory reaches the handler as an empty listing, since
  `listRepositoryDirectoryViaGh` maps GitHub's 404 to `[]`.
- **One record-path rule.** `session-record.mjs` gains
  `sessionRecordPathBeside(backlogPath, sessionId)`, Node-free string joining
  of the backlog's directory and `sessionRecordRelativePath`. The producer's
  `sessionRecordPath`, `publishedSessionSource.ts`, `publishedSessionReview.ts`,
  `recordsBesideBacklog.ts` and the backend specs use it. Record validation
  (`publishedRecordFromText`) moves out of the review handler's module to one
  that both the listing and the review import.
- **The published source takes typed inputs and a fresh fallback bound.**
  `fetchedPublishedSessionSource` takes the checkout path and bound
  factories: the fetch's bound, and the fallback `rev-parse`'s bound created
  only after the fetch settles. `reviewInput` resolves `projectFolder` and
  composes the production factories from the request signal. `reviewInput`
  narrows the story subject by type, without a cast.

## Decisive premises

Observed read-only at `42a660a17` (findings 2–6) and `576150249` (finding 1)
on 2026-11-21.

| Consuming operation | Observation |
| --- | --- |
| Unavailable published answer shape (slice 2) | `publishedSessionReview` returns `unavailableSessionCommitsReview(...)` when the pair is missing (`dashboard/server/publishedSessionReview.ts`). That helper sets `comparison: "session-commits"` (`storyReviewSessionCommits.ts`). |
| UI chrome for that shape (slice 2) | `npx tsx` importing `storyReviewContract.ts` with `{ kind: "landing-unavailable", comparison: "session-commits" }` yields `reviewsSessionCommits: true`, `reviewsPublishedSession: false`. `reviewDescription` then returns "Read-only: this session's kept commits."; `toolbarComparisonName` returns "Session commits". |
| Mounting entry (slices 1–3) | `dashboard/test-support/component-mount/mountComponent.ts` exists; `dashboard/frontend-tests/README.md` § Which entry a case uses names it, with `IS_REACT_ACT_ENVIRONMENT` unset and `expect.element` / `expect.poll`. `frontend-tests/sessions/sessions-sidebar-*.spec.ts` use it. |
| Gap rendering coverage (slice 3) | `git grep -ln assignment-gap dashboard/frontend-tests` lists only `recently-done-published-listing-gap.spec.ts`, so the mounted gaps case is the only frontend render proof of either gap once that spec goes. |
| Test-support growth to remove (slice 3) | `git show --numstat 6cb718146 -- dashboard/test-support`: substitute +15/−2, new module +79, service state +21/−51, mounted commands +2. `git grep putFrontendPublishedSessions` finds only the listing-gap spec. |
| Listing handler inputs (slice 4) | `performPublishedSessionsRead(pinned, source, read, signal)` calls only `pinned.lister(source, revision, signal)` and `pinned.blobReader(source, revision, signal)`. `ghContents.ts` returns `[]` for a 404 directory listing. |
| Record-path copies (slice 5) | `git grep -n "sessionRecordRelativePath\|recordPathBesideBacklog\|sessionRecordPathOf"` lists the producer, `publishedSessionSource.ts`, `publishedSessionReview.ts`, and `published-session-listing.spec.ts` (`.planning/` literal), `published-session-review.spec.ts`, `published-session-review-request.spec.ts`. |
| Bounds start together (slice 6) | `storyReviewInput.ts` passes `admissionBound(signal)` for both `admission` and `fetch`; `admissionBound` creates `AbortSignal.timeout(30_000)` at call time (`storyReviewHistoricalFileAdmission.ts`). `revisionAtOrigin` catches the aborted `rev-parse` as `undefined`, which becomes the 404 "has not fetched" refusal. |
| Hung fetch is reproducible (slice 6) | Plan 746's probe: origin `ssh://example.invalid/x.git` with `core.sshCommand "sh -c 'sleep N'"` aborts at its bound under `execFile`; the existing hung-fetch case in `published-session-review-request.spec.ts` uses it. |

## Outside-in proof

| Promise | Owning slice and observation |
| --- | --- |
| Published review cases mount the owning component | 1. `published-session-subject.spec.ts` passes with no `act`, `createRoot` or `IS_REACT_ACT_ENVIRONMENT` in it. |
| An unavailable published-session review names published changes | 2. A mounted frontend case shows published-session chrome, with no "kept" / "Session commits"; backend asserts `comparison: "published-session"` and the published-missing explanation; kept-session cases still use `session-commits`. |
| A failed listing shows as a gap, proved without the frontend app | 3. Unit cases on the derivation and one mounted gaps case; the Playwright listing-gap spec and its test-support additions are gone. |
| Listing answers unchanged, proved at the handler | 4. Plain Vitest cases call the handler with typed functions; the published-sessions E2E journey and header journeys pass. |
| One record-path rule | 5. Producer, Dashboard and specs pass; the path grep finds only the contract's derivation. |
| A hung fetch answers from the last fetched trunk | 6. A case with a fetch hanging past its bound and a fallback bound equal to it answers the last fetched trunk's result; it fails with both bounds started together. |

## Ordered slices

### 1. Published-session review cases mount through `mountComponent`

Type: Structure
Status: done

**Structure.** Rewrite the cases in `frontend-tests/review/published-session-subject.spec.ts`
that hand-roll `createRoot` and React `act` — the heading case and the two
cases added in `205af4d48` — to mount through `mountComponent`, with
`IS_REACT_ACT_ENVIRONMENT` unset and retrying assertions. Behavior and
assertions stay the same. This removes finding 4 and gives slice 2's case its
form.

**Proof.**
```
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:frontend -- review/published-session-subject
git grep -n -E "\bact\(|createRoot|IS_REACT_ACT_ENVIRONMENT" -- dashboard/frontend-tests/review/published-session-subject.spec.ts   # none
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run lint
```

**Accepted proof.** `caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:frontend -- review/published-session-subject`
passed seven cases. The published UUID and one-file review with a close time
exercise the heading, context and refresh status of their owning components.
The planned grep found no local React mount or act setup. The first run
exposed a phrase locator that missed the paragraph, then the nested time
locator passed with the same localized timestamp expectation.

### 2. Unavailable published review names published changes

Type: Behavior
Status: done

**Behavior.**
- **Pre-condition:** a published session record whose recorded pair this
  machine's Git lacks.
- **Trigger:** opening that session's review.
- **Postcondition:** the answer is `landing-unavailable` with
  `comparison: "published-session"` and the published-missing explanation.
  The page names published changes (description / toolbar), not kept session
  commits. Kept-session unavailable gaps are unchanged.

**Proof.**
- Extend `published-session-review.spec.ts` so the missing-pair case asserts
  the published comparison and fails while `comparison` is still
  `"session-commits"`.
- Add a mounted case in `published-session-subject.spec.ts`, in slice 1's
  form, that renders the unavailable published answer and fails on
  kept-session chrome.
- Existing kept-session unavailable cases still pass.
```
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:backend -- review/published-session-review review/ad-hoc-review-kept-unavailable
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:frontend -- review/published-session-subject
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run typecheck:dashboard
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run lint
```

**Accepted proof.** The backend `review/published-session-review review/ad-hoc-review-kept-unavailable` selection passed 20 cases. It checks the real decoded answer for a close record whose recorded pair is absent and the successful answer at later trunk.
The frontend `review/published-session-subject` selection passed eight cases, including the actual review region’s accessible description, toolbar and feedback. The `review/story-review-toolbar-truthful-gaps` and `sessions/recently-done-ad-hoc-review-gaps --reporter=list` selections passed another eight kept and landed cases.
The backend and mounted regression tests both failed on the old product. The Dashboard typecheck passed. Commands used the local gate environment and sleep guard.

### 3. Prove Recently done's read gaps without the frontend app

Type: Structure
Status: done

**Structure.** Apply the "Recently done's gaps are a pure derivation"
decision. Replace `recently-done-published-listing-gap.spec.ts` with plain
Vitest cases on the derivation (published listing unavailable; both reads
unavailable, done-catalog problem first; a listed answer adds no gap) and one
mounted `RecentlyDoneReadGaps` case showing two problems in order. Drop its
third case, which the `newestFirst` cases and the E2E published-sessions
journey already cover. Then remove what only that spec used:
`publishedSessionsBySource`, `putFrontendPublishedSessions`,
`FrontendPublishedSessionsPublication`, the substitute's arranged branch, the
mounted-commands plumbing, and `frontendRecentlyDonePublications.ts` with its
re-exports, returning the done-publication helpers to
`frontendServiceState.ts` as they stood at `6cb718146^`. This removes
finding 2 with Recently done's behavior unchanged.

**Proof.**
- The new cases fail when the derivation drops the published listing's
  problem (scratch break, reverted).
- `git diff --stat 6cb718146^ -- dashboard/test-support/support/frontendAuthenticatedReadSubstitute.ts dashboard/test-support/support/frontendServiceState.ts dashboard/test-support/support/mountedDashboardCommands.ts`
  shows no added lines, and `frontendRecentlyDonePublications.ts` does not
  exist.
```
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:frontend -- sessions/recently-done-published-session-launch sessions/recently-done-read-gaps
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run test:e2e -- e2e/sessions/recently-done-published-sessions.spec.ts
git grep -n -E "putFrontendPublishedSessions|publishedSessionsBySource|frontendRecentlyDonePublications" -- dashboard   # none
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run typecheck:dashboard
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run lint
```
Name the new spec for what it proves; `sessions/recently-done-read-gaps` above
stands for that name.

**Accepted proof.** The `sessions/recently-done-published-session-launch sessions/recently-done-read-gaps` frontend selection passed eight cases. The mounted case observes the two paragraphs in order from typed done and listing answers. The scratch break dropped the listing problem and failed the three cases that observe it. The original source bytes were restored and the eight cases passed again.
The published-session journey passed in Chromium, including the kept Done launch and the cross-machine review. Seven related catalog, unreadable-record, retry, and latency journeys passed, along with the retained done-navigation and mounted harness cases. Dashboard typecheck passed.
The three retained substitute files match `6cb718146^`, their separate publication module is deleted, and the retired substitute symbols have no hits. This removes 64 lines of test support. The local gate arguments and sleep guard apply to the focused commands.

### 4. Unit-test the published listing through typed reads

Type: Structure
Status: done

**Structure.** Apply the "listing handler takes what it reads" decision.
Rewrite `published-session-listing.spec.ts` as plain Vitest calling
`performPublishedSessionsRead` with in-memory lister and blob-reader
functions: two records listed; malformed and wrong-path files skipped; a
two-range record skipped; an empty listing answers no sessions; a lister
refusal propagates. Keep the `parseRequestedRead` admission cases. Remove the
dashboard server, fake GitHub, raw HTTP, `pageTest`, serial mode and
`beforeAll`. The HTTP route stays proved by the E2E journey and the header
journeys' counted listing read. This removes finding 3 with the listing's
answers unchanged.

**Proof.**
```
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:backend -- review/published-session-listing observation/authenticated-read-listed-records
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:frontend -- navigation/dashboard-header
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run test:e2e -- e2e/sessions/recently-done-published-sessions.spec.ts
git grep -n -E "pageTest|dashboardServer|fakeGitHub|rawHttp" -- dashboard/backend-tests/review/published-session-listing.spec.ts   # none
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run typecheck:dashboard
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run lint
```

**Accepted proof.** The `review/published-session-listing observation/authenticated-read-listed-records` backend selection passed 11 cases. The handler observes ordered valid records, skipped malformed and wrong-path records, skipped extra ranges, an empty listing, and propagated lister refusal. The request-admission cases retain pinned and unpinned coverage.
The `navigation/dashboard-header` frontend selection passed nine cases, including the 21 opening reads and six per source on switch. The selected published-sessions E2E passed through the pinned route and opened the other machine’s review. The retired server and Playwright imports are absent. Dashboard typecheck passed after fixing a test pair’s static type. The local gate arguments and sleep guard apply.

### 5. One record-path rule beside the backlog

Type: Structure
Status: done

**Structure.** Apply the "one record-path rule" decision. Add
`sessionRecordPathBeside` to `session-record.mjs`; make the producer,
`publishedSessionSource.ts`, `publishedSessionReview.ts`,
`recordsBesideBacklog.ts` and the three backend specs use it, deleting
`recordPathBesideBacklog`, `sessionRecordPathOf` and the specs' local
`recordPath` helpers. Move `publishedRecordFromText` out of
`publishedSessionReview.ts`. This removes finding 5 with record paths
unchanged.

**Proof.**
```
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR /opt/homebrew/bin/bash scripts/test.sh Distribution/tests/skills/dough-land/session-record-publication.test.mjs
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:backend -- review/published-session-listing review/published-session-review review/published-session-review-request
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR /opt/homebrew/bin/bash Distribution/evaluation/tests/native-harness/native-evidence-identity.sh
git grep -n -E "recordPathBesideBacklog|sessionRecordPathOf|const recordPath = \(sessionId" -- dashboard Distribution   # none
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run typecheck:dashboard
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run lint
```
The producer closure change makes native evidence keyed on it stale until its
next manual run. Paid runs stay manual.

**Accepted proof.** The producer’s `session-record-publication.test.mjs` passed four cases under the Homebrew Bash test runner. It reads the actual remote’s literal record path and checks the accepted Git pair. The 23-case backend review and listing selection includes a relocated backlog with independently specified listing path, and the cross-machine E2E passed. The credential-free `native-evidence-identity.sh` harness and Dashboard typecheck passed.
All three backend specs reference the shared path, and the old helper grep is empty. Ten root, nested and normalized path comparisons matched the previous producer’s POSIX output. The first backend run caught incorrect use of an existing MakeMe named example and passed after the fixture fix. Paid native evidence remains manual as planned. The local gate arguments and sleep guard apply.

### 6. A hung fetch answers from the last fetched trunk in production

Type: Behavior
Status: planned

**Behavior.**
- **Pre-condition:** a checkout whose last fetched trunk lacks the requested
  UUID's record, and an origin whose fetch hangs past its bound.
- **Trigger:** resolving the published source for that UUID.
- **Postcondition:** the fallback reads the last fetched trunk with its own
  budget, so the review answers "This project published no such session."
  rather than "This machine has not fetched this project's published trunk."
  A present UUID still answers without fetching; an absent one fetches once.

Apply the "published source takes typed inputs and a fresh fallback bound"
decision, including the typed narrowing in `reviewInput`.

**Proof.** Rewrite the three source cases in
`published-session-review-request.spec.ts` to pass the checkout path and
bound factories directly, without `vi.spyOn` and without wall-clock `elapsed`
assertions. The hung-fetch case gives the fetch and the fallback the same
short bound; it fails while both bounds start together.
```
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:backend -- review/published-session-review-request review/published-session-review review/ad-hoc-review-subject review/ad-hoc-review-file
git grep -n -E "vi\.spyOn\(projectFolders|elapsed" -- dashboard/backend-tests/review/published-session-review-request.spec.ts   # none
git grep -n "as ReviewedStorySubject" -- dashboard/server   # none
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run typecheck:dashboard
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run lint
```

## Local gates

- Apply the
  [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written.
- Before authoring or changing a test, apply
  [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and the
  [North Star](../../NORTH-STAR.md): add nothing to `dashboard/test-support/`
  or `Distribution/tests/support/` outside MakeMe builders and page objects;
  new or rewritten frontend cases mount the owning component without
  `actSettled` or React `act`; new or rewritten backend and frontend cases use
  plain Vitest, never `@playwright/test`. A CI repair follows the same rules;
  when a repair seems to need a wrapper or an environment, reshape the
  production seam instead.
- Keep default timeouts and never use `test.slow()`.
- Run long macOS checks on AC power under `caffeinate -s -i`, per
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- Use the pinned Node from `.node-version`, and put Homebrew Bash 5 on
  `PATH` for `scripts/test.sh`.
- Run each slice's focused commands as written, with
  `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR`.
  Hosted CI settles the full groups.

## Plan review

Slice-plan refinement was not needed. Slice 1 reshapes the spec that slice 2
extends, so it comes first. Slices 3–6 each remove one finding with their own
proof loop and no shared preparation; slice 5 precedes slice 6 because both
edit `publishedSessionSource.ts` and the request spec, and slice 6 then
rewrites the cases over the single path rule. Plan size is six slices. This
review found no remaining slice-specific concern.
