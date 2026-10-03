// Disposable origin/main publication with the actual current dashboard/package
// scripts. Every repository, deployment directory, and machine HOME belongs to
// this test.
import { execFile } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const repoRoot = process.cwd();

// Path contents to publish; `null` deletes the path. Nothing else changes.
export type PathChanges = Record<string, string | null>;

export async function publishedMainFixture(fullSource = false) {
  const root = mkdtempSync(path.join(tmpdir(), "dough-published-main-"));
  const development = path.join(root, "development");
  const origin = path.join(root, "origin.git");
  const home = path.join(root, "home");
  const deploymentsRoot = path.join(root, "deployments");
  mkdirSync(development);
  mkdirSync(home);
  const env = { ...process.env, HOME: home };
  const git = async (...args: string[]) =>
    (await exec("git", args, { cwd: development, env })).stdout.trim();
  try {
    if (fullSource) {
      // The live working tree: new names included, deleted tracked paths not.
      const listed = async (...args: string[]) =>
        (
          await exec("git", ["ls-files", "-z", ...args], { cwd: repoRoot })
        ).stdout
          .split("\0")
          .filter(Boolean);
      const deleted = new Set(await listed("--deleted"));
      for (const file of await listed(
        "--cached",
        "--others",
        "--exclude-standard",
      )) {
        if (deleted.has(file)) continue;
        const destination = path.join(development, file);
        mkdirSync(path.dirname(destination), { recursive: true });
        cpSync(path.join(repoRoot, file), destination);
      }
    }
    await git("init", "--quiet", "-b", "main");
    await git("config", "user.name", "Published main fixture");
    await git("config", "user.email", "fixture@example.invalid");
    await git("config", "maintenance.auto", "false");
    await exec("git", ["init", "--quiet", "--bare", "-b", "main", origin], {
      env,
    });
    await git("remote", "add", "origin", origin);
    const record = (message: string, ...options: string[]) =>
      git(
        "-c",
        "core.hooksPath=/dev/null",
        "commit",
        "--quiet",
        ...options,
        "-m",
        message,
      );
    await git("add", "--all");
    await record("Fixture source", "--allow-empty");
    // Commits exactly the requested path changes on local main.
    const commit = async (changes: PathChanges, message: string) => {
      const paths = Object.keys(changes);
      if (paths.length === 0) throw new Error("No fixture path changes");
      for (const [file, content] of Object.entries(changes)) {
        const destination = path.join(development, file);
        if (content === null) rmSync(destination);
        else {
          mkdirSync(path.dirname(destination), { recursive: true });
          writeFileSync(destination, content);
        }
      }
      await git("add", "--all", "--", ...paths);
      await record(message);
      return git("rev-parse", "HEAD");
    };
    const push = () => git("push", "--quiet", "origin", "main");
    // Commits and pushes the requested changes as origin's new main commit.
    const publish = async (changes: PathChanges, message: string) => {
      const sha = await commit(changes, message);
      await push();
      return sha;
    };
    // A real browser journey's visible marker: the served page title.
    const markerChanges = (marker: string): PathChanges => {
      const changes: PathChanges = { "fixture-marker": marker };
      if (fullSource) {
        const index = path.join(development, "dashboard/index.html");
        changes["dashboard/index.html"] = readFileSync(index, "utf8").replace(
          /<title>.*?<\/title>/,
          `<title>${marker}</title>`,
        );
      }
      return changes;
    };
    return {
      root,
      development,
      origin,
      home,
      deploymentsRoot,
      env,
      git,
      commit,
      push,
      publish,
      markerChanges,
      async installDevelopment() {
        await exec(
          "npm",
          [
            "ci",
            "--no-audit",
            "--no-fund",
            "--fetch-retries=0",
            "--fetch-timeout=20000",
          ],
          {
            cwd: development,
            env,
            timeout: 180_000,
          },
        );
      },
      cleanup() {
        rmSync(root, { recursive: true, force: true });
      },
    };
  } catch (error) {
    rmSync(root, { recursive: true, force: true });
    throw error;
  }
}
