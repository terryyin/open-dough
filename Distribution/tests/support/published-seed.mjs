// @ts-check
// Ordinary seed sections from shared membership facts. Purpose prose and
// deliberate formatting stay at the call site; identity and title come from
// the MakeMe backlog entry the seed and backlog share.
import { splitHref } from "../../src/skills/dough-product-backlog/scripts/product-backlog-identity.mjs";

/**
 * @typedef {{ identity: string, title: string, href: string }} SeedMembership
 */

/** @param {SeedMembership} entry */
const seedId = ({ identity }) => identity.split("#", 1)[0] ?? identity;

/**
 * One story section whose identity and title match a backlog entry.
 * @param {SeedMembership} entry
 * @param {{ goal?: string, body?: string }} [prose]
 * @returns {string}
 */
export function renderStorySection(entry, { goal, body } = {}) {
  const { identity, title, href } = entry;
  const parts = [
    `<a id="${splitHref(href).anchor}"></a>`,
    "",
    `### ${title}`,
    "",
    `**Identity:** ${identity}`,
  ];
  if (goal !== undefined) parts.push("", `**Goal:** ${goal}`);
  if (body !== undefined && body !== "") parts.push("", body);
  return `${parts.join("\n")}\n`;
}

/**
 * A seed document with one story section and optional YAML front matter.
 * @param {SeedMembership} entry
 * @param {string} body
 * @param {string} [documentTitle]
 * @returns {string}
 */
export function renderStorySeed(
  entry,
  body,
  documentTitle = `Seed ${seedId(entry).replace(/^SEED-/, "")}`,
) {
  return `---\nid: ${seedId(entry)}\n---\n\n# ${documentTitle}\n\n${renderStorySection(entry, { body })}`;
}
