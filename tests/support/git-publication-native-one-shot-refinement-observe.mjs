// Observes the preparation facts a one-shot refinement committed for a queued
// story at `HEAD` of its retained `workspace`, against the trunk `base` it
// started from. Prints `field: value` lines: the story's recorded
// `story-refinement`, `story-approach` and `story-assessment` (empty when its
// section carries no story-state block), `story-queued` (the story's entry is
// in the Backlog list), `queue-kept` (the queued order is the base's), and
// `sibling-section-kept` (the sibling's seed section is unchanged). With no
// workspace, every value is empty.
//
// Usage: node git-publication-native-one-shot-refinement-observe.mjs
//   <source-dir> <workspace> <base> <identity> <sibling> <seed-path>
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const [sourceDir, workspace, base, identity, sibling, seed] =
  process.argv.slice(2);
const { parseBacklog, queueHeading, takenHeading } = await import(
  pathToFileURL(
    join(
      sourceDir,
      "src/skills/dough-product-backlog/scripts/product-backlog-document.mjs",
    ),
  ).href
);

const fields = [
  "story-refinement",
  "story-approach",
  "story-assessment",
  "story-queued",
  "queue-kept",
  "sibling-section-kept",
];
const print = (values) =>
  process.stdout.write(
    fields.map((field) => `${field}: ${values[field] ?? ""}\n`).join(""),
  );

if (!workspace || !existsSync(workspace)) {
  print({});
  process.exit(0);
}

const show = (rev, path) => {
  try {
    return execFileSync("git", ["show", `${rev}:${path}`], {
      cwd: workspace,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return "";
  }
};
// The seed section of `id`: from its anchor to the next anchor.
const section = (rev, id) => {
  const text = show(rev, seed);
  const start = text.indexOf(`<a id="${id.split("#")[1]}"></a>`);
  if (start < 0) return "";
  const next = text.indexOf('<a id="', start + 1);
  return text.slice(start, next < 0 ? undefined : next);
};
const entries = (rev) =>
  parseBacklog(show(rev, ".planning/PRODUCT-BACKLOG.md")).entries;
const queued = (rev) =>
  entries(rev)
    .filter((entry) => entry.list !== takenHeading)
    .map((entry) => entry.identity)
    .join(",");

const block = section("HEAD", identity).match(
  /```json dough-story-state\n(.*)\n```/,
);
const readState = () => {
  try {
    return block ? JSON.parse(block[1]) : {};
  } catch {
    return { refinement: "unreadable" };
  }
};
const state = readState();
print({
  "story-refinement": state.refinement,
  "story-approach": state.approach,
  "story-assessment": state.assessment,
  "story-queued": entries("HEAD").some(
    (entry) => entry.identity === identity && entry.list === queueHeading,
  ),
  "queue-kept": queued("HEAD") === queued(base),
  "sibling-section-kept": section("HEAD", sibling) === section(base, sibling),
});
