// Run the public npm command from a fixture checkout. Observe its own output
// and exit, and signal the full npm group so the watcher receives shutdown.
import { stripVTControlCharacters } from "node:util";
import {
  endGroup,
  spawnGroupLeader,
  type GroupLeader,
} from "./processGroup.ts";

export function dashboardCommand(
  directory: string,
  env: NodeJS.ProcessEnv,
  script: string,
  args: string[] = [],
) {
  const child = spawnGroupLeader("npm", ["run", script, "--", ...args], {
    cwd: directory,
    env,
  });
  let output = "";
  const collect = (chunk: Buffer) => {
    output += chunk.toString("utf8");
  };
  child.stdout.on("data", collect);
  child.stderr.on("data", collect);
  const exited = terminalExit(child);
  void exited.catch(() => undefined);
  return {
    child,
    exited,
    output: () => stripVTControlCharacters(output),
    async stop() {
      if (
        child.exitCode === null &&
        child.signalCode === null &&
        child.pid !== undefined
      ) {
        process.kill(-child.pid, "SIGTERM");
      }
      await endGroup(child);
      await exited;
    },
  };
}

function terminalExit(child: GroupLeader) {
  return new Promise<{ code: number | null; signal: NodeJS.Signals | null }>(
    (resolve, reject) => {
      child.once("error", reject);
      child.once("close", (code, signal) => {
        resolve({ code, signal });
      });
    },
  );
}
