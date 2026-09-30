# Land changes made on the default checkout

## Source and authority

- **Identity:** SEED-008#land-from-default-checkout
- **Source:** [story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#land-from-default-checkout),
  refined 2026-09-30 (Terry: include everything on the checkout; no
  relatedness refusal).
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication.

## Outcome and boundaries

A developer who changed the default main checkout says "land" and Dough Land
commits everything there and publishes it onto the remote trunk without force,
reporting publication, refresh, and cleanup separately. Retirement is not
applicable. A change in an owned worktree lands as before.

Included: everything on the checkout (tracked, untracked, deleted), and local
commits the fetched target lacks. Excluded: path picking; landing from a
checkout that is not the default main one; a CI observer (Dough Land registers
none).

Considered and excluded: reusing `deliver` (`execution-increment-delivery.mjs`).
It resolves a CI runtime and registers an observer, which Dough Land
deliberately does not do, and Direct edit's "unrelated unstaged edits stay out"
contradicts the refined decision.

## Architectural reuse (PFE)

No new script or structure. The publication sequence already supports an owned
workspace that is the default checkout:
[publish the candidate](../../../src/skills/dough-execute-plan/references/publish-the-candidate.md)
lets the default checkout's branch be rebased when it is the owned branch, and
its resume table has a "Candidate only on the default checkout" row. After the
commit nothing is pending, so
[preserve pending local work](../../../src/skills/dough-execute-plan/references/maintain-default-checkout.md#preserve-pending-local-work)
does not stop it. Only `src/skills/dough-land/SKILL.md` changes: its stop for a
named default checkout, the commit/base/refresh/retire/rerun/report wording. No
Accepted ADR conflicts; [ADR 0009](../../../docs/adrs/0009-git-branching-and-integration.md)
(Proposed) keeps the default checkout optional and its use developer-driven.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| One stop forbids landing from the default checkout | `grep -rn "landing never" src docs tests` | only `src/skills/dough-land/SKILL.md:49` |
| Publisher accepts the default checkout as owned workspace | read `publish-the-candidate.md` | rebase rule "unless it is the owned branch"; resume row "Candidate only on the default checkout" |
| Agent commit does not apply | read `agent-commits.md` | a checkout with no assigned agent commits with plain `git commit` |
| Plain native fixture has a default checkout on `main` with origin | `tests/support/git-publication-native-fixture.sh:49-64` | `integration` clone on `main`, pushed to bare `origin` |
| Land inputs are in the evidence identity | `tests/native-evidence-identity.sh:111` | `src/skills/dough-land/SKILL.md` is a land input, so recorded evidence goes stale |
| The host can run with its cwd in the integration checkout | `tests/support/git-publication-native-run.sh:153-166` | `startup-*`, `admission-*` and `one-shot-*` journeys already set `native_run_workspace` to the integration checkout; a `land-*` journey joins that branch |

## Promise → proof

| Promise | Slice | Proof |
| --- | --- | --- |
| Tracked edit, untracked file and an unpushed local commit on the default checkout land as one accepted, non-force publication after origin moved; nothing retired | 1, 2 | new journey `publication/land-default-checkout`: assessor and counterexamples free; live run per host manual |
| Owned worktree lands as before | 2 | existing `publication/preparation-land` re-run manually after the guidance change |

## Slices

### 1. A journey can tell whether a default-checkout landing happened
Type: Behavior
Status: done
Proof: `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/git-publication-native.sh`.
The free suite runs the journey once through the substitute host and its
assessor counterexamples, and stays under `per-job-seconds=71`.

Behavior: a fixture whose default checkout on `main` holds a tracked edit, an
untracked file, one unpushed local commit, with origin advanced by another
writer, and a prompt "land it" from that checkout → the assessor accepts an
observation where origin holds one new commit with both files plus the local
commit, pushed without force, the checkout is clean at the accepted SHA, no
worktree was removed and no retirement command ran. Each rejected case changes
one declared signal of that passing observation
(`tests/support/native-assessor-counterexample.sh`): forced push, a file left
uncommitted, local commit dropped, retirement command run, checkout left
behind or dirty. The run-support branch that selects the integration checkout as
the host's workspace gains this journey.

Accepted: free suite passes (`publication/land-default-checkout`, ten
assessor counterexamples, sensitivity check with a forced push); assessor at
`git_publication_assess_land_default` in
`tests/support/git-publication-native-land-default.sh`. Learning: a journey
that installs guidance into the integration checkout must commit that install
to trunk before planting edits, or landing everything sweeps the install in.

### 2. Dough Land lands a change made on the default main checkout
Type: Behavior
Status: done
Proof: slice 1's free suite plus `bash scripts/test.sh
tests/payload-declaration-links.sh tests/native-evidence-identity.sh`; the
manual, paid live acceptance is `tests/git-publication-native.sh --native HOST
--case publication/land-default-checkout` for Codex, Cursor and Claude Code,
then `--case publication/preparation-land` to show worktree landing is
unchanged. Terry runs the paid runs; the plan does not.

Behavior: the developer says "land" and the context says the change is on the
default main checkout, which is on the target branch → Dough Land commits
everything there with plain `git commit`, publishes that suffix with the
existing sequence, reports publication, refresh (already current) and cleanup
(not applicable). Edit `src/skills/dough-land/SKILL.md`: description and
opening, the stop for a named default checkout (now: stop only when it is on
another branch than the target), the commit and suffix base, retirement not
applicable, rerun and report wording. A named owned worktree lands as before.
Stale recorded native evidence is renewed by those runs.

Accepted: `src/skills/dough-land/SKILL.md` edited; free proof passes
(`payload-declaration-links`, `native-evidence-identity`,
`git-publication-native`). Paid live runs per host remain manual for Terry and
renew the stale native evidence.

## Remaining concerns

- Key examples 2 (rebase conflict stop) and 5 (checkout on another branch) are
  guidance-only; the journey covers the successful path. Excluded to keep the
  journey to one signal set; the publisher's conflict stop is already owned by
  `publish-the-candidate.md`.
No blocking concern remains.
