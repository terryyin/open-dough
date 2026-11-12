# Source-only review

Reviewer: `/root/source_review`, fresh `fork_turns: none` launch in this execution on 2026-11-12. The inspectable launch and return are in the coordinator conversation under that task name. Input: selected story Goal, Scope, restrictions, boundaries and key examples, followed by an exact-source wording correction; no plan, implementation, proof or suspected omission supplied. The reviewer was told to use only supplied text, read no files, change nothing and return numbered individual commitments, qualifications, journey examples and exclusions, without slice ownership. It confirmed no project files were read or changed. This table retains its numbered return; slice allocation and subsequent observations belong to the coordinator.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | Automatic check: A project using custom CI receives the existing automatic slowdown check on qualifying landings after declaring a rebuild trigger. | slice 4 | |
| C02 | Automatic repeat: A slow qualifying landing is repeated once on custom CI without manual retry. | slice 4 | |
| C03 | Declaration type: `ciRebuild` is a string array. | slice 2 | observed: ci-rebuild-configuration.test.mjs paired/shared,absent/empty/unpaired and malformed settings assertions; readCiConfiguration validates beside ciAdapter |
| C04 | Declaration location: `ciRebuild` sits beside `ciAdapter` in the project’s existing `.planning/open-dough.json`. | slice 2 | observed: ci-rebuild-configuration.test.mjs paired/shared,absent/empty/unpaired and malformed settings assertions; readCiConfiguration validates beside ciAdapter |
| C05 | Launch location: The command launches from the project checkout, like `ciAdapter`. | slice 2 | observed: ci-command-rebuild.test.mjs wire/cwd assertion through runAdapterForAttempt/runAdapter execFile; unchanged ci-command-adapter-proof.test.mjs observes transport timeout/default20000 and64KiB bounds, adapter-reasons specs preserve stderr/stdout boundary |
| C06 | Launch mechanism: The command launches without a shell. | slice 2 | observed: ci-command-rebuild.test.mjs wire/cwd assertion through runAdapterForAttempt/runAdapter execFile; unchanged ci-command-adapter-proof.test.mjs observes transport timeout/default20000 and64KiB bounds, adapter-reasons specs preserve stderr/stdout boundary |
| C07 | Request transport: The command receives one JSON request on stdin. | slice 2 | observed: ci-command-rebuild.test.mjs wire/cwd assertion through runAdapterForAttempt/runAdapter execFile; unchanged ci-command-adapter-proof.test.mjs observes transport timeout/default20000 and64KiB bounds, adapter-reasons specs preserve stderr/stdout boundary |
| C08 | Response transport: The command emits one JSON value on stdout. | slice 2 | observed: ci-command-rebuild.test.mjs wire/cwd assertion through runAdapterForAttempt/runAdapter execFile; unchanged ci-command-adapter-proof.test.mjs observes transport timeout/default20000 and64KiB bounds, adapter-reasons specs preserve stderr/stdout boundary |
| C09 | Diagnostics: Diagnostics go to stderr. | slice 2 | observed: ci-command-rebuild.test.mjs wire/cwd assertion through runAdapterForAttempt/runAdapter execFile; unchanged ci-command-adapter-proof.test.mjs observes transport timeout/default20000 and64KiB bounds, adapter-reasons specs preserve stderr/stdout boundary |
| C10 | Time bound: The command has the same 20-second bound. | slice 2 | observed: ci-command-rebuild.test.mjs wire/cwd assertion through runAdapterForAttempt/runAdapter execFile; unchanged ci-command-adapter-proof.test.mjs observes transport timeout/default20000 and64KiB bounds, adapter-reasons specs preserve stderr/stdout boundary |
| C11 | Output bound: The command has the same 64 KiB bound. | slice 2 | observed: ci-command-rebuild.test.mjs wire/cwd assertion through runAdapterForAttempt/runAdapter execFile; unchanged ci-command-adapter-proof.test.mjs observes transport timeout/default20000 and64KiB bounds, adapter-reasons specs preserve stderr/stdout boundary |
| C12 | Request operation: The production dashboard request specifies `operation: rebuild`. | slice 2 | observed: landed-ci-adapter-repeat.spec.ts accepted106/98 cases: real Done receipt after five100s complete builds; exact original rebuild wire, held submission sees durable intent, accepted identity pending gives progress, proof asks exact repeat,105s original/100s saved average yield slow106 or recovered98 and one request |
| C13 | Request check: The production dashboard request contains `check: {repo, branch}`. | slice 2 | observed: landed-ci-adapter-repeat.spec.ts accepted106/98 cases: real Done receipt after five100s complete builds; exact original rebuild wire, held submission sees durable intent, accepted identity pending gives progress, proof asks exact repeat,105s original/100s saved average yield slow106 or recovered98 and one request |
| C14 | Request attempt: The production dashboard request contains `attempt: {runId, attemptId, sha}`. | slice 2 | observed: landed-ci-adapter-repeat.spec.ts accepted106/98 cases: real Done receipt after five100s complete builds; exact original rebuild wire, held submission sees durable intent, accepted identity pending gives progress, proof asks exact repeat,105s original/100s saved average yield slow106 or recovered98 and one request |
| C15 | Original identity: The requested original landed attempt is named exactly as `discover` listed it. | slice 2 | observed: landed-ci-adapter-repeat.spec.ts accepted106/98 cases: real Done receipt after five100s complete builds; exact original rebuild wire, held submission sees durable intent, accepted identity pending gives progress, proof asks exact repeat,105s original/100s saved average yield slow106 or recovered98 and one request |
| C16 | Requested work: The request asks for one full check of that revision as a new attempt. | slice 2 | observed: landed-ci-adapter-repeat.spec.ts accepted106/98 cases: real Done receipt after five100s complete builds; exact original rebuild wire, held submission sees durable intent, accepted identity pending gives progress, proof asks exact repeat,105s original/100s saved average yield slow106 or recovered98 and one request |
| C17 | Accepted result: `{"result":"accepted","attempt":{"runId","attemptId","sha"}}`. | slice 2 | observed: landed-ci-adapter-repeat.spec.ts accepted106/98 cases: real Done receipt after five100s complete builds; exact original rebuild wire, held submission sees durable intent, accepted identity pending gives progress, proof asks exact repeat,105s original/100s saved average yield slow106 or recovered98 and one request |
| C18 | Admission attribution: The accepted attempt is the new attempt admitted by this request. | slice 2 | observed: landed-ci-adapter-repeat.spec.ts accepted106/98 cases: real Done receipt after five100s complete builds; exact original rebuild wire, held submission sees durable intent, accepted identity pending gives progress, proof asks exact repeat,105s original/100s saved average yield slow106 or recovered98 and one request |
| C19 | Discovery identity: The accepted attempt uses the identity under which `discover` lists it. | slice 2 | observed: landed-ci-adapter-repeat.spec.ts accepted106/98 cases: real Done receipt after five100s complete builds; exact original rebuild wire, held submission sees durable intent, accepted identity pending gives progress, proof asks exact repeat,105s original/100s saved average yield slow106 or recovered98 and one request |
| C20 | Refusal: `{"result":"refused","reason":"…"}` when no new attempt was admitted. | slice 3 | |
| C21 | Uncertainty: `{"result":"uncertain","reason":"…"}` when admission cannot be settled. | slice 3 | |
| C22 | Nonzero exit: A nonzero exit counts as uncertain. | slice 3 | |
| C23 | Timeout: A timeout counts as uncertain. | slice 3 | |
| C24 | Oversized output: Oversized output counts as uncertain. | slice 3 | |
| C25 | Invalid answer shape: An answer outside the accepted, refused or uncertain shapes with their `result` discriminator counts as uncertain. | slice 3 | |
| C26 | The dashboard follows the accepted attempt through the existing `discover` and `proof` reads. |  | G4 |
| C27 | Exact repeat identity: A full comparable repeat must be the exact accepted attempt. | slice 2 | observed: landed-ci-adapter-repeat.spec.ts accepted106/98 cases: real Done receipt after five100s complete builds; exact original rebuild wire, held submission sees durable intent, accepted identity pending gives progress, proof asks exact repeat,105s original/100s saved average yield slow106 or recovered98 and one request |
| C28 | Different attempt: Its `attemptId` must differ from the original’s. |  | G3 |
| C29 | Same revision: Its `sha` must match the original’s. | slice 3 | |
| C30 | Same check: Its check must match the check named by the original. | slice 3 | |
| C31 | Same context: Its context must match the context named by the original. | slice 3 | |
| C32 | Ordering: It must start after the original completed. | slice 3 | |
| C33 | Successful outcome: It must succeed. | slice 3 | |
| C34 | Time bounds: It must have both time bounds. | slice 3 | |
| C35 | Comparable proof: Its proof must be as complete as the original’s. |  | G2 |
| C36 | Existing threshold: The existing 5% rule applies. | slice 2 | observed: landed-ci-adapter-repeat.spec.ts accepted106/98 cases: real Done receipt after five100s complete builds; exact original rebuild wire, held submission sees durable intent, accepted identity pending gives progress, proof asks exact repeat,105s original/100s saved average yield slow106 or recovered98 and one request |
| C37 | Saved reference: The repeat is judged against the same saved reference. | slice 2 | observed: landed-ci-adapter-repeat.spec.ts accepted106/98 cases: real Done receipt after five100s complete builds; exact original rebuild wire, held submission sees durable intent, accepted identity pending gives progress, proof asks exact repeat,105s original/100s saved average yield slow106 or recovered98 and one request |
| C38 | Allowance timing: The one-request allowance is spent before invoking the trigger. | slice 2 | observed: landed-ci-adapter-repeat.spec.ts accepted106/98 cases: real Done receipt after five100s complete builds; exact original rebuild wire, held submission sees durable intent, accepted identity pending gives progress, proof asks exact repeat,105s original/100s saved average yield slow106 or recovered98 and one request |
| C39 | Deduplication: Existing deduplication behavior applies. | slice 2 | observed: landed-ci-adapter-repeat.spec.ts accepted106/98 cases: real Done receipt after five100s complete builds; exact original rebuild wire, held submission sees durable intent, accepted identity pending gives progress, proof asks exact repeat,105s original/100s saved average yield slow106 or recovered98 and one request |
| C40 | Recent presentation: Existing “Recently done” wording applies. | slice 4 | |
| C41 | Review navigation: The existing review route applies. | slice 4 | |
| C42 | Review run identity: Review shows each attempt’s run identity. | slice 4 | |
| C43 | Review attempt identity: Review shows each attempt’s attempt identity. | slice 4 | |
| C44 | Review check: Review shows each attempt’s check. |  | G1 |
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
| C59 | Observer restriction: The execution CI observer never runs `ciRebuild`. | slice 2 | observed: ci-command-rebuild.test.mjs execution observation with ciRebuild declared asserts request operation set equals discover only |
| C60 | Triggering remains outside the observer’s read-only `ciAdapter` contract. | slice 2 | observed: ci-command-rebuild.test.mjs execution observation with ciRebuild declared asserts request operation set equals discover only |
| C61 | Adapter manual ownership: The adapter manual leaves triggering and retrying to the project’s delivery process. | slice 4 | |
| C62 | Adapter-only readings: A custom project without `ciRebuild` keeps its CI readings. | slice 2 | observed: landed-ci-adapter-repeat.spec.ts adapter-only case observes complete readings, invokes real collectCiFollowUps to terminal including prior GitHub measurement, asserts zero custom rebuild and GitHub calls |
| C63 | Adapter-only repeat: Such a project gets no repeat. | slice 2 | observed: landed-ci-adapter-repeat.spec.ts adapter-only case observes complete readings, invokes real collectCiFollowUps to terminal including prior GitHub measurement, asserts zero custom rebuild and GitHub calls |
| C64 | Retained GitHub receipt: The no-repeat behavior also covers an admitted GitHub Actions receipt retained from before `ciAdapter` was configured. | slice 2 | observed: landed-ci-adapter-repeat.spec.ts adapter-only case observes complete readings, invokes real collectCiFollowUps to terminal including prior GitHub measurement, asserts zero custom rebuild and GitHub calls |
| C65 | Maintained proof observes that the collection pass ends without a rerun request. | slice 2 | observed: landed-ci-adapter-repeat.spec.ts adapter-only case observes complete readings, invokes real collectCiFollowUps to terminal including prior GitHub measurement, asserts zero custom rebuild and GitHub calls |
| C66 | GitHub behavior: GitHub Actions retains its built-in trigger. | slice 1 | observed: dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts real receipt held POST,106-second verdict,restart;16 selected Playwright tests passed |
| C67 | Fixture scope: This story uses a fixture provider. | slice 4 | |
| C68 | Provider admission ownership: The provider owns admission. | slice 1 | observed: dashboard/server/ciFollowUpGithubProvider.ts prepare/submit/observe delegate provider admission to repeatGitHubWorkflow; transport tests passed |
| C69 | Provider queue ownership: The provider owns queue behavior. | slice 1 | observed: dashboard/server/ciFollowUpObservation.ts observes provider queue; automatic-repeat progress assertion passed |
| C70 | Provider outcome ownership: The provider owns build outcome. | slice 1 | observed: dashboard/server/ciFollowUpObservation.ts provider conclusion consumed unchanged; repeat-verdict spec passed |
| C71 | Dashboard decision ownership: The dashboard owns the decision, under ADR0008. | slice 1 | observed: dashboard/server/ciFollowUpCollection.ts repeatDecisionOf retained;policy and automatic-repeat tests passed |
| C72 | Dashboard evidence ownership: The dashboard owns the evidence, under ADR0008. | slice 1 | observed: dashboard/server/ciFollowUpStore.ts and ciFollowUpRetention.ts retain frozen ledger evidence;legacy read ledger test passed |
| C73 | Provider seam: Generalise the delivered GitHub follow-up into one provider seam. | slice 1 | observed: dashboard/server/ciFollowUpProvider.ts and ciFollowUpGithubProvider.ts expose prepare/submit/observe; collection uses configured and retained provider |
| C74 | Flow ownership: The dashboard owns the follow-up flow. | slice 1 | observed: dashboard/server/ciFollowUpCollection.ts retains admission,spend,never-resend and outcome retention;ledger and automatic-repeat specs passed |
| Q01 | Paired configuration: `ciRebuild` applies only together with `ciAdapter`. The text does not prescribe how an unpaired declaration is validated. | slice 2 | observed: ci-rebuild-configuration.test.mjs paired/shared,absent/empty/unpaired and malformed settings assertions; readCiConfiguration validates beside ciAdapter |
| Q02 | Shared executable allowed: `ciRebuild` may name the same command as `ciAdapter`. | slice 2 | observed: ci-rebuild-configuration.test.mjs paired/shared,absent/empty/unpaired and malformed settings assertions; readCiConfiguration validates beside ciAdapter |
| Q03 | Moved branch: The requested revision must receive the full new check even if its branch has moved on. | slice 2 | observed: landed-ci-adapter-repeat.spec.ts then106 case asserts branch advance differs from pinned candidate, exact rebuild request still names original sha |
| Q04 | Queued admission: An accepted attempt may already be listed by `discover` while queued. | slice 2 | observed: landed-ci-adapter-repeat.spec.ts accepted106/98 cases: real Done receipt after five100s complete builds; exact original rebuild wire, held submission sees durable intent, accepted identity pending gives progress, proof asks exact repeat,105s original/100s saved average yield slow106 or recovered98 and one request |
| Q05 | Existing queued revision: Refusal includes the case where the revision is already queued. | slice 3 | |
| Q06 | Existing running revision: Refusal includes the case where the revision is already running. | slice 3 | |
| Q07 | Conditional provider link: Review shows a provider link when one is listed. | slice 4 | |
| Q08 | Production execution: Only production dashboards trigger CI. | slice 2 | observed: landed-ci-adapter-repeat.spec.ts development case initializes isolated environment once, invokes real guarded function with production-collected facts and declared trigger, asserts zero rebuild/GitHub calls |
| Q09 | Release boundary: Unreleased dashboard code must not act on real CI. | slice 2 | observed: landed-ci-adapter-repeat.spec.ts development case initializes isolated environment once, invokes real guarded function with production-collected facts and declared trigger, asserts zero rebuild/GitHub calls |
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
| J09 | Adapter alone: Configure only `ciAdapter`. No rebuild request occurs, and CI readings remain available. | slice 2 | observed: landed-ci-adapter-repeat.spec.ts adapter-only case observes complete readings, invokes real collectCiFollowUps to terminal including prior GitHub measurement, asserts zero custom rebuild and GitHub calls |
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

