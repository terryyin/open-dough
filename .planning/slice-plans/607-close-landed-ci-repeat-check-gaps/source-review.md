# Amended source-only review

Fresh reviewer `/root/source_review_amended`, launched with `fork_turns: none`
on 2026-11-13. Its input contained the original correction goal, scope,
examples, findings, preserved contracts/qualifications and Terry’s explicit
approval of bounded immutable history-read optimization. No slicing, product
implementation, proof or suspected omission was supplied. It read no project
files and changed none; the completed return was exported unchanged to
`/tmp/seed324-amended-source-review.json` solely for coordinator retention.
The prior review and accepted slice observations remain recoverable at
`7348487b92dd963babcf946e3dc163ae0f3e2d0a:.planning/slice-plans/607-close-landed-ci-repeat-check-gaps/source-review.md`.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C001 | Keep this work a bounded retrospective correction of “Make landed CI repeat checks pass under moderately high load.” | slice 8 |  |
| C002 | A change to automatic CI follow-up must produce a failing maintained check for each regression the seven current checks caught before the high-load story moved them to kept state. | slice 8 |  |
| C003 | A change to support shared by the landed CI repeat checks must produce a failing maintained check for each previously protected regression. | slice 8 |  |
| C004 | Maintain one owner for each shared support responsibility. | slice 8 |  |
| C005 | Restore dashboard coverage of a second dashboard spending the repeat opportunity. | slice 5 |  |
| C006 | Restore journey coverage that reads a queued repeat as progress. | slice 2 | observed: Slice 2 accepted proof: queued progress and same-journey finished warning, published7348487b92dd963babcf946e3dc163ae0f3e2d0a; matching P4/F27 and unchanged F16 owner |
| C007 | Restore phone coverage of sideways scrolling across the whole comparison. | slice 1 | observed: Slice 1 accepted proof: current whole-comparison phone assertion and matching P3/F26 discrimination, published1c04004870edef23d1628a70a06e79e83fee2db7 |
| C008 | Maintain a check that compares kept-scope support proof with what collection actually keeps. | slice 6 |  |
| C009 | Give rerun answering one owner. | slice 4 |  |
| C010 | Give rerun counting one owner, removing duplicate scenario/provider ownership. | slice 4 |  |
| C011 | Give provider layering one consistent owner. | slice 4 |  |
| C012 | Give the automatic-repeat specification clear ownership of its distinct journey and stage outcomes. | slice 3 |  |
| C013 | Give start-origin preparation clear ownership for its distinct lifetimes. | slice 8 |  |
| C014 | Permit a later start-origin revision to name the first revision as its parent. | slice 7 |  |
| C015 | Introduce no product behavior change. | slice 3 | observed: Isolated history functional acceptance: current real-Git recovery/semantics regressions and endpoint/Review/raw consumers; /tmp/seed324-history-graph-follow-up.md; G6 and family/profile gates remain unresolved |
| C016 | Introduce no new product promise. | slice 8 |  |
| C017 | Every check must continue passing at counted load 30–50 within default timeouts. | slice 8 |  |
| C018 | Cover a collecting dashboard that has passed its ledger pre-check and is preparing run71 when another dashboard’s writer saves an accepted request for that landing before preparation finishes. | slice 5 |  |
| C019 | In that race, collection must send no rerun. | slice 5 |  |
| C020 | In that race, collection must retain the accepted request. | slice 5 |  |
| C021 | Bypassing the ledger guard in that race must fail a dashboard check. | slice 5 |  |
| C022 | Bypassing the collection answer check in that race must fail a dashboard check, including when collection ignores spendRepeat false. | slice 5 |  |
| C023 | Cover a settled comparison on a 390px phone that includes both attempts and the reference. | slice 1 | observed: Slice 1 accepted proof: current whole-comparison phone assertion and matching P3/F26 discrimination, published1c04004870edef23d1628a70a06e79e83fee2db7 |
| C024 | A published-landing line that scrolls inside itself must fail the whole-comparison check even when the three existing part checks pass. | slice 1 | observed: Slice 1 accepted proof: current whole-comparison phone assertion and matching P3/F26 discrimination, published1c04004870edef23d1628a70a06e79e83fee2db7 |
| C025 | Whole-comparison scrolling coverage must catch overflow outside the original, repeat, and reference parts. | slice 1 | observed: Slice 1 accepted proof: current whole-comparison phone assertion and matching P3/F26 discrimination, published1c04004870edef23d1628a70a06e79e83fee2db7 |
| C026 | When an accepted request’s repeat is queued, the phone card must read “CI rerun in progress.” | slice 2 | observed: Slice 2 accepted proof: queued progress and same-journey finished warning, published7348487b92dd963babcf946e3dc163ae0f3e2d0a; matching P4/F27 and unchanged F16 owner |
| C027 | The same journey must subsequently read the finished repeat warning. | slice 2 | observed: Slice 2 accepted proof: queued progress and same-journey finished warning, published7348487b92dd963babcf946e3dc163ae0f3e2d0a; matching P4/F27 and unchanged F16 owner |
| C028 | Collection must keep the run63 case evidence. | slice 6 |  |
| C029 | Collection must keep the run63 file evidence. | slice 6 |  |
| C030 | The kept file evidence must include a zero-duration file. | slice 6 |  |
| C031 | Support-builder proof for those facts must equal the proof kept by collection. | slice 6 |  |
| C032 | Starting an origin must preserve the ancestry declared by a later revision naming the first revision as its parent. | slice 7 |  |
| C033 | Moving support ownership must preserve the existing receipt journey. | slice 8 |  |
| C034 | Moving support ownership must preserve existing stage checks. | slice 8 |  |
| C035 | Preserve maintained coverage of the eligible outcome. | slice 3 |  |
| C036 | Preserve maintained coverage of the refused outcome. | slice 3 |  |
| C037 | Preserve maintained coverage of the uncertain outcome. | slice 3 |  |
| C038 | Preserve maintained coverage of the saved-request outcome. | slice 3 |  |
| C039 | Resolve the automatic-repeat specification’s mixing of the receipt journey with the eligible, refused, uncertain, and saved-request stage outcomes. | slice 3 |  |
| C040 | Remove duplicate ownership of the waiting run72 scenario. | slice 3 |  |
| C041 | Give the relationship between aWholePass and waiting run72 a maintained owner beyond its existing documentation-only tie. | slice 3 |  |
| C042 | Separate ownership of run-wide start-origin preparation from support with other lifetimes. | slice 8 |  |
| C043 | Separate ownership of installation-lifetime start-origin preparation from support with other lifetimes. | slice 8 |  |
| C044 | Separate ownership of process-held start-origin preparation from support with other lifetimes. | slice 8 |  |
| C045 | The shared start-origin map must represent the first revision as a declared parent when that ancestry is supplied. | slice 7 |  |
| C046 | Compare keptScopeFileProof with collection’s kept proof in a maintained check. | slice 6 |  |
| C047 | Every promise protected by the seven current cases must retain a maintained owner. | slice 8 |  |
| C048 | The coverage map must identify one deliberate fault per protected promise. | slice 8 |  |
| C049 | Kept state must remain product-owned. | slice 8 |  |
| C050 | Builder drift from product-owned kept state must fail a check. | slice 6 |  |
| C051 | Preserve the previous promises. | slice 8 |  |
| C052 | Preserve faults F1–F11 and F14–F24. | slice 8 |  |
| C053 | Retain the default 30-second test timeout. | slice 8 |  |
| C054 | Retain the default 5-second expectation timeout. | slice 8 |  |
| C055 | Follow the shared MakeMe convention selected for the affected tests. | slice 8 |  |
| C056 | Follow the page-object convention selected for the affected browser tests. | slice 8 |  |
| C057 | Use no sleeps. | slice 8 |  |
| C058 | Use no slow-test designation. | slice 8 |  |
| C059 | Use no retries. | slice 8 |  |
| C060 | Use no skips. | slice 8 |  |
| C061 | Use no timeout overrides. | slice 8 |  |
| C062 | Wait on observable events. | slice 8 |  |
| C063 | Select the counted load profile using two workers at a natural one-minute load of 30–50. | slice 8 |  |
| C064 | No selected case may exceed 25 seconds under that load-profile selection. | slice 8 |  |
| C065 | Retain the accepted qualification that F1 is caught at the default 30-second bound. | slice 8 |  |
| C066 | Apply deliberate faults only in scratch work and restore them before committing. | slice 8 |  |
| C067 | Keep scenario facts and expected answers in admission unchanged. | slice 3 |  |
| C068 | Keep scenario facts and expected answers in reconciliation unchanged. | slice 3 |  |
| C069 | Keep scenario facts and expected answers in followupreading unchanged. | slice 3 |  |
| C070 | Keep scenario facts and expected answers in adapter-repeat unchanged. | slice 3 |  |
| C071 | Repair necessary test and fixture defects under the project’s mandatory failure policy. | slice 8 |  |
| C072 | Treat failing or flaky tests as defects to fix, including instability between local and CI runs or between isolated and full runs. | slice 8 |  |
| C073 | Do not exempt a failure from repair because it predates this correction. | slice 8 |  |
| C074 | Diagnose and repair CI failures on published revisions through the applicable final CI; rerunning until green is not a fix. | target CI |  |
| C075 | Preserve another active execution’s uncommitted files when that execution owns the exact repair, and report its owner and remaining gate as the coordination boundary. | slice 8 |  |
| C076 | Treat any human-authorized failure exception as limited to its explicitly stated scope. | slice 8 |  |
| C077 | Preserve independent restart evidence while repairing tests or fixtures. | slice 3 |  |
| C078 | Preserve independent ledger evidence while repairing tests or fixtures. | slice 3 |  |
| C079 | The human amendment permits a bounded product-code optimization that reuses repeated immutable completion-history reads in the existing product history-read path. | slice 3 | observed: Isolated history functional acceptance: current real-Git recovery/semantics regressions and endpoint/Review/raw consumers; /tmp/seed324-history-graph-follow-up.md; G6 and family/profile gates remain unresolved |
| C080 | The human amendment permits a bounded product-code optimization that reuses repeated immutable claim-history reads in the existing product history-read path. | slice 3 | observed: Isolated history functional acceptance: current real-Git recovery/semantics regressions and endpoint/Review/raw consumers; /tmp/seed324-history-graph-follow-up.md; G6 and family/profile gates remain unresolved |
| C081 | Any permitted history-read optimization must preserve functional behavior. | slice 3 | observed: Isolated history functional acceptance: current real-Git recovery/semantics regressions and endpoint/Review/raw consumers; /tmp/seed324-history-graph-follow-up.md; G6 and family/profile gates remain unresolved |
| C082 | Any permitted history-read optimization must preserve mutable-ref observation. | slice 3 | observed: Isolated history functional acceptance: current real-Git recovery/semantics regressions and endpoint/Review/raw consumers; /tmp/seed324-history-graph-follow-up.md; G6 and family/profile gates remain unresolved |
| C083 | Any permitted history-read optimization must preserve error handling. | slice 3 | observed: Isolated history functional acceptance: current real-Git recovery/semantics regressions and endpoint/Review/raw consumers; /tmp/seed324-history-graph-follow-up.md; G6 and family/profile gates remain unresolved |
| C084 | Any permitted history-read optimization must preserve abort handling. | slice 3 | observed: Isolated history functional acceptance: current real-Git recovery/semantics regressions and endpoint/Review/raw consumers; /tmp/seed324-history-graph-follow-up.md; G6 and family/profile gates remain unresolved |
| C085 | Every existing test gate remains required after the permitted product-code optimization. | slice 8 |  |
| C086 | The amendment does not authorize a transport redesign. | slice 3 | observed: Isolated history functional acceptance: current real-Git recovery/semantics regressions and endpoint/Review/raw consumers; /tmp/seed324-history-graph-follow-up.md; G6 and family/profile gates remain unresolved |
| C087 | The amendment does not relax acceptance. | slice 8 |  |
| C088 | Continue within the established owned story-branch execution, delivery, and wrap-up authority. | landing |  |
| C089 | Apply no scope amendment beyond the explicitly approved immutable history-read optimization. | slice 3 | observed: Isolated history functional acceptance: current real-Git recovery/semantics regressions and endpoint/Review/raw consumers; /tmp/seed324-history-graph-follow-up.md; G6 and family/profile gates remain unresolved |
