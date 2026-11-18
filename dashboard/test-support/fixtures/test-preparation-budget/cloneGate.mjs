// Hold each run-wide origin layout's pack at a parent-controlled reply, in
// whichever process prepares it. Every other command runs without the gate.
import childProcess from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import path from "node:path";
import { promisify } from "node:util";

const gate = process.env["OPEN_DOUGH_ARTIFACT_PROOF_GATE"];
const execFile = childProcess.execFile;
const run = promisify(execFile);

function held(command, args) {
  const target = args?.at(-1);
  return (
    gate !== undefined &&
    command === "git" &&
    args[0] === "clone" &&
    args.includes("--bare") &&
    typeof target === "string" &&
    path.basename(path.dirname(target)).startsWith("dough-start-preparation-")
  );
}

function gated(command, args, ...rest) {
  return execFile(command, args, ...rest);
}
gated[promisify.custom] = async (command, args, ...rest) => {
  if (held(command, args)) {
    const target = args.at(-1);
    await (await fetch(`${gate}/${path.basename(target)}`)).text();
  }
  return run(command, args, ...rest);
};
childProcess.execFile = gated;
syncBuiltinESMExports();
