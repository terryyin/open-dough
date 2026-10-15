# Prove coalesced CI validation in Donut's actual workflow

**Identity:** SEED-008#donut-coalesced-ci-adoption
**Source:** [selected story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#donut-coalesced-ci-adoption)

## Goal and scope

Prove, in Donut's actual `ci.yml` on disposable proof refs in
`nerds-odd-e/doughnut`, that a workflow/ref concurrency group with active runs
retained lets active and latest work run while a waiting snapshot is replaced,
and that Donut's installed Open Dough 0.3.63 completes the replaced revision
truthfully from the later validated snapshot through execution in Story Branch
Mode and Trunk Mode and through a wrap-up closure gate. Deliver the reproducible
Donut change on an unpushed branch and judged real-provider evidence for the
separately authorized rollout.

Included: the Donut change with its own test; a real burst where B is replaced
while A runs and C validates; later arrivals that leave C untouched; docs-only
pushes against real provider facts, including one whose basis run was replaced;
another writer's C proved by the observer's own fetch; completion without the
declaration staying exact; release-admission and artifact inspection at the
replaced and validated runs; a covered-run count for the observed burst.

Excluded: adoption on Donut `main`, a production rate, deliberately failed or
rerun Donut runs, changes to Donut's release admission or deployment, a tag or
deployment, Pygardon work, native host acceptance, and release-version work.
Planning grants no implementation, Donut publication, or paid run authority;
execution establishes Terry's authority for each paid slice.

Assumptions: Donut's installed Open Dough stays at 0.3.63 during execution;
`vars.RUNNER` and Donut's repository secrets are available to runs on proof
refs as they are to any branch push; a full `ci.yml` run takes about 6–8
minutes as on recent `main` runs.

## Design and existing solutions

PFE found suitable owners; this story adds no runtime responsibility to Open
Dough or Donut:

- **GitHub concurrency** (reuse): `concurrency.group: ${{ github.workflow }}-${{ github.ref }}`
  with `cancel-in-progress: false` retains the active run and replaces the
  single waiting run; plan 307 slice 1 observed this with an inert workflow.
  Do not reconstruct GitHub's queue or promise push-order dispatch.
- **Donut workflow shape test** (change): `scripts/ci/ci-workflow.test.mjs`
  pins `ci.on` through `workflow-fixtures.mjs`; extend it with the group so the
  change is checked by Donut's own tests. Donut's release admission
  (`scripts/ci/application-release-ci.mjs`) looks up the exact SHA's `ci.yml`
  main-push run, walks first-parent ancestors only for docs-only tags, and
  blocks on a non-success conclusion; its test suite already covers a latest
  `cancelled` run. Reuse unchanged; inspect only.
- **Installed Open Dough 0.3.63 in Donut** (reuse): `ci-integrated-state-policy.mjs`
  reads `integratedStateCompletion` from `.planning/open-dough.json`;
  `ci-integrated-state.mjs` judges a same-target descendant's current attempt
  under `check`/`context` and optional `jobs`; `ci-workflow-path-policy.mjs`
  and `ci-path-applicability.mjs` resolve docs-only revisions to their basis;
  `ci-integrated-state-ancestry.mjs` fetches a missing snapshot's objects from
  the target's remote; `execution-increment-delivery.mjs deliver` publishes in
  either mode on this coordinator's observer; `ci-mailbox.mjs complete-revision`
  is the bounded completion; `history-preserving-publication.mjs integrate` and
  `trunk-closure.mjs finish` are the wrap-up closures. Use the copies installed
  in Donut (`.claude/skills/` for a Claude Code coordinator), never a
  hand-synchronized copy.
- **Declaration** (decision): `{"check": "ci.yml", "context": "push"}` without
  `jobs`. A workflow run's `success` conclusion already requires every job and
  matrix shard; a `jobs` list would have to name exact displayed names such as
  `Frontend Unit Tests (1/2)` and would break on matrix changes.

Follow [North Star: remote history and optional local refresh](../../NORTH-STAR.md#remote-history-and-optional-local-refresh):
publication and CI evidence keep distinct owners, and the observer covers a
specific target. No new North Star topic or ADR is needed; the seed's
Architectural Context lists the Accepted ADRs. Keep Donut changes on an
unpushed Donut branch for the separately authorized rollout.

## Preparation observations and decisive premises

Observed 2026-10-16 in this preparation workspace at `452273b4`, Node from
`.node-version`. Donut was read at `7178e92d04` (`main`, "Update Open Dough
guidance to 0.3.63") and not edited.

| Premise | Consuming observation and result | Consequence / remaining owner |
| --- | --- | --- |
| Donut's installed Open Dough is the released 0.3.63 runtime | `.claude/skills/dough-update/VERSION` and `.agents/skills/dough-update/VERSION` both read `0.3.63`; `ci-integrated-state.mjs`, `ci-integrated-state-policy.mjs`, `ci-workflow-path-policy.mjs`, `ci-path-applicability.mjs`, `ci-integrated-state-ancestry.mjs`, `ci-mailbox-complete.mjs` and `execution-increment-delivery.mjs` under both installed roots differ from `v0.3.63:src/skills/dough-execute-plan/scripts/` by 0 lines. | The proof runs the installed copies; no candidate payload is needed. A runtime gap follows the seed's bounded-fix rule. |
| The `ci.yml` selector resolves on Donut | `DOUGH_CI_WORKFLOW=ci.yml node src/skills/dough-execute-plan/scripts/ci-github-diagnostic.mjs workflow nerds-odd-e/doughnut` returned `CI_WORKFLOW` id `5208694`, name `donut CI`, path `.github/workflows/ci.yml`, state `active`. | `check: "ci.yml"` is the right selector; `DOUGH_CI_WORKFLOW_NAME` may be set to `donut CI` as a consistency check. |
| Adding the concurrency block keeps Donut's path policy supported by the installed reader | `readCiPathIgnorePolicy` on Donut's current `ci.yml` and on a scratch copy with `concurrency: {group: ${{ github.workflow }}-${{ github.ref }}, cancel-in-progress: false}` inserted before `env:` both returned `{"supported":true,"events":{"push":{"pathsIgnore":[".planning/**","docs/**"]}}}`. Scratch copies lived in the job's temporary directory; Donut was untouched. | Docs-only revisions keep resolving to their basis after the change. Slice 1 reruns this on the real edited file. |
| Donut's workflow test can run in an isolated worktree | `node_modules/yaml/package.json` exists in the default Donut checkout; a worktree under `.worktrees/` resolves `yaml` upward. Presence only. | Slice 1 runs `node --test scripts/ci/ci-workflow.test.mjs` there; a resolution failure installs Donut's dependencies in the worktree first. |
| Donut's release admission blocks a replaced revision | Read `querySelectedCi`: a completed run with conclusion other than `success` throws with `ci.state: failed`, which the reconciliation reports as `blocked`; the ancestor walk runs only when the exact SHA has no run. `application-release-ci.test.mjs` has "latest cancelled cannot fall back to an older green run". Not executed. | Slice 5 observes it against the burst's real facts; the approach does not depend on it. |
| Recent Donut runs bound artifacts to their head SHA and take 6–8 minutes | `gh run list -w ci.yml -b main -L 3`: runs `38813686050`, `38693154018`, `38692227919`, each `success`, created→updated 5m57s, 6m20s, 8m11s. `actions/runs/38813686050/artifacts` lists `frontend-dist`, `donut-0.0.1-SNAPSHOT.jar`, `cli-dist`, each `workflow_run.head_sha` `7178e92d04…`. | Artifact inspection is read-only. The ten-minute completion bound fits one run, so slices 2 and 4 invoke the wait after A finishes. |
| GitHub retains the active run and replaces the single waiting run | Plan 307 slice 1 (inert workflow, `dough-probe/coalesce-20261014205557`, runs 38560123751–38560354116): A and C ran, B and D were cancelled with no jobs, E ran after C. The probe ref is gone from the remote (`git ls-remote origin 'refs/heads/dough-probe/*'` empty; only a stale local tracking ref remains in the default checkout). | Reused. Donut's actual multi-job workflow, its timing with secrets and `vars.RUNNER`, and the installed completion against it are paid and owned by early probe slice 2. |
| `deliver` and `complete-revision` accept a disposable non-main target | Usage of `execution-increment-delivery.mjs deliver` takes `--target-ref refs/heads/<branch> --repo OWNER/REPO` for both modes; the guidance admits caller-selected current-branch work with the caller's authorized target. Not executed: the first call pushes. | Slice 2's first delivery is the probe. If `deliver` refuses the target, use the shared `publishExecutionIncrement` API and `register-push` as the Pygardon proof did, and record the decision. |

## Outside-in proof ownership

| Promise / example | Owning slice and observable proof |
| --- | --- |
| Reproducible Donut change with its own test; nothing pushed to `main` | 1: Donut workflow test asserts the group; installed policy readers accept the edited file and declaration; branch stays local. |
| Example 1, coalesced burst with truthful `integrated_state` completion of B at C | 2: real run facts for A, B, C; `complete-revision` receipt for B. |
| Example 2, later arrivals do not starve feedback | 2: D replaced by E with no jobs while C finishes; E starts after C. |
| Example 3, docs-only push, including a replaced basis (carried clause on unchecked changes) | 2: T after B has no run and completes at C; T2 after C completes as not required with basis C. |
| Carried clause: observer identifies the target's remote for another writer's C | 2: C is pushed from a second worktree; the coordinator's worktree lacks C until the observer fetches; receipt shows ancestry proved without a manual fetch. |
| Example 6, no declaration keeps exact completion | 2: a worktree without the declaration waits on B and ends unresolved. |
| Example 4, wrap-up closure gate on real evidence | 3: Story Branch integration onto the proof trunk, completion at N, retirement only after the gate. |
| Example 4, Trunk Mode completion of a replaced revision | 4: `deliver --mode trunk` burst A′, B′, C′; B′ completes `integrated_state` at C′. |
| Example 5, release admission stays exact; artifacts belong to their run | 5: artifact listings for B and C runs; Donut's admission query against the real B facts reports blocked. |
| Covered-run count for the observed burst, no production percentage | 5: table of pushes, runs, attempts, conclusions, jobs started; count stated per burst. |
| Proof refs removed; runs kept as evidence; no tag, deployment or `main` push | 5: `git ls-remote` for the proof prefix is empty; no `v*` tag created; deploy workflow has no new run. |

## Ordered slices

### 1. Reproducible Donut change on an unpushed branch
Type: Behavior
Status: done
Proof: In an isolated Donut worktree on branch `dough/coalesced-ci-candidate`
from `origin/main`, `node --test scripts/ci/ci-workflow.test.mjs` passes with a
new assertion that `ci.concurrency` equals `{group: "${{ github.workflow }}-${{ github.ref }}", "cancel-in-progress": false}`
and the existing `ci.on` assertion unchanged; the installed
`readCiPathIgnorePolicy` on the edited file returns supported with
`.planning/**` and `docs/**`; the installed `readIntegratedStatePolicy(worktree)`
returns `{check: "ci.yml", context: "push"}`; `git log origin/main..` shows the
commit and `git ls-remote origin dough/coalesced-ci-candidate` is empty.

Behavior: Donut's `ci.yml` gains the workflow/ref concurrency group with active
runs retained, `.planning/open-dough.json` declares integrated-state completion
for `ci.yml`/`push`, and Donut's workflow test pins the group. Workflow
triggers, `paths-ignore`, jobs, shards, artifacts and the deploy workflow are
untouched. Before the commit, read Donut's `AGENTS.md` and run Donut's
check-only commit hook as that project requires; make no other Donut change.
Keep the worktree under Donut's `.worktrees/` and record its path and the
commit SHA in this plan's Current decisions for slices 2–5 and the rollout.

### 2. Observe the coalesced burst with truthful Story Branch completion
Type: Behavior
Status: done
Proof: On disposable refs `dough-proof/coalesce-<UTC stamp>/story` (execution
branch, observed target) and `dough-proof/coalesce-<UTC stamp>/trunk` (proof
trunk) created from slice 1's commit: A, B, T, C are delivered in Story Branch
Mode; D and E arrive while C runs; T2 arrives after C succeeds. `gh run list -b <story ref>`
and the jobs API show A `success` with jobs, B `cancelled` with no jobs, C
`success` with jobs, D `cancelled` with no jobs, E started after C, and no run
for T or T2. `complete-revision` for B returns `verdict: "success"`,
`effectiveEvidence.source: "integrated_state"`, `accepted` B with its own
cancelled state, `validated` C with `runId`, `attempt`, `url`, `check`
`ci.yml`, `context` `push`, and the `ancestry` basis; the same for T with its
`not_required` basis B; T2 completes `not_required` with basis C's success. A
worktree without the declaration waiting on B returns an unresolved receipt
with B undiscovered or cancelled and no integrated evidence. Record every SHA,
run id, attempt, status transitions, conclusion, and jobs-started flag.

Behavior: Donut's installed observer, bound to the story ref, reports the
replaced B as published and validated at C, never as passed. C is pushed from a
second isolated Donut worktree so the coordinator's worktree lacks C's objects;
the receipt's ancestry must come from the observer's own bounded fetch from
`origin`, with no manual fetch. Source pushes change a root-level
`dough-proof-snapshot.txt`, which `paths-ignore` does not cover; docs-only
pushes change `docs/dough-proof.md`.

This is a permitted early probe: it owns the actual provider's behavior with
Donut's full workload, secrets and `vars.RUNNER`. Before any push, obtain
Terry's authority naming both refs and the expected full runs (A, C, and E,
which may be cancelled as proof-owned once it has started and C has finished).
Push sequence: A; once A's run is in progress, B, then T, then C from the other
worktree, all before A finishes; once C is in progress, D then E; once C
succeeds, T2. Invoke `complete-revision` for B once A has finished, because the
ten-minute bound fits one run; a `timeout` receipt is reinvoked after C's run
completes and recorded as a repeated wait, never as a CI rerun. Do not retry or
rerun provider runs to manufacture green. Keep the second worktree and the
no-declaration worktree under Donut's `.worktrees/`. Failure to replace B,
starvation of C, a runtime gap, or a refused target stops slices 3–5 and
changes this plan under the seed's bounded-fix rule.

### 3. Close the Story Branch proof through the wrap-up gate
Type: Behavior
Status: planned
Proof: With slice 2's story ref complete, the installed
`history-preserving-publication.mjs integrate` publishes the branch tip onto
the proof trunk; the accepted integrated SHA N is registered on a trunk
observer; `complete-revision` for N returns `success` with confirmed shutdown
(exact, since N has its own run); only after that receipt is the proof
execution worktree and story ref retired under Dough Land's retire step. A
receipt without confirmed shutdown leaves the worktree in place.

Behavior: Wrap-up closure consumes the same real provider evidence and retires
resources only behind the gate. The trunk observer is this coordinator's own,
established for `refs/heads/<proof trunk>` before integration; the story-ref
observer is closed through the completion operation first. One full run (N).
Terry's authority from slice 2 covers this run when it named it; otherwise ask
before integrating.

### 4. Complete a replaced revision in Trunk Mode
Type: Behavior
Status: planned
Proof: On the proof trunk, `execution-increment-delivery.mjs deliver --mode trunk --target-ref refs/heads/<proof trunk> --repo nerds-odd-e/doughnut`
publishes A′ then B′ then C′ while A′ runs; `gh` shows A′ and C′ `success`
with jobs and B′ `cancelled` with no jobs; `complete-revision` for B′ returns
`integrated_state` with accepted B′ and validated C′ as in slice 2. Then
`trunk-closure.mjs finish` with a final closure commit F publishes F, waits for
F's own run, and retires the worktree and branch only after a `success`
receipt with confirmed shutdown.

Behavior: Trunk Mode delivery to a caller-authorized target produces the same
truthful receipt from real facts, and the Trunk finish closure keeps its gate.
Two full runs plus F's run. Obtain Terry's authority naming the proof trunk
and the three runs before the first push. Do not run this burst while slice
2's or 3's runs are active, so runner capacity does not distort which run is
active and which waits.

### 5. Inspect release admission, count covered runs, and clear the proof refs
Type: Behavior
Status: planned
Proof: `gh api repos/nerds-odd-e/doughnut/actions/runs/<B run>/artifacts`
lists no artifacts and `<C run>/artifacts` lists `donut-0.0.1-SNAPSHOT.jar`,
`frontend-dist` and `cli-dist` with `workflow_run.head_sha` equal to C. A
scratch script in the job's temporary directory imports Donut's
`application-release-ci.mjs` unchanged, stubs `fetch` with B's real run JSON
relabelled to `head_branch: main`, and `querySelectedCi` throws
`finished with cancelled` with `ci.state: failed`; label this a reconstructed
comparison. `gh run list -w deploy.yml` shows no new run and `git ls-remote --tags origin 'v*'`
shows no new tag. After judging, `git ls-remote origin 'refs/heads/dough-proof/coalesce-<stamp>/*'`
is empty and the proof worktrees are removed; completed runs remain listed.

Behavior: Release admission stays exact and artifact provenance stays with
each run; the plan records, per burst, the count of `ci.yml` runs that started
jobs against source pushes (slice 2: 2 of 3 among A, B, C, with E's own
disposition stated; slice 4: 2 of 3), the per-push fact table, the completion
receipts, and the retained Donut branch and commit for the rollout. Remove
only proof-owned refs and worktrees; keep slice 1's branch and worktree. No
deployment, tag, or `main` push occurs in this slice or any other.

## Current decisions and boundedness review

- Slice 1 (done): the Donut change is commit `7e443633f002a05ae1e2572dfa009e60ddabed78`
  on unpushed branch `dough/coalesced-ci-candidate` (no upstream) in
  `/Users/terryyin/git/doughnut/.worktrees/dough-coalesced-ci-candidate`, from
  `origin/main` `7178e92d04`. Accepted proof: `node --test scripts/ci/ci-workflow.test.mjs`
  2 pass (the new concurrency test fails on `origin/main`'s `ci.yml` with
  `actual: undefined`); installed `readCiPathIgnorePolicy` returns supported with
  push `pathsIgnore` `.planning/**`, `docs/**`; `readIntegratedStatePolicy`
  returns `{check: "ci.yml", context: "push"}`; Donut's `format:changed` and
  check-only `lint:changed` hook passed; `git ls-remote origin dough/coalesced-ci-candidate` empty.
- Slice 2 (done, Terry authorized slices 2–4 on 2026-10-16): stamp
  `20261015225856`. Both proof refs were opened at an empty
  `[skip ci] Open coalesced-CI proof refs` commit `4a5c6fb6dc` on top of the
  slice 1 commit, so creating them started no run. The coordinator worktree is
  `.worktrees/dough-proof-20261015225856-story`. The other writer is a
  `git clone --shared` at `.worktrees/dough-proof-20261015225856-writer`, not
  a worktree, so its objects stay out of the coordinator's store. The
  no-declaration checkout is `.worktrees/dough-proof-20261015225856-nodecl`
  at `origin/main`.

  | Push | SHA | By | Run | Conclusion | Jobs |
  | --- | --- | --- | --- | --- | --- |
  | A src | `a4985d05f2` | deliver | 38820860729 | success 23:00:25→23:07:04Z | 12 |
  | B src | `b93ca4ec66` | deliver | 38820918222 | cancelled at 23:01:26Z (while A ran) | 0 |
  | T docs | `35778b176f` | deliver | none | — | — |
  | C src | `de736bf383` | writer clone | 38820973729 | failure; in progress after A ended at 23:07, done 23:12:25Z | 12 |
  | D src | `f6f2e72b4b` | writer clone | 38821650774 | cancelled at 23:07:54Z (while C ran) | 0 |
  | E src | `eeab81f7fa` | writer clone | 38821682878 | success; started after C ended, done 23:18:02Z | 12 |
  | T2 docs | `7c90f37f72` | deliver (rebased onto E) | none | — | — |

  All runs are attempt 1. C failed only in
  `record_live_audio_with_real_open_ai_service.feature`, an E2E test against
  the real OpenAI service: A passed the same suite, and C changed only
  `dough-proof-snapshot.txt`. This was a Donut flake against an external
  service, not owned here, and it was not rerun. Because C failed, E took C's
  planned role as the validating snapshot. E was therefore kept, not
  cancelled, and T2's basis is E, not C.

  Receipts:
  - B, read-only `await-revision` on the coordinator observer: the first wait
    ended `timeout` at the ten-minute bound with `integrated.reason`
    `no_eligible_candidate`, and C, D, E each `not_current_success`. The one
    repeated wait after E completed returned `verdict: success` with
    `effectiveEvidence.source: integrated_state`: accepted B `incomplete`
    (run 38820918222/1), validated E (run 38821682878, attempt 1, `ci.yml`,
    `push`, URL), ancestry `git merge-base --is-ancestor` B→E.
  - T, `complete-revision`, the coordinator's last accepted revision before
    T2: `integrated_state`, accepted T `not_required` with basis B
    `incomplete`, validated E. Shutdown confirmed.
  - T2, `complete-revision` on a new observer that T2's `deliver` established:
    `not_required_basis` with basis E `success`. Shutdown confirmed.
  - No declaration, `complete-revision` for B on an observer started in the
    `origin/main` checkout: `source: exact`, B `incomplete` (run
    38820918222/1), `unresolvedReason: incomplete`, no integrated evidence.
    Shutdown confirmed.
  - The observer's own fetch: the coordinator store lacked C and E (checked
    with `git cat-file -e`) until the repeated B wait. It then held E, and
    there were still no `refs/remotes/origin/dough-proof/*` refs. No manual
    fetch was run.
- Why B used the read-only wait: `complete-revision` composes that same wait
  with observer shutdown, so it gives one receipt per observer. B therefore
  used `await-revision`, and `complete-revision` went to the coordinator's
  last accepted revision, as it does at a real handoff.
- After a `needs-validation` reconciliation, rerun `deliver` with the
  reconciled remote tip, which is the receipt's `suffixBase`, as
  `--previously-published-base` and the reconciled candidate as
  `--validated-candidate`. Passing the original base instead replayed the
  other writer's commits, stopped with `conflict`, and left an interactive
  rebase in the workspace. The rebase was aborted and the delivery rerun with
  the correct base.
- A fresh Donut worktree has no `.claude/skills/` (gitignored symlinks in the
  default checkout only); slices 2–5 run the installed copies from
  `.agents/skills/dough-execute-plan/scripts/` in the Donut worktree, which are
  the same 0.3.63 files.
- Proof refs live under `dough-proof/coalesce-<UTC stamp>/` and everything
  under that prefix is proof-owned; the prefix is deleted after slice 5, and
  the completed runs stay in Donut's Actions history.
- The declaration omits `jobs`; the workflow conclusion covers every job and
  shard. Revisit only if a validated run shows a job that did not run.
- Slice 2 and slice 4 bursts never overlap in time, and no proof run overlaps
  with Donut's own `main` runs by design; if a `main` push lands while a burst
  runs, record it and judge timing with that in view rather than restarting.
- The completion wait for a replaced revision is invoked after the active run
  finishes; a `timeout` receipt is reinvoked once, recorded as a repeated wait.
- E's run may be cancelled by the executor after it has started and C has
  finished, to save a full run; the record marks that as proof-owned
  cancellation, never as GitHub replacement or a provider verdict.
- Each paid slice obtains Terry's authority first, naming refs and run count,
  with the executor's recommendation; the installed Donut copies run the proof.
- A runtime gap in installed 0.3.63 is fixed in Open Dough source within this
  story when bounded, proved through a candidate installation in the isolated
  Donut worktree labelled candidate; otherwise it goes to bug fixing and the
  proof is reported blocked.

Five Behavior slices each own one proof loop: the reproducible change, the
real burst with Story Branch completion, the wrap-up gate, Trunk Mode
completion with its finish, and admission/count/cleanup. Slices 2–4 are paid
and hosted; their waits use the installed completion bound and stay distinct
from coding time. No numeric slice target or hard limit is supplied; each
slice includes its implementation, focused proof and local cleanup. Stop and
replan when a probe invalidates GitHub's replacement behavior on Donut's
actual workflow, when `deliver` cannot serve a disposable target even through
the shared API, or when a runtime gap is not bounded.

No remaining concern about boundaries, cumulative design, proof ownership or
sizing was identified after construction, so slice-plan refinement was not
needed. Readiness records preparation judgment only and grants no Take or
execution; the story stays queued after landing this preparation.

## Learnings

- Donut already runs the released integrated-state runtime (0.3.63 installed
  for both hosts, identical to the tag), so the candidate-payload route from
  plan 307 is unnecessary here; only the Donut-side change is unreleased.
- Donut's release admission already treats a `cancelled` latest run as
  blocking and walks ancestors only for docs-only tags, which matches the
  story's exact-artifact obligation without any Donut change.
