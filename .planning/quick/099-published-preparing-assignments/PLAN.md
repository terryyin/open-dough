# Publish preparation assignments and release them on landing

## Source and scope

**Identity:** SEED-025#show-backlog-preparation-states

[Refined story](../../seeds/SEED-025-backlog-preparation-states.md#show-backlog-preparation-states).
Prepare this queued story without taking it or changing its priority. This plan
is unexecuted; the current request authorizes planning and uncommitted ADR edits.

Goal: another developer can see **Preparing** and its assigned developer before
refinement or planning starts, then see the real preparation facts after landing.
Use the execution roster and rotation, retain assignments during pauses, release
them automatically on landing or deliberately on abandonment, and keep lingering
assignments available for diagnosis. Keep the story queued throughout.

Exclude ad hoc work capture, live activity detection, expiry, scheduling fresh AI
sessions, assignment transfer, exclusive story locking, and preparation inside
Taken execution. No new backlog document format or remote preparation branch is
required. Starting Preparing does not invalidate readiness by itself.

## Context and architecture

Survey base: `c4128b85fbc6aec29028a10559158d6880b81750`, plus this worktree's
refined SEED-025 and uncommitted ADR edits. Reconcile with current trunk before
execution; preserve concurrent work. Plan directory follows the highest allocated
entry in `.planning/quick`; no existing plan for this identity was found.

Follow Accepted [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
for authoritative facts and cohesive reuse,
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) for proof,
and [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
and [AGENTS.md](../../../AGENTS.md) for agent-facing shared guidance. The edits to
ADRs 0007 and 0008 remain Proposed; this plan's behavior is authorized by the
story discussion, not inferred from their status. Their existing Story Branch
Mode integration conflict is unrelated and does not authorize delayed integration.

Use the [North Star](../../NORTH-STAR.md)'s remote-publication and separate
checkout-maintenance boundary, and its single shared interpretation of published
facts. Apply the existing [dashboard navigation](../../../docs/dashboard-navigation.md)
with Preparing as an annotation on the queued card, retaining priority and badges.
No new architectural service or direction topic is needed.

### Reuse decisions and affected callers

- `product-backlog-agent-profile.mjs` owns names, rotation, identities and profile
  interpretation. `execution-start-agent.mjs` owns Git selection/reselection and
  resume provenance. Share those responsibilities with preparation; do not copy
  selection or infer allocation from conversation identity.
- `product-backlog-complete.mjs` couples entry removal and profile release.
  Separate the release responsibility so preparation retains its backlog entry.
  Preserve `product-backlog.mjs complete` and story-wrap-up behavior.
- `execution-start-operation.mjs`, `workspace-publication-select.mjs`, the shared
  publisher, and default-checkout maintenance own existing Git operations. Reuse
  those primitives without calling execution startup (which moves work to Taken)
  or reusing Dough Land for the announcement (which lands the entire draft).
- Preparation workspace/disposition references and Dough Land own the agent's
  preparation and keep lifecycle. Add one shared start/end assignment boundary
  linked from story refinement, slice planning and plan refinement. Decomposition
  without an existing queued identity continues its existing behavior.
- `dashboard/src/takenOwner.ts` and `publishedWork.ts` read profiles at a pinned
  revision; `TakenOwnerFacts.tsx` displays them. Their current types require
  execution mode/branch. Extend the shared contract and consumers honestly for
  preparation, preserving execution progress routing and slice-clock callers.
- Existing `dough-land-test-fixtures.mjs` models landing in test code. It can prove
  Git primitives, not production orchestration or native skill following. New
  behavioral tests must invoke the actual taught production entry points; never
  put the new assignment behavior only in that fixture.

One active assignment owns the Preparing fact. Its reusable name, assigned story,
activity and tool/model belong together; refinement/approach/readiness stay in the
canonical story. A release must identify the allocation being ended, including
when the same name later prepares the same story. Reuse claim provenance where
it suffices; add only the minimal stable allocation identity needed by the shared
contract. Do not use timestamps, tool/model equality, or story identity alone as
an allocation identity. Preserve legacy execution profiles and their callers.

## Proof and delivery rules

Use Node/Git temporary repositories with a local bare origin for publication and
contention checks. Inspect remote commits, queue bytes, profiles, draft bytes and
checkout state, not only receipts or exit codes. Fixtures may supply an existing
story, unrelated busy assignments, and remote contention; they must not supply
the Preparing announcement or release that the production path promises to make.

For browser proof, reuse `committedOrigin.ts` to serve actual CLI-produced Git
bytes through the authenticated read boundary. That proves presentation; the
publication journey separately proves those bytes came from the workflow.

Edit runtime guidance and scripts under `src/skills`, never hand-synchronize
installed copies. Extend the relevant shell entry for new tests when its list is
explicit; `tests/workspace-publication-callers.sh` already discovers refinement
script test files. During execution, run focused proof, the shared post-change
refactor, then applicable delivery checks. Use Bash 4+ for shell checks. No numeric
slice target or hard limit is supplied for this planned story; do not import the
quick-repair ten-minute limit. All slices start planned; no proof below has run.

### 1. Share assignment ownership without changing execution behavior

Type: Structure
Status: done (folded into Slice 2)
Folded: the baseline showed the extraction trivial. `completeEntry` and
`releaseAgentProfiles` were already separate exports joined only by the
`product-backlog.mjs complete` CLI, and rotation already counts every profile
file as held. The remaining exposure had no consumer before Slice 2's
operations, so it was delivered with Slice 2 under the rule below.
Proof: existing execution startup, rotation, release, resume and dashboard owner
journeys remain green through their current public boundaries.

Structure: expose the existing roster, allocation provenance and release concepts
for preparation without a second registry or allocator. Preserve old execution
profile reading and command behavior. Update all reached callers, including
completion, execution resume/reselection, browser typing, progress routes and
test fixture renderers. This directly enables Slice 2's preparation lifecycle;
do not publish a preparation profile yet or invent an execution mode for it.

Use the existing external proof before and after extraction:

```sh
node --test tests/support/product-backlog-agent-profile.test.mjs tests/support/product-backlog-complete-profile.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-agent*.test.mjs
npm run typecheck:dashboard
npm run test:dashboard -- dashboard/tests/taken-agent-profile.spec.ts dashboard/tests/taken-agent-profile-refresh.spec.ts
```

Safe stop: existing execution still assigns, skips occupied names, releases and
rotates correctly; no new preparation behavior is partially activated. Keep the
extraction small and adjacent to Slice 2; fold a trivial extraction into Slice 2
rather than adding an abstract lifecycle framework.

### 2. Announce preparation and release its assignment when the result lands

Type: Behavior
Status: done
Accepted proof (execution checkout, story branch):
`node --test --test-concurrency=1 src/skills/dough-story-refinement/scripts/preparation-assignment-*.test.mjs`
13/13 through the production `preparation-assignment.mjs start|release` CLI
against a local bare origin (announce, stops and land journeys);
`bash tests/workspace-publication-callers.sh` 32/32; the Slice 1 assignment and
startup command 27/27 plus reference readers 32/32; `npm run typecheck:dashboard`;
`taken-agent-profile{,-refresh}.spec.ts` 2/2 (a preparation profile is neither
unreadable nor a Taken owner); other profile-reading dashboard specs,
`tests/product-backlog.sh`, `workspace-publication*.test.mjs` 41/41 and payload
install/update shell checks pass. Landing uses the Dough Land Git model for
the merge only; announcement and release are production commands. Behavior
review walked refinement then keep on a queued story. No native host run yet.
Proof: one production preparation start-to-land journey against a local origin
observes the announcement before draft changes, and release with retained results.

Behavior: given a queued story, authorized preparation publishes its assignment
using the shared next-free rotation, confirms remote acceptance and attempts safe
default-checkout refresh before substantive work. The draft remains in its owned
workspace. Refinement followed by planning keeps the assignment. Explicit keep
lands the retained result with the assignment removed; the story remains queued.

Implement the preparation activity in the shared profile contract, tolerating old
execution records and no fabricated execution fields. Add the bounded production
start/end operations needed by the shared preparation guidance. Keep publication
of the announcement separate from draft disposition. Stage only the coordination
change for announcement; never leak unrelated draft edits. Stage the matching
release with the retained result before landing so remote readers cannot see a
completed landing with a still-active assignment. Existing generic Dough Land
callers without a preparation assignment must retain their behavior.

Update the shared workspace/disposition guidance and related callers to teach the
actual entry points and publication ordering. Explicit no-publish/no-commit
instructions stop the announcement path and are reported, never overridden by
this new default. Pure reading/discussion does not claim an assignment.

Proof extends the preparation-publication journeys through those production
operations, reusing real publisher and checkout maintenance:

- At the announcement SHA, the queue is byte-identical, the assignment is present,
  and retained draft changes are absent. A clean default checkout advances;
  a dirty/busy/diverged checkout is preserved with refresh deferred.
- With preparation and execution assignments already occupied, choose the correct
  next free name and make it unavailable to a subsequent execution start. Confirm
  remote rejection cannot permit substantive work or report a successful claim.
- Land refinement alone and a planned result as two data variations of the same
  journey. Each removes only its own assignment; story preparation/readiness comes
  from real recorder output, never from release. Another preparation skill in the
  same session does not allocate another name.
- Start new work after landing, in the same conversation context: rotation advances
  and fresh tool/model information is recorded. Preserve execution completion's
  existing removal of its own backlog entry.

Extend the existing preparation suite with focused production-boundary cases and
run it with `bash tests/workspace-publication-callers.sh`; also rerun the affected
assignment/startup tests from Slice 1. Walk one representative skill invocation
against the three AGENTS.md behavior-review questions: trigger, required project
context, and useful outcome. Do not count wording assertions as workflow proof.

Safe stop: users can announce preparation through the taught workflow and land it
without leaking an assignment. Interrupted or unconfirmed work remains reserved
and recoverable; dashboard presentation follows in Slice 4.

### 3. Resume or abandon preparation without losing work or a newer assignment

Type: Behavior
Status: done
Accepted proof: `node --test --test-concurrency=1 src/skills/dough-story-refinement/scripts/preparation-assignment-*.test.mjs`
24/24 through the production `start|release|abandon` CLI (abandon, reuse,
landing-retry and stops journeys with refusing, response-losing and racing
origin hooks); `bash tests/workspace-publication-callers.sh` 43/43; assignment,
startup and reference readers 32/32; payload install/compare/update checks
pass. Lifecycle guidance now lives in one reference,
`dough-story-refinement/references/preparation-assignment.md`.
Proof: interrupted production journeys recover from actual local and remote state;
explicit abandonment releases only the identified assignment and preserves drafts.

Behavior: a pause retains Preparing; resume reuses the owned workspace and
assignment. An explicit abandonment publishes its end while keeping the story,
draft and worktree recoverable. Failed or ambiguous publication reports the real
state. A delayed retry cannot clear a later allocation of the same name.

Extend the same lifecycle, rather than adding a watchdog or recovery registry.
Before publication, resolve contention against freshly fetched assignments. On
ambiguous responses inspect remote containment before retrying. Verify exact
assignment provenance on release. If all names are held, report occupied names
and their work for diagnosis; neither age nor missing local process is permission
to reclaim. Preserve unrecognized profiles for inspection.

Prove at the same production command boundary:

- Pause/resume does not republish a second assignment; abandon changes only its
  coordination record, with byte-identical draft and queue, including a repeated
  abandonment request.
- A competing writer claims the selected name first; reconciliation reselects a
  free name or reports exhaustion without overwriting the rival.
- A landing push is rejected, or accepted with its response lost; rerun finishes
  only missing work, and never releases before confirmed publication or republishes
  an already accepted result. Checkout refresh deferral stays a separate outcome.
- Release A, reuse the same name for assignment B (including the same story), then
  retry A's cleanup; B survives. Tool/model changes are not relied on to distinguish
  the allocations. Ordinary lingering profiles remain occupied with visible work
  references; no timeout cleanup runs.

Use focused preparation recovery tests alongside the existing
`workspace-publication-startup-agent-race.test.mjs`,
`workspace-publication-startup-agent-resume.test.mjs`, and
`dough-land-rerun.test.mjs` coverage where it genuinely observes shared primitives.
Run `bash tests/workspace-publication-callers.sh` for the reached callers. Update
pause/abandon/retry guidance in its shared home, with no duplicated procedure.

Safe stop: the lifecycle has deliberate recovery and preserves evidence; no
automatic expiry or new agent session manager is introduced.

### 4. Show Preparing and its developer from published evidence

Type: Behavior
Status: planned
Proof: a browser journey reads actual production-published assignment/result
snapshots and shows the appropriate queued card before and after landing.

Behavior: a developer sees Preparing, the assigned name and available tool/model
on a queued story before its draft lands. The card retains priority and preparation
badges. After landing or abandonment, Preparing and that assignment disappear;
landing displays actual refined/planned/readiness facts. Taken display and
execution progress remain intact.

Extend the shared profile reader's browser projection and existing developer
component, keeping one profile interpretation. Preparation assignments cannot
accidentally become execution progress routes or slice-clock origins. Missing,
unreadable or conflicting evidence is shown as uncertainty, not fabricated
availability or live activity. No new stage ordering, dashboard store or schema
for duplicate activity facts is required.

Extend `taken-agent-profile.spec.ts` / its refresh journey and
`story-readiness.spec.ts`, or add one cohesive preparation journey using their
fixtures. Generate the tested announcement and landed snapshots through Slice 2's
real commands; do not prewrite the expected profile as the behavior under test.
Verify same-revision reads, unchanged queue order, absent tool/model handling,
retained previously-ready facts during a new preparation pass, and post-landing
refinement-only versus planned outcomes. Reuse the existing keyboard/accessibility
patterns and update the legend/navigation documentation for the new annotation.

```sh
npm run typecheck:dashboard
npm run test:dashboard -- dashboard/tests/taken-agent-profile.spec.ts dashboard/tests/taken-agent-profile-refresh.spec.ts dashboard/tests/story-readiness.spec.ts dashboard/tests/story-readiness-gaps.spec.ts dashboard/tests/story-readiness-accessible.spec.ts
```

Include any new focused spec in this command. At the finished-story boundary run
`npm run lint`, `npm test`, and `npm run test:dashboard` under the execution delivery
workflow. Broaden per-slice testing only for reached contracts or failures.

Safe stop: the complete selected outcome is visible remotely, without access to
the preparer's machine, while execution continues to use the same assignments.

## Promise ownership

| Source promises | Owning slice and decisive observation |
| --- | --- |
| Announce before work; isolate drafts; attempt checkout refresh; retain queue | 2: remote announcement SHA and unchanged draft/queue; clean/deferred checkout outcomes |
| Shared rotation, current tool/model, legacy execution behavior | 1 preserves execution; 2 exercises preparation then execution through real allocation |
| Automatic landing release; true refinement/readiness; fresh assignment after landing | 2: one landed snapshot contains result and release, story stays queued; next start rotates |
| Pause/resume, abandonment, no expiry, exhausted pool diagnosis | 3: same assignment on resume; explicit release preserves work; occupied profiles are reported |
| Contention, failed/ambiguous publication, retry and reused-name safety | 2 stops unconfirmed start; 3 proves contention and interruption recovery against remote state |
| Preparing/developer display and preparation facts remain independent | 4: browser observes production-made snapshots, including re-preparation and missing evidence |
| Shared runtime guidance and correct invocation/disposition boundaries | 2 and 3: AGENTS.md behavior review plus native evidence policy below |

## Native evidence and review

Existing host discovery/integration mechanisms are unchanged. Reuse only evidence
whose mechanism and requirement remain applicable under ADR 0005; do not repeat
routine host discovery or infer new skill behavior from old installation proof.
At implementation review, select a representative native start/pause/keep journey
for the changed invocation boundary, and an abandonment journey for the changed
recovery boundary, using an isolated project and local origin. Observe remote Git
and preserved draft bytes alongside the native transcript; no helper may perform
the promised start/release on the agent's behalf. Record host/version, command,
revision and actual result. Other-host coverage needs its own justified evidence
reuse or pending acceptance, never an assumed pass. No native runs are claimed
here. If native requirements remain, give them an explicit linked acceptance
owner before release under ADR 0005; implementation completion does not certify
native acceptance. Do not queue additional work without the applicable authority.

## Plan review and readiness

Boundary review: retain four slices. Slice 1 exposes an already shared concept
and proves unchanged execution, directly enabling Slice 2. Slice 2 keeps the
announcement/landing round trip together so no delivered happy path permanently
occupies a name. Slice 3 owns interruption and deliberate recovery; Slice 4 owns
the browser observation boundary. Avoid separate slices for JSON, CLI plumbing,
skill prose or test helpers. No numeric sizing exceptions or story resplit needed.

The shared assignment rule explains all cases; neither a second preparation
allocator nor a parallel dashboard activity record is justified. No blocking
slice-specific concern was found in this planning review. Execution must preserve
the production-boundary proof distinction noted above. Record preparation and
readiness through the canonical recorder after this plan is written; do not Take
or begin execution. Keep all current preparation files uncommitted for review.

## Learnings

- Allocation identity is the profile path plus the commit that added it
  (`profileAllocation`, `git log -1 --diff-filter=A`). A workspace's own
  assignment also needs its configured agent authorship (or `--agent` from a
  `not-configured` receipt) and matching provenance in workspace history. No
  new profile field was needed. Preparation profiles carry
  `activity: "preparation"`; legacy execution bytes are unchanged, and
  `product-backlog.mjs complete` releases only execution profiles.
- Slice 3 replaced authorship-based ownership: a workspace now records its
  own announcement commit in the per-worktree ref
  `refs/worktree/dough/preparation-assignment` before pushing. It owns the
  assignment only while trunk's current allocation for that profile equals the
  record, so a fast-forward past a later allocation of the same name no longer
  counts as its own. `--agent` was removed.
- Leave-unpublished works like a pause and keeps the assignment. Discarding a
  draft does not end the assignment. Only explicit `abandon` ends it early, with
  a coordination-only "End preparation" commit. Reruns report
  `already-released` with `endedBy`, or a `successor` when the name was reused.
  `agent-unavailable` lists `occupied` assignments, and nothing is reclaimed by
  age. Still untested: a second rejection after the one announcement rebuild.
- For Slice 4: `takenOwner.ts` `interpretProfiles` drops preparation profiles
  today; project them there for queued cards. The `taken-agent-profile.spec.ts`
  step asserting backlog entries claim no owner must change once Preparing is
  shown.
- An explicit no-publish or no-commit instruction skips `start`, reports that
  no Preparing assignment was published, and lets preparation continue only as
  that instruction allows.
