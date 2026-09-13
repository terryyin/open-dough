# Open Dough finding names

Internal maintainer catalog for stable process-finding identities. Namespace:
`ODF-NNN`. This file is Open Dough source-only; it is not part of the released
payload.

Allocate a code only from supported supplied feedback. Empty scaffolding is
not a finding. Retain finding-relevant supplied evidence under its identity,
independently of source-project code adoption. Existing naming-only entries
remain valid; do not fabricate or backfill their history.

## Entry shape

Each allocated finding keeps these identity fields:

- **Meaning:** the concrete issue, not a wording or symptom label
- **Source mappings:** `source-project / local-code`, qualified by revision or
  occurrence locator when one source code spans more than one issue
- **References:** compact evidence or change locators used for the naming
  decision

The heading carries the code as `## ODF-NNN — <short title>`.

### Retained evidence

Under the same ODF heading, reuse the process log's occurrence shape, adding
source attribution:

```markdown
### Occurrences

- Execution: <stable execution identity>
  - Timestamp: <supplied ISO 8601 occurrence time with timezone | unknown>
  - Source: <source project / supplied code; source occurrence locator>
  - Tool: <executing tool>
  - Model: <when supplied>
  - Open Dough release: <version | unknown | unreleased | modified; supplied revision/base>
  - Evidence: <compact decisive references>
  - Observed effect: <what the supplied record shows>
  - Inference: <qualified cause, cost, confidence, unknowns or counterevidence, when relevant>
```

Retain the supplied occurrence timestamp on every new row; use `unknown` when
it is absent. Never substitute reconciliation time. Preserve timestamps on
replay and complete unknown timestamps only from newly supplied evidence;
timestamps do not change occurrence identity. Older rows without timestamps
remain valid and do not require migration on replay.

Preserve supplied execution and revision provenance; unknown stays unknown.
Do not substitute today's checkout, installed version, or reviewing tool. Keep
observations separate from inferences and retain consequential uncertainty.
If execution identity or executing tool is missing, retain the supplied evidence
and limitation as an **Evidence note**, without inventing a countable occurrence.
Naming references alone are not occurrence evidence.

Within an identity, the same source project and execution identify one
occurrence; source-code adoption or another symptom does not add one. A distinct
supported execution adds one row. Identical replay leaves the entry byte-identical;
merge only newly supplied decisive evidence into an existing row or note. When
missing provenance becomes available, complete that evidence rather than duplicate
it. Keep uncertain matches under their separately resolved identity. Rows are
the visible count; add no redundant total or inferred recurrence.

An optional **Follow-up** records an explicitly selected disposition or linked
story under [triage-retrospective-findings](../../.agents/skills/triage-retrospective-findings/SKILL.md).
Ranking alone leaves this catalog unchanged. Preserve identity fields, evidence,
and unrelated notes when recording authorized follow-up.

For an implemented response, optionally record **Status**, **Response**, and
**Released in** under that finding. Use “Addressed in source; effectiveness
unverified” until real-use evidence supports a narrower conclusion. Describe
what changed and retain the implementation commit and a recoverable
`commit:path` for a cleaned-up story or plan. These references support ongoing
finding assessment and survive story cleanup. Record the containing release
when known; pending release or feedback from an older installation does not
establish recurrence after the response. On new feedback, compare the supplied
release and failure mechanism before updating the status; silence is not proof
of effectiveness. Keep this maintainer-only; no project notification is required.

## Findings

## ODF-001 — Mixed execution changes obscure commit provenance

- **Meaning:** Committing an execution outcome together with separately described cleanup obscures that execution's review scope and attribution.
- **Source mappings:** Open Dough / DD-001
- **References:** `DearDough.md`, DD-001; `519bb4a`.

### Occurrences

- Execution: `SEED-004#show-stories-as-taken-during-execution @ 519bb4a`
  - Source: Open Dough / ODF-001; canonical `DearDough.md` occurrence
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: unknown
  - Evidence: `519bb4a` changes 147 files; the Taken outcome occupies eight
    files, while the commit subject describes only removal of Quick 040 and
    DearDough material.
  - Observed effect: The retrospective had to isolate the eight relevant
    patches instead of reviewing the commit as one uncontaminated execution.
  - Inference: Separate commits for independently completed work would make
    review scope, attribution, and recovery clearer.

## ODF-002 — Planless Taken work lacks closure evidence

- **Meaning:** An intentionally planless execution cannot supply the plan-based evidence required by its wrap-up closure contract.
- **Source mappings:** Open Dough / DD-002
- **References:** `DearDough.md`, DD-002; `519bb4a`; historical report with human-authorized one-off closure on 2026-09-10.

### Occurrences

- Execution: `SEED-004#show-stories-as-taken-during-execution @ 519bb4a`
  - Source: Open Dough / ODF-002; canonical `DearDough.md` occurrence
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: unknown
  - Evidence: The story records direct planless implementation and remains under
    **Taken**; `dough-story-wrap-up` requires the selected work's executable
    plan and retrospective-completion evidence.
  - Observed effect: The execution can be reviewed from the story, conversation,
    and commit, but it cannot satisfy the existing wrap-up closure contract.
  - Inference: Planless execution needs either an explicit one-off closure
    decision or a deliberately designed closure record; retroactively inventing
    a plan would misrepresent the execution.

Resolution: On 2026-09-10, the human authorized a one-off closure for this
execution and retained the existing plan-required wrap-up contract unchanged.

## ODF-003 — File-type assumptions skipped affected maintained proof

- **Meaning:** Treating runtime Markdown changes as having no applicable maintained tests misses an affected contract and delays detection until CI.
- **Source mappings:** Open Dough / DD-003
- **References:** `DearDough.md`, DD-003; release `0.3.8`; `8a1be3c`; `ci-supported-host-contract.test.mjs`; repair `2272133`.

### Occurrences

- Execution: `SEED-004#execute-in-worktree-and-merge-at-wrap-up @ 8a1be3c`
  - Source: Open Dough / ODF-003; canonical `DearDough.md` occurrence
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: 0.3.8
  - Evidence: Slice 2 changed the observer identity phrase in
    `ci-monitor.md`; runs `34550693158` and `34551244098` failed
    `ci-supported-host-contract.test.mjs`; repair `2272133` restored the stable
    phrase and all later branch runs passed.
  - Observed effect: Slice 4 paused, its work was stashed and restored, and a
    repair commit was required before execution could continue.
  - Inference: Selecting focused proof from file type instead of tracing the
    changed contract to maintained tests caused avoidable CI repair churn.

## ODF-004 — Exact CI repair recovery preserved in-progress slice work

- **Meaning:** Pausing the active slice and preserving its exact stash allowed isolated CI repair and resumption with in-progress work intact; this is a positive recovery finding.
- **Source mappings:** Open Dough / DD-004
- **References:** `DearDough.md`, DD-004; release `0.3.8`; `8a1be3c`; CI run `34550693158`; repair `2272133`.

### Occurrences

- Execution: `SEED-004#execute-in-worktree-and-merge-at-wrap-up @ 8a1be3c`
  - Source: Open Dough / ODF-004; canonical `DearDough.md` occurrence
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: 0.3.8
  - Evidence: Run `34550693158` triggered a safe Slice 4 pause; stash
    `38c6397e97c663307d721496998200c3da10768c` preserved its two paths while
    `2272133` repaired CI, after which the exact stash was applied and dropped.
  - Observed effect: Slice 4 resumed with its completed fixture proof and
    partial guidance intact; the older unrelated stash remained untouched.
  - Inference: Explicit writer quiescence, exact stash identity, and focused
    repair delivery formed a useful recovery boundary for worktree execution.

