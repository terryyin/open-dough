// The retained Playwright child of a dashboard group run: the group's
// Playwright config over its non-Vitest specs, and its title selection.
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export function readJson(file) {
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : undefined;
}

export function retainedPlaywright({ repository, config, argv, signal }) {
  function run(args, overrides = {}, silent = false) {
    signal.throwIfAborted();
    const child = spawn(
      process.execPath,
      [
        path.join(repository, "node_modules/playwright/cli.js"),
        "test",
        "--config",
        config,
        ...args,
      ],
      {
        cwd: repository,
        env: { ...process.env, ...overrides },
        stdio: silent ? ["inherit", "ignore", "inherit"] : "inherit",
      },
    );
    const interrupt = () => child.kill("SIGINT");
    signal.addEventListener("abort", interrupt, { once: true });
    return new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("close", (code) => resolve(code ?? 1));
    }).finally(() => signal.removeEventListener("abort", interrupt));
  }

  // The group may need to settle a title selection before starting Playwright
  // and its setup. Native list mode evaluates the native titles without builds.
  async function selects(args, privateEnvironment, scratch) {
    if (
      !args.grep &&
      !args.grepInvert &&
      !args.files.some((filter) => filter.line !== undefined)
    )
      return true;
    const listed = path.join(scratch, "retained-list.json");
    const selection = argv.filter(
      (arg, index) =>
        arg !== "--list" &&
        arg !== "--reporter" &&
        !arg.startsWith("--reporter=") &&
        argv[index - 1] !== "--reporter",
    );
    const status = await run(
      [...selection, "--list", "--pass-with-no-tests", "--reporter=json"],
      { ...privateEnvironment, PLAYWRIGHT_JSON_OUTPUT_FILE: listed },
      true,
    );
    if (status !== 0) {
      const errors = readJson(listed)?.errors ?? [];
      throw new Error(
        errors.map((error) => error.message).join("\n") ||
          "Playwright could not list the retained selection.",
      );
    }
    const stats = readJson(listed)?.stats;
    return (stats?.expected ?? 0) + (stats?.skipped ?? 0) > 0;
  }

  return { run, selects };
}
