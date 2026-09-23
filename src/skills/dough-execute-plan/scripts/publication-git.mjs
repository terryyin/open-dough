// Git operations shared by the installed publication commands. Test fixtures
// import these mechanics, but production never imports fixture setup.
import { execFile } from "node:child_process";
import { isAbsolute, join } from "node:path";
import { promisify } from "node:util";

export const exec = promisify(execFile);

export async function git(cwd, ...args) {
  return exec("git", args, { cwd });
}

export async function revParse(cwd, ref) {
  return (await git(cwd, "rev-parse", ref)).stdout.trim();
}

export async function lsRemoteSha(remote, ref) {
  const { stdout } = await exec("git", ["ls-remote", remote, ref]);
  return stdout.trim().split(/\s+/)[0];
}

export async function pushExactRef(workspace, sha, remote, targetRef) {
  await git(workspace, "push", remote, `${sha}:${targetRef}`);
}

export async function indexLockPath(checkout) {
  const printed = (
    await git(checkout, "rev-parse", "--git-path", "index.lock")
  ).stdout.trim();
  return isAbsolute(printed) ? printed : join(checkout, printed);
}

export async function captureCheckout(checkout) {
  return {
    head: await revParse(checkout, "HEAD"),
    status: (await git(checkout, "status", "--porcelain")).stdout,
    staged: (await git(checkout, "diff", "--cached")).stdout,
    unstaged: (await git(checkout, "diff")).stdout,
    index: (await git(checkout, "ls-files", "-s")).stdout,
  };
}