## ODF-005 — Installed and unreleased execution guidance competed for authority

- **Meaning:** Installed plan-required execution guidance and unreleased quick-execution guidance impose conflicting entry conditions during maintainer execution.
- **Source mappings:** Open Dough / DD-005
- **References:** `DearDough.md`, DD-005; `30a5026`; assessed source report at unreleased revision `533da34`, base `0.3.8`; installed and source `dough-execute-plan/SKILL.md`.

### Occurrences

- Execution: `SEED-004#drop-recently-done-from-product-backlog @ 30a5026`
  - Source: Open Dough / ODF-005; canonical `DearDough.md` occurrence
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: unreleased; revision `533da34`; base `0.3.8`
  - Evidence: The execution first loaded
    `.agents/skills/dough-execute-plan/SKILL.md`, which excluded seed execution,
    then inspected `src/skills/dough-execute-plan/SKILL.md`, which accepted an
    explicitly selected canonical story as one quick slice.
  - Observed effect: Execution required an extra authority reconciliation before
    the queued story could move to **Taken** and implementation could begin.
  - Inference: Maintainer dogfooding of unreleased workflow behavior needs an
    explicit source-versus-installed authority convention to avoid contradictory
    execution gates.

## ODF-006 — Oversized context reads obscure narrow execution inputs

- **Meaning:** Bundling broad skill references and planning documents into oversized reads can truncate required context and force avoidable rereading during a narrow execution.
- **Source mappings:** Open Dough / DD-006
- **References:** `DearDough.md`, DD-006; `0120ac3`.

### Occurrences

- Execution: `SEED-010#retain-reconciled-findings-in-open-dough @ 0120ac3`
  - Source: Open Dough / DD-006; canonical `DearDough.md` occurrence
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: Combined reads of SEED-010, four `dough-execute-plan` references,
    and later reconciliation, triage, and context material returned truncated
    output; `execution-decisions.md` and bundled retrospective documents were
    subsequently read again.
  - Observed effect: Required guidance was not fully visible in the original
    outputs, so the execution performed additional reads for the same
    single-slice work.
  - Inference: Selecting sections for concrete unresolved questions and sizing
    outputs to fit may reduce avoidable rereading without omitting required
    review or proof; net time and token cost were not measured, and no decisive
    match to an existing local issue was found.

## ODF-007 — Implementation agents fail to await their own background verification

- **Meaning:** An implementation agent that ends its turn before its own background test completes leaves the required pass/fail result unreported and shifts verification back to the coordinator.
- **Source mappings:** Doughnut Project / DD-001
- **References:** Doughnut Project `DearDough.md`, DD-001; release `0.3.8`; `5ed11cd8e0`; later report `a6fcddacad` at release `0.3.13`. Current guidance assessed: Open Dough `1088f77044cadaadfa6f40b40824ae1551d6270c`. Relevant `git log -p v0.3.8..1088f77` for `src/skills/dough-execute-plan/references/delegation.md` and `src/skills/dough-post-change-refactor/SKILL.md` shows no intervening correction to awaiting background verification; delegation still requires passing focused proof without an explicit background-command completion protocol. The supplied later execution demonstrates the same premature return; this does not establish an execution at today's revision.

### Occurrences

- Execution: `SEED-017 Story 1 / quick-099-receive-compatible-accepted-history / 5ed11cd8e0`
  - Source: Doughnut Project / DD-001; canonical `DearDough.md` occurrence
  - Tool: Claude Code
  - Open Dough release: 0.3.8
  - Evidence: The slice 4 implementation agent twice ended its turn while its
    Vitest run was still in progress, despite explicit instructions to wait for
    and report the result; the coordinator then ran the focused test directly
    and obtained a 95/95 pass.
  - Observed effect: Two extra coordinator round-trips were required before the
    slice could proceed to wrap-up.

- Execution: SEED-018 story 3 / quick/108-publish-notebook-edits-faster / a6fcddacad
  - Source: Doughnut Project / ODF-007; second canonical `DearDough.md` occurrence
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.13
  - Evidence: the slice 1 implementation agent's first two reports ("I'll
    wait for the background smoke-test run to finish before continuing." and,
    after one resend, "Waiting for baseline run 1 (1000/1000) to finish.")
    before a second resend produced its real final report; separately, the
    slice 2 post-change-refactor agent's first report ("I've queued a focused
    Cypress verification run ... and I'm waiting for it to complete before
    finalizing the report") even though that agent's initial delegation
    prompt already contained an explicit instruction not to stop and wait
    mid-verification.
  - Observed effect: three extra coordinator round-trips across the
    execution (two resends for the slice 1 agent, one for the slice 2
    refactor agent) before each returned a real final report with actual
    results.
  - Inference: giving the anti-pattern instruction directly in the initial
    delegation prompt (done for the slice 2 refactor agent) did not prevent
    the same pause-and-wait behavior from recurring, suggesting an inline
    instruction alone is not a reliable mitigation for this pattern.

## ODF-008 — Concurrent verification processes cause spurious test timeouts

- **Meaning:** Multiple resource-intensive verification processes running against one worktree can make passing tests exceed their timeout and create environmental failures that require solo reruns.
- **Source mappings:** Doughnut Project / DD-002
- **References:** Doughnut Project `DearDough.md`, DD-002; release `0.3.8`; `5ed11cd8e0`; solo reruns passing 95/95.

### Occurrences

- Execution: `SEED-017 Story 1 / quick-099-receive-compatible-accepted-history / 5ed11cd8e0`
  - Source: Doughnut Project / DD-002; canonical `DearDough.md` occurrence
  - Tool: Claude Code
  - Open Dough release: 0.3.8
  - Evidence: One test timed out while a second Vitest process ran concurrently;
    five tests later failed while another process overlapped a post-format run.
    Clean solo reruns after both events passed 95/95.
  - Observed effect: Two rounds of concurrency triage and solo reruns were
    needed before the suite result could be trusted.
  - Inference: The clean solo passes support resource contention rather than a
    product defect as the cause of these timeouts.

## ODF-009 — Deep managed worktrees exceed project-local socket limits

- **Meaning:** A host tool's deeply nested worktree location can make a checkout-relative Unix socket path exceed the platform limit and block isolated-system integration proof before product code runs.
- **Source mappings:** Doughnut Project / DD-003
- **References:** Doughnut Project `DearDough.md`, DD-003; release `0.3.11`; `d37290fac9`; `.claude/worktrees/107-verify-publication-receiver-in-bulk`; `scripts/sut-owner.mjs`.

### Occurrences

- Execution: `quick-107-verify-publication-receiver-in-bulk / d37290fac9`
  - Source: Doughnut Project / DD-003; canonical `DearDough.md` occurrence
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.11
  - Evidence: The 86-character worktree path plus the 28-character
    `/.sut.local.lock/owner.sock` suffix produced a 113-byte socket path;
    isolated-SUT bring-up failed with `listen EINVAL`, and
    `scripts/sut-owner.mjs` provided no path override.
  - Observed effect: The planned Cypress integration proof could not run from
    the execution worktree; only focused Node-level proof was obtained there.

## ODF-010 — Project wrappers mutate a supposedly frozen lockfile

