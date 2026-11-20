# Narrow the ad hoc review handlers' contracts to what they read

**Identity:** SEED-413#narrow-ad-hoc-review-handler-contracts
**Source:** [Narrow the ad hoc review handlers' contracts to what they read](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#narrow-ad-hoc-review-handler-contracts)

## Source and provenance

This plan corrects a completed execution.

- **Story:** `SEED-413#renovate-dashboard-backend-unit-tests`
  (`b3b57f9f92ff351d1abf1df189e994954fc3e4f8:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md`), as Terry
  amended it on 2026-11-19: "A handler's typed contract carries only the data
  its responsibility reads."
- **Trunk guidance:** "Design production code for testability" in
  `Distribution/src/skills/dough-post-change-refactor/references/refactor-checks.md`
  on `origin/main`.
- **Plan:** 721,
  `b3b57f9f92ff351d1abf1df189e994954fc3e4f8:.planning/slice-plans/721-prove-ad-hoc-review-reads-in-process/PLAN.md`.
- **Manifest:** `a354a3ef8..b9ea7f5`: `42a8f2f`, `8cafad2`, `e964711`,
  `1a54cf7`, `62793b0` and `b9ea7f5`.

The execution's outcome review found four corrections. They were checked
again on 2026-11-20 at `b9ea7f5e0` with a clean worktree. The reviewed
modules have no later commit on fetched `origin/main`.

## Goal and scope

The ad hoc review handlers' typed inputs hold only what each read uses. A
departed reader's file read also stops its admission Git. Adapter and
handler code sit in separate modules, and the launch-record scenarios belong
to the launch record builder. The wire answers every non-aborted read as it
does today. The seed holds the scope and its limits.

Excluded:

- Moving `ad-hoc-session-commits-file-text.spec.ts` and the
  Default main landing case of `ad-hoc-session-commits.spec.ts` to unit
  cases. That work belongs to `SEED-413#renovate-remaining-dashboard-backend-unit-tests`.
- Applying the story-launch refusal to file diff and file text. The
  separate product follow-up `SEED-413#refuse-story-launch-session-file-reads`
  owns that change.
- Story-subject admission, beyond taking the handler's signal.
- `Distribution/src/`.

## Current findings

1. **Session inputs accept story-only fields.** In
   `dashboard/server/storyReviewSessionAdmission.ts`, the session variant of
   `ReviewInput<R>` is `R & { subject: ReviewedSessionSubject }`. As a result:
   - A session review read accepts `reference`, `completed` and `historical`
     from `StoryReviewRead`, but `admittedSessionReview` reads only
     `subject` and `run`.
   - A session file read accepts `completion` from `ReviewedFileRead`.
     `admitReviewedFile` (`storyReviewAdmission.ts`, the `"kept" in input`
     branch) repeats the adapter's 400 "The published comparison identity is
     malformed." The wire cannot reach that branch, because
     `storyReviewFileRequest.ts` sends every `completion` to a story subject.
   - `Distribution/tests/support/sessionReviewTestData.mjs` has to strip the
     extra fields itself with `Omit<…, "subject" | "completion">`.
2. **File admission ignores the handler's signal.** `reviewedFileDiff` and
   `reviewedFileText` (`storyReviewFileResponse.ts`) call
   `admitReviewedFile(input)` without their signal. The admission's Git reads
   run under their own `AbortSignal.timeout(30_000)`: `admitKeptPairFile`
   (`storyReviewSessionFileAdmission.ts`) does this, and so do `admitLandedRun`
   and `admitPublishedCompletion` (`storyReviewHistoricalFileAdmission.ts`).
   Observed on 2026-11-20 with an already-aborted signal: a kept run's file
   diff and file text both passed admission, then answered `unavailable` with
   "…could not be read: The operation was aborted".
   `followUpFileAdmission.ts` calls `admitHistoricalReviewedFile` without a
   response.
3. **Placement and naming no longer fit.**
   - `reviewInput` is the only reader of `keptRecords` and `knownSource` for a
     session. It sits beside the handler's admission
     `admittedSessionReview`, and the backend README cites that module.
   - `storyReviewAdmission.ts` holds both the range read's URL adapter
     (`rangeRequest`) and typed file admission (`admitReviewedFile`).
   - `type AdmittedReviewedFile = AdmittedHistoricalReviewedFile` keeps the
     "Historical" name, although the type now covers workspace reads too.
   - The comment on `namedKeptSession` (`sessionAdmission.ts`) says review
     resolves through it, but review no longer does.
   - The lookup from a subject to a `SessionReference` and then to
     `namedSessionRecord` is written in both `storyReviewSessionAdmission.ts`
     and `storyReviewSessionFileAdmission.ts`.
4. **Launch-record scenarios live on the read builder.** The landed ad hoc
   session (`ofLandedAdHocSession`) and the session with a kept run
   (`ofAdHocSessionWithKeptRun`) build `LaunchRecordBuilder` chains, but they
   are steps on `SessionReviewReadBuilder`. Some callers need only the
   records, and they take `.please().kept.records` from a read:
   - `keepSessionWithKeptRun` in `dashboard/test-support/support/adHocReview.ts`;
   - the "other session" in `ad-hoc-review-file.spec.ts`.

## Preserved promises and constraints

- Wire behavior is unchanged for every request whose caller stays active.
  This covers methods, origins, query shapes, statuses, messages, and the
  existing 30-second admission deadlines and their refusal behavior. The page
  query builders `storyReviewQuery` and `reviewedFileQuery` emit the same queries.
- Handler refusals stay `RefusedRequest` with today's message and status.
- Only adapters read process-wide stores (the backend README rule). Cases
  build the typed state through MakeMe.
- Story subjects keep their admission path.
- Follow-up file admission keeps its existing 30-second deadlines.
- No changed file goes over the 250-line check.
  `Distribution/tests/support/launchTestData.mjs` is at 244 lines, so slice 4
  places the new steps without growing that file past the check.
- Dashboard Test Support stays frozen. This plan adds nothing there except
  through MakeMe builders.

## Approach and reuse

- **Typed reads (change).** Add a session review read type,
  `{ subject: ReviewedSessionSubject, run? }`, and a session file read type,
  `{ subject: ReviewedSessionSubject, reference?, baseline, tree, path, oldPath? }`.
  Put them beside the story reads in `dashboard/src/storyReviewRead.ts` and
  `dashboard/src/reviewedFileRead.ts`, so that the page and the adapter share
  them. The session variant of `ReviewInput` uses these types. The executor
  chooses the exact shape: either discriminated reads, or wire reads that the
  adapter narrows. Under either shape, the page's query output stays the
  same, and the compiler refuses a story-only field on a session input.
- **Signal (change).** The handler's signal reaches `admitReviewedFile`, both
  session file admission paths, and `admitHistoricalReviewedFile`. Combine
  the request signal with `AbortSignal.timeout(30_000)` at each existing
  timer boundary. Check the original request signal before turning an
  interrupted read into a verdict. Request cancellation reaches the
  boundary's `next` path. Deadline expiry with an active request keeps the
  existing refusal. The response retains its 60-second `storyReviewWaitMs`
  bound. Follow-up admission keeps its existing local deadlines.
- **Placement (change).** The executor places the moved code within these
  limits:
  - `reviewInput` moves to an adapter module, beside or shared by
    `storyReviewRequest.ts` and `storyReviewFileRequest.ts`.
  - `rangeRequest` and `AdmittedStoryReviewRange` move to the range read's
    adapter.
  - The admitted file type gets one name, which covers every file read.
  - One helper resolves a session subject against `KeptSessionState`.
  - The README pointer in `dashboard/backend-tests/README.md` names the
    module that defines `ReviewInput` after the move.
- **MakeMe (reuse and change).** Apply
  [dough-makeme](../../../.agents/skills/dough-makeme/SKILL.md). The two
  scenarios become named domain steps that `makeMe.aLaunchRecord` reaches.
  `SessionReviewReadBuilder` keeps `ofSession`, `keeping`, `alsoKeeping` and
  `readingFile`, and composes the record steps. Record-only callers take
  records from `aLaunchRecord`.

## Decisive premises

Observed on 2026-11-20 at `b9ea7f5e0` in this worktree (Node 24.21.0,
Vitest 5.1.0, load about 3). The scratch files were removed after each run.

| Consuming operation | Observed result and limit |
| --- | --- |
| An already-aborted signal ends a `runGit` call at once (slice 3) | Ran `execFile("git", ["cat-file", "-t", "HEAD"], { signal: AbortSignal.abort() })` three times. Each call rejected with `AbortError` / `ABORT_ERR` in 2–3 ms. `retainedPairFiles` maps such a rejection to `{ missing: "objects" }`. |
| A unit case observes that admission ignores the signal today (slice 3) | Ran a scratch Vitest spec through `npx vitest run --root . --config dashboard/backend.vitest.config.mts`. It used the existing kept-run arrangement (`makeMe.aSessionReviewRead.ofAdHocSessionWithKeptRun(…).readingFile(…)`) and called `reviewedFileDiff` and `reviewedFileText` with `AbortSignal.abort()`. Both resolved `{ kind: "unavailable", explanation: "The file's diff/text could not be read: The operation was aborted" }`. Admission passed, so this case fails before the fix. After the fix, a rejection with the abort is expected; that result is inferred from the code and is the slice's own red-to-green step. |
| Admission deadline expiry keeps its refusal (slice 3) | On 2026-11-20 at `ab0feff62`, a Node 24.21.0 probe made the requested `AbortSignal.timeout(30_000)` expire immediately with the caller still active. Over a real MakeMe repository, `reviewedFileText` for a kept pair refused with 409 for the kept commits, and `reviewedFileDiff` for a retained landing refused with 409 for missing or unreadable comparison objects. |
| Which modules import the moved names (slice 2) | `reviewInput` is imported by `storyReviewSnapshot.ts` and `storyReviewFileResponse.ts`. `ReviewInput` is imported by `storyReviewAdmission.ts` and `storyReviewRecordAdmission.ts`. `KeptSessionState` is imported by `storyReviewSessionFileAdmission.ts`. `AdmittedStoryReviewRange` is imported by `storyReviewRange.ts`. |
| Who builds the two scenarios (slice 4) | `ofLandedAdHocSession`: `ad-hoc-review-landed`, `-kept-unavailable` and `-file.spec.ts`. `ofAdHocSessionWithKeptRun`: `ad-hoc-review-file.spec.ts` and `keepSessionWithKeptRun`, whose only importer is `review/ad-hoc-session-commits-file-text.spec.ts`. |

## Ordered slices

### 1. Session handler inputs carry only what a session read uses

Type: Structure
Status: planned

Structure: Give the session review read and the session file read their own
typed shapes (finding 1), and use them in the session variant of
`ReviewInput`. The adapters produce these shapes. Delete the session-side
`completion` refusal in `admitReviewedFile`, and the builder's `Omit` in
`sessionReviewTestData.mjs`. The wire is unchanged. This slice enables slice
3, which threads the signal through the narrowed admission.

Proof:
- `npm run typecheck:dashboard` and `npm run lint` pass.
- A scratch unit case that passes `historical` on a session review input, or
  `completion` on a session file input, fails the typecheck. Remove the
  scratch case afterwards.
- `npm run test:dashboard:backend -- review/` passes unchanged. This covers
  the `ad-hoc-review-{landed,kept-unavailable,subject,file,request}.spec.ts`
  cases and the story `story-review-*` specs.

### 2. Adapter and handler responsibilities sit in separate modules

Type: Structure
Status: planned

Structure: Make the placement and naming changes of finding 3:
- Move `reviewInput` to an adapter module.
- Move `rangeRequest` to the range read's adapter.
- Give the admitted file type one name, and drop the alias.
- Write the kept-session lookup from a subject once.
- Fix the `namedKeptSession` comment.
- Update the README pointer.

The wire is unchanged.

Proof:
- An import search shows `keptRecords` and `knownSource` reached from
  session paths only through adapter modules.
- No handler module (`storyReviewSnapshot.ts`, `storyReviewFileResponse.ts`
  and the session admissions) imports the store reader.
- Every path and name the README states exists.
- `npm run typecheck:dashboard`, `npm run lint` and
  `npm run test:dashboard:backend -- review/` pass.

### 3. A departed reader's file read stops its admission Git

Type: Behavior
Status: planned

Behavior: Given a session with one kept run or a retained landing, when a
caller cancels a file diff or file text request, admission's Git read stops
and the handler rejects with the request abort. The same signal reaches
story historical admission. When an existing 30-second admission deadline
expires while the request is active, the corresponding admission still
answers its existing refusal. Follow-up file admission keeps its own
30-second deadlines.

Proof:
- New cases in `review/ad-hoc-review-file.spec.ts` fail at the current
  revision, which answers `unavailable` as observed. They pass after the
  change.
- The cases also fail under a scratch edit that gives admission its own
  `AbortSignal.timeout(30_000)` alone again.
- Use a controlled deadline to observe that admission requests 30 seconds and
  produces the existing timeout refusal while the caller's signal stays
  active. Exercise the kept-pair and historical admission paths without
  waiting 30 seconds. A scratch change that drops the deadline or treats its
  expiry as request cancellation fails this proof.
- `npm run test:dashboard:backend -- review/ launches/agent-launch-follow-up-file`
  passes. That run covers both follow-up file specs.
- `npm run typecheck:dashboard` and `npm run lint` pass.

### 4. Launch-record scenarios are launch record builder steps

Type: Structure
Status: planned

Structure: Make the landed ad hoc session and the session with a kept run
named steps that `makeMe.aLaunchRecord` reaches. Then make these changes:
- `SessionReviewReadBuilder` composes the two steps.
- `keepSessionWithKeptRun` takes its records from `makeMe.aLaunchRecord`.
- The "other session" in `ad-hoc-review-file.spec.ts` also takes its
  records from `makeMe.aLaunchRecord`.

`launchTestData.mjs` stays within the 250-line check. If it would not, a
cohesive part moves to a builder layer of its own in the existing builder
chain, as `launchReportingTestData.mjs` already shows.

Proof:
- `npm run test:dashboard:backend -- review/ad-hoc-review review/ad-hoc-session-commits-file-text`
  passes.
- A search finds no `.kept.records` taken from a read builder outside
  `sessionReviewTestData.mjs`.
- `npm run typecheck:dashboard` and `npm run lint` pass.

## Proof map

| Finding | Slice |
| --- | --- |
| 1. Session inputs carry only what they read; unreachable refusal removed | 1 |
| 2. Request cancellation reaches admission and existing 30-second deadlines retain their refusals | 3 |
| 3. Store reads only in adapter modules; names and lookup; README | 2 |
| 4. Launch-record scenarios on `LaunchRecordBuilder` | 4 |
| Wire unchanged for non-aborted reads | 1–4 (`review/` backend folder, `ad-hoc-review-request.spec.ts`) |

## Current decisions

- The exact types and the destination modules are the executor's choice,
  within Approach.
- The existing scenarios and specs keep their names unless a move requires a
  change.

## Proof and local gates

Follow the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Keep default timeouts and omit `test.slow()`. Apply
[dough-makeme](../../../.agents/skills/dough-makeme/SKILL.md) to affected
test sources.

- **Focused:** use `npm run test:dashboard:backend -- <paths>` with
  `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`.
  Unit cases alone can run through
  `npx vitest run --root . --config dashboard/backend.vitest.config.mts <filter>`.
- **Broader runs:** slices 1–3 run the whole `review/` backend folder,
  because every spec there reads through the changed admission. Use Homebrew
  bash 5, and run on an awake macOS machine on AC power under
  `caffeinate -s -i`. On battery, follow the
  [open-lid procedure](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- **Lint and typecheck:** run `npm run lint` and `npm run typecheck:dashboard`.

## Plan review

Slice-plan refinement was not needed. Each of the four slices carries one
finding and its own proof loop. Slices 1 and 2 are Structure slices placed
before the Behavior that runs through the narrowed admission. Slice 4 is
test-data ownership and depends on slice 1's removal of `Omit`.

This review found no remaining slice-specific concern. The evidence covers
both the ignored caller signal and the existing deadline refusals. Slice 3
proves that callers can cancel and the deadline still applies.
