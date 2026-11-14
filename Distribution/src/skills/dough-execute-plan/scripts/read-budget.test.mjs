// Each boundary row in SKILL.md's read table names reads that resolve under
// the skill and fit one tool result on the smallest supported host.
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

test("each boundary row's reads resolve and fit one tool result on the smallest supported host", () => {
  const rows = tableRows();
  assert.ok(rows.length > 0, "the boundary-reads table has rows");
  for (const row of rows) {
    assert.ok(row.links.length > 0, `${row.boundary} names a read`);
    const bytes = rowBytes(row);
    assert.ok(
      bytes <= BUDGET_BYTES,
      `${row.boundary}: ${bytes} bytes exceeds ${BUDGET_BYTES} by ${bytes - BUDGET_BYTES}`,
    );
  }
});
