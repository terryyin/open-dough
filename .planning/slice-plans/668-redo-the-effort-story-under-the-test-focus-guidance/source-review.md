# Source-only review after the accepted brief omission

Launch: Codex `collaboration.spawn_agent`, `/root/source_review_skip_brief`,
`fork_turns: none`, 2026-11-17. Actual launch/input and numbered return are
retained in this conversation. The reviewer read only the selected source
section, lines 14–185, including Terry’s “Okay, you can skip it and continue.”
It received no plan, product, proof, prior review or suspected omission, and
changed nothing. The preceding review and its accepted observations remain in
[source-review-before-skip.md](source-review-before-skip.md); earlier reviews
remain linked there. Unchanged evidence can be reused at its matching boundary.

Common to P04/P05/P06/P08: quote the observed moment from B/P brief, return,
diff or plan; keep/revise/remove with reason and failed wording for revise.
A moment that never occurs is not exercised, subject to the source’s exception
for guidance read that changed nothing. These are assessment promises, not
promises that the tested guidance must succeed. P07 is the accepted exception.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P01 | Produce B’s historical execution replay using one fresh Codex session and its recorded configured model and effort, executing the effort plan as it stood at A’s Take through its execution-complete record, subject to the unrelated-failure case below and the accepted retrospective deviation. (Lines 54–63) |  | G1 |
| P02 | Produce P’s planning replay: a fresh Codex session slice-plans the refined effort story at `0e6b0f3dc`, with its existing plan removed and the guidance patch applied. The resulting plan is available to read. (Lines 89–93) | slice 5 | observed: planning-replay.md: final six-slice plan read; fresh Codex thread, historical refined base/removed plan/patch, terminal exit 0 and unexecuted plan retained |
| P03 | Retain the refused Claude attempt. This is separate from the deferred matched Claude replay. (Lines 54–59) | slice 6 | observed: execution-observations.md: original Claude trust refusal retained; b and b-remote.git still present at acceptance, separate from b-codex and p-codex |
| P04 | Assess the shotgun-surgery edit at the slice 1 refactor encounter with tests edited outside effort’s subject. Returning `none — already clean` or accepting those tests as asserting the concept leads to revise, with the relied-on sentence. Loosening what fits and returning the remainder as the specified follow-up, carried into learnings, leads to keep. If the implementer already narrows the tests and no outside-subject edits reach the pass, record not exercised. (Table line 33; lines 95–99, 146–152, 156–158) | slice 6 | observed: guidance-result.md#edit-1--shotgun-surgery-keep-within-the-observed-refactor: keep with quoted B refactor return and inspected actual-command reader; eight incidental backend specs narrowed, mixed cases explicit; no oversized remainder claimed |
| P05 | Assess the test-assertion edit—assertions match their names, one reader in support, branching parameterized bodies become separate tests—using newly written assertions and subsequent refactor behavior. Exact-value updates required by the historical plan do not alone count against it. The example where the implementer narrows the nine specs before refactoring yields keep. (Table line 34; lines 95–99, 119–123, 142–145, 156–158) | slice 6 | observed: guidance-result.md#edit-2--named-behavior-shared-reader-separate-cases-keep-with-limits: keep with reader and separate absence case, new assertion inventory, residual mixed assertions and inherited-plan value updates qualified |
| P06 | Assess the named-follow-up edit at the refactor return and its carry into the plan’s completion learnings. The rejection example above yields revise with the relied-on sentence. A returned follow-up naming smell, concept, file count and representative files, carried in learnings, yields keep with the quoted return. If narrowing beforehand removes the encounter, record not exercised. (Table line 35; lines 95–99, 146–152, 156–158) | slice 6 | observed: guidance-result.md#edit-3--named-oversized-follow-up-not-exercised-in-the-returned-outcome: quoted final return and completion learnings identify no oversized candidate; conditional handling untested, no claim about encrypted intermediate analysis |
| P07 | Record edit 4, the factual refactor-brief edit, as **unassessed** because the original B brief is unavailable. Omit its wording assessment and keep/revise/remove verdict, and do not claim its moment was not exercised. (Lines 112–115; supersedes assessment examples at lines 153–155) |  | G3 |
| P08 | Assess the planning edit at P’s slice planning. A plan again treating the consumers as a mechanical slice 1 update yields revise; a plan opening with a Structure slice that narrows them yields keep. (Table line 37; lines 89–99, 159–161) | slice 6 | observed: guidance-result.md#edit-5--structure-before-changing-the-default-keep-for-planning: keep with P Structure slice 2 quote immediately before default Behavior slice 3; first slice is independent native probe, plan unexecuted |
| P09 | Report the tests edited outside effort’s subject and, for each, whether it was loosened or had its value updated. Classify the historical plan’s prescribed exact-argv updates as updated values following that plan. (Lines 101–102, 119–123, 142–145) | slice 3 | observed: test-inventory.md#outside-effort-cases-and-mixed-cases: every changed incidental/mixed spec classified L/V; original case purpose, historical-plan instructions and support reach inspected |
| P10 | Report the positional, count, whole-list and whole-object assertions added by the run. These are categories of one assertion inventory. (Line 103) | slice 3 | observed: test-inventory.md#addedreplaced-assertion-shapes-obligations-912: positional/count/whole-list/whole-object additions and retained substitutions separately inventoried from frozen A/B source |
| P11 | Report parameterized tests whose bodies branch on the case. (Line 104) | slice 3 | observed: test-inventory.md#case-dependent-branching-obligation-13: changed parameterized bodies/conditional expressions and unchanged model-display family inspected; support branches separated |
| P12 | Put B’s active time beside A’s using one stated transcript definition, where both hosts expose the timing needed for that definition. (Lines 49–52, 105–106) | slice 4 | observed: refactor-and-metrics.md#common-time-proxy--obligations-1416: common blocking-span proxy measured; actual comparable active-work minutes unavailable due to async idle; roots and overlapping child sums separate |
| P13 | Report token usage using each provider’s own recorded billing basis. (Lines 105–108) | slice 4 | observed: refactor-and-metrics.md#provider-usage-and-cost: deduplicated Claude usage and disjoint Codex own response IDs checked against per-thread cumulative counters |
| P14 | Report cost using each provider’s own recorded billing basis; explicitly record unavailable cost when missing. Do not derive Codex cost from Claude token prices. (Lines 105–108) | slice 4 | observed: refactor-and-metrics.md#provider-usage-and-cost: supplied Claude rates yield visible subtotal only; exact scoped A bill and B USD unavailable; P USD unavailable in planning-replay.md; no cross-provider price conversion |
| P15 | Record the effective host, model, effort and memory/context differences between the runs. Do not represent Claude settings or memory as equivalent to Codex’s configured defaults. (Lines 56–57, 80–83, 127–132) | slice 6 | observed: guidance-result.md#context-measurements-and-remaining-limits: launched host/model/effort and ordinary Codex context versus Claude memory recorded without parity claim |
| P16 | Name observed moments that the host/model/context differences could explain, preserving the limit on attributing A/B differences to the guidance alone. (Lines 127–132) | slice 6 | observed: guidance-result.md#context-measurements-and-remaining-limits: reader choice, separate absence case and Structure plan named as moments host/model/context could explain; no guidance-only effect size |
| P17 | Retain B’s extra retrospective in the result as an observed protocol deviation. (Lines 116–118) |  | G2 |
| P18 | Pin the product/test proof before that retrospective. (Lines 117–118) | slice 6 | observed: test-inventory.md and refactor-and-metrics.md: B product/test cutoff 8b9005acc precedes extra retrospective; 57f805ee2 differs only in eight plan lines |
| P19 | Separate that retrospective’s timing and usage from the execution evidence. (Lines 117–118) | slice 6 | observed: refactor-and-metrics.md: extra retrospective 14:38:18.047–14:40:14.840 UTC separately timed and allocated 746715 input/2068 output, with boundary assignment explicit |
| P20 | If B stops on a failure unrelated to the guidance, report how far it reached and classify edits whose moments lie beyond that point as not exercised. The stated failure policy governs the failure. (Lines 162–164) | slice 1 | observed: execution-observations.md and b-codex-terminal-proof.json: Codex B completed exit 0; unrelated-stop branch not triggered; earlier Claude refusal and authorized retry remain G1 provenance |

