# Release a lost workspace's preparation assignment and trim assignment residue

This bounded retrospective correction has this plan as its canonical home.

**Identity:** quick/103-lost-workspace-preparation-release/PLAN.md
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c628ba3ad09d4b1e4ac13783d5caa20fa94c84776c37676dec3e360bc87efceb"}}
```

## Source

Execution retrospective of story `SEED-025#show-backlog-preparation-states`
(seed at `94b8c3661f2699bf7c3511414aa382a6b00e0dae:.planning/seeds/SEED-025-backlog-preparation-states.md`),
executed through plan 099
(`94b8c3661f2699bf7c3511414aa382a6b00e0dae:.planning/quick/099-published-preparing-assignments/PLAN.md`) on
`claude/099-published-preparing-assignments`. Reviewed commits `9c142ed`,
`315ab39` and `e11c09a` (net `git diff cf4ee77 e11c09a`). The retrospective
rechecked its findings at `e11c09a`, and this plan was surveyed at the same
revision.

The seed promises this correction completes, quoted from the story's scope and
key example 10:

- "Recovery removes only an identified, confirmed-abandoned assignment and
  leaves unrelated work intact."
- "confirmed abandonment can release that assignment. A delayed cleanup must
  not delete a newer assignment that has since reused the same name."

## Goal and scope

**Beneficiary and outcome.** Developers coordinating on a queued story can
release a lingering preparation assignment even when the workspace that
announced it is lost. They address it by its exact allocation and confirm
explicitly. Keeping a preparation whose story has since left the queue
stops for the developer to decide instead of landing silently. After the
correction, the preparation assignment code and tests carry no redundant or
misleading residue.

### Current findings

1. **Behavior (promise gap).** Only the per-worktree ref
   `refs/worktree/dough/preparation-assignment`
   (`src/skills/dough-story-refinement/scripts/preparation-assignment-ownership.mjs`)
   records which assignment a workspace owns. When the announcing worktree is
   gone, `abandon` stops with `no-assignment`.
   `references/preparation-assignment.md` forbids removing another developer's
   profile and gives no route for a lost workspace. As a result, example 10's
   confirmed abandonment cannot release that assignment.
2. **Structure.** The Git-level assignment readers `profileAllocation`,
   `addedProfile` and `occupiedAssignments` live in
   `src/skills/dough-execute-plan/scripts/execution-start-agent.mjs`, whose
   header describes "The agent a Take names". Preparation calls
   `selectClaimAgent({ ...request, integration: workspace })`, disguising the
   checkout it reads as the integration checkout.
3. **Residue.**
   - `${remote}/${target}` is rebuilt inline three times (start, release,
     abandon) although `remoteRef`/`remoteOf` exist in
     `workspace-publication-ownership.mjs`.
   - `agentNameOf` is exported from `product-backlog-agent-profile.mjs` but
     only that module uses it.
   - Preparation's `stop` and execution's `stopped` are near-duplicates.
   - `resumeClaimAgent` accepts any profile with the claimed identity. It
     should require `activity === "execution"` explicitly, because a
     preparation profile can name the same identity.
4. **Test cost and redundancy (whole suite, including older tests).**
   Measured by the retrospective: the new preparation-assignment tests take
   about 52 s of the 63 s spent in `src/skills/dough-story-refinement/scripts`.
   Several of them duplicate proof that already exists elsewhere, or assert
   the Dough Land test model rather than product behavior (slice 4 lists them).
5. **Documentation drift.** `docs/project-visibility-requirements.md` (the
   state list near line 185 and "Agent profiles and rotating names" near
   lines 245–285) still says:
   - every profile records execution mode and branch;
   - only execution startup assigns a name;
   - only completion releases one;
   - developers appear on Taken cards only.

   The shared reference also says "Run every command below from this
   project's installed `dough-story-refinement` skill directory", while its
   commands are written as `node <installed>/scripts/...` paths.
   `preparation-workspace.md` needs the same wording checked.
