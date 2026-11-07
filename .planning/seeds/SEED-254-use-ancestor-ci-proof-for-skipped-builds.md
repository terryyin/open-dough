---
id: SEED-254
status: active
planted: 2026-11-07
scope: story
---

# CI proof for skipped builds

## Story

<a id="use-ancestor-ci-proof-for-skipped-builds"></a>

### Use the nearest ancestor's CI proof for skipped builds

**Identity:** SEED-254#use-ancestor-ci-proof-for-skipped-builds

**Beneficiary:** A developer reviewing a story's CI proof in Intent.

**Goal:** Each baseline, branch, and landed CI build that was skipped can still
contribute proof from the nearest build in its own published history that has
usable proof, with the source visible to the reviewer.

**Scope:**

- Distinguish a confirmed skip from a genuinely cancelled run. Confirm skips
  using the CI provider's explicit conclusion or evidence that the applicable
  CI rule excluded the change, such as no changes or a docs-only change ignored
  by the workflow. A missing run or proof artifact alone leaves the reason
  unknown. If the provider or available history cannot resolve the distinction,
  explain the gap and report which cases could not be distinguished.
- For a confirmed skip, find the nearest ancestor build on the comparison
  endpoint's published lineage that has readable proof for the configured CI.
  Continue past ancestors that were skipped, had no build, or lack usable
  proof. Apply the same rule to baseline, branch, and landed, including a
  skipped landing where Intent currently requires an exact build.
- Show **Skipped** at the requested revision and use the ancestor's proof data
  in the comparison. Identify the source revision, run, and attempt separately
  from the requested revision and its status. If no ancestor proof can be
  established, show why it is unavailable. Preserve a genuine cancellation as
  a cancellation and keep actual proof at the requested revision authoritative
  when it exists.

**Examples:**

- A docs-only landing is confirmed skipped. Its parent has a completed build
  but no proof artifact, and the grandparent has readable proof. The landed
  comparison shows the landing as skipped and uses the grandparent's proof,
  labelled with the grandparent's build identity. Baseline and branch skips
  follow the same rule on their respective lineages.
- A superseded run is explicitly cancelled. A skipped revision with the same
  absence of proof is still distinguishable by its skip evidence. If a revision
  has neither a run nor enough evidence to establish why, Intent explains that
  uncertainty.

Open Dough ignores changes under `.planning/` and `docs/` for automatic runs
and can also cancel superseded runs. [CI workflow](../../.github/workflows/ci.yml)

GitHub Actions exposes separate `skipped` and `cancelled` conclusions, while a
path-filtered workflow can leave checks pending.
[Workflow run API](https://docs.github.com/en/rest/actions/workflow-runs#list-workflow-runs-for-a-workflow),
[skipped workflow runs](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/skip-workflow-runs).

Preserving the requested revision and the observed proof source follows
[ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