## Slice 2 acceptance

Real Done receipt with five complete adapter 100s predecessors → one rebuild naming the 105s original → held-response ledger shows durable intent → exact accepted discovery gives progress → complete106s/98s repeat gives slow/recovered with frozen100s average. Assertions are in `landed-ci-adapter-repeat.spec.ts`; the 106s case advances the branch while preserving the pinned launch candidate. The adapter-only case observes retained readings then a terminal real collection call, including a prior admitted GitHub measurement, with zero trigger/POST. Isolated development collection with real collected facts also observes zero trigger. The required red failed on zero rebuild requests before implementation.

Preparation freezes original check/context; provider observation requires exact accepted distinct text-form attempt identity, same sha/check/context, ordered valid bounds, success, existing proof completeness and coverage of original declared parts (extra complete proof allowed). Intent's rule stays unchanged. Review wording remains G1 receiving4; omitted-original declaration and type-equivalent identity negative proof remain G2/G3 receiving3. All slice2 commitment rows are observed above; later source commitments and examples retain their allocated owners.

Terminal Node proof all passed:

```sh
PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh src/skills/dough-execute-plan/scripts/ci-command-adapter*.test.mjs src/skills/dough-execute-plan/scripts/ci-command-rebuild.test.mjs src/skills/dough-execute-plan/scripts/ci-rebuild-configuration.test.mjs src/skills/dough-execute-plan/scripts/ci-client-configuration.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-units-cli.test.mjs
PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh src/skills/dough-execute-plan/scripts/ci-command-rebuild.test.mjs src/skills/dough-execute-plan/scripts/ci-rebuild-configuration.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-read-adapter.test.mjs tests/support/ci-follow-up-ledger.test.mjs tests/support/ci-follow-up-policy.test.mjs tests/support/ci-follow-up-reading.test.mjs
PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/support/dashboard-ci-adapter-proof.test.mjs tests/support/dashboard-ci-adapter-revision-lookup.test.mjs tests/support/dashboard-story-branch-ci-adapter.test.mjs tests/support/dashboard-ci-proof-read.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-read.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-read-adapter.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-units.test.mjs
PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh src/skills/dough-execute-plan/scripts/ci-rebuild-configuration.test.mjs
npm run typecheck:dashboard
git diff --check
```

