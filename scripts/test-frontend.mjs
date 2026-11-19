import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { availableParallelism, tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { acquireLocalSuite } from "./local-test-suite.mjs";
import {
  prepareMounted,
  printMountedListing,
} from "../dashboard/test-support/support/frontendMounted.mjs";
import { finishFrontendGroup } from "../dashboard/test-support/support/frontendOutputs.mjs";
import { frontendGroup } from "../dashboard/test-support/support/browserTestGroups.mjs";
import {
  frontendArguments,
  frontendFiles,
  matchesFrontendFile,
} from "../dashboard/test-support/support/frontendSelection.mjs";
import { fullDashboardSuite } from "../dashboard/test-support/support/fullSuiteSelection.mjs";
import { remainingSuiteTime } from "../dashboard/test-support/support/suiteDeadline.mjs";

const repository = fileURLToPath(new URL("../", import.meta.url));
const dashboard = fileURLToPath(frontendGroup.directory);
const playwrightConfig = path.join(dashboard, frontendGroup.config);
const vitestConfig = path.join(dashboard, "frontend.vitest.config.mts");
const { prefix } = frontendGroup;
const splitSetting = `${prefix}_SPLIT`;
const proofSetting = `${prefix}_PROOF_RECORD`;
const timesSetting = `${prefix}_TIMES`;
const deadlineSetting = `${prefix}_DEADLINE_MS`;
const argv = process.argv.slice(2);
const stop = new AbortController();

function runPlaywright(args, overrides = {}, silent = false) {
  stop.signal.throwIfAborted();
  const child = spawn(
    process.execPath,
    [
      path.join(repository, "node_modules/playwright/cli.js"),
      "test",
      "--config",
      playwrightConfig,
      ...args,
    ],
    {
      cwd: repository,
      env: { ...process.env, ...overrides },
      stdio: silent ? ["inherit", "ignore", "inherit"] : "inherit",
    },
  );
  const interrupt = () => child.kill("SIGINT");
  stop.signal.addEventListener("abort", interrupt, { once: true });
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code) => resolve(code ?? 1));
  }).finally(() => stop.signal.removeEventListener("abort", interrupt));
}

function json(file) {
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : undefined;
}

function workerCount(workers) {
  const cores = availableParallelism();
  if (workers === undefined) return process.env.CI ? cores : 2;
  if (/^\d+%$/.test(workers))
    return Math.max(
      1,
      Math.floor((cores * Number(workers.slice(0, -1))) / 100),
    );
  const value = Number(workers);
  if (!Number.isSafeInteger(value) || value < 1)
    throw new Error(`Invalid worker count: ${workers}`);
  return value;
}

// The group may need to settle a title selection before starting Playwright
// and its setup. Native list mode evaluates the native titles without builds.
async function retainedSelection(args, privateEnvironment, scratch) {
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
  const status = await runPlaywright(
    [...selection, "--list", "--pass-with-no-tests", "--reporter=json"],
    { ...privateEnvironment, PLAYWRIGHT_JSON_OUTPUT_FILE: listed },
    true,
  );
  if (status !== 0) {
    const errors = json(listed)?.errors ?? [];
    throw new Error(
      errors.map((error) => error.message).join("\n") ||
        "Playwright could not list the retained selection.",
    );
  }
  return (
    (json(listed)?.stats?.expected ?? 0) + (json(listed)?.stats?.skipped ?? 0) >
    0
  );
}

