# Coalesced CI validation with truthful completion

**Identity:** SEED-008#coalesced-ci-validation
**Source:** [selected story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#coalesced-ci-validation)

## Goal and scope

Developers keep publishing small increments while providers finish active checks
and replace waiting snapshots. Completion distinguishes the coordinator's accepted
revision B from the successful integrated snapshot C used under explicit project
policy. Demonstrate fewer expensive executions and truthful completion through
Donut's GitHub Actions and Pygardon's CI in authorized isolated project copies,
in both delivery modes and wrap-up. Terry confirmed this adoption boundary on
2026-10-14: retain reproducible project changes, the exact candidate runtime and
its proof; normal installations receive the capability through a separately
authorized tagged release and rollout. Do not claim that rollout here.

Preserve exact-revision behavior without opt-in, existing exact-SHA reuse,
docs/planning applicability, failure dispositions, artifact/target obligations,
publication confirmation, shutdown and retirement. An ancestor relationship alone
never grants completion, ownership or historical success. Deliver shared runtime
guidance/payload and isolated provider adoption; provider scheduling remains with
the provider and evidence interpretation with existing coverage/completion owners.

Excluded: another scheduler or completion store, active-run cancellation as the
coalescing rule, a general affected-test selector, tree-equivalence caching,
force-push or integration-mode changes, broader source-control/review reform,
automatic migration of other projects, normal installed rollout in Donut/Pygardon,
and release-version work. Planning grants
no implementation, external project publication, paid native run or live experiment
authority. The executing instruction must establish those particular boundaries.

## Design and existing solutions

PFE found suitable owners across process boundaries:

- GitHub workflow concurrency can retain active work and replace the single
  pending run in a workflow/ref group. Use native scheduling; do not reconstruct
  GitHub's queue in Dough or promise push-order dispatch from concurrency order.
- Pygardon's `PendingRevisionQueue`, `CiSession` and path-admission owners already
  retain active work and branch queue positions. Change their evidence exposure
  only as necessary; preserve admission, retries, release reservations and fairness.
- Keep accepted publication in `execution-increment-publication.mjs` and
  `history-preserving-publication.mjs`. Keep registration, target ownership and
  observer lifetime with their current managed-delivery/host owners.
- Extend `ci-mailbox-revision-coverage.mjs` and `ci-mailbox-await.mjs`'s effective
  evidence projection, retaining `ci-mailbox-complete.mjs` as the wait/shutdown
  composition. Extend existing provider acquisition and normalization to preserve
  facts needed by that one rule. Do not add another coverage file family/ledger.
- Reuse actual mode consumers in `closure-story-integration`, managed-delivery
  CLI fixtures and `trunk-closure.mjs`; an inner successful wait alone does not
  prove execution/wrap-up cleanup behavior. `ci-background-handoff.mjs` and
  `ci-background-waiter.mjs` also consume `recordedVerdict`; preserve one effective
  evidence interpretation across these callers without adding a host lifecycle.
- Reuse bounded candidate discovery and current-attempt reads, distinct from
  the ordinary notification stream. `ci-runs.mjs` prunes completed startup
  history; `ci-command-adapter.mjs` restores exact registered SHAs, which need
  not include C. Changing only the coverage projection leaves descendant
  evidence unavailable. Existing `ci-reuse-github.mjs` reads workflow/job/context
  facts and detects reruns during acquisition: modularize suitable acquisition
  parts only if needed, without importing its exact-SHA scheduling decision.
- Keep `ci-reuse-policy.mjs`'s scheduling-time exact-SHA rule unchanged in meaning.
  `not_required` means proven ignored paths with an applicable ancestor; queue
  replacement needs distinct evidence. `preferredAttempt` prefers any success
  and is unsuitable for proving that a descendant's current attempt is successful.

The common rule requires accepted/registered B on the observer's authorized target,
an explicit project policy identifying covered checks and context, current usable
success at selected C on that target, and proven B → C ancestry. Preserve accepted
B and validated C separately, plus policy/check/context, run/attempt, inspectable
source and ancestry basis through the existing receipt. Unknown or contradictory
facts leave the obligation unresolved. Do not manufacture a B run, sort opaque IDs,
reuse an older green over a current pending/failed attempt, or route another
writer's repair into this coordinator's workspace.

Current means the selected C/check/context's current observed attempt, not the
latest published tip. C green with D/E pending can complete B; a newer C attempt
pending/failed cannot reuse C's older green. Candidate evidence must survive
notification pruning and be refreshed when contradicted or unavailable; do not
inherit exact coverage's sticky terminal-state behavior for this new basis.
Bounded lookup exhaustion or missing current facts stays unresolved, not green.
Keep the observation source and applicable policy identity with the receipt;
neither timestamps nor opaque IDs replace current attempt and check/context facts.

The materialized-view analogy in the seed motivates this validation position,
but the rule is Git ancestry and actual provider facts, not an ordered numeric
watermark. Known failure disposition remains separate. Full-snapshot checks avoid
adding a selector; any existing selector must account for the whole unchecked
range. When a docs-only push is excluded, it cannot replace an admitted required
run merely because it is the latest Git tip.

Follow [North Star: remote history and optional local refresh](../../NORTH-STAR.md#remote-history-and-optional-local-refresh):
publication and CI evidence retain distinct owners. The seed's Architecture
section records this feature's new evidence concern; no additional North Star
topic or ADR is needed. Relevant Accepted decisions are
[ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md),
[ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[ADR 0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md),
[ADR 0004 — Client installation and update](../../../docs/adrs/0004-client-installation-and-update-accepted.md),
[ADR 0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md),
and [ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
ADRs 0007/0008/0009 remain Proposed; no exception or integration-policy change
is selected. Author guidance under `src/skills/`, follow
[AGENTS.md](../../../AGENTS.md), and update installed copies only through released
payload operations. Put the demonstrated project opt-in in the existing
`.planning/open-dough.json` configuration home, with absence preserving exact
completion. Use the complete candidate payload through existing isolated delivery
fixtures, retaining its source revision and labeling it as candidate proof.
Normal project installations stay on their released versions until the separate
release/update. Never hand-synchronize managed copies or relabel a candidate as
released to make adoption appear complete.

## Preparation observations and decisive premises

Observed 2026-10-14 in this preparation workspace at starting revision
`fe876b2528cd9889f6cd75a2cb82159d27225654`, Node `v24.21.0` matching
`.node-version`. Donut was read at `6b679854235f9fc6913e46f52bb675f2c2a815c5`;
Pygardon at `6cc3d202b9f2d9402fc3ad03bd162eabc9cfb26a`. Neither project was edited.

| Premise | Consuming observation and result | Consequence / remaining owner |
| --- | --- | --- |
| Current exact reuse and completion have reusable real publication/resource fixtures | `PATH="/opt/homebrew/bin:$PATH" npm test -- src/skills/dough-execute-plan/scripts/ci-reuse-story-journey.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-trunk-journey.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-custom-journey.test.mjs src/skills/dough-execute-plan/scripts/ci-mailbox-complete.test.mjs` exited 0. The four files comprise 49 cases, including target-only failure, unread failure, accepted/rebased/closure SHAs and actual retention/retirement. | Reuse these fixture owners; slices 3–4 own evidence completion and slice 5 owns actual execution/closure consumers. |
| Exact-reuse journey proof detects lost savings | A scratch edit added `return fresh("refinement-probe-disabled")` immediately after `fresh` in `ci-reuse-policy.mjs`; `PATH="/opt/homebrew/bin:$PATH" npm test -- src/skills/dough-execute-plan/scripts/ci-reuse-story-journey.test.mjs` exited 1. The exact-A journey failed with `reuse must prevent duplicate covered execution`; the target-only reuse case also failed. The original bytes were restored. | Settles this existing count assertion's discrimination, not future coalesced proof. |
| A successful descendant cannot currently complete registered B | An isolated local Git repository made source B then descendant C; `git merge-base --is-ancestor B C` succeeded. `registerPushedRevision(B)` → `observeRevisionCoverage` with only C's successful run → `awaitRevision(B)` with a deterministic 20 ms deadline produced B `undiscovered`, `unresolvedReason: timeout`, no verdict. | The gap is in coverage/effective evidence, not a missing success message. Slice 3 owns the new consuming result. |
| Pygardon exposes a usable read-only adapter prefix | In `/Users/terryyin/git/pygardon`, `node scripts/pygardon-ci-adapter.mjs --check-target terryyin/pygardon main` exited 0 with target confirmation through the real discovery service. | Proves access only; service-controlled A/B/C and complete provenance remain slice 2's early probe. |
| Current custom facts are insufficient for target-bound descendant evidence | Local HTTP response supplied main B and feature/other C; the actual `/Users/terryyin/git/pygardon/scripts/pygardon-ci-adapter.mjs` consumed a `discover` request for main. Feeding its response to `normalizeCommandAttempts(attempts, 'main')` labelled feature-run C as main. | Preserve/filter authoritative target facts in slice 4 and isolated Pygardon adoption in slice 7. Do not infer target from normalized request branch. |
| Native GitHub queue behavior supports the chosen direction | Read-only workflow inspection plus [GitHub's concurrency contract](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency) establishes the proposed mechanism, not its actual run outcome. Donut currently has no CI concurrency group. | Hosted arrival order, cancellation reason, command counts and progress are unsettled; slice 1 bounds the credentialed/state-changing observation. |

The two local scratch probes used `node --input-type=module` with disposable
state inside this owned workspace, real Git/coverage/adapter operations and these
inputs. Both reached the stated downstream outcomes and removed their scratch
state. They supply no real-provider coalescing or production savings claim.
The initial direct Node baseline passed, but the authoritative baseline above
repeated it through the required runner after adding Bash 5 to PATH.

Literal local coverage/adapter observation (run from the named preparation
workspace; the adapter source is the named Pygardon checkout):

```sh
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { createMailbox } from './src/skills/dough-execute-plan/scripts/ci-mailbox-location.mjs';
import { registerPushedRevision, observeRevisionCoverage, readRevisionCoverage } from './src/skills/dough-execute-plan/scripts/ci-mailbox-revision-coverage.mjs';
import { awaitRevision } from './src/skills/dough-execute-plan/scripts/ci-mailbox-await.mjs';
import { normalizeCommandAttempts } from './src/skills/dough-execute-plan/scripts/ci-command-attempts.mjs';
const scratch = mkdtempSync(join(process.cwd(), '.scratch-ci-refinement-'));
const git = (...args) => execFileSync('git', ['-C', scratch, '-c', 'user.name=Refinement probe', '-c', 'user.email=probe@example.org', ...args], {encoding:'utf8'}).trim();
try {
  git('init', '-q'); writeFileSync(join(scratch,'source.txt'), 'B source\n'); git('add','.'); git('commit','-qm','B'); const b = git('rev-parse','HEAD');
  writeFileSync(join(scratch,'later.txt'), 'C change\n'); git('add','.'); git('commit','-qm','C'); const c = git('rev-parse','HEAD');
  git('merge-base','--is-ancestor',b,c);
  const request = {mode:'execution',repo:'owner/repo',branch:'main',maxDurationMs:60000,root:scratch};
  const directory = createMailbox(request,{root:scratch,storage:scratch}); registerPushedRevision(directory,b);
  await observeRevisionCoverage(directory,[{headSha:c,databaseId:7,attempt:1,status:'completed',conclusion:'success'}],request,Date.now(),{repoDir:scratch});
  let time = 0;
  const result = await awaitRevision(directory,b,{root:scratch,storage:scratch,deadlineMs:20,now:()=>time,sleep:async(d)=>{time+=d;},workerLiveness:()=> 'alive'});
  assert.equal(result.unresolvedReason,'timeout'); assert.equal(result.verdict,undefined);
  console.log(JSON.stringify({observation:'registered-B-with-successful-descendant-C',ancestry:true,coverageState:readRevisionCoverage(directory)[0].state,unresolvedReason:result.unresolvedReason,verdict:result.verdict??null}));
  const server = createServer((req,res)=> {res.setHeader('Content-Type','application/json');res.end(JSON.stringify({enabled:true,branch:'main',error:null,attempts:[{id:'main-run',sha:b,status:'pass',branch:'main',started_at:'2026-10-14T00:00:00Z'},{id:'feature-run',sha:c,status:'pass',branch:'feature/other',started_at:'2026-10-14T00:01:00Z'}]}));});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try {
    const origin = 'http://127.0.0.1:'+server.address().port;
    const child=spawn(process.execPath,['/Users/terryyin/git/pygardon/scripts/pygardon-ci-adapter.mjs'],{cwd:process.cwd(),env:{...process.env,PYGARDON_CI_ORIGIN:origin},stdio:['pipe','pipe','pipe']});
    let stdout='',stderr='';child.stdout.on('data',data=>stdout+=data);child.stderr.on('data',data=>stderr+=data);
    child.stdin.end(JSON.stringify({operation:'discover',check:{repo:'terryyin/pygardon',branch:'main'}}));
    const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('close',resolve);}); assert.equal(code,0,stderr);
    const response=JSON.parse(stdout); const runs=normalizeCommandAttempts(response.attempts,'main');
    assert.equal(runs.find(r=>r.databaseId==='feature-run').headBranch,'main');
    console.log(JSON.stringify({observation:'actual-Pygardon-adapter-then-Dough-normalization',requestedBranch:'main',providerBranch:'feature/other',normalizedBranch:runs.find(r=>r.databaseId==='feature-run').headBranch,attempts:response.attempts.map(a=>a.attemptId)}));
  } finally {await new Promise(resolve=>server.close(resolve));}
} finally {rmSync(scratch,{recursive:true,force:true});}
JS
```

Second-pass observations in the same preparation workspace at
`89d58756c8ddd216d90781ea69bfda4fc4ce4061`, 2026-10-14:

- Locked npm/browser setup and `node scripts/setup-native.mjs check` passed
  with Node `v24.21.0` and Chromium `153.0.8010.12`.
- `PATH="/opt/homebrew/bin:$PATH" npm test -- src/skills/dough-execute-plan/scripts/ci-background-handoff.test.mjs src/skills/dough-execute-plan/scripts/ci-background-lifecycle.test.mjs src/skills/dough-execute-plan/scripts/ci-github-acquisition.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-github.test.mjs`
  exited 0. The actual installed waiter and provider acquisition fixtures are
  usable; this is existing behavior, not coalesced or native-host acceptance.
- To check the waiter proof's discrimination, a scratch edit in
  `ci-background-waiter.mjs` replaced
  `settle("success", { ci: "success" })` with
  `settle("observation_unavailable", { ci: "unobserved" })`.
  `PATH="/opt/homebrew/bin:$PATH" npm test -- src/skills/dough-execute-plan/scripts/ci-background-handoff.test.mjs`
  exited 1 at the installed waiter's final state assertion (expected `success`,
  observed `observation_unavailable`). Restoring the original bytes and rerunning
  all four suites above exited 0. Slice 5 must extend this real consuming boundary.
- Read-only comparison at Donut `5fe875a590549806a42441fa2e721358c02fb5c6`
  and Pygardon `a0cf22c50a12b711bd9adc165f4b160854f0c81c` found no changes
  from the first-pass revisions to the inspected Donut CI/deployment workflows
  or Pygardon adapter/pending-head/path-queue tests. This is a source comparison,
  not refreshed provider execution proof. Slices 1–2 retain those observations.

All scratch edits were restored before preparation writes. The concrete missing
B/C capability was already reproduced above. Candidate discovery for that new
route, current-check/context eligibility and the broader consuming lifecycle are
implementation obligations in slices 3–5, not capabilities claimed by preparation.

## Outside-in proof ownership

| Final promise / examples | Owning slices and observable proof |
| --- | --- |
| Active A finishes, waiting B is replaced by C, and feedback completes under D/E arrivals | 1/6 Donut hosted scheduler; 2/7 actual Pygardon session/service. Record admitted snapshots and real command starts/finishes; B's covered-command count is zero, A/C complete. Preserve Pygardon's other-branch turn. |
| Accepted B and validated C stay distinct; same-target descendant completion requires declared policy | 3 GitHub and 4 custom installed completion: actual accepted B is registered; C's real attempt plus Git ancestry establishes integrated-state evidence. Inspect both SHAs, target, policy/check/context, run/attempt and URL. 5 proves lifecycle callers; 6/7 prove isolated project adoption. |
| No opt-in preserves exact completion and exact-commit reuse | 3/4 existing and extended exact/reuse journeys; registered B remains unresolved with only C's green. No new mandatory project setting. |
| Candidate history survives notification pruning; newer waiting tips do not invalidate C, but C's newer pending/failed rerun does | 3/4 acquisition through installed completion, with C unregistered and removed from the ordinary startup stream. B may complete at C with D pending; it must not complete from C's old green after a rerun or unavailable current evidence. 5 checks recorded verdict consumers. |
| Pending/failed/cancelled/unrelated/stale/context-incompatible C and unknown ancestry cannot become success | 3/4 controlled provider responses reaching completion; 5 preserves known failure, ownership and unread-evidence gates at mode/closure callers. 6/7 verify actual target provenance. |
| Coalescing cannot discard unchecked B changes or docs/planning applicability | 3/4 Git-range and applicability cases; 6 Donut real trigger/whole-snapshot checks; 7 Pygardon admission/path tests plus real snapshot invocation. B-source/C-docs retains the source obligation. |
| Exact artifact and target-only obligations remain required | 3/4 completion refuses unsatisfied exact/target obligations; 5 proves resource disposition; 6 Donut admitted artifact/run identity; 7 Pygardon release/CI reservation consumers. No deployment is needed to observe refusal. |
| Publication confirmation, execution/wrap-up in both modes, background completion, shutdown and safe retirement | 5 actual managed-delivery, Story integration, Trunk closure and installed background handoff/waiter fixtures, including failed publication, final closure, unread failure, unconfirmed shutdown and retry. 6/7 feed actual project provider evidence through those consuming paths. |
| Complete candidate payload works through supported delivery paths without a new host lifecycle | 3/4 payload/update operations and AGENTS.md behavior review; 5 assesses Codex/Cursor/Claude integration reuse separately and assigns invalidated native proof under ADR 0005. 6/7 use the complete candidate in isolated project installations with its source identity. No normal rollout or native pass is inferred. |

## Ordered slices

### 1. Observe Donut queue replacement without starving feedback
Type: Behavior
Status: done
Proof: Bounded hosted workflow on disposable, explicitly authorized proof refs
records A active, B pending then replaced by C, A/C completed and B's check never
started; D/E arrivals while C runs still allow C to finish. Capture exact run,
attempt, ref, SHA, conclusion and actual command counts.

Behavior: With GitHub's workflow/ref concurrency group and active cancellation
disabled, the actual provider replaces waiting eligible work while active work
finishes. Queue cancellation is explained by observed replacement, not treated
as success. Use one inert counted check with a bounded hold, not Donut's full
workload, to settle scheduling and provenance before broad implementation.

This is a permitted early probe: preparation performed only the unpaid read-only
prefix. Before mutation, execution establishes Donut owner authority for the
named disposable refs/Actions cost and reads that project's current guidance.
Use an isolated owned checkout; publish no probe to main and run no deployment.
Keep GitHub's actual admission order distinct from push order. Bound observation
by the existing 10-minute completion deadline; do not retry to manufacture green.
Remove only probe-owned refs/resources after judging. Failure to finish active
feedback or establish replacement/provenance stops dependent slices 3, 5 and 6 and
requires a revised approach in this plan.

Accepted proof (2026-10-14, Terry authorized orphan probe refs only). An isolated
`git init` checkout pushed non-force commits A→E to
`nerds-odd-e/doughnut` `refs/heads/dough-probe/coalesce-20261014205557`. Each
commit contained only `.github/workflows/dough-coalesce-probe.yml`
(`push` on `dough-probe/coalesce-*`; `concurrency.group:
${{ github.workflow }}-${{ github.ref }}`, `cancel-in-progress: false`; one
`ubuntu-latest` job echoing `COUNTED_COMMAND_START/FINISH sha=$GITHUB_SHA`
around `sleep 90`) plus `snapshot.txt`. Donut's own workflows were absent, so
none ran. The judged results come from `gh run list -b <ref>`, the
`actions/runs/<id>/jobs` API, and full-SHA `COUNTED_COMMAND_*` lines counted from
`gh run view <id> --log`:

| Push (UTC) | SHA | Run, attempt | Observed | Counted starts/finishes |
| --- | --- | --- | --- | --- |
| A 11:56:15 | `4062c496` | 38560123751 a1 | in_progress 11:56:23 → success 11:57:56 | 1/1 |
| B 11:56:25 | `9d8afa82` | 38560143963 a1 | pending, then cancelled 11:56:43 after C was pushed while A was still running; no jobs | 0/0 |
| C 11:56:37 | `0f087008` | 38560167202 a1 | pending, started 11:57:58 after A; success 11:59:31 | 1/1 |
| D 11:58:02 | `9841d657` | 38560331640 a1 | pending while C ran, then cancelled once E arrived; no jobs | 0/0 |
| E 11:58:14 | `93dc4edd` | 38560354116 a1 | started 11:59:33 after C; success 12:01:06 | 1/1 |

GitHub kept the active run and replaced the single waiting run. Arrivals during
C's run (D, E) did not interrupt C. Replaced runs have no check runs or
annotations, so the only cancellation explanation is the observed
pending → cancelled timing at the next arrival. The run conclusion is just
`cancelled`, which is indistinguishable from other cancellations; treat it as
`CI_INCOMPLETE` supersession and never as success. Each run reports its own `headSha`, `headBranch`,
`databaseId` and `attempt`, which is the provenance slices 3/6 need. The probe
ref was deleted (`git ls-remote ... 'refs/heads/dough-probe/*'` returned none);
the five completed runs remain in Donut's Actions history as inspectable
evidence. Not observed: reruns, multi-job workflows, and `paths-ignore`
admission (slice 6 owns those).

### 2. Observe Pygardon's selected snapshot and evidence provenance
Type: Behavior
Status: done
Proof: In an authorized isolated Pygardon checkout/service, the existing
CiSession path records actual command invocations for active A, queued B replaced
by C and another branch's turn. Its HTTP attempt/discovery path exposes usable
target, current attempt, snapshot and check/context facts; the actual adapter
must not certify a different branch or stale observation as the requested target.

Behavior: Pygardon's existing scheduler avoids B while active work finishes and
retains fairness; its evidence can support a target-bound integrated-state receipt
without another queue. Reuse `test_ci_pending_heads.py`, `test_ci_path_queue.py`
and their held-command/session fixtures to reach dispatch, attempt storage and
HTTP observation. A queue-class unit test alone cannot settle this premise.

The actual adapter access prefix already passed. Preparation did not prepare a
new Pygardon environment, change its service or dispatch checks. This early probe
owns those state-changing/owner-held observations and execution authority.
Follow that project's Nix and `scripts/prepare-worktree.sh` prerequisites, then
its guarded focused pytest route; confirm collected cases and actual outcomes.
Observe source B/docs C against the validated baseline and current/older reruns.
If required target/context/history cannot be obtained, stop dependent slices 4,
5 and 7, keep the finding and revise the evidence route before implementation.

Accepted proof (2026-10-14, Terry authorized isolated local use only). The probe
used a scratch detached worktree of Pygardon origin/main `e40c6875`, prepared with
`nix develop -c scripts/prepare-worktree.sh` (exit 0). The worktree was removed
afterwards. Nothing was pushed, and the shared service was not touched.

- `nix develop -c scripts/check-worktree.sh pytest tests/test_ci_pending_heads.py tests/test_ci_path_queue.py tests/test_ci_session_retry_queue.py tests/test_ci_session_branches.py -p no:randomly -o addopts='' -v`
  collected and passed 15 cases. `test_newest_pending_tip_runs_after_active_without_superseded_attempt`
  observes commands [A, C]. `test_waiting_replacement_uses_current_evidence[unchecked_source]`
  and `test_excluded_preparation_releases_slot_to_other_branch` cover path admission and fairness.
- A scratch probe test (removed afterwards) ran through the same guarded route,
  1 collected, 1 passed. It drove real `create_app`, CiSession admission, path
  evidence over a real Git repository, `CiAttemptStore` and held commands, with
  GitHub mocked only at the transport. HTTP was reached through a localhost
  forwarder read by the actual `scripts/pygardon-ci-adapter.mjs discover`/`--retry`.
  History: base → A(src) → B(src) → C(docs, child of B) → D(docs), plus F(src) on
  `feature`. Commands ran for exactly [A, C, F, C(rerun)]; B got zero. B was
  replaced in place by C while A was active, and main kept its position. C ran
  because it carries B's unchecked source. Feature F kept its turn. D after
  validated C was `path_excluded`, with no command and no attempt. A retry of C
  created a new attempt with the same SHA and kept the older `pass`.

Evidence facts by layer:

| Fact | Service `/api/ci` | Adapter `discover` | After `normalizeCommandAttempts(…, 'main')` |
| --- | --- | --- | --- |
| Target branch | `attempts[].branch` at admission/retry | dropped | relabelled: feature F becomes `main` |
| SHA, attempt id | yes (uuid `id`) | `runId` = `attemptId` = id | `databaseId` = `attempt` = id |
| Rerun / current attempt | new id, same SHA, newer `started_at` | newest first, `time` | `latestTimedAttempts` drops C's older green only when times differ; equal times keep both |
| Check/context | none (one whole-repository CI command) | none | none |
| Ancestry / exclusion basis | not exposed; `unstarted_reason.kind = path_excluded` for main's tip only | none | none |

Decision: the scheduler premise holds without another queue. The target, attempt
and rerun facts are obtainable from the service, so dependent slices continue.
Slice 7 makes the adapter emit each attempt's own `branch` and an inspectable URL.
Slice 4 makes Open Dough keep the provider branch, refuse attempts whose branch is
missing or different, and choose the current attempt by provider order or time,
never letting an equal or missing time resolve to an older green. Ancestry is
computed locally with Git. Pygardon's policy names one fixed whole-repository
check context. Not observed, owned by slice 7: the real CI command and GitHub
traffic, `/api/ci?latest=N` bounds, and pruning of non-head attempts beyond
`_RETAINED_ATTEMPT_LIMIT` (100). Also unobserved: a SHA shared by two branches
records only its first branch, so a main receipt may lack main provenance and must
stay unresolved. Retry under a release reservation and `--check-target` against
this service were not exercised either.

### 3. Complete incorporated work truthfully through GitHub evidence
Type: Behavior
Status: planned
Proof: Real local Git publication and GitHub-shaped acquisition → registration →
coverage → installed complete-revision returns accepted B and validated C, plus
actual shutdown outcome. Disable descendant eligibility in a scratch mutation:
the positive journey must fail for missing integrated-state evidence, then
restore and pass. Do not fabricate the completion receipt.

Behavior: With slice 1's feasible provider facts and explicit project policy,
successful same-target C incorporating accepted B completes only the identified
integrated-state checks. The receipt states what passed without inventing B's
historical result. Without policy, exact completion and reuse remain unchanged.
Ineligible evidence yields bounded pending/unresolved/failure behavior; exact
artifact/target obligations and unread failures retain their gates.

Implement one eligibility/effective-evidence rule within existing CI owners,
including the `recordedVerdict` projection. Resolve policy from the executing
project's configuration and preserve policy/check/context, current run/attempt
and ancestry provenance. Reuse provider acquisition owners for bounded candidate
lookup and authoritative current-attempt facts; separate evidence discovery from
notification pruning. C need not be a registered revision. Refresh its basis
instead of copying terminal exact-success retention onto B. Keep known failures
and cross-writer repair ownership separate from descendant eligibility.

Extend `ci-github-acquisition`, `ci-mailbox-*` and real-publication journey
fixtures through the installed completion command. Cover unregistered C omitted
by startup pruning; C green/D pending; C's later pending/failed rerun; unknown
ancestry; missing/context-incompatible checks; and an observation error beside
retained success. Preserve ignored-only applicable-ancestor evidence. Use real
accepted SHAs and counted commands; controlled provider responses do not supply
the verdict. Existing exact/reuse and shutdown cases remain green.

Include usable shared guidance and complete declared runtime dependencies with
this slice. Run affected full focused suites through `npm test -- <paths>`, plus
`npm test -- tests/execution-payload-update.sh tests/payload-declaration-links.sh`
for changed delivery dependencies and installed use. Review one B/C success and
one incompatible/failed C under AGENTS.md. This increment proves installed
completion; slice 4 adds custom acquisition and slice 5 owns complete execution,
wrap-up and background consumer behavior. Do not report those later proofs done.

### 4. Consume the same evidence rule from custom CI
Type: Behavior
Status: planned
Proof: Actual custom command adapter acquisition and normalization → coverage →
installed complete-revision uses slice 3's rule. A counted provider command
validates C; B gets no fabricated attempt. Cross-target, unavailable and
stale/current-attempt counterexamples reach actual consuming refusal.

Behavior: A custom provider supplies inspectable target/check/context and current
attempt evidence for selected snapshots. Declared integrated-state policy permits
C to support accepted B; opaque IDs remain opaque. Legacy exact-only adapters
continue their existing behavior without new required fields or a silent policy.

Use slice 2's evidence findings to extend the command protocol minimally,
preserving provenance through normalization and filtering. Do not relabel
all-branch history as the requested target or discard a required check because
another check has a later timestamp. Keep C available for B's evidence even when
ordinary completed notifications suppress it. Translate facts once and reuse
slice 3's eligibility/receipt model, without another coverage store. Preserve
diagnostics, failure deduplication and ignored-only ancestor behavior.

Extend `ci-command-adapter*` and `ci-reuse-custom-journey` fixtures through the
installed completion command. Include another branch's newer green, C green
with D pending, a newer C rerun, unavailable discovery with retained success,
and C outside the ordinary startup stream. Preserve legacy exact-only behavior.
Extend custom-CI guidance, its runnable example where needed, and complete
payload fixtures in this usable slice; run the affected full focused suites and
installed payload/update checks. Slice 5 supplies the mode/closure and background
consumer proof, and slice 7 supplies the actual Pygardon candidate adoption.

### 5. Carry integrated evidence through execution and closure lifecycles
Type: Behavior
Status: planned
Proof: Accepted B and validated C flow through actual managed-delivery, Story
integration, Trunk closure and installed background handoff/waiter consumers.
Observe their final reports, accepted revisions, observer shutdown and actual
resource retention/retirement. The provider may be controlled; neither verdicts
nor cleanup are fixture-supplied. A scratch mutation disabling descendant
projection must fail a consuming positive case before restore/pass.

Behavior: Execution and wrap-up in both modes report the accepted and validated
revisions truthfully and perform only the cleanup their obligations permit.
Final closure/rebased/merged publications use their actual accepted SHA.
Background callers see the same effective evidence without gaining new repair,
delivery or cleanup authority. A green C/D-pending case makes progress; an unread
failure, unsatisfied exact obligation or unconfirmed shutdown retains resources.

Extend `closure-story-integration`, `trunk-closure`, managed-delivery CLI,
`ci-reuse-*journey`, `ci-background-handoff` and `ci-background-lifecycle` at
stable consuming boundaries. Prove failed publication does not register a
candidate, closure supersession does not reuse the wrong accepted B, reruns and
observation loss cannot yield false success, and another writer's C does not
transfer repair ownership. Preserve background failure delivery and its owner,
acknowledgment, cancellation and resource-retention semantics. A success from
`awaitRevision` alone does not finish this slice.

Run the complete affected focused suites, including installed consumer paths
outside the changed helper's suite. Shared GitHub/custom cases may reuse proof
where they reach identical lifecycle behavior; exercise distinct normalization
or target-provenance boundaries separately. Align runtime completion/reporting
guidance and payload dependencies in the same increment. Reuse each host's
existing integration evidence only for unchanged launch/hook/worker seams; if a
mechanism changes, assign its invalidated native requirements under ADR 0005.
Deterministic installed fixtures do not claim native host acceptance. This slice
finishes shared lifecycle proof; actual project adoption remains slices 6–7.

### 6. Prove candidate adoption in Donut's actual validation workflow
Type: Behavior
Status: planned
Proof: Authorized isolated Donut adoption uses its actual workflow and covered
commands on owned proof refs: A/C run, waiting B does not, continued arrivals finish
feedback, and actual provider evidence reaches Dough completion for accepted B.
Inspect release-admission artifact/run identity while an exact artifact obligation
is unsatisfied; no deployment is executed by the proof.

Behavior: Donut gets reduced full-validation executions and truthful integrated
completion while retaining workflow exclusions, every required job/shard,
artifact provenance and deployment admission. Use workflow/ref concurrency with
active work retained; do not group distinct targets or deployment obligations
into one waiting slot. Preserve actual push-path admission: a C push excluded
by docs/planning filters cannot silently cancel an admitted required B check.

Execution establishes authority for proof-ref publication and installs the
complete identified candidate payload through existing isolated delivery fixtures
in an owned Donut proof checkout. Keep ordinary project installations and default
checkouts unchanged; candidate proof is not normal rollout. Use current project
guidance and ADRs. Extend existing workflow/script and release-admission tests; exercise
the actual scheduler after the inert probe, count starts of covered commands and
record run/attempt/context/ancestry provenance. Feed it through execution and
wrap-up consumers in both modes, reusing shared mode proof only where boundaries
match. Scheduler-only success does not finish this slice. Report counts for the
observed burst, not a production percentage or latency improvement. Retain the
reproducible workflow/policy changes with candidate identity and judged evidence
for later rollout; remove only disposable probe resources after judging.

### 7. Prove candidate adoption in Pygardon's actual CI
Type: Behavior
Status: planned
Proof: Authorized isolated Pygardon adoption follows real branch observation → admission →
command → attempt storage → HTTP discovery → actual adapter → Dough mode/closure
completion. A/C's real commands execute and B's does not; continued arrivals and
another branch retain completed turns. Inspect both SHAs and target/context/current
attempt facts; exact release/reservation gates remain effective.

Behavior: Pygardon reuses its queue and exposes the evidence its Dough integration
needs. Skipped B completes only against an eligible validated C under declared
policy; a different branch's or stale C cannot certify it. Preserve current retry,
admission/path exclusion, storage and release-reservation semantics.

Execute in an authorized isolated Pygardon checkout/service after its
preparation/guarded proof prerequisites. Use the complete identified candidate
payload through existing isolated delivery fixtures; normal installations and
the shared service are not this proof environment. Change the provider's existing discovery/adapter and policy
homes rather than creating a parallel journal. Extend session/path/adapter and
release consumer tests, then observe the actual selected commands and consuming
completion in both modes. Use complete unchecked-range evidence for source B/docs
C. Keep failed attempts actionable and resources recoverable when evidence or
shutdown is unresolved. Confirm compatible existing exact-SHA reuse and legacy
behavior. Retain reproducible project adapter/policy/guidance changes, candidate
identity and judged proof for the separately authorized release/rollout. Finish
any shared payload fixes in this story; do not declare completion with either
project's isolated adoption proof missing or claim normal rollout occurred.

## Current decisions and boundedness review

Seven Behavior slices each own one observable proof loop. The two early provider
probes isolate credentialed/owner-held uncertainty. Slices 3–4 make integrated
completion usable through installed commands at distinct acquisition boundaries;
slice 5 carries that evidence through existing execution/closure lifecycles;
slices 6–7 prove candidate adoption in the actual projects' isolated environments.
The lack of full lifecycle/project proof after slice 3 is an interim state
explicitly replaced by slices 4–7, not story completion.

Second-pass slice-plan refinement ran: retain original probes 1–2; split the
shared evidence and full lifecycle proof bundled in original slices 3–4 into
revised slices 3–5; retain original adoption slices 5–6 as 6–7 with Terry's
confirmed isolated-proof boundary. This separates a working completion command
from its independently observable callers without creating another domain rule.
All source promises are mapped above; no completed slice or evidence was dropped.

No numeric slice target or hard limit is supplied. Include implementation,
focused consuming tests and local cleanup in each slice's bound; hosted/service
waits use the established timeout and stay distinct from coding time. Stop and
replan when a probe invalidates the common rule or a slice needs another scheduler,
ledger, integration policy or unsupported proof route. Scope or ADR changes go to
the developer; do not reduce either provider or mode promise through plan editing.

After this refinement, no remaining concern about boundaries, cumulative design,
proof ownership or sizing was identified. No sizing exception or story resplit
is recommended. The provider observations that
preparation cannot perform are bounded by permitted early probes, not claimed as
settled results. Readiness records preparation judgment only and grants no Take
or execution. The story stays queued after landing this preparation.

## Learnings

- The predecessor's exact-SHA reuse is compatible but insufficient for B/C
  completion. Its real command-count/resource fixtures are suitable proof owners.
- Custom discovery loses target attribution before coverage sees the facts;
  changing only completion would leave the new claim unproved.
- Native GitHub concurrency replaces pending work by admission order, and a
  paths-ignored push may never enter that queue. Preserve those distinctions in
  the rule and proof instead of promising every Git tip receives a run.

- Notification pruning cannot serve as the complete descendant-candidate set.
  Candidate lookup and current evidence stay with acquisition/coverage owners.
- A pending newer tip differs from a pending rerun of the validated snapshot.
  Only the latter contradicts that snapshot's current success.
- `recordedVerdict` has installed background callers with a discriminating
  existing fixture; their completion and failure behavior belongs in slice 5.
- Isolated candidate adoption is the confirmed story boundary; normal installed
  rollout follows a separate tagged release and is not part of this completion.
