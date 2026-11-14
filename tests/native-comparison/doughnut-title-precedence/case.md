# Doughnut title precedence: calibrate a caught fault

A real project's maintained backend proof against one plausible fault. The
agent checks Doughnut story SEED-122's promise that a readable, unique note
title wins over colliding aliases in authored wiki links, for the fault that
`WikiLinkNoteCandidates.titleOrAlias` combines title and alias matches. It must
establish a passing baseline, apply the fault, see which maintained assertion
fails, observe the wrong destination independently, restore the source and
show the restored proof passing. At this revision the maintained six-form
assertion catches the fault on the destination ID; the agent is not told so.

## Selection

- workflow: targeted proof calibration (dough-intent-coverage) on a real project's maintained backend proof
- hosts: codex (qualified natively); claude, cursor: not qualified
- prerequisites: Bash 5, Git, jq, Node 24, Nix, network access to the
  source repository and Gradle/pnpm registries, MySQL on `127.0.0.1:3309`
  with passwordless local root and the `doughnut` test user (Doughnut's
  `docs/worktree-backend-tests.md`), about 4 GB of disk per arm outside
  macOS's per-user temporary directory (set `TMPDIR` elsewhere: Nix ignores
  a `TMPDIR` there and falls back to `/tmp`, which the agent's sandbox
  cannot write); a logged-in Codex CLI for `--native codex`. An existing `~/.gradle`
  (`NATIVE_COMPARISON_GRADLE_SEED`) seeds each arm's Gradle caches by
  copy-on-write; without one Gradle downloads them
- decisions and proof: passing baseline that runs the maintained assertion;
  the title/alias union fault at the real resolver; the maintained
  destination-ID assertion failing; an untracked witness showing the wrong
  destination under the fault; byte-identical restoration; a restored passing
  run as broad as the baseline; verdict Caught