async function groupRun(args, files) {
  const deadline = remainingSuiteTime(
    process.env[deadlineSetting],
    deadlineSetting,
  );
  const timer =
    deadline === undefined
      ? undefined
      : setTimeout(
          () => stop.abort(new Error(`${deadlineSetting} reached.`)),
          deadline,
        ).unref();
  const scratch = mkdtempSync(path.join(tmpdir(), "dashboard-frontend-"));
  const startedAt = new Date().toISOString();
  const results = path.join(
    dashboard,
    frontendGroup.root,
    "test-results",
    `mounted-${startedAt.replaceAll(":", "-")}-${process.pid}`,
  );
  const report = path.join(results, "vitest.json");
  const nativeRecord = path.join(scratch, "playwright.json");
  const nativeTimes = path.join(scratch, "playwright-times.txt");
  const privateEnvironment = {
    [proofSetting]: nativeRecord,
    [timesSetting]: nativeTimes,
  };
  let release,
    browser,
    keep = false;
  try {
    delete process.env.FORCE_COLOR;
    delete process.env.NO_COLOR;
    process.env.NODE_DISABLE_COMPILE_CACHE = "1";
    if (fullDashboardSuite(argv, process.env, splitSetting))
      release = await acquireLocalSuite(repository, { signal: stop.signal });
    browser = await prepareMounted({
      config: vitestConfig,
      files: files.filter((file) => file.mounted),
      args,
      workers: workerCount(args.workers),
      report,
      signal: stop.signal,
    });
    const retains =
      files.some((file) => !file.mounted) &&
      (await retainedSelection(args, privateEnvironment, scratch));
    if (!browser.files.length) {
      if (retains) return await runPlaywright(argv);
      if (!args.allowEmpty) console.error("Error: No tests found.");
      return args.allowEmpty ? 0 : 1;
    }
    const native = retains
      ? {
          status: await runPlaywright(argv, privateEnvironment),
          record: json(nativeRecord),
        }
      : undefined;
    if (args.list) {
      for (const test of native?.record?.tests ?? [])
        console.log(
          `  [${test.project}] › ${test.titlePath.slice(2).join(" › ")}`,
        );
      printMountedListing(browser.files, dashboard);
    } else mkdirSync(results, { recursive: true });
    const mounted = args.list
      ? { status: 0, report: { testResults: browser.files } }
      : {
          status: stop.signal.aborted ? 1 : await browser.run(),
          report: json(report),
          selected: browser.selected,
        };
    keep = !args.list && mounted.status !== 0;
    const status = finishFrontendGroup({
      native,
      mounted,
      nativeTimes,
      optionalReporter: args.reporter,
      proofSetting,
      destination: process.env[proofSetting],
      times: process.env[timesSetting],
      run: {
        id: randomUUID(),
        startedAt,
        pid: process.pid,
        cwd: repository.replace(/\/$/, ""),
        configFile: vitestConfig,
        rootDir: dashboard,
        outputDirs: args.list ? [] : [results],
        argv,
        listing: args.list,
      },
    });
    if (keep) console.error(`Kept: ${path.relative(repository, results)}`);
    if (stop.signal.aborted) throw stop.signal.reason;
    return status;
  } finally {
    clearTimeout(timer);
    await browser?.close();
    await release?.();
    rmSync(scratch, { recursive: true, force: true });
    if (!keep) rmSync(results, { recursive: true, force: true });
  }
}

const interrupt = () =>
  stop.abort(new Error("Dashboard Frontend Test was interrupted."));
process.once("SIGINT", interrupt);
process.once("SIGTERM", interrupt);
try {
  const all = frontendFiles(process.env[splitSetting]);
  if (!all.some((file) => file.mounted)) {
    process.exitCode = await runPlaywright(argv);
  } else {
    const args = frontendArguments(argv);
    const files = all.filter((file) => matchesFrontendFile(file, args));
    if (!files.some((file) => file.mounted)) {
      process.exitCode = await runPlaywright(argv);
    } else if (
      args.nativeOptions.length ||
      (args.project && args.project !== "chromium")
    ) {
      throw new Error(
        "Use the direct Playwright config for engine-specific options. The frontend command accepts paths, grep, list, workers and the chromium project.",
      );
    } else {
      process.exitCode = await groupRun(args, files);
    }
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  process.off("SIGINT", interrupt);
  process.off("SIGTERM", interrupt);
}
