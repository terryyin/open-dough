import {
  existsSync,
  mkdtempSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
} from "node:fs";
import path from "node:path";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { installedSkillPath } from "../../server/launchHosts.ts";
import { productionSeedProjects } from "../../server/projectConfigurationSeed.ts";
import { initializeStartOrigin } from "./startOriginInitialization.ts";
import type { StartOriginLayout } from "./startOriginPreparation.ts";
import { git } from "./startOriginObservation.ts";

const initializing = new Map<string, Promise<void>>();

export async function prepareCatalogProjects(
  home: string,
  folders: readonly string[] | undefined,
  layout: StartOriginLayout | undefined,
): Promise<void> {
  if (layout === undefined || folders === undefined) return;
  const machineHome = realpathSync(home);
  const preparations = await Promise.allSettled(
    folders.map((folder) => prepareProject(machineHome, folder, layout)),
  );
  for (const preparation of preparations) {
    if (preparation.status === "rejected") throw preparation.reason;
  }
}

async function prepareProject(
  home: string,
  folder: string,
  layout: StartOriginLayout,
) {
  const project = path.join(home, "git", folder);
  const pending = initializing.get(project);
  if (pending !== undefined) return pending;
  if (existsSync(path.join(project, ".git"))) return;

  const configured = productionSeedProjects.find(
    ({ localPath }) => localPath === `~/git/${folder}`,
  );
  if (configured === undefined)
    throw new Error(`No fixture catalog project has the folder ${folder}.`);
  const origin = path.join(
    path.dirname(home),
    "catalog-origins",
    `${folder}.git`,
  );
  if (readdirSync(project).length !== 0 || existsSync(origin))
    throw new Error(
      `Cannot install the catalog project over existing files in ${project} or ${origin}.`,
    );

  const preparation = installProject(
    home,
    project,
    origin,
    configured.repository,
    layout,
  );
  initializing.set(project, preparation);
  try {
    await preparation;
  } finally {
    initializing.delete(project);
  }
}

async function installProject(
  home: string,
  project: string,
  origin: string,
  repository: string,
  layout: StartOriginLayout,
) {
  // A later start treats a checkout already in this folder as caller-owned.
  // Publish the checkout there only once the installation and origin agree.
  const checkout = mkdtempSync(path.join(path.dirname(project), ".catalog-"));
  try {
    await initializeStartOrigin(
      origin,
      home,
      checkout,
      repository,
      layout,
      queuedReadyRepository().please(),
    );
    await confirmInstallation(checkout, origin, layout);
    renameSync(checkout, project);
  } catch (error) {
    rmSync(origin, { recursive: true, force: true });
    throw error;
  } finally {
    rmSync(checkout, { recursive: true, force: true });
  }
}

async function confirmInstallation(
  project: string,
  origin: string,
  layout: StartOriginLayout,
) {
  const start = installedSkillPath(
    layout,
    { path: project, shown: project },
    "dough-execute-plan",
    "scripts",
    "execution-start.mjs",
  );
  if (!existsSync(start))
    throw new Error(`The catalog project lacks installed ${start}.`);
  const [checkoutOrigin, bare, checkoutMain, originMain] = await Promise.all([
    git(project, "remote", "get-url", "origin"),
    git(origin, "rev-parse", "--is-bare-repository"),
    git(project, "rev-parse", "refs/heads/main"),
    git(origin, "rev-parse", "refs/heads/main"),
  ]);
  if (
    checkoutOrigin !== origin ||
    bare !== "true" ||
    checkoutMain !== originMain
  )
    throw new Error(
      `The catalog checkout ${project} lacks a matching bare origin.`,
    );
}
