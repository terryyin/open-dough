# Source review for plan 552

**Launch.** 2026-11-09, coordinator pyo-chan at `766593b4f`: one fresh
general-purpose reviewer, no conversation inheritance, fork or resume.

**Input.** One file holding only the story's Goal, Scope (with Restrictions
and Not in this story) and Key examples:
`.planning/seeds/SEED-284-optimize-tests-from-ci-proof.md` lines 19–161 and
180–223 at `766593b4f` (extracted file sha256 `1f91994a…5692`). The
Architecture and Evidence sections were left out. The reviewer was told to
read only that file, change nothing, number every commitment, split compound
items, keep alternatives, and derive promises rather than slices or proof.

**Reviewer notes and allocation reading.**

1. Pygardon's record state: 55d.1 and 86.2 observe Intent reading Pygardon's
   current four-section record (slice 5). If the pilot pass writes that
   record, it converts (52, 64) in slice 7.
2. Accepted-cost examples 79–82.4 illustrate where the guidance puts an
   accepted cost. Slice 6's guidance review walks them. Pygardon's source
   changes only if the pilot writes its record (64); Doughnut's record does
   not convert in this story.
3. "the agreed target" (26) reads as the developer-supplied target of 16.q1,
   otherwise the stated saving; slice 4's guidance words it.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | "A developer can ask Dough to optimize tests in ordinary language" | slice 7 | |
