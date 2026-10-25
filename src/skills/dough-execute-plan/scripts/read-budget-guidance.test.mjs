// Guidance structure (not proof an agent follows the text): each boundary of
// execution names its reads in one table row, and one row fits one tool result
// on the smallest supported host.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { markdownSection as section } from "../../../../tests/support/markdown-section.mjs";

const skill = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(skill, path), "utf8");

// One tool result's budget. Codex truncates a tool result at
// `TruncationPolicy::Tokens(10_000)`; at the 3.5 bytes per token this check
// assumes, that is 35,000 bytes. Claude Code replaces a Bash result above
// 30,000 characters with a saved file and a 2KB preview. The smaller wins.
const BUDGET_BYTES = 30_000;

const HEADING = "## Read guidance at each boundary";

// Boundary cells in execution order, the skill body first.
const BOUNDARIES = [
  /skill body/i,
  /established start/i,
  /execution workspace/i,
  /Codex.*execution start/i,
  /first implementation delegation/i,
  /accepting a return/i,
  /delivery/i,
  /other hosts/i,
  /notification/i,
  /finish/i,
];

// Passages a row's named passages send the coordinator to at that boundary
// every time, listed by judgment rather than inferred from reference prose.
const OBLIGATION_INPUTS =
  "references/story-obligations.md#use-the-record-at-execution-boundaries";
const SOURCE_FRESHNESS = "references/source-freshness.md";
const REQUIRED_LINKS = [
  [/first implementation delegation/i, [OBLIGATION_INPUTS]],
  [
    /delivery/i,
    [
      "references/fresh-increment.md",
      "references/trunk-publication.md#publish-an-execution-increment-or-repair",
      "references/trunk-publication.md#publish-the-candidate",
      OBLIGATION_INPUTS,
    ],
  ],
  [
    /finish/i,
    ["references/ci-completion-wait.md", OBLIGATION_INPUTS, SOURCE_FRESHNESS],
  ],
];

// References an execution reads at first delegation, return, delivery, arming,
// workspace creation, publication, and retrieval; each stays reachable from a
// row.
const BOUNDARY_REFERENCES = [
  "references/delegation.md",
  "references/execution-decisions.md",
  "references/wrap-up.md",
  "references/ci-monitor.md",
  "references/ci-notify-codex.md",
  "references/ci-notify-hosts.md",
  "references/execution-location.md",
  "references/trunk-publication.md",
  "references/disposable-research.md",
];

// GitHub-style heading slug.
const slug = (heading) =>
  heading
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s/g, "-");

// The anchored heading's section: its heading line up to the next heading of
// the same or higher level.
function anchoredSection(text, anchor) {
  const lines = text.split("\n");
  const start = lines.findIndex((line) => {
    const match = /^(#{1,6})\s+(.*)$/.exec(line);
    return match && slug(match[2]) === anchor;
  });
  if (start === -1) return undefined;
  const level = /^#+/.exec(lines[start])[0].length;
  const end = lines.findIndex((line, index) => {
    const match = /^(#{1,6})\s/.exec(line);
    return index > start && match && match[1].length <= level;
  });
  return lines.slice(start, end === -1 ? undefined : end).join("\n");
}

function tableRows() {
  const body = section(read("SKILL.md"), HEADING);
  return body
    .split("\n")
    .filter((line) => line.startsWith("|"))
    .slice(2)
    .map((line) => {
      const [boundary, reads] = line.split("|").slice(1, -1);
      const links = [...reads.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => {
        const [path, anchor] = m[1].split("#");
        return { path: normalize(path), anchor };
      });
      return { boundary: boundary.trim(), links };
    });
}

const linkKey = ({ path, anchor }) => (anchor ? `${path}#${anchor}` : path);

function linkText({ path, anchor }) {
  const file = join(skill, path);
  assert.ok(existsSync(file), `${path} exists under the skill`);
  const text = readFileSync(file, "utf8");
  if (!anchor) return text;
  const passage = anchoredSection(text, anchor);
  assert.ok(passage !== undefined, `${path}#${anchor} names a heading`);
  return passage;
}

function rowBytes(row) {
  const seen = new Set();
  let bytes = 0;
  for (const link of row.links) {
    const key = linkKey(link);
    if (seen.has(key)) continue;
    seen.add(key);
    bytes += Buffer.byteLength(linkText(link), "utf8");
  }
  return bytes;
}

test("SKILL.md has one boundary-reads table in execution order", () => {
  const skillText = read("SKILL.md");
  assert.equal(skillText.split("\n").filter((l) => l === HEADING).length, 1);
  const rows = tableRows();
  assert.equal(rows.length, BOUNDARIES.length, "one row per boundary");
  rows.forEach((row, index) =>
    assert.match(row.boundary, BOUNDARIES[index], `row ${index + 1}`),
  );
  assert.deepEqual(
    rows[0].links.map((link) => link.path),
    ["SKILL.md"],
    "the first row reads the skill body alone",
  );
});

test("every link in the table resolves to a file or heading under the skill", () => {
  for (const row of tableRows()) {
    assert.ok(row.links.length > 0, `${row.boundary} names a read`);
    for (const link of row.links) linkText(link);
  }
});

test("each row fits one tool result on the smallest supported host", () => {
  for (const row of tableRows()) {
    const bytes = rowBytes(row);
    assert.ok(
      bytes <= BUDGET_BYTES,
      `${row.boundary}: ${bytes} bytes exceeds ${BUDGET_BYTES} by ${bytes - BUDGET_BYTES}`,
    );
  }
});

test("every boundary reference appears in a row", () => {
  const linked = new Set(
    tableRows().flatMap((row) => row.links.map((link) => link.path)),
  );
  for (const path of BOUNDARY_REFERENCES) {
    assert.ok(linked.has(normalize(path)), `${path} appears in a row`);
  }
});

// The table row whose boundary cell matches `boundary`.
function rowAt(rows, boundary) {
  const row = rows.find((candidate) => boundary.test(candidate.boundary));
  assert.ok(row, `a row matches ${boundary}`);
  return row;
}

test("each row names the passages its other reads require at that boundary", () => {
  const rows = tableRows();
  for (const [boundary, required] of REQUIRED_LINKS) {
    const row = rowAt(rows, boundary);
    const linked = new Set(row.links.map(linkKey));
    for (const link of required) {
      assert.ok(linked.has(normalize(link)), `${row.boundary} links ${link}`);
    }
  }
});

test("the delivery row reads only increment publication from trunk publication", () => {
  const trunkPublication = normalize("references/trunk-publication.md");
  const isTrunkPublication = (link) => link.startsWith(`${trunkPublication}#`);
  const [, required] = REQUIRED_LINKS.find(([boundary]) =>
    boundary.test("delivery"),
  );
  assert.deepEqual(
    rowAt(tableRows(), /delivery/i)
      .links.filter((link) => link.path === trunkPublication)
      .map(linkKey),
    required.map(normalize).filter(isTrunkPublication),
  );
});
