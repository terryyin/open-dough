// A real development configuration owner and Git checkout with a private request owner.
// Only GitHub's answer is synthetic; each test owns its HOME and restores env.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  mountProjectConfiguration,
  projectConfigurationFile,
} from "../../server/projectConfiguration.ts";
import { endFakeGh, fakeGhEnv, installFakeGh } from "./fakeGh.ts";
import { everyRepository, publishes, startFakeGitHub } from "./fakeGitHub.ts";
import { withRestoredEnv } from "./testEnv.ts";

export const validationRepository = "example/sample-app";

export async function projectAdditionFixture() {
  const home = mkdtempSync(path.join(tmpdir(), "dough-project-validation-"));
  const github = await startFakeGitHub();
  github.serve(everyRepository, publishes({ revision: "ab".repeat(20) }));
  const gh = installFakeGh(home);
  const next = { HOME: home, ...fakeGhEnv(gh, github.url) };
  const restoreEnv = withRestoredEnv(next);
  const checkout = path.join(home, "checkout");
  let releaseConfiguration: (() => void) | undefined;
  const close = async () => {
    try {
      await endFakeGh(gh);
    } finally {
      try {
        await github.close();
      } finally {
        releaseConfiguration?.();
        restoreEnv();
        rmSync(home, { recursive: true, force: true });
      }
    }
  };
  const setOrigin = (origin: string) =>
    execFileSync("git", [
      "-C",
      checkout,
      "remote",
      "set-url",
      "origin",
      origin,
    ]);
  try {
    mkdirSync(checkout);
    execFileSync("git", [
      "init",
      "--quiet",
      "--initial-branch=local",
      checkout,
    ]);
    execFileSync("git", [
      "-C",
      checkout,
      "remote",
      "add",
      "origin",
      `git@github.com:${validationRepository}.git`,
    ]);
    releaseConfiguration = mountProjectConfiguration("development");
  } catch (error) {
    try {
      await close();
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        "Could not start the project addition fixture",
        { cause: cleanupError },
      );
    }
    throw error;
  }
  return {
    home,
    github,
    checkout,
    setOrigin,
    file: projectConfigurationFile("development"),
    input: {
      githubUrl: `https://github.com/${validationRepository}`,
      localPath: checkout,
    },
    close,
  };
}
