# DearDough Process Findings

## DD-066 — A literal CLI-entry URL comparison silently skipped symlink-equivalent launches

Three checkout-bound Node entrypoints decided whether to run by comparing the
literal module URL with the URL made from `process.argv[1]`. On macOS, invoking
the script through `/tmp` can load that same file through its canonical
`/private/tmp` path. The unequal strings cause the process to exit successfully
without running the CLI body, so an execution can mistake silence for a valid
command result.

### Occurrences

- Execution: `.planning/quick/061-native-edit-protection-codex-cursor/PLAN.md @ d6cb926`
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
    than accepting exit status alone. Follow-up correction:
    `.planning/quick/064-recognize-realpath-equivalent-cli-entry/PLAN.md`.

## DD-055 — A plan's proof command can select an empty test set and report success

The plan format states each slice's proof as a runnable command. When that
command selects tests by name pattern, a pattern naming a group that does not
exist yet runs zero tests and exits 0. The proof reports success while executing
nothing, and is indistinguishable in its output from a proof that genuinely
passed.

### Occurrences

- Execution: `SEED-008#script-product-backlog-list-updates @ ff8987d`
  - Timestamp: 2026-09-18T19:31:24+08:00
  - Tool: Claude Code
  - Model: claude-opus-5
  - Open Dough release: 0.3.25
  - Evidence: Slice 10's planned proof was `node --test
    --test-name-pattern='merge direction'
    tests/support/product-backlog-merge.test.mjs`. Before the slice every test
    in that file was named `merge items ...` or `merge order ...`, so the
    pattern matched nothing and the command exited 0. After the slice created
    the group the same command reports 6 tests, 6 passing.
  - Observed effect: The slice's source diff was empty because the behavior
    already worked. Had "the planned proof command passes" been accepted as
    evidence, the slice would have been recorded as proved while asserting
    nothing about the behavior it named.
  - Inference: Name-pattern selection makes "no test was selected" and "every
    selected test passed" the same observable result. Qualified: this affects
    pattern-selected proofs only, not file-level or script-level proof commands.

- Execution: `SEED-021#see-published-work @ d0a9495`
  - Timestamp: unknown
  - Tool: Claude Code
  - Model: claude-fable-5-1
  - Open Dough release: 0.3.26
  - Evidence: Between commits `a74bee9` (2026-09-20T07:51:26+08:00) and
    `d0a9495` (2026-09-20T08:19:16+08:00). Slice 2's planned proof was
    `npm run test:dashboard -- --grep 'published overview'`. The slice owned
    three Playwright tests in `dashboard/tests/published-work.spec.ts`; only
    one title contained the phrase, so the command ran 1 test and passed while
    the empty-groups and initial-read-failure promises went unselected.
  - Observed effect: The refactor pass noticed the mismatch and retitled the
    two tests; the coordinator then told every later implementation agent that
    each test a slice owns must carry the plan's phrase in its title, and
    slices 3 to 6 selected 3, 5, 12, and 6 tests with their planned commands.
  - Inference: A variant of the same mechanism, partial rather than empty
    selection: a name-pattern proof never states how many tests it should
    select, so "passed" does not show that the slice's promises were exercised.

## DD-056 — Assertions concentrated on exit status and published bytes left the tool's own reported output unproved

Tests for a command whose contract includes a human-readable summary asserted
the exit status and the resulting file bytes, but not the summary text. That
summary is what a caller reads to decide whether to accept a result, so a
summary line can be wrong, or silently absent, without any test failing.

### Occurrences

- Execution: `SEED-008#script-product-backlog-list-updates @ ff8987d`
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

## DD-057 — Delegated refactor pass stalled after editing and before reporting

An independent post-change refactor agent finished its edits but stopped
without returning a report, leaving the coordinator with uncommitted
third-party changes in the worktree and no account of what they were or why.

### Occurrences

- Execution: `SEED-008#script-product-backlog-list-updates @ ff8987d`
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

## DD-058 — A new payload file was published without being declared, and only CI noticed

