# Last successful Intent proof

**Identity:** SEED-220#last-successful-intent-proof
**Source:** [selected story](../../seeds/SEED-220-last-successful-intent-proof.md#last-successful-intent-proof).
**Source review:** [independent commitments](source-review.md).

## Goal and scope

Intent shows the last successful scenario proof, including attempts, time,
duration and tested source. Ordinary runs retain only passing observations.
When an executed scenario's final result is unsuccessful, remove its earlier
proof from the checkout; preserve unrelated and unexecuted scenarios. A later
pass restores proof. Outline rows remain independent identities.

This change includes Open Dough's shared Cucumber reference, published Intent
file/folder reading and wording, and the existing Pygardon and Doughnut
recorders and retained proof. No new runner families, CI status view, release,
installation update, service action or credentialed live run is included.

## Existing solutions and direction

- Reuse the version-1 compact format, source identity and source association.
  `dashboard/src/cucumberProof.ts` already reduces observations by identity and
  finish time; `dashboard/server/intentProofRead.ts` supplies that result to
  both file Proof and folder summaries. Reduce legacy observations before
  selecting successful ones, so a later failed observation cannot expose an
  older pass. Keep parsing legacy valid files.
- Change the existing producers, rather than adding an Open Dough recorder:
  Pygardon's `e2e_test/plugins/cucumberProof.mts` consumes Cucumber.js Messages;
  Doughnut's `e2e_test/config/cucumberProofRecorder.mjs` consumes the pinned
  preprocessor's task transport. Their existing runner fixtures exercise
  output, exit status, selection, retry and source association.
- New proof contains passing observations only. No failure observation,
  tombstone, failure history, or new schema is required. Cleanup rewrites
  affected files atomically, deletes files made empty, and retains other
  identities. Preserve a success newer than the unsuccessful final attempt.
  Do not let an in-memory run snapshot restore a row another completed
  scenario removed. Use only the synchronization needed by observed concurrent
  writers; avoid a generic storage framework.
- Synthetic dry/filtered/fail-fast non-runs leave prior proof alone.
  Intermediate retry failures wait for the final attempt; retry-assisted
  passes retain attempt counts and total attempt duration. Real unsuccessful
  final attempts retain no proof, including executed pending/undefined outcomes.
- Cleanup covers proof present in the recorder's checkout. Removing prior
  records means unique run filenames no longer promise conflict-free Git
  reconciliation. Preserve deletions during ordinary reconciliation; do not
  invent global stale-branch knowledge without recorded failures.
- [ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
  keeps one Proof meaning; [ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  keeps runtime instructions about the executing project and shared guidance
  authored in `src/skills/`; [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  keeps durable proof in project Git and the dashboard reading published facts.
  Current index/record statuses agree; this product-intent change conflicts
  with none. Update the maintained [Intent guidance](../../../docs/dashboard-development-intent.md)
  and [Cucumber reference](../../../src/skills/dough-test-optimization/references/cucumber-proof.md),
  with no additional North Star or ADR record.

## Execution identity and setup

- Originating/integration checkout: `/Users/terryyin/git/open-dough`.
- Owned Open Dough workspace: `/Users/terryyin/git/open-dough-last-successful-proof`,
  branch `codex/last-successful-intent-proof`, created for this story from
  `4774f6095db83e4724a919b580574b23ef4a2956`.
- Accepted claim: `6269a6d1343e86ad6542c45517d44a0ed0648148` on origin/main;
  Story Branch Mode delivery target is origin's
  `refs/heads/codex/last-successful-intent-proof`.
- Subordinate producer workspaces, created by this execution from fetched trunk:
  `/Users/terryyin/git/pygardon-last-successful-proof`, same branch name, base
  `30cbd42b5`; `/Users/terryyin/git/doughnut-last-successful-proof`, same branch
  name, base `3ca2684040`. They serve this story rather than new missions.
  Keep default producer checkouts untouched. The coordinator resolves each
  producer's authorized publication and workflow before delivery there.
- Open Dough readiness observed by coordinator: locked native npm setup and
  `node scripts/setup-native.mjs check` passed with Node 24.21.0 and Chromium
  153.0.8010.12. Coordinator-owned setup also passed in both producer
  workspaces; reuse it while their locked dependency state stays unchanged.
- Apply this repository's [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
  throughout, including delegated work and CI repair. Producer repository
  guidance also applies at its boundary. Each slice gets a fresh implementation
  agent and independent refactor before coordinator formatting and delivery.

## Decisive premises and outside-in proof

The Open Dough baseline was observed in the owned workspace at the accepted
claim: `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config
dashboard/playwright.config.ts --reporter=list
dashboard/tests/intent-cucumber-proof.spec.ts
dashboard/tests/intent-cucumber-proof-absent.spec.ts
dashboard/tests/intent-entry-folder-summaries.spec.ts
dashboard/tests/intent-entry-folder-summaries-folders.spec.ts
dashboard/tests/intent-entry-folder-summary-partial.spec.ts
dashboard/tests/intent-entry-folder-summary-explanations.spec.ts` — **12 passed
in 15.2s**. The first proof journey renders the latest failure instead of the
older pass, retry counts, source association, and both run/consolidated layouts;
the summary journeys observe complete/partial file and folder counts. These
are existing behavior observations, not proof of the new behavior.

The coordinator also observed the actual producer routes in their named owned
workspaces: Pygardon's `nix develop -c scripts/check-worktree.sh node --test
tests/cucumber-proof-lifecycle.test.mjs tests/cucumber-proof-outcomes.test.mjs
tests/cucumber-proof-source.test.mjs tests/cucumber-proof-selection.test.mjs
tests/cucumber-proof-recorder.test.mjs` passed **24/24**, including currently
retained failed observations, output/exit behavior, source association,
selection, retries and concurrent-run lifecycle. Doughnut's
`CURSOR_DEV=true nix develop -c pnpm test:cucumber-proof` passed **15/15** in
**32.57s**, including real Cypress full/focused/tagged/dry fixture runs;
evidence: `/tmp/nix-shell.wEuEL8/donut-cucumber-proof-runner-Rg5sYw`.

| Promise | Required observing boundary |
| --- | --- |
| Latest legacy failure removes older success from Intent | Published-revision Intent journey across separate run files and consolidated legacy proof; unsuccessful row has no successful proof |
| Last successful proof, retry counts, time and source | File table headings/cells plus location and folder summary count lines; retry-assisted pass still says two attempts |
| Only passing scenarios from mixed-result runs persist | Real Cucumber.js/Cypress fixture run keeps runner exit/diagnostics and retains only its passing in-scope scenarios |
| Success → final failure → later success | Recorder lifecycle fixture reads actual proof files after each run; failed identity removed everywhere, unrelated proof retained, later success restored |
| Outline isolation, selection and retries | Existing fixture entry points extended with another outline row, unselected cases and retry-assisted success |
| Existing stored proof is coherent | Cleanup consumes legacy observations latest-first, retains successful identities and attempts, and removes obsolete non-passing/invalidated entries without fabricating observations |

## Ordered slices

### 1. Read last successful proof throughout Intent
Type: Behavior
Status: done
Proof: Extend the published-revision Intent journeys above to assert the new
heading/absence wording, latest-first legacy invalidation, preserved retry
attempts and consistent file/folder summaries. Include a later restored pass
and failed-only proof. Run the focused command above and
`npm run typecheck:dashboard` after implementation; trace shared fixture and
count-line consumers and include any newly affected focused journey. Walk the
shared reference against pass → final failure → pass with an unrelated row as
the skill-authoring behavior review required by AGENTS.md.

Behavior: A developer reads published old or new proof → Intent shows successful
observations only, calls them last successful proof, and shows no successful
proof for a row whose latest legacy observation is unsuccessful. Unknown,
undeclared and unreadable proof retain their distinct explanations. Update the
shared recorder contract in this same slice. Existing producers remain legacy
writers until slices 2 and 3; this interim is safe because the reader already
invalidates their older successes on a newer failure.

### 2. Keep Pygardon proof successful through ordinary scenario lifecycles
Type: Behavior
Status: done
Proof: Reuse prepared-worktree readiness and the real fixture baseline above;
do not substitute shared checkout dependencies. Run
`nix develop -c scripts/check-worktree.sh node --test tests/cucumber-proof-*.test.mjs`
after extending that suite for the lifecycle, mixed run,
outline, non-run, retries, interruption, atomic writes and concurrent-run cases
affected by cleanup. Feed representative actual passing proof bytes through
Open Dough's parser/reducer to establish compatible consumption.

Behavior: Ordinary completed Pygardon scenarios write passing proof with retry
counts; a real unsuccessful final attempt removes its earlier proof while
other and unexecuted identities stay. Retried passes remain recorded, with
ordinary output/exit unchanged. Clean existing retained proof latest-first and
update the recorder's maintained documentation. Do not edit installed managed
Open Dough guidance.

### 3. Keep Doughnut proof successful through ordinary scenario lifecycles
Type: Behavior
Status: planned
Proof: Reuse prepared-worktree readiness and the real Cypress fixture baseline
above. Extend and run `CURSOR_DEV=true nix develop -c pnpm test:cucumber-proof`
through the
existing recorder/runner fixtures for pass → final failure → pass, mixed runs,
outline identity, non-runs and retry counts. The real fixture is isolated and
requires no product service stack; preserve runner exit and diagnostic output.
Read representative recorded proof bytes with Open Dough's parser/reducer.

Behavior: Ordinary completed Doughnut scenarios maintain passing proof with
the same cleanup and retry meaning as Pygardon. Clean existing retained proof
latest-first and update maintained recorder documentation. Preserve preprocessor
reporting, task composition, selected features and runner behavior.

## Current decisions and concern evidence

One common scenario-success rule is implemented at the existing reader and
each existing runner boundary. The slices separate independent runnable
integration loops and keep each recorder's lifecycle proof with its behavior;
they do not add abstractions for later runners. Plan refinement was not needed
for these three cohesive, directly evaluable slices. No remaining product,
architecture or proof-route concern was identified. No numeric execution budget is invented for
Open Dough; honor a producer repository's supplied budgets at that boundary.

## Learnings

### Slice 1 accepted proof

Inspected `latestSuccessfulObservations`, `locationProofAt`, the passing-only
authenticated response schema, file table and shared summary count line. The
published fixtures supply input proof rather than the product outcome;
`intent-cucumber-proof.spec.ts` observes the complete table (retry attempts,
elapsed time, commit and file version) and location counts. The folder journey
observes the same failed identity cleared in folder/child/file counts.

- `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/intent-cucumber-proof.spec.ts dashboard/tests/intent-cucumber-proof-absent.spec.ts dashboard/tests/intent-entry-folder-summaries.spec.ts dashboard/tests/intent-entry-folder-summaries-folders.spec.ts dashboard/tests/intent-entry-folder-summary-partial.spec.ts dashboard/tests/intent-entry-folder-summary-explanations.spec.ts dashboard/tests/intent-selection-reads.spec.ts` — 19 passed (15.8s).
- After passing-only response schema: `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/boundary/authenticated-read-intent-proof-retained.spec.ts dashboard/tests/intent-cucumber-proof.spec.ts dashboard/tests/intent-entry-folder-summaries-folders.spec.ts` — 8 passed (9.4s).
- After equal-time conservative invalidation: `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/intent-cucumber-proof.spec.ts dashboard/tests/intent-cucumber-proof-absent.spec.ts` — 11 passed (10.9s).
- `npm run typecheck:dashboard` — passed. No test failures.

The consumer trace at `/tmp/intent-success-consumer-trace.md` identifies 71
consumers with dispositions. Current seed 192 and plan 442 expectations were
aligned by the parent; historical baseline commands retain their provenance.
Installed managed copies are excluded by AGENTS.md's source-authoring rule.
Guidance behavior review walked two passes → one final failure → retry-assisted
recovery: identity cleanup, final retry counts and untouched non-runs match the
instruction. Source-only commitments C4–C7 are observed; producer commitments
remain owned by slices 2–3.

Independent refactor completed: success-only types now continue through the
reader's answer, rendering and counts, while legacy file parsing remains broad.
Proof CSS moved intact to `intent-proof.css`; the folder-proof journey moved
intact to `intent-entry-folder-proof.spec.ts`. Inspected those imports and
observing assertions; no behavior gap remains. Existing seed 192 stayed intact
because reorganizing unrelated active stories is outside this change's scope.

Replacement proof after these affected-boundary moves:
`env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/intent-cucumber-proof.spec.ts dashboard/tests/intent-cucumber-proof-absent.spec.ts dashboard/tests/intent-entry-folder-summaries.spec.ts dashboard/tests/intent-entry-folder-summaries-folders.spec.ts dashboard/tests/intent-entry-folder-proof.spec.ts dashboard/tests/intent-entry-folder-summary-partial.spec.ts dashboard/tests/intent-entry-folder-summary-explanations.spec.ts dashboard/tests/intent-selection-reads.spec.ts dashboard/tests/boundary/authenticated-read-intent-proof-retained.spec.ts`
— 21 passed (18.2s). `npm run typecheck:dashboard` and `git diff --check`
passed. The refactor consumer trace at
`/tmp/intent-success-refactor-consumer-trace.md` has complete dispositions.

### Pygardon accepted proof

The actual recorder now maintains only successful proof, with final-result
identity cleanup, atomic replacement and interrupted-owner recovery. Real
Cucumber fixtures passed 28/28; packaged consumers passed 3/3; independent
refactor retained behavior and its affected outcomes passed 6/6. Four failed
packaged files were removed; six passing observations remain. The new two-attempt
recorder output is accepted by Intent. Full commands and inspected observations
are in [acceptance evidence](source-review.md#pygardon-producer-acceptance).
Pygardon accepted publication: `9f5121798c42a32f0118a29991facd1246739fa3`
on origin's `refs/heads/codex/last-successful-intent-proof`; observation reused
`/tmp/dough-ci-501/watch-ASgokc`. Its component typecheck/lint hook passed
after making the existing default UTF-8 directory encoding explicit; this
mechanical type repair leaves accepted runtime observations unchanged.
