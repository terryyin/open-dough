// The watcher drains an actual native launch. A blank Codex conversation
// proves successful durable settlement without credentials or model input.
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, realpath, rm } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { repoRoot } from "./repositoryRoot.ts";
import { processRunning } from "./processGroup.ts";

const exec = promisify(execFile);
const codexPackage = "@openai/codex@0.167.1";

export async function startWatcherNativeCodex(fixtureEnv: NodeJS.ProcessEnv) {
  const { stdout: command } = await exec(
    "npm",
    [
      "exec",
      "--yes",
      "--prefer-offline",
      "--package",
      codexPackage,
      "--",
      "sh",
      "-c",
      "command -v codex",
    ],
    { cwd: repoRoot },
  );
  const codex = command.trim();
  if (!path.isAbsolute(codex)) throw new Error("No pinned Codex executable");

  // Unix socket paths have a small limit on macOS. Give the isolated daemon
  // a short private directory independently of the publication fixture.
  const codexHome = await realpath(await mkdtemp("/tmp/dough-codex."));
  const env = {
    ...fixtureEnv,
    CODEX_HOME: codexHome,
    XDG_RUNTIME_DIR: path.join(codexHome, "runtime"),
    PATH: [path.dirname(codex), fixtureEnv["PATH"] ?? ""].join(path.delimiter),
  };
  for (const key of [
    "OPENAI_API_KEY",
    "CODEX_API_KEY",
    "OPENAI_BASE_URL",
    "DBUS_SESSION_BUS_ADDRESS",
  ]) {
    Reflect.deleteProperty(env, key);
  }

  const daemon = (operation: "start" | "stop") =>
    exec(codex, ["app-server", "daemon", operation], { env });
  async function close() {
    try {
      await daemon("stop");
    } finally {
      await removeNativeHome(codexHome);
    }
  }
  try {
    await mkdir(env.XDG_RUNTIME_DIR, { mode: 0o700 });
    const { stdout } = await daemon("start");
    const response = JSON.parse(stdout) as { pid?: number };
    if (
      response.pid === undefined ||
      !Number.isSafeInteger(response.pid) ||
      response.pid <= 0
    ) {
      throw new Error("The isolated native daemon did not report its process");
    }
  } catch (error) {
    try {
      await close();
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        "Could not start and clean up the isolated native daemon",
        { cause: cleanupError },
      );
    }
    throw error;
  }

  return { env, close };
}

async function removeNativeHome(codexHome: string): Promise<void> {
  let updaters: number[];
  try {
    updaters = await stopOwnedUpdaters(codexHome);
  } finally {
    await rm(codexHome, { recursive: true, force: true });
  }
  if (updaters.some(processRunning))
    throw new Error("The isolated native daemon updater did not stop");
}

// The native stop command leaves its update loop running. Its executable
// under this fixture's private home identifies it even without a PID file.
async function stopOwnedUpdaters(codexHome: string): Promise<number[]> {
  const { stdout } = await exec("ps", ["-axww", "-o", "pid=,command="]);
  const updaters: number[] = [];
  for (const line of stdout.split("\n")) {
    const match = /^\s*(\d+)\s+(.+)$/.exec(line);
    const pid = Number(match?.[1]);
    const command = match?.[2];
    if (
      !Number.isSafeInteger(pid) ||
      pid <= 0 ||
      command === undefined ||
      !command.startsWith(`${codexHome}/packages/app-server-daemon/`) ||
      !command
        .trimEnd()
        .endsWith("/bin/codex app-server daemon pid-update-loop")
    )
      continue;
    try {
      process.kill(pid, "SIGKILL");
      updaters.push(pid);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
    }
  }
  return updaters;
}
