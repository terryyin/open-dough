// Disposable origin publication with the actual current dashboard/package scripts.
// Every repository, release directory, and machine HOME belongs to this test.
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

export async function dashboardReleaseFixture(fullSource = false) {
  const root = mkdtempSync(path.join(tmpdir(), "dough-dashboard-release-"));
  const development = path.join(root, "development");
  const origin = path.join(root, "origin.git");
  const home = path.join(root, "home");
  const releasesRoot = path.join(root, "releases");
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
    } else {
      cpSync(
        path.join(repoRoot, "src/install"),
        path.join(development, "src/install"),
        { recursive: true },
      );
    }
    await git("init", "--quiet", "-b", "main");
    await git("config", "user.name", "Dashboard release fixture");
    await git("config", "user.email", "fixture@example.invalid");
    await git("config", "maintenance.auto", "false");
    await exec("git", ["init", "--quiet", "--bare", "-b", "main", origin], {
      env,
    });
    await git("remote", "add", "origin", origin);
    const record = (message: string) =>
      git("-c", "core.hooksPath=/dev/null", "commit", "--quiet", "-m", message);
    await git("add", "--all");
    await record("Fixture source");
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
    // Temporary tag-era publication; main-based delivery replaces it.
    const releaseChanges = (version: string, marker = version) => ({
      VERSION: `${version}\n`,
      ...markerChanges(marker),
    });
    return {
      root,
      development,
      origin,
      home,
      releasesRoot,
      env,
      git,
      commit,
      push,
      markerChanges,
      releaseChanges,
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
      async publish(
        version: string,
        options: {
          annotated?: boolean;
          changes?: PathChanges;
          marker?: string;
          versionFile?: string;
        } = {},
      ) {
        const sha = await commit(
          {
            ...releaseChanges(
              options.versionFile ?? version,
              options.marker ?? version,
            ),
            ...options.changes,
          },
          `Release fixture ${options.marker ?? version}`,
        );
        if (options.annotated)
          await git("tag", "-a", `v${version}`, "-m", `Version ${version}`);
        else await git("tag", `v${version}`);
        await push();
        await git("push", "--quiet", "origin", "--tags");
        return sha;
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
