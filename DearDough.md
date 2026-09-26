# DearDough Process Findings

## ODF-087 — Cheap worktree-readiness substitutes can pass while native hosts skip the gate

Former local code: DD-089.

Released execution-location guidance requires setup then a project command before implementation. Cheap checks prove a substitute actor and wording. Native execute-plan sessions still completed greeting.txt without that gate, except Cursor fresh-node after traces were used. Shallow stream command extraction missed nested Cursor events.

### Occurrences

- Execution: `a168a39f64a75c579a713674a5dda5ca46bed6ea:.planning/quick/069-prepare-execution-worktree/PLAN.md`, first related implementation commit `6d7f7f30cea464f0ae2d6e269a3fd578d899390d`
  - Timestamp: 2026-09-21T09:08:13Z
  - Tool: Cursor
  - Model: Cursor Grok 4.6
  - Open Dough release: modified; revision `98bfa80bb45a2a0156318230c75f7964ec0291e6`; base `0.3.27`
  - Evidence: Cursor fresh-node `/tmp/dough-execution-worktree-prep-native-069/cursor/fresh-node/20260921T090813-3f7f/` first assessment fail (empty commands, traces present); current assessor pass on observation.json. Codex/Claude fresh-node, Cursor failed-prep/reuse, Claude wrapper: complete streams, greeting written, no gate. Prompt asks for hello-ok and does not tell the agent to install.
  - Observed effect: cheap wrapper contracts passed; five native cases skipped the gate or continued after failed prep. Not retried until green.
  - Inference: Qualified. Distinct from DD-074 (guidance now exists) and ODF-070 (directory presence). Wording greps and a substitute actor cannot prove native follow-through when the user outcome does not need project commands.

## ODF-058 — Assertions concentrated on exit status and published bytes left the tool's own reported output unproved

Former local code: DD-056.

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

## ODF-059 — Delegated refactor pass stalled after editing and before reporting

Former local code: DD-057.

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

- Execution: `SEED-021#identify-taken-work-owner` / plan 091, first related implementation commit `567f9b2`
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

## ODF-060 — A new payload file was published without being declared, and only CI noticed

Former local code: DD-058.

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

## ODF-061 — A shell assertion silently enforced nothing on the developer's bash

Former local code: DD-059.

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
- Execution: `SEED-037#diagnosable-test-hangs` / plan 104, first related implementation commit `044c88f`
  - Timestamp: 2026-09-25T22:30:43+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `87ffccb`
  - Evidence: `1e648d9` runner tests passed on macOS Bash 5.3.20; CI run
    `36147702793` `test` printed only `FAIL: tests/test-runner-interrupt.sh`;
    Docker ubuntu:24.04 Bash 5.2.21 failed 3/3; repair `a64138e`.
  - Observed effect: two failed CI runs, a pause-and-stash cycle, one repair.
  - Inference: Other mechanism, same gap: before Bash 5.3 a bare `return` in a
    trap-called function takes the interrupted `wait`'s status.

## ODF-062 — A CI repair was delivered without the refactor pass its own delivery gate requires

Former local code: DD-060.

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

## ODF-064 — A correction returned after the refactor pass was delivered without a refactor pass of its own

Former local code: DD-062.

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

- Execution: `SEED-026#auto-refresh-published-dashboard @ dcb0944`
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

## ODF-065 — A CI observer that died mid-execution stayed reported as attached until shutdown

Former local code: DD-063.

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

## ODF-067 — Delegated Git-fixture proof for a "stop" behavior defaults to a tautology

Former local code: DD-054.

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

- Execution: `SEED-008#script-driven-ci-observation @ 02991a5`
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
- Execution: `SEED-037#diagnosable-test-hangs` / plan 104, first related implementation commit `044c88f`
  - Timestamp: 2026-09-25T22:14:40+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `87ffccb`
  - Evidence: `0f07f9b` made `createQueuedTrunk().cleanup` async; its consumer
    check covered `.mjs` callers only, lint ran on changed files; CI run
    `36146130701` `lint` failed in `dashboard/tests/preparingJourney.ts`.
  - Observed effect: one failed CI run, a pause-and-stash cycle, repair `2b3b02e`.
  - Inference: The TypeScript consumer lay outside the assumed file types.

