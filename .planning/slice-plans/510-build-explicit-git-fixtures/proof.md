# Execution proof

## Decisive premise observations

Observed on 2026-11-08 in this worktree at `3be3f59df` on macOS with Node 24.
The command was `node <job-tmp>/journey.mjs`, which calls the existing
`createPreparationTrunk`, `createWorkspace`, `startPreparation`,
`startCliResult` and backlog `complete` exactly as `buildStoryColumnsJourney`
does. A second script then read each published file at `main`.

| Consuming operation | Observation | Result |
| --- | --- | --- |
| Slice 1 replaces command replay with encoder writes | Each published file was parsed and rendered again with its production encoder: `parseAgentProfile`/`renderAgentProfile` for both profiles, `parseBacklog`/`renderBacklog`, `parseDoneRecord`/`renderDoneRecord`, and `parseDoneCatalog`/`renderDoneCatalog` | All five rendered byte for byte (SAME), so the encoders can produce what the commands publish |
| Slice 1 matches what each transition changes | `git diff --stat` between the named revisions | queued→preparing changes only `agents/yui-chan.json`, →taken changes the backlog and `agents/akiho-chan.json`, and →completed changes the backlog, `done/SEED-C_c.json` and `done/.catalog.json` |
| Slice 1 matches commit facts and refs | `git log --format=%an|%cn|%cI` and `for-each-ref` on the origin | Authors are Yui-chan and Akiho-chan on the story-columns agent commits and Integration Checkout elsewhere. In the separate launch history, Yui-chan takes Story A as the first agent. The committer is always Integration Checkout. Only `refs/heads/main` exists. |
| Slice 1 setup cost to be replaced | The same script with timings, run twice | The preparation start (~0.75 s) and Take (~1.1 s) dominate the 2.40–2.56 s total |
| Native evidence identity is unaffected | `tests/support/git-publication-native-evidence.sh` lists its inputs explicitly | It does not list the queued-trunk or preparation fixture modules, and the native fixtures keep calling those helpers unchanged |
| Slice 2 default repository | `product-backlog.mjs add` on a backlog of `# Product backlog`, `## Taken`, `## Backlog list` | The file parsed. The add was refused only because the linked seed was missing (`canonical home not found`). |

### Pre-change timing baseline

Measured on the selected worktree at `16d42d6ac`, macOS on AC with Node
24.21.0, Chromium 153.0.8010.12 and Homebrew Bash first on PATH.

