// Focused proof: endFakeGh ends a held synthetic `gh` that outlived its
// request owner — the processAlive race authenticated-read-turns hit in CI.
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { endFakeGh, installFakeGh } from "./fakeGh.ts";
import { processRunning, readPid } from "./processGroup.ts";

const tempRoot = mkdtempSync(path.join(tmpdir(), "dough-end-fake-gh-"));
const gh = installFakeGh(tempRoot);
const endpoint = path.join(gh.requestOwnerRoot, "host");
mkdirSync(endpoint, { recursive: true });

// A held fake-gh-shaped process recorded the way an owner leaves one.
const child = spawn(
  process.execPath,
  ["-e", "process.stdin.resume(); setInterval(() => {}, 1000)"],
  { stdio: "ignore", env: { ...process.env, FAKE_GH_PIDFILE: gh.pidPath } },
);
if (child.pid === undefined) throw new Error("held gh did not start");
writeFileSync(gh.pidPath, String(child.pid));
writeFileSync(
  path.join(endpoint, `call.1.${String(child.pid)}.json`),
  JSON.stringify({
    pid: child.pid,
    args: ["api"],
    resource: "content",
    startedAtMs: Date.now(),
  }),
);
// Already-gone owner pid: endRequestOwners only waits for the owner, then
// endFakeGh must still finish the leftover `gh` that owner abandoned.
writeFileSync(
  path.join(endpoint, "owner.1.json"),
  JSON.stringify({
    pid: 2_147_483_647,
    protocol: 1,
    token: "x".repeat(64),
    socket: "unused.sock",
    generation: 1,
  }),
);

if (!processRunning(child.pid)) {
  throw new Error("held process was not running before endFakeGh");
}
const pid = readPid(gh.pidPath);
await endFakeGh(gh);
if (processRunning(pid)) {
  throw new Error(`held gh ${String(pid)} still running after endFakeGh`);
}
console.log(JSON.stringify({ endedPid: pid, stillRunning: false }));
