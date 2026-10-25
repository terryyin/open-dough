import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { splitHref } from "../../dough-product-backlog/scripts/product-backlog-identity.mjs";
import {
  commitmentId,
  planLinks,
  readSection,
  unfencedLines,
} from "./story-obligation-reader.mjs";

// Reads the retained source-only reviewer return that a plan links, and checks
// that each returned commitment has an owner and, once due, an observation.

function tableCells(line) {
  const cells = [];
  let cell = "";
  const body = line
    .trim()
    .replace(/^\|/, "")
    .replace(/(?<!\\)\|$/, "");
  for (let index = 0; index < body.length; index += 1) {
    if (body[index] === "\\" && body[index + 1] === "|") {
      cell += "|";
      index += 1;
    } else if (body[index] === "|") {
      cells.push(cell.trim());
      cell = "";
    } else cell += body[index];
  }
  cells.push(cell.trim());
  return cells;
}

const unreadable = (message) => ({
  commitments: [],
  problems: [{ reason: "unreadable-source-review", message }],
});

// Reads the `## Commitments` table: one row per returned id with its source
// text, allocated slice, and observation or disposing obligation id.
export function readSourceReview(source) {
  const section = readSection(unfencedLines(source), /^## +Commitments\s*$/);
  if (section.count !== 1)
    return unreadable(
      section.count
        ? "The source review has more than one “## Commitments” section."
        : "The source review has no “## Commitments” section.",
    );
  const table = section.lines.filter((line) => /^\s*\|/.test(line));
  if (table.length && !/^\s*\|[\s:|-]+$/.test(table[1] ?? ""))
    return unreadable(
      "The “## Commitments” table needs a header row and a separator row.",
    );
  const problems = [];
  const commitments = [];
  for (const line of table.slice(2)) {
    const cells = tableCells(line);
    const [id, text, allocation, state] = cells;
    const commitment = { id, text };
    const malformed = () =>
      problems.push({ commitment: id, reason: "malformed-commitment", line });
    if (cells.length !== 4 || !commitmentId.test(id ?? "") || !text) {
      malformed();
      continue;
    }
    if (allocation) {
      const slice = /^slice ([1-9]\d*)$/.exec(allocation);
      if (!slice) {
        malformed();
        continue;
      }
      commitment.slice = Number(slice[1]);
    }
    if (state) {
      const observed = /^observed: *(\S.*)$/.exec(state);
      if (observed) commitment.observed = observed[1];
      else if (commitmentId.test(state)) commitment.obligation = state;
      else {
        malformed();
        continue;
      }
    }
    commitments.push(commitment);
  }
  const ids = new Set();
  for (const commitment of commitments) {
    if (ids.has(commitment.id))
      problems.push({
        commitment: commitment.id,
        reason: "duplicate-commitment",
      });
    ids.add(commitment.id);
  }
  if (!commitments.length && !problems.length)
    return unreadable(
      "The source review's “## Commitments” table has no rows.",
    );
  return { commitments, problems };
}

// The plan's `**Source review:**` link names the retained reviewer return.
// Plans without it keep obligation-only checks.
export async function readLinkedSourceReview(planPath, planSource) {
  const links = planLinks(unfencedLines(planSource), "Source review");
  if (!links.length) return { linked: false, commitments: [], problems: [] };
  if (links.length > 1)
    return {
      linked: true,
      ...unreadable("The plan links more than one source review."),
    };
  try {
    const path = resolve(dirname(planPath), splitHref(links[0]).path);
    return { linked: true, ...readSourceReview(await readFile(path, "utf8")) };
  } catch (error) {
    return { linked: true, ...unreadable(error.message) };
  }
}

// Every row needs an existing slice or obligation; a row allocated to a
// finishing slice, or any row at completion, also needs its observation.
export function commitmentProblems(
  commitments,
  { slices, entryIds, completion, isDoneOrCommitting },
) {
  const problems = [];
  for (const item of commitments) {
    const problem = (reason, fields = {}) =>
      problems.push({ commitment: item.id, reason, ...fields });
    if (item.slice === undefined ? !item.obligation : !slices.has(item.slice))
      problem("unallocated-commitment", {
        ...(item.slice !== undefined && { slice: item.slice }),
      });
    if (item.obligation && !entryIds.has(item.obligation))
      problem("unobserved-commitment", {
        obligation: item.obligation,
        message: "The named story obligation does not exist.",
      });
    else if (item.observed === undefined && !item.obligation) {
      if (completion)
        problem("unobserved-commitment", { boundary: "completion" });
      else if (item.slice !== undefined && isDoneOrCommitting(item.slice))
        problem("unobserved-commitment", { slice: item.slice });
    }
  }
  return problems;
}
