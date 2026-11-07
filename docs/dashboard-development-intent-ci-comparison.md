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
overall summary keeps units apart and shows CI wall time as
`before → after (Δ)` (percentage only for a measured non-zero baseline); then
each endpoint's revision, run, attempt, state and exact-or-ancestor selection
with the same wall-time wording (observations between builds, not attributed to
the story); then entry rows whose Counts and Baseline / Branch / Landed cells
reuse those words. One classification of each scope's count and duration change
feeds cues on the overall summary, entry rows, location and folder Summary
rows, and file **Proof**: a count border (green fewer, red more; any change;
strong at ≥50% of baseline) and a duration tint (green faster, red slower; no
tint under 10% or under 1 s; strong at ≥50%; a measured zero baseline at most
light; no tint without comparable measured durations). Added, removed, gap and
partial sides take no cue on that measure; their text explains why. Cue colours
use their own tokens, not warning or error styling, and keep the same meanings
in dark theme. Cues follow the active comparison (Branch when Landed is unused).
Without a selected story with a comparison there are no cues and no comparison
wording. Endpoint recovery is independent of Review merge-resolution
attribution; a Review refusal does not suppress comparison at homepage, entry,
folder or file scopes. A **Taken** Story Branch story keeps the live judgment
and adds that comparison (provisional latest branch build; Landed not yet
landed); a new branch head re-reads it. A **Taken** Trunk Mode story shows the
provisional trunk comparison (Branch N/A) instead of a no-branch gap.
