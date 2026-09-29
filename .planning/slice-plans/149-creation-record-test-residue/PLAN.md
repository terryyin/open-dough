# Make the creation record's proof findable and wording-tolerant

## Source and authority

- **Identity:** SEED-008#creation-record-test-residue.
- **Source:** [correction story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#creation-record-test-residue),
  from the execution retrospective of
  [SEED-008#durable-workspace-creation-fact](../../seeds/SEED-008-worktree-branch-trunk-sync.md#durable-workspace-creation-fact)
  (plan 147) on 2026-09-29.
- **Provenance:** reviewed range `29f9bc6c..41965529` on
  `claude/durable-workspace-creation-fact`: `cb066559` (creation record and its
  tests), `c9dab355` (retirement guidance and its assertions), `3b1f8619`
  (closure ownership sentences and their assertion).
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication.

## Current findings

Rechecked at `41965529`.

1. **Record assertions ride inside unrelated journey tests.** The shared race
   helper `claimPair`
   (`src/skills/dough-execute-plan/scripts/workspace-publication-race.test.mjs:31-52`)
   selects workspace B with identity `SEED-B#b..not-a-ref` but claims it as
   `identityB`, and asserts no record for both workspaces; both race tests
   (`:60`, `:130`) repeat that assertion under names about races. The queued
   Take's record is asserted inside the plan-link case
   (`workspace-publication-startup-plan-link-cases.mjs:77-80`). No test is
   named for the record, so a maintainer cannot find its proof.
2. **The record's prefix is spelled outside its home.**
   `publication-test-fixtures.mjs:39` defines
   `createdForRoot = "refs/worktree/dough/created-for/"`, and
   `dough-story-refinement/scripts/dough-land.test.mjs:45` writes the full ref
   literally, while `workspace-publication-ownership.mjs:18` owns the name
   through `createdForRef`. If the name drifted, the `[]` assertions would still
   pass without testing anything.
3. **Guidance assertions pin whole sentences, not contracts.**
   `workspace-ownership-lifecycle.test.mjs:57-71`,
   `ci-completion-lifecycle-guidance.test.mjs:186-192`, and
   `dough-land-guidance.test.mjs:89-93` require exact prose such as "retain and
   report it, with the work its creation record names". ADR 0005 allows
   equivalent phrasing and keeps exact matching for explicit contracts; here the
   contracts are the ref name, the read command, and the link to
   "Close or retain it".

## Outcome and boundaries

A maintainer finds the creation record's runtime proof in tests named for it,
the tests take the record's name from its one home, and the guidance can be
reworded without breaking tests while its contracts stay asserted.

Preserved: runtime behavior and guidance text are unchanged; every current
observation of the record keeps an owner (created with identity, unlisted
one-shot without, invalid identity, reuse, preparation creation, queued Take,
and removal with the worktree); the race tests keep their race assertions.
Excluded: the Land intro wording, native assessor discrimination, and the
closure call-site sentences, which the installed wrap-up command story
(plan 146) rewrites. That plan may also export the prefix for its reader; at
start, re-read `workspace-publication-ownership.mjs` on then-current trunk and
reuse an export that already exists.

## Slices

### 1. The creation record has named tests, one name source, and contract-level guidance assertions
Type: Structure
Status: planned
Proof: the new named tests fail with the record write disabled; the edited guidance assertions fail against guidance without the ref name, read command, or link; all touched suites pass.

Correction: export the record prefix from `workspace-publication-ownership.mjs`
beside `createdForRef` and import it in `publication-test-fixtures.mjs`; use
`createdForRef` in `dough-land.test.mjs`. Add named `selectOwnedWorkspace`
tests for the record: created with an identity, created without one, created
with a name Git rejects, and reuse. Remove the record assertions and the
invalid identity from `claimPair`, and move the plan-link case's record
assertions into the named queued-Take coverage or drop them where the named
tests already observe the same boundary. Narrow the three guidance assertions
to the ref name, the read command, and the "Close or retain it" link from each
closure and Land entry point.

Proof: from the checkout root, `node --test` on
`workspace-publication-race.test.mjs`, the new named test file,
`workspace-publication-startup-plan-link-cases.mjs`, `one-shot.test.mjs`,
`one-shot-queued.test.mjs`, `workspace-publication-admission-continuation.test.mjs`,
`preparation-assignment-owned-context.test.mjs`, `dough-land.test.mjs`,
`dough-land-guidance.test.mjs`, `workspace-ownership-lifecycle.test.mjs`, and
`ci-completion-lifecycle-guidance.test.mjs`; one mutation disabling the
`update-ref` in `workspace-publication-select.mjs` fails the named tests; one
mutation removing the read command from `exploration-workspace.md` fails the
lifecycle assertion.

## Proof ownership

| Final-state promise | Owning slice and decisive observation |
| --- | --- |
| Record proof is findable by name | 1: named `selectOwnedWorkspace` tests, failing with the write disabled |
| Record name has one source | 1: fixtures and Land test import from the ownership module |
| Guidance tolerates rewording, contracts stay asserted | 1: narrowed assertions fail when a contract token or link is removed |
| Race tests keep their purpose | 1: race suite passes with `claimPair` free of record assertions |

## Delivery checks

Run the focused files above. The slice adds a test file and no payload
declaration; run `bash tests/payload-declaration-links.sh` under a modern Bash
only if a declared file changes. Use independent post-change refactoring and
ordinary managed delivery.
