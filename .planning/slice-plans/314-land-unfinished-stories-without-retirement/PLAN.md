# Land unfinished story changes without retiring their execution workspace

**Identity:** SEED-008#land-unfinished-stories-without-retirement
**Source:** [refined story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#land-unfinished-stories-without-retirement)

## Goal and scope

A developer can land an intermediate reviewed story result while retaining the
same execution workspace, branches, assignment and dashboard continuation.
Ordinary Dough Land refuses unfinished execution before commit or publication;
explicit `--keep-worktree` lands through existing operations without implying
completion. Missing or ambiguous completion evidence cannot permit retirement.
Taken membership alone proves neither incomplete implementation nor completion.

Include optional safe default-checkout refresh, truthful unfinished reporting,
already-accepted reruns, publication failure recovery, and preservation of
published Story Branch history. Completed execution keeps wrap-up's gates;
ordinary work and completed preparation keep their existing landing behavior.

Exclude a new skill, parallel publication or retention lifecycle, new execution
mode or story state, automatic conversion between modes, automatic story closure,
a redesigned dashboard acknowledgment mechanism, release creation, and recovery
or closure of the reported Pygardon story. Execution has not been authorized by
this preparation. No native-host integration mechanism changes are planned.

## Current decisions and architecture

- Follow the source story's Terry decisions of 2026-10-18. Source guidance is authored in `src/skills/`, not this repository's installed managed copies; see [AGENTS.md](../../../AGENTS.md) and [ADR 0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md).
- [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md) requires one domain-coherent representation. PFE found existing owners for publication, optional refresh, completion interpretation and retirement. Reuse them; expose a suitable shared part only if the integrated example needs it.
- [ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md) requires one authoritative runtime rule, addressed to the agent's established project. Put the completion/retention choice in Dough Land and link to existing completion, publication, refresh and reporting contracts rather than copying their workflows. Review discovery description, rerun table and references too.
- Follow [North Star — Remote history and optional local refresh](../../NORTH-STAR.md#remote-history-and-optional-local-refresh). Publication, ownership, completion and CI coverage are distinct. ADRs 0007, 0008 and 0009 remain Proposed. No new North Star topic or ADR change is needed.
- PFE: `dough-execute-plan/scripts/execution-increment-publication.mjs` owns unpublished-suffix publication. `history-preserving-publication.mjs` owns integration of an already-published tip and returns to the execution branch. `maintain-default-checkout.mjs` owns safe refresh. All are under `src/skills/`. The retained landing uses these boundaries without importing execution's whole managed-delivery workflow or changing its destination/observer policy.
- `dough-land/scripts/worktree-retirement.mjs` owns deletion after caller gates; ownership and containment alone are not completion evidence. The caller must not enter retirement for a retained landing. Completion judgment reuses wrap-up's execution-completion contract, the backlog plan reader and `dough-execute-plan/scripts/story-obligations.mjs` where applicable. No new persistent completion grammar is warranted. Planless completion is judged from its instruction and results, not absence of a plan.
- `dashboard/src/completionReport.ts` and the completion receiver already keep landing capture separate from explicit completion and session acknowledgment. Retained unfinished execution reports `unfinished` with a useful next action; it does not send quiet `completed`, release the profile, remove Taken, or remove the plan. Manual Done remains local session acknowledgment.
- A preparation assignment is not an execution assignment. Completed queued preparation must still release and retire under its existing journey. A completed execution still Taken must be judged from its actual obligations; this story gives no authority to perform wrap-up merely by landing.


## Investigation and decisive premises

Preparation observations used this same checkout at `34d60fa2c669efa63bf9d2a0a90a6371298ef755`,
on 2026-10-18, disposable bare remotes, and synthetic hosts. No Pygardon operations or native launches ran;
source scratch edits were restored. These are baselines, not proof of the new caller policy.

1. **Retirement gap:** a `node --input-type=module` observation used `createCleanTrunkFixture`
   (`src/skills/dough-execute-plan/scripts/publication-test-fixtures.mjs`) and `landWorktree` /
   `runRetirementCommand` (`src/skills/dough-story-refinement/scripts/dough-land-test-fixtures.mjs`).
   A committed Taken entry and `.planning/PLAN.md` final `Status: planned` were pushed with
   `git push origin HEAD:refs/heads/exec/story`. `landWorktree({worktree: f.execution, branch: 'exec/story', createdForWork: true})`
   removed the worktree/local branch after acceptance; `runRetirementCommand({repository: f.integration, worktree: f.execution, branch: 'exec/story', createdForWork: true, remoteBranch: 'exec/story'})`
   removed the remote branch. `git show origin/main:.planning/PLAN.md` still showed the planned slice. Fixture cleaned up.
2. **Existing Git owners:** `node --test src/skills/dough-execute-plan/scripts/execution-increment-publication.test.mjs src/skills/dough-story-wrap-up/scripts/closure-story-integration.test.mjs src/skills/dough-land/scripts/worktree-retirement.test.mjs`
   passed 28 tests: real refs, reruns, preserved published merge history, branch restoration, conflict recovery and retirement.
3. **Obligations:** `node --test src/skills/dough-execute-plan/scripts/story-obligations.test.mjs`
   passed 7 tests, including an open obligation refused after all slices done. Counts alone are insufficient.
4. **Dashboard:** `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/boundary/story-branch-landing-capture.spec.ts dashboard/tests/boundary/story-branch-landing-later-publication.spec.ts dashboard/tests/agent-launch-done-question.spec.ts --workers=2`
   passed (quiet, exit 0): installed integration/receiver, restored branch, merge parents, no completion/Done,
   zero-push rerun, later publication without original context, and unfinished acknowledgment question.
   Initial missing Vite was resolved with checkout-local `npm ci --ignore-scripts --no-audit --no-fund`; NO_COLOR was unset.
5. **Discrimination:** temporarily returning at `returnToBranch` entry in `history-preserving-publication.mjs`, then
   `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/boundary/story-branch-landing-capture.spec.ts --grep 'records the fetched trunk tip' --workers=1`
   failed at line 87 (detached branch); exact source restoration and the same command passed.

No factual premise requires a paid probe. New ordinary refusal and retained-landing-to-resume behavior still require red/green proof.

## Outside-in proof ownership

| Promise / example | Owner and observable proof |
| --- | --- |
| 13 of 14 slices done, ordinary land | Slice 1: refusal before commit, index change or push; unchanged HEAD/remote refs, resources and assignment; explanation names remaining work and explicit retention option |
| Missing/ambiguous evidence; all slices done with an open obligation | Slice 1: no retirement and precise missing/completion evidence; Taken alone never decides |
| Completed execution still Taken; ordinary work; completed preparation | Slice 1: correct distinction using actual obligations; no fabricated completion, and existing preparation release and ordinary landing remain valid |
| Explicit retained landing | Slice 2: trunk contains reviewed content; same worktree/local branch, existing remote execution branch, Taken/profile/plan and session remain; same mode and continuation identity |
| Published Story Branch history, trunk advance and optional refresh | Slice 2: original published SHAs remain ancestors; safe refresh or independent deferral; human default-checkout bytes untouched |
| Rerun, lost response, conflict and rejected publication | Slice 2: no duplicate commit/push after acceptance; conflict/failure retains recoverable resources and exact unfinished step |
| Dashboard continuation and acknowledgment | Slice 2: unfinished report with no automatic Done; same session can continue with the pending slice; manual Done changes no story/plan/assignment bytes |
| Completed story closure after retained landing | Slice 2: existing wrap-up completion/CI/ownership gates still own eventual retirement; retention is not a new permanent lifecycle |
| Shared behavior across supported hosts | Both slices: representative behavior review under AGENTS.md and ADR 0005; reused shared integration mechanism, no native success inferred from deterministic fixtures |

## Ordered slices

### 1. Refuse ordinary landing of unfinished execution before changing Git
Type: Behavior
Status: done
Accepted: Production planned-completion CLI and real disposable Git refusal/rerun observations passed; see accepted slice 1 evidence below.
Proof: Review the skill's invocation with pending-slice, open-obligation,
unknown-evidence and completed-work examples; exercise the existing landing
boundary with before/after Git, plan and assignment observations. Preserve
ordinary and preparation landing regression cases.

Behavior: An execution workspace has remaining promised work or lacks completion
evidence → ordinary Dough Land is invoked → before committing or publishing it
identifies the unfinished work or missing evidence, retains resources, and names
`--keep-worktree` as the explicit way to land an increment. Taken alone is not a
refusal or completion signal. Completed execution remains subject to its owning
completion gates; generic reviewed work and completed preparation retain their
existing behavior.

Work: Add the choice at Dough Land's pre-commit boundary and align discovery,
retirement and rerun instructions. Reuse completion and obligation interpretation.
Keep agent judgment about evidence in guidance; add runtime enforcement only at
an existing boundary that can consume reliable inputs, without inventing a
complete story classifier. Extend the current landing test support when needed,
but do not count a helper's hard-coded refusal as native guidance proof. Walk the
new skill behavior against AGENTS.md, including genuinely missing context.

Verification: new refusal observations fail before the change and pass after it;
assert no new commit/push and unchanged index/worktree/assignment. Run the relevant
`src/skills/dough-story-refinement/scripts/dough-land*.test.mjs` and
`src/skills/dough-land/scripts/*.test.mjs` consumers, plus obligation/plan-reader
checks if their interpretation changes. Interim safe boundary: ordinary landing
protects ongoing execution; the explicit retention path is delivered by slice 2.
Do not report that path as implemented until its proof passes.

### 2. Land an explicit increment and continue the same unfinished execution
Type: Behavior
Status: done
Accepted: Installed publication/reporting/terminal/Done journey, real Git retained variants, ownership-race guard and existing closure regressions passed; see accepted slice 2 evidence.
Proof: One integrated retained-landing journey with real disposable Git and the
real dashboard boundary, followed by the next instruction in the same workspace;
boundary variants prove history, recovery and acknowledgment details.

Behavior: The developer invokes Dough Land with `--keep-worktree` for reviewed
unfinished story changes → existing publication accepts them on the authorized
trunk and optional refresh is attempted → resources and execution identity remain,
the story stays Taken, and an unfinished dashboard report leaves its next slice
usable. Repeating after acceptance pushes nothing. Later completion proceeds
through ordinary wrap-up's gates.

Work: Retain resources at the existing caller boundary. Reuse unpublished-suffix
publication for an unpublished increment and history-preserving integration for
an already-published story tip, including a local unpublished suffix above it;
never rebase the published prefix. Preserve authorization, proof and observer
obligations without importing managed execution or changing modes. Retain the
original launch context for its first trunk landing and use the existing
reporting-only retry after evidence failure. Do not add another landing for later
publications. Ensure rerun and completion-attention wording obey the same rule.
Do not release an execution assignment or call retirement on this path.

Verification: Extend the real integration setup in
`dashboard/tests/support/storyBranchIntegration.ts` and its boundary specs so the
pending slice and claim are preconditions, while retained resources, unfinished
report and usable continuation are outputs. Drive the dashboard continuation
operation with the same identity/workspace and demonstrate a subsequent commit
on the same execution branch; do not inject the post-landing resource result.
Observe manual acknowledgment through the existing endpoint/page and compare
repository plan/claim bytes before and after. Cover ordinary Trunk Mode retention
through the current increment fixture and preserve Story Branch mode separately.
Use one representative page journey only if the page effect needs new coverage;
detailed failure/retry cases belong at the boundary under
[dashboard test guidance](../../../dashboard/tests/README.md).

Run the relevant complete landing/publication/history-integration suites and the
selected dashboard continuation/reporting suites, including the literal baseline
commands above. Prove retained rerun, trunk advance with published history, an
unpublished suffix above a published tip, conflict/failed push, absent or dirty
default checkout, and accepted-publication/reporting failure at their existing
owners. Reuse sufficient unchanged baseline evidence; any changed consumer needs
its affected proof. Existing wrap-up/retirement tests must still require their
completion gates. Walk final guidance through ordinary refusal, explicit retained
landing, completed preparation and completed-story closure.

## Delivery and review

Use dough-execute-plan when execution is authorized. Each slice includes outside-in
proof, independent post-change refactoring, applicable tests, agent commit and the
selected execution mode's publication/CI duties under the installed execution
workflow. Hook-owned lint remains in the commit hook. AGENTS.md's representative
behavior review is the local skill-authoring gate; hosted CI configuration alone
does not require every suite locally. If a new installed runtime dependency is
necessary, include it through the existing payload declaration and run the real
delivery checks that dependency affects. Do not hand-sync installed copies.

The cumulative rule is one completion/retention choice before landing, followed
by existing publication/refresh owners and disposition. The two slices separate
a safe ordinary refusal from an explicit usable increment; they do not create
per-mode lifecycle implementations. No speculative Structure slice is needed.
No numeric target or hard limit is supplied; each slice has one cohesive behavior
and proof loop with existing reusable machinery. No slice-plan refinement is
needed: no remaining boundary, proof-ownership or cumulative-design concern was
identified. Execution must return new evidence that invalidates these premises
for reassessment rather than extending a parallel solution.

## Learnings

The reproduced failure is loss of execution resources while story state correctly
remains unfinished. Dashboard publication capture already keeps completion
separate; the new caller must preserve that rule. Keep deterministic evidence
separate from native guidance-following claims. All implementation and new
acceptance proof remain planned.

## Story obligations

### G1. Explicit retained publication awaits slice 2
Reported: slice 1 — "Slice 2’s retained publication/dashboard continuation path is still unfinished; this slice only names its explicit --keep-worktree choice."
Story clause: "The developer can publish reviewed story changes to trunk while keeping the unfinished story's workspace, branches, assignment and dashboard continuation usable."
Disposition: proved by slice 2: dashboard/tests/boundary/story-branch-retained-landing.spec.ts observes retained refs/records, unfinished reporting, same-session terminal instruction and subsequent same-branch commit; dough-land-retained.test.mjs observes Trunk publication/refresh/rerun and published-prefix/local-suffix retention.

### G2. Native evidence boundary
Reported: slice 2 — "No fresh native-host skill-following run was performed or claimed; deterministic boundaries do not establish native guidance-following success."
Story clause: "The developer can publish reviewed story changes to trunk while keeping the unfinished story's workspace, branches, assignment and dashboard continuation usable."
Disposition: no user cost "The developer can publish reviewed story changes to trunk while keeping the unfinished story's workspace, branches, assignment and dashboard continuation usable.": AGENTS requires representative behavior review for this conventional skill change, which passed; no native-host integration mechanism changed. Evidence is explicitly bounded to that review and deterministic shared integration, without inferring native success.

## Execution context

- Identity `SEED-008#land-unfinished-stories-without-retirement`, publisher `dashboard-territory.local-open-dough`, agent `jackson-chan`; established Story Branch mode, existing owned linked worktree.
- Originating/execution checkout `/Users/terryyin/git/open-dough/.worktrees/land-unfinished-story-changes-without-retiring-t`, branch `codex/land-unfinished-story-changes-without-retiring-t`; optional default `/Users/terryyin/git/open-dough`.
- Claim accepted on `origin/main`: `50d0a60328a8bd562b1208a564092363095832a5`; starting revision `4696074d507276591fadcd2e9618a3acae3ef93f`. Initial candidate/first increment base is the claim. Slice 1 accepted at `100e12a4b44e7b43477b1f411d138813d2b4b32d` on the remote execution branch, with that claim as suffix base; observation reused the retained stream. This accepted SHA is the next increment base.
- Node `24.21.0`; checkout-local `npm ci --no-audit --no-fund`, `node scripts/setup-native.mjs browser` / `check`, and `npm run typecheck:dashboard` passed. Plain npm preceded discovery of the bounded wrapper and completed in 27 seconds.
- CI GitHub Actions `terryyin/open-dough`, verified `ci.yml` / `CI`; Codex coordinator `jackson-chan-plan314`, directory `/tmp/dough-ci-501/watch-lGhjoP`, PID `25708`, session `34572`, cell `14`, bound to this checkout/remote execution branch. Prior trunk claim is `pendingCi: unobserved` by this observer.
- No numeric slice limit/exception or replanning override supplied; existing planning authority retained. Scope aligned. Commit hook is check-only staged lint and dashboard typecheck. Ordinary tests use `PATH="/opt/homebrew/bin:$PATH" npm test -- <paths>` under `tests/README.md`, superseding direct baseline `node --test` examples.

## Accepted slice 1 evidence

- Red runner: `PATH="/opt/homebrew/bin:$PATH" npm test -- src/skills/dough-story-refinement/scripts/dough-land-completion.test.mjs src/skills/dough-execute-plan/scripts/story-obligations-completion.test.mjs` reproduced ordinary pending/ambiguous/open-obligation/accepted-rerun retirement and unknown CLI option before implementation.
- Green: `PATH="/opt/homebrew/bin:$PATH" npm test -- src/skills/dough-story-refinement/scripts/dough-land*.test.mjs src/skills/dough-land/scripts/*.test.mjs src/skills/dough-execute-plan/scripts/story-obligations*.test.mjs tests/support/product-backlog-plan-reader*.test.mjs tests/support/product-backlog-plan-completion.test.mjs tests/payload-declaration-links.sh` passed.
- `dough-land-completion.test.mjs` supplies committed pending plans and rendered claim/profile as preconditions; production checker runs before staging. `assertCheckoutUnchanged`, remote heads and byte comparisons observe untouched HEAD/index/edits, refs, plan, claim and profile. Completed Taken work passes recorded completion while caller retirement hold retains resources. CLI tests observe malformed/empty/duplicate plans and existing open obligations.
- Independent refactor extracted JSON CLI test adapters, preserving public exports. Its rerun passed all landing/retirement suites, preparation assignment reuse/land/remote-base/retry/publication/handoff, one-shot refinement, closure cleanup, lightweight auto-land/default-checkout and bug retained-artifacts consumers; `npm run typecheck:dashboard` passed. Checker/readers and representative guidance proof stayed unchanged. `git diff --check` and `npm run format` passed after a mechanical unused-parameter repair.
- AGENTS behavior walk covered ordinary pending/missing proof refusal, planless judgment, completed execution still Taken and completed preparation. Deterministic checker/Git proof is not native-host guidance evidence. G1 keeps slice 2’s retained publication/continuation unaccepted.

## Accepted slice 2 evidence

- `PATH="/opt/homebrew/bin:$PATH" npm test -- src/skills/dough-story-refinement/scripts/dough-land*.test.mjs src/skills/dough-land/scripts/*.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-publication.test.mjs src/skills/dough-story-wrap-up/scripts/closure-story-integration.test.mjs` passed. New retained cases initially refused completion; the published-story rival Take initially reached reconciliation conflict. New onFetchedTarget callback now refuses ownership before each rewrite/retry. New lost-response branch assertion initially saw detached HEAD; accepted rerun now restores its branch.
- `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/boundary/story-branch-retained-landing.spec.ts dashboard/tests/boundary/story-branch-landing-conflict.spec.ts dashboard/tests/boundary/story-branch-landing-context.spec.ts dashboard/tests/boundary/agent-terminal-boundary.spec.ts dashboard/tests/boundary/agent-launch-done.spec.ts --workers=2` passed. Pending plan and real installed claim are preconditions. Assertions observe installed publication ancestry, complete local suffix, preserved refs/record bytes, unfinished receipt/no Done, WebSocket input to existing session causing real next commit in its saved cwd/branch, and manual Done preserving repository bytes and refs.
- `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/boundary/story-branch-landing-capture.spec.ts dashboard/tests/boundary/story-branch-landing-later-publication.spec.ts dashboard/tests/agent-launch-done-question.spec.ts --workers=2` passed on final behavior: accepted lost-response branch restoration, one push, reporting-only retry, original comparison and later publication without its landing context.
- `PATH="/opt/homebrew/bin:$PATH" npm test -- src/skills/dough-story-wrap-up/scripts/closure-story*.test.mjs src/skills/dough-story-wrap-up/scripts/trunk-closure*.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-publication*.test.mjs src/skills/dough-execute-plan/scripts/publication-resume*.test.mjs src/skills/dough-execute-plan/scripts/publication-checkout*.test.mjs tests/payload-declaration-links.sh` passed; existing conflict, failed-push, missing/dirty default and closure CI/shutdown/ownership gates remain. Guidance/payload/tests/install.sh and `npm run typecheck:dashboard` passed.
- Independent refactor reused the identical existing isAncestor helper and compacted installer declarations. `PATH="/opt/homebrew/bin:$PATH" npm test -- src/skills/dough-story-refinement/scripts/dough-land-retained.test.mjs src/skills/dough-land/scripts/queued-closure-check.test.mjs src/skills/dough-story-wrap-up/scripts/closure-story-integration*.test.mjs src/skills/dough-story-wrap-up/scripts/closure-story-branch-cleanup.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-story-journey.test.mjs tests/payload-declaration-links.sh tests/install.sh` passed after that substitution. Earlier dashboard proof remains sufficient: ancestry function behavior, product/setup/fixtures/assertions unchanged; extra import is pure and already delivered.
- Supplemental dashboard runs exhausted existing 30-second deadlines under contention, not failed publication assertions: initial overlapping full-CPU node proof yielded load 41.87, branch assertion passed at 29.53s then restart timed out. Later five-spec repeat encountered another worktree's `dashboard-repeat.sh 3 --load` with 16 CPU burners and load 84–104; six cases timed out during launch, later-publication passed initial landing then expired during repair setup, retained case passed through rerun then expired before reporting. Cleanup caused socket/missing-cwd/module errors. Traces were inspected; no deadline changes, other-process mutations or blind retry. The redundant repeat is a process deviation, not an added acceptance gate.
- AGENTS representative behavior review passed ordinary refusal, explicit retention, completed preparation, missing evidence and eventual wrap-up. New publication reference is declared; no fresh native-host guidance-following claim (G2). `npm run format` and `git diff --check` passed; changed files remain at most 250 lines.

## Retrospective

Reviewed earliest execution-ready source/plan at `4696074d`, claim `50d0a603` as provenance, and attributable implementation commits `100e12a4` / `1317f9fc`; the range has no intervening unrelated work. Source contract, final aggregate implementation, callers, whole-product publication/closure seams and tests remain aligned with Accepted ADRs 0002/0003/0005/0006 and the cited North Star. No product defect, architecture conflict or correction plan is supported. Existing dashboard performance priorities need no new duplicate story.
Process review used coordinator records and agent handoffs. Added one occurrence each under existing ODF-209 (shared-host contention), DD-292 (unchanged consumer proof repeated), and DD-309 (global formatting); DearDough.md measured 550 to 574 physical lines, so its 500-line warning applies. No new finding IDs, backlog edits or process implementations. Supplemental failed runs were diagnosed, not hidden or blindly retried; unchanged accepted proof was reused.
Both slices and G1 are delivered; G2 bounds native claims. Last accepted implementation `1317f9fc17802659c5059bbb51251f88483fdc76`, suffix base `100e12a4b44e7b43477b1f411d138813d2b4b32d`, same execution-branch target and observer. Review conclusions remain conditional on the final registered revision's CI completion receipt. Plan, Taken assignment and execution resources remain for story wrap-up.

## Execution complete

Product advice: No new product follow-up recommended; preserve the established separate publication, completion and retirement gates. Existing dashboard performance work remains prioritized.
