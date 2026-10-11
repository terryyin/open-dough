// One consumer of the GitHub request source as a process of its own, driven
// by a test over its standard streams: run directly, it asks what each line
// tells it and prints how each request settled and each failed call it was
// told of.
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { isDirectCliEntry } from "./ci-direct-entry.mjs";
import { deferChildExit } from "./fixture-teardown-test-fixtures.mjs";
import { GitHubRequests } from "./github-requests.mjs";

// What the request owner refuses unasked: its answer shows the owner has
// read everything this consumer sent before it.
const refusedUnasked = ["api", "--input", "never-read"];

// Starts a consumer process in `environment`; `teardown` ends it. `ask`
// starts one request, answering its settlement and a `cancel` that ends its
// wait; `reached` resolves once the owner has every request asked so far.
export function startConsumer(environment, teardown) {
  const child = spawn(process.execPath, [fileURLToPath(import.meta.url)], {
    env: environment,
    stdio: ["pipe", "pipe", "inherit"],
  });
  deferChildExit(teardown, child, "SIGKILL");
  const settlements = new Map();
  const failed = [];
  let asked = 0;
  createInterface(child.stdout).on("line", (line) => {
    const said = JSON.parse(line);
    if (said.failed !== undefined) failed.push(said.failed);
    else settlements.get(said.settled)(said);
  });
  const ask = (args) => {
    asked += 1;
    const id = asked;
    const settled = new Promise((resolve) => settlements.set(id, resolve));
    child.stdin.write(`${JSON.stringify({ ask: id, args })}\n`);
    return {
      settled,
      cancel: () => child.stdin.write(`${JSON.stringify({ cancel: id })}\n`),
    };
  };
  return {
    pid: child.pid,
    // Every failed call this process was told of, by cause.
    failed,
    ask,
    reached: () => ask(refusedUnasked).settled,
    kill: () => child.kill("SIGKILL"),
  };
}

if (isDirectCliEntry(import.meta.url, process.argv[1])) {
  const say = (said) => process.stdout.write(`${JSON.stringify(said)}\n`);
  const github = new GitHubRequests({
    boundMs: 60_000,
    backoffBaseMs: 60_000,
    failed: ({ cause }) => say({ failed: cause }),
  });
  const waits = new Map();
  createInterface(process.stdin).on("line", (line) => {
    const { ask, cancel, args } = JSON.parse(line);
    if (cancel !== undefined) {
      waits.get(cancel).abort(new Error("left"));
      return;
    }
    const wait = new AbortController();
    waits.set(ask, wait);
    github.request(args, wait.signal).then(
      ({ status, failure, body }) =>
        say({ settled: ask, status, failure, body }),
      (error) => say({ settled: ask, rejected: error.message }),
    );
  });
}
