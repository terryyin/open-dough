# Source-only review

Reviewer: `/root/source_review`, fresh `fork_turns: none` launch in this execution on 2026-11-12. The inspectable launch and return are in the coordinator conversation under that task name. Input: selected story Goal, Scope, restrictions, boundaries and key examples, followed by an exact-source wording correction; no plan, implementation, proof or suspected omission supplied. The reviewer was told to use only supplied text, read no files, change nothing and return numbered individual commitments, qualifications, journey examples and exclusions, without slice ownership. It confirmed no project files were read or changed. This table retains its numbered return; slice allocation and subsequent observations belong to the coordinator.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | Automatic check: A project using custom CI receives the existing automatic slowdown check on qualifying landings after declaring a rebuild trigger. | slice 4 | |
| C02 | Automatic repeat: A slow qualifying landing is repeated once on custom CI without manual retry. | slice 4 | |
| C03 | Declaration type: `ciRebuild` is a string array. | slice 2 | |
| C04 | Declaration location: `ciRebuild` sits beside `ciAdapter` in the project’s existing `.planning/open-dough.json`. | slice 2 | |
| C05 | Launch location: The command launches from the project checkout, like `ciAdapter`. | slice 2 | |
| C06 | Launch mechanism: The command launches without a shell. | slice 2 | |
| C07 | Request transport: The command receives one JSON request on stdin. | slice 2 | |
| C08 | Response transport: The command emits one JSON value on stdout. | slice 2 | |
| C09 | Diagnostics: Diagnostics go to stderr. | slice 2 | |
| C10 | Time bound: The command has the same 20-second bound. | slice 2 | |
| C11 | Output bound: The command has the same 64 KiB bound. | slice 2 | |
| C12 | Request operation: The production dashboard request specifies `operation: rebuild`. | slice 2 | |
| C13 | Request check: The production dashboard request contains `check: {repo, branch}`. | slice 2 | |
| C14 | Request attempt: The production dashboard request contains `attempt: {runId, attemptId, sha}`. | slice 2 | |
| C15 | Original identity: The requested original landed attempt is named exactly as `discover` listed it. | slice 2 | |
| C16 | Requested work: The request asks for one full check of that revision as a new attempt. | slice 2 | |
| C17 | Accepted result: `{"result":"accepted","attempt":{"runId","attemptId","sha"}}`. | slice 2 | |
| C18 | Admission attribution: The accepted attempt is the new attempt admitted by this request. | slice 2 | |
| C19 | Discovery identity: The accepted attempt uses the identity under which `discover` lists it. | slice 2 | |
| C20 | Refusal: `{"result":"refused","reason":"…"}` when no new attempt was admitted. | slice 3 | |
| C21 | Uncertainty: `{"result":"uncertain","reason":"…"}` when admission cannot be settled. | slice 3 | |
| C22 | Nonzero exit: A nonzero exit counts as uncertain. | slice 3 | |
| C23 | Timeout: A timeout counts as uncertain. | slice 3 | |
| C24 | Oversized output: Oversized output counts as uncertain. | slice 3 | |
| C25 | Invalid answer shape: An answer outside the accepted, refused or uncertain shapes with their `result` discriminator counts as uncertain. | slice 3 | |
| C26 | The dashboard follows the accepted attempt through the existing `discover` and `proof` reads. | slice 2 | |
| C27 | Exact repeat identity: A full comparable repeat must be the exact accepted attempt. | slice 2 | |
| C28 | Different attempt: Its `attemptId` must differ from the original’s. | slice 3 | |
| C29 | Same revision: Its `sha` must match the original’s. | slice 3 | |
| C30 | Same check: Its check must match the check named by the original. | slice 3 | |
| C31 | Same context: Its context must match the context named by the original. | slice 3 | |
| C32 | Ordering: It must start after the original completed. | slice 3 | |
| C33 | Successful outcome: It must succeed. | slice 3 | |
| C34 | Time bounds: It must have both time bounds. | slice 3 | |
| C35 | Comparable proof: Its proof must be as complete as the original’s. | slice 3 | |
| C36 | Existing threshold: The existing 5% rule applies. | slice 2 | |
| C37 | Saved reference: The repeat is judged against the same saved reference. | slice 2 | |
| C38 | Allowance timing: The one-request allowance is spent before invoking the trigger. | slice 2 |  |
| C39 | Deduplication: Existing deduplication behavior applies. | slice 2 |  |
| C40 | Recent presentation: Existing “Recently done” wording applies. | slice 4 | |
| C41 | Review navigation: The existing review route applies. | slice 4 | |
| C42 | Review run identity: Review shows each attempt’s run identity. | slice 4 | |
| C43 | Review attempt identity: Review shows each attempt’s attempt identity. | slice 4 | |
| C44 | Review check: Review shows each attempt’s check. | slice 4 | |
| C45 | Review revision: Review shows each attempt’s revision. | slice 4 | |
| C46 | Review bounds: Review shows each attempt’s bounds. | slice 4 | |
| C47 | Review duration: Review shows each attempt’s wall time. | slice 4 | |
| C48 | Review proof: Review shows each attempt’s proof completeness. | slice 4 | |
| C49 | At-most-once request: The dashboard sends at most one rebuild request per landing. | slice 3 | |
| C50 | Refusal explanation: Refusal leaves an unverified explanation. | slice 3 | |
| C51 | Uncertainty explanation: An uncertain answer leaves an unverified explanation. | slice 3 | |
| C52 | Interruption explanation: Interruption leaves an unverified explanation. | slice 3 | |
| C53 | No retry after refusal: A refused request is never resent. | slice 3 | |
| C54 | No retry after uncertainty: An uncertain request is never resent. | slice 3 | |
| C55 | No retry after interruption: An interrupted request is never resent. | slice 3 | |
| C56 | Document the trigger contract in a custom CI manual beside the existing adapter manual. | slice 4 | |
| C57 | Follow-up documentation: Update `docs/dashboard-ci-follow-up.md`. | slice 4 | |
| C58 | Configuration documentation: Update `dashboard/PROJECT-CONFIGURATION.md`. | slice 4 | |
| C59 | Observer restriction: The execution CI observer never runs `ciRebuild`. | slice 2 |  |
| C60 | Triggering remains outside the observer’s read-only `ciAdapter` contract. | slice 2 |  |
| C61 | Adapter manual ownership: The adapter manual leaves triggering and retrying to the project’s delivery process. | slice 4 | |
| C62 | Adapter-only readings: A custom project without `ciRebuild` keeps its CI readings. | slice 2 | |
| C63 | Adapter-only repeat: Such a project gets no repeat. | slice 2 | |
| C64 | Retained GitHub receipt: The no-repeat behavior also covers an admitted GitHub Actions receipt retained from before `ciAdapter` was configured. | slice 2 | |
| C65 | Maintained proof observes that the collection pass ends without a rerun request. | slice 2 | |
| C66 | GitHub behavior: GitHub Actions retains its built-in trigger. | slice 1 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts real receipt held POST,106-second verdict,restart;16 selected Playwright tests passed |
| C67 | Fixture scope: This story uses a fixture provider. | slice 4 | |
| C68 | Provider admission ownership: The provider owns admission. | slice 1 | observed: dashboard/server/ciFollowUpGithubProvider.ts prepare/submit/observe delegate provider admission to repeatGitHubWorkflow; transport tests passed |
| C69 | Provider queue ownership: The provider owns queue behavior. | slice 1 | observed: dashboard/server/ciFollowUpObservation.ts observes provider queue; automatic-repeat progress assertion passed |
| C70 | Provider outcome ownership: The provider owns build outcome. | slice 1 | observed: dashboard/server/ciFollowUpObservation.ts provider conclusion consumed unchanged; repeat-verdict spec passed |
| C71 | Dashboard decision ownership: The dashboard owns the decision, under ADR0008. | slice 1 | observed: dashboard/server/ciFollowUpCollection.ts repeatDecisionOf retained;policy and automatic-repeat tests passed |
| C72 | Dashboard evidence ownership: The dashboard owns the evidence, under ADR0008. | slice 1 | observed: dashboard/server/ciFollowUpStore.ts and ciFollowUpRetention.ts retain frozen ledger evidence;legacy read ledger test passed |
| C73 | Provider seam: Generalise the delivered GitHub follow-up into one provider seam. | slice 1 | observed: dashboard/server/ciFollowUpProvider.ts and ciFollowUpGithubProvider.ts expose prepare/submit/observe; collection uses configured and retained provider |
| C74 | Flow ownership: The dashboard owns the follow-up flow. | slice 1 | observed: dashboard/server/ciFollowUpCollection.ts retains admission,spend,never-resend and outcome retention;ledger and automatic-repeat specs passed |
| Q01 | Paired configuration: `ciRebuild` applies only together with `ciAdapter`. The text does not prescribe how an unpaired declaration is validated. | slice 2 | |
| Q02 | Shared executable allowed: `ciRebuild` may name the same command as `ciAdapter`. | slice 2 | |
| Q03 | Moved branch: The requested revision must receive the full new check even if its branch has moved on. | slice 2 | |
| Q04 | Queued admission: An accepted attempt may already be listed by `discover` while queued. | slice 2 | |
| Q05 | Existing queued revision: Refusal includes the case where the revision is already queued. | slice 3 | |
| Q06 | Existing running revision: Refusal includes the case where the revision is already running. | slice 3 | |
| Q07 | Conditional provider link: Review shows a provider link when one is listed. | slice 4 | |
| Q08 | Production execution: Only production dashboards trigger CI. | slice 2 | |
| Q09 | Release boundary: Unreleased dashboard code must not act on real CI. | slice 2 | |
| Q10 | Existing landing foundation: This builds on automatic follow-up for the machine recording the landing, with no setting. | slice 4 | |
| Q11 | Retry rationale: A second request could start a duplicate build that cannot be distinguished from the first. | slice 3 | |
| Q12 | Identity precision: Only `attemptId` is expressly required to differ; the text does not require a different `runId`. | slice 3 | |
| Q13 | Timing precision: “Both time bounds” is retained as written; the source does not further define those fields. | slice 3 | |
| Q14 | Examples versus universal conditions: The five reference builds and the particular durations are journey examples. They do not independently establish additional universal admission or rejection rules. | slice 4 | |
| J01 | Persistent slowdown: Configure `ciAdapter` and `ciRebuild`; have five prior exact, complete 100-second builds and an exact successful Done landing of 105 seconds. One rebuild request names that attempt. Acceptance of a new attempt pending discovery produces “CI rerun in progress.” A successful complete repeat of 106 seconds produces “Possible CI slowdown.” Review shows both attempts against the saved reference. | slice 4 | |
| J02 | Returned to range: With the same setup, a successful complete repeat of 98 seconds produces “CI timing returned to range.” Review still shows both attempts against the saved reference. This is an alternative outcome to J01. | slice 4 | |
| J03 | Refused admission: CI refuses because it is not admitting a new attempt. The allowance remains spent, the refusal and reason are shown, and no second request occurs. | slice 3 | |
| J04 | Timeout: The trigger times out. Acceptance remains uncertain, the request is never resent, and no later attempt is attributed to it. | slice 3 | |
| J05 | Partial proof: Partial repeat proof produces the matching unverified explanation and no verdict. | slice 3 | |
| J06 | Failed repeat: A failed repeat produces the matching unverified explanation and no verdict. | slice 3 | |
| J07 | Different revision: A repeat with a different revision produces the matching unverified explanation and no verdict. | slice 3 | |
| J08 | Different check: A repeat with a different check produces the matching unverified explanation and no verdict. | slice 3 | |
| J09 | Adapter alone: Configure only `ciAdapter`. No rebuild request occurs, and CI readings remain available. | slice 2 | |
| X01 | Pygardon trigger: The Pygardon integration story owns its trigger. | slice 4 | |
| X02 | Pygardon proof summary: That integration story owns its complete per-commit proof summary. | slice 4 | |
| X03 | Released real integration demonstration: That integration story owns the real released-dashboard end-to-end demonstration. | slice 4 | |
| X04 | Configurable thresholds: Deferred. | slice 4 | |
| X05 | Adaptive repeats: Deferred. | slice 4 | |
| X06 | Historical backfill: Deferred. | slice 4 | |
| X07 | Cross-machine coordination: Deferred. | slice 4 | |

