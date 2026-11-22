// Durable first-landing expectation beside the git common dir (management
// context), keyed to one launch workspace and branch, holding one open
// expectation per launch sharing that key. Preparation plants a launch's when
// it writes landing-context.json; that launch's accepted capture clears it.
// Publication may later resolve the only open launch when --landing-context is
// omitted (resolve-publication-landing-context.mjs). This module stays free of Git
// helpers so the reporting-dir copy used by accepted capture can clear alone.
import { createHash } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const sidecarName = "first-landing-expectation.json";

function expectationKey(workspace, branch) {
  return createHash("sha256").update(`${workspace}\n${branch}`).digest("hex");
}

// Absolute path of the durable expectation file for this repository key.
export function firstLandingExpectationPath(repository, workspace, branch) {
  return path.join(
    repository,
    "open-dough",
    "first-landing-expectations",
    `${expectationKey(workspace, branch)}.json`,
  );
}

function sidecarPath(landingContext) {
  return path.join(path.dirname(path.resolve(landingContext)), sidecarName);
}

// Open launches' prepared context paths in the expectation file, oldest
// first. A legacy single-record file reads as one open launch.
async function readOpenLaunches(file, workspace, branch) {
  let record;
  try {
    record = JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  if (record.workspace !== workspace || record.branch !== branch) return [];
  const launches = Array.isArray(record.launches)
    ? record.launches
    : [{ landingContext: record.landingContext }];
  return launches
    .map((launch) => launch?.landingContext)
    .filter((context) => typeof context === "string" && context !== "");
}

async function writeOpenLaunches(file, workspace, branch, contexts) {
  if (contexts.length === 0) {
    try {
      await unlink(file);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    return;
  }
  await mkdir(path.dirname(file), { recursive: true });
  const record = {
    workspace,
    branch,
    launches: contexts.map((landingContext) => ({ landingContext })),
  };
  await writeFile(file, `${JSON.stringify(record, null, 2)}\n`, {
    mode: 0o600,
  });
}

// Plant this launch's open expectation beside every other open launch for
// this workspace/branch, naming the absolute prepared landing-context path.
// Also writes a sidecar beside that context so accepted capture can clear
// without re-deriving publish args.
export async function plantFirstLandingExpectation({
  repository,
  workspace,
  branch,
  landingContext,
}) {
  const absoluteContext = path.resolve(landingContext);
  const file = firstLandingExpectationPath(repository, workspace, branch);
  const open = await readOpenLaunches(file, workspace, branch);
  await writeOpenLaunches(file, workspace, branch, [
    ...open.filter((context) => context !== absoluteContext),
    absoluteContext,
  ]);
  await writeFile(
    sidecarPath(absoluteContext),
    `${JSON.stringify({ repository, workspace, branch }, null, 2)}\n`,
    { mode: 0o600 },
  );
  return file;
}

// Remove one launch's open expectation; removing the last removes the file.
async function clearFirstLandingExpectation({
  repository,
  workspace,
  branch,
  landingContext,
}) {
  const absoluteContext = path.resolve(landingContext);
  const file = firstLandingExpectationPath(repository, workspace, branch);
  const open = await readOpenLaunches(file, workspace, branch);
  if (!open.includes(absoluteContext)) return;
  await writeOpenLaunches(
    file,
    workspace,
    branch,
    open.filter((context) => context !== absoluteContext),
  );
}

// Clear from the prepared context path after accepted capture. No-op when no
// expectation was planted for that context.
export async function clearFirstLandingExpectationForContext(landingContext) {
  const sidecar = sidecarPath(landingContext);
  let keys;
  try {
    keys = JSON.parse(await readFile(sidecar, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }
  await clearFirstLandingExpectation({ ...keys, landingContext });
  try {
    await unlink(sidecar);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

// The one open launch's expectation for this workspace/branch, or undefined
// when none or several are open: publication never guesses between launches.
// First trunk publication may resolve this when --landing-context is omitted.
export async function openFirstLandingExpectation({
  repository,
  workspace,
  branch,
}) {
  const open = await readOpenLaunches(
    firstLandingExpectationPath(repository, workspace, branch),
    workspace,
    branch,
  );
  if (open.length !== 1) return undefined;
  return { workspace, branch, landingContext: open[0] };
}
