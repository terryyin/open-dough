# Repository authoring and host observations

Moved from DearDough during local findings maintenance on 2026-11-01.
The complete original source is recoverable at
`ae6479d3558b2e660e99d5b4839f0b6b064e7df5:DearDough.md`.
Original execution provenance and uncertainty are preserved below.

The Markdown whitespace and optional-prop errors were caught by sound delivery
checks and repaired before publication. DD-374 concerns a coordinator brief
that weakened this repository’s failure policy despite the shared delegation
rule preserving it. DD-365 concerns the host’s approval classifier. These
observations establish no uncovered published-skill repair. No new local story
is selected; completed repairs, Taken work and direction remain intact.

<a id="dd-363"></a>

## DD-363 — Coordinator source-review hard-breaks fail fresh delivery

Coordinator-authored `source-review.md` used Markdown hard-break trailing spaces
that the fresh-delivery preparation refused; selective `npm run format` does not
cover Markdown, so the defect reached the first guarded delivery.

### Occurrences

- Execution: SEED-157#check-stalled-delegated-verification; plan and source-review recoverable at before-cleanup `e8e841c8e15d23db9f8d9e4d86923d134294992b` (`.planning/slice-plans/363-check-stalled-delegated-verification/`); first related implementation commit `cd30010f9044cf703596a58e98a494e610cc6f2d`
  - Timestamp: unknown (2026-10-28; first fresh-delivery attempt before accepted `cd30010` at 16:19:23+08:00)
  - Tool: Cursor
  - Open Dough release: 0.3.73
  - Evidence: coordinator transcript `3bd97cc2-93e0-4e61-bca4-b477e0d7b5f4` — after writing/updating `source-review.md` and running `npm run format`, first `execution-increment-delivery.mjs fresh` failed; repair removed trailing hard-break spaces on the Launch/Input/Reviewer header lines; retry published `cd30010`. Distinct from ODF-329 (implementer ESLint under a lint-forbidden delegation brief).
  - Observed effect: one refused fresh-delivery attempt and a mechanical coordinator repair before the accepted publish.
  - Inference: qualified one-off. Coordinator Markdown artifacts need a pre-delivery whitespace check or must avoid hard-break trailing spaces; format alone does not cover them.

<a id="dd-365"></a>

## DD-365 — Commit-specific preparation approval repeats after safe reconciliation

Approval named one preparation commit, then a metadata-only rebase changed its
SHA while retaining the reviewed story, plan and backlog link. Automatic
approval review required another human approval before publication.

### Occurrences

- Execution: SEED-164#dashboard-ci-time; first implementation `7eda0986bafe78cbf6088df514bb6b088edf9333`
  - Timestamp: unknown
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: execution conversation; approval of preparation `3c5f3ded`, reconciliation onto another chat's metadata as `aeff46decceb5fef150962b5ce72db259d866382`, then explicit approval of preparation-only changes and safe reconciliation. Seed/plan bytes and the sole backlog plan-link edit were checked unchanged before publication.
  - Observed effect: publication paused for a second human approval although the reviewed preparation change was unchanged.
  - Inference: qualified one-off; requesting approval for the concrete change scope plus safe reconciliation can avoid a SHA-only authorization becoming stale. This differs from ODF-262's permission-only UI probes.

<a id="dd-370"></a>

## DD-370 — New Markdown docs with trailing blank EOF fail staged whitespace

Post-change refactor extracted new maintainer timing Markdown files that ended
with an extra blank line. Selective format does not rewrite that Markdown
whitespace, so the first guarded fresh delivery failed at `git diff --check`
(`new blank line at EOF`) after the plan status mutation.

### Occurrences

