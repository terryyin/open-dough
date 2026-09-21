# Prepare each execution worktree for project commands

Status: executing; slice 2 delivered.

## Source and outcome

Identity: SEED-008#prepare-execution-worktree

Source: [selected story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#prepare-execution-worktree).
Terry requested refinement followed by a slice plan on 2026-09-21. This
authorizes planning, not implementation.

A developer using Open Dough through Codex, Cursor, or Claude Code can begin
execution in a newly selected worktree and run the project's ordinary commands
without diagnosing missing dependencies, borrowing mutable installation state
from another checkout, or learning a host-specific setup path.

The selected story responds to two observed boundaries:

- [DD-074](../../../DearDough.md#dd-074--a-fresh-trunkstory-branch-worktree-has-no-installed-dependencies-and-no-guidance-says-so)
  records fresh sibling worktrees reaching formatting without their own npm
  installation until a developer diagnosed the failure and ran `npm ci` or
  `npm install`.
- [ODF-070](../../../docs/maintainer/finding-names.md#odf-070--tool-availability-is-inferred-from-a-local-dependency-directory)
  records nested worktrees being declared unusable from a missing local
  `node_modules` directory even though the actual command could resolve a
  parent installation. The accidental success is not the desired dependency
  contract, but the finding establishes that directory inspection is not a
  valid availability test.

## Scope and current decisions

- Prepare a newly created or newly supplied execution worktree before any
  implementation delegation, formatting, proof, build, or CI command depends
  on project tooling. Caller-selected current-branch work retains its existing
  location choice; when its checkout is newly supplied and unprepared, the same
  readiness rule applies there.
- Resolve preparation from the executing project's checked-in conventions and
  dependency metadata. Use its deterministic locked setup when one is
  established. For Open Dough, that is `npm ci` against the committed
  `package-lock.json`; preparation must not rewrite the lockfile.
- Establish readiness by running an applicable project command from the
  selected checkout. Do not infer availability from the presence or absence of
  `node_modules`, `target`, `build`, or a similar local directory.
- Reuse host-established preparation only when its evidence belongs to the
  exact selected checkout and current dependency state and the applicable
  project command succeeds there. Otherwise perform the project's setup in
  that checkout. Add no preparation registry or duplicate state file.
- Keep mutable installed dependencies, generated output, and project-local
  caches in the selected checkout. Supported package-manager download or
  artifact caches may remain machine-level. Never copy or symlink mutable
  installation output from another checkout and never rely on parent-directory
  resolution as the contract.
- A missing, ambiguous, or failed required preparation stops the affected
  execution before implementation delegation and before claiming proof or CI
  readiness. Preserve the checkout and report its path, the command selected
  or the missing convention, and the failure needed for recovery.
- Keep one authoritative runtime rule in released `dough-execute-plan` source.
  Host environment facilities may establish or invoke the same project-owned
  outcome, but Codex, Cursor, and Claude Code do not gain separate preparation
  policies.

Material exclusions: no Nix adoption or requirement, package-manager
replacement, universal cross-ecosystem setup command, copying of ignored local
configuration or secrets, dependency-store layout optimization, external
service provisioning, parallel port/database allocation, branch-policy change,
or remote-publication migration. Naturally supported project conventions are
not rejected merely because this story proves only representative Node and
wrapper-driven non-Node cases.

Assumptions: a project that requires preparation exposes enough checked-in
convention to select it without inventing policy. If no required command can be
resolved unambiguously, the promised outcome is a recoverable stop, not a
guessed command. Network access, credentials, private registries, and host
system packages remain project-owned prerequisites.

## Existing solutions and architecture

PFE inspection at `56d499a8f033886dc44631ad2f3652733e0a45c1` supports changing
the existing execution setup owner rather than adding an environment manager:

- `src/skills/dough-execute-plan/references/execution-location.md` already owns
  worktree creation, resume identity, setup failure, selected working directory,
  and the boundary before delegation. Add project-command readiness there.
- `src/skills/dough-execute-plan/SKILL.md` already routes every planned and
  planless execution through execution-location before delegating a slice. Keep
  that sequencing and avoid a second entry path.
- `src/skills/dough-execute-plan/references/runtime-setup.md` owns only the
  checkout-bound CI observer runtime and provider command. Do not turn CI setup
  into the owner of development dependencies or make observation a prerequisite
  for worktree readiness.
- The executing project's package manager or wrapper remains authoritative for
  dependency resolution and safe cache reuse. Open Dough's `package.json`,
  `package-lock.json`, contributor guidance, and CI already establish `npm ci`;
  no new Open Dough configuration key is warranted.
- Existing native-run supervision, stream-completeness, result-retention, and
  per-host command adapters under `tests/support/` can support a bounded
  story-specific acceptance journey. Reuse those mechanisms without extending
  the ADR-awareness behavior model or building a general native test framework.
- `tests/execution-payload-update.sh` already proves the released execute-plan
  reference reaches supported installation roots. The existing reference is
  already declared in the managed payload, so this story does not add or
  manually synchronize `.agents/skills/` or `.claude/skills/` copies.

The common rule is: an execution may cross the implementation boundary only
from the selected checkout after that checkout's project-owned preparation and
an applicable command establish usability; otherwise it stops with recoverable
evidence. Package ecosystems and host adapters supply inputs to this rule, not
parallel versions of it.

Follow [AGENTS.md](../../../AGENTS.md), Accepted
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(small useful increments, one conceptual owner, stop and fix),
[ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
(minimal shared configuration and one cross-tool behavioral source),
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
(deterministic checks plus representative native acceptance), and
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(runtime instructions address the executing project and keep one authoritative
home). Index and in-file statuses agree: ADRs 0000–0006 are Accepted and
0007–0009 are Proposed. No Accepted ADR conflict, exception, or supersession
gap was found. Proposed ADR 0009 and the North Star's publication topic do not
govern dependency preparation, so this plan changes neither. No new North Star
topic is warranted.

## Proof strategy and execution gates

The product change is executable guidance. Cheap checks should protect the
source contract, installed-payload reachability, fixture isolation, and the
native journey assessor, but static wording and recorded substitutes do not
prove that an agent follows the behavior. Native acceptance must observe the
candidate installed in disposable repositories through Codex, Cursor, and
Claude Code.

Use a story-specific disposable fixture with:

- a Git repository and a separately located execution worktree;
- a locked local-file Node dependency whose executable is unavailable before
  `npm ci`, avoiding registry/network dependence;
- an install trace and project command that expose their order without supplying
  the behavior under test;
- an originating-checkout marker and lockfile digest to detect mutation or
  borrowed mutable state;
- a failing-install variant; and
- a wrapper-driven non-Node variant whose supported artifact cache is outside
  the worktree while generated output remains inside it.

The native prompt selects ordinary `dough-execute-plan` behavior and supplies
the user outcome, not the expected setup answer. Assess host event streams and
filesystem observations together: install/setup before first implementation
delegation, the applicable command from the selected checkout, no mutable
installation copied from the origin, and the required stop on failure. Exit 0
or self-report alone is insufficient. Bound each native run, retain incomplete
or failed evidence for current assessment, and do not retry until green. Reuse
existing per-host supervision and stream-completeness helpers; add only the
smallest story-specific fixture, prompt, and assessor needed for these signals.

Each slice owns focused red/green proof, applicable guidance alignment,
AGENTS.md's invocation/context/useful-outcome review, and slice-local cleanup.
Use normal execution proof acceptance, independent post-change refactoring,
descriptive imperative commits, delivery, and asynchronous CI once execution
is separately authorized. Edit runtime source under `src/skills/`; do not edit
installed managed copies. At story completion run `bash
tests/execution-payload-update.sh`, `bash scripts/test.sh`, and `git diff
--check`, using Bash 4+ as this project requires.

## Ordered slices

### 1. Gate implementation on a command-usable execution checkout

Type: Behavior
Status: done

Behavior: Given a newly selected execution checkout with an established locked
project setup, when execution reaches the boundary before implementation
delegation, Open Dough performs that setup in the selected checkout and runs an
applicable project command there; execution proceeds only when the command is
usable, while missing, ambiguous, or failed preparation stops before delegation
with the checkout path, selected or missing command, and failure preserved.

Extend the existing execution-location rule, keeping worktree creation and
readiness as one setup lifecycle. Resolve the command from project-owned
conventions rather than an Open Dough configuration key. The fresh Open Dough
case uses `npm ci`; the general rule must not be encoded as an npm recognizer.
Treat setup plus the command check as one readiness gate so the first delivery
boundary is safe on both success and failure. Do not arm CI, claim proof, or
delegate implementation before it passes.

Proof: In the disposable locked Node fixture, start with no installation in a
separately located execution worktree. Observe its setup trace followed by the
project command, both with the execution checkout as working directory, before
the first implementation delegation. The command succeeds, the execution
worktree owns its mutable installation, and the origin marker and both lockfile
digests remain unchanged. In the failing-install variant, observe no delegation,
format/proof command, or CI-readiness claim; the retained report names the
checkout, command, and failure. A counterexample that merely checks for
`node_modules` must fail the assessor.

Focused command after adding the bounded fixture/assessor:
`node --test src/skills/dough-execute-plan/scripts/execution-worktree-preparation.test.mjs`

Sizing: one pre-delegation readiness decision with success and failure branches
in a single proof loop; medium confidence because instruction behavior and
delegation order must be observed together. Safe stopping point: fresh
worktrees either reach a verified project-command state or stop recoverably;
host-established reuse and cross-ecosystem/native coverage remain explicit.

### 2. Reuse only preparation established for the selected checkout

Type: Behavior
Status: done

Behavior: Given a host has already prepared the exact selected checkout for its
current dependency state, when execution verifies an applicable project command
there, Open Dough reuses that outcome without another clean install; preparation
from a different checkout, changed dependency state, or an unusable command is
not reused and the ordinary readiness gate applies.

Keep evidence local to the current execution context and actual command result;
add no registry, stamp file, or host-specific policy. A host callback may supply
evidence, but cannot redefine what prepared means. Preserve supported
machine-level package caches while keeping mutable installation output local.
Do not use parent-directory resolution, copied `node_modules`, or a symlink as
reuse evidence.

Proof: Prepare the selected fixture worktree once and record its install count,
then enter execution through the host-established path. Observe the applicable
command succeed and the count remain one. Contrast preparation evidence naming
another worktree and a lockfile/dependency-state change: each must run setup in
the selected checkout before the command. A nested-worktree case whose command
can see an enclosing installation must not be accepted as prepared unless the
selected checkout itself satisfies the project-owned readiness outcome.

Focused command:
`node --test src/skills/dough-execute-plan/scripts/execution-worktree-preparation.test.mjs src/skills/dough-execute-plan/scripts/execution-worktree-preparation-reuse.test.mjs`

Sizing: one reuse decision and its negative identity controls; medium
confidence because host evidence shapes are intentionally not standardized.
Safe stopping point: repeated execution avoids unnecessary setup without
borrowing another checkout's mutable state; non-Node and native-host proof
remain explicit.

### 3. Follow a non-Node project's own preparation convention

Type: Behavior
Status: planned

Behavior: Given a non-Node project supplies a checked-in wrapper-driven setup
and ordinary command, when Open Dough prepares a fresh execution worktree, it
uses that convention and its supported shared artifact cache, keeps generated
output in the selected worktree, and introduces no npm, Nix, or copied build
artifacts.

Exercise the same readiness rule rather than adding an ecosystem branch. Use a
small fixture wrapper that names its setup and command explicitly; it may model
a Java-style artifact cache and `build/` or `target/` output without requiring a
live external repository. If the existing wording already produces this
behavior, retain the proof without manufacturing a source change.

Proof: Run the wrapper-driven fixture from a fresh sibling worktree. Observe the
wrapper setup and applicable project command before delegation, shared immutable
artifact-cache reuse, worktree-local generated output, and absence of npm/Nix
commands or origin-checkout artifact copying. A missing wrapper convention must
exercise slice 1's recoverable stop rather than trigger ecosystem guessing.

Focused command:
`node --test src/skills/dough-execute-plan/scripts/execution-worktree-preparation.test.mjs src/skills/dough-execute-plan/scripts/execution-worktree-preparation-reuse.test.mjs`

Sizing: one extension of the common readiness model to a materially different
project convention; high confidence once slice 1's rule exists. Safe stopping
point: project ownership is demonstrated beyond Node without adopting a generic
environment manager; native tool parity remains explicit.

### 4. Use the shared preparation outcome in Codex, Cursor, and Claude Code

Type: Behavior
Status: planned

Behavior: Given the candidate Open Dough payload is installed natively for
Codex, Cursor, or Claude Code in an isolated project, when that host begins
ordinary execute-plan work in a fresh selected worktree, the same project-owned
readiness gate runs before implementation delegation and produces the same
success or recoverable-stop outcome without host-specific setup semantics.

Reuse the existing native supervision, event decoding, deadline, retained
result, and workspace-isolation helpers. Add one bounded story-specific journey
and assessor; do not change the ADR-awareness cases or turn this into a general
execute-plan conformance suite. Exercise the fresh Node success on all three
hosts because this story changes their common execution boundary. Select the
failure, reuse, and non-Node variants across hosts according to unresolved
adapter risk rather than repeating the complete matrix three times. Any host
facility that prepared the checkout must still satisfy slice 2's evidence rule.

Proof: For each host, install the same candidate source into a fresh disposable
fixture and launch an ordinary prompt that invokes execute-plan without telling
the agent to install dependencies. Retain the complete native stream and
filesystem observations. Observe worktree selection, setup and project-command
order before first implementation delegation, worktree-local mutable state,
unchanged origin and lockfile, and a useful completed outcome. Across the
selected counterexamples, observe failed preparation stopping delegation,
verified exact-checkout reuse avoiding a second install, and the wrapper-driven
project avoiding npm/Nix. Missing, truncated, inconclusive, or self-reported-only
evidence leaves that host pending.

Focused native commands after adding the bounded wrapper:

```sh
bash tests/execution-worktree-preparation-native.sh --native codex
bash tests/execution-worktree-preparation-native.sh --native cursor
bash tests/execution-worktree-preparation-native.sh --native claude
```

Focused credential-free harness command:
`bash tests/execution-worktree-preparation-native.sh`

Sizing: one shared native outcome with three host adapters; lower confidence
because no existing execute-plan native journey owns the delegation-order
signal, although the supervision and stream helpers exist. Keep each host run
bounded and assess it independently. Safe stopping point: every supported tool
has current evidence for the shared readiness rule, or the specific host remains
an explicit unfinished acceptance obligation under ADR 0005.

## Promise ownership

| Promise | Owning slice and observable proof |
| --- | --- |
| Fresh selected worktree becomes project-command usable before implementation | 1: setup/command/delegation trace plus execution-worktree filesystem state |
| Failed or unresolved preparation stops recoverably | 1: failing fixture, no delegation/readiness claim, retained path/command/failure |
| Availability is established by the command, not a directory check | 1: success and `node_modules`-inspection counterexample; 2: nested-worktree control |
| Exact applicable host preparation is reused without duplicate install | 2: install count stays one and command succeeds |
| Unrelated or stale preparation and parent resolution are not borrowed | 2: checkout/dependency-state negative controls |
| Project package manager/wrapper owns dependencies and safe shared cache use | 1: locked npm fixture; 3: wrapper-driven non-Node fixture |
| Mutable dependencies and generated output remain worktree-local | 1–3: origin markers, realpaths, and artifact locations |
| No Nix, universal setup command, or new Open Dough configuration is introduced | 1/3 source inspection and Node/non-Node contrasting proof |
| One behavioral source works through Codex, Cursor, and Claude Code | 4: independent complete native journeys using the same candidate source |
| Released installations receive the changed runtime guidance | 4 and final `bash tests/execution-payload-update.sh` |

## Plan assessment and remaining concerns

The sequence uses one common readiness model. The Node and non-Node examples
exercise the same rule rather than accumulating ecosystem recognizers; verified
reuse is an optimization of that rule, not a second preparation representation.
No preparatory Structure slice is justified because execution-location already
owns the exact lifecycle boundary and existing native helpers expose the needed
host mechanisms.

Slice 4 has one concrete sizing concern: the repository has native supervision
and per-host stream adapters but no existing execute-plan journey that observes
the first implementation-delegation event. The smallest host-neutral signal may
only become clear while building the fixture/assessor. The consequence is lower
confidence for that slice and a risk that one adapter needs a narrow observation
addition. It does not justify a general runner framework or separate host policy.

No other slice-specific concerns were identified. There is no supplied numeric
slice target, hard limit, S/M/L definition, or repeated-overrun threshold, so
none is invented. Each slice has one behavior/proof loop and a safe stopping
point. Slices 1–2 are delivered on `cursor/069-prepare-execution-worktree`.
Slices 3–4 remain planned.

## Accepted proof

Slice 1 — fresh locked worktree is command-usable before implementation;
failed install stops recoverably; availability is not a `node_modules`
directory check.

- Promise: setup then applicable command in the selected checkout before
  delegation; missing/ambiguous/failed preparation stops with checkout,
  command, and failure.
- Boundary: `execution-location.md` setup lifecycle before implementation
  delegation (not CI runtime, not host reuse, not non-Node).
- Command:
  `node --test src/skills/dough-execute-plan/scripts/execution-worktree-preparation.test.mjs`
- Setup: `createLockedNodeFixture` — git origin plus sibling worktree,
  `file:` fixture-cli unavailable before `npm ci`, CONTRIBUTING
  locked-setup/prove, origin-marker and origin-install-marker, failing
  `preinstall` variant. Directory-presence counterexample uses a disposable
  dir with `node_modules`.
- Observations:
  - `execution-location owns project-command readiness before delegation`:
    source-contract regexes on `SKILL.md`, `execution-location.md`, and
    `runtime-setup.md`.
  - `a fresh locked worktree becomes command-usable before delegation`:
    setup then command traces with cwd=execution, then delegate;
    `fixture-cli-ok`; execution owns `node_modules`; origin marker and both
    lockfile digests unchanged.
  - `failed preparation stops before delegation, proof, or CI readiness`:
    no delegate/format/proof/ci-ready/command; report names checkout,
    `npm ci`, and failure; traces empty.
  - `a node_modules presence check fails the assessor`:
    `directoryPresenceObservation` is rejected.
- Result: pass (inspected after implementation; refactor split fixtures
  into fixture/gate/assessor modules and reran the same command, 4/4).

Slice 2 — host-established preparation of the exact selected checkout and
current dependency state is reused without a second clean install; other
checkout evidence, stale lockfile state, and nested parent resolution are
not reused.

- Promise: reuse only matching host evidence; otherwise the ordinary
  readiness gate runs in the selected checkout.
- Boundary: same `execution-location.md` setup lifecycle; reuse is not a
  second preparation path.
- Command:
  `node --test src/skills/dough-execute-plan/scripts/execution-worktree-preparation.test.mjs src/skills/dough-execute-plan/scripts/execution-worktree-preparation-reuse.test.mjs`
- Setup: `createLockedNodeFixture`; `hostPrepareCheckout`; host evidence
  `{ checkout, dependencyState }` vs `lockfileDigest`; nested
  `.worktrees/nested-exec` under origin with a parent `npm run prove` probe.
- Observations:
  - source-contract reuse wording in `execution-location.md` / `SKILL.md`
  - `host-established preparation of the selected checkout is reused`:
    setup count stays 1; command then delegate; `fixture-cli-ok`
  - `preparation evidence naming another worktree is not reused`: setup
    then command in the selected checkout
  - `changed dependency state is not reused`: second setup in the selected
    checkout
  - `a nested checkout is not prepared by an enclosing installation`:
    `reused` false; setup then command in nested; nested owns install
- Result: pass (inspected after implementation; refactor split reuse tests
  into `execution-worktree-preparation-reuse.test.mjs`; mechanical `eqeqeq`
  repair on nullish checks; 8/8).

## Learnings

Cheap slice-1 proof is three test-only concepts: locked fixture, substitute
readiness actor, and assessor. The actor is not product runtime. Slice 4
still owns native host journeys. Host-established reuse is delivered as an
optimization of the same gate; ordinary readiness and reuse cases live in
separate test modules after the file-size split. Wrapper-driven non-Node
remains slice 3.

## Preparation and current state

Planning provenance (complete; not an execution workspace):
owned preparation checkout
`/Users/terryyin/.codex/worktrees/refine-worktree-dependencies/open-dough`,
branch `codex/refine-worktree-dependencies`, starting revision
`56d499a8f033886dc44631ad2f3652733e0a45c1`. Terry authorized committing and
publishing the retained backlog entry, refined story, and slice plan to `main`,
then removing that preparation worktree and branch, on 2026-09-21.

## Execution identity

- Mode: Story Branch Mode (default; no `--trunk`)
- Replanning permission: allowed (no `--no-replan`)
- Originating / integration checkout: `/Users/terryyin/git/open-dough`
- Integration branch: `main`
- Authorized remote target: `origin/main` (`git@github.com:terryyin/open-dough.git`)
- Queue claim published revision: `3543fad2167169092ac47ba5afbbeba4d0a0d40b`
- Claim CI: `pendingCi: unobserved` (Story Branch claim published to trunk
  before a story-branch observer exists)
- Execution checkout: `/Users/terryyin/git/open-dough-worktrees/069-prepare-execution-worktree`
- Execution branch: `cursor/069-prepare-execution-worktree`
- Authorized story-branch destination: `origin/cursor/069-prepare-execution-worktree`
- Slice budget: none supplied; do not invent a numeric target, hard limit, or
  overrun threshold
- Focused proof for slice 1:
  `node --test src/skills/dough-execute-plan/scripts/execution-worktree-preparation.test.mjs`
- Runtime wrapper: none; run Node and Bash commands directly from the execution
  checkout
- Selective formatter (coordinator delivery): `npm run format`
- Commit hook contract: absent (only sample Git hooks); check-only lint is not
  registered
- CI observer directory: `/tmp/dough-ci-501/watch-JBYBsB`
  (armed from the execution checkout against
  `terryyin/open-dough` / `cursor/069-prepare-execution-worktree`;
  `DOUGH_CI_WORKFLOW=ci.yml`, `DOUGH_CI_WORKFLOW_NAME=CI`)
