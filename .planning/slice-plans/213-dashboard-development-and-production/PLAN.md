# Separate dashboard development and production environments

**Identity:** SEED-082#dashboard-development-and-production
**Source:** [Refined story](../../seeds/SEED-082-dashboard-development-and-production.md#dashboard-development-and-production).
**Authority:** Terry requested a slice plan after refining the watcher, startup, and failed-release behavior. Preparation only; this request does not authorize Take, implementation, or publication of the draft.
**Preparation:** Reuse `/Users/terryyin/git/open-dough/.worktrees/separate-dashboard-development-and-production-en` on `codex/separate-dashboard-development-and-production-en`, with the existing `ziqing-chan` Preparing assignment (`249ac294aaa4816654e9be0f4c32d8bbada65024`). Remote target `origin/main`; integration checkout `/Users/terryyin/git/open-dough`. Retain the draft here for review until a disposition is given.

## Goal and boundaries

A developer runs one npm command in the development checkout. Its watcher starts a built production dashboard from the highest numeric Open Dough release tag on origin, at a local URL distinct from development's. Development edits and hot reload do not restart or refresh production. A newer release tag replaces production after its tagged build can run. A failed release leaves the last working release available, reports the failure, and is retried on a later check.

The development and production dashboards continue to use the same hardcoded real-project catalog and machine-local launch/session records. Do not migrate or isolate them; [SEED-083](https://github.com/terryyin/open-dough/blob/06f8fe0134403acab8677adebfff7695ec5702c6/.planning/seeds/SEED-083-persistent-dashboard-project-configuration.md#persistent-dashboard-project-configuration) owns the later project-configuration split. Do not add project registration, hosted deployment, sign-in, a service manager, a package-manager switch, or a release pipeline.

Use `npm run watch:dashboard` as the single production entry command and a fixed loopback production URL distinct from development's `127.0.0.1:43127` (the current preview default is `127.0.0.1:4173`). Exact polling and retry intervals are implementation details; checks must be bounded, repeat while the watcher lives, and stop when it exits.

## Existing solutions and direction

PFE searched the root npm commands, dashboard server/configuration, local records, release resolver, test harness, and release fixtures. Reuse the existing `src/install/open-dough-release.sh resolve-url` selection of the highest numeric tag and its pinned commit; it already handles annotated tags and version ordering. Do not use its client-installation/apply path to deploy the dashboard: that path validates and writes a guidance payload for another purpose. The watcher owns the dashboard-specific fetch, versioned local release directory, dependency installation, build, and server lifecycle. Verify the fetched commit matches the resolved one and the tagged `VERSION`; no branch fallback or older-tag fallback. Keep the watcher in the development checkout while the preview server and both Vite server plugins run from the tagged source, so source edits cannot alter production's browser or server code.

Reuse `npm run build:dashboard`, `npm run preview:dashboard`, and `dashboard/vite.config.mts` for the tagged app. Preserve the same loopback-only authenticated-read and agent-launch boundaries in dev and preview; do not copy those boundaries into the watcher or expose credentials to the browser. The existing `dashboard/tests/support/dashboardServer.ts` runs real dev and built-preview servers with isolated ports and a synthetic GitHub; `dashboard/tests/support/startOrigin.ts` and `tests/helpers/release-fixture.bash` show isolated bare-origin/tag fixture patterns. Extend those patterns for the watcher journey rather than relying only on mocked timers or a prebuilt page. The test-only process-group helper informs lifecycle proof; production process ownership belongs to the watcher.

[ADR 0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) defines numeric release tags, immutable identity, highest-version selection, and no untagged fallback. [ADR 0000 — ADR scope](../../../docs/adrs/0000-use-adrs-accepted.md) keeps this feature-local lifecycle design in the plan and maintained dashboard docs. The [North Star's local dashboard boundary](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation) keeps authentication and launch operations on loopback in both modes. Proposed ADR 0008 adds no binding constraint. No Accepted-ADR conflict or new North Star topic was found.

## Observed premises and proof boundaries

Observed on 2026-10-02 in this preparation worktree, based at `249ac294` plus the uncommitted seed draft. The fetched `origin/main` advanced during preparation, but `git diff --name-only HEAD..origin/main` showed no changes to `package.json`, `dashboard/vite.config.mts`, the preview harness, or the release resolver; execution rechecks that before editing.

| Premise consumed by | Observation and result |
| --- | --- |
| Tag selection and startup use the existing release identity rule. | `bash src/install/open-dough-release.sh resolve-url .` returned `v0.3.54` and commit `a8113b60…`; `git show v0.3.54:VERSION` returned `0.3.54`. The tag contains `dashboard/`, its Vite configuration, and build/preview scripts. This proves source presence and selection, not that an isolated tagged checkout builds and serves; slice 1 begins with that stop/go probe. |
| Production can use the existing built-preview host while development stays live. | `package.json` has separate dev/build/preview scripts. `dashboard/vite.config.mts` binds dev to loopback port 43127, preview to loopback, and mounts the same authenticated-read and launch plugins in both. `dashboard/tests/support/dashboardServer.ts` runs real dev or built-preview Vite processes with separate output/ports; `dashboard/tests/authenticated-project-overview.spec.ts` exercises both. The production entrypoint, tagged code isolation, and concurrent live-edit behavior remain slice 2 proof. |
| Local launch/session history can remain shared. | `dashboard/server/launchRecordDocument.ts`, `startStore.ts`, and `launchAttemptStore.ts` locate records under `~/.open-dough/dashboard/` through the machine home, independent of the checkout. Both modes use the same server plugins. Slice 3 checks continuity through a release switch, rather than assuming a process restart proves it. |
| A watcher must own background failure and cleanup. | `dashboard/tests/support/processGroup.ts` and `dashboardServer.ts` explicitly track child exit and end spawned process groups for tests. No product watcher exists (`rg` of package scripts and dashboard server); slices 2–4 add the product owner and observe its failure reporting, retries, and shutdown. |

The slice 1 probe uses a disposable source fixture made from the current working tree, a local bare origin, and a release directory, not the real production URL or real project records. Pin a representative numeric tag, install from its lockfile, build its dashboard, start its preview on a temporary loopback port, and observe an HTTP response plus a same-origin boundary response. The fixture can commit a small browser-visible marker between two tags while retaining the real dashboard and package scripts; run the watcher npm command from its development checkout with a temporary HOME. If the tagged tree cannot run under this machine's supported Node/npm setup, stop before slice 2 and revise the approach with the observed failure. The probe is required because reading a tag and existing tests do not establish tagged installation or preview startup.

## Outside-in proof ownership

| Story promise | Owning slice and observation |
| --- | --- |
| One command starts the watcher; highest tag starts production; no qualifying tag fails clearly; distinct local URL | Slice 2: invoke the real npm command against a local bare origin with numeric and ignored tags; visit the production URL and inspect its tagged marker, startup report, and no-tag answer. |
| Source edits affect development but not the running built production app | Slice 2: visit both URLs, change development source in the isolated fixture, see development update while production's marker and server process remain the tagged ones. |
| A newer qualifying tag deploys and restarts production | Slice 3: publish a second numeric tag to the fixture origin, observe the same production URL serve the new tagged marker and the old server exit; a lower or untagged change causes no switch. |
| Existing local launch/session records remain usable across environments and a release switch | Slice 3: use the same temporary machine home through dev and both production versions, and observe a record created before the switch remain readable after it. |
| Failed build/start leaves the last working release, reports the problem, and retries | Slice 4: inject one build failure and one start failure in the fixture, observe old production still answers, the watcher reports each failure, then a later check promotes the same new tag when the transient fault clears. Watcher shutdown ends its owned child and checks. |

Focused commands after the named specs exist: `npm run test:dashboard -- dashboard/tests/production-release-runner.spec.ts dashboard/tests/authenticated-project-overview.spec.ts --workers=1` for slice 1; `npm run test:dashboard -- dashboard/tests/production-watcher.spec.ts dashboard/tests/authenticated-project-overview.spec.ts --workers=1` for slices 2–4; `npm run typecheck:dashboard` after each implementation slice. Run `bash tests/install-latest-release.sh` if shared release-resolution code changes. These are focused local proof, not an automatic requirement to run every dashboard spec.

## Ordered slices

### 1. Pinned release runner is proven before startup wiring
Type: Structure
Status: planned
Proof: Run the disposable tagged-checkout/install/build/preview probe above before product edits that depend on it. Add focused release-runner tests for numeric tag versus prerelease/branch selection, pinned-commit verification, version mismatch, and no-tag error using a local bare origin. Keep `dashboard/tests/authenticated-project-overview.spec.ts` green as the external dev/preview boundary. Keep `tests/install-latest-release.sh` green if the shared resolver changes. Run `npm run typecheck:dashboard` after the runner is added.

Structure: Add the narrow dashboard release staging and preview-runner responsibility used immediately by slice 2. Reuse the existing resolver's tag choice; keep package installation and build in an isolated, versioned directory outside the development checkout and outside shared launch/session JSON files. No developer-visible command changes yet, and existing dev/preview behavior stays green. If the probe fails, stop and replan before wiring the watcher.

Safe stop: existing dashboard commands still run as before; no incomplete watcher is advertised.

### 2. One watcher command serves the current release beside development
Type: Behavior
Status: planned
Proof: Add a focused end-to-end watcher journey (for example `dashboard/tests/production-watcher.spec.ts`) with a disposable origin and HOME. Run the new spec plus `dashboard/tests/authenticated-project-overview.spec.ts` for real dev/preview behavior and `npm run typecheck:dashboard`. It must observe the npm command, highest numeric tag, pinned built browser assets and local boundaries, distinct URLs, a clear no-tag failure, and a source edit changing development without changing or restarting production. Test watcher termination ends its preview child.

Behavior: Given a published numeric tag and a development checkout → the developer runs `npm run watch:dashboard` and may also run dev → production serves the tagged bundle at its loopback URL and development serves current source at its own URL. With no numeric tag, the command reports why production cannot start. Keep the preview port strict so an occupied intended URL is an error, not a silent move.

Safe stop: production is usable from the selected tag; release changes still require restarting the watcher manually until slice 3.

### 3. A newly published release replaces the running production build
Type: Behavior
Status: planned
Proof: Extend the watcher journey: while version A is served, publish B on the fixture origin; the next check builds B from its pinned commit, the same production URL serves B, A's server ends, and a lower or branch-only change does nothing. Confirm a temporary launch/session record created before the switch is still read by the new process from the same HOME. Check the boundary's authenticated read and one launch-admission refusal after switching, so serving tagged assets alone is insufficient proof. Run focused spec and `npm run typecheck:dashboard`.

Behavior: Given a healthy production release → a higher numeric tag is published on origin → the watcher checks, prepares its tagged bundle, and restarts production on that release. The watcher never builds branch edits into production. Its own continued execution and cleanup remain observable after the switch.

Safe stop: normal release updates work; a failed candidate still needs slice 4's full recovery behavior.

### 4. A failed candidate leaves production working and is retried
Type: Behavior
Status: planned
Proof: Extend the same fixture journey with build and start failures. Observe the previous release still responds at its URL, the watcher reports the failed tag and reason, no partial candidate is served, and a later check retries and switches after the transient fault clears. A failed check of origin likewise leaves the current server alive. Verify watcher shutdown ends the owned server and timer. Run the focused watcher spec, `tests/install-latest-release.sh` if release-resolution code changed, `npm run typecheck:dashboard`, and the affected real dev/preview boundary specs; run the full dashboard suite only if shared Vite/server fixture or boundary setup changes affect its distributed consumers. Update `dashboard/COMMANDS.md` and `dashboard/README.md` with startup, URLs, release rule, recovery, and shared-record behavior.

Behavior: Given a working production release → a new tag cannot build or start → the watcher reports the failure, keeps or restores the prior working server, and retries on a later check; once the cause clears, the same tag becomes production. Stopping the watcher stops only its owned processes.

Safe stop: all story examples are delivered; failed releases do not displace the last working release.

## Current decisions

- One product watcher owns tag checks, tagged preparation, production server lifecycle, failure reporting, retry, and cleanup. The developer checkout supplies the watcher and resolver, while each production process runs its tagged app; this is one release model, not separate rules for startup and updates.
- The watcher polls release tags only. Editing development source does not rebuild or reload the running watcher or production process.
- Compare release versions numerically using the existing resolver. A tag's source commit is pinned before install/build; a malformed or invalid highest tag is reported, not replaced by a lower tag or branch code.
- Keep the existing local records and hardcoded project catalog shared for this story. Release directories hold code/assets only and never become a second project-state authority.
- Slices 2–4 are one lifecycle model exercised at initial startup, successful replacement, and failure/retry. The first slice contains the only early feasibility probe; it stops dependent work if the tagged app cannot be built and served.

## Learnings

None yet. Record only observations that change the approach or remaining slices.
