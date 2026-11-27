// Observe when the detached owner begins waiting for each test read.
import childProcess from "node:child_process";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { AdmittedCalls } from "../../../Distribution/src/skills/dough-execute-plan/scripts/github-request-calls.mjs";
import { parseRequest } from "../../test-support/support/ghRequest.ts";

const probeVariable = "DOUGH_TEST_OWNER_ADMISSIONS";
const owner = "github-request-owner.mjs";

export function ownerAdmissionEnvironment(log, paths) {
  writeFileSync(log, "");
  return {
    [probeVariable]: JSON.stringify({ log, paths }),
    NODE_OPTIONS: [
      process.env["NODE_OPTIONS"],
      `--import=${JSON.stringify(import.meta.url)}`,
    ]
      .filter(Boolean)
      .join(" "),
  };
}

export function ownerAdmissions(log, path) {
  return readFileSync(log, "utf8")
    .split("\n")
    .filter((line) => line === path).length;
}

function observeAdmissions({ log, paths }) {
  const request = AdmittedCalls.prototype.request;
  AdmittedCalls.prototype.request = function (args, signal, bounds) {
    const pending = request.call(this, args, signal, bounds);
    // For a fixed read, request registers the waiter before returning.
    const read = parseRequest(args);
    if (
      read.kind === "content" &&
      paths.includes(read.path) &&
      !signal.aborted
    ) {
      appendFileSync(log, `${read.path}\n`);
    }
    return pending;
  };
}

function forwardProbeToOwner() {
  const spawn = childProcess.spawn;
  childProcess.spawn = function (command, args, options) {
    if (
      command === process.execPath &&
      Array.isArray(args) &&
      args.some((arg) => basename(arg) === owner)
    ) {
      // The detached owner starts without the dashboard's NODE_OPTIONS.
      return spawn.call(
        this,
        command,
        ["--import", import.meta.url, ...args],
        options,
      );
    }
    return spawn.apply(this, arguments);
  };
  syncBuiltinESMExports();
}

const probe = process.env[probeVariable];
if (probe !== undefined) {
  if (basename(process.argv[1] ?? "") === owner)
    observeAdmissions(JSON.parse(probe));
  else forwardProbeToOwner();
}
