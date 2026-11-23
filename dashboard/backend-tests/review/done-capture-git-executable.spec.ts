// A Done capture starts the developer-tool Git directly when macOS would run
// Apple's launcher, while a Git earlier on PATH, Linux, and an unresolved
// developer tool keep the ordinary `git` invocation and the inherited PATH.
import { execFileSync } from "node:child_process";
import { chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { defaultGitOutputLimit, runGit } from "../../server/gitRunner.ts";
import { captureBranchResult } from "../../server/sessionBranchCapture.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";

type Start = {
  readonly file: string;
  readonly args: readonly string[];
  readonly path: string | undefined;
};
const started = vi.hoisted((): Start[] => []);

vi.mock("node:child_process", async (original) => {
  const actual = await original<typeof import("node:child_process")>();
  const { promisify } = await import("node:util");
  const execFile = (...call: Parameters<typeof actual.execFile>) => {
    const [file, args, options] = call as unknown as [
      string,
      readonly string[] | undefined,
      { env?: NodeJS.ProcessEnv } | undefined,
    ];
    started.push({
      file,
      args: args ?? [],
      path: (options?.env ?? process.env).PATH,
    });
    return actual.execFile(...call);
  };
  Object.assign(execFile, {
    [promisify.custom]: (actual.execFile as unknown as Record<symbol, unknown>)[
      promisify.custom
    ],
  });
  return { ...actual, execFile };
});

const appleOnly = "/usr/bin:/bin";
const macOS = process.platform === "darwin";
const developerGit = macOS
  ? execFileSync("/usr/bin/xcrun", ["-f", "git"], { encoding: "utf8" }).trim()
  : "git";

function usingPath(searchPath: string) {
  const inherited = process.env.PATH;
  process.env.PATH = searchPath;
  onTestFinished(() => {
    process.env.PATH = inherited;
  });
}

const gitStarts = (from: number) =>
  started.slice(from).filter(({ file }) => file !== "/usr/bin/xcrun");

async function aDraftDone() {
  const {
    records: { "isolated-draft": record },
    performWork,
    at,
  } = await aDoneCaptureCase()
    .withWorkspace("draft")
    .withIsolatedLaunch("isolated-draft", { launched: 60 }, "draft")
    .please();
  const { tip } = await performWork(
    makeMe.aCheckoutWork.committing("tip", { at: at(30) }),
    { in: "draft" },
  );
  return { capture: () => captureBranchResult(record, at(10)), tip };
}

test("a Done capture behind Apple's launcher starts the developer-tool Git", async () => {
  const { capture, tip } = await aDraftDone();
  usingPath(appleOnly);
  const from = started.length;

  const { result } = await capture();

  expect(result).toMatchObject({ committedTip: tip, revision: tip });
  const starts = gitStarts(from);
  expect(starts.length).toBeGreaterThan(0);
  expect(new Set(starts.map(({ file }) => file))).toEqual(
    new Set([developerGit]),
  );
  expect(new Set(starts.map(({ path }) => path))).toEqual(new Set([appleOnly]));
  expect(process.env.PATH).toBe(appleOnly);
});

test("a caller's Git earlier on PATH receives the Done capture's calls", async () => {
  const { capture, tip } = await aDraftDone();
  const shims = await mkdtemp(path.join(tmpdir(), "caller-git-"));
  onTestFinished(() => rm(shims, { recursive: true, force: true }));
  const calls = path.join(shims, "calls");
  await writeFile(
    path.join(shims, "git"),
    `#!/bin/sh\necho "$*" >> '${calls}'\nexec '${macOS ? developerGit : "/usr/bin/git"}' "$@"\n`,
  );
  await chmod(path.join(shims, "git"), 0o755);
  usingPath(appleOnly);
  await runGit(["--version"], { maxBuffer: defaultGitOutputLimit });
  const preferred = `${shims}${path.delimiter}${appleOnly}`;
  usingPath(preferred);
  const from = started.length;

  const { result } = await capture();

  expect(result).toMatchObject({ committedTip: tip, revision: tip });
  const starts = gitStarts(from);
  expect(new Set(starts.map(({ file }) => file))).toEqual(new Set(["git"]));
  // Independent reads run concurrently, so their order may differ.
  expect((await readFile(calls, "utf8")).trim().split("\n").sort()).toEqual(
    starts.map(({ args }) => args.join(" ")).sort(),
  );
  expect(process.env.PATH).toBe(preferred);
});

const developerDirectory = path.resolve(developerGit, "../../..");

async function gitStartedFor(
  env: Readonly<Record<string, string>>,
  cwd?: string,
) {
  const from = started.length;
  await runGit(["--version"], {
    env,
    ...(cwd === undefined ? {} : { cwd }),
    maxBuffer: defaultGitOutputLimit,
  }).catch(() => undefined);
  return gitStarts(from).map(({ file, path }) => ({ file, path }));
}

test("a call's own developer directory selects its developer-tool Git", async () => {
  expect(
    await gitStartedFor({ PATH: appleOnly, DEVELOPER_DIR: developerDirectory }),
  ).toEqual([{ file: developerGit, path: appleOnly }]);
});

test("an unresolved developer tool keeps the ordinary Git invocation", async () => {
  expect(
    await gitStartedFor({
      PATH: appleOnly,
      DEVELOPER_DIR: path.join(tmpdir(), "no-developer-tools"),
    }),
  ).toEqual([{ file: "git", path: appleOnly }]);
});

test("a relative PATH entry finds Apple's launcher from the call's folder", async () => {
  expect(await gitStartedFor({ PATH: "." }, "/usr/bin")).toEqual([
    { file: developerGit, path: "." },
  ]);
});
