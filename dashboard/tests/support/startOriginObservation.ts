import assert from "node:assert/strict";
// Filesystem observations shared by the installed-origin isolation proofs.
import { readdirSync } from "node:fs";
import path from "node:path";

export { fixtureFiles } from "../../../tests/support/fixture-observation.mjs";

export function objectPack(directory: string): string {
  const objects = path.join(directory, "objects", "pack");
  const file = readdirSync(objects).find((name) => name.endsWith(".pack"));
  assert(file);
  return path.join(objects, file);
}
