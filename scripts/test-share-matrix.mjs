#!/usr/bin/env node
// Selects a CI share's checks from the `distribution-tests` matrix of a
// workflow file. The matrix lists the shares and gives each share but the last
// its checks as space-separated glob patterns; the last share runs every
// discovered check no earlier share claims:
//
//       matrix:
//         share: [1, 2, 3]
//         include:
//           - share: 1
//             tests: Distribution/tests/skills/dough-execute-plan/**
//           - share: 2
//             tests: Distribution/evaluation/** scripts/ci-*.sh
//
// Only that form is read (the repository has no YAML parser). A check two
// shares match, or a pattern that matches no check, is refused.
//
//   node scripts/test-share-matrix.mjs WORKFLOW [SPLIT]
//     labels on stdin, NUL-separated; prints the labels of share i for SPLIT
//     `<i>/<n>` (OPEN_DOUGH_TEST_SPLIT; n is the declared share count), or
//     every label without SPLIT, NUL-terminated in bytewise order.

import { readFileSync } from "node:fs";
import { matchesGlob } from "node:path";
import { pathToFileURL } from "node:url";

const JOB = "distribution-tests";

export class ShareMatrixError extends Error {}

function refuse(file, message) {
  throw new ShareMatrixError(`FAIL: ${file}: ${message}`);
}

const indentOf = (line) => /^ */.exec(line)[0].length;

// The lines more indented than the line at `start`, up to the first that is not.
function blockAfter(lines, start) {
  const indent = indentOf(lines[start]);
  const block = [];
  for (const line of lines.slice(start + 1)) {
    if (line.trim() === "" || line.trimStart().startsWith("#")) continue;
    if (indentOf(line) <= indent) break;
    block.push(line);
  }
  return block;
}

/**
 * Reads the `distribution-tests` matrix: the shares in listed order and each
 * pattern share's globs.
 * @param {string} text workflow file text
 * @param {string} file workflow file name, for messages
 */
export function readShareMatrix(text, file) {
  const fail = (message) => refuse(file, message);
  const lines = text.split("\n");
  const job = lines.findIndex((line) => line.trim() === `${JOB}:`);
  if (job < 0) fail(`no ${JOB} job.`);
  const jobBlock = blockAfter(lines, job);
  const matrixAt = jobBlock.findIndex((line) => line.trim() === "matrix:");
  if (matrixAt < 0) fail(`the ${JOB} job has no matrix.`);
  let shares;
  const entries = [];
  for (const line of blockAfter(jobBlock, matrixAt)) {
    const content = line.trim();
    const list = /^share: \[([^\]]*)\]$/.exec(content);
    const entry = /^- share: (\S+)$/.exec(content);
    const tests = /^tests: (.+)$/.exec(content);
    if (list) {
      shares = list[1].split(",").map((share) => share.trim());
    } else if (entry) {
      entries.push({ share: entry[1], patterns: undefined });
    } else if (tests && entries.at(-1)?.patterns === undefined) {
      entries.at(-1).patterns = tests[1].trim().split(/ +/);
    } else if (content !== "include:") {
      fail(`unsupported ${JOB} matrix line "${content}".`);
    }
  }
  if (!shares?.length || shares.some((share) => !/^\d+$/.test(share))) {
    fail(`the ${JOB} matrix needs a share: [1, 2, ...] list.`);
  }
  const last = shares.at(-1);
  const patterns = new Map();
  for (const { share, patterns: globs } of entries) {
    if (!shares.includes(share)) {
      fail(`include share ${share} is not in share: [${shares.join(", ")}].`);
    }
    if (share === last) {
      fail(`the last share ${last} runs the rest and takes no patterns.`);
    }
    if (patterns.has(share)) fail(`share ${share} is included twice.`);
    if (globs === undefined) fail(`include share ${share} has no tests.`);
    patterns.set(share, globs);
  }
  for (const share of shares.slice(0, -1)) {
    if (!patterns.has(share)) fail(`share ${share} has no tests patterns.`);
  }
  return { file, shares, patterns };
}

/**
 * The share number a `<i>/<n>` split selects; refused unless n is the
 * matrix's share count and i one of its shares.
 * @param {ReturnType<typeof readShareMatrix>} matrix
 * @param {string} split
 */
export function shareOfSplit({ file, shares }, split) {
  const parsed = /^([1-9]\d*)\/([1-9]\d*)$/.exec(split);
  if (
    !parsed ||
    Number(parsed[2]) !== shares.length ||
    !shares.includes(parsed[1])
  ) {
    refuse(
      file,
      `OPEN_DOUGH_TEST_SPLIT=${split} is not <i>/<n> with n the share count and i a share of share: [${shares.join(", ")}].`,
    );
  }
  return parsed[1];
}

const bytewise = (a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b));

/**
 * The labels one share runs, or every label when `share` is undefined, in
 * bytewise order. Refuses an overlap or an unmatched pattern either way.
 * @param {ReturnType<typeof readShareMatrix>} matrix
 * @param {string[]} labels discovered check labels
 * @param {string} [share] one of `matrix.shares` (see shareOfSplit)
 */
export function selectShare(matrix, labels, share) {
  const { file, shares, patterns } = matrix;
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
  const matrix = readShareMatrix(text, workflow);
  const share = split === undefined ? undefined : shareOfSplit(matrix, split);
  const selected = selectShare(matrix, labels, share);
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
