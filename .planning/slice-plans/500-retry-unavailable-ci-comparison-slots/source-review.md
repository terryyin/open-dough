# Source review

Launch: fresh general-purpose subagent (no fork, no conversation inheritance), 2026-11-07, by the executing coordinator before slice 1 delegation.
Input: only the story's Goal, Scope and Key examples from [SEED-118#retry-unavailable-ci-comparison-slots](../../seeds/SEED-118-dashboard-reading-reliability.md#retry-unavailable-ci-comparison-slots) at `5d2e9eabd`; told to read no other files, change nothing, and return numbered commitments, qualifications, examples and exclusions. Returned rows below are its text; Slice and observation columns are the coordinator's allocation.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer reviewing a done story in Intent can use **Check again** to recover its CI timing comparison in the same dashboard session after a temporary read failure. | slice 2 | |
| 1a | The recovery applies when the failure leaves the Baseline slot unavailable. | slice 2 | |
| 1b | The recovery applies when the failure leaves the Branch slot unavailable. | slice 2 | |
| 1c | The recovery applies when the failure leaves the Landed slot unavailable. | slice 2 | |
| 1d | The recovery applies when the failure leaves the whole comparison unavailable. | slice 2 | |
| 1e | Recovery happens without restarting the dashboard process. | slice 2 | |
| 2 | Finality rule: a done comparison answer is final, and remembered for the dashboard process, only when nothing it reports is `unavailable`. | slice 1 | observed: tests/support/dashboard-later-trunk-landed.test.mjs "an answer with anything unavailable is read again; a final gap is remembered": every unavailable slot and whole-answer unavailable false, final none/not-applicable true |
| 2a | "Nothing unavailable" means no unavailable Baseline slot. | slice 1 | observed: tests/support/dashboard-later-trunk-landed.test.mjs "an answer with anything unavailable is read again; a final gap is remembered": baseline unavailable → false |
| 2b | "Nothing unavailable" means no unavailable Branch slot. | slice 1 | observed: tests/support/dashboard-later-trunk-landed.test.mjs "an answer with anything unavailable is read again; a final gap is remembered": branch unavailable → false |
| 2c | "Nothing unavailable" means no unavailable Landed slot. | slice 1 | observed: tests/support/dashboard-later-trunk-landed.test.mjs "an answer with anything unavailable is read again; a final gap is remembered": landed unavailable → false |
| 2d | "Nothing unavailable" means the whole answer is not unavailable. | slice 1 | observed: tests/support/dashboard-later-trunk-landed.test.mjs "an answer with anything unavailable is read again; a final gap is remembered": whole-answer unavailable → false |
| 2e | Any other answer is read afresh by the next read, the same way running endpoints already are. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-retry.spec.ts "a Baseline listing that failed once is listed again on the next read, then remembered": second read shows run 200 after a listing count above 1 |
| 2f | This one rule replaces the current exemption that freezes failures. | slice 1 | observed: dashboard/server/intentCiComparisonAnswers.ts isFinalCiComparisonAnswer: non-comparison exemption removed; one rule; tests/support/dashboard-later-trunk-landed.test.mjs "an answer with anything unavailable is read again; a final gap is remembered" |
| 3 | The done-story comparison on Intent's CI status homepage offers **Check again**. | slice 2 | |
| 3a | **Check again** is worded the same as the judged branch's button. | slice 2 | |
| 3b | **Check again** is placed the same way as the judged branch's button. | slice 2 | |
| 3c | **Check again** is disabled while a read is in progress. | slice 2 | |
| 3d | **Check again** re-reads the comparison. | slice 2 | |
| 3e | **Check again** re-reads the endpoint proofs the comparison shows. | slice 2 | |
| 3f | A final remembered answer is returned again without further GitHub requests. | slice 2 | |
| 3g | **Check again** also retries after the whole read failed. | slice 2 | |
| 4 | GitHub request accounting is updated. | slice 2 | |
| 4a | It states that an answer with an unavailable slot is not remembered. | slice 1 | observed: dashboard/GITHUB-REQUESTS.md CI timing comparison paragraph: not remembered while Baseline, Branch or Landed is unavailable |
| 4b | It states that an unavailable whole answer is not remembered. | slice 1 | observed: dashboard/GITHUB-REQUESTS.md CI timing comparison paragraph: a whole comparison that is unavailable is not remembered either |
| 4c | It states that, for such answers, each selection or **Check again** walks and lists its endpoints again. | slice 2 | |
| 4d | It states that **Check again** on a final answer asks nothing (no requests). | slice 2 | |
| 4e | It no longer claims **Check again** for a done comparison before the button exists. | slice 2 | |
| 5 | Preserved behavior stays as it is: | slice 2 | |
| 5.1 | Rate-limit cooldown. | slice 1 | observed: unchanged code; Intent CI comparison family (dashboard/tests/intent/intent-ci-comparison*.spec.ts) 43 passed with existing assertions unchanged |
| 5.2 | Demand admission. | slice 1 | observed: unchanged code; Intent CI comparison family (dashboard/tests/intent/intent-ci-comparison*.spec.ts) 43 passed with existing assertions unchanged |
| 5.3 | The 30-second read bound. | slice 1 | observed: unchanged code; Intent CI comparison family (dashboard/tests/intent/intent-ci-comparison*.spec.ts) 43 passed with existing assertions unchanged |
| 5.4 | The existing gap wording and reasons. | slice 1 | observed: unchanged code; Intent CI comparison family (dashboard/tests/intent/intent-ci-comparison*.spec.ts) 43 passed with existing assertions unchanged |
| 5.5 | The remembering of final answers. | slice 1 | observed: tests/support/dashboard-later-trunk-landed.test.mjs "an answer with anything unavailable is read again; a final gap is remembered": final none/not-applicable → true; dashboard/tests/intent/intent-ci-comparison-retry.spec.ts "a Baseline listing that failed once is listed again on the next read, then remembered": third read adds no Baseline listing |
| 5.6 | The remembering of valid proof summaries. | slice 2 | |
| 5.7 | The Taken comparison's head-driven re-reads. | slice 2 | |
| 6a | No automatic or timed retry. | slice 2 | |
| 6b | No per-slot memory that keeps final slots while re-reading only the failed one. | slice 1 | observed: dashboard/server/intentCiComparisonAnswers.ts: whole answer kept or not via rememberedByKey; no per-slot store added |
| 6c | No persistence of comparison answers across dashboard processes. | slice 1 | observed: dashboard/server/intentCiComparisonAnswers.ts: in-process rememberedByKey only; no persistence added |
| 6d | A deterministic whole-answer gap (e.g. an unreadable completion record) is read again on each selection; it costs local Git only and is not a reason to remember it. | slice 1 | observed: tests/support/dashboard-later-trunk-landed.test.mjs "an answer with anything unavailable is read again; a final gap is remembered": unreadable published completion history answer (whole-answer unavailable) → false, read again each selection |
| E1 | Slot failure recovers: a done Story Branch story's Baseline run listing fails on first read, succeeds afterwards. Intent shows Baseline unavailable with its reason, Branch and Landed readable; selecting **Check again** shows Baseline's build and the comparison's before → after summary. | slice 2 | |
| E2 | Final answer is reused: after E1, selecting another story and returning, or selecting **Check again** again, shows the comparison with no further GitHub run-listing or proof requests. | slice 2 | |
| E3 | Every slot obeys the rule: the same first-read failure on Branch, or on Landed (including a cancelled landing's forward walk), recovers the same way; no slot is exempt. | slice 1 | observed: tests/support/dashboard-later-trunk-landed.test.mjs "an answer with anything unavailable is read again; a final gap is remembered": branch and landed unavailable → false like baseline; a cancelled landing's forward walk yields only its Landed slot |
| E4 | Whole-answer failure recovers: reading the story's published completion history fails once (e.g. read bound expires during origin fetch); Intent shows the comparison unavailable with that reason, and **Check again** shows the comparison. | slice 2 | |
| E5 | Still failing: while the listing keeps failing, each **Check again** reads again and keeps showing the unavailable reason; nothing is remembered. | slice 2 | |
