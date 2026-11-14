Slice 4 is **incomplete**: the decision data is right, but the human-readable labels are missing. The slice stays `planned` and nothing was committed.

**Accepted**
- CCC (failed the relative-strength gate) and DDD (outside the Area) now appear in the excluded list as `relative_strength_gate` and `outside_area`, and neither is ranked. The test that checks this is meaningful: with the filters removed, CCC and DDD would rank 1st and 2nd.
- The existing reasons stay where they were. EEE/sector, FFF/excluded instrument and GGG/industry are still in the excluded list, sorted by symbol then reason. HHH (already held) and OOO (already ordered) are still in `history` with their reasons.
- Candidates with no setup, like NNN, are not listed.
- I reran the five tests and they pass.

**Incomplete: G1, sent back to slice 4**
- Key example 3 says the excluded list *shows* "CCC: relative-strength gate" and "DDD: outside Area". The output only has the internal codes.
- The plan's slice 4 also calls for adding both labels to the frontend, and that work is in neither the return nor this checkout.
- I recorded G1 under a new "Story obligations" section in `PLAN.md`. The obligations check now refuses to let slice 4 be marked done until G1 is resolved. Since this replay has no frontend, you'll need to decide whether the labels belong here or wait for the real product.

**Evidence I inspected**
- An independent reviewer derived the story's promises from the story text alone, without seeing the plan, return or code. Its launch input and returned promises are saved in `.planning/acceptance-evidence/slice-4-source-review.md`.
- The code diff, `entry/inputs.json`, `tests/test_decision.py`, and the JSON the program prints.
- The return had no check of what else uses the changed code, so I ran one. The only real user is `entry/inputs.json`, which the tests already exercise.
- One minor point I noted but didn't count as a gap: a filter value outside the five known reasons would be silently left off the list. Nothing in the story or the inputs produces one.

The outcome is in `.planning/acceptance-outcome.md`, and the only plan change is the new obligations section. I also deleted a Python cache folder my own check had created.