- **Meaning:** A project command wrapper's frozen dependency installation can still drift a transitive lockfile pin, repeatedly introducing unrelated changes into verification and commit workflows.
- **Source mappings:** Doughnut Project / DD-004
- **References:** Doughnut Project `DearDough.md`, DD-004; release `0.3.11`; `d37290fac9`; `pnpm-lock.yaml`; `@biomejs/biome` 2.5.12 to 2.5.13.

### Occurrences

- Execution: `quick-107-verify-publication-receiver-in-bulk / d37290fac9`
  - Source: Doughnut Project / DD-004; canonical `DearDough.md` occurrence
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.11
  - Evidence: `./scripts/run.sh` invoked `pnpm --frozen-lockfile --silent
    install`, after which the same `@biomejs/biome` 2.5.12 to 2.5.13 lockfile
    drift appeared following isolated-SUT attempts, the SUT healthcheck, and
    `pnpm format:changed`, without a `package.json` change.
  - Observed effect: Three extra inspect-and-revert steps were required to keep
    the unrelated lockfile diff out of the commit.

## ODF-011 — Pre-satisfied test seams hide provisioning-order defects

- **Meaning:** Boundary tests that inject an already-satisfied provisioning precondition can bypass the side effect that establishes it and conceal incorrect production call ordering until live integration proof.
- **Source mappings:** Doughnut Project / DD-005
- **References:** Doughnut Project `DearDough.md`, DD-005; release `0.3.12`; `be7234f7f2`; pre-fix `47df168656`; fix `b0dad96aaa`; `scripts/e2e-runner.test.mjs`.

- **Status:** Addressed in source; effectiveness unverified.
- **Response:** Clarified that fixture-supplied allocation does not prove
  product-owned provisioning, while preserving narrower useful proof.
  Guidance change: `e710426`. Story 20 and its review are recoverable through
  `34ba340:.planning/quick/039-match-success-claims-to-proof/PLAN.md`.
- **Released in:** Pending for the guidance response; no containing release tag
  is present in this repository at recording time.

### Occurrences

- Execution: `SEED-015 Story 8 / quick-105-runner-owned-e2e-lifecycle / be7234f7f2`
  - Source: Doughnut Project / DD-005; canonical `DearDough.md` occurrence
  - Tool: Cursor
  - Open Dough release: 0.3.12
  - Evidence: Boundary tests injected a pre-resolved runtime target or used the
    primary checkout, while production resolved an isolated checkout target
    before starting the lifetime that provisions it. Live proof failed on the
    missing allocation; pre-fix tests had no fresh-provisioning-path case, and
    `b0dad96aaa` added that coverage and corrected the order.
  - Observed effect: Live proof failed once, required a defect fix and cache
    cleanup after a crashed build, and passed only after rerun; the boundary
    suite had remained green because its seam elided provisioning.

## ODF-012 — Load-sensitive failures lack a bounded reproduction path

- **Meaning:** Requiring independent reproduction without retaining the smallest observed load or ordering boundary can force repeated complete verdict runs without localizing an intermittent lifecycle failure.
- **Source mappings:** Pygardon / DD-001
- **References:** Pygardon `DearDough.md`, DD-001; `488dc39e0`; later decisive signal-dispatch reproducer and correction `2e06e144f`.

### Occurrences

- Execution: `.planning/quick/109-green-linux-arm64-release-check/PLAN.md at 488dc39e0`
  - Source: Pygardon / DD-001; canonical `DearDough.md` occurrence
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: unknown
  - Evidence: Exact full ARM64 runs moved failures among lifecycle boundaries
    while focused runs passed; a detached 20-iteration attempt retained no
    aggregate marker, and the earlier full-suite timeout retained no blocked
    owner/helper stacks. Later, `2e06e144f` captured a helper in
    `subprocess._try_wait` and reproduced the public stop failure with
    worker-directed SIGTERM.
  - Observed effect: Execution twice returned to story review and remained
    blocked until the signal-dispatch case gained a bounded reproducer.
  - Inference: Retaining the first failure's exact wait and process/pipe state
    would reduce repeated complete runs without weakening the no-speculation
    gate. The later correction resolves that reproduction gap, not every
    historical failure or the still-pending full release verdict.

## ODF-013 — Plan splits preserve an untested environment premise

- **Meaning:** Repeatedly splitting corrective work can preserve an untested infrastructure assumption and expand downstream implementation without revisiting the parent environmental choice.
- **Source mappings:** Pygardon / DD-002
- **References:** Pygardon `DearDough.md`, DD-002; `276caaf2e`; original contract `85d3352b3`; controlled Docker-init orphan probe.

### Occurrences

- Execution: `.planning/quick/107-checked-docker-release/PLAN.md at 276caaf2e`
  - Source: Pygardon / DD-002; canonical `DearDough.md` occurrence
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: The execution assumed orphan reaping without container init was
    an application obligation, then accumulated shared-ownership corrections
    across `c5b995ce7`, `f0734a747`, `4b2a9d609`, `4351e8b67`, `b6d24ac22`,
    and `3c3d3ddec`. A later pinned-image probe reaped the orphan with Docker
    init and retained a zombie without it.
  - Observed effect: Application adoption, PID attribution, and deadline work
    expanded across CI and IBKR while publication remained unimplemented.
  - Inference: Comparing the standard container lifecycle after the premise
    first failed would likely have reduced work, but the probe does not prove
    that init alone resolves every historical hang.

- **Status:** Addressed in source; effectiveness unverified.
- **Response:** Consolidated reassessment of the premise and smallest authorized
  outcome before corrective expansion into the shared execution decisions,
  also used before further plan subdivision. Preserves compatible proof and
  existing authority for necessary corrections. Guidance commit: `3446f62`.
  Story recoverable at
  `dbf5813:.planning/seeds/SEED-009-keep-only-externally-valuable-work.md`.
  ODF-013 and ODF-023 retain distinct causes and evidence.
- **Released in:** Pending; this closure does not establish real-use effectiveness.

## ODF-014 — Local failure proof was accepted as public completion proof

- **Meaning:** A bounded inner failure-policy test does not establish terminal completion at the public caller when additional waits and joins remain outside the tested bound.
- **Source mappings:** Pygardon / DD-003
- **References:** Pygardon `DearDough.md`, DD-003; release `0.3.6`, snapshot `f5fd66e60`; local proof `b6d24ac22`; later public-path proof `2e06e144f`; distinct from ODF-011's seam-elided provisioning issue.

- **Status:** Addressed in source; effectiveness unverified.
- **Response:** Clarified that an inner operation finishing does not prove
  public caller completion, and that missing proof leaves the promise incomplete.
  Guidance change: `e710426`. Story 20 and its review are recoverable through
  `34ba340:.planning/quick/039-match-success-claims-to-proof/PLAN.md`.
- **Released in:** Pending for the guidance response; no containing release tag
  is present in this repository at recording time.

### Occurrences

- Execution: `.planning/quick/109-green-linux-arm64-release-check/PLAN.md at 488dc39e0`
  - Source: Pygardon / DD-003; canonical `DearDough.md` occurrence
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: 0.3.6; tracked execution snapshot `f5fd66e60`
  - Evidence: `b6d24ac22` bounded a synthetic remaining-PID wait, while
    `CiCommand.force_stop` and helper/public waits still joined output readers
    outside that bound. The status response described unbounded cleanup as
    fixed. Later `2e06e144f` proved public stop/run settlement for the
    demonstrated signal-dispatch stall.
  - Observed effect: The focused deadline test passed while the plan still
    recorded a live public force-stop thread under the combined ARM64 control.
  - Inference: The original claim extrapolated beyond its proof. The later
    public-path evidence is intentionally narrower and does not certify every
    retained-child-pipe cleanup failure.

