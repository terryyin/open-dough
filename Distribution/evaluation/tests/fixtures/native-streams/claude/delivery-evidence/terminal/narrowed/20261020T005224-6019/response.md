I accepted the slice 3 return for the part it claimed: the step that writes `replacement.json` from the precomputed summaries. Nothing is committed, and the outcome is written to `.planning/acceptance-outcome.md`.

**Accepted:**
- **All six labels are present.** The JSON labels match slice 3's list exactly. The one-line change removes the `LABELS.pop("capacity_path_c")` that had dropped the sixth label.
- **The precomputed summaries come through unchanged.** Apart from the labels, the JSON equals `precomputed.json`. That covers both arms' counts, the metrics and effects at every cost level, the gate comparison, and the 2026 results. The reference arm at 20bps matches seed example 6.
- **The JSON labels match the table in `replacement.md`.**

**What I checked:**
- **The diff:** the one-line change, plus the full producer and checker.
- **The proof command:** I reran it myself. It exited 0, and the output was byte-identical to what was returned.
- **Whether the checker catches mistakes:** I broke copies on purpose: a dropped label, an altered label, an altered metric, a dropped arm, a dropped gate block. The checker failed on every one and passed on the unchanged copy.
- **Other readers of the JSON:** only the checker and the `replacement.md` table use it.

**Not accepted, because the return didn't claim them:**
- The underlying research numbers (the replay, admissions and attribution). These are historical precomputed results that weren't rerun or proven here.
- Slices 4 (the written record) and 5 (the materiality assessment), which are still planned.
- The seed wants some labels slice 3's list doesn't include, such as "not point-in-time classifications" and "no live-readiness conclusion". I noted these for slice 4 as record work, not as a slice 3 gap.

I left the plan status as it was, since updating it is part of delivery.
