# DearDough Process Findings

## ODF-087 — Cheap worktree-readiness substitutes can pass while native hosts skip the gate

Former local code: DD-089.

Released execution-location guidance requires setup then a project command before implementation. Cheap checks prove a substitute actor and wording. Native execute-plan sessions still completed greeting.txt without that gate, except Cursor fresh-node after traces were used. Shallow stream command extraction missed nested Cursor events.

### Occurrences

- Execution: `a168a39f64a75c579a713674a5dda5ca46bed6ea:.planning/slice-plans/069-prepare-execution-worktree/PLAN.md`, first related implementation commit `6d7f7f30cea464f0ae2d6e269a3fd578d899390d`
  - Timestamp: 2026-09-21T09:08:13Z
  - Tool: Cursor
  - Model: Cursor Grok 4.6
  - Open Dough release: modified; revision `98bfa80bb45a2a0156318230c75f7964ec0291e6`; base `0.3.27`
  - Evidence: Cursor fresh-node `/tmp/dough-execution-worktree-prep-native-069/cursor/fresh-node/20260921T090813-3f7f/` first assessment fail (empty commands, traces present); current assessor pass on observation.json. Codex/Claude fresh-node, Cursor failed-prep/reuse, Claude wrapper: complete streams, greeting written, no gate. Prompt asks for hello-ok and does not tell the agent to install.
  - Observed effect: cheap wrapper contracts passed; five native cases skipped the gate or continued after failed prep. Not retried until green.
  - Inference: Qualified. Distinct from DD-074 (guidance now exists) and ODF-070 (directory presence). Wording greps and a substitute actor cannot prove native follow-through when the user outcome does not need project commands.

- Execution: `SEED-008#durable-workspace-creation-fact` / plan 147, first related implementation commit `cb066559`
  - Timestamp: 2026-09-29T09:03:35+08:00 (native Claude Code `trunk-closure/owned-context`)
  - Tool: Claude Code (coordinator; hosts Claude, Codex, Cursor)
  - Model: claude-opus-5-5[1m]
  - Open Dough release: modified; revision `b8946e99`; base 0.3.46
  - Evidence: six owned-context runs printed PASS; five ran the creation-record read, while Claude's closure removed the worktree after the containment check alone (no `for-each-ref`, no "Close or retain it" read). Accepted only after `3b1f8619` named the check and one rerun read the record.
  - Observed effect: the assessor, which observes only the retired outcome, passed a native agent that skipped the ownership gate; caught only by transcript inspection.

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
    correction ownership is `.planning/slice-plans/058-preserve-backlog-merge-intent/PLAN.md`.

## ODF-059 — Delegated refactor pass stalled after editing and before reporting

Former local code: DD-057.

An independent post-change refactor agent finished its edits but stopped
without returning a report, leaving the coordinator with uncommitted
third-party changes in the worktree and no account of what they were or why.

### Occurrences

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

- Execution: `SEED-008#installed-wrap-up-command` / plan 146, first related implementation commit `aa4fd510`; Timestamp: unknown (2026-09-29, before `809b407d` 13:54:50+08:00); Tool: Claude Code; Model: claude-opus-5-5[1m]; Open Dough release: modified; revision `3ca0b8f9`; base 0.3.46.
  - Evidence: the refactor pass on the Story Branch native harness repair left two edits uncommitted and stopped (600 s stream watchdog) while "rerunning the accepted proof"; the coordinator reran that proof and delivered `809b407d`. Slice 3's implementation agent stalled the same way before writing anything and resumed through SendMessage.
  - Observed effect: two stalls in one execution, each costing a 10-minute wait and a coordinator-side recovery; no work lost.

## ODF-062 — A CI repair was delivered without the refactor pass its own delivery gate requires

Former local code: DD-060.

The CI observation protocol routes a repair through the ordinary slice
wrap-up, whose first delivery step is an independent post-change refactor pass.
A coordinator can run the visible remainder of that sequence — formatting,
staging, commit, push, observer registration — and skip the refactor step
without any gate noticing, because nothing downstream depends on it having run.

### Occurrences

- Execution: `.planning/slice-plans/058-preserve-backlog-merge-intent/PLAN.md @ a242412`
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

- Execution: `.planning/slice-plans/060-gate-and-deliver-scripted-backlog/PLAN.md @ de7d819`
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

- Execution: `SEED-028#admission-coherence` / plan 113, first related implementation commit `733fe46`
  - Timestamp: 2026-09-26T18:42:15+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: modified; revision 1b66466; base 0.3.41
  - Evidence: slice 3 (`9e635ae`) changed the `record-state` CLI; the
    coordinator told the slice agent not to run Playwright because another
    agent was using it, and the refactor return judged the dashboard
    unaffected because it imports only the pure story-state reader. CI run
    `36236595203` `dashboard` failed in fixtures that shell out to
    `record-state` (`dashboard/tests/storyReadinessCli.ts`); repair `33fd629`.
  - Observed effect: one failed CI run, a stash-and-repair cycle.
  - Inference: Qualified match: the consumer check followed imports, not
    command-line callers, and a concurrency convenience removed the suite
    that would have caught it.

