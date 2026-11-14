import { execFile } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);

export async function hostPrepareCheckout(cwd, env) {
  await exec("npm", ["ci"], {
    cwd,
    env,
    timeout: 60_000,
  });
}

export function changeDependencyState(checkout) {
  const lockPath = join(checkout, "package-lock.json");
  const lock = JSON.parse(readFileSync(lockPath, "utf8"));
  lock._fixtureDependencyState = "changed";
  writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
}

export function createNestedUnpreparedCheckout(origin) {
  const nested = join(origin, ".worktrees", "nested-exec");
  mkdirSync(nested, { recursive: true });
  for (const name of ["CONTRIBUTING.md", "package.json", "package-lock.json"]) {
    copyFileSync(join(origin, name), join(nested, name));
  }
  cpSync(join(origin, "scripts"), join(nested, "scripts"), { recursive: true });
  cpSync(join(origin, "packages"), join(nested, "packages"), {
    recursive: true,
  });
  return nested;
}
