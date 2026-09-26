// Builds an admission native-journey fixture from the real startup fixtures
// and CLIs, then prints its coordinates as JSON.
//
// admission-investigation: a queued trunk plus an investigation instrument
// (`scripts/probe.js`, which leaves `.probe-ran` in the fixture root) and no
// backlog entry for the mission.
// admission-continuation: the same trunk where an unselected investigation
// was admitted to Taken by this journey's publisher, then its plan and ready
// assessment were recorded by the real record-state operation and published
// as ordinary preparation.
//
// Usage: node git-publication-native-admission-fixture.mjs <source-dir>
//   <journey> <parent>
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const [sourceDir, journey, parent] = process.argv.slice(2);
const scripts = join(sourceDir, "src/skills/dough-execute-plan/scripts");
const load = (name) => import(pathToFileURL(join(scripts, name)).href);
const { createQueuedTrunk, readyContributing } = await load(
  "workspace-publication-fixtures.mjs",
);
const { publishPlannedPreparation, storySection, withFacts } = await load(
  "workspace-publication-admission-fixtures.mjs",
);
const { startExecution } = await load("execution-start.mjs");

const git = (cwd, ...args) =>
  execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
const trunk = await createQueuedTrunk({
  contributing: readyContributing,
  durableCommandEvidence: true,
  parent,
});
const { fixture, origin, integration } = trunk;
writeFileSync(
  join(integration, "scripts/probe.js"),
  `require("fs").writeFileSync(${JSON.stringify(join(fixture, ".probe-ran"))}, "1");\nconsole.log("startup spends most of its time loading configuration");\n`,
);
git(integration, "add", "scripts/probe.js");
git(integration, "commit", "-qm", "add the startup probe");
git(integration, "push", "-q", "origin", "main");

const coordinates = {
  root: fixture,
  origin,
  integration,
  workspace: join(fixture, "native-execution"),
  branch: "exec/native-admission",
  publisher: `native-${journey}`,
  identity: "",
};

if (journey === "admission-continuation") {
  const identity = "SEED-N#slow";
  const link = "seeds/N.md#slow";
  const seed = withFacts(
    `---\nid: SEED-N\n---\n\n# Seed N\n\n${storySection("slow", identity, "Investigate slow start", "Find why startup is slow and make it fast.")}`,
    link,
    identity,
    "unselected",
  );
  writeFileSync(join(integration, ".planning/seeds/N.md"), seed);
  const admitted = await startExecution({
    integration,
    workspace: coordinates.workspace,
    branch: coordinates.branch,
    identity,
    publisherId: coordinates.publisher,
    mode: "trunk",
    remote: "origin",
    target: "main",
    pushAuthorized: true,
    workspaceAuthorized: true,
    admit: true,
    link,
    title: "Investigate slow start",
  });
  if (admitted.status !== "published")
    throw new Error(`admission failed: ${JSON.stringify(admitted)}`);
  // Implementation was authorized; ordinary preparation publishes its plan.
  await publishPlannedPreparation(
    trunk,
    { identity, link, planHref: "../quick/N/PLAN.md" },
    {
      plan: "# Make startup fast\n\n### 1. Add feature.txt containing 'implemented'\nType: Behavior\nStatus: planned\n",
      ready: true,
    },
  );
  coordinates.identity = identity;
}

coordinates.base = git(origin, "rev-parse", "refs/heads/main");
process.stdout.write(JSON.stringify(coordinates));
