// Public preparation CLI operations against a disposable trunk. Results and
// all assignment effects come from the actual production command.
import { fileURLToPath } from "node:url";
import { exec } from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";

const assignmentCli = fileURLToPath(
  new URL("./preparation-assignment.mjs", import.meta.url),
);

async function runJson(args, options = {}) {
  try {
    const { stdout } = await exec(process.execPath, args, options);
    return { code: 0, receipt: JSON.parse(stdout) };
  } catch (error) {
    return {
      code: error.code,
      receipt: error.stdout ? JSON.parse(error.stdout) : null,
      stderr: error.stderr,
    };
  }
}

// Runs the installed-shape CLI `operation` for `identity` in `workspace`
// against origin/main, as the shared guidance teaches.
function assignment(operation, workspace, identity, extra) {
  return runJson([
    assignmentCli,
    operation,
    "--workspace",
    workspace,
    "--identity",
    identity,
    "--remote",
    "origin",
    "--target",
    "main",
    ...extra,
  ]);
}

// Operations that publish run with trunk authority from a separate workspace.
// A null `trunk.integration` supplies no default checkout.
const publishing = (trunk) => [
  ...(trunk.integration === null ? [] : ["--integration", trunk.integration]),
  "--push-authorized",
];

export function startPreparation(trunk, workspace, identity, extra = []) {
  return assignment("start", workspace, identity, [
    ...publishing(trunk),
    ...extra,
  ]);
}

export function continuePreparation(trunk, workspace, identity, extra = []) {
  return assignment("continue", workspace, identity, [
    ...publishing(trunk),
    ...extra,
  ]);
}

export function abandonPreparation(trunk, workspace, identity) {
  return assignment("abandon", workspace, identity, publishing(trunk));
}

// Abandons the assignment at `profile` from the integration checkout, as the
// guidance teaches for a lost workspace; `extra` carries the allocation and
// confirmation the developer supplies.
export function abandonLostPreparation(trunk, profile, extra = []) {
  return runJson([
    assignmentCli,
    "abandon",
    "--profile",
    profile,
    "--remote",
    "origin",
    "--target",
    "main",
    ...publishing(trunk),
    ...extra,
  ]);
}

export function releasePreparation(workspace, identity) {
  return assignment("release", workspace, identity, []);
}
