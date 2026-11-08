// Focused proof: endGroup SIGKILLs leftover group members after the leader
// exits on SIGTERM, so fixture teardown cannot hang on orphans.
import {
  endGroup,
  processAlive,
  processRunning,
  spawnGroupLeader,
} from "./processGroup.ts";

const leader = spawnGroupLeader(
  process.execPath,
  [
    "-e",
    `
const { spawn } = require("child_process");
const child = spawn(
  process.execPath,
  ["-e", "process.stdin.resume(); setInterval(() => {}, 1000)"],
  { stdio: "ignore" },
);
process.stdout.write("child=" + child.pid + "\\n");
process.on("SIGTERM", () => process.exit(0));
setInterval(() => {}, 1000);
`,
  ],
  {},
);

const childPid = await new Promise((resolve, reject) => {
  const timer = setTimeout(
    () => reject(new Error("leader never reported its child")),
    5_000,
  );
  leader.stdout.on("data", (chunk) => {
    const match = /child=(\d+)/.exec(String(chunk));
    if (match) {
      clearTimeout(timer);
      resolve(Number(match[1]));
    }
  });
});

const started = Date.now();
await endGroup(leader);
const waitedMs = Date.now() - started;
const result = {
  waitedMs,
  childRunning: processRunning(childPid),
  groupAlive: processAlive(-(leader.pid ?? 0)),
};
console.log(JSON.stringify(result));
if (waitedMs > 1_000) {
  throw new Error(`endGroup took ${String(waitedMs)}ms; expected under 1s`);
}
if (result.childRunning || result.groupAlive) {
  throw new Error(`orphan still present: ${JSON.stringify(result)}`);
}