6. **Behavior (developer decision of 2026-09-25).** Only `start` checks that
   the story is still queued. Suppose another developer Takes, completes or
   removes the story on trunk while it is being prepared. `release` then
   stages the assignment's removal anyway, and Dough Land rebases the
   preparation result onto trunk. That result touches only the seed, the plan
   and the profile, and none of these overlaps the backlog change, so the
   refinement lands silently under the story's new state. The developer
   decided that keep must recognize this and stop for the developer or
   coordinator to decide. Only a deleted seed or plan produces a stop today,
   and then only as a generic merge conflict.

### Included

- A bounded, explicitly confirmed release of one preparation assignment,
  addressed by its exact allocation (profile path plus the commit that added
  it) rather than by a workspace. It publishes a commit that only ends that
  assignment. The shared reference teaches it as a developer's decision.
- A neutral home for Git-level agent-assignment reading, an honest parameter
  for the checkout that selection reads, and removal of the residue in
  finding 3.
- Retiring or trimming the redundant tests listed in slice 4, each with named
  surviving proof, with suite time compared before and after.
- Correcting the documentation drift in finding 5.
- Stopping a preparation keep whose story is no longer queued on fetched
  trunk (finding 6), before anything is staged or landed, and reporting where
  the story is now, so the developer decides.

### Material exclusions (unresolved human choices, left to story wrap-up)

- Dashboard or Take-receipt surfacing of a preparation assignment whose
  story is no longer queued. Finding 6 settles the keep path only.
- Native host acceptance ownership (ADR 0005) before release.
- "Conflicting records" wording for two concurrent preparers.
- Editing `.planning/NORTH-STAR.md:72` ("Keep later assignment … models out
  until their selected behavior needs them"). This correction reports that
  the line is outdated but leaves the edit to the North Star's owner (see
  Current decisions).
- A shared flag parser for the four near-copied CLIs
  (`preparation-assignment.mjs`, `execution-start.mjs`,
  `execution-increment-resume.mjs`, `execution-increment-delivery.mjs`). This
  weakness predates the story. It crosses two skills' CLI boundaries and is
  not an assignment concept, so it stays out of this correction.

### Preserved promises and constraints

- All SEED-025 promises and exclusions stay in force:
  - no expiry or age-based reclaiming, and no inference from silence or from
    a missing local process;
  - no live activity detection and no transfer of an assignment;
  - no exclusive story lock and no preparation inside Taken;
  - no new backlog format and no remote preparation branch.
- An allocation's identity is its profile path plus the commit that added it,
  never story identity, timestamps, or tool/model alone. A delayed or
  repeated retry never ends a later allocation of the same name.
- Execution Take, complete and resume behavior, legacy execution profile
  bytes, and all current preparation receipts stay as they are, except for
  the new release path.
