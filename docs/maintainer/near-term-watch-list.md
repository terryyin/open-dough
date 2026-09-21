# Near-term watch list

Internal Open Dough findings with released responses and verified relevant use.
Assessed on 2026-09-21 (Asia/Singapore) against the three current DearDough logs.
Codes remain allocated; consult [finding names](finding-names.md) and Git history
before matching or allocating identities. Silence is not proof of effectiveness.
Released responses without a supported relevant-use date remain active in the
catalog with an explicit unknown watch start.

Matching source-log entries are removed after their evidence is retained here.
Review dates are seven calendar days after the verified use date; scope and
provenance limits remain on each entry. No application tests were run for this
record-maintenance review.

## ODF-007 — Implementation agents fail to await their own background verification

- **Meaning:** An implementation agent that ends its turn before its own background test completes leaves the required pass/fail result unreported and shifts verification back to the coordinator.
- **Source mappings:** Doughnut Project / DD-001
- **References:** Doughnut Project historical `DearDough.md`, DD-001; releases 0.3.8 and 0.3.13; executions `5ed11cd8e0` and `a6fcddacad`; response `c8d2fd0`.

- **Status:** Near-term watch; released response, no recorded post-fix recurrence of this mechanism; effectiveness unverified.
- **Response:** Delegated verification is owned through its terminal result,
  with an explicit incomplete stop otherwise. Story 22 and plan recoverable at
  `ce417d2:.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md` and
  `ce417d2:.planning/quick/048-complete-delegated-handoffs/PLAN.md`.
- **Released in:** 0.3.18 (`c8d2fd0`; first containing tag `v0.3.18`).
- **Watch start:** 2026-09-16, release 0.3.22, Doughnut plan 129 at
  `473550c16e`; repeated implementation/refactor delegation completed with no
  recorded premature wait return.
- **Review after:** 2026-09-23.
- **Last assessed:** 2026-09-21 (Asia/Singapore); All three current logs checked. Relevant
  v0.3.22 delegation and matching guidance verified at Doughnut 473550c16e. Host-
  terminated agents (ODF-059) are a different mechanism; no premature verification-return
  recurrence is supported. Review remains due September 23.

### Occurrences

- Execution: `SEED-017 Story 1 / quick-099-receive-compatible-accepted-history / 5ed11cd8e0`
  - Timestamp: unknown
  - Source: Doughnut Project / DD-001; first historical occurrence
  - Tool: Claude Code
  - Open Dough release: 0.3.8
  - Evidence: The slice 4 agent twice returned while its Vitest run was still
    in progress; the coordinator ran the test directly and obtained 95/95 pass.
  - Observed effect: Two extra coordinator round-trips before wrap-up.

- Execution: `SEED-018 story 3 / quick/108-publish-notebook-edits-faster / a6fcddacad`
  - Timestamp: unknown
  - Source: Doughnut Project / ODF-007; second historical occurrence
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.13
  - Evidence: Implementation and refactor agents returned three times with
    “waiting” reports before later returning actual test results.
  - Observed effect: Three extra coordinator round-trips.

## ODF-028 — Preservation proof omits the physical predecessor store

- **Meaning:** A preservation claim names a logical profile but omits physical source/destination and predecessor identity, allowing continuity inside a new store to be reported as migration from an older store.
- **Source mappings:** Pygardon / DD-027
- **References:** Pygardon historical `DearDough.md`, DD-027; `d09f0a6ae`; response `0dbff99`.

- **Status:** Near-term watch; released response, no recorded post-fix recurrence of this mechanism; effectiveness unverified.
- **Response:** Proof ownership now identifies installation, physical store,
  and predecessor relationship, distinguishing same-store continuity from
  transfer. Story 21 and plan recoverable at
  `818a4f1:.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md` and
  `818a4f1:.planning/quick/047-cover-actual-user-outcome/PLAN.md`.
- **Released in:** 0.3.18 (`0dbff99`; first containing tag `v0.3.18`).
- **Watch start:** 2026-09-16, release 0.3.23, Pygardon production-database
  transfer plan 142, accepted source/candidate proof at `15ac40382` and live source-to-service proof at `cb4c67c25`; the installed planning guidance matches v0.3.23. The earlier `9152848a8` locator held only the plan.
