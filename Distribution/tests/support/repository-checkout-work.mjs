// @ts-check
// Perform declared work in a disposable Git checkout and answer each named
// step's commit. Git records the dated actions in its own reflog.
import { mkdtempSync } from "node:fs";
import { join } from "node:path";
import {
  exec,
  revParse,
} from "../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import {
  commitDeclaredRevision,
  integrationDeveloper,
} from "./repository-revision-commit.mjs";

/** @typedef {{ integration: string, fixture: string, origin?: string }} Checkout */
/** @typedef {import("./repositoryCheckoutWorkTestData.mjs").DatedCommit} DatedCommit */

/**
 * @param {string} cwd
 * @param {string} at
 * @param {string[]} args
 */
const gitAt = (cwd, at, args) =>
  exec("git", args, {
    cwd,
    env: { ...process.env, GIT_COMMITTER_DATE: at, GIT_AUTHOR_DATE: at },
  });

/** @param {string} cwd @param {DatedCommit} work */
const commitAt = (cwd, { at, message, files }) =>
  commitDeclaredRevision(cwd, {
    message,
    files,
    committer: { ...integrationDeveloper, date: at },
  });

/** @param {Checkout} checkout @param {DatedCommit} work */
async function fastForwardToTrunkWork({ fixture, integration, origin }, work) {
  if (origin === undefined)
    throw new Error("Published trunk work needs a repository with an origin.");
  const other = mkdtempSync(join(fixture, "trunk-work-"));
  await exec("git", ["clone", "--quiet", origin, other]);
  const { stdout } = await gitAt(other, work.at, [
    "symbolic-ref",
    "--short",
    "HEAD",
  ]);
  const published = await commitAt(other, work);
  await gitAt(other, work.at, ["push", "--quiet", "origin", "HEAD"]);
  await gitAt(integration, work.at, [
    "pull",
    "--quiet",
    "--ff-only",
    "origin",
    stdout.trim(),
  ]);
  return published;
}

/**
 * @template {string} Name
 * @param {Checkout} checkout
 * @param {import("./repositoryCheckoutWorkTestData.mjs").CheckoutWork<Name>} work
 * @returns {Promise<Record<Name, string>>}
 */
export async function performCheckoutWork(checkout, work) {
  const { integration } = checkout;
  /** @type {Array<readonly [Name, string]>} */
  const commits = [];
  for (const step of work) {
    switch (step.kind) {
      case "commit":
        commits.push([step.name, await commitAt(integration, step)]);
        break;
      case "push":
        await gitAt(integration, step.at, [
          "push",
          "--quiet",
          "origin",
          "HEAD",
        ]);
        commits.push([step.name, await revParse(integration, "HEAD")]);
        break;
      case "fast-forward":
        commits.push([step.name, await fastForwardToTrunkWork(checkout, step)]);
        break;
    }
  }
  return /** @type {Record<Name, string>} */ (Object.fromEntries(commits));
}
