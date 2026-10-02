// Commands shared by dependency proofs. Homes are planted as starting input;
// the real CLI produces each dependency record being observed.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { run } from "./product-backlog-fixture.mjs";

export function dependency(supplier, overrides = {}) {
  return {
    supplier: { identity: supplier.identity, href: supplier.link },
    implementation: "Shared endpoint interpretation",
    rationale:
      "The supplier must deliver the endpoint contract before this story can validate its consumer behavior; normal reconciliation cannot supply the missing contract.",
    condition: "The selected endpoint contract is completed and integrated.",
    state: "waiting",
    ...overrides,
  };
}

export async function readDependencies(project, story) {
  const result = await run(project, [
    "read-dependencies",
    "--link",
    story.link,
  ]);
  if (result.code !== 0) throw new Error(result.stderr);
  return JSON.parse(result.stdout);
}

export async function updateDependency(project, story, entry, expectedBasis) {
  const input = join(
    project.inputDirectory ?? project.directory,
    "dependency-input.json",
  );
  writeFileSync(input, JSON.stringify(entry));
  const basis = expectedBasis ?? (await readDependencies(project, story)).basis;
  return run(project, [
    "update-dependency",
    "--identity",
    story.identity,
    "--link",
    story.link,
    "--dependency-file",
    input,
    "--expect-dependencies",
    basis,
  ]);
}

export const resolution = {
  revision: "1234567890123456789012345678901234567890",
  path: ".planning/seeds/supplier.md",
  summary:
    "The completed supplier outcome and integration prove the endpoint contract.",
};
