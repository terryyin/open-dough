#!/usr/bin/env node
// Selects a CI share's checks from a job's shard declaration in a workflow
// file (scripts/test-share-declaration.mjs reads it): each share but the last
// runs the checks its glob patterns match, and the last share runs every
// discovered check no earlier share claims. A check two shares match, or a
// pattern that matches no check, is refused. The command line selects for the
// `distribution-tests` job; browser groups select through
// dashboard/tests/support/testFiles.mjs.
//
//   node scripts/test-share-matrix.mjs WORKFLOW [SPLIT]
//     labels on stdin, NUL-separated; prints the labels of share i for SPLIT
//     `<i>/<n>` (OPEN_DOUGH_TEST_SPLIT; n is the declared share count), or
//     every label without SPLIT, NUL-terminated in bytewise order.

import { readFileSync } from "node:fs";
import { matchesGlob } from "node:path";
import { pathToFileURL } from "node:url";
import {
  readShareDeclaration,
  refuse,
  ShareMatrixError,
} from "./test-share-declaration.mjs";

/**
 * The share number a `<i>/<n>` split selects; refused, naming `setting`, unless
 * n is the declared share count and i one of its shares.
 * @param {ReturnType<typeof readShareDeclaration>} declaration
 * @param {string} split
 * @param {string} [setting] the variable that carried the split
 */
export function shareOfSplit(
  { file, shares },
  split,
  setting = "OPEN_DOUGH_TEST_SPLIT",
) {
  const parsed = /^([1-9]\d*)\/([1-9]\d*)$/.exec(split);
  if (
    !parsed ||
    Number(parsed[2]) !== shares.length ||
    !shares.includes(parsed[1])
  ) {
    refuse(
      file,
      `${setting}=${split} is not <i>/<n> with n the share count and i a share of share: [${shares.join(", ")}].`,
    );
  }
  return parsed[1];
}

const bytewise = (a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b));

/**
 * The labels one share runs, or every label when `share` is undefined, in
 * bytewise order. Refuses an overlap or an unmatched pattern either way.
 * @param {ReturnType<typeof readShareDeclaration>} declaration
 * @param {string[]} labels discovered check labels
 * @param {string} [share] one of `declaration.shares` (see shareOfSplit)
 */
export function selectShare(declaration, labels, share) {
  const { file, shares, patterns } = declaration;
  const claimedBy = new Map();
  for (const [owner, globs] of patterns) {
    for (const glob of globs) {
      const matched = labels.filter((label) => matchesGlob(label, glob));
      if (matched.length === 0) {
        refuse(file, `pattern ${glob} of share ${owner} matches no check.`);
      }
      for (const label of matched) {
        const earlier = claimedBy.get(label);
        if (earlier !== undefined && earlier !== owner) {
          refuse(
            file,
            `${label} matches the patterns of shares ${earlier} and ${owner}.`,
          );
        }
        claimedBy.set(label, owner);
      }
    }
  }
  const owner = (label) => claimedBy.get(label) ?? shares.at(-1);
  return [...new Set(labels)]
    .filter((label) => share === undefined || owner(label) === share)
    .sort(bytewise);
}

function main([workflow, split, ...rest]) {
  if (workflow === undefined || rest.length > 0) {
    throw new ShareMatrixError(
      "FAIL: test-share-matrix takes WORKFLOW [SPLIT], labels on stdin.",
    );
  }
  let text;
  try {
    text = readFileSync(workflow, "utf8");
  } catch {
    throw new ShareMatrixError(`FAIL: cannot read ${workflow}.`);
  }
  const labels = readFileSync(0, "utf8").split("\0").filter(Boolean);
  const declaration = readShareDeclaration(text, workflow);
  const share =
    split === undefined ? undefined : shareOfSplit(declaration, split);
  const selected = selectShare(declaration, labels, share);
  process.stdout.write(selected.map((label) => `${label}\0`).join(""));
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    if (!(error instanceof ShareMatrixError)) throw error;
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}
