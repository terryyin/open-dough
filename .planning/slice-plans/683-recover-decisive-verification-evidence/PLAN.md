# Recover decisive verification evidence after large or cleaned-up output

**Source:** [story](../../seeds/SEED-345-session-token-efficiency.md#recover-decisive-verification-evidence)
**Source review:** [independent commitments](source-review.md)
**Identity:** SEED-345#recover-decisive-verification-evidence

## Goal and scope

A proof run's command, revision, result and decisive diagnostic stay
recoverable after large output or runner cleanup, and a worker's hand-back is
a short verdict that points to them. The change is the installed slice clock's
`run` and shared `dough-execute-plan` guidance under `Distribution/src/skills/`.

**Exclusions:** which proof is required, the acceptance comparison and its
stopping rule, promise allocation, how an owner waits, which guidance a
coordinator reads, CI evidence excerpts, completion markers, and any
runner-specific adapter. The installed copies under `.claude/skills/` and
`.agents/skills/` change at release, not here.

**Assumptions:** hosts run proof commands through `run` as the guidance
already requires. An execution in a default checkout keeps its evidence in
that checkout's Git directory until someone removes it; the story promises
removal only with a retired worktree.

## Architecture

One concept, **proof evidence**, gets one owner: a new reference
`dough-execute-plan/references/proof-evidence.md`. It holds the evidence
location, the run record, the decisive-artifact rule and reading a large log.
Existing owners link to it in place and keep their own rules: `run` usage in
[oversized-slice](../../../Distribution/src/skills/dough-execute-plan/references/oversized-slice.md#track-active-time),
waiting in `wait-for-proof.md`, the overdue check, the expensive-proof
decision and the delegation brief. This follows
[author-open-dough-skills](../../../.agents/skills/author-open-dough-skills/SKILL.md),
which the implementer applies before editing any skill file.

- **Evidence location:** `git rev-parse --git-path open-dough/evidence` in
  the execution checkout, beside the slice clock's own record. It is
  uncommitted, outside runner output directories, and removed with a retired
  worktree.
- **Run record:** `<log>.run.json`, written by `run`. `--log` and
  `--exit-file` stay as they are; the guidance tells callers to place them in
  the evidence location.
- **Payload reachability:** `src/install/open-dough-execution-payload.sh`
  explicitly lists references. Slice 2 adds `proof-evidence.md`; slice 3 adds
  `return-report.md`. Each runs the existing
  `Distribution/tests/installation/payload-declaration-links.sh` check so
  installed guidance cannot point to an omitted new reference. This is
  declaration maintenance, not an installation or release operation.
- **Native fixture consumers:** slice 3's moved report owner changes the
  guidance files and evidence location the existing delivery-evidence fixture
  retains. Update that fixture's explicit input hashes and existing artifact
  capture to keep only the checkout's Git evidence subdirectory, without
  copying Git state or adding an adapter. Baselines without the new files or
  evidence directory remain valid. Prove capture through deterministic helper
  observations, including survival after fixture cleanup; no paid/native run.

**Planned reorganization.** `delegation.md` is 248 lines and
`executable-proof.md` 250, at the
[file-size check](../../../Distribution/src/skills/dough-post-change-refactor/references/refactor-checks.md#file-size)
limit of 250.

- `delegation.md`: slice 3 moves its section "Return a targeted report with
  focused proof" into `references/return-report.md`, one concept per file.
  `delegation.md` keeps a one-paragraph pointer. Callers to repoint:
  `wrap-up.md` line 115 and the "Before first implementation delegation" row
  of the read table in `SKILL.md`. Slice 2 adds at most two lines to
  `delegation.md` before that.
- `executable-proof.md`: slice 2 rewrites wording inside the existing
  "Retain the host…" paragraph of "Choose expensive proof before launch" to
  link the artifact check, adding no line.

## Premises

Observed in this workspace at `ee6b1a66a` on 2026-11-17.

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| `run` writes only the log and exit file | slice 1 extends `runThroughClock` | read `scripts/slice-clock-run.mjs` whole (71 lines) | it opens `--log`, writes `--exit-file` last, reports `exitStatus`, `log`, `exitFile`; no command or revision is kept |
| the clock's Git path lies outside the worktree's files | slices 1–2 place evidence there | `git rev-parse --git-path open-dough/slice-clock` | `<main>/.git/worktrees/<name>/open-dough/slice-clock` |
| the return contract has one linking consumer | slice 3 moves the section | `grep -rn "return-a-targeted-report" Distribution dashboard docs` | only `wrap-up.md:115` |
| no test reads the edited guidance files | slices 2–3 edit them | `grep -rln "delegation\.md\|oversized-slice\.md\|wait-for-proof\.md\|overdue-delegated" Distribution/tests dashboard/tests` | no match |
| the read table has room | slices 2–3 add reads to two rows | summed each row's sections as `read-budget.test.mjs` does | first delegation 24,473 bytes, return acceptance 12,706, of 30,000 |

Unverified remainder: whether a worktree's Git directory is writable on every
host sandbox. The slice clock already writes there in every execution, so the
same condition holds.

## Outside-in proof

| Key example | Signal |
| --- | --- |
| 1 Large output | slice 1 test: after a failing `run`, the record gives exit status, literal command and revision; slice 2 guidance check: take the result from the record and read only the needed part of the log |
| 2 Runner cleanup | slice 2 guidance check: decisive artifact moved to the evidence location before another run, and the small run before an expensive diagnostic |
| 3 Still running | slice 1 test: while the command runs, the record exists with command, revision, log and exit file and no exit status; slice 2 guidance check: the overdue check reads it |
| 4 Compact hand-back | slice 3 guidance check: verdict contents and the report path |
| 5 Exposed gap | slice 3 guidance check: a promise absent from the verdict, or a missing report or record, is incomplete proof |
| 6 Changed revision | slice 1 test: the record carries the revision and the uncommitted-changes flag; slice 3 guidance check: acceptance compares them with the candidate |

Guidance checks prove structure, as
`acceptance-stopping-rule.test.mjs` does; they do not prove an agent follows
the text. The story's evaluation judges that from the next real execution.

**Local gates:** focused checks through
`bash scripts/test.sh Distribution/tests/skills/dough-execute-plan/<file>`,
`npm run --silent format`, and the staged lint. No slice needs a full local
run; if one is run, start it awake on AC power under `caffeinate -s -i`
([machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)).
Failures follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Ordered slices

### 1. A proof run leaves a record from launch
Type: Behavior
Status: done
Proof: new run-evidence cases in `Distribution/tests/skills/dough-execute-plan/slice-clock-run.test.mjs`
through the existing clock fixture, plus `slice-clock.test.mjs` for timing and
lifecycle regression. The existing file is 208 lines; keeping run evidence in
its own test module preserves that cohesive seam below 250 lines.
`read-budget.test.mjs` is unaffected.

Behavior: a slice is running in a checkout → `slice-clock.mjs run --log L
--exit-file E -- <command>` → `L.run.json` exists before the command ends,
holding the literal command and arguments, the checkout's `HEAD` revision,
whether it had uncommitted changes, the start time, and the resolved `L` and
`E`. When the command ends, the record gains the end time and exit status
before `E` is written, and the report adds the record's path. A failing
command and one ended by a signal record their status the same way. With no
slice running, `run` still writes the record.

### 2. Guidance keeps proof evidence where cleanup cannot reach it
Type: Behavior
Status: done
Proof: new `Distribution/tests/skills/dough-execute-plan/proof-evidence.test.mjs`
(guidance structure) and `read-budget.test.mjs`.

Behavior: an agent reaches a proof run → it reads `proof-evidence.md` from
the `run` paragraph, `wait-for-proof.md`, the overdue check, the
expensive-proof decision or its delegation brief → it finds the evidence
location and its literal command, the run record's fields and its use as the
continuation handle, the decisive-artifact rule with the small run before an
expensive diagnostic, and reading a large log through
[targeted retrieval](../../../Distribution/src/skills/dough-execute-plan/references/disposable-research.md).
The read table lists the new reference in the first-delegation row. The
overdue check names the run record as the retained command identity.

### 3. A hand-back is a short verdict over a report on disk
Type: Behavior
Status: done
Proof: new `Distribution/tests/skills/dough-execute-plan/return-report.test.mjs`
(guidance structure), `acceptance-stopping-rule.test.mjs` and
`read-budget.test.mjs`.

Behavior: an implementer finishes a slice → it follows `return-report.md` →
it writes the full report, with everything the return requires today, in the
evidence location, and returns a verdict: each slice promise with its
observation location and result or its named gap, changed paths, run records,
stops and consequential learnings, and the report path. A coordinator at
[proof acceptance](../../../Distribution/src/skills/dough-execute-plan/references/wrap-up.md#accept-proof)
reads from the report and logs the parts its comparison needs, treats a
promise absent from the verdict or a missing report or record as incomplete
proof, and compares a record's revision and uncommitted-changes flag with the
candidate. The section move in [Architecture](#architecture) is part of this
slice; every existing requirement of the return stays, word for word where it
moves. Completion markers stay verbatim.

### 4. Native acceptance inputs retain their original proof subject
Type: Behavior
Status: done
Proof: deterministic delivery-evidence fixture checks through the existing
runner; native input, identity and artifact-capture checks. No paid/native run.

Behavior: a current delivery-evidence fixture prepares a returned implementation
for acceptance under the installed compact-return contract → its existing
assembly and producer boundary emit a per-promise verdict, full original report
and actual run records in the Git evidence location → the coordinator can reach
the original observations or intentional gaps without a new transport gap
masking them. Preserve every scenario's source conditions, claim, selected proof,
expected acceptance/incompleteness and original full report content. Capture
actual producer commands from their first run through the installed clock;
invent no passing evidence, new rejection rule or missing-transport exemption.
Payload baselines without the new contract retain their original handoff shape.
Extend existing fixture owners, not a second scenario parser or adapter.

The bounded proof loop constructs the affected acceptance families, observes
verdict/report/record reachability and actual command metadata, and checks that
the original sufficient and gap signals remain. Reuse unaffected runtime,
guidance and retained-artifact proof from slices 1–3. A source-condition conflict
or genuinely unavailable producer observation stops only that case for
reassessment. This slice receives G3.

## Execution complete

Product advice: No product correction; retain the agreed evaluation on the next real planned execution after release.

## Current decisions and preparation assessment

- Evaluation is no slice: the story's keep, revise or stop judgment uses the
  next real planned execution after release.
- Execution refinement: retain slices 1–3 and add one Behavior slice for the
  reached native acceptance-input consumer. The old narrative-only handoffs
  would acquire transport gaps that mask their original proof subjects.
  Four slices remain within the eight-slice limit; no overrun or source-scope
  amendment. The shared model is the same verdict/report/run-record contract,
  applied through the existing fixture assembly and producer boundaries.
- Remaining slice-specific concerns: none identified in this review.

## Execution resume

- Mode: story-branch; publisher `dashboard-territory.local-open-dough`;
  agent Yuma-chan. Established owned workspace:
  `/Users/terryyin/git/open-dough/.worktrees/recover-decisive-verification-evidence-after-lar`,
  branch `codex/recover-decisive-verification-evidence-after-lar`.
- Starting revision `29400e56267c2b7fd8387c57e5978eb70662d5d3`;
  accepted Take `ace536b5eae3e657eb676afb40bb4f2af0b0461d` on `origin/main`
  and the execution branch. Ordinary increments target only
  `origin/refs/heads/codex/recover-decisive-verification-evidence-after-lar`.
- Replanning: preserve the existing planned authority. No scope amendment.
- Checkout setup and hook contract: [retained setup](execution-evidence.md#checkout-setup).
- CI: GitHub Actions `terryyin/open-dough`, verified `ci.yml` (CI), push-triggered;
  story-branch stream coordinator `yuma-683`, directory
  `/tmp/dough-ci-501/watch-zXkLEv`, PID 2984, session 45766, yielded cell `g800:13`.
  This coordinator's stream covers ordinary delivery; Take on trunk remains
  `pendingCi: unobserved`.
- Applicable authoring constraints: ADR 0003 (source edits remain Proposed until
  release), ADR 0006 (one shared rule owner and execution-project perspective).
- Accepted increments and comparison bases: [publications](execution-evidence.md#published-increments).

## Accepted execution evidence

See [accepted proof and refactor dispositions](execution-evidence.md).

## Story obligations

### G1. Consumer trace needs dispositions
Reported: slice 1 — "Acceptance inspected slice-1-consumer-trace.md and found every located consumer's Disposition blank."
Story clause: "The full report holds what the return requires today, including proof detail and the consumer-trace record."
Disposition: proved by slice 1: corrected slice-1-consumer-trace.md in the checkout's Git evidence directory; real CLI, exit-file recovery and fixture consumers use the passing clock-surface observations, unrelated metadata and installed copies are explicitly excluded.

### G2. Native fixture must retain moved evidence
Reported: slice 3 — "Consumer inspection found explicit input hashes omit the moved report owner and native artifacts omit Git-located full reports before fixture teardown."
Story clause: "A proof run's command, revision, result and decisive diagnostic stay recoverable after large output or runner cleanup"
Disposition: proved by slice 3: delivery-evidence-native-routing.sh observes installed/source guidance hashes, baseline absence, and report/record/log survival after actual fixture cleanup; capture copies only Git evidence, not Git state.

### G3. Legacy acceptance inputs acquire transport gaps
Reported: slice 3 — "Native acceptance fixtures supply narrative/proof blocks without full-report paths or run JSON; new transport gaps could mask the original missing-proof subject, including sufficient scenarios."
Story clause: "Which proof is required, the acceptance comparison and its stopping rule, and every required proof row"
Disposition: proved by slice 4: delivery-evidence-return-transport.sh constructs all nine acceptance families and legacy controls, asserts every expected promise row, original report content and gap/sufficient signals, authentic command/revision/terminal records and reachable paths; existing observer/discriminator checks also pass.
