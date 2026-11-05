// Shared Proof-absence wording Intent shows when it reads no proof for a
// kind (../src/IntentProofProblem.tsx).

export const proofReadForFamiliesSoFar =
  "Proof is read for Gherkin feature files, pytest files, Vitest tests, Playwright tests and Node test files so far.";

export const setRunnerThatRecordsProof = (locationPath: string) =>
  `Set runner on ${locationPath} in .planning/open-dough.json to the runner that records its proof: vitest or playwright or node:test.`;

// Every typescript/javascript runner reference, as NotRecorded joins them
// when the location declares none.
export const everyRunnerProofReferences =
  "dough-test-optimization/references/vitest-proof.md or dough-test-optimization/references/playwright-proof.md or dough-test-optimization/references/node-test-proof.md";

export const notRecordedFollowing = (reference: string) =>
  `Proof is not recorded for this project. To configure deliberate proof generation, follow ${reference} in this project’s installed Open Dough skills.`;
