// The pre-correction input shape is intentional: preserve the supplier's exact
// agreement as prose, without the canonical waiting block added after intervention.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { makeMe } from "../../../../tests/support/makeMe.mjs";

const [stage, workspace] = process.argv.slice(2);
if (stage === "basis") {
  const file = join(
    workspace,
    ".planning/seeds/SEED-324-landed-ci-repeat-checks.md",
  );
  const text = readFileSync(file, "utf8");
  const block = /```json dough-story-dependencies\n([^\n]+)\n```/.exec(text);
  if (!block) throw new Error("The shared supplier agreement is missing");
  const agreement = makeMe.aSupplierAgreement
    .with(JSON.parse(block[1]).dependencies[0])
    .please();
  writeFileSync(
    file,
    text.replace(
      block[0],
      [
        "Supplier agreement retained by this execution:",
        `Supplier: ${agreement.supplier.identity}.`,
        `Implementation: ${agreement.implementation}`,
        `Rationale: ${agreement.rationale}`,
        `Required published outcome: ${agreement.condition}`,
      ].join("\n\n"),
    ),
  );
} else if (stage === "delivered") {
  const file = join(
    workspace,
    ".planning/slice-plans/607-close-landed-ci-repeat-check-gaps/PLAN.md",
  );
  writeFileSync(
    file,
    readFileSync(file, "utf8").replace(
      "The story's dependency block records the\nsupplier outcome this correction needs;",
      "The execution's supplier agreement records the\npublished outcome and stability evidence this correction needs;",
    ),
  );
}
