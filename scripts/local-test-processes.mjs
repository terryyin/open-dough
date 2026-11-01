// Process identity, ancestry and retirement for local suite admission.
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";

export const tokenVariable = "DOUGH_LOCAL_SUITE_IDS";

function ps(args) {
  const result = spawnSync("ps", args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error || result.status !== 0)
    throw new Error("Could not observe local test-suite ownership with ps.");
  // The observer inherits the same marker; it is already gone when spawnSync
  // returns and must not make each cleanup sweep discover another observer.
  return result.stdout
    .split("\n")
    .filter((line) => Number(line.trim().split(/\s+/, 1)[0]) !== result.pid)
    .join("\n");
}

export function processIdentity(pid) {
  const result = spawnSync("ps", ["-p", String(pid), "-o", "stat=,lstart="], {
    encoding: "utf8",
    env: { ...process.env, LC_ALL: "C", TZ: "UTC" },
  });
  if (result.error) throw result.error;
  const match = result.stdout.trim().match(/^(\S+)\s+(.+)$/);
  return match && !/[EZ]/.test(match[1]) ? match[2] : undefined;
}

export function living(owner) {
  return processIdentity(owner.pid) === owner.started;
}

export function ancestors() {
  const parents = new Map(
    ps(["-axo", "pid=,ppid="])
      .trim()
      .split("\n")
      .map((line) => line.trim().split(/\s+/).map(Number)),
  );
  const result = new Set();
  for (let pid = process.pid; pid && !result.has(pid); pid = parents.get(pid))
    result.add(pid);
  return result;
}

function carrying(tokens) {
  if (tokens.length === 0) return [];
  const matches = (entries) =>
    entries
      .find((entry) => entry.startsWith(`${tokenVariable}=`))
      ?.slice(tokenVariable.length + 1)
      .split(",")
      .some((token) => tokens.includes(token));
  // The dashboard's existing run-process observation uses /proc on Linux;
  // macOS's ps -E spelling is not procps's environment option.
  if (process.platform === "linux") {
    return readdirSync("/proc")
      .filter((name) => /^\d+$/.test(name))
      .map(Number)
      .filter((pid) => {
        if (pid === process.pid) return false;
        try {
          if (
            !matches(readFileSync(`/proc/${pid}/environ`, "utf8").split("\0"))
          )
            return false;
          const stat = readFileSync(`/proc/${pid}/stat`, "utf8");
          return !/[ZX]/.test(
            stat.slice(stat.lastIndexOf(")") + 2, stat.lastIndexOf(")") + 3),
          );
        } catch {
          return false;
        } // Disappearing or another user's process.
      });
  }
  // Environments are inspected privately, never printed or retained. The run
  // IDs have no spaces, so the exact environment word is unambiguous.
  return ps(["-axwwE", "-o", "pid=,stat=,command="])
    .split("\n")
    .flatMap((line) => {
      const match = line.trim().match(/^(\d+)\s+(\S+)\s/);
      if (!match || /[EZ]/.test(match[2])) return [];
      const pid = Number(match[1]);
      return pid !== process.pid && matches(line.split(" ")) ? [pid] : [];
    });
}

export function signal(pid, name) {
  try {
    process.kill(pid, name);
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
}

export async function retire(tokens) {
  let pids = carrying(tokens);
  for (const pid of pids) signal(pid, "SIGTERM");
  const until = Date.now() + 5_000;
  while (pids.length > 0 && Date.now() < until) {
    await delay(50);
    pids = carrying(tokens);
  }
  for (const pid of pids) signal(pid, "SIGKILL");
  while (carrying(tokens).length > 0) await delay(50);
}