## ODF-015 — Diagnostic transport was not validated before failure reruns

- **Meaning:** Repeating expensive failure runs before confirming that the intended diagnostic probe is present and observable in the target runtime wastes the run without improving failure evidence.
- **Source mappings:** Pygardon / DD-004
- **References:** Pygardon `DearDough.md`, DD-004; `488dc39e0`; direct-main handoff `913e00a73`; successful `docker cp` diagnostic in `2e06e144f`.

### Occurrences

- Execution: `.planning/quick/109-green-linux-arm64-release-check/PLAN.md at 488dc39e0`
  - Source: Pygardon / DD-004; canonical `DearDough.md` occurrence
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: Two six-file native selections ran without the intended helper
    stack probe because a bind-mounted file remained invisible despite host
    permission changes; canonical-path validation also failed. The resumed
    investigation copied the probe with `docker cp` and obtained the frame.
  - Observed effect: Two failure runs produced no intended diagnostic evidence,
    and work paused before a simple transport alternative succeeded.
  - Inference: Probe-presence validation and an ordinary copy fallback would
    likely have avoided some repeated work; the mount failure's root cause and
    total time cost remain unknown.

## ODF-016 — Estimated active time cannot prove a hard limit

- **Meaning:** Approximate active-time estimates cannot establish compliance with a hard execution limit when the start, phase boundaries, waits, and final delivery boundary were not recorded consistently.
- **Source mappings:** Pygardon / DD-005
- **References:** Pygardon `DearDough.md`, DD-005; executions `488dc39e0` and `18fa721db`; timing record retained in `2e06e144f`.

### Occurrences

- Execution: `.planning/quick/109-green-linux-arm64-release-check/PLAN.md at 488dc39e0`
  - Source: Pygardon / DD-005; first canonical `DearDough.md` occurrence
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: `arm64_root_ownership` recorded no initial timestamp, while
    `ci_stop_only` estimated approximately 8–10 active minutes without a
    stopwatch; `2e06e144f` preserved that qualification.
  - Observed effect: Test durations existed, but the ten-minute active boundary
    and coordinator/review overhead could not be audited precisely.
  - Inference: The evidence proves neither overrun nor compliance; one
    parent-level elapsed record with waits separated would make stop decisions
    auditable.

- Execution: `.planning/quick/109-study-daily-stock-analysis/PLAN.md at 18fa721db`
  - Source: Pygardon / DD-005; second canonical `DearDough.md` occurrence
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: 0.3.11; tracked execution snapshot `22f07aa66`
  - Evidence: The plan recorded 08:06:10–08:20:07, but required context and
    official-doc research preceded the Taken commit at 08:05:43, while the
    final commit at 08:20:32 and push followed the recorded end.
  - Observed effect: The reported 14 minutes omitted work at both boundaries,
    although the available transcript still supports completion within the
    promised 30 minutes.
  - Inference: This is an evidence-boundary weakness, not a demonstrated
    overrun; an end-to-end clock must begin before required context work and end
    after final delivery when the promise covers both.

## ODF-017 — Certified installations omit required skill references

- **Meaning:** A manually maintained release manifest can omit a file required by an installed skill while the updater still certifies the incomplete installation as current.
- **Source mappings:** Pygardon / DD-006
- **References:** Pygardon `DearDough.md`, DD-006; modified revision `995bcbed2`, base `0.3.9`; Open Dough tag `v0.3.9` at `26cbba94f`; distinct from ODF-005's installed-versus-unreleased authority conflict.

- **Status:** Addressed in source; effectiveness unverified.
- **Response:** Clarified that success claims cover observed behavior, so
  version metadata alone does not certify a usable invocation. This guidance
  response is distinct from the missing-reference repair shipped in `v0.3.11`.
  Guidance change: `e710426`. Story 20 and its review are recoverable through
  `34ba340:.planning/quick/039-match-success-claims-to-proof/PLAN.md`.
- **Released in:** Pending for the guidance response; no containing release tag
  is present in this repository at recording time.

### Occurrences

- Execution: `.planning/quick/111-ibkr-companion-session-proof/PLAN.md at 2bc034868`
  - Source: Pygardon / DD-006; canonical `DearDough.md` occurrence
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: modified; revision `995bcbed2`; base 0.3.9
  - Evidence: `dough-execution-retrospective/SKILL.md` required
    `references/bounded-process-log.md`; tag `v0.3.9` contained that file but
    its `install.sh` omitted it from `managed_files`, and an ordinary update
    reported both local skill roots current without restoring it.
  - Observed effect: The retrospective could identify findings but could not
    perform its required bounded write until the release copy was restored
    explicitly in both roots.
  - Inference: Following intra-skill references in release completeness checks,
    or generating the manifest from the shipped tree, would prevent this
    false-current state more reliably than a hand-maintained list.

## ODF-018 — Credential handoffs were not validated at the user boundary

- **Meaning:** A credential handoff is not operable until the actual owner can see its prompt and the real non-root runtime user can write the mounted destination.
- **Source mappings:** Pygardon / DD-007
- **References:** Pygardon `DearDough.md`, DD-007; modified revision `995bcbed2`, base `0.3.9`; `2bc034868`; `/proof-config/production`.

### Occurrences

- Execution: `.planning/quick/111-ibkr-companion-session-proof/PLAN.md at 2bc034868`
  - Source: Pygardon / DD-007; canonical `DearDough.md` occurrence
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: modified; revision `995bcbed2`; base 0.3.9
  - Evidence: Two terminal prompts were invisible to the owner; the subsequent
    explicit command failed with `PermissionError` at
    `/proof-config/production`. Volume ownership was corrected and the saved
    settings were then verified as mode `0600`.
  - Observed effect: The owner repeated the handoff and encountered an avoidable
    permission failure before authentication could start.
  - Inference: A preflight as the actual container user against the exact mount
    would expose both visibility and ownership failures without involving
    credentials.

## ODF-019 — Untested host helpers cross destructive boundaries

- **Meaning:** Combining unvalidated host-specific evidence instrumentation with a state-changing operation can strand the operation at an unintended intermediate state when the helper is non-portable.
- **Source mappings:** Pygardon / DD-008
- **References:** Pygardon `DearDough.md`, DD-008; modified revision `995bcbed2`, base `0.3.9`; `2bc034868`; GNU-style `date +%s%3N` on macOS.

### Occurrences

- Execution: `.planning/quick/111-ibkr-companion-session-proof/PLAN.md at 2bc034868`
  - Source: Pygardon / DD-008; canonical `DearDough.md` occurrence
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: modified; revision `995bcbed2`; base 0.3.9
  - Evidence: A replacement wrapper used GNU-style `date +%s%3N` on macOS and
    failed after stopping the disposable application container but before its
    removal and recreation. A bounded check showed the companion and gateway
    unchanged and only the application stopped.
  - Observed effect: The proof paused in an intermediate lifecycle state and
    required diagnosis before the single planned replacement could continue.
  - Inference: Validate timing helpers separately or use portable monotonic
    measurement so evidence instrumentation is not on the critical path of a
    destructive step.

## ODF-020 — Execution starts without a committed planning handoff

