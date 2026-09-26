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
// admission-correction: trunk holds seed R with a completed story; its
// retrospective drafted, in the originating checkout only, a minimal
// correction story in that seed linked to its new correction plan, with the
// planned approach recorded and no backlog entry.
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
const { publishPlannedPreparation, storySection, withFacts, writeDraft } =
  await load("workspace-publication-admission-fixtures.mjs");
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
    { identity, link, planHref: "../slice-plans/N/PLAN.md" },
    {
      plan: "# Make startup fast\n\n### 1. Add feature.txt containing 'implemented'\nType: Behavior\nStatus: planned\n",
      ready: true,
    },
  );
  coordinates.identity = identity;
}

if (journey === "admission-correction") {
  const identity = "SEED-R#order-notes";
  const link = "seeds/R.md#order-notes";
  const completed = `---\nid: SEED-R\n---\n\n# Seed R\n\n${storySection("publish-notes", "SEED-R#publish-notes", "Publish release notes", "Readers find the notes of every tagged release.")}`;
  writeFileSync(join(integration, ".planning/seeds/R.md"), completed);
  git(integration, "add", ".planning/seeds/R.md");
  git(integration, "commit", "-qm", "complete Publish release notes");
  git(integration, "push", "-q", "origin", "main");
  writeDraft(
    trunk,
    ".planning/slice-plans/R/PLAN.md",
    `# Order release notes by tag date\n\n## Source\n\n**Identity:** ${identity}\n\nRetrospective of SEED-R#publish-notes.\n\n## Findings\n\n- Notes are listed in file-name order, so v1.10 precedes v1.9.\n\n## Ordered slices\n\n### 1. Newest tag first\nType: Behavior\nStatus: planned\nProof: The index lists v1.10 before v1.9.\n`,
  );
  const section = `${storySection("order-notes", identity, "Order release notes by tag date", "Readers see the newest tag's notes first, as the published notes promised.")}\n**Scope:** Correct the note order only.\n\n**Plan:** [Order release notes](../slice-plans/R/PLAN.md).\n`;
  writeDraft(
    trunk,
    ".planning/seeds/R.md",
    withFacts(
      `${completed}\n${section}`,
      link,
      identity,
      "planned",
      "../slice-plans/R/PLAN.md",
    ),
  );
  coordinates.identity = identity;
}

coordinates.base = git(origin, "rev-parse", "refs/heads/main");
process.stdout.write(JSON.stringify(coordinates));
