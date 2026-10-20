# Finish landing and wrap-up without routine attention

**Identity:** SEED-145#quiet-land-and-wrap-up
**Source:** [Refined story](../../seeds/SEED-145-no-news-is-good-news.md#quiet-land-and-wrap-up).

## Goal and scope

After Dough Land or Story Wrap Up verifies its required operations, leave no
routine success message or acknowledgement task. Recorded findings and follow-ups
whose dispositions are settled do not themselves require attention. Preserve
actionable exceptions, explicit detail/review requests, every completion gate,
and the supplied dashboard's explicit final reporting operation.

This plan changes the shared guidance and its consuming response checks together.
Preparation reporting, execution/retrospective handoffs, prominent attention
styling, automatic wrap-up, dashboard filtering, new state/schema, and release
rollout remain outside the selected story. Do not edit installed managed copies.

## Current decisions and existing solutions

- **PFE:** Change
  `src/skills/dough-land/references/completion-attention.md`, the existing owner
  used by both closing skills. Align Wrap Up's Report section,
  `dough-story-wrap-up/references/follow-up-disposition.md`, and
  `dough-execution-retrospective/references/process-review-of-a-run.md` where they
  currently require banners or reminders. The latter is the Land/Wrap Up
  `--process-retrospective` helper; this does not expand into standalone
  retrospective reporting. Keep callers linked to one rule.
- Reuse `dough-land/references/dashboard-completion.md` and the installed
  completion command. The existing outcome plus optional message expresses
  quiet success, completed-with-attention, and unfinished work. No new receiver
  classifier or attention taxonomy is justified.
- Follow the response effect through `tests/support/closure-native-response.sh`
  into both Story Branch and Trunk closure observers/assessors and their
  counterexamples/substitute responses. A mandatory marker is an affected
  consumer, not evidence of successful operations. Keep real Git, CI,
  shutdown, and retirement observations decisive. Do not rewrite historical
  native transcripts to present them as new acceptance.
- Preserve requested details and the minimum native response a host requires.
  Remove the product's mandatory success banner, not the independent
  observation of whether required operations completed.
- Use [maintainer guidance](../../../AGENTS.md)'s representative behavior review.
  [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) distinguishes
  deterministic checks and native behavior. A conventional shared guidance edit
  adds no routine host-discovery run. Review the same requirements for Codex,
  Cursor, and Claude Code; keep any native requirement whose evidence is actually
  invalidated explicit and assign it under that ADR rather than claiming these
  local substitutes prove native agent compliance.
- [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md) preserves human choices;
  [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  supports the existing domain meaning and smallest solution;
  [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) keeps
  source edits separate from released installations; and
  [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  keeps one runtime rule written for the executing project.
  The existing [North Star: agent launch](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment)
  already separates local session disposition from product state. No new topic
  or ADR is needed.

## Decisive premises observed during preparation

Observations ran on 2026-10-20 in the established preparation checkout
`/Users/terryyin/git/open-dough/.worktrees/finish-landing-and-wrap-up-silently-when-no-deve`,
source base `c4c239cdf9acd720361191b1b8cc467a6d4261a3`.
All scratch source changes were restored before preparation records were written.

| Premise and consuming operation | Literal observation and result |
| --- | --- |
| Existing guidance makes settled records noisy | `node --test src/skills/dough-land/scripts/completion-attention-guidance.test.mjs src/skills/dough-land/scripts/process-retrospective-guidance.test.mjs` passed 6 checks. Inspection of their assertions confirms they require the finding-ID reminder and retired-checkout landing statement. These are structure checks, not native compliance proof. |
| Existing reporting can complete a quiet landed session | `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- dashboard/tests/agent-completion-quiet.spec.ts --grep 'Land retires' --workers=1` passed. The journey reaches real fixture Git publication/retirement, installed reporting, stored receipt/Done, browser display, and no attention message. Native/CI transports are substitutes. |
| That dashboard proof discriminates completion from a receipt alone | Temporarily invert the `completedWithoutAttention(report)` guard in `dashboard/server/completionClosure.ts`, then run the same command. It failed at `agent-completion-quiet.spec.ts:102`: `doneAt` was undefined instead of the receipt time. Restore the source. This settles the proof's claim about local Done, not agent wording. |
| The shared response assessor must change when the banner is removed | The command below feeds otherwise valid closure observations through `story_closure_assess`. Empty response was rejected; marker response was accepted; failed CI with the marker was rejected. Thus response alignment is necessary and the operational gate must survive it. |

Reproducible assessor observation (temporary files only):

```bash
bash <<'BASH'
source tests/support/story-branch-closure-native-assess.sh
source tests/support/story-branch-closure-native-counterexamples.sh
probe=$(mktemp -d .quiet-closure-probe.XXXXXX)
trap 'rm -rf -- "${probe}"' EXIT
: > "${probe}/response"
story_closure_write_assessor_observation "${probe}/empty" "${probe}/response"
if story_closure_assess "${probe}/empty"; then echo accepted; else echo rejected; fi
printf '%s\n' '## STORY WRAP-UP COMPLETE' > "${probe}/response"
story_closure_write_assessor_observation "${probe}/marker" "${probe}/response"
if story_closure_assess "${probe}/marker"; then echo accepted; else echo rejected; fi
sed 's/trunk-coverage-state: success/trunk-coverage-state: failed/' \
  "${probe}/marker" > "${probe}/failed-ci"
if story_closure_assess "${probe}/failed-ci"; then echo accepted; else echo rejected; fi
BASH
```

Local runner prerequisites were observed: the owned checkout needed `npm ci
--ignore-scripts --no-audit --no-fund`; the shell runner requires Bash 5, available
at `/opt/homebrew/bin/bash`. Clear inherited color variables for the dashboard's
output-sensitive reporter. A grep anchored at `^Land` selects no Playwright test;
the unanchored title above selects the actual journey.
`PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/git-publication-native.sh
tests/git-publication-native-owned-context.sh` then passed. This observes the
credential-free runner route, including the current closure assessor and
substitute consumers; it does not run paid native sessions.

## Outside-in proof ownership

All promises belong to slice 1, one closure behavior:

| Promise | Observable proof |
| --- | --- |
| Settled closure is quiet, including finding IDs, queued/dropped follow-ups, verified retirement and already-absent resources | Walk both supplied cases through the revised Land/Wrap Up instructions, following every linked reporting rule. Show the attention judgment and final response/report arguments. No routine message, banner, or acknowledgement request remains. Repeat as direct use without dashboard context. |
| Human decisions and incomplete required operations remain visible | Walk missing follow-up input, unresolved product advice, failed publication, unconfirmed CI/shutdown, partial retirement, deferred refresh, and failed requested review recording. Each identifies the actual consequence and next action, preserves recovery, and cannot claim an unfinished closure complete. Requested details/review remain honored. |
| Removing the banner does not manufacture success | Extend the shared response assessor's counterexamples: quiet output with valid operational facts passes; the same output with failed/missing CI, shutdown, retirement, or required attention fails. Keep paraphrased useful attention accepted and routine success recaps rejected. Cover both closure consumers through their existing credential-free suite. |
| Dashboard quiet completion reaches Done, while attention remains readable and recovery retries only reporting | Reuse the installed-reporting journeys in `agent-completion-quiet.spec.ts`, `agent-completion-attention.spec.ts`, and `agent-completion-recovery.spec.ts`; inspect the exact command selection in the guidance walkthrough. Existing receipt, attention, retained-work, and retry behavior stays intact. |
| Required operational records and cross-tool meaning survive | Review record-writing and publication steps independently from final wording; examine shared instructions and response extraction for all three hosts. Assess any native proof reuse honestly under ADR 0005. Historical session workspace paths alone create no new failure. |

## Ordered slices

### 1. Close settled work quietly while preserving actionable exceptions
Type: Behavior
Status: planned
Proof: The table above, the representative skill review required by
[AGENTS.md](../../../AGENTS.md#behavior-review), and focused consumer checks below.

Behavior: Given an authorized Land or Wrap Up whose required operations and
follow-up dispositions have settled, when it finishes, the developer has no
routine response or acknowledgement task; supplied dashboard context receives
quiet completion and its matching receipt. If a decision, failure, or unfinished
required operation remains, the same boundary produces the useful exception
and retains its recovery context.

Update the shared rule, its contradictory callers, and maintained response
assessors/substitutes as one change. Retain operation gates and the exact
reporting-only recovery contract. Search current banner/reminder consumers
again before editing; their filenames are starting points, not a scope boundary.
Do not implement a dashboard change unless a concrete observation reveals a gap
in this same promise; contrary evidence changes this plan before that work.

After independent post-change refactoring, run:

```sh
node --test src/skills/dough-land/scripts/completion-attention-guidance.test.mjs \
  src/skills/dough-land/scripts/process-retrospective-guidance.test.mjs
PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh \
  tests/git-publication-native.sh tests/git-publication-native-owned-context.sh
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- \
  dashboard/tests/agent-completion-quiet.spec.ts \
  dashboard/tests/agent-completion-attention.spec.ts \
  dashboard/tests/agent-completion-recovery.spec.ts --workers=1
```

Use the executing machine's Bash 5 path when different. These checks cover the
changed response contract's distributed consumers and preserved reporting
boundary; they are not a blanket local CI requirement. Adjust affected
guidance assertions to test the intended contract without pinning incidental
wording. Hosted checks remain owned by execution's ordinary CI workflow.

Acceptance also requires the invocation/required-context/useful-outcome review
and the proof-reuse judgment above. Deterministic green tests alone cannot stand
in for that review. Record evidence and any uncovered promise in this plan.
Then use the ordinary execution refactoring, delivery, retrospective and
closure gates; this preparation grants no execution authority.

## Cumulative design and sizing

One attention judgment owns both direct and dashboard closure. Banners,
finding reminders, and follow-up reminders are conflicting applications of that
same rule, so separating them would leave intermediate contradictions.
The existing transport needs no new layer or Structure slice. One Behavior
slice contains the shared instruction change and its response consumers, with
one acceptance loop; no numeric slice limit was supplied.

## Learnings

The dashboard already represents quiet completion; the visible regression
comes from contradictory guidance. Removing only the final recap would leave
finding reminders and the mandatory banner active. Removing the banner alone
would also break maintained closure assessment. Keep these consumers coherent.
