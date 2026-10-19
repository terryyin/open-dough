# Execution observations

Dated preparation and accepted slice proof for [plan 317](../PLAN.md).
The plan retains canonical execution identity, statuses, obligations and observer.

## Preparation observations and limits

Observed on 2026-10-19 in the established preparation checkout
`/Users/terryyin/git/open-dough/.worktrees/collect-client-feedback-and-prioritize-open-doug`
at `1b3c54fbeeb8bb0afd1ee3baa073239639453134`, using Node 24.21.0.

| Premise and consuming operation | Result-bearing observation |
| --- | --- |
| Current discovery can resolve repositories and targets without the runbook's fixed paths | Read `~/.open-dough/dashboard/projects-production.json` with Python `json.loads`, then for every expanded `localPath` ran `git -C <path> rev-parse --show-toplevel`, `remote get-url origin`, `branch --show-current`, and `status --short`, and tested `<path>/DearDough.md`. Five origins matched configured identities. Open Dough, Doughnut and Pygardon used `main` and had logs; Terry Talks and Lizard used `master` and lacked logs. Terry Talks had unrelated work. This settles the current read/identity route, not future availability or publication authority. |
| Existing Git delivery supports exact-target acceptance, repeat/resume, and preservation of other work | `PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/execution-increment-publication.test.mjs src/skills/dough-execute-plan/scripts/publication-resume.test.mjs src/skills/dough-execute-plan/scripts/publication-checkout-maintenance.test.mjs` exited 0. Inspected fixtures use real local bare origins and assert remote refs/content, repeat commit counts, and unchanged checkout/index bytes. No production remote was used. |
| Acceptance proof distinguishes an attempted push from actual delivery | In a scratch edit to `publication-git.mjs`, omitted only `tryPushExactRef`'s call to `pushExactRef`. `node --test --test-name-pattern='Story Branch Mode increment publishes' src/skills/dough-execute-plan/scripts/execution-increment-publication.test.mjs` exited 1 with `remote did not accept the candidate`. Restored original bytes; the same command exited 0 with one passing test. Scratch changes were removed before recording refinement. This tests the reusable publication boundary, not the new wrapper. |
| Ranking, ownership and incomplete sync are evidenced needs | The [runbook-history review](../../../../docs/maintainer/empirical-process-control-research.md#runbook-automation-follow-up) documents actual user corrections and the October 12 instruction to also sync Open Dough. The current runbook excludes commit/push; the catalog index points to separate files. These inspected records establish the design mismatch, not fresh proof of old outcomes. |

Reconciliation, ranking and guidance composition are agent judgments. Their
future reliable execution cannot be inferred from files being present or from
the Git tests. Only native use can settle that premise; slice 1 owns a permitted
early probe after its minimal draft, with existing paid-run authorization. A
failed or unavailable probe stops dependent slices for repair/replanning. No paid
or native agent session ran during preparation. Later effectiveness remains a
watch question rather than a readiness premise for delivering this skill.

Plan 317 follows the highest allocated plan number 316, checked across current
paths and Git history immediately before creation.

## Learnings

- The installed Dough Land guide predates findings-maintenance handoffs. The
  internal wrapper therefore follows the maintained `src/skills/dough-land/`
  guide and source references explicitly, resolving helper placeholders to the
  target's installed runtime. No managed installation was hand-synchronized.
- A first native cycle used the supplied ordinary Git convention, so its success
  did not establish Dough Land composition. A focused second native journey
  established the source-guide/installed-helper boundary separately.

## Slice 1 accepted proof

On 2026-10-19, candidate product-file hashes in
`/tmp/open-dough-feedback-317-source-land/candidate-sha256.json` matched this
pre-refactor checkout. Reconciliation later received whitespace-only reflow; its
words and behavior remain identical. The coordinator inspected actual occurrence records, source/local
facets, backlog, reciprocal links, publisher call and receipt, and all three
outcome assessors. Fixtures supply inputs only; native agents perform the cycle.

- First use: `python3 .planning/slice-plans/317-collect-client-feedback/proof/setup-first-use.py /tmp/open-dough-feedback-317-slice1`,
  then `PATH=/opt/homebrew/bin:$PATH bash .planning/slice-plans/317-collect-client-feedback/proof/run-first-use.sh /tmp/open-dough-feedback-317-slice1 first`,
  then `python3 .planning/slice-plans/317-collect-client-feedback/proof/assess-first-use.py /tmp/open-dough-feedback-317-slice1`.
  Codex 0.163.0 exited 0; assessor passed. It observes qualified distinct
  occurrences, deduplication, historical allocation, local-byte preservation,
  separate uncertainty, severe-first ranking, reuse of queued work, Taken work,
  live links, and actual local-origin contents. Evidence commit
  `b9dab2839030f87775dca69d9cdf7e9111d6424c` precedes source compaction.
  Accepted: Open Dough/main `98d209051b45894a2810fd6ffcdb49db41f01f95`,
  alpha/main `b0572060eca89a042a9cd29873a9b33a6861f299`,
  beta/master `7c8f8b1002588705b9531ca913198f381b20c1ba`.
- Source Land: `python3 .planning/slice-plans/317-collect-client-feedback/proof/setup-source-land.py /tmp/open-dough-feedback-317-slice1 /tmp/open-dough-feedback-317-source-land`,
  then `PATH=/opt/homebrew/bin:$PATH bash .planning/slice-plans/317-collect-client-feedback/proof/run-first-use.sh /tmp/open-dough-feedback-317-source-land source-land`,
  then `python3 .planning/slice-plans/317-collect-client-feedback/proof/assess-source-land.py /tmp/open-dough-feedback-317-source-land`.
  Codex exited 0; actual stream reads source Land and its publication reference.
  `publish-cycle.mjs` invokes maintained installed publication with queued-closure
  validation; accepted Open Dough/main
  `c47d94911f3be73dd9131193dbd2db77b67cbeb8`, two owned record paths, one new
  occurrence, unchanged clients. The deliberately old installed guide remains
  unchanged. Receipt: fixture `publication-result.json`.
- Replay: `PATH=/opt/homebrew/bin:$PATH bash .planning/slice-plans/317-collect-client-feedback/proof/run-claude-replay.sh /tmp/open-dough-feedback-317-source-land`,
  then `python3 .planning/slice-plans/317-collect-client-feedback/proof/assess-replay.py /tmp/open-dough-feedback-317-source-land`.
  Claude Code 2.1.303 exited 0; actual Skill expansion and canonical source read
  observed. All three HEAD/tree/count/status snapshots and origin refs match the
  pre-replay baseline; no new occurrence, story, commit or push.
- Literal expanded native commands, task-based prompts and terminal streams are
  in each fixture's `*-command.txt`, `*prompt.txt`, `*-terminal.txt` and
  `*-transcript.jsonl`; reports and independent result JSON name decisive files.
  These are temporary evidence, not another product store. Native supervisors
  reached terminal results and ended their watches.
- Host mechanisms: fresh Codex composition and Claude pointer/replay above.
  Cursor shared internal-skill integration reuses
  `b721e14f:.planning/quick/004-versioned-updates/PLAN.md` (native
  `/release-version` read canonical `.agents` source without a Cursor copy,
  session `1bd99d48-723d-4d9d-b280-ffe3328ab543`, runtime
  `2026.04.13-a9d7fb5`, verified fixture `v0.1.1` at `de98407`). Same shared
  source mechanism; no fresh Cursor feedback-cycle claim. Claude historical
  thin-pointer evidence at `76ed02f8` is strengthened by fresh replay here.
- Representative behavior review: explicit invocation guard; supplied project,
  evidence and writable destination requirements; isolated inline/linked catalog
  boundaries; child standalone limits; and zero/one supported candidate paths
  are consistent across descriptions, prose, references and pointers. These are
  reviewed guidance paths, not additional native runs. Current authoring context
  caused no production log/catalog/backlog writes. Production inventory discovery
  reuses the dated preparation observation; native proof uses isolated inventories.

Independent post-change refactoring preserved product behavior and moved these
bulky observations out of the plan while retaining its canonical execution
context. Native proof stayed valid. The coordinator repaired ShellCheck annotations
and separated a prompt read in the temporary launchers after the first formatting
attempt identified them. `PATH=/opt/homebrew/bin:$PATH npm run format` then
exited 0; no native rerun was needed for those launcher-only mechanical repairs.
