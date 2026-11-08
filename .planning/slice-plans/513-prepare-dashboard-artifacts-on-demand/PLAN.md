# Prepare dashboard test artifacts only when selected tests need them

**Identity:** SEED-262#prepare-artifacts-on-demand

**Source:** [Selected story](../../seeds/SEED-262-faster-dashboard-test-feedback.md#prepare-artifacts-on-demand)

**Source review:** [Source-only review](source-review.md)

## Execution context

- Story Branch Mode, publisher `dashboard-territory.local-open-dough`,
  agent `dbs-chan`, in the established isolated worktree
  `/Users/terryyin/git/open-dough/.worktrees/prepare-dashboard-test-artifacts-only-when-selec`.
- Base before claim `cdb5f2d6769b5d86e479105f48038b57df729ccd`. Accepted claim
  `7835e7c9f71ceb26fee23c280ce2c4351321b201` on `origin/main`, also the
  initial published base and candidate of
  `origin/codex/prepare-dashboard-test-artifacts-only-when-selec`. The local
  integration checkout is `/Users/terryyin/git/open-dough`.
- Story-branch CI uses GitHub Actions `ci.yml` (CI), Codex coordinator
  `dbs-chan-62beacc7`, observer directory `/tmp/dough-ci-501/watch-NqFOwg`,
  PID `98038`, shell session `87596`, cell `g71:8`. Claim CI is unobserved
  by this story-branch observer.
- No replanning override was supplied. Use the existing planning authority
  for refinement within scope. No numeric project slice budget is recorded.

## Goal and scope

Focused selections skip the run-wide preparation they never consume, with
the same test command, case verdicts, and proof boundaries. Cover the
production app build, existing server bundle, and packed installed-start
origin for each requested installation layout. Required outputs come from
the current checkout, are shared within the run, and are removed when it
ends. Preserve independent mutable repositories and run isolation.

Faster producers, a finer server bundle split, persistence across runs,
MakeMe repository descriptions, and per-case fixture performance have
separate scope. Keep the current fake GitHub owner check, process sweep,
admission, and actual dev, preview, and boundary behaviors.

## Current decisions

- Let the consuming operation request a key from the existing run owner at
  first use. The owner starts one asynchronous preparation per demanded key,
  shares its completion or error, and settles in-flight work before
  removing its own paths. A worker leaving does not cancel a peer's demand.
  Use one contract as the slices move the three producers. Keep it within
  dashboard test support.
- PFE: change the existing [global setup](../../../dashboard/tests/support/globalSetup.ts)
  lifecycle and reuse the app build command, [server bundle](../../../dashboard/tests/support/serverBundle.ts),
  and [packed origin producer](../../../dashboard/tests/support/startOriginPreparation.ts).
  [Playwright fixtures](../../../dashboard/tests/support/pageTest.ts) already
  follow use, but their worker scope cannot share a producer across workers.
  [Inner runs](../../../dashboard/tests/support/innerPlaywright.ts) use both
  deliberately inherited support and explicit new global setup. Preserve
  that distinction and the current explicit private-build and source paths.
- Preserve comparable proof and measure command wall time under
  [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Keep isolated, deterministic proof under
  [ADR 0005, Cross-tool validation through native acceptance stories](../../../docs/adrs/0005-cross-tool-validation-accepted.md).
  Installed starts still publish and read real Git state in their private
  fixtures under [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state).
- The [origin migration](../512-migrate-dashboard-origin-fixtures/PLAN.md)
  touches the same preparation path. Recheck trunk and coordinate that
  seam before Slice 3. Keep the landed representation and its shared keys.
  If descriptions have landed, preserve their distinct data and apply
  demand to the run-shared layout and description keys. Otherwise use the
  current layout keys. This story can deliver without the migration.

## Decisive premises

Observed on 2026-11-08 in the owned preparation checkout at
`f1bc433825a6173edbd5e1a3529c533c4cd3d988`, Node 24.21.0 and Playwright
1.63.0 on AC-powered macOS. All scratch edits were restored.

| Consuming operation | Observation and result | Limit |
| --- | --- | --- |
| Dashboard runner selects an in-process, built-frontend, mixed, or installed-start case without unrelated artifacts | Ran the production Playwright config with `caffeinate -s -i npm run --silent test:dashboard -- --project=chromium --workers=2 --reporter=line <selection>`. In a scratch change, logged actual producer completions and suppressed only the listed unused calls in global setup. The selection and results are below. All created artifact paths were gone at exit. | An omission trial proves these case routes and identifies unused work. It still produces needed artifacts before the cases run. |
| Two built-frontend workers acquire the real app build on demand | Ran that same command with `'(session-working-count-rule\|startup-host-words)[.]spec[.]ts$'`, using a scratch loopback request from the static frontend fixture and one asynchronous `npm run build:dashboard -- --outDir <run-directory>` in the runner. Observed acquire, build, acquire, ready, then cleanup. Both browser cases and all three in-process cases passed in 3.46 s wall time. | This proves the real build's first-use route under the default case timeout. It does not prove delivered cancellation or mixed-run performance. |
| Case selection and lifecycle while preparation is active | Ran `node observe.mjs` in an isolated temporary Playwright 1.63.0 configuration. List-only imported the spec without starting setup. A grep-selected plain case imported the same file and made no request. In a parallel selection both workers reached one held producer and received one result. With a held failure, both saw the cause and exit was 1. SIGINT after the producer's observable held event gave exit 130 and cancelled it at teardown. Each run removed its private path. | This used a synthetic producer to settle runner behavior. Slice 1 proves termination and cleanup with the real build subprocess. |
| Existing bundled boundary and integrated attention assertions run unchanged | Ran the production config with the same flags and `'(agent-launch-attention\|boundary-server)[.]spec[.]ts$'`. Four passed in 13.03 s wall time. The boundary case observes the actual bundled Node and Cursor commands, and the attention cases observe the integrated story-card behavior. | Keep the real bundle and preview paths when moving their preparation. |
| DOM-only, source-dev, and late boundary consumers use different artifacts | With the same scratch omission and flags, the exact path `'dashboard/frontend-tests/observation-measurements[.]spec[.]ts$'` passed four cases with no producers. `'dashboard/tests/navigation/frame-board-look[.]spec[.]ts$' --grep '^.*no projects configured'` passed one with none, even though its source-dev call supplies a preview path. `'(boundary-server\|authenticated-read-incident-record-restart)[.]spec[.]ts$'` passed three with only the bundle. | The unqualified observation basename also selected an integrated preview, which failed when the bundle was omitted. The restart case also failed without the bundle at its later boundary start. These deliberate omissions distinguish the consumers that need the bundle. |

The common command above used these selection arguments. Eager and omission
figures are single exploratory shell-wall samples, in seconds.

| Selection | Passed in each run | Eager | Omission | Producers in omission |
| --- | ---: | ---: | ---: | --- |
| `'session-working-count-rule[.]spec[.]ts$'` | 3 | 8.54 | 1.05 | None |
| `'startup-host-words[.]spec[.]ts$'` | 2 | 6.26 | 3.33 | App |
| `'(session-working-count-rule\|startup-host-words\|serving-modes)[.]spec[.]ts$'` | 11 | 5.82 | 3.62 | App and bundle |
| `'start-origin-isolation[.]spec[.]ts$' --grep '^.*concurrent installed starts'` | 1 | 6.99 | 5.36 | Codex/Cursor layout |

The eager runs produced the app, bundle, and both layouts. Before changing
setup in execution, repeat the eager baseline on the actual execution base
using the default quiet reporter and the existing
[proof record](../../../dashboard/tests/proof-record.md). Compare matching
commands at the end under comparable load and worker counts. Capture
producer invocation and completion, case results, and shell wall time.
Repeat matching samples if variation could reverse the result. Show lower
focused wall time, include the attention spec in the mixed comparison, and
surface a reproducible material mixed-run regression before accepting the
tradeoff.

### Execution baseline

At the established claim revision `7835e7c9f`, ran the following selections
with `PATH=/opt/homebrew/bin:$PATH /usr/bin/time -p caffeinate -s -i npm run
--silent test:dashboard -- --project=chromium --workers=2` and the default
quiet reporter. Node 24.21.0 and Playwright 1.63.0 ran on AC power, with
one-minute load between 7.07 and 7.61 on 16 logical CPUs. The commands
ran sequentially. Other activity on the machine was not controlled.

| Selection | Strict pass | Wall seconds |
| --- | ---: | ---: |
| `session-working-count-rule[.]spec[.]ts$` | 3 | 6.26 |
| `startup-host-words[.]spec[.]ts$` | 2 | 5.12 |
| `(session-working-count-rule\|startup-host-words\|serving-modes\|agent-launch-attention)[.]spec[.]ts$` | 13 | 12.85 |
| `start-origin-isolation[.]spec[.]ts$` with `--grep '^.*concurrent installed starts'` | 1 | 6.77 |

Each run completed both installed layouts, the server bundle, and the app
in that order, then removed the recorded paths. Temporary producer tracing
was restored before implementation. The quiet proof records, producer start
and completion timestamps, and timing output are in
`/tmp/dough-513-baseline.Eo5I2u` on the execution machine.

## Proof ownership and local gate

| Story example | Slice | Outside-in observation |
| --- | --- | --- |
| 1 and 2 | 1–3 | Run the in-process and built-frontend selections separately. After Slice 3 the former invokes no producer and the latter invokes the app producer once. A DOM-only frontend selection also invokes none. |
| 3 | 2 and 3 | A boundary-only run uses the bundled Node and Cursor entries with no app. The mixed and attention selections share the app and bundle and skip installed origins. An import or a source-dev start triggers neither app nor bundle. |
| 4 | 3 | The installed-start grep selection invokes one Codex/Cursor layout, retains current private-copy and real-start checks, and invokes no other producer. Run the whole isolation spec to preserve Claude and explicit fallback, freshness, and failure paths. |
| 5 | 1–3 | Observe parallel consumers receiving one completed output, producer failure before any path is served, cleanup after success, failure and graceful interruption, and isolation from concurrent runs and `dashboard/dist`. Exercise producer-specific cleanup where it differs. |

Run the focused checks below with `npm run test:dashboard -- <selection>`.
Before landing, run `npm run typecheck:dashboard`, the whole dashboard suite
because global setup and the fixture entry points reach distributed consumers,
and `npm test -- tests/dashboard-concurrent-runs.sh`. On a fully awake macOS
machine on AC power run the suites with `caffeinate -s -i` and Homebrew Bash
on PATH. On battery follow the alternate procedure in
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Apply the [test automation rules](../../../AGENTS.md#test-automation) and
[failing and flaky tests policy](../../../AGENTS.md#failing-and-flaky-tests)
as written to each slice, delegation, and repair handoff. The deterministic
routes use synthetic hosts and GitHub. They require no paid native run.

## Slices

### 1. Selected page tests share one production app build

Type: Behavior

Status: done

Proof: Run the in-process, built-frontend, DOM-only frontend, and attention
selections through the normal configuration. Observe zero app builds without
an app consumer and one completed current-checkout build shared by parallel
frontend and preview consumers. Use the existing nested Playwright proof
pattern to hold a producer at an observed event, exercise failure and
graceful interruption, and verify the real build child and partial path
are gone. Check `compile-cache.spec.ts` and `run-processes.spec.ts` at their
actual nested-run boundaries. Update the concurrent-run shell check to select
cases that really build and serve the app, preserving its checks for separate
paths, quiet success, cleanup and an untouched `dashboard/dist`.

Behavior: The static frontend and preview consumers that use the run's app
request it when needed. Keep previews that explicitly build their own app
private. Build asynchronously so the runner can process cancellation and
timeouts. Trace explicit `prebuilt` callers to their actual mode before
moving the default. Server and installed-origin preparation stay eager
until Slices 2 and 3.

Accepted evidence: With `PATH=/opt/homebrew/bin:$PATH caffeinate -s -i npm run
--silent test:dashboard -- --project=chromium --workers=2`, the in-process
session count (3 cases), exact DOM-only frontend observation measurements
(4 cases), and source-dev frame-board case (grep `no projects configured`)
passed without an app request. The host-status case (grep `CPU usage averages
the trailing minute`) passed in process after importing the preview-capable
helper without requesting an app. The built frontend (2 cases) and baseline
mixed selection (13 cases) each completed one app build. Records and traces
are under `/tmp/dough-513-slice1.hqbdX4` and
`/tmp/dough-513-inprocess-import.HuCdjr`.

The same command selected
`(dashboard-artifact-demand|compile-cache|run-processes)[.]spec[.]ts$`
(8 passing). In `dashboard-artifact-demand.spec.ts`, two consumers request the
build before the held Vite subprocess can finish. The success and failure
cases assert the same completed directory or error in both workers. The
SIGINT case observes interruption, no completion, the Vite PID gone, and
removal of the partial directory. The existing compile-cache and orphan sweep
cases retain their nested setup and no-setup behavior.

`PATH=/opt/homebrew/bin:$PATH caffeinate -s -i npm test -- tests/dashboard-concurrent-runs.sh`
observed distinct completed app paths, quiet successful built-app journeys,
and removal without touching `dashboard/dist`. The consumer trace at
`/tmp/dough-513-slice1-consumers-focused.md` identifies the migrated preview
callers. Serving modes, nested preview, and integrated attention exercise
their common resolver. A separate smoke served both a private preview and
explicit path overrides. The whole suite remains the pre-landing gate.

The independent refactor kept the caller contract and reran the nested lifecycle,
serving modes, frontend, and concurrent shell checks. All 16 selected
Playwright cases and the shell check passed. See
`/tmp/dough-513-refactor1.IVyC9c/proof.json` and the sibling consumer trace.

CI attempt [42441494702/1](https://github.com/terryyin/open-dough/actions/runs/42441494702)
found that the shell-test job has no browser. The concurrent check now uses
the existing HTTP icon case, whose real preview serves the generated assets.
The original selection failed with an empty `PLAYWRIGHT_BROWSERS_PATH` and
the repaired shell check passed with the same empty path, preserving the
quiet verdict, two distinct completed builds, and cleanup. This repair
reuses the prior refactor's concurrent-run and preview boundaries.

### 2. Selected server tests share one bundle only when required

Type: Behavior

Status: planned

Proof: Compare a boundary-only selection, `serving-modes.spec.ts`, the
built-frontend selection, and the integrated attention selection. Include
the source-dev frame-board case and the incident-record restart case whose
later boundary start first needs the bundle. Inspect real child commands and
preview replies. Include the direct Cursor runner and held-read consumers in
the consumer trace and focused check. Observe a single complete bundle for
simultaneous users and cleanup on producer error.

Behavior: Preview and boundary consumers acquire the existing bundle
before handing its entries to descendants. Source-dev and static frontend
consumers do not ask for it. Preserve source-relative paths, the real
bundled entries and the intentional no-owner source path for custom
configurations. Origin preparation stays eager until Slice 3.

### 3. Selected installed starts share only the origin layouts they use

Type: Behavior

Status: planned

Proof: Run `start-origin-isolation.spec.ts` both filtered and whole.
Observe the producer keys and verify real private copies, installed source
freshness, explicit fallback, and failure isolation. Select a run with
different layouts and observe that a failure or cleanup of one staging path
cannot remove the other's completed output. Repeat the four comparison
selections and integrated attention as specified above.

Behavior: The installed-start fixture requests its layout before copying
and uses the existing Git producer. Codex and Cursor share a layout.
Separate staging or serialized production keeps the packer's temporary
directory and error cleanup from colliding. Finish the fixture and
runner documentation for actual demand and retained proof boundaries.

## Preparation review

Plan refinement was not needed. The three slices use the same demand and
lifecycle rule and each changes a distinct set of producers and consumers
with its own runnable proof. No blocking preparation concern remains.
Timing and real producer cleanup are delivery observations owned above.