- `/usr/bin/time -p caffeinate -s -i npm run --silent test:dashboard -- dashboard/tests/sessions/agent-launch-attention.spec.ts --workers=2`,
  with `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `NO_COLOR` and `FORCE_COLOR`
  unset and an `OPEN_DOUGH_DASHBOARD_PROOF_RECORD` per run. Two passed
  cases each, 11.38 and 8.36 s wall. Proof transcripts were
  `/tmp/dough-seed262-proof.ZcEETg/attention-before-{1,2}.json` and the short
  load averages before launch were 3.32 and 3.20.
- In two fresh processes under `scripts/test-environment.bash`, replay of
  the exact exported story-columns setup took 2.35 and 2.44 s. The separate
  launch setup took 1.40 and 1.43 s. The scratch snapshots under
  `/tmp/dough-seed262-journey-replay.AqQCth` captured each revision's file
  bytes, refs and author/committer with `DOUGH_BACKLOG_COMPLETION_TIME` set
  to `2026-11-08T05:30:00.000Z`.
- `/usr/bin/time -p bash scripts/test.sh src/skills/dough-story-refinement/scripts/preparation-assignment-owned-context.test.mjs`
  passed the file's five cases in 6.65 s wall. The same five starting-trunk
  arrangements, timed in one separate process under the runner environment,
  took 304, 197, 149, 171 and 153 ms. Short load was 3.80 before the selection.

### Slice 1 accepted proof

- The exact 111-spec selection from direct and transitive fixture usage ran
  266 cases, all passed, in 346.76 s wall. The two-worker command used
  `mapfile -t paths < /tmp/dough-seed262-journey-replay.AqQCth/slice-1-dashboard-specs.txt`
  and `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/dough-seed262-dashboard-after.JgmxA2/slice-1-consumers.json /usr/bin/time -p caffeinate -s -i npm run --silent test:dashboard -- "${paths[@]}" --workers=2`
  under the local gates above. The transcript reached completed with
  runner and strict status passed. The consumer trace and dispositions are
  in `/tmp/dough-seed262-dashboard-after.JgmxA2/consumer-trace-disposition.md`.
  Attention still checks published membership and per-story counts across
  Backlog, Preparing, Taken and no list. Preparing and attribution cases
  read credited committers and published profiles from named revisions.
  Phone paste and session host status use the rebuilt shared publisher.
  Long-title consumers observe their dialog on a separately declared title.
- The same timed attention command as before passed both cases twice after
  migration, in 7.28 and 6.75 s wall. The after transcripts are
  `/tmp/dough-seed262-dashboard-after.JgmxA2/attention-after-{1,2}.json`.
  Short load was 5.09 and 5.48, so wall changes include host variance.
- Scratch comparison of all named story-columns and launch revisions under
  the same controlled done time passed twice for files, author and
  committer identities, transition deltas and refs. Post-change story-columns
  construction took 604.0 and 598.9 ms. Launch construction took 482.0 and
  417.4 ms. Preparing's 11-commit history also matched its replay, including
  commit messages and credited authorship.
- A scratch concurrency check confirmed that identical descriptions have
  matching named commit IDs, a push to one copied origin leaves the other
  untouched, literal binary bytes round-trip unchanged, and cleanup removes
  both copies. `npm run typecheck:dashboard` and `git diff --check` passed.

The independent refactor extracted the existing done-record builder into
`tests/support/doneRecordTestData.mjs` without changing its API. The
Intent Coverage done-record check, dashboard typecheck, and exact
story-columns replay comparison passed after the extraction. Its trace
is in `/tmp/dough-seed262-refactor.tofU02/consumer-trace-disposition.md`.

Managed delivery accepted slice 1 at `6f5d94fe4` on the story branch and
attached it to the retained observer. Before slice 2, local merge
`c774e901` incorporated plan 508's trunk landing `870df7613`. It kept
the published backlog encoder and all canonical builders. The existing
done-record getter retains both APIs in one builder. The merge hook and
a fresh exact launch and story-columns replay comparison passed.

### Slice 2 accepted proof

- Migrated 46 preparation and 17 sibling setup calls across 23 skill test
  files. `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh` with the exact
  paths in `/tmp/dough-seed262-slice2.mznJjf/node-paths.txt` passed all 24
  selected files in 38.05 s. The additional default repository test
  checks the bare origin, sole `main` commit and real backlog CLI reporting
  zero active entries. The announce test declares Yui's rival execution
  profile, runs the real start, and compares the published Yuma profile
  bytes with `renderAgentProfile` output. Other real command and competing
  Git operations stay under their original assertions.
- The strict two-worker `npm run --silent test:dashboard -- dashboard/tests/stories/backlog-preparing.spec.ts dashboard/tests/sessions/session-attribution.spec.ts --workers=2`
  run under the AC guard passed 2/2 in 10.08 s, observing published
  assignment credit, release/abandon and historical name reuse.
  `npm run typecheck:dashboard` and `git diff --check` passed.
- The C and B2 repository descriptions matched the old constructors'
  ordered Git trees, messages, authors, committers and refs. Launch and
  story-columns matched post-508 merge snapshots with the same clock.
  Comparisons, strict transcripts and per-consumer dispositions are under
  `/tmp/dough-seed262-slice2.mznJjf`.
- The same five-case owned-context selection passed in 5.25 s versus
  5.91 s on the merged pre-change baseline. With the same runner environment,
  first fixture time was 245.6 ms and four warm samples were 21.0–21.7 ms,
  compared with 272.9 ms first and 125.9–128.2 ms warm before. Short load
  was 3.10 after and 4.86 before. Compare timing with this load difference.

Independent refactor extracted `writeRevisionFiles` from Git/cache lifecycle.
Post-extraction proof passed the same 24 Node files, both preparation and
attribution cases, ten attention and long-title cases, dashboard typecheck,
and both exact replay comparisons. Consumer dispositions and proof are in
`/tmp/dough-seed262-refactor2.1W9E9g/`.
