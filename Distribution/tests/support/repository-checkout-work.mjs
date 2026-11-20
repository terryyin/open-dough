// @ts-check
// Perform declared work in a disposable Git checkout and answer each named
// step's commit. Git records the dated actions in its own reflog.
import assert from "node:assert/strict";
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
/** @typedef {import("./repositoryCheckoutWorkTestData.mjs").DatedFileChanges} DatedFileChanges */
/** @typedef {import("./repositoryCheckoutWorkTestData.mjs").DatedSideCommit} DatedSideCommit */
/** @typedef {import("./repositoryCheckoutWorkTestData.mjs").DatedReword} DatedReword */
/** @typedef {import("./repositoryCheckoutWorkTestData.mjs").DatedCherryPick} DatedCherryPick */
/** @typedef {import("./repositoryCheckoutWorkTestData.mjs").DatedAutosquash} DatedAutosquash */
/** @typedef {import("./repositoryCheckoutWorkTestData.mjs").TrunkWork} TrunkWork */

/**
 * @param {string} cwd
 * @param {string} at
 * @param {string[]} args
 * @param {NodeJS.ProcessEnv} [editors]
 */
const gitAt = (cwd, at, args, editors) =>
  exec("git", args, {
    cwd,
    env: {
      ...process.env,
      GIT_COMMITTER_DATE: at,
      GIT_AUTHOR_DATE: at,
      GIT_EDITOR: "true",
      GIT_SEQUENCE_EDITOR: "true",
      ...editors,
    },
  });

/** @param {string} cwd @param {DatedCommit} work */
const commitAt = (cwd, { at, message, files }) =>
  commitDeclaredRevision(cwd, {
    message,
    files,
    committer: { ...integrationDeveloper, date: at },
  });

/** @param {string} checkout @param {DatedSideCommit} work */
async function commitOnBranch(checkout, work) {
  const { at, branch } = work;
  const { stdout } = await gitAt(checkout, at, [
    "symbolic-ref",
    "--short",
    "HEAD",
  ]);
  await gitAt(checkout, at, ["switch", "--quiet", "--create", branch]);
  const commit = await commitAt(checkout, work);
  await gitAt(checkout, at, ["switch", "--quiet", stdout.trim()]);
  return commit;
}

/** @param {string} checkout @param {DatedReword} work */
async function rewordTip(checkout, { at, message }) {
  await gitAt(checkout, at, ["rebase", "--quiet", "--interactive", "HEAD^"], {
    GIT_SEQUENCE_EDITOR: "sed -i.bak '1s/^pick /reword /'",
    GIT_EDITOR: 'printf "%s\\n" "$DOUGH_CHECKOUT_REWORD_MESSAGE" >',
    DOUGH_CHECKOUT_REWORD_MESSAGE: message,
  });
  return revParse(checkout, "HEAD");
}

/** @param {string} checkout @param {DatedFileChanges} work */
async function amendAt(checkout, { at, files }) {
  writeRevisionFiles(checkout, { files });
  await gitAt(checkout, at, ["add", "--", ...Object.keys(files)]);
  await gitAt(checkout, at, ["commit", "--quiet", "--amend", "--no-edit"]);
  return revParse(checkout, "HEAD");
}

/** @param {Checkout} checkout */
async function cloneOrigin({ fixture, origin }) {
  if (origin === undefined)
    throw new Error(
      "Work from another checkout needs a repository with an origin.",
    );
  const other = mkdtempSync(join(fixture, "other-checkout-"));
  await exec("git", ["clone", "--quiet", origin, other]);
  return other;
}

/** @param {Checkout} checkout @param {DatedCherryPick} work */
async function continueCherryPick(
  checkout,
  { at, file, incoming, resolution },
) {
  const { integration } = checkout;
  const other = await cloneOrigin(checkout);
  const picked = await commitAt(other, {
    at,
    message: `Add ${file}`,
    files: { [file]: incoming },
  });
  await gitAt(integration, at, ["fetch", "--quiet", other, picked]);
  await assert.rejects(gitAt(integration, at, ["cherry-pick", picked]), {
    code: 1,
  });
  assert.equal(await revParse(integration, "CHERRY_PICK_HEAD"), picked);
  const { stdout } = await gitAt(integration, at, [
    "ls-files",
    "--unmerged",
    "--",
    file,
  ]);
  assert.ok(stdout.trim(), `Expected a cherry-pick conflict in ${file}.`);
  writeRevisionFiles(integration, { files: { [file]: resolution } });
  await gitAt(integration, at, ["add", "--", file]);
  await gitAt(integration, at, ["cherry-pick", "--continue"]);
  return revParse(integration, "HEAD");
}

/** @param {string} checkout @param {DatedAutosquash} work */
async function autosquashAt(checkout, { at, target, mode, file, content }) {
  writeRevisionFiles(checkout, { files: { [file]: content } });
  await gitAt(checkout, at, ["add", "--", file]);
  await gitAt(checkout, at, [
    "commit",
    "--quiet",
    `--${mode}=${target}`,
    "-m",
    `Add ${file}`,
  ]);
  await gitAt(checkout, at, [
    "rebase",
    "--quiet",
    "--interactive",
    "--autosquash",
    `${target}^`,
  ]);
  return revParse(checkout, "HEAD");
}

/** @param {Checkout} checkout @param {DatedCommit} work */
async function publishTrunkWork(checkout, work) {
  const other = await cloneOrigin(checkout);
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
      case "edit":
        writeRevisionFiles(integration, { files: step.files });
        commits.push([step.name, await revParse(integration, "HEAD")]);
        break;
      case "branch-commit":
        commits.push([step.name, await commitOnBranch(integration, step)]);
        break;
      case "reword":
        commits.push([step.name, await rewordTip(integration, step)]);
        break;
      case "amend":
        commits.push([step.name, await amendAt(integration, step)]);
        break;
      case "cherry-pick":
        commits.push([step.name, await continueCherryPick(checkout, step)]);
        break;
      case "autosquash":
        commits.push([step.name, await autosquashAt(integration, step)]);
        break;
      case "merge-tip":
        await gitAt(integration, step.at, [
          "merge",
          "--quiet",
          "--no-ff",
          "--no-edit",
          step.tip,
        ]);
        commits.push([step.name, await revParse(integration, "HEAD")]);
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
