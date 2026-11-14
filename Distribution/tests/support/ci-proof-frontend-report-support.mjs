// Shared action-replay setup for the optional frontend test proof: the
// frontend group producer's declared fragment inputs and proof-record path
// for one part, and the workflow's expect declarations of the browser test
// groups' entries, which include that frontend entry.
import { declaredPart, producers } from "./ci-proof-action-fixtures.mjs";

export const frontendEntry = "dashboard/frontend-tests";
export const expect = producers
  .filter(({ inputs }) => inputs.root)
  .map(({ inputs, parts }) => `${inputs.root}=${parts}:case`)
  .join(" ");

// GROUP's PART on the runner TEMP, given PARTS when a case needs more parts
// than CI runs: its fragments inputs and its proof record's path.
export function declaredGroup(group, part, temp, parts) {
  const declared = declaredPart(group, part, temp, parts);
  return { inputs: declared.inputs, report: declared.report("PROOF_RECORD") };
}

export const declaredFrontend = (part, temp, parts) =>
  declaredGroup("dashboard-frontend", part, temp, parts);
