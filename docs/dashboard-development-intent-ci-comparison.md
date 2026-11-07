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
reuse those words. Endpoint recovery is independent of Review merge-resolution
attribution; a Review refusal does not suppress comparison at homepage, entry,
folder or file scopes. A **Taken** Story Branch story keeps the live judgment
and adds that comparison (provisional latest branch build; Landed not yet
landed); a new branch head re-reads it. A **Taken** Trunk Mode story shows the
provisional trunk comparison (Branch N/A) instead of a no-branch gap.