Maintainer guidance says to edit client-payload guidance under `src/skills/` and
never to hand-synchronize installed copies. It does not say that adding a *new*
file there requires declaring it in the installer's manifest and the three other
lists that must agree with it. A skill can therefore gain a reference that links
to a file no installed project ever receives, with the source tree entirely
self-consistent.

### Occurrences

- Execution: `.planning/quick/058-preserve-backlog-merge-intent/PLAN.md @ a242412`
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

## DD-059 — A shell assertion silently enforced nothing on the developer's bash

`tests/story-payload-update.sh` walks every Markdown link in the installed story
guidance and asserts each target exists. On macOS, which ships bash 3.2, a bare
`[[ ]]` as the last command of a `while` body does not abort under `set -e`, so
the assertion was already false locally and reported nothing. Only the Linux CI
runner's bash 5 aborted — and because the failing command is a bare test, it
aborted with no diagnostic at all.

### Occurrences

- Execution: `.planning/quick/058-preserve-backlog-merge-intent/PLAN.md @ a242412`
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

## DD-060 — A CI repair was delivered without the refactor pass its own delivery gate requires

The CI observation protocol routes a repair through the ordinary slice
wrap-up, whose first delivery step is an independent post-change refactor pass.
A coordinator can run the visible remainder of that sequence — formatting,
staging, commit, push, observer registration — and skip the refactor step
without any gate noticing, because nothing downstream depends on it having run.

### Occurrences

- Execution: `.planning/quick/058-preserve-backlog-merge-intent/PLAN.md @ a242412`
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

## DD-061 — A delegated report's untested behavior claim was relayed to the developer as fact

Proof acceptance inspects the locations an implementation report names. A
report can also describe behavior in prose that no named assertion observes.
When the coordinator repeats that prose in its own summary, the developer
receives an unverified claim with the coordinator's authority attached.

### Occurrences

- Execution: `SEED-021#see-published-work @ d0a9495`
  - Timestamp: unknown
  - Tool: Claude Code
  - Model: claude-fable-5-1
  - Open Dough release: 0.3.26
  - Evidence: Between commits `d0a9495` (2026-09-20T08:19:16+08:00) and
    `c0d0a91` (2026-09-20T08:33:16+08:00). The slice 3 implementation report
    said a bare `#anchor` link target "is treated as naming no file →
    unusable". No test covered it, and `repositoryPath("")` in
    `dashboard/src/sourceLink.ts` returned `[".planning"]`, so the page offered
    the `.planning` directory as a pinned file. The coordinator's message to
    the developer stated the claim and added "Both are covered by the fixture".
  - Observed effect: The independent refactor agent reasoned the contradiction
    from code; the coordinator reproduced it against the shared reader,
    corrected its statement in the next message, and returned the gap to the
    implementation agent, which fixed it and added two assertions. From slice
    4 on, delegation required every behavior claim to name its observing
    assertion or be listed as untested; those reports carried explicit
    untested lists and no later contradiction was found.
  - Inference: Qualified. Accepting proof by location does not cover a
    report's unanchored prose, and the delegation return contract asks for
    "uncovered promises" but not for unexercised claims about added decisions.
    One execution; the countermeasure's effect is observed, not measured.

## DD-062 — A correction returned after the refactor pass was delivered without a refactor pass of its own

Slice delivery runs implementation, proof acceptance, then one independent
refactor pass. When that pass exposes contradictory proof, the change returns
to implementation. The delivery sequence does not say whether the corrected
change needs the refactor pass again, so the coordinator decides case by case.

### Occurrences

- Execution: `SEED-021#see-published-work @ d0a9495`
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

## DD-063 — A CI observer that died mid-execution stayed reported as attached until shutdown

The observer is a detached process. After it dies, push registration still
writes a coverage receipt and the host hook still reports the observer as
attached, so lost coverage is first visible when the coordinator stops it.

### Occurrences

- Execution: `SEED-021#see-published-work @ d0a9495`
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

