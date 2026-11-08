// @ts-check
import {
  renderBacklog,
  renderEntry,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs";

/** @typedef {Parameters<typeof renderEntry>[0]} BacklogEntry */

/**
 * Write an ordinary published backlog from its membership facts. Tests that
 * exercise particular input bytes can supply those directly to their harness.
 * @param {{ taken?: readonly BacklogEntry[], queued?: readonly BacklogEntry[], direction?: string }} facts
 * @returns {string}
 */
export function renderPublishedBacklog({
  taken = [],
  queued = [],
  direction = "",
}) {
  const lines = ["# Product backlog", ""];
  if (direction) lines.push("## Near-future direction", "", direction, "");
  lines.push("## Taken", "");
  if (taken.length) lines.push(...taken.map(renderEntry), "");
  lines.push("## Backlog list", "", ...queued.map(renderEntry));
  return renderBacklog({ lines, newline: "\n", hasFinalNewline: true });
}
