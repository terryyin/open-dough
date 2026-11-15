# Report a publication made during judgment

**Identity:** SEED-368#report-a-publication-made-during-supplier-judgment
**Source:** [story](../../seeds/SEED-368-third-blocked-execution-attempt.md#report-a-publication-made-during-supplier-judgment)
**Source review:** [source-only review](source-review.md)

## Source and provenance

Retrospective correction of
SEED-368#reduce-model-work-during-prolonged-supplier-waiting, whose story and
plan are recoverable at
`4381215e106efd9513652b478bdf302f2424433c:.planning/seeds/SEED-368-third-blocked-execution-attempt.md`
and
`4381215e106efd9513652b478bdf302f2424433c:.planning/slice-plans/635-wait-silently-for-a-paused-supplier/PLAN.md`,
delivered on the story branch as
`c97db6b3d` (wait command), `0dca3a999` (watch guidance and `REF[:PATH]`) and
`4734da29f` (findings). That story's promises stand: one silent wait, a
publication ends it once, a nonqualifying publication keeps the hold and "the
watch continues to the same deadline", a qualifying publication "continues
the execution once".

## Current finding

- [`wait-for-publication.mjs`](../../../Distribution/src/skills/dough-execute-plan/scripts/wait-for-publication.mjs)
  compares each run against its own first observation.
- [Watch a paused supplier](../../../Distribution/src/skills/dough-execute-plan/references/wait-for-proof.md#watch-a-paused-supplier)
  tells the coordinator, when the hold stays, to "start the command again"
  after judging.
- A publication made after the coordinator read the supplier for its judgment
  and before the rerun's first observation is therefore in the rerun's
  baseline and never reported. The judgment is at least one model turn. A
  supplier that pushes a slice and then its completion within that time leaves
  the watch silent to its deadline, where the execution stops although the
  supplier qualified. Plan 635 recorded this as obligation G3 and closed it on
  a window estimated in seconds.

## Goal and scope

A continued watch reports every publication the judgment did not read.

Included: which observation a continued wait compares against, and the tests
of the wait command.

Exclusions: the command's flags, result lines and exit codes; the deadline and
its stop; the order of judgment and rerun in the watch guidance; host rules;
any paid or native run.

## Direction

A wait that ends with `publication` retains what it last observed, inside the
checkout's Git directory, together with the wait it belongs to: its remote,
its watched items in order, and its deadline. A rerun naming the same remote,
items and `--deadline` is that wait continued: it compares against the
retained observation and observes at once instead of after one interval. Any
other run, and a continued run whose retained observation is missing or
unreadable, takes a fresh first observation as today.

Every publication after the previous result is then reported by the rerun,
whenever the judgment ran. One the judgment already read is reported once
more, which costs one extra judgment. The coordinator carries nothing new:
the guidance already has it rerun with "the same refs and `--deadline` set to
the returned deadline", so the guidance and the findings' check keep their
text.

Set aside:

- **Start the rerun before judging.** The judgment fetches in the checkout
  the wait fetches in, and the wait reads `FETCH_HEAD` after each fetch
  (premise 2): false publications and failed starts. It would also need the
  coordinator to stop a running wait when the hold lifts, and still leaves a
  publication made during the rerun's own first observation unreported.
- **A baseline flag.** It adds a contract for the model to carry between
  calls.

## Decisive premises

Observed 2026-11-15 in this preparation's workspace at `de9dff847`, each with
the delivered command run as the guidance runs it (`node
wait-for-publication.mjs --remote origin --ref … --deadline|--duration-minutes
…` from a clone of a local bare remote), scratch edits reverted.

| # | Premise and consuming operation | Observation | Result |
| --- | --- | --- | --- |
| 1 | The finding: a rerun does not report a publication made after the previous result (slice 2's symptom) | Wait on `main:home.md`; push; `publication` result; push again; rerun with the same refs and the returned `--deadline` | Rerun printed only `{"result":"deadline",…}`: symptom reproduced |
| 2 | A wait and another fetch in the same checkout disturb each other (rules out rerun-before-judging) | 25 waits on two paths of `main` and a `supplier` branch, nothing published, while a loop ran `git fetch origin supplier` and `git fetch origin main` in that checkout | 18 printed a false `publication`, 7 exited 1 with `Command failed: git rev-parse --verify --quiet FETCH_HEAD` |
| 3 | A continued wait comparing against the retained observation reports that publication, stays silent when nothing followed, and leaves a fresh wait alone (slice 2's approach) | Scratch edit of `waitForPublication` retaining the last observation in a `git rev-parse --git-path` file keyed by remote, items and deadline; premise 1's sequence, then a second rerun, then a fresh `--duration-minutes` wait | Rerun printed `publication` naming the second push at once; second rerun and fresh wait printed only `deadline` |
| 4 | The delivered command tests still hold with that change (slice 2's sizing) | `node --test Distribution/tests/skills/dough-execute-plan/wait-for-publication.test.mjs` on the scratch edit | 10 pass, 0 fail |
| 5 | An unlisted `--git-path` name resolves per worktree, beside `FETCH_HEAD` (slice 2's retained file) | `git rev-parse --git-path publication-wait.json` and `--git-path FETCH_HEAD` in this linked worktree | Both under `.git/worktrees/<name>/` |
| 6 | The command's test file has no room for more tests (slice 1) | `wc -l Distribution/tests/skills/dough-execute-plan/wait-for-publication.test.mjs` | 250 lines, the file limit |

## Preserved promises and constraints

- Flags, result lines and exit codes are unchanged; a first observation that
  cannot read the remote still ends a fresh wait at once with its error.
- Plan 635's G1 disposition stands: the coordinator runs nothing in the
  checkout while it awaits a wait, and the rerun still starts after the
  judgment.
- A rerun that names different items than the wait before it, such as a
  supplier branch that appeared since, is a fresh wait with today's behavior.
- No watch request and a supplier that qualifies at entry start no wait.

## Outside-in proof ownership

| Example | Owner |
| --- | --- |
| Nonqualifying publication, then another during the judgment → the rerun ends on it at once, naming that change from the object the previous result reported | Slice 2 command test |
| Nonqualifying publication, nothing further → the rerun prints nothing until one `deadline` result at the same deadline | Slice 2 command test |
| A publication result, then a wait with a new duration on the same refs after a further push → silent to its own deadline | Slice 2 command test |
| Plan 635's command examples (silent while unchanged, one result on a watched change, deadline, unreadable remote) | The existing command tests, kept passing through slices 1 and 2 |

## Ordered slices

### 1. The wait command's test harness is shared by more than one test file
Type: Structure
Status: done
Proof: `bash scripts/test.sh Distribution/tests/skills/dough-execute-plan/wait-for-publication.test.mjs` passes with the same ten tests; the test file is shorter than 250 lines.
Accepted: helpers moved unchanged into `Distribution/tests/support/wait-for-publication-fixture.mjs`; the test file is 171 lines; the focused command exits 0 and `node --test` on the file passes 10 of 10; refactor pass made no edits.

Move the watched-remote fixture, `publish`, `startWait`, `observed` and
`onlyResult` from `wait-for-publication.test.mjs` into one support module
under `Distribution/tests/support/`, imported by that file. This enables
slice 2, whose continued-wait tests need those helpers and their own file
because the existing one is at the limit (premise 6).

### 2. A continued wait reports what was published since the previous result
Type: Behavior
Status: done
Proof: the three slice 2 examples above as tests in a new continued-wait test file beside the existing one, each failing on the delivered command for the first example's reason (premise 1) or passing unchanged for the two that guard existing behavior; `bash scripts/test.sh` naming both wait test files.

Behavior: a wait ended with a `publication` result and the supplier publishes
again → the coordinator starts the command with the same remote, refs and the
returned `--deadline` → it prints one `publication` result naming the later
change without waiting an interval. With nothing published since, it prints
nothing until one `deadline` result at that deadline. A wait naming another
deadline or other items takes a fresh first observation.

Change `waitForPublication` in `wait-for-publication.mjs` as Direction
describes and update the file's header comment. Move the existing "a rerun
given the returned deadline" test into the new file, rerunning with the first
wait's refs.

Accepted: the burst example failed first on the delivered command (the rerun
printed only `deadline`) and now ends at once under a 3600-second interval; the
moved rerun test became the "nothing published since" example; both wait test
files pass 12 of 12 through the focused command, and
`bash scripts/test.sh Distribution/tests/installation/payload-declaration-links.sh`
passes for the installer payload that lists the script. A rerun naming other
items is a fresh wait because the retained key includes the watched items in
order (inspected in `waitKey`); no test names it.

## Current decisions, verification and concern review

- No paid or native run, as Terry decided for the reviewed story on
  2026-11-15.
- Tests follow [`dough-makeme`](../../../.agents/skills/dough-makeme/SKILL.md)
  and the [test data architecture](../../../Distribution/tests/README.md#test-data-architecture);
  the default test timeout stays.
- Briefs name the authored-file lint rules that refused plan 635's first
  delivery: `preserve-caught-error` and `no-return-assign`.
- Local gate: each slice's focused proof; hosted CI runs the full suite after
  publication. Long local gates follow the maintained
  [macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- [Failing and flaky test policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  applies as written, in every delegation brief and repair handoff.
- Slice-plan refinement was not needed: two slices, one Structure enabling
  the one Behavior, each with its own proof.
- Remaining slice-specific concerns: none identified in this review.

## Execution complete

Product advice: no change. The benefit stays predicted until the next real
supplier watch is judged under the experiment findings. A rerun that names a
supplier branch which appeared since the previous wait remains a fresh wait,
as this plan preserved; revisit it only if a real watch misses a publication
that way.
