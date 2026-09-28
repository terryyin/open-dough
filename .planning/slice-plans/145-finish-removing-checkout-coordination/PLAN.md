# Finish removing default-checkout coordination

## Source and authority

- **Identity:** SEED-008#finish-removing-checkout-coordination.
- **Source:** [story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#finish-removing-checkout-coordination),
  refined on 2026-09-28 with Terry's decisions: naming limited to the guidance
  this story edits and a start gate after plan 142. On 2026-09-29, relayed
  from refinement session b9f90f, Terry narrowed it: the guard also keeps
  delivery from removing the developer's unpublished commits; proceeding
  around unrelated staged content is a deferred promise; the three-host native
  journey is dropped.
- **Provenance:** plan 140's slice 6 (`b3dfd569`, recoverable at
  `199c579f:.planning/slice-plans/140-remote-history-workflows/PLAN.md`) left
  the declared-owner concept, the staged-content guidance mismatch, and a
  guidance-only push guard as human decisions. Plan 142 excludes them in favor
  of this story (its F3, F4, F5). On 2026-09-28 Terry also assimilated plan
  142's retrospective test-redundancy finding (installed-startup reuse
  refusals duplicating refresh-boundary eligibility proof) into slice 2.
- **Authority:** On 2026-09-29 Terry asked to start execution after bringing
  the story and plan up to date.
- **Execution:** Story Branch Mode. Taken by agent Airi-chan at `5769c023`
  (starting revision `5affbd14`, publisher `claude-201e2caa-plan145`) in
  `.worktrees/finish-removing-checkout-coordination` on branch
  `claude/finish-removing-checkout-coordination`, target `origin/main`.
  Published revisions: `5769c023` (Take).

## Start gate

Satisfied: SEED-008#owned-context-start-and-truthful-refresh (plan 142)
closed at `2a3e0ba2`, and SEED-053#proportionate-local-verification (plan 143)
at `162b5fb4`. At the Take (`5769c023`) the premises below were re-read
against trunk and their line references refreshed. The declared-owner
reference set and the guidance sections were unchanged.

## Outcome and boundaries

A developer who explicitly selects their current checkout for an agent's edit
never has their private unpublished commits pushed to trunk or removed from
their branch by the agent's delivery. The unused declared-owner concept is
gone.

Key example (from the story): an unpublished local commit plus push authority
→ delivery refuses before pushing; remote and local history are unchanged.
When trunk has also advanced, delivery refuses before any rebase or push, and
the developer's commit stays on their branch. A current-checkout closure whose
commits are all its own publishes.

Preserved promises and constraints: current-checkout work never gains push
authority it was not given; unrelated staged and unstaged bytes are never
stashed, reset, unstaged, or committed; the checkout and branch never switch;
`--integration` keeps its name. Edit sources only in `src/skills/`, never
installed copies. Follow ADR 0006's executing-agent audience. When removing
behavior, do not add "no longer" prose.

