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

Managed delivery accepted slice 2 at `eba65e39` on the story branch and
reused its observer. The delivery included the upstream merge while
preserving the already published slice 1 history.

### Slice 3 accepted proof

- Migrated 125 queued-trunk setup calls in 46 skill files. The focused
  selection in `/tmp/dough-seed262-slice3.1Bz6ZS/node-paths.txt` passed all
  31 Node files in 71.42 s using Homebrew Bash and the AC guard:
  `caffeinate -s -i bash scripts/test.sh "${checks[@]}"`.
  The same directory contains timings, outcomes and consumer dispositions.
  Dashboard typecheck and whitespace checks passed.
- Startup readiness cases observe their actual commands and marker
  locations. The copied-origin test observes an independently advanced
  Git history and verifies no automatic maintenance. The durable
  command scripts write to the fixture root, and ordinary scripts
  write to the checkout.
- `workspace-publication-race.test.mjs` still makes the competing push
  and observes the conflict and recovery. The literal CRLF case compares
  the exact malformed Git blob, observes refusal without publication,
  repairs and pushes through real Git, and observes a successful retry.
  The canonical-plan and plan-link cases keep literal legacy data.
- Scratch comparisons matched trees, refs, commit messages and credit
  for queued, readiness, Taken and dependency-blocked histories.
  The remaining queued constructor calls belong to native bridges or
  the supplier fixtures assigned to slice 4.

### Native evidence at integration

The initial plan based evidence reuse on the native scenarios continuing
to use the retained fixture paths. Plan 508 landed at `870df7613` and now
hashes `tests/support/makeMe.mjs` directly for native one-shot evidence
and through the imported dependency closure for admission evidence.
The MakeMe extension and the done-record extraction necessarily change
those fingerprints. The four scenario fixture files match that trunk
baseline, and the credential-free native evidence identity check passed.
Landing treatment was raised separately for developer direction.

The independent refactor now shares the production-encoded Take facts
between the dashboard and skill fixtures, keeping membership explicit in
both. It also reused the existing Ready-state builder in a case that still
runs the real readiness command. Four affected Node files and eight
dashboard launch and attention cases passed, as did typecheck and exact
replay comparison. Dispositions and proof are in
`/tmp/dough-seed262-refactor3.P46sGl/`.

Managed delivery accepted slice 3 at `0318e27a` on the story branch and
reused the same observer.

### Slice 4 focused proof

- The 15 supplier files and repository fixture proof in
  `/tmp/dough-seed262-slice4.Se3NYf/node-paths.txt` passed all 16 checks
  in 20.82 s through the Homebrew Bash runner. Dashboard typecheck and
  whitespace checks passed.
- The supplier fixtures declare consumer and supplier identities and
  retain real agreement, resolution, merge, and ancestry operations.
  Scratch comparison preserved the initial Git tree, planned ancestry,
  messages, authors, committers, refs and unpublished preparation bytes.
  The proof selection and consumer dispositions are retained beside the
  comparison in the same scratch directory.
- Repository-wide search found legacy constructor calls only from the
  four native entries and their two retained bridges. The four entries
  and both constructor bodies keep their prior behavior. The unused
  `publishAssignment` export had no remaining consumer and was removed.

Independent refactor reused the queued fixture's plan-path rule in the
supplier overlay. The same 15 supplier checks and exact Git and overlay
parity passed. Its trace is under `/tmp/dough-seed262-refactor4.18Yn1X`.

### Full local gates

Both suites ran sequentially on the awake AC-powered macOS host with
Homebrew Bash first. The host had 16 logical CPUs, no other full-suite
admission holder, and 67% free memory before the repository suite and
64% before the dashboard suite. The six repository jobs and four
dashboard workers stayed within the observed host capacity.

- `OPEN_DOUGH_TEST_JOBS=6 /usr/bin/time -p caffeinate -s -i npm test`
  passed all 510 checks in 366.41 s wall. Per-check outcomes and times
  are in `/tmp/dough-seed262-full.o6p2bi`.
- `/usr/bin/time -p caffeinate -s -i npm run --silent test:dashboard -- --workers=4`
  passed in 1106.40 s wall with the color and Git alternate variables
  unset. The strict transcript `/tmp/dough-seed262-full.o6p2bi/dashboard.json`
  selected 2191 cases. Of these, 2190 passed and the opt-in Sessions replay
  benchmark skipped. The command exited zero with strict status passed.

Managed delivery accepted slice 4 at `5e5f11bf` after a rejected first
push. The candidate and base did not change, and renewed focused Node
proof and dashboard typecheck passed before the accepted publication.

The product review found no corrective implementation work. The timing
baseline belongs in the existing profiling card before plan cleanup.
The native fingerprint decision remains open for closure.
