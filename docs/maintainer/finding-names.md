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

Findings with released responses and no recorded post-fix recurrence are in the
[near-term watch list](near-term-watch-list.md). Their ODF codes remain allocated;
consult both lists when matching findings or allocating identities.

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

- **Follow-up:** Addressed in source; effectiveness unverified: [Return complete usable delegated handoffs](../../.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md#return-complete-usable-delegated-handoffs) — SEED-004 story 22, [plan 048](../../.planning/quick/048-complete-delegated-handoffs/PLAN.md) slice 1. Response: `src/skills/dough-execute-plan/references/delegation.md` now owns verification through its terminal result (explicit incomplete stop otherwise), linked from `dough-post-change-refactor` verify-edits; implementation commit `c8d2fd0` on `cursor/048-complete-delegated-handoffs`, unreleased (containing release not yet known). Effectiveness limit: source walkthrough only; no native-session evidence that premature returns stop recurring.

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

## ODF-027 — Release qualification precedes release-base integration

- **Meaning:** Expensive exact-source release qualification starts before the intended main-based release target is resolved and integrated, making completed candidate proof non-authoritative.
- **Source mappings:** Pygardon / DD-026
- **References:** Pygardon `DearDough.md`, DD-026; `d09f0a6ae`, releases 0.3.13–0.3.14.

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

- **Follow-up:** Addressed in source; effectiveness unverified. SEED-004 story 21 (closed; story and plan recoverable at `818a4f1:.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md` and `818a4f1:.planning/quick/047-cover-actual-user-outcome/PLAN.md`), slice 2. The `## Own executable proof` section of `src/skills/dough-story-refinement/references/planning.md` now directs identifying the installation, physical data store, and predecessor relationship for a preservation claim; distinguishing continuity within the same store from transfer out of another store; and surfacing an intended-target vs. deferred-migration conflict before dependent work rather than silently resolving it, without assuming migration authority or reporting a deferred migration as completed. Source commit `0dbff99`; not yet released. Original occurrence and unverified real-use effectiveness preserved; no release selected.

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

## ODF-034 — CI observer ignores workflow branch triggers

- **Meaning:** CI observation validates workflow existence without checking target-branch trigger eligibility, then presents an impossible branch run as merely pending.
- **Source mappings:** Doughnut Project / DD-017
- **References:** Doughnut Project `DearDough.md`, DD-017; New concrete observer eligibility issue; `a6fcddacad`, `.github/workflows/ci.yml` main-only push trigger, release 0.3.13. Later supplied occurrence `be43a2c1e5` at 0.3.15 retains the same branch-trigger eligibility failure. Current guidance assessed: `841488d3d8f0f546cea33fd6938580368ab7b10d`. Inspection of `git log -p v0.3.13..841488d3d8f0f546cea33fd6938580368ab7b10d` for `src/skills/dough-execute-plan/references/runtime-setup.md` and `ci-monitor.md` found only checkout binding (`5197cff`) in runtime setup; the Select CI section still requires a push-triggered workflow without an explicit trigger-condition inspection step. No intervening correction of this mechanism was found. This retains historical execution evidence, not a claim of an execution at the assessed revision.

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

- Execution: SEED-019 story 1 / quick/114-note-owned-memory-tracker-deletion / be43a2c1e5
  - Timestamp: unknown
  - Source: Doughnut Project / ODF-034; canonical `DearDough.md` occurrence
  - Tool: Cursor
  - Model: GLM 5.2
  - Open Dough release: 0.3.15
  - Evidence: `.github/workflows/ci.yml` triggers only on `push:
    branches: [main]`; `gh run list --branch 114-note-owned-memory-tracker-deletion`
    returned no runs despite seven pushes to that branch; the CI observer
    (started during slice 1 delivery) ran for the full execution and was
    stopped at completion reporting `pendingCi: unobserved`.
  - Observed effect: the CI observer watched a branch that structurally
    cannot produce CI events for the entire execution; the runtime-setup
    probe verified only that the workflow file/name resolved and the host
    bridge was ready, so the gap was not caught at setup.
  - Inference: same as the original ODF-034 finding — the runtime-setup
    trigger-condition check is still absent; the recurrence confirms the
    anti-pattern persists across releases.

## ODF-035 — Host worktree defaults violate branch and base requirements

- **Meaning:** A host worktree tool sanitizes the requested branch and defaults to the remote default-branch tip, omitting a required local-only Taken commit and violating the project branch convention.
- **Source mappings:** Doughnut Project / DD-018; Pygardon / DD-038
- **References:** Doughnut Project `DearDough.md`, DD-018; Distinct from ODF-009: branch/base semantics, not socket path length; `691e7be961`, local Taken commit `aaabfcf552`, remote base `4b89109c99`, release 0.3.14. Pygardon DD-038 (`e41447396`, 0.3.14; Taken `a939e963c`, remote base `3a859db15`) reports the same EnterWorktree remote-base default; branch sanitization is not reported there. Current guidance assessed: `841488d3d8f0f546cea33fd6938580368ab7b10d`. Relevant `git log -p v0.3.14..841488d3d8f0f546cea33fd6938580368ab7b10d` for `src/skills/dough-execute-plan/SKILL.md` preserves the claim-commit base requirement without adding an EnterWorktree default-base check; no intervening correction of that mechanism was found. Both reports concern 0.3.14; no current execution is inferred.

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

- Execution: `e41447396`:
  `.planning/quick/120-remove-dead-python-behavior/PLAN.md` (story wrapped up;
  first implementation commit `4559bef2c`)
  - Timestamp: unknown
  - Source: Pygardon / DD-038; canonical `DearDough.md` occurrence
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.14
  - Evidence: after committing the Taken-only transition (`a939e963c`) on
    `main`, `EnterWorktree` created a worktree from `origin/main` (`3a859db15`),
    one commit behind local HEAD; `git merge-base --is-ancestor a939e963c HEAD`
    in the new worktree returned false.
  - Observed effect: the worktree had to be exited and removed, then recreated
    manually with `git worktree add -b <branch> <path> HEAD` from the
    originating checkout, adding one avoidable round trip before slice work
    could start.
  - Inference: when a project's execution skill requires branching from a
    specific just-committed local ref, `EnterWorktree`'s default `fresh`
    baseRef is the wrong choice unless that ref is already pushed; the `head`
    baseRef setting or a manual `git worktree add` avoids this.

## ODF-036 — Completed delegated work leaves stale background watches

- **Meaning:** Per-command background watches outlive a delegated agent's completed report and emit redundant timeout notifications that consume coordinator turns.
- **Source mappings:** Doughnut Project / DD-019
- **References:** Doughnut Project `DearDough.md`, DD-019; Distinct from ODF-007: the agent supplied a complete final report; the problem is watch cleanup afterward, not returning before verification. `691e7be961`, release 0.3.14.

- **Follow-up:** Addressed in source; effectiveness unverified: [Return complete usable delegated handoffs](../../.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md#return-complete-usable-delegated-handoffs) — SEED-004 story 22, [plan 048](../../.planning/quick/048-complete-delegated-handoffs/PLAN.md) slice 3. Response: `src/skills/dough-execute-plan/references/delegation.md` now bounds owned watch lifetime to the verification obligation, requires accounting for unread evidence before retirement through supported controls, treats queued duplicates as stale without restarting verification, and preserves unrelated watches including the CI observer; implementation commit `bad3aae` on `cursor/048-complete-delegated-handoffs`, unreleased (containing release not yet known). Effectiveness limit: source walkthrough only; the finding's limit stands that not every late host notification is preventable.

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

## ODF-038 — No-op polling consumes notification-wait turns

- **Meaning:** A coordinator repeatedly issues no-op shell calls while awaiting asynchronous completion notifications, adding turns without obtaining state or accelerating completion.
- **Source mappings:** Pygardon / DD-039
- **References:** Pygardon `DearDough.md`, DD-039; Distinct from ODF-007 (premature worker return) and ODF-036 (stale watches after completion): these are coordinator-generated no-op calls during the wait. `e41447396`, release 0.3.14.

- **Follow-up:** Addressed in source; effectiveness unverified: [Return complete usable delegated handoffs](../../.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md#return-complete-usable-delegated-handoffs) — SEED-004 story 22, [plan 048](../../.planning/quick/048-complete-delegated-handoffs/PLAN.md) slice 2. Response: `src/skills/dough-execute-plan/references/delegation.md` now directs awaiting delegated results through the host's supported notification/wait/resume facility and bars no-op calls, with an explicit limitation report when no facility exists; implementation commit `89728cb` on `cursor/048-complete-delegated-handoffs`, unreleased (containing release not yet known). Effectiveness limit: source walkthrough only; no native-session evidence that no-op waiting stops recurring.

### Occurrences

- Execution: `e41447396`:
  `.planning/quick/120-remove-dead-python-behavior/PLAN.md` (story wrapped up;
  first implementation commit `4559bef2c`)
  - Timestamp: unknown
  - Source: Pygardon / DD-039; canonical `DearDough.md` occurrence
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.14
  - Evidence: across the 24-slice execution and its full-suite verification,
    dozens of consecutive `Bash({command: "true"})` calls were issued between an
    agent or background-command launch and its completion notification, each
    followed by a short "still waiting" text reply.
  - Observed effect: no additional information was gained from any of these
    calls; each added a full turn (tool call plus reply) with no effect on when
    the notification arrived.
  - Inference: ending the turn with a plain status message and no tool call is
    sufficient while waiting for an async notification; repeated no-op tool
    calls are pure overhead from this session's own execution habit, not a
    limitation of the notification mechanism.

## ODF-040 — Implementation delegation bypasses coordinator delivery review

- **Meaning:** A delegated implementer commits and pushes changes and plan delivery notes before the coordinator performs the required review and refactor gates.
- **Source mappings:** Pygardon / DD-041
- **References:** Pygardon `DearDough.md`, DD-041; Distinct from ODF-029: the implementer delivers its own slice prematurely, rather than an owner catch-all commit absorbing unfinished shared-checkout work. `903c7a079`, execution `b1c3b5c83`, release 0.3.16.

- **Follow-up:** Queued, not resolved: [Return complete usable delegated handoffs](../../.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md#return-complete-usable-delegated-handoffs) — SEED-004 story 22; [product backlog](../../.planning/PRODUCT-BACKLOG.md#backlog-list).

### Occurrences

- Execution: `.planning/quick/127-fast-service-and-packaged-tests/PLAN.md` at
  `b1c3b5c83`
  - Source: Pygardon / DD-041; canonical `DearDough.md` occurrence
  - Timestamp: 2026-09-13T22:00:20+08:00
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.16
  - Evidence: commit `903c7a079` on branch `claude/127-fast-service-and-packaged-tests`
    (slice 10's implementation task) contains both the test-file change and the
    plan-file delivery-note update in one commit, pushed by the agent itself;
    the delegation prompt for that task asked only for "the proof command
    output and a diff summary" and did not mention git operations.
  - Observed effect: the coordinator's review of that slice happened after the
    content was already committed and pushed rather than before, though the
    coordinator still independently verified the diff and ran a separate
    post-change-refactor pass on top; no incorrect content reached the branch.
  - Inference: an implementation-delegation prompt should say explicitly that
    the agent must leave changes uncommitted and must not run git commands,
    not rely on the standing delegation contract alone; adding that sentence to
    every subsequent slice's prompt in this same execution prevented a repeat
    for the remaining four slices.

## ODF-041 — Required pre-change baseline is deferred until final acceptance

- **Meaning:** Implementation starts before a plan-mandated full-suite baseline and environment record, leaving final before/after acceptance dependent on recovering the original measurement later.
- **Source mappings:** Pygardon / DD-042
- **References:** Pygardon `DearDough.md`, DD-042; Distinct from ODF-027: missing pre-implementation baseline, rather than qualifying a candidate before integration. `b1c3b5c83`, pre-slice commit `b119887fd`, release 0.3.16. The source claim that an advanced original checkout would make recovery impossible is an inference: these findings do not establish that recreating the recorded Git revision elsewhere would be impossible.

- **Follow-up:** Addressed in source; effectiveness unverified. SEED-004 story 21 (closed; story and plan recoverable at `818a4f1:.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md` and `818a4f1:.planning/quick/047-cover-actual-user-outcome/PLAN.md`), slice 3. The `## Own executable proof` section of `src/skills/dough-story-refinement/references/planning.md` now states that a pre-change observation (e.g. a baseline a later change would invalidate) is a prerequisite to the change it gates; reuse an adequate retained baseline with known revision and matching environment/selection conditions, otherwise obtain it before dispatching the dependent change; a missing or failed prerequisite stops only that dependent path and names the gap. A late-recovery reconstructed comparison is permitted only when revision and relevant conditions are demonstrably comparable, else the dependent claim remains unproved. `dough-execute-plan/SKILL.md` invokes this rule from the existing next-slice boundary before implementation delegation, on initial entry and resume, without a new startup audit. Source commit `b383f63`; not yet released. Original occurrence and unverified real-use effectiveness preserved; no release selected.

### Occurrences

- Execution: `.planning/quick/127-fast-service-and-packaged-tests/PLAN.md` at
  `b1c3b5c83`
  - Source: Pygardon / DD-042; canonical `DearDough.md` occurrence
  - Timestamp: unknown
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.16
  - Evidence: no `/tmp/pytest-service-optimization-before.xml` or baseline
    numbers exist anywhere in the plan's slice 1 text or delivery note; the gap
    was only discovered and reconciled during final acceptance, after all 14
    slices were already committed, by finding that the originating checkout
    (`/Users/terryyin/git/pygardon`, branch `main`) coincidentally still sat
    clean at the exact pre-slice-1 commit `b119887fd` (the Taken-transition
    commit), allowing a retroactive baseline run there: 2301 passed, 13
    skipped, 625.63s real.
  - Observed effect: the retroactive baseline succeeded only because of that
    coincidence. Had the originating checkout advanced to a later commit or
    been dirtied by unrelated work in the meantime, no faithful pre-slice-1
    full-suite baseline would have been recoverable at all, and final
    acceptance could not have reported a measured before/after gain.
  - Inference: run and record the plan-mandated pre-slice-1 baseline as a
    literal first action before any slice's implementation begins, not as
    something to reconcile opportunistically during final acceptance.

## ODF-042 — Coordinator filtering omits representation migration sites

- **Meaning:** A coordinator pre-filters field-reference search results before delegation, omitting sites from a representation slice and shifting their test repairs into the later field-removal slice.
- **Source mappings:** Doughnut Project / DD-037
- **References:** Doughnut Project `DearDough.md`, DD-037; First-use delegation coverage issue; `be43a2c1e5`, release 0.3.15. Distinct from ODF-011: incomplete delegated site inventory, not a pre-satisfied provisioning seam.

### Occurrences

- Execution: SEED-019 story 1 / quick/114-note-owned-memory-tracker-deletion / be43a2c1e5
  - Timestamp: unknown
  - Source: Doughnut Project / DD-037; canonical `DearDough.md` occurrence
  - Tool: Cursor
  - Model: GLM 5.2
  - Open Dough release: 0.3.15
  - Evidence: slice 6 (test-only representation) delegation listed five
    files with tracker `deletedAt` assertions but omitted
    `NoteControllerDeleteReduceToSourceTests` (whose
    `relation.getDeletedAt()` / `reloaded.getDeletedAt()` calls were tracker
    assertions the coordinator marked "need to check"); slice 7 (field
    removal) commit `be43a2c1e5` fixed that file plus one remaining
    `retained.getDeletedAt()` call in
    `NotebookGitProposalFolderCreationControllerTest` that slice 6 missed.
  - Observed effect: slice 7's implementation agent fixed two extra test
    files at compile time; no extra coordinator round-trip, but the later
    slice carried representation work the earlier slice was meant to own.
  - Inference: for a test-only representation slice that replaces references
    to a field removed in a later slice, delegate all grep matches and let
    the implementation agent classify each (Note vs tracker), rather than
    the coordinator pre-filtering; the compile-time safety net catches
    misses, but shifting that work to the later slice blurs the slice's
    intended boundary.

## ODF-043 — Proof serialization mismatches require report-only retries

- **Meaning:** Completed delegated work returns adequate substantive proof in a noncanonical schema, requiring coordinator-agent round-trips solely to reformat the handoff.
- **Source mappings:** Doughnut Project / DD-038
- **References:** Doughnut Project `DearDough.md`, DD-038; Distinct from ODF-007: proof is already complete and the extra handoff work is serialization only. `2be6138738`, slices 6 and 7, release 0.3.16.

- **Follow-up:** Queued, not resolved: [Return complete usable delegated handoffs](../../.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md#return-complete-usable-delegated-handoffs) — SEED-004 story 22; [product backlog](../../.planning/PRODUCT-BACKLOG.md#backlog-list).

### Occurrences

- Execution: SEED-009 story 29 / quick/115-web-note-trash-and-undo / 2be6138738
  - Source: Doughnut Project / DD-038; canonical `DearDough.md` occurrence
  - Timestamp: unknown
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: 0.3.16
  - Evidence: slice 6 required two report-only follow-ups after first returning
    custom Command/Result/Focused-proof fields and then title-cased YAML keys;
    slice 7 required one report-only follow-up after returning a custom report
    rather than the required proof block. Each final handoff described the same
    already-completed tests and changes.
  - Observed effect: three extra coordinator-agent round-trips produced no new
    implementation or verification evidence.
  - Inference: exact proof serialization is not reliably enforced at the agent
    boundary even when a literal template is supplied; structured validation
    before accepting the handoff would remove this clerical loop.

## ODF-044 — Overrun refinement repeats after all compatible work is complete

- **Meaning:** A hard-limit protocol parks completed implementation and proof for plan-only refinement, then repeats after refactoring without yielding smaller remaining executable work.
- **Source mappings:** Doughnut Project / DD-039
- **References:** Doughnut Project `DearDough.md`, DD-039; Distinct from ODF-025: the hard-limit path is invoked unnecessarily after completion, rather than ignored during continuing implementation. `2be6138738`, plan-only commits `ebd4839d26` and `b1a571154b`, release 0.3.16.

### Occurrences

- Execution: SEED-009 story 29 / quick/115-web-note-trash-and-undo / 2be6138738
  - Source: Doughnut Project / DD-039; canonical `DearDough.md` occurrence
  - Timestamp: unknown
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: 0.3.16
  - Evidence: plan 115 slice 9 records about 21–24 active minutes excluding
    suite waits; plan-only commits `ebd4839d26` and `b1a571154b` followed
    separate exact-work stash/restore cycles after implementation/proof and
    after post-change refactoring, while retaining the same single Behavior
    slice because all compatible work was complete.
  - Observed effect: two plan-only commits and two park/restore cycles changed
    the overrun record but produced no smaller executable remaining work.
  - Inference: the hard-limit path needs a stop condition for a fully completed,
    compatible outcome: record the overrun once during final plan update when
    no implementation or proof remains, while retaining escalation for actual
    unfinished work.

## ODF-045 — Dominant query purpose hides incompatible production callers

- **Meaning:** Consumer analysis assigns a shared query its dominant storage purpose instead of classifying each production caller, leaving an incompatible learning caller with trashed-note inclusion.
- **Source mappings:** Doughnut Project / DD-040
- **References:** Doughnut Project `DearDough.md`, DD-040; Distinct from ODF-042: production domain-purpose classification, rather than incomplete delegation of test representation sites. `2be6138738`, `LearningSessionService.record`, correction plan 116, release 0.3.16.

- **Follow-up:** Addressed in source; effectiveness unverified. SEED-004 story 21 (closed; story and plan recoverable at `818a4f1:.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md` and `818a4f1:.planning/quick/047-cover-actual-user-outcome/PLAN.md`), slice 1. The `## Own executable proof` section of `src/skills/dough-story-refinement/references/planning.md` now directs inspecting affected production call sites of a changed shared operation and deriving distinct obligations per caller (a method's name or dominant use does not settle every caller's requirement); incompatible purposes need an observation each, equivalent purposes may share sufficient evidence, and an unresolved domain purpose yields a precise question and stops the dependent obligation. Source commit `a13ccab`; not yet released. Original occurrence and unverified real-use effectiveness preserved; no release selected.

### Occurrences

- Execution: SEED-009 story 29 / quick/115-web-note-trash-and-undo / 2be6138738
  - Source: Doughnut Project / DD-040; canonical `DearDough.md` occurrence
  - Timestamp: unknown
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: 0.3.16
  - Evidence: plan 115's consumer table explicitly says
    `findLiveNotesByNotebookIdOrderByIdAsc` serves Git state loading and must
    retain legacy content inclusion; current caller search also finds
    `LearningSessionService.record`, which matches commissioned report titles
    from that query without a later `Note.isAvailable()` or tracker-activity
    check.
  - Observed effect: all planned suites passed while a trashed commissioned note
    remained gradeable by report; retrospective correction plan 116 was needed.
  - Inference: when one shared query has mixed production callers, consumer
    inventory must classify each call site by domain purpose rather than assign
    the method one dominant category; focused proof should cover every
    incompatible category.

## ODF-046 — Coordinator edits land in the originating checkout

- **Meaning:** A coordinator file-edit tool defaults to the originating checkout during worktree execution, placing a plan update outside the selected execution worktree and requiring reversal and reapplication.
- **Source mappings:** Doughnut Project / DD-041
- **References:** Doughnut Project `DearDough.md`, DD-041; Distinct from ODF-033 (reading stale reviewed code) and ODF-035 (creating a branch from the wrong base): this is an edit destination mismatch after worktree creation. `c94efe0af3`, release 0.3.16.

### Occurrences

- Execution: SEED-009 story 34 / quick/117-web-trash-navigation-recovery / c94efe0af3
  - Source: Doughnut Project / DD-041; canonical `DearDough.md` occurrence
  - Timestamp: 2026-09-13T19:07:00+08:00
  - Tool: Cursor
  - Model: GLM 5.2
  - Open Dough release: 0.3.16
  - Evidence: after slice 1 implementation returned, the coordinator edited
    `/Users/terryyin/git/doughnut/.planning/quick/117-web-trash-navigation-recovery/PLAN.md`
    (main checkout) instead of
    `/Users/terryyin/git/doughnut-worktrees/story-34/.planning/quick/117-web-trash-navigation-recovery/PLAN.md`
    (execution worktree). `git -C /Users/terryyin/git/doughnut status --short
    .planning/` showed the modification in main while the worktree's plan was
    clean; the coordinator reverted main with `git checkout -- <path>` and
    re-applied the edit in the worktree before staging. Slice 1's commit
    (c94efe0af3) was made at 2026-09-13T19:08:45+08:00, bounding the slip to
    just before it.
  - Observed effect: one revert and one re-application of the same one-line
    plan-status edit; no lost work and no contaminated commit, since the
    mismatch was caught by checking both checkouts' status before staging.
  - Inference: during Story Branch Mode, plan updates and other coordinator
    edits must target the execution worktree path explicitly; the editing
    tools do not bind to the worktree from an earlier `cd` used for shell
    commands. Verifying which checkout a file edit landed in (as done here)
    contains the slip to a cheap revert.
