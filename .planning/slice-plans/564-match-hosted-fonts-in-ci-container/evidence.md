# Execution context and accepted evidence

[Return to the slice plan](PLAN.md). Commands and scratch paths below are
relative to the owned execution checkout unless a different working directory
is stated.

## Execution resume context

- Established story-branch execution: `/Users/terryyin/git/open-dough/.worktrees/give-the-local-ci-container-the-hosted-runner-s`, branch `codex/give-the-local-ci-container-the-hosted-runner-s`; integration checkout `/Users/terryyin/git/open-dough`; remote `origin`, trunk `main`, publisher `dashboard-territory.local-open-dough`, agent YeongSheng-chan.
- Starting revision `6e04d687de1882d6ec0416011ada0d473bcb4f05`; accepted claim/candidate `c6467c3811f5f0e016e5867a3399b73991988c1a`. Claim CI: unobserved. Owned execution checkout verified clean at claim.
- Exact-checkout locked setup: `npm ci --no-audit --no-fund --loglevel=error` passed; focused Playwright list selected exactly one narrow/zoomed journey. Check-only `.githooks/pre-commit`; selective formatter `npm run format`. Existing planning authority retained for in-scope replanning. No numeric slice budget supplied.
- CI: GitHub Actions `terryyin/open-dough`, verified `ci.yml` (351271804), name CI, push-triggered. Codex observer coordinator `seed289-fonts`, directory `/tmp/dough-ci-501/watch-ACQAzk`, PID 80442, session 43357, yielded cell `g706:9`; target `codex/give-the-local-ci-container-the-hosted-runner-s`.
- Probe pre-launch decision (this macOS host): 16 CPUs, load 8.98/6.34/4.65, memory pressure reports 58% free, no active test suite found. Colima already running native aarch64, 8 CPUs/16 GB; Docker needs `DOCKER_HOST=unix:///Users/terryyin/.colima/default/docker.sock`. Battery 82%; use `caffeinate -i`, fully awake, inspect sleep log after long observations. Sequence image build and three-revision focused observations with one browser worker; proof owner slice-1 agent. Reconsider on contention, sleep, build/runtime failure or before full dashboard run.

## Slice 1 probe evidence (2026-11-10; accepted)

The bounded three-revision comparison succeeded on this machine's native
arm64 image. No maintained helper, application, or spec was changed by this
probe. Disposable snapshots and raw logs are below the owned execution
checkout's ignored `.worktrees/font-probe/`; the normal-font experiment's
removed Verdana block was restored after observation. The snapshots retain
only diagnostic `afterEach` instrumentation in their specs, with the original
assertions and app CSS intact.

- Hosted reference refresh: `gh run view 42725263249 --repo terryyin/open-dough --job 129529149706 --log`, filtered to image metadata, reports image `ubuntu-24.04` version `20261101.360.1`, release `ubuntu24/20261101.360`. This matches the preparation's source-attributed SBOM and actual DD-435 consuming image. No new hosted profile was substituted.
- Disposable image: `open-dough-ci:1651493924`, ID `sha256:21898d404c94b5ec22a87722a4edf5eb18e066cfd7c5b2957e60086492ada452`, architecture `arm64`. Its recipe is the maintained helper with only `fonts-dejavu fonts-dejavu-core fonts-dejavu-extra fonts-dejavu-mono fonts-lato fonts-liberation fonts-noto-color-emoji fonts-ubuntu-console` added to the first apt install. Pinned Node `v24.21.0`, Git `2.56.0`, Playwright `1.63.0`, Chromium/headless shell `153.0.8010.12` (`v1243`). All three source revisions have package-lock blob `569122451d32b34364b23a069cfaf206ede02e77`.
- Build command, from disposable current snapshot `.worktrees/font-probe/current`: `DOCKER_HOST=unix:///Users/terryyin/.colima/default/docker.sock caffeinate -i scripts/ci-container.sh tests/ci-container.sh > ../build.log 2>&1`. Terminal exit 0; image build and existing shell helper contract passed. Build log retains the generated Dockerfile's consumed RUN steps.
- Installed inventory: `DOCKER_HOST=unix:///Users/terryyin/.colima/default/docker.sock docker run --rm open-dough-ci:1651493924 dpkg-query -W 'fonts-*' 'xfonts-*' 'ttf-*'` retained at `.worktrees/font-probe/packages.log`. Every hosted package/version matches the SBOM: DejaVu four packages `2.37-8`; Lato `2.015-1`; Liberation `1:2.1.5-3`; Noto emoji `2.047-0ubuntu0.24.04.1`; Ubuntu console `0.869+git20240321-0ubuntu1`. Additional Playwright dependency fonts remain installed. `fc-list : family` and `fc-match` are retained in `font-inventory.log`; browser observations below, rather than those utilities, establish the effective dashboard fallback.
- Focused observation wrapper: `.worktrees/font-probe/run-focused.sh`; every log begins with its full expanded Docker invocation. It preserves helper run isolation: uid/gid `501:20`, `--rm --init`, host-path snapshot/common-Git mounts, per-snapshot `node_modules` volumes, shared npm-cache volume, container-local HOME, fresh locked `npm ci`, same image/browser and native architecture. Its literal in-image check is `CI=true npx playwright test --config dashboard/playwright.config.ts "$1" --grep "at 200% zoom" --workers=1 --reporter=list`; list reporter permits probe diagnostics without changing original assertions.

