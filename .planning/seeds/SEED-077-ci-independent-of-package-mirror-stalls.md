---
id: SEED-077
status: active
planted: 2026-10-01
planted_during: Wrap-up of SEED-072#responsive-session-start-reconciliation, when Ubuntu package mirror stalls cancelled trunk CI
scope: story
---

# SEED-077: Keep CI independent of package mirror stalls

## Why This Matters

Every dashboard shard installs Playwright's system packages from the runner's
Ubuntu package mirror on each run. On 2026-10-01 that mirror stalled for hours:
shards spent 4–6 minutes in “Install Playwright Chromium” and hit the
6-minute job limit before any test ran, cancelling trunk and branch runs alike
(trunk runs for `285bd213`, `103ffacb` and `1e14e23f`; run 36884993415 needed
two reruns of its cancelled shards before every job passed). Developers and
agents then cannot tell a real failure from mirror weather, and executions
waste repair or rerun cycles.

## Story

<a id="ci-independent-of-package-mirror-stalls"></a>

### Keep CI checks independent of package mirror stalls

**Identity:** SEED-077#ci-independent-of-package-mirror-stalls
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/207-stable-native-check-prerequisites/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5692232dc05609fd5497416bbd123a3f384645a78f372411c3ba3f8631a75c4d","plan":"bb80bcccad98d3861a645b807c37e939e942e4dd0cda77d24c331d57ffe28cb5"}}
```

- **Goal:** Developers and agents get fast, repeatable feedback from CI and
  local checks. Routine verification reuses compatible prerequisites instead
  of repeatedly acquiring system packages; a slow Ubuntu mirror does not
  consume the time needed to judge the code. This reduces reruns and makes a
  local result useful when investigating a CI failure.
- **Scope:**
  - Cover prerequisite acquisition and reuse for the current checks in CI and
    their native local entry points. Do not introduce Docker/Colima as a test
    dependency or expand the existing container diagnosis helper. Each native
    environment must be stable and identifiable enough to debug; macOS and
    Ubuntu need not be identical.
    Separate cold setup from running checks so setup failures name the
    unavailable prerequisite and do not masquerade as test failures.
  - When compatible prerequisites are available, run checks without refreshing
    or downloading Ubuntu system packages. When prerequisites are unavailable,
    bound setup and report an infrastructure failure before the overall job
    limit; never claim a code verdict when checks did not run.
  - Reuse must be tied to the selected dependency/environment versions. A
    dependency change must select compatible prerequisites or clearly require
    fresh setup; it must not silently run a stale browser or stale app build.
    Native check guidance must identify selected tool versions and relevant
    platform differences. Repeatability means controlled inputs and
    equivalent check behavior, not identical elapsed times on different hosts.
  - Preserve every current check, the CI job limits (6 minutes for test and
    dashboard, 8 minutes for lint), the shell suite's 71-second per-check and
    470 total job-second budgets per split, and shard balance. Healthy CI wall
    time must be no worse than the current healthy baseline. Compare setup and
    check time separately so moving setup elsewhere does not hide its cost.
  - For local speed, require warm runs to avoid unnecessary environment
    preparation and cold setup to be bounded and clearly reported. No numeric
    local wall-time target has been supplied. Preserve chosen-check execution
    and current isolation/cleanup behavior.
  - Remove routine Ubuntu system-package installation from every dashboard
    shard, first verifying the existing runner libraries through the full
    browser suite. Install only the locked Chromium version and reuse its
    compatible cache. Missing libraries stop that approach for reassessment;
    do not silently restore unbounded apt installation or switch to containers.
- **Key examples:**
  1. Compatible prerequisites exist and the Ubuntu mirror stalls → run a CI
     dashboard shard or the prepared native local browser suite → tests run without
     an Ubuntu package refresh and report their actual result; CI stays within
     its existing job limit.
  2. A fresh environment lacks a required prerequisite and its source stalls
     → start setup → stop within an explicit setup bound, identify the failed
     source/prerequisite and recovery, and report no passing test verdict.
  3. The checkout and selected dependencies are unchanged after a successful
     setup → repeat local checks → reuse compatible setup, rebuild the app
     from the current checkout, and run the same checks without reinstalling
     unchanged system prerequisites.
  4. The locked Playwright version changes → rerun CI or local browser checks
     → select the matching browser/environment or request bounded fresh setup,
     rather than silently reusing an incompatible cached browser.
  5. A check contains a real regression → run with warm prerequisites → fail
     that check with its normal diagnostics; caches or setup shortcuts neither
     skip it nor turn the failure into a success.
  6. Sources are healthy → run all CI checks and repeat local checks → preserve
     coverage and shard balance, meet the existing CI budgets, and show setup
     and execution costs separately against an observed baseline.
- **Deferred promises:** Fully offline cold bootstrap; eliminating every npm,
  browser-download, image-registry, or GitHub outage; making native macOS and
  Linux font rendering identical; broader test-suite optimization unrelated to
  prerequisite setup; changing shard counts, budgets, or check coverage.
  These are delivery exclusions, not reasons to reject naturally supported use.
- **Capture:** Terry asked for this story on 2026-10-01 after the wrap-up
  report's evidence (cancelled shards logged `Ign:` lines from
  `azure.archive.ubuntu.com` until the job limit).
  On 2026-10-02 Terry explicitly added that CI and local checks must both be
  fast and repeatable, chose native environments without a Docker/Colima
  dependency, and accepted verifying runner libraries before removing routine
  Ubuntu package installation from every shard. Identical platforms are not
  required; each must provide a stable debugging target.

**Slice plan:** [Native checks with reusable prerequisites](../slice-plans/207-stable-native-check-prerequisites/PLAN.md)

## Investigation and alternatives (2026-10-02)

### Observed facts

- [CI workflow](../../.github/workflows/ci.yml): all nine dashboard shards run
  `npx playwright install --with-deps chromium`, even after restoring the
  browser cache. The cached path is `~/.cache/ms-playwright`, not Ubuntu's
  installed system packages. The cache therefore does not remove apt work.
- [Run 36884993415, attempt 1](https://github.com/terryyin/open-dough/actions/runs/36884993415/attempts/1):
  the jobs API shows dashboard shards 2, 4, 5, and 6 cancelled in installation.
  Shard 5's install ran from 15:32:13 to 15:38:30 UTC; shard 1's took 14 seconds.
  This is observed setup variability, not a measured regression in test speed.
- [Local reproduction helper](../../scripts/ci-container.sh) caches its built
  image, but cold builds use apt, a Git PPA, Node's `latest-v24.x`, and the
  locked Playwright version. Rebuilds can select different Git/Node releases.
  Every invocation also runs `npm ci`; its volume caches downloads rather than
  skipping installation. Even shell-only diagnosis builds browser prerequisites.
- [Local test guidance](../../tests/README.md#reproducing-cis-platform) says
  ordinary checks are native and the container is diagnostic. It records an
  ARM font-layout mismatch and a Chromium crash under x86 emulation, so matching
  an image alone does not establish identical browser behavior across hosts.
- This workspace has Node v24.5.0 and no `node_modules`. `docker info` failed
  because the configured Colima daemon socket was unavailable. No container
  launch, suite timing, or browser compatibility result was obtained.
- [Playwright's Docker documentation](https://playwright.dev/docs/docker)
  describes images containing browsers and system dependencies, with the npm
  package installed separately and a required project/image version match.
  This establishes a candidate mechanism, not its performance in this project.

### Credible directions

| Candidate | Speed and mirror independence | Repeatability and cost |
| --- | --- | --- |
| Keep current installs, add timeouts/retries | Smallest change; diagnoses stalls sooner, but mirror outages still prevent tests and repeated healthy apt work remains | Retains environment drift; retries spend the same budget |
| Use runner-provided libraries and install only the locked browser | Potentially simplest fast CI change; removes apt from checks if the runner supplies everything the suite actually needs | Runner image changes remain external; local reproduction needs its own controlled setup and actual browser validation |
| Reuse a versioned prepared browser environment in CI and local reproduction | Removes apt from routine checks and amortizes setup | Best candidate for shared inputs; image pull size, missing tools, permissions, Node/Git versions, and host architecture must be observed |
| Cache apt downloads or switch mirrors | Can improve healthy setup but still performs package-manager work; a cold cache retains mirror dependence | Adds cache/mirror maintenance without establishing a repeatable environment |

**Selected direction (Terry, 2026-10-02):** Native CI and local checks, reusable
compatible prerequisites, bounded cold acquisition, and explicit environment
identity. Verify runner-provided libraries through the full suite, then install
only the locked browser. Docker/Colima is excluded from the solution; prepared
images remain a considered alternative, not a fallback authorized by this plan.
A timeout alone does not meet the fast, repeatable warm-run goal.

### Remaining hypotheses and decisions

- Whether the current Ubuntu runner already supplies all libraries and fonts
  needed by the locked browser and actual suite. Cheapest decisive observation:
  run the dashboard suite on that runner with apt acquisition disabled. A
  package inventory or browser launch alone does not settle suite compatibility.
- Whether browser-only acquisition is at least as fast as healthy CI. Observe
  cold and warm browser-cache runs through the real checks, retaining setup and
  execution timings. This session inspected historical CI but did not trigger
  new CI runs; the plan owns an early runner probe.
- How much local repeated `npm ci` costs and which reuse is safe. Observe two
  unchanged-checkout runs and a lockfile-change run; do not assume retaining
  `node_modules` is either necessary or safe before measuring it.
- Native local checks without a container dependency are settled. Local speed
  uses warm-run reuse and bounded cold setup; no new numeric local target is
  required for this story.
- Exact cold-setup bounds and the healthy baseline must be established before
  claiming performance success. The existing overall CI budgets remain fixed.

### Architectural constraints

[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
requires fast feedback with the least complexity serving the outcome;
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md#2-keep-deterministic-checks-in-ci)
keeps deterministic checks in CI and calls for repeatable, bounded execution.
Neither prescribes a container platform. The alternatives must preserve the
current checks and isolation; no Accepted-ADR conflict was identified.