## ODF-069 — A genuinely failed CI run was reported as merely uncovered, not failed

Former local code: DD-065.

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

## ODF-070 — A nested execution worktree's `node_modules` was assumed absent instead of tested

Former local code: DD-066.

Two independent refactor-pass agents, working in a Story Branch execution
worktree created under the integration checkout's own working directory
(`.worktrees/<slug>/`), reported this project's selective-formatting command
as unusable because the worktree itself has no `node_modules` directory. Both
reports treated `ls node_modules` (or an equivalent local existence check) as
proof the command could not run, without invoking the actual command. Because
the worktree is a subdirectory of the checkout that does have `node_modules`
installed, Node's own upward module-resolution walk finds and uses that
parent directory's packages, so `npm run format` and its `eslint`/`prettier`
dependents run correctly from inside the nested worktree with no setup step.

### Occurrences

- Execution: `SEED-008#planning-workspace-procedure @ 45234b9`
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

## ODF-071 — A coordinator-started nested observer for a native acceptance session is silently orphaned

Former local code: DD-068.

The CI-mailbox binding that lets a hook deliver a queued event only forms
when the *observed* session's own tool output contains the `CI_OBSERVER`
receipt line for that mailbox (`ci-host-hook.mjs`'s `selectCiEvents` scans
`Shell`/`Bash` `tool_output` for the receipt and only then writes the
`owner`/`bindings` files). A coordinator that starts the observer itself,
outside the native session it intends to observe, produces a mailbox with no
owner: the native session's later hook invocations never see that receipt in
their own tool output, so the queued event is never delivered, and the
mailbox reports `unread: 1` at stop with no error.

### Occurrences

- Execution: `.planning/quick/032-refuse-managed-hook-command-variants/PLAN.md @ 29dadf3`
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

## ODF-072 — Cursor's Shell tool does not inherit the launching process's `PATH`, only its other environment variables

Former local code: DD-069.

`cursor agent --print` reconstructs its own `Shell`-tool `PATH` (a fixed,
login-shell-like list) rather than inheriting the `PATH` set on the process
that launched `cursor agent`; ordinary environment variables set the same
way (not `PATH`) do propagate to that Shell tool's subprocess. A stand-in
binary meant to intercept a command the agent runs (for example a controlled
`gh`) must have its directory prepended to `PATH` inline, inside the exact
command text the agent is told to run, not via the launching shell's `PATH`.

### Occurrences

- Execution: `.planning/quick/032-refuse-managed-hook-command-variants/PLAN.md @ 29dadf3`
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
    fixed system `PATH` unrelated to the launching shell's.
  - Observed effect: one extra diagnostic native session run to isolate
    which of `PATH` vs. arbitrary environment variables actually propagates,
    before the acceptance prompt was written with the `PATH=` prefix placed
    inline in the exact command text.
  - Inference: Qualified, single occurrence. Recording this distinction in
    `.claude/skills/dough-execute-plan/references/ci-notify-hosts.md` next
    to its existing disposable-command guidance would let a future executor
    reuse this fact instead of re-deriving it from a fresh diagnostic
    session; not tested here.

## ODF-089 — A GitHub observer that gives up after persistent errors gives `register-push` no distinguishable "ended" signal

Former local code: DD-090.
After three consecutive polling errors, `watch-ci-execution.mjs` deliberately
ends observation, and `ci-mailbox.mjs` records one `CI_MONITOR_UNAVAILABLE`
event plus a normal `{"status":"finished"}` result — legitimate, but
distinct from the "lost its worker" crash case `ci-notify-hosts.md` already
documents a hook message for. A coordinator that keeps calling
`register-push` against that same directory afterward gets an
ordinary-looking `CI_OBSERVER {"revision":{"state":"unchecked",...}}`
receipt and a repeated "CI observer attached" hook message — nothing
distinguishes "still polling" from "ended, will never poll this SHA."

