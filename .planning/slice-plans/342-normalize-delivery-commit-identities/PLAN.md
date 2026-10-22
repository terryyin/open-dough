# Normalize commit identities before delivery comparisons

**Identity:** SEED-008#normalize-delivery-commit-identities
**Source:** [Selected story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#normalize-delivery-commit-identities)

## Goal and scope

Let a developer or agent who runs managed delivery with a full or a uniquely
abbreviated published-base commit ID get the same publication decision,
receipt, retained comparison, and recovery facts, and get a refusal that names
the problem and the next step when the input names no commit, more than one
object, a non-commit object, or a ref name. This is the bounded ODF-142
response Terry selected on 2026-10-22.

Included: resolution of the supplied base to one full commit ID at the live
publication boundary every managed publication passes (deliver, fresh,
wrap-up closure, and Dough Land's use of the shared API); the use of that ID in
every comparison, classification, retained landing comparison, `beforePush`
comparison, stop field, and receipt; one new refusal before containment for
unresolvable input; discriminating regressions through the maintained delivery
path with the existing local Git fixtures; and the usage and reference lines
that describe the argument and the new stop.

Excluded, as the story defers: abbreviated input anywhere other than the live
delivery base (resume's `--suffix-base`, `--validated-candidate`, and the
retained-comparison contract keep requiring full immutable IDs); any new
workflow, observer, or lint; guidance beyond the lines naming the argument and
stop; the ODF-142 record update and field measurement, which follow delivery
under the story's Evaluation.

Assumptions: the owned workspace holds the previously published base after the
fetch, as every current caller already assumes; Git's abbreviation rules decide
uniqueness, so the refusal names a prefix that became ambiguous.

## Existing solutions and architectural direction

PFE across the publication scripts found the pieces this story composes:

- Resolution: `revParse` in `publication-git.mjs` is the shared Git
  resolution, and `headMerges` in `history-preserving-candidate.mjs` already
  resolves `<ref>^{commit}` before comparing commit parents. That
  resolve-before-compare pattern moves into the live publication's entry; a
  small helper beside `revParse` answers the full ID or the problem.
- Immutable-ID contract: `validateRetainedComparison` in
  `publication-comparison.mjs` is the hex-and-commit-type check for retained
  pairs. It stays as it is; live canonicalization makes every pair it later
  validates satisfy it.
- Stops: `stopped(status, fields)` in `applicable-candidate-proof.mjs` is the
  shape of every publication stop, and `deliverManagedExecutionIncrement`
  passes `status`, `error`, `previouslyPublishedBase`, and the other fields to
  the CLI result generically, as the `unpublished-base` and
  `transport-timeout` stops already use. The refusal is one more status
  through that shape, not a new result type.
- Callers: `execution-increment-delivery.mjs` (deliver, CLI and API),
  `execution-increment-fresh.mjs`, `trunk-closure-settlement.mjs`, and Dough
  Land's API use all reach `publishExecutionIncrement`, so one resolution
  there behaves the same for every caller. `managedIncrementRequestRefusal`
  in `execution-increment-request.mjs` keeps its presence check: it runs
  before the fetch and has no resolved workspace to ask.
- Resume: `execution-increment-resume.mjs` and `publication-resume.mjs`
  consume retained full IDs; out of scope and unchanged.

Decision: change the existing solution at `publishExecutionIncrement` rather
than add a module or a second comparison form.

Accepted ADRs: [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
asks mechanisms to justify their burden; this adds one local `rev-parse` per
delivery. [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
keeps the proof deterministic in local Git fixtures; no native acceptance is
claimed. [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
keeps the guidance lines written for the executing agent. No
[North Star](../../NORTH-STAR.md) topic governs this change and none is added.

## Preparation observations and decisive premises

Observed on 2026-10-22 in the established preparation workspace
`/Users/terryyin/git/open-dough/.worktrees/normalize-commit-identities-before-delivery-comp`
at `f6e19749`, with a scratch `node --test` file importing the real
`publishExecutionIncrement` and `createCleanTrunkFixture` (temporary bare
origin, integration checkout, execution worktree with one unpublished commit),
and a scratch repository for Git's own answers (git version 2.50.1 (Apple Git-155)). The scratch
files and repositories were removed; no production remote was touched.

| Premise and consuming operation | Literal observation | Result and limit |
| --- | --- | --- |
| The symptom reproduces: a unique abbreviated base on an existing target with no remote advance reaches the no-op-rebase guard. | `publishExecutionIncrement({ previouslyPublishedBase: trunkSha.slice(0, 10), targetRef: "refs/heads/main" })` | Rejected with `rebase left the pre-rebase SHA as the candidate`; origin unchanged. Settled; this is slice 1's discriminating failure today. |
| The full ID on the same fixture is accepted without reconciliation. | Same call with `trunkSha` | `ok: true`, `reconciliations: 0`, `suffixBase === trunkSha`. Settled. |
| Paths that do not reach the comparison still carry the raw input into facts. | Abbreviated base on `refs/heads/exec/story` (no remote tip); abbreviated base after pushing the candidate to main | Both `accepted`; `suffixBase` is the ten-character string in each. Settled; slice 1 example 3 and 4 proof fails today on that field. |
| An abbreviation of the candidate itself classifies differently from the full ID. | Base = candidate (abbreviated, then full) with the candidate already on main | Abbreviated: `classification: "already-published"`; full: accepted without classification. Settled; slice 1 example 4's empty-suffix case fails today. |
| Unknown, non-commit, and ambiguous input currently stop as `unpublished-base`. | `"not-a-commit"`, the blob ID of `increment.txt`, and a four-character prefix shared by two of 1,500 blobs written with one `git hash-object -w` call | Each: `publication: "stopped"`, `status: "unpublished-base"`, `previouslyPublishedBase` echoing the raw input. Settled; slice 2's tests fail today on status. |
| Git distinguishes the problems the refusal must name. | `git rev-parse --verify --quiet <input>^{commit}` for a full ID, a ten-character prefix, a blob ID, an ambiguous prefix, `not-a-commit`, and `HEAD` | Full and prefix: exit 0 and the full ID. Blob: exit 1, `expected commit type, but the object dereferences to blob type`. Ambiguous: exit 1, `short object ID <prefix> is ambiguous`. Unknown: exit 1, `Not a valid object name`. `HEAD`: exit 0 with the current commit, so a ref name must be refused before asking Git. Settled on this machine's Git. |
| The publication tests run from the checkout without a dependency install. | The scratch test imported the production module and fixtures with no `node_modules` present | Ran. Execution still runs `npm ci` before `npm test` for the whole suite. |

No premise needs a paid, credentialed, or owner-held observation.

## Outside-in proof

Node tests through `publishExecutionIncrement` with `createCleanTrunkFixture`,
the maintained delivery path's Git boundary and fixtures, in a test file beside
`execution-increment-publication-reconciliation.test.mjs` in
`src/skills/dough-execute-plan/scripts/`. The `unpublished-base` consumers
(`unpublished-base-test-fixtures.mjs` and its tests) and the no-op-rebase test
stay green as the preserved-contract proof. One managed-delivery-level case
through `deliverManagedExecutionIncrement` shows the refusal's status and error
in the delivery result, reusing the fixture those gap tests use. Because the
publication path is shared runtime with distributed consumers, the final
delivery runs full `npm test` after `npm ci`, as the project's recorded
practice for shared-path changes.

| Story example | Proof and owner |
| --- | --- |
| 1: existing target unchanged, ten-character base; equal to the full-ID call | Slice 1: accepted, `reconciliations` 0, receipt and `suffixBase` full ID, `beforePush` comparison full ID; the full-ID run on an identical fixture gives the same facts. |
| 2: target advanced by another writer, abbreviated base | Slice 1: `needs-validation` with the rewritten candidate on the fetched tip and `previouslyPublishedBase` full, as the existing first reconciliation test shows for the full ID. |
| 3: new target, abbreviated base | Slice 1: accepted with full-ID `suffixBase`. |
| 4: already-published retry and empty suffix, abbreviated base | Slice 1: same classification and facts as the full ID; no commit, no push. |
| 5: unknown, ambiguous, non-commit, or ref-name input | Slice 2: the refusal before containment, nothing pushed or rewritten; status and error visible in the delivery result. |
| 6: resolved commit the remote does not hold | Slice 2: existing `unpublished-base` tests green, `previouslyPublishedBase` full. |
| 7: branch already on the advanced tip, older base | Slice 1: the existing no-op-rebase test unchanged and green. |

## Ordered slices

### 1. A full or uniquely abbreviated published base gives one canonical delivery decision
Type: Behavior
Status: done
Proof: new tests through `publishExecutionIncrement` with the clean-trunk fixture: (a) existing target unchanged, ten-character base: accepted, `reconciliations` 0, receipt, `suffixBase`, and the `beforePush` comparison carry the full base ID, and the publication facts equal a full-ID run on an identical fixture (fails today with the rebase rejection); (b) target advanced by another writer, abbreviated base: `needs-validation` with `previouslyPublishedBase` full and the candidate rewritten onto the fetched tip; (c) new target without a remote tip, abbreviated base: accepted with full-ID `suffixBase` (fails today); (d) candidate already on the remote, abbreviated base, and base equal to the candidate abbreviated: same classification and facts as the full ID with no commit or push (empty suffix fails today); (e) the existing no-op-rebase and reconciliation tests stay green.

Behavior: the fetch has settled and the caller supplied a hex object ID → the publication resolves it in the owned workspace to its full commit ID (`rev-parse --verify <input>^{commit}`) before containment → every later containment check, comparison, classification, reconciliation argument, retained landing comparison, `beforePush` comparison, stop field, and receipt uses that ID, so the full ID and its unique abbreviation give identical results. The first fetch's `transport-timeout` stop precedes resolution and still names the supplied input. Interim: input that does not resolve keeps today's `unpublished-base` stop until slice 2 replaces it.

Accepted proof: `execution-increment-publication-base-identity.test.mjs`
runs each scenario on identical fixtures with the full and the ten-character
base and deep-compares the result, registered receipts and `beforePush`
comparisons with commit IDs labelled; all five tests failed before the change.
`execution-increment-fresh-candidate.test.mjs` "a refused changed candidate
retains the full base ID its abbreviation names" covers fresh recovery's
`suffixBase` on a stop without one. Resolution is `resolveCommitId` in
`publication-git.mjs`. Consumer proof: every `execution-increment-*`,
`publication-*` and `trunk-closure*` test and the importers of the changed
modules and publication fixtures (118 files) through `bash scripts/test.sh`.

### 2. An unknown, ambiguous, non-commit, or ref-name base is refused with its problem and next step
Type: Behavior
Status: done
Proof: tests with the same fixture: an unknown string, a four-character prefix made ambiguous by 1,500 blobs written with one `git hash-object -w` call, the increment file's blob ID, and `HEAD` each stop with the new status, a `problem` naming not-an-object-id, unknown, ambiguous, or not-a-commit, the supplied input, and an `error` that tells the agent to supply the full ID from the delivery receipt; the branch, origin, and remote-tracking refs are unchanged and no push was issued (fail today with `unpublished-base`); the existing `unpublished-base` consumers stay green and report the full ID; one managed-delivery case shows the status and error in the delivery result. Guidance: the `deliver` usage line in `execution-increment-request.mjs` and the trunk-publication passage that explains `unpublished-base` name the argument as a full or unique abbreviated commit ID and the new stop beside it.

Behavior: the supplied base is not a hex object ID, or Git answers unknown, ambiguous, or non-commit for it → the publication stops after the fetch and before containment, rewrite, push, or observation registration with the refusal → the agent reruns with the full ID from the receipt. `unpublished-base` is then reached only by a resolved commit that no fetched remote ref holds.

Accepted proof: `execution-increment-publication-unresolvable-base.test.mjs`
covers `not-a-commit` and `HEAD` (`not-an-object-id`), an unknown hex ID,
a four-character prefix shared by blobs (`ambiguous`), a blob and a tree ID
(`not-a-commit`): each stops as `unresolvable-base` naming the supplied
input with no `register`, `validate`, `beforePush` or `onFetchedTarget`
call and unchanged branch, remote and remote-tracking refs; one case through
`deliverManagedExecutionIncrement` shows status, problem, input and error in
the delivery result. All seven failed before the change. `fullCommitId`
lists matches with `rev-parse --disambiguate` and accepts one commit, so a
prefix that a commit shares with any other object is `ambiguous`. The
existing `unpublished-base` tests stay green with full IDs. Final delivery ran
full `npm test`.

## Execution complete

Product advice: no change. The story's Evaluation remains: update ODF-142's
finding record with the response revisions (1443f1f2, bbce29a4), the proof
above, release state once released, and the remaining limits (story
obligations G2 and G3; resume's `--suffix-base` still requires full IDs), and
keep it unresolved until the next ordinary eligible use records input form,
decision, failed calls, recovery effort, and any false refusal.

## Current decisions

- Resolve at `publishExecutionIncrement` after the fetch and before
  containment, so one change covers deliver, fresh, wrap-up closure, and
  Dough Land; request parsing keeps its presence check.
- Only a hexadecimal object ID, full or abbreviated, is a published base. A
  ref name is refused rather than resolved, because `HEAD` resolves to the
  candidate and a branch to today's tip, which the story forbids substituting.
- Result and recovery facts carry the canonical ID; the refusal is the one
  result that names the supplied input, as the thing to correct.
- The refusal is one `stopped` status with a `problem` field; execution may
  pick its spelling to match the existing stop vocabulary, keeping the four
  problems distinguishable.
- Resume contracts and `validateRetainedComparison` stay unchanged.

## Story obligations

### G1. Unresolvable input still stops as unpublished-base
Reported: slice 1 — "input that is not hex or names no single commit is left as supplied. It reaches today's `unpublished-base` stop"
Story clause: "Input that names no object, more than one object, or a non-commit object is refused before any rewrite, push, or observation"
Disposition: proved by slice 2: `execution-increment-publication-unresolvable-base.test.mjs` refusal cases and the managed-delivery case

### G2. A delivery that throws before resolution keeps the supplied base in recovery
Reported: slice 1 — "If delivery throws before the first fetch settles, recovery keeps the base as the caller supplied it, because nothing has been resolved yet."
Story clause: "resolve the supplied published-base input to exactly one commit in the owned workspace after the fetch"
Disposition: no user cost "never produces a misleading reconciliation refusal, an unobserved plain push, or a source-reading detour": a throw before the fetch settles rewrites and pushes nothing, so rerunning the same delivery resolves the input after its fetch; resume's `validateRetainedComparison` refuses a non-full `--suffix-base` rather than comparing it.

### G3. A live coordinator's observer is still established before an unresolvable-base refusal
Reported: slice 2 — "With a live session, observation is still established before publication, as it already is for `unpublished-base`; only `registerPushedRevision` is skipped."
Story clause: "is refused before any rewrite, push, or observation"
Disposition: no user cost "never produces a misleading reconciliation refusal, an unobserved plain push, or a source-reading detour": managed delivery establishes or reuses the coordinator's one observer of the target before any publication, and the refusal registers no revision on it, so no revision is observed; the next delivery reuses that observer.

## Concern evidence

Slice-plan refinement was not needed: each slice has one outcome and one
proof loop, and slice 1's interim handling of unresolvable input is named with
slice 2 as its replacement. No remaining slice-specific concern was
identified.
