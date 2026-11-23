# Bring launch test feedback to about eight seconds

**Identity:** SEED-413#reach-eight-second-launch-feedback
**Source:** [Bring launch test feedback to about eight seconds](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#reach-eight-second-launch-feedback)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Give dashboard maintainers a trustworthy passing result from the entire
`dashboard/frontend-tests/launches` selection in about 7–8 seconds of shell
elapsed time on comparable awake AC macOS runs with two workers. Count runner
preparation and teardown. Keep distinct launch behavior, typed creation proof,
the existing composed and end-to-end journeys, and browser pointer profiles.
Changes outside the launch unit selection are limited to measured shared
preparation cost and the consumers of any changed production or runner seam.
Exclude unrelated test families, new E2E cases, and a change in worker count.

## Baseline and decisive premises

- Plan 780's [recoverable checkpoint](https://github.com/terryyin/open-dough/blob/107af7aa7d6ff663fcfae55057c22e7641dc6a64/.planning/slice-plans/780-finish-launch-proof-orthogonal/reports/record-details-slice/report.md)
  contains the paired commands, host conditions, action-profile link, exact
  roster, and predecessor-to-successor mapping. The delivered candidate
  passed 77 cases in 24 files at 14.20 and 14.71 seconds, including
  preparation. Case bodies sum to 22.536 and 22.852 seconds. Even with
  perfect two-worker packing and zero overhead the gap requires removing at
  least 6.536–6.852 aggregate case-seconds. Calculate the actual required
  saving again after measuring non-case time and worker imbalance in Slice 1.
- The [CI proof lead reader](../../../.agents/skills/dough-test-optimization/references/evidence-and-leads.md#read-the-retained-ci-proof)
  at `81aa3337a`, scoped to `dashboard/frontend-tests/launches`, found
  [run 45120506976, attempt 1](https://github.com/terryyin/open-dough/actions/runs/45120506976/attempts/1)
  at `1a1e22a0b` successful, with both frontend parts present, 77 timed cases
  across 24 launch files and 17.0 summed case-seconds. The workflow at that
  revision runs `npm run test:dashboard:frontend` with its shard split,
  per-spec times, and proof record. Launches are selected by the complement
  shard. These are timing leads from CI's selection.
- **Runner route observed.** On 2026-11-23 at `81aa3337a`, this preparation
  worktree ran the exact command below on native arm64 macOS with AC power,
  Node 24.21.0, npm 11.19.0 and cloned dependencies from the matching lockfile.
  Vitest and the strict runner both passed. The 24 files yielded 67 cases in
  `chromium`, including unresolved creation, and 10 in the two
  `chromium-desktop` files. Shell time was 29.88 s as one-minute
  load rose from 9.91 to 30.64. This reaches the consuming runner and confirms
  selection and proof output. The rising load makes the timing unsuitable
  for comparison with the retained pair.
- **Cost and feasibility probe.** The earlier action profile predates the
  current mounts. It measured ten clicks in the refused refinement at
  2.30 aggregate seconds, five in No Approach at 0.85 s, seven in responsive
  automatic landing at 1.47 s, and eight in the held transcription case at
  1.65 s. Slice 1 measures the current operations, including waits and runner
  collection. Prove each candidate's saving and discrimination before commit.

## Current decisions

- Apply [ADR 0002, Software Development Lifecycle Principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  for fast, trustworthy feedback, [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  for the measured comparison and cost of maintenance, and
  [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  for distinct launch, startup, and assignment meanings.
- Follow the North Star topics
  [Make production code directly testable](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [Act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows),
  and [Plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Reuse typed inputs and MakeMe. Add no test-support wrappers. Keep the two
  fine-pointer specs in desktop Chromium and the other launch specs in the
  default touch-capable Chromium project. Retained Playwright elsewhere still
  uses the existing mixed runner path until its own migration.
- Reuse the actual `StartLaunch`, `LaunchDialog`, `LaunchOptions` and
  `StartSession` owners. The existing catalog tests already mount
  `LaunchDialog` with typed `readOptions` and transcription inputs, the
  refinement layout tests mount the typed `StartLaunch` with an offered
  definition and `onStart`, and the launch-offer cases exercise the narrower
  `StoryCardLaunches` with a typed machine answer. Use their existing mounts
  where equivalent. The card still owns mapping installed offers and rereads
  to the selected launcher. The launch owns what refusal retains across
  reopen and what Cancel clears. A mounted dialog with these results supplied
  as props cannot prove those transitions.
- Before removing a step or case, map its setup, assertions, and intervening
  waits to the surviving production boundary. Run the new witness while the
  predecessor still exists. If the changed boundary's discrimination is
  uncertain, verify it with a targeted scratch break and restore the edit.
  Run the installed consumer trace on changed paths and terms, including
  unaffected tests that read the changed behavior. Before landing any test
  change, apply MakeMe and page-object selection from the repository guidance.
- **Route after Slice 1 (2026-11-23).** Slice 1's runner logging
  (execution evidence `slice-1-report.md`) showed that the premise "at least
  6.5 case-seconds" omitted non-case overhead: 14.2 s − 22.5/2 leaves 2.95 s,
  mostly per-file prepare and import (about 6.3 aggregate s), so eight
  seconds needs about 12.4 case-seconds removed. Slices 3–7 are now
  estimated at 4.4–6.4, ending near 10.2–10.6 s. That leaves the case
  slices' value intact but makes the target depend on shared overhead,
  which the story's scope lets this plan measure and reduce. The former
  runner-parse Slice 7 is therefore widened into Slice 2, which runs
  first because it decides whether eight seconds stays credible. If
  Slice 2 cannot show enough removable overhead, the case slices continue
  for their measured gains and Slice 8 brings the remaining gap and a
  re-target decision to the maintainer, as the story's Evaluation directs.
  Timing comparisons stay relative until an uncontended series is possible.
- **Route after Slice 2 (2026-11-23).** Slice 2 found about 1.0–1.3 s of
  overhead removable within the repository: the preliminary parse and
  roughly 0.10–0.15 s of per-file isolation per lane for each spec file
  removed. The cold first file of each project and the 2.6 s single-file
  minimum belong to Vitest and the browser. The projected end is near
  9–9.5 s, so eight seconds is not credible on this route. Those numbers
  come from loaded runs, so Slice 8 rechecks them with an uncontended
  series when the host allows. The case slices 3–7 continue for their
  measured gains. Where a slice already owns two cohesive launch files that
  share a mount, it may merge them to remove per-file isolation, keeping
  pointer project assignment and every mapped witness. Slice 8 brings the
  measured gap and a re-target decision to the maintainer.

## Local gates and timing

Apply the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
For long macOS gates start fully awake and use `caffeinate -s -i` on AC.
On battery follow the [machine sleep guidance](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Timing comparisons use AC. Check host load and competing work before each
series. Record revision, package and Chromium versions, hardware, worker
count, load at both ends, warm-up, wall time, and the runner and case totals.
Preserve the exact roster from the strict proof record and each case's actual
Vitest project from the runner output.

```sh
/usr/bin/time -p caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/launches --workers=2
```

Set `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` to a fresh absolute file
path that does not yet exist for each measured run. Time the command above
with identical proof settings on both sides. Compare two warm before/after
pairs in alternating order with the same dependency/browser bytes and
comparable load. Keep instrumentation outside the timed comparison.
Focused runs use the same frontend command and two workers with the slice's
named spec stems as file filters. Run `npm run typecheck:dashboard` for
changed typed code or test entries. Changes to asynchronous browser
synchronization require three consecutive focused passes.

Keep an experiment when its matching proof passes and its repeated elapsed
gain exceeds the baseline variation or is supported by a reproducible
reduction at its measured boundary and a cumulative whole-selection gain.
Use the preparation-inclusive eight-second budget for deciding whether
remaining experiments can still reach the goal. After every experiment,
compare the remaining gap with the newly measured removable cost. If the
remaining route cannot plausibly reach the target, record the measurement,
failed assumption, consequences, and revised authorized route in Current
decisions before dispatch. If reaching it requires changing the goal,
scope, or confidence, stop that path for the maintainer. Preserve useful
accepted increments and record incomplete target proof.

## Outside-in proof

| Promise | Owner and observation |
| --- | --- |
| Complete launch feedback in about eight seconds with two workers | Slices 1 and 8. Strict focused-group runs, exact roster and shell real time over both pairs. |
| Refinement offer gating and reload, No Approach, refusal/reopen/Cancel, and exact start arguments | Slice 3. The card still sees held/reread offers and the real launcher still submits and resets through its real dialog. |
| Desktop offers, notes and action order, native hover, keyboard focus and return, contrast | Slice 4. Observe both offers in desktop Chromium, with the current markup, CSS and focus signals. |
| Narrow and zoomed geometry, responsive workspace policies, touch and real keyboard reachability | Slice 5. Run the launch layout and touch witnesses and keep the native policy/input and geometry observations. |
| Dictation, transcription, and the draft after interruption | Slice 6. Retain both Cancel and Escape, track/request disposal, and the next draft after late results. |
| Host defaults, effort and dismissals on the shared and composed launch entries | Slice 7. Verify actual dialog state and chosen launch across its callers. |
| Runner preparation changes preserve selection, isolation, project assignments, and proof output | Slice 2 if changed. Full frontend gate, exercised runner modes, and affected shared consumers. |
| Typed creation, launch record association, composed startup/notes, and existing E2E wiring | Slice 8. Whole launch roster and evidence for any affected composed consumers from the trace. |

## Slices

### 1. Measure the launch selection's current bottleneck
Type: Structure
Status: done

Reestablish an uncontended same-checkout baseline using the local gate and
pin its source revision. Capture shell time, case and file sums, worker tail,
and times to inventory, parse, start Chromium, import and teardown as the
runner evidence permits. In an isolated temporary observation, measure
actions and waits across the five case families below and any broad shared
cost that could make up the residual. Restore instrumentation before taking
reference times. Keep the roster and phase results with this plan and
recalculate each slice's savings hypothesis. Bound the first pass to these
lead files and one split of elapsed time. If healthy conditions or usable
phase evidence remain unavailable, hold the affected measurement-dependent
work and record the exact missing observation. This enables the first
bounded proof optimization without depending on the noisy planning run.

**Slice 1 results** (at `e84c8b67b`, AC, M4 Max, Node 24.21.0, Vitest 5.1.0,
two workers; load never healthy: 1-min load 21–94 with external stress).
Roster: 77 cases in 24 files, 67 `chromium` and 10 `chromium-desktop`
(offers and startup). Measured shell 16.30–21.81 s with case sums
24.6–30.9 s (stressed runs 35 s/41 s excluded). Phase split from runner
logging, now removed: npm/node 0.26–0.36 s, `createVitest` 0.62–0.79 s,
glob 0.01 s, `parseSpecifications` 0.07–0.40 s, run 17.7–20.0 s, close
0.04–0.20 s. Inside the run, browser launch is ~0.8–1.5 s (inferred
residual). Per-file prepare+import adds ~6.3 aggregate s, including
~1.6 s for the first file in each project. Lanes differ by 0.26–0.52 s,
so packing is not the bottleneck. Family case sums from m2, m3 and i1:
refinement 5.2–6.5 (refusal/Cancel 1.3–2.1), offers 3.0–4.6 (hover notes 1.2–2.1),
responsive 3.7–4.0 (both policies 1.1–1.3), voice 4.8–5.7 (held transcription 1.2–1.3)
and host setup 3.8–4.4. Recalculated historical-scale savings: refinement 1.2–1.6,
offers 0.8–1.2, responsive 0.8–1.2, voice 1.2–1.6, host setup 0.4–0.8,
parse at most 0.4 s serial. The plan premise failed. Historical overhead is
2.95 s (14.2 − 22.5/2), so 8 s needs at least 12.4 removed case-seconds,
not 6.5. The case slices reach about 10.2–10.6 s. Shared per-file import and
prepare cost was unowned; see the route decision in Current decisions.
Missing: an uncontended series (another worktree's deliberate stress load
ran throughout) and per-action wait splits. The report is retained in the
execution evidence as `slice-1-report.md`.

### 2. Reduce shared per-file preparation and import cost
Type: Structure
Status: done

Slice 1 left about 6.3 aggregate seconds of per-file prepare and import,
including about 1.6 s for each project's first file, and 0.07–0.40 s in
the preliminary `parseSpecifications`. In a scratch observation, split that
cost between Vitest browser prepare, each spec's module graph (shared page
modules, production imports, CSS) and the second project's first file.
Set the trial limit before editing: at most two bounded experiments at the
largest measured part, each kept only when its relative shell gain on
paired same-conditions runs exceeds the run-to-run variation. Candidates
include narrowing a spec's or page module's import graph, removing duplicate
module transforms between the two projects, and skipping the preliminary
parse in `groupVitest.mjs` when every case of the selected files runs (keep
it for listing, grep/invert and source coordinates). Preserve file and
project selection, pointer assignments, isolation, collection failures,
strict proof, timing, deadlines and mixed-runner behavior. Revert an
experiment that cannot establish a saving with equivalent behavior.
For a runner change, prove ordinary, listing, filtering and split modes,
including an empty selection and a broken collection in scratch, run
`node --test Distribution/tests/support/{ci-browser-groups,browser-group-shards,frontend-test-proof}.test.mjs`
and the full `npm run test:dashboard:frontend -- --workers=2` with the
macOS guard, and run affected backend runner consumers. Record the
measured removable overhead and whether the eight-second route remains
credible.

**Slice 2 results** (at `575ab48fd`, AC, two workers, load 20–60 with
external stress). Slice 1 diagnostics show the per-file overhead is the
first file of each project (offers, refinement-options: ~1.1–1.6 s cold
transform and page init, overlapping across lanes) plus ~0.10–0.15 s of
per-file isolation for each other file. A trivial single file costs
2.58–4.26 s shell; adding the second project costs ~0.5–0.9 s. Warming the
launch page modules through Vite `server.warmup` gave A/B shells 25.0/22.8,
26.4/39.2, 51.2/82.2 s and import shares 13–22/9–20 %, inside the variation,
so it was reverted. Skipping the preliminary parse (≤0.4 s) was not tried.
No code changed, so C12 was not triggered. Overhead removable within the repo
is about 1.0–1.3 s: the parse plus file consolidation at ~0.1–0.15 s per file
per lane. That puts the route near 9–9.5 s, so eight seconds is not credible
and Slice 8 brings the re-target. Report: execution evidence `slice-2-report.md`.

### 3. Shorten the refinement choices and refusal checks
Type: Behavior
Status: planned

Use `launch-refinement-options` and `story-card-launch-dialogs` for focused
proof. Measure incidental opens, disclosure, and repeated option activation.
Keep the held read and workflow distinction at the story card. Exercise No
Approach at the real option controls with one native Space and exact
`["--c"]` through Start. Keep refusal, retention, and Cancel reset together
on one real launcher using the typed offered shape and a refusing start
collaborator. Speed up setup actions only when they carry no input promise.
Check the existing exclusive-option composed E2E journey if any shared
production path changes. Test whether this removes roughly
2 case-seconds from the historical 3.48 in the refinement-options file.

### 4. Shorten the fine-pointer Start offer checks
Type: Behavior
Status: planned

Use `story-card-launch-offers` and `story-card-startup`. Keep the ready,
unassessed, Preparing, unavailable, and Taken distinctions, both notes and
exact dialog wording, both tooltip presentations, visible focus and return,
glyphs and contrast. Check which duplicate launcher interactions only set up
assertions already owned by shared Start behavior. Keep actual hover, Tab,
Enter and Escape where they distinguish the user outcome, including the
narrow and zoomed paths. Look for 1–1.5 case-seconds of duplicated
preparation or redundant input out of 3.18 in the offers file. Verify the
fine-pointer media match on both remaining desktop specs.

### 5. Shorten the responsive dialog matrix
Type: Behavior
Status: planned

Use `ad-hoc-start-session-layout`, `ad-hoc-launch-dialog` and
`ad-hoc-refinement-touch`. Drive the real `StartSession` with offered and
unavailable policies and the real `StartLaunch` with the dense shipped
definition. Keep both workspace choices and the four policy/viewport
observations, the refusal explanation, collapsed options, and every
containment and reachability assertion. Use the current viewport and zoom
helpers. Compare lower-overhead activation for setup and local geometry
reads after the corresponding committed render. Keep native tab order and
touch rotation/draft continuity. Expected removable cost to test is
1–1.5 case-seconds in the two layout files (3.16 historically).

### 6. Shorten voice and transcript setup
Type: Behavior
Status: planned

Use `mounted-instruction-voice`, `mounted-instruction-voice-overflow`,
`mounted-instruction-voice-capture-failures` and `transcript-review`.
Reuse the typed recorder and transcription fixtures and direct mounted
dialog. Measure setup for recording, late permission and late transcription,
and repeated review opening. Keep actual permission, track-end, retry,
Discard, Cancel and Escape outcomes, including an explicit focus wait before
keyboard navigation after review appears. Keep the 4,000-character and final
Start payload observations at their owners. Look for 1.5–2.0
case-seconds out of the historical 3.95 in the mounted voice files.

### 7. Shorten shared dialog setup across launcher cases
Type: Behavior
Status: planned

Use `launch-model-effort`, `launch-host-catalog`,
`story-card-launch-dialogs` and `ad-hoc-start-session.spec.ts`. Keep exact
host/model/effort choices, late/aborted catalog answers and reset on
host switch and dismissal through the existing typed catalog mount. Retain
the real launcher and native focus return where that is the observed
handoff. Measure up to 1.0 case-second of repeated host setup. This slice
owns host setup. Slice 3 owns option offers and refusal/reset.

### 8. Verify the whole-selection target and retained proof
Type: Behavior
Status: planned

Run the two comparable pairs with the standard selection and retain their
elapsed results and exact rosters. Map original cases to surviving witnesses.
Check typed unresolved creation and both pointer projects. Inspect affected
composed startup, note handoff and record-detail evidence. Replay existing
E2E where the trace reaches it. Apply the gap decision if the target remains open.

## Plan review

Eight slices; Slice 2 was widened from the runner-parse experiment and moved first after Slice 1's measurement. Separate refinement was unnecessary because each experiment
owns one measured cost and identifies its surviving behavior witnesses.
The probe resolves current cost and biases before dependent edits. No
additional slice-specific blocking concern was found.
