# Run dashboard CI follow-up through a custom CI rebuild trigger

**Identity:** SEED-330#invoke-custom-ci-rebuilds
**Source:** [Run dashboard CI follow-up through a custom CI rebuild trigger](../../seeds/SEED-330-dashboard-ci-follow-up.md#invoke-custom-ci-rebuilds)

**Source review:** [Source-only review](source-review.md)

## Goal and scope

A custom project declaring `ciRebuild` gets the production dashboard's one-repeat slowdown check: request the original attempt once, follow the exact accepted identity through `discover`/`proof`, compare against the frozen reference using the existing 5% rule, and show the same cards/review. Refused, uncertain and non-comparable results remain unverified and never resend. Document the contract and prove it with a fixture provider.

Preserve allowance/deduplication, GitHub behavior, production guard, read-only `ciAdapter`, thresholds/reference and Intent proof completeness. Exclude adaptive repeats, backfill and cross-machine coordination. Pygardon's [rebuild story](https://github.com/terryyin/pygardon/blob/main/.planning/seeds/SEED-20261107-dashboard-ci-rebuilds.md#provide-dashboard-ci-rebuilds) owns its trigger, proof-completeness repair and released-dashboard integration (Terry, 2026-11-12). The selected source remains authoritative for every promise.

## Prerequisite

[Follow-up by default](../../seeds/SEED-330-dashboard-ci-follow-up.md#make-ci-follow-up-automatic) is satisfied at integration `4f791771554d7a9f757f2db098b37c18e2a1514d`; this execution inherits its automatic receipt admission without a project setting or machine designation. The seed retains the supplier evidence.

## Architecture and existing solutions

Follow [one CI repeat across providers](../../NORTH-STAR.md#one-ci-repeat-across-providers).
PFE findings:

- **Timing and decision reuse.** `wallTimeReadingOf` and `wallTimeReferenceOf`
  already read adapter builds (`adapterAttempt`, `startedAt`, `completedAt`,
  proof). The only adapter exclusion is the `adapterAttempt`/numeric `runId`
  clause in `repeatDecisionOf`. Observed below on real Pygardon history.
- **Proof reuse.** `collectedProofOf` (`landedCiCollectedProof.ts`) already
  asks an adapter's `proof` for an adapter attempt; the repeat's measurement
  reuses it unchanged.
- **Command transport reuse.** `ci-command-adapter.mjs` owns the launch,
  bounds and envelope checks for adapter commands (`runAdapterForAttempt`,
  `readCommandProof`, `readCommandJobs`). The `rebuild` request reuses that
  transport with the `ciRebuild` command.
- **Discovery reuse.** `baseCiAdapterAttempts.ts` already runs `discover` for
  the dashboard; the custom provider's observation finds the accepted attempt
  there by exact `runId`/`attemptId`.
- **Configuration.** `ciConfiguration` (`baseCiJudgment.ts`) and the shared
  `readCiConfiguration` (`ci-project-configuration.mjs`) read `ciAdapter`;
  `ciRebuild` is read and validated beside it, applying only with `ciAdapter`.
- **Accepted decisions.** [ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
  keeps the declaration in `.planning/open-dough.json`.
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
  the ledger stays machine-local operational evidence, the provider owns the
  build outcome. No conflict.

### Already-oversized expected edits

| File | Lines | Reorganization | Slice |
| --- | --- | --- | --- |
| `src/skills/dough-execute-plan/scripts/ci-command-adapter.mjs` | 250 | Keep observer acquisition (`createCommandAcquisition`, diagnostics) here. Move the dashboard's selected-attempt operations (`readCommandProof`, `readCommandJobs`, and the new `requestCommandRebuild`) with their shared `runAdapterForAttempt` transport into `ci-command-attempt.mjs`. Callers: `ciAdapterProof.ts`, the dashboard jobs reader, their tests; the observer's own tests stay. | 2 |
| `src/skills/dough-execute-plan/manuals/custom-ci.md` | 250 | Replace the "CI proof reads" section with one "Dashboard operations" section linking `custom-ci-proof.md` and the new `custom-ci-rebuild.md`, no longer than today's section. Its runnable-adapter markers stay untouched. | 4 |
| `dashboard/tests/intentCiAdapterProofProject.ts` | 245 | Move the provider script's per-operation answering into a fixture module beside it, keeping `adapterProject` as the entry; add the `rebuild` answer and its request log there. | 2 |

## Outside-in proof ownership

| Promise (seed example) | Slice | Proof |
| --- | --- | --- |
| Existing GitHub follow-up and saved GitHub requests behave as before behind the seam (unchanged) | 1 | The follow-up specs and ledger tests named in slice 1 pass unchanged; a ledger case reads a request saved in today's GitHub shape |
| A qualifying custom landing with `ciRebuild` sends one `rebuild` naming the original attempt, shows progress, then slow at 106 s or returned to range at 98 s (1) | 2 | New `dashboard/backend-tests/intent/landed-ci-adapter-repeat.spec.ts` through real receipt ingestion with the adapter project fixture |
| A custom project with only `ciAdapter` gets no request and keeps its readings (5) | 2 | Same spec: the adapter-only case records no `rebuild` request while its landed history still collects |
| Refused, uncertain (timeout, nonzero exit, bad answer) and non-comparable results show their unverified explanations and are never resent (2, 3, 4) | 3 | Cases in `landed-ci-adapter-repeat-{rejections,comparability}.spec.ts`; each asserts one `rebuild` request across later collections and a restart |
| The review shows both custom attempts' identity, check, bounds, wall time, proof completeness and link against the saved reference (1) | 4 | `dashboard/tests/intent/intent-ci-follow-up-custom.spec.ts` custom cases through the review route |
| The contract and guidance describe the trigger (scope) | 4 | `custom-ci-rebuild.md`, `custom-ci.md`, `docs/dashboard-ci-follow-up.md`, `dashboard/PROJECT-CONFIGURATION.md` reviewed against shipped behavior |

## Ordered slices

### 1. One repeat flow with a GitHub Actions provider

Type: Structure
Status: done
Proof: unchanged follow-up behavior through the existing specs and ledger
tests listed below; a ledger case reads a saved request in today's GitHub shape.

Internal change: introduce the repeat provider seam of the North Star topic.
Move `prepareCiRepeat`, the `repeatGitHubWorkflow` submission and
`observeRepeat`'s GitHub reads behind a GitHub provider with *prepare*,
*submit* and *observe*. `collectCiFollowUps` selects the provider from the
project's CI configuration and keeps admission, spend-before-submit,
never-resend and outcome retention. Split `repeatRequestSchema` into shared
fields and a provider-tagged part; a request without a tag reads as GitHub.
Keep the GitHub explanation strings and outcome kinds byte-for-byte.
Enables slice 2.

Focused local checks:

```sh
PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/support/ci-follow-up-ledger.test.mjs tests/support/ci-follow-up-policy.test.mjs tests/support/ci-follow-up-reading.test.mjs
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts dashboard/backend-tests/intent/landed-ci-follow-up-reading.spec.ts dashboard/backend-tests/intent/landed-ci-repeat-admission.spec.ts dashboard/backend-tests/intent/landed-ci-repeat-receipt-boundary.spec.ts dashboard/backend-tests/intent/landed-ci-repeat-reconciliation.spec.ts dashboard/backend-tests/intent/landed-ci-repeat-verdict.spec.ts dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts dashboard/tests/intent/intent-ci-follow-up.spec.ts --reporter=list
npm run typecheck:dashboard
```

Use the spec set as trunk holds it after plan 604 lands; rerun the consumer
trace for `repeatRequestSchema`, `RepeatRequest`, `prepareCiRepeat`,
`observeRepeat` and `repeatGitHubWorkflow` and add every spec it names.

### 2. A slow custom landing gets one rebuild and a verdict

Type: Behavior
Status: done
Proof: `landed-ci-adapter-repeat.spec.ts` accepted and adapter-only cases;
the accepted case fails with the provider unselected (adapter projects still
skipped).

Behavior: a production dashboard project with `ciAdapter` and `ciRebuild`,
five prior exact 100 s adapter builds with complete proof → a Done receipt
lands on an exact 105 s successful attempt → exactly one `rebuild` request
reaches the trigger naming that attempt's `runId`, `attemptId` and `sha`; the
accepted answer's attempt, listed pending by `discover`, gives **CI rerun in
progress**; listed `success` at 106 s with complete proof it gives **Possible
CI slowdown**, and at 98 s **CI timing returned to range**. With only
`ciAdapter`, the same landing sends no request and its history still collects.

- Configuration: read and validate `ciRebuild` (nonempty string array, empty
  or absent means none) in `readCiConfiguration` and `ciConfiguration`.
- Decision: admit exact adapter builds in `repeatDecisionOf`.
- Custom provider: *prepare* checks the original exact attempt is retained,
  successful and complete; *submit* runs `requestCommandRebuild` through the
  reorganized `ci-command-attempt.mjs`; *observe* finds the accepted
  `runId`/`attemptId` in `discover`, requires the full comparable repeat of
  the seed, and measures it through `collectedProofOf`.
- Fixture: the reorganized adapter project fixture answers `rebuild` and logs
  each request.

Focused local checks: the new spec, `ci-command-adapter*.test.mjs` and
`ci-client-configuration.test.mjs` through `bash scripts/test.sh`, the slice 1
spec set, and the typecheck.

### 3. Refused, uncertain and non-comparable rebuilds stay unverified

Type: Behavior
Status: done
Proof: the refused, uncertain and non-comparable cases in
`landed-ci-adapter-repeat-{rejections,comparability}.spec.ts`, each with one recorded `rebuild` request
after later collections and a dashboard restart.

Behavior: the trigger answers refused with a reason → the card shows the
refusal and reason. It times out, exits nonzero or answers outside the shape
→ the card says acceptance is uncertain and will not be resent, and no later
attempt is attributed. The accepted attempt is listed with another `sha` or
`check`, fails, or completes with partial proof → the matching unverified
explanation, no slow or in-range verdict. Reuse the existing explanation
wording where the meaning is the same; add only provider-neutral wording the
GitHub explanations lack.

Keep accepted journeys in their current spec. Submission outcomes and accepted-attempt comparability have separate focused specs above; keep concrete condition/expectation matrices visible in those specs and share only ingest/restart mechanics. Extend scenario controls within their fixture responsibility.

### 4. Review custom attempts and document the trigger

Type: Behavior
Status: done
Proof: custom cases in `intent-ci-follow-up-custom.spec.ts`; guidance review.

Behavior: a settled custom repeat → **Review original, repeat and saved
reference** shows each attempt's `runId`/`attemptId`, check, revision, bounds,
wall time, proof completeness and the listed link, with signed differences
against the saved average, and no GitHub workflow wording.

- Write `src/skills/dough-execute-plan/manuals/custom-ci-rebuild.md` and declare it in the shared promoted payload: the
  declaration, request, three results, failure-as-uncertain, never-resent,
  full comparable repeat, and that `discover` must list the accepted attempt
  under the answered identity, including while queued. Write it for the agent
  of the project implementing the trigger (ADR 0006).
- Reorganize `custom-ci.md` as tabled above and link the new manual.
- Update `docs/dashboard-ci-follow-up.md` and
  `dashboard/PROJECT-CONFIGURATION.md` for the custom trigger.

## Verification and local gates

Focused checks per slice as listed. No whole local suite is required by this
project for this change; hosted CI runs every check after publication. Before
landing, run `npm run lint`, `npm run typecheck:dashboard` and
`git diff --check`.

**Local gate:** use the maintained
[macOS sleep guard](../../../tests/local-test-resources.md#machine-sleep-on-macos)
for any long run: start fully awake; on AC use `caffeinate -s -i`; on battery
plug in or keep the lid open under `caffeinate -i` and inspect sleep logs.
Record the one-minute load beside each focused Playwright run. Never wait for
wall-clock time, use `test.slow()` or override a timeout; drive pending and
settled provider answers through the fixture's held and released answers.

The [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
applies as written and accompanies every delegation and repair handoff.

## Decisive premises and observations

Observed read-only on 2026-11-12 at preparation revision `ca9add8a368acb42455d6134a1638b8686a6e934`: Node ran an esbuild bundle of `dashboard/server/ciWallTimeReference.ts` and `dashboard/src/ciFollowUpRule.ts` over this machine's `~/.open-dough/dashboard/landed-ci-history.json`.

| Premise | Consuming operation and observed form | Result and remainder |
| --- | --- | --- |
| Adapter landed builds give the decision a wall time and saved reference | `wallTimeReadingOf` and `wallTimeReferenceOf` over Pygardon's 13 exact adapter landings, as retained | Every build: no wall time, "Declared CI proof part is missing". Each summary declares `e2e_test/packaged/features`, which Pygardon's per-commit CI never runs (`scripts/emit-ci-proof-summary.sh` expects every `intent.locations` path; the contract lists only proved entries) |
| The same functions work for adapter builds once proof is complete | Same run with that one entry removed from each retained summary | Wall times 470–516 s; reference averages 499–505 s from the sixth landing; none reach 5%. The decision only needs its adapter exclusion removed (slice 2) |
| Pygardon offers a retry that names the new attempt | Read of Pygardon `scripts/pygardon-ci-adapter.mjs --retry`, `docs/ci-incomplete-attempt-recovery.md` and `POST /api/ci/attempts/{id}/retry` at Pygardon `ecc0bfaee` | Answers `attempt_id` and state `queued`/`running`; existing work for the revision is answered instead of new work; unresolved admission exits 3. No `ciRebuild` declaration or `rebuild` operation yet; Pygardon's adapter answers `discover`, `diagnose`, `proof`, `jobs` |
| Adapter proof reads serve the repeat's measurement | Read of `landedCiCollectedProof.ts` and `ciAdapterProof.ts` | `collectedProofOf` asks the adapter's `proof` for adapter attempts. Slice 2's spec observes it end to end |

All premises are settled. Pygardon's rebuild story owns its missing proof; fixture proof here is independent of its current inability to qualify.

## Current decisions

- Separate `ciRebuild` may name the adapter script; the observer remains read-only.
- Every unparsed trigger outcome is uncertain; never resend or attribute an attempt.
- Keep Intent's existing proof-completeness rule for every provider.
- Story Branch Mode; no trunk-only step. The four planned proof loops needed no refinement; the prerequisite is settled.

## Execution context

Established start verified 2026-11-12: `SEED-330#invoke-custom-ci-rebuilds`, publisher `dashboard-territory.local-open-dough`, agent `ruuf-chan`, Story Branch Mode; reused owned workspace `/Users/terryyin/git/open-dough/.worktrees/run-dashboard-ci-follow-up-through-a-custom-ci-r`, branch `codex/run-dashboard-ci-follow-up-through-a-custom-ci-r`; origin/main claim accepted at `1117582709db72b2c3bc842ef4e388d9e6866a8d`, starting revision `653de1a896eb7267d3756d7db7964e6a2cad17ce`. Current accepted story-branch base/candidate: `148eea4b194e7dc37496e5d27ba539685c27fef2`; retained publication suffix base `d73d92f9b31e3ed6c8823f8005f87c2dc26ac68d`. Readiness remains **Changed since readiness review**; no renewed review.

Checkout setup `npm ci` (unchanged lock) and `npm run typecheck:dashboard` passed. Preserve existing replanning authority; no numeric slice budget supplied. Increment target is origin's story branch; default checkout `/Users/terryyin/git/open-dough` and unrelated worktrees remain preserved.

CI observer: Codex cell `g165:11`, session `92679`, coordinator `ruuf-chan`, PID `31050`, directory `/tmp/dough-ci-501/watch-hUTID2`; repository `terryyin/open-dough`, target story branch, GitHub Actions `ci.yml` verified active (351271804, CI). Runtime: this checkout's installed `.agents/skills/dough-execute-plan`. Trunk claim `pendingCi: unobserved`.

Local expensive proof: AC, awake, initial load 37.01; slice-1 launch 17.88/~14 GiB inactive memory, one worker under `caffeinate -s -i`. Other owners include SEED-324 repeat checks and page-object worktrees; leave their resources untouched. Command owners recheck load/memory before expensive work, reconsider on failure/contention, and follow to terminal result. No whole local suite required.

Slices 1–4 acceptance, literal proof, supplier-spec substitution and consumer dispositions are retained in [source review acceptance](source-review.md#slice-1-acceptance). Source freshness unchanged at pinned trunk `1117582709db72b2c3bc842ef4e388d9e6866a8d`; named supplier already inherited. Independent `refactor1` returned `## REFACTOR COMPLETE`: none — already clean; no edits/tests, accepted proof unchanged.

## Story obligations

### G1. Custom review still labels its check as a workflow
Reported: slice 2 — "The read model carries adapter evidence, but the frontend still labels Workflow; provider-neutral review remains for slice 4."
Story clause: "The review shows each attempt's run and attempt identity, check, revision, bounds, wall time, proof completeness and provider link when one was listed."
Disposition: proved by slice 4: intent-ci-follow-up-custom.spec.ts both106/98 review outcomes show check/context/run+attempt identity,sha,bounds,walltime,proof and signed reference deltas with no Workflow/GitHub wording
Commitment: C44
### G2. Observe omitted original proof declaration rejection
Reported: slice 2 — "Product requires original declared proof identities as a subset, but the negative case omitting one original declared entry remains for slice 3."
Story clause: "proof as complete as the original's."
Disposition: proved by slice 3: landed-ci-adapter-repeat-comparability.spec.ts original declares tests+integration,repeat partial or omits integration with tests complete,retained helper proves unverified/no-resend/restart
Commitment: C35
### G3. Confirm distinct attempt across numeric and text identity forms
Reported: slice 2 — "Coordinator inspection found strict attemptId equality while proof and discovery ambiguity use text identity; assess numeric 1 versus string 1 when the original is absent from later discovery and prove a same attempt cannot qualify as distinct."
Story clause: "a different `attemptId` from the original"
Disposition: proved by slice 3: landed-ci-adapter-repeat-comparability.spec.ts original numeric1 preserved on wire,accepted text1 with original absent stays unverified/unattributed/no-resend after restart
Commitment: C28
### G4. Installed proof reader lacked extracted transport module
Reported: slice 2 — "CI run43235536671 attempt1 failed four native evidence families; installed-use red then reproduced missing ci-command-attempt.mjs because the promoted payload declaration omitted it."
Story clause: "The dashboard follows the accepted attempt through the existing `discover` and `proof` reads."
Disposition: proved by slice 2: installed-ci-proof-fixture.bash real installed reader/wire assertions after fresh install and ordinary update in both roots, including unavailable release source; native-evidence-identity.sh four families pass
Commitment: C26

### G5. Preserve custom provider links in follow-up review
Reported: slice 4 — "Slice4 inspection found ciFollowUpReading applies exactAttemptUrl to custom attempts, dropping listed provider URLs; use the existing provider-neutral URL reader for custom branches."
Story clause: "The review shows each attempt's run and attempt identity, check, revision, bounds, wall time, proof completeness and provider link when one was listed."
Disposition: proved by slice 4: intent-ci-follow-up-custom.spec.ts exact original/repeat providerhref assertions; ci-follow-up-reading.test.mjs completed/observed shapes preserve listed URLs and keep absent links absent via observedAttemptUrl
Commitment: Q07