### Occurrences

- Execution: `.planning/quick/076-path-filter-aware-ci-observation/PLAN.md @ a8f9eb19be42e1b8c0a9b6e1e428fffbee6f2865`
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

## ODF-092 — Claude Code managed delivery lacked session identity; a refused retry left a hidden observer

Former local code: DD-095.

Delivery without `--session-json` returned `pendingCi: unobserved`; no guidance
names Claude Code's `$CLAUDE_CODE_SESSION_ID`. A retry for the accepted SHA was
refused ("rebase left the pre-rebase SHA") after starting an unreported observer.

### Occurrences

- Execution: `quick/088-dough-land/PLAN.md @ 647ff01`
  - Timestamp: 2026-09-24T10:50:57+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: 0.3.36
  - Evidence: retry-created `watch-Vcl3dH` reused at 5650123; plus `watch-ljLxgl`.
  - Observed effect: two observers for one branch until one was stopped.
- Execution: `SEED-004#accept-delivery-evidence-native` / plan 089, first related implementation commit `eff3e76293b4564e25089bdeccbb07767e18f491`
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

- Execution: `SEED-021#follow-published-story-branch` / plan 092, first related implementation commit `3f64bc7`
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

- Execution: `SEED-038#recognize-agents-and-tools-by-avatar` / plan 097, first related implementation commit `3102053`
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