- **Review after:** 2026-09-23.
- **Last assessed:** 2026-09-21 (Asia/Singapore); All three current DearDough logs checked. Relevant transfer use and v0.3.23 installed planning bytes verified at cb4c67c25; historical d09f0a6ae replay is not recurrence. Seven days have not elapsed.

### Occurrences

- Execution: `.planning/quick/112-automatic-tag-release-update/PLAN.md @ d09f0a6ae`
  - Timestamp: unknown
  - Source: Pygardon / DD-027; historical canonical occurrence
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: 0.3.14
  - Evidence: Proof showed continuity inside the new `pygardon-data` volume but
    the report called it production preservation without identifying the intact
    native store containing roughly 22 GB.
  - Observed effect: Missing native-to-Docker migration surfaced only at final
    owner feedback.


- **Retained source detail:** Pygardon replay names the preserved native store `~/.config/pygardon/production`; original slice 9 baselined the new Docker volume and slice 14 demonstrated its A→B continuity. The reported missing native transfer is the same historical d09f0a6ae execution, not new evidence after the response.

## ODF-036 — Completed delegated work leaves stale background watches

- **Meaning:** A delegated agent returns complete results but leaves per-command watches that later notify the coordinator with stale, already-reported timeouts.
- **Source mappings:** Doughnut Project / DD-019
- **References:** Doughnut Project historical `DearDough.md`, DD-019; `691e7be961`; response `bad3aae`.

- **Status:** Near-term watch; released response, no recorded post-fix recurrence of this mechanism; effectiveness unverified.
- **Response:** Delegation bounds owned watch lifetime to the verification
  obligation and accounts for unread evidence before retirement. Story 22 and
  plan recoverable at `ce417d2:.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md`
  and `ce417d2:.planning/quick/048-complete-delegated-handoffs/PLAN.md`.
- **Released in:** 0.3.18 (`bad3aae`; first containing tag `v0.3.18`).
- **Watch start:** 2026-09-16, release 0.3.22, Doughnut plan 129 at
  `473550c16e`; repeated delegated proof/refactor work recorded no stale
  post-completion notifications.
- **Review after:** 2026-09-23.
- **Last assessed:** 2026-09-21 (Asia/Singapore); All three current logs checked. Relevant
  v0.3.22 delegation and matching guidance verified at Doughnut 473550c16e. ODF-038
  concerns coordinator polling; ODF-071 concerns native-session receipt ownership. Neither
  establishes stale delegated-command watches after completion. Review remains due
  September 23.

### Occurrences

- Execution: `SEED-018 story 5 / quick/112-publish-additions-with-simpler-title-check / 691e7be961`
  - Timestamp: unknown
  - Source: Doughnut Project / DD-019; historical canonical occurrence
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.14
  - Evidence: Seven benchmark watches fired stale timeout notifications after
    the agent had returned their complete results.
  - Observed effect: Seven extra coordinator turns interleaved with unrelated
    refactor work.

## ODF-043 — Proof serialization mismatches require report-only retries

- **Meaning:** Completed delegated work returns sufficient proof in a noncanonical schema, causing retries solely to reformat the handoff.
- **Source mappings:** Doughnut Project / DD-038
- **References:** Doughnut Project historical `DearDough.md`, DD-038; `2be6138738`; response `a04e5a8`.

- **Status:** Near-term watch; released response, no recorded post-fix recurrence of this mechanism; effectiveness unverified.
- **Response:** The proof block is an example representation; proof acceptance
  now accepts equivalent complete substance and still blocks missing evidence.
  Story 22 and plan recoverable at
  `ce417d2:.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md` and
  `ce417d2:.planning/quick/048-complete-delegated-handoffs/PLAN.md`.
- **Released in:** 0.3.18 (`a04e5a8`; first containing tag `v0.3.18`).
- **Watch start:** 2026-09-16, release 0.3.22, Doughnut plan 129 at
  `473550c16e`; repeated delegated handoffs recorded no format-only retry.
- **Review after:** 2026-09-23.
- **Last assessed:** 2026-09-21 (Asia/Singapore); All three current logs checked. Relevant
  v0.3.22 handoffs and matching guidance verified at Doughnut 473550c16e. Reportless host
  termination (ODF-059) is not a retry solely for report formatting. No same-mechanism
  recurrence is supported; review remains due September 23.

### Occurrences

