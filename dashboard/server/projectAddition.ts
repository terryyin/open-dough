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
import { folderExists, localFolder } from "./localFolder.ts";
import {
  githubGitCredentials,
  githubGitEnvironment,
  githubGitOrigin,
} from "./githubGitTransport.ts";
import { readGitTransport, runGit } from "./gitRunner.ts";

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
      `The execution checkout ${localPath || "you entered"} was not found.`,
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
      `The execution checkout ${localPath} is not the root of a Git checkout with an origin repository.`,
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
    const advertised = await readGitTransport(
      [
        ...githubGitCredentials,
        "ls-remote",
        "--symref",
        "--",
        githubGitOrigin(repository),
        "HEAD",
      ],
      { signal, env: githubGitEnvironment, maxBuffer: 64 * 1024 },
    );
    const branch = /^ref: refs\/heads\/(.+)\tHEAD$/m.exec(advertised)?.[1];
    if (branch === undefined) throw new Error("No usable default branch");
    const validated = await runGit(["check-ref-format", "--branch", branch], {
      signal,
      maxBuffer: 64 * 1024,
    });
    if (validated.stdout.trimEnd() !== branch)
      throw new Error("No usable default branch");
    ref = branch;
  } catch {
    signal.throwIfAborted();
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
