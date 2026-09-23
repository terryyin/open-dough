# Share one delivery-evidence native harness for four cases

Status: planned. No execution has started or been authorized.

## Correction input

**Source / provenance:** Execution retrospective of planned story
`SEED-004#accept-delivery-evidence`, plan
[085-accept-delivery-evidence](../085-accept-delivery-evidence/PLAN.md),
seed
[SEED-004#accept-delivery-evidence](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#accept-delivery-evidence).
Related published revisions attributable to that execution:
claim `59b76944b466ecccbfd985a211c78a6e385569a8` on `refs/heads/main`;
slices `2e96700a5e2aae750950fe7095e788cd605ef1bd`,
`7b564d8a5a093a5dc17761708f5a6f79a670ee29`,
`f0f355c4f32dd1a5c794c1e15ad43a0e079e5988`,
`a36f7ffd2050e23c1395438f9e389220be0b2787` on
`refs/heads/cursor/085-accept-delivery-evidence`. Review date: 2026-09-23.

**Beneficiary and bounded outcome:** Maintainers and agents extending
delivery-evidence acceptance proof change orchestration once. Four case names
(`delivery-evidence/selection`, `claims`, `consumers`, `gaps`) keep their
distinct observe/assess/scenario behavior and credential-free counterexamples;
shared run/fixture/control-flow scaffolding lives in one place.

**Current findings (scope):** Aggregate review found four near-clone
`tests/support/delivery-evidence-*-native-run.sh` files (~78% shared structure;
claims↔gaps nearly identical) and largely duplicated fixture install/git
scaffolding across ~3.3k LOC / 20 support files. Case-specific
observe/assess/scenario-content bodies are appropriately distinct. This is
shotgun residue from Behavior-only slices that each copied the first-slice
runner adaptation instead of extending a shared harness.

**Preserved product promises and constraints:** Do not change the four
acceptance mechanisms, their Cursor-recorded native expectations, assessor
pass/fail criteria, or finding/watch disposition rules from plan 085. Do not
add a second native runner, a general evidence registry, mandatory host matrix
reruns, or a report schema. Keep using the existing
`tests/git-publication-native.sh` transport and ADR 0005 selective `--case`
pattern. Codex and Claude native runs remain pending (not passed) until a
separate acceptance/follow-up path owns them; this correction does not mark
them passed.

**Observable proof ownership:** Credential-free default of
`bash tests/git-publication-native.sh` must still PASS all four
delivery-evidence assessor suites. Focused comparison that each case still
registers under `--case delivery-evidence/{selection,claims,consumers,gaps}`.
No requirement to re-run live native hosts for this Structure correction when
credential-free coverage and wiring prove preserved behavior.

## Goal and boundaries

Collapse duplicated delivery-evidence native orchestration into one shared
harness (or the smallest equivalent seam) while preserving four case-specific
bodies and the existing entrypoint wiring. Exclude rewriting
`#accept-proof` prose into a new decision frame, renaming
`git-publication-native` for non-publication journeys, and pending host-matrix
work — those stay product advice or separate follow-up unless they fall out of
the shared-harness edit with no scope growth.

## Existing solutions

Reuse `tests/git-publication-native.sh`,
`tests/support/git-publication-native-host.sh`,
`tests/support/git-publication-native-evidence.sh`, and the four case
observe/assess/scenario modules. Prefer extracting shared run/fixture helpers
beside those modules over inventing a parallel runner. Guidance owners in
`wrap-up.md#accept-proof`, `delegation.md`, and `executable-proof.md` stay as
plan 085 left them unless a one-line evidence-hash or source path must follow
the harness move.

## Ordered slices

### 1. One shared delivery-evidence native run/fixture seam
Type: Structure
Status: planned

Proof: `bash tests/git-publication-native.sh` still PASSes all four
delivery-evidence assessor counterexample suites; each
`--case delivery-evidence/{selection,claims,consumers,gaps}` still resolves
before fixture setup (unknown-case rejection unchanged); no second runner
directory appears.

Extract the duplicated control flow from the four `*-native-run.sh` (and
shared fixture scaffolding where it is rename-only) into one authoritative
helper or parameterized run module. Leave case-specific
observe/assess/scenario-content and assessor entrypoints as the distinct
bodies. Update `tests/git-publication-native.sh` and host/evidence wiring to
the shared seam without changing case names or credential-free coverage.
Safe stop: four clones are gone; external acceptance behavior is unchanged.

## Sizing, stopping points, and remaining concerns

One Structure slice; no numeric slice budget. Main risk is over-abstracting
observe/assess differences — keep those case-local. No remaining
slice-specific concern identified in this planning pass beyond that sizing
guardrail.

Execution requires separate authorization. Planning alone performs no
harness edit, commit, push, or backlog change. Wrap-up of plan 085 owns
whether to queue this correction.
