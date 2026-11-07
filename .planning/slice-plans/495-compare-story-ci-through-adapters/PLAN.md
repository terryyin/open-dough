# Compare story CI builds from custom adapters in Intent

**Identity:** SEED-257#compare-story-ci-through-adapters
**Source:** [Compare story CI builds from custom adapters in Intent](../../seeds/SEED-257-compare-story-ci-through-adapters.md#compare-story-ci-through-adapters)

**Source review:** [Independent source review](source-review.md)

## Execution context

- Story Branch Mode in the owned `compare-story-ci-builds-from-custom-adapters-in`
  worktree on `codex/compare-story-ci-builds-from-custom-adapters-in`, assigned
  to `juacompe-chan` by publisher `dashboard-territory.local-open-dough`.
- Starting revision `577b9e62135166386212d9041af1953e2eaf5f28`.
  Claim `fda495819e4a50af6b91f895d350a5bc78827a7f` is on `origin/main`
  and was the initial accepted revision on the execution branch.
- Worktree setup passed `node scripts/setup-native.mjs npm`,
  `node scripts/setup-native.mjs browser`, and `npm run --silent typecheck:dashboard`.
- CI observes `terryyin/open-dough`, `ci.yml`, on the execution branch.
  Coordinator `juacompe-chan-257`, directory `/tmp/dough-ci-501/watch-gRf5dY`,
  PID `86830`, stream `99544`, cell `g6:8`. The trunk claim predates this observer.

## Goal and scope

A developer reviewing a Taken or Done story in a `ciAdapter` project sees
Intent's story CI comparison with Baseline, Branch (or Provisional) and
Landed builds found among the adapter's `discover` attempts, each with its
wall time when recorded and its CI proof through the adapter's `proof` read,
instead of today's "does not list builds by revision" gap.

Included:

- A revision lookup over `discover` attempts behind the existing endpoint
  and first-parent ancestry rules (`lookupBaselineBuild`, `lookupResultBuild`
  in `dashboard/server/baseCiRevisionLookup.ts`), asking `discover` for the
  configured target and, when known, the story branch.
- Adapter build identity on comparison slots (`runId`/`attemptId` text and
  the branch whose `discover` listed it), kept apart from GitHub run
  numbers as `adapterAttempt` already is in `src/baseCiConfirmation.ts`.
- Wall time from `startedAt`/`completedAt` (`attemptTimesOf`), otherwise
  "not recorded".
- Endpoint proof through the existing adapter proof read
  (`dashboard/server/intentCiProofRead.ts` adapter parameters) from the
  comparison's proof hook (`dashboard/src/useIntentCiComparisonEntries.ts`).
- Named gaps for uncovered or expired revisions, `discover` failure, and a
  missing summary; GitHub Actions comparisons unchanged.
- Docs: `docs/dashboard-development-intent.md` (comparison for adapters),
  `dashboard/GITHUB-REQUESTS.md` (an adapter comparison asks GitHub
  nothing), and the client-payload manuals
  `src/skills/dough-execute-plan/manuals/custom-ci.md` and
  `custom-ci-proof.md` (the comparison also reads retained `discover`
  attempts by revision and asks `proof` for each shown endpoint).

Excluded (the seed's deferred promises): a historical lookup operation for
pruned attempts; time without runner waits for adapter builds (SEED-256's
unavailable rule); ancestor proof for skipped builds (SEED-254); cues and
wording (SEED-255); Pygardon's own `startedAt`/`completedAt`
(`SEED-20261079#show-ci-attempt-wall-time` in Pygardon).

## Existing solution and decisions

- PFE: reuse `createCommandAcquisition` (`discoverAncestorCandidates` for
  newest-per-check retained attempts, `discoverAnsweredAttempts` for the
  ambiguity count) as `dashboard/server/baseCiJudgment.ts` already runs it
  for the target and story branch; reuse `asAdapterAttempts`
  (`baseCiAdapterAttempts.ts`) so ambiguity counts the same way; reuse
  `nearestRevisionBuild` and the endpoint rules unchanged by giving them a
  `RevisionCiLookup` whose `listRunsAt` answers the adapter attempts at a
  revision. Reuse the adapter proof read as the CI status tab does; no new
  adapter operation.
- Attempt selection per revision: newest by `time` per check and context;
  a newer `incomplete` attempt falls back to the newest `success` or
  `failure` at that revision, mirroring the GitHub cancelled fallback.
- The story branch name for a second `discover`: the Taken claim's branch;
  for a done story, the landing's branch when published history names it,
  otherwise the target only. Pygardon's `discover` answers every branch's
  attempts regardless.
- Done answers stay remembered per process (`intentCiComparisonAnswers.ts`);
  a remembered build whose attempt later expires shows the proof read's
  reason.
- Follows [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
  builds derived on read from the adapter's observations, missing evidence
  named rather than measured. No ADR conflict; no North Star topic needed.
- Coordination: SEED-254, SEED-255 and SEED-256 (plans
  494, 493 and 492) change the same comparison read and view. Whichever executes later rebases onto
  the earlier one; this plan's slot identity change is additive.

## Premises and baseline

| Premise | Consuming observation | Result and remainder |
| --- | --- | --- |
| Pygardon's `discover` answers attempts at every revision the examples need, across branches | 2026-11-07 `GET https://mac-mini-tiger.tailb878f6.ts.net/api/ci` (the origin `scripts/pygardon-ci-adapter.mjs` resolves) mapped through `scripts/pygardon-ci-discovery.mjs` rules; first-parent walks in `~/git/pygardon` | 108 attempts 2026-09-27 → 2026-11-07, 27 branches. Passing attempts at `36191bf8b`, `90038b500`, `b450e5058`, `16b339eb8`. Attempts carry `time` but no `startedAt`/`completedAt`. |
| The existing endpoint resolver recovers the Pygardon example stories' revisions | 2026-11-07 scratch esbuild bundle of `publishedStoryEndpoints` with the production project configuration (`~/.open-dough/dashboard/projects-production.json`, project `pygardon`) at `c90e30dd1` | `SEED-20261076#publish-pygardon-ci-proof`: start `305165fa4`, branch side `eee4fa149`, merge `b450e5058`, story-branch. `SEED-20261075#story-live-jobs-updates`: start `5e8976e65`, fast-forward `16b339eb8`. Their first-parent walks reach the attempts above. |
| Pygardon's `proof` answers a valid summary for a discovered attempt | 2026-11-07 `node scripts/pygardon-ci-adapter.mjs` in `~/git/pygardon` with `{"operation":"proof",…,"attempt":{"runId":"f4880532-…","attemptId":"f4880532-…","sha":"d1b35a09a…"}}` | Valid schemaVersion 1 summary, `tests` 6,402 checks, no `durationMs`. Proof for the example attempts is observed live in slice 4. |
| The comparison refuses adapter projects before any lookup | `dashboard/server/baseCiRevisionLookup.ts` `revisionLookupOrGap`; no test asserts its wording (`grep -rl "does not list builds by revision"` finds only that file) | Slice 1 replaces it with no spec consumer to migrate. |
| The adapter fixture project and comparison specs pass at the starting revision | 2026-11-07 at `c90e30dd1` after `node scripts/setup-native.mjs npm` and `browser`: `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts --reporter=list` on `intent-ci-proof-adapter.spec.ts`, `intent-ci-proof-adapter-reasons.spec.ts`, `intent-ci-comparison.spec.ts` (load 3.2–4.5) | 11 passed in 30.8 s. Plan 492's run of all six `intent-ci-comparison*.spec.ts` at `923f5abc2` (17 passed) still applies: no `dashboard/` change since. The fixture (`dashboard/tests/intentCiAdapterProofProject.ts`) answers `discover` per asked branch and records each request. |

## Outside-in proof and ownership

| Promise | Owner | Proof |
| --- | --- | --- |
| Done story builds from `discover`, exact and ancestor, with adapter identity and wall time (examples 1, 2) | 1 | new `dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts`, fixture shaped on `SEED-20261076` (merge landing) and a fast-forward story |
| Endpoint proof counts through `proof`, missing summary keeps the build (example 4) | 2 | same spec: summaries per attempt, one `unavailable`; adapter request log shows one `proof` per completed endpoint with its `runId`, `attemptId`, revision and listing branch |
| Taken story, running tip with completed ancestor, wall time not recorded vs recorded, expired baseline, retry and incomplete selection, `discover` failure (examples 3, 5) | 3 | `intent-ci-comparison-adapter.spec.ts` gap cases; module test of the adapter revision lookup's per-revision selection under `dashboard/backend-tests/` |
| GitHub Actions comparisons unchanged | 1–3 | the six existing `intent-ci-comparison*.spec.ts` files stay green |
| Live Pygardon comparison | 4 | throwaway dev server observation (below) |

**Local gates:** `npm run lint`, `npm run --silent typecheck:dashboard`, the
focused module test through `bash scripts/test.sh <paths>`, and through
`npx playwright test --config dashboard/playwright.config.ts --reporter=list`
(with `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`)
the new adapter comparison spec, the six `intent-ci-comparison*.spec.ts`
files, the two `intent-ci-proof-adapter*.spec.ts` files and the three
`intent-summary-story-comparison*.spec.ts` files (they consume the slot
schema), under the maintained macOS sleep guard
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos):
fully awake on observed AC with `caffeinate -s -i`, or the lid-open
`caffeinate -i` procedure on battery with sleep-log inspection). Manual
edits run the repository's manual and skill checks named by
`npm run lint`. No full suite locally: the change stays within Intent's
comparison read, its proof hook and two manuals; hosted CI runs the rest.

**Failure policy:** [Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written.

## Ordered slices

### 1. Find a done story's builds among the adapter's discovered attempts
Type: Behavior
Status: done
Proof: `intent-ci-comparison-adapter.spec.ts` done cases; the six existing
comparison specs; typecheck and lint.

Behavior: A done Story Branch story in an adapter fixture project whose
`discover` answers passing attempts at the start's nearest built ancestor,
at a story-side ancestor of the branch side and at the landing merge, each
with `startedAt`/`completedAt` → Intent's comparison shows Baseline and
Branch as ancestors and Landed exact, each naming its revision, subject,
adapter `url`, `attemptId` and wall time; a fast-forward story shows Branch
and Landed at the same exact attempt. The adapter is asked `discover` for
the target and the story branch, and GitHub nothing. Replaces the refusal
in `revisionLookupOrGap`; adds adapter identity to the comparison slot
schema.

Accepted proof: both new adapter Chromium journeys passed. Their real
published fixtures verify the merge and fast-forward endpoints, IDs, listing
branches and wall times. The 37 existing comparison, adapter proof, Intent
summary and completed Review checks passed in the same selection. The first
run exposed an incorrectly scoped row locator in the two new tests. Both
passed after the locator fix. Dashboard typecheck and lint passed, as did
the command-adapter attempts, acquisition and proof module checks with
Homebrew Bash first on PATH. The source review records the observing
assertions for each commitment.

Independent refactor shared branch discovery and ambiguity with CI status
and removed the redundant completion verification after discovery. The
affected browser selection passed 37 checks, including both new adapter
journeys, status/proof, comparison/Summary, and launch. The six
`dashboard-story-branch-ci-adapter.test.mjs` cases and dashboard typecheck
passed. The timeout journey remains slice 3 proof.

Published to the execution branch at
`8dcf704f628c57e8a2e52e6ecb4846e815423ec0`. A competing remote tracking ref
update interrupted the post-push fetch. Managed resume confirmed that SHA
with zero additional pushes, and the observer had registered it.

### 2. Read each endpoint's proof through the adapter
Type: Behavior
Status: done
Proof: `intent-ci-comparison-adapter.spec.ts` proof cases with the
fixture's request log; `intent-summary-story-comparison*.spec.ts` stay
green.

Behavior: The same done story with a kept summary at Baseline and Branch
and `{"unavailable": "no summary retained for this attempt"}` at Landed →
the comparison entries show Baseline and Branch counts and their
differences, and Landed keeps its build with that reason where its counts
would be. Each completed endpoint asks `proof` once with its `runId`,
`attemptId`, full revision and listing branch; an attemptId another
answered attempt shares at that revision is ambiguous and not asked.
Updates `custom-ci.md`, `custom-ci-proof.md`,
`docs/dashboard-development-intent.md` and `dashboard/GITHUB-REQUESTS.md`.

Accepted proof: the adapter comparison spec asserts three exact proof
requests for the merge, counts (5 to 8 tests, +3), durations (3 s to 5 s,
+2 s) and the retained Landed build beside its missing-summary reason.
The fast-forward journey observes the invalid Baseline reason and both
ambiguous endpoint reasons, with no ambiguous proof requests. A focused
adapter-proof module test proves separator-containing IDs cannot collide in
the shared proof cache. The focused Chromium group passed 36 comparison,
Summary and adapter CI status checks, and three status wall-time checks
also passed. Typecheck, lint, adapter proof, guidance and entry tests
passed. The adapter fixture exercised the manuals' discover-to-proof request.

Independent refactor bound the request subject and key to the same render
and retained each journey's assertions. The 30 comparison and Summary
Chromium checks passed after refactoring, as did typecheck, the guidance
check and whitespace verification. The CI status and cache proof remained
applicable.

Published to the execution branch at
`c7432cf1464b3f7efb02cdbf8c7de5e126bf2cf8`, registered with the same observer.
Before slice 3, the branch merged published trunk
`550875ae5c991a1b2811fb40f1e46159bc974cc3` to keep SEED-253's completion
recovery and SEED-256's timing fields. Wall time remains measured for
adapter builds, and time without runner waits gives the no-job-graph
reason. The combined comparison, CI status, Summary, runner-wait
computation and completed Review selection passed 47 Chromium checks.
Selective formatting and dashboard typecheck passed.

Hosted CI for reconciliation `b4388ccb033a89d1b46048f586015129232b0a07`
failed only the Cursor replacement controls test (run 42355746170, attempt 1,
dashboard shard 7). The trace showed the fixture hang up a session before
its keep settled, and a controlled local schedule reproduced the exit writer
reading the truncated fixture document and losing the scoped record.
The repair waits for both durable last-held keys, seeds the fixture records
atomically, and checks the new runner PID while preserving every attach and
Recover assertion. Five affected Chromium cases passed. The controls and
last-held persistence also passed with an 8-second paste repaint challenge,
after which the original 300 ms fixture setting was restored.

### 3. Taken stories and named gaps for adapter builds
Type: Behavior
Status: planned
Proof: `intent-ci-comparison-adapter.spec.ts` Taken and gap cases; module
test of per-revision attempt selection.

Behavior: A Taken Story Branch story whose tip attempt is `pending` and
whose previous story-side commit passed at 10:00:00–10:06:30 → Branch shows
that ancestor with 6 min 30 s and a later attempt still running, Landed
says not landed yet; a Trunk Mode Taken story shows Provisional likewise.
An attempt without `startedAt`/`completedAt` says its wall time is not
recorded. A start whose 30 first-parent ancestors have no answered attempt
→ Baseline's existing "No completed CI build was found at or before the
story's start …" gap while Branch and Landed keep theirs. A `failure` then a
later `success` at one revision uses the success; a later `incomplete`
after a `success` still uses the success. A failing `discover` makes the
endpoints unavailable with the adapter's reason.

### 4. Observe the live Pygardon comparison
Type: Behavior
Status: planned
Proof: a throwaway dev server from this worktree reading the production
project configuration, driven by the worktree's headless Playwright Chromium,
selecting `SEED-20261076#publish-pygardon-ci-proof` and
`SEED-20261075#story-live-jobs-updates` in Pygardon's Intent; record the
shown endpoints, wall-time wording and proof counts or reasons in this plan.

Behavior: Pygardon's Intent comparison for `SEED-20261076` shows Baseline
`36191bf8b`, Branch `90038b500` (both ancestors) and Landed `b450e5058`
(exact), wall time not recorded, and `proof` counts or the adapter's reason
for each; `SEED-20261075` shows Baseline `b450e5058` and Branch and Landed
`16b339eb8`. If Pygardon's service has pruned an attempt by then, the
endpoint shows the named gap and the observation records that instead. No
code change is expected; a mismatch is a defect in slices 1–3.

## Plan concerns

Slice-plan refinement was not needed: four slices, each one proof loop on
one boundary (build lookup, proof read, selection and gaps, live
observation), with no fragmented or combined outcome. This review
identified no remaining slice-specific concern.

## Story obligations

### G1. Adapter proof in the delivered comparison
Reported: slice 1 — "Slice 2 owns adapter endpoint proof, which currently shows the existing no-summary message."
Story clause: "Proof for each completed build through the existing adapter `proof` read"
Disposition: proved by slice 2: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts merge proof requests and comparison entries

### G2. Preserve the adapter reason on a discovery deadline
Reported: slice 1 — "If the shared signal itself expires while discovering, lookupOrGap returns the adapter reason then the Git verification can throw and hide that reason."
Story clause: "A failed or timed-out `discover` makes the endpoints unavailable with the adapter's reason"
Disposition: receiving slice 3
