// @ts-check
// A checkout's files as a revision renderer reads and compares them.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Every file in the checkout at `root`, by repository-relative path, outside
// Git's own metadata.
/** @param {string} root @param {string} [directory] @returns {Record<string, Buffer>} */
export function checkoutFiles(root, directory = "") {
  /** @type {Record<string, Buffer>} */
  const files = {};
  for (const entry of readdirSync(join(root, directory), {
    withFileTypes: true,
  })) {
    if (directory === "" && entry.name === ".git") continue;
    const path = directory === "" ? entry.name : `${directory}/${entry.name}`;
    if (entry.isDirectory()) Object.assign(files, checkoutFiles(root, path));
    else files[path] = readFileSync(join(root, path));
  }
  return files;
}

/** @param {string | Buffer} a @param {string | Buffer} b */
export const sameBytes = (a, b) =>
  Buffer.compare(
    Buffer.isBuffer(a) ? a : Buffer.from(a),
    Buffer.isBuffer(b) ? b : Buffer.from(b),
  ) === 0;
