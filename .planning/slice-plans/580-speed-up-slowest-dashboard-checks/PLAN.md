# Speed up the remaining Dashboard checks

**Identity:** SEED-303#speed-up-slowest-dashboard-checks

**Source:** [Remaining story](../../seeds/SEED-303-speed-up-slowest-dashboard-checks.md#speed-up-slowest-dashboard-checks)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

Run Taken profile, pending-Take reconciliation and the existing pinned-deployment
protection in one ordinary local command below 45 seconds with one worker.
Include startup, preparation, all credited replacement proof and teardown.
Preserve distinct behavior, meaningful viewports/assets/accessibility and the
real Git/process/build boundaries that supply unique protection. Exclude the
five families now owned by SEED-311–315 and local-only archived experiments.

## Delivered before this handoff

- Comparable original 45-case strict baseline and necessary repeat/Cursor test
  synchronization/precondition corrections were delivered.
- The real pinned-deployment source projection was delivered and remains useful
  to this remaining story; its integration protections stay intact.
- The production update-selection owner and three real-Git checks were delivered;
  further watcher work belongs to SEED-311, not this plan.
- Test names and a CI-versus-local timing breakdown were clarified.

[Evidence and complete original-to-new ownership mapping](../../evidence/SEED-303-early-handoff/README.md).
The former complete plan and original source review remain recoverable at
`2a4a8d6f9f3bd61dc21d8679705e863c838883b9`.

## Selection and measurement

The remaining selection is three maintained CI checks, run from the repository
root with the pinned Node and Homebrew Bash first on `PATH`:

```sh
selected='each Taken card shows its published agent profile|deployment installs, builds, and serves its pinned commit|a Take.s older snapshot arriving late'
OPEN_DOUGH_DASHBOARD_PROOF_RECORD="$proof_root/run$run.json" \
  /usr/bin/time -p caffeinate -s -i npm run --silent test:dashboard -- \
  --workers=1 --grep "$selected" > "$proof_root/run$run.log" 2>&1
```

Record the one-minute load before and after every run. The story's
[measure](../../seeds/SEED-303-speed-up-slowest-dashboard-checks.md#speed-up-slowest-dashboard-checks)
decides which evidence applies: three consecutive passing runs below 45 seconds
on a quiet host, or alternating baseline/candidate runs under the same recorded
load judged by the ratio, with the quiet-host check reported as still owed.
Attribute phases from a `--trace=on --reporter=list` run of the same selection:
pair `before`/`after` events in each case's `test.trace` by `callId`. A raised
`--timeout` is allowed only on such a scratch attribution run, never on a run
credited as proof.

## Promise ownership

| Source promise | Owning slice | Observation |
| --- | --- | --- |
| Matched baseline with per-check and outside-check seconds and load-independent counts | 1 | Proof records, logs, loads and trace counts retained in this plan |
| Taken owner/detail, mode, branch, tool/model, missing versus unreadable, portraits/icons, widths, accessibility | 2 | The Taken profile check and each named surviving proof (slice 2 removal table) |
| Every removed inspection names the surviving proof of its promise | 2, 3 | Removal tables in proof/slice2-observations.md and proof/slice3-observations.md; scratch faults make survivors fail |
| Pending Take protection through stale/unrelated, partial, comparison failure/recovery, final snapshot, reload | 3 | The pending-Take check |
| Pinned deployment unchanged | 4 | Its spec has no diff against the baseline revision and passes in every credited run |
| Ordinary CI selection preserved; no mocks, sleeps, retries, skips, timeout inflation or runner mode | 2, 3, 4 | Diff review and discovery of the three titles through the unchanged command |
| Under 45 seconds, or the busy-host ratio with the quiet-host check owed | 4 | The measure above |

## Decisive premises

| Premise | Consuming operation | Observation | Result | Remainder |
| --- | --- | --- | --- | --- |
| The command selects exactly the three checks | Every slice's run | The command above with `--reporter=list`, this workspace at `81bf54e11`, 12 November 2026 | 3 cases listed and run: pinned deployment, pending Take, Taken profile | None |
| The three checks pass at the baseline revision | Slice 1 baseline | Take/current `658d1fef`, default timeout, recorded load ~39–55 one-minute averages; evidence in [proof/](./proof/) | Run 1: pinned 35.45 s passed; pending and profile each hit the 30 s default timeout (load before ~39/43/47, after ~75/54/50). Runs 2–3: 3/3 passed (91.92 s / 78.72 s) under similar load. Attribution with `--timeout=300000 --trace=on --reporter=list`: 3/3 in 78.45 s | Loaded baseline only; default-timeout pass is flaky under this load. Quiet-host three-run check still owed |
| The quiet-host baseline leaves the former 30-second promise reachable without changing run-wide startup or the pinned case | Slices 2–4 sizing | Slice 1 loaded cohort plus quiet stand-ins from the retained 45-case median (pending 9.033 s, profile 8.065 s, pinned 7.969 s, outside ~16.350 s) | Former 30 s stop fired (quiet budget 5.681 s < half browser 8.549 s). Terry authorized a different target: 45 s. Quiet stand-in sum ≈ 41.4 s, so 45 s is reachable while keeping startup and pinned unchanged | Closed: continue slices 2–4 under the 45 s measure; browser reductions still serve busy-host timeout margin |
| The profile check's time is dominated by repeated inspection | Slice 2 | Slice 1 attribution `test.trace` (paired by `callId`) | 991 trace steps; 18 `inspected()` card inspections (8 in the 4×2 mark loop); 2 viewport passes; mark step 4.394 s; portrait step 1.958 s of ~14.0 s list duration | Settled in slice 2 removal table: after change 552 steps, 6 `inspected()`, 3 mark-step inspections, 2 viewport passes; survivors and scratch faults recorded |
| The pending-Take check's preparation is a large share | Slice 3 | Slice 1 attribution `test.trace` | Before Hooks 9.104 s; `origin` fixture 3.753 s (own); first `dashboard` fixture 4.744 s of which ~4.109 s is first-use versus profile's later `dashboard` 0.635 s; 663 trace steps; 2 reloads; compares list length 3 | Slice 3 kept real origin/dashboard boundaries; cut repeated waits/inspections (663→635 steps; list 21.7→9.2 s). Reloads 2 and compares length 3 retained |

## Slice 1 baseline (loaded; quiet owed)

Only a loaded baseline exists for this three-check selection at
`658d1fef810cbf911ef2a993b2104a45234f81c4`. Quiet-host figures that stand in for
the ratio and stop probe are the retained 45-case median from
[test-timing-breakdown.md](../../evidence/SEED-303-early-handoff/test-timing-breakdown.md):
pending 9.033 s, profile 8.065 s, pinned 7.969 s (alternate 24-case pinned
5.873 s), outside-check ~16.350 s. Evidence:
[proof/baseline-summary.json](./proof/baseline-summary.json), per-run
`runN.json` / `runN.log` / loads, and
[proof/attribution-summary.json](./proof/attribution-summary.json).

| Run | Whole `real` s | Pinned s | Pending s | Profile s | Outside-check s | Strict | One-minute load before → after |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| 1 | 136.31 | 35.45 | 33.20 (timeout) | 33.19 (timeout) | 34.47 | failed | ~31/44/47 → ~75/54/50 |
| 2 | 91.92 | 30.14 | 24.82 | 15.23 | 21.72 | passed | ~49/52/50 → ~59/52/50 |
| 3 | 78.72 | 22.35 | 27.04 | 15.05 | 14.27 | passed | ~55/52/50 → ~44/50/50 |
| attr | 78.45 | 25.8 | 21.7 | 14.0 | 16.95 | passed (raised timeout) | ~34/45/48 → see `trace.load-*` |

First-use versus own fixtures (attribution order pinned → pending → profile):
pending `dashboard` 4.744 s includes ~4.109 s first-use relative to profile's
later `dashboard` 0.635 s; pending `origin` 3.753 s is this check's own
preparation; profile's own post-first-use `dashboard` is 0.635 s.

Former 30 s stop probe: budget = 30 − (outside + pinned). Loaded run 3 budget
−6.62 s. Quiet stand-in budget 5.681 s < half of quiet browser current 8.549 s.
**Resolved:** Terry authorized a different target (45 s) rather than changing
startup or the pinned case. Quiet stand-in whole-command sum ≈ 41.4 s under 45 s.
Slices 2–4 continue; slice 1 remains done.

## Slices

### 1. Establish the matched baseline and where its time goes
Type: Behavior

Status: done

Proof: Three runs of the selection command at the Take revision with proof
records, logs and loads; one traced attribution run. This plan then records
whole-command elapsed, per-check seconds, outside-check seconds, first-use
artifact time separated from each check's own fixtures, and the counts for the
profile check (trace steps, card inspections, viewport passes) and the
pending-Take check (trace steps, fixture preparations, reloads, comparisons).
Observed under recorded load at `658d1fef` — see [Slice 1 baseline](#slice-1-baseline-loaded-quiet-owed).

Behavior: The unchanged selection runs → the plan holds a comparable baseline
and the quiet-host figure the ratio uses, or says that only a loaded baseline
exists and which retained quiet figures stand in for it.

Stop: when the baseline shows outside-check time plus the pinned case leave the
two browser checks less than half their current time under the former 30-second
promise, record the figures and stop for Terry. **Fired, then resolved:** Terry
chose a different target (45 s); startup and pinned stay unchanged.

### 2. Prove Taken profile details with fewer inspections
Type: Behavior

Status: done

Proof: The Taken profile check passes through the selection command. For each
removed or merged inspection this plan records the promise, the surviving
observation (in this check or a named maintained check such as
`backlog-preparing.spec.ts`, `agent-roster.spec.ts` or
`taken-agent-profile-refresh.spec.ts`) and one scratch fault that the survivor
catches, reverted before commit. Counts fall against slice 1. Affected
neighbors: the specs importing `agentPortrait.ts` and
`takenAgentProfileRecords.ts` when either changes.

Behavior: The published board holds the profile states that differ → the real
Dashboard reads and renders them → ownership, missing versus unreadable, mode,
branch, tool/model, portrait, mark, accessible text and the narrow and desktop
widths are each observed where they can differ, without repeating an identical
inspection for every card at every width.

#### Slice 2 observations and removal table (status remains planned)
`taken-agent-profile.spec.ts` only (helpers unchanged). Counts 991→552 steps,
18→6 `inspected()`; focused/selection/neighbors 3/3. Removal table and scratch
faults — [proof/slice2-observations.md](./proof/slice2-observations.md).

### 3. Keep pending Take protection with less preparation and repetition
Type: Behavior

Status: done

Proof: The pending-Take check and its sibling in
`responsive-session-reconciliation.spec.ts` pass through `--grep` of that file
with one worker. The stale, unrelated, comparison-failure and recovery, partial,
complete, descendant and reload observations and the exact `compares` list all
remain. Any change to `responsiveStart.ts`, `startOrigin.ts` or the `dashboard`
fixture also runs the responsive start specs that file names. Counts fall
against slice 1.

Behavior: Real accepted-launch facts arrive in the necessary order → protection
ends only after the complete accepted snapshot and survives reload → the same
sequence costs less of the check's own preparation and fewer repeated waits.

#### Slice 3 observations and removal table (status remains planned)
`responsive-session-reconciliation.spec.ts` only (helpers/fixtures unchanged).
Counts 663→635; `expectProtected` 5→1; reloads 2; compares length 3 —
[proof/slice3-observations.md](./proof/slice3-observations.md).

### 4. Verify the remaining selection against the 45-second promise
Type: Behavior

Status: planned

Proof: The measure in "Selection and measurement" on the final revision,
against slice 1. The pinned-deployment spec is unchanged. The three titles are
still discovered by the unchanged command and remain in ordinary CI selection.
This plan records elapsed times, loads, counts, which form of evidence applied
and whether the quiet-host check is still owed.

Behavior: The reduced checks and the unchanged pinned case run in one ordinary
command → maintainers get the same protection below 45 seconds, or the
recorded ratio with the owed check named.

## Current decisions

- Terry's five-story extraction set this scope; SEED-311–315 own their families
  and no dependency follows from queue order.
- The pinned-deployment case and run-wide startup count in the elapsed time and
  are not changed.
- Under external load, measurement is relative and does not wait for a quiet
  host; the quiet-host three-run check stays owed until observed.
- After slice 1's former 30 s stop, Terry authorized a different target: 45 s
  for this selection, keeping browser reductions for busy-host margin under the
  default test timeout. Story Goal, Measure, Key examples and this plan now
  use 45 s / ratio×45.
- A fresh source-only review is required again after that story amendment,
  before the next planned delegation.
- Expensive proof (slice 1 baseline): completed under recorded load; quiet-host
  three-run check remains owed; only a loaded baseline exists for this
  selection.

## Concern evidence

Slice-plan refinement was not needed: four slices, one outcome and proof loop
each. Former 30 s stop resolved by Terry's 45 s target; no other slice-specific
concern in this review.

## Local gates

Use normal strict focused selections and affected neighbors. Follow the
[failing and flaky tests policy](../../../AGENTS.md#failing-and-flaky-tests)
verbatim in every delegation or repair handoff. Keep default test timeouts and
shared MakeMe data. Start long macOS runs awake: on AC use `caffeinate -s -i`;
on battery plug in or keep the lid open under `caffeinate -i` and inspect sleep
logs, following [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).

## Story obligations

### E1. Extracted families stay outside this selection
Reported: slice 1 — "The five extracted families owned by SEED-311–315 do not belong in this selection."
Story clause: "The five extracted families are owned by SEED-311–315. Their work and timings do not belong in this selection, and no aggregate promise spans them."
Disposition: excluded "The five extracted families are owned by SEED-311–315. Their work and timings do not belong in this selection, and no aggregate promise spans them."
Commitment: 18.1, 18.2, 18.3

### E2. Local-only archived experiments stay excluded
Reported: slice 1 — "Local-only archived experiments are excluded from this selection."
Story clause: "Local-only archived experiments are excluded."
Disposition: excluded "Local-only archived experiments are excluded."
Commitment: 19

### E3. Manufactured savings stay excluded
Reported: slice 1 — "No manufactured savings through mocks, sleeps, retries, skips, timeout inflation or special runner mode."
Story clause: "No new internal mocks, wall-clock sleeps, retries, skips, timeout inflation or special runner mode may manufacture a saving."
Disposition: excluded "No new internal mocks, wall-clock sleeps, retries, skips, timeout inflation or special runner mode may manufacture a saving."
Commitment: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6