- **Meaning:** Beginning delivery from uncommitted planning artifacts leaves the execution gate without an attributable plan boundary and forces a user ownership decision after the story has already been selected.
- **Source mappings:** Pygardon / DD-009
- **References:** Pygardon `DearDough.md`, DD-009; modified revision `995bcbed2`, base `0.3.9`; planning commit `05e1bc7d4`; Taken claim `93b18efcf`; distinct from ODF-001's mixed outcome commit.

### Occurrences

- Execution: `.planning/quick/111-ibkr-companion-session-proof/PLAN.md at 2bc034868`
  - Source: Pygardon / DD-009; canonical `DearDough.md` occurrence
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: modified; revision `995bcbed2`; base 0.3.9
  - Evidence: The selected plan, story refinement, and backlog update were
    uncommitted when execution began; delivery stopped for owner authorization,
    committed planning provenance as `05e1bc7d4`, and only then recorded the
    Taken claim in `93b18efcf`.
  - Observed effect: The ownership gate prevented ambiguous provenance but
    required an extra user decision before any proof slice could start.
  - Inference: Planning should arrive as a committed handoff or explicitly
    authorize and identify its handoff commit before the Taken claim.

## ODF-021 — Separate proof identities prevent false operational verdicts

- **Meaning:** Operational continuity proof must distinguish attachment, deliberate authentication, authenticated behavior, replacement identity, and cleanup so reachability or inherited authentication cannot masquerade as the promised lifecycle result.
- **Source mappings:** Pygardon / DD-010
- **References:** Pygardon `DearDough.md`, DD-010; modified revision `995bcbed2`, base `0.3.9`; `2bc034868`; distinct operational promise from ODF-014's public stop-settlement boundary.

### Occurrences

- Execution: `.planning/quick/111-ibkr-companion-session-proof/PLAN.md at 2bc034868`
  - Source: Pygardon / DD-010; canonical `DearDough.md` occurrence
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: modified; revision `995bcbed2`; base 0.3.9
  - Evidence: The slices retained application image and container identities,
    companion container/start/restart identity, gateway PID/start identity,
    redacted nonempty account-read outcomes, login count, and exact
    attempt-resource cleanup.
  - Observed effect: The positive verdict established one same-image
    application replacement with unchanged companion/gateway lifetime and no
    second login, while preserving redaction and cleanup scope.
  - Inference: The separated gates are a reusable positive pattern where
    connectivity, authentication, and lifecycle claims might otherwise be
    conflated.

## ODF-022 — Hosted publication reruns the source verification recipe

- **Meaning:** A hosted publication job that rebuilds and revalidates source instead of publishing the runtime artifact already verified by local CI can consume multiple release attempts without reaching the registry.
- **Source mappings:** Pygardon / DD-011
- **References:** Pygardon `DearDough.md`, DD-011; `f011af3b5`; Actions runs `34581123729`, `34581440519`, `34584210141`, and `34587708264`.

### Occurrences

- Execution: `.planning/quick/108-publish-install-checked-docker-release/PLAN.md at f011af3b5`
  - Source: Pygardon / DD-011; canonical `DearDough.md` occurrence
  - Tool: Cursor
  - Model: Grok 4.6
  - Open Dough release: unknown
  - Evidence: Tag jobs built a check image and reran pytest, frontend tests, and
    cucumber before building the runtime image. Four tagged attempts failed at
    checkout tag fetching, missing Docker, a recipe timeout after lengthy tests,
    and cucumber OCR dependencies; none reached GHCR.
  - Observed effect: Four tags produced no private image or GitHub Release, and
    the owner stopped GitHub as the frequent builder.
  - Inference: Publishing the locally verified runtime image as the artifact
    would avoid re-owning the source recipe in Actions.

## ODF-023 — Simplification retains an expanding closure condition

- **Meaning:** After an approach is abandoned in favor of simplification, moving dependencies into the active story and refining more execution steps does not authorize retaining an overbroad finish line that no longer matches the owner's smallest intended outcome.
- **Source mappings:** Pygardon / DD-012
- **References:** Pygardon `DearDough.md`, DD-012; `f011af3b5`; continuation `3f6302ec6..e3e2a25c4`; related to ODF-013's failure to revisit a parent decision, but the environment-premise and product-scope causes are distinct.

### Occurrences

- Execution: `.planning/quick/108-publish-install-checked-docker-release/PLAN.md at f011af3b5; local continuation 3f6302ec6..e3e2a25c4`
  - Source: Pygardon / DD-012; canonical `DearDough.md` occurrence
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: After the owner requested simpler local-CI ownership, the resumed
    range accumulated nine implementation and seven planning commits; local CI
    was implemented, ten publication slices remained, and cold fixture runs
    took 395 and 428 seconds before the owner challenged scope after more than
    two hours.
  - Observed effect: Engine integration and repeated refinements advanced while
    the Taken item's broad closure condition remained; the owner stopped
    execution without a published release.
  - Inference: Useful local-CI work does not authorize continued durable release
    orchestration. Preserve its proof and settle the smallest closure outcome
    before further implementation rather than extending the plan to fit it.

- **Status:** Addressed in source; effectiveness unverified.
- **Response:** Consolidated reassessment of the premise and smallest authorized
  outcome before corrective expansion into the shared execution decisions,
  also used before further plan subdivision. Preserves compatible proof and
  existing authority for necessary corrections. Guidance commit: `3446f62`.
  Story recoverable at
  `dbf5813:.planning/seeds/SEED-009-keep-only-externally-valuable-work.md`.
  ODF-013 and ODF-023 retain distinct causes and evidence.
- **Released in:** Pending; this closure does not establish real-use effectiveness.

## ODF-024 — Packaged demo invocation loses approved host isolation

- **Meaning:** An isolated manual bootstrap does not isolate a packaged tool whose nested invocation falls back to default host volumes and ports. Tests that always supply explicit safe overrides miss that fallback path.
- **Source mappings:** Pygardon / DD-013
- **References:** Pygardon `DearDough.md`, DD-013; Distinct from ODF-011: default host-state selection, not provisioning order; `aa4bec648`, release 0.3.12.

### Occurrences

- Execution: `.planning/quick/111-single-installation-release-update/PLAN.md`
  at `aa4bec648`
  - Source: Pygardon / DD-013; canonical `DearDough.md` occurrence
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.12
  - Evidence: slice 5 required bootstrapping installation A at the
    owner-selected `/Users/terryyin/pygardon`. Before touching the host, a
    pre-flight found an existing `pygardon-data` Docker volume with real
    contents and a stopped container from a concurrent session's unrelated
    work, both resolvable by Compose's *default* project/volume names because
    the target directory and the git checkout share the basename `pygardon`.
    The coordinator paused, asked the owner, and received an explicit
    isolation decision (distinct `--project-name`, `PYGARDON_DATA_VOLUME`, and
    host port). The manual bootstrap commands applied that isolation
    correctly. The first `docker run` of the packaged `updater` image's
    `release-updater-apply.py` (a separate process, not the manual `docker
    compose` commands) omitted the same `-e PYGARDON_DATA_VOLUME=... -e
    PYGARDON_HOST_PORT=...` flags; its internal `docker compose up` therefore
    resolved the Compose file's own `${VAR:-default}` fallbacks and briefly
    mounted the real `pygardon-data` volume. Caught within roughly 30 seconds
    by inspecting the running container's mounts; the container was stopped
    immediately. `tests/test_release_updater.py`'s three `_run_updater_*` test
    helpers always pass an explicit `env` dict into every `docker run` they
    construct, so this exact fallback path was never exercised by the 10
    passing automated tests that had already verified this same script.
  - Observed effect: real Docker state outside the git checkout was briefly,
    unintentionally connected to a differently-scoped invocation than the one
    the owner had just approved; one file in that volume shows a write from
    the incident window (routine scheduler bookkeeping, no external/trading
    call attempted or logged, confirmed by the owner as an installation not
    yet in real use).
  - Inference: a plan step that runs real commands against a fixed, named real
    host location should itself require the collision check and isolation
    parameters to be threaded through every process invocation of that step,
    not only the ones the plan text spells out; and a test harness that always
    supplies the safe explicit environment cannot serve as evidence that the
    default (no-override) path is safe. The immediate fix (env-var caveat) is
    now documented in `docs/docker-installation.md`.