- Execution: `SEED-009 story 29 / quick/115-web-note-trash-and-undo / 2be6138738`
  - Timestamp: unknown
  - Source: Doughnut Project / DD-038; historical canonical occurrence
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: 0.3.16
  - Evidence: Slices 6 and 7 required three report-only follow-ups for custom or
    near-matching proof schemas despite unchanged substantive results.
  - Observed effect: Three coordinator-agent round-trips added no evidence.

## ODF-045 — Dominant query purpose hides incompatible production callers

- **Meaning:** Consumer analysis assigns a shared query its dominant storage purpose instead of classifying each production caller, leaving an incompatible caller uncovered.
- **Source mappings:** Doughnut Project / DD-040
- **References:** Doughnut Project historical `DearDough.md`, DD-040; `2be6138738`; response `a13ccab`.

- **Status:** Near-term watch; released response, no recorded post-fix recurrence of this mechanism; effectiveness unverified.
- **Response:** Proof ownership now inspects affected production call sites and
  derives obligations per incompatible caller purpose. Story 21 and plan
  recoverable at `818a4f1:.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md`
  and `818a4f1:.planning/quick/047-cover-actual-user-outcome/PLAN.md`.
- **Released in:** 0.3.18 (`a13ccab`; first containing tag `v0.3.18`).
- **Watch start:** 2026-09-16, release 0.3.22, Doughnut plan 129 at
  `473550c16e`; its consumer assessment explicitly separated web, Git, note,
  folder, and reference-rewrite caller purposes.
- **Review after:** 2026-09-23.
- **Last assessed:** 2026-09-21 (Asia/Singapore); All three current logs checked. Doughnut
  plan 129 at 473550c16e explicitly distinguishes production caller purposes; installed
  guidance matches v0.3.22. Pygardon ODF-075 misses a test-support consumer through stale
  suite assumptions, not incompatible production query purposes. Review remains due
  September 23.

### Occurrences

- Execution: `SEED-009 story 29 / quick/115-web-note-trash-and-undo / 2be6138738`
  - Timestamp: unknown
  - Source: Doughnut Project / DD-040; historical canonical occurrence
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: 0.3.16
  - Evidence: Consumer analysis classified a shared query for Git retention but
    missed `LearningSessionService.record`, which graded trashed notes.
  - Observed effect: All planned suites passed and a correction plan was needed.

## ODF-056 — Literal CLI entry paths silently skip symlink-equivalent launches

- **Meaning:** CLI entry guards compare literal URLs for the same file under different symlink spellings, exiting successfully without entering the command body.
- **Source mappings:** Open Dough / DD-066 (literal CLI); Doughnut / DD-065
- **References:** Current guidance assessed: Open Dough `f79ad88` (contains v0.3.27). Both reports name the same literal import.meta.url/argv comparison. Doughnut ownership review `2381cf9e60` verified the installed v0.3.26 runtime and an isolated v0.3.27 probe; Open Dough correction `eff69eb` changes all three entrypoints. Historical Doughnut execution releases remain unknown; these are not demonstrated post-fix recurrences.

### Occurrences

- Execution: `.planning/quick/061-native-edit-protection-codex-cursor/PLAN.md @ d6cb926`
  - Source: Open Dough / DD-066; canonical DearDough.md occurrence
  - Timestamp: 2026-09-20
  - Tool: Cursor
  - Model: unknown
  - Open Dough release: modified; revision d6cb926; base 0.3.25
  - Evidence: `src/skills/dough-execute-plan/scripts/ci-mailbox.mjs`,
    `watch-ci.mjs`, and `ci-host-hook.mjs` each guard their CLI body with
    `import.meta.url === pathToFileURL(process.argv[1]).href`. The execution
    worktree was addressed as `/tmp/open-dough-061.WrMwJK/worktree`, while the
    filesystem resolved it under `/private/tmp/...`; the two URLs named the
    same entry file but compared unequal, so the requested CLI body was not
    entered.
  - Observed effect: a checkout-bound CI command could return status 0 with no
    command output or hook handling. This is not ODF-052: that occurrence
    printed a mailbox receipt and then failed to attach, whereas this path
    comparison prevents the receipt-producing or hook-processing body itself
    from running.
  - Inference: the three callers need one bounded, realpath-equivalent
    direct-entry decision plus process proof that observes each CLI body rather
    than accepting exit status alone.
  - Delivered: `src/skills/dough-execute-plan/scripts/ci-direct-entry.mjs`
    (`isDirectCliEntry`, a literal-URL fast path falling back to
    `fs.realpathSync` comparison, fail-closed on error), wired into all three
    callers in `eff69eb9ed1268bd2428f11abacb3abc7711e025`, with real-symlink
    process-level proof for each entrypoint. The correction plan that carried
    this work is recoverable at the wrap-up's before-cleanup commit,
    `.planning/quick/064-recognize-realpath-equivalent-cli-entry/PLAN.md`.

