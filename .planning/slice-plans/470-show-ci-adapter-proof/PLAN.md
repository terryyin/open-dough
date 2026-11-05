# Show the CI proof of a CI-adapter attempt

**Identity:** SEED-236#show-ci-adapter-proof
**Source:** [selected story](../../seeds/SEED-236-show-ci-adapter-proof.md#show-ci-adapter-proof)
in SEED-236, refined 2026-11-05 with challenge, clarify, investigate and
architecture.
**Source review:** [source-review.md](source-review.md)
**Prepared:** 2026-11-05. Planning only, in the story's established workspace
(branch `claude/show-the-ci-proof-of-a-ci-adapter-attempt`, agent mrsn-chan),
continuing the refinement in the same session.

## Goal and boundaries

A developer opening Intent → CI status for a `ciAdapter` project sees the
displayed attempt's published proof counts and parts below its unchanged
verdict, or one line saying why there is none. The seed's seven key examples
are the acceptance. The story ends with an Open Dough release carrying the
collector, the adapter `proof` operation and their guidance, which Pygardon's
`SEED-20261076#publish-pygardon-ci-proof` consumes.

Included, as the seed records: the collector's adapter-attempt identity
(fragment and summary), the adapter `proof` operation and its shared runner,
the adapter judgment keeping attempt identity, the tab's proof read and
reasons, the guidance, and the release. Excluded: the GitHub Actions reader's
behavior and requests, the execution observer, `discover`/`diagnose`, the
launch's base-CI confirmation, `runId` in the summary identity, structured
adapter reason codes, proof history, other projects' copies, and the live
Pygardon check.

Apply this repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
throughout. Local gate: each slice's focused proof through
`bash scripts/test.sh <paths>` (node tests) or the dashboard's Playwright
runner for the named specs. Before landing, because the dashboard's shared
CI-status and proof paths change, run `npm test` and `npm run test:dashboard`
once, with Homebrew Bash 5 first on PATH under `caffeinate -s -i` on AC power
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)).
A fresh worktree needs the native setup before any Playwright run.

## Direction and PFE

- **Collector (change):** `src/skills/dough-test-optimization/scripts/ci-proof-contract.mjs`,
  `ci-proof-fragments.mjs`, `ci-proof-collect.mjs` and the `ci-proof-summary.mjs`
  CLI gain one alternative identity: an adapter attempt named by text
  `attemptId` (CLI `--attempt-id`) in place of the integer attempt and
  `--run-id`. One identity rule is shared by fragment, collection and
  summary: a fragment or summary names exactly one of the two identities, and
  collection keeps only fragments of the same identity and revision. The
  artifact name stays GitHub-only. `schemaVersion` stays 1: every existing
  summary remains valid, and only readers deployed from `main` see the new
  shape.
