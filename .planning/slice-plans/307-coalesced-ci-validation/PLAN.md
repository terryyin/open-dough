# Coalesced CI validation with truthful completion

**Identity:** SEED-008#coalesced-ci-validation
**Source:** [selected story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#coalesced-ci-validation)

## Goal and scope

Developers keep publishing small increments while providers finish active checks
and replace waiting snapshots. Completion distinguishes the coordinator's accepted
revision B from the successful integrated snapshot C used under explicit project
policy. Demonstrate fewer expensive executions and truthful completion through
Donut's GitHub Actions and Pygardon's CI, in both delivery modes and wrap-up.

Preserve exact-revision behavior without opt-in, existing exact-SHA reuse,
docs/planning applicability, failure dispositions, artifact/target obligations,
publication confirmation, shutdown and retirement. An ancestor relationship alone
never grants completion, ownership or historical success. Deliver shared runtime
guidance/payload and concrete provider adoption; provider scheduling remains with
the provider and evidence interpretation with existing coverage/completion owners.

Excluded: another scheduler or completion store, active-run cancellation as the
coalescing rule, a general affected-test selector, tree-equivalence caching,
force-push or integration-mode changes, broader source-control/review reform,
automatic migration of other projects, and release-version work. Planning grants
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
  prove execution/wrap-up cleanup behavior.
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
[ADR 0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md),
and [ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
ADRs 0007/0008/0009 remain Proposed; no exception or integration-policy change
is selected. Author guidance under `src/skills/`, follow
[AGENTS.md](../../../AGENTS.md), and update installed copies only through released
payload operations. Keep necessary candidate runtime use explicit in isolated
proof; never hand-synchronize managed copies to make adoption appear complete.

## Preparation observations and decisive premises

Observed 2026-10-14 in this preparation workspace at starting revision
`fe876b2528cd9889f6cd75a2cb82159d27225654`, Node `v24.21.0` matching
`.node-version`. Donut was read at `6b679854235f9fc6913e46f52bb675f2c2a815c5`;
Pygardon at `6cc3d202b9f2d9402fc3ad03bd162eabc9cfb26a`. Neither project was edited.

| Premise | Consuming observation and result | Consequence / remaining owner |
| --- | --- | --- |
| Current exact reuse and completion have reusable real publication/resource fixtures | `PATH="/opt/homebrew/bin:$PATH" npm test -- src/skills/dough-execute-plan/scripts/ci-reuse-story-journey.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-trunk-journey.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-custom-journey.test.mjs src/skills/dough-execute-plan/scripts/ci-mailbox-complete.test.mjs` exited 0. The four files comprise 49 cases, including target-only failure, unread failure, accepted/rebased/closure SHAs and actual retention/retirement. | Reuse these fixture owners; slices 3–4 must extend their actual consumers. |
| Exact-reuse journey proof detects lost savings | A scratch edit added `return fresh("refinement-probe-disabled")` immediately after `fresh` in `ci-reuse-policy.mjs`; `PATH="/opt/homebrew/bin:$PATH" npm test -- src/skills/dough-execute-plan/scripts/ci-reuse-story-journey.test.mjs` exited 1. The exact-A journey failed with `reuse must prevent duplicate covered execution`; the target-only reuse case also failed. The original bytes were restored. | Settles this existing count assertion's discrimination, not future coalesced proof. |
| A successful descendant cannot currently complete registered B | An isolated local Git repository made source B then descendant C; `git merge-base --is-ancestor B C` succeeded. `registerPushedRevision(B)` → `observeRevisionCoverage` with only C's successful run → `awaitRevision(B)` with a deterministic 20 ms deadline produced B `undiscovered`, `unresolvedReason: timeout`, no verdict. | The gap is in coverage/effective evidence, not a missing success message. Slice 3 owns the new consuming result. |
| Pygardon exposes a usable read-only adapter prefix | In `/Users/terryyin/git/pygardon`, `node scripts/pygardon-ci-adapter.mjs --check-target terryyin/pygardon main` exited 0 with target confirmation through the real discovery service. | Proves access only; service-controlled A/B/C and complete provenance remain slice 2's early probe. |
| Current custom facts are insufficient for target-bound descendant evidence | Local HTTP response supplied main B and feature/other C; the actual `/Users/terryyin/git/pygardon/scripts/pygardon-ci-adapter.mjs` consumed a `discover` request for main. Feeding its response to `normalizeCommandAttempts(attempts, 'main')` labelled feature-run C as main. | Preserve/filter authoritative target facts in slice 4 and actual Pygardon adoption in slice 6. Do not infer target from normalized request branch. |
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

## Outside-in proof ownership

| Final promise / examples | Owning slices and observable proof |
| --- | --- |
| Active A finishes, waiting B is replaced by C, and feedback completes under D/E arrivals | 1/5 Donut hosted scheduler; 2/6 actual Pygardon session/service. Record admitted snapshots and real command starts/finishes; B's covered-command count is zero, A/C complete. Preserve Pygardon's other-branch turn. |
| Accepted B and validated C stay distinct; same-target descendant completion requires declared policy | 3 GitHub and 4 custom consuming journeys: actual accepted B is registered; C's real attempt plus Git ancestry establishes integrated-state evidence. Inspect both SHAs, target, policy/check/context, run/attempt and URL. 5/6 prove project adoption. |
| No opt-in preserves exact completion and exact-commit reuse | 3/4 existing and extended exact/reuse journeys; registered B remains unresolved with only C's green. No new mandatory project setting. |
| Pending/failed/cancelled/unrelated/stale/context-incompatible C, unknown ancestry and current failed reruns cannot become success | 3/4 controlled provider responses reaching completion and mode consumers; preserve known failure and unread evidence. 5/6 verify each provider's actual target provenance. |
| Coalescing cannot discard unchecked B changes or docs/planning applicability | 3/4 Git-range and applicability cases; 5 Donut real trigger/whole-snapshot checks; 6 Pygardon existing admission/path tests plus real snapshot invocation. B-source/C-docs must retain the relevant source obligation. |
| Exact artifact and target-only obligations remain required | 3/4 completion/resource journeys with an unsatisfied exact/target obligation; 5 Donut admitted artifact/run identity; 6 Pygardon release/CI reservation consumers. No actual deployment needed to observe refusal. |
| Publication confirmation, execution/wrap-up in both modes, shutdown and safe retirement | 3/4 actual managed-delivery, Story integration and Trunk closure CLI fixtures, including failed publication, final closure, unread failure, unconfirmed shutdown and retry. 5/6 feed real project provider evidence to those consuming operations. |
| Reusable guidance/runtime reaches supported installations without new host lifecycle | 3/4 payload/update operations and AGENTS.md representative behavior review. Assess Codex/Cursor/Claude bridge evidence separately; changed mechanisms require affected native proof under ADR 0005. No native pass inferred from deterministic tests. |

## Ordered slices

### 1. Observe Donut queue replacement without starving feedback
Type: Behavior
Status: planned
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
feedback or establish replacement/provenance stops dependent slices 3 and 5 and
requires a revised approach in this plan.

### 2. Observe Pygardon's selected snapshot and evidence provenance
Type: Behavior
Status: planned
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
If required target/context/history cannot be obtained, stop dependent slices 4
and 6, keep the finding and revise the evidence route before implementation.

### 3. Complete incorporated work truthfully through GitHub evidence
Type: Behavior
Status: planned
Proof: Real local Git publication and GitHub-shaped acquisition → registration →
coverage → installed completion → actual Story integration/Trunk closure
consumers return accepted B and validated C; inspect observer shutdown and resource
disposition. Disable descendant eligibility in a scratch mutation: the positive
journey must fail for missing integrated-state evidence, then restore and pass.

Behavior: With slice 1's feasible provider facts and explicit project policy,
successful same-target C incorporating accepted B completes only the identified
integrated-state checks. The receipt states what passed without inventing B's
historical result. Without policy, exact completion and reuse remain unchanged.
Ineligible or missing evidence yields bounded pending/unresolved/failure behavior,
and unsatisfied artifact/target obligations and unread failures retain their gates.

Implement one shared eligibility/effective-evidence rule within existing CI
owners. Resolve policy from the executing project; record its applicability,
checks/context and ancestry source with evidence. Normalize current attempt
ordering using provider facts; never apply success-preferring selection to claim
current success. Preserve existing exact and ignored-only records. Include the
known-failure disposition and cross-writer attribution cases in this same journey.

Extend current `ci-reuse-*journey`, `ci-mailbox-*`, `closure-story-integration`
and `trunk-closure` fixtures at their stable outside-in boundaries. Produce real
accepted/rebased/merged SHAs and real counted check commands; fixtures may control
provider responses but cannot fabricate the completion receipt or promised
cleanup. Cover final closure supersession, failed publication, missing ancestry,
new current rerun, unconfirmed shutdown and unsatisfied exact artifact obligations.
Run affected full focused suites through `npm test -- <paths>`; broader unrelated
dashboard checks are not a local gate imposed by hosted CI configuration.

Include usable shared guidance and declared runtime dependencies with this
increment. Run `npm test -- tests/execution-payload-update.sh
tests/payload-declaration-links.sh` for changed payload dependencies and actual
installed use. Review one B/C success and one failed/incompatible C under
AGENTS.md; add no per-host discovery matrix. Custom-provider adoption remains
owned by slice 4, actual project adoption by slices 5–6.

### 4. Consume the same evidence rule from custom CI
Type: Behavior
Status: planned
Proof: Actual custom command adapter acquisition and normalization feed the same
coverage/completion rule in both mode/closure consumers. A counted provider
command validates C; B gets no fabricated attempt. Cross-target and stale/current
attempt counterexamples remain unresolved and preserve applicable resources.

Behavior: A custom provider supplies inspectable target/check/context and current
attempt evidence for selected snapshots. Declared integrated-state policy permits
C to support accepted B; opaque IDs remain opaque. Legacy exact-only adapters
continue their existing behavior without new required fields or a silent policy.

Use slice 2's evidence findings to extend the existing command protocol minimally,
preserving provenance through every normalization/filtering step. Make absence or
staleness explicit for this new evidence route; do not relabel all-branch history
as the requested target. Translate provider facts once and use slice 3's shared
eligibility and receipt model. Preserve diagnostics, failure deduplication,
startup history and existing ignored-only ancestor behavior.

Extend current `ci-command-adapter*`, `ci-reuse-custom-journey` and mode/closure
fixtures, including a service response containing another branch's newer green
and an observation error beside retained success. Demonstrate actual consuming
refusal, not merely discarded extra fields. Extend custom-CI adoption guidance,
its runnable example where needed, and payload fixtures in this same usable slice.
Run affected focused suites and installed payload/update checks. Assess continued
Codex/Cursor/Claude integration reuse against unchanged launch/hook/worker seams;
if a host interface changes, assign its invalidated native proof before acceptance.
Deterministic checks make no new native acceptance claim.

### 5. Adopt the contract in Donut's actual validation workflow
Type: Behavior
Status: planned
Proof: Authorized Donut adoption uses its actual workflow and covered commands
on owned proof refs: A/C run, waiting B does not, continued arrivals finish
feedback, and actual provider evidence reaches Dough completion for accepted B.
Inspect release-admission artifact/run identity while an exact artifact obligation
is unsatisfied; no deployment is executed by the proof.

Behavior: Donut gets reduced full-validation executions and truthful integrated
completion while retaining workflow exclusions, every required job/shard,
artifact provenance and deployment admission. Use workflow/ref concurrency with
active work retained; do not group distinct targets or deployment obligations
into one waiting slot. Preserve actual push-path admission: a C push excluded
by docs/planning filters cannot silently cancel an admitted required B check.

Execution establishes authority for changes/publication and a candidate runtime
delivery route in an owned Donut checkout, rather than editing the default
checkout or hand-patching installed managed copies. Use current project guidance
and ADRs. Extend existing workflow/script and release-admission tests; exercise
the actual scheduler after the inert probe, count starts of covered commands and
record run/attempt/context/ancestry provenance. Feed it through execution and
wrap-up consumers in both modes, reusing shared mode proof only where boundaries
match. Scheduler-only success does not finish this slice. Report counts for the
observed burst, not a production percentage or latency improvement.

### 6. Adopt target-bound completion in Pygardon's actual CI
Type: Behavior
Status: planned
Proof: Authorized Pygardon adoption follows real branch observation → admission →
command → attempt storage → HTTP discovery → actual adapter → Dough mode/closure
completion. A/C's real commands execute and B's does not; continued arrivals and
another branch retain completed turns. Inspect both SHAs and target/context/current
attempt facts; exact release/reservation gates remain effective.

Behavior: Pygardon reuses its queue and exposes the evidence its Dough integration
needs. Skipped B completes only against an eligible validated C under declared
policy; a different branch's or stale C cannot certify it. Preserve current retry,
admission/path exclusion, storage and release-reservation semantics.

Execute in an authorized owned Pygardon checkout after its preparation/guarded
proof prerequisites. Change the provider's existing discovery/adapter and policy
homes rather than creating a parallel journal. Extend session/path/adapter and
release consumer tests, then observe the actual selected commands and consuming
completion in both modes. Use complete unchecked-range evidence for source B/docs
C. Keep failed attempts actionable and resources recoverable when evidence or
shutdown is unresolved. Confirm compatible existing exact-SHA reuse and legacy
behavior. Finish concrete project guidance/adoption and any shared payload fixes
with this outcome; do not declare completion with either project's proof missing.

## Current decisions and boundedness review

Six Behavior slices each own one observable proof loop. The two early provider
probes isolate credentialed/owner-held uncertainty; slices 3–4 deliver one shared
rule through distinct acquisition boundaries; slices 5–6 prove adoption using the
actual projects. The interim lack of custom/project adoption after slice 3 is
explicitly replaced by slices 4–6; it is not a completed story.

No numeric slice target or hard limit is supplied. Include implementation,
focused consuming tests and local cleanup in each slice's bound; hosted/service
waits use the established timeout and stay distinct from coding time. Stop and
replan when a probe invalidates the common rule or a slice needs another scheduler,
ledger, integration policy or unsupported proof route. Scope or ADR changes go to
the developer; do not reduce either provider or mode promise through plan editing.

Plan refinement is not needed: no remaining concern about boundaries, cumulative
design, proof ownership or sizing was identified. The provider observations that
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