- Execution: SEED-024 story 1 / quick/135-irreversible-relationship-reduction
  - Source: Doughnut / DD-065; canonical DearDough.md occurrence
  - Timestamp: 2026-09-17, evening +08:00 (during CI-observer arming before
    slice 1 delegation)
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: unknown
  - Evidence: `node .claude/skills/dough-execute-plan/scripts/ci-mailbox.mjs probe`
    run from the execution worktree root produced no stdout and exit code 0;
    an inline `node -e` script importing the same file's `probeMailbox` export
    directly worked and returned a directory; `node .agents/skills/dough-execute-plan/scripts/ci-mailbox.mjs probe`
    then printed `CI_OBSERVER {"directory":"/tmp/dough-ci-501/watch-oZWLUN"}`
    and the PostToolUse hook added `CI_MONITOR_READY` context, confirming the
    realpath invocation was the fix.
  - Observed effect: no lost coverage — the silent no-op was caught by testing
    an inline import before trusting the CLI, and the observer was armed
    successfully via the realpath before any slice was delegated — but it
    cost extra diagnostic steps, and a less cautious run could have proceeded
    believing CI observation was set up when it was not.
  - Inference: the CLI entry guard should compare canonicalized/realpath forms
    of `process.argv[1]` and the module path (or otherwise detect direct
    invocation more robustly than exact string equality against a path that
    may traverse a project-standard symlink), since this project's own setup
    deliberately creates that exact symlink in every checkout.

