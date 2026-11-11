// Disposable origin/main publication with the actual current dashboard/package
// scripts. Every repository, deployment directory, and machine HOME belongs to
// this test. Fixtures that need GitHub answers also own their synthetic
// `gh` and request owner (./fakeGh.ts).
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
import { stopCursorRunner } from "../../server/hosts/cursor/runnerClient.ts";
import {
  endFakeGh,
  fakeGhEnv,
  installFakeGh,
  type FakeGhPaths,
} from "./fakeGh.ts";
import { repoRoot } from "./repositoryRoot.ts";

const exec = promisify(execFile);

// Path contents to publish; `null` deletes the path. Nothing else changes.
export type PathChanges = Record<string, string | Buffer | null>;

// One test's fixture: its repositories, HOME, environment and publication.
export type PublishedMainFixture = Awaited<
  ReturnType<typeof publishedMainFixture>
>;

export function publishedMainFixture(
  fullSource = false,
  sourcePaths: readonly string[] = [],
) {
  return createPublishedMainFixture(fullSource, sourcePaths, installFakeGh);
}

// The real-Git fixture for CLI cases that supply no GitHub data.
export function localPublishedMainFixture(sourcePaths: readonly string[]) {
  return createPublishedMainFixture(true, sourcePaths, () => undefined);
}

async function createPublishedMainFixture<Gh extends FakeGhPaths | undefined>(
  fullSource: boolean,
  sourcePaths: readonly string[],
  gitHub: (root: string) => Gh,
) {
  const root = mkdtempSync(path.join(tmpdir(), "dough-published-main-"));
  const development = path.join(root, "development");
  const origin = path.join(root, "origin.git");
  const home = path.join(root, "home");
  const deploymentsRoot = path.join(root, "deployments");
  mkdirSync(development);
  mkdirSync(home);
  const gh = gitHub(root);
  const env = {
    ...process.env,
    HOME: home,
    ...(gh === undefined ? {} : fakeGhEnv(gh)),
  };
  // Stops the Cursor runner a production dashboard of this HOME detached
  // (its own process group, so no command's stop reaches it), ends the
  // request owner this fixture's commands asked `gh` through, then removes
  // everything the fixture made.
  const cleanup = async () => {
    await stopCursorRunner(home);
    if (gh !== undefined) await endFakeGh(gh);
    rmSync(root, { recursive: true, force: true });
  };
  const git = async (...args: string[]) =>
    (await exec("git", args, { cwd: development, env })).stdout.trim();
  try {
    if (fullSource) {
      // The live working tree: new names included, deleted tracked paths not.
      // Agent avatar images are left out: the page loads them by URL, so no
      // build or check needs them, and their size would otherwise be copied,
      // hashed, fetched, and built into every deployment.
      const listed = async (...args: string[]) =>
        (
          await exec("git", ["ls-files", "-z", ...args, "--", ...sourcePaths], {
            cwd: repoRoot,
          })
        ).stdout
          .split("\0")
          .filter(Boolean);
      const deleted = new Set(await listed("--deleted"));
      for (const file of await listed(
        "--cached",
        "--others",
        "--exclude-standard",
      )) {
        if (
          deleted.has(file) ||
          file.startsWith("dashboard/public/agent-avatars/")
        )
          continue;
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
    // Streams the whole source straight into one pack instead of thousands of
    // loose objects, which dominated setup while other workers did the same.
    // Only this first addition is affected; contents and commits are not.
    await git("-c", "core.bigFileThreshold=1", "add", "--all");
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
      gh,
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
            // Development needs its dev dependencies whatever NODE_ENV the
            // test run inherited.
            "--include=dev",
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
      cleanup,
    };
  } catch (error) {
    await cleanup();
    throw error;
  }
}
