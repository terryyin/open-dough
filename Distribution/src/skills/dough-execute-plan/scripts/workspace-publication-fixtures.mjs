// Queued story names, command-readiness text and the startup CLI runner for
// workspace-publication Git-mechanics tests.
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { git, exec } from "./publication-test-fixtures.mjs";

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

const startCli = fileURLToPath(
  new URL("./execution-start.mjs", import.meta.url),
);

// `name` distinguishes the workspace, branch, and publisher of several starts
// in one mode; it defaults to the mode. `env` is the command's environment. A
// null `identity` starts without one, as an unlisted one-shot request does. A
// null `integration` supplies no default checkout; `workspace` and `branch`
// name an existing owned worktree instead of the default new one. A false
// `pushAuthorized` withholds trunk publication authority.
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
    pushAuthorized = true,
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
    ...(pushAuthorized ? ["--push-authorized"] : []),
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