Terminal Playwright selections:

```sh
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts dashboard/backend-tests/intent/landed-ci-adapter-repeat.spec.ts dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts dashboard/backend-tests/intent/landed-ci-follow-up-reading.spec.ts dashboard/backend-tests/intent/landed-ci-repeat-admission.spec.ts dashboard/backend-tests/intent/landed-ci-repeat-reconciliation.spec.ts dashboard/backend-tests/intent/landed-ci-repeat-verdict.spec.ts dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts dashboard/tests/intent/intent-ci-follow-up.spec.ts dashboard/backend-tests/intent/ci-proof-memory-adapter.spec.ts dashboard/backend-tests/intent/ci-proof-memory-adapter-gaps.spec.ts dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts dashboard/tests/intent/intent-ci-comparison-adapter-taken.spec.ts --workers=1 --reporter=list
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts dashboard/backend-tests/intent/landed-ci-adapter-repeat.spec.ts dashboard/backend-tests/intent/landed-ci-attempt-start-adapter.spec.ts dashboard/backend-tests/intent/landed-ci-history-pending-sources.spec.ts dashboard/backend-tests/intent/landed-ci-proof-adapter-units.spec.ts dashboard/backend-tests/intent/landed-ci-scope-adapter-identity.spec.ts dashboard/backend-tests/intent/landed-ci-scope-adapter-shared-attempt.spec.ts dashboard/backend-tests/intent/landed-ci-scope-proof-adapter-recovery.spec.ts dashboard/tests/intent/intent-ci-comparison-adapter-planning-skip.spec.ts dashboard/tests/intent/intent-ci-proof-adapter-reasons.spec.ts dashboard/tests/intent/intent-ci-proof-adapter.spec.ts dashboard/tests/intent/intent-ci-proof-legacy-results.spec.ts dashboard/tests/intent/intent-ci-status-wall-time.spec.ts dashboard/tests/intent/intent-ci-wall-time-history-adapter.spec.ts --workers=1 --reporter=list
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts dashboard/backend-tests/intent/landed-ci-adapter-repeat.spec.ts --grep 'then106|development follow-up' --workers=1 --reporter=list
```

