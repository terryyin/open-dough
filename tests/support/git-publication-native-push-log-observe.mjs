// Observes every push a remote accepted from its post-receive push log (one
// `old new ref` line per updated ref) and the backlog at each pushed trunk
// tip, so an assessor can judge intermediate states that later pushes hide.
// Prints `field: value` lines: `ref-update-count` (all ref updates),
// `trunk-push-count`, one `pushed-tip: <sha> taken=<identities>` line per
// pushed trunk tip, and `pushed-taken` (every identity any pushed trunk tip
// listed under Taken, comma-separated).
//
// Usage: node git-publication-native-push-log-observe.mjs <source-dir>
//   <origin> <push-log>
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const [sourceDir, origin, pushLog] = process.argv.slice(2);
const trunkRef = "refs/heads/main";
const { parseBacklog, takenHeading } = await import(
  pathToFileURL(
    join(
      sourceDir,
      "src/skills/dough-product-backlog/scripts/product-backlog-document.mjs",
    ),
  ).href
);

const backlogPath = ".planning/PRODUCT-BACKLOG.md";
const deleted = /^0+$/;
const updates = (existsSync(pushLog) ? readFileSync(pushLog, "utf8") : "")
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split(" "));
const takenAt = (sha) => {
  let backlog;
  try {
    backlog = execFileSync("git", ["show", `${sha}:${backlogPath}`], {
      cwd: origin,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return [];
  }
  return parseBacklog(backlog)
    .entries.filter((entry) => entry.list === takenHeading)
    .map((entry) => entry.identity);
};

const tips = updates
  .filter(([, sha, ref]) => ref === trunkRef && !deleted.test(sha))
  .map(([, sha]) => [sha, takenAt(sha)]);
const lines = [
  `ref-update-count: ${updates.length}`,
  `trunk-push-count: ${tips.length}`,
  ...tips.map(([sha, taken]) => `pushed-tip: ${sha} taken=${taken.join(",")}`),
  `pushed-taken: ${[...new Set(tips.flatMap(([, taken]) => taken))].join(",")}`,
];
process.stdout.write(`${lines.join("\n")}\n`);
