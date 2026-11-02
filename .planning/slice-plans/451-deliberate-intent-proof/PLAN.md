# Deliberate Intent proof

**Identity:** SEED-223#deliberate-intent-proof
**Source:** [Deliberate Intent proof](../../seeds/SEED-223-deliberate-intent-proof.md#deliberate-intent-proof)
**Source review:** [Independent source commitments](source-review.md)

## Goal and scope

Normal tests leave published proof untouched; a project explicitly records a
verification snapshot using a command or skill declared on its Intent location.
Update the shared Cucumber guidance and dashboard explanations/configuration,
publish a patch release, install it across production-dashboard repositories,
and ask the Cucumber projects to migrate their own producers.

The dashboard displays instructions; it does not execute commands. Other
framework adapters, proof source-fingerprint redesign, and CI comparison
implementation are outside this work. Preserve existing version-1 proof reads.

## Execution context and decisions

- Execution: Trunk Mode, owned workspace
  `/Users/terryyin/git/open-dough/.worktrees/deliberate-intent-proof`, branch
  `codex/deliberate-intent-proof`; originating/default checkout
  `/Users/terryyin/git/open-dough`; authorized target `origin/main` in
  `terryyin/open-dough`. Created by startup for this identity.
- Accepted admission: `81bd2b54dfb6c7bc7fc83f7735746bd3bb238263`, based on
  `f5aae9fd032b0ea112a3dbdca06c0cec4fd58cae`; developer agent `ivan-chan`.
- User authorized implementation, release, rollout commits/pushes, and requests
  to the affected projects. Replanning within this outcome is permitted.
- Setup: `npm ci` and `npm run typecheck:dashboard` passed in this checkout
  against its unchanged lockfile. Hooks are check-only staged lint and
  dashboard typecheck for script changes. Selective formatting belongs to
  coordinator delivery.
- Failure policy: [AGENTS.md, Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
  applies without exception to every delegation, check, repair and rollout.
- ADR 0008, Project dashboard domain and architecture:
  `docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md` keeps
  published records in Git and separates procedures from observations.
  ADR 0003, Release lifecycle and versioning, and ADR 0006, Write skills for
  executing agents, govern release and runtime-audience wording. ADR 0005,
  Cross-tool validation through native acceptance stories, requires useful
  behavior review for this conventional reference change; existing discovery
  and installer mechanisms are unchanged. No new native activation mechanism.
- PFE: extend `intentLocationsSettings.ts`, `intentLocationsRead.ts`, the
  authenticated Intent schema and existing Proof/summary components. Reuse
  pinned repository reads and current Cucumber proof reduction; add no runner,
  database or parallel proof representation. The existing opt-in Playwright
  record is a separate contract and stays unchanged.
- Configuration: each proof-bearing location declares `proofGeneration` as
  exactly one nonempty `command` string (run from repository root) or `skill`
  string (project-owned invocation). Display it as text, never execute it.
  Missing/invalid instructions must explain configuration without hiding
  valid existing proof. Do not require generation configuration to read legacy
  snapshots. Unsupported proof kinds remain honestly unsupported.
- Explicit runs alone mutate proof. Preserve unexecuted identities; clear
  executed unsuccessful identities; retain compact deterministic snapshots
  rather than an accumulating file for every deliberate run. Normal failures
  leave historical proof unchanged, without claiming current health.
- Production configuration on 2026-11-02 names Open Dough, Doughnut,
  Pygardon, Terry Talks, Lizard and Clipboard. Only Doughnut, Pygardon and
  Lizard currently declare Gherkin proof directories. Recheck actual producer
  and configuration before asking migration; update guidance in all six.

## Outside-in proof

- Existing pinned-read fixtures cover published proof and source identity;
  extend their actual consuming read to carry command/skill instructions,
  including missing/invalid configuration without dropping readable proof.
- Browser journeys observe instructions on selected file and folder/location
  proof, explicit-generation wording and historical qualification, and
  unchanged existing successful/absent/unreadable proof distinctions.
- Walk a representative project setup using the edited reference: ordinary
  passing/failing run does not touch proof; opt-in focused run updates only
  executed scenarios; configure and find its generation instruction.
- Run focused Intent proof/settings/summary tests and typecheck; choose any
  further checks from changed consumers. Installer/release checks follow the
  release skills, including real update, both-root comparison and repeat no-op.
  Full project CI is a publication gate, not a blanket repeated local suite.

## Ordered slices

### 1. Choose when to refresh published Intent proof
Type: Behavior
Status: done
Proof: representative guidance walk plus focused pinned-read and browser
journeys observe the declaration, instruction, honest historical snapshot and
preserved existing proof. Source/reference discovery mechanisms are unchanged.

Behavior: a project leaves proof untouched on normal runs, enables recording
only deliberately, declares its own generation command or skill, and a reader
can find that instruction and understand the limits of the published snapshot.
Update applicable current-product docs and planning prose to reflect deliberate
proof. Retained proof and CI verdicts remain independent observations.

### 2. Publish and adopt the deliberate-proof contract
Type: Behavior
Status: planned
Proof: immutable release/tag identity, ordinary all-root update and repeat
no-op receipts, verified rollout commits on each configured remote trunk,
and accepted migration requests to affected projects.

Behavior: the reviewed contract is available as a patch release and installed
in every production-dashboard repository; each project with Cucumber proof
receives the concrete request to adapt its producer and declare its command
or skill. Read-only inspection accounts for other projects without requiring
unsupported proof adapters. This is an interactive maintainer publication
slice, performed by the coordinator using the release-and-update-clients skill.

## Delivery and rollout

After independent refactoring and accepted proof, publish the source to trunk,
verify applicable CI, run release self-installation checks, select the next
numeric patch from fetched tags and publish main plus immutable annotated tag.
Use the release's inspected update helper for all six production repositories,
preserve concurrent work, verify both roots and no-op repeat, commit and push
only owned rollout changes. Before installation, retained source/installer
regression checks must apply to the released candidate.

Ask each affected project through an existing project chat to adopt the new
reference and configure every Cucumber Intent entry. Do not claim producer
migration from installed guidance alone. Report requested/running/completed
project migrations separately; observe any revisions this execution publishes
through their required CI and keep repair ownership.

## Concern review

Refinement not needed: the contract uses existing Intent configuration and
reading boundaries. Separate source behavior and release adoption have
independent proof loops and safe stopping points. No remaining slice-specific
concern. Project migrations are explicitly requested project work, not promised
to be complete merely by shipping guidance.

## Learnings

- Main advanced concurrently to human commit
  `d7d01402583da929c87a3eaaae4048a70f7c8727`, dropping local-proof/CI
  comparison and plan 450. Preserve that published change; only surviving
  current producer assumptions in SEED-192 change to deliberate recording.
  Dated November 1 direction remains historical, with November 2 direction
  added explicitly.
- Playwright CLI selectors match absolute paths. `intent-` matched this
  worktree name and selected the whole dashboard suite. The implementer
  observed fresh progress, interrupted only its identified process, observed
  the interrupted terminal result with no assertion diagnostics, and removed
  the judged attempt-owned artifacts. Explicit test-path prefixes selected
  the intended 60 tests in 26 files and passed.

## Accepted proof for slice 1

- `npm run typecheck:dashboard` passed in the owned checkout.
- `npm run test:dashboard -- intent-proof-generation.spec.ts authenticated-read-intent-proof-generation.spec.ts intent-cucumber-proof.spec.ts intent-cucumber-proof-absent.spec.ts intent-entry-folder-proof.spec.ts intent-entry-folder-summary-explanations.spec.ts authenticated-read-intent-locations.spec.ts --workers=2` passed.
- `npm run test:dashboard -- dashboard/tests/intent- dashboard/tests/boundary/authenticated-read-intent- --workers=2` passed; an independent `--list --reporter=list` confirmed 60 tests in 26 files.
- New `intent-proof-generation.spec.ts` publishes project settings and observes
  command/skill/missing/invalid declarations beside historical rows through
  folder, selected file and location views. Its DOM assertions establish
  inert instructions and snapshot qualifications; its published fixture is
  starting source/proof data, not the generation/rendered outcome.
- New `boundary/authenticated-read-intent-proof-generation.spec.ts` supplies
  Git-backed fixture settings/features/proof and observes real authenticated
  answers for valid, absent, conflicting, blank and malformed declarations
  while preserving the proof read. Existing Cucumber proof, absent/error,
  folder, selection and pinned-revision journeys remain passing.
- Representative conventional guidance walkthrough: ordinary passing/failing
  runs leave existing A/B proof untouched; explicit B refresh preserves A;
  explicit final failure of A clears A while unexecuted identities remain.
  Project runtimes follow their separately requested migrations.
- `python3 /Users/terryyin/.codex/skills/.system/skill-creator/scripts/quick_validate.py src/skills/dough-test-optimization` passed. `git diff --check` passed.
- `OPEN_DOUGH_TEST_JOBS=2 PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/bash scripts/test.sh tests/install-all-tools.sh tests/update-skip-verified.sh tests/self-installation-baseline.sh tests/release-version-finalization-gate.sh tests/install-preserves-open-dough-json.sh tests/dough-update-guidance-payload.sh` passed. The initial Bash 3 invocation refused before running checks; use the project's required Bash 5 runtime.
- Release self-installation check passed against both recorded 0.3.81 roots.
  Installer, payload paths and host-discovery/registration mechanisms are
  unchanged; their deterministic/reused evidence is not new native acceptance.
- Consumer trace is retained in acceptance conversation at
  `/tmp/deliberate-proof-consumer-trace.md`: real read/schema/Proof/summary
  consumers passed the selected surface; managed copies wait for slice 2;
  unrelated textual matches and historical records are excluded with reasons.
- Independent refactoring completed. It only reflowed the new requirements
  paragraph without changing its words. The guarded formatter then caught a
  case-insensitive basename collision between the schema and TSX component;
  source/schema placement changed to `dashboard/src/proofGeneration.ts`, with
  the two imports updated. `npm run typecheck:dashboard && npm run test:dashboard -- dashboard/tests/intent-proof-generation.spec.ts dashboard/tests/boundary/authenticated-read-intent-proof-generation.spec.ts --workers=2` passed (10 tests, two files). Other accepted boundaries are unchanged.
