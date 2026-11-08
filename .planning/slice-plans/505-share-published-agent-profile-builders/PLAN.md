# Share one published agent profile builder across test entries

**Identity:** SEED-261#share-published-agent-profile-builders
**Source:** [Share one published agent profile builder across test entries](../../seeds/SEED-261-share-domain-test-data.md#share-published-agent-profile-builders)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Published agent profile setup in the scoped dashboard and skill fixture
families comes from one `makeMe.anAgentProfile` builder in
`tests/support/makeMe.mjs`. It returns the facts `renderAgentProfile` takes,
with the activity always named as `parseAgentProfile` returns it, and tests
render through the production encoder. The seed's Scope and Key examples are
the contract. They are summarized here only to map proof.

Exclusions: other `renderAgentProfile` callers, the profile parser tests and
the dough-land tests stay with later SEED-261 stories. No story-branch or
other variant is added without a consumer in scope. No test exercises only
the builder. The abandon test's `{ unrecognized: true }` rival stays raw.

Governing rules: the [test rule](../../../AGENTS.md#test-automation), the
[test data architecture](../../../tests/README.md#test-data-architecture) and
the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests),
which this plan carries as written: a failing or flaky test met here is a
defect to fix, not to report and pass.

## Outside-in proof

| Promise (seed key example) | Owning slice | Observation |
| --- | --- | --- |
| 3. Another developer's assignment is published through `publishAssignment(trunk, profile)` and announce still selects the next free name | 1 | `preparation-assignment-announce`, `-land`, `-nerds`, `one-shot-refinement`, `one-shot-refinement-auto-land` tests pass unchanged in their assertions |
| 4. The dashboard preparing journey republishes through the changed helper | 1 | `backlog-preparing.spec.ts` and `session-attribution.spec.ts` pass |
| 5. `occupyAllBut` publishes execution profiles from the builder | 1 | `preparation-assignment-reuse`, `-stops`, `-lost-workspace` tests pass |
| 6. A value the renderer rejects fails the dashboard type-check | 1 | `npm run typecheck:dashboard` passes, and a scratch wrong-typed fact makes it fail, then is reverted |
| 1. Isolation revisions A and B render byte-identical profiles from the builder | 2 | `published-facts-isolation.spec.ts` and `runtime/observation-measurements.spec.ts` pass with unchanged assertions |
| 2. Profile addition with only names at the call site | 2 | `authenticated-read-profile-addition.spec.ts` passes |
| No superseded helper; evaluation recorded | 2 | Consumer trace for `publishAssignment` and the removed `profile(name)` helper lists no stale call form. Learnings record what carried across entries |

Local gate: focused proof only. Skill tests run through
`bash scripts/test.sh <test paths>`; never bare `node --test`. Dashboard specs
run with `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES
npm run test:dashboard -- <spec paths> --reporter=list`, after `setup-native`
in a fresh worktree. Hosted CI runs the whole suite after publication. A local
full run is not required, because the change is test-only and every consumer of
the changed helpers is named above. If one is run, use
`caffeinate -s -i` on AC power and follow
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)
on battery.

## Slices

### 1. Skill preparation-assignment fixtures publish profiles built by MakeMe
Type: Behavior
Status: done
Proof: The skill tests and dashboard specs in rows 3–6 pass. `npm run typecheck:dashboard` passes and is shown to discriminate a wrong-typed builder fact.

Behavior: a preparation-assignment test arranges another developer's
profile with `makeMe.anAgentProfile.preparing(...)` or `.executing(...)`
and `.please()`, and publishes it through `publishAssignment(trunk, profile)`.
The real CLI then announces, lands, reuses or refuses exactly as before.

Work: create `tests/support/makeMe.mjs` (`// @ts-check`, JSDoc typed from
`Parameters<typeof renderAgentProfile>[0]`). Each `anAgentProfile` access
starts a fresh builder. `executing` defaults to `mode: "trunk"` and
`branch: "origin/main"`, `preparing` records no mode or branch, and host and
model are absent unless given. Change `publishAssignment` to take the profile.
Rebuild `occupyAllBut`'s profiles and the announce test's rival Yui with the
builder. Update every caller: the announce, land, nerds, one-shot refinement and
auto-land tests, and `dashboard/tests/preparingJourney.ts`.

### 2. Dashboard profile setup uses the same builder, with no superseded helper
Type: Behavior
Status: done
Proof: The dashboard specs in rows 1–2 pass, the type-check passes and the consumer trace is clean.

Behavior: the published-facts isolation fixture builds the owner as an
execution profile and the preparer as a preparation profile through
`makeMe.anAgentProfile`. The backend profile-addition spec builds its
preparation profiles from names alone. Both render with `renderAgentProfile`,
and their pages and reads observe the same facts as before.

Work: replace the two literal fact objects in `factsAt` and the spec's local
`profile(name)` helper. Run the consumer trace with `--term publishAssignment`
and `--term renderAgentProfile` limited to the scoped families. Remove any
builder method or fixture helper left without a consumer. Record the evaluation
in Learnings: readability, coverage, duplication and maintenance cost before
and after; what carried across entries; what needed a distinct form; and what
later SEED-261 stories should reuse.

## Execution complete

Product advice: no change to priorities. Continue with
SEED-261#map-published-work-test-data next, reusing `makeMe.anAgentProfile`
and adding variants only with a converting consumer. The retrospective found
no outcome correction; the one MakeMe file carried across `node:test`,
Playwright browser fixtures and backend specs without adapters.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| A `@ts-check` `.mjs` under `tests/support`, reached only by import from a dashboard test, is type-checked with `renderAgentProfile`'s JSDoc type | `tsc --build dashboard/tsconfig.json` (slice 1, 2) | 2026-11-08, base `9f403b2bd`. A scratch `tests/support/makeMe.mjs` returned `identity: 42` as `Parameters<typeof renderAgentProfile>[0]`, and was imported from `dashboard/tests/publishedFactsIsolation.ts`. Ran `node_modules/.bin/tsc --build dashboard/tsconfig.json` from the integration checkout's install. Reverted. | Exit 2 with errors at both the builder and the TS caller. The premise holds |
| An execution profile with `activity: "execution"` renders the same bytes as one without it, and the parsed shape equals the built shape | `renderAgentProfile` and `parseAgentProfile` (slices 1, 2) | 2026-11-08, base `9f403b2bd`, `node -e` importing `product-backlog-agent-profile.mjs` | Same bytes `true`. Round trip equal for execution and preparation |
| Skill tests import from `tests/support` | `bash scripts/test.sh` on `src/skills/**` tests (slice 1) | Existing CI-passing tests already import `../../../../tests/support/markdown-section.mjs` (`ci-completion-lifecycle-guidance.test.mjs` and others) | Holds by retained CI evidence on the same import route |
| Installed payload excludes test support and skill fixtures | `install.sh` managed file list | `install.sh` lists payload files explicitly. The installed `.claude/skills/dough-story-refinement/scripts/` has no fixtures | Holds. No payload change |
| The native owned-context scenario arranges no profile | `tests/support/git-publication-native-owned-context-fixture.mjs` | It calls only `createPreparationTrunk` from the preparation fixture | Holds. Its evidence identity is unchanged |

## Current decisions

- The builder returns the parsed-profile shape, with the activity named, not
  rendered text or a file entry. Path and bytes stay with `agentIdentity` and
  `renderAgentProfile`.
- Names are stated at every call site. Identity is stated wherever it drives
  the case and may use a deterministic default elsewhere.

## Plan concerns

Slice-plan refinement was not needed. The two slices are each one green proof
loop over named consumers, and neither combines independent outcomes. This
review found no remaining slice-specific concern.

## Learnings

- Slice 1 (accepted 2026-11-08): the same `tests/support/makeMe.mjs` builder
  loads unchanged from `node:test` skill tests and Playwright TypeScript. Only
  the TypeScript caller needed a distinct form: `agentNameOf` returns
  `string | undefined`, so the preparing journey's `start` step now resolves
  the known name before the typed builder takes it. The refactor pass moved
  the journey's step helpers to `dashboard/tests/preparationSteps.ts` to keep
  `preparingJourney.ts` under the 250-line limit.
- `renderAgentProfile` types `activity`, `mode` and `host` as plain `string`,
  so the type-check catches shape errors such as a numeric identity but not a
  wrong literal value.
- Identity stays required in slice 1; slice 2 adds a default identity on
  `preparing` for the names-only profile-addition spec, its first consumer.
- Accepted slice 1 proof: `bash scripts/test.sh` over the
  preparation-assignment announce, land, nerds, reuse, stops, lost-workspace,
  abandon, continuation, landing-retry, story-left-queue, owned-context and
  remote-base tests, both one-shot refinement tests and
  `tests/support/git-publication-native-one-shot-escalation-fixture.test.mjs`;
  `backlog-preparing.spec.ts` and `session-attribution.spec.ts` (rerun after
  the refactor); `npm run typecheck:dashboard` exit 0, exit 2 with a scratch
  numeric identity, reverted.
- Slice 2 (accepted 2026-11-08): `preparing` gained a deterministic default
  identity, `SEED-1#queued-story`, consumed by the names-only profile-addition
  spec. The isolation fixture's `factsAt` builds Akiho/Yuma as `executing` and
  Kirara/Sola as `preparing`; a `node` comparison against the `13a5ddd90`
  literals rendered identical bytes for revisions A and B. The spec's local
  `profile(name)` helper is gone.
- Evaluation. Readability: call sites name the activity (`executing` or
  `preparing`) instead of an `activity:` string or its absence, and incidental
  Trunk Mode, `origin/main` and unused identities left the call sites; a
  single-name render is a little longer than the old one-word helper.
  Coverage: unchanged, with the same assertions and reads. Duplication: three
  profile-shape definitions in scope (the spec helper, the `factsAt` literals
  and `publishAssignment`'s facts) became one builder. Maintenance cost: a
  profile-shape change is made in `makeMe.mjs` and type-checked through
  `renderAgentProfile`, at the cost of one import per file.
- What carried across entries: one `@ts-check` `.mjs` builder loads unchanged
  in `node:test`, Playwright browser fixtures and Playwright backend specs, and
  its parsed-profile shape goes straight into `renderAgentProfile` with no
  per-runner adapter. What needed a distinct form: the TypeScript preparing
  journey needed a narrowed agent name, and `preparing` needed an optional
  identity while `executing` keeps it required.
- What later SEED-261 stories should reuse: `makeMe.anAgentProfile`, adding a
  variant such as a story-branch `executing` only with the converting story's
  consumer. Keep facts the assertions read at the call site, and prove byte
  identity against the base literals before relying on unchanged assertions.
  `authenticated-read-committed-last.spec.ts` has a matching preparation
  profile whose identity is tied to its seed, so it should state the identity
  rather than take the default.
- Accepted slice 2 proof: `npm run typecheck:dashboard`; the dashboard command
  over `published-facts-isolation.spec.ts`,
  `runtime/observation-measurements.spec.ts` and
  `backend-tests/observation/authenticated-read-profile-addition.spec.ts`
  (10 passed); `bash scripts/test.sh` over the announce and reuse tests.
