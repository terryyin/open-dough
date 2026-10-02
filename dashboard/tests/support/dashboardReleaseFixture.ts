// Local release publication with the actual current dashboard/package scripts.
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
      const files = (
        await exec(
          "git",
          ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
          { cwd: repoRoot },
        )
      ).stdout
        .split("\0")
        .filter(Boolean);
      for (const file of files) {
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
    const commit = async (version: string, marker = version) => {
      writeFileSync(path.join(development, "VERSION"), `${version}\n`);
      writeFileSync(path.join(development, "fixture-marker"), marker);
      if (fullSource) {
        const index = path.join(development, "dashboard/index.html");
        writeFileSync(
          index,
          readFileSync(index, "utf8").replace(
            /<title>.*?<\/title>/,
            `<title>${marker}</title>`,
          ),
        );
      }
      await git("add", ".");
      await git(
        "-c",
        "core.hooksPath=/dev/null",
        "commit",
        "--quiet",
        "-m",
        `Release fixture ${marker}`,
      );
      await git("push", "--quiet", "origin", "main");
      return git("rev-parse", "HEAD");
    };
    return {
      root,
      development,
      origin,
      home,
      releasesRoot,
      env,
      git,
      commit,
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
          marker?: string;
          versionFile?: string;
        } = {},
      ) {
        const sha = await commit(
          options.versionFile ?? version,
          options.marker ?? version,
        );
        if (options.annotated)
          await git("tag", "-a", `v${version}`, "-m", `Version ${version}`);
        else await git("tag", `v${version}`);
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
