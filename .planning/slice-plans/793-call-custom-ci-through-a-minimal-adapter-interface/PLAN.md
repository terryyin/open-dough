# Call custom CI through a minimal adapter interface

**Identity:** SEED-423#install-without-the-custom-ci-adapter
**Source:** [Call custom CI through a minimal adapter interface](../../seeds/SEED-423-shrink-the-installed-distribution.md#install-without-the-custom-ci-adapter)

## Goal and scope

A Pygardon developer can follow CI from the execution watcher and Dashboard
with one small project-command contract. Keep Pygardon's released command usable
with the first Open Dough release carrying the simplified boundary. Preserve
GitHub Actions results and all existing custom CI capabilities. The CI reuse
recipe retirement, new CI provider features and the live Pygardon deployment
belong to their separate stories.

## Current decisions

- **Reuse the command boundary.** `ci-command-run.mjs` already owns subprocess
  invocation for all five operations. `ci-command-adapter.mjs` currently
  mixes discover decoding with watcher startup, retention and failure state.
  `baseCiAdapterAttempts.ts` creates that state for each Dashboard listing,
  then reads it back for its own judgment. Expose the shared one-shot discovery
  directly and keep polling state with the watcher. The test-optimization
  reader also uses the acquisition today and needs the same consumer trace.
- **Keep one contract.** Normalize and validate at the installed command
  boundary, building on `ci-command-attempts.mjs`, `ci-command-attempt.mjs`
  and `ci-proof-read.mjs`. Keep operation-specific fields, limits and error
  meanings where consumers rely on them. Keep the wire vocabulary and settings
  accepted from Pygardon's existing command, including opaque ID types and the
  listing branch on selected reads. Use shared typed results at the Dashboard
  boundary. Keep CI evidence interpretation above the command boundary and
  provider-specific queries, log selection and admission in Pygardon.
- **Measure the improvement.** Record before and after line counts for the
  touched installed adapter runtime, documentation, and Dashboard adapter
  callers. Explain each removed responsibility or duplicate transformation and
  compare like outcomes with GitHub Actions. Count added files in the same
  scope and keep shared CI rules whose behavior is still used. The audit's
  roughly 1,700 lines describe the area to inspect.
- [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
  keeps application decisions in their domain and limits transport mapping.
  [ADR 0004, Client installation and update](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
  keeps project configuration and credentials client-owned and runtime local.
  [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#observe-workflow-outcomes-without-owning-them)
  keeps Dashboard readings tied to observed CI evidence.
  [ADR 0005, Native validation and A/B testing](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  calls for stable command and installed-runtime evidence, and
  [ADR 0003, Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  governs the tagged handoff.
- Follow [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  by exercising the production boundary with existing fixtures and keeping the
  wire adapter thin. Follow [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
  for any changed or added Dashboard unit coverage. Run affected legacy specs
  through their maintained runner. Apply [Dough MakeMe](../../../.agents/skills/dough-makeme/SKILL.md)
  before editing tests, and [Dough Page Objects](../../../.agents/skills/dough-page-objects/SKILL.md)
  if browser proof is implicated. Use [Author Open Dough skills](../../../.agents/skills/author-open-dough-skills/SKILL.md)
  before editing the installed manuals.

## Decisive premises

| Consuming operation | Observation and result |
| --- | --- |
| Open Dough observes custom CI and reads attempts in the Dashboard and test-optimization reader | In the owned preparation workspace at `d78f19df1`, Node 24.21.0, `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node --test` over `Distribution/tests/skills/dough-execute-plan/{ci-command-adapter*,ci-integrated-state-custom,ci-integrated-state-journey,ci-github-acquisition,ci-github-diagnostic}.test.mjs`, `Distribution/tests/skills/dough-test-optimization/ci-proof-read-adapter.test.mjs` and `Distribution/tests/support/dashboard-{story-branch-ci-adapter,ci-adapter-proof,ci-adapter-revision-lookup}.test.mjs` passed 70 cases. The configured CLI selected custom CI, absent or empty configuration selected GitHub, a known failure survived lost diagnostics, integrated-state used the validated target revision, and Dashboard reads kept listing branch, attempt ambiguity and unreadable timing distinct. |
| Installed command contract against the current Pygardon adapter | Pygardon `49023bf9eaf4edbcae6a0766beee3c26f1bca7f9`, `node --import tsx --test infrastructure/tests/ci/pygardon-ci-adapter{,-diagnosis,-jobs,-proof,-queue-facts,-rebuild,-rebuild-uncertain}.test.ts infrastructure/tests/ci/pygardon-ci-watcher-integration.test.ts` passed 56 cases. Its real command talked only to the loopback provider and its installed watcher recovered brief loss and withheld a verdict under persistent loss. The command returned canonical discovery and queue facts, exact bounded diagnosis, intact retained proof, measured job timing, and exact new admission or honest refusal/uncertainty. This establishes the existing wire and fixture route. Slice 6 applies candidate installation to that profile, with a fixture-only rebuild. |
| Open Dough submits a rebuild and the observer remains read-only | In the preparation workspace at `d78f19df1`, the same `node --test` environment over `Distribution/tests/skills/dough-execute-plan/ci-command-rebuild.test.mjs` passed 5 cases. The configured trigger received the original opaque identity from its own checkout, reported accepted/refused/uncertain correctly, and configured observation sent no rebuild. |
| The production-profile Dashboard follows a qualifying landing through rebuild | In the preparation workspace at `d78f19df1`, `npm run test:dashboard:backend -- --workers 1 'landed-ci-adapter-(repeat\|repeat-rejections\|repeat-comparability)\.spec\.ts$'` passed with the pinned Playwright 1.65.0 runner. The cases observe one request naming the original landed revision, follow the accepted attempt and its proof, and keep refused or noncomparable repeats distinct from accepted results. |
| The focused command checks distinguish all five operations | In the preparation workspace at `d78f19df1`, controlled scratch edits to `ci-command-run.mjs` skipped `discover`, substituted unavailable diagnosis, or stopped `proof`, `jobs` and `rebuild` one operation at a time. `node --test --test-name-pattern` over the Dashboard trunk-discovery case, bounded failure-diagnostics case, documented proof request, selected job-graph request and exact rebuild request each failed its selected case under the corresponding control. The unchanged cases passed in the baseline runs above. Scratch edits reverted. |
| The install gate reaches the runtime and its contract | In the preparation workspace at `d78f19df1`, `PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/bash scripts/test.sh Distribution/tests/installation/{payload-declaration-links,execution-payload-update,install-public-payload}.sh` passed with Bash 5.3.20. The temporary tagged-source update exercised both installed skill roots and preserved project configuration. The shipped manual's example answered discover and diagnose, and installed proof was read through the payload. |

## Slices

### 1. Watcher and Dashboard share discovery directly

Type: Structure
Status: done

Extract the one-shot command discovery from watcher polling state, reusing its
normalization. Have Dashboard branch listings and any equivalent read-only
consumer call it directly. Keep complete answered attempts available for
ambiguity and keep newest-per-check and notification filtering at their shared
or consuming owners. This enables slice 2 to describe one observable discovery
contract for all readers.

**Proof.** Run `ci-command-adapter*.test.mjs`, `ci-integrated-state-*.test.mjs`,
`dashboard-story-branch-ci-adapter.test.mjs`,
`dashboard-ci-adapter-revision-lookup.test.mjs` and affected
`dough-test-optimization/ci-proof-*-adapter.test.mjs` readers. Check answered
versus retained attempts, target versus story branch cancellation and listing,
queue withdrawal, and historical and integrated-state decisions. Use the
final file names for the consumer trace if the recipes story has landed.

**Delivered.** `discoverCommandAttempts(options, signal)` in
`ci-command-adapter.mjs` is the shared one-shot discovery: every answered
attempt plus the branch queue. The watcher's acquisition calls it per poll;
`baseCiAdapterAttempts.ts` and `ci-proof-attempts.mjs` call it directly and
apply `latestCommandAttempts` where they retain. The per-listing watcher state
and the `discoverAnsweredAttempts` read-back are gone. Lines: adapter 210→211,
`ci-proof-attempts.mjs` 217→219, `baseCiAdapterAttempts.ts` 114→110; no files
added. Proof at `29b578602` plus the change: the focused node suite (116 cases
across `ci-command-*`, `ci-integrated-state-*`, GitHub acquisition/diagnostic,
`ci-proof-{read,leads}-adapter` and the three Dashboard adapter support tests),
`npm run typecheck:dashboard`, the backend `ci-proof-memory-adapter*`,
`ci-time-without-adapter-runner-waits` and `landed-ci-*adapter*` specs, and
`e2e/intent/intent-ci-proof-adapter.spec.ts` (4 cases) passed. No test asserts
that a failed branch discover cancels the other listing; the behavior is kept
as written.

### 2. The watcher reports the configured provider's verdict and failure evidence

Type: Behavior
Status: done

With an installed watcher and project-owned adapter, register an exact revision
and observe pending, success or a diagnosed failure using the documented
discovery and diagnostic responses. Keep branch, queue and integrator evidence
semantics and real failure when diagnostics are unavailable. Document the two
read operations independently of provider mechanics and keep the minimal
runnable example exercised by the installation check.

**Proof.** Run the configured watcher CLI, adapter failures and unavailable
cases, integrated-state and queue cases, and `ci-github-acquisition.test.mjs`
and `ci-github-diagnostic.test.mjs`. Assert the request for the failed attempt,
one bounded excerpt or unavailability, no GitHub fallback from invalid custom
output, and GitHub selection with absent or empty adapter configuration.

**Delivered.** `manuals/custom-ci.md` (246→227 lines) states `discover` as one
field table and `diagnose` separately, gathers limits and failures under the
contract, and moves observer retention, registration and integrated-state
completion under "How the observer uses the answers". Provider-query advice and
duplicate read-only statements are gone; runtime unchanged. Existing tests cover
the promises: `ci-command-adapter-cli` (configured command; absent or empty
setting selects GitHub), `ci-command-adapter-failures` (one 16 KiB bounded
excerpt or unavailability, keyed by the failed `attemptId`; no test asserts the
request shape itself), `ci-command-adapter-unavailable` (no GitHub fallback;
known failure survives lost diagnostics), `ci-integrated-state-*` and
`ci-queue-coverage` — 101 cases passed. The install checks
(`payload-declaration-links`, `execution-payload-update`,
`install-public-payload`, `install-preserves-open-dough-json`) passed and ran
the manual's example for discover and diagnose.

### 3. Intent reads proof from the selected attempt

Type: Behavior
Status: done

With a completed attempt selected in CI status or comparison, use the shared
selected-attempt request and proof decoder from that attempt's listing branch.
Document `proof` alongside the shared contract. Retain the existing summary
read bound and identity checks. Keep the build visible with the reason when its
summary is unavailable, invalid or ambiguous.

**Proof.** Run `ci-command-adapter-proof.test.mjs`,
`ci-proof-read-adapter.test.mjs`, `dashboard-ci-adapter-proof.test.mjs` and
affected Dashboard proof readers. Check the exact read, a valid old and new
summary, the oversized response, and an attempt whose identity is ambiguous.
Run the analogous GitHub proof readers when the shared summary decoder is reached.

**Delivered.** The runtime already had one selected-attempt request
(`readCiAdapterSummary` in `ci-proof-read.mjs`, listing branch, 1 MiB) and one
decoder (`readCommandProof` in `ci-command-attempt.mjs`), shared by
`dashboard/server/ciAdapterProof.ts` and `ci-proof-attempts.mjs`, so only the
manuals changed. `custom-ci.md` (227→247) gains a `### proof` contract
subsection with the identity check, and its limits name the 1 MiB answer and
the 600-byte reason. `custom-ci-proof.md` (132→99) keeps only Intent's
selection, completeness, schema, oversize, display, ambiguity and memory rules.
Proof: `ci-command-adapter-proof`, `ci-proof-read-adapter` and
`dashboard-ci-adapter-proof` (13 cases), backend `ci-proof-memory-adapter(-gaps)`
(9), `dashboard-story-branch-ci-adapter` ambiguity (6) and the
`payload-declaration-links`/`execution-payload-update` install checks passed;
the slice 1 `intent-ci-proof-adapter` e2e pass stands for the unchanged runtime.
`custom-ci.md` is 3 lines under the file-size limit, and the `jobs` section of
`custom-ci-proof.md` still repeats the request JSON and 600-byte rule for slice 4.

### 4. Intent reads job timing from the selected attempt

Type: Behavior
Status: done

With a completed comparison endpoint, use the same selected-attempt call to
read `jobs`. Document job timing alongside `proof`. Timing follows measured
dependencies and excludes runner waits. A missing or unusable graph leaves
the endpoint's wall time and proof available.

**Proof.** Run `dashboard-ci-adapter-revision-lookup.test.mjs`, the `jobs`
cases of `ci-command-adapter-proof.test.mjs`, and the affected comparison
timing readers, including `ci-time-without-adapter-runner-waits.spec.ts`.
Check the requested attempt and listing branch, the measured critical chain,
and the individual refusal reasons. Compare with the existing GitHub timing
behavior for the same outcome if the shared timing model is reached.

**Delivered.** `jobs` already used the shared selected-attempt call
(`readCommandJobs` → `runAdapterForAttempt` from
`baseCiAdapterRevisionLookup.ts`). Its copy of the proof answer check, with
the 600-byte reason cut, is now one private `readAttemptAnswer` in
`ci-command-attempt.mjs` (105→94); errors are unchanged, and JSDoc keeps the
Dashboard's types. `custom-ci.md` (247→248) gives `proof` and `jobs` one request
shape; `custom-ci-proof.md` (99→88) keeps only the jobs answer, timing and
refusal rules. Proof: the revision-lookup, adapter-proof (jobs cases),
proof-read and proof-units node tests (25 cases), `npm run typecheck:dashboard`,
backend `ci-time-without-adapter-runner-waits` (13) with the GitHub
`ci-time-without-runner-waits` (9), the install checks, and e2e
`intent-ci-proof-adapter` (4) and `intent-ci-proof-adapter-reasons` (3) passed.
At load average about 50 the reasons spec's eight-round "answers no proof" case
timed out twice after every assertion passed: its test-scoped Dashboard
fixture used about 26 of the 30 seconds. It passed at load 25. That fixed bound
is a test defect for a later correction.

### 5. The Dashboard requests one rebuild of the original landed revision

Type: Behavior
Status: done

With a qualifying landing and `ciRebuild` configured, pass the original attempt
through the shared command boundary. Document that separate permission and
request. Observe the accepted attempt by exact identity, or keep the follow-up
unverified on refusal or uncertain admission without sending again. Leave the
watcher and a Dashboard with no configured trigger read-only.

**Proof.** Run `ci-command-rebuild.test.mjs` and the Dashboard backend
`landed-ci-adapter-repeat`, `landed-ci-adapter-repeat-rejections` and
`landed-ci-adapter-repeat-comparability` specs. Check the submitted original SHA
and attempt, pending and comparable completion, and refusal/uncertainty across
later collection or restart. Use fixture CI for admission.

**Delivered.** The Dashboard already submits through the shared
`requestCommandRebuild` (`ciFollowUpAdapterProvider.ts`, separate `ciRebuild`
command, original `adapterAttempt` with the landed revision, from the project
folder) and observes the repeat with `ciAdapter` only, so only the manual
changed. `custom-ci-rebuild.md` (126→131) presents the trigger as a separate
permission and request in the shared `diagnose` shape, links the shared
protocol and limits instead of repeating them, and states that a failed or
invalid call counts as uncertain and is never resent. Proof:
`ci-command-rebuild.test.mjs` (5), backend `landed-ci-adapter-repeat`,
`-repeat-rejections` and `-repeat-comparability` (31, load 20–27) and the
install checks passed.

### 6. Pygardon's existing command works with the candidate install

Type: Behavior
Status: done

Install and update the candidate in disposable client checkouts, retaining
Pygardon's current `ciAdapter`, `ciRebuild` and integrated-state settings. Run
the actual adapter against its loopback provider from the updated checkout.
Exercise the installed watcher and the candidate Dashboard's discovery, proof,
jobs and one rebuild against that command. Align the payload declaration with
the changed runtime files and verify all promised operations before the tag.

**Proof.** `bash scripts/test.sh` with Bash 5 or newer over
`Distribution/tests/installation/{payload-declaration-links,execution-payload-update,install-public-payload}.sh`.
Repeat the Pygardon fixture route above against the candidate install, preserving
the current adapter and configuration. Attach the exact candidate Dashboard
read and rebuild requests with their corresponding fixture outcomes to this
slice's proof. Resolve any mismatch here before requesting release.

**Delivered.** No Open Dough change was needed. At candidate `3f184e313` the
`payload-declaration-links`, `execution-payload-update` and
`install-public-payload` checks passed with Bash 5. The six runtime and manual
files changed by slices 1–5 are declared unchanged in
`src/install/open-dough-execution-payload.sh` and `install.sh` and arrive
byte-identical. A disposable Pygardon clone at `49023bf9e` took the candidate
through `install.sh --replace-verified` for both skill roots; a plain install is
refused against its released 0.3.112 copy, and the version reads 0.3.112 until
the tag. `.planning/open-dough.json` stayed byte-identical (`ciAdapter`,
`ciRebuild`, `integratedStateCompletion`). Pygardon's eight adapter and watcher
test files passed 56 cases against the installed watcher, including recovery
from brief loss and a withheld verdict under persistent loss. Against its real
`pygardon-ci-adapter.mjs` and loopback provider, the candidate's
`discoverCommandAttempts`, `readCommandProof`, `readCommandJobs` and
`requestCommandRebuild` sent:

```json
{"operation":"discover","check":{"repo":"terryyin/pygardon","branch":"main"}}
{"operation":"proof","check":{"repo":"terryyin/pygardon","branch":"main"},"attempt":{"runId":"checked","attemptId":"checked","sha":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}}
```

`jobs` and `rebuild` sent the same attempt. Discover answered one
`pygardon-ci` push attempt; proof returned the retained summary unchanged; jobs
returned `prepared-checkout` at 90000 ms; rebuild was accepted as a new
`repeat` attempt by the loopback fixture's POST `/rebuild`. These are the
request shapes the Dashboard call sites build (string IDs, listing branch, full
revision; `baseCiAdapterRevisionLookup.ts`, `ciAdapterProof.ts`,
`ciFollowUpAdapterProvider.ts`). The Dashboard server itself was not run against
Pygardon's command; its mapping of these answers is proved by the backend specs
of slices 3–5.

### 7. A compatible tagged contract is available to Pygardon

Type: Behavior
Status: done

After candidate compatibility is proved, ship the simplified contract and its
upgrade instructions in the selected release. Give the published tag and
verified compatible pair to the
[Pygardon adoption story](https://github.com/terryyin/pygardon/blob/main/.planning/seeds/SEED-20261119-adopt-the-simplified-open-dough-ci-adapter.md#adopt-the-simplified-open-dough-ci-adapter).

**Proof.** Verify the tag contains the accepted payload. In the disposable
client, update through the tag, verify the installed version and contract,
and confirm the project settings still select its existing adapter. Reuse
slice 6's operation evidence where the tagged runtime matches the candidate.

**Release checkpoint.** The maintainer selects the next release version and
authorizes release. In Story Branch Mode, that same go-ahead covers Dough Land
`--keep-worktree` before cutting the tag from authorized trunk. Follow the
repository's release workflow and keep Pygardon's live installation on its
compatible installed pair until its adoption story. Live admission belongs to
the released production Dashboard under that adoption story.

**Delivered.** The maintainer selected 0.3.113 and authorized the release.
Dough Land `--keep-worktree` integrated the story at `488645e95`, and
`v0.3.113` was cut from trunk at `3202dbdc9`. Hosted CI passed at `e47487a99`,
and later commits before the tag changed only planning records and ADR 0003.
The self-installation check passed. A disposable Pygardon clone at `49023bf9e`
updated through the pinned tag with `open-dough-release.sh apply` for both
skill roots. Both report 0.3.113, `.planning/open-dough.json` is unchanged and
still selects `infrastructure/ci/pygardon-ci-adapter.mjs` for `ciAdapter` and
`ciRebuild`, and no reuse recipe is installed. The installed CI contract files
match the tag, which matches slice 6's candidate, so slice 6's operation
evidence stands. Pygardon's live installation stays on 0.3.112 until its
[adoption story](https://github.com/terryyin/pygardon/blob/main/.planning/seeds/SEED-20261119-adopt-the-simplified-open-dough-ci-adapter.md#adopt-the-simplified-open-dough-ci-adapter),
which receives `v0.3.113` as the compatible tag. The slice clock reported 73.6
active minutes because the hosted CI waits ran outside its `run` wrapper; the
maintainer chose to finish the release.

## Execution complete

Product advice: The simplified custom CI contract shipped in v0.3.113 without
changing the command wire contract. Pygardon's released command and settings
work unchanged, so its adoption story reduces to updating to v0.3.113 and
confirming live Dashboard admission and rebuild; its command needs no change.
The size reduction was small, about 12 lines of touched runtime and 37 of
manuals against the roughly 1,700-line audited area, because the boundary was
already near-minimal and most of that area is shared CI behavior still in use.
Remaining SEED-423 distribution-shrink stories should not count on further
savings from the custom CI adapter. Pass this note to the Pygardon adoption
story and keep current backlog priorities. The reasons-journey timeout under
load is corrected by SEED-413#hold-adapter-proof-reasons-in-default-timeout
(plan 798). Process review is deferred into wrap-up behind its Intent Coverage
check.

## Verification and delivery

- Use the [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  Start fully awake. On AC use `caffeinate -s -i` for full runs. On battery
  either connect AC or keep the lid open under `caffeinate -i`, then inspect the
  sleep log. Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Run the focused gates named by each slice, `npm run typecheck:dashboard` for
  Dashboard type boundary changes, and the payload checks because installed
  readers load the changed contract. Apply the [consumer proof procedure](../../../.agents/skills/dough-story-refinement/references/executable-proof.md)
  to attempt facts and replies across watcher, test optimization, Dashboard
  status/comparison/repeat, and installed payload. The owner records the
  assertion and result for each affected consumer before delivery. Apply the
  normal [post-change refactor](../../../.agents/skills/dough-post-change-refactor/SKILL.md)
  and commit and publication gates for each slice.

## Plan review

Slice-plan refinement split candidate compatibility and tagged delivery into
two proof loops so fixture issues can be settled before the release checkpoint.
The other boundaries each own one outcome and retain the same typed command
boundary. Seven slices, with no sizing exception or remaining slice-specific
concern.
