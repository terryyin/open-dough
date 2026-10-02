// A real development configuration owner, Git checkout and gh subprocess.
// Only GitHub's answer is synthetic; each test owns its HOME and restores env.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  initializeProjectConfiguration,
  projectConfigurationFile,
} from "../../server/projectConfiguration.ts";
import { fakeGhEnv, installFakeGh } from "./fakeGh.ts";
import { everyRepository, publishes, startFakeGitHub } from "./fakeGitHub.ts";
import { withRestoredEnv } from "./testEnv.ts";

export const validationRepository = "example/sample-app";

export async function projectAdditionFixture() {
  const home = mkdtempSync(path.join(tmpdir(), "dough-project-validation-"));
  const github = await startFakeGitHub();
  github.serve(everyRepository, publishes({ revision: "ab".repeat(20) }));
  const next = { HOME: home, ...fakeGhEnv(installFakeGh(home), github.url) };
  const restoreEnv = withRestoredEnv(next);
  initializeProjectConfiguration("development");
  const checkout = path.join(home, "checkout");
  mkdirSync(checkout);
  execFileSync("git", ["init", "--quiet", "--initial-branch=local", checkout]);
  const setOrigin = (origin: string) =>
    execFileSync("git", [
      "-C",
      checkout,
      "remote",
      "set-url",
      "origin",
      origin,
    ]);
  execFileSync("git", [
    "-C",
    checkout,
    "remote",
    "add",
    "origin",
    `git@github.com:${validationRepository}.git`,
  ]);
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
    async close() {
      await github.close();
      restoreEnv();
      rmSync(home, { recursive: true, force: true });
    },
  };
}
