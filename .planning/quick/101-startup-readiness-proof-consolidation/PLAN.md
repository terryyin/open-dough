# Prove startup readiness once in the first-delivery journey

## Source

**Identity:** quick/101-startup-readiness-proof-consolidation/PLAN.md
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"85a3aba0ccf41efc7527710d93126dc20a5dd82b60fc8211c190b0f028a080ad"}}
```

Bounded retrospective correction. This plan is its canonical home; no seed is
required. Provenance: execution of
[plan 100](../100-useful-startup-output/PLAN.md) for
`SEED-008#useful-startup-output`, published revisions `5fdeb4c` (claim) and
`075e955` (compact start result, including the new first-delivery journey).

## Goal and scope

**Beneficiary and outcome:** Open Dough maintainers running the local suite get
the same startup-readiness proof from one real fixture instead of two, so the
suite does not pay twice for one promise.

**Current finding (evidence at `075e955`):**
`workspace-publication-startup-claim-cases.mjs` test "accepted startup precedes
project readiness in the owned workspace" starts a Story Branch claim through
the CLI and runs the readiness gate (1.73 s measured). The new
`workspace-publication-startup-journey-cases.mjs` story-branch case "a
story-branch start result alone carries setup and the first delivery to remote
acceptance" performs the same start and readiness gate before delivery
(2.22 s), but asserts only `readiness.ok`. The older test's unique observations
are: no setup/command marker before the gate; invocation order setup →
command → delegate; every invocation's working directory is the workspace;
markers appear in the workspace and not in the integration checkout; the
integration checkout sits at `publishedSha` and is clean.

**Included:** Move those unique observations into the journey's readiness step
(both modes where the precondition holds, or Story Branch only when a mode
difference makes the observation invalid), then delete the older test.

**Excluded:** Other startup, recovery, or maintenance tests; fixture redesign;
profiling-driven removals owned by plan 096's `dough-test-optimization`
experiments; any production change.

**Preserved promises and constraints:** Accepted startup precedes project
readiness, setup runs only in the owned workspace, and the first delivery
consumes the returned `publishedSha` — each keeps an observable assertion at the
same CLI → readiness gate boundary. No weakened assertion; the journey must not
receive setup or the SHA from a fixture.

## Outside-in proof

| Promise | Surviving observation after consolidation |
| --- | --- |
| Readiness only after an accepted remote claim, in the owned workspace | Journey case: markers absent before `runReadinessGate`, roles `setup, command, delegate`, all `cwd === workspace`, markers present there and absent from the integration checkout |
| Integration checkout advanced to the claim, clean | Journey case, before delivery in both modes: integration `HEAD` equals `receipt.publishedSha` and porcelain status is empty |
| First delivery uses the returned SHA | Existing journey assertions unchanged |

## Current decisions

- Test-only Structure correction; no ADR or North Star topic applies.
- Plan 096 (SEED-037, Taken) edits startup test fixtures for speed. Rebase onto
  current trunk before editing and preserve its changes; if 096 has already
  removed or merged either test, record that and finish with an explained
  empty change.

## Ordered slices

### 1. Startup readiness is proved once, inside the first-delivery journey

Type: Structure
Status: planned
Proof: `node --test src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-*.test.mjs`
passes with the older test absent and the journey carrying every row above;
compare the two tests' combined duration (about 3.95 s at `075e955`) with the
consolidated journey.

Structure: move the older test's unique assertions into the journey case and
delete the older test and any imports it alone used. Directly owned
retrospective correction; enables no later Behavior.

## Learnings
