// Disposable trunk, queued backlog, and command-readiness scripts for
// workspace-publication Git-mechanics tests.
import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { backlogOf } from "../../../../tests/support/product-backlog-fixture.mjs";
import {
  computeBasis,
  recordStoryState,
} from "../../dough-product-backlog/scripts/product-backlog-story-state.mjs";
import { git, exec, revParse } from "./publication-test-fixtures.mjs";

export const storyA = "- [Story A](seeds/A.md#a) \u2014 SEED-A#a";
export const storyB = "- [Story B](seeds/B.md#b) \u2014 SEED-B#b";
export const identityA = "SEED-A#a";
export const identityB = "SEED-B#b";

export async function remoteBacklog(workspace) {
  return (
    await git(workspace, "show", "origin/main:.planning/PRODUCT-BACKLOG.md")
  ).stdout;
}

export const readyContributing = [
  "Locked setup: `node scripts/setup.js`",
  "Applicable command: `node scripts/command.js`",
  "",
].join("\n");

export const failingContributing = [
  "Locked setup: `node scripts/setup.js`",
  "Applicable command: `node scripts/fail.js`",
  "",
].join("\n");

export async function createQueuedTrunk({
  contributing,
  parent = tmpdir(),
} = {}) {
  const fixture = realpathSync(mkdtempSync(join(parent, "workspace-claim-")));
  const origin = join(fixture, "remote.git");
  const integration = join(fixture, "integration");
  await exec("git", ["init", "--bare", "-b", "main", origin]);
  await exec("git", ["init", "-b", "main", integration]);
  await git(integration, "config", "user.name", "Integration Checkout");
  await git(integration, "config", "user.email", "integration@example.test");
  await git(integration, "remote", "add", "origin", origin);
  writeFileSync(join(integration, "trunk.txt"), "base\n");
  mkdirSync(join(integration, ".planning"), { recursive: true });
  writeFileSync(
    join(integration, ".planning/PRODUCT-BACKLOG.md"),
    backlogOf([], [storyA, storyB]),
  );
  mkdirSync(join(integration, ".planning/seeds"), { recursive: true });
  mkdirSync(join(integration, ".planning/quick/A"), { recursive: true });
  const plan = "# Story A plan\n\nExecute the selected startup story.\n";
  const seed =
    '---\nid: SEED-A\n---\n\n# Seed A\n\n<a id="a"></a>\n\n### Story A\n\n**Identity:** SEED-A#a\n\nExecute A.\n';
  const href = "seeds/A.md#a";
  const recorded = recordStoryState(
    seed,
    {
      href,
      identity: identityA,
      refinement: "refined",
      approach: "planned",
      plan: "../quick/A/PLAN.md",
      assessment: "ready",
      reasons: [],
      expectedBasis: computeBasis(seed, plan),
    },
    { planSource: plan },
  );
  writeFileSync(join(integration, ".planning/seeds/A.md"), recorded.source);
  writeFileSync(join(integration, ".planning/quick/A/PLAN.md"), plan);
  if (contributing) {
    mkdirSync(join(integration, "scripts"), { recursive: true });
    writeFileSync(
      join(integration, "scripts/setup.js"),
      "require('fs').writeFileSync('.setup-ran','1')\n",
    );
    writeFileSync(
      join(integration, "scripts/command.js"),
      "require('fs').writeFileSync('.command-ran','1')\n",
    );
    writeFileSync(join(integration, "scripts/fail.js"), "process.exit(1)\n");
    writeFileSync(join(integration, "CONTRIBUTING.md"), contributing);
  }
  await git(integration, "add", ".");
  await git(integration, "commit", "-m", "base trunk commit");
  await git(integration, "push", "origin", "main");
  return {
    fixture,
    origin,
    integration,
    trunkSha: await revParse(integration, "HEAD"),
    cleanup: () => rmSync(fixture, { recursive: true, force: true }),
  };
}

const startCli = fileURLToPath(
  new URL("./execution-start.mjs", import.meta.url),
);

export async function startCliResult(trunk, mode, extra = [], cli = startCli) {
  const workspace = join(trunk.fixture, `start-${mode}`);
  const args = [
    cli,
    "start",
    "--integration",
    trunk.integration,
    "--workspace",
    workspace,
    "--branch",
    `exec/${mode}`,
    "--identity",
    identityA,
    "--publisher-id",
    `publisher-${mode}`,
    "--mode",
    mode,
    "--remote",
    "origin",
    "--target",
    "main",
    "--push-authorized",
    "--workspace-authorized",
    ...extra,
  ];
  try {
    const { stdout } = await exec(process.execPath, args);
    return { receipt: JSON.parse(stdout), workspace };
  } catch (error) {
    return { receipt: JSON.parse(error.stdout), workspace };
  }
}
