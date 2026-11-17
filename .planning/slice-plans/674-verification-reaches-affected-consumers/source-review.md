# Source-only review

Fresh general-purpose reviewer launched 2026-11-17 without conversation
inheritance or fork. Its only input was
`/Users/terryyin/.claude/jobs/83c81c65/tmp/source-input.md` (not durable): the
story section's Goal, Investigated basis, Scope, Scope limits, Key examples and
Evaluation from
[SEED-393](../../seeds/SEED-393-test-quality-learning-from-effort-replays.md#proof-reaches-unchanged-consumers-of-changed-output),
plus the seed's referenced "Evaluation of the two test-guidance improvements"
section as context. No plan, slicing, product, proof or suspected omission was
supplied; it read no other files and changed nothing. Returned ids are retained
below as returned (abbreviated quotations; locations name the source clause).

Unnumbered context returned: investigated-basis facts and counts; the two
hypotheses; the scope limits (no new trace field, heuristic, schema, parser or
blanket full-suite run; narrowing belongs to story 1; the delivery brief's
counting clause stays outside); "reuse existing claim-limiting wording when it
suffices" qualifies C006 and C010; evaluation logistics (paid native run
triggered by Terry, Codex recommended, effort secondary, one replay isolates no
guidance effect, frozen results stay frozen).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C001 | Scratch run covers every suite whose tests read the changed output where it is observed (stand-in, recorder, reader or rendered surface), including unchanged tests and helpers; replaces "one relevant test run" in its home (Scope 1; Goal). | slice 1 | observed: Distribution/src/skills/dough-story-refinement/references/executable-proof.md suite sentence (run every suite whose tests read the changed output where it is observed … including unchanged tests and helpers); settle-decisive-premises.md scratch run links to it; execute-plan delegation.md and wrap-up.md restatements aligned |
| C002 | Focused proof covers the same observation-point suites, replacing "the suite covering the changed surface" in its home (Scope 1; Goal). | slice 1 | observed: Distribution/src/skills/dough-story-refinement/references/executable-proof.md suite sentence replaces 'the suite covering the changed surface' |
| C003 | An exclusion says why the effect does not reach that boundary (Scope 2). | slice 1 | observed: Distribution/src/skills/dough-story-refinement/references/executable-proof.md existing: 'Exclude a consumer only when the effect does not reach its boundary' and trace disposition 'excluded: <reason the effect does not reach its boundary>' (unchanged) |
| C004 | A consumer that still reads the changed output is affected even when its assertions are about another subject; the comment-listed spec disposed "asserts navigation rather than the default" is run, not excluded (Scope 2; Key example 2). | slice 1 | observed: Distribution/src/skills/dough-story-refinement/references/executable-proof.md exclusion sentence: 'one that still reads the changed output is reached even when it asserts another subject' |
| C005 | A helper renamed within one file with no shared output keeps focused proof; no further suites (Key example 3). | slice 1 | observed: Distribution/src/skills/dough-story-refinement/references/executable-proof.md existing unchanged: 'A change nothing else observes, such as renaming a helper used only within one file … keeps focused proof' |
| C006 | This story's own return distinguishes observed proof, inferred reach and unverified scope (Scope 3; Goal). | slice 3 |  |
| C007 | A green run filtered by `--grep effort` names the variants that ran and lists unrun output readers as unverified, not covered (Key example 4; Evaluation). | slice 1 | observed: Distribution/src/skills/dough-story-refinement/references/executable-proof.md claim sentence: 'name the variants a filtered run executed, list unrun readers of the changed output as unverified' |
| C008 | A reported count names its unit and matches the retained observation, or is omitted (Scope 3; Key example 5; Evaluation). | slice 1 | observed: Distribution/src/skills/dough-story-refinement/references/executable-proof.md claim sentence: 'give a count only with its unit and matching the retained observation' |
| C009 | Final B redo on the same historical task, A unchanged, candidate guidance and settings pinned, participant blind, criteria set before the run, judged against frozen A (Scope 4; seed Evaluation). | slice 3 |  |
| C010 | The B redo's acceptance distinguishes observed proof, inferred reach and unverified scope (Scope 3). | slice 3 |  |
| C011 | The selected proof is first shown to fail on the old assumption (frozen `agent-launch-ad-hoc.spec.ts:120` argv length), before publication (Scope 4; Key example 1; Goal). | slice 3 |  |
| C012 | In the B redo, proof reaches the E2E launch consumers that read recorded argv (Evaluation; Key example 1). | slice 3 |  |
| C013 | In the B redo, no consumer that reads the changed output is excluded for its subject; the stale case is updated or narrowed rather than excluded (Evaluation; Key example 1). | slice 3 |  |
| C014 | In the B redo, the completion return names any unrun affected group and its counts match (Evaluation). | slice 3 |  |
| C015 | The B redo judgement discloses host/context differences, unknown measurements and stops; composed improvements are judged per hypothesis (seed Evaluation 3–4). | slice 3 |  |