The first two selections contributed 29 and 23 independent passing cases; each failed only the two new moved-branch/development setups. Those test defects were fixed: refresh/advance the separate default fixture checkout without changing launch candidate, and initialize an isolated environment once using production-collected facts. The final affected 2-case selection passed in 26.7s. Earlier independent observations remain valid; no failed test is waived. Red/green initial 3 cases passed 52.5s. AC, awake, one worker, maintained guard; launch loads 14.36 (red),42.40 (initialgreen),26.85 (main),34.96 (remaining), approx 2GiB free/10–11GiB inactive for later runs. Reassess capacity on contention; unrelated owners untouched.

Consumer trace `/tmp/seed330-slice2-consumer-trace.md` has 701 located rows, all dispositioned. The extraction's proof/jobs, shared proof reader/units CLI, adapter revision lookup/comparison and fixture consumers were exercised by enclosing Node and Playwright observations above. Installed copies, planning/history basenames, unchanged native acquisition and generic imports are excluded. Coordinator inspected the provider/observation, wire/config tests, real receipt/scenario, legacy adapter-only pass and schema/projection changes. Acceptance freshness unchanged at trunk 1117582709db72b2c3bc842ef4e388d9e6866a8d; supplier already inherited. Independent refactor2 accepted below.

### Slice 2 independent refactor