- **Adapter runner (reuse):** `runAdapter` (moved by slice 2's refactor into `ci-command-run.mjs`, a new payload file)
  already enforces the 20 s timeout and 64 KiB stdout limit for
  `discover`/`diagnose`. Export one `readCommandProof` beside it that sends
  `{operation: "proof", check, attempt: {runId, attemptId, sha}}` and accepts
  only `{summary: <object>}` or `{unavailable: <nonempty text>}` (bounded like
  the diagnose reason). The observer does not call it.
- **Judgment identity (change):** `dashboard/server/baseCiJudgment.ts` strips
  `databaseId`/`attempt` so `baseCiNearest.ts` `runIdentityOf` never mistakes a
  numeric adapter identity for a GitHub run. Keep that, and carry the shown
  and completed-ancestor results' adapter identity (`runId`, `attemptId`) plus
  whether another discovered attempt shares that `attemptId` and revision, in
  a separate adapter field of the judged result.
- **Proof read (extend):** `dashboard/server/intentCiProofRead.ts` gains the
  adapter form of `intent=ci-proof` (adapter `run`, `attempt-id`, `revision`,
  bounded text), which runs `readCommandProof` from the project folder with
  the configured `ciAdapter`, validates the summary with the shared schema
  (`dashboard/src/ciProof.ts`), and compares repository, `attemptId` (text
  form) and revision. The GitHub form and `ciProofArtifact.ts` stay as they
  are.
- **Tab (extend):** `dashboard/src/IntentCiProof.tsx` reads adapter proof for
  the shown adapter attempt instead of the `ci-adapter` short-circuit, names
  the attempt by its `attemptId` and short revision, and reuses
  `ciProofWording.ts` rows and reasons; the `ci-adapter` reason is replaced by
  the adapter-failure and adapter-reason lines.
- **Accepted decisions:** ADR 0008 (observe without owning; unavailable,
  mismatched and ambiguous proof are not a negative result), ADR 0003 (payload
  edits stay Proposed until slice 5's release), ADR 0006 (guidance addresses
  the agent in the adapter's project). No conflict. No North Star topic is
  needed: the design is the seed's Architecture plus this section.

## Decisive premises

| Premise | Consuming operation | Observation (form, profile, time) | Result | Remainder |
| --- | --- | --- | --- | --- |
| The collector cannot name a UUID attempt today | Slice 1 `fragment`/`summarize` | `node src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs fragment --outcomes <tmp> --entry tests --part 1 --of 1 --attempt 9f1c2d3e-0000-4000-8000-000000000001 --revision <40 hex> --out <tmp>`, Node 24.21.0 (= `.node-version`), this workspace at `78ea4e9`, 2026-11-05 | exit 1, `--attempt … is not a positive integer`; `summaryProblems` likewise requires integer `runId`/`runAttempt` | none |
| A dashboard Playwright fixture adapter in the test home's project folder is run for the CI status judgment, and the tab short-circuits Proof for it | Slices 2–3 adapter spec | Retained: `dashboard/tests/intent-ci-proof-reasons.spec.ts` "a ciAdapter project gives one reason under Proof…" passed in CI run 41951088108 at `b4ec1c8a46` (main), 2026-11-05; spec, `baseCiJudgment.ts` and `IntentCiProof.tsx` unchanged since `ddff2e451` | Fixture adapter answered `discover`, verdict "Passed at 4774f60", one `ci-adapter` reason, no `actions-*` request | The proof read through the same folder is new; slice 2's spec observes it |
| A numeric adapter identity would be read as a GitHub run if not stripped | Slice 2 judgment change | `baseCiNearest.ts` `runIdentityOf` (positive `databaseId` and `attempt`) with `baseCiJudgment.ts` `withoutRunIdentity`, read at `78ea4e9` | Holds: the adapter identity must travel in its own field | none |
| Two attempts sharing `attemptId` and revision both survive discovery | Slice 3 ambiguity example | `ci-command-attempts.mjs` `latestCommandAttempts` keys by SHA + `check` + `context` and keeps equal or missing times, read at `78ea4e9` | Two attempts with different `check` names at one SHA are both retained | Slice 3's spec fixture uses different `check` names; if the shown result then differs, the spec reports it |
| Release from trunk follows the maintainer release skill | Slice 5 | `.agents/skills/release-version/SKILL.md` present; prior releases are tags on `main` | Route exists | Trunk step behind the slice 5 checkpoint |

## Outside-in proof

- Examples 1 and 3 (matching proof; running result shows the completed
  ancestor's): new `dashboard/tests/intent-ci-proof-adapter.spec.ts` with a
  fixture adapter answering `discover` and `proof`.
- Examples 2, 4, 5 and 6 (another attempt's summary; adapter without the
  operation; adapter reason; ambiguous attempt): the same spec, replacing the
  `ci-adapter` test in `intent-ci-proof-reasons.spec.ts`.
- Example 7 (GitHub Actions unchanged): existing `intent-ci-proof.spec.ts`,
  `intent-ci-proof-reasons.spec.ts` and `intent-ci-proof-ancestor.spec.ts`
  stay green unedited apart from the removed `ci-adapter` test; after
  landing, slice 5 reads Open Dough's live tab once against its run's
  artifact, the baseline SEED-234 recorded, because `IntentCiProof.tsx` is
  shared by both paths.
- Collector and protocol shapes, which Pygardon consumes: the collector's and
  `ci-command-adapter.test.mjs`'s node tests; query refusals in
  `tests/support/dashboard-ci-proof-parse.test.mjs`.

## Slices

### 1. The collector writes an adapter attempt's summary
Type: Behavior
Status: done
Proof: `bash scripts/test.sh src/skills/dough-test-optimization/scripts/ci-proof-summary.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-fragments.test.mjs`

Behavior: given an adapter project's job with attempt `9f1c…` at revision
`R`, `fragment --attempt-id 9f1c… --revision R` and `summarize --attempt-id
9f1c… --repository O/P --revision R --expect tests=1` write a summary naming
`O/P`, `attemptId` `9f1c…` and `R` with `tests` counted. A fragment of another
attempt ID, or of a GitHub attempt, is excluded with a note. Naming both or
neither identity is refused. A GitHub Actions fragment and summary are
written and validated exactly as before.

Accepted (2026-11-05): `attemptProblems` in `ci-proof-contract.mjs` is the one
identity rule for fragment, summary and CLI; `attemptOf`/`summaryAttempt`
select the fields. The slice's proof command plus
`tests/support/ci-proof-{declaration,dashboard-ci-proof-parse,dashboard-ci-proof-read}`
node tests passed, and the three `intent-ci-proof*.spec.ts` Playwright specs
passed (7) unedited. Wording change on the GitHub path: the exclusion note now
reads `attempt 1, not attempt 2`, and an identity-less summary reports
`names neither runId and runAttempt nor attemptId` (the dashboard matches the
invalid-summary reason with `.+`). Refactor: tests merged and trimmed under
250 lines, no production change.

### 2. The tab shows a matching adapter attempt's proof
Type: Behavior
Status: done
Proof: Playwright `dashboard/tests/intent-ci-proof-adapter.spec.ts` (examples 1 and 3) plus `intent-ci-proof.spec.ts`; `bash scripts/test.sh src/skills/dough-execute-plan/scripts/ci-command-adapter.test.mjs tests/support/dashboard-ci-proof-parse.test.mjs`

Behavior: given a `ciAdapter` project whose newest attempt `9f1c…` passed at
`R` and whose adapter answers `proof` for that `runId`, `attemptId` and `R`
with a matching summary, the developer opens Intent → CI status. The verdict
reads as before; Proof names attempt `9f1c…` at the short revision and shows
the `tests` row. With the head's attempt still running, Proof shows the
completed ancestor attempt's summary. The adapter receives the documented
request; an answer that is neither `summary` nor `unavailable` is refused by
the runner. The GitHub Actions proof spec is unchanged.

Accepted (2026-11-05): `readCommandProof` in `ci-command-adapter.mjs` over
`runAdapter` (now `ci-command-run.mjs`); judgment identity in
`baseCiAdapterAttempts.ts` `adapterAttempt {runId, attemptId, ambiguous?}`;
adapter proof read in `dashboard/server/ciAdapterProof.ts`, query form
`run`, `attempt-id`, `run-branch` (the attempt's discovered branch, for the
request's `check.branch`), `revision`, ids at most 256 characters. Proof:
`intent-ci-proof-adapter.spec.ts` (examples 1, 3 and a numeric id), the three
GitHub proof specs, `intent-ci-status*` and `agent-launch-base-ci*` specs
(34 passed), the `ci-command-adapter*`/`ci-*` node tests,
`dashboard-story-branch-ci{,-adapter}`, `dashboard-ci-proof-{parse,read}`,
`tests/execution-payload-update.sh`, and `npm run typecheck:dashboard`. The
`ci-adapter` short-circuit and reason are gone; until slice 3 the
`intent-ci-proof-reasons.spec.ts` ciAdapter test expects the interim
unreadable line, and failures use the "This run's…" wording. An adapter
project with no completed attempt shows `noAttemptLine`.

### 3. The tab says why an adapter attempt shows no proof
Type: Behavior
Status: planned
Proof: Playwright `dashboard/tests/intent-ci-proof-adapter.spec.ts` (examples 2, 4, 5 and 6) and `intent-ci-proof-reasons.spec.ts` without its `ci-adapter` test

Behavior: given the slice 2 project, Proof shows one reason line and no
counts, with the verdict unchanged, when the adapter exits nonzero for
`proof` (with its error), answers `unavailable` (its reason), answers an
invalid summary, answers a summary for another repository, attempt or
revision, or when another discovered attempt shares the shown `attemptId`
and revision (asked of no adapter). Check again reads both again. The
`ci-adapter` reason and its wording are gone.

### 4. Guidance tells an adapter project how to publish and serve proof
Type: Behavior
Status: planned
Proof: AGENTS.md behavior review recorded in this plan, walking Pygardon's
plan (JUnit fragment in its job, summary in `ci-diagnostics/`, adapter
`proof` read) against the edited guidance; `bash tests/execution-payload-update.sh`
(runnable adapter example unchanged and still passing); `npm run --silent format`

Behavior: an agent in a `ciAdapter` project following
`src/skills/dough-test-optimization/references/ci-proof-summary.md` reaches an
adapter path (fragments and summary written in its own CI job with
`--attempt-id`, served by its adapter) instead of a stop, and
`src/skills/dough-execute-plan/manuals/custom-ci.md` documents the `proof`
request, its two answers, its limits, and that a missing operation shows as
no proof. `docs/dashboard-development-intent.md` describes the adapter proof
read.

### 5. Release the collector, protocol and guidance
Type: Behavior
Status: planned
Checkpoint: before this slice's trunk step, ask Terry for one go-ahead that
covers a [Dough Land](../../../.agents/skills/dough-land/SKILL.md)
`--keep-worktree` landing of the story branch on `main` and then the release.
Proof: `git ls-remote --tags origin v<next patch>` names the tag, and
`git show v<next patch>:src/skills/dough-test-optimization/scripts/ci-proof-contract.mjs`
contains the adapter identity; and, once the production dashboard at
`http://127.0.0.1:4173` serves the landed `main`, one live reading of
example 7: Open Dough's Intent → CI status Proof for its shown trunk run
equals that run's `ci-proof-summary-attempt-<n>` artifact (run, attempt,
revision, each row's counts and present parts), and a GitHub Actions project
whose run published no summary still shows "This run published no CI proof
summary." with its verdict. Use the headless Playwright Chromium read and the
`gh api` artifact download from
`ci-proof-summary.md` step 6. That reading established this baseline on
2026-11-05 at 09:11 (+07) for run 41951088108 and doughnut run 41948058190
(SEED-234, completed). Record the reading here; a disagreement is a
regression this story repairs before closing

Behavior: with slices 1–4 landed on `main` and its CI green, follow
`release-version` for the next patch version (VERSION, CHANGELOG, tag) from
trunk. The tag's payload carries the collector, `proof` operation and
guidance, so Pygardon can `dough-update` to it. No client rollout is part of
this slice.

## Current decisions

- The `proof` request sends `runId` and `attemptId` as text (the tab's query
  carries them as text), unlike `diagnose`, which passes discovered values
  through; slice 4's manual documents this.
- Story Branch Mode, with the slice 5 checkpoint above as the only trunk step.
- `schemaVersion` stays 1 with two alternative identities; `runId` is not
  part of the adapter identity (seed deferral).
- The adapter's `unavailable` text is shown as given, bounded like a diagnose
  reason; the dashboard adds no reason codes for it.
- The runnable adapter example in `custom-ci.md` keeps answering only
  `discover`/`diagnose`; the manual documents `proof` separately.

## Concern evidence

- Slice-plan refinement was not needed: each slice owns one outcome and one
  proof loop, slice 2's runner and identity changes exist only for its
  example, and slice 3 extends slice 2's model with reasons rather than a
  second recognizer.
- No remaining slice-specific concern was identified. Slice 5 is a human
  checkpoint, not an unsettled premise.
