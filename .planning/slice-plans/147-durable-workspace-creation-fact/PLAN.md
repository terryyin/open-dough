# Retire a workspace created for the work in any later session

## Source and authority

- **Identity:** SEED-008#durable-workspace-creation-fact.
- **Source:** [story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#durable-workspace-creation-fact),
  refined on 2026-09-29. Terry asked for refinement and a slice plan; the open
  storage decision takes the story's recommended per-worktree Git ref.
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication.
- **Preparation workspace:** `.worktrees/prep-durable-workspace-creation-fact`
  (branch `claude/prep-durable-workspace-creation-fact`), created by this
  preparation at `ae4b4b86` and announced as agent Shunka-chan at `023e15b3`.

## Execution

- **Mode:** Story Branch Mode, started 2026-09-29 by agent Maki-chan
  (claude-opus-5-5), publisher `claude-768a7b56`.
- **Checkout:** `.worktrees/durable-workspace-creation-fact` on branch
  `claude/durable-workspace-creation-fact`, created by startup at starting
  revision `ca7b50fa`; integration checkout is the repository root.
- **Target:** remote `origin`; increments publish to the remote execution
  branch, the claim to `refs/heads/main`.
- **Published revisions:** claim `29f9bc6c` on `origin/main`.

## Outcome and boundaries

A developer whose story or preparation spans several agent sessions gets its
worktree retired when that work lands or closes. Worktrees the work reused or a
host owns still stay. The installed retirement command of
[plan 146](../146-installed-wrap-up-command/PLAN.md) reads the same fact
instead of an agent-set `--created-for-work` flag.

Key examples (from the story):

1. Preparation `start` created a worktree for S in one session; a later session
   keeps and lands S → Land retires the worktree and its branch.
2. Execution startup created a worktree for S; a later session closes S →
   closure retires the worktree and branch once trunk contains them.
3. A later Take for T reuses the worktree created for S → T's closure retains
   it and reports it as created for S.
4. A host-owned worktree holds S's work → no creation ref; retained and
   reported whichever session closes S.

Preserved promises: a reused or host-owned worktree is never retired as
created for this work; retirement still requires a confirmed disposition,
trunk containment, a clean worktree, and non-force Git; the existing
same-session `created: true` and caller-statement records stay valid. Edit
sources only in `src/skills/`. Follow ADR 0006's executing-agent audience;
when removing wording, do not add "no longer" prose.

Excluded: backfilling existing worktrees; manual-testing and bug-fixing
exploration workspaces (created by guidance, no runtime); work without an
identity (keeps today's records); the installed retirement command and the
closure code's `sessionOwned` flag (plan 146); new native journeys. The
existing preparation-land and trunk-closure native journeys are in scope
(slice 3): Terry decided on 2026-09-29 that this story's native proof stays in
this story.

## Existing solutions (PFE)

- **Per-worktree refs already hold workspace facts.**
  `preparation-assignment-ownership.mjs:104-116` records the preparation
  announcement at `refs/worktree/dough/preparation-assignment` with
  `update-ref`, reads it back, and deletes it. The creation fact reuses that
  mechanism under a sibling name; no registry, config extension, or published
  record is added.
- **One creation point.** `selectOwnedWorkspace`
  (`dough-execute-plan/scripts/workspace-publication-select.mjs:74-133`) is the
  only runtime `git worktree add`. Execution startup
  (`execution-start-operation.mjs:81`), one-shot and source startup
  (`execution-start-source.mjs:32`), and preparation `start`
  (`preparation-assignment-trunk.mjs:56`) all call it with `...request`, which
  carries the work identity when the caller has one. The write goes in its
  create branch; no new module or payload declaration is needed.
- **Retirement reads ownership only from context today.** The shared rule
  (`dough-manual-testing/references/exploration-workspace.md` "Close or retain
  it", lines 84-97) and Dough Land's **Worktree** input
  (`dough-land/SKILL.md:31-35`) take creation from the plan, the conversation,
  or a statement. `preparation-assignment.md:52-54` tells the agent to record
  the workspace "as created by this session".

No North Star topic or ADR change is warranted: the fact is a local Git detail
under the existing work-scoped rule Terry decided on 2026-09-28.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| Every runtime-created worktree passes through `selectOwnedWorkspace`'s create branch with the request's identity. | `grep -rn 'selectOwnedWorkspace(' src/skills --include='*.mjs'`; read the three callers and `workspace-publication-select.mjs:74-133`. | Confirmed: three callers, each spreading `request`; the only `worktree add` is at `:120-129`. |
| An identity like `SEED-008#durable-workspace-creation-fact` is a valid ref name; a `refs/worktree/` ref is visible only in its own worktree and disappears with `git worktree remove`. | Scratch repository under the job temp directory, Git 2.50.1: `git check-ref-format`, `update-ref` in a worktree, `for-each-ref` from the worktree and from the main checkout, then `git worktree remove`. Scratch removed. | Valid; listed from the worktree only (0 from the main checkout); after removal `.git/worktrees` was empty and no ref remained. CI already relies on `refs/worktree/` for the preparation assignment. |
| Reusing an existing path creates nothing. | Read `workspace-publication-select.mjs:17-66` (retained) and `:92-118` (existing path). | Both return `created: false` without `worktree add`; they write no ref under this plan. |
| Guidance that takes creation from session context is limited to the shared lifecycle, Dough Land's input, and the preparation receipt. | `grep -rn -i -E 'session[- ](created\|owned)\|created (by\|in) (this\|the\|an earlier\|that) session\|created for this work\|whether this work created\|as created' src/skills --include='*.md'`. | `exploration-workspace.md:48,73,87-97`, `dough-land/SKILL.md:33`, `preparation-assignment.md:53`. `preparation-disposition.md:39,185` concern session-owned drafts, not worktrees, and stay. |
| Existing tests reach both creation paths, with and without an identity, and a reuse path. | `grep -rn -E '\.created\b' src --include='*.test.mjs'`; read the identity setup in `one-shot.test.mjs`, `preparation-assignment-owned-context.test.mjs`, and `workspace-publication-startup-plan-link-cases.mjs`. | `one-shot.test.mjs:65` asserts `created: true` for unlisted `identity: null` (`:33`) and queued `identityA` (`:161`); queued Take creation at `workspace-publication-startup-plan-link-cases.mjs:61`; preparation creation at `preparation-assignment-owned-context.test.mjs:34`; reuse at `workspace-publication-admission-continuation.test.mjs:123` and `workspace-publication-startup-recovery.test.mjs:70`. |

## Slices

### 1. A created worktree carries the work it was created for
Type: Behavior
Status: done
Proof: creation and reuse tests observe the ref from the worktree; one retirement test observes it gone.

Behavior: No workspace exists at the requested path and the request names
identity S → execution startup or preparation `start` creates the worktree →
`git -C <worktree> for-each-ref refs/worktree/dough/created-for/` lists exactly
`refs/worktree/dough/created-for/S` at the starting revision, and the main
checkout lists none. A reused workspace (existing path or retained resume)
gains no ref. A request without an identity, or with one `git check-ref-format`
rejects, creates the worktree as today with no ref. Retiring the worktree
leaves no ref behind.

Write the ref in `selectOwnedWorkspace`'s create branch right after
`worktree add`, checking the name before creating so an invalid identity never
leaves a half-created workspace. Keep the ref name beside the preparation
assignment ref.

Proof: extend the preparation creation case in
`preparation-assignment-owned-context.test.mjs:34`, the queued Take in
`workspace-publication-startup-plan-link-cases.mjs:61`, and `one-shot.test.mjs`'s
created cases (unlisted `identity: null` at `:33` gets no ref; the queued
`identityA` case at `:161` gets one); assert no ref in
`workspace-publication-admission-continuation.test.mjs:123`'s reuse, and assert
the ref is gone after retirement in one `dough-land.test.mjs` case. Run those
files plus `workspace-publication-startup-recovery.test.mjs`.

Accepted proof (2026-09-29): `selectOwnedWorkspace` checks
`createdForRef(identity)` with `git check-ref-format` before `worktree add` and
writes it at the starting revision after; ref names live together in
`workspace-publication-ownership.mjs`. From the checkout root,
`node --test src/skills/dough-bug-fixing/scripts/*.test.mjs src/skills/dough-execute-plan/scripts/*.test.mjs src/skills/dough-story-refinement/scripts/*.test.mjs src/skills/dough-story-wrap-up/scripts/*.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-plan-link-cases.mjs`
passed 516/516 after refactoring. Observations: `createdForRecords` equals
`createdFor(identity, sha)` in `preparation-assignment-owned-context.test.mjs`
(both creation variants; other worktree and repository list none),
`workspace-publication-startup-plan-link-cases.mjs` (queued Take; integration
lists none), and `one-shot-queued.test.mjs` (queued one-shot); `[]` for the
unlisted one-shot (`one-shot.test.mjs`), reuse (`preparation-assignment-owned-context.test.mjs`,
`workspace-publication-admission-continuation.test.mjs`), and no or invalid
identity (`workspace-publication-race.test.mjs`); `dough-land.test.mjs`'s first
case resolves `worktrees/<name>/refs/worktree/dough/created-for/SEED-1#a`
before landing and not after. Disabling the `update-ref` failed four of those
assertions. Remaining limit: an `update-ref` failure after `worktree add` keeps
the workspace and reports `setup-failed`.

### 2. Retirement in a later session reads the creation record
Type: Behavior
Status: done
Proof: guidance-structure assertion plus a recorded behavior walk of examples 1–4.

Behavior: A worktree holds `refs/worktree/dough/created-for/S`, and the session
landing or closing S has no `created: true` in its context → it follows the
shared lifecycle → the worktree is created for this work and retires under the
existing gates. A ref naming T is retained and reported as created for T; no
ref and no other record is retained as ambiguous, as today.

Edit `exploration-workspace.md` ("Select the checkout" at :48, "Use and resume
it" at :73, "Close or retain it" at :87-97) to name the ref as the durable
creation record with the one read command
(`git -C <worktree> for-each-ref --format='%(refname:lstrip=4)' refs/worktree/dough/created-for/`),
Dough Land's **Worktree** input (`SKILL.md:31-35`) to take ownership from that
record as well as context, and `preparation-assignment.md:52-54` so the receipt
text says `start` recorded the creation in the workspace instead of asking the
agent to record it as created by this session.

Proof: add an assertion to
`dough-manual-testing/scripts/workspace-ownership-lifecycle.test.mjs`, which
already checks the shared lifecycle's structure, that "Close or retain it"
names the creation ref; run it and the Land and preparation suites. Walk
examples 1–4 through the edited guidance under the maintainer behavior review
and record each decision point here. Native agent behavior is slice 3's.

Accepted proof (2026-09-29): "Close or retain it" lists the creation record
first among the three records, names the ref and the read command
(`lstrip=4` verified in a scratch repository to print exactly `SEED-008#x`, and
nothing from the main checkout), and retains a workspace whose record names
other work; Dough Land's **Worktree** input and the preparation `start` receipt
link to it. From the checkout root,
`node --test src/skills/dough-manual-testing/scripts/*.test.mjs src/skills/dough-story-refinement/scripts/*.test.mjs`
passed 50/50 after refactoring (`workspace-ownership-lifecycle.test.mjs`'s
phrases scoped to "## Close or retain it", failing against the pre-edit text;
`dough-land-guidance.test.mjs`'s Worktree-input assertion);
`tests/native-evidence-identity.sh` and `tests/payload-declaration-links.sh`
exit 0 under a modern bash. Behavior walk decisions:

1. Session B lands S's preparation with no `created: true` in context → the
   record lists `S` → retired under the existing gates.
2. A later session closes S → wrap-up retires through Land's "Retire the
   worktree", which reads the record listing `S` → retired after its gates.
3. T closes in a worktree whose record lists `S` → retained and reported as
   created for S.
4. A host-owned worktree has no record and no other record applies → retained
   and reported.

### 3. Native sessions retire a worktree whose creation only the ref records
Type: Behavior
Status: done
Proof: substitute runs and assessor counterexamples, then the manual paid native runs on all three hosts.

Behavior: A fixture worktree carries `refs/worktree/dough/created-for/<identity>`
as the earlier session's command would have written it, and neither the
prompt nor the plan says who created it → a native agent lands the prepared
story through Dough Land (`publication/preparation-land`) or closes the Trunk
Mode story (`trunk-closure/owned-context`) → the worktree and its branch are
retired, exactly as the journeys assess today (example 5).

Remove "an earlier session of yours created it for this preparation" from the
preparation-land prompt (`tests/support/git-publication-native-owned-context.sh:64`)
and "created by this execution" from the trunk-closure fixture plan
(`tests/support/trunk-closure-native-owned-context.sh:44`). Each fixture writes
the creation ref in the worktree it creates. Check that
`tests/native-evidence-identity.sh` covers the edited guidance and the
creation-writing command for both journeys, extending it when not, so the paid
runs' evidence identity matches what they prove.

Proof: `tests/git-publication-native-owned-context.sh` (substitute journeys and
assessor counterexamples) and `tests/native-evidence-identity.sh` pass. Then,
manually and only as this final slice, run
`tests/git-publication-native.sh --native HOST --case publication/preparation-land`
and `--case trunk-closure/owned-context` for HOST in `codex`, `cursor`, and
`claude`, and record each result here. Paid runs are never added to an
automated suite.

Evidence so far (2026-09-29, journeys committed at `b8946e99`): the fixtures
write the creation record (the trunk-closure fixture gains story
`SEED-T#final-closure` and a `Selected story:` line, through `createdForRef`),
and the substitute retires only when the guidance's read command lists its
story. `/opt/homebrew/bin/bash tests/git-publication-native-owned-context.sh`
and `tests/native-evidence-identity.sh` exit 0; a missing or renamed record
fails preparation-land ("the landed worktree or its branch survived") and
trunk closure ("Trunk Mode closure ordering was not observed"). The six paid
runs (`tests/git-publication-native.sh --native HOST --case
publication/preparation-land` and `--case trunk-closure/owned-context`, HOST in
claude, codex, cursor, results under the job's `tmp/native147/`) all printed
PASS. In five, the agent ran the `for-each-ref` read and saw its story. The
Claude Code trunk-closure agent never read the record, "Close or retain it",
or Dough Land: it followed `trunk-publication.md` and removed the worktree
after the containment check alone.

Learning: the owned-context assessors observe only the retired outcome, so a
closure agent that skips the ownership check still passes; accept each native
run on its transcript's record read, not on PASS alone. Terry chose to name the
check where closure retires and rerun only that case: `trunk-publication.md`
("Publish wrap-up closure") and wrap-up's "Remove execution resources safely"
now say the worktree goes only when its creation record or another
"Close or retain it" record shows this work created it (`3b1f8619`, asserted in
`ci-completion-lifecycle-guidance.test.mjs`, failing against the prior text;
30/30 guidance tests pass). The rerun
`tests/git-publication-native.sh --native claude --case trunk-closure/owned-context`
(results under `tmp/native147-rerun/`) printed PASS; the agent ran
`git for-each-ref refs/worktree/`, saw `SEED-T#final-closure`, and reported
retiring after "the worktree's creation record names this work". Example 5 is
accepted on all three hosts for both journeys.

## Proof ownership

| Final-state promise | Owning slice and decisive observation |
| --- | --- |
| Created worktree records its work identity, visible only there | 1: creation tests via `for-each-ref` from worktree and main checkout |
| Reused worktree records nothing | 1: reuse test |
| Missing or invalid identity still creates, with no ref | 1: creation test without identity |
| Ref leaves with the worktree | 1: Land retirement test |
| Example 1 and 2: a later session retires the work's own worktree | 2: lifecycle assertion and behavior walk (runtime fact from 1) |
| Example 3: worktree created for other work is retained and reported | 2: behavior walk |
| Example 4: host-owned worktree is retained | 2: behavior walk; 1: no ref without creation |
| Same-session and statement records remain valid | 2: behavior walk of edited "Close or retain it" |
| Example 5: native agents on every host retire from the ref alone | 3: manual native preparation-land and trunk-closure runs on Codex, Cursor, Claude Code |

## Delivery checks

Run the focused files each slice names. Neither slice adds a file or changes a
payload declaration, so payload-update checks are not required; run
`bash tests/payload-declaration-links.sh` only if that changes. Follow the
local-verification rule landed by `162b5fb4`. Use independent post-change
refactoring and ordinary managed delivery. Do not hand-synchronize installed
copies.

At start, re-read `preparation-assignment.md` and the startup test cases
against then-current trunk: plan 145, executing now, removes declared-owner
text beside `preparation-assignment.md:52-54` and rewrites startup cases.

## Concern review

Cumulative design: one rule, a creation ref naming the work, written at the
single creation point and read by the single shared lifecycle; no special case
per caller. Slice 2's proof is guidance structure and a walk, because
retirement is guidance-followed until plan 146 ships its command; slice 3 then
proves the same guidance natively on each host through the two existing
journeys, with no new journey. No blocking slice-specific concern was
identified in this review.

## Execution complete

Product advice:

- Plan 146 (SEED-008#installed-wrap-up-command, executing alongside) should
  treat the creation record as landed: `createdForRef` in
  `workspace-publication-ownership.mjs` writes it and "Close or retain it"
  reads it, so its `--created-for-work` fallback and "has it landed" hedges
  can go. Its slices also rewrite text this plan changed after 146 was
  planned: the ownership sentences added to `trunk-publication.md`
  ("Publish wrap-up closure") and wrap-up's "Remove execution resources
  safely" (`3b1f8619`), which its command can replace; Dough Land's
  "containment as the safety test" intro, which misled one native closure
  agent; the owned-context fixtures' story `SEED-T#final-closure` and the
  evidence identities, which now cover `exploration-workspace.md`; and wrap-up
  `SKILL.md`, which sits at exactly 250 lines.
- Plan 146's native acceptance should make the owned-context journeys
  discriminate: its command's ownership gate is proven by CLI tests, so the
  native assessors need only require retirement through the command, or add
  one retain variant. Today an agent that skips the ownership check passes.
- Correction SEED-008#creation-record-test-residue (plan 149, ready, not
  queued) cleans this plan's test residue; it may reuse a prefix export plan
  146 adds.
