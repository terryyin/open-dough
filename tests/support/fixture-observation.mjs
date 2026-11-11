// @ts-check
// Filesystem and Git observations shared by the fixture isolation proofs.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * One prepared object pack in a bare repository or checkout's Git directory.
 * @param {string} gitDirectory
 * @returns {string}
 */
export function objectPack(gitDirectory) {
  const objects = join(gitDirectory, "objects", "pack");
  const file = readdirSync(objects).find((name) => name.endsWith(".pack"));
  assert(file);
  return join(objects, file);
}

/**
 * The content of every file under `directory`, by relative path.
 * @param {string} directory
 * @returns {[string, string][]}
 */
export function fixtureFiles(directory) {
  return readdirSync(directory, { recursive: true, encoding: "utf8" })
    .sort()
    .filter((file) => statSync(join(directory, file)).isFile())
    .map((file) => [
      file,
      createHash("sha256")
        .update(readFileSync(join(directory, file)))
        .digest("hex"),
    ]);
}

/**
 * The number of commits Git made while `GIT_TRACE` named `file`.
 * @param {string} file
 */
export function commitsTraced(file) {
  return existsSync(file)
    ? readFileSync(file, "utf8")
        .split("\n")
        .filter((line) => / built-in: git commit /.test(line)).length
    : 0;
}