- duration: see [Measured durations](#measured-durations)

## Source and extraction

- Source replay: the [same-story waiting comparison](../../../docs/maintainer/intent-coverage-cost-research.md#same-story-waiting-comparison),
  2026-11-12. Its compared arms are Codex coordinator threads
  `01a1cdf7-3db1-7aa2-92b0-604b8c19594f` (repeated waits) and
  `01a1ce00-0c0c-7d92-9ad9-26a89ebaa663` (one wait), with workers
  `01a1cdf7-e04a-7483-9865-de945b7a56de` and
  `01a1ce00-c50e-7500-a317-ae121565fa02`; the excluded setup attempt is
  `01a1cdf2-308d-77f2-b627-861adbf38471`, whose sandbox denied the
  project's Nix profile before the baseline. These are provenance locators
  in the author's local history, never runtime inputs.
- Original proof: the Intent Coverage check of SEED-122 on 2026-11-11 whose
  report both arms reproduced (Verdict Caught). Its driver ran
  `./scripts/run.sh bash scripts/worktree_setup.sh`, then
  `./scripts/run.sh pnpm backend:test_only` for the baseline, with the fault
  and witness, and after restoring, in a linked worktree with its own Gradle
  caches and database, which it retired afterwards. Its temporary evidence
  was the author's; this case retains what runs need.
- Source project revision: Doughnut `e257b144d1e9120528922da0f5dc045acb6c9d6d`
  ("Prefer readable note titles over aliases in wiki links") on
  `https://github.com/nerds-odd-e/doughnut.git`, with resolver
  `backend/src/main/java/com/odde/donut/services/WikiLinkNoteCandidates.java`
  (blob `45b9057b56afd025eb479dd1329d13fa7cf0a17e`, SHA-256
  `d01e1ea4f771051928fd1169c5c3d2545b4d25847a5cf816bc02ea07a618f72b`) and
  maintained assertion
  `NoteControllerShowWikiLinkTitlePrecedenceTests.selectsTitleBeforeAliasesAcrossAuthoredLinkForms`.
- Extraction recipe: keep the revision whole, fetched by SHA, with its own
  setup and proof entry, so the real resolver/controller seam and the
  maintained assertion are what the agent runs. Retain the original fault
  (`reference-fault.diff`) and witness (`reference-witness.java`) verbatim
  from the original evidence, for qualification only; the agent receives
  neither. Drop the replay's prevalidated proof driver, its coordinator
  wait policy and every statement of the expected result: the agent chooses
  its proof and witness and runs them itself.
- Not retained: the replay's coordinator and worker split, its waiting and
  the author's checkout, caches and database names.

## Starting state, task and setup

`case.bash` fetches the revision into `doughnut.git` and adds the arm's
`workspace` as a detached linked worktree, which Doughnut gives its own
backend database on first test use. Under the arm's root it creates the
Gradle home (seeded caches plus `record-tests.gradle` in `init.d`), pnpm
store, caches and temporary directory and exports them, with Java's
temporary directory and zsh's here-document prefix, because the agent's
write sandbox admits only the arm
(and, in `tests/support/native-codex.sh`, the JVM attach handshake files
that Mockito's self-attach writes to the per-user temporary directory).
It installs the selected Open Dough payload with `--force` over the
project's own copy, then runs `./scripts/run.sh bash
scripts/worktree_setup.sh`, which builds the worktree's Nix profile and
installs dependencies. `task.txt` names the skill, story, promise and fault;
there are no events. `case_cleanup` retires the arm's database through
`./scripts/run.sh pnpm worktree:retire` when the agent left its worktree
identity (`cleanup: no-worktree-identity` otherwise); the runner's caller
removes the arm. The observer keeps the recorded test runs with the attempt.

## Assessment

`record-tests.gradle` records every test task the agent runs: the tracked
changes and untracked files as tests start, each result with its first
message line, and the output of untracked test classes. `case.bash` reads
those records, never the agent's account of them, plus the final checkout
and the verdict its report names. `assess.bash` requires, as separate
signals: a passing baseline that ran the assertion before the fault; the
assertion failing on `every item is` (the destination ID) in a run where only
the resolver changed; an untracked test in such a run whose output or
message shows an ambiguous or missing destination; the last pinned run after
the fault passing without untracked tests and covering at least as many
tests as the baseline; the resolver blob and checkout status restored; and
verdict Caught. Its rejected cases are in
`tests/native-comparison-doughnut-title-precedence.sh`. A witness that is not
a recorded test, or prints nothing about the destination, is not observed.

## Measured durations

No duration threshold has been agreed. Historical, from other observations:
the original check's full-suite commands took 315.8 s (baseline), 162.7 s
(faulted) and 218.8 s (restored); the replay's single-wait coordinator
received its worker's final report after 6 min 55 s.

Reference qualification, 2026-11-14, on a 16-core Mac on AC power at load
about 5–9: the case materialized the arm, then the retained fault and
witness ran inside the agent's write sandbox with
`./scripts/run.sh pnpm backend:test_only` for baseline (exit 0, 3,111
tests), faulted (exit 1: the six original failures, the destination-ID
assertion `Expected: every item is <490> but: an item was null`, and the
witness printing all six forms `resolution=AMBIGUOUS destination=null`) and
restored (exit 0, 3,111 tests), with the resolver's SHA-256 and Git status
unchanged. The observer and assessor passed it; the project's retirement
dropped the arm's database.

| Step | Seconds |
| --- | ---: |
| Preparation (fetch, worktree, seeded caches, payload, setup) | 57.0 |
| Baseline, faulted and restored commands | 139, 121, 100 |
| Whole reference journey, with observation and cleanup | 421.7 |

Native qualification, same day, one fresh Codex 0.169.0 `codex exec`
session (`gpt-6.1-sol`, effort `xhigh`, sandbox `danger-full-access`,
approval `never`), candidate payload from Open Dough `03634c3e4` plus this
uncommitted case. The agent ran the full backend suite through
`CURSOR_DEV=true nix develop -c pnpm backend:test_only` for baseline
(3,111 passed), faulted (six maintained failures, its own controller
witness showing ambiguous, null destinations for all six forms) and
restored (3,111 passed); restored source and status; dropped the
database and identity it had provisioned; and reported Caught (24
commands).

| Step | Seconds |
| --- | ---: |
| Preparation | 66.5 |
| Turn 1 | 764.9 |
| Whole journey | 833.3 |

Its live verdict failed only on harness inspection: the arm then lived in a
directory named after this harness, so every command naming the workspace
matched. With that path neutralized the field is false and the reassessment
passes; arms now get a neutral name. An earlier session, with the arm
under macOS's per-user temporary directory, could not start Nix and
reported Insufficient evidence after 294.8 s; the assessor failed it. The
zsh here-document prefix and the retained test-run records were added after
these runs. One journey is not a repeatable-cost estimate.
