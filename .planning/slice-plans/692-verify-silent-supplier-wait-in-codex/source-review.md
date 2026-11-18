# Source review for SEED-389 in Codex

The coordinator launched `source_review` with a fresh context on 2026-11-18.
Its only input was the seed's Shared evaluation and the Codex story's Goal,
Scope, and Key examples. It was asked to read no files and change nothing.
The launch input and returned commitments are in this execution's Codex
conversation, in the `source_review` launch and final response.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P01 | When the Codex story comes up in the queue, check the retained Codex traces for watches. Find them by the developer’s request to watch an execution held on a paused supplier. A watch is a Codex coordinator session on the released installation with the wait and its follow-up fix, at 0.3.102 or later. (Shared evaluation and Scope) | slice 1 | observed: PLAN.md, Watches / Search on 2026-11-18. Both user messages and tool inputs were scanned in the frozen active and archived snapshot. |
| P02 | Record the watches found, including a watch whose only unchanged interval lasted three minutes. If the evidence is insufficient, record the found watches’ facts in the selected story’s plan. (Scope and one-watch and three-minute examples) | slice 1 | observed: PLAN.md, Watches. No request met the held Codex coordinator condition, so there was no qualifying or shorter watch to list. |
| P03 | A watch that never invokes `wait-for-publication.mjs` is a missed route and can count toward the three when it otherwise qualifies. The developer-requested watch that writes its own polling loop is an example. (Scope and polling-loop example) | slice 1 | observed: PLAN.md, Watches / Search on 2026-11-18. The independent user-message search included bypass candidates and confirmed no missed route. |
| P04 | Judge once three watches from different executions each have an unchanged interval longer than five minutes. A watch with only a three-minute interval is excluded from the three. (Shared evaluation, Scope, and three-minute example) | slice 1 | observed: PLAN.md, Watches and Deferral and resume. Zero independent executions met the watch definition; measurement is gated on three with intervals longer than five minutes. |
| P05 | When fewer than three watches qualify, record what is missing. With one qualifying watch, record that two are missing. (Shared evaluation, Scope, and one-watch example) | slice 1 | observed: PLAN.md, opening of Watches. Three qualifying executions are missing. |
| P06 | When fewer than three watches qualify, leave the story without a recommendation. (Scope and one-watch example) | slice 1 | observed: PLAN.md. The Watches section gives a shortfall and a resume condition; there is no recommendation. |
| P07 | When the available examples are insufficient, move the story down the queue. (Shared evaluation, Scope, and one-watch example) | slice 1 | observed: ../../PRODUCT-BACKLOG.md, Backlog list. Codex is returned from Taken and placed immediately after the now-ready long-wait correction, with its plan link. |
| P08 | After deferral, continue to the next eligible work. (Shared evaluation) | slice 1 | observed: ../../PRODUCT-BACKLOG.md and PLAN.md, Deferral and resume. The now-ready long-wait correction is available ahead of Codex; the selected Codex execution ends here as the plan directs. |
| P09 | Revisit the deferred story when more traces are available. (Shared evaluation) | slice 2 | |
| P10 | Surface clear misses promptly. (Shared evaluation) | slice 1 | observed: PLAN.md, Watches. Developer requests were checked independently of launch records and there were zero confirmed missed routes to surface. |
| P11 | Retain each trace reference. (Shared evaluation) | slice 1 | observed: PLAN.md, Watches / Search on 2026-11-18. The retained snapshot has no watch paths to report; candidate coordinates are in the scan run evidence. |
| P12 | Retain the installed release. (Shared evaluation) | slice 1 | observed: PLAN.md, Watches. There was no watch whose installed release needed to be retained. |
| P13 | Retain each unchanged interval’s duration. (Shared evaluation and Scope) | slice 1 | observed: PLAN.md, Watches. There was no genuine watch with an unchanged interval to bound or measure. |
| P14 | Retain the model wake count for each unchanged interval. Count only distinct model requests inside that interval, excluding launch requests, result requests, and replies to the developer. (Shared evaluation and Scope) | slice 2 | |
| P15 | Where an interval has model wakes, retain cached input share summed over the counted requests. (Shared evaluation and Scope) | slice 2 | |
| P16 | Retain the publication or deadline outcome, including any missed publication. (Shared evaluation) | slice 2 | |
| P17 | Note failed continuation when it occurs. (Shared evaluation) | slice 2 | |
| P18 | Note developer interventions when they occur. (Shared evaluation) | slice 2 | |
| P19 | Use comparable historical waits where available. (Shared evaluation) | slice 2 | |
| P20 | Quantify token savings when the historical comparison supports it. (Shared evaluation) | slice 2 | |
| P21 | Treat a publication that arrives while an earlier one is being judged as handled when the rerun with the returned deadline reports it. (Late-publication example) | slice 2 | |
| P22 | Start another unchanged interval at that rerun. (Late-publication example) | slice 2 | |
| P23 | Record **keep** in the selected story’s plan when every unchanged interval meets both bars and every publication and deadline was handled. The bars are at most one model request per started five unchanged minutes and at least 90% cached input summed over those requests. (Shared evaluation, Scope, and keep example) | slice 2 | |
| P24 | Record **revise** in the plan when the command stayed silent and every publication and deadline was handled, but a bar was missed. (Shared evaluation, Scope, and revise example) | slice 2 | |
| P25 | For a revise result, name the Codex step that woke the model. (Scope and revise example) | slice 2 | |
| P26 | Record **remove** in the plan when a watch bypassed the command, missed a publication or deadline, or failed to continue after a qualifying publication. (Scope and polling-loop example) | slice 2 | |
| P27 | Record **inconclusive** in the plan when the traces cannot establish which specified outcome occurred. The separate insufficient-watch path is P05–P09. (Shared evaluation and Scope) | slice 2 | |

The review retained the predicted savings and old polling behavior as baseline
context. The keep example illustrates both bars with 12, 31, and 47 minutes
and request ceilings of 3, 7, and 10. The revise example has 21 requests over
22 unchanged minutes, 99% cached input, and 60-second `wait` re-entry. The
review also preserved the dates and limits on staging, paid watches, and trace
handling, plus the separate wrap-up follow-up for revise or remove.
