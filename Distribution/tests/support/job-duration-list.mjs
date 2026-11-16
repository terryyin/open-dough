// @ts-check
// File-boundary encoding for synthetic duration facts. Rows retain the
// caller's order; allocation and refresh own their sorting behavior.
import { formatTimes } from "../../../scripts/duration-list.mjs";

/** @param {Parameters<typeof formatTimes>[0]} seconds @param {string} [header] */
export function durationListText(seconds, header) {
  const rows = [...seconds].flatMap((entry) => formatTimes([entry]));
  return [...(header === undefined ? [] : [header]), ...rows, ""].join("\n");
}
