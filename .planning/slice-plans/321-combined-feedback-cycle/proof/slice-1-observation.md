# Slice 1 native complete-input observation

Observed on 2026-10-20 with native `codex-cli 0.163.0`, Node `v24.21.0`, prepared
execution checkout and current installed native helpers. Product candidate hashes
are in `complete-candidate-sha256.json`; they remained unchanged during the run.
The native result was assessed from bare-origin state and trace, not its report
or exit status alone. No production inventory, dashboard or repository was used.

## Setup and commands

Literal setup command, exited 0:

```sh
python3 .planning/slice-plans/321-combined-feedback-cycle/proof/setup-complete.py /tmp/dough321-combined-proof/complete
```

`setup-complete.py` creates only raw inputs: Open Dough/main and alpha/master,
real local bare origins, current installed helper runtimes, maintained source
contracts, mixed findings, separate canonical local/shared records, an existing
queued response, Taken work and unrelated queued work. It does no maintenance.
It records initial SHAs, candidate hashes and accepted pushes. The prompt in
`complete-prompt.txt` invokes the skill and supplies locations and authority,
without classifications, expected counts or ranking. Isolation is the existing
`native-codex.sh` profile with the real execution source protected; fixture state
is under `/private/tmp/dough321-combined-proof/complete` and its dedicated parent.

Proof command, terminal exit 0, owned exec session 64842:

```sh
PATH=/opt/homebrew/bin:$PATH bash .planning/slice-plans/321-combined-feedback-cycle/proof/run-native.sh /private/tmp/dough321-combined-proof/complete
```

`run-native.sh` uses the current `tests/support/native-codex.sh` and
`native-run-supervise.sh`, a 1,800-second deadline and 15-second termination grace.
The supervised process completed; no extra watch was created. The first heredoc
attempt in native item_16 was denied by the write-isolation profile's shell temp
location restriction. Native item_18 recovered with `python3 -c`; no product or
isolation rule was changed, and all promised outcomes were subsequently observed.

Terminal stream proof:

```sh
PATH=/opt/homebrew/bin:$PATH node tests/support/native-host-stream.mjs codex .planning/slice-plans/321-combined-feedback-cycle/proof/complete-native.jsonl.gz status
```

Result: `complete`. The retained gzip is the actual native JSONL. The live raw
stream, stderr, terminal exit/outcome and native report remain in the fixture
root. `complete-native-report.md` is a retained copy, not the evaluator.

Raw state capture command, exited 0:

```sh
python3 .planning/slice-plans/321-combined-feedback-cycle/proof/capture-state.py /private/tmp/dough321-combined-proof/complete > .planning/slice-plans/321-combined-feedback-cycle/proof/complete-origin-state.json
```

`capture-state.py` reads each bare origin directly, including accepted commit
history and canonical record bytes. It makes no pass/fail judgment; no new
assessor was introduced. The observations below are manual review of those
records and the trace. Publication evidence is also in
`complete-publication.jsonl`; `complete-publisher.mjs.txt` is the exact native
agent-authored external handoff to installed APIs, retained for inspection.

## Promise mapping and decisive observations

- **Actual contract consumption and phase order:** trace item_1 reads the new
  wrapper and both maintained phase skills; item_3 reads local delivery,
  lifecycle, landing and backlog owners. Item_19 writes local findings and
  reciprocal stories through each target's installed backlog writer. Item_21
  publishes both local results. Only afterward item_23 reads post-local saved
  worktree logs and rechecks the inventory; item_24 retains/reconciles shared
  evidence and adopts approved mappings; item_26 publishes the shared results.
- **Local responsibility and actual canonical locations:** bare-origin
  `notes/ProjectFindings.md` in each repository preserves DD-101, execution,
  timestamp, observed 25-minute effect, original revision, evidence and recovery
  locator. It attributes the wrong status labels to the project implementation
  that contradicts its documented interface. Each new
  `SEED-002#status-interface` links that finding and the finding links back.
  `DearDough.md` retains the distinct shared guidance facets. No status
  implementation change was published.