- Execution: SEED-028 story 1 / quick/140-admin-job-status-local-time / 1694c122d9
  - Source: Doughnut / DD-065; canonical DearDough.md occurrence
  - Timestamp: 2026-09-18 (session date)
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: unknown
  - Evidence: `node '.claude/skills/dough-execute-plan/scripts/ci-mailbox.mjs' probe`
    run from the execution worktree root produced no stdout and exit code 0,
    with no `CI_MONITOR_READY` PostToolUse context added. `node '.agents/skills/dough-execute-plan/scripts/ci-mailbox.mjs' probe`
    then printed `CI_OBSERVER {"directory":"/tmp/dough-ci-501/watch-mL5Kzr"}`
    and the hook added `CI_MONITOR_READY`.
  - Observed effect: worse than the prior occurrence — this coordinator
    concluded CI observation was genuinely unavailable from the silent no-op
    alone, reported that limitation to the user, and had already pushed
    slice 1's commit unobserved before checking this log's existing DD-065
    entry, recognizing the exact match, retrying via the realpath, and
    starting the observer late (after the push it should have covered).
    No coverage was permanently lost (the observer's startup snapshot still
    discovered the already-pushed commit's run), but the sequence shows the
    silent-no-op failure mode reliably reproduces a false "unavailable"
    conclusion for a coordinator that does not already know to check this
    log before trusting the probe's silence.
  - Inference: same root cause and same fix as the original finding; the
    false-unavailable conclusion this occurrence reached is itself further
    evidence for fixing the CLI guard rather than relying on operators to
    recall this log entry.

- Execution: SEED-033 story 1 / quick/144-compact-spelling-results / 55fc4ba255
  - Source: Doughnut / DD-065; canonical DearDough.md occurrence
  - Timestamp: 2026-09-18 (session date)
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: unknown
  - Evidence: `node .claude/skills/dough-execute-plan/scripts/ci-mailbox.mjs probe`
    run from the execution worktree root (with both a bare relative path and
    an absolute path) produced no stdout and exit code 0, with no
    `CI_MONITOR_READY` PostToolUse context added; a standalone inline script
    confirmed `pathToFileURL` resolution matched in isolation, so the silence
    was not an obvious invocation mistake. `node '.agents/skills/dough-execute-plan/scripts/ci-mailbox.mjs' probe`
    then printed `CI_OBSERVER {"directory":"/tmp/dough-ci-501/watch-mAT38C"}`
    and the hook added `CI_MONITOR_READY`.
  - Observed effect: same false-unavailable pattern as the second occurrence —
    this coordinator concluded the bridge was unavailable for this
    non-interactive/background-job session, reported that limitation, and had
    already pushed slice 1's commit unobserved before reaching the
    retrospective's process review, which is what surfaced this log's
    existing DD-065 entry and prompted retrying via the realpath. The
    observer's startup snapshot still discovered the already-pushed commit's
    run once armed and the SHA was registered after the fact, so no coverage
    was permanently lost, but two independent coordinators have now reached
    the same wrong "unavailable" conclusion from the same silent no-op before
    reading this log.
  - Inference: same root cause and fix as the prior occurrences. The repeat
    across three separate executions (two different coordinators reaching the
    false-unavailable conclusion) strengthens the case that this needs the
    CLI guard fixed rather than continuing to rely on retrospective review to
    catch it after the fact.

- Execution: quick/260920-frontend-proof-type-checking / 7b1d80b4e8
  - Source: Doughnut / DD-065; canonical DearDough.md occurrence
  - Timestamp: 2026-09-19 (session date)
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: unknown
  - Evidence: `node ./.claude/skills/dough-execute-plan/scripts/ci-mailbox.mjs
    start --execution nerds-odd-e/doughnut worktree-260920-frontend-proof-type-checking`
    run from the execution worktree root (after this session had already
    entered a Nix shell there, which creates the `.claude/skills/<name>`
    symlinks) produced no stdout and exit code 0, with no
    `CI_OBSERVER`/`CI_MONITOR_READY` context added. Individually reading that
    same path with `sed`/`grep`/`cp` returned real file content matching
    `.agents/skills/dough-execute-plan/scripts/ci-mailbox.mjs`, while a bare
    `ls -la .claude/skills` from the worktree root (no subpath) showed zero
    entries beside `.` and `..` — the per-file reads and the directory
    listing disagreed about whether the path existed.
    `node ./.agents/skills/dough-execute-plan/scripts/ci-mailbox.mjs start ...`
    then printed the expected `CI_OBSERVER {"directory":...}` receipt and the
    PostToolUse hook added its context.
  - Observed effect: no lost coverage — diagnosed via an inline import script
    that printed the module's actual exports before trusting the CLI's
    silence, then armed and registered the already-pushed commit via the
    realpath before shutting the observer down — but cost several extra
    diagnostic tool calls after the branch had already been pushed, during a
    background/non-interactive session with no live user to consult.
  - Inference: same root cause and fix as the prior three occurrences. The
    disagreement between successful individual-file reads and an empty bare
    directory listing for the same `.claude/skills` path is a new wrinkle
    worth naming: it means confirming the target file is readable is not
    sufficient confirmation that the CLI invocation through that path will
    behave correctly, which makes runtime-setup.md's own "do not reuse the
    installed directory that supplied the initially loaded skill" caution
    easy to satisfy on a shallow check while still hitting this failure mode.


- **Status:** Near-term watch; released response, effectiveness beyond the checked boundary unverified.
- **Response:** `eff69eb` adds realpath-equivalent direct-entry detection to ci-mailbox, watch-ci, and ci-host-hook; correction recoverable at `60cd47d:.planning/quick/064-recognize-realpath-equivalent-cli-entry/PLAN.md`.
- **Released in:** 0.3.27; first containing tag v0.3.27, verified against the helper and all three caller diffs.
- **Watch start:** 2026-09-21, isolated use of released v0.3.27 through Doughnut's skill symlink, reported in ownership review `2381cf9e60:DearDough.md`; receipt CI_OBSERVER observed. This is boundary exercise, not installation into Doughnut.
- **Review after:** 2026-09-28.
- **Last assessed:** 2026-09-21 (Asia/Singapore); all three current logs checked. Historical executions retain their reported modified/unknown releases. The distinct missing-directory problem ODF-085 remains active. No supported post-v0.3.27 recurrence of this guard failure is present.
- **Evidence note:** The 2026-09-21 ownership review reproduced the failure with unchanged installed v0.3.26, verified no custom CI adapter/observer override, then obtained exit 0 plus CI_OBSERVER with the isolated released v0.3.27 runtime. This review is boundary evidence, not a fifth Doughnut execution occurrence.
