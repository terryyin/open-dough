# Finish removing default-checkout coordination

## Source and authority

- **Identity:** SEED-008#finish-removing-checkout-coordination.
- **Source:** [story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#finish-removing-checkout-coordination),
  refined on 2026-09-28 with Terry's decisions: naming limited to the guidance
  this story edits, native acceptance as one direct-edit journey per host, and
  a start gate after plan 142.
- **Provenance:** plan 140's slice 6 (`b3dfd569`, recoverable at
  `199c579f:.planning/slice-plans/140-remote-history-workflows/PLAN.md`) left
  the declared-owner concept, the staged-content guidance mismatch, and a
  guidance-only push guard as human decisions. Plan 142 excludes them in favor
  of this story (its F3, F4, F5).
- **Authority:** Terry asked for refinement and then a slice plan. This plan is
  planning only. It grants no Take, implementation, or publication.
- **Preparation workspace:** `.worktrees/prep-finish-checkout-coordination`
  (branch `claude/prep-finish-checkout-coordination`), announced as agent
  Julia-chan at `cd0027ca`.

## Start gate

**Do not Take or execute this plan until
[SEED-008#owned-context-start-and-truthful-refresh](../142-owned-context-start-and-refresh/PLAN.md)
(plan 142) has left Taken on remote trunk.** It changes the same refresh code
and results list, `maintain-default-checkout.md`, `preparation-assignment.md`,
the startup cases that carry the owner flags, and the native publication
harness this plan's slice 4 extends. Terry also named
SEED-053#proportionate-local-verification (plan 143) as a gate; it closed at
`162b5fb4` before this plan landed. At start, re-read the files each slice
names against the then-current trunk and refresh line references before
editing.

## Outcome and boundaries

A developer who explicitly selects their current checkout for an agent's edit
can let the agent commit and publish around their own staged files, and never
has their private unpublished commits pushed to trunk by it. The unused
declared-owner concept is gone. Plan 140's current-checkout change and this
one become releasable under ADR 0005's native acceptance.

Key examples (from the story):

1. Unrelated file staged → the agent proceeds; the commit holds only the
   authorized file, and the staged file stays staged with identical bytes.
2. An unpublished local commit plus push authority → delivery refuses before
   pushing; remote and local history are unchanged. A current-checkout closure
   whose commits are all its own publishes.
3. An authorized path already has the developer's staged change → the agent
   stops before editing; index and working tree are unchanged.

Preserved promises and constraints: current-checkout work never gains push
authority it was not given; unrelated staged and unstaged bytes are never
stashed, reset, unstaged, or committed; the checkout and branch never switch;
`--integration` keeps its name. Edit sources only in `src/skills/`, never
installed copies. Follow ADR 0006's executing-agent audience. When removing
behavior, do not add "no longer" prose.

Excluded: product-wide checkout vocabulary unification (only edited sections
use "default checkout"); an entry point for the shipped closure modules
(plan 142's F7); new ownership, locking, or coordination mechanisms; a
native journey for the refusal case (deterministic proof owns it).

## Existing solutions (PFE)

- **The publish path agents actually run** is the installed
  `dough-execute-plan/scripts/execution-increment-delivery.mjs deliver`, which
  calls `publishExecutionIncrement`. Current-branch and host-owned work reach
  it from the recorded checkout (`trunk-publication.md:46-51`), as does
  wrap-up step 8 (`wrap-up.md:166-187`) and closure
  (`trunk-publication.md` "Publish wrap-up closure"). `deliverRecordedCheckout`
  (`current-branch-publication.mjs`) has no entry point; only tests and
  `closure-publication.mjs` (also no entry point) call it. A guard there alone
  would protect no real run, so the guard goes in `publishExecutionIncrement`,
  shared by every caller.
- **Owned-path commits already exist.** `commitOwned` runs
  `git commit --only -- <paths>`; `current-branch-publication.test.mjs:29,79`
  prove unrelated staged bytes stay staged. Current-branch work commits with
  plain Git (`agent-commits.md:9-12`). Slice 2 changes guidance only.
- **Refresh eligibility** already defers on pending edits, unpublished
  commits, and ongoing operations without any owner step; the owner step is
  additive (`maintain-default-checkout.mjs:186-197`).

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| Agents publish current-checkout work through `deliver` / `publishExecutionIncrement`, not `deliverRecordedCheckout`. | `grep -rn -E "deliverRecordedCheckout\|current-branch-publication" src tests scripts install.sh`; read `trunk-publication.md:46-84`, `wrap-up.md:166-187`. | Only tests and `closure-publication.mjs` import `deliverRecordedCheckout`; guidance names `deliver`. Direct edit (`maintain-default-checkout.md` step 3) still names the raw Git sequence; slice 1 aligns it. |
| `publishExecutionIncrement` has no restriction on suffix contents; the suffix is `previouslyPublishedBase..branch`. | Read `execution-increment-publication.mjs:125-210`. | Confirmed. Only `validatedCandidate`, `validate`, and `onFetchedTarget` guard it. |
| No guidance names the base for current-branch `deliver`. | Read `SKILL.md:138-139` and `execution-location.md`; the start result's `publishedSha` applies only to Story Branch and Trunk Mode. | Confirmed: an agent choosing `origin/<target>` as base would sweep a developer's unpublished commits into the suffix. |
| Every existing caller supplies a base already published on the remote, so "the previously published base must be contained in a fetched remote ref" is a common rule, not a new special case. | In a scratch worktree at `f510358e`, added that check (`git for-each-ref --contains <base> refs/remotes/<remote>/`) with a marker log at the top of `publishExecutionIncrement`, then ran `node --test` over the 39 test files that reach publication, delivery, closure, Land, or preparation publication. Scratch removed afterwards. | 107 pass, 0 fail; the marker never fired. |
| No test covers an unrelated unpublished commit under the suffix in a checkout that is both workspace and default checkout. | Searched `current-branch-publication.test.mjs`, `current-branch-local-operation.test.mjs`, `publication.test.mjs`, `publication-checkout-maintenance.test.mjs`, `closure-current-branch.test.mjs`. | None; `publication.test.mjs:130` covers it only from a separate workspace. |
| Declared-owner removal is bounded. | `grep -rln -E "declared-owner\|declaredOwner\|another-writer\|unclear-ownership\|--requester" src docs`. | About 30 code lines (`maintain-default-checkout.mjs`, `execution-start-maintenance.mjs:8-9`, `closure-publication.mjs:31-39,66-91`, usage in `execution-start.mjs:12`, `preparation-assignment.mjs:22-25`), about 60 test lines (`publication-checkout-maintenance.test.mjs`, `workspace-publication-startup-{maintenance,claim,local-copy}-cases.mjs`, `closure-publication-fixtures.mjs`), and guidance in `dough-execute-plan/SKILL.md:121-123`, `maintain-default-checkout.md:23,70-74`, `preparation-assignment.md:40,56-58,194`. `startup-maintenance-cases.mjs:129-158` is built on `another-writer`. |
| No native journey covers current-checkout work. | `ls tests/support \| grep native`; the `git-publication-native-*` harness has startup, admission, one-shot, prepared, and closure journeys only. | Confirmed. Slice 4 adds one after plan 142's slice 7 reshapes the harness. |

## Slices

### 1. Publication refuses a base the remote does not hold
Type: Behavior
Status: planned
Proof: deterministic tests below, then the focused publication, delivery, and closure test files.

Behavior: A developer's current checkout holds an unpublished local commit;
an agent commits its authorized edit there and `deliver` runs with push
authority and the checkout's `HEAD` from before the agent's first commit as
the previously published base → delivery returns an `unpublished-base` refusal
before any rebase or push; remote refs, local branch, commits, index, and
working tree are unchanged. A current-checkout closure whose before-cleanup
and final-closure commits are both its own publishes both.

Add the check to `publishExecutionIncrement` right after the first fetch, as
one rule for every caller: the previously published base must be contained in
a fetched ref of the named remote. Surface the stop through `deliver`'s
receipt like other publication stops. Guidance: current-branch and host-owned
publication (`trunk-publication.md`, `wrap-up.md` step 8, wrap-up closure) and
direct edit (`maintain-default-checkout.md` step 3) pass the `HEAD` recorded
before the operation's first commit as `--previously-published-base`; direct
edit publishes through the same `deliver` entry point instead of the raw Git
sequence. Report an `unpublished-base` stop as the developer's unpublished
work to resolve; never choose a different base to get around it. Use "default
checkout" in the sections edited.

Proof: in `current-branch-publication.test.mjs`, a developer commit under the
agent's commit with push authority refuses, and remote/local state is
byte-for-byte unchanged; the same through the `deliver` CLI in
`execution-increment-delivery.test.mjs`; in `closure-current-branch.test.mjs`,
two own closure commits publish. Then rerun the 39 publication-reaching test
files and the payload declaration checks named under Delivery checks.

### 2. Direct edits proceed around unrelated staged content
Type: Behavior
Status: planned
Proof: guidance walk of examples 1 and 3 plus the existing runtime tests; native confirmation in slice 4.

Behavior: The developer has staged an unrelated file and selects their
current checkout for an agent's edit → the agent edits and commits only the
authorized path with `git commit --only -- <paths>`; the staged file stays
staged with identical bytes. When an authorized path already has staged
content before the edit → the agent stops before editing, with nothing
changed.

Change `maintain-default-checkout.md` Direct edit steps 1–2 and `wrap-up.md`
step 6 for the current checkout accordingly; an unpublished unrelated commit
and an ongoing operation still stop the edit at step 1. Keep the runtime as is:
`current-branch-publication.test.mjs:29,79` already prove the commit shape.
Add a guidance assertion only where an existing guidance test already covers
these sections. Use "default checkout" in the sections edited.

Proof: rerun `current-branch-publication.test.mjs` and
`closure-current-branch.test.mjs`; walk examples 1 and 3 through the edited
guidance under the maintainer behavior review, recording each decision point.

### 3. Refresh and startup carry no ownership declaration
Type: Behavior
Status: planned
Proof: refresh, startup, preparation, and closure suites green, with zero remaining references.

Behavior: A default checkout that is clean and strictly behind trunk after an
accepted publication → startup, preparation, Land, and closure refresh advance
it with no owner or requester input; refresh reports only the Git-state
results (`advanced`, `already current`, `deferred` for pending work or an
ongoing operation, `stopped`, `not applicable`).

Delete the owner step (`singleOwner`, `declaredOwnerRefusal`, and its branch
in `attemptRefresh`), the `--declared-owner` and `--requester` options and
their forwarding, and the `another-writer` and `unclear-ownership` results
from code, guidance, and the refresh results list. Rewrite
`startup-maintenance-cases.mjs:129-158` to keep whatever Git-state deferral it
also proved, or delete it if it proved only ownership. Update the watch-list
entry at `docs/maintainer/near-term-watch-list.md:81` only as far as its
wording names a removed result.

Proof: `publication-checkout-maintenance.test.mjs`, the
`workspace-publication-startup-*` suites, preparation-assignment suites, and
`closure-publication*.test.mjs` pass;
`grep -rn -E "declared-owner|declaredOwner|another-writer|unclear-ownership|--requester" src`
returns nothing.

### 4. Native acceptance of current-checkout guidance
Type: Behavior
Status: planned
Proof: one fresh direct-edit journey per host on Claude Code, Codex, and Cursor, judged by the harness assessor. Paid and manual; needs Terry's run authority at execution time.

Behavior: On each host, from installed candidate guidance, a developer's
default checkout holds an unrelated staged file and an unrelated unstaged
edit; the developer asks the agent to change one file there and publish it →
the agent proceeds without an owner declaration, commits only that file,
publishes through `deliver` with the pre-edit `HEAD` as base, and the staged
and unstaged bytes, branch, and worktree list are unchanged.

Add this one journey to the `git-publication-native-*` harness in the shape
plan 142 left it, with its assessor proved by a counterexample in the
credential-free default mode. This covers plan 140's current-checkout guidance
and this plan's slices 1–3. The refusal case stays with slice 1's
deterministic proof.

Proof: harness counterexample passes unpaid; three fresh host runs judged
accepted, with host version and candidate SHA recorded here; run output
deleted after judging.

## Proof ownership

| Final-state promise | Owning slice and decisive observation |
| --- | --- |
| Example 2: unpublished developer commit is never pushed | 1: refusal through `publishExecutionIncrement` and the `deliver` CLI, remote and local unchanged |
| Current-checkout closure with only its own commits still publishes | 1: two-commit closure test |
| Example 1: agent proceeds around unrelated staged content | 2: guidance walk + existing runtime tests; 4: native journey |
| Example 3: staged change on an authorized path stops the edit | 2: guidance walk |
| Declared-owner concept removed end to end | 3: suites green, zero references |
| Refresh of a clean, behind checkout needs no owner input | 3: refresh and startup suites |
| Edited sections name the default checkout; `--integration` unchanged | 1–3: behavior review of edited sections |
| Plan 140 and this plan's current-checkout guidance accepted natively on three hosts | 4 |
| One shared payload across hosts | every slice: payload checks below |

## Delivery checks

Each slice carries its implementation, guidance, focused proof, and cleanup.
Run the focused test files named in each slice at its boundary. When a slice
changes declared runtime or guidance dependencies, run
`bash tests/payload-declaration-links.sh` and the affected
`tests/execution-payload-update.sh`, `tests/story-payload-update.sh`, or
`tests/product-backlog-payload-update.sh`. Follow the slice-planning
local-verification rule landed by `162b5fb4`. Do not hand-synchronize installed copies.
Use independent post-change refactoring and ordinary managed delivery.

## Concern review

No blocking slice-specific concern was identified in this review. The guard
is one common rule whose premise was observed across every existing caller.
Slice 2 is guidance-only because the runtime already behaves as promised.
Slice 4's harness shape depends on plan 142's slice 7, which the start gate
covers; its paid runs need separate authority at execution time.
