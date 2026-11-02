# Deliberate Intent proof

**Identity:** SEED-223#deliberate-intent-proof
**Source:** [Deliberate Intent proof](../../seeds/SEED-223-deliberate-intent-proof.md#deliberate-intent-proof)

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
Status: planned
Proof: representative guidance walk plus focused pinned-read and browser
journeys observe the declaration, instruction, honest historical snapshot and
preserved existing proof. Source/reference discovery mechanisms are unchanged.

Behavior: a project leaves proof untouched on normal runs, enables recording
only deliberately, declares its own generation command or skill, and a reader
can find that instruction and understand the limits of the published snapshot.
Update applicable current-product docs and planning prose to reflect deliberate
proof. Retained proof and CI verdicts remain independent observations.

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

Refinement not needed: one cohesive proof-publication contract uses existing
Intent configuration and reading boundaries. No remaining slice-specific
concern. Project migrations are explicitly delegated project work, not promised
to be complete merely by shipping guidance.

## Learnings

None yet.
