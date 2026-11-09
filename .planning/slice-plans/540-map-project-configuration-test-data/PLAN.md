# Make machine-local project configuration test setup map directly to the domain

**Identity:** SEED-261#map-project-configuration-test-data
**Source:** [Refined story](../../seeds/SEED-261-share-domain-test-data.md#map-project-configuration-test-data)
**Source review:** [Source-only review](source-review.md)

## Goal and boundaries

Maintainers can read a test's configured source and machine-local checkout
directly in its setup. Convert synthetic saved project rows through MakeMe,
with the same saved values and independent product checks. Own the registry
facts in mixed cases. Published sources on their own, fake GitHub answers,
real checkout and worktree operations, launch records, and session evidence
keep their current owners. Existing server seeding and writes under test
continue to supply their own evidence.

## Current decisions

- Build the [ConfiguredProject](../../../dashboard/server/projectConfiguration.ts)
  value using the [MakeMe](../../../tests/support/makeMe.mjs) published-source
  facts plus an explicit `localPath`. Use JSDoc against the canonical type.
  Reuse `aPublishedSource` defaults for incidental `ref` and `backlogPath`.
  Set a ref or visibility at the call site when the case relies on it. Return
  the row directly. Environment, file encoding, and persistence belong to the
  dashboard test harness. Keep public source and local settings projections
  separate. The existing source builder and configuration readers suffice
  independently of the sibling fixture migrations.
- [Default development setup](../../../dashboard/tests/support/projectConfiguration.ts)
  uses the actual production seed as the expected catalog for existing journeys
  and writes only on a missing development file (`wx`). Keep that behavior
  and the explicit opt-out for genuine first starts. The configured-project
  builder is for synthetic facts. Reuse the actual seed where the seed is
  already the source of setup and preserve exact encoding in the [production
  update journey](../../../dashboard/tests/runtime/productionUpdateJourney.ts),
  which observes file bytes and inode. Keep path or server setup helpers when
  they still have callers. `projectAddMachine` and `systemSettingsMachine`
  already start real servers with development fixture seeding disabled. The
  valid synthetic rows are in their consuming cases and other fixture code.
- Follow [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
  and [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state).
  The [dashboard North Star](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
  records the machine-local, ordered list per environment. Keep builders in
  [test support](../../../tests/README.md#test-data-architecture) and preserve
  real encoders and isolated, deterministic proof under [ADR 0005, Cross-tool
  validation through native acceptance stories](../../../docs/adrs/0005-cross-tool-validation-accepted.md#2-keep-deterministic-checks-in-ci).

## Preparation evidence

Observed at `f18389efe` in the assigned worktree with Node 24.21.0,
Homebrew Bash 5, and locked Chromium 153.0.8010.12. The focused Playwright
selections for configuration, Add/Hide/Remove, settings, serving modes, and
Sessions listing named below passed with `--workers=2` on AC under
`caffeinate -s -i`. The scratch changes were restored and the wider focused
selection passed on the restored checkout.

| Premise and consuming boundary | Observation |
| --- | --- |
| The saved file supplies source order, selection, and ref to the dashboard across restart. The serving modes use their own files. | `dashboard/tests/configuration/project-configuration.spec.ts` observed Zebra before Apple, selected Zebra, requested `repos/example/zebra/commits/trunk`, and checked unchanged saved bytes. Reversing only `customSavedProjects` at the serialization call made the browser observe Apple before Zebra and fail. The same spec retained exact empty, malformed, wrong-shape and unreadable-file cases. `backend-tests/runtime/(boundary-server\|serving-modes)\.spec\.ts$` passed with the environment-specific file checks. |
| Admission consumes the saved predecessor. Settings and public list expose different fields. | In `backend-tests/configuration/project-add-validation.spec.ts`, changing only the arranged duplicate repository from `EXAMPLE/SAMPLE-APP` to `EXAMPLE/ANOTHER-APP` made the real Add resolve where the test required rejection. On the restored input both duplicate variants passed with unchanged predecessor bytes. The long-path settings case passed its local path and reflow checks. `system-settings.spec.ts` and `project-configuration-boundary.spec.ts` passed the local settings and public-field assertions. |
| The replay writer's ordered registry drives real checkout lookup, and the regular Sessions listing consumes that writer. | In an isolated temporary HOME, `node --experimental-transform-types --disable-warning=ExperimentalWarning --input-type=module` imported `seedReplayProjects`, `initializeProjectConfiguration`, `projectSettings`, `publishedProjects`, and `localWorkspaces`. Initialization read six ordered sources with local paths `~/git/<id>` in settings and no local paths in the published projection. `git worktree list --porcelain` counted 7, 7, 5, 2, 21, and 2 linked worktrees. The workspace scan found eight claims. Pointing only the first row at a missing path in a second isolated HOME removed only its claims. `agent-launch-sessions-listing.spec.ts` passed the existing regular and history reads using the same replay writer. |

## Proof and delivery gates

Compare converted rows at the consuming boundary with their predecessors.
Preserve case-driving values and use the literal predecessor where bytes or
shape are part of the proof. Review the call sites for visible setup facts
and removed duplicate construction against [ADR 0010, Definition of
improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
Use the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
for changed shared helpers and run affected consumers in addition to the
named selections. Playwright filters below follow `npm run test:dashboard --`.

Local gate. Follow [test automation](../../../AGENTS.md#test-automation) and
carry the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written into each plan, delegation, and repair handoff. Follow [native
setup](../../../tests/native-setup.md), put Homebrew Bash 5 first on macOS,
and unset `NO_COLOR` and `FORCE_COLOR` for Playwright. Run
`npm run typecheck:dashboard` for shared builder changes. Before final
delivery run `npm run test:dashboard` and `npm test` because both suites load
the shared MakeMe entry point. On fully awake macOS with AC power, wrap full
runs in `caffeinate -s -i`. On battery, plug in or start fully awake with the
lid open under `caffeinate -i` and read the sleep log after the run. Follow
[Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Hosted CI follows the selected execution mode.

## Execution

Story Branch Mode in `.worktrees/make-machine-local-project-configuration-test-se`
on `claude/make-machine-local-project-configuration-test-se`, remote `origin`
(`terryyin/open-dough`), target `main`, as agent DavidKo-chan. The claim
`a5ddb0b30` is on `main` (starting revision `479f6f3b1`). CI is GitHub
Actions `ci.yml` (verified selector) on pushes to the execution branch.

## Slices

### 1. An ordered saved catalog drives startup and restart
Type: Behavior
Status: done
Proof: Source example 1. Run `'dashboard/tests/configuration/project-configuration\.spec\.ts$'` and `'backend-tests/runtime/(boundary-server|serving-modes)\.spec\.ts$'`. Compare saved row order, published request, and untouched file bytes.

Arrange Zebra and Apple with MakeMe at the case that saves their list. Start
and restart the real server. The configured order, default selection, and
published repository/ref are apparent in the existing observations. Remove
the displaced `customSavedProjects` constructor. Keep the exact raw `save`
inputs in the existing empty and error cases. Keep real default seeding and
the development no-clobber setup where it already consumes the real seed.

Accepted proof: `makeMe.aConfiguredProject`, typed against `ConfiguredProject`
in `tests/support/projectConfigurationTestData.mjs` beside `aPublishedSource`'s
one default rule, builds Zebra on `trunk` before Apple on `default` in the
restart case of `dashboard/tests/configuration/project-configuration.spec.ts`.
Its saved text is byte-identical to the removed `customSavedProjects`
literal. The spec's server harness moved unchanged to
`dashboard/tests/support/projectConfigurationMachine.ts`. The spec (7 tests),
the boundary-server and serving-modes specs (8 tests),
`npm run typecheck:dashboard`, and the native evidence identity checks passed.
Later slices reuse `makeMe.aConfiguredProject`. Per-commitment observations
are in [source-review.md](source-review.md).

### 2. A configured predecessor determines Add admission
Type: Behavior
Status: done
Proof: Source example 2. Run `'backend-tests/configuration/project-add-(boundary|validation)\.spec\.ts$'` and `'dashboard/tests/configuration/project-add[^/]*\.spec\.ts$'`. The valid duplicate is refused and the predecessor stays intact.

Arrange the valid duplicate rows through MakeMe and append them through the
existing configuration operation. Keep the repository and ID variants and
the exact request and expected refusal. Real Add, Git and GitHub validation,
filesystem faults, and the resulting saved files keep their current proof roles.

Accepted proof: both variants of "a case-insensitive duplicate … is refused
without replacing saved projects" in
`dashboard/backend-tests/configuration/project-add-validation.spec.ts` append
a `makeMe.aConfiguredProject` predecessor through the real
`appendConfiguredProject`. Its saved bytes and refusal match the replaced
literal. The case-different id or repository, label, `previous-branch` ref and
checkout stay at the call site because they distinguish the predecessor from
what Add would save. The two named selections (14 and 5 tests), the
write-fault cases in `system-settings-project-management*.spec.ts` (4 tests),
and `npm run typecheck:dashboard` passed. The other Add specs arrange no
synthetic saved row; their exact inputs and expected rows stay literal. The
refactor pass found nothing to change.

### 3. Settings show the saved checkout path
Type: Behavior
Status: done
Proof: Source example 3. Run `'backend-tests/configuration/project-(configuration-boundary|remove-boundary)\.spec\.ts$'` and `'dashboard/tests/configuration/(project-hide[^/]*|project-remove|system-settings|system-settings-project-management[^/]*)\.spec\.ts$'`. Settings show the long local path while the published list omits it.

Arrange the long-path row where the case saves it. Read it through the real
settings page and keep the layout and keyboard checks. Use the same builder
for valid synthetic registry rows found in these consumers. Preserve the
visibility and removal operations, failures, and saved results as evidence.

Accepted proof: "long configured facts reflow at narrow width and 200 percent
zoom with keyboard return" in
`dashboard/tests/configuration/system-settings-project-management.spec.ts`
saves a `makeMe.aConfiguredProject` row with the long repository and checkout
path. The real settings page shows the path at 360 px and at 200% zoom
without overflow, and focus returns. Through the real reader the row equals
its predecessor; only key order differs, and the case never reads bytes. It
was the only synthetic saved row in this selection. Hide, Remove, seeding and
captured bytes keep their roles. The public-list omission is observed by
`system-settings.spec.ts` and `project-configuration-boundary.spec.ts`. The
selections (2 and 14 tests) and `npm run typecheck:dashboard` passed. The
refactor pass found nothing to change.

### 4. The Sessions catalog points to its actual test checkouts
Type: Behavior
Status: done
Proof: Source example 4. Run `'backend-tests/sessions/agent-launch-sessions-listing\.spec\.ts$'`. Repeat the isolated replay observation above with pre-change and converted inputs to compare saved rows, checkout paths, and workspace claims through the real reader.

Arrange the six configured rows in `seedReplayProjects` through the same
builder. The real server can resolve each project's checkout, and the
regular Sessions and history queries still read the existing fixture. Keep
project IDs and real checkout paths aligned with the existing worktree
counts. Git operations, launch record setup, and session expectations stay
with their current owners. The opt-in `sessions-replay.spec.ts` measures
timing and shares the writer. Use the deterministic listing and checkout
proof for this conversion.

Accepted proof: `seedReplayProjects` in
`dashboard/tests/support/sessionsReplayProjects.ts` builds its six rows with
`makeMe.aConfiguredProject`. It states `ref: "main"` because claims are read
at the `origin/main` its own Git commands create, and it keeps the file write
and every Git operation. The isolated replay observation, repeated with the
pre-change and converted writer, gave a byte-identical 962-byte catalog, the
same ordered rows, settings paths and published keys, 7, 7, 5, 2, 21 and 2
linked worktrees, and the same 8 claims. Pointing the first row at a missing
checkout removed only its claims in both. The listing spec (2 tests) and
`npm run typecheck:dashboard` passed. No other synthetic saved row remains in
the dashboard tests. The refactor pass found nothing to change.

## Readiness review

Plan refinement was unnecessary because each slice has a separate consuming
boundary and introduces or extends the common builder alongside a real
caller. The same configured-project shape serves all three. The observations
above settled the assumptions used to choose the setup and proof. The review
found no remaining slice-specific concern.