| 2 | "…and promptly get either a worthwhile reduction in the wait for trustworthy local test results … or an evidenced explanation of why no worthwhile saving could be established" (alternatives) | slice 7 | |
| 2.q1 | Qualification (of the reduction alternative in 2): "with behavioral coverage … preserved" | slice 7 | |
| 2.q2 | Qualification (of the reduction alternative in 2): "with … confidence preserved" | slice 7 | |
| 3 | "The skill chooses how to proceed from evidence the project already retains" | slice 7 | |
| 4 | "…and brings the developer only consequential questions" | slice 7 | |
| 4.q1 | Qualification (current-state contrast for 1–4): "Today every pass starts with an admitted story and a full local profiling run." | slice 7 | |
| 5 | "Read retained CI test proof for the requested scope through the project's configured GitHub Actions workflow or CI adapter" (alternatives) | slice 3 | |
| 6 | "Prefer a complete, successful attempt at the relevant revision" | slice 3 | |
| 7.1 | "…and name its [the attempt's] repository" | slice 3 | |
| 7.2 | "…name its … revision" | slice 3 | |
| 7.3 | "…name its … attempt" | slice 3 | |
| 7.4 | "…name its … selection" | slice 3 | G2 |
| 8a | "When only an earlier compatible attempt is available, label its revision" | slice 3 | |
| 8b | "…and use it as a lead within the parts that still apply" | slice 4 | |
| 9a | "Use failed or incomplete proof to diagnose problems" | slice 4 | |
| 9b | "…and report its gaps" | slice 3 | |
| 10.1 | Restriction: "missing … parts stay gaps" | slice 3 | |
| 10.2 | Restriction: "ambiguous … parts stay gaps" | slice 3 | |
| 10.3 | Restriction: "untimed parts stay gaps" | slice 3 | |
| 11 | "When the summary lacks the timing detail a lead needs, … use the project's retained full summary or runner output for that attempt" (alternatives) | slice 4 | |
| 11.e1 | Example (of 11): "a file breakdown that an adapter answer omits" | slice 3 | |
| 11.e2 | Example (of 11): "hook … timing" | slice 4 | |
| 11.e3 | Example (of 11): "scenario … timing" | slice 4 | |
| 11.e4 | Example (of 11): "worker timing" | slice 4 | |
| 12a | "When the evidence still runs out, state the gap" | slice 4 | |
| 12b | "…and stop the dependent investigation" | slice 4 | |
| 13 | Restriction: "A fresh profiling run … starts only on an explicit request" | slice 4 | |
| 13.q1 | Qualification (of 13): fresh profiling run means "a run of the requested scope to discover or rank costs" | slice 4 | |
| 13.q2 | Qualification (of 13): the explicit request "can be given in ordinary language" | slice 4 | |
| 14a | "When a gap blocks a decision that could pay off, recommend such a run" | slice 4 | |
| 14b | "…with its expected cost" | slice 4 | |
| 14c | "…and leave the choice to the developer" | slice 4 | |
| 13.q3 | Qualification (of 13): "Timing a chosen lead's family before and after its experiment is not a profiling run" | slice 4 | |
| 15 | "Start with a short ranked list of leads, … ranked by estimated removable cost" | slice 3 | |
| 15.q1 | Qualification (of 15): "roughly 10–20 when useful" | slice 3 | |
| 15.q2 | Qualification (of 15): "at the granularity the evidence supports" | slice 3 | |
| 16a | "Before experimenting, state the smallest saving worth keeping for the scope" | slice 4 | |
| 16b | "…and why" | slice 4 | |
| 16.q1 | Qualification (of 16a–16b): "from its evidence or a target the developer supplied" (alternatives) | slice 4 | |
| 17.1 | "The agent chooses the shortlist" | slice 4 | |
| 17.2 | "The agent chooses the … evidence source" | slice 4 | |
| 17.3 | "The agent chooses the … investigation depth" | slice 4 | |
| 18.1 | Restriction: "without asking the developer for percentages" | slice 4 | |
| 18.2 | Restriction: "without asking the developer for … batch sizes" | slice 4 | |
| 18.3 | Restriction: "without asking the developer for … modes" | slice 4 | |
| 19.1 | "Examine individually material files … in detail" | slice 4 | |
| 19.2 | "Examine individually material … families … in detail" | slice 4 | |
| 19.3 | "Examine individually material … fixtures in detail" | slice 4 | |
| 20a | "Group the many small costs by shared cause" | slice 4 | |
| 20.e1 | Example (of 20a): "per-case setup" | slice 4 | |
| 20.e2 | Example (of 20a): "process starts" | slice 4 | |
| 20.e3 | Example (of 20a): "waits" | slice 4 | |
| 20.e4 | Example (of 20a): "a worker tail" | slice 4 | |
| 20b | "…so a cost that no single file shows can still lead" | slice 4 | |
| 21 | "Follow related tests when they share the cost or protect behavior a change could affect" (alternative triggers) | slice 4 | |
| 22 | "File totals and case counts guide discovery" | slice 3 | |
| 23.1 | "runner reports and job evidence separate shared setup" | slice 4 | |
| 23.2 | "runner reports and job evidence separate … parallel work" | slice 4 | |
| 23.3 | "runner reports and job evidence separate … queue time" | slice 4 | |
| 23.4 | "runner reports and job evidence separate … the work that controls elapsed time" | slice 4 | |
| 24a | "Pick the most promising avoidable cost" | slice 4 | |
| 24b | "…and make the smallest meaningful experiment" | slice 4 | |
| 25 | "Rank again after a kept change" | slice 4 | |
| 26 | "Stop when the remaining credible opportunities fall below the stated saving, cannot justify the effort, or cannot plausibly reach the agreed target" (alternative stop conditions) | slice 4 | |
| 27.1 | "Discovery reads retained evidence" | slice 4 | |
| 27.2 | "Discovery reads … related test code" | slice 4 | |
| 27.q1 | Qualification (of 27.1–27.2, a permission): discovery "may time unmodified tests of a chosen lead" | slice 4 | |
| 28 | "It [discovery] finishes before a published assignment" | slice 4 | |
| 29a | "a supported stop at discovery reports its evidence" | slice 4 | |
| 29b | Restriction: "…without admitting any work" | slice 4 | |
| 30a | "The first experiment edit is admitted" | slice 4 | |
| 30b | "…and runs as one bounded planless execution" | slice 4 | |
| 30.q1 | Qualification (of 30a–30b): "under the ordinary request's authority" | slice 4 | |
| 30.q2 | Qualification (of 30b): "through the project's existing delivery" | slice 4 | |
| 31 | "Use a full plan when the evidence calls for dependent experiments, a shared harness redesign, or a consequential change in where behavior is proved" (alternative triggers) | slice 4 | |
| 32 | "Keep the CI proof publishing recipe available for requests to set up a proof producer" | slice 4 | |
| 33 | "Establish replacement proof before narrowing or removing coverage" | slice 4 | |
| 34a | "Run the project's ordinary verification for the affected behavior" | slice 4 | |
| 34b | "…and reuse comparable proof from CI produced by normal delivery" | slice 4 | |
| 35.1 | "Report the scope of any measured gain" | slice 4 | |
| 35.2 | "Report … the protection retained" | slice 4 | |
| 35.3 | "Report … any unresolved measurement" | slice 4 | |
| 36.1 | Restriction: "A CI case or file sum" is a distinct measure (from 36.2 and 36.3) | slice 4 | |
| 36.2 | Restriction: "a CI job or workflow wall time" is a distinct measure | slice 4 | |
| 36.3 | Restriction: "the developer's wait including suite admission" is a distinct measure | slice 4 | |
| 37 | Restriction: "A claim about local elapsed time requires comparable local evidence" | slice 4 | |
| 38.1 | "Compare like selections" | slice 4 | |
| 38.2 | "Compare like … runner conditions" | slice 4 | |
| 38.q1 | Qualification (of 38.1–38.2): "including replacement proof and shared setup where measured" | slice 4 | |
| 39 | "Follow the project's failing and flaky test policy" | slice 4 | |
| 40 | "The Test Optimization Candidates record holds only live candidates" | slice 5 | |
| 40.q1 | Qualification (of 40): live candidates are "material costs that still need deeper developer analysis" | slice 5 | |
| 40.q2 | Qualification (of 40): "**and** protect valuable behavior that the agent cannot safely simplify, downgrade, or remove" (both 40.q1 and 40.q2 must hold) | slice 5 | |
| 41.1 | "Each live entry names the affected test or fixture" | slice 5 | |
| 41.2 | "Each live entry names … observed cost" | slice 5 | |
| 41.3 | "Each live entry names … [observed] conditions" | slice 5 | |
| 41.4 | "Each live entry names … unique protection" | slice 5 | |
| 41.5 | "Each live entry names … alternatives tried" | slice 5 | |
| 41.6 | "Each live entry names … the remaining decision or evidence needed" | slice 5 | |
| 42 | "Resolve clear opportunities during normal optimization" | slice 5 | |
| 43a | "A candidate that is fixed, accepted, or moved to a named story leaves the live record" (alternatives) | slice 5 | |
| 43b | "…with its evidence recoverable from history" | slice 5 | |
| 43.q1 | Qualification (of 43a–43b): "so the live decision has one home" | slice 5 | |
| 44a | "Put accepted necessary cost beside the owning test, scenario, or shared fixture" (alternatives) | slice 6 | |
| 44.q1 | Qualification (of 44a): "at the narrowest scope that owns it" | slice 6 | |
| 44b | "as a project-native tag, annotation, or short source comment" (alternatives) | slice 6 | |
| 44c | "…explaining why that cost is warranted" | slice 6 | |
| 45a | "The indicator guides lead selection" | slice 6 | |
| 45b | "…while the cost still counts in timing" | slice 6 | |
| 45c.1 | Restriction: "…and the test keeps its normal selection" | slice 6 | |
| 45c.2 | Restriction: "…the test keeps its normal … execution" | slice 6 | |
| 45c.3 | Restriction: "…the test keeps its normal … verdict" | slice 6 | |
| 46 | "Revisit the accepted cost when it grows materially, its justification changes, or new evidence identifies cheaper equivalent proof" (alternative triggers) | slice 6 | |
| 47.1 | Restriction: "An accepted cost in one case leaves other cases … open to improvement" | slice 6 | |
| 47.2 | Restriction: "An accepted cost in one case leaves … avoidable setup open to improvement" | slice 6 | |
| 48 | Restriction: "Existing execution tags keep their own meaning" | slice 6 | |
| 49 | "Read existing profile-only markers by their actual semantics" | slice 6 | |
| 50.1 | Restriction: "neither [existing execution tags] becomes an accepted-cost decision by inference" | slice 6 | |
| 50.2 | Restriction: "neither [existing profile-only markers] becomes an accepted-cost decision by inference" | slice 6 | |
| 51.1 | "The skill … read[s] … the current published four-section record" | slice 5 | |
| 51.2 | "Intent read[s] … the current published four-section record" | slice 5 | |
| 51.q1 | Qualification (of 51.1–51.2): "with or without a leading pass summary" | slice 5 | |
| 51.q2 | Qualification (of 51.1–51.2): "and with the note naming the profile-only mechanism that the published format asks for" | slice 5 | |
| 51.3 | "The skill … read[s] … the live record" | slice 5 | |
| 51.4 | "Intent read[s] … the live record" | slice 5 | |
| 52 | "A project's record converts when a pass first writes it" | slice 6 | |
| 53a | (On conversion) "substantiated accepted costs move to source with their rationale" | slice 6 | |
| 53b | (On conversion) "fixed or transferred entries leave the live list" (alternatives) | slice 6 | |
| 54 | "Open Dough adopts the change in this story" | slice 6 | |
| 55a | "Its [Open Dough's] record converts" | slice 6 | |
| 55b | "its substantiated accepted costs move beside their tests" | slice 6 | |
| 55c | "Intent shows its live candidates" | slice 6 | |
| 55d.1 | "…while still reading Pygardon's … four-section record[]" | slice 5 | |
| 55d.2 | "…while still reading … Doughnut's four-section record[]" | slice 5 | |
| 56.1 | "Reuse the candidate reader" | slice 5 | |
| 56.2 | "Reuse … the existing CI proof contract, including its attempt identity" | slice 3 | |
| 56.3 | "Reuse … the existing CI proof contract, including its … timing units" | slice 3 | |
| 56.4 | "Reuse … the existing CI proof contract, including its … gap reporting" | slice 3 | |
| 56.5 | "Reuse … the explicit test case … units that SEED-281 adds wherever a summary carries them" | slice 3 | |
| 56.6 | "Reuse … the explicit … test file units that SEED-281 adds wherever a summary carries them" | slice 3 | |
| 57 | "Pilot the new default on one ordinary Pygardon pytest pass" | slice 7 | |
| 57.q1 | Qualification (of 57): "in a subordinate Pygardon workspace of this execution" | slice 7 | |
| 57.q2 | Qualification (of 57): "that reads the guidance from this repository's source" | slice 7 | |
| 58.1 | "Fix the evaluation basis before the observed run: time to a credible keep-or-stop decision" | slice 1 | observed: PLAN.md "Evaluation basis for the pilot", fixed before slice 7 and checked against Pygardon history by slice 1 (Learnings "Slice 1 route") |
| 58.2 | "Fix the evaluation basis before the observed run: … full-run cost" | slice 1 | observed: PLAN.md "Evaluation basis for the pilot", fixed before slice 7 and checked against Pygardon history by slice 1 (Learnings "Slice 1 route") |
| 58.3 | "Fix the evaluation basis before the observed run: … any verified change in the developer's ordinary wait with the required protection" | slice 1 | observed: PLAN.md "Evaluation basis for the pilot", fixed before slice 7 and checked against Pygardon history by slice 1 (Learnings "Slice 1 route") |
| 58.q1 | Qualification (of 58.1–58.3): "compared with Pygardon's recorded passes" | slice 1 | observed: PLAN.md "Evaluation basis for the pilot", fixed before slice 7 and checked against Pygardon history by slice 1 (Learnings "Slice 1 route") |
| 59 | "A kept change publishes under Pygardon's own rules" | slice 7 | |
| 57.q3 | Qualification (of 57): "A timely, evidenced stop is a useful result when the available opportunities do not pay for the work" | slice 7 | |
| 60 | Restriction: "No fresh profiling run of the requested scope without an explicit request" (restates 13) | slice 4 | |
| 60.q1 | Qualification (rationale for 60): "Six recorded Open Dough passes spent about 146 minutes on baseline and final suite runs, and one more waited about 38 minutes for suite admission" | slice 4 | |
| 61.1 | Restriction: "An accepted-cost indicator changes no selection" | slice 6 | |
| 61.2 | Restriction: "An accepted-cost indicator changes no … execution" | slice 6 | |
| 61.3 | Restriction: "An accepted-cost indicator changes no … timeout" | slice 6 | |
| 61.4 | Restriction: "An accepted-cost indicator changes no … verdict" | slice 6 | |
| 61.q1 | Qualification (rationale for 61.1–61.4): "because normal verification and CI must keep proving the behavior it protects" | slice 6 | |
| 62a | Restriction: "A timing claim stays within its evidence" | slice 4 | |
| 62b | Restriction: "an unsupported comparison stays open rather than borrowing a different measure" | slice 4 | |
| 63 | Exclusion: "changing CI producers to retain more timing detail" | slice 3 | |
| 63.q1 | Qualification (rationale for 63): "since existing retained artifacts are sufficient to start" | slice 3 | |
| 64 | Exclusion: "converting other projects' records beyond what the Pygardon pilot pass writes" | slice 7 | |
| 65 | Exclusion: "showing accepted-cost indicators in Intent" | slice 6 | |
| 66 | Exclusion: "reading the landed CI timing history that SEED-285 collects" | slice 3 | |
| K1.1 | Example: "Pygardon's adapter answers `proof` with totals only, to stay within 64 KiB, while its CI service retains the full 172 KB summary with 1,213 timed pytest files" | slice 3 | G1 |
| K1.2 | Example: "The newest successful main attempt, `993fe414` at `3cb29aaf9`, predates 52 changed files" | slice 7 | |
| K1.3 | Example: "The attempt that matches current code ran beside another and took 505 s of pytest against 320 s" | slice 7 | |
| 67a | "The agent labels that identity" | slice 7 | |
| 67b | "…and comparability" | slice 7 | |
| 68 | "…reads the full summary" | slice 7 | |
| 69 | "…and ranks leads" | slice 7 | |
| K1.4 | Example: "the top file, `data_source/test_jobs_live_commands_sharadar`, takes 60.5 s for 2 cases" | slice 7 | |
| 70 | "It follows one promising cost into a bounded change, or reports a supported stop" (alternatives) | slice 7 | |
| 71 | "…with zero fresh profiling runs" | slice 7 | |
| 72.1 | "…and no request to pick a percentile" | slice 7 | |
| 72.2 | "…no request to pick a … mode" | slice 7 | |
| K2.1 | Example: "Open Dough's run 42550972063 times 1,343 files for 11,142 s, and the top 20 hold 9.8% of it" | slice 3 | |
| K2.2 | Example: "One dashboard shard's retained Playwright report spends 26% of its test time in per-test hooks" | slice 4 | |
| 73a | "The leads include that shared setup" | slice 4 | |
| 73b | "…read from the runner report" | slice 4 | |
| 73c | "…not only the top files" | slice 4 | |
| 74a | "Once the report's 7-day retention has passed, the gap is stated" | slice 4 | |
| 74b | "…and the file leads rest on the summary alone" | slice 4 | |
| K3.1 | Example: "A proof artifact is missing, untimed, partial, or belongs to a different attempt or selection" (alternative triggers) | slice 3 | |
| 75 | "The agent exposes the gap" | slice 3 | |
| 76 | "…uses compatible retained evidence at its actual scope" | slice 4 | |
| 77 | "…and leaves an unsupported timing claim open" | slice 4 | |
| 78 | "An explicit request for fresh profiling runs the appropriate project command" | slice 4 | |
| 79 | "Pygardon's minimal real H.264 round trip carries its accepted codec cost in source" | slice 6 | |
| K4.1 | Example: "the record's path for it went stale when the file moved on 2026-11-08" | slice 6 | |
| 80a | "The worker-stall test explains its real 10 s exit timeout" | slice 6 | |
| 80b | "…while the other 11 cases of its 30.4 s file remain eligible" | slice 6 | |
| 81 | "A Doughnut scenario tag applies to its scenario even when CI reports an aggregate for the whole feature" | slice 6 | |
| K4.2 | Example: "the retained job log times each scenario" | slice 6 | |
| 82.1 | "Pygardon's `slow` … marker[] … keep[s] [its] own meaning" | slice 6 | |
| 82.2 | "Pygardon's … `host_docker` … marker[] … keep[s] [its] own meaning" | slice 6 | |
| 82.3 | "Pygardon's … profile-only markers … keep their own meanings" | slice 6 | |
| 82.4 | "…and Doughnut's profile-only tag keep[s] [its] own meaning" | slice 6 | |
| 83 | "The rate-limit test stays a live candidate" | slice 6 | |
| 83.q1 | Qualification (of 83): "while its valuable directed-time proof still needs a developer decision about a controllable clock in the released request owner" | slice 6 | |
| 84a | "Its [Open Dough's] three accepted costs move beside their tests" | slice 6 | |
| 84b | "…and leave the live list" | slice 6 | |
| 85 | "…as does the fixed setup entry" [it leaves the live list] | slice 6 | |
| 86.1 | "Intent reads Open Dough's live record" | slice 6 | |
| 86.2 | "Intent reads … Pygardon's … four-section record[] with [its] leading pass summar[y]" | slice 5 | |
| 86.3 | "Intent reads … Doughnut's four-section record[] with [its] leading pass summar[y]" | slice 5 | |
| K5.1 | Example (current state): "Today Intent shows Open Dough's record as mismatched, because one entry has an extra field" | slice 6 | |
| K5.2 | Example (current state): "…and Doughnut's too, because of its profile-only mechanism note" | slice 5 | |
| K6.1 | Example: "Discovery finds no lead above the stated saving" | slice 4 | |
| 87 | "…and reports why" | slice 4 | |
| 88.1 | "…with no story" | slice 4 | |
| 88.2 | "…[with no] Taken entry" | slice 4 | |
| 88.3 | "…[with no] wrap-up" | slice 4 | |
| 89a | "A lead worth trying is admitted at its first edit" | slice 4 | |
| 89b | "…and delivered as one bounded experiment" | slice 4 | |
| 90 | "a dependent sequence gets a plan" | slice 4 | |
