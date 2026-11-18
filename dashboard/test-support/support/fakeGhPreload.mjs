// Consumer processes add this explicit preload only to their private owner.
// Only that owner replaces fake gh api execution; auth and every other command
// retain Node's native overloads and promisification.
import childProcess from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { promisify } from "node:util";
import { runFakeGh } from "./fakeGhTransport.mjs";

const preload = import.meta.url;
const isOwner = (argv) =>
  Array.isArray(argv) &&
  argv.some((arg) => basename(arg) === "github-request-owner.mjs");
const nativeSpawn = childProcess.spawn;
childProcess.spawn = function (command, argv, options) {
  const env = options?.env ?? process.env;
  if (
    command === process.execPath &&
    isOwner(argv) &&
    env.FAKE_GH_TRANSPORT === "in-process"
  ) {
    const ownerArgs = ["--import", preload, ...argv];
    return nativeSpawn(command, ownerArgs, options);
  }
  return nativeSpawn.apply(this, arguments);
};

if (
  isOwner(process.argv.slice(1)) &&
  process.env.FAKE_GH_TRANSPORT === "in-process"
) {
  const nativeExec = childProcess.execFile;
  const selected = (file, args) => file === "gh" && args?.[0] === "api";
  function execFile(file, args, options, callback) {
    if (!selected(file, args)) {
      return nativeExec.apply(this, arguments);
    }
    const completed = typeof options === "function" ? options : callback;
    const settings = typeof options === "function" ? {} : (options ?? {});
    return runFakeGh(args, settings, completed);
  }
  execFile[promisify.custom] = (file, args, options) => {
    if (!selected(file, args)) {
      return promisify(nativeExec)(file, args, options);
    }
    let child;
    const result = new Promise((resolve, reject) => {
      child = execFile(file, args, options, (error, stdout, stderr) => {
        if (error) {
          reject(Object.assign(error, { stdout, stderr }));
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
    result.child = child;
    return result;
  };
  childProcess.execFile = execFile;
}
syncBuiltinESMExports();
