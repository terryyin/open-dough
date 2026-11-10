import { spawn } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  deferChildExit,
  enterEnvironment,
  fixtureTeardown,
} from "./fixture-teardown-test-fixtures.mjs";
import { requestOwnerEnvironment } from "./github-request-owner-test-fixtures.mjs";
import { instrumentedGithub } from "./instrumented-github-test-fixtures.mjs";

// A `gh` that answers `gh api --include` as GitHub's API does from the
// `github.json` beside it, and records each call twice in `calls.jsonl`: when
// asked and when answered. While `limited.json` counts down, a matching
// route answers a rate limit directing the wait it names, one second unless
// told. A job's log waits for `release-logs` when the state says `holdLogs`,
// and any call waits for `release` while `hold` stands. It asks as the user
// of the fixture login it holds, if any (`fixtureLogin`): GH_TOKEN's, or
// else the one stored under GH_CONFIG_DIR. `gh auth token` prints that
// login's token; each call records its user, a log names it, and a limit
// naming a user refuses only that user. Once `on-end` stands, a call asked
// to end records `told-to-end` and ends, or stays when the file says `stay`.
// A listed run's own route answers that run; `attemptJobs["RUN/ATTEMPT"]`
// names one attempt's jobs, else every attempt has `jobs`.

// A fixture directory holding that `gh` and what its GitHub holds. `env` puts
// it first on PATH for a child process; `enter` does so for this process.
export function instrumentedGithubFixture(t, state) {
  const directory = mkdtempSync(join(tmpdir(), "ci-github-acquisition-"));
  const teardown = fixtureTeardown(directory);
  t.after(teardown.cleanup);
  const file = (name) => join(directory, name);
  writeFileSync(file("gh"), instrumentedGithub);
  chmodSync(file("gh"), 0o755);
  const set = (held) =>
    writeFileSync(file("github.json"), JSON.stringify(held));
  set(state);
  // An append can be observed before its bytes or final newline arrive.
  const calls = () =>
    existsSync(file("calls.jsonl"))
      ? readFileSync(file("calls.jsonl"), "utf8")
          .split("\n")
          .slice(0, -1)
          .map((line) => JSON.parse(line))
      : [];
  const environment = {
    ...requestOwnerEnvironment(teardown),
    CI_GH_FIXTURE: directory,
    PATH: `${directory}${delimiter}${process.env.PATH}`,
  };
  return {
    teardown,
    env: { ...process.env, ...environment },
    // Routes this process's own requests through the fixture for this test.
    enter: () => enterEnvironment(t, environment),
    set,
    calls,
    // Every upstream request so far, as the arguments `gh` was given.
    asked: () =>
      calls()
        .filter(({ phase }) => phase === "asked")
        .map(({ args }) => args.join(" ")),
    // The most requests that were at GitHub at one time.
    mostUnderWay() {
      let underWay = 0;
      let most = 0;
      for (const { phase } of calls()) {
        underWay += phase === "asked" ? 1 : -1;
        most = Math.max(most, underWay);
      }
      return most;
    },
    limit: (count, match, wait = 1, only = undefined) =>
      writeFileSync(
        file("limited.json"),
        JSON.stringify({ count, match, wait, only }),
      ),
    holdRequests: () => writeFileSync(file("hold"), ""),
    releaseRequests: () => writeFileSync(file("release"), ""),
    releaseLogs: () => writeFileSync(file("release-logs"), ""),
    // From now on each call records being asked to end, and `stay` or ends.
    recordEndings: (then = "end") => writeFileSync(file("on-end"), then),
  };
}

// One upstream request as the fixture's `gh` was given it.
export const apiCall = (route) =>
  `api --include repos/owner/repo/actions/${route}`;

// 150 jobs, so an attempt's jobs span two pages; `failed` names the failed.
export const completedJobs = (failed) =>
  Array.from(Array(150).keys(), (index) => ({
    id: 1000 + index,
    name: `job ${index}`,
    status: "completed",
    conclusion: failed.includes(index) ? "failure" : "success",
    html_url: `https://github.test/owner/repo/actions/runs/42/job/${1000 + index}`,
    steps: [
      { number: 1, name: "Set up job", conclusion: "success" },
      {
        number: 2,
        name: "Run tests",
        conclusion: failed.includes(index) ? "failure" : "success",
      },
    ],
  }));

export async function until(condition, description, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  while (!condition()) {
    if (Date.now() > deadline) throw new Error(`Timed out: ${description}`);
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}

const script = (name) => fileURLToPath(new URL(`./${name}`, import.meta.url));

// Starts an installed script as its own process against the fixture's `gh`,
// collecting what it prints; the fixture's teardown ends it.
export function startInstalledScript(github, name, args) {
  const child = spawn(process.execPath, [script(name), ...args], {
    env: github.env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  deferChildExit(github.teardown, child);
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    stdout += chunk;
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });
  const exited = new Promise((resolve) =>
    child.once("exit", (code) => resolve(code)),
  );
  const lines = () =>
    stdout
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  return {
    exited,
    stdout: () => stdout,
    stderr: () => stderr,
    // The JSON records printed so far, one per line.
    events: lines,
    async event(type) {
      await until(
        () =>
          child.exitCode !== null || lines().some((line) => line.type === type),
        `${name} printed ${type}; stderr: ${stderr}`,
      );
      const found = lines().find((line) => line.type === type);
      if (!found)
        throw new Error(`${name} exited before printing ${type}: ${stderr}`);
      return found;
    },
  };
}
