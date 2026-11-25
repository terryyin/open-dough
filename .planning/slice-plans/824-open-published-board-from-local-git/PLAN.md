# Publish fixed Board test fixtures through real Git

**Source:** [SEED-430](../../seeds/SEED-430-read-published-project-data-from-local-git.md#open-published-board-from-local-git)

**Identity:** SEED-430#open-published-board-from-local-git

## Goal and scope

A maintainer exercising a fixed files publication on the Board or in Intent
can read the same trunk, backlog and record bytes from the routed Git origin
and the retained REST detail answers. Keep existing scenario facts and
deliberate detail failures. This outcome owns fixed `publishFiles` callers,
including fixtures that derive their bytes from MakeMe descriptions. The
[moving fixtures](../826-publish-moving-board-fixtures-through-git/PLAN.md),
[configured origins and direct reads](../827-qualify-board-fixture-routing-and-request-boundaries/PLAN.md),
and [product cutover](../828-open-and-refresh-board-at-verified-trunk/PLAN.md)
own the other publication forms and the switch.

## Decisions and observed baseline

- Reuse [the real single-commit publisher](../../../dashboard/test-support/support/publishedOrigin.ts)
  and [named origin routing](../../../dashboard/test-support/support/fixtureOriginRoute.ts).
  Return the published SHA to the fixture caller. Keep the existing
  [files answerer](../../../dashboard/test-support/publishedFiles.ts)
  where a live REST detail still needs its read history, listing or failure
  controls. Use a real commit even for a publication whose backlog is
  deliberately absent. The shortcut that inserts an empty backlog cannot
  model that case. Keep MakeMe's named facts and render once.
- On `9dc3e801e`, a disposable pilot routed the rendered files through
  `commitPublishedOrigin`, returned its SHA to the profile and clock
  assertions, and kept the `publishes()` origin through a listing-failure
  wrapper. One shared entry point and five case setups in three specs were
  changed. Between creating the isolated pilot checkout and writing the
  scratch changes, 44 seconds elapsed without test commands. This timing
  excludes the prior caller trace, maintained assertions, refactoring and
  delivery. At the old Board entry all five cases passed in 12.5 seconds
  with zero successful REST ref mismatches in the sample. The same five,
  plus the committed-origin phone Board, passed in 13.8 seconds after a
  scratch change routed only membership through Review sync and local
  `git show`. This covered profile labels and exact pin, last-commit and
  addition history, a listing failure and two bad history inputs, and the
  reopened session. The scratch Git path fetched on every open. A second
  fixed-path pilot routed `publishIntentProject` through the same publisher.
  The source browsing and recorded Purpose cases passed in 5.7 seconds with
  the scratch Git dispatch. Use
  `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/intent/intent-recorded-purpose-read.spec.ts e2e/intent/intent-code-browse-sources.spec.ts --workers=1 --reporter=line`.
  That sample kept the exact Gherkin line and the one source acquisition.
- Both runs used
  `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/stories/taken-agent-profile.spec.ts e2e/stories/taken-slice-clock.spec.ts e2e/sessions/recently-done-returned-sessions.spec.ts --grep-invert 'a launch returned to the backlog reads' --workers=1 --reporter=line`.
  The Git run also selected `e2e/navigation/phone-board.spec.ts`.
  Moving and custom publishers were outside this sample.
- The [audit inventory](../827-qualify-board-fixture-routing-and-request-boundaries/fixture-audit.md)
  lists the observed fixed callers. Use the returned real pin in every
  reached reference, including inputs to scheduled or detail reads. Check
  the Git route from each HOME a focused case uses. The audit's one-HOME
  results are a discovery aid.

## Ordered slices

### 1. Publish fixed profile and clock records at a real pin

Type: Structure
Status: done

Change: Add one fixed file-publication path using the existing commit,
routing, and REST file answerers. Move the fixed cases in
`taken-agent-profile.spec.ts` and `taken-slice-clock.spec.ts`, including the
listing-failure wrapper. Each assertion uses the real advertised pin.
This establishes the path the remaining slices reuse.

Proof: In the existing cases match routed trunk to the returned SHA and
check the profile facts, clock, missing listings and broken history. Run both
specs. Budget 12 active minutes for the shared path and these four setups,
including focused proof inspection and local delivery work.

Learnings: `publishCommittedFiles` in
[committedFiles.ts](../../../dashboard/test-support/committedFiles.ts) is
the shared fixed path. It returns the real `revision` with the requests and
checks every served HOME through `expectServedHomesReach`, so migrated specs
add no routing assertion. A wrapper that fails one REST kind uses
`publishes()` with `keepingOrigin` and calls `expectServedHomesReach` itself;
`failListing()` fails only branch-head listings. Reusable proof: both specs
(4 cases) and the nine direct `publishMovingFiles` consumer specs passed
after refactoring.

### 2. Publish fixed roster and branch-progress records

Type: Structure
Status: done

Change: Migrate fixed setups reached through `agentRosterRecords` and the
fixed publication sites in `nerds-cartoon-portrait` and
`branch-slice-progress`. Keep unknown-profile and absent-backlog fixtures
at their original failure boundary. `commitPublishedOrigin` inserts an
empty backlog when none is given, so let the absent-backlog fixture commit
without one. Leave a fixture that moves the same publication to the moving
story.

Proof: Run the reached roster, portrait and branch-progress cases.
Observe the reported revision for each project and the advertised trunk via
its HOME. Check the missing backlog is absent from the commit and continues
to produce the established unavailable Board. Budget 13 active minutes.

Learnings: `publishCommittedFiles` commits only the given files
(`commitPublishedOrigin` takes `backlog: null`) and accepts `branches`.
A journey that answers some REST kinds itself over a real commit uses
`serveCommitted` from the same module. Branch heads in
`branch-slice-progress` stay REST-only; only its trunk is committed. Moving
roster fixtures (`agent-roster-avatar`'s Open Dough, `agentAttributionRecords`)
stay with the moving story.

### 3. Publish fixed Recently done records

Type: Structure
Status: done

Change: Migrate fixed publications in `recently-done-stories` and
`recently-done-follow-up`. Preserve missing, unreadable and malformed
record inputs at their REST detail boundaries.

Proof: Run both files. Compare the origin trunk and REST pin, and verify
each record gap and the follow-up event at its existing boundary.
Budget 12 active minutes for the publisher substitutions and proof review.

Learnings: only the two specs changed; each fixed publication, including
each read-failure step, commits its own real revision. The record modules
still name fixed revision ids, which `publishCommittedFiles` replaces with
the real commit; session and moving consumers still read them.
Refactor pass skipped: subject-spec publisher substitution only, adding no
representation.

### 4. Publish fixed session and completion records

Type: Structure
Status: done

Change: Migrate fixed publications in the Recently done session cases,
session column membership and Taken execution completion. The moving
return/re-Take/Done sequence belongs to the moving story.

Proof: Run the reached session and completion consumers. Preserve the
expired, retained, reopened or selected session signals. Observe the exact
origin and pinned published record. Budget 13 active minutes.

Learnings: membership and completion publish through support modules;
`publishCommittedMembership` serves the unplanned backlog at a real commit.
`doneStoryPublication` and the read-failure publications no longer name
fixed revisions. The moving cases in `recently-done-returned-sessions` and
`session-column-membership` stay with the moving story; when it moves the
latter, `publishMembership` can go.

### 5. Publish fixed Intent sources and purpose at the real pin

Type: Structure
Status: planned

Change: Migrate fixed `publishIntentProject` sites for code browsing,
Gherkin and recorded Purpose. Share the real advertised pin through source
and location assertions. The audit found six fixed files in this group.

Proof: Run the six fixed Intent files named in the audit. Observe the
configured ref for each project, exact source, configuration bytes and
unsupported source handling. Budget 14 active minutes to update the shared
entry point and its explicit revision expectations.

### 6. Publish fixed observations from the selected project

Type: Structure
Status: planned

Change: Migrate fixed `development-intent-history`,
`authenticated-project-observation` and the fixed initial publication in
`taken-agent-profile-refresh` where it has a distinct setup. A later
publication that moves the same real trunk is owned with its initial
setup by the moving story.

Proof: Run the reached fixed project-selection and history cases, preserving
configured-source isolation and the existing record requests. Budget 10
active minutes. Reassign an entire moving scenario to its owner before
editing any of its pins.

## Local gate

Run focused checks and Dashboard typecheck for each changed boundary.
Run long checks under [`caffeinate -s -i` on AC power](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
and select test conventions through [AGENTS.md](../../../AGENTS.md).