- Execution: SEED-180#optimize-dashboard-touch-viewport-tests; plan 413; first related implementation `483f66b483a9046e0c790bc12bcc57489aa2a503`
  - Timestamp: 2026-10-30T14:11:00+08:00 (approx.; first slice-6 fresh delivery refused before accepted `2f800b3f`)
  - Tool: Cursor
  - Open Dough release: 0.3.76
  - Evidence: fresh `preparation-failed` / `operation: "staged whitespace"` naming `docs/maintainer/dashboard-installed-start-fixture-timings.md:83` and `docs/maintainer/dashboard-touch-family-timings.md:73`; repair stripped trailing blank EOF; retry published `2f800b3f`. Distinct from DD-363 (hard-break trailing spaces on source-review lines). Code renumbered from colliding DD-369 at trunk merge.
  - Observed effect: one refused preparation after status mutation; mechanical EOF fix and second guarded delivery succeeded
  - Inference: new Markdown created under the file-size split needs an EOF whitespace check before staging; format alone does not catch it

<a id="dd-371"></a>

## DD-371 — Delivery typecheck first catches exactOptionalPropertyTypes after green proof

Focused Playwright proof and post-change refactor returned green, yet the
first slice-2 delivery/commit failed on TypeScript
`exactOptionalPropertyTypes` when an optional prop was passed as an explicit
`undefined` instead of omitted. A one-line conditional spread fixed it; retry
published. Local code was DD-370 on the story branch; renumbered to DD-371 at
trunk merge where DD-370 already named the Markdown EOF finding.

### Occurrences

- Execution: SEED-189#expand-dashboard-diff-context / plan 416 / first related implementation `5c73925b9dcdffd763c20f5b81c5d1aa45413757`
  - Timestamp: unknown (2026-10-30; after green slice-2 proof/refactor and before tip `c9ada8b1` 15:13:13+08:00)
  - Tool: Cursor
  - Open Dough release: 0.3.78
  - Evidence: coordinator transcript `1cd76bae-22c3-404c-b849-2df63d24fb85` L56–L58 — “Fixing the TypeScript exactOptionalPropertyTypes error that blocked the commit, then retrying delivery”; edited `dashboard/src/StoryReviewFileDiff.tsx` from `textProblem={…}` (could be `undefined`) to conditional `{...(cond ? { textProblem } : {})}`; republished as `c9ada8b1`. Distinct from ODF-329 (ESLint/formatter under a lint-forbidden brief).
  - Observed effect: one failed delivery attempt and one coordinator type fix before successful publish; no product behavior change beyond satisfying the typecheck gate.
  - Inference: qualified one-off that delivery/commit typecheck was the first gate for this optional-prop shape after green journey proof. Implementer/refactor briefs that forbid independent lint/typecheck leave that class of defect to the delivery hook; no claim that a earlier read-only `tsc` would have been cheaper than the observed retry.

<a id="dd-374"></a>

## DD-374 — Delegation brief softened the project's failing-test policy to "fix or report"

The coordinator's implementation brief told the agent that a locally failing or
flaky test was "a defect to fix or report". This project's policy is to fix
such tests so local and CI results match, even when the failure predates the
change. The agent reported an intermittent regression-suite failure that was
already on trunk and left it unfixed, so the coordinator had to send it back
for a second round.

### Occurrences

- Execution: SEED-192#open-development-intent-frame; first implementation `9913a6d40006e3de9980ab8d97e0e2f3197b5f0d`
  - Timestamp: 2026-10-31 (Asia/Singapore; exact time unknown)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.79
  - Evidence: slice 1 implementation return listed `sessions-sidebar-navigation-cases.spec.ts` "a story on no card…" as failing 1 in 4 on clean `22eb4b3e` and "did not fix it". A coordinator follow-up then found the cause (a reveal-count test race with keep-in-view after a Side panel press) and fixed it (`revealsAtClick`, 8 of 8 passing repeated); see `72ce39b109d5352b43dd093c68b9257b564a1bdc:.planning/slice-plans/424-development-intent-frame/PLAN.md` Current decisions.
  - Observed effect: one extra delegation round (about 5 minutes, 9 tool uses). The fix landed in the same increment.
  - Inference: the coordinator's wording, not the shared guidance, caused this; delegation already says a discovered failure keeps the project's failure policy. Pass the project's policy verbatim instead of paraphrasing it.

