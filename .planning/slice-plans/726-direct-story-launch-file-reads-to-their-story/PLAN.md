# Direct story-launch file reads to their story

**Identity:** SEED-413#refuse-story-launch-session-file-reads
**Source:** [Direct story-launch file reads to their story](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#refuse-story-launch-session-file-reads)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Give dashboard readers the same direction from a story launch's session-addressed
diff and file text as from its session-addressed review. For well-formed requests
whose project and held session record resolve, decide eligibility from the launch
subject before selecting or reading a comparison. Preserve story-addressed reads
of the same captured file and standalone ad hoc reads of valid or mismatched pairs.
Query shape, origin and method checks, lookup failures, deadlines, and follow-up
reads keep their current rules. The [handler contract correction](../725-narrow-ad-hoc-review-handler-contracts/PLAN.md)
owns typed-input, adapter-placement, cancellation, and builder changes.

## Approach and decisions

- Reuse `namedSessionRecord` to resolve the project adapter's kept records by
  host and session ID. Move the story eligibility check and its current
  `RefusedRequest` into the shared session-review lookup so the snapshot and
  both file handlers consult it once. Use the recorded launch's story identity,
  which `launchSubject` derives from `storyOf`. Keep this check out of generic
  session lookup, whose callers also include final reports and session actions.
- Admit the session subject before the branch between a retained launch reference
  and a kept comparison pair. The story arm of `admitReviewedFile` keeps using
  story workspace or historical admission. `launchBoundaryAnswer` already
  translates `RefusedRequest` to status and `{ error }` for both endpoints.
- [ADR 0008, Project Dashboard Domain and Architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  puts machine-local launch evidence alongside published story facts. The
  recorded launch routes the reader to the story, and the historical story
  read still uses its own comparison admission. The
  [North Star](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  keeps the typed boundary over kept state and avoids new test support.
- The neighboring correction also consolidates the lookup. Use the common
  review lookup already on trunk when execution starts, and keep both stories'
  promised behavior if their work overlaps. Neither needs a capability from
  the other.

## Decisive premises

Observed at `b45b1bb51367` in the established preparation worktree, on
2026-11-20 with Node 24.21.0 and the dashboard backend group runner. The
disposable assertions extended the existing one-shot historical admission
case. Its fixture uses real Git, the installed publisher and reporting
receiver, and the existing Codex transport substitute.

| Consuming operation | Observation |
| --- | --- |
| Both file GETs identify the kept launch when addressed by its host and session ID | The case used the captured reference and pair for `delivered.txt` after retiring the fixture workspace. By session and reference, diff and text each returned 200 with the file contents. With the same session and pair alone, both returned 409 with the kept-commits refusal. The expected 400 assertion failed on all four variants. |
| The same comparison is readable by story | In the same case, story identity plus the captured reference and pair returned a 200 diff with `+delivered.txt` and 200 text with `baseline: null` and `tree: "delivered.txt\n"`. |
| One shared subject check covers both file paths and preserves active consumers | A disposable extraction of the current snapshot check before the file reference/pair dispatch produced all four exact 400 responses and kept both story reads at 200. `npm run test:dashboard:backend -- review/ launches/agent-launch-follow-up-file` passed. In a focused repeat, both endpoints also returned the same 400 for the kept launch's valid reference with a mismatched pair. That run included the standalone declared-landing file read in `launches/agent-launch-session-branch-landing.spec.ts` and passed. Dashboard typecheck passed with the disposable extraction. |
| Test route | The `test:dashboard:backend` runner's `--list` selected the existing historical wire case, kept-pair text wire case, and the in-process ad hoc file and subject cases. The same selection executed the wire and typed paths in the observations above. |

## Ordered slices

### 1. A story launch's files are reviewed through its story

Type: Behavior
Status: done

Given a project with a kept story launch, when a well-formed file diff or
file text query addresses the launch by session, return HTTP 400 and
`{ error: "This session belongs to a story launch and is reviewed by its story." }`.
Apply the same rule with a launch reference or with only a comparison pair.
Resolve subject eligibility before either branch of file comparison admission.
The same captured file remains readable by story. Standalone session review and
file admission retain their existing valid, mismatch, and unknown-subject results.

| Promise | Slice 1 proof |
| --- | --- |
| Both endpoints refuse the story launch and identify which review to open | Extend the existing historical wire case in `review/story-review-one-shot-admission.spec.ts`. Reuse its kept launch, retained comparison and exact endpoint queries. Assert 400 and the exact error body for both endpoints with a valid launch reference and with only the pair. Run the assertions before the guard and after it, checking both request forms discriminate. |
| Refusal precedes comparison and repository admission | Check that the shared subject lookup runs before the reference/pair dispatch. In the existing wire case, use the owned reference with a well-formed mismatched pair as well, and assert the same 400. A scratch version that defers the guard until after comparison admission answers 409 for the mismatch. |
| The story still returns the diff and text of the same file | Keep the story-addressed diff assertion in that wire case and add the story-addressed text assertion with the same reference, pair and path. Assert the actual file content on each success. |
| Standalone ad hoc files still read valid pairs and refuse mismatches | Run `ad-hoc-review-file.spec.ts` for both typed handlers' captured-run reads and the kept-pair diff/mismatch, and `ad-hoc-session-commits-file-text.spec.ts` for the kept-pair text and 409 mismatch at the wire. |
| The snapshot rule, project/session lookup, and adjacent file routes retain their behavior | Run `ad-hoc-review-subject.spec.ts` and `ad-hoc-review-request.spec.ts`, plus the reached backend review and launch cases below. |

## Consumer trace and local gates

The installed consumer trace on the disposable change followed the two
session admission modules, the refusal text, both endpoint names, and the
ad hoc diff/text helpers.

- Run the backend `review/` group. It reaches the typed review and file
  callers, the legacy HTTP callers through `getReview` and the ad hoc helpers,
  historical and working-tree story subjects, and standalone session branches,
  landed runs, and kept commits. Include
  `launches/agent-launch-session-branch-landing.spec.ts` for the separate real
  caller that reads a declared ad hoc landing by reference. Use the historical
  wire case and named ad hoc cases above for the red-to-green loop.
- The follow-up file admission uses `admitHistoricalReviewedFile` directly;
  include `launches/agent-launch-follow-up-file` in the focused regression run
  as adjacent control coverage. Other generic `sessionAdmission.ts` users
  and the historical guidance matches do not call the review-specific lookup.
- The frontend review and Intent observers with route stand-ins check query
  and rendering behavior. The real story E2E readers use story identities,
  and the standalone ad hoc UI opens session review before asking for a file.
  These paths do not observe the newly refused request. The backend wire case
  directly observes the changed error.
- Run `npm run typecheck:dashboard` and `npm run lint` after
  the change, using the repository's staged lint hook at commit. Keep the
  default test timeouts. Apply [Dough MakeMe](../../../.agents/skills/dough-makeme/SKILL.md)
  selection before test edits. The affected backend paths selected MakeMe and
  do not select browser page objects.
- Run `npm run test:dashboard:backend -- <paths>` with Homebrew Bash 5,
  with `NO_COLOR`, `FORCE_COLOR`, and `GIT_ALTERNATE_OBJECT_DIRECTORIES` unset.
  On macOS start the broad run fully awake, on AC under `caffeinate -s -i`.
  On battery, start fully awake with the lid open under `caffeinate -i` and
  check the sleep log afterward per
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  Follow the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Plan review

Slice-plan refinement was unnecessary. One early subject check supplies all
file refusal variants, and the existing historical wire case covers the common
route with one fixture. One Behavior slice fits the 15-active-minute budget
with the proof commands excluded. The expected edited files are below the
250-line check. This review found no remaining slice-specific concern.

## Execution complete

Product advice: no change to direction or the queue. The refusal now gives
the session review's story direction on both file endpoints through one
shared check. For wrap-up, an unconfirmed test-cost hypothesis:
`dashboard/test-support/support/sessionCheckoutWork.ts` `markDone` also
marks fake-Claude sessions Done without listing them idle first. If those
sessions are listed busy, each mark waits out the same 5 s rename wait.
`ad-hoc-session-branch-handoff.spec.ts` "a blank launch identifies one
registered worktree…" was the slowest gate case at 11.7 s. Measure it before
deciding on a follow-up.

## Execution record

- Slice 1 accepted at `e4970798e` + uncommitted change. `reviewedSessionRecord`
  in `dashboard/server/storyReviewSessionAdmission.ts` resolves the kept
  record and refuses a story launch; the snapshot and `admitSessionReviewedFile`
  share it. Red before the guard (`s1-red2`: 200 where 400 expected), green
  after (`s1-green`). Source-review observations are in
  [source-review.md](source-review.md).
- The broad gate first failed at load 28–40 with 8 ad hoc timeouts. The
  [diagnosis record](diagnosis-lifecycle-expiry-timeout.md) traced them to
  `markAdHocDone`, which waited out the 5 s Claude rename wait for each Done
  mark because the fake host listed the session busy. The test-support fix
  lists it `done-live` first, cutting those 10 consumer specs from 333 s to
  147 s summed test time.
- Gate after the fix, at load 10–14: backend `review/` plus both
  `launches/` paths passed, 224 Playwright and 48 Vitest cases, longest case
  11.7 s. Typecheck and lint passed. The refactor pass found nothing to change.
