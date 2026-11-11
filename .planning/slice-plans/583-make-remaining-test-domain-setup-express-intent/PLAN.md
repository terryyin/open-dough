# Make remaining test domain setup express intent

**Identity:** SEED-302#make-remaining-test-domain-setup-express-intent

**Source:** [Refined story](../../seeds/SEED-302-remaining-makeme-test-data.md#make-remaining-test-domain-setup-express-intent)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

Maintainers reviewing a test can read the domain facts that distinguish its
scenario at the call site. Convert every location in the
[line-linked audit](../../evidence/makeme-test-data-audit.md), or record the
specific input shape the case needs to control. Shared MakeMe builders supply
incidental defaults and produce the shapes the product consumes. Fix a shared
fixture once when it owns construction for several callers. Reuse or extend
existing builders and use the production shape or encoder at each boundary.

Preserve literal protocol, legacy, or malformed inputs under proof, captured
evidence, real actions, and independent assertions. Keep case-defining dates,
identities, and choices explicit under
[test data architecture](../../../tests/test-data-architecture.md). This
increment does not change product behavior, invent suite-local domain models,
convert browser page-object mechanics (SEED-300), or enforce first-layer
test-case length (SEED-301). Locations outside the audit are out of scope;
when converting a listed shared fixture, update its callers that share that
construction.

## Architecture and PFE

- Reuse the existing MakeMe entry at
  [`tests/support/makeMe.mjs`](../../../tests/support/makeMe.mjs) with
  [`launchMakeMe`](../../../tests/support/launchMakeMe.mjs) and
  [`ciMakeMe`](../../../tests/support/ciMakeMe.mjs). Extend a builder only when
  an audited consumer needs construction the library cannot yet express.
  Prefer production constructors and encoders at file and transport boundaries.
- Launch requests already have
  [`requestFacts`](../../../tests/support/launchRequestTestData.mjs) for the
  kept-store request shape, and
  [`aLaunchRecord`](../../../tests/support/launchTestData.mjs) /
  [`aHostSession`](../../../tests/support/hostSessionTestData.mjs) /
  attempt and observation builders for retained launches. Unresolved Codex
  creation (`workspace` + `endpoint` per
  [`launchCreation.ts`](../../../dashboard/src/launchCreation.ts)) has no MakeMe
  owner yet; add that construction behind MakeMe before converting creation
  fixtures. Expose request construction on MakeMe where call sites currently
  invent `AgentLaunchRequest` literals.
- CI comparison and proof already have
  `aStoryCiComparison`, `aPublishedWork`, `aLandedCiHistory`, `aCiProof`,
  `aCiProofEntry`, `aCiRun`, `aGitHubJob`, `aCiAdapterAttempt`, and related
  builders. Convert remaining inline retained builds, slots, and proof subjects
  through those owners; keep collector output and deliberately invalid wire
  inputs literal.
- Published membership already uses `aRepository`, `aBacklogEntry`,
  `aSlicePlan`, and `aStoryPreparation`. Keep purpose and other case-driving
  prose explicit at the call site while shared identity and title facts come
  from MakeMe.
- Harnesses keep servers, Git, clocks, fake hosts, mailbox registration, and
  teardown. Follow
  [ADR 0002, direct domain mapping](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
  [ADR 0005, deterministic checks](../../../docs/adrs/0005-cross-tool-validation-accepted.md#2-keep-deterministic-checks-in-ci),
  [ADR 0008, published versus machine-local facts](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state),
  and [ADR 0010, definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Existing North Star topics add no new direction for this conversion.
- Execute in Story Branch Mode. No slice acts from trunk. No supplier agreement
  is required. SEED-300 and SEED-301 remain separate; do not expand into their
  scope when a converted call site is also long or locator-heavy.

## Outside-in proof ownership

| Promise | Slice and observation |
| --- | --- |
| Key example 1: unresolved Codex creation names workspace, endpoint, and request through shared construction; recovery shell-quoting stays visible | 1 then 2: creation and request builders; creation and recovery specs keep exact shell arguments and independent assertions |
| Launch requests, retained launches, sessions, attempts, and receipts express intent at the call site | 2–3: audited launch and session consumers; shared fixtures updated once for their callers |
| Native listing, runner state, and host samples express intent through MakeMe | 4: fake listing and runner fixtures; harness transport stays |
| Project sources, CI adapter settings, and launch-option definitions express intent through MakeMe | 5: option and project CI consumers; deliberate validation variations stay explicit |
| Key example 3: seed and backlog share identity and title; purpose prose stays explicit | 6: published membership fixtures and authenticated-read consumers |
| CI provider runs, jobs, policy, and adapter attempts express intent through MakeMe | 7: provider and policy fixtures; mailbox and encoding stay in harness |
| Key example 2: comparison names revision, attempt, and proof at the site; retained build and endpoint use builders | 8: comparison, history, and proof consumers |
| Every audited location is converted or recorded as a controlled shape; displaced constructors are gone | Each consuming slice for its family; 9 reconciles the audit list |

## Decisive premises

Observed on 2026-11-11 in this preparation workspace at
`4b358347768e8cb41613e8b29710cb58da60eeba`, Node 24.21.0, on AC power. Scratch
product edits were restored before plan writes. Dashboard selections used
`npm run test:dashboard -- <path> --workers=1 --reporter=line` with
`OPEN_DOUGH_TEST_JOBS=1`.

| Premise and consuming operation | Observed result; unverified remainder |
| --- | --- |
| Audited launch-request literals can move onto `requestFacts` while matching proof still discriminates host identity | Baseline `backend-tests/launches/agent-launch-matching-rules.spec.ts`: 4 passed (~3.2 s). Scratch replacing the story literal with `requestFacts(...).request`: 4 passed (~840 ms). Faulting the stated host to `codex` so the host-change case no longer differs: 1 failed at the `sameLaunch` host distinction (`Expected: false, Received: true`); 3 passed. Exact restoration afterwards. Remainder: expose this construction on MakeMe and convert the full launch-request audit family. |
| Unresolved creation needs a MakeMe owner; `launchCreation.ts` is the production shape | Read of `dashboard/src/launchCreation.ts` and creation fixtures shows `{ workspace, endpoint }` assembled inline; no MakeMe builder returns that shape. Slice 1 owns the gap. |
| CI comparison and retained-build consumers already reach MakeMe for many facts; remaining inline slots and builds are conversion work | `preparedComparison` and `ci-prior-build-boundaries.test.mjs` already call MakeMe for source, work, comparison, history, and proof while still hand-building some slot or build fields cited by the audit. Slice 8 converts those remainders. |
| Published membership already uses MakeMe for identity while purpose prose stays explicit | `publishedFactsIsolation.ts` builds backlog, plan, and preparation through MakeMe and still states purpose text in the seed file body. Matches key example 3; slice 6 converts remaining hand-rendered membership. |

## Proof and delivery gates

Follow [AGENTS test automation](../../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests) as
written; carry that link or the verbatim policy into every delegation brief and
repair handoff. Failures and flakes remain repair obligations, including on the
base and through final CI.

Use [Execute Plan](../../../.agents/skills/dough-execute-plan/SKILL.md) for
independent post-change refactoring, focused proof, commits, publication, and
asynchronous CI repair. For each changed shared helper, run the installed
consumer-trace command with `--base HEAD`, follow exports into consuming tests,
and give every consumer a run, reused, or reasoned-excluded disposition.

Local gate: follow [native setup](../../../tests/native-setup.md), put Homebrew
Bash 5 and the pinned Node first on `PATH`, and unset `NO_COLOR`, `FORCE_COLOR`,
and `GIT_ALTERNATE_OBJECT_DIRECTORIES` when they interfere. Run Node and shell
checks through `bash scripts/test.sh` with exact paths. Shared JavaScript
changes also run `npm run typecheck:dashboard`, `npm run lint`, and
`bash scripts/test.sh tests/native-evidence-identity.sh`. Keep dashboard runtime
imports out of builders; use type-only imports. Dashboard selections use
`npm run test:dashboard -- <paths> --workers=1` unless load evidence supports
more workers.

Before long selections inspect current load, memory, and competing work; keep
owned heavy work sequential. Start fully awake on macOS; on AC wrap full or long
runs in `caffeinate -s -i`; on battery plug in or use `caffeinate -i` awake with
lid open and inspect the sleep log, under
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Use controlled clocks and event waits; never `test.slow()` or suite/group/hook
timeout overrides. Hosted CI failures remain owned through final CI.

## Ordered slices

### 1. Unresolved creation has a MakeMe owner
Type: Structure
Status: done
Proof: Key example 1's creation shape. Add or extend a builder that returns the
production `{ workspace, endpoint }` creation facts (and any request composition
callers need). Run a focused creation or recovery consumer after one scratch
caller migrates; keep shell-quoting arguments outside the builder. Include
MakeMe closure and dashboard typecheck when the entry grows.

Internal change: Give unresolved creation one MakeMe construction path typed
against `launchCreation.ts`, composed with existing request and host-session
builders where needed.
Enables: Slice 2 converts audited creation and launch-request call sites.

Accepted evidence (pre-done): `makeMe.aCreationRecord` in
`tests/support/launchCreationTestData.mjs`, wired on LaunchMakeMe. Scratch
migrate: `dashboard/backend-tests/launches/agent-launch-creation-recovery.spec.ts`
keeps `inspectionArgs` / shell-quoting at the call site.
Focused: `npm run test:dashboard -- dashboard/backend-tests/launches/agent-launch-creation-recovery.spec.ts --workers=1 --reporter=line` → 4 passed.
Also `npm run typecheck:dashboard` → pass. Refactor: none — already clean.
Learning: unresolved creation is request + `{ workspace, endpoint }` + time, not
`aHostSession` (session continuation).

CI repair on registered SHA `21bab414…` (run 42954307191): phone OpenAI settings
recovery clipped Save when the API key field scrolled to the scrollport end.
Product `scroll-margin-bottom` on `.openai-settings-form input`; recovery test
pins end-aligned setup.

### 2. Launch requests and creations express intent through MakeMe
Type: Behavior
Status: planned
Proof: Key example 1 and the audit's launch-request / creation groups. Convert
audited inline and copied launch requests, establishing requests inside
MakeMe-backed setup, and unresolved creation fixtures. Run the affected
backend, frontend, and integrated launch selections plus traced shared-helper
consumers. Preserve exact recovery shell arguments, deliberate validation
variations, and independent assertions.

Behavior: Audited launch-request and creation sites still invent valid domain
facts → convert them through MakeMe → call sites name workspace, endpoint,
request, host, and workflow facts; recovery and refusal inputs stay visible.

### 3. Retained launches, sessions, attempts, and receipts express intent through MakeMe
Type: Behavior
Status: planned
Proof: Audit groups for retained launches, observed sessions, settled attempts,
and stored receipts. Convert shared fixtures that own construction for several
callers first, then remaining call sites. Run affected launch, session,
terminal, and review recovery selections; keep Done, first-input, and
continuation distinctions explicit.

Behavior: Retained launch and attempt fixtures assemble domain facts inline →
convert through existing launch/attempt/observation/landing builders → call
sites state the distinguishing facts; harness store and host fakes stay.

### 4. Native listings, runner state, and host samples express intent through MakeMe
Type: Behavior
Status: planned
Proof: Audit section for native session listing, runner state, and host samples.
Convert Claude listing rows, saved host sessions, runner listings, and resource
samples through MakeMe. Run affected backend and frontend host-status and
listing selections; keep fake processes and transport in the harness.

Behavior: Listing and host-sample fixtures invent domain rows inline → convert
through MakeMe → call sites name continuation and status facts; transport stays
harness-owned.

### 5. Project sources, CI settings, and launch options express intent through MakeMe
Type: Behavior
Status: planned
Proof: Audit section for project and launch-option configuration. Convert
published sources, skill option definitions, project CI adapter settings, and
valid terminal-theme recovery inputs. Run affected option, intent, adapter, and
settings selections; keep corrupt preference bytes and validation variations
explicit.

Behavior: Configuration fixtures hand-build valid sources and options → convert
through `aPublishedSource` and related builders → call sites state chosen flags,
groups, and adapters; invalid inputs stay literal.

### 6. Published seeds, plans, and backlog membership express intent through MakeMe
Type: Behavior
Status: planned
Proof: Key example 3 and the published-membership audit section. Convert
hand-rendered seed, plan, and backlog construction in dashboard and Node
fixtures, including Git publication and shell starting facts where they are
valid domain setup. Run affected observation, story, and backlog selections;
keep purpose prose and deliberate formatting or refusal inputs explicit.

Behavior: Membership fixtures invent identity and title beside purpose prose →
convert shared membership through MakeMe → seed and backlog share identity and
title; purpose text the dashboard must show stays at the call site.

### 7. CI provider runs, jobs, policy, and adapter attempts express intent through MakeMe
Type: Behavior
Status: planned
Proof: Audit section for CI provider runs, jobs, policy, and adapter evidence.
Convert inline runs, jobs, reuse policy, current-attempt, and adapter-attempt
setup through existing CI builders. Run affected skill and dashboard CI
selections; keep provider encoding, mailbox registration, and malformed fields
under proof in the harness or at the call site.

Behavior: Provider and policy fixtures assemble valid CI facts inline → convert
through MakeMe → call sites name run, job, attempt, and policy facts; harness
owns encoding and registration.

### 8. CI comparison, retained builds, and proof answers express intent through MakeMe
Type: Behavior
Status: planned
Proof: Key example 2 and the comparison / landed-history / proof audit section.
Convert remaining inline retained builds, comparison slots, proof subjects, and
endpoint responses through shared builders. Run affected Node history tests and
dashboard Intent comparison/proof selections; keep collector output and invalid
wire inputs literal.

Behavior: Comparison and history sites still hand-build builds or slots →
convert through MakeMe → call sites name revision, run or adapter attempt, and
proof; retained build and endpoint response come from builders.

### 9. Audited locations are converted or recorded; displaced constructors are gone
Type: Behavior
Status: planned
Proof: Walk the [audit](../../evidence/makeme-test-data-audit.md). For each
remaining listed location, either show the MakeMe conversion or record the
specific controlled shape. Run any still-unconverted traced consumers from
slices 2–8, native-evidence identity, dashboard typecheck, and lint. Remove
displaced suite-local domain constructors that no longer have callers.

Behavior: The audit still lists unconverted valid setup → finish or record each
location → maintainers reviewing those sites see distinguishing facts at the
call site, with no obsolete duplicate constructors for converted shapes.

## Concern evidence

Slice-plan refinement was not needed: eight Behavior slices plus one Structure
slice follow the audit's domain families, each with one proof loop and mapped
key examples; decisive premises for the launch-request route and builder gaps
are settled or owned by slice 1; cumulative design reuses the existing MakeMe
library without a second domain model.

Remaining slice-specific concerns: none identified at preparation.
