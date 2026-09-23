# Near-term watch list

Internal Open Dough findings with released responses and verified relevant use.
Assessed on 2026-09-23 (Asia/Singapore) against the three current DearDough logs.
Codes remain allocated; consult [finding names](finding-names.md) and Git history
before matching or allocating identities. Silence is not proof of effectiveness.
Released responses without a supported relevant-use date remain active in the
catalog with an explicit unknown watch start.

Matching source-log entries are removed after their evidence is retained here.
Review dates are seven calendar days after the verified use date; scope and
provenance limits remain on each entry. No application tests were run for this
record-maintenance review.

## Pending response follow-up — not an active watch

ODF-057, ODF-063, ODF-075, and ODF-076 remain active in the
[finding catalog](finding-names.md), linked to
[Accept delivery only with evidence for affected promises](../../.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md#accept-delivery-evidence).
Refinement and [plan 085](../../.planning/quick/085-accept-delivery-evidence/PLAN.md)
were prepared on 2026-09-23. No response implementation, containing release, or
qualifying use is established by this preparation. Watch start and review-after
remain unknown; these findings are not eligible for age-based review or retirement.
The plan requires per-finding response/evidence updates and a final reconciliation
of this note. Move only eligible findings into the watch after release and verified
relevant use; otherwise retain the catalog disposition and update this pending
note with the actual limitation. This is a pointer to existing work, not another
queue or an effectiveness claim. The existing ODF-056 watch is unchanged.

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
- **Last assessed:** 2026-09-23 (Asia/Singapore); all three current logs checked. Historical executions retain their reported modified/unknown releases. The distinct missing-directory problem ODF-085 remains active. The normal-ended observer report ODF-089 occurs after startup and is also a different mechanism. Review is not due until September 28. No supported post-v0.3.27 recurrence of this guard failure is present.
- **Evidence note:** The 2026-09-21 ownership review reproduced the failure with unchanged installed v0.3.26, verified no custom CI adapter/observer override, then obtained exit 0 plus CI_OBSERVER with the isolated released v0.3.27 runtime. This review is boundary evidence, not a fifth Doughnut execution occurrence.
