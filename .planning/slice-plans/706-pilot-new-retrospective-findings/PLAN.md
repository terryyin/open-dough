# Freeze the first-report trial wording against historical findings

**Source:** [Freeze the first-report trial wording](../../seeds/SEED-401-retrospective-finding-pilots.md#pilot-new-retrospective-findings)
**Source review:** [source-only commitments](source-review.md)
**Identity:** SEED-401#pilot-new-retrospective-findings
**Split:** slices 2–4 moved after slice 1 to [SEED-401#assess-new-retrospective-findings-pilot](../709-assess-new-retrospective-findings-pilot/PLAN.md) as its slices 1–3.

## Goal and scope

A retrospective reviewer can finish routine work quietly and still bring a consequential first observation to a maintainer who can use it. Prepare one question for the point where an enabled process review has evidence for a possible new finding, before the writer allocates an ID or gathers row metadata. Check it against historical first reports and freeze it for the [ordinary-work assessment](../709-assess-new-retrospective-findings-pilot/PLAN.md).

Use the [shared comparison](../../seeds/SEED-401-retrospective-finding-pilots.md#pilot-comparison) for Doughnut and Pygardon. Terry Talks provides historical controls. Existing matching, repeat recording, required project reports, allocation, retention, triage authority and any immediate incident response keep their existing owners. Wider adoption belongs to a later decision.

## Basis for the trial

| What execution needs | Preparation observation on 18 November 2026 |
| --- | --- |
| A common starting rule and a place to try one change | At Doughnut `a23441f74` and Pygardon `7da34fc73`, `git show <rev>:.agents/skills/dough-update/VERSION` returned 0.3.106. The installed Codex/Cursor recording reference in both and this checkout’s Distribution source at `db341470a` resolve to blob `49de76bfe`. Its text admits supported one-offs and practices. Both project configs enable process review. The [ordinary selection](../../../Distribution/src/skills/dough-execution-retrospective/SKILL.md#select-reviews) can skip it or [defer it to wrap-up](../../../Distribution/src/skills/dough-execute-plan/references/deferred-process-review.md). Check the actual host, revision, selection and route for every sampled execution. |
| A first reviewer’s evidence can be separated from later knowledge | In Doughnut, `git show 1a852ab455:.planning/slice-plans/071-agent-note-candidates-and-cited-reads/PLAN.md` reports the stale bundle and a possible silent false pass. Retirement at `9e98f0874d` adds the repaired behavior under stale and missing bundles. In Pygardon, `git show d82903415:.planning/slice-plans/382-production-native-crash-monitoring/REPLACEMENT-INCIDENT.md` reports a 174.31-second mount with possible writes unassessed. Later fixture proof does not resolve those writes. The seed links the records for both views. |
| A local number alone can select the wrong historical input | `git show a47436046:DearDough.md` in Pygardon identifies DD-269 as four restores in the pinned-script execution. `git show 23a91623e:DearDough.md` identifies another DD-269 about a changed function signature. Match each historical packet to its project, execution, mechanism and revision. |
| A sample can be drawn without starting from findings | At the seed’s pinned snapshots, `git log -1 --diff-filter=A --name-only <rev> -- '.planning/done/*.json'` located Doughnut `c8a19278f9` and Pygardon `3cfe47670`. Reading each newly added done record recovered a story, completion time and host. Reading the deleted plan in each closing commit’s parent recovered its execution-complete record. These demonstrate the selection and recovery route. A done record alone cannot establish that a process review ran or that it recorded everything. |

## Ordered slices

### 1. A reviewer can apply the candidate to a first observation

Type: Behavior
Status: done

Prepare one invocation-scoped version of the [recording rule](../../../Distribution/src/skills/dough-execution-retrospective/references/process-finding-recording.md). The question is “What future decision could this observation change?” A supported choice beyond accepting this execution’s own proof takes the ordinary new-finding path. Keep a routine observation with its execution proof. Qualification can come from a consequence, a credible near miss, a practice with a named new use, or evidence bearing on an open question. A known fix, cost or repeat is unnecessary. Use ordinary matching to distinguish a known finding before deciding to mint anything. Keep the trial wording with the plan and pin it for both projects so an unrelated client update cannot enroll anyone.

**Proof.** Run current and candidate reviewers separately on matched copies of the same historical inputs, with the same project context, starting log, host/model and pinned guidance except for first-report admission. Supply the evidence knowable at review. Withhold the original admission, finding labels, seed verdicts and later repairs until both decisions are fixed. Inspect the proposed entry or unchanged log and the decision it supports. Check the seed’s stale bundle, pinned scripts, wrong mount, break checks and three revision-qualified Terry Talks reports. Include a quiet execution and an already-matched observation as boundary controls. For a supported open question, check whether the reviewer preserves the observed fact and the uncertainty. Compare decisions with later evidence only afterwards. Label this replay exploratory. A consequential miss corrects the wording before fresh exposure. Freeze the revised wording, baseline, sampling rule and criteria before opening fresh findings. At that point check how each participating ordinary review can receive the pinned instruction before its recording decision. Confirm exposure from the executing reviewer’s invocation or transcript. If a project has no authorized participating review, count that limit and proceed with the independently selected sample.

#### Frozen trial

- **Wording.** [trial-wording.md](../709-assess-new-retrospective-findings-pilot/trial-wording.md), Git blob `e114ab467d71183873dd4217e4ed52565785d781`. The exploratory replay of nine packets (seven seed cases and two controls, each in both arms) found no consequential miss, so the wording is unrevised.
- **Baseline.** Recording reference blob `49de76bfe`. Starting trunks are Doughnut `a23441f741486ea5bde7e892038ba33b408d78a4` and Pygardon `7da34fc73a4993ea6008e0966d42920476b79a4c`. These were read without fetching from the local `origin/main` of each clone on 18 November 2026.
- **Sampling.** As set out in the assessment plan’s [ordinary-work protocol](../709-assess-new-retrospective-findings-pilot/PLAN.md#ordinary-work-protocol). The seven-day window starts when this wording lands on trunk.
- **Criteria.** As in the seed's [Decision](../../seeds/SEED-401-retrospective-finding-pilots.md#assess-new-retrospective-findings-pilot) and [shared comparison](../../seeds/SEED-401-retrospective-finding-pilots.md#pilot-comparison).
- **Route.** Both clients install the base blob. Doughnut installs it under `.agents/skills/`. Pygardon installs it under both `.agents/skills/` and `.claude/skills/`. In the developer's authorized session, the developer gives one instruction for that review only: apply the pinned trial wording in place of the sentence it names. The instruction goes at `dough-execution-retrospective` when process review runs there. When process review is deferred, it goes at `dough-story-wrap-up` "Complete a deferred process review", before that review's recording decision. Paste the wording, or cite it by this blob from the landed Open Dough trunk. Confirm exposure from the executing reviewer's transcript.
- **Replay result.** Exploratory, on one model with 18 isolated reviewers. Both arms made the same decision in all nine packets: the six seed incidents and practices recorded, the quiet control unchanged, the matched control given one row under DD-246. Writer effort: current arm 474,280 tokens, 43 tool calls and 429.5 s; candidate arm 470,635 tokens, 41 tool calls and 452.2 s. Neither difference exceeds run-to-run noise. Six packets carry neutral notes rebuilt from the original entries’ evidence lines, and the wrong-mount packet had no execution identity, so neither arm could write a countable row.
- **Replay limit.** The candidate admitted the break checks under a use the reviewer named, which bears on the ODF-147 response. A routine entry was therefore not avoided. The ordinary-work assessment weighs this as its G1.

## Current decisions and gates

- The first-report decision belongs with the existing recording rule. The [bounded log](../../../Distribution/src/skills/dough-execution-retrospective/references/bounded-process-log.md) ranks material only when a supported write would exceed the ceiling or the log is already oversized. Project and shared triage act after the write. Reusing those downstream checks alone cannot save writing the original entry. Keep the project obligations and repeat decisions fixed in both arms.
- Use the [maintainer behavior review](../../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review) for the candidate. The bounded trial uses existing execution proof and the pilot assessment. Preserve its disposition and decisive evidence at wrap-up. A shared release or client rollout requires a separate decision under [ADR 0003, Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md).
- Local gates are each slice’s representative review or evidence walk and `git diff --check`. Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md). If a long full run becomes necessary on macOS, start fully awake on AC with `caffeinate -s -i`. On battery, plug in or keep the lid open with `caffeinate -i` and inspect the sleep log afterwards. [Machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
- Budget 15 active minutes per slice. Elapsed exposure to ordinary work is a separate measurement. Slice-plan refinement was unnecessary. No remaining slice-specific design or proof concern was identified. Actual first-report opportunities and savings are outcomes the trial measures.

## Story obligations

### G1. Candidate admitted the break checks (first reported in slice 1)
Reported: slice 1 — "For DD-443, arm B named a distinct future use (evidence on the ODF-147 response) and admitted the entry, which later triage pruned. The routine entry was not avoided."
Story clause: "Freeze the wording with its baseline and criteria so the [ordinary-work assessment](#assess-new-retrospective-findings-pilot) can expose it unchanged."
Disposition: owner changed "Whether the candidate reduces routine entries and combined work in ordinary use belongs to the [ordinary-work assessment](#assess-new-retrospective-findings-pilot)."
