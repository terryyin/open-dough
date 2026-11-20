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
import { writeRevisionFiles } from "./repository-revision-files.mjs";

/** @typedef {{ integration: string, fixture: string, origin?: string }} Checkout */
/** @typedef {import("./repositoryCheckoutWorkTestData.mjs").DatedCommit} DatedCommit */
/** @typedef {import("./repositoryCheckoutWorkTestData.mjs").DatedAmendment} DatedAmendment */
/** @typedef {import("./repositoryCheckoutWorkTestData.mjs").TrunkWork} TrunkWork */

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

/** @param {string} checkout @param {DatedAmendment} work */
async function amendAt(checkout, { at, files }) {
  writeRevisionFiles(checkout, { files });
  await gitAt(checkout, at, ["add", "--", ...Object.keys(files)]);
  await gitAt(checkout, at, ["commit", "--quiet", "--amend", "--no-edit"]);
  return revParse(checkout, "HEAD");
}

/** @param {Checkout} checkout @param {DatedCommit} work */
async function publishTrunkWork({ fixture, origin }, work) {
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
  return { branch: stdout.trim(), published };
}

/** @param {Checkout} checkout @param {DatedCommit & { kind: TrunkWork }} work */
async function takeInTrunkWork(checkout, work) {
  const { integration } = checkout;
  const { branch, published } = await publishTrunkWork(checkout, work);
  const git = (/** @type {string[]} */ ...args) =>
    gitAt(integration, work.at, args);
  if (work.kind === "rebase-onto") {
    await git("fetch", "--quiet", "origin", branch);
    await git("rebase", "--quiet", "--onto", `origin/${branch}`, "HEAD~1");
  } else {
    const pullOptions = {
      "fast-forward": ["--ff-only"],
      merge: ["--no-rebase", "--no-edit"],
      rebase: ["--rebase"],
    };
    await git("pull", "--quiet", ...pullOptions[work.kind], "origin", branch);
  }
  return work.kind === "merge" ? revParse(integration, "HEAD") : published;
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
      case "amend":
        commits.push([step.name, await amendAt(integration, step)]);
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
      case "merge":
      case "rebase":
      case "rebase-onto":
        commits.push([step.name, await takeInTrunkWork(checkout, step)]);
        break;
    }
  }
  return /** @type {Record<Name, string>} */ (Object.fromEntries(commits));
}
