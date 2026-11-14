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
  source repository and Gradle/pnpm registries, about 4.5 GB of disk per arm
  outside macOS's per-user temporary directory (set `TMPDIR` elsewhere: Nix
  ignores a `TMPDIR` there and falls back to `/tmp`, which the agent's
  sandbox cannot write); a logged-in Codex CLI for `--native codex`. Each arm
  runs its own MySQL server from the project's Nix profile; a developer's
  MySQL or Redis on the project's ports is neither needed nor reachable from
  the agent's sandbox. An existing `~/.gradle`
  (`NATIVE_COMPARISON_GRADLE_SEED`) seeds each arm's Gradle caches by
  copy-on-write; without one Gradle downloads them
- decisions and proof: passing baseline that runs the maintained assertion;
  the title/alias union fault at the real resolver; the maintained
  destination-ID assertion failing; an untracked witness showing the wrong
  destination under the fault; byte-identical restoration; a restored passing
  run as broad as the baseline; verdict Caught
- duration: Codex qualified 2026-11-14, one turn of 12.7 min after 66.5 s
  preparation; arm preparation with its own database server 95.9 s
  ([Measured durations](#measured-durations))

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

`case.bash` fetches the revision into the arm's `workspace`, a fresh
primary checkout at a detached HEAD. Under the arm's root it creates the
Gradle home (seeded caches, `record-tests.gradle` and `arm-database.gradle`
in `init.d`, single-use build processes), pnpm store, caches and temporary
directory and exports them, with Java's temporary directory and zsh's
here-document prefix, because the agent's write sandbox admits only the arm
(and, in `Distribution/tests/support/native-codex.sh`, the JVM attach handshake files
that Mockito's self-attach writes to the per-user temporary directory).
It installs the selected Open Dough payload with `--force` over the
project's own copy, then runs `./scripts/run.sh bash
scripts/worktree_setup.sh`, which builds the checkout's Nix profile and
installs dependencies.

The arm owns its database server. The project fixes MySQL at
`127.0.0.1:3309` for linked worktrees, where a developer's live server
listens, but an unconfigured primary checkout keeps a caller-supplied
datasource URL (Doughnut's `docs/worktree-backend-tests.md`). So the case
starts a MySQL server under the arm's root on free ports through the
project's own `scripts/mysql_nix_shared.sh` in its Nix profile, creates the
project's users and databases from `scripts/sql/init_doughnut_db.sql`,
exports `SPRING_DATASOURCE_URL` for that server and migrates its
`doughnut_test`. `arm-database.gradle` gives every test and Java task the
same URL even when a command unsets it, and makes each test task run rather
than come from the build cache, as the project's isolated-checkout route does
with `--rerun --no-build-cache`. The agent's sandbox may not connect to ports
3309 or 6380 (`native_codex_denied_ports`), so no command can reach a live
MySQL or Redis. The proof entry and product are unchanged.

`task.txt` names the skill, story, promise and fault; there are no events.
`case_cleanup` stops the arm's server (`cleanup: database-server-stopped`);
the runner's caller removes the arm. The observer keeps the recorded test
runs with the attempt.

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
`Distribution/tests/native-comparison-doughnut-title-precedence.sh`. A witness that is not
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

Arm-owned database qualification, 2026-11-14, same host at load about
5–9, through the retained reference fault and witness inside the agent's
write sandbox with ports 3309 and 6380 denied (both refused a connection
from inside it): baseline exit 0 (3,111 tests), faulted exit 1 (the same six
maintained failures, `Expected: every item is <490>`, and the witness
printing all six forms `resolution=AMBIGUOUS destination=null`), restored
exit 0 (3,111 tests), resolver SHA-256 and Git status unchanged. The
observer and assessor passed it; a separate materialization showed cleanup
stopping the arm's server.

| Step | Seconds |
| --- | ---: |
| Preparation (fetch, seeded caches, payload, setup, own server, migration) | 95.9 |
| Baseline, faulted and restored commands | 108, 91, 120 |
| Whole reference journey, with observation and cleanup | 415.6 |

## Comparisons

Each pair's compact record is kept under `comparisons/`, outside the case's
identity; the raw arm evidence stays with the maintainer who ran it.

- [`20261114T045440-26b0`](comparisons/20261114T045440-26b0.txt), 2026-11-14:
  release v0.3.98 (`ad7aa7d`) against trunk `91f32d39`, arms concurrent at
  load about 4–12, each with its own database server. Improved: the
  candidate passed (baseline, fault, witness and restored proof on the
  maintained test class, 7 tests each, verdict Caught; 25 commands, 625 s).
  The baseline reported Caught from three full-suite runs (3,111 tests, six
  failures under the fault) but observed the destinations by printing from
  the production controller during the faulted run, so no run changed only
  the resolver and no independent witness was recorded; the assessor failed
  it (31 commands, 888 s). The installed `dough-intent-coverage` skill is the
  same in both payloads, so this pair does not attribute the difference to
  that guidance.