- Follow [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  for proof and
  [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  and [AGENTS.md](../../../AGENTS.md) for guidance: edit `src/skills` only and
  never hand-synchronize installed copies.

### Assumptions

- The integration checkout can build and push a coordination-only commit
  without touching its own files, index or HEAD. It does this with a scratch
  index and `commit-tree`, the same way `endingCommit` in
  `preparation-assignment-abandon.mjs` does, and pushes that exact SHA with
  `tryPushExactRef`. A lost workspace leaves no other checkout to publish
  from.
- The developer can learn the exact allocation from:
  - an `agent-unavailable` receipt's `occupied` entry;
  - an earlier `announced` receipt;
  - the new command's own refusal receipt (see slice 2).

## Context and architecture

PFE result: reuse, not new machinery.

- Workspace abandonment already owns the coordination-only ending commit
  (`endingCommit`), fetch-first retry, and settling a lost response from the
  remote (`abandonPreparation`). The new path reuses that publication loop
  and changes only how the assignment is identified. There is no second
  publisher.
- `profileAllocation` already defines allocation identity.
  `occupiedAssignments` already renders an assignment for diagnosis.
- `maintenance(request)` already refreshes the integration checkout after
  publication.

These concepts are shared by execution startup and preparation, so they get
one neutral home (slice 1) before the new path uses them.

The design follows the Accepted
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
the published profile is the authoritative fact. It also follows the
[North Star](../../NORTH-STAR.md)'s single shared interpretation of published
facts: the dashboard derives Preparing from profile presence, so removing the
profile needs no dashboard change. No new North Star topic is warranted.

Callers affected by slice 1:

- `execution-start-operation.mjs`: select, reselect and resume.
- `preparation-assignment-start.mjs` and `preparation-assignment-ownership.mjs`.
- Payload declarations in `install.sh` managed files (near line 131 and
  line 191) and the CLI list in `tests/helpers/publication-update-proof.bash`
  (near line 43).
- Test support that imports these helpers; grep for them when moving.

## Outside-in proof

Proof uses Node/Git temporary repositories with a local bare origin, driven
through the production `preparation-assignment.mjs` CLI. It inspects the
remote trunk's commits, profile files, queue bytes and checkout state, not
just receipts or exit codes. Fixtures may supply the announcement, the lost
worktree, a later reuse of the name, and remote contention. They must not
supply the release the product promises.

| Promise | Owning slice | Observable proof |
| --- | --- | --- |
| A lost workspace's preparation assignment can be released by exact allocation with explicit confirmation | 2 | After the announcing worktree is removed, a confirmed release from the integration checkout publishes one commit whose only change deletes that profile. The story stays queued. Queue bytes, other profiles, and the integration checkout's pending edit are byte-identical. |
| No release without explicit confirmation, and never by age or silence | 2 | Without confirmation the command publishes nothing and reports the current assignment (agent, story, activity, allocation). Trunk is unchanged. |
| Only the identified allocation is removed; a later reuse survives | 2 | After the name is reallocated (same story), a release addressed to the old allocation publishes nothing, reports the successor, and leaves it byte-identical. |
| Repeating the release is safe | 2 | A second identical request reports already released (`endedBy`) and publishes nothing. |
| Execution assignments are not released this way | 2 | Addressing an execution profile publishes nothing. Completion stays its only release. |
| Guidance teaches the path as a developer decision | 2 | The shared reference section is reviewed against AGENTS.md's three behavior-review questions for one representative lost-workspace use. |
| Execution and preparation behavior are preserved after the module move and residue removal | 1 | The existing startup, profile, completion and preparation-assignment suites stay green unchanged, together with payload shell checks. |
| A keep whose story left the queue stops for the developer | 3 | For Taken, completed and removed stories, `release` stops with the story's current place; nothing is staged, the draft and assignment stay, remote trunk is unchanged, and a still-queued story keeps `release-staged`. |
| Redundant tests are removed without losing proof | 4 | Each retirement names surviving proof that is still green. The directory suite's time is compared before and after in paired runs under the same load. |
| Documentation describes preparation assignments truthfully | 2 | `docs/project-visibility-requirements.md` is reviewed against the delivered behavior. |

## Current decisions

- **Addressing.** The lost-workspace path is `abandon` addressed by
  `--profile <path> --allocation <sha>` in place of `--workspace`. It shares
  `abandonPreparation`'s ending commit and fetch-first publication loop.
  Execution may choose a different operation name only if it keeps one shared
  publication path and receipt vocabulary.
- **Confirmation.** A release happens only when the request carries an
  explicit confirmation flag (for example `--confirmed-abandoned`) and the
  allocation equals trunk's current allocation for that profile. Guidance
  supplies the flag only after the developer confirms that exact assignment
  is abandoned. Age, silence, a missing process, or a missing workspace alone
  never supply it.
- **Refusal receipt.** Without confirmation or without `--allocation`, the
  command reports the held assignment's fields and changes nothing. That is
  how a developer reads the exact allocation to confirm.
- **Preparation only.** The command refuses a profile whose activity is not
  `preparation`. Taken completion (`product-backlog.mjs complete`) already
  owns releasing execution profiles, and releasing one here would leave a
  Taken card without its owner.
- **North Star line.** `.planning/NORTH-STAR.md:72` is outdated. This plan
  does not edit it unless the plan's owner confirms the edit during
  execution. Otherwise it is reported for story wrap-up.
- **Stop helpers.** Unify `stop` and `stopped` only if that simplifies
  without adding `implemented: false` to preparation receipts. Otherwise
  leave both.
- **Shell and speed checks.** Use `/opt/homebrew/bin/bash` for shell checks.
  Measure speed relatively (paired A/B runs under the same load). No numeric
  slice target or hard limit is supplied, so boundedness is judged by one
  proof loop per slice.

## Ordered slices

### 1. Agent-assignment Git reading has one neutral home and no residue

Type: Structure (retrospective correction, findings 2 and 3)
Status: done
Proof: existing external behavior stays green, unchanged:

```sh
node --test tests/support/product-backlog-agent-profile.test.mjs tests/support/product-backlog-complete-profile.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-agent*.test.mjs
node --test --test-concurrency=1 src/skills/dough-story-refinement/scripts/preparation-assignment-*.test.mjs
node --test --test-reporter=./tests/support/node-test-failures-reporter.mjs --test-concurrency=1 src/skills/dough-story-refinement/scripts/*.test.mjs src/skills/dough-bug-fixing/scripts/*.test.mjs src/skills/dough-manual-testing/scripts/*.test.mjs
/opt/homebrew/bin/bash tests/install.sh && /opt/homebrew/bin/bash tests/compare-payload.sh && /opt/homebrew/bin/bash tests/execution-payload-update.sh
```

Structure:

- Move `profileAllocation`, `addedProfile`, `occupiedAssignments` and the
  listing and rotation readers they share into one neutral agent-assignment
  Git module, for example
  `src/skills/dough-execute-plan/scripts/agent-assignments.mjs`.
  `execution-start-agent.mjs` keeps only Take-specific selection,
  reselection, resume and receipt work, with a header that says so.
- Give selection an honest parameter for the checkout it reads, for example
  `selectAgent({ cwd, host, model }, rev, backlogPath, stopFields)`, and
  update both callers.
- Replace the three inline `${remote}/${target}` constructions with
  `remoteRef`.
- Stop exporting `agentNameOf`.
- Make `resumeClaimAgent` accept only `activity === "execution"`.
- Apply the stop-helper decision above.
- Declare the new module in `install.sh` managed files and anywhere else the
  payload lists these scripts (`tests/helpers/publication-update-proof.bash`
  when it lists module files).

External behavior is unchanged. This slice removes the misleading home that
slice 2 would otherwise extend.

Safe stop: all listed suites green, with no receipt or payload behavior
change.

### 2. A developer releases a lost workspace's preparation assignment by its exact allocation

Type: Behavior
Status: done
Proof: a new production-CLI journey file (capability-named, for example
`preparation-assignment-lost-workspace.test.mjs`) against a local bare
origin, then the rest of the assignment suite and callers:

```sh
node --test --test-concurrency=1 src/skills/dough-story-refinement/scripts/preparation-assignment-*.test.mjs
node --test --test-reporter=./tests/support/node-test-failures-reporter.mjs --test-concurrency=1 src/skills/dough-story-refinement/scripts/*.test.mjs src/skills/dough-bug-fixing/scripts/*.test.mjs src/skills/dough-manual-testing/scripts/*.test.mjs
node --test tests/support/product-backlog-agent-profile.test.mjs tests/support/product-backlog-complete-profile.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-agent*.test.mjs
```

Add payload shell checks if the payload file list changes.

Behavior: a queued story has a published preparation assignment whose
announcing worktree has been removed. The developer runs `abandon` from the
integration checkout, naming the profile.

- Without confirmation, the receipt reports the assignment and its current
  allocation, and nothing is published.
- With confirmation and that exact allocation, remote trunk gains one commit
  whose only change deletes the profile. The story stays queued, and the
  integration checkout is refreshed or its refresh is deferred as usual.
- Repeating the request reports `already-released`.
- A request addressed to an ended allocation leaves the later same-name
  allocation in place and reports it as `successor`.
- A request addressed to an execution profile is refused.

The journey observes all of this at the remote. It also checks that queue
bytes, other profiles, and the integration checkout's pending human edit are
byte-identical. A stale-allocation mismatch while the name is still held
publishes nothing. Contention reuses workspace abandonment's publication
loop. Add a race case (with `raceNextPush`) only if the implementation does
not share that loop verbatim.

Guidance: add a lost-workspace subsection to
`src/skills/dough-story-refinement/references/preparation-assignment.md`
under "Abandon the preparation". It should:

- say the release is the developer's decision, confirmed for one exact
  assignment;
- show how to read the allocation (the refusal receipt or `occupied`);
- say that age, silence, a missing process or a lost workspace alone are
  never confirmation;
- replace the current blanket "Never remove … another developer's profile"
  with that rule.

Also fix the "run from the installed skill directory" wording to match
`node <installed>/scripts/...` in this reference and in
`preparation-workspace.md`.

Update `docs/project-visibility-requirements.md` to state that:

- profiles record either execution (mode, branch) or preparation activity;
- preparation start also assigns a name from the same rotation;
- landing, workspace abandonment and confirmed lost-workspace release also
  release a name;
- queued cards show Preparing and its developer.

Walk one representative lost-workspace use against AGENTS.md's behavior
review: invocation context, required project context (integration checkout,
profile, allocation, push authority), and useful outcome.

Safe stop: a confirmed lost-workspace release works end to end, and
unconfirmed or stale requests change nothing.

### 3. Keeping a preparation whose story left the queue stops for the developer

Type: Behavior (retrospective correction, finding 6)
Status: done
Proof: production-CLI journeys against a local bare origin, in a
capability-named file (for example
`preparation-assignment-story-left-queue.test.mjs`), then the assignment suite
and callers commands from slice 2.

Behavior: a queued story has this workspace's published preparation
assignment and a retained draft. Another writer then changes trunk so that the
story is no longer queued. The data variations are:

- the story is Taken, through the real `execution-start.mjs` path;
- the story is completed with `product-backlog.mjs complete`;
- the story's entry is removed.

The developer asks to keep. On freshly fetched trunk, `release` recognizes
that the identity is not in the queue and stops with a named status (for
example `story-left-queue`). The stop reports where the story is now: Taken
with its execution owner, or absent from the backlog. The journey observes
all of the following:

- nothing is staged, and the draft, the workspace commits and the index stay
  byte-identical;
- the assignment stays published;
- remote trunk is unchanged, so no landing happens.

The receipt names the developer's choices and makes none of them:

- abandon the assignment, which keeps the draft;
- discard the draft;
- take the content up as separate work with the story's current owner.

`abandon` still works for such a story, and a repeated `release` gives the
same stop. A story that is still queued keeps today's `release-staged`
behavior, and the existing land journey proves it unchanged.

Guidance: in `references/preparation-assignment.md` ("Release it with the
kept result") and the keep step in `preparation-disposition.md`, teach that
keep stops on this status and hands the decision to the developer or
coordinator. It must not land, retry, or reinterpret the story's new state.
Known limit: the story can still leave the queue between `release` and the
landing push, because Dough Land's rebase is generic. State this limit. A
later scripted landing can close it; do not widen this slice to script Dough
Land.

Safe stop: a keep never lands preparation content under a story that has
left the queue unless a developer decides it.

### 4. Assignment and preparation tests keep one owner for each proof

Type: Structure (retrospective correction, finding 4: test-suite weakness)
Status: done
Proof:

- Before editing, record a paired baseline under the same load: at the
  slice-2 revision, run
  `node --test --test-concurrency=1 src/skills/dough-story-refinement/scripts/*.test.mjs`
  alternately with the post-change tree at least twice each.
- After editing, run every named surviving test green, run
  `node --test --test-reporter=./tests/support/node-test-failures-reporter.mjs --test-concurrency=1 src/skills/dough-story-refinement/scripts/*.test.mjs src/skills/dough-bug-fixing/scripts/*.test.mjs src/skills/dough-manual-testing/scripts/*.test.mjs`, and repeat
  the paired timing. Record the relative before/after in Learnings.
- If a dashboard spec is touched, also run
  `npm run test:dashboard -- dashboard/tests/taken-agent-profile.spec.ts`.

Retire or trim, each with surviving proof that exists and stays green:

- **Retire `preparation-publication-resume.test.mjs` (3 tests).** Surviving
  proof:
  - `src/skills/dough-execute-plan/scripts/publication-resume.test.mjs`: "an
    interrupted publication before acceptance pushes the retained candidate
    once and does not commit again" and "a lost success after a rewritten
    push stays published when another writer advances";
  - for retention: `dough-land.test.mjs` "publishes a reused workspace's
    reviewed content and leaves the workspace with its owner" and
    `preparation-publication.test.mjs` "an explicit leave-unpublished
    instruction does not publish…".
- **`preparation-publication.test.mjs` "discard removes the identified
  retained draft…".** It asserts the test's own `git reset --keep`. Reduce it
  to the product behavior it actually proves (no publication, unrelated
  content kept), or retire it if nothing remains.
- **Delete `preparation-assignment-land.test.mjs` "new work after landing
  continues the rotation…".** Surviving proof:
  - `tests/support/product-backlog-agent-profile.test.mjs` "a released most
    recent name is not reused while others are free";
  - `workspace-publication-startup-agent-release.test.mjs` "a story
    completed through the backlog command releases Akiho-chan and the next
    Take follows it";
  - `tests/support/product-backlog-complete-profile.test.mjs` "complete
    releases only execution: a preparation assignment naming the same
    identity stays";
  - the announce test's full-profile JSON, and announce "preparation takes
    the next free name after execution and preparation assignments, and
    execution startup then skips it".
- **Drop the land test's "a planned result" variation.** Surviving proof:
  - continuation: announce test 1;
  - plan-file landing: `dough-land.test.mjs` "commits every committed and
    uncommitted edit…";
  - planned and ready facts on the page: `dashboard/tests/backlog-preparing.spec.ts`
    "landing a planned result shows its recorded plan and readiness…".
- **Keep only the `dirty` refresh variation in
  `preparation-assignment-announce.test.mjs`.** The refresh taxonomy is
  owned by `publication-checkout-maintenance.test.mjs` "refresh preserves a
  pending edit, unpublished commits, another writer's ownership, and an
  ongoing lock".
- **Trim `preparation-assignment-landing-retry.test.mjs`'s Dough Land model
  assertions** (`landing.commit === "nothing-to-commit"`,
  `publication === "already-accepted"`, `pushed === false`, the refresh
  reason) down to the release receipts and remote-trunk facts. Drop its
  planted human edit, which duplicates `dough-land.test.mjs` "reports a
  deferred refresh when the default checkout holds a pending edit".
- **Fixture cleanup.** Replace the announce test's hand-written pre-push race
  hook with `raceNextPush` from
  `preparation-assignment-recovery-fixtures.mjs`. Remove
  `preparation-assignment-reuse.test.mjs`'s shadowing local
  `revParse(trunk, rev)` in favor of the fixture helper.
- **Optional.** Trim `dashboard/tests/taken-agent-profile.spec.ts`'s repeated
  owner-summary and host-mark assertions for Kirara. Keep the portrait atlas
  check and never-a-Taken-owner.

Structure: the weakness removed is duplicated and model-asserting proof that
costs most of the directory's suite time. Product behavior and every named
promise keep one owning test.

Safe stop: each removal is independent, so partial completion leaves green,
still-owned proof. Record timing only after the retirements are done.

## Learnings

- `tests/workspace-publication-callers.sh` no longer exists (commit 3fc3a8b
  moved each test file into its own `scripts/test.sh` job). Its former
  command, now written in the proof lists above, is the substitute.
- Slice 1 accepted proof: the startup/profile suites
  (`workspace-publication-startup*.test.mjs`, `workspace-publication-race.test.mjs`,
  both `tests/support/product-backlog-*-profile.test.mjs`) 41/41, the
  preparation-assignment suite 24/24, the directory-callers command, and the
  payload shell checks all pass unchanged. The neutral module is
  `src/skills/dough-execute-plan/scripts/agent-assignments.mjs`
  (`selectAgent({ cwd, host, model }, …)`, `profileAllocation`,
  `addedProfile`, `agentUnavailable`); `execution-start-agent.mjs` keeps the
  Take-specific reselect and `claimReceiptAgent`. Every inline
  `${remote}/${target}` now uses `remoteRef`. Preparation `stop` and
  execution `stopped` stay separate, because merging would add or remove
  `implemented: false` in a receipt.
- Slice 2 accepted proof: `preparation-assignment-lost-workspace.test.mjs`
  (one journey through the production `abandon --profile … [--allocation
  <sha> --confirmed-abandoned]` CLI) observes `confirmation-required` with the
  held assignment's fields, `allocation-mismatch`, `not-preparation` for an
  execution profile, a confirmed release publishing one commit whose only
  change deletes the profile (queue, other profiles and the integration
  checkout's pending edit byte-identical, refresh deferred), a repeat
  `already-released` with `endedBy`, and a later same-name allocation kept as
  `successor`. The preparation-assignment suite is 25/25, and the directory
  callers command, the agent-profile/startup suites and the payload checks pass.
  Both abandonment paths share `publishEnding`, so no separate race case was
  added. `addressedAssignment` lives in
  `preparation-assignment-lost-workspace.mjs`. A profile whose recorded name
  disagrees with its file name is refused rather than reported released;
  `start` never writes one.
- Slice 3 accepted proof: `preparation-assignment-story-left-queue.test.mjs`
  (2 tests) drives the production CLI. The story is Taken through the real
  `execution-start.mjs`, then completed with `product-backlog.mjs complete`;
  in the other test its entry is removed and `abandon` still ends the
  assignment. `release` stops with `story-left-queue`, reporting
  `story: { place: "taken", owners } | { place: "absent" }`, `fetched` and
  three choices. HEAD, status, index, seed/plan bytes, the remote tip and
  the remote profile stay identical, and a rerun gives the same stop. With
  the check disabled, both tests fail. A still-queued keep stays
  `release-staged` (existing land and landing-retry journeys). The
  preparation-assignment suite is 27/27 (the new file adds about 5–6 s),
  and the directory and agent-profile suites pass. Completed and removed
  both read `absent`. `storyListAt` in `preparation-assignment-ownership.mjs`
  is the shared "which list holds this story" reader for start and release.
  `references/preparation-assignment.md` sits at the 250-line file-size
  limit.
- Slice 4 accepted proof: every listed retirement and trim is done, including
  the optional dashboard trim, each with its named surviving proof green
  before and after (27/27 across `publication-resume`,
  `publication-checkout-maintenance`, both agent-profile suites,
  `workspace-publication-startup-agent-release` and `dough-land`, plus
  `taken-agent-profile.spec.ts` and `backlog-preparing.spec.ts`). The
  retired discard test exercised only its own `git reset --keep`, so discard
  now has guidance-only coverage.
  Paired timing of `node --test --test-concurrency=1 src/skills/dough-story-refinement/scripts/*.test.mjs`
  under the same load, alternating: 8d4f1c6 (39 tests) 65.4, 64.2, 64.6 s,
  mean 64.7 s; after slice 4 (31 tests) 55.1, 53.6, 53.7 s, mean 54.1 s:
  about −16%.
- `.planning/NORTH-STAR.md:72` ("Keep later assignment … models out until
  their selected behavior needs them") is outdated now that preparation
  assignments exist. It was left unedited for its owner, as decided.
