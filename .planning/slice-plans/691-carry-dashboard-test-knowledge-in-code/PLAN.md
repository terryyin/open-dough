# Carry dashboard test knowledge in test code and remove its Markdown

**Identity:** SEED-334#carry-dashboard-test-knowledge-in-code
**Source:** [Carry dashboard test knowledge in test code and remove its Markdown](../../seeds/SEED-334-product-wide-end-to-end-tests.md#carry-dashboard-test-knowledge-in-code)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Remove every Markdown file under `dashboard/tests/` so a test author learns
what the dashboard tests arrange, replace, place and record from code. Each
statement takes the first carrier the story lists: (1) already carried, (2) an
executable check, (3) a name, type or configuration value, (4) the skill or
script that performs the procedure, (5) a short statement in the header of the
one module it describes, (6) dropped. One check is added: the Frontend
placement rule.

Excluded: prose moved into another Markdown file (the `rebalance-ci-shards`
skill is the one carrier-4 exception); changes to the other test roots'
Markdown beyond a removed link and its delegating sentence; spec conversion;
product behavior; a feature-folder check; edits to records of what was
observed (`ProjectFindings.md`, `DearDough.md`, `docs/maintainer/`,
`.planning/evidence/`, `.planning/done/`, `CHANGELOG.md`,
`dashboard/tests/fixtures/observed-runs-ci.yml`) and to other stories' plans.

Assumptions: the story runs before or after the conversions and the
retirement; a document already changed by them is classified as it stands at
execution. Plan 617 (SEED-334#keep-one-browser-test-group-roster) edits
`dashboard/tests/README.md`; if it has not landed, its wording slice ends with
the file and its owner adapts.

## Carrier rules for execution

- Classify a statement before writing anything. Carrier 1 is the common
  case: the module headers already describe most fixtures and helpers.
- A carrier-5 statement describes only its module, cites no document, and is
  added only when that header does not already say it. Each slice lists its
  candidates; confirm each against the header first. A statement that would
  take a module past 250 lines belongs to another carrier or is dropped.
- No per-spec inventory, measurement, dated decision or history is rehomed.
- A removed link is replaced by the path of the code that carries the fact,
  or the link and its delegating sentence are deleted.
- Skill edits follow
  [author-open-dough-skills](../../../.agents/skills/author-open-dough-skills/SKILL.md)
  and [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).

## Outside-in proof

After every slice, from the repository root, both commands print nothing for
the documents removed so far, and after slice 8 for all of them:

```sh
find dashboard/tests -name '*.md'
X=(':!ProjectFindings.md' ':!DearDough.md' ':!docs/maintainer' ':!.planning/evidence' ':!.planning/done' ':!.planning/slice-plans' ':!CHANGELOG.md' ':!dashboard/tests/fixtures/observed-runs-ci.yml' ':!.planning/seeds/SEED-334-product-wide-end-to-end-tests.md')
git grep -nE 'dashboard/tests/[A-Za-z0-9_./-]*\.md' -- . "${X[@]}"
git grep -nE '\((\.\./)?tests/(README|feature-groups|shards|fixture-origins|intent-ci-comparison-proof|native-host-fixtures|proof-record|fluent-side-panel-pilot)\.md|\.\./(README|proof-record|shards)\.md' -- dashboard "${X[@]}"
```

At `0ae326328` these print the 32 live sites the slices below assign.

| Key example | Slice | Signal |
| --- | --- | --- |
| 1 A rule becomes a refusal | 1 | scratch Frontend spec fails `npm run lint`; tree passes |
| 2 A fact already has a carrier | 4 | `e2e/README.md` names the fixture modules; header unchanged |
| 3 An inventory is dropped | 4 | no spec list in the diff's added lines |
| 4 A usage rule sits on its helper | 7 | one header statement; nowhere else |
| 5 A stale citation is replaced | 7 | `git grep -n 'README.md, "' -- dashboard/tests` prints nothing |
| 6 A procedure moves to its skill | 5 | the skill states the job-count rule; no link to `shards.md` |
| 7 The entry point names code | 2, 8 | `AGENTS.md` links code; both proof commands print nothing |

Local gate for every slice: `npm run lint` after `npm ci` at the pinned Node
(`.node-version`), plus the slice's named command. Browser commands run under
the maintained sleep guard on AC power: `caffeinate -s -i <command>`
([machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)).
Failures follow the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
No whole browser group runs locally: slices 2–6 and 8 change no executed
code, and slices 1 and 7 name their consumers. Hosted CI runs every group
after publication.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| A name-level lint restriction refuses the breach and passes today's Frontend specs | Slice 1, `npm run lint` | 2026-11-18 at `0ae326328`, this worktree: scratch `no-restricted-imports` block for `dashboard/frontend-tests/**` (`patterns` with `regex` and `importNames`) and a scratch spec importing `test` from `dashboardTest.ts` and `startDashboardServer`; `./node_modules/.bin/eslint dashboard/frontend-tests` with eslint 10.14.0 from the integration checkout's `node_modules` (identical `package-lock.json`). `scripts/lint.mjs` runs the same configuration per file, so the narrower invocation cannot change a file's verdict. Both edits reverted. | Only the scratch spec failed, on both imports; the 279 existing specs passed, including the 30 that import helpers from `dashboardTest.ts`. |
| No test, script or workflow reads a removed document | Slices 2–8 deletions | Same revision: the proof commands above, and `git grep -nE '2026-10-13-mobile-dashboard\|preparation-assignment-v0\.3\.51\.md\|tests/manual'` outside records. | Every code site is a comment, except the `runLifecycle.ts:41` message. Nothing references the manual folder or the fixture note. |
| The `runLifecycle.ts` message can drop its citation | Slice 7 | `dashboard/backend-tests/observation/run-processes.spec.ts:147` read at that revision. | It asserts the text up to `now ended.`, before the citation. Slice 7 runs that spec. |

Unverified remainder: none that changes a slice. A flat-config block replaces
an earlier block's options for the same rule, so slice 1 restates the
`@playwright/test` restriction and proves it still refuses.

## Ordered slices

### 1. Refuse a Frontend spec that takes the real server
Type: Behavior
Status: done
Proof: with a scratch `dashboard/frontend-tests/zz-scratch.spec.ts`, `npm run
lint` fails naming the rule for each of: `test` from `../tests/dashboardTest.ts`,
`startDashboardServer`, `startFakeGitHub`, and `test` from `@playwright/test`.
Without the scratch spec `npm run lint` passes. Remove the scratch spec.

Behavior: Frontend specs take `test` from `frontendApp.ts`, `pageTest.ts` or
`comparisonMountPage.ts` and helpers from `dashboardTest.ts` → a Frontend spec
imports the server-starting `test`, a server starter or a fake GitHub or host
starter → lint refuses it with a message naming the three allowed modules;
existing helper imports pass. Add one `eslint.config.mjs` block for
`dashboard/frontend-tests/**` (120 lines today). Name the starter exports of
`support/fakeClaude.ts`, `fakeCodex.ts` and `fakeCursor.ts` from their current
exports.

Accepted: the block refuses `test` from `@playwright/test` and
`dashboardTest.ts`, `startDashboardServer`, `startFakeGitHub` and
`installFakeClaude`/`Codex`/`Cursor` (the fakes' starters; the `fake*Host`
wiring constants stay importable); the tree passes `npm run lint`.

### 2. Remove the spent records and the pilot document
Type: Behavior
Status: done
Proof: the outside-in commands print nothing for these files; `npm run lint`.

Behavior: `AGENTS.md`, SEED-300 and SEED-301 link the pilot document → delete
`manual/2026-10-13-mobile-dashboard/` whole,
`fixtures/preparation-assignment-v0.3.51.md` and `fluent-side-panel-pilot.md`
→ those links name `dashboard/tests/sidePanelPages.ts`, whose header already
describes the phases and the page-object set (carrier 1); SEED-300 already
owns wider adoption. Sites: `AGENTS.md:33`, `SEED-300:194`, `SEED-301:27`.
Carrier-5 candidate: "a cue must not read a value it needs later", in
`support/cueSheet.ts`. Dropped: the pilot's evaluation and measurements, the
fixture's release commit, blob and digest (the fixture's name states its
version), the manual report.

### 3. Remove the fixture-origin and proof-record documents
Type: Behavior
Status: done
Proof: the outside-in commands; `npm run lint`.

Behavior: a workflow comment and `ciProofCollected.ts` cite `proof-record.md`
→ delete `fixture-origins.md` and `proof-record.md` → both sites name
`dashboard/tests/support/proofRecordTypes.ts`. Sites:
`browser-test-group.yml:145`, `support/ciProofCollected.ts:7`. Carrier 1:
`startOriginPreparation.ts` and `launchJourney.ts` headers (origins and the
story-columns history), `runnerConfig.mjs` (the `<prefix>_PROOF_RECORD`
names), `scripts/frontend-test-proof.mjs` (the Frontend proof artifact),
`specTimes.ts`. Carrier-5 candidates, as field comments in
`proofRecordTypes.ts` (50 lines): `phase: "listed"` establishes selection
only; a record without `terminal` establishes no executed pass;
`strictStatus` is the verdict and `runnerStatus` precedes the strict
reporter's output check. Dropped: the shell walkthrough and measuring advice.

### 4. Remove the host-fixture and comparison-proof documents
Type: Behavior
Status: done
Proof: the outside-in commands; the diff adds no list of spec files; `npm run
lint`.

Behavior: `e2e/README.md` links `native-host-fixtures.md` for the synthetic
hosts → delete `native-host-fixtures.md` and `intent-ci-comparison-proof.md`
→ `e2e/README.md:24` names `../dashboard/tests/support/fakeClaude.ts`,
`fakeCodex.ts` and `fakeCursor.ts`, whose headers stay unchanged. Carrier 1:
those headers, the `cursorRunner` comment in `dashboardServerOptions.ts`, the
spec names and titles. Carrier-5 candidates: the artifact reader must not be
cloned (it loses its unanswered mark), in `dashboard/server/ciProofArtifact.ts`
when its header is silent on it; "no real-server
case builds history past the revision walk", in
`backend-tests/intent/ci-comparison-finality-later-judgment.spec.ts`.
Dropped: both spec inventories, the owner tables, measurements, observations
and the 1,000 ms bound.

### 5. Move the job-count rule into its skill and remove the shard document
Type: Behavior
Status: done
Proof: the outside-in commands; `bash scripts/test.sh
Distribution/tests/support/ci-browser-groups.test.mjs
Distribution/tests/support/browser-group-shards.test.mjs`; the checks
author-open-dough-skills requires; `npm run lint`.

Behavior: `rebalance-ci-shards` links `shards.md#the-job-count` → delete
`shards.md` → the skill states the rule itself: each group keeps the smallest
job count whose slowest job stays inside the deadline in recent `main` runs,
read from `bash scripts/ci-job-times.sh`; remove a job on `could drop one`;
add one only after a deadline ended a job on `main` and neither moved patterns
nor a faster spec restored headroom; verdict time is never a reason. Sites:
`.agents/skills/rebalance-ci-shards/SKILL.md:20` (the `.claude/skills/` entry
is a pointer to it),
`ci.yml:176,185` (comment-only, 247 lines: no growth), `e2e/README.md:73`,
`Distribution/tests/README.md:19` (246 lines: no growth),
`frontend-tests/README.md:51`, `backend-tests/README.md:43,70`,
`SEED-300:223`. Carrier 1: `ci.yml` (counts, patterns), `testFiles.mjs`,
`specTimes.ts`, `suiteDeadline.mjs`, the Playwright configurations (projects),
`browser-group-shards.test.mjs`. Carrier-5 candidate: "a shard that reaches
the deadline is made faster or rebalanced, not given more time", at the
deadline step of `browser-test-group.yml`. Dropped: the producers table, the
dated decisions and run figures.

### 6. Remove the feature-group document
Type: Behavior
Status: done
Proof: the outside-in commands; `npm run lint`.

Behavior: three guides link `feature-groups.md` → delete it → each sentence
names the feature folder without a link; the directory names carry
membership. Sites: `e2e/README.md:37`, `Distribution/tests/README.md:12`,
`backend-tests/README.md:54`. Dropped: both tables and the placement advice.

### 7. State the hub's usage rules on their helpers
Type: Structure
Status: done
Proof: `git grep -n 'README.md, "' -- dashboard/tests` prints nothing;
`caffeinate -s -i npm run test:dashboard:backend --
observation/run-processes.spec.ts` on AC power; `npm run lint`.

Structure: comment and message edits that leave every test's behavior
unchanged, so slice 8 can delete the README with nothing citing it. Replace
the three citations with the statement itself: `support/dashboardServer.ts:66`
(what `developmentBoundary` is for; 237 lines), `support/pageTest.ts:5` (the
wait rule its header already states; 202 lines), and the
`support/runLifecycle.ts:41` message, which ends at "Stop each where it is
started". Carrier-5 candidates from the README, each on the one helper it
governs and only if absent: touch journeys use one device unless another
reaches an asserted branch or arrangement (the support module touch journeys
take their device from; locate it from an `e2e` touch spec's imports); a layout rule is proved once per CSS branch (`pageLayout.ts`); a
journey starts a dev server only for a fact of the development environment
(`developmentBoundary`); a fixture module declares option defaults on its
fixtures, not with a module-level `test.use` (`support/pageTest.ts`).

### 8. Remove the hub and point its readers at code
Type: Behavior
Status: done
Proof: both outside-in commands print nothing; `npm run lint`.

Behavior: nine guides and records link the README → delete
`dashboard/tests/README.md` → each link names the carrying code or goes with
its delegating sentence, and `AGENTS.md`'s test-automation entry names the
MakeMe builders, the page-object entry and the fluent side-panel journeys.
Sites: `AGENTS.md:31`, `dashboard/README.md:223` (250 lines: no growth),
`e2e/README.md:50`, `Distribution/tests/README.md:7,155`,
`Distribution/tests/test-environment.md:71`, `frontend-tests/README.md:50`,
`backend-tests/README.md:68`, `SEED-300:222`. Carrier 1: the three root
READMEs (placement, real and substituted boundaries, running),
`Distribution/tests/README.md` (waits), the `scripts/dashboard-repeat.sh`
header (usage), `support/quietReporter.ts` (silence and kept runs),
`runnerConfig.mjs` (`retries: 0`, browser arguments), the failure policy.
Dropped: the interim-group notes and everything else not listed in slice 7.

## Execution complete

Product advice: no change. When plan 617
(SEED-334#keep-one-browser-test-group-roster) is prepared, its
`dashboard/tests/README.md` wording slice ends with the file, as the story
states.

## Current decisions

- The Frontend rule is name-level, not module-level: 30 Frontend specs import
  helpers from `dashboardTest.ts`.
- Findings logs and other stories' plans keep their recorded links; SEED-300
  and SEED-301 are active seeds and are repointed.
- Every edited code, workflow and guide file stays within 250 lines, and the
  three at 246–250 lines gain no line. SEED-300 (401 lines) and SEED-301 are
  planning records: their link replacements add no line, and their sections
  belong to their own stories.

## Learnings

- Slice 3: the outside-in greps miss bare relative links between the
  documents under `dashboard/tests/` (`(proof-record.md)` in the README).
  Until slice 8 removes the README, each deletion also repoints its bare
  links there to the carrying code.

## Concern evidence

Slice-plan refinement was not needed: each slice owns one document family
with its own links and proof, and the count is eight. No slice-specific
concern remains from this review.