| Source and literal host command (execution checkout) | Observing boundary and result |
| --- | --- |
| `bash .worktrees/font-probe/run-focused.sh first dashboard/tests/intent-ci-proof.spec.ts > .worktrees/font-probe/first.log 2>&1`; detached source `0332f824ae60b9741732ba2c83e0db505645a805` | Exactly one Chromium test selected. Expected historical exit 1 at original `readsAt` no-overflow assertion, line 215, narrow 400% step: `sideways: 2`, box `294.40625px`, table `296.421875px`, viewport `320×256`; pane containment true and no page overflow. Computed stack `system-ui, sans-serif`; CDP `CSS.getPlatformFontsForNode` reports native `DejaVu Sans` (`DejaVuSans`, not custom). No font injection existed in this source. Matches DD-435's first fault and dimensions. |
| `bash .worktrees/font-probe/run-focused.sh second dashboard/tests/intent/intent-ci-proof.spec.ts > .worktrees/font-probe/second.log 2>&1`; detached source `d146a05d95f62810da79bf653e5f0f98fa58fefc` | Exactly one Chromium test selected. Expected historical exit 1 at original `readsAt` no-overflow assertion, line 216, narrow 400% step: `sideways: 26`, box `294.40625px`, table `319.75px`, viewport `320×256`; pane containment true and no page overflow. Computed normal stack and native CDP `DejaVu Sans` as above, with no Verdana injection. Matches DD-435's second sortable-header fault. |
| `bash .worktrees/font-probe/run-focused.sh current dashboard/tests/intent/intent-ci-proof.spec.ts > .worktrees/font-probe/current-verdanastack.log 2>&1`; source `c6467c3811f5f0e016e5867a3399b73991988c1a`, checked-in injection retained | Exit 0, exactly one test passed including both 200% and narrow 400% steps, whole-word and keyboard traversal assertions. Final viewport `320×256`: table and box `294.40625px`, sideways 0, pane containment true, no page overflow. Computed `Verdana, sans-serif` resolves to native `Liberation Sans` in this Linux image. The maintained native-macOS Verdana coverage remains unchanged. |
| `bash .worktrees/font-probe/run-focused.sh current dashboard/tests/intent/intent-ci-proof.spec.ts > .worktrees/font-probe/current-normal.log 2>&1`; same source/image with only the five-line Verdana injection removed in scratch | Exit 0, exactly one test passed, both original 200% and narrow 400% steps, words and keyboard assertions. Final viewport `320×256`: table and box `294.40625px`, sideways 0, pane containment true, no page overflow. Computed `system-ui, sans-serif`; CDP confirms native `DejaVu Sans`. Removed injection restored afterwards. |

The real historical specs supply their own pre-existing proof-summary setup;
the probe does not supply overflow or font selection through a fixture. CDP
and DOM measurements independently observe actual rendering. Historical
failures are deliberate fault replay, not a waiver of current-suite defects.
Current snapshot is the accepted trunk claim; its product state matches
starting trunk `6e04d687...`, with only the claim added. No current maintained
failure was observed.

Expensive-proof decision remained valid: sequential single-worker checks,
no full suite launched. At the end host load was `4.37/4.99/4.54`, memory
pressure reported 74% free. Every image/browser command used `caffeinate -i`;
`pmset -g log` showed no sleep/wake entry on 2026-11-10 during the observed
window (`.worktrees/font-probe/sleep-observations.log`, empty). All owned
command sessions reached terminal results. No extra watches were created.

Slice 1 leaves no unreproduced condition. Slice 2 still owes maintained recipe,
independent shell font regression and removal fault, cache/isolation contract,
documentation, final equivalent-image acceptance and the complete dashboard
journey. Reuse these focused observations only while the final package recipe,
locked browser/source conditions, and effective font environment remain
equivalent. This evidence does not claim pixel identity or broader platform
parity.

