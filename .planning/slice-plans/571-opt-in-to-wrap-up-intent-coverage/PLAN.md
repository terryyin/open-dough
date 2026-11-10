# Opt in to Intent Coverage during story wrap-up

**Identity:** SEED-294#opt-in-to-intent-coverage-at-wrap-up
**Source:** [Refined story](../../seeds/SEED-294-opt-in-to-wrap-up-intent-coverage.md#opt-in-to-intent-coverage-at-wrap-up)

**Source review:** [Independent commitments](source-review.md)

## Goal and scope

Give a project maintainer explicit control over automatic Intent Coverage effort
at feature-story closure. Read the optional project-owned boolean
`intentCoverage` in `.planning/open-dough.json`; only `true` selects the
automatic check. Missing file/key and `false` skip it. Direct wrap-up and
Execute Plan's authorized continuation consume the same rule. Explicit review
requests remain independent.

Preserve current eligibility, one-check behavior, existing results, scratch
restoration, report storage and nonblocking closure. Invalid configuration
reports a selection error, selects no automatic check, and leaves independent
closure available. Never rewrite configuration or materialize defaults.

Excluded: dashboard configuration editing/inspection, per-story preferences, a new invocation flag,
changing the checker or completion-record schema, installation/release/rollout,
and evaluating the net benefit of routine checking. No product prerequisite is
needed from the separate configuration-view story.

## Existing solution and architecture

PFE: the responsibility is selection of an automatic wrap-up check. Whole-product
searches for Intent Coverage, configuration selection, report storage and closure
continuation found these owners:

- `src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage` owns the
  automatic request. Change that rule in place; Execute Plan's continuation
  already invokes this skill and needs no parallel selector.
- `src/skills/dough-intent-coverage/SKILL.md` owns the targeted check. Reuse it
  unchanged; do not make explicit review requests consult this preference.
- `src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs`
  and the completion CLI own optional reports and unavailable reasons. Reuse
  that contract; a skipped check needs no invented report or new record field.
- Execution retrospective's `Select reviews` already demonstrates agent-read
  project JSON, unknown-key tolerance, untouched configuration, and continuing
  independent work after selection errors. Use that local pattern without
  coupling the two preferences. The CI configuration reader owns CI selection
  and is not a general review-policy owner; no new reader/framework is needed.

Relevant Accepted decisions:

- [ADR 0004 — Client installation and update](../../../docs/adrs/0004-client-installation-and-update-accepted.md):
  one project-owned configuration shared by tools; preserve absence and bytes.
- [ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  one authoritative runtime rule, operating in the established project.
- [ADR 0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md):
  edit source guidance; installed copies change only through a later release.
- [ADR 0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
  use the conventional skill behavior review in [maintainer guidance](../../../AGENTS.md#behavior-review),
  with shared integration mechanisms unchanged. No new native activation,
  installer, updater, or host adaptation is introduced.
- [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md):
  distinguish delivered opt-in control from an unobserved benefit of checking.

The ADR index and in-file statuses agree; no relevant supersession, conflict or
exception was found. `.planning/NORTH-STAR.md` supplies no additional direction
needed for this local policy. No new architectural record or topic is needed.

## Outside-in proof ownership

All source examples belong to slice 1. Use the candidate runtime instructions
as the behavior under review, keeping configuration, story kind and existing
result explicit. Record the selected action and continuation for each case;
these are authoring walkthroughs, not native host execution evidence.

| Source promise | Observable proof in slice 1 |
| --- | --- |
| Default off: missing file, missing key, explicit `false` | Walk direct closure for each input: no automatic request and no required report; walk the planned continuation to that same rule. |
| Explicit `true` for eligible planned or planless feature stories | Walk both story forms with no result: exactly one request to the installed checker; existing report/unavailable handling and closure continuation remain reachable. |
| Preserve a result on repeated closure | Walk either preference with an existing done-record result: retain it and request no duplicate check; reuse the completion regression below. |
| Explicit review request while automatic checking is off | Follow the manual skill's explicit entry directly: the preference adds no gate and requires no configuration edit. |
| Read own configuration and preserve unrelated settings | Walk a project with other keys and a different project's contrary setting: selection uses the established project's boolean; no configuration writes. |
| Invalid configuration does not establish opt-in | Walk an unreadable file, invalid JSON, non-object JSON and non-boolean key: named error, no automatic request, no repair, independent closure continues. |
| Existing corrections/contextual eligibility | Walk enabled correction and contextual closures: continue to assimilation without broadening eligibility. |

Run the existing real completion regressions through the maintained runner:

```sh
PATH="/opt/homebrew/bin:$PATH" npm test -- \
  tests/support/product-backlog-complete-credit.test.mjs \
  tests/support/product-backlog-complete-intent-coverage.test.mjs
```

They observe actual completion with coverage omitted, verbatim/insufficient
reports, unavailable reasons and repeat preservation. They do not prove that an
agent follows the new selection rule; the representative behavior review owns
that proof. Add no exact-wording tests duplicating prose. If implementation
introduces executable policy, give that real boundary discriminating tests
using the shared `makeMe` builders rather than relying on this walkthrough.

## Decisive premises and observations

Observed on 2026-11-10 in this owned preparation checkout at `bfe9f7d87`.
All temporary source edits were restored before writing preparation records.

| Premise / consuming operation | Observation in the consuming form and profile | Result / remainder |
| --- | --- | --- |
| Current eligible wrap-up requests a check even with no preference | Walked the completed-feature/no-result/missing-file case through `src/skills/dough-story-wrap-up/SKILL.md` lines 68–89. No configuration branch precedes its request. Followed `finish-or-stop.md#continue-settled-planned-work-into-wrap-up` into this same skill. | The existing instructions request checking; the symptom and shared owner are established by content review. No native runtime result is claimed. |
| Completion can succeed without coverage and retain supplied results | Ran the literal two-file command above through the real runner: pass. Temporarily changed `intentCoverageError` to reject omitted coverage and ran `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/support/product-backlog-complete-credit.test.mjs`: failed with `Intent Coverage is required`. Restored exact source bytes, reran the two-file command: pass; `git diff --exit-code` was clean before record writes. | Existing proof discriminates mandatory versus optional coverage. Storage changes are unnecessary. |
| Local proof route is available | Initial `npm test` resolved system Bash 3.2 and refused before tests. Selected the already installed Bash 5 with `/opt/homebrew/bin` first on PATH, then ran the commands above successfully. | Execution must use Bash 5+ as required by `tests/native-setup.md`; no installation or timeout change needed. |

## Ordered slices

### 1. Select automatic Intent Coverage from the project's explicit opt-in

Type: Behavior
Status: done
Proof: The source-example walkthrough table, existing completion regressions,
and review of invocation context, required context and useful outcome under
[maintainer guidance](../../../AGENTS.md#behavior-review).

Behavior: Given completed work and the project's current configuration, when
direct wrap-up or its authorized continuation reaches Intent Coverage, request
the existing check only for explicitly enabled, otherwise eligible feature
stories without an existing result. Disabled or unresolved selection leaves
ordinary closure available, and an explicit review request remains independent.

- Change the selection in `src/skills/dough-story-wrap-up/SKILL.md` as one
  concise rule. Keep its report handoff and the later completion instruction
  consistent when the check was skipped. Do not duplicate the rule in Execute
  Plan or the manual skill.
- Document the positive boolean and default beside existing project settings in
  `docs/installation-and-updates.md`; link to the runtime rule for the complete
  contract. Keep documentation about current behavior rather than story history.
- Run the mapped behavior review and focused checks; inspect the consumer trace
  for the changed default with terms `Assess intent coverage`, `Intent Coverage`,
  and `intentCoverage`, including continuation, completion and tests. Record
  dispositions for consumers under the installed execution workflow.
- Perform required post-change refactoring and commit/delivery through
  Dough Execute Plan. Expected edit sizes at preparation: wrap-up skill 250
  lines, configuration documentation 205 lines. No expected file already exceeds
  250; keep the edited guidance concise within that check. New linked runtime
  files, if needed, must have their payload dependencies declared and checked.

This is one policy and proof loop; separating the on/off branches or the
documentation would fragment the same result. No interim behavior or Structure
slice is needed. Scope is bounded without inventing a numeric slice deadline.

## Gates and current decisions

- The current instruction authorizes execution of this established plan; slice 1
  is selected. Existing planning authority is retained for necessary replanning.
- Disabling default automatic checking has no later slice dependency; it is the
  explicit source outcome and leaves the on-demand review path available.
- Author source guidance under `src/skills/`; do not hand-edit managed
  `.agents/skills/` or `.claude/skills/`, or opt this repository into checking.
- Local gates: mapped behavior review, the focused runner command above,
  affected consumer checks if the implementation trace discovers any, and
  ordinary commit hooks. A full repository/dashboard suite is not required by
  this conventional guidance change. For a long run, start fully awake; on AC
  use `caffeinate -s -i`. On battery plug in, or keep the lid open under
  `caffeinate -i` and inspect the sleep log afterwards, following
  [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
- The [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
  applies as written to every local or published-CI failure and repair handoff.
  Required test arrangements use shared `makeMe` builders; no wall-clock sleeps,
  `test.slow()`, or suite/hook timeout overrides.
- Preparation lands without starting an execution observer. Later execution
  owns its applicable delivery/CI gates and repairs through the final verdict.

## Plan concern assessment

Slice-plan refinement was not needed: one cohesive Behavior owns every source
example, its guidance, documentation and proof, with existing storage reused.
This review identified no remaining slice-specific concern. The net benefit of
routine checking remains an evaluation question outside this story, not a
premise needed to implement explicit opt-in control.

## Execution context

- Established story-branch execution: `codex/opt-in-to-intent-coverage-during-story-wrap-up`;
  workspace `/Users/terryyin/git/open-dough/.worktrees/opt-in-to-intent-coverage-during-story-wrap-up`.
- Publisher `dashboard-territory.local-open-dough`; agent `ealden-chan`;
  origin/main claim and previously published base `d5a3da31fe7d93287b74ef0c9b1ffbadd8b41e4c`;
  starting revision `50584725663c6c6ce2e42771d3bc0b3f52c964d8`.
- Setup: exact Node 24.21.0; `node scripts/setup-native.mjs npm`, `browser`,
  and `check` succeeded in this checkout with locked dependencies and Chromium.
  Selective formatter `npm run format`; check-only `.githooks/pre-commit`.
- CI: GitHub `terryyin/open-dough`, workflow `ci.yml` (CI); coordinator `seed294`,
  stream `/tmp/dough-ci-501/watch-VsSlV1`, PID 93290, session 49675, cell `g1005:7`,
  target `codex/opt-in-to-intent-coverage-during-story-wrap-up`, same checkout.
  Trunk claim CI is unobserved; this stream covers execution branch delivery.

## Story obligations

### G1. Active-story coverage copy promises an automatic result
Reported: slice 1 — "Consumer trace found IntentStoryCoverage's active-story view promises an assessment after completion even when automatic checking is off; its existing test and maintained documentation repeat that promise."
Story clause: "A project maintainer controls whether completed feature stories incur an automatic Dough Intent Coverage check during wrap-up."
Disposition: proved by slice 1: `IntentStoryCoverage.tsx` conditional active copy, `intent-story-summary-title.spec.ts` rendered assertion, and maintained `docs/dashboard-development-intent-story.md`; the focused Playwright command below passed.

## Slice 1 implementation proof

Authoring walkthrough on the candidate source, 2026-11-10; these observations
judge instructions, not native-host execution. Invocation remains explicit or
authorized planned continuation; project/root and completed identity are required.
The selection owner is `src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage`.

| Trigger/setup | Expected and observed source-directed result | Observing location |
| --- | --- | --- |
| Eligible completed feature; absent file, absent key, or `false` (each) | Skip automatic check; ordinary completion has no coverage input or required report when none supplied. | Assess intent coverage; Delete spent history; completion CLI optional input. |
| Authorized Execute Plan continuation, each default-off input | Same skip and closure through its existing sole wrap-up invocation. | `finish-or-stop.md#continue-settled-planned-work-into-wrap-up` → Assess intent coverage. |
| `true`, eligible planned story without result; same planless case | One explicit request carries story, optional plan and revision; checker owns scratch restoration; closure continues. | Assess intent coverage; manual skill Choose the check / Run and restore. |
| Existing published result, `true` or `false`; local-only committed result | Preserve result; no duplicate check. | Assess intent coverage; completion repeat regression. |
| Off, developer explicitly requests targeted review; report supplied at closure | Manual entry remains callable without configuration edits; skipped automatic check does not discard supplied report. | Manual skill explicit entry; conditional completion handoff. |
| This project has unrelated keys plus `true`; another project has `false` | Read this project's object; ignore unrelated keys; preserve configuration bytes. | Assess intent coverage's project-owned path and no-write rule. |
| Unreadable file; malformed JSON; array; null; scalar; string/number/null preference | Report file/key error, no coercion or automatic request, no repair; independent closure proceeds. | Assess intent coverage's object/boolean and error branches. |
| Missing file | No creation or materialized default. | Assess intent coverage's skip and no-create instructions. |
| Enabled correction; enabled contextual work | Proceed to assimilation without feature-story checking. | Assess intent coverage eligibility entry. |
| Enabled check returns report, insufficient evidence, unavailable reason, or remains pending | Save report verbatim, including unavailable costs/reasons; pass report/reason and continue without waiting/retrying. | Assess intent coverage handoff; existing completion assertions. |

Focused automated proof, all terminal exit 0:

- `PATH="/opt/homebrew/bin:$PATH" npm test -- tests/support/product-backlog-complete-credit.test.mjs tests/support/product-backlog-complete-intent-coverage.test.mjs`: eight cases through the real completion CLI. Shared MakeMe/scratch-project setup supplies Taken stories and optional reports. Credit assertions observe omitted coverage; coverage assertions observe verbatim/insufficient reports, unavailable reason, repeat bytes and invalid-input preservation.
- `PATH="/opt/homebrew/bin:$PATH" npm test -- src/skills/dough-execute-plan/scripts/planned-wrap-up-continuation-guidance.test.mjs`: instruction contract passes. The first run failed at the invocation regex in the test “settled planned execution invokes its existing closure owner without another instruction”; concise intro had dropped its recognized phrase. Restoring that phrase preserved the contract and the unchanged assertion passed. This is not native continuation proof.
- `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run test:dashboard -- dashboard/tests/intent/intent-story-summary-title.spec.ts dashboard/tests/intent/intent-story-coverage.spec.ts --workers=1`: five rendered cases pass. Shared Take/completion fixtures feed the real pane; final summary-title paragraph assertion observes conditional availability. Coverage spec assertions observe report, unavailable, omission and failed-read/retry states.
- `git diff --check`: passed. No formatter, hook-owned lint, commit, push or done mark performed by implementation.

Consumer discovery: the installed `consumer-trace.mjs --checkout` used this execution
checkout, `--base d5a3da31fe7d93287b74ef0c9b1ffbadd8b41e4c`, and terms
`Assess intent coverage`, `Intent Coverage`, `intentCoverage`, plus retired
`assessment runs during feature story wrap-up`. Full trace and all 786 per-file
dispositions: `/tmp/seed294-consumer-trace-reviewed.md` (16 run, 770 excluded).
Generic plan/skill path hits, unchanged installation contracts, recorded native
streams, historical findings and released installed copies do not consume the
new selection policy. Real completion, explicit checker, continuation, and
rendered optional assessment paths were inspected and mapped to proof above.
G1 exposed inaccurate active-story copy and its maintained description/assertion;
correcting these consumers is necessary reach, not dashboard configuration work.

Rendered proof used this Mac on AC (100%), one worker and `caffeinate -s -i`;
coordinator observed 45% free memory, load 14.48/10.05/8.34 and no owned competing
heavy work. This bounded existing-suite selection passed; reconsider on contention
or failure. No new executable selection policy, test cases, schema or payload files.

Acceptance: freshness was unchanged at trunk `3b45bac31827ed982c7d190a99b41b3f39c2abce`.
Named sibling SEED-295 had no incoming changes. The incoming SEED-258 follow-up
adds future scope only; no product behavior changed. Current proof remains valid.

Independent refactor: none — already clean; all accepted proof unchanged.
Pre-delivery freshness unchanged at `001d6782d7ab8c6cac5190971d9e4534e0180dcc`;
additional trunk edits queue future work only, with no affecting sibling delivery.

## Execution complete

Product advice: no change. Explicit opt-in control matches near-future intent-review
direction; the newly queued SEED-258 work owns later probe completion and usefulness
changes. No correction or new backlog item is needed. Outcome and whole-product
review found coherent selection/check/storage owners and sufficient focused proof;
existing browser journeys and completion tests retain distinct integration coverage.
This was a guidance-first change, not E2E-driven development; no suite consolidation
was justified. Process review recorded ODF-264/ODF-396 recurrences in DearDough.md.
Implementation `92c060c8e` is published; applicable branch CI remains pending.
