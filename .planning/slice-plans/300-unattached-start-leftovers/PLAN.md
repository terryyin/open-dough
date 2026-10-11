# Leave nothing behind after an unattached start

**Identity:** SEED-066#unattached-start-leftovers
**Source:** [correction story](../../seeds/SEED-066-composable-lightweight-session-options.md#unattached-start-leftovers),
from the execution retrospective of SEED-066#unattached-session-options (its
story and plan are at `5a971a91`:
`.planning/seeds/SEED-066-composable-lightweight-session-options.md` and
`.planning/slice-plans/298-unattached-session-options/PLAN.md`;
commits `0601f38b`, `01743f09`, `b78790cd`, `4a9bd745`, `e5e26130`,
`eabbe51c`, `b1f662b7` on `claude/choose-workspace-and-automatic-landing-for-unatt`).
Planning only; this plan grants no Take, execution, or publication.

## Goal and scope

A developer whose Isolated workspace start succeeded but whose native session
did not start is told which worktree was left and reuses it on the next try;
the kept unattached starts on the machine do not outlive their attempts; and
the story's interim residue and repeated proofs are removed.

Included: the four findings below. Excluded: any new cleanup of a worktree
that never lands (the reviewed story defers it); any surface showing a landed
run; the native observation, which is
SEED-066#unattached-session-native-observation.

Preserved promises: everything the reviewed story delivers, as its specs
assert; a start refused before any workspace existed keeps no start; an
expired start is resumed by Continue in its kept workspace; story launches are
unchanged.

## Findings

Read at `8308056f`; the first two come from reading the code, not from a
failing run.

1. **A failed native launch after an Isolated start orphans the worktree
   without naming it.** `dashboard/server/launchRun.ts` adds the “workspace
   left behind” words only for a story's established start, and
   `settleSessionStart` (`dashboard/server/sessionStartStore.ts`) removes the
   kept start for every result but uncertain. A host whose launch fails after
   the start script succeeded leaves `.worktrees/<slug>` on `<host>/<slug>`
   unmentioned and unkept, and the next Start creates `<slug>-2`. A formatter
   that cannot be read (`unattachedStart.ts`) orphans the same way, though it
   names the place. A story's one-shot start names the workspace and reuses it.
2. **Kept starts of uncertain attempts never continued are never removed.**
   The only removers are the settle step and a stopped script; attempts are
   pruned by retention (`launchAttemptStore.ts`) and nothing prunes
   `session-starts.json` with them. A Default main start that expired over a
   dirty checkout cannot be continued, so Start again is the likely path.
3. **Interim residue.** `created` on the established session has no production
   reader. `dashboard/LAUNCH-START.md` says the installed start takes an
   existing workspace only under its real path, which the source no longer
   requires since `workspace-publication-select.mjs` compares real paths; the
   dashboard's `asGitNames` stays until a release carries that comparison, and
   only the spent plan recorded why.
4. **Repeated proof through the slow harness.** The twelve
   `agent-launch-start-session-*.spec.ts` files run 36 tests of 7 to 15
   seconds each. Repeats: the identity rule three times beside its unit test;
   slug numbering through four real starts beside `launch-workspace.spec.ts`;
   the expired start's words in three files; the existing-changes
   confirmation six ways for one host-independent check; two default-path
   repeats of `agent-launch-ad-hoc.spec.ts`; six landing-capture journeys; the
   “not offered” words three times. The 3 s to 10 s start wait of
   `responsive-session-recovery.spec.ts` and
   `agent-launch-uncertain-continuation.spec.ts` serves two opposite needs
   with one knob.

## Outside-in proof ownership

| Promise | Owner and observable proof |
| --- | --- |
| A failed launch names the worktree left and the next Start or Continue reuses it | Slice 1, a case in `dashboard/tests/agent-launch-start-session-kept.spec.ts` with a host launch that fails after the start |
| A kept start goes when its attempt is pruned | Slice 2, a case beside the attempt-retention spec with the server clock advanced |
| Everything the reviewed story proves | The surviving Start session specs, `agent-launch-matching-rules.spec.ts`, `launch-workspace.spec.ts`, the ad hoc and one-shot suites; `npm run typecheck:dashboard` |

## Ordered slices

### 1. A failed launch names the worktree it left and the next try reuses it
Type: Behavior
Status: planned
Proof: the new kept-spec case; the Start session recovery and stops specs.

Behavior: Start session, Isolated workspace, on a host whose launch fails
after the start established `.worktrees/tidy-the-readme-wording` → the answer
names that workspace and branch and says the start published nothing; the
attempt can be continued; Continue, or Start again with the same choices and
text, opens the session there and `.worktrees/` holds one worktree. A
formatter that cannot be read behaves the same.

### 2. Kept unattached starts leave with their attempts, and the residue goes
Type: Behavior
Status: planned
Proof: the retention case; the kept and recovery specs; typecheck.

Behavior: an Isolated start expires and is never continued; the attempt is
pruned by retention → `session-starts.json` no longer holds its start.
`created` leaves the established session and its record;
`LAUNCH-START.md` states the real-path argument as the allowance for an older
installed start, to remove once a release carries the comparison.

### 3. Each Start session rule is proved once at the boundary that owns it
Type: Structure
Status: planned
Proof: the surviving specs named below pass; the wide launch suite passes;
the Start session specs' summed time falls.

Change: keep one journey per rule and move data variations to the unit specs
that already own them. Surviving coverage: for identity, the pending-Isolated
journey with its same-choices tail, with both axes in
`agent-launch-matching-rules.spec.ts`; for slugs, one real isolated start and
a `slugOf(title, "session")` case in `launch-workspace.spec.ts`; for expiry,
the recovery and kept journeys; for existing changes, the Start session
journey, the Automatically land line, the isolated skip and one boundary
case; for the default path, a “no start ran” assertion in
`agent-launch-ad-hoc.spec.ts`; for landing capture, one real capture, the
older-installation case and the retained-after-expiry case; for “not
offered”, the boundary case, with reachability alone in the layout spec.
Give the two continuation specs a held-start control separate from the
continuation's wait, so neither waits a fixed bound. This is the directly
owned correction of the retrospective's test finding.

## Current decisions

- A failed launch keeps the start for reuse; it adds no cleanup.
- The codex and cursor existing-changes cases were added for a story
  obligation; the check runs before host code, so one boundary case keeps it.

## Learnings

- None yet.
