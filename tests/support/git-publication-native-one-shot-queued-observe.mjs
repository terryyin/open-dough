// Observes how remote trunk at `tip` holds a queued story completed as
// one-shot work, against the `base` it started from. Prints `field: value`
// lines: `story-listed` (the story still has a backlog entry),
// `story-section-present`, `sibling-section-present` (their identities in the
// story's seed), `plan-present`, and `queue-kept` (the queued order at the tip
// is the base's with only the story removed, so the sibling kept its entry and
// position).
//
// Usage: node git-publication-native-one-shot-queued-observe.mjs <source-dir>
//   <origin> <base> <tip> <identity> <sibling> <seed-path> <plan-path>
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const [sourceDir, origin, base, tip, identity, sibling, seed, plan] =
  process.argv.slice(2);
const { parseBacklog, takenHeading } = await import(
  pathToFileURL(
    join(
      sourceDir,
      "src/skills/dough-product-backlog/scripts/product-backlog-document.mjs",
    ),
  ).href
);

const show = (rev, path) => {
  try {
    return execFileSync("git", ["show", `${rev}:${path}`], {
      cwd: origin,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
};
const entries = (rev) =>
  parseBacklog(show(rev, ".planning/PRODUCT-BACKLOG.md") ?? "").entries;
const queued = (rev) =>
  entries(rev)
    .filter((entry) => entry.list !== takenHeading)
    .map((entry) => entry.identity);
const seedText = show(tip, seed) ?? "";
const names = (id) => seedText.includes(`**Identity:** ${id}\n`);
const expected = queued(base).filter((id) => id !== identity);

const lines = [
  `story-listed: ${entries(tip).some((entry) => entry.identity === identity)}`,
  `story-section-present: ${names(identity)}`,
  `sibling-section-present: ${names(sibling)}`,
  `plan-present: ${show(tip, plan) !== null}`,
  `queue-kept: ${queued(tip).join(",") === expected.join(",")}`,
];
process.stdout.write(`${lines.join("\n")}\n`);