**Response (2026-11-01):** SEED-208#trustworthy-ci-completion slice 1
(`482b644e90076052a2f36b9df7977b6f46ce7e89`, story branch
`claude/finish-every-execution-with-trustworthy-ci-and-n`) puts the policy in
AGENTS.md "Failing and flaky tests", which every host reads, with "Do not
paraphrase it as 'fix or report'". `delegation.md` "Give the agent" now
carries the project's policy by link or verbatim. The reusable wording is
unreleased; the project policy takes effect when the story reaches main.
**Delivered, awaiting observation in later delegation briefs; not resolved.**

**Adoption (2026-11-03 review):** the AGENTS.md policy reached `main` in merge
`bc72a379b` (2026-11-01T11:05+08:00), and the `delegation.md` wording ships
from `v0.3.80` and is installed in this repository's `.agents/skills/`. No
later delegation brief has been inspected against it; a brief that meets a
failing or flaky test and carries the policy by link or verbatim satisfies the
observation. Open.

<a id="dd-378"></a>

DD-378 (planning treats pre-existing failures as exclusions from completion)
was retired on 2026-11-07 after `SEED-229#reduce-remote-sessions-traffic`
(`e49035d31:.planning/slice-plans/462-reduce-remote-sessions-traffic/PLAN.md`)
satisfied its observation criterion; see
[review history](project-findings-history.md#dd-378).

<a id="dd-442"></a>

## DD-442 — A shallow historical checkout still inherited the host Git object store

A scratch checkout can show one reachable commit and no remotes while Git can still read a host object alternate. For a bounded historical assessment, verify that the checkpoint can be read from its local object store with inherited alternates cleared and that a known later object is unavailable.

### Occurrences
- Execution: SEED-192#assess-story-intent-protection (plan 472, first report commit `ae07bb07aa1516a7d400cff6496f1c5c1cf0fc8f`)
  - Timestamp: 2026-11-07T08:26:55.778Z (coordinator report during Slice 3 preflight)
  - Tool: Codex
  - Model: gpt-6.1-sol
  - Open Dough release: 0.3.87 (execution checkout's installed guidance)
  - Evidence: Codex session `01a1b509-fd39-79c2-a8b9-5fc768f51ded` at 08:26–08:27Z; `b0ad4c799d4b659ed072591e8dc0e66b4caefc2e:.planning/slice-plans/472-assess-story-intent-protection/PLAN.md` execution context and Slice 3 proof; [trial evidence limits](https://github.com/terryyin/open-dough/blob/b0ad4c799d4b659ed072591e8dc0e66b4caefc2e/docs/intent-coverage-trial/README.md#evidence-limits).
  - Observed effect: The third assessor could not read HEAD with `GIT_ALTERNATE_OBJECT_DIRECTORIES` unset until the coordinator materialized the checkpoint locally. The corrected preflight resolved HEAD, counted one reachable commit and rejected a later object. The first two assessors' standalone Git checks had inherited the alternate. Their Playwright commands cleared it, and both assessors confirmed they used only their scoped inputs.
  - Inference: Ref and remote checks alone cannot establish object isolation. No access to later evidence was observed, and the rework time was not measured.

## Focused proof bypasses the project test runner (open, unqueued)

<a id="dd-330"></a>

### DD-330 — Delegated focused proof ran `node --test` directly, so it missed both the runner's Git environment and its quiet-pass rule

`scripts/test.sh` accepts file paths, sources `scripts/test-environment.bash`, and fails a passing job that prints anything. A focused command that calls `node --test` directly gets neither of those, so it can produce a false failure and also miss a real one.

#### Occurrences

- Execution: `SEED-010#bound-startup-guidance-retrieval` / plan 345, first related implementation commit `fc62c171`
  - Timestamp: 2026-10-22T02:38:45Z (CI run 39712519878 created; the local runs were earlier the same day)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout VERSION 0.3.68)
  - Evidence: The coordinator's delegation named `node --test src/skills/dough-execute-plan/scripts/*.test.mjs` without the runner. Run that way, `publication-clean-trunk-fixtures.test.mjs` failed: commits in fixture checkouts started `git maintenance run --auto` because the runner's `maintenance.auto=false` was absent. The implementer reported this as an unrelated failure. Rerun under `scripts/test-environment.bash`, all 923 tests passed. The new `read-budget-guidance.test.mjs` printed `t.diagnostic` sizes, and CI job "test (2/3)" failed it as "passed but printed output". Repair `144b436f`. `bash scripts/test.sh <files>` reproduces that failure locally.
  - Observed effect: about six coordinator tool calls went to diagnosing the false failure, and one hosted CI failure needed one repair increment.
  - Inference: qualified. Delegation already asks for "literal focused commands with the runtime wrapper". The coordinator did not resolve that this project's wrapper is `bash scripts/test.sh <paths>`. A literal runner-based focused command would have prevented both effects.

## Installer declarations sit at the line limit beside a single-entry anchor convention (open, unqueued)

<a id="dd-303"></a>

### DD-303 — Joining `install.sh` lines to stay at 250 broke a test that treats single-entry lines as anchors

#### Occurrences

- Execution: `SEED-008#coalesced-ci-validation` / plan 307, slices 4–5 (`f1582623`, `d429430a`)
  - Timestamp: unknown (2026-10-15)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision b9a2c783; base 0.3.62
  - Evidence: each new runtime module needed a `managed_files` entry in `install.sh`, which sat at the 250-line limit, so entries were joined onto existing lines. In slice 5, the refactor's first join put a module on `ci-github-diagnostic.mjs`'s line. `ci-github-acquisition.test.mjs` "no installed file asks gh outside the one request source…" matches single-entry lines (`/^ {2}(dough-[\w./-]+)$/gm`) and failed until the entry moved. In slice 4, the refactor added two lines (252) and left the coordinator to rejoin them.
  - Observed effect: two extra fix-and-rerun rounds around installer declarations.
  - Inference: qualified. The file-length rule and a test's reliance on line shape conflict as the payload grows. The anchor convention is undocumented beside the list.
- Execution: SEED-230#summarize-ci-proof-in-intent (plan 463-summarize-ci-proof-in-intent; first implementation commit `99d0f70e7c503bcafb7cc79d3183277eaec28c96`)
  - Timestamp: unknown (2026-11-04, slice 4)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.83)
  - Evidence: `install.sh` was already 312 lines, solely the ADR 0003 `managed_files` declaration; slice 4 added the CI proof recipe and four collector modules one per line (317). Terry had refused size exceptions earlier in the story; for `install.sh` he allowed 317 for this slice, since staying under 250 would need splitting the single declaration that about 21 tests and install scripts parse as text.
  - Observed effect: one human decision stop at slice 4; earlier in the same story the gate drove `ci.yml` into composite actions and YAML anchors.
  - Inference: qualified. The 250-line gate keeps meeting the one-declaration list; either the declaration's shape or the gate's scope for it needs a decision.

## Formatting every path repeats unrelated work (measured response, released in v0.3.67)

<a id="dd-309"></a>

### DD-309 — The per-slice formatter rewrites the whole repository
Slice delivery asks for the project's selective formatting command; this project's `npm run format` (`scripts/lint.mjs --fix`) lists every tracked and untracked file and runs ESLint, Prettier and shell formatting over all of them, so a docs-only slice pays the full cost.
#### Occurrences
- Execution: `SEED-138#compute-execution-readiness` / plan 311, first related commit `7aafbcb14dbc82d7bf88fd68570aff381c556dd2`
  - Timestamp: unknown (2026-10-17 JST, each of the four slice deliveries)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.63
  - Evidence: `scripts/lint.mjs` file listing (`git ls-files --cached --others --exclude-standard` unless `--staged`); coordinator format runs exceeded 300 s (slices 1 and 3) and 600 s (slice 4, five Markdown files) at load averages near 100 to 120.
  - Observed effect: roughly 5 to 10 minutes of formatter time per slice, four times, with the coordinator idle.
  - Inference: qualified. Machine load inflated the cost; a changed-files mode, like the hook's `--staged` check, would bound it. Unloaded duration not measured.

- Execution: `SEED-008#land-unfinished-stories-without-retirement` / plan 314, first implementation `100e12a4b44e7b43477b1f411d138813d2b4b32d`
  - Timestamp: unknown (2026-10-18 JST, slice deliveries).
  - Tool: Codex
  - Open Dough release: 0.3.63 (installed VERSION at claim `50d0a603`; installed execution/refactor guidance unchanged).
  - Evidence: `scripts/lint.mjs` lists all tracked/untracked files for `npm run format`; accepted slice 1/2 evidence at `1317f9fc` and coordinator tool receipts record two first-slice attempts (one mechanical unused-parameter repair) and one second-slice attempt.
  - Observed effect: each delivery waited for repository-wide ESLint, Prettier and shell checks; logs enumerate unchanged installed skills and unrelated source/test files. The second delivery also encountered the overloaded shared host. No unrelated bytes changed.
  - Inference: the available project command exceeds the workflow's selective-format intent; the full cost is repeated after a mechanical repair. Unloaded duration and token cost were not measured; no formatter change is authorized by this execution.

- Execution: `SEED-136#restore-ci-under-three-minutes` / plan 315 (`d7b6ce89d4a33b218f6212a9a3da2ea788b892e0:.planning/slice-plans/315-restore-ci-under-three-minutes/PLAN.md`), first implementation `f4466c10ffcfe3697a51a0f829a7ed063d06f2ba`
  - Timestamp: unknown (2026-10-19 JST; events described below).
  - Tool: Codex
  - Open Dough release: 0.3.63 (checkout-bound installed dough-update/VERSION at claim `c0fa9c15`; installed guidance unchanged).
  - Evidence: coordinator `npm run format` logs `/tmp/seed136-format-slice1.log`, `/tmp/seed136-format-slice2.log` and `/tmp/seed136-format-slice3.log`; scripts/lint.mjs lists every tracked/untracked path without --staged. The run enumerated unchanged installed skills, unrelated sources and tests for the owned bundle/fixture changes. All three slice deliveries completed the same required command.
  - Observed effect: delivery waited through repository-wide ESLint, Prettier and shell formatting; no unrelated bytes changed.
  - Inference: the available project command exceeds selective-format intent. This occurrence does not quantify unloaded duration or token cost and does not authorize changing formatting in this story.

- Execution: `SEED-010#triage-project-owned-retrospective-findings` / plan 316, first implementation `95c0af23d9272659a8d79dacb228a542f26d89e8`
  - Timestamp: unknown (2026-10-19 JST, slices 1–3 delivery).
  - Tool: Codex
  - Open Dough release: 0.3.64 (checkout-bound installed VERSION at claim `ed38588d`; installed execution/refactor guidance unchanged).
  - Evidence: `95c0af23:.planning/slice-plans/316-triage-project-findings/EXECUTION.md` delivery preparation, `4636b764` same path slice-2 preparation, and `6c7f316d:.planning/slice-plans/316-triage-project-findings/DELIVERY.md` acceptance/preparation record each passed `npm run format` without additional edits. `scripts/lint.mjs` at `6c7f316d` selects every tracked/untracked script and JSON file plus shell scripts; Markdown is outside those formatter selections.
  - Observed effect: three repository-wide formatter runs, including the two Markdown-only implementation increments; delivery waited for unchanged unrelated script checks and no formatter edit resulted.
  - Inference: the available command exceeds the workflow's selective-format intent. No elapsed-time or token-cost estimate is asserted; changing formatting is outside this story.

- Execution: `SEED-010#exchange-retrospective-findings-with-another-project` / plan 317, first implementation `6222747bc602a10c1ed833bc0d128e61ec2b005f`
  - Timestamp: unknown (2026-10-19 JST, three slice deliveries).
  - Tool: Codex
  - Open Dough release: 0.3.64 (checkout-bound installed dough-update/VERSION at claim `ae9e5d4f`; installed execution/refactor guidance unchanged; internal candidate guidance modified).
  - Evidence: coordinator format receipts and `/tmp/open-dough-317-format-slice1.log`, `format-slice2.log` and `format-slice3.log` (same prefix) record four whole-command attempts: first slice twice after mechanical ShellCheck repair, then once per later slice. `scripts/lint.mjs` selects all tracked/untracked scripts and JSON plus shell paths; logs enumerate unchanged installed skills, unrelated sources and tests. Proof notes at `f492e533:.planning/slice-plans/317-collect-client-feedback/proof/` retain preparation outcomes.
  - Observed effect: each delivery waited through repository-wide ESLint, Prettier and shell checks, including the four-line Markdown policy correction; no unrelated bytes changed.
  - Inference: the available command exceeds the workflow's selective-format intent. No unloaded elapsed time or token cost is asserted, and this story does not authorize changing the formatter.

- Execution: `SEED-010#run-combined-project-and-shared-feedback-cycle` / plan 321, first implementation `f3f2f8aae37dfe83f5778bc6b6f88906c3c4bfcd`
  - Timestamp: unknown
  - Tool: Codex
  - Open Dough release: 0.3.64 (checkout-bound installed dough-update/VERSION at claim `7a7d82ca`; execution/refactor guidance unchanged; new internal wrapper unreleased).
  - Evidence: coordinator terminal receipts record three slice-1 `npm run format` attempts (two ShellCheck annotation failures, then success), and one successful slice-2 attempt. Final passing logs are `/tmp/dough321-format-slice1.log` and `/tmp/dough321-format-slice2.log`; earlier failures are in the coordinator conversation. `scripts/lint.mjs` lists the whole tracked/untracked tree; output enumerated unchanged installed skills and unrelated scripts/JSON.
  - Observed effect: delivery waited for four whole-tree runs; no unrelated bytes changed. The source annotations repaired only the disposable native proof runner.
  - Inference: the project command exceeds selective-format intent, and a mechanical repair repeats that cost. No unloaded duration or total token estimate is asserted; changing the formatter is outside this story.

- Execution: `SEED-141#open-referenced-story-in-dashboard` / plan 320, first implementation `fb09c6340722761096fa539c28e2a905d869e92a`
  - Timestamp: unknown (2026-10-19 JST, first two slice deliveries).
  - Tool: Codex
  - Open Dough release: 0.3.64 (checkout-bound installed dough-update/VERSION at claim `cdd71a2d`; installed guidance unchanged).
  - Evidence: scripts/lint.mjs lists every tracked/untracked script and JSON plus shell paths for npm run format. Coordinator receipts record four whole-command attempts across the first two deliveries, each repeated after mechanical lint repair; retained logs include `/tmp/seed141-slice1-format.log`, `/tmp/seed141-slice2-format.log` and `/tmp/seed141-slice2-format-repaired.log`. `1975b9868a76ff6e4df8e961b27815fce1cd8d45:.planning/slice-plans/320-dashboard-story-references/proof/observations.md` records accepted preparation.
  - Observed effect: both deliveries waited through repository-wide ESLint, Prettier and shell formatting, enumerating unchanged installed skills and unrelated source/tests; no unrelated bytes changed.
  - Inference: the available command exceeds selective-format intent and repeats its broad cost after mechanical repair. Unloaded elapsed time and token cost were not measured; this story does not authorize formatter changes.

**Responsibility and response (2026-10-20):** Project-owned. Seven distinct executions above establish the mismatch between selective delivery and this project's former whole-tree formatter. [Format only the owned change during delivery](https://github.com/terryyin/open-dough/blob/5bb581028f16a5307f4bf4104088d19f1b62d0e9/.planning/seeds/SEED-010-learn-from-execution-retrospectives.md#format-owned-changes) changes `npm run format` to select tracked index/worktree changes and non-ignored new files, with existing ignore filtering before tool selection. `npm run format -- --all` retains whole-tree formatting; ordinary full-tree lint and check-only hooks remain unchanged. The implemented response is recoverable at the revisions below; the first containing release is `v0.3.67` (`578e289a`), which contains both measured formatter revisions. Current `scripts/lint.mjs` retains change-set selection and explicit `--all`; the tagged implementation, rather than the changelog alone, establishes containment. No released guidance or installed skill copy changed. Source recovery: `dae40ae3ed427d6827828b43c4fecc794d60cd85:DearDough.md#dd-309`.

**Measured response:** On 2026-10-20 in `/Users/terryyin/git/open-dough/.worktrees/format-only-the-owned-change-during-delivery`, Markdown measurements used `43ff9dde9762edf400703c2925210383057e8522`; script/shell measurements used `be20c7cd0b30c2a52edce659297c6288cc526e3c`. The intervening CI repair changed only test-support shell-tool availability gating and plan records; the formatter, configs, package manifest and lockfile were identical. Setup was Node 24.21.0, npm 11.19.0, ShellCheck 0.11.0 and shfmt 3.14.0, with checkout-local locked dependencies and `/opt/homebrew/bin` first on PATH.

Each passing pair ran `npm run format` and `npm run format -- --all` once each, serially, from identical prepared bytes. A private observation-only Node preload logged the actual runner's Git listings and tool arguments in both modes; wall time includes that instrumentation. Counts below distinguish Git-listed paths from the union of paths passed to tools; full-tree ESLint/Prettier still apply their own ignores internally. Load is the one-minute average at command start and end; raw evidence also retains five- and fifteen-minute averages.

| Prepared change | Default listed / passed | Full-tree listed / passed | Default wall s; load start → end | Full-tree wall s; load start → end |
| --- | --- | --- | --- | --- |
| Markdown-only: `README.md` | 1 / 0 | 3,525 / 2,752 | 0.173; 11.04 → 11.04 | 88.196; 11.04 → 10.20 |
| Edited `scripts/install-hooks.mjs` plus new `scripts/dd309-measurement-scratch.mjs` | 2 / 2 | 3,526 / 2,753 | 1.846; 14.04 → 14.04 | 86.889; 14.92 → 10.67 |
| Shell: `scripts/test.sh` | 1 / 1 | 3,525 / 2,752 | 0.491; 10.05 → 10.05 | 94.519; 10.52 → 12.75 |

Default selection listed exactly the named paths in each row. Markdown invoked no tool; the script pair passed exactly its two paths to ESLint and Prettier; the shell edit passed only `scripts/test.sh` to ShellCheck and shfmt. Full-tree runs passed 2,330 script paths to ESLint, 2,468 script/JSON paths to Prettier and 284 shell paths to each shell tool; the new-script case added one to the first two counts. All six primary runs exited 0.

Both modes produced identical final bytes in each pair. Markdown changed no bytes. The script pair changed only `scripts/install-hooks.mjs` (1,044 → 1,043 bytes) and the new script (50 → 56 bytes); the shell pair changed only `scripts/test.sh` (9,121 → 9,124 bytes). These are file sizes before/after, not counts of differing byte positions. Complete before/after SHA-256 manifests for every Git-listed regular file and exact scratch-byte snapshots establish matching preconditions, matching outputs and no unrelated byte changes. Scratch files, original bytes and modes were restored, and the checkout was verified clean before this finding was edited.

**Method limits and recovery:** The first shell setup mistakenly appended its block after the script's final `exit`; ShellCheck correctly reported SC2317. That trial exited 1 in 0.450797 s and is excluded from the primary comparison. Its evidence is retained; no invalid full-tree counterpart ran. The corrected pair inserted the same block before the final exit and ran once per mode. Raw evidence and the disposable harness remain at `/tmp/dough-dd309-325-measure.uSvudR`: `markdown-{selective,all}`, `scripts-{selective,all}`, `shell-valid-{selective,all}` and the excluded `shell-selective`. Each contains `metrics.json`, actual listing/tool invocations, NUL-separated path lists, byte manifests/snapshots, stdout/stderr and restoration evidence; `pair-comparisons.json` records equality checks. The harness was invoked as `PATH=/opt/homebrew/bin:$PATH node /tmp/dough-dd309-325-measure.uSvudR/measure.mjs` with each listed scenario/mode pair. The observed response bounds formatter work to the change set while preserving full-tree output. These single loaded-host observations make no unloaded timing or general speedup claim; the containing release is now verified as `v0.3.67`; later usage remains unobserved.