Excluded: product-wide checkout vocabulary unification (only edited sections
use "default checkout"); an entry point for the shipped closure modules
(plan 142's F7); new ownership, locking, or coordination mechanisms; native
acceptance (deterministic tests own the guard). Deferred promise, kept in the
story: direct edits proceeding around unrelated staged content. Direct edit
keeps its stop on unrelated staged content (`maintain-default-checkout.md`
Direct edit steps 1–2 stay unchanged).

## Existing solutions (PFE)

- **The publish path agents actually run** is the installed
  `dough-execute-plan/scripts/execution-increment-delivery.mjs deliver`, which
  calls `publishExecutionIncrement`. Current-branch and host-owned work reach
  it from the recorded checkout (`trunk-publication.md:45-51`), as does
  wrap-up step 8 (`wrap-up.md:166-202`) and closure
  (`trunk-publication.md` "Publish wrap-up closure"). `deliverRecordedCheckout`
  (`current-branch-publication.mjs`) has no entry point; only tests and
  `closure-publication.mjs` (also no entry point) call it. A guard there alone
  would protect no real run, so the guard goes in `publishExecutionIncrement`,
  shared by every caller.
- **Owned-path commits exist only without an entry point.** `commitOwned`
  runs `git commit --only -- <paths>` in modules no agent runs; direct edits
  commit with plain `git commit` (`agent-commits.md:9-12`). This is why
  proceeding around unrelated staged content is deferred rather than a
  guidance-only change.
- **Refresh eligibility** already defers on pending edits, unpublished
  commits, and ongoing operations without any owner step; the owner step is
  additive (`maintain-default-checkout.mjs:11-21,176-194`).

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| Agents publish current-checkout work through `deliver` / `publishExecutionIncrement`, not `deliverRecordedCheckout`. | `grep -rn -E "deliverRecordedCheckout\|current-branch-publication" src tests scripts install.sh`; read `trunk-publication.md:45-105`, `wrap-up.md:166-202`. | Only tests and `closure-publication.mjs` import `deliverRecordedCheckout`; guidance names `deliver`. Direct edit (`maintain-default-checkout.md` step 3) still names the raw Git sequence; slice 1 aligns it. |
| `publishExecutionIncrement` has no restriction on suffix contents; the suffix is `previouslyPublishedBase..branch`. | Read `execution-increment-publication.mjs:111-230` (first fetch at 126). | Confirmed. Only `validatedCandidate`, `validate`, and `onFetchedTarget` guard it. |
| No guidance names the base for current-branch `deliver`. | Read `SKILL.md:140-142` and `execution-location.md`; the start result's `publishedSha` applies only to Story Branch and Trunk Mode. | Confirmed: an agent choosing `origin/<target>` as base would sweep a developer's unpublished commits into the suffix. |
| Every existing caller supplies a base already published on the remote, so "the previously published base must be contained in a fetched remote ref" is a common rule, not a new special case. | In a scratch worktree at `f510358e`, added that check (`git for-each-ref --contains <base> refs/remotes/<remote>/`) with a marker log at the top of `publishExecutionIncrement`, then ran `node --test` over the 39 test files that reach publication, delivery, closure, Land, or preparation publication. Scratch removed afterwards. | 107 pass, 0 fail; the marker never fired. Plan 142 has since added callers (owned-context startup, preparation Land); the selector in slice 1's proof (73 files at `5769c023`) re-checks the premise with the real guard. |
| No test covers an unrelated unpublished commit under the suffix in a checkout that is both workspace and default checkout. | Searched `current-branch-publication.test.mjs`, `current-branch-local-operation.test.mjs`, `publication.test.mjs`, `publication-checkout-maintenance.test.mjs`, `closure-current-branch.test.mjs`. | None; `publication.test.mjs:130` covers it only from a separate workspace. |
| Declared-owner removal is bounded. | `grep -rln -E "declared-owner\|declaredOwner\|another-writer\|unclear-ownership\|--requester" src docs`. | Rechecked at `5769c023`: about 30 code lines (`maintain-default-checkout.mjs:11-21,176-194`, `execution-start-maintenance.mjs:8-9`, `closure-publication.mjs:31-38,66-90`, usage in `execution-start.mjs:12`, `preparation-assignment.mjs:22-25`), about 60 test lines (`publication-checkout-maintenance.test.mjs`, `workspace-publication-startup-maintenance-cases.mjs:75-146`, `workspace-publication-startup-claim-cases.mjs:25-27`, `workspace-publication-startup-local-copy-cases.mjs:98-100`, `closure-publication-fixtures.mjs:101,117`), guidance in `dough-execute-plan/SKILL.md:123-125`, `maintain-default-checkout.md:73-77`, `preparation-assignment.md:41,60,199`, and one maintainer record at `docs/maintainer/near-term-watch-list.md:81`. The case "accepted claim with deferred refresh resumes local maintenance only" (`workspace-publication-startup-maintenance-cases.mjs:130-158`) is built on `another-writer`; it also proves that a resumed start finishes a deferred local refresh without another Take or push. |
| Startup reuse and refresh share one eligibility rule, so the five startup reuse refusals repeat refresh-boundary proof. | Read `workspace-publication-select.mjs:90-110` and `maintain-default-checkout.mjs:176-252` at `af1d260a`; mapped `workspace-publication-startup-reuse-cases.mjs:106-182` against `publication-checkout-maintenance.test.mjs:60-133` and `publication-checkout-ongoing-operation.test.mjs:24-120`; ran those two refresh files (5 pass). | Confirmed: reuse calls `fastForwardToFetchedTrunk`, which refresh also calls. Refresh already proves `pending-edit`, `unpublished-commits`, and `diverged` with state and remote unchanged, and recognizes `MERGE_HEAD`, the other in-progress refs, the index lock, and a real rebase through the shared `ongoingOperation`. Only startup proves the `setup-failed` mapping with nothing published, and only a stopped rebase on the detached `HEAD` it leaves (observed in a scratch repository: empty `branch --show-current`, `rebase-merge` present) proves the operation check precedes the `unexpected-branch` check. Refresh's pre-fetch operation check returns before that ordering. `one-shot-escalation.test.mjs:85-105` separately proves a `pending-edit` refusal at installed admission. |
| With the correct pre-edit base and an advanced trunk, reconciliation would drop the developer's unpublished commit. | Relayed from refinement session b9f90f (2026-09-29): owned-suffix reconciliation runs `git rebase --onto <remoteTip> <pre-edit base> <branch>` in the developer's checkout. Read `execution-increment-delivery.mjs` and `execution-increment-publication.mjs:111-185` at `852b6c8d`. | Confirmed. `deliver` rewrites nothing before calling `publishExecutionIncrement` (`execution-increment-delivery.mjs:103`); inside it, `reconcileAndRequireProof` runs only after the first fetch (line 126). The pre-edit base is the developer's unpublished commit, which no remote ref contains, so a check right after that fetch refuses before any rebase. Slice 1's trunk-advanced tests prove the ordering. |

## Slices

### 1. Publication refuses a base the remote does not hold
Type: Behavior
Status: done
Proof: deterministic tests below, then the focused publication, delivery, and closure test files.

Behavior: A developer's current checkout holds an unpublished local commit;
an agent commits its authorized edit there and `deliver` runs with push
authority and the checkout's `HEAD` from before the agent's first commit as
the previously published base → delivery returns an `unpublished-base` refusal
before any rebase or push; remote refs, local branch, commits, index, and
working tree are unchanged. The same holds when remote trunk has advanced: the
refusal comes before any reconciliation, and the developer's commit stays on
their branch. A current-checkout closure whose before-cleanup and
final-closure commits are both its own publishes both.

Add the check to `publishExecutionIncrement` right after the first fetch, as
one rule for every caller: the previously published base must be contained in
a fetched ref of the named remote. It must run before every reconciliation or
rewrite on the `deliver` path, including any before
`publishExecutionIncrement`'s first fetch. Surface the stop through `deliver`'s
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
byte-for-byte unchanged, both with trunk unchanged and with trunk advanced
(local branch tip and commit list asserted unchanged); the same through the
`deliver` CLI in
`execution-increment-delivery.test.mjs`; in `closure-current-branch.test.mjs`,
two own closure commits publish. Then rerun every publication-reaching test
file, selected as the `src/skills/*/scripts/*.test.mjs` files that name
`execution-increment-publication`, `execution-increment-delivery`,
`current-branch-publication`, `closure-publication`, `preparation-assignment`,
`execution-start`, `workspace-publication`, `publication-test-fixtures`,
`publication-resume`, or `dough-land` (73 files at `5769c023`), plus the
payload declaration checks named under Delivery checks. Any failure there
that the guard causes disproves the common-rule premise and stops for
reassessment rather than a caller-specific exception.

Accepted proof: `remoteHolds` (`publication-git.mjs`) and the
`unpublished-base` stop right after the first fetch in
`publishExecutionIncrement`. Library refusal tests (trunk unchanged with a
pending edit; trunk advanced on a clean checkout) are in
`execution-increment-publication.test.mjs`, and `deliver` CLI refusal tests
are in `execution-increment-managed-delivery-gaps.test.mjs`. Both share
`unpublished-base-test-fixtures.mjs`, which asserts the full local and remote
state is unchanged and the developer's commit stays under the agent's. The
two-commit closure is in `closure-current-branch.test.mjs`. Focused run
16/16. The publication-reaching selector (73 files) passed 263/263 after the
refactor, so the common-rule premise holds for every caller. The payload
declaration checks also passed. With the guard disabled, the refusal tests
fail and the trunk-advanced case rebases the developer's commit off `main`.
Learning: the guard relies on the agent passing its pre-edit `HEAD`. A base
of `origin/<target>` would still sweep the developer's commits into the
suffix, and only guidance covers that choice.

### 2. Refresh and startup carry no ownership declaration
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
from code, guidance, and the refresh results list. Rewrite the resume case in
`workspace-publication-startup-maintenance-cases.mjs:130-158` to defer the
first refresh through Git state (a pending edit in the default checkout that
is removed before the resumed start) and keep its proof that a resumed start
finishes that refresh without another Take or push. The owner flags in the
claim and local-copy cases go. Update the watch-list
entry at `docs/maintainer/near-term-watch-list.md:81` only as far as its
wording names a removed result.

While rewriting `publication-checkout-maintenance.test.mjs`'s preservation
test, drop only its owner assertions: its `pending-edit`,
`unpublished-commits`, `diverged` (clean and dirty), and `unexpected-branch`
observations stay, since they now own the eligibility variations for startup
reuse too. In the same change, reduce the `refusals` table in
`workspace-publication-startup-reuse-cases.mjs` to two installed-startup
cases, and align its header comment:

- **its own commit** — `setup-failed` with the `unpublished-commits` reason,
  the worktree unchanged, and remote trunk unchanged (nothing published);
- **a rebase stopped at a break** — `ongoing-operation`, not
  `unexpected-branch`, on the detached `HEAD`, with the rebase state kept.

Delete the diverged, unstaged-edit, and `MERGE_HEAD` cases. Surviving
coverage for them: refresh `diverged` and `pending-edit` in
`publication-checkout-maintenance.test.mjs`; `MERGE_HEAD`, the other
in-progress refs, and the index lock in
`publication-checkout-ongoing-operation.test.mjs`; installed `pending-edit`
refusal in `one-shot-escalation.test.mjs`. The two fast-forward reuse tests
and the preparation reuse cases in
`preparation-assignment-owned-context.test.mjs` stay unchanged.

Proof: `publication-checkout-maintenance.test.mjs`,
`publication-checkout-ongoing-operation.test.mjs`,
`one-shot-escalation.test.mjs`, the `workspace-publication-startup-*` suites
(through `workspace-publication.test.mjs`), preparation-assignment suites, and
`closure-publication*.test.mjs` pass; the reuse file runs exactly the two
refusals above; and
`grep -rn -E "declared-owner|declaredOwner|another-writer|unclear-ownership|--requester" src`
returns nothing.

## Proof ownership

| Final-state promise | Owning slice and decisive observation |
| --- | --- |
| Unpublished developer commit is never pushed or removed, including when trunk advanced | 1: refusal through `publishExecutionIncrement` and the `deliver` CLI before any reconciliation, remote and local unchanged |
| Current-checkout closure with only its own commits still publishes | 1: two-commit closure test |
| Declared-owner concept removed end to end | 2: suites green, zero references |
| Refresh of a clean, behind checkout needs no owner input | 2: refresh and startup suites |
| Startup reuse keeps its refusal guarantees with redundant cases removed | 2: two surviving startup refusals plus the named refresh and admission tests |
| Edited sections name the default checkout; `--integration` unchanged | 1–2: behavior review of edited sections |
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
The assimilated test consolidation stays in slice 2 because it edits the same
eligibility tests and runs in the proof loop slice 2 already owns. It adds no
slice and no product behavior. After the 2026-09-29 narrowing the plan has two
slices.