Slice 1 acceptance: coordinator inspected the actual historical `readsAt` assertion and setup, unchanged assertions in snapshot diffs, CDP platform-font query, Docker invocation wrapper, consumed recipe and package inventory, and all four terminal logs. Source commitments allocated to this probe are observed at the table above. No product implementation changed; delivery refactor disposition: `records-only`. Source freshness on pinned trunk `c6467c3811f5f0e016e5867a3399b73991988c1a` was unchanged; the named deadline sibling has not landed, so no incoming sibling behavior affects this probe.

## Slice 2 implementation and proof (2026-11-10; accepted)

Owned changes: `scripts/ci-container.sh`, `tests/ci-container.sh`,
`tests/ci-container.md`, and the necessary current-suite test-client repair in
`dashboard/tests/support/rawHttp.ts` and
`dashboard/backend-tests/sessions/session-alerts-origin.spec.ts`.
No app CSS, font override, helper invocation or production origin policy changed.

- Final generated recipe matches the slice-1 image byte for byte: the scratch helper differs only by the new maintained provenance comment outside the Dockerfile. Captured tag is still `open-dough-ci:1651493924`, live image ID `sha256:21898d404c94b5ec22a87722a4edf5eb18e066cfd7c5b2957e60086492ada452`, native arm64 and unchanged locked browser/Node. The historical/current font and overflow observations above remain applicable; no repeat was needed. `tests/ci-container.md` retains the identified SBOM, installed versions, actual DejaVu/Liberation observations, both historical revisions and refresh/replay procedure.
- `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/ci-container.sh` passed. The shell test observes Dockerfile content actually sent to `docker build`, extracts apt-consumed fonts independently from the identified SBOM literals, verifies cached reuse, and checks actual chown/run argv for host uid/gid, checkout/common-Git mounts, isolated npm volumes, container HOME and native architecture. The external Docker stand-in is harness data; no new domain fixture is arranged.
- Required-font mutation: temporarily remove only `fonts-lato` from the owned recipe, run the same maintained command, and restore in `finally`. Exit 1 names `tests/ci-container.sh`, diff `< fonts-lato`, and `generated image must install the hosted Ubuntu font inventory`; restored command exits 0. Logs: `.worktrees/font-probe/slice2-missing-font-runner.log` and `slice2-restored-font-runner.log`. Supplemental `bash -x tests/ci-container.sh` capture records the generated tag changing to `open-dough-ci:3877787137` on removal and returning to `1651493924` after restore; accepted test verdicts use the maintained runner. Unchanged cached invocation skips build and preserves identical run argv.
- Complete first helper command: `node scripts/local-test-suite.mjs repository "$PWD" "$PWD" env DOCKER_HOST=unix:///Users/terryyin/.colima/default/docker.sock caffeinate -i scripts/ci-container.sh --dashboard > .worktrees/font-probe/slice2-dashboard.log 2>&1`. Type-check passed; terminal exit 1 after 643.8 s selected 2,397 cases, with 2,388 passed, one failed, eight existing skips, zero flaky, eight workers. The only failure was the actual `::1` listener's raw client connecting to `127.0.0.1`.
- Diagnosed cause with a bounded Node HTTP/DNS probe in the same image: normal `dns.lookup('localhost', {all:true})` returned `::1` and `127.0.0.1`; ADDRCONFIG lookup returned IPv4 only. Default `http.get({hostname:'localhost', port, agent:false})` failed `ECONNREFUSED 127.0.0.1`; `{family:6}` reached the real `::1` server and returned 200. Usable IPv6 loopback was omitted by the client's environment assumption. No product admission/localhost policy was changed.
- Repair: `rawRequest` alone accepts optional socket family, and the real-listener test supplies `server.address().family` while keeping the computed localhost URL, real Host/Origin guard and original admitted response expectations. This preserves the same behavioral proof for actual IPv4/wildcard/IPv6 listeners. `npm run test:dashboard -- dashboard/backend-tests/sessions/session-alerts-origin.spec.ts --workers=1 > .worktrees/font-probe/slice2-origin-native.log 2>&1` passed natively.
- Image focused command: `DOCKER_HOST=unix:///Users/terryyin/.colima/default/docker.sock docker run --rm --init --user "$(id -u):$(id -g)" --workdir "$PWD" --env HOME=/tmp/home --env CI=true --volume "$PWD:$PWD" --volume "open-dough-ci-modules-1441373612:$PWD/node_modules" --volume /Users/terryyin/git/open-dough/.git:/Users/terryyin/git/open-dough/.git open-dough-ci:1651493924 bash -c 'set -euo pipefail; ls -a . /Users/terryyin/git/open-dough/.git > /dev/null; mkdir -p "$HOME"; npx playwright test --config dashboard/playwright.config.ts dashboard/backend-tests/sessions/session-alerts-origin.spec.ts --workers=1 --reporter=list' > .worktrees/font-probe/slice2-origin-focused.log 2>&1` passed all five selected cases: four actual listeners and invalid destinations.
- Final complete command: `node scripts/local-test-suite.mjs repository "$PWD" "$PWD" env DOCKER_HOST=unix:///Users/terryyin/.colima/default/docker.sock caffeinate -i scripts/ci-container.sh --dashboard > .worktrees/font-probe/slice2-dashboard-repaired.log 2>&1`. Terminal exit 0, type-check passed, 2,397 selected, 2,389 passed, zero failed/flaky, eight existing skips, eight workers, 650.4 s. JSON extracted from the actual HTML report is retained separately as `.worktrees/font-probe/slice2-dashboard-final-report.json`; first failed report is `slice2-dashboard-first-report.json`. Skips remain three macOS-branded notifier cases, four Linux-install-inapplicable node-pty helper cases, and one opt-in measurement. No failure was excused or retried unchanged.
- Consumer trace: installed `consumer-trace.mjs --checkout "$PWD" --base HEAD` with explicit `ci-container.sh`, `system-ui`, `font-family`, `fonts-dejavu`, `rawRequest`, `rawHttp` and exported/helper terms reaching their journeys. Complete searched terms and 529 per-file dispositions are at `.worktrees/font-probe/slice2-consumer-trace.md`. Dashboard consumers ran in the final complete suite; excluded matches are nonruntime records/prototypes, retained timing rows, source-model/history builders or unrelated request-owner/text fixtures. Shared CSS/actual narrow assertions and raw-client receiving journeys were inspected; no uncovered consumer remains.

