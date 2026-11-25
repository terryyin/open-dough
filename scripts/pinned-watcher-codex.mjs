import { execFile } from "node:child_process";
import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const codexPackage = "@openai/codex";
const codexVersion = "0.167.1";

// The watcher uses the package's launcher. Validate the installed pin even
// when a previous setup invocation supplied its path.
/** @param {string} launcher */
export async function readPinnedWatcherCodex(launcher) {
  if (!path.isAbsolute(launcher)) throw new Error("No pinned Codex executable");
  const codex = await realpath(launcher);
  const manifest = JSON.parse(
    await readFile(
      path.resolve(path.dirname(codex), "../package.json"),
      "utf8",
    ),
  );
  if (manifest.name !== codexPackage || manifest.version !== codexVersion) {
    throw new Error(`Expected ${codexPackage}@${codexVersion} at ${codex}`);
  }
  return codex;
}

/** @param {string} cwd */
export async function acquirePinnedWatcherCodex(cwd) {
  const { stdout } = await exec(
    "npm",
    [
      "exec",
      "--yes",
      "--prefer-offline",
      "--fetch-retries=0",
      "--fetch-timeout=20000",
      "--ignore-scripts",
      "--package",
      `${codexPackage}@${codexVersion}`,
      "--",
      "sh",
      "-c",
      "command -v codex",
    ],
    {
      cwd,
      timeout: 45_000,
      env: {
        ...process.env,
        NPM_CONFIG_AUDIT: "false",
        NPM_CONFIG_FUND: "false",
        NPM_CONFIG_UPDATE_NOTIFIER: "false",
      },
    },
  );
  const codex = await readPinnedWatcherCodex(stdout.trim());
  // npm treats the native platform package as optional. Prove the launcher
  // can actually start that binary before handing it to a worker.
  const version = await exec(codex, ["--version"], { cwd, timeout: 5_000 });
  if (version.stdout.trim() !== `codex-cli ${codexVersion}`) {
    throw new Error(`Expected native Codex ${codexVersion} at ${codex}`);
  }
  return codex;
}

if (import.meta.main) {
  const [job, split] = process.argv.slice(2);
  if (job === undefined) {
    console.log(await acquirePinnedWatcherCodex(process.cwd()));
  } else {
    const { browserGroupSelection, browserTestGroups } =
      await import("../dashboard/test-support/support/browserTestGroups.mjs");
    const { selectedFiles } =
      await import("../dashboard/test-support/support/testFiles.mjs");
    const group = browserTestGroups.find((candidate) => candidate.job === job);
    if (!group) throw new Error(`Unknown browser test group ${job}`);
    const watcherSpec = new URL(
      "../e2e/runtime/production-watcher-updates.spec.ts",
      import.meta.url,
    );
    const needed = selectedFiles(
      group.directory,
      split,
      browserGroupSelection(group),
    ).some((file) => new URL(file, group.directory).href === watcherSpec.href);
    console.log(`needed=${needed}`);
  }
}
