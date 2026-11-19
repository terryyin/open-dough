# Default dashboard backend checks to the mounted boundary

**Identity:** SEED-408#default-dashboard-backend-checks-to-the-mounted-boundary
**Source:** [Default dashboard backend checks to the mounted boundary](../../seeds/SEED-408-default-dashboard-backend-checks-to-the-mounted-boundary.md#default-dashboard-backend-checks-to-the-mounted-boundary)

**Plan status:** Awaiting story refinement. The mapped slices are provisional.

## Goal and scope

Use the existing opt-in mount from SEED-403 for ordinary Dashboard Backend Test
boundary starts. Keep named live cases and other test groups' existing entries.
The inherited 800-mount acceptance remains open because the attempted rollout
mounted 702 starts. Refinement owns the decision on the threshold or scope.

## Slice mapping

Original SEED-403 slices 1–6 belong to its completed opt-in outcome. Original
slice 7 becomes slice 1 here and original slice 8 becomes slice 2. The former
G1 fixture-failure obligation follows slice 1 here. The scratch failure
retained the original assertion and fake GitHub call attachment, then the
mounted fixture closed and restored the worker HOME. Revalidate affected
observations when the candidate or refinement changes.

## Ordered slices

### 1. Dashboard Backend Test mounts boundary-mode starts by default

Type: Behavior
Status: planned
Budget: 15 active minutes, excluding commands.

Behavior: a backend case starts a boundary-mode server without asking →
the boundaries mount in the worker → its assertions are unchanged. A case
that asked for the live server gets one. E2E Test and Dashboard Frontend
Test keep the live server.

The shared Playwright fixture attaches diagnostics on an unexpected test
status. When it receives a mounted server, attach the available fake GitHub
calls without requesting a child process's output, and guarantee fixture
close even when diagnostics fail. This path must preserve the case's original
failure and restore the worker before it can serve another mount.

Proof: the whole backend suite passes. A case that newly fails gets its
cause found and the live request with that cause, under the failure policy;
it is not skipped or loosened. Record every start's entry and its start and
close time for this run through a temporary recorder and compare with the
baseline row: at least 800 mounted starts and their summed start and close
time under a quarter of the baseline's for the same starts. Alternate the
live and mounted defaults three times over `review/` and record both wall
times. Run `npm run test:dashboard:frontend` and `npm run test:e2e`, since
the start is shared with them, and confirm neither mounted a server.

The retained November 18 baseline is aggregate. For a matched-start
comparison, collect a live-default run on the same implementation with the
temporary recorder's default override, and pair the originally live starts
by case and call order with the starts the mounted default routed in-process.
Explicit mount-only runtime checks keep their requested entry in both runs
and have no live mate. Retain any unpaired rows for review.

The first strict whole-backend run selected 1,805 cases. It reported 1,791
passing, two existing skips, and 12 failures. It observed 702 mounted starts
out of 952 successful boundary starts, 98 below the required 800. Their
startup and first close times summed to 35.410 seconds in this failed run.
All 12 cases passed in focused verification after the bounded repairs.
Dashboard typecheck and the whitespace check passed. Evidence is indexed
in the archived `slice-7-return.md`; see Recovery below.

The routing audit found no in-scope path to recover 98 starts while
preserving the required process proofs and the held cases. Of 250 live
boundary starts, 162 are Cursor-selected, retained-answer process journeys,
incident lifecycle, or named other/program/connection cases. Even allowing
all of the remaining 88 to mount would give 790 on this observed population.
Many of those 88 independently need a live process. The whole result after
repair is unobserved and repairs add some live requests.

The default and focused repairs are preserved in the accompanying candidate patch. Continuing requires a developer decision on the 800-start
minimum or authority to expand the migration. The final whole backend
run, matched timing, review alternation, whole frontend and E2E runs, and
the documentation slice remain open.

### 2. The entry rule names the mount and the live request

Type: Behavior
Status: planned
Budget: 15 active minutes, excluding commands.

Behavior: a developer reads
[which entry a case uses](../../../dashboard/backend-tests/README.md#which-entry-a-case-uses)
→ it says a boundary-mode start mounts in the test process on the stand-in,
how a case asks for the live server and with which reasons, that Cursor
work is such a reason, and that a test's own child command needs its own
environment → the link to this story's migration is gone and the header
comment of `dashboardServer.ts` agrees.

Proof: the README and the fixture comments match the delivered option names;
`npm run lint` passes. The CI comparison in the seed's goal is owed to
target CI: the median `dashboard-backend` test step time over the five main
runs after landing against the five before, read from CI.

## Recovery

The original plan, trial, and accepted opt-in slices are recoverable with
`git show 73f859a5da6e9e45f6bb6c194693b23e685f713c:.planning/slice-plans/710-reach-dashboard-backend-checks-through-the-mount/PLAN.md`.
The [candidate patch](slice-7-candidate.patch) was verified against that
revision. It preserves the partial default switch and the focused repairs.
Review it against the newly selected checkout before reusing it. Check
applicability with `git apply --check --unidiff-zero <patch>`. The candidate
kept a paused slice clock at 10.2 active minutes with no overrun.

The original checkout's evidence, failure traces, route files, rehearsal and
post-repair runs, full working-tree patch, and pre-split plan and source review
are archived under the repository's common Git directory at
`open-dough/recovery/SEED-408/` on the execution machine. The portable patch
and observations above are the inputs available from a fresh clone.

## Local verification

Use the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md),
default test timeouts, dashboard typecheck, and lint. Run long local gates on
awake macOS on AC with `caffeinate -s -i`; on battery follow the
[open-lid procedure](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
