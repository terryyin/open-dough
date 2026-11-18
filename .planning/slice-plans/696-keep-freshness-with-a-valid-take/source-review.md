# Source review

Launched 2026-11-18 as a fresh general-purpose reviewer without conversation
inheritance. Input: the story section's heading, Goal, Scope, Deferred, Key
examples, Baseline, Alternatives considered and Evaluation of
[SEED-400#keep-freshness-with-a-valid-take](../../seeds/SEED-400-source-freshness-with-a-valid-take.md#keep-freshness-with-a-valid-take)
as published at `3e19bc23e`, with the instruction to use only that text, read
no project files, change nothing and number independently observable promises.

Unnumbered context returned: the Goal's current defect; the reasons in Scope
bullets 1 and 4; the Deferred `Claim-Publisher` exclusion; Baseline;
Alternatives considered; the Evaluation's replay method and its "Record the
actual response and first containing release at ODF-482" delivery deferral;
key-example commit identifiers as journey detail.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A valid claim on a several-base graph is compared from a Taken base and proceeds. Goal: "A developer or coordinator finishing Taken Story Branch work can continue through the normal source-freshness check when the authorized target and branch share several best common bases and only some of them hold the accepted Take." Scope bullet 1: "The check considers every best common base of fetched trunk and the branch (`git merge-base --all`) and compares from one at which the story is Taken." Key example Sibling import: "The check compares from `8554eb19e` and reports `unchanged` for story and plan." Key example Contributor merge: "The check compares from `e12c55f8` and reports `unchanged`." Evaluation: "A valid claim with unchanged source proceeds". Condition: several best common bases, only some holding the Take, source unchanged. | slice 2 |  |
| 2 | The report names the chosen Taken base. Scope bullet 1: "The report names it as `base`." Qualification: the base named is the one at which the story is Taken and from which the check compared (`8554eb19e` in Sibling import, `e12c55f8` in Contributor merge). | slice 2 |  |
| 3 | Single-base behavior is preserved. Scope bullet 2: "With one best common base, behavior and output stay as they are." | slice 3 |  |
| 4 | A genuine target amendment on a several-base graph is still reported. Key example Genuine amendment: "on the sibling-import graph, trunk then adds a promise to the story section. The check reports `amended` for the story with its `change`". Evaluation: "a genuine target amendment still receives the ordinary freshness disposition". | slice 2 |  |
| 5 | Absorb writes that amendment. Key example Genuine amendment: "and `absorb` writes it." Condition: same sibling-import graph with the trunk amendment to the story section. | slice 2 |  |
| 6 | `not-taken` refusal stays. Scope bullet 3: "Refusals stay: `not-taken` when fetched trunk lacks the Taken entry". Evaluation: "a missing or ambiguous claim still produces a refusal" (missing on trunk). | slice 2 |  |
| 7 | `not-taken-at-base` refusal stays when no best common base holds the Take. Scope bullet 3: "`not-taken-at-base` when no best common base holds it". Key example Missing claim: "a branch whose every best common base predates the Take, such as one at `db8ca9099`, is refused `not-taken-at-base`." Evaluation: "a missing or ambiguous claim still produces a refusal" (missing at base). | slice 2 |  |
| 8 | The `not-taken-at-base` refusal names every examined base. Scope bullet 3: "naming every base it examined". Condition: the refusal in id 7; distinctly observable when more than one best common base was examined and none holds the Take. | slice 2 |  |
| 9 | `no-common-base` refusal stays. Scope bullet 3: "Refusals stay: … and `no-common-base`." | slice 2 |  |
| 10 | Disagreeing Taken bases are refused and named. Scope bullet 4: "When several bases hold the Take and their text of a compared record differs, the check refuses and names them". Key example Disagreeing bases: "two best common bases both hold the Take and trunk amended the plan between them. The check refuses, naming both." Evaluation: "a missing or ambiguous claim still produces a refusal" (ambiguous). | slice 3 |  |
| 11 | The rest of the check's contract is unchanged. Scope bullet 5: "Comparison, `from` selection, absorb, exit codes, and inputs are unchanged." | slice 3 |  |
| 12 | The check has no publishing side effects. Scope bullet 5: "The check still commits and pushes nothing." | slice 3 |  |
| 13 | The script header describes the new base choice. Scope bullet 6: "The script header … describe[s] the base as chosen here." | slice 3 |  |
| 14 | The source freshness reference describes the new base choice. Scope bullet 6: "the source freshness reference (Distribution/src/skills/dough-execute-plan/references/source-freshness.md) describe[s] the base as chosen here." | slice 3 |  |
