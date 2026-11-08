// Builds an admission native-journey fixture from explicit repository facts
// and the real startup CLI, then prints its coordinates as JSON. Every
// journey starts from Ready queued A and B with the project's durable setup
// and command and the investigation probe (`scripts/probe.js`, which leaves
// `.probe-ran` in the fixture root).
//
// admission-investigation: that trunk, with no backlog entry for the mission.
// admission-continuation: the same trunk where an unselected investigation
// was admitted to Taken by this journey's publisher, then its plan and ready
// assessment were recorded by the real record-state operation and published
// as ordinary preparation.
// admission-closure: trunk whose README already documents the probe's
// finding, where an unselected investigation in its own new seed was admitted
// to Taken by this journey's publisher and, afterwards, another publisher
// admitted a planned story of seed A from a workspace of its own.
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
import {
  draftLateStory,
  publishPlannedPreparation,
  storySection,
  withFacts,
  writeDraft,
} from "../../src/skills/dough-execute-plan/scripts/workspace-publication-admission-fixtures.mjs";
import { startExecution } from "../../src/skills/dough-execute-plan/scripts/execution-start.mjs";
import { storyA, storyB } from "./queued-repository.mjs";
import { materializeRepository } from "./repository-fixture.mjs";
import {
  fixtureRootMarker,
  queuedReadyStartupRepository,
} from "./startup-command-files.mjs";

const [, journey, parent] = process.argv.slice(2);
const git = (cwd, ...args) =>
  execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

const probed = queuedReadyStartupRepository({
  queued: [storyA, storyB],
}).withRevision("probe", {
  message: "add the startup probe",
  files: {
    "scripts/probe.js": `require("fs").writeFileSync(${fixtureRootMarker(".probe-ran")}, "1");\nconsole.log("startup spends most of its time loading configuration");\n`,
  },
});
const completedNotes = `---\nid: SEED-R\n---\n\n# Seed R\n\n${storySection("publish-notes", "SEED-R#publish-notes", "Publish release notes", "Readers find the notes of every tagged release.")}`;
const startingTrunk = {
  "admission-investigation": probed,
  "admission-continuation": probed,
  "admission-closure": probed.withRevision("documented", {
    message: "document startup cost",
    files: {
      "README.md":
        "# Product\n\nStartup spends most of its time loading configuration; that cost is expected.\n",
    },
  }),
  "admission-correction": probed.withRevision("completed", {
    message: "complete Publish release notes",
    files: { ".planning/seeds/R.md": completedNotes },
  }),
}[journey];
if (!startingTrunk) throw new Error(`unknown admission journey: ${journey}`);
const trunk = await materializeRepository(startingTrunk.please(), { parent });
const { fixture, origin, integration } = trunk;

const coordinates = {
  root: fixture,
  origin,
  integration,
  workspace: join(fixture, "native-execution"),
  branch: "exec/native-admission",
  publisher: `native-${journey}`,
  identity: "",
};

// Admits `identity` from the originating checkout into `workspace` on
// `branch` under `publisherId` through the real startup operation.
async function admit(identity, link, title, workspace, branch, publisherId) {
  const admitted = await startExecution({
    integration,
    workspace,
    branch,
    identity,
    publisherId,
    mode: "trunk",
    remote: "origin",
    target: "main",
    pushAuthorized: true,
    workspaceAuthorized: true,
    admit: true,
    link,
    title,
  });
  if (admitted.status !== "published")
    throw new Error(`admission failed: ${JSON.stringify(admitted)}`);
}

// An unselected investigation drafted in its own new seed N and admitted by
// this journey's publisher into the owned workspace.
async function admitInvestigation(goal) {
  const identity = "SEED-N#slow";
  const link = "seeds/N.md#slow";
  const seed = withFacts(
    `---\nid: SEED-N\n---\n\n# Seed N\n\n${storySection("slow", identity, "Investigate slow start", goal)}`,
    link,
    identity,
    "unselected",
  );
  writeFileSync(join(integration, ".planning/seeds/N.md"), seed);
  await admit(
    identity,
    link,
    "Investigate slow start",
    coordinates.workspace,
    coordinates.branch,
    coordinates.publisher,
  );
  coordinates.identity = identity;
  return { identity, link };
}

if (journey === "admission-continuation") {
  const { identity, link } = await admitInvestigation(
    "Find why startup is slow and make it fast.",
  );
  // Implementation was authorized; ordinary preparation publishes its plan.
  await publishPlannedPreparation(
    trunk,
    { identity, link, planHref: "../slice-plans/N/PLAN.md" },
    {
      plan: "# Make startup fast\n\n### 1. Add feature.txt containing 'implemented'\nType: Behavior\nStatus: planned\n",
      ready: true,
    },
  );
}

if (journey === "admission-closure") {
  await admitInvestigation("Find why startup is slow; investigation only.");
  const late = draftLateStory(trunk);
  const link = late.args[late.args.indexOf("--link") + 1];
  await admit(
    late.identity,
    link,
    "Late story",
    join(fixture, "other-execution"),
    "exec/native-other",
    "native-other-publisher",
  );
  // The originating checkout was since refreshed to trunk, drafts included.
  git(integration, "checkout", "-q", "--", ".planning");
  git(integration, "clean", "-qfd", "--", ".planning");
  git(integration, "pull", "-q", "--ff-only", "origin", "main");
}

if (journey === "admission-correction") {
  const identity = "SEED-R#order-notes";
  const link = "seeds/R.md#order-notes";
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
      `${completedNotes}\n${section}`,
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
