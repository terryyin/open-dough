# Intent CI timing comparison

Part of [Development and Intent](dashboard-development-intent.md).

A selected **done** story shows a **CI timing comparison** instead of a live
branch judgment: baseline (newest completed build at or before the first claim
parent), branch (final story-branch build from the landing's story-side parent,
or N/A in Trunk Mode), and landed (newest trunk-first owning merge or
fast-forward tip — never a later completion-only commit, no measured-ancestor
fallback across that landing). The homepage names the active comparison
(**Baseline compared with Landed** when Landed has proof, else **Branch**, or
**Provisional** for Taken Trunk Mode) and why Landed is unused when skipped; an
overall summary keeps units apart and shows CI time without runner waits as
`before → after (Δ)` (percentage only for a measured non-zero baseline), with
CI wall time as context; then each endpoint's revision, run, attempt, state and
exact-or-ancestor selection with CI wall time and CI time without runner waits
(signed whole-second differences against Baseline; observations between builds,
not attributed to the story); then entry rows whose Counts and Baseline /
Branch / Landed cells reuse the before→after words. The entry rows sort by
their column headers as **CI status** Proof's do: **Counts** by the active
after endpoint's counted results, and **Baseline**, **Branch** and
**Landed** by that endpoint's measured time, an endpoint gap (added,
removed, partial, unavailable) following the measured rows in either
direction. GitHub Actions wall time
spans run creation on attempt one or attempt start on reruns through completion.
CI time without runner waits measures the longest dependency chain of job
durations. GitHub Actions uses the workflow at that build, including
carried-over jobs. A custom CI adapter supplies the selected attempt's graph
through its optional `jobs` operation. One classification of each scope's
count and duration change
feeds cues on the overall summary, entry rows, a location's or folder's own
Summary figures and its rows, file **Proof**, location headers whose path is a compared entry, and
file rows in the location tree: a count border (green fewer, red more; any
change; strong at ≥50% of baseline) and a duration tint (green faster, red
slower; no tint under 10% or under 1 s; strong at ≥50%; a measured zero
baseline at most light; no tint without comparable measured durations).
Added, removed, gap and partial sides take no cue on that measure; their text
explains why. Baseline / Branch / Landed cells use the same timing gap labels
as **Test execution time** (`Part 2 untimed`, `No timings`), with the full
explanation as hover text and accessible description. Tree file rows and those location headers carry the same Counts
and after-side words in their accessible names as **Proof**. Folder rows in
the tree stay without cues. A selected file or location with a duration tint
keeps that tint and uses an accent border for selection instead of an accent
fill that would hide it; keyboard focus keeps the shared focus ring. A
location that holds story changes keeps its change mark beside a count cue.
Cue colours use their own tokens, not warning or error styling, and keep the
same meanings in dark theme. Cues follow the active comparison (Branch when
Landed is unused). Without a selected story with a comparison there are no
cues and no comparison wording. The tree reads no CI of its own. Endpoint
recovery is independent of Review merge-resolution attribution; a Review
refusal does not suppress comparison at homepage, entry, folder or file
scopes. A **Taken** Story Branch story keeps the live judgment and adds that
comparison (provisional latest branch build; Landed not yet landed); a new
branch head re-reads it. A **Taken** Trunk Mode story shows the provisional
trunk comparison (Branch N/A) instead of a no-branch gap.

A done story's comparison ends with **Check again**, worded and placed as the
judged branch's button and disabled while it reads. It reads the comparison
and the endpoint proofs it shows again, whether the panel shows the
comparison, an unavailable slot, a whole-answer explanation, or a failed read:
an answer with anything unavailable is read afresh, so a temporary failure
recovers in the same dashboard process; a final answer and valid proof
summaries are remembered and return without further GitHub requests
([request accounting](../dashboard/GITHUB-REQUESTS.md)).
