import { expect, test } from "@playwright/test";
import { appendFileSync } from "node:fs";

for (const title of ["selected alpha", "unselected beta"]) {
  test(title, () => {
    expect(1 + 1).toBe(2);
    const log = process.env["PROOF_EXECUTION_LOG"];
    if (log) appendFileSync(log, `${title}\n`);
  });
}
