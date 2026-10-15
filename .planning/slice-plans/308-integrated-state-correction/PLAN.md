# Integrated-state completion correction

**Identity:** SEED-008#integrated-state-correction
**Source:** [correction story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#integrated-state-correction)

## Source and provenance

This is a bounded retrospective correction of the completed execution of
SEED-008#coalesced-ci-validation (`165482a2:.planning/seeds/SEED-008-worktree-branch-trunk-sync.md#coalesced-ci-validation`).
Its plan is 307 (`165482a2:.planning/slice-plans/307-coalesced-ci-validation/PLAN.md`), and its accepted
proof is in slices 3, 4, 5 and 7. The reviewed published commits are
`7bd4cfbd`, `4878acba`, `d1eda2ce`, `d4913f71`, `f1582623`, `d429430a`,
`1ef1339e` and `c98d2d22`. This plan does not reopen that story's sections or
plan 307.

## Goal and scope

There is one correction outcome. Integrated-state completion keeps the
completed story's promise for an ignored-only accepted revision whose applicable
ancestor was replaced. Its candidate fetch never delays a stop. Its rule is
proved at the domain contract instead of mostly through spawned observers. Its
record storage does not depend on the rule.

Included:

1. An accepted `not_required` B whose basis is `incomplete` or `pending` is
   judged for integrated evidence, as if B were `undiscovered`.
2. A candidate is fetched only when the checkout lacks it and all its listed
   attempts succeeded. The observation's abort stops the fetch's process group.
3. Unit tests prove `integratedStateJudge` and the GitHub current-attempt
   reader. The ineligibility and read-bound journeys shrink to one GitHub
   negative journey.
4. Readers import revision records directly, and the records module no longer
   imports the judge.

Excluded:

- any new integrated-state promise, or a change to exact completion;
- changing `not_required` with a `success` or `failure` basis;
- changing custom-adapter normalization or the command protocol;
- Donut adoption (SEED-008#donut-coalesced-ci-adoption);
- release, rollout, native or paid runs.

This plan grants no Take or execution.

## Current findings

Evidence was read and observed at `c98d2d22cf97b240af23f4712eed8140452cbd64`
on 2026-10-15. Paths are under `src/skills/dough-execute-plan/scripts/`.

1. **Story promise gap (behaviour).** A docs-only accepted B whose
   `not_required` basis is a replaced or cancelled source A never receives
   integrated evidence. The causes:
   - `ci-path-applicability.mjs` picks the nearest ancestor with any listed run
     as the basis, including a cancelled one.
   - `attemptState` maps cancelled to `incomplete`
     (`ci-revision-applicability-classification.mjs`).
   - `integratedEligibleStates` holds only `undiscovered` and `incomplete`
     (`ci-integrated-state.mjs`).
   - `effectiveCoverage` returns `unresolvedReason: "incomplete"` whenever
     `basis.state === "incomplete"` (`ci-mailbox-await.mjs`).
   - The store's terminal `unproved` lists every `not_required` revision
     without a `success` or `failure` basis (`ci-mailbox-store.mjs`).

   Under GitHub concurrency, slice 1 of plan 307 observed replaced runs as
   cancelled with no jobs. With C green, B therefore ends `incomplete`, not
   "B published; integrated state validated at C". A custom provider gives the
   replaced A no attempt, so B stays `undiscovered` and is judged there. The
   two providers diverge.
2. **Candidate fetch robustness.**
   - `fetchCandidate` (`ci-integrated-state-ancestry.mjs`) checks the abort
     only after `git fetch` returns.
   - `boundedTransport` (`publication-git.mjs`) takes no signal. It allows
     120 s per fetch, with up to 3 sequential fetches per poll.
   - `ancestryOf` runs before the `listed.every(succeeded)` check, so pending
     or failed tips are fetched.
   - Stop waits only 5 s (`ci-mailbox-store.mjs`). A stop during a slow fetch
     therefore leaves shutdown unconfirmed, and the closure keeps its worktree.
3. **Test cost.** No test imports `integratedStateJudge`. Every ineligibility
   reason is proved through spawned-observer journeys:
   - `ci-integrated-state-ineligible.test.mjs`: the rerun, two
     `context_incompatible` cases, `missing_check`, and
     `current_attempt_unavailable`;
   - `ci-integrated-state-reads.test.mjs`: `attempt_changed`,
     `verification_bound`, and the every-run rule;
   - `ci-integrated-state-custom.test.mjs`: the custom rerun.

   The rerun contradiction is proved at least three times on GitHub. The
   retrospective reported CI shares at 547/349/604 job-seconds against the
   710 ceiling in `tests/time-budget`. These journeys added about 80
   job-seconds.
4. **Residue (low).**
   - `ci-mailbox-revision-coverage.mjs` re-exports the records API from
     `ci-mailbox-revision-records.mjs`, and readers import it through coverage.
   - The records module imports `ci-integrated-state.mjs` only for
     `candidateLookupUnavailable`.
   - The comment after `provedApplicableAncestorStates` in
     `ci-mailbox-store.mjs` dangles away from the filter it describes.

## Preserved promises and constraints

- Exact completion is unchanged without a policy. A `not_required` B with a
  `success` or `failure` basis keeps today's verdict. The receipt never says
  that B passed; `accepted` keeps B's own `not_required` state and basis.
- A known failure, including A's, stays actionable through the existing
  ancestor-failure delivery. A later green does not erase it.
- Candidate fetch fetches objects only. It writes no ref, `FETCH_HEAD`, index or
  worktree change. `ancestry_unknown` remains when the remote cannot serve C.
- Callers of `git()` that pass no signal keep today's bounded transport.
- Surviving coverage that must stay green:
  - the positive journeys for each consumer: GitHub journey, custom, handoff,
    closure-story, trunk-closure, trunk retention and resource;
  - unknown ancestry;
  - B's own failure;
  - listing-error withdrawal (closure GitHub, custom);
  - `ci-command-attempts.test.mjs`.
- Project constraints:
  - Each file stays at 250 lines or fewer. `ci-mailbox-await.mjs`,
    `publication-git.mjs` and `install.sh` are already at 250.
  - A new `install.sh` entry joins a line that already has several entries,
    never a single-entry line; `ci-github-acquisition.test.mjs` anchors those.
  - Observer-journey wait predicates require the exact state that the test
    then asserts.
- Proof runner: `PATH="/opt/homebrew/bin:$PATH" npm test -- <paths>`. Changed
  payload declarations also run `tests/execution-payload-update.sh`,
  `tests/payload-declaration-links.sh` and `tests/install-public-payload.sh`.
- Author runtime guidance in `src/skills/` under [AGENTS.md](../../../AGENTS.md).
  Never hand-synchronize installed copies.
- Accepted ADRs 0001, 0002, 0005 and 0006 apply as in plan 307. The correction
  stays inside the existing coverage, completion and transport owners. No
  North Star topic or ADR change is needed.

## Preparation observations and decisive premises

The retrospective made these observations on 2026-10-15 at `c98d2d22`. The
preparation repeated all three probes on 2026-10-15 in this plan's workspace,
`.worktrees/correct-integrated-state-completion-after-coales` at `dcdc60a9`,
with Node `v24.21.0` matching `.node-version`, and every result below was
reproduced (probe 3 settled after 3,018 ms). The only runtime change between
those revisions is `4902912d`, which changes the cancellation reason in
`ci-background-waiter.mjs` and touches no observed module. Each probe ran in a
disposable `mktemp` directory that was removed afterwards. No source file was
edited, even temporarily; each slice's own mutation checks the discrimination
of its proof.

| Premise | Consuming operation and observation | Result / consequence |
| --- | --- | --- |
| A docs-only B whose basis A was cancelled ends `incomplete`, with or without a policy | Probe 1: real Git (`acceptedWorkflow` with paths-ignore at A, docs-only B, source C), `observeRevisionCoverage` with runs [C success, A cancelled] → `awaitRevision(B)` | With a policy: `state: not_required`, `basis.state: incomplete`, no `integrated`, `unresolvedReason: incomplete`. Without one: the same. Settles finding 1; slice 2 owns the fix. |
| Judging that B as `undiscovered` already yields the intended evidence | Probe 2: `integratedStateJudge(policy, …)` on `{state:'undiscovered'}` and on `{state:'not_required', basis:{state:'incomplete'}}` against a real local remote with C green | `undiscovered` → `integrated.state: success`; `not_required` → no `integrated`. The rule needs no new eligibility logic beyond the state gate and its projection. |
| A pending tip unknown locally is fetched | Probe 2: a fresh checkout lacking C, listed C `in_progress` | `cat-file -e C` was false before and true after the judgement (reason `not_current_success`). Settles finding 2's ordering; slice 3 owns it. |
| An abort during a slow candidate fetch is not honoured until the transport bound | Probe 2 (ssh remote, `GIT_SSH_COMMAND='sleep 30 #'`) and probe 3 (local path remote with `remote.origin.uploadpack` set to a script that sleeps 30 s and then runs `git-upload-pack`); `OPEN_DOUGH_GIT_TRANSPORT_BOUND_MS=3000`; abort at 200 ms | Both settled after about 3,030 ms and threw `stop`. Settles finding 2's abort premise; slice 4 owns it. Probe 3 is also a usable, unpaid proof route: a slow local remote needs no ssh or network. |
| The removed journeys are the only tests of the judge and the GitHub current-attempt reader | `grep -rln 'contradicted\|readCurrentAttempt\|createGitHubAcquisition' src --include='*.test.mjs'` lists only the `ci-integrated-state-{custom,reads,ineligible}` tests and `ci-command-attempts.test.mjs`; `integratedStateJudge` is imported only by `ci-mailbox-revision-coverage.mjs` | `readCurrentGitHubAttempt` (`ci-runs.mjs`) derives `check` from the workflow id and `context` from the event, reads the jobs, and marks a mid-read rerun `contradicted`. Only the journeys to be removed prove that derivation, so slice 1 must add focused provider-boundary proof for it before removing them. |
| The records API is reached through coverage's re-export | `grep -rln 'ci-mailbox-revision-coverage.mjs' src` lists 21 importers, including `ci-mailbox.mjs`, `ci-mailbox-store.mjs`, `ci-mailbox-await.mjs`, the background handoff and waiter, and the wrap-up `trunk-closure-*` and `*integrated-state-cases` files | Slice 5 repoints them. It is a Structure change proved by unchanged behaviour. |

Probe 1, literal:

```sh
PATH="/opt/homebrew/bin:$PATH" node --input-type=module <<'JS'
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path'; import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createMailbox } from './src/skills/dough-execute-plan/scripts/ci-mailbox-location.mjs';
import { registerPushedRevision, observeRevisionCoverage, readRevisionCoverage } from './src/skills/dough-execute-plan/scripts/ci-mailbox-revision-coverage.mjs';
import { awaitRevision } from './src/skills/dough-execute-plan/scripts/ci-mailbox-await.mjs';
import { acceptedWorkflow } from './src/skills/dough-execute-plan/scripts/ci-path-applicability-test-fixtures.mjs';
const scratch = mkdtempSync(join(tmpdir(), 'probe-308-'));
const git = (...a) => execFileSync('git', ['-C', scratch, '-c','user.name=p','-c','user.email=p@e.org', ...a], {encoding:'utf8'}).trim();
try {
  git('init','-q','-b','main'); mkdirSync(join(scratch,'.github/workflows'),{recursive:true});
  writeFileSync(join(scratch,'.github/workflows/ci.yml'), acceptedWorkflow);
  writeFileSync(join(scratch,'app.js'),'a\n'); git('add','.'); git('commit','-qm','A'); const a=git('rev-parse','HEAD');
  mkdirSync(join(scratch,'docs')); writeFileSync(join(scratch,'docs/x.md'),'b\n'); git('add','.'); git('commit','-qm','B'); const b=git('rev-parse','HEAD');
  writeFileSync(join(scratch,'app.js'),'c\n'); git('add','.'); git('commit','-qm','C'); const c=git('rev-parse','HEAD');
  const policy={check:'ci.yml',context:'push'};
  const request={mode:'execution',repo:'owner/repo',branch:'main',maxDurationMs:60000,root:scratch};
  const run=(sha,id,conclusion)=>({headSha:sha,headBranch:'main',databaseId:id,attempt:1,status:'completed',conclusion,event:'push'});
  const runs=[run(c,3,'success'),run(a,1,'cancelled')];
  const readCurrentAttempt=async(r)=>({...r,check:'ci.yml',context:'push',jobs:[]});
  for (const integratedPolicy of [policy, undefined]) {
    const storage=mkdtempSync(join(tmpdir(),'probe-308-s-'));
    const directory=createMailbox(request,{root:scratch,storage}); registerPushedRevision(directory,b);
    await observeRevisionCoverage(directory,runs,request,Date.now(),{repoDir:scratch,integratedPolicy,readCurrentAttempt});
    const rec=readRevisionCoverage(directory)[0];
    let t=0; const res=await awaitRevision(directory,b,{root:scratch,storage,deadlineMs:20,now:()=>t,sleep:async d=>{t+=d},workerLiveness:()=> 'alive'});
    console.log(JSON.stringify({policy:!!integratedPolicy,state:rec.state,basis:rec.basis,integrated:rec.integrated??null,verdict:res.verdict??null,unresolvedReason:res.unresolvedReason}));
    rmSync(storage,{recursive:true,force:true});
  }
} finally { rmSync(scratch,{recursive:true,force:true}); }
JS
```

Output:

```text
{"policy":true,"state":"not_required","basis":{"sha":"10bb5e36…","state":"incomplete"},"integrated":null,"verdict":null,"unresolvedReason":"incomplete"}
{"policy":false,"state":"not_required","basis":{"sha":"10bb5e36…","state":"incomplete"},"integrated":null,"verdict":null,"unresolvedReason":"incomplete"}
```

Probes 2 and 3 used the same `node --input-type=module` form. Each built a bare
`origin.git` in which another clone pushed B and then C, and imported
`integratedStateJudge` directly with `readCurrentAttempt: async r =>
({...r, check:'ci.yml', context:'push'})`. They printed:

```text
{"asUndiscovered":"success","asNotRequired":null}
{"pendingTipFetched":{"before":false,"after":true},"reason":[{"sha":"12960d01…","reason":"not_current_success"}]}
{"abortAt":200,"settledAfterMs":3026,"outcome":"threw:stop","boundMs":3000}
{"route":"local remote with slow uploadpack","abortAt":200,"settledAfterMs":3030,"outcome":"threw:stop","boundMs":3000}
```

The slow upload-pack script was
`#!/bin/sh\nsleep 30\nexec git-upload-pack "$@"\n`, set with
`git config remote.origin.uploadpack <script>` in the observing checkout.

## Outside-in proof ownership

| Promise | Owning slice and observable proof |
| --- | --- |
| Every judge reason, the read and fetch bounds, `attempt_changed`, the every-run rule and per-poll replacement hold at the domain contract | 1: black-box unit tests of `integratedStateJudge` over a real local Git repository and remote. Per-rule mutations fail them. |
| GitHub current-attempt facts (`check`, `context`, jobs, mid-read rerun → `contradicted`) stay proved after the journeys are removed | 1: focused tests of `createGitHubAcquisition().readCurrentAttempt` through the instrumented `gh` fixture. A mutation that removes the contradiction check fails them. |
| A GitHub rerun, pending and then failed, still cannot complete B through the installed command | 1: the one retained GitHub negative journey (the existing rerun case in `ci-integrated-state-ineligible.test.mjs`) |
| An ignored-only B with a replaced or pending basis completes against green C under the policy | 2: a GitHub journey (A cancelled, docs-only B with no run, C green) through the installed `complete-revision`. It returns an `integrated_state` receipt with `accepted` B (`not_required`, basis A `incomplete`), validated C, `count(B) = 0`, `count(C) = 1`, confirmed shutdown, and no B in `unproved`. A unit case covers the `pending` basis. |
| Without a policy, the same B stays `incomplete`; a `success` or `failure` basis is unchanged | 2: a coverage-to-await case with real classification (probe 1's shape) gives `unresolvedReason: incomplete` and no verdict. The judge unit cases show no `integrated` for a `success` or `failure` basis. The existing `ci-revision-coverage-not-required.test.mjs` declared variant stays green. |
| A pending or failed tip is never fetched; a green unknown tip still is, objects only | 3: judge unit cases against a real local remote (`cat-file -e` false for pending and failed, true for green). The existing no-external-fetch closure and trunk cases and their unchanged `for-each-ref` stay green. |
| A stop during a slow candidate fetch confirms shutdown | 4: an installed observer journey whose target remote has a slow `uploadpack` (probe 3's route), with the default transport bound. The stop confirms within the store's terminal deadline, and no Git process from the fetch remains. Withholding the signal (mutation) leaves shutdown unconfirmed. |
| Records do not depend on the judge; readers import records directly; behaviour is unchanged | 5: an import check (the records module imports no `ci-integrated-state*` module, and coverage has no records re-export). The listing-error withdrawal journeys (closure GitHub, custom) and the affected suites stay green. |
| Suite cost goes down | 1: a paired local A/B of the changed jobs under the current load, and `bash scripts/ci-test-times.sh` as the baseline (`tests/time-budget.md`). 2 names the same command for its added journey. |

## Ordered slices

### 1. Prove the integrated-state rule at its domain contract
Type: Structure
Status: done
Proof: The new unit and provider-boundary tests pass and discriminate. The
retained journeys and the affected suites stay green. The paired local timing
of the changed jobs is lower.

Correction: finding 3. The suite proves a pure judgement through spawned
observers, so every reason costs a full observer journey. Move that proof to
the domain contract and keep one GitHub negative journey.

- Add black-box tests of `integratedStateJudge(policy, poll)`. Use a real local
  Git repository for ancestry and a real local bare remote for fetch. Stub only
  `listCandidates` and `readCurrentAttempt`, the provider boundary.
- Cover every reason: `no_candidate`, `ancestry_unknown`, `not_ancestor` skip,
  `facts_mismatch`, `attempt_changed` (including `contradicted`),
  `different_target`, `context_incompatible` (check and context),
  `not_current_success`, `missing_check`, `check_not_successful`,
  `current_attempt_unavailable`, `verification_bound`, the fetch bound,
  `candidate_lookup_unavailable`, and the every-run rule.
- Also cover the read cache (one read per run per poll), per-poll replacement
  of a recorded `integrated`, and the absence of `integrated` without a policy
  or with an ineligible state.
- Add focused tests of the GitHub `readCurrentAttempt` from
  `createGitHubAcquisition` through the instrumented `gh` fixture
  (`ci-github-test-fixtures.mjs`): workflow id to `check`, event to `context`,
  jobs read for `jobs`, and a rerun between reads gives `contradicted`.
- Then delete `ci-integrated-state-reads.test.mjs`. Reduce
  `ci-integrated-state-ineligible.test.mjs` to its rerun pending-then-failed
  journey. Keep the custom rerun journey for `currentCommandAttempt`
  normalization. Delete fixture helpers that become unused.

Mutations, each restored afterwards, must fail the new tests:
- dropping the context comparison;
- dropping `every(succeeded)`;
- raising `verificationBound`;
- treating `contradicted` as current;
- removing the contradiction check in `readCurrentGitHubAttempt`.

Run every `ci-integrated-state*` test, `ci-command-attempts.test.mjs`,
`ci-github-acquisition.test.mjs`, and the surviving consumer journeys listed
under Preserved promises. Compare the changed jobs' paired local times before
and after under the current load, and read the baseline with
`bash scripts/ci-test-times.sh`.

Accepted proof (2026-10-15):
- `ci-integrated-state-judge.test.mjs` and `ci-integrated-state-judge-bounds.test.mjs`
  judge `integratedStateJudge` over a real local history
  (`ci-integrated-state-judge-test-fixtures.mjs`: bare `origin`, `writer`,
  and an `observer` clone that holds only base and B). They cover every
  reason; "not_ancestor skip" and "fetch bound" are observed as
  `no_candidate` and `ancestry_unknown`. `ci-github-current-attempt.test.mjs`
  proves `readCurrentAttempt` through the instrumented `gh` fixture,
  including a mid-read rerun that gives `contradicted`.
- `ci-integrated-state-reads.test.mjs` is deleted, and
  `ci-integrated-state-ineligible.test.mjs` keeps only the rerun
  pending-then-failed journey. No fixture helper became unused.
- Each of the five mutations failed a named new test.
- `PATH="/opt/homebrew/bin:$PATH" npm test --` passed on the
  `ci-integrated-state-*` tests, `ci-github-current-attempt`,
  `ci-command-attempts` and `ci-github-acquisition(-owner)`. It also passed
  on `ci-background-{handoff,lifecycle}`,
  `ci-reuse-{resource,trunk,story,custom}-journey`,
  `ci-revision-coverage-not-required`, and the wrap-up tests
  `closure-story-integration`, `trunk-closure` and
  `closure-story-branch-cleanup`.
- Timing over paired local runs, A/B three times: the changed jobs fell from
  about 27 to about 11 job-seconds. `bash scripts/ci-test-times.sh` (10
  trunk runs) gave ineligible 15.8 s and reads 7.3 s. Share 1 is the
  thinnest, projected from 540.1 against the 710 ceiling.

### 2. Complete an ignored-only revision whose applicable ancestor was replaced
Type: Behavior
Status: planned
Proof: A GitHub journey through the installed `complete-revision` is red first
(`unresolvedReason: incomplete`) and then green with the `integrated_state`
receipt. The no-policy case stays `incomplete`. Mutations fail both.

Behavior: Policy declared; A's run cancelled (replaced); B docs-only with no run
and classified `not_required` on basis A; C green → completion reports "B
published; integrated state validated at C". `accepted` keeps B's
`not_required` state and basis, the terminal `unproved` omits B, and shutdown
is confirmed. Without a policy → `unresolvedReason: incomplete` as today. A
`success` or `failure` basis keeps its verdict.

Make one change in the existing owners:
- the judge's eligibility admits `not_required` with a basis state of
  `incomplete` or `pending`;
- `effectiveCoverage` lets that revision's integrated success take precedence
  over its basis outcome;
- `unresolvedRevisions` omits a `not_required` revision whose integrated state
  succeeded.

Keep `ci-mailbox-await.mjs` within 250 lines, for example by projecting
integrated success before the `not_required` split. Add the basis cases to the
slice 1 unit tests.

Build the journey with the existing integrated-state fixtures. A publishes the
`paths-ignore` workflow (`.github/workflows/ci.yml`) and a source change, and
its run is cancelled with no jobs. B changes only `docs/`. C changes source and
runs the counted covered command. Assert the receipt with `deepEqual`. Put the
no-policy case at the coverage-to-await boundary with real classification;
probe 1 has its shape.

Mutations, each restored afterwards:
- removing the new eligibility fails the journey;
- ignoring the policy gate fails the no-policy case.

Update the comment in `ci-revision-coverage-not-required.test.mjs`: a declared
policy still never applies to a `success` basis. Update one clause in
`references/ci-completion-wait.md` or `references/runtime-setup.md`: an
ignored-only revision whose applicable ancestor was replaced can complete
under the policy.

Run every `ci-*`, `watch-*`, `execution-increment-*` and `ci-reuse-*journey`
test, plus the `dough-story-wrap-up/scripts/*closure*.test.mjs` consumers. Run
the payload tests if declarations change. Read the time baseline with
`bash scripts/ci-test-times.sh` for the added journey.

### 3. Fetch only candidates that can validate
Type: Behavior
Status: planned
Proof: Judge unit cases show pending and failed tips stay unfetched while a
green unknown tip is fetched once, objects only. Moving the success check back
after ancestry (mutation) fails the pending-tip case.

Behavior: A candidate whose listed attempts are not all successful, or whose
ancestry is already known locally, is never fetched. A green unknown C is
fetched once, objects only, and then completes B.

Change the judge so that `listed.every(succeeded)` is checked before ancestry
needs a fetch. A local ancestry answer for a pending tip still costs no fetch,
and a known non-descendant is still skipped. A locally unknown tip that is not
all-successful is reported as `not_current_success` without a fetch (see
Current decisions). Check every consumer that asserts `considered` lists:
`waitingTips`, the closure and trunk integrated-state cases, and the custom
journeys. Add the fetch cases to the slice 1 unit tests.

Update the fetch sentence in `references/ci-completion-wait.md`. Run every
`ci-integrated-state*` test, the slice 2 consumer set, and the payload tests
if declarations change.

### 4. Stop the candidate fetch with the observation
Type: Behavior
Status: planned
Proof: An installed observer stopped during a slow candidate fetch confirms
shutdown within the store's terminal deadline, and no Git process from the
fetch remains. Withholding the signal (mutation) leaves shutdown unconfirmed.
`publication-transport-bound.test.mjs` gains an abort case and stays green.

Behavior: When the observation stops during a candidate fetch, the fetch's
process group is killed, the observer publishes its terminal result within the
stop deadline, and shutdown is confirmed. The closure can then retire as its
other gates allow. Callers of `git()` that pass no signal keep today's bounded
transport.

Change the code as follows:
- Let `git()` and `boundedTransport` accept an optional `signal`; on abort,
  terminate the group as the bound does.
- Pass the observation signal from `fetchCandidate`.

`publication-git.mjs` is at 250 lines. Compact it, or extract the transport
into a module declared on a multi-entry line of `install.sh`, which is also at
250. Add the abort case to `publication-transport-bound.test.mjs`.

In the observer journey, the observing checkout's target remote has the slow
`uploadpack` from probe 3. That script writes a start marker, and the wait
predicate requires the marker before the stop. C must be green and unknown
locally.

Run the slice 2 consumer set, the transport and managed-delivery transport
tests, `ci-reuse-resource-journey.test.mjs`, and the payload tests if
declarations change.

### 5. Keep revision records independent of the integrated-state rule
Type: Structure
Status: planned
Proof: The import check passes, and the listing-error withdrawal journeys and
affected suites stay green.

Correction: finding 4. Storage depends on the judgement module, and the coverage
re-export hides the records owner.

- Repoint every reader of `listRegisteredRevisions`, `readRevisionCoverage`
  and `registerPushedRevision` (including the `ci-mailbox.mjs` facade and the
  wrap-up scripts) to `ci-mailbox-revision-records.mjs`. Drop coverage's
  re-export.
- Build the withdrawal record without the records module importing
  `ci-integrated-state.mjs`. For example, move `withdrawIntegratedState` to
  coverage, which owns judgement, as its own export.
- Move the dangling comment in `ci-mailbox-store.mjs` onto the filter it
  describes.

Proof is behaviour unchanged: a focused import assertion, the listing-error
withdrawal journeys (closure GitHub, custom), and the slice 2 consumer set.
Run the payload tests if declarations change.

## Current decisions

- Without a policy, nothing changes. A `success` or `failure` basis keeps
  today's rule.
- A `pending` basis is treated like an `incomplete` one. An unresolved
  (absent) basis state stays as today: no finding covers it.
- No custom-provider change: a replaced custom A has no attempt, so B is
  already judged as `undiscovered`. After slice 2, both providers agree.
- The no-policy case for slice 2 is proved at the coverage-to-await boundary,
  not with a second journey. Its outcome path is unchanged code, and finding 3
  asks for fewer journeys.
- A locally unknown tip whose listed attempts are not all successful is
  reported as `not_current_success`, not `ancestry_unknown`. That reason
  disqualifies it whatever its ancestry, so no fetch is needed to explain it.
- The order puts the unit harness first, so slices 2, 3 and 4 add only unit
  cases or one journey each.
- Fetch ordering (slice 3) and fetch abort (slice 4) are separate slices: each
  has its own proof loop, and only the abort needs the transport change behind
  the 250-line `publication-git.mjs` limit.

## Learnings

- Slice 1: in-process GitHub reader tests can each `enter()` their own
  `instrumentedGithubFixture()`. The request owner rebinds its endpoint
  when the `DOUGH_GITHUB_*` environment changes, so tests in one file do
  not interfere. `judge-bounds` costs about 4 s locally because it builds
  real histories with sibling branches.
