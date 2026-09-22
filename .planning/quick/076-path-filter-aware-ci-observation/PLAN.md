# Skip path-only CI without hiding the applicable verdict

Status: planned; not taken; no execution authorized by this plan.

## Source and outcome

Identity: `SEED-008#path-filter-aware-ci-observation`

Source: [selected story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#path-filter-aware-ci-observation).
Terry accepted the recommendation on 2026-09-22 and asked to update refinement,
write a slice plan, and refine that plan if needed. That request authorized
preparation and planning, not implementation. Terry subsequently queued this
story first and authorized publication of the retained planning records; the
story remains not taken and implementation remains unauthorized.

Outcome: GitHub Actions creates no CI run for a push or pull request whose
changed paths are all under `.planning/**` or `docs/**`. The default GitHub CI
observer records such a registered revision as `not_required`, keeps the last
applicable CI attempt and verdict authoritative, and emits no ordinary event to
an AI host. A prior failure therefore remains actionable instead of being
replaced by a synthetic green or an ambiguous missing run.

## Scope and current decisions

Required behavior, from the refined story's key examples:

1. A successful code revision followed by an ignored-only revision produces no
   workflow run for the latter, no observer event, and no unproved terminal row;
   its record says `not_required` and identifies the successful applicable run.
2. A failed code revision followed by an ignored-only revision retains and
   delivers the applicable failure exactly once. The ignored-only revision is
   never represented as success and does not acknowledge earlier evidence.
3. A pending applicable run remains the attempt being observed through later
   ignored-only revisions. Its eventual verdict applies without a missing-run
   advisory for those revisions.
4. Any non-ignored changed path, unsupported workflow policy, missing comparison
   basis, non-ancestor basis, or otherwise inconclusive classification fails
   closed and continues to require an exact run.
5. An exact attempt for the registered SHA always wins over path-based reuse,
   including when it appears after classification began.

Current decisions constraining the slices:

- Add literal `paths-ignore` entries for `.planning/**` and `docs/**` to both
  `push` and `pull_request` in `.github/workflows/ci.yml`; preserve
  `workflow_dispatch`. GitHub documents that an all-ignored change creates no
  workflow run. This repository currently has neither branch protection nor a
  ruleset, so no required check is blocked today.
- The workflow file at the registered revision is the policy source. The
  observer supports the narrow literal-list form used here and fails closed for
  aliases, expressions, generated policy, unreadable content, or unsupported
  structure. Do not add a general YAML engine to the dependency-free installed
  runtime or a second project-specific ignore list.
- Separate applicability from verdict. `not_required` records why the current
  revision has no exact attempt and points to the applicable earlier attempt;
  its success, pending, failure, or incomplete verdict remains separately
  inspectable. No `not_required` event is published.
- Prefer an exact matching attempt before evaluating path policy. Otherwise use
  the nearest discovered attempt whose SHA is an ancestor and compare its tree
  to the registered SHA. Treat deletions and renames conservatively so moving or
  deleting a non-ignored path cannot look like an ignored-only edit. If no such
  basis is proved, leave the revision undiscovered.
- Coverage selection must expose the applicable attempt to failure inspection;
  filtering failures only to exact registered SHAs is insufficient. Preserve
  attempt/run identities and existing deduplication so the source failure is
  delivered once even when several ignored-only revisions inherit it.
- A terminal applicable success or failure makes the ignored-only revision
  terminal. Pending and incomplete retain their existing meanings for shutdown;
  missing evidence remains unproved. The discovery-delay advisory considers
  only revisions still awaiting required evidence, never a proved
  `not_required` revision.
- This story changes runtime source under `src/skills/`, the repository workflow,
  focused tests, and affected source guidance. Do not edit installed managed
  copies under `.agents/skills/` or `.claude/skills/`; release/update owns them.

Excluded: automatic observer arming, publication detection, removal of
`register-push`, self-ending observation, custom CI adapter protocol changes,
branch-protection design, required-check sentinels, arbitrary GitHub Actions
condition evaluation, release/version work, and live changes in other
repositories. Those exclusions do not prevent necessary alignment of the
existing GitHub acquisition, coverage, failure, mailbox, and terminal-report
seams.

## Existing solutions and architecture

PFE inspection at `6872894` found one coherent path to extend:

| Responsibility | Existing owner and decision |
| --- | --- |
| Registered-revision applicability and terminal state | `ci-mailbox-revision-coverage.mjs` and `ci-mailbox-store.mjs`. Change these owners to represent `not_required` and its effective proof; do not add another ledger. |
| GitHub attempt discovery and identity | `ci-runs.mjs`. Reuse its configured workflow, branch, event, SHA, run, and attempt identities, broadening only the bounded history needed to find an applicable ancestor. |
| Failure classification and deduplication | `ci-failures.mjs` plus `watch-ci-execution.mjs`. Reuse their attempt/job evidence and owner delivery; let coverage selection identify applicable ancestor runs before failure inspection. |
| Published revision registration | `ci-mailbox.mjs register-push` and the publication guidance. Preserve the command and receipt; add only evidence the observer cannot safely derive. Do not absorb the later script-driven-observation story. |
| Project path policy | `.github/workflows/ci.yml`. Read its narrow literal `push.paths-ignore` form at the registered revision so the observer does not own a duplicate list. |
| Host delivery | `ci-host-hook.mjs` and the Codex stream. Reuse unchanged: absence of a mailbox event is the no-token contract. |
| Non-GitHub providers | `ci-command-adapter.mjs`. Leave unchanged; it translates provider attempts and does not own GitHub workflow applicability. |

The common rule is: a published revision has one coverage record; an exact
attempt proves it directly, while a proved no-CI-required revision reuses the
nearest applicable ancestor attempt without changing that attempt's verdict.
Unsupported evidence never becomes an exemption or success.

This follows [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md): keep one representation
of the coverage fact, retain fast feedback, and reduce repeated agent judgment.
It follows [ADR 0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md): missing validation stays pending and deterministic
runner/adapter logic is tested at its owned boundary. It also follows the
[North Star's CI coverage ownership](../../NORTH-STAR.md#remote-publication-and-default-checkout-ownership),
which assigns observation of a published revision on a target to the existing
observer. ADRs 0007–0009 remain Proposed and supply no binding exception. No
Accepted ADR conflict or metadata mismatch was found.

## Verification and delivery gates

All commands here are future execution checks, not results of this planning turn.
Use real temporary Git repositories and the worker's existing fake-`gh` seam;
do not inject the expected coverage record or event.

- Focused coverage and failure journeys:
  `node --test src/skills/dough-execute-plan/scripts/ci-path-applicability.test.mjs src/skills/dough-execute-plan/scripts/ci-revision-coverage-late-github-failure.test.mjs`
  (the first file is new; naming may be adjusted to an existing focused fixture
  if execution finds one clearer owner).
- Mailbox terminal behavior:
  `node --test src/skills/dough-execute-plan/scripts/ci-revision-coverage-stop-states.test.mjs src/skills/dough-execute-plan/scripts/ci-mailbox.test.mjs`.
- Integrated observer runtime: `bash tests/execution-ci-runtime.sh`.
- Repository workflow/policy check: exercise the same narrow policy reader
  against `.github/workflows/ci.yml`; assert the push and pull-request filters
  contain the accepted paths and manual dispatch remains. GitHub trigger
  semantics rely on its documented platform contract; do not create a remote
  test repository or a dummy green workflow.
- Before any future commit: run the required post-change refactor, then
  `npm run lint`, `npm test`, and `git diff --check` when affected by the final
  change. Apply AGENTS.md's representative skill behavior review to changed
  guidance. CI remains the broad dashboard/browser proof when the implementation
  changes non-ignored runtime files.
- ADR 0005: this changes shared deterministic runtime behavior, not a host
  activation mechanism. Reuse existing Codex/Cursor/Claude delivery evidence
  for the unchanged no-event bridge; the integrated mailbox test must prove no
  record is emitted. Missing invalidated native evidence remains pending rather
  than being called passed.

## Ordered slices

### 1. Resolve CI applicability from the workflow and Git history
Type: Structure
Status: done
Proof: Focused pure tests read the accepted literal workflow form from a real
temporary repository at a named revision and classify descendant tree changes:
only `.planning/**`/`docs/**` is reusable; a mixed path, non-ancestor, deletion
or rename involving a non-ignored path, unsupported YAML form, or unreadable
revision is indeterminate. Existing observer tests remain green because the
classifier is not yet wired into coverage.

Accepted: `node --test src/skills/dough-execute-plan/scripts/ci-path-applicability.test.mjs src/skills/dough-execute-plan/scripts/ci-path-applicability-indeterminate.test.mjs src/skills/dough-execute-plan/scripts/ci-workflow-path-policy.test.mjs src/skills/dough-execute-plan/scripts/ci-revision-coverage-late-github-failure.test.mjs` passed 15/15 against real temporary Git repositories (no mocked Git, no injected coverage records). `ci-workflow-path-policy.mjs` (`readCiPathIgnorePolicy`) reads the narrow literal `paths-ignore` form and fails closed for aliases, expressions, extra keys, unsupported globs, and a missing `on:` block, verified directly against this repository's own `.github/workflows/ci.yml`. `ci-path-applicability.mjs` (`classifyRevisionApplicability`, `readWorkflowContentAtRevision`) resolves `required` (no filter, or a clean non-ignored diff), `not_required` with `{ basis: { sha } }` (ignored-only descendant of a proved ancestor), or `indeterminate` (mixed paths, non-ancestor basis, non-ignored delete/rename even alone, unsupported policy, unreadable revision, or no candidate SHAs) — deletions/renames touching any non-ignored path never count as ignored-only. `.github/workflows/ci.yml`'s `push`/`pull_request` triggers now carry `paths-ignore: ['.planning/**', 'docs/**']`; `workflow_dispatch` is unchanged. The existing late-GitHub-failure observer journey (`ci-revision-coverage-late-github-failure.test.mjs`) remains green, confirming the classifier is not yet wired into coverage.

Learning: the plan's "a mixed path ... is indeterminate" line left the required/indeterminate boundary underspecified for a diff containing both ignored and non-ignored changes. Slice 1 resolved it as: a clean, unambiguous non-ignored diff (or an event with no `paths-ignore` filter at all) is `required`; anything mixed relative to the chosen ancestor is `indeterminate` rather than an assumed `required`, since the comparison basis may span more than the registered revision's own change. Both `required` and `indeterminate` currently behave identically downstream (neither yields a `not_required` basis), so this is not yet behavior-critical, but slice 4's terminal-reporting language may want to distinguish them — worth a sanity check before slice 4 if guidance text starts naming `required` specifically. `classifyRevisionApplicability` expects its caller to supply already-discovered `candidateShas` (e.g. from `ci-runs.mjs` discovery) and does its own ancestor-filtering/nearest-selection internally; it does not call `gh` itself — slice 2's coverage wiring needs to supply that list.

Structure: Add the narrow dependency-free workflow-policy reader and conservative
Git comparison beside the existing GitHub acquisition/coverage path. Configure
this repository's `push` and `pull_request` filters in the same slice and prove
the reader sees the accepted policy. The result is `required`, `not_required`
with a proved applicable ancestor, or `indeterminate`; it does not publish events
or mutate coverage. This immediately enables slice 2.

### 2. An ignored-only revision is explicitly not required and stays quiet
Type: Behavior
Status: planned
Proof: A real temporary repository contains the accepted workflow filter and a
successful GitHub attempt for revision A. Register ignored-only descendant B;
drive the real worker through its fake-`gh` seam and assert B records
`not_required` with A's attempt as basis, the mailbox event log stays empty
across repeated polls, and shutdown does not list B as unproved. A mixed or
indeterminate descendant stays undiscovered, and a late exact B attempt replaces
reuse with its own verdict.

Behavior: configured workflow plus an applicable successful ancestor → register
an ignored-only descendant → no current run is expected, no discovery advisory
or host event is created, and the coverage ledger records the explicit reusable
basis. Exact attempts take precedence; inconclusive classification fails closed.

### 3. An ignored-only revision cannot hide an applicable failure
Type: Behavior
Status: planned
Proof: Extend the late-GitHub-failure worker journey with failed revision A and
ignored-only registered descendants B and C. Assert one `CI_FAILURE` for A reaches
the owning coordinator, B and C identify A as their applicable basis without
success, unrelated-owner evidence stays isolated, and later polls or registration
do not duplicate or acknowledge the failure. Repeat the path with A pending and
then failing to prove the worker follows the applicable attempt rather than
waiting for nonexistent descendant runs.

Behavior: registered ignored-only descendants of a pending or failed applicable
revision → observe attempts and failures → the ancestor attempt remains actionable
for those descendants and its eventual failure is delivered exactly once. Align
coverage selection with failure acquisition while preserving opaque identities,
job-level evidence, and existing ownership isolation.

### 4. Shutdown and guidance report applicability without inventing a verdict
Type: Behavior
Status: planned
Proof: Mailbox stop tests cover ignored-only revisions based on success, failure,
pending, and incomplete attempts: terminal output omits proved terminal cases
from `unproved`, retains pending/incomplete evidence with the applicable source,
and contains no discovery event. A representative guidance walkthrough can
distinguish `not_required` from success and handles only a delivered applicable
failure; custom-adapter tests remain unchanged and green.

Behavior: observation ends after path-filter-aware coverage → terminal report
and executing-agent guidance → readers see why no run exists and the effective
attempt's real state, without a skipped-run success, missing-run warning, or new
agent action. Update only default-GitHub semantics and keep the later observer
lifecycle stories' commands and responsibilities intact.

## Proof ownership

| Final promise | Owning slice |
| --- | --- |
| GitHub trigger ignores only `.planning/**` and `docs/**` while preserving manual dispatch | 1 |
| One narrow, fail-closed workflow/Git applicability interpretation | 1 |
| Explicit quiet `not_required` and exact-run precedence | 2 |
| Previous pending/failure remains applicable and failure is delivered once | 3 |
| Terminal reporting and guidance do not translate no-run into success or agent attention | 4 |
| Custom CI and later observer-lifecycle stories remain outside the change | 4 |

## Current decisions and remaining concerns

- No new North Star topic is warranted: the existing CI-coverage ownership row
  already selects the observer, and the accepted PFE result changes its existing
  ledger/acquisition path.
- The narrow workflow reader and conservative Git comparison are deliberate.
  Execution may modularize them beside `ci-runs.mjs` or revision coverage, but
  must not introduce a general GitHub Actions interpreter or dependency-bearing
  installed runtime.
- Slice-plan refinement split the initial combined policy/coverage slice because
  its YAML/Git interpretation and mailbox integration were separable beats with
  different proof boundaries. The resulting four slices each have one proof
  loop; no slice-specific concern remains, and the failure-attribution risk owns
  its own slice rather than hiding inside basic path-policy behavior.
