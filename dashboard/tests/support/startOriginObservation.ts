import assert from "node:assert/strict";
// Filesystem observations shared by the installed-origin isolation proofs.
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

export function fixtureFiles(directory: string) {
  return readdirSync(directory, { recursive: true, encoding: "utf8" })
    .sort()
    .filter((file) => statSync(path.join(directory, file)).isFile())
    .map((file) => [
      file,
      createHash("sha256")
        .update(readFileSync(path.join(directory, file)))
        .digest("hex"),
    ]);
}

export function objectPack(directory: string): string {
  const objects = path.join(directory, "objects", "pack");
  const file = readdirSync(objects).find((name) => name.endsWith(".pack"));
  assert(file);
  return path.join(objects, file);
}
