# Independent source review

Launch: coordinator used `collaboration.spawn_agent`, task
`/root/proof_source_review`, `fork_turns: none`. The reviewer was told to use
only the following original instruction and agreed amendments, read no project
files, change nothing, and return separately numbered commitments,
qualifications, journeys and exclusions without deriving slice ownership or
acceptance. The actual returned commitments are retained below.

Input, original user instruction:

> Let's do that. Update the proof guidance and dashboard wording so normal test runs leave proof untouched, and an explicit option generates or refreshes the proof. Each client project need to config a command or skill for each intent entry for generating the proof. Update open dough carefully. Make a new release and update all the client projects and ask each client project to update themselves accordingly. I guess so far only projects with cucumber test need updates.

Input, agreed amendments:

Proof is a deliberate published verification snapshot in the repository.
Normal passing and failing runs produce no proof changes. Explicit recording
runs the same tests and refreshes only actually executed scenarios; an executed
final unsuccessful scenario clears its earlier success, while scenarios not
run retain their observations. Keep compact maintained snapshots rather than
accumulating run files. Published proof is historical, includes observed
time/source limits, and must not imply current product health or a whole-suite
pass from mixed runs. One recording option handles both generation and refresh.
Proof may accompany meaningful product commits or intentional proof checkpoint
commits. Existing snapshots should remain readable before migration; no
dashboard execution of commands or new framework adapters was requested.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Update the proof guidance in Open Dough. | slice 1 | observed: src/skills/dough-test-optimization/references/cucumber-proof.md |
| 2 | Update the dashboard wording. | slice 1 | observed: dashboard/src/IntentProofGeneration.tsx; dashboard/tests/intent-proof-generation.spec.ts file/folder/location assertions |
| 3 | Keep published proof as a verification snapshot in the repository. | slice 1 | observed: src/skills/dough-test-optimization/references/cucumber-proof.md Commit proof; dashboard/server/intentProofRead.ts pinned published Git read unchanged |
| 4 | Make recording proof a deliberate, explicit action. | slice 1 | observed: src/skills/dough-test-optimization/references/cucumber-proof.md Configure once: option checked before proof I/O |
| 5 | Normal passing test runs leave proof unchanged. | slice 1 | observed: src/skills/dough-test-optimization/references/cucumber-proof.md first paragraph: normal passing runs byte-for-byte unchanged |
| 6 | Normal failing test runs leave proof unchanged. | slice 1 | observed: src/skills/dough-test-optimization/references/cucumber-proof.md first paragraph: normal failing runs byte-for-byte unchanged |
| 7 | Provide an explicit recording option that generates proof. | slice 1 | observed: src/skills/dough-test-optimization/references/cucumber-proof.md Configure once: project-owned option and proofGeneration command/skill |
| 8 | The same recording option refreshes existing proof. | slice 1 | observed: src/skills/dough-test-optimization/references/cucumber-proof.md same option generates or refreshes |
| 9 | Explicit recording runs the same tests. | slice 1 | observed: src/skills/dough-test-optimization/references/cucumber-proof.md first paragraph: same tests, selection, diagnostics and exit meaning |
| 10 | Refresh observations only for scenarios actually executed. | slice 1 | observed: src/skills/dough-test-optimization/references/cucumber-proof.md Refresh successful proof explicitly: executed identities only |
| 11 | When an executed scenario finishes unsuccessfully, clear its earlier recorded success. | slice 1 | observed: src/skills/dough-test-optimization/references/cucumber-proof.md Refresh successful proof explicitly: final unsuccessful executed identity clears prior success |
| 12 | Preserve observations for scenarios not run. | slice 1 | observed: src/skills/dough-test-optimization/references/cucumber-proof.md Refresh successful proof explicitly: unexecuted identities preserved |
| 13 | Maintain compact proof snapshots. | slice 1 | observed: src/skills/dough-test-optimization/references/cucumber-proof.md stable snapshot and atomic refresh |
| 14 | Avoid accumulating separate run files. | slice 1 | observed: src/skills/dough-test-optimization/references/cucumber-proof.md maintained latest.json or stable per-feature snapshots, no per-run accumulation |
| 15 | Present published proof as historical evidence. | slice 1 | observed: dashboard/src/IntentProofGeneration.tsx; dashboard/tests/intent-proof-generation.spec.ts published-snapshot assertion |
| 16 | Include the observation time. | slice 1 | observed: dashboard/src/IntentProof.tsx ObservedCells; dashboard/tests/intent-cucumber-proof.spec.ts exact per-row observed times |
| 17 | Communicate the limits of the recorded source. | slice 1 | observed: dashboard/src/IntentProof.tsx ObservedCells; dashboard/tests/intent-cucumber-proof.spec.ts exact per-row commits and feature-version limits; src/skills/dough-test-optimization/references/cucumber-proof.md Reading proof |
| 18 | Do not imply that published proof establishes current product health. | slice 1 | observed: dashboard/src/IntentProofGeneration.tsx; dashboard/tests/intent-proof-generation.spec.ts present-product-health qualification |
| 19 | Do not imply a whole-suite pass from observations combined across different runs. | slice 1 | observed: dashboard/src/IntentProofGeneration.tsx mixed-run qualification; dashboard/tests/intent-cucumber-proof.spec.ts independent times and no suite-verdict assertion |
| 20 | Each client project configures a proof-generation command or skill for each intent entry. | slice 1 | observed: dashboard/src/proofGeneration.ts; dashboard/tests/boundary/authenticated-read-intent-proof-generation.spec.ts command/skill/config errors; dashboard/tests/intent-proof-generation.spec.ts inert instructions in file/folder/location |
| 21 | Keep existing snapshots readable before migration. | slice 1 | observed: dashboard/tests/intent-proof-generation.spec.ts missing/malformed instructions retain successful proof; dashboard/tests/intent-cucumber-proof.spec.ts legacy observations remain readable |
| 22 | Make a new Open Dough release. | slice 2 | |
| 23 | Update all client projects. | slice 2 | |
| 24 | Ask each client project to update itself accordingly. | slice 2 | |

## Qualifications and journeys returned

- Command or skill are alternatives; neither is individually mandatory.
- Product commits and intentional proof checkpoints are permitted publication
  occasions, not mandatory commits. Care supplies no particular extra procedure.
- The Cucumber-only expectation is tentative; inspect applicability rather
  than silently excluding projects from guidance rollout.
- Ordinary passing and failing runs leave older snapshots unchanged.
- A focused explicit run updates executed A and B and preserves unexecuted C;
  an unsuccessful A clears its earlier success.
- Successes for A and B from different runs do not become a whole-suite pass.
- A project may choose a command for one entry and a skill for another.
- Legacy snapshots remain readable before migration.
- Dashboard command execution and new framework adapters are excluded.

## Acceptance scope

The source slice supplies reusable guidance and dashboard reading behavior.
Project producer implementation follows the explicit migration requests in
slice 2; installed guidance alone is not evidence of migrated producers.
