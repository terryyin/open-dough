# Dough Land keeps a queued story's closure off another owner's claim

## Source

- Identity: SEED-066#dough-land-kept-one-shot-ownership.
- Story: [Check how Dough Land handles a kept one-shot result whose story was taken](../../seeds/SEED-066-composable-lightweight-session-options.md#dough-land-kept-one-shot-ownership).
- Decision (Terry, 2026-10-01, during refinement): Dough Land rechecks
  ownership before each push, as one-shot refinement already does. It neither
  refuses nor hands off to one-shot's guarded landing.

## Goal and scope

A developer who lands a kept one-shot execution result with Dough Land never
publishes a queued story's closure over another owner's claim. Before each push,
Dough Land checks every queued story its candidate closes against fetched
trunk. If another owner now holds one, it pushes nothing and keeps the result.

Excluded:

- Unlisted one-shot results and one-shot refinement. Refinement keeps its own
  `preparation-assignment.mjs recheck`. Its candidate closes no entry, so the
  new check finds nothing to check there.
- Changes to one-shot's guarded landing (`one-shot.md`, managed delivery
  `--one-shot-identity`) and to the backlog merge adapter.
- A new native case for the stop itself. The story asks only for re-acceptance
  of the affected landing journeys. See Considered and excluded.

Assumptions:

- The backlog is at the default path, `.planning/PRODUCT-BACKLOG.md`. The
  guard reused below (`queuedOwnershipGuard`) and refinement's recheck assume
  the same path. Adding `--file` support is not part of this story.

## Current decisions

- **The candidate itself identifies the closure; context does not.** The
  check compares the candidate (`HEAD`) with its merge base on the fetched
  target. A closed story is an identity in that base's **Backlog list** that
  is in neither list at `HEAD`.
  - The merge base is the previously published base before a rebase. On the
    retry after a rejected push, it is the fetched target the suffix was
    replayed onto. So one command serves both checks and needs no `--base`
    input.
  - Once the candidate is accepted, the merge base is the candidate itself, so
    a rerun finds no closures.
  - This also covers a later session that names only the workspace, as the
    story's scope requires. A queued story dropped by hand on the default
    checkout is protected the same way. That follows naturally from the rule;
    it is not a separate delivery promise.
- **The ownership rule is reused, not rewritten.** Each closed identity goes
  through `queuedOwnershipGuard` (`src/skills/dough-execute-plan/scripts/one-shot-ownership.mjs`).
  That guard is the single home of the rule: no Taken entry, no agent profile
  of either activity, still in the **Backlog list** or already on trunk.
  Managed delivery's `--one-shot-identity` and refinement's `recheck` already
  use it. Its `ownership-changed` stop shape (`ownership`, `error`) is reused
  unchanged.
- **The check is Dough Land's own installed command**, a new
  `src/skills/dough-land/scripts/queued-closure-check.mjs`. It sits beside
  `worktree-retirement.mjs`, because Dough Land runs it on every landing
  whatever the caller. Importing from `dough-execute-plan` follows the existing
  precedent: `worktree-retirement.mjs` and refinement's recheck already do.
- **Two native evidence lists must name the new script**, because Dough Land's
  publication now runs it:
  - `git_publication_closing_input_hash_lines` in
    `tests/support/git-publication-native-shared.sh`, as an import-closure
    command;
  - `land_inputs` in `tests/native-evidence-identity.sh`.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| Without a change, Dough Land publishes the closure over a rival preparation profile | Slice 1 exists at all | Local fixture (bare remote; workspace commit runs `product-backlog.mjs complete` for queued A; rival pushes `.planning/agents/rival.json` naming A with activity `preparation`); then `product-backlog-git-rebase.mjs rebase --onto origin/main --ref <base> --branch main` and `git push` | Adapter reported a clean rebase and the push was accepted. Trunk lost A's entry; the rival profile remained |
