import { realpath } from "node:fs/promises";
import path from "node:path";
import {
  githubRepository,
  projectIdentity,
  ProjectInputProblem,
  type ProjectInput,
} from "../src/projectInput.ts";
import {
  appendConfiguredProject,
  publishedProjects,
} from "./projectConfiguration.ts";
import { folderExists, localFolder } from "./projectFolders.ts";
import { runGh } from "./ghRead.ts";
import { runGit } from "./gitRunner.ts";

export async function addProject(input: ProjectInput, signal: AbortSignal) {
  // Unreadable settings admit no writes or external validation.
  publishedProjects();
  const repository = githubRepository(input.githubUrl);
  if (repository === undefined)
    throw new ProjectInputProblem(
      "githubUrl",
      "Enter a GitHub repository URL in HTTPS or SSH form.",
    );
  const localPath = input.localPath.trim();
  const folder = localFolder(localPath);
  if (localPath === "" || !(await folderExists(folder)))
    throw new ProjectInputProblem(
      "localPath",
      `The local folder ${localPath || "you entered"} was not found.`,
    );
  let origin: string;
  try {
    const options = { cwd: folder.path, signal, maxBuffer: 64 * 1024 };
    const { stdout } = await runGit(
      ["rev-parse", "--is-inside-work-tree"],
      options,
    );
    if (stdout.trim() !== "true") throw new Error("Not a checkout");
    const top = (
      await runGit(["rev-parse", "--show-toplevel"], options)
    ).stdout.trim();
    if ((await realpath(top)) !== (await realpath(folder.path)))
      throw new Error("Choose the checkout root");
    origin = (
      await runGit(["remote", "get-url", "origin"], options)
    ).stdout.trim();
  } catch {
    if (signal.aborted) throw signal.reason;
    throw new ProjectInputProblem(
      "localPath",
      `The local folder ${localPath} is not the root of a Git checkout with an origin repository.`,
    );
  }
  const localRepository = githubRepository(origin);
  if (localRepository !== repository)
    throw new ProjectInputProblem(
      "localPath",
      `The origin of ${localPath} is ${localRepository ?? "an unrecognized repository"}, but the GitHub URL names ${repository}.`,
    );
  let ref: string;
  try {
    ref = (
      await runGh(
        ["api", `repos/${repository}`, "--jq", ".default_branch"],
        signal,
      )
    ).trim();
    if (ref === "" || ref === "null")
      throw new Error("No usable default branch");
    await runGit(["check-ref-format", "--branch", ref], {
      signal,
      maxBuffer: 64 * 1024,
    });
  } catch {
    if (signal.aborted) throw signal.reason;
    throw new ProjectInputProblem(
      "githubUrl",
      `The repository ${repository} could not be read through the local GitHub CLI. Check gh access and try again.`,
    );
  }
  signal.throwIfAborted();
  const project = {
    ...projectIdentity(repository),
    repository,
    ref,
    backlogPath: ".planning/PRODUCT-BACKLOG.md",
  };
  appendConfiguredProject({
    ...project,
    localPath:
      localPath === "~" ||
      localPath.startsWith("~/") ||
      path.isAbsolute(localPath)
        ? localPath
        : folder.path,
  });
  return { project, projects: publishedProjects() };
}
