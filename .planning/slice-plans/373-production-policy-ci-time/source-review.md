# Independent source review

Fresh reviewer `/root/policy_source_contract`, fork_turns none, received only
the complete selected story Goal, Scope, Examples, Evaluation and Excluded text
pasted in its launch. It was instructed to read no files, change nothing and
derive individual source clauses without plan, product, proof or slice context.
Its actual return is retained below; bold emphasis is normalized to plain text.
The reviewer preserves surviving or replacement proof as alternatives, J05/J06
as alternative triggers, and examples without inventing a scenario count.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | Reduce repeated full-app builds in production-watcher policy tests. | slice 1 |  |
| C02 | Preserve coverage while reducing those builds. | slice 1 |  |
| C03 | Measure the effect on CI time. | slice 1 |  |
| C04 | Consolidate overlapping range coverage at the existing real-Git qualification boundary. | slice 1 |  |
| C05 | Consolidate overlapping exclusion coverage at that boundary. | slice 1 |  |
| C06 | Consolidate overlapping published-policy rule coverage at that boundary. | slice 1 |  |
| C07 | Preserve the actual watcher observation that skipped changes perform no install. | slice 1 |  |
| C08 | Preserve the actual watcher observation that skipped changes perform no build. | slice 1 |  |
| C09 | Preserve the actual watcher observation that skipped changes perform no restart. | slice 1 |  |
| C10 | Preserve the observation that selected published policy wins over local edits. | slice 1 |  |
| C11 | Preserve the observation that accumulated changes select the latest commit. | slice 1 |  |
| C12 | Preserve the observation that unsupported policy retains the served baseline. | slice 1 |  |
| C13 | Preserve the observation that failed builds retain the served baseline. | slice 1 |  |
| C14 | Preserve the observation that only successful activation advances the served baseline. | slice 1 |  |
| C15 | Keep real npm/Vite deployment proof. | slice 1 |  |
| C16 | Keep pinned-serving proof. | slice 1 |  |
| C17 | Keep replacement proof. | slice 1 |  |
| C18 | Keep recovery proof. | slice 1 |  |
| C19 | Keep shared-records proof. | slice 1 |  |
| C20 | Keep configuration proof. | slice 1 |  |
| C21 | Keep process-cleanup proof. | slice 1 |  |
| C22 | Keep check-out-cleanup proof. | slice 1 |  |
| Q01 | Every removed assertion needs an inspected equivalent observation before its predecessor narrows. | slice 1 |  |
| Q02 | That equivalent may be a surviving observation or a replacement observation; these remain alternatives. | slice 1 |  |
| Q03 | Map original observations to surviving proof. | slice 1 |  |
| Q04 | Compare the same normal local family before and after. | slice 1 |  |
| Q05 | Use identical filters for that local comparison. | slice 1 |  |
| Q06 | Use default workers for that local comparison. | slice 1 |  |
| Q07 | Use identical relevant environment for that local comparison. | slice 1 |  |
| Q08 | Include replacement tests’ cost in that local comparison. | slice 1 |  |
| Q09 | Compare fresh full hosted CI. | slice 1 |  |
| Q10 | Identify the baseline revision by name. | slice 1 |  |
| Q11 | Identify the candidate revision by name. | slice 1 |  |
| Q12 | Account for unchanged case verdicts. | slice 1 |  |
| Q13 | Account for intentional test moves. | slice 1 |  |
| Q14 | Account for unchanged platform skips. | slice 1 |  |
| Q15 | Account for unchanged platform retries. | slice 1 |  |
| Q16 | Account for real-build counts. | slice 1 |  |
| Q17 | Account for fixture costs. | slice 1 |  |
| Q18 | Account for queue time. | slice 1 |  |
| Q19 | Account for job time. | slice 1 |  |
| Q20 | Account for suite time. | slice 1 |  |
| Q21 | Account for runner variance. | slice 1 |  |
| Q22 | Retain only supported improvements. | slice 1 |  |
| Q23 | Report inconclusive measurements honestly. | slice 1 |  |
| J01 | Excluded-only ranges are decided from real published Git trees. | slice 1 |  |
| J02 | Mixed ranges are a stated variant decided from real published Git trees. | slice 1 |  |
| J03 | Accumulated ranges are a stated variant decided from real published Git trees. J02 and J03 retain the source’s “mixed/accumulated” variants. | slice 1 |  |
| J04 | A candidate’s changed policy is used despite a different uncommitted local workflow. | slice 1 |  |
| J05 | Unsupported policy is one alternative trigger for the application-change retention journey. | slice 1 |  |
| J06 | A failed build is the other alternative trigger for that journey. | slice 1 |  |
| J07 | Under either J05 or J06, a later documentation-only commit cannot hide the application change. | slice 1 |  |
| J08 | After successful activation, a later excluded-only commit is skipped without deployment work. | slice 1 |  |
| X01 | Production behavior changes. | slice 1 |  |
| X02 | Fake internal outcomes. | slice 1 |  |
| X03 | Shared mutable fixtures. | slice 1 |  |
| X04 | Weakened assertions. | slice 1 |  |
| X05 | Skips. | slice 1 |  |
| X06 | Retries. | slice 1 |  |
| X07 | Second-server changes. | slice 1 |  |
| X08 | Clock changes. | slice 1 |  |
| X09 | Additional workers. | slice 1 |  |
| X10 | Additional shards. | slice 1 |  |
| X11 | Unrelated fixture optimization. | slice 1 |  |
| X12 | Releases. | slice 1 |  |
| X13 | Guidance changes. | slice 1 |  |
| X14 | Shard-weight refresh, expressly outside the selected priority. | slice 1 |  |
