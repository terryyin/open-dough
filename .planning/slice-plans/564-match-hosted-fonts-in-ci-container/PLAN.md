# Match the hosted runner's fonts in the diagnostic container

**Source:** [SEED-289 — Give the local CI container the hosted runner's fonts](../../seeds/SEED-289-named-test-results-locally-and-in-ci.md#match-hosted-fonts-in-ci-container)
**Identity:** SEED-289#match-hosted-fonts-in-ci-container

## Goal and scope

Make the maintained diagnostic container expose DD-435's two hosted-only
narrow-width failures under the dashboard's normal font stack, and pass the
repaired current journey. Supply the hosted Ubuntu 24.04 font families,
protect that contract in `tests/ci-container.sh`, and explain its provenance
and refresh in `tests/ci-container.md`.

Keep the existing Verdana overrides for native macOS regression coverage.
Font-parity acceptance separately removes those overrides in disposable
observations. Preserve the helper's CLI, native architecture, runtime/path
refusals, uid/gid, mounts, npm volumes, locked Chromium, and recipe-derived
cache identity. Normal tests and CI remain native. No CSS repair, new
dashboard-path CLI, architecture emulation, pixel-identical rendering
guarantee, deadline change, or unrelated hosted-platform parity is included.
If reproduction requires changing that boundary, stop for the scope decision.

## Existing solutions and architectural direction

PFE traced the diagnostic helper, workflow, native setup, font consumers,
browser regressions, and shell contract:

- `scripts/ci-container.sh` already owns the Ubuntu/Node/locked-Playwright
  recipe and its content-derived image tag. Add fonts there; no second
  diagnostic image, font injector, or cache registry is warranted.
- `.github/workflows/ci.yml` uses `ubuntu-24.04`; native browser setup installs
  Chromium without `--with-deps`. Playwright's dependency bootstrap in the
  bare container therefore does not establish the hosted font environment.
- `tests/ci-container.sh` already protects refusals and workflow agreement
  without requiring a real daemon. Extend that boundary for the font recipe,
  using an independent, source-attributed hosted font expectation. Keep live
  font/browser comparison as acceptance proof, not a network dependency of
  the ordinary shell test.
- `dashboard/src/styles.css` uses `system-ui, sans-serif`; monospace stacks
  also exist in source lines, proof/candidate paths, configuration, and final
  reports. Image fonts reach every dashboard page. The Intent proof and
  summary specs' Verdana injection is a local stress case, not the image's
  font source. Do not replace shared application typography to solve this.
- Reuse the actual historical specs and current app build/browser support.
  New automated domain fixtures use the shared MakeMe API; extend its
  canonical environment builder if needed. Keep Docker calls and independent
  expected package/font results outside the builder. Existing legacy shell
  setup does not authorize another ad hoc domain fixture API.

[ADR 0002 — Lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports changing the existing owner and retaining one font-environment
contract. [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)+bounds the claim to observed reproduction and current correctness, not a
predicted reduction in future repair tokens. The
[North Star](../../NORTH-STAR.md) has no font/container direction. No new
product-wide architectural decision or exception is needed.

## Decisive premises and preparation observations

Preparation observations were made on 2026-11-10 in
`/Users/terryyin/git/open-dough/.worktrees/give-the-local-ci-container-the-hosted-runner-s`
at `448c1b2048d4f0ac375a4bec4a6f35e95fbd6036`, on macOS, Node 24.21.0.
No image or browser-layout result is claimed by these observations.

| Premise / consuming operation | Literal observation or retained evidence | Result and remainder |
| --- | --- | --- |
| The actual failing hosted profile is identifiable. | `gh run view 42379612785 --repo terryyin/open-dough --job 128424257315 --log`, filtered for runner image fields. | Job `dashboard (8/12)` used `ubuntu-24.04`, image `20261101.360.1`, release `ubuntu24/20261101.360`. This is the second DD-435 occurrence's real consuming profile, not an assumed latest image. |
| That profile publishes a usable font inventory. | Downloaded the [release SBOM](https://github.com/actions/runner-images/releases/download/ubuntu24/20261101.360/sbom.ubuntu-24.04.json.zip) with `curl -fsSL`; Python `zipfile`/`json` read `sbom.json` and selected package names beginning `fonts-`, `xfonts-`, or `ttf-`. | Actual inventory: `fonts-dejavu`, `fonts-dejavu-core`, `fonts-dejavu-extra`, `fonts-dejavu-mono` 2.37-8; `fonts-lato` 2.015-1; `fonts-liberation` 1:2.1.5-3; `fonts-noto-color-emoji` 2.047-0ubuntu0.24.04.1; `fonts-ubuntu-console` 0.869+git20240321-0ubuntu1. This settles the published input, not installed fallback order or text widths. |
| Both historical examples are recoverable with their real dependency/browser profile. | `git rev-parse '4ad55b56d^' '68e5f52b3^'`; `git ls-tree` of both parents for `.node-version`, `package-lock.json`, and `scripts/ci-container.sh`; `git show` of each actual spec. | Parents are `0332f824ae60b9741732ba2c83e0db505645a805` and `d146a05d95f62810da79bf653e5f0f98fa58fefc`. Both carry Node 24.21.0 and the same lockfile blob `569122451d32b34364b23a069cfaf206ede02e77`. First spec is `dashboard/tests/intent-ci-proof.spec.ts`; second is `dashboard/tests/intent/intent-ci-proof.spec.ts`. Test title begins `at 200% zoom`. Actual browser consumption remains slice 1's probe. |
| The current focused proof can be selected without taking whole-suite admission. | After `npm ci --no-audit --no-fund --loglevel=error`, ran `npm run test:dashboard -- --list --reporter=list dashboard/tests/intent/intent-ci-proof.spec.ts --grep 'at 200% zoom'`. | Exit 0, exactly one Chromium test selected at line 140. Selection is settled; browser execution is not. The helper's `--dashboard` deliberately accepts no paths, so focused observation uses the same built image's direct Docker/Playwright entry, not an invented helper flag. |
| The current helper's refusal/workflow contract is runnable locally. | `bash tests/ci-container.sh`. | Exit 0, silent. It presently asserts no font contract; slice 2 needs a discriminating regression, not a claim that this baseline proves fonts. |
| The image supplies the hosted fallback and reproduces both historical failures on this machine's native architecture. | `docker info --format '{{.Architecture}}'` failed to connect to `unix:///var/run/docker.sock`; Docker is `/opt/homebrew/bin/docker`. [DD-435](../../../ProjectFindings.md#dd-435) retains DejaVu reproductions, but not the maintained helper with this complete font setup. | Open, bounded by slice 1. Starting the daemon, building the image and running isolated historical snapshots are state-changing operations. The unpaid prefix is exhausted; do not infer equivalence from the SBOM, `fc-match`, package presence, or the old ad hoc reproductions. A failure stops slice 2 and requires replanning or the named scope decision. |

The hosted inventory is the initial independent comparison source. Refresh it
against the identified image when execution starts if CI's image has changed;
retain that source/version and distinguish a historical baseline from the
current profile. Extra Playwright dependency fonts are acceptable only when
they do not change the dashboard fallback/observed layout being promised.

## Outside-in proof ownership

| Promise / key example | Owner | Observable proof |
| --- | --- | --- |
| Default font behavior catches the first pre-repair failure (example 1). | 1 probes; 2 accepts final recipe | Actual first parent's spec with normal app typography, locked browser, hosted fonts: narrow-window overflow failure, with selected fallback and overflow measured. Retain DD-435's historical 2 px as context, not a new exact cross-architecture assertion. |
| Default font behavior catches the sortable-header failure (example 2). | 1 probes; 2 accepts final recipe | Actual second parent's spec, no Verdana override: same assertion fails from narrow-table overflow. DD-435's historical 26 px is context. An unrelated setup, deadline, or browser failure proves nothing. |
| Repaired current table passes normal typography and the retained stress regression (example 3). | 1 probes; 2 accepts final recipe | Current focused narrow/zoomed test passes both with its existing override and with only that injected override removed in a disposable observation. Record the actual rendered font (for example Chromium's platform-font query), computed stack, viewport, and no-overflow result. |
| Font recipe covers the hosted inventory and drift is caught (example 4). | 2 | Maintained `tests/ci-container.sh` exercises generated Dockerfile content against independently sourced expectations; deleting a required font fails, restoring it passes. Live image package/family inventory and browser fallback agree with the identified hosted baseline. |
| Changing fonts changes image identity and existing helper safety remains intact (example 4). | 2 | Capture generated recipe/tag with the established fake runtime or MakeMe-backed extension. Changed font recipe selects a different tag; unchanged recipe reuses it. Existing runtime/path refusals, workflow/bootstrap agreement and run isolation remain green. Inspect actual Docker args for affected uid/mount/volume behavior. |
| Shared dashboard consumers still work in the changed image. | 2 | Run `scripts/ci-container.sh --dashboard` (type-check plus the complete unsharded dashboard suite), since a system-font change reaches all browser pages, not just the original assertion. Keep native spec stress coverage. |

## Ordered slices

### 1. Reproduce the hosted fallback in the diagnostic image

Type: Behavior
Status: planned
Proof: A bounded infrastructure probe observes the two historical overflow
failures and current repaired success with normal typography, or stops the
dependent image delivery with the precise unreproduced condition.

Behavior: Given the identified hosted image inventory and the three source
revisions, building an isolated diagnostic image with those fonts and running
each real narrow-width journey exposes both old faults and accepts the repair.

- Inspect this machine's load, memory, active suites and Docker allocation
  before starting expensive work. Start the available Docker-compatible
  runtime within ordinary local setup authority; if it requires credentials
  or developer-only action, stop this probe with that exact requirement.
- Build a disposable candidate using the maintained recipe with the hosted
  font packages, preserving its locked browser and native architecture.
  Inspect installed packages/families and actual rendered fonts. Compare the
  published hosted inventory and DD-435's DejaVu observation; if that is
  insufficient to establish the current hosted selection, obtain a bounded
  hosted observation before claiming equivalence. Do not silently alter CI
  typography to create a different reference.
- Materialize isolated historical snapshots below the execution workspace,
  retaining revision, lockfile and spec paths above. Supply Git metadata as
  the helper requires; do not replace historical app CSS or tests with current
  copies. Use the candidate image and the normal helper mount/user/npm
  isolation. The focused in-image command is
  `CI=true npx playwright test --config dashboard/playwright.config.ts <spec-path> --grep 'at 200% zoom' --workers=1`.
  Record full Docker invocation, source revision, browser/image identity,
  rendered fallback and the overflow assertion for each run. Both historical
  specs predate the added Verdana override; verify rather than injecting it.
- On current execution trunk, run the same focused journey first as checked
  in, then without only its Verdana injection in a disposable copy. Restore
  scratch changes before recording or delivering. Do not weaken assertions.
- Expected historical negative cases are fault-replay observations, not
  accepted failures of the current maintained suite. If a different fault
  obscures the required overflow, diagnose it; it does not satisfy the probe.
- If either historical failure or current success cannot be observed, stop
  dependent slice 2. Retain evidence and revise this plan within scope, or
  ask Terry for a consequential scope/architecture decision. Do not mark the
  story complete from package installation alone.

Sizing: one three-revision comparison loop, with image/download time as
external wait. Medium confidence until runtime and native-architecture
fallback are observed. No separate reusable replay framework is required.

### 2. Make hosted fonts the maintained diagnostic default

Type: Behavior
Status: planned
Proof: The final helper recipe discriminates font removal, reproduces both
historical faults and passes the repaired current journey and full dashboard
suite, while preserving refusal, cache and isolation contracts.

Behavior: Given a reachable runtime, invoking the existing helper builds or
reuses an image whose default font environment gives the hosted layout
result; the normal test contract catches loss of required fonts.

- Carry slice 1's proven package/font setup into `scripts/ci-container.sh`.
  State its font package input once in the existing recipe. Keep dependency
  installation before list cleanup as appropriate; preserve locked
  Playwright and all existing invocation/run semantics.
- Extend `tests/ci-container.sh` at its existing boundary. Keep the hosted
  expectation independently attributed to a recorded image/SBOM rather than
  generating both actual and expected from the same variable. Use MakeMe for
  new domain setup. Deliberately remove a required package in a scratch edit
  to observe regression failure, then restore and observe success. Prove
  generated Dockerfile consumption, not merely a declaration's presence.
- Inspect affected consumers with the installed consumer-trace script and
  resolve every listed boundary. Run `bash scripts/test.sh tests/ci-container.sh`
  and applicable focused support tests. Verify cache identity and the run
  arguments the image change must preserve.
- Update `tests/ci-container.md`: replace its blanket statement that font
  layout cannot be reproduced with the tested comparison, inventory source,
  update/check procedure, and remaining native-architecture/rendering limits.
  Keep existing Verdana specs; the normal-font replay remains separate proof.
- Reuse slice 1's results only if the final recipe, browser, source revision
  and font environment remain equivalent. Otherwise repeat affected focused
  comparisons on the final image. Run the final helper's complete
  `--dashboard` journey, including type-check, with bounded concurrency after
  inspecting host headroom. Reuse unaffected observations and fix failures.
- Perform post-change refactoring through the established execution workflow,
  run the focused proof after edits, and deliver with the existing commit/CI
  procedure. Accept the story only with final recipe and browser evidence.

Sizing: one cohesive image-default correction with its source-attributed
contract, diagnostic documentation, and final consumer proof. No preparatory
framework slice. The broad dashboard run is necessary because the changed
system-font environment reaches all browser consumers; it is not a blanket
requirement inferred from hosted CI.

## Local gates and delivery

- Follow [AGENTS.md — Test automation](../../../AGENTS.md#test-automation):
  shared MakeMe data, observable events or a controlled clock, default test
  timeout, and no `test.slow()`.
- Local gate: focused shell/support proof and the changed image's complete
  dashboard journey. Apply the maintained macOS sleep guard and power
  condition in [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos):
  begin fully awake; on AC use `caffeinate -s -i scripts/ci-container.sh --dashboard`.
  On battery plug in, or keep the lid open under `caffeinate -i` and inspect
  the sleep log afterwards. A run invalidated by sleep is rerun under that
  policy. Bound the runtime's CPU allocation before the full run if headroom
  requires it, preserving complete coverage and the existing helper CLI.
- Use the installed Dough execution workflow for refactoring, agent commits,
  delivery and final applicable CI. No trunk-only action or prerequisite on
  the test-deadline sibling exists. Preparation grants no execution authority.
- Carry this project's [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written into every delegation and repair handoff. A base failure is
  attribution, not exemption; another active owner of the exact repair is
  the coordination boundary, whose uncommitted work must be preserved.

## Current decisions and learnings

- Retain the Verdana overrides for native coverage; normal-font acceptance
  must remove them only in owned disposable observations.
- Use the identified hosted image's font inventory and actual browser result,
  rather than assume the moving runner label or Playwright dependencies imply
  parity. Confirm execution's current reference before final acceptance.
- The first historical spec moved directories later; replay its actual path.
- A recipe hash already owns image invalidation. No new shared font service,
  North Star topic, or ADR is warranted.
- Keep the diagnostic image correction independent of the sibling deadline
  execution. Reconcile shared-seed changes by preserving both story sections.

## Plan review

Slice-plan refinement was not needed: the early state-changing observation
and one resulting image-default delivery have distinct proof ownership,
and all source promises map to them without additional structural machinery.
No remaining slice-specific concern was identified beyond the runtime and
browser-equivalence premises explicitly bounded by slice 1; its unsuccessful
result stops slice 2. No pre-Take human decision is required by this plan.
