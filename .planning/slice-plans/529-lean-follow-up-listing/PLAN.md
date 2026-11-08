# Keep follow-up context out of listings and resume it after its source expires

**Identity:** SEED-273#lean-follow-up-listing

**Source:** [Keep follow-up context out of listings and resume it after its source expires](../../seeds/SEED-273-follow-up-from-done.md#lean-follow-up-listing)
**Source review:** [Independent source commitments](source-review.md)

## Execution context

Story Branch Mode in the established linked worktree, publisher
`dashboard-territory.local-open-dough`, agent `aki-chan`, origin trunk `main`.
Starting revision `5a1f5834cdc02c776fbbcc7633c18089bdf61ae9`. Claim accepted
on origin/main and the execution branch at
`b25aecb9813da1d7c5b78d72a7bb21286ac8c3f4`. Initial candidate is the claim.
Execution-branch CI uses GitHub Actions `ci.yml`, coordinator
`aki-lean-follow-up-1cafbc4c`, stream directory `/tmp/dough-ci-501/watch-UTUwnr`,
PID 69856, session 18844, cell g182:9. Replanning permission is unchanged.
Slice 1 was accepted on the execution branch at
`812b4eda399e31454d45f2b6ac0b1ecce74ea0b9`, based on the claim and registered
on the same CI stream.

## Provenance

Execution retrospective of
SEED-273#follow-up-from-done (story and plan 526 recoverable at `c6e935c28`:
`.planning/seeds/SEED-273-follow-up-from-done.md` and
`.planning/slice-plans/526-follow-up-from-done/PLAN.md`), reviewed commits `c91e02264` (slice 1), `23141b5ab` (slice 2) and
`0c793f770` (slice 3) on `claude/start-a-follow-up-from-recently-done-work`,
base `9a343c59f`.

## Current findings

1. **Listing payload.** `withFollowUpContext`
   (`dashboard/server/followUpAdmission.ts`) keeps the resolved text on
   `request.followUp.context`. `doneListing`'s `historyOnlyFields`
   (`dashboard/src/doneSessionListing.ts`) leaves out only `landing`,
   `landingReporting`, `request.reporting` and `firstInput.instruction`, so a
   Done follow-up's listing carries the whole context for its 30-day
   retention, and an open entry is listed in full
   (`dashboard/server/machineSessionsFragments.ts`). Codex and Cursor also
   store it in `firstInput.instruction`. The page reads no recorded
   `followUp.context`: its preview is built on the page
   (`dashboard/src/FollowUpSubject.tsx`). Size: about 250 characters plus up
   to 4,000 + 16,000 per held session.
2. **Resume after the source expires.** Admission resolves the context
   (`agentLaunchAdmission.ts` → `followUpAdmission.ts` `contextOf`) before
   the resume decision; once `keptSession` no longer finds the source, a
   repeated follow-up whose start is still retained is refused with 404
   instead of resuming. Continue (a different path) already resends the
   recorded context.
3. **Residue.** `agent-launch-follow-up-codex.spec.ts` and
   `agent-launch-follow-up-cursor.spec.ts` each repeat the Default main
   `[context, request, reporting]` case that Claude's boundary spec already
   proves for the one `unattachedInput`; `launchAttempts.ts` re-exports
   `LaunchWorkItem` from `launchStarts.ts` only for `StartLaunch.tsx`'s old
   import.

## Preserved promises and constraints

All SEED-273#follow-up-from-done promises stay: the server resolves the
context from current records at Start and never accepts page-written text; the
resolved text stays on the recorded request for retries, Startup recovery and
Codex's rebuilt input; the source, not the text, is the launch identity; the
first input order per host; the 404/502 refusals for a new follow-up whose
source cannot be read. The sessions history still carries the full record.

## Current decisions

- Add the follow-up context to the history-only detail that `doneListing`
  leaves out and `withRetainedDetail` restores, keeping the source; list an
  open follow-up entry without the context too, since only the server reads
  it. Update `doneSessionListing.ts`'s header.
- At admission, when a retained attempt or kept record already matches the
  request by `sameLaunch`, reuse its recorded `followUp.context` instead of
  resolving again; resolve (and refuse) only for a new follow-up.
- Delete the two duplicate per-host Default main cases; import
  `LaunchWorkItem` from `launchStarts.ts` directly.
- Test data through `makeMe.aLaunchRecord` and the follow-up fixtures
  (`dashboard/tests/support/followUpSources.ts`,
  `dashboard/backend-tests/launches/followUpBoundaryCases.ts`).

## Existing admission behavior for slice 2