## ODF-025 — Recorded implementation overruns bypass refinement

- **Meaning:** Execution continues after its own plan records a ten-minute implementation overrun, treating cohesion or a short test wait as permission to skip refinement.
- **Source mappings:** Pygardon / DD-024
- **References:** Pygardon `DearDough.md`, DD-024; Distinct from ODF-016: an acknowledged overrun ignored, rather than an unauditable timing estimate; `a640c7070` and `f70a3b976`, releases 0.3.13 and 0.3.14. Both supplied occurrences establish this first-use identity; no correction or current recurrence is inferred.

### Occurrences

- Execution: `.planning/quick/113-docker-ibkr-gateway-attention/PLAN.md` at
  `a640c7070`
  - Source: Pygardon / DD-024; canonical `DearDough.md` occurrence
  - Tool: Cursor
  - Model: Cursor Grok 4.6
  - Open Dough release: 0.3.13
  - Evidence: plan 113 slice 3 records that implementation overran the
    ten-minute hypothesis for API+UI+E2E of one operation, with cucumber wait
    ~16s; slice 4 records another implementation overrun whose named exception
    was the cucumber wait after a redirect-follow fixture fix. Both slices
    were committed (`667b5901a`, `b53a2aa7f`) without
    `dough-slice-plan-refinement`. No start timestamps were kept.
  - Observed effect: two successive System Settings Behavior slices were
    delivered after the plan itself called the implementation bound overrun.
  - Inference: the coordinator treated “still one operation” as permission to
    continue. The named-wait exception covered Docker/cucumber readiness, not
    unbounded implementation. Approximate agent duration cannot audit the
    clock (see ODF-016); the process gap here is continuing after the plan’s
    own overrun record.

- Execution: `5681ae751:.planning/quick/119-responsive-job-status/PLAN.md` at
  `f70a3b976`
  - Source: Pygardon / DD-024; canonical `DearDough.md` occurrence
  - Tool: Cursor
  - Model: Cursor Grok 4.6
  - Open Dough release: 0.3.14
  - Evidence: plan 119 slice 7 records implementation ~14 minutes versus the
    ten-minute hard stop, with pytest 0.67s explicitly not a wait exception;
    commit `6a228cc01` delivered the slice without
    `dough-slice-plan-refinement`. Remaining slices 8–9 were told to stop at
    ten minutes of setup.
  - Observed effect: the IBKR composite status projection shipped after the
    plan itself recorded the overrun.
  - Inference: staying one snapshot read explained cohesion, not permission to
    skip refine-after-ten-minutes. The later measurement slices did not need
    that overrun to proceed.

## ODF-026 — Component-wide formatting repeatedly dirties unowned files

- **Meaning:** Formatting selected Python changes invokes a whole-tree formatter, repeatedly dirtying unrelated files and requiring restoration before delivery.
- **Source mappings:** Pygardon / DD-025
- **References:** Pygardon `DearDough.md`, DD-025; Distinct from ODF-010: formatter scope, not dependency-install lockfile drift; `f70a3b976`, release 0.3.14.

### Occurrences

- Execution: `5681ae751:.planning/quick/119-responsive-job-status/PLAN.md` at
  `f70a3b976`
  - Source: Pygardon / DD-025; canonical `DearDough.md` occurrence
  - Tool: Cursor
  - Model: Cursor Grok 4.6
  - Open Dough release: 0.3.14
  - Evidence: every completed implementation wrap-up ran
    `nix develop -c pnpm format:changed` after Python edits;
    `scripts/quality_changed.sh` maps any `tests/*` path to the python
    component; `package.json` `python:format` is `ruff format .`.
    `tests/test_ibkr_companion_control.py` was repeatedly dirtied (blank-line
    collapse) and restored because `git diff -w` was empty. That file is
    absent from `1651a88bc..d6998ca5a`.
  - Observed effect: each slice delivery included an extra restore of an
    unowned test before commit.
  - Inference: whole-tree Python format is not selective formatting of the
    changed files. The restore rule prevented a bad commit; it did not remove
    the wrap-up churn.

## ODF-027 — Release qualification precedes release-base integration

- **Meaning:** Expensive exact-source release qualification starts before the intended main-based release target is resolved and integrated, making completed candidate proof non-authoritative.
- **Source mappings:** Pygardon / DD-026
- **References:** Pygardon `DearDough.md`, DD-026; Distinct from ODF-022: candidate-base ordering, not hosted rebuilding of a verified artifact; `d09f0a6ae`, releases 0.3.13–0.3.14.

### Occurrences

- Execution: `.planning/quick/112-automatic-tag-release-update/PLAN.md` at
  `d09f0a6ae`
  - Source: Pygardon / DD-026; canonical `DearDough.md` occurrence
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: 0.3.13 initially; 0.3.14 after main integration
  - Evidence: the original plan at `0b134124f` placed check, acceptance, and
    private publication before any main integration; candidate `7b36edb5c`
    completed those gates before the owner asked for a normal main-based `v2.5`.
    Main was merged in `f46c0c1f1` and qualified as `b6c9b3f67`; a later
    publication preflight then caught another main advance and correctly forced
    final candidate `d87cf1e03` through the gates again.
  - Observed effect: correctness was preserved, but multiple complete ARM64
    checks, production-image acceptances, and private candidate publications
    became non-authoritative evidence before the final release.
  - Inference: an initial release-base/ref preflight and integration step would
    have avoided most of that repetition; the later just-in-time preflight was
    still necessary and should be retained.

## ODF-028 — Preservation proof omits the physical predecessor store

- **Meaning:** Proof that one new installation preserves its own data is communicated as production preservation without identifying the physical predecessor store or proving migration from it.
- **Source mappings:** Pygardon / DD-027
- **References:** Pygardon `DearDough.md`, DD-027; Distinct from ODF-014 and ODF-021: physical store/predecessor identity is omitted, rather than public completion or authentication/lifecycle gates; `d09f0a6ae`, release 0.3.14.

### Occurrences

- Execution: `.planning/quick/112-automatic-tag-release-update/PLAN.md` at
  `d09f0a6ae`
  - Source: Pygardon / DD-027; canonical `DearDough.md` occurrence
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: 0.3.14
  - Evidence: slice 9 baselined the separately provisioned `pygardon-data`
    volume and slice 14 proved its settings/data survived A→B, but the completion
    report called those “production settings” without distinguishing the intact
    native `~/.config/pygardon/production` plane. Owner feedback then exposed
    that its established settings and roughly 22 GB had never been imported.
  - Observed effect: a technically correct Docker-volume continuity result was
    understood as native-to-Docker preservation, and the missing migration only
    became explicit at the final feedback boundary.
  - Inference: every preservation baseline should record installation identity,
    physical store path or volume, and predecessor relationship before the
    result is generalized in status communication.