- **Shared consumption and local-story preservation:** accepted Open Dough
  ODF-001 contains exactly the two supplied project/execution identities and
  78-minute total, with G1 untagged provenance qualified. ODF-003 retains the
  one consequential publication execution. Both source logs adopt ODF-001 with
  one former-DD-102 alias; Open Dough also adopts ODF-003 with one former-DD-103
  alias. Local DD-101 stories remain once in both queues after these edits.
  Open Dough final order is `SEED-003#publication-adoption`, existing
  `SEED-001#reuse-checks`, local `SEED-002#status-interface`, unrelated
  `SEED-001#unrelated`. Taken membership and direction remain unchanged.
- **Reuse rather than duplicate implementation:** the native assessment found
  isolation already present in maintained guidance. It queued bounded adoption
  and outcome proof for ODF-003, reused ODF-001's covering queued response, and
  preserved the ODF-002 Taken response. Missing release/adoption/exposure was
  retained explicitly; no watch passed or finding retired.
- **Evidence retention before source adoption:** Open Dough commit
  `12179d8f8afd860f11c782c40d8501b9e82584ee` saves shared occurrence evidence and
  reciprocal priorities before source adoption's subsequent commit. Trace
  item_24 hashes both source logs during reconciliation and commits retention
  before adopting names. Final canonical contents and ancestry agree.
- **Both publication stages:** inspect `complete-origin-state.json` per-project
  `commits`, `records` and `accepted`, plus `complete-publication.jsonl`'s four
  beforePush candidate/suffixBase pairs. The native publisher imports each
  target's installed `publishExecutionIncrement`, `checkQueuedClosures` and
  refresh helper. It does not copy reconciliation or call an ad hoc push.

| Project/target | Local result accepted | Later shared result accepted |
| --- | --- | --- |
| Open Dough, origin refs/heads/main | `78f8eae3ff453c5de7775474cc19a5dc52ea2ea9` | `315b9e5722a10a3f58870796caa4b9c35abcb31c` |
| alpha, origin refs/heads/master | `ce5e6dfceec6a009e09ef9baa217a557921b3f08` | `41ea1c532e0bb1dfca732323caf515942fb7ee33` |

Each later SHA is descended from its accepted local SHA; the final alpha commit
changes the adopted source log, and Open Dough's later suffix changes catalog
owners, shared story/queue and adopted log. A local SHA alone would miss those
accepted shared edits.

- **Stale default handling, refresh and retirement:** the fixture omits a
  worktree ignore entry, so both local and shared publications were accepted
  while default refresh was `deferred/pending-edit` for the untracked owned
  worktree directories. Shared consumption uses the saved owned worktrees,
  not stale default files. `complete-context.json` retains those distinct
  outcomes. Item_28 retires the clean owned worktrees via target-installed
  retirement; item_29 then refreshes each default. Item_30 fetches, checks exact
  accepted ancestry and ls-remote, verifies clean default HEAD and absent owned
  worktree. An independent final inspection confirmed the same current default
  HEADs, empty porcelain status and only each default in worktree inventory.

## Other focused proof and review

Both commands exited 0 and printed `Skill is valid!`:

```sh
python3 /Users/terryyin/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/maintain-feedback-cycle
python3 /Users/terryyin/.codex/skills/.system/skill-creator/scripts/quick_validate.py .claude/skills/maintain-feedback-cycle
```

`bash -n .planning/slice-plans/321-combined-feedback-cycle/proof/run-native.sh`
and `git diff --check` exited 0. Relative file links in the wrapper, pointer and
runbook were resolved and inspected. These are naming/link/whitespace checks,
not native behavior proof. `behavior-review.md` supplies AGENTS.md invocation,
required-context, useful-outcome and consequential-conflict walkthroughs.

## Explicit remaining limits

This proves one complete-input Codex journey and the maintained-source to
selected-project installed-helper handoff, including later shared publication.
It does not prove interruption recovery, unavailable local input/helper handling,
retarget/removal/addition behavior, preserved unrelated private/default work,
unchanged repeat idempotence or supplied dashboard completion. Those remain
slice-2 promises. Missing-input and consequential-conflict branches received the
source walkthrough only. No Cursor or Claude native run was attempted; the
ordinary thin pointer reuses established discovery and makes no new host claim.
No installer, release, dashboard or phase-owner implementation changed.
