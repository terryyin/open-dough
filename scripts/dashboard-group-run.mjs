// A dashboard group run: the group's Vitest files through its Vitest config
// and, when the group names a Playwright config, its retained Playwright
// specs through that config. The run owns the group's deadline, local suite
// admission, split, listing, times and proof record (OPEN_DOUGH_<group>_*).
import { randomUUID } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { availableParallelism, tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { acquireLocalSuite } from "./local-test-suite.mjs";
import { readJson, retainedPlaywright } from "./retained-playwright.mjs";
import {
  prepareVitest,
  printVitestListing,
} from "../dashboard/test-support/support/groupVitest.mjs";
import { finishGroupRun } from "../dashboard/test-support/support/groupOutputs.mjs";
import {
  groupArguments,
  groupFiles,
  matchesGroupFile,
} from "../dashboard/test-support/support/groupSelection.mjs";
import { fullDashboardSuite } from "../dashboard/test-support/support/fullSuiteSelection.mjs";
import { remainingSuiteTime } from "../dashboard/test-support/support/suiteDeadline.mjs";

const repository = fileURLToPath(new URL("../", import.meta.url));

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

/**
 * @param {{
 *   group: import("../dashboard/test-support/support/browserTestGroups.mjs").BrowserTestGroup,
 *   vitestConfig: string,
 *   engine: string,
 *   name: string,
 * }} options `vitestConfig` is relative to the group's directory; `engine`
 * names the Vitest cases' project in listings, times and the proof record.
 */
export async function runDashboardGroup({ group, vitestConfig, engine, name }) {
  const dashboard = fileURLToPath(group.directory);
  const vitestConfigFile = path.join(dashboard, vitestConfig);
  const { prefix } = group;
  const splitSetting = group.sharded === false ? undefined : `${prefix}_SPLIT`;
  const proofSetting = `${prefix}_PROOF_RECORD`;
  const timesSetting = `${prefix}_TIMES`;
  const deadlineSetting = `${prefix}_DEADLINE_MS`;
  const argv = process.argv.slice(2);
  const stop = new AbortController();
  const playwright =
    group.config === undefined
      ? undefined
      : retainedPlaywright({
          repository,
          config: path.join(dashboard, group.config),
          argv,
          signal: stop.signal,
        });

  function noTests(args) {
    if (!args.allowEmpty) console.error("Error: No tests found.");
    return args.allowEmpty ? 0 : 1;
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
    const scratch = mkdtempSync(path.join(tmpdir(), `${group.job}-`));
    const startedAt = new Date().toISOString();
    const results = path.join(
      dashboard,
      group.root,
      "test-results",
      `vitest-${startedAt.replaceAll(":", "-")}-${process.pid}`,
    );
    const report = path.join(results, "vitest.json");
    const nativeRecord = path.join(scratch, "playwright.json");
    const nativeTimes = path.join(scratch, "playwright-times.txt");
    const privateEnvironment = {
      [proofSetting]: nativeRecord,
      [timesSetting]: nativeTimes,
    };
    let release,
      vitest,
      keep = false;
    try {
      delete process.env.FORCE_COLOR;
      delete process.env.NO_COLOR;
      process.env.NODE_DISABLE_COMPILE_CACHE = "1";
      if (fullDashboardSuite(argv, process.env, splitSetting))
        release = await acquireLocalSuite(repository, { signal: stop.signal });
      vitest = await prepareVitest({
        config: vitestConfigFile,
        files: files.filter((file) => file.vitest),
        args,
        workers: workerCount(args.workers),
        report,
        signal: stop.signal,
      });
      const retains =
        playwright !== undefined &&
        files.some((file) => !file.vitest) &&
        (await playwright.selects(args, privateEnvironment, scratch));
      if (!vitest.files.length) {
        if (retains) return await playwright.run(argv);
        return noTests(args);
      }
      const native = retains
        ? {
            status: await playwright.run(argv, privateEnvironment),
            record: readJson(nativeRecord),
          }
        : undefined;
      if (args.list) {
        for (const test of native?.record?.tests ?? [])
          console.log(
            `  [${test.project}] › ${test.titlePath.slice(2).join(" › ")}`,
          );
        printVitestListing(vitest.files, dashboard, engine);
      } else mkdirSync(results, { recursive: true });
      const vitestRun = args.list
        ? { status: 0, report: { testResults: vitest.files } }
        : {
            status: stop.signal.aborted ? 1 : await vitest.run(),
            report: readJson(report),
            selected: vitest.selected,
          };
      keep = !args.list && vitestRun.status !== 0;
      const status = finishGroupRun({
        native,
        vitestRun,
        engine,
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
          configFile: vitestConfigFile,
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
      await vitest?.close();
      await release?.();
      rmSync(scratch, { recursive: true, force: true });
      if (!keep) rmSync(results, { recursive: true, force: true });
    }
  }

  const interrupt = () => stop.abort(new Error(`${name} was interrupted.`));
  process.once("SIGINT", interrupt);
  process.once("SIGTERM", interrupt);
  try {
    const all = groupFiles(
      group,
      splitSetting === undefined ? undefined : process.env[splitSetting],
    );
    if (playwright && !all.some((file) => file.vitest))
      return await playwright.run(argv);
    const args = groupArguments(argv);
    const files = all.filter((file) => matchesGroupFile(file, args));
    if (playwright && !files.some((file) => file.vitest))
      return await playwright.run(argv);

    const unsupported = [...args.nativeOptions];
    if (args.project && args.project !== "chromium")
      unsupported.push(`--project=${args.project}`);
    if (unsupported.length) {
      const direct = playwright
        ? "Use the direct Playwright config for engine-specific options. "
        : "";
      throw new Error(
        `${direct}The ${group.command} command does not support: ${unsupported.join(", ")}.`,
      );
    }
    if (!playwright) {
      const nonVitestSpecs = files
        .filter((file) => !file.vitest)
        .map(({ file }) => path.relative(repository, file));
      if (nonVitestSpecs.length)
        throw new Error(
          `${group.command} requires a Vitest import in: ${nonVitestSpecs.join(", ")}.`,
        );
      if (!files.length) return noTests(args);
    }
    return await groupRun(args, files);
  } catch (error) {
    console.error(error.message);
    return 1;
  } finally {
    process.off("SIGINT", interrupt);
    process.off("SIGTERM", interrupt);
  }
}
