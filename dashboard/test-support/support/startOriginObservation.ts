// Filesystem observations shared by the installed-origin isolation proofs.
import { execFile } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import type { StartOrigin } from "./startOrigin.ts";
import { promisify } from "node:util";

const exec = promisify(execFile);
export const git = async (cwd: string, ...args: string[]) =>
  (await exec("git", ["-C", cwd, ...args])).stdout.trim();

export {
  fixtureFiles,
  objectPack,
} from "../../../Distribution/tests/support/fixture-observation.mjs";

// Publishes private project data to this instance's own origin.
export async function publishPrivateOriginFiles(
  { machine, project }: StartOrigin,
  data: string,
): Promise<void> {
  writeFileSync(path.join(machine, "home", "private"), data);
  writeFileSync(path.join(project, "private"), data);
  await git(project, "checkout", "-b", "private");
  await git(project, "add", "private");
  await git(project, "commit", "-m", `private ${data}`);
  await git(project, "push", "origin", "private");
}
