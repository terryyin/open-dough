# Slice 4 source-only review

Launch: fresh general-purpose agent, no fork or resume, not the implementation
agent. It was told to use only the supplied text, read no project files and
change nothing. It got no plan, return, product, proof or slice scope.
Input: the verbatim Goal, Scope (required behavior and rejection constraints),
Deferred promises, Assumptions, Key examples and UI sections of
`.planning/seeds/SEED-145-entry-autonomation.md#story-reviewable-entry-decision`.

Returned commitments that apply to slice 4 (verbatim from the return):

- 20. Every candidate that produced a setup inside the alive window but is not ranked is listed.
- 21. Each listed candidate shows the filter that removed it. The possible filters are alternatives: outside the Area, relative-strength gate, missing sector or industry label, excluded instrument, already held, or already ordered.
- 22. Candidates with no setup are not listed.
- 47. The excluded list is extended with the new reasons.
- Qualification: the exclusion list covers only setups *inside the alive window*. From Example 3: existing exclusion reasons keep their places.
- Example 3: CCC has a setup but fails the relative-strength gate. DDD has a setup but is outside the Area at that session. Generate → the excluded list shows "CCC: relative-strength gate" and "DDD: outside Area". Neither is ranked, and existing reasons keep their places.

The return also listed commitments 1–19, 23–46 and 48–50 (inputs, rank,
risk-off, not-evaluated count, waiting, incomplete evidence, traceability, UI)
and the deferred items. Their owners are plan slices 1–3 and 5–7; slice 4 is
not accepted against them.
