// Shared Proof-absence wording Intent shows when it reads no proof for a
// kind (../src/IntentProofProblem.tsx).

export const proofReadForFamiliesSoFar =
  "Proof is read for Gherkin feature files, pytest files, Vitest tests and Playwright tests so far.";

export const setRunnerThatRecordsProof = (locationPath: string) =>
  `Set runner on ${locationPath} in .planning/open-dough.json to the runner that records its proof: vitest or playwright.`;

export const notRecordedFollowing = (reference: string) =>
  `Proof is not recorded for this project. To configure deliberate proof generation, follow ${reference} in this project’s installed Open Dough skills.`;
