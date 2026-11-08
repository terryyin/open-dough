// @ts-check
import {
  renderBacklog,
  renderEntry,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs";

/** @typedef {{ identity: string, title: string, href: string, plan?: { label: string, target: string } }} BacklogEntry */

/** @param {BacklogEntry} entry */
const renderPublishedEntry = (entry) =>
  renderEntry({ ...entry, plan: entry.plan });

/**
 * Write an ordinary published backlog from its membership facts. Tests that
 * exercise particular input bytes can supply those directly to their harness.
 * @param {{ taken?: readonly BacklogEntry[], queued?: readonly BacklogEntry[], direction?: string }} facts
 * @param {{ blankAfterEmptyQueue?: boolean }} [format]
 * @returns {string}
 */
export function renderPublishedBacklog(
  { taken = [], queued = [], direction = "" },
  { blankAfterEmptyQueue = true } = {},
) {
  const lines = ["# Product backlog", ""];
  if (direction) lines.push("## Near-future direction", "", direction, "");
  lines.push("## Taken", "");
  if (taken.length) lines.push(...taken.map(renderPublishedEntry), "");
  lines.push("## Backlog list");
  if (queued.length || blankAfterEmptyQueue)
    lines.push("", ...queued.map(renderPublishedEntry));
  return renderBacklog({ lines, newline: "\n", hasFinalNewline: true });
}
