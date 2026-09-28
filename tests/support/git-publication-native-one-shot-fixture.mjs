// Builds a one-shot native-journey fixture from the real startup fixtures,
// then prints its coordinates as JSON.
//
// one-shot-result: a queued trunk holding a product file `notes.txt` and what
// managed delivery needs to observe CI: `.planning/open-dough.json` selects
// the project's CI command `scripts/ci-check.mjs`, which reports success for
// whatever revision the checked remote branch holds. No backlog entry names
// the requested work.
//
// one-shot-queued: the same project whose queued story B, described as adding
// a line to `notes.txt` with a one-slice plan, sits between story A and its
// unfinished sibling B2 in the same seed.
//
// one-shot-escalation: the one-shot-result project plus the notes tool from
// git-publication-native-one-shot-escalation-fixture.mjs.
//
// Usage: node git-publication-native-one-shot-fixture.mjs <source-dir>
//   <journey> <parent>
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { writeEscalationProduct } from "./git-publication-native-one-shot-escalation-fixture.mjs";

const [sourceDir, journey, parent] = process.argv.slice(2);
const scripts = join(sourceDir, "src/skills/dough-execute-plan/scripts");
const { createQueuedTrunk, readyContributing } = await import(
  pathToFileURL(join(scripts, "workspace-publication-fixtures.mjs")).href
);
const queued = await import(
  pathToFileURL(join(scripts, "one-shot-queued-test-fixtures.mjs")).href
);

const git = (cwd, ...args) =>
  execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
const isQueued = journey === "one-shot-queued";
const trunkOptions = {
  contributing: readyContributing,
  durableCommandEvidence: true,
  parent,
};
const trunk = isQueued
  ? await queued.createSiblingTrunk(trunkOptions)
  : await createQueuedTrunk(trunkOptions);
const { fixture, origin, integration } = trunk;

// Gives queued story B a concrete trivial outcome and a one-slice plan, and
// records its readiness again over them.
async function describeStoryB() {
  const seedPath = join(integration, queued.seedB);
  writeFileSync(
    seedPath,
    readFileSync(seedPath, "utf8").replace(
      "Execute B.\n",
      "Add the line 'Story B line' to the end of notes.txt.\n",
    ),
  );
  writeFileSync(
    join(integration, queued.planB),
    `# Story B plan

## Ordered slices

### 1. Add the Story B line
Type: Behavior
Status: planned
Proof: notes.txt ends with the line 'Story B line'.

Append the line 'Story B line' to notes.txt.
`,
  );
  await queued.recordStoryBReady(integration);
}

if (isQueued) await describeStoryB();
if (journey === "one-shot-escalation") writeEscalationProduct(integration);
writeFileSync(join(integration, "notes.txt"), "Release notes\n");
writeFileSync(
  join(integration, "scripts/ci-check.mjs"),
  `// The project's CI check: every push to the checked branch passes.
import { execFileSync } from "node:child_process";
let input = "";
for await (const chunk of process.stdin) input += chunk;
const request = JSON.parse(input);
if (request.operation === "discover") {
  const [sha] = execFileSync("git", ["ls-remote", "origin", \`refs/heads/\${request.check.branch}\`], { encoding: "utf8" }).split(/\\s/);
  const attempts = sha ? [{ runId: sha, attemptId: "1", sha, outcome: "success" }] : [];
  process.stdout.write(JSON.stringify({ attempts }));
} else {
  process.stdout.write(JSON.stringify({ unavailable: "the check never fails" }));
}
`,
);
writeFileSync(
  join(integration, ".planning/open-dough.json"),
  `${JSON.stringify({ ciAdapter: ["node", "scripts/ci-check.mjs"] })}\n`,
);
git(integration, "add", ".");
git(integration, "commit", "-qm", "add notes and the CI check");
git(integration, "push", "-q", "origin", "main");

process.stdout.write(
  JSON.stringify({
    root: fixture,
    origin,
    integration,
    workspace: join(fixture, "native-one-shot"),
    branch: "exec/native-one-shot",
    journey,
    base: git(origin, "rev-parse", "refs/heads/main"),
    ...(isQueued
      ? {
          identity: queued.identityB,
          sibling: queued.identityB2,
          seed: queued.seedB,
          plan: queued.planB,
        }
      : {}),
  }),
);
