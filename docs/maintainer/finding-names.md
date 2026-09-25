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

The heading carries the code as `## ODF-001 — Mixed execution changes obscure commit provenance

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

- Execution: `SEED-008#publish-shared-backlog-claims @ 06504a5`
  - Source: Open Dough / ODF-003; canonical DearDough.md occurrence
  - Timestamp: 2026-09-20T11:22:27+08:00
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.26
  - Evidence: Slice 2 (`8e6c41d`) extracted `SKILL.md`'s "Finish or stop"
    section, including the phrase "stop observers without waiting for CI",
    into a new `references/finish-or-stop.md` to satisfy the file-size
    refactor check. `ci-supported-host-contract.test.mjs` regex-matches that
    exact phrase across a fixed join of `SKILL.md` plus several
    `references/*.md` files, which was not updated to include the new file.
    CI runs `35486408307` (`8e6c41d`) and `35486945925` (`be94345`, built on
    top) both failed on this assertion; repair `7217999` added
    `reference("references/finish-or-stop.md")` to the test's join list.
  - Observed effect: two commits shipped failing CI in sequence, and both the
    refactor pass that performed the extraction and the coordinator's own
    proof acceptance for that slice missed it, since the diff and its rerun
    tests (`trunk-publication-local-main.test.mjs`,
    `ci-target-branch-worktree.test.mjs`) were both unaffected and green.
  - Inference: A second, independent recurrence of the same mechanism in the
    same test file: a file-size-driven Markdown extraction was judged for
    internal consistency and cross-reference correctness but not checked
    against the focused CI runtime suite that treats the extracted content as
    a fixed-file contract. Qualified: this project's own file-size refactor
    check does not name checking for such tests, so the omission is
    consistent with an unnamed check rather than a skipped one.

- Execution: `SEED-008#script-driven-ci-observation @ 02991a5`
  - Source: Open Dough / ODF-003; canonical DearDough.md occurrence
  - Timestamp: 2026-09-23T16:30:28+08:00
  - Tool: Cursor
  - Model: unknown
  - Open Dough release: modified; revision 02991a5ac64708f7ad7300b1ffee115647c66780; base 0.3.32
  - Evidence: Slice 1 (`02991a5`) rewrote `references/ci-monitor.md` for managed
    delivery and, under the 250-line bound, shortened the contract phrase to
    "The completion boundary below is the only routine CI wait", dropping
    `execution/review`. `ci-supported-host-contract.test.mjs` requires the full
    phrase. Earlier branch runs `35837536383` (`02991a5`) and `35840027069`
    (`493187c`) cancelled the `test` job after dashboard failure, so the
    contract miss surfaced only on `35842317799` (`ddcabcb`); repair `04791a7`
    restored the exact wording and that run's `test` job passed.
  - Observed effect: An avoidable repair commit and delayed detection of a
    guidance-contract regression while unrelated dashboard CI already failed.
  - Inference: Third recurrence against the same contract suite: prose rewrite
    for a delivery behavior change treated Markdown as free-form guidance rather
    than tracing changed phrases to `ci-supported-host-contract.test.mjs`.
    Fail-fast cancellation of `test` after dashboard failure further deferred
    discovery; qualified as amplifying, not inventing, the miss.

- **Assessment (2026-09-25):** Current guidance assessed at 7e17cba: the new modified 02991a5/base 0.3.32 occurrence repeats file-type-based proof omission. Earlier phrase repairs 2272133/7217999 repaired examples, not the general selection mechanism; no demonstrated correction separates this occurrence.

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

- **Status:** Response released; effectiveness unverified.
- **Response:** Consolidated reassessment of the premise and smallest authorized
  outcome before corrective expansion into the shared execution decisions,
  also used before further plan subdivision. Preserves compatible proof and
  existing authority for necessary corrections. Guidance commit: `3446f62`.
  Story recoverable at
  `dbf5813:.planning/seeds/SEED-009-keep-only-externally-valuable-work.md`.
  ODF-013 and ODF-023 retain distinct causes and evidence.
- **Released in:** 0.3.14 (`3446f62`; first containing tag `v0.3.14`). No
  later evidence establishes recurrence of this environmental-premise
  mechanism; the related ODF-023 reassessment response did recur on 0.3.18.


- **Assessment (2026-09-23):** The `3446f62` response and first containing v0.3.14 were reverified. No later environmental-premise reassessment with sufficient execution provenance establishes relevant use. All three current logs checked. Watch start and review-after remain unknown; no age-based retirement.

- **Assessment (2026-09-25):** Reverified 3446f62 and first containing v0.3.14 against the reassessment diff. No supported later exercise of environmental-premise reassessment. Watch start and review-after unknown; not eligible for retirement. All three current logs checked; execution releases are the supplied releases, not today's installed versions.

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
- **Source mappings:** Pygardon / DD-012; Pygardon / DD-048 (merged into the adopted ODF-023 source entry during the 2026-09-17 maintenance run)
- **References:** Pygardon `DearDough.md`, DD-012 and former DD-048; `f011af3b5`; continuation `3f6302ec6..e3e2a25c4`; `c4efd7b5c..77425e394`; checkpoint `a2ab5ea9a`; related to ODF-013's failure to revisit a parent decision, but the environment-premise and product-scope causes are distinct.

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

- Execution: `.planning/quick/132-faster-simpler-python-proof/PLAN.md @ c4efd7b5c..77425e394`
  - Timestamp: 2026-09-14T18:42:07+08:00
  - Source: Pygardon / DD-048; merged into canonical ODF-023 source occurrence
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.18
  - Evidence: The plan and `dough-test-optimization` required reassessment if
    the remaining experiments could not plausibly close the target gap. The
    slices-1-2 checkpoint measured 390.00s, still 90 seconds above target,
    while the five remaining experiments' recorded expected savings were
    visibly well below that gap. All five ran before final acceptance measured
    364.47s.
  - Observed effect: Five implementation/refactor/delivery cycles completed
    before the target shortfall was reconciled, although each retained
    independent local value.
  - Inference: This is the same failure to act on evidence that invalidates the
    remaining closure path, after the response was released in 0.3.14. The
    response did not prevent recurrence on 0.3.18.

- **Status:** Earlier response failed; revised response released, effectiveness unverified.
- **Response:** Consolidated reassessment of the premise and smallest authorized
  outcome before corrective expansion into the shared execution decisions,
  also used before further plan subdivision. Preserves compatible proof and
  existing authority for necessary corrections. Guidance commit: `3446f62`.
  Story recoverable at
  `dbf5813:.planning/seeds/SEED-009-keep-only-externally-valuable-work.md`.
  ODF-013 and ODF-023 retain distinct causes and evidence.
- **Released in:** 0.3.14 (`3446f62`; first containing tag `v0.3.14`). The
  Pygardon 0.3.18 occurrence above demonstrates recurrence after release.
- **Follow-up:** SEED-010 story 6 (closed; story and plan recoverable at
  `c856d52:.planning/seeds/SEED-010-learn-from-execution-retrospectives.md` and
  `c856d52:.planning/quick/055-stop-invalidated-optimization-paths/PLAN.md`),
  slice 1; delivered. Response: `dough-test-optimization`
  (`src/skills/dough-test-optimization/SKILL.md`) now records a decisive
  checkpoint's measurement, remaining-gap comparison, invalidated strategy
  assumption, and selected authorized decision as an explicit obligation in
  the plan's Current decisions before another dependent experiment is
  dispatched, and `dough-execute-plan`
  (`src/skills/dough-execute-plan/references/execution-decisions.md#reassess-before-extending-work`)
  enforces that recorded decision at its existing next-slice boundary without
  recomputing the remaining-gap comparison, which stays solely owned by
  `dough-test-optimization`; source commit `b39f967`. First containing release: 0.3.25 (tag v0.3.25, verified by containment and the two guidance diffs).


- **Assessment (2026-09-23):** The v0.3.14 response failed on the supplied v0.3.18 optimization execution. The revised `b39f967` response first ships in v0.3.25; no supplied later decisive optimization checkpoint establishes exercise of that revision. All three current logs checked. Watch start and review-after remain unknown; no age-based retirement.

- **Assessment (2026-09-25):** Reverified 3446f62/v0.3.14 and b39f967/v0.3.25 against both decision and optimization guidance. The first response failed on v0.3.18; no supported later decisive checkpoint proves use or failure of the revised response. Watch start and review-after unknown. All three current logs checked; execution releases are the supplied releases, not today's installed versions.

## ODF-024 — Packaged demo invocation loses approved host isolation

- **Meaning:** An isolated manual bootstrap does not isolate a packaged tool whose nested invocation falls back to default host volumes and ports. Tests that always supply explicit safe overrides miss that fallback path.
- **Source mappings:** Pygardon / DD-013
- **References:** Pygardon `DearDough.md`, DD-013; Distinct from the historical provisioning-order issue: default host-state selection; `aa4bec648`, release 0.3.12.

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

- Execution: SEED-031 story 1 / quick/147-resolve-deleted-failure-reports
  - Source: Doughnut / ODF-034; canonical DearDough.md occurrence
  - Timestamp: 2026-09-18, ~20:00–22:00 +08:00 (all four slice deliveries)
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.25
  - Evidence: the CI observer's own diagnostic context reported
    `{"type":"CI_COVERAGE_UNAVAILABLE","repo":"nerds-odd-e/doughnut","branch":"worktree-147-resolve-deleted-failure-reports",...,"reason":"No CI attempt for pushed revision after 3 discovery polls."}`
    after every one of the four slice pushes to that execution branch; final
    `stop` call reported all four pushed SHAs as `"state":"uncovered"` or
    `"unchecked"`.
  - Observed effect: identical to the prior two occurrences — the observer
    ran for the whole execution watching a branch this repo's `ci.yml` cannot
    trigger CI for, and every single push repeated the same
    `CI_COVERAGE_UNAVAILABLE` diagnostic rather than the setup catching it once.
  - Inference: still unfixed as of release 0.3.25; the runtime-setup
    trigger-condition check named in the original finding would have avoided
    four repeated no-op discovery-poll cycles in this one execution alone.


- **Assessment (2026-09-21):** The v0.3.25 report is a third distinct execution. Relevant runtime-setup.md history through f79ad88 changes target binding and custom adapters, but does not add the reported trigger-condition inspection; this is continuity, not a failed released response.

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

