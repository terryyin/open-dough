// Disposable native feasibility observation, not installed workflow runtime.
import { spawn, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, appendFileSync, watch, renameSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";
import { createConnection } from "node:net";
import WebSocket from "ws";
import { readHostStreamText } from "../../../tests/support/native-host-stream.mjs";

const root = process.argv[2] ?? mkdtempSync(join(tmpdir(), "dough-blocked-native-"));
const recovered = process.argv[2] !== undefined;
const project = join(root, "project");
mkdirSync(project, { recursive: true });
execFileSync("git", ["init", "--quiet", project]);
const log = (event) => {
  appendFileSync(join(root, "controller.jsonl"), `${JSON.stringify({ at: new Date().toISOString(), ...event })}\n`);
  console.log(JSON.stringify(event));
};
const save = (name, value) => writeFileSync(join(root, name), `${JSON.stringify(value, null, 2)}\n`);
const digest = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const pending = { supplier: "tax-rules", status: "paused", checked: false };
const ready = { supplier: "tax-rules", status: "ready", checked: true, taxRate: 0.08, evidence: "synthetic approved tax rule R8" };
writeFileSync(join(project, "consumer-work.json"), '{"owner":"invoice-consumer","subtotal":125,"currency":"SGD"}\n');
writeFileSync(join(project, "supplier-evidence.json"), `${JSON.stringify(pending)}\n`);
writeFileSync(join(project, "verify-local.mjs"), 'import assert from "node:assert/strict"; import fs from "node:fs"; const work=JSON.parse(fs.readFileSync("consumer-work.json")); assert.equal(work.subtotal,125); assert.equal(work.currency,"SGD");\n');
execFileSync("node", ["verify-local.mjs"], { cwd: project });
const initialHashes = Object.fromEntries(["consumer-work.json", "verify-local.mjs"].map((name) => [name, digest(join(project, name))]));
save("accepted-local-proof.json", { command: "node verify-local.mjs", result: "pass", files: initialHashes });

const prompt = "Finish this consumer's invoice report in this directory. Use the subtotal and currency in consumer-work.json and the tax rate from supplier-evidence.json. The tax evidence is usable only when its status is ready and checked is true. Put the subtotal, tax amount, total and currency in final-report.json, with the supplier evidence reference. The existing verify-local.mjs checks the accepted local subtotal. If the report cannot yet be completed, preserve the current work and explain the exact missing evidence for continuation of this assignment. Work only in this disposable directory; do not commit or publish.";
save("initial-input.json", { text: prompt });
let submissions = recovered ? 1 : 0;
let threadId = recovered ? JSON.parse(readFileSync(join(root, "result.json"))).threadId : undefined;
if (recovered) save("prior-diagnostic-result.json", JSON.parse(readFileSync(join(root, "result.json"))));
function native(args, name) {
  submissions++;
  log({ type: "native-submission", number: submissions, args, cwd: project });
  const child = spawn("codex", args, { cwd: project, stdio: ["ignore", "pipe", "pipe"] });
  log({ type: "native-process", name, pid: child.pid });
  let out = "";
  let err = "";
  child.stdout.on("data", (chunk) => { out += chunk; appendFileSync(join(root, `${name}-events.jsonl`), chunk); });
  child.stderr.on("data", (chunk) => { err += chunk; appendFileSync(join(root, `${name}-stderr.txt`), chunk); });
  return once(child, "exit").then(([code, signal]) => {
    const parsed = readHostStreamText("codex", out);
    save(`${name}-reader.json`, parsed);
    const events = out.split("\n").filter(Boolean).map((line) => JSON.parse(line));
    const id = events.find((entry) => entry.type === "thread.started")?.thread_id;
    log({ type: "native-terminal", name, code, signal, status: parsed.status, threadId: id });
    if (code !== 0 || parsed.status !== "complete") throw new Error(`${name} did not complete: ${err.slice(-500)}`);
    if (threadId && id !== threadId) throw new Error("Native continuation changed thread identity");
    threadId = id;
    return parsed;
  });
}

async function snapshot(name) {
  const daemon = JSON.parse(execFileSync("codex", ["app-server", "daemon", "version"], { encoding: "utf8" }));
  const socket = new WebSocket("ws://localhost/", { createConnection: () => createConnection({ path: daemon.socketPath }) });
  let next = 0;
  const requests = new Map();
  socket.on("message", (data) => {
    const message = JSON.parse(data.toString("utf8"));
    if (message.id === undefined) return;
    const pendingRequest = requests.get(message.id);
    requests.delete(message.id);
    if (message.error) pendingRequest?.reject(new Error(JSON.stringify(message.error)));
    else pendingRequest?.resolve(message.result);
  });
  const request = (method, params) => new Promise((resolve, reject) => {
    const id = ++next;
    requests.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  socket.once("close", () => { for (const value of requests.values()) value.reject(new Error("Native metadata connection ended")); });
  try {
    await once(socket, "open");
    await request("initialize", { clientInfo: { name: "open_dough_blocked_probe", version: "1" }, capabilities: { experimentalApi: true } });
    socket.send('{"method":"initialized"}');
    const resumed = await request("thread/resume", { threadId });
    const history = await request("thread/read", { threadId, includeTurns: true });
    save(`${name}-native.json`, { resumed, history });
    const settings = Object.fromEntries(["cwd", "model", "modelProvider", "approvalPolicy", "approvalsReviewer", "sandbox", "activePermissionProfile", "reasoningEffort", "runtimeWorkspaceRoots", "serviceTier"].map((key) => [key, resumed[key]]));
    save(`${name}-settings.json`, settings);
    return { settings, turns: history.thread.turns };
  } finally {
    const closed = once(socket, "close");
    socket.close();
    await closed;
  }
}

let watcher;
try {
  log({ type: "probe-start", root, project, cliVersion: execFileSync("codex", ["--version"], { encoding: "utf8" }).trim() });
  const held = recovered ? readHostStreamText("codex", readFileSync(join(root, "held-events.jsonl"), "utf8")) : await native(["exec", "--json", "-C", project, prompt], "held");
  if (!threadId || existsSync(join(project, "final-report.json"))) throw new Error("The initial task did not reach the required held boundary");
  for (const [name, hash] of Object.entries(initialHashes)) if (digest(join(project, name)) !== hash) throw new Error(`Held work changed: ${name}`);
  const before = await snapshot("held");
  log({ type: "held-confirmed", threadId, response: held.response, turns: before.turns.map((turn) => ({ id: turn.id, status: turn.status })) });
  let handled = false;
  let continuation;
  let observation;
  let resolveObservation;
  const observe = () => {
    const evidence = JSON.parse(readFileSync(join(project, "supplier-evidence.json"), "utf8"));
    const qualified = evidence.status === "ready" && evidence.checked === true;
    log({ type: "supplier-observed", evidence, handled, qualified, submissions });
    if (qualified && !handled) {
      handled = true;
      const text = "New supplier evidence is available in supplier-evidence.json. Reassess the condition retained by this assignment and continue its authorized work if the evidence is sufficient.";
      save("continuation-input.json", { text, threadId });
      continuation = native(["exec", "resume", "--json", threadId, text], "resumed");
    }
    observation = evidence;
    resolveObservation?.();
    resolveObservation = undefined;
  };
  watcher = watch(project, (_, name) => { if (name === "supplier-evidence.json") observe(); });
  observe();
  const signal = async (evidence, label) => {
    const observed = new Promise((resolve) => { resolveObservation = resolve; });
    writeFileSync(join(project, "supplier-next.json"), `${JSON.stringify(evidence)}\n`);
    renameSync(join(project, "supplier-next.json"), join(project, "supplier-evidence.json"));
    await observed;
    if (JSON.stringify(observation) !== JSON.stringify(evidence)) throw new Error("Watcher did not observe the driven evidence");
    log({ type: "signal-settled", label, submissions });
  };
  await signal(pending, "unchanged");
  if (submissions !== 1) throw new Error("Unchanged evidence submitted a model turn");
  await signal(ready, "qualifying");
  await continuation;
  await signal(ready, "replay");
  watcher.close(); watcher = undefined;
  const after = await snapshot("resumed");
  if (JSON.stringify(before.settings) !== JSON.stringify(after.settings)) throw new Error("Native settings changed during continuation");
  if (submissions !== 2 || after.turns.length !== before.turns.length + 1) throw new Error("Expected exactly one accepted continuation");
  const report = JSON.parse(readFileSync(join(project, "final-report.json"), "utf8"));
  if (report.subtotal !== 125 || report.total !== 135 || report.currency !== "SGD") throw new Error("Native result did not satisfy the invoice task");
  for (const [name, hash] of Object.entries(initialHashes)) if (digest(join(project, name)) !== hash) throw new Error(`Resumed work changed: ${name}`);
  const result = { result: "pass", root, project, threadId, submissions, heldTurns: before.turns.map((t) => t.id), resumedTurns: after.turns.map((t) => t.id), settings: after.settings, report, idleSubmissions: 0, developerTypedResume: false };
  save("result.json", result);
  log({ type: "probe-complete", ...result });
} catch (error) {
  save("result.json", { result: "incomplete", root, project, threadId, submissions, error: String(error) });
  log({ type: "probe-incomplete", root, threadId, submissions, error: String(error) });
  process.exitCode = 1;
} finally { watcher?.close(); }
