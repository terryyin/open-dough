// Run the public npm command from a fixture checkout. Observe its own output
// and exit, and signal the full npm group so the watcher receives shutdown and
// finishes it.
import { fileURLToPath } from "node:url";
import { stripVTControlCharacters } from "node:util";
import {
  endGroup,
  spawnGroupLeader,
  type GroupLeader,
} from "./processGroup.ts";
import { startOnOwnAddress } from "./serverAddress.ts";

const noFseventsPreload = fileURLToPath(
  new URL("./noFseventsPreload.cjs", import.meta.url),
);

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
    // Asks the command to shut down and waits for its own exit, however long
    // its shutdown takes: the production watcher stops its preview and removes
    // its deployment checkouts first, and a kill would leave them behind. Only
    // then is the group ended, which by now has nothing left to kill.
    async stop() {
      if (
        child.exitCode === null &&
        child.signalCode === null &&
        child.pid !== undefined
      ) {
        process.kill(-child.pid, "SIGTERM");
      }
      await exited;
      await endGroup(child);
    },
  };
}

// The public development command on any free port, with the address it
// reports having bound. Force Chokidar onto NodeFsHandler (`fs.watch`) instead
// of `fsevents`: a freshly populated temp checkout otherwise receives delayed
// macOS FSEvents creation notifications for `dashboard/server/*.ts` that
// repeatedly restart the Vite dev server mid-HMR check.
export async function developmentDashboard(
  directory: string,
  env: NodeJS.ProcessEnv,
) {
  const devEnv: NodeJS.ProcessEnv = {
    ...env,
    CHOKIDAR_USEPOLLING: "0",
    NODE_OPTIONS: [
      env["NODE_OPTIONS"],
      `--require ${JSON.stringify(noFseventsPreload)}`,
    ]
      .filter(Boolean)
      .join(" "),
  };
  const { launched, url } = await startOnOwnAddress(
    0,
    () => dashboardCommand(directory, devEnv, "dev:dashboard", ["--port", "0"]),
    "The development dashboard did not start",
  );
  return { command: launched, url };
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
