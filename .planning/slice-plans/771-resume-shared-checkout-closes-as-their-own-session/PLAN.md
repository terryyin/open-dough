# Resume each shared-checkout close as its own session and keep notes advisory

**Identity:** SEED-418#resume-shared-checkout-closes-as-their-own-session
**Source:** [Resume each shared-checkout close as its own session and keep notes advisory](../../seeds/SEED-418-review-published-session-changes.md#resume-shared-checkout-closes-as-their-own-session)
**Source review:** [source-review.md](source-review.md)
**Provenance:** execution retrospective of
SEED-418#disclose-shared-checkout-overlap (plan 766, recoverable as
`7667fc3a8:.planning/slice-plans/766-disclose-shared-checkout-overlap/PLAN.md`),
reviewed commits `c4b05ec`, `841aa35`,
`71efa45`, `304021e`, `9d6e879` on
`claude/disclose-shared-checkout-overlap-in-published-se`.

## Findings

1. **A shared-checkout close can resume as the other session.** Every Default
   main launch plants its first-landing expectation under the same
   `(workspace, branch)` key
   ([`first-landing-expectation.mjs`](../../../Distribution/src/skills/dough-execute-plan/scripts/first-landing-expectation.mjs)
   `expectationKey`; `dashboard/server/startLaunch.ts` gives Default main
   `workspace: project, branch: target`), so a later launch replaces an open
   one's expectation, and clearing either removes both. The Land resume
   paragraph
   ([`publish-reviewed-checkout.md`](../../../Distribution/src/skills/dough-land/references/publish-reviewed-checkout.md#publish-a-session-close))
   names `workspace`, `branch`, `targetRef`, `backlogPath` and `session` but
   not `landingContext`, so `resumeSessionClose` resolves the identity from
   that shared expectation, or else from the workspace's unclosed native
   evidence
   ([`session-record-publication.mjs`](../../../Distribution/src/skills/dough-execute-plan/scripts/session-record-publication.mjs)
   `namedSession`, `closeTarget`). Plan 766's slice-4 test passes
   `landingContext` explicitly with one Dashboard close only.
2. **A note failure becomes a launch or close failure.** `keepRecord`
   ([`launchRecordBinding.ts`](../../../dashboard/server/launchRecordBinding.ts))
   rethrows a note error after the record is kept, so launch verification
   answers "This machine's launch records could not be written…" for a
   recorded, running session. Notes are read-modify-write with a plain
   `writeFile`
   ([`sharedCheckoutNotes.ts`](../../../dashboard/server/sharedCheckoutNotes.ts)),
   so a torn note makes `parseSharedCheckoutNote` throw: later keeps in that
   checkout fail, and `publishSessionClose` throws before any push.
3. **Land close state is a second local session store that never retires.**
   [`session-close-state.mjs`](../../../Distribution/src/skills/dough-execute-plan/scripts/session-close-state.mjs)
   repeats the Git-path resolution and read/ENOENT/write code of
   [`execution-session-evidence.mjs`](../../../Distribution/src/skills/dough-execute-plan/scripts/execution-session-evidence.mjs),
   and nothing deletes `open-dough/session-close/<sessionId>.json` after the
   record publishes; in Default main one file per close accumulates.
5. **(low) The published mark's value lives in the local-note module.**
   `sharedCheckoutUncertainty` is in
   [`shared-checkout-note.mjs`](../../../Distribution/src/skills/dough-execute-plan/scripts/shared-checkout-note.mjs),
   not the record contract
   [`session-record.mjs`](../../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs);
   `dashboard/server/publishedSessionReview.ts` imports local-note code to read
   a published record.

Full evidence: the retrospective outcome report (execution-local evidence
`open-dough/evidence/retro-outcome-report.md` in the source worktree's Git
directory); the excerpts above carry what this plan needs.

## Outcome and preserved promises

A developer or agent resuming or closing a Land session in a shared checkout
gets that session's own record; a note that cannot be written or read neither
misreports a kept launch nor blocks a later launch or close; local close state
is owned once and removed once its record is published.

Preserve every promise of the source story: the Dashboard notes when overlap
began beside each affected open launch, including later-opening overlap; the
publisher marks ranges accepted at or after that start and unmarked records
stay readable; the published review shows the existing Done warning; no mark
for an isolated worktree, an earlier-closed session, a native close or an older
installation; two closes in one checkout each resume their own close without
rebuilding the range or pushing accepted work again; concise Land and wrap-up
guidance. Under
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state),
expectations, notes and close state stay local; only the mark is published.

**Excluded.** Whether a landed but un-Done Default main session should stop
counting as open (product advice from the retrospective, not this
correction). Test-support restructuring (retrospective finding 4, owned by
SEED-413 renovation). The attribution spec timing (finding 6; owned by
`SEED-413#optimize-done-capture-family-cases` if CI repeats it). Lost updates
between two keeps noting one checkout at the same instant: the atomic replace
removes torn notes, and a lost update can only leave a later `since`, which the
retrospective did not report as observed. Merging session evidence and close
state into one per-session file (a larger design choice; this plan shares
their store only).

## Current decisions

- **One open expectation per launch.** Planting keeps every open launch's
  expectation under its `(workspace, branch)` key; clearing after a launch's
  accepted capture removes only that launch's, and removing the last one
  removes the file, as today. Publication without
  `landingContext` resolves a launch only when exactly one is open under the
  key; with several it resolves none. A legacy single-record expectation file
  reads as one open launch. The Dashboard plants through the project's
  installed module and its reporting-directory copy clears, so both come from
  the same release; an older module reading the new file names no launch,
  which is safe.
- **A close does not guess between launches.** When the expectation names
  several open launches and the close names neither `landingContext` nor
  `session.sessionId`, `publishSessionClose` and `resumeSessionClose` refuse
  with `session-identity-missing` before any push instead of falling back to
  the workspace's native evidence. The native-evidence fallback stays for a
  workspace with no open expectation: a native story preparation resumes
  through it in its owned workspace and receives no session id to pass.
- **The guidance names the launch.** The resume paragraph passes the original
  launch's `landingContext` when resuming a Dashboard launch's close: resuming
  is still that launch's first publication, as
  [dashboard-completion.md](../../../Distribution/src/skills/dough-land/references/dashboard-completion.md)
  already says for retries and resumes. Keep the paragraph as short as today.
- **A note's presence is overlap evidence.** A note that exists but cannot be
  read or parsed, or names no valid `since`, means overlap of unknown start:
  the publisher marks every range. The Dashboard writer replaces such a note
  with the noted launch's own `launchedAt`, the earliest the overlap could
  have begun, so it stays conservative and valid. One parse result in
  `shared-checkout-note.mjs` carries this for both sides.
- **Notes are written whole and never fail a keep.** The writer uses
  [`replaceFile`](../../../dashboard/server/fileReplacement.ts) (PFE: the
  Dashboard's existing whole-file replacement). `keepRecord` reports a note
  failure with `console.warn`, as
  [`retainedAnswers.ts`](../../../dashboard/server/retainedAnswers.ts) does,
  and resolves, so launch verification answers `launched`
  (`launchVerification.ts` answers unresolved only when `keepRecord` or
  `removeLaunchedStart` rejects).
- **One local Git-path JSON store.** A new module under
  `Distribution/src/skills/dough-execute-plan/scripts/` resolves a Git path,
  reads it (absent is `undefined`), replaces it whole and removes it; session
  evidence and close state both use it. List the new module in
  [`src/install/open-dough-execution-payload.sh`](../../../src/install/open-dough-execution-payload.sh)
  beside its users (missing entries failed CI before).
- **Close state retires on publication.** When a close's record status is
  `published` (first close, resume, or retained-record publication), its
  saved close state is removed. Any other status keeps it for the next resume.
- **The record contract owns its marks.** The `"shared-checkout"` value moves
  to `session-record.mjs`; the note module and `publishedSessionReview.ts`
  import it from there.
- **File size.** `session-record-publication.mjs` is 237 lines and slices 2
  and 6 add to it. Slice 2 moves close identity resolution (`namedSession`,
  `closeTarget`, `identityRefusal`, `sharedCheckoutNote`) into a new
  `session-close-identity.mjs` (listed in the payload); callers stay
  `publishSessionClose` and `resumeSessionClose`, and slice 2's proof plus the
  existing `Distribution/tests/skills/dough-land/` suites preserve behavior.
  `session-close-resume.test.mjs` (247 lines) is not grown; new cases go in a
  sibling file.

## Decisive premises

| Consuming operation | Observation | Result |
| --- | --- | --- |
| Slices 1–2: the defect reproduces through the real API | Scratch `node --test` file in `Distribution/tests/skills/dough-land/` at `9d6e87903` (run with `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES`, removed after): `oneUnpublishedEdit`; launches A then B planted for the workspace's `(workspace, branch)` through `landingContextFile(t, makeMe.aLandingContext.reportingTo(…).referencing(…).please(), { repository: managementContext(workspace), workspace, branch: "land/ad-hoc" })`; A's `publishSessionClose` with `landingContext: A` pushed and lost its answer; `resumeSessionClose` with `workspace`, `branch`, `targetRef`, `session: { workflow }` and A's saved candidate. | Published `"status":"published"` under B's UUID `bbbbbbbb-…`: A's work recorded as B. Without the candidate it found no state for B and threw. The planned fixtures reach the defect. |
| Slice 2: no existing resume relies on implicit identity, and the refusal is red after slice 1 | Scratch application at `16f1d9585` of slice 1's per-launch layout (`launches` list; one open launch resolves, several resolve none; legacy single record reads as one) plus the refusal in `closeTarget` (several open launches, no `landingContext`, no `session.sessionId` → `session-identity-missing` before `namedSession`), reverted after. `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES bash scripts/test.sh` on every `Distribution/tests/skills/dough-land/*.test.mjs`, `dough-story-refinement/preparation-native-session-record-land.test.mjs`, the `dough-story-wrap-up` `*session-record*` and `trunk-closure-owner-ended-record` tests (exit 0). A scratch `node --test` case: A and B planted for `land/ad-hoc`, A's close loses its push answer, `resumeSessionClose` with only `workspace`, `branch`, `targetRef`, `session: { workflow }`. | No caller relies on implicit identity. With slice 1 alone and no native evidence, the resume already answers `session-identity-missing` (resolution names no launch). With an unclosed native session begun in the same checkout (`beginNativeSession`), slice 1 alone resumes as that native session and throws (`git ls-tree … undefined`: no saved state); with the refusal it answers `session-identity-missing`, trunk unchanged, and resuming with A's `landingContext` publishes under A's UUID. Slice 2's refusal case therefore plants that native session. |
| Slice 1: consumers of the expectation file keep working with per-launch entries | Same scratch application at `16f1d9585`: `bash scripts/test.sh` on `first-landing-expectation`, `resolve-publication-landing-context`, `publication-landing-target`, `publication-resume-story-branch`, `dashboard-landing`, `history-preserving-landing-expectation` tests and `Distribution/tests/installation/execution-payload-update.sh`, `install-all-tools.sh`; `OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD=… npm run --silent test:dashboard:backend -- story-branch-landing agent-launch-start-session-landing-admission agent-launch-workspace-reporting-support agent-launch-update-worktree-retry agent-launch-incomplete-reporting-settlement worktree-release-apply` (19 Playwright tests, strict status passed). | Only `first-landing-expectation.test.mjs` "planting writes the expectation…" failed: it asserts the raw file shape `{ workspace, branch, landingContext }`, which slice 1 updates. Every other consumer, including `openFirstLandingExpectation` result assertions, passed unchanged. |
| Slice 1: every Default main launch shares one key | Read at `9d6e87903`: `startLaunch.ts` gives Default main `{ workspace: project, branch: target }`; `completionReporting.ts` plants with `established.workspace`/`.branch` through the installed module. | Confirmed by the scratch run above, where the second plant replaced the first. |
| Slices 3–4: proof routes run here | At `9d6e87903`: `npm run --silent test:dashboard:backend -- review/shared-checkout-note` (4 passed); `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES bash scripts/test.sh Distribution/tests/skills/dough-land/session-close-shared-checkout-resume.test.mjs Distribution/tests/skills/dough-land/session-record-publication.test.mjs` (exit 0). | Both routes run in this checkout. |
| Slice 3: a torn note blocks the close | Scratch `node --test` case at `16f1d9585` in `Distribution/tests/skills/dough-land/` (removed after): `aLaunchLandingContext`, `{"since":` written at `sharedCheckoutNotePathBeside`, `publishSessionClose` with that `landingContext`. | Threw `SyntaxError: Unexpected end of JSON input` with origin's target unchanged. The slice-3 case is red before the change. |
| Slice 4: a note failure rejects `keepRecord` | Scratch Vitest spec at `16f1d9585` in `dashboard/backend-tests/review/` (removed after), built as `shared-checkout-note.spec.ts` builds its cases (`aDoneCaptureCase` with two Default main launches, `keepRecord` of the second), run by `npm run --silent test:dashboard:backend -- review/scratch-note-premise`. | With a directory at the first launch's note path `keepRecord` rejected `EISDIR`; with a torn note it rejected `SyntaxError`. The slice-4 cases are red before the change. |
| Slice 6: a published close keeps its close state today | `session-close-shared-checkout-resume.test.mjs` at `16f1d9585` with a scratch listing of `git rev-parse --git-path open-dough/session-close` after both resumes publish (reverted). | Both sessions' `<id>.json` files remain. The slice-6 assertion is red before the change. |

## Outside-in proof

| Key example | Owner and signal |
| --- | --- |
| Two launches open in one checkout: publication without a landing context names neither; once one clears, it names the other | Slice 1: new cases in `first-landing-expectation.test.mjs` and `resolve-publication-landing-context.test.mjs` |
| Two Dashboard closes in one Default main checkout, each interrupted after an unanswered push, resume with only the inputs the guidance names and publish under their own UUIDs without pushing accepted work again; a resume naming no identity is refused with nothing pushed | Slice 2: new sibling `Distribution/tests/skills/dough-land/session-close-shared-launches-resume.test.mjs` through `publishSessionClose`/`resumeSessionClose` and MakeMe builders |
| A close whose note is torn publishes its range marked | Slice 3: case in `session-record-publication.test.mjs` |
| A launch kept while its note cannot be written stays recorded and its early Done starts; a torn note beside an open launch is replaced and the new launch kept | Slice 4: cases in `dashboard/backend-tests/review/shared-checkout-note.spec.ts` through `keepRecord` |
| A published close leaves no saved close state | Slice 6: the slice-2 sibling test asserts both state files are gone after both resumes publish |

## Slices

### 1. Each launch sharing a checkout keeps its own open expectation

Type: Behavior
Status: done
Proof: new cases, red before: planting launches A and B for one workspace and branch leaves both open; `resolvePublicationLandingContext` without `landingContext` resolves none; after A's context clears, it resolves B; a legacy single-record file still resolves its launch. Existing cases in both files pass.

Behavior: two launches planted under one `(workspace, branch)` → a
publication omits its landing context → it names no launch while both are
open, and the remaining one once the other's capture clears.

Accepted: the cases live in `Distribution/tests/skills/dough-execute-plan/`
(first-landing-expectation, resolve-publication-landing-context); consumer
suites and the 19 landing backend specs passed. `clearFirstLandingExpectation`
is now private; the native-stream fixtures' recorded hash of the module is left
as recorded evidence.

### 2. Two Dashboard closes sharing a checkout each resume as their own session

Type: Behavior
Status: done
Proof: new `session-close-shared-launches-resume.test.mjs`: launches A and B planted for one checkout, each close interrupted after an unanswered push; resuming each with `workspace`, `branch`, `targetRef`, `backlogPath`, `session` and its `landingContext` publishes A's and B's records under their own references with each range once and no second push of accepted work; with an unclosed native session also begun in that checkout, a resume with neither `landingContext` nor `session.sessionId` while both launches are open answers `session-identity-missing` with trunk unchanged (red after slice 1: it resumes as the native session). All suites under `Distribution/tests/skills/dough-land/`, `preparation-native-session-record-land.test.mjs` and the `dough-story-wrap-up` session-record tests pass. Includes the guidance paragraph change and the `session-close-identity.mjs` move, listed in the execution payload with `install-public-payload.sh` passing.

Behavior: two Dashboard closes interrupted in one Default main checkout → each
resumes with the inputs the Land guidance names → each publishes its own
record; a resume naming no identity while both launches are open is refused.

Accepted: the refusal lives in `namedSession` (no native fallback while
several launches are open, via `severalLaunchesOpen` in
`resolve-publication-landing-context.mjs`); `first-landing-expectation.mjs`
exports `openLaunches`. `session-record-publication.mjs` is 155 lines.

### 3. A close whose shared-checkout note is unreadable publishes a marked range

Type: Behavior
Status: done
Proof: a `session-record-publication.test.mjs` case with garbage in `shared-checkout.json` beside the landing context publishes the close with its range marked `"shared-checkout"` (red before: throws before any push). The existing marked, unmarked and native cases pass.

Behavior: a Dashboard close whose note is torn → close → work and record
publish, every range marked.

Accepted: `parseSharedCheckoutNote` never throws; it returns `{ since }` or
the frozen `sharedCheckoutOfUnknownStart`, which `rangeUncertainty` marks.
`scripts/test.sh` needs file paths, not a directory.
CI repair after slice 3 (run 45019512468, e2e agent-completion-quiet Trunk
Wrap Up): `NativeDoneMarks` dropped a quiet report arriving while that
session's Done still ran; a pre-existing race, repaired in `doneMarks.ts`.
CI repair after slice 4 (run 45024335359, Distribution Tests 3/3 run
deadline on a slow runner): `dough-story-refinement/**` moved to shard 1 in
`ci.yml` by `scripts/ci-shard-balance.mjs`; job count unchanged.
CI repair after slice 6 (run 45026371561, lint): `retireCloseState` returned
its untyped argument, typing `publishSessionClose` as `any`; it now only
removes state. Refactor disposition: within slice 6's accepted refactor return.

### 4. A note failure leaves the kept launch recorded

Type: Behavior
Status: done
Proof: new `shared-checkout-note.spec.ts` cases through `keepRecord`: with a directory at the open launch's note path, keeping a second launch resolves, both records are kept and the early-reported Done starts; with a torn note beside the open launch, keeping a second launch resolves and that note now names the open launch's `launchedAt`. The four existing cases and `typecheck:dashboard` pass.

Behavior: a launch kept in a checkout whose note cannot be written or read →
keep → the launch is recorded (verification answers `launched`), the failure is
logged, and a torn note is replaced by a valid conservative one.

Accepted: `sharedCheckoutNoteText` takes the noted launch's `launchedAt` for a
recorded note of unknown start; `review/ad-hoc-session-comparisons` timed out
once at load ~15–18 and passed 3/3 alone.

### 5. One local Git-path store holds session evidence and close state

Type: Structure
Status: done
Proof: unchanged `Distribution/tests/skills/dough-land/` suites, `preparation-native-session-record-land.test.mjs`, the `dough-story-wrap-up` session-record tests and the `dough-execute-plan` session-evidence tests; the new module is listed in the execution payload and `Distribution/tests/installation/install-public-payload.sh` and `execution-payload-update.sh` pass (CI run 44983901805 failed the payload install when a module was missing).

Structure: extract the shared Git-path JSON read/replace/remove module and use
it from `execution-session-evidence.mjs` and `session-close-state.mjs`. Removes
the duplicated store (finding 3) and enables slice 6's removal.

### 6. A published close removes its saved close state

Type: Behavior
Status: done
Proof: the slice-2 sibling test asserts that, after both resumes publish, neither session's `open-dough/session-close/<id>.json` remains (red before), and a case there whose first close publishes directly leaves none. A stopped record keeps its state (the existing resume suites still resume from it).

Behavior: a close whose record publishes → publication → its local close state
is gone; a stopped close keeps it for the next resume.

### 7. The record contract owns the shared-checkout mark

Type: Structure
Status: done
Proof: `typecheck:dashboard`, `session-record-publication.test.mjs`, `session-close-shared-checkout-resume.test.mjs`, `review/published-session-ranges` and the published-session review specs pass unchanged.

Structure: move the `"shared-checkout"` value into `session-record.mjs`;
`shared-checkout-note.mjs` and `publishedSessionReview.ts` import it from the
record contract (finding 5).

## Story obligations

### G1. A torn note beside an open launch is rewritten with the new launch's start
Reported: slice 3 — "a torn recorded note no longer makes `keepRecord` reject; the writer overwrites it with the new `since`"
Story clause: "A shared-checkout note that cannot be written or read neither reports a kept launch as unrecorded nor blocks a later launch or close."
Disposition: proved by slice 4: dashboard/backend-tests/review/shared-checkout-note.spec.ts "a torn note beside an open launch is replaced with that launch's own start" (the note names the open launch's `launchedAt`)

## Concern evidence

Slice-plan refinement was not needed: each slice has one outcome and proof
loop sized within 15 active minutes; slice 2 carries the identity move because
it reworks that identity and the file would otherwise cross 250 lines.

No remaining slice-specific concerns: the scratch application above observed
both earlier open premises. Slice 1 changes only its own raw-shape assertion;
slice 2's refusal is proved through the native-evidence case. The
native-evidence fallback kept in slice 2 is a decided scope boundary, not
interim behavior.

## Local gates

- Apply the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Follow [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) for test data;
  add no test-support wrapper
  ([North Star](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)).
  Keep default timeouts and omit `test.slow()`.
- Run focused Distribution proof with
  `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES bash scripts/test.sh <paths>` and
  backend proof with `npm run --silent test:dashboard:backend -- <filter>`;
  run `npm run typecheck:dashboard` for slices 4 and 7. Use
  `caffeinate -s -i` on AC power for long local runs under
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
