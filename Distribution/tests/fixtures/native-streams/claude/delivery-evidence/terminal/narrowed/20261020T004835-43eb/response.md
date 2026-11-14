I accepted slice 3's producer work. Nothing is committed, and slice 3 is still marked `planned` in the plan because delivery wasn't authorized. The outcome is in `.planning/acceptance-outcome.md`.

**Accepted:**
- **Summaries preserved:** the producer copies everything from `precomputed.json` unchanged and only adds labels. The check confirms this by comparing the output with the input, and it also checks both arms and all five cost levels.
- **Six labels:** the fix removes the line that dropped `capacity_path_c`. The labels now match the plan's list exactly and in order, which I checked separately. They also match the table in `replacement.md`, which was left untouched.
- **Proof command:** I reran it and it passed (exit 0). Rerunning rewrote `replacement.json`, but the new file is byte-identical to the one returned.

**Incomplete:**
- **Moved to later slices:** I added two obligations under a new `## Story obligations` section in `PLAN.md`:
  - **G1:** the written record and its check, owned by slice 4.
  - **G2:** the materiality assessment rows for path C, owned by slice 5.
- **Not verified, and no remaining slice owns it:**
  - The evaluator replay, the admission-ledger comparison and the baseline reconciliation (key examples 1–6).
  - The story's input hash checks and assertion stops (example 7). The current producer doesn't read `treatment.json` or check any hashes.

  The plan treats all of this as earlier research supplied as input, so accepting slice 3 doesn't prove it. You'll need to decide whether that's enough before the story can complete.

The obligations check script (`story-obligations.mjs`) refused to run because the seed file has no `# ` title. I checked the G1/G2 quotes against the seed and the return by hand instead, and left the seed as it is.