`refactor2` returned `## REFACTOR COMPLETE`: `ciFollowUpVerdict.ts` now owns shared timing eligibility, frozen-rule verdict and wording; both providers call it. Custom proof membership retains one Set; fixture comments now name rebuild/jobs correctly. Provider comparability and unverified explanations are unchanged. Incoming extraction/config/proof/jobs/revision-lookup proof stays valid. All edited files remain ≤250 formatted lines (maximum 246).

```sh
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts dashboard/backend-tests/intent/landed-ci-adapter-repeat.spec.ts dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts dashboard/backend-tests/intent/landed-ci-repeat-verdict.spec.ts --workers=1 --reporter=list
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts dashboard/backend-tests/intent/landed-ci-adapter-repeat.spec.ts --workers=1 --reporter=list
npm run typecheck:dashboard
git diff --check
```

Terminal results: nine tests passed in 1.5min; after Set edit four custom tests passed in 21.1s; typecheck/whitespace zero. Same concrete request/intent/progress/verdict/reference/guard assertions; no changed fixture outcome. AC, sleep guard, one worker, no concurrent owned heavy work. Before first launch load 142.17 but 57.51% CPU idle after tsc ended; final launch 60.05 with 54% idle justified bounded renewal. Annotated refactor trace `/tmp/seed330-refactor2-consumer-trace.md` dispositions every consumer. Source freshness unchanged before delivery, no incoming named-supplier change; G1–G3 remain with slices 4/3.

