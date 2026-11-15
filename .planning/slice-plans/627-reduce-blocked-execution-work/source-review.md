# Independent source review

Launch: `/root/reproduction_source_review`, `fork_turns:none`.

Input was limited to the Goal, Scope, Key examples, and Evaluation and stopping rule sections of `SEED-356-reduce-blocked-execution-effort.md`, between `#### Goal` and `#### Evidence from the abandoned attempt`. No product, plan, or proof was supplied before the review return. This file retains the exact 149 previously returned source commitments. Slice allocation is mechanical coordinator-supplied bookkeeping, not an implementation judgment.

The prior review remains recoverable at `64a9b6db0`.

Failure policy: [AGENTS.md#failing-and-flaky-tests](../../../AGENTS.md#failing-and-flaky-tests) applies as written.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| S001 | For authorized execution waiting on a supplier, significantly reduce complete-task model work. | slice 4 |  |
| S002 | Reduce retained context. | slice 4 |  |
| S003 | Added automation alone does not establish improvement. | slice 4 |  |
| S004 | Preserve partial work. | slice 4 |  |
| S005 | Preserve applicable accepted proof. | slice 4 |  |
| S006 | Preserve correct supplier judgment. | slice 4 |  |
| S007 | Preserve one qualifying continuation. | slice 4 |  |
| S008 | Terry’s authorization permits a bounded differential investigation after the forced-wake probe found no worthwhile narrow removal. | slice 2 | observed: differential-investigation.md: Evidence locators and What kept returning control to the model; source user watch follow-up, real handle, empty nonterminal receipts and different completed-turn path |
| S009 | Compare the original prolonged supplier pause with the fresh execution. | slice 2 | observed: differential-investigation.md: Evidence locators and What kept returning control to the model; source user watch follow-up, real handle, empty nonterminal receipts and different completed-turn path |
| S010 | Identify conditions that kept the original coordinator requesting model work while the fresh execution held. | slice 2 | observed: differential-investigation.md: Evidence locators and What kept returning control to the model; source user watch follow-up, real handle, empty nonterminal receipts and different completed-turn path |
| S011 | Reproduce the missing condition before choosing an optimization. |  | G2 |
| S012 | Distinguish evidence of an already-resolved problem from evidence that extraction omitted its cause. | slice 2 | observed: differential-investigation.md: Judgment and Guidance and host comparison; explicit limits retain uncertainty and reject current-fix/reproduction inference |
| S013 | Preserve uncertainty when available traces cannot settle that distinction. | slice 2 | observed: differential-investigation.md: Judgment and Guidance and host comparison; explicit limits retain uncertainty and reject current-fix/reproduction inference |
| S014 | Retain the existing paused-supplier forced-wake and unblocked-supplier cases as agreement regressions. | slice 3 | observed: Distribution/tests/native-comparison-paused-supplier.sh and native-comparison-unblocked-supplier.sh: retained agreement regressions passed in the 22-check run. |
| S015 | Retain those cases as preservation regressions. | slice 3 | observed: Distribution/tests/native-comparison-paused-supplier.sh and native-comparison-unblocked-supplier.sh: partial-work preservation and rejection cases passed. |
| S016 | Retain those cases as continuation regressions. | slice 3 | observed: Distribution/tests/native-comparison-paused-supplier.sh and native-comparison-unblocked-supplier.sh: qualifying continuation/proof and duplicate-continuation rejection passed. |
| S017 | The forced-wake case does not establish whether normal waiting creates or suppresses unnecessary model requests. | slice 2 | observed: differential-investigation.md: Evidence locators and What kept returning control to the model; forced wakes do not exercise in-flight watch or establish production frequency |
| S018 | Any new reproducer exercises normal wait/resume. |  | G2 |
| S019 | Any new reproducer preserves the original trace’s identified causal condition. |  | G2 |
| S020 | Demonstrate unwanted baseline behavior before implementation. |  | G2 |
| S021 | Demonstrate unwanted baseline behavior before further paid comparison. |  | G2 |
| S022 | Select one evidenced, targeted reduction. | slice 4 | G1 |
| S023 | Prefer deletion. | slice 4 |  |
| S024 | Prefer existing commands. | slice 4 |  |
| S025 | Justify a small script only by replacing observed repetitive mechanical work. | slice 4 |  |
| S026 | Such a script removes the corresponding agent procedure. | slice 4 |  |
| S027 | Do not retain both script and agent-procedure paths. | slice 4 |  |
| S028 | Count cost through qualification. | slice 4 |  |
| S029 | Count cost through final proof. | slice 4 |  |
| S030 | The investigation does not authorize a new daemon. | slice 4 |  |
| S031 | It does not authorize an enrollment protocol. | slice 4 |  |
| S032 | It does not authorize a second execution record. | slice 4 |  |
| S033 | It does not authorize a general accounting system. | slice 4 |  |
| S034 | It does not authorize a broad execution-guidance rewrite. | slice 4 |  |
| S035 | Automatic supplier-event delivery remains deferred. | slice 4 |  |
| S036 | No event-delivery runtime is authorized. | slice 4 |  |
| S037 | Running-verification efficiency remains with its existing sibling story. | slice 4 |  |
| S038 | General phase loading remains with its existing sibling story. | slice 4 |  |
| S039 | Preserve the exact supplier agreement. | slice 4 |  |
| S040 | Preserve execution ownership. | slice 4 |  |
| S041 | Preserve authority rules. | slice 4 |  |
| S042 | Preserve publication rules. | slice 4 |  |
| S043 | Preserve CI rules. | slice 4 |  |
| S044 | Publication alone does not satisfy an unmet supplier agreement. | slice 4 |  |
| S045 | A passing diagnostic alone does not satisfy an unmet agreement. | slice 4 |  |
| S046 | Missing evidence requires honest reassessment. | slice 4 |  |
| S047 | Changed evidence requires honest reassessment. | slice 4 |  |
| S048 | Retained context cannot justify stale satisfaction. | slice 4 |  |
| S049 | Retained context cannot justify a duplicate writer. | slice 4 |  |
| S050 | General guidance remains shared across Codex, Cursor and Claude Code. | slice 4 |  |
| S051 | The measured saving is limited to the observed Codex case; make no cross-host saving claim. | slice 4 |  |
| S052 | Example: blocked partial work, unchanged supplier evidence and a same-session wake preserve the work. | slice 4 |  |
| S053 | In that example, remain blocked. | slice 4 |  |
| S054 | In that example, reuse still-valid context rather than rebuild execution history. | slice 4 |  |
| S055 | Example: early supplier implementation without agreed stability proof triggers reassessment of changed evidence. | slice 4 |  |
| S056 | In that example, remain blocked. | slice 4 |  |
| S057 | In that example, do not reroute partial work around its supplier. | slice 4 |  |
| S058 | Example: qualifying supplier evidence permits the authorized slice to continue once. | slice 4 |  |
| S059 | In that example, integrate once. | slice 4 |  |
| S060 | In that example, preserve applicable proof. | slice 4 |  |
| S061 | In that example, finish with passing independent proof. | slice 4 |  |
| S062 | In that example, finish with passing execution-owned proof. | slice 4 |  |
| S063 | Count that continuation’s cost. | slice 4 |  |
| S064 | Example: if the supplier qualifies at entry, finish the same partial work once. | slice 4 |  |
| S065 | In that example, incur no blocked-path setup tax beyond the evaluation allowance. | slice 4 |  |
| S066 | Example: when the original repeatedly waits but the fresh fixture holds and ends its turn, compare actual context. | slice 2 | observed: differential-investigation.md: Evidence locators and What kept returning control to the model; source user watch follow-up, real handle, empty nonterminal receipts and different completed-turn path |
| S067 | In that differential example, compare available handles. | slice 2 | observed: differential-investigation.md: Evidence locators and What kept returning control to the model; source user watch follow-up, real handle, empty nonterminal receipts and different completed-turn path |
| S068 | In that differential example, compare instructions. | slice 2 | observed: differential-investigation.md: Evidence locators and What kept returning control to the model; source user watch follow-up, real handle, empty nonterminal receipts and different completed-turn path |
| S069 | In that differential example, compare guidance revisions. | slice 2 | observed: differential-investigation.md: Guidance and host comparison; normalized captured continuation/finish/empty-wait guidance matches, host route/version remains a confounder |
| S070 | Identify the missing trigger or retain an evidenced uncertainty. | slice 2 | observed: differential-investigation.md: Evidence locators and What kept returning control to the model; source user watch follow-up, real handle, empty nonterminal receipts and different completed-turn path |
| S071 | Do not assume the differing executions establish a fix. | slice 2 | observed: differential-investigation.md: Judgment and Guidance and host comparison; explicit limits retain uncertainty and reject current-fix/reproduction inference |
| S072 | Do not assume they establish a representative reproduction. | slice 2 | observed: differential-investigation.md: Judgment and Guidance and host comparison; explicit limits retain uncertainty and reject current-fix/reproduction inference |
| S073 | Example: a trigger-matching reproducer must show unchanged-baseline repeated model activity through normal wait/resume before considering one targeted optimization. |  | G2 |
| S074 | Controlled-host checks establish harness behavior. | slice 3 | observed: Distribution/tests/native-comparison-inflight.sh and native-comparison-supplier-watch.sh: active-turn delivery, preserved hold, once-only continuation/proof, cleanup and native refusal passed controlled renewal. |
| S075 | Controlled-host checks do not substitute for a native model-behavior result. | slice 3 | observed: reproducer-design.md: native observations remain unknown; supplier-watch/case.bash refuses the native route, and native-comparison-supplier-watch.sh observes that refusal. |
| S076 | Select the working acceptance bar during refinement, before measurement. | slice 4 |  |
| S077 | Require at least 20% fewer total processed tokens on the blocked case. | slice 4 |  |
| S078 | Permit no blocked-case increase in model requests. | slice 4 |  |
| S079 | Permit no blocked-case increase in developer interventions. | slice 4 |  |
| S080 | Permit at most 5% token overhead on the unblocked case. | slice 4 |  |
| S081 | Permit no unblocked-case increase in model requests. | slice 4 |  |
| S082 | Permit no unblocked-case increase in developer interventions. | slice 4 |  |
| S083 | Both arms satisfy the current case assessors. | slice 4 |  |
| S084 | Both arms satisfy decisive proof. | slice 4 |  |
| S085 | Make a bounded keep/stop decision from one stochastic observation per arm. | slice 4 |  |
| S086 | Make no statistical claim. | slice 4 |  |
| S087 | Make no billing claim. | slice 4 |  |
| S088 | Follow the cited ADR 0010 definition of improvement. | slice 4 |  |
| S089 | Freeze current pre-change source as the baseline. |  | G2 |
| S090 | Match the current task across comparison arms. | slice 4 |  |
| S091 | Match events. | slice 4 |  |
| S092 | Match the assessor. | slice 4 |  |
| S093 | Match the host. | slice 4 |  |
| S094 | Match the host version. | slice 4 |  |
| S095 | Match the model. | slice 4 |  |
| S096 | Match model settings. | slice 4 |  |
| S097 | Match publication authority. | slice 4 |  |
| S098 | Capture fresh baseline evidence. |  | G2 |
| S099 | Do not compare against the abandoned implementation. | slice 4 |  |
| S100 | Include coordinator effort in cost accounting. | slice 4 |  |
| S101 | Include owned-worker effort in cost accounting. | slice 4 |  |
| S102 | Begin accounting at setup. | slice 4 |  |
| S103 | Continue accounting through final proof. | slice 4 |  |
| S104 | Include recovery in accounting. | slice 4 |  |
| S105 | Report model requests separately. | slice 4 |  |
| S106 | Report cached input separately. | slice 4 |  |
| S107 | Report uncached input separately. | slice 4 |  |
| S108 | Report output separately. | slice 4 |  |
| S109 | Report interventions separately. | slice 4 |  |
| S110 | Unknown usage remains unknown. | slice 4 |  |
| S111 | Unknown usage cannot support a token-saving verdict. | slice 4 |  |
| S112 | The forced-wake schedule remains evidence for initial hold. | slice 4 |  |
| S113 | It remains evidence for unchanged-evidence handling. | slice 4 |  |
| S114 | It remains evidence for nonqualifying-evidence handling. | slice 4 |  |
| S115 | It remains evidence for qualifying-evidence handling. | slice 4 |  |
| S116 | It makes no production block-frequency claim. | slice 2 | observed: differential-investigation.md: Evidence locators and What kept returning control to the model; forced wakes do not exercise in-flight watch or establish production frequency |
| S117 | It makes no prolonged-pause reproduction claim. | slice 2 | observed: differential-investigation.md: Evidence locators and What kept returning control to the model; forced wakes do not exercise in-flight watch or establish production frequency |
| S118 | The differential investigation establishes the new reproduction profile before further comparison. | slice 2 | observed: differential-investigation.md: Minimum next reproduction profile; post-handoff watch authority, genuine handle, pre-correction agreement state and in-flight producer events |
| S119 | Authorize at most five native journeys in total. | slice 4 |  |
| S120 | That total includes the invalid initial baseline. | slice 4 |  |
| S121 | The four additionally approved journeys provide one fresh baseline and one candidate per case. | slice 4 |  |
| S122 | Worker effort still counts toward the budget. | slice 4 |  |
| S123 | Automatic baseline reacquisition still counts. | slice 4 |  |
| S124 | Invalid attempts still count. | slice 4 |  |
| S125 | Run the blocked comparison first. | slice 4 |  |
| S126 | The extension changes no quality bar. | slice 4 |  |
| S127 | The extension changes no keep/stop bar. | slice 4 |  |
| S128 | Two journeys are consumed and three remain. | slice 2 | observed: differential-investigation.md: Inspection and acceptance evidence; retained logs/Git only, no native launch and budget remains2used/3unspent |
| S129 | The new investigation grants no additional native budget. | slice 2 | observed: differential-investigation.md: Inspection and acceptance evidence; retained logs/Git only, no native launch and budget remains2used/3unspent |
| S130 | Prefer retained traces before paid native work. | slice 2 | observed: differential-investigation.md: Inspection and acceptance evidence; retained logs/Git only, no native launch and budget remains2used/3unspent |
| S131 | Prefer controlled checks before paid native work. | slice 3 | observed: reproducer-design.md Controlled acceptance: credential-free focused proof completed without another native journey. |
| S132 | Before a paid launch, reserve journeys needed for its stated learning. | slice 4 |  |
| S133 | Before a paid launch, reserve journeys needed for required remaining comparisons. | slice 4 |  |
| S134 | Do not start a comparison that cannot finish within the authorized allocation. | slice 4 |  |
| S135 | Stop before optimization implementation if the baseline does not reproduce the targeted unwanted behavior. | slice 4 |  |
| S136 | Stop before optimization implementation if the baseline exposes no plausible worthwhile removal. | slice 4 |  |
| S137 | Stop the candidate on failed quality. | slice 4 |  |
| S138 | Stop the candidate on insufficient usage evidence. | slice 4 |  |
| S139 | Stop the candidate on a missed bar. | slice 4 |  |
| S140 | Stop the candidate on exhausted budget. | slice 4 |  |
| S141 | Retain observations after stopping. | slice 4 |  |
| S142 | Revert only candidate-owned product changes. | slice 4 |  |
| S143 | Do not expand the design. | slice 4 |  |
| S144 | Do not rerun for a favorable result. | slice 4 |  |
| S145 | A negative result is learning, not achieved improvement. | slice 4 |  |
| S146 | An inconclusive result is learning, not achieved improvement. | slice 4 |  |
| S147 | Further work after such a result needs a new decision. | slice 4 |  |
| S148 | Keep evaluation effort visible as cost. | slice 4 |  |
| S149 | Keep implementation effort visible as cost. | slice 4 |  |
