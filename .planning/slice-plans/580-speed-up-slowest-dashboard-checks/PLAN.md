# Speed up the remaining Dashboard checks

**Identity:** SEED-303#speed-up-slowest-dashboard-checks

**Source:** [Remaining story](../../seeds/SEED-303-speed-up-slowest-dashboard-checks.md#speed-up-slowest-dashboard-checks)

## Goal and scope

Run Taken profile, pending-Take reconciliation and the existing pinned-deployment
protection in one ordinary local command below 30 seconds with one worker.
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
decides which evidence applies: three consecutive passing runs below 30 seconds
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
| Taken owner/detail, mode, branch, tool/model, missing versus unreadable, portraits/icons, widths, accessibility | 2 | The Taken profile check and each named surviving proof |
| Every removed inspection names the surviving proof of its promise | 2, 3 | Removal table in this plan; scratch fault makes the survivor fail |
| Pending Take protection through stale/unrelated, partial, comparison failure/recovery, final snapshot, reload | 3 | The pending-Take check |
| Pinned deployment unchanged | 4 | Its spec has no diff against the baseline revision and passes in every credited run |
| Ordinary CI selection preserved; no mocks, sleeps, retries, skips, timeout inflation or runner mode | 2, 3, 4 | Diff review and discovery of the three titles through the unchanged command |
| Under 30 seconds, or the busy-host ratio with the quiet-host check owed | 4 | The measure above |

## Decisive premises

| Premise | Consuming operation | Observation | Result | Remainder |
| --- | --- | --- | --- | --- |
| The command selects exactly the three checks | Every slice's run | The command above with `--reporter=list`, this workspace at `81bf54e11`, 12 November 2026 | 3 cases listed and run: pinned deployment, pending Take, Taken profile | None |
| The three checks pass at the baseline revision | Slice 1 baseline | Same command, default timeout, one-minute load 46 and 53 | Pinned passed (54.4 s, 56.6 s); both browser checks ended at the 30-second test timeout. With `--timeout=300000 --trace=on` at load 61→43: 3/3 passed in 165.05 s | Unverified host condition: a default-timeout pass needs lower load. Slice 1 observes it |
| The quiet-host baseline leaves the promise reachable without changing run-wide startup or the pinned case | Slices 2–4 sizing | Retained quiet-host case durations 9.03 s, 8.07 s and 7.97 s (5.87 s in the latest retained run); about 16 s outside cases in the 45- and 24-case commands | Unmeasured for this selection. Cases alone sum to 23–25 s, so the promise holds only if this selection's outside-check time and the reductions fit | Open; slice 1 is the probe that settles it |
| The profile check's time is dominated by repeated inspection | Slice 2 | Traced run above | 988 trace steps; mark inspection at two widths 10.8 s of 26.9 s (four cards × two widths, each with host mark, detail, mode mark); portrait step 3.6 s | Which inspections another check already owns is settled per removal in slice 2 |
| The pending-Take check's preparation is a large share | Slice 3 | Traced run above | 18.3 s of 53.3 s in the `origin` (9.1 s) and `dashboard` (8.7 s) fixtures; the profile check's `dashboard` fixture took 1.2 s, so part of that 8.7 s may be first-use run artifacts rather than this check's own preparation | Slice 1 separates first-use artifacts from the check's own preparation |

## Slices

### 1. Establish the matched baseline and where its time goes
Type: Behavior

Status: planned

Proof: Three runs of the selection command at the Take revision with proof
records, logs and loads; one traced attribution run. This plan then records
whole-command elapsed, per-check seconds, outside-check seconds, first-use
artifact time separated from each check's own fixtures, and the counts for the
profile check (trace steps, card inspections, viewport passes) and the
pending-Take check (trace steps, fixture preparations, reloads, comparisons).

Behavior: The unchanged selection runs → the plan holds a comparable baseline
and the quiet-host figure the ratio uses, or says that only a loaded baseline
exists and which retained quiet figures stand in for it.

Stop: when the baseline shows outside-check time plus the pinned case leave the
two browser checks less than half their current time, the 30-second promise
needs a change this story excludes. Record the figures and stop slices 2–4 for
Terry's decision between changing run-wide startup, changing the pinned case,
or a different target. A default-timeout failure in these runs follows the
failure policy below; classify it with recorded loads before any reduction.

### 2. Prove Taken profile details with fewer inspections
Type: Behavior

Status: planned

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

### 3. Keep pending Take protection with less preparation and repetition
Type: Behavior

Status: planned

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

### 4. Verify the remaining selection against the 30-second promise
Type: Behavior

Status: planned

Proof: The measure in "Selection and measurement" on the final revision,
against slice 1. The pinned-deployment spec is unchanged. The three titles are
still discovered by the unchanged command and remain in ordinary CI selection.
This plan records elapsed times, loads, counts, which form of evidence applied
and whether the quiet-host check is still owed.

Behavior: The reduced checks and the unchanged pinned case run in one ordinary
command → maintainers get the same protection below 30 seconds, or the
recorded ratio with the owed check named.

## Current decisions

- Terry's five-story extraction set this scope; SEED-311–315 own their families
  and no dependency follows from queue order.
- The pinned-deployment case and run-wide startup count in the elapsed time and
  are not changed; slice 1's stop returns that boundary to Terry.
- Under external load, measurement is relative and does not wait for a quiet
  host; the quiet-host three-run check stays owed until observed.
- A fresh source-only review is obtained at the first planned delegation, as
  execution requires; the archived review describes the former scope.

## Concern evidence

Slice-plan refinement was not needed: the four slices each hold one outcome and
one proof loop. Remaining concern: the reachability premise for slices 2–4 is
open and bounded by slice 1's probe and stop. No other slice-specific concern
was identified in this review.

## Local gates

Use normal strict focused selections and affected neighbors. Follow the
[failing and flaky tests policy](../../../AGENTS.md#failing-and-flaky-tests)
verbatim in every delegation or repair handoff. Keep default test timeouts and
shared MakeMe data. Start long macOS runs awake: on AC use `caffeinate -s -i`;
on battery plug in or keep the lid open under `caffeinate -i` and inspect sleep
logs, following [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