| A rival Take already stops Dough Land with nothing pushed | Example 3 keeps its outcome | Same fixture, rival runs `product-backlog.mjs take --identity SEED-001#a --no-plan` | Adapter stopped (`removes it while … changes it`, exit 1), nothing pushed. A raw `git rebase` replayed cleanly, so the adapter is what stops it |
| `queuedOwnershipGuard` reports a preparation profile, a Taken entry, and a departed entry as `ownership-changed`, and treats a candidate already on trunk as clear | Slice 1's command | Read `one-shot-ownership.mjs:91-119`. `one-shot-refinement-auto-land.test.mjs` ("a preparation holder published after the auto-land start …") stops a Dough Land model landing through it | Holds |
| The Dough Land Git model runs a check on each fetched target tip, including before the retry push, and stops with nothing pushed | Slice 1's proof | `dough-land-test-fixtures.mjs:131-191` (`landWorktree` → `publishExecutionIncrement` `onFetchedTarget`). `fetchedTargetStop` in `applicable-candidate-proof.mjs:41-45` passes `{attempt, candidate, remoteTip}` | Holds. The model's own base is `merge-base branch remote/target`, matching the decision above |
| `landWorktree`'s callers are the tests that would see a new default check | Slice 1 regression scope | `grep -rl landWorktree src/skills` | `dough-land*.test.mjs`, `preparation-assignment-{land,landing-retry,remote-base,reuse}.test.mjs`, `one-shot-refinement-auto-land.test.mjs`, `dough-bug-fixing/scripts/retained-artifacts.test.mjs`. None of their candidates closes a queued entry |
| Evidence-identity coverage is checked for Dough Land's inputs and every module a listed command imports | Slice 1 identity lists | Read `tests/native-evidence-identity.sh:109-160`; ran `PATH=/opt/homebrew/bin:$PATH bash tests/native-evidence-identity.sh` | Exit 0 in about 10s. It fails when a closing journey omits a `land_inputs` entry or an imported module |
| The focused proof commands run locally, unpaid | Slice 1 proof | `node --test src/skills/dough-story-refinement/scripts/dough-land.test.mjs src/skills/dough-story-refinement/scripts/dough-land-guidance.test.mjs src/skills/dough-story-refinement/scripts/one-shot-refinement-auto-land.test.mjs` | 8 pass in about 5s |

## Outside-in proof

Key examples from the story, with their signals:

1. **Trunk unchanged for A.** The kept result closes queued A →
   the check reports `clear` with `closes: ["A"]`. The Dough Land model lands
   it; trunk holds the result and no A entry, and the workspace is retired.
2. **Rival preparation profile for A** published after the result →
   the check reports `ownership-changed` naming that agent and `preparation`.
   The landing stops at `publish` with remote `main` unchanged, the profile
   intact, and the workspace `HEAD` equal to the result commit.
3. **Rival Take of A** → the same stop, this time at the check
   (`list: "## Taken"`), before the backlog adapter is reached.
4. **Retry after a race.** The first push is rejected by a racing commit that
   also Takes A (`beforePush`) → the retry's check stops it with nothing
   pushed.
5. **Unlisted result (no Backlog entry removed)** → `clear` with empty `closes`.
   It lands exactly as today, and the existing Dough Land tests stay green.

## Ordered slices

### 1. Dough Land stops a closure that another owner now holds

Type: Behavior
Status: done
Proof: a new `src/skills/dough-land/scripts/queued-closure-check.test.mjs`
covers examples 1–5 through the Dough Land Git model and the installed command,
together with the existing `landWorktree` callers listed above. Then
`dough-land-guidance.test.mjs` asserts the new step. Then
`PATH=/opt/homebrew/bin:$PATH bash tests/native-evidence-identity.sh` passes
with the new script listed.

Behavior: a landing checkout holds a commit that closes queued story A, and
another owner holds A on fetched trunk → Dough Land, before the push and again
before the retry push, runs
`node <installed>/dough-land/scripts/queued-closure-check.mjs check --checkout <checkout> --remote <remote> --target-ref refs/heads/<branch>`.
It reports `ownership-changed` with `ownership` and `error`. Dough Land pushes
nothing, keeps the commit and checkout, and reports publication, refresh, and
cleanup as not done. When no other owner holds A, or the candidate closes
nothing, it prints `ok: true, status: "clear"` and the landing continues
unchanged.

Work it includes:

- **The command.** It fetches, takes the merge base of `HEAD` and the fetched
  target, finds the identities closed between that base and `HEAD`, and runs
  `queuedOwnershipGuard` for each against the fetched tip. It prints one JSON
  line. A stop exits 1; a usage error exits 2.
- **`src/skills/dough-land/SKILL.md` "Publish".** Supply that command as the
  candidate check, run on each fetched target before rewriting and before the
  retry push. Add one row for `ownership-changed`: push nothing, keep
  everything, report the `ownership` and `error`, and leave the story to that
  owner and the developer. Keep the reconciliation-conflict sentence, which
  says not to resolve it by removing the other side's entry.
- **`landWorktree` in `dough-land-test-fixtures.mjs`.** It models the new step
  by running the installed command on each fetched target, before any
  caller-supplied `onFetchedTarget`.
- **The two evidence lists** named under Current decisions.
- **Before commit**, the post-change refactor pass. Look at whether
  `one-shot-refinement.md`'s recheck sentence can now defer to Dough Land's
  own check. Change it only if refinement's separate recheck becomes redundant
  for the same stop. It does not become redundant for an unchanged candidate
  that closes nothing: refinement still needs its story-specific `queued`
  check.

### 2. Re-accept the affected native landing journeys

