// Disposable trunk, queued backlog, and command-readiness scripts for
// workspace-publication Git-mechanics tests.
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
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
import { fixtureTeardown } from "./fixture-teardown-test-fixtures.mjs";
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

// Files the ready contributing setup and command leave where they ran.
const [setupMarker, commandMarker] = [".setup-ran", ".command-ran"];
export const setupMarkers = [setupMarker, commandMarker];

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

const queuedTrunkLayout = (fixture) => ({
  origin: join(fixture, "remote.git"),
  integration: join(fixture, "integration"),
});

// Writes story `letter`'s seed and plan, its state recorded refined, planned,
// and ready.
function writeQueuedStory(integration, letter, identity) {
  const anchor = letter.toLowerCase();
  const seedPath = `seeds/${letter}.md`;
  const plan = `# Story ${letter} plan\n\nExecute the selected startup story.\n`;
  const seed = `---\nid: SEED-${letter}\n---\n\n# Seed ${letter}\n\n<a id="${anchor}"></a>\n\n### Story ${letter}\n\n**Identity:** ${identity}\n\nExecute ${letter}.\n`;
  const recorded = recordStoryState(
    seed,
    {
      href: `${seedPath}#${anchor}`,
      identity,
      refinement: "refined",
      approach: "planned",
      plan: `../slice-plans/${letter}/PLAN.md`,
      assessment: "ready",
      reasons: [],
      expectedBasis: computeBasis(seed, plan),
    },
    { planSource: plan },
  );
  mkdirSync(join(integration, ".planning/seeds"), { recursive: true });
  mkdirSync(join(integration, `.planning/slice-plans/${letter}`), {
    recursive: true,
  });
  writeFileSync(join(integration, ".planning", seedPath), recorded.source);
  writeFileSync(
    join(integration, `.planning/slice-plans/${letter}/PLAN.md`),
    plan,
  );
}

// A bare remote and an integration checkout whose trunk commit queues stories
// A and B; with `contributing`, it also holds CONTRIBUTING.md and its scripts.
async function buildQueuedTrunk(
  fixture,
  { contributing, durableCommandEvidence },
) {
  const { origin, integration } = queuedTrunkLayout(fixture);
  await exec("git", ["init", "--bare", "-b", "main", origin]);
  // A push over the local transport drops the runner's GIT_CONFIG_COUNT
  // settings, so without this the remote's receive-pack starts a detached
  // `git maintenance run --auto`. It holds objects/maintenance.lock after the
  // push returns, and a copy of the remote can list the lock and then miss it.
  await git(origin, "config", "maintenance.auto", "false");
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
  writeQueuedStory(integration, "A", identityA);
  writeQueuedStory(integration, "B", identityB);
  if (contributing) {
    mkdirSync(join(integration, "scripts"), { recursive: true });
    const marker = (name) =>
      durableCommandEvidence ? join(fixture, name) : name;
    writeFileSync(
      join(integration, "scripts/setup.js"),
      `require('fs').writeFileSync(${JSON.stringify(marker(setupMarker))},'1')\n`,
    );
    writeFileSync(
      join(integration, "scripts/command.js"),
      `require('fs').writeFileSync(${JSON.stringify(marker(commandMarker))},'1')\n`,
    );
    writeFileSync(join(integration, "scripts/fail.js"), "process.exit(1)\n");
    writeFileSync(join(integration, "CONTRIBUTING.md"), contributing);
  }
  await git(integration, "add", ".");
  await git(integration, "commit", "-m", "base trunk commit");
  await git(integration, "push", "origin", "main");
}

// Without durable command evidence a queued trunk holds no path of its own, so
// each test process builds it once per CONTRIBUTING text and copies it.
const templates = new Map();

function queuedTrunkTemplate(contributing) {
  const key = contributing ?? "";
  if (!templates.has(key)) {
    const template = realpathSync(
      mkdtempSync(join(tmpdir(), "queued-trunk-template-")),
    );
    process.once("exit", () =>
      rmSync(template, { recursive: true, force: true }),
    );
    templates.set(
      key,
      buildQueuedTrunk(template, { contributing }).then(() => template),
    );
  }
  return templates.get(key);
}

// The copied checkout's `origin` names the template's remote; point it at the
// copy's own.
async function copyQueuedTrunk(fixture, contributing) {
  const template = await queuedTrunkTemplate(contributing);
  cpSync(template, fixture, { recursive: true });
  const config = join(queuedTrunkLayout(fixture).integration, ".git/config");
  writeFileSync(
    config,
    readFileSync(config, "utf8").replaceAll(template, fixture),
  );
}

export async function createQueuedTrunk({
  contributing,
  durableCommandEvidence = false,
  parent = tmpdir(),
} = {}) {
  const fixture = realpathSync(mkdtempSync(join(parent, "workspace-claim-")));
  const { origin, integration } = queuedTrunkLayout(fixture);
  if (durableCommandEvidence)
    await buildQueuedTrunk(fixture, { contributing, durableCommandEvidence });
  else await copyQueuedTrunk(fixture, contributing);
  const teardown = fixtureTeardown(fixture);
  return {
    fixture,
    origin,
    integration,
    trunkSha: await revParse(integration, "HEAD"),
    cleanup: teardown.cleanup,
    defer: teardown.defer,
  };
}

const startCli = fileURLToPath(
  new URL("./execution-start.mjs", import.meta.url),
);

// `name` distinguishes the workspace, branch, and publisher of several starts
// in one mode; it defaults to the mode. `env` is the command's environment. A
// null `identity` starts without one, as an unlisted one-shot request does. A
// null `integration` supplies no default checkout; `workspace` and `branch`
// name an existing owned worktree instead of the default new one.
export async function startCliResult(
  trunk,
  mode,
  extra = [],
  {
    cli = startCli,
    name = mode,
    env = process.env,
    identity = identityA,
    integration = trunk.integration,
    workspace = join(trunk.fixture, `start-${name}`),
    branch = `exec/${name}`,
  } = {},
) {
  const args = [
    cli,
    "start",
    ...(integration === null ? [] : ["--integration", integration]),
    "--workspace",
    workspace,
    "--branch",
    branch,
    ...(identity === null ? [] : ["--identity", identity]),
    "--publisher-id",
    `publisher-${name}`,
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
    const { stdout } = await exec(process.execPath, args, { env });
    return { receipt: JSON.parse(stdout), stdout, code: 0, workspace, branch };
  } catch (error) {
    return {
      receipt: JSON.parse(error.stdout),
      stdout: error.stdout,
      code: error.code,
      workspace,
      branch,
    };
  }
}
