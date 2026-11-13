// Shared action-replay setup for the optional frontend test proof: the
// dashboard producer's declared fragment inputs and proof-record path for one
// part, plus the workflow expect string that includes that frontend entry.
import {
  evaluated,
  input,
  producers,
  stepInputs,
} from "./ci-proof-action-fixtures.mjs";

export const frontendEntry = "dashboard/frontend-tests";
export const expect =
  "e2e=13:case dashboard/tests=13:case dashboard/frontend-tests=13:case dashboard/backend-tests=13:case";

export function declaredDashboard(part, temp) {
  const declared = producers.find((producer) => producer.job === "dashboard");
  const context = { temp, part, parts: declared.parts };
  const [step] = declared.proof;
  return {
    inputs: Object.fromEntries(
      Object.entries(stepInputs(step)).map(([name, value]) => [
        name,
        evaluated(value, context),
      ]),
    ),
    report: evaluated(
      input(declared.suite, "OPEN_DOUGH_DASHBOARD_PROOF_RECORD"),
      context,
    ),
  };
}
