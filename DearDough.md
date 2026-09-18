# DearDough Process Findings

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
    Qualified: the delivered behavior is correct; what is missing is proof, not
    a working outcome.

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

