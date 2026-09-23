# Accept delivery only with evidence for affected promises

Status: planned.
Identity: `SEED-004#accept-delivery-evidence`
Source: [refined story](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#accept-delivery-evidence).

## Execution

Story Branch Mode. This session created the execution checkout
`/Users/terryyin/git/open-dough-worktrees/085-accept-delivery-evidence` on
branch `cursor/085-accept-delivery-evidence` from fetched `origin/main`
`ddcd6046516231573a3db903e4f0db9e3621fb4d`. Originating and integration
checkout: `/Users/terryyin/git/open-dough` on `main`.

Published claim `59b76944b466ecccbfd985a211c78a6e385569a8` accepted on
`refs/heads/main`. Claim CI is `pendingCi: unobserved`: the story-branch
observer does not cover trunk. Slice 1 increment
`2e96700a5e2aae750950fe7095e788cd605ef1bd`, slice 2 increment
`7b564d8a5a093a5dc17761708f5a6f79a670ee29`, and slice 3 increment
`f0f355c4f32dd1a5c794c1e15ad43a0e079e5988` accepted on
`refs/heads/cursor/085-accept-delivery-evidence` and registered with the
observer (slice 3 `undiscovered` at registration). Default-checkout refresh is deferred
(`unclear-ownership`); that checkout stayed clean on `main` at `ddcd604`.

Replanning permission: existing planning authority retained. No numeric slice
budget was recorded.

CI observer `/tmp/dough-ci-501/watch-9ChEcH` is armed from the execution
checkout against `terryyin/open-dough` branch `cursor/085-accept-delivery-evidence`,
GitHub workflow `ci.yml` named `CI`. Checkout preparation: `npm ci` then
`npm run lint` passed on Node v24.5.0.

Terry authorized refinement, planning, and plan refinement on 2026-09-23.
Implementation, Take, release, and automatic monitoring are not authorized.
All slices remain planned. The backlog remains the ordering authority.

## Goal and boundaries

Correct the four evidenced ways execution accepted or reported unsupported proof,
using existing proof acceptance before commit. Keep filtered selection, reported
claims, changed-consumer applicability, and explicitly missing required behavior
as distinct mechanisms of one evidence-to-promise decision. Reuse sufficient
proof and continue promptly when it supports all affected promises.

Achieve this through concise, clear instructions addressed personally to the
executing agent: make its responsibility, immediate action, and reason easy to
follow in the current task. Rewrite and simplify the existing authoritative
instructions rather than accumulating reminders. Remove overlapping or superseded
wording so this intention and other workflow intentions remain clear. More
instructions are not evidence of improvement; judge the result by observed agent
behavior and preserved existing obligations, not a word-count target.

The source owns scope, examples, and exclusions. In particular, no general
registry, mandatory full-suite run, exhaustive consumer inventory, CI redesign,
new report schema, universal concurrency check, or repair of historical application
code belongs here. A later SHA alone does not invalidate earlier proof. No
blanket per-tool discovery recheck or extra human approval gate is introduced.

## Evidence checked during refinement

The authoritative occurrence records remain in
[finding names](../../../docs/maintainer/finding-names.md). These original log
locators were inspected read-only; they are local evidence, not runtime dependencies.
Paths are relative to `/Users/terryyin/.claude/projects/`:

| Mechanism | Decisive evidence |
| --- | --- |
| ODF-057: filtered selection | `-Users-terryyin-git-open-dough/e4873109-37b3-44f7-a0e1-edae0699fd66.jsonl:2401` identifies the zero-test command; `-Users-terryyin-git-open-dough/3d3c57d6-4ffa-4ffd-9493-57d414446365.jsonl:470` records retitling so the overview command selects three tests instead of one. Both were caught during execution. |
| ODF-063: unsupported report | The latter log at line 512 says “Both are covered by the fixture”; line 603 records the accepted correction. `c0d0a91:.planning/quick/061-published-story-dashboard/PLAN.md` records the false claim and correction, and that commit contains the resulting no-link assertions. |
| ODF-075: stale applicability | `-Users-terryyin-git-pygardon/9fb4e545-44d6-4c06-aa79-87f4660f9057.jsonl:2103` acknowledges the false E2E assessment. Pygardon `8203347f2` changes the omitted `e2e_test/support/e2e_service.py` factory consumer to the changed contract. |
| ODF-076: known gap | The same Pygardon log at line 454 names the untested path; line 642 writes it to Learnings while committing. `cb539a346:.planning/quick/146-tag-triggered-release-publication/PLAN.md` preserves the gap. `516935a30` repairs active-task ownership and adds an observed handoff assertion. |

Retained excerpts and Git locators suffice when private logs are unavailable.
Do not require access to another project to run the maintained examples. Do not
count shared executions twice or equate the precise requeue gap with proof of
the later active-task race's cause. Historical incidents do not establish current
recurrence; assess candidate behavior and report unchanged successful behavior
as reuse/no additional correction where appropriate.

## Existing solutions and architectural constraints

PFE at preparation base `45a126ed43510c5e21d17b0df96e3369d2c3136a`:

- `src/skills/dough-story-refinement/references/executable-proof.md` owns
  promise mappings, affected production callers, focused proof, and reuse.
  Extend its existing applicability concept only where needed for test-support
  consumers; do not add another consumer-discovery subsystem.
- `src/skills/dough-execute-plan/references/wrap-up.md#accept-proof` owns the
  coordinator's inspection and incomplete-evidence return. Put concrete
  acceptance corrections here; preserve its substance-over-format and reuse rules.
- `src/skills/dough-execute-plan/references/delegation.md` owns the report as an
  index, including uncovered promises. Amend only information needed by acceptance;
  link to its owner instead of repeating the entire procedure.
- Existing planning and execution entry points already route to those owners.
  Confirm quick and planned calls still reach them; do not rewrite orchestration.
- `tests/git-publication-native.sh` and `tests/support/git-publication-native-*.sh`
  already provide installed-candidate fixtures, fresh host execution, bounded
  supervision, results retention, and acceptance journeys. Reuse their transport
  for the small acceptance cases; do not construct a second runner. Its current
  cases do not prove these four acceptance behaviors.
- `tests/native-adr-behavior.sh` demonstrates paraphrase/counterexample assessment.
  Reuse the assessment approach, not its ADR-specific semantics. Prefer direct
  fixture observations; manually assess prose when a small reliable check is not
  possible. A new universal prose assessor is outside scope.
- The catalog owns finding status; the near-term watch list owns eligible released
  follow-up. Update those records, not another tracking file or automation.

Follow [AGENTS.md](../../../AGENTS.md), Accepted ADR
[0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(one cohesive responsibility and small useful increments),
[0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
(source/release distinction),
[0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
(behavioral proof, native/reused evidence, bounded runs), and
[0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(one runtime owner, executing-project perspective). Index and relevant statuses
agree; no exception or supersession is needed. Existing
[North Star](../../NORTH-STAR.md) concerns publication and dashboard ownership;
this plan preserves those decisions and needs no new topic.
Edit released-guidance sources under `src/skills/`, never installed managed copies.
Keep historical finding identities and project-specific examples in maintainer
records and test fixtures, not required runtime vocabulary.

## Proof approach and ownership

Each slice owns its guidance correction, a bounded scenario at actual agent
acceptance, sufficient-evidence control, relevant deterministic checks, and
finding update. Maintain shared scenarios once. Setup may supply a repository,
required promises, candidate changes, and a misleading implementation return;
it must not tell the agent which gap to find or pre-perform its acceptance decision.
A generic instruction to apply the existing acceptance workflow is appropriate.

Use a small local fixture and disposable local remote. Observe actual selected
tests, assertion/consumer inspection, corrected fixture state or precise refusal,
and reports before any commit/publication. Do not push to production repositories.
Replay logs and substitute agents test fixture/assessor logic only, never native
skill behavior. A green exit or matching instruction words cannot pass a case.

Extend the existing native acceptance journey entry point with bounded
`delivery-evidence/selection`, `delivery-evidence/claims`,
`delivery-evidence/consumers`, and `delivery-evidence/gaps` cases.
`delivery-evidence/selection`, `delivery-evidence/claims`,
`delivery-evidence/consumers`, and `delivery-evidence/gaps` are implemented. Each case includes its
sufficient-evidence control. The intended command after implementation is:
`bash tests/git-publication-native.sh --native HOST --case delivery-evidence/CASE --results-dir DIR`.
Record literal resolved commands, selected observations, candidate/runtime,
setup and assertion locations, decisive trace, and result during execution.
Use its existing bounded supervision and retry policy; never retry unchanged
failures until green. If runner integration proves disproportionate, retain a
bounded native manual observation using the same fixtures and explicit judgment;
do not expand tooling to save an experiment.

The original failures occurred under Claude Code, making fresh Claude use a
priority. For each requirement record native proof or justified applicable reuse
for Codex, Cursor, and Claude Code; shared installation/activation proof may be
reused but does not establish another host's changed acceptance behavior. Select
additional runs by missing evidence, not a mandatory full matrix. If required
native use cannot be completed, retain the requirement as pending in a linked
acceptance story before closing implementation, as ADR 0005 requires; never mark
it passed or release affected behavior on that basis. No feasibility blocker is
currently known; host availability is checked when execution is authorized.

## Ordered slices

### 1. Filtered proof covers the observations it claims
Type: Behavior
Status: done

Accepted proof: `bash tests/git-publication-native.sh` passed after the
refactor rerun. Assessor counterexamples in
`tests/support/delivery-evidence-selection-native-assess.sh` reject empty
selection, partial over-accept, and all-accepted-plus-incomplete, and accept
precise incomplete naming plus corrected and complete selection. Cursor
`bash tests/git-publication-native.sh --native cursor --case delivery-evidence/selection --results-dir .planning/native-results/delivery-evidence-selection-r3`
accepted 0, 1, and 3 promises for zero-test, partial, and complete selection.
Setup is `tests/support/delivery-evidence-selection-native-scenario-content.sh`.
Codex and Claude native runs for this case are pending, not passed. Node's
filtered test runner can exit 0 when no named test matches; count named
selections, not a file-suite total.

Behavior: Given a zero-exit command selecting no tests, or one of three required
observations, acceptance identifies the uncovered promises and obtains missing
observations before accepting them. The complete-selection control proceeds.

Change the existing acceptance owner to verify actual selection against claimed
observations when filtering is used. Reuse a trustworthy selection/result instead
of always rerunning. Test count is supporting evidence, never the full mapping.
Create the smallest shared fixture/runner adaptation needed for this first case;
keep it with the behavior rather than a standalone framework slice.

Proof: `delivery-evidence/selection` presents both historical selection failures
and a complete control. Observe the tests actually run and whether the agent
accepts only matching promises, corrects selection, and proceeds once sufficient.
Credential-free fixture/assessor checks reject zero-test and partially selected
success reports; they accept equivalent sufficient reports.
Update ODF-057 with the response/evidence actually established by this slice.
Safe stop: selected-proof acceptance is useful independently of later corrections.

### 2. Reported behavior is supported before it is called verified
Type: Behavior
Status: done

Accepted proof: `bash tests/git-publication-native.sh` passed after the
refactor rerun. Assessor counterexamples in
`tests/support/delivery-evidence-claims-native-assess.sh` reject an
unsupported covered claim and accept-without-gap, and accept a corrected
no-link observation and an equivalent substantiated layout. Cursor
`bash tests/git-publication-native.sh --native cursor --case delivery-evidence/claims --results-dir .planning/native-results/delivery-evidence-claims-r3`
left the bare-anchor claim incomplete, accepted the corrected no-link
observation, and accepted the equivalent layout without a format-only resend.
Setup is `tests/support/delivery-evidence-claims-native-scenario-content.sh`.
Codex and Claude native runs for this case are pending, not passed.

Behavior: Given the anchor-only-link claim without an observing assertion and
contradictory implementation, acceptance does not tell the developer it is covered.
It returns the required behavior for correction and accepts the corrected no-link
observation. A substantiated report in another layout is accepted without resend.

Keep the report an index. Amend the existing handoff only where acceptance lacks
necessary evidence; do not require a schema or turn incidental assertions into
new story promises. Preserve truthful descriptions of untested, out-of-scope behavior.

Proof: `delivery-evidence/claims` observes the unsupported initial report, actual
fixture behavior, correction, and final statement. Assess the user-visible claim,
not merely a test path's presence. Its sufficient control reuses the same valid
observation in equivalent prose without another test run or formatting-only retry.
Update ODF-063 with its specific response and evidence; do not claim it caused an
escaped historical defect. Safe stop: user reports no longer promote that unsupported claim.

### 3. Changed shared contracts refresh affected-consumer proof
Type: Behavior
Status: done

Accepted proof: `bash tests/git-publication-native.sh` passed before a
comment-only observe trim, so that rerun was not required. Assessor
counterexamples in `tests/support/delivery-evidence-consumers-native-assess.sh`
reject acceptance on a stale exclusion and accept an aligned consumer with
compatibility proof plus an unchanged unrelated boundary. Cursor
`bash tests/git-publication-native.sh --native cursor --case delivery-evidence/consumers --results-dir .planning/native-results/delivery-evidence-consumers-r1`
left the one-arg stand-in incomplete, accepted the two-arg stand-in after
`releaseTag` assertions, and reused the unchanged badge proof. Setup is
`tests/support/delivery-evidence-consumers-native-scenario-content.sh`.
Codex and Claude native runs for this case are pending, not passed.

Behavior: Given a previously valid unaffected-suite assessment and a subsequent
factory signature change, acceptance checks its current consumers, finds the
missed E2E stand-in, aligns it and obtains matching proof. Unrelated consumers and
unchanged boundaries retain their accepted evidence.

Extend existing shared-operation caller analysis to relevant test-support callers
and invalidate the stale exclusion when the changed contract affects it. Do not
require an exhaustive dependency database, all suites, or all callers when
sufficient equivalent-purpose proof exists.

Proof: `delivery-evidence/consumers` supplies the two-revision contract change,
stale exclusion, passing producer proof, and incompatible stand-in. Observe the
consumer correction and executed compatibility assertion before acceptance. A
control with an unchanged unrelated boundary retains existing proof. The fixture
must model contract consumption, not require Pygardon or its full E2E environment.
Update ODF-075 and its release/evidence limitations. Safe stop: the changed-contract
case cannot be accepted solely on the stale unaffected-suite claim.

### 4. Known required gaps remain incomplete, with accurate follow-up
Type: Behavior
Status: done

Accepted proof: `bash tests/git-publication-native.sh` passed, and the
refactor made no edits, so that proof was reused. Assessor counterexamples
in `tests/support/delivery-evidence-gaps-native-assess.sh` reject clearing a
required gap by learning alone. Cursor
`bash tests/git-publication-native.sh --native cursor --case delivery-evidence/gaps --results-dir .planning/native-results/delivery-evidence-gaps-r1`
obtained the missing requeue observation and accepted it, left requeue
incomplete when proof could not be obtained while keeping happy-path
admission, and accepted sufficient existing proof without another run.
Setup is `tests/support/delivery-evidence-gaps-native-scenario-content.sh`.
Codex and Claude native runs for all four `delivery-evidence` cases remain
pending, not passed. Release and active watch stay pending.

Behavior: Given a required readiness/requeue observation explicitly missing from
a return, acceptance obtains it within authority or names the required promise
as incomplete and leaves its dependent delivery unaccepted. Merely recording the
gap as learning does not clear it. Once sufficient current proof is supplied,
acceptance proceeds without another approval or blanket rerun.

Use the existing incomplete-return path, not a new concurrency policy. Include a
bounded unavailable-proof branch that stops the dependent path and preserves
independently valid evidence. A developer's explicit changed promise is honored;
the agent cannot silently weaken it. Do not claim the omitted requeue case proves
prevention of every active-task ownership race.

Proof: `delivery-evidence/gaps` observes repair-and-proceed, unavailable-proof
incomplete outcome, and sufficient reused evidence. Its refusal criterion concerns
the promised behavior, not the word “untested” in arbitrary prose. Inspect the
candidate and local publication evidence as well as the response.
Update ODF-076, then reconcile all four findings and the pending watch note under
the follow-up contract below. Reuse prior slices' valid observations; this is no
four-case blanket rerun. Safe stop: delivered scope and unresolved limitations
are accurate in execution and maintainer follow-up alike.

## Finding and near-term watch updates

Each slice updates its existing catalog entry without new codes, duplicated
occurrences, or edits to other projects' logs. Record actual response, implementation
commit, inspectable proof locator, and containing release or explicitly pending.
Use “Addressed in source; effectiveness unverified” only for demonstrated source
responses; incomplete mechanisms stay unresolved. Preserve caught-versus-escaped
and ODF-076 causal qualifications. At wrap-up use recoverable `commit:path`
locators before deleting the spent story, plan, and active evidence.

Slice 4 updates `docs/maintainer/near-term-watch-list.md` as well as the catalog:
replace this preparation's pending-response note with the actual release/use
assessment. A finding enters the active watch only if its response is released,
relevant use of that response is verified with provenance, and no supported
post-response recurrence contradicts eligibility. Record the use date and review
seven calendar days later. Otherwise keep it active in the catalog with unknown
watch start/review-after, and update the pending note's reason and durable locator.
A source test, a release tag, installation alone, or silence cannot start the watch.
Do not wait seven days as part of execution, create an automation, fabricate a
release, or declare effectiveness. This maintenance criterion is fulfilled by an
accurate pending disposition when release/use has not occurred.

## Review, sizing, and delivery

Four cohesive Behavior slices, each with one mechanism-specific proof loop and
its sufficient-evidence control. Independent mechanisms stay separate; evidence
reuse and one acceptance owner keep the cumulative design coherent. The first
slice includes only necessary fixture setup; there is no preparatory framework.
Bookkeeping accompanies each response and final reconciliation, not another slice.
No project numeric slice target or hard limit was found; no timing claim is invented.
Runner adaptation is the main sizing risk, bounded by the existing-runner/manual
observation choice above. Broader infrastructure is not a prerequisite.

During authorized execution apply normal independent post-change refactoring,
selective formatting and commit hooks, publication, asynchronous CI, retrospective,
and wrap-up. Run focused fixture/assessor checks after changes; use
`bash tests/git-publication-native.sh` for touched shared-runner regressions and
only affected payload checks if declarations change. Review each skill's invocation,
required context, and useful outcome under AGENTS.md. For every slice, review the
whole affected instruction passage for a clear agent responsibility and next action;
replace diluted or overlapping prose instead of appending another checklist.
Confirm the shorter, more direct guidance preserves other workflow intentions. No application tests are
required merely for this preparation's Markdown writes.

Preparation review: no unresolved product-scope decision or slice-specific blocker
identified. All source examples map to slices 1–4; valid-proof reuse is checked in
each relevant control; finding and watch maintenance is owned above. Runtime
availability and candidate behavior remain execution evidence, not results claimed
by this plan. Readiness is recorded separately against current document/plan digests.
