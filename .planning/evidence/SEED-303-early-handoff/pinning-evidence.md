# Slice 2 — bounded pinning preparation experiment

Base: `0ee3e439e9f6854948970cfac7fc4f448cb87cf4`, same owned checkout,
branch, installed dependencies and native setup as [execution context](execution-context.md).
The coordinator owns status, source commitments, obligations and delivery.
The [failure policy](../../../AGENTS.md#failing-and-flaky-tests) remains binding.

## Basis stated before edits

Seek a 2–4-second whole-command saving by publishing only the actual app and
runtime source needed for this isolated pin. Keep at least two seconds to
justify the new fixture input and source-list maintenance. Risk: omitted
production inputs could make the deployment cease to represent the real app.
Keep the current package, compiler/build/preview scripts and all original
assertions. Measure cold source preparation inside the ordinary command.

PFE inspected the canonical immutable-source solution in committed SEED-287
`7fa259a4b8d8b6c8f743cf70688c192b86f7fa89`: publishedMainSource.ts,
publishedMainFixture.ts, globalSetup.ts and publication-fixture proof.
Its first demand copies/indexes/commits the same source, then adds a private
clone. This cannot remove the isolated pin's initial ingestion, so it was
ruled out for this experiment without importing it. Its multi-fixture gain
remains a distinct family candidate; no two-worker saving is credited here.
The existing native-admission fixture supplies a Git-pathspec precedent,
but owns another repository lifecycle and is not a replacement fixture.

## Variant and preserved boundary

Two experimental changes: an optional source pathspec list on the existing
publishedMainFixture; the pinning call supplies these current-source roots:

```text
dashboard/src dashboard/server dashboard/public dashboard/index.html
dashboard/vite.config.mts dashboard/tsconfig*.json src scripts assets
package.json package-lock.json .gitignore .githooks VERSION
```

This selects 1,802 files / 10,274,037 bytes after the existing avatar exclusion,
versus approximately 5,838 files / 36.9 MB in the live full-source fixture
(the later diagnostic scratch spec accounts for one additional full-source
path in the retained listing). All dashboard/server/src code, shared `src`
runtime and installer code, actual root package/lock, scripts, TS settings,
all assets including notifier and favicon exports, and Git ignore/hook inputs
remain current bytes. Vite's actual config imports the real local boundary
list, shared backlog/session/request scripts and brand plugin. No code or
package script was rewritten. Tests, planning records, prose and installed
guidance payload are omitted from this one publication; unknown-source read
refusal does not invoke any workflow from those payloads. Other fixture calls
retain their full source. Empty pathspec output was byte-identical to the
prior Git commands for both deleted and cached/other path listings.

No case/assertion was removed. No mock, stub, sleep, retry, skip, changed
deadline, runner mode, source clock, auth, routing or process owner was added.
The existing case-local 90-second allowance remains SEED-287-owned.
No new domain data was introduced; the existing publication harness owns
source preparation. Exact marker actions and independent expectations remain
in the test. No manual exploratory test was run.

## Focused proof and measurements

Private artifacts: `/tmp/seed303-pinning-kky42e`. Each run used a new strict
proof record, ordinary quiet reporter, one worker and fresh run artifact owner.
Downloads, OS and Playwright transform caches stayed ordinary; no cache was
cleared or prebuilt artifact/dependency copied into a fixture. Source, Git,
npm ci, build, preview, assertions and cleanup are all inside elapsed time.

Actual command shape; the executed names are before2, before3, before4,
after1, after2 and after3, with precisely these filename substitutions:

```sh
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed303-pinning-kky42e/before2.json GIT_TRACE2_EVENT=/tmp/seed303-pinning-kky42e/before2-git.json /usr/bin/time -p caffeinate -s -i npm run --silent test:dashboard -- dashboard/backend-tests/runtime/production-deployment.spec.ts --workers=1 --grep 'deployment installs, builds, and serves its pinned commit in isolation after main advances, with the real preview boundaries' > /tmp/seed303-pinning-kky42e/before2.log 2>&1
```

Every listed run completed, exit 0, strict passed, selected/passed 1/1,
retry/repetition index 0 and no skips. No timeout or observation wait changed.

| Run | Whole elapsed | Case | Source preparation | Stage Git | Install + build interval | Preview/assertions/cleanup | Outside case |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| before2 | 9.600 | 8.522 | 2.529 | 0.749 | 2.613 | 2.160 | 1.078 |
| before3 | 9.050 | 7.996 | 2.105 | 0.717 | 2.439 | 2.292 | 1.054 |
| before4 | 9.370 | 8.248 | 2.336 | 0.775 | 2.456 | 2.184 | 1.122 |
| after1 | 6.900 | 5.765 | 0.725 | 0.243 | 2.481 | 2.016 | 1.135 |
| after2 | 7.450 | 6.317 | 0.879 | 0.284 | 2.800 | 2.000 | 1.133 |
| after3 | 9.610 | 7.733 | 1.987 | 0.323 | 3.027 | 2.050 | 1.877 |

Seconds; phases are observations, not irreducible lower bounds. Source is
attempt start through the initial Fixture source commit. Stage Git is fetch
start through the post-checkout verification. Install/build is bounded by
that verification and the test's next verification after stage returns; it
also includes cartoon copy and tiny call/assertion overhead. Git's supported
TRACE2 file supplies these boundaries without changed runtime code. Install
and build are not separately attributed. Publication/local-cartoon/pre-fetch
work remains included (before 0.445–0.497, after 0.301–0.354 seconds).

Before each run: awake AC, caffeinate -s -i, 16 logical CPUs / 48 GiB.
Host sidecars retain power, load, memory and top processes. Before-series
one-minute loads were 6.42/3.01/3.15 and memory free 49/51/52%; after-series
3.16/2.77/3.96 and 51/56/66%. Before2 had concurrent PyGardon test activity
and is exploratory timing. The VM grew from about 100% CPU in before3/4 and
after1 to 173–211% around after2/3; after3's source and outside-case intervals
grew materially. No artificial pressure was started. This is not a frozen
matched host cohort, and the full ranges are retained rather than discarding
after3. Three consecutive candidate focused passes establish functional
stability, not a stable timing guarantee.

Initial raw medians: 9.370 → 7.450 seconds, a 1.920-second / 20.5% descriptive
reduction. It falls below the predeclared two-second keep threshold and does
not establish the requested matched 2–4-second gain. The unchanged install,
build and preview intervals show that work was retained, not moved outside
the command. This result prompted the bounded comparison below; none of
these six runs is discarded or pooled with that comparison.

## Authorized contemporaneous A/B/B/A comparison

The coordinator authorized exactly four further normal one-case commands to
resolve changed VM conditions. Before launch, the hypothesis and unchanged
two-second criterion were restated: full source A around selected source B
would bound time drift while both included all preparation. Readiness: awake AC,
load 3.08, memory free 62%, VM about two cores, no other heavy test visible.
Only the test's source-selection edit changed between A/B; the helper and
all production inputs stayed fixed. B was restored byte-identically after
A2. No further timing was run and no functional gate was repeated.

The focused command above ran in order with artifact names abba-a1,
abba-b1, abba-b2, abba-a2. Every command: exit 0, strict passed, selected and
passed 1/1, no retries/skips. The ordinary normal reporter stayed unchanged.

| Run | Whole | Case | Source | Publication/pre-fetch | Stage Git | Install/build | Preview/assertions/cleanup | Outside case |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| A1 full | 11.410 | 10.035 | 2.511 | 0.437 | 0.722 | 4.137 | 2.228 | 1.375 |
| B1 selected | 6.710 | 5.613 | 0.804 | 0.299 | 0.251 | 2.499 | 1.761 | 1.097 |
| B2 selected | 6.720 | 5.683 | 0.746 | 0.414 | 0.248 | 2.340 | 1.936 | 1.037 |
| A2 full | 12.350 | 11.265 | 2.295 | 0.418 | 0.881 | 5.599 | 2.072 | 1.085 |

| Run | Load before → after | Memory free before → after | VM CPU before → after |
| --- | --- | --- | --- |
| A1 | 4.61 → 3.80 | 63% → 60% | 130.0% → 65.8% |
| B1 | 3.81 → 3.27 | 61% → 61% | 71.6% → 11.0% |
| B2 | 3.00 → 3.12 | 61% → 61% | 17.5% → 11.6% |
| A2 | 2.94 → 3.48 | 61% → 58% | 11.1% → 24.9% |

All on AC, with ordinary production-preview/Codex activity and no competing
heavy test observed. Host slack stayed credible on 16 CPUs; VM CPU declined
rather than repeating the earlier memory-growth event. Exact constant load
is not claimed. Both bracketing A commands were slower than both B commands,
including the final A under the lower VM CPU conditions.

A median 11.880 → B median 6.715 seconds; observed whole saving 5.165 seconds
(43.5%). Even minimum A minus maximum B is 4.690 seconds. Preparation through
stage Git verification improved from 3.670/3.594 to 1.354/1.408 seconds, or
2.186–2.316 seconds in the adjacent pairs. The larger whole saving includes
variable install/build time; do not attribute all 5.165 seconds solely to
source selection or extrapolate it to the whole suite. Keep the source
selection: the comparable set and the preparation observations satisfy the
unchanged two-second threshold, with its modest source-list maintenance.

An earlier before1 selected zero cases because ^...$ anchored the test title
against Playwright's composed file/title string. Its strict record is failed
with selectedCount 0; it is unexecuted setup evidence, excluded from timing.
Removing anchors while keeping the entire literal current title fixed
selected the intended single case.

## Discriminating control and neighboring proof

Scratch file seed303-pinning-negative-control.spec.ts retained the pinned
checkout/build assertions, then deliberately staged current newer main with
the real stageDeployment and passed that checkout to real preview. It failed
exactly at `expect(await page.text()).toContain("PINNED DASHBOARD COMMIT")`;
the 200 response contained `<title>LATER MAIN</title>`. Selected 1, failed 1,
exit 1, 11.21 seconds as intended. This proves the surviving HTTP assertion
detects wrong-newer content independently of the earlier Git/build checks.
The scratch spec was removed immediately; its copy, JSON, log and trace are
private artifacts. Both staged checkouts and preview were cleaned in finally.

```sh
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed303-pinning-kky42e/negative.json /usr/bin/time -p caffeinate -s -i npm run --silent test:dashboard -- dashboard/backend-tests/runtime/seed303-pinning-negative-control.spec.ts --workers=1 --grep 'deployment installs, builds, and serves its pinned commit in isolation after main advances, with the real preview boundaries' > /tmp/seed303-pinning-kky42e/negative.log 2>&1
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed303-pinning-kky42e/siblings.json /usr/bin/time -p caffeinate -s -i npm run --silent test:dashboard -- dashboard/backend-tests/runtime/production-deployment.spec.ts dashboard/backend-tests/runtime/production-publication-fixture.spec.ts dashboard/backend-tests/runtime/production-watcher-refusals.spec.ts --workers=1 > /tmp/seed303-pinning-kky42e/siblings.log 2>&1
npm run --silent typecheck:dashboard
```

Siblings: exit 0, strict passed 6/6, no retries/skips, elapsed 14.92 seconds.
Selection/refusal, exact-commit verification, full pinned distribution,
cancellation child/directory cleanup, exact requested-path publication and
watcher refusal all passed. Candidate pin body in this family was 6.000s.
Typecheck and git diff --check passed. No formatter or hook lint was run by
the implementer. The candidate files are 241 and 183 lines.

| Original promise | Actual unchanged observation |
| --- | --- |
| SC-36: selected revision after main advances | selected SHA → later published main → real stage; checkout HEAD, dist positive/negative marker, HTTP 200 pinned marker |
| Separate actual staged source and normal build | directory name/relative isolation; normal production fetch, npm ci and npm run build:dashboard; real Vite preview loopback hostname |
| Local cartoons and private inputs | untracked source; exact served WebP bytes/type; only cartoon/stanly.webp in dist, excluding notes/raw photo |
| Supplied icon distribution | all four declared icon responses match canonical asset bytes/type |
| Own-origin read boundary | own-origin unknown source 404 with explanation; missing/foreign Origin 403 |
| Preview shutdown | PID ended; URL unavailable; exactly process-started/process-ended incident entries |

[Consumer dispositions](pinning-consumers.md) cover every result from the
whole-checkout trace at base 0ee3e439. No published guidance source or
installed payload was edited. Candidate test/helper SHA256 values are
5229c08d4a6dd5338640a2f50f31d0b5ecf526a0eb3e6bdb3d9525de64491935 /
931f05d0d195275732b2c7472a06e09ce17825434ba4f06a675326ac2545eec7.

## Checkpoint

Smallest observed genuine candidate run: 6.710 seconds whole / 5.613 case;
normal install/build interval 2.499 seconds there. The smallest observed
install/build interval across both variants is 2.340 seconds. These are
observed costs, not proof that further improvement is impossible.

The illustrative eight-second combined watcher-plus-pin allocation remains
unsupported: the best pin case alone consumes 5.613 seconds, leaving 2.387
for every watcher distinction. Keeping repeated full staging is inconsistent
with the observed individual install/build intervals. Source sharing can
remove repeated preparation, but does not remove new revision installs/builds.
Slice 3 needs fewer genuine lifecycles with verified surviving lower-boundary
proof, or an evidenced supported reuse across the complete family including
cold preparation. No multi-fixture improvement is credited in this slice.

The accepted combined baseline remains 287.150 seconds median, 257.150 above
the goal. Crediting only the directly observed approximately 2.2 seconds of
preparation saving leaves about 255 seconds; that is a strategy estimate,
not a measured replacement run. No full 45-case speedup or check-count
reduction is claimed. No second implementation experiment was started.
The two code files and these evidence records return uncommitted for the
coordinator's independent refactor and delivery. No status or obligation was
changed by the implementer; broader strategy and the exact genuine minimum
remain open.
