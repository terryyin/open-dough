// What the tool says about a change it has just made: which work item moved,
// which list holds it now, and what the operation deliberately left alone.
// Every report is written from a change already published, so it describes
// the file as it now stands rather than what the caller asked for. This is
// the counterpart of the usage text, which describes the tool itself.

import { queueHeading, takenHeading } from "./product-backlog-document.mjs";

export function reportAdd(identity, file) {
  return `Added "${identity}" to "## ${queueHeading}" in ${file}.`;
}

export function reportPlace(outcome, file) {
  const { identity } = outcome.entry;
  const from = outcome.returned
    ? `Returned "${identity}" from "## ${takenHeading}" to`
    : `Placed "${identity}" in`;
  return `${from} "## ${queueHeading}" in ${file}, at the requested position.`;
}

export function reportTake(outcome, file) {
  const { identity } = outcome.entry;
  if (outcome.result === "taken") {
    return `Took "${identity}" into "## ${takenHeading}" in ${file}.`;
  }
  const ending =
    outcome.result === "linked"
      ? "; its plan link was added and its place kept."
      : ", unchanged.";
  return `"${identity}" is already in "## ${takenHeading}" in ${file}${ending}`;
}

export function reportComplete(outcome, file) {
  const { identity, list, href } = outcome.entry;
  return (
    `Removed "${identity}" from "## ${list}" in ${file}. ` +
    `Its canonical home ${href} was not changed.`
  );
}

export function reportRefresh(outcome, file) {
  const { identity, list } = outcome.entry;
  if (outcome.changed.length === 0) {
    return `"${identity}" already reads as requested in ${file}, unchanged.`;
  }
  return (
    `Refreshed the ${outcome.changed.join(" and ")} of "${identity}" in ` +
    `"## ${list}" in ${file}; its identity and its place are unchanged.`
  );
}

export function reportAdopt(outcome, file) {
  if (outcome.written.length === 0) {
    return (
      `All ${outcome.entries} active entries already record their identity; ` +
      `${file} is unchanged.`
    );
  }
  const report = [
    `Recorded ${outcome.written.length} identities for ${outcome.entries} active entries:`,
    ...outcome.written.map((home) => `  ${home.identity} in ${home.relative}`),
  ];
  if (outcome.relabelled.length > 0) {
    report.push(
      `Entries now naming their identity in ${file}:`,
      ...outcome.relabelled.map(
        (entry) => `  ${entry.identity} — ${entry.title}`,
      ),
    );
  }
  return report.join("\n");
}