- Execution: `SEED-008#same-machine-merge-queue` / plan 140, first related implementation commit `9597bf61`
  - Timestamp: 2026-09-28T13:21:44+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `2b46e651`; VERSION 0.3.45
  - Evidence: slice 3 (`600f5f45`) moved workspace selection onto a new
    `repository` field and re-wrapped guidance; focused proof globbed
    `workspace-publication-startup-*`. CI run `36381588951` failed
    `workspace-publication-race.test.mjs` (still passed only `integration`, so
    Git ran in the runner's repository) and three
    `workspace-ownership-lifecycle.test.mjs` phrase regexes; repair `615df2ad`.
  - Observed effect: one failed CI run, a stash-and-repair cycle with one extra agent.
  - Inference: Qualified. Consumers were chosen by name pattern and skill
    directory; later slices that also ran the whole `node --test` suite (698)
    before return sent no further consumer break to CI.

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

## ODF-093 — A delegated agent's `git stash pop` applied another session's stash

Former local code: DD-094.

Stashes are shared by all worktrees. After a failed `git stash push -- $G` (zsh),
`git stash pop` applied an unrelated Codex session's stash; delegation is silent.

### Occurrences

- Execution: `slice-plans/088-dough-land/PLAN.md @ 647ff01`
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

## ODF-096 — Native acceptance fixtures' sufficient side was not credible, and each case paid a failed run to learn it

Former local code: DD-096.

In three of the four delivery-evidence cases, the scenario meant to show
sufficient proof proceeding was not credibly sufficient. It used
marker-string products, committed the "returned" correction in the baseline,
or made a promise the product did not meet. Stricter hosts rightly refused.
The plan allowed test-support fixes only after a run diagnosed a fault, so the
known fault class was rediscovered with a paid failing run per case.
Its plans 142 and 146 occurrences, harness observation faults rather than
fixture credibility, moved to [ProjectFindings.md](ProjectFindings.md) as DD-179.

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

- Execution: `SEED-028#track-ad-hoc-work` / plan 110, first related implementation commit `4286761`
  - Timestamp: 2026-09-26T06:13:32Z (first native `admission-investigation` run)
  - Tool: Claude Code (coordinator; the native host was Codex)
  - Model: claude-opus-5-5[1m]
  - Open Dough release: modified; revision `bd38782`; base `0.3.40`
  - Evidence: native results `codex/publication/admission-investigation/20260926T061332-6642` assessed fail; the prompt said not to write outside planning records while the probe writes a marker, so Codex rightly skipped the probe. Prompt fixed; rerun `20260926T063848-77f6` passed.
  - Observed effect: one paid failed native run to learn that the fixture could not credibly show the promised ordering.
- Execution: `SEED-044#native-premise-acceptance-codex-cursor` / plan 141, first related implementation commit `8373b163`; Timestamp: unknown (2026-09-28–29); Tool: Codex; Open Dough release: 0.3.46 on resume, original coordinator release unknown.
  - Evidence: `642d0938` records safe admission before edits on the inherited migration fixture; `ae667576` and `a18b3bf7` show inexpensive alias/versioned-rewrite solutions disproving necessary growth. `0ef7767a` replaces it with executable active/archive collision proof; `a38f8257` records the single v0.3.46 native after-edit carry pass. Observed effect: one paid inconclusive case, two cheap feasibility probes and an explicit fixture-choice handoff. Inference: the same fixture-credibility problem affected ordering here; test legitimate small solutions before claiming that a case necessarily grows. No reliability or quantified savings claim.

## ODF-097 — Coordinator published a commit after the formatter failed

Former local code: DD-097.

The coordinator chained the formatter and commit with `;`, not `&&`. It
committed and pushed a change that failed ShellCheck, even though wrap-up
says formatting must succeed before staging.

### Occurrences

- Execution: `SEED-004#accept-delivery-evidence-native` / plan 089, first related implementation commit `eff3e76293b4564e25089bdeccbb07767e18f491`; Timestamp: 2026-09-24T12:22:01+08:00; Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.34
  - Evidence: slice 2 command printed `fmt=1` then committed `c33dbea`; CI `lint` failed with SC2016; repair `0662ed2` passed.
  - Observed effect: one extra commit, push, and failed CI run.
  - Inference: A one-off coordinator error, not a guidance gap; gate commands with `&&`.
- Execution: `SEED-052#revisit-dashboard-sessions` / plan 150, first related implementation commit `5933bb9178a503409b9574f9b87207cbf5f8fbb5`; Timestamp: 2026-09-29T11:44:42+08:00; Tool: Claude Code; Model: claude-opus-5-5[1m]; Open Dough release: unknown; installed guidance last updated by `b37292dd`
  - Evidence: slice 3 command printed `format exit=1`, then `;` ran the agent commit and managed delivery of `f332b5dd`; CI run 36518504860 `lint` failed on `eqeqeq`; repair `ca2586f8`. Later deliveries gated with `||`.
  - Observed effect: one failed CI run, one repair commit, and an extra refactor agent.
  - Inference: Qualified. The same hand-built chain recurred, so this is no longer a one-off; one scripted format-then-commit step would stop it.

- Execution: `SEED-008#closure-proof-and-harness-correction` / plan 154, first related implementation commit `d1204cd7`; Timestamp: 2026-09-29T15:42:14+08:00; Tool: Claude Code; Model: claude-opus-5-5[1m]; Open Dough release: unknown; installed guidance last updated by `b37292dd`
  - Evidence: slice 4 command printed `FMT 1` (shellcheck SC2030/SC2031 in `tests/native-evidence-identity.sh`), then `;` ran the agent commit and delivery of `ea306a5e`; CI run 36538231567 `lint` failed on the same finding; repair `14cd2de3`. Slices 1–3 used the same `;` chain and passed only because formatting succeeded. Observed effect: one failed CI run and one repair commit. Inference: third occurrence of the same hand-built chain, in a coordinator whose log already held ODF-097's plan-150 row from that morning; the rule alone does not stop it.
- Execution: `SEED-052#keep-story-session-links` / plan 157, first related implementation commit `30bdc002`; Timestamp: 2026-09-29T17:40:19+08:00; Tool: Claude Code; Model: claude-opus-5-5[1m]; Open Dough release: unknown; installed guidance last updated by `b37292dd`
  - Evidence: CI repair command printed `FORMAT=1`, then `;` ran the agent commit and delivery of `76e6dce3`. The lint errors were in slice 3's unstaged `agent-launch-records.spec.ts`, not the committed file; CI run 36550678777 passed. Observed effect: none this time. Inference: fourth occurrence of the `;` chain; a whole-repository formatter's exit status also cannot tell a staged commit's findings from another uncommitted change's (compare ODF-128).

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

## ODF-118 — Removing a test's assertion broke a meta-test that mutated against it

Former local code: DD-103.

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

## ODF-100 — A piped lint failure did not stop publication

Former local code: DD-097 (plan 104 occurrence only).

Pipeline exit status hid the failed lint command; the earlier semicolon-chain occurrence remains ODF-097.

### Occurrences

- Execution: `SEED-037#diagnosable-test-hangs` / plan 104, first related implementation commit `044c88f`
  - Timestamp: 2026-09-25T22:28:16+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `87ffccb`
  - Evidence: `npm run lint 2>&1 | tail -2 && git commit` hid lint's exit 1;
    `1e648d9` was published, CI run `36147702793` `lint` failed; repair `decb252`.
  - Observed effect: one extra commit, push, and failed CI lint job.
- Execution: `SEED-052#interact-with-claude-terminal` / plan 152, first related implementation commit `549e2d5a`
  - Timestamp: 2026-09-29T14:48:19+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance VERSION 0.3.46, last updated by `b37292dd`
  - Evidence: `npm run -s format 2>&1 | tail -1 && python3 … && git commit … && deliver` printed "Format failed: unresolved findings" yet continued; `ee35dd55` was published, CI run `36533023610` `lint` failed (`unbound-method`, `App.tsx:130`); repair `815844e4`. This repository has no commit hook, so formatting was the only local lint gate.
  - Observed effect: one extra commit, refactor pass, push, and failed CI lint job; the other CI jobs passed.
  - Inference: Qualified. The same coordinator had checked exit status correctly in earlier slices of this run; batching format, plan edit, commit, and delivery into one piped chain reintroduced the fault.

## ODF-154 — Cursor managed delivery lacks its coordinator session identity

Former local code: DD-095 (plan 126 Cursor occurrence only).

Cursor conversation/generation identity was absent on first delivery. The Claude-only environment fallback does not resolve this host identity.

### Occurrences

- Execution: `SEED-046#ci-verdict-correction` / plan 126, first related implementation commit `9fa45de`
  - Timestamp: unknown (first increment delivery, between commit `9fa45de` at 2026-09-27T12:43:54+08:00 and the observer start minutes later)
  - Tool: Cursor
  - Model: kimi-k3
  - Open Dough release: modified; revision `ff3534c`; base 0.3.42
  - Evidence: `9fa45de` delivery receipt `observation.state: unobserved` ("host session identity is required to verify the notification bridge"); a manual probe then showed `CI_MONITOR_READY`; explicit `ci-mailbox.mjs start` + `register-push` attached `watch-7YVAZ1`; the next managed delivery reported `observation.state: reused`.
  - Observed effect: first Cursor occurrence; slice 1's increment was unobserved until the manual start, and the finding's `$CLAUDE_CODE_SESSION_ID` recovery does not apply to Cursor's conversation/generation identity.

- Execution: `SEED-053#dashboard-browser-navigation` / plan 136, first related implementation commit `8ca2f7eb`
  - Timestamp: 2026-09-27T22:11:50+08:00
  - Tool: Cursor
  - Open Dough release: 0.3.43
  - Evidence: completion input `pendingCi: unobserved` ("host session identity required for Cursor notification bridge"); retained tip `777b797926acfab373a6cd45766e3066cbd9da95`
  - Observed effect: managed delivery left the story-branch tip unobserved; no Cursor session identity was available to arm the notification bridge
  - Inference: Same Cursor host-identity gap as the plan 126 occurrence; Claude-only recovery remains inapplicable

## ODF-132 — A delegated implementation agent handed back before finishing its own required proof

Former local code: DD-111.

Slice 2's agent returned three times with its ablation and paired measurement unfinished while its background runs continued, asking the coordinator to finish them. Possibly related to ODF-059 (a stall after editing), but here the agent returned.

### Occurrences

- Execution: `SEED-037#fourfold-local-suite` / plan 107, first related implementation commit `273ae9a`
  - Timestamp: unknown (between `8da97ee` and `342b939`'s delivery on 2026-09-26)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `f87d34c`
  - Evidence: reports "measurement incomplete" and "I had to hand back before your remaining steps were finished"; the coordinator stopped it and ran the reruns and 3×3 pairs; later briefs saying "finish all required proof yourself" returned complete.
  - Observed effect: about an hour of coordinator-driven measurement on slice 2.

## ODF-134 — A Story Branch execution rebased onto trunk, and managed delivery rebased it back

Former local code: DD-115.

The plan said to integrate onto whichever sibling runner change had landed. In
Story Branch Mode the coordinator rebased its unpublished commit onto
`origin/main`; managed delivery then reconciled that suffix onto the remote
execution branch tip, dropping the trunk base, and returned `needs-validation`.

### Occurrences

- Execution: `SEED-049#native-result-path-diagnosis` / plan 124, first related implementation commit `70386eb`
  - Timestamp: 2026-09-27T11:46:54+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `707f3ac`
  - Evidence: rebased `1749032` on `80ba4e4`; `deliver` gave candidate `6781c03` on `d50bd27`, `suffixBase` `d50bd27`; accepted `70386eb`.
  - Observed effect: one full local suite run proved a base the branch never published; plan proof text was rewritten and re-proved before delivery.
  - Inference: Qualified. Trunk integration belongs to Story Branch wrap-up; a plan's "integrate onto whichever landed" reads as a mid-execution rebase.

## ODF-136 — An out-of-scope local failure was fixed without first fetching trunk, duplicating a sibling's fix

Former local code: DD-116.

The full local suite failed on `tests/support/dashboard-dev-port.test.mjs`
because a developer's dashboard server held port 43127. The coordinator wrote
an equivalent fix; trunk already carried one from a sibling execution.

### Occurrences

- Execution: `SEED-049#native-result-path-diagnosis` / plan 124, first related implementation commit `70386eb`
  - Timestamp: unknown; between the claim at 2026-09-27T11:18 and commit `f67f671` at 2026-09-27T11:43:11+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `707f3ac`
  - Evidence: trunk fix `a034dfd` committed 2026-09-27T09:58:29+08:00; local rewrite discarded before `f67f671`.
  - Observed effect: one rewrite and focused run wasted; found only when a later fetch showed the file size gap.
  - Inference: Qualified. With parallel agents on trunk, fetching before fixing an unrelated failure is cheap and may find it already fixed.

## ODF-116 — A sibling story's refinement invalidated readiness, costing a reassessment cycle before the claim

Former local code: DD-120.

Execution-start refused a ready, queued correction with `source-refused`
("published preparation is needs-reassessment") because a sibling story's
refinement in the same seed had changed the document digest; the correction's
own story section and plan were untouched. Readiness reassessment, a trunk
publication, and a start retry all preceded any work.

### Occurrences

- Execution: `SEED-046#ci-verdict-correction` / plan 126, before its claim `8aeb0ee`
  - Timestamp: unknown; the refusal followed the 2026-09-27T12:26+08:00 invocation and preceded reassessment commit `ff3534c` (2026-09-27T12:28:14+08:00)
  - Tool: Cursor
  - Model: kimi-k3
  - Open Dough release: modified; revision `ff3534c`; base 0.3.42
  - Evidence: refusal `source-refused` / "published preparation is needs-reassessment"; `git diff eaa69a4 HEAD` on the seed showed only the sibling `dashboard-port-race` refinement and wording; reconfirmed basis published as `ff3534c`; the retried start published the claim.
  - Observed effect: one basis-hash diagnosis, one record-state, one trunk publication, and a repeated start before the claim. SEED-043#preserve-sibling-readiness is the queued product response.
- Execution: `SEED-052#recent-sessions-residue` / plan 151, before its claim `34ad359b`
  - Timestamp: unknown; the refusal preceded reassessment commit `b7b3c23d` (2026-09-29T12:43:28+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; repository VERSION 0.3.46 at `b7b3c23d`
  - Evidence: same refusal after SEED-043#preserve-sibling-readiness closed (`fb345ff5`); `git diff f7e7e272 origin/main` on SEED-052 showed only story 3's refinement, which also edited the seed's shared Agreed Boundaries and Ordering text (done-prefix naming moved into story 3). Recorded basis `e646df35…` vs current `db4fc214…`; plan digest unchanged.
  - Observed effect: a diagnosis, a hand-rolled preparation worktree, record-state, commit, rebase, push to trunk, and a start retry before the claim. The coordinator published outside Dough Land and removed the local branch with `git branch -D` (its tip was already on trunk). The developer had asked for a reassessment, so no decision was lost.
  - Inference: Qualified. The fix exempts siblings' own sections, but a sibling refinement that edits shared seed context still invalidates every other story in the seed. Execute-plan names no route from this refusal to the preparation keep path.
- Execution: `SEED-052#preparing-card-refinement-journey` / plan 154, before its claim `f9fe3fdc`
  - Timestamp: unknown; the refusal preceded reassessment commit `3da84888` (2026-09-29, same session)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; repository guidance at `fd077d1d`
  - Evidence: same refusal. Closure `fd077d1d` of the parent SEED-052#recent-sessions-residue rewrote this correction's own Scope provenance and its plan's Source/Provenance lines (branch refs to merged and closed-history refs) without reassessing; both digests changed.
  - Observed effect: one diagnosis, one record-state, one direct trunk commit, and a start retry. Inference: any correction a retrospective creates can be invalidated this way by its parent's wrap-up; the sibling-section fix does not cover it.

## ODF-074 — A ready plan named a validation command the backlog tool does not have

Former local code: DD-121.

Plan 115 slice 2's proof said "The backlog's validation passes", but the
installed backlog tool has no validate operation; the implementation agent
substituted write-time checks, a `read-state` read-back and manual checks.

### Occurrences
- Execution: SEED-044#verify-planning-premises (plan 115; first implementation commit `2c5ff71f`)
  - Timestamp: 2026-09-27T14:17:23+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision `6882aeb3` guidance at planning time
  - Evidence: plan 115 slice 2 text at `6882aeb3`; `product-backlog.mjs` usage lists add, place, take, complete, refresh, direction, adopt, merge, record-state, read-state
  - Observed effect: small detour and an equivalent-proof judgment at acceptance; no rework
  - Inference: same class as the unobserved planning premises this story addresses (catalog ODF-074); plan 115 was written before its own rule

## ODF-137 — Execution start accepts a Take while a preparation of the same story is announced but not kept

Former local code: DD-122.

The start command checks only the published readiness state, so a
coordinator can Take a story whose live preparation is still editing its plan.

### Occurrences
- Execution: `SEED-008#truthful-repair-restore` / plan 115 (truthful-repair-restore), first related implementation commit `8f88364`
  - Timestamp: 2026-09-27T13:43:11+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `707f3ac` (v0.3.42)
  - Evidence: trunk tip `00a0dba` announced the preparation while its worktree held unkept plan edits (the focused command used unsupported direct `node --test`); `execution-start-source.mjs` reads only published state; keep `a1c2375` landed about three minutes later; claim `b11bb98`
  - Observed effect: the coordinator waited by judgment and messaged a peer session that did not hold the preparation, since the agent profile names no session
  - Inference: without that wait, execution would have started from the stale plan and the keep would have collided with the Take

## ODF-138 — A reported guidance gap was accepted without checking its consequence, hiding a data-loss path

Former local code: DD-123.

### Occurrences
- Execution: `SEED-008#truthful-repair-restore` / plan 115 (truthful-repair-restore), first related implementation commit `8f88364`
  - Timestamp: unknown (between claim `b11bb98` at 13:46 and commit `8f88364` at 14:02 +08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `707f3ac` (v0.3.42)
  - Evidence: the slice 1 return listed "Step 5 gives no specific guidance for `none`" and the coordinator recorded it as an untested limit; the retrospective reproduced a staged change conflicting in the index: `restore` reported `applied: "none"`, `paths: []`, and the guided `drop --record` removed the only copy of the paused work
  - Observed effect: two refactor passes and slice 2 shipped guidance that finishes every conflict with a drop; follow-up SEED-008#unapplied-restore-kept
  - Inference: the plan named guidance only for `partial`, so the gap looked like missing polish rather than a safety promise

## ODF-128 — A whole-repository formatter coupled concurrent slices' deliveries

Former local code: DD-117.

Delivery says to run the project's selective formatting command once before
staging, and file-disjoint slices may run concurrently. Here that command
checks every file in the checkout, so one slice's delivery also judged the
other slice's unreviewed, uncommitted work.

### Occurrences

- Execution: `SEED-048#test-environment-correction` / plan 127, first related implementation commit `23a3a75`
  - Timestamp: unknown; before slice 1's commit at 2026-09-27T13:06:01+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `707f3ac7`
  - Evidence: slice 1's `npm run format` failed on SC2312 at
    `scripts/ci-container.sh:58`, slice 2's file, while slice 2 awaited its
    refactor pass.
  - Observed effect: slice 1's delivery stopped until the coordinator edited
    slice 2's uncommitted code; one extra formatter run.
  - Inference: Qualified; small cost here. Like DD-106, file-disjoint changes
    did not make shared tooling disjoint. Concurrent slices 1 and 2 still
    saved wall time.

## DD-124 — A publisher-seam premise was observed by reading the seam, not the race it had to stop

Plan 112 recorded "`beforePush` runs after every reconciliation, before each
push" as a held decisive premise from a code read. Slice 2 found a competing
Take conflicts in the backlog merge driver before any pre-push hook runs, so
the guard needed a new post-fetch seam. Same class as catalog ODF-110; its
journey rule (`2c5ff71`) was already installed when the plan was re-bound.

### Occurrences
- Execution: `SEED-028#one-shot-work` / plan 112, first related implementation commit `d0101737`
  - Timestamp: unknown; between re-bind `e8ce93b9` (2026-09-27T15:50:01+08:00) and slice 2 commit `6f350f28` (2026-09-27T16:40:20+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `707f3ac` (v0.3.42)
  - Evidence: plan 112 premise table at `e8ce93b9` cites `execution-increment-publication.mjs:143-197`; slice 2 first return reported the merge-driver conflict; corrected premise row and North Star wording in `6f350f28`
  - Observed effect: one extra implementation round in slice 2 (an added pre-reconciliation fetch, then consolidation into `onFetchedTarget`) and a North Star correction
  - Inference: Qualified. A race premise is cheap to observe with the existing racing-push fixtures; reading the hook's call sites observed the seam, not the Take-then-replay journey

## DD-126 — A slice-acceptance obligation recorded as a plan learning never reached the next delegation

After slice 1 the coordinator recorded that slice 3's guidance walk must
confirm bug-fixing and test-optimization repair and no-change steps for a
one-shot mission; the slice 3 delegation prompt omitted it, and the refactor
and acceptance passes did not check it.

### Occurrences
- Execution: `SEED-028#one-shot-work` / plan 112, first related implementation commit `d0101737`
  - Timestamp: unknown; slice 3 delegated after `6f350f28` (2026-09-27T16:40:20+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `707f3ac` (v0.3.42)
  - Evidence: plan 112 Learnings at `d0101737`; `dough-bug-fixing/SKILL.md:98` still forces `--no-replan` and its closure steps still route through wrap-up at `70f6cde1`
  - Observed effect: the retrospective found contradictory closure guidance and planned a correction
  - Inference: Qualified. Learnings are free text; nothing ties an acceptance obligation to the slice that must satisfy it

## DD-127 — A "no other location" premise was swept with the removed rule's words, missing the concept's other wording

Plan 131 recorded that concurrent-writer wording existed only in delegation,
delivery staging and one test, from a sweep for concurrent, parallel, wave,
disjoint and sibling-slice. The CI pause contract said "Preserve other agents'
work in this execution checkout" and matched none of those words; the
implementer and refactor sweeps reused the same words and also missed it.

### Occurrences
- Execution: `SEED-008#isolate-parallel-slice-delivery` / plan 131, first related implementation commit `1d3a26cd`
  - Timestamp: 2026-09-27T18:03:28+08:00 (premise recorded in plan commit `9f8b82b0`)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `707f3ac7` (v0.3.42)
  - Evidence: plan 131 premise row "Concurrent-writer wording exists beyond the permission"; `src/skills/dough-execute-plan/references/ci-monitor.md:249` at `1d3a26cd`; the retrospective's search for `writers|other agents` found it
  - Observed effect: the leftover shipped in the slice commit and needed correction story `SEED-008#restate-ci-pause-ownership` and plan 132 instead of a one-line edit in slice 1
  - Inference: Qualified. The search terms described the removed permission, not the concept it relied on (who else writes in the checkout); searching for that concept's actors ("agents", "writers") would have found it
- Execution: `SEED-008#finish-removing-checkout-coordination` / plan 145, first related implementation commit `3239c49a`
  - Timestamp: unknown; slice 2's refactor pass ran before its commit `da2178fd` (2026-09-29T07:38:10+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: modified; revision `b37292dd`; base 0.3.46
  - Evidence: plan 145 slice 2 proof and premise rows swept `src` for `declared-owner|declaredOwner|another-writer|unclear-ownership|--requester`. The refactor pass found "another writer's ownership, or ambiguous ownership" (refresh results list) and "Report the competing writer" in `maintain-default-checkout.md`, plus "unclear ownership" at `docs/project-visibility-requirements.md:365`.
  - Observed effect: all three leftovers were removed before commit `da2178fd`; the plan's empty-grep proof would have passed with them in place
  - Inference: Qualified. Second occurrence: the identifier sweep matched the removed names, not the concept's prose; this time the refactor pass caught it, not a correction story

## DD-128 — Execute-plan's required reference reads cost more than a clean one-slice run used

Before its first delegation, the coordinator of a single prose-only slice read
the references execute-plan requires at startup (delegation, execution
decisions, wrap-up, CI observation, trunk publication, execution location, agent
commits, runtime setup; about 90KB, two outputs over the display limit). Managed
delivery then established the observer itself, no CI event or repair occurred,
and wrap-up closure, Story Branch integration, the repair stash protocol, and
observer launch recipes went unused.

### Occurrences
- Execution: `SEED-004#proudly-found-elsewhere-design` / plan 133, first related implementation commit `29d0c909`
  - Timestamp: unknown (after Take `848db9fd` committed 2026-09-27T18:56:02+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `707f3ac7` (v0.3.42)
  - Evidence: coordinator conversation: persisted reads of `delegation.md` + `execution-decisions.md` + `agent-commits.md` + `runtime-setup.md` (31.6KB) and `wrap-up.md` + `ci-monitor.md` (29.9KB), plus `execution-location.md`, `trunk-publication.md`, `finish-or-stop.md`, `ci-completion-wait.md`
  - Observed effect: no rework or error; context spent on paths not taken
  - Inference: Qualified. The skill ties reads to boundaries ("before arming observation", "before a claim"), but managed delivery and the start command now own those mechanics, so a boundary reached through them still triggers full reads. Cost only; this run gives no evidence of harm to quality
- Execution: `SEED-008#restate-ci-pause-ownership` / plan 132, first related implementation commit `bab3ac9b`
  - Timestamp: unknown (between Take `89dd4bfe` committed 2026-09-27T20:23:12+08:00 and `bab3ac9b` committed 2026-09-27T20:29:32+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `707f3ac7` (v0.3.42)
  - Evidence: coordinator conversation: full reads of `execution-location.md` + `trunk-publication.md`, `delegation.md` + `execution-decisions.md`, `wrap-up.md` + `ci-monitor.md` (both halves), `finish-or-stop.md`, `ci-completion-wait.md`, `agent-commits.md`, part of `publish-the-candidate.md`; the one slice replaced one sentence and added one test
  - Observed effect: same as above; the start command and managed delivery owned the claim, observer, and publication, and no CI event, repair, or stash occurred
  - Inference: Qualified. Second consecutive one-slice prose execution with the same read set, so the cost recurs rather than being a one-off
- Execution: `SEED-053#proportionate-local-verification` / plan 143, first related implementation commit `8cafa49d`
  - Timestamp: unknown (between Take `f510358e` committed 2026-09-28T16:46:40+08:00 and `8cafa49d` committed 2026-09-28T16:51:36+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `2b46e651`
  - Evidence: coordinator conversation: full reads of `execution-location.md`, `delegation.md`, `execution-decisions.md`, `wrap-up.md`, `finish-or-stop.md`, part of `trunk-publication.md` and `agent-commits.md`. The only slice added one 10-line paragraph. The coordinator skipped the required `ci-monitor.md` read before arming, and managed delivery attached the observer without it
  - Observed effect: same as above; no CI event, repair, stash, or rework occurred, and skipping `ci-monitor.md` caused no visible harm
  - Inference: Qualified. Third consecutive one-slice prose execution. The skipped read shows that "before arming observation" still names a read that managed delivery has made unnecessary on the normal path

## DD-155 — Two plans planned concurrently on different checkouts both took number 132

Story refinement of SEED-051#isolate-runner-settings in the default checkout
numbered its plan 132 after the highest visible plan, 131, while the
SEED-008#isolate-parallel-slice-delivery retrospective, in its own execution
worktree, also created correction plan 132. Both reached trunk, so the
number-only request `/dough-execute-plan 132` named two plans. Same mechanism
as catalog ODF-106 (colliding plan numbers), now in this repository.

### Occurrences
- Execution: `SEED-051#isolate-runner-settings` / plan 132, first related implementation commit `6b2ca78f`
  - Timestamp: 2026-09-27T18:36:56+08:00 (plan commit `77a8ca0f`; the sibling `132-restate-ci-pause-ownership` was committed at 18:32:11+08:00 in `9060ff71` on the execution branch and reached trunk via merge `54b5f025`)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `707f3ac7` (v0.3.42)
  - Evidence: `.planning/slice-plans/132-isolate-runner-settings/` and `.planning/slice-plans/132-restate-ci-pause-ownership/` on trunk at `54b5f025`
  - Observed effect: the executor had to infer the intended plan (the one at the default checkout's HEAD when the session started) and could have Taken the other queued story
  - Inference: Qualified. Allocation from checkout-visible numbers cannot see another checkout's unpublished plan; the collision went unnoticed at merge because directory names differ

## DD-159 — Keyboard proof failures were blamed on stale dist despite per-run rebuilds

An implementation agent blamed Playwright on a stale `dashboard/dist` and recorded a plan learning to rebuild before browser tests, although `test:dashboard`'s `globalSetup` already rebuilds each run. Decisive causes were focus remount and `openDirection` stealing focus between keypresses.

### Occurrences
- Execution: `SEED-053#cycle-dashboard-projects-with-arrow-keys` / plan 138, first related implementation commit `796bebaf6c43928105f58feea358f163116f89bd`
  - Timestamp: unknown (between 2026-09-28T12:47+08:00 impl start and ~12:56+08:00 slice report)
  - Tool: Cursor
  - Open Dough release: 0.3.45
  - Evidence: impl subagent `ffa400d5-2c0e-4f83-aec0-7b2a740b4031` narrated a rebuild after the focus-remount fix, later diagnosed `openDirection` between keypresses; plan 138 Learnings contradict `dashboard/tests/README.md` and `dashboard/tests/support/globalSetup.ts`
  - Observed effect: extra rebuild/debug cycles; a false rebuild learning remained in plan 138
  - Inference: Qualified. Focus/test-structure failure misread as harness staleness; not a suite build-contract defect

## DD-163 — A local flake already fixed on trunk was left off the story branch, which then failed CI on it

Slice 3 saw `project-keyboard-navigation-focus` fail locally, found trunk's fix `25c4a514`, and deferred it to Story Branch integration; branch CI failed on it.

### Occurrences
- Execution: `SEED-052#launch-claude-planned-execution` / plan 144, first related implementation commit `31cd0530`
  - Timestamp: 2026-09-28T17:53:08+08:00 (deferral delivered in `bd893320`)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: modified; revision `b8c27fb7`; base 0.3.45
  - Evidence: CI run 36406315898 failed at `project-keyboard-navigation-focus.spec.ts:100`; repair `dc402362` ported `25c4a514`
  - Observed effect: one CI failure and a stash, repair, publish, and restore cycle
  - Inference: Qualified. Guidance (ODF-134) defers trunk integration to wrap-up but names no path to take a published trunk fix for a failure the branch's CI will also hit

## DD-165 — Cursor ran story wrap-up after execution although guidance says to leave it

Execute-plan's finish guidance retains the plan and worktree for story wrap-up
and says not to invoke it; Cursor proceeded into wrap-up anyway.

### Occurrences

- Execution: `SEED-008#owned-context-start-and-truthful-refresh` / plan 142, first related implementation commit `7e86f615`
  - Timestamp: 2026-09-28T19:26:04+08:00 (native Cursor startup-owned-context)
  - Tool: Cursor
  - Open Dough release: modified; revision `c0f6dfca`; base `0.3.45`
  - Evidence: response "Proceeding with story wrap-up for SEED-A#a" after reading `finish-or-stop.md`; it deleted the fixture story, plan, and Taken entry; Claude and Codex stopped at `## PLAN EXECUTION COMPLETE`.
  - Observed effect: a 27-minute run and a missing workspace source in the assessment.

## DD-167 — Execute-plan judged readiness from a stale default checkout and sent a planned story back to refinement

Before startup fetched trunk, execute-plan read the backlog and seed from the default checkout, which lagged trunk. It reported the story unrefined and unplanned, though trunk already held its refinement and plan.

### Occurrences
- Execution: `SEED-008#durable-workspace-creation-fact` / plan 147, first related implementation commit `cb066559`
  - Timestamp: unknown; after trunk's refinement `a65dfcb7` (2026-09-29T07:18:09+08:00), before the repeat preparation's announcement `e65d81e8` (08:08:49+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `b37292dd`
  - Evidence: default checkout at `ae4b4b86` showed `"refinement":"not-refined"`; trunk had `a65dfcb7` refined and planned (plan 147). A new refinement began and re-asked two decided questions; the prior plan appeared only after `start` created the workspace at fetched trunk.
  - Observed effect: one false readiness stop and one repeated refinement round (its third answer did change native-proof scope).
  - Inference: Qualified. With parallel agents, eligibility should be judged from fetched remote trunk, as startup already does.

## DD-170 — The 250-line refactor bound pushed Markdown guidance into longer lines and brittle regex fixes

The refactor checks' physical-line bound applies to guidance Markdown. Held at 250, edits reflowed prose into long lines instead of shortening meaning, and guidance tests that match phrases across line breaks then failed on where a line happened to wrap.

### Occurrences

- Execution: `SEED-008#installed-wrap-up-command` / plan 146, first related implementation commit `aa4fd510`; Timestamp: unknown (2026-09-29, slices 3–5 and trunk merge `28fb01ae`); Tool: Claude Code; Model: claude-opus-5-5[1m]; Open Dough release: modified; revision `3ca0b8f9`; base 0.3.46.
  - Evidence: `dough-story-wrap-up/SKILL.md` lines over 120 characters went from 11 (`3962b8ce`) to 16; three coordinator attempts during the `28fb01ae` merge only moved line breaks so `ci-completion-lifecycle-guidance.test.mjs` regexes matched; slice 3's refactor split `trunk-publication.md` and `install.sh` repeatedly sat at 248–250.
  - Observed effect: several edit-and-test cycles spent on wrapping, not meaning. Inference: qualified; a character or word budget for Markdown, or phrase matching that ignores line breaks, would remove the incentive.

## DD-172 — A not-ready reason waiting on another story's landing was not revisited when it landed

Refinement recorded SEED-052#interact-with-claude-terminal not-ready because story 2 was not yet on `main` ("reassess once it lands"). Story 2 closed on trunk a minute later, but nothing revisited the dependent story's assessment; it stayed not-ready until the developer asked why.

### Occurrences

- Execution: `SEED-052#interact-with-claude-terminal` / plan 152, before its claim `c3c1ed9b`
  - Timestamp: 2026-09-29T12:15:38+08:00 (story 2 closure `f7e7e272`; the not-ready record `19c7e82b` is 12:14:42)
  - Tool: Claude Code; Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance VERSION 0.3.46, last updated by `b37292dd`
  - Evidence: `19c7e82b` story-state reason naming `origin/claude/revisit-dashboard-sessions`; `f7e7e272` closed story 2; the developer's request "see why its not ready. Make it ready if you can"; reassessment `b961dc65` (12:44:09) changed only the plan's "Builds on" note and the assessment.
  - Observed effect: about 30 minutes of a queued story reading not-ready after its only blocker cleared, and one human prompt to recover it.
  - Inference: Qualified. Neither story wrap-up nor the backlog view re-reads other stories' not-ready reasons that name the closed work; whether that should be a wrap-up step or a dashboard hint is open.
- Execution: `SEED-052#keep-story-session-links` / plan 157, claim `4df86e5b`
  - Timestamp: 2026-09-29T16:04:18+08:00 (terminal-residue closure `27a08c8c`; the not-ready record `c05d6b60` is 16:02:57)
  - Tool: Claude Code; Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance VERSION 0.3.46, last updated by `b37292dd`
  - Evidence: `execution-start.mjs` refused with `published preparation is needs-reassessment`; reassessment `6150a458` (17:00:45) changed only the premise row, the start check, and two decisions the closure of plan 156 had left open for Terry.
  - Observed effect: second occurrence the same day, again a minute after the not-ready record: about an hour not-ready, and one refused start and reassessment cycle, which did usefully surface the open decisions.

- Execution: `SEED-052#launch-claude-refinement` / plan 159, claim `7667a007`
  - Timestamp: 2026-09-29T18:13:11+08:00 (keep-story-session-links closure `45fd5df2`; reassessment `9e176b9f` 18:18:42)
  - Tool: Claude Code; Model: claude-opus-5-5[1m]; Open Dough release: unknown; installed guidance last updated by `d68fcde4`
  - Evidence: execute-plan first stopped on the not-ready reason; the developer asked to "watch until the condition … is met and then start execution"; a fetch loop saw the closure, and the coordinator announced a preparation, reconciled the plan, recorded ready, and landed it before `execution-start.mjs start`.
  - Observed effect: third occurrence the same day. Only the developer's watch request revisited the reason; execute-plan has no wait-then-reassess path, so the coordinator inferred keep authority for the reassessment from "start execution".

## DD-174 — A refactor pass removed a guard as behavior-preserving on an unverified helper premise

Slice 1's refactor pass dropped a skip for observer-registered revisions the repository lacks, reasoning that Land's `isAncestor` returns false on any failure. It re-threw every exit but 1, so a missing revision would crash `finish`. The coordinator accepted the report and wrote the same premise into the plan as a learning; no test covered a missing revision.

### Occurrences

- Execution: `SEED-008#closure-proof-and-harness-correction` / plan 154, first related implementation commit `d1204cd7`; Timestamp: unknown (refactor before `d1204cd7`, 2026-09-29T15:02:45+08:00); Tool: Claude Code; Model: claude-opus-5-5[1m]; Open Dough release: unknown; installed guidance last updated by `b37292dd`
  - Evidence: refactor report cited `retirement-checks.mjs:31` as returning false; `succeeds()` there rethrew non-1 exits; plan learning in `d1204cd7`; slice 2's implementer read the helper, restored the skip, and planted a missing registered SHA in `trunk-closure-rebased-rerun.test.mjs` (`0166f178`). Observed effect: a latent crash path published on the execution branch for one slice; caught before trunk. Inference: qualified; a refactor that deletes a guard needs a test that exercises it, as in DD-124's read-versus-observe class.

## DD-176 — A mistyped `--repo` bound managed delivery's observer to another repository, and a refused retry left a second observer

The coordinator passed `--repo nerds-odd-e/open-dough` to `execution-increment-delivery.mjs deliver`, though `origin` is `terryyin/open-dough`. Delivery accepted the push and attached an observer for the wrong repository. After stopping it, a second `deliver` refused ("rebase left the pre-rebase SHA as the candidate") but still established an observer, which the coordinator did not know about. A manual `ci-mailbox.mjs start` then made a duplicate.

### Occurrences

- Execution: `SEED-052#keep-story-session-links` / plan 157, first related implementation commit `30bdc002`
  - Timestamp: 2026-09-29T17:17:21+08:00 (delivery of `30bdc002`)
  - Tool: Claude Code; Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance VERSION 0.3.46, last updated by `b37292dd`
  - Evidence: first receipt `watch-6jw6fP` (stopped `unobserved`); refused retry printed no `CI_OBSERVER` receipt; manual start `watch-fYAmU8`; slice 2's delivery reported `reused` `watch-Hp4kOi`; coordinator re-registered `30bdc002` there and stopped `watch-fYAmU8`.
  - Observed effect: four extra coordinator steps and two observers briefly covering one branch; no CI event was lost.
  - Inference: Qualified. `deliver` could derive the repository from the pushed remote, or refuse one that does not match it, and a refused `deliver` should report any observer it established.

## DD-177 — Slice proof chosen by the changed components missed page-wide invariant specs

Slice 2 made Recent sessions entries and region focusable (`tabIndex=-1`), and slice 3 changed Recent sessions' wording. Each delegated proof listed the launch and terminal specs the coordinator named, and the implementers added none. A page-wide spec failed only in CI each time.

### Occurrences

- Execution: `SEED-052#keep-story-session-links` / plan 157, first related implementation commit `30bdc002`
  - Timestamp: 2026-09-29T17:36:06+08:00 (CI run 36550218994 on `08f217af`)
  - Tool: Claude Code; Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance VERSION 0.3.46, last updated by `b37292dd`
  - Evidence: slice 2 delegation's spec list; the failure at `accessible-overview-keyboard.spec.ts:72` (expected 5, received 6); repair `76e6dce3`. Slice 1's list had included that spec.
  - Evidence (recurrence in the same execution): slice 3's retention sentence put "done" in Recent sessions' always-shown intro; `published-work.spec.ts:151` forbids completion words anywhere on a page without sessions and failed only in CI run 36551022132 on `32e554d5`; the full dashboard suite (286 tests, 46 s) then passed locally with the repair.
  - Observed effect: two failed CI runs, two repair commits, and two extra refactor agents.
  - Inference: Qualified. Selecting proof by the names of changed components misses specs that assert a whole-page property. The whole dashboard suite takes under a minute locally, so running it before delivering a page change costs less than one CI repair.

## DD-180 — A host probe planned for the agent to answer needed the developer, because the host refused self-driving the attach

Plan 159 slice 1 said to attach with the existing CLI and answer a real background session's question. The auto-mode classifier refused the coordinator driving `claude attach` through a PTY ("Tmux Self Drive"), so the developer had to attach and answer.

### Occurrences

- Execution: `SEED-052#launch-claude-refinement` / plan 159, first related commit `eb89e7d2`
  - Timestamp: 2026-09-29T18:20:40+08:00 (refusal; the developer answered at 18:34:49)
  - Tool: Claude Code; Model: claude-opus-5-5[1m]; Open Dough release: unknown; installed guidance last updated by `d68fcde4`
  - Evidence: plan 159 slice 1 as refined in `261910e8`; its recorded observation in `eb89e7d2` names the refusal and the human answer.
  - Observed effect: about 14 minutes with the execution waiting on the developer; the probe itself succeeded. Inference: Qualified. Planning a probe that needs input typed into another interactive session should name the developer step, as DD-173's inverse case (ProjectFindings.md) shows planning should check which actor can run it.

## DD-181 — Proof acceptance checked what tests observe, not the plan's direction on how often to observe it

Plan 159 slice 2 said to test the session presentation once as a shared capability, not every state in both placements. The implementer asserted every state on both the card entry and the Recent sessions entry in `agent-launch-recent-session-states.spec.ts`; coordinator acceptance and the refactor pass inspected only that the assertions observed the promises.

### Occurrences

- Execution: `SEED-052#launch-claude-refinement` / plan 159, first related implementation commit `aaf78a9c`
  - Timestamp: unknown; accepted before `aaf78a9c` (2026-09-29T18:48:00+08:00)
  - Tool: Claude Code; Model: claude-opus-5-5[1m]; Open Dough release: unknown; installed guidance last updated by `d68fcde4`
  - Evidence: plan 159 slice 2 proof text; `agent-launch-recent-session-states.spec.ts` `both(index)` loop at `4ef13e85`; the execution retrospective found it.
  - Observed effect: extra per-state card assertions beside `agent-launch-card-session-states.spec.ts`, which already rechecks card labels (plan 160's finding 6); cleanup falls to a correction. Inference: Qualified. Accept-proof guidance weighs observation substance; a plan's test-cost direction has no acceptance check.

## DD-182 — A lost-observer notice kept blocking every turn end, even after the observer was stopped

The Claude stop hook reported "CI observer lost its worker" for a dead observer as a blocking error at each turn end. The guidance says to report lost coverage once and continue. A `stop` that recorded the terminal lost result did not end the notice. It is the reverse of former ODF-065, where a dead observer still read as attached. It matches catalog ODF-144 (lost-worker notice repeatedly blocks turn completion), which so far had only another project's occurrence.

### Occurrences

- Execution: `SEED-055#ci-time-budget-from-ci-timings` / plan 162, first related implementation commit `061aa911`
  - Timestamp: unknown; the loop spanned the shell's 2026-09-29T21:58:40+08:00 and 22:00:36+08:00 readings
  - Tool: Claude Code; Model: claude-opus-5-5[1m]; Open Dough release: unknown; installed guidance last updated by `d68fcde4`
  - Evidence: mailbox `/tmp/dough-ci-501/watch-nN6cSt`, whose worker died when the disk filled (ENOSPC) during slice 2. Its only revision, `061aa911`, passed CI when checked with `gh run list`. The `stop` result was `status: stopped`, `coverage.state: lost`, `unread: 0`, and the stop hook kept blocking after it.
  - Observed effect: about twelve coordinator turns spent acknowledging the same notice while a refactor agent ran. It persisted after the next delivery attached observer `watch-Ss12RC`. Cause (read in `ci-host-hook.mjs`): every hook call re-reports each bound mailbox whose worker is lost, with no delivered-once marker. Removing only this mailbox's binding under the coordinator's `owner-*` directory ended the loop.

## Retention

- Highest allocated local number: 182. Removed local codes are never reused.
- Removed on 2026-09-29 for the 1,000-line ceiling, as lower current actionability than DD-182: ODF-065 (former DD-063; a dead observer still reported as attached), since the host hook now reports a dead worker as lost at the next interaction; recovery: `1dfb75ee:DearDough.md`.
- Removed on 2026-09-29 for the 1,000-line ceiling, as lower priority than DD-180, DD-181, and DD-172's third occurrence: ODF-003's two oldest occurrences (`SEED-008#script-driven-ci-observation`, `SEED-037#diagnosable-test-hangs`); two later occurrences keep the finding; recovery: `4ef13e85:DearDough.md`.
- Removed on 2026-09-29 for the 1,000-line ceiling, as lower current actionability than DD-176, DD-177, and the DD-172 and ODF-097 recurrences: ODF-130 (concurrent slices sharing Playwright output) and ODF-129 (full-suite proof beside another agent's edits), since slices now run one at a time; recovery: `32e554d5:DearDough.md`.
- Removed ODF-070 (former DD-066; nested worktree `node_modules` assumed absent) on 2026-09-29 for the 1,000-line ceiling: its 0.3.26-era occurrence as lower priority than ODF-116's recurrence (recovery: `6fa51cb6:DearDough.md`), then its remaining occurrence as lower current actionability than DD-172/DD-173 and the ODF-100 recurrence, since execution-location guidance now requires a locked install per worktree (recovery: `0c31529b:DearDough.md`).
- Removed on 2026-09-29 for the 1,000-line ceiling, as lower priority than DD-174 and ODF-097's third occurrence: ODF-059's 0.3.25-era occurrence (`SEED-008#script-product-backlog-list-updates`); two later occurrences keep the finding; recovery: `14cd2de3:DearDough.md`.
- Moved to ProjectFindings.md on 2026-09-29 as this repository's native-harness or paid-run practice: DD-173, DD-175, and ODF-096's plan 142 and 146 occurrences (harness observation faults, now DD-179); recovery: `d68fcde4:DearDough.md`. DD-155 and DD-159, moved there earlier only for the line ceiling, returned here the same day because their causes are published planning or general diagnosis practice (recovery: `41965529:DearDough.md`).
- Removed on 2026-09-28 for the 1,000-line ceiling, as lower priority than the plan 142 findings: DD-125 (newer Git feature) and DD-157 (README at the size ceiling); recovery: `6e3921d6:DearDough.md`.
- Full pre-maintenance log and earlier recovery locators: `2d2c4cda79104a7dbdb45c64e004a0eeb9327d65:DearDough.md`; DD-128's SEED-004#preserve-rules-from-story-sections occurrence: `e89015a7c192e3028fc4f9911235eb2fe94d2d0e:DearDough.md`; removed DD-156 (and this file before DD-157 / ODF-154 row): `777b797926acfab373a6cd45766e3066cbd9da95:DearDough.md`.
- Resolved and removed on 2026-09-28: ODF-119 (startup source veto and nested-worktree refresh deferral); recovery: `aa771c5d:DearDough.md`.
- Removed on 2026-09-29 for the 1,000-line ceiling, as lower priority than ODF-116's closure-rewrite occurrence: ODF-074's `SEED-008#creation-record-test-residue` occurrence (no rework; one older occurrence keeps the finding); recovery: `a48b2436:DearDough.md`.
- Occurrence history is partial; active evidence stays here or in the Open Dough catalog and watch list.
