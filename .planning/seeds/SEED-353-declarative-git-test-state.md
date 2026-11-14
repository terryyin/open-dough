---
id: SEED-353
status: active
planted: 2026-11-14
planted_during: Terry reviewed Git setup in the file-diff follow-up admission test
trigger_when: selected from the product backlog
scope: story
---

# SEED-353 — Declarative Git test state

<a id="declare-git-test-state-through-makeme"></a>

### Declare Git test state through MakeMe

**Identity:** SEED-353#declare-git-test-state-through-makeme

```json dough-story-state
{ "schemaVersion": 1, "refinement": "not-refined", "approach": "unselected" }
```

**For / why.** A developer reading or changing a dashboard test should see the
repository facts and relationships that explain its behavior. Routine file
writes, commits, pushes, checkout configuration and incidental identifiers
currently obscure those facts and repeat defaults. Express construction through
MakeMe and defer Git work to the owning fixture when the state is needed.

#### Evaluation and starting evidence

Terry identified the setup in
[`agent-launch-follow-up-file-admission.spec.ts`](../../dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts):
read `HEAD` as a base, write `delivered.txt`, commit, push, read the new `HEAD`,
generate a random reporting reference, and repeat that reference in a launch,
landing and file context. Only the two-line file, comparison and related launch
matter to the admission example.

Assessment at `de290b98d80a70253eced530de41048c602c3164` supports the renovation:

- The shared [`makeMe.aRepository`](../../Distribution/tests/support/repositoryTestData.mjs)
  already describes named revisions, files, parent order, authors, trunk and an
  unpublished workspace. Its builder performs no Git work. The
  [materializer](../../Distribution/tests/support/repository-fixture.mjs) supplies
  Git defaults, publishes history, returns named commit IDs, reuses templates
  and gives each caller its own mutable copy.
- [`originRepository`](../../dashboard/tests/support/preparationPage.ts) already
  accepts a description. Its [start-origin harness](../../dashboard/tests/support/startOrigin.ts)
  supplies installation and machine setup, but does not expose named revision
  IDs to cases. Extend the existing construction boundary where needed.
- Backend and E2E specs share
  [`storyReviewWorktree.ts`](../../dashboard/tests/support/storyReviewWorktree.ts),
  [`storyReviewTrunkCommits.ts`](../../dashboard/tests/support/storyReviewTrunkCommits.ts)
  and completed-story setup. E2E has the same construction issue; for example,
  [`story-review-commit-trunk.spec.ts`](../../e2e/review/story-review-commit-trunk.spec.ts)
  writes and commits extra history to arrange its comparison.
- A static scan found calls named `git`, `commitAll`, `commitAllAs` or `writeAt`
  in 45 backend, 44 E2E and 10 integrated UI spec files. Imports of `randomUUID`
  occur in 11, 2 and 1 files respectively. These are discovery candidates,
  including actions and observations; indirect helpers and differently named
  operations need inspection too. The frontend specs had none of these matches.
- A disposable real-Git probe declared `base` and `delivered` revisions with
  `delivered.txt` containing `line one\nline two\n`. It verified deferred
  materialization, the named parent and tip, publication to a bare origin, the
  exact two-line addition, reuse of the same revision IDs, isolation of copies,
  and cleanup. Existing landing-context defaults also supplied a valid UUID
  without importing `randomUUID`. The probe still passed that reference into
  the launch and landing explicitly; automatic propagation through builder
  relationships remains required implementation work in this story.
- All nine existing tests in `repository-description.test.mjs`,
  `repository-fixture.test.mjs`, `repository-graph.test.mjs` and
  `repository-snapshot-isolation.test.mjs` passed with `node --test`. These
  files are under `Distribution/tests/support/`.

This validates feasibility, not a completed migration or a measured suite speedup.

#### Scope and boundaries

- Renovate Git arrangement throughout `dashboard/backend-tests/`, `e2e/` and
  affected `dashboard/tests/` specs and their supporting helpers in this one
  story. Audit direct commands and indirect setup, rather than treating the
  scan above as the complete scope. Reuse the one shared MakeMe entry point and
  existing repository, launch and landing builders.
- Declare the state a test needs, including relevant history, files, refs and
  workspace state. Keep file creation, Git execution, installation, environment
  and resource cleanup with their harness owners. Avoid a builder that merely
  renames an imperative write/add/commit/push sequence.
- Defer materialization until the fixture needs the requested state. Preserve
  existing prepared-prefix and template reuse and independent mutable copies.
  Use named materialization results for base/tip/workspace facts so cases need
  no incidental `rev-parse` calls or configuration defaults.
- Builders own incidental identifiers and derive consistent relationships.
  Prefer deterministic defaults where isolation allows; generate uniqueness
  internally only where required. Specs do not import `randomUUID` to arrange
  defaults. Related construction steps associate a landing and file context
  with their launch through builder relationships; the builders allocate and
  reuse that launch's reference internally. A spec does not create, extract or
  pass an incidental UUID between those steps merely to keep their references
  equal. Moving UUID generation into a helper while leaving that manual wiring
  in the spec does not complete the improvement. When identity differences or
  malformed IDs are under proof, state those relationships or literal values
  explicitly. Preserve real reporting contexts returned by actual launches.
- Keep the action being tested and independent Git observations outside
  construction. Publication after a first observation, competing writers,
  failed pushes, ref movement and destructive operations remain visible when
  their transition is the behavior under proof. Declarative setup must preserve
  meaningful authorship, topology, staging, dirty state and exact file bytes.
- Reconcile the repository-specific [test data architecture](../../Distribution/tests/test-data-architecture.md)
  guide with the resulting construction boundary. It currently leaves several
  workspace operations in cases. Continue to honor the selected MakeMe and
  browser page-object conventions. Preserve the distinction between published
  facts and machine-local evidence required by
  [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
  and direct domain mapping in
  [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution).

#### Evaluable outcome

The file-follow-up admission case and representative backend and E2E history
cases express their distinguishing facts through MakeMe, with incidental Git
setup and random UUID imports removed. In the file-follow-up admission example,
the launch, landing and file context refer to the same launch without a local
reference variable or explicit UUID passing between construction steps. Their
original admission, comparison, publication and refusal assertions still prove
the same behavior independently.
Complete the same migration across the scoped suites and shared setup, leaving
only justified actions and observations at case level; remove superseded helpers.

Keep the result when cases are easier to read and maintain without replacing
duplication with comparable builder complexity, weakening proof or isolation, or
adding eager preparation. Compare representative cases before and after; claim
runtime savings only if measured, following
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md). Run the
affected suite gates under the project's
[failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests).
This item queues the renovation; implementation planning and execution remain
future work.