## Slice 1 acceptance

Source trigger → expected → observed: an admitted exact slow GitHub landing
still sends one full repeat only after durable intent. The held POST assertion
in `landed-ci-automatic-repeat.spec.ts` observes `intent`, one run 71 POST,
duplicate receipt/concurrent collection, progress, 106 s slow verdict, retained
105 s original and no resend after restart. Frozen untagged GitHub request bytes
read with `provider: github`, retain every field and remain spent in
`ci-follow-up-ledger.test.mjs` (failed before schema normalization, passed after).
`ciFollowUpProvider.ts` owns provider selection; its GitHub implementation owns
prepare/submit/observe while collection owns allowance and evidence retention.
Source-review C66/C68–C74 accepted here. C38/C39/C59/C60 allocated to slice 2,
which adds the custom trigger and owes its corresponding observations; current
GitHub proof is retained as preservation evidence. All other custom commitments,
qualifications, journeys and exclusions retain their named later slice owner.

Terminal proof (all passed):

```sh
PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/support/ci-follow-up-ledger.test.mjs tests/support/ci-follow-up-policy.test.mjs tests/support/ci-follow-up-reading.test.mjs
PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh src/skills/dough-execute-plan/scripts/ci-github-workflow-repeat.test.mjs
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts dashboard/backend-tests/intent/landed-ci-follow-up-reading.spec.ts dashboard/backend-tests/intent/landed-ci-repeat-admission.spec.ts dashboard/backend-tests/intent/landed-ci-repeat-receipt-boundary.spec.ts dashboard/backend-tests/intent/landed-ci-repeat-reconciliation.spec.ts dashboard/backend-tests/intent/landed-ci-repeat-verdict.spec.ts dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts dashboard/tests/intent/intent-ci-follow-up.spec.ts --workers=1 --reporter=list
npm run typecheck:dashboard
git diff --check
```

Playwright selected 16 tests in seven extant specs, passed in 2.7 min. Supplier
commit `5987387021227f7a89b1520917dcd3100564b0aa` removed the named
receipt-boundary spec; the current automatic-repeat spec's real receipt,
durable intent, duplicate, concurrency and restart assertions own that proof.
This supplier behavior is already inherited at pinned trunk/base
`1117582709db72b2c3bc842ef4e388d9e6866a8d`; no incoming named sibling change.
Current load at proof launch 17.88, AC and ~14 GiB inactive memory; one worker,
maintained sleep guard. All command owners observed terminal success.
Consumer trace: `/tmp/seed330-slice1-consumer-trace.md`, produced with installed
script against claim SHA and required effect terms plus fixture helpers;
runtime ledger/admission/boundary/retention/read model/collection consumers and
fixture consumers are covered by the commands above. Unrelated plan basename,
historical report, unchanged acquisition and generic workflowId matches are
excluded with dispositions in that inspectable trace. No unresolved gap.
