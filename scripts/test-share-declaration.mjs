// Reads a job's shard declaration from a workflow file: the shares in listed
// order and the space-separated glob patterns of each share but the last,
// which runs the rest. Two forms are read. The `distribution-tests` job's
// matrix:
//
//       matrix:
//         share: [1, 2, 3]
//         include:
//           - share: 1
//             tests: Distribution/tests/skills/dough-execute-plan/**
//           - share: 2
//             tests: Distribution/evaluation/** scripts/ci-*.sh
//
// And a browser group's caller job, whose `shards` input lists the shares and
// whose block `specs` input gives the patterns (a one-shard job needs none):
//
//       with:
//         shards: "[1, 2, 3]"
//         specs: |
//           1: dashboard/backend-tests/launches/** dashboard/backend-tests/runtime/**
//           2: dashboard/backend-tests/sessions/**
//
// Only those forms are read (the repository has no YAML parser).

const MATRIX_JOB = "distribution-tests";

export class ShareMatrixError extends Error {}

export function refuse(file, message) {
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

const shareList = (listed) => listed.split(",").map((share) => share.trim());
const isShareList = (shares) =>
  shares?.length > 0 && shares.every((share) => /^\d+$/.test(share));

// The declared shares in listed order and each pattern share's globs, refused
// in the form's words (`say`) unless each entry names a share but the last,
// once, and every share but the last has an entry.
function declaredShares(fail, shares, entries, say) {
  const last = shares.at(-1);
  const patterns = new Map();
  for (const { share, globs } of entries) {
    if (!shares.includes(share)) fail(say.outside(share));
    if (share === last) fail(say.last(last));
    if (patterns.has(share)) fail(say.twice(share));
    patterns.set(share, globs);
  }
  for (const share of shares.slice(0, -1)) {
    if (!patterns.has(share)) fail(say.missing(share));
  }
  return patterns;
}

// A job matrix's shares and include entries.
function readMatrix(job, block, fail) {
  let shares;
  const entries = [];
  for (const line of block) {
    const content = line.trim();
    const list = /^share: \[([^\]]*)\]$/.exec(content);
    const entry = /^- share: (\S+)$/.exec(content);
    const tests = /^tests: (.+)$/.exec(content);
    if (list) {
      shares = shareList(list[1]);
    } else if (entry) {
      entries.push({ share: entry[1], globs: undefined });
    } else if (tests && entries.at(-1)?.globs === undefined) {
      entries.at(-1).globs = tests[1].trim().split(/ +/);
    } else if (content !== "include:") {
      fail(`unsupported ${job} matrix line "${content}".`);
    }
  }
  if (!isShareList(shares)) {
    fail(`the ${job} matrix needs a share: [1, 2, ...] list.`);
  }
  const untested = entries.find(({ globs }) => globs === undefined);
  if (untested) fail(`include share ${untested.share} has no tests.`);
  const listed = `share: [${shares.join(", ")}]`;
  return {
    shares,
    patterns: declaredShares(fail, shares, entries, {
      outside: (share) => `include share ${share} is not in ${listed}.`,
      last: (share) =>
        `the last share ${share} runs the rest and takes no patterns.`,
      twice: (share) => `share ${share} is included twice.`,
      missing: (share) => `share ${share} has no tests patterns.`,
    }),
  };
}

// A browser group's caller job inputs: the `shards` list and `specs` block.
function readCallerInputs(job, block, fail) {
  const childIndent = indentOf(block[0] ?? "");
  let shares;
  let specs = [];
  block.forEach((line, at) => {
    if (indentOf(line) !== childIndent) return;
    const content = line.trim();
    const list = /^shards: "\[([^\]]*)\]"$/.exec(content);
    if (list) {
      shares = shareList(list[1]);
    } else if (content === "specs: |") {
      specs = blockAfter(block, at);
    } else if (/^specs:/.test(content)) {
      fail(`the ${job} job's specs input needs the block form "specs: |".`);
    }
  });
  if (!isShareList(shares)) {
    fail(`the ${job} job needs a shards: "[1, 2, ...]" input.`);
  }
  const entries = specs.map((line) => {
    const entry = /^(\S+): (.+)$/.exec(line.trim());
    if (!entry) fail(`unsupported ${job} specs line "${line.trim()}".`);
    return { share: entry[1], globs: entry[2].trim().split(/ +/) };
  });
  const listed = `shards: [${shares.join(", ")}]`;
  return {
    shares,
    patterns: declaredShares(fail, shares, entries, {
      outside: (share) => `specs shard ${share} is not in ${listed}.`,
      last: (share) =>
        `the last shard ${share} runs the rest and takes no patterns.`,
      twice: (share) => `specs shard ${share} is given twice.`,
      missing: (share) => `shard ${share} has no specs patterns.`,
    }),
  };
}

/**
 * Reads a job's shard declaration: the `distribution-tests` job's matrix, or a
 * browser group's caller job inputs. Either way, the shares in listed order and
 * each pattern share's globs.
 * @param {string} text workflow file text
 * @param {string} file workflow file name, for messages
 * @param {string} [job] the job id
 */
export function readShareDeclaration(text, file, job = MATRIX_JOB) {
  const fail = (message) => refuse(file, message);
  const lines = text.split("\n");
  const jobAt = lines.findIndex((line) => line.trim() === `${job}:`);
  if (jobAt < 0) fail(`no ${job} job.`);
  const jobBlock = blockAfter(lines, jobAt);
  const matrixAt = jobBlock.findIndex((line) => line.trim() === "matrix:");
  const withAt = jobBlock.findIndex((line) => line.trim() === "with:");
  if (matrixAt >= 0) {
    return { file, ...readMatrix(job, blockAfter(jobBlock, matrixAt), fail) };
  }
  if (withAt >= 0) {
    const inputs = blockAfter(jobBlock, withAt);
    return { file, ...readCallerInputs(job, inputs, fail) };
  }
  return fail(`the ${job} job has no matrix or with: inputs.`);
}