- Execution: SEED-021 story 1 / quick/133-inbound-wiki-reference-nfkc-mismatch / f126e1bdd8
  - Source: Doughnut / ODF-035; canonical DearDough.md occurrence
  - Timestamp: unknown (session date 2026-09-17)
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.24
  - Evidence: `EnterWorktree(name: "inbound-wiki-nfkc-133")` created branch
    `worktree-inbound-wiki-nfkc-133` checked out at `877a988b59`
    (`origin/main`'s tip), while local `main` was already one commit ahead at
    `f8504e98f7` (the backlog "Taken" claim commit made just before). The
    coordinator detected the mismatch via `git log --oneline -3` /
    `git status` immediately after entering the worktree.
  - Observed effect: recovered in place with `git merge --ff-only f8504e98f7`
    inside the worktree instead of the full remove/recreate round-trip the
    prior occurrence used, since the worktree's branch was still a clean
    ancestor with no divergent commits of its own; no lost work or wasted
    worktree, but still an unplanned diagnostic step the tool's default
    should not have required.
  - Inference: same root cause as the original finding — `EnterWorktree`'s
    `baseRef: "fresh"` default still branches from `origin/<default-branch>`
    rather than local `HEAD`/the originating checkout's current commit, so any
    coordinator that commits a claim on the originating branch before calling
    `EnterWorktree` must independently detect and fast-forward past the gap;
    a `baseRef: "head"` default, or at least a documented reminder in
    dough-execute-plan's own execution-location guidance, would remove the
    need for this recurring manual check.


- Execution: SEED-028 story 1 / quick/140-admin-job-status-local-time / 5d89d2e286
  - Source: Doughnut / ODF-035; canonical DearDough.md occurrence
  - Timestamp: 2026-09-18 (session date)
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: unknown
  - Evidence: `EnterWorktree(name: "140-admin-job-status-local-time")`
    (no `/` in the requested name, so no sanitization applied this time)
    created branch `worktree-140-admin-job-status-local-time` at `e2c55efa75`
    (`origin/main`'s tip), while local `main` was already two commits ahead
    at `e39d945a48` (plan-write commit `5d89d2e286` plus the backlog "Taken"
    claim commit). Detected via `git merge-base --is-ancestor HEAD main` /
    `git log --oneline -3` immediately after entering the worktree.
  - Observed effect: recovered in place with `git reset --hard main` (the
    worktree branch had no commits of its own yet, confirmed a clean
    ancestor first) followed by `git branch -m` to rename off the
    `worktree-` prefix onto the project's literal `NNN-slug` convention; no
    lost work, one extra diagnostic-and-fix round trip.
  - Inference: same root cause as the two prior occurrences, now observed a
    third time with a literal (non-`/`-containing) requested name, confirming
    the base-ref gap is independent of the branch-name-sanitization half of
    this finding.


- Execution: quick/260920-frontend-proof-type-checking / 0d3804b28f
  - Source: Doughnut / ODF-035; canonical DearDough.md occurrence
  - Timestamp: 2026-09-19 (session date)
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: unknown
  - Evidence: `EnterWorktree(name: "260920-frontend-proof-type-checking")`
    (no `/` in the requested name) created branch
    `worktree-260920-frontend-proof-type-checking` at `419ea6e45b`
    (`origin/main`'s tip), while local `main` was already one commit ahead at
    `0d3804b28f` (the backlog "Taken" claim commit made just before). Detected
    via `git log --oneline -3` immediately after entering the worktree.
  - Observed effect: recovered in place with `git rebase main` (the worktree
    branch had no commits of its own yet, a clean ancestor); no lost work,
    one extra diagnostic-and-fix step.
  - Inference: fourth occurrence of the same root cause across four different
    plans/coordinators; continues to support fixing the tool's default base
    ref rather than relying on per-execution detection.


- **Assessment (2026-09-21):** The new v0.3.24 occurrence precedes v0.3.27 claim publication; the two other new execution releases remain unknown. v0.3.27 publishing claims before workspace creation may remove the local-only-claim condition, but does not establish that host branch-name sanitization or requested-base behavior is corrected. No post-v0.3.27 recurrence is claimed.

## ODF-038 — No-op polling consumes notification-wait turns

- **Meaning:** A coordinator repeatedly issues no-op shell calls while awaiting asynchronous completion notifications, adding turns without obtaining state or accelerating completion.
- **Source mappings:** Pygardon / DD-039
- **References:** Pygardon `DearDough.md`, DD-039; Distinct from premature worker return and stale watches after completion: these are coordinator-generated no-op calls during the wait. `e41447396`, release 0.3.14.

- **Follow-up:** Response released but ineffective for the observed recurrence. SEED-004 story 22 (closed; story and plan recoverable at `ce417d2:.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md` and `ce417d2:.planning/quick/048-complete-delegated-handoffs/PLAN.md`), slice 2. Response: `src/skills/dough-execute-plan/references/delegation.md` directs awaiting delegated results through the host's supported notification/wait/resume facility and bars no-op calls; source commit `89728cb`, first released in 0.3.18. Pygardon's later 0.3.18 execution repeated the same no-op wait and added a stale scheduled wakeup, so the response must be reconsidered.

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

- Execution: `.planning/quick/132-faster-simpler-python-proof/PLAN.md` (first implementation commit `c4efd7b5c`)
  - Timestamp: 2026-09-14T17:36:00+08:00
  - Source: Pygardon / ODF-038; second canonical `DearDough.md` occurrence
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.18
  - Evidence: While waiting on a hung baseline background run, the coordinator
    issued one `Bash({command: "true"})` placeholder and scheduled a five-minute
    wakeup even though the background command already delivered completion
    notifications. The later wakeup referred to superseded work.
  - Observed effect: One no-op turn and one stale wakeup required an additional
    explanatory reply without producing execution state.
  - Inference: This is the same coordinator-generated polling mechanism after
    `89728cb` was included in release 0.3.18; the added wakeup is a related form
    of the same avoidable wait polling.


- **Assessment (2026-09-21):** 89728cb first-containing tag v0.3.18 and the unchanged no-op-wait rule reverified. The same Pygardon v0.3.18 plan-132 report remains confirmed post-response recurrence; its replay adds no occurrence.

- **Assessment (2026-09-25):** 89728cb first ships in v0.3.18 and explicitly bars no-op waits; the retained Pygardon v0.3.18 report is a confirmed post-response recurrence. No newer demonstrated correction or watch start. All three current logs checked; execution releases are the supplied releases, not today's installed versions.

## ODF-040 — Implementation delegation bypasses coordinator delivery review

- **Meaning:** A delegated implementer commits and pushes changes and plan delivery notes before the coordinator performs the required review and refactor gates.
- **Source mappings:** Pygardon / DD-041
- **References:** Pygardon `DearDough.md`, DD-041; Distinct from ODF-029: the implementer delivers its own slice prematurely, rather than an owner catch-all commit absorbing unfinished shared-checkout work. `903c7a079`, execution `b1c3b5c83`, release 0.3.16.

- **Follow-up:** Existing-rule preservation assessed, not fixed by this story. SEED-004 story 22 (closed; story and plan recoverable at `ce417d2:.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md` and `ce417d2:.planning/quick/048-complete-delegated-handoffs/PLAN.md`), slice 4. Assessment: the explicit no-commit/no-push implementation assignment in `src/skills/dough-execute-plan/references/delegation.md` (present since before v0.3.16) was confirmed present and untouched after the story's purely additive edits; no new prohibition was added and no recurrence was observed in this execution (all four implementation agents returned uncommitted changes). This is an application/validation concern; effectiveness against recurrence remains unverified.

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


- **Assessment (2026-09-21):** Existing-rule preservation was not a corrective implementation. Keep active; no released new response or watch start is established.

- **Assessment (2026-09-25):** The earlier response preserved an existing no-publication rule rather than implementing a new fix. No whole-finding watch starts from that assessment. All three current logs checked; execution releases are the supplied releases, not today's installed versions.

## ODF-042 — Coordinator filtering omits representation migration sites

- **Meaning:** A coordinator pre-filters field-reference search results before delegation, omitting sites from a representation slice and shifting their test repairs into the later field-removal slice.
- **Source mappings:** Doughnut Project / DD-037
- **References:** Doughnut Project `DearDough.md`, DD-037; First-use delegation coverage issue; `be43a2c1e5`, release 0.3.15. Distinct from the historical pre-satisfied provisioning seam: incomplete delegated site inventory.

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

## ODF-051 — Refactor reports claim edits absent from the diff

- **Meaning:** A delegated refactor report claims dead dependencies were removed even though the returned diff still contains them, requiring coordinator inspection and a resumed correction.
- **Source mappings:** Doughnut Project / ODF-051 (already adopted in the source log)
- **References:** Doughnut Project `DearDough.md`, ODF-051; `febbd2d9bb`; corrected before `8d67cd6cff`.

### Occurrences

- Execution: `plan 100 cursor/100-receive-web-note-moves (SEED-009 story 25)`
  - Timestamp: 2026-09-15T13:52:00+08:00
  - Source: Doughnut Project / ODF-051; canonical `DearDough.md` occurrence
  - Tool: Cursor
  - Model: glm-5.2-high
  - Open Dough release: unreleased
  - Evidence: The slice 2 refactor return claimed three dead dependencies were
    removed from `RelationController`; `git diff` at `febbd2d9bb` showed the
    fields remained. The resumed agent removed them before `8d67cd6cff`.
  - Observed effect: The coordinator performed one resumed refactor exchange
    and reran affected proof before delivery.
  - Inference: Existing proof acceptance caught the inaccurate report before
    commit; whether another response would improve on mandatory diff inspection
    remains uncertain.

## ODF-052 — Cursor mailbox readiness is lost across worktree hook identity

- **Meaning:** A Cursor coordinator can receive a harmless CI mailbox receipt from an execution worktree without the host hook attaching `CI_MONITOR_READY`, so planned pushes remain unobserved.
- **Source mappings:** Doughnut Project / DD-050 (historical occurrence); Open Dough / DD-047
- **References:** Doughnut Project `DearDough.md` at `3c129ca`, DD-050; Open Dough `DearDough.md`, DD-047; `f7a150d`; response `4fa48f0`; release 0.3.24.

- **Status:** Addressed in source and released; effectiveness unverified.
- **Response:** The existing Cursor host hook now recognizes an execution
  worktree and its originating checkout as the same repository by their Git
  common directory while still rejecting unrelated checkouts. Source commit
  `4fa48f0`; story and plan recoverable from
  `cf4780d^:.planning/seeds/SEED-011-cursor-ci-observer-readiness.md` and
  `cf4780d^:.planning/quick/053-attach-cursor-ci-observation/PLAN.md`.
- **Released in:** 0.3.24 (`4fa48f0`; first containing tag `v0.3.24`).
  A relevant installation and native Cursor READY observation have not yet
  established a watch start.

### Occurrences

- Execution: `SEED-009 story 24 / quick/099-publish-existing-readme-edits / 20bac4cb5d`
  - Timestamp: unknown; bounded by `20bac4cb5d` at 2026-09-15T12:17:05+08:00
  - Source: Doughnut Project / DD-050; historical `DearDough.md` occurrence at `3c129ca`
  - Tool: Cursor
  - Model: GLM 5.2
  - Open Dough release: unknown
  - Evidence: Mailbox probe/start attempts returned no usable READY context;
    pushes `20bac4cb5d` and `19a53c39fc` closed as unobserved.
  - Observed effect: No CI monitoring covered either push.
  - Inference: The coordinator could not establish the host bridge from its
    execution surface; exact checkout-identity cause was not yet isolated.

- Execution: `SEED-004#guide-useful-manual-testing @ ed19f9f`
  - Timestamp: 2026-09-16T16:00:00+08:00
  - Source: Open Dough / DD-047; canonical `DearDough.md` occurrence
  - Tool: Cursor
  - Model: Cursor Grok 4.6
  - Open Dough release: modified; revision `1805b5a`; base 0.3.22
  - Evidence: A worktree probe printed `CI_OBSERVER` for
    `/tmp/dough-ci-501/watch-P9o15E`, but the originating-workspace hook did
    not attach `CI_MONITOR_READY`; pushes `ed19f9f`, `067b29f`, and `96822da`
    remained unobserved. Plan 053 later localized the mismatch to worktree vs.
    originating-checkout mailbox identity.
  - Observed effect: The complete planned execution had no CI observer.
  - Inference: This is the same bridge-readiness mechanism as Doughnut DD-050,
    now with the receipt and checkout mismatch evidenced.


- **Assessment (2026-09-23):** `4fa48f0` / v0.3.24 remains the concrete common-Git-directory response. No new native cross-worktree READY observation with adequate provenance was found. All three current logs checked. Watch start and review-after remain unknown; no age-based retirement.

- **Assessment (2026-09-25):** Reverified 4fa48f0/v0.3.24: same-common-directory receipt admission, not owner-hash normalization. ODF-103 is the latter, a distinct Claude managed-delivery mechanism repaired in 50b6d71/v0.3.38. No verified native Cursor exercise establishing a watch start; review-after unknown. All three current logs checked; execution releases are the supplied releases, not today's installed versions.

## ODF-054 — Delegated implementers edit coordinator-owned plans

- **Meaning:** Delegated implementation agents modify the active PLAN.md even though the coordinator owns plan status and evidence, creating avoidable re-ownership work before delivery.
- **Source mappings:** Doughnut Project / DD-056
- **References:** Doughnut Project `DearDough.md`, DD-056; `473550c16e`; range `a4507e5304..1c790376e4`; release 0.3.22.

### Occurrences

- Execution: `SEED-009 story 28 / quick/129-publish-trash-moves / 473550c16e`
  - Timestamp: unknown
  - Source: Doughnut Project / DD-056; canonical `DearDough.md` occurrence
  - Tool: Cursor
  - Model: Cursor Grok 4.6
  - Open Dough release: 0.3.22
  - Evidence: Delegated product and CI-repair work included PLAN.md edits across
    `a4507e5304..1c790376e4`; the coordinator re-applied or re-owned them before
    staging.
  - Observed effect: Extra edit/review traffic occurred, but no contaminated
    product commit was identified.
  - Inference: The ownership split is documented but not enforced at the
    delegated edit boundary.

## ODF-055 — Post-change refactors exceed the execution-leaf target

- **Meaning:** Post-change refactor passes are reported at roughly 12–25 active minutes despite the project's five-minute target and ten-minute finer-decomposition boundary.
- **Source mappings:** Doughnut Project / DD-057
- **References:** Doughnut Project `DearDough.md`, DD-057; `473550c16e`; release 0.3.22; elapsed evidence is coordinator-reported rather than per-pass measured.

### Occurrences

- Execution: `SEED-009 story 28 / quick/129-publish-trash-moves / 473550c16e`
  - Timestamp: unknown
  - Source: Doughnut Project / DD-057; canonical `DearDough.md` occurrence
  - Tool: Cursor
  - Model: Cursor Grok 4.6
  - Open Dough release: 0.3.22
  - Evidence: Coordinator process notes report 12–25 minute refactor passes;
    the plan records outcomes for slices 2, 4, 5, 7, and 8 without per-refactor
    elapsed measurements.
  - Observed effect: Refactor time was several times the leaf target while the
    product slices still completed.
  - Inference: Confidence is limited because per-pass timing is absent and the
    recorded backend-suite waits do not fully explain the reported range.

## ODF-058 — CLI reports lack assertions for their promised output

- **Meaning:** Tests assert exit codes and published bytes while leaving user-visible summary statements unproved and sometimes wrong.
- **Source mappings:** Open Dough / DD-056
- **References:** Current guidance assessed: Open Dough `f79ad88` (contains v0.3.27). One-sided reorder defect confirmed at b017cc5; corresponding report correction da64969, first contained in v0.3.26. This addresses the concrete report defect, not every future proof-selection omission.

### Occurrences

- Execution: `SEED-008#script-product-backlog-list-updates @ ff8987d`
  - Source: Open Dough / DD-056; canonical DearDough.md occurrence
  - Timestamp: 2026-09-18T17:12:49+08:00
  - Tool: Claude Code
  - Model: claude-opus-5
  - Open Dough release: 0.3.25
  - Evidence: `transitions()` in `product-backlog-merge.mjs` emits four summary
    lines. During slice 10 the coordinator found `changed the "## Near-future
    direction"` asserted nowhere; deleting that block left all 25 pre-existing
    tests passing, and slice 10 added assertions for both its presence and its
    absence. This retrospective then blanked the two remaining lines, `added
    "<id>" to "## <list>"` and `changed "<id>", now in "## <list>"`, and the
    full 76-test suite still passed; replacing `reportMerge`'s no-change branch
    text passed as well. Both mutations were reverted and the worktree left
    clean.
  - Observed effect: Three of the merge report's five outputs carry no
    assertion after ten delivered slices, including one introduced in slice 8
    and reviewed by two later slices.
  - Inference: Assertions followed the tests' attention — refusals, exit codes,
    published bytes — and the reported summary was treated as incidental.
    Qualified: the original review established missing proof, not a working
    defect. Follow-up review at `b017cc5` disproved the broader claim that the
    delivered report is correct: a real CLI merge of a one-sided queue reorder
    publishes the changed order while printing "neither changed the ancestor".
    `transitions()` omits order, so an empty report is not evidence of no change.
    This is additional evidence for the same execution and assertion gap;
    correction ownership is `.planning/quick/058-preserve-backlog-merge-intent/PLAN.md`.


- **Assessment (2026-09-23):** `da64969` / v0.3.26 repairs the report and adds assertions for all named outputs. No supplied later real merge-report observation establishes relevant use. All three current logs checked. Watch start and review-after remain unknown; no age-based retirement.

- **Assessment (2026-09-25):** Reverified da64969/v0.3.26 report and transition assertions. No supported later real merge-report observation establishes relevant use; watch start and review-after unknown. All three current logs checked; execution releases are the supplied releases, not today's installed versions.

## ODF-059 — Interrupted delegated edits return no usable handoff

- **Meaning:** A host-terminated refactor agent leaves changes without a report, requiring recovery from the actual diff and unresolved proof.
- **Source mappings:** Open Dough / DD-057; Doughnut / DD-062
- **References:** Current guidance assessed: Open Dough `f79ad88` (contains v0.3.27). Relevant delegation and refactor-return files have no changes from v0.3.24 through v0.3.25 or HEAD that add reportless-termination recovery. The v0.3.18 terminal-verification response covers agents returning early, not host termination before a return. No failed-fix claim is made.

### Occurrences

- Execution: `SEED-008#script-product-backlog-list-updates @ ff8987d`
  - Source: Open Dough / DD-057; canonical DearDough.md occurrence
  - Timestamp: unknown
  - Tool: Claude Code
  - Model: claude-opus-5
  - Open Dough release: 0.3.25
  - Evidence: Slice 10's refactor agent ended with status `failed` and summary
    "Agent stalled: no progress for 600s (stream watchdog did not recover)",
    its last output truncated mid-sentence. It occurred between the slice-10
    implementation return and commit `b75c3dc` (2026-09-18T19:31:24+08:00); no
    exact event time is recoverable. The worktree held a complete and coherent
    change: a fixture value relocated into the single test file using it, a
    `versionPath` helper, and a `saying(text)` collapse of eight repetitions.
  - Observed effect: The coordinator accepted the work by reading the diff hunk
    by hunk and re-running two mutations against the refactored tests rather
    than by report. Two questions the pass had been asked — anything it found
    unproved, and its judgement on the deferred 926-line test-file split —
    were never answered and remain open.
  - Inference: Qualified. The unproved report lines confirmed in DD-056 are the
    class of finding that pass was asked to surface; whether it had found them
    cannot be determined from the record.

- Execution: SEED-009 story 43 / quick/132-rebaseline-existing-notebooks / 301184431f
  - Source: Doughnut / DD-062; canonical DearDough.md occurrence
  - Timestamp: unknown (task-notification received 2026-09-17, exact time not
    captured; the error stated a session-limit reset at 4:50pm Asia/Singapore)
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.24
  - Evidence: task-notification for the post-change-refactor subagent reported
    `status: failed`, summary "Agent terminated early due to an API error:
    You've hit your session limit ... (error type rate_limit, HTTP 429)", with
    `result` showing its last action was "Now let's implement the shared
    helper in GitBundleTestReader." `git diff` in the execution checkout then
    showed `GitBundleTestReader.java` with two new unused imports
    (`PortableTreeEntry`, `ObjectLoader`, `StandardCharsets`) and no new method
    — the helper it had announced was never written.
  - Observed effect: the coordinator spent one extra investigation round
    (inspecting `git status`/`git diff` to reconstruct what the dead agent
    intended and how far it got) before deciding to complete the interrupted
    refactor directly rather than re-delegating, since a second delegation
    risked hitting the same session-wide rate limit immediately. No corrupted
    or lost work resulted; the partial edit was strictly additive (unused
    imports) and safe to build on.
  - Inference: neither the delegation contract nor the refactor skill's return
    contract names "the subagent's process was killed before it could report"
    as a case, so a coordinator has no documented default (retry once, revert
    the partial edit, or complete it directly) and must improvise from raw
    diff inspection every time this occurs.

- Execution: `SEED-021#identify-taken-work-owner` / plan 091, first related implementation commit `567f9b2`
  - Source: Open Dough / ODF-059; canonical DearDough.md occurrence
  - Timestamp: unknown (after the CI repair return, before commit `ff33cb8`
    at 2026-09-24T17:46:32+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: 0.3.37
  - Evidence: the CI-repair refactor agent's only notification said it had
    stopped with its own background work still running and had not reported;
    `ps` then showed no `node --test`, and `TaskStop` found no task. The
    coordinator kept waiting until the developer said "it seems to be staying
    here for quite some time."
  - Observed effect: repair `ff33cb8` shipped on the coordinator's own reruns
    without a refactor report (compare ODF-062); slice 6's refactor, told to
    run tests only in the foreground with timeouts, reported normally.

- **Assessment (2026-09-25):** Current guidance assessed at 7e17cba: v0.3.25..HEAD delegation/return history still provides no reportless host-termination recovery outcome. The v0.3.37 report adds a distinct execution; the v0.3.18 own-verification rule is not a demonstrated correction of this termination case.

## ODF-060 — New payload references omit required declarations

- **Meaning:** Adding a referenced source file without the matching delivery declarations creates an incomplete installable payload, discovered only in CI.
- **Source mappings:** Open Dough / DD-058; Pygardon / DD-073
- **References:** Current guidance assessed: Open Dough `f79ad88` (contains v0.3.27). Repair b6f9515 supplies the omitted identity.md declarations; first containing tag v0.3.26. Related historical certified-installation omissions had an actual installed false-current verdict; this occurrence was caught in branch CI before release certification. General declaration drift remains actionable. The retired ODF-017 was checked in `bc46832^:docs/maintainer/near-term-watch-list.md`: it additionally recorded a false-current updater verdict; the newly supplied Pygardon report does not report that verdict, so it remains with this declaration-omission identity.

### Occurrences

- Execution: `.planning/quick/058-preserve-backlog-merge-intent/PLAN.md @ a242412`
  - Source: Open Dough / DD-058; canonical DearDough.md occurrence
  - Timestamp: 2026-09-18T22:37:13+08:00
  - Tool: Claude Code
  - Model: claude-opus-5
  - Open Dough release: 0.3.25
  - Evidence: Slice 4 (`848f793`) added
    `src/skills/dough-product-backlog/references/identity.md` and two links to
    it from `dough-story-refinement/references/planning.md` and
    `dough-story-decomposition/references/seed-format.md`, without adding it to
    `managed_files` in `install.sh`, the file list in
    `src/install/open-dough-release-version.sh`, the `managed_files` in
    `tests/helpers/public-payload-fixture.bash`, or the two enumerations in
    `docs/installation-and-updates.md` that
    `tests/dough-update-guidance-payload.sh` holds the manifest against. CI run
    35357372158 failed on `tests/story-payload-update.sh`; the repair commit
    `b6f9515` was five one-line insertions.
  - Observed effect: One failed CI run, one pause-stash-repair-restore cycle,
    and a repair commit interleaved between two feature slices on the branch.
    `AGENTS.md` was consulted during the slice and its "Layout" section named
    only the source directory to edit.
  - Inference: Qualified. The four declaration sites are discoverable by reading
    `install.sh`, so the omission is consistent with guidance that names the
    edit location but not the declaration obligation; whether a reminder in
    `AGENTS.md` would have prevented it cannot be established from this record.


- **Response assessment (2026-09-21):** b6f9515 repairs the one omitted declaration in v0.3.26; it is not a demonstrated elimination of manually synchronized declaration drift. No general response watch is started.

- Execution: `.planning/quick/162-fresh-worktree-readiness/PLAN.md` (first implementation commit `f607c7575`)
  - Source: Pygardon / DD-073; canonical DearDough.md occurrence
  - Timestamp: 2026-09-21T04:20:38Z
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.27
  - Evidence: `.claude/skills/dough-execute-plan/SKILL.md`'s "## Finish or
    stop" section links `references/finish-or-stop.md`; `ls
    .claude/skills/dough-execute-plan/references/` lists `ci-monitor.md`,
    `ci-notify-codex.md`, `ci-notify-hosts.md`, `delegation.md`,
    `destructive-later-outcome-check.md`, `disposable-research.md`,
    `execution-decisions.md`, `execution-location.md`,
    `publication-rebase-conflict.md`, `publish-the-candidate.md`,
    `runtime-setup.md`, `trunk-publication.md`, and `wrap-up.md` only; a
    repository-wide `find . -iname "finish-or-stop*"` found no such file
    under either the `.claude/skills` or `.agents/skills` installed copies.
  - Observed effect: after all three planned slices delivered, the
    coordinator could not read the skill's own instructions for observer
    shutdown, completion-report markers, or the automatic-retrospective
    trigger, and instead inferred the intended sequence from the skill's own
    top-level description text ("with independent refactoring, delivery, and
    asynchronous CI repair"; "`--skip-retro` skips the automatic
    planned-execution retrospective") and from `ci-monitor.md`'s general
    shutdown guidance.
  - Inference: this is a packaging/installation gap in the currently
    installed Open Dough release (0.3.27) rather than a one-off; any
    planned-execution completion under this release hits the same missing
    reference and needs the same reconstruction.

- Execution: `.planning/quick/161-restore-resolved-configuration-access/PLAN.md` (first implementation commit `1b8de431a`)
  - Source: Pygardon / DD-073; canonical DearDough.md occurrence
  - Timestamp: 2026-09-21T04:43:49Z
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.27
  - Evidence: same `.claude/skills/dough-execute-plan/SKILL.md` "## Finish or
    stop" link to `references/finish-or-stop.md`; `ls
    .claude/skills/dough-execute-plan/references/` in this execution's
    checkout again lists the same thirteen files without
    `finish-or-stop.md`, and `find /Users/terryyin/git/pygardon/.claude/skills
    -iname "*finish*"` found none.
  - Observed effect: after this single-slice correction delivered (proof
    passed, refactor pass found no residue, formatted, committed, and pushed),
    the coordinator again had no authoritative instructions for observer
    shutdown or the completion-report markers step and again reconstructed
    intent from the skill's own top-level description and `ci-monitor.md`.
  - Inference: confirms DD-073's packaging/installation gap persists
    unchanged across executions on the same installed release; still no repair
    has landed.

- Execution: planless quick CI repair (implementation commit `3146c72bf`)
  - Source: Pygardon / DD-073; canonical DearDough.md occurrence
  - Timestamp: 2026-09-22T07:32:25+08:00
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: unknown
  - Evidence: `.agents/skills/dough-execute-plan/SKILL.md` again links the
    absent `references/finish-or-stop.md`; the installed references directory
    has no matching file.
  - Observed effect: completion sequencing again had to be reconstructed from
    the top-level skill, CI-monitor, retrospective, and wrap-up guidance.

- **Response assessment (2026-09-23):** `b6f9515`, first released in v0.3.26, declared only the earlier identity reference; it did not remove the general omission mechanism. `8e6c41d` later extracted finish-or-stop without its declaration, still absent in v0.3.27. The Pygardon v0.3.27 reports therefore retain this identity as continuing declaration failures after a file-specific repair, not reintroduction after a general correction. `128b404`, first containing tag v0.3.28, declares finish-or-stop and other migrated modules; Pygardon adoption `2320a171b` on 2026-09-22 restored that file. The third reported execution release remains unknown. Concrete missing files are repaired; prevention of the general authoring omission remains unverified, so no whole-finding watch starts.
- **Retained source detail:** Pygardon ownership review dated 2026-09-23 verified v0.3.27 source/manifest mismatch and classified the earlier failures as shared payload defects, while confirming current installed copies contain the restored file.

- **Assessment (2026-09-25):** b6f9515/v0.3.26 and 128b404/v0.3.28 repair named payload omissions. The retained v0.3.27 missing finish-or-stop reports follow the first file-specific repair; neither commit establishes general prevention. No whole-finding watch. All three current logs checked; execution releases are the supplied releases, not today's installed versions.

## ODF-061 — Shell assertions pass without enforcing their conditions

- **Meaning:** Bare shell assertions under the observed bash 3.2 errexit behavior silently pass locally and fail without diagnostics in Linux CI.
- **Source mappings:** Open Dough / DD-059
- **References:** Current guidance assessed: Open Dough `f79ad88` (contains v0.3.27). 8570064 adds an explicit diagnostic exit for the story-dependency assertion, first released v0.3.26; the reported cross-suite assertion problem is broader and is not established fixed by that one repair.

### Occurrences

- Execution: `.planning/quick/058-preserve-backlog-merge-intent/PLAN.md @ a242412`
  - Source: Open Dough / DD-059; canonical DearDough.md occurrence
  - Timestamp: 2026-09-18T23:13:21+08:00
  - Tool: Claude Code
  - Model: claude-opus-5
  - Open Dough release: 0.3.25
  - Evidence: `bash tests/story-payload-update.sh` exited 0 at the failing
    revision `848f793` on macOS while CI failed on the same revision, printing
    only `FAIL: tests/story-payload-update.sh` about 2.7s in. Reproduced
    directly: `bash --version` reports 3.2.57, and
    `set -euo pipefail; while IFS= read -r l; do [[ -f "/nope/$l" ]]; done < file`
    survives. A bash-5-semantics re-walk of the same fixture targets reported
    156 links checked, 12 unresolved, all on the undeclared file.
  - Observed effect: The defect reached CI despite a passing local run of the
    very test that owns it, and the CI failure carried no diagnostic, so
    classification needed the branch's run history and a manifest inspection
    rather than the log.
  - Inference: Qualified. This is the same family as DD-055 and DD-056 — a proof
    that passes while establishing nothing — but a distinct mechanism: not an
    empty selection or an absent assertion, a present assertion the local shell
    declines to enforce.
  - Correction during the same retrospective, from decisive new evidence: the
    condition is broader than the loop body first recorded. On bash 3.2.57 a
    failing `[[ ]]` does not trigger `set -e` in any context tested — inside a
    `while` body, inside a `for` body, inside an `if` body, and at top level —
    while `false`, `[ ]`, `test`, and `grep -q` all abort correctly in the same
    shell. The earlier loop-body framing was the first observed instance, not
    the rule. A survey of this repository then found 128 bare `[[ ]]` assertion
    lines across 27 shell test files, 13 of which sit inside a loop body. Every
    one of those assertions is therefore inert for any developer on macOS's
    system bash and enforcing only on the Linux runner's bash 5, so a local
    green run of the shell suite is not evidence that its `[[ ]]` assertions
    hold. The first occurrence note above is retained as written.

- Execution: `.planning/quick/060-gate-and-deliver-scripted-backlog/PLAN.md @ de7d819`
  - Source: Open Dough / DD-059; canonical DearDough.md occurrence
  - Timestamp: 2026-09-19T18:37:57+08:00
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.25
  - Evidence: `tests/install-ci-host-hooks.sh` exited 0 on every local run
    (this machine's default `bash`, macOS system 3.2.57) across two separate
    full-suite runs and a standalone run, while GitHub Actions' bash 5.2.21
    failed it deterministically twice on the same commit (`d2e394e`), with
    zero diagnostic output before the step's own generic exit-1 report.
    Reproduced directly: `bash -c 'set -euo pipefail; [[ "a" == "b" ]]; echo
    reached'` prints `reached` and exits 0 on `/bin/bash` here, but aborts
    correctly under a Homebrew-installed `/opt/homebrew/bin/bash` (5.3.20).
    The failing assertion itself was a real, previously-undetected defect in
    the test's own fixture (corrected in the same commit).
  - Observed effect: two additional full round-trip CI pushes (with
    temporary `-x` tracing, reverted afterward) were needed to locate the
    actual failing test, since local verification gave no signal anything
    was wrong.
  - Inference: Qualified. A second, independently-discovered instance of the
    same bash 3.2/5 `set -e` divergence, in a different test file — this is
    not a one-off. Using a real Homebrew-installed modern bash explicitly for
    local shell-test verification is now this session's own adopted
    practice, recorded separately as a durable lesson.


- **Response assessment (2026-09-21):** 8570064/v0.3.26 repairs one assertion site. The broader 27-file report and independent install-ci-host-hooks failure are not established resolved; no general response watch is started.

- **Assessment (2026-09-25):** 8570064/v0.3.26 explicitly fails the installed-link assertion. Its scope does not establish a correction of every shell assertion or the separate hook-fixture failure. No whole-finding watch. All three current logs checked; execution releases are the supplied releases, not today's installed versions.

## ODF-062 — CI repair delivery skips independent refactoring

- **Meaning:** The coordinator delivers an interruption-path CI repair through formatting and publication without the required independent refactor pass.
- **Source mappings:** Open Dough / DD-060
- **References:** Current guidance assessed: Open Dough `f79ad88` (contains v0.3.27).

### Occurrences

- Execution: `.planning/quick/058-preserve-backlog-merge-intent/PLAN.md @ a242412`
  - Source: Open Dough / DD-060; canonical DearDough.md occurrence
  - Timestamp: 2026-09-18T23:13:21+08:00
  - Tool: Claude Code
  - Model: claude-opus-5
  - Open Dough release: 0.3.25
  - Evidence: Repair commit `b6f9515` was formatted, staged, committed, pushed
    and registered with the observer, but no `dough-post-change-refactor` agent
    was spawned for it, unlike all six slice commits in the same execution.
    `references/ci-monitor.md` step 4 says "For a new repair, the coordinator
    runs wrap-up", and `references/wrap-up.md` "Deliver the change" step 1 is
    that refactor pass.
  - Observed effect: The repair added one line each to `install.sh` and
    `src/install/open-dough-release-version.sh`, which were both sitting at
    exactly 250 lines, taking them to 251 and past this project's 250-line
    refactor guidance. A refactor pass inspects file size for every file in the
    diff, so the crossing would have been surfaced at that point; it was instead
    found later by the retrospective.
  - Inference: Qualified. The repair path reads as an interruption to be
    recovered from rather than as an ordinary slice, which may make its delivery
    gates easier to shorten; the record shows the omission but not the reason.

- Execution: `.planning/quick/060-gate-and-deliver-scripted-backlog/PLAN.md @ de7d819`
  - Source: Open Dough / DD-060; canonical DearDough.md occurrence
  - Timestamp: 2026-09-19T18:37:57+08:00
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.25
  - Evidence: repair commit `de7d819` (fixing
    `tests/helpers/host-hooks-fixture.bash` for a real CI-only defect, see
    DD-059's matching occurrence) was formatted, staged, committed, pushed,
    and registered with the observer, but no `dough-post-change-refactor`
    agent was spawned for it — the coordinator instead ran
    `shellcheck`/`shfmt` directly. Unlike slices 7 and 8 in the same
    execution, both of which used a delegated refactor-pass agent.
  - Observed effect: `tests/helpers/host-hooks-fixture.bash` was already 430
    lines (a pre-existing violation, not caused by this repair) before the
    commit and grew to 448 through it; a refactor pass would have surfaced
    the file-size check regardless of the pre-existing violation, the same
    way it did in this issue's first occurrence. The gap was instead found
    later by this same retrospective.
  - Inference: Qualified. A second, independent instance of the exact
    mechanism this issue already names: repair-path delivery reads as an
    interruption to recover from, making its own delivery gates easier to
    informally shorten than an ordinary slice's.

## ODF-064 — Corrections after refactoring skip a renewed review

- **Meaning:** A post-refactor implementation correction is delivered without a further independent refactor pass; the delivery contract leaves this trigger unclear.
- **Source mappings:** Open Dough / DD-062
- **References:** Current guidance assessed: Open Dough `f79ad88` (contains v0.3.27). Relationship to ODF-062 is uncertain: this was a stated judgment on a tiny correction, not a CI-repair interruption. No defect is attributed to this omission; retain at low priority rather than infer harm.

### Occurrences

- Execution: `SEED-021#see-published-work @ d0a9495`
  - Source: Open Dough / DD-062; canonical DearDough.md occurrence
  - Timestamp: 2026-09-20T08:33:16+08:00
  - Tool: Claude Code
  - Model: claude-fable-5-1
  - Open Dough release: 0.3.26
  - Evidence: Commit `c0d0a91`. The slice 3 refactor pass returned
    `## REFACTOR COMPLETE` and a contradiction (see DD-061). The implementation
    agent then changed `repositoryPath` in `dashboard/src/sourceLink.ts` and
    two fixture rows. The coordinator inspected that delta itself, recorded the
    deviation in the plan and in its report, and spawned no second
    `dough-post-change-refactor` agent. `references/wrap-up.md` step 1 names
    one pass and is silent on a post-pass correction.
  - Observed effect: No defect is attributed to the omission; the delta was one
    guard and two test rows, and it removed a redundant check.
  - Inference: Possibly the same mechanism as DD-060 (an out-of-sequence change
    makes its delivery gate easy to shorten), but the trigger differs and here
    the omission was a stated judgment, so the match is uncertain and this is
    recorded separately.

- Execution: `SEED-026#auto-refresh-published-dashboard @ dcb0944`
  - Source: Open Dough / ODF-064; canonical DearDough.md occurrence
  - Timestamp: 2026-09-23T21:43:00+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.30
  - Evidence: Plan 084 slice 4, commit `7eda3d7` (timestamp is that delivery
    commit). The refactor pass returned `## REFACTOR COMPLETE` and reported an
    alert misstatement it did not fix. The coordinator itself changed
    `dashboard/src/publishedObservation.ts` and added a step to
    `dashboard/tests/auto-refresh-rate-limit.spec.ts`, proved it with a
    mutation, and delivered without a second refactor pass or returning it to
    an implementation agent. Slice 3 (`5cc80b0`) likewise delivered a
    coordinator-made `refresh.spec.ts` race fix after its refactor pass.
  - Observed effect: The post-pass behavior change and test change were
    reviewed only by the coordinator; the later retrospective then found
    `publishedObservation.ts` at 257 lines, over the refactor size limit.
  - Inference: Same gap as the first occurrence: `references/wrap-up.md`
    names one pass and is silent on post-pass corrections, so a coordinator
    fix is easy to deliver unrefactored. Qualified: the size overrun is one
    consequence observed; no defect is attributed.

- **Assessment (2026-09-25):** Current guidance assessed at 7e17cba: relevant wrap-up/delegation history from v0.3.26 retains the one-pass delivery sequence while adding proof acceptance rules; no demonstrated correction of the post-pass correction trigger separates the v0.3.30 occurrence. Retain one identity and the observed size consequence without inventing a product defect.

## ODF-065 — Dead CI workers remain reported as attached

- **Meaning:** Push receipts and host attachment messages outlive the observing worker, hiding lost coverage until shutdown.
- **Source mappings:** Open Dough / DD-063
- **References:** Current guidance assessed: Open Dough `f79ad88` (contains v0.3.27). ci-host-hook.mjs attachment uses the binding, not worker liveness; the v0.3.27 direct-entry change does not address that mechanism. ENOSPC as the cause of death remains inference.

### Occurrences

- Execution: `SEED-021#see-published-work @ d0a9495`
  - Source: Open Dough / DD-063; canonical DearDough.md occurrence
  - Timestamp: 2026-09-20T09:40:05+08:00
  - Tool: Claude Code
  - Model: claude-fable-5-1
  - Open Dough release: 0.3.26
  - Evidence: Mailbox `/tmp/dough-ci-501/watch-bx7k1Z`. The worker's last
    receipt writes are all at 2026-09-20T08:40:30+08:00; `c0d0a91` stayed
    `pending` although its GitHub run completed successfully. The data volume
    then filled (ENOSPC stopped slice 4 and the coordinator's own shell).
    Receipts for `e6ad710`, `53f6640`, and `1858a78` were written by
    `register-push` only and stayed `unchecked`. Every hook invocation kept
    adding "CI observer attached to this coordinator". `stop` returned
    `coverage.state: lost` at the timestamp above.
  - Observed effect: Three pushes had no CI observation while the coordinator
    believed they did. All of them passed when checked with `gh run list`, so
    nothing was missed this time.
  - Inference: Qualified. The worker most likely exited when the disk filled;
    the record shows when it stopped writing, not why. Neither `register-push`
    nor the hook checks that the recorded worker is still running.


- **Status:** Response released; effectiveness unverified.
- **Response:** `ci-host-hook.mjs` now checks the recorded worker's PID and exact
  spawned-command identity (read-only, never signaling) at both receipt
  attachment and the ordinary bindings-delivery loop, so a dead detached
  worker is reported lost — not reassuringly attached — at the next ordinary
  coordinator interaction, independent of another push, while a normal
  completed stop is never mislabeled as death. Source commit `8a7c770`, merged to `main`; plan recoverable at
  `1fd706e:.planning/quick/068-truthful-ci-observation/PLAN.md` (slice 1).
- **Released in:** 0.3.28; first containing tag v0.3.28, verified from implementation and tagged guidance/runtime diffs.

- **Assessment (2026-09-23):** No recorded later crash exercise establishes a watch start; ODF-089 is a normal terminal result, not a recurrence of worker-loss detection. Watch start and review-after: unknown; excluded from age-based retirement.

- **Assessment (2026-09-25):** Reverified 8a7c770/v0.3.28 worker-loss checks. New ODF-112 does not establish worker death, and ODF-089 concerns a normal terminal result. No verified later crash exercise; watch start and review-after unknown. All three current logs checked; execution releases are the supplied releases, not today's installed versions.

## ODF-067 — Refusal fixtures supply the stop they claim to prove

- **Meaning:** A Git refusal test elects not to mutate using fixture-known state rather than attempting and observing the real operation reject.
- **Source mappings:** Open Dough / DD-054
- **References:** Current guidance assessed: Open Dough `f79ad88` (contains v0.3.27). Related to fixture-supplied outcomes, but distinct from the retired provisioning-order finding: the omitted observation is an actual rejected operation, not product-owned resource allocation.

### Occurrences

- Execution: `SEED-008#publish-trunk-mode-from-local-main @ b82bae4`
  - Source: Open Dough / DD-054; canonical DearDough.md occurrence
  - Timestamp: 2026-09-17T14:54:04+08:00
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.24
  - Evidence: Slice 2's first returned test computed
    `const mustStop = !localMainIsOwnedSuffix && !localMainMatchesFetchedRemote;
    assert.equal(mustStop, true, ...)` from SHAs already known from fixture
    setup, then simply never called `merge --ff-only` or `push`, and asserted
    nothing changed. The coordinator's proof-acceptance inspection rejected it
    and asked for `git -C integration merge --ff-only <candidate>` to be
    actually attempted and asserted to fail via `assert.rejects` matching
    Git's real "Not possible to fast-forward" message; the agent complied in
    one correction round-trip. The very next delegation (Slice 3) needed an
    explicit pre-emptive warning restating this exact lesson to avoid the
    same shape of tautology for its own rejected-push assertion.
  - Observed effect: One extra delegation round-trip (coordinator review,
    `SendMessage` correction, agent rework) before Slice 2's proof was
    accepted; Slice 3's delegation prompt grew by a dedicated section to
    forestall a repeat.
  - Inference: Delegation prompts asking for Git-fixture proof of a stop/
    refusal behavior may need to state up front, not just in general proof
    guidance, that the specific mutating command the rule would otherwise run
    must be actually attempted and its real rejection observed — general
    "don't let setup supply the outcome" wording in
    `refactor-checks.md`/`wrap-up.md` was not sufficient on its own to
    prevent the first draft.

## ODF-069 — CI discovery gaps obscure later terminal results

- **Meaning:** Registered revisions are reported uncovered during discovery and their later real verdicts are missed in the observed execution.
- **Source mappings:** Open Dough / DD-065; Doughnut / DD-076
- **References:** Current guidance assessed: Open Dough `f79ad88` (contains v0.3.27). The observed effects match the same three-poll discovery diagnostic. Doughnut execution release is unknown. At f79ad88, ci-mailbox-store.mjs observeRevisionCoverage iterates all registered rows and can replace uncovered with a discovered verdict; therefore the reports' assertion that discovery never retries, and latency as the sole cause, remain unverified. Preserve this counterevidence and diagnose the observed miss before choosing a response.

### Occurrences

- Execution: `SEED-008#publish-shared-backlog-claims @ 06504a5`
  - Source: Open Dough / DD-065; canonical DearDough.md occurrence
  - Timestamp: 2026-09-20T11:33:00+08:00
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.26
  - Evidence: `register-push` for `8e6c41d` (pushed 2026-09-20T11:22:27+08:00)
    was followed by a `CI_COVERAGE_UNAVAILABLE` hook event ("No CI attempt for
    pushed revision after 3 discovery polls."). `gh run list` at that moment
    showed run `35486408307` for that exact SHA already `in_progress`; it
    later completed `failure`. The observer's final `stop` report (after the
    next push's real `CI_FAILURE` event triggered manual investigation) still
    listed `8e6c41d` as `state: "uncovered"`, never as failed.
  - Observed effect: The coordinator only learned `8e6c41d` had failed CI by
    independently running `gh run list` while diagnosing a later commit's
    correctly-delivered `CI_FAILURE` event; without that unrelated
    investigation, the first failing revision's CI result would have gone
    unnoticed for the rest of the execution.
  - Inference: Qualified. Discovery latency between a push and GitHub Actions
    registering its run is the likely cause of the missed first poll window,
    not a defect in classifying a found run; whether widening the poll count
    or window would reliably close this specific gap was not tested here.

- Execution: SEED-035 story 1 / quick/148-cohesive-accepted-web-folder-changes / ea903668bb
  - Source: Doughnut / DD-076; canonical DearDough.md occurrence
  - Timestamp: unknown
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: unknown
  - Evidence: across five sequential slice pushes to
    `worktree-148-cohesive-accepted-web-folder-changes`, `register-push` was
    called immediately after each `git push`. Four of the five (`ea903668bb`,
    `c8b70f2122`, `12142a4c99`, `622da78f30`) produced a
    `CI_COVERAGE_UNAVAILABLE` event with reason "No CI attempt for pushed
    revision after 3 discovery polls." A manual
    `gh run list --repo nerds-odd-e/doughnut --branch
    worktree-148-cohesive-accepted-web-folder-changes --json
    databaseId,status,conclusion,headSha,createdAt`, run during the next
    slice's proof-acceptance step (minutes later), found each of those four
    runs already `completed`/`success` (run IDs 35349934027, 35351485386,
    35352772896, 35353547219). The fifth push's run (35354749201) was still
    `queued`/`in_progress` when the observer was stopped at plan completion,
    per the protocol's "never wait for CI."
  - Observed effect: no coverage was actually lost — every run that
    completed by the time of manual inspection was green — but the
    observer's own record shows 4 of 5 revisions as `unproved`/`uncovered`.
    Following only the documented "record lost coverage once and continue"
    step, without the extra manual `gh run list` checks this execution added,
    would have under-reported delivered confidence for every slice but the
    third, and would have given no signal to distinguish "CI hasn't run yet"
    from "CI is actually failing and undiscoverable."
  - Inference: the fixed ~90-second, 3-poll discovery bound appears too tight
    for this project's observed push-to-visible latency when several pushes
    happen within roughly ten minutes of each other, plausibly from runner
    queueing contention. A longer discovery window, a bound expressed as
    "time since push" rather than "poll count," or an explicit guidance step
    to manually re-check `gh run list` once before treating
    `CI_COVERAGE_UNAVAILABLE` as final, would likely have prevented every one
    of these four false negatives.


- **Status:** Partial response released in 0.3.28; underlying cause
  not repaired. The remaining observation boundary is queued for diagnosis and correction below.
- **Response:** Diagnosed, not repaired. A new faithful end-to-end test
  (`ci-revision-coverage-late-github-failure.test.mjs`) proves the existing
  `observeRevisionCoverage`/`createGitHubRunAcquisition`/`watchCiExecution`
  mechanism already retries a registered revision left `"uncovered"` after the
  initial discovery window and delivers a real later verdict — including a
  later failure — to the owning coordinator, confirming this report's own
  counterevidence rather than the "discovery never retries" reading. A small
  `references/ci-monitor.md` clarification was added: `CI_COVERAGE_UNAVAILABLE`
  is a temporary gap, not ended observation, and a coordinator should confirm a
  revision's actual state from coverage/records at the observer's own stop.
  This does not repair the evidenced remaining cause: `ci-runs.mjs`'s bounded
  run listing (`--limit 20` ongoing / `--limit 100` startup) can still miss a
  run on a busy/shared branch under enough concurrent-push queueing pressure —
  plausibly the actual mechanism in both recorded occurrences below, since both
  involved multiple close-together pushes on a shared branch. Widening that
  limit or adding retry machinery was explicitly out of this slice's scope
  ("No timing-policy exception assumed") pending a targeted diagnosis of that
  specific boundary. Do not treat this finding as resolved. Source commit
  `5630b28`, merged to `main`; plan recoverable at
  `1fd706e:.planning/quick/068-truthful-ci-observation/PLAN.md` (slice 3).
- **Released in:** 0.3.28; first containing tag v0.3.28 for `5630b28`, verified against the clarification and late-verdict proof diff.

- **Assessment (2026-09-23):** Later `9f86dda`, `8a00357`, and `d57783c` distinguish discovery-pending from terminal verdicts; they do not establish that bounded listing always discovers the relevant run. Historical reports are not post-v0.3.28 failures. The proposed listing cause remains qualified; diagnose it before choosing a repair. No complete fix or eligible watch is claimed.

- **Follow-up:** Native host acceptance dropped by Terry on 2026-09-24 (story `SEED-008#accept-execution-ci-native-behavior` recoverable at `b305fa5:.planning/seeds/SEED-008-worktree-branch-trunk-sync.md`); real project use is the remaining evidence source, and no native acceptance is claimed. Preserves late discovery delivery and truthful unproved completion; bounded listing remains open by design.

- Execution: SEED-035 story 15 / quick/020-notebook-lfs-receive / 2dc0ce9478; Timestamp: 2026-09-24T09:50+08:00 (completion wait for f6b4578a15); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.33. `complete-revision` timed out with all four registered revisions `undiscovered` while `gh run list` showed each completed `success`.
  - Source: Doughnut / ODF-069; canonical DearDough.md occurrence

- Execution: SEED-035 story 1 / quick/022-browse-download-notebook-files / 70b3b67313; Timestamp: 2026-09-24T12:20+08:00 (completion wait for a0ee337e40); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.33. `complete-revision` on `story/browse-download-notebook-files` timed out with `70b3b67313`, `f41c291823`, `a0ee337e40` all `undiscovered`; `gh run list` showed runs 35951607689, 35953015884, 35953621136 completed `success`. The story-branch observer was started by hand (DD-107) after the first push.
  - Source: Doughnut / ODF-069; canonical DearDough.md occurrence

- Execution: SEED-035 story 3 / quick/024-note-local-picture-file / f0cc15be6a; Timestamp: 2026-09-24T14:40+08:00 (completion wait for f0cc15be6a); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37. `complete-revision` on `story/local-image-display` timed out with `f0cc15be6a` `undiscovered` (shutdown confirmed); `gh run list --commit` showed run 35964391742 completed `success`.
  - Source: Doughnut / ODF-069; canonical DearDough.md occurrence

- Execution: SEED-035 story 14 / quick/025-convert-raw-notebooks-to-lfs / 071d0e0861; Timestamp: 2026-09-24T16:35+08:00 and 16:55+08:00 (completion waits for 44c90c8cfa and 22cea6694e); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37. The first wait ended `observation_unavailable` after `CI_MONITOR_UNAVAILABLE` (a failed `gh run list`), with `44c90c8cfa` `undiscovered`, while runs 35974797130 and 35975568223 had completed **failure** (a CLI test). The failures were found only by a manual `gh run list`. The repair wait for `22cea6694e` timed out `undiscovered` while run 35976936886 (created about 2 minutes after the push) completed `success`.
  - Source: Doughnut / ODF-069; canonical DearDough.md occurrence

- Execution: SEED-035 story 20 / quick/026-test-file-journeys-on-lfs / 5859e6d663; Timestamp: 2026-09-24T19:10+08:00 (completion wait for 47a3bdd0ab); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37. `complete-revision` on `main` timed out with all twelve registered revisions `undiscovered` (shutdown confirmed) after an early `CI_DISCOVERY_DELAYED`; `gh run list --branch main` showed "donut CI" push runs completed `success` for each checked revision, including 47a3bdd0ab (created 10:58:15Z).
  - Source: Doughnut / ODF-069; canonical DearDough.md occurrence

- Execution: SEED-035 story 4 / quick/027-web-uploaded-pictures-as-notebook-files / 4250de93e1; Timestamp: 2026-09-24T22:25+08:00 (completion wait for f4d1ec8d5c); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. `complete-revision` on `main` timed out with all six registered revisions `undiscovered` (shutdown confirmed) after an early `CI_DISCOVERY_DELAYED`; `gh run list --branch main` showed "donut CI" runs completed `success` for 4250de93e1, a061808c28, 682259779a, 0e760d4933 and f4d1ec8d5c (created 14:02:40Z); the planning-only claim 09a299b665 had no run of its own.
  - Source: Doughnut / ODF-069; canonical DearDough.md occurrence

- **Assessment (2026-09-25):** The v0.3.28 response (5630b28) was partial; managed delivery 02991a5/493187c/ddcabcb first shipped in v0.3.33. Six new Doughnut executions on v0.3.33, v0.3.37 and v0.3.38 still leave completed runs undiscovered, including real failures in plan 025. This confirms continuation of the observed verdict gap after those responses, not a proved bounded-listing cause. ff33cb8/v0.3.38 preserves an already-known failure when monitoring is lost; it does not fix undiscovered runs. ODF-112 adds a related, cause-uncertain seventh new Doughnut execution. No complete fix or watch is claimed. All three current logs checked; execution releases are the supplied releases, not today's installed versions.

- **Follow-up:** [Deliver real CI verdicts for registered execution revisions](../../.planning/seeds/SEED-008-worktree-branch-trunk-sync.md#restore-ci-verdict-delivery) — **queued, not resolved**. Selected by the authorized 2026-09-25 runbook maintenance cycle.

## ODF-070 — Tool availability is inferred from a local dependency directory

- **Meaning:** A refactor agent calls a command unavailable without invoking it, overlooking parent-directory module resolution in a nested worktree.
- **Source mappings:** Open Dough / DD-066 (nested execution)
- **References:** Current guidance assessed: Open Dough `f79ad88` (contains v0.3.27). The other Open Dough DD-066 is ODF-056; heading meaning and execution 45234b9 disambiguate this alias. Two reports from one execution count once. Low priority: the coordinator ran the command successfully and no incorrect change shipped.

- **Status:** Response released; effectiveness unverified.
- **Response:** `src/skills/dough-execute-plan/references/execution-location.md`
  prepares a selected execution checkout as part of worktree setup, then
  establishes usability by running an applicable project command from that
  checkout. Availability is not inferred from `node_modules` or a similar
  local directory, and parent-directory resolution is not the dependency
  contract. Source commit `6d7f7f30cea464f0ae2d6e269a3fd578d899390d`. Story
  and plan recoverable at
  `a168a39f64a75c579a713674a5dda5ca46bed6ea:.planning/quick/069-prepare-execution-worktree/PLAN.md`
  (removed from the current snapshot by story wrap-up), identity
  `SEED-008#prepare-execution-worktree`. Shipping this guidance does not
  itself prove native hosts follow it.
- **Released in:** 0.3.28; first containing tag v0.3.28, verified from implementation and tagged guidance/runtime diffs.

### Occurrences

- Execution: `SEED-008#planning-workspace-procedure @ 45234b9`
  - Source: Open Dough / DD-066; canonical DearDough.md occurrence
  - Timestamp: unknown
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.26
  - Evidence: the slice 5 refactor-pass report stated `node scripts/lint.mjs`
    "could not run (`eslint`/`prettier` binaries not installed in this
    worktree's `node_modules`, which is empty — 0 packages vs. 96 in the main
    checkout)... This is an environment gap." The coordinator then ran
    `npm run format` directly in that same worktree
    (`/Users/terryyin/git/open-dough/.worktrees/065-prepare-stories-in-owned-worktrees`)
    immediately afterward and observed a clean pass with no diff, confirming
    the command works there.
  - Observed effect: no incorrect guidance reached the delivered plan or
    product, since the coordinator's own formatting step is independent of
    the refactor pass's own tooling claim and was run and verified regardless.
    The cost was a false "environment gap" statement carried in that agent's
    report, which the coordinator had to notice and re-verify rather than
    trust.
  - Inference: Qualified. The same false observation recurred verbatim in the
    slice 6 refactor-pass report on the same worktree, suggesting the
    pattern is the check itself (local directory existence) rather than a
    one-off environment fluke; whether a differently phrased delegation
    instruction (e.g. "run the command, not a `node_modules` existence
    check, before reporting a tooling gap") would prevent recurrence was not
    tested here.

- **Assessment (2026-09-23):** No verified post-release exercise of the directory-inference correction establishes a watch start. Native gate skipping in ODF-087 concerns a different mechanism and was observed on a modified prerelease candidate. Watch start and review-after: unknown; excluded from age-based retirement.

- **Assessment (2026-09-25):** Reverified 6d7f7f3/v0.3.28 requires an applicable command instead of directory inference. Later queued-start acceptance checks preparation but does not specifically exercise the false directory-unavailability report. Watch start and review-after unknown. All three current logs checked; execution releases are the supplied releases, not today's installed versions.

## ODF-071 — Native acceptance observers bind to the launching session

- **Meaning:** An observer launched by the coordinator cannot deliver into a different native session that never emitted its receipt.
- **Source mappings:** Open Dough / DD-068
- **References:** Current guidance assessed: Open Dough `f79ad88` (contains v0.3.27). Distinct from ODF-052's same-repository worktree identity: this is receipt ownership across sessions. Native acceptance was redesigned successfully; no general correction has been delivered.

### Occurrences

- Execution: `.planning/quick/032-refuse-managed-hook-command-variants/PLAN.md @ 29dadf3`
  - Source: Open Dough / DD-068; canonical DearDough.md occurrence
  - Timestamp: 2026-09-21T09:06+08:00
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: modified; revision 29dadf3; base 0.3.26
  - Evidence: the coordinator ran
    `node .agents/skills/dough-execute-plan/scripts/ci-mailbox.mjs start
    --execution fixture/dough-032-compat main` directly from a Bash tool
    call in its own conversation (mailbox `/tmp/dough-ci-501/watch-yj19Ms`),
    confirmed the controlled failure was recorded
    (`events/000000000001.json`), then stopped it and received
    `"evidence":{"recordedThrough":1,"deliveredThrough":0,"unread":1}` —
    the event was never delivered because no native-session tool output
    ever contained that mailbox's receipt line. The correct design, already
    used by this same plan's earlier Slice 4 evidence
    (`f7ab0e4:.planning/quick/032-refuse-managed-hook-command-variants/evidence/cursor-claude-compatibility/README.md`), has the *native
    session's own prompt* run the readiness probe and the `start` command,
    so the receipt appears in its own `Shell` tool output at the exact hook
    invocation that establishes ownership.
  - Observed effect: one wasted observer start/stop cycle plus a source-code
    read of `ci-mailbox-location.mjs` and `ci-host-hook.mjs` to discover the
    binding rule, before the acceptance session was redesigned to start its
    own observer. No incorrect result was delivered; the redesigned run
    (session `1330b4c2-7b3e-4be6-a1cc-ad13ed781a38`) then bound and
    delivered correctly.
  - Inference: Qualified, single occurrence. The Quick 032 Slice 4 evidence
    already encoded the correct pattern but did not state the underlying
    rule (ownership binds to the tool call that emits the receipt, not to
    whichever process started the observer), so a later executor without
    that evidence in context has to rediscover it from source. Whether
    stating this rule directly in
    `.claude/skills/dough-execute-plan/references/ci-notify-hosts.md`'s
    "Start once and continue immediately" section would prevent recurrence
    was not tested here.

## ODF-072 — Native Cursor acceptance loses the launcher PATH override

- **Meaning:** A controlled command supplied through the launcher PATH is not selected by the native Shell tool, although other environment variables propagate.
- **Source mappings:** Open Dough / DD-069
- **References:** Current guidance assessed: Open Dough `f79ad88` (contains v0.3.27). The retained Quick 032 acceptance already demonstrates an inline command PATH override. Retain the host-specific evidence at low priority; this is not a general environment-inheritance claim for other hosts.

### Occurrences

- Execution: `.planning/quick/032-refuse-managed-hook-command-variants/PLAN.md @ 29dadf3`
  - Source: Open Dough / DD-069; canonical DearDough.md occurrence
  - Timestamp: 2026-09-21T09:08+08:00
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: modified; revision 29dadf3; base 0.3.26
  - Evidence: launching
    `PATH="<fixture>/bin:/opt/homebrew/bin:..." CONTROLLED_GH_TOKEN=env-inherit-check-xyz
    cursor agent --print ... "which gh && echo TOKEN=$CONTROLLED_GH_TOKEN"`
    returned `gh` resolved to `/Users/terryyin/.nix-profile/bin/gh` (not the
    fixture stand-in) while `TOKEN=env-inherit-check-xyz` printed correctly;
    a follow-up `echo PATH=$PATH` inside the same kind of session showed a
    fixed system `PATH` unrelated to the launching shell's. The plan's own
    prior Slice 4 evidence
    (`f7ab0e4:.planning/quick/032-refuse-managed-hook-command-variants/evidence/cursor-claude-compatibility/README.md`)
    already worked around this by putting the `PATH=...` prefix inline on
    the observer `start` command text itself, but did not record that this
    was necessary because outer `PATH` does not propagate while other
    environment variables do.
  - Observed effect: one extra diagnostic native session run to isolate
    which of `PATH` vs. arbitrary environment variables actually propagates,
    before the acceptance prompt was written with the `PATH=` prefix placed
    inline in the exact command text.
  - Inference: Qualified, single occurrence. Recording this distinction in
    `.claude/skills/dough-execute-plan/references/ci-notify-hosts.md` next
    to its existing disposable-command guidance would let a future executor
    reuse this fact instead of re-deriving it from a fresh diagnostic
    session; not tested here.

## ODF-073 — CI observation starts after the first publication

- **Meaning:** The coordinator arms the observer only after the first slice push, leaving that publication outside the intended observation sequence.
- **Source mappings:** Pygardon / ODF-042
- **References:** Current guidance assessed: Open Dough `f79ad88` (contains v0.3.27). Pygardon's ODF-042 is a misapplied catalog code, with former local DD-057; catalog ODF-042 remains Doughnut's representation-inventory issue. Unknown execution release prevents a continuity comparison. The independent adapter configuration failure already removed all coverage in this execution; arming late added no observed loss.

### Occurrences

- Execution: `.planning/quick/125-stooq-refresh-memory-safety/PLAN.md` at
  `77dfb2c0c`
  - Source: Pygardon / ODF-042; canonical DearDough.md occurrence
  - Timestamp: 2026-09-17T11:23:10+08:00
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: unknown
  - Evidence: Slice 1 was committed as `77dfb2c0ce4` (2026-09-17T11:21:38+08:00)
    and pushed to `125-stooq-refresh-memory-safety` immediately after; the
    `ci-mailbox.mjs probe`/`start` commands and the execution-identity commit
    recording the armed observer (`f8b1151a9`) followed about 1.5 minutes
    later, before Slice 2 began.
  - Observed effect: this project's CI adapter (`scripts/pygardon-ci-adapter.mjs`)
    also failed independently with `PYGARDON_CI_ORIGIN is required` once armed,
    so no CI coverage existed for any push in this execution regardless of
    arming order; the ordering slip itself had no additional observed
    consequence here.
  - Inference: a coordinator resuming or starting fresh execution should run
    the observer readiness probe and `start` before the first slice's delivery
    step, not opportunistically before a later slice, even when a plan's first
    slice feels small enough to "just push and arm after."

- **Status:** Response released; effectiveness unverified; native acceptance was dropped.
- **Response:** `execution-increment-delivery.mjs` establishes or reuses a matching live observer for the authorized target branch before the first applicable push, attaching the exact accepted SHA to that observer.
- **Released in:** 0.3.33; first containing tag v0.3.33, verified against the implementation and tagged runtime diffs.

- **Follow-up:** Native host acceptance dropped by Terry on 2026-09-24 (story `SEED-008#accept-execution-ci-native-behavior` recoverable at `b305fa5:.planning/seeds/SEED-008-worktree-branch-trunk-sync.md`); real project use is the remaining evidence source, and no native acceptance is claimed. Managed delivery establishes or reuses observation before push, attaching the exact accepted SHA.

- **Assessment (2026-09-25):** 02991a5 and 493187c first ship in v0.3.33, establishing observation before publication when session context is available. Pygardon plan 183 on v0.3.33 reveals the separate missing-session-input mechanism now retained under ODF-092; only that later occurrence is moved, not the original ordering report. This is not proof of a general successful fix: first-push coverage remains incomplete. Watch start and review-after unknown. All three current logs checked; execution releases are the supplied releases, not today's installed versions.

- **Follow-up:** [Attach CI observation to the first Claude Code publication](../../.planning/seeds/SEED-008-worktree-branch-trunk-sync.md#attach-first-claude-publication) — **queued, not resolved**. Selected by the authorized 2026-09-25 runbook maintenance cycle.

## ODF-074 — Planning asserts unverified existing code and host facts

- **Meaning:** Concrete only-caller and host-state premises enter a plan without inspection, forcing a changed decision or stopped implementation when checked.
- **Source mappings:** Pygardon / DD-061
- **References:** Current guidance assessed: Open Dough `f79ad88` (contains v0.3.27).

### Occurrences

- Execution: `.planning/quick/145-docker-space-cleanup/PLAN.md` at `c0c7bb2c7`
  - Source: Pygardon / DD-061; canonical DearDough.md occurrence
  - Timestamp: 2026-09-17T20:12:20+08:00
  - Tool: Claude Code
  - Model: claude-fable-5-1
  - Open Dough release: unknown
  - Evidence: plan revision `27c299a26` (Assumptions paragraph and slice 3
    Behavior); execution found six direct create/run sites needing the label
    (commits `1f40e0f36`, including two found only by the refactor pass) and
    `docker ps` showing the three leaked containers with no session label,
    which forced the ownership rule to include the container's creation
    image reference (plan "Current decisions", commit `21448d249`).
  - Observed effect: one decision refinement and a widened delegation brief
    before slice 3; no rework, because both gaps were caught before
    implementation.
  - Inference: a grep for the creation commands and one `docker ps` with the
    label column would have settled both claims in planning; the planning
    guidance's PFE and assumption sections invite such checks but do not
    require evidence for concrete "only X" claims.

- Execution: `.planning/quick/148-adoption-preserves-installation-overlays/PLAN.md` at `7db4f5c4a`
  - Source: Pygardon / DD-061; canonical DearDough.md occurrence
  - Timestamp: 2026-09-18T18:27:14+08:00
  - Tool: Claude Code
  - Model: claude-opus-5
  - Open Dough release: unknown
  - Evidence: the plan's slice 3 required both "remove the redundant
    application image from the supported IBKR overlay" and "keep the gateway's
    own image configuration and the existing direct Compose startup behavior".
    `compose.ibkr.yaml` is also the only Compose file the runtime image ships
    (`Dockerfile:134`), from which
    `pygardon_service/ibkr_companion_lifecycle.py::create_owned_gateway` starts
    the gateway standalone; real Compose rejects that file without the line
    (`service "pygardon" has neither an image nor a build context specified`).
  - Observed effect: the first slice-3 attempt stopped without changing a file
    and returned a human-judgment stop; the owner chose a different mechanism
    (apply supplies `PYGARDON_IMAGE`), recorded at `c386a4595`, and the slice
    was re-delegated and delivered at `f81079092`.
  - Inference: one `docker compose config` against the shipped overlay alone, or
    a grep for its non-overlay callers, would have settled the claim in planning.

- Execution: `.planning/quick/181-local-production-deployment/PLAN.md` (first implementation commit `f8eed7a92`); Timestamp: unknown (2026-09-24); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.33. Evidence: plan decision 4 assumed a reusable source-CI verdict, but in-app CI deferred from the first increment (`CI deferred: Docker engine has 14556631040 free bytes; 16106127360 required`) and the local recipe did not fit either; "Dockerfile already labels revision and version" was false; the updater image lacked a `deployment` build context. Effect: no CI verdict for any story-branch increment; release needed an owner-authorized prune and a local recipe run. Inference: a headroom and premise check at planning would have surfaced the evidence gap before execution.
  - Source: Pygardon / ODF-074; canonical DearDough.md occurrence

- Execution: `.planning/quick/182-retire-remote-distribution/PLAN.md` (first implementation commit `1d591046a`); Timestamp: 2026-09-24T14:58:00+08:00; Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37. Evidence: the plan named ADR-0004 an accepted constraint, but it is Proposed (deferred) (found by the slice 2 implementer); decision 2 assumed CI workspace recreation minted extra builders and that the application had no installation identity, but read-only inspection showed the production workspace never recreated and `PYGARDON_INSTALLATION_ID=local-arm64` already set (`f7aefb5c1`). Effect: slice 6 stopped for an owner round trip and was re-scoped; the ADR citation was corrected. Inference: the plan's "confirm the cause first, stop if not" guard contained the cost.
  - Source: Pygardon / ODF-074; canonical DearDough.md occurrence

- Execution: `.planning/quick/185-ci-capacity-hold-attention/PLAN.md` (first implementation commit `c2170df0f`); Timestamp: unknown (2026-09-24); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: unknown. Evidence: the plan's Design and slice 4 named `failure_attention_delivery.py` as a CI-release residue and the Telegram binding point, but the file no longer existed (slice 2 implementer report); its "only the store migration that removes retained `ci_release` reports remains" was already done in `f07e8958b`. Effect: the coordinator located the actual binding (`service_lifecycle.py` origin-bound `failure_notification_handler`) before delegating slice 4. Inference: small cost; the plan cited a dependency's retirement notes rather than current code.
  - Source: Pygardon / ODF-074; canonical DearDough.md occurrence

- **Assessment (2026-09-25):** Current guidance assessed at 7e17cba: the supplied additional v0.3.33, v0.3.37 and unknown-release planning reports add missing evidence for this identity. No claimed mechanism-specific correction was found; unknown provenance is not continuity proof or post-fix recurrence.

## ODF-077 — Whole-suite recovery loses ownership and verdict evidence

- **Meaning:** Long-running verification is misclassified, duplicated, and its output discarded, delaying a verdict and leaving orphaned containers.
- **Source mappings:** Pygardon / DD-065
- **References:** Current guidance assessed: Open Dough `f79ad88` (contains v0.3.27). Related retired ODF-008 concerned passing tests timing out under simultaneous resource contention. Here the decisive gaps are task-state diagnosis, output retention, and recovery ownership; historical ODF-008 remains retired and is not assigned to this new execution.

### Occurrences

- Execution: `.planning/quick/146-tag-triggered-release-publication/PLAN.md` (first implementation commit `a95f3c497`)
  - Source: Pygardon / DD-065; canonical DearDough.md occurrence
  - Timestamp: 2026-09-18T13:15:00+08:00
  - Tool: Claude Code
  - Model: claude-opus-5
  - Open Dough release: 0.3.25
  - Evidence: two four-worker `pytest -n 4` masters alive together (`ps` showed
    elapsed `01:51:21` on the survivor); empty output files for background
    tasks `bs62ntot0` and `bm71d6iia`; the command
    `pytest … -q 2>&1 | tail -12` discarded the summary that names failures;
    the verdict arrived from `-m "not host_docker"` (2383 passed, 2 skipped in
    80s) plus a serial run of the 18 Docker tests, which found one real failure
    and one hang (SEED-035).
  - Observed effect: roughly two hours of wall-clock time with no suite
    verdict, plus stray `pygardon:pytest-session-runtime-*` containers.
  - Inference: a long suite needs its full output retained to a file, one owner
    at a time, and a marker split when a subset can hang; concurrent runs also
    break the suite's own engine-wide container assertions.

## ODF-078 — Stalled-agent recovery mistakes symbol checks for a diff

- **Meaning:** A last agent message and selected-symbol grep are treated as proof no edits occurred, causing an inaccurate account of retained work.
- **Source mappings:** Pygardon / DD-067
- **References:** Current guidance assessed: Open Dough `f79ad88` (contains v0.3.27). Related to ODF-059 interrupted handoffs, but the concrete failure is recovery verification and false reporting; unknown release leaves any guidance-history relationship uncertain.

### Occurrences

- Execution: `.planning/quick/148-adoption-preserves-installation-overlays/PLAN.md` at `7db4f5c4a`
  - Source: Pygardon / DD-067; canonical DearDough.md occurrence
  - Timestamp: 2026-09-18T19:35:45+08:00
  - Tool: Claude Code
  - Model: claude-opus-5
  - Open Dough release: unknown
  - Evidence: the post-stall check grepped only
    `compose_environment|NO_ENVIRONMENT_FILE|INSTALLATION_OWNED_PREFIXES` and
    `RunCall`, none of which the stalled agent had touched; the extraction it had
    made, `checked_replacement_environment` in
    `scripts/release-updater-apply.py`, was absent from that grep and only
    surfaced when the replacement agent referred to it as pre-existing. Both are
    in the delivered commit `0eb693bb1`.
  - Observed effect: no work was lost and the delivered state was proved by a
    full rerun, but the coordinator stated an inaccurate account of what the
    commit contained and had to correct it afterwards.
  - Inference: an agent's own last message is not evidence of where it stopped,
    and a symbol spot-check confirms only the symbols chosen. Comparing the
    working tree against the revision the agent started from would have been
    decisive at the same cost.

## ODF-079 — Repeated local refactor deferrals accumulate structural overrun

- **Meaning:** Successive refactor passes defer the same growing responsibility until a story delivers a file over twice its stated size check.
- **Source mappings:** Pygardon / DD-068
- **References:** Current guidance assessed: Open Dough `f79ad88` (contains v0.3.27). Distinct from ODF-055 refactor elapsed time and ODF-062 absent refactor passes: the reviews ran but their repeated local decisions did not own cumulative growth.

### Occurrences

- Execution: `.planning/quick/148-adoption-preserves-installation-overlays/PLAN.md` at `7db4f5c4a`
  - Source: Pygardon / DD-068; canonical DearDough.md occurrence
  - Timestamp: 2026-09-18T23:45:00+08:00
  - Tool: Claude Code
  - Model: claude-opus-5
  - Open Dough release: unknown
  - Evidence: successive refactor reports recorded the file at 284, 314, 344,
    463 and 553 lines against a 250-line check, each declining the split with a
    different local reason; the file now carries prepare orchestration, status,
    image validation, identity guarding and readiness.
  - Observed effect: the story delivered with the check failing by more than
    twice the threshold, and the identified seam (the identity concept, roughly
    150 lines) was never cut.
  - Inference: a per-change refactor gate cannot own an overrun that only
    becomes compelling cumulatively; noticing growth across a story needs either
    a story-level check or an explicit carry-forward that escalates.

## ODF-080 — Live transitions proceed without current named regression proof

- **Meaning:** Live operational checks substitute for the plan's named regression proof, including after concurrent changes invalidate an earlier pass.
- **Source mappings:** Pygardon / DD-071
- **References:** Current guidance assessed: Open Dough `f79ad88` (contains v0.3.27). Two distinct executions: plans 150 and 160. Plan 160 reports v0.3.27; preserve that supplied release without inferring when adoption occurred. The approximately eleven-minute outage accompanied the live exercise; the record does not establish that the omitted test caused it. This is not a pre-change benchmark/baseline omission.

- **Status:** Response released; effectiveness unverified.
- **Response:** `src/skills/dough-execute-plan/references/execution-decisions.md`'s
  "Require current regression proof before a live action" section gates an
  authorized live action on an accepted current observation of the plan's
  named regression prerequisite, and now also requires that observation to
  still correspond to the actual candidate and conditions being acted on —
  a relevant change requires reassessment, an irrelevant one does not — citing
  [own executable proof](../../src/skills/dough-story-refinement/references/planning.md#own-executable-proof)
  for what "current"/matching evidence means rather than a timestamp or
  whole-repository SHA identity. `src/skills/dough-execute-plan/references/delegation.md`
  carries that same condition to the delegated actor at action time. Source
  commits `e9829bc6088567742fefd2a726f6bbe7da9bc039` (Slice 1, establishing
  the missing-proof gate) and `9b1391db3c0e024272a2eed8fd8c8d278f3488a0`
  (Slice 2, candidate-correspondence reassessment and this response record),
  both on `main`. Story and plan recoverable at
  `9b1391db3c0e024272a2eed8fd8c8d278f3488a0:.planning/quick/067-current-proof-before-live-transitions/PLAN.md`
  (deleted from the current snapshot by story wrap-up), identity
  `SEED-004#require-current-proof-before-live-transitions`.
  Shipping this guidance does not itself prove it prevents recurrence.
- **Released in:** 0.3.28; first containing tag v0.3.28 for both response commits, verified against the live-action and delegation diffs.

### Occurrences

- Execution: `.planning/quick/150-installation-configuration-home/PLAN.md` (first implementation commit `f2e8af823`)
  - Source: Pygardon / DD-071; canonical DearDough.md occurrence
  - Timestamp: 2026-09-19T02:55:00Z
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: unknown
  - Evidence: the plan named
    `tests/test_release_updater_apply_installation_inputs.py` and two
    `tests/test_release_updater_watcher.py` cases; no slice recorded running
    or reusing them. Run in retrospective: the first passed (10/10);
    `test_packaged_watcher_adopts_release_with_external_credentials_and_install_configuration`
    failed on missing `node_modules`/`cucumber-js`; `test_adopted_controller_preserves_gateway` passed.
  - Observed effect: production was restarted twice, a watcher enrolled, a
    release published, and the watcher replaced the running container —
    before the plan's own named regression suite ran once.
  - Inference: inspecting the live container is not a substitute for a
    plan's own named regression proof; run both before a live transition.

- Execution: `.planning/quick/160-host-restart-recovery/PLAN.md` (first implementation commit `2f0a9b32b`)
  - Source: Pygardon / DD-071; canonical DearDough.md occurrence
  - Timestamp: 2026-09-21T01:35:48Z
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.27
  - Evidence: the plan's slice 1 named `tests/test_ci_compose.py` as its proof
    and it passed (7 passed) at slice 1's delivery. Between then and slices 2
    and 3's live engine-restart transitions, a concurrent execution's merge
    (`c372e66f8`) refactored `updater/release-updater-apply.py`, extracting
    `resolved_configuration` into a new module without keeping the forwarding
    wrapper it kept for two sibling functions extracted the same way. Neither
    slice 2 nor slice 3 re-ran the named test before its live transition; each
    was accepted on live `docker inspect`/`curl` checks instead. Re-run in
    retrospective: `AttributeError: module ... has no attribute
    'resolved_configuration'` (1 failed, 6 passed). The test is marked
    `pytest.mark.host_docker` and `scripts/check-prepared-checkout.sh` runs
    pytest with `-m "not slow and not host_docker"`, so container CI never
    executed it at any point and reported unrelated "pass" results throughout.
  - Observed effect: this Mac's Docker engine was stopped and restarted live
    twice (one attempt causing an ~11-minute production outage) and the owner
    then personally restarted their Mac, all while the compose-resolution
    proof backing the exact `restart: unless-stopped` policy under live test
    was silently broken and unrun, and no CI gate could have caught it.
  - Inference: extends DD-071's inference to a case where the plan's own named
    proof did pass once, earlier in the same execution — re-running it once at
    its owning slice is not enough when later slices perform further live
    transitions on the same behavior, especially when the proof is excluded
    from CI (so drift from unrelated concurrent work is invisible until
    someone runs it by hand).


- **Follow-up:** SEED-004#require-current-proof-before-live-transitions (story section recoverable at `4c6619a86b9d104c85e1ec602a304bb9fa589787:.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md#require-current-proof-before-live-transitions`, removed from the current snapshot by story wrap-up), **response released in 0.3.28; effectiveness unverified** (see Status/Response above). Selected by the authorized 2026-09-21 runbook maintenance cycle.

- **Assessment (2026-09-23):** All three logs were checked; the supplied live-action failures predate v0.3.28 or have unknown release. Installed updates alone do not establish that a later live transition exercised this gate. Watch start and review-after: unknown; excluded from age-based retirement.

- **Assessment (2026-09-25):** Reverified e9829bc and 9b1391d, first containing v0.3.28, against the named-proof and current-candidate checks. New live-fixture report ODF-114 does not establish a bypass of an explicit named regression gate. No supported later exercise of that gate; watch start and review-after unknown. All three current logs checked; execution releases are the supplied releases, not today's installed versions.

## ODF-081 — Wrong-checkout edits are captured by another execution

- **Meaning:** Coordinator plan edits land in shared main instead of the selected execution worktree and are published by an unrelated writer.
- **Source mappings:** Doughnut / DD-061
- **References:** Current guidance assessed: Open Dough `f79ad88` (contains v0.3.27). Related to ODF-046 edit-destination mismatch and ODF-029 shared-checkout capture. Unknown execution release prevents a bounded continuity or correction decision, so this is a separate uncertain identity, not a claimed post-fix recurrence.

### Occurrences

- Execution: SEED-009 story 42 / quick/131-manually-validate-append-only-notebook-workflow
  - Source: Doughnut / DD-061; canonical DearDough.md occurrence
  - Timestamp: 2026-09-17T12:23:21+08:00
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: unknown
  - Evidence: claim commit `979a667474` (12:07:35+08:00, correctly on `main`
    in the originating checkout); PLAN.md edits at 12:16–12:21 targeted the
    originating checkout's absolute path; concurrent commit `35dfb6072896`
    (12:23:21+08:00, message "Refine PRODUCT-BACKLOG and update SEED-009
    documentation") diff includes the plan 131 `PLAN.md` 69-line addition
    alongside unrelated `SEED-009`/`DearDough.md`/
    `PRODUCT-BACKLOG.md` changes from the concurrent plan-132 execution;
    execution branch `131-manually-validate-append-only-notebook-workflow`
    was clean and unchanged at the claim commit when removed.
  - Observed effect: the manual-testing report and slice-status update
    reached `origin/main` intact, but with no commit traceable to plan 131's
    own execution, and the execution's Story Branch Mode delivery path was
    bypassed entirely.
  - Inference: when multiple sessions execute plans concurrently against the
    same shared originating checkout, any coordinator action that writes to
    a path under that shared checkout (rather than strictly to the resolved
    execution-checkout path recorded in the plan) risks being staged and
    committed by a different, unrelated session's next commit in that
    checkout. Retaining and consistently reusing the resolved execution
    checkout path for every write after worktree creation would have avoided
    this; a repeated `git status` check before delivery in the wrong
    checkout would also have surfaced it earlier.

## ODF-082 — Coordinator writes race a delegated refactor review

- **Meaning:** The coordinator edits the same execution checkout while a refactor agent reviews the previous slice, invalidating its snapshot and wasting the review.
- **Source mappings:** Doughnut / DD-063
- **References:** Current guidance assessed: Open Dough `f79ad88` (contains v0.3.27).

### Occurrences

- Execution: SEED-022 story 1 / quick/134-literal-note-title-recall
  - Source: Doughnut / DD-063; canonical DearDough.md occurrence
  - Timestamp: 2026-09-17, between approximately 17:29 and 17:37 +08:00 (the
    subagent was launched right after the slice-1 `pnpm backend:test_only`
    run completed and stopped before the slice-2 run, timestamped
    17:37:42+08:00 in that run's Spring Boot startup log; the subagent's own
    elapsed time was reported as ~6 minutes)
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: unknown
  - Evidence: subagent hand-back report titled "Refactor outcome: STOPPED —
    working tree diverged mid-task from the briefed slice-1-only scope,"
    describing a failed edit ("File has been modified since read"), a
    re-read showing `RecallTitleSegments.java`/Test already deleted and
    `NoteTitle`/test files already carrying slice-2 content the coordinator
    was actively writing, and ending `## REFACTOR JIDOKA STOP`; task-notification
    usage for that run reported `subagent_tokens: 85655`, `duration_ms: 241361`.
  - Observed effect: no refactor findings were produced for slice 1; the
    coordinator had to re-run one consolidated post-change-refactor pass
    later, after all three slices were implemented and stable, to get a
    usable review.
  - Inference: the delivery sequence's "spawn a fresh agent" step, combined
    with Story Branch Mode's one-checkout-per-plan (not per-slice) layout,
    has no explicit rule that the coordinator must pause its own edits to
    that checkout until the delegated subagent returns; without that rule, a
    coordinator eager to keep moving to the next slice will race a
    concurrently-running subagent reading the same files and burn a full
    subagent turn on a stop neither side could have avoided once started.

## ODF-083 — Feature work strands the shared integration checkout

- **Meaning:** An execution switches the shared checkout to its own feature branch and leaves a large uncommitted change, blocking another execution's setup.
- **Source mappings:** Doughnut / DD-064
- **References:** Current guidance assessed: Open Dough `f79ad88` (contains v0.3.27). Distinct from ODF-081 individual edits landing in the wrong checkout: the shared checkout itself was repurposed. Unknown release prevents a claimed recurrence after any later workspace response.

### Occurrences

- Execution: SEED-009 story 44 / quick/137-retire-notebook-rebaseline-migration
  - Source: Doughnut / DD-064; canonical DearDough.md occurrence
  - Timestamp: 2026-09-17, unknown exact time (diagnosed and repaired before
    this execution's delivery commit at 20:10:08 +08:00)
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: unknown
  - Evidence: `git branch -vv` and `git worktree list` at session start showed
    the primary checkout `/Users/terryyin/git/doughnut` on branch
    `136-trash-vocabulary` (not `main`) with `git status --short` reporting 34
    changed paths implementing all 5 "done"-marked slices of
    `.planning/quick/136-trash-vocabulary/PLAN.md`, while local `main` (one
    commit ahead, `e362217c4f`) already carried plan 137's claim commit and
    `.planning/quick/137-retire-notebook-rebaseline-migration/PLAN.md`. A peer
    session named "trash vocabulary recovery" independently confirmed it had
    been asked to perform the identical repair.
  - Observed effect: this execution could not start slice delegation until
    the shared checkout was repaired; required a stash, a new worktree
    (`.claude/worktrees/136-trash-vocabulary`) to preserve the stranded work,
    a branch switch of the shared checkout back to `main`, and a fresh
    worktree/branch creation for plan 137 before any implementation began.
  - Inference: the prior plan-136 execution's coordinator ran ordinary `git
    checkout <branch>` on the shared main checkout instead of following
    Story Branch Mode's create-a-dedicated-worktree step, likely because nothing
    in [execution location](../dough-execute-plan/references/execution-location.md)
    warns that checking out an execution branch directly in the shared
    checkout — rather than creating its own worktree — strands that checkout
    for every later execution until manually repaired.

## ODF-084 — An active execution worktree disappears during delegation

- **Meaning:** An execution worktree and branch are removed during an active delegated task, forcing recovery while another execution uses shared integration.
- **Source mappings:** Doughnut / DD-072
- **References:** Current guidance assessed: Open Dough `f79ad88` (contains v0.3.27). The remover was not established. Preserve the unexplained removal and misleading transient shared-tree observations; do not attribute the deletion to the concurrent session as fact.

### Occurrences

- Execution: SEED-030 story 2 / quick/145-reset-notebook-git-history
  - Source: Doughnut / DD-072; canonical DearDough.md occurrence
  - Timestamp: 2026-09-18, ~17:06-17:20 +08:00 (between the plan 146 claim
    commit `c619aba43a` at 17:05:27 +08:00 and slice 1's delivery at 17:30 +08:00)
  - Tool: Claude Code
  - Model: claude-opus-5
  - Open Dough release: unknown
  - Evidence: after the subagent's BLOCKED return, `git worktree list` showed
    only `/Users/terryyin/git/doughnut` and
    `.worktrees/146-permanently-delete-trashed-content`; `git branch -a --list '*145*'`
    was empty; the claim commit `e86f76566a` was still an ancestor of `main`
    and the **Taken** backlog entry plus `PLAN.md` were present at `HEAD`. The
    detached CI observer (pid 89451, `/tmp/dough-ci-501/watch-6PqtuY`) was
    still running with its command path pointing into the deleted directory.
  - Observed effect: no committed or uncommitted work was lost, because the
    subagent had not yet edited anything. Recovery was to recreate the branch
    and worktree from `e86f76566a`, re-run `pnpm --frozen-lockfile recursive install`,
    and resume the same subagent with its already-derived design, which it
    still held. The surviving observer was reused rather than relaunched, since
    recreating the worktree at the identical path restored its binding. Cost
    was roughly one wasted subagent turn plus the reinstall and a verification
    pass over the shared checkout.
  - Inference: the removal's owner was never established, so this is recorded
    as an unexplained concurrent-execution hazard rather than an attributed
    fault. Two guidance gaps are visible regardless of who removed it. First,
    nothing in Story Branch Mode makes an active execution worktree evidently
    in-use to a concurrent session doing worktree cleanup in the same
    repository. Second, a subagent reading the shared integration checkout to
    diagnose its own failure can observe another execution's mid-operation
    working tree and reasonably report it as deletion of its own source
    documents; delegation guidance tells subagents to stay out of the
    integration checkout for edits but not that its working-tree state is
    untrustworthy as evidence.

## ODF-085 — A missing host skill path hides an available checkout runtime

- **Meaning:** Fresh-worktree setup treats absent .claude/skills as unavailable CI observation or copies an installation, despite a tracked .agents runtime in that same checkout.
- **Source mappings:** Doughnut / DD-074
- **References:** Current guidance assessed: Open Dough `f79ad88` (contains v0.3.27). Ownership review 2381cf9e60 reproduces the v0.3.26 published setup contract at 8766adefee. eff69eb/v0.3.27 corrects CLI entry for an existing symlink target; it supplies no missing directory. The four execution releases remain unknown, so none demonstrates post-fix recurrence of the symlink-entry correction.

### Occurrences

- Execution: SEED-034 story 1 / quick/146-permanently-delete-trashed-content / 6f2a2ff1d8
  - Source: Doughnut / DD-074; canonical DearDough.md occurrence
  - Timestamp: 2026-09-18T17:06+08:00
  - Tool: Claude Code
  - Model: claude-opus-5
  - Open Dough release: unknown
  - Evidence: `node '.claude/skills/dough-execute-plan/scripts/ci-mailbox.mjs' probe`
    run from the execution worktree root exited non-zero with
    `Error: Cannot find module` / `code: 'MODULE_NOT_FOUND'`;
    `ls .claude/skills/dough-execute-plan/scripts/` returned
    `No such file or directory` while `ls .agents/skills/dough-execute-plan/scripts/`
    listed the runtime. `node '.agents/skills/dough-execute-plan/scripts/ci-mailbox.mjs' probe`
    then printed `CI_OBSERVER {"directory":"/tmp/dough-ci-501/watch-4CslQR"}`
    and the PostToolUse hook added `CI_MONITOR_READY`.
  - Observed effect: no coverage was lost and nothing was misdiagnosed. The
    hard error was unambiguous, so the realpath was used on the next call and
    the observer was armed before the first slice was delegated and before any
    push. Cost was one wasted tool call plus one directory listing.
  - Inference: the loud failure mode is strictly better than DD-065's silent
    one — it cannot be mistaken for "bridge unavailable" — but both arise from
    the same documented path being wrong for this project. Which of the two
    failure modes a run hits appears to depend only on whether a Nix shell has
    been entered in that worktree yet, which is not something the guidance
    mentions.

- Execution: SEED-035 story 1 / quick/148-cohesive-accepted-web-folder-changes / ea903668bb
  - Source: Doughnut / DD-074; canonical DearDough.md occurrence
  - Timestamp: unknown (during initial CI-observer setup, before the first
    slice was delegated)
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: unknown
  - Evidence: `ls .claude/skills/dough-execute-plan/scripts/ci-mailbox.mjs` in
    the freshly created worktree returned "No such file or directory", and
    `ls .claude/` there listed only `settings.json`, no `skills/`. The
    coordinator did not check `.agents/skills` first; `git ls-files
    .agents/skills | grep dough-execute-plan` (run later, during this
    retrospective) confirms `.agents/skills/dough-execute-plan/scripts/ci-mailbox.mjs`
    was already present and git-tracked in that same worktree the whole time.
  - Observed effect: instead of hitting this entry's documented
    `MODULE_NOT_FOUND` or discovering the tracked `.agents/skills` realpath,
    the coordinator ran `cp -R /Users/terryyin/git/doughnut/.claude/skills
    <worktree>/.claude/skills` to populate the missing path, then armed the
    observer from that copy. The copy worked and no coverage was lost, but
    the copy was unnecessary work and leaves the worktree's skill copy able
    to drift from the main checkout's local, gitignored `.claude/skills`
    install if either is updated later.
  - Inference: a third failure mode for the same root cause, beyond the loud
    error and DD-065's silent no-op: working around the missing path by
    duplicating a local install rather than using the already-tracked
    `.agents/skills` realpath this entry already recommends naming in the
    guidance. Reinforces that the fix, once applied, would avoid this cost
    too.

- Execution: SEED-036 story 1 / quick/149-permanent-deletion-loose-ends / a3856444de
  - Source: Doughnut / DD-074; canonical DearDough.md occurrence
  - Timestamp: 2026-09-19T10:33+08:00 (during this execution's retrospective;
    the original miss happened at CI-observer setup, before slice 1)
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: unknown
  - Evidence: at setup, `find .claude/skills/dough-execute-plan -type f`
    from the freshly created worktree errored "No such file or directory",
    and `ls .claude/` there listed only `settings.json`. The coordinator
    concluded the CI-observer runtime was unavailable and delivered all 11
    slices (11 pushes to `worktree-149-permanent-deletion-loose-ends`)
    unobserved. During the retrospective, `ls
    .agents/skills/dough-execute-plan/scripts/` in that same worktree listed
    the runtime, and `node .agents/skills/dough-execute-plan/scripts/ci-mailbox.mjs probe`
    then `start --execution nerds-odd-e/doughnut worktree-149-permanent-deletion-loose-ends`
    printed `CI_OBSERVER` and the PostToolUse hook added
    `CI_MONITOR_READY`/"CI observer attached to this coordinator" on the
    first call.
  - Observed effect: unlike both prior occurrences, the coordinator did not
    hit the documented `MODULE_NOT_FOUND` error, did not discover
    `.agents/skills`, and did not work around it with a copy — it treated
    the missing `.claude/skills` path alone as proof the bridge was
    unavailable and reported that once, per the shared skill's own fallback
    for a genuinely unavailable bridge. Ten of eleven delivered pushes went
    completely unobserved; the observer was armed only retroactively, for
    the final revision, after all slices were already delivered.
  - Inference: a fourth failure mode for the same root cause: the documented
    path's absence was treated as a terminal "no CI coverage" conclusion
    instead of a prompt to check the tracked `.agents/skills` realpath this
    entry already names as the fix. This is the costliest occurrence of the
    four — real coverage loss across most of an execution, not merely
    wasted calls or a workaround — and is further evidence the guidance
    should name `.agents/skills` directly rather than relying on each
    execution to rediscover it.

- Execution: SEED-035 story 1 / quick/260922-paste-without-formatting / 0c5e5725a0
  - Source: Doughnut / DD-074; canonical DearDough.md occurrence
  - Timestamp: unknown (2026-09-20, during this execution's initial
    CI-observer setup, before the first slice was delegated)
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: unknown
  - Evidence: `node '.claude/skills/dough-execute-plan/scripts/ci-mailbox.mjs' probe`
    run from the freshly created execution worktree
    (`.claude/worktrees/260922-paste-without-formatting`) exited non-zero with
    `Error: Cannot find module
    '/Users/terryyin/git/doughnut/.claude/worktrees/260922-paste-without-formatting/.claude/skills/dough-execute-plan/scripts/ci-mailbox.mjs'`,
    `code: 'MODULE_NOT_FOUND'`. The coordinator did not check `.agents/skills`;
    it ran `mkdir -p .claude/worktrees/260922-paste-without-formatting/.claude
    && cp -R .claude/skills .claude/worktrees/260922-paste-without-formatting/.claude/skills`
    to populate the missing path, then reprobed successfully from that copy
    (`CI_OBSERVER {"directory":"/tmp/dough-ci-501/watch-n4xced"}`). During this
    retrospective, `git ls-files .agents/skills | grep dough-execute-plan` from
    the main checkout confirms `.agents/skills/dough-execute-plan/` was already
    git-tracked, and `ls .claude/worktrees/260922-paste-without-formatting/.agents/skills/dough-execute-plan/scripts/`
    lists the runtime already present there via the ordinary worktree checkout,
    the entire time.
  - Observed effect: the same third failure mode as the SEED-035/148
    occurrence above: an unnecessary local-install copy instead of using the
    already-tracked `.agents/skills` realpath. No coverage was lost — the copy
    worked and the observer was armed before the first slice was delegated —
    but it cost one wasted probe call, one directory copy, and left the
    worktree's `.claude/skills` able to drift from the main checkout's local,
    gitignored install.
  - Inference: a second confirmed instance of this entry's third failure
    mode, on a different quick-plan (260922 vs 148) but the same coordinator
    identity pattern (SEED-035 story 1) — reinforcing that the documented
    `.claude/skills` path remains the first thing checked, with
    `.agents/skills` never consulted even though this entry already names it
    as the fix.

- **Status:** Response released; effectiveness unverified; native acceptance was dropped.
- **Response:** `ci-checkout-runtime.mjs` resolves the checkout-bound runtime by falling back from the preferred host alias to any usable same-checkout installation (`.agents` or `.claude`), avoiding false unavailability or unnecessary directory copies.
- **Released in:** 0.3.33; first containing tag v0.3.33, verified against the implementation and tagged runtime diffs.

- **Follow-up:** Native host acceptance dropped by Terry on 2026-09-24 (story `SEED-008#accept-execution-ci-native-behavior` recoverable at `b305fa5:.planning/seeds/SEED-008-worktree-branch-trunk-sync.md`); real project use is the remaining evidence source, and no native acceptance is claimed. Checkout runtime fallback across missing aliases is implemented.

- **Assessment (2026-09-25):** Runtime alias fallback is 02991a5, first containing v0.3.33 (ci-checkout-runtime.mjs checked in the tag). Ordinary attached receipts do not establish that a missing preferred alias was exercised. Watch start and review-after unknown; native acceptance remains dropped, not passed. All three current logs checked; execution releases are the supplied releases, not today's installed versions.

## ODF-087 — Native execution skips a command-readiness gate proved only by substitutes

- **Meaning:** Native execution can implement the requested outcome without the required checkout preparation and command check, while substitute actors and wording checks pass.
- **Source mappings:** Open Dough / DD-089
- **References:** Current guidance assessed: Open Dough `a3d3044`. Distinct from ODF-070 (directory-based availability claims) and ODF-088 (no setup instruction). `6d7f7f3` introduced the gate; modified `98bfa80` already contains it, and its native sessions still skipped it. This is a demonstrated failure of that modified candidate, not evidence of recurrence on the later v0.3.28 release.

### Occurrences

- Execution: `a168a39f64a75c579a713674a5dda5ca46bed6ea:.planning/quick/069-prepare-execution-worktree/PLAN.md`, first related implementation commit `6d7f7f30cea464f0ae2d6e269a3fd578d899390d`
  - Source: Open Dough / DD-089; canonical DearDough.md occurrence
  - Timestamp: 2026-09-21T09:08:13Z
  - Tool: Cursor
  - Model: Cursor Grok 4.6
  - Open Dough release: modified; revision `98bfa80bb45a2a0156318230c75f7964ec0291e6`; base `0.3.27`
  - Evidence: Cursor fresh-node `/tmp/dough-execution-worktree-prep-native-069/cursor/fresh-node/20260921T090813-3f7f/` first assessment fail (empty commands, traces present); current assessor pass on observation.json. Codex/Claude fresh-node, Cursor failed-prep/reuse, Claude wrapper: complete streams, greeting written, no gate. Prompt asks for hello-ok and does not tell the agent to install.
  - Observed effect: cheap wrapper contracts passed; five native cases skipped the gate or continued after failed prep. Not retried until green.
  - Inference: Qualified. Distinct from DD-074 (guidance now exists) and ODF-070 (directory presence). Wording greps and a substitute actor cannot prove native follow-through when the user outcome does not need project commands.

- **Follow-up:** [Accept queued-start publication in native hosts](../../.planning/seeds/SEED-008-worktree-branch-trunk-sync.md#accept-queued-start-native-behavior) — **Completed 2026-09-24**. The last requirement, Claude resume acceptance, passed a fresh native run; the retired SEED-008 entry records it and names recoverable proof for the other accepted requirements. No duplicate response was created.

- **Assessment (2026-09-25):** The completed queued-start native acceptance is retained in SEED-008 and b305fa5. It exercises queued startup; the original report concerns a standalone hello outcome bypassing preparation. No claim that those boundaries are identical or that the original gate-skip mechanism passed a week of use. Watch start and review-after unknown. All three current logs checked; execution releases are the supplied releases, not today's installed versions.

## ODF-088 — Fresh sibling worktrees reach delivery without dependencies

- **Meaning:** Worktree creation omits project dependency preparation, so delivery first discovers genuinely unavailable commands in a sibling checkout.
- **Source mappings:** Open Dough / DD-074
- **References:** Current guidance assessed: Open Dough `a3d3044`. Unlike ODF-070, these commands actually failed. Both occurrences used v0.3.27 before `6d7f7f3` introduced required preparation; they do not demonstrate a failure of that response.

### Occurrences

- Execution: `.planning/quick/067-current-proof-before-live-transitions/PLAN.md @ 9b1391db3c0e024272a2eed8fd8c8d278f3488a0`,
  first related implementation commit `e9829bc6088567742fefd2a726f6bbe7da9bc039`
  - Source: Open Dough / DD-074; canonical DearDough.md occurrence
  - Timestamp: unknown (2026-09-21)
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.27
  - Evidence: after creating the Trunk Mode worktree at
    `/Users/terryyin/.claude-worktrees/open-dough/067-current-proof-before-live-transitions`
    with `git worktree add ... claude/067-current-proof-before-live-transitions
    f59df38`, the first `npm run format` there printed `eslint: spawnSync
    eslint ENOENT`, `prettier: spawnSync prettier ENOENT`, and `Format
    failed: unresolved findings or tool failures remain.` `ls node_modules`
    confirmed the directory did not exist, while the integration checkout's
    own `node_modules` (`/Users/terryyin/git/open-dough/node_modules`) had
    102 entries. Running `npm ci` in the new worktree installed 149 packages;
    the same `npm run format` command then completed cleanly.
  - Observed effect: one wasted delivery-step attempt and diagnostic
    detour (identifying the ENOENT cause, comparing against the integration
    checkout, then installing) before delivery could proceed; no incorrect
    guidance reached the delivered plan or product, since the coordinator
    caught and resolved the gap itself before commit.
  - Inference: Qualified, single occurrence, but structurally certain to
    recur for any Node (or other dependency-manager) project using this
    project's sibling-worktree convention, since no reviewed reference
    mentions an install step. Adding one sentence to [execution
    location](.claude/skills/dough-execute-plan/references/execution-location.md)'s
    "After successful setup" step — install this project's dependencies in a
    newly created worktree before first use, when the project's package
    manager requires it — would let a future executor avoid rediscovering
    this; not tested here.

- Execution: `.planning/quick/068-truthful-ci-observation/PLAN.md`, first
  related implementation commit `8a7c7700aae49c8f44b6375894bb1496e007da83`
  - Source: Open Dough / DD-074; canonical DearDough.md occurrence
  - Timestamp: 2026-09-21T13:15:42+08:00
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.27
  - Evidence: after creating the Story Branch Mode worktree at
    `/Users/terryyin/.claude-worktrees/open-dough/068-truthful-ci-observation`
    with `git worktree add ... -b claude/068-truthful-ci-observation
    a81a305e90dcc56d7af894086b14aece7c7492e4`, the first `npm run format`
    there (during slice 1's delivery) printed the same `eslint: spawnSync
    eslint ENOENT` / `prettier: spawnSync prettier ENOENT` /
    `Format failed: unresolved findings or tool failures remain.` `ls
    node_modules` confirmed the directory did not exist. Running `npm
    install` installed the dependencies; the same `npm run format` command
    then completed cleanly.
  - Observed effect: one wasted delivery-step attempt before the coordinator
    diagnosed the cause and installed dependencies; no incorrect guidance
    reached the delivered plan or product.
  - Inference: Second occurrence, confirming this finding's original
    "structurally certain to recur" prediction across a different story and
    a different install command (`npm install` rather than `npm ci`) in the
    same project. The guidance gap identified above remains unaddressed at
    this occurrence's release (0.3.27).

- **Status:** Response released; native follow-through remains unverified.
- **Response:** `6d7f7f3` makes checkout preparation plus an applicable command a prerequisite before delegation; the source omission is repaired. Native noncompliance is retained separately as ODF-087.
- **Released in:** 0.3.28; first containing tag v0.3.28, verified against execution-location guidance.
- **Assessment (2026-09-23):** Both reported failures used older v0.3.27. No verified later exercise with release provenance establishes a watch start or review-after; neither is inferred from publication date.

- **Assessment (2026-09-25):** 6d7f7f3 first ships in v0.3.28. Later native queued-start evidence in b305fa5/SEED-008 demonstrates setup then command before feature edits on modified candidate 7581b2b, but does not establish ordinary released-use dependency preparation in the original fresh sibling scenario. Watch start and review-after unknown. All three current logs checked; execution releases are the supplied releases, not today's installed versions.

## ODF-089 — Ended observers still accept ordinary push receipts

- **Meaning:** After persistent polling errors produce a normal terminal result, later push registration and attachment still look active even though that observer will never poll the new revision.
- **Source mappings:** Open Dough / DD-090
- **References:** Current guidance assessed: Open Dough `a3d3044`. Related to ODF-065 but distinct from unexpected worker death: the recorded normal `finished` result intentionally bypasses `mailboxWorkerLoss`. Verified `8a7c770` / v0.3.28 and modified execution `a8f9eb1`; that correction detects a dead worker without a terminal result and leaves this separate normal-ended mechanism. No failed crash-detection response is inferred.

### Occurrences

- Execution: `.planning/quick/076-path-filter-aware-ci-observation/PLAN.md @ a8f9eb19be42e1b8c0a9b6e1e428fffbee6f2865`
  - Source: Open Dough / DD-090; canonical DearDough.md occurrence
  - Timestamp: 2026-09-22T07:12+00:00
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: modified; revision a8f9eb19be42e1b8c0a9b6e1e428fffbee6f2865; base 0.3.28
  - Evidence: mailbox `/tmp/dough-ci-501/watch-Q6ZEF0`'s event 3
    (`CI_MONITOR_UNAVAILABLE`, TLS timeout) and `result.json` (`finished`)
    both predate two later `register-push` calls (mtimes ~10/~30 min
    after); `ps` confirmed the worker pid was gone.
  - Observed effect: two SHAs registered against an ended observer with no
    distinguishing signal; the gap surfaced only via a manual `gh`
    cross-check near execution end.
  - Inference: Qualified, single occurrence; mechanism is deterministic and
    the triggering network instability recurred repeatedly this session, so
    recurrence is plausible. Not tested: a distinct "CI observer ended"
    hook message, mirroring "lost its worker."

- **Status:** Response released; effectiveness unverified; native acceptance was dropped.
- **Response:** `ci-host-hook.mjs` inspects `result.json` and reports terminal status instead of emitting active attachment. Managed resume (`execution-increment-resume.mjs`) returns an explicit unobserved coverage gap (`pendingCi: "unobserved"`) when an observer has ended, without duplicate push or false coverage.
- **Released in:** 0.3.33; first containing tag v0.3.33, verified against the implementation and tagged runtime diffs.

- **Follow-up:** Native host acceptance dropped by Terry on 2026-09-24 (story `SEED-008#accept-execution-ci-native-behavior` recoverable at `b305fa5:.planning/seeds/SEED-008-worktree-branch-trunk-sync.md`); real project use is the remaining evidence source, and no native acceptance is claimed. Ended observer status reporting is implemented.

- **Assessment (2026-09-25):** ddcabcb first ships in v0.3.33; tagged ci-host-hook.mjs reports normal terminal state and managed resume reports unobserved coverage. New network/discovery reports do not establish later push registration against a recorded normal-ended result. No verified exercise of that exact response; watch start and review-after unknown. All three current logs checked; execution releases are the supplied releases, not today's installed versions.

## ODF-090 — A multi-slice plan uses the single-slice local implementation exception

- **Meaning:** The coordinator applies the local single-interactive-slice exception to the first slice of a multi-slice plan, bypassing its required implementation handoff.
- **Source mappings:** Doughnut / DD-097
- **References:** Current guidance assessed: Open Dough `a3d3044`. One execution on v0.3.27; no product defect is claimed. Distinct from ODF-040, where a delegated implementer published early, and ODF-091, where independent refactoring was skipped.

### Occurrences

- Execution: quick/008-remove-zip-export / 38b5e1ef69
  - Source: Doughnut / DD-097; canonical DearDough.md occurrence
  - Timestamp: 2026-09-21T22:08:41+08:00
  - Tool: Cursor
  - Model: Cursor Grok 4.7
  - Open Dough release: 0.3.27
  - Evidence: conversation implementing catalog/settings and E2E harness edits directly; commit `38b5e1ef69` on `codex/remove-zip-export`. Slices 2 and 3 were delegated.
  - Observed effect: slice 1 was committed with its planned frontend proof. No separate implementation-agent return exists for that slice.
  - Inference: the single-slice local exception was applied to the first slice of a multi-slice plan. The record does not show a product defect from that choice.

## ODF-091 — Ordinary slice delivery substitutes coordinator review for independent refactoring

- **Meaning:** Ordinary planned slices are delivered after coordinator self-review without the required fresh refactor agent and completion marker.
- **Source mappings:** Doughnut / DD-098
- **References:** Current guidance assessed: Open Dough `a3d3044`. One execution on v0.3.27 (three commits are not three executions). Distinct triggers from ODF-062 interruption-path CI repairs and ODF-064 corrections after an earlier refactor; no shared cause or intervening correction is established.

### Occurrences

- Execution: quick/008-remove-zip-export / 38b5e1ef69
  - Source: Doughnut / DD-098; canonical DearDough.md occurrence
  - Timestamp: 2026-09-21T22:08:41+08:00
  - Tool: Cursor
  - Model: Cursor Grok 4.7
  - Open Dough release: 0.3.27
  - Evidence: same execution as DD-097; commits `38b5e1ef69`, `4711b98d93`, and `670f8e7313` have no refactor-agent report. The coordinator's slice 1 note was a local grep of notebook components.
  - Observed effect: delivery continued and the three commits landed. No independent refactor findings were recorded.
  - Inference: deletion-heavy slices made a missed cohesion issue less likely, but the required second reader did not run.

## ODF-092 — Claude Code managed delivery omits the session identity needed for first attachment

- **Meaning:** Managed delivery needs Claude Code session identity, but its taught invocation omits the identity source; the first publication is unobserved until the coordinator discovers and supplies it.
- **Source mappings:** Open Dough / DD-095; Pygardon / DD-085; Doughnut / DD-107; Pygardon / ODF-073 (plan 183 / 6e1858f16 occurrence only; earlier ordering occurrence unchanged)
- **References:** Current guidance assessed: Open Dough `7e17cba`. Distinct from ODF-073 ordering alone and ODF-103 mismatched ownership after successful attachment. v0.3.33..HEAD retains the same establishObservation session requirement and no session-source instruction in trunk-publication.md. No intervening correction found.

### Open Dough / DD-095

**Source description:**

Delivery without `--session-json` returned `pendingCi: unobserved`; no guidance
names Claude Code's `$CLAUDE_CODE_SESSION_ID`. A retry for the accepted SHA was
refused ("rebase left the pre-rebase SHA") after starting an unreported observer.

### Occurrences
- Execution: `quick/088-dough-land/PLAN.md @ 647ff01`
  - Source: Open Dough / DD-095; canonical DearDough.md occurrence
  - Timestamp: 2026-09-24T10:50:57+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: 0.3.36
  - Evidence: retry-created `watch-Vcl3dH` reused at 5650123; plus `watch-ljLxgl`.
  - Observed effect: two observers for one branch until one was stopped.
- Execution: `SEED-004#accept-delivery-evidence-native` / plan 089, first related implementation commit `eff3e76293b4564e25089bdeccbb07767e18f491`
  - Source: Open Dough / DD-095; canonical DearDough.md occurrence
  - Timestamp: unknown (first delivery, 2026-09-24 after 11:56+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.34
  - Evidence: first delivery receipt for `eff3e76` said `observation.state:
    unobserved` ("host session identity is required"); re-delivery with the same base refused
    ("rebase left the pre-rebase SHA as the candidate"); explicit
    `ci-mailbox.mjs start` + `register-push` attached it; later deliveries
    with `--session-json '{"session_id":"$CLAUDE_CODE_SESSION_ID"}'` attached
    and reused the observer.
  - Observed effect: slice 1 went briefly unobserved and needed a
    source-code search to recover; later slices were observed.
  - Inference: Same gap as the 088 occurrence, recurring in a separate
    execution the same day; a fresh Claude coordinator following only the
    references leaves increments unobserved.

- Execution: `SEED-021#identify-taken-work-owner` / plan 091, first related implementation commit `567f9b2`
  - Source: Open Dough / DD-095; canonical DearDough.md occurrence
  - Timestamp: unknown (first increment delivery, after commit `567f9b2` at
    2026-09-24T15:43:45+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: 0.3.37
  - Evidence: `567f9b2` receipt `observation.state: unobserved` ("host
    session identity is required"); `ci-mailbox.mjs start` + `register-push`
    attached `watch-IsEPZU`; later deliveries passed `--session-json` with
    `$CLAUDE_CODE_SESSION_ID` and reused it.
  - Observed effect: no duplicate observer this time, but finding the session
    field again needed a read of `ci-host-bridge.mjs`.

- Execution: `SEED-021#follow-published-story-branch` / plan 092, first related implementation commit `3f64bc7`
  - Source: Open Dough / DD-095; canonical DearDough.md occurrence
  - Timestamp: unknown (first increment delivery, after commit `3f64bc7` at
    2026-09-24T20:35:01+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: 0.3.38
  - Evidence: `3f64bc7` receipt `observation.state: unobserved`;
    `ci-mailbox.mjs start` + `register-push` attached `watch-oQrMZX`; later
    deliveries passed `--session-json` and reused it.
  - Observed effect: the session ID was taken from a tool-output path after
    rereading `ci-host-bridge.mjs`; a fourth Claude Code occurrence.

- Execution: `SEED-021#see-finished-execution` / plan 094, first related implementation commit `d4dbbdb`
  - Source: Open Dough / DD-095; canonical DearDough.md occurrence
  - Timestamp: unknown (first increment delivery, after commit `d4dbbdb` at
    2026-09-25T08:53:13+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: 0.3.38
  - Evidence: `d4dbbdb` receipt `observation.state: unobserved` ("host
    session identity is required"); `ci-mailbox.mjs start` + `register-push`
    attached `watch-Uwu3Ey`; the four later deliveries passed `--session-json`
    with `$CLAUDE_CODE_SESSION_ID` and reused it.
  - Observed effect: a fifth Claude Code occurrence; recovery again needed a
    read of `ci-host-bridge.mjs` and an environment listing.

- Execution: `SEED-038#recognize-agents-and-tools-by-avatar` / plan 097, first related implementation commit `3102053`
  - Source: Open Dough / DD-095; canonical DearDough.md occurrence
  - Timestamp: unknown (first increment delivery, after commit `3102053` at
    2026-09-25T12:50:10+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `87ffccb`
  - Evidence: `3102053` receipt `observation.state: unobserved` ("host
    session identity is required"); re-delivery with the same base,
    `--validated-candidate 3102053`, and `--session-json` taken from the
    transcript path attached `watch-5kshKo` (`reconciliations: 1`, no refusal);
    slice 2 delivery reused it.
  - Observed effect: a sixth Claude Code occurrence; recovery again needed a
    read of `ci-host-bridge.mjs`. No duplicate observer this time.

### Pygardon / DD-085

**Source description:**

Every managed increment returned `pendingCi: unobserved` because bridge verification needs a host session identity the coordinator cannot pass; coverage came only from a manual observer start plus `register-push`.

### Occurrences
- Execution: `.planning/quick/181-local-production-deployment/PLAN.md` (first implementation commit `f8eed7a92`); Timestamp: unknown (2026-09-24); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.33. Evidence: seven `execution-increment-delivery.mjs deliver` receipts (f8eed7a…e5b067e) with reason `host session identity is required to verify the notification bridge`, while `ci-mailbox.mjs probe` and a direct `start` produced `CI_MONITOR_READY` / `CI observer attached`. Effect: the coordinator ran the explicit start/register path the delivery reference says not to use. Inference: the Claude Code adapter's session identity is available to hooks but not to the delivery command's caller.
  - Source: Pygardon / DD-085; canonical DearDough.md occurrence
- Execution: `.planning/quick/182-retire-remote-distribution/PLAN.md` (first implementation commit `1d591046a`); Timestamp: unknown (first delivery after commit 2026-09-24T14:01:15+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37. Evidence: slice 1 `deliver --host claude` without `--session-json` returned `pendingCi: unobserved`; every later delivery passing `--session-json '{"session_id":"<Claude Code session id>"}'`, the id read from the session's tool-results path, returned `observation: attached`. Effect: one increment needed a manual `start` and `register-push`. Inference: the identity is obtainable by the coordinator, so the gap is that the delivery reference does not say where it comes from.
  - Source: Pygardon / DD-085; canonical DearDough.md occurrence
- Execution: `.planning/quick/185-ci-capacity-hold-attention/PLAN.md` (first implementation commit `c2170df0f`); Timestamp: unknown (2026-09-24); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: unknown. Evidence: all four `deliver --host claude` calls passed `--session-json` with the session id and transcript path read from the tool-results path; the first returned `observation: attached` (`/tmp/dough-ci-501/watch-dNRLT3`), later ones `reused`. Effect: no manual start or `register-push`. Inference: the workaround holds, but the identity still has to be derived from an incidental path.
  - Source: Pygardon / DD-085; canonical DearDough.md occurrence
- Execution: `.planning/quick/187-bounded-ci-observation/PLAN.md` (first implementation commit `132b3e53e`); Timestamp: unknown (2026-09-24); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: slice 1 `deliver --host claude` without `--session-json` returned `pendingCi: unobserved` (`host session identity is required…`) for `132b3e53e`; the coordinator then found the flag by reading `ci-host-bridge.mjs`, and slices 2–4 passing the session id and transcript path returned `attached` (`/tmp/dough-ci-501/watch-Wx0tkI`) then `reused`. Effect: slice 1 left unobserved; two script-reading calls. Inference: recurs in every fresh Claude Code execution until the delivery reference names the identity source.
  - Source: Pygardon / DD-085; canonical DearDough.md occurrence
- Execution: `.planning/quick/188-halve-ci-wall-time/PLAN.md` (first implementation commit `51b7aa206`); Timestamp: unknown (2026-09-24, ~22:00 +08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: slice 1 `deliver --host claude` without `--session-json` returned `observation.state: unobserved` (`host session identity is required…`) for `51b7aa206`; re-running with `--session-json '{"session_id":…}'` attached `/tmp/dough-ci-501/watch-PRnDi2`, later deliveries `reused`. Effect: one extra delivery call, which also tripped a replay conflict on concurrent slices' unstaged files. Inference: unchanged; the coordinator still recalls the flag only after the first miss.
  - Source: Pygardon / DD-085; canonical DearDough.md occurrence
- Execution: `.planning/quick/190-worktree-python-fast-path/PLAN.md` (first implementation commit `3f21aa9fe`); Timestamp: unknown (first delivery after commit 2026-09-25T08:33:31+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: slice 1 `deliver --host claude` without `--session-json` returned `unobserved` (`host session identity is required…`) for `3f21aa9fe`; re-running with the session id and transcript path attached `/tmp/dough-ci-501/watch-WhrBb9`. Effect: one extra delivery call. Inference: unchanged.
  - Source: Pygardon / DD-085; canonical DearDough.md occurrence
- Execution: `.planning/quick/190-tfdc-trustworthy-results/PLAN.md` at `ca9182e35` (first implementation commit `88824e3a0`); Timestamp: unknown (first delivery after commit 2026-09-25T08:26:33+08:00; observer mailbox created 08:27 +08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: coordinator's execution summary — the first managed delivery returned `observation unobserved` (host session identity required); the coordinator ran the Claude host probe (`/tmp/dough-ci-501/watch-GWpZ9O`) and started the observer by the adapter launcher (`watch-ZTiq1g`), after which deliveries reported `reused`. Effect: one extra probe and manual start. Inference: unchanged; still recurs on the first increment of each fresh Claude Code execution.
  - Source: Pygardon / DD-085; canonical DearDough.md occurrence

### Doughnut / DD-107

**Source description:**

`execution-increment-delivery.mjs deliver` returned `pendingCi: unobserved` ("host session identity is required to verify the notification bridge") although the Claude Code hook bridge was ready. The references document `--session-json` only in the usage line; recovery needed a manual probe, observer start, and `register-push`.

### Occurrences
- Execution: SEED-035 story 15 / quick/020-notebook-lfs-receive / 2dc0ce9478; Timestamp: 2026-09-24T08:49+08:00 (slice 1 delivery; its CI run was created 00:49:45Z); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.33.
  - Source: Doughnut / DD-107; canonical DearDough.md occurrence
  - Evidence: slice 1 delivery receipt `observation.reason`; later deliveries passing `--session-json '{"session_id":…}'` (from the session transcript path) reported `observation.state: reused`.
  - Observed effect: slice 1's SHA was registered by hand after its CI run already existed (`CI_DISCOVERY_DELAYED`); no coverage was lost afterwards.
  - Inference: the coordinator must discover its own session id outside guidance; a host without an obvious transcript path could leave every increment unobserved.
- Execution: SEED-035 story 1 / quick/022-browse-download-notebook-files / 70b3b67313; Timestamp: 2026-09-24T11:28+08:00 (slice 1 delivery); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.33.
  - Source: Doughnut / DD-107; canonical DearDough.md occurrence
  - Evidence: slice 1 receipt `observation.reason` "host session identity is required to verify the notification bridge"; recovered by `ci-mailbox.mjs probe` (hook added `CI_MONITOR_READY`), `start --execution … story/browse-download-notebook-files`, and `register-push`; slices 2 and 3 then reported `observation.state: reused` without `--session-json`.
  - Observed effect: slice 1's CI run was found late (`CI_DISCOVERY_DELAYED`); three extra coordinator calls; no later coverage loss.
- Execution: SEED-035 story 3 / quick/024-note-local-picture-file / f0cc15be6a; Timestamp: 2026-09-24T14:25+08:00 (slice 1 delivery); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37.
  - Source: Doughnut / DD-107; canonical DearDough.md occurrence
  - Evidence: slice 1 receipt `observation.reason` "host session identity is required to verify the notification bridge" (background Claude Code job); recovered by `ci-mailbox.mjs probe` (`CI_MONITOR_READY`), `start --execution nerds-odd-e/doughnut story/local-image-display`, and `register-push` for f0cc15be6a.
  - Observed effect: same three-call manual recovery; the release update from 0.3.33 to 0.3.37 did not change this.
- Execution: SEED-035 story 14 / quick/025-convert-raw-notebooks-to-lfs / 071d0e0861; Timestamp: 2026-09-24T15:50+08:00 (slice 1 delivery; its CI run was created 07:50:15Z); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37.
  - Source: Doughnut / DD-107; canonical DearDough.md occurrence
  - Evidence: slice 1 receipt `observation.reason` "host session identity is required to verify the notification bridge" (background Claude Code job); recovered by `ci-mailbox.mjs probe` (`CI_MONITOR_READY`), `start --execution nerds-odd-e/doughnut exec/seed-035-story-14`, and `register-push`; later deliveries reported `observation.state: reused`.
  - Observed effect: the same three-call manual recovery as earlier occurrences.
- Execution: SEED-035 story 20 / quick/026-test-file-journeys-on-lfs / 5859e6d663; Timestamp: 2026-09-24, ~17:40+08:00 (slice 1 delivery); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37.
  - Source: Doughnut / DD-107; canonical DearDough.md occurrence
  - Evidence: slice 1 receipt `observation.reason` "host session identity is required to verify the notification bridge" (background Claude Code job); recovered by `ci-mailbox.mjs probe` (`CI_MONITOR_READY`), `start --execution nerds-odd-e/doughnut main`, and `register-push` for 5c2e95c367 and 5859e6d663; the next ten deliveries reported `observation.state: reused`.
  - Observed effect: the same three-call manual recovery; the claim and slice 1 were registered late (`CI_DISCOVERY_DELAYED`).
- Execution: SEED-035 story 4 / quick/027-web-uploaded-pictures-as-notebook-files / 4250de93e1; Timestamp: 2026-09-24, ~21:22+08:00 (slice 1 delivery; commit 21:21:16+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38.
  - Source: Doughnut / DD-107; canonical DearDough.md occurrence
  - Evidence: slice 1 receipt `observation.reason` "host session identity is required to verify the notification bridge" (background Claude Code job); recovered by `ci-mailbox.mjs probe` (`CI_MONITOR_READY`), `start --execution nerds-odd-e/doughnut main`, and `register-push` for 09a299b665 and 4250de93e1; later deliveries passing `--session-json '{"session_id":…}'` reported `observation.state: reused`.
  - Observed effect: the same manual recovery plus a read of `ci-host-bridge.mjs` to learn the flag's shape; the claim and slice 1 were discovered late (`CI_DISCOVERY_DELAYED`); unchanged in 0.3.38.

- Execution: SEED-035 story 19 / quick/029-remove-raw-file-storage / 0284ea7f52; Timestamp: 2026-09-25T09:21+08:00 (slice 1 delivery); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38.
  - Source: Doughnut / DD-107; canonical DearDough.md occurrence
  - Evidence: slice 1 receipt `observation.reason` "host session identity is required to verify the notification bridge" (background Claude Code job, Story Branch Mode); recovered by `ci-mailbox.mjs probe` (`CI_MONITOR_READY`) and re-running `deliver` for the accepted SHA with `--session-json '{"session_id":…}'`, which reported `observation.state: attached`.
  - Observed effect: two extra calls; a simpler recovery than `start` plus `register-push`, still discovered only by reading the receipt.

### Pygardon / ODF-073 (plan 183 occurrence only)

- Execution: `.planning/quick/183-stooq-retry-control/PLAN.md` at `6e1858f16`; Timestamp: 2026-09-24T11:26:52+08:00; Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.33. Evidence: slice 1 `execution-increment-delivery.mjs deliver --host claude` without `--session-json` returned `pendingCi: unobserved` ("host session identity is required"); the coordinator then probed, started `watch-mAof9e` and ran `register-push` for `6e1858f16`. Observed effect: first increment unobserved at push; later deliveries passed `--session-json` and attached. Inference: the Claude-host delivery's need for session identity is not stated where the delivery command is taught.
  - Source: Pygardon / ODF-073, plan 183 occurrence only; former local DD-057 belongs to the earlier ordering report.

- **Assessment (2026-09-25):** Twenty failing executions across three projects (Open Dough six, Pygardon seven including plan 183, Doughnut seven). Pygardon plan 185 is a separate successful-workaround observation, not a twenty-first failure. Unknown releases remain unknown. Confirmed failures span 0.3.33, 0.3.34, 0.3.36, 0.3.37, and 0.3.38; managed delivery first shipped in 0.3.33, but no subsequent session-source correction is claimed.

- **Follow-up:** [Attach CI observation to the first Claude Code publication](../../.planning/seeds/SEED-008-worktree-branch-trunk-sync.md#attach-first-claude-publication) — **queued, not resolved**. Selected by the authorized 2026-09-25 runbook maintenance cycle.

## ODF-093 — A bare stash pop consumes another session's repository-wide stash

- **Meaning:** A failed stash push is followed by an unqualified stash pop, applying another session's shared stash.
- **Source mappings:** Open Dough / DD-094
- **References:** Current guidance assessed: Open Dough `7e17cba`. Distinct from ODF-105, which stashes another live writer's files in the first place. One severe ownership failure warrants retention despite recovery.

### Open Dough / DD-094

**Source description:**

Stashes are shared by all worktrees. After a failed `git stash push -- $G` (zsh),
`git stash pop` applied an unrelated Codex session's stash; delegation is silent.

### Occurrences
- Execution: `quick/088-dough-land/PLAN.md @ 647ff01`
  - Source: Open Dough / DD-094; canonical DearDough.md occurrence
  - Timestamp: unknown; 2026-09-24 between e2a453e (10:40:49+08:00) and 647ff01
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: 0.3.36
  - Evidence: slice 1 implementation report; foreign `stash@{0}` still listed.
  - Observed effect: four conflicted files restored; a clean pop drops the stash.

## ODF-094 — Hook-owned lint restrictions are applied where no hook owns lint

- **Meaning:** Delegation treats the restriction on hook-owned lint as a ban on all lint in a project without a commit hook, delaying mechanical defects until coordinator delivery.
- **Source mappings:** Open Dough / DD-093
- **References:** Current guidance assessed: Open Dough `7e17cba`. No general lint failure or response is inferred; this is the reported hook-ownership ambiguity.

### Open Dough / DD-093

**Source description:**

The delegation contract forbids agents an "independent hook-owned lint
command". In a project with no commit hook, where the formatter command also
runs lint, the coordinator applied that ban to all lint. Lint findings then
surfaced only at the coordinator's formatting step, after refactoring.

### Occurrences
- Execution: `SEED-026#auto-refresh-published-dashboard @ dcb0944`
  - Source: Open Dough / DD-093; canonical DearDough.md occurrence
  - Timestamp: 2026-09-23T20:45:01+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.30
  - Evidence: Plan 084. The repository has no `.git/hooks` entries or
    `core.hooksPath`; `npm run format` (`scripts/lint.mjs --fix`) also runs
    ESLint. Every delegation prompt said "do not run lint". The coordinator's
    format step then failed on `no-unnecessary-condition` in slice 1
    (`dcb0944`, timestamp of that commit), and on `require-await` and
    `no-deprecated` in slice 2 (`9feec0e`).
  - Observed effect: Three mechanical lint defects were fixed by the
    coordinator after the refactor pass, each followed by a focused or full
    test rerun; later prompts listed the lint rules to compensate.
  - Inference: The coordinator over-read "hook-owned"; the guidance does not
    say what applies when no hook owns lint. Cost was small per slice
    (minutes), and it compounds with ODF-064 because the fixes landed after
    the refactor pass.

## ODF-095 — Behavior slices duplicate native acceptance orchestration

- **Meaning:** Successive behavior slices clone native run and fixture scaffolding instead of sharing the same orchestration responsibility.
- **Source mappings:** Open Dough / DD-092
- **References:** Current guidance assessed: Open Dough `7e17cba`. Concrete residue corrected by 8c2fa5a (shared native harness), first containing tag v0.3.35. The diff removes four runner/fixture clones and introduces one shared runner. This repairs the repository residue; it does not demonstrate prevention of future slice-driven duplication.

### Open Dough / DD-092

**Source description:**

Plan 085 told slice 1 to create the smallest shared fixture/runner adaptation
and keep it with the behavior rather than a standalone framework slice. Slices
2–4 each shipped near-complete `delivery-evidence-*-native-run.sh` clones (and
largely duplicated fixture scaffolding) instead of extending one harness.
Aggregate residue is ~3.3k LOC across 20 support files; claims↔gaps run scripts
are nearly identical rename-only diffs. Credential-free assessors and
case-specific observe/assess/scenario bodies remain sound; orchestration is the
waste.

### Occurrences
- Execution: `SEED-004#accept-delivery-evidence` / plan 085 @ `2e96700a5e2aae750950fe7095e788cd605ef1bd` (first implementation commit; clones completed through `a36f7ffd2050e23c1395438f9e389220be0b2787`)
  - Source: Open Dough / DD-092; canonical DearDough.md occurrence
  - Timestamp: 2026-09-23T17:25:45+08:00
  - Tool: Cursor
  - Model: unknown
  - Open Dough release: modified; revision a36f7ffd2050e23c1395438f9e389220be0b2787; base 0.3.32
  - Evidence: Aggregate diff `59b76944..a36f7ffd` adds four parallel
    `tests/support/delivery-evidence-{selection,claims,consumers,gaps}-native-*.sh`
    sets; plan 085 Proof approach said first slice creates the shared
    adaptation; retrospective correction plan
    `8c2fa5aad53c1189f0bc86b6cc4289fc26e8b4d4:.planning/quick/086-share-delivery-evidence-native-harness/PLAN.md`.
  - Observed effect: Four Behavior slices delivered acceptance mechanisms with
    Cursor native proof, but left shotgun run/fixture residue requiring a
    follow-up Structure correction before maintainable extension.
  - Inference: Keeping the fixture “with the behavior” plus Behavior-only
    decomposition, without a Structure consolidation slice, induced copy-paste
    across slices; per-slice post-change refactor could not see the later clones
    as one concept until aggregate review.

- **Assessment (2026-09-25):** 8c2fa5a first ships in v0.3.35 and removes the reported runner/fixture clones. Plan 089 uses the resulting harness, but its reported guidance v0.3.34 does not identify the source harness revision used per run. General prevention of cross-slice duplication remains unverified. No whole-finding watch; relevant source-use provenance is incomplete. All three current logs checked; execution releases are the supplied releases, not today's installed versions.

- **Status:** Concrete response released; effectiveness beyond the corrected boundary unverified.
- **Response:** `8c2fa5a`: One shared native run harness replaces the four copied runner/fixture sets; general slice-level prevention is not established.
- **Released in:** 0.3.35; first containing tag `v0.3.35`, verified by containment and implementation diff.

## ODF-096 — Positive native acceptance fixtures fail their own promised behavior

- **Meaning:** Nominally sufficient native acceptance fixtures do not actually satisfy their promises, and the same fault class is rediscovered through paid failing runs.
- **Source mappings:** Open Dough / DD-096
- **References:** Current guidance assessed: Open Dough `7e17cba`. Distinct from ODF-067 refusal fixtures: this is a false sufficient control. Case repairs in eff3e76/c33dbea and later plan 089 work correct examples, not a demonstrated general prevention response.

### Open Dough / DD-096

**Source description:**

In three of the four delivery-evidence cases, the scenario meant to show
sufficient proof proceeding was not credibly sufficient. It used
marker-string products, committed the "returned" correction in the baseline,
or made a promise the product did not meet. Stricter hosts rightly refused.
The plan allowed test-support fixes only after a run diagnosed a fault, so the
known fault class was rediscovered with a paid failing run per case.

### Occurrences
- Execution: `SEED-004#accept-delivery-evidence-native` / plan 089, first related implementation commit `eff3e76293b4564e25089bdeccbb07767e18f491`
  - Source: Open Dough / DD-096; canonical DearDough.md occurrence
  - Timestamp: unknown (2026-09-24, slices 1, 2, and 4)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.34
  - Evidence: plan 089 slice results (selection: Codex refused marker flags;
    claims: Claude "There's no uncommitted work"; gaps: Claude showed `push`
    contradicts "put back first"). Observer layout misses cost further
    reruns in slices 1–3.
  - Observed effect: at least one failed native run per slice before a
    pass. Cursor's earlier acceptance ran on the weaker fixtures.
  - Inference: A pre-run review of each case's sufficient side against the
    accept-proof rule, allowed as fixture preparation, would likely have saved
    most of those runs. Useful practice: an offline byte-identical fixture
    comparison kept the native evidence valid through each refactor.

## ODF-097 — Semicolon chaining publishes after a formatter failure

- **Meaning:** A formatter failure does not stop a semicolon-separated commit and push sequence.
- **Source mappings:** Open Dough / DD-097
- **References:** Current guidance assessed: Open Dough `7e17cba`. Distinct from ODF-100 pipeline exit-status masking. Explicit failure was observed before publication; do not discard the escaped CI failure as harmless one-off noise.

### Open Dough / DD-097

**Source description:**

The coordinator chained the formatter and commit with `;`, not `&&`. It
committed and pushed a change that failed ShellCheck, even though wrap-up
says formatting must succeed before staging.

### Occurrences
- Execution: `SEED-004#accept-delivery-evidence-native` / plan 089, first related implementation commit `eff3e76293b4564e25089bdeccbb07767e18f491`
  - Source: Open Dough / DD-097; canonical DearDough.md occurrence
  - Timestamp: 2026-09-24T12:22:01+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.34
  - Evidence: slice 2 command printed `fmt=1` then committed `c33dbea`; CI
    `lint` failed with SC2016; repair `0662ed2` passed.
  - Observed effect: one extra commit, push, and failed CI run.
  - Inference: A one-off coordinator error, not a guidance gap; gate
    commands with `&&`.

## ODF-098 — An early slice depends on proof only a later slice can satisfy

- **Meaning:** A slice is planned with a required existing suite that cannot pass until a later slice implements its new invariant.
- **Source mappings:** Open Dough / DD-098
- **References:** Current guidance assessed: Open Dough `7e17cba`. One supported execution, repaired by resequencing; no general planning correction is established.

### Open Dough / DD-098

**Source description:**

Plan 091 mapped slice 1's proof to the startup race suite, but race-safe
agent-name choice was slice 3, whose seam note predicted the failure without
it. Slice 1 was not CI-safe until slice 3 was folded into it.

### Occurrences
- Execution: `SEED-021#identify-taken-work-owner` / plan 091, first related implementation commit `567f9b2`
  - Source: Open Dough / DD-098; canonical DearDough.md occurrence
  - Timestamp: unknown (first slice-1 return, before commit `567f9b2` at
    2026-09-24T15:43:45+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: 0.3.37
  - Evidence: plan at `4479710` (slice 1 Proof lists
    `workspace-publication-startup-race.test.mjs`; slice 3 Seam); first
    slice-1 return had 2 of 5 race tests failing; plan Learnings in `567f9b2`.
  - Observed effect: one extra implementation round and a re-sequencing.
  - Inference: Qualified. Planning checked that each slice ends CI-safe
    without tracing which existing suites a new invariant (unique active
    agent names) would break.

## ODF-099 — Startup receipts expose complete Git index listings

- **Meaning:** Startup serializes full before/after Git index snapshots into its coordinator receipt, hiding necessary fields behind oversized tool output.
- **Source mappings:** Open Dough / DD-099; Pygardon / DD-088; Doughnut / DD-108
- **References:** Current guidance assessed: Open Dough `7e17cba`. Distinct from retired ODF-006 (agent chooses oversized document reads): this is runtime output scaling with repository size. Historical catalog reviewed; no code reuse or claimed prior fix.

### Open Dough / DD-099

**Source description:**

`execution-start.mjs start` printed a 227 KB receipt. About 222 KB were
`beforeMaintenance.index` and `afterMaintenance.index`, listings of the
default checkout's staged files; the coordinator needed only results and SHAs.

### Occurrences
- Execution: `SEED-021#follow-published-story-branch` / plan 092, first related implementation commit `3f64bc7`
  - Source: Open Dough / DD-099; canonical DearDough.md occurrence
  - Timestamp: 2026-09-24T20:27:08+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: 0.3.38
  - Evidence: Take `1443c42` receipt; index fields 110,899 and 110,980 chars.
  - Observed effect: the host saved the output to a file; one extra command
    was needed to read the receipt without the listings.
  - Inference: Qualified. A host that inlines tool output would spend roughly
    55k tokens of context on it at every startup.
- Execution: `SEED-021#see-finished-execution` / plan 094, first related implementation commit `d4dbbdb`
  - Source: Open Dough / DD-099; canonical DearDough.md occurrence
  - Timestamp: 2026-09-25T08:40:30+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: 0.3.38
  - Evidence: Take `04a034b` receipt, 227.3 KB, saved to a file by the host;
    `beforeMaintenance.index` and `afterMaintenance.index` again held the listings.
  - Observed effect: one extra command stripped the index fields to read the
    receipt; recurs at every startup.

- Execution: `SEED-038#recognize-agents-and-tools-by-avatar` / plan 097, first related implementation commit `3102053`
  - Source: Open Dough / DD-099; canonical DearDough.md occurrence
  - Timestamp: 2026-09-25T12:42:19+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `87ffccb`
  - Evidence: Take `c995852` receipt, 230.6 KB, saved to a file by the host;
    `beforeMaintenance.index` (115,287 chars) and `afterMaintenance.index`
    (115,367 chars) held the listings.
  - Observed effect: one extra command stripped the index fields to read the
    receipt; a third startup occurrence.

### Pygardon / DD-088

**Source description:**

`execution-start.mjs start` printed `beforeMaintenance.index` and `afterMaintenance.index` as full `git ls-files --stage` listings, so the claim receipt was about 578 KB.

### Occurrences
- Execution: `.planning/quick/185-ci-capacity-hold-attention/PLAN.md` (first implementation commit `c2170df0f`); Timestamp: unknown (2026-09-24); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: unknown. Evidence: the start receipt was persisted as an oversized tool result (577.8 KB) and had to be re-read through a filtering script to find `status`, `publishedSha` and the maintenance results. Effect: one extra call and a context-heavy preview. Inference: the index is maintenance evidence the coordinator never needs in the receipt; a digest or omission would do.
  - Source: Pygardon / DD-088; canonical DearDough.md occurrence
- Execution: `.planning/quick/187-bounded-ci-observation/PLAN.md` (first implementation commit `132b3e53e`); Timestamp: unknown (2026-09-24); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: the claim receipt for `8d5010ce7` was persisted as an oversized tool result (580.8 KB) and re-read through a filtering script. Effect: one extra call. Inference: unchanged by the 0.3.38 update.
  - Source: Pygardon / DD-088; canonical DearDough.md occurrence
- Execution: `.planning/quick/188-halve-ci-wall-time/PLAN.md` (first implementation commit `51b7aa206`); Timestamp: unknown (2026-09-24); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: the claim receipt for `b49624f1b` was persisted as an oversized tool result (580.9 KB); only its preview was usable. Effect: context-heavy preview. Inference: unchanged.
  - Source: Pygardon / DD-088; canonical DearDough.md occurrence
- Execution: `.planning/quick/190-worktree-python-fast-path/PLAN.md` (first implementation commit `3f21aa9fe`); Timestamp: unknown (claim `1e69bb258` at 2026-09-25T08:20:51+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: the claim receipt was persisted as an oversized tool result (581.2 KB) and re-read through a filtering script. Effect: one extra call. Inference: unchanged.
  - Source: Pygardon / DD-088; canonical DearDough.md occurrence

### Doughnut / DD-108

**Source description:**

`execution-start.mjs start` prints `beforeMaintenance.index` (the full staged index listing of the default checkout) inside its one-line JSON receipt. On this repository the receipt was 811 KB, so the host saved it to a file and showed only a 2 KB preview; the fields the coordinator must retain (`publishedSha`, `workspace`, `preparation`) happened to be in that preview.

### Occurrences
- Execution: SEED-035 story 1 / quick/022-browse-download-notebook-files / 70b3b67313; Timestamp: 2026-09-24T11:09+08:00 (queued startup); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.33.
  - Source: Doughnut / DD-108; canonical DearDough.md occurrence
  - Evidence: startup call output "Output too large (811.3KB)"; preview shows `beforeMaintenance.result: deferred`, `reason: unclear-ownership`, then `index: "100644 … .agents/agent-map.md\n…"`.
  - Observed effect: the exact receipt the skill requires preserving was not fully visible in context; later fields (for example refresh results after the index) were unread.
  - Inference: a maintenance diagnostic that lists every tracked file scales with repository size; a count or digest would keep the receipt usable.
- Execution: SEED-035 story 3 / quick/024-note-local-picture-file / f0cc15be6a; Timestamp: 2026-09-24T14:10+08:00 (queued startup); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37.
  - Source: Doughnut / DD-108; canonical DearDough.md occurrence
  - Evidence: startup call output "Output too large (814.6KB)"; `beforeMaintenance.index` holds the full index listing.
  - Observed effect: the coordinator needed an extra `python3` call to read the receipt's later fields (`afterMaintenance: advanced`, `projectSetupRequired: true`).
- Execution: SEED-035 story 14 / quick/025-convert-raw-notebooks-to-lfs / 071d0e0861; Timestamp: 2026-09-24, ~15:45+08:00 (queued startup, between readiness commit 47df9474c2 and slice 1); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37.
  - Source: Doughnut / DD-108; canonical DearDough.md occurrence
  - Evidence: startup call output "Output too large (815.7KB)"; `beforeMaintenance.index` holds the full index listing.
  - Observed effect: an extra `python3` call was needed to read `afterMaintenance` and `projectSetupRequired`.
- Execution: SEED-035 story 20 / quick/026-test-file-journeys-on-lfs / 5859e6d663; Timestamp: 2026-09-24, ~17:28+08:00 (queued startup); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37.
  - Source: Doughnut / DD-108; canonical DearDough.md occurrence
  - Evidence: startup call output "Output too large (816.5KB)"; `beforeMaintenance.index` and `afterMaintenance.index` hold the full index listing.
  - Observed effect: an extra `python3` call was needed to read `afterMaintenance` and `projectSetupRequired`.
- Execution: SEED-035 story 4 / quick/027-web-uploaded-pictures-as-notebook-files / 4250de93e1; Timestamp: 2026-09-24, ~21:17+08:00 (queued startup; Take commit 21:16:55+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38.
  - Source: Doughnut / DD-108; canonical DearDough.md occurrence
  - Evidence: startup call output "Output too large (817.8KB)"; `beforeMaintenance.index` and `afterMaintenance.index` hold the full index listing.
  - Observed effect: an extra `python3` call was needed to read `afterMaintenance` and `projectSetupRequired`.

- Execution: SEED-035 story 19 / quick/029-remove-raw-file-storage / 0284ea7f52; Timestamp: 2026-09-25T09:02+08:00 (queued startup; Take commit 09:01:48+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38.
  - Source: Doughnut / DD-108; canonical DearDough.md occurrence
  - Evidence: startup call output "Output too large (817.8KB)"; `beforeMaintenance.index` holds the full index listing.
  - Observed effect: an extra `node` call was needed to read `afterMaintenance` and `projectSetupRequired`.

## ODF-100 — A formatter pipeline masks failure behind tail success

- **Meaning:** A formatter piped through tail returns the final pipeline stage's success, allowing subsequent delivery steps after formatter failure.
- **Source mappings:** Pygardon / DD-084
- **References:** Current guidance assessed: Open Dough `7e17cba`. Distinct from ODF-097 semicolon chaining; the commit hook prevented a bad commit in this occurrence.

### Pygardon / DD-084

**Source description:**

The coordinator chained `pnpm format:changed | tail` with `&&` into the plan edit and commit; the pipeline's exit status was `tail`'s, so a failed formatter let the plan edit and commit attempt proceed.

### Occurrences
- Execution: `.planning/quick/183-stooq-retry-control/PLAN.md` at `6e1858f16`; Timestamp: unknown (slice 2 delivery, between push 2026-09-24T11:26:52+08:00 and commit 2026-09-24T11:39:03+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.33. Evidence: biome `noNonNullAssertion` in `frontend/src/pages/StooqAvailabilityCard.test.tsx` failed formatting; the check-only commit hook refused the commit. Observed effect: no bad commit; one fix-and-retry. Inference: capture formatter output to a file and test its exit status before continuing.
  - Source: Pygardon / DD-084; canonical DearDough.md occurrence

## ODF-101 — Known CI capacity recovery is ordered after dependent delivery

- **Meaning:** A plan inherits a known CI capacity shortage but schedules the owned resource cleanup near the end, leaving early increments without CI verdicts.
- **Source mappings:** Pygardon / DD-086
- **References:** Current guidance assessed: Open Dough `7e17cba`. Related to ODF-074 unverified premises, but the shortage was already known and the concrete failure is dependency ordering.

### Pygardon / DD-086

**Source description:**

The story that retired the remote distribution planned the removal of retired images as its second-to-last slice, although the shared engine was already below the in-app CI reserve, so CI observed none of the story's first five increments.

### Occurrences
- Execution: `.planning/quick/182-retire-remote-distribution/PLAN.md` (first implementation commit `1d591046a`); Timestamp: unknown (slice 2 delivery, 2026-09-24 between 14:01 and 14:28 +08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37. Evidence: observer event `CI_MONITOR_UNAVAILABLE` "CI deferred: Docker engine has 13352247296 free bytes; 16106127360 required"; increments `1d591046a`…`f7aefb5c1` unobserved; after the owner approved removing five retired GHCR/updater images (free 13.4 → 18.9 GB) CI passed `8453b7099` and `9ca5d843b`. The previous story's ODF-074 row records the same shortage. Effect: no CI verdict until late in the execution; an owner decision was needed mid-execution. Inference: when planning inherits a known capacity blocker, freeing owned, already-retired resources belongs first.
  - Source: Pygardon / DD-086; canonical DearDough.md occurrence

## ODF-102 — Command-adapter startup exposes retained historical attempts

- **Meaning:** Before registration, command-adapter discovery exposes retained historical CI attempts as actionable execution failures.
- **Source mappings:** Pygardon / DD-090
- **References:** Current guidance assessed: Open Dough `7e17cba`. 50b6d71 adds the shared startup snapshot filter to command adapters; first containing tag v0.3.38. The later v0.3.38 ancestor report does not establish recurrence of the older-history mechanism: the filter deliberately retains the newest completed attempt. Related uncertain ancestor report is ODF-109.

### Pygardon / DD-090

**Source description:**

Before any revision is registered, `watch-ci-execution.mjs` treats every discovered attempt as actionable (`registeredShas.length === 0 ? matching : …`), and the command-adapter path has no startup-snapshot pruning (`startupCiRuns` runs only for GitHub). With this project's adapter returning all retained attempts, oldest first, the first poll emitted the oldest failure and cancellation.

### Occurrences
- Execution: `.planning/quick/185-ci-capacity-hold-attention/PLAN.md` (first implementation commit `c2170df0f`); Timestamp: unknown (2026-09-24); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37 (installed watcher identical to upstream `8932c16`). Evidence: mailbox `/tmp/dough-ci-501/watch-dNRLT3` events 1–2 were `CI_FAILURE` for `79b4895f4` (2026-09-15 `setup_error`, attempt #1 of 218 in `/api/ci`) and `CI_INCOMPLETE` for `cc1dc16a6` (2026-09-16 `interrupted`); neither was registered. Both `complete-revision` receipts returned `shutdown: retained, reason: unread_actionable_failure`. Effect: the completion gate could not confirm shutdown, so worktree retirement needed an owner-approved explicit `stop`. Inference: SEED-048's finding that the watcher reports only pushed revisions and their ancestors does not hold before the first registration, and bounding history to 100 attempts would still expose retained failures at startup.
  - Source: Pygardon / DD-090; canonical DearDough.md occurrence
- Execution: `.planning/quick/190-worktree-python-fast-path/PLAN.md` (first implementation commit `3f21aa9fe`); Timestamp: unknown (2026-09-25, first attach after 08:33 +08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: the attach that registered `3f21aa9fe` on `worktree-python-fast-path` immediately delivered `CI_FAILURE` for `b937d2ab6`, an earlier trunk revision this execution never registered (two E2E scenarios). Effect: one classification step; no repair. Inference: likely the same pre-registration exposure, reached through managed delivery's first attach; not confirmed against the watcher code.
  - Source: Pygardon / DD-090; canonical DearDough.md occurrence

- **Assessment (2026-09-25):** 50b6d71/v0.3.38 corrects older completed-attempt filtering. The v0.3.38 row in this adopted source finding reports a recent ancestor with cause explicitly unconfirmed; ODF-109 retains another execution with that uncertainty. Neither proves the older-history correction failed, but the unresolved reports prevent a success watch. Watch start and review-after unknown. All three current logs checked; execution releases are the supplied releases, not today's installed versions.

- **Status:** Concrete response released; effectiveness beyond the corrected boundary unverified.
- **Response:** `50b6d71`: Shared startup snapshot filtering suppresses older completed command-adapter attempts.
- **Released in:** 0.3.38; first containing tag `v0.3.38`, verified by containment and implementation diff.

## ODF-103 — Managed delivery and the host hook claim different mailbox owners

- **Meaning:** Managed delivery hashes mailbox ownership from the execution checkout while the real hook hashes the originating checkout, so attached receipts can coexist with no delivered events.
- **Source mappings:** Pygardon / DD-091
- **References:** Current guidance assessed: Open Dough `7e17cba`. Distinct from ODF-052: 4fa48f0/v0.3.24 admitted same-repository mailboxes, but did not normalize the later owner hash. 50b6d71 changes that hash to checkoutIdentity; first containing tag v0.3.38. No demonstrated post-fix recurrence of this hash mismatch is supplied.

### Pygardon / DD-091

**Source description:**

`ci-host-hook.mjs` hashes the owner from `checkoutRoot`, the checkout holding the running script. Managed delivery binds with the execution worktree's hook (root `…/pygardon-worktrees/ci-capacity-hold-attention/`), while Claude Code runs the hook from `$CLAUDE_PROJECT_DIR` (root `…/pygardon/`). The mailbox `owner` file therefore holds a hash the real hook rejects (`EEXIST`, different owner), contrary to the adapter documentation's same-`git-common-dir` rule.

### Occurrences
- Execution: `.planning/quick/185-ci-capacity-hold-attention/PLAN.md` (first implementation commit `c2170df0f`); Timestamp: unknown (2026-09-24); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37 (installed watcher identical to upstream `8932c16`). Evidence: mailbox `owner` = `a8633e59…` = sha256 of `["/Users/terryyin/git/pygardon-worktrees/ci-capacity-hold-attention/","claude","b114cd8a-…",""]`; the real hook created the empty binding directory `owner-9db3d794…` for root `/Users/terryyin/git/pygardon/`; result `deliveredThrough: 0, unread: 4`. Effect: every delivery receipt said `observation: attached` while no CI event reached the coordinator. Inference: DD-085's session-identity workaround gets managed delivery to attach, but in a worktree execution it binds to the wrong owner; the likely fix is an owner identity from the repository's common directory or the host's project directory.
  - Source: Pygardon / DD-091; canonical DearDough.md occurrence

- **Assessment (2026-09-25):** 50b6d71/v0.3.38 normalizes the owner hash; the earlier report used v0.3.37. Subsequent attached/reused receipts alone cannot demonstrate real hook delivery across both roots. The cause of ODF-112 is unresolved. Watch start and review-after unknown; do not retire from apparent attachment. All three current logs checked; execution releases are the supplied releases, not today's installed versions.

- **Status:** Concrete response released; effectiveness beyond the corrected boundary unverified.
- **Response:** `50b6d71`: The hook owner hash uses the common repository checkout identity.
- **Released in:** 0.3.38; first containing tag `v0.3.38`, verified by containment and implementation diff.

## ODF-104 — Increment delivery defers checkout refresh without a reason

- **Meaning:** Managed publication returns only a deferred maintenance label, preventing the coordinator from understanding why a clean default checkout was not refreshed.
- **Source mappings:** Pygardon / DD-092; Doughnut / DD-110
- **References:** Current guidance assessed: Open Dough `7e17cba`. Same concrete receipt omission in both projects; preserve the distinction between missing explanation and an unverified refresh defect.

### Pygardon / DD-092

**Source description:**

Every `execution-increment-delivery.mjs deliver` receipt reported `maintenance: "deferred"` with no reason while the default checkout was clean, on `main`, and a strict ancestor of the accepted trunk revision.

### Occurrences
- Execution: `.planning/quick/187-bounded-ci-observation/PLAN.md` (first implementation commit `132b3e53e`); Timestamp: unknown (2026-09-24); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: four delivery receipts (`132b3e53e`, `d4d26f8df`, `b5d361cc6`, `4fc8a4c79`) each said `deferred`; each time the coordinator re-ran the Refresh eligibility checks by hand (clean status, no `index.lock`, ancestor of `origin/main`) and `git merge --ff-only` advanced the checkout. Effect: four manual refreshes and one reference lookup. Inference: delivery either skips refresh deliberately or defers for a reason it does not report; the receipt should say which.
  - Source: Pygardon / DD-092; canonical DearDough.md occurrence

### Doughnut / DD-110

**Source description:**

`execution-increment-delivery.mjs deliver` returned `maintenance: "deferred"` on every Trunk Mode publication with no reason or remote/head fields, while the startup receipt reports its maintenance result with `reason`, `remoteSha` and `head`.

### Occurrences
- Execution: SEED-035 story 20 / quick/026-test-file-journeys-on-lfs / 5859e6d663; Timestamp: 2026-09-24, ~17:40–18:55+08:00 (eleven increment deliveries); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37.
  - Source: Doughnut / DD-110; canonical DearDough.md occurrence
  - Evidence: delivery receipts for 5859e6d663 … 47a3bdd0ab each show only `maintenance: deferred`; at the end the default checkout was clean at eb957e4e7e while origin/main was 47a3bdd0ab.
  - Observed effect: the coordinator could not tell whether the refresh was blocked (ownership, dirty tree) or just skipped, and the default checkout was left behind trunk.
  - Inference: surfacing the same maintenance record as startup would let the coordinator decide whether a manual refresh is safe.
- Execution: SEED-035 story 4 / quick/027-web-uploaded-pictures-as-notebook-files / 4250de93e1; Timestamp: 2026-09-24, ~21:22–22:03+08:00 (five increment deliveries); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38.
  - Source: Doughnut / DD-110; canonical DearDough.md occurrence
  - Evidence: delivery receipts for 4250de93e1, a061808c28, 682259779a, 0e760d4933 and f4d1ec8d5c each show only `maintenance: deferred`, while startup's `afterMaintenance` had advanced the default checkout.
  - Observed effect: same as before; the coordinator could not tell why the default checkout was left behind trunk.

## ODF-105 — Coordinator staging removes a live writer's changes into a stash

- **Meaning:** A delivery command stashes another active slice's uncommitted files instead of staging only owned paths.
- **Source mappings:** Pygardon / DD-094
- **References:** Current guidance assessed: Open Dough `7e17cba`. Distinct from ODF-093 consuming a foreign stash and ODF-082 editing during refactor. Work was restored; concurrent writer interference remains actionable.

### Pygardon / DD-094

**Source description:**

While committing one increment, the coordinator's compound shell command also ran `git stash push -- <paths>` on another running slice's uncommitted files in the shared execution worktree.

### Occurrences
- Execution: `.planning/quick/188-halve-ci-wall-time/PLAN.md` (first implementation commit `51b7aa206`); Timestamp: unknown (2026-09-24, after commit `6bc2fda73`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: the command that committed `6bc2fda73` ended with `git stash push -m halve-ci-slice3-hold -- .dockerignore Dockerfile.ci docs/container-checks.md tests/test_ci_python_container.py`; the next status showed the files clean; `git stash apply 3d6079e70` restored them and the entry was dropped; the owning agent confirmed by `cmp` that its container proof used a separate clone. Effect: a few seconds of missing work under a live agent; no loss. Inference: separable staging (`git add <owned paths>`) already isolates an increment; a stash is never needed for it and violates the pause contract when a writer is live.
  - Source: Pygardon / DD-094; canonical DearDough.md occurrence

## ODF-106 — Concurrent plans collide on a numeric invocation

- **Meaning:** Concurrent unpublished plan allocation produces two quick plans with the same numeric selector, making a number-only execution request ambiguous.
- **Source mappings:** Pygardon / DD-095
- **References:** Current guidance assessed: Open Dough `7e17cba`. One execution; canonical full paths remain distinct. No automatic renumbering or cancellation is implied.

### Pygardon / DD-095

**Source description:**

Plans `quick/190-tfdc-trustworthy-results` (`e12052786`) and `quick/190-worktree-python-fast-path` (`de51f36b1`) were committed minutes apart with the same number, so `/dough-execute-plan 190` was ambiguous.

### Occurrences
- Execution: `.planning/quick/190-worktree-python-fast-path/PLAN.md` (first implementation commit `3f21aa9fe`); Timestamp: 2026-09-25T08:16:43+08:00 (second plan commit); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: both directories under `.planning/quick/`; the coordinator resolved the number from the Taken entry, the TFDC worktree, and the latest commit message saying "add plan 190". Effect: three disambiguation calls and a stated assumption. Inference: plan-number allocation does not see a concurrent session's unpublished plan; publishing-time collision checks or a name-based argument would remove the ambiguity.
  - Source: Pygardon / DD-095; canonical DearDough.md occurrence

## ODF-107 — Changed message proof omits another contract consumer

- **Meaning:** A changed user-visible error message is accepted using local unit/API proof while another test consumer of the old contract remains broken.
- **Source mappings:** Pygardon / DD-097
- **References:** Current guidance assessed: Open Dough `7e17cba`. Related to retired ODF-075 and f0f355c/v0.3.33 shared-consumer response, still present through v0.3.38. The new record proves a missed message consumer, not the old stale unaffected-suite exclusion; retain a separate identity with uncertain shared cause. This is later failure of the broader consumer-proof outcome on v0.3.38, not proof the earlier signature-exclusion mechanism was reintroduced.

### Pygardon / DD-097

**Source description:**

Slice 2 changed the diarization missing-dependency message; proof covered the unit and API tests, but `tests/test_service_optional_audio_startup.py` still matched the old text and failed later in the standard suite.

### Occurrences
- Execution: `.planning/quick/190-worktree-python-fast-path/PLAN.md` (first implementation commit `3f21aa9fe`); Timestamp: 2026-09-25T08:37:19+08:00 (`21ad862d6`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: slice 3's fresh-worktree suite failed `test_diarize_audio_file_raises_when_pyannote_missing` (`match="pyannote.audio is required"`); the same test failed at `21ad862d6`; fixed in `625451dac`. Effect: a red CI revision on the story branch and one extra agent round. Inference: proof acceptance's shared-contract consumer check applied to messages would have been a single grep for the old text.
  - Source: Pygardon / DD-097; canonical DearDough.md occurrence

## ODF-108 — Tail-only long-suite output loses failure evidence

- **Meaning:** A long proof run retains only tail output, discarding tracebacks required to diagnose failures.
- **Source mappings:** Pygardon / DD-098
- **References:** Current guidance assessed: Open Dough `7e17cba`. Related to ODF-077 output loss during whole-suite recovery, but this is initial pipeline capture rather than recovery ownership. Shared cause and correction history are not established.

### Pygardon / DD-098

**Source description:**

An implementation agent ran the 29-minute standard suite as `… | tail -30`; three load-only failures lost their tracebacks and could not be diagnosed until they recurred.

### Occurrences
- Execution: `.planning/quick/190-worktree-python-fast-path/PLAN.md` (first implementation commit `3f21aa9fe`); Timestamp: unknown (2026-09-25, slice 3 first round); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: slice 3 report ("the first run was piped through `tail -30`, so their failure details were lost"); one failure was later diagnosed only because CI reproduced it (`204b0e65b`). Effect: two failures left undiagnosed. Inference: delegation prompts for long proofs should require output kept in a log file, as the second round did (`suite2.log`).
  - Source: Pygardon / DD-098; canonical DearDough.md occurrence

## ODF-109 — Startup reports a recent pre-execution ancestor as owned failure

- **Meaning:** A new observer reports a recent ancestor revision's failure that this execution did not produce or register.
- **Source mappings:** Pygardon / DD-099
- **References:** Current guidance assessed: Open Dough `7e17cba`. Relationship to ODF-102 is uncertain. 50b6d71/v0.3.38 excludes older completed attempts but intentionally keeps the newest completed one; the supplied report does not identify its position in the startup set. Do not assert failure of the older-history correction or expected ancestor policy.

### Pygardon / DD-099

**Source description:**

A freshly started execution observer emitted, as its first event, `CI_FAILURE` for `b937d2ab6`, a trunk revision before the story's preparation commit and not produced by this execution; the coordinator had to disposition it as not owned. Matching to DD-090 is uncertain: that finding concerns years-old unregistered attempts, while this attempt was recent, an ancestor, and labelled with the story branch.

### Occurrences
- Execution: `.planning/quick/190-tfdc-trustworthy-results/PLAN.md` at `ca9182e35` (first implementation commit `88824e3a0`); Timestamp: unknown (mailbox event written 2026-09-25 08:27 +08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: `/tmp/dough-ci-501/watch-ZTiq1g/events/000000000001.json` — `CI_FAILURE`, sha `b937d2ab601f…`, branch `tfdc-trustworthy-results`, run `12b6d705-…`; `b937d2ab6` is an ancestor of preparation commit `e12052786`; the failure was E2E auto-trading bracket-order timeout and holdings ECONNRESET, later fixed on trunk by another session. Effect: one dispositioning of a verdict the execution did not own. Inference: the observer's startup filtering (see DD-090; 0.3.38 `startupCiRuns`) did not exclude an attempt already present when it started; whether ancestor reporting is intended is unresolved.
  - Source: Pygardon / DD-099; canonical DearDough.md occurrence

## ODF-110 — Readiness replay omits the rest of the promised journey

- **Meaning:** A replay resolves the named readiness seam without exercising the rest of the slice's promised journey, leaving a later operation to force a scope stop.
- **Source mappings:** Doughnut / DD-109
- **References:** Current guidance assessed: Open Dough `7e17cba`. Distinct from an absent replay: the pull seam ran, but the subsequent publish did not. No identity merge with ODF-074 uninspected facts is established.

### Doughnut / DD-109

**Source description:**

A plan was recorded not-ready because slice 3 relied on an inferred CLI path. The coordinator's disposable replay reproduced exactly the named seam (fast-forward with LFS smudge skipped, then fill-in) and recorded ready. The slice's own journey continued with a publish after the pull, and that publish failed in the CLI, forcing a mid-execution stop and an owner scope decision.

### Occurrences
- Execution: SEED-035 story 14 / quick/025-convert-raw-notebooks-to-lfs / 071d0e0861; Timestamp: 2026-09-24, ~15:35+08:00 (replay and readiness record 47df9474c2), failure observed ~16:05+08:00 (slice 3 E2E); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37.
  - Source: Doughnut / DD-109; canonical DearDough.md occurrence
  - Evidence: research prompt scoped to "pull" risks only; its report noted "the publish check went only as far as the pointer blob being committed"; slice 3 E2E then failed at the second `donut notebook publish` ("Attachment at <commit> must be a Git LFS pointer…", `cli/src/commands/notebook/notebookPublishLfsSelection.ts`); plan recorded the stop in 1e2ed84c35.
  - Observed effect: one human round-trip and a scope change (CLI change, option A) that preparation could have surfaced before Take.
  - Inference: when resolving a readiness concern by observation, replay the slice's full promised journey (here pull, then publish), not only the mechanism the concern names; the replay's own "not covered" list was the signal.

## ODF-111 — Refactor proof omits inherited test-support consumers

- **Meaning:** Refactor re-proof covers fewer consumers than a changed shared test helper reaches through inheritance.
- **Source mappings:** Doughnut / DD-111
- **References:** Current guidance assessed: Open Dough `7e17cba`. Related to retired ODF-075 and its f0f355c/v0.3.33 response, present at reported v0.3.37. No stale exclusion or broken consumer was observed here; coordinator whole-suite proof contained the gap. Shared cause with ODF-075 remains uncertain, so this is separate and not a claimed exact recurrence.

### Doughnut / DD-111

**Source description:**

A post-change refactor moved the backend test base's `pointerFor` and the LFS conversion service onto a new production method (`NotebookAttachmentContent.storeAsLfsPointer`) but reran only four backend test classes, although `pointerFor` is inherited by most `NotebookGit*` controller tests.

### Occurrences
- Execution: SEED-035 story 20 / quick/026-test-file-journeys-on-lfs / 5859e6d663; Timestamp: 2026-09-24, ~18:45+08:00 (slice 10 refactor return); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37.
  - Source: Doughnut / DD-111; canonical DearDough.md occurrence
  - Evidence: slice 10 refactor report ("Backend (conversion service and test base)": four `--tests` classes); the coordinator then ran the full backend suite (2668 tests green) before committing 47a3bdd0ab.
  - Observed effect: one extra full-suite run by the coordinator; no defect found.
  - Inference: the refactor contract's caller analysis was applied to production callers but not to inherited test-support consumers. A similar broad refactor in slice 5 took about 35 minutes against a 10-minute slice limit; it was valuable cleanup but was not escalated.

## ODF-112 — Attached story-branch observation misses failed revisions

- **Meaning:** An attached observer delivers no failure for registered failing story-branch revisions, allowing dependent slices to continue on a red branch.
- **Source mappings:** Doughnut / DD-112
- **References:** Current guidance assessed: Open Dough `7e17cba`. Related to ODF-069 discovery gaps and ODF-103 owner mismatch, but the report cannot isolate discovery, registration, hook delivery, or network failure. ODF-069 partial response 5630b28/v0.3.28 and managed delivery v0.3.33 did not establish reliable verdict delivery in this v0.3.38 execution. Keep a separate uncertain identity rather than merge two source headings or claim a specific fixed mechanism recurred.

### Doughnut / DD-112

**Source description:**

The attached Story Branch observer recorded only one `CI_DISCOVERY_DELAYED` event while two later registered revisions failed CI. The failures were found only by a manual `gh run list` at the planned stop boundary.

### Occurrences
- Execution: SEED-035 story 19 / quick/029-remove-raw-file-storage / 0284ea7f52; Timestamp: 2026-09-25, runs failed ~09:40–10:03+08:00, found ~10:50+08:00; Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38.
  - Source: Doughnut / DD-112; canonical DearDough.md occurrence
  - Evidence: runs 36083055193 (0d84006f7d) and 36084271448 (9ad0b9bf9f) failed "Backend Unit tests"; mailbox `/tmp/dough-ci-501/watch-7llTFe/events` held only sequence 1 (`CI_DISCOVERY_DELAYED` for 0284ea7f52); both deliveries had reported `observation.state: reused`. A later `CI_MONITOR_UNAVAILABLE` (network error on `gh run list`) arrived during the repair.
  - Observed effect: slices 3 and 4 were implemented, refactored and published on a failing branch for about an hour; the repair then had to cover three failed revisions.
  - Later evidence: at completion, `complete-revision` for aba0dc2509 returned `unresolvedReason: timeout` with the revision still `undiscovered`, while `gh run list` showed that run `completed success`.
  - Inference: cause unverified (discovery after the delay advisory, per-revision registration, or hook delivery); a manual `gh run list` check before each delegation would have caught it one slice later.

- **Follow-up:** [Deliver real CI verdicts for registered execution revisions](../../.planning/seeds/SEED-008-worktree-branch-trunk-sync.md#restore-ci-verdict-delivery) — **queued, not resolved**. Selected by the authorized 2026-09-25 runbook maintenance cycle.

## ODF-113 — A previous slice is treated as a pre-execution failure baseline

- **Meaning:** A failed previous-slice tip is used to label a regression pre-existing and out of scope, although the execution introduced it earlier.
- **Source mappings:** Doughnut / DD-113
- **References:** Current guidance assessed: Open Dough `7e17cba`. Distinct from retired ODF-063 unasserted behavior claims: the comparator was actually run but was the wrong historical boundary. The general verified-claim response 7b564d8/v0.3.33 is relevant, not evidence of an identical mechanism.

### Doughnut / DD-113

**Source description:**

An implementation agent reported a full-suite heap exhaustion as "also on the base commit", using the previous slice's tip rather than a known-green revision; the coordinator repeated that label to the owner before CI history showed slice 1 and main were green.

### Occurrences
- Execution: SEED-035 story 19 / quick/029-remove-raw-file-storage / 0284ea7f52; Timestamp: 2026-09-25T10:44+08:00 (slice 4 return; commit e9cbbc6547); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38.
  - Source: Doughnut / DD-113; canonical DearDough.md occurrence
  - Evidence: slice 4 report ("same thing happens on the unchanged base commit `9ad0b9bf9f`"); CI runs green for 0284ea7f52 and main 9d2d091d0a; heap dump later traced the leak to slice 2's large LFS test payloads retained by `InMemoryNotebookAttachmentContent`.
  - Observed effect: the first stop report told the owner the failure was pre-existing and out of scope; the correction came only after the CI check.
  - Inference: "pre-existing" needs a baseline from before this execution's first change (claim revision or last green CI), not the prior slice.

## ODF-114 — An assumed working live proof lacks a usable fixture and runtime

- **Meaning:** Preparation checks token and fixture presence without exercising the claimed existing live behavior, leaving invalid data and runtime assumptions to fail during execution.
- **Source mappings:** Pygardon / DD-096
- **References:** Current guidance assessed: Open Dough `7e17cba`. Related to ODF-074 unverified planning premises, but the supplied record concerns functional fixture/runtime viability rather than a code or host fact assertion. Keep separate while that relationship is uncertain; no failed live-transition gate (ODF-080) is inferred.

### Pygardon / DD-096

**Source description:**

Slice 3's opt-in proof assumed real diarization worked and named `e2e_test/fixtures/audio/sample.wav`; the fixture is a 44-byte header and diarization had been broken since pyannote 4.x (`use_auth_token` removed, gated `speaker-diarization-community-1`, torchcodec needing unexposed FFmpeg libraries).

### Occurrences
- Execution: `.planning/quick/190-worktree-python-fast-path/PLAN.md` (first implementation commit `3f21aa9fe`); Timestamp: unknown (2026-09-25, between 08:40 and 10:06 +08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: plan assumptions checked only that `.env` had `HF_AUTH_TOKEN` and the fixture existed; real CLI runs failed in turn with OpenAI 400 (empty audio), `TypeError` (`use_auth_token`), HF 403, and `libtorchcodec` load failure before success at `eae1e7320`; one owner round trip for gated-model access. Effect: about five paid transcription calls against one planned, two extra production-code changes inside slice 3, and a human-judgment stop. Inference: running the cheap non-paid half (`diarize_audio_file` alone) during planning would have exposed every defect; the coordinator only did so at the end.
  - Source: Pygardon / DD-096; canonical DearDough.md occurrence