## DD-064 — A Story Branch claim left unpublished on shared main blocked another execution and was then misreported

Story Branch Mode commits its claim on the integration branch and is told not
to push it. On a shared integration checkout that leaves local `main` ahead of
origin for the whole execution.

### Occurrences

- Execution: `SEED-021#see-published-work @ d0a9495`
  - Timestamp: 2026-09-20T07:49:42+08:00
  - Tool: Claude Code
  - Model: claude-fable-5-1
  - Open Dough release: 0.3.26
  - Evidence: Claim commit `beafc8d`. `SEED-008#publish-shared-backlog-claims`
    records that plan 62's Trunk Mode publication stopped on it until the owner
    pushed it; `git branch -r --contains beafc8d` now lists `origin/main`.
    This execution's reports kept describing the claim as local only, including
    after the interruption recovery, which verified the execution checkout but
    not the integration branch's publication state.
  - Observed effect: Another execution was blocked until a human intervened,
    and the dashboard built here showed this story as Backlog priority 1 on the
    real origin while it was being executed. Follow-up is already queued first
    in the backlog as `SEED-008#publish-shared-backlog-claims`.
  - Inference: Follows the current instruction rather than breaking it. The
    stale "local only" reports are a separate, smaller gap: retained execution
    identity is rechecked for the execution branch, not for the claim.

## DD-054 — Delegated Git-fixture proof for a "stop" behavior defaults to a tautology

When an implementation agent is asked to prove a rule-required refusal/stop
behavior (e.g. "publication must not advance past an unrelated commit") with
a disposable Git fixture, its first attempt tended to encode the stop as the
test's own JS-level decision not to call the mutating command, computed from
SHAs the same test already held from setup, rather than actually attempting
the real Git command and observing it fail. This satisfies the letter of
"prove the stop" while violating this project's own stated anti-pattern
("setup supplies the very outcome the test claims the product establishes")
without the agent flagging it as a limitation.

### Occurrences

- Execution: `SEED-008#publish-trunk-mode-from-local-main @ b82bae4`
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

## DD-053 — Take-queued-work claim staging assumes exclusive backlog ownership

The take-queued-work guidance says to stage the backlog path as a whole when
committing an isolated **Taken** claim. It does not address a concurrent
session's own uncommitted, unrelated edits already present in that same
tracked file at claim time; staging the whole path would have folded that
other session's unreviewed draft content into this execution's claim commit.

### Occurrences

- Execution: `SEED-004#run-standalone-manual-testing-in-isolated-execution @ 290d30d`
  - Timestamp: 2026-09-17T12:08:37+08:00
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: modified; revision 9e6ce93; base 0.3.24
  - Evidence: Before the claim, `git status --short` on `.planning/PRODUCT-BACKLOG.md`
    and `.planning/seeds/SEED-008-worktree-branch-trunk-sync.md` already showed
    unstaged modifications (a "Publish Trunk Mode from local main" story
    capture) with mtimes ~2 minutes old, not owned by this execution.
    Following the literal "stage only the backlog path" instruction would have
    staged that unrelated addition together with this claim's move of one
    entry to Taken.
  - Observed effect: The claim was instead built by staging a hand-constructed
    target blob via `git hash-object`/`git update-index` for only the intended
    move, leaving the concurrent session's edits untouched and unstaged; commit
    `290d30d` contains only the claim's own change.
  - Inference: The guidance's "stage only the backlog path" step assumes the
    backlog file has no concurrent uncommitted edits from another session at
    claim time; when it does, whole-path staging would misattribute unreviewed
    content into the claim commit. A hunk- or content-aware staging fallback
    for this case is not currently documented.

## ODF-001 — Mixed execution changes obscure commit provenance

Former local code: DD-001.

The execution's product changes were committed together with a much larger,
separately described cleanup, so the commit does not identify the Taken-work
outcome as one of its responsibilities.

### Occurrences

