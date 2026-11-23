# Source-only review

Fresh general-purpose reviewer `source_review` received only the selected SEED-345 story's Goal, Scope, Key examples and Evaluation. The launch instructed the reviewer to use only those inputs, read no files, change nothing and return independently observable commitments. The launch and settled return are retained in the execution conversation.

ODF-329 supplies the baseline. ODF-529 owns lint failures in unchanged consumers. Allowing a mechanical fix before an expensive proof run is rationale for C3–C5.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C1 | The project’s existing focused proof chooses the command. | slice 1 | observed: Accepted proof paragraph 2 and implementation-return.md Representative use: project chooses the literal ESLint command in focused proof |
| C2 | The project’s existing focused proof chooses the owned paths to check. | slice 1 | observed: Accepted proof paragraph 2 and replay event argument array: the project selects dashboard/src/attachedTerminal.ts |
| C3 | The project-supplied, read-only command checks those owned paths as part of existing focused proof before affected proof starts. | slice 1 | observed: scoped-lint-replay-events.json scoped-defective and scoped-lint-resumed-events.json scoped-repaired-proof: lint precedes focused proof and input hashes agree |
| C4 | Assigning to the injected terminal socket parameter makes the project lint command exit unsuccessfully on `no-param-reassign` while the worker is still editing. | slice 1 | observed: scoped-defective.out: injected socket assignment exits 1 with no-param-reassign |
| C5 | The failing scoped lint leaves affected proof pending until the edit is corrected. | slice 1 | observed: scoped-defective.out contains no FOCUSED PROOF START and the replay event records no selected cases before repair |
| C6 | The corrected edit passes the scoped check. | slice 1 | observed: scoped-repaired-proof.stderr and resumed event: scoped lint passes in 3.90 s |
| C7 | The corrected edit continues to focused proof. | slice 1 | observed: scoped-repaired-proof.out and cases.json: proof marker, dashboard typecheck and all four selected Chromium cases pass |
| C8 | The corrected edit proceeds to ordinary delivery without the defect-driven delivery retry. | slice 1 | observed: scoped-repaired-guard.out and Git trace2: first actual guarded attempt commits with the normal staged hook |
| C9 | Clean authored paths pass the configured scoped check. | slice 1 | observed: scoped-initially-clean.stderr and resumed event: scoped lint passes in 2.12 s |
| C10 | A clean edit goes directly to existing proof after the scoped check passes. | slice 1 | observed: scoped-initially-clean.out: focused marker followed by ordinary dashboard typecheck |
| C11 | A refactor that edits a checked path renews that path’s check through the existing proof reuse rule. | slice 1 | observed: scoped-refactor-renewed event and scoped-refactor-guard.out: checked attachment hash changed, lint and proof renewed, ordinary guard passes |
| C12 | If the project supplies only staged lint, focused proof runs as usual. | slice 1 | observed: staged-only-usual-proof event and stdout: wrapper supplies only usual dashboard typecheck and starts it with no worker lint |
| C13 | If the project supplies only staged lint, normal delivery checks run as usual. | slice 1 | observed: staged-only-usual-guard.out and Git trace2: selective formatter, staged lint hook and local commit succeed |
| C14 | If the project supplies only whole-repository lint, focused proof runs as usual. | slice 1 | observed: whole-repository-only-usual-proof event and stdout: wrapper supplies usual dashboard typecheck with no fallback lint |
| C15 | If the project supplies only whole-repository lint, normal delivery checks run as usual. | slice 1 | observed: whole-repository-only-usual-guard.out and Git trace2: unchanged delivery checks run and local commit succeeds |
| C16 | The shipped worker brief drops its duplicate reference to hook-owned lint. | slice 1 | observed: Distribution/src/skills/dough-execute-plan/references/delegation.md stop-before-delivery bullet and diff |
| C17 | The delivery rule continues to own the staged hook. | slice 1 | observed: unchanged deliver-the-change.md step 7 and real .githooks/pre-commit in successful guard trace |
| C18 | The delivery rule continues to own formatting. | slice 1 | observed: unchanged deliver-the-change.md step 4 and real formatter invoked at fresh preparation |
| C19 | The delivery rule continues to own guarded publication. | slice 1 | observed: unchanged deliver-the-change.md step 8 and fresh-increment.md publish-authority continuation |
| C20 | The trial adds zero shipped instructions. | slice 1 | observed: product diff only removes the four substantive words and joins the remaining list grammar |
| C21 | The trial adds zero script branches. | slice 1 | observed: product diff contains no script changes |
| C22 | The trial adds zero configuration. | slice 1 | observed: product diff contains no configuration changes |
| C23 | The trial adds zero report fields. | slice 1 | observed: product diff leaves return-report.md and its existing focused command and proof fields unchanged |
| C24 | The slice plan records evidence comparing extra scoped lint cost on a clean edit with the guard refusal, coordination, and proof rerun observed for the defective edit. | slice 1 | observed: PLAN.md Accepted proof: two versus one proof and guard attempts, one repair per path, 2.12 s clean cost |
| C25 | The slice plan records the keep-or-drop decision. | slice 1 | observed: PLAN.md Accepted proof Decision and ODF-329 Response evaluation retain the deletion |
| C26 | The change is retained only if the replay catches the failure earlier, reduces rework, and leaves the shipped workflow simpler. | slice 1 | observed: PLAN.md Accepted proof compares the same defect, avoided repeated work, and shorter brief before retaining |
