import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";
import { readHome } from "../../dough-product-backlog/scripts/product-backlog-home-reader.mjs";
import { splitHref } from "../../dough-product-backlog/scripts/product-backlog-identity.mjs";
import { readPlanSlices } from "../../dough-product-backlog/scripts/product-backlog-plan-reader.mjs";
import { isDirectCliEntry } from "./ci-direct-entry.mjs";
import {
  normalizeStoryQuote,
  readStoryObligations,
} from "./story-obligation-reader.mjs";

export { readStoryObligations } from "./story-obligation-reader.mjs";

// Checks recorded ownership, not whether the coordinator's story judgment is right.
export async function checkStoryObligations(planPath, { slice } = {}) {
  const source = await readFile(planPath, "utf8");
  const record = readStoryObligations(source);
  const problems = [...record.problems];
  const result = () => ({
    ok: problems.length === 0,
    entryCount: record.entries.length,
    ...(problems.length && { problems }),
  });
  if (!record.entries.length) return result();
  const read = readPlanSlices(source);
  if (read.status !== "interpreted")
    problems.push({ reason: "unreadable-slices", message: read.problem });
  const slices = new Map((read.slices ?? []).map((item) => [item.index, item]));
  for (const item of read.slices ?? []) {
    if (slices.get(item.index) !== item)
      problems.push({ reason: "ambiguous-slice", slice: item.index });
  }
  if (slice !== undefined && !slices.has(slice))
    problems.push({ reason: "unknown-slice", slice });
  let story;
  if (!record.sourceHref) problems.push({ reason: "missing-story-source" });
  else {
    try {
      const storySource = await readFile(
        resolve(dirname(planPath), splitHref(record.sourceHref).path),
        "utf8",
      );
      const home = readHome(storySource, record.sourceHref);
      story = normalizeStoryQuote(
        home.document.lines
          .slice(home.region.start, home.region.end)
          .join("\n"),
      );
    } catch (error) {
      problems.push({
        reason: "unreadable-story-source",
        message: error.message,
      });
    }
  }
  for (const entry of record.entries) {
    const problem = (reason, fields = {}) =>
      problems.push({ entry: entry.id, reason, ...fields });
    if (story !== undefined) {
      for (const [field, quote] of [
        ["Story clause", entry.storyClause],
        ["Disposition", entry.disposition?.quote],
      ]) {
        if (
          quote !== undefined &&
          (!normalizeStoryQuote(quote) ||
            !story.includes(normalizeStoryQuote(quote)))
        )
          problem("quote-not-in-story", { field, quote });
      }
    }
    if (read.status !== "interpreted") continue;
    if (entry.reportedSlice !== undefined && !slices.has(entry.reportedSlice))
      problem("dangling-reported-slice", { slice: entry.reportedSlice });
    const disposition = entry.disposition;
    if (!disposition) continue;
    if (
      disposition.type === "return" &&
      (slices.get(entry.reportedSlice)?.status === "done" ||
        slice === entry.reportedSlice)
    )
      problem("open-obligation", { slice: entry.reportedSlice });
    if (disposition.type === "receiving") {
      const receiver = slices.get(disposition.slice);
      if (!receiver)
        problem("dangling-receiving-slice", { slice: disposition.slice });
      else if (receiver.status === "done" || slice === disposition.slice)
        problem("open-obligation", { slice: disposition.slice });
      else if (disposition.slice <= entry.reportedSlice)
        problem("invalid-receiving-slice", { slice: disposition.slice });
    }
    if (disposition.type === "proved" && !slices.has(disposition.slice))
      problem("dangling-proof-slice", { slice: disposition.slice });
  }
  return result();
}

if (isDirectCliEntry(import.meta.url, process.argv[1])) {
  let result;
  try {
    const { values, positionals } = parseArgs({
      options: { plan: { type: "string" }, slice: { type: "string" } },
      allowPositionals: true,
    });
    if (
      positionals.length !== 1 ||
      positionals[0] !== "check" ||
      !values.plan ||
      (values.slice !== undefined && !/^[1-9]\d*$/.test(values.slice))
    ) {
      throw new Error(
        "usage: story-obligations.mjs check --plan <PLAN.md> [--slice <N>]",
      );
    }
    result = await checkStoryObligations(resolve(values.plan), {
      ...(values.slice && { slice: Number(values.slice) }),
    });
  } catch (error) {
    result = {
      ok: false,
      problems: [{ reason: "invalid-input", message: error.message }],
    };
  }
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (!result.ok) process.exitCode = 1;
}