Pre-launch choices were made on this actual macOS host. First run: load
4.96/4.70/4.50, 73% free memory, 77% battery; no active test suite, VM eight
CPUs/16 GB. Final repaired run: load 9.04/11.23/8.73 decaying after the first
run, 83% free memory, 64% battery, no active test container. The first run had
no timeout or resource failure. Keep native eight-worker VM concurrency,
sequence whole suites with maintained host admission, and use `caffeinate -i`
with lid confirmed open. Reconsider on failures/contention/sleep. Neither run
had sleep/wake entries during its window (`slice2-first-sleep.log` and
`slice2-final-sleep.log`, both empty). All owned commands reached terminal
results; no watches remain. Scratch snapshots, logs and volumes remain owned
for coordinator acceptance/refactoring and eventual cleanup. No statuses,
commits, formatting or hook-owned lint were performed by implementation.

Slice 2 acceptance: coordinator inspected generated-apt expectation and argv/cache assertions, final image/recipe correspondence, raw-client option and actual listener/guard, final report stats and five origin results, source-attributed documentation and trace dispositions. Full dashboard proof covers affected font and raw-client consumers. Accepted source promises, qualifications, examples and exclusions remain unchanged. Source freshness is unchanged at pinned trunk `734efcb8b2dfe27331cb2faf68c4e05bd1309ae1`; incoming release/update and unrelated preparation/claim records do not change these product boundaries. The named deadline sibling remains Taken with no incoming implementation. Latest published increment remains `741878a1f3dc3f7d47ae49b6810a1a807a9d97e7` on the story branch.

## Delivery acceptance

Independent refactor `/root/refactor` returned `## REFACTOR COMPLETE`: records-only extraction into this file, guarded repointing of all source-review observations and ADR-link typo correction. Coordinator inspected resulting links, obligation location and unchanged product/test diffs. No accepted behavior, setup or assertion changed; reuse all accepted probe, mutation, origin and complete dashboard proof. Refactor trace has all 450 located consumers disposed; only record references changed.

Fresh preparation initially stopped before commit at ShellCheck SC2312: the test harness combined uid/gid substitutions. Mechanical repair separates those two commands exactly as the helper does; the captured user value and asserted contract remain unchanged. `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/ci-container.sh` passed after repair. Already-traced disposition: this uid/gid harness concept is inside the accepted `/root/refactor` return and consumer trace; no new representation, dependency or product path. Browser proof is unaffected. Retry only failed formatting/preparation, with no older-HEAD publication.
