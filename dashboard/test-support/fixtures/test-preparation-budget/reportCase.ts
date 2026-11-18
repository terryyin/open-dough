// Appends what the running fixture-spec case observed, under its title, to
// the case record its outer proof reads
// (../../../backend-tests/support/preparationProofRun.ts `cases()`).
import { appendFileSync } from "node:fs";
import { test } from "../../support/preparationPage.ts";

export function reportCase(observed: Readonly<Record<string, unknown>>) {
  const record = process.env["OPEN_DOUGH_PREPARATION_PROOF_CASES"];
  if (record === undefined) throw new Error("Missing case record path");
  appendFileSync(
    record,
    `${JSON.stringify({ title: test.info().title, ...observed })}\n`,
  );
}