- Execution: `SEED-004#show-stories-as-taken-during-execution @ 519bb4a`
  - Timestamp: unknown
  - Tool: Codex
  - Model: GPT-5
  - Evidence: `519bb4a` changes 147 files; the Taken outcome occupies eight
    files, while the commit subject describes only removal of Quick 040 and
    DearDough material.
  - Observed effect: The retrospective had to isolate the eight relevant
    patches instead of reviewing the commit as one uncontaminated execution.
  - Inference: Separate commits for independently completed work would make
    review scope, attribution, and recovery clearer.

## ODF-003 — File-type assumptions skipped affected maintained proof

Former local code: DD-003.

Slice implementation and refactor handoffs treated runtime Markdown changes as
having no applicable maintained tests, even though one changed phrase was an
explicit contract in the focused CI runtime suite.

### Occurrences

- Execution: `SEED-004#execute-in-worktree-and-merge-at-wrap-up @ 8a1be3c`
  - Timestamp: unknown
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

## ODF-006 — Oversized context reads obscure narrow execution inputs

Former local code: DD-006.

Bundling large skill references and planning documents into one output exceeded
output limits during a small guidance change, obscuring requested context and
prompting further reads. This concerns input selection, not a reason to omit
required review or proof.

### Occurrences

- Execution: `SEED-010#retain-reconciled-findings-in-open-dough @ 0120ac3`
  - Timestamp: unknown
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: This execution conversation's combined read of SEED-010 and
    `dough-execute-plan/references/{delegation,execution-decisions,wrap-up,ci-monitor}.md`
    returned truncated output. The next combined reconciliation/triage/context
    read was also truncated; execution-decisions was subsequently loaded again.
    Bundled document reads in this retrospective repeated the truncation.
  - Observed effect: Requested guidance was not fully visible in those outputs,
    and additional context reads were performed for the same single-slice work.
  -     Inference: Load required references once, then select sections for concrete
    unresolved questions and size outputs to fit. This should reduce avoidable
    rereading while preserving required context; net time and token cost were
    not measured. No decisive match to an existing local issue was found.

## ODF-052 — Cursor mailbox probe did not attach CI_MONITOR_READY

Former local code: DD-047.

A harmless `ci-mailbox.mjs probe` printed a `CI_OBSERVER` receipt, but this
coordinator session never received host `CI_MONITOR_READY`. Observation was
not started; later execution-branch pushes were unobserved.

### Occurrences

- Execution: `SEED-004#guide-useful-manual-testing @ ed19f9f`
  - Timestamp: 2026-09-16T16:00:00+08:00
  - Tool: Cursor
  - Model: Cursor Grok 4.6
  - Open Dough release: modified; revision 1805b5a; base 0.3.22
  - Evidence: Probe from
    `.worktrees/051-guide-manual-exploration/.agents/skills/dough-execute-plan/scripts/ci-mailbox.mjs`
    printed `CI_OBSERVER {"directory":"/tmp/dough-ci-501/watch-P9o15E"}`.
    Pushes `ed19f9f`, `067b29f`, `96822da` to
    `quick/051-guide-manual-exploration`. Plan records CI observation unavailable.
  - Observed effect: No observer was armed; `pendingCi: unobserved` for the
    whole planned execution. GitHub Actions for the branch was not claimed.
  - Inference: The adapter requires a separate hook `CI_MONITOR_READY` after
    the receipt; a probe directory is not an execution observer. Following the
    unavailable-bridge path avoided a disconnected watcher. Whether the Cursor
    hook failed to bind `generation_id` was not proved.

## DD-065 — A genuinely failed CI run was reported as merely uncovered, not failed

The observer reports coverage unavailable, not failure, when three discovery
polls complete without finding the pushed SHA's run. GitHub Actions can still
be about to run, or already running, that exact SHA when the third poll
completes; the observer does not retry discovery for that SHA afterward, so a
run that later fails is never surfaced as a failure, only as lost coverage.

### Occurrences

- Execution: `SEED-008#publish-shared-backlog-claims @ 06504a5`
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