## ODF-029 — Owner commit absorbs an unfinished shared-checkout slice

- **Meaning:** An owner catch-all commit in a shared checkout absorbs an unfinished slice before its refactor and formatting gates because the active ownership boundary is not visible.
- **Source mappings:** Pygardon / DD-028
- **References:** Pygardon `DearDough.md`, DD-028; Related symptoms to ODF-001, but the supplied mechanism is concurrent owner capture before delivery, not separately completed cleanup combined at delivery. Shared cause and continuity are unestablished; ODF-001 has no execution release from which to bound history. Separate identity, not a claimed recurrence after correction. Current guidance assessed: Open Dough `1088f77044cadaadfa6f40b40824ae1551d6270c`; supplied modified Pygardon revision `1a3afa16c`, base 0.3.14.

### Occurrences

- Execution: `.planning/quick/122-native-production-migration/PLAN.md` at
  `1a3afa16c`
  - Source: Pygardon / DD-028; canonical `DearDough.md` occurrence
  - Tool: Codex
  - Open Dough release: modified; revision `1a3afa16c`; base 0.3.14
  - Evidence: the plan's slice-1 execution learning and commit `1a3afa16c`; the
    owner confirmed that an unnoticed catch-all commit included all concurrent
    changes. That patch combines the unfinished `runtime_ocr` proof and execution
    metadata with unrelated Open Dough 0.3.15 guidance changes.
  - Observed effect: slice 1 landed before its independent refactor and formatter;
    execution needed an explicit delivery exception, and this retrospective had
    to review selected patches instead of one implementation range. No code or
    proof was lost.
  - Inference: the current-branch choice was authorized, but the active ownership
    boundary was not visible at commit time. A short pre-commit handoff or Story
    Branch isolation would reduce accidental mixed commits without forbidding
    deliberate in-place work.

## ODF-030 — One-off profiling becomes temporary durable runner code

- **Meaning:** A one-off measurement capture adds runner options and tests as durable infrastructure, then requires a closing slice solely to undo that measurement-only change.
- **Source mappings:** Doughnut Project / DD-013
- **References:** Doughnut Project `DearDough.md`, DD-013; Distinct from ODF-023: temporary measurement plumbing is introduced and reverted, rather than retaining an expanding product closure condition; `6162492745`, revert `3613029688`, release 0.3.12.

### Occurrences

- Execution: SEED-018 story 3 / quick/106-publish-large-notebooks-under-one-minute / 78c24f31bb
  - Source: Doughnut Project / DD-013; canonical `DearDough.md` occurrence
  - Tool: Cursor
  - Model: Cursor Grok 4.6
  - Open Dough release: 0.3.12
  - Evidence: slice 2 commit `6162492745` added forwarding in
    `scripts/e2e-runner.mjs` and `scripts/e2e-runner.test.mjs`; close commit
    `3613029688` restored those files to `78c24f31bb`; PLAN closing decision
    (2026-09-12) says the plumbing served measurement, not the kept flush change.
  - Observed effect: slice 2 included runner work beyond the property-index
    flush change; slice 4 existed only to undo that forwarding.
  - Inference: isolated tagged captures can use a documented one-off Cypress
    invocation or known baseline waits without changing the owned runner.

## ODF-031 — Large-fixture capture copies small-fixture timeouts

- **Meaning:** A large-fixture measurement command copies small-fixture timeout settings and omits known large-fixture waits, aborting setup before measurement.
- **Source mappings:** Doughnut Project / DD-014
- **References:** Doughnut Project `DearDough.md`, DD-014; New concrete command-sizing issue; `78c24f31bb`, slice 3 confirmation on 2026-09-12, release 0.3.12.

### Occurrences

- Execution: SEED-018 story 3 / quick/106-publish-large-notebooks-under-one-minute / 78c24f31bb
  - Source: Doughnut Project / DD-014; canonical `DearDough.md` occurrence
  - Tool: Cursor
  - Model: Cursor Grok 4.6
  - Open Dough release: 0.3.12
  - Evidence: PLAN.md "Slice 3 confirmation attempt (2026-09-12)" — Cypress
    failed at `cy.wrap()` waiting 6000 ms (`e2e_test/config/common.ts`) during
    `When I seed the representative publication baseline`; spec duration 8 s;
    no `timing.json` or profile directory. The same PLAN notes the awake large
    captures used `taskTimeout=43260000,defaultCommandTimeout=600000`. Retry
    with those waits then measured the 60 s miss.
  - Observed effect: one setup-only abort (~40 s runner lifetime) plus
    investigation before the authorized retry.
  - Inference: large-fixture Cypress waits were already in the profiling
    record; copying the small-path `--config` was enough to miss them.

## ODF-032 — Capture sizing omits full stack and fixture lifecycle cost

- **Meaning:** A multi-run large-fixture capture allowance is estimated from fast measured requests without accounting for the full owned-stack, fixture, and repeated scenario lifecycle.
- **Source mappings:** Doughnut Project / DD-015
- **References:** Doughnut Project `DearDough.md`, DD-015; Distinct from ODF-016 and ODF-025: an external-wait estimate miss, not a proved active-work overrun or incomplete execution clock. Agent durations include investigation, so the reported multiplier is only a qualified upper bound; `a6fcddacad`, release 0.3.13.

### Occurrences

- Execution: SEED-018 story 3 / quick/108-publish-notebook-edits-faster / a6fcddacad
  - Source: Doughnut Project / DD-015; canonical `DearDough.md` occurrence
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.13
  - Evidence: PLAN.md slices 1 and 2 both stated "3-5 additional minutes" for
    their owned-stack/three-capture portion. The delegated agents' reported
    `duration_ms` for the runs that performed a full three-capture 1,000/1,000
    set were 740,778 ms (~12.3 min, slice 1 implementation) and 793,959 ms
    (~13.2 min, slice 2 implementation) — roughly 2.5-3x the stated estimate
    for that single portion of work, before counting coordinator wait/resend
    time between checks.
  - Observed effect: none of the estimate misses triggered an oversized-slice
    stop or replan, since both slices still converged to a passing, in-budget
    result on the "focused implementation" portion; the miss was confined to
    the explicitly-excepted external-wait estimate. No rework resulted, but a
    future planner sizing a similar large-fixture E2E capture slice should
    expect the real external-wait portion to be several times a first guess
    based on the per-request timing alone.
  - Inference: `duration_ms` figures include the delegated agent's own
    investigation/verification time, not a clean measurement of "capture wait
    only," so the multiplier is a qualified upper-bound observation, not an
    exact ratio.

## ODF-033 — Review reads an unmerged checkout instead of delivered commits

- **Meaning:** Reviewing a separate execution branch through an unmerged coordinator working tree silently reads pre-change production code and creates an apparent contradiction with delivered proof.
- **Source mappings:** Doughnut Project / DD-016
- **References:** Doughnut Project `DearDough.md`, DD-016; Distinct from ODF-005: reviewed code revision mismatch, not installed-versus-source skill authority; `a6fcddacad`, actual code at `a05a66686c`, release 0.3.13.

### Occurrences

