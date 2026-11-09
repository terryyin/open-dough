# Source-only review

**Story:** SEED-010#plan-cohesive-reorganization-of-oversized-files

**Launch:** Fresh general-purpose reviewer with no conversation inheritance.
Inputs were only the story Goal, Scope, Scope limits, and Key examples from
`.planning/seeds/SEED-010-learn-from-execution-retrospectives.md#plan-cohesive-reorganization-of-oversized-files`.
No plan, return, product, proof, or current-slice scope was supplied. The
reviewer was instructed to read no other project files and change nothing.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Developers whose slice edits an already-oversized file understand and own that file’s cohesive reorganization before implementation. | slice 1 | observed: architectural-thinking.md Decide cohesive reorganization; representative walk example 1–2 |
| 2 | The independent refactor pass can validate that reorganization instead of first discovering its cost and asking for an exception. | slice 1 | observed: refactor-checks.md + SKILL.md validate delivered decision; no surprise exception on fulfilled ODF-152 split |
| 3 | Planning applies to expected edits to files already over 250 lines, including comment-only changes. | slice 1 | observed: architectural-thinking.md includes comment-only / expected edits over size check |
| 4.1 | Planning identifies the file and its current size. | slice 1 | observed: architectural-thinking.md records file and current size |
| 4.2 | Planning identifies cohesive responsibilities and seams. | slice 1 | observed: architectural-thinking.md records cohesive responsibilities and seams |
| 4.3 | Planning identifies affected callers and preserved proof. | slice 1 | observed: architectural-thinking.md records affected callers and preserved proof |
| 4.4 | Planning identifies the slice owning reorganization. | slice 1 | observed: architectural-thinking.md records owning slice |
| 5 | Necessary Structure belongs with or immediately before the Behavior it enables. | slice 1 | observed: architectural-thinking.md Assign necessary reorganization within Behavior or preceding Structure |
| 6 | Delegation carries that reorganization decision and the existing file-size rule. | slice 1 | observed: delegation.md carries decision + file-size check link; quick brief without fabricating a plan |
| 7 | A newly discovered oversized edit gets the same decision before editing. | slice 1 | observed: delegation.md newly discovered oversized edit returns via reassessment before dependent work |
| 8 | Where scope or architecture needs human judgment, the affected work waits for the developer’s recorded decision with its exact scope. | slice 1 | observed: architectural-thinking.md human-judgment stop with exact decision scope |
| 9 | Keep the existing 250-line rule. | slice 1 | observed: architectural-thinking.md / refactor-checks.md keep existing 250-line check |
| 10 | Keep the cohesive-design requirement. | slice 1 | observed: architectural-thinking.md keep cohesive-seam requirement |
| 11 | Short diffs do not waive the 250-line rule or cohesive-design requirement. | slice 1 | observed: architectural-thinking.md + refactor-checks.md short diffs do not waive |
| 12 | Prior exceptions do not waive the 250-line rule or cohesive-design requirement. | slice 1 | observed: architectural-thinking.md + refactor-checks.md prior exceptions do not waive |
| 13 | A plan mention does not waive the 250-line rule or cohesive-design requirement. | slice 1 | observed: architectural-thinking.md + refactor-checks.md plan mention does not waive |
| 14 | Refactoring checks the delivered reorganization. | slice 1 | observed: refactor SKILL.md + refactor-checks.md check delivered reorganization |
| 15 | On a missed file, unmet decision, or contrary evidence, return the file, missing decision, and affected work through the existing stop. | slice 1 | observed: refactor SKILL.md size-decision stop returns file, missing decision, affected work |
| 16 | That stop path does not grant an automatic exception. | slice 1 | observed: refactor-checks.md no automatic exception |
| 17 | That stop path does not treat a mechanical split as the solution. | slice 1 | observed: refactor SKILL.md / refactor-checks.md mechanical split is not the solution |
| 18 | Preserve existing authority for cross-subsystem work and exceptions. | slice 1 | observed: architectural-thinking.md + existing refactor subsystem gate preserved |
| 19 | No repository-wide cleanup. |  | E1 |
| 20 | No new size scanner. |  | E2 |
| 21 | No relaxed limit. |  | E3 |
| 22 | No executable-plan size policy (ODF-362). |  | E4 |
| 23 | No general policy for new/near-limit files. |  | E5 |
| 24 | Release and rollout remain separate work. |  | E6 |
| 25 | Record the delivered response and ordinary-use criterion at ODF-152. | slice 1 | observed: ODF-152.md Response / limit + ordinary-use criterion |
| 26 | Note relevance at ODF-189, ODF-195, and ODF-207. | slice 1 | observed: ODF-189/195/207 follow-up relevance notes without resolving or adding counts |
| 27 | Record the first containing release only when verified; keep it pending until then. | slice 1 | observed: ODF-152.md First containing release: pending |
| 28 | Delivery and representative review do not themselves establish improvement. | slice 1 | observed: ODF-152.md Delivery and representative review do not themselves establish improvement |
| 29 | Trigger/journey: Plan 552’s comment-only edits would touch six already-oversized files → planning and the implementation brief assign their design-led reorganization before those edits, using cohesive watcher observations, fault/origin guards, page-free proof and review responsibilities rather than arbitrary cuts → refactoring validates the delivered structure and preserved behavior. | slice 1 | observed: representative walk example 1 against revised planning/delegation/refactor entry points |
| 30 | Trigger/journey: An ordinary small edit touches an oversized file → the plan or brief names its size, seams and owning slice before implementation → the implementer delivers that reorganization and the refactor pass finds no surprise size decision for that file. | slice 1 | observed: ODF-152 companion split + response as ordinary-small-edit case; brief names size/seams/owner |
| 31 | Qualification/example: This story’s ODF-152 response update is one such ordinary-small-edit case. | slice 1 | observed: ODF-152.md response update is the ordinary-small-edit case |
| 32 | Trigger/journey: A proposed reorganization conflicts with an Accepted ADR or needs unapproved cross-subsystem work → stop the affected path before implementation for the developer’s decision, retaining other work. | slice 1 | observed: architectural-thinking.md ADR/cross-subsystem stop; representative walk example 3 |
| 33 | Qualification: A recorded exception applies only to its stated file, work, and conditions. | slice 1 | observed: architectural-thinking.md precisely scoped developer decision is not a standing waiver |
| 34 | Trigger/journey: Implementation or refactoring reveals an additional oversized file or an incomplete planned reorganization → identify the new evidence and missing decision, preserve the work, and use the existing stop/replanning path. | slice 1 | observed: delegation reassessment + refactor JIDOKA STOP for new/undelivered evidence; walk example 4 |
| 35 | Qualification: Do not claim refactoring complete merely because the plan mentioned size. | slice 1 | observed: refactor-checks.md plan mention without delivered seams is not clean; SKILL.md same |