Mechanical delivery correction: first fresh preparation stopped at selective formatting with five lint findings and committed/published nothing. Refactor2 repaired typed rebuild result/validator, fixture repeat's existing builder-output-or-undefined type, Promise-preserving non-async branch helper and unused acquisition helper. One overly narrow intermediate fixture type was corrected. Final `npm run typecheck:dashboard` and `git diff --check` passed; runtime validation/actions/assertions unchanged, prior behavior proof retained with correspondence in the refactor trace. Refactor2 again returned `## REFACTOR COMPLETE`.

## Owned CI repair after slice 2

CI run43235536671/1 at b2899a8 had one failed job, test(3/3); terminal diagnostic inventory complete with no gaps, all errors native-evidence-identity omissions of ci-command-attempt.mjs in startup/admission/one-shot/owned-context. Repair reproduced those failures, then an actual fresh installed reader failed ERR_MODULE_NOT_FOUND before adding the missing runtime module to the shared payload declaration. G4 retains this discovery and accepts installed behavior, not a weakened identity test.

```sh
caffeinate -s -i env PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 OPEN_DOUGH_TEST_TIMES=/tmp/ci-repair1-pass-times OPEN_DOUGH_TEST_OUTCOMES=/tmp/ci-repair1-pass-outcomes bash scripts/test.sh tests/native-evidence-identity.sh tests/install-public-payload.sh tests/execution-payload-update.sh tests/update-adds-new-payload-skill.sh tests/payload-declaration-links.sh src/skills/dough-test-optimization/scripts/ci-proof-read-adapter.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-read.test.mjs src/skills/dough-execute-plan/scripts/ci-command-adapter-proof.test.mjs src/skills/dough-execute-plan/scripts/ci-command-rebuild.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-units-cli.test.mjs
caffeinate -s -i env PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 OPEN_DOUGH_TEST_TIMES=/tmp/ci-repair1-consumer-times OPEN_DOUGH_TEST_OUTCOMES=/tmp/ci-repair1-consumer-outcomes bash scripts/test.sh tests/pin-and-inspect.sh tests/update-removes-dropped-files.sh src/skills/dough-test-optimization/scripts/ci-proof-leads-adapter.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-leads-gaps.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-leads-retained.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-leads.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-leads-cli.test.mjs
```

All17 selected checks and git diff --check passed. New helper imports the actual installed reader, supplies a MakeMe summary through a child adapter, independently asserts returned summary and captured proof wire. Both roots are exercised after fresh install, ordinary updates and release-source removal. Native evidence asserts closure completeness and byte-hash sensitivity for every family. Five unchanged leads suites were extra corroboration beyond necessary installed delivery proof; no further expansion. Trace /tmp/ci-repair1-consumers.md disposes all located consumers. Local AC, core load39.51/CPU40.7%idle/free64%, consumer38.68/38.61%idle/free61%, one guarded serial command. Other owners untouched. Slice3 was quiescent and stashed under retained CI repair record; coordinator restores it after publication. No failure waived. Independent refactor_ci1 returned `## REFACTOR COMPLETE`: none — already clean; unchanged installed/runtime assertions, all proof retained, no additional tests.

Repair delivery mechanical correction: selective formatting stopped before commit on ShellCheck SC2154 for the shared helper's caller-supplied source_dir. Added the same explicit sourced-global contract used by repository helpers; comment-only, within refactor_ci1's accepted paths/trace, so installed-use proof remains unchanged (already traced disposition). No publication occurred on the failed attempt.