## Unnumbered context returned by the reviewer

- Purpose: evidence/recommendations for Terry’s release decision; Terry revises
  guidance afterwards. A is a historical baseline only and is not rerun.
- B conditions: historical Take, only patch 934a51a30 in both installed roots;
  no wholesale installation. Codex is a second changed factor across hosts.
- Information: adapted original instruction and scratch refs; no dashboard or
  publication authority, seed, A result, later repair or comparison/amendment
  disclosure; bounded history, Codex invocation and installed scratch skill.
- Containment: local scratch remote/gates, no hosted CI or added paid native
  run; intended stop before wrap-up/retrospective/landing. Accepted amendment
  retains the extra retrospective deviation and prohibits a rerun to erase it.
- Exact-value updates follow the inherited plan; alone they count against no
  edit. Loosening shows guidance prevailing over that instruction.
- Single runs do not isolate guidance from variation. Traced moments support
  recommendations; counts/time/cost give no effect size. Copying Claude memory
  for the refused launch does not prove Codex loaded it.
- Matched Claude execution/planning remains deferred pending trust. P execution,
  variance/repetition, A rerun and A-only refactor replay remain deferred.
- Direction/option comparison, historical same-host assumption, trial analogy
  and estimates explain method without adding promises; Codex supersedes the
  same-host assumption.
