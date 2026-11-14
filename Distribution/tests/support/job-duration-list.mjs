// @ts-check
// File-boundary encoding for synthetic runner duration facts. Rows retain the
// caller's order; allocation and refresh own their sorting behavior.
import { fileURLToPath } from "node:url";
import { formatTimes } from "../../../scripts/duration-list.mjs";
import { makeMe } from "./makeMe.mjs";

/** @param {Parameters<typeof formatTimes>[0]} seconds @param {string} [header] */
export function durationListText(seconds, header) {
  const rows = [...seconds].flatMap((entry) => formatTimes([entry]));
  return [...(header === undefined ? [] : [header]), ...rows, ""].join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let args = process.argv.slice(2);
  let header;
  if (args[0] === "--header") {
    header = args[1];
    args = args.slice(2);
  }
  if (args.length % 2 !== 0)
    throw new Error("duration facts require <seconds> <label> pairs");
  /** @type {[string, number][]} */
  const entries = [];
  for (let index = 0; index < args.length; index += 2)
    entries.push([args[index + 1], Number(args[index])]);
  process.stdout.write(
    durationListText(makeMe.jobDurations.with(entries).please(), header),
  );
}