Type: Behavior
Status: planned
Proof: manual, paid, triggered by Terry (or by in-session authorization). Each
command below exits 0 with its results directory retained. No automated or CI
case is added.

Behavior: slice 1 changed Dough Land's guidance and command closure, so
recorded native evidence for these journeys no longer matches its identity →
fresh native runs on the listed hosts pass under the new inputs. This is the
ADR 0005 proof that guidance followed natively still lands, refreshes, and
retires as before. Rerun only the journeys whose identity
`tests/native-evidence-identity.sh` reports changed. At planning time those
were:

```text
PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native HOST --case publication/preparation-land --results-dir <DIR>
PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native HOST --case publication/land-default-checkout --results-dir <DIR>
PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native HOST --case trunk-closure/owned-context --results-dir <DIR>
PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native HOST --case story-branch-closure/source-conflict --results-dir <DIR>
```

The first two run Dough Land's Publish step, and so the new check, on claude,
codex, and cursor. The closure journeys use Dough Land only for retirement.
Run them on the hosts their case assigns. Terry chooses the host set at run
time if cost calls for fewer.

## Considered and excluded

- **A native case for the stop.** No existing native journey
  closes a queued story through Dough Land while another owner holds it, so
  re-acceptance proves only that ordinary landing journeys did not regress
  under the new step. The stop itself is proved mechanically, through the Git
  model and the installed command, in slice 1. Adding a native case was
  considered and excluded under the story's scope. Native proof of the stop would be a scope addition.

## Execution context and accepted slice 1 proof

- Mode: story-branch; workspace and branch supplied by Established start.
- Publisher: `dashboard-mac.lan-open-dough`; agent: `aki-chan`.
- Claim and previously published base: `cc865741f835b7ed9c99483cb345aca0b561ea01`.
- Starting revision: `1eb982ba221a28f07043a8ecedebc937d1338f6f`.
- Remote: `origin`; trunk: `main`; increment target:
  `refs/heads/codex/check-how-dough-land-handles-a-kept-one-shot-res`.
- Checkout setup: `npm ci`, followed by the existing guidance check through
  the project runner, passed. Replanning allowed within existing authority;
  no numeric slice budget is supplied, so boundedness follows the shared gate.
- Slice 1 proof (exit 0):

```sh
PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-land/scripts/queued-closure-check.test.mjs src/skills/dough-story-refinement/scripts/dough-land-guidance.test.mjs src/skills/dough-story-refinement/scripts/dough-land.test.mjs src/skills/dough-story-refinement/scripts/dough-land-rerun.test.mjs src/skills/dough-story-refinement/scripts/dough-land-remote-context.test.mjs src/skills/dough-story-refinement/scripts/preparation-assignment-land.test.mjs src/skills/dough-story-refinement/scripts/preparation-assignment-landing-retry.test.mjs src/skills/dough-story-refinement/scripts/preparation-assignment-remote-base.test.mjs src/skills/dough-story-refinement/scripts/preparation-assignment-reuse.test.mjs src/skills/dough-story-refinement/scripts/one-shot-refinement-auto-land.test.mjs src/skills/dough-bug-fixing/scripts/retained-artifacts.test.mjs tests/native-evidence-identity.sh tests/payload-declaration-links.sh tests/execution-payload-update.sh tests/story-payload-update.sh
```

`retainedResult` and `rival` supply starting conditions. The seven new cases
observe clear closure and retirement, preparation/execution owner preservation,
Taken ownership, retry refusal after a racing Take, empty closure for unlisted
work, accepted-candidate rerun, and usage exit 2. `assertHeld` observes unchanged
remote and retained HEAD/workspace with refresh/cleanup not done. Guidance
assertions observe timing and preservation. Existing landing consumers,
import-closure identity, and installed payload/update checks pass.

Independent post-change refactor: no edits needed; accepted proof remains valid.
Formatting exposed an unused result-field binding in the model adapter; replaced
it with explicit ownership/error forwarding and reran the affected command/model
checks through the runner. Representative skill behavior review confirms explicit
invocation, required checkout/remote/target, useful missing-input stop, and named
ownership refusal preserving the result.

## Learnings

- Declare the new command in `install.sh` and update the installed-module proof,
  so guidance never refers to an undelivered runtime dependency.
- A base with no queued entries cannot supply a queued closure. Return clear
  before parsing the candidate's backlog in that case; this preserves an existing
  bug-fixing fixture that introduces a noncanonical backlog from no backlog.
- Refinement's identity-specific recheck remains necessary: its unchanged
  candidate closes no queued entry, so Dough Land's check cannot replace it.
- New test fixtures must record the canonical identity explicitly to match
  profile identities. The initial fixture mismatch was corrected before acceptance.