- Execution: SEED-018 story 3 / quick/108-publish-notebook-edits-faster / a6fcddacad
  - Source: Doughnut Project / DD-016; canonical `DearDough.md` occurrence
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.13
  - Evidence: during this retrospective, reading
    `backend/src/main/java/com/odde/donut/services/NotePropertyIndexService.java`
    from the main checkout's working tree (which had not merged
    `quick/108-publish-notebook-edits-faster`) returned the old
    pre-optimization implementation; a subsequent `git grep`/`git show
    a05a66686c:<path>` against the actual reviewed commit was needed to see
    the delivered code.
  - Observed effect: one avoidable re-read and a moment of apparent
    contradiction with the execution's own proof before the mismatch was
    traced to checkout/branch, not a regression.
  - Inference: reviewing an execution that ran in a separate worktree/branch
    should read files via `git show <reviewed-sha>:<path>` (or `git grep
    <ref>`) rather than the coordinator's own working tree, whenever that
    tree has not merged the branch under review.

## ODF-034 — CI observer ignores workflow branch triggers

- **Meaning:** CI observation validates workflow existence without checking target-branch trigger eligibility, then presents an impossible branch run as merely pending.
- **Source mappings:** Doughnut Project / DD-017
- **References:** Doughnut Project `DearDough.md`, DD-017; New concrete observer eligibility issue; `a6fcddacad`, `.github/workflows/ci.yml` main-only push trigger, release 0.3.13.

### Occurrences

- Execution: SEED-018 story 3 / quick/108-publish-notebook-edits-faster / a6fcddacad
  - Source: Doughnut Project / DD-017; canonical `DearDough.md` occurrence
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.13
  - Evidence: `.github/workflows/ci.yml` line 6-9 (`on: push: branches:
    [main]`); `gh run list --repo nerds-odd-e/doughnut --json headBranch,...`
    shows recent runs only for `headBranch: "main"`, none for
    `quick/108-publish-notebook-edits-faster` despite two pushes to it.
  - Observed effect: the CI observer ran for the full execution and was
    stopped at completion reporting `pendingCi: unobserved`, phrased (in the
    coordinator's own completion report) as CI merely not having finished
    yet, when in fact no CI run was ever going to happen on that branch.
  - Inference: the runtime-setup step "verify the branch has a
    push-triggered CI workflow" needs an actual trigger-condition check (e.g.
    inspecting the workflow's `on:` block for the target branch), not just
    confirming the workflow file/name resolve, or it will silently watch a
    branch that structurally cannot produce events.

## ODF-035 — Host worktree defaults violate branch and base requirements

- **Meaning:** A host worktree tool sanitizes the requested branch and defaults to the remote default-branch tip, omitting a required local-only Taken commit and violating the project branch convention.
- **Source mappings:** Doughnut Project / DD-018
- **References:** Doughnut Project `DearDough.md`, DD-018; Distinct from ODF-009: branch/base semantics, not socket path length; `691e7be961`, local Taken commit `aaabfcf552`, remote base `4b89109c99`, release 0.3.14.

### Occurrences

- Execution: SEED-018 story 5 / quick/112-publish-additions-with-simpler-title-check / 691e7be961
  - Source: Doughnut Project / DD-018; canonical `DearDough.md` occurrence
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.14
  - Evidence: `EnterWorktree(name: "quick/112-publish-additions-with-simpler-title-check")`
    returned branch `worktree-quick+112-publish-additions-with-simpler-title-check`
    checked out at `4b89109c99` (origin/main's tip), while local `main` was
    already one commit ahead at `aaabfcf552` (the backlog "Taken" transition
    commit made just before). The coordinator detected the mismatch via `git
    branch --show-current` / `git log --oneline`, called
    `ExitWorktree(action: "remove")`, then created
    `.worktrees/112-publish-additions-with-simpler-title-check` with plain
    `git worktree add -b quick/112-publish-additions-with-simpler-title-check
    aaabfcf552` under this project's own gitignored `.worktrees/` convention.
  - Observed effect: one full extra round-trip (create, inspect, remove)
    before the correctly named/based worktree existed; no lost work, since
    nothing had yet been written into the discarded worktree.
  - Inference: a coordinator following a project convention that both names
    execution branches literally and requires branching from a fresh
    local-only commit should create the worktree with plain `git worktree add`
    rather than `EnterWorktree`, whenever either constraint applies.

## ODF-036 — Completed delegated work leaves stale background watches

- **Meaning:** Per-command background watches outlive a delegated agent's completed report and emit redundant timeout notifications that consume coordinator turns.
- **Source mappings:** Doughnut Project / DD-019
- **References:** Doughnut Project `DearDough.md`, DD-019; Distinct from ODF-007: the agent supplied a complete final report; the problem is watch cleanup afterward, not returning before verification. `691e7be961`, release 0.3.14.

### Occurrences

- Execution: SEED-018 story 5 / quick/112-publish-additions-with-simpler-title-check / 691e7be961
  - Source: Doughnut Project / DD-019; canonical `DearDough.md` occurrence
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.14
  - Evidence: after the implementation agent (delegated task for this slice)
    returned its full final report (baseline/candidate benchmark numbers,
    proof log), the coordinator received seven further separate
    task-notifications for the same already-completed task, each one
    self-described in its own result text as a "stale monitor timeout" for one
    specific already-reported benchmark run (baseline runs 1-3, candidate runs
    1-3, and the small acceptance/rejection run), arriving individually over
    the following several minutes while a second delegated agent (the
    post-change-refactor pass) was concurrently running.
  - Observed effect: seven extra coordinator turns, each requiring inspection
    of the notification and a one-line "no action needed" acknowledgment,
    interleaved with the unrelated in-progress refactor-agent notification the
    coordinator was actually waiting on.
  - Inference: each notification's own text confirmed it added no information
    beyond the agent's already-received final report, so the cost was purely
    coordinator attention; a subagent that arms one watch per background
    command it launches, without stopping or consolidating those watches once
    it has already produced its own synchronous final report, generates this
    kind of post-completion notification noise.

## ODF-037 — Credential shell handoff fails in the owner's target shell

- **Meaning:** An owner-facing credential command contains invalid target-shell variable syntax and ambiguous token labels, requiring a failed paste and clarification before enrollment.
- **Source mappings:** Pygardon / ODF-018, only the `d09f0a6ae` occurrence at Open Dough 0.3.13; adopted as ODF-037. The earlier `2bc034868` occurrence remains ODF-018.
- **References:** Pygardon `DearDough.md`; enrollment `82d5280f8`. Related to ODF-018's handoff symptoms, but shell syntax/token naming differs from invisible prompts and non-root mount permissions; shared cause is not established. Relevant installed planning/execution history from `995bcbed2` through current Pygardon revision `3ed2c403774097b830f5432ab99104d9deaad70c` was inspected; changes `87396ecd4`, `67f460b2d`, and `1a3afa16c` do not establish a correction of the earlier handoff mechanism. Current Open Dough guidance assessed: `1088f77044cadaadfa6f40b40824ae1551d6270c`. Retained as a separate uncertain relationship, not a demonstrated recurrence after a fix.

### Occurrences

- Execution: `.planning/quick/112-automatic-tag-release-update/PLAN.md` at
  `d09f0a6ae`
  - Source: Pygardon / ODF-018 at `d09f0a6ae`; now ODF-037
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: 0.3.13
  - Evidence: the owner-facing shell handoff escaped underscores in a zsh
    variable and prompt, producing `read: not a valid identifier`; the owner then
    had to clarify whether the release-read and GHCR-read prompts referred to the
    same token before enrollment completed in `82d5280f8`.
  - Observed effect: credential creation required a failed paste and an extra
    clarification round even though the eventual two-token boundary was valid.
  - Inference: execute the exact shell handoff through the target shell with
    placeholder values, and label distinct credentials by permission and
    destination before asking the owner to paste secrets.