- Execution: `SEED-025#show-backlog-preparation-states` / plan 099, first related implementation commit `9c142ed`
  - Timestamp: unknown (first increment delivery, after commit `9c142ed` at 2026-09-25T19:34:58+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `87ffccb`
  - Evidence: `9c142ed` delivery `unobserved`; `--session-json` retry refused; next delivery "reused" unreported `watch-uBx7hd`, the one after it started `watch-qwZ6VX`.
  - Observed effect: `9c142ed` never observed; two observers on one branch.

- Execution: `SEED-008#useful-startup-output` / plan 100, first related implementation commit `075e955`
  - Timestamp: 2026-09-25T19:11:03+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `87ffccb`
  - Evidence: first delivery `unobserved` ("host session identity is required");
    a retry with `CLAUDE_CODE_SESSION_ID` was refused (exit 2) yet left
    `watch-KU7jG9` running beside the manually started `watch-pgkPLM`.
  - Observed effect: again a hidden duplicate observer, found only by the retrospective.

- Execution: `SEED-042#rename-slice-plan-folder-references` / plan 111, first related implementation commit `e7b7ad1`
  - Timestamp: unknown (first increment delivery, after commit `e7b7ad1` at 2026-09-26T14:11:57+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `f87d34c`
  - Evidence: `e7b7ad1` receipt `unobserved` ("host session identity is required"); no retry; explicit `ci-mailbox.mjs start` + `register-push` attached `watch-1QARos`.
  - Observed effect: no duplicate observer, but recovery again needed a read of `ci-host-bridge.mjs`.

## ODF-093 — A delegated agent's `git stash pop` applied another session's stash

Former local code: DD-094.

Stashes are shared by all worktrees. After a failed `git stash push -- $G` (zsh),
`git stash pop` applied an unrelated Codex session's stash; delegation is silent.

### Occurrences

- Execution: `quick/088-dough-land/PLAN.md @ 647ff01`
  - Timestamp: unknown; 2026-09-24 between e2a453e (10:40:49+08:00) and 647ff01
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: 0.3.36
  - Evidence: slice 1 implementation report; foreign `stash@{0}` still listed.
  - Observed effect: four conflicted files restored; a clean pop drops the stash.

## ODF-094 — Implementation and refactor agents were barred from lint the project has no hook for

Former local code: DD-093.

The delegation contract forbids agents an "independent hook-owned lint
command". In a project with no commit hook, where the formatter command also
runs lint, the coordinator applied that ban to all lint. Lint findings then
surfaced only at the coordinator's formatting step, after refactoring.

### Occurrences

- Execution: `SEED-026#auto-refresh-published-dashboard @ dcb0944`
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

## ODF-095 — Behavior-only delivery-evidence slices cloned native run scaffolding four times

Former local code: DD-092.

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

## ODF-096 — Native acceptance fixtures' sufficient side was not credible, and each case paid a failed run to learn it

Former local code: DD-096.

In three of the four delivery-evidence cases, the scenario meant to show
sufficient proof proceeding was not credibly sufficient. It used
marker-string products, committed the "returned" correction in the baseline,
or made a promise the product did not meet. Stricter hosts rightly refused.
The plan allowed test-support fixes only after a run diagnosed a fault, so the
known fault class was rediscovered with a paid failing run per case.

### Occurrences

- Execution: `SEED-004#accept-delivery-evidence-native` / plan 089, first related implementation commit `eff3e76293b4564e25089bdeccbb07767e18f491`
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

## ODF-097 — Coordinator published a commit after the formatter failed

Former local code: DD-097.

The coordinator chained the formatter and commit with `;`, not `&&`. It
committed and pushed a change that failed ShellCheck, even though wrap-up
says formatting must succeed before staging.

### Occurrences

- Execution: `SEED-004#accept-delivery-evidence-native` / plan 089, first related implementation commit `eff3e76293b4564e25089bdeccbb07767e18f491`
  - Timestamp: 2026-09-24T12:22:01+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.34
  - Evidence: slice 2 command printed `fmt=1` then committed `c33dbea`; CI
    `lint` failed with SC2016; repair `0662ed2` passed.
  - Observed effect: one extra commit, push, and failed CI run.
  - Inference: A one-off coordinator error, not a guidance gap; gate
    commands with `&&`.
- Execution: `SEED-037#diagnosable-test-hangs` / plan 104, first related implementation commit `044c88f`
  - Timestamp: 2026-09-25T22:28:16+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `87ffccb`
  - Evidence: `npm run lint 2>&1 | tail -2 && git commit` hid lint's exit 1;
    `1e648d9` was published, CI run `36147702793` `lint` failed; repair `decb252`.
  - Observed effect: one extra commit, push, and failed CI lint job.

## ODF-098 — A slice's proof named a suite only a later slice's behavior keeps green

Former local code: DD-098.

Plan 091 mapped slice 1's proof to the startup race suite, but race-safe
agent-name choice was slice 3, whose seam note predicted the failure without
it. Slice 1 was not CI-safe until slice 3 was folded into it.

### Occurrences

- Execution: `SEED-021#identify-taken-work-owner` / plan 091, first related implementation commit `567f9b2`
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

## DD-100 — An idle-machine precondition for the speed baseline stalled execution on a shared machine

The plan required load below 4 before each baseline run; other work kept it at 50–180, and the only resolution was the developer's instruction to measure relatively (paired start-revision and candidate runs under the same load).

### Occurrences

- Execution: `SEED-037#quiet-stable-four-times-faster-tests` / plan 096, first related implementation commit `0fdf13c`
  - Timestamp: unknown (wait began after claim `bad3717` at 2026-09-25T11:35:32+08:00 and lasted about 40 minutes)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: 0.3.39
  - Evidence: plan 096 (`.planning/quick/096-quiet-stable-fast-tests/PLAN.md` at `704cd20`) Outside-in proof "Machine" bullet and "Comparable measurement (relative)"; the unpaired baseline under load 54–66 read 664.9 s where the paired start revision read 242.6 s.
  - Observed effect: no slice could start until the developer intervened; the loaded baseline overstated the start revision by about 2.7×.

## DD-102 — A delegated journey spec reported green failed the coordinator's rerun under load

New `backlog-preparing.spec.ts` built a 6.3 s Git journey in a 30 s `beforeAll`; beside one spec at load ~15 it timed out.

### Occurrences

- Execution: `SEED-025#show-backlog-preparation-states` / plan 099, first related implementation commit `9c142ed`
  - Timestamp: 2026-09-25T20:53+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `87ffccb`
  - Evidence: slice 4 return claimed 13/13 and 115/115; rerun: "beforeAll hook timeout of 30000ms exceeded"; fixed in `e11c09a`.
  - Observed effect: the coordinator's independent rerun caught a load-sensitive test before delivery.

## DD-103 — Removing a test's assertion broke a meta-test that mutated against it

Slice 1 moved installed link walking to a new declaration check; `tests/story-payload-assertions.sh` still expected the removed loop to report its injected broken link. Plan, implementer, acceptance, and refactor pass all missed it; CI failed.

### Occurrences

- Execution: `SEED-037#fewer-installer-runs-per-promise` / plan 108, first related implementation commit `c7112a5`
  - Timestamp: 2026-09-26T11:34:31+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance at start revision `fa1549a`
  - Evidence: CI run 36215060849 ("the suite accepted a failed story payload test"); repair `3dc3e85`; the slice 1 return said "No shared helper changed" for the consumer check.
  - Observed effect: one failed CI run, a stash and repair cycle with two extra agents; a dependent-test search added to slices 2–4 prompts found nothing more.
  - Inference: Qualified. The consumer check covers changed helpers, not assertions removed from a test; resembles ODF-003 and ODF-098 without the same cause.

## DD-104 — Leftover state in the default checkout blocked execution startup and never let it refresh

Startup refused a queued story ("unpublished selected story source in originating
checkout"): the default checkout held an untracked seed and backlog edit
byte-identical to published `d021218`, and the refusal did not say so. That
checkout also keeps in-checkout execution worktrees under an unignored
`.worktrees/`, so automatic refresh always defers with `pending-edit`.

### Occurrences

- Execution: `SEED-042#rename-slice-plan-folder-references` / plan 111, first related implementation commit `e7b7ad1`
  - Timestamp: unknown (startup refusal before claim `b1f5dc8` at 2026-09-26T13:53:24+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `f87d34c`
  - Evidence: `execution-start.mjs start` → `source-refused`; leftover blobs equal `d021218`'s; local commit `2de5b10` (kept on `backup/2de5b10-local-seed-042`) swept in three `.worktrees/*` gitlinks; claim and delivery reported `maintenance: deferred`.
  - Observed effect: one human round trip and a manual reset of the default checkout to `origin/main` before the claim.
  - Inference: Qualified. The source check compares only local HEAD, index and worktree, so a stale published copy looks unpublished; ignoring the worktree root would end the deferral and the gitlink risk.

## Retention

- Highest allocated local number: 104
- Recovery: `e7b7ad1:DearDough.md` (ODF-092 plans 097 ci-verdict-delivery and 096 occurrences); `fa1549a:DearDough.md` (DD-101 plan 099 finding); `b633e1d:DearDough.md` (ODF-099, addressed by `075e955`; full copy in `docs/maintainer/finding-names.md`); `876a0b0:DearDough.md` (ODF-099 plan 100 occurrence); `bde06c7:DearDough.md` (ODF-099 plans 097 and 099 occurrences); `dedd650:DearDough.md` (ODF-092 plan 091 occurrence); `6494de2:DearDough.md` (ODF-099 plans 094 and 097 avatar occurrences); `e11c09a:DearDough.md` (ODF-099 plan 094 occurrence; ODF-092 plan 089 inference); `1415ecc950748103ba1b7aa6aaf14b5914fec1d0:DearDough.md` (ODF-088, addressed by `6d7f7f3`; full copy in `docs/maintainer/finding-names.md`); `a4bd89746388630af49a32750b1af1d51e3a3db2:DearDough.md` (ODF-052, addressed and released); `61bb3853099c3d6d426ef15e367e65452f928095:DearDough.md` (ODF-072 evidence detail); `e77aead21cc3a05139d8000962059e29d283fc8c:DearDough.md`; earlier retention `98bfa80bb45a2a0156318230c75f7964ec0291e6:DearDough.md`; 070 before-cleanup `52a7e630037aa0bca1295a3399758aba15aba29e:DearDough.md`
- Occurrence history is partial
