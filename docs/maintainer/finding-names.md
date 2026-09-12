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
  - Source: <source project / supplied code; source occurrence locator>
  - Tool: <executing tool>
  - Model: <when supplied>
  - Open Dough release: <version | unknown | unreleased | modified; supplied revision/base>
  - Evidence: <compact decisive references>
  - Observed effect: <what the supplied record shows>
  - Inference: <qualified cause, cost, confidence, unknowns or counterevidence, when relevant>
```

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

## ODF-002 — Planless Taken work lacks closure evidence

- **Meaning:** An intentionally planless execution cannot supply the plan-based evidence required by its wrap-up closure contract.
- **Source mappings:** Open Dough / DD-002
- **References:** `DearDough.md`, DD-002; `519bb4a`; historical report with human-authorized one-off closure on 2026-09-10.

## ODF-003 — File-type assumptions skipped affected maintained proof

- **Meaning:** Treating runtime Markdown changes as having no applicable maintained tests misses an affected contract and delays detection until CI.
- **Source mappings:** Open Dough / DD-003
- **References:** `DearDough.md`, DD-003; release `0.3.8`; `8a1be3c`; `ci-supported-host-contract.test.mjs`; repair `2272133`.

## ODF-004 — Exact CI repair recovery preserved in-progress slice work

- **Meaning:** Pausing the active slice and preserving its exact stash allowed isolated CI repair and resumption with in-progress work intact; this is a positive recovery finding.
- **Source mappings:** Open Dough / DD-004
- **References:** `DearDough.md`, DD-004; release `0.3.8`; `8a1be3c`; CI run `34550693158`; repair `2272133`.

## ODF-005 — Installed and unreleased execution guidance competed for authority

- **Meaning:** Installed plan-required execution guidance and unreleased quick-execution guidance impose conflicting entry conditions during maintainer execution.
- **Source mappings:** Open Dough / DD-005
- **References:** `DearDough.md`, DD-005; `30a5026`; assessed source report at unreleased revision `533da34`, base `0.3.8`; installed and source `dough-execute-plan/SKILL.md`.

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
- **References:** Doughnut Project `DearDough.md`, DD-001; release `0.3.8`; `5ed11cd8e0`.

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

- **Follow-up:** queued, not resolved. [Revisit the premise and finish line before expanding corrective work](../../.planning/seeds/SEED-009-keep-only-externally-valuable-work.md#revisit-premise-and-finish-line). Selected on 2026-09-12 as a grouped response; finding identity and evidence remain distinct.

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

- **Follow-up:** queued, not resolved. [Revisit the premise and finish line before expanding corrective work](../../.planning/seeds/SEED-009-keep-only-externally-valuable-work.md#revisit-premise-and-finish-line). Selected on 2026-09-12 as a grouped response; finding identity and evidence remain distinct.
