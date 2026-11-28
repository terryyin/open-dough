// One detached request owner per API host/login. Reads share outstanding calls;
// explicit full-workflow repeats share admission turns but never their calls.
// Its highest generation fences earlier owners, and its own login must stand.
// It ends after five idle seconds (DOUGH_GITHUB_REQUEST_OWNER_IDLE_MS), or ten
// seconds without its first consumer, unless a retained rate-limit wait stands.
// Replacements restore kept admission and end or account for predecessor calls
// before asking GitHub (github-request-kept-admissions / -owned-calls).
//
// Usage: node github-request-owner.mjs <endpoint directory> <backoff base ms>
import { randomBytes } from "node:crypto";
import { lstatSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";
import { AdmittedCalls } from "./github-request-calls.mjs";
import { KeptAdmissions } from "./github-request-kept-admissions.mjs";
import {
  earlierCallsEnded,
  OwnedCalls,
} from "./github-request-owned-calls.mjs";
import {
  claimedRecord,
  EndpointBinding,
  newSocketName,
  privacyRefusal,
  standingRecord,
} from "./github-request-owner-endpoint.mjs";
import {
  greeted,
  scopeOf,
} from "./github-request-owner-endpoint-connection.mjs";
import { ownerConnections } from "./github-request-owner-connections.mjs";
import { protocol } from "./github-request-owner-wire.mjs";

const directory = process.argv[2] ?? "";
const backoffBaseMs = Number(process.argv[3]);
const idleMs = Number(process.env.DOUGH_GITHUB_REQUEST_OWNER_IDLE_MS ?? 5_000);

if (
  !(backoffBaseMs > 0) ||
  privacyRefusal(lstatSync(directory), process.getuid?.()) !== undefined
)
  process.exit(1);

const earlier = standingRecord(directory);
if (earlier?.socket !== undefined) {
  const connection = await greeted(earlier, () => undefined, lstatSync, {
    unansweredIsAbsent: true,
  });
  connection?.destroy();
  if (connection !== undefined) process.exit(0);
}

// The endpoint of the API host and login this process's own `gh` asks with
// now; undefined while it cannot be established.
const binding = new EndpointBinding();
const ownEndpoint = () => binding.directory().catch(() => undefined);
const loginLeft = async () => {
  const own = await ownEndpoint();
  return own !== undefined && own !== directory;
};
const scope = scopeOf(directory);

const token = randomBytes(32).toString("hex");
let ending = false;
const connections = ownerConnections({
  token,
  scope,
  departed: () => {
    idleSince = Date.now();
  },
  read: (fixed, signal) =>
    earlierEnded.then(() => calls.request(fixed.args, signal, fixed)),
  failed: (answer) => failedAnswers.has(answer),
  coreCooldown: async (signal) => {
    await earlierEnded;
    if (!(await loginStands()) || signal.aborted)
      return { kind: "unavailable" };
    const refusal = admissions.refusal("core", { retain: false });
    if (refusal === undefined) return { kind: "clear" };
    if (refusal.kind === "held-back") return refusal;
    return { kind: "unavailable" };
  },
});

const socketFile = newSocketName();
const socketPath = join(directory, socketFile);
const server = createServer(connections.serve);
await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(socketPath, resolve);
});

// Ends every call no later requester could reach, then this process once each
// `gh` it ran is gone or two seconds on. Its record stays: no later owner takes
// its generation. Its socket goes first: an unwelcomed consumer finds it ended.
function end() {
  if (ending) return;
  ending = true;
  rmSync(socketPath, { force: true });
  server.close();
  connections.close();
  const lastAt = Date.now() + 2_000;
  setInterval(() => {
    if (calls.running === 0 || Date.now() > lastAt) process.exit(0);
  }, 10);
}

// An owner that claimed the generation first stands instead: this one was
// never spoken to.
const generation = (earlier?.generation ?? 0) + 1;
const record = { pid: process.pid, protocol, token, socket: socketFile };
if (!claimedRecord(directory, generation, record)) {
  rmSync(socketPath, { force: true });
  process.exit(0);
}

// Every failed call's answer, so each consumer waiting on it is told so.
const failedAnswers = new WeakSet();
const admissions = new KeptAdmissions(directory, backoffBaseMs);
const loginStands = async () => stands() && (await ownEndpoint()) === directory;
const calls = new AdmittedCalls({
  admissions,
  owned: new OwnedCalls(directory, generation),
  loginStands,
  failed: (answer) => failedAnswers.add(answer),
});
// No call is asked before each `gh` an earlier owner left running is ended,
// or holds one of this owner's turns until it is gone.
const earlierEnded = earlierCallsEnded(directory, generation).then((left) => {
  for (const { resource, gone } of left) calls.occupied(resource, gone);
});
earlierEnded.catch(end);

// Whether this owner's record is still the highest: withdrawn, overtaken or
// without its directory, it stands no more. A directory that cannot be read
// just now proves none of those.
function stands() {
  try {
    return standingRecord(directory)?.generation === generation;
  } catch (error) {
    return error.code !== "ENOENT";
  }
}

// The consumer that started this owner may take this long to reach it:
// until then it is not idle. Once a consumer leaves, it is idle from then.
const firstConsumerLimitMs = 10_000;
let idleSince = Date.now() + firstConsumerLimitMs;
setInterval(
  async () => {
    const now = Date.now();
    if (!stands()) end();
    else if (calls.heldBack(now) !== undefined) idleSince = now;
    else if (await loginLeft()) end();
    else if (connections.hasConsumers()) idleSince = now;
    else if (now - idleSince >= idleMs) end();
  },
  Math.min(idleMs, 1_000),
);
for (const signal of ["SIGTERM", "SIGINT", "SIGHUP"]) process.on(signal, end);