`acceptLaunchRequest` already resolves a matching active or resumable ad hoc
attempt by `sameLaunch`, including attachment digests, and Continue uses the
recorded request through locked continuation. `pendingInputOf` uses the same
identity to select a kept session whose input still needs recovery. Reuse those
decisions before resolving context for a new follow-up. The HTTP boundary can
still refuse page-supplied context and map `RefusedRequest` to the source read's
HTTP status. The listing change only removes serialized copies and leaves the
records needed by both recovery paths available.

## Outside-in proof

| Finding | Owner | Required observation |
| --- | --- | --- |
| 1 | Slice 1 | Unit or backend: a Done follow-up's listing and an open follow-up's listing omit `followUp.context` and keep its source; the sessions history restores it. Existing follow-up page specs still show the dialog context and Recently done entries. |
| 2 | Slice 2 | Backend: a follow-up whose start is retained (host refused), with its source record then removed, is resumed by repeating it: same attempt id, and the first input carries the recorded context. A new follow-up of a removed source still gets 404. |
| 3 | Slice 2 | The follow-up backend specs and typecheck pass after the deletions. |

## Decisive premises

Observed on 2026-11-08 at `0c793f770` by reading the code named in Current
findings; the page reads no recorded `followUp.context`, and
`agent-launch-follow-up-identity.spec.ts` "resumed by repeating the same
follow-up" covers the retained-source resume path that slice 2 extends.

## Local gates

Follow the [test automation rules](../../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written. Run Playwright with `NO_COLOR`, `FORCE_COLOR` and
`GIT_ALTERNATE_OBJECT_DIRECTORIES` unset; for full runs on awake macOS with AC
power use `caffeinate -s -i` with Homebrew Bash first on `PATH`.
[Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)
Each slice runs `backend-tests/launches/agent-launch-follow-up-`,
`tests/launches/agent-launch-follow-up-session.spec.ts`,
`tests/stories/recently-done-follow-up.spec.ts`, `tests/sessions/recently-done-`,
the retained-history and sessions-overview specs it touches, and
`npm run typecheck:dashboard`.

## Slices

### 1. Leave follow-up context out of session listings

Type: Behavior
Status: done
Proof: `dashboard/backend-tests/sessions/agent-launch-sessions-listing.spec.ts`
observes an open and a Done Codex follow-up's exact source and first-input state
in the overview. It checks that the raw payload omits the context, that history
returns the full Done record, and that reconstruction restores the context and
input while preserving the current listing title. The regression first failed
on the original overview. Existing launch specs now read persisted context from
the machine store, and the page specs still assert the dialog and Recently done
entries.

The local gate passed 60 tests in 28 files and dashboard typecheck. Independent
refactoring renamed the projection to `sessionListing.ts`, relocated the
regression, and shared MakeMe launch-fact composition. The listing and history
backend specs, Done listing and retained history browser specs, and typecheck
passed after the refactor.

Behavior: A Done or open follow-up session's overview listing carries its
source but not its resolved context; opening its history restores the full
record.

### 2. Resume a retained follow-up after its source expires

Type: Behavior
Status: done
Proof: `agent-launch-follow-up-identity.spec.ts` removes the source after
Claude refuses a retained start. Repeating keeps the attempt ID and acceptance
time and resends the saved context before the request. A forged repeat gets
400. A different launch with an image gets 404 and the claim is discarded.
`agent-launch-follow-up-codex.spec.ts` removes the source and attempt while
keeping a conversation awaiting input. Repeating reuses that conversation and
resends its exact input. `agent-launch-follow-up-live.spec.ts` repeats from a
second server while the first server's worker is held. It observes the running
response, one attempt and one native launch. Each regression first failed with
404 before its fix.

The broader focused gate passed 106 tests in 43 files. The final affected gate
passed 26 tests in eight files, with typecheck. The full saved follow-up tuple
preserves the revision for story sources by construction. Independent
refactoring found the two recovery boundaries and attachment cleanup cohesive
and made no edits.

Behavior: Repeating a follow-up whose start is retained resumes it with the
recorded context after its source record is gone; a new follow-up of a gone
source is refused. The duplicate per-host Default main cases and the
`LaunchWorkItem` re-export are removed.

## Plan concerns

Refinement not needed: two behavior loops over one listing rule and one
admission branch, plus residue that rides with slice 2's proof.

## Execution complete

Product advice: no change. The listing and retry contracts hold at their
existing session and admission boundaries. Focused proof covers the overview,
retained history, page journeys, and live and saved recovery. The execution
review found no further product work within the correction.

The reviewed product revisions on the execution branch are
`812b4eda399e31454d45f2b6ac0b1ecce74ea0b9` (listing) and
`faed810a8380b7a4728c8a716bf7f44dc5151eff` (resume). The recorded Take is
provenance. The execution process review used the actual coordinator tool
receipts and implementation and refactor returns. The formatter stopped the
second delivery for test-fixture lint, and the corrected regression passed
before publication. No new process finding was supported. CI remains pending
at this review boundary.
